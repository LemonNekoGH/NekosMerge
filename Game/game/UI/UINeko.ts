/**
 * Created by LemonNekoGC on 2021-08-02 10:28:06.
 * 自定义组件：猫咪图片，基于图片 UIBitmap
 */
class UINeko extends UIBitmap {
    level: number
    speed: Cordinate

    static EVENT_MERGED = "neko_merged"

    constructor(level: number, fromMerge: boolean) {
        super()

        this.level = level
        this.speed = { x: 0, y: 0 }

        this.width = this.size * 2
        this.height = this.size * 2

        if (fromMerge) {
            colidDetector.add(this)
        } else {
            this.x = 592 - this.size
            this.y = 200 - this.size
            this.on(EventObject.DRAG_MOVE, this, this.onDrag)
            this.on(EventObject.DRAG_END, this, this.onDragEnd)
        }

        this.image = `asset/image/avatar/NekoHead${this.level}.png`
    }

    // 猫咪半径
    get size(): number {
        return this.level * level1Size
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
    get polygon12Cors(): Cordinate[] {
        return NekoMath.polygonCordinates({
            x: this.centerPos.x,
            y: this.centerPos.y
        }, this.size, 24)
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

    hitTestPoint(cor: Cordinate): boolean
    hitTestPoint(x: number, y: number): boolean

    /**
     * 返回给定的点是否在碰撞范围内
     */
    hitTestPoint(x: number | Cordinate, y?: number): boolean {
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