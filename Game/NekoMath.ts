/**
 * Created by LemonNekoGC on 2021-07-27 01:35:21.
 */
const NekoMath = {
    polygonCordinates(center: Cordinate, size: number, sides: number): Cordinate[] {
        const cors: Cordinate[] = []
        for (let i = 0; i < sides; i ++) {
            cors.push({
                x: center.x + size * Math.cos(2 * Math.PI * i / sides),
                y: center.y + size * Math.sin(2 * Math.PI * i / sides)
            })
        }
        return cors
    }
}

class Cordinate {
    x: number
    y: number
}