export const WEBVIEW_CREATED = 'WEBVIEW_CREATED';
export const WEBVIEW_DESTROYED = 'WEBVIEW_DESTROYED';
export const RELOAD_WEBVIEW = 'RELOAD_WEBVIEW';
export const OPEN_DEVTOOLS_ON_WEBVIEW = 'OPEN_DEVTOOLS_ON_WEBVIEW';

export const webviewCreated = (url, webContentsId) => ({
	type: WEBVIEW_CREATED,
	payload: { url, webContentsId },
});

export const webviewDestroyed = (url, webContentsId) => ({
	type: WEBVIEW_DESTROYED,
	payload: { url, webContentsId },
});

export const reloadWebview = ({ url, webContentsId, ignoringCache = false, fromUrl = false }) => ({
	type: RELOAD_WEBVIEW,
	payload: { url, webContentsId, ignoringCache, fromUrl },
});

export const openDevToolsOnWebview = ({ url, webContentsId }) => ({
	type: OPEN_DEVTOOLS_ON_WEBVIEW,
	payload: { url, webContentsId },
});
