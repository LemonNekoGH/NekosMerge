var SceneEventListener = (function () {
    function SceneEventListener() {
        EventUtils.addEventListenerFunction(ClientScene, ClientScene.EVENT_IN_NEW_SCENE, this.onInNewScene, this, null, false);
    }
    SceneEventListener.prototype.onInNewScene = function (sceneModelId, state) {
        var _this = this;
        switch (state) {
            case 0:
                console.log("切换至场景 " + sceneModelId);
                break;
            case 1:
                console.log("开始了新的游戏");
                break;
            case 2:
                console.log("进行读档");
                break;
        }
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
            Game.player.sceneObject = playerObject;
            var cmdPage = Game.currentScene.customCommandPages[0];
            if (cmdPage.commands.length > 0) {
                var trigger = Game.player.sceneObject.getCommandTrigger(CommandTrigger.COMMAND_MAIN_TYPE_SCENE, 0, Game.currentScene, Game.player.sceneObject);
                cmdPage.startTriggerEvent(trigger);
            }
            scene.displayObject.on(EventObject.MOUSE_DOWN, _this, _this.onMouseDown, [scene]);
            scene.displayObject.on(EventObject.MOUSE_MOVE, _this, _this.onMouseMove, [scene]);
            scene.displayObject.on(EventObject.MOUSE_UP, _this, _this.onMouseEnd, [scene]);
            scene.on(ProjectClientSceneObject.EVENT_MERGED, _this, _this.nekoMerged);
        }, this));
    };
    SceneEventListener.prototype.onMouseDown = function (scene) {
        this.mouseDown = true;
    };
    SceneEventListener.prototype.onMouseMove = function (scene) {
        var _this = this;
        scene.sceneObjects.forEach(function (it) {
            var pos = scene.globalPos;
            if (_this.mouseDown) {
                it.event(EventObject.DRAG_MOVE, {
                    x: pos.x,
                    y: pos.y
                });
            }
        });
    };
    SceneEventListener.prototype.onMouseEnd = function (scene) {
        scene.sceneObjects.forEach(function (it) {
            it.event(EventObject.DRAG_END);
        });
        var _this = this;
        function newNeko() {
            var rand = MathUtils.rand(2);
            var nekoObj = Game.currentScene.addSceneObjectFromClone(2, rand, true);
            var obj = new ProjectClientSceneObject(nekoObj, Game.currentScene, rand + 1, false);
            console.log("from index " + rand + ", modelID: " + obj.modelID);
            _this.mouseDown = false;
        }
        setTimeout(newNeko, 1000);
    };
    SceneEventListener.prototype.nekoMerged = function (args) {
        var it = args.it, me = args.me;
        var upLevel = me.level + 1;
        var x = me.x;
        var y = me.y;
        it.avatar.dispose();
        me.avatar.dispose();
        it.dispose();
        me.dispose();
        var nekoObj = Game.currentScene.addSceneObjectFromClone(2, upLevel - 1, true);
        var obj = new ProjectClientSceneObject(nekoObj, Game.currentScene, upLevel, true);
        obj.x = x;
        obj.y = y;
        console.log("\u732B\u54AA\u5347\u7EA7\u4E86\uFF0C\u7B49\u7EA7 " + obj.level + "\uFF0C\u6A21\u578BID " + obj.modelID);
    };
    return SceneEventListener;
}());
//# sourceMappingURL=SceneEventListener.js.map