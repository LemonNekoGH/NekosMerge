




var b2TensorDampingController = (function (_super) {
    __extends(b2TensorDampingController, _super);
    function b2TensorDampingController() {
        _super.apply(this, arguments);
        this.T = new b2Mat22();
        this.maxTimestep = 0;
    }
    b2TensorDampingController.prototype.Step = function (step) {
        var timestep = step.dt;
        if (timestep <= b2_epsilon) {
            return;
        }
        if (timestep > this.maxTimestep && this.maxTimestep > 0) {
            timestep = this.maxTimestep;
        }
        for (var i = this.m_bodyList; i; i = i.nextBody) {
            var body = i.body;
            if (!body.IsAwake()) {
                continue;
            }
            var damping = body.GetWorldVector(b2Mat22.MulMV(this.T, body.GetLocalVector(body.GetLinearVelocity(), b2Vec2.s_t0), b2Vec2.s_t1), b2TensorDampingController.Step_s_damping);
            body.SetLinearVelocity(b2Vec2.AddVV(body.GetLinearVelocity(), b2Vec2.MulSV(timestep, damping, b2Vec2.s_t0), b2Vec2.s_t1));
        }
    };
    b2TensorDampingController.prototype.Draw = function (draw) { };
    b2TensorDampingController.prototype.SetAxisAligned = function (xDamping, yDamping) {
        this.T.ex.x = (-xDamping);
        this.T.ex.y = 0;
        this.T.ey.x = 0;
        this.T.ey.y = (-yDamping);
        if (xDamping > 0 || yDamping > 0) {
            this.maxTimestep = 1 / b2Max(xDamping, yDamping);
        }
        else {
            this.maxTimestep = 0;
        }
    };
    b2TensorDampingController.Step_s_damping = new b2Vec2();
    return b2TensorDampingController;
}(b2Controller));
//# sourceMappingURL=b2_tensor_damping_controller.js.map