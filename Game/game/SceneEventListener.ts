/**
 * Created by LemonNekoGC on 2021-07-19 17:49:08.
 */

class SceneEventListener {
    mouseDown: boolean

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
     * 2 - 读档了
     */
    onInNewScene(sceneModelId: number, state: number) {
        // 测试时使用
        switch (state) {
            case 0: console.log("切换至场景 " + sceneModelId); break;
            case 1: console.log("开始了新的游戏"); break;
            case 2: console.log("进行读档"); break;
        }

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
            // 记录玩家场景对象
            Game.player.sceneObject = playerObject
            // 如果没有读档，开始执行自定义命令
            const cmdPage = Game.currentScene.customCommandPages[0]
            if (cmdPage.commands.length > 0) {
                const trigger = Game.player.sceneObject.getCommandTrigger(CommandTrigger.COMMAND_MAIN_TYPE_SCENE, 0, Game.currentScene, Game.player.sceneObject)
                cmdPage.startTriggerEvent(trigger)
            }
            // 注册场景鼠标按下，移动，松开事件
            scene.displayObject.on(EventObject.MOUSE_DOWN, this, this.onMouseDown, [scene])
            scene.displayObject.on(EventObject.MOUSE_MOVE, this, this.onMouseMove, [scene])
            scene.displayObject.on(EventObject.MOUSE_UP, this, this.onMouseEnd, [scene])

            scene.on(ProjectClientSceneObject.EVENT_MERGED, this, this.nekoMerged)
        }, this))
    }

    /**
     * 当鼠标按下
     */
    onMouseDown(scene: ClientScene) {
        this.mouseDown = true
    }

    /**
     * 当场景正在拖动时
     */
    onMouseMove(scene: ClientScene) {
        scene.sceneObjects.forEach((it: ClientSceneObject) => {
            const pos = scene.globalPos
            if (this.mouseDown) {
                it.event(EventObject.DRAG_MOVE, {
                    x: pos.x,
                    y: pos.y
                })
            }
        })
    }

    /**
     * 当场景结束拖动时
     */
    onMouseEnd(scene: ClientScene) {
        scene.sceneObjects.forEach((it: ClientSceneObject) => {
            // 触发拖动结束事件
            it.event(EventObject.DRAG_END)
        })

        const _this = this
        function newNeko() {
            // 生成一只新的猫咪
            const rand = MathUtils.rand(2)

            // 把辅助场景中的猫咪复制到场景中
            const nekoObj = Game.currentScene.addSceneObjectFromClone(2, rand, true)
            const obj = new ProjectClientSceneObject(nekoObj, Game.currentScene, rand + 1, false)

            console.log(`from index ${rand}, modelID: ${obj.modelID}`)
            _this.mouseDown = false
        }

        setTimeout(newNeko, 1000)
    }

    /**
     * 猫咪合并了，该删掉两只小猫咪然后在原来的位置生成大猫咪了
     */
    nekoMerged(args: { it: ClientSceneObject, me: ProjectClientSceneObject }) {
        const {it, me} = args

        // 升级
        const upLevel = me.level + 1

        const x = me.x
        const y = me.y

        // 销毁掉这些猫咪
        it.root.dispose()
        me.root.dispose()

        it.dispose()
        me.dispose()

        // 生成一只新的猫咪
        const nekoObj = Game.currentScene.addSceneObjectFromClone(2, upLevel - 1, true)
        const obj = new ProjectClientSceneObject(nekoObj, Game.currentScene, upLevel, true)
        obj.x = x
        obj.y = y

        console.log(`猫咪升级了，等级 ${obj.level}，模型ID ${obj.modelID}`)
    }
}