/* #region Notes */
//THIS SHOULD BE ADDED TO UNIT TYPES OR HERO/MONSTER
/* #region New Constructor Variables */
/*
IN CONSTRUCTOR
Only to be added at approval of group
Systems in place to handle if false call is made.
//CHANGES
this.acceleration = { x: 2, y: 2 };//Place holder values
this.velocity = { x: 0, y: 0 };
this.isStunned = false;
this.isSilenced = false;
this.isBlind = false;
this.isDisarmed = false;
this.currentHealth = 100;
this.baseMaxHealth = 100;
this.maxHealthAdj = 0;
this.maxHealthRatio = 1;
this.armorRatio = 1;
this.armorAdj = 0;
this.baseAttackSpeed = 100;
this.attackSpeedAdj = 0;
this.attackSpeedRatio = 1;
this.baseCastSpeed = 100;
this.castSpeedAdj = 0;
this.castSpeedRatio = 1;
this.baseAttackDamage = 100;
this.attackDamageAdj = 0
this.attackDamageRatio = 1;
this.baseMagicDamage = 100;
this.magicDamageRatio = 1;
/* #endregion *//*
*///END OF WHAT SHOULD BE ADDED TO UNIT OR HERO/MONSTER
/* #endregion */
/* #region Self notes */
/*
Add a buff constraint so that the unit cannot receive two buffs of equal title.
 
Add constrains to systems that should be constrained
 
Make a set of premade buffs i.e. 'weak slow, slow, strong slow'
*/
/* #endregion */
/* #region Constants */
/* #region Damage type descriptions */
/**
 * Damage types
 * @Normal deals 33% more damage to Heavy.
 * @Slashing deals 33% more damage to Unarmored and 33% less damage to Medium.
 * @Piercing deals 33% more damage to Unarmored and Light
 * @Bludgeoning deals 66% more damage to Unarmored, 33% more damage to Light, and 33% less damage to Heavy.
 * @Magic deals 66% more damage to Ethereal, 33% more damage to Light and Heavy, and deals 33% less damage to Medium.
 * @Chaos deals 0% more damage to all armor types and deals 0% less damage to all armor types.
 * @True deals 0% more damage to all armor types and deals 0% less damage to all armor types.
 * @None Only use if entity should not have attack types considered. This is not a 'universal 1.0 damage mode'.
 */
/* #endregion */
const DTypes = {
    Normal: "n",
    Slashing: "s",
    Piercing: "p",
    Bludgeoning: "b",
    Magic: "m",
    Chaos: "c",//100% damage all time
    True: "t",//no distinction from chaos yet
    None: "na b"
}
/* #region Armor type descriptions */
/**
 * Armor types
 * @Unarmored takes bonus 33% damage from Piercing and Slashing.
 * @Light takes bonus 33% damage from Piercing and Magic.
 * @Medium takes bonus 33% damage from Normal, but 33% less damage from Piercing, Magic, and Slashing.
 * @Heavy takes bonus 33% damage from Magic.
 * @Ethereal takes bonus 66% damage from Magic, but 90% less damage from all other attack types.
 * @None Only use if entity should not have armor types considered. This is not a 'universal 1.0 damage mode'.
 */
/* #endregion */
const ATypes = {
    Unarmored: "ua",//+p,s ++b
    Light: "l",//+p,m +b
    Medium: "m",//+n  -p,m,s
    Heavy: "h",//+m, -b
    Ethereal: "e",//++m   ---all
    None: "na a"
}
/* #region Effect types descriptions */
/**
 * Effect types
 * F represents a flat change while R represents a Ratio change
 * F uses +=, R uses *=.
 * @MoveSpeed       Changes unit movespeed:
 * @Acceleration    Changes unit acceleration: acceleration is normally small. be careful with flat change.
 * @CurrentHealth   Changes unit current health.
 * @MaxHealth       Changes unit max health: Only affects current hp if max hp < current hp.
 * @AttackSpeed     Changes unit attack speed.
 * @AttackDamage    Changes unit attack damage: '-'damage will heal
 * @MagicDamage     Changes unit magic damage.
 * @Armor           Changes unit armor.
 * @CastSpeed       Changes unit cast speed.
 * @CooldownRate    Changes unit cooldown rates: flat adjustment is applied to each ability.
 * @Stun            Changes units stuned condition.
 * @Silence         Changes units silenced condition.
 * @Blind           Changes units blinded condition.
 * @Disarm          Changes units disarmed condition.
 */
/* #endregion */
const ETypes = {
    //Movement Speed
    MoveSpeedF: "move speed f",//Flat speed change
    MoveSpeedR: "move speed r",//Percent speed change
    //Acceleration
    AccelerationF: "acceleration f",//Be carful with this
    AccelerationR: "acceleration r",
    //Current Health
    CurrentHealthF: "current health f",
    CurrentHealthR: "current health r",
    //Max Health
    MaxHealthF: "max health f",
    MaxHealthR: "max health r",
    //Attack Speed
    AttackSpeedF: "attack speed f",
    AttackSpeedR: "attack speed r",
    //Attack Damage
    AttackDamageF: "attack damage f",
    AttackDamageR: "attack damage r",
    //Magic Damage
    MagicDamagef: "magic damage f",
    MagicDamageR: "magic damage r",
    //Armor
    ArmorF: "armor f",
    ArmorR: "armor r",
    //Cast Speed
    CastSpeedF: "cast speed f",
    CastSpeedR: "cast speed r",
    //Cooldown
    CooldownRateF: "cooldown rate f",
    CooldownRateR: "cooldown rate r",
    //MISC
    Silence: "silence",
    Stun: "stun",
    Disarm: "disarm",
    Blind: "blind",

    None: "na e"

}
/**
 * Premade buffs to be added simple
 */
const PremadeBuffs = {
    Slow: new BuffObj("slow", [new EffectObj(ETypes.MoveSpeedR, 0.6, 1 / 0.6, 60, 0)]),
    SlowWeak: new BuffObj("weak slow", [new EffectObj(ETypes.MoveSpeedR, 0.8, 1 / 0.8, 60, 0)]),
    SlowStrong: new BuffObj("strong slow", [new EffectObj(ETypes.MoveSpeedR, 0.4, 1 / 0.4, 60, 0)]),
    Haste: new BuffObj("haste", [new EffectObj(ETypes.MoveSpeedR,1.25, 1/1.25, 60, 0)]),
    HasteWeak: new BuffObj("weak haste", [new EffectObj(ETypes.MoveSpeedR,1.1, 1/1.1, 60, 0)]),
    HasteStrong: new BuffObj("strong haste", [new EffectObj(ETypes.MoveSpeedR,1.5, 1/1.5, 60, 0)]),
    Stun: new BuffObj("stun",[new EffectObj(ETypes.Stun,true,false,40,0)]),
    StunShort: new BuffObj("stun",[new EffectObj(ETypes.Stun,true,false,20,0)]),
    StunLong: new BuffObj("stun",[new EffectObj(ETypes.Stun,true,false,60,0)]),
    Heal: new BuffObj("heal", [new EffectObj(ETypes.CurrentHealthF, 20, 0, 2, 0)]),
    HealStrong: new BuffObj("strong heal", [new EffectObj(ETypes.CurrentHealthF, 30, 0, 2, 0)]),
    HealWeak: new BuffObj("weak heal", [new EffectObj(ETypes.CurrentHealthF, 10, 0, 2, 0)]),
    HealOvertime: new BuffObj("heal overtime", [new EffectObj(ETypes.CurrentHealthF, 2, 0, 120, 10)]),
    DamageOvertime: new BuffObj("damage overtime", [new EffectObj(ETypes.CurrentHealthF, -3.5, 0, 60, 10)]),
    PurifyingFlames: new BuffObj("purifying flames", [new EffectObj(ETypes.CurrentHealthF, -25, 0, 2, 0)
        , new EffectObj(ETypes.CurrentHealthF, 3.2 / (180 / 5), 0, 180, 5)]),
    Malefice: new BuffObj("malefice", [new EffectObj(ETypes.isStunned,true,false,240,120,function (unit) {
        (this.timeLeft % 40 === 0) ? unit.isStunned = false : null;})
        , new EffectObj(ETypes.CurrentHealthF,15,0,240,120)])
}
/* #endregion */
/* #region Damage System */
function DamageSystem() {
    //I don't know what I would put in here as of yet.
}
/* #region Create damage object descrption */
/**
 * Creates a damage object which is the main holder of the damage and buff systems.
 * @param {*} dmg The amount of damage this object will do. Keep Rositive as this will be subtracted from unit health.
 * @param {*} stun The amount of hitstun being added to target.
 * @param {*} dmgType The damage type of the damage object.
 * @param {*} buffObj The buff object to apply to the unit.
 * @returns Damage Object
 */
/* #endregion */
DamageSystem.prototype.CreateDamageObject = function (theDamage = 0, theHitstun = 0,
    theDamageType = DTypes.None, theBuffObject = null) {
    let newObj = new DamageObj(theDamage, theHitstun, theDamageType, theBuffObject);
    newObj.id = Math.random() * Math.pow(10,15);
    return newObj;
}
/**
 * @returns A deep clone of the input damage object.
 */
DamageSystem.prototype.CloneDamageObject = function (obj) {
    let newBuffObj = this.CloneBuffObject(obj.buff);
    let newObj  = this.CreateDamageObject(obj.damage, obj.hitstun, obj.damageType, newBuffObj);
    newObj.timeLeft = obj.timeLeft;
    return newObj;
}
/* #region Create buff object description */
/**
 * Creates a buff object that holds the list of effects and is in charge of managing them.
 * The duration is based on the longest duration in the effect list.
 * @param {*} theName is just that... a name.
 * @param {*} theEffectList is a list of effect obejcts. 
 * @returns Buff Object
 */
/* #endregion */
DamageSystem.prototype.CreateBuffObject = function (theName = "", theEffectList = []) {
    return new BuffObj(theName, theEffectList);
}
/**
 * @returns A deep clone of the input buff object.
 */
DamageSystem.prototype.CloneBuffObject = function (obj) {
    if (obj === null || typeof obj === 'undefined') {return null;}
    let newList = [], a = 0;
    for (a in obj.effectList) {
        newList.push(this.CloneEffectObject(obj.effectList[a]));
    }
    return this.CreateBuffObject(obj.name, newList);
}
/* #region Create effect object description */
/**
 * Creates an object that holds a single effect.
 * @param {*} theEffect The effect type.
 * @param {*} theDo The number to apply with '+' or '*'.
 * @param {*} theUndo The number to apply at the end of duration with '+' or '*'.
 * @param {*} theDuration The number of frames the effect lasts.
 * @param {*} theInterval The number of frames until the effect is applied again. '0' for one time effects.
 * @param {*} theOperation A special function to be passed in that has the parameter (unit) with no return value. Can be left null.
 * @returns Effect Object
 */
/* #endregion */
DamageSystem.prototype.CreateEffectObject = function (theEffect = ETypes.None, theDo = 0
    , theUndo = 0, theDuration = 0, theInterval = 0, theOperation) {
    return new EffectObj(theEffect, theDo, theUndo, theDuration, theInterval, theOperation);
}
/**
 * @returns A clone of the input effect object.
 */
DamageSystem.prototype.CloneEffectObject = function (obj) {
    if (obj === null){return null;}
    return this.CreateEffectObject(obj.effect, obj.do, obj.undo, obj.duration
        , obj.interval, obj.operation);
}
/* #endregion */
/* #region Effect Object */
/**
 * Applies the do effect to unit based on effect type
 */
EffectObj.prototype.Do = function (unit) {
    if (this.timeLeft <= 0) { return; }
    if (this.interval > 0 || !this.isApplied) {
        this.isApplied = true;
        switch (this.effect) {
            case ETypes.MoveSpeedF:
                if (typeof unit.maxMovespeedAdj !== 'undefined') {
                    unit.maxMovespeedAdj += this.do;
                }
                break;
            case ETypes.MoveSpeedR:
                if (typeof unit.maxMovespeedRatio !== 'undefined') {
                    unit.maxMovespeedRatio *= this.do;
                }
                break;
            case ETypes.AccelerationF:
                if (typeof unit.acceleration !== 'undefined') {
                    unit.acceleration.x += this.do;
                    unit.acceleration.y += this.do;
                }
                break;
            case ETypes.AccelerationR:
                if (typeof unit.acceleration !== 'undefined') {
                    unit.acceleration.x *= this.do;
                    unit.acceleration.y *= this.do;
                }
                break;
            case ETypes.CurrentHealthF:
                if (typeof unit.health !== 'undefined') {
                    unit.health += this.do;
                }
                break;
            case ETypes.CurrentHealthR:
                if (typeof unit.currentHealth !== 'undefined') {
                    unit.currentHealth *= this.do;
                }
                break;
            case ETypes.MaxHealthF:
                if (typeof unit.maxHealth !== 'undefined') {
                    unit.maxHealth += this.do;
                }
                break;
            case ETypes.MaxHealthR:
                if (typeof unit.maxHealth !== 'undefined') {
                    unit.maxHealth *= this.do;
                }
                break;
            case ETypes.MagicDamagef:
                if (typeof unit.magicDamageAdj !== 'undefined') {
                    unit.magicDamageAdj += this.do;
                }
                break;
            case ETypes.MagicDamageR:
                if (typeof unit.magicDamageRatio !== 'undefined') {
                    unit.magicDamageRatio *= this.do;
                }
                break;
            case ETypes.AttackSpeedF:
                if (typeof unit.attackSpeedAdj !== 'undefined') {
                    unit.attackSpeedAdj += this.do;
                }
                break;
            case ETypes.AttackSpeedR:
                if (typeof unit.attackSpeedRatio !== 'undefined') {
                    unit.attackSpeedRatio *= this.do;
                }
                break;
            case ETypes.AttackDamageF:
                if (typeof unit.attackDamageAdj !== 'undefined') {
                    unit.attackDamageAdj += this.do;
                }
                break;
            case ETypes.AttackDamageR:
                if (typeof unit.attackDamageRatio !== 'undefined') {
                    unit.attackDamageRatio *= this.do;
                }
                break;
            case ETypes.ArmorF:
                if (typeof unit.armorAdj !== 'undefined') {
                    unit.armorAdj += this.do;
                }
                break;
            case ETypes.ArmorR:
                if (typeof unit.armorRatio !== 'undefined') {
                    unit.armorRatio *= this.do;
                }
                break;
            case ETypes.CastSpeedF:
                if (typeof unit.castSpeedAdj !== 'undefined') {
                    unit.castSpeedAdj += this.do;
                }
                break;
            case ETypes.CastSpeedR:
                if (typeof unit.castSpeedRatio !== 'undefined') {
                    unit.castSpeedRatio *= this.do;
                }
                break;
            case ETypes.Silence:
                if (typeof unit.isSilenced !== 'undefined') {
                    unit.isSilenced = this.do;
                }
                break;
            case ETypes.Stun:
                if (typeof unit.isStunned !== 'undefined') {
                    unit.isStunned = this.do;
                }
                break;
            case ETypes.Disarm:
                if (typeof unit.isDisarmed !== 'undefined') {
                    unit.isDisarmed = this.do;
                }
                break;
            case ETypes.Blind:
                if (typeof unit.isBlind !== 'undefined') {
                    unit.isBlind = this.do;
                }
                break;
            case ETypes.None:
                break;
        }
    }
}

/* #region Effect object description */
/**
 * An object that holds a single effect.
 * @param {*} theEffect The effect type.
 * @param {*} theDo The number to apply with '+' or '*'.
 * @param {*} theUndo The number to apply at the end of duration with '+' or '*'.
 * @param {*} theDuration The number of frames the effect lasts.
 * @param {*} theInterval The number of frames until the effect is applied again. '0' for one time effects.
 * @param {*} theOperation A special function to be passed in that has the parameter (unit) with no return value.
 */
/* #endregion */
function EffectObj(theEffect = ETypes.None, theDo = 0, theUndo = 0
    , theDuration = 0, theInterval = 0, theOperation = null) {
    this.effect = theEffect;
    this.do = theDo;//Either a flat number or multiplier. Applied once or #duration/interval
    this.undo = theUndo;//Either a flat number or multiplier. Only applied ONCE
    this.duration = theDuration;//Number of game ticks to happen
    this.interval = theInterval;//How often the effect is applied or 0
    this.intervalTimer = 0;
    this.timeLeft = theDuration;//Timeleft until it no longer does.
    this.isApplied = false;
    this.undone = false;
    this.operation = theOperation;
}
/**
 * Applies the undo effect on the unit based on effect type
 */
EffectObj.prototype.Undo = function (unit) {
    if (this.timeLeft <= 0 && !this.undone) {
        this.undone = true;
        //Undo
        switch (this.effect) {
            case ETypes.MoveSpeedF:
                if (typeof unit.maxMovespeedAdj !== 'undefined') {
                    unit.maxMovespeedAdj += this.undo;
                }
                break;
            case ETypes.MoveSpeedR:
                if (typeof unit.maxMovespeedRatio !== 'undefined') {
                    unit.maxMovespeedRatio *= this.undo;
                }
                break;
            case ETypes.AccelerationF:
                if (typeof unit.acceleration !== 'undefined') {
                    unit.acceleration.x += this.undo;
                    unit.acceleration.y += this.undo;
                }
                break;
            case ETypes.AccelerationR:
                if (typeof unit.acceleration !== 'undefined') {
                    unit.acceleration.x *= this.undo;
                    unit.acceleration.y *= this.undo;
                }
                break;
            case ETypes.CurrentHealthF:
                if (typeof unit.health !== 'undefined') {
                    unit.health += this.undo;
                }
                break;
            case ETypes.CurrentHealthR:
                if (typeof unit.currentHealth !== 'undefined') {
                    unit.currentHealth *= this.undo;
                }
                break;
            case ETypes.MaxHealthF:
                if (typeof unit.maxHealth !== 'undefined') {
                    unit.maxHealth += this.undo;
                }
                break;
            case ETypes.MaxHealthR:
                if (typeof unit.maxHealth !== 'undefined') {
                    unit.maxHealth *= this.undo;
                }
                break;
            case ETypes.MagicDamagef:
                if (typeof unit.magicDamageAdj !== 'undefined') {
                    unit.magicDamageAdj += this.undo;
                }
                break;
            case ETypes.MagicDamageR:
                if (typeof unit.magicDamageRatio !== 'undefined') {
                    unit.magicDamageRatio *= this.undo;
                }
                break;
            case ETypes.AttackSpeedF:
                if (typeof unit.attackSpeedAdj !== 'undefined') {
                    unit.attackSpeedAdj += this.undo;
                }
                break;
            case ETypes.AttackSpeedR:
                if (typeof unit.attackSpeedRatio !== 'undefined') {
                    unit.attackSpeedRatio *= this.undo;
                }
                break;
            case ETypes.AttackDamageF:
                if (typeof unit.attackDamageAdj !== 'undefined') {
                    unit.attackDamageAdj += this.undo;
                }
                break;
            case ETypes.AttackDamageR:
                if (typeof unit.attackDamageRatio !== 'undefined') {
                    unit.attackDamageRatio *= this.undo;
                }
                break;
            case ETypes.ArmorF:
                if (typeof unit.armorAdj !== 'undefined') {
                    unit.armorAdj += this.undo;
                }
                break;
            case ETypes.ArmorR:
                if (typeof unit.armorRatio !== 'undefined') {
                    unit.armorRatio *= this.undo;
                }
                break;
            case ETypes.CastSpeedF:
                if (typeof unit.castSpeedAdj !== 'undefined') {
                    unit.castSpeedAdj += this.undo;
                }
                break;
            case ETypes.CastSpeedR:
                if (typeof unit.castSpeedRatio !== 'undefined') {
                    unit.castSpeedRatio *= this.undo;
                }
                break;
            case ETypes.Silence:
                if (typeof unit.isSilenced !== 'undefined') {
                    unit.isSilenced = this.undo;
                }
                break;
            case ETypes.Stun:
                if (typeof unit.isStunned !== 'undefined') {
                    unit.isStunned = this.undo;
                }
                break;
            case ETypes.Disarm:
                if (typeof unit.isDisarmed !== 'undefined') {
                    unit.isDisarmed = this.undo;
                }
                break;
            case ETypes.Blind:
                if (typeof unit.isBlind !== 'undefined') {
                    unit.isBlind = this.undo;
                }
                break;
            case ETypes.None:
                break;
        }
    }
}
/* #endregion */
/* #region Damage Object */
/* #region Damage object description */
//This function object controls how damage is applied and 
//types along with buffs and hitstuns
/**
 * The main holder of the damage and buff systems.
 * @param {*} dmg The amount of damage this object will do. Keep Rositive as this will be subtracted from unit health.
 * @param {*} stun The amount of hitstun being added to target.
 * @param {*} dmgType The damage type of the damage object.
 * @param {*} buffObj The buff object to apply to the unit.
 */
/* #endregion */
function DamageObj(dmg = 0, stun = 0,
    dmgType = DTypes.None, buffObj = null) {
    this.damage = dmg;
    this.hitstun = stun;
    this.damageType = dmgType;
    this.buff = buffObj;
    this.timeLeft = 30;
    this.id = Math.random() * Math.pow(10,15);
}
/**
 * Updates the timeLeft of damage obj.
 */
DamageObj.prototype.update = function () {
    this.timeLeft--;
}
/* #region Apply damage description */
//Consideres armor type and damage type and armor then removes health from unit.
//Return: -healthChanged which is damage
/**
 * Applies damage to unit based on armor types and damage types. unit.HealthChange(-damage).
 * @returns The -damage total.
 */
/* #endregion */
DamageObj.prototype.ApplyDamage = function (unit) {
    let unitArmor = unit.armor;
    let unitArmorType = unit.armorType;
    let healthChange;
    if (typeof unitArmor !== 'undefined' && typeof unitArmorType !== 'undefined') {
        let dmgMultiplier = 1;
        let dt = this.damageType;
        //Determines damage multiplier considering armor and damage types
        switch (unitArmorType) {
            case ATypes.Unarmored:
                if (dt === DTypes.Piercing
                    || dt === DTypes.Slashing) {
                    dmgMultiplier += 1 / 3;
                }
                break;
            case ATypes.Light:
                if (dt === DTypes.Piercing
                    || dt === DTypes.Magic) {
                    dmgMultiplier += 1 / 3;
                }
                break;
            case ATypes.Medium:
                if (dt === DTypes.Normal) {
                    dmgMultiplier += 1 / 3;
                }
                if (dt === DTypes.Piercing
                    || dt === DTypes.Magic
                    || dt === DTypes.Slashing) {
                    dmgMultiplier -= 1 / 3;
                }
                break;
            case ATypes.Heavy:
                if (dt === DTypes.Magic) {
                    dmgMultiplier += 1 / 3;
                }
                break;
            case ATypes.Ethereal:
                if (dt === DTypes.Magic) {
                    dmgMultiplier += 2 / 3;
                } else {
                    dmgMultiplier -= .9;
                }
                break;
        }
        healthChange = this.damage * dmgMultiplier * (1 - unitArmor / 100);
    } else {
        healthChange = this.damage;
    }
    //unit.health -= healthChange;
    unit.changeHealth(-healthChange);//Negative b/c damage
    return -healthChange;
}
/**
 * Adds the buff object of the damage object to the unit buff list.
 */
DamageObj.prototype.ApplyBuff = function (unit) {
    let b;
    if (typeof this.buff !== 'undefined' && this.buff !== null) {
        for (b in unit.buffObj) {
            if (unit.buffObj[b].name === this.buff.name) { return; }
        }
        unit.buffObj.push(this.buff);
    }
}
/**
 * Adds the hitstun of the damage object to the unit hitstun.
 */
DamageObj.prototype.ApplyHitstun = function (unit) {
    unit.hitstun += this.hitstun;
}
/* #region Apply Effects description */
/**
 * This is the main call to use when hitting a unit. Other functions should not be called.
 * @param unit The unit that the collision hits.
 */
/* #endregion */
DamageObj.prototype.ApplyEffects = function (unit) {
    let y = true;
    for (d in unit.damageObjArr) {
        if (unit.damageObjArr[d].id === this.id) {
            y = false;
            break;
        }
    }
    if (!y) { return; }//Needs to be added to unit types
    let tempDmg = DS.CloneDamageObject(this);
    tempDmg.id = this.id;
    unit.damageObjArr.push(tempDmg);
    tempDmg.ApplyDamage(unit);
    tempDmg.ApplyHitstun(unit);
    tempDmg.ApplyBuff(unit);
}
/* #endregion */
/* #region Buff Object */
/* #region Buff object description */
/**
 * This buff object holds the list of effects and is in charge of managing them.
 * The duration is based on the longest duration in the effect list.
 * @param {*} theName is just that... a name.
 * @param {*} theEffectList is a list of effect obejcts. 
 */
/* #endregion */
function BuffObj(theName = "", theEffectList = []) {
    this.name = theName;
    //Duration will be the length of the longest effect.
    this.effectList = theEffectList;
    let max = -1;
    let e;
    for (e in this.effectList) {
        max = Math.max(this.effectList[e].duration, max);
    }
    this.duration = max;
    this.timeLeft = this.duration;
}
/* #region Buff object update description */
/**
 * This function should be called by the unit in update.
 * This handles the updates of all effects in the buff object.
 * @param unit This should be 'this'.
 */
/* #endregion */
BuffObj.prototype.update = function (unit) {
    this.timeLeft--;
    let e;
    for (e in this.effectList) {
        //this.effectList[e] is effectobj
        if (this.effectList[e].intervalTimer <= 0) {
            this.effectList[e].intervalTimer = this.effectList[e].interval;
            if (typeof this.effectList[e].operation === 'function'){
                this.effectList[e].operation(unit);}
            this.effectList[e].Do(unit);
        } else { this.effectList[e].intervalTimer--; }
        this.effectList[e].timeLeft--;
        this.effectList[e].Undo(unit);
    }
}
/* #endregion */