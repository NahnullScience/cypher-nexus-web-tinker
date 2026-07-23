import { useDroppable } from '@dnd-kit/react';
import { useState } from 'preact/hooks';
import { compileAst } from '../../lib/api';
import { registerSlotElement } from '../../lib/flyAnimation';
import { clearDeck, clearSlot, compiledResult, deck, EMPTY_CYPHER_ID, setDeckSize } from '../../state/deck';
import { CypherCard, EmptyCypherSlot } from '../CypherCard';
import './style.css';

/**
 * One grid cell. Always the same DOM node across empty<->filled transitions (stable `key` on
 * the wrapper in the parent, only the inner content swaps) - matters for two reasons: dnd-kit's
 * `useDroppable` ref shouldn't churn every time a slot fills, and the fly-animation registry
 * (see lib/flyAnimation.ts) needs a persistent element to target.
 */
function DeckSlotView({ index }: { index: number }) {
	const cypher = deck.value[index];
	const { ref, isDropTarget } = useDroppable({
		id: `deck-slot-${index}`,
		data: { slotIndex: index },
	});

	return (
		<div
			ref={(el) => {
				ref(el);
				registerSlotElement(index, el as HTMLElement | null);
			}}
			class={`deck-slot ${isDropTarget ? 'is-drop-target' : ''}`}
		>
			{cypher ? <CypherCard cypher={cypher} onRemove={() => clearSlot(index)} /> : <EmptyCypherSlot />}
		</div>
	);
}

/**
 * Wand editor panel (top-right in the wireframe): a fixed-size grid of slots, drop a library
 * card onto one to place it there (see TinkerLayout for the DragDropProvider + onDragEnd that
 * actually performs the placement - this component only renders the drop targets).
 */
export function WandEditor() {
	// uncommitted text for the size input - deliberately local, not derived straight from the
	// signal, so typing "16" doesn't resize (and re-render the whole grid) after the first "1"
	const [sizeInput, setSizeInput] = useState(String(deck.value.length));

	function commitSize() {
		const parsed = parseInt(sizeInput, 10);
		if (!Number.isNaN(parsed)) setDeckSize(parsed);
		setSizeInput(String(deck.value.length)); // reflect back whatever it actually got clamped to
	}

	async function onCompile() {
		compiledResult.value = await compileAst(deck.value.map((c) => c?.id ?? EMPTY_CYPHER_ID));
	}

	return (
		<section class="panel editor">
			<div class="editor-header">
				<h2>Wand Editor</h2>
				<label class="deck-size-input">
					size
					<input
						type="number"
						min={1}
						max={64}
						value={sizeInput}
						onInput={(e) => setSizeInput((e.target as HTMLInputElement).value)}
						onBlur={commitSize}
						onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
					/>
				</label>
			</div>

			<div class="deck-grid">
				{deck.value.map((_, i) => (
					<DeckSlotView key={i} index={i} />
				))}
			</div>

			<div class="editor-actions">
				<button type="button" onClick={onCompile}>
					Compile
				</button>
				<button type="button" onClick={clearDeck}>
					Clear
				</button>
			</div>
		</section>
	);
}
