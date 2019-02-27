/* #region Projetile Types */
SwordBoomerang.prototype = Projectile.prototype;
GreaterFireball.prototype = Projectile.prototype;
FlameBreathBolt.prototype = Projectile.prototype;
MultiArrow.prototype = Projectile.prototype;
Spike.prototype = Projectile.prototype;

function SwordBoomerang(spriteSheet, originX, originY, xTarget, yTarget, origin) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, origin/* same number assignment as the ent array*/);
    this.projectileSpeed = 7;
    this.timeLeft = 60;
    this.thrower = null;
    this.speedChange = -7 / 30;
    this.penetrative = true;
    this.damageObj = DS.CreateDamageObject(25, 0, DTypes.Slashing
        , DS.CloneBuffObject(PremadeBuffs.DamageOvertime));
    this.damageObj.timeLeft = 55;
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
    this.damageObj = DS.CreateDamageObject(10, 4, DTypes.Magic
        , DS.CreateBuffObject("lesser burning"
            , [DS.CreateEffectObject(ETypes.CurrentHealthF, -1, 0, 20, 4)]));
    this.childCollide = function (unit) {
        let xPos, yPos, width = height = this.aoe;
        xPos = this.x - 25;
        yPos = this.y - 25;
        let aBox = new BoundingBox(xPos, yPos, width, height);
        let aCrow = new StillStand(this.animationAoe, 10, this.x, this.y);
        aCrow.aniX = -30;
        aCrow.aniY = -20;
        let aHit = DS.CreateDamageObject(15, 2, DTypes.Magic
            , DS.CreateBuffObject("burning"
                , [DS.CreateEffectObject(ETypes.CurrentHealthF, -2, 0, 30, 5)]));
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
    this.damageObj = DS.CreateDamageObject(10, 0, DTypes.Piercing);
    this.animation = new Animation(spriteSheet, 8, 8, 1, .084, 1, true, 2);
    this.aniX += 34;
    this.aniY += 38;
}
/* #endregion */
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
    this.damageObj = DS.CreateDamageObject(10, 0, DTypes.Normal, DS.CloneBuffObject(PremadeBuffs.SlowStrong));
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
    this.damageObj = DS.CreateDamageObject(0, 0, DTypes.None
        , DS.CreateBuffObject("ranger boost", [
            DS.CreateEffectObject(ETypes.MoveSpeedR, Math.pow(1.1, 10), 1, 1, 0),
            DS.CreateEffectObject(ETypes.MoveSpeedR, 1 / 1.1, 1, 100, 10)
        ]));
    this.lifeTime = 120;
}


function RootTrap(spriteSheetUp, spriteSheetDown) {
    Trap.call(this, spriteSheetUp, spriteSheetDown);
    this.damageObj = DS.CreateDamageObject(0, 0, DTypes.None
        , DS.CreateBuffObject("ranger root", [
            DS.CreateEffectObject(ETypes.Stun, true, false, 45, 0),
            DS.CreateEffectObject(ETypes.CurrentHealthF, -1, 0, 45, 3)
        ]));
    this.damageObj.timeLeft = 51;
    this.lifeTime = 300;
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
                    (this.hitOnce) ? null : this.lifeTime = 40;
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
    ss1Ani = new Animation(AM.getAsset("./img/ability/flame_ring_32x160.png"), 32, 32, 1, 0.13, 5, true, 1.5);
    ss2Ani = new Animation(AM.getAsset("./img/ability/flame_explosion_32x320.png"), 32, 32, 1, 0.04, 10, false, 2);
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
        let zergling1 = new TinyZombie({
            'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
            'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
        }, x + getRandomInt(0, 40), y - getRandomInt(0, 50));
        let zergling2 = new TinyZombie({
            'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
            'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
        }, x + getRandomInt(0, 40), y + getRandomInt(0, 40));
        let zergling3 = new TinyZombie({
            'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
            'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
        }, x + getRandomInt(0, 40), y + getRandomInt(10, 20));
        let zergling4 = new TinyZombie({
            'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
            'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
        }, x + getRandomInt(0, 40), y + getRandomInt(0, 40));
        let zergling5 = new TinyZombie({
            'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
            'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
        }, x + getRandomInt(0, 40), y + getRandomInt(0, 40));

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
    ss1Ani = new Animation(spriteSheet, this.width, this.height, 1, .085, 8, true, .75);
    ss1 = new StillStand(ss1Ani, 90, originX, originY);
    GAME_ENGINE.addEntity(ss1);
    ss1.onDeath = function () {
        GAME_ENGINE.addEntity(new Spike(spriteSheet, originX, originY, xTarget, yTarget, origin));
    }


}
let ctr = 0;
function Spike(spriteSheet, originX, originY, xTarget, yTarget, origin) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, origin);
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