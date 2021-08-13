/**
 * Created by LemonNekoGC on 2021-08-06 15:40:57.
 * 在游戏内部的控制台使用
 * 包含了所有游戏内部支持的命令
 */
class GameConsole {
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
        return true
    }

    /**
     * 游戏中可使用的指令
     * 随机生成等级 5 以下的猫咪
     */
    static randNeko(): boolean {
        const dx = WorldData.猫咪容器右上角x值 - WorldData.猫咪容器左上角x值
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

        function exec() {
            console.log(`正在执行第 ${executeTimes + 1} 次`)
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
     * 列出所有可用命令
     */
    static listCommand() {
        console.log("GameConsole.listCommand() 列出所有可用指令")
        console.log("GameConsole.newNeko(x, y, level) 在坐标为 (x, y) 的地方生成一只等级为 level 的猫咪")
        console.log("GameConsole.randNeko() 在随机位置，生成等级小于 6 的猫咪")
        console.log("GameConsole.doTimes(times, delay, func, args) 执行 times 次指定函数并传入参数，每次执行间隔 delay 秒")
    }
}
