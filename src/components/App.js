import { remote } from 'electron';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { AboutModal } from './modals/AboutModal';
import { ScreenshareModal } from './modals/ScreenshareModal';
import { UpdateModal } from './modals/UpdateModal';
import { DragRegion } from './DragRegion';
import { Preloader } from './Preloader';
import { Sidebar } from './Sidebar';
const { dock, menus, touchBar, tray } = remote.require('./main');


const mountRemoteModules = () => {
	dock.mount();
	menus.mount();
	touchBar.mount();
	tray.mount();
};

const unmountRemoteModules = () => {
	dock.unmount();
	menus.unmount();
	touchBar.unmount();
	tray.unmount();
};

const Views = ({ children }) => (
	<div className="Views">
		{children}
	</div>
);

const Landing = () => (
	<section className="landing">
		<div className="landing__wrapper">
			<div>
				<img className="landing__logo" src="./images/logo-dark.svg" />
			</div>
			<form className="landing__form" method="/">
				<h2 className="landing__form-prompt">Enter your server URL</h2>
				<div>
					<input type="text" name="server-url" placeholder="https://open.rocket.chat" dir="auto" className="landing__form-host-field" />
				</div>
				<div className="landing__form-error" />
				<div>
					<button type="submit" className="button primary login landing__form-submit-button">Connect</button>
				</div>
			</form>
		</div>
	</section>
);

const Webviews = () => (
	<div className="Webviews" />
);

const Downloads = () => (
	<div className="app-download-manager" style={{ display: 'none' }} data-tooltip="Show Download manager">
		<div className="app-download-manager-actions">
			<div className="app-download-manager-title"><b>Downloads</b></div>
			<button className="app-download-manager-clear-action" data-tooltip="Clear download list">
				Clear all items
			</button>
		</div>
		<div className="app-download-manager-items">
			{/* place download items*/}
		</div>
	</div>
);

const Preferences = () => null;

export function App() {
	useEffect(() => {
		mountRemoteModules();
		return () => unmountRemoteModules();
	}, []);

	return (
		<Provider store={store}>
			<div className="app-page">
				<DragRegion />

				<Preloader>
					<Sidebar />
					<Views>
						<Landing />
						<Webviews />
						<Downloads />
						<Preferences />
					</Views>
				</Preloader>

				<AboutModal />
				<UpdateModal />
				<ScreenshareModal />
			</div>
		</Provider>
	);
}
