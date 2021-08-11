




var b2FrictionJointDef = (function (_super) {
    __extends(b2FrictionJointDef, _super);
    function b2FrictionJointDef() {
        _super.call(this, b2JointType.e_frictionJoint);
        this.localAnchorA = new b2Vec2();
        this.localAnchorB = new b2Vec2();
        this.maxForce = 0;
        this.maxTorque = 0;
    }
    b2FrictionJointDef.prototype.Initialize = function (bA, bB, anchor) {
        this.bodyA = bA;
        this.bodyB = bB;
        this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
        this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
    };
    return b2FrictionJointDef;
}(b2JointDef));
var b2FrictionJoint = (function (_super) {
    __extends(b2FrictionJoint, _super);
    function b2FrictionJoint(def) {
        _super.call(this, def);
        this.m_localAnchorA = new b2Vec2();
        this.m_localAnchorB = new b2Vec2();
        this.m_linearImpulse = new b2Vec2();
        this.m_angularImpulse = 0;
        this.m_maxForce = 0;
        this.m_maxTorque = 0;
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_rA = new b2Vec2();
        this.m_rB = new b2Vec2();
        this.m_localCenterA = new b2Vec2();
        this.m_localCenterB = new b2Vec2();
        this.m_invMassA = 0;
        this.m_invMassB = 0;
        this.m_invIA = 0;
        this.m_invIB = 0;
        this.m_linearMass = new b2Mat22();
        this.m_angularMass = 0;
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_lalcA = new b2Vec2();
        this.m_lalcB = new b2Vec2();
        this.m_K = new b2Mat22();
        this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
        this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
        this.m_linearImpulse.SetZero();
        this.m_maxForce = b2Maybe(def.maxForce, 0);
        this.m_maxTorque = b2Maybe(def.maxTorque, 0);
        this.m_linearMass.SetZero();
    }
    b2FrictionJoint.prototype.InitVelocityConstraints = function (data) {
        this.m_indexA = this.m_bodyA.m_islandIndex;
        this.m_indexB = this.m_bodyB.m_islandIndex;
        this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
        this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var aA = data.positions[this.m_indexA].a;
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var aB = data.positions[this.m_indexB].a;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
        b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
        var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
        b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
        var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        var K = this.m_K;
        K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
        K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
        K.ey.x = K.ex.y;
        K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;
        K.GetInverse(this.m_linearMass);
        this.m_angularMass = iA + iB;
        if (this.m_angularMass > 0) {
            this.m_angularMass = 1 / this.m_angularMass;
        }
        if (data.step.warmStarting) {
            this.m_linearImpulse.SelfMul(data.step.dtRatio);
            this.m_angularImpulse *= data.step.dtRatio;
            var P = this.m_linearImpulse;
            vA.SelfMulSub(mA, P);
            wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + this.m_angularImpulse);
            vB.SelfMulAdd(mB, P);
            wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + this.m_angularImpulse);
        }
        else {
            this.m_linearImpulse.SetZero();
            this.m_angularImpulse = 0;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2FrictionJoint.prototype.SolveVelocityConstraints = function (data) {
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        var h = data.step.dt;
        {
            var Cdot = wB - wA;
            var impulse = (-this.m_angularMass * Cdot);
            var oldImpulse = this.m_angularImpulse;
            var maxImpulse = h * this.m_maxTorque;
            this.m_angularImpulse = b2Clamp(this.m_angularImpulse + impulse, (-maxImpulse), maxImpulse);
            impulse = this.m_angularImpulse - oldImpulse;
            wA -= iA * impulse;
            wB += iB * impulse;
        }
        {
            var Cdot_v2 = b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1), b2FrictionJoint.SolveVelocityConstraints_s_Cdot_v2);
            var impulseV = b2Mat22.MulMV(this.m_linearMass, Cdot_v2, b2FrictionJoint.SolveVelocityConstraints_s_impulseV).SelfNeg();
            var oldImpulseV = b2FrictionJoint.SolveVelocityConstraints_s_oldImpulseV.Copy(this.m_linearImpulse);
            this.m_linearImpulse.SelfAdd(impulseV);
            var maxImpulse = h * this.m_maxForce;
            if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
                this.m_linearImpulse.Normalize();
                this.m_linearImpulse.SelfMul(maxImpulse);
            }
            b2Vec2.SubVV(this.m_linearImpulse, oldImpulseV, impulseV);
            vA.SelfMulSub(mA, impulseV);
            wA -= iA * b2Vec2.CrossVV(this.m_rA, impulseV);
            vB.SelfMulAdd(mB, impulseV);
            wB += iB * b2Vec2.CrossVV(this.m_rB, impulseV);
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2FrictionJoint.prototype.SolvePositionConstraints = function (data) {
        return true;
    };
    b2FrictionJoint.prototype.GetAnchorA = function (out) {
        return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
    };
    b2FrictionJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2FrictionJoint.prototype.GetReactionForce = function (inv_dt, out) {
        out.x = inv_dt * this.m_linearImpulse.x;
        out.y = inv_dt * this.m_linearImpulse.y;
        return out;
    };
    b2FrictionJoint.prototype.GetReactionTorque = function (inv_dt) {
        return inv_dt * this.m_angularImpulse;
    };
    b2FrictionJoint.prototype.GetLocalAnchorA = function () { return this.m_localAnchorA; };
    b2FrictionJoint.prototype.GetLocalAnchorB = function () { return this.m_localAnchorB; };
    b2FrictionJoint.prototype.SetMaxForce = function (force) {
        this.m_maxForce = force;
    };
    b2FrictionJoint.prototype.GetMaxForce = function () {
        return this.m_maxForce;
    };
    b2FrictionJoint.prototype.SetMaxTorque = function (torque) {
        this.m_maxTorque = torque;
    };
    b2FrictionJoint.prototype.GetMaxTorque = function () {
        return this.m_maxTorque;
    };
    b2FrictionJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        log("  const jd: b2FrictionJointDef = new b2FrictionJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
        log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
        log("  jd.maxForce = %.15f;\n", this.m_maxForce);
        log("  jd.maxTorque = %.15f;\n", this.m_maxTorque);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2FrictionJoint.SolveVelocityConstraints_s_Cdot_v2 = new b2Vec2();
    b2FrictionJoint.SolveVelocityConstraints_s_impulseV = new b2Vec2();
    b2FrictionJoint.SolveVelocityConstraints_s_oldImpulseV = new b2Vec2();
    return b2FrictionJoint;
}(b2Joint));
//# sourceMappingURL=b2_friction_joint.js.map