var b2ContactManager = (function () {
    function b2ContactManager() {
        this.m_broadPhase = new b2BroadPhase();
        this.m_contactList = null;
        this.m_contactCount = 0;
        this.m_contactFilter = b2ContactFilter.b2_defaultFilter;
        this.m_contactListener = b2ContactListener.b2_defaultListener;
        this.m_contactFactory = new b2ContactFactory();
    }
    b2ContactManager.prototype.AddPair = function (proxyA, proxyB) {
        var fixtureA = proxyA.fixture;
        var fixtureB = proxyB.fixture;
        var indexA = proxyA.childIndex;
        var indexB = proxyB.childIndex;
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        if (bodyA === bodyB) {
            return;
        }
        var edge = bodyB.GetContactList();
        while (edge) {
            if (edge.other === bodyA) {
                var fA = edge.contact.GetFixtureA();
                var fB = edge.contact.GetFixtureB();
                var iA = edge.contact.GetChildIndexA();
                var iB = edge.contact.GetChildIndexB();
                if (fA === fixtureA && fB === fixtureB && iA === indexA && iB === indexB) {
                    return;
                }
                if (fA === fixtureB && fB === fixtureA && iA === indexB && iB === indexA) {
                    return;
                }
            }
            edge = edge.next;
        }
        if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
            return;
        }
        var c = this.m_contactFactory.Create(fixtureA, indexA, fixtureB, indexB);
        if (c === null) {
            return;
        }
        fixtureA = c.GetFixtureA();
        fixtureB = c.GetFixtureB();
        indexA = c.GetChildIndexA();
        indexB = c.GetChildIndexB();
        bodyA = fixtureA.m_body;
        bodyB = fixtureB.m_body;
        c.m_prev = null;
        c.m_next = this.m_contactList;
        if (this.m_contactList !== null) {
            this.m_contactList.m_prev = c;
        }
        this.m_contactList = c;
        c.m_nodeA.other = bodyB;
        c.m_nodeA.prev = null;
        c.m_nodeA.next = bodyA.m_contactList;
        if (bodyA.m_contactList !== null) {
            bodyA.m_contactList.prev = c.m_nodeA;
        }
        bodyA.m_contactList = c.m_nodeA;
        c.m_nodeB.other = bodyA;
        c.m_nodeB.prev = null;
        c.m_nodeB.next = bodyB.m_contactList;
        if (bodyB.m_contactList !== null) {
            bodyB.m_contactList.prev = c.m_nodeB;
        }
        bodyB.m_contactList = c.m_nodeB;
        ++this.m_contactCount;
    };
    b2ContactManager.prototype.FindNewContacts = function () {
        var _this = this;
        this.m_broadPhase.UpdatePairs(function (proxyA, proxyB) {
            _this.AddPair(proxyA, proxyB);
        });
    };
    b2ContactManager.prototype.Destroy = function (c) {
        var fixtureA = c.GetFixtureA();
        var fixtureB = c.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        if (this.m_contactListener && c.IsTouching()) {
            this.m_contactListener.EndContact(c);
        }
        if (c.m_prev) {
            c.m_prev.m_next = c.m_next;
        }
        if (c.m_next) {
            c.m_next.m_prev = c.m_prev;
        }
        if (c === this.m_contactList) {
            this.m_contactList = c.m_next;
        }
        if (c.m_nodeA.prev) {
            c.m_nodeA.prev.next = c.m_nodeA.next;
        }
        if (c.m_nodeA.next) {
            c.m_nodeA.next.prev = c.m_nodeA.prev;
        }
        if (c.m_nodeA === bodyA.m_contactList) {
            bodyA.m_contactList = c.m_nodeA.next;
        }
        if (c.m_nodeB.prev) {
            c.m_nodeB.prev.next = c.m_nodeB.next;
        }
        if (c.m_nodeB.next) {
            c.m_nodeB.next.prev = c.m_nodeB.prev;
        }
        if (c.m_nodeB === bodyB.m_contactList) {
            bodyB.m_contactList = c.m_nodeB.next;
        }
        if (c.m_manifold.pointCount > 0 &&
            !fixtureA.IsSensor() &&
            !fixtureB.IsSensor()) {
            fixtureA.GetBody().SetAwake(true);
            fixtureB.GetBody().SetAwake(true);
        }
        this.m_contactFactory.Destroy(c);
        --this.m_contactCount;
    };
    b2ContactManager.prototype.Collide = function () {
        var c = this.m_contactList;
        while (c) {
            var fixtureA = c.GetFixtureA();
            var fixtureB = c.GetFixtureB();
            var indexA = c.GetChildIndexA();
            var indexB = c.GetChildIndexB();
            var bodyA = fixtureA.GetBody();
            var bodyB = fixtureB.GetBody();
            if (c.m_filterFlag) {
                if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
                    var cNuke = c;
                    c = cNuke.m_next;
                    this.Destroy(cNuke);
                    continue;
                }
                c.m_filterFlag = false;
            }
            var activeA = bodyA.IsAwake() && bodyA.m_type !== b2BodyType.b2_staticBody;
            var activeB = bodyB.IsAwake() && bodyB.m_type !== b2BodyType.b2_staticBody;
            if (!activeA && !activeB) {
                c = c.m_next;
                continue;
            }
            var treeNodeA = fixtureA.m_proxies[indexA].treeNode;
            var treeNodeB = fixtureB.m_proxies[indexB].treeNode;
            var overlap = b2TestOverlapAABB(treeNodeA.aabb, treeNodeB.aabb);
            if (!overlap) {
                var cNuke = c;
                c = cNuke.m_next;
                this.Destroy(cNuke);
                continue;
            }
            c.Update(this.m_contactListener);
            c = c.m_next;
        }
    };
    return b2ContactManager;
}());
//# sourceMappingURL=b2_contact_manager.js.map