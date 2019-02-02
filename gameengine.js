// Global Array that holds character sprites.
// The first index of the array is the mage, second being ranger, and third being knight.
// Each index contains a JSON object which has the left and right faces for the sprites.
// and the x and y offset to get bounds for room correct.
var characterSprites = [{leftFace: "./img/mage_run_flipped.png", rightFace: "./img/mage_run.png", xOffset: 0,
                        yOffset: 9},
                        {leftFace: "./img/ranger_run_flipped.png", rightFace: "./img/ranger_run.png", xOffset: 0,
                        yOffset: 8},
                        {leftFace: "./img/knight_run_flipped.png", rightFace: "./img/knight_run.png", xOffset: 0,
                        yOffset: 6}];

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
    //menu, non-interactable (terrain, hud), enemies, projectiles, traps, player
    // this.entities = [[], [], [], [], [], []];
    this.entities = [];
    this.entitiesCount = 0;

    // Arrays necessary to check for collision. Made multiple because
    // of the need to check them against each other.
    // Array to hold player entities
    this.playerEntities = [];
    // // Array to hold trap entities
    this.trapEntities = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.keyA = false;
    this.keyS = false;
    this.keyD = false;
    this.keyW = false;
    this.keyShift = false;
    this.movement = false;
    this.insideMenu = true;
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
    var playerPick = null;
    this.ctx.canvas.addEventListener("click", function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        if (that.insideMenu) {
            var menu = that.entities[0];
            var classPicked = false;
            if (y >= menu.classButtonY &&
                 y <= menu.classButtonBottom) {
                if(x >= menu.mageButtonX &&
                     x <= menu.mageButtonX + menu.classButtonW) {
                    classPicked = true;
                    playerPick = 0;
                }  else if (x >= menu.rangerButtonX &&
                    x <= menu.rangerButtonX + menu.classButtonW) {
                    classPicked = true;
                    playerPick = 1;
                } else if (x >= menu.knightButtonX &&
                    x <= menu.knightButtonX + menu.classButtonW) {
                    classPicked = true;
                    playerPick = 2;
                }
            }
            if (classPicked) {
                that.insideMenu = false;
                menu.removeFromWorld = true;
                classPicked = false;
                that.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);

                GAME_ENGINE.addEntity(new Background(GAME_ENGINE));
                
                // Using players choice to grab the appropriate character sprite

                myPlayer = new Player(GAME_ENGINE, AM.getAsset(characterSprites[playerPick]["leftFace"]),
                AM.getAsset(characterSprites[playerPick]["rightFace"]), characterSprites[playerPick]["xOffset"],
                characterSprites[playerPick]["yOffset"]);
                GAME_ENGINE.addEntity(myPlayer);
                GAME_ENGINE.addPlayerEntity(myPlayer);


                GAME_ENGINE.addEntity(new Monster(GAME_ENGINE, AM.getAsset("./img/NPC_21.png")));


                // This is to add entityCheck to an array that will be tested for collision.
                var trap = new Trap(GAME_ENGINE, AM.getAsset("./img/floor_trap_up.png"),
                AM.getAsset("./img/floor_trap_down.png"));
                GAME_ENGINE.addEntity(trap);
                GAME_ENGINE.addTrapEntity(trap);

                var hud = new HUD(GAME_ENGINE);
                GAME_ENGINE.addEntity(hud);
                var sidebar = new Sidebar(GAME_ENGINE);
                GAME_ENGINE.addEntity(sidebar);
                hudHeight = hud.height;
                sidebarWidth = sidebar.width;
                gameWorldHeight = canvasHeight - hud.height;
            }
        }

        else if (!that.insideMenu && playerPick == 0) {
            var projAsset = null;
            if (x < myPlayer.x && y < myPlayer.y) {
                projAsset = "./img/fireball/fireballleftup.png";
            } else if (x > myPlayer.x && x < myPlayer.x + 16 && y < myPlayer.y + 14) {
                projAsset = "./img/fireball/fireballup.png";
            } else if (x > myPlayer.x && x < myPlayer.x + 16 && y > myPlayer.y + 14) {
                projAsset = "./img/fireball/fireballdown.png";
            } else if (x < myPlayer.x + 8 && y > myPlayer.y + 28) {
                projAsset = "./img/fireball/fireballdownleft.png";
            } else if (x > myPlayer.x && y > myPlayer.y && y < myPlayer.y + 28) { 
                projAsset = "./img/fireball/fireballright.png";
            } else if (x > myPlayer.x && y > myPlayer.y + 28) {
                projAsset = "./img/fireball/fireballdownright.png";
            } else if (x > myPlayer.x && y < myPlayer.y) {
            projAsset = "./img/fireball/fireballrightup.png";
            } else {
            projAsset = "./img/fireball/fireballleft.png";
}
            GAME_ENGINE.addEntity(new Projectile(GAME_ENGINE, AM.getAsset(projAsset), myPlayer.x, myPlayer.y, x, y));
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
        /*if key is still being pressed down when another key is pressed up
          then movement is still happening. */
        if (!that.keyW && !that.keyA && !that.keyS && !that.keyD) {
            that.movement = false;
        }
    }, false);
}

GameEngine.prototype.reset = function () {
    this.entitiesCount = 0;
    for (let i = this.entities.length - 1; i > 0; i--) {
        this.entities[i].removeFromWorld = true;
        this.entities.pop();
    }

    // Popping playerEntities to remove duplicates.
    for (let i = 0; i < this.playerEntities.length; i++) {
        this.playerEntities.pop();
    }

    // Popping trapEntities to remove duplicates.
    for (let i = 0; i < this.trapEntities.length; i++) {
        this.trapEntities.pop();
    }

    this.entitiesCount++;
    this.insideMenu = true;
    //menu is no longer removed from world
    this.entities[0].removeFromWorld = false;
}

// Necessary to let main.js access some information. In this case entities to
// check for collision.
GameEngine.prototype.addPlayerEntity = function (entity) {
    this.playerEntities.push(entity);
}

GameEngine.prototype.addTrapEntity = function (entity) {
    this.trapEntities.push(entity);
}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
    this.entitiesCount++;
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    for (var i = 0; i < this.entitiesCount; i++) {
        var entity = this.entities[i];
        if (!entity.removeFromWorld) {
            entity.draw(this.ctx);
        }
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {

    for (var i = 0; i < this.entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
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

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}