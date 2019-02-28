// Global Array that holds character sprites.
// The first index of the array is the mage, second being ranger, and third being knight.
// Each index contains a JSON object which has the left and right faces for the sprites.
// and the x and y offset to get bounds for room correct.
var characterSprites = [{ spritesheet: "./img/terran/marine/marine_move_right.png", xOffset: 0, yOffset: 9 },
{ spritesheet: "./img/terran/marine/marine_move_right.png", xOffset: 0, yOffset: 8 },
{ spritesheet: "./img/terran/marine/marine_move_right.png", xOffset: 0, yOffset: 6 }];
var myPlayer;
const EntityTypes = {
    menu:0,
    non_interactables:1,
    traps:2,
    projectiles:3,
    enemies:4,
    player:5
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
    this.digit = [false,false,false,false,false,false,false,false,false,false];
    this.mouseX = 0;
    this.mouseY = 0;
    this.keyShift = false;
    this.movement = false;
    this.playerPick;
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
    // event listeners are added here

    this.ctx.canvas.addEventListener("click", function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        if (SCENE_MANAGER.insideMenu) {
            SCENE_MANAGER.menuSelection(x, y);
        } else {
            if (!myPlayer.isDead) {
                if (that.playerPick == 0) {
                    // Projectile
                    var projectile = new Projectile(AM.getAsset("./img/fireball.png"),
                        myPlayer.x - (myPlayer.width / 2),
                         myPlayer.y - (myPlayer.height / 2), x, y, 5);
                    GAME_ENGINE.addEntity(projectile);
                } else if (that.playerPick == 1) {
                let angle = Math.atan2(y - 20 - myPlayer.y - (myPlayer.height / 2)
                , x - 35 - myPlayer.x - (myPlayer.width / 2));
    
                let sprite;
                if (angle > -Math.PI / 8 && angle < Math.PI / 8) {
                    //R
                    sprite = "./img/ability/arrow_r_8x8.png";
                } else if (angle > Math.PI/8 && angle < 3*Math.PI/8) {
                    //DR
                    sprite = "./img/ability/arrow_dr_8x8.png";
                } else if (angle > 3*Math.PI/8 && angle < 5*Math.PI/8) {
                    //D
                    sprite = "./img/ability/arrow_d_8x8.png";
                } else if (angle > 5*Math.PI/8 && angle < 7*Math.PI/8) {
                    //DL
                    sprite = "./img/ability/arrow_dl_8x8.png";
                } else if (angle < -7*Math.PI/8 || angle > 7*Math.PI/8) {
                    //L
                    sprite = "./img/ability/arrow_l_8x8.png";
                } else if (angle > -7*Math.PI/8 && angle < -5*Math.PI/8) {
                    //UL
                    sprite = "./img/ability/arrow_ul_8x8.png";
                } else if (angle > -5*Math.PI/8 && angle < -3*Math.PI/8) {
                    //U
                    sprite = "./img/ability/arrow_u_8x8.png";
                } else if (angle > -3*Math.PI/8 && angle < -Math.PI/8) {
                    //UR
                    sprite = "./img/ability/arrow_ur_8x8.png";
                }
                let ani = new Animation(AM.getAsset(sprite), 8,8,1,0.13,1,true,2);
                let projectile = new Projectile(AM.getAsset(sprite),
                        myPlayer.x - (myPlayer.width / 2),
                         myPlayer.y - (myPlayer.height / 2), x, y, 5);
                projectile.animation = ani;
                projectile.aniX = 15;
                projectile.aniY = 30;
                GAME_ENGINE.addEntity(projectile);
                } else if (that.playerPick == 2){
                    let angle = Math.atan2(y - 20 - myPlayer.y - (myPlayer.height / 2) + CAMERA.y
                        , x - 35 - myPlayer.x - (myPlayer.width / 2) + CAMERA.x);
                    let offsetX = 0;
                    let offsetY = 0;
                    let sprite = "./img/ability/knight_attack_right";
                    if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
                        //Right
                        sprite = "./img/ability/knight_attack_right";
                        offsetX = 15;
                    } else if (angle > -3 * Math.PI / 4 && angle < -Math.PI / 4) {
                        //Up
                        sprite = "./img/ability/knight_attack_up";
                        offsetY = -20;
                    } else if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) {
                        //Left
                        sprite = "./img/ability/knight_attack_left";
                        offsetX = -15;
                    } else {
                        //Down
                        sprite = "./img/ability/knight_attack_down";
                        offsetY = 10;
                    }
                    let ss1Ani = new Animation(AM.getAsset(sprite + ".png"),32,32,1,0.08,6,false,2);
                    let ss1 = new StillStand(ss1Ani,15
                        , myPlayer.x + myPlayer.width/2 + offsetX
                        , myPlayer.y + myPlayer.height/2 + offsetY + 15);
                    ss1.target = myPlayer;
                    ss1.boundingbox = new BoundingBox(myPlayer.x + myPlayer.width/2 + offsetX - myPlayer.width
                        , myPlayer.y + myPlayer.height/2 + offsetY - myPlayer.height, 40, 40);
                    ss1.aniX = -25;
                    ss1.aniY = -28;
                    ss1.damageObj = DS.CreateDamageObject(15,0,DTypes.Normal);
                    ss1.entityHitType = EntityTypes.enemies;
                    ss1.penetrative = true;
                    ss1.onUpdate = function () {
                        ss1.x = ss1.target.x + ss1.target.width/2 + offsetX - 7;
                        ss1.y = ss1.target.y + ss1.target.height/2 + offsetY + 15;
                        ss1.boundingbox = new BoundingBox(ss1.x + ss1.target.width/2 + offsetX - ss1.target.width
                            , ss1.y + ss1.target.height/2 + offsetY - ss1.target.height, 40, 40);
                        
                    }
                    ss1.onDraw = function () {
                        if (GAME_ENGINE.debug){
                            GAME_ENGINE.ctx.strokeStyle = color_green; 
                            GAME_ENGINE.ctx.strokeRect(ss1.boundingbox.x,ss1.boundingbox.y
                                ,ss1.boundingbox.width,ss1.boundingbox.height);
                        }
                    }
                    GAME_ENGINE.addEntity(ss1);
                }
            }
        }
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouseX = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        that.mouseY = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
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

        if (e.code === "KeyU") {
           if (that.debug === false) {
            that.debug = true;
           } else {
            that.debug = false;
           }
        }
        //Abilities
        if (e.code.includes("Digit")){
            that.digit[parseInt(e.code.charAt(5))] = true;
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

    //reset html text
    var healthHTML = document.getElementById("health");
    healthHTML.innerHTML = "";
    healthHTML.style.color = color_green;
    for (let x = 1; x < 4; x++) {
        var spellHTML = document.getElementById("spell" + x);
        spellHTML.innerHTML = "Ready";
        spellHTML.style.color = color_green;
    }
    CAMERA = new Camera();
    myPlayer.isDead = false;
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
            if (!entity.removeFromWorld && (i <= 1 || (entity.x >= CAMERA.x && entity.x <= CAMERA.x + canvasWidth &&
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