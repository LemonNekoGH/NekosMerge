/**
 * Created by LemonNekoGC on 2021-07-27 17:31:44.
 */
class ColidDetector extends b2.ContactListener {
    /**
     * 物理世界
     */
    physicsWorld: b2World
    nekos: UINeko[] = []

    constructor() {
        super()
        this.physicsWorld = new b2.World(worldGravity)
        this.createEdge()
        this.physicsWorld.SetContactListener(this)
    }

    /**
     * 创建默认的材质
     */
    createDefaultFixtureDef(): b2FixtureDef {
        const fixture = new b2FixtureDef()
        fixture.density = nekoDensity
        fixture.friction = nekoFriction
        fixture.restitution = nekoFriction

        return fixture
    }

    /**
     * 创建边界刚体
     */
    createEdge() {
        // 创建材质
        const fixtureDef = this.createDefaultFixtureDef()
        {
            const shape = new b2EdgeShape()
            // 创建左面边界
            shape.SetTwoSided(new b2Vec2(0, 0), new b2Vec2(0, 704))
            // 创建底面边界
            shape.SetTwoSided(new b2Vec2(0, 704), new b2Vec2(1184, 704))
            // 创建右面边界
            shape.SetTwoSided(new b2Vec2(1184, 0), new b2Vec2(1184, 704))
            fixtureDef.shape = shape
        }
        // 创建刚体定义并设置刚体类型为“静态的”
        const bodyDef = new b2.BodyDef()
        bodyDef.type = b2.BodyType.b2_staticBody
        // 创建刚体并应用材质
        const body = this.physicsWorld.CreateBody(bodyDef)
        body.CreateFixture(fixtureDef)
    }

    /**
     * 创建圆形刚体
     */
    createCircleBody(radius: number, position: b2.Vec2): b2.Body {
        const fixture = this.createDefaultFixtureDef()
        fixture.shape = new b2.CircleShape(radius)
        const bodyDef = new b2.BodyDef()
        bodyDef.type = b2BodyType.b2_dynamicBody
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
        const body = this.createCircleBody(neko.size, new b2Vec2(neko.x, neko.y))
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

        this.nekos = ArrayUtils.remove(this.nekos, neko)
    }

    /**
     * 当猫咪碰撞时调用
     */
    BeginContact(contact: b2.Contact<b2.Shape, b2.Shape>): void {
        const it = contact.m_fixtureA.m_userData as UINeko
        const me = contact.m_fixtureA.m_userData as UINeko

        GCMain.guis.游戏中.event(UINeko.EVENT_MERGED, { it, me })
    }

    /**
     * 执行模拟
     */
    step() {
        this.nekos.forEach((it: UINeko) => {
            it.x = it.body.m_xf.p.x
            it.y = it.body.m_xf.p.y
        })
        this.physicsWorld.Step(1 / 60, 8 , 3)
    }
}

/**
 * 每个等级比前一个等级增加的半径
 */
const sizecoefficient = 1.3
const worldSize: b2.Vec2 = new b2.Vec2(1184, 704)
const worldGravity: b2.Vec2 = new b2.Vec2(0, 10)
/**
 * 猫咪刚体的参数
 */
const nekoDensity = 1
const nekoFriction = 1
const nekoRestitution = 1

const colidDetector: ColidDetector = new ColidDetector()