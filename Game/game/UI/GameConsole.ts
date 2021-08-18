/**
 * Created by LemonNekoGC on 2021-08-06 15:40:57.
 * 在游戏内部的控制台使用
 * 包含了所有游戏内部支持的命令
 */
class GameConsole {
    static testGround: Matter.Body = undefined

    /**
     * 游戏中可使用的指令
     * 可在指定位置生成一只指定等级的猫咪
     * @return boolean 返回是否执行成功
     */
    static newNeko(x: number, y: number, level: number): boolean {
        if (!GCMain.guis.游戏中) {
            console.log("请在\"游戏中\"界面调用此命令")
            return false
        }

        const neko = new UINeko(level, true, x, y)
        GCMain.guis.游戏中.addChild(neko)
        console.log(`在 (${x}, ${y}) 位置生成了一只 ${level} 级别的猫咪`)

        GCMain.variables.分数作废 = true
        return true
    }

    /**
     * 游戏中可使用的指令
     * 随机生成等级 5 以下的猫咪
     */
    static randNeko(): boolean {
        const dx = (WorldData.猫咪容器右上角x值 - WorldData.猫咪容器左上角x值) / 2
        const x = MathUtils.rand(dx) + WorldData.猫咪容器左上角x值
        const y = WorldData.新猫咪初始位置
        const level = MathUtils.rand(5) + 1
        return GameConsole.newNeko(x, y, level)
    }

    /**
     * 执行 times 次命令，每次执行间隔 delay 毫秒
     */
    static doTimes(times: number, delay: number, func: Function, ...args: any[]) {
        console.log(`准备执行${times} 次 ，间隔时间 ${delay}`)
        let executeTimes = 0
        const indexOf = func.toString().indexOf(")")
        const funcName = func.toString().substring(0, indexOf + 1)

        function exec() {
            console.log(`正在执行 ${funcName} 第 ${executeTimes + 1} 次`)
            // 执行失败就停止执行
            const success = func.apply(this, args)
            executeTimes++

            if (executeTimes < times && success) {
                setTimeout(exec, delay)
            }
        }

        exec()
    }

    /**
     * 获取所有猫咪
     */
    static listAllNekos() {
        if (!colidDetector) {
            console.log('请在"游戏中"界面调用此命令')
            return 'none'
        }
        colidDetector.nekos.forEach((it: UINeko) => {
            console.log(it)
        })
    }

    /**
     * 获取所有刚体
     */
    static listAllBodys(): boolean {
        if (!colidDetector) {
            console.log('请在"游戏中"界面调用此命令')
            return false
        }
        colidDetector.physicsWorld.bodies.forEach(it => console.log(it))
        return true
    }

    /**
     * 在指定高度添加一个测试用地板
     */
    static addTestGroundAt(y: number): boolean {
        if (!colidDetector) {
            console.log('请在"游戏中"界面调用此命令')
            return false
        }
        let lastY = 0

        if (GameConsole.testGround) {
            lastY = GameConsole.testGround.position.y
            Matter.Composite.remove(colidDetector.physicsWorld, GameConsole.testGround, true)
        }
        const width = WorldData.猫咪容器右下角x值 - WorldData.猫咪容器左下角x值

        GameConsole.testGround = Matter.Bodies.rectangle(WorldData.猫咪容器左下角x值 + width / 2, y, width, 10, { isStatic: true })
        Matter.Composite.add(colidDetector.physicsWorld, GameConsole.testGround)

        console.log(`在 Y 轴位置 ${y} 的地方添加了测试用地板`)
        if (lastY !== 0) {
            console.log(`替换掉了之前 Y 轴位置 ${lastY} 的测试用地板`)
        }

        GCMain.variables.分数作废 = true
        return true
    }

    /**
     * 移除测试用地板
     */
    static removeTestGround(): boolean {
        if (!colidDetector) {
            console.log('请在"游戏中"界面调用此命令')
            return false
        }
        if (GameConsole.testGround) {
            const y = GameConsole.testGround.position.y
            Matter.Composite.remove(colidDetector.physicsWorld, GameConsole.testGround, true)
            GameConsole.testGround = undefined

            console.log(`移除掉了 Y 轴位置 ${y} 的测试用地板`)
            return true
        } else {
            console.log("没有添加测试用地板")
            return false
        }
    }

    /**
     * 重新开始游戏
     */
    static restartGame(): boolean {
        if (!colidDetector) {
            console.log('请在"游戏中"界面调用此命令')
            return false
        }
        colidDetector.clearAll()
        GCMain.variables.分数 = 0
        GameUI.get(2).event(ProjectGUI2.EVENT_GAME_RESTART)
        console.log("重新开始了游戏")

        GCMain.variables.分数作废 = false
        return true
    }

    /**
     * 使指定界面组件产生透明度变化
     * @params id 界面 id
     * @params name 组件名称
     * @params to 将透明度调整至
     * @params duration 调整时长
     */
    static changeOpacity(id: number, name: string, to: number, duration: number): boolean {
        const ui = GameUI.get(id)
        if (!ui) {
            console.log(`界面不存在 ${id}`)
            return false
        }
        const comp: UIBase = ui[name]
        if (!comp) {
            console.log(`界面组件不存在 ${name}`)
            return false
        }
        const time = duration * 1000
        const nowAlpha = comp.alpha
        const toAlpha = to / 100
        const alphaChangePerFrame = (nowAlpha - toAlpha) / time * 60

        const change0 = (comp: UIBase, changeVal: number, to: number): void => {
            comp.alpha -= changeVal

            if (changeVal < 0 && comp.alpha < to) {
                setTimeout(change0, 100 / 6, comp, changeVal, to)
            } else if (changeVal > 0 && comp.alpha > to) {
                setTimeout(change0, 100 / 6, comp, changeVal, to)
            } else {
                console.log("组件的透明度已被调整至：" + comp.alpha)
            }
        }

        change0(comp, alphaChangePerFrame, toAlpha)

        return true
    }

    /**
     * 列出所有可用命令
     */
    static listCommand() {
        console.log(
            "GameConsole.listAllNekos() 列出所有猫咪\n" +
            "GameConsole.listCommand() 列出所有可用指令\n" +
            "GameConsole.newNeko(x, y, level) 在坐标为 (x, y) 的地方生成一只等级为 level 的猫咪\n" +
            "GameConsole.randNeko() 在随机位置，生成等级小于 6 的猫咪\n" +
            "GameConsole.doTimes(times, delay, func, args) 执行 times 次指定函数并传入参数，每次执行间隔 delay 秒"
        )
    }
}