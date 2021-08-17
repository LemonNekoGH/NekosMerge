/**
 * Created by LemonNekoGC on 2021-07-27 17:31:44.
 */
class ColidDetector {
    nekos: UINeko[] = []

    physicsEngine: Matter.Engine
    physicsRunner: Matter.Runner
    physicsWorld: Matter.World

    shouldBeMergeA: UINeko
    shouldBeMergeB: UINeko

    tick: number = 0

    map: BodyNekoMap = new BodyNekoMap()

    constructor() {
        this.physicsEngine = Matter.Engine.create()
        this.physicsWorld = this.physicsEngine.world
        this.physicsRunner = Matter.Runner.create()

        this.createEdge()
        Matter.Events.on(this.physicsEngine, 'collisionStart', this.colisionStart)
        Matter.Events.on(this.physicsRunner, 'tick', this.step)

        Matter.Runner.run(this.physicsRunner, this.physicsEngine)
    }

    /**
     * 创建默认的材质
     */
    createDefaultFixtureDef(): b2.FixtureDef {
        const fixture = new b2.FixtureDef()
        fixture.density = WorldData.物体质量
        fixture.friction = WorldData.摩擦系数
        fixture.restitution = WorldData.弹力系数

        return fixture
    }

    /**
     * 创建边界刚体
     */
    createEdge() {
        const height = WorldData.猫咪容器左下角y值 - WorldData.猫咪容器左上角y值
        const width = WorldData.猫咪容器右上角x值 - WorldData.猫咪容器左上角x值

        // 创建左面边界
        const left = Matter.Bodies.rectangle(WorldData.猫咪容器左上角x值, height / 2, 5, WorldData.猫咪容器左下角y值, { isStatic: true })
        // 创建底面边界
        const bottom = Matter.Bodies.rectangle(WorldData.猫咪容器左下角x值 + width / 2, WorldData.猫咪容器左下角y值, width, 5, { isStatic: true })
        // 创建右面边界
        const right = Matter.Bodies.rectangle(WorldData.猫咪容器右上角x值, height / 2, 5, WorldData.猫咪容器右下角y值, { isStatic: true })

        Matter.Composite.add(this.physicsWorld, [left, bottom, right])
    }

    /**
     * 创建圆形刚体
     */
    createCircleBody(radius: number, position: Point): Matter.Body {
        return Matter.Bodies.circle(position.x, position.y, radius, null, 36)
    }

    /**
     * 将猫咪添加到世界中
     * 同时绑定一个刚体
     */
    add(neko: UINeko) {
        const body = Matter.Bodies.circle(neko.x, neko.y, neko.size)
        body.restitution = 0.8
        neko.body = body
        this.map.setByBody(body, neko)

        Matter.Composite.add(this.physicsWorld, body)

        this.nekos.push(neko)
    }

    /**
     * 将猫咪从世界中移除
     * 并摧毁刚体
     */
    remove(neko: UINeko) {
        this.map.remove(neko.body)
        Matter.Composite.remove(this.physicsWorld, neko.body, true)
        neko.body = null

        ArrayUtils.remove(this.nekos, neko)
    }

    /**
     * 当猫咪碰撞时调用
     */
    colisionStart(e: Matter.IEventCollision<Matter.Engine>): void {
        const pairs = e.pairs
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i]
            const self = colidDetector.map.getByBody(pair.bodyA)
            const it = colidDetector.map.getByBody(pair.bodyB)

            if (self && it && self.level === it.level) {
                GCMain.guis.游戏中.event(UINeko.EVENT_MERGED, {
                    it, me: self
                })
            }
        }
    }

    /**
     * 清除所有猫咪
     */
    clearAll() {
        while (this.nekos.length > 0) {
            this.nekos[0].dispose()
        }
        this.nekos = []
    }

    /**
     * 执行模拟
     */
    step(e) {
        if (!colidDetector) {
            return
        }
        const bds = colidDetector.physicsWorld.bodies
        for (let i = 0; i < bds.length; i++) {
            const bd = bds[i]
            const neko = colidDetector.map.getByBody(bd)
            if (neko) {
                neko.x = bd.position.x
                neko.y = bd.position.y
                neko.rotation = NekoMath.radian2Angle(bd.angle)
            }
        }
        for (let i = 0; i < colidDetector.nekos.length; i++) {
            const neko = colidDetector.nekos[i]
            if (!neko.flag_outOfContainer && neko.isOutOfContainer) {
                GCMain.guis.游戏中.event(UINeko.EVENT_OUT_OF_CONTAINER)
                neko.flag_outOfContainer = true
            } else if (neko.flag_outOfContainer && !neko.isOutOfContainer) {
                GCMain.guis.游戏中.event(UINeko.EVENT_BACK_IN_TO_CONTAINER)
                neko.flag_outOfContainer = false
            }
        }
    }
}

let colidDetector: ColidDetector = undefined