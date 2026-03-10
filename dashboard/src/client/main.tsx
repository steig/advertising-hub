import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { ChatPage } from './pages/ChatPage';
import './styles.css';

const host = window.location.hostname;
const isChat = host.startsWith('chat.');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {isChat ? <ChatPage /> : <App />}
    </BrowserRouter>
  </React.StrictMode>
);
