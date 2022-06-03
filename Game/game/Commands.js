var CommandExecute;
(function (CommandExecute) {
    CommandExecute.started = false;
    function newNeko() {
        if (Game.pause) {
            console.log('游戏暂停中，稍后添加新的猫咪');
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
    function enterGame() {
        if (CommandExecute.started)
            return;
        GameUI.dispose(1);
        GameUI.show(2);
        GCMain.variables.分数 = 0;
        GCMain.variables.分数作废 = false;
        colidDetector = new ColidDetector();
        newNeko();
        CommandExecute.started = true;
    }
    CommandExecute.enterGame = enterGame;
    function customCommand_1(commandPage, cmd, trigger, player, playerInput, p) {
        enterGame();
    }
    CommandExecute.customCommand_1 = customCommand_1;
    function customCommand_2(commandPage, cmd, trigger, player, playerInput, p) {
        newNeko();
    }
    CommandExecute.customCommand_2 = customCommand_2;
    function exitGame() {
        if (!CommandExecute.started)
            return;
        GameUI.dispose(2);
        GameUI.show(1);
        CommandExecute.started = false;
    }
    CommandExecute.exitGame = exitGame;
    function customCommand_3(commandPage, cmd, trigger, player, playerInput, p) {
        exitGame();
    }
    CommandExecute.customCommand_3 = customCommand_3;
    function customCommand_4(commandPage, cmd, trigger, player, playerInput, params) {
        var id = params.要显示的界面ID;
        GameUI.show(id);
    }
    CommandExecute.customCommand_4 = customCommand_4;
    function customCommand_5(commandPage, cmd, trigger, player, playerInput, params) {
        GameUI.dispose(params.要关闭的界面ID);
    }
    CommandExecute.customCommand_5 = customCommand_5;
    function pauseOrResumeGame(pause) {
        if (pause === Game.pause) {
            console.log("\u6E38\u620F" + (pause ? '已经' : '没有') + "\u5904\u4E8E\u6682\u505C\u72B6\u6001");
            return;
        }
        GCMain.variables.游戏暂停 = pause;
        Game.pause = pause;
    }
    CommandExecute.pauseOrResumeGame = pauseOrResumeGame;
    function customCommand_6(commandPage, cmd, trigger, player, playerInput, params) {
        var shouldPause = params.是否暂停 === 1;
        pauseOrResumeGame(shouldPause);
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
    function customCommand_9(commandPage, cmd, trigger, player, playerInput, params) {
        GameConsole.changeOpacity(params.选择组件, params.组件名称, params.透明度调整至, params.变化时长);
    }
    CommandExecute.customCommand_9 = customCommand_9;
    function customCommand_10(commandPage, cmd, trigger, player, playerInput, params) {
    }
    CommandExecute.customCommand_10 = customCommand_10;
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=Commands.js.map