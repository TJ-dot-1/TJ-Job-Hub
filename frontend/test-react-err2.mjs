import React from 'react';
import { renderToString } from 'react-dom/server';

function Test() {
  const el = React.createElement('div', null, 'hello');
  try { renderToString(React.createElement('div', { title: el })); } catch (e) { console.log('title:', e.message); }
  
  // What if I put it in an object but trick React? No.
  // What if I try to render a component that returns an object?
  const Comp2 = () => ({ a: 1 });
  try { renderToString(React.createElement(Comp2)); } catch (e) { console.log('Comp2:', e.message); }
  
  // What if I have a React element but it's rejected because it's in a string template?
  try { renderToString(React.createElement('div', null, `Test ${el}`)); } catch (e) { console.log('template:', e.message); }
}
Test();
