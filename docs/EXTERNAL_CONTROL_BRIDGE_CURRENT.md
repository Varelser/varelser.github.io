# External Control Bridge Current

## Transport
- mode: `ws-json`
- query param: `controlBridgeUrl=ws://host:port`
- optional query param: `controlBridgeSession=<session-id>`
- status payloads are emitted from the browser to the bridge on connect and on state changes

## Inbound JSON messages
- handshake
```json
{ "type": "external-control-handshake", "sessionId": "bridge-a" }
```
- config patch
```json
{ "type": "external-control-patch-config", "sessionId": "bridge-a", "patch": { "projectSeedValue": 4201 } }
```
- config replace
```json
{ "type": "external-control-replace-config", "sessionId": "bridge-a", "config": { "layer2Count": 3200 } }
```
- preset load
```json
{ "type": "external-control-load-preset", "sessionId": "bridge-a", "presetId": "future-native-mpm-granular-sand-fall", "transitionMode": "morph" }
```
- sequence item select
```json
{ "type": "external-control-select-sequence-item", "sessionId": "bridge-a", "itemId": "seq-a" }
```
- action
```json
{ "type": "external-control-action", "sessionId": "bridge-a", "action": "sequence-start" }
```
- export queue
```json
{ "type": "external-control-export-queue", "sessionId": "bridge-a", "action": "enqueue-video-webm" }
```

## Supported action values
- `randomize`
- `replay-seed`
- `sequence-start`
- `sequence-stop`
- `audio-start`
- `audio-stop`

## Supported export queue actions
- `enqueue-video-webm`
- `enqueue-png-sequence`
- `start`
- `cancel`
- `clear`

## Outbound status shape
- `type`: `external-control-status`
- `mode`: `ws-json`
- `sessionId`
- `connected`
- `isSequencePlaying`
- `isAudioActive`
- `activePresetId`
- `activeSequenceItemId`
- `presetCount`
- `sequenceLength`
- `exportQueueLength`
- `isExportQueueRunning`
- `config`

## OSC Proxy Mapping
- prefix: `/kalokagathia`
- `/kalokagathia/handshake`
- `/kalokagathia/randomize`
- `/kalokagathia/seed/replay`
- `/kalokagathia/audio/start`
- `/kalokagathia/audio/stop`
- `/kalokagathia/sequence/start`
- `/kalokagathia/sequence/stop`
- `/kalokagathia/config/patch`
  first arg must be an object or JSON string object
- `/kalokagathia/config/replace`
  first arg must be an object or JSON string object
- `/kalokagathia/preset/load`
  args: `<presetId> [instant|morph]`
- `/kalokagathia/sequence/select`
  args: `<itemId>` or `null`
- `/kalokagathia/export/queue/enqueue-video-webm`
- `/kalokagathia/export/queue/enqueue-png-sequence`
- `/kalokagathia/export/queue/start`
- `/kalokagathia/export/queue/cancel`
- `/kalokagathia/export/queue/clear`

## Notes
- OSC is not spoken directly by the browser. The intended shape is `OSC -> proxy -> ws-json bridge`.
- `sessionId` filtering is optional. If present, mismatched inbound messages are ignored.

## Local Proxy
- command: `npm run run:external-control-osc-proxy`
- defaults:
  `ws://127.0.0.1:18181`
  `udp://127.0.0.1:9124`
- optional flags:
  `--host 0.0.0.0`
  `--ws-port 18181`
  `--osc-port 9124`
  `--session-id bridge-a`
  `--write-status-json docs/archive/external-control-osc-proxy-status.json`
- browser example:
  `?controlBridgeUrl=ws://127.0.0.1:18181`
- pinned session example:
  `?controlBridgeUrl=ws://127.0.0.1:18181&controlBridgeSession=bridge-a`
- status sink:
  `docs/archive/external-control-osc-proxy-status.json`
  latest browser `external-control-status` / `external-control-error` and message counters are written here

## Fixture Sender
- command: `npm run send:external-control-osc-fixture -- --fixture handshake`
- optional flags:
  `--host 127.0.0.1`
  `--port 9124`
- available fixtures:
  `handshake`
  `randomize`
  `replaySeed`
  `audioStart`
  `audioStop`
  `sequenceStart`
  `sequenceStop`
  `queueVideo`
  `queuePng`
  `queueStart`
  `queueCancel`
  `queueClear`
  `presetMorph`
  `presetInstant`
  `sequenceSelect`
  `sequenceClear`
  `patchSeed4201`
