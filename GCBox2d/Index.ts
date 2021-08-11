enum b2StretchingModel {
  b2_pbdStretchingModel,
  b2_xpbdStretchingModel,
}

 enum b2BendingModel {
  b2_springAngleBendingModel = 0,
  b2_pbdAngleBendingModel,
  b2_xpbdAngleBendingModel,
  b2_pbdDistanceBendingModel,
  b2_pbdHeightBendingModel,
  b2_pbdTriangleBendingModel,
}

///
 class b2RopeTuning {
  public stretchingModel: b2StretchingModel = b2StretchingModel.b2_pbdStretchingModel;
  public bendingModel: b2BendingModel = b2BendingModel.b2_pbdAngleBendingModel;
  public damping: number = 0.0;
  public stretchStiffness: number = 1.0;
  public stretchHertz: number = 0.0;
  public stretchDamping: number = 0.0;
  public bendStiffness: number = 0.5;
  public bendHertz: number = 1.0;
  public bendDamping: number = 0.0;
  public isometric: boolean = false;
  public fixedEffectiveMass: boolean = false;
  public warmStart: boolean = false;

  public Copy(other: b2RopeTuning): this {
    this.stretchingModel = other.stretchingModel;
    this.bendingModel = other.bendingModel;
    this.damping = other.damping;
    this.stretchStiffness = other.stretchStiffness;
    this.stretchHertz = other.stretchHertz;
    this.stretchDamping = other.stretchDamping;
    this.bendStiffness = other.bendStiffness;
    this.bendHertz = other.bendHertz;
    this.bendDamping = other.bendDamping;
    this.isometric = other.isometric;
    this.fixedEffectiveMass = other.fixedEffectiveMass;
    this.warmStart = other.warmStart;
    return this;
  }
}

///
 class b2RopeDef {
  public  position: b2Vec2 = new b2Vec2();
  // b2Vec2* vertices;
  public  vertices: b2Vec2[] = [];
  // int32 count;
  public count: number = 0;
  // float* masses;
  public  masses: number[] = [];
  // b2Vec2 gravity;
  public  gravity: b2Vec2 = new b2Vec2();
  // b2RopeTuning tuning;
  public  tuning: b2RopeTuning = new b2RopeTuning();
}

class b2RopeStretch {
  public i1: number = 0;
  public i2: number = 0;
  public invMass1: number = 0.0;
  public invMass2: number = 0.0;
  public L: number = 0.0;
  public lambda: number = 0.0;
  public spring: number = 0.0;
  public damper: number = 0.0;
}

class b2RopeBend {
  public i1: number = 0;
  public i2: number = 0;
  public i3: number = 0;
  public invMass1: number = 0.0;
  public invMass2: number = 0.0;
  public invMass3: number = 0.0;
  public invEffectiveMass: number = 0.0;
  public lambda: number = 0.0;
  public L1: number = 0.0;
  public L2: number = 0.0;
  public alpha1: number = 0.0;
  public alpha2: number = 0.0;
  public spring: number = 0.0;
  public damper: number = 0.0;
}

///
 class b2Rope {
  private  m_position: b2Vec2 = new b2Vec2();

  private m_count: number = 0;
  private m_stretchCount: number = 0;
  private m_bendCount: number = 0;

  // b2RopeStretch* m_stretchConstraints;
  private  m_stretchConstraints: b2RopeStretch[] = [];
  // b2RopeBend* m_bendConstraints;
  private  m_bendConstraints: b2RopeBend[] = [];

  // b2Vec2* m_bindPositions;
  private  m_bindPositions: b2Vec2[] = [];
  // b2Vec2* m_ps;
  private  m_ps: b2Vec2[] = [];
  // b2Vec2* m_p0s;
  private  m_p0s: b2Vec2[] = [];
  // b2Vec2* m_vs;
  private  m_vs: b2Vec2[] = [];

  // float* m_invMasses;
  private  m_invMasses: number[] = [];
  // b2Vec2 m_gravity;
  private  m_gravity: b2Vec2 = new b2Vec2();

  private  m_tuning: b2RopeTuning = new b2RopeTuning();

  public Create(def: b2RopeDef): void {
    // b2Assert(def.count >= 3);
    this.m_position.Copy(def.position);
    this.m_count = def.count;
    function make_array<T>(array: T[], count: number, make: (index: number) => T): void {
      for (let index = 0; index < count; ++index) {
        array[index] = make(index);
      }
    }
    // this.m_bindPositions = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
    make_array(this.m_bindPositions, this.m_count, () => new b2Vec2());
    // this.m_ps = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
    make_array(this.m_ps, this.m_count, () => new b2Vec2());
    // this.m_p0s = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
    make_array(this.m_p0s, this.m_count, () => new b2Vec2());
    // this.m_vs = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
    make_array(this.m_vs, this.m_count, () => new b2Vec2());
    // this.m_invMasses = (float*)b2Alloc(this.m_count * sizeof(float));
    make_array(this.m_invMasses, this.m_count, () => 0.0);

    for (let i = 0; i < this.m_count; ++i) {
      this.m_bindPositions[i].Copy(def.vertices[i]);
      // this.m_ps[i] = def.vertices[i] + this.m_position;
      this.m_ps[i].Copy(def.vertices[i]).SelfAdd(this.m_position);
      // this.m_p0s[i] = def.vertices[i] + this.m_position;
      this.m_p0s[i].Copy(def.vertices[i]).SelfAdd(this.m_position);
      this.m_vs[i].SetZero();

      const m: number = def.masses[i];
      if (m > 0.0) {
        this.m_invMasses[i] = 1.0 / m;
      } else {
        this.m_invMasses[i] = 0.0;
      }
    }

    this.m_stretchCount = this.m_count - 1;
    this.m_bendCount = this.m_count - 2;

    // this.m_stretchConstraints = (b2RopeStretch*)b2Alloc(this.m_stretchCount * sizeof(b2RopeStretch));
    make_array(this.m_stretchConstraints, this.m_stretchCount, () => new b2RopeStretch());
    // this.m_bendConstraints = (b2RopeBend*)b2Alloc(this.m_bendCount * sizeof(b2RopeBend));
    make_array(this.m_bendConstraints, this.m_bendCount, () => new b2RopeBend());

    for (let i = 0; i < this.m_stretchCount; ++i) {
      const c: b2RopeStretch = this.m_stretchConstraints[i];

      const p1: b2Vec2 = this.m_ps[i];
      const p2: b2Vec2 = this.m_ps[i + 1];

      c.i1 = i;
      c.i2 = i + 1;
      c.L = b2Vec2.DistanceVV(p1, p2);
      c.invMass1 = this.m_invMasses[i];
      c.invMass2 = this.m_invMasses[i + 1];
      c.lambda = 0.0;
      c.damper = 0.0;
      c.spring = 0.0;
    }

    for (let i = 0; i < this.m_bendCount; ++i) {
      const c: b2RopeBend = this.m_bendConstraints[i];

      const p1: b2Vec2 = this.m_ps[i];
      const p2: b2Vec2 = this.m_ps[i + 1];
      const p3: b2Vec2 = this.m_ps[i + 2];

      c.i1 = i;
      c.i2 = i + 1;
      c.i3 = i + 2;
      c.invMass1 = this.m_invMasses[i];
      c.invMass2 = this.m_invMasses[i + 1];
      c.invMass3 = this.m_invMasses[i + 2];
      c.invEffectiveMass = 0.0;
      c.L1 = b2Vec2.DistanceVV(p1, p2);
      c.L2 = b2Vec2.DistanceVV(p2, p3);
      c.lambda = 0.0;

      // Pre-compute effective mass (TODO use flattened config)
      const e1: b2Vec2 = b2Vec2.SubVV(p2, p1, new b2Vec2());
      const e2: b2Vec2 = b2Vec2.SubVV(p3, p2, new b2Vec2());
      const L1sqr: number = e1.LengthSquared();
      const L2sqr: number = e2.LengthSquared();

      if (L1sqr * L2sqr === 0.0) {
        continue;
      }

      // b2Vec2 Jd1 = (-1.0 / L1sqr) * e1.Skew();
      const Jd1: b2Vec2 = new b2Vec2().Copy(e1).SelfSkew().SelfMul(-1.0 / L1sqr);
      // b2Vec2 Jd2 = (1.0 / L2sqr) * e2.Skew();
      const Jd2: b2Vec2 = new b2Vec2().Copy(e2).SelfSkew().SelfMul(1.0 / L2sqr);

      // b2Vec2 J1 = -Jd1;
      const J1 = Jd1.Clone().SelfNeg();
      // b2Vec2 J2 = Jd1 - Jd2;
      const J2 = Jd1.Clone().SelfSub(Jd2);
      // b2Vec2 J3 = Jd2;
      const J3 = Jd2.Clone();

      c.invEffectiveMass = c.invMass1 * b2Vec2.DotVV(J1, J1) + c.invMass2 * b2Vec2.DotVV(J2, J2) + c.invMass3 * b2Vec2.DotVV(J3, J3);

      // b2Vec2 r = p3 - p1;
      const r: b2Vec2 = b2Vec2.SubVV(p3, p1, new b2Vec2());

      const rr: number = r.LengthSquared();
      if (rr === 0.0) {
        continue;
      }

      // a1 = h2 / (h1 + h2)
      // a2 = h1 / (h1 + h2)
      c.alpha1 = b2Vec2.DotVV(e2, r) / rr;
      c.alpha2 = b2Vec2.DotVV(e1, r) / rr;
    }

    this.m_gravity.Copy(def.gravity);

    this.SetTuning(def.tuning);
  }

  public SetTuning(tuning: b2RopeTuning): void {
    this.m_tuning.Copy(tuning);

    // Pre-compute spring and damper values based on tuning

    const bendOmega: number = 2.0 * b2_pi * this.m_tuning.bendHertz;

    for (let i = 0; i < this.m_bendCount; ++i) {
      const c: b2RopeBend = this.m_bendConstraints[i];

      const L1sqr: number = c.L1 * c.L1;
      const L2sqr: number = c.L2 * c.L2;

      if (L1sqr * L2sqr === 0.0) {
        c.spring = 0.0;
        c.damper = 0.0;
        continue;
      }

      // Flatten the triangle formed by the two edges
      const J2: number = 1.0 / c.L1 + 1.0 / c.L2;
      const sum: number = c.invMass1 / L1sqr + c.invMass2 * J2 * J2 + c.invMass3 / L2sqr;
      if (sum === 0.0) {
        c.spring = 0.0;
        c.damper = 0.0;
        continue;
      }

      const mass: number = 1.0 / sum;

      c.spring = mass * bendOmega * bendOmega;
      c.damper = 2.0 * mass * this.m_tuning.bendDamping * bendOmega;
    }

    const stretchOmega: number = 2.0 * b2_pi * this.m_tuning.stretchHertz;

    for (let i = 0; i < this.m_stretchCount; ++i) {
      const c: b2RopeStretch = this.m_stretchConstraints[i];

      const sum: number = c.invMass1 + c.invMass2;
      if (sum === 0.0) {
        continue;
      }

      const mass: number = 1.0 / sum;

      c.spring = mass * stretchOmega * stretchOmega;
      c.damper = 2.0 * mass * this.m_tuning.stretchDamping * stretchOmega;
    }
  }

  public Step(dt: number, iterations: number, position:b2Vec2): void {
    if (dt === 0.0) {
      return;
    }

    const inv_dt: number = 1.0 / dt;
    const d: number = Math.exp(- dt * this.m_tuning.damping);

    // Apply gravity and damping
    for (let i = 0; i < this.m_count; ++i) {
      if (this.m_invMasses[i] > 0.0) {
        // this.m_vs[i] *= d;
        this.m_vs[i].x *= d;
        this.m_vs[i].y *= d;
        // this.m_vs[i] += dt * this.m_gravity;
        this.m_vs[i].x += dt * this.m_gravity.x;
        this.m_vs[i].y += dt * this.m_gravity.y;
      }
      else {
        // this.m_vs[i] = inv_dt * (this.m_bindPositions[i] + position - this.m_p0s[i]);
        this.m_vs[i].x = inv_dt * (this.m_bindPositions[i].x + position.x - this.m_p0s[i].x);
        this.m_vs[i].y = inv_dt * (this.m_bindPositions[i].y + position.y - this.m_p0s[i].y);
      }
    }

    // Apply bending spring
    if (this.m_tuning.bendingModel === b2BendingModel.b2_springAngleBendingModel) {
      this.ApplyBendForces(dt);
    }

    for (let i = 0; i < this.m_bendCount; ++i) {
      this.m_bendConstraints[i].lambda = 0.0;
    }

    for (let i = 0; i < this.m_stretchCount; ++i) {
      this.m_stretchConstraints[i].lambda = 0.0;
    }

    // Update position
    for (let i = 0; i < this.m_count; ++i) {
      // this.m_ps[i] += dt * this.m_vs[i];
      this.m_ps[i].x += dt * this.m_vs[i].x;
      this.m_ps[i].y += dt * this.m_vs[i].y;
    }

    // Solve constraints
    for (let i = 0; i < iterations; ++i) {
      if (this.m_tuning.bendingModel === b2BendingModel.b2_pbdAngleBendingModel) {
        this.SolveBend_PBD_Angle();
      }
      else if (this.m_tuning.bendingModel === b2BendingModel.b2_xpbdAngleBendingModel) {
        this.SolveBend_XPBD_Angle(dt);
      }
      else if (this.m_tuning.bendingModel === b2BendingModel.b2_pbdDistanceBendingModel) {
        this.SolveBend_PBD_Distance();
      }
      else if (this.m_tuning.bendingModel === b2BendingModel.b2_pbdHeightBendingModel) {
        this.SolveBend_PBD_Height();
      }
      else if (this.m_tuning.bendingModel === b2BendingModel.b2_pbdTriangleBendingModel) {
        this.SolveBend_PBD_Triangle();
      }

      if (this.m_tuning.stretchingModel === b2StretchingModel.b2_pbdStretchingModel) {
        this.SolveStretch_PBD();
      }
      else if (this.m_tuning.stretchingModel === b2StretchingModel.b2_xpbdStretchingModel) {
        this.SolveStretch_XPBD(dt);
      }
    }

    // Constrain velocity
    for (let i = 0; i < this.m_count; ++i) {
      // this.m_vs[i] = inv_dt * (this.m_ps[i] - this.m_p0s[i]);
      this.m_vs[i].x = inv_dt * (this.m_ps[i].x - this.m_p0s[i].x);
      this.m_vs[i].y = inv_dt * (this.m_ps[i].y - this.m_p0s[i].y);
      this.m_p0s[i].Copy(this.m_ps[i]);
    }
  }

  public Reset(position:b2Vec2): void {
    this.m_position.Copy(position);

    for (let i = 0; i < this.m_count; ++i) {
      // this.m_ps[i] = this.m_bindPositions[i] + this.m_position;
      this.m_ps[i].x = this.m_bindPositions[i].x + this.m_position.x;
      this.m_ps[i].y = this.m_bindPositions[i].y + this.m_position.y;
      // this.m_p0s[i] = this.m_bindPositions[i] + this.m_position;
      this.m_p0s[i].x = this.m_bindPositions[i].x + this.m_position.x;
      this.m_p0s[i].y = this.m_bindPositions[i].y + this.m_position.y;
      this.m_vs[i].SetZero();
    }

    for (let i = 0; i < this.m_bendCount; ++i) {
      this.m_bendConstraints[i].lambda = 0.0;
    }

    for (let i = 0; i < this.m_stretchCount; ++i) {
      this.m_stretchConstraints[i].lambda = 0.0;
    }
  }

  public Draw(draw: b2Draw): void {
    const c: b2Color = new b2Color(0.4, 0.5, 0.7);
    const pg: b2Color = new b2Color(0.1, 0.8, 0.1);
    const pd: b2Color = new b2Color(0.7, 0.2, 0.4);

    for (let i = 0; i < this.m_count - 1; ++i) {
      draw.DrawSegment(this.m_ps[i], this.m_ps[i + 1], c);

      const pc: b2Color = this.m_invMasses[i] > 0.0 ? pd : pg;
      draw.DrawPoint(this.m_ps[i], 5.0, pc);
    }

    const pc: b2Color = this.m_invMasses[this.m_count - 1] > 0.0 ? pd : pg;
    draw.DrawPoint(this.m_ps[this.m_count - 1], 5.0, pc);
  }

  private SolveStretch_PBD(): void {
    const stiffness: number = this.m_tuning.stretchStiffness;

    for (let i = 0; i < this.m_stretchCount; ++i) {
      const c: b2RopeStretch = this.m_stretchConstraints[i];

      const p1: b2Vec2 = this.m_ps[c.i1].Clone();
      const p2: b2Vec2 = this.m_ps[c.i2].Clone();

      // b2Vec2 d = p2 - p1;
      const d: b2Vec2 = p2.Clone().SelfSub(p1);
      const L: number = d.Normalize();

      const sum: number = c.invMass1 + c.invMass2;
      if (sum === 0.0) {
        continue;
      }

      const s1: number = c.invMass1 / sum;
      const s2: number = c.invMass2 / sum;

      // p1 -= stiffness * s1 * (c.L - L) * d;
      p1.x -= stiffness * s1 * (c.L - L) * d.x;
      p1.y -= stiffness * s1 * (c.L - L) * d.y;
      // p2 += stiffness * s2 * (c.L - L) * d;
      p2.x += stiffness * s2 * (c.L - L) * d.x;
      p2.y += stiffness * s2 * (c.L - L) * d.y;

      this.m_ps[c.i1].Copy(p1);
      this.m_ps[c.i2].Copy(p2);
    }
  }

  private SolveStretch_XPBD(dt: number): void {
    // 	b2Assert(dt > 0.0);

    for (let i = 0; i < this.m_stretchCount; ++i) {
      const c: b2RopeStretch = this.m_stretchConstraints[i];

      const p1: b2Vec2 = this.m_ps[c.i1].Clone();
      const p2: b2Vec2 = this.m_ps[c.i2].Clone();

      const dp1: b2Vec2 = p1.Clone().SelfSub(this.m_p0s[c.i1]);
      const dp2: b2Vec2 = p2.Clone().SelfSub(this.m_p0s[c.i2]);

      // b2Vec2 u = p2 - p1;
      const u: b2Vec2 = p2.Clone().SelfSub(p1);
      const L: number = u.Normalize();

      // b2Vec2 J1 = -u;
      const J1: b2Vec2 = u.Clone().SelfNeg();
      // b2Vec2 J2 = u;
      const J2: b2Vec2 = u;

      const sum: number = c.invMass1 + c.invMass2;
      if (sum === 0.0) {
        continue;
      }

      const alpha: number = 1.0 / (c.spring * dt * dt);	// 1 / kg
      const beta: number = dt * dt * c.damper;				// kg * s
      const sigma: number = alpha * beta / dt;				// non-dimensional
      const C: number = L - c.L;

      // This is using the initial velocities
      const Cdot: number = b2Vec2.DotVV(J1, dp1) + b2Vec2.DotVV(J2, dp2);

      const B: number = C + alpha * c.lambda + sigma * Cdot;
      const sum2: number = (1.0 + sigma) * sum + alpha;

      const impulse: number = -B / sum2;

      // p1 += (c.invMass1 * impulse) * J1;
      p1.x += (c.invMass1 * impulse) * J1.x;
      p1.y += (c.invMass1 * impulse) * J1.y;
      // p2 += (c.invMass2 * impulse) * J2;
      p2.x += (c.invMass2 * impulse) * J2.x;
      p2.y += (c.invMass2 * impulse) * J2.y;

      this.m_ps[c.i1].Copy(p1);
      this.m_ps[c.i2].Copy(p2);
      c.lambda += impulse;
    }
  }

  private SolveBend_PBD_Angle(): void {
    const stiffness: number = this.m_tuning.bendStiffness;

    for (let i = 0; i < this.m_bendCount; ++i) {
      const c: b2RopeBend = this.m_bendConstraints[i];

      const p1: b2Vec2 = this.m_ps[c.i1];
      const p2: b2Vec2 = this.m_ps[c.i2];
      const p3: b2Vec2 = this.m_ps[c.i3];

      // b2Vec2 d1 = p2 - p1;
      const d1 = p2.Clone().SelfSub(p1);
      // b2Vec2 d2 = p3 - p2;
      const d2 = p3.Clone().SelfSub(p2);
      const a: number = b2Vec2.CrossVV(d1, d2);
      const b: number = b2Vec2.DotVV(d1, d2);

      const angle: number = b2Atan2(a, b);

      let L1sqr: number = 0.0, L2sqr: number = 0.0;

      if (this.m_tuning.isometric) {
        L1sqr = c.L1 * c.L1;
        L2sqr = c.L2 * c.L2;
      }
      else {
        L1sqr = d1.LengthSquared();
        L2sqr = d2.LengthSquared();
      }

      if (L1sqr * L2sqr === 0.0) {
        continue;
      }

      // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
      const Jd1: b2Vec2 = new b2Vec2().Copy(d1).SelfSkew().SelfMul(-1.0 / L1sqr);
      // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
      const Jd2: b2Vec2 = new b2Vec2().Copy(d2).SelfSkew().SelfMul(1.0 / L2sqr);

      // b2Vec2 J1 = -Jd1;
      const J1 = Jd1.Clone().SelfNeg();
      // b2Vec2 J2 = Jd1 - Jd2;
      const J2 = Jd1.Clone().SelfSub(Jd2);
      // b2Vec2 J3 = Jd2;
      const J3 = Jd2;

      let sum: number = 0.0;
      if (this.m_tuning.fixedEffectiveMass) {
        sum = c.invEffectiveMass;
      }
      else {
        sum = c.invMass1 * b2Vec2.DotVV(J1, J1) + c.invMass2 * b2Vec2.DotVV(J2, J2) + c.invMass3 * b2Vec2.DotVV(J3, J3);
      }

      if (sum === 0.0) {
        sum = c.invEffectiveMass;
      }

      const impulse: number = -stiffness * angle / sum;

      // p1 += (c.invMass1 * impulse) * J1;
      p1.x += (c.invMass1 * impulse) * J1.x;
      p1.y += (c.invMass1 * impulse) * J1.y;
      // p2 += (c.invMass2 * impulse) * J2;
      p2.x += (c.invMass2 * impulse) * J2.x;
      p2.y += (c.invMass2 * impulse) * J2.y;
      // p3 += (c.invMass3 * impulse) * J3;
      p3.x += (c.invMass3 * impulse) * J3.x;
      p3.y += (c.invMass3 * impulse) * J3.y;

      this.m_ps[c.i1].Copy(p1);
      this.m_ps[c.i2].Copy(p2);
      this.m_ps[c.i3].Copy(p3);
    }
  }

  private SolveBend_XPBD_Angle(dt: number): void {
    // b2Assert(dt > 0.0);

    for (let i = 0; i < this.m_bendCount; ++i) {
      const c: b2RopeBend = this.m_bendConstraints[i];

      const p1: b2Vec2 = this.m_ps[c.i1];
      const p2: b2Vec2 = this.m_ps[c.i2];
      const p3: b2Vec2 = this.m_ps[c.i3];

      const dp1: b2Vec2 = p1.Clone().SelfSub(this.m_p0s[c.i1]);
      const dp2: b2Vec2 = p2.Clone().SelfSub(this.m_p0s[c.i2]);
      const dp3: b2Vec2 = p3.Clone().SelfSub(this.m_p0s[c.i3]);

      // b2Vec2 d1 = p2 - p1;
      const d1 = p2.Clone().SelfSub(p1);
      // b2Vec2 d2 = p3 - p2;
      const d2 = p3.Clone().SelfSub(p2);

      let L1sqr: number, L2sqr: number;

      if (this.m_tuning.isometric) {
        L1sqr = c.L1 * c.L1;
        L2sqr = c.L2 * c.L2;
      }
      else {
        L1sqr = d1.LengthSquared();
        L2sqr = d2.LengthSquared();
      }

      if (L1sqr * L2sqr === 0.0) {
        continue;
      }

      const a: number = b2Vec2.CrossVV(d1, d2);
      const b: number = b2Vec2.DotVV(d1, d2);

      const angle: number = b2Atan2(a, b);

      // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
      // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();

      // b2Vec2 J1 = -Jd1;
      // b2Vec2 J2 = Jd1 - Jd2;
      // b2Vec2 J3 = Jd2;

      // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
      const Jd1: b2Vec2 = new b2Vec2().Copy(d1).SelfSkew().SelfMul(-1.0 / L1sqr);
      // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
      const Jd2: b2Vec2 = new b2Vec2().Copy(d2).SelfSkew().SelfMul(1.0 / L2sqr);

      // b2Vec2 J1 = -Jd1;
      const J1 = Jd1.Clone().SelfNeg();
      // b2Vec2 J2 = Jd1 - Jd2;
      const J2 = Jd1.Clone().SelfSub(Jd2);
      // b2Vec2 J3 = Jd2;
      const J3 = Jd2;

      let sum: number;
      if (this.m_tuning.fixedEffectiveMass) {
        sum = c.invEffectiveMass;
      }
      else {
        sum = c.invMass1 * b2Vec2.DotVV(J1, J1) + c.invMass2 * b2Vec2.DotVV(J2, J2) + c.invMass3 * b2Vec2.DotVV(J3, J3);
      }

      if (sum === 0.0) {
        continue;
      }

      const alpha: number = 1.0 / (c.spring * dt * dt);
      const beta: number = dt * dt * c.damper;
      const sigma: number = alpha * beta / dt;
      const C: number = angle;

      // This is using the initial velocities
      const Cdot: number = b2Vec2.DotVV(J1, dp1) + b2Vec2.DotVV(J2, dp2) + b2Vec2.DotVV(J3, dp3);

      const B: number = C + alpha * c.lambda + sigma * Cdot;
      const sum2: number = (1.0 + sigma) * sum + alpha;

      const impulse: number = -B / sum2;

      // p1 += (c.invMass1 * impulse) * J1;
      p1.x += (c.invMass1 * impulse) * J1.x;
      p1.y += (c.invMass1 * impulse) * J1.y;
      // p2 += (c.invMass2 * impulse) * J2;
      p2.x += (c.invMass2 * impulse) * J2.x;
      p2.y += (c.invMass2 * impulse) * J2.y;
      // p3 += (c.invMass3 * impulse) * J3;
      p3.x += (c.invMass3 * impulse) * J3.x;
      p3.y += (c.invMass3 * impulse) * J3.y;

      this.m_ps[c.i1].Copy(p1);
      this.m_ps[c.i2].Copy(p2);
      this.m_ps[c.i3].Copy(p3);
      c.lambda += impulse;
    }
  }

  private SolveBend_PBD_Distance(): void {
    const stiffness: number = this.m_tuning.bendStiffness;

    for (let i = 0; i < this.m_bendCount; ++i) {
      const c: b2RopeBend = this.m_bendConstraints[i];

      const i1: number = c.i1;
      const i2: number = c.i3;

      const p1: b2Vec2 = this.m_ps[i1].Clone();
      const p2: b2Vec2 = this.m_ps[i2].Clone();

      // b2Vec2 d = p2 - p1;
      const d = p2.Clone().SelfSub(p1);
      const L: number = d.Normalize();

      const sum: number = c.invMass1 + c.invMass3;
      if (sum === 0.0) {
        continue;
      }

      const s1: number = c.invMass1 / sum;
      const s2: number = c.invMass3 / sum;

      // p1 -= stiffness * s1 * (c.L1 + c.L2 - L) * d;
      p1.x -= stiffness * s1 * (c.L1 + c.L2 - L) * d.x;
      p1.y -= stiffness * s1 * (c.L1 + c.L2 - L) * d.y;
      // p2 += stiffness * s2 * (c.L1 + c.L2 - L) * d;
      p2.x += stiffness * s2 * (c.L1 + c.L2 - L) * d.x;
      p2.y += stiffness * s2 * (c.L1 + c.L2 - L) * d.y;

      this.m_ps[i1].Copy(p1);
      this.m_ps[i2].Copy(p2);
    }
  }

  private SolveBend_PBD_Height(): void {
    const stiffness: number = this.m_tuning.bendStiffness;

    for (let i = 0; i < this.m_bendCount; ++i) {
      const c: b2RopeBend = this.m_bendConstraints[i];

      const p1: b2Vec2 = this.m_ps[c.i1].Clone();
      const p2: b2Vec2 = this.m_ps[c.i2].Clone();
      const p3: b2Vec2 = this.m_ps[c.i3].Clone();

      // Barycentric coordinates are held constant
      const d = new b2Vec2();
      // b2Vec2 d = c.alpha1 * p1 + c.alpha2 * p3 - p2;
      d.x = c.alpha1 * p1.x + c.alpha2 * p3.x - p2.x;
      d.y = c.alpha1 * p1.y + c.alpha2 * p3.y - p2.y;
      const dLen: number = d.Length();

      if (dLen === 0.0) {
        continue;
      }

      // b2Vec2 dHat = (1.0 / dLen) * d;
      const dHat = d.Clone().SelfMul(1.0 / dLen);

      // b2Vec2 J1 = c.alpha1 * dHat;
      const J1 = dHat.Clone().SelfMul(c.alpha1);
      // b2Vec2 J2 = -dHat;
      const J2 = dHat.Clone().SelfNeg();
      // b2Vec2 J3 = c.alpha2 * dHat;
      const J3 = dHat.Clone().SelfMul(c.alpha2);

      const sum: number = c.invMass1 * c.alpha1 * c.alpha1 + c.invMass2 + c.invMass3 * c.alpha2 * c.alpha2;

      if (sum === 0.0) {
        continue;
      }

      const C: number = dLen;
      const mass: number = 1.0 / sum;
      const impulse: number = -stiffness * mass * C;

      // p1 += (c.invMass1 * impulse) * J1;
      p1.x += (c.invMass1 * impulse) * J1.x;
      p1.y += (c.invMass1 * impulse) * J1.y;
      // p2 += (c.invMass2 * impulse) * J2;
      p2.x += (c.invMass2 * impulse) * J2.x;
      p2.y += (c.invMass2 * impulse) * J2.y;
      // p3 += (c.invMass3 * impulse) * J3;
      p3.x += (c.invMass3 * impulse) * J3.x;
      p3.y += (c.invMass3 * impulse) * J3.y;

      this.m_ps[c.i1].Copy(p1);
      this.m_ps[c.i2].Copy(p2);
      this.m_ps[c.i3].Copy(p3);
    }
  }

  // M. Kelager: A Triangle Bending Constraint Model for PBD
  private SolveBend_PBD_Triangle(): void {
    const stiffness = this.m_tuning.bendStiffness;

    for (let i = 0; i < this.m_bendCount; ++i) {
      const c: b2RopeBend = this.m_bendConstraints[i];

      const b0 = this.m_ps[c.i1].Clone();
      const v = this.m_ps[c.i2].Clone();
      const b1 = this.m_ps[c.i3].Clone();

      const wb0 = c.invMass1;
      const wv = c.invMass2;
      const wb1 = c.invMass3;

      const W = wb0 + wb1 + 2.0 * wv;
      const invW = stiffness / W;

      const d = new b2Vec2();
      d.x = v.x - (1.0 / 3.0) * (b0.x + v.x + b1.x);
      d.y = v.y - (1.0 / 3.0) * (b0.y + v.y + b1.y);

      const db0 = new b2Vec2();
      db0.x = 2.0 * wb0 * invW * d.x;
      db0.y = 2.0 * wb0 * invW * d.y;
      const dv = new b2Vec2();
      dv.x = -4.0 * wv * invW * d.x;
      dv.y = -4.0 * wv * invW * d.y;
      const db1 = new b2Vec2();
      db1.x = 2.0 * wb1 * invW * d.x;
      db1.y = 2.0 * wb1 * invW * d.y;

      b0.SelfAdd(db0);
      v.SelfAdd(dv);
      b1.SelfAdd(db1);

      this.m_ps[c.i1].Copy(b0);
      this.m_ps[c.i2].Copy(v);
      this.m_ps[c.i3].Copy(b1);
    }
  }

  private ApplyBendForces(dt: number): void {
    // omega = 2 * pi * hz
    const omega: number = 2.0 * b2_pi * this.m_tuning.bendHertz;

    for (let i = 0; i < this.m_bendCount; ++i) {
      const c: b2RopeBend = this.m_bendConstraints[i];

      const p1: b2Vec2 = this.m_ps[c.i1].Clone();
      const p2: b2Vec2 = this.m_ps[c.i2].Clone();
      const p3: b2Vec2 = this.m_ps[c.i3].Clone();

      const v1: b2Vec2 = this.m_vs[c.i1];
      const v2: b2Vec2 = this.m_vs[c.i2];
      const v3: b2Vec2 = this.m_vs[c.i3];

      // b2Vec2 d1 = p2 - p1;
      const d1 = p1.Clone().SelfSub(p1);
      // b2Vec2 d2 = p3 - p2;
      const d2 = p3.Clone().SelfSub(p2);

      let L1sqr: number, L2sqr: number;

      if (this.m_tuning.isometric) {
        L1sqr = c.L1 * c.L1;
        L2sqr = c.L2 * c.L2;
      }
      else {
        L1sqr = d1.LengthSquared();
        L2sqr = d2.LengthSquared();
      }

      if (L1sqr * L2sqr === 0.0) {
        continue;
      }

      const a: number = b2Vec2.CrossVV(d1, d2);
      const b: number = b2Vec2.DotVV(d1, d2);

      const angle: number = b2Atan2(a, b);

      // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
      // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();

      // b2Vec2 J1 = -Jd1;
      // b2Vec2 J2 = Jd1 - Jd2;
      // b2Vec2 J3 = Jd2;

      // b2Vec2 Jd1 = (-1.0 / L1sqr) * d1.Skew();
      const Jd1: b2Vec2 = new b2Vec2().Copy(d1).SelfSkew().SelfMul(-1.0 / L1sqr);
      // b2Vec2 Jd2 = (1.0 / L2sqr) * d2.Skew();
      const Jd2: b2Vec2 = new b2Vec2().Copy(d2).SelfSkew().SelfMul(1.0 / L2sqr);

      // b2Vec2 J1 = -Jd1;
      const J1 = Jd1.Clone().SelfNeg();
      // b2Vec2 J2 = Jd1 - Jd2;
      const J2 = Jd1.Clone().SelfSub(Jd2);
      // b2Vec2 J3 = Jd2;
      const J3 = Jd2;

      let sum: number = 0.0;
      if (this.m_tuning.fixedEffectiveMass) {
        sum = c.invEffectiveMass;
      }
      else {
        sum = c.invMass1 * b2Vec2.DotVV(J1, J1) + c.invMass2 * b2Vec2.DotVV(J2, J2) + c.invMass3 * b2Vec2.DotVV(J3, J3);
      }

      if (sum === 0.0) {
        continue;
      }

      const mass: number = 1.0 / sum;

      const spring: number = mass * omega * omega;
      const damper: number = 2.0 * mass * this.m_tuning.bendDamping * omega;

      const C: number = angle;
      const Cdot: number = b2Vec2.DotVV(J1, v1) + b2Vec2.DotVV(J2, v2) + b2Vec2.DotVV(J3, v3);

      const impulse: number = -dt * (spring * C + damper * Cdot);

      // this.m_vs[c.i1] += (c.invMass1 * impulse) * J1;
      this.m_vs[c.i1].x += (c.invMass1 * impulse) * J1.x;
      this.m_vs[c.i1].y += (c.invMass1 * impulse) * J1.y;
      // this.m_vs[c.i2] += (c.invMass2 * impulse) * J2;
      this.m_vs[c.i2].x += (c.invMass2 * impulse) * J2.x;
      this.m_vs[c.i2].y += (c.invMass2 * impulse) * J2.y;
      // this.m_vs[c.i3] += (c.invMass3 * impulse) * J3;
      this.m_vs[c.i3].x += (c.invMass3 * impulse) * J3.x;
      this.m_vs[c.i3].y += (c.invMass3 * impulse) * J3.y;
    }
  }
}
/*
 * Copyright (c) 2013 Google, Inc.
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_PARTICLE

// DEBUG: 

 class b2StackQueue<T> {
  public  m_buffer: Array<T > = [];
  public m_front: number = 0;
  public m_back: number = 0;
  public get m_capacity(): number { return this.m_buffer.length; }
  constructor(capacity: number) {
    this.m_buffer.fill(null, 0, capacity);
  }
  public Push(item: T): void {
    if (this.m_back >= this.m_capacity) {
      for (let i = this.m_front; i < this.m_back; i++) {
        this.m_buffer[i - this.m_front] = this.m_buffer[i];
      }
      this.m_back -= this.m_front;
      this.m_front = 0;
    }
    this.m_buffer[this.m_back] = item;
    this.m_back++;
  }
  public Pop(): void {
    // DEBUG: b2Assert(this.m_front < this.m_back);
    this.m_buffer[this.m_front] = null;
    this.m_front++;
  }
  public Empty(): boolean {
    // DEBUG: b2Assert(this.m_front <= this.m_back);
    return this.m_front === this.m_back;
  }
  public Front(): T {
    const item = this.m_buffer[this.m_front];
    if (!item) { throw new Error(); }
    return item;
  }
}

// #endif
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/
class b2Pair<T> {
  constructor(public proxyA: b2TreeNode<T>, public proxyB: b2TreeNode<T>) { }
}

/// The broad-phase is used for computing pairs and performing volume queries and ray casts.
/// This broad-phase does not persist pairs. Instead, this reports potentially new pairs.
/// It is up to the client to consume the new pairs and to track subsequent overlap.
class b2BroadPhase<T> {
  public  m_tree: b2DynamicTree<T> = new b2DynamicTree<T>();
  public m_proxyCount: number = 0;
  // public m_moveCapacity: number = 16;
  public m_moveCount: number = 0;
  public  m_moveBuffer: Array<b2TreeNode<T> > = [];
  // public m_pairCapacity: number = 16;
  public m_pairCount: number = 0;
  public  m_pairBuffer: Array<b2Pair<T>> = [];
  // public m_queryProxyId: number = 0;

  /// Create a proxy with an initial AABB. Pairs are not reported until
  /// UpdatePairs is called.
  public CreateProxy(aabb: b2AABB, userData: T): b2TreeNode<T> {
    const proxy: b2TreeNode<T> = this.m_tree.CreateProxy(aabb, userData);
    ++this.m_proxyCount;
    this.BufferMove(proxy);
    return proxy;
  }

  /// Destroy a proxy. It is up to the client to remove any pairs.
  public DestroyProxy(proxy: b2TreeNode<T>): void {
    this.UnBufferMove(proxy);
    --this.m_proxyCount;
    this.m_tree.DestroyProxy(proxy);
  }

  /// Call MoveProxy as many times as you like, then when you are done
  /// call UpdatePairs to finalized the proxy pairs (for your time step).
  public MoveProxy(proxy: b2TreeNode<T>, aabb: b2AABB, displacement: b2Vec2): void {
    const buffer: boolean = this.m_tree.MoveProxy(proxy, aabb, displacement);
    if (buffer) {
      this.BufferMove(proxy);
    }
  }

  /// Call to trigger a re-processing of it's pairs on the next call to UpdatePairs.
  public TouchProxy(proxy: b2TreeNode<T>): void {
    this.BufferMove(proxy);
  }

  /// Get the fat AABB for a proxy.
  // public GetFatAABB(proxy: b2TreeNode<T>): b2AABB {
  //   return this.m_tree.GetFatAABB(proxy);
  // }

  /// Get user data from a proxy. Returns NULL if the id is invalid.
  // public GetUserData(proxy: b2TreeNode<T>): T {
  //   return this.m_tree.GetUserData(proxy);
  // }

  /// Test overlap of fat AABBs.
  // public TestOverlap(proxyA: b2TreeNode<T>, proxyB: b2TreeNode<T>): boolean {
  //   const aabbA: b2AABB = this.m_tree.GetFatAABB(proxyA);
  //   const aabbB: b2AABB = this.m_tree.GetFatAABB(proxyB);
  //   return b2TestOverlapAABB(aabbA, aabbB);
  // }

  /// Get the number of proxies.
  public GetProxyCount(): number {
    return this.m_proxyCount;
  }

  /// Update the pairs. This results in pair callbacks. This can only add pairs.
  public UpdatePairs(callback: (a: T, b: T) => void): void {
    // Reset pair buffer
    this.m_pairCount = 0;

    // Perform tree queries for all moving proxies.
    for (let i: number = 0; i < this.m_moveCount; ++i) {
      const queryProxy: b2TreeNode<T>  = this.m_moveBuffer[i];
      if (queryProxy === null) {
        continue;
      }

      // This is called from b2.DynamicTree::Query when we are gathering pairs.
      // boolean b2BroadPhase::QueryCallback(int32 proxyId);

      // We have to query the tree with the fat AABB so that
      // we don't fail to create a pair that may touch later.
      const fatAABB: b2AABB = queryProxy.aabb; // this.m_tree.GetFatAABB(queryProxy);

      // Query tree, create pairs and add them pair buffer.
      this.m_tree.Query(fatAABB, (proxy: b2TreeNode<T>): boolean => {
        // A proxy cannot form a pair with itself.
        if (proxy.m_id === queryProxy.m_id) {
          return true;
        }

        const moved: boolean = proxy.moved; // this.m_tree.WasMoved(proxy);
        if (moved && proxy.m_id > queryProxy.m_id) {
          // Both proxies are moving. Avoid duplicate pairs.
          return true;
        }

        // const proxyA = proxy < queryProxy ? proxy : queryProxy;
        // const proxyB = proxy >= queryProxy ? proxy : queryProxy;
        let proxyA: b2TreeNode<T>;
        let proxyB: b2TreeNode<T>;
        if (proxy.m_id < queryProxy.m_id) {
          proxyA = proxy;
          proxyB = queryProxy;
        } else {
          proxyA = queryProxy;
          proxyB = proxy;
        }

        // Grow the pair buffer as needed.
        if (this.m_pairCount === this.m_pairBuffer.length) {
          this.m_pairBuffer[this.m_pairCount] = new b2Pair(proxyA, proxyB);
        } else {
          const pair: b2Pair<T> = this.m_pairBuffer[this.m_pairCount];
          pair.proxyA = proxyA;
          pair.proxyB = proxyB;
        }

        ++this.m_pairCount;

        return true;
      });
    }

    // Send pairs to caller
    for (let i = 0; i < this.m_pairCount; ++i) {
      const primaryPair: b2Pair<T> = this.m_pairBuffer[i];
      const userDataA: T = primaryPair.proxyA.userData; // this.m_tree.GetUserData(primaryPair.proxyA);
      const userDataB: T = primaryPair.proxyB.userData; // this.m_tree.GetUserData(primaryPair.proxyB);

      callback(userDataA, userDataB);
  }

    // Clear move flags
    for (let i = 0; i < this.m_moveCount; ++i) {
      const proxy: b2TreeNode<T>  = this.m_moveBuffer[i];
      if (proxy === null) {
        continue;
      }

      proxy.moved = false; // this.m_tree.ClearMoved(proxy);
    }

    // Reset move buffer
    this.m_moveCount = 0;
  }

  /// Query an AABB for overlapping proxies. The callback class
  /// is called for each proxy that overlaps the supplied AABB.
  public Query(aabb: b2AABB, callback: (node: b2TreeNode<T>) => boolean): void {
    this.m_tree.Query(aabb, callback);
  }

  public QueryPoint(point: XY, callback: (node: b2TreeNode<T>) => boolean): void {
    this.m_tree.QueryPoint(point, callback);
  }

  /// Ray-cast against the proxies in the tree. This relies on the callback
  /// to perform a exact ray-cast in the case were the proxy contains a shape.
  /// The callback also performs the any collision filtering. This has performance
  /// roughly equal to k * log(n), where k is the number of collisions and n is the
  /// number of proxies in the tree.
  /// @param input the ray-cast input data. The ray extends from p1 to p1 + maxFraction * (p2 - p1).
  /// @param callback a callback class that is called for each proxy that is hit by the ray.
  public RayCast(input: b2RayCastInput, callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number): void {
    this.m_tree.RayCast(input, callback);
  }

  /// Get the height of the embedded tree.
  public GetTreeHeight(): number {
    return this.m_tree.GetHeight();
  }

  /// Get the balance of the embedded tree.
  public GetTreeBalance(): number {
    return this.m_tree.GetMaxBalance();
  }

  /// Get the quality metric of the embedded tree.
  public GetTreeQuality(): number {
    return this.m_tree.GetAreaRatio();
  }

  /// Shift the world origin. Useful for large worlds.
  /// The shift formula is: position -= newOrigin
  /// @param newOrigin the new origin with respect to the old origin
  public ShiftOrigin(newOrigin: XY): void {
    this.m_tree.ShiftOrigin(newOrigin);
  }

  public BufferMove(proxy: b2TreeNode<T>): void {
    this.m_moveBuffer[this.m_moveCount] = proxy;
    ++this.m_moveCount;
  }

  public UnBufferMove(proxy: b2TreeNode<T>): void {
    const i: number = this.m_moveBuffer.indexOf(proxy);
    this.m_moveBuffer[i] = null;
  }
}
/*
* Copyright (c) 2006-2010 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 








/// A chain shape is a free form sequence of line segments.
/// The chain has one-sided collision, with the surface normal pointing to the right of the edge.
/// This provides a counter-clockwise winding like the polygon shape.
/// Connectivity information is used to create smooth collisions.
/// @warning the chain will not collide properly if there are self-intersections.
 class b2ChainShape extends b2Shape {
  public m_vertices: b2Vec2[] = [];
  public m_count: number = 0;
  public  m_prevVertex: b2Vec2 = new b2Vec2();
  public  m_nextVertex: b2Vec2 = new b2Vec2();

  constructor() {
    super(b2ShapeType.e_chainShape, b2_polygonRadius);
  }

  /// Create a loop. This automatically adjusts connectivity.
  /// @param vertices an array of vertices, these are copied
  /// @param count the vertex count
  public CreateLoop(vertices: XY[]): b2ChainShape;
  public CreateLoop(vertices: XY[], count: number): b2ChainShape;
  public CreateLoop(vertices: number[]): b2ChainShape;
  public CreateLoop(...args: any[]): b2ChainShape {
    if (typeof args[0][0] === "number") {
      const vertices: number[] = args[0];
      if (vertices.length % 2 !== 0) { throw new Error(); }
      return this._CreateLoop((index: number): XY => ({ x: vertices[index * 2], y: vertices[index * 2 + 1] }), vertices.length / 2);
    } else {
      const vertices: XY[] = args[0];
      const count: number = args[1] || vertices.length;
      return this._CreateLoop((index: number): XY => vertices[index], count);
    }
  }
  private _CreateLoop(vertices: (index: number) => XY, count: number): b2ChainShape {
    // DEBUG: b2Assert(count >= 3);
    if (count < 3) {
      return this;
    }
    // DEBUG: for (let i: number = 1; i < count; ++i) {
    // DEBUG:   const v1 = vertices[start + i - 1];
    // DEBUG:   const v2 = vertices[start + i];
    // DEBUG:   // If the code crashes here, it means your vertices are too close together.
    // DEBUG:   b2Assert(b2Vec2.DistanceSquaredVV(v1, v2) > b2_linearSlop * b2_linearSlop);
    // DEBUG: }

    this.m_count = count + 1;
    this.m_vertices = b2Vec2.MakeArray(this.m_count);
    for (let i: number = 0; i < count; ++i) {
      this.m_vertices[i].Copy(vertices(i));
    }
    this.m_vertices[count].Copy(this.m_vertices[0]);
    this.m_prevVertex.Copy(this.m_vertices[this.m_count - 2]);
    this.m_nextVertex.Copy(this.m_vertices[1]);
    return this;
  }

	/// Create a chain with ghost vertices to connect multiple chains together.
	/// @param vertices an array of vertices, these are copied
	/// @param count the vertex count
	/// @param prevVertex previous vertex from chain that connects to the start
	/// @param nextVertex next vertex from chain that connects to the end
  public CreateChain(vertices: XY[], prevVertex: XY, nextVertex: XY): b2ChainShape;
  public CreateChain(vertices: XY[], count: number, prevVertex: XY, nextVertex: XY): b2ChainShape;
  public CreateChain(vertices: number[], prevVertex: XY, nextVertex: XY): b2ChainShape;
  public CreateChain(...args: any[]): b2ChainShape {
    if (typeof args[0][0] === "number") {
      const vertices: number[] = args[0];
      const prevVertex: XY = args[1];
      const nextVertex: XY = args[2];
      if (vertices.length % 2 !== 0) { throw new Error(); }
      return this._CreateChain((index: number): XY => ({ x: vertices[index * 2], y: vertices[index * 2 + 1] }), vertices.length / 2, prevVertex, nextVertex);
    } else {
      const vertices: XY[] = args[0];
      const count: number = args[1] || vertices.length;
      const prevVertex: XY = args[2];
      const nextVertex: XY = args[3];
      return this._CreateChain((index: number): XY => vertices[index], count, prevVertex, nextVertex);
    }
  }
  private _CreateChain(vertices: (index: number) => XY, count: number, prevVertex: XY, nextVertex: XY): b2ChainShape {
    // DEBUG: b2Assert(count >= 2);
    // DEBUG: for (let i: number = 1; i < count; ++i) {
    // DEBUG:   const v1 = vertices[start + i - 1];
    // DEBUG:   const v2 = vertices[start + i];
    // DEBUG:   // If the code crashes here, it means your vertices are too close together.
    // DEBUG:   b2Assert(b2Vec2.DistanceSquaredVV(v1, v2) > b2_linearSlop * b2_linearSlop);
    // DEBUG: }

    this.m_count = count;
    this.m_vertices = b2Vec2.MakeArray(count);
    for (let i: number = 0; i < count; ++i) {
      this.m_vertices[i].Copy(vertices(i));
    }

    this.m_prevVertex.Copy(prevVertex);
    this.m_nextVertex.Copy(nextVertex);

    return this;
  }

  /// Implement b2Shape. Vertices are cloned using b2Alloc.
  public Clone(): b2ChainShape {
    return new b2ChainShape().Copy(this);
  }

  public Copy(other: b2ChainShape): b2ChainShape {
    super.Copy(other);

    // DEBUG: b2Assert(other instanceof b2ChainShape);

    this._CreateChain((index: number): XY => other.m_vertices[index], other.m_count, other.m_prevVertex, other.m_nextVertex);
    this.m_prevVertex.Copy(other.m_prevVertex);
    this.m_nextVertex.Copy(other.m_nextVertex);

    return this;
  }

  /// @see b2Shape::GetChildCount
  public GetChildCount(): number {
    // edge count = vertex count - 1
    return this.m_count - 1;
  }

  /// Get a child edge.
  public GetChildEdge(edge: b2EdgeShape, index: number): void {
    // DEBUG: b2Assert(0 <= index && index < this.m_count - 1);
    edge.m_radius = this.m_radius;

    edge.m_vertex1.Copy(this.m_vertices[index]);
    edge.m_vertex2.Copy(this.m_vertices[index + 1]);
    edge.m_oneSided = true;

    if (index > 0) {
      edge.m_vertex0.Copy(this.m_vertices[index - 1]);
    } else {
      edge.m_vertex0.Copy(this.m_prevVertex);
    }

    if (index < this.m_count - 2) {
      edge.m_vertex3.Copy(this.m_vertices[index + 2]);
    } else {
      edge.m_vertex3.Copy(this.m_nextVertex);
    }
  }

  /// This always return false.
  /// @see b2Shape::TestPoint
  public TestPoint(xf: b2Transform, p: XY): boolean {
    return false;
  }

  // #if B2_ENABLE_PARTICLE
  /// @see b2Shape::ComputeDistance
  private static ComputeDistance_s_edgeShape = new b2EdgeShape();
  public ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number {
    const edge = b2ChainShape.ComputeDistance_s_edgeShape;
    this.GetChildEdge(edge, childIndex);
    return edge.ComputeDistance(xf, p, normal, 0);
  }
  // #endif

  /// Implement b2Shape.
  private static RayCast_s_edgeShape = new b2EdgeShape();
  public RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean {
    // DEBUG: b2Assert(childIndex < this.m_count);

    const edgeShape: b2EdgeShape = b2ChainShape.RayCast_s_edgeShape;

    edgeShape.m_vertex1.Copy(this.m_vertices[childIndex]);
    edgeShape.m_vertex2.Copy(this.m_vertices[(childIndex + 1) % this.m_count]);

    return edgeShape.RayCast(output, input, xf, 0);
  }

  /// @see b2Shape::ComputeAABB
  private static ComputeAABB_s_v1 = new b2Vec2();
  private static ComputeAABB_s_v2 = new b2Vec2();
  private static ComputeAABB_s_lower = new b2Vec2();
  private static ComputeAABB_s_upper = new b2Vec2();
  public ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void {
    // DEBUG: b2Assert(childIndex < this.m_count);

    const vertexi1: b2Vec2 = this.m_vertices[childIndex];
    const vertexi2: b2Vec2 = this.m_vertices[(childIndex + 1) % this.m_count];

    const v1: b2Vec2 = b2Transform.MulXV(xf, vertexi1, b2ChainShape.ComputeAABB_s_v1);
    const v2: b2Vec2 = b2Transform.MulXV(xf, vertexi2, b2ChainShape.ComputeAABB_s_v2);

    const lower: b2Vec2 = b2Vec2.MinV(v1, v2, b2ChainShape.ComputeAABB_s_lower);
    const upper: b2Vec2 = b2Vec2.MaxV(v1, v2, b2ChainShape.ComputeAABB_s_upper);

    aabb.lowerBound.x = lower.x - this.m_radius;
    aabb.lowerBound.y = lower.y - this.m_radius;
    aabb.upperBound.x = upper.x + this.m_radius;
    aabb.upperBound.y = upper.y + this.m_radius;
  }

  /// Chains have zero mass.
  /// @see b2Shape::ComputeMass
  public ComputeMass(massData: b2MassData, density: number): void {
    massData.mass = 0;
    massData.center.SetZero();
    massData.I = 0;
  }

  public SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void {
    // DEBUG: b2Assert(0 <= index && index < this.m_count);

    proxy.m_vertices = proxy.m_buffer;
    proxy.m_vertices[0].Copy(this.m_vertices[index]);
    if (index + 1 < this.m_count) {
      proxy.m_vertices[1].Copy(this.m_vertices[index + 1]);
    } else {
      proxy.m_vertices[1].Copy(this.m_vertices[0]);
    }
    proxy.m_count = 2;
    proxy.m_radius = this.m_radius;
  }

  public ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number {
    c.SetZero();
    return 0;
  }

  public Dump(log: (format: string, ...args: any[]) => void): void {
    log("    const shape: b2ChainShape = new b2ChainShape();\n");
    log("    const vs: b2Vec2[] = [];\n");
    for (let i: number = 0; i < this.m_count; ++i) {
      log("    vs[%d] = new bVec2(%.15f, %.15f);\n", i, this.m_vertices[i].x, this.m_vertices[i].y);
    }
    log("    shape.CreateChain(vs, %d);\n", this.m_count);
    log("    shape.m_prevVertex.Set(%.15f, %.15f);\n", this.m_prevVertex.x, this.m_prevVertex.y);
    log("    shape.m_nextVertex.Set(%.15f, %.15f);\n", this.m_nextVertex.x, this.m_nextVertex.y);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 

/// A solid circle shape
 class b2CircleShape extends b2Shape {
  public  m_p: b2Vec2 = new b2Vec2();

  constructor(radius: number = 0) {
    super(b2ShapeType.e_circleShape, radius);
  }

  public Set(position: XY, radius: number = this.m_radius): this {
    this.m_p.Copy(position);
    this.m_radius = radius;
    return this;
  }

  /// Implement b2Shape.
  public Clone(): b2CircleShape {
    return new b2CircleShape().Copy(this);
  }

  public Copy(other: b2CircleShape): b2CircleShape {
    super.Copy(other);

    // DEBUG: b2Assert(other instanceof b2CircleShape);

    this.m_p.Copy(other.m_p);
    return this;
  }

  /// @see b2Shape::GetChildCount
  public GetChildCount(): number {
    return 1;
  }

  /// Implement b2Shape.
  private static TestPoint_s_center = new b2Vec2();
  private static TestPoint_s_d = new b2Vec2();
  public TestPoint(transform: b2Transform, p: XY): boolean {
    const center: b2Vec2 = b2Transform.MulXV(transform, this.m_p, b2CircleShape.TestPoint_s_center);
    const d: b2Vec2 = b2Vec2.SubVV(p, center, b2CircleShape.TestPoint_s_d);
    return b2Vec2.DotVV(d, d) <= b2Sq(this.m_radius);
  }

  // #if B2_ENABLE_PARTICLE
  /// @see b2Shape::ComputeDistance
  private static ComputeDistance_s_center = new b2Vec2();
  public ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number {
    const center = b2Transform.MulXV(xf, this.m_p, b2CircleShape.ComputeDistance_s_center);
    b2Vec2.SubVV(p, center, normal);
    return normal.Normalize() - this.m_radius;
  }
  // #endif

  /// Implement b2Shape.
	/// @note because the circle is solid, rays that start inside do not hit because the normal is
	/// not defined.
  // Collision Detection in Interactive 3D Environments by Gino van den Bergen
  // From Section 3.1.2
  // x = s + a * r
  // norm(x) = radius
  private static RayCast_s_position = new b2Vec2();
  private static RayCast_s_s = new b2Vec2();
  private static RayCast_s_r = new b2Vec2();
  public RayCast(output: b2RayCastOutput, input: b2RayCastInput, transform: b2Transform, childIndex: number): boolean {
    const position: b2Vec2 = b2Transform.MulXV(transform, this.m_p, b2CircleShape.RayCast_s_position);
    const s: b2Vec2 = b2Vec2.SubVV(input.p1, position, b2CircleShape.RayCast_s_s);
    const b: number = b2Vec2.DotVV(s, s) - b2Sq(this.m_radius);

    // Solve quadratic equation.
    const r: b2Vec2 = b2Vec2.SubVV(input.p2, input.p1, b2CircleShape.RayCast_s_r);
    const c: number = b2Vec2.DotVV(s, r);
    const rr: number = b2Vec2.DotVV(r, r);
    const sigma = c * c - rr * b;

    // Check for negative discriminant and short segment.
    if (sigma < 0 || rr < b2_epsilon) {
      return false;
    }

    // Find the point of intersection of the line with the circle.
    let a: number = (-(c + b2Sqrt(sigma)));

    // Is the intersection point on the segment?
    if (0 <= a && a <= input.maxFraction * rr) {
      a /= rr;
      output.fraction = a;
      b2Vec2.AddVMulSV(s, a, r, output.normal).SelfNormalize();
      return true;
    }

    return false;
  }

  /// @see b2Shape::ComputeAABB
  private static ComputeAABB_s_p = new b2Vec2();
  public ComputeAABB(aabb: b2AABB, transform: b2Transform, childIndex: number): void {
    const p: b2Vec2 = b2Transform.MulXV(transform, this.m_p, b2CircleShape.ComputeAABB_s_p);
    aabb.lowerBound.Set(p.x - this.m_radius, p.y - this.m_radius);
    aabb.upperBound.Set(p.x + this.m_radius, p.y + this.m_radius);
  }

  /// @see b2Shape::ComputeMass
  public ComputeMass(massData: b2MassData, density: number): void {
    const radius_sq: number = b2Sq(this.m_radius);
    massData.mass = density * b2_pi * radius_sq;
    massData.center.Copy(this.m_p);

    // inertia about the local origin
    massData.I = massData.mass * (0.5 * radius_sq + b2Vec2.DotVV(this.m_p, this.m_p));
  }

  public SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void {
    proxy.m_vertices = proxy.m_buffer;
    proxy.m_vertices[0].Copy(this.m_p);
    proxy.m_count = 1;
    proxy.m_radius = this.m_radius;
  }

  public ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number {
    const p: b2Vec2 = b2Transform.MulXV(xf, this.m_p, new b2Vec2());
    const l: number = (-(b2Vec2.DotVV(normal, p) - offset));

    if (l < (-this.m_radius) + b2_epsilon) {
      // Completely dry
      return 0;
    }
    if (l > this.m_radius) {
      // Completely wet
      c.Copy(p);
      return b2_pi * this.m_radius * this.m_radius;
    }

    // Magic
    const r2: number = this.m_radius * this.m_radius;
    const l2: number = l * l;
    const area: number = r2 * (b2Asin(l / this.m_radius) + b2_pi / 2) + l * b2Sqrt(r2 - l2);
    const com: number = (-2 / 3 * b2Pow(r2 - l2, 1.5) / area);

    c.x = p.x + normal.x * com;
    c.y = p.y + normal.y * com;

    return area;
  }

  public Dump(log: (format: string, ...args: any[]) => void): void {
    log("    const shape: b2CircleShape = new b2CircleShape();\n");
    log("    shape.m_radius = %.15f;\n", this.m_radius);
    log("    shape.m_p.Set(%.15f, %.15f);\n", this.m_p.x, this.m_p.y);
  }
}



/// A 2D column vector.
 class b2Vec2 implements XY {
  public static  ZERO:b2Vec2 = new b2Vec2(0, 0);
  public static  UNITX:b2Vec2 = new b2Vec2(1, 0);
  public static  UNITY:b2Vec2 = new b2Vec2(0, 1);

  public static  s_t0: b2Vec2 = new b2Vec2();
  public static  s_t1: b2Vec2 = new b2Vec2();
  public static  s_t2: b2Vec2 = new b2Vec2();
  public static  s_t3: b2Vec2 = new b2Vec2();

  public constructor(public x: number = 0, public y: number = 0) {}

  public Clone(): b2Vec2 {
    return new b2Vec2(this.x, this.y);
  }

  public SetZero(): this {
    this.x = 0;
    this.y = 0;
    return this;
  }

  public Set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  public Copy(other: XY): this {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  public SelfAdd(v: XY): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public SelfAddXY(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  public SelfSub(v: XY): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public SelfSubXY(x: number, y: number): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  public SelfMul(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  public SelfMulAdd(s: number, v: XY): this {
    this.x += s * v.x;
    this.y += s * v.y;
    return this;
  }

  public SelfMulSub(s: number, v: XY): this {
    this.x -= s * v.x;
    this.y -= s * v.y;
    return this;
  }

  public Dot(v: XY): number {
    return this.x * v.x + this.y * v.y;
  }

  public Cross(v: XY): number {
    return this.x * v.y - this.y * v.x;
  }

  public Length(): number {
    const x: number = this.x, y: number = this.y;
    return Math.sqrt(x * x + y * y);
  }

  public LengthSquared(): number {
    const x: number = this.x, y: number = this.y;
    return (x * x + y * y);
  }

  public Normalize(): number {
    const length: number = this.Length();
    if (length >= b2_epsilon) {
      const inv_length: number = 1 / length;
      this.x *= inv_length;
      this.y *= inv_length;
    }
    return length;
  }

  public SelfNormalize(): this {
    const length: number = this.Length();
    if (length >= b2_epsilon) {
      const inv_length: number = 1 / length;
      this.x *= inv_length;
      this.y *= inv_length;
    }
    return this;
  }

  public SelfRotate(radians: number): this {
    const c: number = Math.cos(radians);
    const s: number = Math.sin(radians);
    const x: number = this.x;
    this.x = c * x - s * this.y;
    this.y = s * x + c * this.y;
    return this;
  }

  public SelfRotateCosSin(c: number, s: number): this {
    const x: number = this.x;
    this.x = c * x - s * this.y;
    this.y = s * x + c * this.y;
    return this;
  }

  public IsValid(): boolean {
    return isFinite(this.x) && isFinite(this.y);
  }

  public SelfCrossVS(s: number): this {
    const x: number = this.x;
    this.x =  s * this.y;
    this.y = -s * x;
    return this;
  }

  public SelfCrossSV(s: number): this {
    const x: number = this.x;
    this.x = -s * this.y;
    this.y =  s * x;
    return this;
  }

  public SelfMinV(v: XY): this {
    this.x = b2Min(this.x, v.x);
    this.y = b2Min(this.y, v.y);
    return this;
  }

  public SelfMaxV(v: XY): this {
    this.x = b2Max(this.x, v.x);
    this.y = b2Max(this.y, v.y);
    return this;
  }

  public SelfAbs(): this {
    this.x = b2Abs(this.x);
    this.y = b2Abs(this.y);
    return this;
  }

  public SelfNeg(): this {
    this.x = (-this.x);
    this.y = (-this.y);
    return this;
  }

  public SelfSkew(): this {
    const x: number = this.x;
    this.x = -this.y;
    this.y = x;
    return this;
  }

  public static MakeArray(length: number): b2Vec2[] {
    return b2MakeArray(length, (i: number): b2Vec2 => new b2Vec2());
  }

  public static AbsV<T extends XY>(v: XY, out: T): T {
    out.x = b2Abs(v.x);
    out.y = b2Abs(v.y);
    return out;
  }

  public static MinV<T extends XY>(a: XY, b: XY, out: T): T {
    out.x = b2Min(a.x, b.x);
    out.y = b2Min(a.y, b.y);
    return out;
  }

  public static MaxV<T extends XY>(a: XY, b: XY, out: T): T {
    out.x = b2Max(a.x, b.x);
    out.y = b2Max(a.y, b.y);
    return out;
  }

  public static ClampV<T extends XY>(v: XY, lo: XY, hi: XY, out: T): T {
    out.x = b2Clamp(v.x, lo.x, hi.x);
    out.y = b2Clamp(v.y, lo.y, hi.y);
    return out;
  }

  public static RotateV<T extends XY>(v: XY, radians: number, out: T): T {
    const v_x: number = v.x, v_y: number = v.y;
    const c: number = Math.cos(radians);
    const s: number = Math.sin(radians);
    out.x = c * v_x - s * v_y;
    out.y = s * v_x + c * v_y;
    return out;
  }

  public static DotVV(a: XY, b: XY): number {
    return a.x * b.x + a.y * b.y;
  }

  public static CrossVV(a: XY, b: XY): number {
    return a.x * b.y - a.y * b.x;
  }

  public static CrossVS<T extends XY>(v: XY, s: number, out: T): T {
    const v_x: number = v.x;
    out.x =  s * v.y;
    out.y = -s * v_x;
    return out;
  }

  public static CrossVOne<T extends XY>(v: XY, out: T): T {
    const v_x: number = v.x;
    out.x =  v.y;
    out.y = -v_x;
    return out;
  }

  public static CrossSV<T extends XY>(s: number, v: XY, out: T): T {
    const v_x: number = v.x;
    out.x = -s * v.y;
    out.y =  s * v_x;
    return out;
  }

  public static CrossOneV<T extends XY>(v: XY, out: T): T {
    const v_x: number = v.x;
    out.x = -v.y;
    out.y =  v_x;
    return out;
  }

  public static AddVV<T extends XY>(a: XY, b: XY, out: T): T { out.x = a.x + b.x; out.y = a.y + b.y; return out; }

  public static SubVV<T extends XY>(a: XY, b: XY, out: T): T { out.x = a.x - b.x; out.y = a.y - b.y; return out; }

  public static MulSV<T extends XY>(s: number, v: XY, out: T): T { out.x = v.x * s; out.y = v.y * s; return out; }
  public static MulVS<T extends XY>(v: XY, s: number, out: T): T { out.x = v.x * s; out.y = v.y * s; return out; }

  public static AddVMulSV<T extends XY>(a: XY, s: number, b: XY, out: T): T { out.x = a.x + (s * b.x); out.y = a.y + (s * b.y); return out; }
  public static SubVMulSV<T extends XY>(a: XY, s: number, b: XY, out: T): T { out.x = a.x - (s * b.x); out.y = a.y - (s * b.y); return out; }

  public static AddVCrossSV<T extends XY>(a: XY, s: number, v: XY, out: T): T {
    const v_x: number = v.x;
    out.x = a.x - (s * v.y);
    out.y = a.y + (s * v_x);
    return out;
  }

  public static MidVV<T extends XY>(a: XY, b: XY, out: T): T { out.x = (a.x + b.x) * 0.5; out.y = (a.y + b.y) * 0.5; return out; }

  public static ExtVV<T extends XY>(a: XY, b: XY, out: T): T { out.x = (b.x - a.x) * 0.5; out.y = (b.y - a.y) * 0.5; return out; }

  public static IsEqualToV(a: XY, b: XY): boolean {
    return a.x === b.x && a.y === b.y;
  }

  public static DistanceVV(a: XY, b: XY): number {
    const c_x: number = a.x - b.x;
    const c_y: number = a.y - b.y;
    return Math.sqrt(c_x * c_x + c_y * c_y);
  }

  public static DistanceSquaredVV(a: XY, b: XY): number {
    const c_x: number = a.x - b.x;
    const c_y: number = a.y - b.y;
    return (c_x * c_x + c_y * c_y);
  }

  public static NegV<T extends XY>(v: XY, out: T): T { out.x = -v.x; out.y = -v.y; return out; }

}

 const b2Vec2_zero:b2Vec2 = new b2Vec2(0, 0);





const b2CollideCircles_s_pA: b2Vec2 = new b2Vec2();
const b2CollideCircles_s_pB: b2Vec2 = new b2Vec2();
 function b2CollideCircles(manifold: b2Manifold, circleA: b2CircleShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void {
  manifold.pointCount = 0;

  const pA: b2Vec2 = b2Transform.MulXV(xfA, circleA.m_p, b2CollideCircles_s_pA);
  const pB: b2Vec2 = b2Transform.MulXV(xfB, circleB.m_p, b2CollideCircles_s_pB);

  const distSqr: number = b2Vec2.DistanceSquaredVV(pA, pB);
  const radius: number = circleA.m_radius + circleB.m_radius;
  if (distSqr > radius * radius) {
    return;
  }

  manifold.type = b2ManifoldType.e_circles;
  manifold.localPoint.Copy(circleA.m_p);
  manifold.localNormal.SetZero();
  manifold.pointCount = 1;

  manifold.points[0].localPoint.Copy(circleB.m_p);
  manifold.points[0].id.key = 0;
}

const b2CollidePolygonAndCircle_s_c: b2Vec2 = new b2Vec2();
const b2CollidePolygonAndCircle_s_cLocal: b2Vec2 = new b2Vec2();
const b2CollidePolygonAndCircle_s_faceCenter: b2Vec2 = new b2Vec2();
 function b2CollidePolygonAndCircle(manifold: b2Manifold, polygonA: b2PolygonShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void {
  manifold.pointCount = 0;

  // Compute circle position in the frame of the polygon.
  const c: b2Vec2 = b2Transform.MulXV(xfB, circleB.m_p, b2CollidePolygonAndCircle_s_c);
  const cLocal: b2Vec2 = b2Transform.MulTXV(xfA, c, b2CollidePolygonAndCircle_s_cLocal);

  // Find the min separating edge.
  let normalIndex: number = 0;
  let separation: number = (-b2_maxFloat);
  const radius: number = polygonA.m_radius + circleB.m_radius;
  const vertexCount: number = polygonA.m_count;
  const vertices: b2Vec2[] = polygonA.m_vertices;
  const normals: b2Vec2[] = polygonA.m_normals;

  for (let i: number = 0; i < vertexCount; ++i) {
    const s: number = b2Vec2.DotVV(normals[i], b2Vec2.SubVV(cLocal, vertices[i], b2Vec2.s_t0));

    if (s > radius) {
      // Early out.
      return;
    }

    if (s > separation) {
      separation = s;
      normalIndex = i;
    }
  }

  // Vertices that subtend the incident face.
  const vertIndex1: number = normalIndex;
  const vertIndex2: number = (vertIndex1 + 1) % vertexCount;
  const v1: b2Vec2 = vertices[vertIndex1];
  const v2: b2Vec2 = vertices[vertIndex2];

  // If the center is inside the polygon ...
  if (separation < b2_epsilon) {
    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_faceA;
    manifold.localNormal.Copy(normals[normalIndex]);
    b2Vec2.MidVV(v1, v2, manifold.localPoint);
    manifold.points[0].localPoint.Copy(circleB.m_p);
    manifold.points[0].id.key = 0;
    return;
  }

  // Compute barycentric coordinates
  const u1: number = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, v1, b2Vec2.s_t0), b2Vec2.SubVV(v2, v1, b2Vec2.s_t1));
  const u2: number = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, v2, b2Vec2.s_t0), b2Vec2.SubVV(v1, v2, b2Vec2.s_t1));
  if (u1 <= 0) {
    if (b2Vec2.DistanceSquaredVV(cLocal, v1) > radius * radius) {
      return;
    }

    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_faceA;
    b2Vec2.SubVV(cLocal, v1, manifold.localNormal).SelfNormalize();
    manifold.localPoint.Copy(v1);
    manifold.points[0].localPoint.Copy(circleB.m_p);
    manifold.points[0].id.key = 0;
  } else if (u2 <= 0) {
    if (b2Vec2.DistanceSquaredVV(cLocal, v2) > radius * radius) {
      return;
    }

    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_faceA;
    b2Vec2.SubVV(cLocal, v2, manifold.localNormal).SelfNormalize();
    manifold.localPoint.Copy(v2);
    manifold.points[0].localPoint.Copy(circleB.m_p);
    manifold.points[0].id.key = 0;
  } else {
    const faceCenter: b2Vec2 = b2Vec2.MidVV(v1, v2, b2CollidePolygonAndCircle_s_faceCenter);
    const separation = b2Vec2.DotVV(b2Vec2.SubVV(cLocal, faceCenter, b2Vec2.s_t1), normals[vertIndex1]);
    if (separation > radius) {
      return;
    }

    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_faceA;
    manifold.localNormal.Copy(normals[vertIndex1]).SelfNormalize();
    manifold.localPoint.Copy(faceCenter);
    manifold.points[0].localPoint.Copy(circleB.m_p);
    manifold.points[0].id.key = 0;
  }
}
// DEBUG: 

/// Rotation
class b2Rot {
  public static IDENTITY: b2Rot = new b2Rot();

  public s: number = 0;
  public c: number = 1;

  constructor(angle: number = 0) {
    if (angle) {
      this.s = Math.sin(angle);
      this.c = Math.cos(angle);
    }
  }

  public Clone(): b2Rot {
    return new b2Rot().Copy(this);
  }

  public Copy(other: b2Rot): this {
    this.s = other.s;
    this.c = other.c;
    return this;
  }

  public SetAngle(angle: number): this {
    this.s = Math.sin(angle);
    this.c = Math.cos(angle);
    return this;
  }

  public SetIdentity(): this {
    this.s = 0;
    this.c = 1;
    return this;
  }

  public GetAngle(): number {
    return Math.atan2(this.s, this.c);
  }

  public GetXAxis<T extends XY>(out: T): T {
    out.x = this.c;
    out.y = this.s;
    return out;
  }

  public GetYAxis<T extends XY>(out: T): T {
    out.x = -this.s;
    out.y = this.c;
    return out;
  }

  public static MulRR(q: b2Rot, r: b2Rot, out: b2Rot): b2Rot {
    // [qc -qs] * [rc -rs] = [qc*rc-qs*rs -qc*rs-qs*rc]
    // [qs  qc]   [rs  rc]   [qs*rc+qc*rs -qs*rs+qc*rc]
    // s = qs * rc + qc * rs
    // c = qc * rc - qs * rs
    const q_c: number = q.c, q_s: number = q.s;
    const r_c: number = r.c, r_s: number = r.s;
    out.s = q_s * r_c + q_c * r_s;
    out.c = q_c * r_c - q_s * r_s;
    return out;
  }

  public static MulTRR(q: b2Rot, r: b2Rot, out: b2Rot): b2Rot {
    // [ qc qs] * [rc -rs] = [qc*rc+qs*rs -qc*rs+qs*rc]
    // [-qs qc]   [rs  rc]   [-qs*rc+qc*rs qs*rs+qc*rc]
    // s = qc * rs - qs * rc
    // c = qc * rc + qs * rs
    const q_c: number = q.c, q_s: number = q.s;
    const r_c: number = r.c, r_s: number = r.s;
    out.s = q_c * r_s - q_s * r_c;
    out.c = q_c * r_c + q_s * r_s;
    return out;
  }

  public static MulRV<T extends XY>(q: b2Rot, v: XY, out: T): T {
    const q_c: number = q.c, q_s: number = q.s;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = q_c * v_x - q_s * v_y;
    out.y = q_s * v_x + q_c * v_y;
    return out;
  }

  public static MulTRV<T extends XY>(q: b2Rot, v: XY, out: T): T {
    const q_c: number = q.c, q_s: number = q.s;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = q_c * v_x + q_s * v_y;
    out.y = -q_s * v_x + q_c * v_y;
    return out;
  }
}

class b2Transform {
  public static IDENTITY: b2Transform = new b2Transform();

  public p: b2Vec2 = new b2Vec2();
  public q: b2Rot = new b2Rot();

  public Clone(): b2Transform {
    return new b2Transform().Copy(this);
  }

  public Copy(other: b2Transform): this {
    this.p.Copy(other.p);
    this.q.Copy(other.q);
    return this;
  }

  public SetIdentity(): this {
    this.p.SetZero();
    this.q.SetIdentity();
    return this;
  }

  public SetPositionRotation(position: XY, q: b2Rot): this {
    this.p.Copy(position);
    this.q.Copy(q);
    return this;
  }

  public SetPositionAngle(pos: XY, a: number): this {
    this.p.Copy(pos);
    this.q.SetAngle(a);
    return this;
  }

  public SetPosition(position: XY): this {
    this.p.Copy(position);
    return this;
  }

  public SetPositionXY(x: number, y: number): this {
    this.p.Set(x, y);
    return this;
  }

  public SetRotation(rotation: b2Rot): this {
    this.q.Copy(rotation);
    return this;
  }

  public SetRotationAngle(radians: number): this {
    this.q.SetAngle(radians);
    return this;
  }

  public GetPosition(): b2Vec2 {
    return this.p;
  }

  public GetRotation(): b2Rot {
    return this.q;
  }

  public GetRotationAngle(): number {
    return this.q.GetAngle();
  }

  public GetAngle(): number {
    return this.q.GetAngle();
  }

  public static MulXV<T extends XY>(T: b2Transform, v: XY, out: T): T {
    // float32 x = (T.q.c * v.x - T.q.s * v.y) + T.p.x;
    // float32 y = (T.q.s * v.x + T.q.c * v.y) + T.p.y;
    // return b2Vec2(x, y);
    const T_q_c: number = T.q.c, T_q_s: number = T.q.s;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = (T_q_c * v_x - T_q_s * v_y) + T.p.x;
    out.y = (T_q_s * v_x + T_q_c * v_y) + T.p.y;
    return out;
  }

  public static MulTXV<T extends XY>(T: b2Transform, v: XY, out: T): T {
    // float32 px = v.x - T.p.x;
    // float32 py = v.y - T.p.y;
    // float32 x = (T.q.c * px + T.q.s * py);
    // float32 y = (-T.q.s * px + T.q.c * py);
    // return b2Vec2(x, y);
    const T_q_c: number = T.q.c, T_q_s: number = T.q.s;
    const p_x: number = v.x - T.p.x;
    const p_y: number = v.y - T.p.y;
    out.x = (T_q_c * p_x + T_q_s * p_y);
    out.y = (-T_q_s * p_x + T_q_c * p_y);
    return out;
  }

  public static MulXX(A: b2Transform, B: b2Transform, out: b2Transform): b2Transform {
    b2Rot.MulRR(A.q, B.q, out.q);
    b2Vec2.AddVV(b2Rot.MulRV(A.q, B.p, out.p), A.p, out.p);
    return out;
  }

  public static MulTXX(A: b2Transform, B: b2Transform, out: b2Transform): b2Transform {
    b2Rot.MulTRR(A.q, B.q, out.q);
    b2Rot.MulTRV(A.q, b2Vec2.SubVV(B.p, A.p, out.p), out.p);
    return out;
  }

}

/// This describes the motion of a body/shape for TOI computation.
/// Shapes are defined with respect to the body origin, which may
/// no coincide with the center of mass. However, to support dynamics
/// we must interpolate the center of mass position.
class b2Sweep {
  public localCenter: b2Vec2 = new b2Vec2();
  public c0: b2Vec2 = new b2Vec2();
  public c: b2Vec2 = new b2Vec2();
  public a0: number = 0;
  public a: number = 0;
  public alpha0: number = 0;

  public Clone(): b2Sweep {
    return new b2Sweep().Copy(this);
  }

  public Copy(other: b2Sweep): this {
    this.localCenter.Copy(other.localCenter);
    this.c0.Copy(other.c0);
    this.c.Copy(other.c);
    this.a0 = other.a0;
    this.a = other.a;
    this.alpha0 = other.alpha0;
    return this;
  }

  // https://fgiesen.wordpress.com/2012/08/15/linear-interpolation-past-present-and-future/
  public GetTransform(xf: b2Transform, beta: number): b2Transform {
    xf.p.x = (1.0 - beta) * this.c0.x + beta * this.c.x;
    xf.p.y = (1.0 - beta) * this.c0.y + beta * this.c.y;
    const angle: number = (1.0 - beta) * this.a0 + beta * this.a;
    xf.q.SetAngle(angle);

    xf.p.SelfSub(b2Rot.MulRV(xf.q, this.localCenter, b2Vec2.s_t0));
    return xf;
  }

  public Advance(alpha: number): void {
    // DEBUG: b2Assert(this.alpha0 < 1);
    const beta: number = (alpha - this.alpha0) / (1 - this.alpha0);
    const one_minus_beta: number = (1 - beta);
    this.c0.x = one_minus_beta * this.c0.x + beta * this.c.x;
    this.c0.y = one_minus_beta * this.c0.y + beta * this.c.y;
    this.a0 = one_minus_beta * this.a0 + beta * this.a;
    this.alpha0 = alpha;
  }

  public Normalize(): void {
    const d: number = b2_two_pi * Math.floor(this.a0 / b2_two_pi);
    this.a0 -= d;
    this.a -= d;
  }
}


/// The features that intersect to form the contact point
/// This must be 4 bytes or less.
class b2ContactFeature {
  private _key: number = 0;
  private _key_invalid = false;
  private _indexA: number = 0;
  private _indexB: number = 0;
  private _typeA: b2ContactFeatureType = 0;
  private _typeB: b2ContactFeatureType = 0;

  public get key(): number {
    if (this._key_invalid) {
      this._key_invalid = false;
      this._key = this._indexA | (this._indexB << 8) | (this._typeA << 16) | (this._typeB << 24);
    }
    return this._key;
  }

  public set key(value: number) {
    this._key = value;
    this._key_invalid = false;
    this._indexA = this._key & 0xff;
    this._indexB = (this._key >> 8) & 0xff;
    this._typeA = (this._key >> 16) & 0xff;
    this._typeB = (this._key >> 24) & 0xff;
  }

  public get indexA(): number {
    return this._indexA;
  }

  public set indexA(value: number) {
    this._indexA = value;
    this._key_invalid = true;
  }

  public get indexB(): number {
    return this._indexB;
  }

  public set indexB(value: number) {
    this._indexB = value;
    this._key_invalid = true;
  }

  public get typeA(): number {
    return this._typeA;
  }

  public set typeA(value: number) {
    this._typeA = value;
    this._key_invalid = true;
  }

  public get typeB(): number {
    return this._typeB;
  }

  public set typeB(value: number) {
    this._typeB = value;
    this._key_invalid = true;
  }
}

class b2ContactID {
  public cf: b2ContactFeature = new b2ContactFeature();

  public Copy(o: b2ContactID): b2ContactID {
    this.key = o.key;
    return this;
  }

  public Clone(): b2ContactID {
    return new b2ContactID().Copy(this);
  }

  public get key(): number {
    return this.cf.key;
  }

  public set key(value: number) {
    this.cf.key = value;
  }
}


const b2CollideEdgeAndCircle_s_Q: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_e: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_d: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_e1: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_e2: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_P: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_n: b2Vec2 = new b2Vec2();
const b2CollideEdgeAndCircle_s_id: b2ContactID = new b2ContactID();
function b2CollideEdgeAndCircle(manifold: b2Manifold, edgeA: b2EdgeShape, xfA: b2Transform, circleB: b2CircleShape, xfB: b2Transform): void {
  manifold.pointCount = 0;

  // Compute circle in frame of edge
  const Q: b2Vec2 = b2Transform.MulTXV(xfA, b2Transform.MulXV(xfB, circleB.m_p, b2Vec2.s_t0), b2CollideEdgeAndCircle_s_Q);

  const A: b2Vec2 = edgeA.m_vertex1;
  const B: b2Vec2 = edgeA.m_vertex2;
  const e: b2Vec2 = b2Vec2.SubVV(B, A, b2CollideEdgeAndCircle_s_e);

  // Normal points to the right for a CCW winding
  // b2Vec2 n(e.y, -e.x);
  // const n: b2Vec2 = b2CollideEdgeAndCircle_s_n.Set(-e.y, e.x);
  const n: b2Vec2 = b2CollideEdgeAndCircle_s_n.Set(e.y, -e.x);
  // float offset = b2Dot(n, Q - A);
  const offset: number = b2Vec2.DotVV(n, b2Vec2.SubVV(Q, A, b2Vec2.s_t0));

  const oneSided: boolean = edgeA.m_oneSided;
  if (oneSided && offset < 0.0) {
    return;
  }

  // Barycentric coordinates
  const u: number = b2Vec2.DotVV(e, b2Vec2.SubVV(B, Q, b2Vec2.s_t0));
  const v: number = b2Vec2.DotVV(e, b2Vec2.SubVV(Q, A, b2Vec2.s_t0));

  const radius: number = edgeA.m_radius + circleB.m_radius;

  /// Contact ids to facilitate warm starting.


  // const cf: b2ContactFeature = new b2ContactFeature();
  const id: b2ContactID = b2CollideEdgeAndCircle_s_id;
  id.cf.indexB = 0;
  id.cf.typeB = b2ContactFeatureType.e_vertex;

  // Region A
  if (v <= 0) {
    const P: b2Vec2 = A;
    const d: b2Vec2 = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
    const dd: number = b2Vec2.DotVV(d, d);
    if (dd > radius * radius) {
      return;
    }

    // Is there an edge connected to A?
    if (edgeA.m_oneSided) {
      const A1: b2Vec2 = edgeA.m_vertex0;
      const B1: b2Vec2 = A;
      const e1: b2Vec2 = b2Vec2.SubVV(B1, A1, b2CollideEdgeAndCircle_s_e1);
      const u1: number = b2Vec2.DotVV(e1, b2Vec2.SubVV(B1, Q, b2Vec2.s_t0));

      // Is the circle in Region AB of the previous edge?
      if (u1 > 0) {
        return;
      }
    }

    id.cf.indexA = 0;
    id.cf.typeA = b2ContactFeatureType.e_vertex;
    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_circles;
    manifold.localNormal.SetZero();
    manifold.localPoint.Copy(P);
    manifold.points[0].id.Copy(id);
    // manifold.points[0].id.key = 0;
    // manifold.points[0].id.cf = cf;
    manifold.points[0].localPoint.Copy(circleB.m_p);
    return;
  }

  // Region B
  if (u <= 0) {
    const P: b2Vec2 = B;
    const d: b2Vec2 = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
    const dd: number = b2Vec2.DotVV(d, d);
    if (dd > radius * radius) {
      return;
    }

    // Is there an edge connected to B?
    if (edgeA.m_oneSided) {
      const B2: b2Vec2 = edgeA.m_vertex3;
      const A2: b2Vec2 = B;
      const e2: b2Vec2 = b2Vec2.SubVV(B2, A2, b2CollideEdgeAndCircle_s_e2);
      const v2: number = b2Vec2.DotVV(e2, b2Vec2.SubVV(Q, A2, b2Vec2.s_t0));

      // Is the circle in Region AB of the next edge?
      if (v2 > 0) {
        return;
      }
    }

    id.cf.indexA = 1;
    id.cf.typeA = b2ContactFeatureType.e_vertex;
    manifold.pointCount = 1;
    manifold.type = b2ManifoldType.e_circles;
    manifold.localNormal.SetZero();
    manifold.localPoint.Copy(P);
    manifold.points[0].id.Copy(id);
    // manifold.points[0].id.key = 0;
    // manifold.points[0].id.cf = cf;
    manifold.points[0].localPoint.Copy(circleB.m_p);
    return;
  }

  // Region AB
  const den: number = b2Vec2.DotVV(e, e);
  // DEBUG: b2Assert(den > 0);
  const P: b2Vec2 = b2CollideEdgeAndCircle_s_P;
  P.x = (1 / den) * (u * A.x + v * B.x);
  P.y = (1 / den) * (u * A.y + v * B.y);
  const d: b2Vec2 = b2Vec2.SubVV(Q, P, b2CollideEdgeAndCircle_s_d);
  const dd: number = b2Vec2.DotVV(d, d);
  if (dd > radius * radius) {
    return;
  }

  if (offset < 0) {
    n.Set(-n.x, -n.y);
  }
  n.Normalize();

  id.cf.indexA = 0;
  id.cf.typeA = b2ContactFeatureType.e_face;
  manifold.pointCount = 1;
  manifold.type = b2ManifoldType.e_faceA;
  manifold.localNormal.Copy(n);
  manifold.localPoint.Copy(A);
  manifold.points[0].id.Copy(id);
  // manifold.points[0].id.key = 0;
  // manifold.points[0].id.cf = cf;
  manifold.points[0].localPoint.Copy(circleB.m_p);
}

enum b2EPAxisType {
  e_unknown = 0,
  e_edgeA = 1,
  e_edgeB = 2,
}

class b2EPAxis {
  public normal: b2Vec2 = new b2Vec2();
  public type: b2EPAxisType = b2EPAxisType.e_unknown;
  public index: number = 0;
  public separation: number = 0;
}

class b2TempPolygon {
  public vertices: b2Vec2[] = [];
  public normals: b2Vec2[] = [];
  public count: number = 0;
}

class b2ReferenceFace {
  public i1: number = 0;
  public i2: number = 0;
  public v1: b2Vec2 = new b2Vec2();
  public v2: b2Vec2 = new b2Vec2();
  public normal: b2Vec2 = new b2Vec2();
  public sideNormal1: b2Vec2 = new b2Vec2();
  public sideOffset1: number = 0;
  public sideNormal2: b2Vec2 = new b2Vec2();
  public sideOffset2: number = 0;
}

// static b2EPAxis b2ComputeEdgeSeparation(const b2TempPolygon& polygonB, const b2Vec2& v1, const b2Vec2& normal1)
const b2ComputeEdgeSeparation_s_axis = new b2EPAxis();
const b2ComputeEdgeSeparation_s_axes: [b2Vec2, b2Vec2] = [new b2Vec2(), new b2Vec2()];
function b2ComputeEdgeSeparation(polygonB: b2TempPolygon, v1: b2Vec2, normal1: b2Vec2): b2EPAxis {
  // b2EPAxis axis;
  const axis: b2EPAxis = b2ComputeEdgeSeparation_s_axis;
  axis.type = b2EPAxisType.e_edgeA;
  axis.index = -1;
  axis.separation = -Number.MAX_VALUE; // -FLT_MAX;
  axis.normal.SetZero();

  // b2Vec2 axes[2] = { normal1, -normal1 };
  const axes: [b2Vec2, b2Vec2] = b2ComputeEdgeSeparation_s_axes;
  axes[0].Copy(normal1);
  axes[1].Copy(normal1).SelfNeg();

  // Find axis with least overlap (min-max problem)
  for (let j = 0; j < 2; ++j) {
    let sj: number = Number.MAX_VALUE; // FLT_MAX;

    // Find deepest polygon vertex along axis j
    for (let i = 0; i < polygonB.count; ++i) {
      // float si = b2Dot(axes[j], polygonB.vertices[i] - v1);
      const si: number = b2Vec2.DotVV(axes[j], b2Vec2.SubVV(polygonB.vertices[i], v1, b2Vec2.s_t0));
      if (si < sj) {
        sj = si;
      }
    }

    if (sj > axis.separation) {
      axis.index = j;
      axis.separation = sj;
      axis.normal.Copy(axes[j]);
    }
  }

  return axis;
}

// static b2EPAxis b2ComputePolygonSeparation(const b2TempPolygon& polygonB, const b2Vec2& v1, const b2Vec2& v2)
const b2ComputePolygonSeparation_s_axis = new b2EPAxis();
const b2ComputePolygonSeparation_s_n = new b2Vec2();
function b2ComputePolygonSeparation(polygonB: b2TempPolygon, v1: b2Vec2, v2: b2Vec2): b2EPAxis {
  const axis: b2EPAxis = b2ComputePolygonSeparation_s_axis;
  axis.type = b2EPAxisType.e_unknown;
  axis.index = -1;
  axis.separation = -Number.MAX_VALUE; // -FLT_MAX;
  axis.normal.SetZero();

  for (let i = 0; i < polygonB.count; ++i) {
    // b2Vec2 n = -polygonB.normals[i];
    const n: b2Vec2 = b2Vec2.NegV(polygonB.normals[i], b2ComputePolygonSeparation_s_n);

    // float s1 = b2Dot(n, polygonB.vertices[i] - v1);
    const s1: number = b2Vec2.DotVV(n, b2Vec2.SubVV(polygonB.vertices[i], v1, b2Vec2.s_t0));
    // float s2 = b2Dot(n, polygonB.vertices[i] - v2);
    const s2: number = b2Vec2.DotVV(n, b2Vec2.SubVV(polygonB.vertices[i], v2, b2Vec2.s_t0));
    // float s = b2Min(s1, s2);
    const s: number = b2Min(s1, s2);

    if (s > axis.separation) {
      axis.type = b2EPAxisType.e_edgeB;
      axis.index = i;
      axis.separation = s;
      axis.normal.Copy(n);
    }
  }

  return axis;
}

const b2CollideEdgeAndPolygon_s_xf = new b2Transform();
const b2CollideEdgeAndPolygon_s_centroidB = new b2Vec2();
const b2CollideEdgeAndPolygon_s_edge1 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_normal1 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_edge0 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_normal0 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_edge2 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_normal2 = new b2Vec2();
const b2CollideEdgeAndPolygon_s_tempPolygonB = new b2TempPolygon();
const b2CollideEdgeAndPolygon_s_ref = new b2ReferenceFace();
const b2CollideEdgeAndPolygon_s_clipPoints: [b2ClipVertex, b2ClipVertex] = [new b2ClipVertex(), new b2ClipVertex()];
const b2CollideEdgeAndPolygon_s_clipPoints1: [b2ClipVertex, b2ClipVertex] = [new b2ClipVertex(), new b2ClipVertex()];
const b2CollideEdgeAndPolygon_s_clipPoints2: [b2ClipVertex, b2ClipVertex] = [new b2ClipVertex(), new b2ClipVertex()];
function b2CollideEdgeAndPolygon(manifold: b2Manifold, edgeA: b2EdgeShape, xfA: b2Transform, polygonB: b2PolygonShape, xfB: b2Transform): void {
  manifold.pointCount = 0;

  // b2Transform xf = b2MulT(xfA, xfB);
  const xf = b2Transform.MulTXX(xfA, xfB, b2CollideEdgeAndPolygon_s_xf);

  // b2Vec2 centroidB = b2Mul(xf, polygonB.m_centroid);
  const centroidB: b2Vec2 = b2Transform.MulXV(xf, polygonB.m_centroid, b2CollideEdgeAndPolygon_s_centroidB);

  // b2Vec2 v1 = edgeA.m_vertex1;
  const v1: b2Vec2 = edgeA.m_vertex1;
  // b2Vec2 v2 = edgeA.m_vertex2;
  const v2: b2Vec2 = edgeA.m_vertex2;

  // b2Vec2 edge1 = v2 - v1;
  const edge1: b2Vec2 = b2Vec2.SubVV(v2, v1, b2CollideEdgeAndPolygon_s_edge1);
  edge1.Normalize();

  // Normal points to the right for a CCW winding
  // b2Vec2 normal1(edge1.y, -edge1.x);
  const normal1 = b2CollideEdgeAndPolygon_s_normal1.Set(edge1.y, -edge1.x);
  // float offset1 = b2Dot(normal1, centroidB - v1);
  const offset1: number = b2Vec2.DotVV(normal1, b2Vec2.SubVV(centroidB, v1, b2Vec2.s_t0));

  const oneSided: boolean = edgeA.m_oneSided;
  if (oneSided && offset1 < 0.0) {
    return;
  }

  // Get polygonB in frameA
  // b2TempPolygon tempPolygonB;
  const tempPolygonB: b2TempPolygon = b2CollideEdgeAndPolygon_s_tempPolygonB;
  tempPolygonB.count = polygonB.m_count;
  for (let i = 0; i < polygonB.m_count; ++i) {
    if (tempPolygonB.vertices.length <= i) { tempPolygonB.vertices.push(new b2Vec2()); }
    if (tempPolygonB.normals.length <= i) { tempPolygonB.normals.push(new b2Vec2()); }
    // tempPolygonB.vertices[i] = b2Mul(xf, polygonB.m_vertices[i]);
    b2Transform.MulXV(xf, polygonB.m_vertices[i], tempPolygonB.vertices[i]);
    // tempPolygonB.normals[i] = b2Mul(xf.q, polygonB.m_normals[i]);
    b2Rot.MulRV(xf.q, polygonB.m_normals[i], tempPolygonB.normals[i]);
  }

  const radius: number = polygonB.m_radius + edgeA.m_radius;

  // b2EPAxis edgeAxis = b2ComputeEdgeSeparation(tempPolygonB, v1, normal1);
  const edgeAxis: b2EPAxis = b2ComputeEdgeSeparation(tempPolygonB, v1, normal1);
  if (edgeAxis.separation > radius) {
    return;
  }

  // b2EPAxis polygonAxis = b2ComputePolygonSeparation(tedge0.y, -edge0.xempPolygonB, v1, v2);
  const polygonAxis: b2EPAxis = b2ComputePolygonSeparation(tempPolygonB, v1, v2);
  if (polygonAxis.separation > radius) {
    return;
  }

  // Use hysteresis for jitter reduction.
  const k_relativeTol: number = 0.98;
  const k_absoluteTol: number = 0.001;

  // b2EPAxis primaryAxis;
  let primaryAxis: b2EPAxis;
  if (polygonAxis.separation - radius > k_relativeTol * (edgeAxis.separation - radius) + k_absoluteTol) {
    primaryAxis = polygonAxis;
  } else {
    primaryAxis = edgeAxis;
  }

  if (oneSided) {
    // Smooth collision
    // See https://box2d.org/posts/2020/06/ghost-collisions/

    // b2Vec2 edge0 = v1 - edgeA.m_vertex0;
    const edge0: b2Vec2 = b2Vec2.SubVV(v1, edgeA.m_vertex0, b2CollideEdgeAndPolygon_s_edge0);
    edge0.Normalize();
    // b2Vec2 normal0(edge0.y, -edge0.x);
    const normal0: b2Vec2 = b2CollideEdgeAndPolygon_s_normal0.Set(edge0.y, -edge0.x);
    const convex1: boolean = b2Vec2.CrossVV(edge0, edge1) >= 0.0;

    // b2Vec2 edge2 = edgeA.m_vertex3 - v2;
    const edge2: b2Vec2 = b2Vec2.SubVV(edgeA.m_vertex3, v2, b2CollideEdgeAndPolygon_s_edge2);
    edge2.Normalize();
    // b2Vec2 normal2(edge2.y, -edge2.x);
    const normal2: b2Vec2 = b2CollideEdgeAndPolygon_s_normal2.Set(edge2.y, -edge2.x);
    const convex2: boolean = b2Vec2.CrossVV(edge1, edge2) >= 0.0;

    const sinTol: number = 0.1;
    const side1: boolean = b2Vec2.DotVV(primaryAxis.normal, edge1) <= 0.0;

    // Check Gauss Map
    if (side1) {
      if (convex1) {
        if (b2Vec2.CrossVV(primaryAxis.normal, normal0) > sinTol) {
          // Skip region
          return;
        }

        // Admit region
      } else {
        // Snap region
        primaryAxis = edgeAxis;
      }
    } else {
      if (convex2) {
        if (b2Vec2.CrossVV(normal2, primaryAxis.normal) > sinTol) {
          // Skip region
          return;
        }

        // Admit region
      } else {
        // Snap region
        primaryAxis = edgeAxis;
      }
    }
  }

  // b2ClipVertex clipPoints[2];
  const clipPoints: [b2ClipVertex, b2ClipVertex] = b2CollideEdgeAndPolygon_s_clipPoints;
  // b2ReferenceFace ref;
  const ref: b2ReferenceFace = b2CollideEdgeAndPolygon_s_ref;
  if (primaryAxis.type === b2EPAxisType.e_edgeA) {
    manifold.type = b2ManifoldType.e_faceA;

    // Search for the polygon normal that is most anti-parallel to the edge normal.
    let bestIndex: number = 0;
    let bestValue: number = b2Vec2.DotVV(primaryAxis.normal, tempPolygonB.normals[0]);
    for (let i = 1; i < tempPolygonB.count; ++i) {
      const value: number = b2Vec2.DotVV(primaryAxis.normal, tempPolygonB.normals[i]);
      if (value < bestValue) {
        bestValue = value;
        bestIndex = i;
      }
    }

    const i1: number = bestIndex;
    const i2: number = i1 + 1 < tempPolygonB.count ? i1 + 1 : 0;

    clipPoints[0].v.Copy(tempPolygonB.vertices[i1]);
    clipPoints[0].id.cf.indexA = 0;
    clipPoints[0].id.cf.indexB = i1;
    clipPoints[0].id.cf.typeA = b2ContactFeatureType.e_face;
    clipPoints[0].id.cf.typeB = b2ContactFeatureType.e_vertex;

    clipPoints[1].v.Copy(tempPolygonB.vertices[i2]);
    clipPoints[1].id.cf.indexA = 0;
    clipPoints[1].id.cf.indexB = i2;
    clipPoints[1].id.cf.typeA = b2ContactFeatureType.e_face;
    clipPoints[1].id.cf.typeB = b2ContactFeatureType.e_vertex;

    ref.i1 = 0;
    ref.i2 = 1;
    ref.v1.Copy(v1);
    ref.v2.Copy(v2);
    ref.normal.Copy(primaryAxis.normal);
    ref.sideNormal1.Copy(edge1).SelfNeg(); // ref.sideNormal1 = -edge1;
    ref.sideNormal2.Copy(edge1);
  } else {
    manifold.type = b2ManifoldType.e_faceB;

    clipPoints[0].v.Copy(v2);
    clipPoints[0].id.cf.indexA = 1;
    clipPoints[0].id.cf.indexB = primaryAxis.index;
    clipPoints[0].id.cf.typeA = b2ContactFeatureType.e_vertex;
    clipPoints[0].id.cf.typeB = b2ContactFeatureType.e_face;

    clipPoints[1].v.Copy(v1);
    clipPoints[1].id.cf.indexA = 0;
    clipPoints[1].id.cf.indexB = primaryAxis.index;
    clipPoints[1].id.cf.typeA = b2ContactFeatureType.e_vertex;
    clipPoints[1].id.cf.typeB = b2ContactFeatureType.e_face;

    ref.i1 = primaryAxis.index;
    ref.i2 = ref.i1 + 1 < tempPolygonB.count ? ref.i1 + 1 : 0;
    ref.v1.Copy(tempPolygonB.vertices[ref.i1]);
    ref.v2.Copy(tempPolygonB.vertices[ref.i2]);
    ref.normal.Copy(tempPolygonB.normals[ref.i1]);

    // CCW winding
    ref.sideNormal1.Set(ref.normal.y, -ref.normal.x);
    ref.sideNormal2.Copy(ref.sideNormal1).SelfNeg(); // ref.sideNormal2 = -ref.sideNormal1;
  }

  ref.sideOffset1 = b2Vec2.DotVV(ref.sideNormal1, ref.v1);
  ref.sideOffset2 = b2Vec2.DotVV(ref.sideNormal2, ref.v2);

  // Clip incident edge against reference face side planes
  // b2ClipVertex clipPoints1[2];
  const clipPoints1: [b2ClipVertex, b2ClipVertex] = b2CollideEdgeAndPolygon_s_clipPoints1; // [new b2ClipVertex(), new b2ClipVertex()];
  // b2ClipVertex clipPoints2[2];
  const clipPoints2: [b2ClipVertex, b2ClipVertex] = b2CollideEdgeAndPolygon_s_clipPoints2; // [new b2ClipVertex(), new b2ClipVertex()];
  // int32 np;
  let np: number;

  // Clip to side 1
  np = b2ClipSegmentToLine(clipPoints1, clipPoints, ref.sideNormal1, ref.sideOffset1, ref.i1);

  if (np < b2_maxManifoldPoints) {
    return;
  }

  // Clip to side 2
  np = b2ClipSegmentToLine(clipPoints2, clipPoints1, ref.sideNormal2, ref.sideOffset2, ref.i2);

  if (np < b2_maxManifoldPoints) {
    return;
  }

  // Now clipPoints2 contains the clipped points.
  if (primaryAxis.type === b2EPAxisType.e_edgeA) {
    manifold.localNormal.Copy(ref.normal);
    manifold.localPoint.Copy(ref.v1);
  } else {
    manifold.localNormal.Copy(polygonB.m_normals[ref.i1]);
    manifold.localPoint.Copy(polygonB.m_vertices[ref.i1]);
  }

  let pointCount = 0;
  for (let i = 0; i < b2_maxManifoldPoints; ++i) {
    const separation: number = b2Vec2.DotVV(ref.normal, b2Vec2.SubVV(clipPoints2[i].v, ref.v1, b2Vec2.s_t0));

    if (separation <= radius) {
      const cp: b2ManifoldPoint = manifold.points[pointCount];

      if (primaryAxis.type === b2EPAxisType.e_edgeA) {
        b2Transform.MulTXV(xf, clipPoints2[i].v, cp.localPoint); // cp.localPoint = b2MulT(xf, clipPoints2[i].v);
        cp.id.Copy(clipPoints2[i].id);
      } else {
        cp.localPoint.Copy(clipPoints2[i].v);
        cp.id.cf.typeA = clipPoints2[i].id.cf.typeB;
        cp.id.cf.typeB = clipPoints2[i].id.cf.typeA;
        cp.id.cf.indexA = clipPoints2[i].id.cf.indexB;
        cp.id.cf.indexB = clipPoints2[i].id.cf.indexA;
      }

      ++pointCount;
    }
  }

  manifold.pointCount = pointCount;
}
// MIT License

// Copyright (c) 2019 Erin Catto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.






// Find the max separation between poly1 and poly2 using edge normals from poly1.
const b2FindMaxSeparation_s_xf: b2Transform = new b2Transform();
const b2FindMaxSeparation_s_n: b2Vec2 = new b2Vec2();
const b2FindMaxSeparation_s_v1: b2Vec2 = new b2Vec2();
function b2FindMaxSeparation(edgeIndex: [number], poly1: b2PolygonShape, xf1: b2Transform, poly2: b2PolygonShape, xf2: b2Transform): number {
  const count1: number = poly1.m_count;
  const count2: number = poly2.m_count;
  const n1s: b2Vec2[] = poly1.m_normals;
  const v1s: b2Vec2[] = poly1.m_vertices;
  const v2s: b2Vec2[] = poly2.m_vertices;
  const xf: b2Transform = b2Transform.MulTXX(xf2, xf1, b2FindMaxSeparation_s_xf);

  let bestIndex: number = 0;
  let maxSeparation: number = -b2_maxFloat;

  for (let i: number = 0; i < count1; ++i) {
    // Get poly1 normal in frame2.
    const n: b2Vec2 = b2Rot.MulRV(xf.q, n1s[i], b2FindMaxSeparation_s_n);
    const v1: b2Vec2 = b2Transform.MulXV(xf, v1s[i], b2FindMaxSeparation_s_v1);

    // Find deepest point for normal i.
    let si: number = b2_maxFloat;
    for (let j: number = 0; j < count2; ++j) {
      const sij = b2Vec2.DotVV(n, b2Vec2.SubVV(v2s[j], v1, b2Vec2.s_t0));
      if (sij < si) {
        si = sij;
      }
    }

    if (si > maxSeparation) {
      maxSeparation = si;
      bestIndex = i;
    }
  }

  edgeIndex[0] = bestIndex;
  return maxSeparation;
}

const b2FindIncidentEdge_s_normal1: b2Vec2 = new b2Vec2();
function b2FindIncidentEdge(c: [b2ClipVertex, b2ClipVertex], poly1: b2PolygonShape, xf1: b2Transform, edge1: number, poly2: b2PolygonShape, xf2: b2Transform): void {
  const normals1: b2Vec2[] = poly1.m_normals;

  const count2: number = poly2.m_count;
  const vertices2: b2Vec2[] = poly2.m_vertices;
  const normals2: b2Vec2[] = poly2.m_normals;

  // DEBUG: b2Assert(0 <= edge1 && edge1 < poly1.m_count);

  // Get the normal of the reference edge in poly2's frame.
  const normal1: b2Vec2 = b2Rot.MulTRV(xf2.q, b2Rot.MulRV(xf1.q, normals1[edge1], b2Vec2.s_t0), b2FindIncidentEdge_s_normal1);

  // Find the incident edge on poly2.
  let index: number = 0;
  let minDot: number = b2_maxFloat;
  for (let i: number = 0; i < count2; ++i) {
    const dot: number = b2Vec2.DotVV(normal1, normals2[i]);
    if (dot < minDot) {
      minDot = dot;
      index = i;
    }
  }

  // Build the clip vertices for the incident edge.
  const i1: number = index;
  const i2: number = i1 + 1 < count2 ? i1 + 1 : 0;

  const c0: b2ClipVertex = c[0];
  b2Transform.MulXV(xf2, vertices2[i1], c0.v);
  const cf0: b2ContactFeature = c0.id.cf;
  cf0.indexA = edge1;
  cf0.indexB = i1;
  cf0.typeA = b2ContactFeatureType.e_face;
  cf0.typeB = b2ContactFeatureType.e_vertex;

  const c1: b2ClipVertex = c[1];
  b2Transform.MulXV(xf2, vertices2[i2], c1.v);
  const cf1: b2ContactFeature = c1.id.cf;
  cf1.indexA = edge1;
  cf1.indexB = i2;
  cf1.typeA = b2ContactFeatureType.e_face;
  cf1.typeB = b2ContactFeatureType.e_vertex;
}

// Find edge normal of max separation on A - return if separating axis is found
// Find edge normal of max separation on B - return if separation axis is found
// Choose reference edge as min(minA, minB)
// Find incident edge
// Clip

// The normal points from 1 to 2
const b2CollidePolygons_s_incidentEdge: [b2ClipVertex, b2ClipVertex] = [ new b2ClipVertex(), new b2ClipVertex() ];
const b2CollidePolygons_s_clipPoints1: [b2ClipVertex, b2ClipVertex] = [ new b2ClipVertex(), new b2ClipVertex() ];
const b2CollidePolygons_s_clipPoints2: [b2ClipVertex, b2ClipVertex] = [ new b2ClipVertex(), new b2ClipVertex() ];
const b2CollidePolygons_s_edgeA: [number] = [ 0 ];
const b2CollidePolygons_s_edgeB: [number] = [ 0 ];
const b2CollidePolygons_s_localTangent: b2Vec2 = new b2Vec2();
const b2CollidePolygons_s_localNormal: b2Vec2 = new b2Vec2();
const b2CollidePolygons_s_planePoint: b2Vec2 = new b2Vec2();
const b2CollidePolygons_s_normal: b2Vec2 = new b2Vec2();
const b2CollidePolygons_s_tangent: b2Vec2 = new b2Vec2();
const b2CollidePolygons_s_ntangent: b2Vec2 = new b2Vec2();
const b2CollidePolygons_s_v11: b2Vec2 = new b2Vec2();
const b2CollidePolygons_s_v12: b2Vec2 = new b2Vec2();
 function b2CollidePolygons(manifold: b2Manifold, polyA: b2PolygonShape, xfA: b2Transform, polyB: b2PolygonShape, xfB: b2Transform): void {
  manifold.pointCount = 0;
  const totalRadius: number = polyA.m_radius + polyB.m_radius;

  const edgeA: [number] = b2CollidePolygons_s_edgeA; edgeA[0] = 0;
  const separationA: number = b2FindMaxSeparation(edgeA, polyA, xfA, polyB, xfB);
  if (separationA > totalRadius) {
    return;
  }

  const edgeB: [number] = b2CollidePolygons_s_edgeB; edgeB[0] = 0;
  const separationB: number = b2FindMaxSeparation(edgeB, polyB, xfB, polyA, xfA);
  if (separationB > totalRadius) {
    return;
  }

  let poly1: b2PolygonShape; // reference polygon
  let poly2: b2PolygonShape; // incident polygon
  let xf1: b2Transform, xf2: b2Transform;
  let edge1: number = 0; // reference edge
  let flip: number = 0;
  const k_tol: number = 0.1 * b2_linearSlop;

  if (separationB > separationA + k_tol) {
    poly1 = polyB;
    poly2 = polyA;
    xf1 = xfB;
    xf2 = xfA;
    edge1 = edgeB[0];
    manifold.type = b2ManifoldType.e_faceB;
    flip = 1;
  } else {
    poly1 = polyA;
    poly2 = polyB;
    xf1 = xfA;
    xf2 = xfB;
    edge1 = edgeA[0];
    manifold.type = b2ManifoldType.e_faceA;
    flip = 0;
  }

  const incidentEdge: [b2ClipVertex, b2ClipVertex] = b2CollidePolygons_s_incidentEdge;
  b2FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);

  const count1: number = poly1.m_count;
  const vertices1: b2Vec2[] = poly1.m_vertices;

  const iv1: number = edge1;
  const iv2: number = edge1 + 1 < count1 ? edge1 + 1 : 0;

  const local_v11: b2Vec2 = vertices1[iv1];
  const local_v12: b2Vec2 = vertices1[iv2];

  const localTangent: b2Vec2 = b2Vec2.SubVV(local_v12, local_v11, b2CollidePolygons_s_localTangent);
  localTangent.Normalize();

  const localNormal: b2Vec2 = b2Vec2.CrossVOne(localTangent, b2CollidePolygons_s_localNormal);
  const planePoint: b2Vec2 = b2Vec2.MidVV(local_v11, local_v12, b2CollidePolygons_s_planePoint);

  const tangent: b2Vec2 = b2Rot.MulRV(xf1.q, localTangent, b2CollidePolygons_s_tangent);
  const normal: b2Vec2 = b2Vec2.CrossVOne(tangent, b2CollidePolygons_s_normal);

  const v11: b2Vec2 = b2Transform.MulXV(xf1, local_v11, b2CollidePolygons_s_v11);
  const v12: b2Vec2 = b2Transform.MulXV(xf1, local_v12, b2CollidePolygons_s_v12);

  // Face offset.
  const frontOffset: number = b2Vec2.DotVV(normal, v11);

  // Side offsets, extended by polytope skin thickness.
  const sideOffset1: number = -b2Vec2.DotVV(tangent, v11) + totalRadius;
  const sideOffset2: number = b2Vec2.DotVV(tangent, v12) + totalRadius;

  // Clip incident edge against extruded edge1 side edges.
  const clipPoints1: [b2ClipVertex, b2ClipVertex] = b2CollidePolygons_s_clipPoints1;
  const clipPoints2: [b2ClipVertex, b2ClipVertex] = b2CollidePolygons_s_clipPoints2;
  let np: number;

  // Clip to box side 1
  const ntangent: b2Vec2 = b2Vec2.NegV(tangent, b2CollidePolygons_s_ntangent);
  np = b2ClipSegmentToLine(clipPoints1, incidentEdge, ntangent, sideOffset1, iv1);

  if (np < 2) {
    return;
  }

  // Clip to negative box side 1
  np = b2ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2, iv2);

  if (np < 2) {
    return;
  }

  // Now clipPoints2 contains the clipped points.
  manifold.localNormal.Copy(localNormal);
  manifold.localPoint.Copy(planePoint);

  let pointCount: number = 0;
  for (let i: number = 0; i < b2_maxManifoldPoints; ++i) {
    const cv: b2ClipVertex = clipPoints2[i];
    const separation: number = b2Vec2.DotVV(normal, cv.v) - frontOffset;

    if (separation <= totalRadius) {
      const cp: b2ManifoldPoint = manifold.points[pointCount];
      b2Transform.MulTXV(xf2, cv.v, cp.localPoint);
      cp.id.Copy(cv.id);
      if (flip) {
        // Swap features
        const cf: b2ContactFeature = cp.id.cf;
        cp.id.cf.indexA = cf.indexB;
        cp.id.cf.indexB = cf.indexA;
        cp.id.cf.typeA = cf.typeB;
        cp.id.cf.typeB = cf.typeA;
      }
      ++pointCount;
    }
  }

  manifold.pointCount = pointCount;
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 





/// @file
/// Structures and functions used for computing contact points, distance
/// queries, and TOI queries.

 enum b2ContactFeatureType {
  e_vertex = 0,
  e_face = 1,
}
/// A manifold point is a contact point belonging to a contact
/// manifold. It holds details related to the geometry and dynamics
/// of the contact points.
/// The local point usage depends on the manifold type:
/// -e_circles: the local center of circleB
/// -e_faceA: the local center of cirlceB or the clip point of polygonB
/// -e_faceB: the clip point of polygonA
/// This structure is stored across time steps, so we keep it small.
/// Note: the impulses are used for internal caching and may not
/// provide reliable contact forces, especially for high speed collisions.
 class b2ManifoldPoint {
  public  localPoint: b2Vec2 = new b2Vec2();  ///< usage depends on manifold type
  public normalImpulse: number = 0;      ///< the non-penetration impulse
  public tangentImpulse: number = 0;      ///< the friction impulse
  public  id: b2ContactID = new b2ContactID(); ///< uniquely identifies a contact point between two shapes

  public static MakeArray(length: number): b2ManifoldPoint[] {
    return b2MakeArray(length, (i: number): b2ManifoldPoint => new b2ManifoldPoint());
  }

  public Reset(): void {
    this.localPoint.SetZero();
    this.normalImpulse = 0;
    this.tangentImpulse = 0;
    this.id.key = 0;
  }

  public Copy(o: b2ManifoldPoint): b2ManifoldPoint {
    this.localPoint.Copy(o.localPoint);
    this.normalImpulse = o.normalImpulse;
    this.tangentImpulse = o.tangentImpulse;
    this.id.Copy(o.id);
    return this;
  }
}

 enum b2ManifoldType {
  e_unknown = -1,
  e_circles = 0,
  e_faceA = 1,
  e_faceB = 2,
}

/// A manifold for two touching convex shapes.
/// Box2D supports multiple types of contact:
/// - clip point versus plane with radius
/// - point versus point with radius (circles)
/// The local point usage depends on the manifold type:
/// -e_circles: the local center of circleA
/// -e_faceA: the center of faceA
/// -e_faceB: the center of faceB
/// Similarly the local normal usage:
/// -e_circles: not used
/// -e_faceA: the normal on polygonA
/// -e_faceB: the normal on polygonB
/// We store contacts in this way so that position correction can
/// account for movement, which is critical for continuous physics.
/// All contact scenarios must be expressed in one of these types.
/// This structure is stored across time steps, so we keep it small.
 class b2Manifold {
  public  points: b2ManifoldPoint[] = b2ManifoldPoint.MakeArray(b2_maxManifoldPoints);
  public  localNormal: b2Vec2 = new b2Vec2();
  public  localPoint: b2Vec2 = new b2Vec2();
  public type: b2ManifoldType = b2ManifoldType.e_unknown;
  public pointCount: number = 0;

  public Reset(): void {
    for (let i: number = 0; i < b2_maxManifoldPoints; ++i) {
      // DEBUG: b2Assert(this.points[i] instanceof b2ManifoldPoint);
      this.points[i].Reset();
    }
    this.localNormal.SetZero();
    this.localPoint.SetZero();
    this.type = b2ManifoldType.e_unknown;
    this.pointCount = 0;
  }

  public Copy(o: b2Manifold): b2Manifold {
    this.pointCount = o.pointCount;
    for (let i: number = 0; i < b2_maxManifoldPoints; ++i) {
      // DEBUG: b2Assert(this.points[i] instanceof b2ManifoldPoint);
      this.points[i].Copy(o.points[i]);
    }
    this.localNormal.Copy(o.localNormal);
    this.localPoint.Copy(o.localPoint);
    this.type = o.type;
    return this;
  }

  public Clone(): b2Manifold {
    return new b2Manifold().Copy(this);
  }
}

 class b2WorldManifold {
  public  normal: b2Vec2 = new b2Vec2();
  public  points: b2Vec2[] = b2Vec2.MakeArray(b2_maxManifoldPoints);
  public  separations: number[] = b2MakeNumberArray(b2_maxManifoldPoints);

  private static Initialize_s_pointA = new b2Vec2();
  private static Initialize_s_pointB = new b2Vec2();
  private static Initialize_s_cA = new b2Vec2();
  private static Initialize_s_cB = new b2Vec2();
  private static Initialize_s_planePoint = new b2Vec2();
  private static Initialize_s_clipPoint = new b2Vec2();
  public Initialize(manifold: b2Manifold, xfA: b2Transform, radiusA: number, xfB: b2Transform, radiusB: number): void {
    if (manifold.pointCount === 0) {
      return;
    }

    switch (manifold.type) {
    case b2ManifoldType.e_circles: {
        this.normal.Set(1, 0);
        const pointA: b2Vec2 = b2Transform.MulXV(xfA, manifold.localPoint, b2WorldManifold.Initialize_s_pointA);
        const pointB: b2Vec2 = b2Transform.MulXV(xfB, manifold.points[0].localPoint, b2WorldManifold.Initialize_s_pointB);
        if (b2Vec2.DistanceSquaredVV(pointA, pointB) > b2_epsilon_sq) {
          b2Vec2.SubVV(pointB, pointA, this.normal).SelfNormalize();
        }

        const cA: b2Vec2 = b2Vec2.AddVMulSV(pointA, radiusA, this.normal, b2WorldManifold.Initialize_s_cA);
        const cB: b2Vec2 = b2Vec2.SubVMulSV(pointB, radiusB, this.normal, b2WorldManifold.Initialize_s_cB);
        b2Vec2.MidVV(cA, cB, this.points[0]);
        this.separations[0] = b2Vec2.DotVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), this.normal); // b2Dot(cB - cA, normal);
        break;
      }

    case b2ManifoldType.e_faceA: {
        b2Rot.MulRV(xfA.q, manifold.localNormal, this.normal);
        const planePoint: b2Vec2 = b2Transform.MulXV(xfA, manifold.localPoint, b2WorldManifold.Initialize_s_planePoint);

        for (let i: number = 0; i < manifold.pointCount; ++i) {
          const clipPoint: b2Vec2 = b2Transform.MulXV(xfB, manifold.points[i].localPoint, b2WorldManifold.Initialize_s_clipPoint);
          const s: number = radiusA - b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal);
          const cA: b2Vec2 = b2Vec2.AddVMulSV(clipPoint, s, this.normal, b2WorldManifold.Initialize_s_cA);
          const cB: b2Vec2 = b2Vec2.SubVMulSV(clipPoint, radiusB, this.normal, b2WorldManifold.Initialize_s_cB);
          b2Vec2.MidVV(cA, cB, this.points[i]);
          this.separations[i] = b2Vec2.DotVV(b2Vec2.SubVV(cB, cA, b2Vec2.s_t0), this.normal); // b2Dot(cB - cA, normal);
        }
        break;
      }

    case b2ManifoldType.e_faceB: {
        b2Rot.MulRV(xfB.q, manifold.localNormal, this.normal);
        const planePoint: b2Vec2 = b2Transform.MulXV(xfB, manifold.localPoint, b2WorldManifold.Initialize_s_planePoint);

        for (let i: number = 0; i < manifold.pointCount; ++i) {
          const clipPoint: b2Vec2 = b2Transform.MulXV(xfA, manifold.points[i].localPoint, b2WorldManifold.Initialize_s_clipPoint);
          const s: number = radiusB - b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal);
          const cB: b2Vec2 = b2Vec2.AddVMulSV(clipPoint, s, this.normal, b2WorldManifold.Initialize_s_cB);
          const cA: b2Vec2 = b2Vec2.SubVMulSV(clipPoint, radiusA, this.normal, b2WorldManifold.Initialize_s_cA);
          b2Vec2.MidVV(cA, cB, this.points[i]);
          this.separations[i] = b2Vec2.DotVV(b2Vec2.SubVV(cA, cB, b2Vec2.s_t0), this.normal); // b2Dot(cA - cB, normal);
        }

        // Ensure normal points from A to B.
        this.normal.SelfNeg();
        break;
      }
    }
  }
}

/// This is used for determining the state of contact points.
 enum b2PointState {
  b2_nullState = 0, ///< point does not exist
  b2_addState = 1, ///< point was added in the update
  b2_persistState = 2, ///< point persisted across the update
  b2_removeState = 3,  ///< point was removed in the update
}

/// Compute the point states given two manifolds. The states pertain to the transition from manifold1
/// to manifold2. So state1 is either persist or remove while state2 is either add or persist.
 function b2GetPointStates(state1: b2PointState[], state2: b2PointState[], manifold1: b2Manifold, manifold2: b2Manifold): void {
  // Detect persists and removes.
  let i: number;
  for (i = 0; i < manifold1.pointCount; ++i) {
    const id: b2ContactID = manifold1.points[i].id;
    const key: number = id.key;

    state1[i] = b2PointState.b2_removeState;

    for (let j: number = 0, jct = manifold2.pointCount; j < jct; ++j) {
      if (manifold2.points[j].id.key === key) {
        state1[i] = b2PointState.b2_persistState;
        break;
      }
    }
  }
  for (; i < b2_maxManifoldPoints; ++i) {
    state1[i] = b2PointState.b2_nullState;
  }

  // Detect persists and adds.
  for (i = 0; i < manifold2.pointCount; ++i) {
    const id: b2ContactID = manifold2.points[i].id;
    const key: number = id.key;

    state2[i] = b2PointState.b2_addState;

    for (let j: number = 0, jct = manifold1.pointCount; j < jct; ++j) {
      if (manifold1.points[j].id.key === key) {
        state2[i] = b2PointState.b2_persistState;
        break;
      }
    }
  }
  for (; i < b2_maxManifoldPoints; ++i) {
    state2[i] = b2PointState.b2_nullState;
  }
}

/// Used for computing contact manifolds.
 class b2ClipVertex {
  public  v: b2Vec2 = new b2Vec2();
  public  id: b2ContactID = new b2ContactID();

  public static MakeArray(length: number): b2ClipVertex[] {
    return b2MakeArray(length, (i: number): b2ClipVertex => new b2ClipVertex());
  }

  public Copy(other: b2ClipVertex): b2ClipVertex {
    this.v.Copy(other.v);
    this.id.Copy(other.id);
    return this;
  }
}

/// Ray-cast input data. The ray extends from p1 to p1 + maxFraction * (p2 - p1).
 class b2RayCastInput {
  public  p1: b2Vec2 = new b2Vec2();
  public  p2: b2Vec2 = new b2Vec2();
  public maxFraction: number = 1;

  public Copy(o: b2RayCastInput): b2RayCastInput {
    this.p1.Copy(o.p1);
    this.p2.Copy(o.p2);
    this.maxFraction = o.maxFraction;
    return this;
  }
}

/// Ray-cast output data. The ray hits at p1 + fraction * (p2 - p1), where p1 and p2
/// come from b2RayCastInput.
 class b2RayCastOutput {
  public  normal: b2Vec2 = new b2Vec2();
  public fraction: number = 0;

  public Copy(o: b2RayCastOutput): b2RayCastOutput {
    this.normal.Copy(o.normal);
    this.fraction = o.fraction;
    return this;
  }
}

/// An axis aligned bounding box.
 class b2AABB {
  public  lowerBound: b2Vec2 = new b2Vec2(); ///< the lower vertex
  public  upperBound: b2Vec2 = new b2Vec2(); ///< the upper vertex

  private  m_cache_center: b2Vec2 = new b2Vec2(); // access using GetCenter()
  private  m_cache_extent: b2Vec2 = new b2Vec2(); // access using GetExtents()

  public Copy(o: b2AABB): b2AABB {
    this.lowerBound.Copy(o.lowerBound);
    this.upperBound.Copy(o.upperBound);
    return this;
  }

  /// Verify that the bounds are sorted.
  public IsValid(): boolean {
    if (!this.lowerBound.IsValid()) { return false; }
    if (!this.upperBound.IsValid()) { return false; }
    if (this.upperBound.x < this.lowerBound.x) { return false; }
    if (this.upperBound.y < this.lowerBound.y) { return false; }
    return true;
  }

  /// Get the center of the AABB.
  public GetCenter(): b2Vec2 {
    return b2Vec2.MidVV(this.lowerBound, this.upperBound, this.m_cache_center);
  }

  /// Get the extents of the AABB (half-widths).
  public GetExtents(): b2Vec2 {
    return b2Vec2.ExtVV(this.lowerBound, this.upperBound, this.m_cache_extent);
  }

  /// Get the perimeter length
  public GetPerimeter(): number {
    const wx: number = this.upperBound.x - this.lowerBound.x;
    const wy: number = this.upperBound.y - this.lowerBound.y;
    return 2 * (wx + wy);
  }

  /// Combine an AABB into this one.
  public Combine1(aabb: b2AABB): b2AABB {
    this.lowerBound.x = b2Min(this.lowerBound.x, aabb.lowerBound.x);
    this.lowerBound.y = b2Min(this.lowerBound.y, aabb.lowerBound.y);
    this.upperBound.x = b2Max(this.upperBound.x, aabb.upperBound.x);
    this.upperBound.y = b2Max(this.upperBound.y, aabb.upperBound.y);
    return this;
  }

  /// Combine two AABBs into this one.
  public Combine2(aabb1: b2AABB, aabb2: b2AABB): b2AABB {
    this.lowerBound.x = b2Min(aabb1.lowerBound.x, aabb2.lowerBound.x);
    this.lowerBound.y = b2Min(aabb1.lowerBound.y, aabb2.lowerBound.y);
    this.upperBound.x = b2Max(aabb1.upperBound.x, aabb2.upperBound.x);
    this.upperBound.y = b2Max(aabb1.upperBound.y, aabb2.upperBound.y);
    return this;
  }

  public static Combine(aabb1: b2AABB, aabb2: b2AABB, out: b2AABB): b2AABB {
    out.Combine2(aabb1, aabb2);
    return out;
  }

  /// Does this aabb contain the provided AABB.
  public Contains(aabb: b2AABB): boolean {
    let result: boolean = true;
    result = result && this.lowerBound.x <= aabb.lowerBound.x;
    result = result && this.lowerBound.y <= aabb.lowerBound.y;
    result = result && aabb.upperBound.x <= this.upperBound.x;
    result = result && aabb.upperBound.y <= this.upperBound.y;
    return result;
  }

  // From Real-time Collision Detection, p179.
  public RayCast(output: b2RayCastOutput, input: b2RayCastInput): boolean {
    let tmin: number = (-b2_maxFloat);
    let tmax: number = b2_maxFloat;

    const p_x: number = input.p1.x;
    const p_y: number = input.p1.y;
    const d_x: number = input.p2.x - input.p1.x;
    const d_y: number = input.p2.y - input.p1.y;
    const absD_x: number = b2Abs(d_x);
    const absD_y: number = b2Abs(d_y);

    const normal: b2Vec2 = output.normal;

    if (absD_x < b2_epsilon) {
      // Parallel.
      if (p_x < this.lowerBound.x || this.upperBound.x < p_x) {
        return false;
      }
    } else {
      const inv_d: number = 1 / d_x;
      let t1: number = (this.lowerBound.x - p_x) * inv_d;
      let t2: number = (this.upperBound.x - p_x) * inv_d;

      // Sign of the normal vector.
      let s: number = (-1);

      if (t1 > t2) {
        const t3: number = t1;
        t1 = t2;
        t2 = t3;
        s = 1;
      }

      // Push the min up
      if (t1 > tmin) {
        normal.x = s;
        normal.y = 0;
        tmin = t1;
      }

      // Pull the max down
      tmax = b2Min(tmax, t2);

      if (tmin > tmax) {
        return false;
      }
    }

    if (absD_y < b2_epsilon) {
      // Parallel.
      if (p_y < this.lowerBound.y || this.upperBound.y < p_y) {
        return false;
      }
    } else {
      const inv_d: number = 1 / d_y;
      let t1: number = (this.lowerBound.y - p_y) * inv_d;
      let t2: number = (this.upperBound.y - p_y) * inv_d;

      // Sign of the normal vector.
      let s: number = (-1);

      if (t1 > t2) {
        const t3: number = t1;
        t1 = t2;
        t2 = t3;
        s = 1;
      }

      // Push the min up
      if (t1 > tmin) {
        normal.x = 0;
        normal.y = s;
        tmin = t1;
      }

      // Pull the max down
      tmax = b2Min(tmax, t2);

      if (tmin > tmax) {
        return false;
      }
    }

    // Does the ray start inside the box?
    // Does the ray intersect beyond the max fraction?
    if (tmin < 0 || input.maxFraction < tmin) {
      return false;
    }

    // Intersection.
    output.fraction = tmin;

    return true;
  }

  public TestContain(point: XY): boolean {
    if (point.x < this.lowerBound.x || this.upperBound.x < point.x) { return false; }
    if (point.y < this.lowerBound.y || this.upperBound.y < point.y) { return false; }
    return true;
  }

  public TestOverlap(other: b2AABB): boolean {
    if (this.upperBound.x < other.lowerBound.x) { return false; }
    if (this.upperBound.y < other.lowerBound.y) { return false; }
    if (other.upperBound.x < this.lowerBound.x) { return false; }
    if (other.upperBound.y < this.lowerBound.y) { return false; }
    return true;
  }
}

 function b2TestOverlapAABB(a: b2AABB, b: b2AABB): boolean {
  if (a.upperBound.x < b.lowerBound.x) { return false; }
  if (a.upperBound.y < b.lowerBound.y) { return false; }
  if (b.upperBound.x < a.lowerBound.x) { return false; }
  if (b.upperBound.y < a.lowerBound.y) { return false; }
  return true;
}

/// Clipping for contact manifolds.
 function b2ClipSegmentToLine(vOut: [b2ClipVertex, b2ClipVertex], vIn: [b2ClipVertex, b2ClipVertex], normal: b2Vec2, offset: number, vertexIndexA: number): number {
  // Start with no output points
  let count: number = 0;

  const vIn0: b2ClipVertex = vIn[0];
  const vIn1: b2ClipVertex = vIn[1];

  // Calculate the distance of end points to the line
  const distance0: number = b2Vec2.DotVV(normal, vIn0.v) - offset;
  const distance1: number = b2Vec2.DotVV(normal, vIn1.v) - offset;

  // If the points are behind the plane
  if (distance0 <= 0) { vOut[count++].Copy(vIn0); }
  if (distance1 <= 0) { vOut[count++].Copy(vIn1); }

  // If the points are on different sides of the plane
  if (distance0 * distance1 < 0) {
    // Find intersection point of edge and plane
    const interp: number = distance0 / (distance0 - distance1);
    const v: b2Vec2 = vOut[count].v;
    v.x = vIn0.v.x + interp * (vIn1.v.x - vIn0.v.x);
    v.y = vIn0.v.y + interp * (vIn1.v.y - vIn0.v.y);

    // VertexA is hitting edgeB.
    const id: b2ContactID = vOut[count].id;
    id.cf.indexA = vertexIndexA;
    id.cf.indexB = vIn0.id.cf.indexB;
    id.cf.typeA = b2ContactFeatureType.e_vertex;
    id.cf.typeB = b2ContactFeatureType.e_face;
    ++count;

    // b2Assert(count === 2);
  }

  return count;
}

/// Determine if two generic shapes overlap.
const b2TestOverlapShape_s_input: b2DistanceInput = new b2DistanceInput();
const b2TestOverlapShape_s_simplexCache: b2SimplexCache = new b2SimplexCache();
const b2TestOverlapShape_s_output: b2DistanceOutput = new b2DistanceOutput();
 function b2TestOverlapShape(shapeA: b2Shape, indexA: number, shapeB: b2Shape, indexB: number, xfA: b2Transform, xfB: b2Transform): boolean {
  const input: b2DistanceInput = b2TestOverlapShape_s_input.Reset();
  input.proxyA.SetShape(shapeA, indexA);
  input.proxyB.SetShape(shapeB, indexB);
  input.transformA.Copy(xfA);
  input.transformB.Copy(xfB);
  input.useRadii = true;

  const simplexCache: b2SimplexCache = b2TestOverlapShape_s_simplexCache.Reset();
  simplexCache.count = 0;

  const output: b2DistanceOutput = b2TestOverlapShape_s_output.Reset();

  b2Distance(output, simplexCache, input);

  return output.distance < 10 * b2_epsilon;
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 




/// A distance proxy is used by the GJK algorithm.
/// It encapsulates any shape.
 class b2DistanceProxy {
  public  m_buffer: b2Vec2[] = b2Vec2.MakeArray(2);
  public m_vertices: b2Vec2[] = this.m_buffer;
  public m_count: number = 0;
  public m_radius: number = 0;

  public Copy(other: <b2DistanceProxy>): this {
    if (other.m_vertices === other.m_buffer) {
      this.m_vertices = this.m_buffer;
      this.m_buffer[0].Copy(other.m_buffer[0]);
      this.m_buffer[1].Copy(other.m_buffer[1]);
    } else {
      this.m_vertices = other.m_vertices;
    }
    this.m_count = other.m_count;
    this.m_radius = other.m_radius;
    return this;
  }

  public Reset(): b2DistanceProxy {
    this.m_vertices = this.m_buffer;
    this.m_count = 0;
    this.m_radius = 0;
    return this;
  }

  public SetShape(shape: b2Shape, index: number): void {
    shape.SetupDistanceProxy(this, index);
  }

  public SetVerticesRadius(vertices: b2Vec2[], count: number, radius: number): void {
    this.m_vertices = vertices;
    this.m_count = count;
    this.m_radius = radius;
  }

  public GetSupport(d: b2Vec2): number {
    let bestIndex: number = 0;
    let bestValue: number = b2Vec2.DotVV(this.m_vertices[0], d);
    for (let i: number = 1; i < this.m_count; ++i) {
      const value: number = b2Vec2.DotVV(this.m_vertices[i], d);
      if (value > bestValue) {
        bestIndex = i;
        bestValue = value;
      }
    }

    return bestIndex;
  }

  public GetSupportVertex(d: b2Vec2): b2Vec2 {
    let bestIndex: number = 0;
    let bestValue: number = b2Vec2.DotVV(this.m_vertices[0], d);
    for (let i: number = 1; i < this.m_count; ++i) {
      const value: number = b2Vec2.DotVV(this.m_vertices[i], d);
      if (value > bestValue) {
        bestIndex = i;
        bestValue = value;
      }
    }

    return this.m_vertices[bestIndex];
  }

  public GetVertexCount(): number {
    return this.m_count;
  }

  public GetVertex(index: number): b2Vec2 {
    // DEBUG: b2Assert(0 <= index && index < this.m_count);
    return this.m_vertices[index];
  }
}

 class b2SimplexCache {
  public metric: number = 0;
  public count: number = 0;
  public  indexA: [number, number, number] = [0, 0, 0];
  public  indexB: [number, number, number] = [0, 0, 0];

  public Reset(): b2SimplexCache {
    this.metric = 0;
    this.count = 0;
    return this;
  }
}

 class b2DistanceInput {
  public  proxyA: b2DistanceProxy = new b2DistanceProxy();
  public  proxyB: b2DistanceProxy = new b2DistanceProxy();
  public  transformA: b2Transform = new b2Transform();
  public  transformB: b2Transform = new b2Transform();
  public useRadii: boolean = false;

  public Reset(): b2DistanceInput {
    this.proxyA.Reset();
    this.proxyB.Reset();
    this.transformA.SetIdentity();
    this.transformB.SetIdentity();
    this.useRadii = false;
    return this;
  }
}

 class b2DistanceOutput {
  public  pointA: b2Vec2 = new b2Vec2();
  public  pointB: b2Vec2 = new b2Vec2();
  public distance: number = 0;
  public iterations: number = 0; ///< number of GJK iterations used

  public Reset(): b2DistanceOutput {
    this.pointA.SetZero();
    this.pointB.SetZero();
    this.distance = 0;
    this.iterations = 0;
    return this;
  }
}

/// Input parameters for b2ShapeCast
 class b2ShapeCastInput {
  public  proxyA: b2DistanceProxy = new b2DistanceProxy();
  public  proxyB: b2DistanceProxy = new b2DistanceProxy();
  public  transformA: b2Transform = new b2Transform();
  public  transformB: b2Transform = new b2Transform();
  public  translationB: b2Vec2 = new b2Vec2();
}

/// Output results for b2ShapeCast
 class b2ShapeCastOutput {
  public  point: b2Vec2 = new b2Vec2();
  public  normal: b2Vec2 = new b2Vec2();
  public lambda: number = 0.0;
  public iterations: number = 0;
}

 let b2_gjkCalls: number = 0;
 let b2_gjkIters: number = 0;
 let b2_gjkMaxIters: number = 0;
 function b2_gjk_reset(): void {
  b2_gjkCalls = 0;
  b2_gjkIters = 0;
  b2_gjkMaxIters = 0;
}

 class b2SimplexVertex {
  public  wA: b2Vec2 = new b2Vec2(); // support point in proxyA
  public  wB: b2Vec2 = new b2Vec2(); // support point in proxyB
  public  w: b2Vec2 = new b2Vec2(); // wB - wA
  public a: number = 0; // barycentric coordinate for closest point
  public indexA: number = 0; // wA index
  public indexB: number = 0; // wB index

  public Copy(other: b2SimplexVertex): b2SimplexVertex {
    this.wA.Copy(other.wA);     // support point in proxyA
    this.wB.Copy(other.wB);     // support point in proxyB
    this.w.Copy(other.w);       // wB - wA
    this.a = other.a;           // barycentric coordinate for closest point
    this.indexA = other.indexA; // wA index
    this.indexB = other.indexB; // wB index
    return this;
  }
}

 class b2Simplex {
  public  m_v1: b2SimplexVertex = new b2SimplexVertex();
  public  m_v2: b2SimplexVertex = new b2SimplexVertex();
  public  m_v3: b2SimplexVertex = new b2SimplexVertex();
  public  m_vertices: b2SimplexVertex[] = [/*3*/];
  public m_count: number = 0;

  constructor() {
    this.m_vertices[0] = this.m_v1;
    this.m_vertices[1] = this.m_v2;
    this.m_vertices[2] = this.m_v3;
  }

  public ReadCache(cache: b2SimplexCache, proxyA: b2DistanceProxy, transformA: b2Transform, proxyB: b2DistanceProxy, transformB: b2Transform): void {
    // DEBUG: b2Assert(0 <= cache.count && cache.count <= 3);

    // Copy data from cache.
    this.m_count = cache.count;
    const vertices: b2SimplexVertex[] = this.m_vertices;
    for (let i: number = 0; i < this.m_count; ++i) {
      const v: b2SimplexVertex = vertices[i];
      v.indexA = cache.indexA[i];
      v.indexB = cache.indexB[i];
      const wALocal: b2Vec2 = proxyA.GetVertex(v.indexA);
      const wBLocal: b2Vec2 = proxyB.GetVertex(v.indexB);
      b2Transform.MulXV(transformA, wALocal, v.wA);
      b2Transform.MulXV(transformB, wBLocal, v.wB);
      b2Vec2.SubVV(v.wB, v.wA, v.w);
      v.a = 0;
    }

    // Compute the new simplex metric, if it is substantially different than
    // old metric then flush the simplex.
    if (this.m_count > 1) {
      const metric1: number = cache.metric;
      const metric2: number = this.GetMetric();
      if (metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < b2_epsilon) {
        // Reset the simplex.
        this.m_count = 0;
      }
    }

    // If the cache is empty or invalid ...
    if (this.m_count === 0) {
      const v: b2SimplexVertex = vertices[0];
      v.indexA = 0;
      v.indexB = 0;
      const wALocal: b2Vec2 = proxyA.GetVertex(0);
      const wBLocal: b2Vec2 = proxyB.GetVertex(0);
      b2Transform.MulXV(transformA, wALocal, v.wA);
      b2Transform.MulXV(transformB, wBLocal, v.wB);
      b2Vec2.SubVV(v.wB, v.wA, v.w);
      v.a = 1;
      this.m_count = 1;
    }
  }

  public WriteCache(cache: b2SimplexCache): void {
    cache.metric = this.GetMetric();
    cache.count = this.m_count;
    const vertices: b2SimplexVertex[] = this.m_vertices;
    for (let i: number = 0; i < this.m_count; ++i) {
      cache.indexA[i] = vertices[i].indexA;
      cache.indexB[i] = vertices[i].indexB;
    }
  }

  public GetSearchDirection(out: b2Vec2): b2Vec2 {
    switch (this.m_count) {
      case 1:
        return b2Vec2.NegV(this.m_v1.w, out);

      case 2: {
        const e12: b2Vec2 = b2Vec2.SubVV(this.m_v2.w, this.m_v1.w, out);
        const sgn: number = b2Vec2.CrossVV(e12, b2Vec2.NegV(this.m_v1.w, b2Vec2.s_t0));
        if (sgn > 0) {
          // Origin is left of e12.
          return b2Vec2.CrossOneV(e12, out);
        } else {
          // Origin is right of e12.
          return b2Vec2.CrossVOne(e12, out);
        }
      }

      default:
        // DEBUG: b2Assert(false);
        return out.SetZero();
    }
  }

  public GetClosestPoint(out: b2Vec2): b2Vec2 {
    switch (this.m_count) {
      case 0:
        // DEBUG: b2Assert(false);
        return out.SetZero();

      case 1:
        return out.Copy(this.m_v1.w);

      case 2:
        return out.Set(
          this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x,
          this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);

      case 3:
        return out.SetZero();

      default:
        // DEBUG: b2Assert(false);
        return out.SetZero();
    }
  }

  public GetWitnessPoints(pA: b2Vec2, pB: b2Vec2): void {
    switch (this.m_count) {
      case 0:
        // DEBUG: b2Assert(false);
        break;

      case 1:
        pA.Copy(this.m_v1.wA);
        pB.Copy(this.m_v1.wB);
        break;

      case 2:
        pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
        pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
        pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
        pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
        break;

      case 3:
        pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
        pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
        break;

      default:
        // DEBUG: b2Assert(false);
        break;
    }
  }

  public GetMetric(): number {
    switch (this.m_count) {
      case 0:
        // DEBUG: b2Assert(false);
        return 0;

      case 1:
        return 0;

      case 2:
        return b2Vec2.DistanceVV(this.m_v1.w, this.m_v2.w);

      case 3:
        return b2Vec2.CrossVV(b2Vec2.SubVV(this.m_v2.w, this.m_v1.w, b2Vec2.s_t0), b2Vec2.SubVV(this.m_v3.w, this.m_v1.w, b2Vec2.s_t1));

      default:
        // DEBUG: b2Assert(false);
        return 0;
    }
  }

  public Solve2(): void {
    const w1: b2Vec2 = this.m_v1.w;
    const w2: b2Vec2 = this.m_v2.w;
    const e12: b2Vec2 = b2Vec2.SubVV(w2, w1, b2Simplex.s_e12);

    // w1 region
    const d12_2: number = (-b2Vec2.DotVV(w1, e12));
    if (d12_2 <= 0) {
      // a2 <= 0, so we clamp it to 0
      this.m_v1.a = 1;
      this.m_count = 1;
      return;
    }

    // w2 region
    const d12_1: number = b2Vec2.DotVV(w2, e12);
    if (d12_1 <= 0) {
      // a1 <= 0, so we clamp it to 0
      this.m_v2.a = 1;
      this.m_count = 1;
      this.m_v1.Copy(this.m_v2);
      return;
    }

    // Must be in e12 region.
    const inv_d12: number = 1 / (d12_1 + d12_2);
    this.m_v1.a = d12_1 * inv_d12;
    this.m_v2.a = d12_2 * inv_d12;
    this.m_count = 2;
  }

  public Solve3(): void {
    const w1: b2Vec2 = this.m_v1.w;
    const w2: b2Vec2 = this.m_v2.w;
    const w3: b2Vec2 = this.m_v3.w;

    // Edge12
    // [1      1     ][a1] = [1]
    // [w1.e12 w2.e12][a2] = [0]
    // a3 = 0
    const e12: b2Vec2 = b2Vec2.SubVV(w2, w1, b2Simplex.s_e12);
    const w1e12: number = b2Vec2.DotVV(w1, e12);
    const w2e12: number = b2Vec2.DotVV(w2, e12);
    const d12_1: number = w2e12;
    const d12_2: number = (-w1e12);

    // Edge13
    // [1      1     ][a1] = [1]
    // [w1.e13 w3.e13][a3] = [0]
    // a2 = 0
    const e13: b2Vec2 = b2Vec2.SubVV(w3, w1, b2Simplex.s_e13);
    const w1e13: number = b2Vec2.DotVV(w1, e13);
    const w3e13: number = b2Vec2.DotVV(w3, e13);
    const d13_1: number = w3e13;
    const d13_2: number = (-w1e13);

    // Edge23
    // [1      1     ][a2] = [1]
    // [w2.e23 w3.e23][a3] = [0]
    // a1 = 0
    const e23: b2Vec2 = b2Vec2.SubVV(w3, w2, b2Simplex.s_e23);
    const w2e23: number = b2Vec2.DotVV(w2, e23);
    const w3e23: number = b2Vec2.DotVV(w3, e23);
    const d23_1: number = w3e23;
    const d23_2: number = (-w2e23);

    // Triangle123
    const n123: number = b2Vec2.CrossVV(e12, e13);

    const d123_1: number = n123 * b2Vec2.CrossVV(w2, w3);
    const d123_2: number = n123 * b2Vec2.CrossVV(w3, w1);
    const d123_3: number = n123 * b2Vec2.CrossVV(w1, w2);

    // w1 region
    if (d12_2 <= 0 && d13_2 <= 0) {
      this.m_v1.a = 1;
      this.m_count = 1;
      return;
    }

    // e12
    if (d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
      const inv_d12: number = 1 / (d12_1 + d12_2);
      this.m_v1.a = d12_1 * inv_d12;
      this.m_v2.a = d12_2 * inv_d12;
      this.m_count = 2;
      return;
    }

    // e13
    if (d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
      const inv_d13: number = 1 / (d13_1 + d13_2);
      this.m_v1.a = d13_1 * inv_d13;
      this.m_v3.a = d13_2 * inv_d13;
      this.m_count = 2;
      this.m_v2.Copy(this.m_v3);
      return;
    }

    // w2 region
    if (d12_1 <= 0 && d23_2 <= 0) {
      this.m_v2.a = 1;
      this.m_count = 1;
      this.m_v1.Copy(this.m_v2);
      return;
    }

    // w3 region
    if (d13_1 <= 0 && d23_1 <= 0) {
      this.m_v3.a = 1;
      this.m_count = 1;
      this.m_v1.Copy(this.m_v3);
      return;
    }

    // e23
    if (d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
      const inv_d23: number = 1 / (d23_1 + d23_2);
      this.m_v2.a = d23_1 * inv_d23;
      this.m_v3.a = d23_2 * inv_d23;
      this.m_count = 2;
      this.m_v1.Copy(this.m_v3);
      return;
    }

    // Must be in triangle123
    const inv_d123: number = 1 / (d123_1 + d123_2 + d123_3);
    this.m_v1.a = d123_1 * inv_d123;
    this.m_v2.a = d123_2 * inv_d123;
    this.m_v3.a = d123_3 * inv_d123;
    this.m_count = 3;
  }
  private static s_e12: b2Vec2 = new b2Vec2();
  private static s_e13: b2Vec2 = new b2Vec2();
  private static s_e23: b2Vec2 = new b2Vec2();
}

const b2Distance_s_simplex: b2Simplex = new b2Simplex();
const b2Distance_s_saveA: [number, number, number] = [0, 0, 0];
const b2Distance_s_saveB: [number, number, number] = [0, 0, 0];
const b2Distance_s_p: b2Vec2 = new b2Vec2();
const b2Distance_s_d: b2Vec2 = new b2Vec2();
const b2Distance_s_normal: b2Vec2 = new b2Vec2();
const b2Distance_s_supportA: b2Vec2 = new b2Vec2();
const b2Distance_s_supportB: b2Vec2 = new b2Vec2();
 function b2Distance(output: b2DistanceOutput, cache: b2SimplexCache, input: b2DistanceInput): void {
  ++b2_gjkCalls;

  const proxyA: b2DistanceProxy = input.proxyA;
  const proxyB: b2DistanceProxy = input.proxyB;

  const transformA: b2Transform = input.transformA;
  const transformB: b2Transform = input.transformB;

  // Initialize the simplex.
  const simplex: b2Simplex = b2Distance_s_simplex;
  simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);

  // Get simplex vertices as an array.
  const vertices: b2SimplexVertex[] = simplex.m_vertices;
  const k_maxIters: number = 20;

  // These store the vertices of the last simplex so that we
  // can check for duplicates and prevent cycling.
  const saveA: [number, number, number] = b2Distance_s_saveA;
  const saveB: [number, number, number] = b2Distance_s_saveB;
  let saveCount: number = 0;

  // Main iteration loop.
  let iter: number = 0;
  while (iter < k_maxIters) {
    // Copy simplex so we can identify duplicates.
    saveCount = simplex.m_count;
    for (let i: number = 0; i < saveCount; ++i) {
      saveA[i] = vertices[i].indexA;
      saveB[i] = vertices[i].indexB;
    }

    switch (simplex.m_count) {
      case 1:
        break;

      case 2:
        simplex.Solve2();
        break;

      case 3:
        simplex.Solve3();
        break;

      default:
        // DEBUG: b2Assert(false);
        break;
    }

    // If we have 3 points, then the origin is in the corresponding triangle.
    if (simplex.m_count === 3) {
      break;
    }

    // Get search direction.
    const d: b2Vec2 = simplex.GetSearchDirection(b2Distance_s_d);

    // Ensure the search direction is numerically fit.
    if (d.LengthSquared() < b2_epsilon_sq) {
      // The origin is probably contained by a line segment
      // or triangle. Thus the shapes are overlapped.

      // We can't return zero here even though there may be overlap.
      // In case the simplex is a point, segment, or triangle it is difficult
      // to determine if the origin is contained in the CSO or very close to it.
      break;
    }

    // Compute a tentative new simplex vertex using support points.
    const vertex: b2SimplexVertex = vertices[simplex.m_count];
    vertex.indexA = proxyA.GetSupport(b2Rot.MulTRV(transformA.q, b2Vec2.NegV(d, b2Vec2.s_t0), b2Distance_s_supportA));
    b2Transform.MulXV(transformA, proxyA.GetVertex(vertex.indexA), vertex.wA);
    vertex.indexB = proxyB.GetSupport(b2Rot.MulTRV(transformB.q, d, b2Distance_s_supportB));
    b2Transform.MulXV(transformB, proxyB.GetVertex(vertex.indexB), vertex.wB);
    b2Vec2.SubVV(vertex.wB, vertex.wA, vertex.w);

    // Iteration count is equated to the number of support point calls.
    ++iter;
    ++b2_gjkIters;

    // Check for duplicate support points. This is the main termination criteria.
    let duplicate: boolean = false;
    for (let i: number = 0; i < saveCount; ++i) {
      if (vertex.indexA === saveA[i] && vertex.indexB === saveB[i]) {
        duplicate = true;
        break;
      }
    }

    // If we found a duplicate support point we must exit to avoid cycling.
    if (duplicate) {
      break;
    }

    // New vertex is ok and needed.
    ++simplex.m_count;
  }

  b2_gjkMaxIters = b2Max(b2_gjkMaxIters, iter);

  // Prepare output.
  simplex.GetWitnessPoints(output.pointA, output.pointB);
  output.distance = b2Vec2.DistanceVV(output.pointA, output.pointB);
  output.iterations = iter;

  // Cache the simplex.
  simplex.WriteCache(cache);

  // Apply radii if requested.
  if (input.useRadii) {
    const rA: number = proxyA.m_radius;
    const rB: number = proxyB.m_radius;

    if (output.distance > (rA + rB) && output.distance > b2_epsilon) {
      // Shapes are still no overlapped.
      // Move the witness points to the outer surface.
      output.distance -= rA + rB;
      const normal: b2Vec2 = b2Vec2.SubVV(output.pointB, output.pointA, b2Distance_s_normal);
      normal.Normalize();
      output.pointA.SelfMulAdd(rA, normal);
      output.pointB.SelfMulSub(rB, normal);
    } else {
      // Shapes are overlapped when radii are considered.
      // Move the witness points to the middle.
      const p: b2Vec2 = b2Vec2.MidVV(output.pointA, output.pointB, b2Distance_s_p);
      output.pointA.Copy(p);
      output.pointB.Copy(p);
      output.distance = 0;
    }
  }
}

/// Perform a linear shape cast of shape B moving and shape A fixed. Determines the hit point, normal, and translation fraction.

// GJK-raycast
// Algorithm by Gino van den Bergen.
// "Smooth Mesh Contacts with GJK" in Game Physics Pearls. 2010
// bool b2ShapeCast(b2ShapeCastOutput* output, const b2ShapeCastInput* input);
const b2ShapeCast_s_n = new b2Vec2();
const b2ShapeCast_s_simplex = new b2Simplex();
const b2ShapeCast_s_wA = new b2Vec2();
const b2ShapeCast_s_wB = new b2Vec2();
const b2ShapeCast_s_v = new b2Vec2();
const b2ShapeCast_s_p = new b2Vec2();
const b2ShapeCast_s_pointA = new b2Vec2();
const b2ShapeCast_s_pointB = new b2Vec2();
 function b2ShapeCast(output: b2ShapeCastOutput, input: b2ShapeCastInput): boolean {
  output.iterations = 0;
  output.lambda = 1.0;
  output.normal.SetZero();
  output.point.SetZero();

  // const b2DistanceProxy* proxyA = &input.proxyA;
  const proxyA = input.proxyA;
  // const b2DistanceProxy* proxyB = &input.proxyB;
  const proxyB = input.proxyB;

  // float32 radiusA = b2Max(proxyA.m_radius, b2_polygonRadius);
  const radiusA = b2Max(proxyA.m_radius, b2_polygonRadius);
  // float32 radiusB = b2Max(proxyB.m_radius, b2_polygonRadius);
  const radiusB = b2Max(proxyB.m_radius, b2_polygonRadius);
  // float32 radius = radiusA + radiusB;
  const radius = radiusA + radiusB;

  // b2Transform xfA = input.transformA;
  const xfA = input.transformA;
  // b2Transform xfB = input.transformB;
  const xfB = input.transformB;

  // b2Vec2 r = input.translationB;
  const r = input.translationB;
  // b2Vec2 n(0.0f, 0.0f);
  const n = b2ShapeCast_s_n.Set(0.0, 0.0);
  // float32 lambda = 0.0f;
  let lambda = 0.0;

  // Initial simplex
  const simplex = b2ShapeCast_s_simplex;
  simplex.m_count = 0;

  // Get simplex vertices as an array.
  // b2SimplexVertex* vertices = &simplex.m_v1;
  const vertices = simplex.m_vertices;

  // Get support point in -r direction
  // int32 indexA = proxyA.GetSupport(b2MulT(xfA.q, -r));
  let indexA = proxyA.GetSupport(b2Rot.MulTRV(xfA.q, b2Vec2.NegV(r, b2Vec2.s_t1), b2Vec2.s_t0));
  // b2Vec2 wA = b2Mul(xfA, proxyA.GetVertex(indexA));
  let wA = b2Transform.MulXV(xfA, proxyA.GetVertex(indexA), b2ShapeCast_s_wA);
  // int32 indexB = proxyB.GetSupport(b2MulT(xfB.q, r));
  let indexB = proxyB.GetSupport(b2Rot.MulTRV(xfB.q, r, b2Vec2.s_t0));
  // b2Vec2 wB = b2Mul(xfB, proxyB.GetVertex(indexB));
  let wB = b2Transform.MulXV(xfB, proxyB.GetVertex(indexB), b2ShapeCast_s_wB);
  // b2Vec2 v = wA - wB;
  const v = b2Vec2.SubVV(wA, wB, b2ShapeCast_s_v);

  // Sigma is the target distance between polygons
  // float32 sigma = b2Max(b2_polygonRadius, radius - b2_polygonRadius);
  const sigma = b2Max(b2_polygonRadius, radius - b2_polygonRadius);
  // const float32 tolerance = 0.5f * b2_linearSlop;
  const tolerance = 0.5 * b2_linearSlop;

  // Main iteration loop.
  // const int32 k_maxIters = 20;
  const k_maxIters = 20;
  // int32 iter = 0;
  let iter = 0;
  // while (iter < k_maxIters && v.Length() - sigma > tolerance)
  while (iter < k_maxIters && v.Length() - sigma > tolerance) {
    // DEBUG: b2Assert(simplex.m_count < 3);

    output.iterations += 1;

    // Support in direction -v (A - B)
    // indexA = proxyA.GetSupport(b2MulT(xfA.q, -v));
    indexA = proxyA.GetSupport(b2Rot.MulTRV(xfA.q, b2Vec2.NegV(v, b2Vec2.s_t1), b2Vec2.s_t0));
    // wA = b2Mul(xfA, proxyA.GetVertex(indexA));
    wA = b2Transform.MulXV(xfA, proxyA.GetVertex(indexA), b2ShapeCast_s_wA);
    // indexB = proxyB.GetSupport(b2MulT(xfB.q, v));
    indexB = proxyB.GetSupport(b2Rot.MulTRV(xfB.q, v, b2Vec2.s_t0));
    // wB = b2Mul(xfB, proxyB.GetVertex(indexB));
    wB = b2Transform.MulXV(xfB, proxyB.GetVertex(indexB), b2ShapeCast_s_wB);
    // b2Vec2 p = wA - wB;
    const p = b2Vec2.SubVV(wA, wB, b2ShapeCast_s_p);

    // -v is a normal at p
    v.Normalize();

    // Intersect ray with plane
    const vp = b2Vec2.DotVV(v, p);
    const vr = b2Vec2.DotVV(v, r);
    if (vp - sigma > lambda * vr) {
      if (vr <= 0.0) {
        return false;
      }

      lambda = (vp - sigma) / vr;
      if (lambda > 1.0) {
        return false;
      }

      // n = -v;
      n.Copy(v).SelfNeg();
      simplex.m_count = 0;
    }

    // Reverse simplex since it works with B - A.
    // Shift by lambda * r because we want the closest point to the current clip point.
    // Note that the support point p is not shifted because we want the plane equation
    // to be formed in unshifted space.
    // b2SimplexVertex* vertex = vertices + simplex.m_count;
    const vertex: b2SimplexVertex = vertices[simplex.m_count];
    vertex.indexA = indexB;
    // vertex.wA = wB + lambda * r;
    vertex.wA.Copy(wB).SelfMulAdd(lambda, r);
    vertex.indexB = indexA;
    // vertex.wB = wA;
    vertex.wB.Copy(wA);
    // vertex.w = vertex.wB - vertex.wA;
    vertex.w.Copy(vertex.wB).SelfSub(vertex.wA);
    vertex.a = 1.0;
    simplex.m_count += 1;

    switch (simplex.m_count) {
      case 1:
        break;

      case 2:
        simplex.Solve2();
        break;

      case 3:
        simplex.Solve3();
        break;

      default:
      // DEBUG: b2Assert(false);
    }

    // If we have 3 points, then the origin is in the corresponding triangle.
    if (simplex.m_count === 3) {
      // Overlap
      return false;
    }

    // Get search direction.
    // v = simplex.GetClosestPoint();
    simplex.GetClosestPoint(v);

    // Iteration count is equated to the number of support point calls.
    ++iter;
  }

  if (iter === 0) {
    // Initial overlap
    return false;
  }

  // Prepare output.
  const pointA = b2ShapeCast_s_pointA;
  const pointB = b2ShapeCast_s_pointB;
  simplex.GetWitnessPoints(pointA, pointB);

  if (v.LengthSquared() > 0.0) {
    // n = -v;
    n.Copy(v).SelfNeg();
    n.Normalize();
  }

  // output.point = pointA + radiusA * n;
  output.normal.Copy(n);
  output.lambda = lambda;
  output.iterations = iter;
  return true;
}
/*
* Copyright (c) 2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 





function verify<T>(value: T ): T {
  if (value === null) { throw new Error(); }
  return value;
}

/// A node in the dynamic tree. The client does not interact with this directly.
 class b2TreeNode<T> {
  public  m_id: number = 0;
  public  aabb: b2AABB = new b2AABB();
  private _userData: T  = null;
  public get userData(): T {
    if (this._userData === null) { throw new Error(); }
    return this._userData;
  }
  public set userData(value: T) {
    if (this._userData !== null) { throw new Error(); }
    this._userData = value;
  }
  public parent: b2TreeNode<T>  = null; // or next
  public child1: b2TreeNode<T>  = null;
  public child2: b2TreeNode<T>  = null;
  public height: number = 0; // leaf = 0, free node = -1

  public moved: boolean = false;

  constructor(id: number = 0) {
    this.m_id = id;
  }

  public Reset(): void {
    this._userData = null;
  }

  public IsLeaf(): boolean {
    return this.child1 === null;
  }
}

 class b2DynamicTree<T> {
  public m_root: b2TreeNode<T>  = null;

  // b2TreeNode* public m_nodes;
  // int32 public m_nodeCount;
  // int32 public m_nodeCapacity;

  public m_freeList: b2TreeNode<T>  = null;

  public m_insertionCount: number = 0;

  public  m_stack = new b2GrowableStack<b2TreeNode<T> >(256);
  public static  s_r = new b2Vec2();
  public static  s_v = new b2Vec2();
  public static  s_abs_v = new b2Vec2();
  public static  s_segmentAABB = new b2AABB();
  public static  s_subInput = new b2RayCastInput();
  public static  s_combinedAABB = new b2AABB();
  public static  s_aabb = new b2AABB();

  // public GetUserData(node: b2TreeNode<T>): T {
  //   // DEBUG: b2Assert(node !== null);
  //   return node.userData;
  // }

  // public WasMoved(node: b2TreeNode<T>): boolean {
  //   return node.moved;
  // }

  // public ClearMoved(node: b2TreeNode<T>): void {
  //   node.moved = false;
  // }

  // public GetFatAABB(node: b2TreeNode<T>): b2AABB {
  //   // DEBUG: b2Assert(node !== null);
  //   return node.aabb;
  // }

  public Query(aabb: b2AABB, callback: (node: b2TreeNode<T>) => boolean): void {
    const stack: b2GrowableStack<b2TreeNode<T> > = this.m_stack.Reset();
    stack.Push(this.m_root);

    while (stack.GetCount() > 0) {
      const node: b2TreeNode<T>  = stack.Pop();
      if (node === null) {
        continue;
      }

      if (node.aabb.TestOverlap(aabb)) {
        if (node.IsLeaf()) {
          const proceed: boolean = callback(node);
          if (!proceed) {
            return;
          }
        } else {
          stack.Push(node.child1);
          stack.Push(node.child2);
        }
      }
    }
  }

  public QueryPoint(point: XY, callback: (node: b2TreeNode<T>) => boolean): void {
    const stack: b2GrowableStack<b2TreeNode<T> > = this.m_stack.Reset();
    stack.Push(this.m_root);

    while (stack.GetCount() > 0) {
      const node: b2TreeNode<T>  = stack.Pop();
      if (node === null) {
        continue;
      }

      if (node.aabb.TestContain(point)) {
        if (node.IsLeaf()) {
          const proceed: boolean = callback(node);
          if (!proceed) {
            return;
          }
        } else {
          stack.Push(node.child1);
          stack.Push(node.child2);
        }
      }
    }
  }

  public RayCast(input: b2RayCastInput, callback: (input: b2RayCastInput, node: b2TreeNode<T>) => number): void {
    const p1: b2Vec2 = input.p1;
    const p2: b2Vec2 = input.p2;
    const r: b2Vec2 = b2Vec2.SubVV(p2, p1, b2DynamicTree.s_r);
    // DEBUG: b2Assert(r.LengthSquared() > 0);
    r.Normalize();

    // v is perpendicular to the segment.
    const v: b2Vec2 = b2Vec2.CrossOneV(r, b2DynamicTree.s_v);
    const abs_v: b2Vec2 = b2Vec2.AbsV(v, b2DynamicTree.s_abs_v);

    // Separating axis for segment (Gino, p80).
    // |dot(v, p1 - c)| > dot(|v|, h)

    let maxFraction: number = input.maxFraction;

    // Build a bounding box for the segment.
    const segmentAABB: b2AABB = b2DynamicTree.s_segmentAABB;
    let t_x: number = p1.x + maxFraction * (p2.x - p1.x);
    let t_y: number = p1.y + maxFraction * (p2.y - p1.y);
    segmentAABB.lowerBound.x = b2Min(p1.x, t_x);
    segmentAABB.lowerBound.y = b2Min(p1.y, t_y);
    segmentAABB.upperBound.x = b2Max(p1.x, t_x);
    segmentAABB.upperBound.y = b2Max(p1.y, t_y);

    const stack: b2GrowableStack<b2TreeNode<T> > = this.m_stack.Reset();
    stack.Push(this.m_root);

    while (stack.GetCount() > 0) {
      const node: b2TreeNode<T>  = stack.Pop();
      if (node === null) {
        continue;
      }

      if (!b2TestOverlapAABB(node.aabb, segmentAABB)) {
        continue;
      }

      // Separating axis for segment (Gino, p80).
      // |dot(v, p1 - c)| > dot(|v|, h)
      const c: b2Vec2 = node.aabb.GetCenter();
      const h: b2Vec2 = node.aabb.GetExtents();
      const separation: number = b2Abs(b2Vec2.DotVV(v, b2Vec2.SubVV(p1, c, b2Vec2.s_t0))) - b2Vec2.DotVV(abs_v, h);
      if (separation > 0) {
        continue;
      }

      if (node.IsLeaf()) {
        const subInput: b2RayCastInput = b2DynamicTree.s_subInput;
        subInput.p1.Copy(input.p1);
        subInput.p2.Copy(input.p2);
        subInput.maxFraction = maxFraction;

        const value: number = callback(subInput, node);

        if (value === 0) {
          // The client has terminated the ray cast.
          return;
        }

        if (value > 0) {
          // Update segment bounding box.
          maxFraction = value;
          t_x = p1.x + maxFraction * (p2.x - p1.x);
          t_y = p1.y + maxFraction * (p2.y - p1.y);
          segmentAABB.lowerBound.x = b2Min(p1.x, t_x);
          segmentAABB.lowerBound.y = b2Min(p1.y, t_y);
          segmentAABB.upperBound.x = b2Max(p1.x, t_x);
          segmentAABB.upperBound.y = b2Max(p1.y, t_y);
        }
      } else {
        stack.Push(node.child1);
        stack.Push(node.child2);
      }
    }
  }

  public static s_node_id: number = 0;

  public AllocateNode(): b2TreeNode<T> {
    // Expand the node pool as needed.
    if (this.m_freeList !== null) {
      const node: b2TreeNode<T> = this.m_freeList;
      this.m_freeList = node.parent; // this.m_freeList = node.next;
      node.parent = null;
      node.child1 = null;
      node.child2 = null;
      node.height = 0;
      node.moved = false;
      return node;
    }

    return new b2TreeNode<T>(b2DynamicTree.s_node_id++);
  }

  public FreeNode(node: b2TreeNode<T>): void {
    node.parent = this.m_freeList; // node.next = this.m_freeList;
    node.child1 = null;
    node.child2 = null;
    node.height = -1;
    node.Reset();
    this.m_freeList = node;
  }

  public CreateProxy(aabb: b2AABB, userData: T): b2TreeNode<T> {
    const node: b2TreeNode<T> = this.AllocateNode();

    // Fatten the aabb.
    const r_x: number = b2_aabbExtension;
    const r_y: number = b2_aabbExtension;
    node.aabb.lowerBound.x = aabb.lowerBound.x - r_x;
    node.aabb.lowerBound.y = aabb.lowerBound.y - r_y;
    node.aabb.upperBound.x = aabb.upperBound.x + r_x;
    node.aabb.upperBound.y = aabb.upperBound.y + r_y;
    node.userData = userData;
    node.height = 0;
    node.moved = true;

    this.InsertLeaf(node);

    return node;
  }

  public DestroyProxy(node: b2TreeNode<T>): void {
    // DEBUG: b2Assert(node.IsLeaf());

    this.RemoveLeaf(node);
    this.FreeNode(node);
  }

  private static MoveProxy_s_fatAABB = new b2AABB();
  private static MoveProxy_s_hugeAABB = new b2AABB();
  public MoveProxy(node: b2TreeNode<T>, aabb: b2AABB, displacement: b2Vec2): boolean {
    // DEBUG: b2Assert(node.IsLeaf());

    // Extend AABB
    const fatAABB: b2AABB = b2DynamicTree.MoveProxy_s_fatAABB;
    const r_x: number = b2_aabbExtension;
    const r_y: number = b2_aabbExtension;
    fatAABB.lowerBound.x = aabb.lowerBound.x - r_x;
    fatAABB.lowerBound.y = aabb.lowerBound.y - r_y;
    fatAABB.upperBound.x = aabb.upperBound.x + r_x;
    fatAABB.upperBound.y = aabb.upperBound.y + r_y;

    // Predict AABB movement
    const d_x: number = b2_aabbMultiplier * displacement.x;
    const d_y: number = b2_aabbMultiplier * displacement.y;

    if (d_x < 0.0) {
      fatAABB.lowerBound.x += d_x;
    } else {
      fatAABB.upperBound.x += d_x;
    }

    if (d_y < 0.0) {
      fatAABB.lowerBound.y += d_y;
    } else {
      fatAABB.upperBound.y += d_y;
    }

    const treeAABB = node.aabb; // m_nodes[proxyId].aabb;
    if (treeAABB.Contains(aabb)) {
      // The tree AABB still contains the object, but it might be too large.
      // Perhaps the object was moving fast but has since gone to sleep.
      // The huge AABB is larger than the new fat AABB.
      const hugeAABB: b2AABB = b2DynamicTree.MoveProxy_s_hugeAABB;
      hugeAABB.lowerBound.x = fatAABB.lowerBound.x - 4.0 * r_x;
      hugeAABB.lowerBound.y = fatAABB.lowerBound.y - 4.0 * r_y;
      hugeAABB.upperBound.x = fatAABB.upperBound.x + 4.0 * r_x;
      hugeAABB.upperBound.y = fatAABB.upperBound.y + 4.0 * r_y;

      if (hugeAABB.Contains(treeAABB)) {
        // The tree AABB contains the object AABB and the tree AABB is
        // not too large. No tree update needed.
        return false;
      }

      // Otherwise the tree AABB is huge and needs to be shrunk
    }

    this.RemoveLeaf(node);

    node.aabb.Copy(fatAABB); // m_nodes[proxyId].aabb = fatAABB;

    this.InsertLeaf(node);

    node.moved = true;

    return true;
  }

  public InsertLeaf(leaf: b2TreeNode<T>): void {
    ++this.m_insertionCount;

    if (this.m_root === null) {
      this.m_root = leaf;
      this.m_root.parent = null;
      return;
    }

    // Find the best sibling for this node
    const leafAABB: b2AABB = leaf.aabb;
    let sibling: b2TreeNode<T> = this.m_root;
    while (!sibling.IsLeaf()) {
      const child1: b2TreeNode<T> = verify(sibling.child1);
      const child2: b2TreeNode<T> = verify(sibling.child2);

      const area: number = sibling.aabb.GetPerimeter();

      const combinedAABB: b2AABB = b2DynamicTree.s_combinedAABB;
      combinedAABB.Combine2(sibling.aabb, leafAABB);
      const combinedArea: number = combinedAABB.GetPerimeter();

      // Cost of creating a new parent for this node and the new leaf
      const cost: number = 2 * combinedArea;

      // Minimum cost of pushing the leaf further down the tree
      const inheritanceCost: number = 2 * (combinedArea - area);

      // Cost of descending into child1
      let cost1: number;
      const aabb: b2AABB = b2DynamicTree.s_aabb;
      let oldArea: number;
      let newArea: number;
      if (child1.IsLeaf()) {
        aabb.Combine2(leafAABB, child1.aabb);
        cost1 = aabb.GetPerimeter() + inheritanceCost;
      } else {
        aabb.Combine2(leafAABB, child1.aabb);
        oldArea = child1.aabb.GetPerimeter();
        newArea = aabb.GetPerimeter();
        cost1 = (newArea - oldArea) + inheritanceCost;
      }

      // Cost of descending into child2
      let cost2: number;
      if (child2.IsLeaf()) {
        aabb.Combine2(leafAABB, child2.aabb);
        cost2 = aabb.GetPerimeter() + inheritanceCost;
      } else {
        aabb.Combine2(leafAABB, child2.aabb);
        oldArea = child2.aabb.GetPerimeter();
        newArea = aabb.GetPerimeter();
        cost2 = newArea - oldArea + inheritanceCost;
      }

      // Descend according to the minimum cost.
      if (cost < cost1 && cost < cost2) {
        break;
      }

      // Descend
      if (cost1 < cost2) {
        sibling = child1;
      } else {
        sibling = child2;
      }
    }

    // Create a parent for the siblings.
    const oldParent: b2TreeNode<T>  = sibling.parent;
    const newParent: b2TreeNode<T> = this.AllocateNode();
    newParent.parent = oldParent;
    newParent.aabb.Combine2(leafAABB, sibling.aabb);
    newParent.height = sibling.height + 1;

    if (oldParent !== null) {
      // The sibling was not the root.
      if (oldParent.child1 === sibling) {
        oldParent.child1 = newParent;
      } else {
        oldParent.child2 = newParent;
      }

      newParent.child1 = sibling;
      newParent.child2 = leaf;
      sibling.parent = newParent;
      leaf.parent = newParent;
    } else {
      // The sibling was the root.
      newParent.child1 = sibling;
      newParent.child2 = leaf;
      sibling.parent = newParent;
      leaf.parent = newParent;
      this.m_root = newParent;
    }

    // Walk back up the tree fixing heights and AABBs
    let node: b2TreeNode<T>  = leaf.parent;
    while (node !== null) {
      node = this.Balance(node);

      const child1: b2TreeNode<T> = verify(node.child1);
      const child2: b2TreeNode<T> = verify(node.child2);

      node.height = 1 + b2Max(child1.height, child2.height);
      node.aabb.Combine2(child1.aabb, child2.aabb);

      node = node.parent;
    }

    // this.Validate();
  }

  public RemoveLeaf(leaf: b2TreeNode<T>): void {
    if (leaf === this.m_root) {
      this.m_root = null;
      return;
    }

    const parent: b2TreeNode<T> = verify(leaf.parent);
    const grandParent: b2TreeNode<T>  = parent && parent.parent;
    const sibling: b2TreeNode<T> = verify(parent.child1 === leaf ? parent.child2 : parent.child1);

    if (grandParent !== null) {
      // Destroy parent and connect sibling to grandParent.
      if (grandParent.child1 === parent) {
        grandParent.child1 = sibling;
      } else {
        grandParent.child2 = sibling;
      }
      sibling.parent = grandParent;
      this.FreeNode(parent);

      // Adjust ancestor bounds.
      let index: b2TreeNode<T>  = grandParent;
      while (index !== null) {
        index = this.Balance(index);

        const child1: b2TreeNode<T> = verify(index.child1);
        const child2: b2TreeNode<T> = verify(index.child2);

        index.aabb.Combine2(child1.aabb, child2.aabb);
        index.height = 1 + b2Max(child1.height, child2.height);

        index = index.parent;
      }
    } else {
      this.m_root = sibling;
      sibling.parent = null;
      this.FreeNode(parent);
    }

    // this.Validate();
  }

  public Balance(A: b2TreeNode<T>): b2TreeNode<T> {
    // DEBUG: b2Assert(A !== null);

    if (A.IsLeaf() || A.height < 2) {
      return A;
    }

    const B: b2TreeNode<T> = verify(A.child1);
    const C: b2TreeNode<T> = verify(A.child2);

    const balance: number = C.height - B.height;

    // Rotate C up
    if (balance > 1) {
      const F: b2TreeNode<T> = verify(C.child1);
      const G: b2TreeNode<T> = verify(C.child2);

      // Swap A and C
      C.child1 = A;
      C.parent = A.parent;
      A.parent = C;

      // A's old parent should point to C
      if (C.parent !== null) {
        if (C.parent.child1 === A) {
          C.parent.child1 = C;
        } else {
          // DEBUG: b2Assert(C.parent.child2 === A);
          C.parent.child2 = C;
        }
      } else {
        this.m_root = C;
      }

      // Rotate
      if (F.height > G.height) {
        C.child2 = F;
        A.child2 = G;
        G.parent = A;
        A.aabb.Combine2(B.aabb, G.aabb);
        C.aabb.Combine2(A.aabb, F.aabb);

        A.height = 1 + b2Max(B.height, G.height);
        C.height = 1 + b2Max(A.height, F.height);
      } else {
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

    // Rotate B up
    if (balance < -1) {
      const D: b2TreeNode<T> = verify(B.child1);
      const E: b2TreeNode<T> = verify(B.child2);

      // Swap A and B
      B.child1 = A;
      B.parent = A.parent;
      A.parent = B;

      // A's old parent should point to B
      if (B.parent !== null) {
        if (B.parent.child1 === A) {
          B.parent.child1 = B;
        } else {
          // DEBUG: b2Assert(B.parent.child2 === A);
          B.parent.child2 = B;
        }
      } else {
        this.m_root = B;
      }

      // Rotate
      if (D.height > E.height) {
        B.child2 = D;
        A.child1 = E;
        E.parent = A;
        A.aabb.Combine2(C.aabb, E.aabb);
        B.aabb.Combine2(A.aabb, D.aabb);

        A.height = 1 + b2Max(C.height, E.height);
        B.height = 1 + b2Max(A.height, D.height);
      } else {
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
  }

  public GetHeight(): number {
    if (this.m_root === null) {
      return 0;
    }

    return this.m_root.height;
  }

  private static GetAreaNode<T>(node: b2TreeNode<T> ): number {
    if (node === null) {
      return 0;
    }

    if (node.IsLeaf()) {
      return 0;
    }

    let area: number = node.aabb.GetPerimeter();
    area += b2DynamicTree.GetAreaNode(node.child1);
    area += b2DynamicTree.GetAreaNode(node.child2);
    return area;
  }

  public GetAreaRatio(): number {
    if (this.m_root === null) {
      return 0;
    }

    const root: b2TreeNode<T> = this.m_root;
    const rootArea: number = root.aabb.GetPerimeter();

    const totalArea: number = b2DynamicTree.GetAreaNode(this.m_root);

    /*
    float32 totalArea = 0.0;
    for (int32 i = 0; i < m_nodeCapacity; ++i) {
      const b2TreeNode<T>* node = m_nodes + i;
      if (node.height < 0) {
        // Free node in pool
        continue;
      }

      totalArea += node.aabb.GetPerimeter();
    }
    */

    return totalArea / rootArea;
  }

  public static ComputeHeightNode<T>(node: b2TreeNode<T> ): number {
    if (node === null) {
      return 0;
    }

    if (node.IsLeaf()) {
      return 0;
    }

    const height1: number = b2DynamicTree.ComputeHeightNode(node.child1);
    const height2: number = b2DynamicTree.ComputeHeightNode(node.child2);
    return 1 + b2Max(height1, height2);
  }

  public ComputeHeight(): number {
    const height: number = b2DynamicTree.ComputeHeightNode(this.m_root);
    return height;
  }

  public ValidateStructure(node: b2TreeNode<T> ): void {
    if (node === null) {
      return;
    }

    if (node === this.m_root) {
      // DEBUG: b2Assert(node.parent === null);
    }

    if (node.IsLeaf()) {
      // DEBUG: b2Assert(node.child1 === null);
      // DEBUG: b2Assert(node.child2 === null);
      // DEBUG: b2Assert(node.height === 0);
      return;
    }

    const child1: b2TreeNode<T> = verify(node.child1);
    const child2: b2TreeNode<T> = verify(node.child2);

    // DEBUG: b2Assert(child1.parent === index);
    // DEBUG: b2Assert(child2.parent === index);

    this.ValidateStructure(child1);
    this.ValidateStructure(child2);
  }

  public ValidateMetrics(node: b2TreeNode<T> ): void {
    if (node === null) {
      return;
    }

    if (node.IsLeaf()) {
      // DEBUG: b2Assert(node.child1 === null);
      // DEBUG: b2Assert(node.child2 === null);
      // DEBUG: b2Assert(node.height === 0);
      return;
    }

    const child1: b2TreeNode<T> = verify(node.child1);
    const child2: b2TreeNode<T> = verify(node.child2);

    // DEBUG: const height1: number = child1.height;
    // DEBUG: const height2: number = child2.height;
    // DEBUG: const height: number = 1 + b2Max(height1, height2);
    // DEBUG: b2Assert(node.height === height);

    const aabb: b2AABB = b2DynamicTree.s_aabb;
    aabb.Combine2(child1.aabb, child2.aabb);

    // DEBUG: b2Assert(aabb.lowerBound === node.aabb.lowerBound);
    // DEBUG: b2Assert(aabb.upperBound === node.aabb.upperBound);

    this.ValidateMetrics(child1);
    this.ValidateMetrics(child2);
  }

  public Validate(): void {
    // DEBUG: this.ValidateStructure(this.m_root);
    // DEBUG: this.ValidateMetrics(this.m_root);

    // let freeCount: number = 0;
    // let freeIndex: b2TreeNode<T>  = this.m_freeList;
    // while (freeIndex !== null) {
    //   freeIndex = freeIndex.parent; // freeIndex = freeIndex.next;
    //   ++freeCount;
    // }

    // DEBUG: b2Assert(this.GetHeight() === this.ComputeHeight());

    // b2Assert(this.m_nodeCount + freeCount === this.m_nodeCapacity);
  }

  private static GetMaxBalanceNode<T>(node: b2TreeNode<T> , maxBalance: number): number {
    if (node === null) {
      return maxBalance;
    }

    if (node.height <= 1) {
      return maxBalance;
    }

    // DEBUG: b2Assert(!node.IsLeaf());

    const child1: b2TreeNode<T> = verify(node.child1);
    const child2: b2TreeNode<T> = verify(node.child2);
    const balance: number = b2Abs(child2.height - child1.height);
    return b2Max(maxBalance, balance);
  }

  public GetMaxBalance(): number {
    const maxBalance: number = b2DynamicTree.GetMaxBalanceNode(this.m_root, 0);

    /*
    int32 maxBalance = 0;
    for (int32 i = 0; i < m_nodeCapacity; ++i) {
      const b2TreeNode<T>* node = m_nodes + i;
      if (node.height <= 1) {
        continue;
      }

      b2Assert(!node.IsLeaf());

      int32 child1 = node.child1;
      int32 child2 = node.child2;
      int32 balance = b2Abs(m_nodes[child2].height - m_nodes[child1].height);
      maxBalance = b2Max(maxBalance, balance);
    }
    */

    return maxBalance;
  }

  public RebuildBottomUp(): void {
    /*
    int32* nodes = (int32*)b2Alloc(m_nodeCount * sizeof(int32));
    int32 count = 0;

    // Build array of leaves. Free the rest.
    for (int32 i = 0; i < m_nodeCapacity; ++i) {
      if (m_nodes[i].height < 0) {
        // free node in pool
        continue;
      }

      if (m_nodes[i].IsLeaf()) {
        m_nodes[i].parent = b2_nullNode;
        nodes[count] = i;
        ++count;
      } else {
        FreeNode(i);
      }
    }

    while (count > 1) {
      float32 minCost = b2_maxFloat;
      int32 iMin = -1, jMin = -1;
      for (int32 i = 0; i < count; ++i) {
        b2AABB aabbi = m_nodes[nodes[i]].aabb;

        for (int32 j = i + 1; j < count; ++j) {
          b2AABB aabbj = m_nodes[nodes[j]].aabb;
          b2AABB b;
          b.Combine(aabbi, aabbj);
          float32 cost = b.GetPerimeter();
          if (cost < minCost) {
            iMin = i;
            jMin = j;
            minCost = cost;
          }
        }
      }

      int32 index1 = nodes[iMin];
      int32 index2 = nodes[jMin];
      b2TreeNode<T>* child1 = m_nodes + index1;
      b2TreeNode<T>* child2 = m_nodes + index2;

      int32 parentIndex = AllocateNode();
      b2TreeNode<T>* parent = m_nodes + parentIndex;
      parent.child1 = index1;
      parent.child2 = index2;
      parent.height = 1 + b2Max(child1.height, child2.height);
      parent.aabb.Combine(child1.aabb, child2.aabb);
      parent.parent = b2_nullNode;

      child1.parent = parentIndex;
      child2.parent = parentIndex;

      nodes[jMin] = nodes[count-1];
      nodes[iMin] = parentIndex;
      --count;
    }

    m_root = nodes[0];
    b2Free(nodes);
    */

    this.Validate();
  }

  private static ShiftOriginNode<T>(node: b2TreeNode<T> , newOrigin: XY): void {
    if (node === null) {
      return;
    }

    if (node.height <= 1) {
      return;
    }

    // DEBUG: b2Assert(!node.IsLeaf());

    const child1: b2TreeNode<T>  = node.child1;
    const child2: b2TreeNode<T>  = node.child2;
    b2DynamicTree.ShiftOriginNode(child1, newOrigin);
    b2DynamicTree.ShiftOriginNode(child2, newOrigin);

    node.aabb.lowerBound.SelfSub(newOrigin);
    node.aabb.upperBound.SelfSub(newOrigin);
  }

  public ShiftOrigin(newOrigin: XY): void {

    b2DynamicTree.ShiftOriginNode(this.m_root, newOrigin);

    /*
    // Build array of leaves. Free the rest.
    for (int32 i = 0; i < m_nodeCapacity; ++i) {
      m_nodes[i].aabb.lowerBound -= newOrigin;
      m_nodes[i].aabb.upperBound -= newOrigin;
    }
    */
  }
}
/*
* Copyright (c) 2006-2010 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 







/// A line segment (edge) shape. These can be connected in chains or loops
/// to other edge shapes. Edges created independently are two-sided and do
/// no provide smooth movement across junctions.
 class b2EdgeShape extends b2Shape {
  public  m_vertex1: b2Vec2 = new b2Vec2();
  public  m_vertex2: b2Vec2 = new b2Vec2();
  public  m_vertex0: b2Vec2 = new b2Vec2();
  public  m_vertex3: b2Vec2 = new b2Vec2();

  /// Uses m_vertex0 and m_vertex3 to create smooth collision.
  public m_oneSided: boolean = false;

  constructor() {
    super(b2ShapeType.e_edgeShape, b2_polygonRadius);
  }

  /// Set this as a part of a sequence. Vertex v0 precedes the edge and vertex v3
	/// follows. These extra vertices are used to provide smooth movement
	/// across junctions. This also makes the collision one-sided. The edge
	/// normal points to the right looking from v1 to v2.
	// void SetOneSided(const b2Vec2& v0, const b2Vec2& v1,const b2Vec2& v2, const b2Vec2& v3);
  public SetOneSided(v0: XY, v1: XY, v2: XY, v3: XY): b2EdgeShape {
    this.m_vertex0.Copy(v0);
    this.m_vertex1.Copy(v1);
    this.m_vertex2.Copy(v2);
    this.m_vertex3.Copy(v3);
    this.m_oneSided = true;
    return this;
  }

	/// Set this as an isolated edge. Collision is two-sided.
  public SetTwoSided(v1: XY, v2: XY): b2EdgeShape {
    this.m_vertex1.Copy(v1);
    this.m_vertex2.Copy(v2);
    this.m_oneSided = false;
    return this;
  }

  /// Implement b2Shape.
  public Clone(): b2EdgeShape {
    return new b2EdgeShape().Copy(this);
  }

  public Copy(other: b2EdgeShape): b2EdgeShape {
    super.Copy(other);

    // DEBUG: b2Assert(other instanceof b2EdgeShape);

    this.m_vertex1.Copy(other.m_vertex1);
    this.m_vertex2.Copy(other.m_vertex2);
    this.m_vertex0.Copy(other.m_vertex0);
    this.m_vertex3.Copy(other.m_vertex3);
    this.m_oneSided = other.m_oneSided;

    return this;
  }

  /// @see b2Shape::GetChildCount
  public GetChildCount(): number {
    return 1;
  }

  /// @see b2Shape::TestPoint
  public TestPoint(xf: b2Transform, p: XY): boolean {
    return false;
  }

  // #if B2_ENABLE_PARTICLE
  /// @see b2Shape::ComputeDistance
  private static ComputeDistance_s_v1 = new b2Vec2();
  private static ComputeDistance_s_v2 = new b2Vec2();
  private static ComputeDistance_s_d = new b2Vec2();
  private static ComputeDistance_s_s = new b2Vec2();
  public ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number {
    const v1 = b2Transform.MulXV(xf, this.m_vertex1, b2EdgeShape.ComputeDistance_s_v1);
    const v2 = b2Transform.MulXV(xf, this.m_vertex2, b2EdgeShape.ComputeDistance_s_v2);

    const d = b2Vec2.SubVV(p, v1, b2EdgeShape.ComputeDistance_s_d);
    const s = b2Vec2.SubVV(v2, v1, b2EdgeShape.ComputeDistance_s_s);
    const ds = b2Vec2.DotVV(d, s);
    if (ds > 0) {
      const s2 = b2Vec2.DotVV(s, s);
      if (ds > s2) {
        b2Vec2.SubVV(p, v2, d);
      } else {
        d.SelfMulSub(ds / s2, s);
      }
    }
    normal.Copy(d);
    return normal.Normalize();
  }
  // #endif

  /// Implement b2Shape.
  // p = p1 + t * d
  // v = v1 + s * e
  // p1 + t * d = v1 + s * e
  // s * e - t * d = p1 - v1
  private static RayCast_s_p1 = new b2Vec2();
  private static RayCast_s_p2 = new b2Vec2();
  private static RayCast_s_d = new b2Vec2();
  private static RayCast_s_e = new b2Vec2();
  private static RayCast_s_q = new b2Vec2();
  private static RayCast_s_r = new b2Vec2();
  public RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean {
    // Put the ray into the edge's frame of reference.
    const p1: b2Vec2 = b2Transform.MulTXV(xf, input.p1, b2EdgeShape.RayCast_s_p1);
    const p2: b2Vec2 = b2Transform.MulTXV(xf, input.p2, b2EdgeShape.RayCast_s_p2);
    const d: b2Vec2 = b2Vec2.SubVV(p2, p1, b2EdgeShape.RayCast_s_d);

    const v1: b2Vec2 = this.m_vertex1;
    const v2: b2Vec2 = this.m_vertex2;
    const e: b2Vec2 = b2Vec2.SubVV(v2, v1, b2EdgeShape.RayCast_s_e);

  	// Normal points to the right, looking from v1 at v2
    const normal: b2Vec2 = output.normal.Set(e.y, -e.x).SelfNormalize();

    // q = p1 + t * d
    // dot(normal, q - v1) = 0
    // dot(normal, p1 - v1) + t * dot(normal, d) = 0
    const numerator: number = b2Vec2.DotVV(normal, b2Vec2.SubVV(v1, p1, b2Vec2.s_t0));
    if (this.m_oneSided && numerator > 0.0) {
      return false;
    }

    const denominator: number = b2Vec2.DotVV(normal, d);

    if (denominator === 0) {
      return false;
    }

    const t: number = numerator / denominator;
    if (t < 0 || input.maxFraction < t) {
      return false;
    }

    const q: b2Vec2 = b2Vec2.AddVMulSV(p1, t, d, b2EdgeShape.RayCast_s_q);

    // q = v1 + s * r
    // s = dot(q - v1, r) / dot(r, r)
    const r: b2Vec2 = b2Vec2.SubVV(v2, v1, b2EdgeShape.RayCast_s_r);
    const rr: number = b2Vec2.DotVV(r, r);
    if (rr === 0) {
      return false;
    }

    const s: number = b2Vec2.DotVV(b2Vec2.SubVV(q, v1, b2Vec2.s_t0), r) / rr;
    if (s < 0 || 1 < s) {
      return false;
    }

    output.fraction = t;
    b2Rot.MulRV(xf.q, output.normal, output.normal);
    if (numerator > 0) {
      output.normal.SelfNeg();
    }
    return true;
  }

  /// @see b2Shape::ComputeAABB
  private static ComputeAABB_s_v1 = new b2Vec2();
  private static ComputeAABB_s_v2 = new b2Vec2();
  public ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void {
    const v1: b2Vec2 = b2Transform.MulXV(xf, this.m_vertex1, b2EdgeShape.ComputeAABB_s_v1);
    const v2: b2Vec2 = b2Transform.MulXV(xf, this.m_vertex2, b2EdgeShape.ComputeAABB_s_v2);

    b2Vec2.MinV(v1, v2, aabb.lowerBound);
    b2Vec2.MaxV(v1, v2, aabb.upperBound);

    const r: number = this.m_radius;
    aabb.lowerBound.SelfSubXY(r, r);
    aabb.upperBound.SelfAddXY(r, r);
  }

  /// @see b2Shape::ComputeMass
  public ComputeMass(massData: b2MassData, density: number): void {
    massData.mass = 0;
    b2Vec2.MidVV(this.m_vertex1, this.m_vertex2, massData.center);
    massData.I = 0;
  }

  public SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void {
    proxy.m_vertices = proxy.m_buffer;
    proxy.m_vertices[0].Copy(this.m_vertex1);
    proxy.m_vertices[1].Copy(this.m_vertex2);
    proxy.m_count = 2;
    proxy.m_radius = this.m_radius;
  }

  public ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number {
    c.SetZero();
    return 0;
  }

  public Dump(log: (format: string, ...args: any[]) => void): void {
    log("    const shape: b2EdgeShape = new b2EdgeShape();\n");
    log("    shape.m_radius = %.15f;\n", this.m_radius);
    log("    shape.m_vertex0.Set(%.15f, %.15f);\n", this.m_vertex0.x, this.m_vertex0.y);
    log("    shape.m_vertex1.Set(%.15f, %.15f);\n", this.m_vertex1.x, this.m_vertex1.y);
    log("    shape.m_vertex2.Set(%.15f, %.15f);\n", this.m_vertex2.x, this.m_vertex2.y);
    log("    shape.m_vertex3.Set(%.15f, %.15f);\n", this.m_vertex3.x, this.m_vertex3.y);
    log("    shape.m_oneSided = %s;\n", this.m_oneSided);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 







/// A solid convex polygon. It is assumed that the interior of the polygon is to
/// the left of each edge.
/// In most cases you should not need many vertices for a convex polygon.
 class b2PolygonShape extends b2Shape {
  public  m_centroid: b2Vec2 = new b2Vec2(0, 0);
  public m_vertices: b2Vec2[] = [];
  public m_normals: b2Vec2[] = [];
  public m_count: number = 0;

  constructor() {
    super(b2ShapeType.e_polygonShape, b2_polygonRadius);
  }

  /// Implement b2Shape.
  public Clone(): b2PolygonShape {
    return new b2PolygonShape().Copy(this);
  }

  public Copy(other: b2PolygonShape): b2PolygonShape {
    super.Copy(other);

    // DEBUG: b2Assert(other instanceof b2PolygonShape);

    this.m_centroid.Copy(other.m_centroid);
    this.m_count = other.m_count;
    this.m_vertices = b2Vec2.MakeArray(this.m_count);
    this.m_normals = b2Vec2.MakeArray(this.m_count);
    for (let i: number = 0; i < this.m_count; ++i) {
      this.m_vertices[i].Copy(other.m_vertices[i]);
      this.m_normals[i].Copy(other.m_normals[i]);
    }
    return this;
  }

  /// @see b2Shape::GetChildCount
  public GetChildCount(): number {
    return 1;
  }

  /// Create a convex hull from the given array of points.
  /// @warning the points may be re-ordered, even if they form a convex polygon
  /// @warning collinear points are handled but not removed. Collinear points
  /// may lead to poor stacking behavior.
  private static Set_s_r = new b2Vec2();
  private static Set_s_v = new b2Vec2();
  public Set(vertices: XY[]): b2PolygonShape;
  public Set(vertices: XY[], count: number): b2PolygonShape;
  public Set(vertices: number[]): b2PolygonShape;
  public Set(...args: any[]): b2PolygonShape {
    if (typeof args[0][0] === "number") {
      const vertices: number[] = args[0];
      if (vertices.length % 2 !== 0) { throw new Error(); }
      return this._Set((index: number): XY => ({ x: vertices[index * 2], y: vertices[index * 2 + 1] }), vertices.length / 2);
    } else {
      const vertices: XY[] = args[0];
      const count: number = args[1] || vertices.length;
      return this._Set((index: number): XY => vertices[index], count);
    }
  }
  public _Set(vertices: (index: number) => XY, count: number): b2PolygonShape {

    // DEBUG: b2Assert(3 <= count);
    if (count < 3) {
      return this.SetAsBox(1, 1);
    }

    let n: number = count;

    // Perform welding and copy vertices into local buffer.
    const ps: XY[] = [];
    for (let i = 0; i < n; ++i) {
      const /*b2Vec2*/ v = vertices(i);

      let /*bool*/ unique = true;
      for (let /*int32*/ j = 0; j < ps.length; ++j) {
        if (b2Vec2.DistanceSquaredVV(v, ps[j]) < ((0.5 * b2_linearSlop) * (0.5 * b2_linearSlop))) {
          unique = false;
          break;
        }
      }

      if (unique) {
        ps.push(v);
      }
    }

    n = ps.length;
    if (n < 3) {
      // Polygon is degenerate.
      // DEBUG: b2Assert(false);
      return this.SetAsBox(1.0, 1.0);
    }

    // Create the convex hull using the Gift wrapping algorithm
    // http://en.wikipedia.org/wiki/Gift_wrapping_algorithm

    // Find the right most point on the hull
    let i0: number = 0;
    let x0: number = ps[0].x;
    for (let i: number = 1; i < n; ++i) {
      const x: number = ps[i].x;
      if (x > x0 || (x === x0 && ps[i].y < ps[i0].y)) {
        i0 = i;
        x0 = x;
      }
    }

    const hull: number[] = [];
    let m: number = 0;
    let ih: number = i0;

    for (; ;) {
      hull[m] = ih;

      let ie: number = 0;
      for (let j: number = 1; j < n; ++j) {
        if (ie === ih) {
          ie = j;
          continue;
        }

        const r: b2Vec2 = b2Vec2.SubVV(ps[ie], ps[hull[m]], b2PolygonShape.Set_s_r);
        const v: b2Vec2 = b2Vec2.SubVV(ps[j], ps[hull[m]], b2PolygonShape.Set_s_v);
        const c: number = b2Vec2.CrossVV(r, v);
        if (c < 0) {
          ie = j;
        }

        // Collinearity check
        if (c === 0 && v.LengthSquared() > r.LengthSquared()) {
          ie = j;
        }
      }

      ++m;
      ih = ie;

      if (ie === i0) {
        break;
      }
    }

    this.m_count = m;
    this.m_vertices = b2Vec2.MakeArray(this.m_count);
    this.m_normals = b2Vec2.MakeArray(this.m_count);

    // Copy vertices.
    for (let i: number = 0; i < m; ++i) {
      this.m_vertices[i].Copy(ps[hull[i]]);
    }

    // Compute normals. Ensure the edges have non-zero length.
    for (let i: number = 0; i < m; ++i) {
      const vertexi1: b2Vec2 = this.m_vertices[i];
      const vertexi2: b2Vec2 = this.m_vertices[(i + 1) % m];
      const edge: b2Vec2 = b2Vec2.SubVV(vertexi2, vertexi1, b2Vec2.s_t0); // edge uses s_t0
      // DEBUG: b2Assert(edge.LengthSquared() > b2_epsilon_sq);
      b2Vec2.CrossVOne(edge, this.m_normals[i]).SelfNormalize();
    }

    // Compute the polygon centroid.
    b2PolygonShape.ComputeCentroid(this.m_vertices, m, this.m_centroid);

    return this;
  }

  /// Build vertices to represent an axis-aligned box or an oriented box.
  /// @param hx the half-width.
  /// @param hy the half-height.
  /// @param center the center of the box in local coordinates.
  /// @param angle the rotation of the box in local coordinates.
  public SetAsBox(hx: number, hy: number, center?: XY, angle: number = 0): b2PolygonShape {
    this.m_count = 4;
    this.m_vertices = b2Vec2.MakeArray(this.m_count);
    this.m_normals = b2Vec2.MakeArray(this.m_count);
    this.m_vertices[0].Set((-hx), (-hy));
    this.m_vertices[1].Set(hx, (-hy));
    this.m_vertices[2].Set(hx, hy);
    this.m_vertices[3].Set((-hx), hy);
    this.m_normals[0].Set(0, (-1));
    this.m_normals[1].Set(1, 0);
    this.m_normals[2].Set(0, 1);
    this.m_normals[3].Set((-1), 0);
    this.m_centroid.SetZero();

    if (center) {
      this.m_centroid.Copy(center);

      const xf: b2Transform = new b2Transform();
      xf.SetPosition(center);
      xf.SetRotationAngle(angle);

      // Transform vertices and normals.
      for (let i: number = 0; i < this.m_count; ++i) {
        b2Transform.MulXV(xf, this.m_vertices[i], this.m_vertices[i]);
        b2Rot.MulRV(xf.q, this.m_normals[i], this.m_normals[i]);
      }
    }

    return this;
  }

  /// @see b2Shape::TestPoint
  private static TestPoint_s_pLocal = new b2Vec2();
  public TestPoint(xf: b2Transform, p: XY): boolean {
    const pLocal: b2Vec2 = b2Transform.MulTXV(xf, p, b2PolygonShape.TestPoint_s_pLocal);

    for (let i: number = 0; i < this.m_count; ++i) {
      const dot: number = b2Vec2.DotVV(this.m_normals[i], b2Vec2.SubVV(pLocal, this.m_vertices[i], b2Vec2.s_t0));
      if (dot > 0) {
        return false;
      }
    }

    return true;
  }

  // #if B2_ENABLE_PARTICLE
  /// @see b2Shape::ComputeDistance
  private static ComputeDistance_s_pLocal = new b2Vec2();
  private static ComputeDistance_s_normalForMaxDistance = new b2Vec2();
  private static ComputeDistance_s_minDistance = new b2Vec2();
  private static ComputeDistance_s_distance = new b2Vec2();
  public ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number {
    const pLocal = b2Transform.MulTXV(xf, p, b2PolygonShape.ComputeDistance_s_pLocal);
    let maxDistance = -b2_maxFloat;
    const normalForMaxDistance = b2PolygonShape.ComputeDistance_s_normalForMaxDistance.Copy(pLocal);

    for (let i = 0; i < this.m_count; ++i) {
      const dot = b2Vec2.DotVV(this.m_normals[i], b2Vec2.SubVV(pLocal, this.m_vertices[i], b2Vec2.s_t0));
      if (dot > maxDistance) {
        maxDistance = dot;
        normalForMaxDistance.Copy(this.m_normals[i]);
      }
    }

    if (maxDistance > 0) {
      const minDistance = b2PolygonShape.ComputeDistance_s_minDistance.Copy(normalForMaxDistance);
      let minDistance2 = maxDistance * maxDistance;
      for (let i = 0; i < this.m_count; ++i) {
        const distance = b2Vec2.SubVV(pLocal, this.m_vertices[i], b2PolygonShape.ComputeDistance_s_distance);
        const distance2 = distance.LengthSquared();
        if (minDistance2 > distance2) {
          minDistance.Copy(distance);
          minDistance2 = distance2;
        }
      }

      b2Rot.MulRV(xf.q, minDistance, normal);
      normal.Normalize();
      return Math.sqrt(minDistance2);
    } else {
      b2Rot.MulRV(xf.q, normalForMaxDistance, normal);
      return maxDistance;
    }
  }
  // #endif

  /// Implement b2Shape.
  /// @note because the polygon is solid, rays that start inside do not hit because the normal is
  /// not defined.
  private static RayCast_s_p1 = new b2Vec2();
  private static RayCast_s_p2 = new b2Vec2();
  private static RayCast_s_d = new b2Vec2();
  public RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean {
    // Put the ray into the polygon's frame of reference.
    const p1: b2Vec2 = b2Transform.MulTXV(xf, input.p1, b2PolygonShape.RayCast_s_p1);
    const p2: b2Vec2 = b2Transform.MulTXV(xf, input.p2, b2PolygonShape.RayCast_s_p2);
    const d: b2Vec2 = b2Vec2.SubVV(p2, p1, b2PolygonShape.RayCast_s_d);

    let lower: number = 0, upper = input.maxFraction;

    let index: number = -1;

    for (let i: number = 0; i < this.m_count; ++i) {
      // p = p1 + a * d
      // dot(normal, p - v) = 0
      // dot(normal, p1 - v) + a * dot(normal, d) = 0
      const numerator: number = b2Vec2.DotVV(this.m_normals[i], b2Vec2.SubVV(this.m_vertices[i], p1, b2Vec2.s_t0));
      const denominator: number = b2Vec2.DotVV(this.m_normals[i], d);

      if (denominator === 0) {
        if (numerator < 0) {
          return false;
        }
      } else {
        // Note: we want this predicate without division:
        // lower < numerator / denominator, where denominator < 0
        // Since denominator < 0, we have to flip the inequality:
        // lower < numerator / denominator <==> denominator * lower > numerator.
        if (denominator < 0 && numerator < lower * denominator) {
          // Increase lower.
          // The segment enters this half-space.
          lower = numerator / denominator;
          index = i;
        } else if (denominator > 0 && numerator < upper * denominator) {
          // Decrease upper.
          // The segment exits this half-space.
          upper = numerator / denominator;
        }
      }

      // The use of epsilon here causes the assert on lower to trip
      // in some cases. Apparently the use of epsilon was to make edge
      // shapes work, but now those are handled separately.
      // if (upper < lower - b2_epsilon)
      if (upper < lower) {
        return false;
      }
    }

    // DEBUG: b2Assert(0 <= lower && lower <= input.maxFraction);

    if (index >= 0) {
      output.fraction = lower;
      b2Rot.MulRV(xf.q, this.m_normals[index], output.normal);
      return true;
    }

    return false;
  }

  /// @see b2Shape::ComputeAABB
  private static ComputeAABB_s_v = new b2Vec2();
  public ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void {
    const lower: b2Vec2 = b2Transform.MulXV(xf, this.m_vertices[0], aabb.lowerBound);
    const upper: b2Vec2 = aabb.upperBound.Copy(lower);

    for (let i: number = 0; i < this.m_count; ++i) {
      const v: b2Vec2 = b2Transform.MulXV(xf, this.m_vertices[i], b2PolygonShape.ComputeAABB_s_v);
      b2Vec2.MinV(v, lower, lower);
      b2Vec2.MaxV(v, upper, upper);
    }

    const r: number = this.m_radius;
    lower.SelfSubXY(r, r);
    upper.SelfAddXY(r, r);
  }

  /// @see b2Shape::ComputeMass
  private static ComputeMass_s_center = new b2Vec2();
  private static ComputeMass_s_s = new b2Vec2();
  private static ComputeMass_s_e1 = new b2Vec2();
  private static ComputeMass_s_e2 = new b2Vec2();
  public ComputeMass(massData: b2MassData, density: number): void {
    // Polygon mass, centroid, and inertia.
    // Let rho be the polygon density in mass per unit area.
    // Then:
    // mass = rho * int(dA)
    // centroid.x = (1/mass) * rho * int(x * dA)
    // centroid.y = (1/mass) * rho * int(y * dA)
    // I = rho * int((x*x + y*y) * dA)
    //
    // We can compute these integrals by summing all the integrals
    // for each triangle of the polygon. To evaluate the integral
    // for a single triangle, we make a change of variables to
    // the (u,v) coordinates of the triangle:
    // x = x0 + e1x * u + e2x * v
    // y = y0 + e1y * u + e2y * v
    // where 0 <= u && 0 <= v && u + v <= 1.
    //
    // We integrate u from [0,1-v] and then v from [0,1].
    // We also need to use the Jacobian of the transformation:
    // D = cross(e1, e2)
    //
    // Simplification: triangle centroid = (1/3) * (p1 + p2 + p3)
    //
    // The rest of the derivation is handled by computer algebra.

    // DEBUG: b2Assert(this.m_count >= 3);

    const center: b2Vec2 = b2PolygonShape.ComputeMass_s_center.SetZero();
    let area: number = 0;
    let I: number = 0;

    // Get a reference point for forming triangles.
    // Use the first vertex to reduce round-off errors.
    const s: b2Vec2 = b2PolygonShape.ComputeMass_s_s.Copy(this.m_vertices[0]);

    const k_inv3: number = 1 / 3;

    for (let i: number = 0; i < this.m_count; ++i) {
      // Triangle vertices.
      const e1: b2Vec2 = b2Vec2.SubVV(this.m_vertices[i], s, b2PolygonShape.ComputeMass_s_e1);
      const e2: b2Vec2 = b2Vec2.SubVV(this.m_vertices[(i + 1) % this.m_count], s, b2PolygonShape.ComputeMass_s_e2);

      const D: number = b2Vec2.CrossVV(e1, e2);

      const triangleArea: number = 0.5 * D;
      area += triangleArea;

      // Area weighted centroid
      center.SelfAdd(b2Vec2.MulSV(triangleArea * k_inv3, b2Vec2.AddVV(e1, e2, b2Vec2.s_t0), b2Vec2.s_t1));

      const ex1: number = e1.x;
      const ey1: number = e1.y;
      const ex2: number = e2.x;
      const ey2: number = e2.y;

      const intx2: number = ex1 * ex1 + ex2 * ex1 + ex2 * ex2;
      const inty2: number = ey1 * ey1 + ey2 * ey1 + ey2 * ey2;

      I += (0.25 * k_inv3 * D) * (intx2 + inty2);
    }

    // Total mass
    massData.mass = density * area;

    // Center of mass
    // DEBUG: b2Assert(area > b2_epsilon);
    center.SelfMul(1 / area);
    b2Vec2.AddVV(center, s, massData.center);

    // Inertia tensor relative to the local origin (point s).
    massData.I = density * I;

    // Shift to center of mass then to original body origin.
    massData.I += massData.mass * (b2Vec2.DotVV(massData.center, massData.center) - b2Vec2.DotVV(center, center));
  }

  private static Validate_s_e = new b2Vec2();
  private static Validate_s_v = new b2Vec2();
  public Validate(): boolean {
    for (let i: number = 0; i < this.m_count; ++i) {
      const i1 = i;
      const i2 = (i + 1) % this.m_count;
      const p: b2Vec2 = this.m_vertices[i1];
      const e: b2Vec2 = b2Vec2.SubVV(this.m_vertices[i2], p, b2PolygonShape.Validate_s_e);

      for (let j: number = 0; j < this.m_count; ++j) {
        if (j === i1 || j === i2) {
          continue;
        }

        const v: b2Vec2 = b2Vec2.SubVV(this.m_vertices[j], p, b2PolygonShape.Validate_s_v);
        const c: number = b2Vec2.CrossVV(e, v);
        if (c < 0) {
          return false;
        }
      }
    }

    return true;
  }

  public SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void {
    proxy.m_vertices = this.m_vertices;
    proxy.m_count = this.m_count;
    proxy.m_radius = this.m_radius;
  }

  private static ComputeSubmergedArea_s_normalL = new b2Vec2();
  private static ComputeSubmergedArea_s_md = new b2MassData();
  private static ComputeSubmergedArea_s_intoVec = new b2Vec2();
  private static ComputeSubmergedArea_s_outoVec = new b2Vec2();
  private static ComputeSubmergedArea_s_center = new b2Vec2();
  public ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number {
    // Transform plane into shape co-ordinates
    const normalL: b2Vec2 = b2Rot.MulTRV(xf.q, normal, b2PolygonShape.ComputeSubmergedArea_s_normalL);
    const offsetL: number = offset - b2Vec2.DotVV(normal, xf.p);

    const depths: number[] = [];
    let diveCount: number = 0;
    let intoIndex: number = -1;
    let outoIndex: number = -1;

    let lastSubmerged: boolean = false;
    for (let i: number = 0; i < this.m_count; ++i) {
      depths[i] = b2Vec2.DotVV(normalL, this.m_vertices[i]) - offsetL;
      const isSubmerged: boolean = depths[i] < (-b2_epsilon);
      if (i > 0) {
        if (isSubmerged) {
          if (!lastSubmerged) {
            intoIndex = i - 1;
            diveCount++;
          }
        } else {
          if (lastSubmerged) {
            outoIndex = i - 1;
            diveCount++;
          }
        }
      }
      lastSubmerged = isSubmerged;
    }
    switch (diveCount) {
      case 0:
        if (lastSubmerged) {
          // Completely submerged
          const md: b2MassData = b2PolygonShape.ComputeSubmergedArea_s_md;
          this.ComputeMass(md, 1);
          b2Transform.MulXV(xf, md.center, c);
          return md.mass;
        } else {
          // Completely dry
          return 0;
        }
      case 1:
        if (intoIndex === (-1)) {
          intoIndex = this.m_count - 1;
        } else {
          outoIndex = this.m_count - 1;
        }
        break;
    }
    const intoIndex2: number = ((intoIndex + 1) % this.m_count);
    const outoIndex2: number = ((outoIndex + 1) % this.m_count);
    const intoLamdda: number = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
    const outoLamdda: number = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);

    const intoVec: b2Vec2 = b2PolygonShape.ComputeSubmergedArea_s_intoVec.Set(
      this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda,
      this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
    const outoVec: b2Vec2 = b2PolygonShape.ComputeSubmergedArea_s_outoVec.Set(
      this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda,
      this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);

    // Initialize accumulator
    let area: number = 0;
    const center: b2Vec2 = b2PolygonShape.ComputeSubmergedArea_s_center.SetZero();
    let p2: b2Vec2 = this.m_vertices[intoIndex2];
    let p3: b2Vec2;

    // An awkward loop from intoIndex2+1 to outIndex2
    let i: number = intoIndex2;
    while (i !== outoIndex2) {
      i = (i + 1) % this.m_count;
      if (i === outoIndex2) {
        p3 = outoVec;
      } else {
        p3 = this.m_vertices[i];
      }

      const triangleArea: number = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
      area += triangleArea;
      // Area weighted centroid
      center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
      center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;

      p2 = p3;
    }

    // Normalize and transform centroid
    center.SelfMul(1 / area);
    b2Transform.MulXV(xf, center, c);

    return area;
  }

  public Dump(log: (format: string, ...args: any[]) => void): void {
    log("    const shape: b2PolygonShape = new b2PolygonShape();\n");
    log("    const vs: b2Vec2[] = [];\n");
    for (let i: number = 0; i < this.m_count; ++i) {
      log("    vs[%d] = new b2Vec2(%.15f, %.15f);\n", i, this.m_vertices[i].x, this.m_vertices[i].y);
    }
    log("    shape.Set(vs, %d);\n", this.m_count);
  }

  private static ComputeCentroid_s_s = new b2Vec2();
  private static ComputeCentroid_s_p1 = new b2Vec2();
  private static ComputeCentroid_s_p2 = new b2Vec2();
  private static ComputeCentroid_s_p3 = new b2Vec2();
  private static ComputeCentroid_s_e1 = new b2Vec2();
  private static ComputeCentroid_s_e2 = new b2Vec2();
  public static ComputeCentroid(vs: b2Vec2[], count: number, out: b2Vec2): b2Vec2 {
    // DEBUG: b2Assert(count >= 3);

    const c: b2Vec2 = out; c.SetZero();
    let area: number = 0;

    // Get a reference point for forming triangles.
    // Use the first vertex to reduce round-off errors.
    const s: b2Vec2 = b2PolygonShape.ComputeCentroid_s_s.Copy(vs[0]);

    const inv3: number = 1 / 3;

    for (let i: number = 0; i < count; ++i) {
      // Triangle vertices.
      const p1: b2Vec2 = b2Vec2.SubVV(vs[0], s, b2PolygonShape.ComputeCentroid_s_p1);
      const p2: b2Vec2 = b2Vec2.SubVV(vs[i], s, b2PolygonShape.ComputeCentroid_s_p2);
      const p3: b2Vec2 = b2Vec2.SubVV(vs[(i + 1) % count], s, b2PolygonShape.ComputeCentroid_s_p3);

      const e1: b2Vec2 = b2Vec2.SubVV(p2, p1, b2PolygonShape.ComputeCentroid_s_e1);
      const e2: b2Vec2 = b2Vec2.SubVV(p3, p1, b2PolygonShape.ComputeCentroid_s_e2);

      const D: number = b2Vec2.CrossVV(e1, e2);

      const triangleArea: number = 0.5 * D;
      area += triangleArea;

      // Area weighted centroid
      c.x += triangleArea * inv3 * (p1.x + p2.x + p3.x);
      c.y += triangleArea * inv3 * (p1.y + p2.y + p3.y);
    }

    // Centroid
    // DEBUG: b2Assert(area > b2_epsilon);
    // c = (1.0f / area) * c + s;
    c.x = (1 / area) * c.x + s.x;
    c.y = (1 / area) * c.y + s.y;
    return c;
  }

  /*
  public static ComputeOBB(obb, vs, count) {
    const i: number = 0;
    const p: Array = [count + 1];
    for (i = 0; i < count; ++i) {
      p[i] = vs[i];
    }
    p[count] = p[0];
    const minArea = b2_maxFloat;
    for (i = 1; i <= count; ++i) {
      const root = p[i - 1];
      const uxX = p[i].x - root.x;
      const uxY = p[i].y - root.y;
      const length = b2Sqrt(uxX * uxX + uxY * uxY);
      uxX /= length;
      uxY /= length;
      const uyX = (-uxY);
      const uyY = uxX;
      const lowerX = b2_maxFloat;
      const lowerY = b2_maxFloat;
      const upperX = (-b2_maxFloat);
      const upperY = (-b2_maxFloat);
      for (let j: number = 0; j < count; ++j) {
        const dX = p[j].x - root.x;
        const dY = p[j].y - root.y;
        const rX = (uxX * dX + uxY * dY);
        const rY = (uyX * dX + uyY * dY);
        if (rX < lowerX) lowerX = rX;
        if (rY < lowerY) lowerY = rY;
        if (rX > upperX) upperX = rX;
        if (rY > upperY) upperY = rY;
      }
      const area = (upperX - lowerX) * (upperY - lowerY);
      if (area < 0.95 * minArea) {
        minArea = area;
        obb.R.ex.x = uxX;
        obb.R.ex.y = uxY;
        obb.R.ey.x = uyX;
        obb.R.ey.y = uyY;
        const center_x: number = 0.5 * (lowerX + upperX);
        const center_y: number = 0.5 * (lowerY + upperY);
        const tMat = obb.R;
        obb.center.x = root.x + (tMat.ex.x * center_x + tMat.ey.x * center_y);
        obb.center.y = root.y + (tMat.ex.y * center_x + tMat.ey.y * center_y);
        obb.extents.x = 0.5 * (upperX - lowerX);
        obb.extents.y = 0.5 * (upperY - lowerY);
      }
    }
  }
  */
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 




/// This holds the mass data computed for a shape.
 class b2MassData {
  /// The mass of the shape, usually in kilograms.
  public mass: number = 0;

  /// The position of the shape's centroid relative to the shape's origin.
  public  center: b2Vec2 = new b2Vec2(0, 0);

  /// The rotational inertia of the shape about the local origin.
  public I: number = 0;
}

 enum b2ShapeType {
  e_unknown = -1,
  e_circleShape = 0,
  e_edgeShape = 1,
  e_polygonShape = 2,
  e_chainShape = 3,
  e_shapeTypeCount = 4,
}

/// A shape is used for collision detection. You can create a shape however you like.
/// Shapes used for simulation in b2World are created automatically when a b2Fixture
/// is created. Shapes may encapsulate a one or more child shapes.
 abstract class b2Shape {
  public  m_type: b2ShapeType = b2ShapeType.e_unknown;

	/// Radius of a shape. For polygonal shapes this must be b2_polygonRadius. There is no support for
	/// making rounded polygons.
  public m_radius: number = 0;

  constructor(type: b2ShapeType, radius: number) {
    this.m_type = type;
    this.m_radius = radius;
  }

  /// Clone the concrete shape.
  public abstract Clone(): b2Shape;

  public Copy(other: b2Shape): b2Shape {
    // DEBUG: b2Assert(this.m_type === other.m_type);
    this.m_radius = other.m_radius;
    return this;
  }

  /// Get the type of this shape. You can use this to down cast to the concrete shape.
  /// @return the shape type.
  public GetType(): b2ShapeType {
    return this.m_type;
  }

  /// Get the number of child primitives.
  public abstract GetChildCount(): number;

  /// Test a point for containment in this shape. This only works for convex shapes.
  /// @param xf the shape world transform.
  /// @param p a point in world coordinates.
  public abstract TestPoint(xf: b2Transform, p: XY): boolean;

  // #if B2_ENABLE_PARTICLE
  /// Compute the distance from the current shape to the specified point. This only works for convex shapes.
  /// @param xf the shape world transform.
  /// @param p a point in world coordinates.
  /// @param distance returns the distance from the current shape.
  /// @param normal returns the direction in which the distance increases.
  public abstract ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number;
  // #endif

  /// Cast a ray against a child shape.
  /// @param output the ray-cast results.
  /// @param input the ray-cast input parameters.
  /// @param transform the transform to be applied to the shape.
  /// @param childIndex the child shape index
  public abstract RayCast(output: b2RayCastOutput, input: b2RayCastInput, transform: b2Transform, childIndex: number): boolean;

  /// Given a transform, compute the associated axis aligned bounding box for a child shape.
  /// @param aabb returns the axis aligned box.
  /// @param xf the world transform of the shape.
  /// @param childIndex the child shape
  public abstract ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void;

  /// Compute the mass properties of this shape using its dimensions and density.
  /// The inertia tensor is computed about the local origin.
  /// @param massData returns the mass data for this shape.
  /// @param density the density in kilograms per meter squared.
  public abstract ComputeMass(massData: b2MassData, density: number): void;

  public abstract SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void;

  public abstract ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number;

  public abstract Dump(log: (format: string, ...args: any[]) => void): void;
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 





 let b2_toiTime: number = 0;
 let b2_toiMaxTime: number = 0;
 let b2_toiCalls: number = 0;
 let b2_toiIters: number = 0;
 let b2_toiMaxIters: number = 0;
 let b2_toiRootIters: number = 0;
 let b2_toiMaxRootIters: number = 0;
 function b2_toi_reset(): void {
  b2_toiTime = 0;
  b2_toiMaxTime = 0;
  b2_toiCalls = 0;
  b2_toiIters = 0;
  b2_toiMaxIters = 0;
  b2_toiRootIters = 0;
  b2_toiMaxRootIters = 0;
}

const b2TimeOfImpact_s_xfA: b2Transform = new b2Transform();
const b2TimeOfImpact_s_xfB: b2Transform = new b2Transform();
const b2TimeOfImpact_s_pointA: b2Vec2 = new b2Vec2();
const b2TimeOfImpact_s_pointB: b2Vec2 = new b2Vec2();
const b2TimeOfImpact_s_normal: b2Vec2 = new b2Vec2();
const b2TimeOfImpact_s_axisA: b2Vec2 = new b2Vec2();
const b2TimeOfImpact_s_axisB: b2Vec2 = new b2Vec2();

/// Input parameters for b2TimeOfImpact
 class b2TOIInput {
  public  proxyA: b2DistanceProxy = new b2DistanceProxy();
  public  proxyB: b2DistanceProxy = new b2DistanceProxy();
  public  sweepA: b2Sweep = new b2Sweep();
  public  sweepB: b2Sweep = new b2Sweep();
  public tMax: number = 0; // defines sweep interval [0, tMax]
}

/// Output parameters for b2TimeOfImpact.
 enum b2TOIOutputState {
  e_unknown = 0,
  e_failed = 1,
  e_overlapped = 2,
  e_touching = 3,
  e_separated = 4,
}

 class b2TOIOutput {
  public state = b2TOIOutputState.e_unknown;
  public t: number = 0;
}

 enum b2SeparationFunctionType {
  e_unknown = -1,
  e_points = 0,
  e_faceA = 1,
  e_faceB = 2,
}

 class b2SeparationFunction {
  public m_proxyA: b2DistanceProxy;
  public m_proxyB: b2DistanceProxy;
  public  m_sweepA: b2Sweep = new b2Sweep();
  public  m_sweepB: b2Sweep = new b2Sweep();
  public m_type: b2SeparationFunctionType = b2SeparationFunctionType.e_unknown;
  public  m_localPoint: b2Vec2 = new b2Vec2();
  public  m_axis: b2Vec2 = new b2Vec2();

  public Initialize(cache: b2SimplexCache, proxyA: b2DistanceProxy, sweepA: b2Sweep, proxyB: b2DistanceProxy, sweepB: b2Sweep, t1: number): number {
    this.m_proxyA = proxyA;
    this.m_proxyB = proxyB;
    const count: number = cache.count;
    // DEBUG: b2Assert(0 < count && count < 3);

    this.m_sweepA.Copy(sweepA);
    this.m_sweepB.Copy(sweepB);

    const xfA: b2Transform = b2TimeOfImpact_s_xfA;
    const xfB: b2Transform = b2TimeOfImpact_s_xfB;
    this.m_sweepA.GetTransform(xfA, t1);
    this.m_sweepB.GetTransform(xfB, t1);

    if (count === 1) {
      this.m_type = b2SeparationFunctionType.e_points;
      const localPointA: b2Vec2 = this.m_proxyA.GetVertex(cache.indexA[0]);
      const localPointB: b2Vec2 = this.m_proxyB.GetVertex(cache.indexB[0]);
      const pointA: b2Vec2 = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
      const pointB: b2Vec2 = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
      b2Vec2.SubVV(pointB, pointA, this.m_axis);
      const s: number = this.m_axis.Normalize();
      // #if B2_ENABLE_PARTICLE
      this.m_localPoint.SetZero();
      // #endif
      return s;
    } else if (cache.indexA[0] === cache.indexA[1]) {
      // Two points on B and one on A.
      this.m_type = b2SeparationFunctionType.e_faceB;
      const localPointB1: b2Vec2 = this.m_proxyB.GetVertex(cache.indexB[0]);
      const localPointB2: b2Vec2 = this.m_proxyB.GetVertex(cache.indexB[1]);

      b2Vec2.CrossVOne(b2Vec2.SubVV(localPointB2, localPointB1, b2Vec2.s_t0), this.m_axis).SelfNormalize();
      const normal: b2Vec2 = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);

      b2Vec2.MidVV(localPointB1, localPointB2, this.m_localPoint);
      const pointB: b2Vec2 = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);

      const localPointA: b2Vec2 = this.m_proxyA.GetVertex(cache.indexA[0]);
      const pointA: b2Vec2 = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);

      let s: number = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
      if (s < 0) {
        this.m_axis.SelfNeg();
        s = -s;
      }
      return s;
    } else {
      // Two points on A and one or two points on B.
      this.m_type = b2SeparationFunctionType.e_faceA;
      const localPointA1: b2Vec2 = this.m_proxyA.GetVertex(cache.indexA[0]);
      const localPointA2: b2Vec2 = this.m_proxyA.GetVertex(cache.indexA[1]);

      b2Vec2.CrossVOne(b2Vec2.SubVV(localPointA2, localPointA1, b2Vec2.s_t0), this.m_axis).SelfNormalize();
      const normal: b2Vec2 = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);

      b2Vec2.MidVV(localPointA1, localPointA2, this.m_localPoint);
      const pointA: b2Vec2 = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);

      const localPointB: b2Vec2 = this.m_proxyB.GetVertex(cache.indexB[0]);
      const pointB: b2Vec2 = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);

      let s: number = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
      if (s < 0) {
        this.m_axis.SelfNeg();
        s = -s;
      }
      return s;
    }
  }

  public FindMinSeparation(indexA: [number], indexB: [number], t: number): number {
    const xfA: b2Transform = b2TimeOfImpact_s_xfA;
    const xfB: b2Transform = b2TimeOfImpact_s_xfB;
    this.m_sweepA.GetTransform(xfA, t);
    this.m_sweepB.GetTransform(xfB, t);

    switch (this.m_type) {
    case b2SeparationFunctionType.e_points: {
        const axisA: b2Vec2 = b2Rot.MulTRV(xfA.q, this.m_axis, b2TimeOfImpact_s_axisA);
        const axisB: b2Vec2 = b2Rot.MulTRV(xfB.q, b2Vec2.NegV(this.m_axis, b2Vec2.s_t0), b2TimeOfImpact_s_axisB);

        indexA[0] = this.m_proxyA.GetSupport(axisA);
        indexB[0] = this.m_proxyB.GetSupport(axisB);

        const localPointA: b2Vec2 = this.m_proxyA.GetVertex(indexA[0]);
        const localPointB: b2Vec2 = this.m_proxyB.GetVertex(indexB[0]);

        const pointA: b2Vec2 = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
        const pointB: b2Vec2 = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);

        const separation: number = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.m_axis);
        return separation;
      }

    case b2SeparationFunctionType.e_faceA: {
        const normal: b2Vec2 = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);
        const pointA: b2Vec2 = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);

        const axisB: b2Vec2 = b2Rot.MulTRV(xfB.q, b2Vec2.NegV(normal, b2Vec2.s_t0), b2TimeOfImpact_s_axisB);

        indexA[0] = -1;
        indexB[0] = this.m_proxyB.GetSupport(axisB);

        const localPointB: b2Vec2 = this.m_proxyB.GetVertex(indexB[0]);
        const pointB: b2Vec2 = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);

        const separation: number = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
        return separation;
      }

    case b2SeparationFunctionType.e_faceB: {
        const normal: b2Vec2 = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);
        const pointB: b2Vec2 = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);

        const axisA: b2Vec2 = b2Rot.MulTRV(xfA.q, b2Vec2.NegV(normal, b2Vec2.s_t0), b2TimeOfImpact_s_axisA);

        indexB[0] = -1;
        indexA[0] = this.m_proxyA.GetSupport(axisA);

        const localPointA: b2Vec2 = this.m_proxyA.GetVertex(indexA[0]);
        const pointA: b2Vec2 = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);

        const separation: number = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
        return separation;
      }

    default:
      // DEBUG: b2Assert(false);
      indexA[0] = -1;
      indexB[0] = -1;
      return 0;
    }
  }

  public Evaluate(indexA: number, indexB: number, t: number): number {
    const xfA: b2Transform = b2TimeOfImpact_s_xfA;
    const xfB: b2Transform = b2TimeOfImpact_s_xfB;
    this.m_sweepA.GetTransform(xfA, t);
    this.m_sweepB.GetTransform(xfB, t);

    switch (this.m_type) {
    case b2SeparationFunctionType.e_points: {
        const localPointA: b2Vec2 = this.m_proxyA.GetVertex(indexA);
        const localPointB: b2Vec2 = this.m_proxyB.GetVertex(indexB);

        const pointA: b2Vec2 = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);
        const pointB: b2Vec2 = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);
        const separation: number = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.m_axis);

        return separation;
      }

    case b2SeparationFunctionType.e_faceA: {
        const normal: b2Vec2 = b2Rot.MulRV(xfA.q, this.m_axis, b2TimeOfImpact_s_normal);
        const pointA: b2Vec2 = b2Transform.MulXV(xfA, this.m_localPoint, b2TimeOfImpact_s_pointA);

        const localPointB: b2Vec2 = this.m_proxyB.GetVertex(indexB);
        const pointB: b2Vec2 = b2Transform.MulXV(xfB, localPointB, b2TimeOfImpact_s_pointB);

        const separation: number = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), normal);
        return separation;
      }

    case b2SeparationFunctionType.e_faceB: {
        const normal: b2Vec2 = b2Rot.MulRV(xfB.q, this.m_axis, b2TimeOfImpact_s_normal);
        const pointB: b2Vec2 = b2Transform.MulXV(xfB, this.m_localPoint, b2TimeOfImpact_s_pointB);

        const localPointA: b2Vec2 = this.m_proxyA.GetVertex(indexA);
        const pointA: b2Vec2 = b2Transform.MulXV(xfA, localPointA, b2TimeOfImpact_s_pointA);

        const separation: number = b2Vec2.DotVV(b2Vec2.SubVV(pointA, pointB, b2Vec2.s_t0), normal);
        return separation;
      }

    default:
      // DEBUG: b2Assert(false);
      return 0;
    }
  }
}

const b2TimeOfImpact_s_timer: b2Timer = new b2Timer();
const b2TimeOfImpact_s_cache: b2SimplexCache = new b2SimplexCache();
const b2TimeOfImpact_s_distanceInput: b2DistanceInput = new b2DistanceInput();
const b2TimeOfImpact_s_distanceOutput: b2DistanceOutput = new b2DistanceOutput();
const b2TimeOfImpact_s_fcn: b2SeparationFunction = new b2SeparationFunction();
const b2TimeOfImpact_s_indexA: [number] = [ 0 ];
const b2TimeOfImpact_s_indexB: [number] = [ 0 ];
const b2TimeOfImpact_s_sweepA: b2Sweep = new b2Sweep();
const b2TimeOfImpact_s_sweepB: b2Sweep = new b2Sweep();
 function b2TimeOfImpact(output: b2TOIOutput, input: b2TOIInput): void {
  const timer: b2Timer = b2TimeOfImpact_s_timer.Reset();

  ++b2_toiCalls;

  output.state = b2TOIOutputState.e_unknown;
  output.t = input.tMax;

  const proxyA: b2DistanceProxy = input.proxyA;
  const proxyB: b2DistanceProxy = input.proxyB;
  const maxVertices: number = b2Max(b2_maxPolygonVertices, b2Max(proxyA.m_count, proxyB.m_count));

  const sweepA: b2Sweep = b2TimeOfImpact_s_sweepA.Copy(input.sweepA);
  const sweepB: b2Sweep = b2TimeOfImpact_s_sweepB.Copy(input.sweepB);

  // Large rotations can make the root finder fail, so we normalize the
  // sweep angles.
  sweepA.Normalize();
  sweepB.Normalize();

  const tMax: number = input.tMax;

  const totalRadius: number = proxyA.m_radius + proxyB.m_radius;
  const target: number = b2Max(b2_linearSlop, totalRadius - 3 * b2_linearSlop);
  const tolerance: number = 0.25 * b2_linearSlop;
  // DEBUG: b2Assert(target > tolerance);

  let t1: number = 0;
  const k_maxIterations: number = 20; // TODO_ERIN b2Settings
  let iter: number = 0;

  // Prepare input for distance query.
  const cache: b2SimplexCache = b2TimeOfImpact_s_cache;
  cache.count = 0;
  const distanceInput: b2DistanceInput = b2TimeOfImpact_s_distanceInput;
  distanceInput.proxyA.Copy(input.proxyA);
  distanceInput.proxyB.Copy(input.proxyB);
  distanceInput.useRadii = false;

  // The outer loop progressively attempts to compute new separating axes.
  // This loop terminates when an axis is repeated (no progress is made).
  for (; ; ) {
    const xfA: b2Transform = b2TimeOfImpact_s_xfA;
    const xfB: b2Transform = b2TimeOfImpact_s_xfB;
    sweepA.GetTransform(xfA, t1);
    sweepB.GetTransform(xfB, t1);

    // Get the distance between shapes. We can also use the results
    // to get a separating axis.
    distanceInput.transformA.Copy(xfA);
    distanceInput.transformB.Copy(xfB);
    const distanceOutput: b2DistanceOutput = b2TimeOfImpact_s_distanceOutput;
    b2Distance(distanceOutput, cache, distanceInput);

    // If the shapes are overlapped, we give up on continuous collision.
    if (distanceOutput.distance <= 0) {
      // Failure!
      output.state = b2TOIOutputState.e_overlapped;
      output.t = 0;
      break;
    }

    if (distanceOutput.distance < target + tolerance) {
      // Victory!
      output.state = b2TOIOutputState.e_touching;
      output.t = t1;
      break;
    }

    // Initialize the separating axis.
    const fcn: b2SeparationFunction = b2TimeOfImpact_s_fcn;
    fcn.Initialize(cache, proxyA, sweepA, proxyB, sweepB, t1);
/*
#if 0
    // Dump the curve seen by the root finder {
      const int32 N = 100;
      float32 dx = 1.0f / N;
      float32 xs[N+1];
      float32 fs[N+1];

      float32 x = 0.0f;

      for (int32 i = 0; i <= N; ++i) {
        sweepA.GetTransform(&xfA, x);
        sweepB.GetTransform(&xfB, x);
        float32 f = fcn.Evaluate(xfA, xfB) - target;

        printf("%g %g\n", x, f);

        xs[i] = x;
        fs[i] = f;

        x += dx;
      }
    }
#endif
*/

    // Compute the TOI on the separating axis. We do this by successively
    // resolving the deepest point. This loop is bounded by the number of vertices.
    let done: boolean = false;
    let t2: number = tMax;
    let pushBackIter: number = 0;
    for (; ; ) {
      // Find the deepest point at t2. Store the witness point indices.
      const indexA: [number] = b2TimeOfImpact_s_indexA;
      const indexB: [number] = b2TimeOfImpact_s_indexB;
      let s2: number = fcn.FindMinSeparation(indexA, indexB, t2);

      // Is the final configuration separated?
      if (s2 > (target + tolerance)) {
        // Victory!
        output.state = b2TOIOutputState.e_separated;
        output.t = tMax;
        done = true;
        break;
      }

      // Has the separation reached tolerance?
      if (s2 > (target - tolerance)) {
        // Advance the sweeps
        t1 = t2;
        break;
      }

      // Compute the initial separation of the witness points.
      let s1: number = fcn.Evaluate(indexA[0], indexB[0], t1);

      // Check for initial overlap. This might happen if the root finder
      // runs out of iterations.
      if (s1 < (target - tolerance)) {
        output.state = b2TOIOutputState.e_failed;
        output.t = t1;
        done = true;
        break;
      }

      // Check for touching
      if (s1 <= (target + tolerance)) {
        // Victory! t1 should hold the TOI (could be 0.0).
        output.state = b2TOIOutputState.e_touching;
        output.t = t1;
        done = true;
        break;
      }

      // Compute 1D root of: f(x) - target = 0
      let rootIterCount: number = 0;
      let a1: number = t1;
      let a2: number = t2;
      for (; ; ) {
        // Use a mix of the secant rule and bisection.
        let t: number = 0;
        if (rootIterCount & 1) {
          // Secant rule to improve convergence.
          t = a1 + (target - s1) * (a2 - a1) / (s2 - s1);
        } else {
          // Bisection to guarantee progress.
          t = 0.5 * (a1 + a2);
        }

        ++rootIterCount;
        ++b2_toiRootIters;

        const s: number = fcn.Evaluate(indexA[0], indexB[0], t);

        if (b2Abs(s - target) < tolerance) {
          // t2 holds a tentative value for t1
          t2 = t;
          break;
        }

        // Ensure we continue to bracket the root.
        if (s > target) {
          a1 = t;
          s1 = s;
        } else {
          a2 = t;
          s2 = s;
        }

        if (rootIterCount === 50) {
          break;
        }
      }

      b2_toiMaxRootIters = b2Max(b2_toiMaxRootIters, rootIterCount);

      ++pushBackIter;

      if (pushBackIter === maxVertices) {
        break;
      }
    }

    ++iter;
    ++b2_toiIters;

    if (done) {
      break;
    }

    if (iter === k_maxIterations) {
      // Root finder got stuck. Semi-victory.
      output.state = b2TOIOutputState.e_failed;
      output.t = t1;
      break;
    }
  }

  b2_toiMaxIters = b2Max(b2_toiMaxIters, iter);

  const time: number = timer.GetMilliseconds();
  b2_toiMaxTime = b2Max(b2_toiMaxTime, time);
  b2_toiTime += time;
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

 class b2BlockAllocator {}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// 

 function b2Assert(condition: boolean, ...args: any[]): asserts condition {
  if (!condition) {
    // debugger;
    throw new Error(...args);
  }
}

 function b2Maybe<T>(value: T | undefined, def: T): T {
  return value !== undefined ? value : def;
}

 const b2_maxFloat: number = 1E+37; // FLT_MAX instead of Number.MAX_VALUE;
 const b2_epsilon: number = 1E-5; // FLT_EPSILON instead of Number.EPSILON;
 const b2_epsilon_sq: number = (b2_epsilon * b2_epsilon);
 const b2_pi: number = 3.14159265359; // Math.PI;

/// @file
/// Global tuning constants based on meters-kilograms-seconds (MKS) units.
///

// Tunable Constants

/// You can use this to change the length scale used by your game.
/// For example for inches you could use 39.4.
 const b2_lengthUnitsPerMeter: number = 1.0;

/// The maximum number of vertices on a convex polygon. You cannot increase
/// this too much because b2BlockAllocator has a maximum object size.
 const b2_maxPolygonVertices: number = 8;

// Collision

/// The maximum number of contact points between two convex shapes. Do
/// not change this value.
 const b2_maxManifoldPoints: number = 2;

/// This is used to fatten AABBs in the dynamic tree. This allows proxies
/// to move by a small amount without triggering a tree adjustment.
/// This is in meters.
 const b2_aabbExtension: number = 0.1 * b2_lengthUnitsPerMeter;

/// This is used to fatten AABBs in the dynamic tree. This is used to predict
/// the future position based on the current displacement.
/// This is a dimensionless multiplier.
 const b2_aabbMultiplier: number = 4;

/// A small length used as a collision and constraint tolerance. Usually it is
/// chosen to be numerically significant, but visually insignificant.
 const b2_linearSlop: number = 0.005 * b2_lengthUnitsPerMeter;

/// A small angle used as a collision and constraint tolerance. Usually it is
/// chosen to be numerically significant, but visually insignificant.
 const b2_angularSlop: number = 2 / 180 * b2_pi;

/// The radius of the polygon/edge shape skin. This should not be modified. Making
/// this smaller means polygons will have an insufficient buffer for continuous collision.
/// Making it larger may create artifacts for vertex collision.
 const b2_polygonRadius: number = 2 * b2_linearSlop;

/// Maximum number of sub-steps per contact in continuous physics simulation.
 const b2_maxSubSteps: number = 8;

// Dynamics

/// Maximum number of contacts to be handled to solve a TOI impact.
 const b2_maxTOIContacts: number = 32;

/// The maximum linear position correction used when solving constraints. This helps to
/// prevent overshoot.
 const b2_maxLinearCorrection: number = 0.2 * b2_lengthUnitsPerMeter;

/// The maximum angular position correction used when solving constraints. This helps to
/// prevent overshoot.
 const b2_maxAngularCorrection: number = 8 / 180 * b2_pi;

/// The maximum linear velocity of a body. This limit is very large and is used
/// to prevent numerical problems. You shouldn't need to adjust this.
 const b2_maxTranslation: number = 2 * b2_lengthUnitsPerMeter;
 const b2_maxTranslationSquared: number = b2_maxTranslation * b2_maxTranslation;

/// The maximum angular velocity of a body. This limit is very large and is used
/// to prevent numerical problems. You shouldn't need to adjust this.
 const b2_maxRotation: number = 0.5 * b2_pi;
 const b2_maxRotationSquared: number = b2_maxRotation * b2_maxRotation;

/// This scale factor controls how fast overlap is resolved. Ideally this would be 1 so
/// that overlap is removed in one time step. However using values close to 1 often lead
/// to overshoot.
 const b2_baumgarte: number = 0.2;
 const b2_toiBaumgarte: number = 0.75;

// #if B2_ENABLE_PARTICLE

// Particle

/// A symbolic constant that stands for particle allocation error.
 const b2_invalidParticleIndex: number = -1;

 const b2_maxParticleIndex: number = 0x7FFFFFFF;

/// The default distance between particles, multiplied by the particle diameter.
 const b2_particleStride: number = 0.75;

/// The minimum particle weight that produces pressure.
 const b2_minParticleWeight: number = 1.0;

/// The upper limit for particle pressure.
 const b2_maxParticlePressure: number = 0.25;

/// The upper limit for force between particles.
 const b2_maxParticleForce: number = 0.5;

/// The maximum distance between particles in a triad, multiplied by the particle diameter.
 const b2_maxTriadDistance: number = 2.0 * b2_lengthUnitsPerMeter;
 const b2_maxTriadDistanceSquared: number = (b2_maxTriadDistance * b2_maxTriadDistance);

/// The initial size of particle data buffers.
 const b2_minParticleSystemBufferCapacity: number = 256;

/// The time into the future that collisions against barrier particles will be detected.
 const b2_barrierCollisionTime: number = 2.5;

// #endif

// Sleep

/// The time that a body must be still before it will go to sleep.
 const b2_timeToSleep: number = 0.5;

/// A body cannot sleep if its linear velocity is above this tolerance.
 const b2_linearSleepTolerance: number = 0.01 * b2_lengthUnitsPerMeter;

/// A body cannot sleep if its angular velocity is above this tolerance.
 const b2_angularSleepTolerance: number = 2 / 180 * b2_pi;

// FILE* b2_dumpFile = nullptr;

// void b2OpenDump(const char* fileName)
// {
// 	b2Assert(b2_dumpFile == nullptr);
// 	b2_dumpFile = fopen(fileName, "w");
// }

// void b2Dump(const char* string, ...)
// {
// 	if (b2_dumpFile == nullptr)
// 	{
// 		return;
// 	}

// 	va_list args;
// 	va_start(args, string);
// 	vfprintf(b2_dumpFile, string, args);
// 	va_end(args);
// }

// void b2CloseDump()
// {
// 	fclose(b2_dumpFile);
// 	b2_dumpFile = nullptr;
// }

/// Version numbering scheme.
/// See http://en.wikipedia.org/wiki/Software_versioning
 class b2Version {
  public major: number = 0; ///< significant changes
  public minor: number = 0; ///< incremental changes
  public revision: number = 0; ///< bug fixes

  constructor(major: number = 0, minor: number = 0, revision: number = 0) {
    this.major = major;
    this.minor = minor;
    this.revision = revision;
  }

  public toString(): string {
    return this.major + "." + this.minor + "." + this.revision;
  }
}

/// Current version.
 const b2_version: b2Version = new b2Version(2, 4, 1);

 const b2_branch: string = "master";
 const b2_commit: string = "9ebbbcd960ad424e03e5de6e66a40764c16f51bc";

 function b2ParseInt(v: string): number {
  return parseInt(v, 10);
}

 function b2ParseUInt(v: string): number {
  return Math.abs(parseInt(v, 10));
}

 function b2MakeArray<T>(length: number, init: (i: number) => T): T[] {
  const a: T[] = new Array<T>(length);
  for (let i: number = 0; i < length; ++i) {
    a[i] = init(i);
  }
  return a;
}

 function b2MakeNullArray<T>(length: number): Array<T > {
  const a: Array<T > = new Array<T >(length);
  for (let i: number = 0; i < length; ++i) {
    a[i] = null;
  }
  return a;
}

 function b2MakeNumberArray(length: number, init: number = 0): number[] {
  const a: number[] = new Array<number>(length);
  for (let i: number = 0; i < length; ++i) {
    a[i] = init;
  }
  return a;
}
/*
* Copyright (c) 2011 Erin Catto http://box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/



 interface RGB {
  r: number;
  g: number;
  b: number;
}

 interface RGBA extends RGB {
  a: number;
}

/// Color for debug drawing. Each value has the range [0,1].
 class b2Color implements RGBA {
  public static  ZERO: b2Color = new b2Color(0, 0, 0, 0);

  public static  RED: b2Color = new b2Color(1, 0, 0);
  public static  GREEN: b2Color = new b2Color(0, 1, 0);
  public static  BLUE: b2Color = new b2Color(0, 0, 1);

  constructor(public r: number = 0.5, public g: number = 0.5, public b: number = 0.5, public a: number = 1.0) {}

  public Clone(): b2Color {
    return new b2Color().Copy(this);
  }

  public Copy(other: RGBA): this {
    this.r = other.r;
    this.g = other.g;
    this.b = other.b;
    this.a = other.a;
    return this;
  }

  public IsEqual(color: RGBA): boolean {
    return (this.r === color.r) && (this.g === color.g) && (this.b === color.b) && (this.a === color.a);
  }

  public IsZero(): boolean {
    return (this.r === 0) && (this.g === 0) && (this.b === 0) && (this.a === 0);
  }

  public Set(r: number, g: number, b: number, a: number = this.a): void {
    this.SetRGBA(r, g, b, a);
  }

  public SetByteRGB(r: number, g: number, b: number): this {
    this.r = r / 0xff;
    this.g = g / 0xff;
    this.b = b / 0xff;
    return this;
  }

  public SetByteRGBA(r: number, g: number, b: number, a: number): this {
    this.r = r / 0xff;
    this.g = g / 0xff;
    this.b = b / 0xff;
    this.a = a / 0xff;
    return this;
  }

  public SetRGB(rr: number, gg: number, bb: number): this {
    this.r = rr;
    this.g = gg;
    this.b = bb;
    return this;
  }

  public SetRGBA(rr: number, gg: number, bb: number, aa: number): this {
    this.r = rr;
    this.g = gg;
    this.b = bb;
    this.a = aa;
    return this;
  }

  public SelfAdd(color: RGBA): this {
    this.r += color.r;
    this.g += color.g;
    this.b += color.b;
    this.a += color.a;
    return this;
  }

  public Add<T extends RGBA>(color: RGBA, out: T): T {
    out.r = this.r + color.r;
    out.g = this.g + color.g;
    out.b = this.b + color.b;
    out.a = this.a + color.a;
    return out;
  }

  public SelfSub(color: RGBA): this {
    this.r -= color.r;
    this.g -= color.g;
    this.b -= color.b;
    this.a -= color.a;
    return this;
  }

  public Sub<T extends RGBA>(color: RGBA, out: T): T {
    out.r = this.r - color.r;
    out.g = this.g - color.g;
    out.b = this.b - color.b;
    out.a = this.a - color.a;
    return out;
  }

  public SelfMul(s: number): this {
    this.r *= s;
    this.g *= s;
    this.b *= s;
    this.a *= s;
    return this;
  }

  public Mul<T extends RGBA>(s: number, out: T): T {
    out.r = this.r * s;
    out.g = this.g * s;
    out.b = this.b * s;
    out.a = this.a * s;
    return out;
  }

  public Mix(mixColor: RGBA, strength: number): void {
    b2Color.MixColors(this, mixColor, strength);
  }

  public static MixColors(colorA: RGBA, colorB: RGBA, strength: number): void {
    const dr = (strength * (colorB.r - colorA.r));
    const dg = (strength * (colorB.g - colorA.g));
    const db = (strength * (colorB.b - colorA.b));
    const da = (strength * (colorB.a - colorA.a));
    colorA.r += dr;
    colorA.g += dg;
    colorA.b += db;
    colorA.a += da;
    colorB.r -= dr;
    colorB.g -= dg;
    colorB.b -= db;
    colorB.a -= da;
  }

  public MakeStyleString(alpha: number = this.a): string {
    return b2Color.MakeStyleString(this.r, this.g, this.b, alpha);
  }

  public static MakeStyleString(r: number, g: number, b: number, a: number = 1.0): string {
    // function clamp(x: number, lo: number, hi: number) { return x < lo ? lo : hi < x ? hi : x; }
    r *= 255; // r = clamp(r, 0, 255);
    g *= 255; // g = clamp(g, 0, 255);
    b *= 255; // b = clamp(b, 0, 255);
    // a = clamp(a, 0, 1);
    if (a < 1) {
      return `rgba(${r},${g},${b},${a})`;
    } else {
      return `rgb(${r},${g},${b})`;
    }
  }
}

 class b2TypedColor implements b2Color {
  public  data: Float32Array;
  public get r(): number { return this.data[0]; } public set r(value: number) { this.data[0] = value; }
  public get g(): number { return this.data[1]; } public set g(value: number) { this.data[1] = value; }
  public get b(): number { return this.data[2]; } public set b(value: number) { this.data[2] = value; }
  public get a(): number { return this.data[3]; } public set a(value: number) { this.data[3] = value; }

  constructor();
  constructor(data: Float32Array);
  constructor(rr: number, gg: number, bb: number);
  constructor(rr: number, gg: number, bb: number, aa: number);
  constructor(...args: any[]) {
    if (args[0] instanceof Float32Array) {
      if (args[0].length !== 4) { throw new Error(); }
      this.data = args[0];
    } else {
      const rr: number = typeof args[0] === "number" ? args[0] : 0.5;
      const gg: number = typeof args[1] === "number" ? args[1] : 0.5;
      const bb: number = typeof args[2] === "number" ? args[2] : 0.5;
      const aa: number = typeof args[3] === "number" ? args[3] : 1.0;
      this.data = new Float32Array([ rr, gg, bb, aa ]);
    }
  }

  public Clone(): b2TypedColor {
    return new b2TypedColor(new Float32Array(this.data));
  }

  public Copy(other: RGBA): this {
    if (other instanceof b2TypedColor) {
      this.data.set(other.data);
    }
    else {
      this.r = other.r;
      this.g = other.g;
      this.b = other.b;
      this.a = other.a;
    }
    return this;
  }

  public IsEqual(color: RGBA): boolean {
    return (this.r === color.r) && (this.g === color.g) && (this.b === color.b) && (this.a === color.a);
  }

  public IsZero(): boolean {
    return (this.r === 0) && (this.g === 0) && (this.b === 0) && (this.a === 0);
  }

  public Set(r: number, g: number, b: number, a: number = this.a): void {
    this.SetRGBA(r, g, b, a);
  }

  public SetByteRGB(r: number, g: number, b: number): this {
    this.r = r / 0xff;
    this.g = g / 0xff;
    this.b = b / 0xff;
    return this;
  }

  public SetByteRGBA(r: number, g: number, b: number, a: number): this {
    this.r = r / 0xff;
    this.g = g / 0xff;
    this.b = b / 0xff;
    this.a = a / 0xff;
    return this;
  }

  public SetRGB(rr: number, gg: number, bb: number): this {
    this.r = rr;
    this.g = gg;
    this.b = bb;
    return this;
  }

  public SetRGBA(rr: number, gg: number, bb: number, aa: number): this {
    this.r = rr;
    this.g = gg;
    this.b = bb;
    this.a = aa;
    return this;
  }

  public SelfAdd(color: RGBA): this {
    this.r += color.r;
    this.g += color.g;
    this.b += color.b;
    this.a += color.a;
    return this;
  }

  public Add<T extends RGBA>(color: RGBA, out: T): T {
    out.r = this.r + color.r;
    out.g = this.g + color.g;
    out.b = this.b + color.b;
    out.a = this.a + color.a;
    return out;
  }

  public SelfSub(color: RGBA): this {
    this.r -= color.r;
    this.g -= color.g;
    this.b -= color.b;
    this.a -= color.a;
    return this;
  }

  public Sub<T extends RGBA>(color: RGBA, out: T): T {
    out.r = this.r - color.r;
    out.g = this.g - color.g;
    out.b = this.b - color.b;
    out.a = this.a - color.a;
    return out;
  }

  public SelfMul(s: number): this {
    this.r *= s;
    this.g *= s;
    this.b *= s;
    this.a *= s;
    return this;
  }

  public Mul<T extends RGBA>(s: number, out: T): T {
    out.r = this.r * s;
    out.g = this.g * s;
    out.b = this.b * s;
    out.a = this.a * s;
    return out;
  }

  public Mix(mixColor: RGBA, strength: number): void {
    b2Color.MixColors(this, mixColor, strength);
  }

  public MakeStyleString(alpha: number = this.a): string {
    return b2Color.MakeStyleString(this.r, this.g, this.b, alpha);
  }
}

 enum b2DrawFlags {
  e_none = 0,
  e_shapeBit = 0x0001, ///< draw shapes
  e_jointBit = 0x0002, ///< draw joint connections
  e_aabbBit = 0x0004, ///< draw axis aligned bounding boxes
  e_pairBit = 0x0008, ///< draw broad-phase pairs
  e_centerOfMassBit = 0x0010, ///< draw center of mass frame
  // #if B2_ENABLE_PARTICLE
  e_particleBit = 0x0020, ///< draw particles
  // #endif
  // #if B2_ENABLE_CONTROLLER
  e_controllerBit = 0x0040, /// @see b2Controller list
  // #endif
  e_all = 0x003f,
}

/// Implement and register this class with a b2World to provide debug drawing of physics
/// entities in your game.
 abstract class b2Draw {
  public m_drawFlags: b2DrawFlags = 0;

  public SetFlags(flags: b2DrawFlags): void {
    this.m_drawFlags = flags;
  }

  public GetFlags(): b2DrawFlags {
    return this.m_drawFlags;
  }

  public AppendFlags(flags: b2DrawFlags): void {
    this.m_drawFlags |= flags;
  }

  public ClearFlags(flags: b2DrawFlags): void {
    this.m_drawFlags &= ~flags;
  }

  public abstract PushTransform(xf: b2Transform): void;

  public abstract PopTransform(xf: b2Transform): void;

  public abstract DrawPolygon(vertices: XY[], vertexCount: number, color: RGBA): void;

  public abstract DrawSolidPolygon(vertices: XY[], vertexCount: number, color: RGBA): void;

  public abstract DrawCircle(center: XY, radius: number, color: RGBA): void;

  public abstract DrawSolidCircle(center: XY, radius: number, axis: XY, color: RGBA): void;

  // #if B2_ENABLE_PARTICLE
  public abstract DrawParticles(centers: XY[], radius: number, colors: RGBA[] , count: number): void;
  // #endif

  public abstract DrawSegment(p1: XY, p2: XY, color: RGBA): void;

  public abstract DrawTransform(xf: b2Transform): void;

  public abstract DrawPoint(p: XY, size: number, color: RGBA): void;
}
/*
* Copyright (c) 2010 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 


/// This is a growable LIFO stack with an initial capacity of N.
/// If the stack size exceeds the initial capacity, the heap is used
/// to increase the size of the stack.

 class b2GrowableStack<T> {
  public m_stack: Array<T > = [];
  public m_count: number = 0;

  constructor(N: number) {
    this.m_stack = b2MakeArray(N, (index) => null);
    this.m_count = 0;
  }

  public Reset(): this {
    this.m_count = 0;
    return this;
  }

  public Push(element: T): void {
    this.m_stack[this.m_count] = element;
    this.m_count++;
  }

  public Pop(): T  {
    // DEBUG: b2Assert(this.m_count > 0);
    this.m_count--;
    const element: T  = this.m_stack[this.m_count];
    this.m_stack[this.m_count] = null;
    return element;
  }

  public GetCount(): number {
    return this.m_count;
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 


 const b2_pi_over_180: number = b2_pi / 180;
 const b2_180_over_pi: number = 180 / b2_pi;
 const b2_two_pi: number = 2 * b2_pi;

 const b2Abs = Math.abs;

 function b2Min(a: number, b: number): number { return a < b ? a : b; }
 function b2Max(a: number, b: number): number { return a > b ? a : b; }

 function b2Clamp(a: number, lo: number, hi: number): number {
  return (a < lo) ? (lo) : ((a > hi) ? (hi) : (a));
}

 function b2Swap<T>(a: T[], b: T[]): void {
  // DEBUG: b2Assert(false);
  const tmp: T = a[0];
  a[0] = b[0];
  b[0] = tmp;
}

/// This function is used to ensure that a floating point number is
/// not a NaN or infinity.
 const b2IsValid = isFinite;

 function b2Sq(n: number): number {
  return n * n;
}

/// This is a approximate yet fast inverse square-root.
 function b2InvSqrt(n: number): number {
  return 1 / Math.sqrt(n);
}

 const b2Sqrt = Math.sqrt;

 const b2Pow = Math.pow;

 function b2DegToRad(degrees: number): number {
  return degrees * b2_pi_over_180;
}

 function b2RadToDeg(radians: number): number {
  return radians * b2_180_over_pi;
}

 const b2Cos = Math.cos;
 const b2Sin = Math.sin;
 const b2Acos = Math.acos;
 const b2Asin = Math.asin;
 const b2Atan2 = Math.atan2;

 function b2NextPowerOfTwo(x: number): number {
  x |= (x >> 1) & 0x7FFFFFFF;
  x |= (x >> 2) & 0x3FFFFFFF;
  x |= (x >> 4) & 0x0FFFFFFF;
  x |= (x >> 8) & 0x00FFFFFF;
  x |= (x >> 16) & 0x0000FFFF;
  return x + 1;
}

 function b2IsPowerOfTwo(x: number): boolean {
  return x > 0 && (x & (x - 1)) === 0;
}

 function b2Random(): number {
  return Math.random() * 2 - 1;
}

 function b2RandomRange(lo: number, hi: number): number {
  return (hi - lo) * Math.random() + lo;
}

 interface XY {
  x: number;
  y: number;
}

 class b2TypedVec2 implements b2Vec2 {
  public  data: Float32Array;
  public get x(): number { return this.data[0]; } public set x(value: number) { this.data[0] = value; }
  public get y(): number { return this.data[1]; } public set y(value: number) { this.data[1] = value; }

  constructor();
  constructor(data: Float32Array);
  constructor(x: number, y: number);
  constructor(...args: any[]) {
    if (args[0] instanceof Float32Array) {
      if (args[0].length !== 2) { throw new Error(); }
      this.data = args[0];
    } else {
      const x: number = typeof args[0] === "number" ? args[0] : 0;
      const y: number = typeof args[1] === "number" ? args[1] : 0;
      this.data = new Float32Array([ x, y ]);
    }
  }

  public Clone(): b2TypedVec2 {
    return new b2TypedVec2(new Float32Array(this.data));
  }

  public SetZero(): this {
    this.x = 0;
    this.y = 0;
    return this;
  }

  public Set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  public Copy(other: XY): this {
    if (other instanceof b2TypedVec2) {
      this.data.set(other.data);
    }
    else {
      this.x = other.x;
      this.y = other.y;
    }
    return this;
  }

  public SelfAdd(v: XY): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public SelfAddXY(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  public SelfSub(v: XY): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public SelfSubXY(x: number, y: number): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  public SelfMul(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  public SelfMulAdd(s: number, v: XY): this {
    this.x += s * v.x;
    this.y += s * v.y;
    return this;
  }

  public SelfMulSub(s: number, v: XY): this {
    this.x -= s * v.x;
    this.y -= s * v.y;
    return this;
  }

  public Dot(v: XY): number {
    return this.x * v.x + this.y * v.y;
  }

  public Cross(v: XY): number {
    return this.x * v.y - this.y * v.x;
  }

  public Length(): number {
    const x: number = this.x, y: number = this.y;
    return Math.sqrt(x * x + y * y);
  }

  public LengthSquared(): number {
    const x: number = this.x, y: number = this.y;
    return (x * x + y * y);
  }

  public Normalize(): number {
    const length: number = this.Length();
    if (length >= b2_epsilon) {
      const inv_length: number = 1 / length;
      this.x *= inv_length;
      this.y *= inv_length;
    }
    return length;
  }

  public SelfNormalize(): this {
    const length: number = this.Length();
    if (length >= b2_epsilon) {
      const inv_length: number = 1 / length;
      this.x *= inv_length;
      this.y *= inv_length;
    }
    return this;
  }

  public SelfRotate(radians: number): this {
    const c: number = Math.cos(radians);
    const s: number = Math.sin(radians);
    const x: number = this.x;
    this.x = c * x - s * this.y;
    this.y = s * x + c * this.y;
    return this;
  }

  public SelfRotateCosSin(c: number, s: number): this {
    const x: number = this.x;
    this.x = c * x - s * this.y;
    this.y = s * x + c * this.y;
    return this;
  }

  public IsValid(): boolean {
    return isFinite(this.x) && isFinite(this.y);
  }

  public SelfCrossVS(s: number): this {
    const x: number = this.x;
    this.x =  s * this.y;
    this.y = -s * x;
    return this;
  }

  public SelfCrossSV(s: number): this {
    const x: number = this.x;
    this.x = -s * this.y;
    this.y =  s * x;
    return this;
  }

  public SelfMinV(v: XY): this {
    this.x = b2Min(this.x, v.x);
    this.y = b2Min(this.y, v.y);
    return this;
  }

  public SelfMaxV(v: XY): this {
    this.x = b2Max(this.x, v.x);
    this.y = b2Max(this.y, v.y);
    return this;
  }

  public SelfAbs(): this {
    this.x = b2Abs(this.x);
    this.y = b2Abs(this.y);
    return this;
  }

  public SelfNeg(): this {
    this.x = (-this.x);
    this.y = (-this.y);
    return this;
  }

  public SelfSkew(): this {
    const x: number = this.x;
    this.x = -this.y;
    this.y = x;
    return this;
  }
}

 interface XYZ extends XY {
  z: number;
}

/// A 2D column vector with 3 elements.
 class b2Vec3 implements XYZ {
  public static  ZERO: b2Vec3 = new b2Vec3(0, 0, 0);

  public static  s_t0: b2Vec3 = new b2Vec3();

  public  data: Float32Array;
  public get x(): number { return this.data[0]; } public set x(value: number) { this.data[0] = value; }
  public get y(): number { return this.data[1]; } public set y(value: number) { this.data[1] = value; }
  public get z(): number { return this.data[2]; } public set z(value: number) { this.data[2] = value; }

  constructor();
  constructor(data: Float32Array);
  constructor(x: number, y: number, z: number);
  constructor(...args: any[]) {
    if (args[0] instanceof Float32Array) {
      if (args[0].length !== 3) { throw new Error(); }
      this.data = args[0];
    } else {
      const x: number = typeof args[0] === "number" ? args[0] : 0;
      const y: number = typeof args[1] === "number" ? args[1] : 0;
      const z: number = typeof args[2] === "number" ? args[2] : 0;
      this.data = new Float32Array([ x, y, z ]);
    }
  }

  public Clone(): b2Vec3 {
    return new b2Vec3(this.x, this.y, this.z);
  }

  public SetZero(): this {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  public SetXYZ(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public Copy(other: XYZ): this {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  public SelfNeg(): this {
    this.x = (-this.x);
    this.y = (-this.y);
    this.z = (-this.z);
    return this;
  }

  public SelfAdd(v: XYZ): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public SelfAddXYZ(x: number, y: number, z: number): this {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  }

  public SelfSub(v: XYZ): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public SelfSubXYZ(x: number, y: number, z: number): this {
    this.x -= x;
    this.y -= y;
    this.z -= z;
    return this;
  }

  public SelfMul(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  public static DotV3V3(a: XYZ, b: XYZ): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  public static CrossV3V3<T extends XYZ>(a: XYZ, b: XYZ, out: T): T {
    const a_x: number = a.x, a_y = a.y, a_z = a.z;
    const b_x: number = b.x, b_y = b.y, b_z = b.z;
    out.x = a_y * b_z - a_z * b_y;
    out.y = a_z * b_x - a_x * b_z;
    out.z = a_x * b_y - a_y * b_x;
    return out;
  }
}

/// A 2-by-2 matrix. Stored in column-major order.
 class b2Mat22 {
  public static  IDENTITY: b2Mat22 = new b2Mat22();

  // public  data: Float32Array = new Float32Array([ 1, 0, 0, 1 ]);
  // public  ex: b2Vec2 = new b2Vec2(this.data.subarray(0, 2));
  // public  ey: b2Vec2 = new b2Vec2(this.data.subarray(2, 4));

  public  ex: b2Vec2 = new b2Vec2(1, 0);
  public  ey: b2Vec2 = new b2Vec2(0, 1);

  public Clone(): b2Mat22 {
    return new b2Mat22().Copy(this);
  }

  public static FromVV(c1: XY, c2: XY): b2Mat22 {
    return new b2Mat22().SetVV(c1, c2);
  }

  public static FromSSSS(r1c1: number, r1c2: number, r2c1: number, r2c2: number): b2Mat22 {
    return new b2Mat22().SetSSSS(r1c1, r1c2, r2c1, r2c2);
  }

  public static FromAngle(radians: number): b2Mat22 {
    return new b2Mat22().SetAngle(radians);
  }

  public SetSSSS(r1c1: number, r1c2: number, r2c1: number, r2c2: number): this {
    this.ex.Set(r1c1, r2c1);
    this.ey.Set(r1c2, r2c2);
    return this;
  }

  public SetVV(c1: XY, c2: XY): this {
    this.ex.Copy(c1);
    this.ey.Copy(c2);
    return this;
  }

  public SetAngle(radians: number): this {
    const c: number = Math.cos(radians);
    const s: number = Math.sin(radians);
    this.ex.Set( c, s);
    this.ey.Set(-s, c);
    return this;
  }

  public Copy(other: b2Mat22): this {
    this.ex.Copy(other.ex);
    this.ey.Copy(other.ey);
    return this;
  }

  public SetIdentity(): this {
    this.ex.Set(1, 0);
    this.ey.Set(0, 1);
    return this;
  }

  public SetZero(): this {
    this.ex.SetZero();
    this.ey.SetZero();
    return this;
  }

  public GetAngle(): number {
    return Math.atan2(this.ex.y, this.ex.x);
  }

  public GetInverse(out: b2Mat22): b2Mat22 {
    const a: number = this.ex.x;
    const b: number = this.ey.x;
    const c: number = this.ex.y;
    const d: number = this.ey.y;
    let det: number = a * d - b * c;
    if (det !== 0) {
      det = 1 / det;
    }
    out.ex.x =   det * d;
    out.ey.x = (-det * b);
    out.ex.y = (-det * c);
    out.ey.y =   det * a;
    return out;
  }

  public Solve<T extends XY>(b_x: number, b_y: number, out: T): T {
    const a11: number = this.ex.x, a12 = this.ey.x;
    const a21: number = this.ex.y, a22 = this.ey.y;
    let det: number = a11 * a22 - a12 * a21;
    if (det !== 0) {
      det = 1 / det;
    }
    out.x = det * (a22 * b_x - a12 * b_y);
    out.y = det * (a11 * b_y - a21 * b_x);
    return out;
  }

  public SelfAbs(): this {
    this.ex.SelfAbs();
    this.ey.SelfAbs();
    return this;
  }

  public SelfInv(): this {
    this.GetInverse(this);
    return this;
  }

  public SelfAddM(M: b2Mat22): this {
    this.ex.SelfAdd(M.ex);
    this.ey.SelfAdd(M.ey);
    return this;
  }

  public SelfSubM(M: b2Mat22): this {
    this.ex.SelfSub(M.ex);
    this.ey.SelfSub(M.ey);
    return this;
  }

  public static AbsM(M: b2Mat22, out: b2Mat22): b2Mat22 {
    const M_ex: b2Vec2 = M.ex, M_ey: b2Vec2 = M.ey;
    out.ex.x = b2Abs(M_ex.x);
    out.ex.y = b2Abs(M_ex.y);
    out.ey.x = b2Abs(M_ey.x);
    out.ey.y = b2Abs(M_ey.y);
    return out;
  }

  public static MulMV<T extends XY>(M: b2Mat22, v: XY, out: T): T {
    const M_ex: b2Vec2 = M.ex, M_ey: b2Vec2 = M.ey;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = M_ex.x * v_x + M_ey.x * v_y;
    out.y = M_ex.y * v_x + M_ey.y * v_y;
    return out;
  }

  public static MulTMV<T extends XY>(M: b2Mat22, v: XY, out: T): T {
    const M_ex: b2Vec2 = M.ex, M_ey: b2Vec2 = M.ey;
    const v_x: number = v.x, v_y: number = v.y;
    out.x = M_ex.x * v_x + M_ex.y * v_y;
    out.y = M_ey.x * v_x + M_ey.y * v_y;
    return out;
  }

  public static AddMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22 {
    const A_ex: b2Vec2 = A.ex, A_ey: b2Vec2 = A.ey;
    const B_ex: b2Vec2 = B.ex, B_ey: b2Vec2 = B.ey;
    out.ex.x = A_ex.x + B_ex.x;
    out.ex.y = A_ex.y + B_ex.y;
    out.ey.x = A_ey.x + B_ey.x;
    out.ey.y = A_ey.y + B_ey.y;
    return out;
  }

  public static MulMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22 {
    const A_ex_x: number = A.ex.x, A_ex_y: number = A.ex.y;
    const A_ey_x: number = A.ey.x, A_ey_y: number = A.ey.y;
    const B_ex_x: number = B.ex.x, B_ex_y: number = B.ex.y;
    const B_ey_x: number = B.ey.x, B_ey_y: number = B.ey.y;
    out.ex.x = A_ex_x * B_ex_x + A_ey_x * B_ex_y;
    out.ex.y = A_ex_y * B_ex_x + A_ey_y * B_ex_y;
    out.ey.x = A_ex_x * B_ey_x + A_ey_x * B_ey_y;
    out.ey.y = A_ex_y * B_ey_x + A_ey_y * B_ey_y;
    return out;
  }

  public static MulTMM(A: b2Mat22, B: b2Mat22, out: b2Mat22): b2Mat22 {
    const A_ex_x: number = A.ex.x, A_ex_y: number = A.ex.y;
    const A_ey_x: number = A.ey.x, A_ey_y: number = A.ey.y;
    const B_ex_x: number = B.ex.x, B_ex_y: number = B.ex.y;
    const B_ey_x: number = B.ey.x, B_ey_y: number = B.ey.y;
    out.ex.x = A_ex_x * B_ex_x + A_ex_y * B_ex_y;
    out.ex.y = A_ey_x * B_ex_x + A_ey_y * B_ex_y;
    out.ey.x = A_ex_x * B_ey_x + A_ex_y * B_ey_y;
    out.ey.y = A_ey_x * B_ey_x + A_ey_y * B_ey_y;
    return out;
  }
}

/// A 3-by-3 matrix. Stored in column-major order.
 class b2Mat33 {
  public static  IDENTITY: b2Mat33 = new b2Mat33();

  public  data: Float32Array = new Float32Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
  public  ex: b2Vec3 = new b2Vec3(this.data.subarray(0, 3));
  public  ey: b2Vec3 = new b2Vec3(this.data.subarray(3, 6));
  public  ez: b2Vec3 = new b2Vec3(this.data.subarray(6, 9));

  public Clone(): b2Mat33 {
    return new b2Mat33().Copy(this);
  }

  public SetVVV(c1: XYZ, c2: XYZ, c3: XYZ): this {
    this.ex.Copy(c1);
    this.ey.Copy(c2);
    this.ez.Copy(c3);
    return this;
  }

  public Copy(other: b2Mat33): this {
    this.ex.Copy(other.ex);
    this.ey.Copy(other.ey);
    this.ez.Copy(other.ez);
    return this;
  }

  public SetIdentity(): this {
    this.ex.SetXYZ(1, 0, 0);
    this.ey.SetXYZ(0, 1, 0);
    this.ez.SetXYZ(0, 0, 1);
    return this;
  }

  public SetZero(): this {
    this.ex.SetZero();
    this.ey.SetZero();
    this.ez.SetZero();
    return this;
  }

  public SelfAddM(M: b2Mat33): this {
    this.ex.SelfAdd(M.ex);
    this.ey.SelfAdd(M.ey);
    this.ez.SelfAdd(M.ez);
    return this;
  }

  public Solve33<T extends XYZ>(b_x: number, b_y: number, b_z: number, out: T): T {
    const a11: number = this.ex.x, a21: number = this.ex.y, a31: number = this.ex.z;
    const a12: number = this.ey.x, a22: number = this.ey.y, a32: number = this.ey.z;
    const a13: number = this.ez.x, a23: number = this.ez.y, a33: number = this.ez.z;
    let det: number = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
    if (det !== 0) {
      det = 1 / det;
    }
    out.x = det * (b_x * (a22 * a33 - a32 * a23) + b_y * (a32 * a13 - a12 * a33) + b_z * (a12 * a23 - a22 * a13));
    out.y = det * (a11 * (b_y * a33 - b_z * a23) + a21 * (b_z * a13 - b_x * a33) + a31 * (b_x * a23 - b_y * a13));
    out.z = det * (a11 * (a22 * b_z - a32 * b_y) + a21 * (a32 * b_x - a12 * b_z) + a31 * (a12 * b_y - a22 * b_x));
    return out;
  }

  public Solve22<T extends XY>(b_x: number, b_y: number, out: T): T {
    const a11: number = this.ex.x, a12: number = this.ey.x;
    const a21: number = this.ex.y, a22: number = this.ey.y;
    let det: number = a11 * a22 - a12 * a21;
    if (det !== 0) {
      det = 1 / det;
    }
    out.x = det * (a22 * b_x - a12 * b_y);
    out.y = det * (a11 * b_y - a21 * b_x);
    return out;
  }

  public GetInverse22(M: b2Mat33): void {
    const a: number = this.ex.x, b: number = this.ey.x, c: number = this.ex.y, d: number = this.ey.y;
    let det: number = a * d - b * c;
    if (det !== 0) {
      det = 1 / det;
    }

    M.ex.x =  det * d; M.ey.x = -det * b; M.ex.z = 0;
    M.ex.y = -det * c; M.ey.y =  det * a; M.ey.z = 0;
    M.ez.x =        0; M.ez.y =        0; M.ez.z = 0;
  }

  public GetSymInverse33(M: b2Mat33): void {
    let det: number = b2Vec3.DotV3V3(this.ex, b2Vec3.CrossV3V3(this.ey, this.ez, b2Vec3.s_t0));
    if (det !== 0) {
      det = 1 / det;
    }

    const a11: number = this.ex.x, a12: number = this.ey.x, a13: number = this.ez.x;
    const a22: number = this.ey.y, a23: number = this.ez.y;
    const a33: number = this.ez.z;

    M.ex.x = det * (a22 * a33 - a23 * a23);
    M.ex.y = det * (a13 * a23 - a12 * a33);
    M.ex.z = det * (a12 * a23 - a13 * a22);

    M.ey.x = M.ex.y;
    M.ey.y = det * (a11 * a33 - a13 * a13);
    M.ey.z = det * (a13 * a12 - a11 * a23);

    M.ez.x = M.ex.z;
    M.ez.y = M.ey.z;
    M.ez.z = det * (a11 * a22 - a12 * a12);
  }

  public static MulM33V3<T extends XYZ>(A: b2Mat33, v: XYZ, out: T): T {
    const v_x: number = v.x, v_y: number = v.y, v_z: number = v.z;
    out.x = A.ex.x * v_x + A.ey.x * v_y + A.ez.x * v_z;
    out.y = A.ex.y * v_x + A.ey.y * v_y + A.ez.y * v_z;
    out.z = A.ex.z * v_x + A.ey.z * v_y + A.ez.z * v_z;
    return out;
  }
  public static MulM33XYZ<T extends XYZ>(A: b2Mat33, x: number, y: number, z: number, out: T): T {
    out.x = A.ex.x * x + A.ey.x * y + A.ez.x * z;
    out.y = A.ex.y * x + A.ey.y * y + A.ez.y * z;
    out.z = A.ex.z * x + A.ey.z * y + A.ez.z * z;
    return out;
  }
  public static MulM33V2<T extends XY>(A: b2Mat33, v: XY, out: T): T {
    const v_x: number = v.x, v_y: number = v.y;
    out.x = A.ex.x * v_x + A.ey.x * v_y;
    out.y = A.ex.y * v_x + A.ey.y * v_y;
    return out;
  }
  public static MulM33XY<T extends XY>(A: b2Mat33, x: number, y: number, out: T): T {
    out.x = A.ex.x * x + A.ey.x * y;
    out.y = A.ex.y * x + A.ey.y * y;
    return out;
  }
}/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

/// @file
/// Settings that can be overriden for your application
///

// Tunable Constants

/// You can use this to change the length scale used by your game.
/// For example for inches you could use 39.4.
//  const b2_lengthUnitsPerMeter: number = 1.0;

/// The maximum number of vertices on a convex polygon. You cannot increase
/// this too much because b2BlockAllocator has a maximum object size.
//  const b2_maxPolygonVertices: number = 8;

// Memory Allocation

/// Implement this function to use your own memory allocator.
 function b2Alloc(size: number): any {
  return null;
}

/// If you implement b2Alloc, you should also implement this function.
 function b2Free(mem: any): void {
}

/// Logging function.
 function b2Log(message: string, ...args: any[]): void {
  // console.log(message, ...args);
}

/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

 class b2StackAllocator {}
/*
* Copyright (c) 2011 Erin Catto http://box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

/// Timer for profiling. This has platform specific code and may
/// not work on every platform.
 class b2Timer {
  public m_start: number = Date.now();

  /// Reset the timer.
  public Reset(): b2Timer {
    this.m_start = Date.now();
    return this;
  }

  /// Get the time since construction or the last reset.
  public GetMilliseconds(): number {
    return Date.now() - this.m_start;
  }
}

 class b2Counter {
  public m_count: number = 0;
  public m_min_count: number = 0;
  public m_max_count: number = 0;

  public GetCount(): number {
    return this.m_count;
  }

  public GetMinCount(): number {
    return this.m_min_count;
  }

  public GetMaxCount(): number {
    return this.m_max_count;
  }

  public ResetCount(): number {
    const count: number = this.m_count;
    this.m_count = 0;
    return count;
  }

  public ResetMinCount(): void {
    this.m_min_count = 0;
  }

  public ResetMaxCount(): void {
    this.m_max_count = 0;
  }

  public Increment(): void {
    this.m_count++;

    if (this.m_max_count < this.m_count) {
      this.m_max_count = this.m_count;
    }
  }

  public Decrement(): void {
    this.m_count--;

    if (this.m_min_count > this.m_count) {
      this.m_min_count = this.m_count;
    }
  }
}
/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_CONTROLLER







/**
 * Calculates buoyancy forces for fluids in the form of a half
 * plane.
 */
 class b2BuoyancyController extends b2Controller {
  /**
   * The outer surface normal
   */
  public  normal = new b2Vec2(0, 1);
  /**
   * The height of the fluid surface along the normal
   */
  public offset = 0;
  /**
   * The fluid density
   */
  public density = 0;
  /**
   * Fluid velocity, for drag calculations
   */
  public  velocity = new b2Vec2(0, 0);
  /**
   * Linear drag co-efficient
   */
  public linearDrag = 0;
  /**
   * Angular drag co-efficient
   */
  public angularDrag = 0;
  /**
   * If false, bodies are assumed to be uniformly dense, otherwise
   * use the shapes densities
   */
  public useDensity = false; //False by default to prevent a gotcha
  /**
   * If true, gravity is taken from the world instead of the
   */
  public useWorldGravity = true;
  /**
   * Gravity vector, if the world's gravity is not used
   */
  public  gravity = new b2Vec2(0, 0);

  public Step(step: b2TimeStep) {
    if (!this.m_bodyList) {
      return;
    }
    if (this.useWorldGravity) {
      this.gravity.Copy(this.m_bodyList.body.GetWorld().GetGravity());
    }
    for (let i: b2ControllerEdge  = this.m_bodyList; i; i = i.nextBody) {
      const body = i.body;
      if (!body.IsAwake()) {
        //Buoyancy force is just a function of position,
        //so unlike most forces, it is safe to ignore sleeping bodes
        continue;
      }
      const areac = new b2Vec2();
      const massc = new b2Vec2();
      let area = 0;
      let mass = 0;
      for (let fixture = body.GetFixtureList(); fixture; fixture = fixture.m_next) {
        const sc = new b2Vec2();
        const sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
        area += sarea;
        areac.x += sarea * sc.x;
        areac.y += sarea * sc.y;
        let shapeDensity = 0;
        if (this.useDensity) {
          //TODO: Expose density publicly
          shapeDensity = fixture.GetDensity();
        } else {
          shapeDensity = 1;
        }
        mass += sarea * shapeDensity;
        massc.x += sarea * sc.x * shapeDensity;
        massc.y += sarea * sc.y * shapeDensity;
      }
      areac.x /= area;
      areac.y /= area;
      //    b2Vec2 localCentroid = b2MulT(body->GetXForm(),areac);
      massc.x /= mass;
      massc.y /= mass;
      if (area < b2_epsilon) {
        continue;
      }
      //Buoyancy
      const buoyancyForce = this.gravity.Clone().SelfNeg();
      buoyancyForce.SelfMul(this.density * area);
      body.ApplyForce(buoyancyForce, massc);
      //Linear drag
      const dragForce = body.GetLinearVelocityFromWorldPoint(areac, new b2Vec2());
      dragForce.SelfSub(this.velocity);
      dragForce.SelfMul((-this.linearDrag * area));
      body.ApplyForce(dragForce, areac);
      //Angular drag
      //TODO: Something that makes more physical sense?
      body.ApplyTorque((-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag));
    }
  }

  public Draw(debugDraw: b2Draw) {
    const r = 100;
    const p1 = new b2Vec2();
    const p2 = new b2Vec2();
    p1.x = this.normal.x * this.offset + this.normal.y * r;
    p1.y = this.normal.y * this.offset - this.normal.x * r;
    p2.x = this.normal.x * this.offset - this.normal.y * r;
    p2.y = this.normal.y * this.offset + this.normal.x * r;

    const color = new b2Color(0, 0, 0.8);

    debugDraw.DrawSegment(p1, p2, color);
  }
}

// #endif
/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_CONTROLLER






/**
 * Applies a force every frame
 */
 class b2ConstantAccelController extends b2Controller {
  /**
   * The acceleration to apply
   */
  public  A = new b2Vec2(0, 0);

  public Step(step: b2TimeStep) {
    const dtA = b2Vec2.MulSV(step.dt, this.A, b2ConstantAccelController.Step_s_dtA);
    for (let i = this.m_bodyList; i; i = i.nextBody) {
      const body = i.body;
      if (!body.IsAwake()) {
        continue;
      }
      body.SetLinearVelocity(b2Vec2.AddVV(body.GetLinearVelocity(), dtA, b2Vec2.s_t0));
    }
  }
  private static Step_s_dtA = new b2Vec2();

  public Draw(draw: b2Draw) {}
}

// #endif
/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_CONTROLLER






/**
 * Applies a force every frame
 */
 class b2ConstantForceController extends b2Controller {
  /**
   * The force to apply
   */
  public  F = new b2Vec2(0, 0);

  public Step(step: b2TimeStep) {
    for (let i = this.m_bodyList; i; i = i.nextBody) {
      const body = i.body;
      if (!body.IsAwake()) {
        continue;
      }
      body.ApplyForce(this.F, body.GetWorldCenter());
    }
  }

  public Draw(draw: b2Draw) {}
}

// #endif
/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_CONTROLLER





/**
 * A controller edge is used to connect bodies and controllers
 * together in a bipartite graph.
 */
 class b2ControllerEdge {
  public  controller: b2Controller; ///< provides quick access to other end of this edge.
  public  body: b2Body; ///< the body
  public prevBody: b2ControllerEdge  = null; ///< the previous controller edge in the controllers's joint list
  public nextBody: b2ControllerEdge  = null; ///< the next controller edge in the controllers's joint list
  public prevController: b2ControllerEdge  = null; ///< the previous controller edge in the body's joint list
  public nextController: b2ControllerEdge  = null; ///< the next controller edge in the body's joint list
  constructor(controller: b2Controller, body: b2Body) {
    this.controller = controller;
    this.body = body;
  }
}

/**
 * Base class for controllers. Controllers are a convience for
 * encapsulating common per-step functionality.
 */
 abstract class b2Controller {
  // m_world: b2World;
  public m_bodyList: b2ControllerEdge  = null;
  public m_bodyCount: number = 0;
  public m_prev: b2Controller  = null;
  public m_next: b2Controller  = null;

  /**
   * Controllers override this to implement per-step functionality.
   */
  public abstract Step(step: b2TimeStep): void;

  /**
   * Controllers override this to provide debug drawing.
   */
  public abstract Draw(debugDraw: b2Draw): void;

  /**
   * Get the next controller in the world's body list.
   */
  public GetNext(): b2Controller  {
    return this.m_next;
  }

  /**
   * Get the previous controller in the world's body list.
   */
  public GetPrev(): b2Controller  {
    return this.m_prev;
  }

  /**
   * Get the parent world of this body.
   */
  // GetWorld() {
  //   return this.m_world;
  // }

  /**
   * Get the attached body list
   */
  public GetBodyList(): b2ControllerEdge  {
    return this.m_bodyList;
  }

  /**
   * Adds a body to the controller list.
   */
  public AddBody(body: b2Body): void {
    const edge = new b2ControllerEdge(this, body);

    //Add edge to controller list
    edge.nextBody = this.m_bodyList;
    edge.prevBody = null;
    if (this.m_bodyList) {
      this.m_bodyList.prevBody = edge;
    }
    this.m_bodyList = edge;
    ++this.m_bodyCount;

    //Add edge to body list
    edge.nextController = body.m_controllerList;
    edge.prevController = null;
    if (body.m_controllerList) {
      body.m_controllerList.prevController = edge;
    }
    body.m_controllerList = edge;
    ++body.m_controllerCount;
  }

  /**
   * Removes a body from the controller list.
   */
  public RemoveBody(body: b2Body): void {
    //Assert that the controller is not empty
    if (this.m_bodyCount <= 0) { throw new Error(); }

    //Find the corresponding edge
    /*b2ControllerEdge*/
    let edge = this.m_bodyList;
    while (edge && edge.body !== body) {
      edge = edge.nextBody;
    }

    //Assert that we are removing a body that is currently attached to the controller
    if (edge === null) { throw new Error(); }

    //Remove edge from controller list
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

    //Remove edge from body list
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
  }

  /**
   * Removes all bodies from the controller list.
   */
  public Clear(): void {
    while (this.m_bodyList) {
      this.RemoveBody(this.m_bodyList.body);
    }

    this.m_bodyCount = 0;
  }
}

// #endif
/*
 * Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_CONTROLLER







/**
 * Applies simplified gravity between every pair of bodies
 */
 class b2GravityController extends b2Controller {
  /**
   * Specifies the strength of the gravitiation force
   */
  public G = 1;
  /**
   * If true, gravity is proportional to r^-2, otherwise r^-1
   */
  public invSqr = true;

  /**
   * @see b2Controller::Step
   */
  public Step(step: b2TimeStep) {
    if (this.invSqr) {
      for (let i = this.m_bodyList; i; i = i.nextBody) {
        const body1 = i.body;
        const p1 = body1.GetWorldCenter();
        const mass1 = body1.GetMass();
        for (let j = this.m_bodyList; j && j !== i; j = j.nextBody) {
          const body2 = j.body;
          const p2 = body2.GetWorldCenter();
          const mass2 = body2.GetMass();
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const r2 = dx * dx + dy * dy;
          if (r2 < b2_epsilon) {
            continue;
          }
          const f = b2GravityController.Step_s_f.Set(dx, dy);
          f.SelfMul(this.G / r2 / b2Sqrt(r2) * mass1 * mass2);
          if (body1.IsAwake()) {
            body1.ApplyForce(f, p1);
          }
          if (body2.IsAwake()) {
            body2.ApplyForce(f.SelfMul(-1), p2);
          }
        }
      }
    } else {
      for (let i = this.m_bodyList; i; i = i.nextBody) {
        const body1 = i.body;
        const p1 = body1.GetWorldCenter();
        const mass1 = body1.GetMass();
        for (let j = this.m_bodyList; j && j !== i; j = j.nextBody) {
          const body2 = j.body;
          const p2 = body2.GetWorldCenter();
          const mass2 = body2.GetMass();
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const r2 = dx * dx + dy * dy;
          if (r2 < b2_epsilon) {
            continue;
          }
          const f = b2GravityController.Step_s_f.Set(dx, dy);
          f.SelfMul(this.G / r2 * mass1 * mass2);
          if (body1.IsAwake()) {
            body1.ApplyForce(f, p1);
          }
          if (body2.IsAwake()) {
            body2.ApplyForce(f.SelfMul(-1), p2);
          }
        }
      }
    }
  }
  private static Step_s_f = new b2Vec2();

  public Draw(draw: b2Draw) { }
}

// #endif
/*
 * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_CONTROLLER







/**
 * Applies top down linear damping to the controlled bodies
 * The damping is calculated by multiplying velocity by a matrix
 * in local co-ordinates.
 */
 class b2TensorDampingController extends b2Controller {
    /// Tensor to use in damping model
    public  T = new b2Mat22();
    /*Some examples (matrixes in format (row1; row2))
    (-a 0; 0 -a)    Standard isotropic damping with strength a
    ( 0 a; -a 0)    Electron in fixed field - a force at right angles to velocity with proportional magnitude
    (-a 0; 0 -b)    Differing x and y damping. Useful e.g. for top-down wheels.
    */
    //By the way, tensor in this case just means matrix, don't let the terminology get you down.

    /// Set this to a positive number to clamp the maximum amount of damping done.
    public maxTimestep = 0;
    // Typically one wants maxTimestep to be 1/(max eigenvalue of T), so that damping will never cause something to reverse direction

    /**
     * @see b2Controller::Step
     */
    public Step(step: b2TimeStep) {
        let timestep = step.dt;
        if (timestep <= b2_epsilon) {
            return;
        }
        if (timestep > this.maxTimestep && this.maxTimestep > 0) {
            timestep = this.maxTimestep;
        }
        for (let i = this.m_bodyList; i; i = i.nextBody) {
            const body = i.body;
            if (!body.IsAwake()) {
                continue;
            }
            const damping = body.GetWorldVector(
            b2Mat22.MulMV(
                this.T,
                body.GetLocalVector(
                body.GetLinearVelocity(),
                b2Vec2.s_t0),
                b2Vec2.s_t1),
            b2TensorDampingController.Step_s_damping);
            //    body->SetLinearVelocity(body->GetLinearVelocity() + timestep * damping);
            body.SetLinearVelocity(b2Vec2.AddVV(body.GetLinearVelocity(), b2Vec2.MulSV(timestep, damping, b2Vec2.s_t0), b2Vec2.s_t1));
        }
    }
    private static Step_s_damping = new b2Vec2();

    public Draw(draw: b2Draw) {}

    /**
     * Sets damping independantly along the x and y axes
     */
    public SetAxisAligned(xDamping: number, yDamping: number) {
      this.T.ex.x = (-xDamping);
      this.T.ex.y = 0;
      this.T.ey.x = 0;
      this.T.ey.y = (-yDamping);
      if (xDamping > 0 || yDamping > 0) {
        this.maxTimestep = 1 / b2Max(xDamping, yDamping);
      } else {
        this.maxTimestep = 0;
      }
    }
}

// #endif
// DEBUG: 







 interface b2IAreaJointDef extends b2IJointDef {
  // world: b2World;

  bodies: b2Body[];

  stiffness?: number;

  damping?: number;
}

 class b2AreaJointDef extends b2JointDef implements b2IAreaJointDef {
  public bodies: b2Body[] = [];

  public stiffness: number = 0;

  public damping: number = 0;

  constructor() {
    super(b2JointType.e_areaJoint);
  }

  public AddBody(body: b2Body): void {
    this.bodies.push(body);

    if (this.bodies.length === 1) {
      this.bodyA = body;
    } else if (this.bodies.length === 2) {
      this.bodyB = body;
    }
  }
}

 class b2AreaJoint extends b2Joint {
  public m_bodies: b2Body[];
  public m_stiffness: number = 0;
  public m_damping: number = 0;

  // Solver shared
  public m_impulse: number = 0;

  // Solver temp
  public  m_targetLengths: number[];
  public m_targetArea: number = 0;
  public  m_normals: b2Vec2[];
  public  m_joints: b2DistanceJoint[];
  public  m_deltas: b2Vec2[];
  public  m_delta: b2Vec2 = new b2Vec2();

  constructor(def: b2IAreaJointDef) {
    super(def);

    // DEBUG: b2Assert(def.bodies.length >= 3, "You cannot create an area joint with less than three bodies.");

    this.m_bodies = def.bodies;
    this.m_stiffness = b2Maybe(def.stiffness, 0);
    this.m_damping = b2Maybe(def.damping, 0);

    this.m_targetLengths = b2MakeNumberArray(def.bodies.length);
    this.m_normals = b2Vec2.MakeArray(def.bodies.length);
    this.m_joints = []; // b2MakeNullArray(def.bodies.length);
    this.m_deltas = b2Vec2.MakeArray(def.bodies.length);

    const djd: b2DistanceJointDef = new b2DistanceJointDef();
    djd.stiffness = this.m_stiffness;
    djd.damping = this.m_damping;

    this.m_targetArea = 0;

    for (let i: number = 0; i < this.m_bodies.length; ++i) {
      const body: b2Body = this.m_bodies[i];
      const next: b2Body = this.m_bodies[(i + 1) % this.m_bodies.length];

      const body_c: b2Vec2 = body.GetWorldCenter();
      const next_c: b2Vec2 = next.GetWorldCenter();

      this.m_targetLengths[i] = b2Vec2.DistanceVV(body_c, next_c);

      this.m_targetArea += b2Vec2.CrossVV(body_c, next_c);

      djd.Initialize(body, next, body_c, next_c);
      this.m_joints[i] = body.GetWorld().CreateJoint(djd);
    }

    this.m_targetArea *= 0.5;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return out;
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return out;
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    return out;
  }

  public GetReactionTorque(inv_dt: number): number {
    return 0;
  }

  public SetStiffness(stiffness: number): void {
    this.m_stiffness = stiffness;

    for (let i: number = 0; i < this.m_joints.length; ++i) {
      this.m_joints[i].SetStiffness(stiffness);
    }
  }

  public GetStiffness() {
    return this.m_stiffness;
  }

  public SetDamping(damping: number): void {
    this.m_damping = damping;

    for (let i: number = 0; i < this.m_joints.length; ++i) {
      this.m_joints[i].SetDamping(damping);
    }
  }

  public GetDamping() {
    return this.m_damping;
  }

  public Dump(log: (format: string, ...args: any[]) => void) {
    log("Area joint dumping is not supported.\n");
  }

  public InitVelocityConstraints(data: b2SolverData): void {
    for (let i: number = 0; i < this.m_bodies.length; ++i) {
      const prev: b2Body = this.m_bodies[(i + this.m_bodies.length - 1) % this.m_bodies.length];
      const next: b2Body = this.m_bodies[(i + 1) % this.m_bodies.length];
      const prev_c: b2Vec2 = data.positions[prev.m_islandIndex].c;
      const next_c: b2Vec2 = data.positions[next.m_islandIndex].c;
      const delta: b2Vec2 = this.m_deltas[i];

      b2Vec2.SubVV(next_c, prev_c, delta);
    }

    if (data.step.warmStarting) {
      this.m_impulse *= data.step.dtRatio;

      for (let i: number = 0; i < this.m_bodies.length; ++i) {
        const body: b2Body = this.m_bodies[i];
        const body_v: b2Vec2 = data.velocities[body.m_islandIndex].v;
        const delta: b2Vec2 = this.m_deltas[i];

        body_v.x += body.m_invMass *  delta.y * 0.5 * this.m_impulse;
        body_v.y += body.m_invMass * -delta.x * 0.5 * this.m_impulse;
      }
    } else {
      this.m_impulse = 0;
    }
  }

  public SolveVelocityConstraints(data: b2SolverData): void {
    let dotMassSum: number = 0;
    let crossMassSum: number = 0;

    for (let i: number = 0; i < this.m_bodies.length; ++i) {
      const body: b2Body = this.m_bodies[i];
      const body_v: b2Vec2 = data.velocities[body.m_islandIndex].v;
      const delta: b2Vec2 = this.m_deltas[i];

      dotMassSum += delta.LengthSquared() / body.GetMass();
      crossMassSum += b2Vec2.CrossVV(body_v, delta);
    }

    const lambda: number = -2 * crossMassSum / dotMassSum;
    // lambda = b2Clamp(lambda, -b2_maxLinearCorrection, b2_maxLinearCorrection);

    this.m_impulse += lambda;

    for (let i: number = 0; i < this.m_bodies.length; ++i) {
      const body: b2Body = this.m_bodies[i];
      const body_v: b2Vec2 = data.velocities[body.m_islandIndex].v;
      const delta: b2Vec2 = this.m_deltas[i];

      body_v.x += body.m_invMass *  delta.y * 0.5 * lambda;
      body_v.y += body.m_invMass * -delta.x * 0.5 * lambda;
    }
  }

  public SolvePositionConstraints(data: b2SolverData): boolean {
    let perimeter: number = 0;
    let area: number = 0;

    for (let i: number = 0; i < this.m_bodies.length; ++i) {
      const body: b2Body = this.m_bodies[i];
      const next: b2Body = this.m_bodies[(i + 1) % this.m_bodies.length];
      const body_c: b2Vec2 = data.positions[body.m_islandIndex].c;
      const next_c: b2Vec2 = data.positions[next.m_islandIndex].c;

      const delta: b2Vec2 = b2Vec2.SubVV(next_c, body_c, this.m_delta);

      let dist: number = delta.Length();
      if (dist < b2_epsilon) {
        dist = 1;
      }

      this.m_normals[i].x =  delta.y / dist;
      this.m_normals[i].y = -delta.x / dist;

      perimeter += dist;

      area += b2Vec2.CrossVV(body_c, next_c);
    }

    area *= 0.5;

    const deltaArea: number = this.m_targetArea - area;
    const toExtrude: number = 0.5 * deltaArea / perimeter;
    let done: boolean = true;

    for (let i: number = 0; i < this.m_bodies.length; ++i) {
      const body: b2Body = this.m_bodies[i];
      const body_c: b2Vec2 = data.positions[body.m_islandIndex].c;
      const next_i: number = (i + 1) % this.m_bodies.length;

      const delta: b2Vec2 = b2Vec2.AddVV(this.m_normals[i], this.m_normals[next_i], this.m_delta);
      delta.SelfMul(toExtrude);

      const norm_sq: number = delta.LengthSquared();
      if (norm_sq > b2Sq(b2_maxLinearCorrection)) {
        delta.SelfMul(b2_maxLinearCorrection / b2Sqrt(norm_sq));
      }
      if (norm_sq > b2Sq(b2_linearSlop)) {
        done = false;
      }

      body_c.x += delta.x;
      body_c.y += delta.y;
    }

    return done;
  }
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 
// DEBUG: 







// #if B2_ENABLE_CONTROLLER

// #endif

/// The body type.
/// static: zero mass, zero velocity, may be manually moved
/// kinematic: zero mass, non-zero velocity set by user, moved by solver
/// dynamic: positive mass, non-zero velocity determined by forces, moved by solver
 enum b2BodyType {
  b2_unknown = -1,
  b2_staticBody = 0,
  b2_kinematicBody = 1,
  b2_dynamicBody = 2,

  // TODO_ERIN
  // b2_bulletBody = 3
}

 interface b2IBodyDef {
  /// The body type: static, kinematic, or dynamic.
  /// Note: if a dynamic body would have zero mass, the mass is set to one.
  type?: b2BodyType;

  /// The world position of the body. Avoid creating bodies at the origin
  /// since this can lead to many overlapping shapes.
  position?: XY;

  /// The world angle of the body in radians.
  angle?: number;

  /// The linear velocity of the body's origin in world co-ordinates.
  linearVelocity?: XY;

  /// The angular velocity of the body.
  angularVelocity?: number;

  /// Linear damping is use to reduce the linear velocity. The damping parameter
  /// can be larger than 1.0f but the damping effect becomes sensitive to the
  /// time step when the damping parameter is large.
  /// Units are 1/time
  linearDamping?: number;

  /// Angular damping is use to reduce the angular velocity. The damping parameter
  /// can be larger than 1.0f but the damping effect becomes sensitive to the
  /// time step when the damping parameter is large.
  /// Units are 1/time
  angularDamping?: number;

  /// Set this flag to false if this body should never fall asleep. Note that
  /// this increases CPU usage.
  allowSleep?: boolean;

  /// Is this body initially awake or sleeping?
  awake?: boolean;

  /// Should this body be prevented from rotating? Useful for characters.
  fixedRotation?: boolean;

  /// Is this a fast moving body that should be prevented from tunneling through
  /// other moving bodies? Note that all bodies are prevented from tunneling through
  /// kinematic and static bodies. This setting is only considered on dynamic bodies.
  /// @warning You should use this flag sparingly since it increases processing time.
  bullet?: boolean;

  /// Does this body start out enabled?
  enabled?: boolean;

  /// Use this to store application specific body data.
  userData?: any;

  /// Scale the gravity applied to this body.
  gravityScale?: number;
}

/// A body definition holds all the data needed to construct a rigid body.
/// You can safely re-use body definitions. Shapes are added to a body after construction.
 class b2BodyDef implements b2IBodyDef {
  /// The body type: static, kinematic, or dynamic.
  /// Note: if a dynamic body would have zero mass, the mass is set to one.
  public type: b2BodyType = b2BodyType.b2_staticBody;

  /// The world position of the body. Avoid creating bodies at the origin
  /// since this can lead to many overlapping shapes.
  public  position: b2Vec2 = new b2Vec2(0, 0);

  /// The world angle of the body in radians.
  public angle: number = 0;

  /// The linear velocity of the body's origin in world co-ordinates.
  public  linearVelocity: b2Vec2 = new b2Vec2(0, 0);

  /// The angular velocity of the body.
  public angularVelocity: number = 0;

  /// Linear damping is use to reduce the linear velocity. The damping parameter
  /// can be larger than 1.0f but the damping effect becomes sensitive to the
  /// time step when the damping parameter is large.
  public linearDamping: number = 0;

  /// Angular damping is use to reduce the angular velocity. The damping parameter
  /// can be larger than 1.0f but the damping effect becomes sensitive to the
  /// time step when the damping parameter is large.
  public angularDamping: number = 0;

  /// Set this flag to false if this body should never fall asleep. Note that
  /// this increases CPU usage.
  public allowSleep: boolean = true;

  /// Is this body initially awake or sleeping?
  public awake: boolean = true;

  /// Should this body be prevented from rotating? Useful for characters.
  public fixedRotation: boolean = false;

  /// Is this a fast moving body that should be prevented from tunneling through
  /// other moving bodies? Note that all bodies are prevented from tunneling through
  /// kinematic and static bodies. This setting is only considered on dynamic bodies.
  /// @warning You should use this flag sparingly since it increases processing time.
  public bullet: boolean = false;

  /// Does this body start out enabled?
  public enabled: boolean = true;

  /// Use this to store application specific body data.
  public userData: any = null;

  /// Scale the gravity applied to this body.
  public gravityScale: number = 1;
}

/// A rigid body. These are created via b2World::CreateBody.
 class b2Body {
  public m_type: b2BodyType = b2BodyType.b2_staticBody;

  public m_islandFlag: boolean = false;
  public m_awakeFlag: boolean = false;
  public m_autoSleepFlag: boolean = false;
  public m_bulletFlag: boolean = false;
  public m_fixedRotationFlag: boolean = false;
  public m_enabledFlag: boolean = false;
  public m_toiFlag: boolean = false;

  public m_islandIndex: number = 0;

  public  m_xf: b2Transform = new b2Transform();  // the body origin transform
  // #if B2_ENABLE_PARTICLE
  public  m_xf0: b2Transform = new b2Transform();
  // #endif
  public  m_sweep: b2Sweep = new b2Sweep();    // the swept motion for CCD

  public  m_linearVelocity: b2Vec2 = new b2Vec2();
  public m_angularVelocity: number = 0;

  public  m_force: b2Vec2 = new b2Vec2();
  public m_torque: number = 0;

  public m_world: b2World;
  public m_prev: b2Body  = null;
  public m_next: b2Body  = null;

  public m_fixtureList: b2Fixture  = null;
  public m_fixtureCount: number = 0;

  public m_jointList: b2JointEdge  = null;
  public m_contactList: b2ContactEdge  = null;

  public m_mass: number = 1;
  public m_invMass: number = 1;

  // Rotational inertia about the center of mass.
  public m_I: number = 0;
  public m_invI: number = 0;

  public m_linearDamping: number = 0;
  public m_angularDamping: number = 0;
  public m_gravityScale: number = 1;

  public m_sleepTime: number = 0;

  public m_userData: any = null;

  // #if B2_ENABLE_CONTROLLER
  public m_controllerList: b2ControllerEdge  = null;
  public m_controllerCount: number = 0;
  // #endif

  constructor(bd: b2IBodyDef, world: b2World) {
    this.m_bulletFlag = b2Maybe(bd.bullet, false);
    this.m_fixedRotationFlag = b2Maybe(bd.fixedRotation, false);
    this.m_autoSleepFlag = b2Maybe(bd.allowSleep, true);
    // this.m_awakeFlag = b2Maybe(bd.awake, true);
    if (b2Maybe(bd.awake, false) && b2Maybe(bd.type, b2BodyType.b2_staticBody) !== b2BodyType.b2_staticBody) {
      this.m_awakeFlag = true;
    }
    this.m_enabledFlag = b2Maybe(bd.enabled, true);

    this.m_world = world;

    this.m_xf.p.Copy(b2Maybe(bd.position, b2Vec2.ZERO));
    // DEBUG: b2Assert(this.m_xf.p.IsValid());
    this.m_xf.q.SetAngle(b2Maybe(bd.angle, 0));
    // DEBUG: b2Assert(b2IsValid(this.m_xf.q.GetAngle()));
    // #if B2_ENABLE_PARTICLE
    this.m_xf0.Copy(this.m_xf);
    // #endif

    this.m_sweep.localCenter.SetZero();
    this.m_sweep.c0.Copy(this.m_xf.p);
    this.m_sweep.c.Copy(this.m_xf.p);
    this.m_sweep.a0 = this.m_sweep.a = this.m_xf.q.GetAngle();
    this.m_sweep.alpha0 = 0;

    this.m_linearVelocity.Copy(b2Maybe(bd.linearVelocity, b2Vec2.ZERO));
    // DEBUG: b2Assert(this.m_linearVelocity.IsValid());
    this.m_angularVelocity = b2Maybe(bd.angularVelocity, 0);
    // DEBUG: b2Assert(b2IsValid(this.m_angularVelocity));

    this.m_linearDamping = b2Maybe(bd.linearDamping, 0);
    this.m_angularDamping = b2Maybe(bd.angularDamping, 0);
    this.m_gravityScale = b2Maybe(bd.gravityScale, 1);
    // DEBUG: b2Assert(b2IsValid(this.m_gravityScale) && this.m_gravityScale >= 0);
    // DEBUG: b2Assert(b2IsValid(this.m_angularDamping) && this.m_angularDamping >= 0);
    // DEBUG: b2Assert(b2IsValid(this.m_linearDamping) && this.m_linearDamping >= 0);

    this.m_force.SetZero();
    this.m_torque = 0;

    this.m_sleepTime = 0;

    this.m_type = b2Maybe(bd.type, b2BodyType.b2_staticBody);

    this.m_mass = 0;
    this.m_invMass = 0;

    this.m_I = 0;
    this.m_invI = 0;

    this.m_userData = bd.userData;

    this.m_fixtureList = null;
    this.m_fixtureCount = 0;

    // #if B2_ENABLE_CONTROLLER
    this.m_controllerList = null;
    this.m_controllerCount = 0;
    // #endif
  }

  public CreateFixture(def: b2IFixtureDef): b2Fixture;
  public CreateFixture(shape: b2Shape): b2Fixture;
  public CreateFixture(shape: b2Shape, density: number): b2Fixture;
  public CreateFixture(a: b2IFixtureDef | b2Shape, b: number = 0): b2Fixture {
    if (a instanceof b2Shape) {
      return this.CreateFixtureShapeDensity(a, b);
    } else {
      return this.CreateFixtureDef(a);
    }
  }

  /// Creates a fixture and attach it to this body. Use this function if you need
  /// to set some fixture parameters, like friction. Otherwise you can create the
  /// fixture directly from a shape.
  /// If the density is non-zero, this function automatically updates the mass of the body.
  /// Contacts are not created until the next time step.
  /// @param def the fixture definition.
  /// @warning This function is locked during callbacks.
  public CreateFixtureDef(def: b2IFixtureDef): b2Fixture {
    if (this.m_world.IsLocked()) { throw new Error(); }

    const fixture: b2Fixture = new b2Fixture(this, def);

    if (this.m_enabledFlag) {
      fixture.CreateProxies();
    }

    fixture.m_next = this.m_fixtureList;
    this.m_fixtureList = fixture;
    ++this.m_fixtureCount;

    // fixture.m_body = this;

    // Adjust mass properties if needed.
    if (fixture.m_density > 0) {
      this.ResetMassData();
    }

    // Let the world know we have a new fixture. This will cause new contacts
    // to be created at the beginning of the next time step.
    this.m_world.m_newContacts = true;

    return fixture;
  }

  /// Creates a fixture from a shape and attach it to this body.
  /// This is a convenience function. Use b2FixtureDef if you need to set parameters
  /// like friction, restitution, user data, or filtering.
  /// If the density is non-zero, this function automatically updates the mass of the body.
  /// @param shape the shape to be cloned.
  /// @param density the shape density (set to zero for static bodies).
  /// @warning This function is locked during callbacks.
  private static CreateFixtureShapeDensity_s_def: b2FixtureDef = new b2FixtureDef();
  public CreateFixtureShapeDensity(shape: b2Shape, density: number = 0): b2Fixture {
    const def: b2FixtureDef = b2Body.CreateFixtureShapeDensity_s_def;
    def.shape = shape;
    def.density = density;
    return this.CreateFixtureDef(def);
  }

  /// Destroy a fixture. This removes the fixture from the broad-phase and
  /// destroys all contacts associated with this fixture. This will
  /// automatically adjust the mass of the body if the body is dynamic and the
  /// fixture has positive density.
  /// All fixtures attached to a body are implicitly destroyed when the body is destroyed.
  /// @param fixture the fixture to be removed.
  /// @warning This function is locked during callbacks.
  public DestroyFixture(fixture: b2Fixture): void {
    if (this.m_world.IsLocked()) { throw new Error(); }

    // DEBUG: b2Assert(fixture.m_body === this);

    // Remove the fixture from this body's singly linked list.
    // DEBUG: b2Assert(this.m_fixtureCount > 0);
    let node: b2Fixture  = this.m_fixtureList;
    let ppF: b2Fixture  = null;
    // DEBUG: let found: boolean = false;
    while (node !== null) {
      if (node === fixture) {
        if (ppF) {
          ppF.m_next = fixture.m_next;
        } else {
          this.m_fixtureList = fixture.m_next;
        }
        // DEBUG: found = true;
        break;
      }

      ppF = node;
      node = node.m_next;
    }

    // You tried to remove a shape that is not attached to this body.
    // DEBUG: b2Assert(found);

    // Destroy any contacts associated with the fixture.
    let edge: b2ContactEdge  = this.m_contactList;
    while (edge) {
      const c = edge.contact;
      edge = edge.next;

      const fixtureA: b2Fixture = c.GetFixtureA();
      const fixtureB: b2Fixture = c.GetFixtureB();

      if (fixture === fixtureA || fixture === fixtureB) {
        // This destroys the contact and removes it from
        // this body's contact list.
        this.m_world.m_contactManager.Destroy(c);
      }
    }

    if (this.m_enabledFlag) {
      fixture.DestroyProxies();
    }

    // fixture.m_body = null;
    fixture.m_next = null;
    fixture.Reset();

    --this.m_fixtureCount;

    // Reset the mass data.
    this.ResetMassData();
  }

  /// Set the position of the body's origin and rotation.
  /// This breaks any contacts and wakes the other bodies.
  /// Manipulating a body's transform may cause non-physical behavior.
  /// @param position the world position of the body's local origin.
  /// @param angle the world rotation in radians.
  public SetTransformVec(position: XY, angle: number): void {
    this.SetTransformXY(position.x, position.y, angle);
  }

  public SetTransformXY(x: number, y: number, angle: number): void {
    if (this.m_world.IsLocked()) { throw new Error(); }

    this.m_xf.q.SetAngle(angle);
    this.m_xf.p.Set(x, y);
    // #if B2_ENABLE_PARTICLE
    this.m_xf0.Copy(this.m_xf);
    // #endif

    b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
    this.m_sweep.a = angle;

    this.m_sweep.c0.Copy(this.m_sweep.c);
    this.m_sweep.a0 = angle;

    for (let f: b2Fixture  = this.m_fixtureList; f; f = f.m_next) {
      f.SynchronizeProxies(this.m_xf, this.m_xf);
    }

    // Check for new contacts the next step
    this.m_world.m_newContacts = true;
  }

  public SetTransform(xf: b2Transform): void {
    this.SetTransformVec(xf.p, xf.GetAngle());
  }

  /// Get the body transform for the body's origin.
  /// @return the world transform of the body's origin.
  public GetTransform(): b2Transform {
    return this.m_xf;
  }

  /// Get the world body origin position.
  /// @return the world position of the body's origin.
  public GetPosition():b2Vec2 {
    return this.m_xf.p;
  }

  public SetPosition(position: XY): void {
    this.SetTransformVec(position, this.GetAngle());
  }

  public SetPositionXY(x: number, y: number): void {
    this.SetTransformXY(x, y, this.GetAngle());
  }

  /// Get the angle in radians.
  /// @return the current world rotation angle in radians.
  public GetAngle(): number {
    return this.m_sweep.a;
  }

  public SetAngle(angle: number): void {
    this.SetTransformVec(this.GetPosition(), angle);
  }

  /// Get the world position of the center of mass.
  public GetWorldCenter():b2Vec2 {
    return this.m_sweep.c;
  }

  /// Get the local position of the center of mass.
  public GetLocalCenter():b2Vec2 {
    return this.m_sweep.localCenter;
  }

  /// Set the linear velocity of the center of mass.
  /// @param v the new linear velocity of the center of mass.
  public SetLinearVelocity(v: XY): void {
    if (this.m_type === b2BodyType.b2_staticBody) {
      return;
    }

    if (b2Vec2.DotVV(v, v) > 0) {
      this.SetAwake(true);
    }

    this.m_linearVelocity.Copy(v);
  }

  /// Get the linear velocity of the center of mass.
  /// @return the linear velocity of the center of mass.
  public GetLinearVelocity():b2Vec2 {
    return this.m_linearVelocity;
  }

  /// Set the angular velocity.
  /// @param omega the new angular velocity in radians/second.
  public SetAngularVelocity(w: number): void {
    if (this.m_type === b2BodyType.b2_staticBody) {
      return;
    }

    if (w * w > 0) {
      this.SetAwake(true);
    }

    this.m_angularVelocity = w;
  }

  /// Get the angular velocity.
  /// @return the angular velocity in radians/second.
  public GetAngularVelocity(): number {
    return this.m_angularVelocity;
  }

  public GetDefinition(bd: b2BodyDef): b2BodyDef {
    bd.type = this.GetType();
    bd.allowSleep = this.m_autoSleepFlag;
    bd.angle = this.GetAngle();
    bd.angularDamping = this.m_angularDamping;
    bd.gravityScale = this.m_gravityScale;
    bd.angularVelocity = this.m_angularVelocity;
    bd.fixedRotation = this.m_fixedRotationFlag;
    bd.bullet = this.m_bulletFlag;
    bd.awake = this.m_awakeFlag;
    bd.linearDamping = this.m_linearDamping;
    bd.linearVelocity.Copy(this.GetLinearVelocity());
    bd.position.Copy(this.GetPosition());
    bd.userData = this.GetUserData();
    return bd;
  }

  /// Apply a force at a world point. If the force is not
  /// applied at the center of mass, it will generate a torque and
  /// affect the angular velocity. This wakes up the body.
  /// @param force the world force vector, usually in Newtons (N).
  /// @param point the world position of the point of application.
  /// @param wake also wake up the body
  public ApplyForce(force: XY, point: XY, wake: boolean = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_force.x += force.x;
      this.m_force.y += force.y;
      this.m_torque += ((point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x);
    }
  }

  /// Apply a force to the center of mass. This wakes up the body.
  /// @param force the world force vector, usually in Newtons (N).
  /// @param wake also wake up the body
  public ApplyForceToCenter(force: XY, wake: boolean = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_force.x += force.x;
      this.m_force.y += force.y;
    }
  }

  /// Apply a torque. This affects the angular velocity
  /// without affecting the linear velocity of the center of mass.
  /// @param torque about the z-axis (out of the screen), usually in N-m.
  /// @param wake also wake up the body
  public ApplyTorque(torque: number, wake: boolean = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_torque += torque;
    }
  }

  /// Apply an impulse at a point. This immediately modifies the velocity.
  /// It also modifies the angular velocity if the point of application
  /// is not at the center of mass. This wakes up the body.
  /// @param impulse the world impulse vector, usually in N-seconds or kg-m/s.
  /// @param point the world position of the point of application.
  /// @param wake also wake up the body
  public ApplyLinearImpulse(impulse: XY, point: XY, wake: boolean = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_linearVelocity.x += this.m_invMass * impulse.x;
      this.m_linearVelocity.y += this.m_invMass * impulse.y;
      this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x);
    }
  }

  /// Apply an impulse at the center of gravity. This immediately modifies the velocity.
  /// @param impulse the world impulse vector, usually in N-seconds or kg-m/s.
  /// @param wake also wake up the body
  public ApplyLinearImpulseToCenter(impulse: XY, wake: boolean = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_linearVelocity.x += this.m_invMass * impulse.x;
      this.m_linearVelocity.y += this.m_invMass * impulse.y;
    }
  }

  /// Apply an angular impulse.
  /// @param impulse the angular impulse in units of kg*m*m/s
  /// @param wake also wake up the body
  public ApplyAngularImpulse(impulse: number, wake: boolean = true): void {
    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    if (wake && !this.m_awakeFlag) {
      this.SetAwake(true);
    }

    // Don't accumulate a force if the body is sleeping.
    if (this.m_awakeFlag) {
      this.m_angularVelocity += this.m_invI * impulse;
    }
  }

  /// Get the total mass of the body.
  /// @return the mass, usually in kilograms (kg).
  public GetMass(): number {
    return this.m_mass;
  }

  /// Get the rotational inertia of the body about the local origin.
  /// @return the rotational inertia, usually in kg-m^2.
  public GetInertia(): number {
    return this.m_I + this.m_mass * b2Vec2.DotVV(this.m_sweep.localCenter, this.m_sweep.localCenter);
  }

  /// Get the mass data of the body.
  /// @return a struct containing the mass, inertia and center of the body.
  public GetMassData(data: b2MassData): b2MassData {
    data.mass = this.m_mass;
    data.I = this.m_I + this.m_mass * b2Vec2.DotVV(this.m_sweep.localCenter, this.m_sweep.localCenter);
    data.center.Copy(this.m_sweep.localCenter);
    return data;
  }

  /// Set the mass properties to override the mass properties of the fixtures.
  /// Note that this changes the center of mass position.
  /// Note that creating or destroying fixtures can also alter the mass.
  /// This function has no effect if the body isn't dynamic.
  /// @param massData the mass properties.
  private static SetMassData_s_oldCenter: b2Vec2 = new b2Vec2();
  public SetMassData(massData: b2MassData): void {
    if (this.m_world.IsLocked()) { throw new Error(); }

    if (this.m_type !== b2BodyType.b2_dynamicBody) {
      return;
    }

    this.m_invMass = 0;
    this.m_I = 0;
    this.m_invI = 0;

    this.m_mass = massData.mass;
    if (this.m_mass <= 0) {
      this.m_mass = 1;
    }

    this.m_invMass = 1 / this.m_mass;

    if (massData.I > 0 && !this.m_fixedRotationFlag) {
      this.m_I = massData.I - this.m_mass * b2Vec2.DotVV(massData.center, massData.center);
      // DEBUG: b2Assert(this.m_I > 0);
      this.m_invI = 1 / this.m_I;
    }

    // Move center of mass.
    const oldCenter: b2Vec2 = b2Body.SetMassData_s_oldCenter.Copy(this.m_sweep.c);
    this.m_sweep.localCenter.Copy(massData.center);
    b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
    this.m_sweep.c0.Copy(this.m_sweep.c);

    // Update center of mass velocity.
    b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(this.m_sweep.c, oldCenter, b2Vec2.s_t0), this.m_linearVelocity);
  }

  /// This resets the mass properties to the sum of the mass properties of the fixtures.
  /// This normally does not need to be called unless you called SetMassData to override
  /// the mass and you later want to reset the mass.
  private static ResetMassData_s_localCenter: b2Vec2 = new b2Vec2();
  private static ResetMassData_s_oldCenter: b2Vec2 = new b2Vec2();
  private static ResetMassData_s_massData: b2MassData = new b2MassData();
  public ResetMassData(): void {
    // Compute mass data from shapes. Each shape has its own density.
    this.m_mass = 0;
    this.m_invMass = 0;
    this.m_I = 0;
    this.m_invI = 0;
    this.m_sweep.localCenter.SetZero();

    // Static and kinematic bodies have zero mass.
    if (this.m_type === b2BodyType.b2_staticBody || this.m_type === b2BodyType.b2_kinematicBody) {
      this.m_sweep.c0.Copy(this.m_xf.p);
      this.m_sweep.c.Copy(this.m_xf.p);
      this.m_sweep.a0 = this.m_sweep.a;
      return;
    }

    // DEBUG: b2Assert(this.m_type === b2BodyType.b2_dynamicBody);

    // Accumulate mass over all fixtures.
    const localCenter: b2Vec2 = b2Body.ResetMassData_s_localCenter.SetZero();
    for (let f: b2Fixture  = this.m_fixtureList; f; f = f.m_next) {
      if (f.m_density === 0) {
        continue;
      }

      const massData: b2MassData = f.GetMassData(b2Body.ResetMassData_s_massData);
      this.m_mass += massData.mass;
      localCenter.x += massData.center.x * massData.mass;
      localCenter.y += massData.center.y * massData.mass;
      this.m_I += massData.I;
    }

    // Compute center of mass.
    if (this.m_mass > 0) {
      this.m_invMass = 1 / this.m_mass;
      localCenter.x *= this.m_invMass;
      localCenter.y *= this.m_invMass;
    }

    if (this.m_I > 0 && !this.m_fixedRotationFlag) {
      // Center the inertia about the center of mass.
      this.m_I -= this.m_mass * b2Vec2.DotVV(localCenter, localCenter);
      // DEBUG: b2Assert(this.m_I > 0);
      this.m_invI = 1 / this.m_I;
    } else {
      this.m_I = 0;
      this.m_invI = 0;
    }

    // Move center of mass.
    const oldCenter: b2Vec2 = b2Body.ResetMassData_s_oldCenter.Copy(this.m_sweep.c);
    this.m_sweep.localCenter.Copy(localCenter);
    b2Transform.MulXV(this.m_xf, this.m_sweep.localCenter, this.m_sweep.c);
    this.m_sweep.c0.Copy(this.m_sweep.c);

    // Update center of mass velocity.
    b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(this.m_sweep.c, oldCenter, b2Vec2.s_t0), this.m_linearVelocity);
  }

  /// Get the world coordinates of a point given the local coordinates.
  /// @param localPoint a point on the body measured relative the the body's origin.
  /// @return the same point expressed in world coordinates.
  public GetWorldPoint<T extends XY>(localPoint: XY, out: T): T {
    return b2Transform.MulXV(this.m_xf, localPoint, out);
  }

  /// Get the world coordinates of a vector given the local coordinates.
  /// @param localVector a vector fixed in the body.
  /// @return the same vector expressed in world coordinates.
  public GetWorldVector<T extends XY>(localVector: XY, out: T): T {
    return b2Rot.MulRV(this.m_xf.q, localVector, out);
  }

  /// Gets a local point relative to the body's origin given a world point.
  /// @param a point in world coordinates.
  /// @return the corresponding local point relative to the body's origin.
  public GetLocalPoint<T extends XY>(worldPoint: XY, out: T): T {
    return b2Transform.MulTXV(this.m_xf, worldPoint, out);
  }

  /// Gets a local vector given a world vector.
  /// @param a vector in world coordinates.
  /// @return the corresponding local vector.
  public GetLocalVector<T extends XY>(worldVector: XY, out: T): T {
    return b2Rot.MulTRV(this.m_xf.q, worldVector, out);
  }

  /// Get the world linear velocity of a world point attached to this body.
  /// @param a point in world coordinates.
  /// @return the world velocity of a point.
  public GetLinearVelocityFromWorldPoint<T extends XY>(worldPoint: XY, out: T): T {
    return b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(worldPoint, this.m_sweep.c, b2Vec2.s_t0), out);
  }

  /// Get the world velocity of a local point.
  /// @param a point in local coordinates.
  /// @return the world velocity of a point.
  public GetLinearVelocityFromLocalPoint<T extends XY>(localPoint: XY, out: T): T {
    return this.GetLinearVelocityFromWorldPoint(this.GetWorldPoint(localPoint, out), out);
  }

  /// Get the linear damping of the body.
  public GetLinearDamping(): number {
    return this.m_linearDamping;
  }

  /// Set the linear damping of the body.
  public SetLinearDamping(linearDamping: number): void {
    this.m_linearDamping = linearDamping;
  }

  /// Get the angular damping of the body.
  public GetAngularDamping(): number {
    return this.m_angularDamping;
  }

  /// Set the angular damping of the body.
  public SetAngularDamping(angularDamping: number): void {
    this.m_angularDamping = angularDamping;
  }

  /// Get the gravity scale of the body.
  public GetGravityScale(): number {
    return this.m_gravityScale;
  }

  /// Set the gravity scale of the body.
  public SetGravityScale(scale: number): void {
    this.m_gravityScale = scale;
  }

  /// Set the type of this body. This may alter the mass and velocity.
  public SetType(type: b2BodyType): void {
    if (this.m_world.IsLocked()) { throw new Error(); }

    if (this.m_type === type) {
      return;
    }

    this.m_type = type;

    this.ResetMassData();

    if (this.m_type === b2BodyType.b2_staticBody) {
      this.m_linearVelocity.SetZero();
      this.m_angularVelocity = 0;
      this.m_sweep.a0 = this.m_sweep.a;
      this.m_sweep.c0.Copy(this.m_sweep.c);
      this.m_awakeFlag = false;
      this.SynchronizeFixtures();
    }

    this.SetAwake(true);

    this.m_force.SetZero();
    this.m_torque = 0;

    // Delete the attached contacts.
    let ce: b2ContactEdge  = this.m_contactList;
    while (ce) {
      const ce0: b2ContactEdge = ce;
      ce = ce.next;
      this.m_world.m_contactManager.Destroy(ce0.contact);
    }
    this.m_contactList = null;

    // Touch the proxies so that new contacts will be created (when appropriate)
    for (let f: b2Fixture  = this.m_fixtureList; f; f = f.m_next) {
      f.TouchProxies();
    }
  }

  /// Get the type of this body.
  public GetType(): b2BodyType {
    return this.m_type;
  }

  /// Should this body be treated like a bullet for continuous collision detection?
  public SetBullet(flag: boolean): void {
    this.m_bulletFlag = flag;
  }

  /// Is this body treated like a bullet for continuous collision detection?
  public IsBullet(): boolean {
    return this.m_bulletFlag;
  }

  /// You can disable sleeping on this body. If you disable sleeping, the
  /// body will be woken.
  public SetSleepingAllowed(flag: boolean): void {
    this.m_autoSleepFlag = flag;
    if (!flag) {
      this.SetAwake(true);
    }
  }

  /// Is this body allowed to sleep
  public IsSleepingAllowed(): boolean {
    return this.m_autoSleepFlag;
  }

  /// Set the sleep state of the body. A sleeping body has very
  /// low CPU cost.
  /// @param flag set to true to wake the body, false to put it to sleep.
  public SetAwake(flag: boolean): void {
    if (this.m_type === b2BodyType.b2_staticBody) {
      return;
    }
    if (flag) {
      this.m_awakeFlag = true;
      this.m_sleepTime = 0;
    } else {
      this.m_awakeFlag = false;
      this.m_sleepTime = 0;
      this.m_linearVelocity.SetZero();
      this.m_angularVelocity = 0;
      this.m_force.SetZero();
      this.m_torque = 0;
    }
  }

  /// Get the sleeping state of this body.
  /// @return true if the body is sleeping.
  public IsAwake(): boolean {
    return this.m_awakeFlag;
  }

  /// Allow a body to be disabled. A disabled body is not simulated and cannot
  /// be collided with or woken up.
  /// If you pass a flag of true, all fixtures will be added to the broad-phase.
  /// If you pass a flag of false, all fixtures will be removed from the
  /// broad-phase and all contacts will be destroyed.
  /// Fixtures and joints are otherwise unaffected. You may continue
  /// to create/destroy fixtures and joints on disabled bodies.
  /// Fixtures on a disabled body are implicitly disabled and will
  /// not participate in collisions, ray-casts, or queries.
  /// Joints connected to a disabled body are implicitly disabled.
  /// An diabled body is still owned by a b2World object and remains
  /// in the body list.
  public SetEnabled(flag: boolean): void {
    if (this.m_world.IsLocked()) { throw new Error(); }

    if (flag === this.IsEnabled()) {
      return;
    }

    this.m_enabledFlag = flag;

    if (flag) {
      // Create all proxies.
      for (let f: b2Fixture  = this.m_fixtureList; f; f = f.m_next) {
        f.CreateProxies();
      }
      // Contacts are created at the beginning of the next
      this.m_world.m_newContacts = true;
    } else {
      // Destroy all proxies.
      for (let f: b2Fixture  = this.m_fixtureList; f; f = f.m_next) {
        f.DestroyProxies();
      }
      // Destroy the attached contacts.
      let ce: b2ContactEdge  = this.m_contactList;
      while (ce) {
        const ce0: b2ContactEdge = ce;
        ce = ce.next;
        this.m_world.m_contactManager.Destroy(ce0.contact);
      }
      this.m_contactList = null;
    }
  }

  /// Get the active state of the body.
  public IsEnabled(): boolean {
    return this.m_enabledFlag;
  }

  /// Set this body to have fixed rotation. This causes the mass
  /// to be reset.
  public SetFixedRotation(flag: boolean): void {
    if (this.m_fixedRotationFlag === flag) {
      return;
    }

    this.m_fixedRotationFlag = flag;

    this.m_angularVelocity = 0;

    this.ResetMassData();
  }

  /// Does this body have fixed rotation?
  public IsFixedRotation(): boolean {
    return this.m_fixedRotationFlag;
  }

  /// Get the list of all fixtures attached to this body.
  public GetFixtureList(): b2Fixture  {
    return this.m_fixtureList;
  }

  /// Get the list of all joints attached to this body.
  public GetJointList(): b2JointEdge  {
    return this.m_jointList;
  }

  /// Get the list of all contacts attached to this body.
  /// @warning this list changes during the time step and you may
  /// miss some collisions if you don't use b2ContactListener.
  public GetContactList(): b2ContactEdge  {
    return this.m_contactList;
  }

  /// Get the next body in the world's body list.
  public GetNext(): b2Body  {
    return this.m_next;
  }

  /// Get the user data pointer that was provided in the body definition.
  public GetUserData(): any {
    return this.m_userData;
  }

  /// Set the user data. Use this to store your application specific data.
  public SetUserData(data: any): void {
    this.m_userData = data;
  }

  /// Get the parent world of this body.
  public GetWorld(): b2World {
    return this.m_world;
  }

  /// Dump this body to a file
  public Dump(log: (format: string, ...args: any[]) => void): void {
    const bodyIndex: number = this.m_islandIndex;

    log("{\n");
    log("  const bd: b2BodyDef = new b2BodyDef();\n");
    let type_str: string = "";
    switch (this.m_type) {
      case b2BodyType.b2_staticBody:
        type_str = "b2BodyType.b2_staticBody";
        break;
      case b2BodyType.b2_kinematicBody:
        type_str = "b2BodyType.b2_kinematicBody";
        break;
      case b2BodyType.b2_dynamicBody:
        type_str = "b2BodyType.b2_dynamicBody";
        break;
      default:
        // DEBUG: b2Assert(false);
        break;
    }
    log("  bd.type = %s;\n", type_str);
    log("  bd.position.Set(%.15f, %.15f);\n", this.m_xf.p.x, this.m_xf.p.y);
    log("  bd.angle = %.15f;\n", this.m_sweep.a);
    log("  bd.linearVelocity.Set(%.15f, %.15f);\n", this.m_linearVelocity.x, this.m_linearVelocity.y);
    log("  bd.angularVelocity = %.15f;\n", this.m_angularVelocity);
    log("  bd.linearDamping = %.15f;\n", this.m_linearDamping);
    log("  bd.angularDamping = %.15f;\n", this.m_angularDamping);
    log("  bd.allowSleep = %s;\n", (this.m_autoSleepFlag) ? ("true") : ("false"));
    log("  bd.awake = %s;\n", (this.m_awakeFlag) ? ("true") : ("false"));
    log("  bd.fixedRotation = %s;\n", (this.m_fixedRotationFlag) ? ("true") : ("false"));
    log("  bd.bullet = %s;\n", (this.m_bulletFlag) ? ("true") : ("false"));
    log("  bd.active = %s;\n", (this.m_enabledFlag) ? ("true") : ("false"));
    log("  bd.gravityScale = %.15f;\n", this.m_gravityScale);
    log("\n");
    log("  bodies[%d] = this.m_world.CreateBody(bd);\n", this.m_islandIndex);
    log("\n");
    for (let f: b2Fixture  = this.m_fixtureList; f; f = f.m_next) {
      log("  {\n");
      f.Dump(log, bodyIndex);
      log("  }\n");
    }
    log("}\n");
  }

  private static SynchronizeFixtures_s_xf1: b2Transform = new b2Transform();
  public SynchronizeFixtures(): void {
    if (this.m_awakeFlag) {
      const xf1: b2Transform = b2Body.SynchronizeFixtures_s_xf1;
      xf1.q.SetAngle(this.m_sweep.a0);
      b2Rot.MulRV(xf1.q, this.m_sweep.localCenter, xf1.p);
      b2Vec2.SubVV(this.m_sweep.c0, xf1.p, xf1.p);

      for (let f: b2Fixture  = this.m_fixtureList; f; f = f.m_next) {
        f.SynchronizeProxies(xf1, this.m_xf);
      }
    } else {
      for (let f: b2Fixture  = this.m_fixtureList; f; f = f.m_next) {
        f.SynchronizeProxies(this.m_xf, this.m_xf);
      }
    }
  }

  public SynchronizeTransform(): void {
    this.m_xf.q.SetAngle(this.m_sweep.a);
    b2Rot.MulRV(this.m_xf.q, this.m_sweep.localCenter, this.m_xf.p);
    b2Vec2.SubVV(this.m_sweep.c, this.m_xf.p, this.m_xf.p);
  }

  // This is used to prevent connected bodies from colliding.
  // It may lie, depending on the collideConnected flag.
  public ShouldCollide(other: b2Body): boolean {
    // At least one body should be dynamic or kinematic.
    if (this.m_type === b2BodyType.b2_staticBody && other.m_type === b2BodyType.b2_staticBody) {
      return false;
    }
    return this.ShouldCollideConnected(other);
  }

  public ShouldCollideConnected(other: b2Body): boolean {
    // Does a joint prevent collision?
    for (let jn: b2JointEdge  = this.m_jointList; jn; jn = jn.next) {
      if (jn.other === other) {
        if (!jn.joint.m_collideConnected) {
          return false;
        }
      }
    }

    return true;
  }

  public Advance(alpha: number): void {
    // Advance to the new safe time. This doesn't sync the broad-phase.
    this.m_sweep.Advance(alpha);
    this.m_sweep.c.Copy(this.m_sweep.c0);
    this.m_sweep.a = this.m_sweep.a0;
    this.m_xf.q.SetAngle(this.m_sweep.a);
    b2Rot.MulRV(this.m_xf.q, this.m_sweep.localCenter, this.m_xf.p);
    b2Vec2.SubVV(this.m_sweep.c, this.m_xf.p, this.m_xf.p);
  }

  // #if B2_ENABLE_CONTROLLER
  public GetControllerList(): b2ControllerEdge  {
    return this.m_controllerList;
  }

  public GetControllerCount(): number {
    return this.m_controllerCount;
  }
  // #endif
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/









 class b2ChainAndCircleContact extends b2Contact<b2ChainShape, b2CircleShape> {
  public static Create(): b2Contact {
    return new b2ChainAndCircleContact();
  }

  public static Destroy(contact: b2Contact): void {
  }

  private static Evaluate_s_edge = new b2EdgeShape();
  public Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void {
    const edge: b2EdgeShape = b2ChainAndCircleContact.Evaluate_s_edge;
    this.GetShapeA().GetChildEdge(edge, this.m_indexA);
    b2CollideEdgeAndCircle(manifold, edge, xfA, this.GetShapeB(), xfB);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/









 class b2ChainAndPolygonContact extends b2Contact<b2ChainShape, b2PolygonShape> {
  public static Create(): b2Contact {
    return new b2ChainAndPolygonContact();
  }

  public static Destroy(contact: b2Contact): void {
  }

  private static Evaluate_s_edge = new b2EdgeShape();
  public Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void {
    const edge: b2EdgeShape = b2ChainAndPolygonContact.Evaluate_s_edge;
    this.GetShapeA().GetChildEdge(edge, this.m_indexA);
    b2CollideEdgeAndPolygon(manifold, edge, xfA, this.GetShapeB(), xfB);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







 class b2CircleContact extends b2Contact<b2CircleShape, b2CircleShape> {
  public static Create(): b2Contact {
    return new b2CircleContact();
  }

  public static Destroy(contact: b2Contact): void {
  }

  public Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void {
    b2CollideCircles(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/











/// Friction mixing law. The idea is to allow either fixture to drive the friction to zero.
/// For example, anything slides on ice.
 function b2MixFriction(friction1: number, friction2: number): number {
  return b2Sqrt(friction1 * friction2);
}

/// Restitution mixing law. The idea is allow for anything to bounce off an inelastic surface.
/// For example, a superball bounces on anything.
 function b2MixRestitution(restitution1: number, restitution2: number): number {
  return restitution1 > restitution2 ? restitution1 : restitution2;
}

/// Restitution mixing law. This picks the lowest value.
 function b2MixRestitutionThreshold(threshold1: number, threshold2: number): number {
  return threshold1 < threshold2 ? threshold1 : threshold2;
}

 class b2ContactEdge {
  private _other: b2Body  = null; ///< provides quick access to the other body attached.
  public get other(): b2Body {
    if (this._other === null) { throw new Error(); }
    return this._other;
  }
  public set other(value: b2Body) {
    if (this._other !== null) { throw new Error(); }
    this._other = value;
  }
  public  contact: b2Contact; ///< the contact
  public prev: b2ContactEdge  = null; ///< the previous contact edge in the body's contact list
  public next: b2ContactEdge  = null; ///< the next contact edge in the body's contact list
  constructor(contact: b2Contact) {
    this.contact = contact;
  }
  public Reset(): void {
    this._other = null;
    this.prev = null;
    this.next = null;
  }
}

 abstract class b2Contact<A extends b2Shape, B extends b2Shape> {
  public m_islandFlag: boolean = false; /// Used when crawling contact graph when forming islands.
  public m_touchingFlag: boolean = false; /// Set when the shapes are touching.
  public m_enabledFlag: boolean = false; /// This contact can be disabled (by user)
  public m_filterFlag: boolean = false; /// This contact needs filtering because a fixture filter was changed.
  public m_bulletHitFlag: boolean = false; /// This bullet contact had a TOI event
  public m_toiFlag: boolean = false; /// This contact has a valid TOI in m_toi

  public m_prev: b2Contact  = null;
  public m_next: b2Contact  = null;

  public  m_nodeA: b2ContactEdge = new b2ContactEdge(this);
  public  m_nodeB: b2ContactEdge = new b2ContactEdge(this);

  public m_fixtureA: b2Fixture;
  public m_fixtureB: b2Fixture;

  public m_indexA: number = 0;
  public m_indexB: number = 0;

  public m_manifold: b2Manifold = new b2Manifold(); // TODO: 

  public m_toiCount: number = 0;
  public m_toi: number = 0;

  public m_friction: number = 0;
  public m_restitution: number = 0;
  public m_restitutionThreshold: number = 0;

  public m_tangentSpeed: number = 0;

  public m_oldManifold: b2Manifold = new b2Manifold(); // TODO: 

  public GetManifold() {
    return this.m_manifold;
  }

  public GetWorldManifold(worldManifold: b2WorldManifold): void {
    const bodyA: b2Body = this.m_fixtureA.GetBody();
    const bodyB: b2Body = this.m_fixtureB.GetBody();
    const shapeA: A = this.GetShapeA();
    const shapeB: B = this.GetShapeB();
    worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius);
  }

  public IsTouching(): boolean {
    return this.m_touchingFlag;
  }

  public SetEnabled(flag: boolean): void {
    this.m_enabledFlag = flag;
  }

  public IsEnabled(): boolean {
    return this.m_enabledFlag;
  }

  public GetNext(): b2Contact  {
    return this.m_next;
  }

  public GetFixtureA(): b2Fixture {
    return this.m_fixtureA;
  }

  public GetChildIndexA(): number {
    return this.m_indexA;
  }

  public GetShapeA(): A {
    return this.m_fixtureA.GetShape() as A;
  }

  public GetFixtureB(): b2Fixture {
    return this.m_fixtureB;
  }

  public GetChildIndexB(): number {
    return this.m_indexB;
  }

  public GetShapeB(): B {
    return this.m_fixtureB.GetShape() as B;
  }

  public abstract Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void;

  public FlagForFiltering(): void {
    this.m_filterFlag = true;
  }

  public SetFriction(friction: number): void {
    this.m_friction = friction;
  }

  public GetFriction(): number {
    return this.m_friction;
  }

  public ResetFriction(): void {
    this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
  }

  public SetRestitution(restitution: number): void {
    this.m_restitution = restitution;
  }

  public GetRestitution(): number {
    return this.m_restitution;
  }

  public ResetRestitution(): void {
    this.m_restitution = b2MixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
  }

  /// Override the default restitution velocity threshold mixture. You can call this in b2ContactListener::PreSolve.
  /// The value persists until you set or reset.
  public SetRestitutionThreshold(threshold: number): void {
    this.m_restitutionThreshold = threshold;
  }

  /// Get the restitution threshold.
  public GetRestitutionThreshold(): number {
    return this.m_restitutionThreshold;
  }

  /// Reset the restitution threshold to the default value.
  public ResetRestitutionThreshold(): void {
    this.m_restitutionThreshold = b2MixRestitutionThreshold(this.m_fixtureA.m_restitutionThreshold, this.m_fixtureB.m_restitutionThreshold);
  }

  public SetTangentSpeed(speed: number): void {
    this.m_tangentSpeed = speed;
  }

  public GetTangentSpeed(): number {
    return this.m_tangentSpeed;
  }

  public Reset(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): void {
    this.m_islandFlag = false;
    this.m_touchingFlag = false;
    this.m_enabledFlag = true;
    this.m_filterFlag = false;
    this.m_bulletHitFlag = false;
    this.m_toiFlag = false;

    this.m_fixtureA = fixtureA;
    this.m_fixtureB = fixtureB;

    this.m_indexA = indexA;
    this.m_indexB = indexB;

    this.m_manifold.pointCount = 0;

    this.m_prev = null;
    this.m_next = null;

    this.m_nodeA.Reset();
    this.m_nodeB.Reset();

    this.m_toiCount = 0;

    this.m_friction = b2MixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
    this.m_restitution = b2MixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
    this.m_restitutionThreshold = b2MixRestitutionThreshold(this.m_fixtureA.m_restitutionThreshold, this.m_fixtureB.m_restitutionThreshold);
  }

  public Update(listener: b2ContactListener): void {
    const tManifold: b2Manifold = this.m_oldManifold;
    this.m_oldManifold = this.m_manifold;
    this.m_manifold = tManifold;

    // Re-enable this contact.
    this.m_enabledFlag = true;

    let touching: boolean = false;
    const wasTouching: boolean = this.m_touchingFlag;

    const sensorA: boolean = this.m_fixtureA.IsSensor();
    const sensorB: boolean = this.m_fixtureB.IsSensor();
    const sensor: boolean = sensorA || sensorB;

    const bodyA: b2Body = this.m_fixtureA.GetBody();
    const bodyB: b2Body = this.m_fixtureB.GetBody();
    const xfA: b2Transform = bodyA.GetTransform();
    const xfB: b2Transform = bodyB.GetTransform();

    // Is this contact a sensor?
    if (sensor) {
      const shapeA: A = this.GetShapeA();
      const shapeB: B = this.GetShapeB();
      touching = b2TestOverlapShape(shapeA, this.m_indexA, shapeB, this.m_indexB, xfA, xfB);

      // Sensors don't generate manifolds.
      this.m_manifold.pointCount = 0;
    } else {
      this.Evaluate(this.m_manifold, xfA, xfB);
      touching = this.m_manifold.pointCount > 0;

      // Match old contact ids to new contact ids and copy the
      // stored impulses to warm start the solver.
      for (let i: number = 0; i < this.m_manifold.pointCount; ++i) {
        const mp2: b2ManifoldPoint = this.m_manifold.points[i];
        mp2.normalImpulse = 0;
        mp2.tangentImpulse = 0;
        const id2: b2ContactID = mp2.id;

        for (let j: number = 0; j < this.m_oldManifold.pointCount; ++j) {
          const mp1: b2ManifoldPoint = this.m_oldManifold.points[j];

          if (mp1.id.key === id2.key) {
            mp2.normalImpulse = mp1.normalImpulse;
            mp2.tangentImpulse = mp1.tangentImpulse;
            break;
          }
        }
      }

      if (touching !== wasTouching) {
        bodyA.SetAwake(true);
        bodyB.SetAwake(true);
      }
    }

    this.m_touchingFlag = touching;

    if (!wasTouching && touching && listener) {
      listener.BeginContact(this);
    }

    if (wasTouching && !touching && listener) {
      listener.EndContact(this);
    }

    if (!sensor && touching && listener) {
      listener.PreSolve(this, this.m_oldManifold);
    }
  }

  private static ComputeTOI_s_input = new b2TOIInput();
  private static ComputeTOI_s_output = new b2TOIOutput();
  public ComputeTOI(sweepA: b2Sweep, sweepB: b2Sweep): number {
    const input: b2TOIInput = b2Contact.ComputeTOI_s_input;
    input.proxyA.SetShape(this.GetShapeA(), this.m_indexA);
    input.proxyB.SetShape(this.GetShapeB(), this.m_indexB);
    input.sweepA.Copy(sweepA);
    input.sweepB.Copy(sweepB);
    input.tMax = b2_linearSlop;

    const output: b2TOIOutput = b2Contact.ComputeTOI_s_output;

    b2TimeOfImpact(output, input);

    return output.t;
  }
}
// DEBUG: 











 class b2ContactRegister {
  public pool: b2Contact[] = [];
  public createFcn: (() => b2Contact)  = null;
  public destroyFcn: ((contact: b2Contact) => void)  = null;
  public primary: boolean = false;
}

 class b2ContactFactory {
  public  m_registers: b2ContactRegister[][] = [];

  constructor() {
    this.InitializeRegisters();
  }

  private AddType(createFcn: () => b2Contact, destroyFcn: (contact: b2Contact) => void, typeA: b2ShapeType, typeB: b2ShapeType): void {
    const pool: b2Contact[] = [];

    function poolCreateFcn(): b2Contact {
      return pool.pop() || createFcn();
    }

    function poolDestroyFcn(contact: b2Contact): void {
      pool.push(contact);
    }

    this.m_registers[typeA][typeB].pool = pool;
    this.m_registers[typeA][typeB].createFcn = poolCreateFcn; // createFcn;
    this.m_registers[typeA][typeB].destroyFcn = poolDestroyFcn; // destroyFcn;
    this.m_registers[typeA][typeB].primary = true;

    if (typeA !== typeB) {
      this.m_registers[typeB][typeA].pool = pool;
      this.m_registers[typeB][typeA].createFcn = poolCreateFcn; // createFcn;
      this.m_registers[typeB][typeA].destroyFcn = poolDestroyFcn; // destroyFcn;
      this.m_registers[typeB][typeA].primary = false;
    }
  }

  private InitializeRegisters(): void {
    for (let i: number = 0; i < b2ShapeType.e_shapeTypeCount; i++) {
      this.m_registers[i] = [];
      for (let j: number = 0; j < b2ShapeType.e_shapeTypeCount; j++) {
        this.m_registers[i][j] = new b2ContactRegister();
      }
    }

    this.AddType(          b2CircleContact.Create,           b2CircleContact.Destroy, b2ShapeType.e_circleShape,  b2ShapeType.e_circleShape);
    this.AddType(b2PolygonAndCircleContact.Create, b2PolygonAndCircleContact.Destroy, b2ShapeType.e_polygonShape, b2ShapeType.e_circleShape);
    this.AddType(         b2PolygonContact.Create,          b2PolygonContact.Destroy, b2ShapeType.e_polygonShape, b2ShapeType.e_polygonShape);
    this.AddType(   b2EdgeAndCircleContact.Create,    b2EdgeAndCircleContact.Destroy, b2ShapeType.e_edgeShape,    b2ShapeType.e_circleShape);
    this.AddType(  b2EdgeAndPolygonContact.Create,   b2EdgeAndPolygonContact.Destroy, b2ShapeType.e_edgeShape,    b2ShapeType.e_polygonShape);
    this.AddType(  b2ChainAndCircleContact.Create,   b2ChainAndCircleContact.Destroy, b2ShapeType.e_chainShape,   b2ShapeType.e_circleShape);
    this.AddType( b2ChainAndPolygonContact.Create,  b2ChainAndPolygonContact.Destroy, b2ShapeType.e_chainShape,   b2ShapeType.e_polygonShape);
  }

  public Create(fixtureA: b2Fixture, indexA: number, fixtureB: b2Fixture, indexB: number): b2Contact  {
    const typeA: b2ShapeType = fixtureA.GetType();
    const typeB: b2ShapeType = fixtureB.GetType();

    // DEBUG: b2Assert(0 <= typeA && typeA < b2ShapeType.e_shapeTypeCount);
    // DEBUG: b2Assert(0 <= typeB && typeB < b2ShapeType.e_shapeTypeCount);

    const reg: b2ContactRegister = this.m_registers[typeA][typeB];
    if (reg.createFcn) {
      const c: b2Contact = reg.createFcn();
      if (reg.primary) {
        c.Reset(fixtureA, indexA, fixtureB, indexB);
      } else {
        c.Reset(fixtureB, indexB, fixtureA, indexA);
      }
      return c;
    } else {
      return null;
    }
  }

  public Destroy(contact: b2Contact): void {
    const typeA: b2ShapeType = contact.m_fixtureA.GetType();
    const typeB: b2ShapeType = contact.m_fixtureB.GetType();

    // DEBUG: b2Assert(0 <= typeA && typeB < b2ShapeType.e_shapeTypeCount);
    // DEBUG: b2Assert(0 <= typeA && typeB < b2ShapeType.e_shapeTypeCount);

    const reg: b2ContactRegister = this.m_registers[typeA][typeB];
    if (reg.destroyFcn) {
      reg.destroyFcn(contact);
    }
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 









// Delegate of b2World.
 class b2ContactManager {
  public  m_broadPhase: b2BroadPhase<b2FixtureProxy> = new b2BroadPhase<b2FixtureProxy>();
  public m_contactList: b2Contact  = null;
  public m_contactCount: number = 0;
  public m_contactFilter: b2ContactFilter = b2ContactFilter.b2_defaultFilter;
  public m_contactListener: b2ContactListener = b2ContactListener.b2_defaultListener;

  public  m_contactFactory: b2ContactFactory = new b2ContactFactory();

  // Broad-phase callback.
  public AddPair(proxyA: b2FixtureProxy, proxyB: b2FixtureProxy): void {
    // DEBUG: b2Assert(proxyA instanceof b2FixtureProxy);
    // DEBUG: b2Assert(proxyB instanceof b2FixtureProxy);

    let fixtureA: b2Fixture = proxyA.fixture;
    let fixtureB: b2Fixture = proxyB.fixture;

    let indexA: number = proxyA.childIndex;
    let indexB: number = proxyB.childIndex;

    let bodyA: b2Body = fixtureA.GetBody();
    let bodyB: b2Body = fixtureB.GetBody();

    // Are the fixtures on the same body?
    if (bodyA === bodyB) {
      return;
    }

    // TODO_ERIN use a hash table to remove a potential bottleneck when both
    // bodies have a lot of contacts.
    // Does a contact already exist?
    let edge: b2ContactEdge  = bodyB.GetContactList();
    while (edge) {
      if (edge.other === bodyA) {
        const fA: b2Fixture = edge.contact.GetFixtureA();
        const fB: b2Fixture = edge.contact.GetFixtureB();
        const iA: number = edge.contact.GetChildIndexA();
        const iB: number = edge.contact.GetChildIndexB();

        if (fA === fixtureA && fB === fixtureB && iA === indexA && iB === indexB) {
          // A contact already exists.
          return;
        }

        if (fA === fixtureB && fB === fixtureA && iA === indexB && iB === indexA) {
          // A contact already exists.
          return;
        }
      }

      edge = edge.next;
    }

    // Check user filtering.
    if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
      return;
    }

    // Call the factory.
    const c: b2Contact  = this.m_contactFactory.Create(fixtureA, indexA, fixtureB, indexB);
    if (c === null) {
      return;
    }

    // Contact creation may swap fixtures.
    fixtureA = c.GetFixtureA();
    fixtureB = c.GetFixtureB();
    indexA = c.GetChildIndexA();
    indexB = c.GetChildIndexB();
    bodyA = fixtureA.m_body;
    bodyB = fixtureB.m_body;

    // Insert into the world.
    c.m_prev = null;
    c.m_next = this.m_contactList;
    if (this.m_contactList !== null) {
      this.m_contactList.m_prev = c;
    }
    this.m_contactList = c;

    // Connect to island graph.

    // Connect to body A
    c.m_nodeA.other = bodyB;

    c.m_nodeA.prev = null;
    c.m_nodeA.next = bodyA.m_contactList;
    if (bodyA.m_contactList !== null) {
      bodyA.m_contactList.prev = c.m_nodeA;
    }
    bodyA.m_contactList = c.m_nodeA;

    // Connect to body B
    c.m_nodeB.other = bodyA;

    c.m_nodeB.prev = null;
    c.m_nodeB.next = bodyB.m_contactList;
    if (bodyB.m_contactList !== null) {
      bodyB.m_contactList.prev = c.m_nodeB;
    }
    bodyB.m_contactList = c.m_nodeB;

    ++this.m_contactCount;
  }

  public FindNewContacts(): void {
    this.m_broadPhase.UpdatePairs((proxyA: b2FixtureProxy, proxyB: b2FixtureProxy): void => {
      this.AddPair(proxyA, proxyB);
    });
  }

  public Destroy(c: b2Contact): void {
    const fixtureA: b2Fixture = c.GetFixtureA();
    const fixtureB: b2Fixture = c.GetFixtureB();
    const bodyA: b2Body = fixtureA.GetBody();
    const bodyB: b2Body = fixtureB.GetBody();

    if (this.m_contactListener && c.IsTouching()) {
      this.m_contactListener.EndContact(c);
    }

    // Remove from the world.
    if (c.m_prev) {
      c.m_prev.m_next = c.m_next;
    }

    if (c.m_next) {
      c.m_next.m_prev = c.m_prev;
    }

    if (c === this.m_contactList) {
      this.m_contactList = c.m_next;
    }

    // Remove from body 1
    if (c.m_nodeA.prev) {
      c.m_nodeA.prev.next = c.m_nodeA.next;
    }

    if (c.m_nodeA.next) {
      c.m_nodeA.next.prev = c.m_nodeA.prev;
    }

    if (c.m_nodeA === bodyA.m_contactList) {
      bodyA.m_contactList = c.m_nodeA.next;
    }

    // Remove from body 2
    if (c.m_nodeB.prev) {
      c.m_nodeB.prev.next = c.m_nodeB.next;
    }

    if (c.m_nodeB.next) {
      c.m_nodeB.next.prev = c.m_nodeB.prev;
    }

    if (c.m_nodeB === bodyB.m_contactList) {
      bodyB.m_contactList = c.m_nodeB.next;
    }

    // moved this from b2ContactFactory:Destroy
    if (c.m_manifold.pointCount > 0 &&
      !fixtureA.IsSensor() &&
      !fixtureB.IsSensor()) {
      fixtureA.GetBody().SetAwake(true);
      fixtureB.GetBody().SetAwake(true);
    }

    // Call the factory.
    this.m_contactFactory.Destroy(c);
    --this.m_contactCount;
  }

  // This is the top level collision call for the time step. Here
  // all the narrow phase collision is processed for the world
  // contact list.
  public Collide(): void {
    // Update awake contacts.
    let c: b2Contact  = this.m_contactList;
    while (c) {
      const fixtureA: b2Fixture = c.GetFixtureA();
      const fixtureB: b2Fixture = c.GetFixtureB();
      const indexA: number = c.GetChildIndexA();
      const indexB: number = c.GetChildIndexB();
      const bodyA: b2Body = fixtureA.GetBody();
      const bodyB: b2Body = fixtureB.GetBody();

      // Is this contact flagged for filtering?
      if (c.m_filterFlag) {
        // Check user filtering.
        if (this.m_contactFilter && !this.m_contactFilter.ShouldCollide(fixtureA, fixtureB)) {
          const cNuke: b2Contact = c;
          c = cNuke.m_next;
          this.Destroy(cNuke);
          continue;
        }

        // Clear the filtering flag.
        c.m_filterFlag = false;
      }

      const activeA: boolean = bodyA.IsAwake() && bodyA.m_type !== b2BodyType.b2_staticBody;
      const activeB: boolean = bodyB.IsAwake() && bodyB.m_type !== b2BodyType.b2_staticBody;

      // At least one body must be awake and it must be dynamic or kinematic.
      if (!activeA && !activeB) {
        c = c.m_next;
        continue;
      }

      const treeNodeA: b2TreeNode<b2FixtureProxy> = fixtureA.m_proxies[indexA].treeNode;
      const treeNodeB: b2TreeNode<b2FixtureProxy> = fixtureB.m_proxies[indexB].treeNode;
      const overlap: boolean = b2TestOverlapAABB(treeNodeA.aabb, treeNodeB.aabb);

      // Here we destroy contacts that cease to overlap in the broad-phase.
      if (!overlap) {
        const cNuke: b2Contact = c;
        c = cNuke.m_next;
        this.Destroy(cNuke);
        continue;
      }

      // The contact persists.
      c.Update(this.m_contactListener);
      c = c.m_next;
    }
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 












// Solver debugging is normally disabled because the block solver sometimes has to deal with a poorly conditioned effective mass matrix.
// #define B2_DEBUG_SOLVER 0

 let g_blockSolve: boolean = false;
 function get_g_blockSolve(): boolean { return g_blockSolve; }
 function set_g_blockSolve(value: boolean): void { g_blockSolve = value; }

 class b2VelocityConstraintPoint {
  public  rA: b2Vec2 = new b2Vec2();
  public  rB: b2Vec2 = new b2Vec2();
  public normalImpulse: number = 0;
  public tangentImpulse: number = 0;
  public normalMass: number = 0;
  public tangentMass: number = 0;
  public velocityBias: number = 0;

  public static MakeArray(length: number): b2VelocityConstraintPoint[] {
    return b2MakeArray(length, (i: number) => new b2VelocityConstraintPoint());
  }
}

 class b2ContactVelocityConstraint {
  public  points: b2VelocityConstraintPoint[] = b2VelocityConstraintPoint.MakeArray(b2_maxManifoldPoints);
  public  normal: b2Vec2 = new b2Vec2();
  public  tangent: b2Vec2 = new b2Vec2();
  public  normalMass: b2Mat22 = new b2Mat22();
  public  K: b2Mat22 = new b2Mat22();
  public indexA: number = 0;
  public indexB: number = 0;
  public invMassA: number = 0;
  public invMassB: number = 0;
  public invIA: number = 0;
  public invIB: number = 0;
  public friction: number = 0;
  public restitution: number = 0;
  public threshold: number = 0;
  public tangentSpeed: number = 0;
  public pointCount: number = 0;
  public contactIndex: number = 0;

  public static MakeArray(length: number): b2ContactVelocityConstraint[] {
    return b2MakeArray(length, (i: number) => new b2ContactVelocityConstraint());
  }
}

 class b2ContactPositionConstraint {
  public  localPoints: b2Vec2[] = b2Vec2.MakeArray(b2_maxManifoldPoints);
  public  localNormal: b2Vec2 = new b2Vec2();
  public  localPoint: b2Vec2 = new b2Vec2();
  public indexA: number = 0;
  public indexB: number = 0;
  public invMassA: number = 0;
  public invMassB: number = 0;
  public  localCenterA: b2Vec2 = new b2Vec2();
  public  localCenterB: b2Vec2 = new b2Vec2();
  public invIA: number = 0;
  public invIB: number = 0;
  public type: b2ManifoldType = b2ManifoldType.e_unknown;
  public radiusA: number = 0;
  public radiusB: number = 0;
  public pointCount: number = 0;

  public static MakeArray(length: number): b2ContactPositionConstraint[] {
    return b2MakeArray(length, (i: number) => new b2ContactPositionConstraint());
  }
}

 class b2ContactSolverDef {
  public  step: b2TimeStep = new b2TimeStep();
  public contacts: b2Contact[];
  public count: number = 0;
  public positions: b2Position[];
  public velocities: b2Velocity[];
}

 class b2PositionSolverManifold {
  public  normal: b2Vec2 = new b2Vec2();
  public  point: b2Vec2 = new b2Vec2();
  public separation: number = 0;

  private static Initialize_s_pointA = new b2Vec2();
  private static Initialize_s_pointB = new b2Vec2();
  private static Initialize_s_planePoint = new b2Vec2();
  private static Initialize_s_clipPoint = new b2Vec2();
  public Initialize(pc: b2ContactPositionConstraint, xfA: b2Transform, xfB: b2Transform, index: number): void {
    const pointA: b2Vec2 = b2PositionSolverManifold.Initialize_s_pointA;
    const pointB: b2Vec2 = b2PositionSolverManifold.Initialize_s_pointB;
    const planePoint: b2Vec2 = b2PositionSolverManifold.Initialize_s_planePoint;
    const clipPoint: b2Vec2 = b2PositionSolverManifold.Initialize_s_clipPoint;

    // DEBUG: b2Assert(pc.pointCount > 0);

    switch (pc.type) {
    case b2ManifoldType.e_circles: {
        // b2Vec2 pointA = b2Mul(xfA, pc->localPoint);
        b2Transform.MulXV(xfA, pc.localPoint, pointA);
        // b2Vec2 pointB = b2Mul(xfB, pc->localPoints[0]);
        b2Transform.MulXV(xfB, pc.localPoints[0], pointB);
        // normal = pointB - pointA;
        // normal.Normalize();
        b2Vec2.SubVV(pointB, pointA, this.normal).SelfNormalize();
        // point = 0.5f * (pointA + pointB);
        b2Vec2.MidVV(pointA, pointB, this.point);
        // separation = b2Dot(pointB - pointA, normal) - pc->radius;
        this.separation = b2Vec2.DotVV(b2Vec2.SubVV(pointB, pointA, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
        break;
      }

    case b2ManifoldType.e_faceA: {
        // normal = b2Mul(xfA.q, pc->localNormal);
        b2Rot.MulRV(xfA.q, pc.localNormal, this.normal);
        // b2Vec2 planePoint = b2Mul(xfA, pc->localPoint);
        b2Transform.MulXV(xfA, pc.localPoint, planePoint);

        // b2Vec2 clipPoint = b2Mul(xfB, pc->localPoints[index]);
        b2Transform.MulXV(xfB, pc.localPoints[index], clipPoint);
        // separation = b2Dot(clipPoint - planePoint, normal) - pc->radius;
        this.separation = b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
        // point = clipPoint;
        this.point.Copy(clipPoint);
        break;
      }

    case b2ManifoldType.e_faceB: {
        // normal = b2Mul(xfB.q, pc->localNormal);
        b2Rot.MulRV(xfB.q, pc.localNormal, this.normal);
        // b2Vec2 planePoint = b2Mul(xfB, pc->localPoint);
        b2Transform.MulXV(xfB, pc.localPoint, planePoint);

        // b2Vec2 clipPoint = b2Mul(xfA, pc->localPoints[index]);
        b2Transform.MulXV(xfA, pc.localPoints[index], clipPoint);
        // separation = b2Dot(clipPoint - planePoint, normal) - pc->radius;
        this.separation = b2Vec2.DotVV(b2Vec2.SubVV(clipPoint, planePoint, b2Vec2.s_t0), this.normal) - pc.radiusA - pc.radiusB;
        // point = clipPoint;
        this.point.Copy(clipPoint);

        // Ensure normal points from A to B
        // normal = -normal;
        this.normal.SelfNeg();
        break;
      }
    }
  }
}

 class b2ContactSolver {
  public  m_step: b2TimeStep = new b2TimeStep();
  public m_positions: b2Position[];
  public m_velocities: b2Velocity[];
  public  m_positionConstraints: b2ContactPositionConstraint[] = b2ContactPositionConstraint.MakeArray(1024); // TODO: b2Settings
  public  m_velocityConstraints: b2ContactVelocityConstraint[] = b2ContactVelocityConstraint.MakeArray(1024); // TODO: b2Settings
  public m_contacts: b2Contact[];
  public m_count: number = 0;

  public Initialize(def: b2ContactSolverDef): b2ContactSolver {
    this.m_step.Copy(def.step);
    this.m_count = def.count;
    // TODO:
    if (this.m_positionConstraints.length < this.m_count) {
      const new_length: number = b2Max(this.m_positionConstraints.length * 2, this.m_count);
      while (this.m_positionConstraints.length < new_length) {
        this.m_positionConstraints[this.m_positionConstraints.length] = new b2ContactPositionConstraint();
      }
    }
    // TODO:
    if (this.m_velocityConstraints.length < this.m_count) {
      const new_length: number = b2Max(this.m_velocityConstraints.length * 2, this.m_count);
      while (this.m_velocityConstraints.length < new_length) {
        this.m_velocityConstraints[this.m_velocityConstraints.length] = new b2ContactVelocityConstraint();
      }
    }
    this.m_positions = def.positions;
    this.m_velocities = def.velocities;
    this.m_contacts = def.contacts;

    // Initialize position independent portions of the constraints.
    for (let i: number = 0; i < this.m_count; ++i) {
      const contact: b2Contact = this.m_contacts[i];

      const fixtureA: b2Fixture = contact.m_fixtureA;
      const fixtureB: b2Fixture = contact.m_fixtureB;
      const shapeA: b2Shape = fixtureA.GetShape();
      const shapeB: b2Shape = fixtureB.GetShape();
      const radiusA: number = shapeA.m_radius;
      const radiusB: number = shapeB.m_radius;
      const bodyA: b2Body = fixtureA.GetBody();
      const bodyB: b2Body = fixtureB.GetBody();
      const manifold: b2Manifold = contact.GetManifold();

      const pointCount: number = manifold.pointCount;
      // DEBUG: b2Assert(pointCount > 0);

      const vc: b2ContactVelocityConstraint = this.m_velocityConstraints[i];
      vc.friction = contact.m_friction;
      vc.restitution = contact.m_restitution;
      vc.threshold = contact.m_restitutionThreshold;
      vc.tangentSpeed = contact.m_tangentSpeed;
      vc.indexA = bodyA.m_islandIndex;
      vc.indexB = bodyB.m_islandIndex;
      vc.invMassA = bodyA.m_invMass;
      vc.invMassB = bodyB.m_invMass;
      vc.invIA = bodyA.m_invI;
      vc.invIB = bodyB.m_invI;
      vc.contactIndex = i;
      vc.pointCount = pointCount;
      vc.K.SetZero();
      vc.normalMass.SetZero();

      const pc: b2ContactPositionConstraint = this.m_positionConstraints[i];
      pc.indexA = bodyA.m_islandIndex;
      pc.indexB = bodyB.m_islandIndex;
      pc.invMassA = bodyA.m_invMass;
      pc.invMassB = bodyB.m_invMass;
      pc.localCenterA.Copy(bodyA.m_sweep.localCenter);
      pc.localCenterB.Copy(bodyB.m_sweep.localCenter);
      pc.invIA = bodyA.m_invI;
      pc.invIB = bodyB.m_invI;
      pc.localNormal.Copy(manifold.localNormal);
      pc.localPoint.Copy(manifold.localPoint);
      pc.pointCount = pointCount;
      pc.radiusA = radiusA;
      pc.radiusB = radiusB;
      pc.type = manifold.type;

      for (let j: number = 0; j < pointCount; ++j) {
        const cp: b2ManifoldPoint = manifold.points[j];
        const vcp: b2VelocityConstraintPoint = vc.points[j];

        if (this.m_step.warmStarting) {
          vcp.normalImpulse = this.m_step.dtRatio * cp.normalImpulse;
          vcp.tangentImpulse = this.m_step.dtRatio * cp.tangentImpulse;
        } else {
          vcp.normalImpulse = 0;
          vcp.tangentImpulse = 0;
        }

        vcp.rA.SetZero();
        vcp.rB.SetZero();
        vcp.normalMass = 0;
        vcp.tangentMass = 0;
        vcp.velocityBias = 0;

        pc.localPoints[j].Copy(cp.localPoint);
      }
    }

    return this;
  }

  private static InitializeVelocityConstraints_s_xfA = new b2Transform();
  private static InitializeVelocityConstraints_s_xfB = new b2Transform();
  private static InitializeVelocityConstraints_s_worldManifold = new b2WorldManifold();
  public InitializeVelocityConstraints(): void {
    const xfA: b2Transform = b2ContactSolver.InitializeVelocityConstraints_s_xfA;
    const xfB: b2Transform = b2ContactSolver.InitializeVelocityConstraints_s_xfB;
    const worldManifold: b2WorldManifold = b2ContactSolver.InitializeVelocityConstraints_s_worldManifold;

    const k_maxConditionNumber: number = 1000;

    for (let i: number = 0; i < this.m_count; ++i) {
      const vc: b2ContactVelocityConstraint = this.m_velocityConstraints[i];
      const pc: b2ContactPositionConstraint = this.m_positionConstraints[i];

      const radiusA: number = pc.radiusA;
      const radiusB: number = pc.radiusB;
      const manifold: b2Manifold = this.m_contacts[vc.contactIndex].GetManifold();

      const indexA: number = vc.indexA;
      const indexB: number = vc.indexB;

      const mA: number = vc.invMassA;
      const mB: number = vc.invMassB;
      const iA: number = vc.invIA;
      const iB: number = vc.invIB;
      const localCenterA: b2Vec2 = pc.localCenterA;
      const localCenterB: b2Vec2 = pc.localCenterB;

      const cA: b2Vec2 = this.m_positions[indexA].c;
      const aA: number = this.m_positions[indexA].a;
      const vA: b2Vec2 = this.m_velocities[indexA].v;
      const wA: number = this.m_velocities[indexA].w;

      const cB: b2Vec2 = this.m_positions[indexB].c;
      const aB: number = this.m_positions[indexB].a;
      const vB: b2Vec2 = this.m_velocities[indexB].v;
      const wB: number = this.m_velocities[indexB].w;

      // DEBUG: b2Assert(manifold.pointCount > 0);

      xfA.q.SetAngle(aA);
      xfB.q.SetAngle(aB);
      b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
      b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);

      worldManifold.Initialize(manifold, xfA, radiusA, xfB, radiusB);

      vc.normal.Copy(worldManifold.normal);
      b2Vec2.CrossVOne(vc.normal, vc.tangent); // compute from normal

      const pointCount: number = vc.pointCount;
      for (let j: number = 0; j < pointCount; ++j) {
        const vcp: b2VelocityConstraintPoint = vc.points[j];

        // vcp->rA = worldManifold.points[j] - cA;
        b2Vec2.SubVV(worldManifold.points[j], cA, vcp.rA);
        // vcp->rB = worldManifold.points[j] - cB;
        b2Vec2.SubVV(worldManifold.points[j], cB, vcp.rB);

        const rnA: number = b2Vec2.CrossVV(vcp.rA, vc.normal);
        const rnB: number = b2Vec2.CrossVV(vcp.rB, vc.normal);

        const kNormal: number = mA + mB + iA * rnA * rnA + iB * rnB * rnB;

        vcp.normalMass = kNormal > 0 ? 1 / kNormal : 0;

        // b2Vec2 tangent = b2Cross(vc->normal, 1.0f);
        const tangent: b2Vec2 = vc.tangent; // precomputed from normal

        const rtA: number = b2Vec2.CrossVV(vcp.rA, tangent);
        const rtB: number = b2Vec2.CrossVV(vcp.rB, tangent);

        const kTangent: number = mA + mB + iA * rtA * rtA + iB * rtB * rtB;

        vcp.tangentMass = kTangent > 0 ? 1 / kTangent : 0;

        // Setup a velocity bias for restitution.
        vcp.velocityBias = 0;
        // float32 vRel = b2Dot(vc->normal, vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA));
        const vRel: number = b2Vec2.DotVV(
          vc.normal,
          b2Vec2.SubVV(
            b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0),
            b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1),
            b2Vec2.s_t0));
        if (vRel < -vc.threshold) {
          vcp.velocityBias += (-vc.restitution * vRel);
        }
      }

      // If we have two points, then prepare the block solver.
      if (vc.pointCount === 2 && g_blockSolve) {
        const vcp1: b2VelocityConstraintPoint = vc.points[0];
        const vcp2: b2VelocityConstraintPoint = vc.points[1];

        const rn1A: number = b2Vec2.CrossVV(vcp1.rA, vc.normal);
        const rn1B: number = b2Vec2.CrossVV(vcp1.rB, vc.normal);
        const rn2A: number = b2Vec2.CrossVV(vcp2.rA, vc.normal);
        const rn2B: number = b2Vec2.CrossVV(vcp2.rB, vc.normal);

        const k11: number = mA + mB + iA * rn1A * rn1A + iB * rn1B * rn1B;
        const k22: number = mA + mB + iA * rn2A * rn2A + iB * rn2B * rn2B;
        const k12: number = mA + mB + iA * rn1A * rn2A + iB * rn1B * rn2B;

        // Ensure a reasonable condition number.
        // float32 k_maxConditionNumber = 1000.0f;
        if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
          // K is safe to invert.
          vc.K.ex.Set(k11, k12);
          vc.K.ey.Set(k12, k22);
          vc.K.GetInverse(vc.normalMass);
        } else {
          // The constraints are redundant, just use one.
          // TODO_ERIN use deepest?
          vc.pointCount = 1;
        }
      }
    }
  }

  private static WarmStart_s_P = new b2Vec2();
  public WarmStart(): void {
    const P: b2Vec2 = b2ContactSolver.WarmStart_s_P;

    // Warm start.
    for (let i: number = 0; i < this.m_count; ++i) {
      const vc: b2ContactVelocityConstraint = this.m_velocityConstraints[i];

      const indexA: number = vc.indexA;
      const indexB: number = vc.indexB;
      const mA: number = vc.invMassA;
      const iA: number = vc.invIA;
      const mB: number = vc.invMassB;
      const iB: number = vc.invIB;
      const pointCount: number = vc.pointCount;

      const vA: b2Vec2 = this.m_velocities[indexA].v;
      let wA: number = this.m_velocities[indexA].w;
      const vB: b2Vec2 = this.m_velocities[indexB].v;
      let wB: number = this.m_velocities[indexB].w;

      const normal: b2Vec2 = vc.normal;
      // b2Vec2 tangent = b2Cross(normal, 1.0f);
      const tangent: b2Vec2 = vc.tangent; // precomputed from normal

      for (let j: number = 0; j < pointCount; ++j) {
        const vcp: b2VelocityConstraintPoint = vc.points[j];
        // b2Vec2 P = vcp->normalImpulse * normal + vcp->tangentImpulse * tangent;
        b2Vec2.AddVV(
          b2Vec2.MulSV(vcp.normalImpulse, normal, b2Vec2.s_t0),
          b2Vec2.MulSV(vcp.tangentImpulse, tangent, b2Vec2.s_t1),
          P);
        // wA -= iA * b2Cross(vcp->rA, P);
        wA -= iA * b2Vec2.CrossVV(vcp.rA, P);
        // vA -= mA * P;
        vA.SelfMulSub(mA, P);
        // wB += iB * b2Cross(vcp->rB, P);
        wB += iB * b2Vec2.CrossVV(vcp.rB, P);
        // vB += mB * P;
        vB.SelfMulAdd(mB, P);
      }

      // this.m_velocities[indexA].v = vA;
      this.m_velocities[indexA].w = wA;
      // this.m_velocities[indexB].v = vB;
      this.m_velocities[indexB].w = wB;
    }
  }

  private static SolveVelocityConstraints_s_dv = new b2Vec2();
  private static SolveVelocityConstraints_s_dv1 = new b2Vec2();
  private static SolveVelocityConstraints_s_dv2 = new b2Vec2();
  private static SolveVelocityConstraints_s_P = new b2Vec2();
  private static SolveVelocityConstraints_s_a = new b2Vec2();
  private static SolveVelocityConstraints_s_b = new b2Vec2();
  private static SolveVelocityConstraints_s_x = new b2Vec2();
  private static SolveVelocityConstraints_s_d = new b2Vec2();
  private static SolveVelocityConstraints_s_P1 = new b2Vec2();
  private static SolveVelocityConstraints_s_P2 = new b2Vec2();
  private static SolveVelocityConstraints_s_P1P2 = new b2Vec2();
  public SolveVelocityConstraints(): void {
    const dv: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_dv;
    const dv1: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_dv1;
    const dv2: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_dv2;
    const P: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_P;
    const a: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_a;
    const b: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_b;
    const x: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_x;
    const d: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_d;
    const P1: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_P1;
    const P2: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_P2;
    const P1P2: b2Vec2 = b2ContactSolver.SolveVelocityConstraints_s_P1P2;

    for (let i: number = 0; i < this.m_count; ++i) {
      const vc: b2ContactVelocityConstraint = this.m_velocityConstraints[i];

      const indexA: number = vc.indexA;
      const indexB: number = vc.indexB;
      const mA: number = vc.invMassA;
      const iA: number = vc.invIA;
      const mB: number = vc.invMassB;
      const iB: number = vc.invIB;
      const pointCount: number = vc.pointCount;

      const vA: b2Vec2 = this.m_velocities[indexA].v;
      let wA: number = this.m_velocities[indexA].w;
      const vB: b2Vec2 = this.m_velocities[indexB].v;
      let wB: number = this.m_velocities[indexB].w;

      // b2Vec2 normal = vc->normal;
      const normal: b2Vec2 = vc.normal;
      // b2Vec2 tangent = b2Cross(normal, 1.0f);
      const tangent: b2Vec2 = vc.tangent; // precomputed from normal
      const friction: number = vc.friction;

      // DEBUG: b2Assert(pointCount === 1 || pointCount === 2);

      // Solve tangent constraints first because non-penetration is more important
      // than friction.
      for (let j: number = 0; j < pointCount; ++j) {
        const vcp: b2VelocityConstraintPoint = vc.points[j];

        // Relative velocity at contact
        // b2Vec2 dv = vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA);
        b2Vec2.SubVV(
          b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0),
          b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1),
          dv);

        // Compute tangent force
        // float32 vt = b2Dot(dv, tangent) - vc->tangentSpeed;
        const vt: number = b2Vec2.DotVV(dv, tangent) - vc.tangentSpeed;
        let lambda: number = vcp.tangentMass * (-vt);

        // b2Clamp the accumulated force
        const maxFriction: number = friction * vcp.normalImpulse;
        const newImpulse: number = b2Clamp(vcp.tangentImpulse + lambda, (-maxFriction), maxFriction);
        lambda = newImpulse - vcp.tangentImpulse;
        vcp.tangentImpulse = newImpulse;

        // Apply contact impulse
        // b2Vec2 P = lambda * tangent;
        b2Vec2.MulSV(lambda, tangent, P);

        // vA -= mA * P;
        vA.SelfMulSub(mA, P);
        // wA -= iA * b2Cross(vcp->rA, P);
        wA -= iA * b2Vec2.CrossVV(vcp.rA, P);

        // vB += mB * P;
        vB.SelfMulAdd(mB, P);
        // wB += iB * b2Cross(vcp->rB, P);
        wB += iB * b2Vec2.CrossVV(vcp.rB, P);
      }

      // Solve normal constraints
      if (vc.pointCount === 1 || g_blockSolve === false) {
        for (let j = 0; j < pointCount; ++j) {
          const vcp: b2VelocityConstraintPoint = vc.points[j];

          // Relative velocity at contact
          // b2Vec2 dv = vB + b2Cross(wB, vcp->rB) - vA - b2Cross(wA, vcp->rA);
          b2Vec2.SubVV(
            b2Vec2.AddVCrossSV(vB, wB, vcp.rB, b2Vec2.s_t0),
            b2Vec2.AddVCrossSV(vA, wA, vcp.rA, b2Vec2.s_t1),
            dv);

          // Compute normal impulse
          // float32 vn = b2Dot(dv, normal);
          const vn: number = b2Vec2.DotVV(dv, normal);
          let lambda: number = (-vcp.normalMass * (vn - vcp.velocityBias));

          // b2Clamp the accumulated impulse
          // float32 newImpulse = b2Max(vcp->normalImpulse + lambda, 0.0f);
          const newImpulse: number = b2Max(vcp.normalImpulse + lambda, 0);
          lambda = newImpulse - vcp.normalImpulse;
          vcp.normalImpulse = newImpulse;

          // Apply contact impulse
          // b2Vec2 P = lambda * normal;
          b2Vec2.MulSV(lambda, normal, P);
          // vA -= mA * P;
          vA.SelfMulSub(mA, P);
          // wA -= iA * b2Cross(vcp->rA, P);
          wA -= iA * b2Vec2.CrossVV(vcp.rA, P);

          // vB += mB * P;
          vB.SelfMulAdd(mB, P);
          // wB += iB * b2Cross(vcp->rB, P);
          wB += iB * b2Vec2.CrossVV(vcp.rB, P);
        }
      } else {
        // Block solver developed in collaboration with Dirk Gregorius (back in 01/07 on Box2D_Lite).
        // Build the mini LCP for this contact patch
        //
        // vn = A * x + b, vn >= 0, x >= 0 and vn_i * x_i = 0 with i = 1..2
        //
        // A = J * W * JT and J = ( -n, -r1 x n, n, r2 x n )
        // b = vn0 - velocityBias
        //
        // The system is solved using the "Total enumeration method" (s. Murty). The complementary constraint vn_i * x_i
        // implies that we must have in any solution either vn_i = 0 or x_i = 0. So for the 2D contact problem the cases
        // vn1 = 0 and vn2 = 0, x1 = 0 and x2 = 0, x1 = 0 and vn2 = 0, x2 = 0 and vn1 = 0 need to be tested. The first valid
        // solution that satisfies the problem is chosen.
        //
        // In order to account of the accumulated impulse 'a' (because of the iterative nature of the solver which only requires
        // that the accumulated impulse is clamped and not the incremental impulse) we change the impulse variable (x_i).
        //
        // Substitute:
        //
        // x = a + d
        //
        // a := old total impulse
        // x := new total impulse
        // d := incremental impulse
        //
        // For the current iteration we extend the formula for the incremental impulse
        // to compute the new total impulse:
        //
        // vn = A * d + b
        //    = A * (x - a) + b
        //    = A * x + b - A * a
        //    = A * x + b'
        // b' = b - A * a;

        const cp1: b2VelocityConstraintPoint = vc.points[0];
        const cp2: b2VelocityConstraintPoint = vc.points[1];

        // b2Vec2 a(cp1->normalImpulse, cp2->normalImpulse);
        a.Set(cp1.normalImpulse, cp2.normalImpulse);
        // DEBUG: b2Assert(a.x >= 0 && a.y >= 0);

        // Relative velocity at contact
        // b2Vec2 dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);
        b2Vec2.SubVV(
          b2Vec2.AddVCrossSV(vB, wB, cp1.rB, b2Vec2.s_t0),
          b2Vec2.AddVCrossSV(vA, wA, cp1.rA, b2Vec2.s_t1),
          dv1);
        // b2Vec2 dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);
        b2Vec2.SubVV(
          b2Vec2.AddVCrossSV(vB, wB, cp2.rB, b2Vec2.s_t0),
          b2Vec2.AddVCrossSV(vA, wA, cp2.rA, b2Vec2.s_t1),
          dv2);

        // Compute normal velocity
        // float32 vn1 = b2Dot(dv1, normal);
        let vn1: number = b2Vec2.DotVV(dv1, normal);
        // float32 vn2 = b2Dot(dv2, normal);
        let vn2: number = b2Vec2.DotVV(dv2, normal);

        // b2Vec2 b;
        b.x = vn1 - cp1.velocityBias;
        b.y = vn2 - cp2.velocityBias;

        // Compute b'
        // b -= b2Mul(vc->K, a);
        b.SelfSub(b2Mat22.MulMV(vc.K, a, b2Vec2.s_t0));

        /*
        #if B2_DEBUG_SOLVER === 1
        const k_errorTol: number = 0.001;
        #endif
        */

        for (; ; ) {
          //
          // Case 1: vn = 0
          //
          // 0 = A * x + b'
          //
          // Solve for x:
          //
          // x = - inv(A) * b'
          //
          // b2Vec2 x = - b2Mul(vc->normalMass, b);
          b2Mat22.MulMV(vc.normalMass, b, x).SelfNeg();

          if (x.x >= 0 && x.y >= 0) {
            // Get the incremental impulse
            // b2Vec2 d = x - a;
            b2Vec2.SubVV(x, a, d);

            // Apply incremental impulse
            // b2Vec2 P1 = d.x * normal;
            b2Vec2.MulSV(d.x, normal, P1);
            // b2Vec2 P2 = d.y * normal;
            b2Vec2.MulSV(d.y, normal, P2);
            b2Vec2.AddVV(P1, P2, P1P2);
            // vA -= mA * (P1 + P2);
            vA.SelfMulSub(mA, P1P2);
            // wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
            wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));

            // vB += mB * (P1 + P2);
            vB.SelfMulAdd(mB, P1P2);
            // wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
            wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));

            // Accumulate
            cp1.normalImpulse = x.x;
            cp2.normalImpulse = x.y;

            /*
            #if B2_DEBUG_SOLVER === 1
            // Postconditions
            dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);
            dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);

            // Compute normal velocity
            vn1 = b2Dot(dv1, normal);
            vn2 = b2Dot(dv2, normal);

            b2Assert(b2Abs(vn1 - cp1->velocityBias) < k_errorTol);
            b2Assert(b2Abs(vn2 - cp2->velocityBias) < k_errorTol);
            #endif
            */
            break;
          }

          //
          // Case 2: vn1 = 0 and x2 = 0
          //
          //   0 = a11 * x1 + a12 * 0 + b1'
          // vn2 = a21 * x1 + a22 * 0 + b2'
          //
          x.x = (-cp1.normalMass * b.x);
          x.y = 0;
          vn1 = 0;
          vn2 = vc.K.ex.y * x.x + b.y;

          if (x.x >= 0 && vn2 >= 0) {
            // Get the incremental impulse
            // b2Vec2 d = x - a;
            b2Vec2.SubVV(x, a, d);

            // Apply incremental impulse
            // b2Vec2 P1 = d.x * normal;
            b2Vec2.MulSV(d.x, normal, P1);
            // b2Vec2 P2 = d.y * normal;
            b2Vec2.MulSV(d.y, normal, P2);
            b2Vec2.AddVV(P1, P2, P1P2);
            // vA -= mA * (P1 + P2);
            vA.SelfMulSub(mA, P1P2);
            // wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
            wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));

            // vB += mB * (P1 + P2);
            vB.SelfMulAdd(mB, P1P2);
            // wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
            wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));

            // Accumulate
            cp1.normalImpulse = x.x;
            cp2.normalImpulse = x.y;

            /*
            #if B2_DEBUG_SOLVER === 1
            // Postconditions
            dv1 = vB + b2Cross(wB, cp1->rB) - vA - b2Cross(wA, cp1->rA);

            // Compute normal velocity
            vn1 = b2Dot(dv1, normal);

            b2Assert(b2Abs(vn1 - cp1->velocityBias) < k_errorTol);
            #endif
            */
            break;
          }

          //
          // Case 3: vn2 = 0 and x1 = 0
          //
          // vn1 = a11 * 0 + a12 * x2 + b1'
          //   0 = a21 * 0 + a22 * x2 + b2'
          //
          x.x = 0;
          x.y = (-cp2.normalMass * b.y);
          vn1 = vc.K.ey.x * x.y + b.x;
          vn2 = 0;

          if (x.y >= 0 && vn1 >= 0) {
            // Resubstitute for the incremental impulse
            // b2Vec2 d = x - a;
            b2Vec2.SubVV(x, a, d);

            // Apply incremental impulse
            // b2Vec2 P1 = d.x * normal;
            b2Vec2.MulSV(d.x, normal, P1);
            // b2Vec2 P2 = d.y * normal;
            b2Vec2.MulSV(d.y, normal, P2);
            b2Vec2.AddVV(P1, P2, P1P2);
            // vA -= mA * (P1 + P2);
            vA.SelfMulSub(mA, P1P2);
            // wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
            wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));

            // vB += mB * (P1 + P2);
            vB.SelfMulAdd(mB, P1P2);
            // wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
            wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));

            // Accumulate
            cp1.normalImpulse = x.x;
            cp2.normalImpulse = x.y;

            /*
            #if B2_DEBUG_SOLVER === 1
            // Postconditions
            dv2 = vB + b2Cross(wB, cp2->rB) - vA - b2Cross(wA, cp2->rA);

            // Compute normal velocity
            vn2 = b2Dot(dv2, normal);

            b2Assert(b2Abs(vn2 - cp2->velocityBias) < k_errorTol);
            #endif
            */
            break;
          }

          //
          // Case 4: x1 = 0 and x2 = 0
          //
          // vn1 = b1
          // vn2 = b2;
          x.x = 0;
          x.y = 0;
          vn1 = b.x;
          vn2 = b.y;

          if (vn1 >= 0 && vn2 >= 0) {
            // Resubstitute for the incremental impulse
            // b2Vec2 d = x - a;
            b2Vec2.SubVV(x, a, d);

            // Apply incremental impulse
            // b2Vec2 P1 = d.x * normal;
            b2Vec2.MulSV(d.x, normal, P1);
            // b2Vec2 P2 = d.y * normal;
            b2Vec2.MulSV(d.y, normal, P2);
            b2Vec2.AddVV(P1, P2, P1P2);
            // vA -= mA * (P1 + P2);
            vA.SelfMulSub(mA, P1P2);
            // wA -= iA * (b2Cross(cp1->rA, P1) + b2Cross(cp2->rA, P2));
            wA -= iA * (b2Vec2.CrossVV(cp1.rA, P1) + b2Vec2.CrossVV(cp2.rA, P2));

            // vB += mB * (P1 + P2);
            vB.SelfMulAdd(mB, P1P2);
            // wB += iB * (b2Cross(cp1->rB, P1) + b2Cross(cp2->rB, P2));
            wB += iB * (b2Vec2.CrossVV(cp1.rB, P1) + b2Vec2.CrossVV(cp2.rB, P2));

            // Accumulate
            cp1.normalImpulse = x.x;
            cp2.normalImpulse = x.y;

            break;
          }

          // No solution, give up. This is hit sometimes, but it doesn't seem to matter.
          break;
        }
      }

      // this.m_velocities[indexA].v = vA;
      this.m_velocities[indexA].w = wA;
      // this.m_velocities[indexB].v = vB;
      this.m_velocities[indexB].w = wB;
    }
  }

  public StoreImpulses(): void {
    for (let i: number = 0; i < this.m_count; ++i) {
      const vc: b2ContactVelocityConstraint = this.m_velocityConstraints[i];
      const manifold: b2Manifold = this.m_contacts[vc.contactIndex].GetManifold();

      for (let j: number = 0; j < vc.pointCount; ++j) {
        manifold.points[j].normalImpulse = vc.points[j].normalImpulse;
        manifold.points[j].tangentImpulse = vc.points[j].tangentImpulse;
      }
    }
  }

  private static SolvePositionConstraints_s_xfA = new b2Transform();
  private static SolvePositionConstraints_s_xfB = new b2Transform();
  private static SolvePositionConstraints_s_psm = new b2PositionSolverManifold();
  private static SolvePositionConstraints_s_rA = new b2Vec2();
  private static SolvePositionConstraints_s_rB = new b2Vec2();
  private static SolvePositionConstraints_s_P = new b2Vec2();
  public SolvePositionConstraints(): boolean {
    const xfA: b2Transform = b2ContactSolver.SolvePositionConstraints_s_xfA;
    const xfB: b2Transform = b2ContactSolver.SolvePositionConstraints_s_xfB;
    const psm: b2PositionSolverManifold = b2ContactSolver.SolvePositionConstraints_s_psm;
    const rA: b2Vec2 = b2ContactSolver.SolvePositionConstraints_s_rA;
    const rB: b2Vec2 = b2ContactSolver.SolvePositionConstraints_s_rB;
    const P: b2Vec2 = b2ContactSolver.SolvePositionConstraints_s_P;

    let minSeparation: number = 0;

    for (let i: number = 0; i < this.m_count; ++i) {
      const pc: b2ContactPositionConstraint = this.m_positionConstraints[i];

      const indexA: number = pc.indexA;
      const indexB: number = pc.indexB;
      const localCenterA: b2Vec2 = pc.localCenterA;
      const mA: number = pc.invMassA;
      const iA: number = pc.invIA;
      const localCenterB: b2Vec2 = pc.localCenterB;
      const mB: number = pc.invMassB;
      const iB: number = pc.invIB;
      const pointCount: number = pc.pointCount;

      const cA: b2Vec2 = this.m_positions[indexA].c;
      let aA: number = this.m_positions[indexA].a;

      const cB: b2Vec2 = this.m_positions[indexB].c;
      let aB: number = this.m_positions[indexB].a;

      // Solve normal constraints
      for (let j: number = 0; j < pointCount; ++j) {
        xfA.q.SetAngle(aA);
        xfB.q.SetAngle(aB);
        b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
        b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);

        psm.Initialize(pc, xfA, xfB, j);
        const normal: b2Vec2 = psm.normal;

        const point: b2Vec2 = psm.point;
        const separation: number = psm.separation;

        // b2Vec2 rA = point - cA;
        b2Vec2.SubVV(point, cA, rA);
        // b2Vec2 rB = point - cB;
        b2Vec2.SubVV(point, cB, rB);

        // Track max constraint error.
        minSeparation = b2Min(minSeparation, separation);

        // Prevent large corrections and allow slop.
        const C: number = b2Clamp(b2_baumgarte * (separation + b2_linearSlop), (-b2_maxLinearCorrection), 0);

        // Compute the effective mass.
        // float32 rnA = b2Cross(rA, normal);
        const rnA: number = b2Vec2.CrossVV(rA, normal);
        // float32 rnB = b2Cross(rB, normal);
        const rnB: number = b2Vec2.CrossVV(rB, normal);
        // float32 K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
        const K: number = mA + mB + iA * rnA * rnA + iB * rnB * rnB;

        // Compute normal impulse
        const impulse: number = K > 0 ? - C / K : 0;

        // b2Vec2 P = impulse * normal;
        b2Vec2.MulSV(impulse, normal, P);

        // cA -= mA * P;
        cA.SelfMulSub(mA, P);
        // aA -= iA * b2Cross(rA, P);
        aA -= iA * b2Vec2.CrossVV(rA, P);

        // cB += mB * P;
        cB.SelfMulAdd(mB, P);
        // aB += iB * b2Cross(rB, P);
        aB += iB * b2Vec2.CrossVV(rB, P);
      }

      // this.m_positions[indexA].c = cA;
      this.m_positions[indexA].a = aA;

      // this.m_positions[indexB].c = cB;
      this.m_positions[indexB].a = aB;
    }

    // We can't expect minSpeparation >= -b2_linearSlop because we don't
    // push the separation above -b2_linearSlop.
    return minSeparation > (-3 * b2_linearSlop);
  }

  private static SolveTOIPositionConstraints_s_xfA = new b2Transform();
  private static SolveTOIPositionConstraints_s_xfB = new b2Transform();
  private static SolveTOIPositionConstraints_s_psm = new b2PositionSolverManifold();
  private static SolveTOIPositionConstraints_s_rA = new b2Vec2();
  private static SolveTOIPositionConstraints_s_rB = new b2Vec2();
  private static SolveTOIPositionConstraints_s_P = new b2Vec2();
  public SolveTOIPositionConstraints(toiIndexA: number, toiIndexB: number): boolean {
    const xfA: b2Transform = b2ContactSolver.SolveTOIPositionConstraints_s_xfA;
    const xfB: b2Transform = b2ContactSolver.SolveTOIPositionConstraints_s_xfB;
    const psm: b2PositionSolverManifold = b2ContactSolver.SolveTOIPositionConstraints_s_psm;
    const rA: b2Vec2 = b2ContactSolver.SolveTOIPositionConstraints_s_rA;
    const rB: b2Vec2 = b2ContactSolver.SolveTOIPositionConstraints_s_rB;
    const P: b2Vec2 = b2ContactSolver.SolveTOIPositionConstraints_s_P;

    let minSeparation: number = 0;

    for (let i: number = 0; i < this.m_count; ++i) {
      const pc: b2ContactPositionConstraint = this.m_positionConstraints[i];

      const indexA: number = pc.indexA;
      const indexB: number = pc.indexB;
      const localCenterA: b2Vec2 = pc.localCenterA;
      const localCenterB: b2Vec2 = pc.localCenterB;
      const pointCount: number = pc.pointCount;

      let mA: number = 0;
      let iA: number = 0;
      if (indexA === toiIndexA || indexA === toiIndexB) {
        mA = pc.invMassA;
        iA = pc.invIA;
      }

      let mB: number = 0;
      let iB: number = 0;
      if (indexB === toiIndexA || indexB === toiIndexB) {
        mB = pc.invMassB;
        iB = pc.invIB;
      }

      const cA: b2Vec2 = this.m_positions[indexA].c;
      let aA: number = this.m_positions[indexA].a;

      const cB: b2Vec2 = this.m_positions[indexB].c;
      let aB: number = this.m_positions[indexB].a;

      // Solve normal constraints
      for (let j: number = 0; j < pointCount; ++j) {
        xfA.q.SetAngle(aA);
        xfB.q.SetAngle(aB);
        b2Vec2.SubVV(cA, b2Rot.MulRV(xfA.q, localCenterA, b2Vec2.s_t0), xfA.p);
        b2Vec2.SubVV(cB, b2Rot.MulRV(xfB.q, localCenterB, b2Vec2.s_t0), xfB.p);

        psm.Initialize(pc, xfA, xfB, j);
        const normal: b2Vec2 = psm.normal;

        const point: b2Vec2 = psm.point;
        const separation: number = psm.separation;

        // b2Vec2 rA = point - cA;
        b2Vec2.SubVV(point, cA, rA);
        // b2Vec2 rB = point - cB;
        b2Vec2.SubVV(point, cB, rB);

        // Track max constraint error.
        minSeparation = b2Min(minSeparation, separation);

        // Prevent large corrections and allow slop.
        const C: number = b2Clamp(b2_toiBaumgarte * (separation + b2_linearSlop), (-b2_maxLinearCorrection), 0);

        // Compute the effective mass.
        // float32 rnA = b2Cross(rA, normal);
        const rnA: number = b2Vec2.CrossVV(rA, normal);
        // float32 rnB = b2Cross(rB, normal);
        const rnB: number = b2Vec2.CrossVV(rB, normal);
        // float32 K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
        const K: number = mA + mB + iA * rnA * rnA + iB * rnB * rnB;

        // Compute normal impulse
        const impulse: number = K > 0 ? - C / K : 0;

        // b2Vec2 P = impulse * normal;
        b2Vec2.MulSV(impulse, normal, P);

        // cA -= mA * P;
        cA.SelfMulSub(mA, P);
        // aA -= iA * b2Cross(rA, P);
        aA -= iA * b2Vec2.CrossVV(rA, P);

        // cB += mB * P;
        cB.SelfMulAdd(mB, P);
        // aB += iB * b2Cross(rB, P);
        aB += iB * b2Vec2.CrossVV(rB, P);
      }

      // this.m_positions[indexA].c = cA;
      this.m_positions[indexA].a = aA;

      // this.m_positions[indexB].c = cB;
      this.m_positions[indexB].a = aB;
    }

    // We can't expect minSpeparation >= -b2_linearSlop because we don't
    // push the separation above -b2_linearSlop.
    return minSeparation >= -1.5 * b2_linearSlop;
  }
}
/*
* Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/








 interface b2IDistanceJointDef extends b2IJointDef {
  localAnchorA?: XY;
  localAnchorB?: XY;
  length?: number;
  minLength?: number;
  maxLength?: number;
  stiffness?: number;
  damping?: number;
}

/// Distance joint definition. This requires defining an
/// anchor point on both bodies and the non-zero length of the
/// distance joint. The definition uses local anchor points
/// so that the initial configuration can violate the constraint
/// slightly. This helps when saving and loading a game.
/// @warning Do not use a zero or short length.
 class b2DistanceJointDef extends b2JointDef implements b2IDistanceJointDef {
  public  localAnchorA: b2Vec2 = new b2Vec2();
  public  localAnchorB: b2Vec2 = new b2Vec2();
  public length: number = 1;
  public minLength: number = 0;
  public maxLength: number = b2_maxFloat; // FLT_MAX;
  public stiffness: number = 0;
  public damping: number = 0;

  constructor() {
    super(b2JointType.e_distanceJoint);
  }

  public Initialize(b1: b2Body, b2: b2Body, anchor1: XY, anchor2: XY): void {
    this.bodyA = b1;
    this.bodyB = b2;
    this.bodyA.GetLocalPoint(anchor1, this.localAnchorA);
    this.bodyB.GetLocalPoint(anchor2, this.localAnchorB);
    this.length = b2Max(b2Vec2.DistanceVV(anchor1, anchor2), b2_linearSlop);
    this.minLength = this.length;
    this.maxLength = this.length;
  }
}

 class b2DistanceJoint extends b2Joint {
  public m_stiffness: number = 0;
  public m_damping: number = 0;
  public m_bias: number = 0;
  public m_length: number = 0;
  public m_minLength: number = 0;
  public m_maxLength: number = 0;

  // Solver shared
  public  m_localAnchorA: b2Vec2 = new b2Vec2();
  public  m_localAnchorB: b2Vec2 = new b2Vec2();
  public m_gamma: number = 0;
  public m_impulse: number = 0;
  public m_lowerImpulse: number = 0;
  public m_upperImpulse: number = 0;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_u: b2Vec2 = new b2Vec2();
  public  m_rA: b2Vec2 = new b2Vec2();
  public  m_rB: b2Vec2 = new b2Vec2();
  public  m_localCenterA: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();
  public m_currentLength: number = 0;
  public m_invMassA: number = 0;
  public m_invMassB: number = 0;
  public m_invIA: number = 0;
  public m_invIB: number = 0;
  public m_softMass: number = 0;
  public m_mass: number = 0;

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_lalcA: b2Vec2 = new b2Vec2();
  public  m_lalcB: b2Vec2 = new b2Vec2();

  constructor(def: b2IDistanceJointDef) {
    super(def);

    this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
    this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
    this.m_length = b2Max(b2Maybe(def.length, this.GetCurrentLength()), b2_linearSlop);
    this.m_minLength = b2Max(b2Maybe(def.minLength, this.m_length), b2_linearSlop);
    this.m_maxLength = b2Max(b2Maybe(def.maxLength, this.m_length), this.m_minLength);
    this.m_stiffness = b2Maybe(def.stiffness, 0);
    this.m_damping = b2Maybe(def.damping, 0);
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    // b2Vec2 F = inv_dt * (m_impulse + m_lowerImpulse - m_upperImpulse) * m_u;
    out.x = inv_dt * (this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_u.x;
    out.y = inv_dt * (this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_u.y;
    return out;
  }

  public GetReactionTorque(inv_dt: number): number {
    return 0;
  }

  public GetLocalAnchorA():b2Vec2 { return this.m_localAnchorA; }

  public GetLocalAnchorB():b2Vec2 { return this.m_localAnchorB; }

  public SetLength(length: number): number {
    this.m_impulse = 0;
    this.m_length = b2Max(b2_linearSlop, length);
    return this.m_length;
  }

  public GetLength(): number {
    return this.m_length;
  }

  public SetMinLength(minLength: number): number {
    this.m_lowerImpulse = 0;
    this.m_minLength = b2Clamp(minLength, b2_linearSlop, this.m_maxLength);
    return this.m_minLength;
  }

  public SetMaxLength(maxLength: number): number {
    this.m_upperImpulse = 0;
    this.m_maxLength = b2Max(maxLength, this.m_minLength);
    return this.m_maxLength;
  }

  public GetCurrentLength(): number {
    const pA: b2Vec2 = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, new b2Vec2());
    const pB: b2Vec2 = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, new b2Vec2());
    return b2Vec2.DistanceVV(pA, pB);
  }

  public SetStiffness(stiffness: number): void {
    this.m_stiffness = stiffness;
  }

  public GetStiffness() {
    return this.m_stiffness;
  }

  public SetDamping(damping: number): void {
    this.m_damping = damping;
  }

  public GetDamping() {
    return this.m_damping;
  }

  public Dump(log: (format: string, ...args: any[]) => void) {
    const indexA: number = this.m_bodyA.m_islandIndex;
    const indexB: number = this.m_bodyB.m_islandIndex;

    log("  const jd: b2DistanceJointDef = new b2DistanceJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    log("  jd.length = %.15f;\n", this.m_length);
    log("  jd.minLength = %.15f;\n", this.m_minLength);
    log("  jd.maxLength = %.15f;\n", this.m_maxLength);
    log("  jd.stiffness = %.15f;\n", this.m_stiffness);
    log("  jd.damping = %.15f;\n", this.m_damping);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }

  private static InitVelocityConstraints_s_P = new b2Vec2();
  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    // const qA: b2Rot = new b2Rot(aA), qB: b2Rot = new b2Rot(aB);
    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
    // m_u = cB + m_rB - cA - m_rA;
    this.m_u.x = cB.x + this.m_rB.x - cA.x - this.m_rA.x;
    this.m_u.y = cB.y + this.m_rB.y - cA.y - this.m_rA.y;

    // Handle singularity.
    this.m_currentLength = this.m_u.Length();
    if (this.m_currentLength > b2_linearSlop) {
      this.m_u.SelfMul(1 / this.m_currentLength);
    } else {
      this.m_u.SetZero();
      this.m_mass = 0;
      this.m_impulse = 0;
      this.m_lowerImpulse = 0;
      this.m_upperImpulse = 0;
    }

    // float32 crAu = b2Cross(m_rA, m_u);
    const crAu: number = b2Vec2.CrossVV(this.m_rA, this.m_u);
    // float32 crBu = b2Cross(m_rB, m_u);
    const crBu: number = b2Vec2.CrossVV(this.m_rB, this.m_u);
    // float32 invMass = m_invMassA + m_invIA * crAu * crAu + m_invMassB + m_invIB * crBu * crBu;
    let invMass: number = this.m_invMassA + this.m_invIA * crAu * crAu + this.m_invMassB + this.m_invIB * crBu * crBu;
    this.m_mass = invMass !== 0 ? 1 / invMass : 0;

    if (this.m_stiffness > 0 && this.m_minLength < this.m_maxLength) {
      // soft
      const C: number = this.m_currentLength - this.m_length;

      const d: number = this.m_damping;
      const k: number = this.m_stiffness;

      // magic formulas
      const h: number = data.step.dt;

      // gamma = 1 / (h * (d + h * k))
      // the extra factor of h in the denominator is since the lambda is an impulse, not a force
      this.m_gamma = h * (d + h * k);
      this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma : 0;
      this.m_bias = C * h * k * this.m_gamma;

      invMass += this.m_gamma;
      this.m_softMass = invMass !== 0 ? 1 / invMass : 0;
    }
    else {
      // rigid
      this.m_gamma = 0;
      this.m_bias = 0;
      this.m_softMass = this.m_mass;
    }

    if (data.step.warmStarting) {
      // Scale the impulse to support a variable time step.
      this.m_impulse *= data.step.dtRatio;
      this.m_lowerImpulse *= data.step.dtRatio;
      this.m_upperImpulse *= data.step.dtRatio;

      const P: b2Vec2 = b2Vec2.MulSV(this.m_impulse + this.m_lowerImpulse - this.m_upperImpulse, this.m_u, b2DistanceJoint.InitVelocityConstraints_s_P);
      vA.SelfMulSub(this.m_invMassA, P);
      wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
      vB.SelfMulAdd(this.m_invMassB, P);
      wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
    }
    else {
      this.m_impulse = 0;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_vpA = new b2Vec2();
  private static SolveVelocityConstraints_s_vpB = new b2Vec2();
  private static SolveVelocityConstraints_s_P = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    if (this.m_minLength < this.m_maxLength) {
      if (this.m_stiffness > 0) {
        // Cdot = dot(u, v + cross(w, r))
        const vpA: b2Vec2 = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
        const vpB: b2Vec2 = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
        const Cdot: number = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));

        const impulse: number = -this.m_softMass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
        this.m_impulse += impulse;

        const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
        vA.SelfMulSub(this.m_invMassA, P);
        wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
        vB.SelfMulAdd(this.m_invMassB, P);
        wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
      }

      // lower
      {
        const C: number = this.m_currentLength - this.m_minLength;
        const bias: number = b2Max(0, C) * data.step.inv_dt;

        const vpA: b2Vec2 = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
        const vpB: b2Vec2 = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
        const Cdot: number = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));

        let impulse: number = -this.m_mass * (Cdot + bias);
        const oldImpulse: number = this.m_lowerImpulse;
        this.m_lowerImpulse = b2Max(0, this.m_lowerImpulse + impulse);
        impulse = this.m_lowerImpulse - oldImpulse;
        const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);

        vA.SelfMulSub(this.m_invMassA, P);
        wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
        vB.SelfMulAdd(this.m_invMassB, P);
        wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
      }

      // upper
      {
        const C: number = this.m_maxLength - this.m_currentLength;
        const bias: number = b2Max(0, C) * data.step.inv_dt;

        const vpA: b2Vec2 = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
        const vpB: b2Vec2 = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
        const Cdot: number = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpA, vpB, b2Vec2.s_t0));

        let impulse: number = -this.m_mass * (Cdot + bias);
        const oldImpulse: number = this.m_upperImpulse;
        this.m_upperImpulse = b2Max(0, this.m_upperImpulse + impulse);
        impulse = this.m_upperImpulse - oldImpulse;
        const P: b2Vec2 = b2Vec2.MulSV(-impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);

        vA.SelfMulSub(this.m_invMassA, P);
        wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
        vB.SelfMulAdd(this.m_invMassB, P);
        wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
      }
    }
    else {
      // Equal limits

      // Cdot = dot(u, v + cross(w, r))
      const vpA: b2Vec2 = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2DistanceJoint.SolveVelocityConstraints_s_vpA);
      const vpB: b2Vec2 = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2DistanceJoint.SolveVelocityConstraints_s_vpB);
      const Cdot: number = b2Vec2.DotVV(this.m_u, b2Vec2.SubVV(vpB, vpA, b2Vec2.s_t0));

      const impulse: number = -this.m_mass * Cdot;
      this.m_impulse += impulse;

      const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_u, b2DistanceJoint.SolveVelocityConstraints_s_P);
      vA.SelfMulSub(this.m_invMassA, P);
      wA -= this.m_invIA * b2Vec2.CrossVV(this.m_rA, P);
      vB.SelfMulAdd(this.m_invMassB, P);
      wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, P);
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolvePositionConstraints_s_P = new b2Vec2();
  public SolvePositionConstraints(data: b2SolverData): boolean {
    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    let aA: number = data.positions[this.m_indexA].a;
    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    let aB: number = data.positions[this.m_indexB].a;

    // const qA: b2Rot = new b2Rot(aA), qB: b2Rot = new b2Rot(aB);
    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA); // use m_rA
    // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB); // use m_rB
    // b2Vec2 u = cB + rB - cA - rA;
    const u: b2Vec2 = this.m_u; // use m_u
    u.x = cB.x + rB.x - cA.x - rA.x;
    u.y = cB.y + rB.y - cA.y - rA.y;

    const length: number = this.m_u.Normalize();
    let C: number;
    if (this.m_minLength == this.m_maxLength)
    {
      C = length - this.m_minLength;
    }
    else if (length < this.m_minLength)
    {
      C = length - this.m_minLength;
    }
    else if (this.m_maxLength < length)
    {
      C = length - this.m_maxLength;
    }
    else
    {
      return true;
    }

    const impulse: number = -this.m_mass * C;
    const P: b2Vec2 = b2Vec2.MulSV(impulse, u, b2DistanceJoint.SolvePositionConstraints_s_P);

    cA.SelfMulSub(this.m_invMassA, P);
    aA -= this.m_invIA * b2Vec2.CrossVV(rA, P);
    cB.SelfMulAdd(this.m_invMassB, P);
    aB += this.m_invIB * b2Vec2.CrossVV(rB, P);

    // data.positions[this.m_indexA].c = cA;
    data.positions[this.m_indexA].a = aA;
    // data.positions[this.m_indexB].c = cB;
    data.positions[this.m_indexB].a = aB;

    return b2Abs(C) < b2_linearSlop;
  }

  private static Draw_s_pA = new b2Vec2();
  private static Draw_s_pB = new b2Vec2();
  private static Draw_s_axis = new b2Vec2();
  private static Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
  private static Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
  private static Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
  private static Draw_s_c4 = new b2Color(0.4, 0.4, 0.4);
  private static Draw_s_pRest = new b2Vec2();
  private static Draw_s_pMin = new b2Vec2();
  private static Draw_s_pMax = new b2Vec2();
  public Draw(draw: b2Draw): void {
    const xfA: b2Transform = this.m_bodyA.GetTransform();
    const xfB: b2Transform = this.m_bodyB.GetTransform();
    const pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2DistanceJoint.Draw_s_pA);
    const pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2DistanceJoint.Draw_s_pB);

    const axis: b2Vec2 = b2Vec2.SubVV(pB, pA, b2DistanceJoint.Draw_s_axis);
    axis.Normalize();
  
    const c1 = b2DistanceJoint.Draw_s_c1; // b2Color c1(0.7f, 0.7f, 0.7f);
    const c2 = b2DistanceJoint.Draw_s_c2; // b2Color c2(0.3f, 0.9f, 0.3f);
    const c3 = b2DistanceJoint.Draw_s_c3; // b2Color c3(0.9f, 0.3f, 0.3f);
    const c4 = b2DistanceJoint.Draw_s_c4; // b2Color c4(0.4f, 0.4f, 0.4f);
  
    draw.DrawSegment(pA, pB, c4);
    
    // b2Vec2 pRest = pA + this.m_length * axis;
    const pRest: b2Vec2 = b2Vec2.AddVMulSV(pA, this.m_length, axis, b2DistanceJoint.Draw_s_pRest);
    draw.DrawPoint(pRest, 8.0, c1);
  
    if (this.m_minLength != this.m_maxLength) {
      if (this.m_minLength > b2_linearSlop) {
        // b2Vec2 pMin = pA + this.m_minLength * axis;
        const pMin: b2Vec2 = b2Vec2.AddVMulSV(pA, this.m_minLength, axis, b2DistanceJoint.Draw_s_pMin);
        draw.DrawPoint(pMin, 4.0, c2);
      }
  
      if (this.m_maxLength < b2_maxFloat) {
        // b2Vec2 pMax = pA + this.m_maxLength * axis;
        const pMax: b2Vec2 = b2Vec2.AddVMulSV(pA, this.m_maxLength, axis, b2DistanceJoint.Draw_s_pMax);
        draw.DrawPoint(pMax, 4.0, c3);
      }
    }
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/








 class b2EdgeAndCircleContact extends b2Contact<b2EdgeShape, b2CircleShape> {
  public static Create(): b2Contact {
    return new b2EdgeAndCircleContact();
  }

  public static Destroy(contact: b2Contact): void {
  }

  public Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void {
    b2CollideEdgeAndCircle(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/








 class b2EdgeAndPolygonContact extends b2Contact<b2EdgeShape, b2PolygonShape> {
  public static Create(): b2Contact {
    return new b2EdgeAndPolygonContact();
  }

  public static Destroy(contact: b2Contact): void {
  }

  public Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void {
    b2CollideEdgeAndPolygon(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 







/// This holds contact filtering data.
 interface b2IFilter {
  /// The collision category bits. Normally you would just set one bit.
  categoryBits: number;

  /// The collision mask bits. This states the categories that this
  /// shape would accept for collision.
  maskBits: number;

  /// Collision groups allow a certain group of objects to never collide (negative)
  /// or always collide (positive). Zero means no collision group. Non-zero group
  /// filtering always wins against the mask bits.
  groupIndex?: number;
}

/// This holds contact filtering data.
 class b2Filter implements b2IFilter {
  public static  DEFAULT: <b2Filter> = new b2Filter();

  /// The collision category bits. Normally you would just set one bit.
  public categoryBits: number = 0x0001;

  /// The collision mask bits. This states the categories that this
  /// shape would accept for collision.
  public maskBits: number = 0xFFFF;

  /// Collision groups allow a certain group of objects to never collide (negative)
  /// or always collide (positive). Zero means no collision group. Non-zero group
  /// filtering always wins against the mask bits.
  public groupIndex: number = 0;

  public Clone(): b2Filter {
    return new b2Filter().Copy(this);
  }

  public Copy(other: b2IFilter): this {
    // DEBUG: b2Assert(this !== other);
    this.categoryBits = other.categoryBits;
    this.maskBits = other.maskBits;
    this.groupIndex = other.groupIndex || 0;
    return this;
  }
}

/// A fixture definition is used to create a fixture. This class defines an
/// abstract fixture definition. You can reuse fixture definitions safely.
 interface b2IFixtureDef {
  /// The shape, this must be set. The shape will be cloned, so you
  /// can create the shape on the stack.
  shape: b2Shape;

  /// Use this to store application specific fixture data.
  userData?: any;

  /// The friction coefficient, usually in the range [0,1].
  friction?: number;

  /// The restitution (elasticity) usually in the range [0,1].
  restitution?: number;

  /// Restitution velocity threshold, usually in m/s. Collisions above this
  /// speed have restitution applied (will bounce).
  restitutionThreshold?: number;

  /// The density, usually in kg/m^2.
  density?: number;

  /// A sensor shape collects contact information but never generates a collision
  /// response.
  isSensor?: boolean;

  /// Contact filtering data.
  filter?: b2IFilter;
}

/// A fixture definition is used to create a fixture. This class defines an
/// abstract fixture definition. You can reuse fixture definitions safely.
 class b2FixtureDef implements b2IFixtureDef {
  /// The shape, this must be set. The shape will be cloned, so you
  /// can create the shape on the stack.
  public shape: b2Shape;

  /// Use this to store application specific fixture data.
  public userData: any = null;

  /// The friction coefficient, usually in the range [0,1].
  public friction: number = 0.2;

  /// The restitution (elasticity) usually in the range [0,1].
  public restitution: number = 0;

  /// Restitution velocity threshold, usually in m/s. Collisions above this
  /// speed have restitution applied (will bounce).
  public restitutionThreshold: number = 1.0 * b2_lengthUnitsPerMeter;

  /// The density, usually in kg/m^2.
  public density: number = 0;

  /// A sensor shape collects contact information but never generates a collision
  /// response.
  public isSensor: boolean = false;

  /// Contact filtering data.
  public  filter: b2Filter = new b2Filter();
}

/// This proxy is used internally to connect fixtures to the broad-phase.
 class b2FixtureProxy {
  public  aabb: b2AABB = new b2AABB();
  public  fixture: b2Fixture;
  public  childIndex: number = 0;
  public treeNode: b2TreeNode<b2FixtureProxy>;
  constructor(fixture: b2Fixture, childIndex: number) {
    this.fixture = fixture;
    this.childIndex = childIndex;
    this.fixture.m_shape.ComputeAABB(this.aabb, this.fixture.m_body.GetTransform(), childIndex);
    this.treeNode = this.fixture.m_body.m_world.m_contactManager.m_broadPhase.CreateProxy(this.aabb, this);
  }
  public Reset(): void {
    this.fixture.m_body.m_world.m_contactManager.m_broadPhase.DestroyProxy(this.treeNode);
  }
  public Touch(): void {
    this.fixture.m_body.m_world.m_contactManager.m_broadPhase.TouchProxy(this.treeNode);
  }
  private static Synchronize_s_aabb1 = new b2AABB();
  private static Synchronize_s_aabb2 = new b2AABB();
  private static Synchronize_s_displacement = new b2Vec2();
  public Synchronize(transform1: b2Transform, transform2: b2Transform): void {
    if (transform1 === transform2) {
      this.fixture.m_shape.ComputeAABB(this.aabb, transform1, this.childIndex);
      this.fixture.m_body.m_world.m_contactManager.m_broadPhase.MoveProxy(this.treeNode, this.aabb, b2Vec2.ZERO);
    } else {
      // Compute an AABB that covers the swept shape (may miss some rotation effect).
      const aabb1: b2AABB = b2FixtureProxy.Synchronize_s_aabb1;
      const aabb2: b2AABB = b2FixtureProxy.Synchronize_s_aabb2;
      this.fixture.m_shape.ComputeAABB(aabb1, transform1, this.childIndex);
      this.fixture.m_shape.ComputeAABB(aabb2, transform2, this.childIndex);
      this.aabb.Combine2(aabb1, aabb2);
      const displacement: b2Vec2 = b2FixtureProxy.Synchronize_s_displacement;
      displacement.Copy(aabb2.GetCenter()).SelfSub(aabb1.GetCenter());
      this.fixture.m_body.m_world.m_contactManager.m_broadPhase.MoveProxy(this.treeNode, this.aabb, displacement);
    }
  }
}

/// A fixture is used to attach a shape to a body for collision detection. A fixture
/// inherits its transform from its parent. Fixtures hold additional non-geometric data
/// such as friction, collision filters, etc.
/// Fixtures are created via b2Body::CreateFixture.
/// @warning you cannot reuse fixtures.
 class b2Fixture {
  public m_density: number = 0;

  public m_next: b2Fixture  = null;
  public  m_body: b2Body;

  public  m_shape: b2Shape;

  public m_friction: number = 0;
  public m_restitution: number = 0;
  public m_restitutionThreshold: number = 1.0 * b2_lengthUnitsPerMeter;

  public  m_proxies: b2FixtureProxy[] = [];
  public get m_proxyCount(): number { return this.m_proxies.length; }

  public  m_filter: b2Filter = new b2Filter();

  public m_isSensor: boolean = false;

  public m_userData: any = null;

  constructor(body: b2Body, def: b2IFixtureDef) {
    this.m_body = body;
    this.m_shape = def.shape.Clone();
    this.m_userData = b2Maybe(def.userData, null);
    this.m_friction = b2Maybe(def.friction, 0.2);
    this.m_restitution = b2Maybe(def.restitution, 0);
    this.m_restitutionThreshold = b2Maybe(def.restitutionThreshold, 0);
    this.m_filter.Copy(b2Maybe(def.filter, b2Filter.DEFAULT));
    this.m_isSensor = b2Maybe(def.isSensor, false);
    this.m_density = b2Maybe(def.density, 0);
  }

  public Reset(): void {
    // The proxies must be destroyed before calling this.
    // DEBUG: b2Assert(this.m_proxyCount === 0);
  }

  /// Get the type of the child shape. You can use this to down cast to the concrete shape.
  /// @return the shape type.
  public GetType(): b2ShapeType {
    return this.m_shape.GetType();
  }

  /// Get the child shape. You can modify the child shape, however you should not change the
  /// number of vertices because this will crash some collision caching mechanisms.
  /// Manipulating the shape may lead to non-physical behavior.
  public GetShape(): b2Shape {
    return this.m_shape;
  }

  /// Set if this fixture is a sensor.
  public SetSensor(sensor: boolean): void {
    if (sensor !== this.m_isSensor) {
      this.m_body.SetAwake(true);
      this.m_isSensor = sensor;
    }
  }

  /// Is this fixture a sensor (non-solid)?
  /// @return the true if the shape is a sensor.
  public IsSensor(): boolean {
    return this.m_isSensor;
  }

  /// Set the contact filtering data. This will not update contacts until the next time
  /// step when either parent body is active and awake.
  /// This automatically calls Refilter.
  public SetFilterData(filter: b2Filter): void {
    this.m_filter.Copy(filter);

    this.Refilter();
  }

  /// Get the contact filtering data.
  public GetFilterData(): <b2Filter> {
    return this.m_filter;
  }

  /// Call this if you want to establish collision that was previously disabled by b2ContactFilter::ShouldCollide.
  public Refilter(): void {
    // Flag associated contacts for filtering.
    let edge = this.m_body.GetContactList();

    while (edge) {
      const contact = edge.contact;
      const fixtureA = contact.GetFixtureA();
      const fixtureB = contact.GetFixtureB();
      if (fixtureA === this || fixtureB === this) {
        contact.FlagForFiltering();
      }

      edge = edge.next;
    }

    // Touch each proxy so that new pairs may be created
    this.TouchProxies();
  }

  /// Get the parent body of this fixture. This is NULL if the fixture is not attached.
  /// @return the parent body.
  public GetBody(): b2Body {
    return this.m_body;
  }

  /// Get the next fixture in the parent body's fixture list.
  /// @return the next shape.
  public GetNext(): b2Fixture  {
    return this.m_next;
  }

  /// Get the user data that was assigned in the fixture definition. Use this to
  /// store your application specific data.
  public GetUserData(): any {
    return this.m_userData;
  }

  /// Set the user data. Use this to store your application specific data.
  public SetUserData(data: any): void {
    this.m_userData = data;
  }

  /// Test a point for containment in this fixture.
  /// @param p a point in world coordinates.
  public TestPoint(p: XY): boolean {
    return this.m_shape.TestPoint(this.m_body.GetTransform(), p);
  }

  // #if B2_ENABLE_PARTICLE
  public ComputeDistance(p: b2Vec2, normal: b2Vec2, childIndex: number): number {
    return this.m_shape.ComputeDistance(this.m_body.GetTransform(), p, normal, childIndex);
  }
  // #endif

  /// Cast a ray against this shape.
  /// @param output the ray-cast results.
  /// @param input the ray-cast input parameters.
  public RayCast(output: b2RayCastOutput, input: b2RayCastInput, childIndex: number): boolean {
    return this.m_shape.RayCast(output, input, this.m_body.GetTransform(), childIndex);
  }

  /// Get the mass data for this fixture. The mass data is based on the density and
  /// the shape. The rotational inertia is about the shape's origin. This operation
  /// may be expensive.
  public GetMassData(massData: b2MassData = new b2MassData()): b2MassData {
    this.m_shape.ComputeMass(massData, this.m_density);

    return massData;
  }

  /// Set the density of this fixture. This will _not_ automatically adjust the mass
  /// of the body. You must call b2Body::ResetMassData to update the body's mass.
  public SetDensity(density: number): void {
    this.m_density = density;
  }

  /// Get the density of this fixture.
  public GetDensity(): number {
    return this.m_density;
  }

  /// Get the coefficient of friction.
  public GetFriction(): number {
    return this.m_friction;
  }

  /// Set the coefficient of friction. This will _not_ change the friction of
  /// existing contacts.
  public SetFriction(friction: number): void {
    this.m_friction = friction;
  }

  /// Get the coefficient of restitution.
  public GetRestitution(): number {
    return this.m_restitution;
  }

  /// Set the coefficient of restitution. This will _not_ change the restitution of
  /// existing contacts.
  public SetRestitution(restitution: number): void {
    this.m_restitution = restitution;
  }

	/// Get the restitution velocity threshold.
	public GetRestitutionThreshold(): number {
    return this.m_restitutionThreshold;
  }

	/// Set the restitution threshold. This will _not_ change the restitution threshold of
	/// existing contacts.
	public SetRestitutionThreshold(threshold: number): void {
    this.m_restitutionThreshold = threshold;
  }

  /// Get the fixture's AABB. This AABB may be enlarge and/or stale.
  /// If you need a more accurate AABB, compute it using the shape and
  /// the body transform.
  public GetAABB(childIndex: number): <b2AABB> {
    // DEBUG: b2Assert(0 <= childIndex && childIndex < this.m_proxyCount);
    return this.m_proxies[childIndex].aabb;
  }

  /// Dump this fixture to the log file.
  public Dump(log: (format: string, ...args: any[]) => void, bodyIndex: number): void {
    log("    const fd: b2FixtureDef = new b2FixtureDef();\n");
    log("    fd.friction = %.15f;\n", this.m_friction);
    log("    fd.restitution = %.15f;\n", this.m_restitution);
    log("    fd.restitutionThreshold = %.15f;\n", this.m_restitutionThreshold);
    log("    fd.density = %.15f;\n", this.m_density);
    log("    fd.isSensor = %s;\n", (this.m_isSensor) ? ("true") : ("false"));
    log("    fd.filter.categoryBits = %d;\n", this.m_filter.categoryBits);
    log("    fd.filter.maskBits = %d;\n", this.m_filter.maskBits);
    log("    fd.filter.groupIndex = %d;\n", this.m_filter.groupIndex);

    this.m_shape.Dump(log);

    log("\n");
    log("    fd.shape = shape;\n");
    log("\n");
    log("    bodies[%d].CreateFixture(fd);\n", bodyIndex);
  }

  // These support body activation/deactivation.
  public CreateProxies(): void {
    if (this.m_proxies.length !== 0) { throw new Error(); }
    // Create proxies in the broad-phase.
    for (let i: number = 0; i < this.m_shape.GetChildCount(); ++i) {
      this.m_proxies[i] = new b2FixtureProxy(this, i);
    }
  }

  public DestroyProxies(): void {
    // Destroy proxies in the broad-phase.
    for (const proxy of this.m_proxies) {
      proxy.Reset();
    }
    this.m_proxies.length = 0;
  }

  public TouchProxies(): void {
    for (const proxy of this.m_proxies) {
      proxy.Touch();
    }
  }

  public SynchronizeProxies(transform1: b2Transform, transform2: b2Transform): void {
    for (const proxy of this.m_proxies) {
      proxy.Synchronize(transform1, transform2);
    }
  }
}
/*
* Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







 interface b2IFrictionJointDef extends b2IJointDef {
  localAnchorA?: XY;

  localAnchorB?: XY;

  maxForce?: number;

  maxTorque?: number;
}

/// Friction joint definition.
 class b2FrictionJointDef extends b2JointDef implements b2IFrictionJointDef {
  public  localAnchorA: b2Vec2 = new b2Vec2();

  public  localAnchorB: b2Vec2 = new b2Vec2();

  public maxForce: number = 0;

  public maxTorque: number = 0;

  constructor() {
    super(b2JointType.e_frictionJoint);
  }

  public Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2): void {
    this.bodyA = bA;
    this.bodyB = bB;
    this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
    this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
  }
}

 class b2FrictionJoint extends b2Joint {
  public  m_localAnchorA: b2Vec2 = new b2Vec2();
  public  m_localAnchorB: b2Vec2 = new b2Vec2();

  // Solver shared
  public  m_linearImpulse: b2Vec2 = new b2Vec2();
  public m_angularImpulse: number = 0;
  public m_maxForce: number = 0;
  public m_maxTorque: number = 0;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_rA: b2Vec2 = new b2Vec2();
  public  m_rB: b2Vec2 = new b2Vec2();
  public  m_localCenterA: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();
  public m_invMassA: number = 0;
  public m_invMassB: number = 0;
  public m_invIA: number = 0;
  public m_invIB: number = 0;
  public  m_linearMass: b2Mat22 = new b2Mat22();
  public m_angularMass: number = 0;

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_lalcA: b2Vec2 = new b2Vec2();
  public  m_lalcB: b2Vec2 = new b2Vec2();
  public  m_K: b2Mat22 = new b2Mat22();

  constructor(def: b2IFrictionJointDef) {
    super(def);

    this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
    this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));

    this.m_linearImpulse.SetZero();
    this.m_maxForce = b2Maybe(def.maxForce, 0);
    this.m_maxTorque = b2Maybe(def.maxTorque, 0);

    this.m_linearMass.SetZero();
  }

  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    // const cA: b2Vec2 = data.positions[this.m_indexA].c;
    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    // const cB: b2Vec2 = data.positions[this.m_indexB].c;
    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    // const qA: b2Rot = new b2Rot(aA), qB: b2Rot = new b2Rot(aB);
    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // Compute the effective mass matrix.
    // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

    // J = [-I -r1_skew I r2_skew]
    //     [ 0       -1 0       1]
    // r_skew = [-ry; rx]

    // Matlab
    // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
    //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
    //     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    const K: b2Mat22 = this.m_K; // new b2Mat22();
    K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
    K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
    K.ey.x = K.ex.y;
    K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;

    K.GetInverse(this.m_linearMass);

    this.m_angularMass = iA + iB;
    if (this.m_angularMass > 0) {
      this.m_angularMass = 1 / this.m_angularMass;
    }

    if (data.step.warmStarting) {
      // Scale impulses to support a variable time step.
      // m_linearImpulse *= data.step.dtRatio;
      this.m_linearImpulse.SelfMul(data.step.dtRatio);
      this.m_angularImpulse *= data.step.dtRatio;

      // const P: b2Vec2(m_linearImpulse.x, m_linearImpulse.y);
      const P: b2Vec2 = this.m_linearImpulse;

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      // wA -= iA * (b2Cross(m_rA, P) + m_angularImpulse);
      wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + this.m_angularImpulse);
      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      // wB += iB * (b2Cross(m_rB, P) + m_angularImpulse);
      wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + this.m_angularImpulse);
    } else {
      this.m_linearImpulse.SetZero();
      this.m_angularImpulse = 0;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_Cdot_v2 = new b2Vec2();
  private static SolveVelocityConstraints_s_impulseV = new b2Vec2();
  private static SolveVelocityConstraints_s_oldImpulseV = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    const h: number = data.step.dt;

    // Solve angular friction
    {
      const Cdot: number = wB - wA;
      let impulse: number = (-this.m_angularMass * Cdot);

      const oldImpulse: number = this.m_angularImpulse;
      const maxImpulse: number = h * this.m_maxTorque;
      this.m_angularImpulse = b2Clamp(this.m_angularImpulse + impulse, (-maxImpulse), maxImpulse);
      impulse = this.m_angularImpulse - oldImpulse;

      wA -= iA * impulse;
      wB += iB * impulse;
    }

    // Solve linear friction
    {
      // b2Vec2 Cdot = vB + b2Cross(wB, m_rB) - vA - b2Cross(wA, m_rA);
      const Cdot_v2: b2Vec2 = b2Vec2.SubVV(
        b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0),
        b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1),
        b2FrictionJoint.SolveVelocityConstraints_s_Cdot_v2);

      // b2Vec2 impulse = -b2Mul(m_linearMass, Cdot);
      const impulseV: b2Vec2 = b2Mat22.MulMV(this.m_linearMass, Cdot_v2, b2FrictionJoint.SolveVelocityConstraints_s_impulseV).SelfNeg();
      // b2Vec2 oldImpulse = m_linearImpulse;
      const oldImpulseV = b2FrictionJoint.SolveVelocityConstraints_s_oldImpulseV.Copy(this.m_linearImpulse);
      // m_linearImpulse += impulse;
      this.m_linearImpulse.SelfAdd(impulseV);

      const maxImpulse: number = h * this.m_maxForce;

      if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
        this.m_linearImpulse.Normalize();
        this.m_linearImpulse.SelfMul(maxImpulse);
      }

      // impulse = m_linearImpulse - oldImpulse;
      b2Vec2.SubVV(this.m_linearImpulse, oldImpulseV, impulseV);

      // vA -= mA * impulse;
      vA.SelfMulSub(mA, impulseV);
      // wA -= iA * b2Cross(m_rA, impulse);
      wA -= iA * b2Vec2.CrossVV(this.m_rA, impulseV);

      // vB += mB * impulse;
      vB.SelfMulAdd(mB, impulseV);
      // wB += iB * b2Cross(m_rB, impulse);
      wB += iB * b2Vec2.CrossVV(this.m_rB, impulseV);
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  public SolvePositionConstraints(data: b2SolverData): boolean {
    return true;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    out.x = inv_dt * this.m_linearImpulse.x;
    out.y = inv_dt * this.m_linearImpulse.y;
    return out;
  }

  public GetReactionTorque(inv_dt: number): number {
    return inv_dt * this.m_angularImpulse;
  }

  public GetLocalAnchorA():b2Vec2 { return this.m_localAnchorA; }

  public GetLocalAnchorB():b2Vec2 { return this.m_localAnchorB; }

  public SetMaxForce(force: number): void {
    this.m_maxForce = force;
  }

  public GetMaxForce(): number {
    return this.m_maxForce;
  }

  public SetMaxTorque(torque: number): void {
    this.m_maxTorque = torque;
  }

  public GetMaxTorque(): number {
    return this.m_maxTorque;
  }

  public Dump(log: (format: string, ...args: any[]) => void): void {
    const indexA: number = this.m_bodyA.m_islandIndex;
    const indexB: number = this.m_bodyB.m_islandIndex;

    log("  const jd: b2FrictionJointDef = new b2FrictionJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    log("  jd.maxForce = %.15f;\n", this.m_maxForce);
    log("  jd.maxTorque = %.15f;\n", this.m_maxTorque);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 
// DEBUG: 








 interface b2IGearJointDef extends b2IJointDef {
  joint1: b2RevoluteJoint | b2PrismaticJoint;

  joint2: b2RevoluteJoint | b2PrismaticJoint;

  ratio?: number;
}

/// Gear joint definition. This definition requires two existing
/// revolute or prismatic joints (any combination will work).
 class b2GearJointDef extends b2JointDef implements b2IGearJointDef {
  public joint1: b2RevoluteJoint | b2PrismaticJoint;

  public joint2: b2RevoluteJoint | b2PrismaticJoint;

  public ratio: number = 1;

  constructor() {
    super(b2JointType.e_gearJoint);
  }
}

 class b2GearJoint extends b2Joint {
  public m_joint1: b2RevoluteJoint | b2PrismaticJoint;
  public m_joint2: b2RevoluteJoint | b2PrismaticJoint;

  public m_typeA: b2JointType = b2JointType.e_unknownJoint;
  public m_typeB: b2JointType = b2JointType.e_unknownJoint;

  // Body A is connected to body C
  // Body B is connected to body D
  public m_bodyC: b2Body;
  public m_bodyD: b2Body;

  // Solver shared
  public  m_localAnchorA: b2Vec2 = new b2Vec2();
  public  m_localAnchorB: b2Vec2 = new b2Vec2();
  public  m_localAnchorC: b2Vec2 = new b2Vec2();
  public  m_localAnchorD: b2Vec2 = new b2Vec2();

  public  m_localAxisC: b2Vec2 = new b2Vec2();
  public  m_localAxisD: b2Vec2 = new b2Vec2();

  public m_referenceAngleA: number = 0;
  public m_referenceAngleB: number = 0;

  public m_constant: number = 0;
  public m_ratio: number = 0;

  public m_impulse: number = 0;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public m_indexC: number = 0;
  public m_indexD: number = 0;
  public  m_lcA: b2Vec2 = new b2Vec2();
  public  m_lcB: b2Vec2 = new b2Vec2();
  public  m_lcC: b2Vec2 = new b2Vec2();
  public  m_lcD: b2Vec2 = new b2Vec2();
  public m_mA: number = 0;
  public m_mB: number = 0;
  public m_mC: number = 0;
  public m_mD: number = 0;
  public m_iA: number = 0;
  public m_iB: number = 0;
  public m_iC: number = 0;
  public m_iD: number = 0;
  public  m_JvAC: b2Vec2 = new b2Vec2();
  public  m_JvBD: b2Vec2 = new b2Vec2();
  public m_JwA: number = 0;
  public m_JwB: number = 0;
  public m_JwC: number = 0;
  public m_JwD: number = 0;
  public m_mass: number = 0;

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_qC: b2Rot = new b2Rot();
  public  m_qD: b2Rot = new b2Rot();
  public  m_lalcA: b2Vec2 = new b2Vec2();
  public  m_lalcB: b2Vec2 = new b2Vec2();
  public  m_lalcC: b2Vec2 = new b2Vec2();
  public  m_lalcD: b2Vec2 = new b2Vec2();

  constructor(def: b2IGearJointDef) {
    super(def);

    this.m_joint1 = def.joint1;
    this.m_joint2 = def.joint2;

    this.m_typeA = this.m_joint1.GetType();
    this.m_typeB = this.m_joint2.GetType();

    // DEBUG: b2Assert(this.m_typeA === b2JointType.e_revoluteJoint || this.m_typeA === b2JointType.e_prismaticJoint);
    // DEBUG: b2Assert(this.m_typeB === b2JointType.e_revoluteJoint || this.m_typeB === b2JointType.e_prismaticJoint);

    let coordinateA: number, coordinateB: number;

    // TODO_ERIN there might be some problem with the joint edges in b2Joint.

    this.m_bodyC = this.m_joint1.GetBodyA();
    this.m_bodyA = this.m_joint1.GetBodyB();

    // Body B on joint1 must be dynamic
    // b2Assert(this.m_bodyA.m_type === b2_dynamicBody);

    // Get geometry of joint1
    const xfA: b2Transform = this.m_bodyA.m_xf;
    const aA: number = this.m_bodyA.m_sweep.a;
    const xfC: b2Transform = this.m_bodyC.m_xf;
    const aC: number = this.m_bodyC.m_sweep.a;

    if (this.m_typeA === b2JointType.e_revoluteJoint) {
      const revolute: b2RevoluteJoint = def.joint1 as b2RevoluteJoint;
      this.m_localAnchorC.Copy(revolute.m_localAnchorA);
      this.m_localAnchorA.Copy(revolute.m_localAnchorB);
      this.m_referenceAngleA = revolute.m_referenceAngle;
      this.m_localAxisC.SetZero();

      coordinateA = aA - aC - this.m_referenceAngleA;
    } else {
      const prismatic: b2PrismaticJoint = def.joint1 as b2PrismaticJoint;
      this.m_localAnchorC.Copy(prismatic.m_localAnchorA);
      this.m_localAnchorA.Copy(prismatic.m_localAnchorB);
      this.m_referenceAngleA = prismatic.m_referenceAngle;
      this.m_localAxisC.Copy(prismatic.m_localXAxisA);

      // b2Vec2 pC = m_localAnchorC;
      const pC = this.m_localAnchorC;
      // b2Vec2 pA = b2MulT(xfC.q, b2Mul(xfA.q, m_localAnchorA) + (xfA.p - xfC.p));
      const pA: b2Vec2 = b2Rot.MulTRV(
        xfC.q,
        b2Vec2.AddVV(
          b2Rot.MulRV(xfA.q, this.m_localAnchorA, b2Vec2.s_t0),
          b2Vec2.SubVV(xfA.p, xfC.p, b2Vec2.s_t1),
          b2Vec2.s_t0),
        b2Vec2.s_t0); // pA uses s_t0
      // coordinateA = b2Dot(pA - pC, m_localAxisC);
      coordinateA = b2Vec2.DotVV(b2Vec2.SubVV(pA, pC, b2Vec2.s_t0), this.m_localAxisC);
    }

    this.m_bodyD = this.m_joint2.GetBodyA();
    this.m_bodyB = this.m_joint2.GetBodyB();

    // Body B on joint2 must be dynamic
    // b2Assert(this.m_bodyB.m_type === b2_dynamicBody);

    // Get geometry of joint2
    const xfB: b2Transform = this.m_bodyB.m_xf;
    const aB: number = this.m_bodyB.m_sweep.a;
    const xfD: b2Transform = this.m_bodyD.m_xf;
    const aD: number = this.m_bodyD.m_sweep.a;

    if (this.m_typeB === b2JointType.e_revoluteJoint) {
      const revolute: b2RevoluteJoint = def.joint2 as b2RevoluteJoint;
      this.m_localAnchorD.Copy(revolute.m_localAnchorA);
      this.m_localAnchorB.Copy(revolute.m_localAnchorB);
      this.m_referenceAngleB = revolute.m_referenceAngle;
      this.m_localAxisD.SetZero();

      coordinateB = aB - aD - this.m_referenceAngleB;
    } else {
      const prismatic: b2PrismaticJoint = def.joint2 as b2PrismaticJoint;
      this.m_localAnchorD.Copy(prismatic.m_localAnchorA);
      this.m_localAnchorB.Copy(prismatic.m_localAnchorB);
      this.m_referenceAngleB = prismatic.m_referenceAngle;
      this.m_localAxisD.Copy(prismatic.m_localXAxisA);

      // b2Vec2 pD = m_localAnchorD;
      const pD = this.m_localAnchorD;
      // b2Vec2 pB = b2MulT(xfD.q, b2Mul(xfB.q, m_localAnchorB) + (xfB.p - xfD.p));
      const pB: b2Vec2 = b2Rot.MulTRV(
        xfD.q,
        b2Vec2.AddVV(
          b2Rot.MulRV(xfB.q, this.m_localAnchorB, b2Vec2.s_t0),
          b2Vec2.SubVV(xfB.p, xfD.p, b2Vec2.s_t1),
          b2Vec2.s_t0),
        b2Vec2.s_t0); // pB uses s_t0
      // coordinateB = b2Dot(pB - pD, m_localAxisD);
      coordinateB = b2Vec2.DotVV(b2Vec2.SubVV(pB, pD, b2Vec2.s_t0), this.m_localAxisD);
    }

    this.m_ratio = b2Maybe(def.ratio, 1);

    this.m_constant = coordinateA + this.m_ratio * coordinateB;

    this.m_impulse = 0;
  }

  private static InitVelocityConstraints_s_u = new b2Vec2();
  private static InitVelocityConstraints_s_rA = new b2Vec2();
  private static InitVelocityConstraints_s_rB = new b2Vec2();
  private static InitVelocityConstraints_s_rC = new b2Vec2();
  private static InitVelocityConstraints_s_rD = new b2Vec2();
  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_indexC = this.m_bodyC.m_islandIndex;
    this.m_indexD = this.m_bodyD.m_islandIndex;
    this.m_lcA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_lcB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_lcC.Copy(this.m_bodyC.m_sweep.localCenter);
    this.m_lcD.Copy(this.m_bodyD.m_sweep.localCenter);
    this.m_mA = this.m_bodyA.m_invMass;
    this.m_mB = this.m_bodyB.m_invMass;
    this.m_mC = this.m_bodyC.m_invMass;
    this.m_mD = this.m_bodyD.m_invMass;
    this.m_iA = this.m_bodyA.m_invI;
    this.m_iB = this.m_bodyB.m_invI;
    this.m_iC = this.m_bodyC.m_invI;
    this.m_iD = this.m_bodyD.m_invI;

    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const aC: number = data.positions[this.m_indexC].a;
    const vC: b2Vec2 = data.velocities[this.m_indexC].v;
    let wC: number = data.velocities[this.m_indexC].w;

    const aD: number = data.positions[this.m_indexD].a;
    const vD: b2Vec2 = data.velocities[this.m_indexD].v;
    let wD: number = data.velocities[this.m_indexD].w;

    // b2Rot qA(aA), qB(aB), qC(aC), qD(aD);
    const qA: b2Rot = this.m_qA.SetAngle(aA),
      qB: b2Rot = this.m_qB.SetAngle(aB),
      qC: b2Rot = this.m_qC.SetAngle(aC),
      qD: b2Rot = this.m_qD.SetAngle(aD);

    this.m_mass = 0;

    if (this.m_typeA === b2JointType.e_revoluteJoint) {
      this.m_JvAC.SetZero();
      this.m_JwA = 1;
      this.m_JwC = 1;
      this.m_mass += this.m_iA + this.m_iC;
    } else {
      // b2Vec2 u = b2Mul(qC, m_localAxisC);
      const u: b2Vec2 = b2Rot.MulRV(qC, this.m_localAxisC, b2GearJoint.InitVelocityConstraints_s_u);
      // b2Vec2 rC = b2Mul(qC, m_localAnchorC - m_lcC);
      b2Vec2.SubVV(this.m_localAnchorC, this.m_lcC, this.m_lalcC);
      const rC: b2Vec2 = b2Rot.MulRV(qC, this.m_lalcC, b2GearJoint.InitVelocityConstraints_s_rC);
      // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_lcA);
      b2Vec2.SubVV(this.m_localAnchorA, this.m_lcA, this.m_lalcA);
      const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, b2GearJoint.InitVelocityConstraints_s_rA);
      // m_JvAC = u;
      this.m_JvAC.Copy(u);
      // m_JwC = b2Cross(rC, u);
      this.m_JwC = b2Vec2.CrossVV(rC, u);
      // m_JwA = b2Cross(rA, u);
      this.m_JwA = b2Vec2.CrossVV(rA, u);
      this.m_mass += this.m_mC + this.m_mA + this.m_iC * this.m_JwC * this.m_JwC + this.m_iA * this.m_JwA * this.m_JwA;
    }

    if (this.m_typeB === b2JointType.e_revoluteJoint) {
      this.m_JvBD.SetZero();
      this.m_JwB = this.m_ratio;
      this.m_JwD = this.m_ratio;
      this.m_mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
    } else {
      // b2Vec2 u = b2Mul(qD, m_localAxisD);
      const u: b2Vec2 = b2Rot.MulRV(qD, this.m_localAxisD, b2GearJoint.InitVelocityConstraints_s_u);
      // b2Vec2 rD = b2Mul(qD, m_localAnchorD - m_lcD);
      b2Vec2.SubVV(this.m_localAnchorD, this.m_lcD, this.m_lalcD);
      const rD: b2Vec2 = b2Rot.MulRV(qD, this.m_lalcD, b2GearJoint.InitVelocityConstraints_s_rD);
      // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_lcB);
      b2Vec2.SubVV(this.m_localAnchorB, this.m_lcB, this.m_lalcB);
      const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, b2GearJoint.InitVelocityConstraints_s_rB);
      // m_JvBD = m_ratio * u;
      b2Vec2.MulSV(this.m_ratio, u, this.m_JvBD);
      // m_JwD = m_ratio * b2Cross(rD, u);
      this.m_JwD = this.m_ratio * b2Vec2.CrossVV(rD, u);
      // m_JwB = m_ratio * b2Cross(rB, u);
      this.m_JwB = this.m_ratio * b2Vec2.CrossVV(rB, u);
      this.m_mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * this.m_JwD * this.m_JwD + this.m_iB * this.m_JwB * this.m_JwB;
    }

    // Compute effective mass.
    this.m_mass = this.m_mass > 0 ? 1 / this.m_mass : 0;

    if (data.step.warmStarting) {
      // vA += (m_mA * m_impulse) * m_JvAC;
      vA.SelfMulAdd(this.m_mA * this.m_impulse, this.m_JvAC);
      wA += this.m_iA * this.m_impulse * this.m_JwA;
      // vB += (m_mB * m_impulse) * m_JvBD;
      vB.SelfMulAdd(this.m_mB * this.m_impulse, this.m_JvBD);
      wB += this.m_iB * this.m_impulse * this.m_JwB;
      // vC -= (m_mC * m_impulse) * m_JvAC;
      vC.SelfMulSub(this.m_mC * this.m_impulse, this.m_JvAC);
      wC -= this.m_iC * this.m_impulse * this.m_JwC;
      // vD -= (m_mD * m_impulse) * m_JvBD;
      vD.SelfMulSub(this.m_mD * this.m_impulse, this.m_JvBD);
      wD -= this.m_iD * this.m_impulse * this.m_JwD;
    } else {
      this.m_impulse = 0;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
    // data.velocities[this.m_indexC].v = vC;
    data.velocities[this.m_indexC].w = wC;
    // data.velocities[this.m_indexD].v = vD;
    data.velocities[this.m_indexD].w = wD;
  }

  public SolveVelocityConstraints(data: b2SolverData): void {
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;
    const vC: b2Vec2 = data.velocities[this.m_indexC].v;
    let wC: number = data.velocities[this.m_indexC].w;
    const vD: b2Vec2 = data.velocities[this.m_indexD].v;
    let wD: number = data.velocities[this.m_indexD].w;

    // float32 Cdot = b2Dot(m_JvAC, vA - vC) + b2Dot(m_JvBD, vB - vD);
    let Cdot =
      b2Vec2.DotVV(this.m_JvAC, b2Vec2.SubVV(vA, vC, b2Vec2.s_t0)) +
      b2Vec2.DotVV(this.m_JvBD, b2Vec2.SubVV(vB, vD, b2Vec2.s_t0));
    Cdot += (this.m_JwA * wA - this.m_JwC * wC) + (this.m_JwB * wB - this.m_JwD * wD);

    const impulse: number = -this.m_mass * Cdot;
    this.m_impulse += impulse;

    // vA += (m_mA * impulse) * m_JvAC;
    vA.SelfMulAdd((this.m_mA * impulse), this.m_JvAC);
    wA += this.m_iA * impulse * this.m_JwA;
    // vB += (m_mB * impulse) * m_JvBD;
    vB.SelfMulAdd((this.m_mB * impulse), this.m_JvBD);
    wB += this.m_iB * impulse * this.m_JwB;
    // vC -= (m_mC * impulse) * m_JvAC;
    vC.SelfMulSub((this.m_mC * impulse), this.m_JvAC);
    wC -= this.m_iC * impulse * this.m_JwC;
    // vD -= (m_mD * impulse) * m_JvBD;
    vD.SelfMulSub((this.m_mD * impulse), this.m_JvBD);
    wD -= this.m_iD * impulse * this.m_JwD;

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
    // data.velocities[this.m_indexC].v = vC;
    data.velocities[this.m_indexC].w = wC;
    // data.velocities[this.m_indexD].v = vD;
    data.velocities[this.m_indexD].w = wD;
  }

  private static SolvePositionConstraints_s_u = new b2Vec2();
  private static SolvePositionConstraints_s_rA = new b2Vec2();
  private static SolvePositionConstraints_s_rB = new b2Vec2();
  private static SolvePositionConstraints_s_rC = new b2Vec2();
  private static SolvePositionConstraints_s_rD = new b2Vec2();
  public SolvePositionConstraints(data: b2SolverData): boolean {
    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    let aA: number = data.positions[this.m_indexA].a;
    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    let aB: number = data.positions[this.m_indexB].a;
    const cC: b2Vec2 = data.positions[this.m_indexC].c;
    let aC: number = data.positions[this.m_indexC].a;
    const cD: b2Vec2 = data.positions[this.m_indexD].c;
    let aD: number = data.positions[this.m_indexD].a;

    // b2Rot qA(aA), qB(aB), qC(aC), qD(aD);
    const qA: b2Rot = this.m_qA.SetAngle(aA),
      qB: b2Rot = this.m_qB.SetAngle(aB),
      qC: b2Rot = this.m_qC.SetAngle(aC),
      qD: b2Rot = this.m_qD.SetAngle(aD);

    const linearError: number = 0;

    let coordinateA: number, coordinateB: number;

    const JvAC: b2Vec2 = this.m_JvAC, JvBD: b2Vec2 = this.m_JvBD;
    let JwA: number, JwB: number, JwC: number, JwD: number;
    let mass: number = 0;

    if (this.m_typeA === b2JointType.e_revoluteJoint) {
      JvAC.SetZero();
      JwA = 1;
      JwC = 1;
      mass += this.m_iA + this.m_iC;

      coordinateA = aA - aC - this.m_referenceAngleA;
    } else {
      // b2Vec2 u = b2Mul(qC, m_localAxisC);
      const u: b2Vec2 = b2Rot.MulRV(qC, this.m_localAxisC, b2GearJoint.SolvePositionConstraints_s_u);
      // b2Vec2 rC = b2Mul(qC, m_localAnchorC - m_lcC);
      const rC: b2Vec2 = b2Rot.MulRV(qC, this.m_lalcC, b2GearJoint.SolvePositionConstraints_s_rC);
      // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_lcA);
      const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, b2GearJoint.SolvePositionConstraints_s_rA);
      // JvAC = u;
      JvAC.Copy(u);
      // JwC = b2Cross(rC, u);
      JwC = b2Vec2.CrossVV(rC, u);
      // JwA = b2Cross(rA, u);
      JwA = b2Vec2.CrossVV(rA, u);
      mass += this.m_mC + this.m_mA + this.m_iC * JwC * JwC + this.m_iA * JwA * JwA;

      // b2Vec2 pC = m_localAnchorC - m_lcC;
      const pC = this.m_lalcC;
      // b2Vec2 pA = b2MulT(qC, rA + (cA - cC));
      const pA: b2Vec2 = b2Rot.MulTRV(
        qC,
        b2Vec2.AddVV(
          rA,
          b2Vec2.SubVV(cA, cC, b2Vec2.s_t0),
          b2Vec2.s_t0),
        b2Vec2.s_t0); // pA uses s_t0
      // coordinateA = b2Dot(pA - pC, m_localAxisC);
      coordinateA = b2Vec2.DotVV(b2Vec2.SubVV(pA, pC, b2Vec2.s_t0), this.m_localAxisC);
    }

    if (this.m_typeB === b2JointType.e_revoluteJoint) {
      JvBD.SetZero();
      JwB = this.m_ratio;
      JwD = this.m_ratio;
      mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);

      coordinateB = aB - aD - this.m_referenceAngleB;
    } else {
      // b2Vec2 u = b2Mul(qD, m_localAxisD);
      const u: b2Vec2 = b2Rot.MulRV(qD, this.m_localAxisD, b2GearJoint.SolvePositionConstraints_s_u);
      // b2Vec2 rD = b2Mul(qD, m_localAnchorD - m_lcD);
      const rD: b2Vec2 = b2Rot.MulRV(qD, this.m_lalcD, b2GearJoint.SolvePositionConstraints_s_rD);
      // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_lcB);
      const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, b2GearJoint.SolvePositionConstraints_s_rB);
      // JvBD = m_ratio * u;
      b2Vec2.MulSV(this.m_ratio, u, JvBD);
      // JwD = m_ratio * b2Cross(rD, u);
      JwD = this.m_ratio * b2Vec2.CrossVV(rD, u);
      // JwB = m_ratio * b2Cross(rB, u);
      JwB = this.m_ratio * b2Vec2.CrossVV(rB, u);
      mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * JwD * JwD + this.m_iB * JwB * JwB;

      // b2Vec2 pD = m_localAnchorD - m_lcD;
      const pD = this.m_lalcD;
      // b2Vec2 pB = b2MulT(qD, rB + (cB - cD));
      const pB: b2Vec2 = b2Rot.MulTRV(
        qD,
        b2Vec2.AddVV(
          rB,
          b2Vec2.SubVV(cB, cD, b2Vec2.s_t0),
          b2Vec2.s_t0),
        b2Vec2.s_t0); // pB uses s_t0
      // coordinateB = b2Dot(pB - pD, m_localAxisD);
      coordinateB = b2Vec2.DotVV(b2Vec2.SubVV(pB, pD, b2Vec2.s_t0), this.m_localAxisD);
    }

    const C: number = (coordinateA + this.m_ratio * coordinateB) - this.m_constant;

    let impulse: number = 0;
    if (mass > 0) {
      impulse = -C / mass;
    }

    // cA += m_mA * impulse * JvAC;
    cA.SelfMulAdd(this.m_mA * impulse, JvAC);
    aA += this.m_iA * impulse * JwA;
    // cB += m_mB * impulse * JvBD;
    cB.SelfMulAdd(this.m_mB * impulse, JvBD);
    aB += this.m_iB * impulse * JwB;
    // cC -= m_mC * impulse * JvAC;
    cC.SelfMulSub(this.m_mC * impulse, JvAC);
    aC -= this.m_iC * impulse * JwC;
    // cD -= m_mD * impulse * JvBD;
    cD.SelfMulSub(this.m_mD * impulse, JvBD);
    aD -= this.m_iD * impulse * JwD;

    // data.positions[this.m_indexA].c = cA;
    data.positions[this.m_indexA].a = aA;
    // data.positions[this.m_indexB].c = cB;
    data.positions[this.m_indexB].a = aB;
    // data.positions[this.m_indexC].c = cC;
    data.positions[this.m_indexC].a = aC;
    // data.positions[this.m_indexD].c = cD;
    data.positions[this.m_indexD].a = aD;

    // TODO_ERIN not implemented
    return linearError < b2_linearSlop;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    // b2Vec2 P = m_impulse * m_JvAC;
    // return inv_dt * P;
    return b2Vec2.MulSV(inv_dt * this.m_impulse, this.m_JvAC, out);
  }

  public GetReactionTorque(inv_dt: number): number {
    // float32 L = m_impulse * m_JwA;
    // return inv_dt * L;
    return inv_dt * this.m_impulse * this.m_JwA;
  }

  public GetJoint1() { return this.m_joint1; }

  public GetJoint2() { return this.m_joint2; }

  public GetRatio() {
    return this.m_ratio;
  }

  public SetRatio(ratio: number): void {
    // DEBUG: b2Assert(b2IsValid(ratio));
    this.m_ratio = ratio;
  }

  public Dump(log: (format: string, ...args: any[]) => void) {
    const indexA = this.m_bodyA.m_islandIndex;
    const indexB = this.m_bodyB.m_islandIndex;

    const index1 = this.m_joint1.m_index;
    const index2 = this.m_joint2.m_index;

    log("  const jd: b2GearJointDef = new b2GearJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
    log("  jd.joint1 = joints[%d];\n", index1);
    log("  jd.joint2 = joints[%d];\n", index2);
    log("  jd.ratio = %.15f;\n", this.m_ratio);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 














/*
Position Correction Notes
=========================
I tried the several algorithms for position correction of the 2D revolute joint.
I looked at these systems:
- simple pendulum (1m diameter sphere on massless 5m stick) with initial angular velocity of 100 rad/s.
- suspension bridge with 30 1m long planks of length 1m.
- multi-link chain with 30 1m long links.

Here are the algorithms:

Baumgarte - A fraction of the position error is added to the velocity error. There is no
separate position solver.

Pseudo Velocities - After the velocity solver and position integration,
the position error, Jacobian, and effective mass are recomputed. Then
the velocity constraints are solved with pseudo velocities and a fraction
of the position error is added to the pseudo velocity error. The pseudo
velocities are initialized to zero and there is no warm-starting. After
the position solver, the pseudo velocities are added to the positions.
This is also called the First Order World method or the Position LCP method.

Modified Nonlinear Gauss-Seidel (NGS) - Like Pseudo Velocities except the
position error is re-computed for each constraint and the positions are updated
after the constraint is solved. The radius vectors (aka Jacobians) are
re-computed too (otherwise the algorithm has horrible instability). The pseudo
velocity states are not needed because they are effectively zero at the beginning
of each iteration. Since we have the current position error, we allow the
iterations to terminate early if the error becomes smaller than b2_linearSlop.

Full NGS or just NGS - Like Modified NGS except the effective mass are re-computed
each time a constraint is solved.

Here are the results:
Baumgarte - this is the cheapest algorithm but it has some stability problems,
especially with the bridge. The chain links separate easily close to the root
and they jitter as they struggle to pull together. This is one of the most common
methods in the field. The big drawback is that the position correction artificially
affects the momentum, thus leading to instabilities and false bounce. I used a
bias factor of 0.2. A larger bias factor makes the bridge less stable, a smaller
factor makes joints and contacts more spongy.

Pseudo Velocities - the is more stable than the Baumgarte method. The bridge is
stable. However, joints still separate with large angular velocities. Drag the
simple pendulum in a circle quickly and the joint will separate. The chain separates
easily and does not recover. I used a bias factor of 0.2. A larger value lead to
the bridge collapsing when a heavy cube drops on it.

Modified NGS - this algorithm is better in some ways than Baumgarte and Pseudo
Velocities, but in other ways it is worse. The bridge and chain are much more
stable, but the simple pendulum goes unstable at high angular velocities.

Full NGS - stable in all tests. The joints display good stiffness. The bridge
still sags, but this is better than infinite forces.

Recommendations
Pseudo Velocities are not really worthwhile because the bridge and chain cannot
recover from joint separation. In other cases the benefit over Baumgarte is small.

Modified NGS is not a robust method for the revolute joint due to the violent
instability seen in the simple pendulum. Perhaps it is viable with other constraint
types, especially scalar constraints where the effective mass is a scalar.

This leaves Baumgarte and Full NGS. Baumgarte has small, but manageable instabilities
and is very fast. I don't think we can escape Baumgarte, especially in highly
demanding cases where high constraint fidelity is not needed.

Full NGS is robust and easy on the eyes. I recommend this as an option for
higher fidelity simulation and certainly for suspension bridges and long chains.
Full NGS might be a good choice for ragdolls, especially motorized ragdolls where
joint separation can be problematic. The number of NGS iterations can be reduced
for better performance without harming robustness much.

Each joint in a can be handled differently in the position solver. So I recommend
a system where the user can select the algorithm on a per joint basis. I would
probably default to the slower Full NGS and let the user select the faster
Baumgarte method in performance critical scenarios.
*/

/*
Cache Performance

The Box2D solvers are dominated by cache misses. Data structures are designed
to increase the number of cache hits. Much of misses are due to random access
to body data. The constraint structures are iterated over linearly, which leads
to few cache misses.

The bodies are not accessed during iteration. Instead read only data, such as
the mass values are stored with the constraints. The mutable data are the constraint
impulses and the bodies velocities/positions. The impulses are held inside the
constraint structures. The body velocities/positions are held in compact, temporary
arrays to increase the number of cache hits. Linear and angular velocity are
stored in a single array since multiple arrays lead to multiple misses.
*/

/*
2D Rotation

R = [cos(theta) -sin(theta)]
    [sin(theta) cos(theta) ]

thetaDot = omega

Let q1 = cos(theta), q2 = sin(theta).
R = [q1 -q2]
    [q2  q1]

q1Dot = -thetaDot * q2
q2Dot = thetaDot * q1

q1_new = q1_old - dt * w * q2
q2_new = q2_old + dt * w * q1
then normalize.

This might be faster than computing sin+cos.
However, we can compute sin+cos of the same angle fast.
*/

 class b2Island {
  public m_listener: b2ContactListener;

  public  m_bodies: b2Body[] = [/*1024*/]; // TODO: b2Settings
  public  m_contacts: b2Contact[] = [/*1024*/]; // TODO: b2Settings
  public  m_joints: b2Joint[] = [/*1024*/]; // TODO: b2Settings

  public  m_positions: b2Position[] = b2Position.MakeArray(1024); // TODO: b2Settings
  public  m_velocities: b2Velocity[] = b2Velocity.MakeArray(1024); // TODO: b2Settings

  public m_bodyCount: number = 0;
  public m_jointCount: number = 0;
  public m_contactCount: number = 0;

  public m_bodyCapacity: number = 0;
  public m_contactCapacity: number = 0;
  public m_jointCapacity: number = 0;

  public Initialize(bodyCapacity: number, contactCapacity: number, jointCapacity: number, listener: b2ContactListener): void {
    this.m_bodyCapacity = bodyCapacity;
    this.m_contactCapacity = contactCapacity;
    this.m_jointCapacity = jointCapacity;
    this.m_bodyCount = 0;
    this.m_contactCount = 0;
    this.m_jointCount = 0;

    this.m_listener = listener;

    // TODO:
    // while (this.m_bodies.length < bodyCapacity) {
    //   this.m_bodies[this.m_bodies.length] = null;
    // }
    // TODO:
    // while (this.m_contacts.length < contactCapacity) {
    //   this.m_contacts[this.m_contacts.length] = null;
    // }
    // TODO:
    // while (this.m_joints.length < jointCapacity) {
    //   this.m_joints[this.m_joints.length] = null;
    // }

    // TODO:
    if (this.m_positions.length < bodyCapacity) {
      const new_length = b2Max(this.m_positions.length * 2, bodyCapacity);
      while (this.m_positions.length < new_length) {
        this.m_positions[this.m_positions.length] = new b2Position();
      }
    }
    // TODO:
    if (this.m_velocities.length < bodyCapacity) {
      const new_length = b2Max(this.m_velocities.length * 2, bodyCapacity);
      while (this.m_velocities.length < new_length) {
        this.m_velocities[this.m_velocities.length] = new b2Velocity();
      }
    }
  }

  public Clear(): void {
    this.m_bodyCount = 0;
    this.m_contactCount = 0;
    this.m_jointCount = 0;
  }

  public AddBody(body: b2Body): void {
    // DEBUG: b2Assert(this.m_bodyCount < this.m_bodyCapacity);
    body.m_islandIndex = this.m_bodyCount;
    this.m_bodies[this.m_bodyCount++] = body;
  }

  public AddContact(contact: b2Contact): void {
    // DEBUG: b2Assert(this.m_contactCount < this.m_contactCapacity);
    this.m_contacts[this.m_contactCount++] = contact;
  }

  public AddJoint(joint: b2Joint): void {
    // DEBUG: b2Assert(this.m_jointCount < this.m_jointCapacity);
    this.m_joints[this.m_jointCount++] = joint;
  }

  private static s_timer = new b2Timer();
  private static s_solverData = new b2SolverData();
  private static s_contactSolverDef = new b2ContactSolverDef();
  private static s_contactSolver = new b2ContactSolver();
  private static s_translation = new b2Vec2();
  public Solve(profile: b2Profile, step: b2TimeStep, gravity: b2Vec2, allowSleep: boolean): void {
    const timer: b2Timer = b2Island.s_timer.Reset();

    const h: number = step.dt;

    // Integrate velocities and apply damping. Initialize the body state.
    for (let i: number = 0; i < this.m_bodyCount; ++i) {
      const b: b2Body = this.m_bodies[i];

      // const c: b2Vec2 =
      this.m_positions[i].c.Copy(b.m_sweep.c);
      const a: number = b.m_sweep.a;
      const v: b2Vec2 = this.m_velocities[i].v.Copy(b.m_linearVelocity);
      let w: number = b.m_angularVelocity;

      // Store positions for continuous collision.
      b.m_sweep.c0.Copy(b.m_sweep.c);
      b.m_sweep.a0 = b.m_sweep.a;

      if (b.m_type === b2BodyType.b2_dynamicBody) {
        // Integrate velocities.
        // v += h * b->m_invMass * (b->m_gravityScale * b->m_mass * gravity + b->m_force);
        v.x += h * b.m_invMass * (b.m_gravityScale * b.m_mass * gravity.x + b.m_force.x);
        v.y += h * b.m_invMass * (b.m_gravityScale * b.m_mass * gravity.y + b.m_force.y);
        w += h * b.m_invI * b.m_torque;

        // Apply damping.
        // ODE: dv/dt + c * v = 0
        // Solution: v(t) = v0 * exp(-c * t)
        // Time step: v(t + dt) = v0 * exp(-c * (t + dt)) = v0 * exp(-c * t) * exp(-c * dt) = v * exp(-c * dt)
        // v2 = exp(-c * dt) * v1
        // Pade approximation:
        // v2 = v1 * 1 / (1 + c * dt)
        v.SelfMul(1.0 / (1.0 + h * b.m_linearDamping));
        w *= 1.0 / (1.0 + h * b.m_angularDamping);
      }

      // this.m_positions[i].c = c;
      this.m_positions[i].a = a;
      // this.m_velocities[i].v = v;
      this.m_velocities[i].w = w;
    }

    timer.Reset();

    // Solver data
    const solverData: b2SolverData = b2Island.s_solverData;
    solverData.step.Copy(step);
    solverData.positions = this.m_positions;
    solverData.velocities = this.m_velocities;

    // Initialize velocity constraints.
    const contactSolverDef: b2ContactSolverDef = b2Island.s_contactSolverDef;
    contactSolverDef.step.Copy(step);
    contactSolverDef.contacts = this.m_contacts;
    contactSolverDef.count = this.m_contactCount;
    contactSolverDef.positions = this.m_positions;
    contactSolverDef.velocities = this.m_velocities;

    const contactSolver: b2ContactSolver = b2Island.s_contactSolver.Initialize(contactSolverDef);
    contactSolver.InitializeVelocityConstraints();

    if (step.warmStarting) {
      contactSolver.WarmStart();
    }

    for (let i: number = 0; i < this.m_jointCount; ++i) {
      this.m_joints[i].InitVelocityConstraints(solverData);
    }

    profile.solveInit = timer.GetMilliseconds();

    // Solve velocity constraints.
    timer.Reset();
    for (let i: number = 0; i < step.velocityIterations; ++i) {
      for (let j: number = 0; j < this.m_jointCount; ++j) {
        this.m_joints[j].SolveVelocityConstraints(solverData);
      }

      contactSolver.SolveVelocityConstraints();
    }

    // Store impulses for warm starting
    contactSolver.StoreImpulses();
    profile.solveVelocity = timer.GetMilliseconds();

    // Integrate positions.
    for (let i: number = 0; i < this.m_bodyCount; ++i) {
      const c: b2Vec2 = this.m_positions[i].c;
      let a: number = this.m_positions[i].a;
      const v: b2Vec2 = this.m_velocities[i].v;
      let w: number = this.m_velocities[i].w;

      // Check for large velocities
      const translation: b2Vec2 = b2Vec2.MulSV(h, v, b2Island.s_translation);
      if (b2Vec2.DotVV(translation, translation) > b2_maxTranslationSquared) {
        const ratio: number = b2_maxTranslation / translation.Length();
        v.SelfMul(ratio);
      }

      const rotation: number = h * w;
      if (rotation * rotation > b2_maxRotationSquared) {
        const ratio: number = b2_maxRotation / b2Abs(rotation);
        w *= ratio;
      }

      // Integrate
      c.x += h * v.x;
      c.y += h * v.y;
      a += h * w;

      // this.m_positions[i].c = c;
      this.m_positions[i].a = a;
      // this.m_velocities[i].v = v;
      this.m_velocities[i].w = w;
    }

    // Solve position constraints
    timer.Reset();
    let positionSolved: boolean = false;
    for (let i: number = 0; i < step.positionIterations; ++i) {
      const contactsOkay: boolean = contactSolver.SolvePositionConstraints();

      let jointsOkay: boolean = true;
      for (let j: number = 0; j < this.m_jointCount; ++j) {
        const jointOkay: boolean = this.m_joints[j].SolvePositionConstraints(solverData);
        jointsOkay = jointsOkay && jointOkay;
      }

      if (contactsOkay && jointsOkay) {
        // Exit early if the position errors are small.
        positionSolved = true;
        break;
      }
    }

    // Copy state buffers back to the bodies
    for (let i: number = 0; i < this.m_bodyCount; ++i) {
      const body: b2Body = this.m_bodies[i];
      body.m_sweep.c.Copy(this.m_positions[i].c);
      body.m_sweep.a = this.m_positions[i].a;
      body.m_linearVelocity.Copy(this.m_velocities[i].v);
      body.m_angularVelocity = this.m_velocities[i].w;
      body.SynchronizeTransform();
    }

    profile.solvePosition = timer.GetMilliseconds();

    this.Report(contactSolver.m_velocityConstraints);

    if (allowSleep) {
      let minSleepTime: number = b2_maxFloat;

      const linTolSqr: number = b2_linearSleepTolerance * b2_linearSleepTolerance;
      const angTolSqr: number = b2_angularSleepTolerance * b2_angularSleepTolerance;

      for (let i: number = 0; i < this.m_bodyCount; ++i) {
        const b: b2Body = this.m_bodies[i];
        if (b.GetType() === b2BodyType.b2_staticBody) {
          continue;
        }

        if (!b.m_autoSleepFlag ||
          b.m_angularVelocity * b.m_angularVelocity > angTolSqr ||
          b2Vec2.DotVV(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
          b.m_sleepTime = 0;
          minSleepTime = 0;
        } else {
          b.m_sleepTime += h;
          minSleepTime = b2Min(minSleepTime, b.m_sleepTime);
        }
      }

      if (minSleepTime >= b2_timeToSleep && positionSolved) {
        for (let i: number = 0; i < this.m_bodyCount; ++i) {
          const b: b2Body = this.m_bodies[i];
          b.SetAwake(false);
        }
      }
    }
  }

  public SolveTOI(subStep: b2TimeStep, toiIndexA: number, toiIndexB: number): void {
    // DEBUG: b2Assert(toiIndexA < this.m_bodyCount);
    // DEBUG: b2Assert(toiIndexB < this.m_bodyCount);

    // Initialize the body state.
    for (let i: number = 0; i < this.m_bodyCount; ++i) {
      const b: b2Body = this.m_bodies[i];
      this.m_positions[i].c.Copy(b.m_sweep.c);
      this.m_positions[i].a = b.m_sweep.a;
      this.m_velocities[i].v.Copy(b.m_linearVelocity);
      this.m_velocities[i].w = b.m_angularVelocity;
    }

    const contactSolverDef: b2ContactSolverDef = b2Island.s_contactSolverDef;
    contactSolverDef.contacts = this.m_contacts;
    contactSolverDef.count = this.m_contactCount;
    contactSolverDef.step.Copy(subStep);
    contactSolverDef.positions = this.m_positions;
    contactSolverDef.velocities = this.m_velocities;
    const contactSolver: b2ContactSolver = b2Island.s_contactSolver.Initialize(contactSolverDef);

    // Solve position constraints.
    for (let i: number = 0; i < subStep.positionIterations; ++i) {
      const contactsOkay: boolean = contactSolver.SolveTOIPositionConstraints(toiIndexA, toiIndexB);
      if (contactsOkay) {
        break;
      }
    }

  /*
  #if 0
    // Is the new position really safe?
    for (int32 i = 0; i < this.m_contactCount; ++i) {
      b2Contact* c = this.m_contacts[i];
      b2Fixture* fA = c.GetFixtureA();
      b2Fixture* fB = c.GetFixtureB();

      b2Body* bA = fA.GetBody();
      b2Body* bB = fB.GetBody();

      int32 indexA = c.GetChildIndexA();
      int32 indexB = c.GetChildIndexB();

      b2DistanceInput input;
      input.proxyA.Set(fA.GetShape(), indexA);
      input.proxyB.Set(fB.GetShape(), indexB);
      input.transformA = bA.GetTransform();
      input.transformB = bB.GetTransform();
      input.useRadii = false;

      b2DistanceOutput output;
      b2SimplexCache cache;
      cache.count = 0;
      b2Distance(&output, &cache, &input);

      if (output.distance === 0 || cache.count === 3) {
        cache.count += 0;
      }
    }
  #endif
  */

    // Leap of faith to new safe state.
    this.m_bodies[toiIndexA].m_sweep.c0.Copy(this.m_positions[toiIndexA].c);
    this.m_bodies[toiIndexA].m_sweep.a0 = this.m_positions[toiIndexA].a;
    this.m_bodies[toiIndexB].m_sweep.c0.Copy(this.m_positions[toiIndexB].c);
    this.m_bodies[toiIndexB].m_sweep.a0 = this.m_positions[toiIndexB].a;

    // No warm starting is needed for TOI events because warm
    // starting impulses were applied in the discrete solver.
    contactSolver.InitializeVelocityConstraints();

    // Solve velocity constraints.
    for (let i: number = 0; i < subStep.velocityIterations; ++i) {
      contactSolver.SolveVelocityConstraints();
    }

    // Don't store the TOI contact forces for warm starting
    // because they can be quite large.

    const h: number = subStep.dt;

    // Integrate positions
    for (let i: number = 0; i < this.m_bodyCount; ++i) {
      const c: b2Vec2 = this.m_positions[i].c;
      let a: number = this.m_positions[i].a;
      const v: b2Vec2 = this.m_velocities[i].v;
      let w: number = this.m_velocities[i].w;

      // Check for large velocities
      const translation: b2Vec2 = b2Vec2.MulSV(h, v, b2Island.s_translation);
      if (b2Vec2.DotVV(translation, translation) > b2_maxTranslationSquared) {
        const ratio: number = b2_maxTranslation / translation.Length();
        v.SelfMul(ratio);
      }

      const rotation: number = h * w;
      if (rotation * rotation > b2_maxRotationSquared) {
        const ratio: number = b2_maxRotation / b2Abs(rotation);
        w *= ratio;
      }

      // Integrate
      c.SelfMulAdd(h, v);
      a += h * w;

      // this.m_positions[i].c = c;
      this.m_positions[i].a = a;
      // this.m_velocities[i].v = v;
      this.m_velocities[i].w = w;

      // Sync bodies
      const body: b2Body = this.m_bodies[i];
      body.m_sweep.c.Copy(c);
      body.m_sweep.a = a;
      body.m_linearVelocity.Copy(v);
      body.m_angularVelocity = w;
      body.SynchronizeTransform();
    }

    this.Report(contactSolver.m_velocityConstraints);
  }

  private static s_impulse = new b2ContactImpulse();
  public Report(constraints: b2ContactVelocityConstraint[]): void {
    if (this.m_listener === null) {
      return;
    }

    for (let i: number = 0; i < this.m_contactCount; ++i) {
      const c: b2Contact = this.m_contacts[i];

      if (!c) { continue; }

      const vc: b2ContactVelocityConstraint = constraints[i];

      const impulse: b2ContactImpulse = b2Island.s_impulse;
      impulse.count = vc.pointCount;
      for (let j: number = 0; j < vc.pointCount; ++j) {
        impulse.normalImpulses[j] = vc.points[j].normalImpulse;
        impulse.tangentImpulses[j] = vc.points[j].tangentImpulse;
      }

      this.m_listener.PostSolve(c, impulse);
    }
  }
}
/*
* Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 







 enum b2JointType {
  e_unknownJoint = 0,
  e_revoluteJoint = 1,
  e_prismaticJoint = 2,
  e_distanceJoint = 3,
  e_pulleyJoint = 4,
  e_mouseJoint = 5,
  e_gearJoint = 6,
  e_wheelJoint = 7,
  e_weldJoint = 8,
  e_frictionJoint = 9,
  e_ropeJoint = 10,
  e_motorJoint = 11,
  e_areaJoint = 12,
}

 class b2Jacobian {
  public  linear: b2Vec2 = new b2Vec2();
  public angularA: number = 0;
  public angularB: number = 0;

  public SetZero(): b2Jacobian {
    this.linear.SetZero();
    this.angularA = 0;
    this.angularB = 0;
    return this;
  }

  public Set(x: XY, a1: number, a2: number): b2Jacobian {
    this.linear.Copy(x);
    this.angularA = a1;
    this.angularB = a2;
    return this;
  }
}

/// A joint edge is used to connect bodies and joints together
/// in a joint graph where each body is a node and each joint
/// is an edge. A joint edge belongs to a doubly linked list
/// maintained in each attached body. Each joint has two joint
/// nodes, one for each attached body.
 class b2JointEdge {
  private _other: b2Body  = null; ///< provides quick access to the other body attached.
  public get other(): b2Body {
    if (this._other === null) { throw new Error(); }
    return this._other;
  }
  public set other(value: b2Body) {
    if (this._other !== null) { throw new Error(); }
    this._other = value;
  }
  public  joint: b2Joint;    ///< the joint
  public prev: b2JointEdge  = null;  ///< the previous joint edge in the body's joint list
  public next: b2JointEdge  = null;  ///< the next joint edge in the body's joint list
  constructor(joint: b2Joint) {
    this.joint = joint;
  }
  public Reset(): void {
    this._other = null;
    this.prev = null;
    this.next = null;
  }
}

/// Joint definitions are used to construct joints.
 interface b2IJointDef {
  /// The joint type is set automatically for concrete joint types.
  type: b2JointType;

  /// Use this to attach application specific data to your joints.
  userData?: any;

  /// The first attached body.
  bodyA: b2Body;

  /// The second attached body.
  bodyB: b2Body;

  /// Set this flag to true if the attached bodies should collide.
  collideConnected?: boolean;
}

/// Joint definitions are used to construct joints.
 abstract class b2JointDef implements b2IJointDef {
  /// The joint type is set automatically for concrete joint types.
  public  type: b2JointType = b2JointType.e_unknownJoint;

  /// Use this to attach application specific data to your joints.
  public userData: any = null;

  /// The first attached body.
  public bodyA: b2Body;

  /// The second attached body.
  public bodyB: b2Body;

  /// Set this flag to true if the attached bodies should collide.
  public collideConnected: boolean = false;

  constructor(type: b2JointType) {
    this.type = type;
  }
}

/// Utility to compute linear stiffness values from frequency and damping ratio
// void b2LinearStiffness(float& stiffness, float& damping,
// 	float frequencyHertz, float dampingRatio,
// 	const b2Body* bodyA, const b2Body* bodyB);
 function b2LinearStiffness(def: { stiffness: number, damping: number }, frequencyHertz: number, dampingRatio: number, bodyA: b2Body, bodyB: b2Body): void {
  const massA: number = bodyA.GetMass();
  const massB: number = bodyB.GetMass();
  let mass: number;
  if (massA > 0.0 && massB > 0.0) {
    mass = massA * massB / (massA + massB);
  } else if (massA > 0.0) {
    mass = massA;
  } else {
    mass = massB;
  }

  const omega: number = 2.0 * b2_pi * frequencyHertz;
  def.stiffness = mass * omega * omega;
  def.damping = 2.0 * mass * dampingRatio * omega;
}

/// Utility to compute rotational stiffness values frequency and damping ratio
// void b2AngularStiffness(float& stiffness, float& damping,
// 	float frequencyHertz, float dampingRatio,
// 	const b2Body* bodyA, const b2Body* bodyB);
 function b2AngularStiffness(def: { stiffness: number, damping: number }, frequencyHertz: number, dampingRatio: number, bodyA: b2Body, bodyB: b2Body): void {
  const IA: number = bodyA.GetInertia();
  const IB: number = bodyB.GetInertia();
  let I: number;
  if (IA > 0.0 && IB > 0.0) {
    I = IA * IB / (IA + IB);
  } else if (IA > 0.0) {
    I = IA;
  } else {
    I = IB;
  }

  const omega: number = 2.0 * b2_pi * frequencyHertz;
  def.stiffness = I * omega * omega;
  def.damping = 2.0 * I * dampingRatio * omega;
}

/// The base joint class. Joints are used to constraint two bodies together in
/// various fashions. Some joints also feature limits and motors.
 abstract class b2Joint {
  public  m_type: b2JointType = b2JointType.e_unknownJoint;
  public m_prev: b2Joint  = null;
  public m_next: b2Joint  = null;
  public  m_edgeA: b2JointEdge = new b2JointEdge(this);
  public  m_edgeB: b2JointEdge = new b2JointEdge(this);
  public m_bodyA: b2Body;
  public m_bodyB: b2Body;

  public m_index: number = 0;

  public m_islandFlag: boolean = false;
  public m_collideConnected: boolean = false;

  public m_userData: any = null;

  constructor(def: b2IJointDef) {
    // DEBUG: b2Assert(def.bodyA !== def.bodyB);

    this.m_type = def.type;
    this.m_edgeA.other = def.bodyB;
    this.m_edgeB.other = def.bodyA;
    this.m_bodyA = def.bodyA;
    this.m_bodyB = def.bodyB;

    this.m_collideConnected = b2Maybe(def.collideConnected, false);

    this.m_userData = b2Maybe(def.userData, null);
  }

  /// Get the type of the concrete joint.
  public GetType(): b2JointType {
    return this.m_type;
  }

  /// Get the first body attached to this joint.
  public GetBodyA(): b2Body {
    return this.m_bodyA;
  }

  /// Get the second body attached to this joint.
  public GetBodyB(): b2Body {
    return this.m_bodyB;
  }

  /// Get the anchor point on bodyA in world coordinates.
  public abstract GetAnchorA<T extends XY>(out: T): T;

  /// Get the anchor point on bodyB in world coordinates.
  public abstract GetAnchorB<T extends XY>(out: T): T;

  /// Get the reaction force on bodyB at the joint anchor in Newtons.
  public abstract GetReactionForce<T extends XY>(inv_dt: number, out: T): T;

  /// Get the reaction torque on bodyB in N*m.
  public abstract GetReactionTorque(inv_dt: number): number;

  /// Get the next joint the world joint list.
  public GetNext(): b2Joint  {
    return this.m_next;
  }

  /// Get the user data pointer.
  public GetUserData(): any {
    return this.m_userData;
  }

  /// Set the user data pointer.
  public SetUserData(data: any): void {
    this.m_userData = data;
  }

  /// Short-cut function to determine if either body is inactive.
  public IsEnabled(): boolean {
    return this.m_bodyA.IsEnabled() && this.m_bodyB.IsEnabled();
  }

  /// Get collide connected.
  /// Note: modifying the collide connect flag won't work correctly because
  /// the flag is only checked when fixture AABBs begin to overlap.
  public GetCollideConnected(): boolean {
    return this.m_collideConnected;
  }

  /// Dump this joint to the log file.
  public Dump(log: (format: string, ...args: any[]) => void): void {
    log("// Dump is not supported for this joint type.\n");
  }

  /// Shift the origin for any points stored in world coordinates.
  public ShiftOrigin(newOrigin: XY): void { }

  /// Debug draw this joint
  private static Draw_s_p1: b2Vec2 = new b2Vec2();
  private static Draw_s_p2: b2Vec2 = new b2Vec2();
  private static Draw_s_color: b2Color = new b2Color(0.5, 0.8, 0.8);
  private static Draw_s_c: b2Color = new b2Color();
  public Draw(draw: b2Draw): void {
    const xf1: b2Transform = this.m_bodyA.GetTransform();
    const xf2: b2Transform = this.m_bodyB.GetTransform();
    const x1: b2Vec2 = xf1.p;
    const x2: b2Vec2 = xf2.p;
    const p1: b2Vec2 = this.GetAnchorA(b2Joint.Draw_s_p1);
    const p2: b2Vec2 = this.GetAnchorB(b2Joint.Draw_s_p2);

    const color: b2Color = b2Joint.Draw_s_color.SetRGB(0.5, 0.8, 0.8);

    switch (this.m_type) {
      case b2JointType.e_distanceJoint:
        draw.DrawSegment(p1, p2, color);
        break;

      case b2JointType.e_pulleyJoint:
        {
          const pulley: b2PulleyJoint = this as unknown as b2PulleyJoint;
          const s1: b2Vec2 = pulley.GetGroundAnchorA();
          const s2: b2Vec2 = pulley.GetGroundAnchorB();
          draw.DrawSegment(s1, p1, color);
          draw.DrawSegment(s2, p2, color);
          draw.DrawSegment(s1, s2, color);
        }
        break;

      case b2JointType.e_mouseJoint:
        {
          const c = b2Joint.Draw_s_c;
          c.Set(0.0, 1.0, 0.0);
          draw.DrawPoint(p1, 4.0, c);
          draw.DrawPoint(p2, 4.0, c);

          c.Set(0.8, 0.8, 0.8);
          draw.DrawSegment(p1, p2, c);
        }
        break;

      default:
        draw.DrawSegment(x1, p1, color);
        draw.DrawSegment(p1, p2, color);
        draw.DrawSegment(x2, p2, color);
      }
    }

  public abstract InitVelocityConstraints(data: b2SolverData): void;

  public abstract SolveVelocityConstraints(data: b2SolverData): void;

  // This returns true if the position errors are within tolerance.
  public abstract SolvePositionConstraints(data: b2SolverData): boolean;
}
/*
* Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 
// DEBUG: 






// Point-to-point constraint
// Cdot = v2 - v1
//      = v2 + cross(w2, r2) - v1 - cross(w1, r1)
// J = [-I -r1_skew I r2_skew ]
// Identity used:
// w k % (rx i + ry j) = w * (-ry i + rx j)
//
// r1 = offset - c1
// r2 = -c2

// Angle constraint
// Cdot = w2 - w1
// J = [0 0 -1 0 0 1]
// K = invI1 + invI2

 interface b2IMotorJointDef extends b2IJointDef {
  linearOffset?: XY;

  angularOffset?: number;

  maxForce?: number;

  maxTorque?: number;

  correctionFactor?: number;
}

 class b2MotorJointDef extends b2JointDef implements b2IMotorJointDef {
  public  linearOffset: b2Vec2 = new b2Vec2(0, 0);

  public angularOffset: number = 0;

  public maxForce: number = 1;

  public maxTorque: number = 1;

  public correctionFactor: number = 0.3;

  constructor() {
    super(b2JointType.e_motorJoint);
  }

  public Initialize(bA: b2Body, bB: b2Body): void {
    this.bodyA = bA;
    this.bodyB = bB;
    // b2Vec2 xB = bodyB->GetPosition();
    // linearOffset = bodyA->GetLocalPoint(xB);
    this.bodyA.GetLocalPoint(this.bodyB.GetPosition(), this.linearOffset);

    const angleA: number = this.bodyA.GetAngle();
    const angleB: number = this.bodyB.GetAngle();
    this.angularOffset = angleB - angleA;
  }
}

 class b2MotorJoint extends b2Joint {
  // Solver shared
  public  m_linearOffset: b2Vec2 = new b2Vec2();
  public m_angularOffset: number = 0;
  public  m_linearImpulse: b2Vec2 = new b2Vec2();
  public m_angularImpulse: number = 0;
  public m_maxForce: number = 0;
  public m_maxTorque: number = 0;
  public m_correctionFactor: number = 0.3;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_rA: b2Vec2 = new b2Vec2();
  public  m_rB: b2Vec2 = new b2Vec2();
  public  m_localCenterA: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();
  public  m_linearError: b2Vec2 = new b2Vec2();
  public m_angularError: number = 0;
  public m_invMassA: number = 0;
  public m_invMassB: number = 0;
  public m_invIA: number = 0;
  public m_invIB: number = 0;
  public  m_linearMass: b2Mat22 = new b2Mat22();
  public m_angularMass: number = 0;

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_K: b2Mat22 = new b2Mat22();

  constructor(def: b2IMotorJointDef) {
    super(def);

    this.m_linearOffset.Copy(b2Maybe(def.linearOffset, b2Vec2.ZERO));
    this.m_linearImpulse.SetZero();
    this.m_maxForce = b2Maybe(def.maxForce, 0);
    this.m_maxTorque = b2Maybe(def.maxTorque, 0);
    this.m_correctionFactor = b2Maybe(def.correctionFactor, 0.3);
  }

  public GetAnchorA<T extends XY>(out: T): T {
    const pos:b2Vec2 = this.m_bodyA.GetPosition();
    out.x = pos.x;
    out.y = pos.y;
    return out;
  }
  public GetAnchorB<T extends XY>(out: T): T {
    const pos:b2Vec2 = this.m_bodyB.GetPosition();
    out.x = pos.x;
    out.y = pos.y;
    return out;
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    // return inv_dt * m_linearImpulse;
    return b2Vec2.MulSV(inv_dt, this.m_linearImpulse, out);
  }

  public GetReactionTorque(inv_dt: number): number {
    return inv_dt * this.m_angularImpulse;
  }

  public SetLinearOffset(linearOffset: b2Vec2): void {
    if (!b2Vec2.IsEqualToV(linearOffset, this.m_linearOffset)) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_linearOffset.Copy(linearOffset);
    }
  }
  public GetLinearOffset() {
    return this.m_linearOffset;
  }

  public SetAngularOffset(angularOffset: number): void {
    if (angularOffset !== this.m_angularOffset) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_angularOffset = angularOffset;
    }
  }
  public GetAngularOffset() {
    return this.m_angularOffset;
  }

  public SetMaxForce(force: number): void {
    // DEBUG: b2Assert(b2IsValid(force) && force >= 0);
    this.m_maxForce = force;
  }

  public GetMaxForce() {
    return this.m_maxForce;
  }

  public SetMaxTorque(torque: number): void {
    // DEBUG: b2Assert(b2IsValid(torque) && torque >= 0);
    this.m_maxTorque = torque;
  }

  public GetMaxTorque() {
    return this.m_maxTorque;
  }

  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // Compute the effective mass matrix.
    // this.m_rA = b2Mul(qA, m_linearOffset - this.m_localCenterA);
    const rA: b2Vec2 = b2Rot.MulRV(qA, b2Vec2.SubVV(this.m_linearOffset, this.m_localCenterA, b2Vec2.s_t0), this.m_rA);
    // this.m_rB = b2Mul(qB, -this.m_localCenterB);
    const rB: b2Vec2 = b2Rot.MulRV(qB, b2Vec2.NegV(this.m_localCenterB, b2Vec2.s_t0), this.m_rB);

    // J = [-I -r1_skew I r2_skew]
    // r_skew = [-ry; rx]

    // Matlab
    // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
    //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
    //     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    // Upper 2 by 2 of K for point to point
    const K: b2Mat22 = this.m_K;
    K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
    K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
    K.ey.x = K.ex.y;
    K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;

    // this.m_linearMass = K.GetInverse();
    K.GetInverse(this.m_linearMass);

    this.m_angularMass = iA + iB;
    if (this.m_angularMass > 0) {
      this.m_angularMass = 1 / this.m_angularMass;
    }

    // this.m_linearError = cB + rB - cA - rA;
    b2Vec2.SubVV(
      b2Vec2.AddVV(cB, rB, b2Vec2.s_t0),
      b2Vec2.AddVV(cA, rA, b2Vec2.s_t1),
      this.m_linearError);
    this.m_angularError = aB - aA - this.m_angularOffset;

    if (data.step.warmStarting) {
      // Scale impulses to support a variable time step.
      // this.m_linearImpulse *= data.step.dtRatio;
      this.m_linearImpulse.SelfMul(data.step.dtRatio);
      this.m_angularImpulse *= data.step.dtRatio;

      // b2Vec2 P(this.m_linearImpulse.x, this.m_linearImpulse.y);
      const P: b2Vec2 = this.m_linearImpulse;
      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * (b2Vec2.CrossVV(rA, P) + this.m_angularImpulse);
      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * (b2Vec2.CrossVV(rB, P) + this.m_angularImpulse);
    } else {
      this.m_linearImpulse.SetZero();
      this.m_angularImpulse = 0;
    }

    // data.velocities[this.m_indexA].v = vA; // vA is a reference
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB; // vB is a reference
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_Cdot_v2 = new b2Vec2();
  private static SolveVelocityConstraints_s_impulse_v2 = new b2Vec2();
  private static SolveVelocityConstraints_s_oldImpulse_v2 = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    const h: number = data.step.dt;
    const inv_h: number = data.step.inv_dt;

    // Solve angular friction
    {
      const Cdot: number = wB - wA + inv_h * this.m_correctionFactor * this.m_angularError;
      let impulse: number = -this.m_angularMass * Cdot;

      const oldImpulse: number = this.m_angularImpulse;
      const maxImpulse: number = h * this.m_maxTorque;
      this.m_angularImpulse = b2Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
      impulse = this.m_angularImpulse - oldImpulse;

      wA -= iA * impulse;
      wB += iB * impulse;
    }

    // Solve linear friction
    {
      const rA = this.m_rA;
      const rB = this.m_rB;

      // b2Vec2 Cdot = vB + b2Vec2.CrossSV(wB, rB) - vA - b2Vec2.CrossSV(wA, rA) + inv_h * this.m_correctionFactor * this.m_linearError;
      const Cdot_v2 =
        b2Vec2.AddVV(
          b2Vec2.SubVV(
            b2Vec2.AddVV(vB, b2Vec2.CrossSV(wB, rB, b2Vec2.s_t0), b2Vec2.s_t0),
            b2Vec2.AddVV(vA, b2Vec2.CrossSV(wA, rA, b2Vec2.s_t1), b2Vec2.s_t1), b2Vec2.s_t2),
          b2Vec2.MulSV(inv_h * this.m_correctionFactor, this.m_linearError, b2Vec2.s_t3),
          b2MotorJoint.SolveVelocityConstraints_s_Cdot_v2);

      // b2Vec2 impulse = -b2Mul(this.m_linearMass, Cdot);
      const impulse_v2: b2Vec2 = b2Mat22.MulMV(this.m_linearMass, Cdot_v2, b2MotorJoint.SolveVelocityConstraints_s_impulse_v2).SelfNeg();
      // b2Vec2 oldImpulse = this.m_linearImpulse;
      const oldImpulse_v2 = b2MotorJoint.SolveVelocityConstraints_s_oldImpulse_v2.Copy(this.m_linearImpulse);
      // this.m_linearImpulse += impulse;
      this.m_linearImpulse.SelfAdd(impulse_v2);

      const maxImpulse: number = h * this.m_maxForce;

      if (this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
        this.m_linearImpulse.Normalize();
        // this.m_linearImpulse *= maxImpulse;
        this.m_linearImpulse.SelfMul(maxImpulse);
      }

      // impulse = this.m_linearImpulse - oldImpulse;
      b2Vec2.SubVV(this.m_linearImpulse, oldImpulse_v2, impulse_v2);

      // vA -= mA * impulse;
      vA.SelfMulSub(mA, impulse_v2);
      // wA -= iA * b2Vec2.CrossVV(rA, impulse);
      wA -= iA * b2Vec2.CrossVV(rA, impulse_v2);

      // vB += mB * impulse;
      vB.SelfMulAdd(mB, impulse_v2);
      // wB += iB * b2Vec2.CrossVV(rB, impulse);
      wB += iB * b2Vec2.CrossVV(rB, impulse_v2);
    }

    // data.velocities[this.m_indexA].v = vA; // vA is a reference
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB; // vB is a reference
    data.velocities[this.m_indexB].w = wB;
  }

  public SolvePositionConstraints(data: b2SolverData): boolean {
    return true;
  }

  public Dump(log: (format: string, ...args: any[]) => void) {
    const indexA = this.m_bodyA.m_islandIndex;
    const indexB = this.m_bodyB.m_islandIndex;

    log("  const jd: b2MotorJointDef = new b2MotorJointDef();\n");

    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));

    log("  jd.linearOffset.Set(%.15f, %.15f);\n", this.m_linearOffset.x, this.m_linearOffset.y);
    log("  jd.angularOffset = %.15f;\n", this.m_angularOffset);
    log("  jd.maxForce = %.15f;\n", this.m_maxForce);
    log("  jd.maxTorque = %.15f;\n", this.m_maxTorque);
    log("  jd.correctionFactor = %.15f;\n", this.m_correctionFactor);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
/*
* Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 
// DEBUG: 





 interface b2IMouseJointDef extends b2IJointDef {
  target?: XY;

  maxForce?: number;

  stiffness?: number;

  damping?: number;
}

/// Mouse joint definition. This requires a world target point,
/// tuning parameters, and the time step.
 class b2MouseJointDef extends b2JointDef implements b2IMouseJointDef {
  public  target: b2Vec2 = new b2Vec2();

  public maxForce: number = 0;

  public stiffness: number = 5;

  public damping: number = 0.7;

  constructor() {
    super(b2JointType.e_mouseJoint);
  }
}

 class b2MouseJoint extends b2Joint {
  public  m_localAnchorB: b2Vec2 = new b2Vec2();
  public  m_targetA: b2Vec2 = new b2Vec2();
  public m_stiffness: number = 0;
  public m_damping: number = 0;
  public m_beta: number = 0;

  // Solver shared
  public  m_impulse: b2Vec2 = new b2Vec2();
  public m_maxForce: number = 0;
  public m_gamma: number = 0;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_rB: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();
  public m_invMassB: number = 0;
  public m_invIB: number = 0;
  public  m_mass: b2Mat22 = new b2Mat22();
  public  m_C: b2Vec2 = new b2Vec2();
  public  m_qB: b2Rot = new b2Rot();
  public  m_lalcB: b2Vec2 = new b2Vec2();
  public  m_K: b2Mat22 = new b2Mat22();

  constructor(def: b2IMouseJointDef) {
    super(def);

    this.m_targetA.Copy(b2Maybe(def.target, b2Vec2.ZERO));
    // DEBUG: b2Assert(this.m_targetA.IsValid());
    b2Transform.MulTXV(this.m_bodyB.GetTransform(), this.m_targetA, this.m_localAnchorB);

    this.m_maxForce = b2Maybe(def.maxForce, 0);
    // DEBUG: b2Assert(b2IsValid(this.m_maxForce) && this.m_maxForce >= 0);
    this.m_impulse.SetZero();

    this.m_stiffness = b2Maybe(def.stiffness, 0);
    // DEBUG: b2Assert(b2IsValid(this.m_stiffness) && this.m_stiffness >= 0);
    this.m_damping = b2Maybe(def.damping, 0);
    // DEBUG: b2Assert(b2IsValid(this.m_damping) && this.m_damping >= 0);

    this.m_beta = 0;
    this.m_gamma = 0;
  }

  public SetTarget(target: b2Vec2): void {
    if (!this.m_bodyB.IsAwake()) {
      this.m_bodyB.SetAwake(true);
    }
    this.m_targetA.Copy(target);
  }

  public GetTarget() {
    return this.m_targetA;
  }

  public SetMaxForce(maxForce: number): void {
    this.m_maxForce = maxForce;
  }

  public GetMaxForce() {
    return this.m_maxForce;
  }

  public SetStiffness(stiffness: number): void {
    this.m_stiffness = stiffness;
  }

  public GetStiffness() {
    return this.m_stiffness;
  }

  public SetDamping(damping: number) {
    this.m_damping = damping;
  }

  public GetDamping() {
    return this.m_damping;
  }

  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIB = this.m_bodyB.m_invI;

    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const qB = this.m_qB.SetAngle(aB);

    const mass: number = this.m_bodyB.GetMass();

    // Frequency
    const omega: number = 2 * b2_pi * this.m_stiffness;

    // Damping coefficient
    const d: number = 2 * mass * this.m_damping * omega;

    // Spring stiffness
    const k: number = mass * (omega * omega);

    // magic formulas
    // gamma has units of inverse mass.
    // beta has units of inverse time.
    const h: number = data.step.dt;
    this.m_gamma = h * (d + h * k);
    if (this.m_gamma !== 0) {
      this.m_gamma = 1 / this.m_gamma;
    }
    this.m_beta = h * k * this.m_gamma;

    // Compute the effective mass matrix.
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

    // K    = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) * invI2 * skew(r2)]
    //      = [1/m1+1/m2     0    ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y -r1.x*r1.y]
    //        [    0     1/m1+1/m2]           [-r1.x*r1.y r1.x*r1.x]           [-r1.x*r1.y r1.x*r1.x]
    const K = this.m_K;
    K.ex.x = this.m_invMassB + this.m_invIB * this.m_rB.y * this.m_rB.y + this.m_gamma;
    K.ex.y = -this.m_invIB * this.m_rB.x * this.m_rB.y;
    K.ey.x = K.ex.y;
    K.ey.y = this.m_invMassB + this.m_invIB * this.m_rB.x * this.m_rB.x + this.m_gamma;

    K.GetInverse(this.m_mass);

    // m_C = cB + m_rB - m_targetA;
    this.m_C.x = cB.x + this.m_rB.x - this.m_targetA.x;
    this.m_C.y = cB.y + this.m_rB.y - this.m_targetA.y;
    // m_C *= m_beta;
    this.m_C.SelfMul(this.m_beta);

    // Cheat with some damping
    wB *= 0.98;

    if (data.step.warmStarting) {
      this.m_impulse.SelfMul(data.step.dtRatio);
      // vB += m_invMassB * m_impulse;
      vB.x += this.m_invMassB * this.m_impulse.x;
      vB.y += this.m_invMassB * this.m_impulse.y;
      wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, this.m_impulse);
    } else {
      this.m_impulse.SetZero();
    }

    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_Cdot = new b2Vec2();
  private static SolveVelocityConstraints_s_impulse = new b2Vec2();
  private static SolveVelocityConstraints_s_oldImpulse = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    // Cdot = v + cross(w, r)
    // b2Vec2 Cdot = vB + b2Cross(wB, m_rB);
    const Cdot: b2Vec2 = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2MouseJoint.SolveVelocityConstraints_s_Cdot);
    //  b2Vec2 impulse = b2Mul(m_mass, -(Cdot + m_C + m_gamma * m_impulse));
    const impulse: b2Vec2 = b2Mat22.MulMV(
      this.m_mass,
      b2Vec2.AddVV(
        Cdot,
        b2Vec2.AddVV(this.m_C,
          b2Vec2.MulSV(this.m_gamma, this.m_impulse, b2Vec2.s_t0),
          b2Vec2.s_t0),
        b2Vec2.s_t0).SelfNeg(),
      b2MouseJoint.SolveVelocityConstraints_s_impulse);

    // b2Vec2 oldImpulse = m_impulse;
    const oldImpulse = b2MouseJoint.SolveVelocityConstraints_s_oldImpulse.Copy(this.m_impulse);
    // m_impulse += impulse;
    this.m_impulse.SelfAdd(impulse);
    const maxImpulse: number = data.step.dt * this.m_maxForce;
    if (this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
      this.m_impulse.SelfMul(maxImpulse / this.m_impulse.Length());
    }
    // impulse = m_impulse - oldImpulse;
    b2Vec2.SubVV(this.m_impulse, oldImpulse, impulse);

    // vB += m_invMassB * impulse;
    vB.SelfMulAdd(this.m_invMassB, impulse);
    wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, impulse);

    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  public SolvePositionConstraints(data: b2SolverData): boolean {
    return true;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    out.x = this.m_targetA.x;
    out.y = this.m_targetA.y;
    return out;
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    return b2Vec2.MulSV(inv_dt, this.m_impulse, out);
  }

  public GetReactionTorque(inv_dt: number): number {
    return 0;
  }

  public Dump(log: (format: string, ...args: any[]) => void) {
    log("Mouse joint dumping is not supported.\n");
  }

  public ShiftOrigin(newOrigin: b2Vec2) {
    this.m_targetA.SelfSub(newOrigin);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/








 class b2PolygonAndCircleContact extends b2Contact<b2PolygonShape, b2CircleShape> {
  public static Create(): b2Contact {
    return new b2PolygonAndCircleContact();
  }

  public static Destroy(contact: b2Contact): void {
  }

  public Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void {
    b2CollidePolygonAndCircle(manifold, this.GetShapeA(), xfA, this.GetShapeB(), xfB);
  }
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







 class b2PolygonContact extends b2Contact<b2PolygonShape, b2PolygonShape> {
  public static Create(): b2Contact {
    return new b2PolygonContact();
  }

  public static Destroy(contact: b2Contact): void {
  }

  public Evaluate(manifold: b2Manifold, xfA: b2Transform, xfB: b2Transform): void {
    b2CollidePolygons(
      manifold,
      this.GetShapeA(), xfA,
      this.GetShapeB(), xfB);
  }
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/








 interface b2IPrismaticJointDef extends b2IJointDef {
  localAnchorA?: XY;

  localAnchorB?: XY;

  localAxisA?: XY;

  referenceAngle?: number;

  enableLimit?: boolean;

  lowerTranslation?: number;

  upperTranslation?: number;

  enableMotor?: boolean;

  maxMotorForce?: number;

  motorSpeed?: number;
}

/// Prismatic joint definition. This requires defining a line of
/// motion using an axis and an anchor point. The definition uses local
/// anchor points and a local axis so that the initial configuration
/// can violate the constraint slightly. The joint translation is zero
/// when the local anchor points coincide in world space. Using local
/// anchors and a local axis helps when saving and loading a game.
 class b2PrismaticJointDef extends b2JointDef implements b2IPrismaticJointDef {
  public  localAnchorA: b2Vec2 = new b2Vec2();

  public  localAnchorB: b2Vec2 = new b2Vec2();

  public  localAxisA: b2Vec2 = new b2Vec2(1, 0);

  public referenceAngle: number = 0;

  public enableLimit = false;

  public lowerTranslation: number = 0;

  public upperTranslation: number = 0;

  public enableMotor = false;

  public maxMotorForce: number = 0;

  public motorSpeed: number = 0;

  constructor() {
    super(b2JointType.e_prismaticJoint);
  }

  public Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2, axis: b2Vec2): void {
    this.bodyA = bA;
    this.bodyB = bB;
    this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
    this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
    this.bodyA.GetLocalVector(axis, this.localAxisA);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
  }
}

// Linear constraint (point-to-line)
// d = p2 - p1 = x2 + r2 - x1 - r1
// C = dot(perp, d)
// Cdot = dot(d, cross(w1, perp)) + dot(perp, v2 + cross(w2, r2) - v1 - cross(w1, r1))
//      = -dot(perp, v1) - dot(cross(d + r1, perp), w1) + dot(perp, v2) + dot(cross(r2, perp), v2)
// J = [-perp, -cross(d + r1, perp), perp, cross(r2,perp)]
//
// Angular constraint
// C = a2 - a1 + a_initial
// Cdot = w2 - w1
// J = [0 0 -1 0 0 1]
//
// K = J * invM * JT
//
// J = [-a -s1 a s2]
//     [0  -1  0  1]
// a = perp
// s1 = cross(d + r1, a) = cross(p2 - x1, a)
// s2 = cross(r2, a) = cross(p2 - x2, a)

// Motor/Limit linear constraint
// C = dot(ax1, d)
// Cdot = -dot(ax1, v1) - dot(cross(d + r1, ax1), w1) + dot(ax1, v2) + dot(cross(r2, ax1), v2)
// J = [-ax1 -cross(d+r1,ax1) ax1 cross(r2,ax1)]

// Predictive limit is applied even when the limit is not active.
// Prevents a constraint speed that can lead to a constraint error in one time step.
// Want C2 = C1 + h * Cdot >= 0
// Or:
// Cdot + C1/h >= 0
// I do not apply a negative constraint error because that is handled in position correction.
// So:
// Cdot + max(C1, 0)/h >= 0

// Block Solver
// We develop a block solver that includes the angular and linear constraints. This makes the limit stiffer.
//
// The Jacobian has 2 rows:
// J = [-uT -s1 uT s2] // linear
//     [0   -1   0  1] // angular
//
// u = perp
// s1 = cross(d + r1, u), s2 = cross(r2, u)
// a1 = cross(d + r1, v), a2 = cross(r2, v)

 class b2PrismaticJoint extends b2Joint {
  public  m_localAnchorA: b2Vec2 = new b2Vec2();
  public  m_localAnchorB: b2Vec2 = new b2Vec2();
  public  m_localXAxisA: b2Vec2 = new b2Vec2();
  public  m_localYAxisA: b2Vec2 = new b2Vec2();
  public m_referenceAngle: number = 0;
  public  m_impulse: b2Vec2 = new b2Vec2(0, 0);
  public m_motorImpulse: number = 0;
  public m_lowerImpulse: number = 0;
  public m_upperImpulse: number = 0;
  public m_lowerTranslation: number = 0;
  public m_upperTranslation: number = 0;
  public m_maxMotorForce: number = 0;
  public m_motorSpeed: number = 0;
  public m_enableLimit: boolean = false;
  public m_enableMotor: boolean = false;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_localCenterA: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();
  public m_invMassA: number = 0;
  public m_invMassB: number = 0;
  public m_invIA: number = 0;
  public m_invIB: number = 0;
  public  m_axis: b2Vec2 = new b2Vec2(0, 0);
  public  m_perp: b2Vec2 = new b2Vec2(0, 0);
  public m_s1: number = 0;
  public m_s2: number = 0;
  public m_a1: number = 0;
  public m_a2: number = 0;
  public  m_K: b2Mat22 = new b2Mat22();
  public  m_K3: b2Mat33 = new b2Mat33();
  public  m_K2: b2Mat22 = new b2Mat22();
  public m_translation: number = 0;
  public m_axialMass: number = 0;

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_lalcA: b2Vec2 = new b2Vec2();
  public  m_lalcB: b2Vec2 = new b2Vec2();
  public  m_rA: b2Vec2 = new b2Vec2();
  public  m_rB: b2Vec2 = new b2Vec2();

  constructor(def: b2IPrismaticJointDef) {
    super(def);

    this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
    this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
    this.m_localXAxisA.Copy(b2Maybe(def.localAxisA, new b2Vec2(1, 0))).SelfNormalize();
    b2Vec2.CrossOneV(this.m_localXAxisA, this.m_localYAxisA);
    this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);
    this.m_lowerTranslation = b2Maybe(def.lowerTranslation, 0);
    this.m_upperTranslation = b2Maybe(def.upperTranslation, 0);
    // b2Assert(this.m_lowerTranslation <= this.m_upperTranslation);
    this.m_maxMotorForce = b2Maybe(def.maxMotorForce, 0);
    this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
    this.m_enableLimit = b2Maybe(def.enableLimit, false);
    this.m_enableMotor = b2Maybe(def.enableMotor, false);
  }

  private static InitVelocityConstraints_s_d = new b2Vec2();
  private static InitVelocityConstraints_s_P = new b2Vec2();
  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // Compute the effective masses.
    // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
    // b2Vec2 d = (cB - cA) + rB - rA;
    const d: b2Vec2 = b2Vec2.AddVV(
      b2Vec2.SubVV(cB, cA, b2Vec2.s_t0),
      b2Vec2.SubVV(rB, rA, b2Vec2.s_t1),
      b2PrismaticJoint.InitVelocityConstraints_s_d);

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    // Compute motor Jacobian and effective mass.
    {
      // m_axis = b2Mul(qA, m_localXAxisA);
      b2Rot.MulRV(qA, this.m_localXAxisA, this.m_axis);
      // m_a1 = b2Cross(d + rA, m_axis);
      this.m_a1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_axis);
      // m_a2 = b2Cross(rB, m_axis);
      this.m_a2 = b2Vec2.CrossVV(rB, this.m_axis);

      this.m_axialMass = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2 * this.m_a2;
      if (this.m_axialMass > 0) {
        this.m_axialMass = 1 / this.m_axialMass;
      }
    }

    // Prismatic constraint.
    {
      // m_perp = b2Mul(qA, m_localYAxisA);
      b2Rot.MulRV(qA, this.m_localYAxisA, this.m_perp);

      // m_s1 = b2Cross(d + rA, m_perp);
      this.m_s1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_perp);
      // m_s2 = b2Cross(rB, m_perp);
      this.m_s2 = b2Vec2.CrossVV(rB, this.m_perp);

      // float32 k11 = mA + mB + iA * m_s1 * m_s1 + iB * m_s2 * m_s2;
      this.m_K.ex.x = mA + mB + iA * this.m_s1 * this.m_s1 + iB * this.m_s2 * this.m_s2;
      // float32 k12 = iA * m_s1 + iB * m_s2;
      this.m_K.ex.y = iA * this.m_s1 + iB * this.m_s2;
      this.m_K.ey.x = this.m_K.ex.y;
      // float32 k22 = iA + iB;
      this.m_K.ey.y = iA + iB;
      if (this.m_K.ey.y === 0) {
        // For bodies with fixed rotation.
        this.m_K.ey.y = 1;
      }

      // m_K.ex.Set(k11, k12);
      // m_K.ey.Set(k12, k22);
    }

    // Compute motor and limit terms.
    if (this.m_enableLimit) {
      this.m_translation = b2Vec2.DotVV(this.m_axis, d);
    } else {
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }

    if (!this.m_enableMotor) {
      this.m_motorImpulse = 0;
    }

    if (data.step.warmStarting) {
      // Account for variable time step.
      // m_impulse *= data.step.dtRatio;
      this.m_impulse.SelfMul(data.step.dtRatio);
      this.m_motorImpulse *= data.step.dtRatio;
      this.m_lowerImpulse *= data.step.dtRatio;
      this.m_upperImpulse *= data.step.dtRatio;

      const axialImpulse: number = this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse;
      // b2Vec2 P = m_impulse.x * m_perp + axialImpulse * m_axis;
      const P: b2Vec2 = b2Vec2.AddVV(
        b2Vec2.MulSV(this.m_impulse.x, this.m_perp, b2Vec2.s_t0),
        b2Vec2.MulSV(axialImpulse, this.m_axis, b2Vec2.s_t1),
        b2PrismaticJoint.InitVelocityConstraints_s_P);
      // float LA = m_impulse.x * m_s1 + m_impulse.y + axialImpulse * m_a1;
      const LA = this.m_impulse.x * this.m_s1 + this.m_impulse.y + axialImpulse * this.m_a1;
      // float LB = m_impulse.x * m_s2 + m_impulse.y + axialImpulse * m_a2;
      const LB = this.m_impulse.x * this.m_s2 + this.m_impulse.y + axialImpulse * this.m_a2;

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * LA;

      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * LB;
    } else {
      this.m_impulse.SetZero();
      this.m_motorImpulse = 0.0;
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_P = new b2Vec2();
  // private static SolveVelocityConstraints_s_f2r = new b2Vec2();
  // private static SolveVelocityConstraints_s_f1 = new b2Vec3();
  // private static SolveVelocityConstraints_s_df3 = new b2Vec3();
  private static SolveVelocityConstraints_s_df = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    // Solve linear motor constraint.
    if (this.m_enableMotor) {
      // float32 Cdot = b2Dot(m_axis, vB - vA) + m_a2 * wB - m_a1 * wA;
      const Cdot: number = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_a2 * wB - this.m_a1 * wA;
      let impulse = this.m_axialMass * (this.m_motorSpeed - Cdot);
      const oldImpulse = this.m_motorImpulse;
      const maxImpulse = data.step.dt * this.m_maxMotorForce;
      this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, (-maxImpulse), maxImpulse);
      impulse = this.m_motorImpulse - oldImpulse;

      // b2Vec2 P = impulse * m_axis;
      const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
      const LA = impulse * this.m_a1;
      const LB = impulse * this.m_a2;

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * LA;
      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * LB;
    }

    if (this.m_enableLimit) {
      // Lower limit
      {
        const C: number = this.m_translation - this.m_lowerTranslation;
        const Cdot: number = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_a2 * wB - this.m_a1 * wA;
        let impulse: number = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
        const oldImpulse: number = this.m_lowerImpulse;
        this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
        impulse = this.m_lowerImpulse - oldImpulse;

        // b2Vec2 P = impulse * this.m_axis;
        const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
        const LA: number = impulse * this.m_a1;
        const LB: number = impulse * this.m_a2;

        // vA -= mA * P;
        vA.SelfMulSub(mA, P);
        wA -= iA * LA;
        // vB += mB * P;
        vB.SelfMulAdd(mB, P);
        wB += iB * LB;
      }

      // Upper limit
      // Note: signs are flipped to keep C positive when the constraint is satisfied.
      // This also keeps the impulse positive when the limit is active.
      {
        const C: number = this.m_upperTranslation - this.m_translation;
        const Cdot: number = b2Vec2.DotVV(this.m_axis, b2Vec2.SubVV(vA, vB, b2Vec2.s_t0)) + this.m_a1 * wA - this.m_a2 * wB;
        let impulse: number = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
        const oldImpulse: number = this.m_upperImpulse;
        this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
        impulse = this.m_upperImpulse - oldImpulse;

        // b2Vec2 P = impulse * this.m_axis;
        const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_axis, b2PrismaticJoint.SolveVelocityConstraints_s_P);
        const LA: number = impulse * this.m_a1;
        const LB: number = impulse * this.m_a2;

        // vA += mA * P;
        vA.SelfMulAdd(mA, P);
        wA += iA * LA;
        // vB -= mB * P;
        vB.SelfMulSub(mB, P);
        wB -= iB * LB;
      }
    }

    // Solve the prismatic constraint in block form.
    {
      // b2Vec2 Cdot;
      // Cdot.x = b2Dot(m_perp, vB - vA) + m_s2 * wB - m_s1 * wA;
      const Cdot_x: number = b2Vec2.DotVV(this.m_perp, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_s2 * wB - this.m_s1 * wA;
      // Cdot.y = wB - wA;
      const Cdot_y = wB - wA;

      // b2Vec2 df = m_K.Solve(-Cdot);
      const df = this.m_K.Solve(-Cdot_x, -Cdot_y, b2PrismaticJoint.SolveVelocityConstraints_s_df);
      // m_impulse += df;
      this.m_impulse.SelfAdd(df);

      // b2Vec2 P = df.x * m_perp;
      const P: b2Vec2 = b2Vec2.MulSV(df.x, this.m_perp, b2PrismaticJoint.SolveVelocityConstraints_s_P);
      // float32 LA = df.x * m_s1 + df.y;
      const LA = df.x * this.m_s1 + df.y;
      // float32 LB = df.x * m_s2 + df.y;
      const LB = df.x * this.m_s2 + df.y;

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * LA;

      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * LB;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  // A velocity based solver computes reaction forces(impulses) using the velocity constraint solver.Under this context,
  // the position solver is not there to resolve forces.It is only there to cope with integration error.
  //
  // Therefore, the pseudo impulses in the position solver do not have any physical meaning.Thus it is okay if they suck.
  //
  // We could take the active state from the velocity solver.However, the joint might push past the limit when the velocity
  // solver indicates the limit is inactive.
  private static SolvePositionConstraints_s_d = new b2Vec2();
  private static SolvePositionConstraints_s_impulse = new b2Vec3();
  private static SolvePositionConstraints_s_impulse1 = new b2Vec2();
  private static SolvePositionConstraints_s_P = new b2Vec2();
  public SolvePositionConstraints(data: b2SolverData): boolean {
    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    let aA: number = data.positions[this.m_indexA].a;
    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    let aB: number = data.positions[this.m_indexB].a;

    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
    // b2Vec2 d = cB + rB - cA - rA;
    const d: b2Vec2 = b2Vec2.SubVV(
      b2Vec2.AddVV(cB, rB, b2Vec2.s_t0),
      b2Vec2.AddVV(cA, rA, b2Vec2.s_t1),
      b2PrismaticJoint.SolvePositionConstraints_s_d);

    // b2Vec2 axis = b2Mul(qA, m_localXAxisA);
    const axis: b2Vec2 = b2Rot.MulRV(qA, this.m_localXAxisA, this.m_axis);
    // float32 a1 = b2Cross(d + rA, axis);
    const a1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), axis);
    // float32 a2 = b2Cross(rB, axis);
    const a2 = b2Vec2.CrossVV(rB, axis);
    // b2Vec2 perp = b2Mul(qA, m_localYAxisA);
    const perp: b2Vec2 = b2Rot.MulRV(qA, this.m_localYAxisA, this.m_perp);

    // float32 s1 = b2Cross(d + rA, perp);
    const s1 = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), perp);
    // float32 s2 = b2Cross(rB, perp);
    const s2 = b2Vec2.CrossVV(rB, perp);

    // b2Vec3 impulse;
    let impulse = b2PrismaticJoint.SolvePositionConstraints_s_impulse;
    // b2Vec2 C1;
    // C1.x = b2Dot(perp, d);
    const C1_x: number = b2Vec2.DotVV(perp, d);
    // C1.y = aB - aA - m_referenceAngle;
    const C1_y = aB - aA - this.m_referenceAngle;

    let linearError = b2Abs(C1_x);
    const angularError = b2Abs(C1_y);

    let active = false;
    let C2: number = 0;
    if (this.m_enableLimit) {
      // float32 translation = b2Dot(axis, d);
      const translation: number = b2Vec2.DotVV(axis, d);
      if (b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2_linearSlop) {
        C2 = translation;
        linearError = b2Max(linearError, b2Abs(translation));
        active = true;
      } else if (translation <= this.m_lowerTranslation) {
        C2 = b2Min(translation - this.m_lowerTranslation, 0.0);
        linearError = b2Max(linearError, this.m_lowerTranslation - translation);
        active = true;
      } else if (translation >= this.m_upperTranslation) {
        C2 = b2Max(translation - this.m_upperTranslation, 0.0);
        linearError = b2Max(linearError, translation - this.m_upperTranslation);
        active = true;
      }
    }

    if (active) {
      // float32 k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
      const k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
      // float32 k12 = iA * s1 + iB * s2;
      const k12 = iA * s1 + iB * s2;
      // float32 k13 = iA * s1 * a1 + iB * s2 * a2;
      const k13 = iA * s1 * a1 + iB * s2 * a2;
      // float32 k22 = iA + iB;
      let k22 = iA + iB;
      if (k22 === 0) {
        // For fixed rotation
        k22 = 1;
      }
      // float32 k23 = iA * a1 + iB * a2;
      const k23 = iA * a1 + iB * a2;
      // float32 k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;
      const k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;

      // b2Mat33 K;
      const K = this.m_K3;
      // K.ex.Set(k11, k12, k13);
      K.ex.SetXYZ(k11, k12, k13);
      // K.ey.Set(k12, k22, k23);
      K.ey.SetXYZ(k12, k22, k23);
      // K.ez.Set(k13, k23, k33);
      K.ez.SetXYZ(k13, k23, k33);

      // b2Vec3 C;
      // C.x = C1.x;
      // C.y = C1.y;
      // C.z = C2;

      // impulse = K.Solve33(-C);
      impulse = K.Solve33((-C1_x), (-C1_y), (-C2), impulse);
    } else {
      // float32 k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
      const k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
      // float32 k12 = iA * s1 + iB * s2;
      const k12 = iA * s1 + iB * s2;
      // float32 k22 = iA + iB;
      let k22 = iA + iB;
      if (k22 === 0) {
        k22 = 1;
      }

      // b2Mat22 K;
      const K2 = this.m_K2;
      // K.ex.Set(k11, k12);
      K2.ex.Set(k11, k12);
      // K.ey.Set(k12, k22);
      K2.ey.Set(k12, k22);

      // b2Vec2 impulse1 = K.Solve(-C1);
      const impulse1 = K2.Solve((-C1_x), (-C1_y), b2PrismaticJoint.SolvePositionConstraints_s_impulse1);
      impulse.x = impulse1.x;
      impulse.y = impulse1.y;
      impulse.z = 0;
    }

    // b2Vec2 P = impulse.x * perp + impulse.z * axis;
    const P: b2Vec2 = b2Vec2.AddVV(
      b2Vec2.MulSV(impulse.x, perp, b2Vec2.s_t0),
      b2Vec2.MulSV(impulse.z, axis, b2Vec2.s_t1),
      b2PrismaticJoint.SolvePositionConstraints_s_P);
    // float32 LA = impulse.x * s1 + impulse.y + impulse.z * a1;
    const LA = impulse.x * s1 + impulse.y + impulse.z * a1;
    // float32 LB = impulse.x * s2 + impulse.y + impulse.z * a2;
    const LB = impulse.x * s2 + impulse.y + impulse.z * a2;

    // cA -= mA * P;
    cA.SelfMulSub(mA, P);
    aA -= iA * LA;
    // cB += mB * P;
    cB.SelfMulAdd(mB, P);
    aB += iB * LB;

    // data.positions[this.m_indexA].c = cA;
    data.positions[this.m_indexA].a = aA;
    // data.positions[this.m_indexB].c = cB;
    data.positions[this.m_indexB].a = aB;

    return linearError <= b2_linearSlop && angularError <= b2_angularSlop;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    out.x = inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_axis.x);
    out.y = inv_dt * (this.m_impulse.y * this.m_perp.y + (this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_axis.y);
    return out;
  }

  public GetReactionTorque(inv_dt: number): number {
    return inv_dt * this.m_impulse.y;
  }

  public GetLocalAnchorA():b2Vec2 { return this.m_localAnchorA; }

  public GetLocalAnchorB():b2Vec2 { return this.m_localAnchorB; }

  public GetLocalAxisA():b2Vec2 { return this.m_localXAxisA; }

  public GetReferenceAngle() { return this.m_referenceAngle; }

  private static GetJointTranslation_s_pA = new b2Vec2();
  private static GetJointTranslation_s_pB = new b2Vec2();
  private static GetJointTranslation_s_d = new b2Vec2();
  private static GetJointTranslation_s_axis = new b2Vec2();
  public GetJointTranslation(): number {
    // b2Vec2 pA = m_bodyA.GetWorldPoint(m_localAnchorA);
    const pA = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, b2PrismaticJoint.GetJointTranslation_s_pA);
    // b2Vec2 pB = m_bodyB.GetWorldPoint(m_localAnchorB);
    const pB = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, b2PrismaticJoint.GetJointTranslation_s_pB);
    // b2Vec2 d = pB - pA;
    const d: b2Vec2 = b2Vec2.SubVV(pB, pA, b2PrismaticJoint.GetJointTranslation_s_d);
    // b2Vec2 axis = m_bodyA.GetWorldVector(m_localXAxisA);
    const axis = this.m_bodyA.GetWorldVector(this.m_localXAxisA, b2PrismaticJoint.GetJointTranslation_s_axis);

    // float32 translation = b2Dot(d, axis);
    const translation: number = b2Vec2.DotVV(d, axis);
    return translation;
  }

  public GetJointSpeed(): number {
    const bA: b2Body = this.m_bodyA;
    const bB: b2Body = this.m_bodyB;

    // b2Vec2 rA = b2Mul(bA->m_xf.q, m_localAnchorA - bA->m_sweep.localCenter);
    b2Vec2.SubVV(this.m_localAnchorA, bA.m_sweep.localCenter, this.m_lalcA);
    const rA: b2Vec2 = b2Rot.MulRV(bA.m_xf.q, this.m_lalcA, this.m_rA);
    // b2Vec2 rB = b2Mul(bB->m_xf.q, m_localAnchorB - bB->m_sweep.localCenter);
    b2Vec2.SubVV(this.m_localAnchorB, bB.m_sweep.localCenter, this.m_lalcB);
    const rB: b2Vec2 = b2Rot.MulRV(bB.m_xf.q, this.m_lalcB, this.m_rB);
    // b2Vec2 pA = bA->m_sweep.c + rA;
    const pA: b2Vec2 = b2Vec2.AddVV(bA.m_sweep.c, rA, b2Vec2.s_t0); // pA uses s_t0
    // b2Vec2 pB = bB->m_sweep.c + rB;
    const pB: b2Vec2 = b2Vec2.AddVV(bB.m_sweep.c, rB, b2Vec2.s_t1); // pB uses s_t1
    // b2Vec2 d = pB - pA;
    const d: b2Vec2 = b2Vec2.SubVV(pB, pA, b2Vec2.s_t2); // d uses s_t2
    // b2Vec2 axis = b2Mul(bA.m_xf.q, m_localXAxisA);
    const axis = bA.GetWorldVector(this.m_localXAxisA, this.m_axis);

    const vA = bA.m_linearVelocity;
    const vB = bB.m_linearVelocity;
    const wA = bA.m_angularVelocity;
    const wB = bB.m_angularVelocity;

    // float32 speed = b2Dot(d, b2Cross(wA, axis)) + b2Dot(axis, vB + b2Cross(wB, rB) - vA - b2Cross(wA, rA));
    const speed =
      b2Vec2.DotVV(d, b2Vec2.CrossSV(wA, axis, b2Vec2.s_t0)) +
      b2Vec2.DotVV(
        axis,
        b2Vec2.SubVV(
          b2Vec2.AddVCrossSV(vB, wB, rB, b2Vec2.s_t0),
          b2Vec2.AddVCrossSV(vA, wA, rA, b2Vec2.s_t1),
          b2Vec2.s_t0));
    return speed;
  }

  public IsLimitEnabled() {
    return this.m_enableLimit;
  }

  public EnableLimit(flag: boolean) {
    if (flag !== this.m_enableLimit) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_enableLimit = flag;
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }
  }

  public GetLowerLimit() {
    return this.m_lowerTranslation;
  }

  public GetUpperLimit() {
    return this.m_upperTranslation;
  }

  public SetLimits(lower: number, upper: number): void {
    if (lower !== this.m_lowerTranslation || upper !== this.m_upperTranslation) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_lowerTranslation = lower;
      this.m_upperTranslation = upper;
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }
  }

  public IsMotorEnabled(): boolean {
    return this.m_enableMotor;
  }

  public EnableMotor(flag: boolean): void {
    if (flag !== this.m_enableMotor) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_enableMotor = flag;
    }
  }

  public SetMotorSpeed(speed: number): void {
    if (speed !== this.m_motorSpeed) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_motorSpeed = speed;
    }
  }

  public GetMotorSpeed() {
    return this.m_motorSpeed;
  }

  public SetMaxMotorForce(force: number): void {
    if (force !== this.m_maxMotorForce) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_maxMotorForce = force;
    }
  }

  public GetMaxMotorForce(): number { return this.m_maxMotorForce; }

  public GetMotorForce(inv_dt: number): number {
    return inv_dt * this.m_motorImpulse;
  }

  public Dump(log: (format: string, ...args: any[]) => void) {
    const indexA = this.m_bodyA.m_islandIndex;
    const indexB = this.m_bodyB.m_islandIndex;

    log("  const jd: b2PrismaticJointDef = new b2PrismaticJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    log("  jd.localAxisA.Set(%.15f, %.15f);\n", this.m_localXAxisA.x, this.m_localXAxisA.y);
    log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
    log("  jd.enableLimit = %s;\n", (this.m_enableLimit) ? ("true") : ("false"));
    log("  jd.lowerTranslation = %.15f;\n", this.m_lowerTranslation);
    log("  jd.upperTranslation = %.15f;\n", this.m_upperTranslation);
    log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
    log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
    log("  jd.maxMotorForce = %.15f;\n", this.m_maxMotorForce);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }

  private static Draw_s_pA = new b2Vec2();
  private static Draw_s_pB = new b2Vec2();
  private static Draw_s_axis = new b2Vec2();
  private static Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
  private static Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
  private static Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
  private static Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
  private static Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
  private static Draw_s_lower = new b2Vec2();
  private static Draw_s_upper = new b2Vec2();
  private static Draw_s_perp = new b2Vec2();
  public Draw(draw: b2Draw): void {
    const xfA: b2Transform = this.m_bodyA.GetTransform();
    const xfB: b2Transform = this.m_bodyB.GetTransform();
    const pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2PrismaticJoint.Draw_s_pA);
    const pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2PrismaticJoint.Draw_s_pB);

    // b2Vec2 axis = b2Mul(xfA.q, m_localXAxisA);
    const axis: b2Vec2 = b2Rot.MulRV(xfA.q, this.m_localXAxisA, b2PrismaticJoint.Draw_s_axis);

    const c1 = b2PrismaticJoint.Draw_s_c1; // b2Color c1(0.7f, 0.7f, 0.7f);
    const c2 = b2PrismaticJoint.Draw_s_c2; // b2Color c2(0.3f, 0.9f, 0.3f);
    const c3 = b2PrismaticJoint.Draw_s_c3; // b2Color c3(0.9f, 0.3f, 0.3f);
    const c4 = b2PrismaticJoint.Draw_s_c4; // b2Color c4(0.3f, 0.3f, 0.9f);
    const c5 = b2PrismaticJoint.Draw_s_c5; // b2Color c5(0.4f, 0.4f, 0.4f);

    draw.DrawSegment(pA, pB, c5);

    if (this.m_enableLimit) {
      // b2Vec2 lower = pA + m_lowerTranslation * axis;
      const lower = b2Vec2.AddVMulSV(pA, this.m_lowerTranslation, axis, b2PrismaticJoint.Draw_s_lower);
      // b2Vec2 upper = pA + m_upperTranslation * axis;
      const upper = b2Vec2.AddVMulSV(pA, this.m_upperTranslation, axis, b2PrismaticJoint.Draw_s_upper);
      // b2Vec2 perp = b2Mul(xfA.q, m_localYAxisA);
      const perp = b2Rot.MulRV(xfA.q, this.m_localYAxisA, b2PrismaticJoint.Draw_s_perp);
      draw.DrawSegment(lower, upper, c1);
      // draw.DrawSegment(lower - 0.5 * perp, lower + 0.5 * perp, c2);
      draw.DrawSegment(b2Vec2.AddVMulSV(lower, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(lower, 0.5, perp, b2Vec2.s_t1), c2);
      // draw.DrawSegment(upper - 0.5 * perp, upper + 0.5 * perp, c3);
      draw.DrawSegment(b2Vec2.AddVMulSV(upper, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(upper, 0.5, perp, b2Vec2.s_t1), c3);
    } else {
      // draw.DrawSegment(pA - 1.0 * axis, pA + 1.0 * axis, c1);
      draw.DrawSegment(b2Vec2.AddVMulSV(pA, -1.0, axis, b2Vec2.s_t0), b2Vec2.AddVMulSV(pA, 1.0, axis, b2Vec2.s_t1), c1);
    }

    draw.DrawPoint(pA, 5.0, c1);
    draw.DrawPoint(pB, 5.0, c4);
  }
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 






 const b2_minPulleyLength: number = 2;

 interface b2IPulleyJointDef extends b2IJointDef {
  groundAnchorA?: XY;

  groundAnchorB?: XY;

  localAnchorA?: XY;

  localAnchorB?: XY;

  lengthA?: number;

  lengthB?: number;

  ratio?: number;
}

/// Pulley joint definition. This requires two ground anchors,
/// two dynamic body anchor points, and a pulley ratio.
 class b2PulleyJointDef extends b2JointDef implements b2IPulleyJointDef {
  public  groundAnchorA: b2Vec2 = new b2Vec2(-1, 1);

  public  groundAnchorB: b2Vec2 = new b2Vec2(1, 1);

  public  localAnchorA: b2Vec2 = new b2Vec2(-1, 0);

  public  localAnchorB: b2Vec2 = new b2Vec2(1, 0);

  public lengthA: number = 0;

  public lengthB: number = 0;

  public ratio: number = 1;

  constructor() {
    super(b2JointType.e_pulleyJoint);
    this.collideConnected = true;
  }

  public Initialize(bA: b2Body, bB: b2Body, groundA: b2Vec2, groundB: b2Vec2, anchorA: b2Vec2, anchorB: b2Vec2, r: number): void {
    this.bodyA = bA;
    this.bodyB = bB;
    this.groundAnchorA.Copy(groundA);
    this.groundAnchorB.Copy(groundB);
    this.bodyA.GetLocalPoint(anchorA, this.localAnchorA);
    this.bodyB.GetLocalPoint(anchorB, this.localAnchorB);
    this.lengthA = b2Vec2.DistanceVV(anchorA, groundA);
    this.lengthB = b2Vec2.DistanceVV(anchorB, groundB);
    this.ratio = r;
    // DEBUG: b2Assert(this.ratio > b2_epsilon);
  }
}

 class b2PulleyJoint extends b2Joint {
  public  m_groundAnchorA: b2Vec2 = new b2Vec2();
  public  m_groundAnchorB: b2Vec2 = new b2Vec2();

  public m_lengthA: number = 0;
  public m_lengthB: number = 0;

  // Solver shared
  public  m_localAnchorA: b2Vec2 = new b2Vec2();
  public  m_localAnchorB: b2Vec2 = new b2Vec2();

  public m_constant: number = 0;
  public m_ratio: number = 0;
  public m_impulse: number = 0;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_uA: b2Vec2 = new b2Vec2();
  public  m_uB: b2Vec2 = new b2Vec2();
  public  m_rA: b2Vec2 = new b2Vec2();
  public  m_rB: b2Vec2 = new b2Vec2();
  public  m_localCenterA: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();

  public m_invMassA: number = 0;
  public m_invMassB: number = 0;
  public m_invIA: number = 0;
  public m_invIB: number = 0;
  public m_mass: number = 0;

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_lalcA: b2Vec2 = new b2Vec2();
  public  m_lalcB: b2Vec2 = new b2Vec2();

  constructor(def: b2IPulleyJointDef) {
    super(def);

    this.m_groundAnchorA.Copy(b2Maybe(def.groundAnchorA, new b2Vec2(-1, 1)));
    this.m_groundAnchorB.Copy(b2Maybe(def.groundAnchorB, new b2Vec2(1, 0)));
    this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, new b2Vec2(-1, 0)));
    this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, new b2Vec2(1, 0)));

    this.m_lengthA = b2Maybe(def.lengthA, 0);
    this.m_lengthB = b2Maybe(def.lengthB, 0);

    // DEBUG: b2Assert(b2Maybe(def.ratio, 1) !== 0);
    this.m_ratio = b2Maybe(def.ratio, 1);

    this.m_constant = b2Maybe(def.lengthA, 0) + this.m_ratio * b2Maybe(def.lengthB, 0);

    this.m_impulse = 0;
  }

  private static InitVelocityConstraints_s_PA = new b2Vec2();
  private static InitVelocityConstraints_s_PB = new b2Vec2();
  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    // b2Rot qA(aA), qB(aB);
    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

    // Get the pulley axes.
    // m_uA = cA + m_rA - m_groundAnchorA;
    this.m_uA.Copy(cA).SelfAdd(this.m_rA).SelfSub(this.m_groundAnchorA);
    // m_uB = cB + m_rB - m_groundAnchorB;
    this.m_uB.Copy(cB).SelfAdd(this.m_rB).SelfSub(this.m_groundAnchorB);

    const lengthA: number = this.m_uA.Length();
    const lengthB: number = this.m_uB.Length();

    if (lengthA > 10 * b2_linearSlop) {
      this.m_uA.SelfMul(1 / lengthA);
    } else {
      this.m_uA.SetZero();
    }

    if (lengthB > 10 * b2_linearSlop) {
      this.m_uB.SelfMul(1 / lengthB);
    } else {
      this.m_uB.SetZero();
    }

    // Compute effective mass.
    const ruA: number = b2Vec2.CrossVV(this.m_rA, this.m_uA);
    const ruB: number = b2Vec2.CrossVV(this.m_rB, this.m_uB);

    const mA: number = this.m_invMassA + this.m_invIA * ruA * ruA;
    const mB: number = this.m_invMassB + this.m_invIB * ruB * ruB;

    this.m_mass = mA + this.m_ratio * this.m_ratio * mB;

    if (this.m_mass > 0) {
      this.m_mass = 1 / this.m_mass;
    }

    if (data.step.warmStarting) {
      // Scale impulses to support variable time steps.
      this.m_impulse *= data.step.dtRatio;

      // Warm starting.
      // b2Vec2 PA = -(m_impulse) * m_uA;
      const PA: b2Vec2 = b2Vec2.MulSV(-(this.m_impulse), this.m_uA, b2PulleyJoint.InitVelocityConstraints_s_PA);
      // b2Vec2 PB = (-m_ratio * m_impulse) * m_uB;
      const PB: b2Vec2 = b2Vec2.MulSV((-this.m_ratio * this.m_impulse), this.m_uB, b2PulleyJoint.InitVelocityConstraints_s_PB);

      // vA += m_invMassA * PA;
      vA.SelfMulAdd(this.m_invMassA, PA);
      wA += this.m_invIA * b2Vec2.CrossVV(this.m_rA, PA);
      // vB += m_invMassB * PB;
      vB.SelfMulAdd(this.m_invMassB, PB);
      wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, PB);
    } else {
      this.m_impulse = 0;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_vpA = new b2Vec2();
  private static SolveVelocityConstraints_s_vpB = new b2Vec2();
  private static SolveVelocityConstraints_s_PA = new b2Vec2();
  private static SolveVelocityConstraints_s_PB = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    // b2Vec2 vpA = vA + b2Cross(wA, m_rA);
    const vpA: b2Vec2 = b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2PulleyJoint.SolveVelocityConstraints_s_vpA);
    // b2Vec2 vpB = vB + b2Cross(wB, m_rB);
    const vpB: b2Vec2 = b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2PulleyJoint.SolveVelocityConstraints_s_vpB);

    const Cdot: number = -b2Vec2.DotVV(this.m_uA, vpA) - this.m_ratio * b2Vec2.DotVV(this.m_uB, vpB);
    const impulse: number = -this.m_mass * Cdot;
    this.m_impulse += impulse;

    // b2Vec2 PA = -impulse * m_uA;
    const PA: b2Vec2 = b2Vec2.MulSV(-impulse, this.m_uA, b2PulleyJoint.SolveVelocityConstraints_s_PA);
    // b2Vec2 PB = -m_ratio * impulse * m_uB;
    const PB: b2Vec2 = b2Vec2.MulSV(-this.m_ratio * impulse, this.m_uB, b2PulleyJoint.SolveVelocityConstraints_s_PB);
    // vA += m_invMassA * PA;
    vA.SelfMulAdd(this.m_invMassA, PA);
    wA += this.m_invIA * b2Vec2.CrossVV(this.m_rA, PA);
    // vB += m_invMassB * PB;
    vB.SelfMulAdd(this.m_invMassB, PB);
    wB += this.m_invIB * b2Vec2.CrossVV(this.m_rB, PB);

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolvePositionConstraints_s_PA = new b2Vec2();
  private static SolvePositionConstraints_s_PB = new b2Vec2();
  public SolvePositionConstraints(data: b2SolverData): boolean {
    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    let aA: number = data.positions[this.m_indexA].a;
    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    let aB: number = data.positions[this.m_indexB].a;

    // b2Rot qA(aA), qB(aB);
    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

    // Get the pulley axes.
    // b2Vec2 uA = cA + rA - m_groundAnchorA;
    const uA = this.m_uA.Copy(cA).SelfAdd(rA).SelfSub(this.m_groundAnchorA);
    // b2Vec2 uB = cB + rB - m_groundAnchorB;
    const uB = this.m_uB.Copy(cB).SelfAdd(rB).SelfSub(this.m_groundAnchorB);

    const lengthA: number = uA.Length();
    const lengthB: number = uB.Length();

    if (lengthA > 10 * b2_linearSlop) {
      uA.SelfMul(1 / lengthA);
    } else {
      uA.SetZero();
    }

    if (lengthB > 10 * b2_linearSlop) {
      uB.SelfMul(1 / lengthB);
    } else {
      uB.SetZero();
    }

    // Compute effective mass.
    const ruA: number = b2Vec2.CrossVV(rA, uA);
    const ruB: number = b2Vec2.CrossVV(rB, uB);

    const mA: number = this.m_invMassA + this.m_invIA * ruA * ruA;
    const mB: number = this.m_invMassB + this.m_invIB * ruB * ruB;

    let mass: number = mA + this.m_ratio * this.m_ratio * mB;

    if (mass > 0) {
      mass = 1 / mass;
    }

    const C: number = this.m_constant - lengthA - this.m_ratio * lengthB;
    const linearError: number = b2Abs(C);

    const impulse: number = -mass * C;

    // b2Vec2 PA = -impulse * uA;
    const PA: b2Vec2 = b2Vec2.MulSV(-impulse, uA, b2PulleyJoint.SolvePositionConstraints_s_PA);
    // b2Vec2 PB = -m_ratio * impulse * uB;
    const PB: b2Vec2 = b2Vec2.MulSV(-this.m_ratio * impulse, uB, b2PulleyJoint.SolvePositionConstraints_s_PB);

    // cA += m_invMassA * PA;
    cA.SelfMulAdd(this.m_invMassA, PA);
    aA += this.m_invIA * b2Vec2.CrossVV(rA, PA);
    // cB += m_invMassB * PB;
    cB.SelfMulAdd(this.m_invMassB, PB);
    aB += this.m_invIB * b2Vec2.CrossVV(rB, PB);

    // data.positions[this.m_indexA].c = cA;
    data.positions[this.m_indexA].a = aA;
    // data.positions[this.m_indexB].c = cB;
    data.positions[this.m_indexB].a = aB;

    return linearError < b2_linearSlop;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    // b2Vec2 P = m_impulse * m_uB;
    // return inv_dt * P;
    out.x = inv_dt * this.m_impulse * this.m_uB.x;
    out.y = inv_dt * this.m_impulse * this.m_uB.y;
    return out;
  }

  public GetReactionTorque(inv_dt: number): number {
    return 0;
  }

  public GetGroundAnchorA() {
    return this.m_groundAnchorA;
  }

  public GetGroundAnchorB() {
    return this.m_groundAnchorB;
  }

  public GetLengthA() {
    return this.m_lengthA;
  }

  public GetLengthB() {
    return this.m_lengthB;
  }

  public GetRatio() {
    return this.m_ratio;
  }

  private static GetCurrentLengthA_s_p = new b2Vec2();
  public GetCurrentLengthA() {
    // b2Vec2 p = m_bodyA->GetWorldPoint(m_localAnchorA);
    // b2Vec2 s = m_groundAnchorA;
    // b2Vec2 d = p - s;
    // return d.Length();
    const p = this.m_bodyA.GetWorldPoint(this.m_localAnchorA, b2PulleyJoint.GetCurrentLengthA_s_p);
    const s = this.m_groundAnchorA;
    return b2Vec2.DistanceVV(p, s);
  }

  private static GetCurrentLengthB_s_p = new b2Vec2();
  public GetCurrentLengthB() {
    // b2Vec2 p = m_bodyB->GetWorldPoint(m_localAnchorB);
    // b2Vec2 s = m_groundAnchorB;
    // b2Vec2 d = p - s;
    // return d.Length();
    const p = this.m_bodyB.GetWorldPoint(this.m_localAnchorB, b2PulleyJoint.GetCurrentLengthB_s_p);
    const s = this.m_groundAnchorB;
    return b2Vec2.DistanceVV(p, s);
  }

  public Dump(log: (format: string, ...args: any[]) => void) {
    const indexA = this.m_bodyA.m_islandIndex;
    const indexB = this.m_bodyB.m_islandIndex;

    log("  const jd: b2PulleyJointDef = new b2PulleyJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
    log("  jd.groundAnchorA.Set(%.15f, %.15f);\n", this.m_groundAnchorA.x, this.m_groundAnchorA.y);
    log("  jd.groundAnchorB.Set(%.15f, %.15f);\n", this.m_groundAnchorB.x, this.m_groundAnchorB.y);
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    log("  jd.lengthA = %.15f;\n", this.m_lengthA);
    log("  jd.lengthB = %.15f;\n", this.m_lengthB);
    log("  jd.ratio = %.15f;\n", this.m_ratio);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }

  public ShiftOrigin(newOrigin: b2Vec2) {
    this.m_groundAnchorA.SelfSub(newOrigin);
    this.m_groundAnchorB.SelfSub(newOrigin);
  }
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/








 interface b2IRevoluteJointDef extends b2IJointDef {
  localAnchorA?: XY;

  localAnchorB?: XY;

  referenceAngle?: number;

  enableLimit?: boolean;

  lowerAngle?: number;

  upperAngle?: number;

  enableMotor?: boolean;

  motorSpeed?: number;

  maxMotorTorque?: number;
}

/// Revolute joint definition. This requires defining an anchor point where the
/// bodies are joined. The definition uses local anchor points so that the
/// initial configuration can violate the constraint slightly. You also need to
/// specify the initial relative angle for joint limits. This helps when saving
/// and loading a game.
/// The local anchor points are measured from the body's origin
/// rather than the center of mass because:
/// 1. you might not know where the center of mass will be.
/// 2. if you add/remove shapes from a body and recompute the mass,
///    the joints will be broken.
 class b2RevoluteJointDef extends b2JointDef implements b2IRevoluteJointDef {
  public  localAnchorA: b2Vec2 = new b2Vec2(0, 0);

  public  localAnchorB: b2Vec2 = new b2Vec2(0, 0);

  public referenceAngle: number = 0;

  public enableLimit = false;

  public lowerAngle: number = 0;

  public upperAngle: number = 0;

  public enableMotor = false;

  public motorSpeed: number = 0;

  public maxMotorTorque: number = 0;

  constructor() {
    super(b2JointType.e_revoluteJoint);
  }

  public Initialize(bA: b2Body, bB: b2Body, anchor: XY): void {
    this.bodyA = bA;
    this.bodyB = bB;
    this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
    this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
  }
}

 class b2RevoluteJoint extends b2Joint {
  // Solver shared
  public  m_localAnchorA: b2Vec2 = new b2Vec2();
  public  m_localAnchorB: b2Vec2 = new b2Vec2();
  public  m_impulse: b2Vec2 = new b2Vec2();
  public m_motorImpulse: number = 0;
  public m_lowerImpulse: number = 0;
  public m_upperImpulse: number = 0;
  public m_enableMotor: boolean = false;
  public m_maxMotorTorque: number = 0;
  public m_motorSpeed: number = 0;
  public m_enableLimit: boolean = false;
  public m_referenceAngle: number = 0;
  public m_lowerAngle: number = 0;
  public m_upperAngle: number = 0;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_rA: b2Vec2 = new b2Vec2();
  public  m_rB: b2Vec2 = new b2Vec2();
  public  m_localCenterA: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();
  public m_invMassA: number = 0;
  public m_invMassB: number = 0;
  public m_invIA: number = 0;
  public m_invIB: number = 0;
  public  m_K: b2Mat22 = new b2Mat22();
  public m_angle: number = 0;
  public m_axialMass: number = 0;

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_lalcA: b2Vec2 = new b2Vec2();
  public  m_lalcB: b2Vec2 = new b2Vec2();

  constructor(def: b2IRevoluteJointDef) {
    super(def);

    this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
    this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
    this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);

    this.m_impulse.SetZero();
    this.m_motorImpulse = 0;

    this.m_lowerAngle = b2Maybe(def.lowerAngle, 0);
    this.m_upperAngle = b2Maybe(def.upperAngle, 0);
    this.m_maxMotorTorque = b2Maybe(def.maxMotorTorque, 0);
    this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
    this.m_enableLimit = b2Maybe(def.enableLimit, false);
    this.m_enableMotor = b2Maybe(def.enableMotor, false);
  }

  private static InitVelocityConstraints_s_P = new b2Vec2();
  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    // b2Rot qA(aA), qB(aB);
    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

    // J = [-I -r1_skew I r2_skew]
    // r_skew = [-ry; rx]

    // Matlab
    // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x]
    //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB]

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    this.m_K.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
    this.m_K.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
    this.m_K.ex.y = this.m_K.ey.x;
    this.m_K.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;

    this.m_axialMass = iA + iB;
    let fixedRotation: boolean;
    if (this.m_axialMass > 0.0) {
      this.m_axialMass = 1.0 / this.m_axialMass;
      fixedRotation = false;
    } else {
      fixedRotation = true;
    }

    this.m_angle = aB - aA - this.m_referenceAngle;
    if (this.m_enableLimit === false || fixedRotation) {
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }

    if (this.m_enableMotor === false || fixedRotation) {
      this.m_motorImpulse = 0.0;
    }

    if (data.step.warmStarting) {
      // Scale impulses to support a variable time step.
      this.m_impulse.SelfMul(data.step.dtRatio);
      this.m_motorImpulse *= data.step.dtRatio;
      this.m_lowerImpulse *= data.step.dtRatio;
      this.m_upperImpulse *= data.step.dtRatio;

      const axialImpulse: number = this.m_motorImpulse + this.m_lowerImpulse - this.m_upperImpulse;
      // b2Vec2 P(m_impulse.x, m_impulse.y);
      const P: b2Vec2 = b2RevoluteJoint.InitVelocityConstraints_s_P.Set(this.m_impulse.x, this.m_impulse.y);

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + axialImpulse);

      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + axialImpulse);
    } else {
      this.m_impulse.SetZero();
      this.m_motorImpulse = 0;
      this.m_lowerImpulse = 0;
      this.m_upperImpulse = 0;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  // private static SolveVelocityConstraints_s_P: b2Vec2 = new b2Vec2();
  private static SolveVelocityConstraints_s_Cdot_v2: b2Vec2 = new b2Vec2();
  // private static SolveVelocityConstraints_s_Cdot1: b2Vec2 = new b2Vec2();
  // private static SolveVelocityConstraints_s_impulse_v3: b2Vec3 = new b2Vec3();
  // private static SolveVelocityConstraints_s_reduced_v2: b2Vec2 = new b2Vec2();
  private static SolveVelocityConstraints_s_impulse_v2: b2Vec2 = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    const fixedRotation: boolean = (iA + iB === 0);

    // Solve motor constraint.
    if (this.m_enableMotor && !fixedRotation) {
      const Cdot: number = wB - wA - this.m_motorSpeed;
      let impulse: number = -this.m_axialMass * Cdot;
      const oldImpulse: number = this.m_motorImpulse;
      const maxImpulse: number = data.step.dt * this.m_maxMotorTorque;
      this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
      impulse = this.m_motorImpulse - oldImpulse;

      wA -= iA * impulse;
      wB += iB * impulse;
    }

    // Solve limit constraint.
    if (this.m_enableLimit && !fixedRotation) {
		// Lower limit
		{
			const C: number = this.m_angle - this.m_lowerAngle;
			const Cdot: number = wB - wA;
			let impulse: number = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
			const oldImpulse: number = this.m_lowerImpulse;
			this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
			impulse = this.m_lowerImpulse - oldImpulse;

			wA -= iA * impulse;
			wB += iB * impulse;
		}

		// Upper limit
		// Note: signs are flipped to keep C positive when the constraint is satisfied.
		// This also keeps the impulse positive when the limit is active.
		{
			const C: number = this.m_upperAngle - this.m_angle;
			const Cdot: number = wA - wB;
			let impulse: number = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
			const oldImpulse: number = this.m_upperImpulse;
			this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
			impulse = this.m_upperImpulse - oldImpulse;

			wA += iA * impulse;
			wB -= iB * impulse;
		}
  }

    // Solve point-to-point constraint
    {
      // b2Vec2 Cdot = vB + b2Cross(wB, m_rB) - vA - b2Cross(wA, m_rA);
      const Cdot_v2: b2Vec2 = b2Vec2.SubVV(
        b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0),
        b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1),
        b2RevoluteJoint.SolveVelocityConstraints_s_Cdot_v2);
      // b2Vec2 impulse = m_K.Solve(-Cdot);
      const impulse_v2: b2Vec2 = this.m_K.Solve(-Cdot_v2.x, -Cdot_v2.y, b2RevoluteJoint.SolveVelocityConstraints_s_impulse_v2);

      this.m_impulse.x += impulse_v2.x;
      this.m_impulse.y += impulse_v2.y;

      // vA -= mA * impulse;
      vA.SelfMulSub(mA, impulse_v2);
      wA -= iA * b2Vec2.CrossVV(this.m_rA, impulse_v2);

      // vB += mB * impulse;
      vB.SelfMulAdd(mB, impulse_v2);
      wB += iB * b2Vec2.CrossVV(this.m_rB, impulse_v2);
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolvePositionConstraints_s_C_v2 = new b2Vec2();
  private static SolvePositionConstraints_s_impulse = new b2Vec2();
  public SolvePositionConstraints(data: b2SolverData): boolean {
    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    let aA: number = data.positions[this.m_indexA].a;
    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    let aB: number = data.positions[this.m_indexB].a;

    // b2Rot qA(aA), qB(aB);
    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    let angularError: number = 0;
    let positionError: number = 0;

    const fixedRotation: boolean = (this.m_invIA + this.m_invIB === 0);

    // Solve angular limit constraint.
    if (this.m_enableLimit && !fixedRotation) {
      const angle: number = aB - aA - this.m_referenceAngle;
      let C: number = 0.0;

      if (b2Abs(this.m_upperAngle - this.m_lowerAngle) < 2.0 * b2_angularSlop) {
        // Prevent large angular corrections
        C = b2Clamp(angle - this.m_lowerAngle, -b2_maxAngularCorrection, b2_maxAngularCorrection);
      } else if (angle <= this.m_lowerAngle) {
        // Prevent large angular corrections and allow some slop.
        C = b2Clamp(angle - this.m_lowerAngle + b2_angularSlop, -b2_maxAngularCorrection, 0.0);
      } else if (angle >= this.m_upperAngle) {
        // Prevent large angular corrections and allow some slop.
        C = b2Clamp(angle - this.m_upperAngle - b2_angularSlop, 0.0, b2_maxAngularCorrection);
      }

      const limitImpulse: number = -this.m_axialMass * C;
      aA -= this.m_invIA * limitImpulse;
      aB += this.m_invIB * limitImpulse;
      angularError = b2Abs(C);
    }

    // Solve point-to-point constraint.
    {
      qA.SetAngle(aA);
      qB.SetAngle(aB);
      // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
      b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
      const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
      // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
      b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
      const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

      // b2Vec2 C = cB + rB - cA - rA;
      const C_v2 =
        b2Vec2.SubVV(
          b2Vec2.AddVV(cB, rB, b2Vec2.s_t0),
          b2Vec2.AddVV(cA, rA, b2Vec2.s_t1),
          b2RevoluteJoint.SolvePositionConstraints_s_C_v2);
      // positionError = C.Length();
      positionError = C_v2.Length();

      const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
      const iA: number = this.m_invIA, iB: number = this.m_invIB;

      const K: b2Mat22 = this.m_K;
      K.ex.x = mA + mB + iA * rA.y * rA.y + iB * rB.y * rB.y;
      K.ex.y = -iA * rA.x * rA.y - iB * rB.x * rB.y;
      K.ey.x = K.ex.y;
      K.ey.y = mA + mB + iA * rA.x * rA.x + iB * rB.x * rB.x;

      // b2Vec2 impulse = -K.Solve(C);
      const impulse: b2Vec2 = K.Solve(C_v2.x, C_v2.y, b2RevoluteJoint.SolvePositionConstraints_s_impulse).SelfNeg();

      // cA -= mA * impulse;
      cA.SelfMulSub(mA, impulse);
      aA -= iA * b2Vec2.CrossVV(rA, impulse);

      // cB += mB * impulse;
      cB.SelfMulAdd(mB, impulse);
      aB += iB * b2Vec2.CrossVV(rB, impulse);
    }

    // data.positions[this.m_indexA].c = cA;
    data.positions[this.m_indexA].a = aA;
    // data.positions[this.m_indexB].c = cB;
    data.positions[this.m_indexB].a = aB;

    return positionError <= b2_linearSlop && angularError <= b2_angularSlop;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    // b2Vec2 P(this.m_impulse.x, this.m_impulse.y);
    // return inv_dt * P;
    out.x = inv_dt * this.m_impulse.x;
    out.y = inv_dt * this.m_impulse.y;
    return out;
  }

  public GetReactionTorque(inv_dt: number): number {
    return inv_dt * (this.m_lowerImpulse - this.m_upperImpulse);
  }

  public GetLocalAnchorA():b2Vec2 { return this.m_localAnchorA; }

  public GetLocalAnchorB():b2Vec2 { return this.m_localAnchorB; }

  public GetReferenceAngle(): number { return this.m_referenceAngle; }

  public GetJointAngle(): number {
    // b2Body* bA = this.m_bodyA;
    // b2Body* bB = this.m_bodyB;
    // return bB.this.m_sweep.a - bA.this.m_sweep.a - this.m_referenceAngle;
    return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle;
  }

  public GetJointSpeed(): number {
    // b2Body* bA = this.m_bodyA;
    // b2Body* bB = this.m_bodyB;
    // return bB.this.m_angularVelocity - bA.this.m_angularVelocity;
    return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity;
  }

  public IsMotorEnabled(): boolean {
    return this.m_enableMotor;
  }

  public EnableMotor(flag: boolean): void {
    if (flag !== this.m_enableMotor) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_enableMotor = flag;
    }
  }

  public GetMotorTorque(inv_dt: number): number {
    return inv_dt * this.m_motorImpulse;
  }

  public GetMotorSpeed(): number {
    return this.m_motorSpeed;
  }

  public SetMaxMotorTorque(torque: number): void {
    if (torque !== this.m_maxMotorTorque) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_maxMotorTorque = torque;
    }
  }

  public GetMaxMotorTorque(): number { return this.m_maxMotorTorque; }

  public IsLimitEnabled(): boolean {
    return this.m_enableLimit;
  }

  public EnableLimit(flag: boolean): void {
    if (flag !== this.m_enableLimit) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_enableLimit = flag;
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }
  }

  public GetLowerLimit(): number {
    return this.m_lowerAngle;
  }

  public GetUpperLimit(): number {
    return this.m_upperAngle;
  }

  public SetLimits(lower: number, upper: number): void {

    if (lower !== this.m_lowerAngle || upper !== this.m_upperAngle) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
      this.m_lowerAngle = lower;
      this.m_upperAngle = upper;
    }
  }

  public SetMotorSpeed(speed: number): void {
    if (speed !== this.m_motorSpeed) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_motorSpeed = speed;
    }
  }

  public Dump(log: (format: string, ...args: any[]) => void) {
    const indexA = this.m_bodyA.m_islandIndex;
    const indexB = this.m_bodyB.m_islandIndex;

    log("  const jd: b2RevoluteJointDef = new b2RevoluteJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
    log("  jd.enableLimit = %s;\n", (this.m_enableLimit) ? ("true") : ("false"));
    log("  jd.lowerAngle = %.15f;\n", this.m_lowerAngle);
    log("  jd.upperAngle = %.15f;\n", this.m_upperAngle);
    log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
    log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
    log("  jd.maxMotorTorque = %.15f;\n", this.m_maxMotorTorque);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }

  private static Draw_s_pA = new b2Vec2();
  private static Draw_s_pB = new b2Vec2();
  private static Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
  private static Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
  private static Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
  private static Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
  private static Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
  private static Draw_s_color_ = new b2Color(0.5, 0.8, 0.8);
  private static Draw_s_r = new b2Vec2();
  private static Draw_s_rlo = new b2Vec2();
  private static Draw_s_rhi = new b2Vec2();
  public Draw(draw: b2Draw): void {
    const xfA: b2Transform = this.m_bodyA.GetTransform();
    const xfB: b2Transform = this.m_bodyB.GetTransform();
    const pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2RevoluteJoint.Draw_s_pA);
    const pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2RevoluteJoint.Draw_s_pB);

    const c1 = b2RevoluteJoint.Draw_s_c1; // b2Color c1(0.7f, 0.7f, 0.7f);
    const c2 = b2RevoluteJoint.Draw_s_c2; // b2Color c2(0.3f, 0.9f, 0.3f);
    const c3 = b2RevoluteJoint.Draw_s_c3; // b2Color c3(0.9f, 0.3f, 0.3f);
    const c4 = b2RevoluteJoint.Draw_s_c4; // b2Color c4(0.3f, 0.3f, 0.9f);
    const c5 = b2RevoluteJoint.Draw_s_c5; // b2Color c5(0.4f, 0.4f, 0.4f);

    draw.DrawPoint(pA, 5.0, c4);
    draw.DrawPoint(pB, 5.0, c5);

    const aA: number = this.m_bodyA.GetAngle();
    const aB: number = this.m_bodyB.GetAngle();
    const angle: number = aB - aA - this.m_referenceAngle;

    const L: number = 0.5;

    // b2Vec2 r = L * b2Vec2(Math.cos(angle), Math.sin(angle));
    const r = b2RevoluteJoint.Draw_s_r.Set(L * Math.cos(angle), L * Math.sin(angle));
    // draw.DrawSegment(pB, pB + r, c1);
    draw.DrawSegment(pB, b2Vec2.AddVV(pB, r, b2Vec2.s_t0), c1);
    draw.DrawCircle(pB, L, c1);

    if (this.m_enableLimit) {
      // b2Vec2 rlo = L * b2Vec2(Math.cos(m_lowerAngle), Math.sin(m_lowerAngle));
      const rlo = b2RevoluteJoint.Draw_s_rlo.Set(L * Math.cos(this.m_lowerAngle), L * Math.sin(this.m_lowerAngle));
      // b2Vec2 rhi = L * b2Vec2(Math.cos(m_upperAngle), Math.sin(m_upperAngle));
      const rhi = b2RevoluteJoint.Draw_s_rhi.Set(L * Math.cos(this.m_upperAngle), L * Math.sin(this.m_upperAngle));

      // draw.DrawSegment(pB, pB + rlo, c2);
      draw.DrawSegment(pB, b2Vec2.AddVV(pB, rlo, b2Vec2.s_t0), c2);
      // draw.DrawSegment(pB, pB + rhi, c3);
      draw.DrawSegment(pB, b2Vec2.AddVV(pB, rhi, b2Vec2.s_t0), c3);
    }

    const color = b2RevoluteJoint.Draw_s_color_; // b2Color color(0.5f, 0.8f, 0.8f);
    draw.DrawSegment(xfA.p, pA, color);
    draw.DrawSegment(pA, pB, color);
    draw.DrawSegment(xfB.p, pB, color);
  }
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/




/// Profiling data. Times are in milliseconds.
 class b2Profile {
  public step: number = 0;
  public collide: number = 0;
  public solve: number = 0;
  public solveInit: number = 0;
  public solveVelocity: number = 0;
  public solvePosition: number = 0;
  public broadphase: number = 0;
  public solveTOI: number = 0;

  public Reset() {
    this.step = 0;
    this.collide = 0;
    this.solve = 0;
    this.solveInit = 0;
    this.solveVelocity = 0;
    this.solvePosition = 0;
    this.broadphase = 0;
    this.solveTOI = 0;
    return this;
  }
}

/// This is an internal structure.
 class b2TimeStep {
  public dt: number = 0; // time step
  public inv_dt: number = 0; // inverse time step (0 if dt == 0).
  public dtRatio: number = 0; // dt * inv_dt0
  public velocityIterations: number = 0;
  public positionIterations: number = 0;
  // #if B2_ENABLE_PARTICLE
  public particleIterations: number = 0;
  // #endif
  public warmStarting: boolean = false;

  public Copy(step: b2TimeStep): b2TimeStep {
    this.dt = step.dt;
    this.inv_dt = step.inv_dt;
    this.dtRatio = step.dtRatio;
    this.positionIterations = step.positionIterations;
    this.velocityIterations = step.velocityIterations;
    // #if B2_ENABLE_PARTICLE
    this.particleIterations = step.particleIterations;
    // #endif
    this.warmStarting = step.warmStarting;
    return this;
  }
}

 class b2Position {
  public  c: b2Vec2 = new b2Vec2();
  public a: number = 0;

  public static MakeArray(length: number): b2Position[] {
    return b2MakeArray(length, (i: number): b2Position => new b2Position());
  }
}

 class b2Velocity {
  public  v: b2Vec2 = new b2Vec2();
  public w: number = 0;

  public static MakeArray(length: number): b2Velocity[] {
    return b2MakeArray(length, (i: number): b2Velocity => new b2Velocity());
  }
}

 class b2SolverData {
  public  step: b2TimeStep = new b2TimeStep();
  public positions: b2Position[];
  public velocities: b2Velocity[];
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/







 interface b2IWeldJointDef extends b2IJointDef {
  localAnchorA?: XY;

  localAnchorB?: XY;

  referenceAngle?: number;

  stiffness?: number;

  damping?: number;
}

/// Weld joint definition. You need to specify local anchor points
/// where they are attached and the relative body angle. The position
/// of the anchor points is important for computing the reaction torque.
 class b2WeldJointDef extends b2JointDef implements b2IWeldJointDef {
  public  localAnchorA: b2Vec2 = new b2Vec2();

  public  localAnchorB: b2Vec2 = new b2Vec2();

  public referenceAngle: number = 0;

  public stiffness: number = 0;

  public damping: number = 0;

  constructor() {
    super(b2JointType.e_weldJoint);
  }

  public Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2): void {
    this.bodyA = bA;
    this.bodyB = bB;
    this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
    this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle();
  }
}

 class b2WeldJoint extends b2Joint {
  public m_stiffness: number = 0;
  public m_damping: number = 0;
  public m_bias: number = 0;

  // Solver shared
  public  m_localAnchorA: b2Vec2 = new b2Vec2();
  public  m_localAnchorB: b2Vec2 = new b2Vec2();
  public m_referenceAngle: number = 0;
  public m_gamma: number = 0;
  public  m_impulse: b2Vec3 = new b2Vec3(0, 0, 0);

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_rA: b2Vec2 = new b2Vec2();
  public  m_rB: b2Vec2 = new b2Vec2();
  public  m_localCenterA: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();
  public m_invMassA: number = 0;
  public m_invMassB: number = 0;
  public m_invIA: number = 0;
  public m_invIB: number = 0;
  public  m_mass: b2Mat33 = new b2Mat33();

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_lalcA: b2Vec2 = new b2Vec2();
  public  m_lalcB: b2Vec2 = new b2Vec2();
  public  m_K: b2Mat33 = new b2Mat33();

  constructor(def: b2IWeldJointDef) {
    super(def);

    this.m_stiffness = b2Maybe(def.stiffness, 0);
    this.m_damping = b2Maybe(def.damping, 0);

    this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
    this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
    this.m_referenceAngle = b2Maybe(def.referenceAngle, 0);
    this.m_impulse.SetZero();
  }

  private static InitVelocityConstraints_s_P = new b2Vec2();
  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // m_rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // m_rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

    // J = [-I -r1_skew I r2_skew]
    //     [ 0       -1 0       1]
    // r_skew = [-ry; rx]

    // Matlab
    // K = [ mA+r1y^2*iA+mB+r2y^2*iB,  -r1y*iA*r1x-r2y*iB*r2x,          -r1y*iA-r2y*iB]
    //     [  -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB,           r1x*iA+r2x*iB]
    //     [          -r1y*iA-r2y*iB,           r1x*iA+r2x*iB,                   iA+iB]

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    const K: b2Mat33 = this.m_K;
    K.ex.x = mA + mB + this.m_rA.y * this.m_rA.y * iA + this.m_rB.y * this.m_rB.y * iB;
    K.ey.x = -this.m_rA.y * this.m_rA.x * iA - this.m_rB.y * this.m_rB.x * iB;
    K.ez.x = -this.m_rA.y * iA - this.m_rB.y * iB;
    K.ex.y = K.ey.x;
    K.ey.y = mA + mB + this.m_rA.x * this.m_rA.x * iA + this.m_rB.x * this.m_rB.x * iB;
    K.ez.y = this.m_rA.x * iA + this.m_rB.x * iB;
    K.ex.z = K.ez.x;
    K.ey.z = K.ez.y;
    K.ez.z = iA + iB;

    if (this.m_stiffness > 0) {
      K.GetInverse22(this.m_mass);

      let invM: number = iA + iB;

      const C: number = aB - aA - this.m_referenceAngle;

      // Damping coefficient
      const d: number = this.m_damping;

      // Spring stiffness
      const k: number = this.m_stiffness;

      // magic formulas
      const h: number = data.step.dt;
      this.m_gamma = h * (d + h * k);
      this.m_gamma = this.m_gamma !== 0 ? 1 / this.m_gamma : 0;
      this.m_bias = C * h * k * this.m_gamma;

      invM += this.m_gamma;
      this.m_mass.ez.z = invM !== 0 ? 1 / invM : 0;
    } else {
      K.GetSymInverse33(this.m_mass);
      this.m_gamma = 0;
      this.m_bias = 0;
    }

    if (data.step.warmStarting) {
      // Scale impulses to support a variable time step.
      this.m_impulse.SelfMul(data.step.dtRatio);

      // b2Vec2 P(m_impulse.x, m_impulse.y);
      const P: b2Vec2 = b2WeldJoint.InitVelocityConstraints_s_P.Set(this.m_impulse.x, this.m_impulse.y);

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + this.m_impulse.z);

      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + this.m_impulse.z);
    } else {
      this.m_impulse.SetZero();
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_Cdot1 = new b2Vec2();
  private static SolveVelocityConstraints_s_impulse1 = new b2Vec2();
  private static SolveVelocityConstraints_s_impulse = new b2Vec3();
  private static SolveVelocityConstraints_s_P = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    if (this.m_stiffness > 0) {
      const Cdot2: number = wB - wA;

      const impulse2: number = -this.m_mass.ez.z * (Cdot2 + this.m_bias + this.m_gamma * this.m_impulse.z);
      this.m_impulse.z += impulse2;

      wA -= iA * impulse2;
      wB += iB * impulse2;

      // b2Vec2 Cdot1 = vB + b2Vec2.CrossSV(wB, this.m_rB) - vA - b2Vec2.CrossSV(wA, this.m_rA);
      const Cdot1: b2Vec2 = b2Vec2.SubVV(
        b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0),
        b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1),
        b2WeldJoint.SolveVelocityConstraints_s_Cdot1);

      // b2Vec2 impulse1 = -b2Mul22(m_mass, Cdot1);
      const impulse1: b2Vec2 = b2Mat33.MulM33XY(this.m_mass, Cdot1.x, Cdot1.y, b2WeldJoint.SolveVelocityConstraints_s_impulse1).SelfNeg();
      this.m_impulse.x += impulse1.x;
      this.m_impulse.y += impulse1.y;

      // b2Vec2 P = impulse1;
      const P: b2Vec2 = impulse1;

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      // wA -= iA * b2Cross(m_rA, P);
      wA -= iA * b2Vec2.CrossVV(this.m_rA, P);

      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      // wB += iB * b2Cross(m_rB, P);
      wB += iB * b2Vec2.CrossVV(this.m_rB, P);
    } else {
      // b2Vec2 Cdot1 = vB + b2Cross(wB, this.m_rB) - vA - b2Cross(wA, this.m_rA);
      const Cdot1: b2Vec2 = b2Vec2.SubVV(
        b2Vec2.AddVCrossSV(vB, wB, this.m_rB, b2Vec2.s_t0),
        b2Vec2.AddVCrossSV(vA, wA, this.m_rA, b2Vec2.s_t1),
        b2WeldJoint.SolveVelocityConstraints_s_Cdot1);
      const Cdot2: number = wB - wA;
      // b2Vec3 const Cdot(Cdot1.x, Cdot1.y, Cdot2);

      // b2Vec3 impulse = -b2Mul(m_mass, Cdot);
      const impulse: b2Vec3 = b2Mat33.MulM33XYZ(this.m_mass, Cdot1.x, Cdot1.y, Cdot2, b2WeldJoint.SolveVelocityConstraints_s_impulse).SelfNeg();
      this.m_impulse.SelfAdd(impulse);

      // b2Vec2 P(impulse.x, impulse.y);
      const P: b2Vec2 = b2WeldJoint.SolveVelocityConstraints_s_P.Set(impulse.x, impulse.y);

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + impulse.z);

      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * (b2Vec2.CrossVV(this.m_rB, P) + impulse.z);
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolvePositionConstraints_s_C1 = new b2Vec2();
  private static SolvePositionConstraints_s_P = new b2Vec2();
  private static SolvePositionConstraints_s_impulse = new b2Vec3();
  public SolvePositionConstraints(data: b2SolverData): boolean {
    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    let aA: number = data.positions[this.m_indexA].a;
    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    let aB: number = data.positions[this.m_indexB].a;

    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);

    let positionError: number, angularError: number;

    const K: b2Mat33 = this.m_K;
    K.ex.x = mA + mB + rA.y * rA.y * iA + rB.y * rB.y * iB;
    K.ey.x = -rA.y * rA.x * iA - rB.y * rB.x * iB;
    K.ez.x = -rA.y * iA - rB.y * iB;
    K.ex.y = K.ey.x;
    K.ey.y = mA + mB + rA.x * rA.x * iA + rB.x * rB.x * iB;
    K.ez.y = rA.x * iA + rB.x * iB;
    K.ex.z = K.ez.x;
    K.ey.z = K.ez.y;
    K.ez.z = iA + iB;

    if (this.m_stiffness > 0) {
      // b2Vec2 C1 =  cB + rB - cA - rA;
      const C1 =
        b2Vec2.SubVV(
          b2Vec2.AddVV(cB, rB, b2Vec2.s_t0),
          b2Vec2.AddVV(cA, rA, b2Vec2.s_t1),
          b2WeldJoint.SolvePositionConstraints_s_C1);
      positionError = C1.Length();
      angularError = 0;

      // b2Vec2 P = -K.Solve22(C1);
      const P: b2Vec2 = K.Solve22(C1.x, C1.y, b2WeldJoint.SolvePositionConstraints_s_P).SelfNeg();

      // cA -= mA * P;
      cA.SelfMulSub(mA, P);
      aA -= iA * b2Vec2.CrossVV(rA, P);

      // cB += mB * P;
      cB.SelfMulAdd(mB, P);
      aB += iB * b2Vec2.CrossVV(rB, P);
    } else {
      // b2Vec2 C1 =  cB + rB - cA - rA;
      const C1 =
        b2Vec2.SubVV(
          b2Vec2.AddVV(cB, rB, b2Vec2.s_t0),
          b2Vec2.AddVV(cA, rA, b2Vec2.s_t1),
          b2WeldJoint.SolvePositionConstraints_s_C1);
      const C2: number = aB - aA - this.m_referenceAngle;

      positionError = C1.Length();
      angularError = b2Abs(C2);

      // b2Vec3 C(C1.x, C1.y, C2);

      // b2Vec3 impulse = -K.Solve33(C);
      const impulse: b2Vec3 = K.Solve33(C1.x, C1.y, C2, b2WeldJoint.SolvePositionConstraints_s_impulse).SelfNeg();

      // b2Vec2 P(impulse.x, impulse.y);
      const P: b2Vec2 = b2WeldJoint.SolvePositionConstraints_s_P.Set(impulse.x, impulse.y);

      // cA -= mA * P;
      cA.SelfMulSub(mA, P);
      aA -= iA * (b2Vec2.CrossVV(this.m_rA, P) + impulse.z);

      // cB += mB * P;
      cB.SelfMulAdd(mB, P);
      aB += iB * (b2Vec2.CrossVV(this.m_rB, P) + impulse.z);
    }

    // data.positions[this.m_indexA].c = cA;
    data.positions[this.m_indexA].a = aA;
    // data.positions[this.m_indexB].c = cB;
    data.positions[this.m_indexB].a = aB;

    return positionError <= b2_linearSlop && angularError <= b2_angularSlop;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    // b2Vec2 P(this.m_impulse.x, this.m_impulse.y);
    // return inv_dt * P;
    out.x = inv_dt * this.m_impulse.x;
    out.y = inv_dt * this.m_impulse.y;
    return out;
  }

  public GetReactionTorque(inv_dt: number): number {
    return inv_dt * this.m_impulse.z;
  }

  public GetLocalAnchorA():b2Vec2 { return this.m_localAnchorA; }

  public GetLocalAnchorB():b2Vec2 { return this.m_localAnchorB; }

  public GetReferenceAngle(): number { return this.m_referenceAngle; }

  public SetStiffness(stiffness: number): void { this.m_stiffness = stiffness; }
  public GetStiffness(): number { return this.m_stiffness; }

  public SetDamping(damping: number) { this.m_damping = damping; }
  public GetDamping() { return this.m_damping; }

  public Dump(log: (format: string, ...args: any[]) => void) {
    const indexA = this.m_bodyA.m_islandIndex;
    const indexB = this.m_bodyB.m_islandIndex;

    log("  const jd: b2WeldJointDef = new b2WeldJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    log("  jd.referenceAngle = %.15f;\n", this.m_referenceAngle);
    log("  jd.stiffness = %.15f;\n", this.m_stiffness);
    log("  jd.damping = %.15f;\n", this.m_damping);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 







 interface b2IWheelJointDef extends b2IJointDef {
  /// The local anchor point relative to bodyA's origin.
  localAnchorA?: XY;

  /// The local anchor point relative to bodyB's origin.
  localAnchorB?: XY;

  /// The local translation axis in bodyA.
  localAxisA?: XY;

  /// Enable/disable the joint limit.
  enableLimit?: boolean;

  /// The lower translation limit, usually in meters.
  lowerTranslation?: number;

  /// The upper translation limit, usually in meters.
  upperTranslation?: number;

  /// Enable/disable the joint motor.
  enableMotor?: boolean;

  /// The maximum motor torque, usually in N-m.
  maxMotorTorque?: number;

  /// The desired motor speed in radians per second.
  motorSpeed?: number;

  /// Suspension stiffness. Typically in units N/m.
  stiffness?: number;

  /// Suspension damping. Typically in units of N*s/m.
  damping?: number;
}

/// Wheel joint definition. This requires defining a line of
/// motion using an axis and an anchor point. The definition uses local
/// anchor points and a local axis so that the initial configuration
/// can violate the constraint slightly. The joint translation is zero
/// when the local anchor points coincide in world space. Using local
/// anchors and a local axis helps when saving and loading a game.
 class b2WheelJointDef extends b2JointDef implements b2IWheelJointDef {
  public  localAnchorA: b2Vec2 = new b2Vec2(0, 0);

  public  localAnchorB: b2Vec2 = new b2Vec2(0, 0);

  public  localAxisA: b2Vec2 = new b2Vec2(1, 0);

  public enableLimit: boolean = false;

  public lowerTranslation: number = 0;

  public upperTranslation: number = 0;

  public enableMotor = false;

  public maxMotorTorque: number = 0;

  public motorSpeed: number = 0;

  public stiffness: number = 0;

  public damping: number = 0;

  constructor() {
    super(b2JointType.e_wheelJoint);
  }

  public Initialize(bA: b2Body, bB: b2Body, anchor: b2Vec2, axis: b2Vec2): void {
    this.bodyA = bA;
    this.bodyB = bB;
    this.bodyA.GetLocalPoint(anchor, this.localAnchorA);
    this.bodyB.GetLocalPoint(anchor, this.localAnchorB);
    this.bodyA.GetLocalVector(axis, this.localAxisA);
  }
}

 class b2WheelJoint extends b2Joint {
  public  m_localAnchorA: b2Vec2 = new b2Vec2();
  public  m_localAnchorB: b2Vec2 = new b2Vec2();
  public  m_localXAxisA: b2Vec2 = new b2Vec2();
  public  m_localYAxisA: b2Vec2 = new b2Vec2();

  public m_impulse: number = 0;
  public m_motorImpulse: number = 0;
  public m_springImpulse: number = 0;

  public m_lowerImpulse: number = 0;
  public m_upperImpulse: number = 0;
  public m_translation: number = 0;
  public m_lowerTranslation: number = 0;
  public m_upperTranslation: number = 0;

  public m_maxMotorTorque: number = 0;
  public m_motorSpeed: number = 0;

  public m_enableLimit = false;
  public m_enableMotor = false;

  public m_stiffness: number = 0;
  public m_damping: number = 0;

  // Solver temp
  public m_indexA: number = 0;
  public m_indexB: number = 0;
  public  m_localCenterA: b2Vec2 = new b2Vec2();
  public  m_localCenterB: b2Vec2 = new b2Vec2();
  public m_invMassA: number = 0;
  public m_invMassB: number = 0;
  public m_invIA: number = 0;
  public m_invIB: number = 0;

  public  m_ax: b2Vec2 = new b2Vec2();
  public  m_ay: b2Vec2 = new b2Vec2();
  public m_sAx: number = 0;
  public m_sBx: number = 0;
  public m_sAy: number = 0;
  public m_sBy: number = 0;

  public m_mass: number = 0;
  public m_motorMass: number = 0;
  public m_axialMass: number = 0;
  public m_springMass: number = 0;

  public m_bias: number = 0;
  public m_gamma: number = 0;

  public  m_qA: b2Rot = new b2Rot();
  public  m_qB: b2Rot = new b2Rot();
  public  m_lalcA: b2Vec2 = new b2Vec2();
  public  m_lalcB: b2Vec2 = new b2Vec2();
  public  m_rA: b2Vec2 = new b2Vec2();
  public  m_rB: b2Vec2 = new b2Vec2();

  constructor(def: b2IWheelJointDef) {
    super(def);

    this.m_localAnchorA.Copy(b2Maybe(def.localAnchorA, b2Vec2.ZERO));
    this.m_localAnchorB.Copy(b2Maybe(def.localAnchorB, b2Vec2.ZERO));
    this.m_localXAxisA.Copy(b2Maybe(def.localAxisA, b2Vec2.UNITX));
    b2Vec2.CrossOneV(this.m_localXAxisA, this.m_localYAxisA);

    this.m_lowerTranslation = b2Maybe(def.lowerTranslation, 0);
    this.m_upperTranslation = b2Maybe(def.upperTranslation, 0);
    this.m_enableLimit = b2Maybe(def.enableLimit, false);

    this.m_maxMotorTorque = b2Maybe(def.maxMotorTorque, 0);
    this.m_motorSpeed = b2Maybe(def.motorSpeed, 0);
    this.m_enableMotor = b2Maybe(def.enableMotor, false);

    this.m_ax.SetZero();
    this.m_ay.SetZero();

    this.m_stiffness = b2Maybe(def.stiffness, 0);
    this.m_damping = b2Maybe(def.damping, 0);
  }

  public GetMotorSpeed(): number {
    return this.m_motorSpeed;
  }

  public GetMaxMotorTorque(): number {
    return this.m_maxMotorTorque;
  }

  public SetSpringFrequencyHz(hz: number): void {
    this.m_stiffness = hz;
  }

  public GetSpringFrequencyHz(): number {
    return this.m_stiffness;
  }

  public SetSpringDampingRatio(ratio: number): void {
    this.m_damping = ratio;
  }

  public GetSpringDampingRatio(): number {
    return this.m_damping;
  }

  private static InitVelocityConstraints_s_d = new b2Vec2();
  private static InitVelocityConstraints_s_P = new b2Vec2();
  public InitVelocityConstraints(data: b2SolverData): void {
    this.m_indexA = this.m_bodyA.m_islandIndex;
    this.m_indexB = this.m_bodyB.m_islandIndex;
    this.m_localCenterA.Copy(this.m_bodyA.m_sweep.localCenter);
    this.m_localCenterB.Copy(this.m_bodyB.m_sweep.localCenter);
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    const aA: number = data.positions[this.m_indexA].a;
    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;

    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    const aB: number = data.positions[this.m_indexB].a;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // Compute the effective masses.
    // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
    // b2Vec2 d = cB + rB - cA - rA;
    const d: b2Vec2 = b2Vec2.SubVV(
      b2Vec2.AddVV(cB, rB, b2Vec2.s_t0),
      b2Vec2.AddVV(cA, rA, b2Vec2.s_t1),
      b2WheelJoint.InitVelocityConstraints_s_d);

    // Point to line constraint
    {
      // m_ay = b2Mul(qA, m_localYAxisA);
      b2Rot.MulRV(qA, this.m_localYAxisA, this.m_ay);
      // m_sAy = b2Cross(d + rA, m_ay);
      this.m_sAy = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ay);
      // m_sBy = b2Cross(rB, m_ay);
      this.m_sBy = b2Vec2.CrossVV(rB, this.m_ay);

      this.m_mass = mA + mB + iA * this.m_sAy * this.m_sAy + iB * this.m_sBy * this.m_sBy;

      if (this.m_mass > 0) {
        this.m_mass = 1 / this.m_mass;
      }
    }

    // Spring constraint
    b2Rot.MulRV(qA, this.m_localXAxisA, this.m_ax); // m_ax = b2Mul(qA, m_localXAxisA);
    this.m_sAx = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ax);
    this.m_sBx = b2Vec2.CrossVV(rB, this.m_ax);

    const invMass: number = mA + mB + iA * this.m_sAx * this.m_sAx + iB * this.m_sBx * this.m_sBx;
    if (invMass > 0.0) {
      this.m_axialMass = 1.0 / invMass;
    } else {
      this.m_axialMass = 0.0;
    }

    this.m_springMass = 0;
    this.m_bias = 0;
    this.m_gamma = 0;

    if (this.m_stiffness > 0.0 && invMass > 0.0) {
      this.m_springMass = 1.0 / invMass;

      const C: number = b2Vec2.DotVV(d, this.m_ax);

      // magic formulas
      const h: number = data.step.dt;
      this.m_gamma = h * (this.m_damping + h * this.m_stiffness);
      if (this.m_gamma > 0.0) {
        this.m_gamma = 1.0 / this.m_gamma;
      }

      this.m_bias = C * h * this.m_stiffness * this.m_gamma;

      this.m_springMass = invMass + this.m_gamma;
      if (this.m_springMass > 0.0) {
        this.m_springMass = 1.0 / this.m_springMass;
      }
    } else {
      this.m_springImpulse = 0.0;
    }

    if (this.m_enableLimit) {
      this.m_translation = b2Vec2.DotVV(this.m_ax, d);
    } else {
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }

    if (this.m_enableMotor) {
      this.m_motorMass = iA + iB;
      if (this.m_motorMass > 0) {
        this.m_motorMass = 1 / this.m_motorMass;
      }
    } else {
      this.m_motorMass = 0;
      this.m_motorImpulse = 0;
    }

    if (data.step.warmStarting) {
      // Account for variable time step.
      this.m_impulse *= data.step.dtRatio;
      this.m_springImpulse *= data.step.dtRatio;
      this.m_motorImpulse *= data.step.dtRatio;

      const axialImpulse: number = this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse;
      // b2Vec2 P = m_impulse * m_ay + m_springImpulse * m_ax;
      const P: b2Vec2 = b2Vec2.AddVV(
        b2Vec2.MulSV(this.m_impulse, this.m_ay, b2Vec2.s_t0),
        b2Vec2.MulSV(axialImpulse, this.m_ax, b2Vec2.s_t1),
        b2WheelJoint.InitVelocityConstraints_s_P);
      // float32 LA = m_impulse * m_sAy + m_springImpulse * m_sAx + m_motorImpulse;
      const LA: number = this.m_impulse * this.m_sAy + axialImpulse * this.m_sAx + this.m_motorImpulse;
      // float32 LB = m_impulse * m_sBy + m_springImpulse * m_sBx + m_motorImpulse;
      const LB: number = this.m_impulse * this.m_sBy + axialImpulse * this.m_sBx + this.m_motorImpulse;

      // vA -= m_invMassA * P;
      vA.SelfMulSub(this.m_invMassA, P);
      wA -= this.m_invIA * LA;

      // vB += m_invMassB * P;
      vB.SelfMulAdd(this.m_invMassB, P);
      wB += this.m_invIB * LB;
    } else {
      this.m_impulse = 0;
      this.m_springImpulse = 0;
      this.m_motorImpulse = 0;
      this.m_lowerImpulse = 0;
      this.m_upperImpulse = 0;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolveVelocityConstraints_s_P = new b2Vec2();
  public SolveVelocityConstraints(data: b2SolverData): void {
    const mA: number = this.m_invMassA, mB: number = this.m_invMassB;
    const iA: number = this.m_invIA, iB: number = this.m_invIB;

    const vA: b2Vec2 = data.velocities[this.m_indexA].v;
    let wA: number = data.velocities[this.m_indexA].w;
    const vB: b2Vec2 = data.velocities[this.m_indexB].v;
    let wB: number = data.velocities[this.m_indexB].w;

    // Solve spring constraint
    {
      const Cdot: number = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBx * wB - this.m_sAx * wA;
      const impulse: number = -this.m_springMass * (Cdot + this.m_bias + this.m_gamma * this.m_springImpulse);
      this.m_springImpulse += impulse;

      // b2Vec2 P = impulse * m_ax;
      const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
      const LA: number = impulse * this.m_sAx;
      const LB: number = impulse * this.m_sBx;

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * LA;

      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * LB;
    }

    // Solve rotational motor constraint
    {
      const Cdot: number = wB - wA - this.m_motorSpeed;
      let impulse: number = -this.m_motorMass * Cdot;

      const oldImpulse: number = this.m_motorImpulse;
      const maxImpulse: number = data.step.dt * this.m_maxMotorTorque;
      this.m_motorImpulse = b2Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
      impulse = this.m_motorImpulse - oldImpulse;

      wA -= iA * impulse;
      wB += iB * impulse;
    }

    if (this.m_enableLimit) {
      // Lower limit
      {
        const C: number = this.m_translation - this.m_lowerTranslation;
        const Cdot: number = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBx * wB - this.m_sAx * wA;
        let impulse: number = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
        const oldImpulse: number = this.m_lowerImpulse;
        this.m_lowerImpulse = b2Max(this.m_lowerImpulse + impulse, 0.0);
        impulse = this.m_lowerImpulse - oldImpulse;

        // b2Vec2 P = impulse * this.m_ax;
        const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
        const LA: number = impulse * this.m_sAx;
        const LB: number = impulse * this.m_sBx;

        // vA -= mA * P;
        vA.SelfMulSub(mA, P);
        wA -= iA * LA;
        // vB += mB * P;
        vB.SelfMulAdd(mB, P);
        wB += iB * LB;
      }

      // Upper limit
      // Note: signs are flipped to keep C positive when the constraint is satisfied.
      // This also keeps the impulse positive when the limit is active.
      {
        const C: number = this.m_upperTranslation - this.m_translation;
        const Cdot: number = b2Vec2.DotVV(this.m_ax, b2Vec2.SubVV(vA, vB, b2Vec2.s_t0)) + this.m_sAx * wA - this.m_sBx * wB;
        let impulse: number = -this.m_axialMass * (Cdot + b2Max(C, 0.0) * data.step.inv_dt);
        const oldImpulse: number = this.m_upperImpulse;
        this.m_upperImpulse = b2Max(this.m_upperImpulse + impulse, 0.0);
        impulse = this.m_upperImpulse - oldImpulse;

        // b2Vec2 P = impulse * this.m_ax;
        const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_ax, b2WheelJoint.SolveVelocityConstraints_s_P);
        const LA: number = impulse * this.m_sAx;
        const LB: number = impulse * this.m_sBx;

        // vA += mA * P;
        vA.SelfMulAdd(mA, P);
        wA += iA * LA;
        // vB -= mB * P;
        vB.SelfMulSub(mB, P);
        wB -= iB * LB;
      }
    }

    // Solve point to line constraint
    {
      const Cdot: number = b2Vec2.DotVV(this.m_ay, b2Vec2.SubVV(vB, vA, b2Vec2.s_t0)) + this.m_sBy * wB - this.m_sAy * wA;
      const impulse: number = -this.m_mass * Cdot;
      this.m_impulse += impulse;

      // b2Vec2 P = impulse * m_ay;
      const P: b2Vec2 = b2Vec2.MulSV(impulse, this.m_ay, b2WheelJoint.SolveVelocityConstraints_s_P);
      const LA: number = impulse * this.m_sAy;
      const LB: number = impulse * this.m_sBy;

      // vA -= mA * P;
      vA.SelfMulSub(mA, P);
      wA -= iA * LA;

      // vB += mB * P;
      vB.SelfMulAdd(mB, P);
      wB += iB * LB;
    }

    // data.velocities[this.m_indexA].v = vA;
    data.velocities[this.m_indexA].w = wA;
    // data.velocities[this.m_indexB].v = vB;
    data.velocities[this.m_indexB].w = wB;
  }

  private static SolvePositionConstraints_s_d = new b2Vec2();
  private static SolvePositionConstraints_s_P = new b2Vec2();
  public SolvePositionConstraints(data: b2SolverData): boolean {
    const cA: b2Vec2 = data.positions[this.m_indexA].c;
    let aA: number = data.positions[this.m_indexA].a;
    const cB: b2Vec2 = data.positions[this.m_indexB].c;
    let aB: number = data.positions[this.m_indexB].a;

    // const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

    // // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
    // b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
    // const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
    // // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
    // b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
    // const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
    // // b2Vec2 d = (cB - cA) + rB - rA;
    // const d: b2Vec2 = b2Vec2.AddVV(
    //   b2Vec2.SubVV(cB, cA, b2Vec2.s_t0),
    //   b2Vec2.SubVV(rB, rA, b2Vec2.s_t1),
    //   b2WheelJoint.SolvePositionConstraints_s_d);

    // // b2Vec2 ay = b2Mul(qA, m_localYAxisA);
    // const ay: b2Vec2 = b2Rot.MulRV(qA, this.m_localYAxisA, this.m_ay);

    // // float32 sAy = b2Cross(d + rA, ay);
    // const sAy = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), ay);
    // // float32 sBy = b2Cross(rB, ay);
    // const sBy = b2Vec2.CrossVV(rB, ay);

    // // float32 C = b2Dot(d, ay);
    // const C: number = b2Vec2.DotVV(d, this.m_ay);

    // const k: number = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_sAy * this.m_sAy + this.m_invIB * this.m_sBy * this.m_sBy;

    // let impulse: number;
    // if (k !== 0) {
    //   impulse = - C / k;
    // } else {
    //   impulse = 0;
    // }

    // // b2Vec2 P = impulse * ay;
    // const P: b2Vec2 = b2Vec2.MulSV(impulse, ay, b2WheelJoint.SolvePositionConstraints_s_P);
    // const LA: number = impulse * sAy;
    // const LB: number = impulse * sBy;

    // // cA -= m_invMassA * P;
    // cA.SelfMulSub(this.m_invMassA, P);
    // aA -= this.m_invIA * LA;
    // // cB += m_invMassB * P;
    // cB.SelfMulAdd(this.m_invMassB, P);
    // aB += this.m_invIB * LB;

    let linearError: number = 0.0;

    if (this.m_enableLimit) {
      // b2Rot qA(aA), qB(aB);
      const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

      // b2Vec2 rA = b2Mul(qA, this.m_localAnchorA - this.m_localCenterA);
      // b2Vec2 rB = b2Mul(qB, this.m_localAnchorB - this.m_localCenterB);
      // b2Vec2 d = (cB - cA) + rB - rA;

      // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
      b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
      const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
      // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
      b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
      const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
      // b2Vec2 d = (cB - cA) + rB - rA;
      const d: b2Vec2 = b2Vec2.AddVV(
        b2Vec2.SubVV(cB, cA, b2Vec2.s_t0),
        b2Vec2.SubVV(rB, rA, b2Vec2.s_t1),
        b2WheelJoint.SolvePositionConstraints_s_d);

      // b2Vec2 ax = b2Mul(qA, this.m_localXAxisA);
      const ax: b2Vec2 = b2Rot.MulRV(qA, this.m_localXAxisA, this.m_ax);
      // float sAx = b2Cross(d + rA, this.m_ax);
      const sAx = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), this.m_ax);
      // float sBx = b2Cross(rB, this.m_ax);
      const sBx = b2Vec2.CrossVV(rB, this.m_ax);

      let C: number = 0.0;
      const translation: number = b2Vec2.DotVV(ax, d);
      if (b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * b2_linearSlop) {
        C = translation;
      } else if (translation <= this.m_lowerTranslation) {
        C = b2Min(translation - this.m_lowerTranslation, 0.0);
      } else if (translation >= this.m_upperTranslation) {
        C = b2Max(translation - this.m_upperTranslation, 0.0);
      }

      if (C !== 0.0) {

        const invMass: number = this.m_invMassA + this.m_invMassB + this.m_invIA * sAx * sAx + this.m_invIB * sBx * sBx;
        let impulse: number = 0.0;
        if (invMass !== 0.0) {
          impulse = -C / invMass;
        }

        const P: b2Vec2 = b2Vec2.MulSV(impulse, ax, b2WheelJoint.SolvePositionConstraints_s_P);
        const LA: number = impulse * sAx;
        const LB: number = impulse * sBx;

        // cA -= m_invMassA * P;
        cA.SelfMulSub(this.m_invMassA, P);
        aA -= this.m_invIA * LA;
        // cB += m_invMassB * P;
        cB.SelfMulAdd(this.m_invMassB, P);
        // aB += m_invIB * LB;
        aB += this.m_invIB * LB;

        linearError = b2Abs(C);
      }
    }

    // Solve perpendicular constraint
    {
      // b2Rot qA(aA), qB(aB);
      const qA: b2Rot = this.m_qA.SetAngle(aA), qB: b2Rot = this.m_qB.SetAngle(aB);

      // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
      // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
      // b2Vec2 d = (cB - cA) + rB - rA;

      // b2Vec2 rA = b2Mul(qA, m_localAnchorA - m_localCenterA);
      b2Vec2.SubVV(this.m_localAnchorA, this.m_localCenterA, this.m_lalcA);
      const rA: b2Vec2 = b2Rot.MulRV(qA, this.m_lalcA, this.m_rA);
      // b2Vec2 rB = b2Mul(qB, m_localAnchorB - m_localCenterB);
      b2Vec2.SubVV(this.m_localAnchorB, this.m_localCenterB, this.m_lalcB);
      const rB: b2Vec2 = b2Rot.MulRV(qB, this.m_lalcB, this.m_rB);
      // b2Vec2 d = (cB - cA) + rB - rA;
      const d: b2Vec2 = b2Vec2.AddVV(
        b2Vec2.SubVV(cB, cA, b2Vec2.s_t0),
        b2Vec2.SubVV(rB, rA, b2Vec2.s_t1),
        b2WheelJoint.SolvePositionConstraints_s_d);

      // b2Vec2 ay = b2Mul(qA, m_localYAxisA);
      const ay: b2Vec2 = b2Rot.MulRV(qA, this.m_localYAxisA, this.m_ay);

      // float sAy = b2Cross(d + rA, ay);
      const sAy = b2Vec2.CrossVV(b2Vec2.AddVV(d, rA, b2Vec2.s_t0), ay);
      // float sBy = b2Cross(rB, ay);
      const sBy = b2Vec2.CrossVV(rB, ay);

      // float C = b2Dot(d, ay);
      const C: number = b2Vec2.DotVV(d, ay);

      const invMass: number = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_sAy * this.m_sAy + this.m_invIB * this.m_sBy * this.m_sBy;

      let impulse: number = 0.0;
      if (invMass !== 0.0) {
        impulse = - C / invMass;
      }

      // b2Vec2 P = impulse * ay;
      // const LA: number = impulse * sAy;
      // const LB: number = impulse * sBy;
      const P: b2Vec2 = b2Vec2.MulSV(impulse, ay, b2WheelJoint.SolvePositionConstraints_s_P);
      const LA: number = impulse * sAy;
      const LB: number = impulse * sBy;

      // cA -= m_invMassA * P;
      cA.SelfMulSub(this.m_invMassA, P);
      aA -= this.m_invIA * LA;
      // cB += m_invMassB * P;
      cB.SelfMulAdd(this.m_invMassB, P);
      aB += this.m_invIB * LB;

      linearError = b2Max(linearError, b2Abs(C));
    }

    // data.positions[this.m_indexA].c = cA;
    data.positions[this.m_indexA].a = aA;
    // data.positions[this.m_indexB].c = cB;
    data.positions[this.m_indexB].a = aB;

    return linearError <= b2_linearSlop;
  }

  public GetDefinition(def: b2WheelJointDef): b2WheelJointDef {
    // DEBUG: b2Assert(false); // TODO
    return def;
  }

  public GetAnchorA<T extends XY>(out: T): T {
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA, out);
  }

  public GetAnchorB<T extends XY>(out: T): T {
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB, out);
  }

  public GetReactionForce<T extends XY>(inv_dt: number, out: T): T {
    out.x = inv_dt * (this.m_impulse * this.m_ay.x + (this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_ax.x);
    out.y = inv_dt * (this.m_impulse * this.m_ay.y + (this.m_springImpulse + this.m_lowerImpulse - this.m_upperImpulse) * this.m_ax.y);
    return out;
  }

  public GetReactionTorque(inv_dt: number): number {
    return inv_dt * this.m_motorImpulse;
  }

  public GetLocalAnchorA():b2Vec2 { return this.m_localAnchorA; }

  public GetLocalAnchorB():b2Vec2 { return this.m_localAnchorB; }

  public GetLocalAxisA():b2Vec2 { return this.m_localXAxisA; }

  public GetJointTranslation(): number {
    return this.GetPrismaticJointTranslation();
  }

  public GetJointLinearSpeed(): number {
    return this.GetPrismaticJointSpeed();
  }

  public GetJointAngle(): number {
    return this.GetRevoluteJointAngle();
  }

  public GetJointAngularSpeed(): number {
    return this.GetRevoluteJointSpeed();
  }

  public GetPrismaticJointTranslation(): number {
    const bA: b2Body = this.m_bodyA;
    const bB: b2Body = this.m_bodyB;

    const pA: b2Vec2 = bA.GetWorldPoint(this.m_localAnchorA, new b2Vec2());
    const pB: b2Vec2 = bB.GetWorldPoint(this.m_localAnchorB, new b2Vec2());
    const d: b2Vec2 = b2Vec2.SubVV(pB, pA, new b2Vec2());
    const axis: b2Vec2 = bA.GetWorldVector(this.m_localXAxisA, new b2Vec2());

    const translation: number = b2Vec2.DotVV(d, axis);
    return translation;
  }

  public GetPrismaticJointSpeed(): number {
    const bA: b2Body = this.m_bodyA;
    const bB: b2Body = this.m_bodyB;

    // b2Vec2 rA = b2Mul(bA.m_xf.q, m_localAnchorA - bA.m_sweep.localCenter);
    b2Vec2.SubVV(this.m_localAnchorA, bA.m_sweep.localCenter, this.m_lalcA);
    const rA = b2Rot.MulRV(bA.m_xf.q, this.m_lalcA, this.m_rA);
    // b2Vec2 rB = b2Mul(bB.m_xf.q, m_localAnchorB - bB.m_sweep.localCenter);
    b2Vec2.SubVV(this.m_localAnchorB, bB.m_sweep.localCenter, this.m_lalcB);
    const rB = b2Rot.MulRV(bB.m_xf.q, this.m_lalcB, this.m_rB);
    // b2Vec2 pA = bA.m_sweep.c + rA;
    const pA = b2Vec2.AddVV(bA.m_sweep.c, rA, b2Vec2.s_t0); // pA uses s_t0
    // b2Vec2 pB = bB.m_sweep.c + rB;
    const pB = b2Vec2.AddVV(bB.m_sweep.c, rB, b2Vec2.s_t1); // pB uses s_t1
    // b2Vec2 d = pB - pA;
    const d = b2Vec2.SubVV(pB, pA, b2Vec2.s_t2); // d uses s_t2
    // b2Vec2 axis = b2Mul(bA.m_xf.q, m_localXAxisA);
    const axis = bA.GetWorldVector(this.m_localXAxisA, new b2Vec2());

    const vA = bA.m_linearVelocity;
    const vB = bB.m_linearVelocity;
    const wA = bA.m_angularVelocity;
    const wB = bB.m_angularVelocity;

    // float32 speed = b2Dot(d, b2Cross(wA, axis)) + b2Dot(axis, vB + b2Cross(wB, rB) - vA - b2Cross(wA, rA));
    const speed =
      b2Vec2.DotVV(d, b2Vec2.CrossSV(wA, axis, b2Vec2.s_t0)) +
      b2Vec2.DotVV(
        axis,
        b2Vec2.SubVV(
          b2Vec2.AddVCrossSV(vB, wB, rB, b2Vec2.s_t0),
          b2Vec2.AddVCrossSV(vA, wA, rA, b2Vec2.s_t1),
          b2Vec2.s_t0));
    return speed;
  }

  public GetRevoluteJointAngle(): number {
    // b2Body* bA = this.m_bodyA;
    // b2Body* bB = this.m_bodyB;
    // return bB.this.m_sweep.a - bA.this.m_sweep.a;
    return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a;
  }

  public GetRevoluteJointSpeed(): number {
    const wA: number = this.m_bodyA.m_angularVelocity;
    const wB: number = this.m_bodyB.m_angularVelocity;
    return wB - wA;
  }

  public IsMotorEnabled(): boolean {
    return this.m_enableMotor;
  }

  public EnableMotor(flag: boolean): void {
    if (flag !== this.m_enableMotor) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_enableMotor = flag;
    }
  }

  public SetMotorSpeed(speed: number): void {
    if (speed !== this.m_motorSpeed) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_motorSpeed = speed;
    }
  }

  public SetMaxMotorTorque(force: number): void {
    if (force !== this.m_maxMotorTorque) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_maxMotorTorque = force;
    }
  }

  public GetMotorTorque(inv_dt: number): number {
    return inv_dt * this.m_motorImpulse;
  }

  /// Is the joint limit enabled?
  public IsLimitEnabled(): boolean {
    return this.m_enableLimit;
  }

  /// Enable/disable the joint translation limit.
  public EnableLimit(flag: boolean): void {
    if (flag !== this.m_enableLimit) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_enableLimit = flag;
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }
  }

  /// Get the lower joint translation limit, usually in meters.
  public GetLowerLimit(): number {
    return this.m_lowerTranslation;
  }

  /// Get the upper joint translation limit, usually in meters.
  public GetUpperLimit(): number {
    return this.m_upperTranslation;
  }

  /// Set the joint translation limits, usually in meters.
  public SetLimits(lower: number, upper: number): void {
    // b2Assert(lower <= upper);
    if (lower !== this.m_lowerTranslation || upper !== this.m_upperTranslation) {
      this.m_bodyA.SetAwake(true);
      this.m_bodyB.SetAwake(true);
      this.m_lowerTranslation = lower;
      this.m_upperTranslation = upper;
      this.m_lowerImpulse = 0.0;
      this.m_upperImpulse = 0.0;
    }
  }

  public Dump(log: (format: string, ...args: any[]) => void): void {
    const indexA = this.m_bodyA.m_islandIndex;
    const indexB = this.m_bodyB.m_islandIndex;

    log("  const jd: b2WheelJointDef = new b2WheelJointDef();\n");
    log("  jd.bodyA = bodies[%d];\n", indexA);
    log("  jd.bodyB = bodies[%d];\n", indexB);
    log("  jd.collideConnected = %s;\n", (this.m_collideConnected) ? ("true") : ("false"));
    log("  jd.localAnchorA.Set(%.15f, %.15f);\n", this.m_localAnchorA.x, this.m_localAnchorA.y);
    log("  jd.localAnchorB.Set(%.15f, %.15f);\n", this.m_localAnchorB.x, this.m_localAnchorB.y);
    log("  jd.localAxisA.Set(%.15f, %.15f);\n", this.m_localXAxisA.x, this.m_localXAxisA.y);
    log("  jd.enableMotor = %s;\n", (this.m_enableMotor) ? ("true") : ("false"));
    log("  jd.motorSpeed = %.15f;\n", this.m_motorSpeed);
    log("  jd.maxMotorTorque = %.15f;\n", this.m_maxMotorTorque);
    log("  jd.stiffness = %.15f;\n", this.m_stiffness);
    log("  jd.damping = %.15f;\n", this.m_damping);
    log("  joints[%d] = this.m_world.CreateJoint(jd);\n", this.m_index);
  }

  ///
  private static Draw_s_pA = new b2Vec2();
  private static Draw_s_pB = new b2Vec2();
  private static Draw_s_axis = new b2Vec2();
  private static Draw_s_c1 = new b2Color(0.7, 0.7, 0.7);
  private static Draw_s_c2 = new b2Color(0.3, 0.9, 0.3);
  private static Draw_s_c3 = new b2Color(0.9, 0.3, 0.3);
  private static Draw_s_c4 = new b2Color(0.3, 0.3, 0.9);
  private static Draw_s_c5 = new b2Color(0.4, 0.4, 0.4);
  private static Draw_s_lower = new b2Vec2();
  private static Draw_s_upper = new b2Vec2();
  private static Draw_s_perp = new b2Vec2();
  public Draw(draw: b2Draw): void {
    const xfA: b2Transform = this.m_bodyA.GetTransform();
    const xfB: b2Transform = this.m_bodyB.GetTransform();
    const pA = b2Transform.MulXV(xfA, this.m_localAnchorA, b2WheelJoint.Draw_s_pA);
    const pB = b2Transform.MulXV(xfB, this.m_localAnchorB, b2WheelJoint.Draw_s_pB);

    // b2Vec2 axis = b2Mul(xfA.q, m_localXAxisA);
    const axis: b2Vec2 = b2Rot.MulRV(xfA.q, this.m_localXAxisA, b2WheelJoint.Draw_s_axis);

    const c1 = b2WheelJoint.Draw_s_c1; // b2Color c1(0.7f, 0.7f, 0.7f);
    const c2 = b2WheelJoint.Draw_s_c2; // b2Color c2(0.3f, 0.9f, 0.3f);
    const c3 = b2WheelJoint.Draw_s_c3; // b2Color c3(0.9f, 0.3f, 0.3f);
    const c4 = b2WheelJoint.Draw_s_c4; // b2Color c4(0.3f, 0.3f, 0.9f);
    const c5 = b2WheelJoint.Draw_s_c5; // b2Color c5(0.4f, 0.4f, 0.4f);

    draw.DrawSegment(pA, pB, c5);

    if (this.m_enableLimit) {
      // b2Vec2 lower = pA + m_lowerTranslation * axis;
      const lower = b2Vec2.AddVMulSV(pA, this.m_lowerTranslation, axis, b2WheelJoint.Draw_s_lower);
      // b2Vec2 upper = pA + m_upperTranslation * axis;
      const upper = b2Vec2.AddVMulSV(pA, this.m_upperTranslation, axis, b2WheelJoint.Draw_s_upper);
      // b2Vec2 perp = b2Mul(xfA.q, m_localYAxisA);
      const perp = b2Rot.MulRV(xfA.q, this.m_localYAxisA, b2WheelJoint.Draw_s_perp);
      // draw.DrawSegment(lower, upper, c1);
      draw.DrawSegment(lower, upper, c1);
      // draw.DrawSegment(lower - 0.5f * perp, lower + 0.5f * perp, c2);
      draw.DrawSegment(b2Vec2.AddVMulSV(lower, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(lower, 0.5, perp, b2Vec2.s_t1), c2);
      // draw.DrawSegment(upper - 0.5f * perp, upper + 0.5f * perp, c3);
      draw.DrawSegment(b2Vec2.AddVMulSV(upper, -0.5, perp, b2Vec2.s_t0), b2Vec2.AddVMulSV(upper, 0.5, perp, b2Vec2.s_t1), c3);
    } else {
      // draw.DrawSegment(pA - 1.0f * axis, pA + 1.0f * axis, c1);
      draw.DrawSegment(b2Vec2.AddVMulSV(pA, -1.0, axis, b2Vec2.s_t0), b2Vec2.AddVMulSV(pA, 1.0, axis, b2Vec2.s_t1), c1);
    }

    draw.DrawPoint(pA, 5.0, c1);
    draw.DrawPoint(pB, 5.0, c4);
  }
}
/*
* Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

// DEBUG: 



































// #if B2_ENABLE_PARTICLE



// #endif
// #if B2_ENABLE_CONTROLLER

// #endif

/// The world class manages all physics entities, dynamic simulation,
/// and asynchronous queries. The world also contains efficient memory
/// management facilities.
 class b2World {
  public  m_contactManager: b2ContactManager = new b2ContactManager();

  public m_bodyList: b2Body  = null;
  public m_jointList: b2Joint  = null;

  // #if B2_ENABLE_PARTICLE
  public m_particleSystemList: b2ParticleSystem  = null;
  // #endif

  public m_bodyCount: number = 0;
  public m_jointCount: number = 0;

  public  m_gravity: b2Vec2 = new b2Vec2();
  public m_allowSleep: boolean = true;

  public m_destructionListener: b2DestructionListener  = null;
  public m_debugDraw: b2Draw  = null;

  // This is used to compute the time step ratio to
  // support a variable time step.
  public m_inv_dt0: number = 0;

  public m_newContacts: boolean = false;
  public m_locked: boolean = false;
  public m_clearForces: boolean = true;

  // These are for debugging the solver.
  public m_warmStarting: boolean = true;
  public m_continuousPhysics: boolean = true;
  public m_subStepping: boolean = false;

  public m_stepComplete: boolean = true;

  public  m_profile: b2Profile = new b2Profile();

  public  m_island: b2Island = new b2Island();

  public  s_stack: Array<b2Body > = [];

  // #if B2_ENABLE_CONTROLLER
  public m_controllerList: b2Controller  = null;
  public m_controllerCount: number = 0;
  // #endif

  /// Construct a world object.
  /// @param gravity the world gravity vector.
  constructor(gravity: XY) {
    this.m_gravity.Copy(gravity);
  }

  /// Register a destruction listener. The listener is owned by you and must
  /// remain in scope.
  public SetDestructionListener(listener: b2DestructionListener ): void {
    this.m_destructionListener = listener;
  }

  /// Register a contact filter to provide specific control over collision.
  /// Otherwise the default filter is used (b2_defaultFilter). The listener is
  /// owned by you and must remain in scope.
  public SetContactFilter(filter: b2ContactFilter): void {
    this.m_contactManager.m_contactFilter = filter;
  }

  /// Register a contact event listener. The listener is owned by you and must
  /// remain in scope.
  public SetContactListener(listener: b2ContactListener): void {
    this.m_contactManager.m_contactListener = listener;
  }

  /// Register a routine for debug drawing. The debug draw functions are called
  /// inside with b2World::DebugDraw method. The debug draw object is owned
  /// by you and must remain in scope.
  public SetDebugDraw(debugDraw: b2Draw ): void {
    this.m_debugDraw = debugDraw;
  }

  /// Create a rigid body given a definition. No reference to the definition
  /// is retained.
  /// @warning This function is locked during callbacks.
  public CreateBody(def: b2IBodyDef = {}): b2Body {
    if (this.IsLocked()) { throw new Error(); }

    const b: b2Body = new b2Body(def, this);

    // Add to world doubly linked list.
    b.m_prev = null;
    b.m_next = this.m_bodyList;
    if (this.m_bodyList) {
      this.m_bodyList.m_prev = b;
    }
    this.m_bodyList = b;
    ++this.m_bodyCount;

    return b;
  }

  /// Destroy a rigid body given a definition. No reference to the definition
  /// is retained. This function is locked during callbacks.
  /// @warning This automatically deletes all associated shapes and joints.
  /// @warning This function is locked during callbacks.
  public DestroyBody(b: b2Body): void {
    // DEBUG: b2Assert(this.m_bodyCount > 0);
    if (this.IsLocked()) { throw new Error(); }

    // Delete the attached joints.
    let je: b2JointEdge  = b.m_jointList;
    while (je) {
      const je0: b2JointEdge = je;
      je = je.next;

      if (this.m_destructionListener) {
        this.m_destructionListener.SayGoodbyeJoint(je0.joint);
      }

      this.DestroyJoint(je0.joint);

      b.m_jointList = je;
    }
    b.m_jointList = null;

    // #if B2_ENABLE_CONTROLLER
    // @see b2Controller list
    let coe: b2ControllerEdge  = b.m_controllerList;
    while (coe) {
      const coe0: b2ControllerEdge = coe;
      coe = coe.nextController;
      coe0.controller.RemoveBody(b);
    }
    // #endif

    // Delete the attached contacts.
    let ce: b2ContactEdge  = b.m_contactList;
    while (ce) {
      const ce0: b2ContactEdge = ce;
      ce = ce.next;
      this.m_contactManager.Destroy(ce0.contact);
    }
    b.m_contactList = null;

    // Delete the attached fixtures. This destroys broad-phase proxies.
    let f: b2Fixture  = b.m_fixtureList;
    while (f) {
      const f0: b2Fixture = f;
      f = f.m_next;

      if (this.m_destructionListener) {
        this.m_destructionListener.SayGoodbyeFixture(f0);
      }

      f0.DestroyProxies();
      f0.Reset();

      b.m_fixtureList = f;
      b.m_fixtureCount -= 1;
    }
    b.m_fixtureList = null;
    b.m_fixtureCount = 0;

    // Remove world body list.
    if (b.m_prev) {
      b.m_prev.m_next = b.m_next;
    }

    if (b.m_next) {
      b.m_next.m_prev = b.m_prev;
    }

    if (b === this.m_bodyList) {
      this.m_bodyList = b.m_next;
    }

    --this.m_bodyCount;
  }

  private static _Joint_Create(def: b2IJointDef): b2Joint {
    switch (def.type) {
      case b2JointType.e_distanceJoint: return new b2DistanceJoint(def as b2IDistanceJointDef);
      case b2JointType.e_mouseJoint: return new b2MouseJoint(def as b2IMouseJointDef);
      case b2JointType.e_prismaticJoint: return new b2PrismaticJoint(def as b2IPrismaticJointDef);
      case b2JointType.e_revoluteJoint: return new b2RevoluteJoint(def as b2IRevoluteJointDef);
      case b2JointType.e_pulleyJoint: return new b2PulleyJoint(def as b2IPulleyJointDef);
      case b2JointType.e_gearJoint: return new b2GearJoint(def as b2IGearJointDef);
      case b2JointType.e_wheelJoint: return new b2WheelJoint(def as b2IWheelJointDef);
      case b2JointType.e_weldJoint: return new b2WeldJoint(def as b2IWeldJointDef);
      case b2JointType.e_frictionJoint: return new b2FrictionJoint(def as b2IFrictionJointDef);
      case b2JointType.e_motorJoint: return new b2MotorJoint(def as b2IMotorJointDef);
      case b2JointType.e_areaJoint: return new b2AreaJoint(def as b2IAreaJointDef);
    }
    throw new Error();
  }

  private static _Joint_Destroy(joint: b2Joint): void {
  }

  /// Create a joint to constrain bodies together. No reference to the definition
  /// is retained. This may cause the connected bodies to cease colliding.
  /// @warning This function is locked during callbacks.
  public CreateJoint(def: b2IAreaJointDef): b2AreaJoint;
  public CreateJoint(def: b2IDistanceJointDef): b2DistanceJoint;
  public CreateJoint(def: b2IFrictionJointDef): b2FrictionJoint;
  public CreateJoint(def: b2IGearJointDef): b2GearJoint;
  public CreateJoint(def: b2IMotorJointDef): b2MotorJoint;
  public CreateJoint(def: b2IMouseJointDef): b2MouseJoint;
  public CreateJoint(def: b2IPrismaticJointDef): b2PrismaticJoint;
  public CreateJoint(def: b2IPulleyJointDef): b2PulleyJoint;
  public CreateJoint(def: b2IRevoluteJointDef): b2RevoluteJoint;
  public CreateJoint(def: b2IWeldJointDef): b2WeldJoint;
  public CreateJoint(def: b2IWheelJointDef): b2WheelJoint;
  public CreateJoint(def: b2IJointDef): b2Joint {
    if (this.IsLocked()) { throw new Error(); }

    const j: b2Joint = b2World._Joint_Create(def);

    // Connect to the world list.
    j.m_prev = null;
    j.m_next = this.m_jointList;
    if (this.m_jointList) {
      this.m_jointList.m_prev = j;
    }
    this.m_jointList = j;
    ++this.m_jointCount;

    // Connect to the bodies' doubly linked lists.
    // j.m_edgeA.other = j.m_bodyB; // done in b2Joint constructor
    j.m_edgeA.prev = null;
    j.m_edgeA.next = j.m_bodyA.m_jointList;
    if (j.m_bodyA.m_jointList) { j.m_bodyA.m_jointList.prev = j.m_edgeA; }
    j.m_bodyA.m_jointList = j.m_edgeA;

    // j.m_edgeB.other = j.m_bodyA; // done in b2Joint constructor
    j.m_edgeB.prev = null;
    j.m_edgeB.next = j.m_bodyB.m_jointList;
    if (j.m_bodyB.m_jointList) { j.m_bodyB.m_jointList.prev = j.m_edgeB; }
    j.m_bodyB.m_jointList = j.m_edgeB;

    const bodyA: b2Body = j.m_bodyA;
    const bodyB: b2Body = j.m_bodyB;
    const collideConnected: boolean = j.m_collideConnected;

    // If the joint prevents collisions, then flag any contacts for filtering.
    if (!collideConnected) {
      let edge: b2ContactEdge  = bodyB.GetContactList();
      while (edge) {
        if (edge.other === bodyA) {
          // Flag the contact for filtering at the next time step (where either
          // body is awake).
          edge.contact.FlagForFiltering();
        }

        edge = edge.next;
      }
    }

    // Note: creating a joint doesn't wake the bodies.

    return j;
  }

  /// Destroy a joint. This may cause the connected bodies to begin colliding.
  /// @warning This function is locked during callbacks.
  public DestroyJoint(j: b2Joint): void {
    if (this.IsLocked()) { throw new Error(); }

    // Remove from the doubly linked list.
    if (j.m_prev) {
      j.m_prev.m_next = j.m_next;
    }

    if (j.m_next) {
      j.m_next.m_prev = j.m_prev;
    }

    if (j === this.m_jointList) {
      this.m_jointList = j.m_next;
    }

    // Disconnect from island graph.
    const bodyA: b2Body = j.m_bodyA;
    const bodyB: b2Body = j.m_bodyB;
    const collideConnected: boolean = j.m_collideConnected;

    // Wake up connected bodies.
    bodyA.SetAwake(true);
    bodyB.SetAwake(true);

    // Remove from body 1.
    if (j.m_edgeA.prev) {
      j.m_edgeA.prev.next = j.m_edgeA.next;
    }

    if (j.m_edgeA.next) {
      j.m_edgeA.next.prev = j.m_edgeA.prev;
    }

    if (j.m_edgeA === bodyA.m_jointList) {
      bodyA.m_jointList = j.m_edgeA.next;
    }

    j.m_edgeA.Reset();

    // Remove from body 2
    if (j.m_edgeB.prev) {
      j.m_edgeB.prev.next = j.m_edgeB.next;
    }

    if (j.m_edgeB.next) {
      j.m_edgeB.next.prev = j.m_edgeB.prev;
    }

    if (j.m_edgeB === bodyB.m_jointList) {
      bodyB.m_jointList = j.m_edgeB.next;
    }

    j.m_edgeB.Reset();

    b2World._Joint_Destroy(j);

    // DEBUG: b2Assert(this.m_jointCount > 0);
    --this.m_jointCount;

    // If the joint prevents collisions, then flag any contacts for filtering.
    if (!collideConnected) {
      let edge: b2ContactEdge  = bodyB.GetContactList();
      while (edge) {
        if (edge.other === bodyA) {
          // Flag the contact for filtering at the next time step (where either
          // body is awake).
          edge.contact.FlagForFiltering();
        }

        edge = edge.next;
      }
    }
  }

  // #if B2_ENABLE_PARTICLE

  public CreateParticleSystem(def: b2ParticleSystemDef): b2ParticleSystem {
    if (this.IsLocked()) { throw new Error(); }

    const p = new b2ParticleSystem(def, this);

    // Add to world doubly linked list.
    p.m_prev = null;
    p.m_next = this.m_particleSystemList;
    if (this.m_particleSystemList) {
      this.m_particleSystemList.m_prev = p;
    }
    this.m_particleSystemList = p;

    return p;
  }

  public DestroyParticleSystem(p: b2ParticleSystem): void {
    if (this.IsLocked()) { throw new Error(); }

    // Remove world particleSystem list.
    if (p.m_prev) {
      p.m_prev.m_next = p.m_next;
    }

    if (p.m_next) {
      p.m_next.m_prev = p.m_prev;
    }

    if (p === this.m_particleSystemList) {
      this.m_particleSystemList = p.m_next;
    }
  }

  public CalculateReasonableParticleIterations(timeStep: number): number {
    if (this.m_particleSystemList === null) {
      return 1;
    }

    function GetSmallestRadius(world: b2World): number {
      let smallestRadius = b2_maxFloat;
      for (let system = world.GetParticleSystemList(); system !== null; system = system.m_next) {
        smallestRadius = b2Min(smallestRadius, system.GetRadius());
      }
      return smallestRadius;
    }

    // Use the smallest radius, since that represents the worst-case.
    return b2CalculateParticleIterations(this.m_gravity.Length(), GetSmallestRadius(this), timeStep);
  }

  // #endif

  /// Take a time step. This performs collision detection, integration,
  /// and constraint solution.
  /// @param timeStep the amount of time to simulate, this should not vary.
  /// @param velocityIterations for the velocity constraint solver.
  /// @param positionIterations for the position constraint solver.
  private static Step_s_step = new b2TimeStep();
  private static Step_s_stepTimer = new b2Timer();
  private static Step_s_timer = new b2Timer();
  // #if B2_ENABLE_PARTICLE
  public Step(dt: number, velocityIterations: number, positionIterations: number, particleIterations: number = this.CalculateReasonableParticleIterations(dt)): void {
    // #else
    // public Step(dt: number, velocityIterations: number, positionIterations: number): void {
    // #endif
    const stepTimer: b2Timer = b2World.Step_s_stepTimer.Reset();

    // If new fixtures were added, we need to find the new contacts.
    if (this.m_newContacts) {
      this.m_contactManager.FindNewContacts();
      this.m_newContacts = false;
    }

    this.m_locked = true;

    const step: b2TimeStep = b2World.Step_s_step;
    step.dt = dt;
    step.velocityIterations = velocityIterations;
    step.positionIterations = positionIterations;
    // #if B2_ENABLE_PARTICLE
    step.particleIterations = particleIterations;
    // #endif
    if (dt > 0) {
      step.inv_dt = 1 / dt;
    } else {
      step.inv_dt = 0;
    }

    step.dtRatio = this.m_inv_dt0 * dt;

    step.warmStarting = this.m_warmStarting;

    // Update contacts. This is where some contacts are destroyed.
    const timer: b2Timer = b2World.Step_s_timer.Reset();
    this.m_contactManager.Collide();
    this.m_profile.collide = timer.GetMilliseconds();

    // Integrate velocities, solve velocity constraints, and integrate positions.
    if (this.m_stepComplete && step.dt > 0) {
      const timer: b2Timer = b2World.Step_s_timer.Reset();
      // #if B2_ENABLE_PARTICLE
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        p.Solve(step); // Particle Simulation
      }
      // #endif
      this.Solve(step);
      this.m_profile.solve = timer.GetMilliseconds();
    }

    // Handle TOI events.
    if (this.m_continuousPhysics && step.dt > 0) {
      const timer: b2Timer = b2World.Step_s_timer.Reset();
      this.SolveTOI(step);
      this.m_profile.solveTOI = timer.GetMilliseconds();
    }

    if (step.dt > 0) {
      this.m_inv_dt0 = step.inv_dt;
    }

    if (this.m_clearForces) {
      this.ClearForces();
    }

    this.m_locked = false;

    this.m_profile.step = stepTimer.GetMilliseconds();
  }

  /// Manually clear the force buffer on all bodies. By default, forces are cleared automatically
  /// after each call to Step. The default behavior is modified by calling SetAutoClearForces.
  /// The purpose of this function is to support sub-stepping. Sub-stepping is often used to maintain
  /// a fixed sized time step under a variable frame-rate.
  /// When you perform sub-stepping you will disable auto clearing of forces and instead call
  /// ClearForces after all sub-steps are complete in one pass of your game loop.
  /// @see SetAutoClearForces
  public ClearForces(): void {
    for (let body = this.m_bodyList; body; body = body.m_next) {
      body.m_force.SetZero();
      body.m_torque = 0;
    }
  }

  // #if B2_ENABLE_PARTICLE

  public DrawParticleSystem(system: b2ParticleSystem): void {
    if (this.m_debugDraw === null) {
      return;
    }
    const particleCount = system.GetParticleCount();
    if (particleCount) {
      const radius = system.GetRadius();
      const positionBuffer = system.GetPositionBuffer();
      if (system.m_colorBuffer.data) {
        const colorBuffer = system.GetColorBuffer();
        this.m_debugDraw.DrawParticles(positionBuffer, radius, colorBuffer, particleCount);
      } else {
        this.m_debugDraw.DrawParticles(positionBuffer, radius, null, particleCount);
      }
    }
  }

  // #endif

  /// Call this to draw shapes and other debug draw data.
  private static DebugDraw_s_color = new b2Color(0, 0, 0);
  private static DebugDraw_s_vs = b2Vec2.MakeArray(4);
  private static DebugDraw_s_xf = new b2Transform();
  public DebugDraw(): void {
    if (this.m_debugDraw === null) {
      return;
    }

    const flags: number = this.m_debugDraw.GetFlags();
    const color: b2Color = b2World.DebugDraw_s_color.SetRGB(0, 0, 0);

    if (flags & b2DrawFlags.e_shapeBit) {
      for (let b: b2Body  = this.m_bodyList; b; b = b.m_next) {
        const xf: b2Transform = b.m_xf;

        this.m_debugDraw.PushTransform(xf);

        for (let f: b2Fixture  = b.GetFixtureList(); f; f = f.m_next) {
          if (b.GetType() === b2BodyType.b2_dynamicBody && b.m_mass === 0.0) {
            // Bad body
            this.DrawShape(f, new b2Color(1.0, 0.0, 0.0));
          } else if (!b.IsEnabled()) {
            color.SetRGB(0.5, 0.5, 0.3);
            this.DrawShape(f, color);
          } else if (b.GetType() === b2BodyType.b2_staticBody) {
            color.SetRGB(0.5, 0.9, 0.5);
            this.DrawShape(f, color);
          } else if (b.GetType() === b2BodyType.b2_kinematicBody) {
            color.SetRGB(0.5, 0.5, 0.9);
            this.DrawShape(f, color);
          } else if (!b.IsAwake()) {
            color.SetRGB(0.6, 0.6, 0.6);
            this.DrawShape(f, color);
          } else {
            color.SetRGB(0.9, 0.7, 0.7);
            this.DrawShape(f, color);
          }
        }

        this.m_debugDraw.PopTransform(xf);
      }
    }

    // #if B2_ENABLE_PARTICLE
    if (flags & b2DrawFlags.e_particleBit) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        this.DrawParticleSystem(p);
      }
    }
    // #endif

    if (flags & b2DrawFlags.e_jointBit) {
      for (let j: b2Joint  = this.m_jointList; j; j = j.m_next) {
        j.Draw(this.m_debugDraw);
      }
    }

    if (flags & b2DrawFlags.e_pairBit) {
      color.SetRGB(0.3, 0.9, 0.9);
      for (let contact = this.m_contactManager.m_contactList; contact; contact = contact.m_next) {
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();
        const indexA = contact.GetChildIndexA();
        const indexB = contact.GetChildIndexB();
        const cA = fixtureA.GetAABB(indexA).GetCenter();
        const cB = fixtureB.GetAABB(indexB).GetCenter();

        this.m_debugDraw.DrawSegment(cA, cB, color);
      }
    }

    if (flags & b2DrawFlags.e_aabbBit) {
      color.SetRGB(0.9, 0.3, 0.9);
      const vs: b2Vec2[] = b2World.DebugDraw_s_vs;

      for (let b: b2Body  = this.m_bodyList; b; b = b.m_next) {
        if (!b.IsEnabled()) {
          continue;
        }

        for (let f: b2Fixture  = b.GetFixtureList(); f; f = f.m_next) {
          for (let i: number = 0; i < f.m_proxyCount; ++i) {
            const proxy: b2FixtureProxy = f.m_proxies[i];

            const aabb: b2AABB = proxy.treeNode.aabb;
            vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
            vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
            vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
            vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);

            this.m_debugDraw.DrawPolygon(vs, 4, color);
          }
        }
      }
    }

    if (flags & b2DrawFlags.e_centerOfMassBit) {
      for (let b: b2Body  = this.m_bodyList; b; b = b.m_next) {
        const xf: b2Transform = b2World.DebugDraw_s_xf;
        xf.q.Copy(b.m_xf.q);
        xf.p.Copy(b.GetWorldCenter());
        this.m_debugDraw.DrawTransform(xf);
      }
    }

    // #if B2_ENABLE_CONTROLLER
    // @see b2Controller list
    if (flags & b2DrawFlags.e_controllerBit) {
      for (let c = this.m_controllerList; c; c = c.m_next) {
        c.Draw(this.m_debugDraw);
      }
    }
    // #endif
  }

  /// Query the world for all fixtures that potentially overlap the
  /// provided AABB.
  /// @param callback a user implemented callback class.
  /// @param aabb the query box.
  public QueryAABB(callback: b2QueryCallback, aabb: b2AABB): void;
  public QueryAABB(aabb: b2AABB, fn: b2QueryCallbackFunction): void;
  public QueryAABB(...args: any[]): void {
    if (args[0] instanceof b2QueryCallback) {
      this._QueryAABB(args[0], args[1]);
    } else {
      this._QueryAABB(null, args[0], args[1]);
    }
  }
  private _QueryAABB(callback: b2QueryCallback , aabb: b2AABB, fn?: b2QueryCallbackFunction): void {
    this.m_contactManager.m_broadPhase.Query(aabb, (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
      const fixture_proxy: b2FixtureProxy = proxy.userData;
      // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
      const fixture: b2Fixture = fixture_proxy.fixture;
      if (callback) {
        return callback.ReportFixture(fixture);
      } else if (fn) {
        return fn(fixture);
      }
      return true;
    });
    // #if B2_ENABLE_PARTICLE
    if (callback instanceof b2QueryCallback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.QueryAABB(callback, aabb);
        }
      }
    }
    // #endif
  }

  public QueryAllAABB(aabb: b2AABB, out: b2Fixture[] = []): b2Fixture[] {
    this.QueryAABB(aabb, (fixture: b2Fixture): boolean => { out.push(fixture); return true; });
    return out;
  }

  /// Query the world for all fixtures that potentially overlap the
  /// provided point.
  /// @param callback a user implemented callback class.
  /// @param point the query point.
  public QueryPointAABB(callback: b2QueryCallback, point: XY): void;
  public QueryPointAABB(point: XY, fn: b2QueryCallbackFunction): void;
  public QueryPointAABB(...args: any[]): void {
    if (args[0] instanceof b2QueryCallback) {
      this._QueryPointAABB(args[0], args[1]);
    } else {
      this._QueryPointAABB(null, args[0], args[1]);
    }
  }
  private _QueryPointAABB(callback: b2QueryCallback , point: XY, fn?: b2QueryCallbackFunction): void {
    this.m_contactManager.m_broadPhase.QueryPoint(point, (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
      const fixture_proxy: b2FixtureProxy = proxy.userData;
      // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
      const fixture: b2Fixture = fixture_proxy.fixture;
      if (callback) {
        return callback.ReportFixture(fixture);
      } else if (fn) {
        return fn(fixture);
      }
      return true;
    });
    // #if B2_ENABLE_PARTICLE
    if (callback instanceof b2QueryCallback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.QueryPointAABB(callback, point);
        }
      }
    }
    // #endif
  }

  public QueryAllPointAABB(point: XY, out: b2Fixture[] = []): b2Fixture[] {
    this.QueryPointAABB(point, (fixture: b2Fixture): boolean => { out.push(fixture); return true; });
    return out;
  }

  public QueryFixtureShape(callback: b2QueryCallback, shape: b2Shape, index: number, transform: b2Transform): void;
  public QueryFixtureShape(shape: b2Shape, index: number, transform: b2Transform, fn: b2QueryCallbackFunction): void;
  public QueryFixtureShape(...args: any[]): void {
    if (args[0] instanceof b2QueryCallback) {
      this._QueryFixtureShape(args[0], args[1], args[2], args[3]);
    } else {
      this._QueryFixtureShape(null, args[0], args[1], args[2], args[3]);
    }
  }
  private static QueryFixtureShape_s_aabb = new b2AABB();
  private _QueryFixtureShape(callback: b2QueryCallback , shape: b2Shape, index: number, transform: b2Transform, fn?: b2QueryCallbackFunction): void {
    const aabb: b2AABB = b2World.QueryFixtureShape_s_aabb;
    shape.ComputeAABB(aabb, transform, index);
    this.m_contactManager.m_broadPhase.Query(aabb, (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
      const fixture_proxy: b2FixtureProxy = proxy.userData;
      // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
      const fixture: b2Fixture = fixture_proxy.fixture;
      if (b2TestOverlapShape(shape, index, fixture.GetShape(), fixture_proxy.childIndex, transform, fixture.GetBody().GetTransform())) {
        if (callback) {
          return callback.ReportFixture(fixture);
        } else if (fn) {
          return fn(fixture);
        }
      }
      return true;
    });
    // #if B2_ENABLE_PARTICLE
    if (callback instanceof b2QueryCallback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.QueryAABB(callback, aabb);
        }
      }
    }
    // #endif
  }

  public QueryAllFixtureShape(shape: b2Shape, index: number, transform: b2Transform, out: b2Fixture[] = []): b2Fixture[] {
    this.QueryFixtureShape(shape, index, transform, (fixture: b2Fixture): boolean => { out.push(fixture); return true; });
    return out;
  }

  public QueryFixturePoint(callback: b2QueryCallback, point: XY): void;
  public QueryFixturePoint(point: XY, fn: b2QueryCallbackFunction): void;
  public QueryFixturePoint(...args: any[]): void {
    if (args[0] instanceof b2QueryCallback) {
      this._QueryFixturePoint(args[0], args[1]);
    } else {
      this._QueryFixturePoint(null, args[0], args[1]);
    }
  }
  private _QueryFixturePoint(callback: b2QueryCallback , point: XY, fn?: b2QueryCallbackFunction): void {
    this.m_contactManager.m_broadPhase.QueryPoint(point, (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
      const fixture_proxy: b2FixtureProxy = proxy.userData;
      // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
      const fixture: b2Fixture = fixture_proxy.fixture;
      if (fixture.TestPoint(point)) {
        if (callback) {
          return callback.ReportFixture(fixture);
        } else if (fn) {
          return fn(fixture);
        }
      }
      return true;
    });
    // #if B2_ENABLE_PARTICLE
    if (callback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.QueryPointAABB(callback, point);
        }
      }
    }
    // #endif
  }

  public QueryAllFixturePoint(point: XY, out: b2Fixture[] = []): b2Fixture[] {
    this.QueryFixturePoint(point, (fixture: b2Fixture): boolean => { out.push(fixture); return true; });
    return out;
  }

  /// Ray-cast the world for all fixtures in the path of the ray. Your callback
  /// controls whether you get the closest point, any point, or n-points.
  /// The ray-cast ignores shapes that contain the starting point.
  /// @param callback a user implemented callback class.
  /// @param point1 the ray starting point
  /// @param point2 the ray ending point
  public RayCast(callback: b2RayCastCallback, point1: XY, point2: XY): void;
  public RayCast(point1: XY, point2: XY, fn: b2RayCastCallbackFunction): void;
  public RayCast(...args: any[]): void {
    if (args[0] instanceof b2RayCastCallback) {
      this._RayCast(args[0], args[1], args[2]);
    } else {
      this._RayCast(null, args[0], args[1], args[2]);
    }
  }
  private static RayCast_s_input = new b2RayCastInput();
  private static RayCast_s_output = new b2RayCastOutput();
  private static RayCast_s_point = new b2Vec2();
  private _RayCast(callback: b2RayCastCallback , point1: XY, point2: XY, fn?: b2RayCastCallbackFunction): void {
    const input: b2RayCastInput = b2World.RayCast_s_input;
    input.maxFraction = 1;
    input.p1.Copy(point1);
    input.p2.Copy(point2);
    this.m_contactManager.m_broadPhase.RayCast(input, (input: b2RayCastInput, proxy: b2TreeNode<b2FixtureProxy>): number => {
      const fixture_proxy: b2FixtureProxy = proxy.userData;
      // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
      const fixture: b2Fixture = fixture_proxy.fixture;
      const index: number = fixture_proxy.childIndex;
      const output: b2RayCastOutput = b2World.RayCast_s_output;
      const hit: boolean = fixture.RayCast(output, input, index);
      if (hit) {
        const fraction: number = output.fraction;
        const point: b2Vec2 = b2World.RayCast_s_point;
        point.Set((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
        if (callback) {
          return callback.ReportFixture(fixture, point, output.normal, fraction);
        } else if (fn) {
          return fn(fixture, point, output.normal, fraction);
        }
      }
      return input.maxFraction;
    });
    // #if B2_ENABLE_PARTICLE
    if (callback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.RayCast(callback, point1, point2);
        }
      }
    }
    // #endif
  }

  public RayCastOne(point1: XY, point2: XY): b2Fixture  {
    let result: b2Fixture  = null;
    let min_fraction: number = 1;
    this.RayCast(point1, point2, (fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number): number => {
      if (fraction < min_fraction) {
        min_fraction = fraction;
        result = fixture;
      }
      return min_fraction;
    });
    return result;
  }

  public RayCastAll(point1: XY, point2: XY, out: b2Fixture[] = []): b2Fixture[] {
    this.RayCast(point1, point2, (fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number): number => {
      out.push(fixture);
      return 1;
    });
    return out;
  }

  /// Get the world body list. With the returned body, use b2Body::GetNext to get
  /// the next body in the world list. A NULL body indicates the end of the list.
  /// @return the head of the world body list.
  public GetBodyList(): b2Body  {
    return this.m_bodyList;
  }

  /// Get the world joint list. With the returned joint, use b2Joint::GetNext to get
  /// the next joint in the world list. A NULL joint indicates the end of the list.
  /// @return the head of the world joint list.
  public GetJointList(): b2Joint  {
    return this.m_jointList;
  }

  // #if B2_ENABLE_PARTICLE
  public GetParticleSystemList(): b2ParticleSystem  {
    return this.m_particleSystemList;
  }
  // #endif

  /// Get the world contact list. With the returned contact, use b2Contact::GetNext to get
  /// the next contact in the world list. A NULL contact indicates the end of the list.
  /// @return the head of the world contact list.
  /// @warning contacts are created and destroyed in the middle of a time step.
  /// Use b2ContactListener to avoid missing contacts.
  public GetContactList(): b2Contact  {
    return this.m_contactManager.m_contactList;
  }

  /// Enable/disable sleep.
  public SetAllowSleeping(flag: boolean): void {
    if (flag === this.m_allowSleep) {
      return;
    }

    this.m_allowSleep = flag;
    if (!this.m_allowSleep) {
      for (let b = this.m_bodyList; b; b = b.m_next) {
        b.SetAwake(true);
      }
    }
  }

  public GetAllowSleeping(): boolean {
    return this.m_allowSleep;
  }

  /// Enable/disable warm starting. For testing.
  public SetWarmStarting(flag: boolean): void {
    this.m_warmStarting = flag;
  }

  public GetWarmStarting(): boolean {
    return this.m_warmStarting;
  }

  /// Enable/disable continuous physics. For testing.
  public SetContinuousPhysics(flag: boolean): void {
    this.m_continuousPhysics = flag;
  }

  public GetContinuousPhysics(): boolean {
    return this.m_continuousPhysics;
  }

  /// Enable/disable single stepped continuous physics. For testing.
  public SetSubStepping(flag: boolean): void {
    this.m_subStepping = flag;
  }

  public GetSubStepping(): boolean {
    return this.m_subStepping;
  }

  /// Get the number of broad-phase proxies.
  public GetProxyCount(): number {
    return this.m_contactManager.m_broadPhase.GetProxyCount();
  }

  /// Get the number of bodies.
  public GetBodyCount(): number {
    return this.m_bodyCount;
  }

  /// Get the number of joints.
  public GetJointCount(): number {
    return this.m_jointCount;
  }

  /// Get the number of contacts (each may have 0 or more contact points).
  public GetContactCount(): number {
    return this.m_contactManager.m_contactCount;
  }

  /// Get the height of the dynamic tree.
  public GetTreeHeight(): number {
    return this.m_contactManager.m_broadPhase.GetTreeHeight();
  }

  /// Get the balance of the dynamic tree.
  public GetTreeBalance(): number {
    return this.m_contactManager.m_broadPhase.GetTreeBalance();
  }

  /// Get the quality metric of the dynamic tree. The smaller the better.
  /// The minimum is 1.
  public GetTreeQuality(): number {
    return this.m_contactManager.m_broadPhase.GetTreeQuality();
  }

  /// Change the global gravity vector.
  public SetGravity(gravity: XY, wake: boolean = true) {
    if (!b2Vec2.IsEqualToV(this.m_gravity, gravity)) {
      this.m_gravity.Copy(gravity);

      if (wake) {
        for (let b: b2Body  = this.m_bodyList; b; b = b.m_next) {
          b.SetAwake(true);
        }
      }
    }
  }

  /// Get the global gravity vector.
  public GetGravity():b2Vec2 {
    return this.m_gravity;
  }

  /// Is the world locked (in the middle of a time step).
  public IsLocked(): boolean {
    return this.m_locked;
  }

  /// Set flag to control automatic clearing of forces after each time step.
  public SetAutoClearForces(flag: boolean): void {
    this.m_clearForces = flag;
  }

  /// Get the flag that controls automatic clearing of forces after each time step.
  public GetAutoClearForces(): boolean {
    return this.m_clearForces;
  }

  /// Shift the world origin. Useful for large worlds.
  /// The body shift formula is: position -= newOrigin
  /// @param newOrigin the new origin with respect to the old origin
  public ShiftOrigin(newOrigin: XY): void {
    if (this.IsLocked()) { throw new Error(); }

    for (let b: b2Body  = this.m_bodyList; b; b = b.m_next) {
      b.m_xf.p.SelfSub(newOrigin);
      b.m_sweep.c0.SelfSub(newOrigin);
      b.m_sweep.c.SelfSub(newOrigin);
    }

    for (let j: b2Joint  = this.m_jointList; j; j = j.m_next) {
      j.ShiftOrigin(newOrigin);
    }

    this.m_contactManager.m_broadPhase.ShiftOrigin(newOrigin);
  }

  /// Get the contact manager for testing.
  public GetContactManager(): b2ContactManager {
    return this.m_contactManager;
  }

  /// Get the current profile.
  public GetProfile(): b2Profile {
    return this.m_profile;
  }

  /// Dump the world into the log file.
  /// @warning this should be called outside of a time step.
  public Dump(log: (format: string, ...args: any[]) => void): void {
    if (this.m_locked) {
      return;
    }

    // b2OpenDump("box2d_dump.inl");

    log("const g: b2Vec2 = new b2Vec2(%.15f, %.15f);\n", this.m_gravity.x, this.m_gravity.y);
    log("this.m_world.SetGravity(g);\n");

    log("const bodies: b2Body[] = [];\n");
    log("const joints: b2Joint[] = [];\n");
    let i: number = 0;
    for (let b: b2Body  = this.m_bodyList; b; b = b.m_next) {
      b.m_islandIndex = i;
      b.Dump(log);
      ++i;
    }

    i = 0;
    for (let j: b2Joint  = this.m_jointList; j; j = j.m_next) {
      j.m_index = i;
      ++i;
    }

    // First pass on joints, skip gear joints.
    for (let j: b2Joint  = this.m_jointList; j; j = j.m_next) {
      if (j.m_type === b2JointType.e_gearJoint) {
        continue;
      }

      log("{\n");
      j.Dump(log);
      log("}\n");
    }

    // Second pass on joints, only gear joints.
    for (let j: b2Joint  = this.m_jointList; j; j = j.m_next) {
      if (j.m_type !== b2JointType.e_gearJoint) {
        continue;
      }

      log("{\n");
      j.Dump(log);
      log("}\n");
    }

    // b2CloseDump();
  }

  public DrawShape(fixture: b2Fixture, color: b2Color): void {
    if (this.m_debugDraw === null) {
      return;
    }
    const shape: b2Shape = fixture.GetShape();

    switch (shape.m_type) {
      case b2ShapeType.e_circleShape: {
        const circle: b2CircleShape = shape as b2CircleShape;
        const center: b2Vec2 = circle.m_p;
        const radius: number = circle.m_radius;
        const axis: b2Vec2 = b2Vec2.UNITX;
        this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
        break;
      }

      case b2ShapeType.e_edgeShape: {
        const edge: b2EdgeShape = shape as b2EdgeShape;
        const v1: b2Vec2 = edge.m_vertex1;
        const v2: b2Vec2 = edge.m_vertex2;
        this.m_debugDraw.DrawSegment(v1, v2, color);

        if (edge.m_oneSided === false) {
          this.m_debugDraw.DrawPoint(v1, 4.0, color);
          this.m_debugDraw.DrawPoint(v2, 4.0, color);
        }
        break;
      }

      case b2ShapeType.e_chainShape: {
        const chain: b2ChainShape = shape as b2ChainShape;
        const count: number = chain.m_count;
        const vertices: b2Vec2[] = chain.m_vertices;
        let v1: b2Vec2 = vertices[0];
        for (let i: number = 1; i < count; ++i) {
          const v2: b2Vec2 = vertices[i];
          this.m_debugDraw.DrawSegment(v1, v2, color);
          v1 = v2;
        }

        break;
      }

      case b2ShapeType.e_polygonShape: {
        const poly: b2PolygonShape = shape as b2PolygonShape;
        const vertexCount: number = poly.m_count;
        const vertices: b2Vec2[] = poly.m_vertices;
        this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
        break;
      }
    }
  }

  public Solve(step: b2TimeStep): void {
    // #if B2_ENABLE_PARTICLE
    // update previous transforms
    for (let b = this.m_bodyList; b; b = b.m_next) {
      b.m_xf0.Copy(b.m_xf);
    }
    // #endif

    // #if B2_ENABLE_CONTROLLER
    // @see b2Controller list
    for (let controller = this.m_controllerList; controller; controller = controller.m_next) {
      controller.Step(step);
    }
    // #endif

    this.m_profile.solveInit = 0;
    this.m_profile.solveVelocity = 0;
    this.m_profile.solvePosition = 0;

    // Size the island for the worst case.
    const island: b2Island = this.m_island;
    island.Initialize(this.m_bodyCount,
      this.m_contactManager.m_contactCount,
      this.m_jointCount,
      this.m_contactManager.m_contactListener);

    // Clear all the island flags.
    for (let b: b2Body  = this.m_bodyList; b; b = b.m_next) {
      b.m_islandFlag = false;
    }
    for (let c: b2Contact  = this.m_contactManager.m_contactList; c; c = c.m_next) {
      c.m_islandFlag = false;
    }
    for (let j: b2Joint  = this.m_jointList; j; j = j.m_next) {
      j.m_islandFlag = false;
    }

    // Build and simulate all awake islands.
    // DEBUG: const stackSize: number = this.m_bodyCount;
    const stack: Array<b2Body > = this.s_stack;
    for (let seed: b2Body  = this.m_bodyList; seed; seed = seed.m_next) {
      if (seed.m_islandFlag) {
        continue;
      }

      if (!seed.IsAwake() || !seed.IsEnabled()) {
        continue;
      }

      // The seed can be dynamic or kinematic.
      if (seed.GetType() === b2BodyType.b2_staticBody) {
        continue;
      }

      // Reset island and stack.
      island.Clear();
      let stackCount: number = 0;
      stack[stackCount++] = seed;
      seed.m_islandFlag = true;

      // Perform a depth first search (DFS) on the constraint graph.
      while (stackCount > 0) {
        // Grab the next body off the stack and add it to the island.
        const b: b2Body  = stack[--stackCount];
        if (!b) { throw new Error(); }
        // DEBUG: b2Assert(b.IsEnabled());
        island.AddBody(b);

        // To keep islands as small as possible, we don't
        // propagate islands across static bodies.
        if (b.GetType() === b2BodyType.b2_staticBody) {
          continue;
        }

        // Make sure the body is awake. (without resetting sleep timer).
        b.m_awakeFlag = true;

        // Search all contacts connected to this body.
        for (let ce: b2ContactEdge  = b.m_contactList; ce; ce = ce.next) {
          const contact: b2Contact = ce.contact;

          // Has this contact already been added to an island?
          if (contact.m_islandFlag) {
            continue;
          }

          // Is this contact solid and touching?
          if (!contact.IsEnabled() || !contact.IsTouching()) {
            continue;
          }

          // Skip sensors.
          const sensorA: boolean = contact.m_fixtureA.m_isSensor;
          const sensorB: boolean = contact.m_fixtureB.m_isSensor;
          if (sensorA || sensorB) {
            continue;
          }

          island.AddContact(contact);
          contact.m_islandFlag = true;

          const other: b2Body = ce.other;

          // Was the other body already added to this island?
          if (other.m_islandFlag) {
            continue;
          }

          // DEBUG: b2Assert(stackCount < stackSize);
          stack[stackCount++] = other;
          other.m_islandFlag = true;
        }

        // Search all joints connect to this body.
        for (let je: b2JointEdge  = b.m_jointList; je; je = je.next) {
          if (je.joint.m_islandFlag) {
            continue;
          }

          const other: b2Body = je.other;

          // Don't simulate joints connected to disabled bodies.
          if (!other.IsEnabled()) {
            continue;
          }

          island.AddJoint(je.joint);
          je.joint.m_islandFlag = true;

          if (other.m_islandFlag) {
            continue;
          }

          // DEBUG: b2Assert(stackCount < stackSize);
          stack[stackCount++] = other;
          other.m_islandFlag = true;
        }
      }

      const profile: b2Profile = new b2Profile();
      island.Solve(profile, step, this.m_gravity, this.m_allowSleep);
      this.m_profile.solveInit += profile.solveInit;
      this.m_profile.solveVelocity += profile.solveVelocity;
      this.m_profile.solvePosition += profile.solvePosition;

      // Post solve cleanup.
      for (let i: number = 0; i < island.m_bodyCount; ++i) {
        // Allow static bodies to participate in other islands.
        const b: b2Body = island.m_bodies[i];
        if (b.GetType() === b2BodyType.b2_staticBody) {
          b.m_islandFlag = false;
        }
      }
    }

    for (let i: number = 0; i < stack.length; ++i) {
      if (!stack[i]) { break; }
      stack[i] = null;
    }

    const timer: b2Timer = new b2Timer();

    // Synchronize fixtures, check for out of range bodies.
    for (let b = this.m_bodyList; b; b = b.m_next) {
      // If a body was not in an island then it did not move.
      if (!b.m_islandFlag) {
        continue;
      }

      if (b.GetType() === b2BodyType.b2_staticBody) {
        continue;
      }

      // Update fixtures (for broad-phase).
      b.SynchronizeFixtures();
    }

    // Look for new contacts.
    this.m_contactManager.FindNewContacts();
    this.m_profile.broadphase = timer.GetMilliseconds();
  }

  private static SolveTOI_s_subStep = new b2TimeStep();
  private static SolveTOI_s_backup = new b2Sweep();
  private static SolveTOI_s_backup1 = new b2Sweep();
  private static SolveTOI_s_backup2 = new b2Sweep();
  private static SolveTOI_s_toi_input = new b2TOIInput();
  private static SolveTOI_s_toi_output = new b2TOIOutput();
  public SolveTOI(step: b2TimeStep): void {
    const island: b2Island = this.m_island;
    island.Initialize(2 * b2_maxTOIContacts, b2_maxTOIContacts, 0, this.m_contactManager.m_contactListener);

    if (this.m_stepComplete) {
      for (let b: b2Body  = this.m_bodyList; b; b = b.m_next) {
        b.m_islandFlag = false;
        b.m_sweep.alpha0 = 0;
      }

      for (let c: b2Contact  = this.m_contactManager.m_contactList; c; c = c.m_next) {
        // Invalidate TOI
        c.m_toiFlag = false;
        c.m_islandFlag = false;
        c.m_toiCount = 0;
        c.m_toi = 1;
      }
    }

    // Find TOI events and solve them.
    for (; ;) {
      // Find the first TOI.
      let minContact: b2Contact  = null;
      let minAlpha: number = 1;

      for (let c: b2Contact  = this.m_contactManager.m_contactList; c; c = c.m_next) {
        // Is this contact disabled?
        if (!c.IsEnabled()) {
          continue;
        }

        // Prevent excessive sub-stepping.
        if (c.m_toiCount > b2_maxSubSteps) {
          continue;
        }

        let alpha: number = 1;
        if (c.m_toiFlag) {
          // This contact has a valid cached TOI.
          alpha = c.m_toi;
        } else {
          const fA: b2Fixture = c.GetFixtureA();
          const fB: b2Fixture = c.GetFixtureB();

          // Is there a sensor?
          if (fA.IsSensor() || fB.IsSensor()) {
            continue;
          }

          const bA: b2Body = fA.GetBody();
          const bB: b2Body = fB.GetBody();

          const typeA: b2BodyType = bA.m_type;
          const typeB: b2BodyType = bB.m_type;
          // DEBUG: b2Assert(typeA !== b2BodyType.b2_staticBody || typeB !== b2BodyType.b2_staticBody);

          const activeA: boolean = bA.IsAwake() && typeA !== b2BodyType.b2_staticBody;
          const activeB: boolean = bB.IsAwake() && typeB !== b2BodyType.b2_staticBody;

          // Is at least one body active (awake and dynamic or kinematic)?
          if (!activeA && !activeB) {
            continue;
          }

          const collideA: boolean = bA.IsBullet() || typeA !== b2BodyType.b2_dynamicBody;
          const collideB: boolean = bB.IsBullet() || typeB !== b2BodyType.b2_dynamicBody;

          // Are these two non-bullet dynamic bodies?
          if (!collideA && !collideB) {
            continue;
          }

          // Compute the TOI for this contact.
          // Put the sweeps onto the same time interval.
          let alpha0: number = bA.m_sweep.alpha0;

          if (bA.m_sweep.alpha0 < bB.m_sweep.alpha0) {
            alpha0 = bB.m_sweep.alpha0;
            bA.m_sweep.Advance(alpha0);
          } else if (bB.m_sweep.alpha0 < bA.m_sweep.alpha0) {
            alpha0 = bA.m_sweep.alpha0;
            bB.m_sweep.Advance(alpha0);
          }

          // DEBUG: b2Assert(alpha0 < 1);

          const indexA: number = c.GetChildIndexA();
          const indexB: number = c.GetChildIndexB();

          // Compute the time of impact in interval [0, minTOI]
          const input: b2TOIInput = b2World.SolveTOI_s_toi_input;
          input.proxyA.SetShape(fA.GetShape(), indexA);
          input.proxyB.SetShape(fB.GetShape(), indexB);
          input.sweepA.Copy(bA.m_sweep);
          input.sweepB.Copy(bB.m_sweep);
          input.tMax = 1;

          const output: b2TOIOutput = b2World.SolveTOI_s_toi_output;
          b2TimeOfImpact(output, input);

          // Beta is the fraction of the remaining portion of the .
          const beta: number = output.t;
          if (output.state === b2TOIOutputState.e_touching) {
            alpha = b2Min(alpha0 + (1 - alpha0) * beta, 1);
          } else {
            alpha = 1;
          }

          c.m_toi = alpha;
          c.m_toiFlag = true;
        }

        if (alpha < minAlpha) {
          // This is the minimum TOI found so far.
          minContact = c;
          minAlpha = alpha;
        }
      }

      if (minContact === null || 1 - 10 * b2_epsilon < minAlpha) {
        // No more TOI events. Done!
        this.m_stepComplete = true;
        break;
      }

      // Advance the bodies to the TOI.
      const fA: b2Fixture = minContact.GetFixtureA();
      const fB: b2Fixture = minContact.GetFixtureB();
      const bA: b2Body = fA.GetBody();
      const bB: b2Body = fB.GetBody();

      const backup1: b2Sweep = b2World.SolveTOI_s_backup1.Copy(bA.m_sweep);
      const backup2: b2Sweep = b2World.SolveTOI_s_backup2.Copy(bB.m_sweep);

      bA.Advance(minAlpha);
      bB.Advance(minAlpha);

      // The TOI contact likely has some new contact points.
      minContact.Update(this.m_contactManager.m_contactListener);
      minContact.m_toiFlag = false;
      ++minContact.m_toiCount;

      // Is the contact solid?
      if (!minContact.IsEnabled() || !minContact.IsTouching()) {
        // Restore the sweeps.
        minContact.SetEnabled(false);
        bA.m_sweep.Copy(backup1);
        bB.m_sweep.Copy(backup2);
        bA.SynchronizeTransform();
        bB.SynchronizeTransform();
        continue;
      }

      bA.SetAwake(true);
      bB.SetAwake(true);

      // Build the island
      island.Clear();
      island.AddBody(bA);
      island.AddBody(bB);
      island.AddContact(minContact);

      bA.m_islandFlag = true;
      bB.m_islandFlag = true;
      minContact.m_islandFlag = true;

      // Get contacts on bodyA and bodyB.
      // const bodies: b2Body[] = [bA, bB];
      for (let i: number = 0; i < 2; ++i) {
        const body: b2Body = (i === 0) ? (bA) : (bB); // bodies[i];
        if (body.m_type === b2BodyType.b2_dynamicBody) {
          for (let ce: b2ContactEdge  = body.m_contactList; ce; ce = ce.next) {
            if (island.m_bodyCount === island.m_bodyCapacity) {
              break;
            }

            if (island.m_contactCount === island.m_contactCapacity) {
              break;
            }

            const contact: b2Contact = ce.contact;

            // Has this contact already been added to the island?
            if (contact.m_islandFlag) {
              continue;
            }

            // Only add static, kinematic, or bullet bodies.
            const other: b2Body = ce.other;
            if (other.m_type === b2BodyType.b2_dynamicBody &&
              !body.IsBullet() && !other.IsBullet()) {
              continue;
            }

            // Skip sensors.
            const sensorA: boolean = contact.m_fixtureA.m_isSensor;
            const sensorB: boolean = contact.m_fixtureB.m_isSensor;
            if (sensorA || sensorB) {
              continue;
            }

            // Tentatively advance the body to the TOI.
            const backup: b2Sweep = b2World.SolveTOI_s_backup.Copy(other.m_sweep);
            if (!other.m_islandFlag) {
              other.Advance(minAlpha);
            }

            // Update the contact points
            contact.Update(this.m_contactManager.m_contactListener);

            // Was the contact disabled by the user?
            if (!contact.IsEnabled()) {
              other.m_sweep.Copy(backup);
              other.SynchronizeTransform();
              continue;
            }

            // Are there contact points?
            if (!contact.IsTouching()) {
              other.m_sweep.Copy(backup);
              other.SynchronizeTransform();
              continue;
            }

            // Add the contact to the island
            contact.m_islandFlag = true;
            island.AddContact(contact);

            // Has the other body already been added to the island?
            if (other.m_islandFlag) {
              continue;
            }

            // Add the other body to the island.
            other.m_islandFlag = true;

            if (other.m_type !== b2BodyType.b2_staticBody) {
              other.SetAwake(true);
            }

            island.AddBody(other);
          }
        }
      }

      const subStep: b2TimeStep = b2World.SolveTOI_s_subStep;
      subStep.dt = (1 - minAlpha) * step.dt;
      subStep.inv_dt = 1 / subStep.dt;
      subStep.dtRatio = 1;
      subStep.positionIterations = 20;
      subStep.velocityIterations = step.velocityIterations;
      // #if B2_ENABLE_PARTICLE
      subStep.particleIterations = step.particleIterations;
      // #endif
      subStep.warmStarting = false;
      island.SolveTOI(subStep, bA.m_islandIndex, bB.m_islandIndex);

      // Reset island flags and synchronize broad-phase proxies.
      for (let i: number = 0; i < island.m_bodyCount; ++i) {
        const body: b2Body = island.m_bodies[i];
        body.m_islandFlag = false;

        if (body.m_type !== b2BodyType.b2_dynamicBody) {
          continue;
        }

        body.SynchronizeFixtures();

        // Invalidate all contact TOIs on this displaced body.
        for (let ce: b2ContactEdge  = body.m_contactList; ce; ce = ce.next) {
          ce.contact.m_toiFlag = false;
          ce.contact.m_islandFlag = false;
        }
      }

      // Commit fixture proxy movements to the broad-phase so that new contacts are created.
      // Also, some contacts can be destroyed.
      this.m_contactManager.FindNewContacts();

      if (this.m_subStepping) {
        this.m_stepComplete = false;
        break;
      }
    }
  }

  // #if B2_ENABLE_CONTROLLER
  public AddController(controller: b2Controller): b2Controller {
    // b2Assert(controller.m_world === null, "Controller can only be a member of one world");
    // controller.m_world = this;
    controller.m_next = this.m_controllerList;
    controller.m_prev = null;
    if (this.m_controllerList) {
      this.m_controllerList.m_prev = controller;
    }
    this.m_controllerList = controller;
    ++this.m_controllerCount;
    return controller;
  }

  public RemoveController(controller: b2Controller): b2Controller {
    // b2Assert(controller.m_world === this, "Controller is not a member of this world");
    if (controller.m_prev) {
      controller.m_prev.m_next = controller.m_next;
    }
    if (controller.m_next) {
      controller.m_next.m_prev = controller.m_prev;
    }
    if (this.m_controllerList === controller) {
      this.m_controllerList = controller.m_next;
    }
    --this.m_controllerCount;
    controller.m_prev = null;
    controller.m_next = null;
    // delete controller.m_world; // = null;
    return controller;
  }
  // #endif
}
/*
* Copyright (c) 2006-2009 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/








// #if B2_ENABLE_PARTICLE


// #endif

/// Joints and fixtures are destroyed when their associated
/// body is destroyed. Implement this listener so that you
/// may nullify references to these joints and shapes.
 class b2DestructionListener {
  /// Called when any joint is about to be destroyed due
  /// to the destruction of one of its attached bodies.
  public SayGoodbyeJoint(joint: b2Joint): void {}

  /// Called when any fixture is about to be destroyed due
  /// to the destruction of its parent body.
  public SayGoodbyeFixture(fixture: b2Fixture): void {}

  // #if B2_ENABLE_PARTICLE
  /// Called when any particle group is about to be destroyed.
  public SayGoodbyeParticleGroup(group: b2ParticleGroup): void {}

  /// Called when a particle is about to be destroyed.
  /// The index can be used in conjunction with
  /// b2ParticleSystem::GetUserDataBuffer() or
  /// b2ParticleSystem::GetParticleHandleFromIndex() to determine which
  /// particle has been destroyed.
  public SayGoodbyeParticle(system: b2ParticleSystem, index: number): void {}
  // #endif
}

/// Implement this class to provide collision filtering. In other words, you can implement
/// this class if you want finer control over contact creation.
 class b2ContactFilter {
  /// Return true if contact calculations should be performed between these two shapes.
  /// @warning for performance reasons this is only called when the AABBs begin to overlap.
  public ShouldCollide(fixtureA: b2Fixture, fixtureB: b2Fixture): boolean {
    const bodyA: b2Body = fixtureA.GetBody();
    const bodyB: b2Body = fixtureB.GetBody();

    // At least one body should be dynamic or kinematic.
    if (bodyB.GetType() === b2BodyType.b2_staticBody && bodyA.GetType() === b2BodyType.b2_staticBody) {
      return false;
    }

    // Does a joint prevent collision?
    if (!bodyB.ShouldCollideConnected(bodyA)) {
      return false;
    }

    const filter1: b2Filter = fixtureA.GetFilterData();
    const filter2: b2Filter = fixtureB.GetFilterData();

    if (filter1.groupIndex === filter2.groupIndex && filter1.groupIndex !== 0) {
      return (filter1.groupIndex > 0);
    }

    const collide: boolean = (((filter1.maskBits & filter2.categoryBits) !== 0) && ((filter1.categoryBits & filter2.maskBits) !== 0));
    return collide;
  }

  // #if B2_ENABLE_PARTICLE
  public ShouldCollideFixtureParticle(fixture: b2Fixture, system: b2ParticleSystem, index: number): boolean {
    return true;
  }

  public ShouldCollideParticleParticle(system: b2ParticleSystem, indexA: number, indexB: number): boolean {
    return true;
  }
  // #endif

  public static  b2_defaultFilter: b2ContactFilter = new b2ContactFilter();
}

/// Contact impulses for reporting. Impulses are used instead of forces because
/// sub-step forces may approach infinity for rigid body collisions. These
/// match up one-to-one with the contact points in b2Manifold.
 class b2ContactImpulse {
  public normalImpulses: number[] = b2MakeNumberArray(b2_maxManifoldPoints);
  public tangentImpulses: number[] = b2MakeNumberArray(b2_maxManifoldPoints);
  public count: number = 0;
}

/// Implement this class to get contact information. You can use these results for
/// things like sounds and game logic. You can also get contact results by
/// traversing the contact lists after the time step. However, you might miss
/// some contacts because continuous physics leads to sub-stepping.
/// Additionally you may receive multiple callbacks for the same contact in a
/// single time step.
/// You should strive to make your callbacks efficient because there may be
/// many callbacks per time step.
/// @warning You cannot create/destroy Box2D entities inside these callbacks.
 class b2ContactListener {
  /// Called when two fixtures begin to touch.
  public BeginContact(contact: b2Contact): void {}

  /// Called when two fixtures cease to touch.
  public EndContact(contact: b2Contact): void {}

  // #if B2_ENABLE_PARTICLE
  public BeginContactFixtureParticle(system: b2ParticleSystem, contact: b2ParticleBodyContact): void {}
  public EndContactFixtureParticle(system: b2ParticleSystem, contact: b2ParticleBodyContact): void {}
  public BeginContactParticleParticle(system: b2ParticleSystem, contact: b2ParticleContact): void {}
  public EndContactParticleParticle(system: b2ParticleSystem, contact: b2ParticleContact): void {}
  // #endif

  /// This is called after a contact is updated. This allows you to inspect a
  /// contact before it goes to the solver. If you are careful, you can modify the
  /// contact manifold (e.g. disable contact).
  /// A copy of the old manifold is provided so that you can detect changes.
  /// Note: this is called only for awake bodies.
  /// Note: this is called even when the number of contact points is zero.
  /// Note: this is not called for sensors.
  /// Note: if you set the number of contact points to zero, you will not
  /// get an EndContact callback. However, you may get a BeginContact callback
  /// the next step.
  public PreSolve(contact: b2Contact, oldManifold: b2Manifold): void {}

  /// This lets you inspect a contact after the solver is finished. This is useful
  /// for inspecting impulses.
  /// Note: the contact manifold does not include time of impact impulses, which can be
  /// arbitrarily large if the sub-step is small. Hence the impulse is provided explicitly
  /// in a separate data structure.
  /// Note: this is only called for contacts that are touching, solid, and awake.
  public PostSolve(contact: b2Contact, impulse: b2ContactImpulse): void {}

  public static  b2_defaultListener: b2ContactListener = new b2ContactListener();
}

/// Callback class for AABB queries.
/// See b2World::Query
 class b2QueryCallback {
  /// Called for each fixture found in the query AABB.
  /// @return false to terminate the query.
  public ReportFixture(fixture: b2Fixture): boolean {
    return true;
  }

  // #if B2_ENABLE_PARTICLE
  public ReportParticle(system: b2ParticleSystem, index: number): boolean {
    return false;
  }
  public ShouldQueryParticleSystem(system: b2ParticleSystem): boolean {
    return true;
  }
  // #endif
}

 type b2QueryCallbackFunction = (fixture: b2Fixture) => boolean;

/// Callback class for ray casts.
/// See b2World::RayCast
 class b2RayCastCallback {
  /// Called for each fixture found in the query. You control how the ray cast
  /// proceeds by returning a float:
  /// return -1: ignore this fixture and continue
  /// return 0: terminate the ray cast
  /// return fraction: clip the ray to this point
  /// return 1: don't clip the ray and continue
  /// @param fixture the fixture hit by the ray
  /// @param point the point of initial intersection
  /// @param normal the normal vector at the point of intersection
  /// @return -1 to filter, 0 to terminate, fraction to clip the ray for
  /// closest hit, 1 to continue
  public ReportFixture(fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number): number {
    return fraction;
  }

  // #if B2_ENABLE_PARTICLE
  public ReportParticle(system: b2ParticleSystem, index: number, point: b2Vec2, normal: b2Vec2, fraction: number): number {
    return 0;
  }
  public ShouldQueryParticleSystem(system: b2ParticleSystem): boolean {
    return true;
  }
  // #endif
}

 type b2RayCastCallbackFunction = (fixture: b2Fixture, point: b2Vec2, normal: b2Vec2, fraction: number) => number;
/*
 * Copyright (c) 2013 Google, Inc.
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_PARTICLE

// DEBUG: 






 enum b2ParticleGroupFlag {
  /// Prevents overlapping or leaking.
  b2_solidParticleGroup = 1 << 0,
  /// Keeps its shape.
  b2_rigidParticleGroup = 1 << 1,
  /// Won't be destroyed if it gets empty.
  b2_particleGroupCanBeEmpty = 1 << 2,
  /// Will be destroyed on next simulation step.
  b2_particleGroupWillBeDestroyed = 1 << 3,
  /// Updates depth data on next simulation step.
  b2_particleGroupNeedsUpdateDepth = 1 << 4,

  b2_particleGroupInternalMask = b2_particleGroupWillBeDestroyed | b2_particleGroupNeedsUpdateDepth,
}

 interface b2IParticleGroupDef {
  flags?: b2ParticleFlag;
  groupFlags?: b2ParticleGroupFlag;
  position?: XY;
  angle?: number;
  linearVelocity?: XY;
  angularVelocity?: number;
  color?: RGBA;
  strength?: number;
  shape?: b2Shape;
  shapes?: b2Shape[];
  shapeCount?: number;
  stride?: number;
  particleCount?: number;
  positionData?: XY[];
  lifetime?: number;
  userData?: any;
  group?: b2ParticleGroup ;
}

 class b2ParticleGroupDef implements b2IParticleGroupDef {
  public flags: b2ParticleFlag = 0;
  public groupFlags: b2ParticleGroupFlag = 0;
  public  position: b2Vec2 = new b2Vec2();
  public angle: number = 0.0;
  public  linearVelocity: b2Vec2 = new b2Vec2();
  public angularVelocity: number = 0.0;
  public  color: b2Color = new b2Color();
  public strength: number = 1.0;
  public shape?: b2Shape;
  public shapes?: b2Shape[];
  public shapeCount: number = 0;
  public stride: number = 0;
  public particleCount: number = 0;
  public positionData?: b2Vec2[];
  public lifetime: number = 0;
  public userData: any = null;
  public group: b2ParticleGroup  = null;
}

 class b2ParticleGroup {

  public  m_system: b2ParticleSystem;
  public m_firstIndex: number = 0;
  public m_lastIndex: number = 0;
  public m_groupFlags: b2ParticleGroupFlag = 0;
  public m_strength: number = 1.0;
  public m_prev: b2ParticleGroup  = null;
  public m_next: b2ParticleGroup  = null;
  public m_timestamp: number = -1;
  public m_mass: number = 0.0;
  public m_inertia: number = 0.0;
  public  m_center: b2Vec2 = new b2Vec2();
  public  m_linearVelocity: b2Vec2 = new b2Vec2();
  public m_angularVelocity: number = 0.0;
  public  m_transform: b2Transform = new b2Transform();
  ///m_transform.SetIdentity();
  public m_userData: any = null;

  constructor(system: b2ParticleSystem) {
    this.m_system = system;
  }

  public GetNext(): b2ParticleGroup  {
    return this.m_next;
  }

  public GetParticleSystem(): b2ParticleSystem {
    return this.m_system;
  }

  public GetParticleCount(): number {
    return this.m_lastIndex - this.m_firstIndex;
  }

  public GetBufferIndex(): number {
    return this.m_firstIndex;
  }

  public ContainsParticle(index: number): boolean {
    return this.m_firstIndex <= index && index < this.m_lastIndex;
  }

  public GetAllParticleFlags(): b2ParticleFlag {
    if (!this.m_system.m_flagsBuffer.data) { throw new Error(); }
    let flags = 0;
    for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
      flags |= this.m_system.m_flagsBuffer.data[i];
    }
    return flags;
  }

  public GetGroupFlags(): b2ParticleGroupFlag {
    return this.m_groupFlags;
  }

  public SetGroupFlags(flags: number): void {
    // DEBUG: b2Assert((flags & b2ParticleGroupFlag.b2_particleGroupInternalMask) === 0);
    flags |= this.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupInternalMask;
    this.m_system.SetGroupFlags(this, flags);
  }

  public GetMass(): number {
    this.UpdateStatistics();
    return this.m_mass;
  }

  public GetInertia(): number {
    this.UpdateStatistics();
    return this.m_inertia;
  }

  public GetCenter():b2Vec2 {
    this.UpdateStatistics();
    return this.m_center;
  }

  public GetLinearVelocity():b2Vec2 {
    this.UpdateStatistics();
    return this.m_linearVelocity;
  }

  public GetAngularVelocity(): number {
    this.UpdateStatistics();
    return this.m_angularVelocity;
  }

  public GetTransform(): b2Transform {
    return this.m_transform;
  }

  public GetPosition():b2Vec2 {
    return this.m_transform.p;
  }

  public GetAngle(): number {
    return this.m_transform.q.GetAngle();
  }

  public GetLinearVelocityFromWorldPoint<T extends XY>(worldPoint: XY, out: T): T {
    const s_t0 = b2ParticleGroup.GetLinearVelocityFromWorldPoint_s_t0;
    this.UpdateStatistics();
    ///  return m_linearVelocity + b2Cross(m_angularVelocity, worldPoint - m_center);
    return b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Vec2.SubVV(worldPoint, this.m_center, s_t0), out);
  }
  public static  GetLinearVelocityFromWorldPoint_s_t0 = new b2Vec2();

  public GetUserData(): void {
    return this.m_userData;
  }

  public SetUserData(data: any): void {
    this.m_userData = data;
  }

  public ApplyForce(force: XY): void {
    this.m_system.ApplyForce(this.m_firstIndex, this.m_lastIndex, force);
  }

  public ApplyLinearImpulse(impulse: XY): void {
    this.m_system.ApplyLinearImpulse(this.m_firstIndex, this.m_lastIndex, impulse);
  }

  public DestroyParticles(callDestructionListener: boolean): void {
    if (this.m_system.m_world.IsLocked()) { throw new Error(); }

    for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
      this.m_system.DestroyParticle(i, callDestructionListener);
    }
  }

  public UpdateStatistics(): void {
    if (!this.m_system.m_positionBuffer.data) { throw new Error(); }
    if (!this.m_system.m_velocityBuffer.data) { throw new Error(); }
    const p = new b2Vec2();
    const v = new b2Vec2();
    if (this.m_timestamp !== this.m_system.m_timestamp) {
      const m = this.m_system.GetParticleMass();
      ///  this.m_mass = 0;
      this.m_mass = m * (this.m_lastIndex - this.m_firstIndex);
      this.m_center.SetZero();
      this.m_linearVelocity.SetZero();
      for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
        ///  this.m_mass += m;
        ///  this.m_center += m * this.m_system.m_positionBuffer.data[i];
        this.m_center.SelfMulAdd(m, this.m_system.m_positionBuffer.data[i]);
        ///  this.m_linearVelocity += m * this.m_system.m_velocityBuffer.data[i];
        this.m_linearVelocity.SelfMulAdd(m, this.m_system.m_velocityBuffer.data[i]);
      }
      if (this.m_mass > 0) {
        const inv_mass = 1 / this.m_mass;
        ///this.m_center *= 1 / this.m_mass;
        this.m_center.SelfMul(inv_mass);
        ///this.m_linearVelocity *= 1 / this.m_mass;
        this.m_linearVelocity.SelfMul(inv_mass);
      }
      this.m_inertia = 0;
      this.m_angularVelocity = 0;
      for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
        ///b2Vec2 p = this.m_system.m_positionBuffer.data[i] - this.m_center;
        b2Vec2.SubVV(this.m_system.m_positionBuffer.data[i], this.m_center, p);
        ///b2Vec2 v = this.m_system.m_velocityBuffer.data[i] - this.m_linearVelocity;
        b2Vec2.SubVV(this.m_system.m_velocityBuffer.data[i], this.m_linearVelocity, v);
        this.m_inertia += m * b2Vec2.DotVV(p, p);
        this.m_angularVelocity += m * b2Vec2.CrossVV(p, v);
      }
      if (this.m_inertia > 0) {
        this.m_angularVelocity *= 1 / this.m_inertia;
      }
      this.m_timestamp = this.m_system.m_timestamp;
    }
  }
}

// #endif
/*
 * Copyright (c) 2013 Google, Inc.
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// #if B2_ENABLE_PARTICLE

// DEBUG: 


















function std_iter_swap<T>(array: T[], a: number, b: number): void {
  const tmp: T = array[a];
  array[a] = array[b];
  array[b] = tmp;
}

function default_compare<T>(a: T, b: T): boolean { return a < b; }

function std_sort<T>(array: T[], first: number = 0, len: number = array.length - first, cmp: (a: T, b: T) => boolean = default_compare): T[] {
  let left = first;
  const stack: number[] = [];
  let pos = 0;

  for (; ; ) { /* outer loop */
    for (; left + 1 < len; len++) { /* sort left to len-1 */
      const pivot = array[left + Math.floor(Math.random() * (len - left))]; /* pick random pivot */
      stack[pos++] = len; /* sort right part later */
      for (let right = left - 1; ; ) { /* inner loop: partitioning */
        while (cmp(array[++right], pivot)) {} /* look for greater element */
        while (cmp(pivot, array[--len])) {} /* look for smaller element */
        if (right >= len) {
          break;
        } /* partition point found? */
        std_iter_swap(array, right, len); /* the only swap */
      } /* partitioned, continue left part */
    }
    if (pos === 0) {
      break;
    } /* stack empty? */
    left = len; /* left to right is sorted */
    len = stack[--pos]; /* get next range to sort */
  }

  return array;
}

function std_stable_sort<T>(array: T[], first: number = 0, len: number = array.length - first, cmp: (a: T, b: T) => boolean = default_compare): T[] {
  return std_sort(array, first, len, cmp);
}

function std_remove_if<T>(array: T[], predicate: (value: T) => boolean, length: number = array.length) {
  let l = 0;

  for (let c = 0; c < length; ++c) {
    // if we can be collapsed, keep l where it is.
    if (predicate(array[c])) {
      continue;
    }

    // this node can't be collapsed; push it back as far as we can.
    if (c === l) {
      ++l;
      continue; // quick exit if we're already in the right spot
    }

    // array[l++] = array[c];
    std_iter_swap(array, l++, c);
  }

  return l;
}

function std_lower_bound<A, B>(array: A[], first: number, last: number, val: B, cmp: (a: A, b: B) => boolean): number {
  let count = last - first;
  while (count > 0) {
    const step = Math.floor(count / 2);
    let it = first + step;

    if (cmp(array[it], val)) {
      first = ++it;
      count -= step + 1;
    } else {
      count = step;
    }
  }
  return first;
}

function std_upper_bound<A, B>(array: B[], first: number, last: number, val: A, cmp: (a: A, b: B) => boolean): number {
  let count = last - first;
  while (count > 0) {
    const step = Math.floor(count / 2);
    let it = first + step;

    if (!cmp(val, array[it])) {
      first = ++it;
      count -= step + 1;
    } else {
      count = step;
    }
  }
  return first;
}

function std_rotate<T>(array: T[], first: number, n_first: number, last: number): void {
  let next = n_first;
  while (first !== next) {
    std_iter_swap(array, first++, next++);
    if (next === last) {
      next = n_first;
    } else if (first === n_first) {
      n_first = next;
         }
  }
}

function std_unique<T>(array: T[], first: number, last: number, cmp: (a: T, b: T) => boolean): number {
  if (first === last) {
    return last;
  }
  let result = first;
  while (++first !== last) {
    if (!cmp(array[result], array[first])) {
      ///array[++result] = array[first];
      std_iter_swap(array, ++result, first);
    }
  }
  return ++result;
}

 class b2GrowableBuffer<T> {
  public data: T[] = [];
  public count: number = 0;
  public capacity: number = 0;
  public allocator: () => T;

  constructor(allocator: () => T) {
    this.allocator = allocator;
  }

  public Append(): number {
    if (this.count >= this.capacity) {
      this.Grow();
    }
    return this.count++;
  }

  public Reserve(newCapacity: number): void {
    if (this.capacity >= newCapacity) {
      return;
    }

    // DEBUG: b2Assert(this.capacity === this.data.length);
    for (let i = this.capacity; i < newCapacity; ++i) {
      this.data[i] = this.allocator();
    }
    this.capacity = newCapacity;
  }

  public Grow(): void {
    // Double the capacity.
    const newCapacity = this.capacity ? 2 * this.capacity : b2_minParticleSystemBufferCapacity;
    // DEBUG: b2Assert(newCapacity > this.capacity);
    this.Reserve(newCapacity);
  }

  public Free(): void {
    if (this.data.length === 0) {
      return;
    }

    this.data = [];
    this.capacity = 0;
    this.count = 0;
  }

  public Shorten(newEnd: number): void {
    // DEBUG: b2Assert(false);
  }

  public Data(): T[] {
    return this.data;
  }

  public GetCount(): number {
    return this.count;
  }

  public SetCount(newCount: number): void {
    // DEBUG: b2Assert(0 <= newCount && newCount <= this.capacity);
    this.count = newCount;
  }

  public GetCapacity(): number {
    return this.capacity;
  }

  public RemoveIf(pred: (t: T) => boolean): void {
    // DEBUG: let count = 0;
    // DEBUG: for (let i = 0; i < this.count; ++i) {
    // DEBUG:   if (!pred(this.data[i])) {
    // DEBUG:     count++;
    // DEBUG:   }
    // DEBUG: }

    this.count = std_remove_if(this.data, pred, this.count);

    // DEBUG: b2Assert(count === this.count);
  }

  public Unique(pred: (a: T, b: T) => boolean): void {
    this.count = std_unique(this.data, 0, this.count, pred);
  }
}

 type b2ParticleIndex = number;

 class b2FixtureParticleQueryCallback extends b2QueryCallback {
  public m_system: b2ParticleSystem;
  constructor(system: b2ParticleSystem) {
    super();
    this.m_system = system;
  }
  public ShouldQueryParticleSystem(system: b2ParticleSystem): boolean {
    // Skip reporting particles.
    return false;
  }
  public ReportFixture(fixture: b2Fixture): boolean {
    if (fixture.IsSensor()) {
      return true;
    }
    const shape = fixture.GetShape();
    const childCount = shape.GetChildCount();
    for (let childIndex = 0; childIndex < childCount; childIndex++) {
      const aabb = fixture.GetAABB(childIndex);
      const enumerator = this.m_system.GetInsideBoundsEnumerator(aabb);
      let index: number;
      while ((index = enumerator.GetNext()) >= 0) {
        this.ReportFixtureAndParticle(fixture, childIndex, index);
      }
    }
    return true;
  }
  public ReportParticle(system: b2ParticleSystem, index: number): boolean {
    return false;
  }
  public ReportFixtureAndParticle(fixture: b2Fixture, childIndex: number, index: number): void {
    // DEBUG: b2Assert(false); // pure virtual
  }
}

 class b2ParticleContact {
  public indexA: number = 0;
  public indexB: number = 0;
  public weight: number = 0;
  public normal: b2Vec2 = new b2Vec2();
  public flags: b2ParticleFlag = 0;

  public SetIndices(a: number, b: number): void {
    // DEBUG: b2Assert(a <= b2_maxParticleIndex && b <= b2_maxParticleIndex);
    this.indexA = a;
    this.indexB = b;
  }

  public SetWeight(w: number): void {
    this.weight = w;
  }

  public SetNormal(n: b2Vec2): void {
    this.normal.Copy(n);
  }

  public SetFlags(f: b2ParticleFlag): void {
    this.flags = f;
  }

  public GetIndexA(): number {
    return this.indexA;
  }

  public GetIndexB(): number {
    return this.indexB;
  }

  public GetWeight(): number {
    return this.weight;
  }

  public GetNormal(): b2Vec2 {
    return this.normal;
  }

  public GetFlags(): b2ParticleFlag {
    return this.flags;
  }

  public IsEqual(rhs: b2ParticleContact): boolean {
    return this.indexA === rhs.indexA && this.indexB === rhs.indexB && this.flags === rhs.flags && this.weight === rhs.weight && this.normal.x === rhs.normal.x && this.normal.y === rhs.normal.y;
  }

  public IsNotEqual(rhs: b2ParticleContact): boolean {
    return !this.IsEqual(rhs);
  }

  public ApproximatelyEqual(rhs: b2ParticleContact): boolean {
    const MAX_WEIGHT_DIFF = 0.01; // Weight 0 ~ 1, so about 1%
    const MAX_NORMAL_DIFF_SQ = 0.01 * 0.01; // Normal length = 1, so 1%
    return this.indexA === rhs.indexA && this.indexB === rhs.indexB && this.flags === rhs.flags && b2Abs(this.weight - rhs.weight) < MAX_WEIGHT_DIFF && b2Vec2.DistanceSquaredVV(this.normal, rhs.normal) < MAX_NORMAL_DIFF_SQ;
  }
}

 class b2ParticleBodyContact {
  public index: number = 0; // Index of the particle making contact.
  public body: b2Body; // The body making contact.
  public fixture: b2Fixture; // The specific fixture making contact
  public weight: number = 0.0; // Weight of the contact. A value between 0.0f and 1.0f.
  public normal: b2Vec2 = new b2Vec2(); // The normalized direction from the particle to the body.
  public mass: number = 0.0; // The effective mass used in calculating force.
}

 class b2ParticlePair {
  public indexA: number = 0; // Indices of the respective particles making pair.
  public indexB: number = 0;
  public flags: b2ParticleFlag = 0; // The logical sum of the particle flags. See the b2ParticleFlag enum.
  public strength: number = 0.0; // The strength of cohesion among the particles.
  public distance: number = 0.0; // The initial distance of the particles.
}

 class b2ParticleTriad {
  public indexA: number = 0; // Indices of the respective particles making triad.
  public indexB: number = 0;
  public indexC: number = 0;
  public flags: b2ParticleFlag = 0; // The logical sum of the particle flags. See the b2ParticleFlag enum.
  public strength: number = 0.0; // The strength of cohesion among the particles.
  public pa: b2Vec2 = new b2Vec2(0.0, 0.0); // Values used for calculation.
  public pb: b2Vec2 = new b2Vec2(0.0, 0.0);
  public pc: b2Vec2 = new b2Vec2(0.0, 0.0);
  public ka: number = 0.0;
  public kb: number = 0.0;
  public kc: number = 0.0;
  public s: number = 0.0;
}

 class b2ParticleSystemDef {
  // Initialize physical coefficients to the maximum values that
  // maintain numerical stability.

  /**
   * Enable strict Particle/Body contact check.
   * See SetStrictContactCheck for details.
   */
  public strictContactCheck: boolean = false;

  /**
   * Set the particle density.
   * See SetDensity for details.
   */
  public density: number = 1.0;

  /**
   * Change the particle gravity scale. Adjusts the effect of the
   * global gravity vector on particles. Default value is 1.0f.
   */
  public gravityScale: number = 1.0;

  /**
   * Particles behave as circles with this radius. In Box2D units.
   */
  public radius: number = 1.0;

  /**
   * Set the maximum number of particles.
   * By default, there is no maximum. The particle buffers can
   * continue to grow while b2World's block allocator still has
   * memory.
   * See SetMaxParticleCount for details.
   */
  public maxCount: number = 0;

  /**
   * Increases pressure in response to compression
   * Smaller values allow more compression
   */
  public pressureStrength: number = 0.005;

  /**
   * Reduces velocity along the collision normal
   * Smaller value reduces less
   */
  public dampingStrength: number = 1.0;

  /**
   * Restores shape of elastic particle groups
   * Larger values increase elastic particle velocity
   */
  public elasticStrength: number = 0.25;

  /**
   * Restores length of spring particle groups
   * Larger values increase spring particle velocity
   */
  public springStrength: number = 0.25;

  /**
   * Reduces relative velocity of viscous particles
   * Larger values slow down viscous particles more
   */
  public viscousStrength: number = 0.25;

  /**
   * Produces pressure on tensile particles
   * 0~0.2. Larger values increase the amount of surface tension.
   */
  public surfaceTensionPressureStrength: number = 0.2;

  /**
   * Smoothes outline of tensile particles
   * 0~0.2. Larger values result in rounder, smoother,
   * water-drop-like clusters of particles.
   */
  public surfaceTensionNormalStrength: number = 0.2;

  /**
   * Produces additional pressure on repulsive particles
   * Larger values repulse more
   * Negative values mean attraction. The range where particles
   * behave stably is about -0.2 to 2.0.
   */
  public repulsiveStrength: number = 1.0;

  /**
   * Produces repulsion between powder particles
   * Larger values repulse more
   */
  public powderStrength: number = 0.5;

  /**
   * Pushes particles out of solid particle group
   * Larger values repulse more
   */
  public ejectionStrength: number = 0.5;

  /**
   * Produces static pressure
   * Larger values increase the pressure on neighboring partilces
   * For a description of static pressure, see
   * http://en.wikipedia.org/wiki/Static_pressure#Static_pressure_in_fluid_dynamics
   */
  public staticPressureStrength: number = 0.2;

  /**
   * Reduces instability in static pressure calculation
   * Larger values make stabilize static pressure with fewer
   * iterations
   */
  public staticPressureRelaxation: number = 0.2;

  /**
   * Computes static pressure more precisely
   * See SetStaticPressureIterations for details
   */
  public staticPressureIterations: number = 8;

  /**
   * Determines how fast colors are mixed
   * 1.0f ==> mixed immediately
   * 0.5f ==> mixed half way each simulation step (see
   * b2World::Step())
   */
  public colorMixingStrength: number = 0.5;

  /**
   * Whether to destroy particles by age when no more particles
   * can be created.  See #b2ParticleSystem::SetDestructionByAge()
   * for more information.
   */
  public destroyByAge: boolean = true;

  /**
   * Granularity of particle lifetimes in seconds.  By default
   * this is set to (1.0f / 60.0f) seconds.  b2ParticleSystem uses
   * a 32-bit signed value to track particle lifetimes so the
   * maximum lifetime of a particle is (2^32 - 1) / (1.0f /
   * lifetimeGranularity) seconds. With the value set to 1/60 the
   * maximum lifetime or age of a particle is 2.27 years.
   */
  public lifetimeGranularity: number = 1.0 / 60.0;

  public Copy(def: b2ParticleSystemDef): b2ParticleSystemDef {
    this.strictContactCheck = def.strictContactCheck;
    this.density = def.density;
    this.gravityScale = def.gravityScale;
    this.radius = def.radius;
    this.maxCount = def.maxCount;
    this.pressureStrength = def.pressureStrength;
    this.dampingStrength = def.dampingStrength;
    this.elasticStrength = def.elasticStrength;
    this.springStrength = def.springStrength;
    this.viscousStrength = def.viscousStrength;
    this.surfaceTensionPressureStrength = def.surfaceTensionPressureStrength;
    this.surfaceTensionNormalStrength = def.surfaceTensionNormalStrength;
    this.repulsiveStrength = def.repulsiveStrength;
    this.powderStrength = def.powderStrength;
    this.ejectionStrength = def.ejectionStrength;
    this.staticPressureStrength = def.staticPressureStrength;
    this.staticPressureRelaxation = def.staticPressureRelaxation;
    this.staticPressureIterations = def.staticPressureIterations;
    this.colorMixingStrength = def.colorMixingStrength;
    this.destroyByAge = def.destroyByAge;
    this.lifetimeGranularity = def.lifetimeGranularity;
    return this;
  }

  public Clone(): b2ParticleSystemDef {
    return new b2ParticleSystemDef().Copy(this);
  }
}

 class b2ParticleSystem {
  public m_paused: boolean = false;
  public m_timestamp: number = 0;
  public m_allParticleFlags: b2ParticleFlag = 0;
  public m_needsUpdateAllParticleFlags: boolean = false;
  public m_allGroupFlags: b2ParticleGroupFlag = 0;
  public m_needsUpdateAllGroupFlags: boolean = false;
  public m_hasForce: boolean = false;
  public m_iterationIndex: number = 0;
  public m_inverseDensity: number = 0.0;
  public m_particleDiameter: number = 0.0;
  public m_inverseDiameter: number = 0.0;
  public m_squaredDiameter: number = 0.0;
  public m_count: number = 0;
  public m_internalAllocatedCapacity: number = 0;
  /**
   * Allocator for b2ParticleHandle instances.
   */
  ///m_handleAllocator: any = null;
  /**
   * Maps particle indicies to handles.
   */
  public m_handleIndexBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleHandle > = new b2ParticleSystem_UserOverridableBuffer<b2ParticleHandle >();
  public m_flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag> = new b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>();
  public m_positionBuffer: b2ParticleSystem_UserOverridableBuffer<b2Vec2> = new b2ParticleSystem_UserOverridableBuffer<b2Vec2>();
  public m_velocityBuffer: b2ParticleSystem_UserOverridableBuffer<b2Vec2> = new b2ParticleSystem_UserOverridableBuffer<b2Vec2>();
  public m_forceBuffer: b2Vec2[] = [];
  /**
   * this.m_weightBuffer is populated in ComputeWeight and used in
   * ComputeDepth(), SolveStaticPressure() and SolvePressure().
   */
  public m_weightBuffer: number[] = [];
  /**
   * When any particles have the flag b2_staticPressureParticle,
   * this.m_staticPressureBuffer is first allocated and used in
   * SolveStaticPressure() and SolvePressure().  It will be
   * reallocated on subsequent CreateParticle() calls.
   */
  public m_staticPressureBuffer: number[] = [];
  /**
   * this.m_accumulationBuffer is used in many functions as a temporary
   * buffer for scalar values.
   */
  public m_accumulationBuffer: number[] = [];
  /**
   * When any particles have the flag b2_tensileParticle,
   * this.m_accumulation2Buffer is first allocated and used in
   * SolveTensile() as a temporary buffer for vector values.  It
   * will be reallocated on subsequent CreateParticle() calls.
   */
  public m_accumulation2Buffer: b2Vec2[] = [];
  /**
   * When any particle groups have the flag b2_solidParticleGroup,
   * this.m_depthBuffer is first allocated and populated in
   * ComputeDepth() and used in SolveSolid(). It will be
   * reallocated on subsequent CreateParticle() calls.
   */
  public m_depthBuffer: number[] = [];
  public m_colorBuffer: b2ParticleSystem_UserOverridableBufferb2Color = new b2ParticleSystem_UserOverridableBufferb2Color();
  public m_groupBuffer: Array<b2ParticleGroup > = [];
  public m_userDataBuffer: b2ParticleSystem_UserOverridableBuffer<any> = new b2ParticleSystem_UserOverridableBuffer();
  /**
   * Stuck particle detection parameters and record keeping
   */
  public m_stuckThreshold: number = 0;
  public m_lastBodyContactStepBuffer: b2ParticleSystem_UserOverridableBuffer<number> = new b2ParticleSystem_UserOverridableBuffer<number>();
  public m_bodyContactCountBuffer: b2ParticleSystem_UserOverridableBuffer<number> = new b2ParticleSystem_UserOverridableBuffer<number>();
  public m_consecutiveContactStepsBuffer: b2ParticleSystem_UserOverridableBuffer<number> = new b2ParticleSystem_UserOverridableBuffer<number>();
  public m_stuckParticleBuffer: b2GrowableBuffer<number> = new b2GrowableBuffer<number>(() => 0);
  public m_proxyBuffer: b2GrowableBuffer<b2ParticleSystem_Proxy> = new b2GrowableBuffer<b2ParticleSystem_Proxy>(() => new b2ParticleSystem_Proxy());
  public m_contactBuffer: b2GrowableBuffer<b2ParticleContact> = new b2GrowableBuffer<b2ParticleContact>(() => new b2ParticleContact());
  public m_bodyContactBuffer: b2GrowableBuffer<b2ParticleBodyContact> = new b2GrowableBuffer<b2ParticleBodyContact>(() => new b2ParticleBodyContact());
  public m_pairBuffer: b2GrowableBuffer<b2ParticlePair> = new b2GrowableBuffer<b2ParticlePair>(() => new b2ParticlePair());
  public m_triadBuffer: b2GrowableBuffer<b2ParticleTriad> = new b2GrowableBuffer<b2ParticleTriad>(() => new b2ParticleTriad());
  /**
   * Time each particle should be destroyed relative to the last
   * time this.m_timeElapsed was initialized.  Each unit of time
   * corresponds to b2ParticleSystemDef::lifetimeGranularity
   * seconds.
   */
  public m_expirationTimeBuffer: b2ParticleSystem_UserOverridableBuffer<number> = new b2ParticleSystem_UserOverridableBuffer<number>();
  /**
   * List of particle indices sorted by expiration time.
   */
  public m_indexByExpirationTimeBuffer: b2ParticleSystem_UserOverridableBuffer<number> = new b2ParticleSystem_UserOverridableBuffer<number>();
  /**
   * Time elapsed in 32:32 fixed point.  Each non-fractional unit
   * of time corresponds to
   * b2ParticleSystemDef::lifetimeGranularity seconds.
   */
  public m_timeElapsed: number = 0;
  /**
   * Whether the expiration time buffer has been modified and
   * needs to be resorted.
   */
  public m_expirationTimeBufferRequiresSorting: boolean = false;
  public m_groupCount: number = 0;
  public m_groupList: b2ParticleGroup  = null;
  public m_def: b2ParticleSystemDef = new b2ParticleSystemDef();
  public m_world: b2World;
  public m_prev: b2ParticleSystem  = null;
  public m_next: b2ParticleSystem  = null;

  public static  xTruncBits: number = 12;
  public static  yTruncBits: number = 12;
  public static  tagBits: number = 8 * 4; // 8u * sizeof(uint32);
  public static  yOffset: number = 1 << (b2ParticleSystem.yTruncBits - 1);
  public static  yShift: number = b2ParticleSystem.tagBits - b2ParticleSystem.yTruncBits;
  public static  xShift: number = b2ParticleSystem.tagBits - b2ParticleSystem.yTruncBits - b2ParticleSystem.xTruncBits;
  public static  xScale: number = 1 << b2ParticleSystem.xShift;
  public static  xOffset: number = b2ParticleSystem.xScale * (1 << (b2ParticleSystem.xTruncBits - 1));
  public static  yMask: number = ((1 << b2ParticleSystem.yTruncBits) - 1) << b2ParticleSystem.yShift;
  public static  xMask: number = ~b2ParticleSystem.yMask;

  public static computeTag(x: number, y: number): number {
    ///return ((uint32)(y + yOffset) << yShift) + (uint32)(xScale * x + xOffset);
    return ((((y + b2ParticleSystem.yOffset) >>> 0) << b2ParticleSystem.yShift) + ((b2ParticleSystem.xScale * x + b2ParticleSystem.xOffset) >>> 0)) >>> 0;
  }

  public static computeRelativeTag(tag: number, x: number, y: number): number {
    ///return tag + (y << yShift) + (x << xShift);
    return (tag + (y << b2ParticleSystem.yShift) + (x << b2ParticleSystem.xShift)) >>> 0;
  }

  constructor(def: b2ParticleSystemDef, world: b2World) {
    this.SetStrictContactCheck(def.strictContactCheck);
    this.SetDensity(def.density);
    this.SetGravityScale(def.gravityScale);
    this.SetRadius(def.radius);
    this.SetMaxParticleCount(def.maxCount);
    // DEBUG: b2Assert(def.lifetimeGranularity > 0.0);
    this.m_def = def.Clone();
    this.m_world = world;
    this.SetDestructionByAge(this.m_def.destroyByAge);
  }

  public Drop(): void {
    while (this.m_groupList) {
      this.DestroyParticleGroup(this.m_groupList);
    }

    this.FreeUserOverridableBuffer(this.m_handleIndexBuffer);
    this.FreeUserOverridableBuffer(this.m_flagsBuffer);
    this.FreeUserOverridableBuffer(this.m_lastBodyContactStepBuffer);
    this.FreeUserOverridableBuffer(this.m_bodyContactCountBuffer);
    this.FreeUserOverridableBuffer(this.m_consecutiveContactStepsBuffer);
    this.FreeUserOverridableBuffer(this.m_positionBuffer);
    this.FreeUserOverridableBuffer(this.m_velocityBuffer);
    this.FreeUserOverridableBuffer(this.m_colorBuffer);
    this.FreeUserOverridableBuffer(this.m_userDataBuffer);
    this.FreeUserOverridableBuffer(this.m_expirationTimeBuffer);
    this.FreeUserOverridableBuffer(this.m_indexByExpirationTimeBuffer);
    this.FreeBuffer(this.m_forceBuffer, this.m_internalAllocatedCapacity);
    this.FreeBuffer(this.m_weightBuffer, this.m_internalAllocatedCapacity);
    this.FreeBuffer(this.m_staticPressureBuffer, this.m_internalAllocatedCapacity);
    this.FreeBuffer(this.m_accumulationBuffer, this.m_internalAllocatedCapacity);
    this.FreeBuffer(this.m_accumulation2Buffer, this.m_internalAllocatedCapacity);
    this.FreeBuffer(this.m_depthBuffer, this.m_internalAllocatedCapacity);
    this.FreeBuffer(this.m_groupBuffer, this.m_internalAllocatedCapacity);
  }

  /**
   * Create a particle whose properties have been defined.
   *
   * No reference to the definition is retained.
   *
   * A simulation step must occur before it's possible to interact
   * with a newly created particle.  For example,
   * DestroyParticleInShape() will not destroy a particle until
   * b2World::Step() has been called.
   *
   * warning: This function is locked during callbacks.
   */
  public CreateParticle(def: b2IParticleDef): number {
    if (this.m_world.IsLocked()) { throw new Error(); }

    if (this.m_count >= this.m_internalAllocatedCapacity) {
      // Double the particle capacity.
      const capacity = this.m_count ? 2 * this.m_count : b2_minParticleSystemBufferCapacity;
      this.ReallocateInternalAllocatedBuffers(capacity);
    }
    if (this.m_count >= this.m_internalAllocatedCapacity) {
      // If the oldest particle should be destroyed...
      if (this.m_def.destroyByAge) {
        this.DestroyOldestParticle(0, false);
        // Need to destroy this particle *now* so that it's possible to
        // create a new particle.
        this.SolveZombie();
      } else {
        return b2_invalidParticleIndex;
      }
    }
    const index = this.m_count++;
    this.m_flagsBuffer.data[index] = 0;
    if (this.m_lastBodyContactStepBuffer.data) {
      this.m_lastBodyContactStepBuffer.data[index] = 0;
    }
    if (this.m_bodyContactCountBuffer.data) {
      this.m_bodyContactCountBuffer.data[index] = 0;
    }
    if (this.m_consecutiveContactStepsBuffer.data) {
      this.m_consecutiveContactStepsBuffer.data[index] = 0;
    }
    this.m_positionBuffer.data[index] = (this.m_positionBuffer.data[index] || new b2Vec2()).Copy(b2Maybe(def.position, b2Vec2.ZERO));
    this.m_velocityBuffer.data[index] = (this.m_velocityBuffer.data[index] || new b2Vec2()).Copy(b2Maybe(def.velocity, b2Vec2.ZERO));
    this.m_weightBuffer[index] = 0;
    this.m_forceBuffer[index] = (this.m_forceBuffer[index] || new b2Vec2()).SetZero();
    if (this.m_staticPressureBuffer) {
      this.m_staticPressureBuffer[index] = 0;
    }
    if (this.m_depthBuffer) {
      this.m_depthBuffer[index] = 0;
    }
    const color: b2Color = new b2Color().Copy(b2Maybe(def.color, b2Color.ZERO));
    if (this.m_colorBuffer.data || !color.IsZero()) {
      this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
      this.m_colorBuffer.data[index] = (this.m_colorBuffer.data[index] || new b2Color()).Copy(color);
    }
    if (this.m_userDataBuffer.data || def.userData) {
      this.m_userDataBuffer.data = this.RequestBuffer(this.m_userDataBuffer.data);
      this.m_userDataBuffer.data[index] = def.userData;
    }
    if (this.m_handleIndexBuffer.data) {
      this.m_handleIndexBuffer.data[index] = null;
    }
    ///Proxy& proxy = m_proxyBuffer.Append();
    const proxy = this.m_proxyBuffer.data[this.m_proxyBuffer.Append()];

    // If particle lifetimes are enabled or the lifetime is set in the particle
    // definition, initialize the lifetime.
    const lifetime = b2Maybe(def.lifetime, 0.0);
    const finiteLifetime = lifetime > 0.0;
    if (this.m_expirationTimeBuffer.data || finiteLifetime) {
      this.SetParticleLifetime(index, finiteLifetime ? lifetime :
        this.ExpirationTimeToLifetime(-this.GetQuantizedTimeElapsed()));
      // Add a reference to the newly added particle to the end of the
      // queue.
      this.m_indexByExpirationTimeBuffer.data[index] = index;
    }

    proxy.index = index;
    const group = b2Maybe(def.group, null);
    this.m_groupBuffer[index] = group;
    if (group) {
      if (group.m_firstIndex < group.m_lastIndex) {
        // Move particles in the group just before the new particle.
        this.RotateBuffer(group.m_firstIndex, group.m_lastIndex, index);
        // DEBUG: b2Assert(group.m_lastIndex === index);
        // Update the index range of the group to contain the new particle.
        group.m_lastIndex = index + 1;
      } else {
        // If the group is empty, reset the index range to contain only the
        // new particle.
        group.m_firstIndex = index;
        group.m_lastIndex = index + 1;
      }
    }
    this.SetParticleFlags(index, b2Maybe(def.flags, 0));
    return index;
  }

  /**
   * Retrieve a handle to the particle at the specified index.
   *
   * Please see #b2ParticleHandle for why you might want a handle.
   */
  public GetParticleHandleFromIndex(index: number): b2ParticleHandle {
    // DEBUG: b2Assert(index >= 0 && index < this.GetParticleCount() && index !== b2_invalidParticleIndex);
    this.m_handleIndexBuffer.data = this.RequestBuffer(this.m_handleIndexBuffer.data);
    let handle = this.m_handleIndexBuffer.data[index];
    if (handle) {
      return handle;
    }
    // Create a handle.
    ///handle = m_handleAllocator.Allocate();
    handle = new b2ParticleHandle();
    // DEBUG: b2Assert(handle !== null);
    handle.SetIndex(index);
    this.m_handleIndexBuffer.data[index] = handle;
    return handle;
  }

  /**
   * Destroy a particle.
   *
   * The particle is removed after the next simulation step (see
   * b2World::Step()).
   *
   * @param index Index of the particle to destroy.
   * @param callDestructionListener Whether to call the
   *      destruction listener just before the particle is
   *      destroyed.
   */
  public DestroyParticle(index: number, callDestructionListener: boolean = false): void {
    let flags = b2ParticleFlag.b2_zombieParticle;
    if (callDestructionListener) {
      flags |= b2ParticleFlag.b2_destructionListenerParticle;
    }
    this.SetParticleFlags(index, this.m_flagsBuffer.data[index] | flags);
  }

  /**
   * Destroy the Nth oldest particle in the system.
   *
   * The particle is removed after the next b2World::Step().
   *
   * @param index Index of the Nth oldest particle to
   *      destroy, 0 will destroy the oldest particle in the
   *      system, 1 will destroy the next oldest particle etc.
   * @param callDestructionListener Whether to call the
   *      destruction listener just before the particle is
   *      destroyed.
   */
  public DestroyOldestParticle(index: number, callDestructionListener: boolean = false): void {
    const particleCount = this.GetParticleCount();
    // DEBUG: b2Assert(index >= 0 && index < particleCount);
    // Make sure particle lifetime tracking is enabled.
    // DEBUG: b2Assert(this.m_indexByExpirationTimeBuffer.data !== null);
    // Destroy the oldest particle (preferring to destroy finite
    // lifetime particles first) to free a slot in the buffer.
    const oldestFiniteLifetimeParticle =
      this.m_indexByExpirationTimeBuffer.data[particleCount - (index + 1)];
    const oldestInfiniteLifetimeParticle =
      this.m_indexByExpirationTimeBuffer.data[index];
    this.DestroyParticle(
      this.m_expirationTimeBuffer.data[oldestFiniteLifetimeParticle] > 0.0 ?
      oldestFiniteLifetimeParticle : oldestInfiniteLifetimeParticle,
      callDestructionListener);
  }

  /**
   * Destroy particles inside a shape.
   *
   * warning: This function is locked during callbacks.
   *
   * In addition, this function immediately destroys particles in
   * the shape in constrast to DestroyParticle() which defers the
   * destruction until the next simulation step.
   *
   * @return Number of particles destroyed.
   * @param shape Shape which encloses particles
   *      that should be destroyed.
   * @param xf Transform applied to the shape.
   * @param callDestructionListener Whether to call the
   *      world b2DestructionListener for each particle
   *      destroyed.
   */
  public DestroyParticlesInShape(shape: b2Shape, xf: b2Transform, callDestructionListener: boolean = false): number {
    const s_aabb = b2ParticleSystem.DestroyParticlesInShape_s_aabb;
    if (this.m_world.IsLocked()) { throw new Error(); }

    const callback = new b2ParticleSystem_DestroyParticlesInShapeCallback(this, shape, xf, callDestructionListener);

    const aabb = s_aabb;
    shape.ComputeAABB(aabb, xf, 0);
    this.m_world.QueryAABB(callback, aabb);
    return callback.Destroyed();
  }
  public static  DestroyParticlesInShape_s_aabb = new b2AABB();

  /**
   * Create a particle group whose properties have been defined.
   *
   * No reference to the definition is retained.
   *
   * warning: This function is locked during callbacks.
   */
  public CreateParticleGroup(groupDef: b2IParticleGroupDef): b2ParticleGroup {
    const s_transform = b2ParticleSystem.CreateParticleGroup_s_transform;

    if (this.m_world.IsLocked()) { throw new Error(); }

    const transform = s_transform;
    transform.SetPositionAngle(b2Maybe(groupDef.position, b2Vec2.ZERO), b2Maybe(groupDef.angle, 0));
    const firstIndex = this.m_count;
    if (groupDef.shape) {
      this.CreateParticlesWithShapeForGroup(groupDef.shape, groupDef, transform);
    }
    if (groupDef.shapes) {
      this.CreateParticlesWithShapesForGroup(groupDef.shapes, b2Maybe(groupDef.shapeCount, groupDef.shapes.length), groupDef, transform);
    }
    if (groupDef.positionData) {
      const count = b2Maybe(groupDef.particleCount, groupDef.positionData.length);
      for (let i = 0; i < count; i++) {
        const p = groupDef.positionData[i];
        this.CreateParticleForGroup(groupDef, transform, p);
      }
    }
    const lastIndex = this.m_count;

    let group = new b2ParticleGroup(this);
    group.m_firstIndex = firstIndex;
    group.m_lastIndex = lastIndex;
    group.m_strength = b2Maybe(groupDef.strength, 1);
    group.m_userData = groupDef.userData;
    group.m_transform.Copy(transform);
    group.m_prev = null;
    group.m_next = this.m_groupList;
    if (this.m_groupList) {
      this.m_groupList.m_prev = group;
    }
    this.m_groupList = group;
    ++this.m_groupCount;
    for (let i = firstIndex; i < lastIndex; i++) {
      this.m_groupBuffer[i] = group;
    }
    this.SetGroupFlags(group, b2Maybe(groupDef.groupFlags, 0));

    // Create pairs and triads between particles in the group.
    const filter = new b2ParticleSystem_ConnectionFilter();
    this.UpdateContacts(true);
    this.UpdatePairsAndTriads(firstIndex, lastIndex, filter);

    if (groupDef.group) {
      this.JoinParticleGroups(groupDef.group, group);
      group = groupDef.group;
    }

    return group;
  }
  public static  CreateParticleGroup_s_transform = new b2Transform();

  /**
   * Join two particle groups.
   *
   * warning: This function is locked during callbacks.
   *
   * @param groupA the first group. Expands to encompass the second group.
   * @param groupB the second group. It is destroyed.
   */
  public JoinParticleGroups(groupA: b2ParticleGroup, groupB: b2ParticleGroup): void {
    if (this.m_world.IsLocked()) { throw new Error(); }

    // DEBUG: b2Assert(groupA !== groupB);
    this.RotateBuffer(groupB.m_firstIndex, groupB.m_lastIndex, this.m_count);
    // DEBUG: b2Assert(groupB.m_lastIndex === this.m_count);
    this.RotateBuffer(groupA.m_firstIndex, groupA.m_lastIndex, groupB.m_firstIndex);
    // DEBUG: b2Assert(groupA.m_lastIndex === groupB.m_firstIndex);

    // Create pairs and triads connecting groupA and groupB.
    const filter = new b2ParticleSystem_JoinParticleGroupsFilter(groupB.m_firstIndex);
    this.UpdateContacts(true);
    this.UpdatePairsAndTriads(groupA.m_firstIndex, groupB.m_lastIndex, filter);

    for (let i = groupB.m_firstIndex; i < groupB.m_lastIndex; i++) {
      this.m_groupBuffer[i] = groupA;
    }
    const groupFlags = groupA.m_groupFlags | groupB.m_groupFlags;
    this.SetGroupFlags(groupA, groupFlags);
    groupA.m_lastIndex = groupB.m_lastIndex;
    groupB.m_firstIndex = groupB.m_lastIndex;
    this.DestroyParticleGroup(groupB);
  }

  /**
   * Split particle group into multiple disconnected groups.
   *
   * warning: This function is locked during callbacks.
   *
   * @param group the group to be split.
   */
  public SplitParticleGroup(group: b2ParticleGroup): void {
    this.UpdateContacts(true);
    const particleCount = group.GetParticleCount();
    // We create several linked lists. Each list represents a set of connected particles.
    const nodeBuffer: b2ParticleSystem_ParticleListNode[] = b2MakeArray(particleCount, (index: number) => new b2ParticleSystem_ParticleListNode());
    b2ParticleSystem.InitializeParticleLists(group, nodeBuffer);
    this.MergeParticleListsInContact(group, nodeBuffer);
    const survivingList = b2ParticleSystem.FindLongestParticleList(group, nodeBuffer);
    this.MergeZombieParticleListNodes(group, nodeBuffer, survivingList);
    this.CreateParticleGroupsFromParticleList(group, nodeBuffer, survivingList);
    this.UpdatePairsAndTriadsWithParticleList(group, nodeBuffer);
  }

  /**
   * Get the world particle group list. With the returned group,
   * use b2ParticleGroup::GetNext to get the next group in the
   * world list.
   *
   * A null group indicates the end of the list.
   *
   * @return the head of the world particle group list.
   */
  public GetParticleGroupList(): b2ParticleGroup  {
    return this.m_groupList;
  }

  /**
   * Get the number of particle groups.
   */
  public GetParticleGroupCount(): number {
    return this.m_groupCount;
  }

  /**
   * Get the number of particles.
   */
  public GetParticleCount(): number {
    return this.m_count;
  }

  /**
   * Get the maximum number of particles.
   */
  public GetMaxParticleCount(): number {
    return this.m_def.maxCount;
  }

  /**
   * Set the maximum number of particles.
   *
   * A value of 0 means there is no maximum. The particle buffers
   * can continue to grow while b2World's block allocator still
   * has memory.
   *
   * Note: If you try to CreateParticle() with more than this
   * count, b2_invalidParticleIndex is returned unless
   * SetDestructionByAge() is used to enable the destruction of
   * the oldest particles in the system.
   */
  public SetMaxParticleCount(count: number): void {
    // DEBUG: b2Assert(this.m_count <= count);
    this.m_def.maxCount = count;
  }

  /**
   * Get all existing particle flags.
   */
  public GetAllParticleFlags(): b2ParticleFlag {
    return this.m_allParticleFlags;
  }

  /**
   * Get all existing particle group flags.
   */
  public GetAllGroupFlags(): b2ParticleGroupFlag {
    return this.m_allGroupFlags;
  }

  /**
   * Pause or unpause the particle system. When paused,
   * b2World::Step() skips over this particle system. All
   * b2ParticleSystem function calls still work.
   *
   * @param paused paused is true to pause, false to un-pause.
   */
  public SetPaused(paused: boolean): void {
    this.m_paused = paused;
  }

  /**
   * Initially, true, then, the last value passed into
   * SetPaused().
   *
   * @return true if the particle system is being updated in b2World::Step().
   */
  public GetPaused(): boolean {
    return this.m_paused;
  }

  /**
   * Change the particle density.
   *
   * Particle density affects the mass of the particles, which in
   * turn affects how the particles interact with b2Bodies. Note
   * that the density does not affect how the particles interact
   * with each other.
   */
  public SetDensity(density: number): void {
    this.m_def.density = density;
    this.m_inverseDensity = 1 / this.m_def.density;
  }

  /**
   * Get the particle density.
   */
  public GetDensity(): number {
    return this.m_def.density;
  }

  /**
   * Change the particle gravity scale. Adjusts the effect of the
   * global gravity vector on particles.
   */
  public SetGravityScale(gravityScale: number): void {
    this.m_def.gravityScale = gravityScale;
  }

  /**
   * Get the particle gravity scale.
   */
  public GetGravityScale(): number {
    return this.m_def.gravityScale;
  }

  /**
   * Damping is used to reduce the velocity of particles. The
   * damping parameter can be larger than 1.0f but the damping
   * effect becomes sensitive to the time step when the damping
   * parameter is large.
   */
  public SetDamping(damping: number): void {
    this.m_def.dampingStrength = damping;
  }

  /**
   * Get damping for particles
   */
  public GetDamping(): number {
    return this.m_def.dampingStrength;
  }

  /**
   * Change the number of iterations when calculating the static
   * pressure of particles. By default, 8 iterations. You can
   * reduce the number of iterations down to 1 in some situations,
   * but this may cause instabilities when many particles come
   * together. If you see particles popping away from each other
   * like popcorn, you may have to increase the number of
   * iterations.
   *
   * For a description of static pressure, see
   * http://en.wikipedia.org/wiki/Static_pressure#Static_pressure_in_fluid_dynamics
   */
  public SetStaticPressureIterations(iterations: number): void {
    this.m_def.staticPressureIterations = iterations;
  }

  /**
   * Get the number of iterations for static pressure of
   * particles.
   */
  public GetStaticPressureIterations(): number {
    return this.m_def.staticPressureIterations;
  }

  /**
   * Change the particle radius.
   *
   * You should set this only once, on world start.
   * If you change the radius during execution, existing particles
   * may explode, shrink, or behave unexpectedly.
   */
  public SetRadius(radius: number): void {
    this.m_particleDiameter = 2 * radius;
    this.m_squaredDiameter = this.m_particleDiameter * this.m_particleDiameter;
    this.m_inverseDiameter = 1 / this.m_particleDiameter;
  }

  /**
   * Get the particle radius.
   */
  public GetRadius(): number {
    return this.m_particleDiameter / 2;
  }

  /**
   * Get the position of each particle
   *
   * Array is length GetParticleCount()
   *
   * @return the pointer to the head of the particle positions array.
   */
  public GetPositionBuffer(): b2Vec2[] {
    return this.m_positionBuffer.data;
  }

  /**
   * Get the velocity of each particle
   *
   * Array is length GetParticleCount()
   *
   * @return the pointer to the head of the particle velocities array.
   */
  public GetVelocityBuffer(): b2Vec2[] {
    return this.m_velocityBuffer.data;
  }

  /**
   * Get the color of each particle
   *
   * Array is length GetParticleCount()
   *
   * @return the pointer to the head of the particle colors array.
   */
  public GetColorBuffer(): b2Color[] {
    this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
    return this.m_colorBuffer.data;
  }

  /**
   * Get the particle-group of each particle.
   *
   * Array is length GetParticleCount()
   *
   * @return the pointer to the head of the particle group array.
   */
  public GetGroupBuffer(): Array<b2ParticleGroup > {
    return this.m_groupBuffer;
  }

  /**
   * Get the weight of each particle
   *
   * Array is length GetParticleCount()
   *
   * @return the pointer to the head of the particle positions array.
   */
  public GetWeightBuffer(): number[] {
    return this.m_weightBuffer;
  }

  /**
   * Get the user-specified data of each particle.
   *
   * Array is length GetParticleCount()
   *
   * @return the pointer to the head of the particle user-data array.
   */
  public GetUserDataBuffer<T>(): T[] {
    this.m_userDataBuffer.data = this.RequestBuffer(this.m_userDataBuffer.data);
    return this.m_userDataBuffer.data;
  }

  /**
   * Get the flags for each particle. See the b2ParticleFlag enum.
   *
   * Array is length GetParticleCount()
   *
   * @return the pointer to the head of the particle-flags array.
   */
  public GetFlagsBuffer(): b2ParticleFlag[] {
    return this.m_flagsBuffer.data;
  }

  /**
   * Set flags for a particle. See the b2ParticleFlag enum.
   */
  public SetParticleFlags(index: number, newFlags: b2ParticleFlag): void {
    const oldFlags = this.m_flagsBuffer.data[index];
    if (oldFlags & ~newFlags) {
      // If any flags might be removed
      this.m_needsUpdateAllParticleFlags = true;
    }
    if (~this.m_allParticleFlags & newFlags) {
      // If any flags were added
      if (newFlags & b2ParticleFlag.b2_tensileParticle) {
        this.m_accumulation2Buffer = this.RequestBuffer(this.m_accumulation2Buffer);
      }
      if (newFlags & b2ParticleFlag.b2_colorMixingParticle) {
        this.m_colorBuffer.data = this.RequestBuffer(this.m_colorBuffer.data);
      }
      this.m_allParticleFlags |= newFlags;
    }
    this.m_flagsBuffer.data[index] = newFlags;
  }

  /**
   * Get flags for a particle. See the b2ParticleFlag enum.
   */
  public GetParticleFlags(index: number): b2ParticleFlag {
    return this.m_flagsBuffer.data[index];
  }

  /**
   * Set an external buffer for particle data.
   *
   * Normally, the b2World's block allocator is used for particle
   * data. However, sometimes you may have an OpenGL or Java
   * buffer for particle data. To avoid data duplication, you may
   * supply this external buffer.
   *
   * Note that, when b2World's block allocator is used, the
   * particle data buffers can grow as required. However, when
   * external buffers are used, the maximum number of particles is
   * clamped to the size of the smallest external buffer.
   *
   * @param buffer a pointer to a block of memory.
   * @param capacity the number of values in the block.
   */
  public SetFlagsBuffer(buffer: b2ParticleFlag[]): void {
    this.SetUserOverridableBuffer(this.m_flagsBuffer, buffer);
  }

  public SetPositionBuffer(buffer: b2Vec2[] | Float32Array): void {
    if (buffer instanceof Float32Array) {
      if (buffer.length % 2 !== 0) { throw new Error(); }
      const count: number = buffer.length / 2;
      const array: b2TypedVec2[] = new Array(count);
      for (let i = 0; i < count; ++i) {
        array[i] = new b2TypedVec2(buffer.subarray(i * 2, i * 2 + 2));
      }
      buffer = array;
    }
    this.SetUserOverridableBuffer(this.m_positionBuffer, buffer);
  }

  public SetVelocityBuffer(buffer: b2TypedVec2[] | Float32Array): void {
    if (buffer instanceof Float32Array) {
      if (buffer.length % 2 !== 0) { throw new Error(); }
      const count: number = buffer.length / 2;
      const array: b2TypedVec2[] = new Array(count);
      for (let i = 0; i < count; ++i) {
        array[i] = new b2TypedVec2(buffer.subarray(i * 2, i * 2 + 2));
      }
      buffer = array;
    }
    this.SetUserOverridableBuffer(this.m_velocityBuffer, buffer);
  }

  public SetColorBuffer(buffer: b2Color[] | Float32Array): void {
    if (buffer instanceof Float32Array) {
      if (buffer.length % 4 !== 0) { throw new Error(); }
      const count: number = buffer.length / 4;
      const array: b2Color[] = new Array(count);
      for (let i = 0; i < count; ++i) {
        array[i] = new b2TypedColor(buffer.subarray(i * 4, i * 4 + 4));
      }
      buffer = array;
    }
    this.SetUserOverridableBuffer(this.m_colorBuffer, buffer);
  }

  public SetUserDataBuffer<T>(buffer: T[]): void {
    this.SetUserOverridableBuffer(this.m_userDataBuffer, buffer);
  }

  /**
   * Get contacts between particles
   * Contact data can be used for many reasons, for example to
   * trigger rendering or audio effects.
   */
  public GetContacts(): b2ParticleContact[] {
    return this.m_contactBuffer.data;
  }

  public GetContactCount(): number {
    return this.m_contactBuffer.count;
  }

  /**
   * Get contacts between particles and bodies
   *
   * Contact data can be used for many reasons, for example to
   * trigger rendering or audio effects.
   */
  public GetBodyContacts(): b2ParticleBodyContact[] {
    return this.m_bodyContactBuffer.data;
  }

  public GetBodyContactCount(): number {
    return this.m_bodyContactBuffer.count;
  }

  /**
   * Get array of particle pairs. The particles in a pair:
   *   (1) are contacting,
   *   (2) are in the same particle group,
   *   (3) are part of a rigid particle group, or are spring, elastic,
   *       or wall particles.
   *   (4) have at least one particle that is a spring or barrier
   *       particle (i.e. one of the types in k_pairFlags),
   *   (5) have at least one particle that returns true for
   *       ConnectionFilter::IsNecessary,
   *   (6) are not zombie particles.
   *
   * Essentially, this is an array of spring or barrier particles
   * that are interacting. The array is sorted by b2ParticlePair's
   * indexA, and then indexB. There are no duplicate entries.
   */
  public GetPairs(): b2ParticlePair[] {
    return this.m_pairBuffer.data;
  }

  public GetPairCount(): number {
    return this.m_pairBuffer.count;
  }

  /**
   * Get array of particle triads. The particles in a triad:
   *   (1) are in the same particle group,
   *   (2) are in a Voronoi triangle together,
   *   (3) are within b2_maxTriadDistance particle diameters of each
   *       other,
   *   (4) return true for ConnectionFilter::ShouldCreateTriad
   *   (5) have at least one particle of type elastic (i.e. one of the
   *       types in k_triadFlags),
   *   (6) are part of a rigid particle group, or are spring, elastic,
   *       or wall particles.
   *   (7) are not zombie particles.
   *
   * Essentially, this is an array of elastic particles that are
   * interacting. The array is sorted by b2ParticleTriad's indexA,
   * then indexB, then indexC. There are no duplicate entries.
   */
  public GetTriads(): b2ParticleTriad[] {
    return this.m_triadBuffer.data;
  }

  public GetTriadCount(): number {
    return this.m_triadBuffer.count;
  }

  /**
   * Set an optional threshold for the maximum number of
   * consecutive particle iterations that a particle may contact
   * multiple bodies before it is considered a candidate for being
   * "stuck". Setting to zero or less disables.
   */
  public SetStuckThreshold(steps: number): void {
    this.m_stuckThreshold = steps;

    if (steps > 0) {
      this.m_lastBodyContactStepBuffer.data = this.RequestBuffer(this.m_lastBodyContactStepBuffer.data);
      this.m_bodyContactCountBuffer.data = this.RequestBuffer(this.m_bodyContactCountBuffer.data);
      this.m_consecutiveContactStepsBuffer.data = this.RequestBuffer(this.m_consecutiveContactStepsBuffer.data);
    }
  }

  /**
   * Get potentially stuck particles from the last step; the user
   * must decide if they are stuck or not, and if so, delete or
   * move them
   */
  public GetStuckCandidates(): number[] {
    ///return m_stuckParticleBuffer.Data();
    return this.m_stuckParticleBuffer.Data();
  }

  /**
   * Get the number of stuck particle candidates from the last
   * step.
   */
  public GetStuckCandidateCount(): number {
    ///return m_stuckParticleBuffer.GetCount();
    return this.m_stuckParticleBuffer.GetCount();
  }

  /**
   * Compute the kinetic energy that can be lost by damping force
   */
  public ComputeCollisionEnergy(): number {
    const s_v = b2ParticleSystem.ComputeCollisionEnergy_s_v;
    const vel_data = this.m_velocityBuffer.data;
    let sum_v2 = 0;
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      const a = contact.indexA;
      const b = contact.indexB;
      const n = contact.normal;
      ///b2Vec2 v = m_velocityBuffer.data[b] - m_velocityBuffer.data[a];
      const v = b2Vec2.SubVV(vel_data[b], vel_data[a], s_v);
      const vn = b2Vec2.DotVV(v, n);
      if (vn < 0) {
        sum_v2 += vn * vn;
      }
    }
    return 0.5 * this.GetParticleMass() * sum_v2;
  }
  public static  ComputeCollisionEnergy_s_v = new b2Vec2();

  /**
   * Set strict Particle/Body contact check.
   *
   * This is an option that will help ensure correct behavior if
   * there are corners in the world model where Particle/Body
   * contact is ambiguous. This option scales at n*log(n) of the
   * number of Particle/Body contacts, so it is best to only
   * enable if it is necessary for your geometry. Enable if you
   * see strange particle behavior around b2Body intersections.
   */
  public SetStrictContactCheck(enabled: boolean): void {
    this.m_def.strictContactCheck = enabled;
  }

  /**
   * Get the status of the strict contact check.
   */
  public GetStrictContactCheck(): boolean {
    return this.m_def.strictContactCheck;
  }

  /**
   * Set the lifetime (in seconds) of a particle relative to the
   * current time.  A lifetime of less than or equal to 0.0f
   * results in the particle living forever until it's manually
   * destroyed by the application.
   */
  public SetParticleLifetime(index: number, lifetime: number): void {
    // DEBUG: b2Assert(this.ValidateParticleIndex(index));
    const initializeExpirationTimes = this.m_indexByExpirationTimeBuffer.data === null;
    this.m_expirationTimeBuffer.data = this.RequestBuffer(this.m_expirationTimeBuffer.data);
    this.m_indexByExpirationTimeBuffer.data = this.RequestBuffer(this.m_indexByExpirationTimeBuffer.data);

    // Initialize the inverse mapping buffer.
    if (initializeExpirationTimes) {
      const particleCount = this.GetParticleCount();
      for (let i = 0; i < particleCount; ++i) {
        this.m_indexByExpirationTimeBuffer.data[i] = i;
      }
    }
    ///const int32 quantizedLifetime = (int32)(lifetime / m_def.lifetimeGranularity);
    const quantizedLifetime = lifetime / this.m_def.lifetimeGranularity;
    // Use a negative lifetime so that it's possible to track which
    // of the infinite lifetime particles are older.
    const newExpirationTime = quantizedLifetime > 0.0 ? this.GetQuantizedTimeElapsed() + quantizedLifetime : quantizedLifetime;
    if (newExpirationTime !== this.m_expirationTimeBuffer.data[index]) {
      this.m_expirationTimeBuffer.data[index] = newExpirationTime;
      this.m_expirationTimeBufferRequiresSorting = true;
    }
  }

  /**
   * Get the lifetime (in seconds) of a particle relative to the
   * current time.  A value > 0.0f is returned if the particle is
   * scheduled to be destroyed in the future, values <= 0.0f
   * indicate the particle has an infinite lifetime.
   */
  public GetParticleLifetime(index: number): number {
    // DEBUG: b2Assert(this.ValidateParticleIndex(index));
    return this.ExpirationTimeToLifetime(this.GetExpirationTimeBuffer()[index]);
  }

  /**
   * Enable / disable destruction of particles in CreateParticle()
   * when no more particles can be created due to a prior call to
   * SetMaxParticleCount().  When this is enabled, the oldest
   * particle is destroyed in CreateParticle() favoring the
   * destruction of particles with a finite lifetime over
   * particles with infinite lifetimes. This feature is enabled by
   * default when particle lifetimes are tracked.  Explicitly
   * enabling this feature using this function enables particle
   * lifetime tracking.
   */
  public SetDestructionByAge(enable: boolean): void {
    if (enable) {
      this.GetExpirationTimeBuffer();
    }
    this.m_def.destroyByAge = enable;
  }

  /**
   * Get whether the oldest particle will be destroyed in
   * CreateParticle() when the maximum number of particles are
   * present in the system.
   */
  public GetDestructionByAge(): boolean {
    return this.m_def.destroyByAge;
  }

  /**
   * Get the array of particle expiration times indexed by
   * particle index.
   *
   * GetParticleCount() items are in the returned array.
   */
  public GetExpirationTimeBuffer(): number[] {
    this.m_expirationTimeBuffer.data = this.RequestBuffer(this.m_expirationTimeBuffer.data);
    return this.m_expirationTimeBuffer.data;
  }

  /**
   * Convert a expiration time value in returned by
   * GetExpirationTimeBuffer() to a time in seconds relative to
   * the current simulation time.
   */
  public ExpirationTimeToLifetime(expirationTime: number): number {
    return (expirationTime > 0 ?
      expirationTime - this.GetQuantizedTimeElapsed() :
      expirationTime) * this.m_def.lifetimeGranularity;
  }

  /**
   * Get the array of particle indices ordered by reverse
   * lifetime. The oldest particle indexes are at the end of the
   * array with the newest at the start.  Particles with infinite
   * lifetimes (i.e expiration times less than or equal to 0) are
   * placed at the start of the array.
   * ExpirationTimeToLifetime(GetExpirationTimeBuffer()[index]) is
   * equivalent to GetParticleLifetime(index).
   *
   * GetParticleCount() items are in the returned array.
   */
  public GetIndexByExpirationTimeBuffer(): number[] {
    // If particles are present, initialize / reinitialize the lifetime buffer.
    if (this.GetParticleCount()) {
      this.SetParticleLifetime(0, this.GetParticleLifetime(0));
    } else {
      this.m_indexByExpirationTimeBuffer.data = this.RequestBuffer(this.m_indexByExpirationTimeBuffer.data);
    }
    return this.m_indexByExpirationTimeBuffer.data;
  }

  /**
   * Apply an impulse to one particle. This immediately modifies
   * the velocity. Similar to b2Body::ApplyLinearImpulse.
   *
   * @param index the particle that will be modified.
   * @param impulse impulse the world impulse vector, usually in N-seconds or kg-m/s.
   */
  public ParticleApplyLinearImpulse(index: number, impulse: XY): void {
    this.ApplyLinearImpulse(index, index + 1, impulse);
  }

  /**
   * Apply an impulse to all particles between 'firstIndex' and
   * 'lastIndex'. This immediately modifies the velocity. Note
   * that the impulse is applied to the total mass of all
   * particles. So, calling ParticleApplyLinearImpulse(0, impulse)
   * and ParticleApplyLinearImpulse(1, impulse) will impart twice
   * as much velocity as calling just ApplyLinearImpulse(0, 1,
   * impulse).
   *
   * @param firstIndex the first particle to be modified.
   * @param lastIndex the last particle to be modified.
   * @param impulse the world impulse vector, usually in N-seconds or kg-m/s.
   */
  public ApplyLinearImpulse(firstIndex: number, lastIndex: number, impulse: XY): void {
    const vel_data = this.m_velocityBuffer.data;
    const numParticles = (lastIndex - firstIndex);
    const totalMass = numParticles * this.GetParticleMass();
    ///const b2Vec2 velocityDelta = impulse / totalMass;
    const velocityDelta = new b2Vec2().Copy(impulse).SelfMul(1 / totalMass);
    for (let i = firstIndex; i < lastIndex; i++) {
      ///m_velocityBuffer.data[i] += velocityDelta;
      vel_data[i].SelfAdd(velocityDelta);
    }
  }

  public static IsSignificantForce(force: XY): boolean {
    return force.x !== 0 || force.y !== 0;
  }

  /**
   * Apply a force to the center of a particle.
   *
   * @param index the particle that will be modified.
   * @param force the world force vector, usually in Newtons (N).
   */
  public ParticleApplyForce(index: number, force: XY): void {
    if (b2ParticleSystem.IsSignificantForce(force) &&
      this.ForceCanBeApplied(this.m_flagsBuffer.data[index])) {
      this.PrepareForceBuffer();
      ///m_forceBuffer[index] += force;
      this.m_forceBuffer[index].SelfAdd(force);
    }
  }

  /**
   * Distribute a force across several particles. The particles
   * must not be wall particles. Note that the force is
   * distributed across all the particles, so calling this
   * function for indices 0..N is not the same as calling
   * ParticleApplyForce(i, force) for i in 0..N.
   *
   * @param firstIndex the first particle to be modified.
   * @param lastIndex the last particle to be modified.
   * @param force the world force vector, usually in Newtons (N).
   */
  public ApplyForce(firstIndex: number, lastIndex: number, force: XY): void {
    // Ensure we're not trying to apply force to particles that can't move,
    // such as wall particles.
    // DEBUG: let flags = 0;
    // DEBUG: for (let i = firstIndex; i < lastIndex; i++) {
    // DEBUG:   flags |= this.m_flagsBuffer.data[i];
    // DEBUG: }
    // DEBUG: b2Assert(this.ForceCanBeApplied(flags));

    // Early out if force does nothing (optimization).
    ///const b2Vec2 distributedForce = force / (float32)(lastIndex - firstIndex);
    const distributedForce =  new b2Vec2().Copy(force).SelfMul(1 / (lastIndex - firstIndex));
    if (b2ParticleSystem.IsSignificantForce(distributedForce)) {
      this.PrepareForceBuffer();

      // Distribute the force over all the particles.
      for (let i = firstIndex; i < lastIndex; i++) {
        ///m_forceBuffer[i] += distributedForce;
        this.m_forceBuffer[i].SelfAdd(distributedForce);
      }
    }
  }

  /**
   * Get the next particle-system in the world's particle-system
   * list.
   */
  public GetNext(): b2ParticleSystem  {
    return this.m_next;
  }

  /**
   * Query the particle system for all particles that potentially
   * overlap the provided AABB.
   * b2QueryCallback::ShouldQueryParticleSystem is ignored.
   *
   * @param callback a user implemented callback class.
   * @param aabb the query box.
   */
  public QueryAABB(callback: b2QueryCallback, aabb: b2AABB): void {
    if (this.m_proxyBuffer.count === 0) {
      return;
    }
    const beginProxy = 0;
    const endProxy = this.m_proxyBuffer.count;
    const firstProxy = std_lower_bound(this.m_proxyBuffer.data, beginProxy, endProxy,
      b2ParticleSystem.computeTag(
        this.m_inverseDiameter * aabb.lowerBound.x,
        this.m_inverseDiameter * aabb.lowerBound.y),
      b2ParticleSystem_Proxy.CompareProxyTag);
    const lastProxy = std_upper_bound(this.m_proxyBuffer.data, firstProxy, endProxy,
      b2ParticleSystem.computeTag(
        this.m_inverseDiameter * aabb.upperBound.x,
        this.m_inverseDiameter * aabb.upperBound.y),
      b2ParticleSystem_Proxy.CompareTagProxy);
    const pos_data = this.m_positionBuffer.data;
    for (let k = firstProxy; k < lastProxy; ++k) {
      const proxy = this.m_proxyBuffer.data[k];
      const i = proxy.index;
      const p = pos_data[i];
      if (aabb.lowerBound.x < p.x && p.x < aabb.upperBound.x &&
        aabb.lowerBound.y < p.y && p.y < aabb.upperBound.y) {
        if (!callback.ReportParticle(this, i)) {
          break;
        }
      }
    }
  }

  /**
   * Query the particle system for all particles that potentially
   * overlap the provided shape's AABB. Calls QueryAABB
   * internally. b2QueryCallback::ShouldQueryParticleSystem is
   * ignored.
   *
   * @param callback a user implemented callback class.
   * @param shape the query shape
   * @param xf the transform of the AABB
   * @param childIndex
   */
  public QueryShapeAABB(callback: b2QueryCallback, shape: b2Shape, xf: b2Transform, childIndex: number = 0): void {
    const s_aabb = b2ParticleSystem.QueryShapeAABB_s_aabb;
    const aabb = s_aabb;
    shape.ComputeAABB(aabb, xf, childIndex);
    this.QueryAABB(callback, aabb);
  }
  public static  QueryShapeAABB_s_aabb = new b2AABB();

  public QueryPointAABB(callback: b2QueryCallback, point: XY, slop: number = b2_linearSlop): void {
    const s_aabb = b2ParticleSystem.QueryPointAABB_s_aabb;
    const aabb = s_aabb;
    aabb.lowerBound.Set(point.x - slop, point.y - slop);
    aabb.upperBound.Set(point.x + slop, point.y + slop);
    this.QueryAABB(callback, aabb);
  }
  public static  QueryPointAABB_s_aabb = new b2AABB();

  /**
   * Ray-cast the particle system for all particles in the path of
   * the ray. Your callback controls whether you get the closest
   * point, any point, or n-points. The ray-cast ignores particles
   * that contain the starting point.
   * b2RayCastCallback::ShouldQueryParticleSystem is ignored.
   *
   * @param callback a user implemented callback class.
   * @param point1 the ray starting point
   * @param point2 the ray ending point
   */
  public RayCast(callback: b2RayCastCallback, point1: XY, point2: XY): void {
    const s_aabb = b2ParticleSystem.RayCast_s_aabb;
    const s_p = b2ParticleSystem.RayCast_s_p;
    const s_v = b2ParticleSystem.RayCast_s_v;
    const s_n = b2ParticleSystem.RayCast_s_n;
    const s_point = b2ParticleSystem.RayCast_s_point;
    if (this.m_proxyBuffer.count === 0) {
      return;
    }
    const pos_data = this.m_positionBuffer.data;
    const aabb = s_aabb;
    b2Vec2.MinV(point1, point2, aabb.lowerBound);
    b2Vec2.MaxV(point1, point2, aabb.upperBound);
    let fraction = 1;
    // solving the following equation:
    // ((1-t)*point1+t*point2-position)^2=diameter^2
    // where t is a potential fraction
    ///b2Vec2 v = point2 - point1;
    const v = b2Vec2.SubVV(point2, point1, s_v);
    const v2 = b2Vec2.DotVV(v, v);
    const enumerator = this.GetInsideBoundsEnumerator(aabb);

    let i: number;
    while ((i = enumerator.GetNext()) >= 0) {
      ///b2Vec2 p = point1 - m_positionBuffer.data[i];
      const p = b2Vec2.SubVV(point1, pos_data[i], s_p);
      const pv = b2Vec2.DotVV(p, v);
      const p2 = b2Vec2.DotVV(p, p);
      const determinant = pv * pv - v2 * (p2 - this.m_squaredDiameter);
      if (determinant >= 0) {
        const sqrtDeterminant = b2Sqrt(determinant);
        // find a solution between 0 and fraction
        let t = (-pv - sqrtDeterminant) / v2;
        if (t > fraction) {
          continue;
        }
        if (t < 0) {
          t = (-pv + sqrtDeterminant) / v2;
          if (t < 0 || t > fraction) {
            continue;
          }
        }
        ///b2Vec2 n = p + t * v;
        const n = b2Vec2.AddVMulSV(p, t, v, s_n);
        n.Normalize();
        ///float32 f = callback.ReportParticle(this, i, point1 + t * v, n, t);
        const f = callback.ReportParticle(this, i, b2Vec2.AddVMulSV(point1, t, v, s_point), n, t);
        fraction = b2Min(fraction, f);
        if (fraction <= 0) {
          break;
        }
      }
    }
  }
  public static  RayCast_s_aabb = new b2AABB();
  public static  RayCast_s_p = new b2Vec2();
  public static  RayCast_s_v = new b2Vec2();
  public static  RayCast_s_n = new b2Vec2();
  public static  RayCast_s_point = new b2Vec2();

  /**
   * Compute the axis-aligned bounding box for all particles
   * contained within this particle system.
   * @param aabb Returns the axis-aligned bounding box of the system.
   */
  public ComputeAABB(aabb: b2AABB): void {
    const particleCount = this.GetParticleCount();
    // DEBUG: b2Assert(aabb !== null);
    aabb.lowerBound.x = +b2_maxFloat;
    aabb.lowerBound.y = +b2_maxFloat;
    aabb.upperBound.x = -b2_maxFloat;
    aabb.upperBound.y = -b2_maxFloat;

    const pos_data = this.m_positionBuffer.data;
    for (let i = 0; i < particleCount; i++) {
      const p = pos_data[i];
      b2Vec2.MinV(aabb.lowerBound, p, aabb.lowerBound);
      b2Vec2.MaxV(aabb.upperBound, p, aabb.upperBound);
    }
    aabb.lowerBound.x -= this.m_particleDiameter;
    aabb.lowerBound.y -= this.m_particleDiameter;
    aabb.upperBound.x += this.m_particleDiameter;
    aabb.upperBound.y += this.m_particleDiameter;
  }

  /**
   * All particle types that require creating pairs
   */
  public static  k_pairFlags: number = b2ParticleFlag.b2_springParticle;

  /**
   * All particle types that require creating triads
   */
  public static  k_triadFlags = b2ParticleFlag.b2_elasticParticle;

  /**
   * All particle types that do not produce dynamic pressure
   */
  public static  k_noPressureFlags = b2ParticleFlag.b2_powderParticle | b2ParticleFlag.b2_tensileParticle;

  /**
   * All particle types that apply extra damping force with bodies
   */
  public static  k_extraDampingFlags = b2ParticleFlag.b2_staticPressureParticle;

  public static  k_barrierWallFlags = b2ParticleFlag.b2_barrierParticle | b2ParticleFlag.b2_wallParticle;

  public FreeBuffer<T>(b: T[] , capacity: number): void {
    if (b === null) {
      return;
    }
    b.length = 0;
  }

  public FreeUserOverridableBuffer<T>(b: b2ParticleSystem_UserOverridableBuffer<T>): void {
    if (b.userSuppliedCapacity === 0) {
      this.FreeBuffer(b.data, this.m_internalAllocatedCapacity);
    }
  }

  /**
   * Reallocate a buffer
   */
  public ReallocateBuffer3<T>(oldBuffer: T[] , oldCapacity: number, newCapacity: number): T[] {
    // b2Assert(newCapacity > oldCapacity);
    if (newCapacity <= oldCapacity) { throw new Error(); }
    const newBuffer = (oldBuffer) ? oldBuffer.slice() : [];
    newBuffer.length = newCapacity;
    return newBuffer;
  }

  /**
   * Reallocate a buffer
   */
  public ReallocateBuffer5<T>(buffer: T[] , userSuppliedCapacity: number, oldCapacity: number, newCapacity: number, deferred: boolean): T[] {
    // b2Assert(newCapacity > oldCapacity);
    if (newCapacity <= oldCapacity) { throw new Error(); }
    // A 'deferred' buffer is reallocated only if it is not NULL.
    // If 'userSuppliedCapacity' is not zero, buffer is user supplied and must
    // be kept.
    // b2Assert(!userSuppliedCapacity || newCapacity <= userSuppliedCapacity);
    if (!(!userSuppliedCapacity || newCapacity <= userSuppliedCapacity)) { throw new Error(); }
    if ((!deferred || buffer) && !userSuppliedCapacity) {
      buffer = this.ReallocateBuffer3(buffer, oldCapacity, newCapacity);
    }
    return buffer as any; // TODO: fix this
  }

  /**
   * Reallocate a buffer
   */
  public ReallocateBuffer4<T>(buffer: b2ParticleSystem_UserOverridableBuffer<any>, oldCapacity: number, newCapacity: number, deferred: boolean): T[] {
    // DEBUG: b2Assert(newCapacity > oldCapacity);
    return this.ReallocateBuffer5(buffer.data, buffer.userSuppliedCapacity, oldCapacity, newCapacity, deferred);
  }

  public RequestBuffer<T>(buffer: T[] ): T[] {
    if (!buffer) {
      if (this.m_internalAllocatedCapacity === 0) {
        this.ReallocateInternalAllocatedBuffers(b2_minParticleSystemBufferCapacity);
      }

      buffer = [];
      buffer.length = this.m_internalAllocatedCapacity;
    }
    return buffer;
  }

  /**
   * Reallocate the handle / index map and schedule the allocation
   * of a new pool for handle allocation.
   */
  public ReallocateHandleBuffers(newCapacity: number): void {
    // DEBUG: b2Assert(newCapacity > this.m_internalAllocatedCapacity);
    // Reallocate a new handle / index map buffer, copying old handle pointers
    // is fine since they're kept around.
    this.m_handleIndexBuffer.data = this.ReallocateBuffer4(this.m_handleIndexBuffer, this.m_internalAllocatedCapacity, newCapacity, true);
    // Set the size of the next handle allocation.
    ///this.m_handleAllocator.SetItemsPerSlab(newCapacity - this.m_internalAllocatedCapacity);
  }

  public ReallocateInternalAllocatedBuffers(capacity: number): void {
    function LimitCapacity(capacity: number, maxCount: number): number {
      return maxCount && capacity > maxCount ? maxCount : capacity;
    }

    // Don't increase capacity beyond the smallest user-supplied buffer size.
    capacity = LimitCapacity(capacity, this.m_def.maxCount);
    capacity = LimitCapacity(capacity, this.m_flagsBuffer.userSuppliedCapacity);
    capacity = LimitCapacity(capacity, this.m_positionBuffer.userSuppliedCapacity);
    capacity = LimitCapacity(capacity, this.m_velocityBuffer.userSuppliedCapacity);
    capacity = LimitCapacity(capacity, this.m_colorBuffer.userSuppliedCapacity);
    capacity = LimitCapacity(capacity, this.m_userDataBuffer.userSuppliedCapacity);
    if (this.m_internalAllocatedCapacity < capacity) {
      this.ReallocateHandleBuffers(capacity);
      this.m_flagsBuffer.data = this.ReallocateBuffer4(this.m_flagsBuffer, this.m_internalAllocatedCapacity, capacity, false);

      // Conditionally defer these as they are optional if the feature is
      // not enabled.
      const stuck = this.m_stuckThreshold > 0;
      this.m_lastBodyContactStepBuffer.data = this.ReallocateBuffer4(this.m_lastBodyContactStepBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
      this.m_bodyContactCountBuffer.data = this.ReallocateBuffer4(this.m_bodyContactCountBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
      this.m_consecutiveContactStepsBuffer.data = this.ReallocateBuffer4(this.m_consecutiveContactStepsBuffer, this.m_internalAllocatedCapacity, capacity, stuck);
      this.m_positionBuffer.data = this.ReallocateBuffer4(this.m_positionBuffer, this.m_internalAllocatedCapacity, capacity, false);
      this.m_velocityBuffer.data = this.ReallocateBuffer4(this.m_velocityBuffer, this.m_internalAllocatedCapacity, capacity, false);
      this.m_forceBuffer = this.ReallocateBuffer5(this.m_forceBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
      this.m_weightBuffer = this.ReallocateBuffer5(this.m_weightBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
      this.m_staticPressureBuffer = this.ReallocateBuffer5(this.m_staticPressureBuffer, 0, this.m_internalAllocatedCapacity, capacity, true);
      this.m_accumulationBuffer = this.ReallocateBuffer5(this.m_accumulationBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
      this.m_accumulation2Buffer = this.ReallocateBuffer5(this.m_accumulation2Buffer, 0, this.m_internalAllocatedCapacity, capacity, true);
      this.m_depthBuffer = this.ReallocateBuffer5(this.m_depthBuffer, 0, this.m_internalAllocatedCapacity, capacity, true);
      this.m_colorBuffer.data = this.ReallocateBuffer4(this.m_colorBuffer, this.m_internalAllocatedCapacity, capacity, true);
      this.m_groupBuffer = this.ReallocateBuffer5(this.m_groupBuffer, 0, this.m_internalAllocatedCapacity, capacity, false);
      this.m_userDataBuffer.data = this.ReallocateBuffer4(this.m_userDataBuffer, this.m_internalAllocatedCapacity, capacity, true);
      this.m_expirationTimeBuffer.data = this.ReallocateBuffer4(this.m_expirationTimeBuffer, this.m_internalAllocatedCapacity, capacity, true);
      this.m_indexByExpirationTimeBuffer.data = this.ReallocateBuffer4(this.m_indexByExpirationTimeBuffer, this.m_internalAllocatedCapacity, capacity, false);
      this.m_internalAllocatedCapacity = capacity;
    }
  }

  public CreateParticleForGroup(groupDef: b2IParticleGroupDef, xf: b2Transform, p: XY): void {
    const particleDef = new b2ParticleDef();
    particleDef.flags = b2Maybe(groupDef.flags, 0);
    ///particleDef.position = b2Mul(xf, p);
    b2Transform.MulXV(xf, p, particleDef.position);
    ///particleDef.velocity =
    ///  groupDef.linearVelocity +
    ///  b2Cross(groupDef.angularVelocity,
    ///      particleDef.position - groupDef.position);
    b2Vec2.AddVV(
      b2Maybe(groupDef.linearVelocity, b2Vec2.ZERO),
      b2Vec2.CrossSV(
        b2Maybe(groupDef.angularVelocity, 0),
        b2Vec2.SubVV(
          particleDef.position,
          b2Maybe(groupDef.position, b2Vec2.ZERO),
          b2Vec2.s_t0,
        ),
        b2Vec2.s_t0,
      ),
      particleDef.velocity,
    );
    particleDef.color.Copy(b2Maybe(groupDef.color, b2Color.ZERO));
    particleDef.lifetime = b2Maybe(groupDef.lifetime, 0);
    particleDef.userData = groupDef.userData;
    this.CreateParticle(particleDef);
  }

  public CreateParticlesStrokeShapeForGroup(shape: b2Shape, groupDef: b2IParticleGroupDef, xf: b2Transform): void {
    const s_edge = b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_edge;
    const s_d = b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_d;
    const s_p = b2ParticleSystem.CreateParticlesStrokeShapeForGroup_s_p;
    let stride = b2Maybe(groupDef.stride, 0);
    if (stride === 0) {
      stride = this.GetParticleStride();
    }
    let positionOnEdge = 0;
    const childCount = shape.GetChildCount();
    for (let childIndex = 0; childIndex < childCount; childIndex++) {
      let edge: b2EdgeShape  = null;
      if (shape.GetType() === b2ShapeType.e_edgeShape) {
        edge = shape as b2EdgeShape;
      } else {
        // DEBUG: b2Assert(shape.GetType() === b2ShapeType.e_chainShape);
        edge = s_edge;
        (shape as b2ChainShape).GetChildEdge(edge, childIndex);
      }
      const d = b2Vec2.SubVV(edge.m_vertex2, edge.m_vertex1, s_d);
      const edgeLength = d.Length();

      while (positionOnEdge < edgeLength) {
        ///b2Vec2 p = edge.m_vertex1 + positionOnEdge / edgeLength * d;
        const p = b2Vec2.AddVMulSV(edge.m_vertex1, positionOnEdge / edgeLength, d, s_p);
        this.CreateParticleForGroup(groupDef, xf, p);
        positionOnEdge += stride;
      }
      positionOnEdge -= edgeLength;
    }
  }
  public static  CreateParticlesStrokeShapeForGroup_s_edge = new b2EdgeShape();
  public static  CreateParticlesStrokeShapeForGroup_s_d = new b2Vec2();
  public static  CreateParticlesStrokeShapeForGroup_s_p = new b2Vec2();

  public CreateParticlesFillShapeForGroup(shape: b2Shape, groupDef: b2IParticleGroupDef, xf: b2Transform): void {
    const s_aabb = b2ParticleSystem.CreateParticlesFillShapeForGroup_s_aabb;
    const s_p = b2ParticleSystem.CreateParticlesFillShapeForGroup_s_p;
    let stride = b2Maybe(groupDef.stride, 0);
    if (stride === 0) {
      stride = this.GetParticleStride();
    }
    ///b2Transform identity;
    /// identity.SetIdentity();
    const identity = b2Transform.IDENTITY;
    const aabb = s_aabb;
    // DEBUG: b2Assert(shape.GetChildCount() === 1);
    shape.ComputeAABB(aabb, identity, 0);
    for (let y = Math.floor(aabb.lowerBound.y / stride) * stride; y < aabb.upperBound.y; y += stride) {
      for (let x = Math.floor(aabb.lowerBound.x / stride) * stride; x < aabb.upperBound.x; x += stride) {
        const p = s_p.Set(x, y);
        if (shape.TestPoint(identity, p)) {
          this.CreateParticleForGroup(groupDef, xf, p);
        }
      }
    }
  }
  public static  CreateParticlesFillShapeForGroup_s_aabb = new b2AABB();
  public static  CreateParticlesFillShapeForGroup_s_p = new b2Vec2();

  public CreateParticlesWithShapeForGroup(shape: b2Shape, groupDef: b2IParticleGroupDef, xf: b2Transform): void {
    switch (shape.GetType()) {
      case b2ShapeType.e_edgeShape:
      case b2ShapeType.e_chainShape:
        this.CreateParticlesStrokeShapeForGroup(shape, groupDef, xf);
        break;
      case b2ShapeType.e_polygonShape:
      case b2ShapeType.e_circleShape:
        this.CreateParticlesFillShapeForGroup(shape, groupDef, xf);
        break;
      default:
        // DEBUG: b2Assert(false);
        break;
    }
  }

  public CreateParticlesWithShapesForGroup(shapes: b2Shape[], shapeCount: number, groupDef: b2IParticleGroupDef, xf: b2Transform): void {
    const compositeShape = new b2ParticleSystem_CompositeShape(shapes, shapeCount);
    this.CreateParticlesFillShapeForGroup(compositeShape, groupDef, xf);
  }

  public CloneParticle(oldIndex: number, group: b2ParticleGroup): number {
    const def = new b2ParticleDef();
    def.flags = this.m_flagsBuffer.data[oldIndex];
    def.position.Copy(this.m_positionBuffer.data[oldIndex]);
    def.velocity.Copy(this.m_velocityBuffer.data[oldIndex]);
    if (this.m_colorBuffer.data) {
      def.color.Copy(this.m_colorBuffer.data[oldIndex]);
    }
    if (this.m_userDataBuffer.data) {
      def.userData = this.m_userDataBuffer.data[oldIndex];
    }
    def.group = group;
    const newIndex = this.CreateParticle(def);
    if (this.m_handleIndexBuffer.data) {
      const handle = this.m_handleIndexBuffer.data[oldIndex];
      if (handle) { handle.SetIndex(newIndex); }
      this.m_handleIndexBuffer.data[newIndex] = handle;
      this.m_handleIndexBuffer.data[oldIndex] = null;
    }
    if (this.m_lastBodyContactStepBuffer.data) {
      this.m_lastBodyContactStepBuffer.data[newIndex] =
        this.m_lastBodyContactStepBuffer.data[oldIndex];
    }
    if (this.m_bodyContactCountBuffer.data) {
      this.m_bodyContactCountBuffer.data[newIndex] =
        this.m_bodyContactCountBuffer.data[oldIndex];
    }
    if (this.m_consecutiveContactStepsBuffer.data) {
      this.m_consecutiveContactStepsBuffer.data[newIndex] =
        this.m_consecutiveContactStepsBuffer.data[oldIndex];
    }
    if (this.m_hasForce) {
      this.m_forceBuffer[newIndex].Copy(this.m_forceBuffer[oldIndex]);
    }
    if (this.m_staticPressureBuffer) {
      this.m_staticPressureBuffer[newIndex] = this.m_staticPressureBuffer[oldIndex];
    }
    if (this.m_depthBuffer) {
      this.m_depthBuffer[newIndex] = this.m_depthBuffer[oldIndex];
    }
    if (this.m_expirationTimeBuffer.data) {
      this.m_expirationTimeBuffer.data[newIndex] =
        this.m_expirationTimeBuffer.data[oldIndex];
    }
    return newIndex;
  }

  public DestroyParticlesInGroup(group: b2ParticleGroup, callDestructionListener: boolean = false): void {
    for (let i = group.m_firstIndex; i < group.m_lastIndex; i++) {
      this.DestroyParticle(i, callDestructionListener);
    }
  }

  public DestroyParticleGroup(group: b2ParticleGroup): void {
    // DEBUG: b2Assert(this.m_groupCount > 0);
    // DEBUG: b2Assert(group !== null);

    if (this.m_world.m_destructionListener) {
      this.m_world.m_destructionListener.SayGoodbyeParticleGroup(group);
    }

    this.SetGroupFlags(group, 0);
    for (let i = group.m_firstIndex; i < group.m_lastIndex; i++) {
      this.m_groupBuffer[i] = null;
    }

    if (group.m_prev) {
      group.m_prev.m_next = group.m_next;
    }
    if (group.m_next) {
      group.m_next.m_prev = group.m_prev;
    }
    if (group === this.m_groupList) {
      this.m_groupList = group.m_next;
    }

    --this.m_groupCount;
  }

  public static ParticleCanBeConnected(flags: b2ParticleFlag, group: b2ParticleGroup ): boolean {
    return ((flags & (b2ParticleFlag.b2_wallParticle | b2ParticleFlag.b2_springParticle | b2ParticleFlag.b2_elasticParticle)) !== 0) ||
      ((group !== null) && ((group.GetGroupFlags() & b2ParticleGroupFlag.b2_rigidParticleGroup) !== 0));
  }

  public UpdatePairsAndTriads(firstIndex: number, lastIndex: number, filter: b2ParticleSystem_ConnectionFilter): void {
    const s_dab = b2ParticleSystem.UpdatePairsAndTriads_s_dab;
    const s_dbc = b2ParticleSystem.UpdatePairsAndTriads_s_dbc;
    const s_dca = b2ParticleSystem.UpdatePairsAndTriads_s_dca;
    const pos_data = this.m_positionBuffer.data;
    // Create pairs or triads.
    // All particles in each pair/triad should satisfy the following:
    // * firstIndex <= index < lastIndex
    // * don't have b2_zombieParticle
    // * ParticleCanBeConnected returns true
    // * ShouldCreatePair/ShouldCreateTriad returns true
    // Any particles in each pair/triad should satisfy the following:
    // * filter.IsNeeded returns true
    // * have one of k_pairFlags/k_triadsFlags
    // DEBUG: b2Assert(firstIndex <= lastIndex);
    let particleFlags = 0;
    for (let i = firstIndex; i < lastIndex; i++) {
      particleFlags |= this.m_flagsBuffer.data[i];
    }
    if (particleFlags & b2ParticleSystem.k_pairFlags) {
      for (let k = 0; k < this.m_contactBuffer.count; k++) {
        const contact = this.m_contactBuffer.data[k];
        const a = contact.indexA;
        const b = contact.indexB;
        const af = this.m_flagsBuffer.data[a];
        const bf = this.m_flagsBuffer.data[b];
        const groupA = this.m_groupBuffer[a];
        const groupB = this.m_groupBuffer[b];
        if (a >= firstIndex && a < lastIndex &&
          b >= firstIndex && b < lastIndex &&
          !((af | bf) & b2ParticleFlag.b2_zombieParticle) &&
          ((af | bf) & b2ParticleSystem.k_pairFlags) &&
          (filter.IsNecessary(a) || filter.IsNecessary(b)) &&
          b2ParticleSystem.ParticleCanBeConnected(af, groupA) &&
          b2ParticleSystem.ParticleCanBeConnected(bf, groupB) &&
          filter.ShouldCreatePair(a, b)) {
          ///b2ParticlePair& pair = m_pairBuffer.Append();
          const pair = this.m_pairBuffer.data[this.m_pairBuffer.Append()];
          pair.indexA = a;
          pair.indexB = b;
          pair.flags = contact.flags;
          pair.strength = b2Min(
            groupA ? groupA.m_strength : 1,
            groupB ? groupB.m_strength : 1);
          ///pair.distance = b2Distance(pos_data[a], pos_data[b]); // TODO: this was wrong!
          pair.distance = b2Vec2.DistanceVV(pos_data[a], pos_data[b]);
        }
        ///std::stable_sort(m_pairBuffer.Begin(), m_pairBuffer.End(), ComparePairIndices);
        std_stable_sort(this.m_pairBuffer.data, 0, this.m_pairBuffer.count, b2ParticleSystem.ComparePairIndices);
        ///m_pairBuffer.Unique(MatchPairIndices);
        this.m_pairBuffer.Unique(b2ParticleSystem.MatchPairIndices);
      }
    }
    if (particleFlags & b2ParticleSystem.k_triadFlags) {
      const diagram = new b2VoronoiDiagram(lastIndex - firstIndex);
      ///let necessary_count = 0;
      for (let i = firstIndex; i < lastIndex; i++) {
        const flags = this.m_flagsBuffer.data[i];
        const group = this.m_groupBuffer[i];
        if (!(flags & b2ParticleFlag.b2_zombieParticle) &&
          b2ParticleSystem.ParticleCanBeConnected(flags, group)) {
          ///if (filter.IsNecessary(i)) {
          ///++necessary_count;
          ///}
          diagram.AddGenerator(pos_data[i], i, filter.IsNecessary(i));
        }
      }
      ///if (necessary_count === 0) {
      /////debugger;
      ///for (let i = firstIndex; i < lastIndex; i++) {
      ///  filter.IsNecessary(i);
      ///}
      ///}
      const stride = this.GetParticleStride();
      diagram.Generate(stride / 2, stride * 2);
      const system = this;
      const callback = /*UpdateTriadsCallback*/(a: number, b: number, c: number): void => {
        const af = system.m_flagsBuffer.data[a];
        const bf = system.m_flagsBuffer.data[b];
        const cf = system.m_flagsBuffer.data[c];
        if (((af | bf | cf) & b2ParticleSystem.k_triadFlags) &&
          filter.ShouldCreateTriad(a, b, c)) {
          const pa = pos_data[a];
          const pb = pos_data[b];
          const pc = pos_data[c];
          const dab = b2Vec2.SubVV(pa, pb, s_dab);
          const dbc = b2Vec2.SubVV(pb, pc, s_dbc);
          const dca = b2Vec2.SubVV(pc, pa, s_dca);
          const maxDistanceSquared = b2_maxTriadDistanceSquared * system.m_squaredDiameter;
          if (b2Vec2.DotVV(dab, dab) > maxDistanceSquared ||
            b2Vec2.DotVV(dbc, dbc) > maxDistanceSquared ||
            b2Vec2.DotVV(dca, dca) > maxDistanceSquared) {
            return;
          }
          const groupA = system.m_groupBuffer[a];
          const groupB = system.m_groupBuffer[b];
          const groupC = system.m_groupBuffer[c];
          ///b2ParticleTriad& triad = m_system.m_triadBuffer.Append();
          const triad = system.m_triadBuffer.data[system.m_triadBuffer.Append()];
          triad.indexA = a;
          triad.indexB = b;
          triad.indexC = c;
          triad.flags = af | bf | cf;
          triad.strength = b2Min(b2Min(
              groupA ? groupA.m_strength : 1,
              groupB ? groupB.m_strength : 1),
            groupC ? groupC.m_strength : 1);
          ///let midPoint = b2Vec2.MulSV(1.0 / 3.0, b2Vec2.AddVV(pa, b2Vec2.AddVV(pb, pc, new b2Vec2()), new b2Vec2()), new b2Vec2());
          const midPoint_x = (pa.x + pb.x + pc.x) / 3.0;
          const midPoint_y = (pa.y + pb.y + pc.y) / 3.0;
          ///triad.pa = b2Vec2.SubVV(pa, midPoint, new b2Vec2());
          triad.pa.x = pa.x - midPoint_x;
          triad.pa.y = pa.y - midPoint_y;
          ///triad.pb = b2Vec2.SubVV(pb, midPoint, new b2Vec2());
          triad.pb.x = pb.x - midPoint_x;
          triad.pb.y = pb.y - midPoint_y;
          ///triad.pc = b2Vec2.SubVV(pc, midPoint, new b2Vec2());
          triad.pc.x = pc.x - midPoint_x;
          triad.pc.y = pc.y - midPoint_y;
          triad.ka = -b2Vec2.DotVV(dca, dab);
          triad.kb = -b2Vec2.DotVV(dab, dbc);
          triad.kc = -b2Vec2.DotVV(dbc, dca);
          triad.s = b2Vec2.CrossVV(pa, pb) + b2Vec2.CrossVV(pb, pc) + b2Vec2.CrossVV(pc, pa);
        }
      };
      diagram.GetNodes(callback);
      ///std::stable_sort(m_triadBuffer.Begin(), m_triadBuffer.End(), CompareTriadIndices);
      std_stable_sort(this.m_triadBuffer.data, 0, this.m_triadBuffer.count, b2ParticleSystem.CompareTriadIndices);
      ///m_triadBuffer.Unique(MatchTriadIndices);
      this.m_triadBuffer.Unique(b2ParticleSystem.MatchTriadIndices);
    }
  }
  private static UpdatePairsAndTriads_s_dab = new b2Vec2();
  private static UpdatePairsAndTriads_s_dbc = new b2Vec2();
  private static UpdatePairsAndTriads_s_dca = new b2Vec2();

  public UpdatePairsAndTriadsWithReactiveParticles(): void {
    const filter = new b2ParticleSystem_ReactiveFilter(this.m_flagsBuffer);
    this.UpdatePairsAndTriads(0, this.m_count, filter);

    for (let i = 0; i < this.m_count; i++) {
      this.m_flagsBuffer.data[i] &= ~b2ParticleFlag.b2_reactiveParticle;
    }
    this.m_allParticleFlags &= ~b2ParticleFlag.b2_reactiveParticle;
  }

  public static ComparePairIndices(a: b2ParticlePair, b: b2ParticlePair): boolean {
    const diffA = a.indexA - b.indexA;
    if (diffA !== 0) { return diffA < 0; }
    return a.indexB < b.indexB;
  }

  public static MatchPairIndices(a: b2ParticlePair, b: b2ParticlePair): boolean {
    return a.indexA === b.indexA && a.indexB === b.indexB;
  }

  public static CompareTriadIndices(a: b2ParticleTriad, b: b2ParticleTriad): boolean {
    const diffA = a.indexA - b.indexA;
    if (diffA !== 0) { return diffA < 0; }
    const diffB = a.indexB - b.indexB;
    if (diffB !== 0) { return diffB < 0; }
    return a.indexC < b.indexC;
  }

  public static MatchTriadIndices(a: b2ParticleTriad, b: b2ParticleTriad): boolean {
    return a.indexA === b.indexA && a.indexB === b.indexB && a.indexC === b.indexC;
  }

  public static InitializeParticleLists(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[]): void {
    const bufferIndex = group.GetBufferIndex();
    const particleCount = group.GetParticleCount();
    for (let i = 0; i < particleCount; i++) {
      const node: b2ParticleSystem_ParticleListNode = nodeBuffer[i];
      node.list = node;
      node.next = null;
      node.count = 1;
      node.index = i + bufferIndex;
    }
  }

  public MergeParticleListsInContact(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[]): void {
    const bufferIndex = group.GetBufferIndex();
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      /*const b2ParticleContact&*/
      const contact = this.m_contactBuffer.data[k];
      const a = contact.indexA;
      const b = contact.indexB;
      if (!group.ContainsParticle(a) || !group.ContainsParticle(b)) {
        continue;
      }
      let listA: b2ParticleSystem_ParticleListNode = nodeBuffer[a - bufferIndex].list;
      let listB: b2ParticleSystem_ParticleListNode = nodeBuffer[b - bufferIndex].list;
      if (listA === listB) {
        continue;
      }
      // To minimize the cost of insertion, make sure listA is longer than
      // listB.
      if (listA.count < listB.count) {
        const _tmp = listA;
        listA = listB;
        listB = _tmp; ///b2Swap(listA, listB);
      }
      // DEBUG: b2Assert(listA.count >= listB.count);
      b2ParticleSystem.MergeParticleLists(listA, listB);
    }
  }

  public static MergeParticleLists(listA: b2ParticleSystem_ParticleListNode, listB: b2ParticleSystem_ParticleListNode): void {
    // Insert listB between index 0 and 1 of listA
    // Example:
    //     listA => a1 => a2 => a3 => null
    //     listB => b1 => b2 => null
    // to
    //     listA => listB => b1 => b2 => a1 => a2 => a3 => null
    // DEBUG: b2Assert(listA !== listB);
    for (let b: b2ParticleSystem_ParticleListNode = listB; ; ) {
      b.list = listA;
      const nextB: b2ParticleSystem_ParticleListNode  = b.next;
      if (nextB) {
        b = nextB;
      } else {
        b.next = listA.next;
        break;
      }
    }
    listA.next = listB;
    listA.count += listB.count;
    listB.count = 0;
  }

  public static FindLongestParticleList(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[]): b2ParticleSystem_ParticleListNode {
    const particleCount = group.GetParticleCount();
    let result: b2ParticleSystem_ParticleListNode = nodeBuffer[0];
    for (let i = 0; i < particleCount; i++) {
      const node: b2ParticleSystem_ParticleListNode = nodeBuffer[i];
      if (result.count < node.count) {
        result = node;
      }
    }
    return result;
  }

  public MergeZombieParticleListNodes(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[], survivingList: b2ParticleSystem_ParticleListNode): void {
    const particleCount = group.GetParticleCount();
    for (let i = 0; i < particleCount; i++) {
      const node: b2ParticleSystem_ParticleListNode = nodeBuffer[i];
      if (node !== survivingList &&
        (this.m_flagsBuffer.data[node.index] & b2ParticleFlag.b2_zombieParticle)) {
        b2ParticleSystem.MergeParticleListAndNode(survivingList, node);
      }
    }
  }

  public static MergeParticleListAndNode(list: b2ParticleSystem_ParticleListNode, node: b2ParticleSystem_ParticleListNode): void {
    // Insert node between index 0 and 1 of list
    // Example:
    //     list => a1 => a2 => a3 => null
    //     node => null
    // to
    //     list => node => a1 => a2 => a3 => null
    // DEBUG: b2Assert(node !== list);
    // DEBUG: b2Assert(node.list === node);
    // DEBUG: b2Assert(node.count === 1);
    node.list = list;
    node.next = list.next;
    list.next = node;
    list.count++;
    node.count = 0;
  }

  public CreateParticleGroupsFromParticleList(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[], survivingList: b2ParticleSystem_ParticleListNode): void {
    const particleCount = group.GetParticleCount();
    const def = new b2ParticleGroupDef();
    def.groupFlags = group.GetGroupFlags();
    def.userData = group.GetUserData();
    for (let i = 0; i < particleCount; i++) {
      const list: b2ParticleSystem_ParticleListNode = nodeBuffer[i];
      if (!list.count || list === survivingList) {
        continue;
      }
      // DEBUG: b2Assert(list.list === list);
      const newGroup: b2ParticleGroup = this.CreateParticleGroup(def);
      for (let node: b2ParticleSystem_ParticleListNode  = list; node; node = node.next) {
        const oldIndex = node.index;
        // DEBUG: const flags = this.m_flagsBuffer.data[oldIndex];
        // DEBUG: b2Assert(!(flags & b2ParticleFlag.b2_zombieParticle));
        const newIndex = this.CloneParticle(oldIndex, newGroup);
        this.m_flagsBuffer.data[oldIndex] |= b2ParticleFlag.b2_zombieParticle;
        node.index = newIndex;
      }
    }
  }

  public UpdatePairsAndTriadsWithParticleList(group: b2ParticleGroup, nodeBuffer: b2ParticleSystem_ParticleListNode[]): void {
    const bufferIndex = group.GetBufferIndex();
    // Update indices in pairs and triads. If an index belongs to the group,
    // replace it with the corresponding value in nodeBuffer.
    // Note that nodeBuffer is allocated only for the group and the index should
    // be shifted by bufferIndex.
    for (let k = 0; k < this.m_pairBuffer.count; k++) {
      const pair = this.m_pairBuffer.data[k];
      const a = pair.indexA;
      const b = pair.indexB;
      if (group.ContainsParticle(a)) {
        pair.indexA = nodeBuffer[a - bufferIndex].index;
      }
      if (group.ContainsParticle(b)) {
        pair.indexB = nodeBuffer[b - bufferIndex].index;
      }
    }
    for (let k = 0; k < this.m_triadBuffer.count; k++) {
      const triad = this.m_triadBuffer.data[k];
      const a = triad.indexA;
      const b = triad.indexB;
      const c = triad.indexC;
      if (group.ContainsParticle(a)) {
        triad.indexA = nodeBuffer[a - bufferIndex].index;
      }
      if (group.ContainsParticle(b)) {
        triad.indexB = nodeBuffer[b - bufferIndex].index;
      }
      if (group.ContainsParticle(c)) {
        triad.indexC = nodeBuffer[c - bufferIndex].index;
      }
    }
  }

  public ComputeDepth(): void {
    const contactGroups: b2ParticleContact[] = []; // TODO: static
    let contactGroupsCount = 0;
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      const a = contact.indexA;
      const b = contact.indexB;
      const groupA = this.m_groupBuffer[a];
      const groupB = this.m_groupBuffer[b];
      if (groupA && groupA === groupB &&
        (groupA.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth)) {
        contactGroups[contactGroupsCount++] = contact;
      }
    }
    const groupsToUpdate: b2ParticleGroup[] = []; // TODO: static
    let groupsToUpdateCount = 0;
    for (let group = this.m_groupList; group; group = group.GetNext()) {
      if (group.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth) {
        groupsToUpdate[groupsToUpdateCount++] = group;
        this.SetGroupFlags(group,
          group.m_groupFlags &
          ~b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth);
        for (let i = group.m_firstIndex; i < group.m_lastIndex; i++) {
          this.m_accumulationBuffer[i] = 0;
        }
      }
    }
    // Compute sum of weight of contacts except between different groups.
    for (let k = 0; k < contactGroupsCount; k++) {
      const contact = contactGroups[k];
      const a = contact.indexA;
      const b = contact.indexB;
      const w = contact.weight;
      this.m_accumulationBuffer[a] += w;
      this.m_accumulationBuffer[b] += w;
    }

    // DEBUG: b2Assert(this.m_depthBuffer !== null);
    for (let i = 0; i < groupsToUpdateCount; i++) {
      const group = groupsToUpdate[i];
      for (let i = group.m_firstIndex; i < group.m_lastIndex; i++) {
        const w = this.m_accumulationBuffer[i];
        this.m_depthBuffer[i] = w < 0.8 ? 0 : b2_maxFloat;
      }
    }
    // The number of iterations is equal to particle number from the deepest
    // particle to the nearest surface particle, and in general it is smaller
    // than sqrt of total particle number.
    ///int32 iterationCount = (int32)b2Sqrt((float)m_count);
    const iterationCount = b2Sqrt(this.m_count) >> 0;
    for (let t = 0; t < iterationCount; t++) {
      let updated = false;
      for (let k = 0; k < contactGroupsCount; k++) {
        const contact = contactGroups[k];
        const a = contact.indexA;
        const b = contact.indexB;
        const r = 1 - contact.weight;
        ///float32& ap0 = m_depthBuffer[a];
        const ap0 = this.m_depthBuffer[a];
        ///float32& bp0 = m_depthBuffer[b];
        const bp0 = this.m_depthBuffer[b];
        const ap1 = bp0 + r;
        const bp1 = ap0 + r;
        if (ap0 > ap1) {
          ///ap0 = ap1;
          this.m_depthBuffer[a] = ap1;
          updated = true;
        }
        if (bp0 > bp1) {
          ///bp0 = bp1;
          this.m_depthBuffer[b] = bp1;
          updated = true;
        }
      }
      if (!updated) {
        break;
      }
    }
    for (let i = 0; i < groupsToUpdateCount; i++) {
      const group = groupsToUpdate[i];
      for (let i = group.m_firstIndex; i < group.m_lastIndex; i++) {
        if (this.m_depthBuffer[i] < b2_maxFloat) {
          this.m_depthBuffer[i] *= this.m_particleDiameter;
        } else {
          this.m_depthBuffer[i] = 0;
        }
      }
    }
  }

  public GetInsideBoundsEnumerator(aabb: <b2AABB>): b2ParticleSystem_InsideBoundsEnumerator {
    const lowerTag = b2ParticleSystem.computeTag(this.m_inverseDiameter * aabb.lowerBound.x - 1,
      this.m_inverseDiameter * aabb.lowerBound.y - 1);
    const upperTag = b2ParticleSystem.computeTag(this.m_inverseDiameter * aabb.upperBound.x + 1,
      this.m_inverseDiameter * aabb.upperBound.y + 1);
    ///const Proxy* beginProxy = m_proxyBuffer.Begin();
    const beginProxy = 0;
    ///const Proxy* endProxy = m_proxyBuffer.End();
    const endProxy = this.m_proxyBuffer.count;
    ///const Proxy* firstProxy = std::lower_bound(beginProxy, endProxy, lowerTag);
    const firstProxy = std_lower_bound(this.m_proxyBuffer.data, beginProxy, endProxy, lowerTag, b2ParticleSystem_Proxy.CompareProxyTag);
    ///const Proxy* lastProxy = std::upper_bound(firstProxy, endProxy, upperTag);
    const lastProxy = std_upper_bound(this.m_proxyBuffer.data, beginProxy, endProxy, upperTag, b2ParticleSystem_Proxy.CompareTagProxy);

    // DEBUG: b2Assert(beginProxy <= firstProxy);
    // DEBUG: b2Assert(firstProxy <= lastProxy);
    // DEBUG: b2Assert(lastProxy <= endProxy);

    return new b2ParticleSystem_InsideBoundsEnumerator(this, lowerTag, upperTag, firstProxy, lastProxy);
  }

  public UpdateAllParticleFlags(): void {
    this.m_allParticleFlags = 0;
    for (let i = 0; i < this.m_count; i++) {
      this.m_allParticleFlags |= this.m_flagsBuffer.data[i];
    }
    this.m_needsUpdateAllParticleFlags = false;
  }

  public UpdateAllGroupFlags(): void {
    this.m_allGroupFlags = 0;
    for (let group = this.m_groupList; group; group = group.GetNext()) {
      this.m_allGroupFlags |= group.m_groupFlags;
    }
    this.m_needsUpdateAllGroupFlags = false;
  }

  public AddContact(a: number, b: number, contacts: b2GrowableBuffer<b2ParticleContact>): void {
    // DEBUG: b2Assert(contacts === this.m_contactBuffer);
    const flags_data = this.m_flagsBuffer.data;
    const pos_data = this.m_positionBuffer.data;
    ///b2Vec2 d = m_positionBuffer.data[b] - m_positionBuffer.data[a];
    const d = b2Vec2.SubVV(pos_data[b], pos_data[a], b2ParticleSystem.AddContact_s_d);
    const distBtParticlesSq = b2Vec2.DotVV(d, d);
    if (0 < distBtParticlesSq && distBtParticlesSq < this.m_squaredDiameter) {
      const invD = b2InvSqrt(distBtParticlesSq);
      ///b2ParticleContact& contact = contacts.Append();
      const contact = this.m_contactBuffer.data[this.m_contactBuffer.Append()];
      contact.indexA = a;
      contact.indexB = b;
      contact.flags = flags_data[a] | flags_data[b];
      contact.weight = 1 - distBtParticlesSq * invD * this.m_inverseDiameter;
      contact.normal.x = invD * d.x;
      contact.normal.y = invD * d.y;
    }
  }
  public static  AddContact_s_d = new b2Vec2();

  public FindContacts_Reference(contacts: b2GrowableBuffer<b2ParticleContact>): void {
    // DEBUG: b2Assert(contacts === this.m_contactBuffer);
    const beginProxy = 0;
    const endProxy = this.m_proxyBuffer.count;

    this.m_contactBuffer.count = 0;
    for (let a = beginProxy, c = beginProxy; a < endProxy; a++) {
      const rightTag = b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, 1, 0);
      for (let b = a + 1; b < endProxy; b++) {
        if (rightTag < this.m_proxyBuffer.data[b].tag) { break; }
        this.AddContact(this.m_proxyBuffer.data[a].index, this.m_proxyBuffer.data[b].index, this.m_contactBuffer);
      }
      const bottomLeftTag = b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, -1, 1);
      for (; c < endProxy; c++) {
        if (bottomLeftTag <= this.m_proxyBuffer.data[c].tag) { break; }
      }
      const bottomRightTag = b2ParticleSystem.computeRelativeTag(this.m_proxyBuffer.data[a].tag, 1, 1);
      for (let b = c; b < endProxy; b++) {
        if (bottomRightTag < this.m_proxyBuffer.data[b].tag) { break; }
        this.AddContact(this.m_proxyBuffer.data[a].index, this.m_proxyBuffer.data[b].index, this.m_contactBuffer);
      }
    }
  }

  ///void ReorderForFindContact(FindContactInput* reordered, int alignedCount) const;
  ///void GatherChecksOneParticle(const uint32 bound, const int startIndex, const int particleIndex, int* nextUncheckedIndex, b2GrowableBuffer<FindContactCheck>& checks) const;
  ///void GatherChecks(b2GrowableBuffer<FindContactCheck>& checks) const;
  ///void FindContacts_Simd(b2GrowableBuffer<b2ParticleContact>& contacts) const;

  public FindContacts(contacts: b2GrowableBuffer<b2ParticleContact>): void {
    this.FindContacts_Reference(contacts);
  }

  ///static void UpdateProxyTags(const uint32* const tags, b2GrowableBuffer<Proxy>& proxies);
  ///static bool ProxyBufferHasIndex(int32 index, const Proxy* const a, int count);
  ///static int NumProxiesWithSameTag(const Proxy* const a, const Proxy* const b, int count);
  ///static bool AreProxyBuffersTheSame(const b2GrowableBuffer<Proxy>& a, const b2GrowableBuffer<Proxy>& b);

  public UpdateProxies_Reference(proxies: b2GrowableBuffer<b2ParticleSystem_Proxy>): void {
    // DEBUG: b2Assert(proxies === this.m_proxyBuffer);
    const pos_data = this.m_positionBuffer.data;
    const inv_diam = this.m_inverseDiameter;
    for (let k = 0; k < this.m_proxyBuffer.count; ++k) {
      const proxy = this.m_proxyBuffer.data[k];
      const i = proxy.index;
      const p = pos_data[i];
      proxy.tag = b2ParticleSystem.computeTag(inv_diam * p.x, inv_diam * p.y);
    }
  }

  ///void UpdateProxies_Simd(b2GrowableBuffer<Proxy>& proxies) const;

  public UpdateProxies(proxies: b2GrowableBuffer<b2ParticleSystem_Proxy>): void {
    this.UpdateProxies_Reference(proxies);
  }

  public SortProxies(proxies: b2GrowableBuffer<b2ParticleSystem_Proxy>): void {
    // DEBUG: b2Assert(proxies === this.m_proxyBuffer);

    ///std::sort(proxies.Begin(), proxies.End());
    std_sort(this.m_proxyBuffer.data, 0, this.m_proxyBuffer.count, b2ParticleSystem_Proxy.CompareProxyProxy);
  }

  public FilterContacts(contacts: b2GrowableBuffer<b2ParticleContact>): void {
    // Optionally filter the contact.
    const contactFilter = this.GetParticleContactFilter();
    if (contactFilter === null) {
      return;
    }

    /// contacts.RemoveIf(b2ParticleContactRemovePredicate(this, contactFilter));
    // DEBUG: b2Assert(contacts === this.m_contactBuffer);
    const system = this;
    const predicate = (contact: b2ParticleContact): boolean => {
      return ((contact.flags & b2ParticleFlag.b2_particleContactFilterParticle) !== 0) && !contactFilter.ShouldCollideParticleParticle(system, contact.indexA, contact.indexB);
    };
    this.m_contactBuffer.RemoveIf(predicate);
  }

  public NotifyContactListenerPreContact(particlePairs: b2ParticlePairSet): void {
    const contactListener = this.GetParticleContactListener();
    if (contactListener === null) {
      return;
    }

    ///particlePairs.Initialize(m_contactBuffer.Begin(), m_contactBuffer.GetCount(), GetFlagsBuffer());
    particlePairs.Initialize(this.m_contactBuffer, this.m_flagsBuffer);

    throw new Error(); // TODO: notify
  }

  public NotifyContactListenerPostContact(particlePairs: b2ParticlePairSet): void {
    const contactListener = this.GetParticleContactListener();
    if (contactListener === null) {
      return;
    }

    // Loop through all new contacts, reporting any new ones, and
    // "invalidating" the ones that still exist.
    ///const b2ParticleContact* const endContact = m_contactBuffer.End();
    ///for (b2ParticleContact* contact = m_contactBuffer.Begin(); contact < endContact; ++contact)
    for (let k = 0; k < this.m_contactBuffer.count; ++k) {
      const contact = this.m_contactBuffer.data[k];
      ///ParticlePair pair;
      ///pair.first = contact.GetIndexA();
      ///pair.second = contact.GetIndexB();
      ///const int32 itemIndex = particlePairs.Find(pair);
      const itemIndex = -1; // TODO
      if (itemIndex >= 0) {
        // Already touching, ignore this contact.
        particlePairs.Invalidate(itemIndex);
      } else {
        // Just started touching, inform the listener.
        contactListener.BeginContactParticleParticle(this, contact);
      }
    }

    // Report particles that are no longer touching.
    // That is, any pairs that were not invalidated above.
    ///const int32 pairCount = particlePairs.GetCount();
    ///const ParticlePair* const pairs = particlePairs.GetBuffer();
    ///const int8* const valid = particlePairs.GetValidBuffer();
    ///for (int32 i = 0; i < pairCount; ++i)
    ///{
    ///  if (valid[i])
    ///  {
    ///    contactListener.EndContactParticleParticle(this, pairs[i].first, pairs[i].second);
    ///  }
    ///}

    throw new Error(); // TODO: notify
  }

  public static b2ParticleContactIsZombie(contact: b2ParticleContact): boolean {
    return (contact.flags & b2ParticleFlag.b2_zombieParticle) === b2ParticleFlag.b2_zombieParticle;
  }

  public UpdateContacts(exceptZombie: boolean): void {
    this.UpdateProxies(this.m_proxyBuffer);
    this.SortProxies(this.m_proxyBuffer);

    const particlePairs = new b2ParticlePairSet(); // TODO: static
    this.NotifyContactListenerPreContact(particlePairs);

    this.FindContacts(this.m_contactBuffer);
    this.FilterContacts(this.m_contactBuffer);

    this.NotifyContactListenerPostContact(particlePairs);

    if (exceptZombie) {
      this.m_contactBuffer.RemoveIf(b2ParticleSystem.b2ParticleContactIsZombie);
    }
  }

  public NotifyBodyContactListenerPreContact(fixtureSet: b2ParticleSystem_FixtureParticleSet): void {
    const contactListener = this.GetFixtureContactListener();
    if (contactListener === null) {
      return;
    }

    ///fixtureSet.Initialize(m_bodyContactBuffer.Begin(), m_bodyContactBuffer.GetCount(), GetFlagsBuffer());
    fixtureSet.Initialize(this.m_bodyContactBuffer, this.m_flagsBuffer);

    throw new Error(); // TODO: notify
  }

  public NotifyBodyContactListenerPostContact(fixtureSet: b2ParticleSystem_FixtureParticleSet): void {
    const contactListener = this.GetFixtureContactListener();
    if (contactListener === null) {
      return;
    }

    // Loop through all new contacts, reporting any new ones, and
    // "invalidating" the ones that still exist.
    ///for (b2ParticleBodyContact* contact = m_bodyContactBuffer.Begin(); contact !== m_bodyContactBuffer.End(); ++contact)
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      // DEBUG: b2Assert(contact !== null);
      ///FixtureParticle fixtureParticleToFind;
      ///fixtureParticleToFind.first = contact.fixture;
      ///fixtureParticleToFind.second = contact.index;
      ///const int32 index = fixtureSet.Find(fixtureParticleToFind);
      const index = -1; // TODO
      if (index >= 0) {
        // Already touching remove this from the set.
        fixtureSet.Invalidate(index);
      } else {
        // Just started touching, report it!
        contactListener.BeginContactFixtureParticle(this, contact);
      }
    }

    // If the contact listener is enabled, report all fixtures that are no
    // longer in contact with particles.
    ///const FixtureParticle* const fixtureParticles = fixtureSet.GetBuffer();
    ///const int8* const fixtureParticlesValid = fixtureSet.GetValidBuffer();
    ///const int32 fixtureParticleCount = fixtureSet.GetCount();
    ///for (int32 i = 0; i < fixtureParticleCount; ++i)
    ///{
    ///  if (fixtureParticlesValid[i])
    ///  {
    ///    const FixtureParticle* const fixtureParticle = &fixtureParticles[i];
    ///    contactListener.EndContactFixtureParticle(fixtureParticle.first, this, fixtureParticle.second);
    ///  }
    ///}

    throw new Error(); // TODO: notify
  }

  public UpdateBodyContacts(): void {
    const s_aabb = b2ParticleSystem.UpdateBodyContacts_s_aabb;

    // If the particle contact listener is enabled, generate a set of
    // fixture / particle contacts.
    const fixtureSet = new b2ParticleSystem_FixtureParticleSet(); // TODO: static
    this.NotifyBodyContactListenerPreContact(fixtureSet);

    if (this.m_stuckThreshold > 0) {
      const particleCount = this.GetParticleCount();
      for (let i = 0; i < particleCount; i++) {
        // Detect stuck particles, see comment in
        // b2ParticleSystem::DetectStuckParticle()
        this.m_bodyContactCountBuffer.data[i] = 0;
        if (this.m_timestamp > (this.m_lastBodyContactStepBuffer.data[i] + 1)) {
          this.m_consecutiveContactStepsBuffer.data[i] = 0;
        }
      }
    }
    this.m_bodyContactBuffer.SetCount(0);
    this.m_stuckParticleBuffer.SetCount(0);

    const aabb = s_aabb;
    this.ComputeAABB(aabb);

    if (this.UpdateBodyContacts_callback === null) {
      this.UpdateBodyContacts_callback = new b2ParticleSystem_UpdateBodyContactsCallback(this);
    }
    const callback = this.UpdateBodyContacts_callback;
    callback.m_contactFilter = this.GetFixtureContactFilter();
    this.m_world.QueryAABB(callback, aabb);

    if (this.m_def.strictContactCheck) {
      this.RemoveSpuriousBodyContacts();
    }

    this.NotifyBodyContactListenerPostContact(fixtureSet);
  }
  public static  UpdateBodyContacts_s_aabb = new b2AABB();
  public UpdateBodyContacts_callback: b2ParticleSystem_UpdateBodyContactsCallback  = null;

  public Solve(step: b2TimeStep): void {
    const s_subStep = b2ParticleSystem.Solve_s_subStep;
    if (this.m_count === 0) {
      return;
    }
    // If particle lifetimes are enabled, destroy particles that are too old.
    if (this.m_expirationTimeBuffer.data) {
      this.SolveLifetimes(step);
    }
    if (this.m_allParticleFlags & b2ParticleFlag.b2_zombieParticle) {
      this.SolveZombie();
    }
    if (this.m_needsUpdateAllParticleFlags) {
      this.UpdateAllParticleFlags();
    }
    if (this.m_needsUpdateAllGroupFlags) {
      this.UpdateAllGroupFlags();
    }
    if (this.m_paused) {
      return;
    }
    for (this.m_iterationIndex = 0; this.m_iterationIndex < step.particleIterations; this.m_iterationIndex++) {
      ++this.m_timestamp;
      const subStep = s_subStep.Copy(step);
      subStep.dt /= step.particleIterations;
      subStep.inv_dt *= step.particleIterations;
      this.UpdateContacts(false);
      this.UpdateBodyContacts();
      this.ComputeWeight();
      if (this.m_allGroupFlags & b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth) {
        this.ComputeDepth();
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_reactiveParticle) {
        this.UpdatePairsAndTriadsWithReactiveParticles();
      }
      if (this.m_hasForce) {
        this.SolveForce(subStep);
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_viscousParticle) {
        this.SolveViscous();
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_repulsiveParticle) {
        this.SolveRepulsive(subStep);
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_powderParticle) {
        this.SolvePowder(subStep);
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_tensileParticle) {
        this.SolveTensile(subStep);
      }
      if (this.m_allGroupFlags & b2ParticleGroupFlag.b2_solidParticleGroup) {
        this.SolveSolid(subStep);
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_colorMixingParticle) {
        this.SolveColorMixing();
      }
      this.SolveGravity(subStep);
      if (this.m_allParticleFlags & b2ParticleFlag.b2_staticPressureParticle) {
        this.SolveStaticPressure(subStep);
      }
      this.SolvePressure(subStep);
      this.SolveDamping(subStep);
      if (this.m_allParticleFlags & b2ParticleSystem.k_extraDampingFlags) {
        this.SolveExtraDamping();
      }
      // SolveElastic and SolveSpring refer the current velocities for
      // numerical stability, they should be called as late as possible.
      if (this.m_allParticleFlags & b2ParticleFlag.b2_elasticParticle) {
        this.SolveElastic(subStep);
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_springParticle) {
        this.SolveSpring(subStep);
      }
      this.LimitVelocity(subStep);
      if (this.m_allGroupFlags & b2ParticleGroupFlag.b2_rigidParticleGroup) {
        this.SolveRigidDamping();
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_barrierParticle) {
        this.SolveBarrier(subStep);
      }
      // SolveCollision, SolveRigid and SolveWall should be called after
      // other force functions because they may require particles to have
      // specific velocities.
      this.SolveCollision(subStep);
      if (this.m_allGroupFlags & b2ParticleGroupFlag.b2_rigidParticleGroup) {
        this.SolveRigid(subStep);
      }
      if (this.m_allParticleFlags & b2ParticleFlag.b2_wallParticle) {
        this.SolveWall();
      }
      // The particle positions can be updated only at the end of substep.
      for (let i = 0; i < this.m_count; i++) {
        ///m_positionBuffer.data[i] += subStep.dt * m_velocityBuffer.data[i];
        this.m_positionBuffer.data[i].SelfMulAdd(subStep.dt, this.m_velocityBuffer.data[i]);
      }
    }
  }
  public static  Solve_s_subStep = new b2TimeStep();

  public SolveCollision(step: b2TimeStep): void {
    const s_aabb = b2ParticleSystem.SolveCollision_s_aabb;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;

    // This function detects particles which are crossing boundary of bodies
    // and modifies velocities of them so that they will move just in front of
    // boundary. This function function also applies the reaction force to
    // bodies as precisely as the numerical stability is kept.
    const aabb = s_aabb;
    aabb.lowerBound.x = +b2_maxFloat;
    aabb.lowerBound.y = +b2_maxFloat;
    aabb.upperBound.x = -b2_maxFloat;
    aabb.upperBound.y = -b2_maxFloat;
    for (let i = 0; i < this.m_count; i++) {
      const v = vel_data[i];
      const p1 = pos_data[i];
      ///let p2 = p1 + step.dt * v;
      const p2_x = p1.x + step.dt * v.x;
      const p2_y = p1.y + step.dt * v.y;
      ///aabb.lowerBound = b2Min(aabb.lowerBound, b2Min(p1, p2));
      aabb.lowerBound.x = b2Min(aabb.lowerBound.x, b2Min(p1.x, p2_x));
      aabb.lowerBound.y = b2Min(aabb.lowerBound.y, b2Min(p1.y, p2_y));
      ///aabb.upperBound = b2Max(aabb.upperBound, b2Max(p1, p2));
      aabb.upperBound.x = b2Max(aabb.upperBound.x, b2Max(p1.x, p2_x));
      aabb.upperBound.y = b2Max(aabb.upperBound.y, b2Max(p1.y, p2_y));
    }
    if (this.SolveCollision_callback === null) {
      this.SolveCollision_callback = new b2ParticleSystem_SolveCollisionCallback(this, step);
    }
    const callback = this.SolveCollision_callback;
    callback.m_step = step;
    this.m_world.QueryAABB(callback, aabb);
  }
  public static  SolveCollision_s_aabb = new b2AABB();
  public SolveCollision_callback: b2ParticleSystem_SolveCollisionCallback  = null;

  public LimitVelocity(step: b2TimeStep): void {
    const vel_data = this.m_velocityBuffer.data;
    const criticalVelocitySquared = this.GetCriticalVelocitySquared(step);
    for (let i = 0; i < this.m_count; i++) {
      const v = vel_data[i];
      const v2 = b2Vec2.DotVV(v, v);
      if (v2 > criticalVelocitySquared) {
        ///v *= b2Sqrt(criticalVelocitySquared / v2);
        v.SelfMul(b2Sqrt(criticalVelocitySquared / v2));
      }
    }
  }

  public SolveGravity(step: b2TimeStep): void {
    const s_gravity = b2ParticleSystem.SolveGravity_s_gravity;
    const vel_data = this.m_velocityBuffer.data;
    ///b2Vec2 gravity = step.dt * m_def.gravityScale * m_world.GetGravity();
    const gravity = b2Vec2.MulSV(step.dt * this.m_def.gravityScale, this.m_world.GetGravity(), s_gravity);
    for (let i = 0; i < this.m_count; i++) {
      vel_data[i].SelfAdd(gravity);
    }
  }
  public static  SolveGravity_s_gravity = new b2Vec2();

  public SolveBarrier(step: b2TimeStep): void {
    const s_aabb = b2ParticleSystem.SolveBarrier_s_aabb;
    const s_va = b2ParticleSystem.SolveBarrier_s_va;
    const s_vb = b2ParticleSystem.SolveBarrier_s_vb;
    const s_pba = b2ParticleSystem.SolveBarrier_s_pba;
    const s_vba = b2ParticleSystem.SolveBarrier_s_vba;
    const s_vc = b2ParticleSystem.SolveBarrier_s_vc;
    const s_pca = b2ParticleSystem.SolveBarrier_s_pca;
    const s_vca = b2ParticleSystem.SolveBarrier_s_vca;
    const s_qba = b2ParticleSystem.SolveBarrier_s_qba;
    const s_qca = b2ParticleSystem.SolveBarrier_s_qca;
    const s_dv = b2ParticleSystem.SolveBarrier_s_dv;
    const s_f = b2ParticleSystem.SolveBarrier_s_f;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;
    // If a particle is passing between paired barrier particles,
    // its velocity will be decelerated to avoid passing.
    for (let i = 0; i < this.m_count; i++) {
      const flags = this.m_flagsBuffer.data[i];
      ///if ((flags & b2ParticleSystem.k_barrierWallFlags) === b2ParticleSystem.k_barrierWallFlags)
      if ((flags & b2ParticleSystem.k_barrierWallFlags) !== 0) {
        vel_data[i].SetZero();
      }
    }
    const tmax = b2_barrierCollisionTime * step.dt;
    const mass = this.GetParticleMass();
    for (let k = 0; k < this.m_pairBuffer.count; k++) {
      const pair = this.m_pairBuffer.data[k];
      if (pair.flags & b2ParticleFlag.b2_barrierParticle) {
        const a = pair.indexA;
        const b = pair.indexB;
        const pa = pos_data[a];
        const pb = pos_data[b];
        /// b2AABB aabb;
        const aabb = s_aabb;
        ///aabb.lowerBound = b2Min(pa, pb);
        b2Vec2.MinV(pa, pb, aabb.lowerBound);
        ///aabb.upperBound = b2Max(pa, pb);
        b2Vec2.MaxV(pa, pb, aabb.upperBound);
        const aGroup = this.m_groupBuffer[a];
        const bGroup = this.m_groupBuffer[b];
        ///b2Vec2 va = GetLinearVelocity(aGroup, a, pa);
        const va = this.GetLinearVelocity(aGroup, a, pa, s_va);
        ///b2Vec2 vb = GetLinearVelocity(bGroup, b, pb);
        const vb = this.GetLinearVelocity(bGroup, b, pb, s_vb);
        ///b2Vec2 pba = pb - pa;
        const pba = b2Vec2.SubVV(pb, pa, s_pba);
        ///b2Vec2 vba = vb - va;
        const vba = b2Vec2.SubVV(vb, va, s_vba);
        ///InsideBoundsEnumerator enumerator = GetInsideBoundsEnumerator(aabb);
        const enumerator = this.GetInsideBoundsEnumerator(aabb);
        let c: number;
        while ((c = enumerator.GetNext()) >= 0) {
          const pc = pos_data[c];
          const cGroup = this.m_groupBuffer[c];
          if (aGroup !== cGroup && bGroup !== cGroup) {
            ///b2Vec2 vc = GetLinearVelocity(cGroup, c, pc);
            const vc = this.GetLinearVelocity(cGroup, c, pc, s_vc);
            // Solve the equation below:
            //   (1-s)*(pa+t*va)+s*(pb+t*vb) = pc+t*vc
            // which expresses that the particle c will pass a line
            // connecting the particles a and b at the time of t.
            // if s is between 0 and 1, c will pass between a and b.
            ///b2Vec2 pca = pc - pa;
            const pca = b2Vec2.SubVV(pc, pa, s_pca);
            ///b2Vec2 vca = vc - va;
            const vca = b2Vec2.SubVV(vc, va, s_vca);
            const e2 = b2Vec2.CrossVV(vba, vca);
            const e1 = b2Vec2.CrossVV(pba, vca) - b2Vec2.CrossVV(pca, vba);
            const e0 = b2Vec2.CrossVV(pba, pca);
            let s: number, t: number;
            ///b2Vec2 qba, qca;
            const qba = s_qba,
              qca = s_qca;
            if (e2 === 0) {
              if (e1 === 0) { continue; }
              t = -e0 / e1;
              if (!(t >= 0 && t < tmax)) { continue; }
              ///qba = pba + t * vba;
              b2Vec2.AddVMulSV(pba, t, vba, qba);
              ///qca = pca + t * vca;
              b2Vec2.AddVMulSV(pca, t, vca, qca);
              s = b2Vec2.DotVV(qba, qca) / b2Vec2.DotVV(qba, qba);
              if (!(s >= 0 && s <= 1)) { continue; }
            } else {
              const det = e1 * e1 - 4 * e0 * e2;
              if (det < 0) { continue; }
              const sqrtDet = b2Sqrt(det);
              let t1 = (-e1 - sqrtDet) / (2 * e2);
              let t2 = (-e1 + sqrtDet) / (2 * e2);
              ///if (t1 > t2) b2Swap(t1, t2);
              if (t1 > t2) {
                const tmp = t1;
                t1 = t2;
                t2 = tmp;
              }
              t = t1;
              ///qba = pba + t * vba;
              b2Vec2.AddVMulSV(pba, t, vba, qba);
              ///qca = pca + t * vca;
              b2Vec2.AddVMulSV(pca, t, vca, qca);
              ///s = b2Dot(qba, qca) / b2Dot(qba, qba);
              s = b2Vec2.DotVV(qba, qca) / b2Vec2.DotVV(qba, qba);
              if (!(t >= 0 && t < tmax && s >= 0 && s <= 1)) {
                t = t2;
                if (!(t >= 0 && t < tmax)) { continue; }
                ///qba = pba + t * vba;
                b2Vec2.AddVMulSV(pba, t, vba, qba);
                ///qca = pca + t * vca;
                b2Vec2.AddVMulSV(pca, t, vca, qca);
                ///s = b2Dot(qba, qca) / b2Dot(qba, qba);
                s = b2Vec2.DotVV(qba, qca) / b2Vec2.DotVV(qba, qba);
                if (!(s >= 0 && s <= 1)) { continue; }
              }
            }
            // Apply a force to particle c so that it will have the
            // interpolated velocity at the collision point on line ab.
            ///b2Vec2 dv = va + s * vba - vc;
            const dv = s_dv;
            dv.x = va.x + s * vba.x - vc.x;
            dv.y = va.y + s * vba.y - vc.y;
            ///b2Vec2 f = GetParticleMass() * dv;
            const f = b2Vec2.MulSV(mass, dv, s_f);
            if (cGroup && this.IsRigidGroup(cGroup)) {
              // If c belongs to a rigid group, the force will be
              // distributed in the group.
              const mass = cGroup.GetMass();
              const inertia = cGroup.GetInertia();
              if (mass > 0) {
                ///cGroup.m_linearVelocity += 1 / mass * f;
                cGroup.m_linearVelocity.SelfMulAdd(1 / mass, f);
              }
              if (inertia > 0) {
                ///cGroup.m_angularVelocity += b2Cross(pc - cGroup.GetCenter(), f) / inertia;
                cGroup.m_angularVelocity += b2Vec2.CrossVV(
                  b2Vec2.SubVV(pc, cGroup.GetCenter(), b2Vec2.s_t0),
                  f) / inertia;
              }
            } else {
              ///m_velocityBuffer.data[c] += dv;
              vel_data[c].SelfAdd(dv);
            }
            // Apply a reversed force to particle c after particle
            // movement so that momentum will be preserved.
            ///ParticleApplyForce(c, -step.inv_dt * f);
            this.ParticleApplyForce(c, f.SelfMul(-step.inv_dt));
          }
        }
      }
    }
  }
  public static  SolveBarrier_s_aabb = new b2AABB();
  public static  SolveBarrier_s_va = new b2Vec2();
  public static  SolveBarrier_s_vb = new b2Vec2();
  public static  SolveBarrier_s_pba = new b2Vec2();
  public static  SolveBarrier_s_vba = new b2Vec2();
  public static  SolveBarrier_s_vc = new b2Vec2();
  public static  SolveBarrier_s_pca = new b2Vec2();
  public static  SolveBarrier_s_vca = new b2Vec2();
  public static  SolveBarrier_s_qba = new b2Vec2();
  public static  SolveBarrier_s_qca = new b2Vec2();
  public static  SolveBarrier_s_dv = new b2Vec2();
  public static  SolveBarrier_s_f = new b2Vec2();

  public SolveStaticPressure(step: b2TimeStep): void {
    this.m_staticPressureBuffer = this.RequestBuffer(this.m_staticPressureBuffer);
    const criticalPressure = this.GetCriticalPressure(step);
    const pressurePerWeight = this.m_def.staticPressureStrength * criticalPressure;
    const maxPressure = b2_maxParticlePressure * criticalPressure;
    const relaxation = this.m_def.staticPressureRelaxation;
    /// Compute pressure satisfying the modified Poisson equation:
    ///   Sum_for_j((p_i - p_j) * w_ij) + relaxation * p_i =
    ///   pressurePerWeight * (w_i - b2_minParticleWeight)
    /// by iterating the calculation:
    ///   p_i = (Sum_for_j(p_j * w_ij) + pressurePerWeight *
    ///         (w_i - b2_minParticleWeight)) / (w_i + relaxation)
    /// where
    ///   p_i and p_j are static pressure of particle i and j
    ///   w_ij is contact weight between particle i and j
    ///   w_i is sum of contact weight of particle i
    for (let t = 0; t < this.m_def.staticPressureIterations; t++) {
      ///memset(m_accumulationBuffer, 0, sizeof(*m_accumulationBuffer) * m_count);
      for (let i = 0; i < this.m_count; i++) {
        this.m_accumulationBuffer[i] = 0;
      }
      for (let k = 0; k < this.m_contactBuffer.count; k++) {
        const contact = this.m_contactBuffer.data[k];
        if (contact.flags & b2ParticleFlag.b2_staticPressureParticle) {
          const a = contact.indexA;
          const b = contact.indexB;
          const w = contact.weight;
          this.m_accumulationBuffer[a] += w * this.m_staticPressureBuffer[b]; // a <- b
          this.m_accumulationBuffer[b] += w * this.m_staticPressureBuffer[a]; // b <- a
        }
      }
      for (let i = 0; i < this.m_count; i++) {
        const w = this.m_weightBuffer[i];
        if (this.m_flagsBuffer.data[i] & b2ParticleFlag.b2_staticPressureParticle) {
          const wh = this.m_accumulationBuffer[i];
          const h =
            (wh + pressurePerWeight * (w - b2_minParticleWeight)) /
            (w + relaxation);
          this.m_staticPressureBuffer[i] = b2Clamp(h, 0.0, maxPressure);
        } else {
          this.m_staticPressureBuffer[i] = 0;
        }
      }
    }
  }

  public ComputeWeight(): void {
    // calculates the sum of contact-weights for each particle
    // that means dimensionless density
    ///memset(m_weightBuffer, 0, sizeof(*m_weightBuffer) * m_count);
    for (let k = 0; k < this.m_count; k++) {
      this.m_weightBuffer[k] = 0;
    }
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      const a = contact.index;
      const w = contact.weight;
      this.m_weightBuffer[a] += w;
    }
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      const a = contact.indexA;
      const b = contact.indexB;
      const w = contact.weight;
      this.m_weightBuffer[a] += w;
      this.m_weightBuffer[b] += w;
    }
  }

  public SolvePressure(step: b2TimeStep): void {
    const s_f = b2ParticleSystem.SolvePressure_s_f;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;
    // calculates pressure as a linear function of density
    const criticalPressure = this.GetCriticalPressure(step);
    const pressurePerWeight = this.m_def.pressureStrength * criticalPressure;
    const maxPressure = b2_maxParticlePressure * criticalPressure;
    for (let i = 0; i < this.m_count; i++) {
      const w = this.m_weightBuffer[i];
      const h = pressurePerWeight * b2Max(0.0, w - b2_minParticleWeight);
      this.m_accumulationBuffer[i] = b2Min(h, maxPressure);
    }
    // ignores particles which have their own repulsive force
    if (this.m_allParticleFlags & b2ParticleSystem.k_noPressureFlags) {
      for (let i = 0; i < this.m_count; i++) {
        if (this.m_flagsBuffer.data[i] & b2ParticleSystem.k_noPressureFlags) {
          this.m_accumulationBuffer[i] = 0;
        }
      }
    }
    // static pressure
    if (this.m_allParticleFlags & b2ParticleFlag.b2_staticPressureParticle) {
      // DEBUG: b2Assert(this.m_staticPressureBuffer !== null);
      for (let i = 0; i < this.m_count; i++) {
        if (this.m_flagsBuffer.data[i] & b2ParticleFlag.b2_staticPressureParticle) {
          this.m_accumulationBuffer[i] += this.m_staticPressureBuffer[i];
        }
      }
    }
    // applies pressure between each particles in contact
    const velocityPerPressure = step.dt / (this.m_def.density * this.m_particleDiameter);
    const inv_mass = this.GetParticleInvMass();
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      const a = contact.index;
      const b = contact.body;
      const w = contact.weight;
      const m = contact.mass;
      const n = contact.normal;
      const p = pos_data[a];
      const h = this.m_accumulationBuffer[a] + pressurePerWeight * w;
      ///b2Vec2 f = velocityPerPressure * w * m * h * n;
      const f = b2Vec2.MulSV(velocityPerPressure * w * m * h, n, s_f);
      ///m_velocityBuffer.data[a] -= GetParticleInvMass() * f;
      vel_data[a].SelfMulSub(inv_mass, f);
      b.ApplyLinearImpulse(f, p, true);
    }
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      const a = contact.indexA;
      const b = contact.indexB;
      const w = contact.weight;
      const n = contact.normal;
      const h = this.m_accumulationBuffer[a] + this.m_accumulationBuffer[b];
      ///b2Vec2 f = velocityPerPressure * w * h * n;
      const f = b2Vec2.MulSV(velocityPerPressure * w * h, n, s_f);
      ///m_velocityBuffer.data[a] -= f;
      vel_data[a].SelfSub(f);
      ///m_velocityBuffer.data[b] += f;
      vel_data[b].SelfAdd(f);
    }
  }
  public static  SolvePressure_s_f = new b2Vec2();

  public SolveDamping(step: b2TimeStep): void {
    const s_v = b2ParticleSystem.SolveDamping_s_v;
    const s_f = b2ParticleSystem.SolveDamping_s_f;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;
    // reduces normal velocity of each contact
    const linearDamping = this.m_def.dampingStrength;
    const quadraticDamping = 1 / this.GetCriticalVelocity(step);
    const inv_mass = this.GetParticleInvMass();
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      const a = contact.index;
      const b = contact.body;
      const w = contact.weight;
      const m = contact.mass;
      const n = contact.normal;
      const p = pos_data[a];
      ///b2Vec2 v = b.GetLinearVelocityFromWorldPoint(p) - m_velocityBuffer.data[a];
      const v = b2Vec2.SubVV(b.GetLinearVelocityFromWorldPoint(p, b2Vec2.s_t0), vel_data[a], s_v);
      const vn = b2Vec2.DotVV(v, n);
      if (vn < 0) {
        const damping = b2Max(linearDamping * w, b2Min(-quadraticDamping * vn, 0.5));
        ///b2Vec2 f = damping * m * vn * n;
        const f = b2Vec2.MulSV(damping * m * vn, n, s_f);
        ///m_velocityBuffer.data[a] += GetParticleInvMass() * f;
        vel_data[a].SelfMulAdd(inv_mass, f);
        ///b.ApplyLinearImpulse(-f, p, true);
        b.ApplyLinearImpulse(f.SelfNeg(), p, true);
      }
    }
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      const a = contact.indexA;
      const b = contact.indexB;
      const w = contact.weight;
      const n = contact.normal;
      ///b2Vec2 v = m_velocityBuffer.data[b] - m_velocityBuffer.data[a];
      const v = b2Vec2.SubVV(vel_data[b], vel_data[a], s_v);
      const vn = b2Vec2.DotVV(v, n);
      if (vn < 0) {
        ///float32 damping = b2Max(linearDamping * w, b2Min(- quadraticDamping * vn, 0.5f));
        const damping = b2Max(linearDamping * w, b2Min(-quadraticDamping * vn, 0.5));
        ///b2Vec2 f = damping * vn * n;
        const f = b2Vec2.MulSV(damping * vn, n, s_f);
        ///this.m_velocityBuffer.data[a] += f;
        vel_data[a].SelfAdd(f);
        ///this.m_velocityBuffer.data[b] -= f;
        vel_data[b].SelfSub(f);
      }
    }
  }
  public static  SolveDamping_s_v = new b2Vec2();
  public static  SolveDamping_s_f = new b2Vec2();

  public SolveRigidDamping(): void {
    const s_t0 = b2ParticleSystem.SolveRigidDamping_s_t0;
    const s_t1 = b2ParticleSystem.SolveRigidDamping_s_t1;
    const s_p = b2ParticleSystem.SolveRigidDamping_s_p;
    const s_v = b2ParticleSystem.SolveRigidDamping_s_v;
    const invMassA = [0.0],
      invInertiaA = [0.0],
      tangentDistanceA = [0.0]; // TODO: static
    const invMassB = [0.0],
      invInertiaB = [0.0],
      tangentDistanceB = [0.0]; // TODO: static
    // Apply impulse to rigid particle groups colliding with other objects
    // to reduce relative velocity at the colliding point.
    const pos_data = this.m_positionBuffer.data;
    const damping = this.m_def.dampingStrength;
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      const a = contact.index;
      const aGroup = this.m_groupBuffer[a];
      if (aGroup && this.IsRigidGroup(aGroup)) {
        const b = contact.body;
        const n = contact.normal;
        const w = contact.weight;
        const p = pos_data[a];
        ///b2Vec2 v = b.GetLinearVelocityFromWorldPoint(p) - aGroup.GetLinearVelocityFromWorldPoint(p);
        const v = b2Vec2.SubVV(b.GetLinearVelocityFromWorldPoint(p, s_t0), aGroup.GetLinearVelocityFromWorldPoint(p, s_t1), s_v);
        const vn = b2Vec2.DotVV(v, n);
        if (vn < 0) {
          // The group's average velocity at particle position 'p' is pushing
          // the particle into the body.
          ///this.InitDampingParameterWithRigidGroupOrParticle(&invMassA, &invInertiaA, &tangentDistanceA, true, aGroup, a, p, n);
          this.InitDampingParameterWithRigidGroupOrParticle(invMassA, invInertiaA, tangentDistanceA, true, aGroup, a, p, n);
          // Calculate b.m_I from public functions of b2Body.
          ///this.InitDampingParameter(&invMassB, &invInertiaB, &tangentDistanceB, b.GetMass(), b.GetInertia() - b.GetMass() * b.GetLocalCenter().LengthSquared(), b.GetWorldCenter(), p, n);
          this.InitDampingParameter(invMassB, invInertiaB, tangentDistanceB, b.GetMass(), b.GetInertia() - b.GetMass() * b.GetLocalCenter().LengthSquared(), b.GetWorldCenter(), p, n);
          ///float32 f = damping * b2Min(w, 1.0) * this.ComputeDampingImpulse(invMassA, invInertiaA, tangentDistanceA, invMassB, invInertiaB, tangentDistanceB, vn);
          const f = damping * b2Min(w, 1.0) * this.ComputeDampingImpulse(invMassA[0], invInertiaA[0], tangentDistanceA[0], invMassB[0], invInertiaB[0], tangentDistanceB[0], vn);
          ///this.ApplyDamping(invMassA, invInertiaA, tangentDistanceA, true, aGroup, a, f, n);
          this.ApplyDamping(invMassA[0], invInertiaA[0], tangentDistanceA[0], true, aGroup, a, f, n);
          ///b.ApplyLinearImpulse(-f * n, p, true);
          b.ApplyLinearImpulse(b2Vec2.MulSV(-f, n, b2Vec2.s_t0), p, true);
        }
      }
    }
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      const a = contact.indexA;
      const b = contact.indexB;
      const n = contact.normal;
      const w = contact.weight;
      const aGroup = this.m_groupBuffer[a];
      const bGroup = this.m_groupBuffer[b];
      const aRigid = this.IsRigidGroup(aGroup);
      const bRigid = this.IsRigidGroup(bGroup);
      if (aGroup !== bGroup && (aRigid || bRigid)) {
        ///b2Vec2 p = 0.5f * (this.m_positionBuffer.data[a] + this.m_positionBuffer.data[b]);
        const p = b2Vec2.MidVV(pos_data[a], pos_data[b], s_p);
        ///b2Vec2 v = GetLinearVelocity(bGroup, b, p) - GetLinearVelocity(aGroup, a, p);
        const v = b2Vec2.SubVV(this.GetLinearVelocity(bGroup, b, p, s_t0), this.GetLinearVelocity(aGroup, a, p, s_t1), s_v);
        const vn = b2Vec2.DotVV(v, n);
        if (vn < 0) {
          ///this.InitDampingParameterWithRigidGroupOrParticle(&invMassA, &invInertiaA, &tangentDistanceA, aRigid, aGroup, a, p, n);
          this.InitDampingParameterWithRigidGroupOrParticle(invMassA, invInertiaA, tangentDistanceA, aRigid, aGroup, a, p, n);
          ///this.InitDampingParameterWithRigidGroupOrParticle(&invMassB, &invInertiaB, &tangentDistanceB, bRigid, bGroup, b, p, n);
          this.InitDampingParameterWithRigidGroupOrParticle(invMassB, invInertiaB, tangentDistanceB, bRigid, bGroup, b, p, n);
          ///float32 f = damping * w * this.ComputeDampingImpulse(invMassA, invInertiaA, tangentDistanceA, invMassB, invInertiaB, tangentDistanceB, vn);
          const f = damping * w * this.ComputeDampingImpulse(invMassA[0], invInertiaA[0], tangentDistanceA[0], invMassB[0], invInertiaB[0], tangentDistanceB[0], vn);
          ///this.ApplyDamping(invMassA, invInertiaA, tangentDistanceA, aRigid, aGroup, a, f, n);
          this.ApplyDamping(invMassA[0], invInertiaA[0], tangentDistanceA[0], aRigid, aGroup, a, f, n);
          ///this.ApplyDamping(invMassB, invInertiaB, tangentDistanceB, bRigid, bGroup, b, -f, n);
          this.ApplyDamping(invMassB[0], invInertiaB[0], tangentDistanceB[0], bRigid, bGroup, b, -f, n);
        }
      }
    }
  }
  public static  SolveRigidDamping_s_t0 = new b2Vec2();
  public static  SolveRigidDamping_s_t1 = new b2Vec2();
  public static  SolveRigidDamping_s_p = new b2Vec2();
  public static  SolveRigidDamping_s_v = new b2Vec2();

  public SolveExtraDamping(): void {
    const s_v = b2ParticleSystem.SolveExtraDamping_s_v;
    const s_f = b2ParticleSystem.SolveExtraDamping_s_f;
    const vel_data = this.m_velocityBuffer.data;
    // Applies additional damping force between bodies and particles which can
    // produce strong repulsive force. Applying damping force multiple times
    // is effective in suppressing vibration.
    const pos_data = this.m_positionBuffer.data;
    const inv_mass = this.GetParticleInvMass();
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      const a = contact.index;
      if (this.m_flagsBuffer.data[a] & b2ParticleSystem.k_extraDampingFlags) {
        const b = contact.body;
        const m = contact.mass;
        const n = contact.normal;
        const p = pos_data[a];
        ///b2Vec2 v = b.GetLinearVelocityFromWorldPoint(p) - m_velocityBuffer.data[a];
        const v = b2Vec2.SubVV(b.GetLinearVelocityFromWorldPoint(p, b2Vec2.s_t0), vel_data[a], s_v);
        ///float32 vn = b2Dot(v, n);
        const vn = b2Vec2.DotVV(v, n);
        if (vn < 0) {
          ///b2Vec2 f = 0.5f * m * vn * n;
          const f = b2Vec2.MulSV(0.5 * m * vn, n, s_f);
          ///m_velocityBuffer.data[a] += GetParticleInvMass() * f;
          vel_data[a].SelfMulAdd(inv_mass, f);
          ///b.ApplyLinearImpulse(-f, p, true);
          b.ApplyLinearImpulse(f.SelfNeg(), p, true);
        }
      }
    }
  }
  public static  SolveExtraDamping_s_v = new b2Vec2();
  public static  SolveExtraDamping_s_f = new b2Vec2();

  public SolveWall(): void {
    const vel_data = this.m_velocityBuffer.data;
    for (let i = 0; i < this.m_count; i++) {
      if (this.m_flagsBuffer.data[i] & b2ParticleFlag.b2_wallParticle) {
        vel_data[i].SetZero();
      }
    }
  }

  public SolveRigid(step: b2TimeStep): void {
    const s_position = b2ParticleSystem.SolveRigid_s_position;
    const s_rotation = b2ParticleSystem.SolveRigid_s_rotation;
    const s_transform = b2ParticleSystem.SolveRigid_s_transform;
    const s_velocityTransform = b2ParticleSystem.SolveRigid_s_velocityTransform;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;
    for (let group = this.m_groupList; group; group = group.GetNext()) {
      if (group.m_groupFlags & b2ParticleGroupFlag.b2_rigidParticleGroup) {
        group.UpdateStatistics();
        ///b2Rot rotation(step.dt * group.m_angularVelocity);
        const rotation = s_rotation;
        rotation.SetAngle(step.dt * group.m_angularVelocity);
        ///b2Transform transform(group.m_center + step.dt * group.m_linearVelocity - b2Mul(rotation, group.m_center), rotation);
        const position = b2Vec2.AddVV(
          group.m_center,
          b2Vec2.SubVV(
            b2Vec2.MulSV(step.dt, group.m_linearVelocity, b2Vec2.s_t0),
            b2Rot.MulRV(rotation, group.m_center, b2Vec2.s_t1),
            b2Vec2.s_t0),
          s_position);
        const transform = s_transform;
        transform.SetPositionRotation(position, rotation);
        ///group.m_transform = b2Mul(transform, group.m_transform);
        b2Transform.MulXX(transform, group.m_transform, group.m_transform);
        const velocityTransform = s_velocityTransform;
        velocityTransform.p.x = step.inv_dt * transform.p.x;
        velocityTransform.p.y = step.inv_dt * transform.p.y;
        velocityTransform.q.s = step.inv_dt * transform.q.s;
        velocityTransform.q.c = step.inv_dt * (transform.q.c - 1);
        for (let i = group.m_firstIndex; i < group.m_lastIndex; i++) {
          ///m_velocityBuffer.data[i] = b2Mul(velocityTransform, m_positionBuffer.data[i]);
          b2Transform.MulXV(velocityTransform, pos_data[i], vel_data[i]);
        }
      }
    }
  }
  public static  SolveRigid_s_position = new b2Vec2();
  public static  SolveRigid_s_rotation = new b2Rot();
  public static  SolveRigid_s_transform = new b2Transform();
  public static  SolveRigid_s_velocityTransform = new b2Transform();

  public SolveElastic(step: b2TimeStep): void {
    const s_pa = b2ParticleSystem.SolveElastic_s_pa;
    const s_pb = b2ParticleSystem.SolveElastic_s_pb;
    const s_pc = b2ParticleSystem.SolveElastic_s_pc;
    const s_r = b2ParticleSystem.SolveElastic_s_r;
    const s_t0 = b2ParticleSystem.SolveElastic_s_t0;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;
    const elasticStrength = step.inv_dt * this.m_def.elasticStrength;
    for (let k = 0; k < this.m_triadBuffer.count; k++) {
      const triad = this.m_triadBuffer.data[k];
      if (triad.flags & b2ParticleFlag.b2_elasticParticle) {
        const a = triad.indexA;
        const b = triad.indexB;
        const c = triad.indexC;
        const oa = triad.pa;
        const ob = triad.pb;
        const oc = triad.pc;
        ///b2Vec2 pa = m_positionBuffer.data[a];
        const pa = s_pa.Copy(pos_data[a]);
        ///b2Vec2 pb = m_positionBuffer.data[b];
        const pb = s_pb.Copy(pos_data[b]);
        ///b2Vec2 pc = m_positionBuffer.data[c];
        const pc = s_pc.Copy(pos_data[c]);
        const va = vel_data[a];
        const vb = vel_data[b];
        const vc = vel_data[c];
        ///pa += step.dt * va;
        pa.SelfMulAdd(step.dt, va);
        ///pb += step.dt * vb;
        pb.SelfMulAdd(step.dt, vb);
        ///pc += step.dt * vc;
        pc.SelfMulAdd(step.dt, vc);
        ///b2Vec2 midPoint = (float32) 1 / 3 * (pa + pb + pc);
        const midPoint_x = (pa.x + pb.x + pc.x) / 3.0;
        const midPoint_y = (pa.y + pb.y + pc.y) / 3.0;
        ///pa -= midPoint;
        pa.x -= midPoint_x;
        pa.y -= midPoint_y;
        ///pb -= midPoint;
        pb.x -= midPoint_x;
        pb.y -= midPoint_y;
        ///pc -= midPoint;
        pc.x -= midPoint_x;
        pc.y -= midPoint_y;
        ///b2Rot r;
        const r = s_r;
        r.s = b2Vec2.CrossVV(oa, pa) + b2Vec2.CrossVV(ob, pb) + b2Vec2.CrossVV(oc, pc);
        r.c = b2Vec2.DotVV(oa, pa) + b2Vec2.DotVV(ob, pb) + b2Vec2.DotVV(oc, pc);
        const r2 = r.s * r.s + r.c * r.c;
        let invR = b2InvSqrt(r2);
        if (!isFinite(invR)) {
          invR = 1.98177537e+019;
        }
        r.s *= invR;
        r.c *= invR;
        ///r.angle = Math.atan2(r.s, r.c); // TODO: optimize
        const strength = elasticStrength * triad.strength;
        ///va += strength * (b2Mul(r, oa) - pa);
        b2Rot.MulRV(r, oa, s_t0);
        b2Vec2.SubVV(s_t0, pa, s_t0);
        b2Vec2.MulSV(strength, s_t0, s_t0);
        va.SelfAdd(s_t0);
        ///vb += strength * (b2Mul(r, ob) - pb);
        b2Rot.MulRV(r, ob, s_t0);
        b2Vec2.SubVV(s_t0, pb, s_t0);
        b2Vec2.MulSV(strength, s_t0, s_t0);
        vb.SelfAdd(s_t0);
        ///vc += strength * (b2Mul(r, oc) - pc);
        b2Rot.MulRV(r, oc, s_t0);
        b2Vec2.SubVV(s_t0, pc, s_t0);
        b2Vec2.MulSV(strength, s_t0, s_t0);
        vc.SelfAdd(s_t0);
      }
    }
  }
  public static  SolveElastic_s_pa = new b2Vec2();
  public static  SolveElastic_s_pb = new b2Vec2();
  public static  SolveElastic_s_pc = new b2Vec2();
  public static  SolveElastic_s_r = new b2Rot();
  public static  SolveElastic_s_t0 = new b2Vec2();

  public SolveSpring(step: b2TimeStep): void {
    const s_pa = b2ParticleSystem.SolveSpring_s_pa;
    const s_pb = b2ParticleSystem.SolveSpring_s_pb;
    const s_d = b2ParticleSystem.SolveSpring_s_d;
    const s_f = b2ParticleSystem.SolveSpring_s_f;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;
    const springStrength = step.inv_dt * this.m_def.springStrength;
    for (let k = 0; k < this.m_pairBuffer.count; k++) {
      const pair = this.m_pairBuffer.data[k];
      if (pair.flags & b2ParticleFlag.b2_springParticle) {
        ///int32 a = pair.indexA;
        const a = pair.indexA;
        ///int32 b = pair.indexB;
        const b = pair.indexB;
        ///b2Vec2 pa = m_positionBuffer.data[a];
        const pa = s_pa.Copy(pos_data[a]);
        ///b2Vec2 pb = m_positionBuffer.data[b];
        const pb = s_pb.Copy(pos_data[b]);
        ///b2Vec2& va = m_velocityBuffer.data[a];
        const va = vel_data[a];
        ///b2Vec2& vb = m_velocityBuffer.data[b];
        const vb = vel_data[b];
        ///pa += step.dt * va;
        pa.SelfMulAdd(step.dt, va);
        ///pb += step.dt * vb;
        pb.SelfMulAdd(step.dt, vb);
        ///b2Vec2 d = pb - pa;
        const d = b2Vec2.SubVV(pb, pa, s_d);
        ///float32 r0 = pair.distance;
        const r0 = pair.distance;
        ///float32 r1 = d.Length();
        const r1 = d.Length();
        ///float32 strength = springStrength * pair.strength;
        const strength = springStrength * pair.strength;
        ///b2Vec2 f = strength * (r0 - r1) / r1 * d;
        const f = b2Vec2.MulSV(strength * (r0 - r1) / r1, d, s_f);
        ///va -= f;
        va.SelfSub(f);
        ///vb += f;
        vb.SelfAdd(f);
      }
    }
  }
  public static  SolveSpring_s_pa = new b2Vec2();
  public static  SolveSpring_s_pb = new b2Vec2();
  public static  SolveSpring_s_d = new b2Vec2();
  public static  SolveSpring_s_f = new b2Vec2();

  public SolveTensile(step: b2TimeStep): void {
    const s_weightedNormal = b2ParticleSystem.SolveTensile_s_weightedNormal;
    const s_s = b2ParticleSystem.SolveTensile_s_s;
    const s_f = b2ParticleSystem.SolveTensile_s_f;
    const vel_data = this.m_velocityBuffer.data;
    // DEBUG: b2Assert(this.m_accumulation2Buffer !== null);
    for (let i = 0; i < this.m_count; i++) {
      this.m_accumulation2Buffer[i] = new b2Vec2();
      this.m_accumulation2Buffer[i].SetZero();
    }
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      if (contact.flags & b2ParticleFlag.b2_tensileParticle) {
        const a = contact.indexA;
        const b = contact.indexB;
        const w = contact.weight;
        const n = contact.normal;
        ///b2Vec2 weightedNormal = (1 - w) * w * n;
        const weightedNormal = b2Vec2.MulSV((1 - w) * w, n, s_weightedNormal);
        ///m_accumulation2Buffer[a] -= weightedNormal;
        this.m_accumulation2Buffer[a].SelfSub(weightedNormal);
        ///m_accumulation2Buffer[b] += weightedNormal;
        this.m_accumulation2Buffer[b].SelfAdd(weightedNormal);
      }
    }
    const criticalVelocity = this.GetCriticalVelocity(step);
    const pressureStrength = this.m_def.surfaceTensionPressureStrength * criticalVelocity;
    const normalStrength = this.m_def.surfaceTensionNormalStrength * criticalVelocity;
    const maxVelocityVariation = b2_maxParticleForce * criticalVelocity;
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      if (contact.flags & b2ParticleFlag.b2_tensileParticle) {
        const a = contact.indexA;
        const b = contact.indexB;
        const w = contact.weight;
        const n = contact.normal;
        const h = this.m_weightBuffer[a] + this.m_weightBuffer[b];
        ///b2Vec2 s = m_accumulation2Buffer[b] - m_accumulation2Buffer[a];
        const s = b2Vec2.SubVV(this.m_accumulation2Buffer[b], this.m_accumulation2Buffer[a], s_s);
        const fn = b2Min(
          pressureStrength * (h - 2) + normalStrength * b2Vec2.DotVV(s, n),
          maxVelocityVariation) * w;
        ///b2Vec2 f = fn * n;
        const f = b2Vec2.MulSV(fn, n, s_f);
        ///m_velocityBuffer.data[a] -= f;
        vel_data[a].SelfSub(f);
        ///m_velocityBuffer.data[b] += f;
        vel_data[b].SelfAdd(f);
      }
    }
  }
  public static  SolveTensile_s_weightedNormal = new b2Vec2();
  public static  SolveTensile_s_s = new b2Vec2();
  public static  SolveTensile_s_f = new b2Vec2();

  public SolveViscous(): void {
    const s_v = b2ParticleSystem.SolveViscous_s_v;
    const s_f = b2ParticleSystem.SolveViscous_s_f;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;
    const viscousStrength = this.m_def.viscousStrength;
    const inv_mass = this.GetParticleInvMass();
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      const a = contact.index;
      if (this.m_flagsBuffer.data[a] & b2ParticleFlag.b2_viscousParticle) {
        const b = contact.body;
        const w = contact.weight;
        const m = contact.mass;
        const p = pos_data[a];
        ///b2Vec2 v = b.GetLinearVelocityFromWorldPoint(p) - m_velocityBuffer.data[a];
        const v = b2Vec2.SubVV(b.GetLinearVelocityFromWorldPoint(p, b2Vec2.s_t0), vel_data[a], s_v);
        ///b2Vec2 f = viscousStrength * m * w * v;
        const f = b2Vec2.MulSV(viscousStrength * m * w, v, s_f);
        ///m_velocityBuffer.data[a] += GetParticleInvMass() * f;
        vel_data[a].SelfMulAdd(inv_mass, f);
        ///b.ApplyLinearImpulse(-f, p, true);
        b.ApplyLinearImpulse(f.SelfNeg(), p, true);
      }
    }
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      if (contact.flags & b2ParticleFlag.b2_viscousParticle) {
        const a = contact.indexA;
        const b = contact.indexB;
        const w = contact.weight;
        ///b2Vec2 v = m_velocityBuffer.data[b] - m_velocityBuffer.data[a];
        const v = b2Vec2.SubVV(vel_data[b], vel_data[a], s_v);
        ///b2Vec2 f = viscousStrength * w * v;
        const f = b2Vec2.MulSV(viscousStrength * w, v, s_f);
        ///m_velocityBuffer.data[a] += f;
        vel_data[a].SelfAdd(f);
        ///m_velocityBuffer.data[b] -= f;
        vel_data[b].SelfSub(f);
      }
    }
  }
  public static  SolveViscous_s_v = new b2Vec2();
  public static  SolveViscous_s_f = new b2Vec2();

  public SolveRepulsive(step: b2TimeStep): void {
    const s_f = b2ParticleSystem.SolveRepulsive_s_f;
    const vel_data = this.m_velocityBuffer.data;
    const repulsiveStrength = this.m_def.repulsiveStrength * this.GetCriticalVelocity(step);
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      if (contact.flags & b2ParticleFlag.b2_repulsiveParticle) {
        const a = contact.indexA;
        const b = contact.indexB;
        if (this.m_groupBuffer[a] !== this.m_groupBuffer[b]) {
          const w = contact.weight;
          const n = contact.normal;
          ///b2Vec2 f = repulsiveStrength * w * n;
          const f = b2Vec2.MulSV(repulsiveStrength * w, n, s_f);
          ///m_velocityBuffer.data[a] -= f;
          vel_data[a].SelfSub(f);
          ///m_velocityBuffer.data[b] += f;
          vel_data[b].SelfAdd(f);
        }
      }
    }
  }
  public static  SolveRepulsive_s_f = new b2Vec2();

  public SolvePowder(step: b2TimeStep): void {
    const s_f = b2ParticleSystem.SolvePowder_s_f;
    const pos_data = this.m_positionBuffer.data;
    const vel_data = this.m_velocityBuffer.data;
    const powderStrength = this.m_def.powderStrength * this.GetCriticalVelocity(step);
    const minWeight = 1.0 - b2_particleStride;
    const inv_mass = this.GetParticleInvMass();
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      const a = contact.index;
      if (this.m_flagsBuffer.data[a] & b2ParticleFlag.b2_powderParticle) {
        const w = contact.weight;
        if (w > minWeight) {
          const b = contact.body;
          const m = contact.mass;
          const p = pos_data[a];
          const n = contact.normal;
          const f = b2Vec2.MulSV(powderStrength * m * (w - minWeight), n, s_f);
          vel_data[a].SelfMulSub(inv_mass, f);
          b.ApplyLinearImpulse(f, p, true);
        }
      }
    }
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      if (contact.flags & b2ParticleFlag.b2_powderParticle) {
        const w = contact.weight;
        if (w > minWeight) {
          const a = contact.indexA;
          const b = contact.indexB;
          const n = contact.normal;
          const f = b2Vec2.MulSV(powderStrength * (w - minWeight), n, s_f);
          vel_data[a].SelfSub(f);
          vel_data[b].SelfAdd(f);
        }
      }
    }
  }
  public static  SolvePowder_s_f = new b2Vec2();

  public SolveSolid(step: b2TimeStep): void {
    const s_f = b2ParticleSystem.SolveSolid_s_f;
    const vel_data = this.m_velocityBuffer.data;
    // applies extra repulsive force from solid particle groups
    this.m_depthBuffer = this.RequestBuffer(this.m_depthBuffer);
    const ejectionStrength = step.inv_dt * this.m_def.ejectionStrength;
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      const a = contact.indexA;
      const b = contact.indexB;
      if (this.m_groupBuffer[a] !== this.m_groupBuffer[b]) {
        const w = contact.weight;
        const n = contact.normal;
        const h = this.m_depthBuffer[a] + this.m_depthBuffer[b];
        const f = b2Vec2.MulSV(ejectionStrength * h * w, n, s_f);
        vel_data[a].SelfSub(f);
        vel_data[b].SelfAdd(f);
      }
    }
  }
  public static  SolveSolid_s_f = new b2Vec2();

  public SolveForce(step: b2TimeStep): void {
    const vel_data = this.m_velocityBuffer.data;
    const velocityPerForce = step.dt * this.GetParticleInvMass();
    for (let i = 0; i < this.m_count; i++) {
      ///m_velocityBuffer.data[i] += velocityPerForce * m_forceBuffer[i];
      vel_data[i].SelfMulAdd(velocityPerForce, this.m_forceBuffer[i]);
    }
    this.m_hasForce = false;
  }

  public SolveColorMixing(): void {
    // mixes color between contacting particles
    const colorMixing = 0.5 * this.m_def.colorMixingStrength;
    if (colorMixing) {
      for (let k = 0; k < this.m_contactBuffer.count; k++) {
        const contact = this.m_contactBuffer.data[k];
        const a = contact.indexA;
        const b = contact.indexB;
        if (this.m_flagsBuffer.data[a] & this.m_flagsBuffer.data[b] &
          b2ParticleFlag.b2_colorMixingParticle) {
          const colorA = this.m_colorBuffer.data[a];
          const colorB = this.m_colorBuffer.data[b];
          // Use the static method to ensure certain compilers inline
          // this correctly.
          b2Color.MixColors(colorA, colorB, colorMixing);
        }
      }
    }
  }

  public SolveZombie(): void {
    // removes particles with zombie flag
    let newCount = 0;
    const newIndices: number[] = []; // TODO: static
    for (let i = 0; i < this.m_count; i++) {
      newIndices[i] = b2_invalidParticleIndex;
    }
    // DEBUG: b2Assert(newIndices.length === this.m_count);
    let allParticleFlags = 0;
    for (let i = 0; i < this.m_count; i++) {
      const flags = this.m_flagsBuffer.data[i];
      if (flags & b2ParticleFlag.b2_zombieParticle) {
        const destructionListener = this.m_world.m_destructionListener;
        if ((flags & b2ParticleFlag.b2_destructionListenerParticle) && destructionListener) {
          destructionListener.SayGoodbyeParticle(this, i);
        }
        // Destroy particle handle.
        if (this.m_handleIndexBuffer.data) {
          const handle = this.m_handleIndexBuffer.data[i];
          if (handle) {
            handle.SetIndex(b2_invalidParticleIndex);
            this.m_handleIndexBuffer.data[i] = null;
            ///m_handleAllocator.Free(handle);
          }
        }
        newIndices[i] = b2_invalidParticleIndex;
      } else {
        newIndices[i] = newCount;
        if (i !== newCount) {
          // Update handle to reference new particle index.
          if (this.m_handleIndexBuffer.data) {
            const handle = this.m_handleIndexBuffer.data[i];
            if (handle) { handle.SetIndex(newCount); }
            this.m_handleIndexBuffer.data[newCount] = handle;
          }
          this.m_flagsBuffer.data[newCount] = this.m_flagsBuffer.data[i];
          if (this.m_lastBodyContactStepBuffer.data) {
            this.m_lastBodyContactStepBuffer.data[newCount] = this.m_lastBodyContactStepBuffer.data[i];
          }
          if (this.m_bodyContactCountBuffer.data) {
            this.m_bodyContactCountBuffer.data[newCount] = this.m_bodyContactCountBuffer.data[i];
          }
          if (this.m_consecutiveContactStepsBuffer.data) {
            this.m_consecutiveContactStepsBuffer.data[newCount] = this.m_consecutiveContactStepsBuffer.data[i];
          }
          this.m_positionBuffer.data[newCount].Copy(this.m_positionBuffer.data[i]);
          this.m_velocityBuffer.data[newCount].Copy(this.m_velocityBuffer.data[i]);
          this.m_groupBuffer[newCount] = this.m_groupBuffer[i];
          if (this.m_hasForce) {
            this.m_forceBuffer[newCount].Copy(this.m_forceBuffer[i]);
          }
          if (this.m_staticPressureBuffer) {
            this.m_staticPressureBuffer[newCount] = this.m_staticPressureBuffer[i];
          }
          if (this.m_depthBuffer) {
            this.m_depthBuffer[newCount] = this.m_depthBuffer[i];
          }
          if (this.m_colorBuffer.data) {
            this.m_colorBuffer.data[newCount].Copy(this.m_colorBuffer.data[i]);
          }
          if (this.m_userDataBuffer.data) {
            this.m_userDataBuffer.data[newCount] = this.m_userDataBuffer.data[i];
          }
          if (this.m_expirationTimeBuffer.data) {
            this.m_expirationTimeBuffer.data[newCount] = this.m_expirationTimeBuffer.data[i];
          }
        }
        newCount++;
        allParticleFlags |= flags;
      }
    }

    // predicate functions
    const Test = {
      ///static bool IsProxyInvalid(const Proxy& proxy)
      IsProxyInvalid: (proxy: b2ParticleSystem_Proxy) => {
        return proxy.index < 0;
      },
      ///static bool IsContactInvalid(const b2ParticleContact& contact)
      IsContactInvalid: (contact: b2ParticleContact) => {
        return contact.indexA < 0 || contact.indexB < 0;
      },
      ///static bool IsBodyContactInvalid(const b2ParticleBodyContact& contact)
      IsBodyContactInvalid: (contact: b2ParticleBodyContact) => {
        return contact.index < 0;
      },
      ///static bool IsPairInvalid(const b2ParticlePair& pair)
      IsPairInvalid: (pair: b2ParticlePair) => {
        return pair.indexA < 0 || pair.indexB < 0;
      },
      ///static bool IsTriadInvalid(const b2ParticleTriad& triad)
      IsTriadInvalid: (triad: b2ParticleTriad) => {
        return triad.indexA < 0 || triad.indexB < 0 || triad.indexC < 0;
      },
    };

    // update proxies
    for (let k = 0; k < this.m_proxyBuffer.count; k++) {
      const proxy = this.m_proxyBuffer.data[k];
      proxy.index = newIndices[proxy.index];
    }
    this.m_proxyBuffer.RemoveIf(Test.IsProxyInvalid);

    // update contacts
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      contact.indexA = newIndices[contact.indexA];
      contact.indexB = newIndices[contact.indexB];
    }
    this.m_contactBuffer.RemoveIf(Test.IsContactInvalid);

    // update particle-body contacts
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      contact.index = newIndices[contact.index];
    }
    this.m_bodyContactBuffer.RemoveIf(Test.IsBodyContactInvalid);

    // update pairs
    for (let k = 0; k < this.m_pairBuffer.count; k++) {
      const pair = this.m_pairBuffer.data[k];
      pair.indexA = newIndices[pair.indexA];
      pair.indexB = newIndices[pair.indexB];
    }
    this.m_pairBuffer.RemoveIf(Test.IsPairInvalid);

    // update triads
    for (let k = 0; k < this.m_triadBuffer.count; k++) {
      const triad = this.m_triadBuffer.data[k];
      triad.indexA = newIndices[triad.indexA];
      triad.indexB = newIndices[triad.indexB];
      triad.indexC = newIndices[triad.indexC];
    }
    this.m_triadBuffer.RemoveIf(Test.IsTriadInvalid);

    // Update lifetime indices.
    if (this.m_indexByExpirationTimeBuffer.data) {
      let writeOffset = 0;
      for (let readOffset = 0; readOffset < this.m_count; readOffset++) {
        const newIndex = newIndices[this.m_indexByExpirationTimeBuffer.data[readOffset]];
        if (newIndex !== b2_invalidParticleIndex) {
          this.m_indexByExpirationTimeBuffer.data[writeOffset++] = newIndex;
        }
      }
    }

    // update groups
    for (let group = this.m_groupList; group; group = group.GetNext()) {
      let firstIndex = newCount;
      let lastIndex = 0;
      let modified = false;
      for (let i = group.m_firstIndex; i < group.m_lastIndex; i++) {
        const j = newIndices[i];
        if (j >= 0) {
          firstIndex = b2Min(firstIndex, j);
          lastIndex = b2Max(lastIndex, j + 1);
        } else {
          modified = true;
        }
      }
      if (firstIndex < lastIndex) {
        group.m_firstIndex = firstIndex;
        group.m_lastIndex = lastIndex;
        if (modified) {
          if (group.m_groupFlags & b2ParticleGroupFlag.b2_solidParticleGroup) {
            this.SetGroupFlags(group, group.m_groupFlags | b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth);
          }
        }
      } else {
        group.m_firstIndex = 0;
        group.m_lastIndex = 0;
        if (!(group.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupCanBeEmpty)) {
          this.SetGroupFlags(group, group.m_groupFlags | b2ParticleGroupFlag.b2_particleGroupWillBeDestroyed);
        }
      }
    }

    // update particle count
    this.m_count = newCount;
    this.m_allParticleFlags = allParticleFlags;
    this.m_needsUpdateAllParticleFlags = false;

    // destroy bodies with no particles
    for (let group = this.m_groupList; group; ) {
      const next = group.GetNext();
      if (group.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupWillBeDestroyed) {
        this.DestroyParticleGroup(group);
      }
      group = next;
    }
  }

  /**
   * Destroy all particles which have outlived their lifetimes set
   * by SetParticleLifetime().
   */
  public SolveLifetimes(step: b2TimeStep): void {
    // Update the time elapsed.
    this.m_timeElapsed = this.LifetimeToExpirationTime(step.dt);
    // Get the floor (non-fractional component) of the elapsed time.
    const quantizedTimeElapsed = this.GetQuantizedTimeElapsed();

    const expirationTimes = this.m_expirationTimeBuffer.data;
    const expirationTimeIndices = this.m_indexByExpirationTimeBuffer.data;
    const particleCount = this.GetParticleCount();
    // Sort the lifetime buffer if it's required.
    if (this.m_expirationTimeBufferRequiresSorting) {
      ///const ExpirationTimeComparator expirationTimeComparator(expirationTimes);
      ///std::sort(expirationTimeIndices, expirationTimeIndices + particleCount, expirationTimeComparator);

      /**
       * Compare the lifetime of particleIndexA and particleIndexB
       * returning true if the lifetime of A is greater than B for
       * particles that will expire.  If either particle's lifetime is
       * infinite (<= 0.0f) this function return true if the lifetime
       * of A is lesser than B. When used with std::sort() this
       * results in an array of particle indicies sorted in reverse
       * order by particle lifetime.
       *
       * For example, the set of lifetimes
       * (1.0, 0.7, 0.3, 0.0, -1.0, 2.0)
       * would be sorted as
       * (0.0, 1.0, -2.0, 1.0, 0.7, 0.3)
       */
      const ExpirationTimeComparator = (particleIndexA: number, particleIndexB: number): boolean => {
        const expirationTimeA = expirationTimes[particleIndexA];
        const expirationTimeB = expirationTimes[particleIndexB];
        const infiniteExpirationTimeA = expirationTimeA <= 0.0;
        const infiniteExpirationTimeB = expirationTimeB <= 0.0;
        return infiniteExpirationTimeA === infiniteExpirationTimeB ?
          expirationTimeA > expirationTimeB : infiniteExpirationTimeA;
      };

      std_sort(expirationTimeIndices, 0, particleCount, ExpirationTimeComparator);

      this.m_expirationTimeBufferRequiresSorting = false;
    }

    // Destroy particles which have expired.
    for (let i = particleCount - 1; i >= 0; --i) {
      const particleIndex = expirationTimeIndices[i];
      const expirationTime = expirationTimes[particleIndex];
      // If no particles need to be destroyed, skip this.
      if (quantizedTimeElapsed < expirationTime || expirationTime <= 0) {
        break;
      }
      // Destroy this particle.
      this.DestroyParticle(particleIndex);
    }
  }

  public RotateBuffer(start: number, mid: number, end: number): void {
    // move the particles assigned to the given group toward the end of array
    if (start === mid || mid === end) {
      return;
    }
    // DEBUG: b2Assert(mid >= start && mid <= end);

    function newIndices(i: number): number {
      if (i < start) {
        return i;
      } else if (i < mid) {
        return i + end - mid;
      } else if (i < end) {
        return i + start - mid;
      } else {
        return i;
      }
    }

    ///std::rotate(m_flagsBuffer.data + start, m_flagsBuffer.data + mid, m_flagsBuffer.data + end);
    std_rotate(this.m_flagsBuffer.data, start, mid, end);
    if (this.m_lastBodyContactStepBuffer.data) {
      ///std::rotate(m_lastBodyContactStepBuffer.data + start, m_lastBodyContactStepBuffer.data + mid, m_lastBodyContactStepBuffer.data + end);
      std_rotate(this.m_lastBodyContactStepBuffer.data, start, mid, end);
    }
    if (this.m_bodyContactCountBuffer.data) {
      ///std::rotate(m_bodyContactCountBuffer.data + start, m_bodyContactCountBuffer.data + mid, m_bodyContactCountBuffer.data + end);
      std_rotate(this.m_bodyContactCountBuffer.data, start, mid, end);
    }
    if (this.m_consecutiveContactStepsBuffer.data) {
      ///std::rotate(m_consecutiveContactStepsBuffer.data + start, m_consecutiveContactStepsBuffer.data + mid, m_consecutiveContactStepsBuffer.data + end);
      std_rotate(this.m_consecutiveContactStepsBuffer.data, start, mid, end);
    }
    ///std::rotate(m_positionBuffer.data + start, m_positionBuffer.data + mid, m_positionBuffer.data + end);
    std_rotate(this.m_positionBuffer.data, start, mid, end);
    ///std::rotate(m_velocityBuffer.data + start, m_velocityBuffer.data + mid, m_velocityBuffer.data + end);
    std_rotate(this.m_velocityBuffer.data, start, mid, end);
    ///std::rotate(m_groupBuffer + start, m_groupBuffer + mid, m_groupBuffer + end);
    std_rotate(this.m_groupBuffer, start, mid, end);
    if (this.m_hasForce) {
      ///std::rotate(m_forceBuffer + start, m_forceBuffer + mid, m_forceBuffer + end);
      std_rotate(this.m_forceBuffer, start, mid, end);
    }
    if (this.m_staticPressureBuffer) {
      ///std::rotate(m_staticPressureBuffer + start, m_staticPressureBuffer + mid, m_staticPressureBuffer + end);
      std_rotate(this.m_staticPressureBuffer, start, mid, end);
    }
    if (this.m_depthBuffer) {
      ///std::rotate(m_depthBuffer + start, m_depthBuffer + mid, m_depthBuffer + end);
      std_rotate(this.m_depthBuffer, start, mid, end);
    }
    if (this.m_colorBuffer.data) {
      ///std::rotate(m_colorBuffer.data + start, m_colorBuffer.data + mid, m_colorBuffer.data + end);
      std_rotate(this.m_colorBuffer.data, start, mid, end);
    }
    if (this.m_userDataBuffer.data) {
      ///std::rotate(m_userDataBuffer.data + start, m_userDataBuffer.data + mid, m_userDataBuffer.data + end);
      std_rotate(this.m_userDataBuffer.data, start, mid, end);
    }

    // Update handle indices.
    if (this.m_handleIndexBuffer.data) {
      ///std::rotate(m_handleIndexBuffer.data + start, m_handleIndexBuffer.data + mid, m_handleIndexBuffer.data + end);
      std_rotate(this.m_handleIndexBuffer.data, start, mid, end);
      for (let i = start; i < end; ++i) {
        const handle = this.m_handleIndexBuffer.data[i];
        if (handle) { handle.SetIndex(newIndices(handle.GetIndex())); }
      }
    }

    if (this.m_expirationTimeBuffer.data) {
      ///std::rotate(m_expirationTimeBuffer.data + start, m_expirationTimeBuffer.data + mid, m_expirationTimeBuffer.data + end);
      std_rotate(this.m_expirationTimeBuffer.data, start, mid, end);
      // Update expiration time buffer indices.
      const particleCount = this.GetParticleCount();
      const indexByExpirationTime = this.m_indexByExpirationTimeBuffer.data;
      for (let i = 0; i < particleCount; ++i) {
        indexByExpirationTime[i] = newIndices(indexByExpirationTime[i]);
      }
    }

    // update proxies
    for (let k = 0; k < this.m_proxyBuffer.count; k++) {
      const proxy = this.m_proxyBuffer.data[k];
      proxy.index = newIndices(proxy.index);
    }

    // update contacts
    for (let k = 0; k < this.m_contactBuffer.count; k++) {
      const contact = this.m_contactBuffer.data[k];
      contact.indexA = newIndices(contact.indexA);
      contact.indexB = newIndices(contact.indexB);
    }

    // update particle-body contacts
    for (let k = 0; k < this.m_bodyContactBuffer.count; k++) {
      const contact = this.m_bodyContactBuffer.data[k];
      contact.index = newIndices(contact.index);
    }

    // update pairs
    for (let k = 0; k < this.m_pairBuffer.count; k++) {
      const pair = this.m_pairBuffer.data[k];
      pair.indexA = newIndices(pair.indexA);
      pair.indexB = newIndices(pair.indexB);
    }

    // update triads
    for (let k = 0; k < this.m_triadBuffer.count; k++) {
      const triad = this.m_triadBuffer.data[k];
      triad.indexA = newIndices(triad.indexA);
      triad.indexB = newIndices(triad.indexB);
      triad.indexC = newIndices(triad.indexC);
    }

    // update groups
    for (let group = this.m_groupList; group; group = group.GetNext()) {
      group.m_firstIndex = newIndices(group.m_firstIndex);
      group.m_lastIndex = newIndices(group.m_lastIndex - 1) + 1;
    }
  }

  public GetCriticalVelocity(step: b2TimeStep): number {
    return this.m_particleDiameter * step.inv_dt;
  }

  public GetCriticalVelocitySquared(step: b2TimeStep): number {
    const velocity = this.GetCriticalVelocity(step);
    return velocity * velocity;
  }

  public GetCriticalPressure(step: b2TimeStep): number {
    return this.m_def.density * this.GetCriticalVelocitySquared(step);
  }

  public GetParticleStride(): number {
    return b2_particleStride * this.m_particleDiameter;
  }

  public GetParticleMass(): number {
    const stride = this.GetParticleStride();
    return this.m_def.density * stride * stride;
  }

  public GetParticleInvMass(): number {
    ///return 1.777777 * this.m_inverseDensity * this.m_inverseDiameter * this.m_inverseDiameter;
    // mass = density * stride^2, so we take the inverse of this.
    const inverseStride = this.m_inverseDiameter * (1.0 / b2_particleStride);
    return this.m_inverseDensity * inverseStride * inverseStride;
  }

  /**
   * Get the world's contact filter if any particles with the
   * b2_contactFilterParticle flag are present in the system.
   */
  public GetFixtureContactFilter(): b2ContactFilter  {
    return (this.m_allParticleFlags & b2ParticleFlag.b2_fixtureContactFilterParticle) ?
      this.m_world.m_contactManager.m_contactFilter : null;
  }

  /**
   * Get the world's contact filter if any particles with the
   * b2_particleContactFilterParticle flag are present in the
   * system.
   */
  public GetParticleContactFilter(): b2ContactFilter  {
    return (this.m_allParticleFlags & b2ParticleFlag.b2_particleContactFilterParticle) ?
      this.m_world.m_contactManager.m_contactFilter : null;
  }

  /**
   * Get the world's contact listener if any particles with the
   * b2_fixtureContactListenerParticle flag are present in the
   * system.
   */
  public GetFixtureContactListener(): b2ContactListener  {
    return (this.m_allParticleFlags & b2ParticleFlag.b2_fixtureContactListenerParticle) ?
      this.m_world.m_contactManager.m_contactListener : null;
  }

  /**
   * Get the world's contact listener if any particles with the
   * b2_particleContactListenerParticle flag are present in the
   * system.
   */
  public GetParticleContactListener(): b2ContactListener  {
    return (this.m_allParticleFlags & b2ParticleFlag.b2_particleContactListenerParticle) ?
      this.m_world.m_contactManager.m_contactListener : null;
  }

  public SetUserOverridableBuffer<T>(buffer: b2ParticleSystem_UserOverridableBuffer<T>, data: T[]): void {
    buffer.data = data;
    buffer.userSuppliedCapacity = data.length;
  }

  public SetGroupFlags(group: b2ParticleGroup, newFlags: b2ParticleGroupFlag): void {
    const oldFlags = group.m_groupFlags;
    if ((oldFlags ^ newFlags) & b2ParticleGroupFlag.b2_solidParticleGroup) {
      // If the b2_solidParticleGroup flag changed schedule depth update.
      newFlags |= b2ParticleGroupFlag.b2_particleGroupNeedsUpdateDepth;
    }
    if (oldFlags & ~newFlags) {
      // If any flags might be removed
      this.m_needsUpdateAllGroupFlags = true;
    }
    if (~this.m_allGroupFlags & newFlags) {
      // If any flags were added
      if (newFlags & b2ParticleGroupFlag.b2_solidParticleGroup) {
        this.m_depthBuffer = this.RequestBuffer(this.m_depthBuffer);
      }
      this.m_allGroupFlags |= newFlags;
    }
    group.m_groupFlags = newFlags;
  }

  public static BodyContactCompare(lhs: b2ParticleBodyContact, rhs: b2ParticleBodyContact): boolean {
    if (lhs.index === rhs.index) {
      // Subsort by weight, decreasing.
      return lhs.weight > rhs.weight;
    }
    return lhs.index < rhs.index;
  }

  public RemoveSpuriousBodyContacts(): void {
    // At this point we have a list of contact candidates based on AABB
    // overlap.The AABB query that  generated this returns all collidable
    // fixtures overlapping particle bounding boxes.  This breaks down around
    // vertices where two shapes intersect, such as a "ground" surface made
    // of multiple b2PolygonShapes; it potentially applies a lot of spurious
    // impulses from normals that should not actually contribute.  See the
    // Ramp example in Testbed.
    //
    // To correct for this, we apply this algorithm:
    //   * sort contacts by particle and subsort by weight (nearest to farthest)
    //   * for each contact per particle:
    //      - project a point at the contact distance along the inverse of the
    //        contact normal
    //      - if this intersects the fixture that generated the contact, apply
    //         it, otherwise discard as impossible
    //      - repeat for up to n nearest contacts, currently we get good results
    //        from n=3.
    ///std::sort(m_bodyContactBuffer.Begin(), m_bodyContactBuffer.End(), b2ParticleSystem::BodyContactCompare);
    std_sort(this.m_bodyContactBuffer.data, 0, this.m_bodyContactBuffer.count, b2ParticleSystem.BodyContactCompare);

    ///int32 discarded = 0;
    ///std::remove_if(m_bodyContactBuffer.Begin(), m_bodyContactBuffer.End(), b2ParticleBodyContactRemovePredicate(this, &discarded));
    ///
    ///m_bodyContactBuffer.SetCount(m_bodyContactBuffer.GetCount() - discarded);

    const s_n = b2ParticleSystem.RemoveSpuriousBodyContacts_s_n;
    const s_pos = b2ParticleSystem.RemoveSpuriousBodyContacts_s_pos;
    const s_normal = b2ParticleSystem.RemoveSpuriousBodyContacts_s_normal;

    // Max number of contacts processed per particle, from nearest to farthest.
    // This must be at least 2 for correctness with concave shapes; 3 was
    // experimentally arrived at as looking reasonable.
    const k_maxContactsPerPoint = 3;
    const system = this;
    // Index of last particle processed.
    let lastIndex = -1;
    // Number of contacts processed for the current particle.
    let currentContacts = 0;
    // Output the number of discarded contacts.
    // let discarded = 0;
    const b2ParticleBodyContactRemovePredicate = (contact: b2ParticleBodyContact): boolean => {
      // This implements the selection criteria described in
      // RemoveSpuriousBodyContacts().
      // This functor is iterating through a list of Body contacts per
      // Particle, ordered from near to far.  For up to the maximum number of
      // contacts we allow per point per step, we verify that the contact
      // normal of the Body that genenerated the contact makes physical sense
      // by projecting a point back along that normal and seeing if it
      // intersects the fixture generating the contact.

      if (contact.index !== lastIndex) {
        currentContacts = 0;
        lastIndex = contact.index;
      }

      if (currentContacts++ > k_maxContactsPerPoint) {
        // ++discarded;
        return true;
      }

      // Project along inverse normal (as returned in the contact) to get the
      // point to check.
      ///b2Vec2 n = contact.normal;
      const n = s_n.Copy(contact.normal);
      // weight is 1-(inv(diameter) * distance)
      ///n *= system.m_particleDiameter * (1 - contact.weight);
      n.SelfMul(system.m_particleDiameter * (1 - contact.weight));
      ///b2Vec2 pos = system.m_positionBuffer.data[contact.index] + n;
      const pos = b2Vec2.AddVV(system.m_positionBuffer.data[contact.index], n, s_pos);

      // pos is now a point projected back along the contact normal to the
      // contact distance. If the surface makes sense for a contact, pos will
      // now lie on or in the fixture generating
      if (!contact.fixture.TestPoint(pos)) {
        const childCount = contact.fixture.GetShape().GetChildCount();
        for (let childIndex = 0; childIndex < childCount; childIndex++) {
          const normal = s_normal;
          const distance = contact.fixture.ComputeDistance(pos, normal, childIndex);
          if (distance < b2_linearSlop) {
            return false;
          }
        }
        // ++discarded;
        return true;
      }

      return false;
    };
    this.m_bodyContactBuffer.count = std_remove_if(this.m_bodyContactBuffer.data, b2ParticleBodyContactRemovePredicate, this.m_bodyContactBuffer.count);
  }
  private static RemoveSpuriousBodyContacts_s_n = new b2Vec2();
  private static RemoveSpuriousBodyContacts_s_pos = new b2Vec2();
  private static RemoveSpuriousBodyContacts_s_normal = new b2Vec2();

  public DetectStuckParticle(particle: number): void {
    // Detect stuck particles
    //
    // The basic algorithm is to allow the user to specify an optional
    // threshold where we detect whenever a particle is contacting
    // more than one fixture for more than threshold consecutive
    // steps. This is considered to be "stuck", and these are put
    // in a list the user can query per step, if enabled, to deal with
    // such particles.

    if (this.m_stuckThreshold <= 0) {
      return;
    }

    // Get the state variables for this particle.
    ///int32 * const consecutiveCount = &m_consecutiveContactStepsBuffer.data[particle];
    ///int32 * const lastStep = &m_lastBodyContactStepBuffer.data[particle];
    ///int32 * const bodyCount = &m_bodyContactCountBuffer.data[particle];

    // This is only called when there is a body contact for this particle.
    ///++(*bodyCount);
    ++this.m_bodyContactCountBuffer.data[particle];

    // We want to only trigger detection once per step, the first time we
    // contact more than one fixture in a step for a given particle.
    ///if (*bodyCount === 2)
    if (this.m_bodyContactCountBuffer.data[particle] === 2) {
      ///++(*consecutiveCount);
      ++this.m_consecutiveContactStepsBuffer.data[particle];
      ///if (*consecutiveCount > m_stuckThreshold)
      if (this.m_consecutiveContactStepsBuffer.data[particle] > this.m_stuckThreshold) {
        ///int32& newStuckParticle = m_stuckParticleBuffer.Append();
        ///newStuckParticle = particle;
        this.m_stuckParticleBuffer.data[this.m_stuckParticleBuffer.Append()] = particle;
      }
    }
    ///*lastStep = m_timestamp;
    this.m_lastBodyContactStepBuffer.data[particle] = this.m_timestamp;
  }

  /**
   * Determine whether a particle index is valid.
   */
  public ValidateParticleIndex(index: number): boolean {
    return index >= 0 && index < this.GetParticleCount() &&
      index !== b2_invalidParticleIndex;
  }

  /**
   * Get the time elapsed in
   * b2ParticleSystemDef::lifetimeGranularity.
   */
  public GetQuantizedTimeElapsed(): number {
    ///return (int32)(m_timeElapsed >> 32);
    return Math.floor(this.m_timeElapsed / 0x100000000);
  }

  /**
   * Convert a lifetime in seconds to an expiration time.
   */
  public LifetimeToExpirationTime(lifetime: number): number {
    ///return m_timeElapsed + (int64)((lifetime / m_def.lifetimeGranularity) * (float32)(1LL << 32));
    return this.m_timeElapsed + Math.floor(((lifetime / this.m_def.lifetimeGranularity) * 0x100000000));
  }

  public ForceCanBeApplied(flags: b2ParticleFlag): boolean {
    return !(flags & b2ParticleFlag.b2_wallParticle);
  }

  public PrepareForceBuffer(): void {
    if (!this.m_hasForce) {
      ///memset(m_forceBuffer, 0, sizeof(*m_forceBuffer) * m_count);
      for (let i = 0; i < this.m_count; i++) {
        this.m_forceBuffer[i].SetZero();
      }
      this.m_hasForce = true;
    }
  }

  public IsRigidGroup(group: b2ParticleGroup ): boolean {
    return (group !== null) && ((group.m_groupFlags & b2ParticleGroupFlag.b2_rigidParticleGroup) !== 0);
  }

  public GetLinearVelocity(group: b2ParticleGroup , particleIndex: number, point: b2Vec2, out: b2Vec2): b2Vec2 {
    if (group && this.IsRigidGroup(group)) {
      return group.GetLinearVelocityFromWorldPoint(point, out);
    } else {
      ///return m_velocityBuffer.data[particleIndex];
      return out.Copy(this.m_velocityBuffer.data[particleIndex]);
    }
  }

  public InitDampingParameter(invMass: number[], invInertia: number[], tangentDistance: number[], mass: number, inertia: number, center: b2Vec2, point: b2Vec2, normal: b2Vec2): void {
    ///*invMass = mass > 0 ? 1 / mass : 0;
    invMass[0] = mass > 0 ? 1 / mass : 0;
    ///*invInertia = inertia > 0 ? 1 / inertia : 0;
    invInertia[0] = inertia > 0 ? 1 / inertia : 0;
    ///*tangentDistance = b2Cross(point - center, normal);
    tangentDistance[0] = b2Vec2.CrossVV(b2Vec2.SubVV(point, center, b2Vec2.s_t0), normal);
  }

  public InitDampingParameterWithRigidGroupOrParticle(invMass: number[], invInertia: number[], tangentDistance: number[], isRigidGroup: boolean, group: b2ParticleGroup , particleIndex: number, point: b2Vec2, normal: b2Vec2): void {
    if (group && isRigidGroup) {
      this.InitDampingParameter(invMass, invInertia, tangentDistance, group.GetMass(), group.GetInertia(), group.GetCenter(), point, normal);
    } else {
      const flags = this.m_flagsBuffer.data[particleIndex];
      this.InitDampingParameter(invMass, invInertia, tangentDistance, flags & b2ParticleFlag.b2_wallParticle ? 0 : this.GetParticleMass(), 0, point, point, normal);
    }
  }

  public ComputeDampingImpulse(invMassA: number, invInertiaA: number, tangentDistanceA: number, invMassB: number, invInertiaB: number, tangentDistanceB: number, normalVelocity: number): number {
    const invMass =
      invMassA + invInertiaA * tangentDistanceA * tangentDistanceA +
      invMassB + invInertiaB * tangentDistanceB * tangentDistanceB;
    return invMass > 0 ? normalVelocity / invMass : 0;
  }

  public ApplyDamping(invMass: number, invInertia: number, tangentDistance: number, isRigidGroup: boolean, group: b2ParticleGroup , particleIndex: number, impulse: number, normal: b2Vec2): void {
    if (group && isRigidGroup) {
      ///group.m_linearVelocity += impulse * invMass * normal;
      group.m_linearVelocity.SelfMulAdd(impulse * invMass, normal);
      ///group.m_angularVelocity += impulse * tangentDistance * invInertia;
      group.m_angularVelocity += impulse * tangentDistance * invInertia;
    } else {
      ///m_velocityBuffer.data[particleIndex] += impulse * invMass * normal;
      this.m_velocityBuffer.data[particleIndex].SelfMulAdd(impulse * invMass, normal);
    }
  }
}

 class b2ParticleSystem_UserOverridableBuffer<T> {
  public _data: T[]  = null;
  public get data(): T[] { return this._data as T[]; } // HACK: may return null
  public set data(value: T[]) { this._data = value; }
  public userSuppliedCapacity: number = 0;
}

 class b2ParticleSystem_Proxy {
  public index: number = b2_invalidParticleIndex;
  public tag: number = 0;
  public static CompareProxyProxy(a: b2ParticleSystem_Proxy, b: b2ParticleSystem_Proxy): boolean {
    return a.tag < b.tag;
  }
  public static CompareTagProxy(a: number, b: b2ParticleSystem_Proxy): boolean {
    return a < b.tag;
  }
  public static CompareProxyTag(a: b2ParticleSystem_Proxy, b: number): boolean {
    return a.tag < b;
  }
}

 class b2ParticleSystem_InsideBoundsEnumerator {
  public m_system: b2ParticleSystem;
  public m_xLower: number;
  public m_xUpper: number;
  public m_yLower: number;
  public m_yUpper: number;
  public m_first: number;
  public m_last: number;
  /**
   * InsideBoundsEnumerator enumerates all particles inside the
   * given bounds.
   *
   * Construct an enumerator with bounds of tags and a range of
   * proxies.
   */
  constructor(system: b2ParticleSystem, lower: number, upper: number, first: number, last: number) {
    this.m_system = system;
    this.m_xLower = (lower & b2ParticleSystem.xMask) >>> 0;
    this.m_xUpper = (upper & b2ParticleSystem.xMask) >>> 0;
    this.m_yLower = (lower & b2ParticleSystem.yMask) >>> 0;
    this.m_yUpper = (upper & b2ParticleSystem.yMask) >>> 0;
    this.m_first = first;
    this.m_last = last;
    // DEBUG: b2Assert(this.m_first <= this.m_last);
  }

  /**
   * Get index of the next particle. Returns
   * b2_invalidParticleIndex if there are no more particles.
   */
  public GetNext(): number {
    while (this.m_first < this.m_last) {
      const xTag = (this.m_system.m_proxyBuffer.data[this.m_first].tag & b2ParticleSystem.xMask) >>> 0;
      // #if B2_ASSERT_ENABLED
      // DEBUG: const yTag = (this.m_system.m_proxyBuffer.data[this.m_first].tag & b2ParticleSystem_yMask) >>> 0;
      // DEBUG: b2Assert(yTag >= this.m_yLower);
      // DEBUG: b2Assert(yTag <= this.m_yUpper);
      // #endif
      if (xTag >= this.m_xLower && xTag <= this.m_xUpper) {
        return (this.m_system.m_proxyBuffer.data[this.m_first++]).index;
      }
      this.m_first++;
    }
    return b2_invalidParticleIndex;
  }
}

 class b2ParticleSystem_ParticleListNode {
  /**
   * The head of the list.
   */
  public list: b2ParticleSystem_ParticleListNode;
  /**
   * The next node in the list.
   */
  public next: b2ParticleSystem_ParticleListNode  = null;
  /**
   * Number of entries in the list. Valid only for the node at the
   * head of the list.
   */
  public count: number = 0;
  /**
   * Particle index.
   */
  public index: number = 0;
}

/**
 * @constructor
 */
 class b2ParticleSystem_FixedSetAllocator<T> {
  public Allocate(itemSize: number, count: number): number {
    // TODO
    return count;
  }

  public Clear(): void {
    // TODO
  }

  public GetCount(): number {
    // TODO
    return 0;
  }

  public Invalidate(itemIndex: number): void {
    // TODO
  }

  public GetValidBuffer(): boolean[] {
    // TODO
    return [];
  }

  public GetBuffer(): T[] {
    // TODO
    return [];
  }

  public SetCount(count: number): void {
    // TODO
  }
}

 class b2ParticleSystem_FixtureParticle {
  public first: b2Fixture;
  public second: number = b2_invalidParticleIndex;
  constructor(fixture: b2Fixture, particle: number) {
    this.first = fixture;
    this.second = particle;
  }
}

 class b2ParticleSystem_FixtureParticleSet extends b2ParticleSystem_FixedSetAllocator<b2ParticleSystem_FixtureParticle> {
  public Initialize(bodyContactBuffer: b2GrowableBuffer<b2ParticleBodyContact>, flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>): void {
    // TODO
  }
  public Find(pair: b2ParticleSystem_FixtureParticle): number {
    // TODO
    return b2_invalidParticleIndex;
  }
}

 class b2ParticleSystem_ParticlePair {
  public first: number = b2_invalidParticleIndex;
  public second: number = b2_invalidParticleIndex;
  constructor(particleA: number, particleB: number) {
    this.first = particleA;
    this.second = particleB;
  }
}

 class b2ParticlePairSet extends b2ParticleSystem_FixedSetAllocator<b2ParticleSystem_ParticlePair> {
  public Initialize(contactBuffer: b2GrowableBuffer<b2ParticleContact>, flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>): void {
    // TODO
  }

  public Find(pair: b2ParticleSystem_ParticlePair): number {
    // TODO
    return b2_invalidParticleIndex;
  }
}

 class b2ParticleSystem_ConnectionFilter {
  /**
   * Is the particle necessary for connection?
   * A pair or a triad should contain at least one 'necessary'
   * particle.
   */
  public IsNecessary(index: number): boolean {
    return true;
  }

  /**
   * An additional condition for creating a pair.
   */
  public ShouldCreatePair(a: number, b: number): boolean {
    return true;
  }

  /**
   * An additional condition for creating a triad.
   */
  public ShouldCreateTriad(a: number, b: number, c: number): boolean {
    return true;
  }
}

 class b2ParticleSystem_DestroyParticlesInShapeCallback extends b2QueryCallback {
  public m_system: b2ParticleSystem;
  public m_shape: b2Shape;
  public m_xf: b2Transform;
  public m_callDestructionListener: boolean = false;
  public m_destroyed: number = 0;

  constructor(system: b2ParticleSystem, shape: b2Shape, xf: b2Transform, callDestructionListener: boolean) {
    super();
    this.m_system = system;
    this.m_shape = shape;
    this.m_xf = xf;
    this.m_callDestructionListener = callDestructionListener;
    this.m_destroyed = 0;
  }

  public ReportFixture(fixture: b2Fixture): boolean {
    return false;
  }

  public ReportParticle(particleSystem: b2ParticleSystem, index: number): boolean {
    if (particleSystem !== this.m_system) {
      return false;
    }
    // DEBUG: b2Assert(index >= 0 && index < this.m_system.m_count);
    if (this.m_shape.TestPoint(this.m_xf, this.m_system.m_positionBuffer.data[index])) {
      this.m_system.DestroyParticle(index, this.m_callDestructionListener);
      this.m_destroyed++;
    }
    return true;
  }

  public Destroyed(): number {
    return this.m_destroyed;
  }
}

 class b2ParticleSystem_JoinParticleGroupsFilter extends b2ParticleSystem_ConnectionFilter {
  public m_threshold: number = 0;

  constructor(threshold: number) {
    super();
    this.m_threshold = threshold;
  }

  /**
   * An additional condition for creating a pair.
   */
  public ShouldCreatePair(a: number, b: number): boolean {
    return (a < this.m_threshold && this.m_threshold <= b) ||
      (b < this.m_threshold && this.m_threshold <= a);
  }

  /**
   * An additional condition for creating a triad.
   */
  public ShouldCreateTriad(a: number, b: number, c: number): boolean {
    return (a < this.m_threshold || b < this.m_threshold || c < this.m_threshold) &&
      (this.m_threshold <= a || this.m_threshold <= b || this.m_threshold <= c);
  }
}

 class b2ParticleSystem_CompositeShape extends b2Shape {
  constructor(shapes: b2Shape[], shapeCount: number = shapes.length) {
    super(b2ShapeType.e_unknown, 0);
    this.m_shapes = shapes;
    this.m_shapeCount = shapeCount;
  }

  public m_shapes: b2Shape[];
  public m_shapeCount: number = 0;

  public Clone(): b2Shape {
    // DEBUG: b2Assert(false);
    throw new Error();
  }

  public GetChildCount(): number {
    return 1;
  }

  /**
   * @see b2Shape::TestPoint
   */
  public TestPoint(xf: b2Transform, p: XY): boolean {
    for (let i = 0; i < this.m_shapeCount; i++) {
      if (this.m_shapes[i].TestPoint(xf, p)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @see b2Shape::ComputeDistance
   */
  public ComputeDistance(xf: b2Transform, p: b2Vec2, normal: b2Vec2, childIndex: number): number {
    // DEBUG: b2Assert(false);
    return 0;
  }

  /**
   * Implement b2Shape.
   */
  public RayCast(output: b2RayCastOutput, input: b2RayCastInput, xf: b2Transform, childIndex: number): boolean {
    // DEBUG: b2Assert(false);
    return false;
  }

  /**
   * @see b2Shape::ComputeAABB
   */
  public ComputeAABB(aabb: b2AABB, xf: b2Transform, childIndex: number): void {
    const s_subaabb = new b2AABB();
    aabb.lowerBound.x = +b2_maxFloat;
    aabb.lowerBound.y = +b2_maxFloat;
    aabb.upperBound.x = -b2_maxFloat;
    aabb.upperBound.y = -b2_maxFloat;
    // DEBUG: b2Assert(childIndex === 0);
    for (let i = 0; i < this.m_shapeCount; i++) {
      const childCount = this.m_shapes[i].GetChildCount();
      for (let j = 0; j < childCount; j++) {
        const subaabb = s_subaabb;
        this.m_shapes[i].ComputeAABB(subaabb, xf, j);
        aabb.Combine1(subaabb);
      }
    }
  }

  /**
   * @see b2Shape::ComputeMass
   */
  public ComputeMass(massData: b2MassData, density: number): void {
    // DEBUG: b2Assert(false);
  }

  public SetupDistanceProxy(proxy: b2DistanceProxy, index: number): void {
    // DEBUG: b2Assert(false);
  }

  public ComputeSubmergedArea(normal: b2Vec2, offset: number, xf: b2Transform, c: b2Vec2): number {
    // DEBUG: b2Assert(false);
    return 0;
  }

  public Dump(log: (format: string, ...args: any[]) => void): void {
    // DEBUG: b2Assert(false);
  }
}

 class b2ParticleSystem_ReactiveFilter extends b2ParticleSystem_ConnectionFilter {
  public m_flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>;
  constructor(flagsBuffer: b2ParticleSystem_UserOverridableBuffer<b2ParticleFlag>) {
    super();
    this.m_flagsBuffer = flagsBuffer;
  }
  public IsNecessary(index: number): boolean {
    return (this.m_flagsBuffer.data[index] & b2ParticleFlag.b2_reactiveParticle) !== 0;
  }
}

 class b2ParticleSystem_UpdateBodyContactsCallback extends b2FixtureParticleQueryCallback {
  public m_contactFilter: b2ContactFilter  = null;
  constructor(system: b2ParticleSystem, contactFilter: b2ContactFilter  = null) {
    super(system); // base class constructor
    this.m_contactFilter = contactFilter;
  }

  public ShouldCollideFixtureParticle(fixture: b2Fixture, particleSystem: b2ParticleSystem, particleIndex: number): boolean {
    // Call the contact filter if it's set, to determine whether to
    // filter this contact.  Returns true if contact calculations should
    // be performed, false otherwise.
    if (this.m_contactFilter) {
      const flags = this.m_system.GetFlagsBuffer();
      if (flags[particleIndex] & b2ParticleFlag.b2_fixtureContactFilterParticle) {
        return this.m_contactFilter.ShouldCollideFixtureParticle(fixture, this.m_system, particleIndex);
      }
    }
    return true;
  }

  public ReportFixtureAndParticle(fixture: b2Fixture, childIndex: number, a: number): void {
    const s_n = b2ParticleSystem_UpdateBodyContactsCallback.ReportFixtureAndParticle_s_n;
    const s_rp = b2ParticleSystem_UpdateBodyContactsCallback.ReportFixtureAndParticle_s_rp;
    const ap = this.m_system.m_positionBuffer.data[a];
    const n = s_n;
    const d = fixture.ComputeDistance(ap, n, childIndex);
    if (d < this.m_system.m_particleDiameter && this.ShouldCollideFixtureParticle(fixture, this.m_system, a)) {
      const b = fixture.GetBody();
      const bp = b.GetWorldCenter();
      const bm = b.GetMass();
      const bI = b.GetInertia() - bm * b.GetLocalCenter().LengthSquared();
      const invBm = bm > 0 ? 1 / bm : 0;
      const invBI = bI > 0 ? 1 / bI : 0;
      const invAm =
        this.m_system.m_flagsBuffer.data[a] &
        b2ParticleFlag.b2_wallParticle ? 0 : this.m_system.GetParticleInvMass();
      ///b2Vec2 rp = ap - bp;
      const rp = b2Vec2.SubVV(ap, bp, s_rp);
      const rpn = b2Vec2.CrossVV(rp, n);
      const invM = invAm + invBm + invBI * rpn * rpn;

      ///b2ParticleBodyContact& contact = m_system.m_bodyContactBuffer.Append();
      const contact = this.m_system.m_bodyContactBuffer.data[this.m_system.m_bodyContactBuffer.Append()];
      contact.index = a;
      contact.body = b;
      contact.fixture = fixture;
      contact.weight = 1 - d * this.m_system.m_inverseDiameter;
      ///contact.normal = -n;
      contact.normal.Copy(n.SelfNeg());
      contact.mass = invM > 0 ? 1 / invM : 0;
      this.m_system.DetectStuckParticle(a);
    }
  }
  public static  ReportFixtureAndParticle_s_n = new b2Vec2();
  public static  ReportFixtureAndParticle_s_rp = new b2Vec2();
}

 class b2ParticleSystem_SolveCollisionCallback extends b2FixtureParticleQueryCallback {
  public m_step: b2TimeStep;
  constructor(system: b2ParticleSystem, step: b2TimeStep) {
    super(system); // base class constructor
    this.m_step = step;
  }

  public ReportFixtureAndParticle(fixture: b2Fixture, childIndex: number, a: number): void {
    const s_p1 = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_p1;
    const s_output = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_output;
    const s_input = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_input;
    const s_p = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_p;
    const s_v = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_v;
    const s_f = b2ParticleSystem_SolveCollisionCallback.ReportFixtureAndParticle_s_f;

    const body = fixture.GetBody();
    const ap = this.m_system.m_positionBuffer.data[a];
    const av = this.m_system.m_velocityBuffer.data[a];
    const output = s_output;
    const input = s_input;
    if (this.m_system.m_iterationIndex === 0) {
      // Put 'ap' in the local space of the previous frame
      ///b2Vec2 p1 = b2MulT(body.m_xf0, ap);
      const p1 = b2Transform.MulTXV(body.m_xf0, ap, s_p1);
      if (fixture.GetShape().GetType() === b2ShapeType.e_circleShape) {
        // Make relative to the center of the circle
        ///p1 -= body.GetLocalCenter();
        p1.SelfSub(body.GetLocalCenter());
        // Re-apply rotation about the center of the circle
        ///p1 = b2Mul(body.m_xf0.q, p1);
        b2Rot.MulRV(body.m_xf0.q, p1, p1);
        // Subtract rotation of the current frame
        ///p1 = b2MulT(body.m_xf.q, p1);
        b2Rot.MulTRV(body.m_xf.q, p1, p1);
        // Return to local space
        ///p1 += body.GetLocalCenter();
        p1.SelfAdd(body.GetLocalCenter());
      }
      // Return to global space and apply rotation of current frame
      ///input.p1 = b2Mul(body.m_xf, p1);
      b2Transform.MulXV(body.m_xf, p1, input.p1);
    } else {
      ///input.p1 = ap;
      input.p1.Copy(ap);
    }
    ///input.p2 = ap + m_step.dt * av;
    b2Vec2.AddVMulSV(ap, this.m_step.dt, av, input.p2);
    input.maxFraction = 1;
    if (fixture.RayCast(output, input, childIndex)) {
      const n = output.normal;
      ///b2Vec2 p = (1 - output.fraction) * input.p1 + output.fraction * input.p2 + b2_linearSlop * n;
      const p = s_p;
      p.x = (1 - output.fraction) * input.p1.x + output.fraction * input.p2.x + b2_linearSlop * n.x;
      p.y = (1 - output.fraction) * input.p1.y + output.fraction * input.p2.y + b2_linearSlop * n.y;
      ///b2Vec2 v = m_step.inv_dt * (p - ap);
      const v = s_v;
      v.x = this.m_step.inv_dt * (p.x - ap.x);
      v.y = this.m_step.inv_dt * (p.y - ap.y);
      ///m_system.m_velocityBuffer.data[a] = v;
      this.m_system.m_velocityBuffer.data[a].Copy(v);
      ///b2Vec2 f = m_step.inv_dt * m_system.GetParticleMass() * (av - v);
      const f = s_f;
      f.x = this.m_step.inv_dt * this.m_system.GetParticleMass() * (av.x - v.x);
      f.y = this.m_step.inv_dt * this.m_system.GetParticleMass() * (av.y - v.y);
      this.m_system.ParticleApplyForce(a, f);
    }
  }
  public static  ReportFixtureAndParticle_s_p1 = new b2Vec2();
  public static  ReportFixtureAndParticle_s_output = new b2RayCastOutput();
  public static  ReportFixtureAndParticle_s_input = new b2RayCastInput();
  public static  ReportFixtureAndParticle_s_p = new b2Vec2();
  public static  ReportFixtureAndParticle_s_v = new b2Vec2();
  public static  ReportFixtureAndParticle_s_f = new b2Vec2();

  public ReportParticle(system: b2ParticleSystem, index: number): boolean {
    return false;
  }
}

// #endif
