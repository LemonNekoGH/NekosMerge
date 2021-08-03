module CommandExecute {
    var started = false;

    export function newNeko() {
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
}