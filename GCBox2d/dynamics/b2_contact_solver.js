var g_blockSolve = false;
function get_g_blockSolve() { return g_blockSolve; }
function set_g_blockSolve(value) { g_blockSolve = value; }
var b2VelocityConstraintPoint = (function () {
    function b2VelocityConstraintPoint() {
        this.rA = new b2Vec2();
        this.rB = new b2Vec2();
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
        this.normalMass = 0;
        this.tangentMass = 0;
        this.velocityBias = 0;
    }
    b2VelocityConstraintPoint.MakeArray = function (length) {
        return b2MakeArray(length, function (i) { return new b2VelocityConstraintPoint(); });
    };
    return b2VelocityConstraintPoint;
}());
var b2ContactVelocityConstraint = (function () {
    function b2ContactVelocityConstraint() {
        this.points = b2VelocityConstraintPoint.MakeArray(b2_maxManifoldPoints);
        this.normal = new b2Vec2();
        this.tangent = new b2Vec2();
        this.normalMass = new b2Mat22();
        this.K = new b2Mat22();
        this.indexA = 0;
        this.indexB = 0;
        this.invMassA = 0;
        this.invMassB = 0;
        this.invIA = 0;
        this.invIB = 0;
        this.friction = 0;
        this.restitution = 0;
        this.threshold = 0;
        this.tangentSpeed = 0;
        this.pointCount = 0;
        this.contactIndex = 0;
    }
    b2ContactVelocityConstraint.MakeArray = function (length) {
        return b2MakeArray(length, function (i) { return new b2ContactVelocityConstraint(); });
    };
    return b2ContactVelocityConstraint;
}());
var b2ContactPositionConstraint = (function () {
    function b2ContactPositionConstraint() {
        this.localPoints = b2Vec2.MakeArray(b2_maxManifoldPoints);
        this.localNormal = new b2Vec2();
        this.localPoint = new b2Vec2();
        this.indexA = 0;
        this.indexB = 0;
        this.invMassA = 0;
        this.invMassB = 0;
        this.localCenterA = new b2Vec2();
        this.localCenterB = new b2Vec2();
        this.invIA = 0;
        this.invIB = 0;
        this.type = b2ManifoldType.e_unknown;
        this.radiusA = 0;
        this.radiusB = 0;
        this.pointCount = 0;
    }
    b2ContactPositionConstraint.MakeArray = function (length) {
        return b2MakeArray(length, function (i) { return new b2ContactPositionConstraint(); });
    };
    return b2ContactPositionConstraint;
}());
var b2ContactSolverDef = (function () {
    function b2ContactSolverDef() {
        this.step = new b2TimeStep();
        this.count = 0;
    }
    return b2ContactSolverDef;
}());
var b2PositionSolverManifold = (function () {
    function b2PositionSolverManifold() {
        this.normal = new b2Vec2();
        this.point = new b2Vec2();
        this.separation = 0;
    }
    b2PositionSolverManifold.prototype.Initialize = function (pc, xfA, xfB, index) {
        var pointA = b2PositionSolverManifold.Initialize_s_pointA;
        var pointB = b2PositionSolverManifold.Initialize_s_pointB;
        var planePoint = b2PositionSolverManifold.Initialize_s_planePoint;
        var clipPoint = b2PositionSolverManifold.Initialize_s_clipPoint;
        switch (pc.type) {
            case b2ManifoldType.e_circles: {
                b2Transform.MulXV(xfA, pc.localPoint, pointA);
                b2Transform.MulXV(xfB, pc.localPoints[0], pointB);
                b2Vec2.SubVV(pointB, pointA, this.normal).SelfNormalize();
                b2Vec2.MidVV(pointA, pointB, this.point);
                this.separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
                break;
            }
            case b2ManifoldType.e_faceA: {
                b2Rot.MulRV(xfA.q, pc.localNormal, this.normal);
                b2Transform.MulXV(xfA, pc.localPoint, planePoint);
                b2Transform.MulXV(xfB, pc.localPoints[index], clipPoint);
                this.separation = b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
                this.point.Copy(clipPoint);
                break;
            }
            case b2ManifoldType.e_faceB: {
                b2Rot.MulRV(xfB.q, pc.localNormal, this.normal);
                b2Transform.MulXV(xfB, pc.localPoint, planePoint);
                b2Transform.MulXV(xfA, pc.localPoints[index], clipPoint);
                this.separation = b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
                this.point.Copy(clipPoint);
                this.normal.SelfNeg();
                break;
            }
        }
    };
    b2PositionSolverManifold.Initialize_s_pointA = new b2Vec2();
    b2PositionSolverManifold.Initialize_s_pointB = new b2Vec2();
    b2PositionSolverManifold.Initialize_s_planePoint = new b2Vec2();
    b2PositionSolverManifold.Initialize_s_clipPoint = new b2Vec2();
    return b2PositionSolverManifold;
}());
var b2ContactSolver = (function () {
    function b2ContactSolver() {
        this.m_step = new b2TimeStep();
        this.m_positionConstraints = b2ContactPositionConstraint.MakeArray(1024);
        this.m_velocityConstraints = b2ContactVelocityConstraint.MakeArray(1024);
        this.m_count = 0;
    }
    b2ContactSolver.prototype.Initialize = function (def) {
        this.m_step.Copy(def.step);
        this.m_count = def.count;
        if (this.m_positionConstraints.length < this.m_count) {
            var new_length = b2Max(this.m_positionConstraints.length * 2, this.m_count);
            while (this.m_positionConstraints.length < new_length) {
                this.m_positionConstraints[this.m_positionConstraints.length] = new b2ContactPositionConstraint();
            }
        }
        if (this.m_velocityConstraints.length < this.m_count) {
            var new_length = b2Max(this.m_velocityConstraints.length * 2, this.m_count);
            while (this.m_velocityConstraints.length < new_length) {
                this.m_velocityConstraints[this.m_velocityConstraints.length] = new b2ContactVelocityConstraint();
            }
        }
        this.m_positions = def.positions;
        this.m_velocities = def.velocities;
        this.m_contacts = def.contacts;
        for (var i = 0; i < this.m_count; ++i) {
            var contact = this.m_contacts[i];
            var fixtureA = contact.m_fixtureA;
            var fixtureB = contact.m_fixtureB;
            var shapeA = fixtureA.GetShape();
            var shapeB = fixtureB.GetShape();
            var radiusA = shapeA.m_radius;
            var radiusB = shapeB.m_radius;
            var bodyA = fixtureA.GetBody();
            var bodyB = fixtureB.GetBody();
            var manifold = contact.GetManifold();
            var pointCount = manifold.pointCount;
            var vc = this.m_velocityConstraints[i];
            vc.friction = contact.m_friction;
            vc.restitution = contact.m_restitution;
            vc.threshold = contact.m_restitutionThreshold;
            vc.tangentSpeed = contact.m_tangentSpeed;
            vc.indexA = bodyA.m_islandIndex;
            vc.indexB = bodyB.m_islandIndex;
            vc.invMassA = bodyA.m_invMass;
            vc.invMassB = bodyB.m_invMass;
            vc.invIA = bodyA.m_invI;
            vc.invIB = bodyB.m_invI;
            vc.contactIndex = i;
            vc.pointCount = pointCount;
            vc.K.SetZero();
            vc.normalMass.SetZero();
            var pc = this.m_positionConstraints[i];
            pc.indexA = bodyA.m_islandIndex;
            pc.indexB = bodyB.m_islandIndex;
            pc.invMassA = bodyA.m_invMass;
            pc.invMassB = bodyB.m_invMass;
            pc.localCenterA.Copy(bodyA.m_sweep.localCenter);
            pc.localCenterB.Copy(bodyB.m_sweep.localCenter);
            pc.invIA = bodyA.m_invI;
            pc.invIB = bodyB.m_invI;
            pc.localNormal.Copy(manifold.localNormal);
            pc.localPoint.Copy(manifold.localPoint);
            pc.pointCount = pointCount;
            pc.radiusA = radiusA;
            pc.radiusB = radiusB;
            pc.type = manifold.type;
            for (var j = 0; j < pointCount; ++j) {
                var cp = manifold.points[j];
                var vcp = vc.points[j];
                if (this.m_step.warmStarting) {
                    vcp.normalImpulse = this.m_step.dtRatio * cp.normalImpulse;
                    vcp.tangentImpulse = this.m_step.dtRatio * cp.tangentImpulse;
                }
                else {
                    vcp.normalImpulse = 0;
                    vcp.tangentImpulse = 0;
                }
                vcp.rA.SetZero();
                vcp.rB.SetZero();
                vcp.normalMass = 0;
                vcp.tangentMass = 0;
                vcp.velocityBias = 0;
                pc.localPoints[j].Copy(cp.localPoint);
            }
        }
        return this;
    };
    b2ContactSolver.prototype.InitializeVelocityConstraints = function () {
        var xfA = b2ContactSolver.InitializeVelocityConstraints_s_xfA;
        var xfB = b2ContactSolver.InitializeVelocityConstraints_s_xfB;
        var worldManifold = b2ContactSolver.InitializeVelocityConstraints_s_worldManifold;
        var k_maxConditionNumber = 1000;
        for (var i = 0; i < this.m_count; ++i) {
            var vc = this.m_velocityConstraints[i];
            var pc = this.m_positionConstraints[i];
            var radiusA = pc.radiusA;
            var radiusB = pc.radiusB;
            var manifold = this.m_contacts[vc.contactIndex].GetManifold();
            var indexA = vc.indexA;
            var indexB = vc.indexB;
            var mA = vc.invMassA;
            var mB = vc.invMassB;
            var iA = vc.invIA;
            var iB = vc.invIB;
            var localCenterA = pc.localCenterA;
            var localCenterB = pc.localCenterB;
            var cA = this.m_positions[indexA].c;
            var aA = this.m_positions[indexA].a;
            var vA = this.m_velocities[indexA].v;
            var wA = this.m_velocities[indexA].w;
            var cB = this.m_positions[indexB].c;
            var aB = this.m_positions[indexB].a;
            var vB = this.m_velocities[indexB].v;
            var wB = this.m_velocities[indexB].w;
            xfA.q.SetAngle(aA);
            xfB.q.SetAngle(aB);
            b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
            b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);
            worldManifold.Initialize(manifold, xfA, radiusA, xfB, radiusB);
            vc.normal.Copy(worldManifold.normal);
            b2Vec2.CrossVOne(vc.normal, vc.tangent);
            var pointCount = vc.pointCount;
            for (var j = 0; j < pointCount; ++j) {
                var vcp = vc.points[j];
                b2Vec2.SubVV(worldManifold.points[j], cA, vcp.rA);
                b2Vec2.SubVV(worldManifold.points[j], cB, vcp.rB);
                var rnA = b2Vec2.CrossVV(vcp.rA, vc.normal);
                var rnB = b2Vec2.CrossVV(vcp.rB, vc.normal);
                var kNormal = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
                vcp.normalMass = kNormal > 0 ? 1 / kNormal : 0;
                var tangent = vc.tangent;
                var rtA = b2Vec2.CrossVV(vcp.rA, tangent);
                var rtB = b2Vec2.CrossVV(vcp.rB, tangent);
                var kTangent = mA + mB + iA * rtA * rtA + iB * rtB * rtB;
                vcp.tangentMass = kTangent > 0 ? 1 / kTangent : 0;
                vcp.velocityBias = 0;
                var vRel = b2Vec2.DotVV(vc.normal, b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1), b2Vec2.s_t0));
                if (vRel < -vc.threshold) {
                    vcp.velocityBias += (-vc.restitution * vRel);
                }
            }
            if (vc.pointCount === 2 && g_blockSolve) {
                var vcp1 = vc.points[0];
                var vcp2 = vc.points[1];
                var rn1A = b2Vec2.CrossVV(vcp1.rA, vc.normal);
                var rn1B = b2Vec2.CrossVV(vcp1.rB, vc.normal);
                var rn2A = b2Vec2.CrossVV(vcp2.rA, vc.normal);
                var rn2B = b2Vec2.CrossVV(vcp2.rB, vc.normal);
                var k11 = mA + mB + iA * rn1A * rn1A + iB * rn1B * rn1B;
                var k22 = mA + mB + iA * rn2A * rn2A + iB * rn2B * rn2B;
                var k12 = mA + mB + iA * rn1A * rn2A + iB * rn1B * rn2B;
                if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
                    vc.K.ex.Set(k11, k12);
                    vc.K.ey.Set(k12, k22);
                    vc.K.GetInverse(vc.normalMass);
                }
                else {
                    vc.pointCount = 1;
                }
            }
        }
    };
    b2ContactSolver.prototype.WarmStart = function () {
        var P = b2ContactSolver.WarmStart_s_P;
        for (var i = 0; i < this.m_count; ++i) {
            var vc = this.m_velocityConstraints[i];
            var indexA = vc.indexA;
            var indexB = vc.indexB;
            var mA = vc.invMassA;
            var iA = vc.invIA;
            var mB = vc.invMassB;
            var iB = vc.invIB;
            var pointCount = vc.pointCount;
            var vA = this.m_velocities[indexA].v;
            var wA = this.m_velocities[indexA].w;
            var vB = this.m_velocities[indexB].v;
            var wB = this.m_velocities[indexB].w;
            var normal = vc.normal;
            var tangent = vc.tangent;
            for (var j = 0; j < pointCount; ++j) {
                var vcp = vc.points[j];
                b2Vec2.AddVV(b2Vec2.MulSV(vcp.normalImpulse, normal, b2Vec2.s_t0), b2Vec2.MulSV(vcp.tangentImpulse, tangent, b2Vec2.s_t1), P);
                wA -= iA * b2Vec2.CrossVV(vcp.rA, P);
                vA.SelfMulSub(mA, P);
                wB += iB * b2Vec2.CrossVV(vcp.rB, P);
                vB.SelfMulAdd(mB, P);
            }
            this.m_velocities[indexA].w = wA;
            this.m_velocities[indexB].w = wB;
        }
    };
    b2ContactSolver.prototype.SolveVelocityConstraints = function () {
        var dv = b2ContactSolver.SolveVelocityConstraints_s_dv;
        var dv1 = b2ContactSolver.SolveVelocityConstraints_s_dv1;
        var dv2 = b2ContactSolver.SolveVelocityConstraints_s_dv2;
        var P = b2ContactSolver.SolveVelocityConstraints_s_P;
        var a = b2ContactSolver.SolveVelocityConstraints_s_a;
        var b = b2ContactSolver.SolveVelocityConstraints_s_b;
        var x = b2ContactSolver.SolveVelocityConstraints_s_x;
        var d = b2ContactSolver.SolveVelocityConstraints_s_d;
        var P1 = b2ContactSolver.SolveVelocityConstraints_s_P1;
        var P2 = b2ContactSolver.SolveVelocityConstraints_s_P2;
        var P1P2 = b2ContactSolver.SolveVelocityConstraints_s_P1P2;
        for (var i = 0; i < this.m_count; ++i) {
            var vc = this.m_velocityConstraints[i];
            var indexA = vc.indexA;
            var indexB = vc.indexB;
            var mA = vc.invMassA;
            var iA = vc.invIA;
            var mB = vc.invMassB;
            var iB = vc.invIB;
            var pointCount = vc.pointCount;
            var vA = this.m_velocities[indexA].v;
            var wA = this.m_velocities[indexA].w;
            var vB = this.m_velocities[indexB].v;
            var wB = this.m_velocities[indexB].w;
            var normal = vc.normal;
            var tangent = vc.tangent;
            var friction = vc.friction;
            for (var j = 0; j < pointCount; ++j) {
                var vcp = vc.points[j];
                b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1), dv);
                var vt = b2Vec2.DotVV(dv, tangent) - vc.tangentSpeed;
                var lambda = vcp.tangentMass * (-vt);
                var maxFriction = friction * vcp.normalImpulse;
                var newImpulse = b2Clamp(vcp.tangentImpulse + lambda, (-maxFriction), maxFriction);
                lambda = newImpulse - vcp.tangentImpulse;
                vcp.tangentImpulse = newImpulse;
                b2Vec2.MulSV(lambda, tangent, P);
                vA.SelfMulSub(mA, P);
                wA -= iA * b2Vec2.CrossVV(vcp.rA, P);
                vB.SelfMulAdd(mB, P);
                wB += iB * b2Vec2.CrossVV(vcp.rB, P);
            }
            if (vc.pointCount === 1 || g_blockSolve === false) {
                for (var j = 0; j < pointCount; ++j) {
                    var vcp = vc.points[j];
                    b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1), dv);
                    var vn = b2Vec2.DotVV(dv, normal);
                    var lambda = (-vcp.normalMass * (vn - vcp.velocityBias));
                    var newImpulse = b2Max(vcp.normalImpulse + lambda, 0);
                    lambda = newImpulse - vcp.normalImpulse;
                    vcp.normalImpulse = newImpulse;
                    b2Vec2.MulSV(lambda, normal, P);
                    vA.SelfMulSub(mA, P);
                    wA -= iA * b2Vec2.CrossVV(vcp.rA, P);
                    vB.SelfMulAdd(mB, P);
                    wB += iB * b2Vec2.CrossVV(vcp.rB, P);
                }
            }
            else {
                var cp1 = vc.points[0];
                var cp2 = vc.points[1];
                a.Set(cp1.normalImpulse, cp2.normalImpulse);
                b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, cp1.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, cp1.rA, b2Vec2.s_t1), dv1);
                b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, cp2.rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, cp2.rA, b2Vec2.s_t1), dv2);
                var vn1 = b2Vec2.DotVV(dv1, normal);
                var vn2 = b2Vec2.DotVV(dv2, normal);
                b.x = vn1 - cp1.velocityBias;
                b.y = vn2 - cp2.velocityBias;
                b.SelfSub(b2Mat22.MulMV(vc.K, a, b2Vec2.s_t0));
                for (;;) {
                    b2Mat22.MulMV(vc.normalMass, b, x).SelfNeg();
                    if (x.x >= 0 && x.y >= 0) {
                        b2Vec2.SubVV(x, a, d);
                        b2Vec2.MulSV(d.x, normal, P1);
                        b2Vec2.MulSV(d.y, normal, P2);
                        b2Vec2.AddVV(P1, P2, P1P2);
                        vA.SelfMulSub(mA, P1P2);
                        wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));
                        vB.SelfMulAdd(mB, P1P2);
                        wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));
                        cp1.normalImpulse = x.x;
                        cp2.normalImpulse = x.y;
                        break;
                    }
                    x.x = (-cp1.normalMass * b.x);
                    x.y = 0;
                    vn1 = 0;
                    vn2 = vc.K.ex.y * x.x + b.y;
                    if (x.x >= 0 && vn2 >= 0) {
                        b2Vec2.SubVV(x, a, d);
                        b2Vec2.MulSV(d.x, normal, P1);
                        b2Vec2.MulSV(d.y, normal, P2);
                        b2Vec2.AddVV(P1, P2, P1P2);
                        vA.SelfMulSub(mA, P1P2);
                        wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));
                        vB.SelfMulAdd(mB, P1P2);
                        wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));
                        cp1.normalImpulse = x.x;
                        cp2.normalImpulse = x.y;
                        break;
                    }
                    x.x = 0;
                    x.y = (-cp2.normalMass * b.y);
                    vn1 = vc.K.ey.x * x.y + b.x;
                    vn2 = 0;
                    if (x.y >= 0 && vn1 >= 0) {
                        b2Vec2.SubVV(x, a, d);
                        b2Vec2.MulSV(d.x, normal, P1);
                        b2Vec2.MulSV(d.y, normal, P2);
                        b2Vec2.AddVV(P1, P2, P1P2);
                        vA.SelfMulSub(mA, P1P2);
                        wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));
                        vB.SelfMulAdd(mB, P1P2);
                        wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));
                        cp1.normalImpulse = x.x;
                        cp2.normalImpulse = x.y;
                        break;
                    }
                    x.x = 0;
                    x.y = 0;
                    vn1 = b.x;
                    vn2 = b.y;
                    if (vn1 >= 0 && vn2 >= 0) {
                        b2Vec2.SubVV(x, a, d);
                        b2Vec2.MulSV(d.x, normal, P1);
                        b2Vec2.MulSV(d.y, normal, P2);
                        b2Vec2.AddVV(P1, P2, P1P2);
                        vA.SelfMulSub(mA, P1P2);
                        wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));
                        vB.SelfMulAdd(mB, P1P2);
                        wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));
                        cp1.normalImpulse = x.x;
                        cp2.normalImpulse = x.y;
                        break;
                    }
                    break;
                }
            }
            this.m_velocities[indexA].w = wA;
            this.m_velocities[indexB].w = wB;
        }
    };
    b2ContactSolver.prototype.StoreImpulses = function () {
        for (var i = 0; i < this.m_count; ++i) {
            var vc = this.m_velocityConstraints[i];
            var manifold = this.m_contacts[vc.contactIndex].GetManifold();
            for (var j = 0; j < vc.pointCount; ++j) {
                manifold.points[j].normalImpulse = vc.points[j].normalImpulse;
                manifold.points[j].tangentImpulse = vc.points[j].tangentImpulse;
            }
        }
    };
    b2ContactSolver.prototype.SolvePositionConstraints = function () {
        var xfA = b2ContactSolver.SolvePositionConstraints_s_xfA;
        var xfB = b2ContactSolver.SolvePositionConstraints_s_xfB;
        var psm = b2ContactSolver.SolvePositionConstraints_s_psm;
        var rA = b2ContactSolver.SolvePositionConstraints_s_rA;
        var rB = b2ContactSolver.SolvePositionConstraints_s_rB;
        var P = b2ContactSolver.SolvePositionConstraints_s_P;
        var minSeparation = 0;
        for (var i = 0; i < this.m_count; ++i) {
            var pc = this.m_positionConstraints[i];
            var indexA = pc.indexA;
            var indexB = pc.indexB;
            var localCenterA = pc.localCenterA;
            var mA = pc.invMassA;
            var iA = pc.invIA;
            var localCenterB = pc.localCenterB;
            var mB = pc.invMassB;
            var iB = pc.invIB;
            var pointCount = pc.pointCount;
            var cA = this.m_positions[indexA].c;
            var aA = this.m_positions[indexA].a;
            var cB = this.m_positions[indexB].c;
            var aB = this.m_positions[indexB].a;
            for (var j = 0; j < pointCount; ++j) {
                xfA.q.SetAngle(aA);
                xfB.q.SetAngle(aB);
                b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
                b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);
                psm.Initialize(pc, xfA, xfB, j);
                var normal = psm.normal;
                var point = psm.point;
                var separation = psm.separation;
                b2Vec2.SubVV(point, cA, rA);
                b2Vec2.SubVV(point, cB, rB);
                minSeparation = b2Min(minSeparation, separation);
                var C = b2Clamp(b2_baumgarte * (separation + b2_linearSlop), (-b2_maxLinearCorrection), 0);
                var rnA = b2Vec2.CrossVV(rA, normal);
                var rnB = b2Vec2.CrossVV(rB, normal);
                var K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
                var impulse = K > 0 ? -C / K : 0;
                b2Vec2.MulSV(impulse, normal, P);
                cA.SelfMulSub(mA, P);
                aA -= iA * b2Vec2.CrossVV(rA, P);
                cB.SelfMulAdd(mB, P);
                aB += iB * b2Vec2.CrossVV(rB, P);
            }
            this.m_positions[indexA].a = aA;
            this.m_positions[indexB].a = aB;
        }
        return minSeparation > (-3 * b2_linearSlop);
    };
    b2ContactSolver.prototype.SolveTOIPositionConstraints = function (toiIndexA, toiIndexB) {
        var xfA = b2ContactSolver.SolveTOIPositionConstraints_s_xfA;
        var xfB = b2ContactSolver.SolveTOIPositionConstraints_s_xfB;
        var psm = b2ContactSolver.SolveTOIPositionConstraints_s_psm;
        var rA = b2ContactSolver.SolveTOIPositionConstraints_s_rA;
        var rB = b2ContactSolver.SolveTOIPositionConstraints_s_rB;
        var P = b2ContactSolver.SolveTOIPositionConstraints_s_P;
        var minSeparation = 0;
        for (var i = 0; i < this.m_count; ++i) {
            var pc = this.m_positionConstraints[i];
            var indexA = pc.indexA;
            var indexB = pc.indexB;
            var localCenterA = pc.localCenterA;
            var localCenterB = pc.localCenterB;
            var pointCount = pc.pointCount;
            var mA = 0;
            var iA = 0;
            if (indexA === toiIndexA || indexA === toiIndexB) {
                mA = pc.invMassA;
                iA = pc.invIA;
            }
            var mB = 0;
            var iB = 0;
            if (indexB === toiIndexA || indexB === toiIndexB) {
                mB = pc.invMassB;
                iB = pc.invIB;
            }
            var cA = this.m_positions[indexA].c;
            var aA = this.m_positions[indexA].a;
            var cB = this.m_positions[indexB].c;
            var aB = this.m_positions[indexB].a;
            for (var j = 0; j < pointCount; ++j) {
                xfA.q.SetAngle(aA);
                xfB.q.SetAngle(aB);
                b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
                b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);
                psm.Initialize(pc, xfA, xfB, j);
                var normal = psm.normal;
                var point = psm.point;
                var separation = psm.separation;
                b2Vec2.SubVV(point, cA, rA);
                b2Vec2.SubVV(point, cB, rB);
                minSeparation = b2Min(minSeparation, separation);
                var C = b2Clamp(b2_toiBaumgarte * (separation + b2_linearSlop), (-b2_maxLinearCorrection), 0);
                var rnA = b2Vec2.CrossVV(rA, normal);
                var rnB = b2Vec2.CrossVV(rB, normal);
                var K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
                var impulse = K > 0 ? -C / K : 0;
                b2Vec2.MulSV(impulse, normal, P);
                cA.SelfMulSub(mA, P);
                aA -= iA * b2Vec2.CrossVV(rA, P);
                cB.SelfMulAdd(mB, P);
                aB += iB * b2Vec2.CrossVV(rB, P);
            }
            this.m_positions[indexA].a = aA;
            this.m_positions[indexB].a = aB;
        }
        return minSeparation >= -1.5 * b2_linearSlop;
    };
    b2ContactSolver.InitializeVelocityConstraints_s_xfA = new b2Transform();
    b2ContactSolver.InitializeVelocityConstraints_s_xfB = new b2Transform();
    b2ContactSolver.InitializeVelocityConstraints_s_worldManifold = new b2WorldManifold();
    b2ContactSolver.WarmStart_s_P = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_dv = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_dv1 = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_dv2 = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_P = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_a = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_b = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_x = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_d = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_P1 = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_P2 = new b2Vec2();
    b2ContactSolver.SolveVelocityConstraints_s_P1P2 = new b2Vec2();
    b2ContactSolver.SolvePositionConstraints_s_xfA = new b2Transform();
    b2ContactSolver.SolvePositionConstraints_s_xfB = new b2Transform();
    b2ContactSolver.SolvePositionConstraints_s_psm = new b2PositionSolverManifold();
    b2ContactSolver.SolvePositionConstraints_s_rA = new b2Vec2();
    b2ContactSolver.SolvePositionConstraints_s_rB = new b2Vec2();
    b2ContactSolver.SolvePositionConstraints_s_P = new b2Vec2();
    b2ContactSolver.SolveTOIPositionConstraints_s_xfA = new b2Transform();
    b2ContactSolver.SolveTOIPositionConstraints_s_xfB = new b2Transform();
    b2ContactSolver.SolveTOIPositionConstraints_s_psm = new b2PositionSolverManifold();
    b2ContactSolver.SolveTOIPositionConstraints_s_rA = new b2Vec2();
    b2ContactSolver.SolveTOIPositionConstraints_s_rB = new b2Vec2();
    b2ContactSolver.SolveTOIPositionConstraints_s_P = new b2Vec2();
    return b2ContactSolver;
}());
//# sourceMappingURL=b2_contact_solver.js.map