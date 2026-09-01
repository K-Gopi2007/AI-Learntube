import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import contentStyles from '../styles/content.css?inline';

// Create a host container
const container = document.createElement('div');
container.id = 'learntube-ai-extension-root';
document.body.appendChild(container);

// Use Shadow DOM to prevent CSS leaks from YouTube
const shadow = container.attachShadow({ mode: 'open' });

// Add styles
const styleElement = document.createElement('style');
styleElement.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
  ${contentStyles}
`;
shadow.appendChild(styleElement);

const rootElement = document.createElement('div');
shadow.appendChild(rootElement);

const root = createRoot(rootElement);
root.render(<App />);
