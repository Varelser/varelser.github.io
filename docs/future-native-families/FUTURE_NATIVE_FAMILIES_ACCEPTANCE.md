# Future Native Families Acceptance

各 family は最低でも次を満たしたときに「scaffold を越えて runtime-stub 段階へ進んだ」と見なします。

- schema/default block がある
- migration hook がある
- runtime adapter stub が起動できる
- diagnostics / manifest に family id と route が出る
- verification fixture が1本ある
- export/import round-trip で family block が保持される

group ごとの追加条件:

- MPM: transfer step と output bridge が分かれている
- PBD: constraint set と collision fallback が分かれている
- fracture: break trigger と debris/shard output が分かれている
- volumetric: field stepping と renderer bridge が分かれている
- specialist-native: graph stage schema と output bridge が分かれている
