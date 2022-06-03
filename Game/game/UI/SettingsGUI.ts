/**
 * Created by LemonNekoGC on 2022-06-04 00:39:20.
 */
class SettingsGUI extends GUI_3 {
    constructor(){
        super()

        this.确定按钮.btn.label = '保 存'
        this.确定按钮.btn.width = 500
        this.确定按钮.btn.on(EventObject.CLICK, this, () => {
            // 取消暂停游戏
            CommandExecute.pauseOrResumeGame(false)
            // 关闭界面
            this.dispose()
        })
    }
}