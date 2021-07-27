module CommandExecute {
    var started = false;
    /**
     * 进入游戏
     */
    export function customCommand_1(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, p: CustomCommandParams_1) {
        if (started)
            return;
        GameUI.dispose(1);
        SinglePlayerGame.newGame();
        started = true;
    }
    export function customCommand_2(commandPage, cmd, trigger, player, playerInput, p) {
        var sceneAssetLoadCallback = Callback.New(function () {
            var nekoObj = Game.currentScene.addSceneObjectFromClone(2, 0, true);
            new ProjectClientSceneObject(nekoObj, Game.currentScene, 1, false);
        }, this);
        AssetManager.preLoadSceneAsset(2, sceneAssetLoadCallback);
    }
    export function customCommand_3(commandPage, cmd, trigger, player, playerInput, p) {
        Game.currentScene.dispose();
        GameUI.show(1);
        started = false;
    }
}