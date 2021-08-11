




var b2MouseJointDef = (function (_super) {
    __extends(b2MouseJointDef, _super);
    function b2MouseJointDef() {
        _super.call(this, b2JointType.e_mouseJoint);
        this.target = new b2Vec2();
        this.maxForce = 0;
        this.stiffness = 5;
        this.damping = 0.7;
    }
    return b2MouseJointDef;
}(b2JointDef));
var b2MouseJoint = (function (_super) {
    __extends(b2MouseJoint, _super);
    function b2MouseJoint(def) {
        _super.call(this, def);
        this.m_localAnchorB = new b2Vec2();
        this.m_targetA = new b2Vec2();
        this.m_stiffness = 0;
        this.m_damping = 0;
        this.m_beta = 0;
        this.m_impulse = new b2Vec2();
        this.m_maxForce = 0;
        this.m_gamma = 0;
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_rB = new b2Vec2();
        this.m_localCenterB = new b2Vec2();
        this.m_invMassB = 0;
        this.m_invIB = 0;
        this.m_mass = new b2Mat22();
        this.m_C = new b2Vec2();
        this.m_qB = new b2Rot();
        this.m_lalcB = new b2Vec2();
        this.m_K = new b2Mat22();
        this.m_targetA.Copy(b2Maybe(def.target, b2Vec2.ZERO));
        b2Transform.MulTXV(this.m_bodyB.GetTransform(), this.m_targetA, this.m_localAnchorB);
        this.m_maxForce = b2Maybe(def.maxForce, 0);
        this.m_impulse.SetZero();
        this.m_stiffness = b2Maybe(def.stiffness, 0);
        this.m_damping = b2Maybe(def.damping, 0);
        this.m_beta = 0;
        this.m_gamma = 0;
    }
    b2MouseJoint.prototype.SetTarget = function (target) {
        if (!this.m_bodyB.IsAwake()) {
            this.m_bodyB.SetAwake(true);
        }
        this.m_targetA.Copy(target);
    };
    b2MouseJoint.prototype.GetTarget = function () {
        return this.m_targetA;
    };
    b2MouseJoint.prototype.SetMaxForce = function (maxForce) {
        this.m_maxForce = maxForce;
    };
    b2MouseJoint.prototype.GetMaxForce = function () {
        return this.m_maxForce;
    };
    b2MouseJoint.prototype.SetStiffness = function (stiffness) {
        this.m_stiffness = stiffness;
    };
    b2MouseJoint.prototype.GetStiffness = function () {
        return this.m_stiffness;
    };
    b2MouseJoint.prototype.SetDamping = function (damping) {
        this.m_damping = damping;
    };
    b2MouseJoint.prototype.GetDamping = function () {
        return this.m_damping;
    };
    b2MouseJoint.prototype.InitVelocityConstraints = function (data) {
        this.m_indexB = this.m_bodyB.m_islandIndex;
        this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
        this.m_invMassB = this.m_bodyB.m_invMass;
        this.m_invIB = this.m_bodyB.m_invI;
        var cB = data.positions[this.m_indexB].c;
        var aB = data.positions[this.m_indexB].a;
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var qB = this.m_qB.SetAngle(aB);
        var mass = this.m_bodyB.GetMass();
        var omega = 2 * b2_pi * this.m_stiffness;
        var d = 2 * mass * this.m_damping * omega;
        var k = mass * (omega * omega);
        var h = data.step.dt;
        this.m_gamma = h * (d + h * k);
        if (this.m_gamma !== 0) {
            this.m_gamma = 1 / this.m_gamma;
        }
        this.m_beta = h * k * this.m_gamma;
        b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
        b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
        var K = this.m_K;
        K.ex.x = this.m_invMassB + this.m_invIB * this.m_rB.y * this.m_rB.y + this.m_gamma;
        K.ex.y = -this.m_invIB * this.m_rB.x * this.m_rB.y;
        K.ey.x = K.ex.y;
        K.ey.y = this.m_invMassB + this.m_invIB * this.m_rB.x * this.m_rB.x + this.m_gamma;
        K.GetInverse(this.m_mass);
        this.m_C.x = cB.x + this.m_rB.x - this.m_targetA.x;
        this.m_C.y = cB.y + this.m_rB.y - this.m_targetA.y;
        this.m_C.SelfMul(this.m_beta);
        wB *= 0.98;
        if (data.step.warmStarting) {
            this.m_impulse.SelfMul(data.step.dtRatio);
            vB.x += this.m_invMassB * this.m_impulse.x;
            vB.y += this.m_invMassB * this.m_impulse.y;
            wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, this.m_impulse);
        }
        else {
            this.m_impulse.SetZero();
        }
        data.velocities[this.m_indexB].w = wB;
    };
    b2MouseJoint.prototype.SolveVelocityConstraints = function (data) {
        var vB = data.velocities[this.m_indexB].v;
        var wB = data.velocities[this.m_indexB].w;
        var Cdot = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2MouseJoint.SolveVelocityConstraints_s_Cdot);
        var impulse = b2Mat22.MulMV(this.m_mass, b2Vec2.AddVV(Cdot, b2Vec2.AddVV(this.m_C, b2Vec2.MulSV(this.m_gamma, this.m_impulse, b2Vec2.s_t0), b2Vec2.s_t0), b2Vec2.s_t0).SelfNeg(), b2MouseJoint.SolveVelocityConstraints_s_impulse);
        var oldImpulse = b2MouseJoint.SolveVelocityConstraints_s_oldImpulse.Copy(this.m_impulse);
        this.m_impulse.SelfAdd(impulse);
        var maxImpulse = data.step.dt * this.m_maxForce;
        if (this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
            this.m_impulse.SelfMul(maxImpulse / this.m_impulse.Length());
        }
        b2Vec2.SubVV(this.m_impulse, oldImpulse, impulse);
        vB.SelfMulAdd(this.m_invMassB, impulse);
        wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, impulse);
        data.velocities[this.m_indexB].w = wB;
    };
    b2MouseJoint.prototype.SolvePositionConstraints = function (data) {
        return true;
    };
    b2MouseJoint.prototype.GetAnchorA = function (out) {
        out.x = this.m_targetA.x;
        out.y = this.m_targetA.y;
        return out;
    };
    b2MouseJoint.prototype.GetAnchorB = function (out) {
        return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
    };
    b2MouseJoint.prototype.GetReactionForce = function (inv_dt, out) {
        return b2Vec2.MulSV(inv_dt, this.m_impulse, out);
    };
    b2MouseJoint.prototype.GetReactionTorque = function (inv_dt) {
        return 0;
    };
    b2MouseJoint.prototype.Dump = function (log) {
        log("Mouse joint dumping is not supported.\n");
    };
    b2MouseJoint.prototype.ShiftOrigin = function (newOrigin) {
        this.m_targetA.SelfSub(newOrigin);
    };
    b2MouseJoint.SolveVelocityConstraints_s_Cdot = new b2Vec2();
    b2MouseJoint.SolveVelocityConstraints_s_impulse = new b2Vec2();
    b2MouseJoint.SolveVelocityConstraints_s_oldImpulse = new b2Vec2();
    return b2MouseJoint;
}(b2Joint));
//# sourceMappingURL=b2_mouse_joint.js.map