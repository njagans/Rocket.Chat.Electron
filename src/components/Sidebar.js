/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { remote } from 'electron';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { parse as parseUrl } from 'url';
import i18n from '../i18n';
import {
	showLanding,
	showDownloads,
	showServer,
	reloadWebview,
	removeServerFromUrl,
	openDevToolsOnWebview,
	sortServers,
} from '../store/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDownload } from '@fortawesome/free-solid-svg-icons';
const { getCurrentWindow, Menu } = remote;


const faviconCacheBustingTime = 15 * 60 * 1000;

const sidebarItemStyle = css`
	position: relative;
	flex: 0 0 auto;
	box-sizing: border-box;
	margin: 4px 0;
	font-size: 2.5rem;
	line-height: 1.25;

	&[data-tooltip]::after {
		position: absolute;
		top: 50%;
		left: 100%;
		display: block;
		visibility: hidden;
		padding: 0.5rem 1rem;
		content: attr(data-tooltip);
		transition: all 200ms ease-out 200ms;
		transform: translate(10px, -50%);
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		color: #ffffff;
		border-radius: 2px;
		background-color: #1f2329;
		font-size: 0.875rem;
		line-height: normal;
	}

	&[data-tooltip]:hover::after {
		visibility: visible;
		transform: translate(0, -50%);
		opacity: 1;
	}
`;

const SidebarButton = ({ children, ...props }) => (
	<button
		{...props}
		css={[
			sidebarItemStyle,
			css`
				display: flex;
				flex-direction: row;
				padding: 0;
				cursor: pointer;
				color: inherit;
				border: none;
				background: none;
				align-items: center;
				justify-content: center;

				span {
					width: 3rem;
					height: 3rem;
					transition: opacity 200ms;
					opacity: 0.6;
					color: inherit;
					background-color: rgba(0, 0, 0, 0.1);
					font-size: 2rem;
					line-height: 3rem;
				}

				&:hover span {
					opacity: 1;
				}
			`,
		]}
	>
		<span>
			{children}
		</span>
	</button>
);

const AddServerButton = (props) => (
	<SidebarButton {...props} data-tooltip={i18n.__('sidebar.addNewServer')}>
		<FontAwesomeIcon icon={faPlus} />
	</SidebarButton>
);

const DownloadsButton = (props) => (
	<button
		{...props}
		className="sidebar__submenu-action"
		data-tooltip={i18n.__('sidebar.showDownloadManager')}
	>
		<span className="sidebar__action-label">
			<FontAwesomeIcon icon={faDownload} />
		</span>
	</button>
);

function Server({ server: { url, title = url, order, active, badge }, dragging, ...props }) {
	const [withFavicon, setWithFavicon] = useState(false);

	const hasUnreadMessages = !!badge;
	const mentionCount = (badge || badge === 0) ? parseInt(badge, 10) : null;
	const initials = (
		title
			.replace(url, parseUrl(url).hostname)
			.split(/[^A-Za-z0-9]+/g)
			.slice(0, 2)
			.map((text) => text.slice(0, 1).toUpperCase())
			.join('')
	);
	const bustingParam = Math.round(Date.now() / faviconCacheBustingTime);
	const faviconUrl = `${ url.replace(/\/$/, '') }/assets/favicon.svg?_=${ bustingParam }`;

	return (
		<li
			{...props}
			draggable="true"
			data-url={url}
			data-tooltip={
				(url !== 'https://open.rocket.chat' && title === 'Rocket.Chat') ? `${ title } - ${ url }` : title
			}
			className={[
				'sidebar__list-item',
				'server',
				active && 'server--active',
				hasUnreadMessages && 'server--unread',
				withFavicon && 'server--with-favicon',
				dragging && 'server--dragged',
			].filter(Boolean).join(' ')}
		>
			<span className="server__initials">{initials}</span>
			<img
				draggable={false}
				src={faviconUrl}
				className="server__favicon"
				onLoad={() => setWithFavicon(true)}
				onError={() => setWithFavicon(false)}
			/>
			<div
				className="server__badge"
			>
				{Number.isInteger(mentionCount) ? String(mentionCount) : ''}
			</div>
			<div
				className="server__shortcut"
			>
				{process.platform === 'darwin' ? '⌘' : '^'}{order + 1}
			</div>
		</li>
	);
}

const mapStateToProps = ({
	preferences: {
		hasSidebar,
	},
	servers,
	view,
}) => ({
	servers,
	activeServerUrl: view.url,
	visible: hasSidebar,
});

const mapDispatchToProps = (dispatch) => ({
	onClickServer: (url) => dispatch(showServer(url)),
	onContextMenuServer: (url, event) => {
		event.preventDefault();

		const menu = Menu.buildFromTemplate([
			{
				label: i18n.__('sidebar.item.reload'),
				click: () => dispatch(reloadWebview({ url })),
			},
			{
				label: i18n.__('sidebar.item.remove'),
				click: () => dispatch(removeServerFromUrl(url)),
			},
			{
				label: i18n.__('sidebar.item.openDevTools'),
				click: () => dispatch(openDevToolsOnWebview({ url })),
			},
		]);
		menu.popup(getCurrentWindow());
	},
	onSortServers: (urls) => {
		dispatch(sortServers(urls));
	},
	onClickAddServer: () => dispatch(showLanding()),
	onClickDownloads: () => dispatch(showDownloads()),
});

export const Sidebar = connect(mapStateToProps, mapDispatchToProps)(
	function Sidebar({
		servers,
		activeServerUrl,
		visible,
		onClickServer,
		onContextMenuServer,
		onSortServers,
		onClickAddServer,
		onClickDownloads,
	}) {
		const [showShortcuts, setShowShortcuts] = useState(false);
		const [draggedServerUrl, setDraggedServerUrl] = useState(null);
		const [sortedServers, setSortedServers] = useState(servers);

		useEffect(() => {
			setSortedServers(servers);
		}, [servers]);

		useEffect(() => {
			const createShortcutKeyEventHandler = (down) => (event) => {
				const shortcutKey = process.platform === 'darwin' ? 'Meta' : 'Control';
				if (event.key === shortcutKey) {
					setShowShortcuts(down);
				}
			};

			const handleShortcutKeyDown = createShortcutKeyEventHandler(true);
			const handleShortcutKeyUp = createShortcutKeyEventHandler(false);

			window.addEventListener('keydown', handleShortcutKeyDown);
			window.addEventListener('keyup', handleShortcutKeyUp);

			return () => {
				window.removeEventListener('keydown', handleShortcutKeyDown);
				window.removeEventListener('keyup', handleShortcutKeyUp);
			};
		}, []);

		const style = servers.filter(({ url }) => activeServerUrl === url).map(({ style }) => style)[0] || {};

		const handleDragStart = (event) => {
			event.dataTransfer.dropEffect = 'move';
			event.dataTransfer.effectAllowed = 'move';
			setDraggedServerUrl(event.currentTarget.dataset.url);
		};

		const handleDragEnd = () => {
			setDraggedServerUrl(null);
			const orderedUrls = sortedServers.map(({ url }) => url);
			onSortServers && onSortServers(orderedUrls);
			onClickServer && onClickServer(draggedServerUrl);
		};

		const handleDragEnter = ({ currentTarget }) => {
			const srcServer = sortedServers.find(({ url }) => url === draggedServerUrl);
			const destServer = sortedServers.find(({ url }) => url === currentTarget.dataset.url);
			setSortedServers(sortedServers.map((server) => (
				(server.url === srcServer.url && destServer) ||
				(server.url === destServer.url && srcServer) ||
				server
			)));
		};

		const handleDragOver = (event) => {
			event.preventDefault();
		};

		return (
			<div
				className={[
					'sidebar',
					process.platform === 'darwin' && 'sidebar--macos',
					!visible && 'sidebar--hidden',
				].filter(Boolean).join(' ')}
				style={{
					'--background': style.background || '',
					'--color': style.color || '',
				}}
			>
				<div className="sidebar__inner">
					<ol
						className={[
							'sidebar__list',
							'sidebar__server-list',
							showShortcuts && 'sidebar__server-list--shortcuts',
						].filter(Boolean).join(' ')}
					>
						{sortedServers.map((server, order) => (
							<Server
								key={order}
								server={{ ...server, active: server.url === activeServerUrl, order }}
								dragging={draggedServerUrl === server.url}
								onClick={onClickServer.bind(null, server.url)}
								onContextMenu={onContextMenuServer.bind(null, server.url)}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								onDragEnter={handleDragEnter}
								onDragOver={handleDragOver}
							/>
						))}
					</ol>
					<AddServerButton onClick={onClickAddServer} />
				</div>

				<div className="sidebar__submenu">
					<DownloadsButton onClick={onClickDownloads} />
				</div>
			</div>
		);
	}
);
