/**
 * Created by LemonNekoGC on 2021-08-03 14:04:54.
 */
class ProjectGUI2 {
    gui: GUI_2
    constructor(gui: GUI_2) {
        this.gui = gui

        const root2 = gui.背景
        root2.on(EventObject.MOUSE_DOWN, this, onMouseDown)
        root2.on(EventObject.MOUSE_MOVE, this, onMouseMove)
        root2.on(EventObject.MOUSE_UP, this, onMouseUp)
        root2.on(EventObject.CLICK, this, onClick)
        root2.on(UINeko.EVENT_MERGED, this, onNekoMerge)

        let mouseDown = false

        function onMouseDown() {
            mouseDown = true
        }

        function onMouseMove() {
            // 鼠标是按下的，给各子组件派发鼠标拖动事件
            if (mouseDown) {
                for (let i = 0; i < root2.numChildren; i++) {
                    const child = root2.getChildAt(i)
                    child.event(EventObject.DRAG_MOVE, new Point(gui.mouseX, gui.mouseY))
                }
            }
        }

        function onMouseUp() {
            // 鼠标是按下的，给各子组件派发结束拖动事件
            if (mouseDown) {
                for (let i = 0; i < root2.numChildren; i++) {
                    const child = root2.getChildAt(i)
                    child.event(EventObject.DRAG_END, new Point(gui.mouseX, gui.mouseY))
                }
                mouseDown = false
                setTimeout(CommandExecute.newNeko, 1500)
            }
        }

        function onClick() {
            for (let i = 0; i < root2.numChildren; i++) {
                const child = root2.getChildAt(i)
                child.event(EventObject.DRAG_END, new Point(gui.mouseX, gui.mouseY))
            }
        }

        function onNekoMerge(data: { me: UINeko, it: UINeko }) {
            const {it, me} = data

            // 升级
            const upLevel = me.level + 1

            const x = me.x
            const y = me.y

            // 销毁掉这些猫咪
            it.dispose()
            me.dispose()

            // 生成一只新的猫咪
            const nekoObj = new UINeko(upLevel, true)
            GameUI.get(2).getChildAt(0).addChild(nekoObj)
            nekoObj.x = x
            nekoObj.y = y - nekoObj.size

            // 加分
            let score = Game.player.variable.getVariable(1)
            score += upLevel
            Game.player.variable.setVariable(1, score)

            // 如果超过了最高分，把最高分设置成当前分数
            let bestScore = Game.player.variable.getVariable(2)
            if (bestScore < score) {
                bestScore = score
                Game.player.variable.setVariable(2, bestScore)
            }

            console.log(`猫咪升级了，等级 ${nekoObj.level}`)
        }
    }
}