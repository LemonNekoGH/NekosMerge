var Game = new GameBase();
var GCMain = (function () {
    function GCMain() {
        EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, this.onClientWorldInit, null);
        new SceneEventListener();
    }
    GCMain.prototype.onClientWorldInit = function () {
        GameUI.show(1);
        os.showFPS();
    };
    return GCMain;
}());
var squareRoot3 = Math.sqrt(3);
new GCMain();
//# sourceMappingURL=GCMain.js.map