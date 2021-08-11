var b2ContactFeatureType;
(function (b2ContactFeatureType) {
    b2ContactFeatureType[b2ContactFeatureType["e_vertex"] = 0] = "e_vertex";
    b2ContactFeatureType[b2ContactFeatureType["e_face"] = 1] = "e_face";
})(b2ContactFeatureType || (b2ContactFeatureType = {}));
var b2ManifoldPoint = (function () {
    function b2ManifoldPoint() {
        this.localPoint = new b2Vec2();
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
        this.id = new b2ContactID();
    }
    b2ManifoldPoint.MakeArray = function (length) {
        return b2MakeArray(length, function (i) { return new b2ManifoldPoint(); });
    };
    b2ManifoldPoint.prototype.Reset = function () {
        this.localPoint.SetZero();
        this.normalImpulse = 0;
        this.tangentImpulse = 0;
        this.id.key = 0;
    };
    b2ManifoldPoint.prototype.Copy = function (o) {
        this.localPoint.Copy(o.localPoint);
        this.normalImpulse = o.normalImpulse;
        this.tangentImpulse = o.tangentImpulse;
        this.id.Copy(o.id);
        return this;
    };
    return b2ManifoldPoint;
}());
var b2ManifoldType;
(function (b2ManifoldType) {
    b2ManifoldType[b2ManifoldType["e_unknown"] = -1] = "e_unknown";
    b2ManifoldType[b2ManifoldType["e_circles"] = 0] = "e_circles";
    b2ManifoldType[b2ManifoldType["e_faceA"] = 1] = "e_faceA";
    b2ManifoldType[b2ManifoldType["e_faceB"] = 2] = "e_faceB";
})(b2ManifoldType || (b2ManifoldType = {}));
var b2Manifold = (function () {
    function b2Manifold() {
        this.points = b2ManifoldPoint.MakeArray(b2_maxManifoldPoints);
        this.localNormal = new b2Vec2();
        this.localPoint = new b2Vec2();
        this.type = b2ManifoldType.e_unknown;
        this.pointCount = 0;
    }
    b2Manifold.prototype.Reset = function () {
        for (var i = 0; i < b2_maxManifoldPoints; ++i) {
            this.points[i].Reset();
        }
        this.localNormal.SetZero();
        this.localPoint.SetZero();
        this.type = b2ManifoldType.e_unknown;
        this.pointCount = 0;
    };
    b2Manifold.prototype.Copy = function (o) {
        this.pointCount = o.pointCount;
        for (var i = 0; i < b2_maxManifoldPoints; ++i) {
            this.points[i].Copy(o.points[i]);
        }
        this.localNormal.Copy(o.localNormal);
        this.localPoint.Copy(o.localPoint);
        this.type = o.type;
        return this;
    };
    b2Manifold.prototype.Clone = function () {
        return new b2Manifold().Copy(this);
    };
    return b2Manifold;
}());
var b2WorldManifold = (function () {
    function b2WorldManifold() {
        this.normal = new b2Vec2();
        this.points = b2Vec2.MakeArray(b2_maxManifoldPoints);
        this.separations = b2MakeNumberArray(b2_maxManifoldPoints);
    }
    b2WorldManifold.prototype.Initialize = function (manifold, xfA, radiusA, xfB, radiusB) {
        if (manifold.pointCount === 0) {
            return;
        }
        switch (manifold.type) {
            case b2ManifoldType.e_circles: {
                this.normal.Set(1, 0);
                var pointA = b2Transform.MulXV(xfA, manifold.localPoint, b2WorldManifold.Initialize_s_pointA);
                var pointB = b2Transform.MulXV(xfB, manifold.points[0].localPoint, b2WorldManifold.Initialize_s_pointB);
                if (b2Vec2.DistanceSquaredVV(pointA, pointB) > b2_epsilon_sq) {
                    b2Vec2.SubVV(pointB, pointA, this.normal).SelfNormalize();
                }
                var cA = b2Vec2.AddVMulSV(pointA, radiusA, this.normal, b2WorldManifold.Initialize_s_cA);
                var cB = b2Vec2.SubVMulSV(pointB, radiusB, this.normal, b2WorldManifold.Initialize_s_cB);
                b2Vec2.MidVV(cA, cB, this.points[0]);
                this.separations[0] = b2Vec2.DotVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), this.normal);
                break;
            }
            case b2ManifoldType.e_faceA: {
                b2Rot.MulRV(xfA.q, manifold.localNormal, this.normal);
                var planePoint = b2Transform.MulXV(xfA, manifold.localPoint, b2WorldManifold.Initialize_s_planePoint);
                for (var i = 0; i < manifold.pointCount; ++i) {
                    var clipPoint = b2Transform.MulXV(xfB, manifold.points[i].localPoint, b2WorldManifold.Initialize_s_clipPoint);
                    var s = radiusA - b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal);
                    var cA = b2Vec2.AddVMulSV(clipPoint, s, this.normal, b2WorldManifold.Initialize_s_cA);
                    var cB = b2Vec2.SubVMulSV(clipPoint, radiusB, this.normal, b2WorldManifold.Initialize_s_cB);
                    b2Vec2.MidVV(cA, cB, this.points[i]);
                    this.separations[i] = b2Vec2.DotVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), this.normal);
                }
                break;
            }
            case b2ManifoldType.e_faceB: {
                b2Rot.MulRV(xfB.q, manifold.localNormal, this.normal);
                var planePoint = b2Transform.MulXV(xfB, manifold.localPoint, b2WorldManifold.Initialize_s_planePoint);
                for (var i = 0; i < manifold.pointCount; ++i) {
                    var clipPoint = b2Transform.MulXV(xfA, manifold.points[i].localPoint, b2WorldManifold.Initialize_s_clipPoint);
                    var s = radiusB - b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal);
                    var cB = b2Vec2.AddVMulSV(clipPoint, s, this.normal, b2WorldManifold.Initialize_s_cB);
                    var cA = b2Vec2.SubVMulSV(clipPoint, radiusA, this.normal, b2WorldManifold.Initialize_s_cA);
                    b2Vec2.MidVV(cA, cB, this.points[i]);
                    this.separations[i] = b2Vec2.DotVV(b2Vec2.SubVV(cA, cB, b2Vec2.s_t0), this.normal);
                }
                this.normal.SelfNeg();
                break;
            }
        }
    };
    b2WorldManifold.Initialize_s_pointA = new b2Vec2();
    b2WorldManifold.Initialize_s_pointB = new b2Vec2();
    b2WorldManifold.Initialize_s_cA = new b2Vec2();
    b2WorldManifold.Initialize_s_cB = new b2Vec2();
    b2WorldManifold.Initialize_s_planePoint = new b2Vec2();
    b2WorldManifold.Initialize_s_clipPoint = new b2Vec2();
    return b2WorldManifold;
}());
var b2PointState;
(function (b2PointState) {
    b2PointState[b2PointState["b2_nullState"] = 0] = "b2_nullState";
    b2PointState[b2PointState["b2_addState"] = 1] = "b2_addState";
    b2PointState[b2PointState["b2_persistState"] = 2] = "b2_persistState";
    b2PointState[b2PointState["b2_removeState"] = 3] = "b2_removeState";
})(b2PointState || (b2PointState = {}));
function b2GetPointStates(state1, state2, manifold1, manifold2) {
    var i;
    for (i = 0; i < manifold1.pointCount; ++i) {
        var id = manifold1.points[i].id;
        var key = id.key;
        state1[i] = b2PointState.b2_removeState;
        for (var j = 0, jct = manifold2.pointCount; j < jct; ++j) {
            if (manifold2.points[j].id.key === key) {
                state1[i] = b2PointState.b2_persistState;
                break;
            }
        }
    }
    for (; i < b2_maxManifoldPoints; ++i) {
        state1[i] = b2PointState.b2_nullState;
    }
    for (i = 0; i < manifold2.pointCount; ++i) {
        var id = manifold2.points[i].id;
        var key = id.key;
        state2[i] = b2PointState.b2_addState;
        for (var j = 0, jct = manifold1.pointCount; j < jct; ++j) {
            if (manifold1.points[j].id.key === key) {
                state2[i] = b2PointState.b2_persistState;
                break;
            }
        }
    }
    for (; i < b2_maxManifoldPoints; ++i) {
        state2[i] = b2PointState.b2_nullState;
    }
}
var b2ClipVertex = (function () {
    function b2ClipVertex() {
        this.v = new b2Vec2();
        this.id = new b2ContactID();
    }
    b2ClipVertex.MakeArray = function (length) {
        return b2MakeArray(length, function (i) { return new b2ClipVertex(); });
    };
    b2ClipVertex.prototype.Copy = function (other) {
        this.v.Copy(other.v);
        this.id.Copy(other.id);
        return this;
    };
    return b2ClipVertex;
}());
var b2RayCastInput = (function () {
    function b2RayCastInput() {
        this.p1 = new b2Vec2();
        this.p2 = new b2Vec2();
        this.maxFraction = 1;
    }
    b2RayCastInput.prototype.Copy = function (o) {
        this.p1.Copy(o.p1);
        this.p2.Copy(o.p2);
        this.maxFraction = o.maxFraction;
        return this;
    };
    return b2RayCastInput;
}());
var b2RayCastOutput = (function () {
    function b2RayCastOutput() {
        this.normal = new b2Vec2();
        this.fraction = 0;
    }
    b2RayCastOutput.prototype.Copy = function (o) {
        this.normal.Copy(o.normal);
        this.fraction = o.fraction;
        return this;
    };
    return b2RayCastOutput;
}());
var b2AABB = (function () {
    function b2AABB() {
        this.lowerBound = new b2Vec2();
        this.upperBound = new b2Vec2();
        this.m_cache_center = new b2Vec2();
        this.m_cache_extent = new b2Vec2();
    }
    b2AABB.prototype.Copy = function (o) {
        this.lowerBound.Copy(o.lowerBound);
        this.upperBound.Copy(o.upperBound);
        return this;
    };
    b2AABB.prototype.IsValid = function () {
        if (!this.lowerBound.IsValid()) {
            return false;
        }
        if (!this.upperBound.IsValid()) {
            return false;
        }
        if (this.upperBound.x < this.lowerBound.x) {
            return false;
        }
        if (this.upperBound.y < this.lowerBound.y) {
            return false;
        }
        return true;
    };
    b2AABB.prototype.GetCenter = function () {
        return b2Vec2.MidVV(this.lowerBound, this.upperBound, this.m_cache_center);
    };
    b2AABB.prototype.GetExtents = function () {
        return b2Vec2.ExtVV(this.lowerBound, this.upperBound, this.m_cache_extent);
    };
    b2AABB.prototype.GetPerimeter = function () {
        var wx = this.upperBound.x - this.lowerBound.x;
        var wy = this.upperBound.y - this.lowerBound.y;
        return 2 * (wx + wy);
    };
    b2AABB.prototype.Combine1 = function (aabb) {
        this.lowerBound.x = b2Min(this.lowerBound.x, aabb.lowerBound.x);
        this.lowerBound.y = b2Min(this.lowerBound.y, aabb.lowerBound.y);
        this.upperBound.x = b2Max(this.upperBound.x, aabb.upperBound.x);
        this.upperBound.y = b2Max(this.upperBound.y, aabb.upperBound.y);
        return this;
    };
    b2AABB.prototype.Combine2 = function (aabb1, aabb2) {
        this.lowerBound.x = b2Min(aabb1.lowerBound.x, aabb2.lowerBound.x);
        this.lowerBound.y = b2Min(aabb1.lowerBound.y, aabb2.lowerBound.y);
        this.upperBound.x = b2Max(aabb1.upperBound.x, aabb2.upperBound.x);
        this.upperBound.y = b2Max(aabb1.upperBound.y, aabb2.upperBound.y);
        return this;
    };
    b2AABB.Combine = function (aabb1, aabb2, out) {
        out.Combine2(aabb1, aabb2);
        return out;
    };
    b2AABB.prototype.Contains = function (aabb) {
        var result = true;
        result = result && this.lowerBound.x <= aabb.lowerBound.x;
        result = result && this.lowerBound.y <= aabb.lowerBound.y;
        result = result && aabb.upperBound.x <= this.upperBound.x;
        result = result && aabb.upperBound.y <= this.upperBound.y;
        return result;
    };
    b2AABB.prototype.RayCast = function (output, input) {
        var tmin = (-b2_maxFloat);
        var tmax = b2_maxFloat;
        var p_x = input.p1.x;
        var p_y = input.p1.y;
        var d_x = input.p2.x - input.p1.x;
        var d_y = input.p2.y - input.p1.y;
        var absD_x = b2Abs(d_x);
        var absD_y = b2Abs(d_y);
        var normal = output.normal;
        if (absD_x < b2_epsilon) {
            if (p_x < this.lowerBound.x || this.upperBound.x < p_x) {
                return false;
            }
        }
        else {
            var inv_d = 1 / d_x;
            var t1 = (this.lowerBound.x - p_x) * inv_d;
            var t2 = (this.upperBound.x - p_x) * inv_d;
            var s = (-1);
            if (t1 > t2) {
                var t3 = t1;
                t1 = t2;
                t2 = t3;
                s = 1;
            }
            if (t1 > tmin) {
                normal.x = s;
                normal.y = 0;
                tmin = t1;
            }
            tmax = b2Min(tmax, t2);
            if (tmin > tmax) {
                return false;
            }
        }
        if (absD_y < b2_epsilon) {
            if (p_y < this.lowerBound.y || this.upperBound.y < p_y) {
                return false;
            }
        }
        else {
            var inv_d = 1 / d_y;
            var t1 = (this.lowerBound.y - p_y) * inv_d;
            var t2 = (this.upperBound.y - p_y) * inv_d;
            var s = (-1);
            if (t1 > t2) {
                var t3 = t1;
                t1 = t2;
                t2 = t3;
                s = 1;
            }
            if (t1 > tmin) {
                normal.x = 0;
                normal.y = s;
                tmin = t1;
            }
            tmax = b2Min(tmax, t2);
            if (tmin > tmax) {
                return false;
            }
        }
        if (tmin < 0 || input.maxFraction < tmin) {
            return false;
        }
        output.fraction = tmin;
        return true;
    };
    b2AABB.prototype.TestContain = function (point) {
        if (point.x < this.lowerBound.x || this.upperBound.x < point.x) {
            return false;
        }
        if (point.y < this.lowerBound.y || this.upperBound.y < point.y) {
            return false;
        }
        return true;
    };
    b2AABB.prototype.TestOverlap = function (other) {
        if (this.upperBound.x < other.lowerBound.x) {
            return false;
        }
        if (this.upperBound.y < other.lowerBound.y) {
            return false;
        }
        if (other.upperBound.x < this.lowerBound.x) {
            return false;
        }
        if (other.upperBound.y < this.lowerBound.y) {
            return false;
        }
        return true;
    };
    return b2AABB;
}());
function b2TestOverlapAABB(a, b) {
    if (a.upperBound.x < b.lowerBound.x) {
        return false;
    }
    if (a.upperBound.y < b.lowerBound.y) {
        return false;
    }
    if (b.upperBound.x < a.lowerBound.x) {
        return false;
    }
    if (b.upperBound.y < a.lowerBound.y) {
        return false;
    }
    return true;
}
function b2ClipSegmentToLine(vOut, vIn, normal, offset, vertexIndexA) {
    var count = 0;
    var vIn0 = vIn[0];
    var vIn1 = vIn[1];
    var distance0 = b2Vec2.DotVV(normal, vIn0.v) - offset;
    var distance1 = b2Vec2.DotVV(normal, vIn1.v) - offset;
    if (distance0 <= 0) {
        vOut[count++].Copy(vIn0);
    }
    if (distance1 <= 0) {
        vOut[count++].Copy(vIn1);
    }
    if (distance0 * distance1 < 0) {
        var interp = distance0 / (distance0 - distance1);
        var v = vOut[count].v;
        v.x = vIn0.v.x + interp * (vIn1.v.x - vIn0.v.x);
        v.y = vIn0.v.y + interp * (vIn1.v.y - vIn0.v.y);
        var id = vOut[count].id;
        id.cf.indexA = vertexIndexA;
        id.cf.indexB = vIn0.id.cf.indexB;
        id.cf.typeA = b2ContactFeatureType.e_vertex;
        id.cf.typeB = b2ContactFeatureType.e_face;
        ++count;
    }
    return count;
}
var b2TestOverlapShape_s_input = new b2DistanceInput();
var b2TestOverlapShape_s_simplexCache = new b2SimplexCache();
var b2TestOverlapShape_s_output = new b2DistanceOutput();
function b2TestOverlapShape(shapeA, indexA, shapeB, indexB, xfA, xfB) {
    var input = b2TestOverlapShape_s_input.Reset();
    input.proxyA.SetShape(shapeA, indexA);
    input.proxyB.SetShape(shapeB, indexB);
    input.transformA.Copy(xfA);
    input.transformB.Copy(xfB);
    input.useRadii = true;
    var simplexCache = b2TestOverlapShape_s_simplexCache.Reset();
    simplexCache.count = 0;
    var output = b2TestOverlapShape_s_output.Reset();
    b2Distance(output, simplexCache, input);
    return output.distance < 10 * b2_epsilon;
}
//# sourceMappingURL=b2_collision.js.map