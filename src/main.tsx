import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { i18n } from './i18n';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error(i18n.t('errors.rootElementNotFound'));
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
