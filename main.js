var AM = new AssetManager();
var gameEngine = new GameEngine();

// Constant variable for tile size
const TILE_SIZE = 16;


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

// No inheritance
function Background(game) {
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.ctx = game.ctx;
    this.map = [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    ]
    this.zero = new Image();
    this.zero.src = "./img/tile_0117.png";
    this.one = new Image();
    this.one.src = "./img/tile_0468.png";
    this.tile = null;
};

Background.prototype.draw = function () {
    for (let i = 0; i < 22; i++) {
        for (let j = 0; j < 22; j++) {
            this.tile = (this.map[i * 22 + j] == 1)?this.one:this.zero;
            this.ctx.drawImage(this.tile, j *  TILE_SIZE * 2, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2 + TILE_SIZE);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i *TILE_SIZE * 2 +  TILE_SIZE);
        }
    }
};

Background.prototype.update = function () {

};

function Monster1(game, spritesheet) {
    this.animation = new Animation(spritesheet, 40, 56, 1, 0.15, 15, true, 1);
    this.speed = 100;
    this.ctx = game.ctx;
    this.health = 100;
    this.armor = 0;
    this.maxMovespeed = 100;
    this.acceleration = [];
    this.velocity = [];
    this.damage = 0;
    this.debuff = [];
    this.hitbox = [];
    Entity.call(this, game, 0, 450);
}

Monster1.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

Monster1.prototype.update = function () {
    this.x -= this.game.clockTick * this.speed;
    if (this.x < 0) this.x = 680;
    Entity.prototype.update.call(this);
}

function Trap(game, spriteSheet) {
    this.animation = new Animation(spriteSheet, 512, 512, 1, 0.1, 4, true, .25);
    this.x = 704/2 - 59; // Hardcorded center spawn
    this.y = 704/2 - 59; // Hardcorded center spawn
    this.game = game;
    this.ctx = game.ctx;
}

Trap.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

Trap.prototype.update = function () {
    
}

function Player(game, spritesheetLeft, spritesheetRight) {
    this.animationLeft = new Animation(spritesheetLeft, 40, 56, 1, 0.04, 13, true, 1);
    this.animationRight = new Animation(spritesheetRight, 40, 56, 1, 0.04, 13, true, 1);
    // this.animationLeft = new Animation(spritesheetLeft, 419, 381, 5, 0.04, 5, true, 0.15);
    // this.animationRight = new Animation(spritesheetRight, 419, 381, 5, 0.04, 5, true, 0.15);
    this.animationStill = this.animationRight;
    //this.x = 0;
    //this.y = 0;
    this.x = 704/2 - 20; // Hardcorded center spawn
    this.y = 704/2 - 28; // Hardcoded center spawn
    this.game = game;
    this.ctx = game.ctx;
    this.right = true;

    this.health = 100;
    this.armor = 0;
    this.maxMovespeed = 100;
    this.acceleration = [];
    this.velocity = [];
    this.damage = 0;
    this.debuff = [];
    this.hitbox = [];

    // Relevant for Player box
    this.playerWidth = 40;
    this.playerHeight = 56;
}

Player.prototype.draw = function () {
    //draw player character with no animation if player is not currently moving
    if (!gameEngine.movement) {
        this.animationStill.drawFrameStill(this.ctx, this.x, this.y);
    } else {
        if (this.right) {
            this.animationRight.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else {
            this.animationLeft.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }
    }
}

Player.prototype.update = function () {
    // Conditional check to see if player wants to sprint or not
    var sprint = gameEngine.keyShift ? 2 : 1;

    // Collision detection for player.
    if (this.collideLeft()) {
        this.x += 2 * sprint;
    }

    if (this.collideRight()) {
        this.x -= 2 * sprint;
    }

    if (this.collideTop()) {
        this.y += 2 * sprint;
    }

    if (this.collideBottom()) {
        this.y -= 2 * sprint;
    }

    // Player movement controls
    if (gameEngine.keyW === true) {
        this.y -= 2 * sprint;
    }  
    if (gameEngine.keyA === true) {
        this.x -= 2 * sprint;
        this.right = false;
        this.animationStill = this.animationLeft;
    } 
    if (gameEngine.keyS === true) {
        this.y += 2 * sprint;
    } 
    if (gameEngine.keyD === true) {
        this.x += 2 * sprint;
        this.right = true;
        this.animationStill = this.animationRight;
    }
}

// Player prototype functions to determine map collision.
Player.prototype.collideRight = function () {
    return this.x + TILE_SIZE * 2 + this.playerWidth > 704; // This is the tile offset + the width of the character.
};
Player.prototype.collideLeft = function () {
    return this.x - TILE_SIZE * 2 < 0; // This is the offset for a 2x2 of tiles.
};
Player.prototype.collideBottom = function () {
    return this.y + TILE_SIZE * 2 + this.playerHeight > 704; // This is tile offset + the height of the character.
};
Player.prototype.collideTop = function () {
    return this.y - TILE_SIZE * 2 < 0; // This is the offset for a 2x2 of tiles.
};

AM.queueDownload("./img/NPC_22.png");
AM.queueDownload("./img/NPC_22_Flipped.png");
AM.queueDownload("./img/NPC_21.png");
AM.queueDownload("./img/wizard_walk.png");
AM.queueDownload("./img/wizard_walk_flipped.png");
AM.queueDownload("./img/whackFireTrap.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine));
    // gameEngine.addEntity(new Player(gameEngine, AM.getAsset("./img/wizard_walk_flipped.png"),
    //  AM.getAsset("./img/wizard_walk.png")));
     gameEngine.addEntity(new Player(gameEngine, AM.getAsset("./img/NPC_22.png"),
     AM.getAsset("./img/NPC_22_Flipped.png")));
    gameEngine.addEntity(new Monster1(gameEngine, AM.getAsset("./img/NPC_21.png")));
    gameEngine.addEntity(new Trap(gameEngine, AM.getAsset("./img/whackFireTrap.png")));
});