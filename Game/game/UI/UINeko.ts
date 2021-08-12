/**
 * Created by LemonNekoGC on 2021-08-02 10:28:06.
 * 自定义组件：猫咪图片，基于图片 UIBitmap
 */
class UINeko extends UIBitmap {
    level: number
    /**
     * 绑定到猫咪身上的 Box2D 刚体
     */
    body: b2Body

    // 猫咪合并事件
    static EVENT_MERGED = "neko_merged"
    // 猫咪飞出容器事件
    static EVENT_OUT_OF_CONTAINER = "neko_out_of_container"
    // 猫咪回到容器事件
    static EVENT_BACK_IN_TO_CONTAINER = "neko_back_in_to_container"

    constructor(level: number, fromMerge: boolean, x: number = 0, y: number = 0) {
        super()

        this.level = level

        this.width = level1Size * Math.pow(sizecoefficient, level)
        this.height = this.width

        if (fromMerge) {
            this.x = x
            this.y = y
            colidDetector.add(this)
        } else {
            this.x = 592 - this.size
            this.y = 200 - this.size
            this.on(EventObject.DRAG_MOVE, this, this.onDrag)
            this.on(EventObject.DRAG_END, this, this.onDragEnd)
        }

        this.image = `asset/image/avatar/NekoHead${this.level}.png`
    }

    dispose() {
        colidDetector.remove(this)
        super.dispose()
    }

    // 猫咪半径
    get size(): number {
        return level1Size * Math.pow(sizecoefficient, this.level) / 2
    }

    // 返回全局坐标
    get posObj(): Point {
        return new Point(this.x, this.y)
    }

    // 返回中心的坐标
    get centerPos(): Point {
        return new Point(this.posObj.x + this.size, this.posObj.y + this.size)
    }

    // 返回 24 边形的坐标
    get polygon24Cors(): Point[] {
        return NekoMath.polygonCordinates(this.centerPos, this.size, 24)
    }

    // 是否与容器左侧碰撞
    get isColidContainerLeft(): boolean {
        return this.centerPos.distance(0, this.centerPos.y) <= this.size
    }

    // 是否与容器右侧碰撞
    get isColidContainerRight(): boolean {
        return this.centerPos.distance(1184, this.centerPos.y) <= this.size
    }

    // 是否与容器底部碰撞
    get isColidContainerBottom(): boolean {
        return this.centerPos.distance(this.centerPos.x, 704) <= this.size
    }

    /**
     * 是否飞出容器
     * 因为猫咪弹力十足，所以只有猫咪的中心点出容器了才算
     */
    get isOutOfContainer(): boolean {
        return this.centerPos.y <= 200
    }

    hitTestPoint(cor: Point): boolean
    hitTestPoint(x: number, y: number): boolean

    /**
     * 返回给定的点是否在碰撞范围内
     */
    hitTestPoint(x: number | Point, y?: number): boolean {
        let localX = 0
        let localY = 0

        if (typeof x === 'number') {
            localX = x
            localY = y
        } else {
            localX = x.x
            localY = x.y
        }

        return this.centerPos.distance(localX, localY) <= this.size
    }

    /**
     * 当拖动时调用
     */
    onDrag(params: Point) {
        if (params.x - this.size < 0) {
            this.x = 0
        } else if (params.x + 2 * this.size > 1184) {
            this.x = 1184 - 2 * this.size
        } {
            this.x = params.x - this.size
        }
        this.y = 200 - this.size
    }

    /**
     * 结束拖动时调用
     */
    onDragEnd(params: Point) {
        if (params.x - this.size < 0) {
            this.x = 0
        } else {
            this.x = params.x - this.size
        }
        this.x = params.x - this.size
        this.y = 200 - this.size
        this.off(EventObject.DRAG_MOVE, this, this.onDrag)
        this.off(EventObject.DRAG_END, this, this.onDragEnd)

        colidDetector.add(this)
    }
}

// 猫咪等级越高，猫咪越大
// 猫咪大小计算方式为：猫咪等级 * 1级猫咪大小
const level1Size = 32