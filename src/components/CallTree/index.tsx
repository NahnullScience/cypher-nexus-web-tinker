import { compiledResult } from '../../state/deck';
import './style.css';

/**
 * "result parsing tree" in the wireframe - bottom-right, biggest panel. Deliberately dumb
 * right now (pretty-printed JSON) so we can see real data flowing before investing in the
 * SVG tree layout. Also the panel that swaps to the InvokingTracer call-chain view once
 * that's wired on the mod side (see AstCallNode in types/ast.ts).
 */
export function CallTree() {
	return (
		<section class="panel tree">
			<h2>Call Tree</h2>
			{compiledResult.value ? (
				<pre class="tree-json">{JSON.stringify(compiledResult.value, null, 2)}</pre>
			) : (
				<p class="placeholder">build a deck and hit "Compile" to see its shape</p>
			)}
		</section>
	);
}
