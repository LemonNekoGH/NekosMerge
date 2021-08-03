/**
 * Created by LemonNekoGC on 2021-08-02 13:07:01.
 */
// 当组件被创建时，执行追加的逻辑
EventUtils.addEventListenerFunction(UIBase, UIBase.EVENT_COMPONENT_CONSTRUCTOR_INIT, onUiComponentInit, this, [false])

function executeCommand(indexType: number): (component: UIBase) => void {
    return (component: UIBase) => {
        GameCommand.startUICommand(component, indexType, null, null)
    }
}

// 追加逻辑
function onUiComponentInit(isRoot: boolean, component: UIBase) {
    // 注册鼠标点击事件
    // 判断指令列表里是否有指令
    if (component.hasCommand[0]) {
        component.on(EventObject.CLICK, component, executeCommand(0), [component])
    }
    // 注册组件显示事件
    if (component.hasCommand[1]) {
        component.once(EventObject.DISPLAY, component, executeCommand(1), [component])
    }
    // 注册组件鼠标悬浮事件
    if (component.hasCommand[2]) {
        component.once(EventObject.MOUSE_OVER, component, executeCommand(2), [component])
    }
    // 注册组件鼠标悬浮事件
    if (component.hasCommand[3]) {
        component.once(EventObject.MOUSE_OUT, component, executeCommand(3), [component])
    }

    // 如果是按钮，就改成自己的样式
    if (!(component instanceof UIButton)) {
        return
    }
    const btn = component as UIButton

    component.on(EventObject.MOUSE_DOWN, this, () => {
        btn.textDy = 5
    })
    component.on(EventObject.MOUSE_UP, this, () => {
        btn.textDy = 0
    })
    component.on(EventObject.MOUSE_OVER, this, () => {
        btn.textDy = 0
    })
    component.on(EventObject.MOUSE_OUT, this, () => {
        btn.textDy = -5
    })
}