var b2_pi_over_180 = b2_pi / 180;
var b2_180_over_pi = 180 / b2_pi;
var b2_two_pi = 2 * b2_pi;
var b2Abs = Math.abs;
function b2Min(a, b) { return a < b ? a : b; }
function b2Max(a, b) { return a > b ? a : b; }
function b2Clamp(a, lo, hi) {
    return (a < lo) ? (lo) : ((a > hi) ? (hi) : (a));
}
function b2Swap(a, b) {
    var tmp = a[0];
    a[0] = b[0];
    b[0] = tmp;
}
var b2IsValid = isFinite;
function b2Sq(n) {
    return n * n;
}
function b2InvSqrt(n) {
    return 1 / Math.sqrt(n);
}
var b2Sqrt = Math.sqrt;
var b2Pow = Math.pow;
function b2DegToRad(degrees) {
    return degrees * b2_pi_over_180;
}
function b2RadToDeg(radians) {
    return radians * b2_180_over_pi;
}
var b2Cos = Math.cos;
var b2Sin = Math.sin;
var b2Acos = Math.acos;
var b2Asin = Math.asin;
var b2Atan2 = Math.atan2;
function b2NextPowerOfTwo(x) {
    x |= (x >> 1) & 0x7FFFFFFF;
    x |= (x >> 2) & 0x3FFFFFFF;
    x |= (x >> 4) & 0x0FFFFFFF;
    x |= (x >> 8) & 0x00FFFFFF;
    x |= (x >> 16) & 0x0000FFFF;
    return x + 1;
}
function b2IsPowerOfTwo(x) {
    return x > 0 && (x & (x - 1)) === 0;
}
function b2Random() {
    return Math.random() * 2 - 1;
}
function b2RandomRange(lo, hi) {
    return (hi - lo) * Math.random() + lo;
}
var b2TypedVec2 = (function () {
    function b2TypedVec2() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args[0] instanceof Float32Array) {
            if (args[0].length !== 2) {
                throw new Error();
            }
            this.data = args[0];
        }
        else {
            var x = typeof args[0] === "number" ? args[0] : 0;
            var y = typeof args[1] === "number" ? args[1] : 0;
            this.data = new Float32Array([x, y]);
        }
    }
    Object.defineProperty(b2TypedVec2.prototype, "x", {
        get: function () { return this.data[0]; },
        set: function (value) { this.data[0] = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(b2TypedVec2.prototype, "y", {
        get: function () { return this.data[1]; },
        set: function (value) { this.data[1] = value; },
        enumerable: true,
        configurable: true
    });
    b2TypedVec2.prototype.Clone = function () {
        return new b2TypedVec2(new Float32Array(this.data));
    };
    b2TypedVec2.prototype.SetZero = function () {
        this.x = 0;
        this.y = 0;
        return this;
    };
    b2TypedVec2.prototype.Set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    b2TypedVec2.prototype.Copy = function (other) {
        if (other instanceof b2TypedVec2) {
            this.data.set(other.data);
        }
        else {
            this.x = other.x;
            this.y = other.y;
        }
        return this;
    };
    b2TypedVec2.prototype.SelfAdd = function (v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    b2TypedVec2.prototype.SelfAddXY = function (x, y) {
        this.x += x;
        this.y += y;
        return this;
    };
    b2TypedVec2.prototype.SelfSub = function (v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };
    b2TypedVec2.prototype.SelfSubXY = function (x, y) {
        this.x -= x;
        this.y -= y;
        return this;
    };
    b2TypedVec2.prototype.SelfMul = function (s) {
        this.x *= s;
        this.y *= s;
        return this;
    };
    b2TypedVec2.prototype.SelfMulAdd = function (s, v) {
        this.x += s * v.x;
        this.y += s * v.y;
        return this;
    };
    b2TypedVec2.prototype.SelfMulSub = function (s, v) {
        this.x -= s * v.x;
        this.y -= s * v.y;
        return this;
    };
    b2TypedVec2.prototype.Dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    b2TypedVec2.prototype.Cross = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    b2TypedVec2.prototype.Length = function () {
        var x = this.x, y = this.y;
        return Math.sqrt(x * x + y * y);
    };
    b2TypedVec2.prototype.LengthSquared = function () {
        var x = this.x, y = this.y;
        return (x * x + y * y);
    };
    b2TypedVec2.prototype.Normalize = function () {
        var length = this.Length();
        if (length >= b2_epsilon) {
            var inv_length = 1 / length;
            this.x *= inv_length;
            this.y *= inv_length;
        }
        return length;
    };
    b2TypedVec2.prototype.SelfNormalize = function () {
        var length = this.Length();
        if (length >= b2_epsilon) {
            var inv_length = 1 / length;
            this.x *= inv_length;
            this.y *= inv_length;
        }
        return this;
    };
    b2TypedVec2.prototype.SelfRotate = function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        var x = this.x;
        this.x = c * x - s * this.y;
        this.y = s * x + c * this.y;
        return this;
    };
    b2TypedVec2.prototype.SelfRotateCosSin = function (c, s) {
        var x = this.x;
        this.x = c * x - s * this.y;
        this.y = s * x + c * this.y;
        return this;
    };
    b2TypedVec2.prototype.IsValid = function () {
        return isFinite(this.x) && isFinite(this.y);
    };
    b2TypedVec2.prototype.SelfCrossVS = function (s) {
        var x = this.x;
        this.x = s * this.y;
        this.y = -s * x;
        return this;
    };
    b2TypedVec2.prototype.SelfCrossSV = function (s) {
        var x = this.x;
        this.x = -s * this.y;
        this.y = s * x;
        return this;
    };
    b2TypedVec2.prototype.SelfMinV = function (v) {
        this.x = b2Min(this.x, v.x);
        this.y = b2Min(this.y, v.y);
        return this;
    };
    b2TypedVec2.prototype.SelfMaxV = function (v) {
        this.x = b2Max(this.x, v.x);
        this.y = b2Max(this.y, v.y);
        return this;
    };
    b2TypedVec2.prototype.SelfAbs = function () {
        this.x = b2Abs(this.x);
        this.y = b2Abs(this.y);
        return this;
    };
    b2TypedVec2.prototype.SelfNeg = function () {
        this.x = (-this.x);
        this.y = (-this.y);
        return this;
    };
    b2TypedVec2.prototype.SelfSkew = function () {
        var x = this.x;
        this.x = -this.y;
        this.y = x;
        return this;
    };
    return b2TypedVec2;
}());
var b2Vec3 = (function () {
    function b2Vec3() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (args[0] instanceof Float32Array) {
            if (args[0].length !== 3) {
                throw new Error();
            }
            this.data = args[0];
        }
        else {
            var x = typeof args[0] === "number" ? args[0] : 0;
            var y = typeof args[1] === "number" ? args[1] : 0;
            var z = typeof args[2] === "number" ? args[2] : 0;
            this.data = new Float32Array([x, y, z]);
        }
    }
    Object.defineProperty(b2Vec3.prototype, "x", {
        get: function () { return this.data[0]; },
        set: function (value) { this.data[0] = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(b2Vec3.prototype, "y", {
        get: function () { return this.data[1]; },
        set: function (value) { this.data[1] = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(b2Vec3.prototype, "z", {
        get: function () { return this.data[2]; },
        set: function (value) { this.data[2] = value; },
        enumerable: true,
        configurable: true
    });
    b2Vec3.prototype.Clone = function () {
        return new b2Vec3(this.x, this.y, this.z);
    };
    b2Vec3.prototype.SetZero = function () {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        return this;
    };
    b2Vec3.prototype.SetXYZ = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };
    b2Vec3.prototype.Copy = function (other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
    };
    b2Vec3.prototype.SelfNeg = function () {
        this.x = (-this.x);
        this.y = (-this.y);
        this.z = (-this.z);
        return this;
    };
    b2Vec3.prototype.SelfAdd = function (v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    };
    b2Vec3.prototype.SelfAddXYZ = function (x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    };
    b2Vec3.prototype.SelfSub = function (v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    };
    b2Vec3.prototype.SelfSubXYZ = function (x, y, z) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    };
    b2Vec3.prototype.SelfMul = function (s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    };
    b2Vec3.DotV3V3 = function (a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    };
    b2Vec3.CrossV3V3 = function (a, b, out) {
        var a_x = a.x, a_y = a.y, a_z = a.z;
        var b_x = b.x, b_y = b.y, b_z = b.z;
        out.x = a_y * b_z - a_z * b_y;
        out.y = a_z * b_x - a_x * b_z;
        out.z = a_x * b_y - a_y * b_x;
        return out;
    };
    b2Vec3.ZERO = new b2Vec3(0, 0, 0);
    b2Vec3.s_t0 = new b2Vec3();
    return b2Vec3;
}());
var b2Mat22 = (function () {
    function b2Mat22() {
        this.ex = new b2Vec2(1, 0);
        this.ey = new b2Vec2(0, 1);
    }
    b2Mat22.prototype.Clone = function () {
        return new b2Mat22().Copy(this);
    };
    b2Mat22.FromVV = function (c1, c2) {
        return new b2Mat22().SetVV(c1, c2);
    };
    b2Mat22.FromSSSS = function (r1c1, r1c2, r2c1, r2c2) {
        return new b2Mat22().SetSSSS(r1c1, r1c2, r2c1, r2c2);
    };
    b2Mat22.FromAngle = function (radians) {
        return new b2Mat22().SetAngle(radians);
    };
    b2Mat22.prototype.SetSSSS = function (r1c1, r1c2, r2c1, r2c2) {
        this.ex.Set(r1c1, r2c1);
        this.ey.Set(r1c2, r2c2);
        return this;
    };
    b2Mat22.prototype.SetVV = function (c1, c2) {
        this.ex.Copy(c1);
        this.ey.Copy(c2);
        return this;
    };
    b2Mat22.prototype.SetAngle = function (radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);
        this.ex.Set(c, s);
        this.ey.Set(-s, c);
        return this;
    };
    b2Mat22.prototype.Copy = function (other) {
        this.ex.Copy(other.ex);
        this.ey.Copy(other.ey);
        return this;
    };
    b2Mat22.prototype.SetIdentity = function () {
        this.ex.Set(1, 0);
        this.ey.Set(0, 1);
        return this;
    };
    b2Mat22.prototype.SetZero = function () {
        this.ex.SetZero();
        this.ey.SetZero();
        return this;
    };
    b2Mat22.prototype.GetAngle = function () {
        return Math.atan2(this.ex.y, this.ex.x);
    };
    b2Mat22.prototype.GetInverse = function (out) {
        var a = this.ex.x;
        var b = this.ey.x;
        var c = this.ex.y;
        var d = this.ey.y;
        var det = a * d - b * c;
        if (det !== 0) {
            det = 1 / det;
        }
        out.ex.x = det * d;
        out.ey.x = (-det * b);
        out.ex.y = (-det * c);
        out.ey.y = det * a;
        return out;
    };
    b2Mat22.prototype.Solve = function (b_x, b_y, out) {
        var a11 = this.ex.x, a12 = this.ey.x;
        var a21 = this.ex.y, a22 = this.ey.y;
        var det = a11 * a22 - a12 * a21;
        if (det !== 0) {
            det = 1 / det;
        }
        out.x = det * (a22 * b_x - a12 * b_y);
        out.y = det * (a11 * b_y - a21 * b_x);
        return out;
    };
    b2Mat22.prototype.SelfAbs = function () {
        this.ex.SelfAbs();
        this.ey.SelfAbs();
        return this;
    };
    b2Mat22.prototype.SelfInv = function () {
        this.GetInverse(this);
        return this;
    };
    b2Mat22.prototype.SelfAddM = function (M) {
        this.ex.SelfAdd(M.ex);
        this.ey.SelfAdd(M.ey);
        return this;
    };
    b2Mat22.prototype.SelfSubM = function (M) {
        this.ex.SelfSub(M.ex);
        this.ey.SelfSub(M.ey);
        return this;
    };
    b2Mat22.AbsM = function (M, out) {
        var M_ex = M.ex, M_ey = M.ey;
        out.ex.x = b2Abs(M_ex.x);
        out.ex.y = b2Abs(M_ex.y);
        out.ey.x = b2Abs(M_ey.x);
        out.ey.y = b2Abs(M_ey.y);
        return out;
    };
    b2Mat22.MulMV = function (M, v, out) {
        var M_ex = M.ex, M_ey = M.ey;
        var v_x = v.x, v_y = v.y;
        out.x = M_ex.x * v_x + M_ey.x * v_y;
        out.y = M_ex.y * v_x + M_ey.y * v_y;
        return out;
    };
    b2Mat22.MulTMV = function (M, v, out) {
        var M_ex = M.ex, M_ey = M.ey;
        var v_x = v.x, v_y = v.y;
        out.x = M_ex.x * v_x + M_ex.y * v_y;
        out.y = M_ey.x * v_x + M_ey.y * v_y;
        return out;
    };
    b2Mat22.AddMM = function (A, B, out) {
        var A_ex = A.ex, A_ey = A.ey;
        var B_ex = B.ex, B_ey = B.ey;
        out.ex.x = A_ex.x + B_ex.x;
        out.ex.y = A_ex.y + B_ex.y;
        out.ey.x = A_ey.x + B_ey.x;
        out.ey.y = A_ey.y + B_ey.y;
        return out;
    };
    b2Mat22.MulMM = function (A, B, out) {
        var A_ex_x = A.ex.x, A_ex_y = A.ex.y;
        var A_ey_x = A.ey.x, A_ey_y = A.ey.y;
        var B_ex_x = B.ex.x, B_ex_y = B.ex.y;
        var B_ey_x = B.ey.x, B_ey_y = B.ey.y;
        out.ex.x = A_ex_x * B_ex_x + A_ey_x * B_ex_y;
        out.ex.y = A_ex_y * B_ex_x + A_ey_y * B_ex_y;
        out.ey.x = A_ex_x * B_ey_x + A_ey_x * B_ey_y;
        out.ey.y = A_ex_y * B_ey_x + A_ey_y * B_ey_y;
        return out;
    };
    b2Mat22.MulTMM = function (A, B, out) {
        var A_ex_x = A.ex.x, A_ex_y = A.ex.y;
        var A_ey_x = A.ey.x, A_ey_y = A.ey.y;
        var B_ex_x = B.ex.x, B_ex_y = B.ex.y;
        var B_ey_x = B.ey.x, B_ey_y = B.ey.y;
        out.ex.x = A_ex_x * B_ex_x + A_ex_y * B_ex_y;
        out.ex.y = A_ey_x * B_ex_x + A_ey_y * B_ex_y;
        out.ey.x = A_ex_x * B_ey_x + A_ex_y * B_ey_y;
        out.ey.y = A_ey_x * B_ey_x + A_ey_y * B_ey_y;
        return out;
    };
    b2Mat22.IDENTITY = new b2Mat22();
    return b2Mat22;
}());
var b2Mat33 = (function () {
    function b2Mat33() {
        this.data = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        this.ex = new b2Vec3(this.data.subarray(0, 3));
        this.ey = new b2Vec3(this.data.subarray(3, 6));
        this.ez = new b2Vec3(this.data.subarray(6, 9));
    }
    b2Mat33.prototype.Clone = function () {
        return new b2Mat33().Copy(this);
    };
    b2Mat33.prototype.SetVVV = function (c1, c2, c3) {
        this.ex.Copy(c1);
        this.ey.Copy(c2);
        this.ez.Copy(c3);
        return this;
    };
    b2Mat33.prototype.Copy = function (other) {
        this.ex.Copy(other.ex);
        this.ey.Copy(other.ey);
        this.ez.Copy(other.ez);
        return this;
    };
    b2Mat33.prototype.SetIdentity = function () {
        this.ex.SetXYZ(1, 0, 0);
        this.ey.SetXYZ(0, 1, 0);
        this.ez.SetXYZ(0, 0, 1);
        return this;
    };
    b2Mat33.prototype.SetZero = function () {
        this.ex.SetZero();
        this.ey.SetZero();
        this.ez.SetZero();
        return this;
    };
    b2Mat33.prototype.SelfAddM = function (M) {
        this.ex.SelfAdd(M.ex);
        this.ey.SelfAdd(M.ey);
        this.ez.SelfAdd(M.ez);
        return this;
    };
    b2Mat33.prototype.Solve33 = function (b_x, b_y, b_z, out) {
        var a11 = this.ex.x, a21 = this.ex.y, a31 = this.ex.z;
        var a12 = this.ey.x, a22 = this.ey.y, a32 = this.ey.z;
        var a13 = this.ez.x, a23 = this.ez.y, a33 = this.ez.z;
        var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
        if (det !== 0) {
            det = 1 / det;
        }
        out.x = det * (b_x * (a22 * a33 - a32 * a23) + b_y * (a32 * a13 - a12 * a33) + b_z * (a12 * a23 - a22 * a13));
        out.y = det * (a11 * (b_y * a33 - b_z * a23) + a21 * (b_z * a13 - b_x * a33) + a31 * (b_x * a23 - b_y * a13));
        out.z = det * (a11 * (a22 * b_z - a32 * b_y) + a21 * (a32 * b_x - a12 * b_z) + a31 * (a12 * b_y - a22 * b_x));
        return out;
    };
    b2Mat33.prototype.Solve22 = function (b_x, b_y, out) {
        var a11 = this.ex.x, a12 = this.ey.x;
        var a21 = this.ex.y, a22 = this.ey.y;
        var det = a11 * a22 - a12 * a21;
        if (det !== 0) {
            det = 1 / det;
        }
        out.x = det * (a22 * b_x - a12 * b_y);
        out.y = det * (a11 * b_y - a21 * b_x);
        return out;
    };
    b2Mat33.prototype.GetInverse22 = function (M) {
        var a = this.ex.x, b = this.ey.x, c = this.ex.y, d = this.ey.y;
        var det = a * d - b * c;
        if (det !== 0) {
            det = 1 / det;
        }
        M.ex.x = det * d;
        M.ey.x = -det * b;
        M.ex.z = 0;
        M.ex.y = -det * c;
        M.ey.y = det * a;
        M.ey.z = 0;
        M.ez.x = 0;
        M.ez.y = 0;
        M.ez.z = 0;
    };
    b2Mat33.prototype.GetSymInverse33 = function (M) {
        var det = b2Vec3.DotV3V3(this.ex, b2Vec3.CrossV3V3(this.ey, this.ez, b2Vec3.s_t0));
        if (det !== 0) {
            det = 1 / det;
        }
        var a11 = this.ex.x, a12 = this.ey.x, a13 = this.ez.x;
        var a22 = this.ey.y, a23 = this.ez.y;
        var a33 = this.ez.z;
        M.ex.x = det * (a22 * a33 - a23 * a23);
        M.ex.y = det * (a13 * a23 - a12 * a33);
        M.ex.z = det * (a12 * a23 - a13 * a22);
        M.ey.x = M.ex.y;
        M.ey.y = det * (a11 * a33 - a13 * a13);
        M.ey.z = det * (a13 * a12 - a11 * a23);
        M.ez.x = M.ex.z;
        M.ez.y = M.ey.z;
        M.ez.z = det * (a11 * a22 - a12 * a12);
    };
    b2Mat33.MulM33V3 = function (A, v, out) {
        var v_x = v.x, v_y = v.y, v_z = v.z;
        out.x = A.ex.x * v_x + A.ey.x * v_y + A.ez.x * v_z;
        out.y = A.ex.y * v_x + A.ey.y * v_y + A.ez.y * v_z;
        out.z = A.ex.z * v_x + A.ey.z * v_y + A.ez.z * v_z;
        return out;
    };
    b2Mat33.MulM33XYZ = function (A, x, y, z, out) {
        out.x = A.ex.x * x + A.ey.x * y + A.ez.x * z;
        out.y = A.ex.y * x + A.ey.y * y + A.ez.y * z;
        out.z = A.ex.z * x + A.ey.z * y + A.ez.z * z;
        return out;
    };
    b2Mat33.MulM33V2 = function (A, v, out) {
        var v_x = v.x, v_y = v.y;
        out.x = A.ex.x * v_x + A.ey.x * v_y;
        out.y = A.ex.y * v_x + A.ey.y * v_y;
        return out;
    };
    b2Mat33.MulM33XY = function (A, x, y, out) {
        out.x = A.ex.x * x + A.ey.x * y;
        out.y = A.ex.y * x + A.ey.y * y;
        return out;
    };
    b2Mat33.IDENTITY = new b2Mat33();
    return b2Mat33;
}());
//# sourceMappingURL=b2_math.js.map