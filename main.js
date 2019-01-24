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
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
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
function Background(game/*, spritesheet*/) {
    this.x = 0;
    this.y = 0;
    //this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.map = [
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
        1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
    ]
    this.zero = new Image();
    this.zero.src = "./img/tile_0010.png";
    this.one = new Image();
    this.one.src = "./img/tile_0014.png";
    this.tile = null;
};

Background.prototype.draw = function () {
    // this.ctx.drawImage(this.spritesheet,
    //                this.x, this.y);
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

// function MushroomDude(game, spritesheet) {
//     this.animation = new Animation(spritesheet, 189, 230, 5, 0.10, 14, true, 1);
//     this.x = 0;
//     this.y = 0;
//     this.speed = 100;
//     this.game = game;
//     this.ctx = game.ctx;
// }

// MushroomDude.prototype.draw = function () {
//     this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
// }

// MushroomDude.prototype.update = function () {
//     if (gameEngine.keyA === true) {
//         this.x -= 5;
//     } else if (gameEngine.keyS === true) {
//         this.y += 5;
//     } else if (gameEngine.keyD === true) {
//         this.x += 5;
//     } else if (gameEngine.keyW === true) {
//         this.y -= 5;
//     }
// }

function Player(game, spritesheet) {
    this.animation = new Animation(spritesheet, 40, 60, 1, 0.16, 16, true, 1);
    this.x = 0;
    this.y = 0;
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
}

Player.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

Player.prototype.update = function () {
    if (gameEngine.keyA === true) {
        this.x -= 5;
    } else if (gameEngine.keyS === true) {
        this.y += 5;
    } else if (gameEngine.keyD === true) {
        this.x += 5;
    } else if (gameEngine.keyW === true) {
        this.y -= 5;
    }
}

// AM.queueDownload("./img/mushroomdude.png");
//AM.queueDownload("./img/background.jpg");
AM.queueDownload("./img/NPC_22.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    gameEngine.init(ctx);
    gameEngine.start();

    // gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
    gameEngine.addEntity(new Background(gameEngine));
    // gameEngine.addEntity(new MushroomDude(gameEngine, AM.getAsset("./img/mushroomdude.png")));
    gameEngine.addEntity(new Player(gameEngine, AM.getAsset("./img/NPC_22.png")));
});