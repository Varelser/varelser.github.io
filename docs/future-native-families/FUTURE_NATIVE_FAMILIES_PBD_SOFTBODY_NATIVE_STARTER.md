# PBD Softbody Native Starter

`pbd-softbody` の starter-runtime を追加しました。

## 追加したもの

- `lib/future-native-families/starter-runtime/pbd_softbodySchema.ts`
- `lib/future-native-families/starter-runtime/pbd_softbodyAdapter.ts`
- `lib/future-native-families/starter-runtime/pbd_softbodySolver.ts`
- `lib/future-native-families/starter-runtime/pbd_softbodyRenderer.ts`
- `lib/future-native-families/starter-runtime/pbd_softbodyUi.ts`
- `scripts/verify-pbd-softbody-entry.ts`
- `scripts/verify-pbd-softbody.mjs`

## starter の性質

これは production-grade の 3D softbody solver ではなく、将来 native family を伸ばすための **deterministic CPU prototype** です。

現段階で入っているもの:

- lattice / shear / bend link
- per-cell area based volume preservation
- cluster shape matching
- shared wind / pressure surface forces
- multi-pin choreography
- obstacle field / circle / capsule / floor collider
- debug render payload
- UI parameter sections
- dedicated verifier

## verify

```bash
npm run verify:pbd-softbody
```

確認内容:

- point / link 数の安定
- floor / collider 接触
- volume ratio の帯域維持
- cell area error の上限
- wind / pressure / obstacle impulse の記録
- choreography / layered obstacle の有効化

## 次の拡張候補

1. 3D voxel / cluster topology への昇格
2. shape-matching rotation 対応
3. impact impulse を fragment / debris 系へ橋渡し
4. export/import の runtime state snapshot 追加
5. cloth / membrane と softbody の preset 共通化
