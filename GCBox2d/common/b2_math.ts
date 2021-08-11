/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 


 const b2_pi_over_180: number = b2_pi / 180;
 const b2_180_over_pi: number = 180 / b2_pi;
 const b2_two_pi: number = 2 * b2_pi;

 const b2Abs = Math.abs;

 function b2Min(a: number, b: number): number { return a < b ? a : b; }
 function b2Max(a: number, b: number): number { return a > b ? a : b; }

 function b2Clamp(a: number, lo: number, hi: number): number {
  return (a < lo) ? (lo) : ((a > hi) ? (hi) : (a));
}

 function b2Swap<T>(a: T[], b: T[]): void {
  // DEBUG: b2Assert(false);
  const tmp: T = a[0];
  a[0] = b[0];
  b[0] = tmp;
}

/// This function is used to ensure that a floating point number is
/// not a NaN or infinity.
 const b2IsValid = isFinite;

 function b2Sq(n: number): number {
  return n * n;
}

/// This is a approximate yet fast inverse square-root.
 function b2InvSqrt(n: number): number {
  return 1 / Math.sqrt(n);
}

 const b2Sqrt = Math.sqrt;

 const b2Pow = Math.pow;

 function b2DegToRad(degrees: number): number {
  return degrees * b2_pi_over_180;
}

 function b2RadToDeg(radians: number): number {
  return radians * b2_180_over_pi;
}

 const b2Cos = Math.cos;
 const b2Sin = Math.sin;
 const b2Acos = Math.acos;
 const b2Asin = Math.asin;
 const b2Atan2 = Math.atan2;

 function b2NextPowerOfTwo(x: number): number {
  x |= (x >> 1) & 0x7FFFFFFF;
  x |= (x >> 2) & 0x3FFFFFFF;
  x |= (x >> 4) & 0x0FFFFFFF;
  x |= (x >> 8) & 0x00FFFFFF;
  x |= (x >> 16) & 0x0000FFFF;
  return x + 1;
}

 function b2IsPowerOfTwo(x: number): boolean {
  return x > 0 && (x & (x - 1)) === 0;
}

 function b2Random(): number {
  return Math.random() * 2 - 1;
}

 function b2RandomRange(lo: number, hi: number): number {
  return (hi - lo) * Math.random() + lo;
}

 interface XY {
  x: number;
  y: number;
}

 class b2TypedVec2 implements b2Vec2 {
  public  data: Float32Array;
  public get x(): number { return this.data[0]; } public set x(value: number) { this.data[0] = value; }
  public get y(): number { return this.data[1]; } public set y(value: number) { this.data[1] = value; }

  constructor();
  constructor(data: Float32Array);
  constructor(x: number, y: number);
  constructor(...args: any[]) {
    if (args[0] instanceof Float32Array) {
      if (args[0].length !== 2) { throw new Error(); }
      this.data = args[0];
    } else {
      const x: number = typeof args[0] === "number" ? args[0] : 0;
      const y: number = typeof args[1] === "number" ? args[1] : 0;
      this.data = new Float32Array([ x, y ]);
    }
  }

  public Clone(): b2TypedVec2 {
    return new b2TypedVec2(new Float32Array(this.data));
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
    if (other instanceof b2TypedVec2) {
      this.data.set(other.data);
    }
    else {
      this.x = other.x;
      this.y = other.y;
    }
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
}

 interface XYZ extends XY {
  z: number;
}

/// A 2D column vector with 3 elements.
 class b2Vec3 implements XYZ {
  public static  ZERO: b2Vec3 = new b2Vec3(0, 0, 0);

  public static  s_t0: b2Vec3 = new b2Vec3();

  public  data: Float32Array;
  public get x(): number { return this.data[0]; } public set x(value: number) { this.data[0] = value; }
  public get y(): number { return this.data[1]; } public set y(value: number) { this.data[1] = value; }
  public get z(): number { return this.data[2]; } public set z(value: number) { this.data[2] = value; }

  constructor();
  constructor(data: Float32Array);
  constructor(x: number, y: number, z: number);
  constructor(...args: any[]) {
    if (args[0] instanceof Float32Array) {
      if (args[0].length !== 3) { throw new Error(); }
      this.data = args[0];
    } else {
      const x: number = typeof args[0] === "number" ? args[0] : 0;
      const y: number = typeof args[1] === "number" ? args[1] : 0;
      const z: number = typeof args[2] === "number" ? args[2] : 0;
      this.data = new Float32Array([ x, y, z ]);
    }
  }

  public Clone(): b2Vec3 {
    return new b2Vec3(this.x, this.y, this.z);
  }

  public SetZero(): this {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  public SetXYZ(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public Copy(other: XYZ): this {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  public SelfNeg(): this {
    this.x = (-this.x);
    this.y = (-this.y);
    this.z = (-this.z);
    return this;
  }

  public SelfAdd(v: XYZ): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public SelfAddXYZ(x: number, y: number, z: number): this {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  }

  public SelfSub(v: XYZ): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public SelfSubXYZ(x: number, y: number, z: number): this {
    this.x -= x;
    this.y -= y;
    this.z -= z;
    return this;
  }

  public SelfMul(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  public static DotV3V3(a: XYZ, b: XYZ): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  public static CrossV3V3<T extends XYZ>(a: XYZ, b: XYZ, out: T): T {
    const a_x: number = a.x, a_y = a.y, a_z = a.z;
    const b_x: number = b.x, b_y = b.y, b_z = b.z;
    out.x = a_y * b_z - a_z * b_y;
    out.y = a_z * b_x - a_x * b_z;
    out.z = a_x * b_y - a_y * b_x;
    return out;
  }
}

/// A 2-by-2 matrix. Stored in column-major order.
 class b2Mat22 {
  public static  IDENTITY: b2Mat22 = new b2Mat22();

  // public  data: Float32Array = new Float32Array([ 1, 0, 0, 1 ]);
  // public  ex: b2Vec2 = new b2Vec2(this.data.subarray(0, 2));
  // public  ey: b2Vec2 = new b2Vec2(this.data.subarray(2, 4));

  public  ex: b2Vec2 = new b2Vec2(1, 0);
  public  ey: b2Vec2 = new b2Vec2(0, 1);

  public Clone(): b2Mat22 {
    return new b2Mat22().Copy(this);
  }

  public static FromVV(c1: XY, c2: XY): b2Mat22 {
    return new b2Mat22().SetVV(c1, c2);
  }

  public static FromSSSS(r1c1: number, r1c2: number, r2c1: number, r2c2: number): b2Mat22 {
    return new b2Mat22().SetSSSS(r1c1, r1c2, r2c1, r2c2);
  }

  public static FromAngle(radians: number): b2Mat22 {
    return new b2Mat22().SetAngle(radians);
  }

  public SetSSSS(r1c1: number, r1c2: number, r2c1: number, r2c2: number): this {
    this.ex.Set(r1c1, r2c1);
    this.ey.Set(r1c2, r2c2);
    return this;
  }

  public SetVV(c1: XY, c2: XY): this {
    this.ex.Copy(c1);
    this.ey.Copy(c2);
    return this;
  }

  public SetAngle(radians: number): this {
    const c: number = Math.cos(radians);
    const s: number = Math.sin(radians);
    this.ex.Set( c, s);
    this.ey.Set(-s, c);
    return this;
  }

  public Copy(other: b2Mat22): this {
    this.ex.Copy(other.ex);
    this.ey.Copy(other.ey);
    return this;
  }

  public SetIdentity(): this {
    this.ex.Set(1, 0);
    this.ey.Set(0, 1);
    return this;
  }

  public SetZero(): this {
    this.ex.SetZero();
    this.ey.SetZero();
    return this;
  }

  public GetAngle(): number {
    return Math.atan2(this.ex.y, this.ex.x);
  }

  public GetInverse(out: b2Mat22): b2Mat22 {
    const a: number = this.ex.x;
    const b: number = this.ey.x;
    const c: number = this.ex.y;
    const d: number = this.ey.y;
    let det: number = a * d - b * c;
    if (det !== 0) {
      det = 1 / det;
    }
    out.ex.x =   det * d;
    out.ey.x = (-det * b);
    out.ex.y = (-det * c);
    out.ey.y =   det * a;
    return out;
  }

  public Solve<T extends XY>(b_x: number, b_y: number, out: T): T {
    const a11: number = this.ex.x, a12 = this.ey.x;
    const a21: number = this.ex.y, a22 = this.ey.y;
    let det: number = a11 * a22 - a12 * a21;
    if (det !== 0) {
      det = 1 / det;
    }
    out.x = det * (a22 * b_x - a12 * b_y);
    out.y = det * (a11 * b_y - a21 * b_x);
    return out;
  }

  public SelfAbs(): this {
    this.ex.SelfAbs();
    this.ey.SelfAbs();
    return this;
  }

  public SelfInv(): this {
    this.GetInverse(this);
    return this;
  }

  public SelfAddM(M: b2Mat22): this {
    this.ex.SelfAdd(M.ex);
    this.ey.SelfAdd(M.ey);
    return this;
  }

  public SelfSubM(M: b2Mat22): this {
    this.ex.SelfSub(M.ex);
    this.ey.SelfSub(M.ey);
    return this;
  }

  public static AbsM(M: b2Mat22, out: b2Mat22): b2Mat22 {
    const M_ex: b2Vec2 = M.ex, M_ey: b2Vec2 = M.ey;
    out.ex.x = b2Abs(M_ex.x);
    out.ex.y = b2Abs(M_ex.y);
    out.ey.x = b2Abs(M_ey.x);
    out.ey.y = b2Abs(M_ey.y);
    return out;
  }

  public static MulMV<T extends XY>(M: b2Mat22, v: XY, out: T): T {
    const M_ex: b2Vec2 = M.ex, M_ey: b2Vec2 = M.ey;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = M_ex.x * v_x + M_ey.x * v_y;
    out.y = M_ex.y * v_x + M_ey.y * v_y;
    return out;
  }

  public static MulTMV<T extends XY>(M: b2Mat22, v: XY, out: T): T {
    const M_ex: b2Vec2 = M.ex, M_ey: b2Vec2 = M.ey;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = M_ex.x * v_x + M_ex.y * v_y;
    out.y = M_ey.x * v_x + M_ey.y * v_y;
    return out;
  }

  public static AddMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22 {
    const A_ex: b2Vec2 = A.ex, A_ey: b2Vec2 = A.ey;
    const B_ex: b2Vec2 = B.ex, B_ey: b2Vec2 = B.ey;
    out.ex.x = A_ex.x + B_ex.x;
    out.ex.y = A_ex.y + B_ex.y;
    out.ey.x = A_ey.x + B_ey.x;
    out.ey.y = A_ey.y + B_ey.y;
    return out;
  }

  public static MulMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22 {
    const A_ex_x: number = A.ex.x, A_ex_y: number = A.ex.y;
    const A_ey_x: number = A.ey.x, A_ey_y: number = A.ey.y;
    const B_ex_x: number = B.ex.x, B_ex_y: number = B.ex.y;
    const B_ey_x: number = B.ey.x, B_ey_y: number = B.ey.y;
    out.ex.x = A_ex_x * B_ex_x + A_ey_x * B_ex_y;
    out.ex.y = A_ex_y * B_ex_x + A_ey_y * B_ex_y;
    out.ey.x = A_ex_x * B_ey_x + A_ey_x * B_ey_y;
    out.ey.y = A_ex_y * B_ey_x + A_ey_y * B_ey_y;
    return out;
  }

  public static MulTMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22 {
    const A_ex_x: number = A.ex.x, A_ex_y: number = A.ex.y;
    const A_ey_x: number = A.ey.x, A_ey_y: number = A.ey.y;
    const B_ex_x: number = B.ex.x, B_ex_y: number = B.ex.y;
    const B_ey_x: number = B.ey.x, B_ey_y: number = B.ey.y;
    out.ex.x = A_ex_x * B_ex_x + A_ex_y * B_ex_y;
    out.ex.y = A_ey_x * B_ex_x + A_ey_y * B_ex_y;
    out.ey.x = A_ex_x * B_ey_x + A_ex_y * B_ey_y;
    out.ey.y = A_ey_x * B_ey_x + A_ey_y * B_ey_y;
    return out;
  }
}

/// A 3-by-3 matrix. Stored in column-major order.
 class b2Mat33 {
  public static  IDENTITY: b2Mat33 = new b2Mat33();

  public  data: Float32Array = new Float32Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
  public  ex: b2Vec3 = new b2Vec3(this.data.subarray(0, 3));
  public  ey: b2Vec3 = new b2Vec3(this.data.subarray(3, 6));
  public  ez: b2Vec3 = new b2Vec3(this.data.subarray(6, 9));

  public Clone(): b2Mat33 {
    return new b2Mat33().Copy(this);
  }

  public SetVVV(c1: XYZ, c2: XYZ, c3: XYZ): this {
    this.ex.Copy(c1);
    this.ey.Copy(c2);
    this.ez.Copy(c3);
    return this;
  }

  public Copy(other: b2Mat33): this {
    this.ex.Copy(other.ex);
    this.ey.Copy(other.ey);
    this.ez.Copy(other.ez);
    return this;
  }

  public SetIdentity(): this {
    this.ex.SetXYZ(1, 0, 0);
    this.ey.SetXYZ(0, 1, 0);
    this.ez.SetXYZ(0, 0, 1);
    return this;
  }

  public SetZero(): this {
    this.ex.SetZero();
    this.ey.SetZero();
    this.ez.SetZero();
    return this;
  }

  public SelfAddM(M: b2Mat33): this {
    this.ex.SelfAdd(M.ex);
    this.ey.SelfAdd(M.ey);
    this.ez.SelfAdd(M.ez);
    return this;
  }

  public Solve33<T extends XYZ>(b_x: number, b_y: number, b_z: number, out: T): T {
    const a11: number = this.ex.x, a21: number = this.ex.y, a31: number = this.ex.z;
    const a12: number = this.ey.x, a22: number = this.ey.y, a32: number = this.ey.z;
    const a13: number = this.ez.x, a23: number = this.ez.y, a33: number = this.ez.z;
    let det: number = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
    if (det !== 0) {
      det = 1 / det;
    }
    out.x = det * (b_x * (a22 * a33 - a32 * a23) + b_y * (a32 * a13 - a12 * a33) + b_z * (a12 * a23 - a22 * a13));
    out.y = det * (a11 * (b_y * a33 - b_z * a23) + a21 * (b_z * a13 - b_x * a33) + a31 * (b_x * a23 - b_y * a13));
    out.z = det * (a11 * (a22 * b_z - a32 * b_y) + a21 * (a32 * b_x - a12 * b_z) + a31 * (a12 * b_y - a22 * b_x));
    return out;
  }

  public Solve22<T extends XY>(b_x: number, b_y: number, out: T): T {
    const a11: number = this.ex.x, a12: number = this.ey.x;
    const a21: number = this.ex.y, a22: number = this.ey.y;
    let det: number = a11 * a22 - a12 * a21;
    if (det !== 0) {
      det = 1 / det;
    }
    out.x = det * (a22 * b_x - a12 * b_y);
    out.y = det * (a11 * b_y - a21 * b_x);
    return out;
  }

  public GetInverse22(M: b2Mat33): void {
    const a: number = this.ex.x, b: number = this.ey.x, c: number = this.ex.y, d: number = this.ey.y;
    let det: number = a * d - b * c;
    if (det !== 0) {
      det = 1 / det;
    }

    M.ex.x =  det * d; M.ey.x = -det * b; M.ex.z = 0;
    M.ex.y = -det * c; M.ey.y =  det * a; M.ey.z = 0;
    M.ez.x =        0; M.ez.y =        0; M.ez.z = 0;
  }

  public GetSymInverse33(M: b2Mat33): void {
    let det: number = b2Vec3.DotV3V3(this.ex, b2Vec3.CrossV3V3(this.ey, this.ez, b2Vec3.s_t0));
    if (det !== 0) {
      det = 1 / det;
    }

    const a11: number = this.ex.x, a12: number = this.ey.x, a13: number = this.ez.x;
    const a22: number = this.ey.y, a23: number = this.ez.y;
    const a33: number = this.ez.z;

    M.ex.x = det * (a22 * a33 - a23 * a23);
    M.ex.y = det * (a13 * a23 - a12 * a33);
    M.ex.z = det * (a12 * a23 - a13 * a22);

    M.ey.x = M.ex.y;
    M.ey.y = det * (a11 * a33 - a13 * a13);
    M.ey.z = det * (a13 * a12 - a11 * a23);

    M.ez.x = M.ex.z;
    M.ez.y = M.ey.z;
    M.ez.z = det * (a11 * a22 - a12 * a12);
  }

  public static MulM33V3<T extends XYZ>(A: b2Mat33, v: XYZ, out: T): T {
    const v_x: number = v.x, v_y: number = v.y, v_z: number = v.z;
    out.x = A.ex.x * v_x + A.ey.x * v_y + A.ez.x * v_z;
    out.y = A.ex.y * v_x + A.ey.y * v_y + A.ez.y * v_z;
    out.z = A.ex.z * v_x + A.ey.z * v_y + A.ez.z * v_z;
    return out;
  }
  public static MulM33XYZ<T extends XYZ>(A: b2Mat33, x: number, y: number, z: number, out: T): T {
    out.x = A.ex.x * x + A.ey.x * y + A.ez.x * z;
    out.y = A.ex.y * x + A.ey.y * y + A.ez.y * z;
    out.z = A.ex.z * x + A.ey.z * y + A.ez.z * z;
    return out;
  }
  public static MulM33V2<T extends XY>(A: b2Mat33, v: XY, out: T): T {
    const v_x: number = v.x, v_y: number = v.y;
    out.x = A.ex.x * v_x + A.ey.x * v_y;
    out.y = A.ex.y * v_x + A.ey.y * v_y;
    return out;
  }
  public static MulM33XY<T extends XY>(A: b2Mat33, x: number, y: number, out: T): T {
    out.x = A.ex.x * x + A.ey.x * y;
    out.y = A.ex.y * x + A.ey.y * y;
    return out;
  }
}