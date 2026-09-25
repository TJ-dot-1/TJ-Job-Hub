import React from 'react';
import { renderToString } from 'react-dom/server';

function Test() {
  const Comp = () => React.createElement('div', null, 'hello');
  try { renderToString(React.createElement('div', null, Comp)); } catch (e) { console.log('Comp:', e.message); }
}
Test();
