// Global Array that holds character sprites.
// The first index of the array is the mage, second being ranger, and third being knight.
// Each index contains a JSON object which has the left and right faces for the sprites.
// and the x and y offset to get bounds for room correct.
var characterSprites = [{ spritesheet: "./img/mage_run.png", xOffset: 0, yOffset: 9 },
{ spritesheet: "./img/ranger_run.png", xOffset: 0, yOffset: 8 },
{ spritesheet: "./img/knight_run.png", xOffset: 0, yOffset: 6 }];
var myPlayer;

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function GameEngine() {
    //menu, non-interactable (terrain, hud),traps, projectiles, enemies, player
    this.entities = [[], [], [], [], [], []];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.keyA = false;
    this.keyS = false;
    this.keyD = false;
    this.keyW = false;
    this.digit = [false,false,false,false,false,false,false,false,false,false];
    this.keyShift = false;
    this.movement = false;
    this.playerPick;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();
    this.startInput();
}

GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (x < 1024) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return { x: x, y: y };
    }

    var that = this;
    // event listeners are added here

    this.ctx.canvas.addEventListener("click", function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        if (SCENE_MANAGER.insideMenu) {
            SCENE_MANAGER.menuSelection(x, y);
        } else {
            if (that.playerPick == 0) {
                // Projectile
                var projectile = new Projectile(GAME_ENGINE, AM.getAsset("./img/fireball.png"),
                    myPlayer.x - (myPlayer.width / 2), myPlayer.y - (myPlayer.height / 2), x, y);
                GAME_ENGINE.addEntity(projectile);
            }
        }
    }, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {
        // Sprint functionality
        if (e.code === "ShiftLeft") {
            that.keyShift = true;
        }
        


        if (e.code === "KeyW") {
            that.keyW = true;
            that.movement = true;
        } else if (e.code === "KeyA") {
            that.keyA = true;
            that.movement = true;
        } else if (e.code === "KeyS") {
            that.keyS = true;
            that.movement = true;
        } else if (e.code === "KeyD") {
            that.keyD = true;
            that.movement = true;
        }
        //Abilities
        if (e.code.includes("Digit")){
            that.digit[parseInt(e.code.charAt(5))] = true;
        }
        
        /* #endregion */

    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        // Stop sprinting if left shift is released
        if (e.code === "ShiftLeft") {
            that.keyShift = false;
        }

        if (e.code === "KeyW") {
            that.keyW = false;
        } else if (e.code === "KeyA") {
            that.keyA = false;
        } else if (e.code === "KeyS") {
            that.keyS = false;
        } else if (e.code === "KeyD") {
            that.keyD = false;
        }
        //Abilities
        if (e.code.includes("Digit")){
            that.digit[parseInt(e.code.charAt(5))] = false;
        }
        /*if key is still being pressed down when another key is pressed up
          then movement is still happening. */
        if (!that.keyW && !that.keyA && !that.keyS && !that.keyD) {
            that.movement = false;
        }
    }, false);
}

GameEngine.prototype.reset = function () {
    for (let i = 1; i < this.entities.length; i++) {
        var entitySubArr = this.entities[i];
        for (let j = 0; j < entitySubArr.length; j++) {
            var entity = this.entities[i][j];
            entity.removeFromWorld = true;
            this.entities[i].pop();
        }
    }
    //menu is no longer removed from world
    this.entities[0][0].removeFromWorld = false;
    SCENE_MANAGER.menu = this.entities[0][0];
    SCENE_MANAGER.insideMenu = true;
    this.playerPick = -1;
}

GameEngine.prototype.addEntity = function (entity) {
    if (entity instanceof Player) {
        this.entities[5].push(entity);
    } else if (entity instanceof Monster) {
        this.entities[4].push(entity);
    } else if (entity instanceof Projectile) {
        this.entities[3].push(entity);
    } else if (entity instanceof Trap) {
        this.entities[2].push(entity);
    } else if (entity instanceof Menu) {
        this.entities[0].push(entity);
    } else {
        this.entities[1].push(entity);
    }
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    for (let i = 0; i < this.entities.length; i++) {
        var entitySubArr = this.entities[i];
        for (let j = 0; j < entitySubArr.length; j++) {
            var entity = this.entities[i][j];
            if (!entity.removeFromWorld && (i <= 1 || (entity.x >= CAMERA.x && entity.x <= CAMERA.x + canvasWidth &&
                entity.y >= CAMERA.y && entity.y <= CAMERA.y + canvasHeight))) {
                entity.draw(this.ctx);
            }
        }
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {

    for (let i = 0; i < this.entities.length; i++) {
        for (let j = 0; j < this.entities[i].length; j++) {
            var entity = this.entities[i][j];
            if (!entity.removeFromWorld) {
                entity.update();
            }
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () { }

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}