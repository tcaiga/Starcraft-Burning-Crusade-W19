const AM = new AssetManager();
const GAME_ENGINE = new GameEngine();
var SCENE_MANAGER;

var canvasWidth;
var canvasHeight;
var gameWorldHeight;
var gameWorldWidth;

var hudHeight;
var sidebarWidth;

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
    this.game = game;
    this.ctx = game.ctx;
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
        this.y -= 2 * sprint;
    }
    if (GAME_ENGINE.keyA === true) {
        this.x -= 2 * sprint;
        this.right = false;
    }
    if (GAME_ENGINE.keyS === true) {
        this.y += 2 * sprint;
    }
    if (GAME_ENGINE.keyD === true) {
        this.x += 2 * sprint;
        this.right = true;
    }

    if (this.health <= 0) {
        this.game.reset();
    }

    this.boundingbox = new BoundingBox(this.x + (this.xScale * 4), this.y + 13,
        this.width, this.height);
}

Player.prototype.collide = function (sprint) {
    //* 2 is the offset for a 2x2 of tiles.
    if (this.x + this.width + this.xOffset >= gameWorldWidth - TILE_SIZE * 2) {
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

    this.counter = 0;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

Monster.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Displaying Monster health
    this.ctx.font = "15px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Health: " + this.health, this.x - 5, this.y - 5);
}

Monster.prototype.update = function () {
    this.x -= this.game.clockTick * this.speed;
    if (this.x <= TILE_SIZE * 2) this.x = 450;
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width, this.height); // **Temporary** Hard coded offset values.

    for (var i = 0; i < GAME_ENGINE.playerEntities.length; i++) {
        var entityCollide = GAME_ENGINE.playerEntities[i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            this.counter += this.game.clockTick;
            if (this.counter > .018 && GAME_ENGINE.playerEntities[i].health > 0) {
                GAME_ENGINE.playerEntities[i].health -= 5;
            }
            this.counter = 0;
        }
    }

    if (this.health <= 0) this.removeFromWorld = true;
}

function Devil(game, spritesheet) {
    Monster.call(this, game, spritesheet);
    var scale;
    this.scale = 3;
    this.width = 16;
    this.height = 23;
    this.speed = 45;
    this.health = 200;
    this.animation = new Animation(spritesheet, this.width, this.height, 128, 0.15, 8, true, this.scale);
    this.x = 250;
    this.y = 250;

    this.counter = 0;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.
}

Devil.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, this.width * this.scale, this.height * this.scale);

    // Displaying Monster health
    this.ctx.font = "15px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Health: " + this.health, this.x - 5, this.y - 5);
}
Devil.prototype.update = function () {
    if (this.health <= 0) this.removeFromWorld = true;
    this.x += this.game.clockTick * this.speed;
    if (this.x >= gameWorldWidth - TILE_SIZE * 2 - this.boundingbox.width) this.x = TILE_SIZE * 2;
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.

    for (var i = 0; i < GAME_ENGINE.playerEntities.length; i++) {
        var entityCollide = GAME_ENGINE.playerEntities[i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            this.counter += this.game.clockTick;
            if (this.counter > .018 && GAME_ENGINE.playerEntities[i].health > 0) {
                GAME_ENGINE.playerEntities[i].health -= 5;
            }
            this.counter = 0;
        }
    }
}

function Acolyte(game, spritesheet) {
    Monster.call(this, game, spritesheet);
    var scale;
    this.scale = 2;
    this.width = 16;
    this.height = 19;
    this.speed = 25;
    this.health = 150;
    this.animation = new Animation(spritesheet, this.width, this.height, 64, 0.15, 4, true, this.scale);

    this.x = 100;
    this.y = 100;

    this.counter = 0;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.
}

Acolyte.prototype.update = Devil.prototype.update;
Acolyte.prototype.draw = Devil.prototype.draw;

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

    for (var i = 0; i < GAME_ENGINE.monsterEntities.length; i++) {
        var entityCollide = GAME_ENGINE.monsterEntities[i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            if (GAME_ENGINE.monsterEntities[i].health > 0) {
                GAME_ENGINE.monsterEntities[i].health -= 15;
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
    this.classButtonH = 35;
    this.classButtonY = 400;
    this.classButtonBottom = this.classButtonY + this.classButtonH;
    this.mageButtonX = (canvasWidth - (this.classButtonW * 3)) / 4;
    this.rangerButtonX = 2 * this.mageButtonX + this.classButtonW;
    this.knightButtonX = this.rangerButtonX + this.classButtonW + this.mageButtonX;
    this.background = new Image();
    this.background.src = "./img/menu_background.png";
}

Menu.prototype.update = function () {
}

Menu.prototype.draw = function () {
    this.ctx.drawImage(this.background, 253, 0,
        canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

    var title = "Last Labyrinth"
    this.ctx.font = "bold 80px Arial";
    this.ctx.fillStyle = "black";
    var titleLength = Math.floor(this.ctx.measureText(title).width);
    var titleXStart = (canvasWidth - titleLength) / 2;
    this.ctx.fillText(title, titleXStart, 238);
    this.ctx.strokeStyle = "grey";
    this.ctx.lineWidth = "1";
    this.ctx.strokeText(title, titleXStart, 238);

    this.createClassButton("Mage", this.mageButtonX);
    this.createClassButton("Ranger", this.rangerButtonX);
    this.createClassButton("Knight", this.knightButtonX);
}

Menu.prototype.createClassButton = function (text, xPosition) {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = "1";
    this.ctx.font = "35px Arial";
    this.ctx.strokeText(text, xPosition, this.classButtonY+ this.classButtonH);
    this.ctx.fillStyle = "white";
    this.ctx.fillText(text, xPosition, this.classButtonY + this.classButtonH);
}

function HUD(game) {
    this.ctx = game.ctx;
    this.game = game;
    this.height = 100;
}

HUD.prototype.draw = function () {
    //ALL VALUES ARE HARCODED FOR NOW

    //health
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(40, canvasHeight - this.height / 2, 40, 0, 2 * Math.PI);
    this.ctx.fill();

    //mana?
    this.ctx.fillStyle = "blue";
    this.ctx.beginPath();
    this.ctx.arc(120, canvasHeight - this.height / 2, 40, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Mana", 82, canvasHeight - (this.height / 2) + 15);
    this.ctx.fillText(myPlayer.health, 15, canvasHeight - (this.height / 2) + 15);

    //ability 1
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(160, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(160, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("1", 160, canvasHeight - this.height + 15);

    //ability 2
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(223, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(223, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("2", 223, canvasHeight - this.height + 15);

    //ability 3
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(286, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(286, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("3", 286, canvasHeight - this.height + 15);

    //ability 4
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(349, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(349, canvasHeight - this.height,
        63, this.height / 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillText("4", 349, canvasHeight - this.height + 15);

    //stats
    //ability 4
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(160, canvasHeight - this.height / 2,
        252, this.height / 2);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(160, canvasHeight - this.height / 2,
        252, this.height / 2);
    this.ctx.fillStyle = "white";
    var speed = (this.game.keyShift) ? 1.5 : 1

    this.ctx.fillText("Speed: " + speed, 160, canvasHeight - this.height / 2 + 15);

    //map
    //ability 4
    this.ctx.font = "20px Arial";
    this.ctx.fillStyle = "grey";
    this.ctx.fillRect(412, canvasHeight - this.height,
        100, this.height);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(412, canvasHeight - this.height,
        100, this.height);
}

HUD.prototype.update = function () {

}



function Sidebar(game) {
    this.ctx = game.ctx;
    this.game = game;
    this.width = 250;
}

Sidebar.prototype.draw = function () {
    this.ctx.font = "35px Arial";
    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(gameWorldWidth, 0, this.width, canvasHeight);
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(gameWorldWidth, 0, this.width, canvasHeight);
    this.ctx.fillStyle = "black";
    this.ctx.fillText("Last Labyrinth", gameWorldWidth, 30);

    this.ctx.font = "20px Arial";
    this.ctx.fillText("Floor # = " + myFloorNum, gameWorldWidth, 80);
    this.ctx.fillText("Room # = " + myRoomNum, gameWorldWidth, 110);

    this.ctx.fillText("Controls:", gameWorldWidth, 160);
    this.ctx.fillText("Movement: W, A, S, D", gameWorldWidth, 190);
    this.ctx.fillText("Sprint: Shift", gameWorldWidth, 220);
    this.ctx.fillText("Projectile: Left Click", gameWorldWidth, 250);
    this.ctx.fillText("Abilities (N/A): 1, 2, 3, 4", gameWorldWidth, 280);
}

Sidebar.prototype.update = function () {

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

Animation.prototype.drawFrameIdle = function (ctx, x, y) {
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
    document.body.style.backgroundColor = "black";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    gameWorldWidth = canvasWidth - 250;
    gameWorldHeight = canvasWidth - 100;

    GAME_ENGINE.init(ctx);
    GAME_ENGINE.start();

    GAME_ENGINE.addEntity(new Menu(GAME_ENGINE));
    SCENE_MANAGER = new SceneManager();
});