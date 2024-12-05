import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeAdmin } from './lib/auth';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Initialize admin user
initializeAdmin().catch(console.error);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);