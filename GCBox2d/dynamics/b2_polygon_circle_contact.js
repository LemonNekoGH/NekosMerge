




var b2PolygonAndCircleContact = (function (_super) {
    __extends(b2PolygonAndCircleContact, _super);
    function b2PolygonAndCircleContact() {
        _super.apply(this, arguments);
    }
    b2PolygonAndCircleContact.Create = function () {
        return new b2PolygonAndCircleContact();
    };
    b2PolygonAndCircleContact.Destroy = function (contact) {
    };
    b2PolygonAndCircleContact.prototype.Evaluate = function (manifold, xfA, xfB) {
        b2CollidePolygonAndCircle(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
    };
    return b2PolygonAndCircleContact;
}(b2Contact));
//# sourceMappingURL=b2_polygon_circle_contact.js.map