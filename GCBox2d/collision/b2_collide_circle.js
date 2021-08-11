var b2Vec2 = (function () {
    function b2Vec2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    b2Vec2.prototype.Clone = function () {
        return new b2Vec2(this.x, this.y);
    };
    b2Vec2.prototype.SetZero = function () {
        this.x = 0;
        this.y = 0;
        return this;
    };
    b2Vec2.prototype.Set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    b2Vec2.prototype.Copy = function (other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    };
    b2Vec2.prototype.SelfAdd = function (v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    b2Vec2.prototype.SelfAddXY = function (x, y) {
        this.x += x;
        this.y += y;
        return this;
    };
    b2Vec2.prototype.SelfSub = function (v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };
    b2Vec2.prototype.SelfSubXY = function (x, y) {
        this.x -= x;
        this.y -= y;
        return this;
    };
    b2Vec2.prototype.SelfMul = function (s) {
        this.x *= s;
        this.y *= s;
        return this;
    };
    b2Vec2.prototype.SelfMulAdd = function (s, v) {
        this.x += s * v.x;
        this.y += s * v.y;
        return this;
    };
    b2Vec2.prototype.SelfMulSub = function (s, v) {
        this.x -= s * v.x;
        this.y -= s * v.y;
        return this;
    };
    b2Vec2.prototype.Dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    b2Vec2.prototype.Cross = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    b2Vec2.prototype.Length = function () {
        var x = this.x, y = this.y;
        return Math.sqrt(x * x + y * y);
    };
    b2Vec2.prototype.LengthSquared = function () {
        var x = this.x, y = this.y;
        return (x * x + y * y);
    };
    b2Vec2.prototype.Normalize = function () {
        var length = this.Length();
        if (length >= b2_epsilon) {
            var inv_length = 1 / length;
            this.x *= inv_length;
            this.y *= inv_length;
        }
        return length;
    };
    b2Vec2.prototype.SelfNormalize = function () {
        var length = this.Length();
        if (length >= b2_epsilon) {
            var inv_length = 1 / length;
            this.x *= inv_length;
            this.y *= inv_length;
        }
        return this;
    };
    b2Vec2.prototype.SelfRotate = function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        var x = this.x;
        this.x = c * x - s * this.y;
        this.y = s * x + c * this.y;
        return this;
    };
    b2Vec2.prototype.SelfRotateCosSin = function (c, s) {
        var x = this.x;
        this.x = c * x - s * this.y;
        this.y = s * x + c * this.y;
        return this;
    };
    b2Vec2.prototype.IsValid = function () {
        return isFinite(this.x) && isFinite(this.y);
    };
    b2Vec2.prototype.SelfCrossVS = function (s) {
        var x = this.x;
        this.x = s * this.y;
        this.y = -s * x;
        return this;
    };
    b2Vec2.prototype.SelfCrossSV = function (s) {
        var x = this.x;
        this.x = -s * this.y;
        this.y = s * x;
        return this;
    };
    b2Vec2.prototype.SelfMinV = function (v) {
        this.x = b2Min(this.x, v.x);
        this.y = b2Min(this.y, v.y);
        return this;
    };
    b2Vec2.prototype.SelfMaxV = function (v) {
        this.x = b2Max(this.x, v.x);
        this.y = b2Max(this.y, v.y);
        return this;
    };
    b2Vec2.prototype.SelfAbs = function () {
        this.x = b2Abs(this.x);
        this.y = b2Abs(this.y);
        return this;
    };
    b2Vec2.prototype.SelfNeg = function () {
        this.x = (-this.x);
        this.y = (-this.y);
        return this;
    };
    b2Vec2.prototype.SelfSkew = function () {
        var x = this.x;
        this.x = -this.y;
        this.y = x;
        return this;
    };
    b2Vec2.MakeArray = function (length) {
        return b2MakeArray(length, function (i) { return new b2Vec2(); });
    };
    b2Vec2.AbsV = function (v, out) {
        out.x = b2Abs(v.x);
        out.y = b2Abs(v.y);
        return out;
    };
    b2Vec2.MinV = function (a, b, out) {
        out.x = b2Min(a.x, b.x);
        out.y = b2Min(a.y, b.y);
        return out;
    };
    b2Vec2.MaxV = function (a, b, out) {
        out.x = b2Max(a.x, b.x);
        out.y = b2Max(a.y, b.y);
        return out;
    };
    b2Vec2.ClampV = function (v, lo, hi, out) {
        out.x = b2Clamp(v.x, lo.x, hi.x);
        out.y = b2Clamp(v.y, lo.y, hi.y);
        return out;
    };
    b2Vec2.RotateV = function (v, radians, out) {
        var v_x = v.x, v_y = v.y;
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        out.x = c * v_x - s * v_y;
        out.y = s * v_x + c * v_y;
        return out;
    };
    b2Vec2.DotVV = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };
    b2Vec2.CrossVV = function (a, b) {
        return a.x * b.y - a.y * b.x;
    };
    b2Vec2.CrossVS = function (v, s, out) {
        var v_x = v.x;
        out.x = s * v.y;
        out.y = -s * v_x;
        return out;
    };
    b2Vec2.CrossVOne = function (v, out) {
        var v_x = v.x;
        out.x = v.y;
        out.y = -v_x;
        return out;
    };
    b2Vec2.CrossSV = function (s, v, out) {
        var v_x = v.x;
        out.x = -s * v.y;
        out.y = s * v_x;
        return out;
    };
    b2Vec2.CrossOneV = function (v, out) {
        var v_x = v.x;
        out.x = -v.y;
        out.y = v_x;
        return out;
    };
    b2Vec2.AddVV = function (a, b, out) { out.x = a.x + b.x; out.y = a.y + b.y; return out; };
    b2Vec2.SubVV = function (a, b, out) { out.x = a.x - b.x; out.y = a.y - b.y; return out; };
    b2Vec2.MulSV = function (s, v, out) { out.x = v.x * s; out.y = v.y * s; return out; };
    b2Vec2.MulVS = function (v, s, out) { out.x = v.x * s; out.y = v.y * s; return out; };
    b2Vec2.AddVMulSV = function (a, s, b, out) { out.x = a.x + (s * b.x); out.y = a.y + (s * b.y); return out; };
    b2Vec2.SubVMulSV = function (a, s, b, out) { out.x = a.x - (s * b.x); out.y = a.y - (s * b.y); return out; };
    b2Vec2.AddVCrossSV = function (a, s, v, out) {
        var v_x = v.x;
        out.x = a.x - (s * v.y);
        out.y = a.y + (s * v_x);
        return out;
    };
    b2Vec2.MidVV = function (a, b, out) { out.x = (a.x + b.x) * 0.5; out.y = (a.y + b.y) * 0.5; return out; };
    b2Vec2.ExtVV = function (a, b, out) { out.x = (b.x - a.x) * 0.5; out.y = (b.y - a.y) * 0.5; return out; };
    b2Vec2.IsEqualToV = function (a, b) {
        return a.x === b.x && a.y === b.y;
    };
    b2Vec2.DistanceVV = function (a, b) {
        var c_x = a.x - b.x;
        var c_y = a.y - b.y;
        return Math.sqrt(c_x * c_x + c_y * c_y);
    };
    b2Vec2.DistanceSquaredVV = function (a, b) {
        var c_x = a.x - b.x;
        var c_y = a.y - b.y;
        return (c_x * c_x + c_y * c_y);
    };
    b2Vec2.NegV = function (v, out) { out.x = -v.x; out.y = -v.y; return out; };
    b2Vec2.ZERO = new b2Vec2(0, 0);
    b2Vec2.UNITX = new b2Vec2(1, 0);
    b2Vec2.UNITY = new b2Vec2(0, 1);
    b2Vec2.s_t0 = new b2Vec2();
    b2Vec2.s_t1 = new b2Vec2();
    b2Vec2.s_t2 = new b2Vec2();
    b2Vec2.s_t3 = new b2Vec2();
    return b2Vec2;
}());
var b2Vec2_zero = new b2Vec2(0, 0);
var b2CollideCircles_s_pA = new b2Vec2();
var b2CollideCircles_s_pB = new b2Vec2();
function b2CollideCircles(manifold, circleA, xfA, circleB, xfB) {
    manifold.pointCount = 0;
    var pA = b2Transform.MulXV(xfA, circleA.m_p, b2CollideCircles_s_pA);
    var pB = b2Transform.MulXV(xfB, circleB.m_p, b2CollideCircles_s_pB);
    var distSqr = b2Vec2.DistanceSquaredVV(pA, pB);
    var radius = circleA.m_radius + circleB.m_radius;
    if (distSqr > radius * radius) {
        return;
    }
    manifold.type = b2ManifoldType.e_circles;
    manifold.localPoint.Copy(circleA.m_p);
    manifold.localNormal.SetZero();
    manifold.pointCount = 1;
    manifold.points[0].localPoint.Copy(circleB.m_p);
    manifold.points[0].id.key = 0;
}
var b2CollidePolygonAndCircle_s_c = new b2Vec2();
var b2CollidePolygonAndCircle_s_cLocal = new b2Vec2();
var b2CollidePolygonAndCircle_s_faceCenter = new b2Vec2();
function b2CollidePolygonAndCircle(manifold, polygonA, xfA, circleB, xfB) {
    manifold.pointCount = 0;
    var c = b2Transform.MulXV(xfB, circleB.m_p, b2CollidePolygonAndCircle_s_c);
    var cLocal = b2Transform.MulTXV(xfA, c, b2CollidePolygonAndCircle_s_cLocal);
    var normalIndex = 0;
    var separation = (-b2_maxFloat);
    var radius = polygonA.m_radius + circleB.m_radius;
    var vertexCount = polygonA.m_count;
    var vertices = polygonA.m_vertices;
    var normals = polygonA.m_normals;
    for (var i = 0; i < vertexCount; ++i) {
        var s = b2Vec2.DotVV(normals[i], b2Vec2.SubVV(cLocal, vertices[i], b2Vec2.s_t0));
        if (s > radius) {
            return;
        }
        if (s > separation) {
            separation = s;
            normalIndex = i;
        }
    }
    var vertIndex1 = normalIndex;
    var vertIndex2 = (vertIndex1 + 1) % vertexCount;
    var v1 = vertices[vertIndex1];
    var v2 = vertices[vertIndex2];
    if (separation < b2_epsilon) {
        manifold.pointCount = 1;
        manifold.type = b2ManifoldType.e_faceA;
        manifold.localNormal.Copy(normals[normalIndex]);
        b2Vec2.MidVV(v1, v2, manifold.localPoint);
        manifold.points[0].localPoint.Copy(circleB.m_p);
        manifold.points[0].id.key = 0;
        return;
    }
    var u1 = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, v1, b2Vec2.s_t0), b2Vec2.SubVV(v2, v1, b2Vec2.s_t1));
    var u2 = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, v2, b2Vec2.s_t0), b2Vec2.SubVV(v1, v2, b2Vec2.s_t1));
    if (u1 <= 0) {
        if (b2Vec2.DistanceSquaredVV(cLocal, v1) > radius * radius) {
            return;
        }
        manifold.pointCount = 1;
        manifold.type = b2ManifoldType.e_faceA;
        b2Vec2.SubVV(cLocal, v1, manifold.localNormal).SelfNormalize();
        manifold.localPoint.Copy(v1);
        manifold.points[0].localPoint.Copy(circleB.m_p);
        manifold.points[0].id.key = 0;
    }
    else if (u2 <= 0) {
        if (b2Vec2.DistanceSquaredVV(cLocal, v2) > radius * radius) {
            return;
        }
        manifold.pointCount = 1;
        manifold.type = b2ManifoldType.e_faceA;
        b2Vec2.SubVV(cLocal, v2, manifold.localNormal).SelfNormalize();
        manifold.localPoint.Copy(v2);
        manifold.points[0].localPoint.Copy(circleB.m_p);
        manifold.points[0].id.key = 0;
    }
    else {
        var faceCenter = b2Vec2.MidVV(v1, v2, b2CollidePolygonAndCircle_s_faceCenter);
        var separation_1 = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, faceCenter, b2Vec2.s_t1), normals[vertIndex1]);
        if (separation_1 > radius) {
            return;
        }
        manifold.pointCount = 1;
        manifold.type = b2ManifoldType.e_faceA;
        manifold.localNormal.Copy(normals[vertIndex1]).SelfNormalize();
        manifold.localPoint.Copy(faceCenter);
        manifold.points[0].localPoint.Copy(circleB.m_p);
        manifold.points[0].id.key = 0;
    }
}
//# sourceMappingURL=b2_collide_circle.js.map