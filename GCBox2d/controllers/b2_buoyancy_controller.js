




var b2BuoyancyController = (function (_super) {
    __extends(b2BuoyancyController, _super);
    function b2BuoyancyController() {
        _super.apply(this, arguments);
        this.normal = new b2Vec2(0, 1);
        this.offset = 0;
        this.density = 0;
        this.velocity = new b2Vec2(0, 0);
        this.linearDrag = 0;
        this.angularDrag = 0;
        this.useDensity = false;
        this.useWorldGravity = true;
        this.gravity = new b2Vec2(0, 0);
    }
    b2BuoyancyController.prototype.Step = function (step) {
        if (!this.m_bodyList) {
            return;
        }
        if (this.useWorldGravity) {
            this.gravity.Copy(this.m_bodyList.body.GetWorld().GetGravity());
        }
        for (var i = this.m_bodyList; i; i = i.nextBody) {
            var body = i.body;
            if (!body.IsAwake()) {
                continue;
            }
            var areac = new b2Vec2();
            var massc = new b2Vec2();
            var area = 0;
            var mass = 0;
            for (var fixture = body.GetFixtureList(); fixture; fixture = fixture.m_next) {
                var sc = new b2Vec2();
                var sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
                area += sarea;
                areac.x += sarea * sc.x;
                areac.y += sarea * sc.y;
                var shapeDensity = 0;
                if (this.useDensity) {
                    shapeDensity = fixture.GetDensity();
                }
                else {
                    shapeDensity = 1;
                }
                mass += sarea * shapeDensity;
                massc.x += sarea * sc.x * shapeDensity;
                massc.y += sarea * sc.y * shapeDensity;
            }
            areac.x /= area;
            areac.y /= area;
            massc.x /= mass;
            massc.y /= mass;
            if (area < b2_epsilon) {
                continue;
            }
            var buoyancyForce = this.gravity.Clone().SelfNeg();
            buoyancyForce.SelfMul(this.density * area);
            body.ApplyForce(buoyancyForce, massc);
            var dragForce = body.GetLinearVelocityFromWorldPoint(areac, new b2Vec2());
            dragForce.SelfSub(this.velocity);
            dragForce.SelfMul((-this.linearDrag * area));
            body.ApplyForce(dragForce, areac);
            body.ApplyTorque((-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag));
        }
    };
    b2BuoyancyController.prototype.Draw = function (debugDraw) {
        var r = 100;
        var p1 = new b2Vec2();
        var p2 = new b2Vec2();
        p1.x = this.normal.x * this.offset + this.normal.y * r;
        p1.y = this.normal.y * this.offset - this.normal.x * r;
        p2.x = this.normal.x * this.offset - this.normal.y * r;
        p2.y = this.normal.y * this.offset + this.normal.x * r;
        var color = new b2Color(0, 0, 0.8);
        debugDraw.DrawSegment(p1, p2, color);
    };
    return b2BuoyancyController;
}(b2Controller));
//# sourceMappingURL=b2_buoyancy_controller.js.map