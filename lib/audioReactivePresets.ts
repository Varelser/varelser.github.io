import type { AudioModulationRoute } from '../types/audioReactive';

type AudioRoutePresetId =
  | 'particle-spectrum'
  | 'line-weave'
  | 'fog-breath'
  | 'growth-pulse'
  | 'camera-impulse'
  | 'screen-glitch'
  | 'surface-relief'
  | 'crystal-bloom'
  | 'voxel-grid'
  | 'reaction-pulse'
  | 'deposition-etch'
  | 'gpgpu-surge'
  | 'hybrid-loom'
  | 'sequence-gates';

interface AudioRoutePresetDefinition {
  id: AudioRoutePresetId;
  label: string;
  status: 'live';
  description: string;
  targets: string[];
}

export const AUDIO_ROUTE_PRESET_DEFINITIONS: AudioRoutePresetDefinition[] = [
  {
    id: 'particle-spectrum',
    label: 'Particle Spectrum',
    status: 'live',
    description: 'Bass, treble, pulse, centroid, and flux drive particle motion, size, alpha, warp, and hue shift.',
    targets: ['particle.bassMotion', 'particle.bassSize', 'particle.trebleAlpha', 'particle.pulse', 'particle.warp', 'postfx.hueShift'],
  },
  {
    id: 'line-weave',
    label: 'Line Weave',
    status: 'live',
    description: 'Treble and flux push line opacity, width, shimmer, flicker, and connection distance.',
    targets: ['line.opacity', 'line.width', 'line.shimmer', 'line.flickerSpeed', 'line.connectDistance', 'line.burstPulse'],
  },
  {
    id: 'fog-breath',
    label: 'Fog Breath',
    status: 'live',
    description: 'RMS, centroid, spread, and pulse drive fog density, glow, drift, opacity, and anisotropy.',
    targets: ['fog.density', 'fog.glow', 'fog.drift', 'fog.opacity', 'fog.anisotropy'],
  },
  {
    id: 'growth-pulse',
    label: 'Growth Pulse',
    status: 'live',
    description: 'Beat, bass, onset, and pulse drive branch count, strand length, spread, and opacity.',
    targets: ['growth.branches', 'growth.length', 'growth.spread', 'growth.opacity'],
  },
  {
    id: 'camera-impulse',
    label: 'Camera Impulse',
    status: 'live',
    description: 'Beat and centroid drive shake, orbit, FOV, and dolly modulation.',
    targets: ['camera.shake', 'camera.orbitSpeed', 'camera.fov', 'camera.dolly'],
  },
  {
    id: 'screen-glitch',
    label: 'Screen Glitch',
    status: 'live',
    description: 'Pulse, treble, onset, flux, and centroid drive scanlines, split, noise, pulse, and sweep.',
    targets: ['screen.scanlineIntensity', 'screen.noiseIntensity', 'screen.pulseIntensity', 'screen.splitIntensity', 'screen.sweepIntensity'],
  },
  {
    id: 'surface-relief',
    label: 'Surface Relief',
    status: 'live',
    description: 'Bass, centroid, pulse, onset, and low-mid drive surface displacement, relief, opacity, wireframe, and slice depth.',
    targets: ['surface.displacement', 'surface.relief', 'surface.opacity', 'surface.wireframe', 'surface.sliceDepth'],
  },
  {
    id: 'crystal-bloom',
    label: 'Crystal Bloom',
    status: 'live',
    description: 'Bass, centroid, pulse, and flux drive crystal scale, spread, glow, opacity, and wireframe.',
    targets: ['crystal.scale', 'crystal.spread', 'crystal.glow', 'crystal.opacity', 'crystal.wireframe'],
  },
  {
    id: 'voxel-grid',
    label: 'Voxel Grid',
    status: 'live',
    description: 'Bass, low-mid, centroid, and onset drive voxel scale, snap, jitter, opacity, and wireframe.',
    targets: ['voxel.scale', 'voxel.snap', 'voxel.jitter', 'voxel.opacity', 'voxel.wireframe'],
  },
  {
    id: 'reaction-pulse',
    label: 'Reaction Pulse',
    status: 'live',
    description: 'Pulse, onset, centroid, flux, and bass drive reaction warp, relief, feed, kill, and opacity.',
    targets: ['reaction.warp', 'reaction.relief', 'reaction.feed', 'reaction.kill', 'reaction.opacity'],
  },
  {
    id: 'deposition-etch',
    label: 'Deposition Etch',
    status: 'live',
    description: 'Bass, pulse, centroid, onset, and flux drive deposition relief, erosion, bands, scale, opacity, and wireframe.',
    targets: ['deposition.relief', 'deposition.erosion', 'deposition.bands', 'deposition.scale', 'deposition.opacity', 'deposition.wireframe'],
  },
  {
    id: 'gpgpu-surge',
    label: 'GPGPU Surge',
    status: 'live',
    description: 'Bass, pulse, centroid, and flux drive GPGPU blast, turbulence, particle size, opacity, and trail width.',
    targets: ['gpgpu.audioBlast', 'gpgpu.turbulence', 'gpgpu.size', 'gpgpu.opacity', 'gpgpu.ribbonWidth'],
  },
  {
    id: 'hybrid-loom',
    label: 'Hybrid Loom',
    status: 'live',
    description: 'Growth, crystal, and surface routes are aimed at hybrid membrane, fiber, and granular fields.',
    targets: ['membrane.displacement', 'membrane.opacity', 'fiber.length', 'fiber.density', 'granular.scale', 'granular.spread'],
  },
  {
    id: 'sequence-gates',
    label: 'Sequence Gates',
    status: 'live',
    description: 'Onset, beat, and pulse trigger sequence step advance, crossfade, and randomized variant injection.',
    targets: ['sequence.stepAdvance', 'sequence.crossfade', 'sequence.randomizeSeed'],
  },
];

function createRoute(id: string, source: AudioModulationRoute['source'], target: string, amount: number, notes: string, curve: AudioModulationRoute['curve'] = 'linear'): AudioModulationRoute {
  return {
    id,
    enabled: true,
    source,
    target,
    amount,
    bias: 0,
    curve,
    smoothing: 0.18,
    attack: 0.32,
    release: 0.12,
    clampMin: 0,
    clampMax: 2,
    mode: 'add',
    notes,
  };
}

function createAudioRoutePresetPack(presetId: AudioRoutePresetId): AudioModulationRoute[] {
  switch (presetId) {
    case 'particle-spectrum':
      return [
        createRoute('particle-spectrum-bass-motion', 'bass', 'particle.bassMotion', 1.2, 'Preset pack: Bass -> Bass Motion'),
        createRoute('particle-spectrum-bass-size', 'bass', 'particle.bassSize', 0.95, 'Preset pack: Bass -> Bass Size'),
        createRoute('particle-spectrum-treble-alpha', 'treble', 'particle.trebleAlpha', 0.75, 'Preset pack: Treble -> Treble Alpha', 'ease-out'),
        createRoute('particle-spectrum-pulse', 'pulse', 'particle.pulse', 0.9, 'Preset pack: Pulse -> Particle Pulse'),
        createRoute('particle-spectrum-flux-warp', 'flux', 'particle.warp', 0.55, 'Preset pack: Flux -> Warp', 'ease-in'),
        createRoute('particle-spectrum-centroid-hue', 'centroid', 'postfx.hueShift', 0.16, 'Preset pack: Centroid -> Hue Shift', 'ease-out'),
      ];
    case 'line-weave':
      return [
        createRoute('line-weave-opacity', 'treble', 'line.opacity', 0.35, 'Preset pack: Treble -> Line Opacity', 'ease-out'),
        createRoute('line-weave-width', 'centroid', 'line.width', 0.22, 'Preset pack: Centroid -> Line Width'),
        createRoute('line-weave-shimmer', 'flux', 'line.shimmer', 0.38, 'Preset pack: Flux -> Line Shimmer', 'ease-out'),
        createRoute('line-weave-flicker', 'bandB', 'line.flickerSpeed', 0.28, 'Preset pack: Band B -> Line Flicker'),
        createRoute('line-weave-distance', 'mid', 'line.connectDistance', 0.18, 'Preset pack: Mid -> Line Distance'),
        createRoute('line-weave-burst', 'pulse', 'line.burstPulse', 0.42, 'Preset pack: Pulse -> Line Burst'),
      ];
    case 'fog-breath':
      return [
        createRoute('fog-breath-density', 'rms', 'fog.density', 0.38, 'Preset pack: RMS -> Fog Density'),
        createRoute('fog-breath-glow', 'centroid', 'fog.glow', 0.26, 'Preset pack: Centroid -> Fog Glow', 'ease-out'),
        createRoute('fog-breath-drift', 'lowMid', 'fog.drift', 0.24, 'Preset pack: Low Mid -> Fog Drift'),
        createRoute('fog-breath-opacity', 'pulse', 'fog.opacity', 0.18, 'Preset pack: Pulse -> Fog Opacity'),
        createRoute('fog-breath-anisotropy', 'spread', 'fog.anisotropy', 0.16, 'Preset pack: Spread -> Fog Anisotropy'),
      ];
    case 'growth-pulse':
      return [
        createRoute('growth-pulse-branches', 'beat', 'growth.branches', 0.35, 'Preset pack: Beat -> Growth Branches'),
        createRoute('growth-pulse-length', 'bass', 'growth.length', 0.32, 'Preset pack: Bass -> Growth Length'),
        createRoute('growth-pulse-spread', 'pulse', 'growth.spread', 0.24, 'Preset pack: Pulse -> Growth Spread'),
        createRoute('growth-pulse-opacity', 'onset', 'growth.opacity', 0.18, 'Preset pack: Onset -> Growth Opacity', 'ease-out'),
      ];
    case 'camera-impulse':
      return [
        createRoute('camera-impulse-shake', 'beat', 'camera.shake', 0.3, 'Preset pack: Beat -> Camera Shake'),
        createRoute('camera-impulse-orbit', 'pulse', 'camera.orbitSpeed', 0.18, 'Preset pack: Pulse -> Camera Orbit'),
        createRoute('camera-impulse-fov', 'centroid', 'camera.fov', 0.12, 'Preset pack: Centroid -> Camera FOV'),
        createRoute('camera-impulse-dolly', 'bass', 'camera.dolly', 0.12, 'Preset pack: Bass -> Camera Dolly'),
      ];
    case 'screen-glitch':
      return [
        createRoute('screen-glitch-scan', 'centroid', 'screen.scanlineIntensity', 0.12, 'Preset pack: Centroid -> Scanline'),
        createRoute('screen-glitch-noise', 'treble', 'screen.noiseIntensity', 0.22, 'Preset pack: Treble -> Screen Noise', 'ease-out'),
        createRoute('screen-glitch-pulse', 'pulse', 'screen.pulseIntensity', 0.26, 'Preset pack: Pulse -> Screen Pulse'),
        createRoute('screen-glitch-split', 'flux', 'screen.splitIntensity', 0.18, 'Preset pack: Flux -> Screen Split'),
        createRoute('screen-glitch-sweep', 'onset', 'screen.sweepIntensity', 0.18, 'Preset pack: Onset -> Screen Sweep', 'ease-out'),
      ];
    case 'surface-relief':
      return [
        createRoute('surface-relief-displacement', 'bass', 'surface.displacement', 0.32, 'Preset pack: Bass -> Surface Displacement'),
        createRoute('surface-relief-relief', 'centroid', 'surface.relief', 0.28, 'Preset pack: Centroid -> Surface Relief', 'ease-out'),
        createRoute('surface-relief-opacity', 'pulse', 'surface.opacity', 0.18, 'Preset pack: Pulse -> Surface Opacity'),
        createRoute('surface-relief-wireframe', 'onset', 'surface.wireframe', 0.52, 'Preset pack: Onset -> Surface Wireframe', 'ease-out'),
        createRoute('surface-relief-slice-depth', 'lowMid', 'surface.sliceDepth', 0.22, 'Preset pack: Low Mid -> Surface Slice Depth'),
      ];
    case 'crystal-bloom':
      return [
        createRoute('crystal-bloom-scale', 'bass', 'crystal.scale', 0.32, 'Preset pack: Bass -> Crystal Scale'),
        createRoute('crystal-bloom-spread', 'centroid', 'crystal.spread', 0.24, 'Preset pack: Centroid -> Crystal Spread'),
        createRoute('crystal-bloom-glow', 'flux', 'crystal.glow', 0.36, 'Preset pack: Flux -> Crystal Glow', 'ease-out'),
        createRoute('crystal-bloom-opacity', 'pulse', 'crystal.opacity', 0.16, 'Preset pack: Pulse -> Crystal Opacity'),
        createRoute('crystal-bloom-wireframe', 'onset', 'crystal.wireframe', 0.52, 'Preset pack: Onset -> Crystal Wireframe', 'ease-out'),
      ];
    case 'voxel-grid':
      return [
        createRoute('voxel-grid-scale', 'bass', 'voxel.scale', 0.34, 'Preset pack: Bass -> Voxel Scale'),
        createRoute('voxel-grid-snap', 'lowMid', 'voxel.snap', 0.28, 'Preset pack: Low Mid -> Voxel Snap'),
        createRoute('voxel-grid-jitter', 'centroid', 'voxel.jitter', 0.26, 'Preset pack: Centroid -> Voxel Jitter'),
        createRoute('voxel-grid-opacity', 'pulse', 'voxel.opacity', 0.18, 'Preset pack: Pulse -> Voxel Opacity'),
        createRoute('voxel-grid-wireframe', 'onset', 'voxel.wireframe', 0.5, 'Preset pack: Onset -> Voxel Wireframe', 'ease-out'),
      ];
    case 'reaction-pulse':
      return [
        createRoute('reaction-pulse-warp', 'pulse', 'reaction.warp', 0.24, 'Preset pack: Pulse -> Reaction Warp'),
        createRoute('reaction-pulse-relief', 'centroid', 'reaction.relief', 0.28, 'Preset pack: Centroid -> Reaction Relief'),
        createRoute('reaction-pulse-feed', 'onset', 'reaction.feed', 0.6, 'Preset pack: Onset -> Reaction Feed', 'ease-out'),
        createRoute('reaction-pulse-kill', 'flux', 'reaction.kill', 0.6, 'Preset pack: Flux -> Reaction Kill', 'ease-out'),
        createRoute('reaction-pulse-opacity', 'bass', 'reaction.opacity', 0.16, 'Preset pack: Bass -> Reaction Opacity'),
      ];
    case 'deposition-etch':
      return [
        createRoute('deposition-etch-relief', 'bass', 'deposition.relief', 0.3, 'Preset pack: Bass -> Deposition Relief'),
        createRoute('deposition-etch-erosion', 'flux', 'deposition.erosion', 0.24, 'Preset pack: Flux -> Deposition Erosion'),
        createRoute('deposition-etch-bands', 'centroid', 'deposition.bands', 0.8, 'Preset pack: Centroid -> Deposition Bands'),
        createRoute('deposition-etch-scale', 'pulse', 'deposition.scale', 0.22, 'Preset pack: Pulse -> Deposition Scale'),
        createRoute('deposition-etch-opacity', 'lowMid', 'deposition.opacity', 0.18, 'Preset pack: Low Mid -> Deposition Opacity'),
        createRoute('deposition-etch-wireframe', 'onset', 'deposition.wireframe', 0.48, 'Preset pack: Onset -> Deposition Wireframe', 'ease-out'),
      ];
    case 'gpgpu-surge':
      return [
        createRoute('gpgpu-surge-blast', 'bass', 'gpgpu.audioBlast', 0.42, 'Preset pack: Bass -> GPGPU Audio Blast'),
        createRoute('gpgpu-surge-turbulence', 'flux', 'gpgpu.turbulence', 0.28, 'Preset pack: Flux -> GPGPU Turbulence', 'ease-out'),
        createRoute('gpgpu-surge-size', 'centroid', 'gpgpu.size', 0.18, 'Preset pack: Centroid -> GPGPU Size'),
        createRoute('gpgpu-surge-opacity', 'pulse', 'gpgpu.opacity', 0.16, 'Preset pack: Pulse -> GPGPU Opacity'),
        createRoute('gpgpu-surge-ribbon-width', 'lowMid', 'gpgpu.ribbonWidth', 0.24, 'Preset pack: Low Mid -> Ribbon Width'),
      ];
    case 'hybrid-loom':
      return [
        createRoute('hybrid-loom-membrane-displacement', 'bass', 'membrane.displacement', 0.28, 'Preset pack: Bass -> Membrane Displacement'),
        createRoute('hybrid-loom-membrane-opacity', 'pulse', 'membrane.opacity', 0.16, 'Preset pack: Pulse -> Membrane Opacity'),
        createRoute('hybrid-loom-fiber-length', 'centroid', 'fiber.length', 0.24, 'Preset pack: Centroid -> Fiber Length'),
        createRoute('hybrid-loom-fiber-density', 'beat', 'fiber.density', 0.22, 'Preset pack: Beat -> Fiber Density'),
        createRoute('hybrid-loom-granular-scale', 'bass', 'granular.scale', 0.28, 'Preset pack: Bass -> Granular Scale'),
        createRoute('hybrid-loom-granular-spread', 'flux', 'granular.spread', 0.22, 'Preset pack: Flux -> Granular Spread', 'ease-out'),
      ];
    case 'sequence-gates':
      return [
        { ...createRoute('sequence-gates-step', 'onset', 'sequence.stepAdvance', 1, 'Preset pack: Onset -> Sequence Step Advance', 'ease-out'), mode: 'trigger', smoothing: 0.1, attack: 0.8, release: 0.2, clampMax: 1.5 },
        { ...createRoute('sequence-gates-crossfade', 'beat', 'sequence.crossfade', 1, 'Preset pack: Beat -> Sequence Crossfade', 'ease-out'), mode: 'trigger', smoothing: 0.1, attack: 0.8, release: 0.2, clampMax: 1.5 },
        { ...createRoute('sequence-gates-randomize', 'pulse', 'sequence.randomizeSeed', 1, 'Preset pack: Pulse -> Sequence Randomize', 'ease-out'), mode: 'trigger', smoothing: 0.08, attack: 0.85, release: 0.15, clampMax: 1.5 },
      ];
    default:
      return [];
  }
}

export function appendAudioRoutePresetPack(existingRoutes: AudioModulationRoute[], presetId: AudioRoutePresetId): AudioModulationRoute[] {
  const existingIds = new Set(existingRoutes.map((route) => route.id));
  const nextRoutes = createAudioRoutePresetPack(presetId).map((route, index) => {
    if (!existingIds.has(route.id)) {
      existingIds.add(route.id);
      return route;
    }

    let suffix = 2;
    let nextId = `${route.id}-${suffix}`;
    while (existingIds.has(nextId)) {
      suffix += 1;
      nextId = `${route.id}-${suffix}`;
    }
    existingIds.add(nextId);
    return { ...route, id: nextId, notes: `${route.notes ?? route.id} (${suffix})` };
  });

  return [...existingRoutes, ...nextRoutes];
}
