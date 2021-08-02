/**
 * Created by LemonNekoGC on 2021-07-27 01:35:21.
 * 柠喵自己糊的一个数学类
 */
const NekoMath = {
    // 返回以 center 坐标为中心，半径是 size，边数为 sides 的正多边形各点的坐标
    polygonCordinates(center: Cordinate, size: number, sides: number): Cordinate[] {
        const cors: Cordinate[] = []
        for (let i = 0; i < sides; i ++) {
            cors.push({
                x: center.x + size * Math.cos(2 * Math.PI * i / sides),
                y: center.y + size * Math.sin(2 * Math.PI * i / sides)
            })
        }
        return cors
    },
    // 获取两点间的距离
    distance(cor1: Cordinate, cor2: Cordinate): number {
        const x = cor1.x - cor2.x
        const y = cor1.y - cor2.y

        return Math.sqrt(x * x + y * y)
    }
}

class Cordinate {
    x: number
    y: number
}