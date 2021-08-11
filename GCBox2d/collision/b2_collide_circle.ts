


/// A 2D column vector.
 class b2Vec2 implements XY {
  public static  ZERO:b2Vec2 = new b2Vec2(0, 0);
  public static  UNITX:b2Vec2 = new b2Vec2(1, 0);
  public static  UNITY:b2Vec2 = new b2Vec2(0, 1);

  public static  s_t0: b2Vec2 = new b2Vec2();
  public static  s_t1: b2Vec2 = new b2Vec2();
  public static  s_t2: b2Vec2 = new b2Vec2();
  public static  s_t3: b2Vec2 = new b2Vec2();

  public constructor(public x: number = 0, public y: number = 0) {}

  public Clone(): b2Vec2 {
    return new b2Vec2(this.x, this.y);
  }

  public SetZero(): this {
    this.x = 0;
    this.y = 0;
    return this;
  }

  public Set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  public Copy(other: XY): this {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  public SelfAdd(v: XY): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public SelfAddXY(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  public SelfSub(v: XY): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public SelfSubXY(x: number, y: number): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  public SelfMul(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  public SelfMulAdd(s: number, v: XY): this {
    this.x += s * v.x;
    this.y += s * v.y;
    return this;
  }

  public SelfMulSub(s: number, v: XY): this {
    this.x -= s * v.x;
    this.y -= s * v.y;
    return this;
  }

  public Dot(v: XY): number {
    return this.x * v.x + this.y * v.y;
  }

  public Cross(v: XY): number {
    return this.x * v.y - this.y * v.x;
  }

  public Length(): number {
    const x: number = this.x, y: number = this.y;
    return Math.sqrt(x * x + y * y);
  }

  public LengthSquared(): number {
    const x: number = this.x, y: number = this.y;
    return (x * x + y * y);
  }

  public Normalize(): number {
    const length: number = this.Length();
    if (length >= b2_epsilon) {
      const inv_length: number = 1 / length;
      this.x *= inv_length;
      this.y *= inv_length;
    }
    return length;
  }

  public SelfNormalize(): this {
    const length: number = this.Length();
    if (length >= b2_epsilon) {
      const inv_length: number = 1 / length;
      this.x *= inv_length;
      this.y *= inv_length;
    }
    return this;
  }

  public SelfRotate(radians: number): this {
    const c: number = Math.cos(radians);
    const s: number = Math.sin(radians);
    const x: number = this.x;
    this.x = c * x - s * this.y;
    this.y = s * x + c * this.y;
    return this;
  }

  public SelfRotateCosSin(c: number, s: number): this {
    const x: number = this.x;
    this.x = c * x - s * this.y;
    this.y = s * x + c * this.y;
    return this;
  }

  public IsValid(): boolean {
    return isFinite(this.x) && isFinite(this.y);
  }

  public SelfCrossVS(s: number): this {
    const x: number = this.x;
    this.x =  s * this.y;
    this.y = -s * x;
    return this;
  }

  public SelfCrossSV(s: number): this {
    const x: number = this.x;
    this.x = -s * this.y;
    this.y =  s * x;
    return this;
  }

  public SelfMinV(v: XY): this {
    this.x = b2Min(this.x, v.x);
    this.y = b2Min(this.y, v.y);
    return this;
  }

  public SelfMaxV(v: XY): this {
    this.x = b2Max(this.x, v.x);
    this.y = b2Max(this.y, v.y);
    return this;
  }

  public SelfAbs(): this {
    this.x = b2Abs(this.x);
    this.y = b2Abs(this.y);
    return this;
  }

  public SelfNeg(): this {
    this.x = (-this.x);
    this.y = (-this.y);
    return this;
  }

  public SelfSkew(): this {
    const x: number = this.x;
    this.x = -this.y;
    this.y = x;
    return this;
  }

  public static MakeArray(length: number): b2Vec2[] {
    return b2MakeArray(length, (i: number): b2Vec2 => new b2Vec2());
  }

  public static AbsV<T extends XY>(v: XY, out: T): T {
    out.x = b2Abs(v.x);
    out.y = b2Abs(v.y);
    return out;
  }

  public static MinV<T extends XY>(a: XY, b: XY, out: T): T {
    out.x = b2Min(a.x, b.x);
    out.y = b2Min(a.y, b.y);
    return out;
  }

  public static MaxV<T extends XY>(a: XY, b: XY, out: T): T {
    out.x = b2Max(a.x, b.x);
    out.y = b2Max(a.y, b.y);
    return out;
  }

  public static ClampV<T extends XY>(v: XY, lo: XY, hi: XY, out: T): T {
    out.x = b2Clamp(v.x, lo.x, hi.x);
    out.y = b2Clamp(v.y, lo.y, hi.y);
    return out;
  }

  public static RotateV<T extends XY>(v: XY, radians: number, out: T): T {
    const v_x: number = v.x, v_y: number = v.y;
    const c: number = Math.cos(radians);
    const s: number = Math.sin(radians);
    out.x = c * v_x - s * v_y;
    out.y = s * v_x + c * v_y;
    return out;
  }

  public static DotVV(a: XY, b: XY): number {
    return a.x * b.x + a.y * b.y;
  }

  public static CrossVV(a: XY, b: XY): number {
    return a.x * b.y - a.y * b.x;
  }

  public static CrossVS<T extends XY>(v: XY, s: number, out: T): T {
    const v_x: number = v.x;
    out.x =  s * v.y;
    out.y = -s * v_x;
    return out;
  }

  public static CrossVOne<T extends XY>(v: XY, out: T): T {
    const v_x: number = v.x;
    out.x =  v.y;
    out.y = -v_x;
    return out;
  }

  public static CrossSV<T extends XY>(s: number, v: XY, out: T): T {
    const v_x: number = v.x;
    out.x = -s * v.y;
    out.y =  s * v_x;
    return out;
  }

  public static CrossOneV<T extends XY>(v: XY, out: T): T {
    const v_x: number = v.x;
    out.x = -v.y;
    out.y =  v_x;
    return out;
  }

  public static AddVV<T extends XY>(a: XY, b: XY, out: T): T { out.x = a.x + b.x; out.y = a.y + b.y; return out; }

  public static SubVV<T extends XY>(a: XY, b: XY, out: T): T { out.x = a.x - b.x; out.y = a.y - b.y; return out; }

  public static MulSV<T extends XY>(s: number, v: XY, out: T): T { out.x = v.x * s; out.y = v.y * s; return out; }
  public static MulVS<T extends XY>(v: XY, s: number, out: T): T { out.x = v.x * s; out.y = v.y * s; return out; }

  public static AddVMulSV<T extends XY>(a: XY, s: number, b: XY, out: T): T { out.x = a.x + (s * b.x); out.y = a.y + (s * b.y); return out; }
  public static SubVMulSV<T extends XY>(a: XY, s: number, b: XY, out: T): T { out.x = a.x - (s * b.x); out.y = a.y - (s * b.y); return out; }

  public static AddVCrossSV<T extends XY>(a: XY, s: number, v: XY, out: T): T {
    const v_x: number = v.x;
    out.x = a.x - (s * v.y);
    out.y = a.y + (s * v_x);
    return out;
  }

  public static MidVV<T extends XY>(a: XY, b: XY, out: T): T { out.x = (a.x + b.x) * 0.5; out.y = (a.y + b.y) * 0.5; return out; }

  public static ExtVV<T extends XY>(a: XY, b: XY, out: T): T { out.x = (b.x - a.x) * 0.5; out.y = (b.y - a.y) * 0.5; return out; }

  public static IsEqualToV(a: XY, b: XY): boolean {
    return a.x === b.x && a.y === b.y;
  }

  public static DistanceVV(a: XY, b: XY): number {
    const c_x: number = a.x - b.x;
    const c_y: number = a.y - b.y;
    return Math.sqrt(c_x * c_x + c_y * c_y);
  }

  public static DistanceSquaredVV(a: XY, b: XY): number {
    const c_x: number = a.x - b.x;
    const c_y: number = a.y - b.y;
    return (c_x * c_x + c_y * c_y);
  }

  public static NegV<T extends XY>(v: XY, out: T): T { out.x = -v.x; out.y = -v.y; return out; }

}

 const b2Vec2_zero:b2Vec2 = new b2Vec2(0, 0);





const b2CollideCircles_s_pA: b2Vec2 = new b2Vec2();
const b2CollideCircles_s_pB: b2Vec2 = new b2Vec2();
 function b2CollideCircles(manifold: b2Manifold, circleA: b2CircleShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void {
  manifold.pointCount = 0;

  const pA: b2Vec2 = b2Transform.MulXV(xfA, circleA.m_p, b2CollideCircles_s_pA);
  const pB: b2Vec2 = b2Transform.MulXV(xfB, circleB.m_p, b2CollideCircles_s_pB);

  const distSqr: number = b2Vec2.DistanceSquaredVV(pA, pB);
  const radius: number = circleA.m_radius + circleB.m_radius;
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

const b2CollidePolygonAndCircle_s_c: b2Vec2 = new b2Vec2();
const b2CollidePolygonAndCircle_s_cLocal: b2Vec2 = new b2Vec2();
const b2CollidePolygonAndCircle_s_faceCenter: b2Vec2 = new b2Vec2();
 function b2CollidePolygonAndCircle(manifold: b2Manifold, polygonA: b2PolygonShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void {
  manifold.pointCount = 0;

  // Compute circle position in the frame of the polygon.
  const c: b2Vec2 = b2Transform.MulXV(xfB, circleB.m_p, b2CollidePolygonAndCircle_s_c);
  const cLocal: b2Vec2 = b2Transform.MulTXV(xfA, c, b2CollidePolygonAndCircle_s_cLocal);

  // Find the min separating edge.
  let normalIndex: number = 0;
  let separation: number = (-b2_maxFloat);
  const radius: number = polygonA.m_radius + circleB.m_radius;
  const vertexCount: number = polygonA.m_count;
  const vertices: b2Vec2[] = polygonA.m_vertices;
  const normals: b2Vec2[] = polygonA.m_normals;

  for (let i: number = 0; i < vertexCount; ++i) {
    const s: number = b2Vec2.DotVV(normals[i], b2Vec2.SubVV(cLocal, vertices[i], b2Vec2.s_t0));

    if (s > radius) {
      // Early out.
      return;
    }

    if (s > separation) {
      separation = s;
      normalIndex = i;
    }
  }

  // Vertices that subtend the incident face.
  const vertIndex1: number = normalIndex;
  const vertIndex2: number = (vertIndex1 + 1) % vertexCount;
  const v1: b2Vec2 = vertices[vertIndex1];
  const v2: b2Vec2 = vertices[vertIndex2];

  // If the center is inside the polygon ...
  if (separation < b2_epsilon) {
    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_faceA;
    manifold.localNormal.Copy(normals[normalIndex]);
    b2Vec2.MidVV(v1, v2, manifold.localPoint);
    manifold.points[0].localPoint.Copy(circleB.m_p);
    manifold.points[0].id.key = 0;
    return;
  }

  // Compute barycentric coordinates
  const u1: number = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, v1, b2Vec2.s_t0), b2Vec2.SubVV(v2, v1, b2Vec2.s_t1));
  const u2: number = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, v2, b2Vec2.s_t0), b2Vec2.SubVV(v1, v2, b2Vec2.s_t1));
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
  } else if (u2 <= 0) {
    if (b2Vec2.DistanceSquaredVV(cLocal, v2) > radius * radius) {
      return;
    }

    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_faceA;
    b2Vec2.SubVV(cLocal, v2, manifold.localNormal).SelfNormalize();
    manifold.localPoint.Copy(v2);
    manifold.points[0].localPoint.Copy(circleB.m_p);
    manifold.points[0].id.key = 0;
  } else {
    const faceCenter: b2Vec2 = b2Vec2.MidVV(v1, v2, b2CollidePolygonAndCircle_s_faceCenter);
    const separation = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, faceCenter, b2Vec2.s_t1), normals[vertIndex1]);
    if (separation > radius) {
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
