import type { FutureNativeFamilyLabel } from './presetCatalog';

export type FutureNativeDisplayPackCard = {
  id: string;
  familyLabel: FutureNativeFamilyLabel;
  label: string;
  subtitle: string;
  summary: string;
  emphasis: string[];
};

export const FUTURE_NATIVE_DISPLAY_PACK_CARDS: FutureNativeDisplayPackCard[] = [
  {
    id: 'future-native-pack-material-behaviors',
    familyLabel: 'MPM',
    label: 'Material Behaviors',
    subtitle: 'MPM',
    summary: '砂・泥・雪・ペーストのような粒状〜粘塑性の挙動をまとめた family 入口です。',
    emphasis: ['granular', 'viscoplastic', 'snow', 'mud', 'paste'],
  },
  {
    id: 'future-native-pack-soft-bodies',
    familyLabel: 'PBD',
    label: 'Soft Bodies',
    subtitle: 'PBD',
    summary: '布、ロープ、膜、柔体のたわみと張力を扱う family 入口です。',
    emphasis: ['cloth', 'rope', 'membrane', 'softbody'],
  },
  {
    id: 'future-native-pack-breakage',
    familyLabel: 'Fracture',
    label: 'Breakage',
    subtitle: 'Fracture',
    summary: 'ボクセル破壊、亀裂伝播、デブリ生成をまとめた破砕 family 入口です。',
    emphasis: ['voxel', 'crack', 'debris', 'collapse'],
  },
  {
    id: 'future-native-pack-smoke-fields',
    familyLabel: 'Volumetric',
    label: 'Smoke Fields',
    subtitle: 'Volumetric',
    summary: '密度輸送、プルーム、光と影の結合を含む volumetric family 入口です。',
    emphasis: ['smoke', 'advection', 'density', 'light-shadow'],
  },
];
