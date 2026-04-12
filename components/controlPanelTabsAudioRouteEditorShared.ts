import type React from 'react';
import type { ParticleConfig } from '../types';
import type { ControlPanelContentProps } from './controlPanelTabsShared';
import type { validateAudioRouteBundleText } from '../lib/audioReactiveValidation';
import type { AudioModulationRoute } from '../types/audioReactive';

export type UpdateConfigFn = ControlPanelContentProps['updateConfig'];

export type TargetOption = {
  system: string;
  label: string;
  target: string;
};

export type RouteTransferValidation = ReturnType<typeof validateAudioRouteBundleText>;

export type BulkNumericOffsets = {
  amount: number;
  bias: number;
  clampMin: number;
  clampMax: number;
  smoothing: number;
  attack: number;
  release: number;
};

export type AudioRouteEditorPanelProps = {
  config: ParticleConfig;
  updateConfig: UpdateConfigFn;
  routeEditorOpen: boolean;
  setRouteEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  focusedConflictKey: string | null;
  clearFocusedConflictKey: () => void;
  addRoute: () => void;
  routeTransferFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleRouteTransferFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  routeTransferFileMode: 'box' | 'append' | 'replace';
  setRouteTransferFileMode: React.Dispatch<React.SetStateAction<'box' | 'append' | 'replace'>>;
  exportRouteBundle: (scope: 'all' | 'visible') => void;
  copyRouteBundle: (scope: 'all' | 'visible') => Promise<void>;
  importRouteBundle: (mode: 'replace' | 'append') => void;
  openRouteTransferFilePicker: (mode: 'box' | 'append' | 'replace') => void;
  setRouteTransferText: React.Dispatch<React.SetStateAction<string>>;
  setRouteTransferNotice: React.Dispatch<React.SetStateAction<string | null>>;
  handleRouteTransferDragOver: React.DragEventHandler<HTMLDivElement>;
  handleRouteTransferDragLeave: React.DragEventHandler<HTMLDivElement>;
  handleRouteTransferDrop: React.DragEventHandler<HTMLDivElement>;
  routeTransferDragActive: boolean;
  routeTransferText: string;
  routeTransferValidation: RouteTransferValidation;
  routeTransferNotice: string | null;
  filteredRoutes: AudioModulationRoute[];
  routeSystemFilter: string;
  setRouteSystemFilter: React.Dispatch<React.SetStateAction<string>>;
  routeSystemOptions: string[];
  routeSourceFilter: 'all' | AudioModulationRoute['source'];
  setRouteSourceFilter: React.Dispatch<React.SetStateAction<'all' | AudioModulationRoute['source']>>;
  routeStateFilter: 'all' | 'enabled' | 'disabled';
  setRouteStateFilter: React.Dispatch<React.SetStateAction<'all' | 'enabled' | 'disabled'>>;
  routeSearch: string;
  setRouteSearch: React.Dispatch<React.SetStateAction<string>>;
  applyBulkToVisible: (patch: Partial<AudioModulationRoute>) => void;
  filteredRouteIdSet: Set<string>;
  sortRoutes: (sortBy: 'source' | 'target' | 'system') => void;
  removeDisabledRoutes: () => void;
  bulkNumericOffsets: BulkNumericOffsets;
  updateBulkNumericOffset: (key: keyof BulkNumericOffsets, value: number) => void;
  applyVisibleNumericOffsets: () => void;
  resetBulkNumericOffsets: () => void;
  targetSystemMap: Map<string, string>;
  moveRoute: (routeId: string, direction: -1 | 1) => void;
  reorderRoute: (routeId: string, targetRouteId: string, placement?: 'before' | 'after') => void;
  updateRoute: (routeId: string, patch: Partial<AudioModulationRoute>) => void;
  duplicateRoute: (routeId: string) => void;
  removeRoute: (routeId: string) => void;
  targetOptions: TargetOption[];
};

export type AudioRouteTransferSectionProps = Pick<
  AudioRouteEditorPanelProps,
  | 'routeTransferFileInputRef'
  | 'handleRouteTransferFileChange'
  | 'routeTransferFileMode'
  | 'setRouteTransferFileMode'
  | 'exportRouteBundle'
  | 'copyRouteBundle'
  | 'importRouteBundle'
  | 'openRouteTransferFilePicker'
  | 'setRouteTransferText'
  | 'setRouteTransferNotice'
  | 'handleRouteTransferDragOver'
  | 'handleRouteTransferDragLeave'
  | 'handleRouteTransferDrop'
  | 'routeTransferDragActive'
  | 'routeTransferText'
  | 'routeTransferValidation'
  | 'routeTransferNotice'
>;

export type AudioRouteEditorWorkspaceProps = Pick<
  AudioRouteEditorPanelProps,
  | 'config'
  | 'updateConfig'
  | 'routeEditorOpen'
  | 'filteredRoutes'
  | 'routeSystemFilter'
  | 'setRouteSystemFilter'
  | 'routeSystemOptions'
  | 'routeSourceFilter'
  | 'setRouteSourceFilter'
  | 'routeStateFilter'
  | 'setRouteStateFilter'
  | 'routeSearch'
  | 'setRouteSearch'
  | 'applyBulkToVisible'
  | 'filteredRouteIdSet'
  | 'sortRoutes'
  | 'removeDisabledRoutes'
  | 'bulkNumericOffsets'
  | 'updateBulkNumericOffset'
  | 'applyVisibleNumericOffsets'
  | 'resetBulkNumericOffsets'
  | 'targetSystemMap'
  | 'moveRoute'
  | 'reorderRoute'
  | 'updateRoute'
  | 'duplicateRoute'
  | 'removeRoute'
  | 'targetOptions'
>;

export type AudioRouteCardProps = {
  route: AudioModulationRoute;
  config: ParticleConfig;
  index: number;
  routeSystem: string;
  isFirst: boolean;
  isLast: boolean;
  draggingRouteId: string | null;
  dragOverRouteId: string | null;
  setDraggingRouteId: React.Dispatch<React.SetStateAction<string | null>>;
  setDragOverRouteId: React.Dispatch<React.SetStateAction<string | null>>;
  reorderRoute: (routeId: string, targetRouteId: string, placement?: 'before' | 'after') => void;
  moveRoute: (routeId: string, direction: -1 | 1) => void;
  updateRoute: (routeId: string, patch: Partial<AudioModulationRoute>) => void;
  duplicateRoute: (routeId: string) => void;
  removeRoute: (routeId: string) => void;
  targetOptions: TargetOption[];
};
