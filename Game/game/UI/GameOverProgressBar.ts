/**
 * Created by LemonNekoGC on 2021-08-16 11:29:49.
 * 游戏结束倒计时条
 */
class GameOverProgressBar extends UIBitmap {
    // 进度条应当是一个单例
    static INSTANCE: GameOverProgressBar = undefined
    // 进度条取消标记
    canceled: boolean = false
    private _time: number
    private _decreasePerFrame: number

    /**
     * 构造函数
     * @params time 时间：以秒为单位
     */
    constructor(time: number) {
        super()
        this.image = "asset/image/picture/control/GameOverProgressBar.png"
        this._time = time
        this.width = WorldData.猫咪容器右上角x值 - WorldData.猫咪容器左上角x值
        this.height = 5
        this._decreasePerFrame = this.width / time  / 60
        this.x = WorldData.猫咪容器左上角x值
        this.y = 0
        GameUI.get(2).addChild(this)
    }

    get time(): number {
        return this._time
    }

    get decreasePerFrame(): number {
        return this._decreasePerFrame
    }

    /**
     * 显示此进度条
     * 在进度条没有结束时再次调用无效
     * @params time 持续时间：以秒为单位
     */
    static show(time: number) {
        let i = GameOverProgressBar.INSTANCE
        if (i) {
            return
        }

        i = GameOverProgressBar.INSTANCE = new GameOverProgressBar(time)

        function decreaseProgressBar() {
            i = GameOverProgressBar.INSTANCE
            if (i && !i.canceled && i.width > 0) {
                i.width -= i.decreasePerFrame
                setTimeout(decreaseProgressBar, 100 / 6)
            }
            /**
             * 倒计时结束，发送游戏结束事件
             */
            if (i && i.width <= 0 && !i.canceled) {
                GameUI.get(2).event(GamingPageGUI.EVENT_GAME_OVER)
                GameOverProgressBar.INSTANCE.dispose()
                GameOverProgressBar.INSTANCE = undefined
            }
        }

        decreaseProgressBar()
    }

    /**
     * 销毁此进度条
     * 在进度条没有开始时调用无效
     */
    static destroy() {
        if (!GameOverProgressBar.INSTANCE) {
            return
        }
        GameOverProgressBar.INSTANCE.dispose()
        GameOverProgressBar.INSTANCE = undefined
    }
}