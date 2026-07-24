import type { AstCallNode } from '../../types/ast';
import { callChain, callChainError } from '../../state/deck';
import './style.css';

/**
 * One call in the chain. Structure is recursive flexbox: this node's box, followed by a
 * column of its children (each of which is this same component again). That nesting is
 * what actually produces the left-to-right tree shape - no manual coordinate/position math
 * anywhere, the browser's flex layout does it. `.ct-icon` is a plain placeholder square for
 * now; swap it for `<img src={iconUrl(node.cypher.id)} />` once /api/icon exists.
 */
function CallTreeNode({ node }: { node: AstCallNode }) {
	return (
		<div class="ct-node">
			<div class={`ct-box ${node.isCopy ? 'is-copy' : ''}`} title={node.cypher.id}>
				<span class="ct-icon" />
				<span class="ct-label">{node.cypher.label}</span>
				{node.isCopy && <span class="ct-copy-badge">copy</span>}
			</div>

			{node.children.length > 0 && (
				<div class="ct-children">
					{node.children.map((child, i) => (
						// index is fine here: this is a freshly-parsed tree re-rendered whole on every
						// compile, not a reorderable list - there's no identity to preserve across renders.
						<div class="ct-child" key={i}>
							<CallTreeNode node={child} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * "result parsing tree" in the wireframe, now actually the call chain per our design
 * discussion: who invoked whom, in order, including copies the compiled AstChunk view
 * collapses away entirely (Proteus, DivideBy, the Greek letters, CypherDuplication).
 */
export function CallTree() {
	return (
		<section class="panel tree">
			<h2>Call Tree</h2>

			{callChainError.value ? (
				<p class="placeholder ct-error">{callChainError.value}</p>
			) : callChain.value === null ? (
				<p class="placeholder">build a deck and hit "Compile" to see its call chain</p>
			) : callChain.value.length === 0 ? (
				<p class="placeholder">compiled to nothing - empty deck, or nothing drawable</p>
			) : (
				<div class="ct-forest">
					{callChain.value.map((root, i) => (
						<CallTreeNode node={root} key={i} />
					))}
				</div>
			)}
		</section>
	);
}
