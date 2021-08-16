/**
 * Created by LemonNekoGC on 2021-08-06 15:40:57.
 * 在游戏内部的控制台使用
 * 包含了所有游戏内部支持的命令
 */
class GameConsole {
    static testGround: b2.Body = undefined

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
        console.log(`在 (${x}, ${y}) 位置生成了一只 ${level} 级别的网站`)
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
    static listAllBodys() {
        if (!colidDetector) {
            console.log('请在"游戏中"界面调用此命令')
            return 'none'
        }
        let body: b2.Body = colidDetector.physicsWorld.GetBodyList()
        while (body) {
            console.log(body)
            body = body.GetNext()
        }
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
            lastY = GameConsole.testGround.m_xf.p.y
            colidDetector.physicsWorld.DestroyBody(GameConsole.testGround)
        }
        const def = new b2.BodyDef()
        def.type = b2.BodyType.b2_staticBody
        const shape = new b2.EdgeShape()
        shape.SetTwoSided(new b2.Vec2(WorldData.猫咪容器左上角x值, y), new b2.Vec2(WorldData.猫咪容器右上角x值, y))

        GameConsole.testGround = colidDetector.physicsWorld.CreateBody(def)
        GameConsole.testGround.CreateFixture(shape)

        console.log(`在 Y 轴位置 ${y} 的地方添加了测试用地板`)
        if (lastY) {
            console.log(`替换掉了之前 Y 轴位置 ${lastY} 的测试用地板`)
        }
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
            const y = GameConsole.testGround.m_xf.p.y
            colidDetector.physicsWorld.DestroyBody(GameConsole.testGround)
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

Object.defineProperty(parent, "GameConsole", GameConsole)