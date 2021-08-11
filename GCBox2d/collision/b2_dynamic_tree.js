function verify(value) {
    if (value === null) {
        throw new Error();
    }
    return value;
}
var b2TreeNode = (function () {
    function b2TreeNode(id) {
        if (id === void 0) { id = 0; }
        this.m_id = 0;
        this.aabb = new b2AABB();
        this._userData = null;
        this.parent = null;
        this.child1 = null;
        this.child2 = null;
        this.height = 0;
        this.moved = false;
        this.m_id = id;
    }
    Object.defineProperty(b2TreeNode.prototype, "userData", {
        get: function () {
            if (this._userData === null) {
                throw new Error();
            }
            return this._userData;
        },
        set: function (value) {
            if (this._userData !== null) {
                throw new Error();
            }
            this._userData = value;
        },
        enumerable: true,
        configurable: true
    });
    b2TreeNode.prototype.Reset = function () {
        this._userData = null;
    };
    b2TreeNode.prototype.IsLeaf = function () {
        return this.child1 === null;
    };
    return b2TreeNode;
}());
var b2DynamicTree = (function () {
    function b2DynamicTree() {
        this.m_root = null;
        this.m_freeList = null;
        this.m_insertionCount = 0;
        this.m_stack = new b2GrowableStack(256);
    }
    b2DynamicTree.prototype.Query = function (aabb, callback) {
        var stack = this.m_stack.Reset();
        stack.Push(this.m_root);
        while (stack.GetCount() > 0) {
            var node = stack.Pop();
            if (node === null) {
                continue;
            }
            if (node.aabb.TestOverlap(aabb)) {
                if (node.IsLeaf()) {
                    var proceed = callback(node);
                    if (!proceed) {
                        return;
                    }
                }
                else {
                    stack.Push(node.child1);
                    stack.Push(node.child2);
                }
            }
        }
    };
    b2DynamicTree.prototype.QueryPoint = function (point, callback) {
        var stack = this.m_stack.Reset();
        stack.Push(this.m_root);
        while (stack.GetCount() > 0) {
            var node = stack.Pop();
            if (node === null) {
                continue;
            }
            if (node.aabb.TestContain(point)) {
                if (node.IsLeaf()) {
                    var proceed = callback(node);
                    if (!proceed) {
                        return;
                    }
                }
                else {
                    stack.Push(node.child1);
                    stack.Push(node.child2);
                }
            }
        }
    };
    b2DynamicTree.prototype.RayCast = function (input, callback) {
        var p1 = input.p1;
        var p2 = input.p2;
        var r = b2Vec2.SubVV(p2, p1, b2DynamicTree.s_r);
        r.Normalize();
        var v = b2Vec2.CrossOneV(r, b2DynamicTree.s_v);
        var abs_v = b2Vec2.AbsV(v, b2DynamicTree.s_abs_v);
        var maxFraction = input.maxFraction;
        var segmentAABB = b2DynamicTree.s_segmentAABB;
        var t_x = p1.x + maxFraction * (p2.x - p1.x);
        var t_y = p1.y + maxFraction * (p2.y - p1.y);
        segmentAABB.lowerBound.x = b2Min(p1.x, t_x);
        segmentAABB.lowerBound.y = b2Min(p1.y, t_y);
        segmentAABB.upperBound.x = b2Max(p1.x, t_x);
        segmentAABB.upperBound.y = b2Max(p1.y, t_y);
        var stack = this.m_stack.Reset();
        stack.Push(this.m_root);
        while (stack.GetCount() > 0) {
            var node = stack.Pop();
            if (node === null) {
                continue;
            }
            if (!b2TestOverlapAABB(node.aabb, segmentAABB)) {
                continue;
            }
            var c = node.aabb.GetCenter();
            var h = node.aabb.GetExtents();
            var separation = b2Abs(b2Vec2.DotVV(v, b2Vec2.SubVV(p1, c, b2Vec2.s_t0))) - b2Vec2.DotVV(abs_v, h);
            if (separation > 0) {
                continue;
            }
            if (node.IsLeaf()) {
                var subInput = b2DynamicTree.s_subInput;
                subInput.p1.Copy(input.p1);
                subInput.p2.Copy(input.p2);
                subInput.maxFraction = maxFraction;
                var value = callback(subInput, node);
                if (value === 0) {
                    return;
                }
                if (value > 0) {
                    maxFraction = value;
                    t_x = p1.x + maxFraction * (p2.x - p1.x);
                    t_y = p1.y + maxFraction * (p2.y - p1.y);
                    segmentAABB.lowerBound.x = b2Min(p1.x, t_x);
                    segmentAABB.lowerBound.y = b2Min(p1.y, t_y);
                    segmentAABB.upperBound.x = b2Max(p1.x, t_x);
                    segmentAABB.upperBound.y = b2Max(p1.y, t_y);
                }
            }
            else {
                stack.Push(node.child1);
                stack.Push(node.child2);
            }
        }
    };
    b2DynamicTree.prototype.AllocateNode = function () {
        if (this.m_freeList !== null) {
            var node = this.m_freeList;
            this.m_freeList = node.parent;
            node.parent = null;
            node.child1 = null;
            node.child2 = null;
            node.height = 0;
            node.moved = false;
            return node;
        }
        return new b2TreeNode(b2DynamicTree.s_node_id++);
    };
    b2DynamicTree.prototype.FreeNode = function (node) {
        node.parent = this.m_freeList;
        node.child1 = null;
        node.child2 = null;
        node.height = -1;
        node.Reset();
        this.m_freeList = node;
    };
    b2DynamicTree.prototype.CreateProxy = function (aabb, userData) {
        var node = this.AllocateNode();
        var r_x = b2_aabbExtension;
        var r_y = b2_aabbExtension;
        node.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
        node.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
        node.aabb.upperBound.x = aabb.upperBound.x + r_x;
        node.aabb.upperBound.y = aabb.upperBound.y + r_y;
        node.userData = userData;
        node.height = 0;
        node.moved = true;
        this.InsertLeaf(node);
        return node;
    };
    b2DynamicTree.prototype.DestroyProxy = function (node) {
        this.RemoveLeaf(node);
        this.FreeNode(node);
    };
    b2DynamicTree.prototype.MoveProxy = function (node, aabb, displacement) {
        var fatAABB = b2DynamicTree.MoveProxy_s_fatAABB;
        var r_x = b2_aabbExtension;
        var r_y = b2_aabbExtension;
        fatAABB.lowerBound.x = aabb.lowerBound.x - r_x;
        fatAABB.lowerBound.y = aabb.lowerBound.y - r_y;
        fatAABB.upperBound.x = aabb.upperBound.x + r_x;
        fatAABB.upperBound.y = aabb.upperBound.y + r_y;
        var d_x = b2_aabbMultiplier * displacement.x;
        var d_y = b2_aabbMultiplier * displacement.y;
        if (d_x < 0.0) {
            fatAABB.lowerBound.x += d_x;
        }
        else {
            fatAABB.upperBound.x += d_x;
        }
        if (d_y < 0.0) {
            fatAABB.lowerBound.y += d_y;
        }
        else {
            fatAABB.upperBound.y += d_y;
        }
        var treeAABB = node.aabb;
        if (treeAABB.Contains(aabb)) {
            var hugeAABB = b2DynamicTree.MoveProxy_s_hugeAABB;
            hugeAABB.lowerBound.x = fatAABB.lowerBound.x - 4.0 * r_x;
            hugeAABB.lowerBound.y = fatAABB.lowerBound.y - 4.0 * r_y;
            hugeAABB.upperBound.x = fatAABB.upperBound.x + 4.0 * r_x;
            hugeAABB.upperBound.y = fatAABB.upperBound.y + 4.0 * r_y;
            if (hugeAABB.Contains(treeAABB)) {
                return false;
            }
        }
        this.RemoveLeaf(node);
        node.aabb.Copy(fatAABB);
        this.InsertLeaf(node);
        node.moved = true;
        return true;
    };
    b2DynamicTree.prototype.InsertLeaf = function (leaf) {
        ++this.m_insertionCount;
        if (this.m_root === null) {
            this.m_root = leaf;
            this.m_root.parent = null;
            return;
        }
        var leafAABB = leaf.aabb;
        var sibling = this.m_root;
        while (!sibling.IsLeaf()) {
            var child1 = verify(sibling.child1);
            var child2 = verify(sibling.child2);
            var area = sibling.aabb.GetPerimeter();
            var combinedAABB = b2DynamicTree.s_combinedAABB;
            combinedAABB.Combine2(sibling.aabb, leafAABB);
            var combinedArea = combinedAABB.GetPerimeter();
            var cost = 2 * combinedArea;
            var inheritanceCost = 2 * (combinedArea - area);
            var cost1 = void 0;
            var aabb = b2DynamicTree.s_aabb;
            var oldArea = void 0;
            var newArea = void 0;
            if (child1.IsLeaf()) {
                aabb.Combine2(leafAABB, child1.aabb);
                cost1 = aabb.GetPerimeter() + inheritanceCost;
            }
            else {
                aabb.Combine2(leafAABB, child1.aabb);
                oldArea = child1.aabb.GetPerimeter();
                newArea = aabb.GetPerimeter();
                cost1 = (newArea - oldArea) + inheritanceCost;
            }
            var cost2 = void 0;
            if (child2.IsLeaf()) {
                aabb.Combine2(leafAABB, child2.aabb);
                cost2 = aabb.GetPerimeter() + inheritanceCost;
            }
            else {
                aabb.Combine2(leafAABB, child2.aabb);
                oldArea = child2.aabb.GetPerimeter();
                newArea = aabb.GetPerimeter();
                cost2 = newArea - oldArea + inheritanceCost;
            }
            if (cost < cost1 && cost < cost2) {
                break;
            }
            if (cost1 < cost2) {
                sibling = child1;
            }
            else {
                sibling = child2;
            }
        }
        var oldParent = sibling.parent;
        var newParent = this.AllocateNode();
        newParent.parent = oldParent;
        newParent.aabb.Combine2(leafAABB, sibling.aabb);
        newParent.height = sibling.height + 1;
        if (oldParent !== null) {
            if (oldParent.child1 === sibling) {
                oldParent.child1 = newParent;
            }
            else {
                oldParent.child2 = newParent;
            }
            newParent.child1 = sibling;
            newParent.child2 = leaf;
            sibling.parent = newParent;
            leaf.parent = newParent;
        }
        else {
            newParent.child1 = sibling;
            newParent.child2 = leaf;
            sibling.parent = newParent;
            leaf.parent = newParent;
            this.m_root = newParent;
        }
        var node = leaf.parent;
        while (node !== null) {
            node = this.Balance(node);
            var child1 = verify(node.child1);
            var child2 = verify(node.child2);
            node.height = 1 + b2Max(child1.height, child2.height);
            node.aabb.Combine2(child1.aabb, child2.aabb);
            node = node.parent;
        }
    };
    b2DynamicTree.prototype.RemoveLeaf = function (leaf) {
        if (leaf === this.m_root) {
            this.m_root = null;
            return;
        }
        var parent = verify(leaf.parent);
        var grandParent = parent && parent.parent;
        var sibling = verify(parent.child1 === leaf ? parent.child2 : parent.child1);
        if (grandParent !== null) {
            if (grandParent.child1 === parent) {
                grandParent.child1 = sibling;
            }
            else {
                grandParent.child2 = sibling;
            }
            sibling.parent = grandParent;
            this.FreeNode(parent);
            var index = grandParent;
            while (index !== null) {
                index = this.Balance(index);
                var child1 = verify(index.child1);
                var child2 = verify(index.child2);
                index.aabb.Combine2(child1.aabb, child2.aabb);
                index.height = 1 + b2Max(child1.height, child2.height);
                index = index.parent;
            }
        }
        else {
            this.m_root = sibling;
            sibling.parent = null;
            this.FreeNode(parent);
        }
    };
    b2DynamicTree.prototype.Balance = function (A) {
        if (A.IsLeaf() || A.height < 2) {
            return A;
        }
        var B = verify(A.child1);
        var C = verify(A.child2);
        var balance = C.height - B.height;
        if (balance > 1) {
            var F = verify(C.child1);
            var G = verify(C.child2);
            C.child1 = A;
            C.parent = A.parent;
            A.parent = C;
            if (C.parent !== null) {
                if (C.parent.child1 === A) {
                    C.parent.child1 = C;
                }
                else {
                    C.parent.child2 = C;
                }
            }
            else {
                this.m_root = C;
            }
            if (F.height > G.height) {
                C.child2 = F;
                A.child2 = G;
                G.parent = A;
                A.aabb.Combine2(B.aabb, G.aabb);
                C.aabb.Combine2(A.aabb, F.aabb);
                A.height = 1 + b2Max(B.height, G.height);
                C.height = 1 + b2Max(A.height, F.height);
            }
            else {
                C.child2 = G;
                A.child2 = F;
                F.parent = A;
                A.aabb.Combine2(B.aabb, F.aabb);
                C.aabb.Combine2(A.aabb, G.aabb);
                A.height = 1 + b2Max(B.height, F.height);
                C.height = 1 + b2Max(A.height, G.height);
            }
            return C;
        }
        if (balance < -1) {
            var D = verify(B.child1);
            var E = verify(B.child2);
            B.child1 = A;
            B.parent = A.parent;
            A.parent = B;
            if (B.parent !== null) {
                if (B.parent.child1 === A) {
                    B.parent.child1 = B;
                }
                else {
                    B.parent.child2 = B;
                }
            }
            else {
                this.m_root = B;
            }
            if (D.height > E.height) {
                B.child2 = D;
                A.child1 = E;
                E.parent = A;
                A.aabb.Combine2(C.aabb, E.aabb);
                B.aabb.Combine2(A.aabb, D.aabb);
                A.height = 1 + b2Max(C.height, E.height);
                B.height = 1 + b2Max(A.height, D.height);
            }
            else {
                B.child2 = E;
                A.child1 = D;
                D.parent = A;
                A.aabb.Combine2(C.aabb, D.aabb);
                B.aabb.Combine2(A.aabb, E.aabb);
                A.height = 1 + b2Max(C.height, D.height);
                B.height = 1 + b2Max(A.height, E.height);
            }
            return B;
        }
        return A;
    };
    b2DynamicTree.prototype.GetHeight = function () {
        if (this.m_root === null) {
            return 0;
        }
        return this.m_root.height;
    };
    b2DynamicTree.GetAreaNode = function (node) {
        if (node === null) {
            return 0;
        }
        if (node.IsLeaf()) {
            return 0;
        }
        var area = node.aabb.GetPerimeter();
        area += b2DynamicTree.GetAreaNode(node.child1);
        area += b2DynamicTree.GetAreaNode(node.child2);
        return area;
    };
    b2DynamicTree.prototype.GetAreaRatio = function () {
        if (this.m_root === null) {
            return 0;
        }
        var root = this.m_root;
        var rootArea = root.aabb.GetPerimeter();
        var totalArea = b2DynamicTree.GetAreaNode(this.m_root);
        return totalArea / rootArea;
    };
    b2DynamicTree.ComputeHeightNode = function (node) {
        if (node === null) {
            return 0;
        }
        if (node.IsLeaf()) {
            return 0;
        }
        var height1 = b2DynamicTree.ComputeHeightNode(node.child1);
        var height2 = b2DynamicTree.ComputeHeightNode(node.child2);
        return 1 + b2Max(height1, height2);
    };
    b2DynamicTree.prototype.ComputeHeight = function () {
        var height = b2DynamicTree.ComputeHeightNode(this.m_root);
        return height;
    };
    b2DynamicTree.prototype.ValidateStructure = function (node) {
        if (node === null) {
            return;
        }
        if (node === this.m_root) {
        }
        if (node.IsLeaf()) {
            return;
        }
        var child1 = verify(node.child1);
        var child2 = verify(node.child2);
        this.ValidateStructure(child1);
        this.ValidateStructure(child2);
    };
    b2DynamicTree.prototype.ValidateMetrics = function (node) {
        if (node === null) {
            return;
        }
        if (node.IsLeaf()) {
            return;
        }
        var child1 = verify(node.child1);
        var child2 = verify(node.child2);
        var aabb = b2DynamicTree.s_aabb;
        aabb.Combine2(child1.aabb, child2.aabb);
        this.ValidateMetrics(child1);
        this.ValidateMetrics(child2);
    };
    b2DynamicTree.prototype.Validate = function () {
    };
    b2DynamicTree.GetMaxBalanceNode = function (node, maxBalance) {
        if (node === null) {
            return maxBalance;
        }
        if (node.height <= 1) {
            return maxBalance;
        }
        var child1 = verify(node.child1);
        var child2 = verify(node.child2);
        var balance = b2Abs(child2.height - child1.height);
        return b2Max(maxBalance, balance);
    };
    b2DynamicTree.prototype.GetMaxBalance = function () {
        var maxBalance = b2DynamicTree.GetMaxBalanceNode(this.m_root, 0);
        return maxBalance;
    };
    b2DynamicTree.prototype.RebuildBottomUp = function () {
        this.Validate();
    };
    b2DynamicTree.ShiftOriginNode = function (node, newOrigin) {
        if (node === null) {
            return;
        }
        if (node.height <= 1) {
            return;
        }
        var child1 = node.child1;
        var child2 = node.child2;
        b2DynamicTree.ShiftOriginNode(child1, newOrigin);
        b2DynamicTree.ShiftOriginNode(child2, newOrigin);
        node.aabb.lowerBound.SelfSub(newOrigin);
        node.aabb.upperBound.SelfSub(newOrigin);
    };
    b2DynamicTree.prototype.ShiftOrigin = function (newOrigin) {
        b2DynamicTree.ShiftOriginNode(this.m_root, newOrigin);
    };
    b2DynamicTree.s_r = new b2Vec2();
    b2DynamicTree.s_v = new b2Vec2();
    b2DynamicTree.s_abs_v = new b2Vec2();
    b2DynamicTree.s_segmentAABB = new b2AABB();
    b2DynamicTree.s_subInput = new b2RayCastInput();
    b2DynamicTree.s_combinedAABB = new b2AABB();
    b2DynamicTree.s_aabb = new b2AABB();
    b2DynamicTree.s_node_id = 0;
    b2DynamicTree.MoveProxy_s_fatAABB = new b2AABB();
    b2DynamicTree.MoveProxy_s_hugeAABB = new b2AABB();
    return b2DynamicTree;
}());
//# sourceMappingURL=b2_dynamic_tree.js.map