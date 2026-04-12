export const simVertex = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const simFragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D previousTexture;
  uniform vec2 texel;
  uniform float feed;
  uniform float kill;
  uniform float dA;
  uniform float dB;
  uniform float dt;
  uniform float time;
  uniform float warp;
  uniform float pulse;
  uniform float flowAniso;
  uniform float reactionBoost;

  vec2 sampleAB(vec2 uv) {
    return texture2D(previousTexture, uv).xy;
  }

  void main() {
    vec2 uv = vUv;
    vec2 flow = vec2(
      sin((uv.y + time * 0.05) * 12.0) * 0.5 + cos((uv.x - time * 0.03) * 9.0),
      cos((uv.x + time * 0.04) * 11.0) * 0.5 - sin((uv.y + time * 0.02) * 13.0)
    ) * texel * warp * (0.8 + pulse * 0.6);
    flow.x *= mix(1.0, 0.62, clamp(flowAniso, 0.0, 1.0));
    flow.y *= mix(1.0, 1.28, clamp(flowAniso, 0.0, 1.0));

    vec2 center = sampleAB(uv + flow);
    vec2 north = sampleAB(uv + vec2(0.0, texel.y) + flow);
    vec2 south = sampleAB(uv - vec2(0.0, texel.y) + flow);
    vec2 east = sampleAB(uv + vec2(texel.x, 0.0) + flow);
    vec2 west = sampleAB(uv - vec2(texel.x, 0.0) + flow);
    vec2 ne = sampleAB(uv + vec2(texel.x, texel.y) + flow);
    vec2 nw = sampleAB(uv + vec2(-texel.x, texel.y) + flow);
    vec2 se = sampleAB(uv + vec2(texel.x, -texel.y) + flow);
    vec2 sw = sampleAB(uv + vec2(-texel.x, -texel.y) + flow);

    vec2 lap = (north + south + east + west) * 0.2 + (ne + nw + se + sw) * 0.05 - center;
    float A = center.x;
    float B = center.y;
    float reaction = A * B * B * reactionBoost;
    float audioFeed = pulse * 0.006;
    float nextA = A + (dA * lap.x - reaction + (feed + audioFeed) * (1.0 - A)) * dt;
    float nextB = B + (dB * lap.y + reaction - (kill + feed + audioFeed * 0.35) * B) * dt;
    nextA = clamp(nextA, 0.0, 1.0);
    nextB = clamp(nextB, 0.0, 1.0);
    gl_FragColor = vec4(nextA, nextB, 0.0, 1.0);
  }
`;

export const displayVertex = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormalDir;
  uniform float bulge;
  uniform float rimPinch;
  uniform float shear;
  uniform float tiltX;
  uniform float tiltY;
  uniform float curl;
  uniform float depthBands;
  uniform float frontBias;
  uniform float sourceOrbit;
  uniform float sourceLedger;
  uniform float sourceCanopy;
  uniform float sourceColumn;

  void main() {
    vUv = uv;
    vec3 pos = position;
    vec2 centered = uv - 0.5;
    vec2 ab = texture2D(reactionTexture, uv).xy;
    float radius = length(centered);
    float angle = atan(centered.y, centered.x);
    float front = smoothstep(-0.46, 0.62, centered.x + frontBias * 0.28 + centered.y * 0.08);
    float ring = smoothstep(0.12, 0.48, radius) * (1.0 - smoothstep(0.5, 0.72, radius));
    float canopy = smoothstep(0.88, -0.24, uv.y) * sourceCanopy;
    float ledger = sin((centered.y + centered.x * 0.1) * (10.0 + sourceLedger * 42.0)) * sourceLedger;
    float orbit = sin(angle * (3.0 + sourceOrbit * 4.0) + radius * (12.0 + sourceOrbit * 16.0)) * sourceOrbit;
    float column = smoothstep(0.34, 0.02, abs(centered.x + sin(centered.y * 12.0) * 0.04)) * sourceColumn;
    float bands = sin((centered.y - centered.x * 0.35 + front * 0.22) * (8.0 + depthBands * 18.0));
    float pattern = clamp(ab.y - ab.x * 0.35 + 0.5, 0.0, 1.0);
    float contour = smoothstep(0.18, 0.18 + 0.54 / max(0.2, contourTightness), pattern) - smoothstep(0.62, 0.96, pattern);
    float pool = smoothstep(0.54, 0.96, pattern);
    float ridges = contour * (0.45 + bands * 0.55) * ridgeGain;
    float pits = (1.0 - pool) * pitGain * (0.4 + ring * 0.6);
    float scars = abs(sin((centered.x - centered.y * 0.3) * 26.0 + orbit * 2.4)) * scarStrength * (0.2 + front * 0.8);
    float wetLift = pool * wetness * (0.35 + canopy * 0.65);
    float reactionHeight = (pattern - 0.5) * heightGain * 56.0 + ridges * 32.0 - pits * 24.0 + wetLift * 18.0 - scars * 10.0;

    pos.z += (1.0 - radius * 1.7) * bulge * 90.0;
    pos.z -= ring * rimPinch * 44.0;
    pos.z += bands * depthBands * 12.0;
    pos.z += reactionHeight;
    pos.z += orbit * 10.0 + canopy * 16.0 + column * 12.0 + ledger * 7.0;
    pos.x += centered.y * shear * 52.0 + orbit * 6.0 + ledger * 5.0 + scars * 4.0;
    pos.y += centered.x * curl * 46.0 + canopy * 14.0 + front * frontBias * 10.0 + wetLift * 6.0;

    float cosX = cos(tiltX);
    float sinX = sin(tiltX);
    vec2 yz = mat2(cosX, -sinX, sinX, cosX) * vec2(pos.y, pos.z);
    pos.y = yz.x;
    pos.z = yz.y;

    float cosY = cos(tiltY);
    float sinY = sin(tiltY);
    vec2 xz = mat2(cosY, sinY, -sinY, cosY) * vec2(pos.x, pos.z);
    pos.x = xz.x;
    pos.z = xz.y;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    vNormalDir = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const displayFragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormalDir;
  uniform sampler2D reactionTexture;
  uniform vec3 baseColor;
  uniform float opacity;
  uniform float time;
  uniform float audioReactive;
  uniform float pulse;
  uniform float poolMix;
  uniform float colonyBands;
  uniform float cellScale;
  uniform float contourTightness;
  uniform float hueShift;
  uniform float lightnessShift;
  uniform float ridgeGain;
  uniform float pitGain;
  uniform float wetness;
  uniform float scarStrength;

  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0., -1./3., 2./3., -1.);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6. * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0., 1./3., 2./3.)) * 6. - 3.);
    return c.z * mix(vec3(1.), clamp(p - 1., 0., 1.), c.y);
  }

  void main() {
    vec2 ab = texture2D(reactionTexture, vUv).xy;
    float cell = 0.5 + 0.5 * sin((vUv.x + vUv.y) * 24.0 * cellScale + time * 0.08);
    float pattern = clamp(ab.y - ab.x * 0.35 + 0.5, 0.0, 1.0);
    float contour = smoothstep(0.2, 0.2 + 0.6 / contourTightness, pattern) - smoothstep(0.62, 0.98, pattern);
    float pool = smoothstep(0.52, 0.96, pattern + cell * poolMix * 0.22);
    float bands = 0.5 + 0.5 * sin((vUv.y - vUv.x * 0.4 + time * 0.02) * 36.0 * colonyBands);
    float shimmer = sin((vUv.x + vUv.y + time * 0.08) * 48.0) * 0.5 + 0.5;
    float pits = smoothstep(0.04, 0.42 + pitGain * 0.3, 1.0 - pattern) * pitGain;
    float scars = abs(sin((vUv.x - vUv.y * 0.3 + time * 0.01) * 42.0)) * scarStrength * (0.2 + bands * 0.8);
    float wetMask = pool * wetness;
    float edge = pow(1.0 - abs(dot(normalize(cameraPosition - vWorld), normalize(vNormalDir))), 2.2);
    vec3 accent = mix(baseColor * 0.3, vec3(1.0), contour * (0.46 + ridgeGain * 0.28) + shimmer * 0.18 + pulse * audioReactive * 0.25);
    vec3 color = mix(baseColor * 0.08, accent, smoothstep(0.08, 0.92, pattern));
    color = mix(color, color * (0.76 + bands * 0.36), colonyBands * 0.4);
    color = mix(color, color + vec3(0.12, 0.18, 0.06) * pool, poolMix * 0.5);
    color = mix(color, color * (0.68 + pits * 0.34) + vec3(0.04, 0.025, 0.015) * pits, pitGain * 0.58);
    color = mix(color, color + vec3(0.08, 0.12, 0.14) * wetMask + vec3(1.0) * wetMask * edge * 0.12, wetness * 0.62);
    color = mix(color, color * (0.82 + scars * 0.18), scarStrength * 0.45);
    vec3 hsv = rgb2hsv(clamp(color, 0.0, 1.0));
    hsv.x = fract(hsv.x + hueShift);
    hsv.z = clamp(hsv.z + lightnessShift, 0.0, 1.0);
    color = hsv2rgb(hsv);
    float alpha = clamp(opacity * (0.24 + contour * (1.02 + ridgeGain * 0.3) + edge * (0.46 + wetness * 0.18) + pool * poolMix * 0.2 - pits * 0.12), 0.0, 1.0);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;
