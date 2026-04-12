# AUDIO_SEQUENCE_TRIGGER_HISTORY_2026-04-05

## 概要
- sequence trigger debug を snapshot 表示だけで終わらせず、recent history を Audio タブ上で確認できるようにした。
- runtime は `trigger` / `blocked` / `exit` を ring buffer へ積み、UI 側は state と並べて履歴を読む。

## 変更点
- `lib/audioReactiveDebug.ts`
  - `SequenceAudioTriggerDebugHistoryEntry` を追加。
  - window debug store に history buffer を追加。
  - `appendSequenceAudioTriggerDebugHistory()` / `readSequenceAudioTriggerDebugHistory()` を追加。
  - history は recent 18 件で保持する。
- `lib/useSequenceAudioTriggers.ts`
  - target ごとの state transition を見て `trigger` / `blocked` / `exit` を記録するようにした。
  - blocked 時は残 cooldown を detail に含める。
- `components/useAudioSequenceTriggerDebug.ts`
  - snapshot だけでなく history も返す hook に拡張。
- `components/controlPanelTabsAudioSequenceTrigger.tsx`
  - Sequence Trigger History panel を追加。
  - recent 件数、経過 ms、value、cooldown、detail をその場で確認できるようにした。

## 検証
- `npm run typecheck`
- `node scripts/run-vite.mjs build`
- `node scripts/verify-phase5.mjs`

## 意図
- threshold/cooldown 実測時に「発火したのか」「cooldown で弾かれたのか」「しきい値を割って解除されたのか」を UI 上で直接見えるようにする。
- 今後の preset 微調整と live browser 実測の前提ログとして使う。
