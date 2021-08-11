




var b2PolygonShape = (function (_super) {
    __extends(b2PolygonShape, _super);
    function b2PolygonShape() {
        _super.call(this, b2ShapeType.e_polygonShape, b2_polygonRadius);
        this.m_centroid = new b2Vec2(0, 0);
        this.m_vertices = [];
        this.m_normals = [];
        this.m_count = 0;
    }
    b2PolygonShape.prototype.Clone = function () {
        return new b2PolygonShape().Copy(this);
    };
    b2PolygonShape.prototype.Copy = function (other) {
        _super.prototype.Copy.call(this, other);
        this.m_centroid.Copy(other.m_centroid);
        this.m_count = other.m_count;
        this.m_vertices = b2Vec2.MakeArray(this.m_count);
        this.m_normals = b2Vec2.MakeArray(this.m_count);
        for (var i = 0; i < this.m_count; ++i) {
            this.m_vertices[i].Copy(other.m_vertices[i]);
            this.m_normals[i].Copy(other.m_normals[i]);
        }
        return this;
    };
    b2PolygonShape.prototype.GetChildCount = function () {
        return 1;
    };
    b2PolygonShape.prototype.Set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (typeof args[0][0] === "number") {
            var vertices_5 = args[0];
            if (vertices_5.length % 2 !== 0) {
                throw new Error();
            }
            return this._Set(function (index) { return ({ x: vertices_5[index * 2], y: vertices_5[index * 2 + 1] }); }, vertices_5.length / 2);
        }
        else {
            var vertices_6 = args[0];
            var count = args[1] || vertices_6.length;
            return this._Set(function (index) { return vertices_6[index]; }, count);
        }
    };
    b2PolygonShape.prototype._Set = function (vertices, count) {
        if (count < 3) {
            return this.SetAsBox(1, 1);
        }
        var n = count;
        var ps = [];
        for (var i = 0; i < n; ++i) {
            var v = vertices(i);
            var unique = true;
            for (var j = 0; j < ps.length; ++j) {
                if (b2Vec2.DistanceSquaredVV(v, ps[j]) < ((0.5 * b2_linearSlop) * (0.5 * b2_linearSlop))) {
                    unique = false;
                    break;
                }
            }
            if (unique) {
                ps.push(v);
            }
        }
        n = ps.length;
        if (n < 3) {
            return this.SetAsBox(1.0, 1.0);
        }
        var i0 = 0;
        var x0 = ps[0].x;
        for (var i = 1; i < n; ++i) {
            var x = ps[i].x;
            if (x > x0 || (x === x0 && ps[i].y < ps[i0].y)) {
                i0 = i;
                x0 = x;
            }
        }
        var hull = [];
        var m = 0;
        var ih = i0;
        for (;;) {
            hull[m] = ih;
            var ie = 0;
            for (var j = 1; j < n; ++j) {
                if (ie === ih) {
                    ie = j;
                    continue;
                }
                var r = b2Vec2.SubVV(ps[ie], ps[hull[m]], b2PolygonShape.Set_s_r);
                var v = b2Vec2.SubVV(ps[j], ps[hull[m]], b2PolygonShape.Set_s_v);
                var c = b2Vec2.CrossVV(r, v);
                if (c < 0) {
                    ie = j;
                }
                if (c === 0 && v.LengthSquared() > r.LengthSquared()) {
                    ie = j;
                }
            }
            ++m;
            ih = ie;
            if (ie === i0) {
                break;
            }
        }
        this.m_count = m;
        this.m_vertices = b2Vec2.MakeArray(this.m_count);
        this.m_normals = b2Vec2.MakeArray(this.m_count);
        for (var i = 0; i < m; ++i) {
            this.m_vertices[i].Copy(ps[hull[i]]);
        }
        for (var i = 0; i < m; ++i) {
            var vertexi1 = this.m_vertices[i];
            var vertexi2 = this.m_vertices[(i + 1) % m];
            var edge = b2Vec2.SubVV(vertexi2, vertexi1, b2Vec2.s_t0);
            b2Vec2.CrossVOne(edge, this.m_normals[i]).SelfNormalize();
        }
        b2PolygonShape.ComputeCentroid(this.m_vertices, m, this.m_centroid);
        return this;
    };
    b2PolygonShape.prototype.SetAsBox = function (hx, hy, center, angle) {
        if (angle === void 0) { angle = 0; }
        this.m_count = 4;
        this.m_vertices = b2Vec2.MakeArray(this.m_count);
        this.m_normals = b2Vec2.MakeArray(this.m_count);
        this.m_vertices[0].Set((-hx), (-hy));
        this.m_vertices[1].Set(hx, (-hy));
        this.m_vertices[2].Set(hx, hy);
        this.m_vertices[3].Set((-hx), hy);
        this.m_normals[0].Set(0, (-1));
        this.m_normals[1].Set(1, 0);
        this.m_normals[2].Set(0, 1);
        this.m_normals[3].Set((-1), 0);
        this.m_centroid.SetZero();
        if (center) {
            this.m_centroid.Copy(center);
            var xf = new b2Transform();
            xf.SetPosition(center);
            xf.SetRotationAngle(angle);
            for (var i = 0; i < this.m_count; ++i) {
                b2Transform.MulXV(xf, this.m_vertices[i], this.m_vertices[i]);
                b2Rot.MulRV(xf.q, this.m_normals[i], this.m_normals[i]);
            }
        }
        return this;
    };
    b2PolygonShape.prototype.TestPoint = function (xf, p) {
        var pLocal = b2Transform.MulTXV(xf, p, b2PolygonShape.TestPoint_s_pLocal);
        for (var i = 0; i < this.m_count; ++i) {
            var dot = b2Vec2.DotVV(this.m_normals[i], b2Vec2.SubVV(pLocal, this.m_vertices[i], b2Vec2.s_t0));
            if (dot > 0) {
                return false;
            }
        }
        return true;
    };
    b2PolygonShape.prototype.ComputeDistance = function (xf, p, normal, childIndex) {
        var pLocal = b2Transform.MulTXV(xf, p, b2PolygonShape.ComputeDistance_s_pLocal);
        var maxDistance = -b2_maxFloat;
        var normalForMaxDistance = b2PolygonShape.ComputeDistance_s_normalForMaxDistance.Copy(pLocal);
        for (var i = 0; i < this.m_count; ++i) {
            var dot = b2Vec2.DotVV(this.m_normals[i], b2Vec2.SubVV(pLocal, this.m_vertices[i], b2Vec2.s_t0));
            if (dot > maxDistance) {
                maxDistance = dot;
                normalForMaxDistance.Copy(this.m_normals[i]);
            }
        }
        if (maxDistance > 0) {
            var minDistance = b2PolygonShape.ComputeDistance_s_minDistance.Copy(normalForMaxDistance);
            var minDistance2 = maxDistance * maxDistance;
            for (var i = 0; i < this.m_count; ++i) {
                var distance = b2Vec2.SubVV(pLocal, this.m_vertices[i], b2PolygonShape.ComputeDistance_s_distance);
                var distance2 = distance.LengthSquared();
                if (minDistance2 > distance2) {
                    minDistance.Copy(distance);
                    minDistance2 = distance2;
                }
            }
            b2Rot.MulRV(xf.q, minDistance, normal);
            normal.Normalize();
            return Math.sqrt(minDistance2);
        }
        else {
            b2Rot.MulRV(xf.q, normalForMaxDistance, normal);
            return maxDistance;
        }
    };
    b2PolygonShape.prototype.RayCast = function (output, input, xf, childIndex) {
        var p1 = b2Transform.MulTXV(xf, input.p1, b2PolygonShape.RayCast_s_p1);
        var p2 = b2Transform.MulTXV(xf, input.p2, b2PolygonShape.RayCast_s_p2);
        var d = b2Vec2.SubVV(p2, p1, b2PolygonShape.RayCast_s_d);
        var lower = 0, upper = input.maxFraction;
        var index = -1;
        for (var i = 0; i < this.m_count; ++i) {
            var numerator = b2Vec2.DotVV(this.m_normals[i], b2Vec2.SubVV(this.m_vertices[i], p1, b2Vec2.s_t0));
            var denominator = b2Vec2.DotVV(this.m_normals[i], d);
            if (denominator === 0) {
                if (numerator < 0) {
                    return false;
                }
            }
            else {
                if (denominator < 0 && numerator < lower * denominator) {
                    lower = numerator / denominator;
                    index = i;
                }
                else if (denominator > 0 && numerator < upper * denominator) {
                    upper = numerator / denominator;
                }
            }
            if (upper < lower) {
                return false;
            }
        }
        if (index >= 0) {
            output.fraction = lower;
            b2Rot.MulRV(xf.q, this.m_normals[index], output.normal);
            return true;
        }
        return false;
    };
    b2PolygonShape.prototype.ComputeAABB = function (aabb, xf, childIndex) {
        var lower = b2Transform.MulXV(xf, this.m_vertices[0], aabb.lowerBound);
        var upper = aabb.upperBound.Copy(lower);
        for (var i = 0; i < this.m_count; ++i) {
            var v = b2Transform.MulXV(xf, this.m_vertices[i], b2PolygonShape.ComputeAABB_s_v);
            b2Vec2.MinV(v, lower, lower);
            b2Vec2.MaxV(v, upper, upper);
        }
        var r = this.m_radius;
        lower.SelfSubXY(r, r);
        upper.SelfAddXY(r, r);
    };
    b2PolygonShape.prototype.ComputeMass = function (massData, density) {
        var center = b2PolygonShape.ComputeMass_s_center.SetZero();
        var area = 0;
        var I = 0;
        var s = b2PolygonShape.ComputeMass_s_s.Copy(this.m_vertices[0]);
        var k_inv3 = 1 / 3;
        for (var i = 0; i < this.m_count; ++i) {
            var e1 = b2Vec2.SubVV(this.m_vertices[i], s, b2PolygonShape.ComputeMass_s_e1);
            var e2 = b2Vec2.SubVV(this.m_vertices[(i + 1) % this.m_count], s, b2PolygonShape.ComputeMass_s_e2);
            var D = b2Vec2.CrossVV(e1, e2);
            var triangleArea = 0.5 * D;
            area += triangleArea;
            center.SelfAdd(b2Vec2.MulSV(triangleArea * k_inv3, b2Vec2.AddVV(e1, e2, b2Vec2.s_t0), b2Vec2.s_t1));
            var ex1 = e1.x;
            var ey1 = e1.y;
            var ex2 = e2.x;
            var ey2 = e2.y;
            var intx2 = ex1 * ex1 + ex2 * ex1 + ex2 * ex2;
            var inty2 = ey1 * ey1 + ey2 * ey1 + ey2 * ey2;
            I += (0.25 * k_inv3 * D) * (intx2 + inty2);
        }
        massData.mass = density * area;
        center.SelfMul(1 / area);
        b2Vec2.AddVV(center, s, massData.center);
        massData.I = density * I;
        massData.I += massData.mass * (b2Vec2.DotVV(massData.center, massData.center) - b2Vec2.DotVV(center, center));
    };
    b2PolygonShape.prototype.Validate = function () {
        for (var i = 0; i < this.m_count; ++i) {
            var i1 = i;
            var i2 = (i + 1) % this.m_count;
            var p = this.m_vertices[i1];
            var e = b2Vec2.SubVV(this.m_vertices[i2], p, b2PolygonShape.Validate_s_e);
            for (var j = 0; j < this.m_count; ++j) {
                if (j === i1 || j === i2) {
                    continue;
                }
                var v = b2Vec2.SubVV(this.m_vertices[j], p, b2PolygonShape.Validate_s_v);
                var c = b2Vec2.CrossVV(e, v);
                if (c < 0) {
                    return false;
                }
            }
        }
        return true;
    };
    b2PolygonShape.prototype.SetupDistanceProxy = function (proxy, index) {
        proxy.m_vertices = this.m_vertices;
        proxy.m_count = this.m_count;
        proxy.m_radius = this.m_radius;
    };
    b2PolygonShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
        var normalL = b2Rot.MulTRV(xf.q, normal, b2PolygonShape.ComputeSubmergedArea_s_normalL);
        var offsetL = offset - b2Vec2.DotVV(normal, xf.p);
        var depths = [];
        var diveCount = 0;
        var intoIndex = -1;
        var outoIndex = -1;
        var lastSubmerged = false;
        for (var i_3 = 0; i_3 < this.m_count; ++i_3) {
            depths[i_3] = b2Vec2.DotVV(normalL, this.m_vertices[i_3]) - offsetL;
            var isSubmerged = depths[i_3] < (-b2_epsilon);
            if (i_3 > 0) {
                if (isSubmerged) {
                    if (!lastSubmerged) {
                        intoIndex = i_3 - 1;
                        diveCount++;
                    }
                }
                else {
                    if (lastSubmerged) {
                        outoIndex = i_3 - 1;
                        diveCount++;
                    }
                }
            }
            lastSubmerged = isSubmerged;
        }
        switch (diveCount) {
            case 0:
                if (lastSubmerged) {
                    var md = b2PolygonShape.ComputeSubmergedArea_s_md;
                    this.ComputeMass(md, 1);
                    b2Transform.MulXV(xf, md.center, c);
                    return md.mass;
                }
                else {
                    return 0;
                }
            case 1:
                if (intoIndex === (-1)) {
                    intoIndex = this.m_count - 1;
                }
                else {
                    outoIndex = this.m_count - 1;
                }
                break;
        }
        var intoIndex2 = ((intoIndex + 1) % this.m_count);
        var outoIndex2 = ((outoIndex + 1) % this.m_count);
        var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
        var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
        var intoVec = b2PolygonShape.ComputeSubmergedArea_s_intoVec.Set(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
        var outoVec = b2PolygonShape.ComputeSubmergedArea_s_outoVec.Set(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
        var area = 0;
        var center = b2PolygonShape.ComputeSubmergedArea_s_center.SetZero();
        var p2 = this.m_vertices[intoIndex2];
        var p3;
        var i = intoIndex2;
        while (i !== outoIndex2) {
            i = (i + 1) % this.m_count;
            if (i === outoIndex2) {
                p3 = outoVec;
            }
            else {
                p3 = this.m_vertices[i];
            }
            var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
            area += triangleArea;
            center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
            center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
            p2 = p3;
        }
        center.SelfMul(1 / area);
        b2Transform.MulXV(xf, center, c);
        return area;
    };
    b2PolygonShape.prototype.Dump = function (log) {
        log("    const shape: b2PolygonShape = new b2PolygonShape();\n");
        log("    const vs: b2Vec2[] = [];\n");
        for (var i = 0; i < this.m_count; ++i) {
            log("    vs[%d] = new b2Vec2(%.15f, %.15f);\n", i, this.m_vertices[i].x, this.m_vertices[i].y);
        }
        log("    shape.Set(vs, %d);\n", this.m_count);
    };
    b2PolygonShape.ComputeCentroid = function (vs, count, out) {
        var c = out;
        c.SetZero();
        var area = 0;
        var s = b2PolygonShape.ComputeCentroid_s_s.Copy(vs[0]);
        var inv3 = 1 / 3;
        for (var i = 0; i < count; ++i) {
            var p1 = b2Vec2.SubVV(vs[0], s, b2PolygonShape.ComputeCentroid_s_p1);
            var p2 = b2Vec2.SubVV(vs[i], s, b2PolygonShape.ComputeCentroid_s_p2);
            var p3 = b2Vec2.SubVV(vs[(i + 1) % count], s, b2PolygonShape.ComputeCentroid_s_p3);
            var e1 = b2Vec2.SubVV(p2, p1, b2PolygonShape.ComputeCentroid_s_e1);
            var e2 = b2Vec2.SubVV(p3, p1, b2PolygonShape.ComputeCentroid_s_e2);
            var D = b2Vec2.CrossVV(e1, e2);
            var triangleArea = 0.5 * D;
            area += triangleArea;
            c.x += triangleArea * inv3 * (p1.x + p2.x + p3.x);
            c.y += triangleArea * inv3 * (p1.y + p2.y + p3.y);
        }
        c.x = (1 / area) * c.x + s.x;
        c.y = (1 / area) * c.y + s.y;
        return c;
    };
    b2PolygonShape.Set_s_r = new b2Vec2();
    b2PolygonShape.Set_s_v = new b2Vec2();
    b2PolygonShape.TestPoint_s_pLocal = new b2Vec2();
    b2PolygonShape.ComputeDistance_s_pLocal = new b2Vec2();
    b2PolygonShape.ComputeDistance_s_normalForMaxDistance = new b2Vec2();
    b2PolygonShape.ComputeDistance_s_minDistance = new b2Vec2();
    b2PolygonShape.ComputeDistance_s_distance = new b2Vec2();
    b2PolygonShape.RayCast_s_p1 = new b2Vec2();
    b2PolygonShape.RayCast_s_p2 = new b2Vec2();
    b2PolygonShape.RayCast_s_d = new b2Vec2();
    b2PolygonShape.ComputeAABB_s_v = new b2Vec2();
    b2PolygonShape.ComputeMass_s_center = new b2Vec2();
    b2PolygonShape.ComputeMass_s_s = new b2Vec2();
    b2PolygonShape.ComputeMass_s_e1 = new b2Vec2();
    b2PolygonShape.ComputeMass_s_e2 = new b2Vec2();
    b2PolygonShape.Validate_s_e = new b2Vec2();
    b2PolygonShape.Validate_s_v = new b2Vec2();
    b2PolygonShape.ComputeSubmergedArea_s_normalL = new b2Vec2();
    b2PolygonShape.ComputeSubmergedArea_s_md = new b2MassData();
    b2PolygonShape.ComputeSubmergedArea_s_intoVec = new b2Vec2();
    b2PolygonShape.ComputeSubmergedArea_s_outoVec = new b2Vec2();
    b2PolygonShape.ComputeSubmergedArea_s_center = new b2Vec2();
    b2PolygonShape.ComputeCentroid_s_s = new b2Vec2();
    b2PolygonShape.ComputeCentroid_s_p1 = new b2Vec2();
    b2PolygonShape.ComputeCentroid_s_p2 = new b2Vec2();
    b2PolygonShape.ComputeCentroid_s_p3 = new b2Vec2();
    b2PolygonShape.ComputeCentroid_s_e1 = new b2Vec2();
    b2PolygonShape.ComputeCentroid_s_e2 = new b2Vec2();
    return b2PolygonShape;
}(b2Shape));
//# sourceMappingURL=b2_polygon_shape.js.map