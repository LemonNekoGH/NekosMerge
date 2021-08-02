//------------------------------------------------------------------------------------------------------
// 入口
//------------------------------------------------------------------------------------------------------
// 新建全局变量Game，可用自定义子类继承GameBase
var Game = new GameBase();

class GCMain {
    constructor() {
        // 监听引擎初始化事件
        EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, this.onClientWorldInit, null)
    }

    // 显示 1 号界面
    onClientWorldInit() {
        GameUI.show(1)
        // 监听各种场景事件
        new SceneEventListener()
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