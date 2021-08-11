




var b2GravityController = (function (_super) {
    __extends(b2GravityController, _super);
    function b2GravityController() {
        _super.apply(this, arguments);
        this.G = 1;
        this.invSqr = true;
    }
    b2GravityController.prototype.Step = function (step) {
        if (this.invSqr) {
            for (var i = this.m_bodyList; i; i = i.nextBody) {
                var body1 = i.body;
                var p1 = body1.GetWorldCenter();
                var mass1 = body1.GetMass();
                for (var j = this.m_bodyList; j && j !== i; j = j.nextBody) {
                    var body2 = j.body;
                    var p2 = body2.GetWorldCenter();
                    var mass2 = body2.GetMass();
                    var dx = p2.x - p1.x;
                    var dy = p2.y - p1.y;
                    var r2 = dx * dx + dy * dy;
                    if (r2 < b2_epsilon) {
                        continue;
                    }
                    var f = b2GravityController.Step_s_f.Set(dx, dy);
                    f.SelfMul(this.G / r2 / b2Sqrt(r2) * mass1 * mass2);
                    if (body1.IsAwake()) {
                        body1.ApplyForce(f, p1);
                    }
                    if (body2.IsAwake()) {
                        body2.ApplyForce(f.SelfMul(-1), p2);
                    }
                }
            }
        }
        else {
            for (var i = this.m_bodyList; i; i = i.nextBody) {
                var body1 = i.body;
                var p1 = body1.GetWorldCenter();
                var mass1 = body1.GetMass();
                for (var j = this.m_bodyList; j && j !== i; j = j.nextBody) {
                    var body2 = j.body;
                    var p2 = body2.GetWorldCenter();
                    var mass2 = body2.GetMass();
                    var dx = p2.x - p1.x;
                    var dy = p2.y - p1.y;
                    var r2 = dx * dx + dy * dy;
                    if (r2 < b2_epsilon) {
                        continue;
                    }
                    var f = b2GravityController.Step_s_f.Set(dx, dy);
                    f.SelfMul(this.G / r2 * mass1 * mass2);
                    if (body1.IsAwake()) {
                        body1.ApplyForce(f, p1);
                    }
                    if (body2.IsAwake()) {
                        body2.ApplyForce(f.SelfMul(-1), p2);
                    }
                }
            }
        }
    };
    b2GravityController.prototype.Draw = function (draw) { };
    b2GravityController.Step_s_f = new b2Vec2();
    return b2GravityController;
}(b2Controller));
//# sourceMappingURL=b2_gravity_controller.js.map