var SceneEventListener = (function () {
    function SceneEventListener() {
        EventUtils.addEventListenerFunction(ClientScene, ClientScene.EVENT_IN_NEW_SCENE, this.onInNewScene, this, null, false);
    }
    SceneEventListener.prototype.onInNewScene = function (sceneModelId, state) {
        if (Game.currentScene !== ClientScene.EMPTY) {
            Game.currentScene.dispose();
        }
        ClientScene.createScene(sceneModelId, null, Callback.New(function (scene) {
            Game.currentScene = scene;
            Game.currentScene.startRender();
            Game.layer.sceneLayer.addChild(Game.currentScene.displayObject);
            scene.getPresetSceneObjectDatas().forEach(function (it) {
                if (it != null) {
                    scene.addSceneObjectFromClone(scene.id, it.modelID, true);
                }
            });
            var playerObject = scene.addSceneObject(Game.player.data.sceneObject, false, true);
            Game.currentScene.camera.sceneObject = playerObject;
            Game.player.sceneObject = playerObject;
            var cmdPage = Game.currentScene.customCommandPages[0];
            if (cmdPage.commands.length > 0) {
                var trigger = Game.player.sceneObject.getCommandTrigger(CommandTrigger.COMMAND_MAIN_TYPE_SCENE, 0, Game.currentScene, Game.player.sceneObject);
                cmdPage.startTriggerEvent(trigger);
            }
        }, this));
    };
    return SceneEventListener;
}());
//# sourceMappingURL=SceneEventListener.js.map