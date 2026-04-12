export type ProjectWebgpuCapabilityMode = 'all' | 'direct' | 'limited' | 'fallback-only';

export interface ProjectWebgpuCapabilitySummary {
  direct: number;
  limited: number;
  fallbackOnly: number;
  remainingWarnings: number;
}

export interface ProjectWebgpuCapabilityReport {
  generatedAt: string;
  summary: ProjectWebgpuCapabilitySummary;
  directFeatures: string[];
  limitedFeatures: string[];
  fallbackOnlyFeatures: string[];
}

export interface ProjectWebgpuCapabilityBucket {
  mode: Exclude<ProjectWebgpuCapabilityMode, 'all'>;
  label: string;
  count: number;
  items: string[];
  nextAction: string;
}

export const CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT: ProjectWebgpuCapabilityReport = {
  generatedAt: '2026-04-09T19:26:49.862Z',
  summary: {
    direct: 5,
    limited: 2,
    fallbackOnly: 18,
    remainingWarnings: 0,
  },
  directFeatures: [
    'future-native scene activation',
    'current-doc generation lane',
    'execution surface reporting',
    'route/project export packet visibility',
    'manual chunk closeout verification',
  ],
  limitedFeatures: [
    'webgpu-native quality tier is documented but target-host dependent',
    'live browser proof ingestion is documented but depends on returned host artifacts',
  ],
  fallbackOnlyFeatures: [
    'intel-mac real export fixture capture',
    'intel-mac browser executable confirmation',
    'target-host screenshot bundle',
    'real browser playback evidence',
    'target-host export drift evidence',
    'target-host final closeout confirmation',
    'fallback rail 07',
    'fallback rail 08',
    'fallback rail 09',
    'fallback rail 10',
    'fallback rail 11',
    'fallback rail 12',
    'fallback rail 13',
    'fallback rail 14',
    'fallback rail 15',
    'fallback rail 16',
    'fallback rail 17',
    'fallback rail 18',
  ],
};

export function getProjectWebgpuCapabilityBuckets(
  report: ProjectWebgpuCapabilityReport = CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
): ProjectWebgpuCapabilityBucket[] {
  return [
    {
      mode: 'direct',
      label: 'Direct',
      count: report.directFeatures.length,
      items: report.directFeatures,
      nextAction: 'Keep these lanes stable and reuse them as the default repo-only proof surface.',
    },
    {
      mode: 'limited',
      label: 'Limited',
      count: report.limitedFeatures.length,
      items: report.limitedFeatures,
      nextAction: 'Documented in repo but still needs target-host confirmation before it can be treated as closed.',
    },
    {
      mode: 'fallback-only',
      label: 'Fallback only',
      count: report.fallbackOnlyFeatures.length,
      items: report.fallbackOnlyFeatures,
      nextAction: 'Blocked on Intel Mac / target-host artifacts, so only operator packets and proof intake can move this forward here.',
    },
  ];
}

export function filterProjectWebgpuCapabilityBuckets(
  buckets: ProjectWebgpuCapabilityBucket[],
  mode: ProjectWebgpuCapabilityMode,
): ProjectWebgpuCapabilityBucket[] {
  if (mode === 'all') return buckets;
  return buckets.filter((bucket) => bucket.mode === mode);
}

export function buildProjectWebgpuCapabilityPacket(
  mode: ProjectWebgpuCapabilityMode,
  report: ProjectWebgpuCapabilityReport = CURRENT_PROJECT_WEBGPU_CAPABILITY_REPORT,
): string {
  const buckets = filterProjectWebgpuCapabilityBuckets(getProjectWebgpuCapabilityBuckets(report), mode);
  return [
    'ProjectWebgpuCapabilityPacket',
    `generatedAt=${report.generatedAt}`,
    `mode=${mode}`,
    `direct=${report.summary.direct}`,
    `limited=${report.summary.limited}`,
    `fallbackOnly=${report.summary.fallbackOnly}`,
    `remainingWarnings=${report.summary.remainingWarnings}`,
    ...buckets.flatMap((bucket) => [
      `${bucket.mode}::count=${bucket.count}`,
      ...bucket.items.map((item) => `${bucket.mode}::${item}`),
      `${bucket.mode}::nextAction=${bucket.nextAction}`,
    ]),
  ].join('\n');
}
