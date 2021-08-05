/**
 * Created by LemonNekoGC on 2021-08-05 23:04:41.
 * 全局数据接口
 */
interface IGlobalData {
    topScore: number
    devMode: boolean
    showFPS: boolean
}
/**
 * 全局数据类。
 * 包含存取数据的方法。
 */
class GlobalData implements IGlobalData {
    topScore: number
    devMode: boolean
    showFPS: boolean

    /**
     * 构造方法，如果传入了参数会用参数的值进行构建
     */
    constructor() {
        this.topScore = GCMain.variables.最高分数
        this.devMode = GCMain.variables.开发者模式
        this.showFPS = GCMain.variables.显示FPS
    }

    /**
     * 保存到存档
     */
    static store(callback: (any) => void) {
        SinglePlayerGame.saveGlobalData(Callback.New(callback, this))
    }

    /**
     * 从存档恢复
     */
    static restore() {
        const dataAny = SinglePlayerGame.getSaveCustomGlobalData("GLOBAL_DATA")
        if (!dataAny) {
            return
        }
        const data = dataAny as IGlobalData
        GCMain.variables.最高分数 = data.topScore
        GCMain.variables.开发者模式 = data.devMode
        GCMain.variables.显示FPS = data.showFPS
    }
}