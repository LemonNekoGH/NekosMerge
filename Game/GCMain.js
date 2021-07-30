var Game = new GameBase();
var GCMain = (function () {
    function GCMain() {
        EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, this.onClientWorldInit, null);
        new SceneEventListener();
    }
    GCMain.prototype.onClientWorldInit = function () {
        GameUI.show(1);
        os.add_ENTERFRAME(function () {
            if (Game.currentScene !== ClientScene.EMPTY) {
                var sprites = [];
                collectSprites(Game.currentScene.displayObject, sprites);
                console.log(sprites.length);
                if (sprites.length > 200) {
                    debugger;
                    console.log(sprites);
                }
            }
        }, Game);
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