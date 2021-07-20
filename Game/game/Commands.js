var CommandExecute;
(function (CommandExecute) {
    var started = false;
    function customCommand_1(commandPage, cmd, trigger, player, playerInput, p) {
        if (started)
            return;
        GameUI.dispose(1);
        SinglePlayerGame.newGame();
        started = true;
    }
    CommandExecute.customCommand_1 = customCommand_1;
    function customCommand_2(commandPage, cmd, trigger, player, playerInput, p) {
    }
    CommandExecute.customCommand_2 = customCommand_2;
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=Commands.js.map