var b2ControllerEdge = (function () {
    function b2ControllerEdge(controller, body) {
        this.prevBody = null;
        this.nextBody = null;
        this.prevController = null;
        this.nextController = null;
        this.controller = controller;
        this.body = body;
    }
    return b2ControllerEdge;
}());
var b2Controller = (function () {
    function b2Controller() {
        this.m_bodyList = null;
        this.m_bodyCount = 0;
        this.m_prev = null;
        this.m_next = null;
    }
    b2Controller.prototype.GetNext = function () {
        return this.m_next;
    };
    b2Controller.prototype.GetPrev = function () {
        return this.m_prev;
    };
    b2Controller.prototype.GetBodyList = function () {
        return this.m_bodyList;
    };
    b2Controller.prototype.AddBody = function (body) {
        var edge = new b2ControllerEdge(this, body);
        edge.nextBody = this.m_bodyList;
        edge.prevBody = null;
        if (this.m_bodyList) {
            this.m_bodyList.prevBody = edge;
        }
        this.m_bodyList = edge;
        ++this.m_bodyCount;
        edge.nextController = body.m_controllerList;
        edge.prevController = null;
        if (body.m_controllerList) {
            body.m_controllerList.prevController = edge;
        }
        body.m_controllerList = edge;
        ++body.m_controllerCount;
    };
    b2Controller.prototype.RemoveBody = function (body) {
        if (this.m_bodyCount <= 0) {
            throw new Error();
        }
        var edge = this.m_bodyList;
        while (edge && edge.body !== body) {
            edge = edge.nextBody;
        }
        if (edge === null) {
            throw new Error();
        }
        if (edge.prevBody) {
            edge.prevBody.nextBody = edge.nextBody;
        }
        if (edge.nextBody) {
            edge.nextBody.prevBody = edge.prevBody;
        }
        if (this.m_bodyList === edge) {
            this.m_bodyList = edge.nextBody;
        }
        --this.m_bodyCount;
        if (edge.nextController) {
            edge.nextController.prevController = edge.prevController;
        }
        if (edge.prevController) {
            edge.prevController.nextController = edge.nextController;
        }
        if (body.m_controllerList === edge) {
            body.m_controllerList = edge.nextController;
        }
        --body.m_controllerCount;
    };
    b2Controller.prototype.Clear = function () {
        while (this.m_bodyList) {
            this.RemoveBody(this.m_bodyList.body);
        }
        this.m_bodyCount = 0;
    };
    return b2Controller;
}());
//# sourceMappingURL=b2_controller.js.map