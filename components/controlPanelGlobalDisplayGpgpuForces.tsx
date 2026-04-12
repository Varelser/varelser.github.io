import React from 'react';

import { Slider, Toggle } from './controlPanelParts';
import type { GlobalDisplayEffectsSharedProps } from './controlPanelGlobalDisplayEffectsShared';

export const GlobalDisplayGpgpuForcesSection: React.FC<GlobalDisplayEffectsSharedProps> = ({
  config,
  updateConfig,
}) => (
  <>
    {/* N-Body */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="N-Body Gravity" value={config.gpgpuNBodyEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuNBodyEnabled', v)} />
      {config.gpgpuNBodyEnabled && (
        <>
          <Slider label="Strength" value={config.gpgpuNBodyStrength} min={0} max={10} step={0.1} onChange={(v) => updateConfig('gpgpuNBodyStrength', v)} />
          <Slider label="Repulsion Radius" value={config.gpgpuNBodyRepulsion} min={0.5} max={50} step={0.5} onChange={(v) => updateConfig('gpgpuNBodyRepulsion', v)} />
          <Slider label="Softening" value={config.gpgpuNBodySoftening} min={0.1} max={20} step={0.1} onChange={(v) => updateConfig('gpgpuNBodySoftening', v)} />
          <Slider label="Sample Count" value={config.gpgpuNBodySampleCount} min={4} max={64} step={4} onChange={(v) => updateConfig('gpgpuNBodySampleCount', v)} />
        </>
      )}
    </div>

    {/* Velocity Color */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Velocity Color" value={config.gpgpuVelColorEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuVelColorEnabled', v)} />
      {config.gpgpuVelColorEnabled && (
        <>
          <Slider label="Hue Min (°)" value={config.gpgpuVelColorHueMin} min={0} max={360} step={1} onChange={(v) => updateConfig('gpgpuVelColorHueMin', v)} />
          <Slider label="Hue Max (°)" value={config.gpgpuVelColorHueMax} min={0} max={360} step={1} onChange={(v) => updateConfig('gpgpuVelColorHueMax', v)} />
          <Slider label="Saturation" value={config.gpgpuVelColorSaturation} min={0} max={1} step={0.01} onChange={(v) => updateConfig('gpgpuVelColorSaturation', v)} />
        </>
      )}
    </div>

    {/* Life/Age */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Life System" value={config.gpgpuAgeEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuAgeEnabled', v)} />
      {config.gpgpuAgeEnabled && (
        <>
          <Slider label="Lifetime (s)" value={config.gpgpuAgeMax} min={0.5} max={30} step={0.5} onChange={(v) => updateConfig('gpgpuAgeMax', v)} />
          <Slider label="Fade In" value={config.gpgpuAgeFadeIn} min={0} max={0.5} step={0.01} onChange={(v) => updateConfig('gpgpuAgeFadeIn', v)} />
          <Slider label="Fade Out" value={config.gpgpuAgeFadeOut} min={0} max={0.5} step={0.01} onChange={(v) => updateConfig('gpgpuAgeFadeOut', v)} />
        </>
      )}
    </div>

    {/* Curl Noise */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Curl Noise" value={config.gpgpuCurlEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuCurlEnabled', v)} />
      {config.gpgpuCurlEnabled && (
        <>
          <Slider label="Strength" value={config.gpgpuCurlStrength} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuCurlStrength', v)} />
          <Slider label="Scale" value={config.gpgpuCurlScale} min={0.001} max={0.05} step={0.001} onChange={(v) => updateConfig('gpgpuCurlScale', v)} />
        </>
      )}
    </div>

    {/* Boids */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Boids Flocking" value={config.gpgpuBoidsEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuBoidsEnabled', v)} />
      {config.gpgpuBoidsEnabled && (
        <>
          <Slider label="Separation" value={config.gpgpuBoidsSeparation} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuBoidsSeparation', v)} />
          <Slider label="Alignment" value={config.gpgpuBoidsAlignment} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuBoidsAlignment', v)} />
          <Slider label="Cohesion" value={config.gpgpuBoidsCohesion} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuBoidsCohesion', v)} />
          <Slider label="Radius" value={config.gpgpuBoidsRadius} min={5} max={200} step={5} onChange={(v) => updateConfig('gpgpuBoidsRadius', v)} />
        </>
      )}
    </div>

    {/* Strange Attractor */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Strange Attractor" value={config.gpgpuAttractorEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuAttractorEnabled', v)} />
      {config.gpgpuAttractorEnabled && (
        <>
          <Toggle
            label="Type"
            value={config.gpgpuAttractorType}
            options={[{ label: 'Lorenz', val: 'lorenz' }, { label: 'Rössler', val: 'rossler' }, { label: 'Thomas', val: 'thomas' }]}
            onChange={(v) => updateConfig('gpgpuAttractorType', v)}
          />
          <Slider label="Strength" value={config.gpgpuAttractorStrength} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuAttractorStrength', v)} />
          <Slider label="Scale" value={config.gpgpuAttractorScale} min={0.5} max={50} step={0.5} onChange={(v) => updateConfig('gpgpuAttractorScale', v)} />
        </>
      )}
    </div>

    {/* Vortex */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Vortex Field" value={config.gpgpuVortexEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuVortexEnabled', v)} />
      {config.gpgpuVortexEnabled && (
        <>
          <Slider label="Strength" value={config.gpgpuVortexStrength} min={0} max={10} step={0.1} onChange={(v) => updateConfig('gpgpuVortexStrength', v)} />
          <Slider label="Axis Tilt (rad)" value={config.gpgpuVortexTilt} min={-Math.PI} max={Math.PI} step={0.05} onChange={(v) => updateConfig('gpgpuVortexTilt', v)} />
        </>
      )}
    </div>

    {/* Wind */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Wind Force" value={config.gpgpuWindEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuWindEnabled', v)} />
      {config.gpgpuWindEnabled && (
        <>
          <Slider label="Strength" value={config.gpgpuWindStrength} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuWindStrength', v)} />
          <Slider label="Direction X" value={config.gpgpuWindX} min={-1} max={1} step={0.05} onChange={(v) => updateConfig('gpgpuWindX', v)} />
          <Slider label="Direction Y" value={config.gpgpuWindY} min={-1} max={1} step={0.05} onChange={(v) => updateConfig('gpgpuWindY', v)} />
          <Slider label="Direction Z" value={config.gpgpuWindZ} min={-1} max={1} step={0.05} onChange={(v) => updateConfig('gpgpuWindZ', v)} />
          <Slider label="Gustiness" value={config.gpgpuWindGust} min={0} max={2} step={0.05} onChange={(v) => updateConfig('gpgpuWindGust', v)} />
        </>
      )}
    </div>

    {/* Gravity Well */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Gravity Well" value={config.gpgpuWellEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuWellEnabled', v)} />
      {config.gpgpuWellEnabled && (
        <>
          <Slider label="Strength" value={config.gpgpuWellStrength} min={0} max={10} step={0.1} onChange={(v) => updateConfig('gpgpuWellStrength', v)} />
          <Slider label="Softening" value={config.gpgpuWellSoftening} min={1} max={100} step={1} onChange={(v) => updateConfig('gpgpuWellSoftening', v)} />
          <Slider label="Orbit (tangential)" value={config.gpgpuWellOrbit} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuWellOrbit', v)} />
        </>
      )}
    </div>

    {/* Elastic Spring */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Elastic Spring" value={config.gpgpuElasticEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuElasticEnabled', v)} />
      {config.gpgpuElasticEnabled && (
        <Slider label="Strength" value={config.gpgpuElasticStrength} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuElasticStrength', v)} />
      )}
    </div>

    {/* Magnetic / Lorentz */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Magnetic Field" value={config.gpgpuMagneticEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuMagneticEnabled', v)} />
      {config.gpgpuMagneticEnabled && (
        <>
          <Slider label="Strength" value={config.gpgpuMagneticStrength} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuMagneticStrength', v)} />
          <Slider label="Field X" value={config.gpgpuMagneticBX} min={-1} max={1} step={0.05} onChange={(v) => updateConfig('gpgpuMagneticBX', v)} />
          <Slider label="Field Y" value={config.gpgpuMagneticBY} min={-1} max={1} step={0.05} onChange={(v) => updateConfig('gpgpuMagneticBY', v)} />
          <Slider label="Field Z" value={config.gpgpuMagneticBZ} min={-1} max={1} step={0.05} onChange={(v) => updateConfig('gpgpuMagneticBZ', v)} />
        </>
      )}
    </div>

    {/* SPH Fluid */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="SPH Fluid" value={config.gpgpuSphEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuSphEnabled', v)} />
      {config.gpgpuSphEnabled && (
        <>
          <Slider label="Pressure" value={config.gpgpuSphPressure} min={0} max={20} step={0.1} onChange={(v) => updateConfig('gpgpuSphPressure', v)} />
          <Slider label="Viscosity" value={config.gpgpuSphViscosity} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuSphViscosity', v)} />
          <Slider label="Interaction Radius" value={config.gpgpuSphRadius} min={5} max={200} step={5} onChange={(v) => updateConfig('gpgpuSphRadius', v)} />
          <Slider label="Rest Density" value={config.gpgpuSphRestDensity} min={0.1} max={10} step={0.1} onChange={(v) => updateConfig('gpgpuSphRestDensity', v)} />
        </>
      )}
    </div>

    {/* Vector Field */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Vector Field" value={config.gpgpuVFieldEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuVFieldEnabled', v)} />
      {config.gpgpuVFieldEnabled && (
        <>
          <Toggle
            label="Field Type"
            value={config.gpgpuVFieldType}
            options={[{ label: 'Dipole', val: 'dipole' }, { label: 'Saddle', val: 'saddle' }, { label: 'Spiral', val: 'spiral' }, { label: 'Source', val: 'source' }]}
            onChange={(v) => updateConfig('gpgpuVFieldType', v)}
          />
          <Slider label="Strength" value={config.gpgpuVFieldStrength} min={0} max={10} step={0.1} onChange={(v) => updateConfig('gpgpuVFieldStrength', v)} />
          <Slider label="Scale" value={config.gpgpuVFieldScale} min={0.001} max={0.05} step={0.001} onChange={(v) => updateConfig('gpgpuVFieldScale', v)} />
        </>
      )}
    </div>

    {/* Spring */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Spring (to Spawn)" value={config.gpgpuSpringEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuSpringEnabled', v)} />
      {config.gpgpuSpringEnabled && (
        <Slider label="Strength" value={config.gpgpuSpringStrength} min={0} max={10} step={0.1} onChange={(v) => updateConfig('gpgpuSpringStrength', v)} />
      )}
    </div>

    {/* Verlet Integration */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Verlet Integration" value={config.gpgpuVerletEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuVerletEnabled', v)} />
    </div>

    {/* SDF Collider */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="SDF Collider" value={config.gpgpuSdfEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuSdfEnabled', v)} />
      {config.gpgpuSdfEnabled && (
        <>
          <Toggle
            label="Shape"
            value={config.gpgpuSdfShape}
            options={[{ label: 'Sphere', val: 'sphere' }, { label: 'Box', val: 'box' }, { label: 'Torus', val: 'torus' }, { label: 'Capsule', val: 'capsule' }]}
            onChange={(v) => updateConfig('gpgpuSdfShape', v)}
          />
          <Slider label="Size" value={config.gpgpuSdfSize} min={5} max={300} step={5} onChange={(v) => updateConfig('gpgpuSdfSize', v)} />
          <Slider label="Bounce" value={config.gpgpuSdfBounce} min={0} max={2} step={0.05} onChange={(v) => updateConfig('gpgpuSdfBounce', v)} />
          <Slider label="Center X" value={config.gpgpuSdfX} min={-300} max={300} step={5} onChange={(v) => updateConfig('gpgpuSdfX', v)} />
          <Slider label="Center Y" value={config.gpgpuSdfY} min={-300} max={300} step={5} onChange={(v) => updateConfig('gpgpuSdfY', v)} />
          <Slider label="Center Z" value={config.gpgpuSdfZ} min={-300} max={300} step={5} onChange={(v) => updateConfig('gpgpuSdfZ', v)} />
        </>
      )}
    </div>

    {/* Color over Lifetime */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Color over Lifetime" value={config.gpgpuAgeColorEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuAgeColorEnabled', v)} />
      {config.gpgpuAgeColorEnabled && (
        <div className="flex gap-3 mt-2">
          <div className="flex-1">
            <div className="mb-1 text-panel-sm opacity-60 uppercase tracking-widest">Young</div>
            <input type="color" value={config.gpgpuAgeColorYoung} onChange={(e) => updateConfig('gpgpuAgeColorYoung', e.target.value)} className="h-8 w-full cursor-pointer rounded border border-white/20 bg-transparent p-0.5" />
          </div>
          <div className="flex-1">
            <div className="mb-1 text-panel-sm opacity-60 uppercase tracking-widest">Old</div>
            <input type="color" value={config.gpgpuAgeColorOld} onChange={(e) => updateConfig('gpgpuAgeColorOld', e.target.value)} className="h-8 w-full cursor-pointer rounded border border-white/20 bg-transparent p-0.5" />
          </div>
        </div>
      )}
    </div>

    {/* Size over Lifetime */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Size over Lifetime" value={config.gpgpuAgeSizeEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuAgeSizeEnabled', v)} />
      {config.gpgpuAgeSizeEnabled && (
        <>
          <Slider label="Size at Birth" value={config.gpgpuAgeSizeStart} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuAgeSizeStart', v)} />
          <Slider label="Size at Death" value={config.gpgpuAgeSizeEnd} min={0} max={5} step={0.05} onChange={(v) => updateConfig('gpgpuAgeSizeEnd', v)} />
        </>
      )}
    </div>

    {/* Mouse Force */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Mouse Force" value={config.gpgpuMouseEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuMouseEnabled', v)} />
      {config.gpgpuMouseEnabled && (
        <>
          <Toggle
            label="Mode"
            value={config.gpgpuMouseMode}
            options={[{ label: 'Attract', val: 'attract' }, { label: 'Repel', val: 'repel' }, { label: 'Swirl', val: 'swirl' }]}
            onChange={(v) => updateConfig('gpgpuMouseMode', v)}
          />
          <Slider label="Strength" value={config.gpgpuMouseStrength} min={0} max={10} step={0.1} onChange={(v) => updateConfig('gpgpuMouseStrength', v)} />
          <Slider label="Radius" value={config.gpgpuMouseRadius} min={10} max={500} step={10} onChange={(v) => updateConfig('gpgpuMouseRadius', v)} />
        </>
      )}
    </div>

    {/* Sort-based Transparency (GPU Bitonic Sort) */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Depth Sort (Alpha)" value={config.gpgpuSortEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuSortEnabled', v)} />
      {config.gpgpuSortEnabled && (
        <div className="mt-1 text-panel-sm text-white/40">GPU bitonic sort — far particles drawn first. Switches to Normal blending.</div>
      )}
    </div>

    {/* Fluid Advection */}
    <div className="mt-4 border-t border-white/10 pt-4">
      <Toggle label="Fluid Advection" value={config.gpgpuFluidEnabled} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuFluidEnabled', v)} />
      {config.gpgpuFluidEnabled && (
        <>
          <Slider label="Influence" value={config.gpgpuFluidInfluence} min={0} max={3} step={0.05} onChange={(v) => updateConfig('gpgpuFluidInfluence', v)} />
          <Slider label="Strength" value={config.gpgpuFluidStrength} min={0} max={5} step={0.1} onChange={(v) => updateConfig('gpgpuFluidStrength', v)} />
          <Slider label="Diffuse" value={config.gpgpuFluidDiffuse} min={0} max={0.2} step={0.002} onChange={(v) => updateConfig('gpgpuFluidDiffuse', v)} />
          <Slider label="Decay" value={config.gpgpuFluidDecay} min={0} max={0.1} step={0.001} onChange={(v) => updateConfig('gpgpuFluidDecay', v)} />
          <Slider label="Scale" value={config.gpgpuFluidScale} min={0.5} max={5} step={0.1} onChange={(v) => updateConfig('gpgpuFluidScale', v)} />
          <Toggle label="Ext. Force (Vortex)" value={config.gpgpuFluidExtForce} options={[{ label: 'On', val: true }, { label: 'Off', val: false }]} onChange={(v) => updateConfig('gpgpuFluidExtForce', v)} />
        </>
      )}
    </div>
  </>
);
