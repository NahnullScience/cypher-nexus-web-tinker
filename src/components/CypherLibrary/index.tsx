import { DragDropProvider, useDraggable } from '@dnd-kit/react';
import { addToDeck, palette } from '../../state/deck';
import type { AstCypherRef, AstPaletteEntry } from '../../types/ast';
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
	onCypherDragStart?: (cypher: AstCypherRef) => void;
	onClick?: (cypher: AstCypherRef) => void;
}

function CypherCard({ cypher, onCypherDragStart, onClick }: CypherCardProps) {
	const { ref, isDragging } = useDraggable({
		id: cypher.id,
		data: { cypher },
	});

	const handleNativeDragStart = (e: DragEvent) => {
		if (e.dataTransfer) {
			e.dataTransfer.setData('application/json', JSON.stringify(cypher));
			e.dataTransfer.effectAllowed = 'copy';
		}
		onCypherDragStart?.(cypher);
	};

	const categoryColor = argbToCss(cypher.categoryColor);

	return (
		<div
			ref={ref}
			draggable={true}
			onDragStart={handleNativeDragStart}
			onClick={() => onClick?.(cypher)}
			class={`cypher-card ${isDragging ? 'is-dragging' : ''}`}
			style={{ '--category-color': categoryColor }}
			title={`${cypher.label} (${cypher.category})`}
		>
			<div class="cypher-card-content">
				<span class="cypher-card-label">{cypher.label}</span>
			</div>
		</div>
	);
}

interface CypherLibraryProps {
	onCypherDragStart?: (cypher: AstCypherRef) => void;
}

export function CypherLibrary({ onCypherDragStart }: CypherLibraryProps) {
	const visibleEntries = palette.value.filter((entry) => !entry.hidden);

	// Group palette entries by category
	const groupedCategories = visibleEntries.reduce<Record<string, AstPaletteEntry[]>>((acc, entry) => {
		const cat = entry.cypher.category || 'General';
		if (!acc[cat]) acc[cat] = [];
		acc[cat].push(entry);
		return acc;
	}, {});

	const handleDragStart = (event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragStart']>>[0]) => {
		const cypher = event.operation.source?.data?.cypher as AstCypherRef | undefined;
		if (cypher) {
			onCypherDragStart?.(cypher);
		}
	};

	return (
		<DragDropProvider onDragStart={handleDragStart}>
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
									<CypherCard
										key={entry.cypher.id}
										cypher={entry.cypher}
										onCypherDragStart={onCypherDragStart}
										onClick={(cypher) => addToDeck(cypher)}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</DragDropProvider>
	);
}