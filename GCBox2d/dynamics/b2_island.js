var b2Island = (function () {
    function b2Island() {
        this.m_bodies = [];
        this.m_contacts = [];
        this.m_joints = [];
        this.m_positions = b2Position.MakeArray(1024);
        this.m_velocities = b2Velocity.MakeArray(1024);
        this.m_bodyCount = 0;
        this.m_jointCount = 0;
        this.m_contactCount = 0;
        this.m_bodyCapacity = 0;
        this.m_contactCapacity = 0;
        this.m_jointCapacity = 0;
    }
    b2Island.prototype.Initialize = function (bodyCapacity, contactCapacity, jointCapacity, listener) {
        this.m_bodyCapacity = bodyCapacity;
        this.m_contactCapacity = contactCapacity;
        this.m_jointCapacity = jointCapacity;
        this.m_bodyCount = 0;
        this.m_contactCount = 0;
        this.m_jointCount = 0;
        this.m_listener = listener;
        if (this.m_positions.length < bodyCapacity) {
            var new_length = b2Max(this.m_positions.length * 2, bodyCapacity);
            while (this.m_positions.length < new_length) {
                this.m_positions[this.m_positions.length] = new b2Position();
            }
        }
        if (this.m_velocities.length < bodyCapacity) {
            var new_length = b2Max(this.m_velocities.length * 2, bodyCapacity);
            while (this.m_velocities.length < new_length) {
                this.m_velocities[this.m_velocities.length] = new b2Velocity();
            }
        }
    };
    b2Island.prototype.Clear = function () {
        this.m_bodyCount = 0;
        this.m_contactCount = 0;
        this.m_jointCount = 0;
    };
    b2Island.prototype.AddBody = function (body) {
        body.m_islandIndex = this.m_bodyCount;
        this.m_bodies[this.m_bodyCount++] = body;
    };
    b2Island.prototype.AddContact = function (contact) {
        this.m_contacts[this.m_contactCount++] = contact;
    };
    b2Island.prototype.AddJoint = function (joint) {
        this.m_joints[this.m_jointCount++] = joint;
    };
    b2Island.prototype.Solve = function (profile, step, gravity, allowSleep) {
        var timer = b2Island.s_timer.Reset();
        var h = step.dt;
        for (var i = 0; i < this.m_bodyCount; ++i) {
            var b = this.m_bodies[i];
            this.m_positions[i].c.Copy(b.m_sweep.c);
            var a = b.m_sweep.a;
            var v = this.m_velocities[i].v.Copy(b.m_linearVelocity);
            var w = b.m_angularVelocity;
            b.m_sweep.c0.Copy(b.m_sweep.c);
            b.m_sweep.a0 = b.m_sweep.a;
            if (b.m_type === b2BodyType.b2_dynamicBody) {
                v.x += h * b.m_invMass * (b.m_gravityScale * b.m_mass * gravity.x + b.m_force.x);
                v.y += h * b.m_invMass * (b.m_gravityScale * b.m_mass * gravity.y + b.m_force.y);
                w += h * b.m_invI * b.m_torque;
                v.SelfMul(1.0 / (1.0 + h * b.m_linearDamping));
                w *= 1.0 / (1.0 + h * b.m_angularDamping);
            }
            this.m_positions[i].a = a;
            this.m_velocities[i].w = w;
        }
        timer.Reset();
        var solverData = b2Island.s_solverData;
        solverData.step.Copy(step);
        solverData.positions = this.m_positions;
        solverData.velocities = this.m_velocities;
        var contactSolverDef = b2Island.s_contactSolverDef;
        contactSolverDef.step.Copy(step);
        contactSolverDef.contacts = this.m_contacts;
        contactSolverDef.count = this.m_contactCount;
        contactSolverDef.positions = this.m_positions;
        contactSolverDef.velocities = this.m_velocities;
        var contactSolver = b2Island.s_contactSolver.Initialize(contactSolverDef);
        contactSolver.InitializeVelocityConstraints();
        if (step.warmStarting) {
            contactSolver.WarmStart();
        }
        for (var i = 0; i < this.m_jointCount; ++i) {
            this.m_joints[i].InitVelocityConstraints(solverData);
        }
        profile.solveInit = timer.GetMilliseconds();
        timer.Reset();
        for (var i = 0; i < step.velocityIterations; ++i) {
            for (var j = 0; j < this.m_jointCount; ++j) {
                this.m_joints[j].SolveVelocityConstraints(solverData);
            }
            contactSolver.SolveVelocityConstraints();
        }
        contactSolver.StoreImpulses();
        profile.solveVelocity = timer.GetMilliseconds();
        for (var i = 0; i < this.m_bodyCount; ++i) {
            var c = this.m_positions[i].c;
            var a = this.m_positions[i].a;
            var v = this.m_velocities[i].v;
            var w = this.m_velocities[i].w;
            var translation = b2Vec2.MulSV(h, v, b2Island.s_translation);
            if (b2Vec2.DotVV(translation, translation) > b2_maxTranslationSquared) {
                var ratio = b2_maxTranslation / translation.Length();
                v.SelfMul(ratio);
            }
            var rotation = h * w;
            if (rotation * rotation > b2_maxRotationSquared) {
                var ratio = b2_maxRotation / b2Abs(rotation);
                w *= ratio;
            }
            c.x += h * v.x;
            c.y += h * v.y;
            a += h * w;
            this.m_positions[i].a = a;
            this.m_velocities[i].w = w;
        }
        timer.Reset();
        var positionSolved = false;
        for (var i = 0; i < step.positionIterations; ++i) {
            var contactsOkay = contactSolver.SolvePositionConstraints();
            var jointsOkay = true;
            for (var j = 0; j < this.m_jointCount; ++j) {
                var jointOkay = this.m_joints[j].SolvePositionConstraints(solverData);
                jointsOkay = jointsOkay && jointOkay;
            }
            if (contactsOkay && jointsOkay) {
                positionSolved = true;
                break;
            }
        }
        for (var i = 0; i < this.m_bodyCount; ++i) {
            var body = this.m_bodies[i];
            body.m_sweep.c.Copy(this.m_positions[i].c);
            body.m_sweep.a = this.m_positions[i].a;
            body.m_linearVelocity.Copy(this.m_velocities[i].v);
            body.m_angularVelocity = this.m_velocities[i].w;
            body.SynchronizeTransform();
        }
        profile.solvePosition = timer.GetMilliseconds();
        this.Report(contactSolver.m_velocityConstraints);
        if (allowSleep) {
            var minSleepTime = b2_maxFloat;
            var linTolSqr = b2_linearSleepTolerance * b2_linearSleepTolerance;
            var angTolSqr = b2_angularSleepTolerance * b2_angularSleepTolerance;
            for (var i = 0; i < this.m_bodyCount; ++i) {
                var b = this.m_bodies[i];
                if (b.GetType() === b2BodyType.b2_staticBody) {
                    continue;
                }
                if (!b.m_autoSleepFlag ||
                    b.m_angularVelocity * b.m_angularVelocity > angTolSqr ||
                    b2Vec2.DotVV(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
                    b.m_sleepTime = 0;
                    minSleepTime = 0;
                }
                else {
                    b.m_sleepTime += h;
                    minSleepTime = b2Min(minSleepTime, b.m_sleepTime);
                }
            }
            if (minSleepTime >= b2_timeToSleep && positionSolved) {
                for (var i = 0; i < this.m_bodyCount; ++i) {
                    var b = this.m_bodies[i];
                    b.SetAwake(false);
                }
            }
        }
    };
    b2Island.prototype.SolveTOI = function (subStep, toiIndexA, toiIndexB) {
        for (var i = 0; i < this.m_bodyCount; ++i) {
            var b = this.m_bodies[i];
            this.m_positions[i].c.Copy(b.m_sweep.c);
            this.m_positions[i].a = b.m_sweep.a;
            this.m_velocities[i].v.Copy(b.m_linearVelocity);
            this.m_velocities[i].w = b.m_angularVelocity;
        }
        var contactSolverDef = b2Island.s_contactSolverDef;
        contactSolverDef.contacts = this.m_contacts;
        contactSolverDef.count = this.m_contactCount;
        contactSolverDef.step.Copy(subStep);
        contactSolverDef.positions = this.m_positions;
        contactSolverDef.velocities = this.m_velocities;
        var contactSolver = b2Island.s_contactSolver.Initialize(contactSolverDef);
        for (var i = 0; i < subStep.positionIterations; ++i) {
            var contactsOkay = contactSolver.SolveTOIPositionConstraints(toiIndexA, toiIndexB);
            if (contactsOkay) {
                break;
            }
        }
        this.m_bodies[toiIndexA].m_sweep.c0.Copy(this.m_positions[toiIndexA].c);
        this.m_bodies[toiIndexA].m_sweep.a0 = this.m_positions[toiIndexA].a;
        this.m_bodies[toiIndexB].m_sweep.c0.Copy(this.m_positions[toiIndexB].c);
        this.m_bodies[toiIndexB].m_sweep.a0 = this.m_positions[toiIndexB].a;
        contactSolver.InitializeVelocityConstraints();
        for (var i = 0; i < subStep.velocityIterations; ++i) {
            contactSolver.SolveVelocityConstraints();
        }
        var h = subStep.dt;
        for (var i = 0; i < this.m_bodyCount; ++i) {
            var c = this.m_positions[i].c;
            var a = this.m_positions[i].a;
            var v = this.m_velocities[i].v;
            var w = this.m_velocities[i].w;
            var translation = b2Vec2.MulSV(h, v, b2Island.s_translation);
            if (b2Vec2.DotVV(translation, translation) > b2_maxTranslationSquared) {
                var ratio = b2_maxTranslation / translation.Length();
                v.SelfMul(ratio);
            }
            var rotation = h * w;
            if (rotation * rotation > b2_maxRotationSquared) {
                var ratio = b2_maxRotation / b2Abs(rotation);
                w *= ratio;
            }
            c.SelfMulAdd(h, v);
            a += h * w;
            this.m_positions[i].a = a;
            this.m_velocities[i].w = w;
            var body = this.m_bodies[i];
            body.m_sweep.c.Copy(c);
            body.m_sweep.a = a;
            body.m_linearVelocity.Copy(v);
            body.m_angularVelocity = w;
            body.SynchronizeTransform();
        }
        this.Report(contactSolver.m_velocityConstraints);
    };
    b2Island.prototype.Report = function (constraints) {
        if (this.m_listener === null) {
            return;
        }
        for (var i = 0; i < this.m_contactCount; ++i) {
            var c = this.m_contacts[i];
            if (!c) {
                continue;
            }
            var vc = constraints[i];
            var impulse = b2Island.s_impulse;
            impulse.count = vc.pointCount;
            for (var j = 0; j < vc.pointCount; ++j) {
                impulse.normalImpulses[j] = vc.points[j].normalImpulse;
                impulse.tangentImpulses[j] = vc.points[j].tangentImpulse;
            }
            this.m_listener.PostSolve(c, impulse);
        }
    };
    b2Island.s_timer = new b2Timer();
    b2Island.s_solverData = new b2SolverData();
    b2Island.s_contactSolverDef = new b2ContactSolverDef();
    b2Island.s_contactSolver = new b2ContactSolver();
    b2Island.s_translation = new b2Vec2();
    b2Island.s_impulse = new b2ContactImpulse();
    return b2Island;
}());
//# sourceMappingURL=b2_island.js.map