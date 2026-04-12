import{r as A,j as S}from"./react-vendor-BLE9nPfI.js";import{u as z}from"./r3f-fiber-CBj7iv8R.js";import{b as T}from"./scene-runtime-motion-B_7blSTV.js";import{c as v,n as B}from"./three-core-CZYXVIXO.js";const y=8;function P(e,t,i){var p,f,m;let a=null,o=1,l=0;t===1?(a=((p=e.layer1SourcePositions)==null?void 0:p[i])??null,o=e.layer1SourceCount||1,l=e.layer1SourceSpread||0):t===2?(a=((f=e.layer2SourcePositions)==null?void 0:f[i])??null,o=e.layer2SourceCount||1,l=e.layer2SourceSpread||0):(a=((m=e.layer3SourcePositions)==null?void 0:m[i])??null,o=e.layer3SourceCount||1,l=e.layer3SourceSpread||0);let s=(a==null?void 0:a.x)??0,n=(a==null?void 0:a.y)??0,r=(a==null?void 0:a.z)??0;if(l>0&&o>1){const c=i/o*Math.PI*2;s+=Math.cos(c)*l,r+=Math.sin(c)*l}return new v(s,n,r)}function d(e,t){if(!(t===1?e.layer1Enabled:t===2?e.layer2Enabled:e.layer3Enabled))return[];const a=t===1?Math.max(1,e.layer1SourceCount||1):t===2?Math.max(1,e.layer2SourceCount||1):Math.max(1,e.layer3SourceCount||1),o=t===1?e.sphereRadius:t===2?e.sphereRadius*e.layer2RadiusScale:e.sphereRadius*e.layer3RadiusScale,l=t===1?e.layer1Radii:t===2?e.layer2RadiusScales:e.layer3RadiusScales;return Array.from({length:a},(s,n)=>({center:P(e,t,n),radius:o*Math.max(.2,(l==null?void 0:l[n])??1)}))}function h(e,t){const i=d(e,t);if(i.length===0)return{enabled:!1,center:new v,radius:0};const a=i.map(s=>s.center),o=a.reduce((s,n)=>s.add(n),new v).multiplyScalar(1/a.length);let l=0;return i.forEach(s=>{l=Math.max(l,s.center.distanceTo(o)+s.radius)}),{enabled:!0,center:o,radius:l}}function W(e,t){if(!e.interLayerCollisionEnabled)return[];const i=[1,2,3].filter(a=>a!==t);return e.interLayerCollisionMode==="source-volume"?i.flatMap(a=>d(e,a)).filter(a=>a.radius>0).slice(0,y):i.map(a=>h(e,a)).filter(a=>a.enabled&&a.radius>0).map(a=>({center:a.center,radius:a.radius})).slice(0,y)}function M(e,t,i){const a=e.radius+t.radius+i;if(a<=0)return 0;const o=e.center.distanceTo(t.center);return B.clamp((a-o)/a,0,1)}function N(e){if(!e.interLayerCollisionEnabled)return 0;const i=[[1,2],[1,3],[2,3]].map(([a,o])=>{const l=e.interLayerCollisionMode==="source-volume"?d(e,a):(()=>{const r=h(e,a);return r.enabled?[{center:r.center,radius:r.radius}]:[]})(),s=e.interLayerCollisionMode==="source-volume"?d(e,o):(()=>{const r=h(e,o);return r.enabled?[{center:r.center,radius:r.radius}]:[]})();let n=0;return l.forEach(r=>{s.forEach(p=>{n=Math.max(n,M(r,p,e.interLayerCollisionPadding))})}),n});return i.length>0?Math.max(...i):0}const x=(e,t,i)=>Math.min(i,Math.max(t,e)),u=(e,t,i)=>{const a=x((i-e)/Math.max(1e-4,t-e),0,1);return a*a*(3-2*a)},L=(e,t)=>{if(t==="loop")return(1-u(0,.32,e))*(.85+Math.sin(e*Math.PI*2)*.15);if(t==="stutter"){const i=1-u(0,.09,Math.abs(e-.12)),a=1-u(0,.09,Math.abs(e-.26)),o=1-u(0,.09,Math.abs(e-.41));return Math.max(i,a,o)}if(t==="heartbeat"){const i=1-u(0,.1,Math.abs(e-.16)),a=1-u(0,.1,Math.abs(e-.31));return Math.max(i,a*.82)}return 1-u(0,.32,e)},b=(e,t,i,a,o,l,s,n,r)=>{if(!e||t<=0)return 0;const p=Math.max(4,i*(1+a*.25)),f=(r*60/p+o)%1,m=L(f,l),c=s?n*.12:0;return x((t+c)*m,0,2)},q=(e,t,i,a=0)=>{const o=i?1:.2,l=b(e.layer2Enabled,e.layer2Burst,e.layer2Life,e.layer2LifeSpread,e.layer2BurstPhase,e.layer2BurstWaveform,e.layer2SparkEnabled,e.layer2SparkBurst,t),s=b(e.layer3Enabled,e.layer3Burst,e.layer3Life,e.layer3LifeSpread,e.layer3BurstPhase,e.layer3BurstWaveform,e.layer3SparkEnabled,e.layer3SparkBurst,t*1.07+.13);return x((l*.85+s)*o*(1+a*.3),0,2)},Y=({config:e,isPlaying:t,children:i})=>{const a=A.useRef(null),o=A.useRef({x:0,y:0});return z(()=>{t&&(o.current.x+=e.rotationSpeedX,o.current.y+=e.rotationSpeedY),a.current&&(a.current.rotation.x=e.manualRotationX+o.current.x,a.current.rotation.y=e.manualRotationY+o.current.y,a.current.rotation.z=e.manualRotationZ)}),S.jsx("group",{ref:a,children:i})},F=`
  vec3 calculateLayerPosition(
    vec3 p, vec3 off, float motionType, float t,
    float speed, float amp, float freq, float radius,
    float phase, float rnd, vec3 wind, float noiseScale,
    float evolution, float complexity, float fluidForce, float viscosity,
    float fidelity, float octaveMult, float affectPos,
    float resistance, float moveWithWind, float neighborForce,
    float collisionMode, float collisionRadius, float repulsion,
    float gravity, float boundaryY, float boundaryEnabled, float boundaryBounce,
    float interLayerEnabled, int interLayerColliderCount, vec4 interLayerColliders[MAX_INTER_LAYER_COLLIDERS], float interLayerStrength,
    float interLayerPadding
  ) {
    vec3 pos = p * radius + off;
    vec3 moved = applyMotion(
      pos, motionType, t, speed, amp, freq, phase, rnd, wind, noiseScale,
      evolution, complexity, fluidForce, viscosity, fidelity, octaveMult
    );
    pos = mix(pos, moved, clamp(affectPos, 0.0, 1.0));
    pos += wind * moveWithWind * t * 0.025;
    pos.y -= gravity * 0.01 * t;

    if (neighborForce != 0.0) {
      pos += normalize(noiseVec(pos * 0.03 + t * 0.3 + rnd) + vec3(0.0001)) * neighborForce * 0.12;
    }

    if (collisionMode > 0.5) {
      float worldRadius = max(1.0, collisionRadius);
      float lenPos = length(pos);
      if (lenPos > worldRadius) {
        vec3 dir = normalize(pos);
        pos = dir * worldRadius - dir * repulsion * 0.01;
      }
    }

    if (boundaryEnabled > 0.5 && pos.y < boundaryY) {
      pos.y = mix(boundaryY, boundaryY + abs(pos.y - boundaryY) * max(0.0, boundaryBounce), 0.75);
    }

    if (interLayerEnabled > 0.5) {
      for (int colliderIndex = 0; colliderIndex < MAX_INTER_LAYER_COLLIDERS; colliderIndex++) {
        if (colliderIndex >= interLayerColliderCount) break;
        vec4 collider = interLayerColliders[colliderIndex];
        float colliderRadius = collider.w;
        if (colliderRadius <= 0.0) continue;
        vec3 delta = pos - collider.xyz;
        float dist = length(delta);
        float reach = colliderRadius + interLayerPadding;
        if (dist < reach) {
          vec3 dir = dist > 0.0001 ? delta / dist : normalize(hash3(rnd + float(colliderIndex)) * 2.0 - 1.0 + vec3(0.0001));
          float overlap = 1.0 - clamp(dist / max(0.0001, reach), 0.0, 1.0);
          pos += dir * overlap * interLayerStrength * 0.1;
        }
      }
    }

    pos *= max(0.0, 1.0 - resistance * 0.025);
    return pos;
  }
`,C=`
    if (motionType < 0.5) {
      result += noiseField * amp * 0.35;
    } else if (motionType < 1.5) {
      result += vec3(noiseField.x, abs(noiseField.y), noiseField.z) * amp * 0.45;
    } else if (motionType < 2.5) {
      result += curlField * amp * max(0.2, fluidForce);
    } else if (motionType < 3.5) {
      result += wind * time * 0.02 + curlField * amp * 0.25;
    } else if (motionType < 4.5) {
      result.y -= abs(sin(time + phase)) * amp * 0.4;
    } else if (motionType < 5.5) {
      result += normalize(p + vec3(0.0001)) * amp * sin(time + phase * 1.7);
    } else if (motionType < 6.5) {
      result += vec3(cos(time + phase), sin(time * 0.8 + phase), cos(time * 0.6 + phase * 0.5)) * amp * 0.3;
    } else if (motionType < 7.5) {
      result += noiseField * amp * attractorScale * 0.2;
    } else if (motionType < 8.5) {
      result += normalize(noiseField + p * 0.2) * amp * 0.22;
    } else if (motionType < 9.5) {
      result += normalize(-p + noiseField * 0.5) * amp * 0.26;
    } else if (motionType < 10.5) {
      result = rotate(result, vec3(0.0, 1.0, 0.0), time * 0.7 + phase) + noiseField * amp * 0.15;
    } else if (motionType < 11.5) {
      result.y += sin((p.x + p.z) * freq + time + phase) * amp * 0.35;
    } else if (motionType < 12.5) {
      result += curlField * amp * 0.45;
    } else if (motionType < 13.5) {
      result += noiseField * amp * 0.4;
    } else if (motionType < 14.5) {
      result += vec3(sin(time + p.y), cos(time + p.z), sin(time + p.x)) * amp * 0.22;
    } else if (motionType < 15.5) {
      result += vec3(
        10.0 * (p.y - p.x),
        p.x * (28.0 - p.z) - p.y,
        p.x * p.y - (8.0 / 3.0) * p.z
      ) * amp * 0.002;
    } else if (motionType < 16.5) {
      result += vec3(
        (p.z - 0.7) * p.x - 3.5 * p.y,
        3.5 * p.x + (p.z - 0.7) * p.y,
        0.6 + 0.95 * p.z - (pow(p.z, 3.0) / 3.0) - (p.x * p.x + p.y * p.y) * (1.0 + 0.25 * p.z) + 0.1 * p.z * pow(p.x, 3.0)
      ) * amp * 0.002;
    } else if (motionType < 17.5) {
      result += vec3(-p.y - p.z, p.x + 0.2 * p.y, 0.2 + p.z * (p.x - 5.7)) * amp * 0.003;
    } else if (motionType < 18.5) {
      result += vec3(sin(p.y) - 0.2 * p.x, sin(p.z) - 0.2 * p.y, sin(p.x) - 0.2 * p.z) * amp * 0.3;
    } else if (motionType < 19.5) {
      result += normalize(-p) * amp * 0.2 + noiseField * viscosity * 0.15;
    } else if (motionType < 20.5) {
      result = rotate(result, vec3(0.0, 1.0, 0.0), amp * 0.015 + time * 0.5);
    } else if (motionType < 21.5) {
      result += (wind + curlField * fluidForce) * amp * 0.08;
    } else if (motionType < 22.5) {
      result += noiseField * amp * 0.12 + wind * 0.05;
    } else if (motionType < 23.5) {
      result = rotate(result, vec3(0.0, 1.0, 0.0), time * 0.35) + normalize(result + vec3(0.0001)) * amp * 0.15;
    } else if (motionType < 24.5) {
      float spiralAngle = atan(p.z, p.x) + time * 0.75;
      float spiralRadius = length(p.xz) + sin(time + p.y) * amp * 0.12;
      result.x = cos(spiralAngle) * spiralRadius;
      result.z = sin(spiralAngle) * spiralRadius;
    } else if (motionType < 25.5) {
      result = rotate(result, normalize(vec3(1.0, 1.0, 0.0)), time * 0.55 + phase);
    } else if (motionType < 26.5) {
      result += normalize(noiseField + vec3(0.0001)) * amp * 0.18;
    } else if (motionType < 27.5) {
      result += noiseField * noiseField * sign(noiseField) * amp * 0.3;
    } else if (motionType < 28.5) {
      result += hash3(rnd * 97.0 + floor(time * 18.0)) * amp * 0.25 - amp * 0.125;
    } else if (motionType < 29.5) {
      float angle = atan(p.z, p.x) + time * 0.4;
      float radius = length(p.xz) + sin(time + phase) * amp * 0.12;
      result.x = cos(angle * 1.618) * radius;
      result.z = sin(angle * 1.618) * radius;
    } else if (motionType < 30.5) {
      float rose = cos(5.0 * atan(p.z, p.x) + time) * amp * 0.18;
      result += normalize(p + vec3(0.0001)) * rose;
    } else if (motionType < 31.5) {
      float ridge = abs(fbm(fieldPos * 1.6, octaves, lacunarity) * 2.0 - 1.0);
      result += normalize(noiseField + curlField) * ridge * amp * 0.32;
    } else if (motionType < 32.5) {
      result.x = sin(time * 1.7 + phase + p.y * 0.02) * amp * 0.55 + p.x * 0.35;
      result.y = sin(time * 2.3 + phase * 1.3 + p.z * 0.02) * amp * 0.45 + p.y * 0.2;
      result.z = sin(time * 2.9 + phase * 0.7 + p.x * 0.02) * amp * 0.55 + p.z * 0.35;
    } else if (motionType < 33.5) {
      float torusAngle = atan(p.z, p.x) + time * 0.55;
      float torusMinor = sin(time * 1.4 + phase + p.y * 0.03) * amp * 0.18;
      float torusMajor = max(10.0, length(p.xz) + amp * 0.12);
      result.x = cos(torusAngle) * (torusMajor + cos(time + phase) * torusMinor);
      result.z = sin(torusAngle) * (torusMajor + sin(time + phase) * torusMinor);
      result.y += sin(torusAngle * 2.0 + time * 1.2) * amp * 0.22;
    } else if (motionType < 34.5) {
      result.x += sin(time * 1.5 + phase) * amp * 0.3;
      result.y += cos(time * 2.1 + phase + p.x * 0.015) * amp * 0.42;
      result.z += sin(time * 1.1 + phase * 0.6) * amp * 0.18;
    } else if (motionType < 35.5) {
      vec3 latticeCell = round((p + noiseField * amp * 0.08) / max(6.0, amp * 0.14));
      vec3 latticeTarget = latticeCell * max(6.0, amp * 0.14);
      result = mix(p, latticeTarget, 0.28) + curlField * amp * 0.08;
    } else if (motionType < 36.5) {
      float baseAngle = atan(p.z, p.x);
      float majorRadius = length(p.xz) * 0.75 + amp * 0.22;
      float minorRadius = amp * 0.18 + 8.0;
      float epicycleAngle = time * 1.4 + phase * 1.7;
      result.x = cos(baseAngle + time * 0.55) * majorRadius + cos(epicycleAngle) * minorRadius;
      result.z = sin(baseAngle + time * 0.55) * majorRadius + sin(epicycleAngle) * minorRadius;
      result.y += sin(time * 1.9 + phase + baseAngle * 2.0) * amp * 0.2;
    } else if (motionType < 37.5) {
      vec3 gyre = vec3(-p.z, sin(time + phase) * 0.5, p.x);
      result += normalize(gyre + curlField * 0.6 + vec3(0.0001)) * amp * 0.28;
      result += noiseField * amp * 0.1;
    } else if (motionType < 38.5) {
      vec3 crystalDir = sign(p + noiseField * 0.25 + vec3(0.0001));
      vec3 crystalTarget = crystalDir * length(p) * 0.78;
      result = mix(p, crystalTarget, 0.24) + noiseField * amp * 0.06;
    } else if (motionType < 39.5) {
      float ring = sin(length(p.xz) * max(0.02, freq * 0.08) - time * 3.2 + phase);
      result += normalize(vec3(p.x, 0.0, p.z) + vec3(0.0001)) * ring * amp * 0.26;
      result.y += cos(length(p.xz) * 0.04 - time * 2.2 + phase) * amp * 0.18;
    } else if (motionType < 40.5) {
      vec3 folded = vec3(
        abs(sin(p.x * 0.025 + time + phase)),
        abs(sin(p.y * 0.03 + time * 1.3 + phase)),
        abs(sin(p.z * 0.025 + time * 0.8 + phase))
      ) * amp * 0.55;
      result = mix(p, (folded - amp * 0.275) * sign(noiseField + vec3(0.0001)), 0.32);
`,E=`
    } else if (motionType < 41.5) {
      float sectorCount = 6.0;
      float sectorAngle = 6.28318530718 / sectorCount;
      float angle = atan(p.z, p.x) + time * 0.45;
      float mirrored = abs(mod(angle, sectorAngle) - sectorAngle * 0.5);
      float radius = length(p.xz) + sin(time + phase) * amp * 0.14;
      result.x = cos(mirrored) * radius;
      result.z = sin(mirrored) * radius * sign(cos(angle * sectorCount));
      result.y += noiseField.y * amp * 0.2;
    } else if (motionType < 42.5) {
      float braidPhase = time * 1.25 + p.y * 0.035 + phase;
      result.x = sin(braidPhase) * amp * 0.32 + sin(braidPhase * 2.0) * amp * 0.08;
      result.z = cos(braidPhase) * amp * 0.32 - cos(braidPhase * 2.0) * amp * 0.08;
      result.y = p.y + sin(time * 0.9 + phase) * amp * 0.08;
    } else if (motionType < 43.5) {
      float arc = atan(p.y, length(p.xz) + 0.0001);
      result += vec3(
        cos(arc * 4.0 + time * 1.4),
        sin(arc * 3.0 - time * 1.2),
        sin(arc * 5.0 + time * 0.8)
      ) * amp * 0.22;
    } else if (motionType < 44.5) {
      vec3 spoke = normalize(vec3(sign(p.x + 0.0001), sign(p.y + 0.0001), sign(p.z + 0.0001)));
      result = mix(p, spoke * length(p) * 0.85, 0.24) + noiseField * amp * 0.08;
    } else if (motionType < 45.5) {
      float shellRadius = length(p) + sin(length(p) * 0.05 - time * 2.4 + phase) * amp * 0.22;
      vec3 shellDir = normalize(p + vec3(0.0001));
      result = shellDir * shellRadius + curlField * amp * 0.08;
    } else if (motionType < 46.5) {
      float petals = 8.0;
      float angle = atan(p.z, p.x) + time * 0.38;
      float radius = length(p.xz) + cos(angle * petals) * amp * 0.16;
      result.x = cos(angle) * radius;
      result.z = sin(angle) * radius;
      result.y += sin(angle * petals * 0.5 + time) * amp * 0.18;
    } else if (motionType < 47.5) {
      float ribbonPhase = time * 1.35 + phase + p.y * 0.02;
      result.x = sin(ribbonPhase) * amp * 0.28;
      result.z = cos(ribbonPhase * 0.7) * amp * 0.34;
      result.y = p.y + sin(ribbonPhase * 1.8) * amp * 0.14;
    } else if (motionType < 48.5) {
      result += vec3(
        p.y * 0.08 * amp * 0.1,
        sin(time + phase) * amp * 0.12,
        p.x * 0.08 * amp * 0.1
      ) + noiseField * amp * 0.08;
    } else if (motionType < 49.5) {
      float spokeAngle = atan(p.z, p.x);
      float snapped = round(spokeAngle / 0.52359877559) * 0.52359877559;
      float spokeRadius = length(p.xz) + sin(time * 1.4 + phase) * amp * 0.12;
      result.x = cos(snapped) * spokeRadius;
      result.z = sin(snapped) * spokeRadius;
      result.y += noiseField.y * amp * 0.1;
    } else if (motionType < 50.5) {
      float breathe = 1.0 + sin(time * 1.6 + phase + length(p) * 0.02) * 0.22;
      result = p * breathe + normalize(noiseField + vec3(0.0001)) * amp * 0.12;
    } else if (motionType < 51.5) {
      float knotAngle = atan(p.z, p.x) + time * 0.65;
      float knotRadius = length(p.xz) * 0.55 + amp * 0.12;
      float knotWave = cos(knotAngle * 3.0 - time * 1.1 + phase) * amp * 0.18;
      result.x = cos(knotAngle * 2.0) * (knotRadius + knotWave);
      result.z = sin(knotAngle * 2.0) * (knotRadius - knotWave);
      result.y += sin(knotAngle * 3.0 + time * 1.3) * amp * 0.2;
    } else if (motionType < 52.5) {
      float a = 1.7;
      float b = 1.3;
      float c = 1.1;
      float d = 1.7;
      result.x = sin(a * p.y + c * time + phase) * amp * 0.38;
      result.y = sin(b * p.z + d * time + phase * 0.7) * amp * 0.32;
      result.z = sin(a * p.x - b * time + phase * 1.2) * amp * 0.38;
    } else if (motionType < 53.5) {
      float a = 1.25;
      float b = 0.85;
      float c = 0.2;
      float signX = sign(p.x + 0.0001);
      float rootTerm = sqrt(abs(b * p.x - 1.0 - c));
      result.x = p.y - signX * rootTerm * amp * 0.12;
      result.y = a - p.x;
      result.z += sin(time * 1.1 + phase + p.y * 0.03) * amp * 0.22;
    } else if (motionType < 54.5) {
      vec3 cell = floor((p + noiseField * amp * 0.1) / max(10.0, amp * 0.12));
      vec3 local = fract((p + noiseField * amp * 0.1) / max(10.0, amp * 0.12)) - 0.5;
      result = cell * max(10.0, amp * 0.12) + sign(local) * max(2.0, amp * 0.04);
    } else if (motionType < 55.5) {
      vec3 cycloneAxis = normalize(vec3(0.2, 1.0, 0.15));
      result = rotate(result, cycloneAxis, time * 0.9 + length(p.xz) * 0.002);
      result.y += sin(length(p.xz) * 0.04 - time * 2.0 + phase) * amp * 0.18;
    } else if (motionType < 56.5) {
      float petalAngle = atan(p.z, p.x) + time * 0.5;
      float petalRadius = length(p.xz) + cos(petalAngle * 7.0 + phase) * amp * 0.2;
      result.x = cos(petalAngle) * petalRadius;
      result.z = sin(petalAngle) * petalRadius;
      result.y += sin(petalAngle * 3.5 + time) * amp * 0.16;
    } else if (motionType < 57.5) {
      result.x += sin(p.y * 0.04 + time * 1.4 + phase) * amp * 0.18;
      result.z += cos(p.x * 0.04 - time * 1.2 + phase) * amp * 0.18;
      result.y = sin((p.x + p.z) * 0.03 + time * 1.7) * amp * 0.22 + p.y * 0.45;
    } else if (motionType < 58.5) {
      vec3 flareDir = normalize(p + noiseField * 0.3 + vec3(0.0001));
      float flarePulse = 1.0 + sin(time * 2.1 + phase + length(p) * 0.03) * 0.35;
      result = flareDir * length(p) * flarePulse + curlField * amp * 0.1;
    } else if (motionType < 59.5) {
      float mobiusAngle = atan(p.z, p.x) + time * 0.55;
      float mobiusRadius = length(p.xz) * 0.62 + amp * 0.14;
      float twist = sin(mobiusAngle * 0.5 + time + phase) * amp * 0.18;
      result.x = cos(mobiusAngle) * (mobiusRadius + twist);
      result.z = sin(mobiusAngle) * (mobiusRadius + twist);
      result.y = sin(mobiusAngle * 0.5) * twist * 1.6 + p.y * 0.25;
    } else if (motionType < 60.5) {
      result += vec3(
        sin(time * 1.0 + phase + p.x * 0.03),
        sin(time * 1.7 + phase * 0.6 + p.y * 0.025),
        sin(time * 2.3 + phase * 1.1 + p.z * 0.02)
      ) * amp * 0.22;
    } else if (motionType < 61.5) {
      vec3 starDir = normalize(p + vec3(0.0001));
      float star = abs(cos(atan(p.z, p.x) * 6.0 + time * 0.9 + phase));
      result = starDir * length(p) * (0.75 + star * amp * 0.12) + noiseField * amp * 0.05;
    } else if (motionType < 62.5) {
      result.x += sin(p.z * 0.05 + time * 1.4) * amp * 0.18;
      result.z += cos(p.x * 0.05 - time * 1.4) * amp * 0.18;
      result.y += sin((p.x + p.z) * 0.04 + time * 2.0 + phase) * amp * 0.15;
    } else if (motionType < 63.5) {
      float heliAngle = atan(p.z, p.x) + time * 0.8;
      float heliRadius = length(p.xz) + sin(time * 1.5 + phase) * amp * 0.12;
      result.x = cos(heliAngle) * heliRadius;
      result.z = sin(heliAngle) * heliRadius;
      result.y += cos(heliAngle * 2.0 + time) * amp * 0.24;
    } else if (motionType < 64.5) {
      float zig = sign(sin(p.y * 0.08 + time * 2.0 + phase));
      result.x += zig * amp * 0.18;
      result.z += sign(cos(p.x * 0.08 - time * 1.7 + phase)) * amp * 0.18;
      result.y += noiseField.y * amp * 0.08;
    } else if (motionType < 65.5) {
      float shock = sin(length(p) * 0.06 - time * 3.5 + phase);
      result += normalize(p + vec3(0.0001)) * shock * amp * 0.28;
    } else if (motionType < 66.5) {
      result = mix(p, curlField * amp * 1.8 + noiseField * amp * 0.3, 0.35);
      result.y += sin(time + phase + p.x * 0.03) * amp * 0.12;
    } else if (motionType < 67.5) {
      vec3 mirrored = vec3(abs(p.x), p.y, abs(p.z));
      result = mix(p, mirrored * sign(noiseField + vec3(0.0001)), 0.28) + curlField * amp * 0.06;
    } else if (motionType < 68.5) {
      float stepAngle = atan(p.z, p.x);
      float snapped = floor((stepAngle + 3.14159265359) / 0.39269908169) * 0.39269908169;
      float stepRadius = floor((length(p.xz) + amp * 0.08) / max(6.0, amp * 0.08)) * max(6.0, amp * 0.08);
      result.x = cos(snapped) * stepRadius;
      result.z = sin(snapped) * stepRadius;
      result.y += noiseField.y * amp * 0.06;
    } else if (motionType < 69.5) {
      float coilPhase = time * 1.4 + phase + p.y * 0.03;
      result.x = sin(coilPhase) * amp * 0.24 + p.x * 0.18;
      result.z = cos(coilPhase) * amp * 0.24 + p.z * 0.18;
      result.y = p.y + sin(coilPhase * 2.0) * amp * 0.1;
    } else if (motionType < 70.5) {
      vec3 cell = floor((p + vec3(time * 5.0)) / max(8.0, amp * 0.1));
      vec3 maze = mod(cell, 2.0) * 2.0 - 1.0;
      result = maze * max(12.0, amp * 0.16) + noiseField * amp * 0.06;
    } else if (motionType < 71.5) {
      result = rotate(result, normalize(vec3(1.0, 1.0, 0.4)), time * 0.9 + phase);
      result += vec3(
        sin(time * 1.8 + p.y * 0.03),
        cos(time * 1.4 + p.z * 0.03),
        sin(time * 1.1 + p.x * 0.03)
      ) * amp * 0.14;
    } else if (motionType < 72.5) {
      float echo = sin(length(p.xz) * 0.07 - time * 2.6 + phase);
      result += normalize(vec3(p.x, 0.0, p.z) + vec3(0.0001)) * echo * amp * 0.2;
      result.y += echo * amp * 0.12;
    } else if (motionType < 73.5) {
      float shellPhase = time * 1.25 + phase + p.y * 0.02;
      result.x = sin(shellPhase) * amp * 0.22;
      result.z = cos(shellPhase) * amp * 0.22;
      result.y = sin(shellPhase * 1.8) * amp * 0.12 + cos(length(p.xz) * 0.05) * amp * 0.08;
    } else if (motionType < 74.5) {
      result += vec3(noiseField.z, noiseField.x, noiseField.y) * amp * 0.18;
      result += vec3(-curlField.z, curlField.y, curlField.x) * amp * 0.12;
    } else if (motionType < 75.5) {
      vec3 prismDir = normalize(sign(p + vec3(0.0001)));
      result = mix(p, prismDir * length(p) * 0.82, 0.26);
    } else if (motionType < 76.5) {
      vec3 tile = round((p + noiseField * amp * 0.08) / max(9.0, amp * 0.12));
      result = tile * max(9.0, amp * 0.12) + sign(sin(tile + time)) * amp * 0.04;
    } else if (motionType < 77.5) {
      result.x += sin(p.z * 0.06 + time * 1.5) * amp * 0.14;
      result.z += cos(p.x * 0.06 - time * 1.5) * amp * 0.14;
      result.y += sin(time * 2.4 + phase) * amp * 0.18;
    } else if (motionType < 78.5) {
      result += normalize(vec3(p.x, 0.0, p.z) + vec3(0.0001)) * sin(time * 1.8 + phase) * amp * 0.18;
      result.y += cos(time * 1.2 + length(p.xz) * 0.04) * amp * 0.18;
    } else if (motionType < 79.5) {
      vec3 beaconDir = normalize(p + vec3(0.0001));
      float beaconPulse = abs(sin(time * 2.6 + phase));
      result = beaconDir * length(p) * (0.82 + beaconPulse * amp * 0.1);
    } else if (motionType < 80.5) {
      result.x += sin(p.z * 0.08 + time * 1.9) * amp * 0.16;
      result.z += cos(p.x * 0.08 - time * 1.9) * amp * 0.16;
      result.y += sin((p.x + p.z) * 0.05 + time * 1.4 + phase) * amp * 0.12;
`,R=`
    } else if (motionType < 81.5) {
      float pinwheelAngle = atan(p.z, p.x) + time * 1.1;
      float pinwheelRadius = length(p.xz) + sin(pinwheelAngle * 4.0 + phase) * amp * 0.15;
      result.x = cos(pinwheelAngle) * pinwheelRadius;
      result.z = sin(pinwheelAngle) * pinwheelRadius;
      result.y += cos(pinwheelAngle * 2.0 + time) * amp * 0.18;
    } else if (motionType < 82.5) {
      result = mix(p, curlField * amp * 1.6 + noiseField * amp * 0.6, 0.32);
      result.y += sin(time * 0.9 + phase + length(p) * 0.025) * amp * 0.18;
    } else if (motionType < 83.5) {
      float frond = sin(p.y * 0.06 + time * 1.5 + phase);
      result.x += frond * amp * 0.18 + sin(p.y * 0.03 + time) * amp * 0.08;
      result.z += cos(p.y * 0.05 - time * 1.2 + phase) * amp * 0.18;
      result.y += noiseField.y * amp * 0.06;
    } else if (motionType < 84.5) {
      float flowerAngle = atan(p.z, p.x) + time * 0.65;
      float flowerRadius = length(p.xz) + cos(flowerAngle * 9.0 + phase) * amp * 0.16;
      result.x = cos(flowerAngle) * flowerRadius;
      result.z = sin(flowerAngle) * flowerRadius;
      result.y += sin(flowerAngle * 4.5 + time * 1.2) * amp * 0.14;
    } else if (motionType < 85.5) {
      vec3 block = vec3(round(p.x / 14.0), round(p.y / 24.0), round(p.z / 14.0));
      result = vec3(block.x * 14.0, block.y * 24.0, block.z * 14.0) + noiseField * amp * 0.05;
    } else if (motionType < 86.5) {
      vec3 glyph = abs(fract((p + time * 2.0) * 0.06) - 0.5);
      result = sign(p + vec3(0.0001)) * vec3(
        step(glyph.x, 0.18),
        step(glyph.y, 0.24),
        step(glyph.z, 0.18)
      ) * length(p) * 0.55;
    } else if (motionType < 87.5) {
      float spread = abs(sin(time * 1.7 + phase)) * amp * 0.22;
      result.x += sign(p.x + 0.0001) * spread;
      result.z += sign(p.z + 0.0001) * spread * 0.75;
      result.y += sin(time * 1.2 + p.x * 0.03) * amp * 0.1;
    } else if (motionType < 88.5) {
      vec3 eddy = vec3(-p.z, sin(length(p.xz) * 0.04 + time), p.x);
      result += normalize(eddy + noiseField * 0.3 + vec3(0.0001)) * amp * 0.22;
      result += curlField * amp * 0.08;
    } else if (motionType < 102.5) {
      vec3 novaDir = normalize(p + vec3(0.0001));
      float novaPulse = 0.7 + abs(sin(time * 3.0 + phase)) * 0.5;
      result = novaDir * length(p) * novaPulse + noiseField * amp * 0.08;
    } else if (motionType < 103.5) {
      float swarmAngle = atan(p.z, p.x) + time * 0.9 + sin(p.y * 0.04 + phase) * 0.35;
      float swarmRadius = length(p.xz) * (0.72 + sin(time * 1.7 + phase) * 0.08);
      result.x = cos(swarmAngle) * swarmRadius + noiseField.x * amp * 0.1;
      result.z = sin(swarmAngle) * swarmRadius + noiseField.z * amp * 0.1;
      result.y += sin(time * 1.5 + length(p.xz) * 0.03 + phase) * amp * 0.18;
    } else if (motionType < 104.5) {
      float braidAngle = atan(p.z, p.x) + p.y * 0.03 + time * 1.35;
      float braidRadius = 18.0 + sin(p.y * 0.1 + time * 1.8 + phase) * amp * 0.18;
      result.x = cos(braidAngle) * braidRadius;
      result.z = sin(braidAngle) * braidRadius;
      result.y += sin(braidAngle * 2.0 + time * 0.8) * amp * 0.2 + curlField.y * amp * 0.05;
    } else if (motionType < 105.5) {
      float breath = 0.7 + sin(time * 1.4 + phase) * 0.28;
      result *= breath;
      result += normalize(p + vec3(0.0001)) * sin(time * 2.6 + phase) * amp * 0.08;
      result.y += cos(time * 1.1 + length(p) * 0.03) * amp * 0.12;
    } else if (motionType < 106.5) {
      float fracture = step(0.58, fract(sin(dot(floor(p * 0.08), vec3(12.9898, 78.233, 37.719))) * 43758.5453));
      vec3 shardDir = normalize(vec3(sign(p.x + 0.0001), noiseField.y * 0.35, sign(p.z + 0.0001)) + vec3(0.0001));
      result = mix(p * 0.82, p + shardDir * amp * 0.34, fracture);
      result += noiseField * amp * 0.06;
    } else if (motionType < 107.5) {
      vec3 creepDir = normalize(vec3(noiseField.x, noiseField.y * 0.2, noiseField.z) + vec3(0.0001));
      result += creepDir * amp * 0.16;
      result.y -= abs(sin(time * 1.3 + phase)) * amp * 0.06;
      result += vec3(sin(p.z * 0.03 + time), 0.0, cos(p.x * 0.03 - time)) * amp * 0.08;
    } else if (motionType < 108.5) {
      float interference = sin(p.x * 0.05 + time * 1.7) + cos(p.z * 0.05 - time * 1.3 + phase);
      result.y += interference * amp * 0.18;
      result.x += sin(p.y * 0.04 + time * 1.1) * amp * 0.08;
      result.z += cos(p.y * 0.04 - time * 1.1) * amp * 0.08;
    } else if (motionType < 109.5) {
      vec3 driftDir = normalize(curlField + noiseField * 0.4 + vec3(0.0001));
      float flockPulse = 0.55 + abs(sin(time * 1.6 + phase)) * 0.35;
      result += driftDir * amp * 0.18 * flockPulse;
      result += vec3(-p.z, 0.0, p.x) * 0.0009 * amp;
    } else if (motionType < 110.5) {
      float sheetAngle = atan(p.z, p.x) + time * 0.9;
      float sheetRadius = length(p.xz) + sin(p.y * 0.06 + phase + time) * amp * 0.12;
      result.x = cos(sheetAngle) * sheetRadius;
      result.z = sin(sheetAngle) * sheetRadius;
      result.y += sin(sheetAngle * 3.0 + time * 1.2) * amp * 0.18;
    } else if (motionType < 111.5) {
      float branchMask = step(0.0, sin(p.y * 0.08 + phase));
      result.x += branchMask * sin(p.y * 0.05 + time * 1.4) * amp * 0.16;
      result.z += (1.0 - branchMask) * cos(p.y * 0.05 - time * 1.4) * amp * 0.16;
      result.y += abs(sin(time * 1.1 + phase)) * amp * 0.14;
    } else if (motionType < 112.5) {
      vec3 seepDir = normalize(vec3(noiseField.x, -abs(noiseField.y) - 0.2, noiseField.z) + vec3(0.0001));
      float crack = step(0.62, fract(sin(dot(floor(p.xz * 0.1), vec2(12.9898,78.233))) * 43758.5453));
      result += seepDir * amp * mix(0.08, 0.28, crack);
      result.x += sign(p.x + 0.0001) * crack * amp * 0.12;
      result.z += sign(p.z + 0.0001) * crack * amp * 0.12;
    } else if (motionType < 113.5) {
      float standing = sin(p.x * 0.06 + time * 1.5) * cos(p.z * 0.06 - time * 1.5 + phase);
      result.y += standing * amp * 0.22;
      result.x += cos(p.y * 0.03 + time) * amp * 0.07;
      result.z += sin(p.y * 0.03 - time) * amp * 0.07;
    } else if (motionType < 114.5) {
      vec3 grid = round(p / vec3(12.0, 12.0, 12.0)) * vec3(12.0, 12.0, 12.0);
      result = mix(p, grid, 0.35);
      result += vec3(sin(time * 3.0 + grid.x * 0.03), cos(time * 2.2 + grid.y * 0.03), sin(time * 2.8 + grid.z * 0.03)) * amp * 0.1;
    } else if (motionType < 115.5) {
      vec3 bloomDir = normalize(p + noiseField * 0.5 + vec3(0.0001));
      float torrent = 0.4 + abs(sin(time * 2.1 + phase)) * 0.6;
      result += bloomDir * amp * 0.22 * torrent;
      result.y += abs(sin(time * 1.8 + length(p.xz) * 0.04)) * amp * 0.1;
    } else if (motionType < 116.5) {
      float orbitAngle = atan(p.z, p.x) + time * 1.25;
      float fractureRadius = length(p.xz) + step(0.55, fract(sin(dot(floor(p.xz * 0.12), vec2(31.2, 14.7))) * 43758.5453)) * amp * 0.2;
      result.x = cos(orbitAngle) * fractureRadius;
      result.z = sin(orbitAngle) * fractureRadius;
      result.y += sign(sin(orbitAngle * 6.0 + time)) * amp * 0.12;
    } else if (motionType < 117.5) {
      vec3 foam = vec3(sin(p.z * 0.09 + time * 1.6), cos(p.x * 0.08 - time * 1.4), sin(time * 2.3 + phase));
      result += foam * amp * 0.14;
      result += noiseField * amp * 0.08;
    } else if (motionType < 118.5) {
      float braid = sin(p.y * 0.07 + time * 1.6 + phase);
      result.x += braid * amp * 0.2 + sin(time * 2.0 + p.z * 0.04) * amp * 0.08;
      result.z += cos(p.y * 0.07 - time * 1.5 + phase) * amp * 0.2;
      result.y += sin((p.x + p.z) * 0.03 + time * 1.1) * amp * 0.08;
    } else if (motionType < 119.5) {
      float resonance = sin(p.x * 0.05 + time * 2.6 + phase) * cos(p.z * 0.05 - time * 2.1);
      result.y += resonance * amp * 0.24;
      result.x += sin(p.y * 0.06 + time * 1.3) * amp * 0.09;
      result.z += cos(p.y * 0.06 - time * 1.3) * amp * 0.09;
    } else if (motionType < 120.5) {
      float angle = atan(p.z, p.x) + time * 0.42;
      float lock = sin(angle * 2.0 + phase) * 0.5 + 0.5;
      float radius = length(p.xz) + lock * amp * 0.12;
      result.x = cos(angle) * radius;
      result.z = sin(angle) * radius;
      result.y += sin(time + angle + phase) * amp * 0.12;
    } else if (motionType < 121.5) {
      vec3 bloom = normalize(p + noiseField * 0.4 + vec3(0.0001));
      float fracture = step(0.58, fract(sin(dot(floor(p.xz * 0.14), vec2(18.4, 91.7))) * 43758.5453));
      result += bloom * amp * mix(0.08, 0.3, fracture);
      result += vec3(sign(p.x + 0.0001), 0.0, sign(p.z + 0.0001)) * fracture * amp * 0.1;
    } else if (motionType < 122.5) {
      vec3 ember = vec3(sin(time * 1.7 + p.y * 0.04), abs(cos(time * 1.1 + phase)), cos(time * 1.3 + p.x * 0.03));
      result += ember * amp * 0.14;
      result.y += abs(sin(time * 1.4 + length(p.xz) * 0.03)) * amp * 0.08;
    } else if (motionType < 123.5) {
      vec3 cell = round(p / vec3(10.0, 10.0, 10.0)) * vec3(10.0, 10.0, 10.0);
      float surge = sin(time * 2.4 + dot(cell, vec3(0.02, 0.03, 0.04))) * 0.5 + 0.5;
      result = mix(p, cell, 0.3 + surge * 0.15);
      result += noiseField * amp * 0.06;
    } else if (motionType < 124.5) {
      float weave = sin(p.y * 0.08 + time * 1.9 + phase);
      result.x += weave * amp * 0.18;
      result.z += cos(p.y * 0.08 - time * 1.7 + phase) * amp * 0.18;
      result.y += sin((p.x - p.z) * 0.035 + time) * amp * 0.1;
    } else {
      vec3 fallback = normalize(curlField + noiseField + vec3(0.0001));
      result += fallback * amp * 0.16;
    }
`,w=`
vec3 applyMotion(vec3 p, float motionType, float t, float speed, float amp, float freq, float phase, float rnd, vec3 wind, float noiseScale, float evolution, float complexity, float fluidForce, float viscosity, float fidelity, float octaveMult) {
    float time = t * speed;
    vec3 result = p;
    float motionFamily = getMotionFamily(motionType);
    float familyFieldScale =
      motionFamily < 0.5 ? 0.72 :
      motionFamily < 1.5 ? 0.48 :
      motionFamily < 2.5 ? 0.36 :
      motionFamily < 3.5 ? 0.58 :
      motionFamily < 4.5 ? 0.44 :
      motionFamily < 5.5 ? 0.62 : 0.65;
    vec3 fieldPos = p * max(0.05, freq * familyFieldScale) * max(0.05, noiseScale) + wind * time * 0.025;
    float octaves = clamp(max(1.0, fidelity), 1.0, 8.0);
    float lacunarity = max(1.1, octaveMult);
    vec3 noiseField = noiseVec(fieldPos + time * max(0.05, evolution) * 0.3 + rnd * 3.7);
    vec3 curlField = curlNoise(fieldPos + phase * 0.35, 0.1, octaves, lacunarity);
    float attractorScale = max(0.15, complexity) * (motionFamily < 1.5 ? 1.08 : motionFamily < 2.5 ? 0.9 : 1.0);

`,I=`
    return result;
  }
`,D=`
  ${T()}
${w}${C}${E}${R}${I}`,V=`
  vec3 rotate(vec3 p, vec3 axis, float angle) {
    float s = sin(angle); float c = cos(angle); float oc = 1.0 - c;
    mat3 rot = mat3(
      oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
      oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,
      oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c
    );
    return rot * p;
  }

  float hash1(float n) { return fract(sin(n) * 43758.5453123); }
  vec3 hash3(float n) { return fract(sin(vec3(n, n + 1.0, n + 2.0)) * 43758.5453123); }

  float valueNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = dot(i, vec3(1.0, 57.0, 113.0));
    return mix(
      mix(mix(hash1(n + 0.0), hash1(n + 1.0), f.x), mix(hash1(n + 57.0), hash1(n + 58.0), f.x), f.y),
      mix(mix(hash1(n + 113.0), hash1(n + 114.0), f.x), mix(hash1(n + 170.0), hash1(n + 171.0), f.x), f.y),
      f.z
    );
  }

  vec3 noiseVec(vec3 p) {
    return vec3(
      valueNoise(p + vec3(0.0, 0.0, 0.0)),
      valueNoise(p + vec3(31.416, 17.903, 11.0)),
      valueNoise(p + vec3(59.2, 7.21, 41.0))
    ) * 2.0 - 1.0;
  }

  float fbm(vec3 p, float octaves, float lacunarity) {
    float value = 0.0;
    float amplitude = 0.5;
    vec3 samplePos = p;
    for (int i = 0; i < 8; i++) {
      if (float(i) >= octaves) break;
      value += valueNoise(samplePos) * amplitude;
      samplePos *= lacunarity;
      amplitude *= 0.5;
    }
    return value;
  }

  vec3 curlNoise(vec3 p, float eps, float octaves, float lacunarity) {
    vec3 dx = vec3(eps, 0.0, 0.0);
    vec3 dy = vec3(0.0, eps, 0.0);
    vec3 dz = vec3(0.0, 0.0, eps);
    float p_x0 = fbm(p - dx, octaves, lacunarity);
    float p_x1 = fbm(p + dx, octaves, lacunarity);
    float p_y0 = fbm(p - dy, octaves, lacunarity);
    float p_y1 = fbm(p + dy, octaves, lacunarity);
    float p_z0 = fbm(p - dz, octaves, lacunarity);
    float p_z1 = fbm(p + dz, octaves, lacunarity);
    return normalize(vec3(
      (p_y1 - p_y0) - (p_z1 - p_z0),
      (p_z1 - p_z0) - (p_x1 - p_x0),
      (p_x1 - p_x0) - (p_y1 - p_y0)
    ));
  }
`,g=`
  #define MAX_INTER_LAYER_COLLIDERS ${y}
  ${V}
  ${D}
  ${F}
`,U=`
  precision highp float;
  // モーションタイプ関連定数
  #define MOTION_TYPE_COUNT 90.0  // 実装されているモーションタイプの総数
  #define VARIANT_OFFSET    17.0  // バリアントほまったオフセット（モーフ時に璴歰を防ぐ）
  #define VARIANT_SCALE     11.0  // バリアントからモーションオフセットへの変換係数
  #define LIFE_TIME_SCALE   60.0  // 番小数（2Dライフ進行計算用のフレームスケール）
  ${g}
  uniform float uTime; uniform float uOpacity; uniform float uAudioBassMotion; uniform float uAudioTrebleMotion; uniform float uAudioBassSize; uniform float uAudioTrebleSize; uniform float uAudioBassAlpha; uniform float uAudioTrebleAlpha; uniform float uAudioPulse; uniform float uAudioMorph; uniform float uAudioShatter; uniform float uAudioTwist; uniform float uAudioBend; uniform float uAudioWarp;
  uniform float uAudioBandAMotion; uniform float uAudioBandASize; uniform float uAudioBandAAlpha;
  uniform float uAudioBandBMotion; uniform float uAudioBandBSize; uniform float uAudioBandBAlpha;
  uniform float uGlobalSpeed; uniform float uGlobalAmp; uniform float uGlobalNoiseScale;
    uniform float uGlobalComplexity;
  uniform float uGlobalEvolution; uniform float uGlobalFidelity; uniform float uGlobalOctaveMult;
  uniform float uGlobalFreq; uniform float uGlobalRadius; uniform float uGlobalSize;
  uniform float uInstanced3D; uniform float uInstanced3DScale;
  uniform float uMediaReactive; uniform float uMediaSizeBoost; uniform float uMediaAlphaBoost;
  uniform float uMediaGlyphInstancing; uniform float uMediaGlyphDepthBoost; uniform float uMediaGlyphTwist; uniform float uMediaGlyphQuantize;
  uniform float uGravity; uniform vec3 uWind;
  uniform vec3 uSpin;
  uniform float uBoundaryY; uniform float uBoundaryEnabled; uniform float uBoundaryBounce;
  uniform float uViscosity; uniform float uFluidForce;
    uniform float uResistance; uniform float uMoveWithWind; uniform float uNeighborForce;
    uniform float uCollisionMode; uniform float uCollisionRadius; uniform float uRepulsion;
    uniform float uTrail; uniform float uLife; uniform float uLifeSpread; uniform float uLifeSizeBoost; uniform float uLifeSizeTaper; uniform float uBurst; uniform float uBurstPhase; uniform float uBurstMode; uniform float uBurstWaveform; uniform float uBurstSweepSpeed; uniform float uBurstSweepTilt; uniform float uBurstConeWidth; uniform float uEmitterOrbitSpeed; uniform float uEmitterOrbitRadius; uniform float uEmitterPulseAmount; uniform float uTrailDrag; uniform float uTrailTurbulence; uniform float uTrailDrift; uniform float uVelocityGlow; uniform float uVelocityAlpha; uniform float uFlickerAmount; uniform float uFlickerSpeed; uniform float uStreak; uniform float uSpriteMode; uniform float uAuxLife; uniform float uIsAux;
  uniform float uAffectPos; uniform vec2 uMouse; uniform float uMouseForce;
  uniform float uMouseRadius; uniform float uIsOrthographic;
        uniform float uInterLayerEnabled; uniform int uInterLayerColliderCount; uniform vec4 uInterLayerColliders[MAX_INTER_LAYER_COLLIDERS]; uniform float uInterLayerStrength; uniform float uInterLayerPadding;
  attribute vec3 aPosition; attribute vec3 aOffset; attribute vec4 aData1; attribute vec4 aData2; attribute vec4 aData3;
  varying float vAlpha; varying vec2 vUv; varying float vLife; varying float vVelocity; varying float vSpriteMode; varying float vVariant; varying float vBurst;
  vec3 applyAudioSpatialWarp(vec3 pos, vec3 origin, float timeValue, float amp, float phase, float variant) {
    float radiusNorm = clamp(length(pos.xz) / max(1.0, uGlobalRadius), 0.0, 3.0);
    float heightNorm = pos.y / max(1.0, uGlobalRadius);
    float twistAngle = uAudioTwist * (0.35 + variant * 0.85) * heightNorm * 2.8;
    float twistCos = cos(twistAngle);
    float twistSin = sin(twistAngle);
    pos.xz = mat2(twistCos, -twistSin, twistSin, twistCos) * pos.xz;
    float bendWave = sin(timeValue * 2.4 + phase + pos.y * 0.028) + cos(timeValue * 1.7 + phase * 0.7 + pos.x * 0.022);
    pos.x += bendWave * amp * uAudioBend * (0.08 + radiusNorm * 0.12);
    pos.z += cos(timeValue * 2.1 - phase + pos.x * 0.025) * amp * uAudioBend * (0.05 + abs(heightNorm) * 0.14);
    vec3 radialDir = normalize(vec3(pos.x, 0.0, pos.z) + vec3(0.0001));
    float warpWave = sin(length(pos.xz) * 0.045 - timeValue * 3.1 + phase) * 0.5 + 0.5;
    pos += radialDir * amp * uAudioWarp * mix(0.02, 0.12, warpWave) * (0.5 + variant * 0.6);
    pos.y += sin(length(origin.xz) * 0.03 + timeValue * 2.6 + phase) * amp * uAudioWarp * 0.08;
    vec3 tearNoise = noiseVec(pos * (0.04 + uAudioShatter * 0.02) + vec3(timeValue * 1.9 + phase));
    vec3 tearDir = normalize(vec3(tearNoise.x, tearNoise.y * 0.35 + sin(phase + timeValue), tearNoise.z) + vec3(0.0001));
    float tearMask = smoothstep(0.15, 0.95, fract(variant * 7.13 + tearNoise.x * 0.5 + timeValue * 0.12));
    pos += tearDir * amp * uAudioShatter * tearMask * mix(0.02, 0.16, variant);
    return pos;
  }
  void main() {
    vUv = uv; float aPhase = aData1.x; float aRandom = aData1.y; float aMotionType = aData1.z;
    float aBaseRadiusFactor = aData1.w; float aSpeedFactor = aData2.x; float aAmpFactor = aData2.y;
    float aFreqFactor = aData2.z; float aSizeFactor = aData2.w;
    float aSpawnOffset = aData3.x; float aLifeJitter = aData3.y; float aVariant = aData3.z; float aMediaLuma = aData3.w;
    float mediaMask = step(0.5, uMediaReactive);
    float glyphInstancingMask = step(0.5, uMediaGlyphInstancing);
    float glyphBandCount = max(2.0, uMediaGlyphQuantize);
    float glyphBand = floor(clamp(aMediaLuma, 0.0, 0.9999) * glyphBandCount) / max(1.0, glyphBandCount - 1.0);
    float mediaSizeScale = mix(1.0, mix(max(0.18, 1.0 - uMediaSizeBoost * 0.7), 1.0 + uMediaSizeBoost, clamp(aMediaLuma, 0.0, 1.0)), mediaMask);
    float mediaAlphaScale = mix(1.0, mix(max(0.06, 1.0 - uMediaAlphaBoost), 1.0 + uMediaAlphaBoost * 0.22, clamp(aMediaLuma, 0.0, 1.0)), mediaMask);
    float radius = aBaseRadiusFactor * uGlobalRadius;
    float speed = aSpeedFactor * uGlobalSpeed * (1.0 + uAudioTrebleMotion * 3.2 + uAudioBandAMotion * 3.2 + uAudioBandBMotion * 3.2);
    float amp = aAmpFactor * uGlobalAmp * (1.0 + uAudioBassMotion * 1.35);
    float trebleJitterMix = 1.0 + uAudioTrebleMotion * 1.8;
    float freq = aFreqFactor * uGlobalFreq * trebleJitterMix;
    float noiseScale = uGlobalNoiseScale * trebleJitterMix;
    float complexity = uGlobalComplexity * mix(1.0, trebleJitterMix, 0.6);
    float prevTime = max(uTime - 0.04, 0.0);
    float emitterOrbitPhase = uTime * max(0.0, uEmitterOrbitSpeed);
    float prevEmitterOrbitPhase = prevTime * max(0.0, uEmitterOrbitSpeed);
    float emitterPulse = 1.0 + sin(uTime * max(0.05, uEmitterOrbitSpeed) * 1.6 + aPhase) * uEmitterPulseAmount + uAudioPulse * (0.08 + aVariant * 0.08);
    float prevEmitterPulse = 1.0 + sin(prevTime * max(0.05, uEmitterOrbitSpeed) * 1.6 + aPhase) * uEmitterPulseAmount + uAudioPulse * (0.06 + aVariant * 0.05);
    vec3 animatedOffset = aOffset * emitterPulse;
    vec3 prevAnimatedOffset = aOffset * prevEmitterPulse;
    if (uEmitterOrbitRadius > 0.0 || length(aOffset.xz) > 0.001) {
      animatedOffset = rotate(animatedOffset, vec3(0.0, 1.0, 0.0), emitterOrbitPhase);
      prevAnimatedOffset = rotate(prevAnimatedOffset, vec3(0.0, 1.0, 0.0), prevEmitterOrbitPhase);
    }
    vec3 emitterOrbitOffset = vec3(cos(emitterOrbitPhase), sin(emitterOrbitPhase * 0.5) * 0.25, sin(emitterOrbitPhase)) * uEmitterOrbitRadius;
    vec3 prevEmitterOrbitOffset = vec3(cos(prevEmitterOrbitPhase), sin(prevEmitterOrbitPhase * 0.5) * 0.25, sin(prevEmitterOrbitPhase)) * uEmitterOrbitRadius;
    animatedOffset += emitterOrbitOffset;
    prevAnimatedOffset += prevEmitterOrbitOffset;

    vec3 pos = calculateLayerPosition(
        aPosition, animatedOffset, aMotionType, uTime,
        speed, amp, freq, radius,
        aPhase, aRandom, uWind, noiseScale,
        uGlobalEvolution, complexity, uFluidForce, uViscosity,
        uGlobalFidelity, uGlobalOctaveMult, uAffectPos,
        uResistance, uMoveWithWind, uNeighborForce,
        uCollisionMode, uCollisionRadius, uRepulsion,
        uGravity, uBoundaryY, uBoundaryEnabled, uBoundaryBounce,
        uInterLayerEnabled, uInterLayerColliderCount, uInterLayerColliders, uInterLayerStrength,
        uInterLayerPadding
    );
    // prevPos is only needed for trail/streak rendering. Skip the full physics recalculation
    // when neither trail nor streak is active (uniform is the same for all particles in the warp).
    bool needPrevPos = (uTrail > 0.001 || uStreak > 0.001);
    vec3 prevPos = pos; // default: no delta → trailDelta = 0

    if (needPrevPos) {
      prevPos = calculateLayerPosition(
          aPosition, prevAnimatedOffset, aMotionType, prevTime,
          speed, amp, freq, radius,
          aPhase, aRandom, uWind, noiseScale,
          uGlobalEvolution, complexity, uFluidForce, uViscosity,
          uGlobalFidelity, uGlobalOctaveMult, uAffectPos,
          uResistance, uMoveWithWind, uNeighborForce,
          uCollisionMode, uCollisionRadius, uRepulsion,
          uGravity, uBoundaryY, uBoundaryEnabled, uBoundaryBounce,
          uInterLayerEnabled, uInterLayerColliderCount, uInterLayerColliders, uInterLayerStrength,
          uInterLayerPadding
      );
    }

    if (uAudioMorph > 0.001) {
      float altMotionType = mod(aMotionType + VARIANT_OFFSET + floor(aVariant * VARIANT_SCALE), MOTION_TYPE_COUNT);
      vec3 morphPos = calculateLayerPosition(
        aPosition, animatedOffset, altMotionType, uTime * (1.02 + aVariant * 0.12),
        speed, amp, freq * (1.0 + aVariant * 0.15), radius,
        aPhase + 1.7, aRandom, uWind, noiseScale,
        uGlobalEvolution, complexity, uFluidForce, uViscosity,
        uGlobalFidelity, uGlobalOctaveMult, uAffectPos,
        uResistance, uMoveWithWind, uNeighborForce,
        uCollisionMode, uCollisionRadius, uRepulsion,
        uGravity, uBoundaryY, uBoundaryEnabled, uBoundaryBounce,
        uInterLayerEnabled, uInterLayerColliderCount, uInterLayerColliders, uInterLayerStrength,
        uInterLayerPadding
      );
      float morphMix = clamp(uAudioMorph * (0.22 + aVariant * 0.48), 0.0, 0.92);
      pos = mix(pos, morphPos, morphMix);

      if (needPrevPos) {
        vec3 prevMorphPos = calculateLayerPosition(
          aPosition, prevAnimatedOffset, altMotionType, prevTime * (1.02 + aVariant * 0.12),
          speed, amp, freq * (1.0 + aVariant * 0.15), radius,
          aPhase + 1.7, aRandom, uWind, noiseScale,
          uGlobalEvolution, complexity, uFluidForce, uViscosity,
          uGlobalFidelity, uGlobalOctaveMult, uAffectPos,
          uResistance, uMoveWithWind, uNeighborForce,
          uCollisionMode, uCollisionRadius, uRepulsion,
          uGravity, uBoundaryY, uBoundaryEnabled, uBoundaryBounce,
          uInterLayerEnabled, uInterLayerColliderCount, uInterLayerColliders, uInterLayerStrength,
          uInterLayerPadding
        );
        prevPos = mix(prevPos, prevMorphPos, morphMix);
      }
    }

    if (length(uSpin) > 0.001) {
        pos = rotate(pos, vec3(1,0,0), uSpin.x * uTime);
        pos = rotate(pos, vec3(0,1,0), uSpin.y * uTime);
        pos = rotate(pos, vec3(0,0,1), uSpin.z * uTime);
        if (needPrevPos) {
          prevPos = rotate(prevPos, vec3(1,0,0), uSpin.x * prevTime);
          prevPos = rotate(prevPos, vec3(0,1,0), uSpin.y * prevTime);
          prevPos = rotate(prevPos, vec3(0,0,1), uSpin.z * prevTime);
        }
    }
    pos = applyAudioSpatialWarp(pos, animatedOffset, uTime, amp, aPhase, aVariant);
    if (needPrevPos) {
      prevPos = applyAudioSpatialWarp(prevPos, prevAnimatedOffset, prevTime, amp, aPhase, aVariant);
    }

    float lifeAlpha = 1.0;
    float lifeProgress = 0.0;
    if (uLife > 0.0) {
      float particleLife = max(4.0, uLife * mix(1.0 - uLifeSpread, 1.0 + uLifeSpread, aLifeJitter));
      lifeProgress = fract((uTime * LIFE_TIME_SCALE) / particleLife + aSpawnOffset + uBurstPhase);
      float burstEnvelope = 1.0 - smoothstep(0.0, 0.32, lifeProgress);
      float burstTailStart = mix(0.92, 0.36, clamp(uBurst, 0.0, 1.0));
      lifeAlpha = smoothstep(0.0, 0.08, lifeProgress) * (1.0 - smoothstep(burstTailStart, 1.0, lifeProgress));
      if (uBurstWaveform > 0.5 && uBurstWaveform < 1.5) {
        burstEnvelope *= 0.85 + sin(lifeProgress * 6.28318530718) * 0.15;
      } else if (uBurstWaveform > 1.5 && uBurstWaveform < 2.5) {
        float pulseA = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.12));
        float pulseB = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.26));
        float pulseC = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.41));
        burstEnvelope = max(pulseA, max(pulseB, pulseC));
        lifeAlpha *= 0.78 + burstEnvelope * 0.4;
      } else if (uBurstWaveform >= 2.5) {
        float beatA = 1.0 - smoothstep(0.0, 0.1, abs(lifeProgress - 0.16));
        float beatB = 1.0 - smoothstep(0.0, 0.1, abs(lifeProgress - 0.31));
        burstEnvelope = max(beatA, beatB * 0.82);
        lifeAlpha *= 0.82 + burstEnvelope * 0.3;
      }
      float burstPush = clamp(uBurst, 0.0, 2.0) * burstEnvelope;
      vec3 burstDir = normalize((pos - animatedOffset) + vec3(0.0001));
      if (uBurstMode > 0.5 && uBurstMode < 1.5) {
        float coneWidth = mix(0.08, 1.05, clamp(uBurstConeWidth, 0.0, 1.0));
        burstDir = normalize(vec3(
          sin(aPhase) * coneWidth * mix(0.12, 0.65, aVariant),
          mix(1.15, 0.22, clamp(uBurstConeWidth, 0.0, 1.0)) * mix(0.65, 1.0, aLifeJitter),
          cos(aPhase) * coneWidth * mix(0.12, 0.65, aVariant)
        ) + vec3(0.0001));
      } else if (uBurstMode >= 1.5) {
        float sweepAngle = uTime * max(0.05, uBurstSweepSpeed) + aPhase;
        float sweepTilt = mix(-0.9, 0.9, clamp(uBurstSweepTilt, 0.0, 1.0));
        vec3 sweepDir = normalize(vec3(cos(sweepAngle), sweepTilt + sin(uTime * max(0.05, uBurstSweepSpeed) * 0.75 + aVariant * 6.2831) * 0.25, sin(sweepAngle)) + vec3(0.0001));
        burstDir = mix(burstDir, sweepDir, 0.82);
      }
      pos += burstDir * amp * burstPush * mix(0.08, 0.2, aVariant);
      float dragMix = clamp(uTrailDrag, 0.0, 1.5) * clamp(lifeProgress, 0.0, 1.0);
      pos = mix(pos, animatedOffset + (pos - animatedOffset) * (1.0 - dragMix * 0.55), dragMix * 0.3);
      vec3 turbulence = noiseVec((pos + animatedOffset) * (0.02 + uTrailTurbulence * 0.018) + vec3(uTime * 0.35 + aPhase));
      pos += turbulence * amp * uTrailTurbulence * burstEnvelope * 0.05;
      vec3 driftDir = normalize(uWind + vec3(0.0001));
      pos += driftDir * amp * uTrailDrift * (0.25 + lifeProgress * 0.75) * 0.06;
    }
    pos += normalize((pos - animatedOffset) + vec3(0.0001)) * amp * uAudioPulse * mix(0.018, 0.072, aVariant);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vec4 prevMvPosition = modelViewMatrix * vec4(prevPos, 1.0);

    if (uMouseForce != 0.0) {
        vec3 mouseWorld;
        if (uIsOrthographic > 0.5) { mouseWorld = vec3(uMouse.x * 500.0, uMouse.y * 500.0, 0.0); }
        else { mouseWorld = vec3(uMouse.x * 200.0, uMouse.y * 200.0, -uGlobalRadius); }
        float distToMouse = distance(mvPosition.xyz, mouseWorld);
        if (distToMouse < uMouseRadius) {
            float force = (1.0 - distToMouse / uMouseRadius) * uMouseForce * 20.0;
            mvPosition.xyz += normalize(mvPosition.xyz - mouseWorld) * force;
        }
    }

    float dist = -mvPosition.z;
    if (uIsOrthographic < 0.5 && dist <= 1.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      vLife = 0.0;
      vVelocity = 0.0;
      vSpriteMode = uSpriteMode;
      vVariant = aVariant;
      vBurst = 0.0;
      vAlpha = 0.0;
      return;
    }
    float sizeScale = (uIsOrthographic > 0.5) ? 1.0 : min(2.5, 400.0 / max(1.0, dist));
    float audioSizeBoost = 1.0 + uAudioBassSize * 1.85 + uAudioTrebleSize * 0.45 + uAudioPulse * 1.15
      + uAudioBandASize * 1.85 + uAudioBandBSize * 0.45;
    float pSize = aSizeFactor * uGlobalSize * sizeScale * audioSizeBoost;
    float lifeSizeScale = 1.0;
    if (uLife > 0.0) {
      float lifeBloom = sin(clamp(lifeProgress, 0.0, 1.0) * 3.14159265359);
      float lifeTaper = smoothstep(0.58, 1.0, lifeProgress);
      lifeSizeScale = max(0.15, 1.0 + lifeBloom * uLifeSizeBoost - lifeTaper * uLifeSizeTaper);
    }
    pSize *= lifeSizeScale;
    pSize *= mediaSizeScale;
    if (uIsAux > 0.5) {
      float auxLifeProgress = fract((uTime * LIFE_TIME_SCALE) / max(1.0, uAuxLife) + aRandom);
      float auxLifeAlpha = smoothstep(0.0, 0.12, auxLifeProgress) * (1.0 - smoothstep(0.65, 1.0, auxLifeProgress));
      lifeAlpha *= auxLifeAlpha;
      pSize *= mix(0.65, 1.35, auxLifeAlpha);
    }
    float clampedSize = clamp(pSize, 0.0, 500.0);
    vec2 trailDelta = mvPosition.xy - prevMvPosition.xy;
    float trailMagnitude = length(trailDelta);
    vec2 trailDir = trailMagnitude > 0.0001 ? normalize(trailDelta) : vec2(0.0, 1.0);
    vec2 trailPerp = vec2(-trailDir.y, trailDir.x);
    float dragTrailBoost = 1.0 + clamp(uTrailDrag, 0.0, 1.5) * clamp(lifeProgress, 0.0, 1.0);
    float trailAmount = clamp(uTrail, 0.0, 0.99) * clamp(trailMagnitude * 25.0, 0.0, 8.0) * (1.0 + max(0.0, uStreak) * 1.35) * dragTrailBoost;
    float streakStretch = 1.0 + trailAmount * (0.2 + max(0.0, uStreak));
    float streakWidth = max(0.16, 1.0 - trailAmount * 0.08 * (0.6 + max(0.0, uStreak)));

    if (uInstanced3D > 0.5) {
      // World-space 3D geometry: position.xyz is the local vertex of the geometry (cube/tetra)
      float geomSize = aSizeFactor * uGlobalSize * uInstanced3DScale * mediaSizeScale;
      vec3 instancedLocal = position.xyz;
      if (glyphInstancingMask > 0.5) {
        float glyphScale = mix(0.38, 1.72, glyphBand);
        float glyphTwist = (glyphBand - 0.5) * uMediaGlyphTwist + aVariant * 0.35;
        instancedLocal = rotate(instancedLocal, vec3(0.0, 1.0, 0.0), glyphTwist);
        instancedLocal = rotate(instancedLocal, vec3(0.0, 0.0, 1.0), glyphTwist * 0.42);
        pos.y += (glyphBand - 0.5) * uMediaGlyphDepthBoost * max(1.0, uGlobalSize) * 0.65;
        geomSize *= glyphScale;
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + instancedLocal * geomSize, 1.0);
    } else {
      mvPosition.xy += trailPerp * position.x * clampedSize * streakWidth + trailDir * position.y * clampedSize * streakStretch;
      gl_Position = projectionMatrix * mvPosition;
    }
    vLife = lifeProgress;
    vVelocity = clamp(trailMagnitude * 40.0, 0.0, 1.0);
    vSpriteMode = uSpriteMode;
    vVariant = aVariant;
    vBurst = clamp(uBurst, 0.0, 1.0) * (1.0 - smoothstep(0.0, 0.6, lifeProgress));
    float audioAlphaBoost = 1.0 + uAudioBassAlpha * 0.95 + uAudioTrebleAlpha * 0.35 + uAudioPulse * 0.85
      + uAudioBandAAlpha * 0.95 + uAudioBandBAlpha * 0.95;
    vAlpha = uOpacity * lifeAlpha * (1.0 - smoothstep(2000.0, 5000.0, length(pos))) * (1.0 + clamp(uTrail, 0.0, 0.99) * 0.35) * audioAlphaBoost * mediaAlphaScale;
  }
`,H=`
  precision highp float;
  varying float vAlpha;
  varying vec2 vUv;
  varying float vLife;
  varying float vVelocity;
  varying float vSpriteMode;
  varying float vVariant;
  varying float vBurst;
  uniform vec3 uColor;
  uniform float uContrast;
  uniform float uInkMode;
  uniform float uSoftness;
  uniform float uGlow;
  uniform float uVelocityGlow;
  uniform float uVelocityAlpha;
  uniform float uTime;
  uniform float uFlickerAmount;
  uniform float uFlickerSpeed;
  uniform float uHueShift;
  uniform int uSdfShape;
  uniform float uSdfEnabled;
  uniform vec2 uSdfLight;
  uniform float uSdfSpecular;
  uniform float uSdfShininess;
  uniform float uSdfAmbient;

  // SDF shape functions (uv in [0,1] x [0,1], return signed dist; negative = inside)
  float sdfCircle(vec2 p, float r) {
    return length(p) - r;
  }
  float sdfRing(vec2 p, float r, float thickness) {
    return abs(length(p) - r) - thickness;
  }
  float sdfStar(vec2 p, float r) {
    // 5-pointed star
    float angle = atan(p.y, p.x) - 1.5707963;
    float slice = 6.28318530718 / 5.0;
    float a = mod(angle, slice) - slice * 0.5;
    float d = length(p);
    float x = cos(a) * d - r;
    float y = abs(sin(a) * d) - r * 0.4;
    return max(x, y) * 0.85;
  }
  float sdfHexagon(vec2 p, float r) {
    const vec2 k = vec2(-0.866025404, 0.5);
    vec2 q = abs(p);
    q -= 2.0 * min(dot(k, q), 0.0) * k;
    q -= vec2(clamp(q.x, -k.y * r, k.y * r), r);
    return length(q) * sign(q.y);
  }

  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    float dist = length(vUv - 0.5);
    if (dist > 0.5) discard;
    float contrast = max(0.05, uContrast);
    float softness = clamp(uSoftness, 0.0, 1.0);
    float glow = max(0.0, uGlow);
    float innerEdge = mix(0.26, 0.08, softness);
    float outerEdge = mix(0.44, 0.62, softness);
    float edge = pow(clamp(1.0 - smoothstep(innerEdge, outerEdge, dist), 0.0, 1.0), 1.0 / contrast);
    float velocityGlow = 1.0 + vVelocity * uVelocityGlow;
    float halo = pow(clamp(1.0 - smoothstep(0.12, 0.5, dist), 0.0, 1.0), mix(2.8, 1.2, clamp(glow, 0.0, 1.0)));
    halo *= velocityGlow;
    float spriteAlpha = edge;
    if (vSpriteMode > 0.5 && vSpriteMode < 1.5) {
      float ringCenter = mix(0.22, 0.34, clamp(vLife, 0.0, 1.0));
      float ringWidth = mix(0.12, 0.05, softness);
      float ring = 1.0 - smoothstep(ringWidth, ringWidth + 0.08, abs(dist - ringCenter));
      float core2 = 1.0 - smoothstep(0.0, 0.12, dist);
      spriteAlpha = max(ring, core2 * 0.35);
    } else if (vSpriteMode >= 1.5) {
      vec2 centered = vUv - 0.5;
      float spokeA = 1.0 - smoothstep(0.01, 0.09 + (1.0 - vVelocity) * 0.06, abs(centered.x) + abs(centered.y) * 0.42);
      float spokeB = 1.0 - smoothstep(0.01, 0.09 + (1.0 - vVelocity) * 0.06, abs(centered.y) + abs(centered.x) * 0.42);
      float ember = 1.0 - smoothstep(0.08, 0.42, dist);
      spriteAlpha = max(max(spokeA, spokeB) * (0.55 + vVelocity * 0.75), ember * 0.4);
    }
    float velocityAlpha = 1.0 + vVelocity * uVelocityAlpha;
    float flickerPhase = uTime * max(0.05, uFlickerSpeed) * (2.6 + vVelocity * 1.8) + vVariant * 13.7 + vLife * 9.0;
    float flickerWave = 0.5 + 0.5 * sin(flickerPhase);
    float flicker = mix(1.0, 0.78 + 0.22 * flickerWave, clamp(uFlickerAmount, 0.0, 1.0));
    flicker = mix(flicker, 1.0, clamp(vBurst, 0.0, 1.0) * 0.22);
    float baseAlpha = clamp(vAlpha * spriteAlpha * mix(0.8, 1.25, clamp((contrast - 0.5) / 1.5, 0.0, 1.0)) * velocityAlpha * flicker, 0.0, 1.0);
    baseAlpha = clamp(baseAlpha + vAlpha * halo * glow * 0.45, 0.0, 1.0);
    float core = 1.0 - smoothstep(0.0, mix(0.3, 0.18, softness), dist);
    float body = 1.0 - smoothstep(0.05, mix(0.5, 0.35, softness), dist);
    float inkAlpha = clamp(vAlpha * (0.45 + core * 1.15 + body * 0.9 + halo * glow * 0.35 + spriteAlpha * 0.45) * max(1.0, contrast * 0.9) * velocityAlpha * flicker, 0.0, 1.0);
    float alpha = mix(baseAlpha, inkAlpha, uInkMode);
    vec3 finalColor = uColor;
    if (abs(uHueShift) > 0.001) {
      vec3 hsv = rgb2hsv(finalColor);
      hsv.x = fract(hsv.x + uHueShift);
      finalColor = hsv2rgb(hsv);
    }
    // Ink mode: invert color so white particles become black on white background
    finalColor = mix(finalColor, vec3(1.0) - finalColor, uInkMode);

    // SDF shape + pseudo-3D lighting
    if (uSdfEnabled > 0.5) {
      vec2 p = vUv - 0.5; // [-0.5, 0.5]
      float sdfDist;
      if (uSdfShape == 1) {
        // ring
        sdfDist = sdfRing(p, 0.28, 0.08);
      } else if (uSdfShape == 2) {
        // star
        sdfDist = sdfStar(p, 0.38);
      } else if (uSdfShape == 3) {
        // hexagon
        sdfDist = sdfHexagon(p, 0.38);
      } else {
        // sphere (default)
        sdfDist = sdfCircle(p, 0.42);
      }
      float shapeEdge = 1.0 - smoothstep(-0.02, 0.02, sdfDist);
      if (shapeEdge < 0.01) discard;
      // pseudo-3D lighting for sphere only
      float lighting = 1.0;
      if (uSdfShape == 0) {
        // reconstruct hemisphere normal from UV
        vec2 np = p / 0.42;
        float nz2 = max(0.0, 1.0 - dot(np, np));
        vec3 N = normalize(vec3(np.x, np.y, sqrt(nz2)));
        vec3 L = normalize(vec3(uSdfLight.x, uSdfLight.y, 0.7));
        float diffuse = max(0.0, dot(N, L));
        vec3 V = vec3(0.0, 0.0, 1.0);
        vec3 H = normalize(L + V);
        float specular = pow(max(0.0, dot(N, H)), uSdfShininess) * uSdfSpecular;
        lighting = clamp(uSdfAmbient + diffuse * (1.0 - uSdfAmbient) + specular, 0.0, 2.0);
      }
      alpha = clamp(vAlpha * shapeEdge * velocityAlpha * flicker, 0.0, 1.0);
      finalColor = finalColor * lighting;
    }

    gl_FragColor = vec4(finalColor, alpha);
  }
`,K=`
  precision highp float;
  // モーションタイプ関連定数
  #define MOTION_TYPE_COUNT 90.0  // 実装されているモーションタイプの総数
  #define VARIANT_OFFSET    17.0  // バリアントほまったオフセット（モーフ時に璴歰を防ぐ）
  #define VARIANT_SCALE     11.0  // バリアントからモーションオフセットへの変換係数
  #define LIFE_TIME_SCALE   60.0  // ライフ進行計算用のフレームスケール
  ${g}
  uniform float uTime;
  uniform float uGlobalSpeed; uniform float uGlobalAmp; uniform float uGlobalNoiseScale;
    uniform float uGlobalComplexity;
  uniform float uGlobalEvolution; uniform float uGlobalFidelity; uniform float uGlobalOctaveMult;
  uniform float uGlobalFreq; uniform float uGlobalRadius; uniform float uGlobalSize;
  uniform float uGravity; uniform vec3 uWind; uniform vec3 uSpin;
  uniform float uBoundaryY; uniform float uBoundaryEnabled; uniform float uBoundaryBounce;
  uniform float uViscosity; uniform float uFluidForce;
    uniform float uResistance; uniform float uMoveWithWind; uniform float uNeighborForce;
    uniform float uCollisionMode; uniform float uCollisionRadius; uniform float uRepulsion;
  uniform float uAffectPos; uniform vec2 uMouse; uniform float uMouseForce;
  uniform float uMouseRadius; uniform float uIsOrthographic;
  uniform float uAudioBassMotion; uniform float uAudioTrebleMotion; uniform float uAudioBassLine; uniform float uAudioTrebleLine; uniform float uAudioPulse; uniform float uAudioMorph; uniform float uAudioShatter; uniform float uAudioTwist; uniform float uAudioBend; uniform float uAudioWarp;
  uniform float uAudioBandAMotion; uniform float uAudioBandBMotion;
  uniform float uInterLayerEnabled; uniform int uInterLayerColliderCount; uniform vec4 uInterLayerColliders[MAX_INTER_LAYER_COLLIDERS]; uniform float uInterLayerStrength; uniform float uInterLayerPadding;
  uniform float uConnectDistance;
  uniform float uOpacity;
  uniform float uLife; uniform float uLifeSpread; uniform float uBurst; uniform float uBurstPhase; uniform float uBurstWaveform;
  attribute vec3 aPosA; attribute vec3 aOffA; attribute vec4 aData1A; attribute vec4 aData2A; attribute vec4 aData3A;
  attribute vec3 aPosB; attribute vec3 aOffB; attribute vec4 aData1B; attribute vec4 aData2B; attribute vec4 aData3B;
  attribute float aMix;
  varying float vAlpha;
  varying float vVelocity;
  varying float vBurst;
  vec3 applyAudioSpatialWarp(vec3 pos, vec3 origin, float timeValue, float amp, float phase, float variant) {
    float radiusNorm = clamp(length(pos.xz) / max(1.0, uGlobalRadius), 0.0, 3.0);
    float heightNorm = pos.y / max(1.0, uGlobalRadius);
    float twistAngle = uAudioTwist * (0.35 + variant * 0.85) * heightNorm * 2.8;
    float twistCos = cos(twistAngle);
    float twistSin = sin(twistAngle);
    pos.xz = mat2(twistCos, -twistSin, twistSin, twistCos) * pos.xz;
    float bendWave = sin(timeValue * 2.4 + phase + pos.y * 0.028) + cos(timeValue * 1.7 + phase * 0.7 + pos.x * 0.022);
    pos.x += bendWave * amp * uAudioBend * (0.08 + radiusNorm * 0.12);
    pos.z += cos(timeValue * 2.1 - phase + pos.x * 0.025) * amp * uAudioBend * (0.05 + abs(heightNorm) * 0.14);
    vec3 radialDir = normalize(vec3(pos.x, 0.0, pos.z) + vec3(0.0001));
    float warpWave = sin(length(pos.xz) * 0.045 - timeValue * 3.1 + phase) * 0.5 + 0.5;
    pos += radialDir * amp * uAudioWarp * mix(0.02, 0.12, warpWave) * (0.5 + variant * 0.6);
    pos.y += sin(length(origin.xz) * 0.03 + timeValue * 2.6 + phase) * amp * uAudioWarp * 0.08;
    vec3 tearNoise = noiseVec(pos * (0.04 + uAudioShatter * 0.02) + vec3(timeValue * 1.9 + phase));
    vec3 tearDir = normalize(vec3(tearNoise.x, tearNoise.y * 0.35 + sin(phase + timeValue), tearNoise.z) + vec3(0.0001));
    float tearMask = smoothstep(0.15, 0.95, fract(variant * 7.13 + tearNoise.x * 0.5 + timeValue * 0.12));
    pos += tearDir * amp * uAudioShatter * tearMask * mix(0.02, 0.16, variant);
    return pos;
  }

  float getBurstEnvelope(float lifeProgress) {
    float burstEnvelope = 1.0 - smoothstep(0.0, 0.32, lifeProgress);
    if (uBurstWaveform > 0.5 && uBurstWaveform < 1.5) {
      burstEnvelope *= 0.85 + sin(lifeProgress * 6.28318530718) * 0.15;
    } else if (uBurstWaveform > 1.5 && uBurstWaveform < 2.5) {
      float pulseA = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.12));
      float pulseB = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.26));
      float pulseC = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.41));
      burstEnvelope = max(pulseA, max(pulseB, pulseC));
    } else if (uBurstWaveform >= 2.5) {
      float beatA = 1.0 - smoothstep(0.0, 0.1, abs(lifeProgress - 0.16));
      float beatB = 1.0 - smoothstep(0.0, 0.1, abs(lifeProgress - 0.31));
      burstEnvelope = max(beatA, beatB * 0.82);
    }
    return burstEnvelope;
  }

  vec3 getPos(vec3 p, vec3 off, vec4 d1, vec4 d2, vec4 d3) {
    float aPhase = d1.x; float aRandom = d1.y; float aMotionType = d1.z;
    float aBaseRadiusFactor = d1.w; float aSpeedFactor = d2.x; float aAmpFactor = d2.y;
    float aFreqFactor = d2.z; float aSizeFactor = d2.w;
    float aVariant = d3.z;
    float radius = aBaseRadiusFactor * uGlobalRadius;
    float speed = aSpeedFactor * uGlobalSpeed * (1.0 + uAudioTrebleMotion * 3.2 + uAudioBandAMotion * 3.2 + uAudioBandBMotion * 3.2);
    float amp = aAmpFactor * uGlobalAmp * (1.0 + uAudioBassMotion * 1.35);
    float trebleJitterMix = 1.0 + uAudioTrebleMotion * 1.8;
    float freq = aFreqFactor * uGlobalFreq * trebleJitterMix;
    float noiseScale = uGlobalNoiseScale * trebleJitterMix;
    float complexity = uGlobalComplexity * mix(1.0, trebleJitterMix, 0.6);

    vec3 result = calculateLayerPosition(
      p, off, aMotionType, uTime,
      speed, amp, freq, radius,
      aPhase, aRandom, uWind, noiseScale,
      uGlobalEvolution, complexity, uFluidForce, uViscosity,
      uGlobalFidelity, uGlobalOctaveMult, uAffectPos,
      uResistance, uMoveWithWind, uNeighborForce,
      uCollisionMode, uCollisionRadius, uRepulsion,
      uGravity, uBoundaryY, uBoundaryEnabled, uBoundaryBounce,
      uInterLayerEnabled, uInterLayerColliderCount, uInterLayerColliders, uInterLayerStrength,
      uInterLayerPadding
    );
    if (uAudioMorph > 0.001) {
      float altMotionType = mod(aMotionType + VARIANT_OFFSET + floor(aVariant * VARIANT_SCALE), MOTION_TYPE_COUNT);
      vec3 morphResult = calculateLayerPosition(
        p, off, altMotionType, uTime * (1.02 + aVariant * 0.12),
        speed, amp, freq * (1.0 + aVariant * 0.15), radius,
        aPhase + 1.7, aRandom, uWind, noiseScale,
        uGlobalEvolution, complexity, uFluidForce, uViscosity,
        uGlobalFidelity, uGlobalOctaveMult, uAffectPos,
        uResistance, uMoveWithWind, uNeighborForce,
        uCollisionMode, uCollisionRadius, uRepulsion,
        uGravity, uBoundaryY, uBoundaryEnabled, uBoundaryBounce,
        uInterLayerEnabled, uInterLayerColliderCount, uInterLayerColliders, uInterLayerStrength,
        uInterLayerPadding
      );
      float morphMix = clamp(uAudioMorph * (0.22 + aVariant * 0.48), 0.0, 0.92);
      result = mix(result, morphResult, morphMix);
    }
    return applyAudioSpatialWarp(result, off, uTime, amp, aPhase, aVariant);
  }

  void main() {
    vec3 pA = getPos(aPosA, aOffA, aData1A, aData2A, aData3A);
    vec3 pB = getPos(aPosB, aOffB, aData1B, aData2B, aData3B);
    if (length(uSpin) > 0.001) {
      pA = rotate(pA, vec3(1,0,0), uSpin.x * uTime);
      pA = rotate(pA, vec3(0,1,0), uSpin.y * uTime);
      pA = rotate(pA, vec3(0,0,1), uSpin.z * uTime);
      pB = rotate(pB, vec3(1,0,0), uSpin.x * uTime);
      pB = rotate(pB, vec3(0,1,0), uSpin.y * uTime);
      pB = rotate(pB, vec3(0,0,1), uSpin.z * uTime);
    }
    float dist = distance(pA, pB);
    vec3 rigidA = aPosA * aData1A.w * uGlobalRadius + aOffA;
    vec3 rigidB = aPosB * aData1B.w * uGlobalRadius + aOffB;
    float velocityA = length(pA - rigidA);
    float velocityB = length(pB - rigidB);
    vVelocity = clamp((velocityA + velocityB) / max(1.0, uGlobalRadius * 0.35), 0.0, 1.5);
    vBurst = 0.0;
    if (uLife > 0.0) {
      float lifeA = max(4.0, uLife * mix(1.0 - uLifeSpread, 1.0 + uLifeSpread, aData3A.y));
      float lifeB = max(4.0, uLife * mix(1.0 - uLifeSpread, 1.0 + uLifeSpread, aData3B.y));
      float lifeProgressA = fract((uTime * LIFE_TIME_SCALE) / lifeA + aData3A.x + uBurstPhase);
      float lifeProgressB = fract((uTime * LIFE_TIME_SCALE) / lifeB + aData3B.x + uBurstPhase);
      vBurst = max(getBurstEnvelope(lifeProgressA), getBurstEnvelope(lifeProgressB)) * clamp(uBurst, 0.0, 2.0);
    }
    float audioLineBoost = 1.0 + uAudioBassLine * 0.95 + uAudioTrebleLine * 0.45 + uAudioPulse * 1.05;
    vAlpha = (1.0 - smoothstep(0.0, uConnectDistance, dist)) * uOpacity * audioLineBoost;
    if (dist > uConnectDistance) vAlpha = 0.0;
    vec3 finalPos = mix(pA, pB, aMix);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`,J=`
  precision highp float;
  varying float vAlpha;
  varying float vVelocity;
  varying float vBurst;
  uniform vec3 uColor;
  uniform float uContrast;
  uniform float uInkMode;
  uniform float uGlow;
  uniform float uTime;
  uniform float uLineVelocityGlow;
  uniform float uLineVelocityAlpha;
  uniform float uLineBurstPulse;
  uniform float uLineShimmer;
  uniform float uLineFlickerSpeed;
  uniform float uHueShift;
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  void main() {
    if (vAlpha <= 0.01) discard;
    float glow = max(0.0, uGlow);
    float velocityGlow = 1.0 + vVelocity * uLineVelocityGlow;
    float velocityAlpha = 1.0 + vVelocity * uLineVelocityAlpha;
    float burstAlpha = 1.0 + vBurst * uLineBurstPulse;
    float shimmerWave = 0.5 + 0.5 * sin(uTime * max(0.05, min(uLineFlickerSpeed, 4.0)) * (1.8 + vVelocity * 1.1) + vBurst * 5.0);
    float shimmer = mix(1.0, 0.8 + 0.2 * shimmerWave, clamp(uLineShimmer, 0.0, 1.0));
    float baseAlpha = clamp(vAlpha * max(0.4, uContrast) * (1.0 + glow * 0.3) * velocityAlpha * burstAlpha * shimmer, 0.0, 1.0);
    float inkAlpha = clamp(vAlpha * (1.4 + max(0.0, uContrast) * 0.65 + glow * 0.4) * velocityAlpha * burstAlpha * shimmer, 0.0, 1.0);
    baseAlpha = clamp(baseAlpha + vAlpha * glow * 0.18 * velocityGlow, 0.0, 1.0);
    inkAlpha = clamp(inkAlpha + vAlpha * glow * 0.24 * velocityGlow, 0.0, 1.0);
    vec3 finalColor = uColor;
    if (abs(uHueShift) > 0.001) {
      vec3 hsv = rgb2hsv(finalColor);
      hsv.x = fract(hsv.x + uHueShift);
      finalColor = hsv2rgb(hsv);
    }
    // Ink mode: invert color so white particles become black on white background
    finalColor = mix(finalColor, vec3(1.0) - finalColor, uInkMode);
    gl_FragColor = vec4(finalColor, mix(baseAlpha, inkAlpha, uInkMode));
  }
`,X=`
  precision highp float;
  #define MOTION_TYPE_COUNT 90.0
  #define VARIANT_OFFSET 17.0
  #define VARIANT_SCALE 11.0
  #define LIFE_TIME_SCALE 60.0
  ${g}
  uniform float uTime;
  uniform float uGlobalSpeed; uniform float uGlobalAmp; uniform float uGlobalNoiseScale;
  uniform float uGlobalComplexity;
  uniform float uGlobalEvolution; uniform float uGlobalFidelity; uniform float uGlobalOctaveMult;
  uniform float uGlobalFreq; uniform float uGlobalRadius;
  uniform float uGravity; uniform vec3 uWind; uniform vec3 uSpin;
  uniform float uBoundaryY; uniform float uBoundaryEnabled; uniform float uBoundaryBounce;
  uniform float uViscosity; uniform float uFluidForce;
  uniform float uResistance; uniform float uMoveWithWind; uniform float uNeighborForce;
  uniform float uCollisionMode; uniform float uCollisionRadius; uniform float uRepulsion;
  uniform float uAffectPos;
  uniform float uAudioBassMotion; uniform float uAudioTrebleMotion; uniform float uAudioBassLine; uniform float uAudioTrebleLine; uniform float uAudioPulse; uniform float uAudioMorph; uniform float uAudioShatter; uniform float uAudioTwist; uniform float uAudioBend; uniform float uAudioWarp;
  uniform float uAudioBandAMotion; uniform float uAudioBandBMotion;
  uniform float uInterLayerEnabled; uniform int uInterLayerColliderCount; uniform vec4 uInterLayerColliders[MAX_INTER_LAYER_COLLIDERS]; uniform float uInterLayerStrength; uniform float uInterLayerPadding;
  uniform float uConnectDistance;
  uniform float uOpacity;
  uniform float uLife; uniform float uLifeSpread; uniform float uBurst; uniform float uBurstPhase; uniform float uBurstWaveform;
  uniform float uLineWidth;
  attribute vec3 aPosA; attribute vec3 aOffA; attribute vec4 aData1A; attribute vec4 aData2A; attribute vec4 aData3A;
  attribute vec3 aPosB; attribute vec3 aOffB; attribute vec4 aData1B; attribute vec4 aData2B; attribute vec4 aData3B;
  attribute vec2 aLineCoord;
  varying float vAlpha;
  varying float vVelocity;
  varying float vBurst;
  varying float vEdge;
  varying float vAlong;
  vec3 applyAudioSpatialWarp(vec3 pos, vec3 origin, float timeValue, float amp, float phase, float variant) {
    float radiusNorm = clamp(length(pos.xz) / max(1.0, uGlobalRadius), 0.0, 3.0);
    float heightNorm = pos.y / max(1.0, uGlobalRadius);
    float twistAngle = uAudioTwist * (0.35 + variant * 0.85) * heightNorm * 2.8;
    float twistCos = cos(twistAngle);
    float twistSin = sin(twistAngle);
    pos.xz = mat2(twistCos, -twistSin, twistSin, twistCos) * pos.xz;
    float bendWave = sin(timeValue * 2.4 + phase + pos.y * 0.028) + cos(timeValue * 1.7 + phase * 0.7 + pos.x * 0.022);
    pos.x += bendWave * amp * uAudioBend * (0.08 + radiusNorm * 0.12);
    pos.z += cos(timeValue * 2.1 - phase + pos.x * 0.025) * amp * uAudioBend * (0.05 + abs(heightNorm) * 0.14);
    vec3 radialDir = normalize(vec3(pos.x, 0.0, pos.z) + vec3(0.0001));
    float warpWave = sin(length(pos.xz) * 0.045 - timeValue * 3.1 + phase) * 0.5 + 0.5;
    pos += radialDir * amp * uAudioWarp * mix(0.02, 0.12, warpWave) * (0.5 + variant * 0.6);
    pos.y += sin(length(origin.xz) * 0.03 + timeValue * 2.6 + phase) * amp * uAudioWarp * 0.08;
    vec3 tearNoise = noiseVec(pos * (0.04 + uAudioShatter * 0.02) + vec3(timeValue * 1.9 + phase));
    vec3 tearDir = normalize(vec3(tearNoise.x, tearNoise.y * 0.35 + sin(phase + timeValue), tearNoise.z) + vec3(0.0001));
    float tearMask = smoothstep(0.15, 0.95, fract(variant * 7.13 + tearNoise.x * 0.5 + timeValue * 0.12));
    pos += tearDir * amp * uAudioShatter * tearMask * mix(0.02, 0.16, variant);
    return pos;
  }
  float getBurstEnvelope(float lifeProgress) {
    float burstEnvelope = 1.0 - smoothstep(0.0, 0.32, lifeProgress);
    if (uBurstWaveform > 0.5 && uBurstWaveform < 1.5) {
      burstEnvelope *= 0.85 + sin(lifeProgress * 6.28318530718) * 0.15;
    } else if (uBurstWaveform > 1.5 && uBurstWaveform < 2.5) {
      float pulseA = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.12));
      float pulseB = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.26));
      float pulseC = 1.0 - smoothstep(0.0, 0.09, abs(lifeProgress - 0.41));
      burstEnvelope = max(pulseA, max(pulseB, pulseC));
    } else if (uBurstWaveform >= 2.5) {
      float beatA = 1.0 - smoothstep(0.0, 0.1, abs(lifeProgress - 0.16));
      float beatB = 1.0 - smoothstep(0.0, 0.1, abs(lifeProgress - 0.31));
      burstEnvelope = max(beatA, beatB * 0.82);
    }
    return burstEnvelope;
  }
  vec3 getPos(vec3 p, vec3 off, vec4 d1, vec4 d2, vec4 d3) {
    float aPhase = d1.x; float aRandom = d1.y; float aMotionType = d1.z;
    float aBaseRadiusFactor = d1.w; float aSpeedFactor = d2.x; float aAmpFactor = d2.y;
    float aFreqFactor = d2.z; float aVariant = d3.z;
    float radius = aBaseRadiusFactor * uGlobalRadius;
    float speed = aSpeedFactor * uGlobalSpeed * (1.0 + uAudioTrebleMotion * 3.2 + uAudioBandAMotion * 3.2 + uAudioBandBMotion * 3.2);
    float amp = aAmpFactor * uGlobalAmp * (1.0 + uAudioBassMotion * 1.35);
    float trebleJitterMix = 1.0 + uAudioTrebleMotion * 1.8;
    float freq = aFreqFactor * uGlobalFreq * trebleJitterMix;
    float noiseScale = uGlobalNoiseScale * trebleJitterMix;
    float complexity = uGlobalComplexity * mix(1.0, trebleJitterMix, 0.6);
    vec3 result = calculateLayerPosition(
      p, off, aMotionType, uTime,
      speed, amp, freq, radius,
      aPhase, aRandom, uWind, noiseScale,
      uGlobalEvolution, complexity, uFluidForce, uViscosity,
      uGlobalFidelity, uGlobalOctaveMult, uAffectPos,
      uResistance, uMoveWithWind, uNeighborForce,
      uCollisionMode, uCollisionRadius, uRepulsion,
      uGravity, uBoundaryY, uBoundaryEnabled, uBoundaryBounce,
      uInterLayerEnabled, uInterLayerColliderCount, uInterLayerColliders, uInterLayerStrength,
      uInterLayerPadding
    );
    if (uAudioMorph > 0.001) {
      float altMotionType = mod(aMotionType + VARIANT_OFFSET + floor(aVariant * VARIANT_SCALE), MOTION_TYPE_COUNT);
      vec3 morphResult = calculateLayerPosition(
        p, off, altMotionType, uTime * (1.02 + aVariant * 0.12),
        speed, amp, freq * (1.0 + aVariant * 0.15), radius,
        aPhase + 1.7, aRandom, uWind, noiseScale,
        uGlobalEvolution, complexity, uFluidForce, uViscosity,
        uGlobalFidelity, uGlobalOctaveMult, uAffectPos,
        uResistance, uMoveWithWind, uNeighborForce,
        uCollisionMode, uCollisionRadius, uRepulsion,
        uGravity, uBoundaryY, uBoundaryEnabled, uBoundaryBounce,
        uInterLayerEnabled, uInterLayerColliderCount, uInterLayerColliders, uInterLayerStrength,
        uInterLayerPadding
      );
      float morphMix = clamp(uAudioMorph * (0.22 + aVariant * 0.48), 0.0, 0.92);
      result = mix(result, morphResult, morphMix);
    }
    return applyAudioSpatialWarp(result, off, uTime, amp, aPhase, aVariant);
  }
  void main() {
    vec3 pA = getPos(aPosA, aOffA, aData1A, aData2A, aData3A);
    vec3 pB = getPos(aPosB, aOffB, aData1B, aData2B, aData3B);
    if (length(uSpin) > 0.001) {
      pA = rotate(rotate(rotate(pA, vec3(1,0,0), uSpin.x * uTime), vec3(0,1,0), uSpin.y * uTime), vec3(0,0,1), uSpin.z * uTime);
      pB = rotate(rotate(rotate(pB, vec3(1,0,0), uSpin.x * uTime), vec3(0,1,0), uSpin.y * uTime), vec3(0,0,1), uSpin.z * uTime);
    }
    float dist = distance(pA, pB);
    vec3 rigidA = aPosA * aData1A.w * uGlobalRadius + aOffA;
    vec3 rigidB = aPosB * aData1B.w * uGlobalRadius + aOffB;
    float velocityA = length(pA - rigidA);
    float velocityB = length(pB - rigidB);
    vVelocity = clamp((velocityA + velocityB) / max(1.0, uGlobalRadius * 0.35), 0.0, 1.5);
    vBurst = 0.0;
    if (uLife > 0.0) {
      float lifeA = max(4.0, uLife * mix(1.0 - uLifeSpread, 1.0 + uLifeSpread, aData3A.y));
      float lifeB = max(4.0, uLife * mix(1.0 - uLifeSpread, 1.0 + uLifeSpread, aData3B.y));
      float lifeProgressA = fract((uTime * LIFE_TIME_SCALE) / lifeA + aData3A.x + uBurstPhase);
      float lifeProgressB = fract((uTime * LIFE_TIME_SCALE) / lifeB + aData3B.x + uBurstPhase);
      vBurst = max(getBurstEnvelope(lifeProgressA), getBurstEnvelope(lifeProgressB)) * clamp(uBurst, 0.0, 2.0);
    }
    float audioLineBoost = 1.0 + uAudioBassLine * 0.95 + uAudioTrebleLine * 0.45 + uAudioPulse * 1.05;
    vAlpha = (1.0 - smoothstep(0.0, uConnectDistance, dist)) * uOpacity * audioLineBoost;
    if (dist > uConnectDistance) vAlpha = 0.0;
    vAlong = aLineCoord.x;
    vEdge = abs(aLineCoord.y);
    vec3 center = mix(pA, pB, vAlong);
    vec3 lineDir = normalize(pB - pA + vec3(0.0001));
    vec3 viewDir = normalize(cameraPosition - center + vec3(0.0001));
    vec3 sideDir = cross(viewDir, lineDir);
    float sideLen = length(sideDir);
    if (sideLen < 0.0001) sideDir = cross(vec3(0.0, 1.0, 0.0), lineDir);
    sideDir = normalize(sideDir + vec3(0.0001));
    float width = uLineWidth * (1.0 + vVelocity * 0.3 + vBurst * 0.18) * mix(0.9, 0.72, abs(aLineCoord.y));
    vec3 finalPos = center + sideDir * aLineCoord.y * width;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`,j=`
  precision highp float;
  varying float vAlpha;
  varying float vVelocity;
  varying float vBurst;
  varying float vEdge;
  varying float vAlong;
  uniform vec3 uColor;
  uniform float uContrast;
  uniform float uInkMode;
  uniform float uGlow;
  uniform float uTime;
  uniform float uLineVelocityGlow;
  uniform float uLineVelocityAlpha;
  uniform float uLineBurstPulse;
  uniform float uLineShimmer;
  uniform float uLineFlickerSpeed;
  uniform float uHueShift;
  uniform float uLineSoftness;
  uniform float uBrushStyle;
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  void main() {
    if (vAlpha <= 0.01) discard;
    float glow = max(0.0, uGlow);
    float velocityGlow = 1.0 + vVelocity * uLineVelocityGlow;
    float velocityAlpha = 1.0 + vVelocity * uLineVelocityAlpha;
    float burstAlpha = 1.0 + vBurst * uLineBurstPulse;
    float shimmerWave = 0.5 + 0.5 * sin(uTime * max(0.05, min(uLineFlickerSpeed, 4.0)) * (1.8 + vVelocity * 1.1) + vBurst * 5.0);
    float shimmer = mix(1.0, 0.8 + 0.2 * shimmerWave, clamp(uLineShimmer, 0.0, 1.0));
    float softnessExp = mix(4.5, 1.15, clamp(uLineSoftness, 0.0, 1.0));
    float edgeFade = pow(max(0.0, 1.0 - vEdge), softnessExp);
    float brushTexture = 0.82 + 0.18 * sin(vAlong * 26.0 + uTime * 3.1 + vVelocity * 7.0);
    float filamentTexture = 0.55 + 0.45 * sin(vAlong * 44.0 - uTime * 5.6 + vVelocity * 9.0);
    float strand = mix(brushTexture, filamentTexture, clamp(uBrushStyle, 0.0, 1.0));
    float coreBoost = mix(1.0, 1.2 + (1.0 - vEdge) * 0.85, clamp(uBrushStyle, 0.0, 1.0));
    float alpha = clamp(vAlpha * max(0.4, uContrast) * (1.0 + glow * 0.22) * velocityAlpha * burstAlpha * shimmer * edgeFade * strand * coreBoost, 0.0, 1.0);
    vec3 finalColor = uColor;
    if (abs(uHueShift) > 0.001) {
      vec3 hsv = rgb2hsv(finalColor);
      hsv.x = fract(hsv.x + uHueShift);
      finalColor = hsv2rgb(hsv);
    }
    finalColor *= mix(1.0, 1.0 + glow * 0.16 + vVelocity * 0.12, clamp(uBrushStyle, 0.0, 1.0));
    finalColor = mix(finalColor, vec3(1.0) - finalColor, uInkMode);
    gl_FragColor = vec4(finalColor, mix(alpha, min(1.0, alpha * 1.1), uInkMode));
  }
`,$=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,Q=`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uScanlineIntensity;
  uniform float uScanlineDensity;
  uniform float uNoiseIntensity;
  uniform float uVignetteIntensity;
  uniform float uPulseIntensity;
  uniform float uPulseSpeed;
  uniform float uImpactFlashIntensity;
  uniform float uImpactAmount;
  uniform float uInterferenceIntensity;
  uniform float uPersistenceIntensity;
  uniform float uPersistenceLayers;
  uniform float uSplitIntensity;
  uniform float uSplitOffset;
  uniform float uSweepIntensity;
  uniform float uSweepSpeed;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    float lineWave = 0.5 + 0.5 * sin(vUv.y * uScanlineDensity * 3.14159265 + uTime * 1.8);
    float scanline = pow(lineWave, 2.4) * uScanlineIntensity;
    vec2 noiseUv = vUv * vec2(960.0, 540.0) + vec2(uTime * 37.0, uTime * 19.0);
    float grain = (hash(floor(noiseUv)) - 0.5) * 2.0;
    float noise = abs(grain) * uNoiseIntensity;
    float vignetteShape = smoothstep(0.95, 0.18, distance(vUv, vec2(0.5)));
    float vignette = (1.0 - vignetteShape) * uVignetteIntensity;
    vec2 centeredUv = vUv - vec2(0.5);
    float radialDistance = length(centeredUv);
    float pulsePhase = uTime * (0.4 + uPulseSpeed * 2.2) - radialDistance * 18.0;
    float pulseWave = 0.5 + 0.5 * sin(pulsePhase);
    float pulseMask = smoothstep(0.9, 0.0, radialDistance);
    float pulse = pow(pulseWave, 3.0) * pulseMask * uPulseIntensity;
    float impactCenter = smoothstep(0.72, 0.0, radialDistance);
    float impactFlash = impactCenter * uImpactFlashIntensity * uImpactAmount;
    float bandPrimary = sin(vUv.y * 42.0 + uTime * 4.8);
    float bandSecondary = sin(vUv.y * 87.0 - uTime * 7.2 + sin(vUv.x * 12.0 + uTime * 0.9));
    float interference = smoothstep(0.58, 1.0, abs(bandPrimary * 0.7 + bandSecondary * 0.3)) * uInterferenceIntensity;

    float persistence = 0.0;
    for (int i = 0; i < 4; i++) {
      float layerIndex = float(i + 1);
      float enabled = step(layerIndex - 0.5, uPersistenceLayers);
      float ghostTime = uTime - layerIndex * 0.14;
      float ghostLine = pow(0.5 + 0.5 * sin((vUv.y + layerIndex * 0.012) * uScanlineDensity * 3.14159265 + ghostTime * 1.8), 2.1);
      float ghostSweepProgress = fract(ghostTime * max(0.05, uSweepSpeed) * 0.12);
      float ghostSweepCenter = mix(-0.35, 1.35, ghostSweepProgress);
      float ghostSweep = 1.0 - smoothstep(0.0, 0.24 + layerIndex * 0.02, abs((vUv.x + vUv.y * 0.22) - ghostSweepCenter));
      float decay = 1.0 / (1.0 + layerIndex * 1.35);
      persistence += enabled * (ghostLine * 0.16 + ghostSweep * 0.22) * decay;
    }
    persistence *= uPersistenceIntensity;

    float splitOffset = max(0.0, uSplitOffset) * 0.025;
    float splitGhostA = pow(0.5 + 0.5 * sin((vUv.y + splitOffset) * uScanlineDensity * 3.14159265 + uTime * 1.85), 2.2);
    float splitGhostB = pow(0.5 + 0.5 * sin((vUv.y - splitOffset) * uScanlineDensity * 3.14159265 + uTime * 1.75), 2.2);
    float splitMask = smoothstep(0.04, 0.45, abs(vUv.x - 0.5));
    float split = abs(splitGhostA - splitGhostB) * splitMask * uSplitIntensity;

    float sweepProgress = fract(uTime * max(0.05, uSweepSpeed) * 0.12);
    float sweepCenter = mix(-0.35, 1.35, sweepProgress);
    float sweepBand = 1.0 - smoothstep(0.0, 0.24, abs((vUv.x + vUv.y * 0.22) - sweepCenter));
    float sweep = sweepBand * uSweepIntensity;

    float alpha = clamp(scanline * 0.45 + noise * 0.35 + vignette + pulse * 0.55 + impactFlash * 0.8 + interference * 0.35 + persistence + split * 0.4 + sweep * 0.28, 0.0, 0.92);
    if (alpha <= 0.001) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;export{j as B,H as F,J as L,y as M,U as P,Q as S,X as a,K as b,q as c,$ as d,N as e,Y as f,W as g};
