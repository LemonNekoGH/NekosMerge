/**
 * Created by LemonNekoGC on 2022-06-03 20:58:35.
 */
class NekoButton extends GUI_1001 {
    constructor() {
        super()
        // 设置鼠标移入效果
        this.on(EventObject.MOUSE_OVER, this, () => {
            this.moveText(3)
            this.changeCursor(3)
        })
        // 设置鼠标移出效果
        this.on(EventObject.MOUSE_OUT, this, () => {
            this.moveText(2)
            this.changeCursor(2)
        })
        // 设置鼠标按下效果
        this.on(EventObject.MOUSE_DOWN, this, () => {
            this.moveText(1)
            this.changeCursor(1)
        })
    }

    // 修改文字的位置，让按钮看上去真的按下去了
    // --- 1 鼠标按下
    // --- 2 鼠标抬起
    // --- 3 鼠标悬浮
    private moveText = (state: number) => {
        switch (state) {
            case 1:
                this.btn.textDy = 5
                break
            case 2:
                this.btn.textDy = -5
                break
            case 3:
                this.btn.textDy = 0
                break
            default:
                this.btn.textDy = 0
                break
        }
    }

    /**
     * 自定义鼠标样式
     * state
     * --- 1 鼠标按下
     * --- 2 鼠标抬起
     * --- 3 鼠标悬浮
     */
    private changeCursor = (state: number): void => {
        switch (state) {
            case 1:
                os.setCursor('url("./asset/image/picture/control/cursor-down.png"), auto')
                break
            case 2:
                os.setCursor('url("./asset/image/picture/control/cursor.png"), auto')
                break
            case 3:
                os.setCursor('url("./asset/image/picture/control/cursor-over.png"), auto')
                break
            default:
                os.setCursor('url("./asset/image/picture/control/cursor.png"), auto')
                break
        }
    }
}