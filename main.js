var AM = new AssetManager();
var gameEngine = new GameEngine();

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

// no inheritance
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
    this.zero.src = "./img/tile_0014.png";
    this.one = new Image();
    this.one.src = "./img/tile_0010.png";
    this.tile = null;
};

Background.prototype.draw = function () {
    for (let i = 0; i < 22; i++) {
        for (let j = 0; j < 22; j++) {
            this.tile = (this.map[i * 22 + j] == 1)?this.one:this.zero;
            this.ctx.drawImage(this.tile, j *  32, i * 32);
            this.ctx.drawImage(this.tile, (j * 32) + 16, i * 32);
            this.ctx.drawImage(this.tile, j * 32, (i * 32) + 16);
            this.ctx.drawImage(this.tile, (j * 32) + 16, (i *32) + 16);
        }
    }
};

Background.prototype.update = function () {

};

function Monster1(game, spritesheet) {
    this.animation = new Animation(spritesheet, 40, 56, 1, 0.15, 15, true, 1);
    this.speed = 100;
    this.ctx = game.ctx;
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

function Player(game, spritesheetLeft, spritesheetRight) {
    this.animationLeft = new Animation(spritesheetLeft, 40, 56, 1, 0.04, 13, true, 1);
    this.animationRight = new Animation(spritesheetRight, 40, 56, 1, 0.04, 13, true, 1);
    // this.animationLeft = new Animation(spritesheetLeft, 419, 381, 5, 0.04, 5, true, 0.15);
    // this.animationRight = new Animation(spritesheetRight, 419, 381, 5, 0.04, 5, true, 0.15);
    this.animationStill = this.animationRight;
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.ctx = game.ctx;
    this.right = true;
    this.health = 100;
    this.armor = 0;
    this.maxMovespeed = 100;
    this.acceleration = [x,y];
    this.velocity = [x,y];
    this.damage = 0;
    this.debuff = [];
    this.hitbox = [];
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
    if (gameEngine.keyW === true) {
        this.y -= 2;
    }  
    if (gameEngine.keyA === true) {
        this.x -= 2;
        this.right = false;
        this.animationStill = this.animationLeft;
    } 
    if (gameEngine.keyS === true) {
        this.y += 2;
    } 
    if (gameEngine.keyD === true) {
        this.x += 2;
        this.right = true;
        this.animationStill = this.animationRight;
    }
}


AM.queueDownload("./img/NPC_22.png");
AM.queueDownload("./img/NPC_22_Flipped.png");
AM.queueDownload("./img/NPC_21.png");
AM.queueDownload("./img/wizard_walk.png");
AM.queueDownload("./img/wizard_walk_flipped.png");

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
});