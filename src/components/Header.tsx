import { connectionError, connectionStatus } from '../state/deck';

const STATUS_LABEL: Record<string, string> = {
	idle: 'idle',
	connecting: 'connecting…',
	connected: 'connected',
	error: 'not connected',
};

export function Header() {
	const status = connectionStatus.value;

	return (
		<header>
			<span class="brand">cypher_nexus :: web tinker</span>
			<span class={`status status-${status}`} title={connectionError.value ?? undefined}>
				{STATUS_LABEL[status]}
			</span>
		</header>
	);
}
