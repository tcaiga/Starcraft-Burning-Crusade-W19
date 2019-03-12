/* #region Projetile Types */
Grenade.prototype = Projectile.prototype;
FireRound.prototype = Projectile.prototype;

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
        this.animation = new Animation(spriteSheet, 20, 20, 1, .085, 1, true, 1.5);
        this.spriteSheet = spriteSheet;
    } else {
        if (myPlayer.shootDirection === "up") {
            this.spriteSheet = AM.getAsset("./img/terran/abilities/rocket/rocket_up.png");
        } else if (myPlayer.shootDirection === "down") {
            this.spriteSheet = AM.getAsset("./img/terran/abilities/rocket/rocket_down.png");
        } else if (myPlayer.shootDirection === "left") {
            this.spriteSheet = AM.getAsset("./img/terran/abilities/rocket/rocket_left.png");
        } else if (myPlayer.shootDirection === "right") {
            this.spriteSheet = AM.getAsset("./img/terran/abilities/rocket/rocket_right.png");
        }
        this.animation = new Animation(this.spriteSheet, 20, 20, 1, .085, 1, true, 1.5);
    }
    this.aniX += 23;
    this.aniY += 23;
    this.origin = origin;
    if (spriteSheetAoe !== null){
        this.animationAoe = new Animation(spriteSheetAoe, 35, 33, 1, .025, 10, false, 3);
    } else {
        this.animationAoe = new Animation(AM.getAsset("./img/zerg/ultra/ultra_death.png"), 100, 100, 1, .01, 9, false, 1);
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

function FireRound(spriteSheet, spriteSheetAoe, originX, originY, xTarget, yTarget, origin) {
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
        this.animation = new Animation(spriteSheet, 50, 60, 1, .085, 1, true, 1.5);
        this.spriteSheet = spriteSheet;
    } else {
        this.spriteSheet = AM.getAsset("./img/terran/abilities/incendiary_shot.png");
        this.animation = new Animation(AM.getAsset("./img/terran/abilities/incendiary_shot.png"), 50, 60, 1, .085, 1, true, 1.5);
    }
    this.aniX += 23;
    this.aniY += 23;
    this.origin = origin;
    if (spriteSheetAoe !== null){
        this.animationAoe = new Animation(spriteSheetAoe, 50, 60, 1, .025, 10, false, 1.5);
    } else {
        this.animationAoe = new Animation(AM.getAsset("./img/zerg/ultra/ultra_death.png"), 100, 100, 1, .01, 9, false, 1);
    }
    this.direction = "angle";

    // Damage stuff
    this.totalDamage = 0; //Adjusted at spell locations
    this.damageObjArr = [];
    let aX = this.x;
    let aY = this.y;
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(0, 0, DTypes.None, this.damageBuff);
    this.damageObj.timeLeft = 10;
    this.buffObj = [];
    this.counters = 0;
    this.damageBuffonExplosion = null;//done in spells
    this.damageObjonExplosion = null;
    //this.damageObjonExplosion.timeLeft = 10;
    this.direction = "angle";
    this.childUpdate = function () {
        this.counters++;
        if (this.angle === Math.PI || this.angle === 0){
            //this.y += 3*Math.sin(this.counters/3);
        } else {
            //this.x += 3*Math.sin(this.counters/3);
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
    ss1Ani = new Animation(AM.getAsset("./img/utilities/Shadow1.png"), 128, 128, 1, 0.13, 5, true, .25);
    ss2Ani = new Animation(AM.getAsset("./img/utilities/Shadow1.png"), 128, 128, 1, 0.04, 10, true, .175);
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
}

function ballStorm(originX, originY) {
    let xt, yt, eb;
    let numOfBalls = 20;
    for (var i = 0; i < numOfBalls; i++) {
        xt = getRandomInt(0, canvasWidth);
        yt = getRandomInt(0, canvasHeight);
        GAME_ENGINE.addEntity(new energyBall(originX, originY, CAMERA.x + xt, CAMERA.y + yt, 4, "angle"));
    }
}

function energyBall(originX, originY, xTarget, yTarget, origin, direction) {
    this.spriteSheet = AM.getAsset("./img/protoss/energy_ball.png");
    Projectile.call(this, this.spriteSheet, originX, originY, xTarget, yTarget, origin, direction);
    this.width = 51;
    this.height = 51


    // Damage stuff
    this.durationBetweenHits = 50;//Adjustable
    this.totalDamage = 10;//Adjustable
    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Piercing, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];
    this.projectileSpeed = 4;
    this.penetrative = false;

    console.log(this);
}


// for ability stuff
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
/* #endregion */