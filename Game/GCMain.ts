//------------------------------------------------------------------------------------------------------
// 入口
//------------------------------------------------------------------------------------------------------
// 新建全局变量Game，可用自定义子类继承GameBase
var Game = new GameBase();

// 收集所有精灵信息
function collectSprites(sprite: GameSprite, sprites: GameSprite[]) {
    for (let i = 0; i < sprite.numChildren; i++) {
        const node = sprite.getChildAt(i)
        if (node instanceof GameSprite) {
            collectSprites(node, sprites)
        }
    }
    sprites.push(sprite)

    GameBase
}

const GCMain = {
    onClientWorldInit() {
        os.setCursor("url(./asset/image/picture/control/cursor.png), auto")
        GameUI.show(1)

        GlobalData.restore()

        // 当显示 FPS 开关打开时，显示 FPS
        let showFPS = false
        os.add_ENTERFRAME(() => {
            if (GCMain.variables.显示FPS && !showFPS) {
                os.showFPS()
                showFPS = true
            } else if (!GCMain.variables.显示FPS && showFPS) {
                os.hideFPS()
                showFPS = false
            }
            if (colidDetector) {
                colidDetector.physicsEngine.enabled = !Game.pause
                colidDetector.physicsRunner.enabled = !Game.pause
            }
        }, null)

        SinglePlayerGame.regSaveCustomGlobalData("GLOBAL_DATA", Callback.New(() => new GlobalData, this))
    },
    // 各种游戏变量
    variables: new GameVariables(),
    guis: {
        get 游戏中(): GUI_2 {
            return GameUI.get(2) as GUI_2
        },
        get 主界面(): GUI_1 {
            return GameUI.get(1) as GUI_1
        }
    }
}

EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, GCMain.onClientWorldInit, null)
