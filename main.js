//color constants
const color_red = "red";
const color_yellow = "yellow";
const color_white = "white";
const color_green = "lightgreen";

/* #region Constants */
const AM = new AssetManager();
const GAME_ENGINE = new GameEngine();
var CAMERA = new Camera();
const DS = new DamageSystem();

var AUDIO;
var BACKGROUND;
var SCENE_MANAGER;
var canvasWidth;
var canvasHeight;

// Constant variable for tile size
const TILE_SIZE = 16;
/* #endregion */

/* #region Player */
function Player(runSheets, shootSheets, deathSheet, xOffset, yOffset) {
    console.log(runSheets);
    // Relevant for Player box
    this.width = 32;
    this.height = 32;
    this.scale = 1.5;
    this.xOffset = xOffset * this.scale;
    this.yOffset = yOffset * this.scale;
    this.animationRunSide = new Animation(runSheets["side"], this.width, this.height, 1, 0.04, 9, true, this.scale);
    this.animationRunUp = new Animation(runSheets["up"], this.width, this.height, 1, 0.04, 9, true, this.scale);
    this.animationRunDown = new Animation(runSheets["down"], this.width, this.height, 1, 0.04, 9, true, this.scale);
    this.animationShootSide = new Animation(shootSheets["side"], this.width, this.height, 1, 0.04, 2, true, this.scale);
    this.animationShootUp = new Animation(shootSheets["up"], this.width , this.height, 1, 0.04, 2, true, this.scale);
    this.animationShootDown = new Animation(shootSheets["down"], this.width, this.height, 1, 0.04, 2, true, this.scale);
    this.animationDeath = new Animation(deathSheet, 65, 40, 1, 0.04, 8, true, this.scale);
    this.animationIdle = this.animationRunSide;
    this.x = 60;
    this.y = 60;
    this.xScale = 1;
    this.damageObjArr = [];
    this.buffObj = [];
    this.abilityCD = [0, 0, 0, 0, 0];
    this.cooldownRate = 1;
    this.cooldownAdj = 0;
    this.castTime = 0;
    this.isStunned = false;
    this.dead = false;
    this.baseMaxMovespeed = 2.5;
    this.velocity = {x:0,y:0};
    this.friction = .5;
    this.baseAcceleration = {x:1,y:1};
    this.accelerationRatio = 1;
    this.accelerationAdj = 0;
    this.maxMovespeedRatio = 1;
    this.maxMovespeedAdj = 0;
    this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj);
    this.runDirection = "right";
    this.shootDirection = "right";
    this.maxShootCounter = 0.3;
    this.shootCounter = this.maxShootCounter;
    this.maxHealth = 1000;
    this.health = this.maxHealth;
    this.healthPercent = 100;
    this.dontdraw = 0;
    this.boundingbox = new BoundingBox(this.x + 4, this.y + 14,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

Player.prototype.draw = function () {
    GAME_ENGINE.clockTick.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(CAMERA.x, CAMERA.y, canvasWidth - 1, canvasHeight - 1);
    this.xScale = 1;
    var xValue = this.x;
    //draw player character with no animation if player is not currently moving
    if (this.dontdraw <= 0) {
        if (this.dead) {
            this.animationDeath.drawFrameAniThenIdle(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
            GAME_ENGINE.ctx.font = "50px Starcraft";
        //console.log(GAME_ENGINE.ctx.measureText("Game Over"));
        GAME_ENGINE.ctx.fillStyle = color_red;
        GAME_ENGINE.ctx.fillText("Game Over", 135, 200);
        GAME_ENGINE.ctx.font = "30px Starcraft";
        //console.log(GAME_ENGINE.ctx.measureText("Play Again"));
        GAME_ENGINE.ctx.fillText("Play Again", 208, 275);
        // GAME_ENGINE.ctx.strokeStyle = color_red;
        // GAME_ENGINE.ctx.strokeRect(205, 253, 230, 28);
        } else {
            // if statements for shooting logic
            if (GAME_ENGINE.shoot === true) {
                // if statements for running logic
                if (this.shootDirection === "left") {
                    GAME_ENGINE.ctx.save();
                    GAME_ENGINE.ctx.scale(-1, 1);
                    this.xScale = -1;
                    xValue = -this.x - this.width;
                }
                if (this.shootDirection === "left" || this.shootDirection === "right") {
                    this.animationShootSide.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                } else if (this.shootDirection === "up") {
                    this.animationShootUp.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                } else {
                    this.animationShootDown.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                }
            } else if (!GAME_ENGINE.movement) {
                // if statements for running logic
                if (this.runDirection === "left") {
                    GAME_ENGINE.ctx.save();
                    GAME_ENGINE.ctx.scale(-1, 1);
                    this.xScale = -1;
                    xValue = -this.x - this.width;
                }
                //animation for when player is not moving or shooting
                this.animationIdle.drawFrameIdle(GAME_ENGINE.ctx, xValue, this.y);
            } else {
                // if statements for running logic
                if (this.runDirection === "left") {
                    GAME_ENGINE.ctx.save();
                    GAME_ENGINE.ctx.scale(-1, 1);
                    this.xScale = -1;
                    xValue = -this.x - this.width;
                }
                if (this.runDirection === "left" || this.runDirection === "right") {
                    this.animationRunSide.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                } else if (this.runDirection === "up") {
                    this.animationRunUp.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                } else {
                    this.animationRunDown.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                }
            }
        }
        GAME_ENGINE.ctx.restore();
        if (GAME_ENGINE.debug) {
            GAME_ENGINE.ctx.strokeStyle = "blue";
            GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
                this.boundingbox.width, this.boundingbox.height);
        }
    } else {
        this.dontdraw--;
    }
}

Player.prototype.update = function () {
    // Player movement controls

    if (!this.dead) {
        this.velocity = (this.castTime > 0 || this.isStunned) ? {x:0,y:0} : this.velocity;
        if (this.castTime <= 0 && !this.isStunned) {
            /* #region Player movement controls */

            
//             //Speed shift calculation
//             let speedShift = {x:this.baseAcceleration.x * this.accelerationRatio + this.accelerationAdj
//                             ,y:this.baseAcceleration.y * this.accelerationRatio + this.accelerationAdj};
//             //I love lambda...
//             //Friction
//             this.velocity.x = (this.velocity.x < .1 && this.velocity.x > -.1) ? 0 : this.velocity.x - Math.sign(this.velocity.x)*this.friction;
//             this.velocity.y = (this.velocity.y < .1 && this.velocity.y > -.1) ? 0 : this.velocity.y - Math.sign(this.velocity.y)*this.friction;

//             //Application of acceleration
//             this.velocity.x += (GAME_ENGINE.keyD) ? speedShift.x : 0;
//             this.velocity.x -= (GAME_ENGINE.keyA) ? speedShift.x : 0;
//             this.velocity.y -= (GAME_ENGINE.keyW) ? speedShift.y : 0;
//             this.velocity.y += (GAME_ENGINE.keyS) ? speedShift.y : 0;

//             //Check max
//             this.velocity.x = (Math.abs(this.velocity.x) > this.baseMaxMovespeed) ? Math.sign(this.velocity.x) * this.baseMaxMovespeed : this.velocity.x;
//             this.velocity.y = (Math.abs(this.velocity.y) > this.baseMaxMovespeed) ? Math.sign(this.velocity.y) * this.baseMaxMovespeed : this.velocity.y;
//             let mag = Math.sqrt(Math.pow(this.velocity.x,2) + Math.pow(this.velocity.y,2));
//             if (mag > this.baseMaxMovespeed) {//Circle max movespeed
//                 this.velocity.x = this.baseMaxMovespeed * this.velocity.x / mag;
//                 this.velocity.y = this.baseMaxMovespeed * this.velocity.y / mag;
//             }

//             //Application of velocity
//             this.x += this.velocity.x;
//             this.y += this.velocity.y;

//             //Animation direction
//             if (GAME_ENGINE.keyW){this.direction = "up";}
//             else if (GAME_ENGINE.keyA){this.direction = "left";}
//             else if (GAME_ENGINE.keyS){this.direction = "down";}
//             else if (GAME_ENGINE.keyD){this.direction = "right";}



            
            this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj);
            if (GAME_ENGINE.keyW === true) {
                this.y -= this.actualSpeed;
                this.runDirection = "up";
                this.animationIdle = this.animationRunUp;
            } else if (GAME_ENGINE.keyA === true) {
                this.x -= this.actualSpeed;
                this.runDirection = "left";
                this.animationIdle = this.animationRunSide;
            } else if (GAME_ENGINE.keyS === true) {
                this.y += this.actualSpeed;
                this.runDirection = "down";
                this.animationIdle = this.animationRunDown;
            } else if (GAME_ENGINE.keyD === true) {
                this.x += this.actualSpeed;
                this.runDirection = "right";
                this.animationIdle = this.animationRunSide;
            }

            /* #endregion */

            if (GAME_ENGINE.shoot) {
                if (this.shootCounter >= this.maxShootCounter) {
                    var direction = "down";
                    if (GAME_ENGINE.keyUp === true) {
                        var direction = "up";
                    } else if (GAME_ENGINE.keyLeft === true) {
                        var direction = "left";
                    } else if (GAME_ENGINE.keyRight === true) {
                        var direction = "right";
                    } 
                    this.shootDirection = direction;
                    this.shootProjectile(direction);
                    this.shootCounter = 0;
                } else {
                    this.shootCounter += GAME_ENGINE.clockTick;
                }
            }

        } else {
            this.castTime--;
        }
        /* #region Abilities */
        let t;
        for (t in this.abilityCD) {
            this.abilityCD[t] += (this.abilityCD[t] > 0) ? -1 : 0;
            if (t > 0) {
                var spellHTML = document.getElementById("spell" + t);
                //display if spell is ready to use or not
                if (this.abilityCD[t] > 0) {
                    spellHTML.innerHTML = this.abilityCD[t] / 10;
                    spellHTML.style.color = color_red;
                } else {
                    spellHTML.innerHTML = "Ready";
                    spellHTML.style.color = color_green;
                }
            }
        }


        // ****************
        // DISABLED FOR NOW
        // ****************
        // for (t in GAME_ENGINE.digit) {
        //     if (GAME_ENGINE.digit[t] && !this.isStunned) {
        //         switch (GAME_ENGINE.playerPick) {
        //             case 0:
        //                 this.mageAbilities(t);
        //                 break;
        //             case 1:
        //                 this.rangerAbilities(t);
        //                 break;
        //             case 2:
        //                 this.knightAbilities(t);
        //                 break;
        //         }
        //     }
        // }
        /* #endregion */


        if (this.health <= 0) {
            this.dead = true;
        }

        /* #region Damage system updates */
        let dmgObj;
        let dmgRemove = [];
        let dmgFlag;
        let buff;
        let buffRemove = [];
        let buffFlag;
        /* #region Updates */
        for (dmgObj in this.damageObjArr) {//Updates damage objects
            this.damageObjArr[dmgObj].update();
            if (this.damageObjArr[dmgObj].timeLeft <= 0) {
                dmgRemove.push(dmgObj);//Adds to trash system
            }
        }
        for (buff in this.buffObj) {//Updates buff objects
            this.buffObj[buff].update(this);
            if (this.buffObj[buff].timeLeft <= 0) {
                buffRemove.push(buff);//Adds to trash system
            }
        }
        /* #endregion */
        /* #region Removal */
        for (dmgFlag in dmgRemove) {//Removes flagged damage objects
            this.damageObjArr.splice(dmgRemove[dmgFlag], 1);
        }
        for (buffFlag in buffRemove) {//Removes flagged buff objects
            this.buffObj.splice(buffRemove[buffFlag], 1);
        }
        /* #endregion */
        /* #endregion */

        this.boundingbox = new BoundingBox(this.x + (this.xScale * 4), this.y + 13,
            this.width, this.height);
    }

}

Player.prototype.shootProjectile = function (direction) {
    var xTar = myPlayer.x;
    var yTar = myPlayer.y;
    if (direction === "up") {
        xTar = myPlayer.x + (myPlayer.width / 2);
    } else if (direction === "left") {
        xTar = myPlayer.x - 8;
        yTar = myPlayer.y + (myPlayer.height / 2) + 3;
    } else if (direction === "right") {
        xTar = myPlayer.x + myPlayer.width + 8;
        yTar = myPlayer.y + (myPlayer.height / 2) + 3;
    } else {
        xTar = myPlayer.x + (myPlayer.width / 2) + 8;
        yTar = myPlayer.y + myPlayer.height + 4;
    }
    var projectile = new Projectile(AM.getAsset("./img/terran/bullet.png"/*"./img/fireball.png"*/),
        myPlayer.x + 4,
        myPlayer.y - (myPlayer.height / 2),
         xTar, yTar, 5);
    GAME_ENGINE.addEntity(projectile);
}

Player.prototype.changeHealth = function (amount) {
    if (amount > 0) {
        //display healing animation
        //maybe have a currentHealth change threshold 
        //to actually have it display
        if (this.health + amount > this.maxHealth) {
            amount = this.maxHealth - this.health;
        }
    } else if (amount < 0) {
        //display damage animation
        //maybe have a currentHealth change threshold 
        //to actually have it display
    }

    this.health += amount;//Damage will come in as a negative value;
    this.healthPercent = Math.floor(this.health / this.maxHealth * 100);
    document.getElementById("health").innerHTML = this.health;
    var healthImg = document.getElementById("healthImg");
    if (this.healthPercent >= 90) {
        healthImg.src = "./img/health_wireframe/green_health.png";
    } else if (this.healthPercent >= 60) {
        healthImg.src = "./img/health_wireframe/yellow_health.png";
    } else if (this.healthPercent >= 30) {
        healthImg.src = "./img/health_wireframe/orange_health.png";
    } else {
        healthImg.src = "./img/health_wireframe/red_health.png";
    }
}
/* #endregion */

/* #region Base Projectile */
function Projectile(spriteSheet, originX, originY, xTarget, yTarget, belongsTo) {
    this.origin = belongsTo;

    // this.width = 100;
    // this.height = 100;
    this.width = 13;
    this.height = 13;
    this.animation = new Animation(spriteSheet, this.width, this.height, 1, .085, 8, true, .75);
    this.spriteSheet = spriteSheet;
    this.targetType = 4;
    this.x = originX - CAMERA.x;
    this.y = originY - CAMERA.y;

    this.xTar = xTarget - CAMERA.x;
    this.yTar = yTarget - CAMERA.y;
    // Determining where the projectile should go angle wise.
    this.angle = Math.atan2(this.yTar - this.y, this.xTar - this.x);
    this.counter = 0; // Counter to make damage consistent
    this.childUpdate;//function
    this.childDraw;//function
    this.childCollide;//function
    this.speed = 200;
    this.projectileSpeed = 7.5;

    // Damage stuff
    this.durationBetweenHits = 50;//Adjustable
    this.totalDamage = 15;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Piercing, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.penetrative = false;
    this.aniX = -18;
    this.aniY = -5;
    Entity.call(this, GAME_ENGINE, originX, originY);

    this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);

}

Projectile.prototype.draw = function () {
    (typeof this.childDraw === 'function') ? this.childDraw() : null;
    //this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x + this.aniX, this.y + this.aniY);
    GAME_ENGINE.ctx.drawImage(this.spriteSheet, this.x - CAMERA.x, this.y - CAMERA.y, this.width, this.height);
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = color_yellow;
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);
    }
}

Projectile.prototype.update = function () {
    //var projectileSpeed = 7.5;
    (typeof this.childUpdate === 'function') ? this.childUpdate() : null;
    // Generating the speed to move at target direction
    var velY = Math.sin(this.angle) * this.projectileSpeed;
    var velX = Math.cos(this.angle) * this.projectileSpeed;
    // Moving the actual projectile.
    this.x += velX;
    this.y += velY;

    if (this.x - CAMERA.x <= TILE_SIZE * 2 || this.x - CAMERA.x >= canvasWidth - TILE_SIZE * 2
        || this.y - CAMERA.y <= TILE_SIZE * 2 || this.y - CAMERA.y >= canvasHeight - TILE_SIZE * 2) {
        this.removeFromWorld = true;
        GAME_ENGINE.removeEntity(this);
    }
    Entity.prototype.update.call(this);

    if (this.origin == 5) {
        for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
            var entityCollide = GAME_ENGINE.entities[4][i];
            if (this.boundingbox.collide(entityCollide.boundingbox)) {
                if (GAME_ENGINE.entities[4][i].health > 0) {
                    (typeof this.childCollide === 'function') ? this.childCollide(entityCollide) : null;
                    this.damageObj.ApplyEffects(GAME_ENGINE.entities[4][i]);
                    this.removeFromWorld = (this.penetrative) ? false : true;
                    GAME_ENGINE.removeEntity(this);
                }
            }
        }
    } else {
        if (this.boundingbox.collide(myPlayer.boundingbox)) {
            if (myPlayer.health > 0) {
                (typeof this.childCollide === 'function') ? this.childCollide(myPlayer) : null;
                this.damageObj.ApplyEffects(myPlayer);
                this.removeFromWorld = (this.penetrative) ? false : true;
                GAME_ENGINE.removeEntity(this);
            }
        }
    }

    this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
}
/* #endregion */

/* #region BoundingBox */
// BoundingBox for entities to detect collision.
function BoundingBox(x, y, width, height) {
    this.x = x - CAMERA.x;
    this.y = y - CAMERA.y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}
/* #endregion */

/* #region Camera */
function Camera() {
    this.x = 0;
    this.y = 0;
    this.currentRoom = 0;
}

Camera.prototype.update = function () {
}

Camera.prototype.getStartingRoom = function () {
    var roomNum = 0;
    for (var i = 0; i < BACKGROUND.map.length; i++) {
        for (var j = 0; j < BACKGROUND.map[i].length; j++) {
            if (BACKGROUND.map[i][j] === 8) {
                this.currentRoom = roomNum;
            }

            roomNum++;
        }
    }
}

Camera.prototype.draw = function () {
    BACKGROUND.drawMiniMap();
    document.getElementById("room" + this.currentRoom).style.backgroundColor = "green";
}


Camera.prototype.move = function (direction) {
    var positionChange = TILE_SIZE * 4 + 40;
    if (direction === "right") {
        this.x += canvasWidth;
        myPlayer.x += positionChange;
        BACKGROUND.x -= canvasWidth;
        this.currentRoom++;
    } else if (direction === "left") {
        this.x -= canvasWidth;
        myPlayer.x -= positionChange;
        BACKGROUND.x += canvasWidth;
        this.currentRoom--;
    } else if (direction === "up") {
        this.y -= canvasHeight;
        myPlayer.y -= positionChange;
        BACKGROUND.y += canvasHeight;
        this.currentRoom -= 5;
    } else {
        this.y += canvasHeight;
        myPlayer.y += positionChange;
        BACKGROUND.y -= canvasHeight;
        this.currentRoom += 5;
    }
}
/* #endregion */

/* #region Menu */
function Menu() {
    this.button = { x: 406, width: 221, height: 39 };
    this.storyY = 263;
    this.controlsY = 409;
    this.survivalY = 336;
    this.back = { x: 62, y: 30, width: 59, height: 16 };
    this.controls = false;
    this.credits = false;
    this.story = false;
    this.survival = false;
    this.background = new Image();
    this.background.src = "./img/utilities/menu.png";
}

Menu.prototype.update = function () {

}

Menu.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(this.background, 0, 0, canvasWidth, canvasHeight,
        0, 0, canvasWidth, canvasHeight);
}

/* #endregion */

/* #region Animation */
function Animation(spriteSheet, frameWidth, frameHeight,
    sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);
    this.drawFrameHelper(ctx, x, y, xindex * this.frameWidth, yindex * this.frameHeight);
}

Animation.prototype.drawFrameAniThenIdle = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    var xindex = 0;
    var yindex = 0;
    if (this.isDone()) {
        xindex = this.frames % this.sheetWidth;
        yindex = Math.floor(this.frames / this.sheetWidth) - 1;
    } else {
        var frame = this.currentFrame();
        xindex = frame % this.sheetWidth;
        yindex = Math.floor(frame / this.sheetWidth);
    }
    this.drawFrameHelper(ctx, x, y, xindex * this.frameWidth, yindex * this.frameHeight);
}

Animation.prototype.drawFrameIdle = function (ctx, x, y) {
    this.drawFrameHelper(ctx, x, y, 0, 0);
}

Animation.prototype.drawFrameHelper = function (ctx, x, y, xFrame, yFrame) {
    var xPosition;
    if ((x >= 0 && CAMERA.x >= 0) || (x < 0 && CAMERA.x < 0)) {
        xPosition = x - CAMERA.x;
    } else {
        xPosition = x + CAMERA.x;
    }
    ctx.drawImage(this.spriteSheet,
        xFrame, yFrame,
        this.frameWidth, this.frameHeight,
        xPosition, y - CAMERA.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function addHTMLListeners() {
    var volumeSlider = document.getElementById("volumeSlider");
    volumeSlider.addEventListener("change", function () {
        music.volume = volumeSlider.value;
    }, false);
}

/* #endregion */

/* #region Download queue and download */

// Harrison's Fireball
AM.queueDownload("./img/fireball.png");

// Map
AM.queueDownload("./img/utilities/floor.png");

// Buildings
AM.queueDownload("./img/buildings/crashed_cruiser.png");
AM.queueDownload("./img/buildings/gravemind.png");
AM.queueDownload("./img/buildings/hive.png");
AM.queueDownload("./img/buildings/infested_cc.png");
AM.queueDownload("./img/buildings/ion_cannon.png");

// Marine
AM.queueDownload("./img/terran/marine/marine_move_right.png");
AM.queueDownload("./img/terran/marine/marine_move_up.png");
AM.queueDownload("./img/terran/marine/marine_move_down.png");
AM.queueDownload("./img/terran/marine/marine_shoot_right.png");
AM.queueDownload("./img/terran/marine/marine_shoot_up.png");
AM.queueDownload("./img/terran/marine/marine_shoot_down.png");
AM.queueDownload("./img/terran/marine/marine_death.png");
AM.queueDownload("./img/terran/bullet.png");

// Sunken Spike
AM.queueDownload("./img/zerg/sunken_spike.png");

// Hydralisk
AM.queueDownload("./img/zerg/hydra/hydra_move_right.png");
AM.queueDownload("./img/zerg/hydra/hydra_attack_right.png");
AM.queueDownload("./img/zerg/hydra/hydra_death.png");

// Infested Terran
AM.queueDownload("./img/zerg/infested/infested_move_right.png");
AM.queueDownload("./img/zerg/infested/infested_boom.png");
AM.queueDownload("./img/zerg/infested/infested_death.png");

// Ultralisk
AM.queueDownload("./img/zerg/ultra/ultra_move_right.png");
AM.queueDownload("./img/zerg/ultra/ultra_attack_right.png");
AM.queueDownload("./img/zerg/ultra/ultra_death.png");

// Zergling
AM.queueDownload("./img/zerg/zergling/zergling_move_right.png");
AM.queueDownload("./img/zerg/zergling/zergling_attack_right.png");
AM.queueDownload("./img/zerg/zergling/zergling_death.png");


AM.downloadAll(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    document.body.style.backgroundColor = "black";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;


    GAME_ENGINE.init(ctx);
    GAME_ENGINE.start();
    GAME_ENGINE.addEntity(new Menu());
    AUDIO = new Audio();
    document.getElementById("hud").style.display = "none";
    addHTMLListeners();
    BACKGROUND = new Background();
    SCENE_MANAGER = new SceneManager();
});
/* #endregion */