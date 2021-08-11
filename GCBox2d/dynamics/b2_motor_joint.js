




var b2MotorJointDef = (function (_super) {
    __extends(b2MotorJointDef, _super);
    function b2MotorJointDef() {
        _super.call(this, b2JointType.e_motorJoint);
        this.linearOffset = new b2Vec2(0, 0);
        this.angularOffset = 0;
        this.maxForce = 1;
        this.maxTorque = 1;
        this.correctionFactor = 0.3;
    }
    b2MotorJointDef.prototype.Initialize = function (bA, bB) {
        this.bodyA = bA;
        this.bodyB = bB;
        this.bodyA.GetLocalPoint(this.bodyB.GetPosition(), this.linearOffset);
        var angleA = this.bodyA.GetAngle();
        var angleB = this.bodyB.GetAngle();
        this.angularOffset = angleB - angleA;
    };
    return b2MotorJointDef;
}(b2JointDef));
var b2MotorJoint = (function (_super) {
    __extends(b2MotorJoint, _super);
    function b2MotorJoint(def) {
        _super.call(this, def);
        this.m_linearOffset = new b2Vec2();
        this.m_angularOffset = 0;
        this.m_linearImpulse = new b2Vec2();
        this.m_angularImpulse = 0;
        this.m_maxForce = 0;
        this.m_maxTorque = 0;
        this.m_correctionFactor = 0.3;
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_rA = new b2Vec2();
        this.m_rB = new b2Vec2();
        this.m_localCenterA = new b2Vec2();
        this.m_localCenterB = new b2Vec2();
        this.m_linearError = new b2Vec2();
        this.m_angularError = 0;
        this.m_invMassA = 0;
        this.m_invMassB = 0;
        this.m_invIA = 0;
        this.m_invIB = 0;
        this.m_linearMass = new b2Mat22();
        this.m_angularMass = 0;
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_K = new b2Mat22();
        this.m_linearOffset.Copy(b2Maybe(def.linearOffset, b2Vec2.ZERO));
        this.m_linearImpulse.SetZero();
        this.m_maxForce = b2Maybe(def.maxForce, 0);
        this.m_maxTorque = b2Maybe(def.maxTorque, 0);
        this.m_correctionFactor = b2Maybe(def.correctionFactor, 0.3);
    }
    b2MotorJoint.prototype.GetAnchorA = function (out) {
        var pos = this.m_bodyA.GetPosition();
        out.x = pos.x;
        out.y = pos.y;
        return out;
    };
    b2MotorJoint.prototype.GetAnchorB = function (out) {
        var pos = this.m_bodyB.GetPosition();
        out.x = pos.x;
        out.y = pos.y;
        return out;
    };
    b2MotorJoint.prototype.GetReactionForce = function (inv_dt, out) {
        return b2Vec2.MulSV(inv_dt, this.m_linearImpulse, out);
    };
    b2MotorJoint.prototype.GetReactionTorque = function (inv_dt) {
        return inv_dt * this.m_angularImpulse;
    };
    b2MotorJoint.prototype.SetLinearOffset = function (linearOffset) {
        if (!b2Vec2.IsEqualToV(linearOffset, this.m_linearOffset)) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_linearOffset.Copy(linearOffset);
        }
    };
    b2MotorJoint.prototype.GetLinearOffset = function () {
        return this.m_linearOffset;
    };
    b2MotorJoint.prototype.SetAngularOffset = function (angularOffset) {
        if (angularOffset !== this.m_angularOffset) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_angularOffset = angularOffset;
        }
    };
    b2MotorJoint.prototype.GetAngularOffset = function () {
        return this.m_angularOffset;
    };
    b2MotorJoint.prototype.SetMaxForce = function (force) {
        this.m_maxForce = force;
    };
    b2MotorJoint.prototype.GetMaxForce = function () {
        return this.m_maxForce;
    };
    b2MotorJoint.prototype.SetMaxTorque = function (torque) {
        this.m_maxTorque = torque;
    };
    b2MotorJoint.prototype.GetMaxTorque = function () {
        return this.m_maxTorque;
    };
    b2MotorJoint.prototype.InitVelocityConstraints = function (data) {
        this.m_indexA = this.m_bodyA.m_islandIndex;
        this.m_indexB = this.m_bodyB.m_islandIndex;
        this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
        this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var cA = data.positions[this.m_indexA].c;
        var aA = data.positions[this.m_indexA].a;
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
        var rA = b2Rot.MulRV(qA, b2Vec2.SubVV(this.m_linearOffset, this.m_localCenterA, b2Vec2.s_t0), this.m_rA);
        var rB = b2Rot.MulRV(qB, b2Vec2.NegV(this.m_localCenterB, b2Vec2.s_t0), this.m_rB);
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
        b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), this.m_linearError);
        this.m_angularError = aB - aA - this.m_angularOffset;
        if (data.step.warmStarting) {
            this.m_linearImpulse.SelfMul(data.step.dtRatio);
            this.m_angularImpulse *= data.step.dtRatio;
            var P = this.m_linearImpulse;
            vA.SelfMulSub(mA, P);
            wA -= iA * (b2Vec2.CrossVV(rA, P) + this.m_angularImpulse);
            vB.SelfMulAdd(mB, P);
            wB += iB * (b2Vec2.CrossVV(rB, P) + this.m_angularImpulse);
        }
        else {
            this.m_linearImpulse.SetZero();
            this.m_angularImpulse = 0;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2MotorJoint.prototype.SolveVelocityConstraints = function (data) {
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        var h = data.step.dt;
        var inv_h = data.step.inv_dt;
        {
            var Cdot = wB - wA + inv_h * this.m_correctionFactor * this.m_angularError;
            var impulse = -this.m_angularMass * Cdot;
            var oldImpulse = this.m_angularImpulse;
            var maxImpulse = h * this.m_maxTorque;
            this.m_angularImpulse = b2Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
            impulse = this.m_angularImpulse - oldImpulse;
            wA -= iA * impulse;
            wB += iB * impulse;
        }
        {
            var rA = this.m_rA;
            var rB = this.m_rB;
            var Cdot_v2 = b2Vec2.AddVV(b2Vec2.SubVV(b2Vec2.AddVV(vB, b2Vec2.CrossSV(wB, rB, b2Vec2.s_t0), b2Vec2.s_t0), b2Vec2.AddVV(vA, b2Vec2.CrossSV(wA, rA, b2Vec2.s_t1), b2Vec2.s_t1), b2Vec2.s_t2), b2Vec2.MulSV(inv_h * this.m_correctionFactor, this.m_linearError, b2Vec2.s_t3), b2MotorJoint.SolveVelocityConstraints_s_Cdot_v2);
            var impulse_v2 = b2Mat22.MulMV(this.m_linearMass, Cdot_v2, b2MotorJoint.SolveVelocityConstraints_s_impulse_v2).SelfNeg();
            var oldImpulse_v2 = b2MotorJoint.SolveVelocityConstraints_s_oldImpulse_v2.Copy(this.m_linearImpulse);
            this.m_linearImpulse.SelfAdd(impulse_v2);
            var maxImpulse = h * this.m_maxForce;
            if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
                this.m_linearImpulse.Normalize();
                this.m_linearImpulse.SelfMul(maxImpulse);
            }
            b2Vec2.SubVV(this.m_linearImpulse, oldImpulse_v2, impulse_v2);
            vA.SelfMulSub(mA, impulse_v2);
            wA -= iA * b2Vec2.CrossVV(rA, impulse_v2);
            vB.SelfMulAdd(mB, impulse_v2);
            wB += iB * b2Vec2.CrossVV(rB, impulse_v2);
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2MotorJoint.prototype.SolvePositionConstraints = function (data) {
        return true;
    };
    b2MotorJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        log("  const jd: b2MotorJointDef = new b2MotorJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.linearOffset.Set(%.15f, %.15f);\n", this.m_linearOffset.x, this.m_linearOffset.y);
        log("  jd.angularOffset = %.15f;\n", this.m_angularOffset);
        log("  jd.maxForce = %.15f;\n", this.m_maxForce);
        log("  jd.maxTorque = %.15f;\n", this.m_maxTorque);
        log("  jd.correctionFactor = %.15f;\n", this.m_correctionFactor);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2MotorJoint.SolveVelocityConstraints_s_Cdot_v2 = new b2Vec2();
    b2MotorJoint.SolveVelocityConstraints_s_impulse_v2 = new b2Vec2();
    b2MotorJoint.SolveVelocityConstraints_s_oldImpulse_v2 = new b2Vec2();
    return b2MotorJoint;
}(b2Joint));
//# sourceMappingURL=b2_motor_joint.js.map