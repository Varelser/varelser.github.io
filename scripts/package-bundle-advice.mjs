export const bundleAdviceById = {
  'full-local-dev': {
    audience: 'すぐにローカル開発を再開したい人',
    chooseThisWhen: '依存込みの完全な作業環境をそのまま引き継ぎたいとき',
    preferInstead: '軽量引き継ぎだけなら source-only-clean、検証結果だけなら proof-packet-verify-status',
    recommendedUse: 'そのまま再開する local-dev complete handoff',
    requiresBootstrap: false,
  },
  'source-only-clean': {
    audience: '軽量なソース引き継ぎをしたい人',
    chooseThisWhen: '容量を抑えてコードと文書を渡したいとき',
    preferInstead: '即再開したいなら full-local-dev、検証だけ見たいなら proof-packet-verify-status',
    recommendedUse: '軽量なソース引き継ぎ。再開前に bootstrap が必要',
    requiresBootstrap: true,
  },
  'proof-packet': {
    audience: 'status / verify / closeout をまとめて見たい人',
    chooseThisWhen: 'どの bundle を取るべきか未確定で、まず全体像を見たいとき',
    preferInstead: 'verify/status だけ見たいなら proof-packet-verify-status、Intel Mac 証跡だけなら proof-packet-intel-mac-closeout',
    recommendedUse: 'status / verify / closeout をまとめて参照する監査用 handoff',
    requiresBootstrap: false,
  },
  'proof-packet-verify-status': {
    audience: 'verify / status / readiness の確認だけしたい人',
    chooseThisWhen: 'コード本体ではなく、現在の検証結果と状態文書を確認したいとき',
    preferInstead: 'Intel Mac 証跡が必要なら proof-packet-intel-mac-closeout、全体監査なら proof-packet',
    recommendedUse: 'verify / status / readiness の共有',
    requiresBootstrap: false,
  },
  'proof-packet-intel-mac-closeout': {
    audience: 'Intel Mac target-host closeout と live-browser proof の担当者',
    chooseThisWhen: 'Intel Mac 実機側の証跡確認と handoff だけを軽く渡したいとき',
    preferInstead: 'verify/status 全般を見るなら proof-packet-verify-status、全体監査なら proof-packet',
    recommendedUse: 'Intel Mac target-host closeout と live-browser proof の引き継ぎ',
    requiresBootstrap: false,
  },
  'platform-specific-runtime-bundled': {
    audience: 'host 依存 runtime を含む partial full handoff が必要な人',
    chooseThisWhen: '対象 host 向けの runtime 同梱 bundle を扱いたいとき',
    preferInstead: '一般的な再開なら full-local-dev、軽量引き継ぎなら source-only-clean',
    recommendedUse: 'host 依存 runtime を含む partial full handoff',
    requiresBootstrap: false,
  },
  unknown: {
    audience: 'bundle の使い分けをすぐ判断したい人',
    chooseThisWhen: 'この bundle の目的に一致するとき',
    preferInstead: 'distribution index を見て他 bundle も比較',
    recommendedUse: '用途未分類',
    requiresBootstrap: false,
  },
};

export function getBundleAdvice(id) {
  const normalizedId = id === 'source-only' ? 'source-only-clean' : id;
  return bundleAdviceById[normalizedId] ?? bundleAdviceById.unknown;
}
