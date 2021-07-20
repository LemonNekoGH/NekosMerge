/**
 * Created by LemonNekoGC on 2021-07-19 16:30:46.
 */
const devMode = true

// 当组件被创建时，执行追加的逻辑
EventUtils.addEventListener(UIBase, UIBase.EVENT_COMPONENT_CONSTRUCTOR_INIT, Callback.New(onUiComponentInit, this, [false]))

// 追加逻辑
function onUiComponentInit(isRoot: boolean, component: UIBase) {
    // 注册鼠标点击事件
    // 判断指令列表里是否有指令
    if (component.hasCommand[0]) {
        component.on(EventObject.CLICK, component, onComponentClick, [component])
    }
}

// 点击事件
function onComponentClick(component: UIBase) {
    if (devMode) {
        console.log("组件被点击：" + component.id)
    }
    GameCommand.startUICommand(component, 0, null, null)
}