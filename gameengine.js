window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.keyA = false;
    this.keyS = false;
    this.keyD = false;
    this.keyW = false;
    this.keyShift = false;
    this.movement = false;
    this.menu = true;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();
    this.startInput();
}

GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (x < 1024) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return { x: x, y: y };
    }

    var that = this;

    // event listeners are added here

    this.ctx.canvas.addEventListener("click", function(e){
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (that.menu === true) {
            var classPicked = false;
            if (y >= 500 && y <= 537) {
                if(x >= 101 && x <= 201) {
                    console.log("Mage Picked");
                    classPicked = true;
                }  else if (x >= 302 && x <= 402) {
                    console.log("Ranger Picked");
                    classPicked = true;
                } else if (x >= 503 && x <= 603) {
                    console.log("Knight Picked");
                    classPicked = true;
                }
            }
            if (classPicked) {
            that.menu = false;
            that.entities.pop();
            console.log("click");
            that.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
            gameEngine.addEntity(new Background(gameEngine));
             gameEngine.addEntity(new Player(gameEngine, AM.getAsset("./img/NPC_22.png"),
                AM.getAsset("./img/NPC_22_Flipped.png")));
            gameEngine.addEntity(new Monster1(gameEngine, AM.getAsset("./img/NPC_21.png")));
            gameEngine.addEntity(new Trap(gameEngine, AM.getAsset("./img/whackFireTrap.png")));
            }
        }
    }, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {
        // Sprint functionality
        if (e.code === "ShiftLeft") {
            that.keyShift = true;
        }

        if (e.code === "KeyW") {
            that.keyW = true;
            that.movement = true;
        } else if (e.code === "KeyA") {
            that.keyA = true;
            that.movement = true;
        } else if (e.code === "KeyS") {
            that.keyS = true;
            that.movement = true;
        } else if (e.code === "KeyD") {
            that.keyD = true;
            that.movement = true;
        } 
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        // Stop sprinting if left shift is released
        if (e.code === "ShiftLeft") {
            that.keyShift = false;
        }

        if (e.code === "KeyW") {
            that.keyW = false;
        } else if (e.code === "KeyA") {
            that.keyA = false;
        } else if (e.code === "KeyS") {
            that.keyS = false;
        } else if (e.code === "KeyD") {
            that.keyD = false;
        }
        /*if key is still being pressed down when another key is pressed up
          then movement is still happening. */
        if (!that.keyW && !that.keyA && !that.keyS && !that.keyD) {
            that.movement = false;
        }
    }, false);
}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        entity.update();
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}