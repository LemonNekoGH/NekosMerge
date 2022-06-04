/**
 * Created by LemonNekoGC on 2022-06-04 16:04:54.
 */
module Locale {
    export const en = {
        startPage: {
            title: 'Nekos Merge',
            startBtn: 'Start',
            topBtn: 'LeaderBoard',
            settingsBtn: 'Settings',
            localeBtn: '切换语言'
        },
        inputName: {
            msg: 'Tell me your name, if you want to add your name and score to the leaderboard.',
            ok: 'OK',
            cancel: 'Cancel',
        },
        settings: {
            title: 'Settings',
            developerMode: 'Developers Options',
            showFPS: 'Show FPS (will affect performance)',
            save: 'Save'
        },
        leaderBoard: {
            rank: 'Rank',
            nickname: 'Nickname',
            score: 'Score',
            ok: 'OK'
        },
        gaming: {
            title: 'Nekos Merge',
            cheatTitle: 'Nekos Cheating',
            cheatNotify: 'The cheating command has been enabled, and the score of this game is invalid',
            score: 'Score:',
            highestScore: 'Top score:',
            console: '>_  console',
            pause: 'Pause',
            restart: 'Restart',
            settings: 'Settings',
            exit: 'Exit'
        },
        console: {
            commandNotFound: 'No such command, try use listCommand().',
            noCommand: 'No any command executed.',
            execute: 'Execute',
            back: 'Back'
        },
        gameOver: {
            msg: () => `Nekos overflow! Your score is ${GCMain.variables.分数}`,
            restart: 'Restart',
            exit: 'Exit'
        },
        pause: {
            msg: 'Nekos resting...',
            resume: 'Pause'
        },
        restart: {
            msg: 'Are you sure you want to restart?',
            ok: 'Yes',
            cancel: 'No'
        },
        exit: {
            msg: 'Are you sure you want to exit? Your top sore is saved.',
            ok: 'Yes',
            cancel: 'No'
        }
    }
}