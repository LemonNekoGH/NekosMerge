/**
 * Created by LemonNekoGC on 2022-06-04 00:53:02.
 */
class InputNameGUI extends GUI_8 {
    constructor() {
        super()

        this.确定按钮.btn.label = '决定了'
        this.确定按钮.btn.width = 235
        this.确定按钮.btn.on(EventObject.CLICK, this, () => {
            // 设置名字
            // TODO: 当没有设置名字的时候，用”匿名用户#数字”的形式设置名字
            // TODO: 当设置了名字的时候，用”名字#数字”的形式设置名字
            GCMain.variables.玩家名称 = this.可输入文本.text
            // 开始游戏
            CommandExecute.enterGame()
            this.dispose()
        })

        this.取消按钮.btn.label = '算了'
        this.取消按钮.btn.width = 235
        this.取消按钮.btn.on(EventObject.CLICK, this, () => {
            this.dispose()
        })

        // 把容器的缩放设置到 0
        this.容器.scaleX = 0
        this.容器.scaleY = 0
        this.容器.pivotX = this.容器.width / 2
        this.容器.pivotY = this.容器.height / 2
        this.容器.x += this.容器.pivotX
        this.容器.y += this.容器.pivotY
        this.once(EventObject.DISPLAY, this, () => {
            gsap.to(this.容器, {
                scaleX: 1,
                scaleY: 1,
                duration: 0.5,
                ease: 'power4'
            })
        })
    }

    // 当销毁时，播放退出动画
    dispose() {
        gsap.to(this.容器, {
            scaleX: 0,
            scaleY: 0,
            duration: 0.25,
            ease: Power4.easeIn,
            onComplete: () => {
                super.dispose()
            }
        })
    }
}