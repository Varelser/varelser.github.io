import type { FutureNativeSpecialistPacketFamilyId } from './futureNativeFamiliesSpecialistPacketTypes';

export interface FutureNativeSpecialistRouteOption {
  id: string;
  label: string;
  executionTarget: string;
  overrideCandidate: string;
  capabilityTags: string[];
  fallbackReason: string;
}

export interface FutureNativeSpecialistRouteMetadata {
  routeId: string;
  routeLabel: string;
  handshakeValues: string[];
  adapterOptions: FutureNativeSpecialistRouteOption[];
}

export function buildRouteMetadata(familyId: FutureNativeSpecialistPacketFamilyId): FutureNativeSpecialistRouteMetadata {
  switch (familyId) {
    case 'specialist-houdini-native':
      return {
        routeId: 'native-node-chain-route',
        routeLabel: 'Node-chain bridge route',
        handshakeValues: ['provider:houdini-native', 'packet:native-node-chain', 'schema:graph-stage-v1', 'transport:surface-volume-bridge'],
        adapterOptions: [
          { id: 'surface-volume-primary', label: 'Surface-volume primary adapter', executionTarget: 'hybrid:surface-volume-stack', overrideCandidate: 'override:surface-volume-primary', capabilityTags: ['surface-volume', 'high-fidelity', 'default-route'], fallbackReason: 'primary surface-volume bridge keeps native node-chain fidelity' },
          { id: 'particles-fallback', label: 'Particles fallback adapter', executionTarget: 'hybrid:particle-fallback-stack', overrideCandidate: 'override:particles-fallback', capabilityTags: ['particle-fallback', 'reduced-fidelity', 'resilient'], fallbackReason: 'fallback particle stack reduces bridge complexity for degraded runtimes' },
          { id: 'hybrid-stack-preview', label: 'Hybrid stack preview adapter', executionTarget: 'hybrid:preview-stack', overrideCandidate: 'override:hybrid-stack-preview', capabilityTags: ['preview', 'inspection', 'reduced-fidelity'], fallbackReason: 'preview stack prioritizes inspection speed over native bridge fidelity' },
        ],
      };
    case 'specialist-niagara-native':
      return {
        routeId: 'native-emitter-stack-route',
        routeLabel: 'Emitter stack bridge route',
        handshakeValues: ['provider:niagara-native', 'packet:native-emitter-stack', 'schema:graph-stage-v1', 'transport:event-emitter-bridge'],
        adapterOptions: [
          { id: 'emitter-primary', label: 'Emitter primary adapter', executionTarget: 'hybrid:emitter-event-stack', overrideCandidate: 'override:emitter-primary', capabilityTags: ['event-emitter', 'high-throughput', 'default-route'], fallbackReason: 'primary emitter stack preserves native event throughput' },
          { id: 'structure-pass', label: 'Structure pass adapter', executionTarget: 'hybrid:structure-event-stack', overrideCandidate: 'override:structure-pass', capabilityTags: ['structure-pass', 'stable-layout', 'reduced-motion'], fallbackReason: 'structure pass trades motion richness for deterministic event layout' },
          { id: 'hybrid-stack-preview', label: 'Hybrid stack preview adapter', executionTarget: 'hybrid:preview-event-stack', overrideCandidate: 'override:hybrid-stack-preview', capabilityTags: ['preview', 'inspection', 'reduced-fidelity'], fallbackReason: 'preview event stack favors inspection and capture speed' },
        ],
      };
    case 'specialist-touchdesigner-native':
      return {
        routeId: 'native-operator-pipe-route',
        routeLabel: 'Operator-pipe bridge route',
        handshakeValues: ['provider:touchdesigner-native', 'packet:native-operator-pipe', 'schema:operator-pipe-v1', 'transport:image-field-bridge'],
        adapterOptions: [
          { id: 'image-field-primary', label: 'Image-field primary adapter', executionTarget: 'hybrid:image-field-pipe', overrideCandidate: 'override:image-field-primary', capabilityTags: ['image-field', 'high-bandwidth', 'default-route'], fallbackReason: 'primary image-field pipe keeps operator texture fidelity' },
          { id: 'surface-pass', label: 'Surface pass adapter', executionTarget: 'hybrid:surface-field-pipe', overrideCandidate: 'override:surface-pass', capabilityTags: ['surface-pass', 'field-stable', 'reduced-bandwidth'], fallbackReason: 'surface pass reduces bandwidth by collapsing image operators into surface fields' },
          { id: 'hybrid-stack-preview', label: 'Hybrid stack preview adapter', executionTarget: 'hybrid:preview-field-pipe', overrideCandidate: 'override:hybrid-stack-preview', capabilityTags: ['preview', 'inspection', 'reduced-fidelity'], fallbackReason: 'preview field pipe prioritizes lightweight inspection and roundtrip speed' },
        ],
      };
    case 'specialist-unity-vfx-native':
      return {
        routeId: 'native-gpu-event-route',
        routeLabel: 'GPU event bridge route',
        handshakeValues: ['provider:unity-vfx-native', 'packet:native-gpu-event-graph', 'schema:graph-stage-v1', 'transport:gpu-event-bridge'],
        adapterOptions: [
          { id: 'gpu-event-primary', label: 'GPU event primary adapter', executionTarget: 'hybrid:gpu-event-graph', overrideCandidate: 'override:gpu-event-primary', capabilityTags: ['gpu-event', 'high-throughput', 'default-route'], fallbackReason: 'primary GPU event graph keeps native event scheduling intact' },
          { id: 'surface-pass', label: 'Surface pass adapter', executionTarget: 'hybrid:surface-event-graph', overrideCandidate: 'override:surface-pass', capabilityTags: ['surface-pass', 'stable-layout', 'reduced-bandwidth'], fallbackReason: 'surface pass reduces GPU event bandwidth for safer fallback execution' },
          { id: 'hybrid-stack-preview', label: 'Hybrid stack preview adapter', executionTarget: 'hybrid:preview-event-graph', overrideCandidate: 'override:hybrid-stack-preview', capabilityTags: ['preview', 'inspection', 'reduced-fidelity'], fallbackReason: 'preview event graph favors lightweight inspection over full GPU throughput' },
        ],
      };
  }
}
