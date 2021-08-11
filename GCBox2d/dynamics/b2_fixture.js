var b2Filter = (function () {
    function b2Filter() {
        this.categoryBits = 0x0001;
        this.maskBits = 0xFFFF;
        this.groupIndex = 0;
    }
    b2Filter.prototype.Clone = function () {
        return new b2Filter().Copy(this);
    };
    b2Filter.prototype.Copy = function (other) {
        this.categoryBits = other.categoryBits;
        this.maskBits = other.maskBits;
        this.groupIndex = other.groupIndex || 0;
        return this;
    };
    b2Filter.DEFAULT = new b2Filter();
    return b2Filter;
}());
var b2FixtureDef = (function () {
    function b2FixtureDef() {
        this.userData = null;
        this.friction = 0.2;
        this.restitution = 0;
        this.restitutionThreshold = 1.0 * b2_lengthUnitsPerMeter;
        this.density = 0;
        this.isSensor = false;
        this.filter = new b2Filter();
    }
    return b2FixtureDef;
}());
var b2FixtureProxy = (function () {
    function b2FixtureProxy(fixture, childIndex) {
        this.aabb = new b2AABB();
        this.childIndex = 0;
        this.fixture = fixture;
        this.childIndex = childIndex;
        this.fixture.m_shape.ComputeAABB(this.aabb, this.fixture.m_body.GetTransform(), childIndex);
        this.treeNode = this.fixture.m_body.m_world.m_contactManager.m_broadPhase.CreateProxy(this.aabb, this);
    }
    b2FixtureProxy.prototype.Reset = function () {
        this.fixture.m_body.m_world.m_contactManager.m_broadPhase.DestroyProxy(this.treeNode);
    };
    b2FixtureProxy.prototype.Touch = function () {
        this.fixture.m_body.m_world.m_contactManager.m_broadPhase.TouchProxy(this.treeNode);
    };
    b2FixtureProxy.prototype.Synchronize = function (transform1, transform2) {
        if (transform1 === transform2) {
            this.fixture.m_shape.ComputeAABB(this.aabb, transform1, this.childIndex);
            this.fixture.m_body.m_world.m_contactManager.m_broadPhase.MoveProxy(this.treeNode, this.aabb, b2Vec2.ZERO);
        }
        else {
            var aabb1 = b2FixtureProxy.Synchronize_s_aabb1;
            var aabb2 = b2FixtureProxy.Synchronize_s_aabb2;
            this.fixture.m_shape.ComputeAABB(aabb1, transform1, this.childIndex);
            this.fixture.m_shape.ComputeAABB(aabb2, transform2, this.childIndex);
            this.aabb.Combine2(aabb1, aabb2);
            var displacement = b2FixtureProxy.Synchronize_s_displacement;
            displacement.Copy(aabb2.GetCenter()).SelfSub(aabb1.GetCenter());
            this.fixture.m_body.m_world.m_contactManager.m_broadPhase.MoveProxy(this.treeNode, this.aabb, displacement);
        }
    };
    b2FixtureProxy.Synchronize_s_aabb1 = new b2AABB();
    b2FixtureProxy.Synchronize_s_aabb2 = new b2AABB();
    b2FixtureProxy.Synchronize_s_displacement = new b2Vec2();
    return b2FixtureProxy;
}());
var b2Fixture = (function () {
    function b2Fixture(body, def) {
        this.m_density = 0;
        this.m_next = null;
        this.m_friction = 0;
        this.m_restitution = 0;
        this.m_restitutionThreshold = 1.0 * b2_lengthUnitsPerMeter;
        this.m_proxies = [];
        this.m_filter = new b2Filter();
        this.m_isSensor = false;
        this.m_userData = null;
        this.m_body = body;
        this.m_shape = def.shape.Clone();
        this.m_userData = b2Maybe(def.userData, null);
        this.m_friction = b2Maybe(def.friction, 0.2);
        this.m_restitution = b2Maybe(def.restitution, 0);
        this.m_restitutionThreshold = b2Maybe(def.restitutionThreshold, 0);
        this.m_filter.Copy(b2Maybe(def.filter, b2Filter.DEFAULT));
        this.m_isSensor = b2Maybe(def.isSensor, false);
        this.m_density = b2Maybe(def.density, 0);
    }
    Object.defineProperty(b2Fixture.prototype, "m_proxyCount", {
        get: function () { return this.m_proxies.length; },
        enumerable: true,
        configurable: true
    });
    b2Fixture.prototype.Reset = function () {
    };
    b2Fixture.prototype.GetType = function () {
        return this.m_shape.GetType();
    };
    b2Fixture.prototype.GetShape = function () {
        return this.m_shape;
    };
    b2Fixture.prototype.SetSensor = function (sensor) {
        if (sensor !== this.m_isSensor) {
            this.m_body.SetAwake(true);
            this.m_isSensor = sensor;
        }
    };
    b2Fixture.prototype.IsSensor = function () {
        return this.m_isSensor;
    };
    b2Fixture.prototype.SetFilterData = function (filter) {
        this.m_filter.Copy(filter);
        this.Refilter();
    };
    return b2Fixture;
}());
return this.m_filter;
Refilter();
void {
    let: edge = this.m_body.GetContactList(),
    while: function (edge) {
        var contact = edge.contact;
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        if (fixtureA === this || fixtureB === this) {
            contact.FlagForFiltering();
        }
        edge = edge.next;
    },
    this: .TouchProxies()
};
GetBody();
b2Body;
{
    return this.m_body;
}
GetNext();
b2Fixture;
{
    return this.m_next;
}
GetUserData();
any;
{
    return this.m_userData;
}
SetUserData(data, any);
void {
    this: .m_userData = data
};
TestPoint(p, XY);
boolean;
{
    return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
}
ComputeDistance(p, b2Vec2, normal, b2Vec2, childIndex, number);
number;
{
    return this.m_shape.ComputeDistance(this.m_body.GetTransform(), p, normal, childIndex);
}
RayCast(output, b2RayCastOutput, input, b2RayCastInput, childIndex, number);
boolean;
{
    return this.m_shape.RayCast(output, input, this.m_body.GetTransform(), childIndex);
}
GetMassData(massData, b2MassData = new b2MassData());
b2MassData;
{
    this.m_shape.ComputeMass(massData, this.m_density);
    return massData;
}
SetDensity(density, number);
void {
    this: .m_density = density
};
GetDensity();
number;
{
    return this.m_density;
}
GetFriction();
number;
{
    return this.m_friction;
}
SetFriction(friction, number);
void {
    this: .m_friction = friction
};
GetRestitution();
number;
{
    return this.m_restitution;
}
SetRestitution(restitution, number);
void {
    this: .m_restitution = restitution
};
GetRestitutionThreshold();
number;
{
    return this.m_restitutionThreshold;
}
SetRestitutionThreshold(threshold, number);
void {
    this: .m_restitutionThreshold = threshold
};
GetAABB(childIndex, number);
{
    return: this.m_proxies[childIndex].aabb
};
Dump(log, function (format) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return void ;
}, bodyIndex, number);
void {
    log: function () { }, "    const fd: b2FixtureDef = new b2FixtureDef();\n": ,
    log: function () { }, "    fd.friction = %.15f;\n": , this: .m_friction,
    log: function () { }, "    fd.restitution = %.15f;\n": , this: .m_restitution,
    log: function () { }, "    fd.restitutionThreshold = %.15f;\n": , this: .m_restitutionThreshold,
    log: function () { }, "    fd.density = %.15f;\n": , this: .m_density,
    log: function () { }, "    fd.isSensor = %s;\n": , }(this.m_isSensor) ? ("true") : ("false");
;
log("    fd.filter.categoryBits = %d;\n", this.m_filter.categoryBits);
log("    fd.filter.maskBits = %d;\n", this.m_filter.maskBits);
log("    fd.filter.groupIndex = %d;\n", this.m_filter.groupIndex);
this.m_shape.Dump(log);
log("\n");
log("    fd.shape = shape;\n");
log("\n");
log("    bodies[%d].CreateFixture(fd);\n", bodyIndex);
CreateProxies();
void {
    if: function () { }, this: .m_proxies.length !== 0 };
{
    throw new Error();
}
for (var i = 0; i < this.m_shape.GetChildCount(); ++i) {
    this.m_proxies[i] = new b2FixtureProxy(this, i);
}
DestroyProxies();
void {
    for: function (, of) {
        if ( === void 0) {  = proxy; }
        if (of === void 0) { of = this.m_proxies; }
        proxy.Reset();
    },
    this: .m_proxies.length = 0
};
TouchProxies();
void {
    for: function (, of) {
        if ( === void 0) {  = proxy; }
        if (of === void 0) { of = this.m_proxies; }
        proxy.Touch();
    }
};
SynchronizeProxies(transform1, b2Transform, transform2, b2Transform);
void {
    for: function (, of) {
        if ( === void 0) {  = proxy; }
        if (of === void 0) { of = this.m_proxies; }
        proxy.Synchronize(transform1, transform2);
    }
};
//# sourceMappingURL=b2_fixture.js.map