




var b2ConstantForceController = (function (_super) {
    __extends(b2ConstantForceController, _super);
    function b2ConstantForceController() {
        _super.apply(this, arguments);
        this.F = new b2Vec2(0, 0);
    }
    b2ConstantForceController.prototype.Step = function (step) {
        for (var i = this.m_bodyList; i; i = i.nextBody) {
            var body = i.body;
            if (!body.IsAwake()) {
                continue;
            }
            body.ApplyForce(this.F, body.GetWorldCenter());
        }
    };
    b2ConstantForceController.prototype.Draw = function (draw) { };
    return b2ConstantForceController;
}(b2Controller));
//# sourceMappingURL=b2_constant_force_controller.js.map