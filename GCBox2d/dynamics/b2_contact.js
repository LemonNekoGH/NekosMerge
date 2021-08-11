function b2MixFriction(friction1, friction2) {
    return b2Sqrt(friction1 * friction2);
}
function b2MixRestitution(restitution1, restitution2) {
    return restitution1 > restitution2 ? restitution1 : restitution2;
}
function b2MixRestitutionThreshold(threshold1, threshold2) {
    return threshold1 < threshold2 ? threshold1 : threshold2;
}
var b2ContactEdge = (function () {
    function b2ContactEdge(contact) {
        this._other = null;
        this.prev = null;
        this.next = null;
        this.contact = contact;
    }
    Object.defineProperty(b2ContactEdge.prototype, "other", {
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
    b2ContactEdge.prototype.Reset = function () {
        this._other = null;
        this.prev = null;
        this.next = null;
    };
    return b2ContactEdge;
}());
var b2Contact = (function () {
    function b2Contact() {
        this.m_islandFlag = false;
        this.m_touchingFlag = false;
        this.m_enabledFlag = false;
        this.m_filterFlag = false;
        this.m_bulletHitFlag = false;
        this.m_toiFlag = false;
        this.m_prev = null;
        this.m_next = null;
        this.m_nodeA = new b2ContactEdge(this);
        this.m_nodeB = new b2ContactEdge(this);
        this.m_indexA = 0;
        this.m_indexB = 0;
        this.m_manifold = new b2Manifold();
        this.m_toiCount = 0;
        this.m_toi = 0;
        this.m_friction = 0;
        this.m_restitution = 0;
        this.m_restitutionThreshold = 0;
        this.m_tangentSpeed = 0;
        this.m_oldManifold = new b2Manifold();
    }
    b2Contact.prototype.GetManifold = function () {
        return this.m_manifold;
    };
    b2Contact.prototype.GetWorldManifold = function (worldManifold) {
        var bodyA = this.m_fixtureA.GetBody();
        var bodyB = this.m_fixtureB.GetBody();
        var shapeA = this.GetShapeA();
        var shapeB = this.GetShapeB();
        worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius);
    };
    b2Contact.prototype.IsTouching = function () {
        return this.m_touchingFlag;
    };
    b2Contact.prototype.SetEnabled = function (flag) {
        this.m_enabledFlag = flag;
    };
    b2Contact.prototype.IsEnabled = function () {
        return this.m_enabledFlag;
    };
    b2Contact.prototype.GetNext = function () {
        return this.m_next;
    };
    b2Contact.prototype.GetFixtureA = function () {
        return this.m_fixtureA;
    };
    b2Contact.prototype.GetChildIndexA = function () {
        return this.m_indexA;
    };
    b2Contact.prototype.GetShapeA = function () {
        return this.m_fixtureA.GetShape();
    };
    b2Contact.prototype.GetFixtureB = function () {
        return this.m_fixtureB;
    };
    b2Contact.prototype.GetChildIndexB = function () {
        return this.m_indexB;
    };
    b2Contact.prototype.GetShapeB = function () {
        return this.m_fixtureB.GetShape();
    };
    b2Contact.prototype.FlagForFiltering = function () {
        this.m_filterFlag = true;
    };
    b2Contact.prototype.SetFriction = function (friction) {
        this.m_friction = friction;
    };
    b2Contact.prototype.GetFriction = function () {
        return this.m_friction;
    };
    b2Contact.prototype.ResetFriction = function () {
        this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
    };
    b2Contact.prototype.SetRestitution = function (restitution) {
        this.m_restitution = restitution;
    };
    b2Contact.prototype.GetRestitution = function () {
        return this.m_restitution;
    };
    b2Contact.prototype.ResetRestitution = function () {
        this.m_restitution = b2MixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
    };
    b2Contact.prototype.SetRestitutionThreshold = function (threshold) {
        this.m_restitutionThreshold = threshold;
    };
    b2Contact.prototype.GetRestitutionThreshold = function () {
        return this.m_restitutionThreshold;
    };
    b2Contact.prototype.ResetRestitutionThreshold = function () {
        this.m_restitutionThreshold = b2MixRestitutionThreshold(this.m_fixtureA.m_restitutionThreshold, this.m_fixtureB.m_restitutionThreshold);
    };
    b2Contact.prototype.SetTangentSpeed = function (speed) {
        this.m_tangentSpeed = speed;
    };
    b2Contact.prototype.GetTangentSpeed = function () {
        return this.m_tangentSpeed;
    };
    b2Contact.prototype.Reset = function (fixtureA, indexA, fixtureB, indexB) {
        this.m_islandFlag = false;
        this.m_touchingFlag = false;
        this.m_enabledFlag = true;
        this.m_filterFlag = false;
        this.m_bulletHitFlag = false;
        this.m_toiFlag = false;
        this.m_fixtureA = fixtureA;
        this.m_fixtureB = fixtureB;
        this.m_indexA = indexA;
        this.m_indexB = indexB;
        this.m_manifold.pointCount = 0;
        this.m_prev = null;
        this.m_next = null;
        this.m_nodeA.Reset();
        this.m_nodeB.Reset();
        this.m_toiCount = 0;
        this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
        this.m_restitution = b2MixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
        this.m_restitutionThreshold = b2MixRestitutionThreshold(this.m_fixtureA.m_restitutionThreshold, this.m_fixtureB.m_restitutionThreshold);
    };
    b2Contact.prototype.Update = function (listener) {
        var tManifold = this.m_oldManifold;
        this.m_oldManifold = this.m_manifold;
        this.m_manifold = tManifold;
        this.m_enabledFlag = true;
        var touching = false;
        var wasTouching = this.m_touchingFlag;
        var sensorA = this.m_fixtureA.IsSensor();
        var sensorB = this.m_fixtureB.IsSensor();
        var sensor = sensorA || sensorB;
        var bodyA = this.m_fixtureA.GetBody();
        var bodyB = this.m_fixtureB.GetBody();
        var xfA = bodyA.GetTransform();
        var xfB = bodyB.GetTransform();
        if (sensor) {
            var shapeA = this.GetShapeA();
            var shapeB = this.GetShapeB();
            touching = b2TestOverlapShape(shapeA, this.m_indexA, shapeB, this.m_indexB, xfA, xfB);
            this.m_manifold.pointCount = 0;
        }
        else {
            this.Evaluate(this.m_manifold, xfA, xfB);
            touching = this.m_manifold.pointCount > 0;
            for (var i = 0; i < this.m_manifold.pointCount; ++i) {
                var mp2 = this.m_manifold.points[i];
                mp2.normalImpulse = 0;
                mp2.tangentImpulse = 0;
                var id2 = mp2.id;
                for (var j = 0; j < this.m_oldManifold.pointCount; ++j) {
                    var mp1 = this.m_oldManifold.points[j];
                    if (mp1.id.key === id2.key) {
                        mp2.normalImpulse = mp1.normalImpulse;
                        mp2.tangentImpulse = mp1.tangentImpulse;
                        break;
                    }
                }
            }
            if (touching !== wasTouching) {
                bodyA.SetAwake(true);
                bodyB.SetAwake(true);
            }
        }
        this.m_touchingFlag = touching;
        if (!wasTouching && touching && listener) {
            listener.BeginContact(this);
        }
        if (wasTouching && !touching && listener) {
            listener.EndContact(this);
        }
        if (!sensor && touching && listener) {
            listener.PreSolve(this, this.m_oldManifold);
        }
    };
    b2Contact.prototype.ComputeTOI = function (sweepA, sweepB) {
        var input = b2Contact.ComputeTOI_s_input;
        input.proxyA.SetShape(this.GetShapeA(), this.m_indexA);
        input.proxyB.SetShape(this.GetShapeB(), this.m_indexB);
        input.sweepA.Copy(sweepA);
        input.sweepB.Copy(sweepB);
        input.tMax = b2_linearSlop;
        var output = b2Contact.ComputeTOI_s_output;
        b2TimeOfImpact(output, input);
        return output.t;
    };
    b2Contact.ComputeTOI_s_input = new b2TOIInput();
    b2Contact.ComputeTOI_s_output = new b2TOIOutput();
    return b2Contact;
}());
//# sourceMappingURL=b2_contact.js.map