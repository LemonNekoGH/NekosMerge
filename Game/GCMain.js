var Game = new GameBase();
function collectSprites(sprite, sprites) {
    for (var i = 0; i < sprite.numChildren; i++) {
        var node = sprite.getChildAt(i);
        if (node instanceof GameSprite) {
            collectSprites(node, sprites);
        }
    }
    sprites.push(sprite);
    GameBase;
}
var GCMain = {
    onClientWorldInit: function () {
        os.setCursor("url(./asset/image/picture/control/cursor.png), auto");
        GameUI.show(1);
        GlobalData.restore();
        var showFPS = false;
        os.add_ENTERFRAME(function () {
            if (GCMain.variables.显示FPS && !showFPS) {
                os.showFPS();
                showFPS = true;
            }
            else if (!GCMain.variables.显示FPS && showFPS) {
                os.hideFPS();
                showFPS = false;
            }
            if (colidDetector) {
                colidDetector.physicsEngine.enabled = !Game.pause;
                colidDetector.physicsRunner.enabled = !Game.pause;
            }
        }, null);
        SinglePlayerGame.regSaveCustomGlobalData("GLOBAL_DATA", Callback.New(function () { return new GlobalData; }, this));
    },
    variables: new GameVariables(),
    guis: {
        get 游戏中() {
            return GameUI.get(2);
        },
        get 主界面() {
            return GameUI.get(1);
        }
    }
};
EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, GCMain.onClientWorldInit, null);
//# sourceMappingURL=GCMain.js.map