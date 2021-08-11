var b2World = (function () {
    function b2World(gravity) {
        this.m_contactManager = new b2ContactManager();
        this.m_bodyList = null;
        this.m_jointList = null;
        this.m_particleSystemList = null;
        this.m_bodyCount = 0;
        this.m_jointCount = 0;
        this.m_gravity = new b2Vec2();
        this.m_allowSleep = true;
        this.m_destructionListener = null;
        this.m_debugDraw = null;
        this.m_inv_dt0 = 0;
        this.m_newContacts = false;
        this.m_locked = false;
        this.m_clearForces = true;
        this.m_warmStarting = true;
        this.m_continuousPhysics = true;
        this.m_subStepping = false;
        this.m_stepComplete = true;
        this.m_profile = new b2Profile();
        this.m_island = new b2Island();
        this.s_stack = [];
        this.m_controllerList = null;
        this.m_controllerCount = 0;
        this.m_gravity.Copy(gravity);
    }
    b2World.prototype.SetDestructionListener = function (listener) {
        this.m_destructionListener = listener;
    };
    b2World.prototype.SetContactFilter = function (filter) {
        this.m_contactManager.m_contactFilter = filter;
    };
    b2World.prototype.SetContactListener = function (listener) {
        this.m_contactManager.m_contactListener = listener;
    };
    b2World.prototype.SetDebugDraw = function (debugDraw) {
        this.m_debugDraw = debugDraw;
    };
    b2World.prototype.CreateBody = function (def) {
        if (def === void 0) { def = {}; }
        if (this.IsLocked()) {
            throw new Error();
        }
        var b = new b2Body(def, this);
        b.m_prev = null;
        b.m_next = this.m_bodyList;
        if (this.m_bodyList) {
            this.m_bodyList.m_prev = b;
        }
        this.m_bodyList = b;
        ++this.m_bodyCount;
        return b;
    };
    b2World.prototype.DestroyBody = function (b) {
        if (this.IsLocked()) {
            throw new Error();
        }
        var je = b.m_jointList;
        while (je) {
            var je0 = je;
            je = je.next;
            if (this.m_destructionListener) {
                this.m_destructionListener.SayGoodbyeJoint(je0.joint);
            }
            this.DestroyJoint(je0.joint);
            b.m_jointList = je;
        }
        b.m_jointList = null;
        var coe = b.m_controllerList;
        while (coe) {
            var coe0 = coe;
            coe = coe.nextController;
            coe0.controller.RemoveBody(b);
        }
        var ce = b.m_contactList;
        while (ce) {
            var ce0 = ce;
            ce = ce.next;
            this.m_contactManager.Destroy(ce0.contact);
        }
        b.m_contactList = null;
        var f = b.m_fixtureList;
        while (f) {
            var f0 = f;
            f = f.m_next;
            if (this.m_destructionListener) {
                this.m_destructionListener.SayGoodbyeFixture(f0);
            }
            f0.DestroyProxies();
            f0.Reset();
            b.m_fixtureList = f;
            b.m_fixtureCount -= 1;
        }
        b.m_fixtureList = null;
        b.m_fixtureCount = 0;
        if (b.m_prev) {
            b.m_prev.m_next = b.m_next;
        }
        if (b.m_next) {
            b.m_next.m_prev = b.m_prev;
        }
        if (b === this.m_bodyList) {
            this.m_bodyList = b.m_next;
        }
        --this.m_bodyCount;
    };
    b2World._Joint_Create = function (def) {
        switch (def.type) {
            case b2JointType.e_distanceJoint: return new b2DistanceJoint(def);
            case b2JointType.e_mouseJoint: return new b2MouseJoint(def);
            case b2JointType.e_prismaticJoint: return new b2PrismaticJoint(def);
            case b2JointType.e_revoluteJoint: return new b2RevoluteJoint(def);
            case b2JointType.e_pulleyJoint: return new b2PulleyJoint(def);
            case b2JointType.e_gearJoint: return new b2GearJoint(def);
            case b2JointType.e_wheelJoint: return new b2WheelJoint(def);
            case b2JointType.e_weldJoint: return new b2WeldJoint(def);
            case b2JointType.e_frictionJoint: return new b2FrictionJoint(def);
            case b2JointType.e_motorJoint: return new b2MotorJoint(def);
            case b2JointType.e_areaJoint: return new b2AreaJoint(def);
        }
        throw new Error();
    };
    b2World._Joint_Destroy = function (joint) {
    };
    b2World.prototype.CreateJoint = function (def) {
        if (this.IsLocked()) {
            throw new Error();
        }
        var j = b2World._Joint_Create(def);
        j.m_prev = null;
        j.m_next = this.m_jointList;
        if (this.m_jointList) {
            this.m_jointList.m_prev = j;
        }
        this.m_jointList = j;
        ++this.m_jointCount;
        j.m_edgeA.prev = null;
        j.m_edgeA.next = j.m_bodyA.m_jointList;
        if (j.m_bodyA.m_jointList) {
            j.m_bodyA.m_jointList.prev = j.m_edgeA;
        }
        j.m_bodyA.m_jointList = j.m_edgeA;
        j.m_edgeB.prev = null;
        j.m_edgeB.next = j.m_bodyB.m_jointList;
        if (j.m_bodyB.m_jointList) {
            j.m_bodyB.m_jointList.prev = j.m_edgeB;
        }
        j.m_bodyB.m_jointList = j.m_edgeB;
        var bodyA = j.m_bodyA;
        var bodyB = j.m_bodyB;
        var collideConnected = j.m_collideConnected;
        if (!collideConnected) {
            var edge = bodyB.GetContactList();
            while (edge) {
                if (edge.other === bodyA) {
                    edge.contact.FlagForFiltering();
                }
                edge = edge.next;
            }
        }
        return j;
    };
    b2World.prototype.DestroyJoint = function (j) {
        if (this.IsLocked()) {
            throw new Error();
        }
        if (j.m_prev) {
            j.m_prev.m_next = j.m_next;
        }
        if (j.m_next) {
            j.m_next.m_prev = j.m_prev;
        }
        if (j === this.m_jointList) {
            this.m_jointList = j.m_next;
        }
        var bodyA = j.m_bodyA;
        var bodyB = j.m_bodyB;
        var collideConnected = j.m_collideConnected;
        bodyA.SetAwake(true);
        bodyB.SetAwake(true);
        if (j.m_edgeA.prev) {
            j.m_edgeA.prev.next = j.m_edgeA.next;
        }
        if (j.m_edgeA.next) {
            j.m_edgeA.next.prev = j.m_edgeA.prev;
        }
        if (j.m_edgeA === bodyA.m_jointList) {
            bodyA.m_jointList = j.m_edgeA.next;
        }
        j.m_edgeA.Reset();
        if (j.m_edgeB.prev) {
            j.m_edgeB.prev.next = j.m_edgeB.next;
        }
        if (j.m_edgeB.next) {
            j.m_edgeB.next.prev = j.m_edgeB.prev;
        }
        if (j.m_edgeB === bodyB.m_jointList) {
            bodyB.m_jointList = j.m_edgeB.next;
        }
        j.m_edgeB.Reset();
        b2World._Joint_Destroy(j);
        --this.m_jointCount;
        if (!collideConnected) {
            var edge = bodyB.GetContactList();
            while (edge) {
                if (edge.other === bodyA) {
                    edge.contact.FlagForFiltering();
                }
                edge = edge.next;
            }
        }
    };
    b2World.prototype.CreateParticleSystem = function (def) {
        if (this.IsLocked()) {
            throw new Error();
        }
        var p = new b2ParticleSystem(def, this);
        p.m_prev = null;
        p.m_next = this.m_particleSystemList;
        if (this.m_particleSystemList) {
            this.m_particleSystemList.m_prev = p;
        }
        this.m_particleSystemList = p;
        return p;
    };
    b2World.prototype.DestroyParticleSystem = function (p) {
        if (this.IsLocked()) {
            throw new Error();
        }
        if (p.m_prev) {
            p.m_prev.m_next = p.m_next;
        }
        if (p.m_next) {
            p.m_next.m_prev = p.m_prev;
        }
        if (p === this.m_particleSystemList) {
            this.m_particleSystemList = p.m_next;
        }
    };
    b2World.prototype.CalculateReasonableParticleIterations = function (timeStep) {
        if (this.m_particleSystemList === null) {
            return 1;
        }
        function GetSmallestRadius(world) {
            var smallestRadius = b2_maxFloat;
            for (var system = world.GetParticleSystemList(); system !== null; system = system.m_next) {
                smallestRadius = b2Min(smallestRadius, system.GetRadius());
            }
            return smallestRadius;
        }
        return b2CalculateParticleIterations(this.m_gravity.Length(), GetSmallestRadius(this), timeStep);
    };
    b2World.prototype.Step = function (dt, velocityIterations, positionIterations, particleIterations) {
        if (particleIterations === void 0) { particleIterations = this.CalculateReasonableParticleIterations(dt); }
        var stepTimer = b2World.Step_s_stepTimer.Reset();
        if (this.m_newContacts) {
            this.m_contactManager.FindNewContacts();
            this.m_newContacts = false;
        }
        this.m_locked = true;
        var step = b2World.Step_s_step;
        step.dt = dt;
        step.velocityIterations = velocityIterations;
        step.positionIterations = positionIterations;
        step.particleIterations = particleIterations;
        if (dt > 0) {
            step.inv_dt = 1 / dt;
        }
        else {
            step.inv_dt = 0;
        }
        step.dtRatio = this.m_inv_dt0 * dt;
        step.warmStarting = this.m_warmStarting;
        var timer = b2World.Step_s_timer.Reset();
        this.m_contactManager.Collide();
        this.m_profile.collide = timer.GetMilliseconds();
        if (this.m_stepComplete && step.dt > 0) {
            var timer_1 = b2World.Step_s_timer.Reset();
            for (var p = this.m_particleSystemList; p; p = p.m_next) {
                p.Solve(step);
            }
            this.Solve(step);
            this.m_profile.solve = timer_1.GetMilliseconds();
        }
        if (this.m_continuousPhysics && step.dt > 0) {
            var timer_2 = b2World.Step_s_timer.Reset();
            this.SolveTOI(step);
            this.m_profile.solveTOI = timer_2.GetMilliseconds();
        }
        if (step.dt > 0) {
            this.m_inv_dt0 = step.inv_dt;
        }
        if (this.m_clearForces) {
            this.ClearForces();
        }
        this.m_locked = false;
        this.m_profile.step = stepTimer.GetMilliseconds();
    };
    b2World.prototype.ClearForces = function () {
        for (var body = this.m_bodyList; body; body = body.m_next) {
            body.m_force.SetZero();
            body.m_torque = 0;
        }
    };
    b2World.prototype.DrawParticleSystem = function (system) {
        if (this.m_debugDraw === null) {
            return;
        }
        var particleCount = system.GetParticleCount();
        if (particleCount) {
            var radius = system.GetRadius();
            var positionBuffer = system.GetPositionBuffer();
            if (system.m_colorBuffer.data) {
                var colorBuffer = system.GetColorBuffer();
                this.m_debugDraw.DrawParticles(positionBuffer, radius, colorBuffer, particleCount);
            }
            else {
                this.m_debugDraw.DrawParticles(positionBuffer, radius, null, particleCount);
            }
        }
    };
    b2World.prototype.DebugDraw = function () {
        if (this.m_debugDraw === null) {
            return;
        }
        var flags = this.m_debugDraw.GetFlags();
        var color = b2World.DebugDraw_s_color.SetRGB(0, 0, 0);
        if (flags & b2DrawFlags.e_shapeBit) {
            for (var b = this.m_bodyList; b; b = b.m_next) {
                var xf = b.m_xf;
                this.m_debugDraw.PushTransform(xf);
                for (var f = b.GetFixtureList(); f; f = f.m_next) {
                    if (b.GetType() === b2BodyType.b2_dynamicBody && b.m_mass === 0.0) {
                        this.DrawShape(f, new b2Color(1.0, 0.0, 0.0));
                    }
                    else if (!b.IsEnabled()) {
                        color.SetRGB(0.5, 0.5, 0.3);
                        this.DrawShape(f, color);
                    }
                    else if (b.GetType() === b2BodyType.b2_staticBody) {
                        color.SetRGB(0.5, 0.9, 0.5);
                        this.DrawShape(f, color);
                    }
                    else if (b.GetType() === b2BodyType.b2_kinematicBody) {
                        color.SetRGB(0.5, 0.5, 0.9);
                        this.DrawShape(f, color);
                    }
                    else if (!b.IsAwake()) {
                        color.SetRGB(0.6, 0.6, 0.6);
                        this.DrawShape(f, color);
                    }
                    else {
                        color.SetRGB(0.9, 0.7, 0.7);
                        this.DrawShape(f, color);
                    }
                }
                this.m_debugDraw.PopTransform(xf);
            }
        }
        if (flags & b2DrawFlags.e_particleBit) {
            for (var p = this.m_particleSystemList; p; p = p.m_next) {
                this.DrawParticleSystem(p);
            }
        }
        if (flags & b2DrawFlags.e_jointBit) {
            for (var j = this.m_jointList; j; j = j.m_next) {
                j.Draw(this.m_debugDraw);
            }
        }
        if (flags & b2DrawFlags.e_pairBit) {
            color.SetRGB(0.3, 0.9, 0.9);
            for (var contact = this.m_contactManager.m_contactList; contact; contact = contact.m_next) {
                var fixtureA = contact.GetFixtureA();
                var fixtureB = contact.GetFixtureB();
                var indexA = contact.GetChildIndexA();
                var indexB = contact.GetChildIndexB();
                var cA = fixtureA.GetAABB(indexA).GetCenter();
                var cB = fixtureB.GetAABB(indexB).GetCenter();
                this.m_debugDraw.DrawSegment(cA, cB, color);
            }
        }
        if (flags & b2DrawFlags.e_aabbBit) {
            color.SetRGB(0.9, 0.3, 0.9);
            var vs = b2World.DebugDraw_s_vs;
            for (var b = this.m_bodyList; b; b = b.m_next) {
                if (!b.IsEnabled()) {
                    continue;
                }
                for (var f = b.GetFixtureList(); f; f = f.m_next) {
                    for (var i = 0; i < f.m_proxyCount; ++i) {
                        var proxy = f.m_proxies[i];
                        var aabb = proxy.treeNode.aabb;
                        vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
                        vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
                        vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
                        vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
                        this.m_debugDraw.DrawPolygon(vs, 4, color);
                    }
                }
            }
        }
        if (flags & b2DrawFlags.e_centerOfMassBit) {
            for (var b = this.m_bodyList; b; b = b.m_next) {
                var xf = b2World.DebugDraw_s_xf;
                xf.q.Copy(b.m_xf.q);
                xf.p.Copy(b.GetWorldCenter());
                this.m_debugDraw.DrawTransform(xf);
            }
        }
        if (flags & b2DrawFlags.e_controllerBit) {
            for (var c = this.m_controllerList; c; c = c.m_next) {
                c.Draw(this.m_debugDraw);
            }
        }
    };
    b2World.prototype.QueryAABB = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args[0] instanceof b2QueryCallback) {
            this._QueryAABB(args[0], args[1]);
        }
        else {
            this._QueryAABB(null, args[0], args[1]);
        }
    };
    b2World.prototype._QueryAABB = function (callback, aabb, fn) {
        this.m_contactManager.m_broadPhase.Query(aabb, function (proxy) {
            var fixture_proxy = proxy.userData;
            var fixture = fixture_proxy.fixture;
            if (callback) {
                return callback.ReportFixture(fixture);
            }
            else if (fn) {
                return fn(fixture);
            }
            return true;
        });
        if (callback instanceof b2QueryCallback) {
            for (var p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.QueryAABB(callback, aabb);
                }
            }
        }
    };
    b2World.prototype.QueryAllAABB = function (aabb, out) {
        if (out === void 0) { out = []; }
        this.QueryAABB(aabb, function (fixture) { out.push(fixture); return true; });
        return out;
    };
    b2World.prototype.QueryPointAABB = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args[0] instanceof b2QueryCallback) {
            this._QueryPointAABB(args[0], args[1]);
        }
        else {
            this._QueryPointAABB(null, args[0], args[1]);
        }
    };
    b2World.prototype._QueryPointAABB = function (callback, point, fn) {
        this.m_contactManager.m_broadPhase.QueryPoint(point, function (proxy) {
            var fixture_proxy = proxy.userData;
            var fixture = fixture_proxy.fixture;
            if (callback) {
                return callback.ReportFixture(fixture);
            }
            else if (fn) {
                return fn(fixture);
            }
            return true;
        });
        if (callback instanceof b2QueryCallback) {
            for (var p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.QueryPointAABB(callback, point);
                }
            }
        }
    };
    b2World.prototype.QueryAllPointAABB = function (point, out) {
        if (out === void 0) { out = []; }
        this.QueryPointAABB(point, function (fixture) { out.push(fixture); return true; });
        return out;
    };
    b2World.prototype.QueryFixtureShape = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args[0] instanceof b2QueryCallback) {
            this._QueryFixtureShape(args[0], args[1], args[2], args[3]);
        }
        else {
            this._QueryFixtureShape(null, args[0], args[1], args[2], args[3]);
        }
    };
    b2World.prototype._QueryFixtureShape = function (callback, shape, index, transform, fn) {
        var aabb = b2World.QueryFixtureShape_s_aabb;
        shape.ComputeAABB(aabb, transform, index);
        this.m_contactManager.m_broadPhase.Query(aabb, function (proxy) {
            var fixture_proxy = proxy.userData;
            var fixture = fixture_proxy.fixture;
            if (b2TestOverlapShape(shape, index, fixture.GetShape(), fixture_proxy.childIndex, transform, fixture.GetBody().GetTransform())) {
                if (callback) {
                    return callback.ReportFixture(fixture);
                }
                else if (fn) {
                    return fn(fixture);
                }
            }
            return true;
        });
        if (callback instanceof b2QueryCallback) {
            for (var p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.QueryAABB(callback, aabb);
                }
            }
        }
    };
    b2World.prototype.QueryAllFixtureShape = function (shape, index, transform, out) {
        if (out === void 0) { out = []; }
        this.QueryFixtureShape(shape, index, transform, function (fixture) { out.push(fixture); return true; });
        return out;
    };
    b2World.prototype.QueryFixturePoint = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args[0] instanceof b2QueryCallback) {
            this._QueryFixturePoint(args[0], args[1]);
        }
        else {
            this._QueryFixturePoint(null, args[0], args[1]);
        }
    };
    b2World.prototype._QueryFixturePoint = function (callback, point, fn) {
        this.m_contactManager.m_broadPhase.QueryPoint(point, function (proxy) {
            var fixture_proxy = proxy.userData;
            var fixture = fixture_proxy.fixture;
            if (fixture.TestPoint(point)) {
                if (callback) {
                    return callback.ReportFixture(fixture);
                }
                else if (fn) {
                    return fn(fixture);
                }
            }
            return true;
        });
        if (callback) {
            for (var p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.QueryPointAABB(callback, point);
                }
            }
        }
    };
    b2World.prototype.QueryAllFixturePoint = function (point, out) {
        if (out === void 0) { out = []; }
        this.QueryFixturePoint(point, function (fixture) { out.push(fixture); return true; });
        return out;
    };
    b2World.prototype.RayCast = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args[0] instanceof b2RayCastCallback) {
            this._RayCast(args[0], args[1], args[2]);
        }
        else {
            this._RayCast(null, args[0], args[1], args[2]);
        }
    };
    b2World.prototype._RayCast = function (callback, point1, point2, fn) {
        var input = b2World.RayCast_s_input;
        input.maxFraction = 1;
        input.p1.Copy(point1);
        input.p2.Copy(point2);
        this.m_contactManager.m_broadPhase.RayCast(input, function (input, proxy) {
            var fixture_proxy = proxy.userData;
            var fixture = fixture_proxy.fixture;
            var index = fixture_proxy.childIndex;
            var output = b2World.RayCast_s_output;
            var hit = fixture.RayCast(output, input, index);
            if (hit) {
                var fraction = output.fraction;
                var point = b2World.RayCast_s_point;
                point.Set((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
                if (callback) {
                    return callback.ReportFixture(fixture, point, output.normal, fraction);
                }
                else if (fn) {
                    return fn(fixture, point, output.normal, fraction);
                }
            }
            return input.maxFraction;
        });
        if (callback) {
            for (var p = this.m_particleSystemList; p; p = p.m_next) {
                if (callback.ShouldQueryParticleSystem(p)) {
                    p.RayCast(callback, point1, point2);
                }
            }
        }
    };
    b2World.prototype.RayCastOne = function (point1, point2) {
        var result = null;
        var min_fraction = 1;
        this.RayCast(point1, point2, function (fixture, point, normal, fraction) {
            if (fraction < min_fraction) {
                min_fraction = fraction;
                result = fixture;
            }
            return min_fraction;
        });
        return result;
    };
    b2World.prototype.RayCastAll = function (point1, point2, out) {
        if (out === void 0) { out = []; }
        this.RayCast(point1, point2, function (fixture, point, normal, fraction) {
            out.push(fixture);
            return 1;
        });
        return out;
    };
    b2World.prototype.GetBodyList = function () {
        return this.m_bodyList;
    };
    b2World.prototype.GetJointList = function () {
        return this.m_jointList;
    };
    b2World.prototype.GetParticleSystemList = function () {
        return this.m_particleSystemList;
    };
    b2World.prototype.GetContactList = function () {
        return this.m_contactManager.m_contactList;
    };
    b2World.prototype.SetAllowSleeping = function (flag) {
        if (flag === this.m_allowSleep) {
            return;
        }
        this.m_allowSleep = flag;
        if (!this.m_allowSleep) {
            for (var b = this.m_bodyList; b; b = b.m_next) {
                b.SetAwake(true);
            }
        }
    };
    b2World.prototype.GetAllowSleeping = function () {
        return this.m_allowSleep;
    };
    b2World.prototype.SetWarmStarting = function (flag) {
        this.m_warmStarting = flag;
    };
    b2World.prototype.GetWarmStarting = function () {
        return this.m_warmStarting;
    };
    b2World.prototype.SetContinuousPhysics = function (flag) {
        this.m_continuousPhysics = flag;
    };
    b2World.prototype.GetContinuousPhysics = function () {
        return this.m_continuousPhysics;
    };
    b2World.prototype.SetSubStepping = function (flag) {
        this.m_subStepping = flag;
    };
    b2World.prototype.GetSubStepping = function () {
        return this.m_subStepping;
    };
    b2World.prototype.GetProxyCount = function () {
        return this.m_contactManager.m_broadPhase.GetProxyCount();
    };
    b2World.prototype.GetBodyCount = function () {
        return this.m_bodyCount;
    };
    b2World.prototype.GetJointCount = function () {
        return this.m_jointCount;
    };
    b2World.prototype.GetContactCount = function () {
        return this.m_contactManager.m_contactCount;
    };
    b2World.prototype.GetTreeHeight = function () {
        return this.m_contactManager.m_broadPhase.GetTreeHeight();
    };
    b2World.prototype.GetTreeBalance = function () {
        return this.m_contactManager.m_broadPhase.GetTreeBalance();
    };
    b2World.prototype.GetTreeQuality = function () {
        return this.m_contactManager.m_broadPhase.GetTreeQuality();
    };
    b2World.prototype.SetGravity = function (gravity, wake) {
        if (wake === void 0) { wake = true; }
        if (!b2Vec2.IsEqualToV(this.m_gravity, gravity)) {
            this.m_gravity.Copy(gravity);
            if (wake) {
                for (var b = this.m_bodyList; b; b = b.m_next) {
                    b.SetAwake(true);
                }
            }
        }
    };
    b2World.prototype.GetGravity = function () {
        return this.m_gravity;
    };
    b2World.prototype.IsLocked = function () {
        return this.m_locked;
    };
    b2World.prototype.SetAutoClearForces = function (flag) {
        this.m_clearForces = flag;
    };
    b2World.prototype.GetAutoClearForces = function () {
        return this.m_clearForces;
    };
    b2World.prototype.ShiftOrigin = function (newOrigin) {
        if (this.IsLocked()) {
            throw new Error();
        }
        for (var b = this.m_bodyList; b; b = b.m_next) {
            b.m_xf.p.SelfSub(newOrigin);
            b.m_sweep.c0.SelfSub(newOrigin);
            b.m_sweep.c.SelfSub(newOrigin);
        }
        for (var j = this.m_jointList; j; j = j.m_next) {
            j.ShiftOrigin(newOrigin);
        }
        this.m_contactManager.m_broadPhase.ShiftOrigin(newOrigin);
    };
    b2World.prototype.GetContactManager = function () {
        return this.m_contactManager;
    };
    b2World.prototype.GetProfile = function () {
        return this.m_profile;
    };
    b2World.prototype.Dump = function (log) {
        if (this.m_locked) {
            return;
        }
        log("const g: b2Vec2 = new b2Vec2(%.15f, %.15f);\n", this.m_gravity.x, this.m_gravity.y);
        log("this.m_world.SetGravity(g);\n");
        log("const bodies: b2Body[] = [];\n");
        log("const joints: b2Joint[] = [];\n");
        var i = 0;
        for (var b = this.m_bodyList; b; b = b.m_next) {
            b.m_islandIndex = i;
            b.Dump(log);
            ++i;
        }
        i = 0;
        for (var j = this.m_jointList; j; j = j.m_next) {
            j.m_index = i;
            ++i;
        }
        for (var j = this.m_jointList; j; j = j.m_next) {
            if (j.m_type === b2JointType.e_gearJoint) {
                continue;
            }
            log("{\n");
            j.Dump(log);
            log("}\n");
        }
        for (var j = this.m_jointList; j; j = j.m_next) {
            if (j.m_type !== b2JointType.e_gearJoint) {
                continue;
            }
            log("{\n");
            j.Dump(log);
            log("}\n");
        }
    };
    b2World.prototype.DrawShape = function (fixture, color) {
        if (this.m_debugDraw === null) {
            return;
        }
        var shape = fixture.GetShape();
        switch (shape.m_type) {
            case b2ShapeType.e_circleShape: {
                var circle = shape;
                var center = circle.m_p;
                var radius = circle.m_radius;
                var axis = b2Vec2.UNITX;
                this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
                break;
            }
            case b2ShapeType.e_edgeShape: {
                var edge = shape;
                var v1 = edge.m_vertex1;
                var v2 = edge.m_vertex2;
                this.m_debugDraw.DrawSegment(v1, v2, color);
                if (edge.m_oneSided === false) {
                    this.m_debugDraw.DrawPoint(v1, 4.0, color);
                    this.m_debugDraw.DrawPoint(v2, 4.0, color);
                }
                break;
            }
            case b2ShapeType.e_chainShape: {
                var chain = shape;
                var count = chain.m_count;
                var vertices = chain.m_vertices;
                var v1 = vertices[0];
                for (var i = 1; i < count; ++i) {
                    var v2 = vertices[i];
                    this.m_debugDraw.DrawSegment(v1, v2, color);
                    v1 = v2;
                }
                break;
            }
            case b2ShapeType.e_polygonShape: {
                var poly = shape;
                var vertexCount = poly.m_count;
                var vertices = poly.m_vertices;
                this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
                break;
            }
        }
    };
    b2World.prototype.Solve = function (step) {
        for (var b = this.m_bodyList; b; b = b.m_next) {
            b.m_xf0.Copy(b.m_xf);
        }
        for (var controller = this.m_controllerList; controller; controller = controller.m_next) {
            controller.Step(step);
        }
        this.m_profile.solveInit = 0;
        this.m_profile.solveVelocity = 0;
        this.m_profile.solvePosition = 0;
        var island = this.m_island;
        island.Initialize(this.m_bodyCount, this.m_contactManager.m_contactCount, this.m_jointCount, this.m_contactManager.m_contactListener);
        for (var b = this.m_bodyList; b; b = b.m_next) {
            b.m_islandFlag = false;
        }
        for (var c = this.m_contactManager.m_contactList; c; c = c.m_next) {
            c.m_islandFlag = false;
        }
        for (var j = this.m_jointList; j; j = j.m_next) {
            j.m_islandFlag = false;
        }
        var stack = this.s_stack;
        for (var seed = this.m_bodyList; seed; seed = seed.m_next) {
            if (seed.m_islandFlag) {
                continue;
            }
            if (!seed.IsAwake() || !seed.IsEnabled()) {
                continue;
            }
            if (seed.GetType() === b2BodyType.b2_staticBody) {
                continue;
            }
            island.Clear();
            var stackCount = 0;
            stack[stackCount++] = seed;
            seed.m_islandFlag = true;
            while (stackCount > 0) {
                var b = stack[--stackCount];
                if (!b) {
                    throw new Error();
                }
                island.AddBody(b);
                if (b.GetType() === b2BodyType.b2_staticBody) {
                    continue;
                }
                b.m_awakeFlag = true;
                for (var ce = b.m_contactList; ce; ce = ce.next) {
                    var contact = ce.contact;
                    if (contact.m_islandFlag) {
                        continue;
                    }
                    if (!contact.IsEnabled() || !contact.IsTouching()) {
                        continue;
                    }
                    var sensorA = contact.m_fixtureA.m_isSensor;
                    var sensorB = contact.m_fixtureB.m_isSensor;
                    if (sensorA || sensorB) {
                        continue;
                    }
                    island.AddContact(contact);
                    contact.m_islandFlag = true;
                    var other = ce.other;
                    if (other.m_islandFlag) {
                        continue;
                    }
                    stack[stackCount++] = other;
                    other.m_islandFlag = true;
                }
                for (var je = b.m_jointList; je; je = je.next) {
                    if (je.joint.m_islandFlag) {
                        continue;
                    }
                    var other = je.other;
                    if (!other.IsEnabled()) {
                        continue;
                    }
                    island.AddJoint(je.joint);
                    je.joint.m_islandFlag = true;
                    if (other.m_islandFlag) {
                        continue;
                    }
                    stack[stackCount++] = other;
                    other.m_islandFlag = true;
                }
            }
            var profile = new b2Profile();
            island.Solve(profile, step, this.m_gravity, this.m_allowSleep);
            this.m_profile.solveInit += profile.solveInit;
            this.m_profile.solveVelocity += profile.solveVelocity;
            this.m_profile.solvePosition += profile.solvePosition;
            for (var i = 0; i < island.m_bodyCount; ++i) {
                var b = island.m_bodies[i];
                if (b.GetType() === b2BodyType.b2_staticBody) {
                    b.m_islandFlag = false;
                }
            }
        }
        for (var i = 0; i < stack.length; ++i) {
            if (!stack[i]) {
                break;
            }
            stack[i] = null;
        }
        var timer = new b2Timer();
        for (var b = this.m_bodyList; b; b = b.m_next) {
            if (!b.m_islandFlag) {
                continue;
            }
            if (b.GetType() === b2BodyType.b2_staticBody) {
                continue;
            }
            b.SynchronizeFixtures();
        }
        this.m_contactManager.FindNewContacts();
        this.m_profile.broadphase = timer.GetMilliseconds();
    };
    b2World.prototype.SolveTOI = function (step) {
        var island = this.m_island;
        island.Initialize(2 * b2_maxTOIContacts, b2_maxTOIContacts, 0, this.m_contactManager.m_contactListener);
        if (this.m_stepComplete) {
            for (var b = this.m_bodyList; b; b = b.m_next) {
                b.m_islandFlag = false;
                b.m_sweep.alpha0 = 0;
            }
            for (var c = this.m_contactManager.m_contactList; c; c = c.m_next) {
                c.m_toiFlag = false;
                c.m_islandFlag = false;
                c.m_toiCount = 0;
                c.m_toi = 1;
            }
        }
        for (;;) {
            var minContact = null;
            var minAlpha = 1;
            for (var c = this.m_contactManager.m_contactList; c; c = c.m_next) {
                if (!c.IsEnabled()) {
                    continue;
                }
                if (c.m_toiCount > b2_maxSubSteps) {
                    continue;
                }
                var alpha = 1;
                if (c.m_toiFlag) {
                    alpha = c.m_toi;
                }
                else {
                    var fA_1 = c.GetFixtureA();
                    var fB_1 = c.GetFixtureB();
                    if (fA_1.IsSensor() || fB_1.IsSensor()) {
                        continue;
                    }
                    var bA_1 = fA_1.GetBody();
                    var bB_1 = fB_1.GetBody();
                    var typeA = bA_1.m_type;
                    var typeB = bB_1.m_type;
                    var activeA = bA_1.IsAwake() && typeA !== b2BodyType.b2_staticBody;
                    var activeB = bB_1.IsAwake() && typeB !== b2BodyType.b2_staticBody;
                    if (!activeA && !activeB) {
                        continue;
                    }
                    var collideA = bA_1.IsBullet() || typeA !== b2BodyType.b2_dynamicBody;
                    var collideB = bB_1.IsBullet() || typeB !== b2BodyType.b2_dynamicBody;
                    if (!collideA && !collideB) {
                        continue;
                    }
                    var alpha0 = bA_1.m_sweep.alpha0;
                    if (bA_1.m_sweep.alpha0 < bB_1.m_sweep.alpha0) {
                        alpha0 = bB_1.m_sweep.alpha0;
                        bA_1.m_sweep.Advance(alpha0);
                    }
                    else if (bB_1.m_sweep.alpha0 < bA_1.m_sweep.alpha0) {
                        alpha0 = bA_1.m_sweep.alpha0;
                        bB_1.m_sweep.Advance(alpha0);
                    }
                    var indexA = c.GetChildIndexA();
                    var indexB = c.GetChildIndexB();
                    var input = b2World.SolveTOI_s_toi_input;
                    input.proxyA.SetShape(fA_1.GetShape(), indexA);
                    input.proxyB.SetShape(fB_1.GetShape(), indexB);
                    input.sweepA.Copy(bA_1.m_sweep);
                    input.sweepB.Copy(bB_1.m_sweep);
                    input.tMax = 1;
                    var output = b2World.SolveTOI_s_toi_output;
                    b2TimeOfImpact(output, input);
                    var beta = output.t;
                    if (output.state === b2TOIOutputState.e_touching) {
                        alpha = b2Min(alpha0 + (1 - alpha0) * beta, 1);
                    }
                    else {
                        alpha = 1;
                    }
                    c.m_toi = alpha;
                    c.m_toiFlag = true;
                }
                if (alpha < minAlpha) {
                    minContact = c;
                    minAlpha = alpha;
                }
            }
            if (minContact === null || 1 - 10 * b2_epsilon < minAlpha) {
                this.m_stepComplete = true;
                break;
            }
            var fA = minContact.GetFixtureA();
            var fB = minContact.GetFixtureB();
            var bA = fA.GetBody();
            var bB = fB.GetBody();
            var backup1 = b2World.SolveTOI_s_backup1.Copy(bA.m_sweep);
            var backup2 = b2World.SolveTOI_s_backup2.Copy(bB.m_sweep);
            bA.Advance(minAlpha);
            bB.Advance(minAlpha);
            minContact.Update(this.m_contactManager.m_contactListener);
            minContact.m_toiFlag = false;
            ++minContact.m_toiCount;
            if (!minContact.IsEnabled() || !minContact.IsTouching()) {
                minContact.SetEnabled(false);
                bA.m_sweep.Copy(backup1);
                bB.m_sweep.Copy(backup2);
                bA.SynchronizeTransform();
                bB.SynchronizeTransform();
                continue;
            }
            bA.SetAwake(true);
            bB.SetAwake(true);
            island.Clear();
            island.AddBody(bA);
            island.AddBody(bB);
            island.AddContact(minContact);
            bA.m_islandFlag = true;
            bB.m_islandFlag = true;
            minContact.m_islandFlag = true;
            for (var i = 0; i < 2; ++i) {
                var body = (i === 0) ? (bA) : (bB);
                if (body.m_type === b2BodyType.b2_dynamicBody) {
                    for (var ce = body.m_contactList; ce; ce = ce.next) {
                        if (island.m_bodyCount === island.m_bodyCapacity) {
                            break;
                        }
                        if (island.m_contactCount === island.m_contactCapacity) {
                            break;
                        }
                        var contact = ce.contact;
                        if (contact.m_islandFlag) {
                            continue;
                        }
                        var other = ce.other;
                        if (other.m_type === b2BodyType.b2_dynamicBody &&
                            !body.IsBullet() && !other.IsBullet()) {
                            continue;
                        }
                        var sensorA = contact.m_fixtureA.m_isSensor;
                        var sensorB = contact.m_fixtureB.m_isSensor;
                        if (sensorA || sensorB) {
                            continue;
                        }
                        var backup = b2World.SolveTOI_s_backup.Copy(other.m_sweep);
                        if (!other.m_islandFlag) {
                            other.Advance(minAlpha);
                        }
                        contact.Update(this.m_contactManager.m_contactListener);
                        if (!contact.IsEnabled()) {
                            other.m_sweep.Copy(backup);
                            other.SynchronizeTransform();
                            continue;
                        }
                        if (!contact.IsTouching()) {
                            other.m_sweep.Copy(backup);
                            other.SynchronizeTransform();
                            continue;
                        }
                        contact.m_islandFlag = true;
                        island.AddContact(contact);
                        if (other.m_islandFlag) {
                            continue;
                        }
                        other.m_islandFlag = true;
                        if (other.m_type !== b2BodyType.b2_staticBody) {
                            other.SetAwake(true);
                        }
                        island.AddBody(other);
                    }
                }
            }
            var subStep = b2World.SolveTOI_s_subStep;
            subStep.dt = (1 - minAlpha) * step.dt;
            subStep.inv_dt = 1 / subStep.dt;
            subStep.dtRatio = 1;
            subStep.positionIterations = 20;
            subStep.velocityIterations = step.velocityIterations;
            subStep.particleIterations = step.particleIterations;
            subStep.warmStarting = false;
            island.SolveTOI(subStep, bA.m_islandIndex, bB.m_islandIndex);
            for (var i = 0; i < island.m_bodyCount; ++i) {
                var body = island.m_bodies[i];
                body.m_islandFlag = false;
                if (body.m_type !== b2BodyType.b2_dynamicBody) {
                    continue;
                }
                body.SynchronizeFixtures();
                for (var ce = body.m_contactList; ce; ce = ce.next) {
                    ce.contact.m_toiFlag = false;
                    ce.contact.m_islandFlag = false;
                }
            }
            this.m_contactManager.FindNewContacts();
            if (this.m_subStepping) {
                this.m_stepComplete = false;
                break;
            }
        }
    };
    b2World.prototype.AddController = function (controller) {
        controller.m_next = this.m_controllerList;
        controller.m_prev = null;
        if (this.m_controllerList) {
            this.m_controllerList.m_prev = controller;
        }
        this.m_controllerList = controller;
        ++this.m_controllerCount;
        return controller;
    };
    b2World.prototype.RemoveController = function (controller) {
        if (controller.m_prev) {
            controller.m_prev.m_next = controller.m_next;
        }
        if (controller.m_next) {
            controller.m_next.m_prev = controller.m_prev;
        }
        if (this.m_controllerList === controller) {
            this.m_controllerList = controller.m_next;
        }
        --this.m_controllerCount;
        controller.m_prev = null;
        controller.m_next = null;
        return controller;
    };
    b2World.Step_s_step = new b2TimeStep();
    b2World.Step_s_stepTimer = new b2Timer();
    b2World.Step_s_timer = new b2Timer();
    b2World.DebugDraw_s_color = new b2Color(0, 0, 0);
    b2World.DebugDraw_s_vs = b2Vec2.MakeArray(4);
    b2World.DebugDraw_s_xf = new b2Transform();
    b2World.QueryFixtureShape_s_aabb = new b2AABB();
    b2World.RayCast_s_input = new b2RayCastInput();
    b2World.RayCast_s_output = new b2RayCastOutput();
    b2World.RayCast_s_point = new b2Vec2();
    b2World.SolveTOI_s_subStep = new b2TimeStep();
    b2World.SolveTOI_s_backup = new b2Sweep();
    b2World.SolveTOI_s_backup1 = new b2Sweep();
    b2World.SolveTOI_s_backup2 = new b2Sweep();
    b2World.SolveTOI_s_toi_input = new b2TOIInput();
    b2World.SolveTOI_s_toi_output = new b2TOIOutput();
    return b2World;
}());
//# sourceMappingURL=b2_world.js.map