import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

async function resolveRootComponent() {
  if (import.meta.env.VITE_VERIFY_INLINE === '1') {
    const module = await import('./AppInlineVerify');
    return module.default;
  }
  const module = await import('./App');
  return module.default;
}

const root = ReactDOM.createRoot(rootElement);

void resolveRootComponent().then((RootComponent) => {
  root.render(
    <React.StrictMode>
      <RootComponent />
    </React.StrictMode>
  );
});
