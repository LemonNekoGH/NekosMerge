/**
 * Created by LemonNekoGC on 2021-08-03 14:04:54.
 */
class ProjectGUI2 {
    gui: GUI_2
    constructor(gui: GUI_2) {
        this.gui = gui

        GameUI.get(2).on(EventObject.MOUSE_DOWN, this, onMouseDown)
        GameUI.get(2).on(EventObject.MOUSE_MOVE, this, onMouseMove)
        GameUI.get(2).on(EventObject.MOUSE_UP, this, onMouseUp)
        GameUI.get(2).on(UINeko.EVENT_MERGED, this, onNekoMerge)
        GameUI.get(2).on(UINeko.EVENT_OUT_OF_CONTAINER, this, onNekoOutOfContainer)
        GameUI.get(2).on(UINeko.EVENT_BACK_IN_TO_CONTAINER, this, onNekoBackIntoContainer)

        let mouseDown = false
        let mouseMoved = false
        let outOfContainerCount = 0
        let countDownText0 = 3
        let countDownText: UIString = undefined

        /**
         * 当猫咪飞出容器时调用
         */
        function onNekoOutOfContainer() {
            // 计数器 +1
            outOfContainerCount++
            // 开始计时
            if (!countDownText) {
                countDownText = new UIString()
                this.gui.addChild(countDownText)

                countDownText.font = "幼圆"
                countDownText.fontSize = 20
                countDownText.color = "#000000"
                countDownText.text = "" + countDownText0
                countDownText.x = 0
                countDownText.y = 190

                setTimeout(countDown, 1000)
            }
        }

        /**
         * 游戏结束倒计时
         */
        function countDown() {
            if (countDownText) {
                countDownText0--
                countDownText.text = "" + countDownText0
                setTimeout(countDown, 1000)
            } else {
                countDownText0 = 3
            }
        }

        /**
         * 当猫咪回到容器中时调用
         */
        function onNekoBackIntoContainer() {
            // 计数器 -1
            outOfContainerCount--
            // 如果计数器为 0 ，重置计时器
            if (outOfContainerCount === 0) {
                countDownText.dispose()
                countDownText = undefined
            }
        }

        function onMouseDown() {
            mouseDown = true
        }

        function onMouseMove() {
            if (mouseDown) {
                mouseMoved = true
            }
            // 鼠标是按下的，给各子组件派发鼠标拖动事件
            // 暂停时不派发事件
            if (Game.pause) {
                return
            }
            if (gui.mouseX < WorldData.猫咪容器右上角x值 && gui.mouseX > WorldData.猫咪容器左上角x值) {
                if (mouseDown) {
                    for (let i = 0; i < this.gui.numChildren; i++) {
                        const child = GameUI.get(2).getChildAt(i)
                        child.event(EventObject.DRAG_MOVE, new Point(gui.mouseX, gui.mouseY))
                    }
                }
            }
        }

        function onMouseUp() {
            // 鼠标是按下的，给各子组件派发结束拖动事件
            // 暂停时不派发事件
            if (Game.pause) {
                return
            }
            if (!mouseDown) {
                return
            }
            console.log(mouseMoved)
            // 当鼠标弹起时，如果移动过，判断为拖拽结尾
            // 没有移动过，判断为点击
            if (gui.mouseX < WorldData.猫咪容器右上角x值 && gui.mouseX > WorldData.猫咪容器左上角x值) {
                if (mouseMoved) {
                    for (let i = 0; i < this.gui.numChildren; i++) {
                        const child = this.gui.getChildAt(i)
                        child.event(EventObject.DRAG_END, new Point(gui.mouseX, gui.mouseY))
                    }
                } else {
                    onClick(this)
                }
                if (GCMain.variables.等待下一个猫咪出现 === 1) {
                    return
                }
                setTimeout(CommandExecute.newNeko, 1500)
                GCMain.variables.等待下一个猫咪出现 = 1
            }
            mouseDown = false
            mouseMoved = false
        }

        function onClick(self: ProjectGUI2) {
            // 暂停时不派发事件
            if (Game.pause) {
                return
            }
            for (let i = 0; i < self.gui.numChildren; i++) {
                const child = self.gui.getChildAt(i)
                if (!(child instanceof UINeko)) {
                    continue
                }
                child.event(EventObject.CLICK, new Point(gui.mouseX, gui.mouseY))
            }
        }

        function onNekoMerge(data: { me: UINeko, it: UINeko }) {
            const {it, me} = data

            // 升级
            const upLevel = me.level + 1

            const x = me.x
            const y = me.y

            console.log(x, y)

            // 销毁掉这些猫咪
            it.dispose()
            me.dispose()

            // 生成一只新的猫咪
            const nekoObj = new UINeko(upLevel, true, x, y)
            GameUI.get(2).addChild(nekoObj)

            // 加分
            GCMain.variables.分数 += upLevel

            // 如果超过了最高分，把最高分设置成当前分数
            if (GCMain.variables.最高分数 < GCMain.variables.分数) {
                GCMain.variables.最高分数 = GCMain.variables.分数
                GlobalData.store((params) => {
                    console.log("存档成功？ " + params)
                })
            }

            // 更新最高猫咪等级
            if (GCMain.variables.最高的猫咪等级 < upLevel) {
                GCMain.variables.最高的猫咪等级 = upLevel
            }
        }
    }
}