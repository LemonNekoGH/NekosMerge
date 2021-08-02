var CommandExecute;
(function (CommandExecute) {
    var started = false;
    function newNeko() {
        var randLevel = MathUtils.rand(2) + 1;
        var neko = new UINeko(randLevel, false);
        var uiRoot = GameUI.get(2);
        if (uiRoot) {
            uiRoot.getChildAt(0).addChild(neko);
        }
    }
    function customCommand_1(commandPage, cmd, trigger, player, playerInput, p) {
        if (started)
            return;
        GameUI.dispose(1);
        GameUI.show(2);
        var ui2 = GameUI.get(2);
        var root2 = ui2.getChildAt(0);
        root2.on(EventObject.MOUSE_DOWN, this, onMouseDown);
        root2.on(EventObject.MOUSE_MOVE, this, onMouseMove);
        root2.on(EventObject.MOUSE_UP, this, onMouseUp);
        root2.on(EventObject.CLICK, this, onClick);
        root2.on(ProjectClientSceneObject.EVENT_MERGED, this, onNekoMerge);
        var mouseDown = false;
        function onMouseDown() {
            mouseDown = true;
        }
        function onMouseMove() {
            if (mouseDown) {
                for (var i = 0; i < root2.numChildren; i++) {
                    var child = root2.getChildAt(i);
                    child.event(EventObject.DRAG_MOVE, new Point(ui2.mouseX, ui2.mouseY));
                }
            }
        }
        function onMouseUp() {
            if (mouseDown) {
                for (var i = 0; i < root2.numChildren; i++) {
                    var child = root2.getChildAt(i);
                    child.event(EventObject.DRAG_END, new Point(ui2.mouseX, ui2.mouseY));
                }
                mouseDown = false;
                setTimeout(newNeko, 1500);
            }
        }
        function onClick() {
            for (var i = 0; i < root2.numChildren; i++) {
                var child = root2.getChildAt(i);
                child.event(EventObject.DRAG_END, new Point(ui2.mouseX, ui2.mouseY));
            }
        }
        function onNekoMerge(data) {
            var it = data.it, me = data.me;
            var upLevel = me.level + 1;
            var x = me.x;
            var y = me.y;
            it.dispose();
            me.dispose();
            var nekoObj = new UINeko(upLevel, true);
            GameUI.get(2).getChildAt(0).addChild(nekoObj);
            nekoObj.x = x;
            nekoObj.y = y - nekoObj.size;
            console.log("\u732B\u54AA\u5347\u7EA7\u4E86\uFF0C\u7B49\u7EA7 " + nekoObj.level);
        }
        started = true;
    }
    CommandExecute.customCommand_1 = customCommand_1;
    function customCommand_2(commandPage, cmd, trigger, player, playerInput, p) {
        newNeko();
    }
    CommandExecute.customCommand_2 = customCommand_2;
    function customCommand_3(commandPage, cmd, trigger, player, playerInput, p) {
        if (!started)
            return;
        GameUI.dispose(2);
        GameUI.show(1);
        started = false;
    }
    CommandExecute.customCommand_3 = customCommand_3;
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=Commands.js.map