




var b2WeldJointDef = (function (_super) {
    __extends(b2WeldJointDef, _super);
    function b2WeldJointDef() {
        _super.call(this, b2JointType.e_weldJoint);
        this.localAnchorA = new b2Vec2();
        this.localAnchorB = new b2Vec2();
        this.referenceAngle = 0;
        this.stiffness = 0;
        this.damping = 0;
    }
    b2WeldJointDef.prototype.Initialize = function (bA, bB, anchor) {
        this.bodyA = bA;
        this.bodyB = bB;
        this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
        this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
        this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
    };
    return b2WeldJointDef;
}(b2JointDef));
var b2WeldJoint = (function (_super) {
    __extends(b2WeldJoint, _super);
    function b2WeldJoint(def) {
        _super.call(this, def);
        this.m_stiffness = 0;
        this.m_damping = 0;
        this.m_bias = 0;
        this.m_localAnchorA = new b2Vec2();
        this.m_localAnchorB = new b2Vec2();
        this.m_referenceAngle = 0;
        this.m_gamma = 0;
        this.m_impulse = new b2Vec3(0, 0, 0);
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
        this.m_mass = new b2Mat33();
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_lalcA = new b2Vec2();
        this.m_lalcB = new b2Vec2();
        this.m_K = new b2Mat33();
        this.m_stiffness = b2Maybe(def.stiffness, 0);
        this.m_damping = b2Maybe(def.damping, 0);
        this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
        this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
        this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);
        this.m_impulse.SetZero();
    }
    b2WeldJoint.prototype.InitVelocityConstraints = function (data) {
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
        b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
        b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
        b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        var K = this.m_K;
        K.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
        K.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
        K.ez.x = -this.m_rA.y * iA - this.m_rB.y * iB;
        K.ex.y = K.ey.x;
        K.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
        K.ez.y = this.m_rA.x * iA + this.m_rB.x * iB;
        K.ex.z = K.ez.x;
        K.ey.z = K.ez.y;
        K.ez.z = iA + iB;
        if (this.m_stiffness > 0) {
            K.GetInverse22(this.m_mass);
            var invM = iA + iB;
            var C = aB - aA - this.m_referenceAngle;
            var d = this.m_damping;
            var k = this.m_stiffness;
            var h = data.step.dt;
            this.m_gamma = h * (d + h * k);
            this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma : 0;
            this.m_bias = C * h * k * this.m_gamma;
            invM += this.m_gamma;
            this.m_mass.ez.z = invM !== 0 ? 1 / invM : 0;
        }
        else {
            K.GetSymInverse33(this.m_mass);
            this.m_gamma = 0;
            this.m_bias = 0;
        }
        if (data.step.warmStarting) {
            this.m_impulse.SelfMul(data.step.dtRatio);
            var P = b2WeldJoint.InitVelocityConstraints_s_P.Set(this.m_impulse.x, this.m_impulse.y);
            vA.SelfMulSub(mA, P);
            wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + this.m_impulse.z);
            vB.SelfMulAdd(mB, P);
            wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + this.m_impulse.z);
        }
        else {
            this.m_impulse.SetZero();
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2WeldJoint.prototype.SolveVelocityConstraints = function (data) {
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        if (this.m_stiffness > 0) {
            var Cdot2 = wB - wA;
            var impulse2 = -this.m_mass.ez.z * (Cdot2 + this.m_bias + this.m_gamma * this.m_impulse.z);
            this.m_impulse.z += impulse2;
            wA -= iA * impulse2;
            wB += iB * impulse2;
            var Cdot1 = b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1), b2WeldJoint.SolveVelocityConstraints_s_Cdot1);
            var impulse1 = b2Mat33.MulM33XY(this.m_mass, Cdot1.x, Cdot1.y, b2WeldJoint.SolveVelocityConstraints_s_impulse1).SelfNeg();
            this.m_impulse.x += impulse1.x;
            this.m_impulse.y += impulse1.y;
            var P = impulse1;
            vA.SelfMulSub(mA, P);
            wA -= iA * b2Vec2.CrossVV(this.m_rA, P);
            vB.SelfMulAdd(mB, P);
            wB += iB * b2Vec2.CrossVV(this.m_rB, P);
        }
        else {
            var Cdot1 = b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1), b2WeldJoint.SolveVelocityConstraints_s_Cdot1);
            var Cdot2 = wB - wA;
            var impulse = b2Mat33.MulM33XYZ(this.m_mass, Cdot1.x, Cdot1.y, Cdot2, b2WeldJoint.SolveVelocityConstraints_s_impulse).SelfNeg();
            this.m_impulse.SelfAdd(impulse);
            var P = b2WeldJoint.SolveVelocityConstraints_s_P.Set(impulse.x, impulse.y);
            vA.SelfMulSub(mA, P);
            wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + impulse.z);
            vB.SelfMulAdd(mB, P);
            wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + impulse.z);
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2WeldJoint.prototype.SolvePositionConstraints = function (data) {
        var cA = data.positions[this.m_indexA].c;
        var aA = data.positions[this.m_indexA].a;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
        var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
        b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
        var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        var positionError, angularError;
        var K = this.m_K;
        K.ex.x = mA + mB + rA.y * rA.y * iA + rB.y * rB.y * iB;
        K.ey.x = -rA.y * rA.x * iA - rB.y * rB.x * iB;
        K.ez.x = -rA.y * iA - rB.y * iB;
        K.ex.y = K.ey.x;
        K.ey.y = mA + mB + rA.x * rA.x * iA + rB.x * rB.x * iB;
        K.ez.y = rA.x * iA + rB.x * iB;
        K.ex.z = K.ez.x;
        K.ey.z = K.ez.y;
        K.ez.z = iA + iB;
        if (this.m_stiffness > 0) {
            var C1 = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2WeldJoint.SolvePositionConstraints_s_C1);
            positionError = C1.Length();
            angularError = 0;
            var P = K.Solve22(C1.x, C1.y, b2WeldJoint.SolvePositionConstraints_s_P).SelfNeg();
            cA.SelfMulSub(mA, P);
            aA -= iA * b2Vec2.CrossVV(rA, P);
            cB.SelfMulAdd(mB, P);
            aB += iB * b2Vec2.CrossVV(rB, P);
        }
        else {
            var C1 = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2WeldJoint.SolvePositionConstraints_s_C1);
            var C2 = aB - aA - this.m_referenceAngle;
            positionError = C1.Length();
            angularError = b2Abs(C2);
            var impulse = K.Solve33(C1.x, C1.y, C2, b2WeldJoint.SolvePositionConstraints_s_impulse).SelfNeg();
            var P = b2WeldJoint.SolvePositionConstraints_s_P.Set(impulse.x, impulse.y);
            cA.SelfMulSub(mA, P);
            aA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + impulse.z);
            cB.SelfMulAdd(mB, P);
            aB += iB * (b2Vec2.CrossVV(this.m_rB, P) + impulse.z);
        }
        data.positions[this.m_indexA].a = aA;
        data.positions[this.m_indexB].a = aB;
        return positionError <= b2_linearSlop && angularError <= b2_angularSlop;
    };
    b2WeldJoint.prototype.GetAnchorA = function (out) {
        return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
    };
    b2WeldJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2WeldJoint.prototype.GetReactionForce = function (inv_dt, out) {
        out.x = inv_dt * this.m_impulse.x;
        out.y = inv_dt * this.m_impulse.y;
        return out;
    };
    b2WeldJoint.prototype.GetReactionTorque = function (inv_dt) {
        return inv_dt * this.m_impulse.z;
    };
    b2WeldJoint.prototype.GetLocalAnchorA = function () { return this.m_localAnchorA; };
    b2WeldJoint.prototype.GetLocalAnchorB = function () { return this.m_localAnchorB; };
    b2WeldJoint.prototype.GetReferenceAngle = function () { return this.m_referenceAngle; };
    b2WeldJoint.prototype.SetStiffness = function (stiffness) { this.m_stiffness = stiffness; };
    b2WeldJoint.prototype.GetStiffness = function () { return this.m_stiffness; };
    b2WeldJoint.prototype.SetDamping = function (damping) { this.m_damping = damping; };
    b2WeldJoint.prototype.GetDamping = function () { return this.m_damping; };
    b2WeldJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        log("  const jd: b2WeldJointDef = new b2WeldJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
        log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
        log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
        log("  jd.stiffness = %.15f;\n", this.m_stiffness);
        log("  jd.damping = %.15f;\n", this.m_damping);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2WeldJoint.InitVelocityConstraints_s_P = new b2Vec2();
    b2WeldJoint.SolveVelocityConstraints_s_Cdot1 = new b2Vec2();
    b2WeldJoint.SolveVelocityConstraints_s_impulse1 = new b2Vec2();
    b2WeldJoint.SolveVelocityConstraints_s_impulse = new b2Vec3();
    b2WeldJoint.SolveVelocityConstraints_s_P = new b2Vec2();
    b2WeldJoint.SolvePositionConstraints_s_C1 = new b2Vec2();
    b2WeldJoint.SolvePositionConstraints_s_P = new b2Vec2();
    b2WeldJoint.SolvePositionConstraints_s_impulse = new b2Vec3();
    return b2WeldJoint;
}(b2Joint));
//# sourceMappingURL=b2_weld_joint.js.map