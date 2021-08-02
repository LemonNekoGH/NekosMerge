var Game = new GameBase();
var GCMain = (function () {
    function GCMain() {
        EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, this.onClientWorldInit, null);
    }
    GCMain.prototype.onClientWorldInit = function () {
        GameUI.show(1);
        new SceneEventListener();
    };
    return GCMain;
}());
function collectSprites(sprite, sprites) {
    for (var i = 0; i < sprite.numChildren; i++) {
        var node = sprite.getChildAt(i);
        if (node instanceof GameSprite) {
            collectSprites(node, sprites);
        }
    }
    sprites.push(sprite);
}
new GCMain();
//# sourceMappingURL=GCMain.js.map