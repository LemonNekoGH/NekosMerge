/**
 * Created by LemonNekoGC on 2022-06-03 21:36:28.
 */
class StartPageGUI extends GUI_1 {
    constructor() {
        super()
        // 设置鼠标样式
        os.setCursor('url("./asset/image/picture/control/cursor.png"), auto')
        // 设置按钮文本
        this.开始按钮.btn.label = '开 始'
        this.排行榜按钮.btn.label = '排 行 榜'
        this.设置按钮.btn.label = '设 置'
        // 设置按钮监听事件
        this.开始按钮.btn.on(EventObject.CLICK, this, () => GameUI.show(8))
        this.设置按钮.btn.on(EventObject.CLICK, this, () => GameUI.show(3))
        this.排行榜按钮.btn.on(EventObject.CLICK, this, () => GameUI.show(15001))
    }
}