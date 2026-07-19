import { compileAst } from '../../lib/api';
import { clearDeck, compiledResult, deck, removeFromDeck } from '../../state/deck';
import './style.css';

/**
 * Wand editor panel (top-right in the wireframe). Currently a plain ordered list with a
 * remove button per slot, and a working "compile" button so the full round trip (deck ->
 * POST /api/ast -> tree) is exercised even before drag-and-drop exists.
 */
export function WandEditor() {
	async function onCompile() {
		if (deck.value.length === 0) return;
		compiledResult.value = await compileAst(deck.value.map((c) => c.id));
	}

	return (
		<section class="panel editor">
			<h2>Wand Editor</h2>
			{deck.value.length === 0 ? (
				<p class="placeholder">click cyphers in the library to add them here</p>
			) : (
				<ol class="editor-list">
					{deck.value.map((cypher, i) => (
						<li key={`${cypher.id}-${i}`}>
							<span>{cypher.label}</span>
							<button type="button" onClick={() => removeFromDeck(i)}>
								✕
							</button>
						</li>
					))}
				</ol>
			)}
			<div class="editor-actions">
				<button type="button" onClick={onCompile} disabled={deck.value.length === 0}>
					Compile
				</button>
				<button type="button" onClick={clearDeck} disabled={deck.value.length === 0}>
					Clear
				</button>
			</div>
		</section>
	);
}
