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
            uiRoot.getChildAt(0).addChild(neko)
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

        // 读取最高分数
        const topScore = SinglePlayerGame.getSaveCustomGlobalData("topScore")
        if (topScore) {
            GCMain.variables.最高分数 = topScore
        } else {
            GCMain.variables.最高分数 = 0
        }
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

    const globalData = {
        varType: 0,
        varIndex: 0
    }

    /**
     * 变量设值并存为全局变量
     * 变量类型： 
     * 0 - 开关
     * 1 - 数值
     * 2 - 字符串
     */
    export function customCommand_7(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, params: CustomCommandParams_7): void {
        const name = params.全局名称
        const value = params.要设置的值
        const varType = params.变量类型
        const varIndex = params.开关编号 || params.变量编号 || params.字符串编号
        console.log(`varType ${varType} varIndex ${varIndex}`)

        switch (varType) {
            case 0: Game.player.variable.setSwitch(varIndex, value); break
            case 1: Game.player.variable.setVariable(varIndex, value); break
            // TODO：此处需要修改为字符串
            case 2: Game.player.variable.setString(varIndex, value + ""); break
        }

        function saveData(): number | string {
            switch (globalData.varType) {
                case 0: return Game.player.variable.getSwitch(globalData.varIndex)
                case 1: return Game.player.variable.getVariable(globalData.varIndex)
                case 2: return Game.player.variable.getString(globalData.varIndex)
            }
        }

        SinglePlayerGame.regSaveCustomGlobalData(name, Callback.New(saveData, this))

        globalData.varType = varType
        globalData.varIndex = varIndex

        SinglePlayerGame.saveGlobalData(Callback.New((success) => {
            console.log(success ? '保存成功' : '保存失败')
            console.log(SinglePlayerGame.getSaveCustomGlobalData(name))
        }, this))
    }
}