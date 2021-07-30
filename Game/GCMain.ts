//------------------------------------------------------------------------------------------------------
// 入口
//------------------------------------------------------------------------------------------------------
// 新建全局变量Game，可用自定义子类继承GameBase
var Game = new GameBase();

class GCMain {
    constructor() {
        // 监听引擎初始化事件
        EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, this.onClientWorldInit, null)
        // 监听各种场景事件
        new SceneEventListener()
    }

    // 显示 1 号界面
    onClientWorldInit() {
        GameUI.show(1)
        // os.showFPS();
        os.add_ENTERFRAME(() => {
            if (Game.currentScene !== ClientScene.EMPTY) {
                const sprites: GameSprite[] = []
                collectSprites(Game.currentScene.displayObject, sprites)
                console.log(sprites.length)
                if (sprites.length > 200) {
                    debugger
                    console.log(sprites)
                }
            }
        }, Game)
    }
}

// 收集所有精灵信息
function collectSprites(sprite: GameSprite, sprites: GameSprite[]) {
    for (let i = 0; i < sprite.numChildren; i++) {
        const node = sprite.getChildAt(i)
        if (node instanceof GameSprite) {
            collectSprites(node, sprites)
        }
    }
    sprites.push(sprite)
}

new GCMain()