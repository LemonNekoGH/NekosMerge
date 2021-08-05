var Game = new GameBase();
function collectSprites(sprite, sprites) {
    for (var i = 0; i < sprite.numChildren; i++) {
        var node = sprite.getChildAt(i);
        if (node instanceof GameSprite) {
            collectSprites(node, sprites);
        }
    }
    sprites.push(sprite);
}
var GCMain = {
    onClientWorldInit: function () {
        GameUI.show(1);
        var showFPS = false;
        os.add_ENTERFRAME(function () {
            if (Game.player.variable.getSwitch(2) && !showFPS) {
                os.showFPS();
                showFPS = true;
            }
            else if (!Game.player.variable.getSwitch(2) && showFPS) {
                os.hideFPS();
                showFPS = false;
            }
        }, null);
    },
    variables: {
        setVariable: function (num, payload) {
            Game.player.variable.setVariable(num, payload);
        },
        getVariable: function (num) {
            return Game.player.variable.getVariable(num);
        },
        get 分数() {
            return this.getVariable(1);
        },
        set 分数(score) {
            this.setVariable(1, score);
        },
        get 最高分数() {
            return this.getVariable(2);
        },
        set 最高分数(score) {
            this.setVariable(2, score);
        },
        get 游戏暂停() {
            return this.getVariable(3);
        },
        set 游戏暂停(score) {
            this.setVariable(3, score);
        },
        get 等待下一个猫咪出现() {
            return this.getVariable(4);
        },
        set 等待下一个猫咪出现(score) {
            this.setVariable(4, score);
        },
        get 最高的猫咪等级() {
            return this.getVariable(5);
        },
        set 最高的猫咪等级(top) {
            this.setVariable(5, top);
        }
    },
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