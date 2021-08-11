




var b2WheelJointDef = (function (_super) {
    __extends(b2WheelJointDef, _super);
    function b2WheelJointDef() {
        _super.call(this, b2JointType.e_wheelJoint);
        this.localAnchorA = new b2Vec2(0, 0);
        this.localAnchorB = new b2Vec2(0, 0);
        this.localAxisA = new b2Vec2(1, 0);
        this.enableLimit = false;
        this.lowerTranslation = 0;
        this.upperTranslation = 0;
        this.enableMotor = false;
        this.maxMotorTorque = 0;
        this.motorSpeed = 0;
        this.stiffness = 0;
        this.damping = 0;
    }
    b2WheelJointDef.prototype.Initialize = function (bA, bB, anchor, axis) {
        this.bodyA = bA;
        this.bodyB = bB;
        this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
        this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
        this.bodyA.GetLocalVector(axis, this.localAxisA);
    };
    return b2WheelJointDef;
}(b2JointDef));
var b2WheelJoint = (function (_super) {
    __extends(b2WheelJoint, _super);
    function b2WheelJoint(def) {
        _super.call(this, def);
        this.m_localAnchorA = new b2Vec2();
        this.m_localAnchorB = new b2Vec2();
        this.m_localXAxisA = new b2Vec2();
        this.m_localYAxisA = new b2Vec2();
        this.m_impulse = 0;
        this.m_motorImpulse = 0;
        this.m_springImpulse = 0;
        this.m_lowerImpulse = 0;
        this.m_upperImpulse = 0;
        this.m_translation = 0;
        this.m_lowerTranslation = 0;
        this.m_upperTranslation = 0;
        this.m_maxMotorTorque = 0;
        this.m_motorSpeed = 0;
        this.m_enableLimit = false;
        this.m_enableMotor = false;
        this.m_stiffness = 0;
        this.m_damping = 0;
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_localCenterA = new b2Vec2();
        this.m_localCenterB = new b2Vec2();
        this.m_invMassA = 0;
        this.m_invMassB = 0;
        this.m_invIA = 0;
        this.m_invIB = 0;
        this.m_ax = new b2Vec2();
        this.m_ay = new b2Vec2();
        this.m_sAx = 0;
        this.m_sBx = 0;
        this.m_sAy = 0;
        this.m_sBy = 0;
        this.m_mass = 0;
        this.m_motorMass = 0;
        this.m_axialMass = 0;
        this.m_springMass = 0;
        this.m_bias = 0;
        this.m_gamma = 0;
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_lalcA = new b2Vec2();
        this.m_lalcB = new b2Vec2();
        this.m_rA = new b2Vec2();
        this.m_rB = new b2Vec2();
        this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
        this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
        this.m_localXAxisA.Copy(b2Maybe(def.localAxisA, b2Vec2.UNITX));
        b2Vec2.CrossOneV(this.m_localXAxisA, this.m_localYAxisA);
        this.m_lowerTranslation = b2Maybe(def.lowerTranslation, 0);
        this.m_upperTranslation = b2Maybe(def.upperTranslation, 0);
        this.m_enableLimit = b2Maybe(def.enableLimit, false);
        this.m_maxMotorTorque = b2Maybe(def.maxMotorTorque, 0);
        this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
        this.m_enableMotor = b2Maybe(def.enableMotor, false);
        this.m_ax.SetZero();
        this.m_ay.SetZero();
        this.m_stiffness = b2Maybe(def.stiffness, 0);
        this.m_damping = b2Maybe(def.damping, 0);
    }
    b2WheelJoint.prototype.GetMotorSpeed = function () {
        return this.m_motorSpeed;
    };
    b2WheelJoint.prototype.GetMaxMotorTorque = function () {
        return this.m_maxMotorTorque;
    };
    b2WheelJoint.prototype.SetSpringFrequencyHz = function (hz) {
        this.m_stiffness = hz;
    };
    b2WheelJoint.prototype.GetSpringFrequencyHz = function () {
        return this.m_stiffness;
    };
    b2WheelJoint.prototype.SetSpringDampingRatio = function (ratio) {
        this.m_damping = ratio;
    };
    b2WheelJoint.prototype.GetSpringDampingRatio = function () {
        return this.m_damping;
    };
    b2WheelJoint.prototype.InitVelocityConstraints = function (data) {
        this.m_indexA = this.m_bodyA.m_islandIndex;
        this.m_indexB = this.m_bodyB.m_islandIndex;
        this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
        this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
        this.m_invMassA = this.m_bodyA.m_invMass;
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIA = this.m_bodyA.m_invI;
        this.m_invIB = this.m_bodyB.m_invI;
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
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
        var d = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2WheelJoint.InitVelocityConstraints_s_d);
        {
            b2Rot.MulRV(qA, this.m_localYAxisA, this.m_ay);
            this.m_sAy = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ay);
            this.m_sBy = b2Vec2.CrossVV(rB, this.m_ay);
            this.m_mass = mA + mB + iA * this.m_sAy * this.m_sAy + iB * this.m_sBy * this.m_sBy;
            if (this.m_mass > 0) {
                this.m_mass = 1 / this.m_mass;
            }
        }
        b2Rot.MulRV(qA, this.m_localXAxisA, this.m_ax);
        this.m_sAx = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ax);
        this.m_sBx = b2Vec2.CrossVV(rB, this.m_ax);
        var invMass = mA + mB + iA * this.m_sAx * this.m_sAx + iB * this.m_sBx * this.m_sBx;
        if (invMass > 0.0) {
            this.m_axialMass = 1.0 / invMass;
        }
        else {
            this.m_axialMass = 0.0;
        }
        this.m_springMass = 0;
        this.m_bias = 0;
        this.m_gamma = 0;
        if (this.m_stiffness > 0.0 && invMass > 0.0) {
            this.m_springMass = 1.0 / invMass;
            var C = b2Vec2.DotVV(d, this.m_ax);
            var h = data.step.dt;
            this.m_gamma = h * (this.m_damping + h * this.m_stiffness);
            if (this.m_gamma > 0.0) {
                this.m_gamma = 1.0 / this.m_gamma;
            }
            this.m_bias = C * h * this.m_stiffness * this.m_gamma;
            this.m_springMass = invMass + this.m_gamma;
            if (this.m_springMass > 0.0) {
                this.m_springMass = 1.0 / this.m_springMass;
            }
        }
        else {
            this.m_springImpulse = 0.0;
        }
        if (this.m_enableLimit) {
            this.m_translation = b2Vec2.DotVV(this.m_ax, d);
        }
        else {
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
        if (this.m_enableMotor) {
            this.m_motorMass = iA + iB;
            if (this.m_motorMass > 0) {
                this.m_motorMass = 1 / this.m_motorMass;
            }
        }
        else {
            this.m_motorMass = 0;
            this.m_motorImpulse = 0;
        }
        if (data.step.warmStarting) {
            this.m_impulse *= data.step.dtRatio;
            this.m_springImpulse *= data.step.dtRatio;
            this.m_motorImpulse *= data.step.dtRatio;
            var axialImpulse = this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse;
            var P = b2Vec2.AddVV(b2Vec2.MulSV(this.m_impulse, this.m_ay, b2Vec2.s_t0), b2Vec2.MulSV(axialImpulse, this.m_ax, b2Vec2.s_t1), b2WheelJoint.InitVelocityConstraints_s_P);
            var LA = this.m_impulse * this.m_sAy + axialImpulse * this.m_sAx + this.m_motorImpulse;
            var LB = this.m_impulse * this.m_sBy + axialImpulse * this.m_sBx + this.m_motorImpulse;
            vA.SelfMulSub(this.m_invMassA, P);
            wA -= this.m_invIA * LA;
            vB.SelfMulAdd(this.m_invMassB, P);
            wB += this.m_invIB * LB;
        }
        else {
            this.m_impulse = 0;
            this.m_springImpulse = 0;
            this.m_motorImpulse = 0;
            this.m_lowerImpulse = 0;
            this.m_upperImpulse = 0;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2WheelJoint.prototype.SolveVelocityConstraints = function (data) {
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        {
            var Cdot = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBx * wB - this.m_sAx * wA;
            var impulse = -this.m_springMass * (Cdot + this.m_bias + this.m_gamma * this.m_springImpulse);
            this.m_springImpulse += impulse;
            var P = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
            var LA = impulse * this.m_sAx;
            var LB = impulse * this.m_sBx;
            vA.SelfMulSub(mA, P);
            wA -= iA * LA;
            vB.SelfMulAdd(mB, P);
            wB += iB * LB;
        }
        {
            var Cdot = wB - wA - this.m_motorSpeed;
            var impulse = -this.m_motorMass * Cdot;
            var oldImpulse = this.m_motorImpulse;
            var maxImpulse = data.step.dt * this.m_maxMotorTorque;
            this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
            impulse = this.m_motorImpulse - oldImpulse;
            wA -= iA * impulse;
            wB += iB * impulse;
        }
        if (this.m_enableLimit) {
            {
                var C = this.m_translation - this.m_lowerTranslation;
                var Cdot = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBx * wB - this.m_sAx * wA;
                var impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                var oldImpulse = this.m_lowerImpulse;
                this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
                impulse = this.m_lowerImpulse - oldImpulse;
                var P = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
                var LA = impulse * this.m_sAx;
                var LB = impulse * this.m_sBx;
                vA.SelfMulSub(mA, P);
                wA -= iA * LA;
                vB.SelfMulAdd(mB, P);
                wB += iB * LB;
            }
            {
                var C = this.m_upperTranslation - this.m_translation;
                var Cdot = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vA, vB, b2Vec2.s_t0)) + this.m_sAx * wA - this.m_sBx * wB;
                var impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                var oldImpulse = this.m_upperImpulse;
                this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
                impulse = this.m_upperImpulse - oldImpulse;
                var P = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
                var LA = impulse * this.m_sAx;
                var LB = impulse * this.m_sBx;
                vA.SelfMulAdd(mA, P);
                wA += iA * LA;
                vB.SelfMulSub(mB, P);
                wB -= iB * LB;
            }
        }
        {
            var Cdot = b2Vec2.DotVV(this.m_ay, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBy * wB - this.m_sAy * wA;
            var impulse = -this.m_mass * Cdot;
            this.m_impulse += impulse;
            var P = b2Vec2.MulSV(impulse, this.m_ay, b2WheelJoint.SolveVelocityConstraints_s_P);
            var LA = impulse * this.m_sAy;
            var LB = impulse * this.m_sBy;
            vA.SelfMulSub(mA, P);
            wA -= iA * LA;
            vB.SelfMulAdd(mB, P);
            wB += iB * LB;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2WheelJoint.prototype.SolvePositionConstraints = function (data) {
        var cA = data.positions[this.m_indexA].c;
        var aA = data.positions[this.m_indexA].a;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var linearError = 0.0;
        if (this.m_enableLimit) {
            var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
            b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
            var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
            b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
            var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
            var d = b2Vec2.AddVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), b2Vec2.SubVV(rB, rA, b2Vec2.s_t1), b2WheelJoint.SolvePositionConstraints_s_d);
            var ax = b2Rot.MulRV(qA, this.m_localXAxisA, this.m_ax);
            var sAx = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ax);
            var sBx = b2Vec2.CrossVV(rB, this.m_ax);
            var C = 0.0;
            var translation = b2Vec2.DotVV(ax, d);
            if (b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * b2_linearSlop) {
                C = translation;
            }
            else if (translation <= this.m_lowerTranslation) {
                C = b2Min(translation - this.m_lowerTranslation, 0.0);
            }
            else if (translation >= this.m_upperTranslation) {
                C = b2Max(translation - this.m_upperTranslation, 0.0);
            }
            if (C !== 0.0) {
                var invMass = this.m_invMassA + this.m_invMassB + this.m_invIA * sAx * sAx + this.m_invIB * sBx * sBx;
                var impulse = 0.0;
                if (invMass !== 0.0) {
                    impulse = -C / invMass;
                }
                var P = b2Vec2.MulSV(impulse, ax, b2WheelJoint.SolvePositionConstraints_s_P);
                var LA = impulse * sAx;
                var LB = impulse * sBx;
                cA.SelfMulSub(this.m_invMassA, P);
                aA -= this.m_invIA * LA;
                cB.SelfMulAdd(this.m_invMassB, P);
                aB += this.m_invIB * LB;
                linearError = b2Abs(C);
            }
        }
        {
            var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
            b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
            var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
            b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
            var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
            var d = b2Vec2.AddVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), b2Vec2.SubVV(rB, rA, b2Vec2.s_t1), b2WheelJoint.SolvePositionConstraints_s_d);
            var ay = b2Rot.MulRV(qA, this.m_localYAxisA, this.m_ay);
            var sAy = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), ay);
            var sBy = b2Vec2.CrossVV(rB, ay);
            var C = b2Vec2.DotVV(d, ay);
            var invMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_sAy * this.m_sAy + this.m_invIB * this.m_sBy * this.m_sBy;
            var impulse = 0.0;
            if (invMass !== 0.0) {
                impulse = -C / invMass;
            }
            var P = b2Vec2.MulSV(impulse, ay, b2WheelJoint.SolvePositionConstraints_s_P);
            var LA = impulse * sAy;
            var LB = impulse * sBy;
            cA.SelfMulSub(this.m_invMassA, P);
            aA -= this.m_invIA * LA;
            cB.SelfMulAdd(this.m_invMassB, P);
            aB += this.m_invIB * LB;
            linearError = b2Max(linearError, b2Abs(C));
        }
        data.positions[this.m_indexA].a = aA;
        data.positions[this.m_indexB].a = aB;
        return linearError <= b2_linearSlop;
    };
    b2WheelJoint.prototype.GetDefinition = function (def) {
        return def;
    };
    b2WheelJoint.prototype.GetAnchorA = function (out) {
        return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
    };
    b2WheelJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2WheelJoint.prototype.GetReactionForce = function (inv_dt, out) {
        out.x = inv_dt * (this.m_impulse * this.m_ay.x + (this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_ax.x);
        out.y = inv_dt * (this.m_impulse * this.m_ay.y + (this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_ax.y);
        return out;
    };
    b2WheelJoint.prototype.GetReactionTorque = function (inv_dt) {
        return inv_dt * this.m_motorImpulse;
    };
    b2WheelJoint.prototype.GetLocalAnchorA = function () { return this.m_localAnchorA; };
    b2WheelJoint.prototype.GetLocalAnchorB = function () { return this.m_localAnchorB; };
    b2WheelJoint.prototype.GetLocalAxisA = function () { return this.m_localXAxisA; };
    b2WheelJoint.prototype.GetJointTranslation = function () {
        return this.GetPrismaticJointTranslation();
    };
    b2WheelJoint.prototype.GetJointLinearSpeed = function () {
        return this.GetPrismaticJointSpeed();
    };
    b2WheelJoint.prototype.GetJointAngle = function () {
        return this.GetRevoluteJointAngle();
    };
    b2WheelJoint.prototype.GetJointAngularSpeed = function () {
        return this.GetRevoluteJointSpeed();
    };
    b2WheelJoint.prototype.GetPrismaticJointTranslation = function () {
        var bA = this.m_bodyA;
        var bB = this.m_bodyB;
        var pA = bA.GetWorldPoint(this.m_localAnchorA, new b2Vec2());
        var pB = bB.GetWorldPoint(this.m_localAnchorB, new b2Vec2());
        var d = b2Vec2.SubVV(pB, pA, new b2Vec2());
        var axis = bA.GetWorldVector(this.m_localXAxisA, new b2Vec2());
        var translation = b2Vec2.DotVV(d, axis);
        return translation;
    };
    b2WheelJoint.prototype.GetPrismaticJointSpeed = function () {
        var bA = this.m_bodyA;
        var bB = this.m_bodyB;
        b2Vec2.SubVV(this.m_localAnchorA, bA.m_sweep.localCenter, this.m_lalcA);
        var rA = b2Rot.MulRV(bA.m_xf.q, this.m_lalcA, this.m_rA);
        b2Vec2.SubVV(this.m_localAnchorB, bB.m_sweep.localCenter, this.m_lalcB);
        var rB = b2Rot.MulRV(bB.m_xf.q, this.m_lalcB, this.m_rB);
        var pA = b2Vec2.AddVV(bA.m_sweep.c, rA, b2Vec2.s_t0);
        var pB = b2Vec2.AddVV(bB.m_sweep.c, rB, b2Vec2.s_t1);
        var d = b2Vec2.SubVV(pB, pA, b2Vec2.s_t2);
        var axis = bA.GetWorldVector(this.m_localXAxisA, new b2Vec2());
        var vA = bA.m_linearVelocity;
        var vB = bB.m_linearVelocity;
        var wA = bA.m_angularVelocity;
        var wB = bB.m_angularVelocity;
        var speed = b2Vec2.DotVV(d, b2Vec2.CrossSV(wA, axis, b2Vec2.s_t0)) +
            b2Vec2.DotVV(axis, b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, rA, b2Vec2.s_t1), b2Vec2.s_t0));
        return speed;
    };
    b2WheelJoint.prototype.GetRevoluteJointAngle = function () {
        return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a;
    };
    b2WheelJoint.prototype.GetRevoluteJointSpeed = function () {
        var wA = this.m_bodyA.m_angularVelocity;
        var wB = this.m_bodyB.m_angularVelocity;
        return wB - wA;
    };
    b2WheelJoint.prototype.IsMotorEnabled = function () {
        return this.m_enableMotor;
    };
    b2WheelJoint.prototype.EnableMotor = function (flag) {
        if (flag !== this.m_enableMotor) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_enableMotor = flag;
        }
    };
    b2WheelJoint.prototype.SetMotorSpeed = function (speed) {
        if (speed !== this.m_motorSpeed) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_motorSpeed = speed;
        }
    };
    b2WheelJoint.prototype.SetMaxMotorTorque = function (force) {
        if (force !== this.m_maxMotorTorque) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_maxMotorTorque = force;
        }
    };
    b2WheelJoint.prototype.GetMotorTorque = function (inv_dt) {
        return inv_dt * this.m_motorImpulse;
    };
    b2WheelJoint.prototype.IsLimitEnabled = function () {
        return this.m_enableLimit;
    };
    b2WheelJoint.prototype.EnableLimit = function (flag) {
        if (flag !== this.m_enableLimit) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_enableLimit = flag;
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
    };
    b2WheelJoint.prototype.GetLowerLimit = function () {
        return this.m_lowerTranslation;
    };
    b2WheelJoint.prototype.GetUpperLimit = function () {
        return this.m_upperTranslation;
    };
    b2WheelJoint.prototype.SetLimits = function (lower, upper) {
        if (lower !== this.m_lowerTranslation || upper !== this.m_upperTranslation) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_lowerTranslation = lower;
            this.m_upperTranslation = upper;
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
    };
    b2WheelJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        log("  const jd: b2WheelJointDef = new b2WheelJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
        log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
        log("  jd.localAxisA.Set(%.15f, %.15f);\n", this.m_localXAxisA.x, this.m_localXAxisA.y);
        log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
        log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
        log("  jd.maxMotorTorque = %.15f;\n", this.m_maxMotorTorque);
        log("  jd.stiffness = %.15f;\n", this.m_stiffness);
        log("  jd.damping = %.15f;\n", this.m_damping);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2WheelJoint.prototype.Draw = function (draw) {
        var xfA = this.m_bodyA.GetTransform();
        var xfB = this.m_bodyB.GetTransform();
        var pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2WheelJoint.Draw_s_pA);
        var pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2WheelJoint.Draw_s_pB);
        var axis = b2Rot.MulRV(xfA.q, this.m_localXAxisA, b2WheelJoint.Draw_s_axis);
        var c1 = b2WheelJoint.Draw_s_c1;
        var c2 = b2WheelJoint.Draw_s_c2;
        var c3 = b2WheelJoint.Draw_s_c3;
        var c4 = b2WheelJoint.Draw_s_c4;
        var c5 = b2WheelJoint.Draw_s_c5;
        draw.DrawSegment(pA, pB, c5);
        if (this.m_enableLimit) {
            var lower = b2Vec2.AddVMulSV(pA, this.m_lowerTranslation, axis, b2WheelJoint.Draw_s_lower);
            var upper = b2Vec2.AddVMulSV(pA, this.m_upperTranslation, axis, b2WheelJoint.Draw_s_upper);
            var perp = b2Rot.MulRV(xfA.q, this.m_localYAxisA, b2WheelJoint.Draw_s_perp);
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
    b2WheelJoint.InitVelocityConstraints_s_d = new b2Vec2();
    b2WheelJoint.InitVelocityConstraints_s_P = new b2Vec2();
    b2WheelJoint.SolveVelocityConstraints_s_P = new b2Vec2();
    b2WheelJoint.SolvePositionConstraints_s_d = new b2Vec2();
    b2WheelJoint.SolvePositionConstraints_s_P = new b2Vec2();
    b2WheelJoint.Draw_s_pA = new b2Vec2();
    b2WheelJoint.Draw_s_pB = new b2Vec2();
    b2WheelJoint.Draw_s_axis = new b2Vec2();
    b2WheelJoint.Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
    b2WheelJoint.Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
    b2WheelJoint.Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
    b2WheelJoint.Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
    b2WheelJoint.Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
    b2WheelJoint.Draw_s_lower = new b2Vec2();
    b2WheelJoint.Draw_s_upper = new b2Vec2();
    b2WheelJoint.Draw_s_perp = new b2Vec2();
    return b2WheelJoint;
}(b2Joint));
//# sourceMappingURL=b2_wheel_joint.js.map