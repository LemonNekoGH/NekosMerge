var b2DestructionListener = (function () {
    function b2DestructionListener() {
    }
    b2DestructionListener.prototype.SayGoodbyeJoint = function (joint) { };
    b2DestructionListener.prototype.SayGoodbyeFixture = function (fixture) { };
    b2DestructionListener.prototype.SayGoodbyeParticleGroup = function (group) { };
    b2DestructionListener.prototype.SayGoodbyeParticle = function (system, index) { };
    return b2DestructionListener;
}());
var b2ContactFilter = (function () {
    function b2ContactFilter() {
    }
    b2ContactFilter.prototype.ShouldCollide = function (fixtureA, fixtureB) {
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        if (bodyB.GetType() === b2BodyType.b2_staticBody && bodyA.GetType() === b2BodyType.b2_staticBody) {
            return false;
        }
        if (!bodyB.ShouldCollideConnected(bodyA)) {
            return false;
        }
        var filter1 = fixtureA.GetFilterData();
        var filter2 = fixtureB.GetFilterData();
        if (filter1.groupIndex === filter2.groupIndex && filter1.groupIndex !== 0) {
            return (filter1.groupIndex > 0);
        }
        var collide = (((filter1.maskBits & filter2.categoryBits) !== 0) && ((filter1.categoryBits & filter2.maskBits) !== 0));
        return collide;
    };
    b2ContactFilter.prototype.ShouldCollideFixtureParticle = function (fixture, system, index) {
        return true;
    };
    b2ContactFilter.prototype.ShouldCollideParticleParticle = function (system, indexA, indexB) {
        return true;
    };
    b2ContactFilter.b2_defaultFilter = new b2ContactFilter();
    return b2ContactFilter;
}());
var b2ContactImpulse = (function () {
    function b2ContactImpulse() {
        this.normalImpulses = b2MakeNumberArray(b2_maxManifoldPoints);
        this.tangentImpulses = b2MakeNumberArray(b2_maxManifoldPoints);
        this.count = 0;
    }
    return b2ContactImpulse;
}());
var b2ContactListener = (function () {
    function b2ContactListener() {
    }
    b2ContactListener.prototype.BeginContact = function (contact) { };
    b2ContactListener.prototype.EndContact = function (contact) { };
    b2ContactListener.prototype.BeginContactFixtureParticle = function (system, contact) { };
    b2ContactListener.prototype.EndContactFixtureParticle = function (system, contact) { };
    b2ContactListener.prototype.BeginContactParticleParticle = function (system, contact) { };
    b2ContactListener.prototype.EndContactParticleParticle = function (system, contact) { };
    b2ContactListener.prototype.PreSolve = function (contact, oldManifold) { };
    b2ContactListener.prototype.PostSolve = function (contact, impulse) { };
    b2ContactListener.b2_defaultListener = new b2ContactListener();
    return b2ContactListener;
}());
var b2QueryCallback = (function () {
    function b2QueryCallback() {
    }
    b2QueryCallback.prototype.ReportFixture = function (fixture) {
        return true;
    };
    b2QueryCallback.prototype.ReportParticle = function (system, index) {
        return false;
    };
    b2QueryCallback.prototype.ShouldQueryParticleSystem = function (system) {
        return true;
    };
    return b2QueryCallback;
}());
var b2RayCastCallback = (function () {
    function b2RayCastCallback() {
    }
    b2RayCastCallback.prototype.ReportFixture = function (fixture, point, normal, fraction) {
        return fraction;
    };
    b2RayCastCallback.prototype.ReportParticle = function (system, index, point, normal, fraction) {
        return 0;
    };
    b2RayCastCallback.prototype.ShouldQueryParticleSystem = function (system) {
        return true;
    };
    return b2RayCastCallback;
}());
//# sourceMappingURL=b2_world_callbacks.js.map