




var b2ChainAndPolygonContact = (function (_super) {
    __extends(b2ChainAndPolygonContact, _super);
    function b2ChainAndPolygonContact() {
        _super.apply(this, arguments);
    }
    b2ChainAndPolygonContact.Create = function () {
        return new b2ChainAndPolygonContact();
    };
    b2ChainAndPolygonContact.Destroy = function (contact) {
    };
    b2ChainAndPolygonContact.prototype.Evaluate = function (manifold, xfA, xfB) {
        var edge = b2ChainAndPolygonContact.Evaluate_s_edge;
        this.GetShapeA().GetChildEdge(edge, this.m_indexA);
        b2CollideEdgeAndPolygon(manifold, edge, xfA, this.GetShapeB(), xfB);
    };
    b2ChainAndPolygonContact.Evaluate_s_edge = new b2EdgeShape();
    return b2ChainAndPolygonContact;
}(b2Contact));
//# sourceMappingURL=b2_chain_polygon_contact.js.map