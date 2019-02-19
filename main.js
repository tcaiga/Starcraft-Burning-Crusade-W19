const AM = new AssetManager();
const GAME_ENGINE = new GameEngine();
const CAMERA = new Camera(GAME_ENGINE);
const DS = new DamageSystem();

var SCENE_MANAGER;
var canvasWidth;
var canvasHeight;
var myFloorNum = 1;
var myRoomNum = 1;
// Constant variable for tile size
const TILE_SIZE = 16;

function Player(game, spritesheet, xOffset, yOffset) {
    // Relevant for Player box
    this.width = 16;
    this.height = 28;
    this.scale = 1.5;
    this.xOffset = xOffset * this.scale;
    this.yOffset = yOffset * this.scale;
    this.animationRun = new Animation(spritesheet, this.width, this.height, 1, 0.08, 4, true, this.scale);
    this.animationIdle = this.animationRun;
    this.x = 60;
    this.y = 60;
    this.xScale = 1;
    this.damageObjArr = [];
    this.buffObj = [];
    this.game = game;
    this.ctx = game.ctx;
    this.baseMaxMovespeed = 2;
    this.maxMovespeedRatio = 1;
    this.maxMovespeedAdj = 0;
    this.right = true;
    this.health = 100;
    this.boundingbox = new BoundingBox(this.x + 4, this.y + 14,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

Player.prototype.draw = function () {
    this.xScale = 1;
    var xValue = this.x;
    if (!this.right) {
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.xScale = -1;
        xValue = -this.x - this.width;
    }
    //draw player character with no animation if player is not currently moving
    if (!GAME_ENGINE.movement) {
        this.animationIdle.drawFrameIdle(this.ctx, xValue, this.y);
    } else {
        this.animationRun.drawFrame(this.game.clockTick, this.ctx, xValue, this.y);
    }
    this.ctx.restore();
    GAME_ENGINE.ctx.strokeStyle = "blue";
    GAME_ENGINE.ctx.strokeRect(this.x + (this.xScale * 4), this.y + 13,
        this.boundingbox.width, this.boundingbox.height);
}

Player.prototype.update = function () {
    // Conditional check to see if player wants to sprint or not
    var sprint = GAME_ENGINE.keyShift ? 1.75 : 1;

    this.collide(sprint);

    // Player movement controls
    if (GAME_ENGINE.keyW === true) {
        this.y -= (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * sprint;
    }
    if (GAME_ENGINE.keyA === true) {
        this.x -= (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * sprint;
        this.right = false;
    }
    if (GAME_ENGINE.keyS === true) {
        this.y += (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * sprint;
    }
    if (GAME_ENGINE.keyD === true) {
        this.x += (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * sprint;
        this.right = true;
    }

    if (this.health <= 0) {
        this.game.reset();
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
        this.damageObjArr.splice(dmgRemove[dmgFlag],1);
    }
    for (buffFlag in buffRemove) {//Removes flagged buff objects
        this.buffObj.splice(buffRemove[buffFlag],1);
    }
    /* #endregion */
    /* #endregion */
    this.boundingbox = new BoundingBox(this.x + (this.xScale * 4), this.y + 13,
        this.width, this.height);
}

Player.prototype.collide = function (sprint) {
    //* 2 is the offset for a 2x2 of tiles.
    if (this.x + this.width + this.xOffset >= CAMERA.x + canvasWidth - TILE_SIZE * 2) {
        //this.x += -2 * sprint;
        CAMERA.move("right");
    }
    if (this.x + this.xOffset <= TILE_SIZE * 2) {
        //this.x += 2 * sprint;
        CAMERA.move("left");
    }
    if (this.y + this.yOffset + myPlayer.height >= canvasHeight - TILE_SIZE * 2) {
        //this.y -= 2 * sprint;
        CAMERA.move("down");
    }
    if (this.y + this.yOffset <= TILE_SIZE * 2) {
        //this.y += 2 * sprint;
        CAMERA.move("up");
    }
}

Player.prototype.ChangeHealth = function (amount) {
    if (amount > 0) {
        //display healing animation
        //maybe have a health change threshold 
        //to actually have it display
    } else if (amount < 0) {
        //display damage animation
        //maybe have a health change threshold 
        //to actually have it display
    }
    this.health += amount;//Damage will come in as a negative value;
}

function Monster(game, spritesheet) {
    Entity.call(this, game, 0, 350);
    this.scale = 1;
    this.width = 40;
    this.height = 56;
    this.animation = new Animation(spritesheet, this.width, this.height, 1, 0.15, 15, true, this.scale);
    this.speed = 100;
    this.ctx = game.ctx;
    this.health = 100;
    this.damageObjArr = [];
    this.damageObj = DS.CreateDamageObject(20,0,DTypes.Normal,DS.CloneBuffObject(PremadeBuffs.HasteWeak));
    this.buffObj = [];
    this.counter = 0;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.
}

Monster.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, this.width * this.scale, this.height * this.scale);

    // Displaying Monster health
    this.ctx.font = "15px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Health: " + this.health, this.x - 5, this.y - 5);
}

Monster.prototype.update = function () {
    if (this.health <= 0) this.removeFromWorld = true;
    this.x += this.game.clockTick * this.speed;
    if (this.x <= TILE_SIZE * 2) this.x = 450;
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.

    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        this.counter += this.game.clockTick;
        this.damageObj.ApplyEffects(myPlayer);
        if (this.counter > .018 && myPlayer.health > 0) {
            //myPlayer.health -= 5;
        }
        this.counter = 0;
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
        this.damageObjArr.splice(dmgRemove[dmgFlag],1);
    }
    for (buffFlag in buffRemove) {//Removes flagged buff objects
        this.buffObj.splice(buffRemove[buffFlag],1);
    }
    /* #endregion */
    /* #endregion */

}

Monster.prototype.ChangeHealth = function (amount) {
    if (amount > 0) {
        //display healing animation
        //maybe have a health change threshold 
        //to actually have it display
    } else if (amount < 0) {
        //display damage animation
        //maybe have a health change threshold 
        //to actually have it display
    }
    this.health += amount;//Healing will come in as a positive number
}

Devil.prototype = Monster.prototype;
Acolyte.prototype = Monster.prototype;

function Devil(game, spritesheet) {
    Monster.call(this, game, spritesheet);
    this.scale = 3;
    this.width = 16;
    this.height = 23;
    this.speed = 45;
    this.health = 200;

    this.x = 250;
    this.y = 250;

    this.counter = 0;
    this.animation = new Animation(spritesheet, this.width, this.height, 128, 0.15, 8, true, this.scale);
}

function Acolyte(game, spritesheet) {
    Monster.call(this, game, spritesheet);
    Acolyte.prototype = Monster.prototype;
    this.scale = 2;
    this.width = 16;
    this.height = 19;
    this.speed = 25;
    this.health = 150;

    this.animation = new Animation(spritesheet, this.width, this.height, 64, 0.15, 4, true, this.scale);

    this.x = 100;
    this.y = 100;

    this.counter = 0;
}

function Projectile(game, spriteSheet, originX, originY, xTarget, yTarget) {
    this.width = 100;
    this.height = 100;
    this.animation = new Animation(spriteSheet, this.width, this.height, 1, .085, 8, true, .75);

    this.originX = originX;
    this.originY = originY;

    this.xTar = xTarget - 20;
    this.yTar = yTarget - 35;

    // Determining where the projectile should go angle wise.
    this.angle = Math.atan2(this.yTar - this.originY, this.xTar - this.originX);
    this.counter = 0; // Counter to make damage consistent

    this.speed = 200;
    this.damageObj = DS.CreateDamageObject(15,0,DTypes.Normal,null);
    this.ctx = game.ctx;
    Entity.call(this, game, originX, originY);

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // Hardcoded a lot of offset values

}

Projectile.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - 18, this.y - 4); // Hardcoded a lot of offset values
    GAME_ENGINE.ctx.strokeStyle = "yellow";
    GAME_ENGINE.ctx.strokeRect(this.x + 8, this.y + 25, this.width - 75, this.height - 75); // Hardcoded a lot of offset values
}

Projectile.prototype.update = function () {
    var projectileSpeed = 7.5;

    // Generating the speed to move at target direction
    var velY = Math.sin(this.angle) * projectileSpeed;
    var velX = Math.cos(this.angle) * projectileSpeed;
    // Moving the actual projectile.
    this.x += velX;
    this.y += velY;

    if (this.x < 16 || this.x > 460 || this.y < 0 || this.y > 430) this.removeFromWorld = true;
    Entity.prototype.update.call(this);

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // **Temporary** Hard coded offset values.

    for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
        var entityCollide = GAME_ENGINE.entities[4][i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            if (GAME_ENGINE.entities[4][i].health > 0) {
                this.damageObj.ApplyEffects(GAME_ENGINE.entities[4][i]);
                this.removeFromWorld = true;
            }
        }
    }

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // Hardcoded a lot of offset values

}

function Trap(game, spriteSheetUp, spriteSheetDown) {
    this.animationUp = new Animation(spriteSheetUp, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationDown = new Animation(spriteSheetDown, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationIdle = this.animationUp;
    this.x = 200; // Hardcorded temp spawn
    this.y = 200; // Hardcorded temp spawn
    this.activated = false; // Determining if trap has been activated
    this.counter = 0; // Counter to calculate when trap related events should occur
    this.doAnimation = false; // Flag to determine if the spikes should animate or stay still
    this.damageObj = DS.CreateDamageObject(10,0,DTypes.Normal,DS.CloneBuffObject(PremadeBuffs.SlowStrong));
    this.game = game;
    this.ctx = game.ctx;

    this.boundingbox = new BoundingBox(this.x, this.y, 20, 20); // **Temporary** hardcode of width and height
}

Trap.prototype.draw = function () {
    if (!this.activated) {
        this.animationIdle.drawFrameIdle(this.ctx, this.x, this.y);
    } else {
        if (this.doAnimation) {
            this.animationUp.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else {
            this.animationDown.drawFrameIdle(this.ctx, this.x, this.y);
        }
    }
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, 20, 20); // **Temporary** Hard coded offset values
}

Trap.prototype.update = function () {
    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        // Remember what tick the collision happened
        this.counter += this.game.clockTick;
        // Check to make sure the animation happens first
        if (this.counter < .1) {
            this.doAnimation = true;
        } else { // Else keep the spikes up as the player stands over the trap
            this.doAnimation = false;
            // Nuke the player, but start the damage .13 ticks after they stand on the trap
            // This allows players to sprint accross taking 10 damage
            if (myPlayer.health > 0 && this.counter > 0.18) {
                //myPlayer.health -= 2;
                this.damageObj.ApplyEffects(myPlayer);
                //console.log(myPlayer);
                this.counter = .1;
            }
        }
        this.activated = true;
    } else {
        this.activated = false;
        this.doAnimation = false;
        this.counter = 0;
    }
}

// BoundingBox for entities to detect collision.
function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
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

function Terrain(game) {

}

function Camera(game) {
    this.x = 0;
    this.y = 0;
}

Camera.prototype.update = function () { }

Camera.prototype.draw = function () { }

Camera.prototype.move = function (direction) {
    if (direction === "right") {
        this.x += canvasWidth;
        myPlayer.x = 60 + CAMERA.x;
    } else if (direction === "left") {
        this.x -= canvasWidth;
        myPlayer.x = canvasWidth - TILE_SIZE * 2 - 60 + CAMERA.x;
    } else if (direction === "up") {
        this.y -= canvasHeight;
        myPlayer.y = canvasHeight + TILE_SIZE * 2 + 60 + CAMERA.y;
    } else if (direction === "down") {
        this.y += canvasHeight;
        myPlayer.y = 60 + CAMERA.y;
    }
}

function Menu(game) {
    this.ctx = game.ctx;
    this.classButtonW = 100;
    this.classButtonH = 35;
    this.classButtonY = 400;
    this.classButtonBottom = this.classButtonY + this.classButtonH;
    this.mageButtonX = (canvasWidth - (this.classButtonW * 3)) / 4;
    this.rangerButtonX = 2 * this.mageButtonX + this.classButtonW;
    this.knightButtonX = this.rangerButtonX + this.classButtonW + this.mageButtonX;
    this.background = new Image();
    this.background.src = "./img/menu_background.png";
}

Menu.prototype.update = function () { }

Menu.prototype.draw = function () {
    this.ctx.drawImage(this.background, 253, 0,
        canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

    this.createClassButton("Mage", this.mageButtonX);
    this.createClassButton("Ranger", this.rangerButtonX);
    this.createClassButton("Knight", this.knightButtonX);
}

Menu.prototype.createClassButton = function (text, xPosition) {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = "1";
    this.ctx.font = "35px Arial";
    this.ctx.strokeText(text, xPosition, this.classButtonY + this.classButtonH);
    this.ctx.fillStyle = "white";
    this.ctx.fillText(text, xPosition, this.classButtonY + this.classButtonH);
}


function Background(game) {
    this.x = 0;
    this.y = 0;
    this.ctx = game.ctx;
    this.map = [

        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,

    ]
    this.mapLength = Math.sqrt(this.map.length);
    this.zero = new Image();
    this.zero.src = "./img/floor_1.png";
    this.one = new Image();
    this.one.src = "./img/tile_0117.png";
    this.tile = null;
};

Background.prototype.draw = function () {
    for (let i = 0; i < this.mapLength; i++) {
        for (let j = 0; j < this.mapLength; j++) {
            this.tile = (this.map[i * this.mapLength + j] == 1) ? this.zero : this.one;
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2 + TILE_SIZE);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2 + TILE_SIZE);
        }
    }
};

Background.prototype.update = function () { };

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

    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth, yindex * this.frameHeight,
        this.frameWidth, this.frameHeight,
        x - CAMERA.x, y - CAMERA.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.drawFrameIdle = function (ctx, x, y) {
    ctx.drawImage(this.spriteSheet,
        0, 0,
        this.frameWidth, this.frameHeight,
        x - CAMERA.x, y - CAMERA.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
/* #region Download queue and download */

// Ranger
AM.queueDownload("./img/ranger_run.png");
// Knight
AM.queueDownload("./img/knight_run.png");
// Mage
AM.queueDownload("./img/mage_run.png");
// Floor Trap
AM.queueDownload("./img/floor_trap_up.png");
AM.queueDownload("./img/floor_trap_down.png");
// Devil
AM.queueDownload("./img/devil.png");
// Acolyte
AM.queueDownload("./img/acolyte.png");
// Harrison's Fireball
AM.queueDownload("./img/fireball.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    //document.body.style.backgroundColor = "black";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    GAME_ENGINE.init(ctx);
    GAME_ENGINE.start();

    GAME_ENGINE.addEntity(new Menu(GAME_ENGINE));
    SCENE_MANAGER = new SceneManager();
});
/* #endregion */