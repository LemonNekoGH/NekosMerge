var b2Profile = (function () {
    function b2Profile() {
        this.step = 0;
        this.collide = 0;
        this.solve = 0;
        this.solveInit = 0;
        this.solveVelocity = 0;
        this.solvePosition = 0;
        this.broadphase = 0;
        this.solveTOI = 0;
    }
    b2Profile.prototype.Reset = function () {
        this.step = 0;
        this.collide = 0;
        this.solve = 0;
        this.solveInit = 0;
        this.solveVelocity = 0;
        this.solvePosition = 0;
        this.broadphase = 0;
        this.solveTOI = 0;
        return this;
    };
    return b2Profile;
}());
var b2TimeStep = (function () {
    function b2TimeStep() {
        this.dt = 0;
        this.inv_dt = 0;
        this.dtRatio = 0;
        this.velocityIterations = 0;
        this.positionIterations = 0;
        this.particleIterations = 0;
        this.warmStarting = false;
    }
    b2TimeStep.prototype.Copy = function (step) {
        this.dt = step.dt;
        this.inv_dt = step.inv_dt;
        this.dtRatio = step.dtRatio;
        this.positionIterations = step.positionIterations;
        this.velocityIterations = step.velocityIterations;
        this.particleIterations = step.particleIterations;
        this.warmStarting = step.warmStarting;
        return this;
    };
    return b2TimeStep;
}());
var b2Position = (function () {
    function b2Position() {
        this.c = new b2Vec2();
        this.a = 0;
    }
    b2Position.MakeArray = function (length) {
        return b2MakeArray(length, function (i) { return new b2Position(); });
    };
    return b2Position;
}());
var b2Velocity = (function () {
    function b2Velocity() {
        this.v = new b2Vec2();
        this.w = 0;
    }
    b2Velocity.MakeArray = function (length) {
        return b2MakeArray(length, function (i) { return new b2Velocity(); });
    };
    return b2Velocity;
}());
var b2SolverData = (function () {
    function b2SolverData() {
        this.step = new b2TimeStep();
    }
    return b2SolverData;
}());
//# sourceMappingURL=b2_time_step.js.map