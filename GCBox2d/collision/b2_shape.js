var b2MassData = (function () {
    function b2MassData() {
        this.mass = 0;
        this.center = new b2Vec2(0, 0);
        this.I = 0;
    }
    return b2MassData;
}());
var b2ShapeType;
(function (b2ShapeType) {
    b2ShapeType[b2ShapeType["e_unknown"] = -1] = "e_unknown";
    b2ShapeType[b2ShapeType["e_circleShape"] = 0] = "e_circleShape";
    b2ShapeType[b2ShapeType["e_edgeShape"] = 1] = "e_edgeShape";
    b2ShapeType[b2ShapeType["e_polygonShape"] = 2] = "e_polygonShape";
    b2ShapeType[b2ShapeType["e_chainShape"] = 3] = "e_chainShape";
    b2ShapeType[b2ShapeType["e_shapeTypeCount"] = 4] = "e_shapeTypeCount";
})(b2ShapeType || (b2ShapeType = {}));
var b2Shape = (function () {
    function b2Shape(type, radius) {
        this.m_type = b2ShapeType.e_unknown;
        this.m_radius = 0;
        this.m_type = type;
        this.m_radius = radius;
    }
    b2Shape.prototype.Copy = function (other) {
        this.m_radius = other.m_radius;
        return this;
    };
    b2Shape.prototype.GetType = function () {
        return this.m_type;
    };
    return b2Shape;
}());
//# sourceMappingURL=b2_shape.js.map