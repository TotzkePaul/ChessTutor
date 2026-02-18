import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Note: StrictMode is disabled due to incompatibility with react-beautiful-dnd
// react-beautiful-dnd doesn't fully support React 18's StrictMode double-mounting behavior
// This causes "Cannot find droppable entry" errors in development
// See: https://github.com/atlassian/react-beautiful-dnd/issues/2399
// 
// Alternative: Consider migrating to @hello-pangea/dnd (React 18 compatible fork)
// or dnd-kit for future updates
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
