module CommandExecute {
    var started = false;

    function newNeko() {
        const randLevel = MathUtils.rand(2) + 1
        const neko = new UINeko(randLevel, false)
        const uiRoot = GameUI.get(2)
        if (uiRoot) {
            uiRoot.getChildAt(0).addChild(neko)
        }
    }

    /**
     * 进入游戏
     */
    export function customCommand_1(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, p: CustomCommandParams_1) {
        if (started)
            return;
        GameUI.dispose(1);
        GameUI.show(2)

        // 读取最高分数
        const topScore = SinglePlayerGame.getSaveCustomGlobalData("topScore")
        if (topScore) {
            Game.player.variable.setVariable(2, topScore)
        } else {
            Game.player.variable.setVariable(2, 0)
        }

        // 注册各种事件
        const ui2 = GameUI.get(2)
        const root2 = ui2.getChildAt(0)
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
                    child.event(EventObject.DRAG_MOVE, new Point(ui2.mouseX, ui2.mouseY))
                }
            }
        }

        function onMouseUp() {
            // 鼠标是按下的，给各子组件派发结束拖动事件
            if (mouseDown) {
                for (let i = 0; i < root2.numChildren; i++) {
                    const child = root2.getChildAt(i)
                    child.event(EventObject.DRAG_END, new Point(ui2.mouseX, ui2.mouseY))
                }
                mouseDown = false
                setTimeout(newNeko, 1500)
            }
        }

        function onClick() {
            for (let i = 0; i < root2.numChildren; i++) {
                const child = root2.getChildAt(i)
                child.event(EventObject.DRAG_END, new Point(ui2.mouseX, ui2.mouseY))
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

        started = true;
    }
    /**
     * 随机生成一只猫咪
     */
    export function customCommand_2(commandPage: CommandPage, cmd, trigger, player, playerInput, p) {
        newNeko()
    }
    /**
     * 退出游戏
     */
    export function customCommand_3(commandPage, cmd, trigger, player, playerInput, p) {
        if (!started) return
        GameUI.dispose(2)

        // 保存最高分数
        SinglePlayerGame.regSaveCustomGlobalData("topScore", Callback.New(() => {
            const topScore = Game.player.variable.getVariable(2)
            console.log("准备退出游戏，正在保存最高分：" + topScore)
            return topScore
        }, this))
        SinglePlayerGame.saveGlobalData(null)
        
        GameUI.show(1);

        started = false;
    }
}