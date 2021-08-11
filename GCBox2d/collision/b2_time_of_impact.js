var b2_toiTime = 0;
var b2_toiMaxTime = 0;
var b2_toiCalls = 0;
var b2_toiIters = 0;
var b2_toiMaxIters = 0;
var b2_toiRootIters = 0;
var b2_toiMaxRootIters = 0;
function b2_toi_reset() {
    b2_toiTime = 0;
    b2_toiMaxTime = 0;
    b2_toiCalls = 0;
    b2_toiIters = 0;
    b2_toiMaxIters = 0;
    b2_toiRootIters = 0;
    b2_toiMaxRootIters = 0;
}
var b2TimeOfImpact_s_xfA = new b2Transform();
var b2TimeOfImpact_s_xfB = new b2Transform();
var b2TimeOfImpact_s_pointA = new b2Vec2();
var b2TimeOfImpact_s_pointB = new b2Vec2();
var b2TimeOfImpact_s_normal = new b2Vec2();
var b2TimeOfImpact_s_axisA = new b2Vec2();
var b2TimeOfImpact_s_axisB = new b2Vec2();
var b2TOIInput = (function () {
    function b2TOIInput() {
        this.proxyA = new b2DistanceProxy();
        this.proxyB = new b2DistanceProxy();
        this.sweepA = new b2Sweep();
        this.sweepB = new b2Sweep();
        this.tMax = 0;
    }
    return b2TOIInput;
}());
var b2TOIOutputState;
(function (b2TOIOutputState) {
    b2TOIOutputState[b2TOIOutputState["e_unknown"] = 0] = "e_unknown";
    b2TOIOutputState[b2TOIOutputState["e_failed"] = 1] = "e_failed";
    b2TOIOutputState[b2TOIOutputState["e_overlapped"] = 2] = "e_overlapped";
    b2TOIOutputState[b2TOIOutputState["e_touching"] = 3] = "e_touching";
    b2TOIOutputState[b2TOIOutputState["e_separated"] = 4] = "e_separated";
})(b2TOIOutputState || (b2TOIOutputState = {}));
var b2TOIOutput = (function () {
    function b2TOIOutput() {
        this.state = b2TOIOutputState.e_unknown;
        this.t = 0;
    }
    return b2TOIOutput;
}());
var b2SeparationFunctionType;
(function (b2SeparationFunctionType) {
    b2SeparationFunctionType[b2SeparationFunctionType["e_unknown"] = -1] = "e_unknown";
    b2SeparationFunctionType[b2SeparationFunctionType["e_points"] = 0] = "e_points";
    b2SeparationFunctionType[b2SeparationFunctionType["e_faceA"] = 1] = "e_faceA";
    b2SeparationFunctionType[b2SeparationFunctionType["e_faceB"] = 2] = "e_faceB";
})(b2SeparationFunctionType || (b2SeparationFunctionType = {}));
var b2SeparationFunction = (function () {
    function b2SeparationFunction() {
        this.m_sweepA = new b2Sweep();
        this.m_sweepB = new b2Sweep();
        this.m_type = b2SeparationFunctionType.e_unknown;
        this.m_localPoint = new b2Vec2();
        this.m_axis = new b2Vec2();
    }
    b2SeparationFunction.prototype.Initialize = function (cache, proxyA, sweepA, proxyB, sweepB, t1) {
        this.m_proxyA = proxyA;
        this.m_proxyB = proxyB;
        var count = cache.count;
        this.m_sweepA.Copy(sweepA);
        this.m_sweepB.Copy(sweepB);
        var xfA = b2TimeOfImpact_s_xfA;
        var xfB = b2TimeOfImpact_s_xfB;
        this.m_sweepA.GetTransform(xfA, t1);
        this.m_sweepB.GetTransform(xfB, t1);
        if (count === 1) {
            this.m_type = b2SeparationFunctionType.e_points;
            var localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
            var localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
            var pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
            var pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
            b2Vec2.SubVV(pointB, pointA, this.m_axis);
            var s = this.m_axis.Normalize();
            this.m_localPoint.SetZero();
            return s;
        }
        else if (cache.indexA[0] === cache.indexA[1]) {
            this.m_type = b2SeparationFunctionType.e_faceB;
            var localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
            var localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
            b2Vec2.CrossVOne(b2Vec2.SubVV(localPointB2, localPointB1, b2Vec2.s_t0), this.m_axis).SelfNormalize();
            var normal = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);
            b2Vec2.MidVV(localPointB1, localPointB2, this.m_localPoint);
            var pointB = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);
            var localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
            var pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
            var s = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
            if (s < 0) {
                this.m_axis.SelfNeg();
                s = -s;
            }
            return s;
        }
        else {
            this.m_type = b2SeparationFunctionType.e_faceA;
            var localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
            var localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
            b2Vec2.CrossVOne(b2Vec2.SubVV(localPointA2, localPointA1, b2Vec2.s_t0), this.m_axis).SelfNormalize();
            var normal = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);
            b2Vec2.MidVV(localPointA1, localPointA2, this.m_localPoint);
            var pointA = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);
            var localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
            var pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
            var s = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
            if (s < 0) {
                this.m_axis.SelfNeg();
                s = -s;
            }
            return s;
        }
    };
    b2SeparationFunction.prototype.FindMinSeparation = function (indexA, indexB, t) {
        var xfA = b2TimeOfImpact_s_xfA;
        var xfB = b2TimeOfImpact_s_xfB;
        this.m_sweepA.GetTransform(xfA, t);
        this.m_sweepB.GetTransform(xfB, t);
        switch (this.m_type) {
            case b2SeparationFunctionType.e_points: {
                var axisA = b2Rot.MulTRV(xfA.q, this.m_axis, b2TimeOfImpact_s_axisA);
                var axisB = b2Rot.MulTRV(xfB.q, b2Vec2.NegV(this.m_axis, b2Vec2.s_t0), b2TimeOfImpact_s_axisB);
                indexA[0] = this.m_proxyA.GetSupport(axisA);
                indexB[0] = this.m_proxyB.GetSupport(axisB);
                var localPointA = this.m_proxyA.GetVertex(indexA[0]);
                var localPointB = this.m_proxyB.GetVertex(indexB[0]);
                var pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
                var pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
                var separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.m_axis);
                return separation;
            }
            case b2SeparationFunctionType.e_faceA: {
                var normal = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);
                var pointA = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);
                var axisB = b2Rot.MulTRV(xfB.q, b2Vec2.NegV(normal, b2Vec2.s_t0), b2TimeOfImpact_s_axisB);
                indexA[0] = -1;
                indexB[0] = this.m_proxyB.GetSupport(axisB);
                var localPointB = this.m_proxyB.GetVertex(indexB[0]);
                var pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
                var separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
                return separation;
            }
            case b2SeparationFunctionType.e_faceB: {
                var normal = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);
                var pointB = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);
                var axisA = b2Rot.MulTRV(xfA.q, b2Vec2.NegV(normal, b2Vec2.s_t0), b2TimeOfImpact_s_axisA);
                indexB[0] = -1;
                indexA[0] = this.m_proxyA.GetSupport(axisA);
                var localPointA = this.m_proxyA.GetVertex(indexA[0]);
                var pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
                var separation = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
                return separation;
            }
            default:
                indexA[0] = -1;
                indexB[0] = -1;
                return 0;
        }
    };
    b2SeparationFunction.prototype.Evaluate = function (indexA, indexB, t) {
        var xfA = b2TimeOfImpact_s_xfA;
        var xfB = b2TimeOfImpact_s_xfB;
        this.m_sweepA.GetTransform(xfA, t);
        this.m_sweepB.GetTransform(xfB, t);
        switch (this.m_type) {
            case b2SeparationFunctionType.e_points: {
                var localPointA = this.m_proxyA.GetVertex(indexA);
                var localPointB = this.m_proxyB.GetVertex(indexB);
                var pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
                var pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
                var separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.m_axis);
                return separation;
            }
            case b2SeparationFunctionType.e_faceA: {
                var normal = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);
                var pointA = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);
                var localPointB = this.m_proxyB.GetVertex(indexB);
                var pointB = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
                var separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
                return separation;
            }
            case b2SeparationFunctionType.e_faceB: {
                var normal = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);
                var pointB = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);
                var localPointA = this.m_proxyA.GetVertex(indexA);
                var pointA = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
                var separation = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
                return separation;
            }
            default:
                return 0;
        }
    };
    return b2SeparationFunction;
}());
var b2TimeOfImpact_s_timer = new b2Timer();
var b2TimeOfImpact_s_cache = new b2SimplexCache();
var b2TimeOfImpact_s_distanceInput = new b2DistanceInput();
var b2TimeOfImpact_s_distanceOutput = new b2DistanceOutput();
var b2TimeOfImpact_s_fcn = new b2SeparationFunction();
var b2TimeOfImpact_s_indexA = [0];
var b2TimeOfImpact_s_indexB = [0];
var b2TimeOfImpact_s_sweepA = new b2Sweep();
var b2TimeOfImpact_s_sweepB = new b2Sweep();
function b2TimeOfImpact(output, input) {
    var timer = b2TimeOfImpact_s_timer.Reset();
    ++b2_toiCalls;
    output.state = b2TOIOutputState.e_unknown;
    output.t = input.tMax;
    var proxyA = input.proxyA;
    var proxyB = input.proxyB;
    var maxVertices = b2Max(b2_maxPolygonVertices, b2Max(proxyA.m_count, proxyB.m_count));
    var sweepA = b2TimeOfImpact_s_sweepA.Copy(input.sweepA);
    var sweepB = b2TimeOfImpact_s_sweepB.Copy(input.sweepB);
    sweepA.Normalize();
    sweepB.Normalize();
    var tMax = input.tMax;
    var totalRadius = proxyA.m_radius + proxyB.m_radius;
    var target = b2Max(b2_linearSlop, totalRadius - 3 * b2_linearSlop);
    var tolerance = 0.25 * b2_linearSlop;
    var t1 = 0;
    var k_maxIterations = 20;
    var iter = 0;
    var cache = b2TimeOfImpact_s_cache;
    cache.count = 0;
    var distanceInput = b2TimeOfImpact_s_distanceInput;
    distanceInput.proxyA.Copy(input.proxyA);
    distanceInput.proxyB.Copy(input.proxyB);
    distanceInput.useRadii = false;
    for (;;) {
        var xfA = b2TimeOfImpact_s_xfA;
        var xfB = b2TimeOfImpact_s_xfB;
        sweepA.GetTransform(xfA, t1);
        sweepB.GetTransform(xfB, t1);
        distanceInput.transformA.Copy(xfA);
        distanceInput.transformB.Copy(xfB);
        var distanceOutput = b2TimeOfImpact_s_distanceOutput;
        b2Distance(distanceOutput, cache, distanceInput);
        if (distanceOutput.distance <= 0) {
            output.state = b2TOIOutputState.e_overlapped;
            output.t = 0;
            break;
        }
        if (distanceOutput.distance < target + tolerance) {
            output.state = b2TOIOutputState.e_touching;
            output.t = t1;
            break;
        }
        var fcn = b2TimeOfImpact_s_fcn;
        fcn.Initialize(cache, proxyA, sweepA, proxyB, sweepB, t1);
        var done = false;
        var t2 = tMax;
        var pushBackIter = 0;
        for (;;) {
            var indexA = b2TimeOfImpact_s_indexA;
            var indexB = b2TimeOfImpact_s_indexB;
            var s2 = fcn.FindMinSeparation(indexA, indexB, t2);
            if (s2 > (target + tolerance)) {
                output.state = b2TOIOutputState.e_separated;
                output.t = tMax;
                done = true;
                break;
            }
            if (s2 > (target - tolerance)) {
                t1 = t2;
                break;
            }
            var s1 = fcn.Evaluate(indexA[0], indexB[0], t1);
            if (s1 < (target - tolerance)) {
                output.state = b2TOIOutputState.e_failed;
                output.t = t1;
                done = true;
                break;
            }
            if (s1 <= (target + tolerance)) {
                output.state = b2TOIOutputState.e_touching;
                output.t = t1;
                done = true;
                break;
            }
            var rootIterCount = 0;
            var a1 = t1;
            var a2 = t2;
            for (;;) {
                var t = 0;
                if (rootIterCount & 1) {
                    t = a1 + (target - s1) * (a2 - a1) / (s2 - s1);
                }
                else {
                    t = 0.5 * (a1 + a2);
                }
                ++rootIterCount;
                ++b2_toiRootIters;
                var s = fcn.Evaluate(indexA[0], indexB[0], t);
                if (b2Abs(s - target) < tolerance) {
                    t2 = t;
                    break;
                }
                if (s > target) {
                    a1 = t;
                    s1 = s;
                }
                else {
                    a2 = t;
                    s2 = s;
                }
                if (rootIterCount === 50) {
                    break;
                }
            }
            b2_toiMaxRootIters = b2Max(b2_toiMaxRootIters, rootIterCount);
            ++pushBackIter;
            if (pushBackIter === maxVertices) {
                break;
            }
        }
        ++iter;
        ++b2_toiIters;
        if (done) {
            break;
        }
        if (iter === k_maxIterations) {
            output.state = b2TOIOutputState.e_failed;
            output.t = t1;
            break;
        }
    }
    b2_toiMaxIters = b2Max(b2_toiMaxIters, iter);
    var time = timer.GetMilliseconds();
    b2_toiMaxTime = b2Max(b2_toiMaxTime, time);
    b2_toiTime += time;
}
//# sourceMappingURL=b2_time_of_impact.js.map