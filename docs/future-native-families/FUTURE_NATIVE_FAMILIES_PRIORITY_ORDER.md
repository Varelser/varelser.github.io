# Future Native Families Priority Order

## First-wave candidates

1. `pbd-rope`
   - 最小トポロジで native solver の足場を作りやすい
   - collision / constraint / export の検証を先に育てやすい
2. `mpm-granular`
   - 既存 particle source と接続しやすい
   - 見た目の差が分かりやすく、native 化の価値が高い
3. `fracture-lattice`
   - 既存 mesh / shard / particle bridge を使い回しやすい
4. `volumetric-density-transport`
   - fog renderer へ橋渡ししやすい下位 substrate

## Second-wave candidates

- `pbd-cloth`
- `mpm-viscoplastic`
- `fracture-voxel`
- `volumetric-smoke`

## Later / heavy

- `pbd-softbody`
- `fracture-crack-propagation`
- `volumetric-pressure-coupling`
- `volumetric-light-shadow-coupling`
- `specialist-*` native graph families
