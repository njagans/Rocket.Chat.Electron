import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { Menus } from './Menus';


export function App() {
	return (
		<Provider store={store}>
			<Menus />
		</Provider>
	);
}
