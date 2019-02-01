const AM = new AssetManager();
const GAME_ENGINE = new GameEngine();

var canvasWidth;
var canvasHeight;
var gameWorldHeight;

var hudHeight;

// Constant variable for tile size
const TILE_SIZE = 16;

function Player(game, spritesheetLeft, spritesheetRight, xOffset, yOffset) {
    // Relevant for Player box
    this.width = 16;
    this.height = 28;
    this.scale = 1.5;
    this.xOffset = xOffset * this.scale;
    this.yOffset = yOffset * this.scale;
    this.animationLeft = new Animation(spritesheetLeft, this.width, this.height, 1, 0.08, 4, true, this.scale);
    this.animationRight = new Animation(spritesheetRight, this.width, this.height, 1, 0.08, 4, true, this.scale);
    this.animationStill = this.animationRight;
    this.x = 60;
    this.y = 60;

    this.game = game;
    this.ctx = game.ctx;
    this.right = true;

    this.health = 100;

    this.boundingbox = new BoundingBox(this.x + 4, this.y + 14,
        this.width, this.height); // **Temporary** Hard coded offset values.

}

Player.prototype.draw = function () {
    //draw player character with no animation if player is not currently moving
    if (!GAME_ENGINE.movement) {
        this.animationStill.drawFrameStill(this.ctx, this.x, this.y);
    } else {
        if (this.right) {
            this.animationRight.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else {
            this.animationLeft.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }
    }
    GAME_ENGINE.ctx.strokeStyle = "blue";
    GAME_ENGINE.ctx.strokeRect(this.x + 4, this.y + 13,
        this.boundingbox.width, this.boundingbox.height); // Hard coded offset values
}

Player.prototype.update = function () {
    // Conditional check to see if player wants to sprint or not
    var sprint = GAME_ENGINE.keyShift ? 1.75 : 1;

    this.collide(sprint);

    // Player movement controls
    if (GAME_ENGINE.keyW === true) {
        this.y -= 2 * sprint;
    }
    if (GAME_ENGINE.keyA === true) {
        this.x -= 2 * sprint;
        this.right = false;
        this.animationStill = this.animationLeft;
    }
    if (GAME_ENGINE.keyS === true) {
        this.y += 2 * sprint;
    }
    if (GAME_ENGINE.keyD === true) {
        this.x += 2 * sprint;
        this.right = true;
        this.animationStill = this.animationRight;
    }

    if (this.health <= 0) {
        this.game.reset();
    }

    this.boundingbox = new BoundingBox(this.x + 4, this.y + 14, this.width, this.height);
}

Player.prototype.collide = function (sprint) {
    //* 2 is the offset for a 2x2 of tiles.
    if (this.x + this.width + this.xOffset >= canvasWidth - TILE_SIZE * 2) {
        this.x += -2 * sprint;
    }
    if (this.x + this.xOffset <= TILE_SIZE * 2) {
        this.x += 2 * sprint;
    }
    if (this.y + this.yOffset + myPlayer.height >= canvasHeight - hudHeight - TILE_SIZE * 2) {
        this.y -= 2 * sprint;
    }
    if (this.y + this.yOffset <= TILE_SIZE * 2) {
        this.y += 2 * sprint;
    }
}

function Monster(game, spritesheet) {
    this.width = 40;
    this.height = 56;
    this.animation = new Animation(spritesheet, this.width, this.height, 1, 0.15, 15, true, 1);
    this.speed = 100;
    this.ctx = game.ctx;
    this.health = 100;
    Entity.call(this, game, 0, 350);
    
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

Monster.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, this.width, this.height);
}

Monster.prototype.update = function () {
    this.x -= this.game.clockTick * this.speed;
    if (this.x <= TILE_SIZE * 2) this.x = 450;
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

function Projectile(game, spriteSheet, originX, originY, xTarget, yTarget) {
    this.width = 64;
    this.height = 64;
    this.animation = new Animation(spriteSheet, this.width, this.height, 1, 15, 8, true, 1);

    this.originX = originX;
    this.originY = originY;

    this.xTar = xTarget;
    this.yTar = yTarget;

    this.speed = 200;
    this.ctx = game.ctx;
    Entity.call(this, game, originX, originY);

    console.log(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height);
}

Projectile.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    gameEngine.ctx.strokeStyle = "purple";
    gameEngine.ctx.strokeRect(this.x, this.y, this.width, this.height);
}

Projectile.prototype.update = function () {
    var speedMod = 1.3;
    if (this.xTar < this.originX && this.yTar < this.originY) {
        this.x -= this.game.clockTick * this.speed;
        this.y -= this.game.clockTick * this.speed;
    } else if (this.xTar > this.originX + 14&& this.yTar < this.originY) {
        this.x += this.game.clockTick * this.speed;
        this.y -= this.game.clockTick * this.speed;
    } else if (this.xTar > this.originX + 14 && this.yTar > this.originY + 28) {
        this.x += this.game.clockTick * this.speed;
        this.y += this.game.clockTick * this.speed;
    } else if (this.xTar < this.originX && this.yTar > this.originY + 28) {
        this.x -= this.game.clockTick * this.speed;
        this.y += this.game.clockTick * this.speed;
    } else if (this.xTar > this.originX && this.yTar > this.originY && this.yTar < this.originY + 28) {
        this.x += this.game.clockTick * this.speed * speedMod;
    } else if (this.xTar < this.originX && this.yTar > this.originY && this.yTar < this.originY + 28) {
        this.x -= this.game.clockTick * this.speed * speedMod;
    } else if (this.xTar > this.originX && this.xTar < this.originX + 16 && this.yTar < this.originY) {
        this.y -= this.game.clockTick * this.speed * speedMod;
    } else {
        this.y += this.game.clockTick * this.speed * speedMod;
    }

    if (this.x < 0 || this.x > 500) this.removeFromWorld = true;
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
    this.width, this.height); // **Temporary** Hard coded offset values.
}

function Trap(game, spriteSheetUp, spriteSheetDown) {
    this.animationUp = new Animation(spriteSheetUp, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationDown = new Animation(spriteSheetDown, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationStill = this.animationUp;
    this.x = 200; // Hardcorded temp spawn
    this.y = 200; // Hardcorded temp spawn
    this.activated = false; // Determining if trap has been activated
    this.counter = 0; // Counter to calculate when trap related events should occur
    this.doAnimation = false; // Flag to determine if the spikes should animate or stay still

    this.game = game;
    this.ctx = game.ctx;

    this.boundingbox = new BoundingBox(this.x, this.y, 20, 20); // **Temporary** hardcode of width and height
}

Trap.prototype.draw = function () {
    if (!this.activated) {
        this.animationStill.drawFrameStill(this.ctx, this.x, this.y);
    } else {
        if (this.doAnimation) {
            this.animationUp.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else {
            this.animationDown.drawFrameStill(this.ctx, this.x, this.y);
        }
    }
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, 20, 20); // **Temporary** Hard coded offset values
}

Trap.prototype.update = function () {
    for (var i = 0; i < GAME_ENGINE.playerEntities.length; i++) {
        var entityCollide = GAME_ENGINE.playerEntities[i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            // Remember what tick the collision happened
            this.counter += this.game.clockTick;
            // Check to make sure the animation happens first
            if (this.counter < .1) {
                this.doAnimation = true;
            } else { // Else keep the spikes up as the player stands over the trap
                this.doAnimation = false;
                // Nuke the player, but start the damage .13 ticks after they stand on the trap
                // This allows players to sprint accross taking 10 damage
                if (GAME_ENGINE.playerEntities[i].health > 0 && this.counter > 0.18) {
                    GAME_ENGINE.playerEntities[i].health -= 2;
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

function Menu(game) {
    this.ctx = game.ctx;
    this.classButtonW = 100;
    this.classButtonH = 37;
    this.classButtonY = 400;
    this.classButtonTextY = 430;
    this.titleY = 200;
    this.mageButtonX = (canvasWidth - (this.classButtonW * 3)) / 4;
    this.rangerButtonX = 2 * this.mageButtonX + this.classButtonW;
    this.knightButtonX = this.rangerButtonX + this.classButtonW + this.mageButtonX;
    this.classButtonBottom = this.classButtonY + this.classButtonH;
    this.game = game;
    this.background = new Image();
    this.background.src = "./img/menu_background.png";
}

Menu.prototype.update = function () {
}

//values are TEMP. will change later.
Menu.prototype.draw = function () {
    this.ctx.drawImage(this.background, 253, 0,
        canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

    this.ctx.font = "50px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(100, this.titleY,
        312, 50);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Last Labyrinth", 100, this.titleY + 38);

    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(this.mageButtonX, this.classButtonY,
        this.classButtonW, this.classButtonH);
    this.ctx.fillStyle = "blue";
    this.ctx.fillText("Mage", this.mageButtonX, this.classButtonTextY);

    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(this.rangerButtonX, this.classButtonY,
        this.classButtonW, this.classButtonH);
    this.ctx.fillStyle = "blue";
    this.ctx.fillText("Ranger", this.rangerButtonX, this.classButtonTextY);

    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(this.knightButtonX, this.classButtonY,
        this.classButtonW, this.classButtonH);
    this.ctx.fillStyle = "blue";
    this.ctx.fillText("Knight", this.knightButtonX, this.classButtonTextY);

    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(170, 300, 172, 37);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Pick a Class!", 170, 330);
}

function HUD(game) {
    this.ctx = game.ctx;
    this.game = game;
    this.height = 100;
}

HUD.prototype.draw = function () {
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(0, canvasHeight - this.height, canvasWidth, this.height);
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Health: " + myPlayer.health, 0, canvasHeight);
}

HUD.prototype.update = function () {

}

// No inheritance
function Background(game) {
    this.x = 0;
    this.y = 0;
    this.game = game;
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
    this.one.src = "./img/floor_spikes_anim_f3.png";
    this.tile = null;
};

Background.prototype.draw = function () {
    for (let i = 0; i < this.mapLength; i++) {
        for (let j = 0; j < this.mapLength; j++) {
            this.tile = (this.map[i * this.mapLength + j] == 1) ? this.one : this.zero;
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2 + TILE_SIZE);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2 + TILE_SIZE);
        }
    }
};

Background.prototype.update = function () {

};

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
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.drawFrameStill = function (ctx, x, y) {
    ctx.drawImage(this.spriteSheet,
        0, 0,
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

AM.queueDownload("./img/NPC_21.png");

// Ranger
AM.queueDownload("./img/ranger_run.png");
AM.queueDownload("./img/ranger_run_flipped.png");

// Knight
AM.queueDownload("./img/knight_run.png");
AM.queueDownload("./img/knight_run_flipped.png");

// Mage
AM.queueDownload("./img/mage_run.png");
AM.queueDownload("./img/mage_run_flipped.png");

// Floor Trap
AM.queueDownload("./img/floor_trap_up.png");
AM.queueDownload("./img/floor_trap_down.png");

    // Fireball stuff
    AM.queueDownload("./img/fireball/fireballright.png");
    AM.queueDownload("./img/fireball/fireballdownleft.png");
    AM.queueDownload("./img/fireball/fireballleftup.png");
    AM.queueDownload("./img/fireball/fireballup.png");
    AM.queueDownload("./img/fireball/fireballdown.png");
    AM.queueDownload("./img/fireball/fireballrightup.png");
    AM.queueDownload("./img/fireball/fireballdownright.png");
    AM.queueDownload("./img/fireball/fireballleft.png");



AM.downloadAll(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    canvas.setAttribute("style",
        "position: absolute; left: 50%; margin-left:-256px; top:50%; margin-top:-306px");
    document.body.style.backgroundColor = "black";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;


    GAME_ENGINE.init(ctx);
    GAME_ENGINE.start();

    GAME_ENGINE.addEntity(new Menu(GAME_ENGINE));
});