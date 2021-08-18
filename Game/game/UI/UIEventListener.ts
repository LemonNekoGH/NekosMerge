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
            os.setCursor('url("./asset/image/picture/control/cursor-down.png"), auto')
            break
        case 2:
            os.setCursor('url("./asset/image/picture/control/cursor.png"), auto')
            break
        case 3:
            os.setCursor('url("./asset/image/picture/control/cursor-over.png"), auto')
            break
        default:
            os.setCursor('url("./asset/image/picture/control/cursor.png"), auto')
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

const numberEventArr = [
    EventObject.CLICK,
    UIBase.ON_VISIBLE_CHANGE,
    EventObject.MOUSE_OVER,
    EventObject.MOUSE_OUT,
    UIBase.ON_VISIBLE_CHANGE,
    EventObject.DISPLAY
]

// 追加逻辑
function onUiComponentInit(isRoot: boolean, component: UIBase) {
    for (let i = 0;i < numberEventArr.length;i ++) {
        if (component.hasCommand[i]) {
            // 当出现或消失时有额外条件
            if (i === 1) {
                if (component.visible) {
                    console.log(component.visible)
                    component.on(numberEventArr[i], this, executeCommand(i), [component])
                }
            } else if (i === 4) {
                if (!component.visible) {
                    console.log(component.visible)
                    component.on(numberEventArr[i], this, executeCommand(i), [component])
                }
            } else {
                component.on(numberEventArr[i], this, executeCommand(i), [component])
            }
        }
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