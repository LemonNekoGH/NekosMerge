




var b2RevoluteJointDef = (function (_super) {
    __extends(b2RevoluteJointDef, _super);
    function b2RevoluteJointDef() {
        _super.call(this, b2JointType.e_revoluteJoint);
        this.localAnchorA = new b2Vec2(0, 0);
        this.localAnchorB = new b2Vec2(0, 0);
        this.referenceAngle = 0;
        this.enableLimit = false;
        this.lowerAngle = 0;
        this.upperAngle = 0;
        this.enableMotor = false;
        this.motorSpeed = 0;
        this.maxMotorTorque = 0;
    }
    b2RevoluteJointDef.prototype.Initialize = function (bA, bB, anchor) {
        this.bodyA = bA;
        this.bodyB = bB;
        this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
        this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
        this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
    };
    return b2RevoluteJointDef;
}(b2JointDef));
var b2RevoluteJoint = (function (_super) {
    __extends(b2RevoluteJoint, _super);
    function b2RevoluteJoint(def) {
        _super.call(this, def);
        this.m_localAnchorA = new b2Vec2();
        this.m_localAnchorB = new b2Vec2();
        this.m_impulse = new b2Vec2();
        this.m_motorImpulse = 0;
        this.m_lowerImpulse = 0;
        this.m_upperImpulse = 0;
        this.m_enableMotor = false;
        this.m_maxMotorTorque = 0;
        this.m_motorSpeed = 0;
        this.m_enableLimit = false;
        this.m_referenceAngle = 0;
        this.m_lowerAngle = 0;
        this.m_upperAngle = 0;
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
        this.m_K = new b2Mat22();
        this.m_angle = 0;
        this.m_axialMass = 0;
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_lalcA = new b2Vec2();
        this.m_lalcB = new b2Vec2();
        this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
        this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
        this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0;
        this.m_lowerAngle = b2Maybe(def.lowerAngle, 0);
        this.m_upperAngle = b2Maybe(def.upperAngle, 0);
        this.m_maxMotorTorque = b2Maybe(def.maxMotorTorque, 0);
        this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
        this.m_enableLimit = b2Maybe(def.enableLimit, false);
        this.m_enableMotor = b2Maybe(def.enableMotor, false);
    }
    b2RevoluteJoint.prototype.InitVelocityConstraints = function (data) {
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
        this.m_K.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
        this.m_K.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
        this.m_K.ex.y = this.m_K.ey.x;
        this.m_K.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
        this.m_axialMass = iA + iB;
        var fixedRotation;
        if (this.m_axialMass > 0.0) {
            this.m_axialMass = 1.0 / this.m_axialMass;
            fixedRotation = false;
        }
        else {
            fixedRotation = true;
        }
        this.m_angle = aB - aA - this.m_referenceAngle;
        if (this.m_enableLimit === false || fixedRotation) {
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
        if (this.m_enableMotor === false || fixedRotation) {
            this.m_motorImpulse = 0.0;
        }
        if (data.step.warmStarting) {
            this.m_impulse.SelfMul(data.step.dtRatio);
            this.m_motorImpulse *= data.step.dtRatio;
            this.m_lowerImpulse *= data.step.dtRatio;
            this.m_upperImpulse *= data.step.dtRatio;
            var axialImpulse = this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse;
            var P = b2RevoluteJoint.InitVelocityConstraints_s_P.Set(this.m_impulse.x, this.m_impulse.y);
            vA.SelfMulSub(mA, P);
            wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + axialImpulse);
            vB.SelfMulAdd(mB, P);
            wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + axialImpulse);
        }
        else {
            this.m_impulse.SetZero();
            this.m_motorImpulse = 0;
            this.m_lowerImpulse = 0;
            this.m_upperImpulse = 0;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2RevoluteJoint.prototype.SolveVelocityConstraints = function (data) {
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var mA = this.m_invMassA, mB = this.m_invMassB;
        var iA = this.m_invIA, iB = this.m_invIB;
        var fixedRotation = (iA + iB === 0);
        if (this.m_enableMotor && !fixedRotation) {
            var Cdot = wB - wA - this.m_motorSpeed;
            var impulse = -this.m_axialMass * Cdot;
            var oldImpulse = this.m_motorImpulse;
            var maxImpulse = data.step.dt * this.m_maxMotorTorque;
            this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
            impulse = this.m_motorImpulse - oldImpulse;
            wA -= iA * impulse;
            wB += iB * impulse;
        }
        if (this.m_enableLimit && !fixedRotation) {
            {
                var C = this.m_angle - this.m_lowerAngle;
                var Cdot = wB - wA;
                var impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                var oldImpulse = this.m_lowerImpulse;
                this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
                impulse = this.m_lowerImpulse - oldImpulse;
                wA -= iA * impulse;
                wB += iB * impulse;
            }
            {
                var C = this.m_upperAngle - this.m_angle;
                var Cdot = wA - wB;
                var impulse = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
                var oldImpulse = this.m_upperImpulse;
                this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
                impulse = this.m_upperImpulse - oldImpulse;
                wA += iA * impulse;
                wB -= iB * impulse;
            }
        }
        {
            var Cdot_v2 = b2Vec2.SubVV(b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0), b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1), b2RevoluteJoint.SolveVelocityConstraints_s_Cdot_v2);
            var impulse_v2 = this.m_K.Solve(-Cdot_v2.x, -Cdot_v2.y, b2RevoluteJoint.SolveVelocityConstraints_s_impulse_v2);
            this.m_impulse.x += impulse_v2.x;
            this.m_impulse.y += impulse_v2.y;
            vA.SelfMulSub(mA, impulse_v2);
            wA -= iA * b2Vec2.CrossVV(this.m_rA, impulse_v2);
            vB.SelfMulAdd(mB, impulse_v2);
            wB += iB * b2Vec2.CrossVV(this.m_rB, impulse_v2);
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2RevoluteJoint.prototype.SolvePositionConstraints = function (data) {
        var cA = data.positions[this.m_indexA].c;
        var aA = data.positions[this.m_indexA].a;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
        var angularError = 0;
        var positionError = 0;
        var fixedRotation = (this.m_invIA + this.m_invIB === 0);
        if (this.m_enableLimit && !fixedRotation) {
            var angle = aB - aA - this.m_referenceAngle;
            var C = 0.0;
            if (b2Abs(this.m_upperAngle - this.m_lowerAngle) < 2.0 * b2_angularSlop) {
                C = b2Clamp(angle - this.m_lowerAngle, -b2_maxAngularCorrection, b2_maxAngularCorrection);
            }
            else if (angle <= this.m_lowerAngle) {
                C = b2Clamp(angle - this.m_lowerAngle + b2_angularSlop, -b2_maxAngularCorrection, 0.0);
            }
            else if (angle >= this.m_upperAngle) {
                C = b2Clamp(angle - this.m_upperAngle - b2_angularSlop, 0.0, b2_maxAngularCorrection);
            }
            var limitImpulse = -this.m_axialMass * C;
            aA -= this.m_invIA * limitImpulse;
            aB += this.m_invIB * limitImpulse;
            angularError = b2Abs(C);
        }
        {
            qA.SetAngle(aA);
            qB.SetAngle(aB);
            b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
            var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
            b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
            var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
            var C_v2 = b2Vec2.SubVV(b2Vec2.AddVV(cB, rB, b2Vec2.s_t0), b2Vec2.AddVV(cA, rA, b2Vec2.s_t1), b2RevoluteJoint.SolvePositionConstraints_s_C_v2);
            positionError = C_v2.Length();
            var mA = this.m_invMassA, mB = this.m_invMassB;
            var iA = this.m_invIA, iB = this.m_invIB;
            var K = this.m_K;
            K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
            K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
            K.ey.x = K.ex.y;
            K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;
            var impulse = K.Solve(C_v2.x, C_v2.y, b2RevoluteJoint.SolvePositionConstraints_s_impulse).SelfNeg();
            cA.SelfMulSub(mA, impulse);
            aA -= iA * b2Vec2.CrossVV(rA, impulse);
            cB.SelfMulAdd(mB, impulse);
            aB += iB * b2Vec2.CrossVV(rB, impulse);
        }
        data.positions[this.m_indexA].a = aA;
        data.positions[this.m_indexB].a = aB;
        return positionError <= b2_linearSlop && angularError <= b2_angularSlop;
    };
    b2RevoluteJoint.prototype.GetAnchorA = function (out) {
        return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
    };
    b2RevoluteJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2RevoluteJoint.prototype.GetReactionForce = function (inv_dt, out) {
        out.x = inv_dt * this.m_impulse.x;
        out.y = inv_dt * this.m_impulse.y;
        return out;
    };
    b2RevoluteJoint.prototype.GetReactionTorque = function (inv_dt) {
        return inv_dt * (this.m_lowerImpulse - this.m_upperImpulse);
    };
    b2RevoluteJoint.prototype.GetLocalAnchorA = function () { return this.m_localAnchorA; };
    b2RevoluteJoint.prototype.GetLocalAnchorB = function () { return this.m_localAnchorB; };
    b2RevoluteJoint.prototype.GetReferenceAngle = function () { return this.m_referenceAngle; };
    b2RevoluteJoint.prototype.GetJointAngle = function () {
        return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle;
    };
    b2RevoluteJoint.prototype.GetJointSpeed = function () {
        return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity;
    };
    b2RevoluteJoint.prototype.IsMotorEnabled = function () {
        return this.m_enableMotor;
    };
    b2RevoluteJoint.prototype.EnableMotor = function (flag) {
        if (flag !== this.m_enableMotor) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_enableMotor = flag;
        }
    };
    b2RevoluteJoint.prototype.GetMotorTorque = function (inv_dt) {
        return inv_dt * this.m_motorImpulse;
    };
    b2RevoluteJoint.prototype.GetMotorSpeed = function () {
        return this.m_motorSpeed;
    };
    b2RevoluteJoint.prototype.SetMaxMotorTorque = function (torque) {
        if (torque !== this.m_maxMotorTorque) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_maxMotorTorque = torque;
        }
    };
    b2RevoluteJoint.prototype.GetMaxMotorTorque = function () { return this.m_maxMotorTorque; };
    b2RevoluteJoint.prototype.IsLimitEnabled = function () {
        return this.m_enableLimit;
    };
    b2RevoluteJoint.prototype.EnableLimit = function (flag) {
        if (flag !== this.m_enableLimit) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_enableLimit = flag;
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
        }
    };
    b2RevoluteJoint.prototype.GetLowerLimit = function () {
        return this.m_lowerAngle;
    };
    b2RevoluteJoint.prototype.GetUpperLimit = function () {
        return this.m_upperAngle;
    };
    b2RevoluteJoint.prototype.SetLimits = function (lower, upper) {
        if (lower !== this.m_lowerAngle || upper !== this.m_upperAngle) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_lowerImpulse = 0.0;
            this.m_upperImpulse = 0.0;
            this.m_lowerAngle = lower;
            this.m_upperAngle = upper;
        }
    };
    b2RevoluteJoint.prototype.SetMotorSpeed = function (speed) {
        if (speed !== this.m_motorSpeed) {
            this.m_bodyA.SetAwake(true);
            this.m_bodyB.SetAwake(true);
            this.m_motorSpeed = speed;
        }
    };
    b2RevoluteJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        log("  const jd: b2RevoluteJointDef = new b2RevoluteJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
        log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
        log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
        log("  jd.enableLimit = %s;\n", (this.m_enableLimit) ? ("true") : ("false"));
        log("  jd.lowerAngle = %.15f;\n", this.m_lowerAngle);
        log("  jd.upperAngle = %.15f;\n", this.m_upperAngle);
        log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
        log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
        log("  jd.maxMotorTorque = %.15f;\n", this.m_maxMotorTorque);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2RevoluteJoint.prototype.Draw = function (draw) {
        var xfA = this.m_bodyA.GetTransform();
        var xfB = this.m_bodyB.GetTransform();
        var pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2RevoluteJoint.Draw_s_pA);
        var pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2RevoluteJoint.Draw_s_pB);
        var c1 = b2RevoluteJoint.Draw_s_c1;
        var c2 = b2RevoluteJoint.Draw_s_c2;
        var c3 = b2RevoluteJoint.Draw_s_c3;
        var c4 = b2RevoluteJoint.Draw_s_c4;
        var c5 = b2RevoluteJoint.Draw_s_c5;
        draw.DrawPoint(pA, 5.0, c4);
        draw.DrawPoint(pB, 5.0, c5);
        var aA = this.m_bodyA.GetAngle();
        var aB = this.m_bodyB.GetAngle();
        var angle = aB - aA - this.m_referenceAngle;
        var L = 0.5;
        var r = b2RevoluteJoint.Draw_s_r.Set(L * Math.cos(angle), L * Math.sin(angle));
        draw.DrawSegment(pB, b2Vec2.AddVV(pB, r, b2Vec2.s_t0), c1);
        draw.DrawCircle(pB, L, c1);
        if (this.m_enableLimit) {
            var rlo = b2RevoluteJoint.Draw_s_rlo.Set(L * Math.cos(this.m_lowerAngle), L * Math.sin(this.m_lowerAngle));
            var rhi = b2RevoluteJoint.Draw_s_rhi.Set(L * Math.cos(this.m_upperAngle), L * Math.sin(this.m_upperAngle));
            draw.DrawSegment(pB, b2Vec2.AddVV(pB, rlo, b2Vec2.s_t0), c2);
            draw.DrawSegment(pB, b2Vec2.AddVV(pB, rhi, b2Vec2.s_t0), c3);
        }
        var color = b2RevoluteJoint.Draw_s_color_;
        draw.DrawSegment(xfA.p, pA, color);
        draw.DrawSegment(pA, pB, color);
        draw.DrawSegment(xfB.p, pB, color);
    };
    b2RevoluteJoint.InitVelocityConstraints_s_P = new b2Vec2();
    b2RevoluteJoint.SolveVelocityConstraints_s_Cdot_v2 = new b2Vec2();
    b2RevoluteJoint.SolveVelocityConstraints_s_impulse_v2 = new b2Vec2();
    b2RevoluteJoint.SolvePositionConstraints_s_C_v2 = new b2Vec2();
    b2RevoluteJoint.SolvePositionConstraints_s_impulse = new b2Vec2();
    b2RevoluteJoint.Draw_s_pA = new b2Vec2();
    b2RevoluteJoint.Draw_s_pB = new b2Vec2();
    b2RevoluteJoint.Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
    b2RevoluteJoint.Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
    b2RevoluteJoint.Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
    b2RevoluteJoint.Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
    b2RevoluteJoint.Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
    b2RevoluteJoint.Draw_s_color_ = new b2Color(0.5, 0.8, 0.8);
    b2RevoluteJoint.Draw_s_r = new b2Vec2();
    b2RevoluteJoint.Draw_s_rlo = new b2Vec2();
    b2RevoluteJoint.Draw_s_rhi = new b2Vec2();
    return b2RevoluteJoint;
}(b2Joint));
//# sourceMappingURL=b2_revolute_joint.js.map