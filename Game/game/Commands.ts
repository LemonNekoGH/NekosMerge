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

        new ProjectGUI2(GameUI.get(2) as GUI_2)

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
     * 关闭指定界面
     */
    export function customCommand_4(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_4) {
        GameUI.show(params.要显示的界面ID)
    }
    /**
     * 开启指定界面
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
}