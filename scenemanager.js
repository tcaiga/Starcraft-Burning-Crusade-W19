function SceneManager() {
    this.insideMenu = true;
    this.ctx = GAME_ENGINE.ctx;
    this.menu = GAME_ENGINE.entities[0];
}

SceneManager.prototype.menuSelection = function(x, y) {
    var classPicked = false;
    if (y >= this.menu.classButtonY && y <= this.menu.classButtonBottom) {
        if(x >= this.menu.mageButtonX && x <= this.menu.mageButtonX + this.menu.classButtonW) {
            classPicked = true;
            GAME_ENGINE.playerPick = 0;
        }  else if (x >= this.menu.rangerButtonX && x <= this.menu.rangerButtonX + this.menu.classButtonW) {
            classPicked = true;
            GAME_ENGINE.playerPick = 1;
        } else if (x >= this.menu.knightButtonX && x <= this.menu.knightButtonX + this.menu.classButtonW) {
            classPicked = true;
            GAME_ENGINE.playerPick = 2;
        }
    }

    if (classPicked) {
        this.insideMenu = false;
        this.menu.removeFromWorld = true;
        SCENE_MANAGER.gameInit();
    }
}

SceneManager.prototype.gameInit = function () {
    GAME_ENGINE.addEntity(new Background(GAME_ENGINE));
    // Monster
    var devil = new Devil(GAME_ENGINE, AM.getAsset("./img/devil.png"));
    var acolyte = new Acolyte(GAME_ENGINE, AM.getAsset("./img/acolyte.png"));
    var monster = new Monster(GAME_ENGINE, AM.getAsset("./img/NPC_21.png"));
    GAME_ENGINE.addEntity(monster);
    GAME_ENGINE.addMonsterEntity(monster);
    GAME_ENGINE.addEntity(devil);
    GAME_ENGINE.addMonsterEntity(devil);
    GAME_ENGINE.addEntity(acolyte);
    GAME_ENGINE.addMonsterEntity(acolyte);

    // Trap
    var trap = new Trap(GAME_ENGINE, AM.getAsset("./img/floor_trap_up.png"),
    AM.getAsset("./img/floor_trap_down.png"));
    GAME_ENGINE.addEntity(trap);
    GAME_ENGINE.addTrapEntity(trap);

    var hud = new HUD(GAME_ENGINE);
    GAME_ENGINE.addEntity(hud);
    var sidebar = new Sidebar(GAME_ENGINE);
    GAME_ENGINE.addEntity(sidebar);
    hudHeight = hud.height;
    sidebarWidth = sidebar.width;
    gameWorldHeight = canvasHeight - hud.height;

    // Using players choice to grab the appropriate character sprite
    // Player
    myPlayer = new Player(GAME_ENGINE, AM.getAsset(characterSprites[GAME_ENGINE.playerPick]["spritesheet"]), 
    characterSprites[GAME_ENGINE.playerPick]["xOffset"], characterSprites[GAME_ENGINE.playerPick]["yOffset"]);
    GAME_ENGINE.addEntity(myPlayer);
    GAME_ENGINE.addPlayerEntity(myPlayer);
}