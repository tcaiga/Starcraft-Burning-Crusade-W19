/* #region Projetile Types */
SwordBoomerang.prototype = Projectile.prototype;
GreaterFireball.prototype = Projectile.prototype;
FlameBreathBolt.prototype = Projectile.prototype;
MultiArrow.prototype = Projectile.prototype;
Spike.prototype = Projectile.prototype;
Grenade.prototype = Projectile.prototype;

function SwordBoomerang(spriteSheet, originX, originY, xTarget, yTarget, origin) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, origin/* same number assignment as the ent array*/);
    this.projectileSpeed = 7;
    this.timeLeft = 60;
    this.thrower = null;
    this.speedChange = -7 / 30;
    this.penetrative = true;
    // Damage stuff
    this.durationBetweenHits = 50;//Adjustable
    this.totalDamage = 35;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CreateBuffObject("damage overtime", [DS.CreateEffectObject(ETypes.CurrentHealthF,0.4*this.totalDamage/7,0,60,10)]);
    this.damageObj = DS.CreateDamageObject(0.6*this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.childUpdate = function () {
        this.projectileSpeed += this.speedChange;
        this.timeLeft--;
        if (this.thrower !== null && this.timeLeft < 30) {
            if (Math.abs(this.thrower.x - this.x) < 5 && Math.abs(this.thrower.y - this.y) < 5) {
                this.removeFromWorld = true;
            }
            this.angle = Math.atan2(this.y - this.thrower.y, this.x - this.thrower.x);
        }
    }
}

function GreaterFireball(spriteSheet, spriteSheetAoe, originX, originY, xTarget, yTarget, origin) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, origin);
    this.projectileSpeed = 5;
    this.penetrative = false;
    this.aoe = 100;//square
    this.animation = new Animation(spriteSheet, 16, 16, 1, .085, 4, true, 2);
    this.aniX += 23;
    this.aniY += 23;
    this.origin = 5;
    this.animationAoe = new Animation(spriteSheetAoe, 32, 32, 1, .025, 10, false, 3);


    // Damage stuff
    this.durationBetweenHits = 50;//Adjustable
    this.totalDamage = 30;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CreateBuffObject("lesser burning", [DS.CreateEffectObject(ETypes.CurrentHealthF,0.2*this.totalDamage/6,0,20,4)]);
    this.damageObj = DS.CreateDamageObject(0.3*this.totalDamage, 0, DTypes.Magic, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];
    this.damageBuffonExplosion = DS.CreateBuffObject("lesser burning", [DS.CreateEffectObject(ETypes.CurrentHealthF,0.2*this.totalDamage/7,0,30,5)]);
    this.damageObjonExplosion = DS.CreateDamageObject(0.3*this.totalDamage, 0, DTypes.Magic, this.damageBuffonExplosion);
    this.damageObjonExplosion.timeLeft = this.durationBetweenHits;


    this.childCollide = function (unit) {
        let xPos, yPos, width = height = this.aoe;
        xPos = this.x - 25;
        yPos = this.y - 25;
        let aBox = new BoundingBox(xPos, yPos, width, height);
        let aCrow = new StillStand(this.animationAoe, 10, this.x, this.y);
        aCrow.aniX = -30;
        aCrow.aniY = -20;
        let aHit = this.damageObjonExplosion;
        aCrow.boundingbox = aBox;
        aCrow.penetrative = true;
        aCrow.entityHitType = EntityTypes.enemies;
        aCrow.damageObj = aHit;
        GAME_ENGINE.addEntity(aCrow);
    }

}

function FlameBreathBolt(spriteSheet, originX, originY, xTarget, yTarget, origin) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, origin);
    this.range = 90;
    this.damageObj = DS.CreateDamageObject(2.25, 0, DTypes.Magic);
    this.animation = new Animation(spriteSheet, 8, 8, 1, .084, 4, true, 1);
    this.aniX += 34;
    this.aniY += 38;

    // Damage stuff
    this.durationBetweenHits = 50;//Adjustable
    this.totalDamage = 50;//Assuming 30 projectiles 50/30 damage per projectile
    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(0.033*this.totalDamage, 0, DTypes.Magic, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    // Determining where the projectile should go angle wise.
    //radians
    let converter = Math.PI / 360;
    let spread = 90;
    this.angle += spread * converter * Math.random() * ((Math.random() - 0.5 >= 0) ? 1 : -1);
    this.projectileSpeed = Math.random() * 5 + 2;
    this.timeLeft = this.range / this.projectileSpeed;
    this.childUpdate = function () {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
            this.removeFromWorld = true;
        }
    }
}


function MultiArrow(spriteSheet, originX, originY, xTarget, yTarget, origin) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, origin);
    this.xTar = xTarget - 20;
    this.yTar = yTarget - 35;
    // Damage stuff
    this.durationBetweenHits = 50;//Adjustable
    this.totalDamage = 9;//Adjustable per projectile 9*count
    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Piercing, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.animation = new Animation(spriteSheet, 8, 8, 1, .084, 1, true, 2);
    this.aniX += 34;
    this.aniY += 38;
}

function Grenade(spriteSheet, spriteSheetAoe, originX, originY, xTarget, yTarget, origin) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, origin);
    if (xTarget !== 0) {
        this.angle = Math.PI / 2 - xTarget * Math.PI / 2;
    }
    if (yTarget !== 0) {
        this.angle = yTarget * Math.PI / 2;
    }
    this.projectileSpeed = 8;
    this.penetrative = false;
    this.aoe = 100;//square
    if (spriteSheet !== null){
        this.animation = new Animation(spriteSheet, 16, 16, 1, .085, 4, true, 2);
        this.spriteSheet = spriteSheet;
    } else {
        this.spriteSheet = AM.getAsset("./img/terran/bullet.png");
        this.animation = new Animation(AM.getAsset("./img/terran/bullet.png"), 13, 13, 1, .085, 8, true, 1.5);
    }
    this.aniX += 23;
    this.aniY += 23;
    this.origin = origin;
    if (spriteSheetAoe !== null){
        this.animationAoe = new Animation(spriteSheetAoe, 32, 32, 1, .025, 10, false, 3);
    } else {
        this.animationAoe = new Animation(AM.getAsset("./img/zerg/ultra/ultra_death.png"), 100, 100, 1, .03, 9, false, 1);
    }
    this.direction = "angle";

    // Damage stuff
    this.totalDamage = 3;//Adjustable
    this.knockBackDuration = 15;//Adjustable
    this.damageObjArr = [];
    let aX = this.x;
    let aY = this.y;
    this.knockBackFunc = function (unit) {//buff obj calls this
        if (unit.isBoss){

        } else {
            let angle = Math.atan2(unit.y - aY, unit.x - aX);
            let knockBackAmount = 6;
            unit.x += Math.cos(angle) * knockBackAmount;
            unit.y += Math.sin(angle) * knockBackAmount;
        }
    }
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(0, 0, DTypes.None, this.damageBuff);
    this.damageObj.timeLeft = 10;
    this.buffObj = [];
    this.counters = 0;
    this.damageBuffonExplosion = DS.CreateBuffObject("knock back",
        [DS.CreateEffectObject(ETypes.None, 0, 0, this.knockBackDuration, 0, this.knockBackFunc)
            , DS.CreateEffectObject(ETypes.Stun, true, false, this.knockBackDuration, 0)]);;
    this.damageObjonExplosion = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Bludgeoning, this.damageBuffonExplosion);
    this.damageObjonExplosion.timeLeft = 10;
    this.direction = "angle";
    this.childUpdate = function () {
        this.counters++;
        if (this.angle === Math.PI || this.angle === 0){
            this.y += 3*Math.sin(this.counters/3);
        } else {
            this.x += 3*Math.sin(this.counters/3);
        }
    }

    this.childCollide = function (unit) {
        let xPos, yPos, width = height = this.aoe;
        xPos = this.x - 25;
        yPos = this.y - 25;
        let aBox = new BoundingBox(xPos, yPos, width, height);
        let aCrow = new StillStand(this.animationAoe, 10, this.x, this.y);
        aCrow.onCollide = function (unit) {
            //console.log(unit);
        }
        aCrow.aniX = -30;
        aCrow.aniY = -20;
        let aHit = this.damageObjonExplosion;
        aCrow.boundingbox = aBox;
        aCrow.penetrative = true;
        aCrow.entityHitType = EntityTypes.enemies;
        aCrow.damageObj = aHit;
        GAME_ENGINE.addEntity(aCrow);

    }

}

/* #endregion */

/* #region Trap */
/* #region Base Trap */
function Trap(spriteSheetUp, spriteSheetDown, theX, theY) {
    this.animationUp = new Animation(spriteSheetUp, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationDown = new Animation(spriteSheetDown, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationIdle = this.animationUp;
    this.x = theX; // Hardcorded temp spawn
    this.y = theY; // Hardcorded temp spawn
    this.activated = false; // Determining if trap has been activated
    this.counter = 0; // Counter to calculate when trap related events should occur
    this.doAnimation = false; // Flag to determine if the spikes should animate or stay still

    // Damage stuff
    this.durationBetweenHits = 30;//Adjustable
    this.totalDamage = 10;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = DS.CloneBuffObject(PremadeBuffs.SlowStrong);
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.onUpdate;
    this.onDraw;
    this.boundingbox = new BoundingBox(this.x, this.y, 20, 20); // **Temporary** hardcode of width and height
}

Trap.prototype.draw = function () {
    if (!this.activated) {
        this.animationIdle.drawFrameIdle(GAME_ENGINE.ctx, this.x, this.y);
    } else {
        if (this.doAnimation) {
            this.animationUp.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x, this.y);
        } else {
            this.animationDown.drawFrameIdle(GAME_ENGINE.ctx, this.x, this.y);
        }
    }
    (typeof this.onDraw === 'function') ? this.onDraw() : null;
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = color_red;
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height); // **Temporary** Hard coded offset values
    }
}

Trap.prototype.update = function () {
    (typeof this.onUpdate === 'function') ? this.onUpdate() : null;
    if (typeof this.lifeTime !== 'undefined') {
        if (this.lifeTime <= 0) {
            this.removeFromWorld = true;
        } else {
            this.lifeTime--;
        }
    }
    if (typeof this.onUpdate != 'function') {
        if (this.boundingbox.collide(myPlayer.boundingbox)) {
            // Remember what tick the collision happened
            this.counter += GAME_ENGINE.clockTick;
            // Check to make sure the animation happens first
            if (this.counter < .1) {
                this.doAnimation = true;
            } else { // Else keep the spikes up as the player stands over the trap
                this.doAnimation = false;
                // Nuke the player, but start the damage .13 ticks after they stand on the trap
                // This allows players to sprint accross taking 10 damage
                if (myPlayer.health > 0 && this.counter > 0.18) {
                    //myPlayer.currentHealth -= 2;
                    this.damageObj.ApplyEffects(myPlayer);
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
/* #endregion */

/* #region Trap Types */
RangerBoostPad.prototype = Trap.prototype;
RootTrap.prototype = Trap.prototype;

function RangerBoostPad(spriteSheetUp, spriteSheetDown) {
    Trap.call(this, spriteSheetUp, spriteSheetDown);
    //No damage
    this.damageObj = DS.CreateDamageObject(0, 0, DTypes.None
        , DS.CreateBuffObject("ranger boost", [
            DS.CreateEffectObject(ETypes.MoveSpeedR, Math.pow(1.1, 10), 1, 1, 0),
            DS.CreateEffectObject(ETypes.MoveSpeedR, 1 / 1.1, 1, 100, 10)
        ]));
    this.lifeTime = 120;
}


function RootTrap(spriteSheetUp, spriteSheetDown) {
    Trap.call(this, spriteSheetUp, spriteSheetDown);

    // Damage stuff
    this.durationBetweenHits = 55;//Adjustable
    this.totalDamage = 24;//Adjustable
    this.rootDuration = 45;
    this.onGroundDuration = 300;
    this.damageObjArr = [];
    this.damageBuff = DS.CreateBuffObject("ranger root", [
        DS.CreateEffectObject(ETypes.Stun, true, false, this.rootDuration, 0),
        DS.CreateEffectObject(ETypes.CurrentHealthF, this.totalDamage/16, 0, 45, 3)]);
    this.damageObj = DS.CreateDamageObject(0*this.totalDamage, 0, DTypes.Normal, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.lifeTime = this.onGroundDuration;
    this.hitOnce = false;
    this.removeFromWorld = false;
    this.animationUp = new Animation(spriteSheetUp, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationDown = new Animation(spriteSheetDown, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationIdle = this.animationUp;
    this.onUpdate = function () {
        this.doAnimation = false;
        this.activated = false;
        for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
            var entityCollide = GAME_ENGINE.entities[4][i];
            if (this.boundingbox.collide(entityCollide.boundingbox)) {
                if (GAME_ENGINE.entities[4][i].health > 0) {
                    this.doAnimation = true;
                    this.activated = true;
                    (this.hitOnce) ? null : this.lifeTime = this.durationBetweenHits-5;
                    this.hitOnce = true;
                    (typeof this.childCollide === 'function') ? this.childCollide(entityCollide) : null;
                    this.damageObj.ApplyEffects(GAME_ENGINE.entities[4][i]);
                    this.removeFromWorld = (this.penetrative) ? false : true;
                }
            }
        }
    }

}
/* #endregion */
/* #endregion */

/* #region Still Stand */
function StillStand(animation, duration, theX, theY) {
    this.timeLeft = duration;
    this.ani = animation;
    this.boundingbox;
    this.damageObj;
    this.entityHitType;
    this.penetrative;
    this.onDraw;
    this.onUpdate;
    this.onCollide;
    this.onDeath;

    this.x = theX;
    this.y = theY;
    this.width;
    this.height;
    this.aniX = 0;
    this.aniY = 0;
    Entity.call(this, GAME_ENGINE, theX, theY);
}

StillStand.prototype.update = function () {
    (typeof this.onUpdate === 'function') ? this.onUpdate() : null;
    this.timeLeft--;
    if (this.timeLeft <= 0) {
        (typeof this.onDeath === 'function') ? this.onDeath() : null;
        this.removeFromWorld = true;
    }
    if (typeof this.boundingbox !== 'undefined' && typeof this.entityHitType !== 'undefined') {
        for (var i = 0; i < GAME_ENGINE.entities[this.entityHitType].length; i++) {
            var entityCollide = GAME_ENGINE.entities[this.entityHitType][i];
            if (this.boundingbox.collide(entityCollide.boundingbox)) {
                if (GAME_ENGINE.entities[this.entityHitType][i].health > 0) {
                    (typeof this.onCollide === 'function') ? this.onCollide(entityCollide) : null;
                    this.damageObj.ApplyEffects(GAME_ENGINE.entities[this.entityHitType][i]);
                    this.removeFromWorld = (this.penetrative && !this.removeFromWorld) ? false : true;
                }
            }
        }
    }
}
StillStand.prototype.draw = function () {
    (typeof this.onDraw === 'function') ? this.onDraw() : null;
    (typeof this.boundingbox !== 'undefined' && GAME_ENGINE.debug) ? function () {
        GAME_ENGINE.ctx.strokeStyle = color_yellow;
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);
    } : null;
    this.ani.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x + this.aniX, this.y + this.aniY);
}
/* #endregion */

/* #region Spawn Pool abilities */
function SpawnZerglings() {
    ss1Ani = new Animation(AM.getAsset("./img/fireball.png"), 32, 32, 1, 0.13, 5, true, 1.5);
    ss2Ani = new Animation(AM.getAsset("./img/fireball.png"), 32, 32, 1, 0.04, 10, false, 2);
    ss1 = new StillStand(ss1Ani, 60, myPlayer.x, myPlayer.y);
    ss1.ssAni = ss2Ani;
    ss1.width = 50;
    ss1.height = 50;
    ss1.aniX = -32 * 1.5 / 2 + 12;
    ss1.aniY = -32 * 1.5 / 2 + 22;
    let x = myPlayer.x;
    let y = myPlayer.y;

    GAME_ENGINE.addEntity(ss1);

    ss1.onDeath = function () {
        // create 5 zerglings at a random area within 50px of the player
        // after a 2s delay from a graphic being placed.
        let zergling1 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x + getRandomInt(0, 40), y - getRandomInt(0, 50));
        let zergling2 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x + getRandomInt(0, 40), y - getRandomInt(0, 50));
        let zergling3 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x + getRandomInt(0, 40), y - getRandomInt(0, 50));
        let zergling4 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x + getRandomInt(0, 40), y - getRandomInt(0, 50));
        let zergling5 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x + getRandomInt(0, 40), y - getRandomInt(0, 50));
        
        GAME_ENGINE.addEntity(zergling1);
        GAME_ENGINE.addEntity(zergling2);
        GAME_ENGINE.addEntity(zergling3);
        GAME_ENGINE.addEntity(zergling4);
        GAME_ENGINE.addEntity(zergling5);
    }

}

function SpikeExplosion(spriteSheet, originX, originY, xTarget, yTarget, origin) {
    this.width = 100;
    this.height = 100;
    ss1Ani = new Animation(spriteSheet, this.width, this.height, 1, .25, 6, true, .75);
    ss1 = new StillStand(ss1Ani, 90, originX, originY);
    GAME_ENGINE.addEntity(ss1);
    ss1.onDeath = function () {
        GAME_ENGINE.addEntity(new Spike(originX, originY, xTarget, yTarget, origin));
    }


}
let ctr = 0;
function Spike(originX, originY, xTarget, yTarget, origin) {
    this.spriteSheet = AM.getAsset("./img/terran/bullet.png");
    Projectile.call(this, this.spriteSheet, originX, originY, xTarget, yTarget, origin, "angle");

    // Damage stuff
    this.durationBetweenHits = 50;//Adjustable
    this.totalDamage = 15;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Piercing, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];
    this.projectileSpeed = 5;
    this.penetrative = false;
    ctr++;
}


// for ability stuff
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
/* #endregion */