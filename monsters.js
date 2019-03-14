Hydralisk.prototype = Monster.prototype;
Infested.prototype = Monster.prototype;
Ultralisk.prototype = Monster.prototype;
Zergling.prototype = Monster.prototype;
DarkTemplar.prototype = Monster.prototype;
Zealot.prototype = Monster.prototype;
Zerg_Boss.prototype = Monster.prototype;
Templar_Boss.prototype = Monster.prototype;
Archon_Boss.prototype = Monster.prototype;
let DEAD_BB = new BoundingBox(-500000, -500000, 1, 1);

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
    this.isFlippable = true;
    this.deathAnimation = null;
    this.gore = null;
    this.animation = new Animation(spriteSheet, this.width, this.height,
        this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);
    this.deathOffset = 0;
    this.y = y;
    this.x = x;
    this.speed = 100;
    this.accelerationAdj = 0;
    this.originalSpeed = this.speed;
    this.totalHealth = this.health;
    this.health = 100;
    this.scoreIncrease = 1;

    //Movement
    this.velocity = { x: 0, y: 0 };
    this.friction = .5;
    this.baseAcceleration = { x: 1, y: 1 };
    this.accelerationRatio = 1;
    this.accelerationAdj = 0;
    this.deathAudio = new Audio("./audio/zerg/hydra/hydra_death.wav");
    this.attackAudio = new Audio("./audio/zerg/hydra/hydra_attack.wav");


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
        this.speed = this.originalSpeed;
        return;
    }
    this.isPathing = true;
}

Monster.prototype.update = function () {
    if (myPlayer.dead) {
        return;
    }
    // Flipping sprite sheet for monsters depending on if the player is to the left or right.
    if (myPlayer.x > this.x && this.isFlippable) {
        this.right = true;
        this.xBoundingboxOffset = 0;
    } else if (this.isFlippable && !this.isBoss) {
        this.right = false;
        this.xBoundingboxOffset = this.width / 2;
    }


    if (this.isZergBoss) {
        this.zergBossBehavior();
    } else if (this.isArchonBoss) {
        this.archonBossBehavior();
    } else if (this.isTemplarBoss) {
        this.templarBossBehavior();
    } else if (this.isUltra) {
        this.ultraliskBehavior();
    }

    if (this.health <= 0) {
        this.pause = true;
        this.boundingbox = DEAD_BB;
        handleDeathAnimations(this.deathAnimation, this.gore, this.x - this.deathOffset, this.y);
        this.removeFromWorld = true;
        GAME_ENGINE.removeEntity(this);
        if (!myIsMute) {
            this.deathAudio.volume = myCurrentVolume - 0.02;
            console.log(myCurrentVolume - 0.02);
            this.deathAudio.play();
        }
    }
    var dirX, dirY;
    if (this.isPathing) {
        // we've reached our target so stop.
        if (Math.floor(this.x - this.pathX) == 0 && Math.floor(this.y - this.pathY) == 0) {
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
        if (!myIsMute) {
            this.attackAudio.volume = myCurrentVolume - 0.02;
            this.attackAudio.play();
        }
    } else if (this.animation.animationDone) {
        this.animation = this.moveAnimation
    }


    if (this.isRanged) {
        // if we're in range of a player, we can continue to cast at them (based on a cooldown)
        // otherwise we'd just cast when a player's bounding box collides with their vision box.
        if (distance(this) <= 175) {
            // keep track of time since the last cast
            this.pause = true;
            this.animation = this.attackAnimation;

            if (!myIsMute) {
                this.attackAudio.volume = myCurrentVolume - 0.02;
                this.attackAudio.play();
            }
            if (this.animation.animationDone && this.animation == this.attackAnimation) {
                let plLoc = getPlayerLocation();
                console.log("I'm firing");
                if (this.isZerg) {
                    this.castCooldown = 0;
                    let xos = 0;
                    if (this.right) {
                        xos = 40;
                    }
                    var projectile = new Projectile(AM.getAsset("./img/zerg/heavy_shot.png"),
                        this.x + xos, this.y, plLoc.x, plLoc.y, 4, "angle", true);
                    projectile.projectileSpeed = 4;
                    GAME_ENGINE.addEntity(projectile);
                    projectile.penetrative = true;
                } else if (this.isProtoss) {
                    GAME_ENGINE.addEntity(new energyBall(this.x, this.y, plLoc.x, plLoc.y, 4, "angle"));
                }
            }
            this.ticksSinceLastHit++;
        }
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
        this.width * this.scale, this.height * this.scale);


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
    this.isZerg = true;
    this.moveAnimation = new Animation(AM.getAsset("./img/zerg/hydra/hydra_move_right.png"), 50, 50, 1, .03, 7, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/zerg/hydra/hydra_attack_right.png"), 100, 50, 1, .07, 11, true, this.scale);
    this.deathAnimation = new Animation(AM.getAsset("./img/zerg/hydra/hydra_death.png"), 100, 75, 1, .08, 12, false, this.scale);
    this.gore = new Animation(AM.getAsset("./img/gore/hydra.png"), 100, 75, 1, .08, 1, true, this.scale);
    this.deathAudio = new Audio("./audio/zerg/hydra/hydra_death.wav");
    this.attackAudio = new Audio("./audio/zerg/hydra/hydra_attack.wav");
    // gameplay
    this.speed = 120;
    this.health = 70;
    this.isRanged = true;

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
    this.deathAnimation = new Animation(AM.getAsset("./img/zerg/infested/infested_death.png"), 65, 40, 1, .1, 8, true, this.scale);
    this.gore = new Animation(AM.getAsset("./img/gore/infested.png"), 65, 40, 1, 1, 1, true, this.scale);

    // gameplay
    this.speed = 300;
    this.health = 15;
    this.x = x;
    this.y = y;
    this.roomNumber = roomNumber;
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
    this.deathAnimation = new Animation(AM.getAsset("./img/zerg/ultra/ultra_death.png"), 100, 100, 1, .1, 10, false, this.scale);
    this.gore = new Animation(AM.getAsset("./img/gore/ultra.png"), 100, 100, 1, .5, 1, true, this.scale);
    this.deathAudio = new Audio("./audio/zerg/ultra/ultra_death.wav");
    this.attackAudio = new Audio("./audio/zerg/ultra/ultra_attack.wav");
    // gameplay
    this.speed = 175;
    this.health = 150;
    this.x = x;
    this.y = y;
    this.roomNumber = roomNumber;
    this.lastCharge = 150;
    this.isUltra = true;

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

Ultralisk.prototype.ultraliskBehavior = function () {
    if (this.lastCharge < 200) {
        this.isPathing = false;
        this.speed = this.originalSpeed;
    }
    if (this.lastCharge == 0) {
        console.log("I charged");
        chargeTarget(this);
        this.lastCharge = 240;
    }
    this.lastCharge--;
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
    this.deathAnimation = new Animation(AM.getAsset("./img/zerg/zergling/zergling_death.png"), 70, 70, 1, .08, 7, false, this.scale);
    this.gore = new Animation(AM.getAsset("./img/gore/zergling.png"), 70, 70, 1, .5, 1, true, this.scale);
    this.deathAudio = new Audio("./audio/zerg/zergling/zergling_death.wav");
    this.attackAudio = new Audio("./audio/zerg/zergling/zergling_attack.wav");
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
    this.deathAnimation = new Animation(AM.getAsset("./img/protoss/zealot/zealot_death.png"), 54, 72, 1, .2, 7, true, this.scale);
    this.gore = new Animation(AM.getAsset("./img/gore/zealot.png"), 54, 72, 1, .5, 1, true, this.scale);
    this.deathAudio = new Audio("./audio/protoss/zealot/zealot_death.wav");
    this.attackAudio = new Audio("./audio/protoss/zealot/zealot_attack.wav");
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
    this.isRanged = true;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/protoss/dark_templar/dark_templar_move_right.png"), 50, 50, 1, .03, 10, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/protoss/dark_templar/dark_templar_attack_right.png"), 50, 60, 1, .1, 7, true, this.scale);
    this.deathAnimation = new Animation(AM.getAsset("./img/protoss/dark_templar/dark_templar_death.png"), 54, 72, 1, .2, 7, true, this.scale);
    this.gore = new Animation(AM.getAsset("./img/gore/zealot.png"), 54, 72, 1, .5, 1, true, this.scale);
    this.deathAudio = new Audio("./audio/protoss/dark_templar/dark_templar_death.wav");
    this.attackAudio = new Audio("./audio/protoss/dark_templar/dark_templar_attack.wav");
    // gameplay
    this.speed = 150;
    this.health = 90;
    this.x = x;
    this.y = y;
    this.roomNumber = roomNumber;
    this.scoreIncrease = 350;
    this.xBoundingboxOffset = 0;
    this.isProtoss = true;

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
    this.scale = 1;
    this.width = 210;
    this.height = 140;
    this.numOfFrames = 4;
    this.frameLength = .15;
    this.sheetWidth = 1;
    this.isFlippable = false;
    this.xBoundingboxOffset = 0;
    this.deathAudio = new Audio("./audio/zerg/zerg_boss/zerg_boss_death.wav");

    // gameplay
    this.speed = 0;
    this.health = 999;
    this.isRanged = true;

    this.roomNumber = roomNumber;
    // boss specific stuff
    this.isZergBoss = true;
    this.isBoss = true;
    this.mobArr = [];
    this.mobCount = 0;
    this.lastInfestedPod = 50;
    this.lastSpikeExplosion = 150;
    this.scoreIncrease = 2000;
    this.lastHydraSpawn = 350;
    this.lastUltraSpawn = 600;
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

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.
    //abilities
    // spawn zerglings
    // spawn hydra
    // spawn ...
    // aoe burst
}

Zerg_Boss.prototype.zergBossBehavior = function () {
    if (this.lastInfestedPod == 0) {
        new SpawnZerglings(this.roomNumber);
        this.lastInfestedPod = 600;
    }

    if (this.lastHydraSpawn == 0) {
        new SpawnHydra(this.roomNumber);
        this.lastHydraSpawn = 450;
    }

    if (this.lastUltraSpawn == 0) {
        new SpawnUltra(this.roomNumber);
        this.lastUltraSpawn = 1000;
    }

    if (this.health <= 0) {
        // do something when boss is dead
    }

    if (this.lastSpikeExplosion == 0) {
        let coords = getPlayerLocation();
        let tarX = coords.x;
        let tarY = coords.y;

        for (var i = 0; i < 6; i++) {
            new SpikeExplosion(AM.getAsset("./img/zerg/sunken_spike.png"), CAMERA.x + getRandomInt(25, canvasWidth - 25), CAMERA.y + getRandomInt(25, canvasHeight - 25),
                tarX, tarY, 4);
        }
        new spikeStorm(this.x + .5 * this.width, this.y + .5 * this.height);

        this.lastSpikeExplosion = 300;
    }

    this.lastHydraSpawn--;
    this.lastInfestedPod--;
    this.lastSpikeExplosion--;
    this.lastUltraSpawn--;
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
    this.deathAudio = new Audio("./audio/protoss/dark_templar/dark_templar_death.wav");
    this.attackAudio = new Audio("./audio/protoss/dark_templar/dark_templar_attack.wav");
    // gameplay
    this.speed = 100;
    this.health = 1250;
    this.totalHealth = this.health;;
    this.roomNumber = roomNumber;

    // boss specific stuff
    this.isTemplarBoss = true;
    this.lastBallStorm = 600;
    this.mergeTogether = false;
    this.ssFusionFlag = false;

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
            console.log("phase 1 finished");
            this.mergeTogether = true;
            this.otherTemplar.mergeTogether = true;
            this.archonHP = 2 * (this.health + this.otherTemplar.health);
            this.phase = 2;
            this.otherTemplar.phase = 2;
        }
    }

    if (this.phase == 1) {
        if (this.lastBallStorm == 0) {
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
            if (this.ssFusionFlag == false) {
                let that = this;
                let ssFusionAni = new Animation(AM.getAsset("./img/protoss/archon/archon_fusion.png"), 82, 89, 1, .1, 18, false, this.scale);
                let fusionAni = new StillStand(ssFusionAni, ssFusionAni.totalTime * 10, this.x, this.y);
                GAME_ENGINE.addEntity(fusionAni);
                fusionAni.onDeath = function () {
                    console.log("fusion done")
                    let mergedArchon = new Archon_Boss(this.x, this.y, this.roomNumber);
                    mergedArchon.health = that.archonHP;
                    GAME_ENGINE.addEntity(mergedArchon);
                    GAME_ENGINE.removeEntity(that.otherTemplar);
                    GAME_ENGINE.removeEntity(that);
                }
            }
            this.ssFusionFlag = true;


        }
    }
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
    this.deathOffset = 150;
    this.moveAnimation = new Animation(AM.getAsset("./img/protoss/archon/archon_move_right.png"), 82, 89, 1, .03, 15, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/protoss/archon/archon_attack.png"), 82, 89, 1, .1, 10, true, this.scale);
    this.deathAnimation = new Animation(AM.getAsset("./img/protoss/archon/archon_death.png"), 188, 150, 1, .2, 10, true, this.scale);
    this.gore = new Animation(AM.getAsset("./img/gore/archon.png"), 188, 150, 1, 1, 1, true, this.scale);
    this.deathAudio = new Audio("./audio/protoss/archon/archon_death.wav");
    this.attackAudio = new Audio("./audio/protoss/archon/archon_attack.wav");
    // gameplay
    this.speed = 0;
    this.health = 2500
    this.roomNumber = roomNumber;

    // boss specific stuff
    this.bosstimer = 0;
    this.isArchonBoss = true;
    this.isBoss = true;
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
        if (this.aniFlag == false) {
            this.animation = new Animation(AM.getAsset("./img/protoss/archon/archon_attack.png"), 82, 89, 1, .1, 10, true, this.scale);

            if (this.animation.animationDone) {
                this.animation = this.moveAnimation;
                console.log(this.animation);
                this.aniFlag = true;
            }
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
        this.lastBallStorm = getRandomInt(300, 400);
        new ballStorm(this.x, this.y);
    }

    if (this.lastPsiStorm == 0) {
        new psionicStorm();
        this.lastPsiStorm = getRandomInt(450, 700);
    }

    if (this.lastIonBlast == 0) {
        this.lastIonBlast = getRandomInt(250, 400);
        this.ionBlastFlag = true;
    }
    this.lastBallStorm--;
    this.lastIonBlast--;
    this.lastPsiStorm--;
    this.bosstimer++;
}

function Kerrigan(x, y, roomNumber) {
    this.spriteSheet = AM.getAsset("./img/zerg/kerrigan_move_right.png");
    Monster.call(this, this.spriteSheet, x, y, roomNumber);

    this.x = x;
    this.y = y;

    this.scale = 1.75;
    this.width = 82;
    this.height = 89;
    this.numOfFrames = 8;
    this.frameLength = 0.03;
    this.sheetWidth = 1;
    this.moveAnimation = new Animation(AM.getAsset("./img/zerg/kerrigan/kerrigan_move_right.png"), 59, 55, 1, .05, 8, true, this.scale);
    this.attackAnimation = new Animation(AM.getAsset("./img/zerg/kerrigan/kerrigan_attack_right.png"), 59, 55, 1, .2, 8, true, this.scale);
    this.deathAnimation = new Animation(AM.getAsset("./img/zerg/kerrigan/kerrigan_death.png"), 56, 41, 1, .08, 11, true, this.scale);
    this.gore = new Animation(AM.getAsset("./img/gore/kerrigan.png"), 56, 41, 1, .5, 1, true, this.scale);
    this.deathAudio = new Audio("./audio/zerg/kerrigan/kerrigan_death.wav");
    this.attackAudio = new Audio("./audio/zerg/kerrigan/kerrigan_attack.wav");

    // gameplay
    this.speed = 0;
    this.health = 2500
    this.roomNumber = roomNumber;


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

Kerrigan.prototype.KerriganBehavior = function () {

}

function getHealthPercentage(entity) {
    if (entity instanceof Player || entity instanceof Monster) {
        return (entity.health / entity.totalHealth) * 100;
    }
    // not a correct type
    return -1;
}

function getPlayerLocation() {
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


function distance(monster) {
    var dx = myPlayer.x - monster.x;
    var dy = myPlayer.x - monster.y;
    return Math.sqrt(dx * dx, dy * dy);
}

function handleDeathAnimations(death, gore, x, y) {
    if (death != null) {
        console.log("death isn't null");
        let ss1 = new StillStand(death, death.totalTime * 10, x, y);
        if (gore != null) {
            ss1.onDeath = function () {
                GAME_ENGINE.addEntity(new StillStand(gore, 550, x, y));
            };
        }
        GAME_ENGINE.addEntity(ss1);
    }
    console.log(death);
}
