




var b2EdgeAndCircleContact = (function (_super) {
    __extends(b2EdgeAndCircleContact, _super);
    function b2EdgeAndCircleContact() {
        _super.apply(this, arguments);
    }
    b2EdgeAndCircleContact.Create = function () {
        return new b2EdgeAndCircleContact();
    };
    b2EdgeAndCircleContact.Destroy = function (contact) {
    };
    b2EdgeAndCircleContact.prototype.Evaluate = function (manifold, xfA, xfB) {
        b2CollideEdgeAndCircle(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
    };
    return b2EdgeAndCircleContact;
}(b2Contact));
//# sourceMappingURL=b2_edge_circle_contact.js.map