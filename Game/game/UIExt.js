var devMode = true;
EventUtils.addEventListener(UIBase, UIBase.EVENT_COMPONENT_CONSTRUCTOR_INIT, Callback.New(onUiComponentInit, this, [false]));
function onUiComponentInit(isRoot, component) {
    if (component.hasCommand[0]) {
        component.on(EventObject.CLICK, component, onComponentClick, [component]);
    }
}
function onComponentClick(component) {
    if (devMode) {
        console.log("组件被点击：" + component.id);
    }
    GameCommand.startUICommand(component, 0, null, null);
}
//# sourceMappingURL=UIExt.js.map