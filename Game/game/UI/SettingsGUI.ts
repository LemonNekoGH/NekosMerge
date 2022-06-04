/**
 * Created by LemonNekoGC on 2022-06-04 00:39:20.
 */
class SettingsGUI extends GUI_3 {
    constructor() {
        super()

        this.确定按钮.btn.label = '保 存'
        this.确定按钮.btn.width = 500
        this.确定按钮.btn.on(EventObject.CLICK, this, () => {
            // 取消暂停游戏
            CommandExecute.pauseOrResumeGame(false)
            // 关闭界面
            this.dispose()
        })

        // 当开始显示时，播放进入动画
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