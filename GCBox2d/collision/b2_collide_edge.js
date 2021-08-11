var b2Rot = (function () {
    function b2Rot(angle) {
        if (angle === void 0) { angle = 0; }
        this.s = 0;
        this.c = 1;
        if (angle) {
            this.s = Math.sin(angle);
            this.c = Math.cos(angle);
        }
    }
    b2Rot.prototype.Clone = function () {
        return new b2Rot().Copy(this);
    };
    b2Rot.prototype.Copy = function (other) {
        this.s = other.s;
        this.c = other.c;
        return this;
    };
    b2Rot.prototype.SetAngle = function (angle) {
        this.s = Math.sin(angle);
        this.c = Math.cos(angle);
        return this;
    };
    b2Rot.prototype.SetIdentity = function () {
        this.s = 0;
        this.c = 1;
        return this;
    };
    b2Rot.prototype.GetAngle = function () {
        return Math.atan2(this.s, this.c);
    };
    b2Rot.prototype.GetXAxis = function (out) {
        out.x = this.c;
        out.y = this.s;
        return out;
    };
    b2Rot.prototype.GetYAxis = function (out) {
        out.x = -this.s;
        out.y = this.c;
        return out;
    };
    b2Rot.MulRR = function (q, r, out) {
        var q_c = q.c, q_s = q.s;
        var r_c = r.c, r_s = r.s;
        out.s = q_s * r_c + q_c * r_s;
        out.c = q_c * r_c - q_s * r_s;
        return out;
    };
    b2Rot.MulTRR = function (q, r, out) {
        var q_c = q.c, q_s = q.s;
        var r_c = r.c, r_s = r.s;
        out.s = q_c * r_s - q_s * r_c;
        out.c = q_c * r_c + q_s * r_s;
        return out;
    };
    b2Rot.MulRV = function (q, v, out) {
        var q_c = q.c, q_s = q.s;
        var v_x = v.x, v_y = v.y;
        out.x = q_c * v_x - q_s * v_y;
        out.y = q_s * v_x + q_c * v_y;
        return out;
    };
    b2Rot.MulTRV = function (q, v, out) {
        var q_c = q.c, q_s = q.s;
        var v_x = v.x, v_y = v.y;
        out.x = q_c * v_x + q_s * v_y;
        out.y = -q_s * v_x + q_c * v_y;
        return out;
    };
    b2Rot.IDENTITY = new b2Rot();
    return b2Rot;
}());
var b2Transform = (function () {
    function b2Transform() {
        this.p = new b2Vec2();
        this.q = new b2Rot();
    }
    b2Transform.prototype.Clone = function () {
        return new b2Transform().Copy(this);
    };
    b2Transform.prototype.Copy = function (other) {
        this.p.Copy(other.p);
        this.q.Copy(other.q);
        return this;
    };
    b2Transform.prototype.SetIdentity = function () {
        this.p.SetZero();
        this.q.SetIdentity();
        return this;
    };
    b2Transform.prototype.SetPositionRotation = function (position, q) {
        this.p.Copy(position);
        this.q.Copy(q);
        return this;
    };
    b2Transform.prototype.SetPositionAngle = function (pos, a) {
        this.p.Copy(pos);
        this.q.SetAngle(a);
        return this;
    };
    b2Transform.prototype.SetPosition = function (position) {
        this.p.Copy(position);
        return this;
    };
    b2Transform.prototype.SetPositionXY = function (x, y) {
        this.p.Set(x, y);
        return this;
    };
    b2Transform.prototype.SetRotation = function (rotation) {
        this.q.Copy(rotation);
        return this;
    };
    b2Transform.prototype.SetRotationAngle = function (radians) {
        this.q.SetAngle(radians);
        return this;
    };
    b2Transform.prototype.GetPosition = function () {
        return this.p;
    };
    b2Transform.prototype.GetRotation = function () {
        return this.q;
    };
    b2Transform.prototype.GetRotationAngle = function () {
        return this.q.GetAngle();
    };
    b2Transform.prototype.GetAngle = function () {
        return this.q.GetAngle();
    };
    b2Transform.MulXV = function (T, v, out) {
        var T_q_c = T.q.c, T_q_s = T.q.s;
        var v_x = v.x, v_y = v.y;
        out.x = (T_q_c * v_x - T_q_s * v_y) + T.p.x;
        out.y = (T_q_s * v_x + T_q_c * v_y) + T.p.y;
        return out;
    };
    b2Transform.MulTXV = function (T, v, out) {
        var T_q_c = T.q.c, T_q_s = T.q.s;
        var p_x = v.x - T.p.x;
        var p_y = v.y - T.p.y;
        out.x = (T_q_c * p_x + T_q_s * p_y);
        out.y = (-T_q_s * p_x + T_q_c * p_y);
        return out;
    };
    b2Transform.MulXX = function (A, B, out) {
        b2Rot.MulRR(A.q, B.q, out.q);
        b2Vec2.AddVV(b2Rot.MulRV(A.q, B.p, out.p), A.p, out.p);
        return out;
    };
    b2Transform.MulTXX = function (A, B, out) {
        b2Rot.MulTRR(A.q, B.q, out.q);
        b2Rot.MulTRV(A.q, b2Vec2.SubVV(B.p, A.p, out.p), out.p);
        return out;
    };
    b2Transform.IDENTITY = new b2Transform();
    return b2Transform;
}());
var b2Sweep = (function () {
    function b2Sweep() {
        this.localCenter = new b2Vec2();
        this.c0 = new b2Vec2();
        this.c = new b2Vec2();
        this.a0 = 0;
        this.a = 0;
        this.alpha0 = 0;
    }
    b2Sweep.prototype.Clone = function () {
        return new b2Sweep().Copy(this);
    };
    b2Sweep.prototype.Copy = function (other) {
        this.localCenter.Copy(other.localCenter);
        this.c0.Copy(other.c0);
        this.c.Copy(other.c);
        this.a0 = other.a0;
        this.a = other.a;
        this.alpha0 = other.alpha0;
        return this;
    };
    b2Sweep.prototype.GetTransform = function (xf, beta) {
        xf.p.x = (1.0 - beta) * this.c0.x + beta * this.c.x;
        xf.p.y = (1.0 - beta) * this.c0.y + beta * this.c.y;
        var angle = (1.0 - beta) * this.a0 + beta * this.a;
        xf.q.SetAngle(angle);
        xf.p.SelfSub(b2Rot.MulRV(xf.q, this.localCenter, b2Vec2.s_t0));
        return xf;
    };
    b2Sweep.prototype.Advance = function (alpha) {
        var beta = (alpha - this.alpha0) / (1 - this.alpha0);
        var one_minus_beta = (1 - beta);
        this.c0.x = one_minus_beta * this.c0.x + beta * this.c.x;
        this.c0.y = one_minus_beta * this.c0.y + beta * this.c.y;
        this.a0 = one_minus_beta * this.a0 + beta * this.a;
        this.alpha0 = alpha;
    };
    b2Sweep.prototype.Normalize = function () {
        var d = b2_two_pi * Math.floor(this.a0 / b2_two_pi);
        this.a0 -= d;
        this.a -= d;
    };
    return b2Sweep;
}());
var b2ContactFeature = (function () {
    function b2ContactFeature() {
        this._key = 0;
        this._key_invalid = false;
        this._indexA = 0;
        this._indexB = 0;
        this._typeA = 0;
        this._typeB = 0;
    }
    Object.defineProperty(b2ContactFeature.prototype, "key", {
        get: function () {
            if (this._key_invalid) {
                this._key_invalid = false;
                this._key = this._indexA | (this._indexB << 8) | (this._typeA << 16) | (this._typeB << 24);
            }
            return this._key;
        },
        set: function (value) {
            this._key = value;
            this._key_invalid = false;
            this._indexA = this._key & 0xff;
            this._indexB = (this._key >> 8) & 0xff;
            this._typeA = (this._key >> 16) & 0xff;
            this._typeB = (this._key >> 24) & 0xff;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(b2ContactFeature.prototype, "indexA", {
        get: function () {
            return this._indexA;
        },
        set: function (value) {
            this._indexA = value;
            this._key_invalid = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(b2ContactFeature.prototype, "indexB", {
        get: function () {
            return this._indexB;
        },
        set: function (value) {
            this._indexB = value;
            this._key_invalid = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(b2ContactFeature.prototype, "typeA", {
        get: function () {
            return this._typeA;
        },
        set: function (value) {
            this._typeA = value;
            this._key_invalid = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(b2ContactFeature.prototype, "typeB", {
        get: function () {
            return this._typeB;
        },
        set: function (value) {
            this._typeB = value;
            this._key_invalid = true;
        },
        enumerable: true,
        configurable: true
    });
    return b2ContactFeature;
}());
var b2ContactID = (function () {
    function b2ContactID() {
        this.cf = new b2ContactFeature();
    }
    b2ContactID.prototype.Copy = function (o) {
        this.key = o.key;
        return this;
    };
    b2ContactID.prototype.Clone = function () {
        return new b2ContactID().Copy(this);
    };
    Object.defineProperty(b2ContactID.prototype, "key", {
        get: function () {
            return this.cf.key;
        },
        set: function (value) {
            this.cf.key = value;
        },
        enumerable: true,
        configurable: true
    });
    return b2ContactID;
}());
var b2CollideEdgeAndCircle_s_Q = new b2Vec2();
var b2CollideEdgeAndCircle_s_e = new b2Vec2();
var b2CollideEdgeAndCircle_s_d = new b2Vec2();
var b2CollideEdgeAndCircle_s_e1 = new b2Vec2();
var b2CollideEdgeAndCircle_s_e2 = new b2Vec2();
var b2CollideEdgeAndCircle_s_P = new b2Vec2();
var b2CollideEdgeAndCircle_s_n = new b2Vec2();
var b2CollideEdgeAndCircle_s_id = new b2ContactID();
function b2CollideEdgeAndCircle(manifold, edgeA, xfA, circleB, xfB) {
    manifold.pointCount = 0;
    var Q = b2Transform.MulTXV(xfA, b2Transform.MulXV(xfB, circleB.m_p, b2Vec2.s_t0), b2CollideEdgeAndCircle_s_Q);
    var A = edgeA.m_vertex1;
    var B = edgeA.m_vertex2;
    var e = b2Vec2.SubVV(B, A, b2CollideEdgeAndCircle_s_e);
    var n = b2CollideEdgeAndCircle_s_n.Set(e.y, -e.x);
    var offset = b2Vec2.DotVV(n, b2Vec2.SubVV(Q, A, b2Vec2.s_t0));
    var oneSided = edgeA.m_oneSided;
    if (oneSided && offset < 0.0) {
        return;
    }
    var u = b2Vec2.DotVV(e, b2Vec2.SubVV(B, Q, b2Vec2.s_t0));
    var v = b2Vec2.DotVV(e, b2Vec2.SubVV(Q, A, b2Vec2.s_t0));
    var radius = edgeA.m_radius + circleB.m_radius;
    var id = b2CollideEdgeAndCircle_s_id;
    id.cf.indexB = 0;
    id.cf.typeB = b2ContactFeatureType.e_vertex;
    if (v <= 0) {
        var P_1 = A;
        var d_1 = b2Vec2.SubVV(Q, P_1, b2CollideEdgeAndCircle_s_d);
        var dd_1 = b2Vec2.DotVV(d_1, d_1);
        if (dd_1 > radius * radius) {
            return;
        }
        if (edgeA.m_oneSided) {
            var A1 = edgeA.m_vertex0;
            var B1 = A;
            var e1 = b2Vec2.SubVV(B1, A1, b2CollideEdgeAndCircle_s_e1);
            var u1 = b2Vec2.DotVV(e1, b2Vec2.SubVV(B1, Q, b2Vec2.s_t0));
            if (u1 > 0) {
                return;
            }
        }
        id.cf.indexA = 0;
        id.cf.typeA = b2ContactFeatureType.e_vertex;
        manifold.pointCount = 1;
        manifold.type = b2ManifoldType.e_circles;
        manifold.localNormal.SetZero();
        manifold.localPoint.Copy(P_1);
        manifold.points[0].id.Copy(id);
        manifold.points[0].localPoint.Copy(circleB.m_p);
        return;
    }
    if (u <= 0) {
        var P_2 = B;
        var d_2 = b2Vec2.SubVV(Q, P_2, b2CollideEdgeAndCircle_s_d);
        var dd_2 = b2Vec2.DotVV(d_2, d_2);
        if (dd_2 > radius * radius) {
            return;
        }
        if (edgeA.m_oneSided) {
            var B2 = edgeA.m_vertex3;
            var A2 = B;
            var e2 = b2Vec2.SubVV(B2, A2, b2CollideEdgeAndCircle_s_e2);
            var v2 = b2Vec2.DotVV(e2, b2Vec2.SubVV(Q, A2, b2Vec2.s_t0));
            if (v2 > 0) {
                return;
            }
        }
        id.cf.indexA = 1;
        id.cf.typeA = b2ContactFeatureType.e_vertex;
        manifold.pointCount = 1;
        manifold.type = b2ManifoldType.e_circles;
        manifold.localNormal.SetZero();
        manifold.localPoint.Copy(P_2);
        manifold.points[0].id.Copy(id);
        manifold.points[0].localPoint.Copy(circleB.m_p);
        return;
    }
    var den = b2Vec2.DotVV(e, e);
    var P = b2CollideEdgeAndCircle_s_P;
    P.x = (1 / den) * (u * A.x + v * B.x);
    P.y = (1 / den) * (u * A.y + v * B.y);
    var d = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
    var dd = b2Vec2.DotVV(d, d);
    if (dd > radius * radius) {
        return;
    }
    if (offset < 0) {
        n.Set(-n.x, -n.y);
    }
    n.Normalize();
    id.cf.indexA = 0;
    id.cf.typeA = b2ContactFeatureType.e_face;
    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_faceA;
    manifold.localNormal.Copy(n);
    manifold.localPoint.Copy(A);
    manifold.points[0].id.Copy(id);
    manifold.points[0].localPoint.Copy(circleB.m_p);
}
var b2EPAxisType;
(function (b2EPAxisType) {
    b2EPAxisType[b2EPAxisType["e_unknown"] = 0] = "e_unknown";
    b2EPAxisType[b2EPAxisType["e_edgeA"] = 1] = "e_edgeA";
    b2EPAxisType[b2EPAxisType["e_edgeB"] = 2] = "e_edgeB";
})(b2EPAxisType || (b2EPAxisType = {}));
var b2EPAxis = (function () {
    function b2EPAxis() {
        this.normal = new b2Vec2();
        this.type = b2EPAxisType.e_unknown;
        this.index = 0;
        this.separation = 0;
    }
    return b2EPAxis;
}());
var b2TempPolygon = (function () {
    function b2TempPolygon() {
        this.vertices = [];
        this.normals = [];
        this.count = 0;
    }
    return b2TempPolygon;
}());
var b2ReferenceFace = (function () {
    function b2ReferenceFace() {
        this.i1 = 0;
        this.i2 = 0;
        this.v1 = new b2Vec2();
        this.v2 = new b2Vec2();
        this.normal = new b2Vec2();
        this.sideNormal1 = new b2Vec2();
        this.sideOffset1 = 0;
        this.sideNormal2 = new b2Vec2();
        this.sideOffset2 = 0;
    }
    return b2ReferenceFace;
}());
var b2ComputeEdgeSeparation_s_axis = new b2EPAxis();
var b2ComputeEdgeSeparation_s_axes = [new b2Vec2(), new b2Vec2()];
function b2ComputeEdgeSeparation(polygonB, v1, normal1) {
    var axis = b2ComputeEdgeSeparation_s_axis;
    axis.type = b2EPAxisType.e_edgeA;
    axis.index = -1;
    axis.separation = -Number.MAX_VALUE;
    axis.normal.SetZero();
    var axes = b2ComputeEdgeSeparation_s_axes;
    axes[0].Copy(normal1);
    axes[1].Copy(normal1).SelfNeg();
    for (var j = 0; j < 2; ++j) {
        var sj = Number.MAX_VALUE;
        for (var i = 0; i < polygonB.count; ++i) {
            var si = b2Vec2.DotVV(axes[j], b2Vec2.SubVV(polygonB.vertices[i], v1, b2Vec2.s_t0));
            if (si < sj) {
                sj = si;
            }
        }
        if (sj > axis.separation) {
            axis.index = j;
            axis.separation = sj;
            axis.normal.Copy(axes[j]);
        }
    }
    return axis;
}
var b2ComputePolygonSeparation_s_axis = new b2EPAxis();
var b2ComputePolygonSeparation_s_n = new b2Vec2();
function b2ComputePolygonSeparation(polygonB, v1, v2) {
    var axis = b2ComputePolygonSeparation_s_axis;
    axis.type = b2EPAxisType.e_unknown;
    axis.index = -1;
    axis.separation = -Number.MAX_VALUE;
    axis.normal.SetZero();
    for (var i = 0; i < polygonB.count; ++i) {
        var n = b2Vec2.NegV(polygonB.normals[i], b2ComputePolygonSeparation_s_n);
        var s1 = b2Vec2.DotVV(n, b2Vec2.SubVV(polygonB.vertices[i], v1, b2Vec2.s_t0));
        var s2 = b2Vec2.DotVV(n, b2Vec2.SubVV(polygonB.vertices[i], v2, b2Vec2.s_t0));
        var s = b2Min(s1, s2);
        if (s > axis.separation) {
            axis.type = b2EPAxisType.e_edgeB;
            axis.index = i;
            axis.separation = s;
            axis.normal.Copy(n);
        }
    }
    return axis;
}
var b2CollideEdgeAndPolygon_s_xf = new b2Transform();
var b2CollideEdgeAndPolygon_s_centroidB = new b2Vec2();
var b2CollideEdgeAndPolygon_s_edge1 = new b2Vec2();
var b2CollideEdgeAndPolygon_s_normal1 = new b2Vec2();
var b2CollideEdgeAndPolygon_s_edge0 = new b2Vec2();
var b2CollideEdgeAndPolygon_s_normal0 = new b2Vec2();
var b2CollideEdgeAndPolygon_s_edge2 = new b2Vec2();
var b2CollideEdgeAndPolygon_s_normal2 = new b2Vec2();
var b2CollideEdgeAndPolygon_s_tempPolygonB = new b2TempPolygon();
var b2CollideEdgeAndPolygon_s_ref = new b2ReferenceFace();
var b2CollideEdgeAndPolygon_s_clipPoints = [new b2ClipVertex(), new b2ClipVertex()];
var b2CollideEdgeAndPolygon_s_clipPoints1 = [new b2ClipVertex(), new b2ClipVertex()];
var b2CollideEdgeAndPolygon_s_clipPoints2 = [new b2ClipVertex(), new b2ClipVertex()];
function b2CollideEdgeAndPolygon(manifold, edgeA, xfA, polygonB, xfB) {
    manifold.pointCount = 0;
    var xf = b2Transform.MulTXX(xfA, xfB, b2CollideEdgeAndPolygon_s_xf);
    var centroidB = b2Transform.MulXV(xf, polygonB.m_centroid, b2CollideEdgeAndPolygon_s_centroidB);
    var v1 = edgeA.m_vertex1;
    var v2 = edgeA.m_vertex2;
    var edge1 = b2Vec2.SubVV(v2, v1, b2CollideEdgeAndPolygon_s_edge1);
    edge1.Normalize();
    var normal1 = b2CollideEdgeAndPolygon_s_normal1.Set(edge1.y, -edge1.x);
    var offset1 = b2Vec2.DotVV(normal1, b2Vec2.SubVV(centroidB, v1, b2Vec2.s_t0));
    var oneSided = edgeA.m_oneSided;
    if (oneSided && offset1 < 0.0) {
        return;
    }
    var tempPolygonB = b2CollideEdgeAndPolygon_s_tempPolygonB;
    tempPolygonB.count = polygonB.m_count;
    for (var i = 0; i < polygonB.m_count; ++i) {
        if (tempPolygonB.vertices.length <= i) {
            tempPolygonB.vertices.push(new b2Vec2());
        }
        if (tempPolygonB.normals.length <= i) {
            tempPolygonB.normals.push(new b2Vec2());
        }
        b2Transform.MulXV(xf, polygonB.m_vertices[i], tempPolygonB.vertices[i]);
        b2Rot.MulRV(xf.q, polygonB.m_normals[i], tempPolygonB.normals[i]);
    }
    var radius = polygonB.m_radius + edgeA.m_radius;
    var edgeAxis = b2ComputeEdgeSeparation(tempPolygonB, v1, normal1);
    if (edgeAxis.separation > radius) {
        return;
    }
    var polygonAxis = b2ComputePolygonSeparation(tempPolygonB, v1, v2);
    if (polygonAxis.separation > radius) {
        return;
    }
    var k_relativeTol = 0.98;
    var k_absoluteTol = 0.001;
    var primaryAxis;
    if (polygonAxis.separation - radius > k_relativeTol * (edgeAxis.separation - radius) + k_absoluteTol) {
        primaryAxis = polygonAxis;
    }
    else {
        primaryAxis = edgeAxis;
    }
    if (oneSided) {
        var edge0 = b2Vec2.SubVV(v1, edgeA.m_vertex0, b2CollideEdgeAndPolygon_s_edge0);
        edge0.Normalize();
        var normal0 = b2CollideEdgeAndPolygon_s_normal0.Set(edge0.y, -edge0.x);
        var convex1 = b2Vec2.CrossVV(edge0, edge1) >= 0.0;
        var edge2 = b2Vec2.SubVV(edgeA.m_vertex3, v2, b2CollideEdgeAndPolygon_s_edge2);
        edge2.Normalize();
        var normal2 = b2CollideEdgeAndPolygon_s_normal2.Set(edge2.y, -edge2.x);
        var convex2 = b2Vec2.CrossVV(edge1, edge2) >= 0.0;
        var sinTol = 0.1;
        var side1 = b2Vec2.DotVV(primaryAxis.normal, edge1) <= 0.0;
        if (side1) {
            if (convex1) {
                if (b2Vec2.CrossVV(primaryAxis.normal, normal0) > sinTol) {
                    return;
                }
            }
            else {
                primaryAxis = edgeAxis;
            }
        }
        else {
            if (convex2) {
                if (b2Vec2.CrossVV(normal2, primaryAxis.normal) > sinTol) {
                    return;
                }
            }
            else {
                primaryAxis = edgeAxis;
            }
        }
    }
    var clipPoints = b2CollideEdgeAndPolygon_s_clipPoints;
    var ref = b2CollideEdgeAndPolygon_s_ref;
    if (primaryAxis.type === b2EPAxisType.e_edgeA) {
        manifold.type = b2ManifoldType.e_faceA;
        var bestIndex = 0;
        var bestValue = b2Vec2.DotVV(primaryAxis.normal, tempPolygonB.normals[0]);
        for (var i = 1; i < tempPolygonB.count; ++i) {
            var value = b2Vec2.DotVV(primaryAxis.normal, tempPolygonB.normals[i]);
            if (value < bestValue) {
                bestValue = value;
                bestIndex = i;
            }
        }
        var i1 = bestIndex;
        var i2 = i1 + 1 < tempPolygonB.count ? i1 + 1 : 0;
        clipPoints[0].v.Copy(tempPolygonB.vertices[i1]);
        clipPoints[0].id.cf.indexA = 0;
        clipPoints[0].id.cf.indexB = i1;
        clipPoints[0].id.cf.typeA = b2ContactFeatureType.e_face;
        clipPoints[0].id.cf.typeB = b2ContactFeatureType.e_vertex;
        clipPoints[1].v.Copy(tempPolygonB.vertices[i2]);
        clipPoints[1].id.cf.indexA = 0;
        clipPoints[1].id.cf.indexB = i2;
        clipPoints[1].id.cf.typeA = b2ContactFeatureType.e_face;
        clipPoints[1].id.cf.typeB = b2ContactFeatureType.e_vertex;
        ref.i1 = 0;
        ref.i2 = 1;
        ref.v1.Copy(v1);
        ref.v2.Copy(v2);
        ref.normal.Copy(primaryAxis.normal);
        ref.sideNormal1.Copy(edge1).SelfNeg();
        ref.sideNormal2.Copy(edge1);
    }
    else {
        manifold.type = b2ManifoldType.e_faceB;
        clipPoints[0].v.Copy(v2);
        clipPoints[0].id.cf.indexA = 1;
        clipPoints[0].id.cf.indexB = primaryAxis.index;
        clipPoints[0].id.cf.typeA = b2ContactFeatureType.e_vertex;
        clipPoints[0].id.cf.typeB = b2ContactFeatureType.e_face;
        clipPoints[1].v.Copy(v1);
        clipPoints[1].id.cf.indexA = 0;
        clipPoints[1].id.cf.indexB = primaryAxis.index;
        clipPoints[1].id.cf.typeA = b2ContactFeatureType.e_vertex;
        clipPoints[1].id.cf.typeB = b2ContactFeatureType.e_face;
        ref.i1 = primaryAxis.index;
        ref.i2 = ref.i1 + 1 < tempPolygonB.count ? ref.i1 + 1 : 0;
        ref.v1.Copy(tempPolygonB.vertices[ref.i1]);
        ref.v2.Copy(tempPolygonB.vertices[ref.i2]);
        ref.normal.Copy(tempPolygonB.normals[ref.i1]);
        ref.sideNormal1.Set(ref.normal.y, -ref.normal.x);
        ref.sideNormal2.Copy(ref.sideNormal1).SelfNeg();
    }
    ref.sideOffset1 = b2Vec2.DotVV(ref.sideNormal1, ref.v1);
    ref.sideOffset2 = b2Vec2.DotVV(ref.sideNormal2, ref.v2);
    var clipPoints1 = b2CollideEdgeAndPolygon_s_clipPoints1;
    var clipPoints2 = b2CollideEdgeAndPolygon_s_clipPoints2;
    var np;
    np = b2ClipSegmentToLine(clipPoints1, clipPoints, ref.sideNormal1, ref.sideOffset1, ref.i1);
    if (np < b2_maxManifoldPoints) {
        return;
    }
    np = b2ClipSegmentToLine(clipPoints2, clipPoints1, ref.sideNormal2, ref.sideOffset2, ref.i2);
    if (np < b2_maxManifoldPoints) {
        return;
    }
    if (primaryAxis.type === b2EPAxisType.e_edgeA) {
        manifold.localNormal.Copy(ref.normal);
        manifold.localPoint.Copy(ref.v1);
    }
    else {
        manifold.localNormal.Copy(polygonB.m_normals[ref.i1]);
        manifold.localPoint.Copy(polygonB.m_vertices[ref.i1]);
    }
    var pointCount = 0;
    for (var i = 0; i < b2_maxManifoldPoints; ++i) {
        var separation = b2Vec2.DotVV(ref.normal, b2Vec2.SubVV(clipPoints2[i].v, ref.v1, b2Vec2.s_t0));
        if (separation <= radius) {
            var cp = manifold.points[pointCount];
            if (primaryAxis.type === b2EPAxisType.e_edgeA) {
                b2Transform.MulTXV(xf, clipPoints2[i].v, cp.localPoint);
                cp.id.Copy(clipPoints2[i].id);
            }
            else {
                cp.localPoint.Copy(clipPoints2[i].v);
                cp.id.cf.typeA = clipPoints2[i].id.cf.typeB;
                cp.id.cf.typeB = clipPoints2[i].id.cf.typeA;
                cp.id.cf.indexA = clipPoints2[i].id.cf.indexB;
                cp.id.cf.indexB = clipPoints2[i].id.cf.indexA;
            }
            ++pointCount;
        }
    }
    manifold.pointCount = pointCount;
}
//# sourceMappingURL=b2_collide_edge.js.map