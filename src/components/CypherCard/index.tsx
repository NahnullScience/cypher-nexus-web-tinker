import type { AstCypherRef } from '../../types/ast';
import './style.css';

/** Converts 32-bit ARGB integer (from CypherCategory.color) into CSS rgba(...) string */
function argbToCss(colorInt: number): string {
	const a = ((colorInt >>> 24) & 0xff) / 255;
	const r = (colorInt >> 16) & 0xff;
	const g = (colorInt >> 8) & 0xff;
	const b = colorInt & 0xff;
	const alpha = a === 0 ? 1 : a;
	return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

interface CypherCardProps {
	cypher: AstCypherRef;
	/** dnd-kit's ref callback, if this instance should be a drag source (library only, for now) */
	dragRef?: (element: Element | null) => void;
	isDragging?: boolean;
	onContextMenu?: (event: MouseEvent, cypher: AstCypherRef) => void;
	/** small ✕ button in the corner, shown on hover - deck slots only */
	onRemove?: () => void;
}

/**
 * The single square-card presentation used everywhere a cypher needs to render as a tile:
 * the library palette and filled wand-editor slots. Deliberately knows nothing about
 * dnd-kit itself (see `dragRef`) so it stays reusable in non-draggable contexts too.
 */
export function CypherCard({ cypher, dragRef, isDragging, onContextMenu, onRemove }: CypherCardProps) {
	const categoryColor = argbToCss(cypher.categoryColor);

	return (
		<div
			ref={dragRef}
			class={`cypher-card ${isDragging ? 'is-dragging' : ''}`}
			style={{ '--category-color': categoryColor }}
			title={`${cypher.label} (${cypher.category})`}
			onContextMenu={(e) => {
				if (!onContextMenu) return;
				e.preventDefault();
				onContextMenu(e, cypher);
			}}
		>
			<div class="cypher-card-content">
				<span class="cypher-card-label">{cypher.label}</span>
			</div>
			{onRemove && (
				<button
					type="button"
					class="cypher-card-remove"
					title="remove"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
				>
					✕
				</button>
			)}
		</div>
	);
}

/** the "bordered empty square" for an unfilled deck slot - same footprint as a real card */
export function EmptyCypherSlot() {
	return <div class="cypher-card cypher-card-empty" />;
}
