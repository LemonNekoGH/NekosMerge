/**
 * Created by LemonNekoGC on 2021-07-27 17:31:44.
 */
class ColidDetector extends b2.ContactListener {
    /**
     * 物理世界
     */
    physicsWorld: b2.World
    nekos: UINeko[] = []

    shouldBeMergeA: UINeko
    shouldBeMergeB: UINeko

    /**
     * 用于修复时间步长不稳定的问题
     */
    currentTime: number = 0
    accumulator: number = 0

    constructor() {
        super()
        this.physicsWorld = new b2.World(worldGravity)
        this.createEdge()
        this.physicsWorld.SetContactListener(this)
        this.currentTime = Date.now()
    }

    /**
     * 创建默认的材质
     */
    createDefaultFixtureDef(): b2.FixtureDef {
        const fixture = new b2.FixtureDef()
        fixture.density = nekoDensity
        fixture.friction = nekoFriction
        fixture.restitution = nekoFriction

        return fixture
    }

    /**
     * 创建边界刚体
     */
    createEdge() {
        // 创建刚体定义并设置刚体类型为“静态的”
        const bodyDef = new b2.BodyDef()
        bodyDef.type = b2.BodyType.b2_staticBody
        // 创建刚体并应用材质
        const body = this.physicsWorld.CreateBody(bodyDef)

        const shape = new b2.EdgeShape()
        // 创建左面边界
        shape.SetTwoSided(new b2.Vec2(0, 0), new b2.Vec2(0, 704))
        body.CreateFixture(shape, 0)
        // 创建底面边界
        shape.SetTwoSided(new b2.Vec2(0, 704), new b2.Vec2(1184, 704))
        body.CreateFixture(shape, 0)
        // 创建右面边界
        shape.SetTwoSided(new b2.Vec2(1184, 0), new b2.Vec2(1184, 704))
        body.CreateFixture(shape, 0)
    }

    /**
     * 创建圆形刚体
     */
    createCircleBody(radius: number, position: b2.Vec2): b2.Body {
        const fixture = this.createDefaultFixtureDef()
        fixture.density = nekoDensity / radius
        fixture.shape = new b2.CircleShape(radius)
        const bodyDef = new b2.BodyDef()

        bodyDef.gravityScale = 2
        bodyDef.linearDamping = 0.5
        bodyDef.angularDamping = 0.5
        bodyDef.type = b2.BodyType.b2_dynamicBody
        bodyDef.position.Set(position.x, position.y)

        const body = this.physicsWorld.CreateBody(bodyDef)
        body.CreateFixture(fixture)

        return body
    }

    /**
     * 将猫咪添加到世界中
     * 同时绑定一个刚体
     */
    add(neko: UINeko) {
        const body = this.createCircleBody(neko.size, new b2.Vec2(neko.x + neko.size, neko.y + neko.size))
        neko.body = body
        neko.body.m_fixtureList.m_userData = neko

        this.nekos.push(neko)
    }

    /**
     * 将猫咪从世界中移除
     * 并摧毁刚体
     */
    remove(neko: UINeko) {
        this.physicsWorld.DestroyBody(neko.body)
        neko.body = null

        ArrayUtils.remove(this.nekos, neko)
    }

    /**
     * 当猫咪碰撞时调用
     */
    BeginContact(contact: b2.Contact<b2.Shape, b2.Shape>): void {
        if (!(contact.m_fixtureA.m_userData instanceof UINeko)) {
            return
        }
        const it = contact.m_fixtureA.m_userData as UINeko
        const me = contact.m_fixtureB.m_userData as UINeko

        if (it.level === me.level) {
            this.shouldBeMergeA = it
            this.shouldBeMergeB = me
        }
    }

    /**
     * 清除所有猫咪
     */
    clearAll() {
        for (let index = 0; index < this.nekos.length; index++) {
            this.physicsWorld.DestroyBody(this.nekos[index].body)
        }
        this.nekos = []
    }

    /**
     * 执行模拟
     */
    step(self: ColidDetector) {
        const timeStep = 1 / 60

        if (Game.pause) {
            return
        }
        if (self.shouldBeMergeA && self.shouldBeMergeB) {
            GameUI.get(2).event(UINeko.EVENT_MERGED, { it: self.shouldBeMergeA, me: self.shouldBeMergeB })
            self.shouldBeMergeA = undefined
            self.shouldBeMergeB = undefined
        }

        self.nekos.forEach((it: UINeko) => {
            it.x = it.body.m_xf.p.x - it.size
            it.y = it.body.m_xf.p.y - it.size
        })
        self.physicsWorld.Step(1 / 60, 8, 3)
        self.physicsWorld.ClearForces()

        // 获取渲染时间
        let newTime = Date.now()
        let frameTime = Math.min(newTime - self.currentTime, 0.25)

        self.currentTime = newTime
        self.physicsWorld.Step(timeStep, 8, 3)
    }
}

/**
 * 每个等级比前一个等级增加的半径
 */
const sizecoefficient = 1.3
const worldSize: b2.Vec2 = new b2.Vec2(1184, 704)
const worldGravity: b2.Vec2 = new b2.Vec2(0, 100)
/**
 * 猫咪刚体的参数
 */
const nekoDensity = 100
const nekoFriction = 0.6
const nekoRestitution = 0.2

const colidDetector: ColidDetector = new ColidDetector()