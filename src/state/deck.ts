import { computed, signal } from '@preact/signals';
import type { AstApiMeta, AstChunk, AstCypherRef, AstPaletteEntry } from '../types/ast';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'version-mismatch';

/** everything the registry currently has (see AstExporter.palette() on the mod side) */
export const palette = signal<AstPaletteEntry[]>([]);

/** result of GET /api/meta - null until bootstrap() resolves it */
export const apiMeta = signal<AstApiMeta | null>(null);

/** the cyphers currently placed in the wand editor, in slot order */
export const deck = signal<AstCypherRef[]>([]);

/** last compiled result from POST /api/ast, null until the player hits "compile" */
export const compiledResult = signal<AstChunk | null>(null);

export const connectionStatus = signal<ConnectionStatus>('idle');
export const connectionError = signal<string | null>(null);

export const categories = computed(() => {
	const seen = new Set<string>();
	for (const entry of palette.value) seen.add(entry.cypher.category);
	return Array.from(seen);
});

export function addToDeck(cypher: AstCypherRef) {
	deck.value = [...deck.value, cypher];
}

export function removeFromDeck(index: number) {
	deck.value = deck.value.filter((_, i) => i !== index);
}

export function moveInDeck(from: number, to: number) {
	if (from === to) return;
	const next = deck.value.slice();
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	deck.value = next;
}

export function clearDeck() {
	deck.value = [];
	compiledResult.value = null;
}
