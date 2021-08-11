




var b2PrismaticJointDef = (function (_super) {
    __extends(b2PrismaticJointDef, _super);
    function b2PrismaticJointDef() {
        _super.call(this, b2JointType.e_prismaticJoint);
        this.localAnchorA = new b2Vec2();
        this.localAnchorB = new b2Vec2();
        this.localAxisA = new b2Vec2(1, 0);
        this.referenceAngle = 0;
        this.enableLimit = false;
        this.lowerTranslation = 0;
        this.upperTranslation = 0;
        this.enableMotor = false;
        this.maxMotorForce = 0;
        this.motorSpeed = 0;
    }
    b2PrismaticJointDef.prototype.Initialize = function (bA, bB, anchor, axis) {
        this.bodyA = bA;
        this.bodyB = bB;
        this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
        this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
        this.bodyA.GetLocalVector(axis, this.localAxisA);
        this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
    };
    return b2PrismaticJointDef;
}(b2JointDef));
var b2PrismaticJoint = (function (_super) {
    __extends(b2PrismaticJoint, _super);
    function b2PrismaticJoint(def) {
        _super.call(this, def);
        this.m_localAnchorA = new b2Vec2();
        this.m_localAnchorB = new b2Vec2();
        this.m_localXAxisA = new b2Vec2();
        this.m_localYAxisA = new b2Vec2();
        this.m_referenceAngle = 0;
        this.m_impulse = new b2Vec2(0, 0);
        this.m_motorImpulse = 0;
        this.m_lowerImpulse = 0;
        this.m_upperImpulse = 0;
        this.m_lowerTranslation = 0;
        this.m_upperTranslation = 0;
        this.m_maxMotorForce = 0;
        this.m_motorSpeed = 0;
        this.m_enableLimit = false;
        this.m_enableMotor = false;
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_localCenterA = new b2Vec2();
        this.m_localCenterB = new b2Vec2();
        this.m_invMassA = 0;
        this.m_invMassB = 0;
        this.m_invIA = 0;
        this.m_invIB = 0;
        this.m_axis = new b2Vec2(0, 0);
        this.m_perp = new b2Vec2(0, 0);
        this.m_s1 = 0;
        this.m_s2 = 0;
        this.m_a1 = 0;
        this.m_a2 = 0;
        this.m_K = new b2Mat22();
        this.m_K3 = new b2Mat33();
        this.m_K2 = new b2Mat22();
        this.m_translation = 0;
        this.m_axialMass = 0;
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_lalcA = new b2Vec2();
        this.m_lalcB = new b2Vec2();
        this.m_rA = new b2Vec2();
        this.m_rB = new b2Vec2();
        this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
        this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
        this.m_localXAxisA.Copy(b2Maybe(def.localAxisA, new b2Vec2(1, 0))).SelfNormalize();
        b2Vec2.CrossOneV(this.m_localXAxisA, this.m_localYAxisA);
        this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);
        this.m_lowerTranslation = b2Maybe(def.lowerTranslation, 0);
        this.m_upperTranslation = b2Maybe(def.upperTranslation, 0);
        this.m_maxMotorForce = b2Maybe(def.maxMotorForce, 0);
        this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
        this.m_enableLimit = b2Maybe(def.enableLimit, false);
        this.m_enableMotor = b2Maybe(def.enableMotor, false);
    }
    b2PrismaticJoint.prototype.InitVelocityConstraints = function (data) {
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
        b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
        var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
        b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
        var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        var d = b2Vec2.AddVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), b2Vec2.SubVV(rB, rA, b2Vec2.s_t1), b2PrismaticJoint.InitVelocityConstraints_s_d);
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        {
            b2Rot.MulRV(qA, this.m_localXAxisA, this.m_axis);
            this.m_a1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_axis);
            this.m_a2 = b2Vec2.CrossVV(rB, this.m_axis);
            this.m_axialMass = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2 * this.m_a2;
            if (this.m_axialMass > 0) {
                this.m_axialMass = 1 / this.m_axialMass;
            }
        }
        {
            b2Rot.MulRV(qA, this.m_localYAxisA, this.m_perp);
            this.m_s1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_perp);
            this.m_s2 = b2Vec2.CrossVV(rB, this.m_perp);
            this.m_K.ex.x = mA + mB + iA * this.m_s1 * this.m_s1 + iB * this.m_s2 * this.m_s2;
            this.m_K.ex.y = iA * this.m_s1 + iB * this.m_s2;
            this.m_K.ey.x = this.m_K.ex.y;
            this.m_K.ey.y = iA + iB;
            if (this.m_K.ey.y === 0) {
                this.m_K.ey.y = 1;
            }
        }
        if (this.m_enableLimit) {
            this.m_translation = b2Vec2.DotVV(this.m_axis, d);
        }
        else {
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
        if (!this.m_enableMotor) {
            this.m_motorImpulse = 0;
        }
        if (data.step.warmStarting) {
            this.m_impulse.SelfMul(data.step.dtRatio);
            this.m_motorImpulse *= data.step.dtRatio;
            this.m_lowerImpulse *= data.step.dtRatio;
            this.m_upperImpulse *= data.step.dtRatio;
            var axialImpulse = this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse;
            var P = b2Vec2.AddVV(b2Vec2.MulSV(this.m_impulse.x, this.m_perp, b2Vec2.s_t0), b2Vec2.MulSV(axialImpulse, this.m_axis, b2Vec2.s_t1), b2PrismaticJoint.InitVelocityConstraints_s_P);
            var LA = this.m_impulse.x * this.m_s1 + this.m_impulse.y + axialImpulse * this.m_a1;
            var LB = this.m_impulse.x * this.m_s2 + this.m_impulse.y + axialImpulse * this.m_a2;
            vA.SelfMulSub(mA, P);
            wA -= iA * LA;
            vB.SelfMulAdd(mB, P);
            wB += iB * LB;
        }
        else {
            this.m_impulse.SetZero();
            this.m_motorImpulse = 0.0;
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2PrismaticJoint.prototype.SolveVelocityConstraints = function (data) {
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        if (this.m_enableMotor) {
            var Cdot = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_a2 * wB - this.m_a1 * wA;
            var impulse = this.m_axialMass * (this.m_motorSpeed - Cdot);
            var oldImpulse = this.m_motorImpulse;
            var maxImpulse = data.step.dt * this.m_maxMotorForce;
            this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, (-maxImpulse), maxImpulse);
            impulse = this.m_motorImpulse - oldImpulse;
            var P = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
            var LA = impulse * this.m_a1;
            var LB = impulse * this.m_a2;
            vA.SelfMulSub(mA, P);
            wA -= iA * LA;
            vB.SelfMulAdd(mB, P);
            wB += iB * LB;
        }
        if (this.m_enableLimit) {
            {
                var C = this.m_translation - this.m_lowerTranslation;
                var Cdot = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_a2 * wB - this.m_a1 * wA;
                var impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                var oldImpulse = this.m_lowerImpulse;
                this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
                impulse = this.m_lowerImpulse - oldImpulse;
                var P = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
                var LA = impulse * this.m_a1;
                var LB = impulse * this.m_a2;
                vA.SelfMulSub(mA, P);
                wA -= iA * LA;
                vB.SelfMulAdd(mB, P);
                wB += iB * LB;
            }
            {
                var C = this.m_upperTranslation - this.m_translation;
                var Cdot = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vA, vB, b2Vec2.s_t0)) + this.m_a1 * wA - this.m_a2 * wB;
                var impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                var oldImpulse = this.m_upperImpulse;
                this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
                impulse = this.m_upperImpulse - oldImpulse;
                var P = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
                var LA = impulse * this.m_a1;
                var LB = impulse * this.m_a2;
                vA.SelfMulAdd(mA, P);
                wA += iA * LA;
                vB.SelfMulSub(mB, P);
                wB -= iB * LB;
            }
        }
        {
            var Cdot_x = b2Vec2.DotVV(this.m_perp, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_s2 * wB - this.m_s1 * wA;
            var Cdot_y = wB - wA;
            var df = this.m_K.Solve(-Cdot_x, -Cdot_y, b2PrismaticJoint.SolveVelocityConstraints_s_df);
            this.m_impulse.SelfAdd(df);
            var P = b2Vec2.MulSV(df.x, this.m_perp, b2PrismaticJoint.SolveVelocityConstraints_s_P);
            var LA = df.x * this.m_s1 + df.y;
            var LB = df.x * this.m_s2 + df.y;
            vA.SelfMulSub(mA, P);
            wA -= iA * LA;
            vB.SelfMulAdd(mB, P);
            wB += iB * LB;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2PrismaticJoint.prototype.SolvePositionConstraints = function (data) {
        var cA = data.positions[this.m_indexA].c;
        var aA = data.positions[this.m_indexA].a;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
        var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        var d = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2PrismaticJoint.SolvePositionConstraints_s_d);
        var axis = b2Rot.MulRV(qA, this.m_localXAxisA, this.m_axis);
        var a1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), axis);
        var a2 = b2Vec2.CrossVV(rB, axis);
        var perp = b2Rot.MulRV(qA, this.m_localYAxisA, this.m_perp);
        var s1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), perp);
        var s2 = b2Vec2.CrossVV(rB, perp);
        var impulse = b2PrismaticJoint.SolvePositionConstraints_s_impulse;
        var C1_x = b2Vec2.DotVV(perp, d);
        var C1_y = aB - aA - this.m_referenceAngle;
        var linearError = b2Abs(C1_x);
        var angularError = b2Abs(C1_y);
        var active = false;
        var C2 = 0;
        if (this.m_enableLimit) {
            var translation = b2Vec2.DotVV(axis, d);
            if (b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2_linearSlop) {
                C2 = translation;
                linearError = b2Max(linearError, b2Abs(translation));
                active = true;
            }
            else if (translation <= this.m_lowerTranslation) {
                C2 = b2Min(translation - this.m_lowerTranslation, 0.0);
                linearError = b2Max(linearError, this.m_lowerTranslation - translation);
                active = true;
            }
            else if (translation >= this.m_upperTranslation) {
                C2 = b2Max(translation - this.m_upperTranslation, 0.0);
                linearError = b2Max(linearError, translation - this.m_upperTranslation);
                active = true;
            }
        }
        if (active) {
            var k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
            var k12 = iA * s1 + iB * s2;
            var k13 = iA * s1 * a1 + iB * s2 * a2;
            var k22 = iA + iB;
            if (k22 === 0) {
                k22 = 1;
            }
            var k23 = iA * a1 + iB * a2;
            var k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;
            var K = this.m_K3;
            K.ex.SetXYZ(k11, k12, k13);
            K.ey.SetXYZ(k12, k22, k23);
            K.ez.SetXYZ(k13, k23, k33);
            impulse = K.Solve33((-C1_x), (-C1_y), (-C2), impulse);
        }
        else {
            var k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
            var k12 = iA * s1 + iB * s2;
            var k22 = iA + iB;
            if (k22 === 0) {
                k22 = 1;
            }
            var K2 = this.m_K2;
            K2.ex.Set(k11, k12);
            K2.ey.Set(k12, k22);
            var impulse1 = K2.Solve((-C1_x), (-C1_y), b2PrismaticJoint.SolvePositionConstraints_s_impulse1);
            impulse.x = impulse1.x;
            impulse.y = impulse1.y;
            impulse.z = 0;
        }
        var P = b2Vec2.AddVV(b2Vec2.MulSV(impulse.x, perp, b2Vec2.s_t0), b2Vec2.MulSV(impulse.z, axis, b2Vec2.s_t1), b2PrismaticJoint.SolvePositionConstraints_s_P);
        var LA = impulse.x * s1 + impulse.y + impulse.z * a1;
        var LB = impulse.x * s2 + impulse.y + impulse.z * a2;
        cA.SelfMulSub(mA, P);
        aA -= iA * LA;
        cB.SelfMulAdd(mB, P);
        aB += iB * LB;
        data.positions[this.m_indexA].a = aA;
        data.positions[this.m_indexB].a = aB;
        return linearError <= b2_linearSlop && angularError <= b2_angularSlop;
    };
    b2PrismaticJoint.prototype.GetAnchorA = function (out) {
        return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
    };
    b2PrismaticJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2PrismaticJoint.prototype.GetReactionForce = function (inv_dt, out) {
        out.x = inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_axis.x);
        out.y = inv_dt * (this.m_impulse.y * this.m_perp.y + (this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_axis.y);
        return out;
    };
    b2PrismaticJoint.prototype.GetReactionTorque = function (inv_dt) {
        return inv_dt * this.m_impulse.y;
    };
    b2PrismaticJoint.prototype.GetLocalAnchorA = function () { return this.m_localAnchorA; };
    b2PrismaticJoint.prototype.GetLocalAnchorB = function () { return this.m_localAnchorB; };
    b2PrismaticJoint.prototype.GetLocalAxisA = function () { return this.m_localXAxisA; };
    b2PrismaticJoint.prototype.GetReferenceAngle = function () { return this.m_referenceAngle; };
    b2PrismaticJoint.prototype.GetJointTranslation = function () {
        var pA = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, b2PrismaticJoint.GetJointTranslation_s_pA);
        var pB = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, b2PrismaticJoint.GetJointTranslation_s_pB);
        var d = b2Vec2.SubVV(pB, pA, b2PrismaticJoint.GetJointTranslation_s_d);
        var axis = this.m_bodyA.GetWorldVector(this.m_localXAxisA, b2PrismaticJoint.GetJointTranslation_s_axis);
        var translation = b2Vec2.DotVV(d, axis);
        return translation;
    };
    b2PrismaticJoint.prototype.GetJointSpeed = function () {
        var bA = this.m_bodyA;
        var bB = this.m_bodyB;
        b2Vec2.SubVV(this.m_localAnchorA, bA.m_sweep.localCenter, this.m_lalcA);
        var rA = b2Rot.MulRV(bA.m_xf.q, this.m_lalcA, this.m_rA);
        b2Vec2.SubVV(this.m_localAnchorB, bB.m_sweep.localCenter, this.m_lalcB);
        var rB = b2Rot.MulRV(bB.m_xf.q, this.m_lalcB, this.m_rB);
        var pA = b2Vec2.AddVV(bA.m_sweep.c, rA, b2Vec2.s_t0);
        var pB = b2Vec2.AddVV(bB.m_sweep.c, rB, b2Vec2.s_t1);
        var d = b2Vec2.SubVV(pB, pA, b2Vec2.s_t2);
        var axis = bA.GetWorldVector(this.m_localXAxisA, this.m_axis);
        var vA = bA.m_linearVelocity;
        var vB = bB.m_linearVelocity;
        var wA = bA.m_angularVelocity;
        var wB = bB.m_angularVelocity;
        var speed = b2Vec2.DotVV(d, b2Vec2.CrossSV(wA, axis, b2Vec2.s_t0)) +
            b2Vec2.DotVV(axis, b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, rA, b2Vec2.s_t1), b2Vec2.s_t0));
        return speed;
    };
    b2PrismaticJoint.prototype.IsLimitEnabled = function () {
        return this.m_enableLimit;
    };
    b2PrismaticJoint.prototype.EnableLimit = function (flag) {
        if (flag !== this.m_enableLimit) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_enableLimit = flag;
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
    };
    b2PrismaticJoint.prototype.GetLowerLimit = function () {
        return this.m_lowerTranslation;
    };
    b2PrismaticJoint.prototype.GetUpperLimit = function () {
        return this.m_upperTranslation;
    };
    b2PrismaticJoint.prototype.SetLimits = function (lower, upper) {
        if (lower !== this.m_lowerTranslation || upper !== this.m_upperTranslation) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_lowerTranslation = lower;
            this.m_upperTranslation = upper;
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
    };
    b2PrismaticJoint.prototype.IsMotorEnabled = function () {
        return this.m_enableMotor;
    };
    b2PrismaticJoint.prototype.EnableMotor = function (flag) {
        if (flag !== this.m_enableMotor) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_enableMotor = flag;
        }
    };
    b2PrismaticJoint.prototype.SetMotorSpeed = function (speed) {
        if (speed !== this.m_motorSpeed) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_motorSpeed = speed;
        }
    };
    b2PrismaticJoint.prototype.GetMotorSpeed = function () {
        return this.m_motorSpeed;
    };
    b2PrismaticJoint.prototype.SetMaxMotorForce = function (force) {
        if (force !== this.m_maxMotorForce) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_maxMotorForce = force;
        }
    };
    b2PrismaticJoint.prototype.GetMaxMotorForce = function () { return this.m_maxMotorForce; };
    b2PrismaticJoint.prototype.GetMotorForce = function (inv_dt) {
        return inv_dt * this.m_motorImpulse;
    };
    b2PrismaticJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        log("  const jd: b2PrismaticJointDef = new b2PrismaticJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
        log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
        log("  jd.localAxisA.Set(%.15f, %.15f);\n", this.m_localXAxisA.x, this.m_localXAxisA.y);
        log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
        log("  jd.enableLimit = %s;\n", (this.m_enableLimit) ? ("true") : ("false"));
        log("  jd.lowerTranslation = %.15f;\n", this.m_lowerTranslation);
        log("  jd.upperTranslation = %.15f;\n", this.m_upperTranslation);
        log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
        log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
        log("  jd.maxMotorForce = %.15f;\n", this.m_maxMotorForce);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2PrismaticJoint.prototype.Draw = function (draw) {
        var xfA = this.m_bodyA.GetTransform();
        var xfB = this.m_bodyB.GetTransform();
        var pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2PrismaticJoint.Draw_s_pA);
        var pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2PrismaticJoint.Draw_s_pB);
        var axis = b2Rot.MulRV(xfA.q, this.m_localXAxisA, b2PrismaticJoint.Draw_s_axis);
        var c1 = b2PrismaticJoint.Draw_s_c1;
        var c2 = b2PrismaticJoint.Draw_s_c2;
        var c3 = b2PrismaticJoint.Draw_s_c3;
        var c4 = b2PrismaticJoint.Draw_s_c4;
        var c5 = b2PrismaticJoint.Draw_s_c5;
        draw.DrawSegment(pA, pB, c5);
        if (this.m_enableLimit) {
            var lower = b2Vec2.AddVMulSV(pA, this.m_lowerTranslation, axis, b2PrismaticJoint.Draw_s_lower);
            var upper = b2Vec2.AddVMulSV(pA, this.m_upperTranslation, axis, b2PrismaticJoint.Draw_s_upper);
            var perp = b2Rot.MulRV(xfA.q, this.m_localYAxisA, b2PrismaticJoint.Draw_s_perp);
            draw.DrawSegment(lower, upper, c1);
            draw.DrawSegment(b2Vec2.AddVMulSV(lower, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(lower, 0.5, perp, b2Vec2.s_t1), c2);
            draw.DrawSegment(b2Vec2.AddVMulSV(upper, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(upper, 0.5, perp, b2Vec2.s_t1), c3);
        }
        else {
            draw.DrawSegment(b2Vec2.AddVMulSV(pA, -1.0, axis, b2Vec2.s_t0), b2Vec2.AddVMulSV(pA, 1.0, axis, b2Vec2.s_t1), c1);
        }
        draw.DrawPoint(pA, 5.0, c1);
        draw.DrawPoint(pB, 5.0, c4);
    };
    b2PrismaticJoint.InitVelocityConstraints_s_d = new b2Vec2();
    b2PrismaticJoint.InitVelocityConstraints_s_P = new b2Vec2();
    b2PrismaticJoint.SolveVelocityConstraints_s_P = new b2Vec2();
    b2PrismaticJoint.SolveVelocityConstraints_s_df = new b2Vec2();
    b2PrismaticJoint.SolvePositionConstraints_s_d = new b2Vec2();
    b2PrismaticJoint.SolvePositionConstraints_s_impulse = new b2Vec3();
    b2PrismaticJoint.SolvePositionConstraints_s_impulse1 = new b2Vec2();
    b2PrismaticJoint.SolvePositionConstraints_s_P = new b2Vec2();
    b2PrismaticJoint.GetJointTranslation_s_pA = new b2Vec2();
    b2PrismaticJoint.GetJointTranslation_s_pB = new b2Vec2();
    b2PrismaticJoint.GetJointTranslation_s_d = new b2Vec2();
    b2PrismaticJoint.GetJointTranslation_s_axis = new b2Vec2();
    b2PrismaticJoint.Draw_s_pA = new b2Vec2();
    b2PrismaticJoint.Draw_s_pB = new b2Vec2();
    b2PrismaticJoint.Draw_s_axis = new b2Vec2();
    b2PrismaticJoint.Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
    b2PrismaticJoint.Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
    b2PrismaticJoint.Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
    b2PrismaticJoint.Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
    b2PrismaticJoint.Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
    b2PrismaticJoint.Draw_s_lower = new b2Vec2();
    b2PrismaticJoint.Draw_s_upper = new b2Vec2();
    b2PrismaticJoint.Draw_s_perp = new b2Vec2();
    return b2PrismaticJoint;
}(b2Joint));
//# sourceMappingURL=b2_prismatic_joint.js.map