import { useDraggable } from '@dnd-kit/react';
import { CypherCard } from '../CypherCard';
import { flyToSlot, getSlotElement } from '../../lib/flyAnimation';
import { flyToFirstEmptySlot, palette } from '../../state/deck';
import type { AstCypherRef, AstPaletteEntry } from '../../types/ast';
import './style.css';

/**
 * Wraps CypherCard with the actual drag source wiring. Kept separate from CypherCard itself
 * so that component stays presentation-only and reusable somewhere non-draggable (e.g. a
 * filled deck slot doesn't drag - not this round, see WandEditor).
 */
function DraggableCypherCard({ cypher }: { cypher: AstCypherRef }) {
	const { ref, isDragging } = useDraggable({ id: cypher.id, data: { cypher } });

	function handleContextMenu(event: MouseEvent, cy: AstCypherRef) {
		const sourceEl = event.currentTarget as HTMLElement;
		const index = flyToFirstEmptySlot(cy); // real state update happens here, synchronously
		if (index === -1) return; // deck's full - nothing to animate toward, nothing changed
		const targetEl = getSlotElement(index);
		if (targetEl) flyToSlot(sourceEl, targetEl); // cosmetic only, doesn't gate the state change above
	}

	return <CypherCard cypher={cypher} dragRef={ref} isDragging={isDragging} onContextMenu={handleContextMenu} />;
}

/**
 * Palette panel (left, full height in the wireframe). Drag a card into a deck slot to place
 * it there precisely, or right-click to send it to the first empty slot. The DragDropProvider
 * that makes dragging out of here actually detectable in WandEditor lives up in TinkerLayout,
 * not here - dnd-kit only tracks drops within a single provider's tree, and the deck slots are
 * a sibling component, not a child of this one.
 */
export function CypherLibrary() {
	const visibleEntries = palette.value.filter((entry) => !entry.hidden);

	const groupedCategories = visibleEntries.reduce<Record<string, AstPaletteEntry[]>>((acc, entry) => {
		const cat = entry.cypher.category || 'General';
		(acc[cat] ??= []).push(entry);
		return acc;
	}, {});

	return (
		<section class="panel library">
			<div class="library-header">
				<h2>Cyphers Library</h2>
				<p class="placeholder">{visibleEntries.length} cyphers available</p>
			</div>

			<div class="library-categories">
				{Object.entries(groupedCategories).map(([category, entries]) => (
					<div key={category} class="category-group">
						<div class="category-title">{category}</div>
						<div class="category-grid">
							{entries.map((entry) => (
								<DraggableCypherCard key={entry.cypher.id} cypher={entry.cypher} />
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
