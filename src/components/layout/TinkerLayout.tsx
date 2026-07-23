import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { CallTree } from '../CallTree';
import { CypherLibrary } from '../CypherLibrary';
import { WandEditor } from '../WandEditor';
import { setSlot } from '../../state/deck';
import type { AstCypherRef } from '../../types/ast';
import './style.css';

function handleDragEnd(event: DragEndEvent) {
	if (event.canceled) return;

	// source is a library card (see CypherLibrary's useDraggable data), target is a deck slot
	// (see WandEditor's useDroppable data) - both carry exactly the payload each side needs,
	// nothing more, so this stays a one-line mediator instead of reaching into either panel.
	const cypher = event.operation.source?.data?.cypher as AstCypherRef | undefined;
	const slotIndex = event.operation.target?.data?.slotIndex as number | undefined;
	if (cypher && slotIndex !== undefined) {
		setSlot(slotIndex, cypher);
	}
}

/**
 * Three-panel grid matching the wireframe, wrapped in a single DragDropProvider so a drag
 * that starts in CypherLibrary and ends in WandEditor is one continuous operation dnd-kit can
 * actually track - it has to be here (or higher), not inside either panel individually, since
 * they're siblings and dnd-kit only resolves drops within one provider's tree.
 */
export function TinkerLayout() {
	return (
		<DragDropProvider onDragEnd={handleDragEnd}>
			<div class="tinker-layout">
				<CypherLibrary />
				<WandEditor />
				<CallTree />
			</div>
		</DragDropProvider>
	);
}
