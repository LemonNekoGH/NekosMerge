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

    fromMerge: boolean

    private _size: number

    // 猫咪合并事件
    static EVENT_MERGED = "neko_merged"
    // 猫咪飞出容器事件
    static EVENT_OUT_OF_CONTAINER = "neko_out_of_container"
    // 猫咪回到容器事件
    static EVENT_BACK_IN_TO_CONTAINER = "neko_back_in_to_container"

    constructor(level: number, fromMerge: boolean, x: number = 0, y: number = 0) {
        super()

        this.level = level

        this._size = WorldData.等级1的猫咪大小 * Math.pow(WorldData.猫咪大小倍率, this.level) / 2
        this.width = this._size * 2
        this.height = this.width

        this.fromMerge = fromMerge

        if (fromMerge) {
            this.x = x
            this.y = y
            colidDetector.add(this)
        } else {
            this.x = 592 - this.size
            this.y = WorldData.新猫咪初始位置 - this.size
            this.on(EventObject.DRAG_MOVE, this, this.onDrag)
            this.on(EventObject.DRAG_END, this, this.onDragEnd)
            this.on(EventObject.CLICK, this, this.onClick)
        }

        this.image = `asset/image/avatar/NekoHead${this.level}.png`

        onUiComponentInit(false, this)
    }

    dispose() {
        colidDetector.remove(this)
        super.dispose()
    }

    // 猫咪半径
    get size(): number {
        return this._size
    }

    // 返回全局坐标
    get posObj(): Point {
        return new Point(this.x, this.y)
    }

    // 返回中心的坐标
    get centerPos(): Point {
        return new Point(this.posObj.x + this.size, this.posObj.y + this.size)
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
        this.shouldNotDragOutOfContainer(params)
        this.y = WorldData.新猫咪初始位置 - this.size
        console.log(this.id)
    }

    /**
     * 猫咪不能被拖出容器
     */
    shouldNotDragOutOfContainer(params: Point) {
        const pX = params.x
        const minX = WorldData.猫咪容器左上角x值
        const maxX = WorldData.猫咪容器右上角x值

        if (pX - this.size < minX) {
            this.x = minX
        } else if (pX + this.size > maxX) {
            this.x = maxX - this.size * 2
        } else {
            this.x = pX - this.size
        }
    }

    /**
     * 结束拖动时调用
     */
    onDragEnd(params: Point) {
        this.shouldNotDragOutOfContainer(params)

        this.y = WorldData.新猫咪初始位置 - this.size
        this.off(EventObject.DRAG_MOVE, this, this.onDrag)
        this.off(EventObject.DRAG_END, this, this.onDragEnd)
        this.off(EventObject.CLICK, this, this.onClick)
        this.fromMerge = true

        colidDetector.add(this)

        console.log(this.id)
    }

    /**
     * 界面被点击时调用
     */
    onClick(params: Point) {
        this.onDragEnd(params)
    }
}