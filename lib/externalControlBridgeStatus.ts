import {
  EXTERNAL_CONTROL_BRIDGE_MODE,
  type ExternalControlOutboundMessage,
} from './externalControlBridge';

type ExternalControlStatusMessage = Extract<ExternalControlOutboundMessage, { type: 'external-control-status' }>;
type ExternalControlErrorMessage = Extract<ExternalControlOutboundMessage, { type: 'external-control-error' }>;

export interface ExternalControlBridgeProxyStatusSnapshot {
  generatedAt: string;
  mode: typeof EXTERNAL_CONTROL_BRIDGE_MODE;
  connectedClientCount: number;
  messageCount: number;
  statusCount: number;
  errorCount: number;
  latestStatus: ExternalControlStatusMessage | null;
  latestError: ExternalControlErrorMessage | null;
}

export function createExternalControlBridgeProxyStatusSnapshot(connectedClientCount = 0): ExternalControlBridgeProxyStatusSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    mode: EXTERNAL_CONTROL_BRIDGE_MODE,
    connectedClientCount,
    messageCount: 0,
    statusCount: 0,
    errorCount: 0,
    latestStatus: null,
    latestError: null,
  };
}

export function updateExternalControlBridgeProxyStatusSnapshot(
  snapshot: ExternalControlBridgeProxyStatusSnapshot,
  message: ExternalControlOutboundMessage,
  connectedClientCount: number,
): ExternalControlBridgeProxyStatusSnapshot {
  return {
    ...snapshot,
    generatedAt: new Date().toISOString(),
    connectedClientCount,
    messageCount: snapshot.messageCount + 1,
    statusCount: snapshot.statusCount + (message.type === 'external-control-status' ? 1 : 0),
    errorCount: snapshot.errorCount + (message.type === 'external-control-error' ? 1 : 0),
    latestStatus: message.type === 'external-control-status' ? message : snapshot.latestStatus,
    latestError: message.type === 'external-control-error' ? message : snapshot.latestError,
  };
}
