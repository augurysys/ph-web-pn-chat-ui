import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from 'chat_mf/AppComponent';

const container = document.getElementById('root');
const rootContainer = createRoot(container);

rootContainer.render(
  // <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
  // </React.StrictMode>
);