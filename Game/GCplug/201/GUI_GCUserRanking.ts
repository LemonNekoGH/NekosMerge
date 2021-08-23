/**
 * GC云排行榜界面
 * Created by 黑暗之神KDS on 2021-05-10 01:25:59.
 */
class GUI_GCUserRanking extends GUI_15001 {
    /**
     * 非GC云端排行测试排行（后期应加入其它正式发布的游戏端支持云排名）
     */
    static rankingDatabase: { nickname: string, score: number, type: number }[] = [];
    /**
     * 最大记录条数
     */
    static maxDisplayCount = 20;
    //------------------------------------------------------------------------------------------------------
    // 实例
    //------------------------------------------------------------------------------------------------------
    /**
     * 数据排名
     */
    private rankDataList: { nickname: string, score: number }[][] = [];
    /**
     * 打开的数据
     */
    private openSID: number;
    /**
     * 构造函数
     */
    constructor() {
        super();
        this.on(EventObject.DISPLAY, this, this.onDisplay);
    }
    /**
     * 显示
     */
    private onDisplay() {
        this.list.mouseEnabled = true;
        this.openSID = ObjectUtils.getInstanceID();
        // -- 获取列表
        this.list.items = [];
        // -- 设置
        this.rankDataList = [];
        if (isInGCCloud()) {
            var gameID = GCCloudGameID();
            if (gameID == 0) return;
            var ur = new HttpRequest();
            var url = `${GCWebOrigin()}/sdk/openAPI.php?act=getUserRankingList&t=1&i=${gameID}&top=${GUI_GCUserRanking.maxDisplayCount}`;
            ur.send(url);
            ur.on(EventObject.COMPLETE, this, (openSID: number, content: string) => {
                if (this.openSID != openSID) return;
                var rankList = content.split(String.fromCharCode(6));
                if (rankList.length > 0) rankList.pop();
                for (var i = 0; i < rankList.length; i++) {
                    var rankUserArr = rankList[i].split(String.fromCharCode(5));
                    rankUserArr.shift();
                    var type = parseInt(rankUserArr[0]);
                    var nickname = rankUserArr[1];
                    var score = parseFloat(rankUserArr[2]);
                    var rankDataArr = this.rankDataList[type];
                    if (!rankDataArr) rankDataArr = this.rankDataList[type] = [];
                    rankDataArr.push({ nickname: nickname, score: score });
                }
                this.refreshList();
            }, [this.openSID]);
        } else {
            for (var i = 0; i < GUI_GCUserRanking.rankingDatabase.length; i++) {
                var rankUserArr = GUI_GCUserRanking.rankingDatabase[i];
                var type = rankUserArr.type;
                var nickname = rankUserArr.nickname;
                var score = rankUserArr.score;
                var rankDataArr = this.rankDataList[type];
                if (!rankDataArr) rankDataArr = this.rankDataList[type] = [];
                rankDataArr.push({ nickname: nickname, score: score });
            }
            this.refreshList();
        }
    }
    /**
     * 刷新显示
     */
    private refreshList() {
        console.log(this.rankDataList)
        var type = 0;
        this.list.items = [];
        if (type >= 0) {
            var rankDataArr = this.rankDataList[type];
            if (rankDataArr) {
                var arr = [];
                for (var i = 0; i < rankDataArr.length; i++) {
                    var rankInfo = rankDataArr[i];
                    var d = new ListItem_15002;
                    d.score = rankInfo.score.toString();
                    d.ranking = (i + 1).toString();
                    d.nickname = rankInfo.nickname.toString();
                    arr.push(d);
                }
                this.list.items = arr;
            }
        }
    }
}
//------------------------------------------------------------------------------------------------------
// 
//------------------------------------------------------------------------------------------------------ 
function isInGCCloud() {
    return window.location.href.indexOf("gamecreator") != -1;
}
function GCWebOrigin() {
    return window.location.protocol == "http:" ? "http://f.gamecreator.com.cn" : "https://www.gamecreator.com.cn";
}
function GCCloudGameID(): number {
    if (!isInGCCloud()) return 0;
    // 获取
    try {
        var parentInfo = JSON.parse(window.name);
    }
    catch (e) {
        return 0;
    }
    return parentInfo.id;
}
// 跨域获取父页面地址
function getParentUrl(): string {
    var url = null;
    if (parent !== window) {
        try {
            url = parent.location.href;
        } catch (e) {
            url = document.referrer;
        }
    }
    return url;
}