import { useState } from 'preact/hooks';
import { DragDropProvider, useDraggable } from '@dnd-kit/react';
import { addToDeck, categories, palette } from '../../state/deck';
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
	onCypherDragStart?: (cypher: AstCypherRef) => void;
	onClick?: (cypher: AstCypherRef) => void;
}

/** Individual draggable rectangle representing a single Cypher */
function CypherCard({ cypher, onCypherDragStart, onClick }: CypherCardProps) {
	// Register with @dnd-kit/react
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
			<div class="cypher-card-header">
				<span class="cypher-card-title">{cypher.label}</span>
				<span class="cypher-card-category">{cypher.category}</span>
			</div>
			<div class="cypher-card-stats">
				<span title="Mana Drain">⚡ {cypher.manaDrain}</span>
				{cypher.draw > 0 && <span title="Draw">🎴 {cypher.draw}</span>}
				{cypher.delay > 0 && <span title="Delay">⏱ {cypher.delay}</span>}
			</div>
		</div>
	);
}

interface CypherLibraryProps {
	/** Event triggered when a cypher drag operation starts */
	onCypherDragStart?: (cypher: AstCypherRef) => void;
}

export function CypherLibrary({ onCypherDragStart }: CypherLibraryProps) {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const visibleEntries = palette.value.filter((entry) => {
		if (entry.hidden) return false;
		if (selectedCategory && entry.cypher.category !== selectedCategory) return false;
		return true;
	});

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
					<p class="placeholder">
						{palette.value.length} cyphers across {categories.value.length} categories
					</p>
				</div>

				{/* Category Filter Tabs */}
				<div class="category-tabs">
					<button
						type="button"
						class={`category-tab ${selectedCategory === null ? 'active' : ''}`}
						onClick={() => setSelectedCategory(null)}
					>
						All
					</button>
					{categories.value.map((cat) => (
						<button
							key={cat}
							type="button"
							class={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
							onClick={() => setSelectedCategory(cat)}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Grid Layout of Cyphers */}
				<div class="library-grid">
					{visibleEntries.map((entry) => (
						<CypherCard
							key={entry.cypher.id}
							cypher={entry.cypher}
							onCypherDragStart={onCypherDragStart}
							onClick={(cypher) => addToDeck(cypher)}
						/>
					))}
				</div>
			</section>
		</DragDropProvider>
	);
}