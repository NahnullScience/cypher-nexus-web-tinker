import { EXPECTED_API_VERSION, getMeta, getPalette } from './api';
import { apiMeta, connectionError, connectionStatus, palette } from '../state/deck';

/**
 * The actual contract enforcement between this project and the mod: the shapes in
 * types/ast.ts are hand-mirrored from AstModels.kt with no codegen, so nothing stops
 * the two from drifting silently. What this *can* guarantee is that drift is loud
 * instead of silent - if the mod's DEVTOOLS_API_VERSION doesn't match what this build
 * of WebTinker expects, stop before fetching anything else and say so plainly, rather
 * than rendering whatever partially-matching JSON came back.
 */
async function checkApiMeta(): Promise<boolean> {
	const meta = await getMeta();
	apiMeta.value = meta;

	if (meta.apiVersion !== EXPECTED_API_VERSION) {
		connectionStatus.value = 'version-mismatch';
		connectionError.value =
			`server speaks API v${meta.apiVersion}, this build of WebTinker expects v${EXPECTED_API_VERSION}. ` +
			`update whichever side is behind (mod: ${meta.modVersion}).`;
		return false;
	}
	return true;
}

export async function bootstrap() {
	connectionStatus.value = 'connecting';
	connectionError.value = null;
	try {
		const versionOk = await checkApiMeta();
		if (!versionOk) return; // don't even try the rest - see checkApiMeta()'s doc comment

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
