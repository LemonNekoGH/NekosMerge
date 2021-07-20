/**
 * Created by LemonNekoGC on 2021-07-19 17:49:08.
 */

class SceneEventListener {
    constructor() {
        // 监听场景进入事件
        EventUtils.addEventListenerFunction(ClientScene, ClientScene.EVENT_IN_NEW_SCENE, this.onInNewScene, this, null, false)
    }

    /**
     * 当场景进入时会被调用的方法
     * @param sceneModelId number 场景模型 ID
     * @param state number 
     * 0 - 场景切换 
     * 1 - 新游戏
     * 2 - 独挡
     */
    onInNewScene(sceneModelId: number, state: number) {
        // 如果目前存在场景就释放掉 
        if (Game.currentScene !== ClientScene.EMPTY) {
            Game.currentScene.dispose()
        }
        // 创建场景
        ClientScene.createScene(sceneModelId, null, Callback.New((scene: ClientScene) => {
            // 记录场景
            Game.currentScene = scene
            // 开始渲染
            Game.currentScene.startRender()
            // 加入显示列表
            Game.layer.sceneLayer.addChild(Game.currentScene.displayObject)
            // 获取编辑器中预设的场景对象（不包含出生点）
            scene.getPresetSceneObjectDatas().forEach((it: SceneObject) => {
                // 创建并安装场景对象
                if (it != null) {
                    scene.addSceneObjectFromClone(scene.id, it.modelID, true)
                }
            })
            // 创建玩家场景对象
            const playerObject = scene.addSceneObject(Game.player.data.sceneObject, false, true)
            // 让镜头锁定主角
            Game.currentScene.camera.sceneObject = playerObject
            // 记录玩家场景对象
            Game.player.sceneObject = playerObject
            // 如果没有读档，开始执行自定义命令
            const cmdPage = Game.currentScene.customCommandPages[0]
            if (cmdPage.commands.length > 0) {
                const trigger = Game.player.sceneObject.getCommandTrigger(CommandTrigger.COMMAND_MAIN_TYPE_SCENE, 0, Game.currentScene, Game.player.sceneObject)
                cmdPage.startTriggerEvent(trigger)
            }
        }, this))
    }
}