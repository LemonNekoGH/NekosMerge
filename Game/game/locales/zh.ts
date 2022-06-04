/**
 * Created by LemonNekoGC on 2022-06-04 16:04:45.
 */
module Locale {
    export const zh = {
        startPage: {
            title: '合成大猫咪',
            startBtn: '开 始',
            topBtn: '排 行 榜',
            settingsBtn: '设 置',
            localeBtn: 'Switch Language'
        },
        inputName: {
            msg: '如果你愿意的话，可以把名字写在下面，当游戏结束时，你的名字和分数将被记录到排行榜',
            ok: '决定了',
            cancel: '算了',
        },
        settings: {
            title: '设置',
            developerMode: '开发者选项',
            showFPS: '显示 FPS（会影响性能）',
            save: '保 存'
        },
        leaderBoard: {
            rank: '排名',
            nickname: '昵称',
            score: '分数',
            ok: '确 定'
        },
        gaming: {
            title: '合成大猫咪',
            cheatTitle: '作弊大猫咪',
            cheatNotify: '作弊性质指令已启用，本次游戏分数无效',
            score: '分数：',
            highestScore: '最高分数：',
            console: '>_  终端',
            pause: '暂 停',
            restart: '重 开',
            settings: '设 置',
            exit: '退 出'
        },
        console: {
            commandNotFound: '不认识的指令，你可以输入 listCommand() 指令列出所有可用指令',
            noCommand: '没有输入指令',
            execute: '执行',
            back: '返回'
        },
        gameOver: {
            msg: () => `猫咪溢出来啦，得分 ${GCMain.variables.分数}`,
            restart: '重开',
            exit: '退出'
        },
        pause: {
            msg: '猫咪摸鱼中...',
            resume: '继续'
        },
        restart: {
            msg: '确定要重开游戏吗？猫咪们会在另一个世界想你的。',
            ok: '是的',
            cancel: '算了'
        },
        exit: {
            msg: '要撤了吗？你的最高分数已经保存了。',
            ok: '是的',
            cancel: '算了'
        }
    }
}