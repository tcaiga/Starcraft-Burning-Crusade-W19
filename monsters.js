function Monster(spritesheetArr, x, y) {
    Entity.call(this, GAME_ENGINE, 0, 350);

    // behavior stuff
    this.visionWidth = 200;
    this.visionHeight = 200;
    this.ticksSinceLastHit = 0;
    this.isRanged = false;
    this.pause = false;
    this.inRange = false;
    this.castCooldown = 0;
    this.isStunned = false;
    this.isPathing = false;
    this.pathX = 0;
    this.pathY = 0;
    this.isBoss = false;

    // animation stuff
    this.flaggedLeft = false;
    this.numOfFrames = 15;
    this.frameLength = .15;
    this.sheetWidth = 1;
    this.scale = 1;
    this.width = 40;
    this.height = 56;
    this.spritesheetArr = spritesheetArr;
    this.animation = new Animation(spritesheetArr['r'], this.width, this.height,
        this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);

    this.y = y;
    this.x = x;
    this.speed = 100;
    this.health = 100;
    this.damageObjArr = [];
    this.damageObj = DS.CreateDamageObject(20, 0, DTypes.Normal, DS.CloneBuffObject(PremadeBuffs.HasteWeak));
    this.buffObj = [];
    this.counter = 0;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.

    this.visionBox = new BoundingBox(this.boundingbox.x - .5 * (this.width * this.scale - this.visionWidth),
        this.boundingbox.y - .5 * (this.height * this.scale - this.visionWidth),
        this.visionWidth, this.visionHeight);
}

Monster.prototype.draw = function () {
    this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x, this.y);
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = "red";
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);
        GAME_ENGINE.ctx.strokeStyle = "purple";
        GAME_ENGINE.ctx.strokeRect(this.visionBox.x, this.visionBox.y,
            this.visionBox.width, this.visionBox.height);
    }

    // Displaying Monster health
    GAME_ENGINE.ctx.font = "15px Arial";
    GAME_ENGINE.ctx.fillStyle = "white";
    GAME_ENGINE.ctx.fillText("Health: " + Math.floor(this.health), this.x - 5 - CAMERA.x, this.y - 5 - CAMERA.y);
}

function pathTo(x, y) {
    this.isPathing = true;
    this.pathX = x;
    this.pathY = y;
} 

function distance(monster) {
    var dx = playerX - monster.x;
    var dy = playerX - monster.y;
    return Math.sqrt(dx * dx, dy * dy);
}

Monster.prototype.update = function () {
    if (this.isBoss) {
        this.bossBehavior();
    } else {

    }
    if (this.health <= 0) this.removeFromWorld = true;
    var dirX, dirY;
    if (this.isPathing) {
        // we've reached our target so stop.
        if (this.x == this.pathX && this.y == this.pathY) {
            this.isPathing = false;
        }
        dirX = this.pathX - this.x;
        dirY = this.pathY - this.y;
    } else {
        // get the direction vector pointing towards player
        dirX = playerX - this.x;
        dirY = playerY - this.y;
    }


    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        this.counter += GAME_ENGINE.clockTick;
        this.damageObj.ApplyEffects(myPlayer);
        this.pause = true;
        if (this.counter > .018 && myPlayer.health > 0) {
            //player.health -= 5;
        }
        this.counter = 0;
    }

    // based on the number of ticks since the player was last hit, we pause the monster
    if (this.pause == false && !this.isStunned) {
        // change spritesheet based on direction enemy is moving
        if (dirX < 0 && this.flaggedLeft == false) {
            this.flaggedLeft = true;
            this.animation = new Animation(this.spritesheetArr['l'], this.width, this.height,
                this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
        } else if (dirX > 0 && this.flaggedLeft == true) {
            this.flaggedLeft = false;
            this.animation = new Animation(this.spritesheetArr['r'], this.width, this.height,
                this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
        }
        // get the distance from the player
        var dis = Math.sqrt(dirX * dirX + dirY * dirY);
        // nomralize the vector
        dirX = dirX / dis;
        dirY = dirY / dis;
        // change x and y based on our vector
        this.x += dirX * (this.speed / 100);
        this.y += dirY * (this.speed / 100);
    } else {
        this.ticksSinceLastHit += 1;
        if (this.ticksSinceLastHit >= 60) {
            this.pause = false;
            ticksSinceLastHit = 0;
        }
    }

    Entity.prototype.update.call(this);

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.


    this.visionBox = new BoundingBox(this.boundingbox.x + .5 * (this.width * this.scale - this.visionWidth),
        this.boundingbox.y + .5 * (this.height * this.scale - this.visionWidth),
        this.visionWidth, this.visionHeight);

    if (this.isRanged) {

        // if we're in range of the player, fire a projectile at them
        if (this.visionBox.collide(myPlayer.boundingbox)) {
            // flag that we're in range (or not)
            this.inRange = !this.inRange;
            // pause to cast at the player
            this.pause = true;
            // get the player's coordiantes
            var tarX = myPlayer.x;
            var tarY = myPlayer.y;
        }
        // if we're in range of a player, we can continue to cast at them (based on a cooldown)
        // otherwise we'd just cast when a player's bounding box collides with their vision box.
        if (this.inRange) {
            // keep track of time since the last cast
            this.castCooldown += 1
            // reset after 45 ticks and then cast again
            if (this.castCooldown > 45) {
                this.castCooldown = 0;
                var projectile = new Projectile(AM.getAsset("./img/fireball.png", 4),
                    this.x - (this.width / 2), this.y - (this.height / 2), tarX, tarY);
                GAME_ENGINE.addEntity(projectile);
                projectile.penetrative = true;
            }
        }
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

}

Monster.prototype.changeHealth = function (amount) {
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
/* #endregion */

/* #region Monster Types */
Devil.prototype = Monster.prototype;
Acolyte.prototype = Monster.prototype;
BigDemon.prototype = Monster.prototype;
Swampy.prototype = Monster.prototype;
TinyZombie.prototype = Monster.prototype;
MaskedOrc.prototype = Monster.prototype;
Ogre.prototype = Monster.prototype;
Zerg_Boss.prototype = Monster.prototype;

Infested.prototype = Monster.prototype;
function Infested(spritesheetArr, x, y) {

    Monster.call(this, spritesheetArr, x, y);


    // animation
    this.scale = 1.5;
    this.width = 40;
    this.height = 40;
    this.numOfFrames = 8;
    this.frameLength = 0.03;
    this.sheetWidth = 1;

    // gameplay
    this.speed = 150;
    this.health = 15;

    this.x = x;
    this.y = y;

    this.counter = 0;
    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, 1, 0.04, 8, true, this.scale);
}

function BigDemon(spritesheetArr, x, y) {

    Monster.call(this, spritesheetArr, x, y);


    // animation
    this.scale = 2;
    this.width = 32;
    this.height = 36;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 128;

    // gameplay
    this.speed = 90;
    this.health = 300;

    this.x = x;
    this.y = y;

    this.counter = 0;
    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, 128, 0.15, 4, true, this.scale);
}

function Swampy(spritesheetArr, x, y) {

    // animation
    Monster.call(this, spritesheetArr, x, y);

    this.scale = 2;
    this.width = 16;
    this.height = 16;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 64;

    // gameplay
    this.speed = 60;
    this.health = 100;

    this.x = x;
    this.y = y;

    this.counter = 0;
    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, 64, 0.15, 4, true, this.scale);
}

function TinyZombie(spritesheetArr, x, y) {

    // animation

    Monster.call(this, spritesheetArr, x, y);

    this.scale = 1;
    this.width = 16;
    this.height = 16;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 64;

    // gameplay
    this.speed = 85;
    this.health = 60;

    this.x = x;
    this.y = y;

    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, 64, 0.15, 4, true, this.scale);
}

function MaskedOrc(spritesheetArr, x, y) {

    // animation

    Monster.call(this, spritesheetArr, x, y);

    this.scale = 1;
    this.width = 16;
    this.height = 20;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 64;

    // gameplay
    this.speed = 90;
    this.health = 80;

    this.x = x;
    this.y = y;

    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, 64, 0.15, 4, true, this.scale);
}

function Ogre(spritesheetArr, x, y) {

    // animation

    Monster.call(this, spritesheetArr, x, y);

    this.scale = 1;
    this.width = 32;
    this.height = 32;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 128;

    // gameplay
    this.speed = 60;
    this.health = 100;

    this.x = x;
    this.y = y;

    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, 128, 0.15, 4, true, this.scale);
}

function Devil(spritesheetArr, x, y) {

    Monster.call(this, spritesheetArr, x, y);


    // animation
    this.scale = 3;
    this.width = 16;
    this.height = 23;
    this.numOfFrames = 8;
    this.frameLength = .15;
    this.sheetWidth = 128;

    // gameplay
    this.speed = 60;
    this.health = 150;

    this.x = x;
    this.y = y;

    this.counter = 0;
    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, 128, 0.15, 8, true, this.scale);
}

function Acolyte(spritesheetArr, x, y) {

    Monster.call(this, spritesheetArr, x, y);


    // animation
    this.scale = 2;
    this.width = 16;
    this.height = 19;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 64;

    // gameplay
    this.speed = 40;
    this.health = 80;
    this.isRanged = true;


    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, this.sheetWidth,
        this.frameLength, this.numOfFrames, true, this.scale);

    this.x = x;
    this.y = y;

    this.counter = 0;
}

function Zerg_Boss(spritesheetArr, x, y) {
    Monster.call(this, spritesheetArr, x, y);

    // animation
    this.scale = 1.5;
    this.width = 128;
    this.height = 76;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 512;

    // gameplay
    this.speed = 0;
    this.health = 1000;
    this.isRanged = true;

    // boss specific stuff
    this.isBoss = true;
    this.mobArr = [];
    this.mobCount = 0;
    this.lastInfestedPod = 50;
    this.lastSpikeExplosion = 150;


    this.animation = new Animation(spritesheetArr['r'], this.width, this.height, this.sheetWidth,
        this.frameLength, this.numOfFrames, true, this.scale);

    this.boundingbox = new BoundingBox(this.x + 30, this.y + 50,
        this.width * this.scale + 60, this.height * this.scale - 30 ); // **Temporary** Hard coded offset values.
    //abilities
    // spawn zerglings
    // spawn ultralisk
    // spawn ...
    // aoe burst
}

Zerg_Boss.prototype.bossBehavior = function () {
    if (this.lastInfestedPod == 0) {
        new SpawnZerglings();
        this.lastInfestedPod = 420;
    }



    if (this.lastSpikeExplosion == 0) {
        let tarX;
        let tarY;
        if (myPlayer.x < 0) {
            tarX = canvasWidth - Math.abs(myPlayer.x) % canvasWidth;
        } else {
            tarX = Math.abs(myPlayer.x) % canvasWidth;
        }

        if (myPlayer.y < 0) {
            tarY = canvasHeight - Math.abs(myPlayer.y) % canvasHeight;
        } else {
            tarY = Math.abs(myPlayer.y) % canvasHeight;
        }

        for (var i = 0; i < 6; i++) {
            new SpikeExplosion(AM.getAsset("./img/fireball.png"), CAMERA.x + getRandomInt(0, canvasWidth), CAMERA.y + getRandomInt(0, canvasHeight),
                tarX, tarY, 4);
        }

        this.lastSpikeExplosion = 300;
    }
    this.lastInfestedPod--;
    this.lastSpikeExplosion--;
}

