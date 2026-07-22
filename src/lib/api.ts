import type { AstApiMeta, AstCallNode, AstChunk, AstPaletteEntry } from '../types/ast';

const DEFAULT_API_BASE = 'http://127.0.0.1:25599';

/** bump alongside DEVTOOLS_API_VERSION in the mod's AstModels.kt - see checkApiMeta() in bootstrap.ts */
export const EXPECTED_API_VERSION = 2;

/**
 * the running game is the source of truth, so WebTinker never hardcodes where it lives.
 * `/nexus_server start` (mod side) is expected to open the browser with `?api=` already
 * set; this just also allows pointing WebTinker at a different instance/port by hand.
 */
export function getApiBase(): string {
	const fromQuery = new URLSearchParams(location.search).get('api');
	return fromQuery ?? DEFAULT_API_BASE;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(getApiBase() + path, init);
	if (!res.ok) {
		throw new Error(`${path} -> ${res.status}: ${await res.text()}`);
	}
	return res.json() as Promise<T>;
}

/** always call this first - see checkApiMeta() in bootstrap.ts for why */
export function getMeta(): Promise<AstApiMeta> {
	return apiFetch<AstApiMeta>('/api/meta');
}

export function getPalette(): Promise<AstPaletteEntry[]> {
	return apiFetch<AstPaletteEntry[]>('/api/palette');
}

/** compiles a deck (ordered list of cypher ids) into the compiled-result tree, same as a real cast would resolve */
export function compileAst(cypherIds: string[]): Promise<AstChunk> {
	return apiFetch<AstChunk>('/api/ast', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(cypherIds),
	});
}

/** same deck, but the causal call chain (who invoked whom, including copies) instead of the compiled result */
export function compileCallChain(cypherIds: string[]): Promise<AstCallNode[]> {
	return apiFetch<AstCallNode[]>('/api/call-chain', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(cypherIds),
	});
}

/** not yet implemented on the mod side - it needs Minecraft's client-side ResourceManager to
 *  resolve textures correctly (resource pack overrides included), so it'll only ever work
 *  while the mod's HTTP server is running on the same machine as the game, never headless. */
export function iconUrl(cypherId: string): string {
	return `${getApiBase()}/api/icon/${encodeURIComponent(cypherId)}`;
}
