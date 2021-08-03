var CommandExecute;
(function (CommandExecute) {
    var started = false;
    function newNeko() {
        var randLevel = MathUtils.rand(2) + 1;
        var neko = new UINeko(randLevel, false);
        var uiRoot = GameUI.get(2);
        if (uiRoot) {
            uiRoot.getChildAt(0).addChild(neko);
        }
    }
    CommandExecute.newNeko = newNeko;
    function customCommand_1(commandPage, cmd, trigger, player, playerInput, p) {
        if (started)
            return;
        GameUI.dispose(1);
        GameUI.show(2);
        var topScore = SinglePlayerGame.getSaveCustomGlobalData("topScore");
        if (topScore) {
            Game.player.variable.setVariable(2, topScore);
        }
        else {
            Game.player.variable.setVariable(2, 0);
        }
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
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=Commands.js.map