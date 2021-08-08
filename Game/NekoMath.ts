/**
 * Created by LemonNekoGC on 2021-07-27 01:35:21.
 * 柠喵自己糊的一个数学类
 */
interface INekoMath {
    polygonCordinates(center: Point, size: number, sides: number): Point[]
    distance(cor1: Point, cor2: Point): number
    vectorAngleWithXAxis(vec: Point): number
    radian2Angle(radians: number): number
    vectorRotation(input: Point, degress: number): Point
    atan2(input: Point): number
    atan2(x: number, y: number): number
}

const NekoMath: INekoMath = {
    // 返回以 center 坐标为中心，半径是 size，边数为 sides 的正多边形各点的坐标
    polygonCordinates(center: Point, size: number, sides: number): Point[] {
        const cors: Point[] = []
        for (let i = 0; i < sides; i ++) {
            cors.push(new Point(center.x + size * Math.cos(2 * Math.PI * i / sides), center.y + size * Math.sin(2 * Math.PI * i / sides)))
        }
        return cors
    },
    // 获取两点间的距离
    distance(cor1: Point, cor2: Point): number {
        const x = cor1.x - cor2.x
        const y = cor1.y - cor2.y

        return Math.sqrt(x * x + y * y)
    },
    /**
     * 返回向量与 x 轴的夹角
     */
    vectorAngleWithXAxis(vec: Point): number {
        return this.radian2Angle(Math.atan2(vec.x, vec.y))
    },
    /**
     * 弧度转角度
     */
    radian2Angle(radians: number): number {
        return radians * 180 / Math.PI
    },
    /**
     * 返回旋转指定角度后的向量
     */
    vectorRotation(input: Point, degress: number): Point {
        const radians = MathUtils.angle2Radian(degress)
        const x = Math.cos(radians) * input.x + Math.sin(radians) * input.y
        const y = Math.cos(radians) * input.x - Math.sin(radians) * input.y
        return new Point(x, y)
    },
    /**
     * 返回向量相对于向量 (1, 0) 的夹角
     */
    atan2(x: Point | number, y?: number): number {
        let deg = 0
        if (x instanceof Point) {
            const p = x as Point
            const {x: px, y: py} = p
            deg = Math.atan2(py, px)
        } else {
            deg = Math.atan2(y, x)
        }
        const angle = NekoMath.radian2Angle(deg)
        if (angle < 0) {
            return 360 + angle
        }
        return angle
    }
}