import React from 'react';
import ReactDOM from 'react-dom/client';

import { Upload } from './upload.jsx';
import { Draw } from './draw.jsx';
import { Loading } from './loading.jsx'

import { withAppState, useAppState } from './state';
import { withDB } from './state-db.jsx';

import './app.css';

const App = withDB(withAppState(() => {
  const { route } = useAppState();

  switch (route.value) {
    case 'loading':
      return <Loading />;
    case 'upload':
      return <Upload />;
    case 'display':
      return <Draw />;
    default:
      return <h1>I don't know what you want from me</h1>;
  }
}));


ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <App />
);
