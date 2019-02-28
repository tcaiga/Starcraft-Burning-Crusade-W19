//color constants
const color_red = "red";
const color_yellow = "yellow";
const color_white = "white";
const color_green = "lightgreen";

/* #region Constants */
const AM = new AssetManager();
const GAME_ENGINE = new GameEngine();
var CAMERA = new Camera();
const DS = new DamageSystem();

var AUDIO;
var BACKGROUND;
var SCENE_MANAGER;
var canvasWidth;
var canvasHeight;
var myFloorNum = 1;
var myRoomNum = 1;
var playerX;
var playerY;

// Constant variable for tile size
const TILE_SIZE = 16;
/* #endregion */

/* #region Player */
function Player(spritesheet, xOffset, yOffset) {
    // Relevant for Player box
    this.width = 32;
    this.height = 32;
    this.scale = 1.5;
    this.xOffset = xOffset * this.scale;
    this.yOffset = yOffset * this.scale;
    this.animationRun = new Animation(spritesheet, this.width, this.height, 1, 0.04, 9, true, this.scale);
    this.animationIdle = this.animationRun;
    this.x = 60;
    this.y = 60;
    playerX = this.x;
    playerY = this.y;
    this.xScale = 1;
    this.damageObjArr = [];
    this.buffObj = [];
    this.abilityCD = [0, 0, 0, 0, 0];
    this.cooldownRate = 1;
    this.cooldownAdj = 0;
    this.castTime = 0;
    this.isStunned = false;
    this.sprint = 1;
    this.dead = false;
    this.baseMaxMovespeed = 2;
    this.maxMovespeedRatio = 1;
    this.maxMovespeedAdj = 0;
    this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * this.sprint;
    this.right = true;
    this.health = 999999999;
    this.maxHealth = 100;
    this.dontdraw = 0;
    this.boundingbox = new BoundingBox(this.x + 4, this.y + 14,
        this.width, this.height); // **Temporary** Hard coded offset values.
}

Player.prototype.draw = function () {
    this.xScale = 1;
    var xValue = this.x;
    if (!this.right) {
        GAME_ENGINE.ctx.save();
        GAME_ENGINE.ctx.scale(-1, 1);
        this.xScale = -1;
        xValue = -this.x - this.width;
    }
    //draw player character with no animation if player is not currently moving
    if (this.dontdraw <= 0) {
        if (!GAME_ENGINE.movement) {
            this.animationIdle.drawFrameIdle(GAME_ENGINE.ctx, xValue, this.y);
        } else {
            this.animationRun.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
        }

        GAME_ENGINE.ctx.restore();
        if (GAME_ENGINE.debug) {
            GAME_ENGINE.ctx.strokeStyle = "blue";
            GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
                this.boundingbox.width, this.boundingbox.height);
        }
    } else {
        this.dontdraw--;
    }
}

Player.prototype.update = function () {
    // Conditional check to see if player wants to sprint or not
    this.sprint = GAME_ENGINE.keyShift ? 1.75 : 1;
    // Player movement controls

    if (!this.dead) {
        if (this.castTime <= 0 && !this.isStunned) {
            /* #region Player movement controls */
            this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * this.sprint;
            if (GAME_ENGINE.keyW === true) {
                this.y -= this.actualSpeed;
            }
            if (GAME_ENGINE.keyA === true) {
                this.x -= this.actualSpeed;
                this.right = false;
            }
            if (GAME_ENGINE.keyS === true) {
                this.y += this.actualSpeed;
            }
            if (GAME_ENGINE.keyD === true) {
                this.x += this.actualSpeed;
                this.right = true;
            }
            var actualSpeed = Math.floor((this.maxMovespeedRatio + this.maxMovespeedAdj) * this.sprint * 100);
           
            /* #endregion */
        } else {
            this.castTime--;
        }
        /* #region Abilities */
        let t;
        for (t in this.abilityCD) {
            this.abilityCD[t] += (this.abilityCD[t] > 0) ? -1 : 0;
            //ignoring index 0 of cd array
            if (t > 0) {
                var spellHTML = document.getElementById("spell" + t);
                //display if spell is ready to use or not
                if (this.abilityCD[t] > 0) {
                    spellHTML.innerHTML = this.abilityCD[t] / 10;
                    spellHTML.style.color = color_red;
                } else {
                    spellHTML.innerHTML = "Ready";
                    spellHTML.style.color = color_green;
                }
            }
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


        if (this.health <= 0) {
            this.dead = true;
            GAME_ENGINE.reset();
            BACKGROUND = new Background();
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

        playerX = this.x;
        playerY = this.y;

        this.boundingbox = new BoundingBox(this.x + (this.xScale * 4), this.y + 13,
            this.width, this.height);
    }

}


/* #region Player Ability functions */
let castDistance, xDif, yDif, mag, xPos, yPos
    , dmg, aoe, ss1, ss2, ss1Ani, ss2Ani, tempPro = {}
    , tempTrap = {};
Player.prototype.rangerAbilities = function (number) {
    if (this.abilityCD[number] <= 0) {
        switch (parseInt(number)) {
            case 0:
                //Ability at keyboard number 0
                break;
            case 1:
                /* #region Boostpad */
                //Ability at keyboard number 1

                castDistance = 80;
                xDif = this.x - GAME_ENGINE.mouseX + 10 - CAMERA.x;
                yDif = this.y - GAME_ENGINE.mouseY + 10 - CAMERA.y;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(mag, castDistance);
                xPos = this.x - (xDif / mag) * castDistance;
                yPos = this.y - (yDif / mag) * castDistance;
                tempTrap = new RangerBoostPad(AM.getAsset("./img/floor_boostpad_on.png"),
                    AM.getAsset("./img/floor_boostpad_off.png"), xPos, yPos);
                tempTrap.x = xPos;
                tempTrap.y = yPos;
                tempTrap.boundingbox = new BoundingBox(tempTrap.x, tempTrap.y, 20, 20);
                GAME_ENGINE.addEntity(tempTrap);
                this.abilityCD[number] = 195;
                /* #endregion */
                break;
            case 2:
                /* #region Rain of arrows */
                //Ability at keyboard number 2
                castDistance = 150;
                aoe = 70;
                xDif = this.x - GAME_ENGINE.mouseX + 10 - CAMERA.x;
                yDif = this.y - GAME_ENGINE.mouseY + 10 - CAMERA.y;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(mag, castDistance);
                xPos = this.x - (xDif / mag) * castDistance;
                yPos = this.y - (yDif / mag) * castDistance;
                let ss1 = new StillStand(new Animation(AM.getAsset("./img/ability/rain_of_arrows_32x384.png")
                    , 32, 32, 1, .060, 12, true, 2), 57, xPos - 30, yPos - 30);

                ss1.boundingbox = new BoundingBox(ss1.x, ss1.y, aoe, aoe);
                ss1.onDraw = function () {
                    GAME_ENGINE.strokeStyle = color_green;
                    (GAME_ENGINE.debug) ? GAME_ENGINE.ctx.strokeRect(this.x, this.y + aoe / 2, aoe, aoe / 2) : null;
                }
                dmg = DS.CreateDamageObject(7, 0, DTypes.Piercing, DS.CloneBuffObject(PremadeBuffs.Slow));
                dmg.timeLeft = 13;
                ss1.entityHitType = EntityTypes.enemies;
                ss1.damageObj = dmg;
                ss1.penetrative = true;
                GAME_ENGINE.addEntity(ss1);
                this.abilityCD[number] = 189;
                /* #endregion */
                break;
            case 3:
                /* #region Root trap */
                //Ability at keyboard number 3
                castDistance = 80;
                xDif = this.x - GAME_ENGINE.mouseX + 10 - CAMERA.x;
                yDif = this.y - GAME_ENGINE.mouseY + 10 - CAMERA.y;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(mag, castDistance);
                xPos = this.x - (xDif / mag) * castDistance;
                yPos = this.y - (yDif / mag) * castDistance;
                tempTrap = new RootTrap(AM.getAsset("./img/ability/root_trap_up.png"),
                    AM.getAsset("./img/ability/root_trap_down.png"), xPos, yPos);
                tempTrap.x = xPos;
                tempTrap.y = yPos;
                tempTrap.boundingbox = new BoundingBox(tempTrap.x, tempTrap.y, 20, 20);
                tempTrap.penetrative = true;
                GAME_ENGINE.addEntity(tempTrap);
                this.abilityCD[number] = 150;
                /* #endregion */
                break;
            case 4:
                /* #region Multi Shot */
                //Ability at keyboard number 4
                let angle = Math.atan2(GAME_ENGINE.mouseY - 20 - this.y - (this.height / 2) + CAMERA.y
                    , GAME_ENGINE.mouseX - 35 - this.x - (this.width / 2) + CAMERA.x);
                let sprite = "./img/ability/multi_arrow_";
                if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
                    //Right
                    sprite = "./img/ability/multi_arrow_r_";
                } else if (angle > -3 * Math.PI / 4 && angle < -Math.PI / 4) {
                    //Up
                    sprite = "./img/ability/multi_arrow_u_";
                } else if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) {
                    //Left
                    sprite = "./img/ability/multi_arrow_l_";
                } else {
                    //Down
                    sprite = "./img/ability/multi_arrow_d_";
                }
                for (let i = 0; i < 9; i++) {
                    tempPro = new MultiArrow(AM.getAsset(sprite + i + "_8x8.png"), this.x - (this.width / 2), this.y - (this.height / 2)
                        , GAME_ENGINE.mouseX, GAME_ENGINE.mouseY, 5);
                    tempPro.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
                        this.width - 25, this.height - 25); // Hardcoded a lot of offset values
                    tempPro.angle += (Math.PI / 360) * (20 * i - 90);
                    GAME_ENGINE.addEntity(tempPro);
                }
                this.abilityCD[number] = 120;
                /* #endregion */
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
                xDif = this.x - GAME_ENGINE.mouseX - CAMERA.x;
                yDif = this.y - GAME_ENGINE.mouseY - CAMERA.y;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(castDistance, mag);
                ss1Ani = new Animation(AM.getAsset("./img/flash.png"), 16, 32, 1, 0.13, 4, true, 1.25);
                ss2Ani = new Animation(AM.getAsset("./img/flash.png"), 16, 32, 1, 0.13, 4, true, 1.25);
                ss1 = new StillStand(ss1Ani, 10, this.x, this.y);
                this.x -= (xDif / mag) * castDistance + 12;
                this.y -= (yDif / mag) * castDistance + 30;
                ss2 = new StillStand(ss2Ani, 10, this.x, this.y);

                this.dontdraw = 10;
                this.castTime = 10;
                GAME_ENGINE.addEntity(ss1);
                GAME_ENGINE.addEntity(ss2);
                this.abilityCD[number] = 50;
                /* #endregion */
                break;
            case 2:
                /* #region Greater Fireball */
                //Ability at keyboard number 2
                let tempPro = new GreaterFireball(AM.getAsset("./img/ability/greater_fireball_16x64.png")
                    , AM.getAsset("./img/ability/flame_explosion_32x320.png")
                    , this.x - (this.width / 2), this.y - (this.height / 2), GAME_ENGINE.mouseX, GAME_ENGINE.mouseY, 5);
                tempPro.targetType = EntityTypes.enemies;
                tempPro.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
                    this.width - 25, this.height - 25); // Hardcoded a lot of offset values
                GAME_ENGINE.addEntity(tempPro);
                this.abilityCD[number] = 120;
                this.castTime = 12;
                /* #endregion */
                break;
            case 3:
                /* #region Flame Breath */
                //Ability at keyboard number 3
                let tempPro2;
                for (let i = 0; i < 30; i++) {
                    tempPro2 = new FlameBreathBolt(AM.getAsset("./img/flame_breath_bolt.png")
                        , this.x - (this.width / 2), this.y - (this.height / 2),
                        GAME_ENGINE.mouseX, GAME_ENGINE.mouseY, 5);
                    GAME_ENGINE.addEntity(tempPro2);
                }
                this.castTime = 8;
                this.abilityCD[number] = 100;
                /* #endregion */
                break;
            case 4:
                /* #region Flame Strike */
                //Ability at keyboard number 4
                castDistance = 145;
                xDif = this.x - GAME_ENGINE.mouseX - CAMERA.x;
                yDif = this.y - GAME_ENGINE.mouseY - CAMERA.y;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(castDistance, mag);
                xPos = -(xDif / mag) * castDistance - 12 + this.x;
                yPos = -(yDif / mag) * castDistance - 30 + this.y;
                ss1Ani = new Animation(AM.getAsset("./img/ability/flame_ring_32x160.png"), 32, 32, 1, 0.13, 5, true, 1.5);
                ss2Ani = new Animation(AM.getAsset("./img/ability/flame_explosion_32x320.png"), 32, 32, 1, 0.04, 10, false, 2);
                ss1 = new StillStand(ss1Ani, 40, xPos, yPos);
                ss1.ssAni = ss2Ani;
                ss1.width = 50;
                ss1.height = 50;
                ss1.aniX = -32 * 1.5 / 2 + 12;
                ss1.aniY = -32 * 1.5 / 2 + 22;
                ss1.entityHitType = EntityTypes.enemies;
                ss1.onDeath = function () {
                    let ss3 = new StillStand(this.ssAni, 18, this.x, this.y);
                    ss3.entityHitType = this.entityHitType;
                    ss3.boundingbox = new BoundingBox(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    ss3.damageObj = DS.CreateDamageObject(45, 0, DTypes.Magic);
                    ss3.penetrative = true;
                    ss3.aniX = -32 * 2 / 2 + 12;
                    ss3.aniY = -32 * 2 / 2 + 22;
                    GAME_ENGINE.addEntity(ss3);
                }
                GAME_ENGINE.addEntity(ss1);
                this.abilityCD[number] = 180;
                this.castTime = 10;
                /* #endregion */
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

                let tempPro = new SwordBoomerang(AM.getAsset("./img/swordBoomerang.png"),
                    this.x - (this.width / 2), this.y - (this.height / 2),
                    GAME_ENGINE.mouseX, GAME_ENGINE.mouseY, 5);
                tempPro.thrower = this;
                GAME_ENGINE.addEntity(tempPro);
                this.abilityCD[number] = 60;
                /* #endregion */
                break;
            case 2:
                /* #region Shield Bash */
                //Ability at keyboard number 2
                castDistance = 40;
                aoe = 40;
                xDif = this.x - GAME_ENGINE.mouseX + 10 - CAMERA.x;
                yDif = this.y - GAME_ENGINE.mouseY + 10 - CAMERA.y;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(mag, castDistance);
                xPos = this.x - (xDif / mag) * castDistance;
                yPos = this.y - (yDif / mag) * castDistance;

                ssAni1 = new Animation(AM.getAsset("./img/Shield Flash.png"), 32, 32, 1, 0.07, 6, true, 1.5);
                ss1 = new StillStand(ssAni1, 12, xPos, yPos);
                ss1.aniX = -13;
                ss1.aniY = -14;
                ss1.boundingbox = new BoundingBox(xPos - aoe / 4, yPos - aoe / 4, aoe, aoe);
                ss1.entityHitType = EntityTypes.enemies;
                ss1.onDraw = function () {
                    GAME_ENGINE.ctx.strokeStyle = color_yellow;
                    (GAME_ENGINE.debug) ? this.game.ctx.strokeRect(this.boundingbox.x,
                        this.boundingbox.y, this.boundingbox.width, this.boundingbox.height) : null;
                }
                ss1.damageObj = DS.CreateDamageObject(21, 0, DTypes.Normal, DS.CloneBuffObject(PremadeBuffs.StunLong));
                ss1.penetrative = true;
                this.abilityCD[number] = 75;
                this.castTime = 6;
                GAME_ENGINE.addEntity(ss1);
                /* #endregion */
                break;
            case 3:
                /* #region Self Heal */
                //Ability at keyboard number 3   heal_self_32x224
                ss1Ani = new Animation(AM.getAsset("./img/ability/heal_self_32x224.png"), 32, 32, 1, 0.07, 6, false, 1.75);
                ss1 = new StillStand(ss1Ani, 15, this.x, this.y);
                ss1.target = this;
                ss1.aniX = -12;
                ss1.aniY = 0;
                dmg = DS.CreateDamageObject(-40, 0, DTypes.None, DS.CloneBuffObject(PremadeBuffs.Haste));
                dmg.ApplyEffects(this);
                ss1.onUpdate = function () {
                    if (!this.target.right) {
                        ss1.aniX = -22;
                        ss1.aniY = 0;
                    } else {
                        ss1.aniX = -12;
                        ss1.aniY = 0;
                    }
                    this.x = this.target.x;
                    this.y = this.target.y;
                }
                GAME_ENGINE.addEntity(ss1);
                this.abilityCD[number] = 180;

                /* #endregion */
                break;
            case 4:
                /* #region Holy Strike */
                //Ability at keyboard number 4
                let angle = Math.atan2(GAME_ENGINE.mouseY - 20 - this.y - (this.height / 2) + CAMERA.y
                    , GAME_ENGINE.mouseX - 35 - this.x - (this.width / 2) + CAMERA.x);
                let box;
                let sprite = "./img/ability/holy_strike_right";
                castDistance = 20;
                aoe = 75;
                xDif = this.x - GAME_ENGINE.mouseX + 10 - CAMERA.x;
                yDif = this.y - GAME_ENGINE.mouseY + 10 - CAMERA.y;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                xPos = this.x - (xDif / mag) * castDistance;
                yPos = this.y - (yDif / mag) * castDistance;
                if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
                    //Right
                    sprite = "./img/ability/holy_strike_right";
                    box = new BoundingBox(xPos - aoe / 4 + 30, yPos - aoe / 4 + 30, aoe - 10, aoe - 30);
                } else if (angle > -3 * Math.PI / 4 && angle < -Math.PI / 4) {
                    //Up
                    sprite = "./img/ability/holy_strike_up";
                    box = new BoundingBox(xPos - 15, yPos - 25, aoe - 30, aoe - 10);
                } else if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) {
                    //Left
                    sprite = "./img/ability/holy_strike_left";
                    box = new BoundingBox(xPos - aoe / 4 - 30, yPos - aoe / 4 + 30, aoe - 10, aoe - 30);
                } else {
                    //Down
                    sprite = "./img/ability/holy_strike_down";
                    box = new BoundingBox(xPos - 15, yPos + 20, aoe - 30, aoe - 10);
                }

                ssAni1 = new Animation(AM.getAsset(sprite + ".png"), 32, 32, 1, 0.035, 11, false, 3.5);
                ss1 = new StillStand(ssAni1, 16, xPos, yPos);
                ss1.aniX = -49;
                ss1.aniY = -25;
                ss1.boundingbox = box;
                ss1.entityHitType = EntityTypes.enemies;
                ss1.onDraw = function () {
                    GAME_ENGINE.ctx.strokeStyle = color_yellow;
                    (GAME_ENGINE.debug) ? this.game.ctx.strokeRect(ss1.boundingbox.x, ss1.boundingbox.y, ss1.boundingbox.width, ss1.boundingbox.height) : null;
                }
                ss1.damageObj = DS.CreateDamageObject(41, 0, DTypes.True);
                ss1.penetrative = true;
                this.abilityCD[number] = 175;
                this.castTime = 13;
                GAME_ENGINE.addEntity(ss1);

                /* #endregion */
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
        if (this.health + amount > this.maxHealth) {
            amount = this.maxHealth - this.health;
        }
    } else if (amount < 0) {
        //display damage animation
        //maybe have a currentHealth change threshold 
        //to actually have it display
    }

    this.health += amount;//Damage will come in as a negative value;
    var healthHTML = document.getElementById("health");
    if (this.health >= 66)
        healthHTML.style.color = color_green;
    else if (this.health >= 33)
        healthHTML.style.color = color_yellow;
    else
        healthHTML.style.color = color_red;
    healthHTML.innerHTML = this.health;

}
/* #endregion */

/* #region Projectile */
/* #region Base Projectile */
function Projectile(spriteSheet, originX, originY, xTarget, yTarget, belongsTo) {
    this.origin = belongsTo;

    this.width = 100;
    this.height = 100;
    this.animation = new Animation(spriteSheet, this.width, this.height, 1, .085, 8, true, .75);

    this.targetType = 4;
    this.x = originX - CAMERA.x;
    this.y = originY - CAMERA.y;

    this.xTar = xTarget - 20;
    this.yTar = yTarget - 35;
    // Determining where the projectile should go angle wise.
    this.angle = Math.atan2(this.yTar - this.y, this.xTar - this.x);
    this.counter = 0; // Counter to make damage consistent
    this.childUpdate;//function
    this.childDraw;//function
    this.childCollide;//function
    this.speed = 200;
    this.projectileSpeed = 7.5;
    this.damageObj = DS.CreateDamageObject(15, 0, DTypes.Normal, null);
    this.penetrative = false;
    this.aniX = -18;
    this.aniY = -5;
    Entity.call(this, GAME_ENGINE, originX, originY);

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75);

}

Projectile.prototype.draw = function () {
    (typeof this.childDraw === 'function') ? this.childDraw() : null;
    this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x + this.aniX, this.y + this.aniY);
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = color_yellow;
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);
    }
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

    if (this.x - CAMERA.x < 16 || this.x - CAMERA.x > canvasWidth - 58
        || this.y - CAMERA.y < 0 || this.y - CAMERA.y > canvasHeight - 80) {
        this.removeFromWorld = true;
        GAME_ENGINE.removeEntity(this);
    }
    Entity.prototype.update.call(this);

    if (this.origin == 5) {
        for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
            var entityCollide = GAME_ENGINE.entities[4][i];
            if (this.boundingbox.collide(entityCollide.boundingbox)) {
                if (GAME_ENGINE.entities[4][i].health > 0) {
                    (typeof this.childCollide === 'function') ? this.childCollide(entityCollide) : null;
                    this.damageObj.ApplyEffects(GAME_ENGINE.entities[4][i]);
                    this.removeFromWorld = (this.penetrative) ? false : true;
                    GAME_ENGINE.removeEntity(this);
                }
            }
        }
    } else {
        if (this.boundingbox.collide(myPlayer.boundingbox)) {
            if (myPlayer.health > 0) {
                (typeof this.childCollide === 'function') ? this.childCollide(myPlayer) : null;
                this.damageObj.ApplyEffects(myPlayer);
                this.removeFromWorld = (this.penetrative) ? false : true;
                GAME_ENGINE.removeEntity(this);
            }
        }
    }

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // Hardcoded a lot of offset values

}
/* #endregion */

/* #region BoundingBox */
// BoundingBox for entities to detect collision.
function BoundingBox(x, y, width, height) {
    this.x = x - CAMERA.x;
    this.y = y - CAMERA.y;
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

/* #region Camera */
function Camera() {
    this.x = 0;
    this.y = 0;
}

Camera.prototype.update = function () { }

Camera.prototype.draw = function () { }


Camera.prototype.move = function (direction) {
    var positionChange = TILE_SIZE * 2 + 60;
    if (direction === "right") {
        this.x += canvasWidth;
        myPlayer.x += positionChange;
        myRoomNum += 1;
        BACKGROUND.x -= canvasWidth;
    } else if (direction === "left") {
        this.x -= canvasWidth;
        myPlayer.x -= positionChange;
        myRoomNum -= 1;
        BACKGROUND.x += canvasWidth;
    } else if (direction === "up") {
        this.y -= canvasHeight;
        myPlayer.y -= positionChange;
        myFloorNum -= 1;
        BACKGROUND.y += canvasHeight;
    } else {
        this.y += canvasHeight;
        myPlayer.y += positionChange;
        myFloorNum += 1;
        BACKGROUND.y -= canvasHeight;
    }
}
/* #endregion */

/* #region Menu */
function Menu() {
    GAME_ENGINE.ctx.font = "35px Arial";
    this.mageWidth = GAME_ENGINE.ctx.measureText("Mage").width;
    this.rangerWidth = GAME_ENGINE.ctx.measureText("Ranger").width;
    this.knightWidth = GAME_ENGINE.ctx.measureText("Knight").width;
    this.classButtonH = 35;
    this.mageButtonX = canvasWidth / 2 - (this.mageWidth / 2);
    this.rangerButtonX = canvasWidth / 2 - (this.rangerWidth / 2);
    this.knightButtonX = canvasWidth / 2 - (this.knightWidth / 2);
    this.mageButtonY = (canvasHeight - (this.classButtonH * 3)) / 4;
    this.rangerButtonY = 2 * this.mageButtonY + this.classButtonH;
    this.knightButtonY = this.rangerButtonY + this.classButtonH + this.mageButtonY;
    this.background = new Image();
    this.background.src = "./img/menu_background.png";
}

Menu.prototype.update = function () { }

Menu.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(this.background, 253, 0,
        canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
    this.createClassButton("Mage", this.mageButtonX, this.mageButtonY, this.mageWidth);
    this.createClassButton("Ranger", this.rangerButtonX, this.rangerButtonY, this.rangerWidth);
    this.createClassButton("Knight", this.knightButtonX, this.knightButtonY, this.knightWidth);
}

Menu.prototype.createClassButton = function (text, xPosition, YPosition, width) {
    var x = GAME_ENGINE.mouseX;
    var y = GAME_ENGINE.mouseY;
    if (x >= xPosition && x <= xPosition + width && y >= YPosition && y <= YPosition + this.classButtonH) {
        GAME_ENGINE.ctx.font = "bold 35px Arial";
    } else {
        GAME_ENGINE.ctx.font = "35px Arial";
    }
    GAME_ENGINE.ctx.strokeStyle = "black bold";
    GAME_ENGINE.ctx.strokeText(text, xPosition, YPosition + this.classButtonH - 8);
    GAME_ENGINE.ctx.fillStyle = color_white;
    GAME_ENGINE.ctx.fillText(text, xPosition, YPosition + this.classButtonH - 8);
}
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

    var xPosition;
    if ((x >= 0 && CAMERA.x >= 0) || (x < 0 && CAMERA.x < 0)) {
        xPosition = x - CAMERA.x;
    } else {
        xPosition = x + CAMERA.x;
    }
    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth, yindex * this.frameHeight,
        this.frameWidth, this.frameHeight,
        xPosition, y - CAMERA.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}


Animation.prototype.drawFrameIdle = function (ctx, x, y) {
    var xPosition;
    if ((x >= 0 && CAMERA.x >= 0) || (x < 0 && CAMERA.x < 0)) {
        xPosition = x - CAMERA.x;
    } else {
        xPosition = x + CAMERA.x;
    }
    ctx.drawImage(this.spriteSheet,
        0, 0,
        this.frameWidth, this.frameHeight,
        xPosition, y - CAMERA.y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function addHTMLListeners() {
    var volumeSlider = document.getElementById("volumeSlider");
    volumeSlider.addEventListener("change", function () {
        music.volume = volumeSlider.value;
        myCurrentVolume = music.volume;
    }, false);
    var muteButton = document.getElementById("muteButton");
    muteButton.addEventListener("click", function () {
        if (myIsMute) {
            music.volume = myCurrentVolume;
            muteButton.innerHTML = "Mute";
            volumeSlider.value = myCurrentVolume;
            myIsMute = false;
        } else {
            music.volume = 0.0;
            muteButton.innerHTML = "Unmute";
            volumeSlider.value = 0.0;
            myIsMute = true;
        }
    }, false);

}
/* #endregion */

/* #region Download queue and download */

// Ranger
for (let i = 0; i < 9; i++) {
    AM.queueDownload("./img/ability/multi_arrow_r_" + i + "_8x8.png");
    AM.queueDownload("./img/ability/multi_arrow_l_" + i + "_8x8.png");
    AM.queueDownload("./img/ability/multi_arrow_u_" + i + "_8x8.png");
    AM.queueDownload("./img/ability/multi_arrow_d_" + i + "_8x8.png");
}
AM.queueDownload("./img/ability/arrow_u_8x8.png");
AM.queueDownload("./img/ability/arrow_d_8x8.png");
AM.queueDownload("./img/ability/arrow_l_8x8.png");
AM.queueDownload("./img/ability/arrow_r_8x8.png");
AM.queueDownload("./img/ability/arrow_ul_8x8.png");
AM.queueDownload("./img/ability/arrow_ur_8x8.png");
AM.queueDownload("./img/ability/arrow_dl_8x8.png");
AM.queueDownload("./img/ability/arrow_dr_8x8.png");
AM.queueDownload("./img/ability/rain_of_arrows_32x384.png");
AM.queueDownload("./img/ability/root_trap_down.png");
AM.queueDownload("./img/ability/root_trap_up.png");
// Knight
AM.queueDownload("./img/swordBoomerang.png");
AM.queueDownload("./img/Shield Flash.png");
AM.queueDownload("./img/ability/heal_self_32x224.png");
AM.queueDownload("./img/ability/holy_strike_right.png");
AM.queueDownload("./img/ability/holy_strike_left.png");
AM.queueDownload("./img/ability/holy_strike_up.png");
AM.queueDownload("./img/ability/holy_strike_down.png");
AM.queueDownload("./img/ability/knight_attack_up.png");
AM.queueDownload("./img/ability/knight_attack_down.png");
AM.queueDownload("./img/ability/knight_attack_left.png");
AM.queueDownload("./img/ability/knight_attack_right.png");

// Mage
AM.queueDownload("./img/flash.png");
AM.queueDownload("./img/flame_breath_bolt.png");
AM.queueDownload("./img/ability/flame_ring_32x160.png");
AM.queueDownload("./img/ability/flame_explosion_32x320.png");
AM.queueDownload("./img/ability/greater_fireball_16x64.png");
// Floor Trap
AM.queueDownload("./img/floor_trap_up.png");
AM.queueDownload("./img/floor_trap_down.png");
// Boostpad
AM.queueDownload("./img/floor_boostpad_on.png");
AM.queueDownload("./img/floor_boostpad_off.png");
// Devil
AM.queueDownload("./img/devil.png");
AM.queueDownload("./img/devil_left.png");

// Acolyte
AM.queueDownload("./img/acolyte.png");
AM.queueDownload("./img/acolyte_left.png");

// Big Demon
AM.queueDownload("./img/monsters/big_demon_run.png");
AM.queueDownload("./img/monsters/big_demon_run_left.png");
AM.queueDownload("./img/monsters/big_demon_idle.png");

// Masked Orc
AM.queueDownload("./img/monsters/masked_orc_run.png");
AM.queueDownload("./img/monsters/masked_orc_run_left.png");
AM.queueDownload("./img/monsters/masked_orc_idle.png");

// Ogre
AM.queueDownload("./img/monsters/ogre_run.png");
AM.queueDownload("./img/monsters/ogre_run_left.png");
AM.queueDownload("./img/monsters/ogre_idle.png");

// Swampy
AM.queueDownload("./img/monsters/swampy_run.png");
AM.queueDownload("./img/monsters/swampy_run_left.png");
AM.queueDownload("./img/monsters/swampy_idle.png");

// Tiny Zombie
AM.queueDownload("./img/monsters/tiny_zombie_run.png");
AM.queueDownload("./img/monsters/tiny_zombie_run_left.png");
AM.queueDownload("./img/monsters/tiny_zombie_idle.png");

// Harrison's Fireball
AM.queueDownload("./img/fireball.png");
// Floor Gen Tiles
AM.queueDownload("./img/floor1.png");
AM.queueDownload("./img/floor2.png");
AM.queueDownload("./img/blacktile.png");
AM.queueDownload("./img/door_closed.png");

// spawning pool
AM.queueDownload("./img/zerg/spawning_pool.png");


AM.queueDownload("./img/terran/marine/marine_move_right.png");

AM.queueDownload("./img/zerg/infested/infested_move_right.png");
AM.queueDownload("./img/zerg/infested/infested_move_left.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    document.body.style.backgroundColor = "black";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    GAME_ENGINE.init(ctx);
    GAME_ENGINE.start();

    GAME_ENGINE.addEntity(new Menu());
    AUDIO = new Audio();
    addHTMLListeners();
    BACKGROUND = new Background();
    SCENE_MANAGER = new SceneManager();
});
/* #endregion */