/**
 * Created by LemonNekoGC on 2021-07-26 23:01:03.
 */
class ProjectClientSceneObject extends ClientSceneObject_2 {
    scene: ClientScene
    size: number
    level: number
    stopDetectColision: boolean = false

    /**
     * 合并了！
     * 事件：猫咪合并成更大的猫咪了
     */
    static EVENT_MERGED: string = "merged"
    // 收到事件后停止检测碰撞
    static EVENT_STOP_DETECT_COLISION: string = "stopColision"

    constructor(soData: SceneObject, scene: ClientScene, level: number, fromMerge: boolean) {
        super(soData, scene);

        this.size = level * 32
        this.level = level
        this.scale = level * 32 / 64

        if (!fromMerge) {
            this.x = 600
            this.y = 232

            // 注册鼠标拖动事件
            this.on(EventObject.DRAG_MOVE, this, this.onDragMove)
            this.on(EventObject.DRAG_END, this, this.onDragEnd)
        } else {
            this.detectColision()
        }

        this.on(ProjectClientSceneObject.EVENT_STOP_DETECT_COLISION, this, () => {
            this.stopDetectColision = true
            console.log("收到事件，停止检测碰撞")
        })
    }

    // 获取模拟十二边形十二个点的坐标，用于碰撞检测
    get hexCordinate(): { x: number, y: number }[] {
        const ceki = this.size / 2 * squareRoot3
        const bfhl = squareRoot3 / this.size * 2

        const center = { x: this.x, y: this.y - this.size }
        const a = { x: center.x, y: center.y - this.size }
        const b = { x: center.x + this.size / 2, y: center.y - bfhl }
        const c = { x: center.x + ceki, y: center.y - this.size / 2 }
        const d = { x: center.x + this.size, y: this.y }
        const e = { x: center.x + ceki, y: center.y + this.size / 2 }
        const f = { x: center.x + this.size / 2, y: center.y + bfhl }
        const g = { x: center.x, y: center.y + this.size }
        const h = { x: center.x - this.size / 2, y: center.y + bfhl }
        const i = { x: center.x - ceki, y: center.y + this.size / 2 }
        const j = { x: center.x - this.size, y: center.y }
        const k = { x: center.x - ceki, y: center.y - this.size / 2 }
        const l = { x: center.x - this.size / 2, y: center.y - bfhl }

        return [a, b, c, d, e, f, j, h, i, j, k, l]
    }

    /**
     * 当鼠标拖动时会调用的函数
     */
    onDragMove(params: { x: number, y: number }) {
        this.x = params.x
        this.y = 232
    }

    /**
     * 当鼠标结束拖动时，下落并不再监听事件
     */
    onDragEnd() {
        this.off(EventObject.DRAG_END, null, this.onDragEnd)
        this.off(EventObject.DRAG_MOVE, null, this.onDragMove)

        this.detectColision()
    }

    // 碰撞检测和受重力掉落
    detectColision() {
        const container = {
            width: Game.currentScene.width,
            height: Game.currentScene.height
        }

        const _this = this

        let speed = 0.1

        function doDetect() {
            // 暂停检测时直接跳过
            if (_this.stopDetectColision) {
                setTimeout(doDetect, 100 / 6)
                return
            }
            // 掉落
            if (_this.y <= (container.height)) {
                _this.y += speed
                speed += 0.2
                // console.log(`y: ${sceneObject.y} speed: ${speed}`)
            } else {
                speed = 0
            }
            // 检测碰撞
            // 先过滤掉不用检测的对象
            // 检测对象不能是自己和界面
            // 也不能是最新生成的猫咪
            const sceneObjects = Game.currentScene.sceneObjects.filter(it => it && !it.isDisposed && it.modelID != 1 && it.index != _this.index && it.index !== Game.currentScene.sceneObjects.length - 1)
            sceneObjects.forEach(it => {
                if (it && it.modelID != 1 && it.index !== _this.index && it.index !== Game.currentScene.sceneObjects.length - 1) {
                    let index = 0
                    let colided = false
                    _this.hexCordinate.forEach(cor => {
                        if (!colided) {
                            index++
                            if (it.avatar.hitTestPoint(cor.x, cor.y)) {
                                colided = true
                            }
                        }
                    })
                    // 如果碰撞了
                    if (colided) {
                        console.log(`撞上了，我（index: ${_this.index}，modelId: ${_this.modelID}），它（index: ${it.index}, modelId: ${it.modelID}）`)
                        // 而且模型 ID 相同，变成更大的猫咪
                        if (it.modelID === _this.modelID) {
                            // 停止检测碰撞
                            _this.stopDetectColision = true
                            it.event(ProjectClientSceneObject.EVENT_STOP_DETECT_COLISION)
                            // 派发事件给场景
                            Game.currentScene.event(ProjectClientSceneObject.EVENT_MERGED, {
                                me: _this,
                                it
                            })
                        } else {
                            // 而且是左边被撞了
                            if (index < 12 && index > 6 && _this.x < container.width - _this.size) {
                                // 向右移动
                                _this.x += 3
                                // 右边被撞了
                            } else if (index > 0 && index < 6 && _this.x > 0) {
                                // 向左移动
                                _this.x -= 3
                            } else {
                                // 顶部或底部被撞，随机选个方向
                                if (Math.random() > 0.5) {
                                    _this.x += 16
                                } else {
                                    _this.x -= 16
                                }
                            }
                        }
                    }
                }
            })
            setTimeout(doDetect, 100 / 6)
        }

        doDetect()
    }
}