import type { AstChunk, AstPaletteEntry } from '../types/ast';

const DEFAULT_API_BASE = 'http://127.0.0.1:25599';

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

export function getPalette(): Promise<AstPaletteEntry[]> {
	return apiFetch<AstPaletteEntry[]>('/api/palette');
}

/** compiles a deck (ordered list of cypher ids) into the AST the same way a real cast would */
export function compileAst(cypherIds: string[]): Promise<AstChunk> {
	return apiFetch<AstChunk>('/api/ast', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(cypherIds),
	});
}

/** not yet implemented on the mod side - wired here so the UI has somewhere to call once it is */
export function compileCallChain(cypherIds: string[]) {
	return apiFetch('/api/call-chain', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(cypherIds),
	});
}

export function iconUrl(cypherId: string): string {
	return `${getApiBase()}/api/icon/${encodeURIComponent(cypherId)}`;
}
