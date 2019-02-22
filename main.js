//color constants
const color_green = "lightgreen";
const color_red = "red";
const color_yellow = "yellow";
const color_white = "white";

/* #region Constants */
const AM = new AssetManager();
const GAME_ENGINE = new GameEngine();
const CAMERA = new Camera();
const DS = new DamageSystem();

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
    this.width = 16;
    this.height = 28;
    this.scale = 1.5;
    this.xOffset = xOffset * this.scale;
    this.yOffset = yOffset * this.scale;
    this.animationRun = new Animation(spritesheet, this.width, this.height, 1, 0.08, 4, true, this.scale);
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
    this.baseMaxMovespeed = 2;
    this.maxMovespeedRatio = 1;
    this.maxMovespeedAdj = 0;
    this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj) * this.sprint;
    this.right = true;
    this.health = 100;
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
        var speedHTML = document.getElementById("speed");
        speedHTML.innerHTML = + actualSpeed + "%";
        if (actualSpeed === 100)
            speedHTML.style.color = color_green;
        else if (actualSpeed < 100)
            speedHTML.style.color = color_red;
        else
            speedHTML.style.color = color_white;
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
                let tempTrap = new RangerBoostPad(AM.getAsset("./img/floor_boostpad_on.png"),
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
                let ss1 = new StillStand(new Animation(AM.getAsset("./img/fireball.png")
                    , 100, 100, 1, .085, 8, true, .75), 7 * 7, xPos - 30, yPos - 30);

                ss1.boundingbox = new BoundingBox(ss1.x - aoe / 2, ss1.y - aoe / 2, aoe, aoe);
                dmg = DS.CreateDamageObject(4, 0, DTypes.Piercing, DS.CloneBuffObject(PremadeBuffs.Slow));
                dmg.timeLeft = 7;
                ss1.entityHitType = EntityTypes.enemies;
                ss1.damageObj = dmg;
                ss1.penetrative = true;
                GAME_ENGINE.addEntity(ss1);
                this.abilityCD[number] = 120;
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
                ss1 = new StillStand(ss1Ani, 10, this.x, this.y);
                this.x -= (xDif / mag) * castDistance + 12;
                this.y -= (yDif / mag) * castDistance + 30;
                ss2 = new StillStand(ss2Ani, 10, this.x, this.y);

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
                let tempPro = new GreaterFireball(AM.getAsset("./img/ability/greater_fireball_16x64.png")
                    , AM.getAsset("./img/ability/flame_explosion_32x320.png")
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
                for (let i = 0; i < 30; i++) {
                    tempPro2 = new FlameBreathBolt(AM.getAsset("./img/flame_breath_bolt.png")
                        , this.x - (this.width / 2), this.y - (this.height / 2), GAME_ENGINE.mouseX, GAME_ENGINE.mouseY);
                    GAME_ENGINE.addEntity(tempPro2);
                }
                this.castTime = 8;
                this.abilityCD[number] = 75;
                /* #endregion */
                break;
            case 4:
                /* #region Flame Strike */
                //Ability at keyboard number 4
                castDistance = 145;
                xDif = this.x - GAME_ENGINE.mouseX;
                yDif = this.y - GAME_ENGINE.mouseY;
                mag = Math.pow(Math.pow(xDif, 2) + Math.pow(yDif, 2), 0.5);
                castDistance = Math.min(castDistance, mag);
                xPos = -(xDif / mag) * castDistance - 12 + this.x;
                yPos = -(yDif / mag) * castDistance - 30 + this.y;
                ss1Ani = new Animation(AM.getAsset("./img/ability/flame_ring_32x160.png"),32,32,1,0.13,5,true,1.5);
                ss2Ani = new Animation(AM.getAsset("./img/ability/flame_explosion_32x320.png"),32,32,1,0.08,10,false,2);
                ss1 = new StillStand(ss1Ani, 40, xPos, yPos);
                ss1.ssAni = ss2Ani;
                ss1.width = 50;
                ss1.height = 50;
                ss1.aniX = -32*1.5/2 + 12;
                ss1.aniY = -32*1.5/2 + 22;
                ss1.entityHitType = EntityTypes.enemies;
                ss1.onDeath = function () {
                    let ss3 = new StillStand(this.ssAni,9,this.x,this.y);
                    ss3.entityHitType = this.entityHitType;
                    ss3.boundingbox = new BoundingBox(this.x - this.width/2, this.y - this.height/2,this.width, this.height);
                    ss3.damageObj = DS.CreateDamageObject(45, 0, DTypes.Magic);
                    ss3.penetrative = true;
                    ss3.aniX = -32*2/2 + 12;
                    ss3.aniY = -32*2/2 + 22;
                    GAME_ENGINE.addEntity(ss3);
                }
                GAME_ENGINE.addEntity(ss1);
                this.abilityCD[number] = 18;
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
                    GAME_ENGINE.mouseX, GAME_ENGINE.mouseY);
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
                ss1 = new StillStand(ssAni1, 12, xPos, yPos);
                ss1.boundingbox = new BoundingBox(xPos + 5, yPos + 2, aoe, aoe);
                ss1.entityHitType = EntityTypes.enemies;
                ss1.onDraw = function () {
                    GAME_ENGINE.ctx.strokeStyle = color_yellow;
                    //this.game.ctx.strokeRect(xPos + 5, yPos + 2, aoe, aoe);
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

/* #region Monster */
/* #region Base Monster */

function Monster(game, spritesheet) {
    Entity.call(this, game, 0, 350);

    // behavior stuff
    this.visionWidth = 100
    this.visionHeight = 100;
    this.ticksSinceLastHit = 0;
    this.isRanged = false;
    this.pause = false;
    this.inRange = false;
    this.castCooldown = 0;
    this.isStunned = false;
    this.scale = 1;
    this.width = 40;
    this.height = 56;
    this.animation = new Animation(spritesheet, this.width, this.height, 1, 0.15, 15, true, this.scale);
    this.speed = 100;
    this.health = 100;
    this.damageObjArr = [];
    this.damageObj = DS.CreateDamageObject(20, 0, DTypes.Normal, DS.CloneBuffObject(PremadeBuffs.HasteWeak));
    this.buffObj = [];
    this.counter = 0;

    this.visionBox = new BoundingBox(this.x, this.y,
        this.visionWidth * this.scale, this.visionHeight * this.scale);
    this.boundingbox = new BoundingBox(this.x, this.y,
        this.width * this.scale, this.height * this.scale); // **Temporary** Hard coded offset values.
}

Monster.prototype.draw = function () {
    this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x, this.y);
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = "red";
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);
    }

    // Displaying Monster health
    GAME_ENGINE.ctx.font = "15px Arial";
    GAME_ENGINE.ctx.fillStyle = "white";
    GAME_ENGINE.ctx.fillText("Health: " + Math.floor(this.health), this.x - 5 - CAMERA.x, this.y - 5 - CAMERA.y);
}

function distance(monster) {
    var dx = playerX - monster.x;
    var dy = playerX - monster.y;
    return Math.sqrt(dx * dx, dy * dy);
}

Monster.prototype.update = function () {
    if (this.health <= 0) this.removeFromWorld = true;

    // based on the number of ticks since the player was last hit, we pause the monster
    if (this.pause == false || !this.isStunned) {
        // get the direction vector pointing towards player
        var dirX = playerX - this.x;
        var dirY = playerY - this.y;
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

    this.visionBox = new BoundingBox(this.x, this.y,
        this.visionWidth * this.scale * 5, this.visionHeight * this.scale * 5);

    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        this.counter += GAME_ENGINE.clockTick;
        this.damageObj.ApplyEffects(myPlayer);
        this.pause = true;
        if (this.counter > .018 && myPlayer.health > 0) {
            //player.health -= 5;
        }
        this.counter = 0;
    }

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

function Devil(spritesheet) {
    Monster.call(this, GAME_ENGINE, spritesheet);
    this.scale = 3;
    this.width = 16;
    this.height = 23;
    this.speed = 45;
    this.health = 200;

    this.x = 250;
    this.y = 250;

    this.counter = 0;
    this.animation = new Animation(spritesheet, this.width, this.height, 128, 0.15, 8, true, this.scale);
}

function Acolyte(spritesheet) {
    Monster.call(this, GAME_ENGINE, spritesheet);
    this.scale = 2;
    this.width = 16;
    this.height = 19;
    this.speed = 25;
    this.health = 150;
    this.isRanged = true;

    this.animation = new Animation(spritesheet, this.width, this.height, 64, 0.15, 4, true, this.scale);

    this.x = 200;
    this.y = 200;

    this.counter = 0;
}
/* #endregion */
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
        this.width - 75, this.height - 75); // Hardcoded a lot of offset values

}

Projectile.prototype.draw = function () {
    (typeof this.childDraw === 'function') ? this.childDraw() : null;
    this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x + this.aniX, this.y + this.aniY); // Hardcoded a lot of offset values
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

    if (this.x - CAMERA.x < 16 || this.x - CAMERA.x > 460
        || this.y - CAMERA.y < 0 || this.y - CAMERA.y > 430) this.removeFromWorld = true;
    Entity.prototype.update.call(this);

    this.boundingbox = new BoundingBox(this.x + 8, this.y + 25,
        this.width - 75, this.height - 75); // **Temporary** Hard coded offset values.


    if (this.origin == 5) {
        for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
            var entityCollide = GAME_ENGINE.entities[4][i];
            if (this.boundingbox.collide(entityCollide.boundingbox)) {
                if (GAME_ENGINE.entities[4][i].health > 0) {
                    (typeof this.childCollide === 'function') ? this.childCollide(entityCollide) : null;
                    this.damageObj.ApplyEffects(GAME_ENGINE.entities[4][i]);
                    this.removeFromWorld = (this.penetrative) ? false : true;
                }
            }
        }
    }
    else {
        if (this.boundingbox.collide(myPlayer.boundingbox)) {
            if (myPlayer.health > 0) {
                (typeof this.childCollide === 'function') ? this.childCollide(myPlayer) : null;
                this.damageObj.ApplyEffects(myPlayer);
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


function SwordBoomerang(spriteSheet, originX, originY, xTarget, yTarget) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, 5/* same number assignment as the ent array*/);
    this.projectileSpeed = 7;
    this.timeLeft = 60;
    this.thrower = null;
    this.speedChange = -7 / 30;
    this.penetrative = true;
    this.damageObj = DS.CreateDamageObject(45, 0, DTypes.Slashing
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

function GreaterFireball(spriteSheet, spriteSheetAoe, originX, originY, xTarget, yTarget, targetType) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, 5);
    this.projectileSpeed = 5;
    this.penetrative = false;
    this.aoe = 100;//square
    this.targetType = targetType;
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

function FlameBreathBolt(spriteSheet, originX, originY, xTarget, yTarget) {
    Projectile.call(this, spriteSheet, originX, originY, xTarget, yTarget, 5);
    this.xTar = xTarget - 20;
    this.yTar = yTarget - 35;
    this.range = 90;
    this.damageObj = DS.CreateDamageObject(2.25, 0, DTypes.Magic);
    this.animation = new Animation(spriteSheet, 8, 8, 1, .084, 4, true, 1);
    this.aniX += 34;
    this.aniY += 38;
    // Determining where the projectile should go angle wise.
    //radians
    let converter = Math.PI / 360;
    let spread = 90;
    this.angle = Math.atan2(this.yTar - originY, this.xTar - originX);
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
/* #endregion */
/* #endregion */

/* #region Trap */
/* #region Base Trap */
function Trap(spriteSheetUp, spriteSheetDown) {
    this.animationUp = new Animation(spriteSheetUp, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationDown = new Animation(spriteSheetDown, 16, 16, 1, 0.13, 4, true, 1.25);
    this.animationIdle = this.animationUp;
    this.x = 200; // Hardcorded temp spawn
    this.y = 200; // Hardcorded temp spawn
    this.activated = false; // Determining if trap has been activated
    this.counter = 0; // Counter to calculate when trap related events should occur
    this.doAnimation = false; // Flag to determine if the spikes should animate or stay still
    this.damageObj = DS.CreateDamageObject(10, 0, DTypes.Normal, DS.CloneBuffObject(PremadeBuffs.SlowStrong));

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
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = color_red;
        GAME_ENGINE.ctx.strokeRect(this.x, this.y, 20, 20); // **Temporary** Hard coded offset values
    }
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
/* #endregion */

/* #region Trap Types */
RangerBoostPad.prototype = Trap.prototype;

function RangerBoostPad(spriteSheetUp, spriteSheetDown) {
    Trap.call(this, spriteSheetUp, spriteSheetDown);
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
    (typeof this.boundingbox !== 'undefined' && GAME_ENGINE.debug) ? function () {GAME_ENGINE.ctx.strokeStyle = color_yellow;
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);} : null;
    this.ani.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x + this.aniX, this.y + this.aniY);
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
    if (direction === "right") {
        this.x += canvasWidth;
        myPlayer.x = 60 + CAMERA.x;
        myRoomNum += 1;
        BACKGROUND.x -= 320;
    } else if (direction === "left") {
        this.x -= canvasWidth;
        myPlayer.x = canvasWidth - TILE_SIZE * 2 - 60 + CAMERA.x;
        myRoomNum -= 1;
        BACKGROUND.x += 320;
    } else if (direction === "up") {
        this.y -= canvasHeight;
        myPlayer.y = canvasHeight - TILE_SIZE * 2 - 60 + CAMERA.y;
        myFloorNum -= 1;
        BACKGROUND.y += 320;
    } else {
        this.y += canvasHeight;
        myPlayer.y = 60 + CAMERA.y;
        myFloorNum += 1;
        BACKGROUND.y -= 320;
    }
    document.getElementById("location").innerHTML = "Location: " + myFloorNum + "-" + myRoomNum;
}
/* #endregion */

/* #region Door */
function Door(theX, theY, theDirection) {
    this.x = theX;
    this.y = theY;
    this.direction = theDirection;
    this.image = new Image();
    this.image.src = "./img/door_closed.png";
    this.boundingbox = new BoundingBox(this.x, this.y, 32, 32);
}

Door.prototype.update = function () {
    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        CAMERA.move(this.direction);
    }
}

Door.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(this.image, this.x - CAMERA.x, this.y - CAMERA.y, 32, 32);
}
/* #endregion */

/* #region Wall */
function Wall(theX, theY, theDirection) {
    this.x = theX;
    this.y = theY;
    this.direction = theDirection;
    this.image = new Image();
    this.image.src = "./img/floor1.png";
    this.boundingbox = new BoundingBox(this.x, this.y, 16, 16);
}

Wall.prototype.update = function () {
    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        if (this.direction === "up") {
            myPlayer.y += myPlayer.actualSpeed;
        } else if (this.direction === "down") {
            myPlayer.y -= myPlayer.actualSpeed;
        } else if (this.direction === "left") {
            myPlayer.x += myPlayer.actualSpeed;
        } else {
            myPlayer.x -= myPlayer.actualSpeed;
        }
    }

    for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
        var entity = GAME_ENGINE.entities[4][i];
        if (this.boundingbox.collide(entity.boundingbox)) {
            var distance = entity.speed / 100;
            if (this.direction === "up") {
                entity.y += distance;
            } else if (this.direction === "down") {
                entity.y -= distance;
            } else if (this.direction === "left") {
                entity.x += distance;
            } else {
                entity.x -= distance;
            }
        }
    }

}

Wall.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(this.image, this.x - CAMERA.x, this.y - CAMERA.y, 16, 16);
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

/* #region Background */
function Background() {
    this.x = -640;
    this.y = -640;
    // Keeping track of the last direction the generator has moved.
    // 0 = North
    // 1 = East
    // 2 = South
    // 3 = West
    this.face = [];
    this.facePos = [];
    this.directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    this.map = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];
    this.row = 2;
    this.col = 2;
    this.roomCount = 0;
    this.maxRoomCount = 6;
    this.map[this.row][this.col] = 2;
    this.facePos.push([this.col, this.row]);
    this.three = new Image();
    this.three.src = "./img/floor1.png";
    this.zero = new Image();
    this.zero.src = "./img/floor2.png";
    this.two = new Image();
    this.two.src = "./img/blacktile.png";
    this.tile = null;
    this.drawFaceCount = 0;
}

Background.prototype.draw = function () {
    for (let i = 0; i < this.map.length; i++) {
        for (let j = 0; j < this.map[i].length; j++) {
            for (let r = 0; r < 20; r++) {
                for (let s = 0; s < 20; s++) {
                    // Determining tiles to choose
                    let tempTile = ROOMS[this.map[i][j]][r * 20 + s];
                    if (tempTile === 0) {
                        this.tile = this.zero;
                    }
                    // else if (tempTile === 2) {
                    //     this.tile = this.two;
                    // } 
                    else if (tempTile === 3) {
                        this.tile = this.three;
                    }
                    // Drawing Tiles
                    if (tempTile === 0 || tempTile === 3) {
                        GAME_ENGINE.ctx.drawImage(this.tile, this.x + j * canvasWidth + s * TILE_SIZE,
                            this.y + i * canvasHeight + r * TILE_SIZE);
                    }
                }
            }
        }
    }
}

Background.prototype.update = function () {
};

Background.prototype.createWalls = function () {
    var flag = true;
    for (let i = 0; i < this.map.length; i++) {
        for (let j = 0; j < this.map[i].length; j++) {
            for (let row = 0; row < 20; row++) {
                for (let col = 0; col < 20; col++) {
                    let tempTile = ROOMS[this.map[i][j]][row * 20 + col];
                    if (tempTile === 1) {
                        if (col === 0 && row != 0 && row != 19) {
                            GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE,
                                this.y + i * canvasHeight + row * TILE_SIZE, "left"));
                        } else if (col === 19 && row != 0 & row != 19) {
                            GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE,
                                this.y + i * canvasHeight + row * TILE_SIZE, "right"));
                        } else if (row === 19) {
                            GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE,
                                this.y + i * canvasHeight + row * TILE_SIZE, "down"));
                        } else if (row === 0) {
                            GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE,
                                this.y + i * canvasHeight + row * TILE_SIZE, "up"));
                        }
                    }
                }
            }
        }
    }
}

Background.prototype.createDoors = function () {
    for (let i = 0; i < this.map.length; i++) {
        for (let j = 0; j < this.map[i].length; j++) {
            // Drawing doors
            if (this.drawFaceCount < this.maxRoomCount && this.map[i][j] !== 0) {
                let testPos = this.facePos[this.drawFaceCount];
                if (this.face[this.drawFaceCount] === 0) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 144 + BACKGROUND.x,
                        testPos[1] * canvasHeight + BACKGROUND.y, "up"));
                } else if (this.face[this.drawFaceCount] === 1) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 288 + BACKGROUND.x,
                        testPos[1] * canvasHeight + 144 + BACKGROUND.y, "right"));
                } else if (this.face[this.drawFaceCount] === 2) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 144 + BACKGROUND.x,
                        testPos[1] * canvasHeight + 288 + BACKGROUND.y, "down"));
                } else if (this.face[this.drawFaceCount] === 3) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + BACKGROUND.x,
                        testPos[1] * canvasHeight + 144 + BACKGROUND.y, "left"));
                }
                this.drawFaceCount++;
            }
        }
    }
}

Background.prototype.validDirection = function () {
    while (this.roomCount < this.maxRoomCount) {

        let randomDirection = Math.floor(Math.random() * Math.floor(4));
        let tempRow = this.row + this.directions[randomDirection][0];
        let tempCol = this.col + this.directions[randomDirection][1];
        if (randomDirection === 0 && this.face[this.face.length - 1] === 2
            || randomDirection === 2 && this.face[this.face.length - 1] === 0
            || randomDirection === 1 && this.face[this.face.length - 1] === 3
            || randomDirection === 3 && this.face[this.face.length - 1] === 1) {
            randomDirection = Math.floor(Math.random() * Math.floor(4));
        } else {

            if (tempRow < this.map.length && tempRow > 0 && tempCol < this.map.length && tempCol > 0

                && this.map[tempRow][tempCol] === 0) {
                this.face.push(randomDirection);
                this.row += this.directions[randomDirection][0];
                this.col += this.directions[randomDirection][1];

                this.facePos.push([this.col, this.row]);
                this.map[this.row][this.col] = 1;
                if (this.roomCount + 1 === this.maxRoomCount) {

                    this.map[this.row][this.col] = 3;
                }
                this.roomCount++;
            }
        }
    }
    // Popping off the last room because it does not require a door.
    this.facePos.pop();


    // this.map[1][0] = 1;
    // this.map[2][0] = 1;
    // this.map[3][0] = 1;
    // this.map[4][0] = 1;
    // this.map[4][1] = 3;
    // this.face.push(2);
    // this.face.push(2);
    // this.face.push(2);
    // this.face.push(2);
    // this.face.push(1);
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
/* #endregion */

/* #region Download queue and download */

// Ranger
AM.queueDownload("./img/ranger_run.png");
for (let i = 0; i < 9; i++){
    AM.queueDownload("./img/ability/multi_arrow_" + i + "_8x8.png");
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
AM.queueDownload("./img/knight_run.png");
AM.queueDownload("./img/swordBoomerang.png");
AM.queueDownload("./img/Shield Flash.png");
AM.queueDownload("./img/ability/heal_self_32x224.png");
AM.queueDownload("./img/ability/holy_strike_right_32x352.png");
// Mage
AM.queueDownload("./img/mage_run.png");
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
// Acolyte
AM.queueDownload("./img/acolyte.png");
// Harrison's Fireball
AM.queueDownload("./img/fireball.png");
// Floor Gen Tiles
AM.queueDownload("./img/floor1.png");
AM.queueDownload("./img/floor2.png");
AM.queueDownload("./img/blacktile.png");
AM.queueDownload("./img/door_closed.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    document.body.style.backgroundColor = "black";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    GAME_ENGINE.init(ctx);
    GAME_ENGINE.start();

    GAME_ENGINE.addEntity(new Menu());
    BACKGROUND = new Background();
    SCENE_MANAGER = new SceneManager();
});
/* #endregion */