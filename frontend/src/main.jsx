import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ChatStoreProvider } from './store/chatStore.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChatStoreProvider>
      <App />
    </ChatStoreProvider>
  </React.StrictMode>
);
