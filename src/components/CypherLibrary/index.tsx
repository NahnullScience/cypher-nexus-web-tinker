import { categories, palette } from '../../state/deck';
import './style.css';

/**
 * Palette panel (left, full height in the wireframe). For now: proves the API
 * round-trip and lists what's registered. Category tabs + drag source + icons
 * are the next round, once we settle on visuals.
 */
export function CypherLibrary() {
	return (
		<section class="panel library">
			<h2>Cyphers Library</h2>
			<p class="placeholder">
				{palette.value.length} cyphers across {categories.value.length} categories
			</p>
			<ul class="library-list">
				{palette.value
					.filter((entry) => !entry.hidden)
					.map((entry) => (
						<li key={entry.cypher.id}>{entry.cypher.label}</li>
					))}
			</ul>
		</section>
	);
}
