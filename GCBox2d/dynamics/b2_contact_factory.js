var b2ContactRegister = (function () {
    function b2ContactRegister() {
        this.pool = [];
        this.createFcn = null;
        this.destroyFcn = null;
        this.primary = false;
    }
    return b2ContactRegister;
}());
var b2ContactFactory = (function () {
    function b2ContactFactory() {
        this.m_registers = [];
        this.InitializeRegisters();
    }
    b2ContactFactory.prototype.AddType = function (createFcn, destroyFcn, typeA, typeB) {
        var pool = [];
        function poolCreateFcn() {
            return pool.pop() || createFcn();
        }
        function poolDestroyFcn(contact) {
            pool.push(contact);
        }
        this.m_registers[typeA][typeB].pool = pool;
        this.m_registers[typeA][typeB].createFcn = poolCreateFcn;
        this.m_registers[typeA][typeB].destroyFcn = poolDestroyFcn;
        this.m_registers[typeA][typeB].primary = true;
        if (typeA !== typeB) {
            this.m_registers[typeB][typeA].pool = pool;
            this.m_registers[typeB][typeA].createFcn = poolCreateFcn;
            this.m_registers[typeB][typeA].destroyFcn = poolDestroyFcn;
            this.m_registers[typeB][typeA].primary = false;
        }
    };
    b2ContactFactory.prototype.InitializeRegisters = function () {
        for (var i = 0; i < b2ShapeType.e_shapeTypeCount; i++) {
            this.m_registers[i] = [];
            for (var j = 0; j < b2ShapeType.e_shapeTypeCount; j++) {
                this.m_registers[i][j] = new b2ContactRegister();
            }
        }
        this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2ShapeType.e_circleShape, b2ShapeType.e_circleShape);
        this.AddType(b2PolygonAndCircleContact.Create, b2PolygonAndCircleContact.Destroy, b2ShapeType.e_polygonShape, b2ShapeType.e_circleShape);
        this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, b2ShapeType.e_polygonShape, b2ShapeType.e_polygonShape);
        this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, b2ShapeType.e_edgeShape, b2ShapeType.e_circleShape);
        this.AddType(b2EdgeAndPolygonContact.Create, b2EdgeAndPolygonContact.Destroy, b2ShapeType.e_edgeShape, b2ShapeType.e_polygonShape);
        this.AddType(b2ChainAndCircleContact.Create, b2ChainAndCircleContact.Destroy, b2ShapeType.e_chainShape, b2ShapeType.e_circleShape);
        this.AddType(b2ChainAndPolygonContact.Create, b2ChainAndPolygonContact.Destroy, b2ShapeType.e_chainShape, b2ShapeType.e_polygonShape);
    };
    b2ContactFactory.prototype.Create = function (fixtureA, indexA, fixtureB, indexB) {
        var typeA = fixtureA.GetType();
        var typeB = fixtureB.GetType();
        var reg = this.m_registers[typeA][typeB];
        if (reg.createFcn) {
            var c = reg.createFcn();
            if (reg.primary) {
                c.Reset(fixtureA, indexA, fixtureB, indexB);
            }
            else {
                c.Reset(fixtureB, indexB, fixtureA, indexA);
            }
            return c;
        }
        else {
            return null;
        }
    };
    b2ContactFactory.prototype.Destroy = function (contact) {
        var typeA = contact.m_fixtureA.GetType();
        var typeB = contact.m_fixtureB.GetType();
        var reg = this.m_registers[typeA][typeB];
        if (reg.destroyFcn) {
            reg.destroyFcn(contact);
        }
    };
    return b2ContactFactory;
}());
//# sourceMappingURL=b2_contact_factory.js.map