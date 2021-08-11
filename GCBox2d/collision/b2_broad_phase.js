var b2Pair = (function () {
    function b2Pair(proxyA, proxyB) {
        this.proxyA = proxyA;
        this.proxyB = proxyB;
    }
    return b2Pair;
}());
var b2BroadPhase = (function () {
    function b2BroadPhase() {
        this.m_tree = new b2DynamicTree();
        this.m_proxyCount = 0;
        this.m_moveCount = 0;
        this.m_moveBuffer = [];
        this.m_pairCount = 0;
        this.m_pairBuffer = [];
    }
    b2BroadPhase.prototype.CreateProxy = function (aabb, userData) {
        var proxy = this.m_tree.CreateProxy(aabb, userData);
        ++this.m_proxyCount;
        this.BufferMove(proxy);
        return proxy;
    };
    b2BroadPhase.prototype.DestroyProxy = function (proxy) {
        this.UnBufferMove(proxy);
        --this.m_proxyCount;
        this.m_tree.DestroyProxy(proxy);
    };
    b2BroadPhase.prototype.MoveProxy = function (proxy, aabb, displacement) {
        var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
        if (buffer) {
            this.BufferMove(proxy);
        }
    };
    b2BroadPhase.prototype.TouchProxy = function (proxy) {
        this.BufferMove(proxy);
    };
    b2BroadPhase.prototype.GetProxyCount = function () {
        return this.m_proxyCount;
    };
    b2BroadPhase.prototype.UpdatePairs = function (callback) {
        var _this = this;
        this.m_pairCount = 0;
        var _loop_1 = function(i) {
            var queryProxy = this_1.m_moveBuffer[i];
            if (queryProxy === null) {
                return "continue";
            }
            var fatAABB = queryProxy.aabb;
            this_1.m_tree.Query(fatAABB, function (proxy) {
                if (proxy.m_id === queryProxy.m_id) {
                    return true;
                }
                var moved = proxy.moved;
                if (moved && proxy.m_id > queryProxy.m_id) {
                    return true;
                }
                var proxyA;
                var proxyB;
                if (proxy.m_id < queryProxy.m_id) {
                    proxyA = proxy;
                    proxyB = queryProxy;
                }
                else {
                    proxyA = queryProxy;
                    proxyB = proxy;
                }
                if (_this.m_pairCount === _this.m_pairBuffer.length) {
                    _this.m_pairBuffer[_this.m_pairCount] = new b2Pair(proxyA, proxyB);
                }
                else {
                    var pair = _this.m_pairBuffer[_this.m_pairCount];
                    pair.proxyA = proxyA;
                    pair.proxyB = proxyB;
                }
                ++_this.m_pairCount;
                return true;
            });
        };
        var this_1 = this;
        for (var i = 0; i < this.m_moveCount; ++i) {
            var state_1 = _loop_1(i);
            if (state_1 === "continue") continue;
        }
        for (var i = 0; i < this.m_pairCount; ++i) {
            var primaryPair = this.m_pairBuffer[i];
            var userDataA = primaryPair.proxyA.userData;
            var userDataB = primaryPair.proxyB.userData;
            callback(userDataA, userDataB);
        }
        for (var i = 0; i < this.m_moveCount; ++i) {
            var proxy = this.m_moveBuffer[i];
            if (proxy === null) {
                continue;
            }
            proxy.moved = false;
        }
        this.m_moveCount = 0;
    };
    b2BroadPhase.prototype.Query = function (aabb, callback) {
        this.m_tree.Query(aabb, callback);
    };
    b2BroadPhase.prototype.QueryPoint = function (point, callback) {
        this.m_tree.QueryPoint(point, callback);
    };
    b2BroadPhase.prototype.RayCast = function (input, callback) {
        this.m_tree.RayCast(input, callback);
    };
    b2BroadPhase.prototype.GetTreeHeight = function () {
        return this.m_tree.GetHeight();
    };
    b2BroadPhase.prototype.GetTreeBalance = function () {
        return this.m_tree.GetMaxBalance();
    };
    b2BroadPhase.prototype.GetTreeQuality = function () {
        return this.m_tree.GetAreaRatio();
    };
    b2BroadPhase.prototype.ShiftOrigin = function (newOrigin) {
        this.m_tree.ShiftOrigin(newOrigin);
    };
    b2BroadPhase.prototype.BufferMove = function (proxy) {
        this.m_moveBuffer[this.m_moveCount] = proxy;
        ++this.m_moveCount;
    };
    b2BroadPhase.prototype.UnBufferMove = function (proxy) {
        var i = this.m_moveBuffer.indexOf(proxy);
        this.m_moveBuffer[i] = null;
    };
    return b2BroadPhase;
}());
//# sourceMappingURL=b2_broad_phase.js.map