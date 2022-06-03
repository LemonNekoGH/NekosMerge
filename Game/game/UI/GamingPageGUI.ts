/**
 * Created by LemonNekoGC on 2022-06-03 22:32:37.
 */
class GamingPageGUI extends GUI_2 {
    static EVENT_GAME_OVER = "event_game_over"
    static EVENT_GAME_RESTART = "event_game_restart"

    constructor() {
        super()

        // 继续游戏
        CommandExecute.pauseOrResumeGame(false)
        // 重置最高猫咪等级
        GCMain.variables.最高的猫咪等级 = 1

        this.终端按钮.btn.label = ">_  终端"
        this.终端按钮.btn.width = 132
        this.终端按钮.btn.on(EventObject.CLICK, this, () => {
            // 打开终端界面
            GameUI.show(7)
        })

        this.暂停按钮.btn.label = "暂 停"
        this.暂停按钮.btn.width = 132
        this.暂停按钮.btn.on(EventObject.CLICK, this, () => {
            // 暂停游戏，并显示暂停框
            CommandExecute.pauseOrResumeGame(true)
            CommandExecute.showMessageBox({
                text: '猫咪摸鱼中...',
                confirmBtnOpt: {
                    width: 500,
                    text: '继续',
                    onClick: Callback.New(() => CommandExecute.pauseOrResumeGame(false), this),
                    clickToCloseMessageBox: true
                }
            })
        })

        this.重开按钮.btn.label = "重 开"
        this.重开按钮.btn.width = 132
        this.重开按钮.btn.on(EventObject.CLICK, this, () => {
            // 暂停游戏，并显示提示框
            CommandExecute.pauseOrResumeGame(true)
            CommandExecute.showMessageBox({
                text: '确定要重开游戏吗？猫咪们会想你的。\n你的分数不会被记录到排行榜',
                confirmBtnOpt: {
                    width: 240,
                    text: '是的',
                    onClick: Callback.New(() => {
                        GCMain.variables.游戏暂停 = false
                        GameConsole.restartGame()
                    }, this),
                    clickToCloseMessageBox: true
                },
                cancelBtnOpt: {
                    width: 240,
                    text: '算了',
                    onClick: Callback.New(() => CommandExecute.pauseOrResumeGame(false), this),
                    clickToCloseMessageBox: true
                }
            })
        })

        this.退出按钮.btn.label = "退 出"
        this.退出按钮.btn.width = 132
        this.退出按钮.btn.on(EventObject.CLICK, this, () => {
            // 暂停游戏，并显示提示框
            CommandExecute.pauseOrResumeGame(true)
            CommandExecute.showMessageBox({
                text: '要撤了吗？你的分数已经保存好了',
                confirmBtnOpt: {
                    width: 240,
                    text: '是的',
                    onClick: Callback.New(() => {
                        CommandExecute.exitGame()
                    }, this),
                    clickToCloseMessageBox: true
                },
                cancelBtnOpt: {
                    width: 240,
                    text: '算了',
                    onClick: Callback.New(() => CommandExecute.pauseOrResumeGame(false), this),
                    clickToCloseMessageBox: true
                }
            })
        })

        this.设置按钮.btn.label = "设 置"
        this.设置按钮.btn.width = 132
        this.设置按钮.btn.on(EventObject.CLICK, this, () => {
            // 暂停游戏，并显示设置界面
            CommandExecute.pauseOrResumeGame(true)
            GameUI.show(3)
        })

        const containerRect = new Rectangle(WorldData.猫咪容器左上角x值, 0, 490, 704)

        this.on(EventObject.MOUSE_DOWN, this, onMouseDown)
        this.on(EventObject.MOUSE_MOVE, this, onMouseMove)
        this.on(EventObject.MOUSE_UP, this, onMouseUp)
        this.on(UINeko.EVENT_MERGED, this, onNekoMerge)
        this.on(UINeko.EVENT_OUT_OF_CONTAINER, this, onNekoOutOfContainer)
        this.on(UINeko.EVENT_BACK_IN_TO_CONTAINER, this, onNekoBackIntoContainer)
        this.on(GamingPageGUI.EVENT_GAME_OVER, this, onGameOver)
        this.on(GamingPageGUI.EVENT_GAME_RESTART, this, onRestart)
        let mouseDown = false
        let mouseMoved = false
        let gameOverCount = 0

        /**
         * 获取最新的猫咪
         */
        function getNewestNeko(): UINeko {
            console.log(`尝试获取最新出现的猫咪，界面中有 ${GameUI.get(2).numChildren} 个子元素`)
            for (let i = 0; i < GameUI.get(2).numChildren; i++) {
                const child = GameUI.get(2).getChildAt(i)
                // console.log(`尝试获取最新出现的猫咪，正在查询第 ${i} 个子元素`)
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
            console.log('鼠标按下')
            // 如果鼠标不在容器内，不处理
            if (containerRect.contains(this.mouseX, this.mouseY)) {
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
            if (!containerRect.contains(this.mouseX, this.mouseY)) {
                return
            }
            // 如果鼠标没有在按下，不处理
            if (!mouseDown) {
                return
            }
            mouseMoved = true
            console.log('鼠标按下并移动')
            let newestNeko: UINeko = getNewestNeko()
            if (newestNeko) {
                newestNeko.event(EventObject.DRAG_MOVE, new Point(this.mouseX, this.mouseY))
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
            mouseDown = false
            let newestNeko: UINeko = getNewestNeko()
            if (!newestNeko) {
                console.log('鼠标抬起，但是没有获取到猫咪')
                return
            }

            console.log('鼠标弹起：' + newestNeko.id)

            if (mouseMoved) {
                newestNeko.event(EventObject.DRAG_END, new Point(this.mouseX, this.mouseY))
            } else {
                newestNeko.event(EventObject.CLICK, new Point(this.mouseX, this.mouseY))
            }

            if (GCMain.variables.等待下一个猫咪出现 === 1) {
                mouseDown = false
                mouseMoved = false
                return
            }
            setTimeout(CommandExecute.newNeko, 1500)
            GCMain.variables.等待下一个猫咪出现 = 1
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
            CommandExecute.pauseOrResumeGame(true)
            // 如果没有名称，或者检测到作弊，不更新排行榜
            if (GCMain.variables.玩家名称 !== "" && !GCMain.variables.分数作废) {
                CommandExecute.doRecord(encodeURIComponent(GCMain.variables.玩家名称), GCMain.variables.分数, 0)
            }
            CommandExecute.showMessageBox({
                text: '猫咪溢出来啦！',
                confirmBtnOpt: {
                    text: '重开',
                    width: 240,
                    clickToCloseMessageBox: true,
                    onClick: Callback.New(() => {
                        GameConsole.restartGame()
                        CommandExecute.pauseOrResumeGame(false)
                    }, this)
                },
                cancelBtnOpt: {
                    text: '退出',
                    width: 240,
                    clickToCloseMessageBox: true,
                    onClick: Callback.New(() => {
                        GameUI.show(1)
                        GameUI.dispose(2)
                        // 重置游戏状态
                        CommandExecute.started = false
                    }, this)
                }
            })
        }

        /**
         * 当游戏重开时使用
         */
        function onRestart() {
            gameOverCount = 0
        }
    }
}