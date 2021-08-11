




var b2CircleShape = (function (_super) {
    __extends(b2CircleShape, _super);
    function b2CircleShape(radius) {
        if (radius === void 0) { radius = 0; }
        _super.call(this, b2ShapeType.e_circleShape, radius);
        this.m_p = new b2Vec2();
    }
    b2CircleShape.prototype.Set = function (position, radius) {
        if (radius === void 0) { radius = this.m_radius; }
        this.m_p.Copy(position);
        this.m_radius = radius;
        return this;
    };
    b2CircleShape.prototype.Clone = function () {
        return new b2CircleShape().Copy(this);
    };
    b2CircleShape.prototype.Copy = function (other) {
        _super.prototype.Copy.call(this, other);
        this.m_p.Copy(other.m_p);
        return this;
    };
    b2CircleShape.prototype.GetChildCount = function () {
        return 1;
    };
    b2CircleShape.prototype.TestPoint = function (transform, p) {
        var center = b2Transform.MulXV(transform, this.m_p, b2CircleShape.TestPoint_s_center);
        var d = b2Vec2.SubVV(p, center, b2CircleShape.TestPoint_s_d);
        return b2Vec2.DotVV(d, d) <= b2Sq(this.m_radius);
    };
    b2CircleShape.prototype.ComputeDistance = function (xf, p, normal, childIndex) {
        var center = b2Transform.MulXV(xf, this.m_p, b2CircleShape.ComputeDistance_s_center);
        b2Vec2.SubVV(p, center, normal);
        return normal.Normalize() - this.m_radius;
    };
    b2CircleShape.prototype.RayCast = function (output, input, transform, childIndex) {
        var position = b2Transform.MulXV(transform, this.m_p, b2CircleShape.RayCast_s_position);
        var s = b2Vec2.SubVV(input.p1, position, b2CircleShape.RayCast_s_s);
        var b = b2Vec2.DotVV(s, s) - b2Sq(this.m_radius);
        var r = b2Vec2.SubVV(input.p2, input.p1, b2CircleShape.RayCast_s_r);
        var c = b2Vec2.DotVV(s, r);
        var rr = b2Vec2.DotVV(r, r);
        var sigma = c * c - rr * b;
        if (sigma < 0 || rr < b2_epsilon) {
            return false;
        }
        var a = (-(c + b2Sqrt(sigma)));
        if (0 <= a && a <= input.maxFraction * rr) {
            a /= rr;
            output.fraction = a;
            b2Vec2.AddVMulSV(s, a, r, output.normal).SelfNormalize();
            return true;
        }
        return false;
    };
    b2CircleShape.prototype.ComputeAABB = function (aabb, transform, childIndex) {
        var p = b2Transform.MulXV(transform, this.m_p, b2CircleShape.ComputeAABB_s_p);
        aabb.lowerBound.Set(p.x - this.m_radius, p.y - this.m_radius);
        aabb.upperBound.Set(p.x + this.m_radius, p.y + this.m_radius);
    };
    b2CircleShape.prototype.ComputeMass = function (massData, density) {
        var radius_sq = b2Sq(this.m_radius);
        massData.mass = density * b2_pi * radius_sq;
        massData.center.Copy(this.m_p);
        massData.I = massData.mass * (0.5 * radius_sq + b2Vec2.DotVV(this.m_p, this.m_p));
    };
    b2CircleShape.prototype.SetupDistanceProxy = function (proxy, index) {
        proxy.m_vertices = proxy.m_buffer;
        proxy.m_vertices[0].Copy(this.m_p);
        proxy.m_count = 1;
        proxy.m_radius = this.m_radius;
    };
    b2CircleShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
        var p = b2Transform.MulXV(xf, this.m_p, new b2Vec2());
        var l = (-(b2Vec2.DotVV(normal, p) - offset));
        if (l < (-this.m_radius) + b2_epsilon) {
            return 0;
        }
        if (l > this.m_radius) {
            c.Copy(p);
            return b2_pi * this.m_radius * this.m_radius;
        }
        var r2 = this.m_radius * this.m_radius;
        var l2 = l * l;
        var area = r2 * (b2Asin(l / this.m_radius) + b2_pi / 2) + l * b2Sqrt(r2 - l2);
        var com = (-2 / 3 * b2Pow(r2 - l2, 1.5) / area);
        c.x = p.x + normal.x * com;
        c.y = p.y + normal.y * com;
        return area;
    };
    b2CircleShape.prototype.Dump = function (log) {
        log("    const shape: b2CircleShape = new b2CircleShape();\n");
        log("    shape.m_radius = %.15f;\n", this.m_radius);
        log("    shape.m_p.Set(%.15f, %.15f);\n", this.m_p.x, this.m_p.y);
    };
    b2CircleShape.TestPoint_s_center = new b2Vec2();
    b2CircleShape.TestPoint_s_d = new b2Vec2();
    b2CircleShape.ComputeDistance_s_center = new b2Vec2();
    b2CircleShape.RayCast_s_position = new b2Vec2();
    b2CircleShape.RayCast_s_s = new b2Vec2();
    b2CircleShape.RayCast_s_r = new b2Vec2();
    b2CircleShape.ComputeAABB_s_p = new b2Vec2();
    return b2CircleShape;
}(b2Shape));
//# sourceMappingURL=b2_circle_shape.js.map