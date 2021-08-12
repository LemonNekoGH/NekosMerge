//------------------------------------------------------------------------------------------------------
// 入口
//------------------------------------------------------------------------------------------------------
// 新建全局变量Game，可用自定义子类继承GameBase
var Game = new GameBase();

// 收集所有精灵信息
function collectSprites(sprite: GameSprite, sprites: GameSprite[]) {
    for (let i = 0; i < sprite.numChildren; i++) {
        const node = sprite.getChildAt(i)
        if (node instanceof GameSprite) {
            collectSprites(node, sprites)
        }
    }
    sprites.push(sprite)
}

const GCMain = {
    onClientWorldInit() {
        document.body.style.cursor = 'url("./asset/image/picture/control/cursor.cur"), auto'
        GameUI.show(1)
        
        GlobalData.restore()

        // 当显示 FPS 开关打开时，显示 FPS
        let showFPS = false
        os.add_ENTERFRAME(() => {
            if (GCMain.variables.显示FPS && !showFPS) {
                os.showFPS()
                showFPS = true
            } else if (!GCMain.variables.显示FPS && showFPS) {
                os.hideFPS()
                showFPS = false
            }
            colidDetector.step(colidDetector)
        }, null)

        SinglePlayerGame.regSaveCustomGlobalData("GLOBAL_DATA", Callback.New(() => new GlobalData, this))
    },
    // 各种游戏变量
    variables: {
        setVariable(num: number, payload: number) {
            Game.player.variable.setVariable(num, payload)
        },
        getVariable(num: number): number {
            return Game.player.variable.getVariable(num)
        },
        setSwitch(index: number, payload: boolean) {
            Game.player.variable.setSwitch(index, payload ? 1 : 0)
        },
        getSwitch(index: number): boolean{
            return Game.player.variable.getSwitch(index) === 1
        },
        get 分数(): number {
            return this.getVariable(1)
        },
        set 分数(score: number) {
            this.setVariable(1, score)
        },
        get 最高分数(): number {
            return this.getVariable(2)
        },
        set 最高分数(score: number) {
            this.setVariable(2, score)
        },
        get 游戏暂停(): number {
            return this.getVariable(3)
        },
        set 游戏暂停(score: number) {
            this.setVariable(3, score)
        },
        get 等待下一个猫咪出现(): number {
            return this.getVariable(4)
        },
        set 等待下一个猫咪出现(score: number) {
            this.setVariable(4, score)
        },
        get 最高的猫咪等级(): number {
            return this.getVariable(5)
        },
        set 最高的猫咪等级(top: number) {
            this.setVariable(5, top)
        },
        get 开发者模式(): boolean {
            return this.getSwitch(1)
        },
        set 开发者模式(devMode) {
            this.setSwitch(1, devMode)
        },
        get 显示FPS(): boolean {
            return this.getSwitch(2)
        },
        set 显示FPS(devMode) {
            this.setSwitch(2, devMode)
        }
    },
    guis: {
        get 游戏中(): GUI_2 {
            return GameUI.get(2) as GUI_2
        },
        get 主界面(): GUI_1 {
            return GameUI.get(1) as GUI_1
        }
    }
}

EventUtils.addEventListenerFunction(ClientWorld, ClientWorld.EVENT_INITED, GCMain.onClientWorldInit, null)
