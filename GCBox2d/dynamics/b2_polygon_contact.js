




var b2PolygonContact = (function (_super) {
    __extends(b2PolygonContact, _super);
    function b2PolygonContact() {
        _super.apply(this, arguments);
    }
    b2PolygonContact.Create = function () {
        return new b2PolygonContact();
    };
    b2PolygonContact.Destroy = function (contact) {
    };
    b2PolygonContact.prototype.Evaluate = function (manifold, xfA, xfB) {
        b2CollidePolygons(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
    };
    return b2PolygonContact;
}(b2Contact));
//# sourceMappingURL=b2_polygon_contact.js.map