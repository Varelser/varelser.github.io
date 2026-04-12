# PBD Rope Native Starter

`pbd-rope` は first-wave の中で最初に native 実装へ上げる対象です。

## 今回入ったもの

- normalized config adapter
- deterministic CPU PBD-lite stepper
- 1本鎖の distance constraint solver
- bend constraint
- floor / circle collider primitive
- debug render payload
- dedicated verifier

## 通過条件

```bash
npm run verify:pbd-rope
```

この verifier は次を確認します。

- 64 frame stepping 後も anchor が drift しない
- segment count が保たれる
- stretch ratio が 1.10 未満
- floor contact が発生する
- circle collider contact が発生する
- bend deviation が小さい
- render payload が runtime frame と scalar samples を反映する

## 今の制限

- self collision は未実装
- bend は簡易 chord 制約で、角度制約ではない
- collider は floor + single circle primitive のみ

## 次の実装候補

1. bend を角度制約へ置換
2. capsule / segment collider 追加
3. self collision 追加
4. membrane / cloth への共有 constraint layer 抽出

See also `mpm-granular` native starter for particle pile settling and bounded material tests.


Update 2026-03-31: added capsule collider and self-collision spacing guard to the native starter. Dedicated verifier now checks floor, circle, capsule, and spacing guard together.
