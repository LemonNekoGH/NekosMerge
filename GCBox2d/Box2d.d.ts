declare class b2BlockAllocator {
}

declare const b2_pi_over_180: number;
declare const b2_180_over_pi: number;
declare const b2_two_pi: number;
declare const b2Abs: (x: number) => number;
declare function b2Min(a: number, b: number): number;
declare function b2Max(a: number, b: number): number;
declare function b2Clamp(a: number, lo: number, hi: number): number;
declare function b2Swap<T>(a: T[], b: T[]): void;
declare const b2IsValid: typeof isFinite;
declare function b2Sq(n: number): number;
declare function b2InvSqrt(n: number): number;
declare const b2Sqrt: (x: number) => number;
declare const b2Pow: (x: number, y: number) => number;
declare function b2DegToRad(degrees: number): number;
declare function b2RadToDeg(radians: number): number;
declare const b2Cos: (x: number) => number;
declare const b2Sin: (x: number) => number;
declare const b2Acos: (x: number) => number;
declare const b2Asin: (x: number) => number;
declare const b2Atan2: (y: number, x: number) => number;
declare function b2NextPowerOfTwo(x: number): number;
declare function b2IsPowerOfTwo(x: number): boolean;
declare function b2Random(): number;
declare function b2RandomRange(lo: number, hi: number): number;
interface XY {
    x: number;
    y: number;
}
declare class b2Vec2 implements XY {
    x: number;
    y: number;
    static ZERO: b2Vec2;
    static UNITX: Readonly<b2Vec2>;
    static UNITY: Readonly<b2Vec2>;
    static s_t0: b2Vec2;
    static s_t1: b2Vec2;
    static s_t2: b2Vec2;
    static s_t3: b2Vec2;
    constructor(x?: number, y?: number);
    Clone(): b2Vec2;
    SetZero(): this;
    Set(x: number, y: number): this;
    Copy(other: XY): this;
    SelfAdd(v: XY): this;
    SelfAddXY(x: number, y: number): this;
    SelfSub(v: XY): this;
    SelfSubXY(x: number, y: number): this;
    SelfMul(s: number): this;
    SelfMulAdd(s: number, v: XY): this;
    SelfMulSub(s: number, v: XY): this;
    Dot(v: XY): number;
    Cross(v: XY): number;
    Length(): number;
    LengthSquared(): number;
    Normalize(): number;
    SelfNormalize(): this;
    SelfRotate(radians: number): this;
    SelfRotateCosSin(c: number, s: number): this;
    IsValid(): boolean;
    SelfCrossVS(s: number): this;
    SelfCrossSV(s: number): this;
    SelfMinV(v: XY): this;
    SelfMaxV(v: XY): this;
    SelfAbs(): this;
    SelfNeg(): this;
    SelfSkew(): this;
    static MakeArray(length: number): b2Vec2[];
    static AbsV<T extends XY>(v: XY, out: T): T;
    static MinV<T extends XY>(a: XY, b: XY, out: T): T;
    static MaxV<T extends XY>(a: XY, b: XY, out: T): T;
    static ClampV<T extends XY>(v: XY, lo: XY, hi: XY, out: T): T;
    static RotateV<T extends XY>(v: XY, radians: number, out: T): T;
    static DotVV(a: XY, b: XY): number;
    static CrossVV(a: XY, b: XY): number;
    static CrossVS<T extends XY>(v: XY, s: number, out: T): T;
    static CrossVOne<T extends XY>(v: XY, out: T): T;
    static CrossSV<T extends XY>(s: number, v: XY, out: T): T;
    static CrossOneV<T extends XY>(v: XY, out: T): T;
    static AddVV<T extends XY>(a: XY, b: XY, out: T): T;
    static SubVV<T extends XY>(a: XY, b: XY, out: T): T;
    static MulSV<T extends XY>(s: number, v: XY, out: T): T;
    static MulVS<T extends XY>(v: XY, s: number, out: T): T;
    static AddVMulSV<T extends XY>(a: XY, s: number, b: XY, out: T): T;
    static SubVMulSV<T extends XY>(a: XY, s: number, b: XY, out: T): T;
    static AddVCrossSV<T extends XY>(a: XY, s: number, v: XY, out: T): T;
    static MidVV<T extends XY>(a: XY, b: XY, out: T): T;
    static ExtVV<T extends XY>(a: XY, b: XY, out: T): T;
    static IsEqualToV(a: XY, b: XY): boolean;
    static DistanceVV(a: XY, b: XY): number;
    static DistanceSquaredVV(a: XY, b: XY): number;
    static NegV<T extends XY>(v: XY, out: T): T;
}
declare const b2Vec2_zero: Readonly<b2Vec2>;
declare class b2TypedVec2 implements b2Vec2 {
   data: Float32Array;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    constructor();
    constructor(data: Float32Array);
    constructor(x: number, y: number);
    Clone(): b2TypedVec2;
    SetZero(): this;
    Set(x: number, y: number): this;
    Copy(other: XY): this;
    SelfAdd(v: XY): this;
    SelfAddXY(x: number, y: number): this;
    SelfSub(v: XY): this;
    SelfSubXY(x: number, y: number): this;
    SelfMul(s: number): this;
    SelfMulAdd(s: number, v: XY): this;
    SelfMulSub(s: number, v: XY): this;
    Dot(v: XY): number;
    Cross(v: XY): number;
    Length(): number;
    LengthSquared(): number;
    Normalize(): number;
    SelfNormalize(): this;
    SelfRotate(radians: number): this;
    SelfRotateCosSin(c: number, s: number): this;
    IsValid(): boolean;
    SelfCrossVS(s: number): this;
    SelfCrossSV(s: number): this;
    SelfMinV(v: XY): this;
    SelfMaxV(v: XY): this;
    SelfAbs(): this;
    SelfNeg(): this;
    SelfSkew(): this;
}
interface XYZ extends XY {
    z: number;
}
declare class b2Vec3 implements XYZ {
    staticZERO: Readonly<b2Vec3>;
    statics_t0: b2Vec3;
   data: Float32Array;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get z(): number;
    set z(value: number);
    constructor();
    constructor(data: Float32Array);
    constructor(x: number, y: number, z: number);
    Clone(): b2Vec3;
    SetZero(): this;
    SetXYZ(x: number, y: number, z: number): this;
    Copy(other: XYZ): this;
    SelfNeg(): this;
    SelfAdd(v: XYZ): this;
    SelfAddXYZ(x: number, y: number, z: number): this;
    SelfSub(v: XYZ): this;
    SelfSubXYZ(x: number, y: number, z: number): this;
    SelfMul(s: number): this;
    static DotV3V3(a: XYZ, b: XYZ): number;
    static CrossV3V3<T extends XYZ>(a: XYZ, b: XYZ, out: T): T;
}
declare class b2Mat22 {
    staticIDENTITY: Readonly<b2Mat22>;
   ex: b2Vec2;
   ey: b2Vec2;
    Clone(): b2Mat22;
    static FromVV(c1: XY, c2: XY): b2Mat22;
    static FromSSSS(r1c1: number, r1c2: number, r2c1: number, r2c2: number): b2Mat22;
    static FromAngle(radians: number): b2Mat22;
    SetSSSS(r1c1: number, r1c2: number, r2c1: number, r2c2: number): this;
    SetVV(c1: XY, c2: XY): this;
    SetAngle(radians: number): this;
    Copy(other: b2Mat22): this;
    SetIdentity(): this;
    SetZero(): this;
    GetAngle(): number;
    GetInverse(out: b2Mat22): b2Mat22;
    Solve<T extends XY>(b_x: number, b_y: number, out: T): T;
    SelfAbs(): this;
    SelfInv(): this;
    SelfAddM(M: b2Mat22): this;
    SelfSubM(M: b2Mat22): this;
    static AbsM(M: b2Mat22, out: b2Mat22): b2Mat22;
    static MulMV<T extends XY>(M: b2Mat22, v: XY, out: T): T;
    static MulTMV<T extends XY>(M: b2Mat22, v: XY, out: T): T;
    static AddMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22;
    static MulMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22;
    static MulTMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22;
}
declare class b2Mat33 {
    staticIDENTITY: Readonly<b2Mat33>;
   data: Float32Array;
   ex: b2Vec3;
   ey: b2Vec3;
   ez: b2Vec3;
    Clone(): b2Mat33;
    SetVVV(c1: XYZ, c2: XYZ, c3: XYZ): this;
    Copy(other: b2Mat33): this;
    SetIdentity(): this;
    SetZero(): this;
    SelfAddM(M: b2Mat33): this;
    Solve33<T extends XYZ>(b_x: number, b_y: number, b_z: number, out: T): T;
    Solve22<T extends XY>(b_x: number, b_y: number, out: T): T;
    GetInverse22(M: b2Mat33): void;
    GetSymInverse33(M: b2Mat33): void;
    static MulM33V3<T extends XYZ>(A: b2Mat33, v: XYZ, out: T): T;
    static MulM33XYZ<T extends XYZ>(A: b2Mat33, x: number, y: number, z: number, out: T): T;
    static MulM33V2<T extends XY>(A: b2Mat33, v: XY, out: T): T;
    static MulM33XY<T extends XY>(A: b2Mat33, x: number, y: number, out: T): T;
}
declare class b2Rot {
    staticIDENTITY: Readonly<b2Rot>;
    s: number;
    c: number;
    constructor(angle?: number);
    Clone(): b2Rot;
    Copy(other: b2Rot): this;
    SetAngle(angle: number): this;
    SetIdentity(): this;
    GetAngle(): number;
    GetXAxis<T extends XY>(out: T): T;
    GetYAxis<T extends XY>(out: T): T;
    static MulRR(q: b2Rot, r: b2Rot, out: b2Rot): b2Rot;
    static MulTRR(q: b2Rot, r: b2Rot, out: b2Rot): b2Rot;
    static MulRV<T extends XY>(q: b2Rot, v: XY, out: T): T;
    static MulTRV<T extends XY>(q: b2Rot, v: XY, out: T): T;
}
declare class b2Transform {
    staticIDENTITY: Readonly<b2Transform>;
   p: b2Vec2;
   q: b2Rot;
    Clone(): b2Transform;
    Copy(other: b2Transform): this;
    SetIdentity(): this;
    SetPositionRotation(position: XY, q: Readonly<b2Rot>): this;
    SetPositionAngle(pos: XY, a: number): this;
    SetPosition(position: XY): this;
    SetPositionXY(x: number, y: number): this;
    SetRotation(rotation: Readonly<b2Rot>): this;
    SetRotationAngle(radians: number): this;
    GetPosition(): Readonly<b2Vec2>;
    GetRotation(): Readonly<b2Rot>;
    GetRotationAngle(): number;
    GetAngle(): number;
    static MulXV<T extends XY>(T: b2Transform, v: XY, out: T): T;
    static MulTXV<T extends XY>(T: b2Transform, v: XY, out: T): T;
    static MulXX(A: b2Transform, B: b2Transform, out: b2Transform): b2Transform;
    static MulTXX(A: b2Transform, B: b2Transform, out: b2Transform): b2Transform;
}
declare class b2Sweep {
   localCenter: b2Vec2;
   c0: b2Vec2;
   c: b2Vec2;
    a0: number;
    a: number;
    alpha0: number;
    Clone(): b2Sweep;
    Copy(other: b2Sweep): this;
    GetTransform(xf: b2Transform, beta: number): b2Transform;
    Advance(alpha: number): void;
    Normalize(): void;
}

interface RGB {
    r: number;
    g: number;
    b: number;
}
interface RGBA extends RGB {
    a: number;
}
declare class b2Color implements RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
    staticZERO: Readonly<b2Color>;
    staticRED: Readonly<b2Color>;
    staticGREEN: Readonly<b2Color>;
    staticBLUE: Readonly<b2Color>;
    constructor(r?: number, g?: number, b?: number, a?: number);
    Clone(): b2Color;
    Copy(other: RGBA): this;
    IsEqual(color: RGBA): boolean;
    IsZero(): boolean;
    Set(r: number, g: number, b: number, a?: number): void;
    SetByteRGB(r: number, g: number, b: number): this;
    SetByteRGBA(r: number, g: number, b: number, a: number): this;
    SetRGB(rr: number, gg: number, bb: number): this;
    SetRGBA(rr: number, gg: number, bb: number, aa: number): this;
    SelfAdd(color: RGBA): this;
    Add<T extends RGBA>(color: RGBA, out: T): T;
    SelfSub(color: RGBA): this;
    Sub<T extends RGBA>(color: RGBA, out: T): T;
    SelfMul(s: number): this;
    Mul<T extends RGBA>(s: number, out: T): T;
    Mix(mixColor: RGBA, strength: number): void;
    static MixColors(colorA: RGBA, colorB: RGBA, strength: number): void;
    MakeStyleString(alpha?: number): string;
    static MakeStyleString(r: number, g: number, b: number, a?: number): string;
}
declare enum b2DrawFlags {
    e_none = 0,
    e_shapeBit = 1,
    e_jointBit = 2,
    e_aabbBit = 4,
    e_pairBit = 8,
    e_centerOfMassBit = 16,
    e_particleBit = 32,
    e_controllerBit = 64,
    e_all = 63
}
declare abstract class b2Draw {
    m_drawFlags: b2DrawFlags;
    SetFlags(flags: b2DrawFlags): void;
    GetFlags(): b2DrawFlags;
    AppendFlags(flags: b2DrawFlags): void;
    ClearFlags(flags: b2DrawFlags): void;
    abstract PushTransform(xf: b2Transform): void;
    abstract PopTransform(xf: b2Transform): void;
    abstract DrawPolygon(vertices: XY[], vertexCount: number, color: RGBA): void;
    abstract DrawSolidPolygon(vertices: XY[], vertexCount: number, color: RGBA): void;
    abstract DrawCircle(center: XY, radius: number, color: RGBA): void;
    abstract DrawSolidCircle(center: XY, radius: number, axis: XY, color: RGBA): void;
    abstract DrawParticles(centers: XY[], radius: number, colors: RGBA[] | null, count: number): void;
    abstract DrawSegment(p1: XY, p2: XY, color: RGBA): void;
    abstract DrawTransform(xf: b2Transform): void;
    abstract DrawPoint(p: XY, size: number, color: RGBA): void;
}

declare class b2GrowableStack<T> {
    m_stack: Array<T | null>;
    m_count: number;
    constructor(N: number);
    Reset(): this;
    Push(element: T): void;
    Pop(): T | null;
    GetCount(): number;
}

declare function b2Assert(condition: boolean, ...args: any[]): void;
declare function b2Maybe<T>(value: T | undefined, def: T): T;
declare const b2_maxFloat: number;
declare const b2_epsilon: number;
declare const b2_epsilon_sq: number;
declare const b2_pi: number;
declare const b2_lengthUnitsPerMeter: number;
declare const b2_maxPolygonVertices: number;
declare const b2_maxManifoldPoints: number;
declare const b2_aabbExtension: number;
declare const b2_aabbMultiplier: number;
declare const b2_linearSlop: number;
declare const b2_angularSlop: number;
declare const b2_polygonRadius: number;
declare const b2_maxSubSteps: number;
declare const b2_maxTOIContacts: number;
declare const b2_maxLinearCorrection: number;
declare const b2_maxAngularCorrection: number;
declare const b2_maxTranslation: number;
declare const b2_maxTranslationSquared: number;
declare const b2_maxRotation: number;
declare const b2_maxRotationSquared: number;
declare const b2_baumgarte: number;
declare const b2_toiBaumgarte: number;
declare const b2_invalidParticleIndex: number;
declare const b2_maxParticleIndex: number;
declare const b2_particleStride: number;
declare const b2_minParticleWeight: number;
declare const b2_maxParticlePressure: number;
declare const b2_maxParticleForce: number;
declare const b2_maxTriadDistance: number;
declare const b2_maxTriadDistanceSquared: number;
declare const b2_minParticleSystemBufferCapacity: number;
declare const b2_barrierCollisionTime: number;
declare const b2_timeToSleep: number;
declare const b2_linearSleepTolerance: number;
declare const b2_angularSleepTolerance: number;
declare class b2Version {
    major: number;
    minor: number;
    revision: number;
    constructor(major?: number, minor?: number, revision?: number);
    toString(): string;
}
declare const b2_version: b2Version;
declare const b2_branch: string;
declare const b2_commit: string;
declare function b2ParseInt(v: string): number;
declare function b2ParseUInt(v: string): number;
declare function b2MakeArray<T>(length: number, init: (i: number) => T): T[];
declare function b2MakeNullArray<T>(length: number): Array<T | null>;
declare function b2MakeNumberArray(length: number, init?: number): number[];

declare function b2Alloc(size: number): any;
declare function b2Free(mem: any): void;
declare function b2Log(message: string, ...args: any[]): void;

declare class b2StackAllocator {
}

declare class b2Timer {
    m_start: number;
    Reset(): b2Timer;
    GetMilliseconds(): number;
}
declare class b2Counter {
    m_count: number;
    m_min_count: number;
    m_max_count: number;
    GetCount(): number;
    GetMinCount(): number;
    GetMaxCount(): number;
    ResetCount(): number;
    ResetMinCount(): void;
    ResetMaxCount(): void;
    Increment(): void;
    Decrement(): void;
}

declare class b2DistanceProxy {
   m_buffer: b2Vec2[];
    m_vertices: b2Vec2[];
    m_count: number;
    m_radius: number;
    Copy(other: Readonly<b2DistanceProxy>): this;
    Reset(): b2DistanceProxy;
    SetShape(shape: b2Shape, index: number): void;
    SetVerticesRadius(vertices: b2Vec2[], count: number, radius: number): void;
    GetSupport(d: b2Vec2): number;
    GetSupportVertex(d: b2Vec2): b2Vec2;
    GetVertexCount(): number;
    GetVertex(index: number): b2Vec2;
}
declare class b2SimplexCache {
    metric: number;
    count: number;
   indexA: [number, number, number];
   indexB: [number, number, number];
    Reset(): b2SimplexCache;
}
declare class b2DistanceInput {
   proxyA: b2DistanceProxy;
   proxyB: b2DistanceProxy;
   transformA: b2Transform;
   transformB: b2Transform;
    useRadii: boolean;
    Reset(): b2DistanceInput;
}
declare class b2DistanceOutput {
   pointA: b2Vec2;
   pointB: b2Vec2;
    distance: number;
    iterations: number;
    Reset(): b2DistanceOutput;
}
declare class b2ShapeCastInput {
   proxyA: b2DistanceProxy;
   proxyB: b2DistanceProxy;
   transformA: b2Transform;
   transformB: b2Transform;
   translationB: b2Vec2;
}
declare class b2ShapeCastOutput {
   point: b2Vec2;
   normal: b2Vec2;
    lambda: number;
    iterations: number;
}
declare let b2_gjkCalls: number;
declare let b2_gjkIters: number;
declare let b2_gjkMaxIters: number;
declare function b2_gjk_reset(): void;
declare class b2SimplexVertex {
   wA: b2Vec2;
   wB: b2Vec2;
   w: b2Vec2;
    a: number;
    indexA: number;
    indexB: number;
    Copy(other: b2SimplexVertex): b2SimplexVertex;
}
declare class b2Simplex {
   m_v1: b2SimplexVertex;
   m_v2: b2SimplexVertex;
   m_v3: b2SimplexVertex;
   m_vertices: b2SimplexVertex[];
    m_count: number;
    constructor();
    ReadCache(cache: b2SimplexCache, proxyA: b2DistanceProxy, transformA: b2Transform, proxyB: b2DistanceProxy, transformB: b2Transform): void;
    WriteCache(cache: b2SimplexCache): void;
    GetSearchDirection(out: b2Vec2): b2Vec2;
    GetClosestPoint(out: b2Vec2): b2Vec2;
    GetWitnessPoints(pA: b2Vec2, pB: b2Vec2): void;
    GetMetric(): number;
    Solve2(): void;
    Solve3(): void;
    private static s_e12;
    private static s_e13;
    private static s_e23;
}
declare function b2Distance(output: b2DistanceOutput, cache: b2SimplexCache, input: b2DistanceInput): void;
declare function b2ShapeCast(output: b2ShapeCastOutput, input: b2ShapeCastInput): boolean;

declare class b2MassData {
    mass: number;
   center: b2Vec2;
    I: number;
}
declare enum b2ShapeType {
    e_unknown = -1,
    e_circleShape = 0,
    e_edgeShape = 1,
    e_polygonShape = 2,
    e_chainShape = 3,
    e_shapeTypeCount = 4
}
declare abstract class b2Shape {
   m_type: b2ShapeType;
    m_radius: number;
    constructor(type: b2ShapeType, radius: number);
    abstract Clone(): b2Shape;
    Copy(other: b2Shape): b2Shape;
    GetType(): b2ShapeType;
    abstract GetChildCount(): number;
    abstract TestPoint(xf: b2Transform, p: XY): boolean;
    abstract ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number;
    abstract RayCast(output: b2RayCastOutput, input: b2RayCastInput, transform: b2Transform, childIndex: number): boolean;
    abstract ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    abstract ComputeMass(massData: b2MassData, density: number): void;
    abstract SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    abstract ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    abstract Dump(log: (format: string, ...args: any[]) => void): void;
}

declare enum b2ContactFeatureType {
    e_vertex = 0,
    e_face = 1
}
declare class b2ContactFeature {
    private _key;
    private _key_invalid;
    private _indexA;
    private _indexB;
    private _typeA;
    private _typeB;
    get key(): number;
    set key(value: number);
    get indexA(): number;
    set indexA(value: number);
    get indexB(): number;
    set indexB(value: number);
    get typeA(): number;
    set typeA(value: number);
    get typeB(): number;
    set typeB(value: number);
}
declare class b2ContactID {
   cf: b2ContactFeature;
    Copy(o: b2ContactID): b2ContactID;
    Clone(): b2ContactID;
    get key(): number;
    set key(value: number);
}
declare class b2ManifoldPoint {
   localPoint: b2Vec2;
    normalImpulse: number;
    tangentImpulse: number;
   id: b2ContactID;
    static MakeArray(length: number): b2ManifoldPoint[];
    Reset(): void;
    Copy(o: b2ManifoldPoint): b2ManifoldPoint;
}
declare enum b2ManifoldType {
    e_unknown = -1,
    e_circles = 0,
    e_faceA = 1,
    e_faceB = 2
}
declare class b2Manifold {
   points: b2ManifoldPoint[];
   localNormal: b2Vec2;
   localPoint: b2Vec2;
    type: b2ManifoldType;
    pointCount: number;
    Reset(): void;
    Copy(o: b2Manifold): b2Manifold;
    Clone(): b2Manifold;
}
declare class b2WorldManifold {
   normal: b2Vec2;
   points: b2Vec2[];
   separations: number[];
    private static Initialize_s_pointA;
    private static Initialize_s_pointB;
    private static Initialize_s_cA;
    private static Initialize_s_cB;
    private static Initialize_s_planePoint;
    private static Initialize_s_clipPoint;
    Initialize(manifold: b2Manifold, xfA: b2Transform, radiusA: number, xfB: b2Transform, radiusB: number): void;
}
declare enum b2PointState {
    b2_nullState = 0,
    b2_addState = 1,
    b2_persistState = 2,
    b2_removeState = 3
}
declare function b2GetPointStates(state1: b2PointState[], state2: b2PointState[], manifold1: b2Manifold, manifold2: b2Manifold): void;
declare class b2ClipVertex {
   v: b2Vec2;
   id: b2ContactID;
    static MakeArray(length: number): b2ClipVertex[];
    Copy(other: b2ClipVertex): b2ClipVertex;
}
declare class b2RayCastInput {
   p1: b2Vec2;
   p2: b2Vec2;
    maxFraction: number;
    Copy(o: b2RayCastInput): b2RayCastInput;
}
declare class b2RayCastOutput {
   normal: b2Vec2;
    fraction: number;
    Copy(o: b2RayCastOutput): b2RayCastOutput;
}
declare class b2AABB {
   lowerBound: b2Vec2;
   upperBound: b2Vec2;
    privatem_cache_center;
    privatem_cache_extent;
    Copy(o: b2AABB): b2AABB;
    IsValid(): boolean;
    GetCenter(): b2Vec2;
    GetExtents(): b2Vec2;
    GetPerimeter(): number;
    Combine1(aabb: b2AABB): b2AABB;
    Combine2(aabb1: b2AABB, aabb2: b2AABB): b2AABB;
    static Combine(aabb1: b2AABB, aabb2: b2AABB, out: b2AABB): b2AABB;
    Contains(aabb: b2AABB): boolean;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput): boolean;
    TestContain(point: XY): boolean;
    TestOverlap(other: b2AABB): boolean;
}
declare function b2TestOverlapAABB(a: b2AABB, b: b2AABB): boolean;
declare function b2ClipSegmentToLine(vOut: [b2ClipVertex, b2ClipVertex], vIn: [b2ClipVertex, b2ClipVertex], normal: b2Vec2, offset: number, vertexIndexA: number): number;
declare function b2TestOverlapShape(shapeA: b2Shape, indexA: number, shapeB: b2Shape, indexB: number, xfA: b2Transform, xfB: b2Transform): boolean;

declare class b2TreeNode<T> {
   m_id: number;
   aabb: b2AABB;
    private _userData;
    get userData(): T;
    set userData(value: T);
    parent: b2TreeNode<T> | null;
    child1: b2TreeNode<T> | null;
    child2: b2TreeNode<T> | null;
    height: number;
    moved: boolean;
    constructor(id?: number);
    Reset(): void;
    IsLeaf(): boolean;
}
declare class b2DynamicTree<T> {
    m_root: b2TreeNode<T> | null;
    m_freeList: b2TreeNode<T> | null;
    m_insertionCount: number;
   m_stack: b2GrowableStack<b2TreeNode<T> | null>;
    statics_r: b2Vec2;
    statics_v: b2Vec2;
    statics_abs_v: b2Vec2;
    statics_segmentAABB: b2AABB;
    statics_subInput: b2RayCastInput;
    statics_combinedAABB: b2AABB;
    statics_aabb: b2AABB;
    Query(aabb: b2AABB, callback: (node: b2TreeNode<T>) => boolean): void;
    QueryPoint(point: XY, callback: (node: b2TreeNode<T>) => boolean): void;
    RayCast(input: b2RayCastInput, callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number): void;
    static s_node_id: number;
    AllocateNode(): b2TreeNode<T>;
    FreeNode(node: b2TreeNode<T>): void;
    CreateProxy(aabb: b2AABB, userData: T): b2TreeNode<T>;
    DestroyProxy(node: b2TreeNode<T>): void;
    private static MoveProxy_s_fatAABB;
    private static MoveProxy_s_hugeAABB;
    MoveProxy(node: b2TreeNode<T>, aabb: b2AABB, displacement: b2Vec2): boolean;
    InsertLeaf(leaf: b2TreeNode<T>): void;
    RemoveLeaf(leaf: b2TreeNode<T>): void;
    Balance(A: b2TreeNode<T>): b2TreeNode<T>;
    GetHeight(): number;
    private static GetAreaNode;
    GetAreaRatio(): number;
    static ComputeHeightNode<T>(node: b2TreeNode<T> | null): number;
    ComputeHeight(): number;
    ValidateStructure(node: b2TreeNode<T> | null): void;
    ValidateMetrics(node: b2TreeNode<T> | null): void;
    Validate(): void;
    private static GetMaxBalanceNode;
    GetMaxBalance(): number;
    RebuildBottomUp(): void;
    private static ShiftOriginNode;
    ShiftOrigin(newOrigin: XY): void;
}

declare class b2Pair<T> {
    proxyA: b2TreeNode<T>;
    proxyB: b2TreeNode<T>;
    constructor(proxyA: b2TreeNode<T>, proxyB: b2TreeNode<T>);
}
declare class b2BroadPhase<T> {
   m_tree: b2DynamicTree<T>;
    m_proxyCount: number;
    m_moveCount: number;
   m_moveBuffer: Array<b2TreeNode<T> | null>;
    m_pairCount: number;
   m_pairBuffer: Array<b2Pair<T>>;
    CreateProxy(aabb: b2AABB, userData: T): b2TreeNode<T>;
    DestroyProxy(proxy: b2TreeNode<T>): void;
    MoveProxy(proxy: b2TreeNode<T>, aabb: b2AABB, displacement: b2Vec2): void;
    TouchProxy(proxy: b2TreeNode<T>): void;
    GetProxyCount(): number;
    UpdatePairs(callback: (a: T, b: T) => void): void;
    Query(aabb: b2AABB, callback: (node: b2TreeNode<T>) => boolean): void;
    QueryPoint(point: XY, callback: (node: b2TreeNode<T>) => boolean): void;
    RayCast(input: b2RayCastInput, callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number): void;
    GetTreeHeight(): number;
    GetTreeBalance(): number;
    GetTreeQuality(): number;
    ShiftOrigin(newOrigin: XY): void;
    BufferMove(proxy: b2TreeNode<T>): void;
    UnBufferMove(proxy: b2TreeNode<T>): void;
}

declare class b2EdgeShape extends b2Shape {
   m_vertex1: b2Vec2;
   m_vertex2: b2Vec2;
   m_vertex0: b2Vec2;
   m_vertex3: b2Vec2;
    m_oneSided: boolean;
    constructor();
    SetOneSided(v0: XY, v1: XY, v2: XY, v3: XY): b2EdgeShape;
    SetTwoSided(v1: XY, v2: XY): b2EdgeShape;
    Clone(): b2EdgeShape;
    Copy(other: b2EdgeShape): b2EdgeShape;
    GetChildCount(): number;
    TestPoint(xf: b2Transform, p: XY): boolean;
    private static ComputeDistance_s_v1;
    private static ComputeDistance_s_v2;
    private static ComputeDistance_s_d;
    private static ComputeDistance_s_s;
    ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number;
    private static RayCast_s_p1;
    private static RayCast_s_p2;
    private static RayCast_s_d;
    private static RayCast_s_e;
    private static RayCast_s_q;
    private static RayCast_s_r;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean;
    private static ComputeAABB_s_v1;
    private static ComputeAABB_s_v2;
    ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    ComputeMass(massData: b2MassData, density: number): void;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

declare class b2ChainShape extends b2Shape {
    m_vertices: b2Vec2[];
    m_count: number;
   m_prevVertex: b2Vec2;
   m_nextVertex: b2Vec2;
    constructor();
    CreateLoop(vertices: XY[]): b2ChainShape;
    CreateLoop(vertices: XY[], count: number): b2ChainShape;
    CreateLoop(vertices: number[]): b2ChainShape;
    private _CreateLoop;
    CreateChain(vertices: XY[], prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;
    CreateChain(vertices: XY[], count: number, prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;
    CreateChain(vertices: number[], prevVertex: Readonly<XY>, nextVertex: Readonly<XY>): b2ChainShape;
    private _CreateChain;
    Clone(): b2ChainShape;
    Copy(other: b2ChainShape): b2ChainShape;
    GetChildCount(): number;
    GetChildEdge(edge: b2EdgeShape, index: number): void;
    TestPoint(xf: b2Transform, p: XY): boolean;
    private static ComputeDistance_s_edgeShape;
    ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number;
    private static RayCast_s_edgeShape;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean;
    private static ComputeAABB_s_v1;
    private static ComputeAABB_s_v2;
    private static ComputeAABB_s_lower;
    private static ComputeAABB_s_upper;
    ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    ComputeMass(massData: b2MassData, density: number): void;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

declare class b2CircleShape extends b2Shape {
   m_p: b2Vec2;
    constructor(radius?: number);
    Set(position: XY, radius?: number): this;
    Clone(): b2CircleShape;
    Copy(other: b2CircleShape): b2CircleShape;
    GetChildCount(): number;
    private static TestPoint_s_center;
    private static TestPoint_s_d;
    TestPoint(transform: b2Transform, p: XY): boolean;
    private static ComputeDistance_s_center;
    ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number;
    private static RayCast_s_position;
    private static RayCast_s_s;
    private static RayCast_s_r;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, transform: b2Transform, childIndex: number): boolean;
    private static ComputeAABB_s_p;
    ComputeAABB(aabb: b2AABB, transform: b2Transform, childIndex: number): void;
    ComputeMass(massData: b2MassData, density: number): void;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

declare class b2PolygonShape extends b2Shape {
   m_centroid: b2Vec2;
    m_vertices: b2Vec2[];
    m_normals: b2Vec2[];
    m_count: number;
    constructor();
    Clone(): b2PolygonShape;
    Copy(other: b2PolygonShape): b2PolygonShape;
    GetChildCount(): number;
    private static Set_s_r;
    private static Set_s_v;
    Set(vertices: XY[]): b2PolygonShape;
    Set(vertices: XY[], count: number): b2PolygonShape;
    Set(vertices: number[]): b2PolygonShape;
    _Set(vertices: (index: number) => XY, count: number): b2PolygonShape;
    SetAsBox(hx: number, hy: number, center?: XY, angle?: number): b2PolygonShape;
    private static TestPoint_s_pLocal;
    TestPoint(xf: b2Transform, p: XY): boolean;
    private static ComputeDistance_s_pLocal;
    private static ComputeDistance_s_normalForMaxDistance;
    private static ComputeDistance_s_minDistance;
    private static ComputeDistance_s_distance;
    ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number;
    private static RayCast_s_p1;
    private static RayCast_s_p2;
    private static RayCast_s_d;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean;
    private static ComputeAABB_s_v;
    ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    private static ComputeMass_s_center;
    private static ComputeMass_s_s;
    private static ComputeMass_s_e1;
    private static ComputeMass_s_e2;
    ComputeMass(massData: b2MassData, density: number): void;
    private static Validate_s_e;
    private static Validate_s_v;
    Validate(): boolean;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    private static ComputeSubmergedArea_s_normalL;
    private static ComputeSubmergedArea_s_md;
    private static ComputeSubmergedArea_s_intoVec;
    private static ComputeSubmergedArea_s_outoVec;
    private static ComputeSubmergedArea_s_center;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static ComputeCentroid_s_s;
    private static ComputeCentroid_s_p1;
    private static ComputeCentroid_s_p2;
    private static ComputeCentroid_s_p3;
    private static ComputeCentroid_s_e1;
    private static ComputeCentroid_s_e2;
    static ComputeCentroid(vs: b2Vec2[], count: number, out: b2Vec2): b2Vec2;
}

declare function b2CollideCircles(manifold: b2Manifold, circleA: b2CircleShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void;
declare function b2CollidePolygonAndCircle(manifold: b2Manifold, polygonA: b2PolygonShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void;

declare function b2CollideEdgeAndCircle(manifold: b2Manifold, edgeA: b2EdgeShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void;
declare function b2CollideEdgeAndPolygon(manifold: b2Manifold, edgeA: b2EdgeShape, xfA: b2Transform, polygonB: b2PolygonShape, xfB: b2Transform): void;

declare function b2CollidePolygons(manifold: b2Manifold, polyA: b2PolygonShape, xfA: b2Transform, polyB: b2PolygonShape, xfB: b2Transform): void;

declare let b2_toiTime: number;
declare let b2_toiMaxTime: number;
declare let b2_toiCalls: number;
declare let b2_toiIters: number;
declare let b2_toiMaxIters: number;
declare let b2_toiRootIters: number;
declare let b2_toiMaxRootIters: number;
declare function b2_toi_reset(): void;
declare class b2TOIInput {
   proxyA: b2DistanceProxy;
   proxyB: b2DistanceProxy;
   sweepA: b2Sweep;
   sweepB: b2Sweep;
    tMax: number;
}
declare enum b2TOIOutputState {
    e_unknown = 0,
    e_failed = 1,
    e_overlapped = 2,
    e_touching = 3,
    e_separated = 4
}
declare class b2TOIOutput {
    state: b2TOIOutputState;
    t: number;
}
declare enum b2SeparationFunctionType {
    e_unknown = -1,
    e_points = 0,
    e_faceA = 1,
    e_faceB = 2
}
declare class b2SeparationFunction {
    m_proxyA: b2DistanceProxy;
    m_proxyB: b2DistanceProxy;
   m_sweepA: b2Sweep;
   m_sweepB: b2Sweep;
    m_type: b2SeparationFunctionType;
   m_localPoint: b2Vec2;
   m_axis: b2Vec2;
    Initialize(cache: b2SimplexCache, proxyA: b2DistanceProxy, sweepA: b2Sweep, proxyB: b2DistanceProxy, sweepB: b2Sweep, t1: number): number;
    FindMinSeparation(indexA: [number], indexB: [number], t: number): number;
    Evaluate(indexA: number, indexB: number, t: number): number;
}
declare function b2TimeOfImpact(output: b2TOIOutput, input: b2TOIInput): void;

interface b2IFilter {
    categoryBits: number;
    maskBits: number;
    groupIndex?: number;
}
declare class b2Filter implements b2IFilter {
    staticDEFAULT: Readonly<b2Filter>;
    categoryBits: number;
    maskBits: number;
    groupIndex: number;
    Clone(): b2Filter;
    Copy(other: b2IFilter): this;
}
interface b2IFixtureDef {
    shape: b2Shape;
    userData?: any;
    friction?: number;
    restitution?: number;
    restitutionThreshold?: number;
    density?: number;
    isSensor?: boolean;
    filter?: b2IFilter;
}
declare class b2FixtureDef implements b2IFixtureDef {
    shape: b2Shape;
    userData: any;
    friction: number;
    restitution: number;
    restitutionThreshold: number;
    density: number;
    isSensor: boolean;
   filter: b2Filter;
}
declare class b2FixtureProxy {
   aabb: b2AABB;
   fixture: b2Fixture;
   childIndex: number;
    treeNode: b2TreeNode<b2FixtureProxy>;
    constructor(fixture: b2Fixture, childIndex: number);
    Reset(): void;
    Touch(): void;
    private static Synchronize_s_aabb1;
    private static Synchronize_s_aabb2;
    private static Synchronize_s_displacement;
    Synchronize(transform1: b2Transform, transform2: b2Transform): void;
}
declare class b2Fixture {
    m_density: number;
    m_next: b2Fixture | null;
   m_body: b2Body;
   m_shape: b2Shape;
    m_friction: number;
    m_restitution: number;
    m_restitutionThreshold: number;
   m_proxies: b2FixtureProxy[];
    get m_proxyCount(): number;
   m_filter: b2Filter;
    m_isSensor: boolean;
    m_userData: any;
    constructor(body: b2Body, def: b2IFixtureDef);
    Reset(): void;
    GetType(): b2ShapeType;
    GetShape(): b2Shape;
    SetSensor(sensor: boolean): void;
    IsSensor(): boolean;
    SetFilterData(filter: b2Filter): void;
    GetFilterData(): Readonly<b2Filter>;
    Refilter(): void;
    GetBody(): b2Body;
    GetNext(): b2Fixture | null;
    GetUserData(): any;
    SetUserData(data: any): void;
    TestPoint(p: XY): boolean;
    ComputeDistance(p: b2Vec2, normal: b2Vec2, childIndex: number): number;
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, childIndex: number): boolean;
    GetMassData(massData?: b2MassData): b2MassData;
    SetDensity(density: number): void;
    GetDensity(): number;
    GetFriction(): number;
    SetFriction(friction: number): void;
    GetRestitution(): number;
    SetRestitution(restitution: number): void;
    GetRestitutionThreshold(): number;
    SetRestitutionThreshold(threshold: number): void;
    GetAABB(childIndex: number): Readonly<b2AABB>;
    Dump(log: (format: string, ...args: any[]) => void, bodyIndex: number): void;
    CreateProxies(): void;
    DestroyProxies(): void;
    TouchProxies(): void;
    SynchronizeProxies(transform1: b2Transform, transform2: b2Transform): void;
}

/**
 * The particle type. Can be combined with the | operator.
 */
declare enum b2ParticleFlag {
    b2_waterParticle = 0,
    b2_zombieParticle = 2,
    b2_wallParticle = 4,
    b2_springParticle = 8,
    b2_elasticParticle = 16,
    b2_viscousParticle = 32,
    b2_powderParticle = 64,
    b2_tensileParticle = 128,
    b2_colorMixingParticle = 256,
    b2_destructionListenerParticle = 512,
    b2_barrierParticle = 1024,
    b2_staticPressureParticle = 2048,
    b2_reactiveParticle = 4096,
    b2_repulsiveParticle = 8192,
    b2_fixtureContactListenerParticle = 16384,
    b2_particleContactListenerParticle = 32768,
    b2_fixtureContactFilterParticle = 65536,
    b2_particleContactFilterParticle = 131072
}
interface b2IParticleDef {
    flags?: b2ParticleFlag;
    position?: XY;
    velocity?: XY;
    color?: RGBA;
    lifetime?: number;
    userData?: any;
    group?: b2ParticleGroup | null;
}
declare class b2ParticleDef implements b2IParticleDef {
    flags: b2ParticleFlag;
   position: b2Vec2;
   velocity: b2Vec2;
   color: b2Color;
    lifetime: number;
    userData: any;
    group: b2ParticleGroup | null;
}
declare function b2CalculateParticleIterations(gravity: number, radius: number, timeStep: number): number;
declare class b2ParticleHandle {
    m_index: number;
    GetIndex(): number;
    SetIndex(index: number): void;
}

declare class b2Profile {
    step: number;
    collide: number;
    solve: number;
    solveInit: number;
    solveVelocity: number;
    solvePosition: number;
    broadphase: number;
    solveTOI: number;
    Reset(): this;
}
declare class b2TimeStep {
    dt: number;
    inv_dt: number;
    dtRatio: number;
    velocityIterations: number;
    positionIterations: number;
    particleIterations: number;
    warmStarting: boolean;
    Copy(step: b2TimeStep): b2TimeStep;
}
declare class b2Position {
   c: b2Vec2;
    a: number;
    static MakeArray(length: number): b2Position[];
}
declare class b2Velocity {
   v: b2Vec2;
    w: number;
    static MakeArray(length: number): b2Velocity[];
}
declare class b2SolverData {
   step: b2TimeStep;
    positions: b2Position[];
    velocities: b2Velocity[];
}

interface b2IDistanceJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    length?: number;
    minLength?: number;
    maxLength?: number;
    stiffness?: number;
    damping?: number;
}
declare class b2DistanceJointDef extends b2JointDef implements b2IDistanceJointDef {
   localAnchorA: b2Vec2;
   localAnchorB: b2Vec2;
    length: number;
    minLength: number;
    maxLength: number;
    stiffness: number;
    damping: number;
    constructor();
    Initialize(b1: b2Body, b2: b2Body, anchor1: XY, anchor2: XY): void;
}
declare class b2DistanceJoint extends b2Joint {
    m_stiffness: number;
    m_damping: number;
    m_bias: number;
    m_length: number;
    m_minLength: number;
    m_maxLength: number;
   m_localAnchorA: b2Vec2;
   m_localAnchorB: b2Vec2;
    m_gamma: number;
    m_impulse: number;
    m_lowerImpulse: number;
    m_upperImpulse: number;
    m_indexA: number;
    m_indexB: number;
   m_u: b2Vec2;
   m_rA: b2Vec2;
   m_rB: b2Vec2;
   m_localCenterA: b2Vec2;
   m_localCenterB: b2Vec2;
    m_currentLength: number;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    m_softMass: number;
    m_mass: number;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_lalcA: b2Vec2;
   m_lalcB: b2Vec2;
    constructor(def: b2IDistanceJointDef);
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    SetLength(length: number): number;
    GetLength(): number;
    SetMinLength(minLength: number): number;
    SetMaxLength(maxLength: number): number;
    GetCurrentLength(): number;
    SetStiffness(stiffness: number): void;
    GetStiffness(): number;
    SetDamping(damping: number): void;
    GetDamping(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_vpA;
    private static SolveVelocityConstraints_s_vpB;
    private static SolveVelocityConstraints_s_P;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_P;
    SolvePositionConstraints(data: b2SolverData): boolean;
    private static Draw_s_pA;
    private static Draw_s_pB;
    private static Draw_s_axis;
    private static Draw_s_c1;
    private static Draw_s_c2;
    private static Draw_s_c3;
    private static Draw_s_c4;
    private static Draw_s_pRest;
    private static Draw_s_pMin;
    private static Draw_s_pMax;
    Draw(draw: b2Draw): void;
}

interface b2IFrictionJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    maxForce?: number;
    maxTorque?: number;
}
declare class b2FrictionJointDef extends b2JointDef implements b2IFrictionJointDef {
   localAnchorA: b2Vec2;
   localAnchorB: b2Vec2;
    maxForce: number;
    maxTorque: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2): void;
}
declare class b2FrictionJoint extends b2Joint {
   m_localAnchorA: b2Vec2;
   m_localAnchorB: b2Vec2;
   m_linearImpulse: b2Vec2;
    m_angularImpulse: number;
    m_maxForce: number;
    m_maxTorque: number;
    m_indexA: number;
    m_indexB: number;
   m_rA: b2Vec2;
   m_rB: b2Vec2;
   m_localCenterA: b2Vec2;
   m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
   m_linearMass: b2Mat22;
    m_angularMass: number;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_lalcA: b2Vec2;
   m_lalcB: b2Vec2;
   m_K: b2Mat22;
    constructor(def: b2IFrictionJointDef);
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot_v2;
    private static SolveVelocityConstraints_s_impulseV;
    private static SolveVelocityConstraints_s_oldImpulseV;
    SolveVelocityConstraints(data: b2SolverData): void;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    SetMaxForce(force: number): void;
    GetMaxForce(): number;
    SetMaxTorque(torque: number): void;
    GetMaxTorque(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

interface b2IPrismaticJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    localAxisA?: XY;
    referenceAngle?: number;
    enableLimit?: boolean;
    lowerTranslation?: number;
    upperTranslation?: number;
    enableMotor?: boolean;
    maxMotorForce?: number;
    motorSpeed?: number;
}
declare class b2PrismaticJointDef extends b2JointDef implements b2IPrismaticJointDef {
   localAnchorA: b2Vec2;
   localAnchorB: b2Vec2;
   localAxisA: b2Vec2;
    referenceAngle: number;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
    enableMotor: boolean;
    maxMotorForce: number;
    motorSpeed: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2, axis: b2Vec2): void;
}
declare class b2PrismaticJoint extends b2Joint {
   m_localAnchorA: b2Vec2;
   m_localAnchorB: b2Vec2;
   m_localXAxisA: b2Vec2;
   m_localYAxisA: b2Vec2;
    m_referenceAngle: number;
   m_impulse: b2Vec2;
    m_motorImpulse: number;
    m_lowerImpulse: number;
    m_upperImpulse: number;
    m_lowerTranslation: number;
    m_upperTranslation: number;
    m_maxMotorForce: number;
    m_motorSpeed: number;
    m_enableLimit: boolean;
    m_enableMotor: boolean;
    m_indexA: number;
    m_indexB: number;
   m_localCenterA: b2Vec2;
   m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
   m_axis: b2Vec2;
   m_perp: b2Vec2;
    m_s1: number;
    m_s2: number;
    m_a1: number;
    m_a2: number;
   m_K: b2Mat22;
   m_K3: b2Mat33;
   m_K2: b2Mat22;
    m_translation: number;
    m_axialMass: number;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_lalcA: b2Vec2;
   m_lalcB: b2Vec2;
   m_rA: b2Vec2;
   m_rB: b2Vec2;
    constructor(def: b2IPrismaticJointDef);
    private static InitVelocityConstraints_s_d;
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_P;
    private static SolveVelocityConstraints_s_df;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_d;
    private static SolvePositionConstraints_s_impulse;
    private static SolvePositionConstraints_s_impulse1;
    private static SolvePositionConstraints_s_P;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    GetLocalAxisA(): Readonly<b2Vec2>;
    GetReferenceAngle(): number;
    private static GetJointTranslation_s_pA;
    private static GetJointTranslation_s_pB;
    private static GetJointTranslation_s_d;
    private static GetJointTranslation_s_axis;
    GetJointTranslation(): number;
    GetJointSpeed(): number;
    IsLimitEnabled(): boolean;
    EnableLimit(flag: boolean): void;
    GetLowerLimit(): number;
    GetUpperLimit(): number;
    SetLimits(lower: number, upper: number): void;
    IsMotorEnabled(): boolean;
    EnableMotor(flag: boolean): void;
    SetMotorSpeed(speed: number): void;
    GetMotorSpeed(): number;
    SetMaxMotorForce(force: number): void;
    GetMaxMotorForce(): number;
    GetMotorForce(inv_dt: number): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static Draw_s_pA;
    private static Draw_s_pB;
    private static Draw_s_axis;
    private static Draw_s_c1;
    private static Draw_s_c2;
    private static Draw_s_c3;
    private static Draw_s_c4;
    private static Draw_s_c5;
    private static Draw_s_lower;
    private static Draw_s_upper;
    private static Draw_s_perp;
    Draw(draw: b2Draw): void;
}

interface b2IRevoluteJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    referenceAngle?: number;
    enableLimit?: boolean;
    lowerAngle?: number;
    upperAngle?: number;
    enableMotor?: boolean;
    motorSpeed?: number;
    maxMotorTorque?: number;
}
declare class b2RevoluteJointDef extends b2JointDef implements b2IRevoluteJointDef {
   localAnchorA: b2Vec2;
   localAnchorB: b2Vec2;
    referenceAngle: number;
    enableLimit: boolean;
    lowerAngle: number;
    upperAngle: number;
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorTorque: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: XY): void;
}
declare class b2RevoluteJoint extends b2Joint {
   m_localAnchorA: b2Vec2;
   m_localAnchorB: b2Vec2;
   m_impulse: b2Vec2;
    m_motorImpulse: number;
    m_lowerImpulse: number;
    m_upperImpulse: number;
    m_enableMotor: boolean;
    m_maxMotorTorque: number;
    m_motorSpeed: number;
    m_enableLimit: boolean;
    m_referenceAngle: number;
    m_lowerAngle: number;
    m_upperAngle: number;
    m_indexA: number;
    m_indexB: number;
   m_rA: b2Vec2;
   m_rB: b2Vec2;
   m_localCenterA: b2Vec2;
   m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
   m_K: b2Mat22;
    m_angle: number;
    m_axialMass: number;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_lalcA: b2Vec2;
   m_lalcB: b2Vec2;
    constructor(def: b2IRevoluteJointDef);
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot_v2;
    private static SolveVelocityConstraints_s_impulse_v2;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_C_v2;
    private static SolvePositionConstraints_s_impulse;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    GetReferenceAngle(): number;
    GetJointAngle(): number;
    GetJointSpeed(): number;
    IsMotorEnabled(): boolean;
    EnableMotor(flag: boolean): void;
    GetMotorTorque(inv_dt: number): number;
    GetMotorSpeed(): number;
    SetMaxMotorTorque(torque: number): void;
    GetMaxMotorTorque(): number;
    IsLimitEnabled(): boolean;
    EnableLimit(flag: boolean): void;
    GetLowerLimit(): number;
    GetUpperLimit(): number;
    SetLimits(lower: number, upper: number): void;
    SetMotorSpeed(speed: number): void;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static Draw_s_pA;
    private static Draw_s_pB;
    private static Draw_s_c1;
    private static Draw_s_c2;
    private static Draw_s_c3;
    private static Draw_s_c4;
    private static Draw_s_c5;
    private static Draw_s_color_;
    private static Draw_s_r;
    private static Draw_s_rlo;
    private static Draw_s_rhi;
    Draw(draw: b2Draw): void;
}

interface b2IGearJointDef extends b2IJointDef {
    joint1: b2RevoluteJoint | b2PrismaticJoint;
    joint2: b2RevoluteJoint | b2PrismaticJoint;
    ratio?: number;
}
declare class b2GearJointDef extends b2JointDef implements b2IGearJointDef {
    joint1: b2RevoluteJoint | b2PrismaticJoint;
    joint2: b2RevoluteJoint | b2PrismaticJoint;
    ratio: number;
    constructor();
}
declare class b2GearJoint extends b2Joint {
    m_joint1: b2RevoluteJoint | b2PrismaticJoint;
    m_joint2: b2RevoluteJoint | b2PrismaticJoint;
    m_typeA: b2JointType;
    m_typeB: b2JointType;
    m_bodyC: b2Body;
    m_bodyD: b2Body;
   m_localAnchorA: b2Vec2;
   m_localAnchorB: b2Vec2;
   m_localAnchorC: b2Vec2;
   m_localAnchorD: b2Vec2;
   m_localAxisC: b2Vec2;
   m_localAxisD: b2Vec2;
    m_referenceAngleA: number;
    m_referenceAngleB: number;
    m_constant: number;
    m_ratio: number;
    m_impulse: number;
    m_indexA: number;
    m_indexB: number;
    m_indexC: number;
    m_indexD: number;
   m_lcA: b2Vec2;
   m_lcB: b2Vec2;
   m_lcC: b2Vec2;
   m_lcD: b2Vec2;
    m_mA: number;
    m_mB: number;
    m_mC: number;
    m_mD: number;
    m_iA: number;
    m_iB: number;
    m_iC: number;
    m_iD: number;
   m_JvAC: b2Vec2;
   m_JvBD: b2Vec2;
    m_JwA: number;
    m_JwB: number;
    m_JwC: number;
    m_JwD: number;
    m_mass: number;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_qC: b2Rot;
   m_qD: b2Rot;
   m_lalcA: b2Vec2;
   m_lalcB: b2Vec2;
   m_lalcC: b2Vec2;
   m_lalcD: b2Vec2;
    constructor(def: b2IGearJointDef);
    private static InitVelocityConstraints_s_u;
    private static InitVelocityConstraints_s_rA;
    private static InitVelocityConstraints_s_rB;
    private static InitVelocityConstraints_s_rC;
    private static InitVelocityConstraints_s_rD;
    InitVelocityConstraints(data: b2SolverData): void;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_u;
    private static SolvePositionConstraints_s_rA;
    private static SolvePositionConstraints_s_rB;
    private static SolvePositionConstraints_s_rC;
    private static SolvePositionConstraints_s_rD;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetJoint1(): b2PrismaticJoint | b2RevoluteJoint;
    GetJoint2(): b2PrismaticJoint | b2RevoluteJoint;
    GetRatio(): number;
    SetRatio(ratio: number): void;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

interface b2IMotorJointDef extends b2IJointDef {
    linearOffset?: XY;
    angularOffset?: number;
    maxForce?: number;
    maxTorque?: number;
    correctionFactor?: number;
}
declare class b2MotorJointDef extends b2JointDef implements b2IMotorJointDef {
   linearOffset: b2Vec2;
    angularOffset: number;
    maxForce: number;
    maxTorque: number;
    correctionFactor: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body): void;
}
declare class b2MotorJoint extends b2Joint {
   m_linearOffset: b2Vec2;
    m_angularOffset: number;
   m_linearImpulse: b2Vec2;
    m_angularImpulse: number;
    m_maxForce: number;
    m_maxTorque: number;
    m_correctionFactor: number;
    m_indexA: number;
    m_indexB: number;
   m_rA: b2Vec2;
   m_rB: b2Vec2;
   m_localCenterA: b2Vec2;
   m_localCenterB: b2Vec2;
   m_linearError: b2Vec2;
    m_angularError: number;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
   m_linearMass: b2Mat22;
    m_angularMass: number;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_K: b2Mat22;
    constructor(def: b2IMotorJointDef);
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    SetLinearOffset(linearOffset: b2Vec2): void;
    GetLinearOffset(): b2Vec2;
    SetAngularOffset(angularOffset: number): void;
    GetAngularOffset(): number;
    SetMaxForce(force: number): void;
    GetMaxForce(): number;
    SetMaxTorque(torque: number): void;
    GetMaxTorque(): number;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot_v2;
    private static SolveVelocityConstraints_s_impulse_v2;
    private static SolveVelocityConstraints_s_oldImpulse_v2;
    SolveVelocityConstraints(data: b2SolverData): void;
    SolvePositionConstraints(data: b2SolverData): boolean;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

interface b2IMouseJointDef extends b2IJointDef {
    target?: XY;
    maxForce?: number;
    stiffness?: number;
    damping?: number;
}
declare class b2MouseJointDef extends b2JointDef implements b2IMouseJointDef {
   target: b2Vec2;
    maxForce: number;
    stiffness: number;
    damping: number;
    constructor();
}
declare class b2MouseJoint extends b2Joint {
   m_localAnchorB: b2Vec2;
   m_targetA: b2Vec2;
    m_stiffness: number;
    m_damping: number;
    m_beta: number;
   m_impulse: b2Vec2;
    m_maxForce: number;
    m_gamma: number;
    m_indexA: number;
    m_indexB: number;
   m_rB: b2Vec2;
   m_localCenterB: b2Vec2;
    m_invMassB: number;
    m_invIB: number;
   m_mass: b2Mat22;
   m_C: b2Vec2;
   m_qB: b2Rot;
   m_lalcB: b2Vec2;
   m_K: b2Mat22;
    constructor(def: b2IMouseJointDef);
    SetTarget(target: b2Vec2): void;
    GetTarget(): b2Vec2;
    SetMaxForce(maxForce: number): void;
    GetMaxForce(): number;
    SetStiffness(stiffness: number): void;
    GetStiffness(): number;
    SetDamping(damping: number): void;
    GetDamping(): number;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot;
    private static SolveVelocityConstraints_s_impulse;
    private static SolveVelocityConstraints_s_oldImpulse;
    SolveVelocityConstraints(data: b2SolverData): void;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    ShiftOrigin(newOrigin: b2Vec2): void;
}

declare const b2_minPulleyLength: number;
interface b2IPulleyJointDef extends b2IJointDef {
    groundAnchorA?: XY;
    groundAnchorB?: XY;
    localAnchorA?: XY;
    localAnchorB?: XY;
    lengthA?: number;
    lengthB?: number;
    ratio?: number;
}
declare class b2PulleyJointDef extends b2JointDef implements b2IPulleyJointDef {
   groundAnchorA: b2Vec2;
   groundAnchorB: b2Vec2;
   localAnchorA: b2Vec2;
   localAnchorB: b2Vec2;
    lengthA: number;
    lengthB: number;
    ratio: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, groundA: b2Vec2, groundB: b2Vec2, anchorA: b2Vec2, anchorB: b2Vec2, r: number): void;
}
declare class b2PulleyJoint extends b2Joint {
   m_groundAnchorA: b2Vec2;
   m_groundAnchorB: b2Vec2;
    m_lengthA: number;
    m_lengthB: number;
   m_localAnchorA: b2Vec2;
   m_localAnchorB: b2Vec2;
    m_constant: number;
    m_ratio: number;
    m_impulse: number;
    m_indexA: number;
    m_indexB: number;
   m_uA: b2Vec2;
   m_uB: b2Vec2;
   m_rA: b2Vec2;
   m_rB: b2Vec2;
   m_localCenterA: b2Vec2;
   m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
    m_mass: number;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_lalcA: b2Vec2;
   m_lalcB: b2Vec2;
    constructor(def: b2IPulleyJointDef);
    private static InitVelocityConstraints_s_PA;
    private static InitVelocityConstraints_s_PB;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_vpA;
    private static SolveVelocityConstraints_s_vpB;
    private static SolveVelocityConstraints_s_PA;
    private static SolveVelocityConstraints_s_PB;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_PA;
    private static SolvePositionConstraints_s_PB;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetGroundAnchorA(): b2Vec2;
    GetGroundAnchorB(): b2Vec2;
    GetLengthA(): number;
    GetLengthB(): number;
    GetRatio(): number;
    private static GetCurrentLengthA_s_p;
    GetCurrentLengthA(): number;
    private static GetCurrentLengthB_s_p;
    GetCurrentLengthB(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    ShiftOrigin(newOrigin: b2Vec2): void;
}

interface b2IWeldJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    referenceAngle?: number;
    stiffness?: number;
    damping?: number;
}
declare class b2WeldJointDef extends b2JointDef implements b2IWeldJointDef {
   localAnchorA: b2Vec2;
   localAnchorB: b2Vec2;
    referenceAngle: number;
    stiffness: number;
    damping: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2): void;
}
declare class b2WeldJoint extends b2Joint {
    m_stiffness: number;
    m_damping: number;
    m_bias: number;
   m_localAnchorA: b2Vec2;
   m_localAnchorB: b2Vec2;
    m_referenceAngle: number;
    m_gamma: number;
   m_impulse: b2Vec3;
    m_indexA: number;
    m_indexB: number;
   m_rA: b2Vec2;
   m_rB: b2Vec2;
   m_localCenterA: b2Vec2;
   m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
   m_mass: b2Mat33;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_lalcA: b2Vec2;
   m_lalcB: b2Vec2;
   m_K: b2Mat33;
    constructor(def: b2IWeldJointDef);
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_Cdot1;
    private static SolveVelocityConstraints_s_impulse1;
    private static SolveVelocityConstraints_s_impulse;
    private static SolveVelocityConstraints_s_P;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_C1;
    private static SolvePositionConstraints_s_P;
    private static SolvePositionConstraints_s_impulse;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    GetReferenceAngle(): number;
    SetStiffness(stiffness: number): void;
    GetStiffness(): number;
    SetDamping(damping: number): void;
    GetDamping(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}

interface b2IWheelJointDef extends b2IJointDef {
    localAnchorA?: XY;
    localAnchorB?: XY;
    localAxisA?: XY;
    enableLimit?: boolean;
    lowerTranslation?: number;
    upperTranslation?: number;
    enableMotor?: boolean;
    maxMotorTorque?: number;
    motorSpeed?: number;
    stiffness?: number;
    damping?: number;
}
declare class b2WheelJointDef extends b2JointDef implements b2IWheelJointDef {
   localAnchorA: b2Vec2;
   localAnchorB: b2Vec2;
   localAxisA: b2Vec2;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
    enableMotor: boolean;
    maxMotorTorque: number;
    motorSpeed: number;
    stiffness: number;
    damping: number;
    constructor();
    Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2, axis: b2Vec2): void;
}
declare class b2WheelJoint extends b2Joint {
   m_localAnchorA: b2Vec2;
   m_localAnchorB: b2Vec2;
   m_localXAxisA: b2Vec2;
   m_localYAxisA: b2Vec2;
    m_impulse: number;
    m_motorImpulse: number;
    m_springImpulse: number;
    m_lowerImpulse: number;
    m_upperImpulse: number;
    m_translation: number;
    m_lowerTranslation: number;
    m_upperTranslation: number;
    m_maxMotorTorque: number;
    m_motorSpeed: number;
    m_enableLimit: boolean;
    m_enableMotor: boolean;
    m_stiffness: number;
    m_damping: number;
    m_indexA: number;
    m_indexB: number;
   m_localCenterA: b2Vec2;
   m_localCenterB: b2Vec2;
    m_invMassA: number;
    m_invMassB: number;
    m_invIA: number;
    m_invIB: number;
   m_ax: b2Vec2;
   m_ay: b2Vec2;
    m_sAx: number;
    m_sBx: number;
    m_sAy: number;
    m_sBy: number;
    m_mass: number;
    m_motorMass: number;
    m_axialMass: number;
    m_springMass: number;
    m_bias: number;
    m_gamma: number;
   m_qA: b2Rot;
   m_qB: b2Rot;
   m_lalcA: b2Vec2;
   m_lalcB: b2Vec2;
   m_rA: b2Vec2;
   m_rB: b2Vec2;
    constructor(def: b2IWheelJointDef);
    GetMotorSpeed(): number;
    GetMaxMotorTorque(): number;
    SetSpringFrequencyHz(hz: number): void;
    GetSpringFrequencyHz(): number;
    SetSpringDampingRatio(ratio: number): void;
    GetSpringDampingRatio(): number;
    private static InitVelocityConstraints_s_d;
    private static InitVelocityConstraints_s_P;
    InitVelocityConstraints(data: b2SolverData): void;
    private static SolveVelocityConstraints_s_P;
    SolveVelocityConstraints(data: b2SolverData): void;
    private static SolvePositionConstraints_s_d;
    private static SolvePositionConstraints_s_P;
    SolvePositionConstraints(data: b2SolverData): boolean;
    GetDefinition(def: b2WheelJointDef): b2WheelJointDef;
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    GetLocalAnchorA(): Readonly<b2Vec2>;
    GetLocalAnchorB(): Readonly<b2Vec2>;
    GetLocalAxisA(): Readonly<b2Vec2>;
    GetJointTranslation(): number;
    GetJointLinearSpeed(): number;
    GetJointAngle(): number;
    GetJointAngularSpeed(): number;
    GetPrismaticJointTranslation(): number;
    GetPrismaticJointSpeed(): number;
    GetRevoluteJointAngle(): number;
    GetRevoluteJointSpeed(): number;
    IsMotorEnabled(): boolean;
    EnableMotor(flag: boolean): void;
    SetMotorSpeed(speed: number): void;
    SetMaxMotorTorque(force: number): void;
    GetMotorTorque(inv_dt: number): number;
    IsLimitEnabled(): boolean;
    EnableLimit(flag: boolean): void;
    GetLowerLimit(): number;
    GetUpperLimit(): number;
    SetLimits(lower: number, upper: number): void;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static Draw_s_pA;
    private static Draw_s_pB;
    private static Draw_s_axis;
    private static Draw_s_c1;
    private static Draw_s_c2;
    private static Draw_s_c3;
    private static Draw_s_c4;
    private static Draw_s_c5;
    private static Draw_s_lower;
    private static Draw_s_upper;
    private static Draw_s_perp;
    Draw(draw: b2Draw): void;
}

declare class b2ContactRegister {
    pool: b2Contact[];
    createFcn: (() => b2Contact) | null;
    destroyFcn: ((contact: b2Contact) => void) | null;
    primary: boolean;
}
declare class b2ContactFactory {
   m_registers: b2ContactRegister[][];
    constructor();
    private AddType;
    private InitializeRegisters;
    Create(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): b2Contact | null;
    Destroy(contact: b2Contact): void;
}

declare class b2ContactManager {
   m_broadPhase: b2BroadPhase<b2FixtureProxy>;
    m_contactList: b2Contact | null;
    m_contactCount: number;
    m_contactFilter: b2ContactFilter;
    m_contactListener: b2ContactListener;
   m_contactFactory: b2ContactFactory;
    AddPair(proxyA: b2FixtureProxy, proxyB: b2FixtureProxy): void;
    FindNewContacts(): void;
    Destroy(c: b2Contact): void;
    Collide(): void;
}

declare let g_blockSolve: boolean;
declare function get_g_blockSolve(): boolean;
declare function set_g_blockSolve(value: boolean): void;
declare class b2VelocityConstraintPoint {
   rA: b2Vec2;
   rB: b2Vec2;
    normalImpulse: number;
    tangentImpulse: number;
    normalMass: number;
    tangentMass: number;
    velocityBias: number;
    static MakeArray(length: number): b2VelocityConstraintPoint[];
}
declare class b2ContactVelocityConstraint {
   points: b2VelocityConstraintPoint[];
   normal: b2Vec2;
   tangent: b2Vec2;
   normalMass: b2Mat22;
   K: b2Mat22;
    indexA: number;
    indexB: number;
    invMassA: number;
    invMassB: number;
    invIA: number;
    invIB: number;
    friction: number;
    restitution: number;
    threshold: number;
    tangentSpeed: number;
    pointCount: number;
    contactIndex: number;
    static MakeArray(length: number): b2ContactVelocityConstraint[];
}
declare class b2ContactPositionConstraint {
   localPoints: b2Vec2[];
   localNormal: b2Vec2;
   localPoint: b2Vec2;
    indexA: number;
    indexB: number;
    invMassA: number;
    invMassB: number;
   localCenterA: b2Vec2;
   localCenterB: b2Vec2;
    invIA: number;
    invIB: number;
    type: b2ManifoldType;
    radiusA: number;
    radiusB: number;
    pointCount: number;
    static MakeArray(length: number): b2ContactPositionConstraint[];
}
declare class b2ContactSolverDef {
   step: b2TimeStep;
    contacts: b2Contact[];
    count: number;
    positions: b2Position[];
    velocities: b2Velocity[];
}
declare class b2PositionSolverManifold {
   normal: b2Vec2;
   point: b2Vec2;
    separation: number;
    private static Initialize_s_pointA;
    private static Initialize_s_pointB;
    private static Initialize_s_planePoint;
    private static Initialize_s_clipPoint;
    Initialize(pc: b2ContactPositionConstraint, xfA: b2Transform, xfB: b2Transform, index: number): void;
}
declare class b2ContactSolver {
   m_step: b2TimeStep;
    m_positions: b2Position[];
    m_velocities: b2Velocity[];
   m_positionConstraints: b2ContactPositionConstraint[];
   m_velocityConstraints: b2ContactVelocityConstraint[];
    m_contacts: b2Contact[];
    m_count: number;
    Initialize(def: b2ContactSolverDef): b2ContactSolver;
    private static InitializeVelocityConstraints_s_xfA;
    private static InitializeVelocityConstraints_s_xfB;
    private static InitializeVelocityConstraints_s_worldManifold;
    InitializeVelocityConstraints(): void;
    private static WarmStart_s_P;
    WarmStart(): void;
    private static SolveVelocityConstraints_s_dv;
    private static SolveVelocityConstraints_s_dv1;
    private static SolveVelocityConstraints_s_dv2;
    private static SolveVelocityConstraints_s_P;
    private static SolveVelocityConstraints_s_a;
    private static SolveVelocityConstraints_s_b;
    private static SolveVelocityConstraints_s_x;
    private static SolveVelocityConstraints_s_d;
    private static SolveVelocityConstraints_s_P1;
    private static SolveVelocityConstraints_s_P2;
    private static SolveVelocityConstraints_s_P1P2;
    SolveVelocityConstraints(): void;
    StoreImpulses(): void;
    private static SolvePositionConstraints_s_xfA;
    private static SolvePositionConstraints_s_xfB;
    private static SolvePositionConstraints_s_psm;
    private static SolvePositionConstraints_s_rA;
    private static SolvePositionConstraints_s_rB;
    private static SolvePositionConstraints_s_P;
    SolvePositionConstraints(): boolean;
    private static SolveTOIPositionConstraints_s_xfA;
    private static SolveTOIPositionConstraints_s_xfB;
    private static SolveTOIPositionConstraints_s_psm;
    private static SolveTOIPositionConstraints_s_rA;
    private static SolveTOIPositionConstraints_s_rB;
    private static SolveTOIPositionConstraints_s_P;
    SolveTOIPositionConstraints(toiIndexA: number, toiIndexB: number): boolean;
}

declare class b2Island {
    m_listener: b2ContactListener;
   m_bodies: b2Body[];
   m_contacts: b2Contact[];
   m_joints: b2Joint[];
   m_positions: b2Position[];
   m_velocities: b2Velocity[];
    m_bodyCount: number;
    m_jointCount: number;
    m_contactCount: number;
    m_bodyCapacity: number;
    m_contactCapacity: number;
    m_jointCapacity: number;
    Initialize(bodyCapacity: number, contactCapacity: number, jointCapacity: number, listener: b2ContactListener): void;
    Clear(): void;
    AddBody(body: b2Body): void;
    AddContact(contact: b2Contact): void;
    AddJoint(joint: b2Joint): void;
    private static s_timer;
    private static s_solverData;
    private static s_contactSolverDef;
    private static s_contactSolver;
    private static s_translation;
    Solve(profile: b2Profile, step: b2TimeStep, gravity: b2Vec2, allowSleep: boolean): void;
    SolveTOI(subStep: b2TimeStep, toiIndexA: number, toiIndexB: number): void;
    private static s_impulse;
    Report(constraints: b2ContactVelocityConstraint[]): void;
}

/**
 * A controller edge is used to connect bodies and controllers
 * together in a bipartite graph.
 */
declare class b2ControllerEdge {
   controller: b2Controller;
   body: b2Body;
    prevBody: b2ControllerEdge | null;
    nextBody: b2ControllerEdge | null;
    prevController: b2ControllerEdge | null;
    nextController: b2ControllerEdge | null;
    constructor(controller: b2Controller, body: b2Body);
}
/**
 * Base class for controllers. Controllers are a convience for
 * encapsulating common per-step functionality.
 */
declare abstract class b2Controller {
    m_bodyList: b2ControllerEdge | null;
    m_bodyCount: number;
    m_prev: b2Controller | null;
    m_next: b2Controller | null;
    /**
     * Controllers override this to implement per-step functionality.
     */
    abstract Step(step: b2TimeStep): void;
    /**
     * Controllers override this to provide debug drawing.
     */
    abstract Draw(debugDraw: b2Draw): void;
    /**
     * Get the next controller in the world's body list.
     */
    GetNext(): b2Controller | null;
    /**
     * Get the previous controller in the world's body list.
     */
    GetPrev(): b2Controller | null;
    /**
     * Get the parent world of this body.
     */
    /**
     * Get the attached body list
     */
    GetBodyList(): b2ControllerEdge | null;
    /**
     * Adds a body to the controller list.
     */
    AddBody(body: b2Body): void;
    /**
     * Removes a body from the controller list.
     */
    RemoveBody(body: b2Body): void;
    /**
     * Removes all bodies from the controller list.
     */
    Clear(): void;
}

declare class b2World {
   m_contactManager: b2ContactManager;
    m_bodyList: b2Body | null;
    m_jointList: b2Joint | null;
    m_particleSystemList: b2ParticleSystem | null;
    m_bodyCount: number;
    m_jointCount: number;
   m_gravity: b2Vec2;
    m_allowSleep: boolean;
    m_destructionListener: b2DestructionListener | null;
    m_debugDraw: b2Draw | null;
    m_inv_dt0: number;
    m_newContacts: boolean;
    m_locked: boolean;
    m_clearForces: boolean;
    m_warmStarting: boolean;
    m_continuousPhysics: boolean;
    m_subStepping: boolean;
    m_stepComplete: boolean;
   m_profile: b2Profile;
   m_island: b2Island;
   s_stack: Array<b2Body>;
    m_controllerList: b2Controller | null;
    m_controllerCount: number;
    constructor(gravity: XY);
    SetDestructionListener(listener: b2DestructionListener): void;
    SetContactFilter(filter: b2ContactFilter): void;
    SetContactListener(listener: b2ContactListener): void;
    SetDebugDraw(debugDraw: b2Draw): void;
    CreateBody(def?: b2IBodyDef): b2Body;
    DestroyBody(b: b2Body): void;
    private static _Joint_Create;
    private static _Joint_Destroy;
    CreateJoint(def: b2IAreaJointDef): b2AreaJoint;
    CreateJoint(def: b2IDistanceJointDef): b2DistanceJoint;
    CreateJoint(def: b2IFrictionJointDef): b2FrictionJoint;
    CreateJoint(def: b2IGearJointDef): b2GearJoint;
    CreateJoint(def: b2IMotorJointDef): b2MotorJoint;
    CreateJoint(def: b2IMouseJointDef): b2MouseJoint;
    CreateJoint(def: b2IPrismaticJointDef): b2PrismaticJoint;
    CreateJoint(def: b2IPulleyJointDef): b2PulleyJoint;
    CreateJoint(def: b2IRevoluteJointDef): b2RevoluteJoint;
    CreateJoint(def: b2IWeldJointDef): b2WeldJoint;
    CreateJoint(def: b2IWheelJointDef): b2WheelJoint;
    DestroyJoint(j: b2Joint): void;
    CreateParticleSystem(def: b2ParticleSystemDef): b2ParticleSystem;
    DestroyParticleSystem(p: b2ParticleSystem): void;
    CalculateReasonableParticleIterations(timeStep: number): number;
    private static Step_s_step;
    private static Step_s_stepTimer;
    private static Step_s_timer;
    Step(dt: number, velocityIterations: number, positionIterations: number, particleIterations?: number): void;
    ClearForces(): void;
    DrawParticleSystem(system: b2ParticleSystem): void;
    private static DebugDraw_s_color;
    private static DebugDraw_s_vs;
    private static DebugDraw_s_xf;
    DebugDraw(): void;
    QueryAABB(callback: b2QueryCallback, aabb: b2AABB): void;
    QueryAABB(aabb: b2AABB, fn: b2QueryCallbackFunction): void;
    private _QueryAABB;
    QueryAllAABB(aabb: b2AABB, out?: b2Fixture[]): b2Fixture[];
    QueryPointAABB(callback: b2QueryCallback, point: XY): void;
    QueryPointAABB(point: XY, fn: b2QueryCallbackFunction): void;
    private _QueryPointAABB;
    QueryAllPointAABB(point: XY, out?: b2Fixture[]): b2Fixture[];
    QueryFixtureShape(callback: b2QueryCallback, shape: b2Shape, index: number, transform: b2Transform): void;
    QueryFixtureShape(shape: b2Shape, index: number, transform: b2Transform, fn: b2QueryCallbackFunction): void;
    private static QueryFixtureShape_s_aabb;
    private _QueryFixtureShape;
    QueryAllFixtureShape(shape: b2Shape, index: number, transform: b2Transform, out?: b2Fixture[]): b2Fixture[];
    QueryFixturePoint(callback: b2QueryCallback, point: XY): void;
    QueryFixturePoint(point: XY, fn: b2QueryCallbackFunction): void;
    private _QueryFixturePoint;
    QueryAllFixturePoint(point: XY, out?: b2Fixture[]): b2Fixture[];
    RayCast(callback: b2RayCastCallback, point1: XY, point2: XY): void;
    RayCast(point1: XY, point2: XY, fn: b2RayCastCallbackFunction): void;
    private static RayCast_s_input;
    private static RayCast_s_output;
    private static RayCast_s_point;
    private _RayCast;
    RayCastOne(point1: XY, point2: XY): b2Fixture | null;
    RayCastAll(point1: XY, point2: XY, out?: b2Fixture[]): b2Fixture[];
    GetBodyList(): b2Body | null;
    GetJointList(): b2Joint | null;
    GetParticleSystemList(): b2ParticleSystem | null;
    GetContactList(): b2Contact | null;
    SetAllowSleeping(flag: boolean): void;
    GetAllowSleeping(): boolean;
    SetWarmStarting(flag: boolean): void;
    GetWarmStarting(): boolean;
    SetContinuousPhysics(flag: boolean): void;
    GetContinuousPhysics(): boolean;
    SetSubStepping(flag: boolean): void;
    GetSubStepping(): boolean;
    GetProxyCount(): number;
    GetBodyCount(): number;
    GetJointCount(): number;
    GetContactCount(): number;
    GetTreeHeight(): number;
    GetTreeBalance(): number;
    GetTreeQuality(): number;
    SetGravity(gravity: XY, wake?: boolean): void;
    GetGravity(): Readonly<b2Vec2>;
    IsLocked(): boolean;
    SetAutoClearForces(flag: boolean): void;
    GetAutoClearForces(): boolean;
    ShiftOrigin(newOrigin: XY): void;
    GetContactManager(): b2ContactManager;
    GetProfile(): b2Profile;
    Dump(log: (format: string, ...args: any[]) => void): void;
    DrawShape(fixture: b2Fixture, color: b2Color): void;
    Solve(step: b2TimeStep): void;
    private static SolveTOI_s_subStep;
    private static SolveTOI_s_backup;
    private static SolveTOI_s_backup1;
    private static SolveTOI_s_backup2;
    private static SolveTOI_s_toi_input;
    private static SolveTOI_s_toi_output;
    SolveTOI(step: b2TimeStep): void;
    AddController(controller: b2Controller): b2Controller;
    RemoveController(controller: b2Controller): b2Controller;
}

declare class b2GrowableBuffer<T> {
    data: T[];
    count: number;
    capacity: number;
    allocator: () => T;
    constructor(allocator: () => T);
    Append(): number;
    Reserve(newCapacity: number): void;
    Grow(): void;
    Free(): void;
    Shorten(newEnd: number): void;
    Data(): T[];
    GetCount(): number;
    SetCount(newCount: number): void;
    GetCapacity(): number;
    RemoveIf(pred: (t: T) => boolean): void;
    Unique(pred: (a: T, b: T) => boolean): void;
}
declare type b2ParticleIndex = number;
declare class b2FixtureParticleQueryCallback extends b2QueryCallback {
    m_system: b2ParticleSystem;
    constructor(system: b2ParticleSystem);
    ShouldQueryParticleSystem(system: b2ParticleSystem): boolean;
    ReportFixture(fixture: b2Fixture): boolean;
    ReportParticle(system: b2ParticleSystem, index: number): boolean;
    ReportFixtureAndParticle(fixture: b2Fixture, childIndex: number, index: number): void;
}
declare class b2ParticleContact {
    indexA: number;
    indexB: number;
    weight: number;
    normal: b2Vec2;
    flags: b2ParticleFlag;
    SetIndices(a: number, b: number): void;
    SetWeight(w: number): void;
    SetNormal(n: b2Vec2): void;
    SetFlags(f: b2ParticleFlag): void;
    GetIndexA(): number;
    GetIndexB(): number;
    GetWeight(): number;
    GetNormal(): b2Vec2;
    GetFlags(): b2ParticleFlag;
    IsEqual(rhs: b2ParticleContact): boolean;
    IsNotEqual(rhs: b2ParticleContact): boolean;
    ApproximatelyEqual(rhs: b2ParticleContact): boolean;
}
declare class b2ParticleBodyContact {
    index: number;
    body: b2Body;
    fixture: b2Fixture;
    weight: number;
    normal: b2Vec2;
    mass: number;
}
declare class b2ParticlePair {
    indexA: number;
    indexB: number;
    flags: b2ParticleFlag;
    strength: number;
    distance: number;
}
declare class b2ParticleTriad {
    indexA: number;
    indexB: number;
    indexC: number;
    flags: b2ParticleFlag;
    strength: number;
    pa: b2Vec2;
    pb: b2Vec2;
    pc: b2Vec2;
    ka: number;
    kb: number;
    kc: number;
    s: number;
}
declare class b2ParticleSystemDef {
    /**
     * Enable strict Particle/Body contact check.
     * See SetStrictContactCheck for details.
     */
    strictContactCheck: boolean;
    /**
     * Set the particle density.
     * See SetDensity for details.
     */
    density: number;
    /**
     * Change the particle gravity scale. Adjusts the effect of the
     * global gravity vector on particles. Default value is 1.0f.
     */
    gravityScale: number;
    /**
     * Particles behave as circles with this radius. In Box2D units.
     */
    radius: number;
    /**
     * Set the maximum number of particles.
     * By default, there is no maximum. The particle buffers can
     * continue to grow while b2World's block allocator still has
     * memory.
     * See SetMaxParticleCount for details.
     */
    maxCount: number;
    /**
     * Increases pressure in response to compression
     * Smaller values allow more compression
     */
    pressureStrength: number;
    /**
     * Reduces velocity along the collision normal
     * Smaller value reduces less
     */
    dampingStrength: number;
    /**
     * Restores shape of elastic particle groups
     * Larger values increase elastic particle velocity
     */
    elasticStrength: number;
    /**
     * Restores length of spring particle groups
     * Larger values increase spring particle velocity
     */
    springStrength: number;
    /**
     * Reduces relative velocity of viscous particles
     * Larger values slow down viscous particles more
     */
    viscousStrength: number;
    /**
     * Produces pressure on tensile particles
     * 0~0.2. Larger values increase the amount of surface tension.
     */
    surfaceTensionPressureStrength: number;
    /**
     * Smoothes outline of tensile particles
     * 0~0.2. Larger values result in rounder, smoother,
     * water-drop-like clusters of particles.
     */
    surfaceTensionNormalStrength: number;
    /**
     * Produces additional pressure on repulsive particles
     * Larger values repulse more
     * Negative values mean attraction. The range where particles
     * behave stably is about -0.2 to 2.0.
     */
    repulsiveStrength: number;
    /**
     * Produces repulsion between powder particles
     * Larger values repulse more
     */
    powderStrength: number;
    /**
     * Pushes particles out of solid particle group
     * Larger values repulse more
     */
    ejectionStrength: number;
    /**
     * Produces static pressure
     * Larger values increase the pressure on neighboring partilces
     * For a description of static pressure, see
     * http://en.wikipedia.org/wiki/Static_pressure#Static_pressure_in_fluid_dynamics
     */
    staticPressureStrength: number;
    /**
     * Reduces instability in static pressure calculation
     * Larger values make stabilize static pressure with fewer
     * iterations
     */
    staticPressureRelaxation: number;
    /**
     * Computes static pressure more precisely
     * See SetStaticPressureIterations for details
     */
    staticPressureIterations: number;
    /**
     * Determines how fast colors are mixed
     * 1.0f ==> mixed immediately
     * 0.5f ==> mixed half way each simulation step (see
     * b2World::Step())
     */
    colorMixingStrength: number;
    /**
     * Whether to destroy particles by age when no more particles
     * can be created.  See #b2ParticleSystem::SetDestructionByAge()
     * for more information.
     */
    destroyByAge: boolean;
    /**
     * Granularity of particle lifetimes in seconds.  By default
     * this is set to (1.0f / 60.0f) seconds.  b2ParticleSystem uses
     * a 32-bit signed value to track particle lifetimes so the
     * maximum lifetime of a particle is (2^32 - 1) / (1.0f /
     * lifetimeGranularity) seconds. With the value set to 1/60 the
     * maximum lifetime or age of a particle is 2.27 years.
     */
    lifetimeGranularity: number;
    Copy(def: b2ParticleSystemDef): b2ParticleSystemDef;
    Clone(): b2ParticleSystemDef;
}
declare class b2ParticleSystem {
    m_paused: boolean;
    m_timestamp: number;
    m_allParticleFlags: b2ParticleFlag;
    m_needsUpdateAllParticleFlags: boolean;
    m_allGroupFlags: b2ParticleGroupFlag;
    m_needsUpdateAllGroupFlags: boolean;
    m_hasForce: boolean;
    m_iterationIndex: number;
    m_inverseDensity: number;
    m_particleDiameter: number;
    m_inverseDiameter: number;
    m_squaredDiameter: number;
    m_count: number;
    m_internalAllocatedCapacity: number;
    /**
     * Allocator for b2ParticleHandle instances.
     */
    /**
     * Maps particle indicies to handles.
     */
    m_handleIndexBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleHandle | null>;
    m_flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>;
    m_positionBuffer: b2ParticleSystem_UserOverridableBuffer<b2Vec2>;
    m_velocityBuffer: b2ParticleSystem_UserOverridableBuffer<b2Vec2>;
    m_forceBuffer: b2Vec2[];
    /**
     * this.m_weightBuffer is populated in ComputeWeight and used in
     * ComputeDepth(), SolveStaticPressure() and SolvePressure().
     */
    m_weightBuffer: number[];
    /**
     * When any particles have the flag b2_staticPressureParticle,
     * this.m_staticPressureBuffer is first allocated and used in
     * SolveStaticPressure() and SolvePressure().  It will be
     * reallocated on subsequent CreateParticle() calls.
     */
    m_staticPressureBuffer: number[];
    /**
     * this.m_accumulationBuffer is used in many functions as a temporary
     * buffer for scalar values.
     */
    m_accumulationBuffer: number[];
    /**
     * When any particles have the flag b2_tensileParticle,
     * this.m_accumulation2Buffer is first allocated and used in
     * SolveTensile() as a temporary buffer for vector values.  It
     * will be reallocated on subsequent CreateParticle() calls.
     */
    m_accumulation2Buffer: b2Vec2[];
    /**
     * When any particle groups have the flag b2_solidParticleGroup,
     * this.m_depthBuffer is first allocated and populated in
     * ComputeDepth() and used in SolveSolid(). It will be
     * reallocated on subsequent CreateParticle() calls.
     */
    m_depthBuffer: number[];
    m_colorBuffer: b2ParticleSystem_UserOverridableBuffer<b2Color>;
    m_groupBuffer: Array<b2ParticleGroup | null>;
    m_userDataBuffer: b2ParticleSystem_UserOverridableBuffer<any>;
    /**
     * Stuck particle detection parameters and record keeping
     */
    m_stuckThreshold: number;
    m_lastBodyContactStepBuffer: b2ParticleSystem_UserOverridableBuffer<number>;
    m_bodyContactCountBuffer: b2ParticleSystem_UserOverridableBuffer<number>;
    m_consecutiveContactStepsBuffer: b2ParticleSystem_UserOverridableBuffer<number>;
    m_stuckParticleBuffer: b2GrowableBuffer<number>;
    m_proxyBuffer: b2GrowableBuffer<b2ParticleSystem_Proxy>;
    m_contactBuffer: b2GrowableBuffer<b2ParticleContact>;
    m_bodyContactBuffer: b2GrowableBuffer<b2ParticleBodyContact>;
    m_pairBuffer: b2GrowableBuffer<b2ParticlePair>;
    m_triadBuffer: b2GrowableBuffer<b2ParticleTriad>;
    /**
     * Time each particle should be destroyed relative to the last
     * time this.m_timeElapsed was initialized.  Each unit of time
     * corresponds to b2ParticleSystemDef::lifetimeGranularity
     * seconds.
     */
    m_expirationTimeBuffer: b2ParticleSystem_UserOverridableBuffer<number>;
    /**
     * List of particle indices sorted by expiration time.
     */
    m_indexByExpirationTimeBuffer: b2ParticleSystem_UserOverridableBuffer<number>;
    /**
     * Time elapsed in 32:32 fixed point.  Each non-fractional unit
     * of time corresponds to
     * b2ParticleSystemDef::lifetimeGranularity seconds.
     */
    m_timeElapsed: number;
    /**
     * Whether the expiration time buffer has been modified and
     * needs to be resorted.
     */
    m_expirationTimeBufferRequiresSorting: boolean;
    m_groupCount: number;
    m_groupList: b2ParticleGroup | null;
    m_def: b2ParticleSystemDef;
    m_world: b2World;
    m_prev: b2ParticleSystem | null;
    m_next: b2ParticleSystem | null;
    staticxTruncBits: number;
    staticyTruncBits: number;
    statictagBits: number;
    staticyOffset: number;
    staticyShift: number;
    staticxShift: number;
    staticxScale: number;
    staticxOffset: number;
    staticyMask: number;
    staticxMask: number;
    static computeTag(x: number, y: number): number;
    static computeRelativeTag(tag: number, x: number, y: number): number;
    constructor(def: b2ParticleSystemDef, world: b2World);
    Drop(): void;
    /**
     * Create a particle whose properties have been defined.
     *
     * No reference to the definition is retained.
     *
     * A simulation step must occur before it's possible to interact
     * with a newly created particle.  For example,
     * DestroyParticleInShape() will not destroy a particle until
     * b2World::Step() has been called.
     *
     * warning: This function is locked during callbacks.
     */
    CreateParticle(def: b2IParticleDef): number;
    /**
     * Retrieve a handle to the particle at the specified index.
     *
     * Please see #b2ParticleHandle for why you might want a handle.
     */
    GetParticleHandleFromIndex(index: number): b2ParticleHandle;
    /**
     * Destroy a particle.
     *
     * The particle is removed after the next simulation step (see
     * b2World::Step()).
     *
     * @param index Index of the particle to destroy.
     * @param callDestructionListener Whether to call the
     *      destruction listener just before the particle is
     *      destroyed.
     */
    DestroyParticle(index: number, callDestructionListener?: boolean): void;
    /**
     * Destroy the Nth oldest particle in the system.
     *
     * The particle is removed after the next b2World::Step().
     *
     * @param index Index of the Nth oldest particle to
     *      destroy, 0 will destroy the oldest particle in the
     *      system, 1 will destroy the next oldest particle etc.
     * @param callDestructionListener Whether to call the
     *      destruction listener just before the particle is
     *      destroyed.
     */
    DestroyOldestParticle(index: number, callDestructionListener?: boolean): void;
    /**
     * Destroy particles inside a shape.
     *
     * warning: This function is locked during callbacks.
     *
     * In addition, this function immediately destroys particles in
     * the shape in constrast to DestroyParticle() which defers the
     * destruction until the next simulation step.
     *
     * @return Number of particles destroyed.
     * @param shape Shape which encloses particles
     *      that should be destroyed.
     * @param xf Transform applied to the shape.
     * @param callDestructionListener Whether to call the
     *      world b2DestructionListener for each particle
     *      destroyed.
     */
    DestroyParticlesInShape(shape: b2Shape, xf: b2Transform, callDestructionListener?: boolean): number;
    staticDestroyParticlesInShape_s_aabb: b2AABB;
    /**
     * Create a particle group whose properties have been defined.
     *
     * No reference to the definition is retained.
     *
     * warning: This function is locked during callbacks.
     */
    CreateParticleGroup(groupDef: b2IParticleGroupDef): b2ParticleGroup;
    staticCreateParticleGroup_s_transform: b2Transform;
    /**
     * Join two particle groups.
     *
     * warning: This function is locked during callbacks.
     *
     * @param groupA the first group. Expands to encompass the second group.
     * @param groupB the second group. It is destroyed.
     */
    JoinParticleGroups(groupA: b2ParticleGroup, groupB: b2ParticleGroup): void;
    /**
     * Split particle group into multiple disconnected groups.
     *
     * warning: This function is locked during callbacks.
     *
     * @param group the group to be split.
     */
    SplitParticleGroup(group: b2ParticleGroup): void;
    /**
     * Get the world particle group list. With the returned group,
     * use b2ParticleGroup::GetNext to get the next group in the
     * world list.
     *
     * A null group indicates the end of the list.
     *
     * @return the head of the world particle group list.
     */
    GetParticleGroupList(): b2ParticleGroup | null;
    /**
     * Get the number of particle groups.
     */
    GetParticleGroupCount(): number;
    /**
     * Get the number of particles.
     */
    GetParticleCount(): number;
    /**
     * Get the maximum number of particles.
     */
    GetMaxParticleCount(): number;
    /**
     * Set the maximum number of particles.
     *
     * A value of 0 means there is no maximum. The particle buffers
     * can continue to grow while b2World's block allocator still
     * has memory.
     *
     * Note: If you try to CreateParticle() with more than this
     * count, b2_invalidParticleIndex is returned unless
     * SetDestructionByAge() is used to enable the destruction of
     * the oldest particles in the system.
     */
    SetMaxParticleCount(count: number): void;
    /**
     * Get all existing particle flags.
     */
    GetAllParticleFlags(): b2ParticleFlag;
    /**
     * Get all existing particle group flags.
     */
    GetAllGroupFlags(): b2ParticleGroupFlag;
    /**
     * Pause or unpause the particle system. When paused,
     * b2World::Step() skips over this particle system. All
     * b2ParticleSystem function calls still work.
     *
     * @param paused paused is true to pause, false to un-pause.
     */
    SetPaused(paused: boolean): void;
    /**
     * Initially, true, then, the last value passed into
     * SetPaused().
     *
     * @return true if the particle system is being updated in b2World::Step().
     */
    GetPaused(): boolean;
    /**
     * Change the particle density.
     *
     * Particle density affects the mass of the particles, which in
     * turn affects how the particles interact with b2Bodies. Note
     * that the density does not affect how the particles interact
     * with each other.
     */
    SetDensity(density: number): void;
    /**
     * Get the particle density.
     */
    GetDensity(): number;
    /**
     * Change the particle gravity scale. Adjusts the effect of the
     * global gravity vector on particles.
     */
    SetGravityScale(gravityScale: number): void;
    /**
     * Get the particle gravity scale.
     */
    GetGravityScale(): number;
    /**
     * Damping is used to reduce the velocity of particles. The
     * damping parameter can be larger than 1.0f but the damping
     * effect becomes sensitive to the time step when the damping
     * parameter is large.
     */
    SetDamping(damping: number): void;
    /**
     * Get damping for particles
     */
    GetDamping(): number;
    /**
     * Change the number of iterations when calculating the static
     * pressure of particles. By default, 8 iterations. You can
     * reduce the number of iterations down to 1 in some situations,
     * but this may cause instabilities when many particles come
     * together. If you see particles popping away from each other
     * like popcorn, you may have to increase the number of
     * iterations.
     *
     * For a description of static pressure, see
     * http://en.wikipedia.org/wiki/Static_pressure#Static_pressure_in_fluid_dynamics
     */
    SetStaticPressureIterations(iterations: number): void;
    /**
     * Get the number of iterations for static pressure of
     * particles.
     */
    GetStaticPressureIterations(): number;
    /**
     * Change the particle radius.
     *
     * You should set this only once, on world start.
     * If you change the radius during execution, existing particles
     * may explode, shrink, or behave unexpectedly.
     */
    SetRadius(radius: number): void;
    /**
     * Get the particle radius.
     */
    GetRadius(): number;
    /**
     * Get the position of each particle
     *
     * Array is length GetParticleCount()
     *
     * @return the pointer to the head of the particle positions array.
     */
    GetPositionBuffer(): b2Vec2[];
    /**
     * Get the velocity of each particle
     *
     * Array is length GetParticleCount()
     *
     * @return the pointer to the head of the particle velocities array.
     */
    GetVelocityBuffer(): b2Vec2[];
    /**
     * Get the color of each particle
     *
     * Array is length GetParticleCount()
     *
     * @return the pointer to the head of the particle colors array.
     */
    GetColorBuffer(): b2Color[];
    /**
     * Get the particle-group of each particle.
     *
     * Array is length GetParticleCount()
     *
     * @return the pointer to the head of the particle group array.
     */
    GetGroupBuffer(): Array<b2ParticleGroup | null>;
    /**
     * Get the weight of each particle
     *
     * Array is length GetParticleCount()
     *
     * @return the pointer to the head of the particle positions array.
     */
    GetWeightBuffer(): number[];
    /**
     * Get the user-specified data of each particle.
     *
     * Array is length GetParticleCount()
     *
     * @return the pointer to the head of the particle user-data array.
     */
    GetUserDataBuffer<T>(): T[];
    /**
     * Get the flags for each particle. See the b2ParticleFlag enum.
     *
     * Array is length GetParticleCount()
     *
     * @return the pointer to the head of the particle-flags array.
     */
    GetFlagsBuffer(): b2ParticleFlag[];
    /**
     * Set flags for a particle. See the b2ParticleFlag enum.
     */
    SetParticleFlags(index: number, newFlags: b2ParticleFlag): void;
    /**
     * Get flags for a particle. See the b2ParticleFlag enum.
     */
    GetParticleFlags(index: number): b2ParticleFlag;
    /**
     * Set an external buffer for particle data.
     *
     * Normally, the b2World's block allocator is used for particle
     * data. However, sometimes you may have an OpenGL or Java
     * buffer for particle data. To avoid data duplication, you may
     * supply this external buffer.
     *
     * Note that, when b2World's block allocator is used, the
     * particle data buffers can grow as required. However, when
     * external buffers are used, the maximum number of particles is
     * clamped to the size of the smallest external buffer.
     *
     * @param buffer a pointer to a block of memory.
     * @param capacity the number of values in the block.
     */
    SetFlagsBuffer(buffer: b2ParticleFlag[]): void;
    SetPositionBuffer(buffer: b2Vec2[] | Float32Array): void;
    SetVelocityBuffer(buffer: b2TypedVec2[] | Float32Array): void;
    SetColorBuffer(buffer: b2Color[] | Float32Array): void;
    SetUserDataBuffer<T>(buffer: T[]): void;
    /**
     * Get contacts between particles
     * Contact data can be used for many reasons, for example to
     * trigger rendering or audio effects.
     */
    GetContacts(): b2ParticleContact[];
    GetContactCount(): number;
    /**
     * Get contacts between particles and bodies
     *
     * Contact data can be used for many reasons, for example to
     * trigger rendering or audio effects.
     */
    GetBodyContacts(): b2ParticleBodyContact[];
    GetBodyContactCount(): number;
    /**
     * Get array of particle pairs. The particles in a pair:
     *   (1) are contacting,
     *   (2) are in the same particle group,
     *   (3) are part of a rigid particle group, or are spring, elastic,
     *       or wall particles.
     *   (4) have at least one particle that is a spring or barrier
     *       particle (i.e. one of the types in k_pairFlags),
     *   (5) have at least one particle that returns true for
     *       ConnectionFilter::IsNecessary,
     *   (6) are not zombie particles.
     *
     * Essentially, this is an array of spring or barrier particles
     * that are interacting. The array is sorted by b2ParticlePair's
     * indexA, and then indexB. There are no duplicate entries.
     */
    GetPairs(): b2ParticlePair[];
    GetPairCount(): number;
    /**
     * Get array of particle triads. The particles in a triad:
     *   (1) are in the same particle group,
     *   (2) are in a Voronoi triangle together,
     *   (3) are within b2_maxTriadDistance particle diameters of each
     *       other,
     *   (4) return true for ConnectionFilter::ShouldCreateTriad
     *   (5) have at least one particle of type elastic (i.e. one of the
     *       types in k_triadFlags),
     *   (6) are part of a rigid particle group, or are spring, elastic,
     *       or wall particles.
     *   (7) are not zombie particles.
     *
     * Essentially, this is an array of elastic particles that are
     * interacting. The array is sorted by b2ParticleTriad's indexA,
     * then indexB, then indexC. There are no duplicate entries.
     */
    GetTriads(): b2ParticleTriad[];
    GetTriadCount(): number;
    /**
     * Set an optional threshold for the maximum number of
     * consecutive particle iterations that a particle may contact
     * multiple bodies before it is considered a candidate for being
     * "stuck". Setting to zero or less disables.
     */
    SetStuckThreshold(steps: number): void;
    /**
     * Get potentially stuck particles from the last step; the user
     * must decide if they are stuck or not, and if so, delete or
     * move them
     */
    GetStuckCandidates(): number[];
    /**
     * Get the number of stuck particle candidates from the last
     * step.
     */
    GetStuckCandidateCount(): number;
    /**
     * Compute the kinetic energy that can be lost by damping force
     */
    ComputeCollisionEnergy(): number;
    staticComputeCollisionEnergy_s_v: b2Vec2;
    /**
     * Set strict Particle/Body contact check.
     *
     * This is an option that will help ensure correct behavior if
     * there are corners in the world model where Particle/Body
     * contact is ambiguous. This option scales at n*log(n) of the
     * number of Particle/Body contacts, so it is best to only
     * enable if it is necessary for your geometry. Enable if you
     * see strange particle behavior around b2Body intersections.
     */
    SetStrictContactCheck(enabled: boolean): void;
    /**
     * Get the status of the strict contact check.
     */
    GetStrictContactCheck(): boolean;
    /**
     * Set the lifetime (in seconds) of a particle relative to the
     * current time.  A lifetime of less than or equal to 0.0f
     * results in the particle living forever until it's manually
     * destroyed by the application.
     */
    SetParticleLifetime(index: number, lifetime: number): void;
    /**
     * Get the lifetime (in seconds) of a particle relative to the
     * current time.  A value > 0.0f is returned if the particle is
     * scheduled to be destroyed in the future, values <= 0.0f
     * indicate the particle has an infinite lifetime.
     */
    GetParticleLifetime(index: number): number;
    /**
     * Enable / disable destruction of particles in CreateParticle()
     * when no more particles can be created due to a prior call to
     * SetMaxParticleCount().  When this is enabled, the oldest
     * particle is destroyed in CreateParticle() favoring the
     * destruction of particles with a finite lifetime over
     * particles with infinite lifetimes. This feature is enabled by
     * default when particle lifetimes are tracked.  Explicitly
     * enabling this feature using this function enables particle
     * lifetime tracking.
     */
    SetDestructionByAge(enable: boolean): void;
    /**
     * Get whether the oldest particle will be destroyed in
     * CreateParticle() when the maximum number of particles are
     * present in the system.
     */
    GetDestructionByAge(): boolean;
    /**
     * Get the array of particle expiration times indexed by
     * particle index.
     *
     * GetParticleCount() items are in the returned array.
     */
    GetExpirationTimeBuffer(): number[];
    /**
     * Convert a expiration time value in returned by
     * GetExpirationTimeBuffer() to a time in seconds relative to
     * the current simulation time.
     */
    ExpirationTimeToLifetime(expirationTime: number): number;
    /**
     * Get the array of particle indices ordered by reverse
     * lifetime. The oldest particle indexes are at the end of the
     * array with the newest at the start.  Particles with infinite
     * lifetimes (i.e expiration times less than or equal to 0) are
     * placed at the start of the array.
     * ExpirationTimeToLifetime(GetExpirationTimeBuffer()[index]) is
     * equivalent to GetParticleLifetime(index).
     *
     * GetParticleCount() items are in the returned array.
     */
    GetIndexByExpirationTimeBuffer(): number[];
    /**
     * Apply an impulse to one particle. This immediately modifies
     * the velocity. Similar to b2Body::ApplyLinearImpulse.
     *
     * @param index the particle that will be modified.
     * @param impulse impulse the world impulse vector, usually in N-seconds or kg-m/s.
     */
    ParticleApplyLinearImpulse(index: number, impulse: XY): void;
    /**
     * Apply an impulse to all particles between 'firstIndex' and
     * 'lastIndex'. This immediately modifies the velocity. Note
     * that the impulse is applied to the total mass of all
     * particles. So, calling ParticleApplyLinearImpulse(0, impulse)
     * and ParticleApplyLinearImpulse(1, impulse) will impart twice
     * as much velocity as calling just ApplyLinearImpulse(0, 1,
     * impulse).
     *
     * @param firstIndex the first particle to be modified.
     * @param lastIndex the last particle to be modified.
     * @param impulse the world impulse vector, usually in N-seconds or kg-m/s.
     */
    ApplyLinearImpulse(firstIndex: number, lastIndex: number, impulse: XY): void;
    static IsSignificantForce(force: XY): boolean;
    /**
     * Apply a force to the center of a particle.
     *
     * @param index the particle that will be modified.
     * @param force the world force vector, usually in Newtons (N).
     */
    ParticleApplyForce(index: number, force: XY): void;
    /**
     * Distribute a force across several particles. The particles
     * must not be wall particles. Note that the force is
     * distributed across all the particles, so calling this
     * function for indices 0..N is not the same as calling
     * ParticleApplyForce(i, force) for i in 0..N.
     *
     * @param firstIndex the first particle to be modified.
     * @param lastIndex the last particle to be modified.
     * @param force the world force vector, usually in Newtons (N).
     */
    ApplyForce(firstIndex: number, lastIndex: number, force: XY): void;
    /**
     * Get the next particle-system in the world's particle-system
     * list.
     */
    GetNext(): b2ParticleSystem | null;
    /**
     * Query the particle system for all particles that potentially
     * overlap the provided AABB.
     * b2QueryCallback::ShouldQueryParticleSystem is ignored.
     *
     * @param callback a user implemented callback class.
     * @param aabb the query box.
     */
    QueryAABB(callback: b2QueryCallback, aabb: b2AABB): void;
    /**
     * Query the particle system for all particles that potentially
     * overlap the provided shape's AABB. Calls QueryAABB
     * internally. b2QueryCallback::ShouldQueryParticleSystem is
     * ignored.
     *
     * @param callback a user implemented callback class.
     * @param shape the query shape
     * @param xf the transform of the AABB
     * @param childIndex
     */
    QueryShapeAABB(callback: b2QueryCallback, shape: b2Shape, xf: b2Transform, childIndex?: number): void;
    staticQueryShapeAABB_s_aabb: b2AABB;
    QueryPointAABB(callback: b2QueryCallback, point: XY, slop?: number): void;
    staticQueryPointAABB_s_aabb: b2AABB;
    /**
     * Ray-cast the particle system for all particles in the path of
     * the ray. Your callback controls whether you get the closest
     * point, any point, or n-points. The ray-cast ignores particles
     * that contain the starting point.
     * b2RayCastCallback::ShouldQueryParticleSystem is ignored.
     *
     * @param callback a user implemented callback class.
     * @param point1 the ray starting point
     * @param point2 the ray ending point
     */
    RayCast(callback: b2RayCastCallback, point1: XY, point2: XY): void;
    staticRayCast_s_aabb: b2AABB;
    staticRayCast_s_p: b2Vec2;
    staticRayCast_s_v: b2Vec2;
    staticRayCast_s_n: b2Vec2;
    staticRayCast_s_point: b2Vec2;
    /**
     * Compute the axis-aligned bounding box for all particles
     * contained within this particle system.
     * @param aabb Returns the axis-aligned bounding box of the system.
     */
    ComputeAABB(aabb: b2AABB): void;
    /**
     * All particle types that require creating pairs
     */
    statick_pairFlags: number;
    /**
     * All particle types that require creating triads
     */
    statick_triadFlags: b2ParticleFlag;
    /**
     * All particle types that do not produce dynamic pressure
     */
    statick_noPressureFlags: number;
    /**
     * All particle types that apply extra damping force with bodies
     */
    statick_extraDampingFlags: b2ParticleFlag;
    statick_barrierWallFlags: number;
    FreeBuffer<T>(b: T[] | null, capacity: number): void;
    FreeUserOverridableBuffer<T>(b: b2ParticleSystem_UserOverridableBuffer<T>): void;
    /**
     * Reallocate a buffer
     */
    ReallocateBuffer3<T>(oldBuffer: T[] | null, oldCapacity: number, newCapacity: number): T[];
    /**
     * Reallocate a buffer
     */
    ReallocateBuffer5<T>(buffer: T[] | null, userSuppliedCapacity: number, oldCapacity: number, newCapacity: number, deferred: boolean): T[];
    /**
     * Reallocate a buffer
     */
    ReallocateBuffer4<T>(buffer: b2ParticleSystem_UserOverridableBuffer<any>, oldCapacity: number, newCapacity: number, deferred: boolean): T[];
    RequestBuffer<T>(buffer: T[] | null): T[];
    /**
     * Reallocate the handle / index map and schedule the allocation
     * of a new pool for handle allocation.
     */
    ReallocateHandleBuffers(newCapacity: number): void;
    ReallocateInternalAllocatedBuffers(capacity: number): void;
    CreateParticleForGroup(groupDef: b2IParticleGroupDef, xf: b2Transform, p: XY): void;
    CreateParticlesStrokeShapeForGroup(shape: b2Shape, groupDef: b2IParticleGroupDef, xf: b2Transform): void;
    staticCreateParticlesStrokeShapeForGroup_s_edge: b2EdgeShape;
    staticCreateParticlesStrokeShapeForGroup_s_d: b2Vec2;
    staticCreateParticlesStrokeShapeForGroup_s_p: b2Vec2;
    CreateParticlesFillShapeForGroup(shape: b2Shape, groupDef: b2IParticleGroupDef, xf: b2Transform): void;
    staticCreateParticlesFillShapeForGroup_s_aabb: b2AABB;
    staticCreateParticlesFillShapeForGroup_s_p: b2Vec2;
    CreateParticlesWithShapeForGroup(shape: b2Shape, groupDef: b2IParticleGroupDef, xf: b2Transform): void;
    CreateParticlesWithShapesForGroup(shapes: b2Shape[], shapeCount: number, groupDef: b2IParticleGroupDef, xf: b2Transform): void;
    CloneParticle(oldIndex: number, group: b2ParticleGroup): number;
    DestroyParticlesInGroup(group: b2ParticleGroup, callDestructionListener?: boolean): void;
    DestroyParticleGroup(group: b2ParticleGroup): void;
    static ParticleCanBeConnected(flags: b2ParticleFlag, group: b2ParticleGroup | null): boolean;
    UpdatePairsAndTriads(firstIndex: number, lastIndex: number, filter: b2ParticleSystem_ConnectionFilter): void;
    private static UpdatePairsAndTriads_s_dab;
    private static UpdatePairsAndTriads_s_dbc;
    private static UpdatePairsAndTriads_s_dca;
    UpdatePairsAndTriadsWithReactiveParticles(): void;
    static ComparePairIndices(a: b2ParticlePair, b: b2ParticlePair): boolean;
    static MatchPairIndices(a: b2ParticlePair, b: b2ParticlePair): boolean;
    static CompareTriadIndices(a: b2ParticleTriad, b: b2ParticleTriad): boolean;
    static MatchTriadIndices(a: b2ParticleTriad, b: b2ParticleTriad): boolean;
    static InitializeParticleLists(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[]): void;
    MergeParticleListsInContact(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[]): void;
    static MergeParticleLists(listA: b2ParticleSystem_ParticleListNode, listB: b2ParticleSystem_ParticleListNode): void;
    static FindLongestParticleList(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[]): b2ParticleSystem_ParticleListNode;
    MergeZombieParticleListNodes(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[], survivingList: b2ParticleSystem_ParticleListNode): void;
    static MergeParticleListAndNode(list: b2ParticleSystem_ParticleListNode, node: b2ParticleSystem_ParticleListNode): void;
    CreateParticleGroupsFromParticleList(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[], survivingList: b2ParticleSystem_ParticleListNode): void;
    UpdatePairsAndTriadsWithParticleList(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[]): void;
    ComputeDepth(): void;
    GetInsideBoundsEnumerator(aabb: Readonly<b2AABB>): b2ParticleSystem_InsideBoundsEnumerator;
    UpdateAllParticleFlags(): void;
    UpdateAllGroupFlags(): void;
    AddContact(a: number, b: number, contacts: b2GrowableBuffer<b2ParticleContact>): void;
    staticAddContact_s_d: b2Vec2;
    FindContacts_Reference(contacts: b2GrowableBuffer<b2ParticleContact>): void;
    FindContacts(contacts: b2GrowableBuffer<b2ParticleContact>): void;
    UpdateProxies_Reference(proxies: b2GrowableBuffer<b2ParticleSystem_Proxy>): void;
    UpdateProxies(proxies: b2GrowableBuffer<b2ParticleSystem_Proxy>): void;
    SortProxies(proxies: b2GrowableBuffer<b2ParticleSystem_Proxy>): void;
    FilterContacts(contacts: b2GrowableBuffer<b2ParticleContact>): void;
    NotifyContactListenerPreContact(particlePairs: b2ParticlePairSet): void;
    NotifyContactListenerPostContact(particlePairs: b2ParticlePairSet): void;
    static b2ParticleContactIsZombie(contact: b2ParticleContact): boolean;
    UpdateContacts(exceptZombie: boolean): void;
    NotifyBodyContactListenerPreContact(fixtureSet: b2ParticleSystem_FixtureParticleSet): void;
    NotifyBodyContactListenerPostContact(fixtureSet: b2ParticleSystem_FixtureParticleSet): void;
    UpdateBodyContacts(): void;
    staticUpdateBodyContacts_s_aabb: b2AABB;
    UpdateBodyContacts_callback: b2ParticleSystem_UpdateBodyContactsCallback | null;
    Solve(step: b2TimeStep): void;
    staticSolve_s_subStep: b2TimeStep;
    SolveCollision(step: b2TimeStep): void;
    staticSolveCollision_s_aabb: b2AABB;
    SolveCollision_callback: b2ParticleSystem_SolveCollisionCallback | null;
    LimitVelocity(step: b2TimeStep): void;
    SolveGravity(step: b2TimeStep): void;
    staticSolveGravity_s_gravity: b2Vec2;
    SolveBarrier(step: b2TimeStep): void;
    staticSolveBarrier_s_aabb: b2AABB;
    staticSolveBarrier_s_va: b2Vec2;
    staticSolveBarrier_s_vb: b2Vec2;
    staticSolveBarrier_s_pba: b2Vec2;
    staticSolveBarrier_s_vba: b2Vec2;
    staticSolveBarrier_s_vc: b2Vec2;
    staticSolveBarrier_s_pca: b2Vec2;
    staticSolveBarrier_s_vca: b2Vec2;
    staticSolveBarrier_s_qba: b2Vec2;
    staticSolveBarrier_s_qca: b2Vec2;
    staticSolveBarrier_s_dv: b2Vec2;
    staticSolveBarrier_s_f: b2Vec2;
    SolveStaticPressure(step: b2TimeStep): void;
    ComputeWeight(): void;
    SolvePressure(step: b2TimeStep): void;
    staticSolvePressure_s_f: b2Vec2;
    SolveDamping(step: b2TimeStep): void;
    staticSolveDamping_s_v: b2Vec2;
    staticSolveDamping_s_f: b2Vec2;
    SolveRigidDamping(): void;
    staticSolveRigidDamping_s_t0: b2Vec2;
    staticSolveRigidDamping_s_t1: b2Vec2;
    staticSolveRigidDamping_s_p: b2Vec2;
    staticSolveRigidDamping_s_v: b2Vec2;
    SolveExtraDamping(): void;
    staticSolveExtraDamping_s_v: b2Vec2;
    staticSolveExtraDamping_s_f: b2Vec2;
    SolveWall(): void;
    SolveRigid(step: b2TimeStep): void;
    staticSolveRigid_s_position: b2Vec2;
    staticSolveRigid_s_rotation: b2Rot;
    staticSolveRigid_s_transform: b2Transform;
    staticSolveRigid_s_velocityTransform: b2Transform;
    SolveElastic(step: b2TimeStep): void;
    staticSolveElastic_s_pa: b2Vec2;
    staticSolveElastic_s_pb: b2Vec2;
    staticSolveElastic_s_pc: b2Vec2;
    staticSolveElastic_s_r: b2Rot;
    staticSolveElastic_s_t0: b2Vec2;
    SolveSpring(step: b2TimeStep): void;
    staticSolveSpring_s_pa: b2Vec2;
    staticSolveSpring_s_pb: b2Vec2;
    staticSolveSpring_s_d: b2Vec2;
    staticSolveSpring_s_f: b2Vec2;
    SolveTensile(step: b2TimeStep): void;
    staticSolveTensile_s_weightedNormal: b2Vec2;
    staticSolveTensile_s_s: b2Vec2;
    staticSolveTensile_s_f: b2Vec2;
    SolveViscous(): void;
    staticSolveViscous_s_v: b2Vec2;
    staticSolveViscous_s_f: b2Vec2;
    SolveRepulsive(step: b2TimeStep): void;
    staticSolveRepulsive_s_f: b2Vec2;
    SolvePowder(step: b2TimeStep): void;
    staticSolvePowder_s_f: b2Vec2;
    SolveSolid(step: b2TimeStep): void;
    staticSolveSolid_s_f: b2Vec2;
    SolveForce(step: b2TimeStep): void;
    SolveColorMixing(): void;
    SolveZombie(): void;
    /**
     * Destroy all particles which have outlived their lifetimes set
     * by SetParticleLifetime().
     */
    SolveLifetimes(step: b2TimeStep): void;
    RotateBuffer(start: number, mid: number, end: number): void;
    GetCriticalVelocity(step: b2TimeStep): number;
    GetCriticalVelocitySquared(step: b2TimeStep): number;
    GetCriticalPressure(step: b2TimeStep): number;
    GetParticleStride(): number;
    GetParticleMass(): number;
    GetParticleInvMass(): number;
    /**
     * Get the world's contact filter if any particles with the
     * b2_contactFilterParticle flag are present in the system.
     */
    GetFixtureContactFilter(): b2ContactFilter | null;
    /**
     * Get the world's contact filter if any particles with the
     * b2_particleContactFilterParticle flag are present in the
     * system.
     */
    GetParticleContactFilter(): b2ContactFilter | null;
    /**
     * Get the world's contact listener if any particles with the
     * b2_fixtureContactListenerParticle flag are present in the
     * system.
     */
    GetFixtureContactListener(): b2ContactListener | null;
    /**
     * Get the world's contact listener if any particles with the
     * b2_particleContactListenerParticle flag are present in the
     * system.
     */
    GetParticleContactListener(): b2ContactListener | null;
    SetUserOverridableBuffer<T>(buffer: b2ParticleSystem_UserOverridableBuffer<T>, data: T[]): void;
    SetGroupFlags(group: b2ParticleGroup, newFlags: b2ParticleGroupFlag): void;
    static BodyContactCompare(lhs: b2ParticleBodyContact, rhs: b2ParticleBodyContact): boolean;
    RemoveSpuriousBodyContacts(): void;
    private static RemoveSpuriousBodyContacts_s_n;
    private static RemoveSpuriousBodyContacts_s_pos;
    private static RemoveSpuriousBodyContacts_s_normal;
    DetectStuckParticle(particle: number): void;
    /**
     * Determine whether a particle index is valid.
     */
    ValidateParticleIndex(index: number): boolean;
    /**
     * Get the time elapsed in
     * b2ParticleSystemDef::lifetimeGranularity.
     */
    GetQuantizedTimeElapsed(): number;
    /**
     * Convert a lifetime in seconds to an expiration time.
     */
    LifetimeToExpirationTime(lifetime: number): number;
    ForceCanBeApplied(flags: b2ParticleFlag): boolean;
    PrepareForceBuffer(): void;
    IsRigidGroup(group: b2ParticleGroup | null): boolean;
    GetLinearVelocity(group: b2ParticleGroup | null, particleIndex: number, point: b2Vec2, out: b2Vec2): b2Vec2;
    InitDampingParameter(invMass: number[], invInertia: number[], tangentDistance: number[], mass: number, inertia: number, center: b2Vec2, point: b2Vec2, normal: b2Vec2): void;
    InitDampingParameterWithRigidGroupOrParticle(invMass: number[], invInertia: number[], tangentDistance: number[], isRigidGroup: boolean, group: b2ParticleGroup | null, particleIndex: number, point: b2Vec2, normal: b2Vec2): void;
    ComputeDampingImpulse(invMassA: number, invInertiaA: number, tangentDistanceA: number, invMassB: number, invInertiaB: number, tangentDistanceB: number, normalVelocity: number): number;
    ApplyDamping(invMass: number, invInertia: number, tangentDistance: number, isRigidGroup: boolean, group: b2ParticleGroup | null, particleIndex: number, impulse: number, normal: b2Vec2): void;
}
declare class b2ParticleSystem_UserOverridableBuffer<T> {
    _data: T[] | null;
    get data(): T[];
    set data(value: T[]);
    userSuppliedCapacity: number;
}
declare class b2ParticleSystem_Proxy {
    index: number;
    tag: number;
    static CompareProxyProxy(a: b2ParticleSystem_Proxy, b: b2ParticleSystem_Proxy): boolean;
    static CompareTagProxy(a: number, b: b2ParticleSystem_Proxy): boolean;
    static CompareProxyTag(a: b2ParticleSystem_Proxy, b: number): boolean;
}
declare class b2ParticleSystem_InsideBoundsEnumerator {
    m_system: b2ParticleSystem;
    m_xLower: number;
    m_xUpper: number;
    m_yLower: number;
    m_yUpper: number;
    m_first: number;
    m_last: number;
    /**
     * InsideBoundsEnumerator enumerates all particles inside the
     * given bounds.
     *
     * Construct an enumerator with bounds of tags and a range of
     * proxies.
     */
    constructor(system: b2ParticleSystem, lower: number, upper: number, first: number, last: number);
    /**
     * Get index of the next particle. Returns
     * b2_invalidParticleIndex if there are no more particles.
     */
    GetNext(): number;
}
declare class b2ParticleSystem_ParticleListNode {
    /**
     * The head of the list.
     */
    list: b2ParticleSystem_ParticleListNode;
    /**
     * The next node in the list.
     */
    next: b2ParticleSystem_ParticleListNode | null;
    /**
     * Number of entries in the list. Valid only for the node at the
     * head of the list.
     */
    count: number;
    /**
     * Particle index.
     */
    index: number;
}
/**
 * @constructor
 */
declare class b2ParticleSystem_FixedSetAllocator<T> {
    Allocate(itemSize: number, count: number): number;
    Clear(): void;
    GetCount(): number;
    Invalidate(itemIndex: number): void;
    GetValidBuffer(): boolean[];
    GetBuffer(): T[];
    SetCount(count: number): void;
}
declare class b2ParticleSystem_FixtureParticle {
    first: b2Fixture;
    second: number;
    constructor(fixture: b2Fixture, particle: number);
}
declare class b2ParticleSystem_FixtureParticleSet extends b2ParticleSystem_FixedSetAllocator<b2ParticleSystem_FixtureParticle> {
    Initialize(bodyContactBuffer: b2GrowableBuffer<b2ParticleBodyContact>, flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>): void;
    Find(pair: b2ParticleSystem_FixtureParticle): number;
}
declare class b2ParticleSystem_ParticlePair {
    first: number;
    second: number;
    constructor(particleA: number, particleB: number);
}
declare class b2ParticlePairSet extends b2ParticleSystem_FixedSetAllocator<b2ParticleSystem_ParticlePair> {
    Initialize(contactBuffer: b2GrowableBuffer<b2ParticleContact>, flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>): void;
    Find(pair: b2ParticleSystem_ParticlePair): number;
}
declare class b2ParticleSystem_ConnectionFilter {
    /**
     * Is the particle necessary for connection?
     * A pair or a triad should contain at least one 'necessary'
     * particle.
     */
    IsNecessary(index: number): boolean;
    /**
     * An additional condition for creating a pair.
     */
    ShouldCreatePair(a: number, b: number): boolean;
    /**
     * An additional condition for creating a triad.
     */
    ShouldCreateTriad(a: number, b: number, c: number): boolean;
}
declare class b2ParticleSystem_DestroyParticlesInShapeCallback extends b2QueryCallback {
    m_system: b2ParticleSystem;
    m_shape: b2Shape;
    m_xf: b2Transform;
    m_callDestructionListener: boolean;
    m_destroyed: number;
    constructor(system: b2ParticleSystem, shape: b2Shape, xf: b2Transform, callDestructionListener: boolean);
    ReportFixture(fixture: b2Fixture): boolean;
    ReportParticle(particleSystem: b2ParticleSystem, index: number): boolean;
    Destroyed(): number;
}
declare class b2ParticleSystem_JoinParticleGroupsFilter extends b2ParticleSystem_ConnectionFilter {
    m_threshold: number;
    constructor(threshold: number);
    /**
     * An additional condition for creating a pair.
     */
    ShouldCreatePair(a: number, b: number): boolean;
    /**
     * An additional condition for creating a triad.
     */
    ShouldCreateTriad(a: number, b: number, c: number): boolean;
}
declare class b2ParticleSystem_CompositeShape extends b2Shape {
    constructor(shapes: b2Shape[], shapeCount?: number);
    m_shapes: b2Shape[];
    m_shapeCount: number;
    Clone(): b2Shape;
    GetChildCount(): number;
    /**
     * @see b2Shape::TestPoint
     */
    TestPoint(xf: b2Transform, p: XY): boolean;
    /**
     * @see b2Shape::ComputeDistance
     */
    ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number;
    /**
     * Implement b2Shape.
     */
    RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean;
    /**
     * @see b2Shape::ComputeAABB
     */
    ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;
    /**
     * @see b2Shape::ComputeMass
     */
    ComputeMass(massData: b2MassData, density: number): void;
    SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;
    ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
}
declare class b2ParticleSystem_ReactiveFilter extends b2ParticleSystem_ConnectionFilter {
    m_flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>;
    constructor(flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>);
    IsNecessary(index: number): boolean;
}
declare class b2ParticleSystem_UpdateBodyContactsCallback extends b2FixtureParticleQueryCallback {
    m_contactFilter: b2ContactFilter | null;
    constructor(system: b2ParticleSystem, contactFilter?: b2ContactFilter | null);
    ShouldCollideFixtureParticle(fixture: b2Fixture, particleSystem: b2ParticleSystem, particleIndex: number): boolean;
    ReportFixtureAndParticle(fixture: b2Fixture, childIndex: number, a: number): void;
    staticReportFixtureAndParticle_s_n: b2Vec2;
    staticReportFixtureAndParticle_s_rp: b2Vec2;
}
declare class b2ParticleSystem_SolveCollisionCallback extends b2FixtureParticleQueryCallback {
    m_step: b2TimeStep;
    constructor(system: b2ParticleSystem, step: b2TimeStep);
    ReportFixtureAndParticle(fixture: b2Fixture, childIndex: number, a: number): void;
    staticReportFixtureAndParticle_s_p1: b2Vec2;
    staticReportFixtureAndParticle_s_output: b2RayCastOutput;
    staticReportFixtureAndParticle_s_input: b2RayCastInput;
    staticReportFixtureAndParticle_s_p: b2Vec2;
    staticReportFixtureAndParticle_s_v: b2Vec2;
    staticReportFixtureAndParticle_s_f: b2Vec2;
    ReportParticle(system: b2ParticleSystem, index: number): boolean;
}

declare enum b2ParticleGroupFlag {
    b2_solidParticleGroup = 1,
    b2_rigidParticleGroup = 2,
    b2_particleGroupCanBeEmpty = 4,
    b2_particleGroupWillBeDestroyed = 8,
    b2_particleGroupNeedsUpdateDepth = 16,
    b2_particleGroupInternalMask = 24
}
interface b2IParticleGroupDef {
    flags?: b2ParticleFlag;
    groupFlags?: b2ParticleGroupFlag;
    position?: XY;
    angle?: number;
    linearVelocity?: XY;
    angularVelocity?: number;
    color?: RGBA;
    strength?: number;
    shape?: b2Shape;
    shapes?: b2Shape[];
    shapeCount?: number;
    stride?: number;
    particleCount?: number;
    positionData?: XY[];
    lifetime?: number;
    userData?: any;
    group?: b2ParticleGroup | null;
}
declare class b2ParticleGroupDef implements b2IParticleGroupDef {
    flags: b2ParticleFlag;
    groupFlags: b2ParticleGroupFlag;
   position: b2Vec2;
    angle: number;
   linearVelocity: b2Vec2;
    angularVelocity: number;
   color: b2Color;
    strength: number;
    shape?: b2Shape;
    shapes?: b2Shape[];
    shapeCount: number;
    stride: number;
    particleCount: number;
    positionData?: b2Vec2[];
    lifetime: number;
    userData: any;
    group: b2ParticleGroup | null;
}
declare class b2ParticleGroup {
   m_system: b2ParticleSystem;
    m_firstIndex: number;
    m_lastIndex: number;
    m_groupFlags: b2ParticleGroupFlag;
    m_strength: number;
    m_prev: b2ParticleGroup | null;
    m_next: b2ParticleGroup | null;
    m_timestamp: number;
    m_mass: number;
    m_inertia: number;
   m_center: b2Vec2;
   m_linearVelocity: b2Vec2;
    m_angularVelocity: number;
   m_transform: b2Transform;
    m_userData: any;
    constructor(system: b2ParticleSystem);
    GetNext(): b2ParticleGroup | null;
    GetParticleSystem(): b2ParticleSystem;
    GetParticleCount(): number;
    GetBufferIndex(): number;
    ContainsParticle(index: number): boolean;
    GetAllParticleFlags(): b2ParticleFlag;
    GetGroupFlags(): b2ParticleGroupFlag;
    SetGroupFlags(flags: number): void;
    GetMass(): number;
    GetInertia(): number;
    GetCenter(): Readonly<b2Vec2>;
    GetLinearVelocity(): Readonly<b2Vec2>;
    GetAngularVelocity(): number;
    GetTransform(): Readonly<b2Transform>;
    GetPosition(): Readonly<b2Vec2>;
    GetAngle(): number;
    GetLinearVelocityFromWorldPoint<T extends XY>(worldPoint: XY, out: T): T;
    staticGetLinearVelocityFromWorldPoint_s_t0: b2Vec2;
    GetUserData(): void;
    SetUserData(data: any): void;
    ApplyForce(force: XY): void;
    ApplyLinearImpulse(impulse: XY): void;
    DestroyParticles(callDestructionListener: boolean): void;
    UpdateStatistics(): void;
}

declare class b2DestructionListener {
    SayGoodbyeJoint(joint: b2Joint): void;
    SayGoodbyeFixture(fixture: b2Fixture): void;
    SayGoodbyeParticleGroup(group: b2ParticleGroup): void;
    SayGoodbyeParticle(system: b2ParticleSystem, index: number): void;
}
declare class b2ContactFilter {
    ShouldCollide(fixtureA: b2Fixture, fixtureB: b2Fixture): boolean;
    ShouldCollideFixtureParticle(fixture: b2Fixture, system: b2ParticleSystem, index: number): boolean;
    ShouldCollideParticleParticle(system: b2ParticleSystem, indexA: number, indexB: number): boolean;
    staticb2_defaultFilter: b2ContactFilter;
}
declare class b2ContactImpulse {
    normalImpulses: number[];
    tangentImpulses: number[];
    count: number;
}
declare class b2ContactListener {
    BeginContact(contact: b2Contact): void;
    EndContact(contact: b2Contact): void;
    BeginContactFixtureParticle(system: b2ParticleSystem, contact: b2ParticleBodyContact): void;
    EndContactFixtureParticle(system: b2ParticleSystem, contact: b2ParticleBodyContact): void;
    BeginContactParticleParticle(system: b2ParticleSystem, contact: b2ParticleContact): void;
    EndContactParticleParticle(system: b2ParticleSystem, contact: b2ParticleContact): void;
    PreSolve(contact: b2Contact, oldManifold: b2Manifold): void;
    PostSolve(contact: b2Contact, impulse: b2ContactImpulse): void;
    staticb2_defaultListener: b2ContactListener;
}
declare class b2QueryCallback {
    ReportFixture(fixture: b2Fixture): boolean;
    ReportParticle(system: b2ParticleSystem, index: number): boolean;
    ShouldQueryParticleSystem(system: b2ParticleSystem): boolean;
}
declare type b2QueryCallbackFunction = (fixture: b2Fixture) => boolean;
declare class b2RayCastCallback {
    ReportFixture(fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number): number;
    ReportParticle(system: b2ParticleSystem, index: number, point: b2Vec2, normal: b2Vec2, fraction: number): number;
    ShouldQueryParticleSystem(system: b2ParticleSystem): boolean;
}
declare type b2RayCastCallbackFunction = (fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number) => number;

declare function b2MixFriction(friction1: number, friction2: number): number;
declare function b2MixRestitution(restitution1: number, restitution2: number): number;
declare function b2MixRestitutionThreshold(threshold1: number, threshold2: number): number;
declare class b2ContactEdge {
    private _other;
    get other(): b2Body;
    set other(value: b2Body);
   contact: b2Contact;
    prev: b2ContactEdge | null;
    next: b2ContactEdge | null;
    constructor(contact: b2Contact);
    Reset(): void;
}
declare abstract class b2Contact<A extends b2Shape, B extends b2Shape> {
    m_islandFlag: boolean;
    m_touchingFlag: boolean;
    m_enabledFlag: boolean;
    m_filterFlag: boolean;
    m_bulletHitFlag: boolean;
    m_toiFlag: boolean;
    m_prev: b2Contact | null;
    m_next: b2Contact | null;
   m_nodeA: b2ContactEdge;
   m_nodeB: b2ContactEdge;
    m_fixtureA: b2Fixture;
    m_fixtureB: b2Fixture;
    m_indexA: number;
    m_indexB: number;
    m_manifold: b2Manifold;
    m_toiCount: number;
    m_toi: number;
    m_friction: number;
    m_restitution: number;
    m_restitutionThreshold: number;
    m_tangentSpeed: number;
    m_oldManifold: b2Manifold;
    GetManifold(): b2Manifold;
    GetWorldManifold(worldManifold: b2WorldManifold): void;
    IsTouching(): boolean;
    SetEnabled(flag: boolean): void;
    IsEnabled(): boolean;
    GetNext(): b2Contact | null;
    GetFixtureA(): b2Fixture;
    GetChildIndexA(): number;
    GetShapeA(): A;
    GetFixtureB(): b2Fixture;
    GetChildIndexB(): number;
    GetShapeB(): B;
    abstract Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
    FlagForFiltering(): void;
    SetFriction(friction: number): void;
    GetFriction(): number;
    ResetFriction(): void;
    SetRestitution(restitution: number): void;
    GetRestitution(): number;
    ResetRestitution(): void;
    SetRestitutionThreshold(threshold: number): void;
    GetRestitutionThreshold(): number;
    ResetRestitutionThreshold(): void;
    SetTangentSpeed(speed: number): void;
    GetTangentSpeed(): number;
    Reset(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): void;
    Update(listener: b2ContactListener): void;
    private static ComputeTOI_s_input;
    private static ComputeTOI_s_output;
    ComputeTOI(sweepA: b2Sweep, sweepB: b2Sweep): number;
}

declare enum b2BodyType {
    b2_unknown = -1,
    b2_staticBody = 0,
    b2_kinematicBody = 1,
    b2_dynamicBody = 2
}
interface b2IBodyDef {
    type?: b2BodyType;
    position?: XY;
    angle?: number;
    linearVelocity?: XY;
    angularVelocity?: number;
    linearDamping?: number;
    angularDamping?: number;
    allowSleep?: boolean;
    awake?: boolean;
    fixedRotation?: boolean;
    bullet?: boolean;
    enabled?: boolean;
    userData?: any;
    gravityScale?: number;
}
declare class b2BodyDef implements b2IBodyDef {
    type: b2BodyType;
   position: b2Vec2;
    angle: number;
   linearVelocity: b2Vec2;
    angularVelocity: number;
    linearDamping: number;
    angularDamping: number;
    allowSleep: boolean;
    awake: boolean;
    fixedRotation: boolean;
    bullet: boolean;
    enabled: boolean;
    userData: any;
    gravityScale: number;
}
declare class b2Body {
    m_type: b2BodyType;
    m_islandFlag: boolean;
    m_awakeFlag: boolean;
    m_autoSleepFlag: boolean;
    m_bulletFlag: boolean;
    m_fixedRotationFlag: boolean;
    m_enabledFlag: boolean;
    m_toiFlag: boolean;
    m_islandIndex: number;
   m_xf: b2Transform;
   m_xf0: b2Transform;
   m_sweep: b2Sweep;
   m_linearVelocity: b2Vec2;
    m_angularVelocity: number;
   m_force: b2Vec2;
    m_torque: number;
    m_world: b2World;
    m_prev: b2Body | null;
    m_next: b2Body | null;
    m_fixtureList: b2Fixture | null;
    m_fixtureCount: number;
    m_jointList: b2JointEdge | null;
    m_contactList: b2ContactEdge | null;
    m_mass: number;
    m_invMass: number;
    m_I: number;
    m_invI: number;
    m_linearDamping: number;
    m_angularDamping: number;
    m_gravityScale: number;
    m_sleepTime: number;
    m_userData: any;
    m_controllerList: b2ControllerEdge | null;
    m_controllerCount: number;
    constructor(bd: b2IBodyDef, world: b2World);
    CreateFixture(def: b2IFixtureDef): b2Fixture;
    CreateFixture(shape: b2Shape): b2Fixture;
    CreateFixture(shape: b2Shape, density: number): b2Fixture;
    CreateFixtureDef(def: b2IFixtureDef): b2Fixture;
    private static CreateFixtureShapeDensity_s_def;
    CreateFixtureShapeDensity(shape: b2Shape, density?: number): b2Fixture;
    DestroyFixture(fixture: b2Fixture): void;
    SetTransformVec(position: XY, angle: number): void;
    SetTransformXY(x: number, y: number, angle: number): void;
    SetTransform(xf: b2Transform): void;
    GetTransform(): Readonly<b2Transform>;
    GetPosition(): Readonly<b2Vec2>;
    SetPosition(position: XY): void;
    SetPositionXY(x: number, y: number): void;
    GetAngle(): number;
    SetAngle(angle: number): void;
    GetWorldCenter(): Readonly<b2Vec2>;
    GetLocalCenter(): Readonly<b2Vec2>;
    SetLinearVelocity(v: XY): void;
    GetLinearVelocity(): Readonly<b2Vec2>;
    SetAngularVelocity(w: number): void;
    GetAngularVelocity(): number;
    GetDefinition(bd: b2BodyDef): b2BodyDef;
    ApplyForce(force: XY, point: XY, wake?: boolean): void;
    ApplyForceToCenter(force: XY, wake?: boolean): void;
    ApplyTorque(torque: number, wake?: boolean): void;
    ApplyLinearImpulse(impulse: XY, point: XY, wake?: boolean): void;
    ApplyLinearImpulseToCenter(impulse: XY, wake?: boolean): void;
    ApplyAngularImpulse(impulse: number, wake?: boolean): void;
    GetMass(): number;
    GetInertia(): number;
    GetMassData(data: b2MassData): b2MassData;
    private static SetMassData_s_oldCenter;
    SetMassData(massData: b2MassData): void;
    private static ResetMassData_s_localCenter;
    private static ResetMassData_s_oldCenter;
    private static ResetMassData_s_massData;
    ResetMassData(): void;
    GetWorldPoint<T extends XY>(localPoint: XY, out: T): T;
    GetWorldVector<T extends XY>(localVector: XY, out: T): T;
    GetLocalPoint<T extends XY>(worldPoint: XY, out: T): T;
    GetLocalVector<T extends XY>(worldVector: XY, out: T): T;
    GetLinearVelocityFromWorldPoint<T extends XY>(worldPoint: XY, out: T): T;
    GetLinearVelocityFromLocalPoint<T extends XY>(localPoint: XY, out: T): T;
    GetLinearDamping(): number;
    SetLinearDamping(linearDamping: number): void;
    GetAngularDamping(): number;
    SetAngularDamping(angularDamping: number): void;
    GetGravityScale(): number;
    SetGravityScale(scale: number): void;
    SetType(type: b2BodyType): void;
    GetType(): b2BodyType;
    SetBullet(flag: boolean): void;
    IsBullet(): boolean;
    SetSleepingAllowed(flag: boolean): void;
    IsSleepingAllowed(): boolean;
    SetAwake(flag: boolean): void;
    IsAwake(): boolean;
    SetEnabled(flag: boolean): void;
    IsEnabled(): boolean;
    SetFixedRotation(flag: boolean): void;
    IsFixedRotation(): boolean;
    GetFixtureList(): b2Fixture | null;
    GetJointList(): b2JointEdge | null;
    GetContactList(): b2ContactEdge | null;
    GetNext(): b2Body | null;
    GetUserData(): any;
    SetUserData(data: any): void;
    GetWorld(): b2World;
    Dump(log: (format: string, ...args: any[]) => void): void;
    private static SynchronizeFixtures_s_xf1;
    SynchronizeFixtures(): void;
    SynchronizeTransform(): void;
    ShouldCollide(other: b2Body): boolean;
    ShouldCollideConnected(other: b2Body): boolean;
    Advance(alpha: number): void;
    GetControllerList(): b2ControllerEdge | null;
    GetControllerCount(): number;
}

declare enum b2JointType {
    e_unknownJoint = 0,
    e_revoluteJoint = 1,
    e_prismaticJoint = 2,
    e_distanceJoint = 3,
    e_pulleyJoint = 4,
    e_mouseJoint = 5,
    e_gearJoint = 6,
    e_wheelJoint = 7,
    e_weldJoint = 8,
    e_frictionJoint = 9,
    e_ropeJoint = 10,
    e_motorJoint = 11,
    e_areaJoint = 12
}
declare class b2Jacobian {
   linear: b2Vec2;
    angularA: number;
    angularB: number;
    SetZero(): b2Jacobian;
    Set(x: XY, a1: number, a2: number): b2Jacobian;
}
declare class b2JointEdge {
    private _other;
    get other(): b2Body;
    set other(value: b2Body);
   joint: b2Joint;
    prev: b2JointEdge | null;
    next: b2JointEdge | null;
    constructor(joint: b2Joint);
    Reset(): void;
}
interface b2IJointDef {
    type: b2JointType;
    userData?: any;
    bodyA: b2Body;
    bodyB: b2Body;
    collideConnected?: boolean;
}
declare abstract class b2JointDef implements b2IJointDef {
   type: b2JointType;
    userData: any;
    bodyA: b2Body;
    bodyB: b2Body;
    collideConnected: boolean;
    constructor(type: b2JointType);
}
declare function b2LinearStiffness(def: {
    stiffness: number;
    damping: number;
}, frequencyHertz: number, dampingRatio: number, bodyA: b2Body, bodyB: b2Body): void;
declare function b2AngularStiffness(def: {
    stiffness: number;
    damping: number;
}, frequencyHertz: number, dampingRatio: number, bodyA: b2Body, bodyB: b2Body): void;
declare abstract class b2Joint {
   m_type: b2JointType;
    m_prev: b2Joint | null;
    m_next: b2Joint | null;
   m_edgeA: b2JointEdge;
   m_edgeB: b2JointEdge;
    m_bodyA: b2Body;
    m_bodyB: b2Body;
    m_index: number;
    m_islandFlag: boolean;
    m_collideConnected: boolean;
    m_userData: any;
    constructor(def: b2IJointDef);
    GetType(): b2JointType;
    GetBodyA(): b2Body;
    GetBodyB(): b2Body;
    abstract GetAnchorA<T extends XY>(out: T): T;
    abstract GetAnchorB<T extends XY>(out: T): T;
    abstract GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    abstract GetReactionTorque(inv_dt: number): number;
    GetNext(): b2Joint | null;
    GetUserData(): any;
    SetUserData(data: any): void;
    IsEnabled(): boolean;
    GetCollideConnected(): boolean;
    Dump(log: (format: string, ...args: any[]) => void): void;
    ShiftOrigin(newOrigin: XY): void;
    private static Draw_s_p1;
    private static Draw_s_p2;
    private static Draw_s_color;
    private static Draw_s_c;
    Draw(draw: b2Draw): void;
    abstract InitVelocityConstraints(data: b2SolverData): void;
    abstract SolveVelocityConstraints(data: b2SolverData): void;
    abstract SolvePositionConstraints(data: b2SolverData): boolean;
}

interface b2IAreaJointDef extends b2IJointDef {
    bodies: b2Body[];
    stiffness?: number;
    damping?: number;
}
declare class b2AreaJointDef extends b2JointDef implements b2IAreaJointDef {
    bodies: b2Body[];
    stiffness: number;
    damping: number;
    constructor();
    AddBody(body: b2Body): void;
}
declare class b2AreaJoint extends b2Joint {
    m_bodies: b2Body[];
    m_stiffness: number;
    m_damping: number;
    m_impulse: number;
   m_targetLengths: number[];
    m_targetArea: number;
   m_normals: b2Vec2[];
   m_joints: b2DistanceJoint[];
   m_deltas: b2Vec2[];
   m_delta: b2Vec2;
    constructor(def: b2IAreaJointDef);
    GetAnchorA<T extends XY>(out: T): T;
    GetAnchorB<T extends XY>(out: T): T;
    GetReactionForce<T extends XY>(inv_dt: number, out: T): T;
    GetReactionTorque(inv_dt: number): number;
    SetStiffness(stiffness: number): void;
    GetStiffness(): number;
    SetDamping(damping: number): void;
    GetDamping(): number;
    Dump(log: (format: string, ...args: any[]) => void): void;
    InitVelocityConstraints(data: b2SolverData): void;
    SolveVelocityConstraints(data: b2SolverData): void;
    SolvePositionConstraints(data: b2SolverData): boolean;
}

declare class b2ChainAndCircleContact extends b2Contact<b2ChainShape, b2CircleShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    private static Evaluate_s_edge;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2ChainAndPolygonContact extends b2Contact<b2ChainShape, b2PolygonShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    private static Evaluate_s_edge;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2CircleContact extends b2Contact<b2CircleShape, b2CircleShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2EdgeAndCircleContact extends b2Contact<b2EdgeShape, b2CircleShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2EdgeAndPolygonContact extends b2Contact<b2EdgeShape, b2PolygonShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2PolygonAndCircleContact extends b2Contact<b2PolygonShape, b2CircleShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare class b2PolygonContact extends b2Contact<b2PolygonShape, b2PolygonShape> {
    static Create(): b2Contact;
    static Destroy(contact: b2Contact): void;
    Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;
}

declare enum b2StretchingModel {
    b2_pbdStretchingModel = 0,
    b2_xpbdStretchingModel = 1
}
declare enum b2BendingModel {
    b2_springAngleBendingModel = 0,
    b2_pbdAngleBendingModel = 1,
    b2_xpbdAngleBendingModel = 2,
    b2_pbdDistanceBendingModel = 3,
    b2_pbdHeightBendingModel = 4,
    b2_pbdTriangleBendingModel = 5
}
declare class b2RopeTuning {
    stretchingModel: b2StretchingModel;
    bendingModel: b2BendingModel;
    damping: number;
    stretchStiffness: number;
    stretchHertz: number;
    stretchDamping: number;
    bendStiffness: number;
    bendHertz: number;
    bendDamping: number;
    isometric: boolean;
    fixedEffectiveMass: boolean;
    warmStart: boolean;
    Copy(other: Readonly<b2RopeTuning>): this;
}
declare class b2RopeDef {
   position: b2Vec2;
   vertices: b2Vec2[];
    count: number;
   masses: number[];
   gravity: b2Vec2;
   tuning: b2RopeTuning;
}
declare class b2Rope {
    privatem_position;
    private m_count;
    private m_stretchCount;
    private m_bendCount;
    privatem_stretchConstraints;
    privatem_bendConstraints;
    privatem_bindPositions;
    privatem_ps;
    privatem_p0s;
    privatem_vs;
    privatem_invMasses;
    privatem_gravity;
    privatem_tuning;
    Create(def: b2RopeDef): void;
    SetTuning(tuning: b2RopeTuning): void;
    Step(dt: number, iterations: number, position: Readonly<b2Vec2>): void;
    Reset(position: Readonly<b2Vec2>): void;
    Draw(draw: b2Draw): void;
    private SolveStretch_PBD;
    private SolveStretch_XPBD;
    private SolveBend_PBD_Angle;
    private SolveBend_XPBD_Angle;
    private SolveBend_PBD_Distance;
    private SolveBend_PBD_Height;
    private SolveBend_PBD_Triangle;
    private ApplyBendForces;
}

/**
 * Calculates buoyancy forces for fluids in the form of a half
 * plane.
 */
declare class b2BuoyancyController extends b2Controller {
    /**
     * The outer surface normal
     */
   normal: b2Vec2;
    /**
     * The height of the fluid surface along the normal
     */
    offset: number;
    /**
     * The fluid density
     */
    density: number;
    /**
     * Fluid velocity, for drag calculations
     */
   velocity: b2Vec2;
    /**
     * Linear drag co-efficient
     */
    linearDrag: number;
    /**
     * Angular drag co-efficient
     */
    angularDrag: number;
    /**
     * If false, bodies are assumed to be uniformly dense, otherwise
     * use the shapes densities
     */
    useDensity: boolean;
    /**
     * If true, gravity is taken from the world instead of the
     */
    useWorldGravity: boolean;
    /**
     * Gravity vector, if the world's gravity is not used
     */
   gravity: b2Vec2;
    Step(step: b2TimeStep): void;
    Draw(debugDraw: b2Draw): void;
}

/**
 * Applies a force every frame
 */
declare class b2ConstantAccelController extends b2Controller {
    /**
     * The acceleration to apply
     */
   A: b2Vec2;
    Step(step: b2TimeStep): void;
    private static Step_s_dtA;
    Draw(draw: b2Draw): void;
}

/**
 * Applies a force every frame
 */
declare class b2ConstantForceController extends b2Controller {
    /**
     * The force to apply
     */
   F: b2Vec2;
    Step(step: b2TimeStep): void;
    Draw(draw: b2Draw): void;
}

/**
 * Applies simplified gravity between every pair of bodies
 */
declare class b2GravityController extends b2Controller {
    /**
     * Specifies the strength of the gravitiation force
     */
    G: number;
    /**
     * If true, gravity is proportional to r^-2, otherwise r^-1
     */
    invSqr: boolean;
    /**
     * @see b2Controller::Step
     */
    Step(step: b2TimeStep): void;
    private static Step_s_f;
    Draw(draw: b2Draw): void;
}

/**
 * Applies top down linear damping to the controlled bodies
 * The damping is calculated by multiplying velocity by a matrix
 * in local co-ordinates.
 */
declare class b2TensorDampingController extends b2Controller {
   T: b2Mat22;
    maxTimestep: number;
    /**
     * @see b2Controller::Step
     */
    Step(step: b2TimeStep): void;
    private static Step_s_damping;
    Draw(draw: b2Draw): void;
    /**
     * Sets damping independantly along the x and y axes
     */
    SetAxisAligned(xDamping: number, yDamping: number): void;
}

declare class b2StackQueue<T> {
   m_buffer: Array<T | null>;
    m_front: number;
    m_back: number;
    get m_capacity(): number;
    constructor(capacity: number);
    Push(item: T): void;
    Pop(): void;
    Empty(): boolean;
    Front(): T;
}

/**
 * A field representing the nearest generator from each point.
 */
declare class b2VoronoiDiagram {
    m_generatorBuffer: b2VoronoiDiagram_Generator[];
    m_generatorCapacity: number;
    m_generatorCount: number;
    m_countX: number;
    m_countY: number;
    m_diagram: b2VoronoiDiagram_Generator[];
    constructor(generatorCapacity: number);
    /**
     * Add a generator.
     *
     * @param center the position of the generator.
     * @param tag a tag used to identify the generator in callback functions.
     * @param necessary whether to callback for nodes associated with the generator.
     */
    AddGenerator(center: b2Vec2, tag: number, necessary: boolean): void;
    /**
     * Generate the Voronoi diagram. It is rasterized with a given
     * interval in the same range as the necessary generators exist.
     *
     * @param radius the interval of the diagram.
     * @param margin margin for which the range of the diagram is extended.
     */
    Generate(radius: number, margin: number): void;
    /**
     * Enumerate all nodes that contain at least one necessary
     * generator.
     */
    GetNodes(callback: b2VoronoiDiagram_NodeCallback): void;
}
/**
 * Callback used by GetNodes().
 *
 * Receive tags for generators associated with a node.
 */
declare type b2VoronoiDiagram_NodeCallback = (a: number, b: number, c: number) => void;
declare class b2VoronoiDiagram_Generator {
    center: b2Vec2;
    tag: number;
    necessary: boolean;
}
declare class b2VoronoiDiagram_Task {
    m_x: number;
    m_y: number;
    m_i: number;
    m_generator: b2VoronoiDiagram_Generator;
    constructor(x: number, y: number, i: number, g: b2VoronoiDiagram_Generator);
}

declare const staticBody = b2BodyType.b2_staticBody;
declare const kinematicBody = b2BodyType.b2_kinematicBody;
declare const dynamicBody = b2BodyType.b2_dynamicBody;

declare const springAngleBendingModel = b2BendingModel.b2_springAngleBendingModel;
declare const pbdAngleBendingModel = b2BendingModel.b2_pbdAngleBendingModel;
declare const xpbdAngleBendingModel = b2BendingModel.b2_xpbdAngleBendingModel;
declare const pbdDistanceBendingModel = b2BendingModel.b2_pbdDistanceBendingModel;
declare const pbdHeightBendingModel = b2BendingModel.b2_pbdHeightBendingModel;
declare const pbdTriangleBendingModel = b2BendingModel.b2_pbdTriangleBendingModel;

declare const pbdStretchingModel = b2StretchingModel.b2_pbdStretchingModel;
declare const xpbdStretchingModel = b2StretchingModel.b2_xpbdStretchingModel;
declare namespace b2{
export { b2AABB as AABB, b2Abs as Abs, b2Acos as Acos, b2Alloc as Alloc, b2AngularStiffness as AngularStiffness, b2AreaJoint as AreaJoint, b2AreaJointDef as AreaJointDef, b2Asin as Asin, b2Assert as Assert, b2Atan2 as Atan2, b2BendingModel as BendingModel, b2BlockAllocator as BlockAllocator, b2Body as Body, b2BodyDef as BodyDef, b2BodyType as BodyType, b2BroadPhase as BroadPhase, b2BuoyancyController as BuoyancyController, b2CalculateParticleIterations as CalculateParticleIterations, b2ChainAndCircleContact as ChainAndCircleContact, b2ChainAndPolygonContact as ChainAndPolygonContact, b2ChainShape as ChainShape, b2CircleContact as CircleContact, b2CircleShape as CircleShape, b2Clamp as Clamp, b2ClipSegmentToLine as ClipSegmentToLine, b2ClipVertex as ClipVertex, b2CollideCircles as CollideCircles, b2CollideEdgeAndCircle as CollideEdgeAndCircle, b2CollideEdgeAndPolygon as CollideEdgeAndPolygon, b2CollidePolygonAndCircle as CollidePolygonAndCircle, b2CollidePolygons as CollidePolygons, b2Color as Color, b2ConstantAccelController as ConstantAccelController, b2ConstantForceController as ConstantForceController, b2Contact as Contact, b2ContactEdge as ContactEdge, b2ContactFactory as ContactFactory, b2ContactFeature as ContactFeature, b2ContactFeatureType as ContactFeatureType, b2ContactFilter as ContactFilter, b2ContactID as ContactID, b2ContactImpulse as ContactImpulse, b2ContactListener as ContactListener, b2ContactManager as ContactManager, b2ContactPositionConstraint as ContactPositionConstraint, b2ContactRegister as ContactRegister, b2ContactSolver as ContactSolver, b2ContactSolverDef as ContactSolverDef, b2ContactVelocityConstraint as ContactVelocityConstraint, b2Controller as Controller, b2ControllerEdge as ControllerEdge, b2Cos as Cos, b2Counter as Counter, b2DegToRad as DegToRad, b2DestructionListener as DestructionListener, b2Distance as Distance, b2DistanceInput as DistanceInput, b2DistanceJoint as DistanceJoint, b2DistanceJointDef as DistanceJointDef, b2DistanceOutput as DistanceOutput, b2DistanceProxy as DistanceProxy, b2Draw as Draw, b2DrawFlags as DrawFlags, b2DynamicTree as DynamicTree, b2EdgeAndCircleContact as EdgeAndCircleContact, b2EdgeAndPolygonContact as EdgeAndPolygonContact, b2EdgeShape as EdgeShape, b2Filter as Filter, b2Fixture as Fixture, b2FixtureDef as FixtureDef, b2FixtureParticleQueryCallback as FixtureParticleQueryCallback, b2FixtureProxy as FixtureProxy, b2Free as Free, b2FrictionJoint as FrictionJoint, b2FrictionJointDef as FrictionJointDef, b2GearJoint as GearJoint, b2GearJointDef as GearJointDef, b2GetPointStates as GetPointStates, b2GravityController as GravityController, b2GrowableBuffer as GrowableBuffer, b2GrowableStack as GrowableStack, b2IAreaJointDef as IAreaJointDef, b2IBodyDef as IBodyDef, b2IDistanceJointDef as IDistanceJointDef, b2IFilter as IFilter, b2IFixtureDef as IFixtureDef, b2IFrictionJointDef as IFrictionJointDef, b2IGearJointDef as IGearJointDef, b2IJointDef as IJointDef, b2IMotorJointDef as IMotorJointDef, b2IMouseJointDef as IMouseJointDef, b2IParticleDef as IParticleDef, b2IParticleGroupDef as IParticleGroupDef, b2IPrismaticJointDef as IPrismaticJointDef, b2IPulleyJointDef as IPulleyJointDef, b2IRevoluteJointDef as IRevoluteJointDef, b2IWeldJointDef as IWeldJointDef, b2IWheelJointDef as IWheelJointDef, b2InvSqrt as InvSqrt, b2IsPowerOfTwo as IsPowerOfTwo, b2IsValid as IsValid, b2Island as Island, b2Jacobian as Jacobian, b2Joint as Joint, b2JointDef as JointDef, b2JointEdge as JointEdge, b2JointType as JointType, b2LinearStiffness as LinearStiffness, b2Log as Log, b2MakeArray as MakeArray, b2MakeNullArray as MakeNullArray, b2MakeNumberArray as MakeNumberArray, b2Manifold as Manifold, b2ManifoldPoint as ManifoldPoint, b2ManifoldType as ManifoldType, b2MassData as MassData, b2Mat22 as Mat22, b2Mat33 as Mat33, b2Max as Max, b2Maybe as Maybe, b2Min as Min, b2MixFriction as MixFriction, b2MixRestitution as MixRestitution, b2MixRestitutionThreshold as MixRestitutionThreshold, b2MotorJoint as MotorJoint, b2MotorJointDef as MotorJointDef, b2MouseJoint as MouseJoint, b2MouseJointDef as MouseJointDef, b2NextPowerOfTwo as NextPowerOfTwo, b2Pair as Pair, b2ParseInt as ParseInt, b2ParseUInt as ParseUInt, b2ParticleBodyContact as ParticleBodyContact, b2ParticleContact as ParticleContact, b2ParticleDef as ParticleDef, b2ParticleFlag as ParticleFlag, b2ParticleGroup as ParticleGroup, b2ParticleGroupDef as ParticleGroupDef, b2ParticleGroupFlag as ParticleGroupFlag, b2ParticleHandle as ParticleHandle, b2ParticleIndex as ParticleIndex, b2ParticlePair as ParticlePair, b2ParticlePairSet as ParticlePairSet, b2ParticleSystem as ParticleSystem, b2ParticleSystemDef as ParticleSystemDef, b2ParticleSystem_CompositeShape as ParticleSystem_CompositeShape, b2ParticleSystem_ConnectionFilter as ParticleSystem_ConnectionFilter, b2ParticleSystem_DestroyParticlesInShapeCallback as ParticleSystem_DestroyParticlesInShapeCallback, b2ParticleSystem_FixedSetAllocator as ParticleSystem_FixedSetAllocator, b2ParticleSystem_FixtureParticle as ParticleSystem_FixtureParticle, b2ParticleSystem_FixtureParticleSet as ParticleSystem_FixtureParticleSet, b2ParticleSystem_InsideBoundsEnumerator as ParticleSystem_InsideBoundsEnumerator, b2ParticleSystem_JoinParticleGroupsFilter as ParticleSystem_JoinParticleGroupsFilter, b2ParticleSystem_ParticleListNode as ParticleSystem_ParticleListNode, b2ParticleSystem_ParticlePair as ParticleSystem_ParticlePair, b2ParticleSystem_Proxy as ParticleSystem_Proxy, b2ParticleSystem_ReactiveFilter as ParticleSystem_ReactiveFilter, b2ParticleSystem_SolveCollisionCallback as ParticleSystem_SolveCollisionCallback, b2ParticleSystem_UpdateBodyContactsCallback as ParticleSystem_UpdateBodyContactsCallback, b2ParticleSystem_UserOverridableBuffer as ParticleSystem_UserOverridableBuffer, b2ParticleTriad as ParticleTriad, b2PointState as PointState, b2PolygonAndCircleContact as PolygonAndCircleContact, b2PolygonContact as PolygonContact, b2PolygonShape as PolygonShape, b2Position as Position, b2PositionSolverManifold as PositionSolverManifold, b2Pow as Pow, b2PrismaticJoint as PrismaticJoint, b2PrismaticJointDef as PrismaticJointDef, b2Profile as Profile, b2PulleyJoint as PulleyJoint, b2PulleyJointDef as PulleyJointDef, b2QueryCallback as QueryCallback, b2QueryCallbackFunction as QueryCallbackFunction, RGB, RGBA, b2RadToDeg as RadToDeg, b2Random as Random, b2RandomRange as RandomRange, b2RayCastCallback as RayCastCallback, b2RayCastCallbackFunction as RayCastCallbackFunction, b2RayCastInput as RayCastInput, b2RayCastOutput as RayCastOutput, b2RevoluteJoint as RevoluteJoint, b2RevoluteJointDef as RevoluteJointDef, b2Rope as Rope, b2RopeDef as RopeDef, b2RopeTuning as RopeTuning, b2Rot as Rot, b2SeparationFunction as SeparationFunction, b2SeparationFunctionType as SeparationFunctionType, b2Shape as Shape, b2ShapeCast as ShapeCast, b2ShapeCastInput as ShapeCastInput, b2ShapeCastOutput as ShapeCastOutput, b2ShapeType as ShapeType, b2Simplex as Simplex, b2SimplexCache as SimplexCache, b2SimplexVertex as SimplexVertex, b2Sin as Sin, b2SolverData as SolverData, b2Sq as Sq, b2Sqrt as Sqrt, b2StackAllocator as StackAllocator, b2StackQueue as StackQueue, b2StretchingModel as StretchingModel, b2Swap as Swap, b2Sweep as Sweep, b2TOIInput as TOIInput, b2TOIOutput as TOIOutput, b2TOIOutputState as TOIOutputState, b2TensorDampingController as TensorDampingController, b2TestOverlapAABB as TestOverlapAABB, b2TestOverlapShape as TestOverlapShape, b2TimeOfImpact as TimeOfImpact, b2TimeStep as TimeStep, b2Timer as Timer, b2Transform as Transform, b2TreeNode as TreeNode, b2Vec2 as Vec2, b2Vec2_zero as Vec2_zero, b2Vec3 as Vec3, b2Velocity as Velocity, b2VelocityConstraintPoint as VelocityConstraintPoint, b2Version as Version, b2VoronoiDiagram as VoronoiDiagram, b2VoronoiDiagram_Generator as VoronoiDiagram_Generator, b2VoronoiDiagram_NodeCallback as VoronoiDiagram_NodeCallback, b2VoronoiDiagram_Task as VoronoiDiagram_Task, b2WeldJoint as WeldJoint, b2WeldJointDef as WeldJointDef, b2WheelJoint as WheelJoint, b2WheelJointDef as WheelJointDef, b2World as World, b2WorldManifold as WorldManifold, XY, XYZ, b2_180_over_pi as _180_over_pi, b2_pi_over_180 as _pi_over_180, b2_aabbExtension as aabbExtension, b2_aabbMultiplier as aabbMultiplier, b2_angularSleepTolerance as angularSleepTolerance, b2_angularSlop as angularSlop, b2_barrierCollisionTime as barrierCollisionTime, b2_baumgarte as baumgarte, g_blockSolve as blockSolve, b2_branch as branch, b2_commit as commit, dynamicBody, b2_epsilon as epsilon, b2_epsilon_sq as epsilon_sq, get_g_blockSolve, b2_gjkCalls as gjkCalls, b2_gjkIters as gjkIters, b2_gjkMaxIters as gjkMaxIters, b2_gjk_reset as gjk_reset, b2_invalidParticleIndex as invalidParticleIndex, kinematicBody, b2_lengthUnitsPerMeter as lengthUnitsPerMeter, b2_linearSleepTolerance as linearSleepTolerance, b2_linearSlop as linearSlop, b2_maxAngularCorrection as maxAngularCorrection, b2_maxFloat as maxFloat, b2_maxLinearCorrection as maxLinearCorrection, b2_maxManifoldPoints as maxManifoldPoints, b2_maxParticleForce as maxParticleForce, b2_maxParticleIndex as maxParticleIndex, b2_maxParticlePressure as maxParticlePressure, b2_maxPolygonVertices as maxPolygonVertices, b2_maxRotation as maxRotation, b2_maxRotationSquared as maxRotationSquared, b2_maxSubSteps as maxSubSteps, b2_maxTOIContacts as maxTOIContacts, b2_maxTranslation as maxTranslation, b2_maxTranslationSquared as maxTranslationSquared, b2_maxTriadDistance as maxTriadDistance, b2_maxTriadDistanceSquared as maxTriadDistanceSquared, b2_minParticleSystemBufferCapacity as minParticleSystemBufferCapacity, b2_minParticleWeight as minParticleWeight, b2_minPulleyLength as minPulleyLength, b2_particleStride as particleStride, pbdAngleBendingModel, pbdDistanceBendingModel, pbdHeightBendingModel, pbdStretchingModel, pbdTriangleBendingModel, b2_pi as pi, b2_polygonRadius as polygonRadius, set_g_blockSolve, springAngleBendingModel, staticBody, b2_timeToSleep as timeToSleep, b2_toiBaumgarte as toiBaumgarte, b2_toiCalls as toiCalls, b2_toiIters as toiIters, b2_toiMaxIters as toiMaxIters, b2_toiMaxRootIters as toiMaxRootIters, b2_toiMaxTime as toiMaxTime, b2_toiRootIters as toiRootIters, b2_toiTime as toiTime, b2_toi_reset as toi_reset, b2_two_pi as two_pi, b2_version as version, xpbdAngleBendingModel, xpbdStretchingModel };
}