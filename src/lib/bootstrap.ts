import { getPalette } from './api';
import { connectionError, connectionStatus, palette } from '../state/deck';

export async function bootstrap() {
	connectionStatus.value = 'connecting';
	connectionError.value = null;
	try {
		palette.value = await getPalette();
		connectionStatus.value = 'connected';
	} catch (err) {
		connectionStatus.value = 'error';
		connectionError.value = err instanceof Error ? err.message : String(err);
		// most likely cause during setup: the mod's DevToolsServer isn't running,
		// or /nexus_server start hasn't been called in this game session yet.
		console.warn('[cypher_nexus] could not reach the local server:', err);
	}
}
