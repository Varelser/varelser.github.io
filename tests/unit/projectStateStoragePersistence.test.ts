import assert from 'node:assert/strict';
import { buildProjectData } from '../../lib/projectStateData';
import { loadProjectData, saveProjectData } from '../../lib/projectStateStorage';

const PROJECT_STORAGE_KEY = 'kalokagathia-project-v4';
const PRESET_STORAGE_KEY = 'kalokagathia-presets-v2';
const PRESET_SEQUENCE_STORAGE_KEY = 'kalokagathia-preset-sequence-v2';

class MockLocalStorage {
  private store = new Map<string, string>();

  constructor(
    private readonly projectQuotaLimit: number | null = null,
    private readonly forceRecoveryMode = false,
  ) {}

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string) {
    if (key === PROJECT_STORAGE_KEY) {
      if (this.forceRecoveryMode && !value.includes('\"storageMode\":\"recovery-core\"')) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
      if (this.projectQuotaLimit !== null && value.length > this.projectQuotaLimit) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
    }
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

function buildFixtureProject() {
  return buildProjectData({
    name: 'Autosave Stress Fixture',
    config: {
      backgroundColor: 'black',
      particleColor: '#123456',
      synthPattern: [0, 12, 7, 5, 3, 10, 8, 1],
      audioRoutes: Array.from({ length: 12 }, (_, index) => ({
        source: 'pulse',
        target: 'particle.pulse',
        amount: 4 + (index % 5),
      })),
    } as any,
    activePresetId: 'preset-a',
    presetBlendDuration: 2.25,
    sequenceLoopEnabled: false,
    presets: [
      {
        id: 'preset-a',
        name: 'Preset A',
        config: {
          backgroundColor: 'black',
          particleColor: '#123456',
        } as any,
        createdAt: '2026-04-10T00:00:00.000Z',
        updatedAt: '2026-04-10T00:00:00.000Z',
      },
    ],
    presetSequence: [
      {
        id: 'seq-a',
        presetId: 'preset-a',
        label: 'Keyframe A',
        holdSeconds: 3,
        transitionSeconds: 1.2,
        transitionEasing: 'ease-in-out',
        screenSequenceDriveMode: 'off',
        screenSequenceDriveStrengthMode: 'inherit',
        screenSequenceDriveStrengthOverride: null,
        screenSequenceDriveMultiplier: 1,
        keyframeConfig: null,
      },
    ],
    ui: {
      isPlaying: true,
      isPanelOpen: false,
      videoDurationSeconds: 14,
      videoFps: 48,
    },
  });
}

export async function main() {
  const originalWindow = (globalThis as any).window;

  try {
    {
      const localStorage = new MockLocalStorage(null);
      (globalThis as any).window = { localStorage };
      const project = buildFixtureProject();
      saveProjectData(project);
      const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
      assert.ok(raw);
      assert.ok(!raw.includes('"storageMode":"recovery-core"'));
      const loaded = loadProjectData();
      assert.ok(loaded);
      assert.equal(loaded?.name, project.name);
      assert.equal(loaded?.currentConfig.backgroundColor, 'black');
      assert.equal(loaded?.presets.length, 1);
      assert.equal(loaded?.presetSequence.length, 1);
    }

    {
      const project = buildFixtureProject();
      const localStorage = new MockLocalStorage(null, true);
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(project.presets));
      localStorage.setItem(PRESET_SEQUENCE_STORAGE_KEY, JSON.stringify(project.presetSequence));
      (globalThis as any).window = { localStorage };

      const originalWarn = console.warn;
      const warnings: unknown[][] = [];
      console.warn = (...args: unknown[]) => {
        warnings.push(args);
      };
      try {
        saveProjectData(project);
      } finally {
        console.warn = originalWarn;
      }
      assert.equal(warnings.length, 1);
      assert.match(String(warnings[0]?.[0] ?? ''), /recovery-core snapshot/);

      const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
      assert.ok(raw);
      assert.ok(raw.includes('"storageMode":"recovery-core"'));

      const loaded = loadProjectData();
      assert.ok(loaded);
      assert.equal(loaded?.name, project.name);
      assert.equal(loaded?.activePresetId, 'preset-a');
      assert.equal(loaded?.sequenceLoopEnabled, false);
      assert.equal(loaded?.currentConfig.particleColor, '#123456');
      assert.equal(loaded?.presets.length, 1);
      assert.equal(loaded?.presetSequence.length, 1);
      assert.equal(loaded?.ui.videoDurationSeconds, 14);
      assert.equal(loaded?.ui.videoFps, 48);
    }
  } finally {
    (globalThis as any).window = originalWindow;
  }
}
