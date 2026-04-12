import React from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export function lazyNamedComponent<TProps>(
  importer: () => Promise<Record<string, unknown>>,
  exportName: string,
): LazyExoticComponent<ComponentType<TProps>> {
  return React.lazy(async () => {
    const module = await importer();
    const resolved = module[exportName];
    if (!resolved) {
      throw new Error(`Lazy component export "${exportName}" was not found.`);
    }
    return {
      default: resolved as ComponentType<TProps>,
    };
  });
}
