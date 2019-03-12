Hydralisk.prototype = Monster.prototype;
Infested.prototype = Monster.prototype;
Ultralisk.prototype = Monster.prototype;
Zergling.prototype = Monster.prototype;
DarkTemplar.prototype = Monster.prototype;
Zealot.prototype = Monster.prototype;
Zerg_Boss.prototype = Monster.prototype;
Templar_Boss.prototype = Monster.prototype;
Archon_Boss.prototype = Monster.prototype;

function Monster(spriteSheet, x, y, roomNumber) {
    Entity.call(this, GAME_ENGINE, 0, 350);

    // Room check stuff
    this.roomNumber = roomNumber;
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
    this.tickCount = 0;

    // animation stuff
    this.xScale = 1;
    this.right = true;
    this.numOfFrames = 15;
    this.frameLength = .15;
    this.sheetWidth = 1;
    this.scale = 1;
    this.width = 40;
    this.height = 56;
    this.animation = new Animation(spriteSheet, this.width, this.height,
        this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);

    this.y = y;
    this.x = x;
    this.speed = 100;
    this.totalHealth = this.health;
    this.health = 100;
    this.scoreIncrease = 1;
    //Movement
    this.velocity = { x: 0, y: 0 };
    this.friction = .5;
    this.baseAcceleration = { x: 1, y: 1 };
    this.accelerationRatio = 1;
    this.accelerationAdj = 0;


    // Damage stuff
    // Changed in each monster
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 20;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CloneBuffObject(PremadeBuffs.HasteWeak/*Adjustable*/);//Slow or haste or null w/e
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.counter = 0;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.

    this.visionBox = new BoundingBox(this.boundingbox.x - .5 * (this.width * this.scale - this.visionWidth),
        this.boundingbox.y - .5 * (this.height * this.scale - this.visionWidth),
        this.visionWidth, this.visionHeight);
}

Monster.prototype.draw = function () {
    this.xScale = 1;
    var xValue = this.x;
    
    if (!this.right) {
        GAME_ENGINE.ctx.save();
        GAME_ENGINE.ctx.scale(-1, 1);
        this.xScale = -1;
        xValue = -this.x - this.width;
    }

    this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
    GAME_ENGINE.ctx.restore();
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = "red";
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
             this.boundingbox.width, this.boundingbox.height);
        GAME_ENGINE.ctx.strokeStyle = "purple";
        GAME_ENGINE.ctx.strokeRect(this.visionBox.x, this.visionBox.y,
            this.visionBox.width, this.visionBox.height);
    }

    // Displaying Monster health
    GAME_ENGINE.ctx.font = "15px Starcraft";
    GAME_ENGINE.ctx.fillStyle = "white";
    GAME_ENGINE.ctx.fillText("Health: " + Math.floor(this.health), this.x - 5 - CAMERA.x, this.y - 5 - CAMERA.y);
}

Monster.prototype.pathTo = function (x, y) {
    this.pathX = x;
    this.pathY = y;
    // we've reached our target so stop.
    if (Math.floor(this.x - this.pathX) == 0 && Math.floor(this.y - this.pathY) == 0) {
        this.isPathing = false;
        return;
    }
    this.isPathing = true;
}

function distance(monster) {
    var dx = myPlayer.x - monster.x;
    var dy = myPlayer.x - monster.y;
    return Math.sqrt(dx * dx, dy * dy);
}

Monster.prototype.update = function () {
    // Flipping sprite sheet for monsters depending on if the player is to the left or right.
    if (myPlayer.x > this.x) {
        this.right = true;
        this.xBoundingboxOffset = 0;
    } else {
        this.right = false;
        this.xBoundingboxOffset = this.width / 2;
    }


    if (this.isZergBoss) {
        this.zergBossBehavior();
    } else if (this.isArchonBoss) {
        this.archonBossBehavior();
    } else if (this.isTemplarBoss) {
        this.templarBossBehavior();
    }

    if (this.health <= 0) {
        this.removeFromWorld = true;
        GAME_ENGINE.removeEntity(this);
    }
    var dirX, dirY;
    if (this.isPathing) {
        // we've reached our target so stop.
        if (Math.floor(this.x - this.pathX) == 0 && Math.floor(this.y - this.pathY) == 0 ) {
            this.isPathing = false;
        }
        dirX = this.pathX - this.x;
        dirY = this.pathY - this.y;
    } else {
        // get the direction vector pointing towards player
        dirX = myPlayer.x - this.x;
        dirY = myPlayer.y - this.y;
    }


    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        this.animation = this.attackAnimation;
        if (this.isInfested) {
            if (this.animation.animationDone) {
                this.health = 0;
                this.tickCount = 0;
                this.damageObj.ApplyEffects(myPlayer);
            }
            this.tickCount += GAME_ENGINE.clockTick;
        } else {
            this.counter += GAME_ENGINE.clockTick;
            this.damageObj.ApplyEffects(myPlayer);
            this.pause = true;
            if (this.counter > .018 && myPlayer.health > 0) {
                //player.health -= 5;
                this.counter = 0;
            }
        }
    } else if (this.animation.animationDone) {
        this.animation = this.moveAnimation
    }

    // based on the number of ticks since the player was last hit, we pause the monster
    if (this.pause == false && !this.isStunned) {
        // get the distance from the player
        var dis = Math.sqrt(dirX * dirX + dirY * dirY);
        // nomralize the vector
        dirX = dirX / dis;
        dirY = dirY / dis;

        //New movement with acceleration/velocity
        //Speed shift calculation
        let speedShift = {
            x: this.baseAcceleration.x * this.accelerationRatio + this.accelerationAdj
            , y: this.baseAcceleration.y * this.accelerationRatio + this.accelerationAdj
        };

        //Friction
        this.velocity.x = (this.velocity.x < .1 && this.velocity.x > -.1) ? 0 : this.velocity.x - Math.sign(this.velocity.x) * this.friction;
        this.velocity.y = (this.velocity.y < .1 && this.velocity.y > -.1) ? 0 : this.velocity.y - Math.sign(this.velocity.y) * this.friction;

        //Application of acceleration
        this.velocity.x += dirX * (speedShift.x);
        this.velocity.y += dirY * (speedShift.y);

        //Check max
        this.velocity.x = (Math.abs(this.velocity.x) > this.speed / 100) ? Math.sign(this.velocity.x) * this.speed / 100 : this.velocity.x;
        this.velocity.y = (Math.abs(this.velocity.y) > this.speed / 100) ? Math.sign(this.velocity.y) * this.speed / 100 : this.velocity.y;
        let mag = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
        if (mag > (this.speed / 100)) {//Circle max movespeed
            this.velocity.x = (this.speed / 100) * this.velocity.x / mag;
            this.velocity.y = (this.speed / 100) * this.velocity.y / mag;
        }

        //Application of velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // change x and y based on our vector
        //this.x += dirX * (this.speed / 100);
        //this.y += dirY * (this.speed / 100);
    } else {
        this.ticksSinceLastHit += 1;
        if (this.ticksSinceLastHit >= 60) {
            this.pause = false;
            ticksSinceLastHit = 0;
        }
    }

    Entity.prototype.update.call(this);

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

    this.boundingbox = new BoundingBox(this.x - this.xBoundingboxOffset, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.


    this.visionBox = new BoundingBox(this.boundingbox.x + .5 * (this.width * this.scale - this.visionWidth),
        this.boundingbox.y + .5 * (this.height * this.scale - this.visionWidth),
        this.visionWidth, this.visionHeight);
}

Monster.prototype.changeHealth = function (amount) {
    if (amount > 0) {
        //display healing animation
        //maybe have a health change threshold 
        //to actually have it display
    } else if (amount <= 0) {
        //display damage animation
        //maybe have a health change threshold 
        //to actually have it display
    }
    this.health += amount;//Healing will come in as a positive number
    if (this.health <= 0) {
        myScore += this.scoreIncrease;
        document.getElementById("score").innerHTML = myScore;
    }
}
/* #endregion */

/* #region Monster Types */

function Hydralisk(spriteSheet, x, y, roomNumber) {
    Monster.call(this, spriteSheet, x, y, roomNumber);

    // animation
    this.scale = 1.5;
    this.width = 50;
    this.height = 50;
    this.numOfFrames = 7;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/zerg/hydra/hydra_move_right.png"), 50, 50, 1, .03, 7, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/zerg/hydra/hydra_attack_right.png"), 100, 50, 1, .05, 11, true, this.scale);

    // gameplay
    this.speed = 200;
    this.health = 45;

    this.x = x;
    this.y = y;
    this.roomNumber = roomNumber;
    this.xBoundingboxOffset = 0;
    this.scoreIncrease = 200;
    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 15;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CloneBuffObject(PremadeBuffs.SlowWeak/*Adjustable*/);//Slow or haste or null w/e
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.counter = 0;
    this.animation = new Animation(spriteSheet, this.width, this.height, this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
}

function Infested(spriteSheet, x, y, roomNumber) {
    Monster.call(this, spriteSheet, x, y, roomNumber);


    // animation
    this.scale = 1.5;
    this.width = 40;
    this.height = 40;
    this.numOfFrames = 8;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/zerg/infested/infested_move_right.png"), 40, 40, 1, .03, 8, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/zerg/infested/infested_boom.png"), 85, 65, 1, .03, 10, true, this.scale);

    // gameplay
    this.speed = 300;
    this.health = 15;
    this.x = x;
    this.y = y;
    this.isInfested = true;
    this.scoreIncrease = 50;
    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 15;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CloneBuffObject(PremadeBuffs.HasteWeak/*Adjustable*/);//Slow or haste or null w/e
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.counter = 0;
    this.animation = new Animation(spriteSheet, this.width, this.height, this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
}

Infested.prototype.infestedBehavior = function () {

}

function Ultralisk(spriteSheet, x, y, roomNumber) {
    Monster.call(this, spriteSheet, x, y, roomNumber);


    // animation
    this.scale = 1.5;
    this.width = 100;
    this.height = 100;
    this.numOfFrames = 9;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/zerg/ultra/ultra_move_right.png"), 100, 100, 1, .03, 9, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/zerg/ultra/ultra_attack_right.png"), 100, 100, 1, .1, 6, true, this.scale);

    // gameplay
    this.speed = 175;
    this.health = 150;
    this.x = x;
    this.y = y;
    this.roomNumber = roomNumber;
    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 30;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CloneBuffObject(PremadeBuffs.HasteWeak/*Adjustable*/);//Slow or haste or null w/e
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.counter = 0;
    this.animation = new Animation(spriteSheet, this.width, this.height, this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
}

function Zergling(spriteSheet, x, y, roomNumber) {
    Monster.call(this, spriteSheet, x, y, roomNumber);


    // animation
    this.scale = 1.5;
    this.width = 40;
    this.height = 40;
    this.numOfFrames = 7;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), 40, 40, 1, .03, 7, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/zerg/zergling/zergling_attack_right.png"), 40, 40, 1, .05, 5, true, this.scale);

    // gameplay
    this.speed = 200;
    this.health = 30;
    this.x = x;
    this.y = y;
    this.roomNumber = roomNumber;
    this.scoreIncrease = 30;
    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 4;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CloneBuffObject(PremadeBuffs.HasteWeak/*Adjustable*/);//Slow or haste or null w/e
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.counter = 0;
    this.animation = new Animation(spriteSheet, this.width, this.height, this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
}

function Zealot(spriteSheet, x, y, roomNumber) {
    Monster.call(this, spriteSheet, x, y, roomNumber);


    // animation
    this.scale = 1.5;
    this.width = 50;
    this.height = 50;
    this.numOfFrames = 7;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/protoss/zealot/zealot_move_right.png"), 50, 50, 1, .03, 7, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/protoss/zealot/zealot_attack_right.png"), 50, 50, 1, .06, 5, true, this.scale);

    // gameplay
    this.speed = 200;
    this.health = 45;
    this.x = x;
    this.y = y;
    this.roomNumber = roomNumber;
    this.scoreIncrease = 100;
    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 4;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CloneBuffObject(PremadeBuffs.HasteWeak/*Adjustable*/);//Slow or haste or null w/e
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.counter = 0;
    this.animation = new Animation(spriteSheet, this.width, this.height, this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
}

function DarkTemplar(spriteSheet, x, y, roomNumber) {
    Monster.call(this, spriteSheet, x, y, roomNumber);


    // animation
    this.scale = 1.5;
    this.width = 50;
    this.height = 50;
    this.numOfFrames = 10;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/protoss/dark_templar/dark_templar_move_right.png"), 50, 50, 1, .03, 10, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/protoss/dark_templar/dark_templar_attack_right.png"), 50, 60, 1, .07, 7, true, this.scale);

    // gameplay
    this.speed = 200;
    this.health = 90;
    this.x = x;
    this.y = y;
    this.roomNumber = roomNumber;
    this.scoreIncrease = 350;
    this.xBoundingboxOffset = 0;
    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 4;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CloneBuffObject(PremadeBuffs.HasteWeak/*Adjustable*/);//Slow or haste or null w/e
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.counter = 0;
    this.animation = new Animation(spriteSheet, this.width, this.height, this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
}

function Zerg_Boss(spriteSheet, x, y, roomNumber) {
    Monster.call(this, spriteSheet, x, y, roomNumber);

    // animation
    this.scale = 1.5;
    this.width = 100;
    this.height = 75;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 1;
    this.xBoundingboxOffset = 0;
    // gameplay
    this.speed = 0;
    this.health = 600;
    this.isRanged = true;
    this.roomNumber = roomNumber;
    // boss specific stuff
    this.isZergBoss = true;
    this.mobArr = [];
    this.mobCount = 0;
    this.lastInfestedPod = 50;
    this.lastSpikeExplosion = 150;
    this.scoreIncrease = 2000;
    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 10;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];


    this.animation = new Animation(spriteSheet, this.width, this.height, this.sheetWidth,
        this.frameLength, this.numOfFrames, true, this.scale);
    this.moveAnimation = this.animation;
    this.attackAnimation = this.animation;

    this.boundingbox = new BoundingBox(this.x + 30, this.y + 50,
        this.width * this.scale + 60, this.height * this.scale - 30); // **Temporary** Hard coded offset values.
    //abilities
    // spawn zerglings
    // spawn ultralisk
    // spawn ...
    // aoe burst
}

Zerg_Boss.prototype.zergBossBehavior = function () {
    if (this.lastInfestedPod == 0) {
        new SpawnZerglings();
        this.lastInfestedPod = 600;
    }

    if (this.health <= 0) {
        // do something when boss is dead
    }

    console.log("I'm doing something");
    if (this.lastSpikeExplosion == 0) {
        let tarX;
        let tarY;
        if (myPlayer.x < 0) {
            tarX = canvasWidth - Math.abs(myPlayer.x) % canvasWidth;
        } else {
            tarX = myPlayer.x;
        }

        if (myPlayer.y < 0) {
            tarY = canvasHeight - Math.abs(myPlayer.y) % canvasHeight;
        } else {
            tarY = myPlayer.y;
        }

        for (var i = 0; i < 6; i++) {
            new SpikeExplosion(AM.getAsset("./img/zerg/sunken_spike.png"), CAMERA.x + getRandomInt(25, canvasWidth - 25), CAMERA.y + getRandomInt(25, canvasHeight - 25),
                tarX, tarY, 4);
        }

        // <TEST>
        new ballStorm(CAMERA.x + canvasWidth / 2, CAMERA.y + canvasHeight / 2);

        this.lastSpikeExplosion = 300;
    }
    this.lastInfestedPod--;
    this.lastSpikeExplosion--;
}

function Templar_Boss(x, y, roomNumber, otherTemplar) {
    this.spriteSheet = AM.getAsset("./img/protoss/dark_templar/dark_templar_move_right.png");
    Monster.call(this, this.spriteSheet, x, y, roomNumber);
    if (otherTemplar != null && otherTemplar instanceof Monster) {
        this.otherTemplar = otherTemplar;
    }


    this.x = x;
    this.y = y;

    this.phase = 1;
    this.scale = 1.5;
    this.width = 50;
    this.height = 50;
    this.numOfFrames = 10;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/protoss/dark_templar/dark_templar_move_right.png"), 50, 50, 1, .03, 10, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/protoss/dark_templar/dark_templar_attack_right.png"), 50, 60, 1, .07, 7, true, this.scale);

    // gameplay
    this.speed = 100;
    this.health = 1250;
    this.totalHealth = this.health;
    this.isRanged = true;
    this.roomNumber = roomNumber;

    // boss specific stuff
    this.isTemplarBoss = true;
    this.lastBallStorm = 600;
    this.mergeTogether = false;

    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 10;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];


    this.animation = this.moveAnimation;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale);
}

Templar_Boss.prototype.templarBossBehavior = function () {

    // check the hp and then determine if it's time for intermission
    if (this.otherTemplar instanceof Monster) {
        // if either of the templars hp % is <= 20, initiate merge
        if ((getHealthPercentage(this.otherTemplar) <= 20 || getHealthPercentage(this) <= 20) && this.mergeTogether == false) {
            this.mergeTogether = true;
            this.otherTemplar.mergeTogether = true;
            this.archonHP = 2 * (this.health + this.otherTemplar.health);
            this.phase = 2;
            this.otherTemplar.phase = 2;
        }
    }

    if (this.phase == 1) {
        if (this.lastBallStorm == 0) {
            console.log("ballstorm fired");
            new ballStorm(this.x, this.y);
            this.lastBallStorm = 300;
        }
        // intermission
    } else if (this.phase == 2) {
        this.pathTo(CAMERA.x + .5 * canvasWidth, CAMERA.y + .5 * canvasHeight);
        if (Math.floor(this.x - (CAMERA.x + .5 * canvasWidth)) <= 2 && Math.floor(this.y - (CAMERA.y + .5 * canvasHeight)) <= 2) {
            this.phase = 3;
            this.isPathing = false;
        }
    } else if (this.phase == 3) {
        if (this.otherTemplar instanceof Monster) {
            let mergedArchon = new Archon_Boss(this.x, this.y, this.roomNumber);
            GAME_ENGINE.addEntity(mergedArchon);
            mergedArchon.health = this.archonHP;
            GAME_ENGINE.removeEntity(this.otherTemplar);
            GAME_ENGINE.removeEntity(this);
        }
    }
    console.log("phase " + this.phase);
    this.lastBallStorm--;
}

function Archon_Boss(x, y, roomNumber) {
    console.log("I have arrived");
    this.spriteSheet = AM.getAsset("./img/protss/high_templar/high_templar_attack_left.png");
    Monster.call(this, this.spriteSheet, x, y, roomNumber);

    this.x = x;
    this.y = y;

    this.scale = 1.75;
    this.width = 82;
    this.height = 89;
    this.numOfFrames = 10;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/protoss/archon/archon_move_right.png"), 82, 89, 1, .03, 15, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/protoss/archon/archon_attack.png"), 82, 89, 1, .1, 10, true, this.scale);

    // gameplay
    this.speed = 0;
    this.health = 2500
    this.isRanged = true;
    this.roomNumber = roomNumber;

    // boss specific stuff
    this.bosstimer = 0;
    this.isArchonBoss = true;
    this.lastIonBlast = 500;
    this.lastPsiStorm = 600;
    this.lastBallStorm = 150;
    this.ionBlastFlag = false;
    this.ebCount = 0;
    this.aniFlag = false;

    // Damage stuff
    this.durationBetweenHits = 40;//Adjustable
    this.totalDamage = 10;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];


    this.animation = this.moveAnimation;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale);

}

Archon_Boss.prototype.archonBossBehavior = function () {

    if (this.ionBlastFlag) {
        // make an energy ball to mimic a thick ion beam every 3 ticks
        console.log(this.aniFlag);
        if (this.aniFlag == false) {
            this.animation = new Animation(AM.getAsset("./img/protoss/archon/archon_attack.png"), 82, 89, 1, .1, 10, true, this.scale);
            this.aniFlag = true;
        }
        if (this.bosstimer % 5 == 0) {
            let playerLoc = getPlayerLocation();
            let eb = new energyBall(this.x, this.y + 40, playerLoc.x, playerLoc.y, 4, "angle");
            eb.projectileSpeed = 6;
            GAME_ENGINE.addEntity(eb);
            this.ebCount++;
        }

        if (this.ebCount > 14) {
            this.ionBlastFlag = false;
            this.ebCount = 0;
            this.aniFlag = false;
        }
    }
    if (this.lastBallStorm == 0) {
        this.lastBallStorm = getRandomInt(250, 400);
        new ballStorm(this.x, this.y);
    }

    if (this.lastPsiStorm == 0) {
        this.lastPsiStorm = getRandomInt(450, 700);
    }

    if (this.lastIonBlast == 0) {
        console.log("pew pew");
        this.lastIonBlast = getRandomInt(250, 400);
        this.ionBlastFlag = true;
    }
    this.lastBallStorm--;
    this.lastIonBlast--;
    this.lastPsiStorm--;
    this.bosstimer++;
}

function getHealthPercentage(entity) {
    if (entity instanceof Player || entity instanceof Monster) {
        return (entity.health / entity.totalHealth) * 100;
    }
    // not a correct type
    return -1;
}

function getPlayerLocation (){
    let tarX;
    let tarY;

    tarY = myPlayer.y;
    tarX = myPlayer.x;

    //if (myPlayer.x < 0) {
    //    tarX = canvasWidth - Math.abs(myPlayer.x) % canvasWidth;
    //} else {
        
    //}

    //if (myPlayer.y < 0) {
    //    tarY = canvasHeight - Math.abs(myPlayer.y) % canvasHeight;
    //} else {
    //}
    return {
        x: tarX,
        y: tarY
    };
}