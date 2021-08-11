




var b2GearJointDef = (function (_super) {
    __extends(b2GearJointDef, _super);
    function b2GearJointDef() {
        _super.call(this, b2JointType.e_gearJoint);
        this.ratio = 1;
    }
    return b2GearJointDef;
}(b2JointDef));
var b2GearJoint = (function (_super) {
    __extends(b2GearJoint, _super);
    function b2GearJoint(def) {
        _super.call(this, def);
        this.m_typeA = b2JointType.e_unknownJoint;
        this.m_typeB = b2JointType.e_unknownJoint;
        this.m_localAnchorA = new b2Vec2();
        this.m_localAnchorB = new b2Vec2();
        this.m_localAnchorC = new b2Vec2();
        this.m_localAnchorD = new b2Vec2();
        this.m_localAxisC = new b2Vec2();
        this.m_localAxisD = new b2Vec2();
        this.m_referenceAngleA = 0;
        this.m_referenceAngleB = 0;
        this.m_constant = 0;
        this.m_ratio = 0;
        this.m_impulse = 0;
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_indexC = 0;
        this.m_indexD = 0;
        this.m_lcA = new b2Vec2();
        this.m_lcB = new b2Vec2();
        this.m_lcC = new b2Vec2();
        this.m_lcD = new b2Vec2();
        this.m_mA = 0;
        this.m_mB = 0;
        this.m_mC = 0;
        this.m_mD = 0;
        this.m_iA = 0;
        this.m_iB = 0;
        this.m_iC = 0;
        this.m_iD = 0;
        this.m_JvAC = new b2Vec2();
        this.m_JvBD = new b2Vec2();
        this.m_JwA = 0;
        this.m_JwB = 0;
        this.m_JwC = 0;
        this.m_JwD = 0;
        this.m_mass = 0;
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_qC = new b2Rot();
        this.m_qD = new b2Rot();
        this.m_lalcA = new b2Vec2();
        this.m_lalcB = new b2Vec2();
        this.m_lalcC = new b2Vec2();
        this.m_lalcD = new b2Vec2();
        this.m_joint1 = def.joint1;
        this.m_joint2 = def.joint2;
        this.m_typeA = this.m_joint1.GetType();
        this.m_typeB = this.m_joint2.GetType();
        var coordinateA, coordinateB;
        this.m_bodyC = this.m_joint1.GetBodyA();
        this.m_bodyA = this.m_joint1.GetBodyB();
        var xfA = this.m_bodyA.m_xf;
        var aA = this.m_bodyA.m_sweep.a;
        var xfC = this.m_bodyC.m_xf;
        var aC = this.m_bodyC.m_sweep.a;
        if (this.m_typeA === b2JointType.e_revoluteJoint) {
            var revolute = def.joint1;
            this.m_localAnchorC.Copy(revolute.m_localAnchorA);
            this.m_localAnchorA.Copy(revolute.m_localAnchorB);
            this.m_referenceAngleA = revolute.m_referenceAngle;
            this.m_localAxisC.SetZero();
            coordinateA = aA - aC - this.m_referenceAngleA;
        }
        else {
            var prismatic = def.joint1;
            this.m_localAnchorC.Copy(prismatic.m_localAnchorA);
            this.m_localAnchorA.Copy(prismatic.m_localAnchorB);
            this.m_referenceAngleA = prismatic.m_referenceAngle;
            this.m_localAxisC.Copy(prismatic.m_localXAxisA);
            var pC = this.m_localAnchorC;
            var pA = b2Rot.MulTRV(xfC.q, b2Vec2.AddVV(b2Rot.MulRV(xfA.q, this.m_localAnchorA, b2Vec2.s_t0), b2Vec2.SubVV(xfA.p, xfC.p, b2Vec2.s_t1), b2Vec2.s_t0), b2Vec2.s_t0);
            coordinateA = b2Vec2.DotVV(b2Vec2.SubVV(pA, pC, b2Vec2.s_t0), this.m_localAxisC);
        }
        this.m_bodyD = this.m_joint2.GetBodyA();
        this.m_bodyB = this.m_joint2.GetBodyB();
        var xfB = this.m_bodyB.m_xf;
        var aB = this.m_bodyB.m_sweep.a;
        var xfD = this.m_bodyD.m_xf;
        var aD = this.m_bodyD.m_sweep.a;
        if (this.m_typeB === b2JointType.e_revoluteJoint) {
            var revolute = def.joint2;
            this.m_localAnchorD.Copy(revolute.m_localAnchorA);
            this.m_localAnchorB.Copy(revolute.m_localAnchorB);
            this.m_referenceAngleB = revolute.m_referenceAngle;
            this.m_localAxisD.SetZero();
            coordinateB = aB - aD - this.m_referenceAngleB;
        }
        else {
            var prismatic = def.joint2;
            this.m_localAnchorD.Copy(prismatic.m_localAnchorA);
            this.m_localAnchorB.Copy(prismatic.m_localAnchorB);
            this.m_referenceAngleB = prismatic.m_referenceAngle;
            this.m_localAxisD.Copy(prismatic.m_localXAxisA);
            var pD = this.m_localAnchorD;
            var pB = b2Rot.MulTRV(xfD.q, b2Vec2.AddVV(b2Rot.MulRV(xfB.q, this.m_localAnchorB, b2Vec2.s_t0), b2Vec2.SubVV(xfB.p, xfD.p, b2Vec2.s_t1), b2Vec2.s_t0), b2Vec2.s_t0);
            coordinateB = b2Vec2.DotVV(b2Vec2.SubVV(pB, pD, b2Vec2.s_t0), this.m_localAxisD);
        }
        this.m_ratio = b2Maybe(def.ratio, 1);
        this.m_constant = coordinateA + this.m_ratio * coordinateB;
        this.m_impulse = 0;
    }
    b2GearJoint.prototype.InitVelocityConstraints = function (data) {
        this.m_indexA = this.m_bodyA.m_islandIndex;
        this.m_indexB = this.m_bodyB.m_islandIndex;
        this.m_indexC = this.m_bodyC.m_islandIndex;
        this.m_indexD = this.m_bodyD.m_islandIndex;
        this.m_lcA.Copy(this.m_bodyA.m_sweep.localCenter);
        this.m_lcB.Copy(this.m_bodyB.m_sweep.localCenter);
        this.m_lcC.Copy(this.m_bodyC.m_sweep.localCenter);
        this.m_lcD.Copy(this.m_bodyD.m_sweep.localCenter);
        this.m_mA = this.m_bodyA.m_invMass;
        this.m_mB = this.m_bodyB.m_invMass;
        this.m_mC = this.m_bodyC.m_invMass;
        this.m_mD = this.m_bodyD.m_invMass;
        this.m_iA = this.m_bodyA.m_invI;
        this.m_iB = this.m_bodyB.m_invI;
        this.m_iC = this.m_bodyC.m_invI;
        this.m_iD = this.m_bodyD.m_invI;
        var aA = data.positions[this.m_indexA].a;
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var aB = data.positions[this.m_indexB].a;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var aC = data.positions[this.m_indexC].a;
        var vC = data.velocities[this.m_indexC].v;
        var wC = data.velocities[this.m_indexC].w;
        var aD = data.positions[this.m_indexD].a;
        var vD = data.velocities[this.m_indexD].v;
        var wD = data.velocities[this.m_indexD].w;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB), qC = this.m_qC.SetAngle(aC), qD = this.m_qD.SetAngle(aD);
        this.m_mass = 0;
        if (this.m_typeA === b2JointType.e_revoluteJoint) {
            this.m_JvAC.SetZero();
            this.m_JwA = 1;
            this.m_JwC = 1;
            this.m_mass += this.m_iA + this.m_iC;
        }
        else {
            var u = b2Rot.MulRV(qC, this.m_localAxisC, b2GearJoint.InitVelocityConstraints_s_u);
            b2Vec2.SubVV(this.m_localAnchorC, this.m_lcC, this.m_lalcC);
            var rC = b2Rot.MulRV(qC, this.m_lalcC, b2GearJoint.InitVelocityConstraints_s_rC);
            b2Vec2.SubVV(this.m_localAnchorA, this.m_lcA, this.m_lalcA);
            var rA = b2Rot.MulRV(qA, this.m_lalcA, b2GearJoint.InitVelocityConstraints_s_rA);
            this.m_JvAC.Copy(u);
            this.m_JwC = b2Vec2.CrossVV(rC, u);
            this.m_JwA = b2Vec2.CrossVV(rA, u);
            this.m_mass += this.m_mC + this.m_mA + this.m_iC * this.m_JwC * this.m_JwC + this.m_iA * this.m_JwA * this.m_JwA;
        }
        if (this.m_typeB === b2JointType.e_revoluteJoint) {
            this.m_JvBD.SetZero();
            this.m_JwB = this.m_ratio;
            this.m_JwD = this.m_ratio;
            this.m_mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
        }
        else {
            var u = b2Rot.MulRV(qD, this.m_localAxisD, b2GearJoint.InitVelocityConstraints_s_u);
            b2Vec2.SubVV(this.m_localAnchorD, this.m_lcD, this.m_lalcD);
            var rD = b2Rot.MulRV(qD, this.m_lalcD, b2GearJoint.InitVelocityConstraints_s_rD);
            b2Vec2.SubVV(this.m_localAnchorB, this.m_lcB, this.m_lalcB);
            var rB = b2Rot.MulRV(qB, this.m_lalcB, b2GearJoint.InitVelocityConstraints_s_rB);
            b2Vec2.MulSV(this.m_ratio, u, this.m_JvBD);
            this.m_JwD = this.m_ratio * b2Vec2.CrossVV(rD, u);
            this.m_JwB = this.m_ratio * b2Vec2.CrossVV(rB, u);
            this.m_mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * this.m_JwD * this.m_JwD + this.m_iB * this.m_JwB * this.m_JwB;
        }
        this.m_mass = this.m_mass > 0 ? 1 / this.m_mass : 0;
        if (data.step.warmStarting) {
            vA.SelfMulAdd(this.m_mA * this.m_impulse, this.m_JvAC);
            wA += this.m_iA * this.m_impulse * this.m_JwA;
            vB.SelfMulAdd(this.m_mB * this.m_impulse, this.m_JvBD);
            wB += this.m_iB * this.m_impulse * this.m_JwB;
            vC.SelfMulSub(this.m_mC * this.m_impulse, this.m_JvAC);
            wC -= this.m_iC * this.m_impulse * this.m_JwC;
            vD.SelfMulSub(this.m_mD * this.m_impulse, this.m_JvBD);
            wD -= this.m_iD * this.m_impulse * this.m_JwD;
        }
        else {
            this.m_impulse = 0;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
        data.velocities[this.m_indexC].w = wC;
        data.velocities[this.m_indexD].w = wD;
    };
    b2GearJoint.prototype.SolveVelocityConstraints = function (data) {
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var vC = data.velocities[this.m_indexC].v;
        var wC = data.velocities[this.m_indexC].w;
        var vD = data.velocities[this.m_indexD].v;
        var wD = data.velocities[this.m_indexD].w;
        var Cdot = b2Vec2.DotVV(this.m_JvAC, b2Vec2.SubVV(vA, vC, b2Vec2.s_t0)) +
            b2Vec2.DotVV(this.m_JvBD, b2Vec2.SubVV(vB, vD, b2Vec2.s_t0));
        Cdot += (this.m_JwA * wA - this.m_JwC * wC) + (this.m_JwB * wB - this.m_JwD * wD);
        var impulse = -this.m_mass * Cdot;
        this.m_impulse += impulse;
        vA.SelfMulAdd((this.m_mA * impulse), this.m_JvAC);
        wA += this.m_iA * impulse * this.m_JwA;
        vB.SelfMulAdd((this.m_mB * impulse), this.m_JvBD);
        wB += this.m_iB * impulse * this.m_JwB;
        vC.SelfMulSub((this.m_mC * impulse), this.m_JvAC);
        wC -= this.m_iC * impulse * this.m_JwC;
        vD.SelfMulSub((this.m_mD * impulse), this.m_JvBD);
        wD -= this.m_iD * impulse * this.m_JwD;
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
        data.velocities[this.m_indexC].w = wC;
        data.velocities[this.m_indexD].w = wD;
    };
    b2GearJoint.prototype.SolvePositionConstraints = function (data) {
        var cA = data.positions[this.m_indexA].c;
        var aA = data.positions[this.m_indexA].a;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var cC = data.positions[this.m_indexC].c;
        var aC = data.positions[this.m_indexC].a;
        var cD = data.positions[this.m_indexD].c;
        var aD = data.positions[this.m_indexD].a;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB), qC = this.m_qC.SetAngle(aC), qD = this.m_qD.SetAngle(aD);
        var linearError = 0;
        var coordinateA, coordinateB;
        var JvAC = this.m_JvAC, JvBD = this.m_JvBD;
        var JwA, JwB, JwC, JwD;
        var mass = 0;
        if (this.m_typeA === b2JointType.e_revoluteJoint) {
            JvAC.SetZero();
            JwA = 1;
            JwC = 1;
            mass += this.m_iA + this.m_iC;
            coordinateA = aA - aC - this.m_referenceAngleA;
        }
        else {
            var u = b2Rot.MulRV(qC, this.m_localAxisC, b2GearJoint.SolvePositionConstraints_s_u);
            var rC = b2Rot.MulRV(qC, this.m_lalcC, b2GearJoint.SolvePositionConstraints_s_rC);
            var rA = b2Rot.MulRV(qA, this.m_lalcA, b2GearJoint.SolvePositionConstraints_s_rA);
            JvAC.Copy(u);
            JwC = b2Vec2.CrossVV(rC, u);
            JwA = b2Vec2.CrossVV(rA, u);
            mass += this.m_mC + this.m_mA + this.m_iC * JwC * JwC + this.m_iA * JwA * JwA;
            var pC = this.m_lalcC;
            var pA = b2Rot.MulTRV(qC, b2Vec2.AddVV(rA, b2Vec2.SubVV(cA, cC, b2Vec2.s_t0), b2Vec2.s_t0), b2Vec2.s_t0);
            coordinateA = b2Vec2.DotVV(b2Vec2.SubVV(pA, pC, b2Vec2.s_t0), this.m_localAxisC);
        }
        if (this.m_typeB === b2JointType.e_revoluteJoint) {
            JvBD.SetZero();
            JwB = this.m_ratio;
            JwD = this.m_ratio;
            mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
            coordinateB = aB - aD - this.m_referenceAngleB;
        }
        else {
            var u = b2Rot.MulRV(qD, this.m_localAxisD, b2GearJoint.SolvePositionConstraints_s_u);
            var rD = b2Rot.MulRV(qD, this.m_lalcD, b2GearJoint.SolvePositionConstraints_s_rD);
            var rB = b2Rot.MulRV(qB, this.m_lalcB, b2GearJoint.SolvePositionConstraints_s_rB);
            b2Vec2.MulSV(this.m_ratio, u, JvBD);
            JwD = this.m_ratio * b2Vec2.CrossVV(rD, u);
            JwB = this.m_ratio * b2Vec2.CrossVV(rB, u);
            mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * JwD * JwD + this.m_iB * JwB * JwB;
            var pD = this.m_lalcD;
            var pB = b2Rot.MulTRV(qD, b2Vec2.AddVV(rB, b2Vec2.SubVV(cB, cD, b2Vec2.s_t0), b2Vec2.s_t0), b2Vec2.s_t0);
            coordinateB = b2Vec2.DotVV(b2Vec2.SubVV(pB, pD, b2Vec2.s_t0), this.m_localAxisD);
        }
        var C = (coordinateA + this.m_ratio * coordinateB) - this.m_constant;
        var impulse = 0;
        if (mass > 0) {
            impulse = -C / mass;
        }
        cA.SelfMulAdd(this.m_mA * impulse, JvAC);
        aA += this.m_iA * impulse * JwA;
        cB.SelfMulAdd(this.m_mB * impulse, JvBD);
        aB += this.m_iB * impulse * JwB;
        cC.SelfMulSub(this.m_mC * impulse, JvAC);
        aC -= this.m_iC * impulse * JwC;
        cD.SelfMulSub(this.m_mD * impulse, JvBD);
        aD -= this.m_iD * impulse * JwD;
        data.positions[this.m_indexA].a = aA;
        data.positions[this.m_indexB].a = aB;
        data.positions[this.m_indexC].a = aC;
        data.positions[this.m_indexD].a = aD;
        return linearError < b2_linearSlop;
    };
    b2GearJoint.prototype.GetAnchorA = function (out) {
        return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
    };
    b2GearJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2GearJoint.prototype.GetReactionForce = function (inv_dt, out) {
        return b2Vec2.MulSV(inv_dt * this.m_impulse, this.m_JvAC, out);
    };
    b2GearJoint.prototype.GetReactionTorque = function (inv_dt) {
        return inv_dt * this.m_impulse * this.m_JwA;
    };
    b2GearJoint.prototype.GetJoint1 = function () { return this.m_joint1; };
    b2GearJoint.prototype.GetJoint2 = function () { return this.m_joint2; };
    b2GearJoint.prototype.GetRatio = function () {
        return this.m_ratio;
    };
    b2GearJoint.prototype.SetRatio = function (ratio) {
        this.m_ratio = ratio;
    };
    b2GearJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        var index1 = this.m_joint1.m_index;
        var index2 = this.m_joint2.m_index;
        log("  const jd: b2GearJointDef = new b2GearJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.joint1 = joints[%d];\n", index1);
        log("  jd.joint2 = joints[%d];\n", index2);
        log("  jd.ratio = %.15f;\n", this.m_ratio);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2GearJoint.InitVelocityConstraints_s_u = new b2Vec2();
    b2GearJoint.InitVelocityConstraints_s_rA = new b2Vec2();
    b2GearJoint.InitVelocityConstraints_s_rB = new b2Vec2();
    b2GearJoint.InitVelocityConstraints_s_rC = new b2Vec2();
    b2GearJoint.InitVelocityConstraints_s_rD = new b2Vec2();
    b2GearJoint.SolvePositionConstraints_s_u = new b2Vec2();
    b2GearJoint.SolvePositionConstraints_s_rA = new b2Vec2();
    b2GearJoint.SolvePositionConstraints_s_rB = new b2Vec2();
    b2GearJoint.SolvePositionConstraints_s_rC = new b2Vec2();
    b2GearJoint.SolvePositionConstraints_s_rD = new b2Vec2();
    return b2GearJoint;
}(b2Joint));
//# sourceMappingURL=b2_gear_joint.js.map