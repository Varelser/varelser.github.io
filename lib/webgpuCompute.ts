// lib/webgpuCompute.ts
// WebGPU Compute Pipeline for GPGPU particle simulation.
// Replaces the fragment-shader ping-pong FBO with native GPU compute shaders (WGSL).
// Results are read back to CPU and uploaded to THREE.DataTexture each frame.

export interface WebgpuSphQualityProfile {
  sampleCount: number;
  flowClampScale: number;
  cohesionStrength: number;
}

export function getWebgpuSphQualityProfile(args: {
  pressure: number;
  viscosity: number;
  radius: number;
  restDensity: number;
}): WebgpuSphQualityProfile {
  const { pressure, viscosity, radius, restDensity } = args;
  let sampleCount = 24;
  if (radius >= 64) sampleCount = 32;
  if (radius >= 104) sampleCount = 40;
  if (radius >= 152 || pressure >= 5.5 || viscosity >= 1.15) sampleCount = 48;

  const flowClampScale = Math.max(0.14, Math.min(0.24, 0.14 + viscosity * 0.02 + pressure * 0.004));
  const cohesionStrength = Math.max(
    0.14,
    Math.min(0.34, 0.18 + pressure * 0.02 - viscosity * 0.03 + Math.max(0, restDensity - 1.4) * 0.015),
  );

  return {
    sampleCount,
    flowClampScale,
    cohesionStrength,
  };
}

const VEL_WGSL = /* wgsl */ `
struct Uniforms {
  texSize : u32,
  delta   : f32,
  time    : f32,
  gravity : f32,
  turbulence : f32,
  bounceRadius : f32,
  bounce : f32,
  speed  : f32,
  curlStrength : f32,
  curlScale : f32,
  windStrength : f32,
  windX : f32,
  windY : f32,
  windZ : f32,
  windGust : f32,
  vFieldType : f32,
  vFieldStrength : f32,
  vFieldScale : f32,
  wellStrength : f32,
  wellSoftening : f32,
  wellOrbit : f32,
  vortexStrength : f32,
  vortexTilt : f32,
  attractorType : f32,
  attractorStrength : f32,
  attractorScale : f32,
  mouseStrength : f32,
  mouseRadius : f32,
  mouseMode : f32,
  mouseX : f32,
  mouseY : f32,
  mouseZ : f32,
  fluidInfluence : f32,
  fluidScale : f32,
  fluidStrength : f32,
  fluidExtForce : f32,
  boidsSeparation : f32,
  boidsAlignment : f32,
  boidsCohesion : f32,
  boidsRadius : f32,
  nbodyStrength : f32,
  nbodyRepulsion : f32,
  nbodySoftening : f32,
  nbodySampleCount : f32,
  magneticStrength : f32,
  magneticBX : f32,
  magneticBY : f32,
  magneticBZ : f32,
  springStrength : f32,
  elasticStrength : f32,
  sphPressure : f32,
  sphViscosity : f32,
  sphRadius : f32,
  sphRestDensity : f32,
  sphSampleCount : f32,
  sphFlowClampScale : f32,
  sphCohesion : f32,
  sdfEnabled : f32,
  sdfShape : f32,
  sdfX : f32,
  sdfY : f32,
  sdfZ : f32,
  sdfSize : f32,
  sdfBounce : f32,
};

@group(0) @binding(0) var<uniform> u : Uniforms;
@group(0) @binding(1) var<storage, read>       posIn  : array<vec4f>;
@group(0) @binding(2) var<storage, read>       velIn  : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> velOut : array<vec4f>;
@group(0) @binding(4) var<storage, read>       initPos : array<vec4f>;

fn hash3(p: vec3f) -> vec3f {
  var q = vec3f(dot(p, vec3f(127.1, 311.7, 74.7)),
                dot(p, vec3f(269.5, 183.3, 246.1)),
                dot(p, vec3f(113.5, 271.9, 124.6)));
  return fract(sin(q) * 43758.5453) * 2.0 - 1.0;
}
fn vnoise(p: vec3f) -> f32 {
  let i = floor(p); let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dot(hash3(i),f),
                     dot(hash3(i+vec3f(1,0,0)),f-vec3f(1,0,0)),u.x),
                 mix(dot(hash3(i+vec3f(0,1,0)),f-vec3f(0,1,0)),
                     dot(hash3(i+vec3f(1,1,0)),f-vec3f(1,1,0)),u.x),u.y),
             mix(mix(dot(hash3(i+vec3f(0,0,1)),f-vec3f(0,0,1)),
                     dot(hash3(i+vec3f(1,0,1)),f-vec3f(1,0,1)),u.x),
                 mix(dot(hash3(i+vec3f(0,1,1)),f-vec3f(0,1,1)),
                     dot(hash3(i+vec3f(1,1,1)),f-vec3f(1,1,1)),u.x),u.y));
}


fn sdBox(p: vec3f, b: vec3f) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

fn computeSdfCollision(pos: vec3f, sdfShape: f32, sdfX: f32, sdfY: f32, sdfZ: f32, sdfSize: f32) -> vec4f {
  let sc = vec3f(sdfX, sdfY, sdfZ);
  var sd = 0.0;
  var sn = vec3f(0.0, 1.0, 0.0);
  if (sdfShape < 0.5) {
    let dp = pos - sc;
    sd = length(dp) - sdfSize;
    sn = normalize(dp + vec3f(0.0001));
  } else if (sdfShape < 1.5) {
    let dq = pos - sc;
    let aq = abs(dq);
    let dd = aq - vec3f(sdfSize);
    sd = sdBox(dq, vec3f(sdfSize));
    if (max(dd.x, max(dd.y, dd.z)) > 0.0) {
      sn = normalize(max(dd, vec3f(0.0)) * sign(dq) + vec3f(0.0001));
    } else if (dd.x > dd.y && dd.x > dd.z) {
      sn = vec3f(sign(dq.x), 0.0, 0.0);
    } else if (dd.y > dd.z) {
      sn = vec3f(0.0, sign(dq.y), 0.0);
    } else {
      sn = vec3f(0.0, 0.0, sign(dq.z));
    }
  } else if (sdfShape < 2.5) {
    let lp = pos - sc;
    let r2 = sdfSize * 0.35;
    let ringD = length(lp.xz) - sdfSize;
    sd = length(vec2f(ringD, lp.y)) - r2;
    let lxz = length(lp.xz) + 0.001;
    sn = normalize(vec3f(lp.x / lxz * ringD, lp.y, lp.z / lxz * ringD) + vec3f(0.0001));
  } else {
    let yc = clamp(pos.y - sc.y, -sdfSize, sdfSize);
    let dp = vec3f(pos.x - sc.x, pos.y - sc.y - yc, pos.z - sc.z);
    sd = length(dp) - sdfSize * 0.4;
    sn = normalize(dp + vec3f(0.0001));
  }
  return vec4f(sn, sd);
}

fn computeVortexVelocity(pos: vec3f, vortexTilt: f32) -> vec3f {
  let axis = normalize(vec3f(vortexTilt * 0.6, 1.0, (1.0 - abs(vortexTilt)) * 0.35 + 0.05));
  let radial = pos - axis * dot(pos, axis);
  let r2 = max(dot(radial, radial), 0.0008);
  let swirl = cross(axis, radial) / sqrt(r2);
  let lift = axis * (0.22 + clamp(abs(vortexTilt), 0.0, 1.0) * 0.34);
  return swirl + lift;
}
fn computeVectorField(pos: vec3f, fieldType: f32, fieldScale: f32) -> vec3f {
  let scaled = pos * max(0.0001, fieldScale);
  if (fieldType < 0.5) {
    return vec3f(scaled.x, -scaled.y, -scaled.z);
  }
  if (fieldType < 1.5) {
    return vec3f(scaled.x, -scaled.y, 0.0);
  }
  if (fieldType < 2.5) {
    return vec3f(-scaled.y, scaled.x, 0.35 * scaled.z);
  }
  return normalize(scaled + vec3f(0.0001)) * length(scaled);
}


fn computeFluidVelocity(pos: vec3f, time: f32, fluidScale: f32, fluidExtForce: f32) -> vec3f {
  let scale = max(0.0001, fluidScale);
  let uv = pos.xz / scale;
  let t = time * 0.45;
  let flow2 = vec2f(
    sin(uv.y * 1.9 + t) + cos(uv.x * 1.3 - t * 1.2),
    cos(uv.x * 1.7 - t) - sin(uv.y * 1.5 + t * 0.8)
  );
  var flow = vec3f(flow2.x, 0.0, flow2.y);
  if (fluidExtForce > 0.5) {
    let radial = vec3f(pos.x, 0.0, pos.z);
    let tangent = cross(vec3f(0.0, 1.0, 0.0), normalize(radial + vec3f(0.001, 0.0, 0.001)));
    flow += tangent * (0.75 + 0.25 * sin(t + length(radial) * 0.01));
  }
  return flow;
}

fn computeAttractorVelocity(pos: vec3f, attractorType: f32, attractorScale: f32) -> vec3f {
  let ap = pos / max(0.1, attractorScale);
  if (attractorType < 0.5) {
    return vec3f(10.0 * (ap.y - ap.x), ap.x * (28.0 - ap.z) - ap.y, ap.x * ap.y - 2.667 * ap.z);
  }
  if (attractorType < 1.5) {
    return vec3f(-(ap.y + ap.z), ap.x + 0.2 * ap.y, 0.2 + ap.z * (ap.x - 5.7));
  }
  return vec3f(sin(ap.y) - 0.208 * ap.x, sin(ap.z) - 0.208 * ap.y, sin(ap.x) - 0.208 * ap.z);
}


fn computeNBodyVelocity(pos: vec3f, time: f32, strength: f32, repulsionRadius: f32, softening: f32, sampleCount: f32) -> vec3f {
  let samples = max(1.0, sampleCount);
  let stride = 6.2831853 / samples;
  var acc = vec3f(0.0);
  for (var i = 0.0; i < 64.0; i = i + 1.0) {
    if (i >= samples) { break; }
    let angle = i * stride + time * (0.08 + 0.01 * i);
    let radius = repulsionRadius * (0.75 + fract(i * 0.6180339) * 1.4);
    let phase = time * (0.19 + 0.013 * i);
    let anchor = vec3f(
      cos(angle) * radius,
      sin(phase) * radius * 0.45,
      sin(angle) * radius
    );
    let diff = anchor - pos;
    let r2 = dot(diff, diff) + softening * softening;
    let r = sqrt(r2);
    if (r > 0.001) {
      let dir = diff / r;
      if (r > repulsionRadius) {
        acc += dir / r2;
      } else {
        acc -= dir / r2 * 0.5;
      }
    }
  }
  return acc * strength;
}

fn computeBoidsVelocity(pos: vec3f, vel: vec3f, time: f32, radius: f32) -> vec3f {
  let r = max(0.001, radius);
  let scale = 1.0 / r;
  let t = time * 0.35;
  let neighborhood = vec3f(
    sin(pos.y * scale * 0.8 + t) + cos(pos.z * scale * 0.6 - t * 1.3),
    cos(pos.z * scale * 0.7 + t * 0.9) + sin(pos.x * scale * 0.5 + t * 0.6),
    sin(pos.x * scale * 0.75 - t * 0.8) + cos(pos.y * scale * 0.55 + t)
  );
  let alignmentTarget = normalize(neighborhood + vec3f(0.0001));
  let alignment = alignmentTarget - normalize(vel + vec3f(0.0001));
  let cohesion = -pos / max(length(pos), r * 0.4 + 0.001);
  let separationSeed = vec3f(
    vnoise(pos * scale * 1.7 + vec3f(t, 7.1, 3.3)),
    vnoise(pos.yzx * scale * 1.9 + vec3f(5.2, t, 11.7)),
    vnoise(pos.zxy * scale * 1.5 + vec3f(9.8, 2.4, t))
  );
  let separation = -normalize(separationSeed + vec3f(0.0001));
  return separation * u.boidsSeparation + alignment * u.boidsAlignment + cohesion * u.boidsCohesion;
}


fn computeSphVelocity(idx: u32, pos: vec3f, vel: vec3f, texSize: u32, pressure: f32, viscosity: f32, radius: f32, restDensity: f32, sampleCountF: f32, flowClampScale: f32, cohesionStrength: f32) -> vec3f {
  let h = max(1.0, radius);
  let h2 = h * h;
  let count = texSize * texSize;
  let base = idx * 1103515245u + 12345u;
  let sampleCount = u32(clamp(sampleCountF, 8.0, 64.0));
  let stiffness = pressure * 0.9;
  let damp = viscosity * 0.65;
  let targetDensity = max(1.0, restDensity);
  var density = 0.0;
  var neighborWeight = 0.0;
  var velocityMean = vec3f(0.0);
  for (var i: u32 = 0u; i < sampleCount; i = i + 1u) {
    let stride = 2654435761u + i * 2246822519u;
    let candidate = (base + stride) % count;
    if (candidate == idx) { continue; }
    let otherPos = posIn[candidate].xyz;
    let otherVel = velIn[candidate].xyz;
    let r = pos - otherPos;
    let r2 = dot(r, r);
    if (r2 < h2 && r2 > 0.0001) {
      let dist = sqrt(r2);
      let q = dist / h;
      let kernel = max(0.0, 1.0 - q);
      let densityKernel = kernel * kernel * kernel;
      density += densityKernel;
      neighborWeight += 1.0;
      velocityMean += otherVel * densityKernel;
    }
  }
  if (neighborWeight < 1.0) { return vec3f(0.0); }
  let norm = max(1.0, neighborWeight);
  let densityRatio = density / norm;
  let sparseNeighborBias = clamp((6.0 - neighborWeight) / 6.0, 0.0, 1.0);
  let pressureBias = max(0.0, densityRatio * targetDensity - targetDensity) / targetDensity * (1.0 - sparseNeighborBias * 0.45);
  let cohesionBias = clamp((targetDensity - densityRatio * targetDensity) / targetDensity, 0.0, 1.0) * (0.55 + sparseNeighborBias * 0.45);
  let averageNeighborVelocity = velocityMean / max(0.0001, density);
  var pressureForce = vec3f(0.0);
  var viscosityForce = vec3f(0.0);
  var cohesionForce = vec3f(0.0);
  for (var i: u32 = 0u; i < sampleCount; i = i + 1u) {
    let stride = 2246822519u + i * 3266489917u;
    let candidate = (base + stride) % count;
    if (candidate == idx) { continue; }
    let otherPos = posIn[candidate].xyz;
    let otherVel = velIn[candidate].xyz;
    let r = pos - otherPos;
    let r2 = dot(r, r);
    if (r2 < h2 && r2 > 0.0001) {
      let dist = sqrt(r2);
      let q = dist / h;
      let kernel = max(0.0, 1.0 - q);
      let gradKernel = kernel * kernel;
      let viscKernel = kernel;
      let dir = normalize(r + vec3f(0.0001));
      pressureForce += dir * pressureBias * gradKernel * stiffness;
      viscosityForce += (otherVel - vel) * viscKernel * damp;
      cohesionForce -= dir * cohesionBias * gradKernel * pressure * cohesionStrength;
    }
  }
  let densityScale = 1.0 / targetDensity;
  let neighborVelocityPull = clamp(damp * 0.18, 0.12, 0.3);
  let flow = (pressureForce * densityScale + viscosityForce + (averageNeighborVelocity - vel) * neighborVelocityPull + cohesionForce) * (11.0 / norm);
  let flowLen = length(flow);
  let flowLimit = max(7.0, h * max(0.12, flowClampScale));
  return select(flow, normalize(flow) * flowLimit, flowLen > flowLimit);
}

fn computeMagneticVelocity(vel: vec3f, strength: f32, bx: f32, by: f32, bz: f32) -> vec3f {
  let field = vec3f(bx, by, bz);
  let fieldLen = length(field);
  let normalizedField = select(vec3f(0.0, 1.0, 0.0), field / fieldLen, fieldLen > 0.0001);
  return cross(vel, normalizedField) * strength;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= u.texSize * u.texSize) { return; }
  var pos = posIn[idx].xyz;
  var vel = velIn[idx].xyz;

  vel.y -= u.gravity * u.delta * 9.8;

  if (u.turbulence > 0.001) {
    let t = u.time * 0.25;
    let np = pos * 0.007;
    vel += vec3f(vnoise(np+vec3f(t,0,0)),
                 vnoise(np+vec3f(0,t+13.7,0)),
                 vnoise(np+vec3f(0,0,t+27.4))) * u.turbulence * 18.0 * u.delta;
  }

  if (u.curlStrength > 0.001) {
    let curlScale = max(0.0001, u.curlScale);
    let np = pos * curlScale + vec3f(u.time * 0.08, u.time * 0.05, u.time * 0.11);
    let flow = vec3f(
      vnoise(np + vec3f(0.0, 13.1, 7.9)),
      vnoise(np.yzx + vec3f(17.3, 0.0, 11.7)),
      vnoise(np.zxy + vec3f(5.7, 19.9, 0.0))
    );
    vel += normalize(flow + vec3f(0.0001)) * u.curlStrength * 14.0 * u.delta;
  }

  if (u.windStrength > 0.001) {
    let windDir = vec3f(u.windX, u.windY, u.windZ);
    let dirLen = length(windDir);
    let normalizedWind = select(vec3f(0.0, 1.0, 0.0), windDir / dirLen, dirLen > 0.0001);
    let gust = 1.0 + sin(u.time * 1.7 + pos.x * 0.013 + pos.z * 0.011) * u.windGust;
    vel += normalizedWind * u.windStrength * gust * 10.0 * u.delta;
  }

  if (u.vFieldStrength > 0.001) {
    let field = computeVectorField(pos, u.vFieldType, u.vFieldScale);
    vel += normalize(field + vec3f(0.0001)) * length(field) * u.vFieldStrength * 8.0 * u.delta;
  }

  if (u.wellStrength > 0.001) {
    let toCenter = -pos;
    let d = length(toCenter) + max(0.001, u.wellSoftening);
    vel += (toCenter / max(0.0001, d * d)) * u.wellStrength * u.delta * 2000.0;
    let tangent = cross(normalize(toCenter + vec3f(0.001, 0.0, 0.0)), vec3f(0.0, 1.0, 0.0));
    vel += tangent * u.wellOrbit * u.delta * 50.0;
  }

  if (u.vortexStrength > 0.001) {
    let vortexFlow = computeVortexVelocity(pos, u.vortexTilt);
    vel += normalize(vortexFlow + vec3f(0.0001)) * length(vortexFlow) * u.vortexStrength * 11.0 * u.delta;
  }

  if (u.attractorStrength > 0.001) {
    let attractorFlow = computeAttractorVelocity(pos, u.attractorType, u.attractorScale);
    vel += normalize(attractorFlow + vec3f(0.0001)) * u.attractorStrength * u.delta * 40.0;
  }

  if (u.fluidStrength > 0.001) {
    let fluidFlow = computeFluidVelocity(pos, u.time, u.fluidScale, u.fluidExtForce);
    vel.x += fluidFlow.x * u.fluidInfluence * u.fluidStrength * u.delta * 120.0;
    vel.z += fluidFlow.z * u.fluidInfluence * u.fluidStrength * u.delta * 120.0;
  }

  if (u.boidsSeparation > 0.001 || u.boidsAlignment > 0.001 || u.boidsCohesion > 0.001) {
    let boidsFlow = computeBoidsVelocity(pos, vel, u.time, u.boidsRadius);
    vel += boidsFlow * u.delta * 16.0;
  }

  if (u.nbodyStrength > 0.001) {
    let nbodyFlow = computeNBodyVelocity(pos, u.time, u.nbodyStrength, max(0.5, u.nbodyRepulsion), max(0.1, u.nbodySoftening), max(2.0, u.nbodySampleCount));
    vel += nbodyFlow * u.delta * 500.0;
  }

  if (u.magneticStrength > 0.001) {
    let magneticFlow = computeMagneticVelocity(vel, u.magneticStrength, u.magneticBX, u.magneticBY, u.magneticBZ);
    vel += magneticFlow * u.delta * 40.0;
  }

  if (u.springStrength > 0.001) {
    let spawnPos = initPos[idx].xyz;
    vel += (spawnPos - pos) * u.springStrength * u.delta * 3.0;
  }

  if (u.elasticStrength > 0.001) {
    vel -= pos * u.elasticStrength * u.delta * 2.0;
  }

  if (u.sphPressure > 0.001 || u.sphViscosity > 0.001) {
    let sphFlow = computeSphVelocity(idx, pos, vel, u.texSize, u.sphPressure, u.sphViscosity, u.sphRadius, u.sphRestDensity, u.sphSampleCount, u.sphFlowClampScale, u.sphCohesion);
    vel += sphFlow * u.delta;
  }

  if (u.mouseStrength > 0.001) {
    let mousePos = vec3f(u.mouseX, u.mouseY, u.mouseZ);
    let toMouse = mousePos - pos;
    let md = length(toMouse);
    if (md < u.mouseRadius && md > 0.001) {
      var falloff = 1.0 - md / max(0.001, u.mouseRadius);
      falloff = falloff * falloff;
      let dir = normalize(toMouse);
      if (u.mouseMode < 0.5) {
        vel += dir * falloff * u.mouseStrength * u.delta * 200.0;
      } else if (u.mouseMode < 1.5) {
        vel -= dir * falloff * u.mouseStrength * u.delta * 200.0;
      } else {
        let swirl = cross(dir, vec3f(0.0, 1.0, 0.001));
        vel += normalize(swirl + vec3f(0.0001)) * falloff * u.mouseStrength * u.delta * 150.0;
      }
    }
  }

  if (u.sdfEnabled > 0.5) {
    let sdfHit = computeSdfCollision(pos, u.sdfShape, u.sdfX, u.sdfY, u.sdfZ, u.sdfSize);
    let sn = sdfHit.xyz;
    let sd = sdfHit.w;
    if (sd < 2.0) {
      let vn = dot(vel, sn);
      if (vn < 0.0) {
        vel -= sn * vn * (1.0 + u.sdfBounce);
      }
    }
  }

  let spd = length(vel);
  if (spd > 350.0) { vel *= 350.0 / spd; }
  vel *= (1.0 - 1.1 * u.delta);

  let dist = length(pos);
  if (dist > u.bounceRadius) {
    let n = pos / dist;
    let vn = dot(vel, n);
    if (vn > 0.0) { vel -= n * vn * (1.0 + u.bounce); }
  }
  velOut[idx] = vec4f(vel, 0.0);
}
`;

const POS_WGSL = /* wgsl */ `
struct Uniforms {
  texSize : u32,
  delta   : f32,
  speed   : f32,
  bounceRadius : f32,
  verletEnabled : f32,
  ageEnabled : f32,
  ageMax : f32,
  sdfEnabled : f32,
  sdfShape : f32,
  sdfX : f32,
  sdfY : f32,
  sdfZ : f32,
  sdfSize : f32,
  sdfBounce : f32,
};
@group(0) @binding(0) var<uniform>             u       : Uniforms;
@group(0) @binding(1) var<storage, read>       posIn   : array<vec4f>;
@group(0) @binding(2) var<storage, read>       velIn   : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> posOut  : array<vec4f>;
@group(0) @binding(4) var<storage, read>       prevPos : array<vec4f>;

fn hash1(x: f32) -> f32 {
  return fract(sin(x * 127.1 + 311.7) * 43758.5453);
}

fn sdBox(p: vec3f, b: vec3f) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

fn computeSdfCollision(pos: vec3f, sdfShape: f32, sdfX: f32, sdfY: f32, sdfZ: f32, sdfSize: f32) -> vec4f {
  let sc = vec3f(sdfX, sdfY, sdfZ);
  var sd = 0.0;
  var sn = vec3f(0.0, 1.0, 0.0);
  if (sdfShape < 0.5) {
    let dp = pos - sc;
    sd = length(dp) - sdfSize;
    sn = normalize(dp + vec3f(0.0001));
  } else if (sdfShape < 1.5) {
    let dq = pos - sc;
    let aq = abs(dq);
    let dd = aq - vec3f(sdfSize);
    sd = sdBox(dq, vec3f(sdfSize));
    if (max(dd.x, max(dd.y, dd.z)) > 0.0) {
      sn = normalize(max(dd, vec3f(0.0)) * sign(dq) + vec3f(0.0001));
    } else if (dd.x > dd.y && dd.x > dd.z) {
      sn = vec3f(sign(dq.x), 0.0, 0.0);
    } else if (dd.y > dd.z) {
      sn = vec3f(0.0, sign(dq.y), 0.0);
    } else {
      sn = vec3f(0.0, 0.0, sign(dq.z));
    }
  } else if (sdfShape < 2.5) {
    let lp = pos - sc;
    let r2 = sdfSize * 0.35;
    let ringD = length(lp.xz) - sdfSize;
    sd = length(vec2f(ringD, lp.y)) - r2;
    let lxz = length(lp.xz) + 0.001;
    sn = normalize(vec3f(lp.x / lxz * ringD, lp.y, lp.z / lxz * ringD) + vec3f(0.0001));
  } else {
    let yc = clamp(pos.y - sc.y, -sdfSize, sdfSize);
    let dp = vec3f(pos.x - sc.x, pos.y - sc.y - yc, pos.z - sc.z);
    sd = length(dp) - sdfSize * 0.4;
    sn = normalize(dp + vec3f(0.0001));
  }
  return vec4f(sn, sd);
}

fn hash1(x: f32) -> f32 {
  return fract(sin(x * 127.1 + 311.7) * 43758.5453);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= u.texSize * u.texSize) { return; }
  var pos = posIn[idx].xyz;
  var age = posIn[idx].w;
  let vel = velIn[idx].xyz;
  if (u.verletEnabled > 0.5) {
    let previous = prevPos[idx].xyz;
    pos = pos + (pos - previous) * 0.98 + vel * u.delta * u.speed * 30.0;
  } else {
    pos += vel * u.delta * u.speed * 60.0;
  }
  let dist = length(pos);
  if (dist > u.bounceRadius * 1.05) { pos = normalize(pos) * u.bounceRadius * 1.05; }
  if (u.sdfEnabled > 0.5) {
    let sdfHit = computeSdfCollision(pos, u.sdfShape, u.sdfX, u.sdfY, u.sdfZ, u.sdfSize);
    let sn = sdfHit.xyz;
    let sd = sdfHit.w;
    if (sd < 0.0) {
      pos -= sn * sd;
    }
  }
  if (u.ageEnabled > 0.5) {
    age = age + u.delta;
    if (age > max(0.001, u.ageMax)) {
      let seed = f32(idx) + age * 13.37;
      let r = u.bounceRadius * (0.05 + hash1(seed + 1.0) * 0.9);
      let th = hash1(seed + 2.3) * 6.2831853;
      let phi = acos(clamp(hash1(seed + 4.7) * 2.0 - 1.0, -1.0, 1.0));
      pos = vec3f(
        r * sin(phi) * cos(th),
        r * sin(phi) * sin(th),
        r * cos(phi)
      );
      age = 0.0;
    }
  }
  posOut[idx] = vec4f(pos, age);
}
`;

export type WebGPUComputeReadbackResult = {
  positions: Float32Array;
  velocities: Float32Array;
};

export type WebGPUComputeState = {
  device: GPUDevice;
  velPipeline: GPUComputePipeline;
  posPipeline: GPUComputePipeline;
  posABuf: GPUBuffer;
  posBBuf: GPUBuffer;
  velABuf: GPUBuffer;
  velBBuf: GPUBuffer;
  prevPosBuf: GPUBuffer;
  initPosBuf: GPUBuffer;
  velUBuf: GPUBuffer;
  posUBuf: GPUBuffer;
  stagingPosBuf: GPUBuffer;
  stagingVelBuf: GPUBuffer;
  texSize: number;
  velUData: Float32Array<ArrayBuffer>;
  posUData: Float32Array<ArrayBuffer>;
  readbackPending: boolean;
};

function isWebGpuAvailable() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator && Boolean(navigator.gpu);
}

function unmapIfMapped(buffer: GPUBuffer) {
  if (buffer.mapState === 'mapped') buffer.unmap();
}

export async function initWebGPUCompute(
  texSize: number,
  initialPos: Float32Array,
  initialVel: Float32Array,
): Promise<WebGPUComputeState | null> {
  if (!isWebGpuAvailable()) return null;

  let adapter: GPUAdapter | null;
  try {
    adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return null;
  } catch {
    return null;
  }

  const device = await adapter.requestDevice();
  const count = texSize * texSize;
  const byteSize = count * 4 * 4;

  const bufOpts: GPUBufferDescriptor = {
    size: byteSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  };

  const posABuf = device.createBuffer(bufOpts);
  const posBBuf = device.createBuffer(bufOpts);
  const velABuf = device.createBuffer(bufOpts);
  const velBBuf = device.createBuffer(bufOpts);
  const prevPosBuf = device.createBuffer(bufOpts);
  const initPosBuf = device.createBuffer(bufOpts);

  device.queue.writeBuffer(posABuf, 0, initialPos.buffer as ArrayBuffer, initialPos.byteOffset, initialPos.byteLength);
  device.queue.writeBuffer(prevPosBuf, 0, initialPos.buffer as ArrayBuffer, initialPos.byteOffset, initialPos.byteLength);
  device.queue.writeBuffer(initPosBuf, 0, initialPos.buffer as ArrayBuffer, initialPos.byteOffset, initialPos.byteLength);
  device.queue.writeBuffer(velABuf, 0, initialVel.buffer as ArrayBuffer, initialVel.byteOffset, initialVel.byteLength);

  const stagingPosBuf = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  const stagingVelBuf = device.createBuffer({
    size: byteSize,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const velUBuf = device.createBuffer({ size: 256, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const posUBuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

  const velModule = device.createShaderModule({ code: VEL_WGSL });
  const posModule = device.createShaderModule({ code: POS_WGSL });

  const velBindGroupEntries: GPUBindGroupLayoutEntry[] = [
    { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
    { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
    { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
    { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
  ];
  const posBindGroupEntries: GPUBindGroupLayoutEntry[] = [
    { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
    { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
    { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
    { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
  ];

  const velBGL = device.createBindGroupLayout({ entries: velBindGroupEntries });
  const posBGL = device.createBindGroupLayout({ entries: posBindGroupEntries });

  const velPipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [velBGL] }),
    compute: { module: velModule, entryPoint: 'main' },
  });
  const posPipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [posBGL] }),
    compute: { module: posModule, entryPoint: 'main' },
  });

  const velUData = new Float32Array(new ArrayBuffer(256));
  const posUData = new Float32Array(new ArrayBuffer(64));

  return {
    device,
    velPipeline,
    posPipeline,
    posABuf,
    posBBuf,
    velABuf,
    velBBuf,
    prevPosBuf,
    initPosBuf,
    velUBuf,
    posUBuf,
    stagingPosBuf,
    stagingVelBuf,
    texSize,
    velUData,
    posUData,
    readbackPending: false,
  };
}

export function stepWebGPUCompute(
  state: WebGPUComputeState,
  pingIsA: boolean,
  delta: number,
  time: number,
  gravity: number,
  turbulence: number,
  bounceRadius: number,
  bounce: number,
  speed: number,
  curlStrength: number,
  curlScale: number,
  windStrength: number,
  windX: number,
  windY: number,
  windZ: number,
  windGust: number,
  vFieldType: number,
  vFieldStrength: number,
  vFieldScale: number,
  wellStrength: number,
  wellSoftening: number,
  wellOrbit: number,
  vortexStrength: number,
  vortexTilt: number,
  attractorType: number,
  attractorStrength: number,
  attractorScale: number,
  mouseStrength: number,
  mouseRadius: number,
  mouseMode: number,
  mouseX: number,
  mouseY: number,
  mouseZ: number,
  fluidInfluence: number,
  fluidScale: number,
  fluidStrength: number,
  fluidExtForce: number,
  boidsSeparation: number,
  boidsAlignment: number,
  boidsCohesion: number,
  boidsRadius: number,
  nbodyStrength: number,
  nbodyRepulsion: number,
  nbodySoftening: number,
  nbodySampleCount: number,
  magneticStrength: number,
  magneticBX: number,
  magneticBY: number,
  magneticBZ: number,
  springStrength: number,
  elasticStrength: number,
  sphPressure: number,
  sphViscosity: number,
  sphRadius: number,
  sphRestDensity: number,
  verletEnabled: number,
  ageEnabled: number,
  ageMax: number,
  sdfEnabled: number,
  sdfShape: number,
  sdfX: number,
  sdfY: number,
  sdfZ: number,
  sdfSize: number,
  sdfBounce: number,
): void {
  const {
    device,
    velPipeline,
    posPipeline,
    posABuf,
    posBBuf,
    velABuf,
    velBBuf,
    prevPosBuf,
    initPosBuf,
    velUBuf,
    posUBuf,
    stagingPosBuf,
    stagingVelBuf,
    texSize,
  } = state;
  const count = texSize * texSize;

  const posIn = pingIsA ? posABuf : posBBuf;
  const posOut = pingIsA ? posBBuf : posABuf;
  const velIn = pingIsA ? velABuf : velBBuf;
  const velOut = pingIsA ? velBBuf : velABuf;
  const sphQuality = getWebgpuSphQualityProfile({
    pressure: sphPressure,
    viscosity: sphViscosity,
    radius: sphRadius,
    restDensity: sphRestDensity,
  });

  const velU = state.velUData;
  velU[1] = delta;
  velU[2] = time;
  velU[3] = gravity;
  velU[4] = turbulence;
  velU[5] = bounceRadius;
  velU[6] = bounce;
  velU[7] = speed;
  velU[8] = curlStrength;
  velU[9] = curlScale;
  velU[10] = windStrength;
  velU[11] = windX;
  velU[12] = windY;
  velU[13] = windZ;
  velU[14] = windGust;
  velU[15] = vFieldType;
  velU[16] = vFieldStrength;
  velU[17] = vFieldScale;
  velU[18] = wellStrength;
  velU[19] = wellSoftening;
  velU[20] = wellOrbit;
  velU[21] = vortexStrength;
  velU[22] = vortexTilt;
  velU[23] = attractorType;
  velU[24] = attractorStrength;
  velU[25] = attractorScale;
  velU[26] = mouseStrength;
  velU[27] = mouseRadius;
  velU[28] = mouseMode;
  velU[29] = mouseX;
  velU[30] = mouseY;
  velU[31] = mouseZ;
  velU[32] = fluidInfluence;
  velU[33] = fluidScale;
  velU[34] = fluidStrength;
  velU[35] = fluidExtForce;
  velU[36] = boidsSeparation;
  velU[37] = boidsAlignment;
  velU[38] = boidsCohesion;
  velU[39] = boidsRadius;
  velU[40] = nbodyStrength;
  velU[41] = nbodyRepulsion;
  velU[42] = nbodySoftening;
  velU[43] = nbodySampleCount;
  velU[44] = magneticStrength;
  velU[45] = magneticBX;
  velU[46] = magneticBY;
  velU[47] = magneticBZ;
  velU[48] = springStrength;
  velU[49] = elasticStrength;
  velU[50] = sphPressure;
  velU[51] = sphViscosity;
  velU[52] = sphRadius;
  velU[53] = sphRestDensity;
  velU[54] = sphQuality.sampleCount;
  velU[55] = sphQuality.flowClampScale;
  velU[56] = sphQuality.cohesionStrength;
  velU[57] = sdfEnabled;
  velU[58] = sdfShape;
  velU[59] = sdfX;
  velU[60] = sdfY;
  velU[61] = sdfZ;
  velU[62] = sdfSize;
  velU[63] = sdfBounce;
  new Uint32Array(velU.buffer)[0] = texSize;
  device.queue.writeBuffer(velUBuf, 0, velU);

  const posU = state.posUData;
  posU[1] = delta;
  posU[2] = speed;
  posU[3] = bounceRadius;
  posU[4] = verletEnabled;
  posU[5] = ageEnabled;
  posU[6] = ageMax;
  posU[7] = sdfEnabled;
  posU[8] = sdfShape;
  posU[9] = sdfX;
  posU[10] = sdfY;
  posU[11] = sdfZ;
  posU[12] = sdfSize;
  posU[13] = sdfBounce;
  new Uint32Array(posU.buffer)[0] = texSize;
  device.queue.writeBuffer(posUBuf, 0, posU);

  const enc = device.createCommandEncoder();

  const velBG = device.createBindGroup({
    layout: velPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: velUBuf } },
      { binding: 1, resource: { buffer: posIn } },
      { binding: 2, resource: { buffer: velIn } },
      { binding: 3, resource: { buffer: velOut } },
      { binding: 4, resource: { buffer: initPosBuf } },
    ],
  });
  const velPass = enc.beginComputePass();
  velPass.setPipeline(velPipeline);
  velPass.setBindGroup(0, velBG);
  velPass.dispatchWorkgroups(Math.ceil(count / 64));
  velPass.end();

  enc.copyBufferToBuffer(posIn, 0, prevPosBuf, 0, count * 16);

  const posBG = device.createBindGroup({
    layout: posPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: posUBuf } },
      { binding: 1, resource: { buffer: posIn } },
      { binding: 2, resource: { buffer: velOut } },
      { binding: 3, resource: { buffer: posOut } },
      { binding: 4, resource: { buffer: prevPosBuf } },
    ],
  });
  const posPass = enc.beginComputePass();
  posPass.setPipeline(posPipeline);
  posPass.setBindGroup(0, posBG);
  posPass.dispatchWorkgroups(Math.ceil(count / 64));
  posPass.end();

  if (!state.readbackPending && stagingPosBuf.mapState === 'unmapped' && stagingVelBuf.mapState === 'unmapped') {
    enc.copyBufferToBuffer(posOut, 0, stagingPosBuf, 0, count * 16);
    enc.copyBufferToBuffer(velOut, 0, stagingVelBuf, 0, count * 16);
  }

  device.queue.submit([enc.finish()]);
}

export async function readbackWebGPUState(
  state: WebGPUComputeState,
  lastResult?: WebGPUComputeReadbackResult,
): Promise<WebGPUComputeReadbackResult> {
  const count = state.texSize * state.texSize;
  const TIMEOUT_MS = 100;
  const fallback: WebGPUComputeReadbackResult = lastResult ?? {
    positions: new Float32Array(count * 4),
    velocities: new Float32Array(count * 4),
  };

  if (
    state.readbackPending
    || state.stagingPosBuf.mapState !== 'unmapped'
    || state.stagingVelBuf.mapState !== 'unmapped'
  ) {
    return fallback;
  }

  state.readbackPending = true;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let timedOut = false;

  const mapPromise = Promise.all([
    state.stagingPosBuf.mapAsync(GPUMapMode.READ, 0, count * 16),
    state.stagingVelBuf.mapAsync(GPUMapMode.READ, 0, count * 16),
  ])
    .then(() => {
      if (timedOut) {
        unmapIfMapped(state.stagingPosBuf);
        unmapIfMapped(state.stagingVelBuf);
        return fallback;
      }

      const posRange = state.stagingPosBuf.getMappedRange(0, count * 16);
      const velRange = state.stagingVelBuf.getMappedRange(0, count * 16);
      const result: WebGPUComputeReadbackResult = {
        positions: new Float32Array(posRange.slice(0)),
        velocities: new Float32Array(velRange.slice(0)),
      };
      state.stagingPosBuf.unmap();
      state.stagingVelBuf.unmap();
      return result;
    })
    .catch(() => {
      unmapIfMapped(state.stagingPosBuf);
      unmapIfMapped(state.stagingVelBuf);
      return fallback;
    })
    .finally(() => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      state.readbackPending = false;
    });

  const timeoutPromise = new Promise<WebGPUComputeReadbackResult>((resolve) => {
    timeoutId = setTimeout(() => {
      timedOut = true;
      resolve(fallback);
    }, TIMEOUT_MS);
  });

  return Promise.race([mapPromise, timeoutPromise]);
}

export async function readbackWebGPUPositions(
  state: WebGPUComputeState,
  lastResult?: Float32Array,
): Promise<Float32Array> {
  const result = await readbackWebGPUState(
    state,
    lastResult ? { positions: lastResult, velocities: new Float32Array(lastResult.length) } : undefined,
  );
  return result.positions;
}

export function destroyWebGPUCompute(state: WebGPUComputeState): void {
  unmapIfMapped(state.stagingPosBuf);
  unmapIfMapped(state.stagingVelBuf);
  state.posABuf.destroy();
  state.posBBuf.destroy();
  state.velABuf.destroy();
  state.velBBuf.destroy();
  state.prevPosBuf.destroy();
  state.velUBuf.destroy();
  state.posUBuf.destroy();
  state.stagingPosBuf.destroy();
  state.stagingVelBuf.destroy();
}
