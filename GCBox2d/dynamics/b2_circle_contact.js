




var b2CircleContact = (function (_super) {
    __extends(b2CircleContact, _super);
    function b2CircleContact() {
        _super.apply(this, arguments);
    }
    b2CircleContact.Create = function () {
        return new b2CircleContact();
    };
    b2CircleContact.Destroy = function (contact) {
    };
    b2CircleContact.prototype.Evaluate = function (manifold, xfA, xfB) {
        b2CollideCircles(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
    };
    return b2CircleContact;
}(b2Contact));
//# sourceMappingURL=b2_circle_contact.js.map