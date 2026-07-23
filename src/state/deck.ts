import { computed, signal } from '@preact/signals';
import type { AstApiMeta, AstChunk, AstCypherRef, AstPaletteEntry } from '../types/ast';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'version-mismatch';

/** everything the registry currently has (see AstExporter.palette() on the mod side) */
export const palette = signal<AstPaletteEntry[]>([]);

/** result of GET /api/meta - null until bootstrap() resolves it */
export const apiMeta = signal<AstApiMeta | null>(null);

// mirrors ArrayOfCyphers on the mod side: fixed capacity, empty slots are a real concept
// (EmptyCypher there, null here) rather than "not present in the array".
export type DeckSlot = AstCypherRef | null;

const DEFAULT_DECK_SIZE = 33;
const MIN_DECK_SIZE = 1;
const MAX_DECK_SIZE = 64; // ArrayOfCyphers.MAX_LENGTH == Long.SIZE_BITS on the mod side

/** the mod's own id for "nothing here" - what a null slot serializes to for the API */
export const EMPTY_CYPHER_ID = 'cypher_nexus:empty_cypher';

/** the cyphers currently placed in the wand editor, fixed-size, index == slot */
export const deck = signal<DeckSlot[]>(Array<DeckSlot>(DEFAULT_DECK_SIZE).fill(null));

/** last compiled result from POST /api/ast, null until the player hits "compile" */
export const compiledResult = signal<AstChunk | null>(null);

export const connectionStatus = signal<ConnectionStatus>('idle');
export const connectionError = signal<string | null>(null);

export const categories = computed(() => {
	const seen = new Set<string>();
	for (const entry of palette.value) seen.add(entry.cypher.category);
	return Array.from(seen);
});

/**
 * Grows or shrinks the deck in place. Growing appends empty slots; shrinking truncates from
 * the end (whatever was in a dropped slot is gone - same as shrinking capacity on a real wand).
 */
export function setDeckSize(size: number) {
	const clamped = Math.min(MAX_DECK_SIZE, Math.max(MIN_DECK_SIZE, Math.trunc(size) || MIN_DECK_SIZE));
	const current = deck.value;
	if (clamped === current.length) return;

	const next = current.slice(0, clamped);
	while (next.length < clamped) next.push(null);
	deck.value = next;
}

/**
 * The one function everything else in this file funnels through for editing a slot.
 * IMPORTANT: signals only notify subscribers when `.value` is assigned a *new* array
 * reference - `deck.value[index] = x` mutates in place and nothing would ever re-render.
 * `.map()` here always produces a fresh array, which is what actually triggers updates.
 */
export function setSlot(index: number, cypher: DeckSlot) {
	if (index < 0 || index >= deck.value.length) return;
	deck.value = deck.value.map((slot, i) => (i === index ? cypher : slot));
}

export function clearSlot(index: number) {
	setSlot(index, null);
}

export function firstEmptySlotIndex(): number {
	return deck.value.findIndex((slot) => slot === null);
}

/** used by the library card's right-click handler. @returns the slot index used, or -1 if the deck is full */
export function flyToFirstEmptySlot(cypher: AstCypherRef): number {
	const index = firstEmptySlotIndex();
	if (index === -1) return -1;
	setSlot(index, cypher);
	return index;
}

/** empties every slot but keeps the current deck size - "clear" isn't "resize to default" */
export function clearDeck() {
	deck.value = deck.value.map(() => null);
	compiledResult.value = null;
}
