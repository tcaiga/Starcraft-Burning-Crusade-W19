function Background() {
    this.x = -1280;
    this.y = -1280;

    this.floorX = 0;
    this.floorY = 0;
    // Keeping track of the last direction the generator has moved.
    // 0 = North
    // 1 = East
    // 2 = South
    // 3 = West
    this.face = [];
    this.facePos = [];
    this.directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    this.map = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ];
    this.row = 2;
    this.col = 2;
    this.roomCount = 0;
    this.maxRoomCount = 5;
    this.map[this.row][this.col] = 2;
    this.facePos.push([this.col, this.row]);
    this.drawFaceCount = 0;
}

Background.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(AM.getAsset("./img/utilities/floor.png"), this.floorX, this.floorY, 640, 640);
    if (myPlayer.dead) {
        GAME_ENGINE.ctx.font = "50px Starcraft";
        //console.log(GAME_ENGINE.ctx.measureText("Game Over"));
        GAME_ENGINE.ctx.fillStyle = color_red;
        GAME_ENGINE.ctx.fillText("Game Over", 135, 200);
        GAME_ENGINE.ctx.font = "30px Starcraft";
        //console.log(GAME_ENGINE.ctx.measureText("Play Again"));
        GAME_ENGINE.ctx.fillText("Play Again", 208, 275);
        // GAME_ENGINE.ctx.strokeStyle = color_red;
        // GAME_ENGINE.ctx.strokeRect(205, 253, 230, 28);

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
                                this.y + i * canvasHeight + row * TILE_SIZE * 2 + 1, "up"));
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
                        testPos[1] * canvasHeight + BACKGROUND.y + 1, "up"));
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
                                var infested = new Infested(AM.getAsset("./img/zerg/infested/infested_move_right.png"),
                                testPos[0] * canvasWidth + (r * 160) + BACKGROUND.x - 10,
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
                            testPosReverse[1] * canvasHeight + BACKGROUND.y + 1, "up"));
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
                            testPos[1] * canvasHeight + BACKGROUND.y + 1, "up"));
                    } else if (this.face[this.drawFaceCount] === 3) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 608 + BACKGROUND.x,
                            testPos[1] * canvasHeight + 304 + BACKGROUND.y, "right"));
                    }
                }
                
                if (this.drawFaceCount % 3 === 0) {
                    var zergling = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                    testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    GAME_ENGINE.addEntity(zergling);
                } else if (this.drawFaceCount % 3 === 1) {
                    var hydralisk = new Hydralisk(AM.getAsset("./img/zerg/hydra/hydra_move_right.png"),
                    testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    GAME_ENGINE.addEntity(hydralisk);
                } else if (this.drawFaceCount % 3 === 2) {
                    var ultralisk = new Ultralisk(AM.getAsset("./img/zerg/ultra/ultra_move_right.png"),
                    testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y);

                    GAME_ENGINE.addEntity(ultralisk);
                }

                this.drawFaceCount++;
            }
        }
    }
}

Background.prototype.generateSurvivalMap = function () {
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

    this.drawMiniMap();
}

Background.prototype.drawMiniMap = function () {
    var roomNum = 0;
    for (var i = 0; i < this.map.length; i++) {
        for (var j = 0; j < this.map[i].length; j++) {
            if (this.map[i][j] === 1) {
                document.getElementById("room" + roomNum).style.backgroundColor = "white";
            } else if (this.map[i][j] === 2) {
                document.getElementById("room" + roomNum).style.backgroundColor = "blue";
            } else if (this.map[i][j] === 3) {
                document.getElementById("room" + roomNum).style.backgroundColor = "red";
            }
            roomNum++;
        }
    }
}

function Door(theX, theY, theDirection) {
    this.x = theX;
    this.y = theY;
    this.direction = theDirection;
    this.image = new Image();
    this.image.src = "./img/buildings/door_open.png";
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
    this.image.src = "./img/utilities/wall_tile.png";
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