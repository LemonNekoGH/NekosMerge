// DEBUG: 

/// Rotation
class b2Rot {
  public static IDENTITY: b2Rot = new b2Rot();

  public s: number = 0;
  public c: number = 1;

  constructor(angle: number = 0) {
    if (angle) {
      this.s = Math.sin(angle);
      this.c = Math.cos(angle);
    }
  }

  public Clone(): b2Rot {
    return new b2Rot().Copy(this);
  }

  public Copy(other: b2Rot): this {
    this.s = other.s;
    this.c = other.c;
    return this;
  }

  public SetAngle(angle: number): this {
    this.s = Math.sin(angle);
    this.c = Math.cos(angle);
    return this;
  }

  public SetIdentity(): this {
    this.s = 0;
    this.c = 1;
    return this;
  }

  public GetAngle(): number {
    return Math.atan2(this.s, this.c);
  }

  public GetXAxis<T extends XY>(out: T): T {
    out.x = this.c;
    out.y = this.s;
    return out;
  }

  public GetYAxis<T extends XY>(out: T): T {
    out.x = -this.s;
    out.y = this.c;
    return out;
  }

  public static MulRR(q: b2Rot, r: b2Rot, out: b2Rot): b2Rot {
    // [qc -qs] * [rc -rs] = [qc*rc-qs*rs -qc*rs-qs*rc]
    // [qs  qc]   [rs  rc]   [qs*rc+qc*rs -qs*rs+qc*rc]
    // s = qs * rc + qc * rs
    // c = qc * rc - qs * rs
    const q_c: number = q.c, q_s: number = q.s;
    const r_c: number = r.c, r_s: number = r.s;
    out.s = q_s * r_c + q_c * r_s;
    out.c = q_c * r_c - q_s * r_s;
    return out;
  }

  public static MulTRR(q: b2Rot, r: b2Rot, out: b2Rot): b2Rot {
    // [ qc qs] * [rc -rs] = [qc*rc+qs*rs -qc*rs+qs*rc]
    // [-qs qc]   [rs  rc]   [-qs*rc+qc*rs qs*rs+qc*rc]
    // s = qc * rs - qs * rc
    // c = qc * rc + qs * rs
    const q_c: number = q.c, q_s: number = q.s;
    const r_c: number = r.c, r_s: number = r.s;
    out.s = q_c * r_s - q_s * r_c;
    out.c = q_c * r_c + q_s * r_s;
    return out;
  }

  public static MulRV<T extends XY>(q: b2Rot, v: XY, out: T): T {
    const q_c: number = q.c, q_s: number = q.s;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = q_c * v_x - q_s * v_y;
    out.y = q_s * v_x + q_c * v_y;
    return out;
  }

  public static MulTRV<T extends XY>(q: b2Rot, v: XY, out: T): T {
    const q_c: number = q.c, q_s: number = q.s;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = q_c * v_x + q_s * v_y;
    out.y = -q_s * v_x + q_c * v_y;
    return out;
  }
}

class b2Transform {
  public static IDENTITY: b2Transform = new b2Transform();

  public p: b2Vec2 = new b2Vec2();
  public q: b2Rot = new b2Rot();

  public Clone(): b2Transform {
    return new b2Transform().Copy(this);
  }

  public Copy(other: b2Transform): this {
    this.p.Copy(other.p);
    this.q.Copy(other.q);
    return this;
  }

  public SetIdentity(): this {
    this.p.SetZero();
    this.q.SetIdentity();
    return this;
  }

  public SetPositionRotation(position: XY, q: b2Rot): this {
    this.p.Copy(position);
    this.q.Copy(q);
    return this;
  }

  public SetPositionAngle(pos: XY, a: number): this {
    this.p.Copy(pos);
    this.q.SetAngle(a);
    return this;
  }

  public SetPosition(position: XY): this {
    this.p.Copy(position);
    return this;
  }

  public SetPositionXY(x: number, y: number): this {
    this.p.Set(x, y);
    return this;
  }

  public SetRotation(rotation: b2Rot): this {
    this.q.Copy(rotation);
    return this;
  }

  public SetRotationAngle(radians: number): this {
    this.q.SetAngle(radians);
    return this;
  }

  public GetPosition(): b2Vec2 {
    return this.p;
  }

  public GetRotation(): b2Rot {
    return this.q;
  }

  public GetRotationAngle(): number {
    return this.q.GetAngle();
  }

  public GetAngle(): number {
    return this.q.GetAngle();
  }

  public static MulXV<T extends XY>(T: b2Transform, v: XY, out: T): T {
    // float32 x = (T.q.c * v.x - T.q.s * v.y) + T.p.x;
    // float32 y = (T.q.s * v.x + T.q.c * v.y) + T.p.y;
    // return b2Vec2(x, y);
    const T_q_c: number = T.q.c, T_q_s: number = T.q.s;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = (T_q_c * v_x - T_q_s * v_y) + T.p.x;
    out.y = (T_q_s * v_x + T_q_c * v_y) + T.p.y;
    return out;
  }

  public static MulTXV<T extends XY>(T: b2Transform, v: XY, out: T): T {
    // float32 px = v.x - T.p.x;
    // float32 py = v.y - T.p.y;
    // float32 x = (T.q.c * px + T.q.s * py);
    // float32 y = (-T.q.s * px + T.q.c * py);
    // return b2Vec2(x, y);
    const T_q_c: number = T.q.c, T_q_s: number = T.q.s;
    const p_x: number = v.x - T.p.x;
    const p_y: number = v.y - T.p.y;
    out.x = (T_q_c * p_x + T_q_s * p_y);
    out.y = (-T_q_s * p_x + T_q_c * p_y);
    return out;
  }

  public static MulXX(A: b2Transform, B: b2Transform, out: b2Transform): b2Transform {
    b2Rot.MulRR(A.q, B.q, out.q);
    b2Vec2.AddVV(b2Rot.MulRV(A.q, B.p, out.p), A.p, out.p);
    return out;
  }

  public static MulTXX(A: b2Transform, B: b2Transform, out: b2Transform): b2Transform {
    b2Rot.MulTRR(A.q, B.q, out.q);
    b2Rot.MulTRV(A.q, b2Vec2.SubVV(B.p, A.p, out.p), out.p);
    return out;
  }

}

/// This describes the motion of a body/shape for TOI computation.
/// Shapes are defined with respect to the body origin, which may
/// no coincide with the center of mass. However, to support dynamics
/// we must interpolate the center of mass position.
class b2Sweep {
  public localCenter: b2Vec2 = new b2Vec2();
  public c0: b2Vec2 = new b2Vec2();
  public c: b2Vec2 = new b2Vec2();
  public a0: number = 0;
  public a: number = 0;
  public alpha0: number = 0;

  public Clone(): b2Sweep {
    return new b2Sweep().Copy(this);
  }

  public Copy(other: b2Sweep): this {
    this.localCenter.Copy(other.localCenter);
    this.c0.Copy(other.c0);
    this.c.Copy(other.c);
    this.a0 = other.a0;
    this.a = other.a;
    this.alpha0 = other.alpha0;
    return this;
  }

  // https://fgiesen.wordpress.com/2012/08/15/linear-interpolation-past-present-and-future/
  public GetTransform(xf: b2Transform, beta: number): b2Transform {
    xf.p.x = (1.0 - beta) * this.c0.x + beta * this.c.x;
    xf.p.y = (1.0 - beta) * this.c0.y + beta * this.c.y;
    const angle: number = (1.0 - beta) * this.a0 + beta * this.a;
    xf.q.SetAngle(angle);

    xf.p.SelfSub(b2Rot.MulRV(xf.q, this.localCenter, b2Vec2.s_t0));
    return xf;
  }

  public Advance(alpha: number): void {
    // DEBUG: b2Assert(this.alpha0 < 1);
    const beta: number = (alpha - this.alpha0) / (1 - this.alpha0);
    const one_minus_beta: number = (1 - beta);
    this.c0.x = one_minus_beta * this.c0.x + beta * this.c.x;
    this.c0.y = one_minus_beta * this.c0.y + beta * this.c.y;
    this.a0 = one_minus_beta * this.a0 + beta * this.a;
    this.alpha0 = alpha;
  }

  public Normalize(): void {
    const d: number = b2_two_pi * Math.floor(this.a0 / b2_two_pi);
    this.a0 -= d;
    this.a -= d;
  }
}


/// The features that intersect to form the contact point
/// This must be 4 bytes or less.
class b2ContactFeature {
  private _key: number = 0;
  private _key_invalid = false;
  private _indexA: number = 0;
  private _indexB: number = 0;
  private _typeA: b2ContactFeatureType = 0;
  private _typeB: b2ContactFeatureType = 0;

  public get key(): number {
    if (this._key_invalid) {
      this._key_invalid = false;
      this._key = this._indexA | (this._indexB << 8) | (this._typeA << 16) | (this._typeB << 24);
    }
    return this._key;
  }

  public set key(value: number) {
    this._key = value;
    this._key_invalid = false;
    this._indexA = this._key & 0xff;
    this._indexB = (this._key >> 8) & 0xff;
    this._typeA = (this._key >> 16) & 0xff;
    this._typeB = (this._key >> 24) & 0xff;
  }

  public get indexA(): number {
    return this._indexA;
  }

  public set indexA(value: number) {
    this._indexA = value;
    this._key_invalid = true;
  }

  public get indexB(): number {
    return this._indexB;
  }

  public set indexB(value: number) {
    this._indexB = value;
    this._key_invalid = true;
  }

  public get typeA(): number {
    return this._typeA;
  }

  public set typeA(value: number) {
    this._typeA = value;
    this._key_invalid = true;
  }

  public get typeB(): number {
    return this._typeB;
  }

  public set typeB(value: number) {
    this._typeB = value;
    this._key_invalid = true;
  }
}

class b2ContactID {
  public cf: b2ContactFeature = new b2ContactFeature();

  public Copy(o: b2ContactID): b2ContactID {
    this.key = o.key;
    return this;
  }

  public Clone(): b2ContactID {
    return new b2ContactID().Copy(this);
  }

  public get key(): number {
    return this.cf.key;
  }

  public set key(value: number) {
    this.cf.key = value;
  }
}


const b2CollideEdgeAndCircle_s_Q: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_e: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_d: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_e1: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_e2: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_P: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_n: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_id: b2ContactID = new b2ContactID();
function b2CollideEdgeAndCircle(manifold: b2Manifold, edgeA: b2EdgeShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void {
  manifold.pointCount = 0;

  // Compute circle in frame of edge
  const Q: b2Vec2 = b2Transform.MulTXV(xfA, b2Transform.MulXV(xfB, circleB.m_p, b2Vec2.s_t0), b2CollideEdgeAndCircle_s_Q);

  const A: b2Vec2 = edgeA.m_vertex1;
  const B: b2Vec2 = edgeA.m_vertex2;
  const e: b2Vec2 = b2Vec2.SubVV(B, A, b2CollideEdgeAndCircle_s_e);

  // Normal points to the right for a CCW winding
  // b2Vec2 n(e.y, -e.x);
  // const n: b2Vec2 = b2CollideEdgeAndCircle_s_n.Set(-e.y, e.x);
  const n: b2Vec2 = b2CollideEdgeAndCircle_s_n.Set(e.y, -e.x);
  // float offset = b2Dot(n, Q - A);
  const offset: number = b2Vec2.DotVV(n, b2Vec2.SubVV(Q, A, b2Vec2.s_t0));

  const oneSided: boolean = edgeA.m_oneSided;
  if (oneSided && offset < 0.0) {
    return;
  }

  // Barycentric coordinates
  const u: number = b2Vec2.DotVV(e, b2Vec2.SubVV(B, Q, b2Vec2.s_t0));
  const v: number = b2Vec2.DotVV(e, b2Vec2.SubVV(Q, A, b2Vec2.s_t0));

  const radius: number = edgeA.m_radius + circleB.m_radius;

  /// Contact ids to facilitate warm starting.


  // const cf: b2ContactFeature = new b2ContactFeature();
  const id: b2ContactID = b2CollideEdgeAndCircle_s_id;
  id.cf.indexB = 0;
  id.cf.typeB = b2ContactFeatureType.e_vertex;

  // Region A
  if (v <= 0) {
    const P: b2Vec2 = A;
    const d: b2Vec2 = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
    const dd: number = b2Vec2.DotVV(d, d);
    if (dd > radius * radius) {
      return;
    }

    // Is there an edge connected to A?
    if (edgeA.m_oneSided) {
      const A1: b2Vec2 = edgeA.m_vertex0;
      const B1: b2Vec2 = A;
      const e1: b2Vec2 = b2Vec2.SubVV(B1, A1, b2CollideEdgeAndCircle_s_e1);
      const u1: number = b2Vec2.DotVV(e1, b2Vec2.SubVV(B1, Q, b2Vec2.s_t0));

      // Is the circle in Region AB of the previous edge?
      if (u1 > 0) {
        return;
      }
    }

    id.cf.indexA = 0;
    id.cf.typeA = b2ContactFeatureType.e_vertex;
    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_circles;
    manifold.localNormal.SetZero();
    manifold.localPoint.Copy(P);
    manifold.points[0].id.Copy(id);
    // manifold.points[0].id.key = 0;
    // manifold.points[0].id.cf = cf;
    manifold.points[0].localPoint.Copy(circleB.m_p);
    return;
  }

  // Region B
  if (u <= 0) {
    const P: b2Vec2 = B;
    const d: b2Vec2 = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
    const dd: number = b2Vec2.DotVV(d, d);
    if (dd > radius * radius) {
      return;
    }

    // Is there an edge connected to B?
    if (edgeA.m_oneSided) {
      const B2: b2Vec2 = edgeA.m_vertex3;
      const A2: b2Vec2 = B;
      const e2: b2Vec2 = b2Vec2.SubVV(B2, A2, b2CollideEdgeAndCircle_s_e2);
      const v2: number = b2Vec2.DotVV(e2, b2Vec2.SubVV(Q, A2, b2Vec2.s_t0));

      // Is the circle in Region AB of the next edge?
      if (v2 > 0) {
        return;
      }
    }

    id.cf.indexA = 1;
    id.cf.typeA = b2ContactFeatureType.e_vertex;
    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_circles;
    manifold.localNormal.SetZero();
    manifold.localPoint.Copy(P);
    manifold.points[0].id.Copy(id);
    // manifold.points[0].id.key = 0;
    // manifold.points[0].id.cf = cf;
    manifold.points[0].localPoint.Copy(circleB.m_p);
    return;
  }

  // Region AB
  const den: number = b2Vec2.DotVV(e, e);
  // DEBUG: b2Assert(den > 0);
  const P: b2Vec2 = b2CollideEdgeAndCircle_s_P;
  P.x = (1 / den) * (u * A.x + v * B.x);
  P.y = (1 / den) * (u * A.y + v * B.y);
  const d: b2Vec2 = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
  const dd: number = b2Vec2.DotVV(d, d);
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
  // manifold.points[0].id.key = 0;
  // manifold.points[0].id.cf = cf;
  manifold.points[0].localPoint.Copy(circleB.m_p);
}

enum b2EPAxisType {
  e_unknown = 0,
  e_edgeA = 1,
  e_edgeB = 2,
}

class b2EPAxis {
  public normal: b2Vec2 = new b2Vec2();
  public type: b2EPAxisType = b2EPAxisType.e_unknown;
  public index: number = 0;
  public separation: number = 0;
}

class b2TempPolygon {
  public vertices: b2Vec2[] = [];
  public normals: b2Vec2[] = [];
  public count: number = 0;
}

class b2ReferenceFace {
  public i1: number = 0;
  public i2: number = 0;
  public v1: b2Vec2 = new b2Vec2();
  public v2: b2Vec2 = new b2Vec2();
  public normal: b2Vec2 = new b2Vec2();
  public sideNormal1: b2Vec2 = new b2Vec2();
  public sideOffset1: number = 0;
  public sideNormal2: b2Vec2 = new b2Vec2();
  public sideOffset2: number = 0;
}

// static b2EPAxis b2ComputeEdgeSeparation(const b2TempPolygon& polygonB, const b2Vec2& v1, const b2Vec2& normal1)
const b2ComputeEdgeSeparation_s_axis = new b2EPAxis();
const b2ComputeEdgeSeparation_s_axes: [b2Vec2, b2Vec2] = [new b2Vec2(), new b2Vec2()];
function b2ComputeEdgeSeparation(polygonB: b2TempPolygon, v1: b2Vec2, normal1: b2Vec2): b2EPAxis {
  // b2EPAxis axis;
  const axis: b2EPAxis = b2ComputeEdgeSeparation_s_axis;
  axis.type = b2EPAxisType.e_edgeA;
  axis.index = -1;
  axis.separation = -Number.MAX_VALUE; // -FLT_MAX;
  axis.normal.SetZero();

  // b2Vec2 axes[2] = { normal1, -normal1 };
  const axes: [b2Vec2, b2Vec2] = b2ComputeEdgeSeparation_s_axes;
  axes[0].Copy(normal1);
  axes[1].Copy(normal1).SelfNeg();

  // Find axis with least overlap (min-max problem)
  for (let j = 0; j < 2; ++j) {
    let sj: number = Number.MAX_VALUE; // FLT_MAX;

    // Find deepest polygon vertex along axis j
    for (let i = 0; i < polygonB.count; ++i) {
      // float si = b2Dot(axes[j], polygonB.vertices[i] - v1);
      const si: number = b2Vec2.DotVV(axes[j], b2Vec2.SubVV(polygonB.vertices[i], v1, b2Vec2.s_t0));
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

// static b2EPAxis b2ComputePolygonSeparation(const b2TempPolygon& polygonB, const b2Vec2& v1, const b2Vec2& v2)
const b2ComputePolygonSeparation_s_axis = new b2EPAxis();
const b2ComputePolygonSeparation_s_n = new b2Vec2();
function b2ComputePolygonSeparation(polygonB: b2TempPolygon, v1: b2Vec2, v2: b2Vec2): b2EPAxis {
  const axis: b2EPAxis = b2ComputePolygonSeparation_s_axis;
  axis.type = b2EPAxisType.e_unknown;
  axis.index = -1;
  axis.separation = -Number.MAX_VALUE; // -FLT_MAX;
  axis.normal.SetZero();

  for (let i = 0; i < polygonB.count; ++i) {
    // b2Vec2 n = -polygonB.normals[i];
    const n: b2Vec2 = b2Vec2.NegV(polygonB.normals[i], b2ComputePolygonSeparation_s_n);

    // float s1 = b2Dot(n, polygonB.vertices[i] - v1);
    const s1: number = b2Vec2.DotVV(n, b2Vec2.SubVV(polygonB.vertices[i], v1, b2Vec2.s_t0));
    // float s2 = b2Dot(n, polygonB.vertices[i] - v2);
    const s2: number = b2Vec2.DotVV(n, b2Vec2.SubVV(polygonB.vertices[i], v2, b2Vec2.s_t0));
    // float s = b2Min(s1, s2);
    const s: number = b2Min(s1, s2);

    if (s > axis.separation) {
      axis.type = b2EPAxisType.e_edgeB;
      axis.index = i;
      axis.separation = s;
      axis.normal.Copy(n);
    }
  }

  return axis;
}

const b2CollideEdgeAndPolygon_s_xf = new b2Transform();
const b2CollideEdgeAndPolygon_s_centroidB = new b2Vec2();
const b2CollideEdgeAndPolygon_s_edge1 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_normal1 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_edge0 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_normal0 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_edge2 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_normal2 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_tempPolygonB = new b2TempPolygon();
const b2CollideEdgeAndPolygon_s_ref = new b2ReferenceFace();
const b2CollideEdgeAndPolygon_s_clipPoints: [b2ClipVertex, b2ClipVertex] = [new b2ClipVertex(), new b2ClipVertex()];
const b2CollideEdgeAndPolygon_s_clipPoints1: [b2ClipVertex, b2ClipVertex] = [new b2ClipVertex(), new b2ClipVertex()];
const b2CollideEdgeAndPolygon_s_clipPoints2: [b2ClipVertex, b2ClipVertex] = [new b2ClipVertex(), new b2ClipVertex()];
function b2CollideEdgeAndPolygon(manifold: b2Manifold, edgeA: b2EdgeShape, xfA: b2Transform, polygonB: b2PolygonShape, xfB: b2Transform): void {
  manifold.pointCount = 0;

  // b2Transform xf = b2MulT(xfA, xfB);
  const xf = b2Transform.MulTXX(xfA, xfB, b2CollideEdgeAndPolygon_s_xf);

  // b2Vec2 centroidB = b2Mul(xf, polygonB.m_centroid);
  const centroidB: b2Vec2 = b2Transform.MulXV(xf, polygonB.m_centroid, b2CollideEdgeAndPolygon_s_centroidB);

  // b2Vec2 v1 = edgeA.m_vertex1;
  const v1: b2Vec2 = edgeA.m_vertex1;
  // b2Vec2 v2 = edgeA.m_vertex2;
  const v2: b2Vec2 = edgeA.m_vertex2;

  // b2Vec2 edge1 = v2 - v1;
  const edge1: b2Vec2 = b2Vec2.SubVV(v2, v1, b2CollideEdgeAndPolygon_s_edge1);
  edge1.Normalize();

  // Normal points to the right for a CCW winding
  // b2Vec2 normal1(edge1.y, -edge1.x);
  const normal1 = b2CollideEdgeAndPolygon_s_normal1.Set(edge1.y, -edge1.x);
  // float offset1 = b2Dot(normal1, centroidB - v1);
  const offset1: number = b2Vec2.DotVV(normal1, b2Vec2.SubVV(centroidB, v1, b2Vec2.s_t0));

  const oneSided: boolean = edgeA.m_oneSided;
  if (oneSided && offset1 < 0.0) {
    return;
  }

  // Get polygonB in frameA
  // b2TempPolygon tempPolygonB;
  const tempPolygonB: b2TempPolygon = b2CollideEdgeAndPolygon_s_tempPolygonB;
  tempPolygonB.count = polygonB.m_count;
  for (let i = 0; i < polygonB.m_count; ++i) {
    if (tempPolygonB.vertices.length <= i) { tempPolygonB.vertices.push(new b2Vec2()); }
    if (tempPolygonB.normals.length <= i) { tempPolygonB.normals.push(new b2Vec2()); }
    // tempPolygonB.vertices[i] = b2Mul(xf, polygonB.m_vertices[i]);
    b2Transform.MulXV(xf, polygonB.m_vertices[i], tempPolygonB.vertices[i]);
    // tempPolygonB.normals[i] = b2Mul(xf.q, polygonB.m_normals[i]);
    b2Rot.MulRV(xf.q, polygonB.m_normals[i], tempPolygonB.normals[i]);
  }

  const radius: number = polygonB.m_radius + edgeA.m_radius;

  // b2EPAxis edgeAxis = b2ComputeEdgeSeparation(tempPolygonB, v1, normal1);
  const edgeAxis: b2EPAxis = b2ComputeEdgeSeparation(tempPolygonB, v1, normal1);
  if (edgeAxis.separation > radius) {
    return;
  }

  // b2EPAxis polygonAxis = b2ComputePolygonSeparation(tedge0.y, -edge0.xempPolygonB, v1, v2);
  const polygonAxis: b2EPAxis = b2ComputePolygonSeparation(tempPolygonB, v1, v2);
  if (polygonAxis.separation > radius) {
    return;
  }

  // Use hysteresis for jitter reduction.
  const k_relativeTol: number = 0.98;
  const k_absoluteTol: number = 0.001;

  // b2EPAxis primaryAxis;
  let primaryAxis: b2EPAxis;
  if (polygonAxis.separation - radius > k_relativeTol * (edgeAxis.separation - radius) + k_absoluteTol) {
    primaryAxis = polygonAxis;
  } else {
    primaryAxis = edgeAxis;
  }

  if (oneSided) {
    // Smooth collision
    // See https://box2d.org/posts/2020/06/ghost-collisions/

    // b2Vec2 edge0 = v1 - edgeA.m_vertex0;
    const edge0: b2Vec2 = b2Vec2.SubVV(v1, edgeA.m_vertex0, b2CollideEdgeAndPolygon_s_edge0);
    edge0.Normalize();
    // b2Vec2 normal0(edge0.y, -edge0.x);
    const normal0: b2Vec2 = b2CollideEdgeAndPolygon_s_normal0.Set(edge0.y, -edge0.x);
    const convex1: boolean = b2Vec2.CrossVV(edge0, edge1) >= 0.0;

    // b2Vec2 edge2 = edgeA.m_vertex3 - v2;
    const edge2: b2Vec2 = b2Vec2.SubVV(edgeA.m_vertex3, v2, b2CollideEdgeAndPolygon_s_edge2);
    edge2.Normalize();
    // b2Vec2 normal2(edge2.y, -edge2.x);
    const normal2: b2Vec2 = b2CollideEdgeAndPolygon_s_normal2.Set(edge2.y, -edge2.x);
    const convex2: boolean = b2Vec2.CrossVV(edge1, edge2) >= 0.0;

    const sinTol: number = 0.1;
    const side1: boolean = b2Vec2.DotVV(primaryAxis.normal, edge1) <= 0.0;

    // Check Gauss Map
    if (side1) {
      if (convex1) {
        if (b2Vec2.CrossVV(primaryAxis.normal, normal0) > sinTol) {
          // Skip region
          return;
        }

        // Admit region
      } else {
        // Snap region
        primaryAxis = edgeAxis;
      }
    } else {
      if (convex2) {
        if (b2Vec2.CrossVV(normal2, primaryAxis.normal) > sinTol) {
          // Skip region
          return;
        }

        // Admit region
      } else {
        // Snap region
        primaryAxis = edgeAxis;
      }
    }
  }

  // b2ClipVertex clipPoints[2];
  const clipPoints: [b2ClipVertex, b2ClipVertex] = b2CollideEdgeAndPolygon_s_clipPoints;
  // b2ReferenceFace ref;
  const ref: b2ReferenceFace = b2CollideEdgeAndPolygon_s_ref;
  if (primaryAxis.type === b2EPAxisType.e_edgeA) {
    manifold.type = b2ManifoldType.e_faceA;

    // Search for the polygon normal that is most anti-parallel to the edge normal.
    let bestIndex: number = 0;
    let bestValue: number = b2Vec2.DotVV(primaryAxis.normal, tempPolygonB.normals[0]);
    for (let i = 1; i < tempPolygonB.count; ++i) {
      const value: number = b2Vec2.DotVV(primaryAxis.normal, tempPolygonB.normals[i]);
      if (value < bestValue) {
        bestValue = value;
        bestIndex = i;
      }
    }

    const i1: number = bestIndex;
    const i2: number = i1 + 1 < tempPolygonB.count ? i1 + 1 : 0;

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
    ref.sideNormal1.Copy(edge1).SelfNeg(); // ref.sideNormal1 = -edge1;
    ref.sideNormal2.Copy(edge1);
  } else {
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

    // CCW winding
    ref.sideNormal1.Set(ref.normal.y, -ref.normal.x);
    ref.sideNormal2.Copy(ref.sideNormal1).SelfNeg(); // ref.sideNormal2 = -ref.sideNormal1;
  }

  ref.sideOffset1 = b2Vec2.DotVV(ref.sideNormal1, ref.v1);
  ref.sideOffset2 = b2Vec2.DotVV(ref.sideNormal2, ref.v2);

  // Clip incident edge against reference face side planes
  // b2ClipVertex clipPoints1[2];
  const clipPoints1: [b2ClipVertex, b2ClipVertex] = b2CollideEdgeAndPolygon_s_clipPoints1; // [new b2ClipVertex(), new b2ClipVertex()];
  // b2ClipVertex clipPoints2[2];
  const clipPoints2: [b2ClipVertex, b2ClipVertex] = b2CollideEdgeAndPolygon_s_clipPoints2; // [new b2ClipVertex(), new b2ClipVertex()];
  // int32 np;
  let np: number;

  // Clip to side 1
  np = b2ClipSegmentToLine(clipPoints1, clipPoints, ref.sideNormal1, ref.sideOffset1, ref.i1);

  if (np < b2_maxManifoldPoints) {
    return;
  }

  // Clip to side 2
  np = b2ClipSegmentToLine(clipPoints2, clipPoints1, ref.sideNormal2, ref.sideOffset2, ref.i2);

  if (np < b2_maxManifoldPoints) {
    return;
  }

  // Now clipPoints2 contains the clipped points.
  if (primaryAxis.type === b2EPAxisType.e_edgeA) {
    manifold.localNormal.Copy(ref.normal);
    manifold.localPoint.Copy(ref.v1);
  } else {
    manifold.localNormal.Copy(polygonB.m_normals[ref.i1]);
    manifold.localPoint.Copy(polygonB.m_vertices[ref.i1]);
  }

  let pointCount = 0;
  for (let i = 0; i < b2_maxManifoldPoints; ++i) {
    const separation: number = b2Vec2.DotVV(ref.normal, b2Vec2.SubVV(clipPoints2[i].v, ref.v1, b2Vec2.s_t0));

    if (separation <= radius) {
      const cp: b2ManifoldPoint = manifold.points[pointCount];

      if (primaryAxis.type === b2EPAxisType.e_edgeA) {
        b2Transform.MulTXV(xf, clipPoints2[i].v, cp.localPoint); // cp.localPoint = b2MulT(xf, clipPoints2[i].v);
        cp.id.Copy(clipPoints2[i].id);
      } else {
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
