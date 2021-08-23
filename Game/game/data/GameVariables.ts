/**
 * Created by LemonNekoGC on 2021-08-19 11:02:42.
 * 用于更加方便的获取游戏变量
 * 实例保存在 GCMain.variables 中，无需重新创建
 */
class GameVariables {
    setVariable(num: number, payload: number) {
        Game.player.variable.setVariable(num, payload)
    }
    getVariable(num: number): number {
        return Game.player.variable.getVariable(num)
    }
    setSwitch(index: number, payload: boolean) {
        Game.player.variable.setSwitch(index, payload ? 1 : 0)
    }
    getSwitch(index: number): boolean {
        return Game.player.variable.getSwitch(index) === 1
    }
    getString(index: number): string {
        return Game.player.variable.getString(index)
    }

    setString(index: number, payload: string): void {
        Game.player.variable.setString(index, payload)
    }

    get 分数(): number {
        return this.getVariable(1)
    }
    set 分数(score: number) {
        this.setVariable(1, score)
    }
    get 最高分数(): number {
        return this.getVariable(2)
    }
    set 最高分数(score: number) {
        this.setVariable(2, score)
    }
    get 游戏暂停(): boolean {
        return this.getVariable(3) === 1
    }
    set 游戏暂停(pause: boolean) {
        this.setVariable(3, pause ? 1 : 0)
    }
    get 等待下一个猫咪出现(): number {
        return this.getVariable(4)
    }
    set 等待下一个猫咪出现(score: number) {
        this.setVariable(4, score)
    }
    get 最高的猫咪等级(): number {
        return this.getVariable(5)
    }
    set 最高的猫咪等级(top: number) {
        this.setVariable(5, top)
    }
    get 开发者模式(): boolean {
        return this.getSwitch(1)
    }
    set 开发者模式(devMode) {
        this.setSwitch(1, devMode)
    }
    get 显示FPS(): boolean {
        return this.getSwitch(2)
    }
    set 显示FPS(devMode) {
        this.setSwitch(2, devMode)
    }
    get 分数作废(): boolean {
        return this.getSwitch(3)
    }
    set 分数作废(noScore: boolean) {
        this.setSwitch(3, noScore)
    }
    get 控制台文本(): string {
        return this.getString(1)
    }
    set 控制台文本(text: string) {
        this.setString(1, text)
    }

    get 玩家名称(): string {
        return this.getString(2)
    }

    set 玩家名称(text: string) {
        this.setString(2, text)
    }
}