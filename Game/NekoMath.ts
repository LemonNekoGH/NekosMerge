/**
 * Created by LemonNekoGC on 2021-07-27 01:35:21.
 */
class NekoMath {
    static degressToRadians(degress: number): number {
        return degress * Math.PI / 180
    }

    static sin(degress: number): number {
        return Math.sin(this.degressToRadians(degress))
    }

    static cos(degress: number): number {
        return Math.cos(this.degressToRadians(degress))
    }

    static tan(degress: number): number {
        return Math.tan(this.degressToRadians(degress))
    }
}