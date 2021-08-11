




var b2ChainShape = (function (_super) {
    __extends(b2ChainShape, _super);
    function b2ChainShape() {
        _super.call(this, b2ShapeType.e_chainShape, b2_polygonRadius);
        this.m_vertices = [];
        this.m_count = 0;
        this.m_prevVertex = new b2Vec2();
        this.m_nextVertex = new b2Vec2();
    }
    b2ChainShape.prototype.CreateLoop = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (typeof args[0][0] === "number") {
            var vertices_1 = args[0];
            if (vertices_1.length % 2 !== 0) {
                throw new Error();
            }
            return this._CreateLoop(function (index) { return ({ x: vertices_1[index * 2], y: vertices_1[index * 2 + 1] }); }, vertices_1.length / 2);
        }
        else {
            var vertices_2 = args[0];
            var count = args[1] || vertices_2.length;
            return this._CreateLoop(function (index) { return vertices_2[index]; }, count);
        }
    };
    b2ChainShape.prototype._CreateLoop = function (vertices, count) {
        if (count < 3) {
            return this;
        }
        this.m_count = count + 1;
        this.m_vertices = b2Vec2.MakeArray(this.m_count);
        for (var i = 0; i < count; ++i) {
            this.m_vertices[i].Copy(vertices(i));
        }
        this.m_vertices[count].Copy(this.m_vertices[0]);
        this.m_prevVertex.Copy(this.m_vertices[this.m_count - 2]);
        this.m_nextVertex.Copy(this.m_vertices[1]);
        return this;
    };
    b2ChainShape.prototype.CreateChain = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (typeof args[0][0] === "number") {
            var vertices_3 = args[0];
            var prevVertex = args[1];
            var nextVertex = args[2];
            if (vertices_3.length % 2 !== 0) {
                throw new Error();
            }
            return this._CreateChain(function (index) { return ({ x: vertices_3[index * 2], y: vertices_3[index * 2 + 1] }); }, vertices_3.length / 2, prevVertex, nextVertex);
        }
        else {
            var vertices_4 = args[0];
            var count = args[1] || vertices_4.length;
            var prevVertex = args[2];
            var nextVertex = args[3];
            return this._CreateChain(function (index) { return vertices_4[index]; }, count, prevVertex, nextVertex);
        }
    };
    b2ChainShape.prototype._CreateChain = function (vertices, count, prevVertex, nextVertex) {
        this.m_count = count;
        this.m_vertices = b2Vec2.MakeArray(count);
        for (var i = 0; i < count; ++i) {
            this.m_vertices[i].Copy(vertices(i));
        }
        this.m_prevVertex.Copy(prevVertex);
        this.m_nextVertex.Copy(nextVertex);
        return this;
    };
    b2ChainShape.prototype.Clone = function () {
        return new b2ChainShape().Copy(this);
    };
    b2ChainShape.prototype.Copy = function (other) {
        _super.prototype.Copy.call(this, other);
        this._CreateChain(function (index) { return other.m_vertices[index]; }, other.m_count, other.m_prevVertex, other.m_nextVertex);
        this.m_prevVertex.Copy(other.m_prevVertex);
        this.m_nextVertex.Copy(other.m_nextVertex);
        return this;
    };
    b2ChainShape.prototype.GetChildCount = function () {
        return this.m_count - 1;
    };
    b2ChainShape.prototype.GetChildEdge = function (edge, index) {
        edge.m_radius = this.m_radius;
        edge.m_vertex1.Copy(this.m_vertices[index]);
        edge.m_vertex2.Copy(this.m_vertices[index + 1]);
        edge.m_oneSided = true;
        if (index > 0) {
            edge.m_vertex0.Copy(this.m_vertices[index - 1]);
        }
        else {
            edge.m_vertex0.Copy(this.m_prevVertex);
        }
        if (index < this.m_count - 2) {
            edge.m_vertex3.Copy(this.m_vertices[index + 2]);
        }
        else {
            edge.m_vertex3.Copy(this.m_nextVertex);
        }
    };
    b2ChainShape.prototype.TestPoint = function (xf, p) {
        return false;
    };
    b2ChainShape.prototype.ComputeDistance = function (xf, p, normal, childIndex) {
        var edge = b2ChainShape.ComputeDistance_s_edgeShape;
        this.GetChildEdge(edge, childIndex);
        return edge.ComputeDistance(xf, p, normal, 0);
    };
    b2ChainShape.prototype.RayCast = function (output, input, xf, childIndex) {
        var edgeShape = b2ChainShape.RayCast_s_edgeShape;
        edgeShape.m_vertex1.Copy(this.m_vertices[childIndex]);
        edgeShape.m_vertex2.Copy(this.m_vertices[(childIndex + 1) % this.m_count]);
        return edgeShape.RayCast(output, input, xf, 0);
    };
    b2ChainShape.prototype.ComputeAABB = function (aabb, xf, childIndex) {
        var vertexi1 = this.m_vertices[childIndex];
        var vertexi2 = this.m_vertices[(childIndex + 1) % this.m_count];
        var v1 = b2Transform.MulXV(xf, vertexi1, b2ChainShape.ComputeAABB_s_v1);
        var v2 = b2Transform.MulXV(xf, vertexi2, b2ChainShape.ComputeAABB_s_v2);
        var lower = b2Vec2.MinV(v1, v2, b2ChainShape.ComputeAABB_s_lower);
        var upper = b2Vec2.MaxV(v1, v2, b2ChainShape.ComputeAABB_s_upper);
        aabb.lowerBound.x = lower.x - this.m_radius;
        aabb.lowerBound.y = lower.y - this.m_radius;
        aabb.upperBound.x = upper.x + this.m_radius;
        aabb.upperBound.y = upper.y + this.m_radius;
    };
    b2ChainShape.prototype.ComputeMass = function (massData, density) {
        massData.mass = 0;
        massData.center.SetZero();
        massData.I = 0;
    };
    b2ChainShape.prototype.SetupDistanceProxy = function (proxy, index) {
        proxy.m_vertices = proxy.m_buffer;
        proxy.m_vertices[0].Copy(this.m_vertices[index]);
        if (index + 1 < this.m_count) {
            proxy.m_vertices[1].Copy(this.m_vertices[index + 1]);
        }
        else {
            proxy.m_vertices[1].Copy(this.m_vertices[0]);
        }
        proxy.m_count = 2;
        proxy.m_radius = this.m_radius;
    };
    b2ChainShape.prototype.ComputeSubmergedArea = function (normal, offset, xf, c) {
        c.SetZero();
        return 0;
    };
    b2ChainShape.prototype.Dump = function (log) {
        log("    const shape: b2ChainShape = new b2ChainShape();\n");
        log("    const vs: b2Vec2[] = [];\n");
        for (var i = 0; i < this.m_count; ++i) {
            log("    vs[%d] = new bVec2(%.15f, %.15f);\n", i, this.m_vertices[i].x, this.m_vertices[i].y);
        }
        log("    shape.CreateChain(vs, %d);\n", this.m_count);
        log("    shape.m_prevVertex.Set(%.15f, %.15f);\n", this.m_prevVertex.x, this.m_prevVertex.y);
        log("    shape.m_nextVertex.Set(%.15f, %.15f);\n", this.m_nextVertex.x, this.m_nextVertex.y);
    };
    b2ChainShape.ComputeDistance_s_edgeShape = new b2EdgeShape();
    b2ChainShape.RayCast_s_edgeShape = new b2EdgeShape();
    b2ChainShape.ComputeAABB_s_v1 = new b2Vec2();
    b2ChainShape.ComputeAABB_s_v2 = new b2Vec2();
    b2ChainShape.ComputeAABB_s_lower = new b2Vec2();
    b2ChainShape.ComputeAABB_s_upper = new b2Vec2();
    return b2ChainShape;
}(b2Shape));
//# sourceMappingURL=b2_chain_shape.js.map