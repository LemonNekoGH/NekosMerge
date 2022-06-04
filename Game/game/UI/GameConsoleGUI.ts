/**
 * Created by LemonNekoGC on 2021-08-19 09:45:31.
 */
class GameConsoleGUI extends GUI_7 {
    private static lastCmd: string[] = []
    private static cmdPtr: number = undefined

    constructor() {
        super()

        this.执行按钮.on(EventObject.CLICK, this, this.executeCmd)
        this.返回按钮.on(EventObject.CLICK, this, this.dispose)
        this.指令输入.on(EventObject.ENTER, this, this.executeCmd)
        this.指令输入.on(EventObject.KEY_UP, this, this.onInputKeyUp)
        // 将滚动条移到最底
        const scrollbar: any = this.输出框容器.getChildAt(1)
        const textHeight = GameConsoleGUI.outputLinesCount() * 25
        this.输出文本.height = textHeight > 600 ? textHeight : 600
        this.输出框容器.refresh()
        Callback.New((s) => s.slider.value = 100, this).delayRun(100, null, [scrollbar])
        // 显示入场动画
        console.log(this.height)
        this.y = -this.对话框遮罩.height
        this.on(EventObject.DISPLAY, this, () => gsap.to(this, {
            y: 0,
            duration: 0.5,
            ease: Power4.easeOut,
            onComplete: () => console.log('Console animation done.')
        }))
    }

    /**
     * 将滚动条拉到最底
     */
    static scrollDown() {
        const scrollbar: any = (GameUI.get(7) as GUI_7).输出框容器.getChildAt(1)
        scrollbar.slider.value = 100
    }

    /**
     * 获取控制台输出框总行数
     */
    static outputLinesCount(): number {
        return GCMain.variables.控制台文本.split('\n').length
    }

    /**
     * 控制台语句执行方法
     */
    executeCmd() {
        if (this.指令输入.text === "") {
            GameConsole.log("没有输入指令，不懂怎么执行")
            return
        }
        const index = this.指令输入.text.indexOf("(")
        const funName = this.指令输入.text.substring(0, index).trim()

        GameConsoleGUI.lastCmd.push(this.指令输入.text)
        GameConsoleGUI.cmdPtr = undefined

        if (this.指令输入.text === "+1s") {
            GameConsole.log("不要老想搞个大新闻")
            this.指令输入.text = ""
            return
        } else if (!GameConsole[funName]) {
            GameConsole.log("不认识这个指令，你可以用 listCommand() 指令列出所有可用指令")
            this.指令输入.text = ""
            return
        }
        const f = new Function("GameConsole." + this.指令输入.text)
        try {
            f.apply(null)
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.log(f)
            }
        }
        this.指令输入.text = ""
    }

    /**
     * 当指令输入框接收到键盘弹起事件时调用
     */
    onInputKeyUp(p: any) {
        switch (p.keyCode) {
            case 38:
                this.inputLastCmd()
                break
            case 40:
                this.inputNewestCmd()
                break
        }
    }

    /**
     * 当键盘上键弹起时，显示上一个执行过的指令
     */
    inputLastCmd() {
        if (GameConsoleGUI.cmdPtr === undefined) {
            GameConsoleGUI.cmdPtr = GameConsoleGUI.lastCmd.length - 1
        } else if (GameConsoleGUI.cmdPtr >= 0) {
            GameConsoleGUI.cmdPtr--
        }
        const cmd = GameConsoleGUI.lastCmd[GameConsoleGUI.cmdPtr]
        if (cmd) this.指令输入.text = cmd
    }

    /**
     * 当键盘下键弹起时，显示下一个执行过的指令
     */
    inputNewestCmd() {
        if (GameConsoleGUI.cmdPtr === undefined) {
            GameConsoleGUI.cmdPtr = GameConsoleGUI.lastCmd.length - 1
        } else if (GameConsoleGUI.cmdPtr < GameConsoleGUI.lastCmd.length) {
            GameConsoleGUI.cmdPtr++
        }
        const cmd = GameConsoleGUI.lastCmd[GameConsoleGUI.cmdPtr]
        if (cmd) this.指令输入.text = cmd
    }

    // 当销毁时，播放退出动画
    dispose() {
        gsap.to(this, {
            y: -this.对话框遮罩.height,
            duration: 0.25,
            ease: Power4.easeIn,
            onComplete: () => {
                super.dispose()
            }
        })
    }
}