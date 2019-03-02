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
var playerX;
var playerY;

// Constant variable for tile size
const TILE_SIZE = 16;
/* #endregion */

/* #region Player */
function Player(spritesheet, xOffset, yOffset) {
    // Relevant for Player box
    this.width = 32;
    this.height = 32;
    this.scale = 1.5;
    this.xOffset = xOffset * this.scale;
    this.yOffset = yOffset * this.scale;
    this.animationRun = new Animation(spritesheet, this.width, this.height, 1, 0.04, 9, true, this.scale);
    this.animationIdle = this.animationRun;
    this.x = 60;
    this.y = 60;
    playerX = this.x;
    playerY = this.y;
    this.xScale = 1;
    this.damageObjArr = [];
    this.buffObj = [];
    this.abilityCD = [0, 0, 0, 0, 0];
    this.cooldownRate = 1;
    this.cooldownAdj = 0;
    this.castTime = 0;
    this.isStunned = false;
    this.sprint = 1;
    this.dead = false;
    this.baseMaxMovespeed = 2;
    this.maxMovespeedRatio = 1;
    this.maxMovespeedAdj = 0;
    this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * this.sprint;
    this.right = true;
    this.health = 9999;
    this.maxHealth = 100;
    this.dontdraw = 0;
    this.boundingbox = new BoundingBox(this.x + 4, this.y + 14,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

Player.prototype.draw = function () {
    GAME_ENGINE.clockTick.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(CAMERA.x, CAMERA.y, canvasWidth - 1, canvasHeight - 1);
    this.xScale = 1;
    var xValue = this.x;
    if (!this.right) {
        GAME_ENGINE.ctx.save();
        GAME_ENGINE.ctx.scale(-1, 1);
        this.xScale = -1;
        xValue = -this.x - this.width;
    }
    //draw player character with no animation if player is not currently moving
    if (this.dontdraw <= 0) {
        if (!GAME_ENGINE.movement) {
            this.animationIdle.drawFrameIdle(GAME_ENGINE.ctx, xValue, this.y);
        } else {
            this.animationRun.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
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
    // Conditional check to see if player wants to sprint or not
    this.sprint = GAME_ENGINE.keyShift ? 1.75 : 1;
    // Player movement controls

    if (!this.dead) {
        if (this.castTime <= 0 && !this.isStunned) {
            /* #region Player movement controls */
            this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * this.sprint;
            if (GAME_ENGINE.keyW === true) {
                this.y -= this.actualSpeed;
            }
            if (GAME_ENGINE.keyA === true) {
                this.x -= this.actualSpeed;
                this.right = false;
            }
            if (GAME_ENGINE.keyS === true) {
                this.y += this.actualSpeed;
            }
            if (GAME_ENGINE.keyD === true) {
                this.x += this.actualSpeed;
                this.right = true;
            }
           
            /* #endregion */
        } else {
            this.castTime--;
        }
        /* #region Abilities */
        let t;
        for (t in this.abilityCD) {
            this.abilityCD[t] += (this.abilityCD[t] > 0) ? -1 : 0;
            // if (t > 0) {
            //     var spellHTML = document.getElementById("spell" + t);
            //     //display if spell is ready to use or not
            //     if (this.abilityCD[t] > 0) {
            //         spellHTML.innerHTML = this.abilityCD[t] / 10;
            //         spellHTML.style.color = color_red;
            //     } else {
            //         spellHTML.innerHTML = "Ready";
            //         spellHTML.style.color = color_green;
            //     }
            // }
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
            GAME_ENGINE.reset();
            BACKGROUND = new Background();
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

        playerX = this.x;
        playerY = this.y;

        this.boundingbox = new BoundingBox(this.x + (this.xScale * 4), this.y + 13,
            this.width, this.height);
    }

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
}
/* #endregion */

/* #region Projectile */
/* #region Base Projectile */
function Projectile(spriteSheet, originX, originY, xTarget, yTarget, belongsTo) {
    this.origin = belongsTo;

    this.width = 100;
    this.height = 100;
    this.animation = new Animation(spriteSheet, this.width, this.height, 1, .085, 8, true, .75);

    this.targetType = 4;
    this.x = originX - CAMERA.x;
    this.y = originY - CAMERA.y;

    this.xTar = xTarget - 20;
    this.yTar = yTarget - 35;
    // Determining where the projectile should go angle wise.
    this.angle = Math.atan2(this.yTar - this.y, this.xTar - this.x);
    this.counter = 0; // Counter to make damage consistent
    this.childUpdate;//function
    this.childDraw;//function
    this.childCollide;//function
    this.speed = 200;
    this.projectileSpeed = 7.5;
    this.damageObj = DS.CreateDamageObject(15, 0, DTypes.Normal, null);
    this.penetrative = false;
    this.aniX = -18;
    this.aniY = -5;
    Entity.call(this, GAME_ENGINE, originX, originY);

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75);

}

Projectile.prototype.draw = function () {
    (typeof this.childDraw === 'function') ? this.childDraw() : null;
    this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x + this.aniX, this.y + this.aniY);
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

    if (this.x - CAMERA.x < 16 || this.x - CAMERA.x > canvasWidth - 58
        || this.y - CAMERA.y < 0 || this.y - CAMERA.y > canvasHeight - 80) {
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

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // Hardcoded a lot of offset values

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
}

Camera.prototype.update = function () { }

Camera.prototype.draw = function () { 
}


Camera.prototype.move = function (direction) {
    var positionChange = TILE_SIZE * 4 + 40;
    if (direction === "right") {
        this.x += canvasWidth;
        myPlayer.x += positionChange;
        BACKGROUND.x -= canvasWidth;
    } else if (direction === "left") {
        this.x -= canvasWidth;
        myPlayer.x -= positionChange;
        BACKGROUND.x += canvasWidth;
    } else if (direction === "up") {
        this.y -= canvasHeight;
        myPlayer.y -= positionChange;
        BACKGROUND.y += canvasHeight;
    } else {
        this.y += canvasHeight;
        myPlayer.y += positionChange;
        BACKGROUND.y -= canvasHeight;
    }
}
/* #endregion */

/* #region Menu */
function Menu() {
    this.button = {x: 406, width: 221, height: 39};
    this.storyY = 263;
    this.controlsY = 409;
    this.back = {x:62, y:30, width:59,height:16};
    this.controls = false;
    this.credits = false;
    this.background = new Image();
    this.background.src = "./img/utilities/menu.png";
}

Menu.prototype.update = function () {

}

Menu.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(this.background,0, 0, canvasWidth, canvasHeight,
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

    var xPosition;
    if ((x >= 0 && CAMERA.x >= 0) || (x < 0 && CAMERA.x < 0)) {
        xPosition = x - CAMERA.x;
    } else {
        xPosition = x + CAMERA.x;
    }
    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth, yindex * this.frameHeight,
        this.frameWidth, this.frameHeight,
        xPosition, y - CAMERA.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}


Animation.prototype.drawFrameIdle = function (ctx, x, y) {
    var xPosition;
    if ((x >= 0 && CAMERA.x >= 0) || (x < 0 && CAMERA.x < 0)) {
        xPosition = x - CAMERA.x;
    } else {
        xPosition = x + CAMERA.x;
    }
    ctx.drawImage(this.spriteSheet,
        0, 0,
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
        myCurrentVolume = music.volume;
    }, false);
    var muteButton = document.getElementById("muteButton");
    muteButton.addEventListener("click", function () {
        if (myIsMute) {
            music.volume = myCurrentVolume;
            muteButton.innerHTML = "Mute";
            volumeSlider.value = myCurrentVolume;
            myIsMute = false;
        } else {
            music.volume = 0.0;
            muteButton.innerHTML = "Unmute";
            volumeSlider.value = 0.0;
            myIsMute = true;
        }
    }, false);

}

/* #endregion */

/* #region Download queue and download */

// Harrison's Fireball
AM.queueDownload("./img/fireball.png");

// Buildings and Map
AM.queueDownload("./img/utilities/floor.png");
AM.queueDownload("./img/buildings/crashed_cruiser.png");
AM.queueDownload("./img/buildings/gravemind.png");
AM.queueDownload("./img/buildings/hive.png");
AM.queueDownload("./img/buildings/infested_cc.png");
AM.queueDownload("./img/buildings/ion_cannon.png");

// Marine
AM.queueDownload("./img/terran/marine/marine_move_right.png");
AM.queueDownload("./img/terran/marine/marine_shoot_right.png");
AM.queueDownload("./img/terran/marine/marine_death.png");

// Sunken Spike
AM.queueDownload("./img/zerg/extras/sunken_spike.png");

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