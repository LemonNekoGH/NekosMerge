/**
 * Created by LemonNekoGC on 2021-08-03 14:04:54.
 */
class ProjectGUI2 {
    static EVENT_GAME_OVER = "event_game_over"
    static EVENT_GAME_RESTART = "event_game_restart"

    constructor(gui: GUI_2) {
        const containerRect = new Rectangle(WorldData.猫咪容器左上角x值, 0, 490, 704)

        GameUI.get(2).on(EventObject.MOUSE_DOWN, this, onMouseDown)
        GameUI.get(2).on(EventObject.MOUSE_MOVE, this, onMouseMove)
        GameUI.get(2).on(EventObject.MOUSE_UP, this, onMouseUp)
        GameUI.get(2).on(UINeko.EVENT_MERGED, this, onNekoMerge)
        GameUI.get(2).on(UINeko.EVENT_OUT_OF_CONTAINER, this, onNekoOutOfContainer)
        GameUI.get(2).on(UINeko.EVENT_BACK_IN_TO_CONTAINER, this, onNekoBackIntoContainer)
        GameUI.get(2).on(ProjectGUI2.EVENT_GAME_OVER, this, onGameOver)
        GameUI.get(2).on(ProjectGUI2.EVENT_GAME_RESTART, this, onRestart)

        let mouseDown = false
        let mouseMoved = false

        let gameOverCount = 0

        /**
         * 获取最新的猫咪
         */
        function getNewestNeko(): UINeko {
            for (let i = 0; i < gui.numChildren; i++) {
                const child = GameUI.get(2).getChildAt(i)
                if (child instanceof UINeko) {
                    const neko = child as UINeko
                    if (!neko.fromMerge) {
                        return neko
                    }
                }
            }
            return undefined
        }

        /**
         * 当猫咪飞出容器时调用
         */
        function onNekoOutOfContainer() {
            console.log("猫咪飞出了容器" + gameOverCount)
            gameOverCount++
            if (gameOverCount > 0) {
                GameOverProgressBar.show(3)
            }
        }

        /**
         * 当猫咪回到容器中时调用
         */
        function onNekoBackIntoContainer() {
            console.log("猫咪回到了容器" + gameOverCount)
            gameOverCount--
            if (gameOverCount <= 0) {
                GameOverProgressBar.destroy()
            }
        }

        /**
         * 当鼠标按下时调用
         */
        function onMouseDown() {
            // 鼠标是按下的，给各子组件派发鼠标拖动事件
            // 暂停时不派发事件
            if (Game.pause) {
                return
            }
            // 如果鼠标不在容器内，不处理
            if (containerRect.contains(gui.mouseX, gui.mouseY)) {
                mouseDown = true
            }
        }

        /**
         * 当鼠标移动时调用
         */
        function onMouseMove() {
            // 暂停时不派发事件
            if (Game.pause) {
                return
            }
            // 如果鼠标不在容器内，不处理
            if (!containerRect.contains(gui.mouseX, gui.mouseY)) {
                return
            }
            // 如果鼠标没有在按下，不处理
            if (!mouseDown) {
                return
            }
            mouseMoved = true

            let newestNeko: UINeko = getNewestNeko()
            if (newestNeko) {
                newestNeko.event(EventObject.DRAG_MOVE, new Point(gui.mouseX, gui.mouseY))
            }
        }

        function onMouseUp() {
            // 暂停时不派发事件
            if (Game.pause) {
                return
            }
            if (!mouseDown) {
                return
            }

            let newestNeko: UINeko = getNewestNeko()
            if (!newestNeko) {
                return
            }

            console.log('鼠标弹起：' + newestNeko.id)

            if (mouseMoved) {
                newestNeko.event(EventObject.DRAG_END, new Point(gui.mouseX, gui.mouseY))
            } else {
                newestNeko.event(EventObject.CLICK, new Point(gui.mouseX, gui.mouseY))
            }

            if (GCMain.variables.等待下一个猫咪出现 === 1) {
                mouseDown = false
                mouseMoved = false
                return
            }
            setTimeout(CommandExecute.newNeko, 1500)
            GCMain.variables.等待下一个猫咪出现 = 1
            mouseDown = false
            mouseMoved = false
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
            if (GCMain.variables.最高分数 < GCMain.variables.分数 && !GCMain.variables.分数作废) {
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

        /**
         * 当游戏结束时调用
         */
        function onGameOver() {
            GameUI.show(6)
            GCMain.variables.游戏暂停 = true
            Game.pause = true
            // 如果没有名称，或者检测到作弊，不更新排行榜
            if (GCMain.variables.玩家名称 === "" || GCMain.variables.分数作废) return
            CommandExecute.doRecord(GCMain.variables.玩家名称, GCMain.variables.分数, 0)
        }

        /**
         * 当游戏重开时使用
         */
        function onRestart() {
            gameOverCount = 0
        }
    }
}