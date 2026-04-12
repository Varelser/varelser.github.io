# KALOKAGATHIA worker return bundle contract

- 作成日: 2026-04-06
- 目的: worker AI が返す bundle の最低要件を固定する

---

## 1. bundle 最低要件

worker AI は、少なくとも次を返す。

1. 対象 packetId
2. 種別: patch / branch
3. 触った file
4. 触っていない幹線
5. 実行 verify
6. 失敗した verify と原因
7. 未解決点
8. mainline 判断が必要な点

---

## 2. 禁止

以下を含む返却は、mainline 判断なしでは受理しない。

- manifest 正本の意味変更
- registry 正本の意味変更
- routing 正本の意味変更
- package class の最終変更
- `CURRENT_STATUS.md` の先行更新
- docs truth の最終確定を装った修正

---

## 3. 推奨返却テンプレート

```md
- 対象:
- packetId:
- 種別: patch / branch
- 触った file:
- 触っていない幹線:
- 実行 verify:
- verify 結果:
- 残件:
- mainline 判断が必要な点:
```

---

## 4. mainline 側の受理条件

mainline owner AI は、次が揃っている bundle だけを統合候補にする。

- packet の verify 条件を満たす
- 触っていない幹線が明記されている
- official truth を勝手に確定していない
- patch / branch の粒度が妥当

---

## 5. この contract の意味

これを固定しておくと、複数 AI を同時に使っても、後から本体へ戻すときに破綻しにくい。
