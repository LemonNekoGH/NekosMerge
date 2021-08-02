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
        GameUI.show(1);
        started = false;
    }
}