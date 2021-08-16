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
                colidDetector.step(colidDetector);
            }
        }, null);
        SinglePlayerGame.regSaveCustomGlobalData("GLOBAL_DATA", Callback.New(function () { return new GlobalData; }, this));
    },
    variables: {
        setVariable: function (num, payload) {
            Game.player.variable.setVariable(num, payload);
        },
        getVariable: function (num) {
            return Game.player.variable.getVariable(num);
        },
        setSwitch: function (index, payload) {
            Game.player.variable.setSwitch(index, payload ? 1 : 0);
        },
        getSwitch: function (index) {
            return Game.player.variable.getSwitch(index) === 1;
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
            return this.getVariable(3) === 1;
        },
        set 游戏暂停(pause) {
            this.setVariable(3, pause ? 1 : 0);
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
        },
        get 开发者模式() {
            return this.getSwitch(1);
        },
        set 开发者模式(devMode) {
            this.setSwitch(1, devMode);
        },
        get 显示FPS() {
            return this.getSwitch(2);
        },
        set 显示FPS(devMode) {
            this.setSwitch(2, devMode);
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