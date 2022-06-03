/**
 * Created by LemonNekoGC on 2022-06-03 15:48:49.
 */
class LoadingPageGUI extends GUI_10 {
    private resourcesToLoad: string[] = [
        // 猫咪图片
        "asset/image/avatar/NekoHead1.png",
        "asset/image/avatar/NekoHead2.png",
        "asset/image/avatar/NekoHead3.png",
        "asset/image/avatar/NekoHead4.png",
        "asset/image/avatar/NekoHead5.png",
        "asset/image/avatar/NekoHead6.png",
        "asset/image/avatar/NekoHead7.png",
        "asset/image/avatar/NekoHead8.png",
        "asset/image/avatar/NekoHead9.png", // TODO: 添加第 10 个猫咪
        // 鼠标图片
        "asset/image/picture/control/cursor.png",
        "asset/image/picture/control/cursor-over.png",
        "asset/image/picture/control/cursor-down.png",
        // 按钮图片
        "asset/image/picture/control/NekosMergeButton.png",
        "asset/image/picture/control/NekosMergeButtonHover.png",
        "asset/image/picture/control/NekosMergeButtonClick.png",
        // 选择框图片
        "asset/image/picture/control/NekosMergeCheckBox.png",
        "asset/image/picture/control/NekosMergeCheckBoxHover.png",
        "asset/image/picture/control/NekosMergeCheckBoxSelected.png",
        // 背景图片
        "asset/image/picture/control/对话框遮罩.png",
        "asset/image/picture/control/控制台遮罩.png",
        "asset/image/picture/control/NekosMergeGamingBg.png",
        "asset/image/picture/control/NekosMergeEntryBg.png",
        // 字体
        "asset/font/Menlo-Regular.ttf",
        "asset/font/阿里巴巴普惠体.ttf"
    ]
    private loadedNums = 0
    private allNums = this.resourcesToLoad.length
    private progress = 0
    constructor() {
        super()
        Callback.New(() => {
            this.startLoad(0)
        }, this).run()
        console.log('实例已建立')
    }

    // 渲染进度条
    renderProgress = () => {
        console.log(this.progress)
        this.graphics.clear();
        this.graphics.drawPie(592, 352, 100, -90, this.progress * 360 - 90, '#ef832d');
        this.graphics.drawCircle(592, 352, 95, '#000000');
    }

    // 加载方法
    startLoad = (index: number): void => {
        // 如果索引与资源长度相等，就不再继续
        if (index === this.allNums) return
        const res = this.resourcesToLoad[index]
        console.log(`即将加载: ${res}`)
        // 根据后缀选择加载器
        if (res.endsWith('.png')) {
            AssetManager.loadImage(res, Callback.New(() => {
                this.loadedNums++
                this.onProgress()
                this.startLoad(++index)
            }, this))
        } else if (res.endsWith('ttf')) {
            AssetManager.preloadFont(res, Callback.New(() => {
                this.loadedNums++
                this.onProgress()
                this.startLoad(++index)
            }, this))
        }
    }

    // 进度更新方法
    onProgress = () => {
        gsap.killTweensOf(this)
        gsap.to(this, {
            progress: this.loadedNums / this.allNums,
            duration: 1,
            ease: 'power4',
            onComplete: () => {
                // 如果动画结束时已经加载完毕，调用结束方法
               if (this.loadedNums === this.allNums) this.onFinish()
            },
            onUpdate: () => {
                this.renderProgress()
            }
        })
    }

    // 完成加载
    onFinish = () => {
        console.log('加载完成')
        // 跳转到开始界面
        GameUI.show(1)
        GameUI.dispose(10)
    }
}