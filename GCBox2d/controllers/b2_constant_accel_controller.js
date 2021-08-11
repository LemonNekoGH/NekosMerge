




var b2ConstantAccelController = (function (_super) {
    __extends(b2ConstantAccelController, _super);
    function b2ConstantAccelController() {
        _super.apply(this, arguments);
        this.A = new b2Vec2(0, 0);
    }
    b2ConstantAccelController.prototype.Step = function (step) {
        var dtA = b2Vec2.MulSV(step.dt, this.A, b2ConstantAccelController.Step_s_dtA);
        for (var i = this.m_bodyList; i; i = i.nextBody) {
            var body = i.body;
            if (!body.IsAwake()) {
                continue;
            }
            body.SetLinearVelocity(b2Vec2.AddVV(body.GetLinearVelocity(), dtA, b2Vec2.s_t0));
        }
    };
    b2ConstantAccelController.prototype.Draw = function (draw) { };
    b2ConstantAccelController.Step_s_dtA = new b2Vec2();
    return b2ConstantAccelController;
}(b2Controller));
//# sourceMappingURL=b2_constant_accel_controller.js.map