var b2Timer = (function () {
    function b2Timer() {
        this.m_start = Date.now();
    }
    b2Timer.prototype.Reset = function () {
        this.m_start = Date.now();
        return this;
    };
    b2Timer.prototype.GetMilliseconds = function () {
        return Date.now() - this.m_start;
    };
    return b2Timer;
}());
var b2Counter = (function () {
    function b2Counter() {
        this.m_count = 0;
        this.m_min_count = 0;
        this.m_max_count = 0;
    }
    b2Counter.prototype.GetCount = function () {
        return this.m_count;
    };
    b2Counter.prototype.GetMinCount = function () {
        return this.m_min_count;
    };
    b2Counter.prototype.GetMaxCount = function () {
        return this.m_max_count;
    };
    b2Counter.prototype.ResetCount = function () {
        var count = this.m_count;
        this.m_count = 0;
        return count;
    };
    b2Counter.prototype.ResetMinCount = function () {
        this.m_min_count = 0;
    };
    b2Counter.prototype.ResetMaxCount = function () {
        this.m_max_count = 0;
    };
    b2Counter.prototype.Increment = function () {
        this.m_count++;
        if (this.m_max_count < this.m_count) {
            this.m_max_count = this.m_count;
        }
    };
    b2Counter.prototype.Decrement = function () {
        this.m_count--;
        if (this.m_min_count > this.m_count) {
            this.m_min_count = this.m_count;
        }
    };
    return b2Counter;
}());
//# sourceMappingURL=b2_timer.js.map