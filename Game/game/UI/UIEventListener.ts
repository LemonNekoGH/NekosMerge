/**
 * Created by LemonNekoGC on 2021-08-02 13:07:01.
 */
// 当组件被创建时，执行追加的逻辑
EventUtils.addEventListenerFunction(UIBase, UIBase.EVENT_COMPONENT_CONSTRUCTOR_INIT, onUiComponentInit, this, [false])

// 追加逻辑
function onUiComponentInit(isRoot: boolean, component: UIBase) {
    console.log('id[' + component.id + ']的组件已经初始化完毕')
    // 注册鼠标点击事件
    // 判断指令列表里是否有指令
    if (component.hasCommand[0]) {
        console.log('id[' + component.id + ']的组件已经注册完点击事件')
        component.on(EventObject.CLICK, component, onComponentClick, [component])
    }
    // 注册组件显示事件
    if (component.hasCommand[1]) {
        console.log('id[' + component.id + ']的组件已经注册完显示事件')
        component.once(EventObject.DISPLAY, component, onComponentFirstDisplay, [component])
    }
}

// 点击事件
function onComponentClick(component: UIBase) {
    GameCommand.startUICommand(component, 0, null, null)
}

// 组件显示事件
function onComponentFirstDisplay(component: UIBase) {
    console.log('id[' + component.id + ']开始显示')
    GameCommand.startUICommand(component, 1, null, null)
}