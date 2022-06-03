/**
 * Created by LemonNekoGC on 2021-08-02 13:07:01.
 */
// 当组件被创建时，执行追加的逻辑
EventUtils.addEventListenerFunction(UIBase, UIBase.EVENT_COMPONENT_CONSTRUCTOR_INIT, onUiComponentInit, this, [false])

function executeCommand(indexType: number): (component: UIBase) => void {
    return (component: UIBase) => {
        if (GameUI.get(7) && component instanceof UIButton) {
            return
        }
        GameCommand.startUICommand(component, indexType, null, null)
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
}