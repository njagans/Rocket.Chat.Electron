import React from 'react';
import { render } from 'react-dom';
import start from './scripts/events';
import './store';
import { App } from './components/App';


window.addEventListener('load', () => {
	render(<App />, document.getElementById('root'));
	start();
});
