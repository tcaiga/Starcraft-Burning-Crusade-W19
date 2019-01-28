var AM = new AssetManager();
var gameEngine = new GameEngine();

var characterPick = -1;
var characterArray = [];

var canvasWidth;
var canvasHeight;

var entityArray = [];

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
    this.zero = new Image();
    this.zero.src = "./img/floor_1.png";
    this.one = new Image();
    this.one.src = "./img/floor_spikes_anim_f3.png";
    this.tile = null;
};

Background.prototype.draw = function () {
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            this.tile = (this.map[i * 16 + j] == 1) ? this.one : this.zero;
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2, i * TILE_SIZE * 2 + TILE_SIZE);
            this.ctx.drawImage(this.tile, j * TILE_SIZE * 2 + TILE_SIZE, i * TILE_SIZE * 2 + TILE_SIZE);
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
    Entity.call(this, game, 0, 250);
}

Monster1.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

Monster1.prototype.update = function () {
    this.x -= this.game.clockTick * this.speed;
    if (this.x < 0) this.x = 450;
    Entity.prototype.update.call(this);
}

function Trap(game, spriteSheet) {
    this.animation = new Animation(spriteSheet, 512, 512, 1, 0.1, 4, true, .25);
    this.x = canvasWidth / 2 - 59; // Hardcorded center spawn
    this.y = canvasHeight / 2 - 59; // Hardcorded center spawn
    this.game = game;
    this.ctx = game.ctx;

    this.boundingbox = new BoundingBox(this.x, this.y, 128, 128); // **Temporary** hardcode of width and height
}

Trap.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    gameEngine.ctx.strokeStyle = "red";
    gameEngine.ctx.strokeRect(this.x, this.y, 128, 128); // **Temporary** Hard coded offset values
}

Trap.prototype.update = function () {

}

function Player(game, spritesheetLeft, spritesheetRight) {
    this.animationLeft = new Animation(spritesheetLeft, 16, 28, 1, 0.08, 4, true, 1.5);
    this.animationRight = new Animation(spritesheetRight, 16, 28, 1, 0.08, 4, true, 1.5);
    this.animationStill = this.animationRight;
    //this.x = 0;
    //this.y = 0;

    this.x = canvasWidth / 2 - 16; // Hardcorded center spawn
    this.y = canvasHeight / 2 - 28; // Hardcoded center spawn

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
    this.playerWidth = 16;
    this.playerHeight = 28;

    this.boundingbox = new BoundingBox(this.x  + 4, this.y + 14, this.playerWidth, this.playerHeight); // **Temporary** Hard coded offset values.
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
    gameEngine.ctx.strokeStyle = "blue";
    gameEngine.ctx.strokeRect(this.x + 4, this.y + 13, this.boundingbox.width, this.boundingbox.height); // Hard coded offset values
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

    // Checking for collision for all entities.
    // **Work in Progress** works only for player and traps.
    for (var i = 0; i < gameEngine.traps.length; i++) {
        var entityCollide = gameEngine.traps[i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            console.log("Collision with Player and Trap");
        }
    }

    this.boundingbox = new BoundingBox(this.x  + 4, this.y + 14, this.playerWidth, this.playerHeight);
}

// Player prototype functions to determine map collision.
Player.prototype.collideRight = function () {
    return this.x + TILE_SIZE * 2 + this.playerWidth > canvasWidth; // This is the tile offset + the width of the character.
};
Player.prototype.collideLeft = function () {
    return this.x - TILE_SIZE * 2 < 0; // This is the offset for a 2x2 of tiles.
};
Player.prototype.collideBottom = function () {
    return this.y + TILE_SIZE * 2 + this.playerHeight > canvasHeight; // This is tile offset + the height of the character.
};
Player.prototype.collideTop = function () {
    return this.y - TILE_SIZE * 2 < 0; // This is the offset for a 2x2 of tiles.
};

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
    this.classButtonTextY =  430;
    this.mageButtonX = (canvasWidth - (this.classButtonW * 3)) / 4;
    this.rangerButtonX = 2 * this.mageButtonX + this.classButtonW;
    this.knightButtonX = this.rangerButtonX + this.classButtonW + this.mageButtonX;
    this.game = game;
    this.background = new Image();
    this.background.src = "./img/menu_background.png";
}

Menu.prototype.update = function () {
}

Menu.prototype.draw = function () {
        this.ctx.drawImage(this.background, 253, 0,
             canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(this.mageButtonX, this.classButtonY,
             this.classButtonW, this.classButtonH);
        this.ctx.fillStyle = "white";
        this.ctx.fillText("Mage", this.mageButtonX, this.classButtonTextY);

        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(this.rangerButtonX, this.classButtonY,
             this.classButtonW, this.classButtonH);
        this.ctx.fillStyle = "white";
        this.ctx.fillText("Ranger", this.rangerButtonX, this.classButtonTextY);

        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(this.knightButtonX, this.classButtonY,
             this.classButtonW, this.classButtonH);
        this.ctx.fillStyle = "white";
        this.ctx.fillText("Knight", this.knightButtonX, this.classButtonTextY);

        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(170, 300, 172, 37);
        this.ctx.fillStyle = "white";
        this.ctx.fillText("Pick a Class!", 170, 330);
}

    AM.queueDownload("./img/NPC_22.png");
    AM.queueDownload("./img/NPC_22_Flipped.png");
    AM.queueDownload("./img/NPC_21.png");
    AM.queueDownload("./img/whackFireTrap.png");

    // Ranger
    AM.queueDownload("./img/ranger_idle.png");
    AM.queueDownload("./img/ranger_idle_flipped.png");
    AM.queueDownload("./img/ranger_run.png");
    AM.queueDownload("./img/ranger_run_flipped.png");

    // Knight
    AM.queueDownload("./img/knight_idle.png");
    AM.queueDownload("./img/knight_idle_flipped.png");
    AM.queueDownload("./img/knight_run.png");
    AM.queueDownload("./img/knight_run_flipped.png");

    // Mage
    AM.queueDownload("./img/mage_idle.png");
    AM.queueDownload("./img/mage_idle_flipped.png");
    AM.queueDownload("./img/mage_run.png");
    AM.queueDownload("./img/mage_run_flipped.png");


    AM.downloadAll(function () {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        canvas.setAttribute("style",
         "position: absolute; left: 50%; margin-left:-256px; top:55%; margin-top:-256px");
        document.body.style.backgroundColor = "black";
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        gameEngine.init(ctx);
        gameEngine.start();

        gameEngine.addEntity(new Menu(gameEngine));
    });