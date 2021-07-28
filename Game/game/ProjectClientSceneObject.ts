/**
 * Created by LemonNekoGC on 2021-07-26 23:01:03.
 */
class ProjectClientSceneObject extends ClientSceneObject_2 {
    scene: ClientScene
    size: number
    level: number
    stopDetectColision: boolean = false
    speed: number = 0.2

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
            this.y = 200 + 32 * level

            // 注册鼠标拖动事件
            this.on(EventObject.DRAG_MOVE, this, this.onDragMove)
            this.on(EventObject.DRAG_END, this, this.onDragEnd)
        } else {
            colidDetector.add(this)
        }

        this.on(ProjectClientSceneObject.EVENT_STOP_DETECT_COLISION, this, () => {
            this.stopDetectColision = true
            console.log("收到事件，停止检测碰撞")
        })
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
        const ceki = NekoMath["ceki" + this.size]
        const ceki_2 = NekoMath["ceki" + this.size / 2]
        const bfhl = NekoMath["bfhl" + this.size]
        const bfhl_2 = NekoMath["bfhl" + this.size / 2]

        const center = { x: this.x, y: this.y - this.size }
        const a = { x: center.x, y: center.y - this.size }
        const aa = { x: center.x, y: center.y - this.size / 2 }
        const b = { x: center.x + this.size / 2, y: center.y - bfhl }
        const bb = { x: center.x + this.size / 4, y: center.y - bfhl_2 }
        const c = { x: center.x + ceki, y: center.y - this.size / 2 }
        const cc = { x: center.x + ceki_2, y: center.y - this.size / 4 }
        const d = { x: center.x + this.size, y: this.y }
        const dd = { x: center.x + this.size / 2, y: this.y }
        const e = { x: center.x + ceki, y: center.y + this.size / 2 }
        const ee = { x: center.x + ceki_2, y: center.y + this.size / 4 }
        const f = { x: center.x + this.size / 2, y: center.y + bfhl }
        const ff = { x: center.x + this.size / 4, y: center.y + bfhl_2 }
        const g = { x: center.x, y: center.y + this.size }
        const gg = { x: center.x, y: center.y + this.size / 2 }
        const h = { x: center.x - this.size / 2, y: center.y + bfhl }
        const hh = { x: center.x - this.size / 4, y: center.y + bfhl_2 }
        const i = { x: center.x - ceki, y: center.y + this.size / 2 }
        const ii = { x: center.x - ceki_2, y: center.y + this.size / 4 }
        const j = { x: center.x - this.size, y: center.y }
        const jj = { x: center.x - this.size / 2, y: center.y }
        const k = { x: center.x - ceki, y: center.y - this.size / 2 }
        const kk = { x: center.x - ceki_2, y: center.y - this.size / 4 }
        const l = { x: center.x - this.size / 2, y: center.y - bfhl }
        const ll = { x: center.x - this.size / 4, y: center.y - bfhl_2 }

        return [a,aa, b, bb, c, cc, d, dd, e, ee, f, ff, g, gg, h, hh, i, ii, j, jj, k, kk, l, ll]
    }

    /**
     * 当鼠标拖动时会调用的函数
     */
    onDragMove(params: { x: number, y: number }) {
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