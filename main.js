/* #region Constants */
const AM = new AssetManager();
const GAME_ENGINE = new GameEngine();
const CAMERA = new Camera(GAME_ENGINE);
const DS = new DamageSystem();

var SCENE_MANAGER;
var canvasWidth;
var canvasHeight;
var myFloorNum = 1;
var myRoomNum = 1;
// Constant variable for tile size
const TILE_SIZE = 16;
/* #endregion */

/* #region Player */
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
    this.damageObjArr = [];
    this.buffObj = [];
    this.abilityCD = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    this.cooldownRate = 1;
    this.cooldownAdj = 0;
    this.castTime = 0;
    this.isStunned = false;
    this.game = game;
    this.ctx = game.ctx;
    this.baseMaxMovespeed = 2;
    this.maxMovespeedRatio = 1;
    this.maxMovespeedAdj = 0;
    this.right = true;
    this.currentHealth = 100;
    this.dontdraw = 0;
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
    if (this.dontdraw <= 0) {
        if (!GAME_ENGINE.movement) {
            this.animationIdle.drawFrameIdle(this.ctx, xValue, this.y);
        } else {
            this.animationRun.drawFrame(this.game.clockTick, this.ctx, xValue, this.y);
        }

        this.ctx.restore();
        GAME_ENGINE.ctx.strokeStyle = "blue";
        GAME_ENGINE.ctx.strokeRect(this.x + (this.xScale * 4), this.y + 13,
            this.boundingbox.width, this.boundingbox.height);
    } else {
        this.dontdraw--;
    }
}

Player.prototype.update = function () {
    // Conditional check to see if player wants to sprint or not
    var sprint = GAME_ENGINE.keyShift ? 1.75 : 1;


    // Player movement controls

    if (this.castTime <= 0 && !this.isStunned) {
        /* #region Player movement controls */

        if (GAME_ENGINE.keyW === true) {
            this.y -= (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * sprint;
        }
        if (GAME_ENGINE.keyA === true) {
            this.x -= (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * sprint;
            this.right = false;
        }
        if (GAME_ENGINE.keyS === true) {
            this.y += (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * sprint;
        }
        if (GAME_ENGINE.keyD === true) {
            this.x += (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * sprint;
            this.right = true;
        }
        /* #endregion */
    } else {
        this.castTime--;
    }
    /* #region Abilities */
    let t;
    for (t in this.abilityCD) {
        this.abilityCD[t] += (this.abilityCD[t] > 0) ? -1 : 0;
    }
    for (t in GAME_ENGINE.digit) {
        if (GAME_ENGINE.digit[t] && !this.isStunned) {
            switch (GAME_ENGINE.playerPick) {
                case 0:
                    this.mageAbilities(t);
                    break;
                case 1:
                    this.rangerAbilities(t);
                    break;
                case 2:
                    this.knightAbilities(t);
                    break;
            }
        }
    }
    /* #endregion */


    if (this.currentHealth <= 0) {
        this.game.reset();
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


    this.boundingbox = new BoundingBox(this.x + (this.xScale * 4), this.y + 13,
        this.width, this.height);
}


/* #region Player Ability functions */
let castDistance, xDif, yDif, mag, xPos, yPos
    , dmg, aoe, ss1, ss2, ss1Ani, ss2Ani, tempPro = {};
Player.prototype.rangerAbilities = function (number) {
    if (this.abilityCD[number] <= 0) {
        switch (parseInt(number)) {
            case 0:
                //Ability at keyboard number 0
                break;
            case 1:
                /* #region Boostpad */
                //Ability at keyboard number 1
                castDistance = 125;
                let tempTrap = new RangerBoostPad(GAME_ENGINE, AM.getAsset("./img/floor_boostpad_on.png"),
                    AM.getAsset("./img/floor_boostpad_off.png"));
                xDif, yDif, mag;
                xDif = this.x - GAME_ENGINE.mouseX + 10;
                yDif = this.y - GAME_ENGINE.mouseY + 10;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(mag, castDistance);

                tempTrap.x = this.x - (xDif / mag) * castDistance;
                tempTrap.y = this.y - (yDif / mag) * castDistance;
                tempTrap.boundingbox = new BoundingBox(tempTrap.x, tempTrap.y, 20, 20);
                GAME_ENGINE.addEntity(tempTrap);
                this.abilityCD[number] = 60;
                /* #endregion */
                break;
            case 2:
                //Ability at keyboard number 2
                /* #region Rain of arrows */
                castDistance = 150;
                aoe = 70;
                xDif = this.x - GAME_ENGINE.mouseX + 10;
                yDif = this.y - GAME_ENGINE.mouseY + 10;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(mag, castDistance);
                xPos = this.x - (xDif / mag) * castDistance;
                yPos = this.y - (yDif / mag) * castDistance;
                let ss1 = new StillStand(GAME_ENGINE, new Animation(AM.getAsset("./img/fireball.png")
                    , 100, 100, 1, .085, 8, true, .75), 7 * 7, xPos - 30, yPos - 30);

                ss1.boundingbox = new BoundingBox(ss1.x - aoe / 2, ss1.y - aoe / 2, aoe, aoe);
                dmg = DS.CreateDamageObject(4, 0, DTypes.Piercing, DS.CloneBuffObject(PremadeBuffs.Slow));
                dmg.timeLeft = 7;
                ss1.entityHitType = EntityTypes.enemies;
                ss1.damageObj = dmg;
                ss1.penetrative = true;
                GAME_ENGINE.addEntity(ss1);
                this.abilityCD[number] = 12;
                /* #endregion */
                break;
            case 3:
                //Ability at keyboard number 3
                break;
            case 4:
                //Ability at keyboard number 4
                break;
        }
    }
}
Player.prototype.mageAbilities = function (number) {
    if (this.abilityCD[number] <= 0) {
        switch (parseInt(number)) {
            case 0:
                //Ability at keyboard number 0
                break;
            case 1:
                /* #region Blink */
                //Ability at keyboard number 1
                castDistance = 100;
                xDif = this.x - GAME_ENGINE.mouseX;
                yDif = this.y - GAME_ENGINE.mouseY;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(castDistance, mag);
                ss1Ani = new Animation(AM.getAsset("./img/flash.png"), 16, 32, 1, 0.13, 4, true, 1.25);
                ss2Ani = new Animation(AM.getAsset("./img/flash.png"), 16, 32, 1, 0.13, 4, true, 1.25);
                ss1 = new StillStand(this.game, ss1Ani, 10, this.x, this.y);
                this.x -= (xDif / mag) * castDistance + 12;
                this.y -= (yDif / mag) * castDistance + 30;
                ss2 = new StillStand(this.game, ss2Ani, 10, this.x, this.y);
                this.dontdraw = 10;
                this.castTime = 10;
                GAME_ENGINE.addEntity(ss1);
                GAME_ENGINE.addEntity(ss2);
                this.abilityCD[number] = 120;
                /* #endregion */
                break;
            case 2:
                /* #region Greater Fireball */
                //Ability at keyboard number 2
                let tempPro = new GreaterFireball(GAME_ENGINE, AM.getAsset("./img/fireball.png"), AM.getAsset("./img/fireball.png")
                    , this.x - (this.width / 2), this.y - (this.height / 2), GAME_ENGINE.mouseX, GAME_ENGINE.mouseY);
                tempPro.targetType = EntityTypes.enemies;
                tempPro.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
                    this.width - 25, this.height - 25); // Hardcoded a lot of offset values
                GAME_ENGINE.addEntity(tempPro);
                this.abilityCD[number] = 120;
                this.castTime + 12;
                /* #endregion */
                break;
            case 3:
                /* #region Flame Breath */
                //Ability at keyboard number 3
                let tempPro2;
                for (let i = 0; i < 30; i++){
                    tempPro2 = new FlameBreathBolt(GAME_ENGINE, AM.getAsset("./img/flame_breath_bolt.png")
                    ,this.x - (this.width / 2), this.y - (this.height / 2), GAME_ENGINE.mouseX, GAME_ENGINE.mouseY);
                    GAME_ENGINE.addEntity(tempPro2);
                }
                this.castTime = 8;
                this.abilityCD[number] = 75;
                /* #endregion */
                break;
            case 4:
                //Ability at keyboard number 4
                break;
        }
    }
}
Player.prototype.knightAbilities = function (number) {
    if (this.abilityCD[number] <= 0) {
        switch (parseInt(number)) {
            case 0:
                //Ability at keyboard number 0
                break;
            case 1:
                /* #region Sword Boomerang */
                //Ability at keyboard number 1
                tempPro = new SwordBoomerang(GAME_ENGINE, AM.getAsset("./img/SwordBoomerang.png"),
                    this.x - (this.width / 2), this.y - (this.height / 2), GAME_ENGINE.mouseX, GAME_ENGINE.mouseY);
                tempPro.thrower = this;
                GAME_ENGINE.addEntity(tempPro);
                this.abilityCD[number] = 60;
                /* #endregion */
                break;
            case 2:
                //Ability at keyboard number 2
                /* #region Shield Bash */
                castDistance = 20;
                aoe = 40;
                xDif = this.x - GAME_ENGINE.mouseX + 10;
                yDif = this.y - GAME_ENGINE.mouseY + 10;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(mag, castDistance);
                xPos = this.x - (xDif / mag) * castDistance;
                yPos = this.y - (yDif / mag) * castDistance;

                ssAni1 = new Animation(AM.getAsset("./img/Shield Flash.png"), 32, 32, 1, 0.07, 6, true, 1.5);
                ss1 = new StillStand(GAME_ENGINE, ssAni1, 12, xPos, yPos);
                ss1.boundingbox = new BoundingBox(xPos + 5, yPos + 2, aoe, aoe);
                ss1.entityHitType = EntityTypes.enemies;
                ss1.onDraw = function () {
                    //console.log(xPos - aoe/2, yPos - aoe/2, aoe, aoe);
                    this.game.ctx.strokeStyle = "yellow";
                    this.game.ctx.strokeRect(xPos + 5, yPos + 2, aoe, aoe);
                }
                ss1.damageObj = DS.CreateDamageObject(21, 0, DTypes.Normal, DS.CloneBuffObject(PremadeBuffs.Stun));
                ss1.penetrative = true;
                this.abilityCD[number] = 75;
                this.castTime = 6;
                GAME_ENGINE.addEntity(ss1);
                /* #endregion */
                break;
            case 3:
                //Ability at keyboard number 3
                break;
            case 4:
                //Ability at keyboard number 4
                break;
        }
    }
}
/* #endregion */

Player.prototype.changeHealth = function (amount) {
    if (amount > 0) {
        //display healing animation
        //maybe have a currentHealth change threshold 
        //to actually have it display
    } else if (amount < 0) {
        //display damage animation
        //maybe have a currentHealth change threshold 
        //to actually have it display
    }
    this.currentHealth += amount;//Damage will come in as a negative value;
}
/* #endregion */

/* #region Monster */
/* #region Base Monster */

function Monster(game, spritesheet) {
    Entity.call(this, game, 0, 350);
    this.scale = 1;
    this.width = 40;
    this.height = 56;
    this.animation = new Animation(spritesheet, this.width, this.height, 1, 0.15, 15, true, this.scale);
    this.speed = 100;
    this.ctx = game.ctx;
    this.currentHealth = 100;
    this.damageObjArr = [];
    this.damageObj = DS.CreateDamageObject(20, 0, DTypes.Normal, DS.CloneBuffObject(PremadeBuffs.HasteWeak));
    this.buffObj = [];
    this.isStunned = false;
    this.counter = 0;

    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.
}

Monster.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    GAME_ENGINE.ctx.strokeStyle = "red";
    GAME_ENGINE.ctx.strokeRect(this.x, this.y, this.width * this.scale, this.height * this.scale);

    // Displaying Monster currentHealth
    this.ctx.font = "15px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("currentHealth: " + this.currentHealth, this.x - 5, this.y - 5);
}

Monster.prototype.update = function () {
    if (this.currentHealth <= 0) this.removeFromWorld = true;
    if (!this.isStunned) {
        this.x += this.game.clockTick * this.speed;
        if (this.x <= TILE_SIZE * 2) this.x = 450;
    }
    Entity.prototype.update.call(this);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.

    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        this.damageObj.ApplyEffects(myPlayer);
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
        //maybe have a currentHealth change threshold 
        //to actually have it display
    } else if (amount < 0) {
        //display damage animation
        //maybe have a currentHealth change threshold 
        //to actually have it display
    }
    this.currentHealth += amount;//Healing will come in as a positive number
}
/* #endregion */

/* #region Monster Types */
Devil.prototype = Monster.prototype;
Acolyte.prototype = Monster.prototype;

function Devil(game, spritesheet) {
    Monster.call(this, game, spritesheet);
    this.scale = 3;
    this.width = 16;
    this.height = 23;
    this.speed = 45;
    this.currentHealth = 200;

    this.x = 150;
    this.y = 250;

    this.counter = 0;
    this.animation = new Animation(spritesheet, this.width, this.height, 128, 0.15, 8, true, this.scale);
}

function Acolyte(game, spritesheet) {
    Monster.call(this, game, spritesheet);
    this.scale = 2;
    this.width = 16;
    this.height = 19;
    this.speed = 25;
    this.currentHealth = 150;

    this.animation = new Animation(spritesheet, this.width, this.height, 64, 0.15, 4, true, this.scale);

    this.x = 100;
    this.y = 100;

    this.counter = 0;
}
/* #endregion */
/* #endregion */

/* #region Projectile */
/* #region Base Projectile */
function Projectile(game, spriteSheet, originX, originY, xTarget, yTarget) {
    this.width = 100;
    this.height = 100;
    this.animation = new Animation(spriteSheet, this.width, this.height, 1, .085, 8, true, .75);
    this.targetType = 4;
    this.originX = originX;
    this.originY = originY;

    this.xTar = xTarget - 20;
    this.yTar = yTarget - 35;

    // Determining where the projectile should go angle wise.
    this.angle = Math.atan2(this.yTar - this.originY, this.xTar - this.originX);
    this.counter = 0; // Counter to make damage consistent
    this.childUpdate;//function
    this.childDraw;//function
    this.childCollide;//function
    this.speed = 200;
    this.projectileSpeed = 7.5;
    this.damageObj = DS.CreateDamageObject(15, 0, DTypes.Normal, null);
    this.penetrative = false;
    this.ctx = game.ctx;
    this.aniX = originX,
    this.aniY = originY;
    Entity.call(this, game, originX, originY);

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // Hardcoded a lot of offset values

}

Projectile.prototype.draw = function () {
    (typeof this.childDraw === 'function') ? this.childDraw() : null;
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.aniX - 18, this.aniY - 4); // Hardcoded a lot of offset values
    GAME_ENGINE.ctx.strokeStyle = "yellow";
    //GAME_ENGINE.ctx.strokeRect(this.x + 8, this.y + 25, this.width - 75, this.height - 75); // Hardcoded a lot of offset values

}

Projectile.prototype.update = function () {
    //var projectileSpeed = 7.5;
    (typeof this.childUpdate === 'function') ? this.childUpdate() : null;
    // Generating the speed to move at target direction
    var velY = Math.sin(this.angle) * this.projectileSpeed;
    var velX = Math.cos(this.angle) * this.projectileSpeed;
    // Moving the actual projectile.
    this.x += velX;
    this.y += velY;
    this.aniX += velX,
    this.aniY += velY;

    if (this.x < 16 || this.x > 460 || this.y < 0 || this.y > 430) this.removeFromWorld = true;
    Entity.prototype.update.call(this);

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // **Temporary** Hard coded offset values.

    for (var i = 0; i < GAME_ENGINE.entities[this.targetType].length; i++) {
        var entityCollide = GAME_ENGINE.entities[this.targetType][i];
        if (this.boundingbox.collide(entityCollide.boundingbox)) {
            if (GAME_ENGINE.entities[this.targetType][i].currentHealth > 0) {
                (typeof this.childCollide === 'function') ? this.childCollide(entityCollide) : null;
                this.damageObj.ApplyEffects(GAME_ENGINE.entities[4][i]);
                this.removeFromWorld = (this.penetrative) ? false : true;
            }
        }
    }

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // Hardcoded a lot of offset values

}
/* #endregion */

/* #region Projetile Types */
SwordBoomerang.prototype = Projectile.prototype;
GreaterFireball.prototype = Projectile.prototype;
FlameBreathBolt.prototype = Projectile.prototype;

function SwordBoomerang(game, spriteSheet, originX, originY, xTarget, yTarget) {
    Projectile.call(this, game, spriteSheet, originX, originY, xTarget, yTarget);
    this.projectileSpeed = 7;
    this.timeLeft = 60;
    this.thrower = null;
    this.speedChange = -7 / 30;
    this.penetrative = true;
    this.damageObj = DS.CreateDamageObject(45, 0, DTypes.Slashing
        , DS.CloneBuffObject(PremadeBuffs.DamageOvertime));
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

function GreaterFireball(game, spriteSheet, spriteSheetAoe, originX, originY, xTarget, yTarget, targetType) {
    Projectile.call(this, game, spriteSheet, originX, originY, xTarget, yTarget);
    this.projectileSpeed = 5;
    this.penetrative = false;
    this.aoe = 100;//square
    this.targetType = targetType;
    this.animation = new Animation(spriteSheet, 100, 100, 1, .085, 8, true, 1);
    this.animationAoe = new Animation(spriteSheetAoe, 100, 100, 1, .085, 8, true, 1);
    this.damageObj = DS.CreateDamageObject(10, 4, DTypes.Magic
        , DS.CreateBuffObject("lesser burning"
            , [DS.CreateEffectObject(ETypes.CurrentHealthF, -1, 0, 20, 4)]));
    this.childCollide = function (unit) {
        let xPos, yPos, width = height = this.aoe;
        xPos = this.x - 25;
        yPos = this.y - 25;
        let aBox = new BoundingBox(xPos, yPos, width, height);
        let aCrow = new StillStand(this.game, this.animationAoe, 6, this.x, this.y);
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

function FlameBreathBolt(game, spriteSheet, originX, originY, xTarget, yTarget) {
    Projectile.call(this, game, spriteSheet, originX, originY, xTarget, yTarget);
    this.xTar = xTarget - 20;
    this.yTar = yTarget - 35;
    this.range = 90;
    this.damageObj = DS.CreateDamageObject(2.25, 0, DTypes.Magic);
    this.animation = new Animation(spriteSheet, 8, 8, 1, .084, 4, true, 1);
    this.aniX += 34;
    this.aniY += 38;
    // Determining where the projectile should go angle wise.
    //radians
    let converter = Math.PI/360;
    let spread = 90;
    this.angle = Math.atan2(this.yTar - this.originY, this.xTar - this.originX);
    this.angle += spread*converter*Math.random()*((Math.random() - 0.5 >= 0) ? 1 : -1);
    this.projectileSpeed = Math.random()*5 + 2;
    this.timeLeft = this.range/this.projectileSpeed;
    this.childUpdate = function () {
        this.timeLeft--;
        if (this.timeLeft <= 0){
            this.removeFromWorld = true;
        }
    }
}
/* #endregion */
/* #endregion */

/* #region Trap */
/* #region Base Trap */
function Trap(game, spriteSheetUp, spriteSheetDown) {
    this.animationUp = new Animation(spriteSheetUp, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationDown = new Animation(spriteSheetDown, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationIdle = this.animationUp;
    this.x = 200; // Hardcorded temp spawn
    this.y = 200; // Hardcorded temp spawn
    this.activated = false; // Determining if trap has been activated
    this.counter = 0; // Counter to calculate when trap related events should occur
    this.doAnimation = false; // Flag to determine if the spikes should animate or stay still
    this.damageObj = DS.CreateDamageObject(10, 0, DTypes.Normal, DS.CloneBuffObject(PremadeBuffs.SlowStrong));
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
    if (typeof this.lifeTime !== 'undefined') {
        if (this.lifeTime <= 0) {
            this.removeFromWorld = true;
        } else {
            this.lifeTime--;
        }
    }
    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        // Remember what tick the collision happened
        this.counter += this.game.clockTick;
        // Check to make sure the animation happens first
        if (this.counter < .1) {
            this.doAnimation = true;
        } else { // Else keep the spikes up as the player stands over the trap
            this.doAnimation = false;
            // Nuke the player, but start the damage .13 ticks after they stand on the trap
            // This allows players to sprint accross taking 10 damage
            if (myPlayer.currentHealth > 0 && this.counter > 0.18) {
                //myPlayer.currentHealth -= 2;
                this.damageObj.ApplyEffects(myPlayer);
                //console.log(myPlayer);
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
/* #endregion */

/* #region Trap Types */
RangerBoostPad.prototype = Trap.prototype;

function RangerBoostPad(game, spriteSheetUp, spriteSheetDown) {
    Trap.call(this, game, spriteSheetUp, spriteSheetDown);
    this.damageObj = DS.CreateDamageObject(0, 0, DTypes.None
        , DS.CreateBuffObject("ranger boost", [
            DS.CreateEffectObject(ETypes.MoveSpeedR, Math.pow(1.1, 10), 1, 1, 0),
            DS.CreateEffectObject(ETypes.MoveSpeedR, 1 / 1.1, 1, 100, 10)
        ]));
    this.lifeTime = 120;
}
/* #endregion */
/* #endregion */

/* #region Still Stand */
function StillStand(game, animation, duration, theX, theY) {
    this.timeLeft = duration;
    this.ani = animation;
    this.boundingbox;
    this.damageObj;
    this.entityHitType;
    this.penetrative;
    this.game = game;
    this.ctx = game.ctx;
    this.onDraw;
    this.onUpdate;
    this.onCollide;
    this.x = theX;
    this.y = theY;
    Entity.call(this, game, theX, theY);
}

StillStand.prototype.update = function () {
    (typeof this.onUpdate === 'function') ? this.onUpdate() : null;
    this.timeLeft--;
    if (this.timeLeft <= 0) {
        this.removeFromWorld = true;
    }
    if (typeof this.boundingbox !== 'undefined' && typeof this.entityHitType !== 'undefined') {
        for (var i = 0; i < GAME_ENGINE.entities[this.entityHitType].length; i++) {
            var entityCollide = GAME_ENGINE.entities[this.entityHitType][i];
            if (this.boundingbox.collide(entityCollide.boundingbox)) {
                if (GAME_ENGINE.entities[this.entityHitType][i].currentHealth > 0) {
                    (typeof this.onCollide === 'function') ? this.onCollide(unit) : null;
                    this.damageObj.ApplyEffects(GAME_ENGINE.entities[this.entityHitType][i]);
                    this.removeFromWorld = (this.penetrative && !this.removeFromWorld) ? false : true;
                }
            }
        }
    }
}
StillStand.prototype.draw = function () {
    (typeof this.onDraw === 'function') ? this.onDraw() : null;
    this.ani.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}
/* #endregion */

/* #region BoundingBox */
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
/* #endregion */

function Terrain(game) {

}

/* #region Camera */
function Camera(game) {
    this.x = 0;
    this.y = 0;
}

Camera.prototype.update = function () {

}

Camera.prototype.draw = function () { }


Camera.prototype.move = function (direction) {
    if (direction === "right") {
        this.x += canvasWidth;
        myPlayer.x = 60 + CAMERA.x;
    } else if (direction === "left") {
        this.x -= canvasWidth;
        myPlayer.x = canvasWidth - TILE_SIZE * 2 - 60 + CAMERA.x;
    } else if (direction === "up") {
        this.y -= canvasHeight;
        myPlayer.y = canvasHeight + TILE_SIZE * 2 + 60 + CAMERA.y;
    } else if (direction === "down") {
        this.y += canvasHeight;
        myPlayer.y = 60 + CAMERA.y;
    }
}
/* #endregion */

// function Door (theGame, theX, theY) {} {
//     this.x = theX;
//     this.y = theY;
//     this.ctx = theGame.ctx;
// }

// Door.prototype.update = function () {

// }

// Door.prototype.draw = function () {

// }

/* #region Menu */

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

Menu.prototype.update = function () { }

Menu.prototype.draw = function () {
    this.ctx.drawImage(this.background, 253, 0,
        canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

    this.createClassButton("Mage", this.mageButtonX);
    this.createClassButton("Ranger", this.rangerButtonX);
    this.createClassButton("Knight", this.knightButtonX);
}

Menu.prototype.createClassButton = function (text, xPosition) {
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = "1";
    this.ctx.font = "35px Arial";
    this.ctx.strokeText(text, xPosition, this.classButtonY + this.classButtonH);
    this.ctx.fillStyle = "white";
    this.ctx.fillText(text, xPosition, this.classButtonY + this.classButtonH);
}
/* #endregion */

/* #region Background */
function Background(game) {
    this.x = 0;
    this.y = 0;
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
    this.one.src = "./img/tile_0117.png";
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

Background.prototype.update = function () { };
/* #endregion */

/* #region Animation */
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
        x - CAMERA.x, y - CAMERA.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.drawFrameIdle = function (ctx, x, y) {
    ctx.drawImage(this.spriteSheet,
        0, 0,
        this.frameWidth, this.frameHeight,
        x - CAMERA.x, y - CAMERA.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
/* #endregion */

/* #region Download queue and download */

// Ranger
AM.queueDownload("./img/ranger_run.png");
// Knight
AM.queueDownload("./img/knight_run.png");
AM.queueDownload("./img/SwordBoomerang.png");
AM.queueDownload("./img/Shield Flash.png");
// Mage
AM.queueDownload("./img/mage_run.png");
AM.queueDownload("./img/flash.png");
AM.queueDownload("./img/flame_breath_bolt.png");
// Floor Trap
AM.queueDownload("./img/floor_trap_up.png");
AM.queueDownload("./img/floor_trap_down.png");
// Boostpad
AM.queueDownload("./img/floor_boostpad_on.png");
AM.queueDownload("./img/floor_boostpad_off.png");
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

    GAME_ENGINE.init(ctx);
    GAME_ENGINE.start();

    GAME_ENGINE.addEntity(new Menu(GAME_ENGINE));
    SCENE_MANAGER = new SceneManager();
});
/* #endregion */