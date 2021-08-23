/**
 * GC云排行榜-写入分数指令
 * Created by 黑暗之神KDS on 2021-05-10 00:46:07.
 */
module CommandExecute {
    /**
     * 写入排名的具体实现
     */
    export function doRecord(nickname: string, score: number, scoreType: number) {
        var type = scoreType;
        if (isInGCCloud()) {
            var gameID = GCCloudGameID();
            if (gameID == 0) return;
            var ur = new HttpRequest();
            var url = `${GCWebOrigin()}/sdk/openAPI.php?act=createUserRanking&n=${nickname}&s=${score}&t=${type}&g=${gameID}`;
            ur.send(url);
            ur.on(EventObject.COMPLETE, this, (content: string) => { });
        } else {
            GUI_GCUserRanking.rankingDatabase.push({ type: type, nickname: nickname, score: score });
            console.log(GUI_GCUserRanking.rankingDatabase)
            GUI_GCUserRanking.rankingDatabase.sort((a, b) => {
                return a.score > b.score ? -1 : 1;
            });
            if (GUI_GCUserRanking.rankingDatabase.length > GUI_GCUserRanking.maxDisplayCount) {
                GUI_GCUserRanking.rankingDatabase.length = GUI_GCUserRanking.maxDisplayCount;
            }
            SinglePlayerGame.saveGlobalData(null);
        }
    }

    /**
     * 写入排名
     */
    export function customCommand_15001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_15001): void {
        var score = Game.player.variable.getVariable(p.score);
        var nickname = Game.player.variable.getString(p.nickname);
        var type = p.type
        doRecord(nickname, score, type)
    }

    if (!Config.BEHAVIOR_EDIT_MODE) {
        /**
         * 注册-额外的全局储存数据
         */
        SinglePlayerGame.regSaveCustomGlobalData("GC_OpenAPI_Ranking", Callback.New(() => {
            return GUI_GCUserRanking.rankingDatabase;
        }, null));
        /**
         * 装载-该全局储存数据
         */
        EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, () => {
            var rankingDatabase = SinglePlayerGame.getSaveCustomGlobalData("GC_OpenAPI_Ranking");
            if (rankingDatabase) GUI_GCUserRanking.rankingDatabase = rankingDatabase;
        }, true);
    }
}
