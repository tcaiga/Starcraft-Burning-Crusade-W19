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
var myScore = 0;
var myLevel = 1;
var myGodMode = 1;
var myVictoryScreen = new Image();
myVictoryScreen.src = "./img/utilities/victory_screen.png";

// Constant variable for tile size
const TILE_SIZE = 16;
/* #endregion */

/* #region Player */
function Player(runSheets, shootSheets, deathSheet, xOffset, yOffset) {
    // Relevant for Player box
    this.width = 32;
    this.height = 32;
    this.scale = 1.5;
    this.xOffset = xOffset * this.scale;
    this.yOffset = yOffset * this.scale;
    this.animationRunSide = new Animation(runSheets["side"], this.width, this.height, 1, 0.04, 9, true, this.scale);
    this.animationRunUp = new Animation(runSheets["up"], this.width, this.height, 1, 0.04, 9, true, this.scale);
    this.animationRunDown = new Animation(runSheets["down"], this.width, this.height, 1, 0.04, 9, true, this.scale);
    this.animationShootSide = new Animation(shootSheets["side"], this.width, this.height, 1, 0.04, 2, true, this.scale);
    this.animationShootUp = new Animation(shootSheets["up"], this.width, this.height, 1, 0.04, 2, true, this.scale);
    this.animationShootDown = new Animation(shootSheets["down"], this.width, this.height, 1, 0.04, 2, true, this.scale);
    this.animationDeath = new Animation(deathSheet, 65, 40, 1, 0.04, 8, true, this.scale);
    this.animationIdle = this.animationRunSide;
    this.x = 295;
    this.y = 295;
    this.xScale = 1;    /*Used to flip the spritesheets if left */
    this.damageObjArr = [];
    this.buffObj = [];
    this.abilityCD = [0, 0, 0, 0, 0];
    this.cooldownRate = 1;
    this.cooldownAdj = 0;
    this.castTime = 0;
    this.isStunned = false;
    this.dead = false;
    this.baseMaxMovespeed = 2.5;
    this.velocity = { x: 0, y: 0 };
    this.friction = .5;
    this.baseAcceleration = { x: 1, y: 1 };
    this.accelerationRatio = 1;
    this.accelerationAdj = 0;
    this.maxMovespeedRatio = 1;
    this.maxMovespeedAdj = 0;
    this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj);
    this.runDirection = "right";
    this.shootDirection = "right";
    this.lastShootDirection = "right";
    this.maxAmmo = 30;
    this.currentAmmo = this.maxAmmo;
    this.reloadTime = 80;
    this.reloadCounter = 0;
    this.maxShootCounter = 0.1;
    this.shootCounter = this.maxShootCounter;
    this.maxHealth = 500;
    this.health = this.maxHealth;
    this.healthPercent = 100;
    this.dontdraw = 0;
    this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    this.reloadRatio = 1;
    this.shootSpeedRatio = 1;
}

Player.prototype.draw = function () {
    if (SCENE_MANAGER.levelTransition) {
        GAME_ENGINE.ctx.fillStyle = "black";
        GAME_ENGINE.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        GAME_ENGINE.ctx.fillStyle = color_white;
        GAME_ENGINE.ctx.font = "30px Starcraft";
        GAME_ENGINE.ctx.fillText("Level: " + myLevel, 208, 260);
        GAME_ENGINE.ctx.fillText("Score: " + myScore, 208, 300);
        GAME_ENGINE.ctx.font = "20px Starcraft";
        GAME_ENGINE.ctx.fillText("Click here to Continue", 170, 375);
    } else if (SCENE_MANAGER.victory) {
        GAME_ENGINE.ctx.drawImage(myVictoryScreen, 0, 0);
    } else {
        this.xScale = 1;
        var xValue = this.x;
        //draw player character with no animation if player is not currently moving
        if (this.dontdraw <= 0) {
            if (this.dead) {
                this.animationDeath.drawFrameAniThenIdle(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                /* displays text for game over screen*/
                GAME_ENGINE.ctx.font = "50px Starcraft";
                GAME_ENGINE.ctx.fillStyle = color_red;
                GAME_ENGINE.ctx.fillText("Game Over", 135, 200);
                GAME_ENGINE.ctx.font = "30px Starcraft";
                GAME_ENGINE.ctx.fillText("Play Again", 208, 275);
            } else {
                // if statements for shooting logic
                if (GAME_ENGINE.shoot === true && this.currentAmmo > 0 && !GAME_ENGINE.reload) {
                    // if statements for running logic
                    if (this.shootDirection === "left") {
                        GAME_ENGINE.ctx.save();
                        GAME_ENGINE.ctx.scale(-1, 1);
                        this.xScale = -1;
                        xValue = -this.x - this.width;
                    }
                    if (this.shootDirection === "left" || this.shootDirection === "right") {
                        this.animationShootSide.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                    } else if (this.shootDirection === "up") {
                        this.animationShootUp.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                    } else {
                        this.animationShootDown.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                    }
                } else if (!GAME_ENGINE.movement) {
                    // if statements for running logic
                    if (this.shootDirection === "left") {
                        GAME_ENGINE.ctx.save();
                        GAME_ENGINE.ctx.scale(-1, 1);
                        this.xScale = -1;
                        xValue = -this.x - this.width;
                    }
                    //animation for when player is not moving or shooting
                    this.animationIdle.drawFrameIdle(GAME_ENGINE.ctx, xValue, this.y);
                } else {
                    // if statements for running logic
                    if (this.runDirection === "left") {
                        GAME_ENGINE.ctx.save();
                        GAME_ENGINE.ctx.scale(-1, 1);
                        this.xScale = -1;
                        xValue = -this.x - this.width;
                    }
                    if (this.runDirection === "left" || this.runDirection === "right") {
                        this.animationRunSide.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                    } else if (this.runDirection === "up") {
                        this.animationRunUp.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                    } else {
                        this.animationRunDown.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, xValue, this.y);
                    }
                }
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
}

Player.prototype.update = function () {
    // Player movement controls
    if (this.dead || SCENE_MANAGER.levelTransition || SCENE_MANAGER.victory) {
        return;
    }
    this.velocity = (this.castTime > 0 || this.isStunned) ? { x: 0, y: 0 } : this.velocity;
    if (this.castTime <= 0 && !this.isStunned) {
        /* #region  */
        /* #region Player movement controls */

        this.actualSpeed = (this.baseMaxMovespeed * this.maxMovespeedRatio + this.maxMovespeedAdj);
        if (GAME_ENGINE.keyA === true) {
            this.x -= this.actualSpeed;
            this.runDirection = "left";
        }
        if (GAME_ENGINE.keyD === true) {
            this.x += this.actualSpeed;
            this.runDirection = "right";
        }
        if (GAME_ENGINE.keyW === true) {
            this.y -= this.actualSpeed;
            this.runDirection = "up";
        }
        if (GAME_ENGINE.keyS === true) {
            this.y += this.actualSpeed;
            this.runDirection = "down";
        }
        /* #endregion */

        //stop player from reloading when at full ammo
        if (GAME_ENGINE.reload && this.currentAmmo === this.maxAmmo) {
            GAME_ENGINE.reload = false;
        }
        //Reload  if user presses reload button or runs out of ammo
        if ((this.currentAmmo <= 0 || GAME_ENGINE.reload) && this.reloadCounter < this.reloadTime) {
            this.reloadCounter += this.reloadRatio;
        } else if (this.currentAmmo <= 0 || GAME_ENGINE.reload) {
            this.currentAmmo = this.maxAmmo;
            this.reloadCounter = 0;
            GAME_ENGINE.reload = false;

            /* #endregion */
        }
        let spellCast = false, q, selectSpell;
        for (q in GAME_ENGINE.digit) {
            if (GAME_ENGINE.digit[q]) {
                selectSpell = parseInt(q);
                spellCast = true;
            }
        }

        //casts the selected spell if it is off cooldown
        if (spellCast || this.abilityCD[selectSpell] <= 0) {
            this.castSpell(selectSpell);
        }

        if (GAME_ENGINE.keyUp === true) {
            //changes the direction to shoot the projectile
            this.shootDirection = "up";
            //changes the idle animation to last direction shot
            this.animationIdle = this.animationRunUp;
        } else if (GAME_ENGINE.keyLeft === true) {
            this.shootDirection = "left";
            this.animationIdle = this.animationRunSide;
        } else if (GAME_ENGINE.keyRight === true) {
            this.shootDirection = "right";
            this.animationIdle = this.animationRunSide;
        } else {
            this.shootDirection = "down";
            this.animationIdle = this.animationRunDown;
        }
        this.lastShootDirection = this.shootDirection;

        if (GAME_ENGINE.shoot && this.currentAmmo > 0 && !GAME_ENGINE.reload) {
            if (this.shootCounter >= this.maxShootCounter) {
                var projectile = new Projectile(AM.getAsset("./img/terran/bullet.png"),
                    myPlayer.x + 15,
                    myPlayer.y + 23,
                    0, 0, 5, this.shootDirection);
                GAME_ENGINE.addEntity(projectile);
                this.currentAmmo--;
                this.shootCounter = 0;

                if (!myIsMute) {
                    //audio for gunshot
                    var gunShot = new Audio("./audio/marine/marine_shoot.wav");
                    gunShot.volume = myCurrentVolume - 0.02;
                    gunShot.play();
                }
            } else {
                this.shootCounter += GAME_ENGINE.clockTick * this.shootSpeedRatio;
            }
        }
        /* #region  */
        //updates ammo img based on current ammo count
        var ammoHTML = document.getElementById("ammoImg");
        if (GAME_ENGINE.reload) {
            ammoHTML.src = "./img/utilities/ammo_count/bullet_0.png";
        } else {
            ammoHTML.src = "./img/utilities/ammo_count/bullet_" + Math.ceil(this.currentAmmo / 3) + ".png";
        }
    } else {
        this.castTime--;
    }
    /* #region Abilities */
    let t;
    for (t in this.abilityCD) {
        this.abilityCD[t] += (this.abilityCD[t] > 0) ? -1 : 0;
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

    if (this.health <= 0) {
        this.dead = true;
        if (!myIsMute) {
            var deathSound = new Audio("./audio/marine/marine_death.wav");
            deathSound.volume = myCurrentVolume;
            deathSound.play();
            var loseAudio = new Audio("./audio/lose.wav");
            loseAudio.volume = myCurrentVolume;
            loseAudio.play();
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

    this.boundingbox = new BoundingBox(this.x + (this.xScale * 8), this.y + 2,
        this.width, this.height + 11); /*offsets for x, y and height are for this specific spritesheet*/
    /* #endregion */


}

function shootDirectionToVec(dir) {
    let result = { x: 0, y: 0 };
    switch (dir) {
        case "up":
            result.y--;
            break;
        case "down":
            result.y++;
            break;
        case "left":
            result.x--;
            break;
        case "right":
            result.x++;
            break;
    }
    return result;
}

Player.prototype.castSpell = function (number) {
    let totalDamage, cooldDown, speed, aoe, origin, dir
        , msInc, reloadInc, shootspeedInc, totalHeal, duration, interval;
    // AM.getAsset("./img/terran/abilities/rocket/rocket_explosion.png");
    // AM.getAsset("./img/terran/abilities/incendiary_shot.png");
    // AM.getAsset("./img/terran/abilities/self_heal.png");
    // AM.getAsset("./img/terran/abilities/stimpack.png");
    dir = shootDirectionToVec(this.lastShootDirection);
    if (this.abilityCD[number] <= 0) {
        switch (number) {
            case 1://Grenade
                totalDamage = 10;
                cooldDown = 120;
                speed = 8;
                aoe = 125;
                origin = 5;
                let tempPro = new Grenade(null, AM.getAsset("./img/terran/abilities/rocket/rocket_explosion.png"), this.x + 13, this.y + 13, dir.x, dir.y, origin);
                tempPro.damageObjonExplosion.damage = totalDamage;
                tempPro.projectileSpeed = speed;
                tempPro.aoe = aoe;
                GAME_ENGINE.addEntity(tempPro);
                this.abilityCD[number] = cooldDown;
                break;
            case 2://Stimpack
                let selfDamage = 20;
                cooldDown = 400;
                duration = 200;
                msInc = 1.5;
                shootspeedInc = 1.25;
                reloadInc = 2;
                let tempObj = []
                tempObj.push(DS.CreateEffectObject(ETypes.ReloadR, reloadInc, 1 / reloadInc, duration, 0));
                tempObj.push(DS.CreateEffectObject(ETypes.MoveSpeedR, msInc, 1 / msInc, duration, 0));
                tempObj.push(DS.CreateEffectObject(ETypes.ShootSpeedR, shootspeedInc, 1 / shootspeedInc, duration, 0));
                DS.CreateDamageObject(selfDamage, 0, DTypes.True, DS.CreateBuffObject("Stimpack", tempObj)).ApplyEffects(this);

                let ani2 = new Animation(AM.getAsset("./img/terran/abilities/stimpack.png"), 25, 25, 1, .085, 4, true, 2);
                let ss2 = new StillStand(ani2, duration, this.x, this.y);
                ss2.player = this;
                ss2.onUpdate = function () {
                    if (this.player.xScale < 0) {
                        this.x = this.player.x - 14;
                    } else {
                        this.x = this.player.x + 2;
                    }
                    this.y = this.player.y - 26;
                }
                GAME_ENGINE.addEntity(ss2);

                this.abilityCD[number] = cooldDown;
                break;
            case 3://Selfheal
                totalHeal = this.maxHealth * 0.4;
                cooldDown = 600;
                duration = 140;
                interval = 7;
                let tempB = DS.CreateEffectObject(ETypes.None, 0, 0, duration, interval, function (unit) {
                    DS.CreateDamageObject(Math.ceil(-totalHeal / (1 + duration / interval)), 0, DTypes.None, null).ApplyEffects(unit);
                });
                DS.CreateDamageObject(0, 0, DTypes.None, DS.CreateBuffObject("Self heal", [tempB])).ApplyEffects(this);

                let ani = new Animation(AM.getAsset("./img/terran/abilities/self_heal.png"), 25, 25, 1, .085, 4, true, 2);
                let ss1 = new StillStand(ani, duration, this.x, this.y);
                ss1.player = this;
                ss1.onUpdate = function () {
                    if (this.player.xScale < 0) {
                        this.x = this.player.x - 14;
                    } else {
                        this.x = this.player.x + 2;
                    }
                    this.y = this.player.y - 26;
                }
                GAME_ENGINE.addEntity(ss1);
                this.abilityCD[number] = cooldDown;
                break;
            case 4://FireRound?
                totalDamage = 60;//Numbers are rounded so it is a bit iffy
                cooldDown = 200;
                speed = 11;
                aoe = 33;
                origin = 5;
                interval = 5;
                duration = 150;
                let adamageBuffonExplosion = DS.CreateBuffObject("burn", [DS.CreateEffectObject(ETypes.None, 0, 0, duration, interval, function (unit) {
                    DS.CreateDamageObject(totalDamage / (1 + duration / interval), 0, DTypes.Magic, null).ApplyEffects(unit);
                })]);
                let adamageObjonExplosion = DS.CreateDamageObject(0, 0, DTypes.None, adamageBuffonExplosion);
                adamageObjonExplosion.timeLeft = 10;

                let tempPro2 = new FireRound(AM.getAsset("./img/terran/abilities/incendiary_shot_still.png"),
                    AM.getAsset("./img/terran/abilities/incendiary_shot.png"),
                    this.x + 15, this.y + 23, dir.x, dir.y, origin);

                tempPro2.damageObjonExplosion = adamageObjonExplosion;
                tempPro2.projectileSpeed = speed;
                tempPro2.aoe = aoe;
                GAME_ENGINE.addEntity(tempPro2);
                this.abilityCD[number] = cooldDown;
                break;
        }
    }
}

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
    this.healthPercent = Math.floor(this.health / this.maxHealth * 100);
    this.updateHealthHTML(this.health);
    //changes color of health wireframe based on health percentage
    var healthImg = document.getElementById("healthImg");
    if (this.healthPercent >= 90) {
        healthImg.src = "./img/health_wireframe/green_health.png";
    } else if (this.healthPercent >= 60) {
        healthImg.src = "./img/health_wireframe/yellow_health.png";
    } else if (this.healthPercent >= 30) {
        healthImg.src = "./img/health_wireframe/orange_health.png";
    } else {
        healthImg.src = "./img/health_wireframe/red_health.png";
    }
}

//centers health in html based on number of digits
Player.prototype.updateHealthHTML = function () {
    var healthHTML = document.getElementById("health");
    healthHTML.innerHTML = this.health;
    var health = Math.abs(this.health);
    if (health >= 1000) {
        healthHTML.style.left = "9%";
    } else if (health >= 100) {
        healthHTML.style.left = "11%";
    } else if (health >= 10) {
        healthHTML.style.left = "13%";
    } else {
        healthHTML.style.left = "15%";
    }
}
/* #endregion */

/* #region Base Projectile */
function Projectile(spriteSheet, originX, originY, xTarget, yTarget, belongsTo, direction, isMonster) {
    this.origin = belongsTo;
    // animation
    this.width = 13;
    this.height = 13;
    this.scale = 1;
    this.animation = new Animation(spriteSheet, this.width, this.height, 1, .085, 1, true, this.scale);

    this.targetType = 4;
    this.x = originX - CAMERA.x;
    this.y = originY - CAMERA.y;
    this.direction = direction;
    this.counter = 0; // Counter to make damage consistent
    this.childUpdate;//function
    this.childDraw;//function
    this.childCollide;//function
    this.speed = 200;
    this.projectileSpeed = 7.5;
    this.isMonster = isMonster;
    this.xTar = xTarget - CAMERA.x;
    this.yTar = yTarget - CAMERA.y;
    // Determining where the projectile should go angle wise.
    this.angle = Math.atan2(this.yTar - this.y, this.xTar - this.x);

    // Damage stuff
    this.durationBetweenHits = 50;//Adjustable
    this.playerDamage = 15 * myGodMode;
    this.enemyDamage = 15;
    this.totalDamage;
    this.totalDamage = (this.origin === 5) ? this.playerDamage : this.enemyDamage;

    this.damageObjArr = [];
    this.damageBuff = null;
    this.damageObj = DS.CreateDamageObject(this.totalDamage, 0, DTypes.Piercing, this.damageBuff);
    this.damageObj.timeLeft = this.durationBetweenHits;
    this.buffObj = [];

    this.penetrative = false;
    this.aniX = -18;
    this.aniY = -5;
    Entity.call(this, GAME_ENGINE, originX, originY);


    this.boundingbox = new BoundingBox(this.x, this.y, this.width * this.scale, this.height * this.scale);

}

Projectile.prototype.draw = function () {
    (typeof this.childDraw === 'function') ? this.childDraw() : null;
    this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x, this.y);

    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = color_yellow;
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);
    }
}

Projectile.prototype.update = function () {
    (typeof this.childUpdate === 'function') ? this.childUpdate() : null;
    // Moving the actual projectile.

    var velX = 0;
    var velY = 0;

    if (this.direction === "angle") {
        // Generating the speed to move at target direction
        velY = Math.sin(this.angle) * this.projectileSpeed;
        velX = Math.cos(this.angle) * this.projectileSpeed;
    } else {
        if (this.direction === "up") {
            velY = -this.projectileSpeed;
        } else if (this.direction === "left") {
            velX = -this.projectileSpeed;
        } else if (this.direction === "right") {
            velX = this.projectileSpeed;
        } else if (this.direction === "down") {
            velY = this.projectileSpeed;
        } else if (this.direction === "ul") {
            velX = -this.projectileSpeed;
            velY = -this.projectileSpeed;
        } else if (this.direction === "ur") {
            velX = this.projectileSpeed;
            velY = -this.projectileSpeed;
        } else if (this.direction === "dl") {
            velX = -this.projectileSpeed;
            velY = this.projectileSpeed;
        } else {
            velX = this.projectileSpeed;
            velY = this.projectileSpeed;
        }
    }

    this.x += velX;
    this.y += velY;

    if (this.x - CAMERA.x <= TILE_SIZE * 2 || this.x - CAMERA.x >= canvasWidth - TILE_SIZE * 2
        || this.y - CAMERA.y <= TILE_SIZE * 2 || this.y - CAMERA.y >= canvasHeight - TILE_SIZE * 2) {
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

    this.boundingbox = new BoundingBox(this.x, this.y, this.width * this.scale, this.height * this.scale);
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
    this.currentRoom = 0;
}

Camera.prototype.update = function () {
}

Camera.prototype.getStartingRoom = function () {
    var roomNum = 0;
    for (var i = 0; i < BACKGROUND.map.length; i++) {
        for (var j = 0; j < BACKGROUND.map[i].length; j++) {
            if (BACKGROUND.map[i][j] === 8) {
                this.currentRoom = roomNum;
            }

            roomNum++;
        }
    }
}

Camera.prototype.draw = function () {
    BACKGROUND.drawMiniMap();
    document.getElementById("room" + this.currentRoom).style.backgroundColor = "green";
}


Camera.prototype.move = function (direction) {
    var positionChange = TILE_SIZE * 4 + 60;
    if (direction === "right") {
        this.x += canvasWidth;
        myPlayer.x += positionChange;
        BACKGROUND.x -= canvasWidth;
        this.currentRoom++;
    } else if (direction === "left") {
        this.x -= canvasWidth;
        myPlayer.x -= positionChange;
        BACKGROUND.x += canvasWidth;
        this.currentRoom--;
    } else if (direction === "up") {
        this.y -= canvasHeight;
        myPlayer.y -= positionChange;
        BACKGROUND.y += canvasHeight;
        this.currentRoom -= 5;
    } else {
        this.y += canvasHeight;
        myPlayer.y += positionChange;
        BACKGROUND.y -= canvasHeight;
        this.currentRoom += 5;
    }
}
/* #endregion */

/* #region Menu */
function Menu() {
    this.button = { x: 406, width: 221, height: 39 };
    this.storyY = 263;
    this.controlsY = 336;
    this.back = { x: 62, y: 30, width: 59, height: 16 };
    this.controls = false;
    this.story = false;
    this.background = new Image();
    this.background.src = "./img/utilities/menu.png";
}

Menu.prototype.update = function () {

}

Menu.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(this.background, 0, 0, canvasWidth, canvasHeight,
        0, 0, canvasWidth, canvasHeight);
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
    this.animationDone = false;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
        this.animationDone = true;
    } else {
        this.animationDone = false;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);
    this.drawFrameHelper(ctx, x, y, xindex * this.frameWidth, yindex * this.frameHeight);
}

Animation.prototype.drawFrameAniThenIdle = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    var xindex = 0;
    var yindex = 0;
    if (this.isDone()) {
        xindex = this.frames % this.sheetWidth;
        yindex = Math.floor(this.frames / this.sheetWidth) - 1;
    } else {
        var frame = this.currentFrame();
        xindex = frame % this.sheetWidth;
        yindex = Math.floor(frame / this.sheetWidth);
    }
    this.drawFrameHelper(ctx, x, y, xindex * this.frameWidth, yindex * this.frameHeight);
}

Animation.prototype.drawFrameIdle = function (ctx, x, y) {
    this.drawFrameHelper(ctx, x, y, 0, 0);
}

Animation.prototype.drawFrameHelper = function (ctx, x, y, xFrame, yFrame) {
    var xPosition;
    if ((x >= 0 && CAMERA.x >= 0) || (x < 0 && CAMERA.x < 0)) {
        xPosition = x - CAMERA.x;
    } else {
        xPosition = x + CAMERA.x;
    }
    ctx.drawImage(this.spriteSheet,
        xFrame, yFrame,
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
    //adds slider functionality
    var volumeSlider = document.getElementById("volumeSlider");
    var muteButton = document.getElementById("muteButton");
    volumeSlider.addEventListener("change", function () {
        music.volume = volumeSlider.value;
        myCurrentVolume = music.volume;
        myIsMute = false;
        muteButton.innerHTML = "Mute";
        if (volumeSlider.value === "0") {
            myIsMute = true;
            muteButton.innerHTML = "Unmute";
        }
        clickOutsideOfCanvas();
    }, false);

    //adds mute/unmute functionality
    muteButton.addEventListener("click", function () {
        if (myIsMute) {
            if (volumeSlider.value === "0") {
                myCurrentVolume = .1;
            }
            music.volume = myCurrentVolume;
            volumeSlider.value = myCurrentVolume;
            myCurrentVolume = music.volume;
            myIsMute = false;
            muteButton.innerHTML = "Mute";
        } else {
            myCurrentVolume = music.volume;
            music.volume = 0.0;
            muteButton.innerHTML = "Unmute";
            volumeSlider.value = 0.0;
            myIsMute = true;
        }
        clickOutsideOfCanvas();
    });
}
function clickOutsideOfCanvas() {
    document.getElementById("canvas").focus();
    GAME_ENGINE.keyW = false;
    GAME_ENGINE.keyA = false;
    GAME_ENGINE.keyS = false;
    GAME_ENGINE.keyD = false;
    GAME_ENGINE.keyDown = false;
    GAME_ENGINE.keyLeft = false;
    GAME_ENGINE.keyUp = false;
    GAME_ENGINE.keyRight = false;
    GAME_ENGINE.shoot = false;
}


/* #endregion */

/* #region Download queue and download */

// Map
AM.queueDownload("./img/utilities/floor_level1.png");
AM.queueDownload("./img/utilities/floor_level2.png");
AM.queueDownload("./img/utilities/floor_level3.png");
AM.queueDownload("./img/utilities/creep.png");

// Buildings
AM.queueDownload("./img/buildings/crashed_cruiser.png");
AM.queueDownload("./img/buildings/gravemind.png");
AM.queueDownload("./img/buildings/hive.png");
AM.queueDownload("./img/buildings/infested_cc.png");
AM.queueDownload("./img/buildings/ion_cannon.png");
AM.queueDownload("./img/buildings/spawning_pool.png");
AM.queueDownload("./img/buildings/canal_on.png");

// Marine
AM.queueDownload("./img/terran/marine/marine_move_right.png");
AM.queueDownload("./img/terran/marine/marine_move_up.png");
AM.queueDownload("./img/terran/marine/marine_move_down.png");
AM.queueDownload("./img/terran/marine/marine_shoot_right.png");
AM.queueDownload("./img/terran/marine/marine_shoot_up.png");
AM.queueDownload("./img/terran/marine/marine_shoot_down.png");
AM.queueDownload("./img/terran/marine/marine_death.png");
AM.queueDownload("./img/terran/bullet.png");
AM.queueDownload("./img/terran/abilities/rocket/rocket_up.png");
AM.queueDownload("./img/terran/abilities/rocket/rocket_down.png");
AM.queueDownload("./img/terran/abilities/rocket/rocket_left.png");
AM.queueDownload("./img/terran/abilities/rocket/rocket_right.png");
AM.queueDownload("./img/terran/abilities/rocket/rocket_explosion.png");
AM.queueDownload("./img/terran/abilities/incendiary_shot_still.png");
AM.queueDownload("./img/terran/abilities/incendiary_shot.png");
AM.queueDownload("./img/terran/abilities/self_heal.png");
AM.queueDownload("./img/terran/abilities/stimpack.png");

// Sunken Spike
AM.queueDownload("./img/zerg/sunken_spike.png");

// creep
AM.queueDownload("./img/utilities/creep.png");

// Hydralisk
AM.queueDownload("./img/zerg/hydra/hydra_move_right.png");
AM.queueDownload("./img/zerg/hydra/hydra_attack_right.png");
AM.queueDownload("./img/zerg/hydra/hydra_death.png");

// Infested Terran
AM.queueDownload("./img/zerg/infested/infested_move_right.png");
AM.queueDownload("./img/zerg/infested/infested_boom.png");
AM.queueDownload("./img/zerg/infested/infested_death.png");

// Ultralisk
AM.queueDownload("./img/zerg/ultra/ultra_move_right.png");
AM.queueDownload("./img/zerg/ultra/ultra_attack_right.png");
AM.queueDownload("./img/zerg/ultra/ultra_death.png");

// Zergling
AM.queueDownload("./img/zerg/zergling/zergling_move_right.png");
AM.queueDownload("./img/zerg/zergling/zergling_attack_right.png");
AM.queueDownload("./img/zerg/zergling/zergling_death.png");

// Dark Templar
AM.queueDownload("./img/protoss/dark_templar/dark_templar_move_right.png");
AM.queueDownload("./img/protoss/dark_templar/dark_templar_attack_right.png");
AM.queueDownload("./img/protoss/dark_templar/dark_templar_death.png");

// Protoss attacks
AM.queueDownload("./img/protoss/energy_ball.png");
AM.queueDownload("./img/protoss/psionic_storm.png");

// archon
AM.queueDownload("./img/protoss/archon/archon_attack.png");
AM.queueDownload("./img/protoss/archon/archon_move_right.png");
AM.queueDownload("./img/protoss/archon/archon_death.png");

AM.queueDownload("./img/protoss/archon/archon_fusion.png")

// Kerrigna
AM.queueDownload("./img/zerg/kerrigan/kerrigan_move_right.png");
AM.queueDownload("./img/zerg/kerrigan/kerrigan_attack_right.png");
AM.queueDownload("./img/zerg/kerrigan/kerrigan_death.png");

// Zealot
AM.queueDownload("./img/protoss/zealot/zealot_move_right.png");
AM.queueDownload("./img/protoss/zealot/zealot_attack_right.png");
AM.queueDownload("./img/protoss/zealot/zealot_death.png");

// Zerg Projectiles
AM.queueDownload("./img/zerg/heavy_shot.png");
AM.queueDownload("./img/zerg/light_shot.png");

//shadow test
AM.queueDownload("./img/utilities/Shadow1.png")

// gore
AM.queueDownload("./img/gore/archon.png");
AM.queueDownload("./img/gore/high_templar.png");
AM.queueDownload("./img/gore/hydra.png");
AM.queueDownload("./img/gore/infested.png");
AM.queueDownload("./img/gore/kerrigan.png");
AM.queueDownload("./img/gore/ultra.png");
AM.queueDownload("./img/gore/zergling.png");
AM.queueDownload("./img/gore/zealot.png");



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
    document.getElementById("hudInfo").style.display = "none";
    document.getElementById("hudMinimap").style.display = "none";
    addHTMLListeners();
    BACKGROUND = new Background(1, "./img/utilities/floor_level1.png");
    SCENE_MANAGER = new SceneManager();
});
/* #endregion */