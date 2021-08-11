condition;
{
    if (!condition) {
        throw new (Error.bind.apply(Error, [void 0].concat(args)))();
    }
}
function b2Maybe(value, def) {
    return value !== undefined ? value : def;
}
var b2_maxFloat = 1E+37;
var b2_epsilon = 1E-5;
var b2_epsilon_sq = (b2_epsilon * b2_epsilon);
var b2_pi = 3.14159265359;
var b2_lengthUnitsPerMeter = 1.0;
var b2_maxPolygonVertices = 8;
var b2_maxManifoldPoints = 2;
var b2_aabbExtension = 0.1 * b2_lengthUnitsPerMeter;
var b2_aabbMultiplier = 4;
var b2_linearSlop = 0.005 * b2_lengthUnitsPerMeter;
var b2_angularSlop = 2 / 180 * b2_pi;
var b2_polygonRadius = 2 * b2_linearSlop;
var b2_maxSubSteps = 8;
var b2_maxTOIContacts = 32;
var b2_maxLinearCorrection = 0.2 * b2_lengthUnitsPerMeter;
var b2_maxAngularCorrection = 8 / 180 * b2_pi;
var b2_maxTranslation = 2 * b2_lengthUnitsPerMeter;
var b2_maxTranslationSquared = b2_maxTranslation * b2_maxTranslation;
var b2_maxRotation = 0.5 * b2_pi;
var b2_maxRotationSquared = b2_maxRotation * b2_maxRotation;
var b2_baumgarte = 0.2;
var b2_toiBaumgarte = 0.75;
var b2_invalidParticleIndex = -1;
var b2_maxParticleIndex = 0x7FFFFFFF;
var b2_particleStride = 0.75;
var b2_minParticleWeight = 1.0;
var b2_maxParticlePressure = 0.25;
var b2_maxParticleForce = 0.5;
var b2_maxTriadDistance = 2.0 * b2_lengthUnitsPerMeter;
var b2_maxTriadDistanceSquared = (b2_maxTriadDistance * b2_maxTriadDistance);
var b2_minParticleSystemBufferCapacity = 256;
var b2_barrierCollisionTime = 2.5;
var b2_timeToSleep = 0.5;
var b2_linearSleepTolerance = 0.01 * b2_lengthUnitsPerMeter;
var b2_angularSleepTolerance = 2 / 180 * b2_pi;
var b2Version = (function () {
    function b2Version(major, minor, revision) {
        if (major === void 0) { major = 0; }
        if (minor === void 0) { minor = 0; }
        if (revision === void 0) { revision = 0; }
        this.major = 0;
        this.minor = 0;
        this.revision = 0;
        this.major = major;
        this.minor = minor;
        this.revision = revision;
    }
    b2Version.prototype.toString = function () {
        return this.major + "." + this.minor + "." + this.revision;
    };
    return b2Version;
}());
var b2_version = new b2Version(2, 4, 1);
var b2_branch = "master";
var b2_commit = "9ebbbcd960ad424e03e5de6e66a40764c16f51bc";
function b2ParseInt(v) {
    return parseInt(v, 10);
}
function b2ParseUInt(v) {
    return Math.abs(parseInt(v, 10));
}
function b2MakeArray(length, init) {
    var a = new Array(length);
    for (var i = 0; i < length; ++i) {
        a[i] = init(i);
    }
    return a;
}
function b2MakeNullArray(length) {
    var a = new Array(length);
    for (var i = 0; i < length; ++i) {
        a[i] = null;
    }
    return a;
}
function b2MakeNumberArray(length, init) {
    if (init === void 0) { init = 0; }
    var a = new Array(length);
    for (var i = 0; i < length; ++i) {
        a[i] = init;
    }
    return a;
}
//# sourceMappingURL=b2_common.js.map