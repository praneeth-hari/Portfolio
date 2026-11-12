import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion } from 'framer-motion';
import App from './App.jsx';
// fonts are bundled from npm (no files to keep in public/fonts)
import '@fontsource/archivo/latin-400.css';
import '@fontsource/archivo/latin-700.css';
import '@fontsource/archivo/latin-900.css';
import '@fontsource/geist-sans/latin-400.css';
import '@fontsource/geist-sans/latin-500.css';
import '@fontsource/geist-sans/latin-600.css';
import '@fontsource/geist-mono/latin-400.css';
import '@fontsource/geist-mono/latin-500.css';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* `strict` makes a stray full <motion.*> component an error, so the bundle stays small */}
    <LazyMotion features={() => import('./motionFeatures.js').then((mod) => mod.default)} strict>
      <App />
    </LazyMotion>
  </StrictMode>
);
