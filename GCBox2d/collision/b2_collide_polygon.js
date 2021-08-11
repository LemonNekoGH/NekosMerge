var b2FindMaxSeparation_s_xf = new b2Transform();
var b2FindMaxSeparation_s_n = new b2Vec2();
var b2FindMaxSeparation_s_v1 = new b2Vec2();
function b2FindMaxSeparation(edgeIndex, poly1, xf1, poly2, xf2) {
    var count1 = poly1.m_count;
    var count2 = poly2.m_count;
    var n1s = poly1.m_normals;
    var v1s = poly1.m_vertices;
    var v2s = poly2.m_vertices;
    var xf = b2Transform.MulTXX(xf2, xf1, b2FindMaxSeparation_s_xf);
    var bestIndex = 0;
    var maxSeparation = -b2_maxFloat;
    for (var i = 0; i < count1; ++i) {
        var n = b2Rot.MulRV(xf.q, n1s[i], b2FindMaxSeparation_s_n);
        var v1 = b2Transform.MulXV(xf, v1s[i], b2FindMaxSeparation_s_v1);
        var si = b2_maxFloat;
        for (var j = 0; j < count2; ++j) {
            var sij = b2Vec2.DotVV(n, b2Vec2.SubVV(v2s[j], v1, b2Vec2.s_t0));
            if (sij < si) {
                si = sij;
            }
        }
        if (si > maxSeparation) {
            maxSeparation = si;
            bestIndex = i;
        }
    }
    edgeIndex[0] = bestIndex;
    return maxSeparation;
}
var b2FindIncidentEdge_s_normal1 = new b2Vec2();
function b2FindIncidentEdge(c, poly1, xf1, edge1, poly2, xf2) {
    var normals1 = poly1.m_normals;
    var count2 = poly2.m_count;
    var vertices2 = poly2.m_vertices;
    var normals2 = poly2.m_normals;
    var normal1 = b2Rot.MulTRV(xf2.q, b2Rot.MulRV(xf1.q, normals1[edge1], b2Vec2.s_t0), b2FindIncidentEdge_s_normal1);
    var index = 0;
    var minDot = b2_maxFloat;
    for (var i = 0; i < count2; ++i) {
        var dot = b2Vec2.DotVV(normal1, normals2[i]);
        if (dot < minDot) {
            minDot = dot;
            index = i;
        }
    }
    var i1 = index;
    var i2 = i1 + 1 < count2 ? i1 + 1 : 0;
    var c0 = c[0];
    b2Transform.MulXV(xf2, vertices2[i1], c0.v);
    var cf0 = c0.id.cf;
    cf0.indexA = edge1;
    cf0.indexB = i1;
    cf0.typeA = b2ContactFeatureType.e_face;
    cf0.typeB = b2ContactFeatureType.e_vertex;
    var c1 = c[1];
    b2Transform.MulXV(xf2, vertices2[i2], c1.v);
    var cf1 = c1.id.cf;
    cf1.indexA = edge1;
    cf1.indexB = i2;
    cf1.typeA = b2ContactFeatureType.e_face;
    cf1.typeB = b2ContactFeatureType.e_vertex;
}
var b2CollidePolygons_s_incidentEdge = [new b2ClipVertex(), new b2ClipVertex()];
var b2CollidePolygons_s_clipPoints1 = [new b2ClipVertex(), new b2ClipVertex()];
var b2CollidePolygons_s_clipPoints2 = [new b2ClipVertex(), new b2ClipVertex()];
var b2CollidePolygons_s_edgeA = [0];
var b2CollidePolygons_s_edgeB = [0];
var b2CollidePolygons_s_localTangent = new b2Vec2();
var b2CollidePolygons_s_localNormal = new b2Vec2();
var b2CollidePolygons_s_planePoint = new b2Vec2();
var b2CollidePolygons_s_normal = new b2Vec2();
var b2CollidePolygons_s_tangent = new b2Vec2();
var b2CollidePolygons_s_ntangent = new b2Vec2();
var b2CollidePolygons_s_v11 = new b2Vec2();
var b2CollidePolygons_s_v12 = new b2Vec2();
function b2CollidePolygons(manifold, polyA, xfA, polyB, xfB) {
    manifold.pointCount = 0;
    var totalRadius = polyA.m_radius + polyB.m_radius;
    var edgeA = b2CollidePolygons_s_edgeA;
    edgeA[0] = 0;
    var separationA = b2FindMaxSeparation(edgeA, polyA, xfA, polyB, xfB);
    if (separationA > totalRadius) {
        return;
    }
    var edgeB = b2CollidePolygons_s_edgeB;
    edgeB[0] = 0;
    var separationB = b2FindMaxSeparation(edgeB, polyB, xfB, polyA, xfA);
    if (separationB > totalRadius) {
        return;
    }
    var poly1;
    var poly2;
    var xf1, xf2;
    var edge1 = 0;
    var flip = 0;
    var k_tol = 0.1 * b2_linearSlop;
    if (separationB > separationA + k_tol) {
        poly1 = polyB;
        poly2 = polyA;
        xf1 = xfB;
        xf2 = xfA;
        edge1 = edgeB[0];
        manifold.type = b2ManifoldType.e_faceB;
        flip = 1;
    }
    else {
        poly1 = polyA;
        poly2 = polyB;
        xf1 = xfA;
        xf2 = xfB;
        edge1 = edgeA[0];
        manifold.type = b2ManifoldType.e_faceA;
        flip = 0;
    }
    var incidentEdge = b2CollidePolygons_s_incidentEdge;
    b2FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
    var count1 = poly1.m_count;
    var vertices1 = poly1.m_vertices;
    var iv1 = edge1;
    var iv2 = edge1 + 1 < count1 ? edge1 + 1 : 0;
    var local_v11 = vertices1[iv1];
    var local_v12 = vertices1[iv2];
    var localTangent = b2Vec2.SubVV(local_v12, local_v11, b2CollidePolygons_s_localTangent);
    localTangent.Normalize();
    var localNormal = b2Vec2.CrossVOne(localTangent, b2CollidePolygons_s_localNormal);
    var planePoint = b2Vec2.MidVV(local_v11, local_v12, b2CollidePolygons_s_planePoint);
    var tangent = b2Rot.MulRV(xf1.q, localTangent, b2CollidePolygons_s_tangent);
    var normal = b2Vec2.CrossVOne(tangent, b2CollidePolygons_s_normal);
    var v11 = b2Transform.MulXV(xf1, local_v11, b2CollidePolygons_s_v11);
    var v12 = b2Transform.MulXV(xf1, local_v12, b2CollidePolygons_s_v12);
    var frontOffset = b2Vec2.DotVV(normal, v11);
    var sideOffset1 = -b2Vec2.DotVV(tangent, v11) + totalRadius;
    var sideOffset2 = b2Vec2.DotVV(tangent, v12) + totalRadius;
    var clipPoints1 = b2CollidePolygons_s_clipPoints1;
    var clipPoints2 = b2CollidePolygons_s_clipPoints2;
    var np;
    var ntangent = b2Vec2.NegV(tangent, b2CollidePolygons_s_ntangent);
    np = b2ClipSegmentToLine(clipPoints1, incidentEdge, ntangent, sideOffset1, iv1);
    if (np < 2) {
        return;
    }
    np = b2ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2, iv2);
    if (np < 2) {
        return;
    }
    manifold.localNormal.Copy(localNormal);
    manifold.localPoint.Copy(planePoint);
    var pointCount = 0;
    for (var i = 0; i < b2_maxManifoldPoints; ++i) {
        var cv = clipPoints2[i];
        var separation = b2Vec2.DotVV(normal, cv.v) - frontOffset;
        if (separation <= totalRadius) {
            var cp = manifold.points[pointCount];
            b2Transform.MulTXV(xf2, cv.v, cp.localPoint);
            cp.id.Copy(cv.id);
            if (flip) {
                var cf = cp.id.cf;
                cp.id.cf.indexA = cf.indexB;
                cp.id.cf.indexB = cf.indexA;
                cp.id.cf.typeA = cf.typeB;
                cp.id.cf.typeB = cf.typeA;
            }
            ++pointCount;
        }
    }
    manifold.pointCount = pointCount;
}
//# sourceMappingURL=b2_collide_polygon.js.map