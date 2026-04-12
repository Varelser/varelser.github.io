// ── Trail vertex (samples velocity for speed-based alpha) ──
export const TRAIL_VERT = /* glsl */ `
  precision highp float;
  uniform sampler2D uPosTex;
  uniform sampler2D uVelTex;
  uniform float uSize;
  attribute vec2 aTexCoord;
  varying float vSpeed;
  void main() {
    vec3 worldPos = texture2D(uPosTex, aTexCoord).xyz;
    vec3 vel      = texture2D(uVelTex, aTexCoord).xyz;
    vSpeed = clamp(length(vel) / 80.0, 0.0, 1.0);
    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    float dist = -mvPos.z;
    gl_PointSize = max(0.3, uSize * (dist > 0.5 ? min(4.0, 500.0 / dist) : 1.0));
    gl_Position  = projectionMatrix * mvPos;
  }
`;

// ── Trail fragment ──
export const TRAIL_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3  uColor;
  uniform float uAlpha;
  uniform float uVelocityScale;
  varying float vSpeed;
  void main() {
    vec2 pc = gl_PointCoord - 0.5;
    float d = length(pc);
    if (d > 0.5) discard;
    float speedMul = mix(1.0, vSpeed, uVelocityScale);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.15, d) * uAlpha * speedMul);
  }
`;

// ── Ribbon vertex (quad-strip between adjacent trail frames) ──
export const RIBBON_VERT = /* glsl */ `
  precision highp float;
  attribute vec2  aTexCoord;
  attribute float aSide;
  attribute float aIsB;
  uniform sampler2D uPosTexA;
  uniform sampler2D uPosTexB;
  uniform float uWidth;
  uniform float uMaxSegLen;
  varying float vAlpha;
  varying float vRibbonU;
  varying float vRibbonV;
  void main() {
    vec3 posA = texture2D(uPosTexA, aTexCoord).xyz;
    vec3 posB = texture2D(uPosTexB, aTexCoord).xyz;
    vec3 pos  = mix(posA, posB, aIsB);
    vRibbonV  = aIsB;
    vRibbonU  = aSide;
    float segLen = length(posB - posA);
    if (segLen > uMaxSegLen) {
      vAlpha = 0.0;
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    vec3 dir = segLen > 0.001 ? normalize(posB - posA) : vec3(0.0, 1.0, 0.0);
    vec3 toCamera = normalize(cameraPosition - pos);
    vec3 right = cross(dir, toCamera);
    float rLen = length(right);
    right = rLen > 0.001 ? right / rLen : vec3(1.0, 0.0, 0.0);
    pos += right * aSide * uWidth * 0.5;
    vAlpha = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// ── Ribbon fragment ──
export const RIBBON_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3  uColor;
  uniform float uAlpha;
  uniform float uTaper;
  varying float vAlpha;
  varying float vRibbonU;
  varying float vRibbonV;
  void main() {
    if (vAlpha < 0.01) discard;
    float edge    = smoothstep(1.0, 0.5, abs(vRibbonU));
    float ageFade = mix(1.0 - uTaper, 1.0, vRibbonV);
    gl_FragColor  = vec4(uColor, uAlpha * edge * ageFade);
  }
`;

// ── Tube vertex (8-sided circular cross-section trail) ──
export const TUBE_SIDES = 8;
export const TUBE_VERT = /* glsl */ `
  precision highp float;
  attribute vec2  aTexCoord;
  attribute float aTubeSide;
  attribute float aIsB;
  uniform sampler2D uPosTexA;
  uniform sampler2D uPosTexB;
  uniform float uTubeRadius;
  uniform float uMaxSegLen;
  varying float vAlpha;
  varying float vRibbonV;
  const float PI2 = 6.28318530718;
  const float SIDES = ${TUBE_SIDES}.0;
  void main() {
    vec3 posA = texture2D(uPosTexA, aTexCoord).xyz;
    vec3 posB = texture2D(uPosTexB, aTexCoord).xyz;
    vec3 pos  = mix(posA, posB, aIsB);
    vRibbonV  = aIsB;
    float segLen = length(posB - posA);
    if (segLen > uMaxSegLen) { vAlpha = 0.0; gl_Position = vec4(2.0,2.0,2.0,1.0); return; }
    vec3 dir = segLen > 0.001 ? normalize(posB - posA) : vec3(0.0, 1.0, 0.0);
    vec3 up    = abs(dir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 right = normalize(cross(dir, up));
    vec3 up2   = normalize(cross(right, dir));
    float angle = PI2 * aTubeSide / SIDES;
    pos += (right * cos(angle) + up2 * sin(angle)) * uTubeRadius;
    vAlpha = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// ── Tube fragment ──
export const TUBE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3  uColor;
  uniform float uAlpha;
  uniform float uTaper;
  varying float vAlpha;
  varying float vRibbonV;
  void main() {
    if (vAlpha < 0.01) discard;
    float ageFade = mix(1.0 - uTaper, 1.0, vRibbonV);
    gl_FragColor  = vec4(uColor, uAlpha * ageFade);
  }
`;

// ── Streak vertex (velocity-direction line segments) ──
export const STREAK_VERT = /* glsl */ `
  precision highp float;
  attribute vec2  aTexCoord;
  attribute float aIsEnd;
  uniform sampler2D uPosTex;
  uniform sampler2D uVelTex;
  uniform float uStreakLength;
  uniform bool  uAgeEnabled;
  uniform float uAgeMax;
  varying float vEndAlpha;
  varying float vNormAge;
  void main() {
    vec4 posData = texture2D(uPosTex, aTexCoord);
    vec3 pos     = posData.xyz;
    vec3 vel     = texture2D(uVelTex, aTexCoord).xyz;
    float spd    = length(vel);
    vEndAlpha    = 1.0 - aIsEnd;
    vNormAge     = uAgeEnabled ? clamp(posData.w / max(uAgeMax, 0.001), 0.0, 1.0) : 0.5;
    vec3 worldPos = pos - normalize(vel + vec3(0.0001)) * aIsEnd * uStreakLength * min(spd * 0.05, 1.0);
    gl_Position   = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`;

// ── Streak fragment ──
export const STREAK_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3  uColor;
  uniform float uOpacity;
  uniform bool  uAgeEnabled;
  uniform float uAgeFadeIn;
  uniform float uAgeFadeOut;
  varying float vEndAlpha;
  varying float vNormAge;
  void main() {
    float ageFade = 1.0;
    if (uAgeEnabled) {
      ageFade  = smoothstep(0.0, uAgeFadeIn, vNormAge);
      ageFade *= smoothstep(1.0, 1.0 - uAgeFadeOut, vNormAge);
    }
    gl_FragColor = vec4(uColor, uOpacity * vEndAlpha * ageFade);
  }
`;

