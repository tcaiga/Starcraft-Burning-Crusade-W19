/* #region Projetile Types */
Grenade.prototype = Projectile.prototype;
FireRound.prototype = Projectile.prototype;
energyBall.prototype = Projectile.prototype;

Spike.prototype = Projectile.prototype;


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
        this.spriteSheet = AM.getAsset("./img/terran/abilities/incendiary_shot_still.png");
        this.animation = new Animation(AM.getAsset("./img/terran/abilities/incendiary_shot_still.png"), 50, 60, 1, .085, 1, true, 1.5);
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
    ss1Ani = new Animation(AM.getAsset("./img/utilities/Shadow1.png"), 128, 128, 1, 0.13, 1, true, .25);
    ss2Ani = new Animation(AM.getAsset("./img/utilities/Shadow1.png"), 128, 128, 1, 0.04, 10, true, .175);
    ss1 = new StillStand(ss1Ani, 60, myPlayer.x, myPlayer.y);
    ss1.ssAni = ss2Ani;
    ss1.width = 50;
    ss1.height = 50;

    let x = myPlayer.x;
    let y = myPlayer.y;

    GAME_ENGINE.addEntity(ss1);

    ss1.onDeath = function (roomNumber) {
        // create 5 zerglings at a random area within 50px of the player
        // after a 2s delay from a graphic being placed.
        let zergling1 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x, y, roomNumber);
        let zergling2 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x + 30, y, roomNumber);
        let zergling3 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x, y + 30, roomNumber);
        let zergling4 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x - 30, y, roomNumber);
        let zergling5 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"), x, y - 30, roomNumber);
        
        GAME_ENGINE.addEntity(zergling1);
        GAME_ENGINE.addEntity(zergling2);
        GAME_ENGINE.addEntity(zergling3);
        GAME_ENGINE.addEntity(zergling4);
        GAME_ENGINE.addEntity(zergling5);
    }

}

function SpawnUltra(roomNumber) {
    ss1Ani = new Animation(AM.getAsset("./img/utilities/Shadow1.png"), 128, 128, 1, 0.13, 1, true, 1.25);
    ss2Ani = new Animation(AM.getAsset("./img/utilities/Shadow1.png"), 128, 128, 1, 0.04, 10, true, .175);
    ss1 = new StillStand(ss1Ani, 90, myPlayer.x, myPlayer.y);
    ss1.ssAni = ss2Ani;
    ss1.width = 50;
    ss1.height = 50;

    let x = myPlayer.x;
    let y = myPlayer.y;

    GAME_ENGINE.addEntity(ss1);

    ss1.onDeath = function () {
        // create 5 zerglings at a random area within 50px of the player
        // after a 2s delay from a graphic being placed.
        let ultra = new Ultralisk(AM.getAsset("./img/zerg/ultra/ultra_move_right.png"), x, y, roomNumber);

        GAME_ENGINE.addEntity(ultra);
    }

}

function SpikeExplosion(spriteSheet, originX, originY, xTarget, yTarget, origin) {
    this.width = 100;
    this.height = 100;
    ss1Ani = new Animation(spriteSheet, this.width, this.height, 1, .25, 6, true, 1.25);
    ss1 = new StillStand(ss1Ani, 90, originX, originY);
    GAME_ENGINE.addEntity(ss1);
    ss1.onDeath = function () {
        let spike = new Spike(originX, originY, xTarget, yTarget, origin);
        spike.projectileSpeed = 4;

        GAME_ENGINE.addEntity(spike);
    }


}

function SpawnHydra(roomNumber) {
    ss1Ani = new Animation(AM.getAsset("./img/utilities/Shadow1.png"), 128, 128, 1, 0.13, 1, true, .5);
    ss2Ani = new Animation(AM.getAsset("./img/utilities/Shadow1.png"), 128, 128, 1, 0.04, 10, true, .175);
    ss1 = new StillStand(ss1Ani, 90, myPlayer.x, myPlayer.y);
    ss1.ssAni = ss2Ani;
    ss1.width = 50;
    ss1.height = 50;

    let x = myPlayer.x;
    let y = myPlayer.y;

    GAME_ENGINE.addEntity(ss1);

    ss1.onDeath = function () {
        // create 5 zerglings at a random area within 50px of the player
        // after a 2s delay from a graphic being placed.
        let hydra = new Hydralisk(AM.getAsset("./img/zerg/hydra/hydra_move_right.png"), x, y, roomNumber);

        GAME_ENGINE.addEntity(hydra);
    }

}

function SpikeExplosion(spriteSheet, originX, originY, xTarget, yTarget, origin) {
    this.width = 100;
    this.height = 100;
    ss1Ani = new Animation(spriteSheet, this.width, this.height, 1, .25, 6, true, 1.25);
    ss1 = new StillStand(ss1Ani, 90, originX, originY);
    GAME_ENGINE.addEntity(ss1);
    ss1.onDeath = function () {
        GAME_ENGINE.addEntity(new Spike(originX, originY, xTarget, yTarget, origin));
    }


}

function Spike(originX, originY, xTarget, yTarget, origin) {
    this.spriteSheet = AM.getAsset("./img/zerg/heavy_shot.png");
    Projectile.call(this, this.spriteSheet, originX, originY, xTarget, yTarget, origin, "angle");

    this.projectileSpeed = 6;

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
    let numOfBalls = 14;
    for (var i = 0; i < numOfBalls; i++) {
        xt = getRandomInt(0, canvasWidth);
        yt = getRandomInt(0, canvasHeight);
        eb = new energyBall(originX, originY, CAMERA.x + xt, CAMERA.y + yt, 4, "angle");
        eb.projectileSpeed = 3.5;
        GAME_ENGINE.addEntity(eb);
    }
}

function spikeStorm(originX, originY) {
    let xt, yt, eb;
    let numOfBalls = 14;
    for (var i = 0; i < numOfBalls; i++) {
        xt = getRandomInt(0, canvasWidth);
        yt = getRandomInt(0, canvasHeight);
        let spike = new Spike(originX, originY, CAMERA.x + xt, CAMERA.y + yt, 4, "angle");
        spike.totalDamage = 5;
        spike.projectileSpeed = 4;
        GAME_ENGINE.addEntity(spike);
    }
}

function psionicStorm() {
    this.width = 185;
    this.height = 150;
    this.scale = .6;
    ss1Ani = new Animation(AM.getAsset("./img/protoss/psionic_storm.png"), 185, 150, 1, 0.05, 7, true, .6);
    let tarX = CAMERA.x + getRandomInt(TILE_SIZE, canvasWidth - TILE_SIZE - 185);
    let tarY = CAMERA.y + getRandomInt(TILE_SIZE, canvasHeight - TILE_SIZE - 150);
    ss1 = new StillStand(ss1Ani, 50, tarX, tarY);
    GAME_ENGINE.addEntity(ss1);
    ss1.onDeath = function () {
        psionicStormDmg(tarX, tarY);
    }
    
   
}

function psionicStormDmg(tarX, tarY) {
    this.width = 185;
    this.height = 150;
    this.scale = .6;
    ss2Ani = new Animation(AM.getAsset("./img/protoss/psionic_storm.png"), 185, 150, 1, 0.05, 7, true, .6);
    ss2 = new StillStand(ss2Ani, 120, tarX, tarY);
    console.log("ss2 made");
    ss2.boundingbox = new BoundingBox(tarX, tarY, this.width * this.scale, this.height * this.scale);
    GAME_ENGINE.addEntity(ss2);
}

function energyBall(originX, originY, xTarget, yTarget, origin, direction) {
    this.spriteSheet = AM.getAsset("./img/protoss/energy_ball.png");
    Projectile.call(this, this.spriteSheet, originX, originY, xTarget, yTarget, origin, direction);
    this.width = 51;
    this.height = 51;
    this.sheetWidth = 1;
    this.frameLength = .09;
    this.numOfFrames = 6;
    this.scale = .75;
    this.animation = new Animation(this.spriteSheet, this.width, this.height,
        this.sheetWidth, this.frameLength, this.numOfFrames, true, this.scale);


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

}


// for ability stuff
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
/* #endregion */