/**
 * Created by LemonNekoGC on 2022-06-04 02:59:46.
 */
class DialogGUI extends GUI_11 {
    constructor() {
        super()
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
                duration: 1,
                ease: 'power4'
            })
        })
    }

    // 当销毁时，播放退出动画
    dispose() {
        gsap.to(this.容器, {
            scaleX: 0,
            scaleY: 0,
            duration: 0.5,
            ease: Power4.easeIn,
            onComplete: () => {
                super.dispose()
            }
        })
    }
}