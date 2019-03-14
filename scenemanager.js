// Layout for types for types of rooms.
var ROOMS = [
    // Empty Room to fill space
    [
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],

    // Base Room
    [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ],

    [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ],
];

function SceneManager() {
    this.insideMenu = true;
    this.menu = GAME_ENGINE.entities[0][0];
    this.levelTransition = false;
}

SceneManager.prototype.menuSelection = function (x, y) {
    var startGame = false;
    //inside controls
    if (this.menu.controls) {
        if (x >= this.menu.back.x && x <= this.menu.back.x + this.menu.back.width
            && y >= this.menu.back.y && y <= this.menu.back.y + this.menu.back.height) {
            this.menu.controls = false;
            this.menu.background.src = "./img/utilities/menu.png";
        }
    }//inside main menu
    else {
        //story
        if (x >= this.menu.button.x && x <= this.menu.button.x + this.menu.button.width
            && y >= this.menu.storyY && y <= this.menu.storyY + this.menu.button.height) {
            startGame = true;
            this.menu.story = true;
        }
        //controls
        else if (x >= this.menu.button.x && x <= this.menu.button.x + this.menu.button.width
            && y >= this.menu.controlsY && y <= this.menu.controlsY + this.menu.button.height) {
                this.menu.controls = true;
                this.menu.background.src = "./img/utilities/controls.png";
        }
    }

    if (startGame) {
        this.insideMenu = false;
        this.menu.removeFromWorld = true;
        BACKGROUND.generateLevelOne();
        SCENE_MANAGER.gameInit();
    }
}

SceneManager.prototype.playAgain = function (x, y) {
    //checks if player clicked "play again" (values are hardcoded)
    if (x >= 203 && x <= 435 && y >= 253 && y <= 276) {
        music.pause();
        music.currentTime = 0;
        SCENE_MANAGER.reset();
        BACKGROUND = new Background(myLevel, "./img/utilities/floor_level1.png");
    }
}

SceneManager.prototype.changeLevel = function (x, y) {
    //checks if player clicked "click here to continue" (values are hardcoded)
    if (x >= 168 && x <= 492 && y >= 357 && y <= 376) {
        SCENE_MANAGER.nextLevel();
        this.levelTransition = false;
    }
}

SceneManager.prototype.reset = function () {
    for (let i = 0; i < GAME_ENGINE.entities.length; i++) {
        for (let j = GAME_ENGINE.entities[i].length - 1; j >= 0; j--) {
            var entity = GAME_ENGINE.entities[i][j];
            entity.removeFromWorld = true;
            GAME_ENGINE.entities[i].pop();
        }
    }
 
    var menu = new Menu();
    GAME_ENGINE.addEntity(menu);
    SCENE_MANAGER.menu = menu;
    SCENE_MANAGER.insideMenu = true;
    CAMERA = new Camera();
    myScore = 0;
    myLevel = 1;

    //resetting html elements
    document.getElementById("hudInfo").style.display = "none";
    document.getElementById("hudMinimap").style.display = "none";
    document.getElementById("health").innerHTML = myPlayer.maxHealth;
    document.getElementById("healthImg").src = "./img/health_wireframe/green_health.png";
    for (let t = 1; t < 4; t++) {
        var spellHTML = document.getElementById("spell" + t);
        spellHTML.innerHTML = "Ready";
        spellHTML.style.color = color_green;
    }
    for (let x = 0; x < 25; x++) {
        document.getElementById("room" + x).style.backgroundColor = "black";
    }
}

SceneManager.prototype.nextLevel = function () {
    myPlayer.x = 295;
    myPlayer.y = 295;
    document.getElementById("level").innerHTML = myLevel;
    for (let i = 0; i < GAME_ENGINE.entities.length; i++) {
        for (let j = GAME_ENGINE.entities[i].length - 2; j >= 0; j--) {
            var entity = GAME_ENGINE.entities[i][j];
            entity.removeFromWorld = true;
            GAME_ENGINE.entities[i].pop();
        }
    }
    for (let i = 0; i < 24; i++) {
        document.getElementById("room" + i).style.backgroundColor = "black";
    }
    CAMERA = new Camera();
    GAME_ENGINE.addEntity(CAMERA);
    var floorImg;
    BACKGROUND = new Background(myLevel, floorImg);
    GAME_ENGINE.addEntity(BACKGROUND);
    if (myLevel === 3) {
        BACKGROUND.generateLevelThree();
    } else if (myLevel === 2) {
        BACKGROUND.generateLevelTwo();
    } else {
        BACKGROUND.generateLevelOne();
    }
    CAMERA.getStartingRoom();
    BACKGROUND.createWalls();
    BACKGROUND.decorateRoom();
}

SceneManager.prototype.gameInit = function () {
    GAME_ENGINE.addEntity(BACKGROUND);
    // Using players choice to grab the appropriate character sprite
    // Player
    myPlayer = new Player({
        side: AM.getAsset("./img/terran/marine/marine_move_right.png"),
        up: AM.getAsset("./img/terran/marine/marine_move_up.png"),
        down: AM.getAsset("./img/terran/marine/marine_move_down.png")
    },
        {
            side: AM.getAsset("./img/terran/marine/marine_shoot_right.png"),
            up: AM.getAsset("./img/terran/marine/marine_shoot_up.png"),
            down: AM.getAsset("./img/terran/marine/marine_shoot_down.png")
        },
        AM.getAsset("./img/terran/marine/marine_death.png"), 0, 9);

    GAME_ENGINE.addEntity(myPlayer);
    myPlayer.updateHealthHTML();
    GAME_ENGINE.addEntity(CAMERA);

    CAMERA.getStartingRoom();
    BACKGROUND.createWalls();
    BACKGROUND.decorateRoom();
    document.getElementById("hudInfo").style.display = "block";
    document.getElementById("hudMinimap").style.display = "block";
}
