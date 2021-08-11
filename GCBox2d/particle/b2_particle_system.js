




function std_iter_swap(array, a, b) {
    var tmp = array[a];
    array[a] = array[b];
    array[b] = tmp;
}
function default_compare(a, b) { return a < b; }
function std_sort(array, first, len, cmp) {
    if (first === void 0) { first = 0; }
    if (len === void 0) { len = array.length - first; }
    if (cmp === void 0) { cmp = default_compare; }
    var left = first;
    var stack = [];
    var pos = 0;
    for (;;) {
        for (; left + 1 < len; len++) {
            var pivot = array[left + Math.floor(Math.random() * (len - left))];
            stack[pos++] = len;
            for (var right = left - 1;;) {
                while (cmp(array[++right], pivot)) { }
                while (cmp(pivot, array[--len])) { }
                if (right >= len) {
                    break;
                }
                std_iter_swap(array, right, len);
            }
        }
        if (pos === 0) {
            break;
        }
        left = len;
        len = stack[--pos];
    }
    return array;
}
function std_stable_sort(array, first, len, cmp) {
    if (first === void 0) { first = 0; }
    if (len === void 0) { len = array.length - first; }
    if (cmp === void 0) { cmp = default_compare; }
    return std_sort(array, first, len, cmp);
}
function std_remove_if(array, predicate, length) {
    if (length === void 0) { length = array.length; }
    var l = 0;
    for (var c = 0; c < length; ++c) {
        if (predicate(array[c])) {
            continue;
        }
        if (c === l) {
            ++l;
            continue;
        }
        std_iter_swap(array, l++, c);
    }
    return l;
}
function std_lower_bound(array, first, last, val, cmp) {
    var count = last - first;
    while (count > 0) {
        var step = Math.floor(count / 2);
        var it = first + step;
        if (cmp(array[it], val)) {
            first = ++it;
            count -= step + 1;
        }
        else {
            count = step;
        }
    }
    return first;
}
function std_upper_bound(array, first, last, val, cmp) {
    var count = last - first;
    while (count > 0) {
        var step = Math.floor(count / 2);
        var it = first + step;
        if (!cmp(val, array[it])) {
            first = ++it;
            count -= step + 1;
        }
        else {
            count = step;
        }
    }
    return first;
}
function std_rotate(array, first, n_first, last) {
    var next = n_first;
    while (first !== next) {
        std_iter_swap(array, first++, next++);
        if (next === last) {
            next = n_first;
        }
        else if (first === n_first) {
            n_first = next;
        }
    }
}
function std_unique(array, first, last, cmp) {
    if (first === last) {
        return last;
    }
    var result = first;
    while (++first !== last) {
        if (!cmp(array[result], array[first])) {
            std_iter_swap(array, ++result, first);
        }
    }
    return ++result;
}
var b2GrowableBuffer = (function () {
    function b2GrowableBuffer(allocator) {
        this.data = [];
        this.count = 0;
        this.capacity = 0;
        this.allocator = allocator;
    }
    b2GrowableBuffer.prototype.Append = function () {
        if (this.count >= this.capacity) {
            this.Grow();
        }
        return this.count++;
    };
    b2GrowableBuffer.prototype.Reserve = function (newCapacity) {
        if (this.capacity >= newCapacity) {
            return;
        }
        for (var i = this.capacity; i < newCapacity; ++i) {
            this.data[i] = this.allocator();
        }
        this.capacity = newCapacity;
    };
    b2GrowableBuffer.prototype.Grow = function () {
        var newCapacity = this.capacity ? 2 * this.capacity : b2_minParticleSystemBufferCapacity;
        this.Reserve(newCapacity);
    };
    b2GrowableBuffer.prototype.Free = function () {
        if (this.data.length === 0) {
            return;
        }
        this.data = [];
        this.capacity = 0;
        this.count = 0;
    };
    b2GrowableBuffer.prototype.Shorten = function (newEnd) {
    };
    b2GrowableBuffer.prototype.Data = function () {
        return this.data;
    };
    b2GrowableBuffer.prototype.GetCount = function () {
        return this.count;
    };
    b2GrowableBuffer.prototype.SetCount = function (newCount) {
        this.count = newCount;
    };
    b2GrowableBuffer.prototype.GetCapacity = function () {
        return this.capacity;
    };
    b2GrowableBuffer.prototype.RemoveIf = function (pred) {
        this.count = std_remove_if(this.data, pred, this.count);
    };
    b2GrowableBuffer.prototype.Unique = function (pred) {
        this.count = std_unique(this.data, 0, this.count, pred);
    };
    return b2GrowableBuffer;
}());
var b2FixtureParticleQueryCallback = (function (_super) {
    __extends(b2FixtureParticleQueryCallback, _super);
    function b2FixtureParticleQueryCallback(system) {
        _super.call(this);
        this.m_system = system;
    }
    b2FixtureParticleQueryCallback.prototype.ShouldQueryParticleSystem = function (system) {
        return false;
    };
    b2FixtureParticleQueryCallback.prototype.ReportFixture = function (fixture) {
        if (fixture.IsSensor()) {
            return true;
        }
        var shape = fixture.GetShape();
        var childCount = shape.GetChildCount();
        for (var childIndex = 0; childIndex < childCount; childIndex++) {
            var aabb = fixture.GetAABB(childIndex);
            var enumerator = this.m_system.GetInsideBoundsEnumerator(aabb);
            var index = void 0;
            while ((index = enumerator.GetNext()) >= 0) {
                this.ReportFixtureAndParticle(fixture, childIndex, index);
            }
        }
        return true;
    };
    b2FixtureParticleQueryCallback.prototype.ReportParticle = function (system, index) {
        return false;
    };
    b2FixtureParticleQueryCallback.prototype.ReportFixtureAndParticle = function (fixture, childIndex, index) {
    };
    return b2FixtureParticleQueryCallback;
}(b2QueryCallback));
var b2ParticleContact = (function () {
    function b2ParticleContact() {
        this.indexA = 0;
        this.indexB = 0;
        this.weight = 0;
        this.normal = new b2Vec2();
        this.flags = 0;
    }
    b2ParticleContact.prototype.SetIndices = function (a, b) {
        this.indexA = a;
        this.indexB = b;
    };
    b2ParticleContact.prototype.SetWeight = function (w) {
        this.weight = w;
    };
    b2ParticleContact.prototype.SetNormal = function (n) {
        this.normal.Copy(n);
    };
    b2ParticleContact.prototype.SetFlags = function (f) {
        this.flags = f;
    };
    b2ParticleContact.prototype.GetIndexA = function () {
        return this.indexA;
    };
    b2ParticleContact.prototype.GetIndexB = function () {
        return this.indexB;
    };
    b2ParticleContact.prototype.GetWeight = function () {
        return this.weight;
    };
    b2ParticleContact.prototype.GetNormal = function () {
        return this.normal;
    };
    b2ParticleContact.prototype.GetFlags = function () {
        return this.flags;
    };
    b2ParticleContact.prototype.IsEqual = function (rhs) {
        return this.indexA === rhs.indexA && this.indexB === rhs.indexB && this.flags === rhs.flags && this.weight === rhs.weight && this.normal.x === rhs.normal.x && this.normal.y === rhs.normal.y;
    };
    b2ParticleContact.prototype.IsNotEqual = function (rhs) {
        return !this.IsEqual(rhs);
    };
    b2ParticleContact.prototype.ApproximatelyEqual = function (rhs) {
        var MAX_WEIGHT_DIFF = 0.01;
        var MAX_NORMAL_DIFF_SQ = 0.01 * 0.01;
        return this.indexA === rhs.indexA && this.indexB === rhs.indexB && this.flags === rhs.flags && b2Abs(this.weight - rhs.weight) < MAX_WEIGHT_DIFF && b2Vec2.DistanceSquaredVV(this.normal, rhs.normal) < MAX_NORMAL_DIFF_SQ;
    };
    return b2ParticleContact;
}());
var b2ParticleBodyContact = (function () {
    function b2ParticleBodyContact() {
        this.index = 0;
        this.weight = 0.0;
        this.normal = new b2Vec2();
        this.mass = 0.0;
    }
    return b2ParticleBodyContact;
}());
var b2ParticlePair = (function () {
    function b2ParticlePair() {
        this.indexA = 0;
        this.indexB = 0;
        this.flags = 0;
        this.strength = 0.0;
        this.distance = 0.0;
    }
    return b2ParticlePair;
}());
var b2ParticleTriad = (function () {
    function b2ParticleTriad() {
        this.indexA = 0;
        this.indexB = 0;
        this.indexC = 0;
        this.flags = 0;
        this.strength = 0.0;
        this.pa = new b2Vec2(0.0, 0.0);
        this.pb = new b2Vec2(0.0, 0.0);
        this.pc = new b2Vec2(0.0, 0.0);
        this.ka = 0.0;
        this.kb = 0.0;
        this.kc = 0.0;
        this.s = 0.0;
    }
    return b2ParticleTriad;
}());
var b2ParticleSystemDef = (function () {
    function b2ParticleSystemDef() {
        this.strictContactCheck = false;
        this.density = 1.0;
        this.gravityScale = 1.0;
        this.radius = 1.0;
        this.maxCount = 0;
        this.pressureStrength = 0.005;
        this.dampingStrength = 1.0;
        this.elasticStrength = 0.25;
        this.springStrength = 0.25;
        this.viscousStrength = 0.25;
        this.surfaceTensionPressureStrength = 0.2;
        this.surfaceTensionNormalStrength = 0.2;
        this.repulsiveStrength = 1.0;
        this.powderStrength = 0.5;
        this.ejectionStrength = 0.5;
        this.staticPressureStrength = 0.2;
        this.staticPressureRelaxation = 0.2;
        this.staticPressureIterations = 8;
        this.colorMixingStrength = 0.5;
        this.destroyByAge = true;
        this.lifetimeGranularity = 1.0 / 60.0;
    }
    b2ParticleSystemDef.prototype.Copy = function (def) {
        this.strictContactCheck = def.strictContactCheck;
        this.density = def.density;
        this.gravityScale = def.gravityScale;
        this.radius = def.radius;
        this.maxCount = def.maxCount;
        this.pressureStrength = def.pressureStrength;
        this.dampingStrength = def.dampingStrength;
        this.elasticStrength = def.elasticStrength;
        this.springStrength = def.springStrength;
        this.viscousStrength = def.viscousStrength;
        this.surfaceTensionPressureStrength = def.surfaceTensionPressureStrength;
        this.surfaceTensionNormalStrength = def.surfaceTensionNormalStrength;
        this.repulsiveStrength = def.repulsiveStrength;
        this.powderStrength = def.powderStrength;
        this.ejectionStrength = def.ejectionStrength;
        this.staticPressureStrength = def.staticPressureStrength;
        this.staticPressureRelaxation = def.staticPressureRelaxation;
        this.staticPressureIterations = def.staticPressureIterations;
        this.colorMixingStrength = def.colorMixingStrength;
        this.destroyByAge = def.destroyByAge;
        this.lifetimeGranularity = def.lifetimeGranularity;
        return this;
    };
    b2ParticleSystemDef.prototype.Clone = function () {
        return new b2ParticleSystemDef().Copy(this);
    };
    return b2ParticleSystemDef;
}());
var b2ParticleSystem = (function () {
    function b2ParticleSystem(def, world) {
        this.m_paused = false;
        this.m_timestamp = 0;
        this.m_allParticleFlags = 0;
        this.m_needsUpdateAllParticleFlags = false;
        this.m_allGroupFlags = 0;
        this.m_needsUpdateAllGroupFlags = false;
        this.m_hasForce = false;
        this.m_iterationIndex = 0;
        this.m_inverseDensity = 0.0;
        this.m_particleDiameter = 0.0;
        this.m_inverseDiameter = 0.0;
        this.m_squaredDiameter = 0.0;
        this.m_count = 0;
        this.m_internalAllocatedCapacity = 0;
        this.m_handleIndexBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_flagsBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_positionBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_velocityBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_forceBuffer = [];
        this.m_weightBuffer = [];
        this.m_staticPressureBuffer = [];
        this.m_accumulationBuffer = [];
        this.m_accumulation2Buffer = [];
        this.m_depthBuffer = [];
        this.m_colorBuffer = new b2ParticleSystem_UserOverridableBufferb2Color();
        this.m_groupBuffer = [];
        this.m_userDataBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_stuckThreshold = 0;
        this.m_lastBodyContactStepBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_bodyContactCountBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_consecutiveContactStepsBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_stuckParticleBuffer = new b2GrowableBuffer(function () { return 0; });
        this.m_proxyBuffer = new b2GrowableBuffer(function () { return new b2ParticleSystem_Proxy(); });
        this.m_contactBuffer = new b2GrowableBuffer(function () { return new b2ParticleContact(); });
        this.m_bodyContactBuffer = new b2GrowableBuffer(function () { return new b2ParticleBodyContact(); });
        this.m_pairBuffer = new b2GrowableBuffer(function () { return new b2ParticlePair(); });
        this.m_triadBuffer = new b2GrowableBuffer(function () { return new b2ParticleTriad(); });
        this.m_expirationTimeBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_indexByExpirationTimeBuffer = new b2ParticleSystem_UserOverridableBuffer();
        this.m_timeElapsed = 0;
        this.m_expirationTimeBufferRequiresSorting = false;
        this.m_groupCount = 0;
        this.m_groupList = null;
        this.m_def = new b2ParticleSystemDef();
        this.m_prev = null;
        this.m_next = null;
        this.UpdateBodyContacts_callback = null;
        this.SolveCollision_callback = null;
        this.SetStrictContactCheck(def.strictContactCheck);
        this.SetDensity(def.density);
        this.SetGravityScale(def.gravityScale);
        this.SetRadius(def.radius);
        this.SetMaxParticleCount(def.maxCount);
        this.m_def = def.Clone();
        this.m_world = world;
        this.SetDestructionByAge(this.m_def.destroyByAge);
    }
    b2ParticleSystem.computeTag = function (x, y) {
        return ((((y + b2ParticleSystem.yOffset) >>> 0) << b2ParticleSystem.yShift) + ((b2ParticleSystem.xScale * x + b2ParticleSystem.xOffset) >>> 0)) >>> 0;
    };
    b2ParticleSystem.computeRelativeTag = function (tag, x, y) {
        return (tag + (y << b2ParticleSystem.yShift) + (x << b2ParticleSystem.xShift)) >>> 0;
    };
    b2ParticleSystem.prototype.Drop = function () {
        while (this.m_groupList) {
            this.DestroyParticleGroup(this.m_groupList);
        }
        this.FreeUserOverridableBuffer(this.m_handleIndexBuffer);
        this.FreeUserOverridableBuffer(this.m_flagsBuffer);
        this.FreeUserOverridableBuffer(this.m_lastBodyContactStepBuffer);
        this.FreeUserOverridableBuffer(this.m_bodyContactCountBuffer);
        this.FreeUserOverridableBuffer(this.m_consecutiveContactStepsBuffer);
        this.FreeUserOverridableBuffer(this.m_positionBuffer);
        this.FreeUserOverridableBuffer(this.m_velocityBuffer);
        this.FreeUserOverridableBuffer(this.m_colorBuffer);
        this.FreeUserOverridableBuffer(this.m_userDataBuffer);
        this.FreeUserOverridableBuffer(this.m_expirationTimeBuffer);
        this.FreeUserOverridableBuffer(this.m_indexByExpirationTimeBuffer);
        this.FreeBuffer(this.m_forceBuffer, this.m_internalAllocatedCapacity);
        this.FreeBuffer(this.m_weightBuffer, this.m_internalAllocatedCapacity);
        this.FreeBuffer(this.m_staticPressureBuffer, this.m_internalAllocatedCapacity);
        this.FreeBuffer(this.m_accumulationBuffer, this.m_internalAllocatedCapacity);
        this.FreeBuffer(this.m_accumulation2Buffer, this.m_internalAllocatedCapacity);
        this.FreeBuffer(this.m_depthBuffer, this.m_internalAllocatedCapacity);
        this.FreeBuffer(this.m_groupBuffer, this.m_internalAllocatedCapacity);
    };
    b2ParticleSystem.prototype.CreateParticle = function (def) {
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        if (this.m_count >= this.m_internalAllocatedCapacity) {
            var capacity = this.m_count ? 2 * this.m_count : b2_minParticleSystemBufferCapacity;
            this.ReallocateInternalAllocatedBuffers(capacity);
        }
        if (this.m_count >= this.m_internalAllocatedCapacity) {
            if (this.m_def.destroyByAge) {
                this.DestroyOldestParticle(0, false);
                this.SolveZombie();
            }
            else {
                return b2_invalidParticleIndex;
            }
        }
        var index = this.m_count++;
        this.m_flagsBuffer.data[index] = 0;
        if (this.m_lastBodyContactStepBuffer.data) {
            this.m_lastBodyContactStepBuffer.data[index] = 0;
        }
        if (this.m_bodyContactCountBuffer.data) {
            this.m_bodyContactCountBuffer.data[index] = 0;
        }
        if (this.m_consecutiveContactStepsBuffer.data) {
            this.m_consecutiveContactStepsBuffer.data[index] = 0;
        }
        this.m_positionBuffer.data[index] = (this.m_positionBuffer.data[index] || new b2Vec2()).Copy(b2Maybe(def.position, b2Vec2.ZERO));
        this.m_velocityBuffer.data[index] = (this.m_velocityBuffer.data[index] || new b2Vec2()).Copy(b2Maybe(def.velocity, b2Vec2.ZERO));
        this.m_weightBuffer[index] = 0;
        this.m_forceBuffer[index] = (this.m_forceBuffer[index] || new b2Vec2()).SetZero();
        if (this.m_staticPressureBuffer) {
            this.m_staticPressureBuffer[index] = 0;
        }
        if (this.m_depthBuffer) {
            this.m_depthBuffer[index] = 0;
        }
        var color = new b2Color().Copy(b2Maybe(def.color, b2Color.ZERO));
        if (this.m_colorBuffer.data || !color.IsZero()) {
            this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
            this.m_colorBuffer.data[index] = (this.m_colorBuffer.data[index] || new b2Color()).Copy(color);
        }
        if (this.m_userDataBuffer.data || def.userData) {
            this.m_userDataBuffer.data = this.RequestBuffer(this.m_userDataBuffer.data);
            this.m_userDataBuffer.data[index] = def.userData;
        }
        if (this.m_handleIndexBuffer.data) {
            this.m_handleIndexBuffer.data[index] = null;
        }
        var proxy = this.m_proxyBuffer.data[this.m_proxyBuffer.Append()];
        var lifetime = b2Maybe(def.lifetime, 0.0);
        var finiteLifetime = lifetime > 0.0;
        if (this.m_expirationTimeBuffer.data || finiteLifetime) {
            this.SetParticleLifetime(index, finiteLifetime ? lifetime :
                this.ExpirationTimeToLifetime(-this.GetQuantizedTimeElapsed()));
            this.m_indexByExpirationTimeBuffer.data[index] = index;
        }
        proxy.index = index;
        var group = b2Maybe(def.group, null);
        this.m_groupBuffer[index] = group;
        if (group) {
            if (group.m_firstIndex < group.m_lastIndex) {
                this.RotateBuffer(group.m_firstIndex, group.m_lastIndex, index);
                group.m_lastIndex = index + 1;
            }
            else {
                group.m_firstIndex = index;
                group.m_lastIndex = index + 1;
            }
        }
        this.SetParticleFlags(index, b2Maybe(def.flags, 0));
        return index;
    };
    b2ParticleSystem.prototype.GetParticleHandleFromIndex = function (index) {
        this.m_handleIndexBuffer.data = this.RequestBuffer(this.m_handleIndexBuffer.data);
        var handle = this.m_handleIndexBuffer.data[index];
        if (handle) {
            return handle;
        }
        handle = new b2ParticleHandle();
        handle.SetIndex(index);
        this.m_handleIndexBuffer.data[index] = handle;
        return handle;
    };
    b2ParticleSystem.prototype.DestroyParticle = function (index, callDestructionListener) {
        if (callDestructionListener === void 0) { callDestructionListener = false; }
        var flags = b2ParticleFlag.b2_zombieParticle;
        if (callDestructionListener) {
            flags |= b2ParticleFlag.b2_destructionListenerParticle;
        }
        this.SetParticleFlags(index, this.m_flagsBuffer.data[index] | flags);
    };
    b2ParticleSystem.prototype.DestroyOldestParticle = function (index, callDestructionListener) {
        if (callDestructionListener === void 0) { callDestructionListener = false; }
        var particleCount = this.GetParticleCount();
        var oldestFiniteLifetimeParticle = this.m_indexByExpirationTimeBuffer.data[particleCount - (index + 1)];
        var oldestInfiniteLifetimeParticle = this.m_indexByExpirationTimeBuffer.data[index];
        this.DestroyParticle(this.m_expirationTimeBuffer.data[oldestFiniteLifetimeParticle] > 0.0 ?
            oldestFiniteLifetimeParticle : oldestInfiniteLifetimeParticle, callDestructionListener);
    };
    b2ParticleSystem.prototype.DestroyParticlesInShape = function (shape, xf, callDestructionListener) {
        if (callDestructionListener === void 0) { callDestructionListener = false; }
        var s_aabb = b2ParticleSystem.DestroyParticlesInShape_s_aabb;
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        var callback = new b2ParticleSystem_DestroyParticlesInShapeCallback(this, shape, xf, callDestructionListener);
        var aabb = s_aabb;
        shape.ComputeAABB(aabb, xf, 0);
        this.m_world.QueryAABB(callback, aabb);
        return callback.Destroyed();
    };
    b2ParticleSystem.prototype.CreateParticleGroup = function (groupDef) {
        var s_transform = b2ParticleSystem.CreateParticleGroup_s_transform;
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        var transform = s_transform;
        transform.SetPositionAngle(b2Maybe(groupDef.position, b2Vec2.ZERO), b2Maybe(groupDef.angle, 0));
        var firstIndex = this.m_count;
        if (groupDef.shape) {
            this.CreateParticlesWithShapeForGroup(groupDef.shape, groupDef, transform);
        }
        if (groupDef.shapes) {
            this.CreateParticlesWithShapesForGroup(groupDef.shapes, b2Maybe(groupDef.shapeCount, groupDef.shapes.length), groupDef, transform);
        }
        if (groupDef.positionData) {
            var count = b2Maybe(groupDef.particleCount, groupDef.positionData.length);
            for (var i = 0; i < count; i++) {
                var p = groupDef.positionData[i];
                this.CreateParticleForGroup(groupDef, transform, p);
            }
        }
        var lastIndex = this.m_count;
        var group = new b2ParticleGroup(this);
        group.m_firstIndex = firstIndex;
        group.m_lastIndex = lastIndex;
        group.m_strength = b2Maybe(groupDef.strength, 1);
        group.m_userData = groupDef.userData;
        group.m_transform.Copy(transform);
        group.m_prev = null;
        group.m_next = this.m_groupList;
        if (this.m_groupList) {
            this.m_groupList.m_prev = group;
        }
        this.m_groupList = group;
        ++this.m_groupCount;
        for (var i = firstIndex; i < lastIndex; i++) {
            this.m_groupBuffer[i] = group;
        }
        this.SetGroupFlags(group, b2Maybe(groupDef.groupFlags, 0));
        var filter = new b2ParticleSystem_ConnectionFilter();
        this.UpdateContacts(true);
        this.UpdatePairsAndTriads(firstIndex, lastIndex, filter);
        if (groupDef.group) {
            this.JoinParticleGroups(groupDef.group, group);
            group = groupDef.group;
        }
        return group;
    };
    b2ParticleSystem.prototype.JoinParticleGroups = function (groupA, groupB) {
        if (this.m_world.IsLocked()) {
            throw new Error();
        }
        this.RotateBuffer(groupB.m_firstIndex, groupB.m_lastIndex, this.m_count);
        this.RotateBuffer(groupA.m_firstIndex, groupA.m_lastIndex, groupB.m_firstIndex);
        var filter = new b2ParticleSystem_JoinParticleGroupsFilter(groupB.m_firstIndex);
        this.UpdateContacts(true);
        this.UpdatePairsAndTriads(groupA.m_firstIndex, groupB.m_lastIndex, filter);
        for (var i = groupB.m_firstIndex; i < groupB.m_lastIndex; i++) {
            this.m_groupBuffer[i] = groupA;
        }
        var groupFlags = groupA.m_groupFlags | groupB.m_groupFlags;
        this.SetGroupFlags(groupA, groupFlags);
        groupA.m_lastIndex = groupB.m_lastIndex;
        groupB.m_firstIndex = groupB.m_lastIndex;
        this.DestroyParticleGroup(groupB);
    };
    b2ParticleSystem.prototype.SplitParticleGroup = function (group) {
        this.UpdateContacts(true);
        var particleCount = group.GetParticleCount();
        var nodeBuffer = b2MakeArray(particleCount, function (index) { return new b2ParticleSystem_ParticleListNode(); });
        b2ParticleSystem.InitializeParticleLists(group, nodeBuffer);
        this.MergeParticleListsInContact(group, nodeBuffer);
        var survivingList = b2ParticleSystem.FindLongestParticleList(group, nodeBuffer);
        this.MergeZombieParticleListNodes(group, nodeBuffer, survivingList);
        this.CreateParticleGroupsFromParticleList(group, nodeBuffer, survivingList);
        this.UpdatePairsAndTriadsWithParticleList(group, nodeBuffer);
    };
    b2ParticleSystem.prototype.GetParticleGroupList = function () {
        return this.m_groupList;
    };
    b2ParticleSystem.prototype.GetParticleGroupCount = function () {
        return this.m_groupCount;
    };
    b2ParticleSystem.prototype.GetParticleCount = function () {
        return this.m_count;
    };
    b2ParticleSystem.prototype.GetMaxParticleCount = function () {
        return this.m_def.maxCount;
    };
    b2ParticleSystem.prototype.SetMaxParticleCount = function (count) {
        this.m_def.maxCount = count;
    };
    b2ParticleSystem.prototype.GetAllParticleFlags = function () {
        return this.m_allParticleFlags;
    };
    b2ParticleSystem.prototype.GetAllGroupFlags = function () {
        return this.m_allGroupFlags;
    };
    b2ParticleSystem.prototype.SetPaused = function (paused) {
        this.m_paused = paused;
    };
    b2ParticleSystem.prototype.GetPaused = function () {
        return this.m_paused;
    };
    b2ParticleSystem.prototype.SetDensity = function (density) {
        this.m_def.density = density;
        this.m_inverseDensity = 1 / this.m_def.density;
    };
    b2ParticleSystem.prototype.GetDensity = function () {
        return this.m_def.density;
    };
    b2ParticleSystem.prototype.SetGravityScale = function (gravityScale) {
        this.m_def.gravityScale = gravityScale;
    };
    b2ParticleSystem.prototype.GetGravityScale = function () {
        return this.m_def.gravityScale;
    };
    b2ParticleSystem.prototype.SetDamping = function (damping) {
        this.m_def.dampingStrength = damping;
    };
    b2ParticleSystem.prototype.GetDamping = function () {
        return this.m_def.dampingStrength;
    };
    b2ParticleSystem.prototype.SetStaticPressureIterations = function (iterations) {
        this.m_def.staticPressureIterations = iterations;
    };
    b2ParticleSystem.prototype.GetStaticPressureIterations = function () {
        return this.m_def.staticPressureIterations;
    };
    b2ParticleSystem.prototype.SetRadius = function (radius) {
        this.m_particleDiameter = 2 * radius;
        this.m_squaredDiameter = this.m_particleDiameter * this.m_particleDiameter;
        this.m_inverseDiameter = 1 / this.m_particleDiameter;
    };
    b2ParticleSystem.prototype.GetRadius = function () {
        return this.m_particleDiameter / 2;
    };
    b2ParticleSystem.prototype.GetPositionBuffer = function () {
        return this.m_positionBuffer.data;
    };
    b2ParticleSystem.prototype.GetVelocityBuffer = function () {
        return this.m_velocityBuffer.data;
    };
    b2ParticleSystem.prototype.GetColorBuffer = function () {
        this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
        return this.m_colorBuffer.data;
    };
    b2ParticleSystem.prototype.GetGroupBuffer = function () {
        return this.m_groupBuffer;
    };
    b2ParticleSystem.prototype.GetWeightBuffer = function () {
        return this.m_weightBuffer;
    };
    b2ParticleSystem.prototype.GetUserDataBuffer = function () {
        this.m_userDataBuffer.data = this.RequestBuffer(this.m_userDataBuffer.data);
        return this.m_userDataBuffer.data;
    };
    b2ParticleSystem.prototype.GetFlagsBuffer = function () {
        return this.m_flagsBuffer.data;
    };
    b2ParticleSystem.prototype.SetParticleFlags = function (index, newFlags) {
        var oldFlags = this.m_flagsBuffer.data[index];
        if (oldFlags & ~newFlags) {
            this.m_needsUpdateAllParticleFlags = true;
        }
        if (~this.m_allParticleFlags & newFlags) {
            if (newFlags & b2ParticleFlag.b2_tensileParticle) {
                this.m_accumulation2Buffer = this.RequestBuffer(this.m_accumulation2Buffer);
            }
            if (newFlags & b2ParticleFlag.b2_colorMixingParticle) {
                this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
            }
            this.m_allParticleFlags |= newFlags;
        }
        this.m_flagsBuffer.data[index] = newFlags;
    };
    b2ParticleSystem.prototype.GetParticleFlags = function (index) {
        return this.m_flagsBuffer.data[index];
    };
    b2ParticleSystem.prototype.SetFlagsBuffer = function (buffer) {
        this.SetUserOverridableBuffer(this.m_flagsBuffer, buffer);
    };
    b2ParticleSystem.prototype.SetPositionBuffer = function (buffer) {
        if (buffer instanceof Float32Array) {
            if (buffer.length % 2 !== 0) {
                throw new Error();
            }
            var count = buffer.length / 2;
            var array = new Array(count);
            for (var i = 0; i < count; ++i) {
                array[i] = new b2TypedVec2(buffer.subarray(i * 2, i * 2 + 2));
            }
            buffer = array;
        }
        this.SetUserOverridableBuffer(this.m_positionBuffer, buffer);
    };
    b2ParticleSystem.prototype.SetVelocityBuffer = function (buffer) {
        if (buffer instanceof Float32Array) {
            if (buffer.length % 2 !== 0) {
                throw new Error();
            }
            var count = buffer.length / 2;
            var array = new Array(count);
            for (var i = 0; i < count; ++i) {
                array[i] = new b2TypedVec2(buffer.subarray(i * 2, i * 2 + 2));
            }
            buffer = array;
        }
        this.SetUserOverridableBuffer(this.m_velocityBuffer, buffer);
    };
    b2ParticleSystem.prototype.SetColorBuffer = function (buffer) {
        if (buffer instanceof Float32Array) {
            if (buffer.length % 4 !== 0) {
                throw new Error();
            }
            var count = buffer.length / 4;
            var array = new Array(count);
            for (var i = 0; i < count; ++i) {
                array[i] = new b2TypedColor(buffer.subarray(i * 4, i * 4 + 4));
            }
            buffer = array;
        }
        this.SetUserOverridableBuffer(this.m_colorBuffer, buffer);
    };
    b2ParticleSystem.prototype.SetUserDataBuffer = function (buffer) {
        this.SetUserOverridableBuffer(this.m_userDataBuffer, buffer);
    };
    b2ParticleSystem.prototype.GetContacts = function () {
        return this.m_contactBuffer.data;
    };
    b2ParticleSystem.prototype.GetContactCount = function () {
        return this.m_contactBuffer.count;
    };
    b2ParticleSystem.prototype.GetBodyContacts = function () {
        return this.m_bodyContactBuffer.data;
    };
    b2ParticleSystem.prototype.GetBodyContactCount = function () {
        return this.m_bodyContactBuffer.count;
    };
    b2ParticleSystem.prototype.GetPairs = function () {
        return this.m_pairBuffer.data;
    };
    b2ParticleSystem.prototype.GetPairCount = function () {
        return this.m_pairBuffer.count;
    };
    b2ParticleSystem.prototype.GetTriads = function () {
        return this.m_triadBuffer.data;
    };
    b2ParticleSystem.prototype.GetTriadCount = function () {
        return this.m_triadBuffer.count;
    };
    b2ParticleSystem.prototype.SetStuckThreshold = function (steps) {
        this.m_stuckThreshold = steps;
        if (steps > 0) {
            this.m_lastBodyContactStepBuffer.data = this.RequestBuffer(this.m_lastBodyContactStepBuffer.data);
            this.m_bodyContactCountBuffer.data = this.RequestBuffer(this.m_bodyContactCountBuffer.data);
            this.m_consecutiveContactStepsBuffer.data = this.RequestBuffer(this.m_consecutiveContactStepsBuffer.data);
        }
    };
    b2ParticleSystem.prototype.GetStuckCandidates = function () {
        return this.m_stuckParticleBuffer.Data();
    };
    b2ParticleSystem.prototype.GetStuckCandidateCount = function () {
        return this.m_stuckParticleBuffer.GetCount();
    };
    b2ParticleSystem.prototype.ComputeCollisionEnergy = function () {
        var s_v = b2ParticleSystem.ComputeCollisionEnergy_s_v;
        var vel_data = this.m_velocityBuffer.data;
        var sum_v2 = 0;
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            var a = contact.indexA;
            var b = contact.indexB;
            var n = contact.normal;
            var v = b2Vec2.SubVV(vel_data[b], vel_data[a], s_v);
            var vn = b2Vec2.DotVV(v, n);
            if (vn < 0) {
                sum_v2 += vn * vn;
            }
        }
        return 0.5 * this.GetParticleMass() * sum_v2;
    };
    b2ParticleSystem.prototype.SetStrictContactCheck = function (enabled) {
        this.m_def.strictContactCheck = enabled;
    };
    b2ParticleSystem.prototype.GetStrictContactCheck = function () {
        return this.m_def.strictContactCheck;
    };
    b2ParticleSystem.prototype.SetParticleLifetime = function (index, lifetime) {
        var initializeExpirationTimes = this.m_indexByExpirationTimeBuffer.data === null;
        this.m_expirationTimeBuffer.data = this.RequestBuffer(this.m_expirationTimeBuffer.data);
        this.m_indexByExpirationTimeBuffer.data = this.RequestBuffer(this.m_indexByExpirationTimeBuffer.data);
        if (initializeExpirationTimes) {
            var particleCount = this.GetParticleCount();
            for (var i = 0; i < particleCount; ++i) {
                this.m_indexByExpirationTimeBuffer.data[i] = i;
            }
        }
        var quantizedLifetime = lifetime / this.m_def.lifetimeGranularity;
        var newExpirationTime = quantizedLifetime > 0.0 ? this.GetQuantizedTimeElapsed() + quantizedLifetime : quantizedLifetime;
        if (newExpirationTime !== this.m_expirationTimeBuffer.data[index]) {
            this.m_expirationTimeBuffer.data[index] = newExpirationTime;
            this.m_expirationTimeBufferRequiresSorting = true;
        }
    };
    b2ParticleSystem.prototype.GetParticleLifetime = function (index) {
        return this.ExpirationTimeToLifetime(this.GetExpirationTimeBuffer()[index]);
    };
    b2ParticleSystem.prototype.SetDestructionByAge = function (enable) {
        if (enable) {
            this.GetExpirationTimeBuffer();
        }
        this.m_def.destroyByAge = enable;
    };
    b2ParticleSystem.prototype.GetDestructionByAge = function () {
        return this.m_def.destroyByAge;
    };
    b2ParticleSystem.prototype.GetExpirationTimeBuffer = function () {
        this.m_expirationTimeBuffer.data = this.RequestBuffer(this.m_expirationTimeBuffer.data);
        return this.m_expirationTimeBuffer.data;
    };
    b2ParticleSystem.prototype.ExpirationTimeToLifetime = function (expirationTime) {
        return (expirationTime > 0 ?
            expirationTime - this.GetQuantizedTimeElapsed() :
            expirationTime) * this.m_def.lifetimeGranularity;
    };
    b2ParticleSystem.prototype.GetIndexByExpirationTimeBuffer = function () {
        if (this.GetParticleCount()) {
            this.SetParticleLifetime(0, this.GetParticleLifetime(0));
        }
        else {
            this.m_indexByExpirationTimeBuffer.data = this.RequestBuffer(this.m_indexByExpirationTimeBuffer.data);
        }
        return this.m_indexByExpirationTimeBuffer.data;
    };
    b2ParticleSystem.prototype.ParticleApplyLinearImpulse = function (index, impulse) {
        this.ApplyLinearImpulse(index, index + 1, impulse);
    };
    b2ParticleSystem.prototype.ApplyLinearImpulse = function (firstIndex, lastIndex, impulse) {
        var vel_data = this.m_velocityBuffer.data;
        var numParticles = (lastIndex - firstIndex);
        var totalMass = numParticles * this.GetParticleMass();
        var velocityDelta = new b2Vec2().Copy(impulse).SelfMul(1 / totalMass);
        for (var i = firstIndex; i < lastIndex; i++) {
            vel_data[i].SelfAdd(velocityDelta);
        }
    };
    b2ParticleSystem.IsSignificantForce = function (force) {
        return force.x !== 0 || force.y !== 0;
    };
    b2ParticleSystem.prototype.ParticleApplyForce = function (index, force) {
        if (b2ParticleSystem.IsSignificantForce(force) &&
            this.ForceCanBeApplied(this.m_flagsBuffer.data[index])) {
            this.PrepareForceBuffer();
            this.m_forceBuffer[index].SelfAdd(force);
        }
    };
    b2ParticleSystem.prototype.ApplyForce = function (firstIndex, lastIndex, force) {
        var distributedForce = new b2Vec2().Copy(force).SelfMul(1 / (lastIndex - firstIndex));
        if (b2ParticleSystem.IsSignificantForce(distributedForce)) {
            this.PrepareForceBuffer();
            for (var i = firstIndex; i < lastIndex; i++) {
                this.m_forceBuffer[i].SelfAdd(distributedForce);
            }
        }
    };
    b2ParticleSystem.prototype.GetNext = function () {
        return this.m_next;
    };
    b2ParticleSystem.prototype.QueryAABB = function (callback, aabb) {
        if (this.m_proxyBuffer.count === 0) {
            return;
        }
        var beginProxy = 0;
        var endProxy = this.m_proxyBuffer.count;
        var firstProxy = std_lower_bound(this.m_proxyBuffer.data, beginProxy, endProxy, b2ParticleSystem.computeTag(this.m_inverseDiameter * aabb.lowerBound.x, this.m_inverseDiameter * aabb.lowerBound.y), b2ParticleSystem_Proxy.CompareProxyTag);
        var lastProxy = std_upper_bound(this.m_proxyBuffer.data, firstProxy, endProxy, b2ParticleSystem.computeTag(this.m_inverseDiameter * aabb.upperBound.x, this.m_inverseDiameter * aabb.upperBound.y), b2ParticleSystem_Proxy.CompareTagProxy);
        var pos_data = this.m_positionBuffer.data;
        for (var k = firstProxy; k < lastProxy; ++k) {
            var proxy = this.m_proxyBuffer.data[k];
            var i = proxy.index;
            var p = pos_data[i];
            if (aabb.lowerBound.x < p.x && p.x < aabb.upperBound.x &&
                aabb.lowerBound.y < p.y && p.y < aabb.upperBound.y) {
                if (!callback.ReportParticle(this, i)) {
                    break;
                }
            }
        }
    };
    b2ParticleSystem.prototype.QueryShapeAABB = function (callback, shape, xf, childIndex) {
        if (childIndex === void 0) { childIndex = 0; }
        var s_aabb = b2ParticleSystem.QueryShapeAABB_s_aabb;
        var aabb = s_aabb;
        shape.ComputeAABB(aabb, xf, childIndex);
        this.QueryAABB(callback, aabb);
    };
    b2ParticleSystem.prototype.QueryPointAABB = function (callback, point, slop) {
        if (slop === void 0) { slop = b2_linearSlop; }
        var s_aabb = b2ParticleSystem.QueryPointAABB_s_aabb;
        var aabb = s_aabb;
        aabb.lowerBound.Set(point.x - slop, point.y - slop);
        aabb.upperBound.Set(point.x + slop, point.y + slop);
        this.QueryAABB(callback, aabb);
    };
    b2ParticleSystem.prototype.RayCast = function (callback, point1, point2) {
        var s_aabb = b2ParticleSystem.RayCast_s_aabb;
        var s_p = b2ParticleSystem.RayCast_s_p;
        var s_v = b2ParticleSystem.RayCast_s_v;
        var s_n = b2ParticleSystem.RayCast_s_n;
        var s_point = b2ParticleSystem.RayCast_s_point;
        if (this.m_proxyBuffer.count === 0) {
            return;
        }
        var pos_data = this.m_positionBuffer.data;
        var aabb = s_aabb;
        b2Vec2.MinV(point1, point2, aabb.lowerBound);
        b2Vec2.MaxV(point1, point2, aabb.upperBound);
        var fraction = 1;
        var v = b2Vec2.SubVV(point2, point1, s_v);
        var v2 = b2Vec2.DotVV(v, v);
        var enumerator = this.GetInsideBoundsEnumerator(aabb);
        var i;
        while ((i = enumerator.GetNext()) >= 0) {
            var p = b2Vec2.SubVV(point1, pos_data[i], s_p);
            var pv = b2Vec2.DotVV(p, v);
            var p2 = b2Vec2.DotVV(p, p);
            var determinant = pv * pv - v2 * (p2 - this.m_squaredDiameter);
            if (determinant >= 0) {
                var sqrtDeterminant = b2Sqrt(determinant);
                var t = (-pv - sqrtDeterminant) / v2;
                if (t > fraction) {
                    continue;
                }
                if (t < 0) {
                    t = (-pv + sqrtDeterminant) / v2;
                    if (t < 0 || t > fraction) {
                        continue;
                    }
                }
                var n = b2Vec2.AddVMulSV(p, t, v, s_n);
                n.Normalize();
                var f = callback.ReportParticle(this, i, b2Vec2.AddVMulSV(point1, t, v, s_point), n, t);
                fraction = b2Min(fraction, f);
                if (fraction <= 0) {
                    break;
                }
            }
        }
    };
    b2ParticleSystem.prototype.ComputeAABB = function (aabb) {
        var particleCount = this.GetParticleCount();
        aabb.lowerBound.x = +b2_maxFloat;
        aabb.lowerBound.y = +b2_maxFloat;
        aabb.upperBound.x = -b2_maxFloat;
        aabb.upperBound.y = -b2_maxFloat;
        var pos_data = this.m_positionBuffer.data;
        for (var i = 0; i < particleCount; i++) {
            var p = pos_data[i];
            b2Vec2.MinV(aabb.lowerBound, p, aabb.lowerBound);
            b2Vec2.MaxV(aabb.upperBound, p, aabb.upperBound);
        }
        aabb.lowerBound.x -= this.m_particleDiameter;
        aabb.lowerBound.y -= this.m_particleDiameter;
        aabb.upperBound.x += this.m_particleDiameter;
        aabb.upperBound.y += this.m_particleDiameter;
    };
    b2ParticleSystem.prototype.FreeBuffer = function (b, capacity) {
        if (b === null) {
            return;
        }
        b.length = 0;
    };
    b2ParticleSystem.prototype.FreeUserOverridableBuffer = function (b) {
        if (b.userSuppliedCapacity === 0) {
            this.FreeBuffer(b.data, this.m_internalAllocatedCapacity);
        }
    };
    b2ParticleSystem.prototype.ReallocateBuffer3 = function (oldBuffer, oldCapacity, newCapacity) {
        if (newCapacity <= oldCapacity) {
            throw new Error();
        }
        var newBuffer = (oldBuffer) ? oldBuffer.slice() : [];
        newBuffer.length = newCapacity;
        return newBuffer;
    };
    b2ParticleSystem.prototype.ReallocateBuffer5 = function (buffer, userSuppliedCapacity, oldCapacity, newCapacity, deferred) {
        if (newCapacity <= oldCapacity) {
            throw new Error();
        }
        if (!(!userSuppliedCapacity || newCapacity <= userSuppliedCapacity)) {
            throw new Error();
        }
        if ((!deferred || buffer) && !userSuppliedCapacity) {
            buffer = this.ReallocateBuffer3(buffer, oldCapacity, newCapacity);
        }
        return buffer;
    };
    b2ParticleSystem.prototype.ReallocateBuffer4 = function (buffer, oldCapacity, newCapacity, deferred) {
        return this.ReallocateBuffer5(buffer.data, buffer.userSuppliedCapacity, oldCapacity, newCapacity, deferred);
    };
    b2ParticleSystem.prototype.RequestBuffer = function (buffer) {
        if (!buffer) {
            if (this.m_internalAllocatedCapacity === 0) {
                this.ReallocateInternalAllocatedBuffers(b2_minParticleSystemBufferCapacity);
            }
            buffer = [];
            buffer.length = this.m_internalAllocatedCapacity;
        }
        return buffer;
    };
    b2ParticleSystem.prototype.ReallocateHandleBuffers = function (newCapacity) {
        this.m_handleIndexBuffer.data = this.ReallocateBuffer4(this.m_handleIndexBuffer, this.m_internalAllocatedCapacity, newCapacity, true);
    };
    b2ParticleSystem.prototype.ReallocateInternalAllocatedBuffers = function (capacity) {
        function LimitCapacity(capacity, maxCount) {
            return maxCount && capacity > maxCount ? maxCount : capacity;
        }
        capacity = LimitCapacity(capacity, this.m_def.maxCount);
        capacity = LimitCapacity(capacity, this.m_flagsBuffer.userSuppliedCapacity);
        capacity = LimitCapacity(capacity, this.m_positionBuffer.userSuppliedCapacity);
        capacity = LimitCapacity(capacity, this.m_velocityBuffer.userSuppliedCapacity);
        capacity = LimitCapacity(capacity, this.m_colorBuffer.userSuppliedCapacity);
        capacity = LimitCapacity(capacity, this.m_userDataBuffer.userSuppliedCapacity);
        if (this.m_internalAllocatedCapacity < capacity) {
            this.ReallocateHandleBuffers(capacity);
            this.m_flagsBuffer.data = this.ReallocateBuffer4(this.m_flagsBuffer, this.m_internalAllocatedCapacity, capacity, false);
            var stuck = this.m_stuckThreshold > 0;
            this.m_lastBodyContactStepBuffer.data = this.ReallocateBuffer4(this.m_lastBodyContactStepBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
            this.m_bodyContactCountBuffer.data = this.ReallocateBuffer4(this.m_bodyContactCountBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
            this.m_consecutiveContactStepsBuffer.data = this.ReallocateBuffer4(this.m_consecutiveContactStepsBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
            this.m_positionBuffer.data = this.ReallocateBuffer4(this.m_positionBuffer, this.m_internalAllocatedCapacity, capacity, false);
            this.m_velocityBuffer.data = this.ReallocateBuffer4(this.m_velocityBuffer, this.m_internalAllocatedCapacity, capacity, false);
            this.m_forceBuffer = this.ReallocateBuffer5(this.m_forceBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
            this.m_weightBuffer = this.ReallocateBuffer5(this.m_weightBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
            this.m_staticPressureBuffer = this.ReallocateBuffer5(this.m_staticPressureBuffer, 0, this.m_internalAllocatedCapacity, capacity, true);
            this.m_accumulationBuffer = this.ReallocateBuffer5(this.m_accumulationBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
            this.m_accumulation2Buffer = this.ReallocateBuffer5(this.m_accumulation2Buffer, 0, this.m_internalAllocatedCapacity, capacity, true);
            this.m_depthBuffer = this.ReallocateBuffer5(this.m_depthBuffer, 0, this.m_internalAllocatedCapacity, capacity, true);
            this.m_colorBuffer.data = this.ReallocateBuffer4(this.m_colorBuffer, this.m_internalAllocatedCapacity, capacity, true);
            this.m_groupBuffer = this.ReallocateBuffer5(this.m_groupBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
            this.m_userDataBuffer.data = this.ReallocateBuffer4(this.m_userDataBuffer, this.m_internalAllocatedCapacity, capacity, true);
            this.m_expirationTimeBuffer.data = this.ReallocateBuffer4(this.m_expirationTimeBuffer, this.m_internalAllocatedCapacity, capacity, true);
            this.m_indexByExpirationTimeBuffer.data = this.ReallocateBuffer4(this.m_indexByExpirationTimeBuffer, this.m_internalAllocatedCapacity, capacity, false);
            this.m_internalAllocatedCapacity = capacity;
        }
    };
    b2ParticleSystem.prototype.CreateParticleForGroup = function (groupDef, xf, p) {
        var particleDef = new b2ParticleDef();
        particleDef.flags = b2Maybe(groupDef.flags, 0);
        b2Transform.MulXV(xf, p, particleDef.position);
        b2Vec2.AddVV(b2Maybe(groupDef.linearVelocity, b2Vec2.ZERO), b2Vec2.CrossSV(b2Maybe(groupDef.angularVelocity, 0), b2Vec2.SubVV(particleDef.position, b2Maybe(groupDef.position, b2Vec2.ZERO), b2Vec2.s_t0), b2Vec2.s_t0), particleDef.velocity);
        particleDef.color.Copy(b2Maybe(groupDef.color, b2Color.ZERO));
        particleDef.lifetime = b2Maybe(groupDef.lifetime, 0);
        particleDef.userData = groupDef.userData;
        this.CreateParticle(particleDef);
    };
    b2ParticleSystem.prototype.CreateParticlesStrokeShapeForGroup = function (shape, groupDef, xf) {
        var s_edge = b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_edge;
        var s_d = b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_d;
        var s_p = b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_p;
        var stride = b2Maybe(groupDef.stride, 0);
        if (stride === 0) {
            stride = this.GetParticleStride();
        }
        var positionOnEdge = 0;
        var childCount = shape.GetChildCount();
        for (var childIndex = 0; childIndex < childCount; childIndex++) {
            var edge = null;
            if (shape.GetType() === b2ShapeType.e_edgeShape) {
                edge = shape;
            }
            else {
                edge = s_edge;
                shape.GetChildEdge(edge, childIndex);
            }
            var d = b2Vec2.SubVV(edge.m_vertex2, edge.m_vertex1, s_d);
            var edgeLength = d.Length();
            while (positionOnEdge < edgeLength) {
                var p = b2Vec2.AddVMulSV(edge.m_vertex1, positionOnEdge / edgeLength, d, s_p);
                this.CreateParticleForGroup(groupDef, xf, p);
                positionOnEdge += stride;
            }
            positionOnEdge -= edgeLength;
        }
    };
    b2ParticleSystem.prototype.CreateParticlesFillShapeForGroup = function (shape, groupDef, xf) {
        var s_aabb = b2ParticleSystem.CreateParticlesFillShapeForGroup_s_aabb;
        var s_p = b2ParticleSystem.CreateParticlesFillShapeForGroup_s_p;
        var stride = b2Maybe(groupDef.stride, 0);
        if (stride === 0) {
            stride = this.GetParticleStride();
        }
        var identity = b2Transform.IDENTITY;
        var aabb = s_aabb;
        shape.ComputeAABB(aabb, identity, 0);
        for (var y = Math.floor(aabb.lowerBound.y / stride) * stride; y < aabb.upperBound.y; y += stride) {
            for (var x = Math.floor(aabb.lowerBound.x / stride) * stride; x < aabb.upperBound.x; x += stride) {
                var p = s_p.Set(x, y);
                if (shape.TestPoint(identity, p)) {
                    this.CreateParticleForGroup(groupDef, xf, p);
                }
            }
        }
    };
    b2ParticleSystem.prototype.CreateParticlesWithShapeForGroup = function (shape, groupDef, xf) {
        switch (shape.GetType()) {
            case b2ShapeType.e_edgeShape:
            case b2ShapeType.e_chainShape:
                this.CreateParticlesStrokeShapeForGroup(shape, groupDef, xf);
                break;
            case b2ShapeType.e_polygonShape:
            case b2ShapeType.e_circleShape:
                this.CreateParticlesFillShapeForGroup(shape, groupDef, xf);
                break;
            default:
                break;
        }
    };
    b2ParticleSystem.prototype.CreateParticlesWithShapesForGroup = function (shapes, shapeCount, groupDef, xf) {
        var compositeShape = new b2ParticleSystem_CompositeShape(shapes, shapeCount);
        this.CreateParticlesFillShapeForGroup(compositeShape, groupDef, xf);
    };
    b2ParticleSystem.prototype.CloneParticle = function (oldIndex, group) {
        var def = new b2ParticleDef();
        def.flags = this.m_flagsBuffer.data[oldIndex];
        def.position.Copy(this.m_positionBuffer.data[oldIndex]);
        def.velocity.Copy(this.m_velocityBuffer.data[oldIndex]);
        if (this.m_colorBuffer.data) {
            def.color.Copy(this.m_colorBuffer.data[oldIndex]);
        }
        if (this.m_userDataBuffer.data) {
            def.userData = this.m_userDataBuffer.data[oldIndex];
        }
        def.group = group;
        var newIndex = this.CreateParticle(def);
        if (this.m_handleIndexBuffer.data) {
            var handle = this.m_handleIndexBuffer.data[oldIndex];
            if (handle) {
                handle.SetIndex(newIndex);
            }
            this.m_handleIndexBuffer.data[newIndex] = handle;
            this.m_handleIndexBuffer.data[oldIndex] = null;
        }
        if (this.m_lastBodyContactStepBuffer.data) {
            this.m_lastBodyContactStepBuffer.data[newIndex] =
                this.m_lastBodyContactStepBuffer.data[oldIndex];
        }
        if (this.m_bodyContactCountBuffer.data) {
            this.m_bodyContactCountBuffer.data[newIndex] =
                this.m_bodyContactCountBuffer.data[oldIndex];
        }
        if (this.m_consecutiveContactStepsBuffer.data) {
            this.m_consecutiveContactStepsBuffer.data[newIndex] =
                this.m_consecutiveContactStepsBuffer.data[oldIndex];
        }
        if (this.m_hasForce) {
            this.m_forceBuffer[newIndex].Copy(this.m_forceBuffer[oldIndex]);
        }
        if (this.m_staticPressureBuffer) {
            this.m_staticPressureBuffer[newIndex] = this.m_staticPressureBuffer[oldIndex];
        }
        if (this.m_depthBuffer) {
            this.m_depthBuffer[newIndex] = this.m_depthBuffer[oldIndex];
        }
        if (this.m_expirationTimeBuffer.data) {
            this.m_expirationTimeBuffer.data[newIndex] =
                this.m_expirationTimeBuffer.data[oldIndex];
        }
        return newIndex;
    };
    b2ParticleSystem.prototype.DestroyParticlesInGroup = function (group, callDestructionListener) {
        if (callDestructionListener === void 0) { callDestructionListener = false; }
        for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
            this.DestroyParticle(i, callDestructionListener);
        }
    };
    b2ParticleSystem.prototype.DestroyParticleGroup = function (group) {
        if (this.m_world.m_destructionListener) {
            this.m_world.m_destructionListener.SayGoodbyeParticleGroup(group);
        }
        this.SetGroupFlags(group, 0);
        for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
            this.m_groupBuffer[i] = null;
        }
        if (group.m_prev) {
            group.m_prev.m_next = group.m_next;
        }
        if (group.m_next) {
            group.m_next.m_prev = group.m_prev;
        }
        if (group === this.m_groupList) {
            this.m_groupList = group.m_next;
        }
        --this.m_groupCount;
    };
    b2ParticleSystem.ParticleCanBeConnected = function (flags, group) {
        return ((flags & (b2ParticleFlag.b2_wallParticle | b2ParticleFlag.b2_springParticle | b2ParticleFlag.b2_elasticParticle)) !== 0) ||
            ((group !== null) && ((group.GetGroupFlags() & b2ParticleGroupFlag.b2_rigidParticleGroup) !== 0));
    };
    b2ParticleSystem.prototype.UpdatePairsAndTriads = function (firstIndex, lastIndex, filter) {
        var s_dab = b2ParticleSystem.UpdatePairsAndTriads_s_dab;
        var s_dbc = b2ParticleSystem.UpdatePairsAndTriads_s_dbc;
        var s_dca = b2ParticleSystem.UpdatePairsAndTriads_s_dca;
        var pos_data = this.m_positionBuffer.data;
        var particleFlags = 0;
        for (var i = firstIndex; i < lastIndex; i++) {
            particleFlags |= this.m_flagsBuffer.data[i];
        }
        if (particleFlags & b2ParticleSystem.k_pairFlags) {
            for (var k = 0; k < this.m_contactBuffer.count; k++) {
                var contact = this.m_contactBuffer.data[k];
                var a = contact.indexA;
                var b = contact.indexB;
                var af = this.m_flagsBuffer.data[a];
                var bf = this.m_flagsBuffer.data[b];
                var groupA = this.m_groupBuffer[a];
                var groupB = this.m_groupBuffer[b];
                if (a >= firstIndex && a < lastIndex &&
                    b >= firstIndex && b < lastIndex &&
                    !((af | bf) & b2ParticleFlag.b2_zombieParticle) &&
                    ((af | bf) & b2ParticleSystem.k_pairFlags) &&
                    (filter.IsNecessary(a) || filter.IsNecessary(b)) &&
                    b2ParticleSystem.ParticleCanBeConnected(af, groupA) &&
                    b2ParticleSystem.ParticleCanBeConnected(bf, groupB) &&
                    filter.ShouldCreatePair(a, b)) {
                    var pair = this.m_pairBuffer.data[this.m_pairBuffer.Append()];
                    pair.indexA = a;
                    pair.indexB = b;
                    pair.flags = contact.flags;
                    pair.strength = b2Min(groupA ? groupA.m_strength : 1, groupB ? groupB.m_strength : 1);
                    pair.distance = b2Vec2.DistanceVV(pos_data[a], pos_data[b]);
                }
                std_stable_sort(this.m_pairBuffer.data, 0, this.m_pairBuffer.count, b2ParticleSystem.ComparePairIndices);
                this.m_pairBuffer.Unique(b2ParticleSystem.MatchPairIndices);
            }
        }
        if (particleFlags & b2ParticleSystem.k_triadFlags) {
            var diagram = new b2VoronoiDiagram(lastIndex - firstIndex);
            for (var i = firstIndex; i < lastIndex; i++) {
                var flags = this.m_flagsBuffer.data[i];
                var group = this.m_groupBuffer[i];
                if (!(flags & b2ParticleFlag.b2_zombieParticle) &&
                    b2ParticleSystem.ParticleCanBeConnected(flags, group)) {
                    diagram.AddGenerator(pos_data[i], i, filter.IsNecessary(i));
                }
            }
            var stride = this.GetParticleStride();
            diagram.Generate(stride / 2, stride * 2);
            var system_1 = this;
            var callback = function (a, b, c) {
                var af = system_1.m_flagsBuffer.data[a];
                var bf = system_1.m_flagsBuffer.data[b];
                var cf = system_1.m_flagsBuffer.data[c];
                if (((af | bf | cf) & b2ParticleSystem.k_triadFlags) &&
                    filter.ShouldCreateTriad(a, b, c)) {
                    var pa = pos_data[a];
                    var pb = pos_data[b];
                    var pc = pos_data[c];
                    var dab = b2Vec2.SubVV(pa, pb, s_dab);
                    var dbc = b2Vec2.SubVV(pb, pc, s_dbc);
                    var dca = b2Vec2.SubVV(pc, pa, s_dca);
                    var maxDistanceSquared = b2_maxTriadDistanceSquared * system_1.m_squaredDiameter;
                    if (b2Vec2.DotVV(dab, dab) > maxDistanceSquared ||
                        b2Vec2.DotVV(dbc, dbc) > maxDistanceSquared ||
                        b2Vec2.DotVV(dca, dca) > maxDistanceSquared) {
                        return;
                    }
                    var groupA = system_1.m_groupBuffer[a];
                    var groupB = system_1.m_groupBuffer[b];
                    var groupC = system_1.m_groupBuffer[c];
                    var triad = system_1.m_triadBuffer.data[system_1.m_triadBuffer.Append()];
                    triad.indexA = a;
                    triad.indexB = b;
                    triad.indexC = c;
                    triad.flags = af | bf | cf;
                    triad.strength = b2Min(b2Min(groupA ? groupA.m_strength : 1, groupB ? groupB.m_strength : 1), groupC ? groupC.m_strength : 1);
                    var midPoint_x = (pa.x + pb.x + pc.x) / 3.0;
                    var midPoint_y = (pa.y + pb.y + pc.y) / 3.0;
                    triad.pa.x = pa.x - midPoint_x;
                    triad.pa.y = pa.y - midPoint_y;
                    triad.pb.x = pb.x - midPoint_x;
                    triad.pb.y = pb.y - midPoint_y;
                    triad.pc.x = pc.x - midPoint_x;
                    triad.pc.y = pc.y - midPoint_y;
                    triad.ka = -b2Vec2.DotVV(dca, dab);
                    triad.kb = -b2Vec2.DotVV(dab, dbc);
                    triad.kc = -b2Vec2.DotVV(dbc, dca);
                    triad.s = b2Vec2.CrossVV(pa, pb) + b2Vec2.CrossVV(pb, pc) + b2Vec2.CrossVV(pc, pa);
                }
            };
            diagram.GetNodes(callback);
            std_stable_sort(this.m_triadBuffer.data, 0, this.m_triadBuffer.count, b2ParticleSystem.CompareTriadIndices);
            this.m_triadBuffer.Unique(b2ParticleSystem.MatchTriadIndices);
        }
    };
    b2ParticleSystem.prototype.UpdatePairsAndTriadsWithReactiveParticles = function () {
        var filter = new b2ParticleSystem_ReactiveFilter(this.m_flagsBuffer);
        this.UpdatePairsAndTriads(0, this.m_count, filter);
        for (var i = 0; i < this.m_count; i++) {
            this.m_flagsBuffer.data[i] &= ~b2ParticleFlag.b2_reactiveParticle;
        }
        this.m_allParticleFlags &= ~b2ParticleFlag.b2_reactiveParticle;
    };
    b2ParticleSystem.ComparePairIndices = function (a, b) {
        var diffA = a.indexA - b.indexA;
        if (diffA !== 0) {
            return diffA < 0;
        }
        return a.indexB < b.indexB;
    };
    b2ParticleSystem.MatchPairIndices = function (a, b) {
        return a.indexA === b.indexA && a.indexB === b.indexB;
    };
    b2ParticleSystem.CompareTriadIndices = function (a, b) {
        var diffA = a.indexA - b.indexA;
        if (diffA !== 0) {
            return diffA < 0;
        }
        var diffB = a.indexB - b.indexB;
        if (diffB !== 0) {
            return diffB < 0;
        }
        return a.indexC < b.indexC;
    };
    b2ParticleSystem.MatchTriadIndices = function (a, b) {
        return a.indexA === b.indexA && a.indexB === b.indexB && a.indexC === b.indexC;
    };
    b2ParticleSystem.InitializeParticleLists = function (group, nodeBuffer) {
        var bufferIndex = group.GetBufferIndex();
        var particleCount = group.GetParticleCount();
        for (var i = 0; i < particleCount; i++) {
            var node = nodeBuffer[i];
            node.list = node;
            node.next = null;
            node.count = 1;
            node.index = i + bufferIndex;
        }
    };
    b2ParticleSystem.prototype.MergeParticleListsInContact = function (group, nodeBuffer) {
        var bufferIndex = group.GetBufferIndex();
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            var a = contact.indexA;
            var b = contact.indexB;
            if (!group.ContainsParticle(a) || !group.ContainsParticle(b)) {
                continue;
            }
            var listA = nodeBuffer[a - bufferIndex].list;
            var listB = nodeBuffer[b - bufferIndex].list;
            if (listA === listB) {
                continue;
            }
            if (listA.count < listB.count) {
                var _tmp = listA;
                listA = listB;
                listB = _tmp;
            }
            b2ParticleSystem.MergeParticleLists(listA, listB);
        }
    };
    b2ParticleSystem.MergeParticleLists = function (listA, listB) {
        for (var b = listB;;) {
            b.list = listA;
            var nextB = b.next;
            if (nextB) {
                b = nextB;
            }
            else {
                b.next = listA.next;
                break;
            }
        }
        listA.next = listB;
        listA.count += listB.count;
        listB.count = 0;
    };
    b2ParticleSystem.FindLongestParticleList = function (group, nodeBuffer) {
        var particleCount = group.GetParticleCount();
        var result = nodeBuffer[0];
        for (var i = 0; i < particleCount; i++) {
            var node = nodeBuffer[i];
            if (result.count < node.count) {
                result = node;
            }
        }
        return result;
    };
    b2ParticleSystem.prototype.MergeZombieParticleListNodes = function (group, nodeBuffer, survivingList) {
        var particleCount = group.GetParticleCount();
        for (var i = 0; i < particleCount; i++) {
            var node = nodeBuffer[i];
            if (node !== survivingList &&
                (this.m_flagsBuffer.data[node.index] & b2ParticleFlag.b2_zombieParticle)) {
                b2ParticleSystem.MergeParticleListAndNode(survivingList, node);
            }
        }
    };
    b2ParticleSystem.MergeParticleListAndNode = function (list, node) {
        node.list = list;
        node.next = list.next;
        list.next = node;
        list.count++;
        node.count = 0;
    };
    b2ParticleSystem.prototype.CreateParticleGroupsFromParticleList = function (group, nodeBuffer, survivingList) {
        var particleCount = group.GetParticleCount();
        var def = new b2ParticleGroupDef();
        def.groupFlags = group.GetGroupFlags();
        def.userData = group.GetUserData();
        for (var i = 0; i < particleCount; i++) {
            var list = nodeBuffer[i];
            if (!list.count || list === survivingList) {
                continue;
            }
            var newGroup = this.CreateParticleGroup(def);
            for (var node = list; node; node = node.next) {
                var oldIndex = node.index;
                var newIndex = this.CloneParticle(oldIndex, newGroup);
                this.m_flagsBuffer.data[oldIndex] |= b2ParticleFlag.b2_zombieParticle;
                node.index = newIndex;
            }
        }
    };
    b2ParticleSystem.prototype.UpdatePairsAndTriadsWithParticleList = function (group, nodeBuffer) {
        var bufferIndex = group.GetBufferIndex();
        for (var k = 0; k < this.m_pairBuffer.count; k++) {
            var pair = this.m_pairBuffer.data[k];
            var a = pair.indexA;
            var b = pair.indexB;
            if (group.ContainsParticle(a)) {
                pair.indexA = nodeBuffer[a - bufferIndex].index;
            }
            if (group.ContainsParticle(b)) {
                pair.indexB = nodeBuffer[b - bufferIndex].index;
            }
        }
        for (var k = 0; k < this.m_triadBuffer.count; k++) {
            var triad = this.m_triadBuffer.data[k];
            var a = triad.indexA;
            var b = triad.indexB;
            var c = triad.indexC;
            if (group.ContainsParticle(a)) {
                triad.indexA = nodeBuffer[a - bufferIndex].index;
            }
            if (group.ContainsParticle(b)) {
                triad.indexB = nodeBuffer[b - bufferIndex].index;
            }
            if (group.ContainsParticle(c)) {
                triad.indexC = nodeBuffer[c - bufferIndex].index;
            }
        }
    };
    b2ParticleSystem.prototype.ComputeDepth = function () {
        var contactGroups = [];
        var contactGroupsCount = 0;
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            var a = contact.indexA;
            var b = contact.indexB;
            var groupA = this.m_groupBuffer[a];
            var groupB = this.m_groupBuffer[b];
            if (groupA && groupA === groupB &&
                (groupA.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth)) {
                contactGroups[contactGroupsCount++] = contact;
            }
        }
        var groupsToUpdate = [];
        var groupsToUpdateCount = 0;
        for (var group = this.m_groupList; group; group = group.GetNext()) {
            if (group.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth) {
                groupsToUpdate[groupsToUpdateCount++] = group;
                this.SetGroupFlags(group, group.m_groupFlags &
                    ~b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth);
                for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
                    this.m_accumulationBuffer[i] = 0;
                }
            }
        }
        for (var k = 0; k < contactGroupsCount; k++) {
            var contact = contactGroups[k];
            var a = contact.indexA;
            var b = contact.indexB;
            var w = contact.weight;
            this.m_accumulationBuffer[a] += w;
            this.m_accumulationBuffer[b] += w;
        }
        for (var i = 0; i < groupsToUpdateCount; i++) {
            var group = groupsToUpdate[i];
            for (var i_1 = group.m_firstIndex; i_1 < group.m_lastIndex; i_1++) {
                var w = this.m_accumulationBuffer[i_1];
                this.m_depthBuffer[i_1] = w < 0.8 ? 0 : b2_maxFloat;
            }
        }
        var iterationCount = b2Sqrt(this.m_count) >> 0;
        for (var t = 0; t < iterationCount; t++) {
            var updated = false;
            for (var k = 0; k < contactGroupsCount; k++) {
                var contact = contactGroups[k];
                var a = contact.indexA;
                var b = contact.indexB;
                var r = 1 - contact.weight;
                var ap0 = this.m_depthBuffer[a];
                var bp0 = this.m_depthBuffer[b];
                var ap1 = bp0 + r;
                var bp1 = ap0 + r;
                if (ap0 > ap1) {
                    this.m_depthBuffer[a] = ap1;
                    updated = true;
                }
                if (bp0 > bp1) {
                    this.m_depthBuffer[b] = bp1;
                    updated = true;
                }
            }
            if (!updated) {
                break;
            }
        }
        for (var i = 0; i < groupsToUpdateCount; i++) {
            var group = groupsToUpdate[i];
            for (var i_2 = group.m_firstIndex; i_2 < group.m_lastIndex; i_2++) {
                if (this.m_depthBuffer[i_2] < b2_maxFloat) {
                    this.m_depthBuffer[i_2] *= this.m_particleDiameter;
                }
                else {
                    this.m_depthBuffer[i_2] = 0;
                }
            }
        }
    };
    b2ParticleSystem.prototype.GetInsideBoundsEnumerator = function (aabb) {
        var lowerTag = b2ParticleSystem.computeTag(this.m_inverseDiameter * aabb.lowerBound.x - 1, this.m_inverseDiameter * aabb.lowerBound.y - 1);
        var upperTag = b2ParticleSystem.computeTag(this.m_inverseDiameter * aabb.upperBound.x + 1, this.m_inverseDiameter * aabb.upperBound.y + 1);
        var beginProxy = 0;
        var endProxy = this.m_proxyBuffer.count;
        var firstProxy = std_lower_bound(this.m_proxyBuffer.data, beginProxy, endProxy, lowerTag, b2ParticleSystem_Proxy.CompareProxyTag);
        var lastProxy = std_upper_bound(this.m_proxyBuffer.data, beginProxy, endProxy, upperTag, b2ParticleSystem_Proxy.CompareTagProxy);
        return new b2ParticleSystem_InsideBoundsEnumerator(this, lowerTag, upperTag, firstProxy, lastProxy);
    };
    b2ParticleSystem.prototype.UpdateAllParticleFlags = function () {
        this.m_allParticleFlags = 0;
        for (var i = 0; i < this.m_count; i++) {
            this.m_allParticleFlags |= this.m_flagsBuffer.data[i];
        }
        this.m_needsUpdateAllParticleFlags = false;
    };
    b2ParticleSystem.prototype.UpdateAllGroupFlags = function () {
        this.m_allGroupFlags = 0;
        for (var group = this.m_groupList; group; group = group.GetNext()) {
            this.m_allGroupFlags |= group.m_groupFlags;
        }
        this.m_needsUpdateAllGroupFlags = false;
    };
    b2ParticleSystem.prototype.AddContact = function (a, b, contacts) {
        var flags_data = this.m_flagsBuffer.data;
        var pos_data = this.m_positionBuffer.data;
        var d = b2Vec2.SubVV(pos_data[b], pos_data[a], b2ParticleSystem.AddContact_s_d);
        var distBtParticlesSq = b2Vec2.DotVV(d, d);
        if (0 < distBtParticlesSq && distBtParticlesSq < this.m_squaredDiameter) {
            var invD = b2InvSqrt(distBtParticlesSq);
            var contact = this.m_contactBuffer.data[this.m_contactBuffer.Append()];
            contact.indexA = a;
            contact.indexB = b;
            contact.flags = flags_data[a] | flags_data[b];
            contact.weight = 1 - distBtParticlesSq * invD * this.m_inverseDiameter;
            contact.normal.x = invD * d.x;
            contact.normal.y = invD * d.y;
        }
    };
    b2ParticleSystem.prototype.FindContacts_Reference = function (contacts) {
        var beginProxy = 0;
        var endProxy = this.m_proxyBuffer.count;
        this.m_contactBuffer.count = 0;
        for (var a = beginProxy, c = beginProxy; a < endProxy; a++) {
            var rightTag = b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, 1, 0);
            for (var b = a + 1; b < endProxy; b++) {
                if (rightTag < this.m_proxyBuffer.data[b].tag) {
                    break;
                }
                this.AddContact(this.m_proxyBuffer.data[a].index, this.m_proxyBuffer.data[b].index, this.m_contactBuffer);
            }
            var bottomLeftTag = b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, -1, 1);
            for (; c < endProxy; c++) {
                if (bottomLeftTag <= this.m_proxyBuffer.data[c].tag) {
                    break;
                }
            }
            var bottomRightTag = b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, 1, 1);
            for (var b = c; b < endProxy; b++) {
                if (bottomRightTag < this.m_proxyBuffer.data[b].tag) {
                    break;
                }
                this.AddContact(this.m_proxyBuffer.data[a].index, this.m_proxyBuffer.data[b].index, this.m_contactBuffer);
            }
        }
    };
    b2ParticleSystem.prototype.FindContacts = function (contacts) {
        this.FindContacts_Reference(contacts);
    };
    b2ParticleSystem.prototype.UpdateProxies_Reference = function (proxies) {
        var pos_data = this.m_positionBuffer.data;
        var inv_diam = this.m_inverseDiameter;
        for (var k = 0; k < this.m_proxyBuffer.count; ++k) {
            var proxy = this.m_proxyBuffer.data[k];
            var i = proxy.index;
            var p = pos_data[i];
            proxy.tag = b2ParticleSystem.computeTag(inv_diam * p.x, inv_diam * p.y);
        }
    };
    b2ParticleSystem.prototype.UpdateProxies = function (proxies) {
        this.UpdateProxies_Reference(proxies);
    };
    b2ParticleSystem.prototype.SortProxies = function (proxies) {
        std_sort(this.m_proxyBuffer.data, 0, this.m_proxyBuffer.count, b2ParticleSystem_Proxy.CompareProxyProxy);
    };
    b2ParticleSystem.prototype.FilterContacts = function (contacts) {
        var contactFilter = this.GetParticleContactFilter();
        if (contactFilter === null) {
            return;
        }
        var system = this;
        var predicate = function (contact) {
            return ((contact.flags & b2ParticleFlag.b2_particleContactFilterParticle) !== 0) && !contactFilter.ShouldCollideParticleParticle(system, contact.indexA, contact.indexB);
        };
        this.m_contactBuffer.RemoveIf(predicate);
    };
    b2ParticleSystem.prototype.NotifyContactListenerPreContact = function (particlePairs) {
        var contactListener = this.GetParticleContactListener();
        if (contactListener === null) {
            return;
        }
        particlePairs.Initialize(this.m_contactBuffer, this.m_flagsBuffer);
        throw new Error();
    };
    b2ParticleSystem.prototype.NotifyContactListenerPostContact = function (particlePairs) {
        var contactListener = this.GetParticleContactListener();
        if (contactListener === null) {
            return;
        }
        for (var k = 0; k < this.m_contactBuffer.count; ++k) {
            var contact = this.m_contactBuffer.data[k];
            var itemIndex = -1;
            if (itemIndex >= 0) {
                particlePairs.Invalidate(itemIndex);
            }
            else {
                contactListener.BeginContactParticleParticle(this, contact);
            }
        }
        throw new Error();
    };
    b2ParticleSystem.b2ParticleContactIsZombie = function (contact) {
        return (contact.flags & b2ParticleFlag.b2_zombieParticle) === b2ParticleFlag.b2_zombieParticle;
    };
    b2ParticleSystem.prototype.UpdateContacts = function (exceptZombie) {
        this.UpdateProxies(this.m_proxyBuffer);
        this.SortProxies(this.m_proxyBuffer);
        var particlePairs = new b2ParticlePairSet();
        this.NotifyContactListenerPreContact(particlePairs);
        this.FindContacts(this.m_contactBuffer);
        this.FilterContacts(this.m_contactBuffer);
        this.NotifyContactListenerPostContact(particlePairs);
        if (exceptZombie) {
            this.m_contactBuffer.RemoveIf(b2ParticleSystem.b2ParticleContactIsZombie);
        }
    };
    b2ParticleSystem.prototype.NotifyBodyContactListenerPreContact = function (fixtureSet) {
        var contactListener = this.GetFixtureContactListener();
        if (contactListener === null) {
            return;
        }
        fixtureSet.Initialize(this.m_bodyContactBuffer, this.m_flagsBuffer);
        throw new Error();
    };
    b2ParticleSystem.prototype.NotifyBodyContactListenerPostContact = function (fixtureSet) {
        var contactListener = this.GetFixtureContactListener();
        if (contactListener === null) {
            return;
        }
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            var index = -1;
            if (index >= 0) {
                fixtureSet.Invalidate(index);
            }
            else {
                contactListener.BeginContactFixtureParticle(this, contact);
            }
        }
        throw new Error();
    };
    b2ParticleSystem.prototype.UpdateBodyContacts = function () {
        var s_aabb = b2ParticleSystem.UpdateBodyContacts_s_aabb;
        var fixtureSet = new b2ParticleSystem_FixtureParticleSet();
        this.NotifyBodyContactListenerPreContact(fixtureSet);
        if (this.m_stuckThreshold > 0) {
            var particleCount = this.GetParticleCount();
            for (var i = 0; i < particleCount; i++) {
                this.m_bodyContactCountBuffer.data[i] = 0;
                if (this.m_timestamp > (this.m_lastBodyContactStepBuffer.data[i] + 1)) {
                    this.m_consecutiveContactStepsBuffer.data[i] = 0;
                }
            }
        }
        this.m_bodyContactBuffer.SetCount(0);
        this.m_stuckParticleBuffer.SetCount(0);
        var aabb = s_aabb;
        this.ComputeAABB(aabb);
        if (this.UpdateBodyContacts_callback === null) {
            this.UpdateBodyContacts_callback = new b2ParticleSystem_UpdateBodyContactsCallback(this);
        }
        var callback = this.UpdateBodyContacts_callback;
        callback.m_contactFilter = this.GetFixtureContactFilter();
        this.m_world.QueryAABB(callback, aabb);
        if (this.m_def.strictContactCheck) {
            this.RemoveSpuriousBodyContacts();
        }
        this.NotifyBodyContactListenerPostContact(fixtureSet);
    };
    b2ParticleSystem.prototype.Solve = function (step) {
        var s_subStep = b2ParticleSystem.Solve_s_subStep;
        if (this.m_count === 0) {
            return;
        }
        if (this.m_expirationTimeBuffer.data) {
            this.SolveLifetimes(step);
        }
        if (this.m_allParticleFlags & b2ParticleFlag.b2_zombieParticle) {
            this.SolveZombie();
        }
        if (this.m_needsUpdateAllParticleFlags) {
            this.UpdateAllParticleFlags();
        }
        if (this.m_needsUpdateAllGroupFlags) {
            this.UpdateAllGroupFlags();
        }
        if (this.m_paused) {
            return;
        }
        for (this.m_iterationIndex = 0; this.m_iterationIndex < step.particleIterations; this.m_iterationIndex++) {
            ++this.m_timestamp;
            var subStep = s_subStep.Copy(step);
            subStep.dt /= step.particleIterations;
            subStep.inv_dt *= step.particleIterations;
            this.UpdateContacts(false);
            this.UpdateBodyContacts();
            this.ComputeWeight();
            if (this.m_allGroupFlags & b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth) {
                this.ComputeDepth();
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_reactiveParticle) {
                this.UpdatePairsAndTriadsWithReactiveParticles();
            }
            if (this.m_hasForce) {
                this.SolveForce(subStep);
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_viscousParticle) {
                this.SolveViscous();
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_repulsiveParticle) {
                this.SolveRepulsive(subStep);
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_powderParticle) {
                this.SolvePowder(subStep);
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_tensileParticle) {
                this.SolveTensile(subStep);
            }
            if (this.m_allGroupFlags & b2ParticleGroupFlag.b2_solidParticleGroup) {
                this.SolveSolid(subStep);
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_colorMixingParticle) {
                this.SolveColorMixing();
            }
            this.SolveGravity(subStep);
            if (this.m_allParticleFlags & b2ParticleFlag.b2_staticPressureParticle) {
                this.SolveStaticPressure(subStep);
            }
            this.SolvePressure(subStep);
            this.SolveDamping(subStep);
            if (this.m_allParticleFlags & b2ParticleSystem.k_extraDampingFlags) {
                this.SolveExtraDamping();
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_elasticParticle) {
                this.SolveElastic(subStep);
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_springParticle) {
                this.SolveSpring(subStep);
            }
            this.LimitVelocity(subStep);
            if (this.m_allGroupFlags & b2ParticleGroupFlag.b2_rigidParticleGroup) {
                this.SolveRigidDamping();
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_barrierParticle) {
                this.SolveBarrier(subStep);
            }
            this.SolveCollision(subStep);
            if (this.m_allGroupFlags & b2ParticleGroupFlag.b2_rigidParticleGroup) {
                this.SolveRigid(subStep);
            }
            if (this.m_allParticleFlags & b2ParticleFlag.b2_wallParticle) {
                this.SolveWall();
            }
            for (var i = 0; i < this.m_count; i++) {
                this.m_positionBuffer.data[i].SelfMulAdd(subStep.dt, this.m_velocityBuffer.data[i]);
            }
        }
    };
    b2ParticleSystem.prototype.SolveCollision = function (step) {
        var s_aabb = b2ParticleSystem.SolveCollision_s_aabb;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        var aabb = s_aabb;
        aabb.lowerBound.x = +b2_maxFloat;
        aabb.lowerBound.y = +b2_maxFloat;
        aabb.upperBound.x = -b2_maxFloat;
        aabb.upperBound.y = -b2_maxFloat;
        for (var i = 0; i < this.m_count; i++) {
            var v = vel_data[i];
            var p1 = pos_data[i];
            var p2_x = p1.x + step.dt * v.x;
            var p2_y = p1.y + step.dt * v.y;
            aabb.lowerBound.x = b2Min(aabb.lowerBound.x, b2Min(p1.x, p2_x));
            aabb.lowerBound.y = b2Min(aabb.lowerBound.y, b2Min(p1.y, p2_y));
            aabb.upperBound.x = b2Max(aabb.upperBound.x, b2Max(p1.x, p2_x));
            aabb.upperBound.y = b2Max(aabb.upperBound.y, b2Max(p1.y, p2_y));
        }
        if (this.SolveCollision_callback === null) {
            this.SolveCollision_callback = new b2ParticleSystem_SolveCollisionCallback(this, step);
        }
        var callback = this.SolveCollision_callback;
        callback.m_step = step;
        this.m_world.QueryAABB(callback, aabb);
    };
    b2ParticleSystem.prototype.LimitVelocity = function (step) {
        var vel_data = this.m_velocityBuffer.data;
        var criticalVelocitySquared = this.GetCriticalVelocitySquared(step);
        for (var i = 0; i < this.m_count; i++) {
            var v = vel_data[i];
            var v2 = b2Vec2.DotVV(v, v);
            if (v2 > criticalVelocitySquared) {
                v.SelfMul(b2Sqrt(criticalVelocitySquared / v2));
            }
        }
    };
    b2ParticleSystem.prototype.SolveGravity = function (step) {
        var s_gravity = b2ParticleSystem.SolveGravity_s_gravity;
        var vel_data = this.m_velocityBuffer.data;
        var gravity = b2Vec2.MulSV(step.dt * this.m_def.gravityScale, this.m_world.GetGravity(), s_gravity);
        for (var i = 0; i < this.m_count; i++) {
            vel_data[i].SelfAdd(gravity);
        }
    };
    b2ParticleSystem.prototype.SolveBarrier = function (step) {
        var s_aabb = b2ParticleSystem.SolveBarrier_s_aabb;
        var s_va = b2ParticleSystem.SolveBarrier_s_va;
        var s_vb = b2ParticleSystem.SolveBarrier_s_vb;
        var s_pba = b2ParticleSystem.SolveBarrier_s_pba;
        var s_vba = b2ParticleSystem.SolveBarrier_s_vba;
        var s_vc = b2ParticleSystem.SolveBarrier_s_vc;
        var s_pca = b2ParticleSystem.SolveBarrier_s_pca;
        var s_vca = b2ParticleSystem.SolveBarrier_s_vca;
        var s_qba = b2ParticleSystem.SolveBarrier_s_qba;
        var s_qca = b2ParticleSystem.SolveBarrier_s_qca;
        var s_dv = b2ParticleSystem.SolveBarrier_s_dv;
        var s_f = b2ParticleSystem.SolveBarrier_s_f;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        for (var i = 0; i < this.m_count; i++) {
            var flags = this.m_flagsBuffer.data[i];
            if ((flags & b2ParticleSystem.k_barrierWallFlags) !== 0) {
                vel_data[i].SetZero();
            }
        }
        var tmax = b2_barrierCollisionTime * step.dt;
        var mass = this.GetParticleMass();
        for (var k = 0; k < this.m_pairBuffer.count; k++) {
            var pair = this.m_pairBuffer.data[k];
            if (pair.flags & b2ParticleFlag.b2_barrierParticle) {
                var a = pair.indexA;
                var b = pair.indexB;
                var pa = pos_data[a];
                var pb = pos_data[b];
                var aabb = s_aabb;
                b2Vec2.MinV(pa, pb, aabb.lowerBound);
                b2Vec2.MaxV(pa, pb, aabb.upperBound);
                var aGroup = this.m_groupBuffer[a];
                var bGroup = this.m_groupBuffer[b];
                var va = this.GetLinearVelocity(aGroup, a, pa, s_va);
                var vb = this.GetLinearVelocity(bGroup, b, pb, s_vb);
                var pba = b2Vec2.SubVV(pb, pa, s_pba);
                var vba = b2Vec2.SubVV(vb, va, s_vba);
                var enumerator = this.GetInsideBoundsEnumerator(aabb);
                var c = void 0;
                while ((c = enumerator.GetNext()) >= 0) {
                    var pc = pos_data[c];
                    var cGroup = this.m_groupBuffer[c];
                    if (aGroup !== cGroup && bGroup !== cGroup) {
                        var vc = this.GetLinearVelocity(cGroup, c, pc, s_vc);
                        var pca = b2Vec2.SubVV(pc, pa, s_pca);
                        var vca = b2Vec2.SubVV(vc, va, s_vca);
                        var e2 = b2Vec2.CrossVV(vba, vca);
                        var e1 = b2Vec2.CrossVV(pba, vca) - b2Vec2.CrossVV(pca, vba);
                        var e0 = b2Vec2.CrossVV(pba, pca);
                        var s = void 0, t = void 0;
                        var qba = s_qba, qca = s_qca;
                        if (e2 === 0) {
                            if (e1 === 0) {
                                continue;
                            }
                            t = -e0 / e1;
                            if (!(t >= 0 && t < tmax)) {
                                continue;
                            }
                            b2Vec2.AddVMulSV(pba, t, vba, qba);
                            b2Vec2.AddVMulSV(pca, t, vca, qca);
                            s = b2Vec2.DotVV(qba, qca) / b2Vec2.DotVV(qba, qba);
                            if (!(s >= 0 && s <= 1)) {
                                continue;
                            }
                        }
                        else {
                            var det = e1 * e1 - 4 * e0 * e2;
                            if (det < 0) {
                                continue;
                            }
                            var sqrtDet = b2Sqrt(det);
                            var t1 = (-e1 - sqrtDet) / (2 * e2);
                            var t2 = (-e1 + sqrtDet) / (2 * e2);
                            if (t1 > t2) {
                                var tmp = t1;
                                t1 = t2;
                                t2 = tmp;
                            }
                            t = t1;
                            b2Vec2.AddVMulSV(pba, t, vba, qba);
                            b2Vec2.AddVMulSV(pca, t, vca, qca);
                            s = b2Vec2.DotVV(qba, qca) / b2Vec2.DotVV(qba, qba);
                            if (!(t >= 0 && t < tmax && s >= 0 && s <= 1)) {
                                t = t2;
                                if (!(t >= 0 && t < tmax)) {
                                    continue;
                                }
                                b2Vec2.AddVMulSV(pba, t, vba, qba);
                                b2Vec2.AddVMulSV(pca, t, vca, qca);
                                s = b2Vec2.DotVV(qba, qca) / b2Vec2.DotVV(qba, qba);
                                if (!(s >= 0 && s <= 1)) {
                                    continue;
                                }
                            }
                        }
                        var dv = s_dv;
                        dv.x = va.x + s * vba.x - vc.x;
                        dv.y = va.y + s * vba.y - vc.y;
                        var f = b2Vec2.MulSV(mass, dv, s_f);
                        if (cGroup && this.IsRigidGroup(cGroup)) {
                            var mass_1 = cGroup.GetMass();
                            var inertia = cGroup.GetInertia();
                            if (mass_1 > 0) {
                                cGroup.m_linearVelocity.SelfMulAdd(1 / mass_1, f);
                            }
                            if (inertia > 0) {
                                cGroup.m_angularVelocity += b2Vec2.CrossVV(b2Vec2.SubVV(pc, cGroup.GetCenter(), b2Vec2.s_t0), f) / inertia;
                            }
                        }
                        else {
                            vel_data[c].SelfAdd(dv);
                        }
                        this.ParticleApplyForce(c, f.SelfMul(-step.inv_dt));
                    }
                }
            }
        }
    };
    b2ParticleSystem.prototype.SolveStaticPressure = function (step) {
        this.m_staticPressureBuffer = this.RequestBuffer(this.m_staticPressureBuffer);
        var criticalPressure = this.GetCriticalPressure(step);
        var pressurePerWeight = this.m_def.staticPressureStrength * criticalPressure;
        var maxPressure = b2_maxParticlePressure * criticalPressure;
        var relaxation = this.m_def.staticPressureRelaxation;
        for (var t = 0; t < this.m_def.staticPressureIterations; t++) {
            for (var i = 0; i < this.m_count; i++) {
                this.m_accumulationBuffer[i] = 0;
            }
            for (var k = 0; k < this.m_contactBuffer.count; k++) {
                var contact = this.m_contactBuffer.data[k];
                if (contact.flags & b2ParticleFlag.b2_staticPressureParticle) {
                    var a = contact.indexA;
                    var b = contact.indexB;
                    var w = contact.weight;
                    this.m_accumulationBuffer[a] += w * this.m_staticPressureBuffer[b];
                    this.m_accumulationBuffer[b] += w * this.m_staticPressureBuffer[a];
                }
            }
            for (var i = 0; i < this.m_count; i++) {
                var w = this.m_weightBuffer[i];
                if (this.m_flagsBuffer.data[i] & b2ParticleFlag.b2_staticPressureParticle) {
                    var wh = this.m_accumulationBuffer[i];
                    var h = (wh + pressurePerWeight * (w - b2_minParticleWeight)) /
                        (w + relaxation);
                    this.m_staticPressureBuffer[i] = b2Clamp(h, 0.0, maxPressure);
                }
                else {
                    this.m_staticPressureBuffer[i] = 0;
                }
            }
        }
    };
    b2ParticleSystem.prototype.ComputeWeight = function () {
        for (var k = 0; k < this.m_count; k++) {
            this.m_weightBuffer[k] = 0;
        }
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            var a = contact.index;
            var w = contact.weight;
            this.m_weightBuffer[a] += w;
        }
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            var a = contact.indexA;
            var b = contact.indexB;
            var w = contact.weight;
            this.m_weightBuffer[a] += w;
            this.m_weightBuffer[b] += w;
        }
    };
    b2ParticleSystem.prototype.SolvePressure = function (step) {
        var s_f = b2ParticleSystem.SolvePressure_s_f;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        var criticalPressure = this.GetCriticalPressure(step);
        var pressurePerWeight = this.m_def.pressureStrength * criticalPressure;
        var maxPressure = b2_maxParticlePressure * criticalPressure;
        for (var i = 0; i < this.m_count; i++) {
            var w = this.m_weightBuffer[i];
            var h = pressurePerWeight * b2Max(0.0, w - b2_minParticleWeight);
            this.m_accumulationBuffer[i] = b2Min(h, maxPressure);
        }
        if (this.m_allParticleFlags & b2ParticleSystem.k_noPressureFlags) {
            for (var i = 0; i < this.m_count; i++) {
                if (this.m_flagsBuffer.data[i] & b2ParticleSystem.k_noPressureFlags) {
                    this.m_accumulationBuffer[i] = 0;
                }
            }
        }
        if (this.m_allParticleFlags & b2ParticleFlag.b2_staticPressureParticle) {
            for (var i = 0; i < this.m_count; i++) {
                if (this.m_flagsBuffer.data[i] & b2ParticleFlag.b2_staticPressureParticle) {
                    this.m_accumulationBuffer[i] += this.m_staticPressureBuffer[i];
                }
            }
        }
        var velocityPerPressure = step.dt / (this.m_def.density * this.m_particleDiameter);
        var inv_mass = this.GetParticleInvMass();
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            var a = contact.index;
            var b = contact.body;
            var w = contact.weight;
            var m = contact.mass;
            var n = contact.normal;
            var p = pos_data[a];
            var h = this.m_accumulationBuffer[a] + pressurePerWeight * w;
            var f = b2Vec2.MulSV(velocityPerPressure * w * m * h, n, s_f);
            vel_data[a].SelfMulSub(inv_mass, f);
            b.ApplyLinearImpulse(f, p, true);
        }
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            var a = contact.indexA;
            var b = contact.indexB;
            var w = contact.weight;
            var n = contact.normal;
            var h = this.m_accumulationBuffer[a] + this.m_accumulationBuffer[b];
            var f = b2Vec2.MulSV(velocityPerPressure * w * h, n, s_f);
            vel_data[a].SelfSub(f);
            vel_data[b].SelfAdd(f);
        }
    };
    b2ParticleSystem.prototype.SolveDamping = function (step) {
        var s_v = b2ParticleSystem.SolveDamping_s_v;
        var s_f = b2ParticleSystem.SolveDamping_s_f;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        var linearDamping = this.m_def.dampingStrength;
        var quadraticDamping = 1 / this.GetCriticalVelocity(step);
        var inv_mass = this.GetParticleInvMass();
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            var a = contact.index;
            var b = contact.body;
            var w = contact.weight;
            var m = contact.mass;
            var n = contact.normal;
            var p = pos_data[a];
            var v = b2Vec2.SubVV(b.GetLinearVelocityFromWorldPoint(p, b2Vec2.s_t0), vel_data[a], s_v);
            var vn = b2Vec2.DotVV(v, n);
            if (vn < 0) {
                var damping = b2Max(linearDamping * w, b2Min(-quadraticDamping * vn, 0.5));
                var f = b2Vec2.MulSV(damping * m * vn, n, s_f);
                vel_data[a].SelfMulAdd(inv_mass, f);
                b.ApplyLinearImpulse(f.SelfNeg(), p, true);
            }
        }
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            var a = contact.indexA;
            var b = contact.indexB;
            var w = contact.weight;
            var n = contact.normal;
            var v = b2Vec2.SubVV(vel_data[b], vel_data[a], s_v);
            var vn = b2Vec2.DotVV(v, n);
            if (vn < 0) {
                var damping = b2Max(linearDamping * w, b2Min(-quadraticDamping * vn, 0.5));
                var f = b2Vec2.MulSV(damping * vn, n, s_f);
                vel_data[a].SelfAdd(f);
                vel_data[b].SelfSub(f);
            }
        }
    };
    b2ParticleSystem.prototype.SolveRigidDamping = function () {
        var s_t0 = b2ParticleSystem.SolveRigidDamping_s_t0;
        var s_t1 = b2ParticleSystem.SolveRigidDamping_s_t1;
        var s_p = b2ParticleSystem.SolveRigidDamping_s_p;
        var s_v = b2ParticleSystem.SolveRigidDamping_s_v;
        var invMassA = [0.0], invInertiaA = [0.0], tangentDistanceA = [0.0];
        var invMassB = [0.0], invInertiaB = [0.0], tangentDistanceB = [0.0];
        var pos_data = this.m_positionBuffer.data;
        var damping = this.m_def.dampingStrength;
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            var a = contact.index;
            var aGroup = this.m_groupBuffer[a];
            if (aGroup && this.IsRigidGroup(aGroup)) {
                var b = contact.body;
                var n = contact.normal;
                var w = contact.weight;
                var p = pos_data[a];
                var v = b2Vec2.SubVV(b.GetLinearVelocityFromWorldPoint(p, s_t0), aGroup.GetLinearVelocityFromWorldPoint(p, s_t1), s_v);
                var vn = b2Vec2.DotVV(v, n);
                if (vn < 0) {
                    this.InitDampingParameterWithRigidGroupOrParticle(invMassA, invInertiaA, tangentDistanceA, true, aGroup, a, p, n);
                    this.InitDampingParameter(invMassB, invInertiaB, tangentDistanceB, b.GetMass(), b.GetInertia() - b.GetMass() * b.GetLocalCenter().LengthSquared(), b.GetWorldCenter(), p, n);
                    var f = damping * b2Min(w, 1.0) * this.ComputeDampingImpulse(invMassA[0], invInertiaA[0], tangentDistanceA[0], invMassB[0], invInertiaB[0], tangentDistanceB[0], vn);
                    this.ApplyDamping(invMassA[0], invInertiaA[0], tangentDistanceA[0], true, aGroup, a, f, n);
                    b.ApplyLinearImpulse(b2Vec2.MulSV(-f, n, b2Vec2.s_t0), p, true);
                }
            }
        }
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            var a = contact.indexA;
            var b = contact.indexB;
            var n = contact.normal;
            var w = contact.weight;
            var aGroup = this.m_groupBuffer[a];
            var bGroup = this.m_groupBuffer[b];
            var aRigid = this.IsRigidGroup(aGroup);
            var bRigid = this.IsRigidGroup(bGroup);
            if (aGroup !== bGroup && (aRigid || bRigid)) {
                var p = b2Vec2.MidVV(pos_data[a], pos_data[b], s_p);
                var v = b2Vec2.SubVV(this.GetLinearVelocity(bGroup, b, p, s_t0), this.GetLinearVelocity(aGroup, a, p, s_t1), s_v);
                var vn = b2Vec2.DotVV(v, n);
                if (vn < 0) {
                    this.InitDampingParameterWithRigidGroupOrParticle(invMassA, invInertiaA, tangentDistanceA, aRigid, aGroup, a, p, n);
                    this.InitDampingParameterWithRigidGroupOrParticle(invMassB, invInertiaB, tangentDistanceB, bRigid, bGroup, b, p, n);
                    var f = damping * w * this.ComputeDampingImpulse(invMassA[0], invInertiaA[0], tangentDistanceA[0], invMassB[0], invInertiaB[0], tangentDistanceB[0], vn);
                    this.ApplyDamping(invMassA[0], invInertiaA[0], tangentDistanceA[0], aRigid, aGroup, a, f, n);
                    this.ApplyDamping(invMassB[0], invInertiaB[0], tangentDistanceB[0], bRigid, bGroup, b, -f, n);
                }
            }
        }
    };
    b2ParticleSystem.prototype.SolveExtraDamping = function () {
        var s_v = b2ParticleSystem.SolveExtraDamping_s_v;
        var s_f = b2ParticleSystem.SolveExtraDamping_s_f;
        var vel_data = this.m_velocityBuffer.data;
        var pos_data = this.m_positionBuffer.data;
        var inv_mass = this.GetParticleInvMass();
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            var a = contact.index;
            if (this.m_flagsBuffer.data[a] & b2ParticleSystem.k_extraDampingFlags) {
                var b = contact.body;
                var m = contact.mass;
                var n = contact.normal;
                var p = pos_data[a];
                var v = b2Vec2.SubVV(b.GetLinearVelocityFromWorldPoint(p, b2Vec2.s_t0), vel_data[a], s_v);
                var vn = b2Vec2.DotVV(v, n);
                if (vn < 0) {
                    var f = b2Vec2.MulSV(0.5 * m * vn, n, s_f);
                    vel_data[a].SelfMulAdd(inv_mass, f);
                    b.ApplyLinearImpulse(f.SelfNeg(), p, true);
                }
            }
        }
    };
    b2ParticleSystem.prototype.SolveWall = function () {
        var vel_data = this.m_velocityBuffer.data;
        for (var i = 0; i < this.m_count; i++) {
            if (this.m_flagsBuffer.data[i] & b2ParticleFlag.b2_wallParticle) {
                vel_data[i].SetZero();
            }
        }
    };
    b2ParticleSystem.prototype.SolveRigid = function (step) {
        var s_position = b2ParticleSystem.SolveRigid_s_position;
        var s_rotation = b2ParticleSystem.SolveRigid_s_rotation;
        var s_transform = b2ParticleSystem.SolveRigid_s_transform;
        var s_velocityTransform = b2ParticleSystem.SolveRigid_s_velocityTransform;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        for (var group = this.m_groupList; group; group = group.GetNext()) {
            if (group.m_groupFlags & b2ParticleGroupFlag.b2_rigidParticleGroup) {
                group.UpdateStatistics();
                var rotation = s_rotation;
                rotation.SetAngle(step.dt * group.m_angularVelocity);
                var position = b2Vec2.AddVV(group.m_center, b2Vec2.SubVV(b2Vec2.MulSV(step.dt, group.m_linearVelocity, b2Vec2.s_t0), b2Rot.MulRV(rotation, group.m_center, b2Vec2.s_t1), b2Vec2.s_t0), s_position);
                var transform = s_transform;
                transform.SetPositionRotation(position, rotation);
                b2Transform.MulXX(transform, group.m_transform, group.m_transform);
                var velocityTransform = s_velocityTransform;
                velocityTransform.p.x = step.inv_dt * transform.p.x;
                velocityTransform.p.y = step.inv_dt * transform.p.y;
                velocityTransform.q.s = step.inv_dt * transform.q.s;
                velocityTransform.q.c = step.inv_dt * (transform.q.c - 1);
                for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
                    b2Transform.MulXV(velocityTransform, pos_data[i], vel_data[i]);
                }
            }
        }
    };
    b2ParticleSystem.prototype.SolveElastic = function (step) {
        var s_pa = b2ParticleSystem.SolveElastic_s_pa;
        var s_pb = b2ParticleSystem.SolveElastic_s_pb;
        var s_pc = b2ParticleSystem.SolveElastic_s_pc;
        var s_r = b2ParticleSystem.SolveElastic_s_r;
        var s_t0 = b2ParticleSystem.SolveElastic_s_t0;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        var elasticStrength = step.inv_dt * this.m_def.elasticStrength;
        for (var k = 0; k < this.m_triadBuffer.count; k++) {
            var triad = this.m_triadBuffer.data[k];
            if (triad.flags & b2ParticleFlag.b2_elasticParticle) {
                var a = triad.indexA;
                var b = triad.indexB;
                var c = triad.indexC;
                var oa = triad.pa;
                var ob = triad.pb;
                var oc = triad.pc;
                var pa = s_pa.Copy(pos_data[a]);
                var pb = s_pb.Copy(pos_data[b]);
                var pc = s_pc.Copy(pos_data[c]);
                var va = vel_data[a];
                var vb = vel_data[b];
                var vc = vel_data[c];
                pa.SelfMulAdd(step.dt, va);
                pb.SelfMulAdd(step.dt, vb);
                pc.SelfMulAdd(step.dt, vc);
                var midPoint_x = (pa.x + pb.x + pc.x) / 3.0;
                var midPoint_y = (pa.y + pb.y + pc.y) / 3.0;
                pa.x -= midPoint_x;
                pa.y -= midPoint_y;
                pb.x -= midPoint_x;
                pb.y -= midPoint_y;
                pc.x -= midPoint_x;
                pc.y -= midPoint_y;
                var r = s_r;
                r.s = b2Vec2.CrossVV(oa, pa) + b2Vec2.CrossVV(ob, pb) + b2Vec2.CrossVV(oc, pc);
                r.c = b2Vec2.DotVV(oa, pa) + b2Vec2.DotVV(ob, pb) + b2Vec2.DotVV(oc, pc);
                var r2 = r.s * r.s + r.c * r.c;
                var invR = b2InvSqrt(r2);
                if (!isFinite(invR)) {
                    invR = 1.98177537e+019;
                }
                r.s *= invR;
                r.c *= invR;
                var strength = elasticStrength * triad.strength;
                b2Rot.MulRV(r, oa, s_t0);
                b2Vec2.SubVV(s_t0, pa, s_t0);
                b2Vec2.MulSV(strength, s_t0, s_t0);
                va.SelfAdd(s_t0);
                b2Rot.MulRV(r, ob, s_t0);
                b2Vec2.SubVV(s_t0, pb, s_t0);
                b2Vec2.MulSV(strength, s_t0, s_t0);
                vb.SelfAdd(s_t0);
                b2Rot.MulRV(r, oc, s_t0);
                b2Vec2.SubVV(s_t0, pc, s_t0);
                b2Vec2.MulSV(strength, s_t0, s_t0);
                vc.SelfAdd(s_t0);
            }
        }
    };
    b2ParticleSystem.prototype.SolveSpring = function (step) {
        var s_pa = b2ParticleSystem.SolveSpring_s_pa;
        var s_pb = b2ParticleSystem.SolveSpring_s_pb;
        var s_d = b2ParticleSystem.SolveSpring_s_d;
        var s_f = b2ParticleSystem.SolveSpring_s_f;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        var springStrength = step.inv_dt * this.m_def.springStrength;
        for (var k = 0; k < this.m_pairBuffer.count; k++) {
            var pair = this.m_pairBuffer.data[k];
            if (pair.flags & b2ParticleFlag.b2_springParticle) {
                var a = pair.indexA;
                var b = pair.indexB;
                var pa = s_pa.Copy(pos_data[a]);
                var pb = s_pb.Copy(pos_data[b]);
                var va = vel_data[a];
                var vb = vel_data[b];
                pa.SelfMulAdd(step.dt, va);
                pb.SelfMulAdd(step.dt, vb);
                var d = b2Vec2.SubVV(pb, pa, s_d);
                var r0 = pair.distance;
                var r1 = d.Length();
                var strength = springStrength * pair.strength;
                var f = b2Vec2.MulSV(strength * (r0 - r1) / r1, d, s_f);
                va.SelfSub(f);
                vb.SelfAdd(f);
            }
        }
    };
    b2ParticleSystem.prototype.SolveTensile = function (step) {
        var s_weightedNormal = b2ParticleSystem.SolveTensile_s_weightedNormal;
        var s_s = b2ParticleSystem.SolveTensile_s_s;
        var s_f = b2ParticleSystem.SolveTensile_s_f;
        var vel_data = this.m_velocityBuffer.data;
        for (var i = 0; i < this.m_count; i++) {
            this.m_accumulation2Buffer[i] = new b2Vec2();
            this.m_accumulation2Buffer[i].SetZero();
        }
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            if (contact.flags & b2ParticleFlag.b2_tensileParticle) {
                var a = contact.indexA;
                var b = contact.indexB;
                var w = contact.weight;
                var n = contact.normal;
                var weightedNormal = b2Vec2.MulSV((1 - w) * w, n, s_weightedNormal);
                this.m_accumulation2Buffer[a].SelfSub(weightedNormal);
                this.m_accumulation2Buffer[b].SelfAdd(weightedNormal);
            }
        }
        var criticalVelocity = this.GetCriticalVelocity(step);
        var pressureStrength = this.m_def.surfaceTensionPressureStrength * criticalVelocity;
        var normalStrength = this.m_def.surfaceTensionNormalStrength * criticalVelocity;
        var maxVelocityVariation = b2_maxParticleForce * criticalVelocity;
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            if (contact.flags & b2ParticleFlag.b2_tensileParticle) {
                var a = contact.indexA;
                var b = contact.indexB;
                var w = contact.weight;
                var n = contact.normal;
                var h = this.m_weightBuffer[a] + this.m_weightBuffer[b];
                var s = b2Vec2.SubVV(this.m_accumulation2Buffer[b], this.m_accumulation2Buffer[a], s_s);
                var fn = b2Min(pressureStrength * (h - 2) + normalStrength * b2Vec2.DotVV(s, n), maxVelocityVariation) * w;
                var f = b2Vec2.MulSV(fn, n, s_f);
                vel_data[a].SelfSub(f);
                vel_data[b].SelfAdd(f);
            }
        }
    };
    b2ParticleSystem.prototype.SolveViscous = function () {
        var s_v = b2ParticleSystem.SolveViscous_s_v;
        var s_f = b2ParticleSystem.SolveViscous_s_f;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        var viscousStrength = this.m_def.viscousStrength;
        var inv_mass = this.GetParticleInvMass();
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            var a = contact.index;
            if (this.m_flagsBuffer.data[a] & b2ParticleFlag.b2_viscousParticle) {
                var b = contact.body;
                var w = contact.weight;
                var m = contact.mass;
                var p = pos_data[a];
                var v = b2Vec2.SubVV(b.GetLinearVelocityFromWorldPoint(p, b2Vec2.s_t0), vel_data[a], s_v);
                var f = b2Vec2.MulSV(viscousStrength * m * w, v, s_f);
                vel_data[a].SelfMulAdd(inv_mass, f);
                b.ApplyLinearImpulse(f.SelfNeg(), p, true);
            }
        }
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            if (contact.flags & b2ParticleFlag.b2_viscousParticle) {
                var a = contact.indexA;
                var b = contact.indexB;
                var w = contact.weight;
                var v = b2Vec2.SubVV(vel_data[b], vel_data[a], s_v);
                var f = b2Vec2.MulSV(viscousStrength * w, v, s_f);
                vel_data[a].SelfAdd(f);
                vel_data[b].SelfSub(f);
            }
        }
    };
    b2ParticleSystem.prototype.SolveRepulsive = function (step) {
        var s_f = b2ParticleSystem.SolveRepulsive_s_f;
        var vel_data = this.m_velocityBuffer.data;
        var repulsiveStrength = this.m_def.repulsiveStrength * this.GetCriticalVelocity(step);
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            if (contact.flags & b2ParticleFlag.b2_repulsiveParticle) {
                var a = contact.indexA;
                var b = contact.indexB;
                if (this.m_groupBuffer[a] !== this.m_groupBuffer[b]) {
                    var w = contact.weight;
                    var n = contact.normal;
                    var f = b2Vec2.MulSV(repulsiveStrength * w, n, s_f);
                    vel_data[a].SelfSub(f);
                    vel_data[b].SelfAdd(f);
                }
            }
        }
    };
    b2ParticleSystem.prototype.SolvePowder = function (step) {
        var s_f = b2ParticleSystem.SolvePowder_s_f;
        var pos_data = this.m_positionBuffer.data;
        var vel_data = this.m_velocityBuffer.data;
        var powderStrength = this.m_def.powderStrength * this.GetCriticalVelocity(step);
        var minWeight = 1.0 - b2_particleStride;
        var inv_mass = this.GetParticleInvMass();
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            var a = contact.index;
            if (this.m_flagsBuffer.data[a] & b2ParticleFlag.b2_powderParticle) {
                var w = contact.weight;
                if (w > minWeight) {
                    var b = contact.body;
                    var m = contact.mass;
                    var p = pos_data[a];
                    var n = contact.normal;
                    var f = b2Vec2.MulSV(powderStrength * m * (w - minWeight), n, s_f);
                    vel_data[a].SelfMulSub(inv_mass, f);
                    b.ApplyLinearImpulse(f, p, true);
                }
            }
        }
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            if (contact.flags & b2ParticleFlag.b2_powderParticle) {
                var w = contact.weight;
                if (w > minWeight) {
                    var a = contact.indexA;
                    var b = contact.indexB;
                    var n = contact.normal;
                    var f = b2Vec2.MulSV(powderStrength * (w - minWeight), n, s_f);
                    vel_data[a].SelfSub(f);
                    vel_data[b].SelfAdd(f);
                }
            }
        }
    };
    b2ParticleSystem.prototype.SolveSolid = function (step) {
        var s_f = b2ParticleSystem.SolveSolid_s_f;
        var vel_data = this.m_velocityBuffer.data;
        this.m_depthBuffer = this.RequestBuffer(this.m_depthBuffer);
        var ejectionStrength = step.inv_dt * this.m_def.ejectionStrength;
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            var a = contact.indexA;
            var b = contact.indexB;
            if (this.m_groupBuffer[a] !== this.m_groupBuffer[b]) {
                var w = contact.weight;
                var n = contact.normal;
                var h = this.m_depthBuffer[a] + this.m_depthBuffer[b];
                var f = b2Vec2.MulSV(ejectionStrength * h * w, n, s_f);
                vel_data[a].SelfSub(f);
                vel_data[b].SelfAdd(f);
            }
        }
    };
    b2ParticleSystem.prototype.SolveForce = function (step) {
        var vel_data = this.m_velocityBuffer.data;
        var velocityPerForce = step.dt * this.GetParticleInvMass();
        for (var i = 0; i < this.m_count; i++) {
            vel_data[i].SelfMulAdd(velocityPerForce, this.m_forceBuffer[i]);
        }
        this.m_hasForce = false;
    };
    b2ParticleSystem.prototype.SolveColorMixing = function () {
        var colorMixing = 0.5 * this.m_def.colorMixingStrength;
        if (colorMixing) {
            for (var k = 0; k < this.m_contactBuffer.count; k++) {
                var contact = this.m_contactBuffer.data[k];
                var a = contact.indexA;
                var b = contact.indexB;
                if (this.m_flagsBuffer.data[a] & this.m_flagsBuffer.data[b] &
                    b2ParticleFlag.b2_colorMixingParticle) {
                    var colorA = this.m_colorBuffer.data[a];
                    var colorB = this.m_colorBuffer.data[b];
                    b2Color.MixColors(colorA, colorB, colorMixing);
                }
            }
        }
    };
    b2ParticleSystem.prototype.SolveZombie = function () {
        var newCount = 0;
        var newIndices = [];
        for (var i = 0; i < this.m_count; i++) {
            newIndices[i] = b2_invalidParticleIndex;
        }
        var allParticleFlags = 0;
        for (var i = 0; i < this.m_count; i++) {
            var flags = this.m_flagsBuffer.data[i];
            if (flags & b2ParticleFlag.b2_zombieParticle) {
                var destructionListener = this.m_world.m_destructionListener;
                if ((flags & b2ParticleFlag.b2_destructionListenerParticle) && destructionListener) {
                    destructionListener.SayGoodbyeParticle(this, i);
                }
                if (this.m_handleIndexBuffer.data) {
                    var handle = this.m_handleIndexBuffer.data[i];
                    if (handle) {
                        handle.SetIndex(b2_invalidParticleIndex);
                        this.m_handleIndexBuffer.data[i] = null;
                    }
                }
                newIndices[i] = b2_invalidParticleIndex;
            }
            else {
                newIndices[i] = newCount;
                if (i !== newCount) {
                    if (this.m_handleIndexBuffer.data) {
                        var handle = this.m_handleIndexBuffer.data[i];
                        if (handle) {
                            handle.SetIndex(newCount);
                        }
                        this.m_handleIndexBuffer.data[newCount] = handle;
                    }
                    this.m_flagsBuffer.data[newCount] = this.m_flagsBuffer.data[i];
                    if (this.m_lastBodyContactStepBuffer.data) {
                        this.m_lastBodyContactStepBuffer.data[newCount] = this.m_lastBodyContactStepBuffer.data[i];
                    }
                    if (this.m_bodyContactCountBuffer.data) {
                        this.m_bodyContactCountBuffer.data[newCount] = this.m_bodyContactCountBuffer.data[i];
                    }
                    if (this.m_consecutiveContactStepsBuffer.data) {
                        this.m_consecutiveContactStepsBuffer.data[newCount] = this.m_consecutiveContactStepsBuffer.data[i];
                    }
                    this.m_positionBuffer.data[newCount].Copy(this.m_positionBuffer.data[i]);
                    this.m_velocityBuffer.data[newCount].Copy(this.m_velocityBuffer.data[i]);
                    this.m_groupBuffer[newCount] = this.m_groupBuffer[i];
                    if (this.m_hasForce) {
                        this.m_forceBuffer[newCount].Copy(this.m_forceBuffer[i]);
                    }
                    if (this.m_staticPressureBuffer) {
                        this.m_staticPressureBuffer[newCount] = this.m_staticPressureBuffer[i];
                    }
                    if (this.m_depthBuffer) {
                        this.m_depthBuffer[newCount] = this.m_depthBuffer[i];
                    }
                    if (this.m_colorBuffer.data) {
                        this.m_colorBuffer.data[newCount].Copy(this.m_colorBuffer.data[i]);
                    }
                    if (this.m_userDataBuffer.data) {
                        this.m_userDataBuffer.data[newCount] = this.m_userDataBuffer.data[i];
                    }
                    if (this.m_expirationTimeBuffer.data) {
                        this.m_expirationTimeBuffer.data[newCount] = this.m_expirationTimeBuffer.data[i];
                    }
                }
                newCount++;
                allParticleFlags |= flags;
            }
        }
        var Test = {
            IsProxyInvalid: function (proxy) {
                return proxy.index < 0;
            },
            IsContactInvalid: function (contact) {
                return contact.indexA < 0 || contact.indexB < 0;
            },
            IsBodyContactInvalid: function (contact) {
                return contact.index < 0;
            },
            IsPairInvalid: function (pair) {
                return pair.indexA < 0 || pair.indexB < 0;
            },
            IsTriadInvalid: function (triad) {
                return triad.indexA < 0 || triad.indexB < 0 || triad.indexC < 0;
            },
        };
        for (var k = 0; k < this.m_proxyBuffer.count; k++) {
            var proxy = this.m_proxyBuffer.data[k];
            proxy.index = newIndices[proxy.index];
        }
        this.m_proxyBuffer.RemoveIf(Test.IsProxyInvalid);
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            contact.indexA = newIndices[contact.indexA];
            contact.indexB = newIndices[contact.indexB];
        }
        this.m_contactBuffer.RemoveIf(Test.IsContactInvalid);
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            contact.index = newIndices[contact.index];
        }
        this.m_bodyContactBuffer.RemoveIf(Test.IsBodyContactInvalid);
        for (var k = 0; k < this.m_pairBuffer.count; k++) {
            var pair = this.m_pairBuffer.data[k];
            pair.indexA = newIndices[pair.indexA];
            pair.indexB = newIndices[pair.indexB];
        }
        this.m_pairBuffer.RemoveIf(Test.IsPairInvalid);
        for (var k = 0; k < this.m_triadBuffer.count; k++) {
            var triad = this.m_triadBuffer.data[k];
            triad.indexA = newIndices[triad.indexA];
            triad.indexB = newIndices[triad.indexB];
            triad.indexC = newIndices[triad.indexC];
        }
        this.m_triadBuffer.RemoveIf(Test.IsTriadInvalid);
        if (this.m_indexByExpirationTimeBuffer.data) {
            var writeOffset = 0;
            for (var readOffset = 0; readOffset < this.m_count; readOffset++) {
                var newIndex = newIndices[this.m_indexByExpirationTimeBuffer.data[readOffset]];
                if (newIndex !== b2_invalidParticleIndex) {
                    this.m_indexByExpirationTimeBuffer.data[writeOffset++] = newIndex;
                }
            }
        }
        for (var group = this.m_groupList; group; group = group.GetNext()) {
            var firstIndex = newCount;
            var lastIndex = 0;
            var modified = false;
            for (var i = group.m_firstIndex; i < group.m_lastIndex; i++) {
                var j = newIndices[i];
                if (j >= 0) {
                    firstIndex = b2Min(firstIndex, j);
                    lastIndex = b2Max(lastIndex, j + 1);
                }
                else {
                    modified = true;
                }
            }
            if (firstIndex < lastIndex) {
                group.m_firstIndex = firstIndex;
                group.m_lastIndex = lastIndex;
                if (modified) {
                    if (group.m_groupFlags & b2ParticleGroupFlag.b2_solidParticleGroup) {
                        this.SetGroupFlags(group, group.m_groupFlags | b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth);
                    }
                }
            }
            else {
                group.m_firstIndex = 0;
                group.m_lastIndex = 0;
                if (!(group.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupCanBeEmpty)) {
                    this.SetGroupFlags(group, group.m_groupFlags | b2ParticleGroupFlag.b2_particleGroupWillBeDestroyed);
                }
            }
        }
        this.m_count = newCount;
        this.m_allParticleFlags = allParticleFlags;
        this.m_needsUpdateAllParticleFlags = false;
        for (var group = this.m_groupList; group;) {
            var next = group.GetNext();
            if (group.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupWillBeDestroyed) {
                this.DestroyParticleGroup(group);
            }
            group = next;
        }
    };
    b2ParticleSystem.prototype.SolveLifetimes = function (step) {
        this.m_timeElapsed = this.LifetimeToExpirationTime(step.dt);
        var quantizedTimeElapsed = this.GetQuantizedTimeElapsed();
        var expirationTimes = this.m_expirationTimeBuffer.data;
        var expirationTimeIndices = this.m_indexByExpirationTimeBuffer.data;
        var particleCount = this.GetParticleCount();
        if (this.m_expirationTimeBufferRequiresSorting) {
            var ExpirationTimeComparator = function (particleIndexA, particleIndexB) {
                var expirationTimeA = expirationTimes[particleIndexA];
                var expirationTimeB = expirationTimes[particleIndexB];
                var infiniteExpirationTimeA = expirationTimeA <= 0.0;
                var infiniteExpirationTimeB = expirationTimeB <= 0.0;
                return infiniteExpirationTimeA === infiniteExpirationTimeB ?
                    expirationTimeA > expirationTimeB : infiniteExpirationTimeA;
            };
            std_sort(expirationTimeIndices, 0, particleCount, ExpirationTimeComparator);
            this.m_expirationTimeBufferRequiresSorting = false;
        }
        for (var i = particleCount - 1; i >= 0; --i) {
            var particleIndex = expirationTimeIndices[i];
            var expirationTime = expirationTimes[particleIndex];
            if (quantizedTimeElapsed < expirationTime || expirationTime <= 0) {
                break;
            }
            this.DestroyParticle(particleIndex);
        }
    };
    b2ParticleSystem.prototype.RotateBuffer = function (start, mid, end) {
        if (start === mid || mid === end) {
            return;
        }
        function newIndices(i) {
            if (i < start) {
                return i;
            }
            else if (i < mid) {
                return i + end - mid;
            }
            else if (i < end) {
                return i + start - mid;
            }
            else {
                return i;
            }
        }
        std_rotate(this.m_flagsBuffer.data, start, mid, end);
        if (this.m_lastBodyContactStepBuffer.data) {
            std_rotate(this.m_lastBodyContactStepBuffer.data, start, mid, end);
        }
        if (this.m_bodyContactCountBuffer.data) {
            std_rotate(this.m_bodyContactCountBuffer.data, start, mid, end);
        }
        if (this.m_consecutiveContactStepsBuffer.data) {
            std_rotate(this.m_consecutiveContactStepsBuffer.data, start, mid, end);
        }
        std_rotate(this.m_positionBuffer.data, start, mid, end);
        std_rotate(this.m_velocityBuffer.data, start, mid, end);
        std_rotate(this.m_groupBuffer, start, mid, end);
        if (this.m_hasForce) {
            std_rotate(this.m_forceBuffer, start, mid, end);
        }
        if (this.m_staticPressureBuffer) {
            std_rotate(this.m_staticPressureBuffer, start, mid, end);
        }
        if (this.m_depthBuffer) {
            std_rotate(this.m_depthBuffer, start, mid, end);
        }
        if (this.m_colorBuffer.data) {
            std_rotate(this.m_colorBuffer.data, start, mid, end);
        }
        if (this.m_userDataBuffer.data) {
            std_rotate(this.m_userDataBuffer.data, start, mid, end);
        }
        if (this.m_handleIndexBuffer.data) {
            std_rotate(this.m_handleIndexBuffer.data, start, mid, end);
            for (var i = start; i < end; ++i) {
                var handle = this.m_handleIndexBuffer.data[i];
                if (handle) {
                    handle.SetIndex(newIndices(handle.GetIndex()));
                }
            }
        }
        if (this.m_expirationTimeBuffer.data) {
            std_rotate(this.m_expirationTimeBuffer.data, start, mid, end);
            var particleCount = this.GetParticleCount();
            var indexByExpirationTime = this.m_indexByExpirationTimeBuffer.data;
            for (var i = 0; i < particleCount; ++i) {
                indexByExpirationTime[i] = newIndices(indexByExpirationTime[i]);
            }
        }
        for (var k = 0; k < this.m_proxyBuffer.count; k++) {
            var proxy = this.m_proxyBuffer.data[k];
            proxy.index = newIndices(proxy.index);
        }
        for (var k = 0; k < this.m_contactBuffer.count; k++) {
            var contact = this.m_contactBuffer.data[k];
            contact.indexA = newIndices(contact.indexA);
            contact.indexB = newIndices(contact.indexB);
        }
        for (var k = 0; k < this.m_bodyContactBuffer.count; k++) {
            var contact = this.m_bodyContactBuffer.data[k];
            contact.index = newIndices(contact.index);
        }
        for (var k = 0; k < this.m_pairBuffer.count; k++) {
            var pair = this.m_pairBuffer.data[k];
            pair.indexA = newIndices(pair.indexA);
            pair.indexB = newIndices(pair.indexB);
        }
        for (var k = 0; k < this.m_triadBuffer.count; k++) {
            var triad = this.m_triadBuffer.data[k];
            triad.indexA = newIndices(triad.indexA);
            triad.indexB = newIndices(triad.indexB);
            triad.indexC = newIndices(triad.indexC);
        }
        for (var group = this.m_groupList; group; group = group.GetNext()) {
            group.m_firstIndex = newIndices(group.m_firstIndex);
            group.m_lastIndex = newIndices(group.m_lastIndex - 1) + 1;
        }
    };
    b2ParticleSystem.prototype.GetCriticalVelocity = function (step) {
        return this.m_particleDiameter * step.inv_dt;
    };
    b2ParticleSystem.prototype.GetCriticalVelocitySquared = function (step) {
        var velocity = this.GetCriticalVelocity(step);
        return velocity * velocity;
    };
    b2ParticleSystem.prototype.GetCriticalPressure = function (step) {
        return this.m_def.density * this.GetCriticalVelocitySquared(step);
    };
    b2ParticleSystem.prototype.GetParticleStride = function () {
        return b2_particleStride * this.m_particleDiameter;
    };
    b2ParticleSystem.prototype.GetParticleMass = function () {
        var stride = this.GetParticleStride();
        return this.m_def.density * stride * stride;
    };
    b2ParticleSystem.prototype.GetParticleInvMass = function () {
        var inverseStride = this.m_inverseDiameter * (1.0 / b2_particleStride);
        return this.m_inverseDensity * inverseStride * inverseStride;
    };
    b2ParticleSystem.prototype.GetFixtureContactFilter = function () {
        return (this.m_allParticleFlags & b2ParticleFlag.b2_fixtureContactFilterParticle) ?
            this.m_world.m_contactManager.m_contactFilter : null;
    };
    b2ParticleSystem.prototype.GetParticleContactFilter = function () {
        return (this.m_allParticleFlags & b2ParticleFlag.b2_particleContactFilterParticle) ?
            this.m_world.m_contactManager.m_contactFilter : null;
    };
    b2ParticleSystem.prototype.GetFixtureContactListener = function () {
        return (this.m_allParticleFlags & b2ParticleFlag.b2_fixtureContactListenerParticle) ?
            this.m_world.m_contactManager.m_contactListener : null;
    };
    b2ParticleSystem.prototype.GetParticleContactListener = function () {
        return (this.m_allParticleFlags & b2ParticleFlag.b2_particleContactListenerParticle) ?
            this.m_world.m_contactManager.m_contactListener : null;
    };
    b2ParticleSystem.prototype.SetUserOverridableBuffer = function (buffer, data) {
        buffer.data = data;
        buffer.userSuppliedCapacity = data.length;
    };
    b2ParticleSystem.prototype.SetGroupFlags = function (group, newFlags) {
        var oldFlags = group.m_groupFlags;
        if ((oldFlags ^ newFlags) & b2ParticleGroupFlag.b2_solidParticleGroup) {
            newFlags |= b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth;
        }
        if (oldFlags & ~newFlags) {
            this.m_needsUpdateAllGroupFlags = true;
        }
        if (~this.m_allGroupFlags & newFlags) {
            if (newFlags & b2ParticleGroupFlag.b2_solidParticleGroup) {
                this.m_depthBuffer = this.RequestBuffer(this.m_depthBuffer);
            }
            this.m_allGroupFlags |= newFlags;
        }
        group.m_groupFlags = newFlags;
    };
    b2ParticleSystem.BodyContactCompare = function (lhs, rhs) {
        if (lhs.index === rhs.index) {
            return lhs.weight > rhs.weight;
        }
        return lhs.index < rhs.index;
    };
    b2ParticleSystem.prototype.RemoveSpuriousBodyContacts = function () {
        std_sort(this.m_bodyContactBuffer.data, 0, this.m_bodyContactBuffer.count, b2ParticleSystem.BodyContactCompare);
        var s_n = b2ParticleSystem.RemoveSpuriousBodyContacts_s_n;
        var s_pos = b2ParticleSystem.RemoveSpuriousBodyContacts_s_pos;
        var s_normal = b2ParticleSystem.RemoveSpuriousBodyContacts_s_normal;
        var k_maxContactsPerPoint = 3;
        var system = this;
        var lastIndex = -1;
        var currentContacts = 0;
        var b2ParticleBodyContactRemovePredicate = function (contact) {
            if (contact.index !== lastIndex) {
                currentContacts = 0;
                lastIndex = contact.index;
            }
            if (currentContacts++ > k_maxContactsPerPoint) {
                return true;
            }
            var n = s_n.Copy(contact.normal);
            n.SelfMul(system.m_particleDiameter * (1 - contact.weight));
            var pos = b2Vec2.AddVV(system.m_positionBuffer.data[contact.index], n, s_pos);
            if (!contact.fixture.TestPoint(pos)) {
                var childCount = contact.fixture.GetShape().GetChildCount();
                for (var childIndex = 0; childIndex < childCount; childIndex++) {
                    var normal = s_normal;
                    var distance = contact.fixture.ComputeDistance(pos, normal, childIndex);
                    if (distance < b2_linearSlop) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        this.m_bodyContactBuffer.count = std_remove_if(this.m_bodyContactBuffer.data, b2ParticleBodyContactRemovePredicate, this.m_bodyContactBuffer.count);
    };
    b2ParticleSystem.prototype.DetectStuckParticle = function (particle) {
        if (this.m_stuckThreshold <= 0) {
            return;
        }
        ++this.m_bodyContactCountBuffer.data[particle];
        if (this.m_bodyContactCountBuffer.data[particle] === 2) {
            ++this.m_consecutiveContactStepsBuffer.data[particle];
            if (this.m_consecutiveContactStepsBuffer.data[particle] > this.m_stuckThreshold) {
                this.m_stuckParticleBuffer.data[this.m_stuckParticleBuffer.Append()] = particle;
            }
        }
        this.m_lastBodyContactStepBuffer.data[particle] = this.m_timestamp;
    };
    b2ParticleSystem.prototype.ValidateParticleIndex = function (index) {
        return index >= 0 && index < this.GetParticleCount() &&
            index !== b2_invalidParticleIndex;
    };
    b2ParticleSystem.prototype.GetQuantizedTimeElapsed = function () {
        return Math.floor(this.m_timeElapsed / 0x100000000);
    };
    b2ParticleSystem.prototype.LifetimeToExpirationTime = function (lifetime) {
        return this.m_timeElapsed + Math.floor(((lifetime / this.m_def.lifetimeGranularity) * 0x100000000));
    };
    b2ParticleSystem.prototype.ForceCanBeApplied = function (flags) {
        return !(flags & b2ParticleFlag.b2_wallParticle);
    };
    b2ParticleSystem.prototype.PrepareForceBuffer = function () {
        if (!this.m_hasForce) {
            for (var i = 0; i < this.m_count; i++) {
                this.m_forceBuffer[i].SetZero();
            }
            this.m_hasForce = true;
        }
    };
    b2ParticleSystem.prototype.IsRigidGroup = function (group) {
        return (group !== null) && ((group.m_groupFlags & b2ParticleGroupFlag.b2_rigidParticleGroup) !== 0);
    };
    b2ParticleSystem.prototype.GetLinearVelocity = function (group, particleIndex, point, out) {
        if (group && this.IsRigidGroup(group)) {
            return group.GetLinearVelocityFromWorldPoint(point, out);
        }
        else {
            return out.Copy(this.m_velocityBuffer.data[particleIndex]);
        }
    };
    b2ParticleSystem.prototype.InitDampingParameter = function (invMass, invInertia, tangentDistance, mass, inertia, center, point, normal) {
        invMass[0] = mass > 0 ? 1 / mass : 0;
        invInertia[0] = inertia > 0 ? 1 / inertia : 0;
        tangentDistance[0] = b2Vec2.CrossVV(b2Vec2.SubVV(point, center, b2Vec2.s_t0), normal);
    };
    b2ParticleSystem.prototype.InitDampingParameterWithRigidGroupOrParticle = function (invMass, invInertia, tangentDistance, isRigidGroup, group, particleIndex, point, normal) {
        if (group && isRigidGroup) {
            this.InitDampingParameter(invMass, invInertia, tangentDistance, group.GetMass(), group.GetInertia(), group.GetCenter(), point, normal);
        }
        else {
            var flags = this.m_flagsBuffer.data[particleIndex];
            this.InitDampingParameter(invMass, invInertia, tangentDistance, flags & b2ParticleFlag.b2_wallParticle ? 0 : this.GetParticleMass(), 0, point, point, normal);
        }
    };
    b2ParticleSystem.prototype.ComputeDampingImpulse = function (invMassA, invInertiaA, tangentDistanceA, invMassB, invInertiaB, tangentDistanceB, normalVelocity) {
        var invMass = invMassA + invInertiaA * tangentDistanceA * tangentDistanceA +
            invMassB + invInertiaB * tangentDistanceB * tangentDistanceB;
        return invMass > 0 ? normalVelocity / invMass : 0;
    };
    b2ParticleSystem.prototype.ApplyDamping = function (invMass, invInertia, tangentDistance, isRigidGroup, group, particleIndex, impulse, normal) {
        if (group && isRigidGroup) {
            group.m_linearVelocity.SelfMulAdd(impulse * invMass, normal);
            group.m_angularVelocity += impulse * tangentDistance * invInertia;
        }
        else {
            this.m_velocityBuffer.data[particleIndex].SelfMulAdd(impulse * invMass, normal);
        }
    };
    b2ParticleSystem.xTruncBits = 12;
    b2ParticleSystem.yTruncBits = 12;
    b2ParticleSystem.tagBits = 8 * 4;
    b2ParticleSystem.yOffset = 1 << (b2ParticleSystem.yTruncBits - 1);
    b2ParticleSystem.yShift = b2ParticleSystem.tagBits - b2ParticleSystem.yTruncBits;
    b2ParticleSystem.xShift = b2ParticleSystem.tagBits - b2ParticleSystem.yTruncBits - b2ParticleSystem.xTruncBits;
    b2ParticleSystem.xScale = 1 << b2ParticleSystem.xShift;
    b2ParticleSystem.xOffset = b2ParticleSystem.xScale * (1 << (b2ParticleSystem.xTruncBits - 1));
    b2ParticleSystem.yMask = ((1 << b2ParticleSystem.yTruncBits) - 1) << b2ParticleSystem.yShift;
    b2ParticleSystem.xMask = ~b2ParticleSystem.yMask;
    b2ParticleSystem.DestroyParticlesInShape_s_aabb = new b2AABB();
    b2ParticleSystem.CreateParticleGroup_s_transform = new b2Transform();
    b2ParticleSystem.ComputeCollisionEnergy_s_v = new b2Vec2();
    b2ParticleSystem.QueryShapeAABB_s_aabb = new b2AABB();
    b2ParticleSystem.QueryPointAABB_s_aabb = new b2AABB();
    b2ParticleSystem.RayCast_s_aabb = new b2AABB();
    b2ParticleSystem.RayCast_s_p = new b2Vec2();
    b2ParticleSystem.RayCast_s_v = new b2Vec2();
    b2ParticleSystem.RayCast_s_n = new b2Vec2();
    b2ParticleSystem.RayCast_s_point = new b2Vec2();
    b2ParticleSystem.k_pairFlags = b2ParticleFlag.b2_springParticle;
    b2ParticleSystem.k_triadFlags = b2ParticleFlag.b2_elasticParticle;
    b2ParticleSystem.k_noPressureFlags = b2ParticleFlag.b2_powderParticle | b2ParticleFlag.b2_tensileParticle;
    b2ParticleSystem.k_extraDampingFlags = b2ParticleFlag.b2_staticPressureParticle;
    b2ParticleSystem.k_barrierWallFlags = b2ParticleFlag.b2_barrierParticle | b2ParticleFlag.b2_wallParticle;
    b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_edge = new b2EdgeShape();
    b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_d = new b2Vec2();
    b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_p = new b2Vec2();
    b2ParticleSystem.CreateParticlesFillShapeForGroup_s_aabb = new b2AABB();
    b2ParticleSystem.CreateParticlesFillShapeForGroup_s_p = new b2Vec2();
    b2ParticleSystem.UpdatePairsAndTriads_s_dab = new b2Vec2();
    b2ParticleSystem.UpdatePairsAndTriads_s_dbc = new b2Vec2();
    b2ParticleSystem.UpdatePairsAndTriads_s_dca = new b2Vec2();
    b2ParticleSystem.AddContact_s_d = new b2Vec2();
    b2ParticleSystem.UpdateBodyContacts_s_aabb = new b2AABB();
    b2ParticleSystem.Solve_s_subStep = new b2TimeStep();
    b2ParticleSystem.SolveCollision_s_aabb = new b2AABB();
    b2ParticleSystem.SolveGravity_s_gravity = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_aabb = new b2AABB();
    b2ParticleSystem.SolveBarrier_s_va = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_vb = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_pba = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_vba = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_vc = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_pca = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_vca = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_qba = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_qca = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_dv = new b2Vec2();
    b2ParticleSystem.SolveBarrier_s_f = new b2Vec2();
    b2ParticleSystem.SolvePressure_s_f = new b2Vec2();
    b2ParticleSystem.SolveDamping_s_v = new b2Vec2();
    b2ParticleSystem.SolveDamping_s_f = new b2Vec2();
    b2ParticleSystem.SolveRigidDamping_s_t0 = new b2Vec2();
    b2ParticleSystem.SolveRigidDamping_s_t1 = new b2Vec2();
    b2ParticleSystem.SolveRigidDamping_s_p = new b2Vec2();
    b2ParticleSystem.SolveRigidDamping_s_v = new b2Vec2();
    b2ParticleSystem.SolveExtraDamping_s_v = new b2Vec2();
    b2ParticleSystem.SolveExtraDamping_s_f = new b2Vec2();
    b2ParticleSystem.SolveRigid_s_position = new b2Vec2();
    b2ParticleSystem.SolveRigid_s_rotation = new b2Rot();
    b2ParticleSystem.SolveRigid_s_transform = new b2Transform();
    b2ParticleSystem.SolveRigid_s_velocityTransform = new b2Transform();
    b2ParticleSystem.SolveElastic_s_pa = new b2Vec2();
    b2ParticleSystem.SolveElastic_s_pb = new b2Vec2();
    b2ParticleSystem.SolveElastic_s_pc = new b2Vec2();
    b2ParticleSystem.SolveElastic_s_r = new b2Rot();
    b2ParticleSystem.SolveElastic_s_t0 = new b2Vec2();
    b2ParticleSystem.SolveSpring_s_pa = new b2Vec2();
    b2ParticleSystem.SolveSpring_s_pb = new b2Vec2();
    b2ParticleSystem.SolveSpring_s_d = new b2Vec2();
    b2ParticleSystem.SolveSpring_s_f = new b2Vec2();
    b2ParticleSystem.SolveTensile_s_weightedNormal = new b2Vec2();
    b2ParticleSystem.SolveTensile_s_s = new b2Vec2();
    b2ParticleSystem.SolveTensile_s_f = new b2Vec2();
    b2ParticleSystem.SolveViscous_s_v = new b2Vec2();
    b2ParticleSystem.SolveViscous_s_f = new b2Vec2();
    b2ParticleSystem.SolveRepulsive_s_f = new b2Vec2();
    b2ParticleSystem.SolvePowder_s_f = new b2Vec2();
    b2ParticleSystem.SolveSolid_s_f = new b2Vec2();
    b2ParticleSystem.RemoveSpuriousBodyContacts_s_n = new b2Vec2();
    b2ParticleSystem.RemoveSpuriousBodyContacts_s_pos = new b2Vec2();
    b2ParticleSystem.RemoveSpuriousBodyContacts_s_normal = new b2Vec2();
    return b2ParticleSystem;
}());
var b2ParticleSystem_UserOverridableBuffer = (function () {
    function b2ParticleSystem_UserOverridableBuffer() {
        this._data = null;
        this.userSuppliedCapacity = 0;
    }
    Object.defineProperty(b2ParticleSystem_UserOverridableBuffer.prototype, "data", {
        get: function () { return this._data; },
        set: function (value) { this._data = value; },
        enumerable: true,
        configurable: true
    });
    return b2ParticleSystem_UserOverridableBuffer;
}());
var b2ParticleSystem_Proxy = (function () {
    function b2ParticleSystem_Proxy() {
        this.index = b2_invalidParticleIndex;
        this.tag = 0;
    }
    b2ParticleSystem_Proxy.CompareProxyProxy = function (a, b) {
        return a.tag < b.tag;
    };
    b2ParticleSystem_Proxy.CompareTagProxy = function (a, b) {
        return a < b.tag;
    };
    b2ParticleSystem_Proxy.CompareProxyTag = function (a, b) {
        return a.tag < b;
    };
    return b2ParticleSystem_Proxy;
}());
var b2ParticleSystem_InsideBoundsEnumerator = (function () {
    function b2ParticleSystem_InsideBoundsEnumerator(system, lower, upper, first, last) {
        this.m_system = system;
        this.m_xLower = (lower & b2ParticleSystem.xMask) >>> 0;
        this.m_xUpper = (upper & b2ParticleSystem.xMask) >>> 0;
        this.m_yLower = (lower & b2ParticleSystem.yMask) >>> 0;
        this.m_yUpper = (upper & b2ParticleSystem.yMask) >>> 0;
        this.m_first = first;
        this.m_last = last;
    }
    b2ParticleSystem_InsideBoundsEnumerator.prototype.GetNext = function () {
        while (this.m_first < this.m_last) {
            var xTag = (this.m_system.m_proxyBuffer.data[this.m_first].tag & b2ParticleSystem.xMask) >>> 0;
            if (xTag >= this.m_xLower && xTag <= this.m_xUpper) {
                return (this.m_system.m_proxyBuffer.data[this.m_first++]).index;
            }
            this.m_first++;
        }
        return b2_invalidParticleIndex;
    };
    return b2ParticleSystem_InsideBoundsEnumerator;
}());
var b2ParticleSystem_ParticleListNode = (function () {
    function b2ParticleSystem_ParticleListNode() {
        this.next = null;
        this.count = 0;
        this.index = 0;
    }
    return b2ParticleSystem_ParticleListNode;
}());
var b2ParticleSystem_FixedSetAllocator = (function () {
    function b2ParticleSystem_FixedSetAllocator() {
    }
    b2ParticleSystem_FixedSetAllocator.prototype.Allocate = function (itemSize, count) {
        return count;
    };
    b2ParticleSystem_FixedSetAllocator.prototype.Clear = function () {
    };
    b2ParticleSystem_FixedSetAllocator.prototype.GetCount = function () {
        return 0;
    };
    b2ParticleSystem_FixedSetAllocator.prototype.Invalidate = function (itemIndex) {
    };
    b2ParticleSystem_FixedSetAllocator.prototype.GetValidBuffer = function () {
        return [];
    };
    b2ParticleSystem_FixedSetAllocator.prototype.GetBuffer = function () {
        return [];
    };
    b2ParticleSystem_FixedSetAllocator.prototype.SetCount = function (count) {
    };
    return b2ParticleSystem_FixedSetAllocator;
}());
var b2ParticleSystem_FixtureParticle = (function () {
    function b2ParticleSystem_FixtureParticle(fixture, particle) {
        this.second = b2_invalidParticleIndex;
        this.first = fixture;
        this.second = particle;
    }
    return b2ParticleSystem_FixtureParticle;
}());
var b2ParticleSystem_FixtureParticleSet = (function (_super) {
    __extends(b2ParticleSystem_FixtureParticleSet, _super);
    function b2ParticleSystem_FixtureParticleSet() {
        _super.apply(this, arguments);
    }
    b2ParticleSystem_FixtureParticleSet.prototype.Initialize = function (bodyContactBuffer, flagsBuffer) {
    };
    b2ParticleSystem_FixtureParticleSet.prototype.Find = function (pair) {
        return b2_invalidParticleIndex;
    };
    return b2ParticleSystem_FixtureParticleSet;
}(b2ParticleSystem_FixedSetAllocator));
var b2ParticleSystem_ParticlePair = (function () {
    function b2ParticleSystem_ParticlePair(particleA, particleB) {
        this.first = b2_invalidParticleIndex;
        this.second = b2_invalidParticleIndex;
        this.first = particleA;
        this.second = particleB;
    }
    return b2ParticleSystem_ParticlePair;
}());
var b2ParticlePairSet = (function (_super) {
    __extends(b2ParticlePairSet, _super);
    function b2ParticlePairSet() {
        _super.apply(this, arguments);
    }
    b2ParticlePairSet.prototype.Initialize = function (contactBuffer, flagsBuffer) {
    };
    b2ParticlePairSet.prototype.Find = function (pair) {
        return b2_invalidParticleIndex;
    };
    return b2ParticlePairSet;
}(b2ParticleSystem_FixedSetAllocator));
var b2ParticleSystem_ConnectionFilter = (function () {
    function b2ParticleSystem_ConnectionFilter() {
    }
    b2ParticleSystem_ConnectionFilter.prototype.IsNecessary = function (index) {
        return true;
    };
    b2ParticleSystem_ConnectionFilter.prototype.ShouldCreatePair = function (a, b) {
        return true;
    };
    b2ParticleSystem_ConnectionFilter.prototype.ShouldCreateTriad = function (a, b, c) {
        return true;
    };
    return b2ParticleSystem_ConnectionFilter;
}());
var b2ParticleSystem_DestroyParticlesInShapeCallback = (function (_super) {
    __extends(b2ParticleSystem_DestroyParticlesInShapeCallback, _super);
    function b2ParticleSystem_DestroyParticlesInShapeCallback(system, shape, xf, callDestructionListener) {
        _super.call(this);
        this.m_callDestructionListener = false;
        this.m_destroyed = 0;
        this.m_system = system;
        this.m_shape = shape;
        this.m_xf = xf;
        this.m_callDestructionListener = callDestructionListener;
        this.m_destroyed = 0;
    }
    b2ParticleSystem_DestroyParticlesInShapeCallback.prototype.ReportFixture = function (fixture) {
        return false;
    };
    b2ParticleSystem_DestroyParticlesInShapeCallback.prototype.ReportParticle = function (particleSystem, index) {
        if (particleSystem !== this.m_system) {
            return false;
        }
        if (this.m_shape.TestPoint(this.m_xf, this.m_system.m_positionBuffer.data[index])) {
            this.m_system.DestroyParticle(index, this.m_callDestructionListener);
            this.m_destroyed++;
        }
        return true;
    };
    b2ParticleSystem_DestroyParticlesInShapeCallback.prototype.Destroyed = function () {
        return this.m_destroyed;
    };
    return b2ParticleSystem_DestroyParticlesInShapeCallback;
}(b2QueryCallback));
var b2ParticleSystem_JoinParticleGroupsFilter = (function (_super) {
    __extends(b2ParticleSystem_JoinParticleGroupsFilter, _super);
    function b2ParticleSystem_JoinParticleGroupsFilter(threshold) {
        _super.call(this);
        this.m_threshold = 0;
        this.m_threshold = threshold;
    }
    b2ParticleSystem_JoinParticleGroupsFilter.prototype.ShouldCreatePair = function (a, b) {
        return (a < this.m_threshold && this.m_threshold <= b) ||
            (b < this.m_threshold && this.m_threshold <= a);
    };
    b2ParticleSystem_JoinParticleGroupsFilter.prototype.ShouldCreateTriad = function (a, b, c) {
        return (a < this.m_threshold || b < this.m_threshold || c < this.m_threshold) &&
            (this.m_threshold <= a || this.m_threshold <= b || this.m_threshold <= c);
    };
    return b2ParticleSystem_JoinParticleGroupsFilter;
}(b2ParticleSystem_ConnectionFilter));
var b2ParticleSystem_CompositeShape = (function (_super) {
    __extends(b2ParticleSystem_CompositeShape, _super);
    function b2ParticleSystem_CompositeShape(shapes, shapeCount) {
        if (shapeCount === void 0) { shapeCount = shapes.length; }
        _super.call(this, b2ShapeType.e_unknown, 0);
        this.m_shapeCount = 0;
        this.m_shapes = shapes;
        this.m_shapeCount = shapeCount;
    }
    b2ParticleSystem_CompositeShape.prototype.Clone = function () {
        throw new Error();
    };
    b2ParticleSystem_CompositeShape.prototype.GetChildCount = function () {
        return 1;
    };
    b2ParticleSystem_CompositeShape.prototype.TestPoint = function (xf, p) {
        for (var i = 0; i < this.m_shapeCount; i++) {
            if (this.m_shapes[i].TestPoint(xf, p)) {
                return true;
            }
        }
        return false;
    };
    b2ParticleSystem_CompositeShape.prototype.ComputeDistance = function (xf, p, normal, childIndex) {
        return 0;
    };
    b2ParticleSystem_CompositeShape.prototype.RayCast = function (output, input, xf, childIndex) {
        return false;
    };
    b2ParticleSystem_CompositeShape.prototype.ComputeAABB = function (aabb, xf, childIndex) {
        var s_subaabb = new b2AABB();
        aabb.lowerBound.x = +b2_maxFloat;
        aabb.lowerBound.y = +b2_maxFloat;
        aabb.upperBound.x = -b2_maxFloat;
        aabb.upperBound.y = -b2_maxFloat;
        for (var i = 0; i < this.m_shapeCount; i++) {
            var childCount = this.m_shapes[i].GetChildCount();
            for (var j = 0; j < childCount; j++) {
                var subaabb = s_subaabb;
                this.m_shapes[i].ComputeAABB(subaabb, xf, j);
                aabb.Combine1(subaabb);
            }
        }
    };
    b2ParticleSystem_CompositeShape.prototype.ComputeMass = function (massData, density) {
    };
    b2ParticleSystem_CompositeShape.prototype.SetupDistanceProxy = function (proxy, index) {
    };
    b2ParticleSystem_CompositeShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
        return 0;
    };
    b2ParticleSystem_CompositeShape.prototype.Dump = function (log) {
    };
    return b2ParticleSystem_CompositeShape;
}(b2Shape));
var b2ParticleSystem_ReactiveFilter = (function (_super) {
    __extends(b2ParticleSystem_ReactiveFilter, _super);
    function b2ParticleSystem_ReactiveFilter(flagsBuffer) {
        _super.call(this);
        this.m_flagsBuffer = flagsBuffer;
    }
    b2ParticleSystem_ReactiveFilter.prototype.IsNecessary = function (index) {
        return (this.m_flagsBuffer.data[index] & b2ParticleFlag.b2_reactiveParticle) !== 0;
    };
    return b2ParticleSystem_ReactiveFilter;
}(b2ParticleSystem_ConnectionFilter));
var b2ParticleSystem_UpdateBodyContactsCallback = (function (_super) {
    __extends(b2ParticleSystem_UpdateBodyContactsCallback, _super);
    function b2ParticleSystem_UpdateBodyContactsCallback(system, contactFilter) {
        if (contactFilter === void 0) { contactFilter = null; }
        _super.call(this, system);
        this.m_contactFilter = null;
        this.m_contactFilter = contactFilter;
    }
    b2ParticleSystem_UpdateBodyContactsCallback.prototype.ShouldCollideFixtureParticle = function (fixture, particleSystem, particleIndex) {
        if (this.m_contactFilter) {
            var flags = this.m_system.GetFlagsBuffer();
            if (flags[particleIndex] & b2ParticleFlag.b2_fixtureContactFilterParticle) {
                return this.m_contactFilter.ShouldCollideFixtureParticle(fixture, this.m_system, particleIndex);
            }
        }
        return true;
    };
    b2ParticleSystem_UpdateBodyContactsCallback.prototype.ReportFixtureAndParticle = function (fixture, childIndex, a) {
        var s_n = b2ParticleSystem_UpdateBodyContactsCallback.ReportFixtureAndParticle_s_n;
        var s_rp = b2ParticleSystem_UpdateBodyContactsCallback.ReportFixtureAndParticle_s_rp;
        var ap = this.m_system.m_positionBuffer.data[a];
        var n = s_n;
        var d = fixture.ComputeDistance(ap, n, childIndex);
        if (d < this.m_system.m_particleDiameter && this.ShouldCollideFixtureParticle(fixture, this.m_system, a)) {
            var b = fixture.GetBody();
            var bp = b.GetWorldCenter();
            var bm = b.GetMass();
            var bI = b.GetInertia() - bm * b.GetLocalCenter().LengthSquared();
            var invBm = bm > 0 ? 1 / bm : 0;
            var invBI = bI > 0 ? 1 / bI : 0;
            var invAm = this.m_system.m_flagsBuffer.data[a] &
                b2ParticleFlag.b2_wallParticle ? 0 : this.m_system.GetParticleInvMass();
            var rp = b2Vec2.SubVV(ap, bp, s_rp);
            var rpn = b2Vec2.CrossVV(rp, n);
            var invM = invAm + invBm + invBI * rpn * rpn;
            var contact = this.m_system.m_bodyContactBuffer.data[this.m_system.m_bodyContactBuffer.Append()];
            contact.index = a;
            contact.body = b;
            contact.fixture = fixture;
            contact.weight = 1 - d * this.m_system.m_inverseDiameter;
            contact.normal.Copy(n.SelfNeg());
            contact.mass = invM > 0 ? 1 / invM : 0;
            this.m_system.DetectStuckParticle(a);
        }
    };
    b2ParticleSystem_UpdateBodyContactsCallback.ReportFixtureAndParticle_s_n = new b2Vec2();
    b2ParticleSystem_UpdateBodyContactsCallback.ReportFixtureAndParticle_s_rp = new b2Vec2();
    return b2ParticleSystem_UpdateBodyContactsCallback;
}(b2FixtureParticleQueryCallback));
var b2ParticleSystem_SolveCollisionCallback = (function (_super) {
    __extends(b2ParticleSystem_SolveCollisionCallback, _super);
    function b2ParticleSystem_SolveCollisionCallback(system, step) {
        _super.call(this, system);
        this.m_step = step;
    }
    b2ParticleSystem_SolveCollisionCallback.prototype.ReportFixtureAndParticle = function (fixture, childIndex, a) {
        var s_p1 = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_p1;
        var s_output = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_output;
        var s_input = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_input;
        var s_p = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_p;
        var s_v = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_v;
        var s_f = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_f;
        var body = fixture.GetBody();
        var ap = this.m_system.m_positionBuffer.data[a];
        var av = this.m_system.m_velocityBuffer.data[a];
        var output = s_output;
        var input = s_input;
        if (this.m_system.m_iterationIndex === 0) {
            var p1 = b2Transform.MulTXV(body.m_xf0, ap, s_p1);
            if (fixture.GetShape().GetType() === b2ShapeType.e_circleShape) {
                p1.SelfSub(body.GetLocalCenter());
                b2Rot.MulRV(body.m_xf0.q, p1, p1);
                b2Rot.MulTRV(body.m_xf.q, p1, p1);
                p1.SelfAdd(body.GetLocalCenter());
            }
            b2Transform.MulXV(body.m_xf, p1, input.p1);
        }
        else {
            input.p1.Copy(ap);
        }
        b2Vec2.AddVMulSV(ap, this.m_step.dt, av, input.p2);
        input.maxFraction = 1;
        if (fixture.RayCast(output, input, childIndex)) {
            var n = output.normal;
            var p = s_p;
            p.x = (1 - output.fraction) * input.p1.x + output.fraction * input.p2.x + b2_linearSlop * n.x;
            p.y = (1 - output.fraction) * input.p1.y + output.fraction * input.p2.y + b2_linearSlop * n.y;
            var v = s_v;
            v.x = this.m_step.inv_dt * (p.x - ap.x);
            v.y = this.m_step.inv_dt * (p.y - ap.y);
            this.m_system.m_velocityBuffer.data[a].Copy(v);
            var f = s_f;
            f.x = this.m_step.inv_dt * this.m_system.GetParticleMass() * (av.x - v.x);
            f.y = this.m_step.inv_dt * this.m_system.GetParticleMass() * (av.y - v.y);
            this.m_system.ParticleApplyForce(a, f);
        }
    };
    b2ParticleSystem_SolveCollisionCallback.prototype.ReportParticle = function (system, index) {
        return false;
    };
    b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_p1 = new b2Vec2();
    b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_output = new b2RayCastOutput();
    b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_input = new b2RayCastInput();
    b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_p = new b2Vec2();
    b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_v = new b2Vec2();
    b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_f = new b2Vec2();
    return b2ParticleSystem_SolveCollisionCallback;
}(b2FixtureParticleQueryCallback));
//# sourceMappingURL=b2_particle_system.js.map