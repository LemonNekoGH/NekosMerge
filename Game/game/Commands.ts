module CommandExecute {
    var started = false;

    export function newNeko() {
        if (Game.pause) {
            setTimeout(newNeko, 1500)
            return
        }
        // 随机出现的猫咪会随着合成出的最高等级猫咪变化
        let randLevel = 0
        const topLevel = GCMain.variables.最高的猫咪等级
        if (topLevel > 7) {
            randLevel = MathUtils.rand(4) + 1
        } else if (topLevel >= 5) {
            randLevel = MathUtils.rand(topLevel - 3) + 1
        } else {
            randLevel = MathUtils.rand(2) + 1
        }

        const neko = new UINeko(randLevel, false)
        const uiRoot = GameUI.get(2)
        if (uiRoot) {
            uiRoot.addChild(neko)
        }
        console.log(neko.id)

        GCMain.variables.等待下一个猫咪出现 = 0
    }

    /**
     * 进入游戏
     */
    export function customCommand_1(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, p: CustomCommandParams_1) {
        if (started)
            return;
        GameUI.dispose(1);
        GameUI.show(2)

        // 重置分数
        GCMain.variables.分数 = 0

        new ProjectGUI2((GameUI.get(2) as GUI_2))
        colidDetector = new ColidDetector()

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
    /**
     * 开启指定界面
     */
    export function customCommand_4(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_4) {
        const id = params.要显示的界面ID
        GameUI.show(id)
    }
    /**
     * 关闭指定界面
     */
    export function customCommand_5(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_5) {
        GameUI.dispose(params.要关闭的界面ID)
    }

    /**
     * 暂停或继续游戏
     * @params params 指令参数
     */
    export function customCommand_6(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_6): void {
        const shouldPause = params.是否暂停 === 1

        if (shouldPause === Game.pause) {
            console.log(`游戏${shouldPause ? '已经' : '没有'}处于暂停状态`)
            return
        }

        GCMain.variables.游戏暂停 = shouldPause
        Game.pause = shouldPause
    }

    /**
     * 手动保存全局变量
     */
    export function customCommand_7(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_7): void {
        GlobalData.store((params) => {
            console.log(params)
        })
    }

    /**
     * 重开游戏
     */
    export function customCommand_8(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_8): void {
        GameConsole.restartGame()
    }

    /**
     * 使指定界面组件发生透明度变化
     */
    export function customCommand_9(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_9): void {
        GameConsole.changeOpacity(
            params.选择组件,
            params.组件名称,
            params.透明度调整至,
            params.变化时长
        )
    }

    /**
     * 显示一个确认对话框
     */
    export function customCommand_10(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_10): void {
        let gui9 = GameUI.get(9) as GUI_9
        // 如果界面正在显示，不进行任何操作
        if (gui9) {
            return
        }
        // 如果没有在显示，进行显示
        GameUI.show(9)
        gui9 = GameUI.get(9) as GUI_9
        // 设置文本
        gui9.对话框文本.text = params.提示信息
        gui9.确定按钮.label = params.确认按钮文本
        gui9.取消按钮.label = params.取消按钮文本
        // 设置事件
        gui9.确定按钮.on(EventObject.CLICK, this, (eventSegment) => {
            CommandPage.startTriggerFragmentEvent(eventSegment, Game.player.sceneObject, Game.player.sceneObject)
        }, [params.当确认时执行])
        gui9.取消按钮.on(EventObject.CLICK, this, (eventSegment) => {
            CommandPage.startTriggerFragmentEvent(eventSegment, Game.player.sceneObject, Game.player.sceneObject)
        }, [params.当取消时执行])
    }
}