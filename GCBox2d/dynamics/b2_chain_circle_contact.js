




var b2ChainAndCircleContact = (function (_super) {
    __extends(b2ChainAndCircleContact, _super);
    function b2ChainAndCircleContact() {
        _super.apply(this, arguments);
    }
    b2ChainAndCircleContact.Create = function () {
        return new b2ChainAndCircleContact();
    };
    b2ChainAndCircleContact.Destroy = function (contact) {
    };
    b2ChainAndCircleContact.prototype.Evaluate = function (manifold, xfA, xfB) {
        var edge = b2ChainAndCircleContact.Evaluate_s_edge;
        this.GetShapeA().GetChildEdge(edge, this.m_indexA);
        b2CollideEdgeAndCircle(manifold, edge, xfA, this.GetShapeB(), xfB);
    };
    b2ChainAndCircleContact.Evaluate_s_edge = new b2EdgeShape();
    return b2ChainAndCircleContact;
}(b2Contact));
//# sourceMappingURL=b2_chain_circle_contact.js.map