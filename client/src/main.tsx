import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { FiltersProvider } from './context/FiltersContext';
import { LayoutProvider } from './context/LayoutContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LayoutProvider>
      <FiltersProvider>
        <App />
      </FiltersProvider>
    </LayoutProvider>
  </StrictMode>
);
