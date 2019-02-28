function Background() {
    this.x = -1280;
    this.y = -1280;
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
                        GAME_ENGINE.ctx.drawImage(this.tile, this.x + j * canvasWidth + s * TILE_SIZE * 2,
                            this.y + i * canvasHeight + r * TILE_SIZE * 2);
                        GAME_ENGINE.ctx.drawImage(this.tile, this.x + j * canvasWidth + s * TILE_SIZE * 2 + TILE_SIZE,
                            this.y + i * canvasHeight + r * TILE_SIZE * 2);
                        GAME_ENGINE.ctx.drawImage(this.tile, this.x + j * canvasWidth + s * TILE_SIZE * 2,
                            this.y + i * canvasHeight + r * TILE_SIZE * 2 + TILE_SIZE);
                        GAME_ENGINE.ctx.drawImage(this.tile, this.x + j * canvasWidth + s * TILE_SIZE * 2 + TILE_SIZE,
                            this.y + i * canvasHeight + r * TILE_SIZE * 2 + TILE_SIZE);
                    }
                }
            }
        }
    }
}

Background.prototype.update = function () {
};

Background.prototype.createWalls = function () {
    for (let i = 0; i < this.map.length; i++) {
        for (let j = 0; j < this.map[i].length; j++) {
            for (let row = 0; row < 20; row++) {
                for (let col = 0; col < 20; col++) {
                    let tempTile = ROOMS[this.map[i][j]][row * 20 + col];
                    if (tempTile === 1) {
                        if (col === 0 && row != 0 && row != 19) {
                            GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE * 2,
                                this.y + i * canvasHeight + row * TILE_SIZE * 2, "left"));
                        } else if (col === 19 && row != 0 & row != 19) {
                            GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE * 2,
                                this.y + i * canvasHeight + row * TILE_SIZE * 2, "right"));
                        } else if (row === 19) {
                            GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE * 2,
                                this.y + i * canvasHeight + row * TILE_SIZE * 2, "down"));
                        } else if (row === 0) {
                            GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE * 2,
                                this.y + i * canvasHeight + row * TILE_SIZE * 2, "up"));
                        }
                    }
                }
            }
        }
    }
}

Background.prototype.decorateRoom = function () {
    for (let i = 0; i < this.map.length; i++) {
        for (let j = 0; j < this.map[i].length; j++) {
            // Drawing doors
            if (this.drawFaceCount < this.maxRoomCount && this.map[i][j] !== 0) {
                let testPos = this.facePos[this.drawFaceCount];

                // Adding a door to go forward for all rooms except the ending room.
                if (this.face[this.drawFaceCount] === 0) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 304 + BACKGROUND.x,
                        testPos[1] * canvasHeight + BACKGROUND.y, "up"));
                } else if (this.face[this.drawFaceCount] === 1) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 608 + BACKGROUND.x,
                        testPos[1] * canvasHeight + 304 + BACKGROUND.y, "right"));
                } else if (this.face[this.drawFaceCount] === 2) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 304 + BACKGROUND.x,
                        testPos[1] * canvasHeight + 608 + BACKGROUND.y, "down"));
                } else if (this.face[this.drawFaceCount] === 3) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + BACKGROUND.x,
                        testPos[1] * canvasHeight + 304 + BACKGROUND.y, "left"));
                }

                // Adding traps in all rooms except the starting and ending rooms.
                let choice = Math.floor(Math.random() * 2);
                // 33% chance a room that is not the start or end will have traps.
                if (this.drawFaceCount > 0) {
                    if (choice === 0) {
                        for (let r = 1; r < 4; r++) {
                            for (let s = 1; s < 4; s++) {
                                // 9 infested terrans appear in the shape of a cube spaced out.
                                var infested = new Infested({
                                    'r': AM.getAsset("./img/zerg/infested/infested_move_right.png"),
                                    'l': AM.getAsset("./img/zerg/infested/infested_move_left.png")
                                }, testPos[0] * canvasWidth + (r * 160) + BACKGROUND.x - 10,
                                testPos[1] * canvasHeight + (s * 160) + BACKGROUND.y - 10);
                                GAME_ENGINE.addEntity(infested);
                            }
                        }
                    } else if (choice === 1) {
    
                    }
                }

                // Adding a door to go back for all rooms except starting room.
                if (this.drawFaceCount < this.facePos.length - 1) {
                    let testPosReverse = this.facePos[this.drawFaceCount + 1];
                    if (this.face[this.drawFaceCount] === 0) {
                        GAME_ENGINE.addEntity(new Door(testPosReverse[0] * canvasWidth + 304 + BACKGROUND.x,
                            testPosReverse[1] * canvasHeight + 608 + BACKGROUND.y, "down"));
                    } else if (this.face[this.drawFaceCount] === 1) {
                        GAME_ENGINE.addEntity(new Door(testPosReverse[0] * canvasWidth + BACKGROUND.x,
                            testPos[1] * canvasHeight + 304 + BACKGROUND.y, "left"));
                    } else if (this.face[this.drawFaceCount] === 2) {
                        GAME_ENGINE.addEntity(new Door(testPosReverse[0] * canvasWidth + 304 + BACKGROUND.x,
                            testPosReverse[1] * canvasHeight + BACKGROUND.y, "up"));
                    } else if (this.face[this.drawFaceCount] === 3) {
                        GAME_ENGINE.addEntity(new Door(testPosReverse[0] * canvasWidth + 608 + BACKGROUND.x,
                            testPosReverse[1] * canvasHeight + 304 + BACKGROUND.y, "right"));
                    }
                }
                
                // Adding a door to go back for the ending room.
                if (this.drawFaceCount + 1 === this.facePos.length) {
                    if (this.face[this.drawFaceCount] === 0) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 304 + BACKGROUND.x,
                            testPos[1] * canvasHeight + 608 + BACKGROUND.y, "down"));
                    } else if (this.face[this.drawFaceCount] === 1) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + BACKGROUND.x,
                            testPos[1] * canvasHeight + 304 + BACKGROUND.y, "left"));
                    } else if (this.face[this.drawFaceCount] === 2) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 304 + BACKGROUND.x,
                            testPos[1] * canvasHeight + BACKGROUND.y, "up"));
                    } else if (this.face[this.drawFaceCount] === 3) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 608 + BACKGROUND.x,
                            testPos[1] * canvasHeight + 304 + BACKGROUND.y, "right"));
                    }
                }
                
                if (this.drawFaceCount % 4 === 0) {
                    var tinyzombie = new TinyZombie({
                        'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
                        'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    var tinyzombie1 = new TinyZombie({
                        'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
                        'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x - 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    var tinyzombie2 = new TinyZombie({
                        'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
                        'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 308 + BACKGROUND.y + 32);

                    var tinyzombie3 = new TinyZombie({
                        'r': AM.getAsset("./img/monsters/tiny_zombie_run.png"),
                        'l': AM.getAsset("./img/monsters/tiny_zombie_run_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 308 + BACKGROUND.y - 32);

                    GAME_ENGINE.addEntity(tinyzombie);
                    GAME_ENGINE.addEntity(tinyzombie1);
                    GAME_ENGINE.addEntity(tinyzombie2);
                    GAME_ENGINE.addEntity(tinyzombie3);
                } else if (this.drawFaceCount % 4 === 1) {
                    var maskedorc = new MaskedOrc({
                        'r': AM.getAsset("./img/monsters/masked_orc_run.png"),
                        'l': AM.getAsset("./img/monsters/masked_orc_run_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    var ogre = new Ogre({
                        'r': AM.getAsset("./img/monsters/ogre_run.png"),
                        'l': AM.getAsset("./img/monsters/ogre_run_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x - 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    var swampy = new Swampy({
                        'r': AM.getAsset("./img/monsters/swampy_run.png"),
                        'l': AM.getAsset("./img/monsters/swampy_run_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 308 + BACKGROUND.y + 32);

                    var zerg = new Zerg_Boss({
                        'r': AM.getAsset("./img/zerg/spawning_pool.png"),
                        'l': AM.getAsset("./img/zerg/spawning_pool.png"),
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x - 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    GAME_ENGINE.addEntity(maskedorc);
                    GAME_ENGINE.addEntity(ogre);
                    GAME_ENGINE.addEntity(swampy);
                    GAME_ENGINE.addEntity(zerg);
                    console.log("\nSP x = " + zerg.x + "\nSP y = " + zerg.y);

                } else if (this.drawFaceCount % 4 === 2) {
                    var devil = new Devil({
                        'r': AM.getAsset("./img/devil.png"),
                        'l': AM.getAsset("./img/devil_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    var acolyte = new Acolyte({
                        'r': AM.getAsset("./img/acolyte.png"),
                        'l': AM.getAsset("./img/acolyte_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 308 + BACKGROUND.y + 32);

                    GAME_ENGINE.addEntity(devil);
                    GAME_ENGINE.addEntity(acolyte);
                } else if (this.drawFaceCount % 4 === 3) {
                    var bigdemon = new BigDemon({
                        'r': AM.getAsset("./img/monsters/big_demon_run.png"),
                        'l': AM.getAsset("./img/monsters/big_demon_run_left.png")
                    }, testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    GAME_ENGINE.addEntity(bigdemon);
                }

                this.drawFaceCount++;
            }
        }
    }
}

Background.prototype.validDirection = function () {
    music.play();
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
}

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

function Wall(theX, theY, theDirection) {
    this.x = theX;
    this.y = theY;
    this.direction = theDirection;
    this.image = new Image();
    this.image.src = "./img/floor1.png";
    this.boundingbox = new BoundingBox(this.x, this.y, 32, 32);
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
    GAME_ENGINE.ctx.drawImage(this.image, this.x - CAMERA.x + 16, this.y - CAMERA.y, 16, 16);
    GAME_ENGINE.ctx.drawImage(this.image, this.x - CAMERA.x + 16, this.y - CAMERA.y + 16, 16, 16);
    GAME_ENGINE.ctx.drawImage(this.image, this.x - CAMERA.x, this.y - CAMERA.y + 16, 16, 16);

    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = color_red;
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
             this.boundingbox.width, this.boundingbox.height);
    }
}