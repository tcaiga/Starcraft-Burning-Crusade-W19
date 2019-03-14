function Background(theLevel, theFloorImg) {
    this.x = 0;
    this.y = 0;

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
    this.row = 0;
    this.col = 0;
    this.roomCount = 0;
    // For Canal
    this.bossRoomNum = 0;
    this.bossRoomIndex = [0, 0];
    this.isBossDead = false;
    this.canalX = 0;
    this.canalY = 0;
    this.backRoomNumbers = [];
    this.maxRoomCount = 5;
    this.drawFaceCount = 0;
    this.level = theLevel;
    this.background = new Image();
    this.background.src = theFloorImg;
    // **********************
    // * Key for room types *
    // **********************
    // 1 - Base Room
    // 2 - Infested Terran Trap Room
    // 3 - Puzzle Room
    // 8 - Starting Room
    // 9 - Ending Room
}

Background.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(this.background, this.floorX, this.floorY, canvasWidth, canvasHeight);
}

Background.prototype.update = function () {
    let monsterRoomCheck = false;
    for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
        var tempMonster = GAME_ENGINE.entities[4][i];
        if (tempMonster.roomNumber === this.bossRoomNum) {
            monsterRoomCheck = true;
        }
    }

    if (!monsterRoomCheck && !this.isBossDead) {
        GAME_ENGINE.addEntity(new Canal(this.bossRoomIndex[0] * canvasWidth + 285 + this.canalX,
            this.bossRoomIndex[1] * canvasHeight + 285 + this.canalY));
        this.isBossDead = true;
    }
};

Background.prototype.createWalls = function () {
    for (let i = 0; i < this.map.length; i++) {
        for (let j = 0; j < this.map[i].length; j++) {
            for (let row = 0; row < 20; row++) {
                for (let col = 0; col < 20; col++) {
                    let roomType = 0;
                    if (this.map[i][j] !== 0) {
                        roomType = 1;
                    }
                    let tempTile = ROOMS[roomType][row * 20 + col];
                    if (tempTile === 1) {
                        GAME_ENGINE.addEntity(new Wall(this.x + j * canvasWidth + col * TILE_SIZE * 2,
                            this.y + i * canvasHeight + row * TILE_SIZE * 2));
                    }
                }
            }
        }
    }
}

Background.prototype.decorateRoom = function () {
    var roomNumber = 0;
    var backRoomNumber = 0;
    var addBoss = true;
  
    for (let i = 0; i < this.map.length; i++) {
        for (let j = 0; j < this.map[i].length; j++) {
            // Drawing doors
            let testPos = this.facePos[this.drawFaceCount];
            if (this.drawFaceCount < this.maxRoomCount && this.map[i][j] !== 0) {

                let forwardDoorState = "closed";
                if (this.map[testPos[1]][testPos[0]] === 8) {
                    forwardDoorState = "open";
                }
                
                // Adding a door to go forward for all rooms except the ending room.
                if (this.face[this.drawFaceCount] === 0) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 304 + BACKGROUND.x,
                        testPos[1] * canvasHeight + BACKGROUND.y + 1, "up", forwardDoorState, roomNumber));
                    backRoomNumber -= 5;
                } else if (this.face[this.drawFaceCount] === 1) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 608 + BACKGROUND.x,
                        testPos[1] * canvasHeight + 304 + BACKGROUND.y, "right", forwardDoorState, roomNumber));
                    backRoomNumber += 1;
                } else if (this.face[this.drawFaceCount] === 2) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 304 + BACKGROUND.x,
                        testPos[1] * canvasHeight + 608 + BACKGROUND.y, "down", forwardDoorState, roomNumber));
                    backRoomNumber += 5;
                } else if (this.face[this.drawFaceCount] === 3) {
                    GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + BACKGROUND.x,
                        testPos[1] * canvasHeight + 304 + BACKGROUND.y, "left", forwardDoorState, roomNumber));
                    backRoomNumber -= 1;
                }

                this.backRoomNumbers.push(backRoomNumber);


                // Populating rooms with infested terran traps, monsters, and puzzles
                if (this.drawFaceCount > 0) {
                    if (this.map[testPos[1]][testPos[0]] === 1) {
                        if (this.drawFaceCount % 3 === 0) {
                            var ultralisk = new Ultralisk(AM.getAsset("./img/zerg/ultra/ultra_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 285 + BACKGROUND.y, roomNumber);

                            GAME_ENGINE.addEntity(ultralisk);
                        } else if (this.drawFaceCount % 3 === 1) {
                            var hydralisk = new Hydralisk(AM.getAsset("./img/zerg/hydra/hydra_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 285 + BACKGROUND.y, roomNumber);

                            var zergling1 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x + 80, testPos[1] * canvasHeight + 285 + BACKGROUND.y + 80, roomNumber);
                            var zergling2 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x + 80, testPos[1] * canvasHeight + 285 + BACKGROUND.y, roomNumber);
                            var zergling3 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 285 + BACKGROUND.y + 80, roomNumber);
                            var zergling4 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x - 80, testPos[1] * canvasHeight + 285 + BACKGROUND.y, roomNumber);
                            var zergling5 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 285 + BACKGROUND.y - 80, roomNumber);
                            var zergling6 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x + 80, testPos[1] * canvasHeight + 285 + BACKGROUND.y - 80, roomNumber);
                            var zergling7 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x - 80, testPos[1] * canvasHeight + 285 + BACKGROUND.y + 80, roomNumber);
                            var zergling8 = new Zergling(AM.getAsset("./img/zerg/zergling/zergling_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x - 80, testPos[1] * canvasHeight + 285 + BACKGROUND.y - 80, roomNumber);

                            GAME_ENGINE.addEntity(hydralisk);
                            GAME_ENGINE.addEntity(zergling1);
                            GAME_ENGINE.addEntity(zergling2);
                            GAME_ENGINE.addEntity(zergling3);
                            GAME_ENGINE.addEntity(zergling4);
                            GAME_ENGINE.addEntity(zergling5);
                            GAME_ENGINE.addEntity(zergling6);
                            GAME_ENGINE.addEntity(zergling7);
                            GAME_ENGINE.addEntity(zergling8);
                        } else if (this.drawFaceCount % 3 === 2) {
                            var darkTemplar = new DarkTemplar(AM.getAsset("./img/protoss/dark_templar/dark_templar_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 285 + BACKGROUND.y, roomNumber);
                            var zealot1 = new Zealot(AM.getAsset("./img/protoss/zealot/zealot_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x + 80, testPos[1] * canvasHeight + 285 + BACKGROUND.y, roomNumber);
                            var zealot2 = new Zealot(AM.getAsset("./img/protoss/zealot/zealot_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x - 80, testPos[1] * canvasHeight + 285 + BACKGROUND.y, roomNumber);
                            var zealot3 = new Zealot(AM.getAsset("./img/protoss/zealot/zealot_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 285 + BACKGROUND.y + 80, roomNumber);
                            var zealot4 = new Zealot(AM.getAsset("./img/protoss/zealot/zealot_move_right.png"),
                                testPos[0] * canvasWidth + 308 + BACKGROUND.x, testPos[1] * canvasHeight + 285 + BACKGROUND.y - 80, roomNumber);

                            GAME_ENGINE.addEntity(darkTemplar);
                            GAME_ENGINE.addEntity(zealot1);
                            GAME_ENGINE.addEntity(zealot2);
                            GAME_ENGINE.addEntity(zealot3);
                            GAME_ENGINE.addEntity(zealot4);
                        }
                    } else if (this.map[testPos[1]][testPos[0]] === 2) {
                        for (let r = 1; r < 4; r++) {
                            for (let s = 1; s < 4; s++) {
                                if (r % 2 === 1 && s % 2 === 1) {
                                    // 9 infested terrans appear in the shape of a cube spaced out.
                                    var infested = new Infested(AM.getAsset("./img/zerg/infested/infested_move_right.png"),

                                    testPos[0] * canvasWidth + (r * 160) + BACKGROUND.x - 10,
                                    testPos[1] * canvasHeight + (s * 160) + BACKGROUND.y - 10, roomNumber);

                                    GAME_ENGINE.addEntity(infested);
                                }
                            }
                        }
                    }
                }

                this.drawFaceCount++;
            }

            // Adding a boss to the final room
            if (this.map[testPos[1]][testPos[0]] === 9 && addBoss) {
                this.bossRoomNum = roomNumber;
                this.bossRoomIndex = [testPos[0], testPos[1]];
                this.canalX = BACKGROUND.x;
                this.canalY = BACKGROUND.y;
                addBoss = false;
                if (myLevel === 1) {
                    var pool = new Zerg_Boss(AM.getAsset("./img/buildings/gravemind.png"),
                        testPos[0] * canvasWidth + 220 + BACKGROUND.x, testPos[1] * canvasHeight + 250 + BACKGROUND.y, roomNumber);
                    GAME_ENGINE.addEntity(pool);
                } else if (myLevel === 2) {
                    var temp2 = new Templar_Boss(testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y, roomNumber, null);
                    var temp = new Templar_Boss(testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32 + 100, testPos[1] * canvasHeight + 308 + BACKGROUND.y + 100, roomNumber, temp2);
                    GAME_ENGINE.addEntity(temp2);
                    GAME_ENGINE.addEntity(temp);
                } else {
                    var temp2 = new Templar_Boss(testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y, roomNumber, null);
                    var temp = new Templar_Boss(testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32 + 100, testPos[1] * canvasHeight + 308 + BACKGROUND.y + 100, roomNumber, temp2);
                    GAME_ENGINE.addEntity(temp2);
                    GAME_ENGINE.addEntity(temp);
                }


                var temp2 = new Templar_Boss(testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y, roomNumber, null);
                var temp = new Templar_Boss(testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32 + 100, testPos[1] * canvasHeight + 308 + BACKGROUND.y + 100, roomNumber, temp2);

                // <BOSS> -- THIS IS HOW YOU ADD TEMPLAR BOSSES
                /*var temp2 = new Templar_Boss(testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32, testPos[1] * canvasHeight + 308 + BACKGROUND.y, roomNumber, null);
                var temp = new Templar_Boss(testPos[0] * canvasWidth + 308 + BACKGROUND.x + 32 + 100, testPos[1] * canvasHeight + 308 + BACKGROUND.y + 100, roomNumber, temp2);


                GAME_ENGINE.addEntity(temp2);
                GAME_ENGINE.addEntity(temp);*/
                console.log("I made a boss");

            }

            roomNumber++;
        }
    }
    console.table(this.map);

    // ALL THIS DOWN HERE IS FOR BACKWARD DOORS TO BE CLOSED UNTIL EVERYTHING IN THE ROOM IS DEAD
    this.backRoomNumbers = this.backRoomNumbers.sort(function(a, b){return a-b})
    this.drawFaceCount = 0;
    var idx = 0;
    for (let i = 0; i < this.map.length; i++) {
        for (let j = 0; j < this.map[i].length; j++) {
            let backwardDoorState = "closed";
            let testPos = this.facePos[this.drawFaceCount];
            if (this.drawFaceCount < this.maxRoomCount && this.map[i][j] !== 0) {
                // Adding a door to go back for all rooms except starting room.
                if (this.drawFaceCount < this.facePos.length - 1) {
                    let testPosReverse = this.facePos[this.drawFaceCount + 1];
                    if (this.face[this.drawFaceCount] === 0) {
                        GAME_ENGINE.addEntity(new Door(testPosReverse[0] * canvasWidth + 304 + BACKGROUND.x,
                            testPosReverse[1] * canvasHeight + 608 + BACKGROUND.y, "down", backwardDoorState, this.backRoomNumbers[idx]));
                    } else if (this.face[this.drawFaceCount] === 1) {
                        GAME_ENGINE.addEntity(new Door(testPosReverse[0] * canvasWidth + BACKGROUND.x,
                            testPos[1] * canvasHeight + 304 + BACKGROUND.y, "left", backwardDoorState, this.backRoomNumbers[idx]));
                    } else if (this.face[this.drawFaceCount] === 2) {
                        GAME_ENGINE.addEntity(new Door(testPosReverse[0] * canvasWidth + 304 + BACKGROUND.x,
                            testPosReverse[1] * canvasHeight + BACKGROUND.y + 1, "up", backwardDoorState, this.backRoomNumbers[idx]));
                    } else if (this.face[this.drawFaceCount] === 3) {
                        GAME_ENGINE.addEntity(new Door(testPosReverse[0] * canvasWidth + 608 + BACKGROUND.x,
                            testPosReverse[1] * canvasHeight + 304 + BACKGROUND.y, "right", backwardDoorState, this.backRoomNumbers[idx]));
                    }
                }

                // Adding a door to go back for the ending room.
                if (this.drawFaceCount + 1 === this.facePos.length) {
                    if (this.face[this.drawFaceCount] === 0) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 304 + BACKGROUND.x,
                            testPos[1] * canvasHeight + 608 + BACKGROUND.y, "down", backwardDoorState, this.backRoomNumbers[idx]));
                    } else if (this.face[this.drawFaceCount] === 1) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + BACKGROUND.x,
                            testPos[1] * canvasHeight + 304 + BACKGROUND.y, "left", backwardDoorState, this.backRoomNumbers[idx]));
                    } else if (this.face[this.drawFaceCount] === 2) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 304 + BACKGROUND.x,
                            testPos[1] * canvasHeight + BACKGROUND.y + 1, "up", backwardDoorState, this.backRoomNumbers[idx]));
                    } else if (this.face[this.drawFaceCount] === 3) {
                        GAME_ENGINE.addEntity(new Door(testPos[0] * canvasWidth + 608 + BACKGROUND.x,
                            testPos[1] * canvasHeight + 304 + BACKGROUND.y, "right", backwardDoorState, this.backRoomNumbers[idx]));
                    }
                }
                this.drawFaceCount++;
                idx++;
            }
        }
    }
}


Background.prototype.generateLevelOne = function () {
    music.play();
    this.maxRoomCount = 6;
    this.map = [
        [8, 1, 1, 0, 0],
        [0, 2, 1, 0, 0],
        [0, 3, 9, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ];

    this.face.push(1);
    this.facePos.push([0, 0]);
    this.face.push(1);
    this.facePos.push([1, 0]);
    this.face.push(2);
    this.facePos.push([2, 0]);
    this.face.push(3);
    this.facePos.push([2, 1]);
    this.face.push(2);
    this.facePos.push([1, 1]);
    this.face.push(1);
    this.facePos.push([1, 2]);
    this.facePos.push([2, 2]);

    this.drawMiniMap();
}

Background.prototype.generateLevelTwo = function () {
    music.play();
    this.maxRoomCount = 8;
    this.map = [
        [8, 1, 0, 0, 0],
        [0, 1, 2, 1, 0],
        [0, 0, 2, 1, 0],
        [0, 0, 3, 9, 0],
        [0, 0, 0, 0, 0],
    ];

    this.face.push(1);
    this.facePos.push([0, 0]);
    this.face.push(2);
    this.facePos.push([1, 0]);
    this.face.push(1);
    this.facePos.push([1, 1]);
    this.face.push(1);
    this.facePos.push([2, 1]);
    this.face.push(2);
    this.facePos.push([3, 1]);
    this.face.push(3);
    this.facePos.push([3, 2]);
    this.face.push(2);
    this.facePos.push([2, 2]);
    this.face.push(1);
    this.facePos.push([2, 3]);
    this.facePos.push([3, 3]);

    this.drawMiniMap();
}

Background.prototype.generateLevelThree = function () {
    music.play();
    this.maxRoomCount = 12;
    this.map = [
        [8, 1, 1, 0, 0],
        [0, 0, 2, 0, 0],
        [0, 1, 1, 1, 2],
        [0, 1, 2, 1, 3],
        [0, 0, 0, 0, 9],
    ];

    this.face.push(1);
    this.facePos.push([0, 0]);
    this.face.push(1);
    this.facePos.push([1, 0]);
    this.face.push(2);
    this.facePos.push([2, 0]);
    this.face.push(2);
    this.facePos.push([2, 1]);
    this.face.push(3);
    this.facePos.push([2, 2]);
    this.face.push(2);
    this.facePos.push([1, 2]);
    this.face.push(1);
    this.facePos.push([1, 3]);
    this.face.push(1);
    this.facePos.push([2, 3]);
    this.face.push(0);
    this.facePos.push([3, 3]);
    this.face.push(1);
    this.facePos.push([3, 2]);
    this.face.push(2);
    this.facePos.push([4, 2]);
    this.face.push(2);
    this.facePos.push([4, 3]);
    this.facePos.push([4, 4]);

    this.drawMiniMap();
}

Background.prototype.drawMiniMap = function () {
    var roomNum = 0;
    for (var i = 0; i < this.map.length; i++) {
        for (var j = 0; j < this.map[i].length; j++) {
            if (this.map[i][j] === 8) {
                document.getElementById("room" + roomNum).style.backgroundColor = "blue";
            } else if (this.map[i][j] === 9) {
                document.getElementById("room" + roomNum).style.backgroundColor = "red";
            } else if (this.map[i][j] !== 0) {
                document.getElementById("room" + roomNum).style.backgroundColor = "white";
            }
            roomNum++;
        }
    }
}

function Door(theX, theY, theDirection, state, roomNumber) {
    this.x = theX;
    this.y = theY;
    this.direction = theDirection;
    // State of the door
    // "open"
    // "closed"
    this.state = state;
    this.roomNumber = roomNumber;
    this.image = new Image();
    this.image.src = "./img/buildings/door_" + this.state + ".png";
    this.boundingbox = new BoundingBox(this.x, this.y, 32, 32);
}

Door.prototype.update = function () {
    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        if (this.state === "open") {
            CAMERA.move(this.direction);
        }
    }

    let monsterRoomCheck = false;
    for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
        var tempMonster = GAME_ENGINE.entities[4][i];
        if (tempMonster.roomNumber === this.roomNumber) {
            monsterRoomCheck = true;
        }
    }

    if (monsterRoomCheck) {
        this.state = "closed";
    } else {
        this.state = "open";
    }

    this.image.src = "./img/buildings/door_" + this.state + ".png";
    // do some condition check to open door

    this.boundingbox = new BoundingBox(this.x, this.y, 32, 32);
}

Door.prototype.draw = function () {
    GAME_ENGINE.ctx.drawImage(this.image, this.x - CAMERA.x, this.y - CAMERA.y, 32, 32);
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = "red";
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);
    }

    // draw door to update if open or closed
}

function Wall(theX, theY) {
    this.x = theX;
    this.y = theY;
    this.image = new Image();
    this.image.src = "./img/utilities/wall_tile.png";
    this.boundingbox = new BoundingBox(this.x, this.y, 32, 32);
}

Wall.prototype.update = function () {
    if (this.boundingbox.collide(myPlayer.boundingbox)) {
        if (myPlayer.x > this.x) {
            myPlayer.x += myPlayer.actualSpeed;
        }
        if (myPlayer.x < this.x) {
            myPlayer.x -= myPlayer.actualSpeed;
        }
        if (myPlayer.y > this.y) {
            myPlayer.y += myPlayer.actualSpeed;
        }
        if (myPlayer.y < this.y) {
            myPlayer.y -= myPlayer.actualSpeed;
        }
    }

    for (var i = 0; i < GAME_ENGINE.entities[4].length; i++) {
        var entity = GAME_ENGINE.entities[4][i];
        if (this.boundingbox.collide(entity.boundingbox)) {
            var distance = entity.speed / 100;
            if (entity.x > this.x) {
                entity.x += distance;
            }
            if (entity.x < this.x) {
                entity.x -= distance;
            }
            if (entity.y > this.y) {
                entity.y += distance;
            }
            if (entity.y < this.y) {
                entity.y -= distance;
            }
        }
    }

    for (var p = 0; p < GAME_ENGINE.entities[3].length; p++) {
        var proj = GAME_ENGINE.entities[3][p];
        if (this.boundingbox.collide(proj.boundingbox)) {
            GAME_ENGINE.removeEntity(proj);
        }
    }

    this.boundingbox = new BoundingBox(this.x, this.y, 32, 32);
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

function Canal(theX, theY) {
    this.x = theX;
    this.y = theY;
    this.collideOnce = false;
    this.animation = new Animation(AM.getAsset("./img/buildings/canal_on.png"), 75, 75, 1, 0.15, 2, true, 1);
    this.boundingbox = new BoundingBox(this.x, this.y, 75, 75);
}

Canal.prototype.update = function () {
    if (this.boundingbox.collide(myPlayer.boundingbox) && !this.collideOnce) {
        this.collideOnce = true;
        myLevel++;
        SCENE_MANAGER.levelTransition = true;
    }

    this.boundingbox = new BoundingBox(this.x, this.y, 75, 75);
}

Canal.prototype.draw = function () {
    this.animation.drawFrame(GAME_ENGINE.clockTick, GAME_ENGINE.ctx, this.x, this.y);
    if (GAME_ENGINE.debug) {
        GAME_ENGINE.ctx.strokeStyle = "red";
        GAME_ENGINE.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y,
            this.boundingbox.width, this.boundingbox.height);
    }
}
