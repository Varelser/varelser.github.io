App.tsx で AppBodyScene を static import から React.lazy へ変更し、App 本体の同期依存を1段薄くした。
結果: App chunk 198.06 kB、AppBodyScene は 5.63 kB の独立 chunk。
検証: typecheck/build/unit/package-integrity 通過。
