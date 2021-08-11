




var b2_minPulleyLength = 2;
var b2PulleyJointDef = (function (_super) {
    __extends(b2PulleyJointDef, _super);
    function b2PulleyJointDef() {
        _super.call(this, b2JointType.e_pulleyJoint);
        this.groundAnchorA = new b2Vec2(-1, 1);
        this.groundAnchorB = new b2Vec2(1, 1);
        this.localAnchorA = new b2Vec2(-1, 0);
        this.localAnchorB = new b2Vec2(1, 0);
        this.lengthA = 0;
        this.lengthB = 0;
        this.ratio = 1;
        this.collideConnected = true;
    }
    b2PulleyJointDef.prototype.Initialize = function (bA, bB, groundA, groundB, anchorA, anchorB, r) {
        this.bodyA = bA;
        this.bodyB = bB;
        this.groundAnchorA.Copy(groundA);
        this.groundAnchorB.Copy(groundB);
        this.bodyA.GetLocalPoint(anchorA, this.localAnchorA);
        this.bodyB.GetLocalPoint(anchorB, this.localAnchorB);
        this.lengthA = b2Vec2.DistanceVV(anchorA, groundA);
        this.lengthB = b2Vec2.DistanceVV(anchorB, groundB);
        this.ratio = r;
    };
    return b2PulleyJointDef;
}(b2JointDef));
var b2PulleyJoint = (function (_super) {
    __extends(b2PulleyJoint, _super);
    function b2PulleyJoint(def) {
        _super.call(this, def);
        this.m_groundAnchorA = new b2Vec2();
        this.m_groundAnchorB = new b2Vec2();
        this.m_lengthA = 0;
        this.m_lengthB = 0;
        this.m_localAnchorA = new b2Vec2();
        this.m_localAnchorB = new b2Vec2();
        this.m_constant = 0;
        this.m_ratio = 0;
        this.m_impulse = 0;
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_uA = new b2Vec2();
        this.m_uB = new b2Vec2();
        this.m_rA = new b2Vec2();
        this.m_rB = new b2Vec2();
        this.m_localCenterA = new b2Vec2();
        this.m_localCenterB = new b2Vec2();
        this.m_invMassA = 0;
        this.m_invMassB = 0;
        this.m_invIA = 0;
        this.m_invIB = 0;
        this.m_mass = 0;
        this.m_qA = new b2Rot();
        this.m_qB = new b2Rot();
        this.m_lalcA = new b2Vec2();
        this.m_lalcB = new b2Vec2();
        this.m_groundAnchorA.Copy(b2Maybe(def.groundAnchorA, new b2Vec2(-1, 1)));
        this.m_groundAnchorB.Copy(b2Maybe(def.groundAnchorB, new b2Vec2(1, 0)));
        this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, new b2Vec2(-1, 0)));
        this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, new b2Vec2(1, 0)));
        this.m_lengthA = b2Maybe(def.lengthA, 0);
        this.m_lengthB = b2Maybe(def.lengthB, 0);
        this.m_ratio = b2Maybe(def.ratio, 1);
        this.m_constant = b2Maybe(def.lengthA, 0) + this.m_ratio * b2Maybe(def.lengthB, 0);
        this.m_impulse = 0;
    }
    b2PulleyJoint.prototype.InitVelocityConstraints = function (data) {
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
        this.m_uA.Copy(cA).SelfAdd(this.m_rA).SelfSub(this.m_groundAnchorA);
        this.m_uB.Copy(cB).SelfAdd(this.m_rB).SelfSub(this.m_groundAnchorB);
        var lengthA = this.m_uA.Length();
        var lengthB = this.m_uB.Length();
        if (lengthA > 10 * b2_linearSlop) {
            this.m_uA.SelfMul(1 / lengthA);
        }
        else {
            this.m_uA.SetZero();
        }
        if (lengthB > 10 * b2_linearSlop) {
            this.m_uB.SelfMul(1 / lengthB);
        }
        else {
            this.m_uB.SetZero();
        }
        var ruA = b2Vec2.CrossVV(this.m_rA, this.m_uA);
        var ruB = b2Vec2.CrossVV(this.m_rB, this.m_uB);
        var mA = this.m_invMassA + this.m_invIA * ruA * ruA;
        var mB = this.m_invMassB + this.m_invIB * ruB * ruB;
        this.m_mass = mA + this.m_ratio * this.m_ratio * mB;
        if (this.m_mass > 0) {
            this.m_mass = 1 / this.m_mass;
        }
        if (data.step.warmStarting) {
            this.m_impulse *= data.step.dtRatio;
            var PA = b2Vec2.MulSV(-(this.m_impulse), this.m_uA, b2PulleyJoint.InitVelocityConstraints_s_PA);
            var PB = b2Vec2.MulSV((-this.m_ratio * this.m_impulse), this.m_uB, b2PulleyJoint.InitVelocityConstraints_s_PB);
            vA.SelfMulAdd(this.m_invMassA, PA);
            wA += this.m_invIA * b2Vec2.CrossVV(this.m_rA, PA);
            vB.SelfMulAdd(this.m_invMassB, PB);
            wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, PB);
        }
        else {
            this.m_impulse = 0;
        }
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2PulleyJoint.prototype.SolveVelocityConstraints = function (data) {
        var vA = data.velocities[this.m_indexA].v;
        var wA = data.velocities[this.m_indexA].w;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var vpA = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2PulleyJoint.SolveVelocityConstraints_s_vpA);
        var vpB = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2PulleyJoint.SolveVelocityConstraints_s_vpB);
        var Cdot = -b2Vec2.DotVV(this.m_uA, vpA) - this.m_ratio * b2Vec2.DotVV(this.m_uB, vpB);
        var impulse = -this.m_mass * Cdot;
        this.m_impulse += impulse;
        var PA = b2Vec2.MulSV(-impulse, this.m_uA, b2PulleyJoint.SolveVelocityConstraints_s_PA);
        var PB = b2Vec2.MulSV(-this.m_ratio * impulse, this.m_uB, b2PulleyJoint.SolveVelocityConstraints_s_PB);
        vA.SelfMulAdd(this.m_invMassA, PA);
        wA += this.m_invIA * b2Vec2.CrossVV(this.m_rA, PA);
        vB.SelfMulAdd(this.m_invMassB, PB);
        wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, PB);
        data.velocities[this.m_indexA].w = wA;
        data.velocities[this.m_indexB].w = wB;
    };
    b2PulleyJoint.prototype.SolvePositionConstraints = function (data) {
        var cA = data.positions[this.m_indexA].c;
        var aA = data.positions[this.m_indexA].a;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var qA = this.m_qA.SetAngle(aA), qB = this.m_qB.SetAngle(aB);
        b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
        var rA = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
        b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
        var rB = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        var uA = this.m_uA.Copy(cA).SelfAdd(rA).SelfSub(this.m_groundAnchorA);
        var uB = this.m_uB.Copy(cB).SelfAdd(rB).SelfSub(this.m_groundAnchorB);
        var lengthA = uA.Length();
        var lengthB = uB.Length();
        if (lengthA > 10 * b2_linearSlop) {
            uA.SelfMul(1 / lengthA);
        }
        else {
            uA.SetZero();
        }
        if (lengthB > 10 * b2_linearSlop) {
            uB.SelfMul(1 / lengthB);
        }
        else {
            uB.SetZero();
        }
        var ruA = b2Vec2.CrossVV(rA, uA);
        var ruB = b2Vec2.CrossVV(rB, uB);
        var mA = this.m_invMassA + this.m_invIA * ruA * ruA;
        var mB = this.m_invMassB + this.m_invIB * ruB * ruB;
        var mass = mA + this.m_ratio * this.m_ratio * mB;
        if (mass > 0) {
            mass = 1 / mass;
        }
        var C = this.m_constant - lengthA - this.m_ratio * lengthB;
        var linearError = b2Abs(C);
        var impulse = -mass * C;
        var PA = b2Vec2.MulSV(-impulse, uA, b2PulleyJoint.SolvePositionConstraints_s_PA);
        var PB = b2Vec2.MulSV(-this.m_ratio * impulse, uB, b2PulleyJoint.SolvePositionConstraints_s_PB);
        cA.SelfMulAdd(this.m_invMassA, PA);
        aA += this.m_invIA * b2Vec2.CrossVV(rA, PA);
        cB.SelfMulAdd(this.m_invMassB, PB);
        aB += this.m_invIB * b2Vec2.CrossVV(rB, PB);
        data.positions[this.m_indexA].a = aA;
        data.positions[this.m_indexB].a = aB;
        return linearError < b2_linearSlop;
    };
    b2PulleyJoint.prototype.GetAnchorA = function (out) {
        return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
    };
    b2PulleyJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2PulleyJoint.prototype.GetReactionForce = function (inv_dt, out) {
        out.x = inv_dt * this.m_impulse * this.m_uB.x;
        out.y = inv_dt * this.m_impulse * this.m_uB.y;
        return out;
    };
    b2PulleyJoint.prototype.GetReactionTorque = function (inv_dt) {
        return 0;
    };
    b2PulleyJoint.prototype.GetGroundAnchorA = function () {
        return this.m_groundAnchorA;
    };
    b2PulleyJoint.prototype.GetGroundAnchorB = function () {
        return this.m_groundAnchorB;
    };
    b2PulleyJoint.prototype.GetLengthA = function () {
        return this.m_lengthA;
    };
    b2PulleyJoint.prototype.GetLengthB = function () {
        return this.m_lengthB;
    };
    b2PulleyJoint.prototype.GetRatio = function () {
        return this.m_ratio;
    };
    b2PulleyJoint.prototype.GetCurrentLengthA = function () {
        var p = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, b2PulleyJoint.GetCurrentLengthA_s_p);
        var s = this.m_groundAnchorA;
        return b2Vec2.DistanceVV(p, s);
    };
    b2PulleyJoint.prototype.GetCurrentLengthB = function () {
        var p = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, b2PulleyJoint.GetCurrentLengthB_s_p);
        var s = this.m_groundAnchorB;
        return b2Vec2.DistanceVV(p, s);
    };
    b2PulleyJoint.prototype.Dump = function (log) {
        var indexA = this.m_bodyA.m_islandIndex;
        var indexB = this.m_bodyB.m_islandIndex;
        log("  const jd: b2PulleyJointDef = new b2PulleyJointDef();\n");
        log("  jd.bodyA = bodies[%d];\n", indexA);
        log("  jd.bodyB = bodies[%d];\n", indexB);
        log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
        log("  jd.groundAnchorA.Set(%.15f, %.15f);\n", this.m_groundAnchorA.x, this.m_groundAnchorA.y);
        log("  jd.groundAnchorB.Set(%.15f, %.15f);\n", this.m_groundAnchorB.x, this.m_groundAnchorB.y);
        log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
        log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
        log("  jd.lengthA = %.15f;\n", this.m_lengthA);
        log("  jd.lengthB = %.15f;\n", this.m_lengthB);
        log("  jd.ratio = %.15f;\n", this.m_ratio);
        log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
    };
    b2PulleyJoint.prototype.ShiftOrigin = function (newOrigin) {
        this.m_groundAnchorA.SelfSub(newOrigin);
        this.m_groundAnchorB.SelfSub(newOrigin);
    };
    b2PulleyJoint.InitVelocityConstraints_s_PA = new b2Vec2();
    b2PulleyJoint.InitVelocityConstraints_s_PB = new b2Vec2();
    b2PulleyJoint.SolveVelocityConstraints_s_vpA = new b2Vec2();
    b2PulleyJoint.SolveVelocityConstraints_s_vpB = new b2Vec2();
    b2PulleyJoint.SolveVelocityConstraints_s_PA = new b2Vec2();
    b2PulleyJoint.SolveVelocityConstraints_s_PB = new b2Vec2();
    b2PulleyJoint.SolvePositionConstraints_s_PA = new b2Vec2();
    b2PulleyJoint.SolvePositionConstraints_s_PB = new b2Vec2();
    b2PulleyJoint.GetCurrentLengthA_s_p = new b2Vec2();
    b2PulleyJoint.GetCurrentLengthB_s_p = new b2Vec2();
    return b2PulleyJoint;
}(b2Joint));
//# sourceMappingURL=b2_pulley_joint.js.map