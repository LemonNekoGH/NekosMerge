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
            uiRoot.addChild(neko);
        }
        console.log(neko.id);
        GCMain.variables.等待下一个猫咪出现 = 0;
    }
    CommandExecute.newNeko = newNeko;
    function customCommand_1(commandPage, cmd, trigger, player, playerInput, p) {
        if (started)
            return;
        GameUI.dispose(1);
        GameUI.show(2);
        GCMain.variables.分数 = 0;
        new ProjectGUI2((GameUI.get(2)));
        colidDetector = new ColidDetector();
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
        GCMain.variables.游戏暂停 = shouldPause;
        Game.pause = shouldPause;
    }
    CommandExecute.customCommand_6 = customCommand_6;
    function customCommand_7(commandPage, cmd, trigger, player, playerInput, params) {
        GlobalData.store(function (params) {
            console.log(params);
        });
    }
    CommandExecute.customCommand_7 = customCommand_7;
    function customCommand_8(commandPage, cmd, trigger, player, playerInput, params) {
        GameConsole.restartGame();
    }
    CommandExecute.customCommand_8 = customCommand_8;
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=Commands.js.map