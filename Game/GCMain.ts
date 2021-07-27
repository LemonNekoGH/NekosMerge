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
    }
}

const squareRoot3 = Math.sqrt(3)

new GCMain()