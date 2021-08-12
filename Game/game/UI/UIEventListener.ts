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

/**
 * 自定义鼠标样式
 * state
 * --- 1 鼠标按下
 * --- 2 鼠标抬起
 * --- 3 鼠标悬浮
 */
function changeCursor(state: number) {
    switch (state) {
        case 1:
            document.body.style.cursor = 'url("./asset/image/picture/control/cursor-down.cur"), auto'
            break
        case 2:
            document.body.style.cursor = 'url("./asset/image/picture/control/cursor.cur"), auto'
            break
        case 3:
            document.body.style.cursor = 'url("./asset/image/picture/control/cursor-over.cur"), auto'
            break
        default:
            document.body.style.cursor = 'url("./asset/image/picture/control/cursor.cur"), auto'
            break
    }
}


/**
 * state
 * --- 1 鼠标按下
 * --- 2 鼠标抬起
 * --- 3 鼠标悬浮
 */
function moveText(component: UIButton, state: number) {
    if (!component) {
        return
    }
    switch (state) {
        case 1:
            component.textDy = 5
            break
        case 2:
            component.textDy = 0
            break
        case 3:
            component.textDy = 0
            break
        default:
            component.textDy = -5
            break
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
    let btn: UIButton = undefined
    if (component instanceof UIButton) {
        btn = component as UIButton
    }

    component.on(EventObject.MOUSE_DOWN, this, () => {
        changeCursor(1)
        moveText(btn, 1)
    })
    component.on(EventObject.MOUSE_UP, this, () => {
        changeCursor(2)
        moveText(btn, 2)
    })
    component.on(EventObject.MOUSE_OVER, this, () => {
        if (btn || component instanceof UINeko) {
            changeCursor(3)
        }
        moveText(btn, 3)
    })
    component.on(EventObject.MOUSE_OUT, this, () => {
        changeCursor(4)
        moveText(btn, 4)
    })
}