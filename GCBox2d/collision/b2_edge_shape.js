




var b2EdgeShape = (function (_super) {
    __extends(b2EdgeShape, _super);
    function b2EdgeShape() {
        _super.call(this, b2ShapeType.e_edgeShape, b2_polygonRadius);
        this.m_vertex1 = new b2Vec2();
        this.m_vertex2 = new b2Vec2();
        this.m_vertex0 = new b2Vec2();
        this.m_vertex3 = new b2Vec2();
        this.m_oneSided = false;
    }
    b2EdgeShape.prototype.SetOneSided = function (v0, v1, v2, v3) {
        this.m_vertex0.Copy(v0);
        this.m_vertex1.Copy(v1);
        this.m_vertex2.Copy(v2);
        this.m_vertex3.Copy(v3);
        this.m_oneSided = true;
        return this;
    };
    b2EdgeShape.prototype.SetTwoSided = function (v1, v2) {
        this.m_vertex1.Copy(v1);
        this.m_vertex2.Copy(v2);
        this.m_oneSided = false;
        return this;
    };
    b2EdgeShape.prototype.Clone = function () {
        return new b2EdgeShape().Copy(this);
    };
    b2EdgeShape.prototype.Copy = function (other) {
        _super.prototype.Copy.call(this, other);
        this.m_vertex1.Copy(other.m_vertex1);
        this.m_vertex2.Copy(other.m_vertex2);
        this.m_vertex0.Copy(other.m_vertex0);
        this.m_vertex3.Copy(other.m_vertex3);
        this.m_oneSided = other.m_oneSided;
        return this;
    };
    b2EdgeShape.prototype.GetChildCount = function () {
        return 1;
    };
    b2EdgeShape.prototype.TestPoint = function (xf, p) {
        return false;
    };
    b2EdgeShape.prototype.ComputeDistance = function (xf, p, normal, childIndex) {
        var v1 = b2Transform.MulXV(xf, this.m_vertex1, b2EdgeShape.ComputeDistance_s_v1);
        var v2 = b2Transform.MulXV(xf, this.m_vertex2, b2EdgeShape.ComputeDistance_s_v2);
        var d = b2Vec2.SubVV(p, v1, b2EdgeShape.ComputeDistance_s_d);
        var s = b2Vec2.SubVV(v2, v1, b2EdgeShape.ComputeDistance_s_s);
        var ds = b2Vec2.DotVV(d, s);
        if (ds > 0) {
            var s2 = b2Vec2.DotVV(s, s);
            if (ds > s2) {
                b2Vec2.SubVV(p, v2, d);
            }
            else {
                d.SelfMulSub(ds / s2, s);
            }
        }
        normal.Copy(d);
        return normal.Normalize();
    };
    b2EdgeShape.prototype.RayCast = function (output, input, xf, childIndex) {
        var p1 = b2Transform.MulTXV(xf, input.p1, b2EdgeShape.RayCast_s_p1);
        var p2 = b2Transform.MulTXV(xf, input.p2, b2EdgeShape.RayCast_s_p2);
        var d = b2Vec2.SubVV(p2, p1, b2EdgeShape.RayCast_s_d);
        var v1 = this.m_vertex1;
        var v2 = this.m_vertex2;
        var e = b2Vec2.SubVV(v2, v1, b2EdgeShape.RayCast_s_e);
        var normal = output.normal.Set(e.y, -e.x).SelfNormalize();
        var numerator = b2Vec2.DotVV(normal, b2Vec2.SubVV(v1, p1, b2Vec2.s_t0));
        if (this.m_oneSided && numerator > 0.0) {
            return false;
        }
        var denominator = b2Vec2.DotVV(normal, d);
        if (denominator === 0) {
            return false;
        }
        var t = numerator / denominator;
        if (t < 0 || input.maxFraction < t) {
            return false;
        }
        var q = b2Vec2.AddVMulSV(p1, t, d, b2EdgeShape.RayCast_s_q);
        var r = b2Vec2.SubVV(v2, v1, b2EdgeShape.RayCast_s_r);
        var rr = b2Vec2.DotVV(r, r);
        if (rr === 0) {
            return false;
        }
        var s = b2Vec2.DotVV(b2Vec2.SubVV(q, v1, b2Vec2.s_t0), r) / rr;
        if (s < 0 || 1 < s) {
            return false;
        }
        output.fraction = t;
        b2Rot.MulRV(xf.q, output.normal, output.normal);
        if (numerator > 0) {
            output.normal.SelfNeg();
        }
        return true;
    };
    b2EdgeShape.prototype.ComputeAABB = function (aabb, xf, childIndex) {
        var v1 = b2Transform.MulXV(xf, this.m_vertex1, b2EdgeShape.ComputeAABB_s_v1);
        var v2 = b2Transform.MulXV(xf, this.m_vertex2, b2EdgeShape.ComputeAABB_s_v2);
        b2Vec2.MinV(v1, v2, aabb.lowerBound);
        b2Vec2.MaxV(v1, v2, aabb.upperBound);
        var r = this.m_radius;
        aabb.lowerBound.SelfSubXY(r, r);
        aabb.upperBound.SelfAddXY(r, r);
    };
    b2EdgeShape.prototype.ComputeMass = function (massData, density) {
        massData.mass = 0;
        b2Vec2.MidVV(this.m_vertex1, this.m_vertex2, massData.center);
        massData.I = 0;
    };
    b2EdgeShape.prototype.SetupDistanceProxy = function (proxy, index) {
        proxy.m_vertices = proxy.m_buffer;
        proxy.m_vertices[0].Copy(this.m_vertex1);
        proxy.m_vertices[1].Copy(this.m_vertex2);
        proxy.m_count = 2;
        proxy.m_radius = this.m_radius;
    };
    b2EdgeShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
        c.SetZero();
        return 0;
    };
    b2EdgeShape.prototype.Dump = function (log) {
        log("    const shape: b2EdgeShape = new b2EdgeShape();\n");
        log("    shape.m_radius = %.15f;\n", this.m_radius);
        log("    shape.m_vertex0.Set(%.15f, %.15f);\n", this.m_vertex0.x, this.m_vertex0.y);
        log("    shape.m_vertex1.Set(%.15f, %.15f);\n", this.m_vertex1.x, this.m_vertex1.y);
        log("    shape.m_vertex2.Set(%.15f, %.15f);\n", this.m_vertex2.x, this.m_vertex2.y);
        log("    shape.m_vertex3.Set(%.15f, %.15f);\n", this.m_vertex3.x, this.m_vertex3.y);
        log("    shape.m_oneSided = %s;\n", this.m_oneSided);
    };
    b2EdgeShape.ComputeDistance_s_v1 = new b2Vec2();
    b2EdgeShape.ComputeDistance_s_v2 = new b2Vec2();
    b2EdgeShape.ComputeDistance_s_d = new b2Vec2();
    b2EdgeShape.ComputeDistance_s_s = new b2Vec2();
    b2EdgeShape.RayCast_s_p1 = new b2Vec2();
    b2EdgeShape.RayCast_s_p2 = new b2Vec2();
    b2EdgeShape.RayCast_s_d = new b2Vec2();
    b2EdgeShape.RayCast_s_e = new b2Vec2();
    b2EdgeShape.RayCast_s_q = new b2Vec2();
    b2EdgeShape.RayCast_s_r = new b2Vec2();
    b2EdgeShape.ComputeAABB_s_v1 = new b2Vec2();
    b2EdgeShape.ComputeAABB_s_v2 = new b2Vec2();
    return b2EdgeShape;
}(b2Shape));
//# sourceMappingURL=b2_edge_shape.js.map