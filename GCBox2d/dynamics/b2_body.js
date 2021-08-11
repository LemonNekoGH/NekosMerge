var b2BodyType;
(function (b2BodyType) {
    b2BodyType[b2BodyType["b2_unknown"] = -1] = "b2_unknown";
    b2BodyType[b2BodyType["b2_staticBody"] = 0] = "b2_staticBody";
    b2BodyType[b2BodyType["b2_kinematicBody"] = 1] = "b2_kinematicBody";
    b2BodyType[b2BodyType["b2_dynamicBody"] = 2] = "b2_dynamicBody";
})(b2BodyType || (b2BodyType = {}));
var b2BodyDef = (function () {
    function b2BodyDef() {
        this.type = b2BodyType.b2_staticBody;
        this.position = new b2Vec2(0, 0);
        this.angle = 0;
        this.linearVelocity = new b2Vec2(0, 0);
        this.angularVelocity = 0;
        this.linearDamping = 0;
        this.angularDamping = 0;
        this.allowSleep = true;
        this.awake = true;
        this.fixedRotation = false;
        this.bullet = false;
        this.enabled = true;
        this.userData = null;
        this.gravityScale = 1;
    }
    return b2BodyDef;
}());
var b2Body = (function () {
    function b2Body(bd, world) {
        this.m_type = b2BodyType.b2_staticBody;
        this.m_islandFlag = false;
        this.m_awakeFlag = false;
        this.m_autoSleepFlag = false;
        this.m_bulletFlag = false;
        this.m_fixedRotationFlag = false;
        this.m_enabledFlag = false;
        this.m_toiFlag = false;
        this.m_islandIndex = 0;
        this.m_xf = new b2Transform();
        this.m_xf0 = new b2Transform();
        this.m_sweep = new b2Sweep();
        this.m_linearVelocity = new b2Vec2();
        this.m_angularVelocity = 0;
        this.m_force = new b2Vec2();
        this.m_torque = 0;
        this.m_prev = null;
        this.m_next = null;
        this.m_fixtureList = null;
        this.m_fixtureCount = 0;
        this.m_jointList = null;
        this.m_contactList = null;
        this.m_mass = 1;
        this.m_invMass = 1;
        this.m_I = 0;
        this.m_invI = 0;
        this.m_linearDamping = 0;
        this.m_angularDamping = 0;
        this.m_gravityScale = 1;
        this.m_sleepTime = 0;
        this.m_userData = null;
        this.m_controllerList = null;
        this.m_controllerCount = 0;
        this.m_bulletFlag = b2Maybe(bd.bullet, false);
        this.m_fixedRotationFlag = b2Maybe(bd.fixedRotation, false);
        this.m_autoSleepFlag = b2Maybe(bd.allowSleep, true);
        if (b2Maybe(bd.awake, false) && b2Maybe(bd.type, b2BodyType.b2_staticBody) !== b2BodyType.b2_staticBody) {
            this.m_awakeFlag = true;
        }
        this.m_enabledFlag = b2Maybe(bd.enabled, true);
        this.m_world = world;
        this.m_xf.p.Copy(b2Maybe(bd.position, b2Vec2.ZERO));
        this.m_xf.q.SetAngle(b2Maybe(bd.angle, 0));
        this.m_xf0.Copy(this.m_xf);
        this.m_sweep.localCenter.SetZero();
        this.m_sweep.c0.Copy(this.m_xf.p);
        this.m_sweep.c.Copy(this.m_xf.p);
        this.m_sweep.a0 = this.m_sweep.a = this.m_xf.q.GetAngle();
        this.m_sweep.alpha0 = 0;
        this.m_linearVelocity.Copy(b2Maybe(bd.linearVelocity, b2Vec2.ZERO));
        this.m_angularVelocity = b2Maybe(bd.angularVelocity, 0);
        this.m_linearDamping = b2Maybe(bd.linearDamping, 0);
        this.m_angularDamping = b2Maybe(bd.angularDamping, 0);
        this.m_gravityScale = b2Maybe(bd.gravityScale, 1);
        this.m_force.SetZero();
        this.m_torque = 0;
        this.m_sleepTime = 0;
        this.m_type = b2Maybe(bd.type, b2BodyType.b2_staticBody);
        this.m_mass = 0;
        this.m_invMass = 0;
        this.m_I = 0;
        this.m_invI = 0;
        this.m_userData = bd.userData;
        this.m_fixtureList = null;
        this.m_fixtureCount = 0;
        this.m_controllerList = null;
        this.m_controllerCount = 0;
    }
    b2Body.prototype.CreateFixture = function (a, b) {
        if (b === void 0) { b = 0; }
        if (a instanceof b2Shape) {
            return this.CreateFixtureShapeDensity(a, b);
        }
        else {
            return this.CreateFixtureDef(a);
        }
    };
    b2Body.prototype.CreateFixtureDef = function (def) {
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        var fixture = new b2Fixture(this, def);
        if (this.m_enabledFlag) {
            fixture.CreateProxies();
        }
        fixture.m_next = this.m_fixtureList;
        this.m_fixtureList = fixture;
        ++this.m_fixtureCount;
        if (fixture.m_density > 0) {
            this.ResetMassData();
        }
        this.m_world.m_newContacts = true;
        return fixture;
    };
    b2Body.prototype.CreateFixtureShapeDensity = function (shape, density) {
        if (density === void 0) { density = 0; }
        var def = b2Body.CreateFixtureShapeDensity_s_def;
        def.shape = shape;
        def.density = density;
        return this.CreateFixtureDef(def);
    };
    b2Body.prototype.DestroyFixture = function (fixture) {
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        var node = this.m_fixtureList;
        var ppF = null;
        while (node !== null) {
            if (node === fixture) {
                if (ppF) {
                    ppF.m_next = fixture.m_next;
                }
                else {
                    this.m_fixtureList = fixture.m_next;
                }
                break;
            }
            ppF = node;
            node = node.m_next;
        }
        var edge = this.m_contactList;
        while (edge) {
            var c = edge.contact;
            edge = edge.next;
            var fixtureA = c.GetFixtureA();
            var fixtureB = c.GetFixtureB();
            if (fixture === fixtureA || fixture === fixtureB) {
                this.m_world.m_contactManager.Destroy(c);
            }
        }
        if (this.m_enabledFlag) {
            fixture.DestroyProxies();
        }
        fixture.m_next = null;
        fixture.Reset();
        --this.m_fixtureCount;
        this.ResetMassData();
    };
    b2Body.prototype.SetTransformVec = function (position, angle) {
        this.SetTransformXY(position.x, position.y, angle);
    };
    b2Body.prototype.SetTransformXY = function (x, y, angle) {
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        this.m_xf.q.SetAngle(angle);
        this.m_xf.p.Set(x, y);
        this.m_xf0.Copy(this.m_xf);
        b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
        this.m_sweep.a = angle;
        this.m_sweep.c0.Copy(this.m_sweep.c);
        this.m_sweep.a0 = angle;
        for (var f = this.m_fixtureList; f; f = f.m_next) {
            f.SynchronizeProxies(this.m_xf, this.m_xf);
        }
        this.m_world.m_newContacts = true;
    };
    b2Body.prototype.SetTransform = function (xf) {
        this.SetTransformVec(xf.p, xf.GetAngle());
    };
    b2Body.prototype.GetTransform = function () {
        return this.m_xf;
    };
    b2Body.prototype.GetPosition = function () {
        return this.m_xf.p;
    };
    b2Body.prototype.SetPosition = function (position) {
        this.SetTransformVec(position, this.GetAngle());
    };
    b2Body.prototype.SetPositionXY = function (x, y) {
        this.SetTransformXY(x, y, this.GetAngle());
    };
    b2Body.prototype.GetAngle = function () {
        return this.m_sweep.a;
    };
    b2Body.prototype.SetAngle = function (angle) {
        this.SetTransformVec(this.GetPosition(), angle);
    };
    b2Body.prototype.GetWorldCenter = function () {
        return this.m_sweep.c;
    };
    b2Body.prototype.GetLocalCenter = function () {
        return this.m_sweep.localCenter;
    };
    b2Body.prototype.SetLinearVelocity = function (v) {
        if (this.m_type === b2BodyType.b2_staticBody) {
            return;
        }
        if (b2Vec2.DotVV(v, v) > 0) {
            this.SetAwake(true);
        }
        this.m_linearVelocity.Copy(v);
    };
    b2Body.prototype.GetLinearVelocity = function () {
        return this.m_linearVelocity;
    };
    b2Body.prototype.SetAngularVelocity = function (w) {
        if (this.m_type === b2BodyType.b2_staticBody) {
            return;
        }
        if (w * w > 0) {
            this.SetAwake(true);
        }
        this.m_angularVelocity = w;
    };
    b2Body.prototype.GetAngularVelocity = function () {
        return this.m_angularVelocity;
    };
    b2Body.prototype.GetDefinition = function (bd) {
        bd.type = this.GetType();
        bd.allowSleep = this.m_autoSleepFlag;
        bd.angle = this.GetAngle();
        bd.angularDamping = this.m_angularDamping;
        bd.gravityScale = this.m_gravityScale;
        bd.angularVelocity = this.m_angularVelocity;
        bd.fixedRotation = this.m_fixedRotationFlag;
        bd.bullet = this.m_bulletFlag;
        bd.awake = this.m_awakeFlag;
        bd.linearDamping = this.m_linearDamping;
        bd.linearVelocity.Copy(this.GetLinearVelocity());
        bd.position.Copy(this.GetPosition());
        bd.userData = this.GetUserData();
        return bd;
    };
    b2Body.prototype.ApplyForce = function (force, point, wake) {
        if (wake === void 0) { wake = true; }
        if (this.m_type !== b2BodyType.b2_dynamicBody) {
            return;
        }
        if (wake && !this.m_awakeFlag) {
            this.SetAwake(true);
        }
        if (this.m_awakeFlag) {
            this.m_force.x += force.x;
            this.m_force.y += force.y;
            this.m_torque += ((point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x);
        }
    };
    b2Body.prototype.ApplyForceToCenter = function (force, wake) {
        if (wake === void 0) { wake = true; }
        if (this.m_type !== b2BodyType.b2_dynamicBody) {
            return;
        }
        if (wake && !this.m_awakeFlag) {
            this.SetAwake(true);
        }
        if (this.m_awakeFlag) {
            this.m_force.x += force.x;
            this.m_force.y += force.y;
        }
    };
    b2Body.prototype.ApplyTorque = function (torque, wake) {
        if (wake === void 0) { wake = true; }
        if (this.m_type !== b2BodyType.b2_dynamicBody) {
            return;
        }
        if (wake && !this.m_awakeFlag) {
            this.SetAwake(true);
        }
        if (this.m_awakeFlag) {
            this.m_torque += torque;
        }
    };
    b2Body.prototype.ApplyLinearImpulse = function (impulse, point, wake) {
        if (wake === void 0) { wake = true; }
        if (this.m_type !== b2BodyType.b2_dynamicBody) {
            return;
        }
        if (wake && !this.m_awakeFlag) {
            this.SetAwake(true);
        }
        if (this.m_awakeFlag) {
            this.m_linearVelocity.x += this.m_invMass * impulse.x;
            this.m_linearVelocity.y += this.m_invMass * impulse.y;
            this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x);
        }
    };
    b2Body.prototype.ApplyLinearImpulseToCenter = function (impulse, wake) {
        if (wake === void 0) { wake = true; }
        if (this.m_type !== b2BodyType.b2_dynamicBody) {
            return;
        }
        if (wake && !this.m_awakeFlag) {
            this.SetAwake(true);
        }
        if (this.m_awakeFlag) {
            this.m_linearVelocity.x += this.m_invMass * impulse.x;
            this.m_linearVelocity.y += this.m_invMass * impulse.y;
        }
    };
    b2Body.prototype.ApplyAngularImpulse = function (impulse, wake) {
        if (wake === void 0) { wake = true; }
        if (this.m_type !== b2BodyType.b2_dynamicBody) {
            return;
        }
        if (wake && !this.m_awakeFlag) {
            this.SetAwake(true);
        }
        if (this.m_awakeFlag) {
            this.m_angularVelocity += this.m_invI * impulse;
        }
    };
    b2Body.prototype.GetMass = function () {
        return this.m_mass;
    };
    b2Body.prototype.GetInertia = function () {
        return this.m_I + this.m_mass * b2Vec2.DotVV(this.m_sweep.localCenter, this.m_sweep.localCenter);
    };
    b2Body.prototype.GetMassData = function (data) {
        data.mass = this.m_mass;
        data.I = this.m_I + this.m_mass * b2Vec2.DotVV(this.m_sweep.localCenter, this.m_sweep.localCenter);
        data.center.Copy(this.m_sweep.localCenter);
        return data;
    };
    b2Body.prototype.SetMassData = function (massData) {
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        if (this.m_type !== b2BodyType.b2_dynamicBody) {
            return;
        }
        this.m_invMass = 0;
        this.m_I = 0;
        this.m_invI = 0;
        this.m_mass = massData.mass;
        if (this.m_mass <= 0) {
            this.m_mass = 1;
        }
        this.m_invMass = 1 / this.m_mass;
        if (massData.I > 0 && !this.m_fixedRotationFlag) {
            this.m_I = massData.I - this.m_mass * b2Vec2.DotVV(massData.center, massData.center);
            this.m_invI = 1 / this.m_I;
        }
        var oldCenter = b2Body.SetMassData_s_oldCenter.Copy(this.m_sweep.c);
        this.m_sweep.localCenter.Copy(massData.center);
        b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
        this.m_sweep.c0.Copy(this.m_sweep.c);
        b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(this.m_sweep.c, oldCenter, b2Vec2.s_t0), this.m_linearVelocity);
    };
    b2Body.prototype.ResetMassData = function () {
        this.m_mass = 0;
        this.m_invMass = 0;
        this.m_I = 0;
        this.m_invI = 0;
        this.m_sweep.localCenter.SetZero();
        if (this.m_type === b2BodyType.b2_staticBody || this.m_type === b2BodyType.b2_kinematicBody) {
            this.m_sweep.c0.Copy(this.m_xf.p);
            this.m_sweep.c.Copy(this.m_xf.p);
            this.m_sweep.a0 = this.m_sweep.a;
            return;
        }
        var localCenter = b2Body.ResetMassData_s_localCenter.SetZero();
        for (var f = this.m_fixtureList; f; f = f.m_next) {
            if (f.m_density === 0) {
                continue;
            }
            var massData = f.GetMassData(b2Body.ResetMassData_s_massData);
            this.m_mass += massData.mass;
            localCenter.x += massData.center.x * massData.mass;
            localCenter.y += massData.center.y * massData.mass;
            this.m_I += massData.I;
        }
        if (this.m_mass > 0) {
            this.m_invMass = 1 / this.m_mass;
            localCenter.x *= this.m_invMass;
            localCenter.y *= this.m_invMass;
        }
        if (this.m_I > 0 && !this.m_fixedRotationFlag) {
            this.m_I -= this.m_mass * b2Vec2.DotVV(localCenter, localCenter);
            this.m_invI = 1 / this.m_I;
        }
        else {
            this.m_I = 0;
            this.m_invI = 0;
        }
        var oldCenter = b2Body.ResetMassData_s_oldCenter.Copy(this.m_sweep.c);
        this.m_sweep.localCenter.Copy(localCenter);
        b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
        this.m_sweep.c0.Copy(this.m_sweep.c);
        b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(this.m_sweep.c, oldCenter, b2Vec2.s_t0), this.m_linearVelocity);
    };
    b2Body.prototype.GetWorldPoint = function (localPoint, out) {
        return b2Transform.MulXV(this.m_xf, localPoint, out);
    };
    b2Body.prototype.GetWorldVector = function (localVector, out) {
        return b2Rot.MulRV(this.m_xf.q, localVector, out);
    };
    b2Body.prototype.GetLocalPoint = function (worldPoint, out) {
        return b2Transform.MulTXV(this.m_xf, worldPoint, out);
    };
    b2Body.prototype.GetLocalVector = function (worldVector, out) {
        return b2Rot.MulTRV(this.m_xf.q, worldVector, out);
    };
    b2Body.prototype.GetLinearVelocityFromWorldPoint = function (worldPoint, out) {
        return b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(worldPoint, this.m_sweep.c, b2Vec2.s_t0), out);
    };
    b2Body.prototype.GetLinearVelocityFromLocalPoint = function (localPoint, out) {
        return this.GetLinearVelocityFromWorldPoint(this.GetWorldPoint(localPoint, out), out);
    };
    b2Body.prototype.GetLinearDamping = function () {
        return this.m_linearDamping;
    };
    b2Body.prototype.SetLinearDamping = function (linearDamping) {
        this.m_linearDamping = linearDamping;
    };
    b2Body.prototype.GetAngularDamping = function () {
        return this.m_angularDamping;
    };
    b2Body.prototype.SetAngularDamping = function (angularDamping) {
        this.m_angularDamping = angularDamping;
    };
    b2Body.prototype.GetGravityScale = function () {
        return this.m_gravityScale;
    };
    b2Body.prototype.SetGravityScale = function (scale) {
        this.m_gravityScale = scale;
    };
    b2Body.prototype.SetType = function (type) {
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        if (this.m_type === type) {
            return;
        }
        this.m_type = type;
        this.ResetMassData();
        if (this.m_type === b2BodyType.b2_staticBody) {
            this.m_linearVelocity.SetZero();
            this.m_angularVelocity = 0;
            this.m_sweep.a0 = this.m_sweep.a;
            this.m_sweep.c0.Copy(this.m_sweep.c);
            this.m_awakeFlag = false;
            this.SynchronizeFixtures();
        }
        this.SetAwake(true);
        this.m_force.SetZero();
        this.m_torque = 0;
        var ce = this.m_contactList;
        while (ce) {
            var ce0 = ce;
            ce = ce.next;
            this.m_world.m_contactManager.Destroy(ce0.contact);
        }
        this.m_contactList = null;
        for (var f = this.m_fixtureList; f; f = f.m_next) {
            f.TouchProxies();
        }
    };
    b2Body.prototype.GetType = function () {
        return this.m_type;
    };
    b2Body.prototype.SetBullet = function (flag) {
        this.m_bulletFlag = flag;
    };
    b2Body.prototype.IsBullet = function () {
        return this.m_bulletFlag;
    };
    b2Body.prototype.SetSleepingAllowed = function (flag) {
        this.m_autoSleepFlag = flag;
        if (!flag) {
            this.SetAwake(true);
        }
    };
    b2Body.prototype.IsSleepingAllowed = function () {
        return this.m_autoSleepFlag;
    };
    b2Body.prototype.SetAwake = function (flag) {
        if (this.m_type === b2BodyType.b2_staticBody) {
            return;
        }
        if (flag) {
            this.m_awakeFlag = true;
            this.m_sleepTime = 0;
        }
        else {
            this.m_awakeFlag = false;
            this.m_sleepTime = 0;
            this.m_linearVelocity.SetZero();
            this.m_angularVelocity = 0;
            this.m_force.SetZero();
            this.m_torque = 0;
        }
    };
    b2Body.prototype.IsAwake = function () {
        return this.m_awakeFlag;
    };
    b2Body.prototype.SetEnabled = function (flag) {
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        if (flag === this.IsEnabled()) {
            return;
        }
        this.m_enabledFlag = flag;
        if (flag) {
            for (var f = this.m_fixtureList; f; f = f.m_next) {
                f.CreateProxies();
            }
            this.m_world.m_newContacts = true;
        }
        else {
            for (var f = this.m_fixtureList; f; f = f.m_next) {
                f.DestroyProxies();
            }
            var ce = this.m_contactList;
            while (ce) {
                var ce0 = ce;
                ce = ce.next;
                this.m_world.m_contactManager.Destroy(ce0.contact);
            }
            this.m_contactList = null;
        }
    };
    b2Body.prototype.IsEnabled = function () {
        return this.m_enabledFlag;
    };
    b2Body.prototype.SetFixedRotation = function (flag) {
        if (this.m_fixedRotationFlag === flag) {
            return;
        }
        this.m_fixedRotationFlag = flag;
        this.m_angularVelocity = 0;
        this.ResetMassData();
    };
    b2Body.prototype.IsFixedRotation = function () {
        return this.m_fixedRotationFlag;
    };
    b2Body.prototype.GetFixtureList = function () {
        return this.m_fixtureList;
    };
    b2Body.prototype.GetJointList = function () {
        return this.m_jointList;
    };
    b2Body.prototype.GetContactList = function () {
        return this.m_contactList;
    };
    b2Body.prototype.GetNext = function () {
        return this.m_next;
    };
    b2Body.prototype.GetUserData = function () {
        return this.m_userData;
    };
    b2Body.prototype.SetUserData = function (data) {
        this.m_userData = data;
    };
    b2Body.prototype.GetWorld = function () {
        return this.m_world;
    };
    b2Body.prototype.Dump = function (log) {
        var bodyIndex = this.m_islandIndex;
        log("{\n");
        log("  const bd: b2BodyDef = new b2BodyDef();\n");
        var type_str = "";
        switch (this.m_type) {
            case b2BodyType.b2_staticBody:
                type_str = "b2BodyType.b2_staticBody";
                break;
            case b2BodyType.b2_kinematicBody:
                type_str = "b2BodyType.b2_kinematicBody";
                break;
            case b2BodyType.b2_dynamicBody:
                type_str = "b2BodyType.b2_dynamicBody";
                break;
            default:
                break;
        }
        log("  bd.type = %s;\n", type_str);
        log("  bd.position.Set(%.15f, %.15f);\n", this.m_xf.p.x, this.m_xf.p.y);
        log("  bd.angle = %.15f;\n", this.m_sweep.a);
        log("  bd.linearVelocity.Set(%.15f, %.15f);\n", this.m_linearVelocity.x, this.m_linearVelocity.y);
        log("  bd.angularVelocity = %.15f;\n", this.m_angularVelocity);
        log("  bd.linearDamping = %.15f;\n", this.m_linearDamping);
        log("  bd.angularDamping = %.15f;\n", this.m_angularDamping);
        log("  bd.allowSleep = %s;\n", (this.m_autoSleepFlag) ? ("true") : ("false"));
        log("  bd.awake = %s;\n", (this.m_awakeFlag) ? ("true") : ("false"));
        log("  bd.fixedRotation = %s;\n", (this.m_fixedRotationFlag) ? ("true") : ("false"));
        log("  bd.bullet = %s;\n", (this.m_bulletFlag) ? ("true") : ("false"));
        log("  bd.active = %s;\n", (this.m_enabledFlag) ? ("true") : ("false"));
        log("  bd.gravityScale = %.15f;\n", this.m_gravityScale);
        log("\n");
        log("  bodies[%d] = this.m_world.CreateBody(bd);\n", this.m_islandIndex);
        log("\n");
        for (var f = this.m_fixtureList; f; f = f.m_next) {
            log("  {\n");
            f.Dump(log, bodyIndex);
            log("  }\n");
        }
        log("}\n");
    };
    b2Body.prototype.SynchronizeFixtures = function () {
        if (this.m_awakeFlag) {
            var xf1 = b2Body.SynchronizeFixtures_s_xf1;
            xf1.q.SetAngle(this.m_sweep.a0);
            b2Rot.MulRV(xf1.q, this.m_sweep.localCenter, xf1.p);
            b2Vec2.SubVV(this.m_sweep.c0, xf1.p, xf1.p);
            for (var f = this.m_fixtureList; f; f = f.m_next) {
                f.SynchronizeProxies(xf1, this.m_xf);
            }
        }
        else {
            for (var f = this.m_fixtureList; f; f = f.m_next) {
                f.SynchronizeProxies(this.m_xf, this.m_xf);
            }
        }
    };
    b2Body.prototype.SynchronizeTransform = function () {
        this.m_xf.q.SetAngle(this.m_sweep.a);
        b2Rot.MulRV(this.m_xf.q, this.m_sweep.localCenter, this.m_xf.p);
        b2Vec2.SubVV(this.m_sweep.c, this.m_xf.p, this.m_xf.p);
    };
    b2Body.prototype.ShouldCollide = function (other) {
        if (this.m_type === b2BodyType.b2_staticBody && other.m_type === b2BodyType.b2_staticBody) {
            return false;
        }
        return this.ShouldCollideConnected(other);
    };
    b2Body.prototype.ShouldCollideConnected = function (other) {
        for (var jn = this.m_jointList; jn; jn = jn.next) {
            if (jn.other === other) {
                if (!jn.joint.m_collideConnected) {
                    return false;
                }
            }
        }
        return true;
    };
    b2Body.prototype.Advance = function (alpha) {
        this.m_sweep.Advance(alpha);
        this.m_sweep.c.Copy(this.m_sweep.c0);
        this.m_sweep.a = this.m_sweep.a0;
        this.m_xf.q.SetAngle(this.m_sweep.a);
        b2Rot.MulRV(this.m_xf.q, this.m_sweep.localCenter, this.m_xf.p);
        b2Vec2.SubVV(this.m_sweep.c, this.m_xf.p, this.m_xf.p);
    };
    b2Body.prototype.GetControllerList = function () {
        return this.m_controllerList;
    };
    b2Body.prototype.GetControllerCount = function () {
        return this.m_controllerCount;
    };
    b2Body.CreateFixtureShapeDensity_s_def = new b2FixtureDef();
    b2Body.SetMassData_s_oldCenter = new b2Vec2();
    b2Body.ResetMassData_s_localCenter = new b2Vec2();
    b2Body.ResetMassData_s_oldCenter = new b2Vec2();
    b2Body.ResetMassData_s_massData = new b2MassData();
    b2Body.SynchronizeFixtures_s_xf1 = new b2Transform();
    return b2Body;
}());
//# sourceMappingURL=b2_body.js.map