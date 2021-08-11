var b2DistanceProxy = (function () {
    function b2DistanceProxy() {
        this.m_buffer = b2Vec2.MakeArray(2);
        this.m_vertices = this.m_buffer;
        this.m_count = 0;
        this.m_radius = 0;
    }
    b2DistanceProxy.prototype.Copy = function (other) {
        if (other.m_vertices === other.m_buffer) {
            this.m_vertices = this.m_buffer;
            this.m_buffer[0].Copy(other.m_buffer[0]);
            this.m_buffer[1].Copy(other.m_buffer[1]);
        }
        else {
            this.m_vertices = other.m_vertices;
        }
        this.m_count = other.m_count;
        this.m_radius = other.m_radius;
        return this;
    };
    b2DistanceProxy.prototype.Reset = function () {
        this.m_vertices = this.m_buffer;
        this.m_count = 0;
        this.m_radius = 0;
        return this;
    };
    b2DistanceProxy.prototype.SetShape = function (shape, index) {
        shape.SetupDistanceProxy(this, index);
    };
    b2DistanceProxy.prototype.SetVerticesRadius = function (vertices, count, radius) {
        this.m_vertices = vertices;
        this.m_count = count;
        this.m_radius = radius;
    };
    b2DistanceProxy.prototype.GetSupport = function (d) {
        var bestIndex = 0;
        var bestValue = b2Vec2.DotVV(this.m_vertices[0], d);
        for (var i = 1; i < this.m_count; ++i) {
            var value = b2Vec2.DotVV(this.m_vertices[i], d);
            if (value > bestValue) {
                bestIndex = i;
                bestValue = value;
            }
        }
        return bestIndex;
    };
    b2DistanceProxy.prototype.GetSupportVertex = function (d) {
        var bestIndex = 0;
        var bestValue = b2Vec2.DotVV(this.m_vertices[0], d);
        for (var i = 1; i < this.m_count; ++i) {
            var value = b2Vec2.DotVV(this.m_vertices[i], d);
            if (value > bestValue) {
                bestIndex = i;
                bestValue = value;
            }
        }
        return this.m_vertices[bestIndex];
    };
    b2DistanceProxy.prototype.GetVertexCount = function () {
        return this.m_count;
    };
    b2DistanceProxy.prototype.GetVertex = function (index) {
        return this.m_vertices[index];
    };
    return b2DistanceProxy;
}());
var b2SimplexCache = (function () {
    function b2SimplexCache() {
        this.metric = 0;
        this.count = 0;
        this.indexA = [0, 0, 0];
        this.indexB = [0, 0, 0];
    }
    b2SimplexCache.prototype.Reset = function () {
        this.metric = 0;
        this.count = 0;
        return this;
    };
    return b2SimplexCache;
}());
var b2DistanceInput = (function () {
    function b2DistanceInput() {
        this.proxyA = new b2DistanceProxy();
        this.proxyB = new b2DistanceProxy();
        this.transformA = new b2Transform();
        this.transformB = new b2Transform();
        this.useRadii = false;
    }
    b2DistanceInput.prototype.Reset = function () {
        this.proxyA.Reset();
        this.proxyB.Reset();
        this.transformA.SetIdentity();
        this.transformB.SetIdentity();
        this.useRadii = false;
        return this;
    };
    return b2DistanceInput;
}());
var b2DistanceOutput = (function () {
    function b2DistanceOutput() {
        this.pointA = new b2Vec2();
        this.pointB = new b2Vec2();
        this.distance = 0;
        this.iterations = 0;
    }
    b2DistanceOutput.prototype.Reset = function () {
        this.pointA.SetZero();
        this.pointB.SetZero();
        this.distance = 0;
        this.iterations = 0;
        return this;
    };
    return b2DistanceOutput;
}());
var b2ShapeCastInput = (function () {
    function b2ShapeCastInput() {
        this.proxyA = new b2DistanceProxy();
        this.proxyB = new b2DistanceProxy();
        this.transformA = new b2Transform();
        this.transformB = new b2Transform();
        this.translationB = new b2Vec2();
    }
    return b2ShapeCastInput;
}());
var b2ShapeCastOutput = (function () {
    function b2ShapeCastOutput() {
        this.point = new b2Vec2();
        this.normal = new b2Vec2();
        this.lambda = 0.0;
        this.iterations = 0;
    }
    return b2ShapeCastOutput;
}());
var b2_gjkCalls = 0;
var b2_gjkIters = 0;
var b2_gjkMaxIters = 0;
function b2_gjk_reset() {
    b2_gjkCalls = 0;
    b2_gjkIters = 0;
    b2_gjkMaxIters = 0;
}
var b2SimplexVertex = (function () {
    function b2SimplexVertex() {
        this.wA = new b2Vec2();
        this.wB = new b2Vec2();
        this.w = new b2Vec2();
        this.a = 0;
        this.indexA = 0;
        this.indexB = 0;
    }
    b2SimplexVertex.prototype.Copy = function (other) {
        this.wA.Copy(other.wA);
        this.wB.Copy(other.wB);
        this.w.Copy(other.w);
        this.a = other.a;
        this.indexA = other.indexA;
        this.indexB = other.indexB;
        return this;
    };
    return b2SimplexVertex;
}());
var b2Simplex = (function () {
    function b2Simplex() {
        this.m_v1 = new b2SimplexVertex();
        this.m_v2 = new b2SimplexVertex();
        this.m_v3 = new b2SimplexVertex();
        this.m_vertices = [];
        this.m_count = 0;
        this.m_vertices[0] = this.m_v1;
        this.m_vertices[1] = this.m_v2;
        this.m_vertices[2] = this.m_v3;
    }
    b2Simplex.prototype.ReadCache = function (cache, proxyA, transformA, proxyB, transformB) {
        this.m_count = cache.count;
        var vertices = this.m_vertices;
        for (var i = 0; i < this.m_count; ++i) {
            var v = vertices[i];
            v.indexA = cache.indexA[i];
            v.indexB = cache.indexB[i];
            var wALocal = proxyA.GetVertex(v.indexA);
            var wBLocal = proxyB.GetVertex(v.indexB);
            b2Transform.MulXV(transformA, wALocal, v.wA);
            b2Transform.MulXV(transformB, wBLocal, v.wB);
            b2Vec2.SubVV(v.wB, v.wA, v.w);
            v.a = 0;
        }
        if (this.m_count > 1) {
            var metric1 = cache.metric;
            var metric2 = this.GetMetric();
            if (metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < b2_epsilon) {
                this.m_count = 0;
            }
        }
        if (this.m_count === 0) {
            var v = vertices[0];
            v.indexA = 0;
            v.indexB = 0;
            var wALocal = proxyA.GetVertex(0);
            var wBLocal = proxyB.GetVertex(0);
            b2Transform.MulXV(transformA, wALocal, v.wA);
            b2Transform.MulXV(transformB, wBLocal, v.wB);
            b2Vec2.SubVV(v.wB, v.wA, v.w);
            v.a = 1;
            this.m_count = 1;
        }
    };
    b2Simplex.prototype.WriteCache = function (cache) {
        cache.metric = this.GetMetric();
        cache.count = this.m_count;
        var vertices = this.m_vertices;
        for (var i = 0; i < this.m_count; ++i) {
            cache.indexA[i] = vertices[i].indexA;
            cache.indexB[i] = vertices[i].indexB;
        }
    };
    b2Simplex.prototype.GetSearchDirection = function (out) {
        switch (this.m_count) {
            case 1:
                return b2Vec2.NegV(this.m_v1.w, out);
            case 2: {
                var e12 = b2Vec2.SubVV(this.m_v2.w, this.m_v1.w, out);
                var sgn = b2Vec2.CrossVV(e12, b2Vec2.NegV(this.m_v1.w, b2Vec2.s_t0));
                if (sgn > 0) {
                    return b2Vec2.CrossOneV(e12, out);
                }
                else {
                    return b2Vec2.CrossVOne(e12, out);
                }
            }
            default:
                return out.SetZero();
        }
    };
    b2Simplex.prototype.GetClosestPoint = function (out) {
        switch (this.m_count) {
            case 0:
                return out.SetZero();
            case 1:
                return out.Copy(this.m_v1.w);
            case 2:
                return out.Set(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
            case 3:
                return out.SetZero();
            default:
                return out.SetZero();
        }
    };
    b2Simplex.prototype.GetWitnessPoints = function (pA, pB) {
        switch (this.m_count) {
            case 0:
                break;
            case 1:
                pA.Copy(this.m_v1.wA);
                pB.Copy(this.m_v1.wB);
                break;
            case 2:
                pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
                pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
                pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
                pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
                break;
            case 3:
                pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
                pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
                break;
            default:
                break;
        }
    };
    b2Simplex.prototype.GetMetric = function () {
        switch (this.m_count) {
            case 0:
                return 0;
            case 1:
                return 0;
            case 2:
                return b2Vec2.DistanceVV(this.m_v1.w, this.m_v2.w);
            case 3:
                return b2Vec2.CrossVV(b2Vec2.SubVV(this.m_v2.w, this.m_v1.w, b2Vec2.s_t0), b2Vec2.SubVV(this.m_v3.w, this.m_v1.w, b2Vec2.s_t1));
            default:
                return 0;
        }
    };
    b2Simplex.prototype.Solve2 = function () {
        var w1 = this.m_v1.w;
        var w2 = this.m_v2.w;
        var e12 = b2Vec2.SubVV(w2, w1, b2Simplex.s_e12);
        var d12_2 = (-b2Vec2.DotVV(w1, e12));
        if (d12_2 <= 0) {
            this.m_v1.a = 1;
            this.m_count = 1;
            return;
        }
        var d12_1 = b2Vec2.DotVV(w2, e12);
        if (d12_1 <= 0) {
            this.m_v2.a = 1;
            this.m_count = 1;
            this.m_v1.Copy(this.m_v2);
            return;
        }
        var inv_d12 = 1 / (d12_1 + d12_2);
        this.m_v1.a = d12_1 * inv_d12;
        this.m_v2.a = d12_2 * inv_d12;
        this.m_count = 2;
    };
    b2Simplex.prototype.Solve3 = function () {
        var w1 = this.m_v1.w;
        var w2 = this.m_v2.w;
        var w3 = this.m_v3.w;
        var e12 = b2Vec2.SubVV(w2, w1, b2Simplex.s_e12);
        var w1e12 = b2Vec2.DotVV(w1, e12);
        var w2e12 = b2Vec2.DotVV(w2, e12);
        var d12_1 = w2e12;
        var d12_2 = (-w1e12);
        var e13 = b2Vec2.SubVV(w3, w1, b2Simplex.s_e13);
        var w1e13 = b2Vec2.DotVV(w1, e13);
        var w3e13 = b2Vec2.DotVV(w3, e13);
        var d13_1 = w3e13;
        var d13_2 = (-w1e13);
        var e23 = b2Vec2.SubVV(w3, w2, b2Simplex.s_e23);
        var w2e23 = b2Vec2.DotVV(w2, e23);
        var w3e23 = b2Vec2.DotVV(w3, e23);
        var d23_1 = w3e23;
        var d23_2 = (-w2e23);
        var n123 = b2Vec2.CrossVV(e12, e13);
        var d123_1 = n123 * b2Vec2.CrossVV(w2, w3);
        var d123_2 = n123 * b2Vec2.CrossVV(w3, w1);
        var d123_3 = n123 * b2Vec2.CrossVV(w1, w2);
        if (d12_2 <= 0 && d13_2 <= 0) {
            this.m_v1.a = 1;
            this.m_count = 1;
            return;
        }
        if (d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
            var inv_d12 = 1 / (d12_1 + d12_2);
            this.m_v1.a = d12_1 * inv_d12;
            this.m_v2.a = d12_2 * inv_d12;
            this.m_count = 2;
            return;
        }
        if (d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
            var inv_d13 = 1 / (d13_1 + d13_2);
            this.m_v1.a = d13_1 * inv_d13;
            this.m_v3.a = d13_2 * inv_d13;
            this.m_count = 2;
            this.m_v2.Copy(this.m_v3);
            return;
        }
        if (d12_1 <= 0 && d23_2 <= 0) {
            this.m_v2.a = 1;
            this.m_count = 1;
            this.m_v1.Copy(this.m_v2);
            return;
        }
        if (d13_1 <= 0 && d23_1 <= 0) {
            this.m_v3.a = 1;
            this.m_count = 1;
            this.m_v1.Copy(this.m_v3);
            return;
        }
        if (d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
            var inv_d23 = 1 / (d23_1 + d23_2);
            this.m_v2.a = d23_1 * inv_d23;
            this.m_v3.a = d23_2 * inv_d23;
            this.m_count = 2;
            this.m_v1.Copy(this.m_v3);
            return;
        }
        var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
        this.m_v1.a = d123_1 * inv_d123;
        this.m_v2.a = d123_2 * inv_d123;
        this.m_v3.a = d123_3 * inv_d123;
        this.m_count = 3;
    };
    b2Simplex.s_e12 = new b2Vec2();
    b2Simplex.s_e13 = new b2Vec2();
    b2Simplex.s_e23 = new b2Vec2();
    return b2Simplex;
}());
var b2Distance_s_simplex = new b2Simplex();
var b2Distance_s_saveA = [0, 0, 0];
var b2Distance_s_saveB = [0, 0, 0];
var b2Distance_s_p = new b2Vec2();
var b2Distance_s_d = new b2Vec2();
var b2Distance_s_normal = new b2Vec2();
var b2Distance_s_supportA = new b2Vec2();
var b2Distance_s_supportB = new b2Vec2();
function b2Distance(output, cache, input) {
    ++b2_gjkCalls;
    var proxyA = input.proxyA;
    var proxyB = input.proxyB;
    var transformA = input.transformA;
    var transformB = input.transformB;
    var simplex = b2Distance_s_simplex;
    simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);
    var vertices = simplex.m_vertices;
    var k_maxIters = 20;
    var saveA = b2Distance_s_saveA;
    var saveB = b2Distance_s_saveB;
    var saveCount = 0;
    var iter = 0;
    while (iter < k_maxIters) {
        saveCount = simplex.m_count;
        for (var i = 0; i < saveCount; ++i) {
            saveA[i] = vertices[i].indexA;
            saveB[i] = vertices[i].indexB;
        }
        switch (simplex.m_count) {
            case 1:
                break;
            case 2:
                simplex.Solve2();
                break;
            case 3:
                simplex.Solve3();
                break;
            default:
                break;
        }
        if (simplex.m_count === 3) {
            break;
        }
        var d = simplex.GetSearchDirection(b2Distance_s_d);
        if (d.LengthSquared() < b2_epsilon_sq) {
            break;
        }
        var vertex = vertices[simplex.m_count];
        vertex.indexA = proxyA.GetSupport(b2Rot.MulTRV(transformA.q, b2Vec2.NegV(d, b2Vec2.s_t0), b2Distance_s_supportA));
        b2Transform.MulXV(transformA, proxyA.GetVertex(vertex.indexA), vertex.wA);
        vertex.indexB = proxyB.GetSupport(b2Rot.MulTRV(transformB.q, d, b2Distance_s_supportB));
        b2Transform.MulXV(transformB, proxyB.GetVertex(vertex.indexB), vertex.wB);
        b2Vec2.SubVV(vertex.wB, vertex.wA, vertex.w);
        ++iter;
        ++b2_gjkIters;
        var duplicate = false;
        for (var i = 0; i < saveCount; ++i) {
            if (vertex.indexA === saveA[i] && vertex.indexB === saveB[i]) {
                duplicate = true;
                break;
            }
        }
        if (duplicate) {
            break;
        }
        ++simplex.m_count;
    }
    b2_gjkMaxIters = b2Max(b2_gjkMaxIters, iter);
    simplex.GetWitnessPoints(output.pointA, output.pointB);
    output.distance = b2Vec2.DistanceVV(output.pointA, output.pointB);
    output.iterations = iter;
    simplex.WriteCache(cache);
    if (input.useRadii) {
        var rA = proxyA.m_radius;
        var rB = proxyB.m_radius;
        if (output.distance > (rA + rB) && output.distance > b2_epsilon) {
            output.distance -= rA + rB;
            var normal = b2Vec2.SubVV(output.pointB, output.pointA, b2Distance_s_normal);
            normal.Normalize();
            output.pointA.SelfMulAdd(rA, normal);
            output.pointB.SelfMulSub(rB, normal);
        }
        else {
            var p = b2Vec2.MidVV(output.pointA, output.pointB, b2Distance_s_p);
            output.pointA.Copy(p);
            output.pointB.Copy(p);
            output.distance = 0;
        }
    }
}
var b2ShapeCast_s_n = new b2Vec2();
var b2ShapeCast_s_simplex = new b2Simplex();
var b2ShapeCast_s_wA = new b2Vec2();
var b2ShapeCast_s_wB = new b2Vec2();
var b2ShapeCast_s_v = new b2Vec2();
var b2ShapeCast_s_p = new b2Vec2();
var b2ShapeCast_s_pointA = new b2Vec2();
var b2ShapeCast_s_pointB = new b2Vec2();
function b2ShapeCast(output, input) {
    output.iterations = 0;
    output.lambda = 1.0;
    output.normal.SetZero();
    output.point.SetZero();
    var proxyA = input.proxyA;
    var proxyB = input.proxyB;
    var radiusA = b2Max(proxyA.m_radius, b2_polygonRadius);
    var radiusB = b2Max(proxyB.m_radius, b2_polygonRadius);
    var radius = radiusA + radiusB;
    var xfA = input.transformA;
    var xfB = input.transformB;
    var r = input.translationB;
    var n = b2ShapeCast_s_n.Set(0.0, 0.0);
    var lambda = 0.0;
    var simplex = b2ShapeCast_s_simplex;
    simplex.m_count = 0;
    var vertices = simplex.m_vertices;
    var indexA = proxyA.GetSupport(b2Rot.MulTRV(xfA.q, b2Vec2.NegV(r, b2Vec2.s_t1), b2Vec2.s_t0));
    var wA = b2Transform.MulXV(xfA, proxyA.GetVertex(indexA), b2ShapeCast_s_wA);
    var indexB = proxyB.GetSupport(b2Rot.MulTRV(xfB.q, r, b2Vec2.s_t0));
    var wB = b2Transform.MulXV(xfB, proxyB.GetVertex(indexB), b2ShapeCast_s_wB);
    var v = b2Vec2.SubVV(wA, wB, b2ShapeCast_s_v);
    var sigma = b2Max(b2_polygonRadius, radius - b2_polygonRadius);
    var tolerance = 0.5 * b2_linearSlop;
    var k_maxIters = 20;
    var iter = 0;
    while (iter < k_maxIters && v.Length() - sigma > tolerance) {
        output.iterations += 1;
        indexA = proxyA.GetSupport(b2Rot.MulTRV(xfA.q, b2Vec2.NegV(v, b2Vec2.s_t1), b2Vec2.s_t0));
        wA = b2Transform.MulXV(xfA, proxyA.GetVertex(indexA), b2ShapeCast_s_wA);
        indexB = proxyB.GetSupport(b2Rot.MulTRV(xfB.q, v, b2Vec2.s_t0));
        wB = b2Transform.MulXV(xfB, proxyB.GetVertex(indexB), b2ShapeCast_s_wB);
        var p = b2Vec2.SubVV(wA, wB, b2ShapeCast_s_p);
        v.Normalize();
        var vp = b2Vec2.DotVV(v, p);
        var vr = b2Vec2.DotVV(v, r);
        if (vp - sigma > lambda * vr) {
            if (vr <= 0.0) {
                return false;
            }
            lambda = (vp - sigma) / vr;
            if (lambda > 1.0) {
                return false;
            }
            n.Copy(v).SelfNeg();
            simplex.m_count = 0;
        }
        var vertex = vertices[simplex.m_count];
        vertex.indexA = indexB;
        vertex.wA.Copy(wB).SelfMulAdd(lambda, r);
        vertex.indexB = indexA;
        vertex.wB.Copy(wA);
        vertex.w.Copy(vertex.wB).SelfSub(vertex.wA);
        vertex.a = 1.0;
        simplex.m_count += 1;
        switch (simplex.m_count) {
            case 1:
                break;
            case 2:
                simplex.Solve2();
                break;
            case 3:
                simplex.Solve3();
                break;
            default:
        }
        if (simplex.m_count === 3) {
            return false;
        }
        simplex.GetClosestPoint(v);
        ++iter;
    }
    if (iter === 0) {
        return false;
    }
    var pointA = b2ShapeCast_s_pointA;
    var pointB = b2ShapeCast_s_pointB;
    simplex.GetWitnessPoints(pointA, pointB);
    if (v.LengthSquared() > 0.0) {
        n.Copy(v).SelfNeg();
        n.Normalize();
    }
    output.normal.Copy(n);
    output.lambda = lambda;
    output.iterations = iter;
    return true;
}
//# sourceMappingURL=b2_distance.js.map