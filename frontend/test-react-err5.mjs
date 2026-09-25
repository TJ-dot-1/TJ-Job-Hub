import React from 'react';
import { renderToString } from 'react-dom/server';

function Test() {
  const Comp = () => React.createElement('div', null, 'hello');
  
  // What if I try to render <Comp /> as an element of an array, but one of them is the component itself?
  try { renderToString(React.createElement('div', null, [ Comp ])); } catch(e) { console.log('Array of comp:', e.message); }
  
  // What if I pass an object with $$typeof as a string? We already saw it prints those exact keys!
  // It prints: found: object with keys {$$typeof, type, key, ref, props, _owner, _store}
  
  // Is it possible the user is rendering an Error object that has these properties? No.
}
Test();
