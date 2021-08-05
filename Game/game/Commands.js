var CommandExecute;
(function (CommandExecute) {
    var started = false;
    function newNeko() {
        if (Game.pause) {
            setTimeout(newNeko, 1500);
            return;
        }
        var randLevel = 0;
        var topLevel = GCMain.variables.最高的猫咪等级;
        if (topLevel > 7) {
            randLevel = MathUtils.rand(4) + 1;
        }
        else if (topLevel >= 5) {
            randLevel = MathUtils.rand(topLevel - 3) + 1;
        }
        else {
            randLevel = MathUtils.rand(2) + 1;
        }
        var neko = new UINeko(randLevel, false);
        var uiRoot = GameUI.get(2);
        if (uiRoot) {
            uiRoot.getChildAt(0).addChild(neko);
        }
        GCMain.variables.等待下一个猫咪出现 = 0;
    }
    CommandExecute.newNeko = newNeko;
    function customCommand_1(commandPage, cmd, trigger, player, playerInput, p) {
        if (started)
            return;
        GameUI.dispose(1);
        GameUI.show(2);
        var topScore = SinglePlayerGame.getSaveCustomGlobalData("topScore");
        if (topScore) {
            GCMain.variables.最高分数 = topScore;
        }
        else {
            GCMain.variables.最高分数 = 0;
        }
        GCMain.variables.分数 = 0;
        new ProjectGUI2(GameUI.get(2));
        started = true;
    }
    CommandExecute.customCommand_1 = customCommand_1;
    function customCommand_2(commandPage, cmd, trigger, player, playerInput, p) {
        newNeko();
    }
    CommandExecute.customCommand_2 = customCommand_2;
    function customCommand_3(commandPage, cmd, trigger, player, playerInput, p) {
        if (!started)
            return;
        GameUI.dispose(2);
        SinglePlayerGame.regSaveCustomGlobalData("topScore", Callback.New(function () {
            var topScore = Game.player.variable.getVariable(2);
            console.log("准备退出游戏，正在保存最高分：" + topScore);
            return topScore;
        }, this));
        SinglePlayerGame.saveGlobalData(null);
        GameUI.show(1);
        started = false;
    }
    CommandExecute.customCommand_3 = customCommand_3;
    function customCommand_4(commandPage, cmd, trigger, player, playerInput, params) {
        GameUI.show(params.要显示的界面ID);
    }
    CommandExecute.customCommand_4 = customCommand_4;
    function customCommand_5(commandPage, cmd, trigger, player, playerInput, params) {
        GameUI.dispose(params.要关闭的界面ID);
    }
    CommandExecute.customCommand_5 = customCommand_5;
    function customCommand_6(commandPage, cmd, trigger, player, playerInput, params) {
        var shouldPause = params.是否暂停 === 1;
        if (shouldPause === Game.pause) {
            console.log("\u6E38\u620F" + (shouldPause ? '已经' : '没有') + "\u5904\u4E8E\u6682\u505C\u72B6\u6001");
            return;
        }
        Game.pause = shouldPause;
    }
    CommandExecute.customCommand_6 = customCommand_6;
    var globalData = {
        varType: 0,
        varIndex: 0
    };
    function customCommand_7(commandPage, cmd, trigger, player, playerInput, params) {
        var name = params.全局名称;
        var value = params.要设置的值;
        var varType = params.变量类型;
        var varIndex = params.开关编号 || params.变量编号 || params.字符串编号;
        console.log("varType " + varType + " varIndex " + varIndex);
        switch (varType) {
            case 0:
                Game.player.variable.setSwitch(varIndex, value);
                break;
            case 1:
                Game.player.variable.setVariable(varIndex, value);
                break;
            case 2:
                Game.player.variable.setString(varIndex, value + "");
                break;
        }
        function saveData() {
            switch (globalData.varType) {
                case 0: return Game.player.variable.getSwitch(globalData.varIndex);
                case 1: return Game.player.variable.getVariable(globalData.varIndex);
                case 2: return Game.player.variable.getString(globalData.varIndex);
            }
        }
        SinglePlayerGame.regSaveCustomGlobalData(name, Callback.New(saveData, this));
        globalData.varType = varType;
        globalData.varIndex = varIndex;
        SinglePlayerGame.saveGlobalData(Callback.New(function (success) {
            console.log(success ? '保存成功' : '保存失败');
            console.log(SinglePlayerGame.getSaveCustomGlobalData(name));
        }, this));
    }
    CommandExecute.customCommand_7 = customCommand_7;
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=Commands.js.map