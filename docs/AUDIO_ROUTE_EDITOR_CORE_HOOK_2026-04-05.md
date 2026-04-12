# Audio Route Editor Core Hook

- targetOptions / targetSystemMap / routeSystemOptions を `useAudioRouteEditorCore` へ移動。
- updateRoute / removeRoute / duplicateRoute / addRoute / moveRoute を hook 化。
- filteredRoutes / filteredRouteIdSet / routeTransferValidation を hook 化。
- `controlPanelTabsAudio.tsx` から route core actions を分離。
