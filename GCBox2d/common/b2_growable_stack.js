var b2GrowableStack = (function () {
    function b2GrowableStack(N) {
        this.m_stack = [];
        this.m_count = 0;
        this.m_stack = b2MakeArray(N, function (index) { return null; });
        this.m_count = 0;
    }
    b2GrowableStack.prototype.Reset = function () {
        this.m_count = 0;
        return this;
    };
    b2GrowableStack.prototype.Push = function (element) {
        this.m_stack[this.m_count] = element;
        this.m_count++;
    };
    b2GrowableStack.prototype.Pop = function () {
        this.m_count--;
        var element = this.m_stack[this.m_count];
        this.m_stack[this.m_count] = null;
        return element;
    };
    b2GrowableStack.prototype.GetCount = function () {
        return this.m_count;
    };
    return b2GrowableStack;
}());
//# sourceMappingURL=b2_growable_stack.js.map