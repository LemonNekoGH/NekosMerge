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
        var sceneAssetLoadCallback = Callback.New(function () {
            var nekoObj = Game.currentScene.addSceneObjectFromClone(2, 0, true);
            new ProjectClientSceneObject(nekoObj, Game.currentScene, 1, false);
        }, this);
        AssetManager.preLoadSceneAsset(2, sceneAssetLoadCallback);
    }
    CommandExecute.customCommand_2 = customCommand_2;
    function customCommand_3(commandPage, cmd, trigger, player, playerInput, p) {
        Game.currentScene.dispose();
        GameUI.show(1);
        started = false;
    }
    CommandExecute.customCommand_3 = customCommand_3;
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=Commands.js.map