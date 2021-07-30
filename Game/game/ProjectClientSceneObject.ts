/**
 * Created by LemonNekoGC on 2021-07-26 23:01:03.
 */
class ProjectClientSceneObject extends ClientSceneObject_2 {
    scene: ClientScene
    size: number
    level: number
    stopDetectColision: boolean = false
    speed: Cordinate = {
        x: 0,
        y: 0
    }
    // 是否碰撞过容器底部
    colidedOther: boolean = false

    /**
     * 合并了！
     * 事件：猫咪合并成更大的猫咪了
     */
    static EVENT_MERGED: string = "merged"

    constructor(soData: SceneObject, scene: ClientScene, level: number, fromMerge: boolean) {
        super(soData, scene);

        this.size = level * 32
        this.level = level
        this.scale = level * 32 / 64

        if (!fromMerge) {
            this.x = 600
            this.y = 200 + 32 * level

            // 注册鼠标拖动事件
            this.on(EventObject.DRAG_MOVE, this, this.onDragMove)
            this.on(EventObject.DRAG_END, this, this.onDragEnd)
        } else {
            colidDetector.add(this)
        }
    }

    /**
     * 返回是否与容器左侧碰撞
     */
    get isColidContainerLeft(): boolean {
        return this.avatar.hitTestPoint(0, this.y - this.size / 2)
    }

    /**
     * 返回是否与容器右侧碰撞
     */
    get isColidContainerRight(): boolean {
        return this.avatar.hitTestPoint(Game.currentScene.width, this.y - this.size / 2)
    }

    /**
     * 返回是否与容器底部碰撞
     */
    get isColidContainerBottom(): boolean {
        return this.avatar.hitTestPoint(this.x, Game.currentScene.height)
    }

    // 获取模拟十二边形十二个点的坐标，用于碰撞检测
    get hexCordinate(): { x: number, y: number }[] {
        const center = {
            x: this.x,
            y: this.y - this.size
        }

        const vertex = NekoMath.polygonCordinates(center, this.size, 24)

        if (this.colidIndicator) {
            let i = 0
            for (let index in vertex) {
                const text: UIString = this.colidIndicator["碰撞位置" + (i + 1)]
                text.x = vertex[i].x - this.x
                text.y = vertex[i].y - this.y
                i++
            }
        }

        return vertex
    }

    /**
     * 当鼠标拖动时会调用的函数
     */
    onDragMove(params: Cordinate) {
        this.x = params.x
        this.y = 200 + this.size
    }

    /**
     * 当鼠标结束拖动时，加入碰撞检测列表
     */
    onDragEnd() {
        this.off(EventObject.DRAG_END, null, this.onDragEnd)
        this.off(EventObject.DRAG_MOVE, null, this.onDragMove)

        colidDetector.add(this)
    }
}