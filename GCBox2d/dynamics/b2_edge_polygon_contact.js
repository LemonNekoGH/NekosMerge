




var b2EdgeAndPolygonContact = (function (_super) {
    __extends(b2EdgeAndPolygonContact, _super);
    function b2EdgeAndPolygonContact() {
        _super.apply(this, arguments);
    }
    b2EdgeAndPolygonContact.Create = function () {
        return new b2EdgeAndPolygonContact();
    };
    b2EdgeAndPolygonContact.Destroy = function (contact) {
    };
    b2EdgeAndPolygonContact.prototype.Evaluate = function (manifold, xfA, xfB) {
        b2CollideEdgeAndPolygon(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
    };
    return b2EdgeAndPolygonContact;
}(b2Contact));
//# sourceMappingURL=b2_edge_polygon_contact.js.map