import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { injectResults, clearResults } from './data/resultsStore';
import { MatchResult } from './data/results';
import './index.css';

declare global {
  interface Window {
    __clearResults: typeof clearResults;
    __injectResults: (results: MatchResult[]) => void;
  }
}

window.__injectResults = injectResults;
window.__clearResults = clearResults;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
