// Global Array that holds character sprites.
// The first index of the array is the mage, second being ranger, and third being knight.
// Each index contains a JSON object which has the left and right faces for the sprites.
// and the x and y offset to get bounds for room correct.
var myPlayer;
const EntityTypes = {
    menu: 0,
    non_interactables: 1,
    traps: 2,
    projectiles: 3,
    enemies: 4,
    player: 5
}

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
    //menu, non-interactable (terrain),traps, projectiles, enemies, player
    this.entities = [[], [], [], [], [], []];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.keyA = false;
    this.keyS = false;
    this.keyD = false;
    this.keyW = false;
    this.keyUp = false;
    this.keyLeft = false;
    this.keyRight = false;
    this.keyDown = false;
    this.digit = [false, false, false, false, false, false, false, false, false, false];
    this.shoot = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.keyShift = false;
    this.movement = false;
    this.debug = false;
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
  
    this.ctx.canvas.addEventListener("mousedown", function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        if (SCENE_MANAGER.insideMenu) {
            SCENE_MANAGER.menuSelection(x, y);
        } else if (myPlayer.dead) {
            SCENE_MANAGER.playAgain(x, y);
        }
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouseX = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        that.mouseY = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
    }, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {
        e.preventDefault();
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

        if (e.code === "ArrowUp") {
            that.shoot = true;
            that.keyUp = true;
            // Projectile
            var projectile = new Projectile(AM.getAsset("./img/fireball.png"),
                myPlayer.x + 4,
                myPlayer.y - (myPlayer.height / 2), myPlayer.x  + (myPlayer.width / 2) + 8, myPlayer.y, 5);
            GAME_ENGINE.addEntity(projectile);
        } else if (e.code === "ArrowLeft") {
            that.shoot = true;
            that.keyLeft = true;
            // Projectile
            var projectile = new Projectile(AM.getAsset("./img/fireball.png"),
                myPlayer.x + 4,
                myPlayer.y - (myPlayer.height / 2), myPlayer.x  - 4,
                myPlayer.y - (myPlayer.height / 2), 5);
            GAME_ENGINE.addEntity(projectile);
        } else if (e.code === "ArrowRight") {
            that.shoot = true;
            that.keyRight = true;
            // Projectile
            var projectile = new Projectile(AM.getAsset("./img/fireball.png"),
                myPlayer.x + 4,
                myPlayer.y - (myPlayer.height / 2), myPlayer.x  + myPlayer.width + 4,
                myPlayer.y - (myPlayer.height / 2), 5);
            GAME_ENGINE.addEntity(projectile);
        } else if (e.code === "ArrowDown") {
            that.shoot = true;
            that.keyDown = true;
            // Projectile
            var projectile = new Projectile(AM.getAsset("./img/fireball.png"),
                myPlayer.x + 4,
                myPlayer.y - (myPlayer.height / 2), myPlayer.x  + 4, myPlayer.y + myPlayer.height + 4, 5);
            GAME_ENGINE.addEntity(projectile);
        }

        //Abilities
        if (e.code.includes("Digit")) {
            that.digit[parseInt(e.code.charAt(5))] = true;
        }

        if (e.code === "KeyU") {
            if (that.debug === false) {
                that.debug = true;
            } else {
                that.debug = false;
            }
        }

    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {


        if (e.code === "KeyW") {
            that.keyW = false;
        } else if (e.code === "KeyA") {
            that.keyA = false;
        } else if (e.code === "KeyS") {
            that.keyS = false;
        } else if (e.code === "KeyD") {
            that.keyD = false;
        }

        if (e.code === "ArrowUp") {
            that.shoot = false;
            that.keyUp = false;
        } else if (e.code === "ArrowLeft") {
            that.shoot = false;
            that.keyLeft = false;
        } else if (e.code === "ArrowRight") {
            that.shoot = false;
            that.keyRight = false;
        } else if (e.code === "ArrowDown") {
            that.shoot = false;
            that.keyDown = false;
        }

        //Abilities
        if (e.code.includes("Digit")) {
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
        for (let j = this.entities[i].length - 1; j >= 0; j--) {
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
    CAMERA = new Camera();
    myPlayer.dead = false;
    document.getElementById("hud").style.display = "none";
    document.getElementById("health").innerHTML = myPlayer.maxHealth;
    document.getElementById("healthImg").src = "./img/health_wireframe/green_health.png";
    for (let t = 1; t < 4; t++) {
        var spellHTML = document.getElementById("spell" + t);
        spellHTML.innerHTML = "Ready";
        spellHTML.style.color = color_green;
    }
    for (let x = 0; x < 25; x++) {
        document.getElementById("room" + x).style.backgroundColor = "black";
    }
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

GameEngine.prototype.removeEntity = function (entity) {
    let idx;
    if (entity instanceof Player) {
        idx = this.entities[5].indexOf(entity);
        if (idx > -1) {
            this.entities[5].splice(idx, 1);
        }
    } else if (entity instanceof Monster) {
        idx = this.entities[4].indexOf(entity);
        if (idx > -1) {
            this.entities[4].splice(idx, 1);
        }
    } else if (entity instanceof Projectile) {
        idx = this.entities[3].indexOf(entity);
        if (idx > -1) {
            this.entities[3].splice(idx, 1);
        }
    } else if (entity instanceof Trap) {
        idx = his.entities[2].indexOf(entity);
        if (idx > -1) {
            this.entities[2].splice(idx, 1);
        }
    } else if (entity instanceof Menu) {
        idx = this.entities[0].indexOf(entity);
        if (idx > -1) {
            this.entities[0].splice(idx, 1);
        }
    } else {
        idx = this.entities[1].indexOf(entity);
        if (idx > -1) {
            this.entities[1].splice(idx, 1);
        }
    }
};

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    for (let i = 0; i < this.entities.length; i++) {
        for (let j = 0; j < this.entities[i].length; j++) {
            var entity = this.entities[i][j];

            if (!entity.removeFromWorld && (entity instanceof Menu || entity instanceof Background
                || (entity.x >= CAMERA.x && entity.x <= CAMERA.x + canvasWidth &&

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
            if (!entity.removeFromWorld && (entity instanceof Menu || entity instanceof Background
                || (entity.x >= CAMERA.x && entity.x <= CAMERA.x + canvasWidth &&
                    entity.y >= CAMERA.y && entity.y <= CAMERA.y + canvasHeight))) {
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
        this.game.ctx.strokeStyle = color_green;
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}