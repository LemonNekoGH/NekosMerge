/**
 * Created by LemonNekoGC on 2021-07-19 16:11:51.
 */
module CommandExecute {
    /**
     * 开始游戏
     */
    let started = false

    export function customCommand_1(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any[], p: CustomCommandParams_1): void {
        // 已经开始了
        if (started) return
        
        GameUI.dispose(1)
        SinglePlayerGame.newGame()

        started = true
    }

    /**
     * 界面切换
     */
    export function customCommand_2(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, player: ClientPlayer, playerInput: any[], p: CustomCommandParams_2): void {

    }
}