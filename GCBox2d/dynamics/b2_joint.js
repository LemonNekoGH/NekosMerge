var b2JointType;
(function (b2JointType) {
    b2JointType[b2JointType["e_unknownJoint"] = 0] = "e_unknownJoint";
    b2JointType[b2JointType["e_revoluteJoint"] = 1] = "e_revoluteJoint";
    b2JointType[b2JointType["e_prismaticJoint"] = 2] = "e_prismaticJoint";
    b2JointType[b2JointType["e_distanceJoint"] = 3] = "e_distanceJoint";
    b2JointType[b2JointType["e_pulleyJoint"] = 4] = "e_pulleyJoint";
    b2JointType[b2JointType["e_mouseJoint"] = 5] = "e_mouseJoint";
    b2JointType[b2JointType["e_gearJoint"] = 6] = "e_gearJoint";
    b2JointType[b2JointType["e_wheelJoint"] = 7] = "e_wheelJoint";
    b2JointType[b2JointType["e_weldJoint"] = 8] = "e_weldJoint";
    b2JointType[b2JointType["e_frictionJoint"] = 9] = "e_frictionJoint";
    b2JointType[b2JointType["e_ropeJoint"] = 10] = "e_ropeJoint";
    b2JointType[b2JointType["e_motorJoint"] = 11] = "e_motorJoint";
    b2JointType[b2JointType["e_areaJoint"] = 12] = "e_areaJoint";
})(b2JointType || (b2JointType = {}));
var b2Jacobian = (function () {
    function b2Jacobian() {
        this.linear = new b2Vec2();
        this.angularA = 0;
        this.angularB = 0;
    }
    b2Jacobian.prototype.SetZero = function () {
        this.linear.SetZero();
        this.angularA = 0;
        this.angularB = 0;
        return this;
    };
    b2Jacobian.prototype.Set = function (x, a1, a2) {
        this.linear.Copy(x);
        this.angularA = a1;
        this.angularB = a2;
        return this;
    };
    return b2Jacobian;
}());
var b2JointEdge = (function () {
    function b2JointEdge(joint) {
        this._other = null;
        this.prev = null;
        this.next = null;
        this.joint = joint;
    }
    Object.defineProperty(b2JointEdge.prototype, "other", {
        get: function () {
            if (this._other === null) {
                throw new Error();
            }
            return this._other;
        },
        set: function (value) {
            if (this._other !== null) {
                throw new Error();
            }
            this._other = value;
        },
        enumerable: true,
        configurable: true
    });
    b2JointEdge.prototype.Reset = function () {
        this._other = null;
        this.prev = null;
        this.next = null;
    };
    return b2JointEdge;
}());
var b2JointDef = (function () {
    function b2JointDef(type) {
        this.type = b2JointType.e_unknownJoint;
        this.userData = null;
        this.collideConnected = false;
        this.type = type;
    }
    return b2JointDef;
}());
function b2LinearStiffness(def, frequencyHertz, dampingRatio, bodyA, bodyB) {
    var massA = bodyA.GetMass();
    var massB = bodyB.GetMass();
    var mass;
    if (massA > 0.0 && massB > 0.0) {
        mass = massA * massB / (massA + massB);
    }
    else if (massA > 0.0) {
        mass = massA;
    }
    else {
        mass = massB;
    }
    var omega = 2.0 * b2_pi * frequencyHertz;
    def.stiffness = mass * omega * omega;
    def.damping = 2.0 * mass * dampingRatio * omega;
}
function b2AngularStiffness(def, frequencyHertz, dampingRatio, bodyA, bodyB) {
    var IA = bodyA.GetInertia();
    var IB = bodyB.GetInertia();
    var I;
    if (IA > 0.0 && IB > 0.0) {
        I = IA * IB / (IA + IB);
    }
    else if (IA > 0.0) {
        I = IA;
    }
    else {
        I = IB;
    }
    var omega = 2.0 * b2_pi * frequencyHertz;
    def.stiffness = I * omega * omega;
    def.damping = 2.0 * I * dampingRatio * omega;
}
var b2Joint = (function () {
    function b2Joint(def) {
        this.m_type = b2JointType.e_unknownJoint;
        this.m_prev = null;
        this.m_next = null;
        this.m_edgeA = new b2JointEdge(this);
        this.m_edgeB = new b2JointEdge(this);
        this.m_index = 0;
        this.m_islandFlag = false;
        this.m_collideConnected = false;
        this.m_userData = null;
        this.m_type = def.type;
        this.m_edgeA.other = def.bodyB;
        this.m_edgeB.other = def.bodyA;
        this.m_bodyA = def.bodyA;
        this.m_bodyB = def.bodyB;
        this.m_collideConnected = b2Maybe(def.collideConnected, false);
        this.m_userData = b2Maybe(def.userData, null);
    }
    b2Joint.prototype.GetType = function () {
        return this.m_type;
    };
    b2Joint.prototype.GetBodyA = function () {
        return this.m_bodyA;
    };
    b2Joint.prototype.GetBodyB = function () {
        return this.m_bodyB;
    };
    b2Joint.prototype.GetNext = function () {
        return this.m_next;
    };
    b2Joint.prototype.GetUserData = function () {
        return this.m_userData;
    };
    b2Joint.prototype.SetUserData = function (data) {
        this.m_userData = data;
    };
    b2Joint.prototype.IsEnabled = function () {
        return this.m_bodyA.IsEnabled() && this.m_bodyB.IsEnabled();
    };
    b2Joint.prototype.GetCollideConnected = function () {
        return this.m_collideConnected;
    };
    b2Joint.prototype.Dump = function (log) {
        log("// Dump is not supported for this joint type.\n");
    };
    b2Joint.prototype.ShiftOrigin = function (newOrigin) { };
    b2Joint.prototype.Draw = function (draw) {
        var xf1 = this.m_bodyA.GetTransform();
        var xf2 = this.m_bodyB.GetTransform();
        var x1 = xf1.p;
        var x2 = xf2.p;
        var p1 = this.GetAnchorA(b2Joint.Draw_s_p1);
        var p2 = this.GetAnchorB(b2Joint.Draw_s_p2);
        var color = b2Joint.Draw_s_color.SetRGB(0.5, 0.8, 0.8);
        switch (this.m_type) {
            case b2JointType.e_distanceJoint:
                draw.DrawSegment(p1, p2, color);
                break;
            case b2JointType.e_pulleyJoint:
                {
                    var pulley = this;
                    var s1 = pulley.GetGroundAnchorA();
                    var s2 = pulley.GetGroundAnchorB();
                    draw.DrawSegment(s1, p1, color);
                    draw.DrawSegment(s2, p2, color);
                    draw.DrawSegment(s1, s2, color);
                }
                break;
            case b2JointType.e_mouseJoint:
                {
                    var c = b2Joint.Draw_s_c;
                    c.Set(0.0, 1.0, 0.0);
                    draw.DrawPoint(p1, 4.0, c);
                    draw.DrawPoint(p2, 4.0, c);
                    c.Set(0.8, 0.8, 0.8);
                    draw.DrawSegment(p1, p2, c);
                }
                break;
            default:
                draw.DrawSegment(x1, p1, color);
                draw.DrawSegment(p1, p2, color);
                draw.DrawSegment(x2, p2, color);
        }
    };
    b2Joint.Draw_s_p1 = new b2Vec2();
    b2Joint.Draw_s_p2 = new b2Vec2();
    b2Joint.Draw_s_color = new b2Color(0.5, 0.8, 0.8);
    b2Joint.Draw_s_c = new b2Color();
    return b2Joint;
}());
//# sourceMappingURL=b2_joint.js.map