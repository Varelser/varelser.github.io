# AUDIO_TAB_SPLIT_2026-04-01

最終更新: 2026-04-01  
対象: `components/controlPanelTabsAudio.tsx`

## 実施内容

`components/controlPanelTabsAudio.tsx` のうち、比較的独立していて外部依存を増やしにくい帯域を先に分割しました。

### 新規追加

- `components/controlPanelTabsAmbient.tsx`
  - Ambient タブの UI を独立
- `components/controlPanelTabsAudioLegacy.ts`
  - legacy audio slider 定義
  - batch summary 型
  - legacy slider 配列

### 互換維持

- `components/controlPanelTabsAudio.tsx` から `AmbientTabContent` を再 export
- 既存 import 側のパス変更なし

## 行数変化

- `components/controlPanelTabsAudio.tsx`
  - 変更前: **5297行 / 209KB**
  - 変更後: **4956行 / 200KB**
- `components/controlPanelTabsAudioLegacy.ts`
  - **274行 / 8KB**
- `components/controlPanelTabsAmbient.tsx`
  - **81行 / 4KB**

## 再検証

- `npm run typecheck` → pass
- `npm run build` → pass
- `node scripts/verify-project-state.mjs` → pass
- `node scripts/verify-phase5.mjs` → pass

## 判断

今回の分割は、大規模な hook 分離や route editor 分離より安全側です。
まずは

1. Ambient UI の独立
2. legacy 定義帯の独立
3. 既存 export 互換維持

までを固定し、次段で route editor / curation / retirement cleanup 帯の分割に進むのが適切です。

## 次の候補

1. `AudioTabContent` 内の route transfer / validation UI
2. retirement impact / hotspot / manual conflict queue の導出群
3. sequence trigger debug / tuning preset UI

