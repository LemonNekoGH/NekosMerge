




var b2DistanceJointDef = (function (_super) {
    __extends(b2DistanceJointDef, _super);
    function b2DistanceJointDef() {
        _super.call(this, b2JointType.e_distanceJoint);
        this.localAnchorA = new b2Vec2();
        this.localAnchorB = new b2Vec2();
        this.length = 1;
        this.minLength = 0;
        this.maxLength = b2_maxFloat;
        this.stiffness = 0;
        this.damping = 0;
    }
    b2DistanceJointDef.prototype.Initialize = function (b1, b2, anchor1, anchor2) {
        this.bodyA = b1;
        this.bodyB = b2;
        this.bodyA.GetLocalPoint(anchor1, this.localAnchorA);
        this.bodyB.GetLocalPoint(anchor2, this.localAnchorB);
        this.length = b2Max(b2Vec2.DistanceVV(anchor1, anchor2), b2_linearSlop);
        this.minLength = this.length;
        this.maxLength = this.length;
    };
    return b2DistanceJointDef;
}(b2JointDef));
var b2DistanceJoint = (function (_super) {
    __extends(b2DistanceJoint, _super);
    function b2DistanceJoint(def) {
        _super.call(this, def);
        this.m_stiffness = 0;
        this.m_damping = 0;
        this.m_bias = 0;
        this.m_length = 0;
        this.m_minLength = 0;
        this.m_maxLength = 0;
        this.m_localAnchorA = new b2Vec2();
        this.m_localAnchorB = new b2Vec2();
        this.m_gamma = 0;
        this.m_impulse = 0;
        this.m_lowerImpulse = 0;
        this.m_upperImpulse = 0;
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_u = new b2Vec2();
        this.m_rA = new b2Vec2();
        this.m_rB = new b2Vec2();
        this.m_localCenterA = new b2Vec2();
        this.m_localCenterB = new b2Vec2();
        this.m_currentLength = 0;
        this.m_invMassA = 0;
        this.m_invMassB = 0;
        this.m_invIA = 0;
        this.m_invIB = 0;
        this.m_softMass = 0;
        this.m_mass = 0;
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_lalcA = new b2Vec2();
        this.m_lalcB = new b2Vec2();
        this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
        this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
        this.m_length = b2Max(b2Maybe(def.length, this.GetCurrentLength()), b2_linearSlop);
        this.m_minLength = b2Max(b2Maybe(def.minLength, this.m_length), b2_linearSlop);
        this.m_maxLength = b2Max(b2Maybe(def.maxLength, this.m_length), this.m_minLength);
        this.m_stiffness = b2Maybe(def.stiffness, 0);
        this.m_damping = b2Maybe(def.damping, 0);
    }
    b2DistanceJoint.prototype.GetAnchorA = function (out) {
        return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
    };
    b2DistanceJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2DistanceJoint.prototype.GetReactionForce = function (inv_dt, out) {
        out.x = inv_dt * (this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_u.x;
        out.y = inv_dt * (this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_u.y;
        return out;
    };
    b2DistanceJoint.prototype.GetReactionTorque = function (inv_dt) {
        return 0;
    };
    b2DistanceJoint.prototype.GetLocalAnchorA = function () { return this.m_localAnchorA; };
    b2DistanceJoint.prototype.GetLocalAnchorB = function () { return this.m_localAnchorB; };
    b2DistanceJoint.prototype.SetLength = function (length) {
        this.m_impulse = 0;
        this.m_length = b2Max(b2_linearSlop, length);
        return this.m_length;
    };
    b2DistanceJoint.prototype.GetLength = function () {
        return this.m_length;
    };
    b2DistanceJoint.prototype.SetMinLength = function (minLength) {
        this.m_lowerImpulse = 0;
        this.m_minLength = b2Clamp(minLength, b2_linearSlop, this.m_maxLength);
        return this.m_minLength;
    };
    b2DistanceJoint.prototype.SetMaxLength = function (maxLength) {
        this.m_upperImpulse = 0;
        this.m_maxLength = b2Max(maxLength, this.m_minLength);
        return this.m_maxLength;
    };
    b2DistanceJoint.prototype.GetCurrentLength = function () {
        var pA = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, new b2Vec2());
        var pB = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, new b2Vec2());
        return b2Vec2.DistanceVV(pA, pB);
    };
    b2DistanceJoint.prototype.SetStiffness = function (stiffness) {
        this.m_stiffness = stiffness;
    };
    b2DistanceJoint.prototype.GetStiffness = function () {
        return this.m_stiffness;
    };
    b2DistanceJoint.prototype.SetDamping = function (damping) {
        this.m_damping = damping;
    };
    b2DistanceJoint.prototype.GetDamping = function () {
        return this.m_damping;
    };
    b2DistanceJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        log("  const jd: b2DistanceJointDef = new b2DistanceJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
        log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
        log("  jd.length = %.15f;\n", this.m_length);
        log("  jd.minLength = %.15f;\n", this.m_minLength);
        log("  jd.maxLength = %.15f;\n", this.m_maxLength);
        log("  jd.stiffness = %.15f;\n", this.m_stiffness);
        log("  jd.damping = %.15f;\n", this.m_damping);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2DistanceJoint.prototype.InitVelocityConstraints = function (data) {
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
        b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
        b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
        b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        this.m_u.x = cB.x + this.m_rB.x - cA.x - this.m_rA.x;
        this.m_u.y = cB.y + this.m_rB.y - cA.y - this.m_rA.y;
        this.m_currentLength = this.m_u.Length();
        if (this.m_currentLength > b2_linearSlop) {
            this.m_u.SelfMul(1 / this.m_currentLength);
        }
        else {
            this.m_u.SetZero();
            this.m_mass = 0;
            this.m_impulse = 0;
            this.m_lowerImpulse = 0;
            this.m_upperImpulse = 0;
        }
        var crAu = b2Vec2.CrossVV(this.m_rA, this.m_u);
        var crBu = b2Vec2.CrossVV(this.m_rB, this.m_u);
        var invMass = this.m_invMassA + this.m_invIA * crAu * crAu + this.m_invMassB + this.m_invIB * crBu * crBu;
        this.m_mass = invMass !== 0 ? 1 / invMass : 0;
        if (this.m_stiffness > 0 && this.m_minLength < this.m_maxLength) {
            var C = this.m_currentLength - this.m_length;
            var d = this.m_damping;
            var k = this.m_stiffness;
            var h = data.step.dt;
            this.m_gamma = h * (d + h * k);
            this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma : 0;
            this.m_bias = C * h * k * this.m_gamma;
            invMass += this.m_gamma;
            this.m_softMass = invMass !== 0 ? 1 / invMass : 0;
        }
        else {
            this.m_gamma = 0;
            this.m_bias = 0;
            this.m_softMass = this.m_mass;
        }
        if (data.step.warmStarting) {
            this.m_impulse *= data.step.dtRatio;
            this.m_lowerImpulse *= data.step.dtRatio;
            this.m_upperImpulse *= data.step.dtRatio;
            var P = b2Vec2.MulSV(this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse, this.m_u, b2DistanceJoint.InitVelocityConstraints_s_P);
            vA.SelfMulSub(this.m_invMassA, P);
            wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
            vB.SelfMulAdd(this.m_invMassB, P);
            wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
        }
        else {
            this.m_impulse = 0;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2DistanceJoint.prototype.SolveVelocityConstraints = function (data) {
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        if (this.m_minLength < this.m_maxLength) {
            if (this.m_stiffness > 0) {
                var vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
                var vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
                var Cdot = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));
                var impulse = -this.m_softMass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
                this.m_impulse += impulse;
                var P = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
                vA.SelfMulSub(this.m_invMassA, P);
                wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
                vB.SelfMulAdd(this.m_invMassB, P);
                wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
            }
            {
                var C = this.m_currentLength - this.m_minLength;
                var bias = b2Max(0, C) * data.step.inv_dt;
                var vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
                var vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
                var Cdot = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));
                var impulse = -this.m_mass * (Cdot + bias);
                var oldImpulse = this.m_lowerImpulse;
                this.m_lowerImpulse = b2Max(0, this.m_lowerImpulse + impulse);
                impulse = this.m_lowerImpulse - oldImpulse;
                var P = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
                vA.SelfMulSub(this.m_invMassA, P);
                wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
                vB.SelfMulAdd(this.m_invMassB, P);
                wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
            }
            {
                var C = this.m_maxLength - this.m_currentLength;
                var bias = b2Max(0, C) * data.step.inv_dt;
                var vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
                var vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
                var Cdot = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpA, vpB, b2Vec2.s_t0));
                var impulse = -this.m_mass * (Cdot + bias);
                var oldImpulse = this.m_upperImpulse;
                this.m_upperImpulse = b2Max(0, this.m_upperImpulse + impulse);
                impulse = this.m_upperImpulse - oldImpulse;
                var P = b2Vec2.MulSV(-impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
                vA.SelfMulSub(this.m_invMassA, P);
                wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
                vB.SelfMulAdd(this.m_invMassB, P);
                wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
            }
        }
        else {
            var vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
            var vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
            var Cdot = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));
            var impulse = -this.m_mass * Cdot;
            this.m_impulse += impulse;
            var P = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
            vA.SelfMulSub(this.m_invMassA, P);
            wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
            vB.SelfMulAdd(this.m_invMassB, P);
            wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2DistanceJoint.prototype.SolvePositionConstraints = function (data) {
        var cA = data.positions[this.m_indexA].c;
        var aA = data.positions[this.m_indexA].a;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
        var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
        var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        var u = this.m_u;
        u.x = cB.x + rB.x - cA.x - rA.x;
        u.y = cB.y + rB.y - cA.y - rA.y;
        var length = this.m_u.Normalize();
        var C;
        if (this.m_minLength == this.m_maxLength) {
            C = length - this.m_minLength;
        }
        else if (length < this.m_minLength) {
            C = length - this.m_minLength;
        }
        else if (this.m_maxLength < length) {
            C = length - this.m_maxLength;
        }
        else {
            return true;
        }
        var impulse = -this.m_mass * C;
        var P = b2Vec2.MulSV(impulse, u, b2DistanceJoint.SolvePositionConstraints_s_P);
        cA.SelfMulSub(this.m_invMassA, P);
        aA -= this.m_invIA * b2Vec2.CrossVV(rA, P);
        cB.SelfMulAdd(this.m_invMassB, P);
        aB += this.m_invIB * b2Vec2.CrossVV(rB, P);
        data.positions[this.m_indexA].a = aA;
        data.positions[this.m_indexB].a = aB;
        return b2Abs(C) < b2_linearSlop;
    };
    b2DistanceJoint.prototype.Draw = function (draw) {
        var xfA = this.m_bodyA.GetTransform();
        var xfB = this.m_bodyB.GetTransform();
        var pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2DistanceJoint.Draw_s_pA);
        var pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2DistanceJoint.Draw_s_pB);
        var axis = b2Vec2.SubVV(pB, pA, b2DistanceJoint.Draw_s_axis);
        axis.Normalize();
        var c1 = b2DistanceJoint.Draw_s_c1;
        var c2 = b2DistanceJoint.Draw_s_c2;
        var c3 = b2DistanceJoint.Draw_s_c3;
        var c4 = b2DistanceJoint.Draw_s_c4;
        draw.DrawSegment(pA, pB, c4);
        var pRest = b2Vec2.AddVMulSV(pA, this.m_length, axis, b2DistanceJoint.Draw_s_pRest);
        draw.DrawPoint(pRest, 8.0, c1);
        if (this.m_minLength != this.m_maxLength) {
            if (this.m_minLength > b2_linearSlop) {
                var pMin = b2Vec2.AddVMulSV(pA, this.m_minLength, axis, b2DistanceJoint.Draw_s_pMin);
                draw.DrawPoint(pMin, 4.0, c2);
            }
            if (this.m_maxLength < b2_maxFloat) {
                var pMax = b2Vec2.AddVMulSV(pA, this.m_maxLength, axis, b2DistanceJoint.Draw_s_pMax);
                draw.DrawPoint(pMax, 4.0, c3);
            }
        }
    };
    b2DistanceJoint.InitVelocityConstraints_s_P = new b2Vec2();
    b2DistanceJoint.SolveVelocityConstraints_s_vpA = new b2Vec2();
    b2DistanceJoint.SolveVelocityConstraints_s_vpB = new b2Vec2();
    b2DistanceJoint.SolveVelocityConstraints_s_P = new b2Vec2();
    b2DistanceJoint.SolvePositionConstraints_s_P = new b2Vec2();
    b2DistanceJoint.Draw_s_pA = new b2Vec2();
    b2DistanceJoint.Draw_s_pB = new b2Vec2();
    b2DistanceJoint.Draw_s_axis = new b2Vec2();
    b2DistanceJoint.Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
    b2DistanceJoint.Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
    b2DistanceJoint.Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
    b2DistanceJoint.Draw_s_c4 = new b2Color(0.4, 0.4, 0.4);
    b2DistanceJoint.Draw_s_pRest = new b2Vec2();
    b2DistanceJoint.Draw_s_pMin = new b2Vec2();
    b2DistanceJoint.Draw_s_pMax = new b2Vec2();
    return b2DistanceJoint;
}(b2Joint));
//# sourceMappingURL=b2_distance_joint.js.map