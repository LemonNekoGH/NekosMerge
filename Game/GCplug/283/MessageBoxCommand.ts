/**
 * Created by LemonNekoGC on 2021-08-23 17:35:09.
 */
module CommandExecute {
    const PLUGIN_GUI_MESSAGE_BOX: number = 11

    export interface IMessageBtnOptions {
        x?: number
        y?: number
        text: string
        width?: number
        height?: number
        normalBg?: string
        hoverBg?: string
        clickBg?: string
        normalGrid?: string
        hoverGrid?: string
        clickGrid?: string
        onClick: string | Callback
        clickToCloseMessageBox: boolean
    }

    export interface IMessageBoxOptions {
        x?: number
        y?: number
        text: string
        width?: number
        height?: number
        background?: string
        confirmBtnOpt: IMessageBtnOptions
        cancelBtnOpt?: IMessageBtnOptions
    }

    /**
     * 生成按钮按下时的回调
     */
    function createOnBtnClickFn(): (clickToClose: boolean, onClick: string | Callback) => void {
        return (clickToClose: boolean, onClick: string | Callback) => {
            // 如果用可视化事件调用时执行事件片段
            // 否则执行回调方法
            if (typeof onClick === 'string') {
                CommandPage.startTriggerFragmentEvent(onClick as string, Game.player.sceneObject, Game.player.sceneObject)
            } else {
                (onClick as Callback).run()
            }
            if (clickToClose) {
                GameUI.dispose(PLUGIN_GUI_MESSAGE_BOX)
            }
        }
    }

    /**
     * 设置按钮属性
     */
    function setBtnProperties(btn: UIButton, opt: IMessageBtnOptions) {
        btn.label = opt.text
        opt.x && (btn.x = opt.x)
        opt.y && (btn.y = opt.y)
        opt.width && (btn.width = opt.width)
        opt.height && (btn.height = opt.height)
        opt.normalBg && (btn.image1 = opt.normalBg)
        opt.hoverBg && (btn.image2 = opt.hoverBg)
        opt.clickBg && (btn.image3 = opt.clickBg)
        opt.normalGrid && (btn.grid9img1 = opt.normalGrid)
        opt.hoverGrid && (btn.grid9img2 = opt.hoverGrid)
        opt.clickGrid && (btn.grid9img3 = opt.clickGrid)

        btn.on(EventObject.CLICK, btn, createOnBtnClickFn(), [opt.clickToCloseMessageBox, opt.onClick])
    }

    /**
     * 显示一个提示框或确认框
     * 真正的实现方法
     * 不愿意使用可视化的话可以用代码调用这个方法
     * 但还是建议用可视化
     */
    export function showMessageBox(options: IMessageBoxOptions): void {
        console.log(options)

        let msgBox = GameUI.get(PLUGIN_GUI_MESSAGE_BOX) as GUI_11
        // 当前有对话框正在显示，返回
        if (msgBox) {
            return
        }
        // 没有对话框正在显示，继续
        GameUI.show(PLUGIN_GUI_MESSAGE_BOX)
        msgBox = GameUI.get(PLUGIN_GUI_MESSAGE_BOX) as GUI_11
        // 设置对话框本体
        options.x && (msgBox.x = options.x)
        options.y && (msgBox.y = options.y)
        options.height && (msgBox.消息背景.height = options.height)
        options.width && (msgBox.消息背景.width = options.width)
        options.height && (msgBox.消息文本.height = options.height)
        options.width && (msgBox.消息文本.width = options.width)
        options.background && (msgBox.消息背景.image = options.background)
        msgBox.消息文本.text = options.text
        // 设置确认按钮
        let btn = msgBox.确认按钮.btn
        let opt = options.confirmBtnOpt
        setBtnProperties(btn, opt)
        // 设置取消按钮
        btn = msgBox.取消按钮.btn
        opt = options.cancelBtnOpt
        if (opt) {
            setBtnProperties(btn, opt)
        } else {
            btn.visible = false
        }
    }

    /**
     * 自定义指令
     * 显示一个提示框或确认框
     */
    export function customCommand_11(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any, p: CustomCommandParams_11): void {
        const btnNormalBg = p.确认按钮正常时背景
        const btnNormalGrid = p.确认按钮正常时背景九宫格
        const btnHoverBg = p.确认按钮鼠标悬浮时背景
        const btnHoverGrid = p.确认按钮鼠标悬浮时背景九宫格
        const btnClickBg = p.确认按钮按下时背景
        const btnClickGrid = p.确认按钮鼠标按下时背景九宫格
        const btnHeight = p.确认按钮高度
        const btnWidth = p.确认按钮宽度

        const confirmBtnOptions: IMessageBtnOptions = {
            x: p.确认按钮位置x,
            y: p.确认按钮位置y,
            width: btnWidth,
            height: btnHeight,
            text: p.确认按钮文本,
            normalBg: btnNormalBg,
            normalGrid: btnNormalGrid,
            hoverBg: btnHoverBg,
            hoverGrid: btnHoverGrid,
            clickBg: btnClickBg,
            clickGrid: btnClickGrid,
            onClick: p.当确认时执行,
            clickToCloseMessageBox: p.确认按钮点击后关闭对话框
        }
        let cancelBtnOptions: IMessageBtnOptions = undefined
        // 如果是确认框
        if (p.对话框类型 === 1) {
            const useSameSize = p.取消按钮与确认按钮使用相同高宽
            const useSameBgAndGrid = p.取消按钮与确认按钮使用相同的背景和九宫格

            cancelBtnOptions = {
                x: p.取消按钮位置x,
                y: p.取消按钮位置y,
                width: useSameSize ? btnWidth : p.取消按钮宽度,
                height: useSameSize ? btnHeight : p.取消按钮高度,
                text: p.取消按钮文本,
                normalBg: useSameBgAndGrid ? btnNormalBg : p.取消按钮正常时背景,
                normalGrid: useSameBgAndGrid ? btnNormalGrid : p.取消按钮正常时背景九宫格,
                hoverBg: useSameBgAndGrid ? btnHoverBg : p.取消按钮鼠标悬浮时背景,
                hoverGrid: useSameBgAndGrid ? btnHoverGrid : p.取消按钮鼠标悬浮时背景九宫格,
                clickBg: useSameBgAndGrid ? btnClickBg : p.取消按钮按下时背景,
                clickGrid: useSameBgAndGrid ? btnClickGrid : p.取消按钮鼠标按下时背景九宫格,
                onClick: p.当取消时执行,
                clickToCloseMessageBox: p.取消按钮点击后关闭对话框
            }
        }
        // 调用具体实现方法
        showMessageBox({
            x: p.对话框本体位置x,
            y: p.对话框本体位置y,
            text: p.消息文本,
            width: p.对话框本体宽度,
            height: p.对话框本体高度,
            background: p.对话框本体背景,
            confirmBtnOpt: confirmBtnOptions,
            cancelBtnOpt: cancelBtnOptions
        })
    }
}