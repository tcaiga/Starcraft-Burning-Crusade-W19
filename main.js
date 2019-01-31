var AM = new AssetManager();
var gameEngine = new GameEngine();

var canvasWidth;
var canvasHeight;

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

function Monster(game, spritesheet) {
    this.offsetY = 5;
    this.Width = 40;
    this.Height = 56;
    this.animation = new Animation(spritesheet, this.Width, this.Height, 1, 0.15, 15, true, 1);
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

    enemyCollection.push(this);

    this.boundingbox = new BoundingBox(this.x, this.y + this.offsetY, this.Width, this.Height, entTypeEnum.ENEMY, this.boundingbox);
    Entity.call(this, game, 0, 250);
    
}

Monster.prototype.update = function () {
    this.x -= this.game.clockTick * this.speed;
    if (this.x < 0) this.x = 450;
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y, this.Width, this.Height, entTypeEnum.ENEMY, this.boundingbox);
}

Monster.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
}

Monster.prototype.draw = function() {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    gameEngine.ctx.strokeStyle = "red";
    gameEngine.ctx.strokeRect(this.x, this.y + this.OffsetHeight, this.boundingbox.width, this.boundingbox.height);
}

Monster.prototype.getBoundingBox = function() {
    return this.boundingbox;
}

function Skeleton(game, spritesheet) {
    this.ctx = game.ctx;

    this.offsetY = 5;
    this.Width = 16;
    this.Height = 18;
    this.animation = new Animation(spritesheet, this.Width, this.Height, 8, .10, 8, true, 1);

    this.speed = 100;
    this.health = 100;
    this.armor = 0;
    this.maxMovespeed = 100;
    this.acceleration = [];
    this.velocity = [];
    this.damage = 0;
    this.debuff = [];
    this.hitbox = [];

    enemyCollection.push(this);

    this.boundingbox = new BoundingBox(this.x, this.y, this.Width, this.Height, entTypeEnum.ENEMY, this.boundingbox);
    Entity.call(this, game, 0, 250);
}

Skeleton.prototype.update = function () {
    //do stuff
}

Skeleton.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
}

Skeleton.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    gameEngine.ctx.strokeStyle = "red";
    gameEngine.ctx.strokeRect(this.x, this.y, this.boundingbox.width, this.boundingbox.height);
}

Skeleton.prototype.getBoundingBox = function () {
    return this.boundingbox;
}

function Acolyte(game, spritesheet) {
    this.Width = 0;
    this.Height = 0;
    this.animation = new Animation(spritesheet, this.Width, this.Height, 1, 0.15, 15, true, 1);

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

    enemyCollection.push(this);

    this.boundingbox = new BoundingBox(this.x, this.y, this.Width, this.Height, entTypeEnum.ENEMY, this.boundingbox);
    Entity.call(this, game, 0, 250);
}

Acolyte.prototype.update = function () {
    // do stuff
}

Acolyte.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
}

Acolyte.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    gameEngine.ctx.strokeStyle = "red";
    gameEngine.ctx.strokeRect(this.x, this.y, this.boundingbox.width, this.boundingbox.height);
}

Acolyte.prototype.getBoundingBox = function () {
    return this.boundingbox;
}


function Devil(game, spritesheet) {
    this.Width = 16;
    this.Height = 23;
    this.animation = new Animation(spritesheet, this.Width, this.Height, 8, .10, 8, true, 2);

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

    enemyCollection.push(this);

    this.boundingbox = new BoundingBox(this.x, this.y, this.Width * 2, this.Height * 2, entTypeEnum.ENEMY, this.boundingbox);
    Entity.call(this, game, 0, 250);
}

Devil.prototype.update = function () {
    // do stuff
}

Devil.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
}

Devil.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    gameEngine.ctx.strokeStyle = "black";
    gameEngine.ctx.strokeRect(this.x, this.y, this.boundingbox.width, this.boundingbox.height);
}

Devil.prototype.getBoundingBox = function () {
    return this.boundingbox;
}





// Projectile object that will be used for creation of projectile sprites and their corresponding hitboxes and
// effects. 
// TODO: add multiple spritesheets based on direction. Or have it send spritesheet based on launch direction from gameengine.
function Projectile(game, spritesheet, origin) {
    this.projWidth = 11;
    this.projHeight = 22;
    this.animation = new Animation(spritesheet, 11, 22, 11, 15, 2, true, 1);
    this.belongsTo = origin;
    this.x = 125;
    this.y = 125;   

    this.game = game;
    this.ctx = game.ctx;
    this.boundingbox = new BoundingBox(this.x, this.y, this.projWidth, this.projHeight, entTypeEnum.PROJECTILE, this.boundingbox, this.belongsTo);

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
    gameEngine.ctx.strokeStyle = "red";
    gameEngine.ctx.strokeRect(this.x, this.y, 20, 20); // **Temporary** Hard coded offset values
}

Trap.prototype.update = function () {
    for (var i = 0; i < gameEngine.playerEntities.length; i++) {
        var entityCollide = gameEngine.playerEntities[i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            // Remember what tick the collision happened
            this.counter += this.game.clockTick;
            // Check to make sure the animation happens first
            if (this.counter < .1) {
                this.doAnimation = true;
            } else { // Else keep the spikes up as the player stands over the trap
                this.doAnimation = false;
                // Nuke the player, but start the damage .13 ticks after they stand
                // This allows players to sprint accross taking 10 damage
                if (gameEngine.playerEntities[i].health > 0 && this.counter > .13) {
                    gameEngine.playerEntities[i].health -= 10;
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

function Player(game, spritesheetLeft, spritesheetRight) {
    // Relevant for Player box
    this.width = 16;
    this.height = 28;
    this.animationLeft = new Animation(spritesheetLeft, this.width, this.height, 1, 0.08, 4, true, 1.5);
    this.animationRight = new Animation(spritesheetRight, this.width, this.height, 1, 0.08, 4, true, 1.5);
    this.animationStill = this.animationRight;
    this.x = 60;
    this.y = 60;

    this.game = game;
    this.ctx = game.ctx;
    this.right = true;


    this.health = 100000;

    this.health = 100;
    this.boundingbox = new BoundingBox(this.x  + 4, this.y + 14,
         this.width, this.height); // **Temporary** Hard coded offset values.

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
    gameEngine.ctx.strokeRect(this.x + 4, this.y + 13,
         this.boundingbox.width, this.boundingbox.height); // Hard coded offset values
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("Health: " + this.health, 320, 60);
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

// TODO: Finish enemy collision tests for projectiles.
function testCollision(value, key, map) {
    entType = key.entType;

    if (playerObj1.boundingbox.collide(key) && entType - 4 > 0) {
        
        // enemy stuff (current design doesnt punish players for being in range, but we can potentially do something with this)
        if (entType == entTypeEnum.ENEMY) {
        // trap stuff
        } else if(entType == entTypeEnum.TRAP) {
            // not really functional--testing if its updating with the entity type which it is
            playerObj1.health--;
       // door entity
        }  else if (entType == entTypeEnum.DOOR) {
        //      door lock stuff that will be implemented <PH>
        //    if (playerObj1 has key ....) {}
        }
    }

    //test enemy collision stuff
    for (var i = 0; i < enemyCollection.length; i++) {
        var enemy = enemyCollection[i];
        if (enemy.boundingbox.collide(key)) {
            if (key.entType == entTypeEnum.PROJECTILE) {
                if (key.belongsTo == origin.PLAYER) {
                    console.log("oof ouch my bones");
                }
            }

        }
            
    }
}

// Player prototype functions to determine map collision.
Player.prototype.collideRight = function () {
    return this.x + TILE_SIZE * 2 + this.width > canvasWidth; // This is the tile offset + the width of the character.
};
Player.prototype.collideLeft = function () {
    return this.x - TILE_SIZE * 2 < 0; // This is the offset for a 2x2 of tiles.
};
Player.prototype.collideBottom = function () {
    return this.y + TILE_SIZE * 2 + this.height > canvasHeight; // This is tile offset + the height of the character.
};
Player.prototype.collideTop = function () {
    return this.y - TILE_SIZE * 2 < 0; // This is the offset for a 2x2 of tiles.
};

// enum to keep track of interactable entities
const entTypeEnum = {
    PLAYER: 1,
    ENEMY: 5,
    TRAP: 6,
    ITEM: 7,
    PROJECTILE: 8,
    DOOR: 9
};

// <IMPORTANT> Entity type or "entType" vals: 1-4 for player(s), 5 for enemy, 6 for trap, 7 for items, and 8 for doors.
// BoundingBox for entities to detect collision.
function BoundingBox(x, y, width, height, entType, boundBox, origin) {
    hitboxCollection.delete(boundBox);
    this.entType = entType;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.belongsTo = origin;

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
    this.classButtonBottom = this.classButtonY + this.classButtonH;
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

    AM.queueDownload("./img/NPC_21.png");
    AM.queueDownload("./img/whackFireTrap.png");

    // Skeleton
    AM.queueDownload("./img/skeleton.png");
    // Devil
    AM.queueDownload("./img/devil.png");

    // Orange fireball sprites
    AM.queueDownload("./img/fireball_upside.png");
    AM.queueDownload("./img/fireball_vert.png");

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