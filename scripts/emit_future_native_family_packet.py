from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / 'lib/future-native-families/futureNativeFamiliesRegistry.ts'
OUTDIR = ROOT / 'tmp/future-native-family-packets'

GROUP_SHOULD = {
    'mpm': ['source injection remains bounded', 'frame-to-frame settling is visually continuous'],
    'pbd': ['constraint stretch stays bounded', 'collision fallback degrades gracefully'],
    'fracture': ['break trigger is deterministic for fixed seed', 'debris count stays within budget'],
    'volumetric': ['density transport remains bounded', 'renderer fallback still displays field state'],
    'specialist-native': ['graph stage can serialize independently', 'native graph does not depend on reference pack runtime'],
}

GROUP_FIXTURE = {
    'mpm': 'Single source emitter above a receiving plane with medium particle budget.',
    'pbd': 'Minimal topology fixture with one collision object and deterministic seed.',
    'fracture': 'Single breakable substrate with one trigger impulse and fixed seed.',
    'volumetric': 'Low-resolution scalar field with one injector and one renderer bridge.',
    'specialist-native': 'One minimal graph/operator stage with one output bridge.',
}

GROUP_CHECKS = {
    'mpm': ['config serializes', 'native path toggles on', 'bounded particle or surface output'],
    'pbd': ['config serializes', 'constraint iterations apply', 'topology remains connected'],
    'fracture': ['config serializes', 'break trigger applies', 'debris or shard output remains bounded'],
    'volumetric': ['config serializes', 'field state steps', 'renderer bridge receives density'],
    'specialist-native': ['config serializes', 'native graph stage instantiates', 'output bridge executes'],
}

GROUP_STARTERS = {
    'mpm': ['schema', 'adapter', 'solver', 'renderer', 'ui', 'verification'],
    'pbd': ['schema', 'adapter', 'solver', 'renderer', 'ui', 'verification'],
    'fracture': ['schema', 'adapter', 'solver', 'renderer', 'ui', 'verification'],
    'volumetric': ['schema', 'adapter', 'solver', 'renderer', 'ui', 'verification'],
    'specialist-native': ['schema', 'adapter', 'solver', 'renderer', 'ui', 'verification'],
}

MILESTONES = {
    'lite': [
        'normalized schema exists',
        'cpu prototype step is deterministic',
        'debug render path shows state',
    ],
    'mid': [
        'normalized schema exists',
        'cpu prototype step is deterministic',
        'debug render path shows state',
        'serialization round-trip preserves family block',
    ],
    'deep': [
        'normalized schema exists',
        'cpu prototype step is deterministic',
        'debug render path shows state',
        'serialization round-trip preserves family block',
        'native path declares upgrade boundary to gpu solver',
    ],
}

ENTRY_RE = re.compile(
    r"\{\s*id: '([^']+)',\s*group: '([^']+)',\s*title: '([^']+)',\s*summary: '([^']+)',.*?recommendedDepth: '([^']+)',\s*stage: '([^']+)',.*?serializerBlockKey: '([^']+)',\s*verificationScenarioId: '([^']+)'",
    re.S,
)


def load_entries():
    text = REGISTRY.read_text(encoding='utf-8')
    out = {}
    for match in ENTRY_RE.finditer(text):
        id_, group, title, summary, depth, stage, block, verification = match.groups()
        out[id_] = {
            'id': id_, 'group': group, 'title': title, 'summary': summary,
            'depth': depth, 'stage': stage, 'block': block, 'verification': verification,
        }
    return out


def starter_files(id_: str):
    base = id_.replace('-', '_')
    return [
        f'lib/future-native-families/starter-runtime/{base}Schema.ts — schema defaults and normalized runtime state',
        f'lib/future-native-families/starter-runtime/{base}Adapter.ts — bridge from app config to solver state',
        f'lib/future-native-families/starter-runtime/{base}Solver.ts — cpu prototype solver with deterministic stepping',
        f'lib/future-native-families/starter-runtime/{base}Renderer.ts — render payload generation and debug overlays',
        f'lib/future-native-families/starter-runtime/{base}Ui.ts — parameter group layout and control mapping',
        f'scripts/verify-{base}.mjs — verification harness entry point',
    ]


def emit_packet(id_: str) -> str:
    entries = load_entries()
    if id_ not in entries:
      raise SystemExit(f'Unknown family id: {id_}')
    e = entries[id_]
    lines = [
        f"# {e['id']}",
        '',
        f"Title: {e['title']}",
        f"Group: {e['group']}",
        f"Stage: {e['stage']}",
        f"Depth: {e['depth']}",
        f"Serializer block: {e['block']}",
        f"Verification: {e['verification']}",
        '',
        '## Summary',
        e['summary'],
        '',
        '## Must pass',
    ]
    lines += [f"- {item}" for item in MILESTONES[e['depth']]]
    lines += ['', '## Should pass']
    lines += [f"- {item}" for item in GROUP_SHOULD[e['group']]]
    lines += ['', '## Verification checks']
    lines += [f"- {item}" for item in GROUP_CHECKS[e['group']]]
    lines += ['', '## Fixture hint', GROUP_FIXTURE[e['group']], '', '## Starter files']
    lines += [f'- {item}' for item in starter_files(id_)]
    lines += ['', '## Implementation order',
              f"- Add {e['block']} schema/default block.",
              '- Add serialization + migration hook.',
              '- Add runtime adapter stub.',
              '- Expose manifest / diagnostics route.',
              f"- Add verifier scenario: {e['verification']}.",
              '- Document control-panel / renderer bridge assumptions.']
    return '\n'.join(lines) + '\n'


def main():
    if len(sys.argv) < 2:
        raise SystemExit('Usage: python3 scripts/emit_future_native_family_packet.py <family-id>')
    OUTDIR.mkdir(parents=True, exist_ok=True)
    packet = emit_packet(sys.argv[1])
    out = OUTDIR / f'{sys.argv[1]}.md'
    out.write_text(packet, encoding='utf-8')
    print(f'Wrote {out}')


if __name__ == '__main__':
    main()
