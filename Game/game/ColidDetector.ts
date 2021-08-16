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

    constructor() {
        super()
        this.physicsWorld = new b2.World(new b2.Vec2(0, WorldData.重力常量))
        this.createEdge()
        this.physicsWorld.SetContactListener(this)
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
        // 创建刚体定义并设置刚体类型为“静态的”
        const bodyDef = new b2.BodyDef()
        bodyDef.type = b2.BodyType.b2_staticBody
        // 创建刚体并应用材质
        const body = this.physicsWorld.CreateBody(bodyDef)

        const shape = new b2.EdgeShape()
        // 创建左面边界
        const groundLeftTop = new b2.Vec2(WorldData.猫咪容器左上角x值, WorldData.猫咪容器左上角y值)
        const groundLeftBottom = new b2.Vec2(WorldData.猫咪容器左上角x值, WorldData.猫咪容器左下角y值)
        const groundRightTop = new b2.Vec2(WorldData.猫咪容器右上角x值, WorldData.猫咪容器右上角y值)
        const groundRightBottom = new b2.Vec2(WorldData.猫咪容器右下角x值, WorldData.猫咪容器右下角y值)

        shape.SetTwoSided(groundLeftTop, groundLeftBottom)
        body.CreateFixture(shape, 0)
        // 创建底面边界
        shape.SetTwoSided(groundLeftBottom, groundRightBottom)
        body.CreateFixture(shape, 0)
        // 创建右面边界
        shape.SetTwoSided(groundRightTop, groundRightBottom)
        body.CreateFixture(shape, 0)
    }

    /**
     * 创建圆形刚体
     */
    createCircleBody(radius: number, position: b2.Vec2): b2.Body {
        const fixture = this.createDefaultFixtureDef()
        fixture.density = WorldData.物体质量 / radius
        fixture.shape = new b2.CircleShape(radius)
        const bodyDef = new b2.BodyDef()

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
        console.log(this.nekos.length)
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
            const body = this.nekos[index].body
            if (body) {
                this.physicsWorld.DestroyBody(this.nekos[index].body)
            }
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

        // 更新猫咪位置
        for (let index = 0; index < self.nekos.length; index++) {
            const it = self.nekos[index]
            // if (!it.body) {
            // continue
            // }
            it.x = it.body.m_xf.p.x - it.size
            it.y = it.body.m_xf.p.y - it.size
        }

        self.physicsWorld.Step(timeStep, 8, 3)
        self.physicsWorld.Step(timeStep, 8, 3)
    }
}

let colidDetector: ColidDetector = undefined