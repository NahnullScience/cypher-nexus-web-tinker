// Mirrors AstModels.kt in the cypher_nexus mod 1:1. Keep these two files in sync by hand -
// there's no shared schema/codegen between the Kotlin and TS sides yet, so if a field is
// renamed on one side, it silently breaks here instead of failing to compile. What *is*
// enforced at runtime is EXPECTED_API_VERSION in lib/api.ts against DEVTOOLS_API_VERSION
// on the mod side - see checkApiMeta() in lib/bootstrap.ts.

export interface AstCypherRef {
	id: string; // "modid:path" - stable key, round-trips back to the server
	label: string;
	category: string;
	categoryColor: number; // ARGB int, same as CypherCategory.color
	manaDrain: number;
	draw: number;
	delay: number;
	recharge: number;
}

export interface AstPaletteEntry {
	cypher: AstCypherRef;
	hidden: boolean;
}

export interface AstContribution {
	cypher: AstCypherRef;
	count: number;
}

/**
 * `count`: untriggered projectiles are collapsed into a cypher->count map on the mod side
 * (e.g. 8x snowball is one edge with count 8, not 8 edges), so this can be >1. Triggered
 * edges (payload != null) always have count 1 - each one owns a distinct subtree.
 */
export interface AstProjectileEdge {
	cypher: AstCypherRef;
	trigger: string;
	count: number;
	payload: AstChunk | null;
}

/** the "compiled result" tree - what POST /api/ast returns. final delay/recharge/attribute cumulation per chunk. */
export interface AstChunk {
	delay: number;
	recharge: number;
	contributors: AstContribution[];
	projectiles: AstProjectileEdge[];
}

/**
 * the causal "call chain" - who invoked whom, in order, including copies (Proteus, DivideBy,
 * the Greek letters, CypherDuplication) that the compiled AstChunk collapses away entirely.
 * What POST /api/call-chain returns. This is the "result parsing tree" panel's real target
 * per our design discussion, not AstChunk.
 */
export interface AstCallNode {
	cypher: AstCypherRef;
	isCopy: boolean;
	children: AstCallNode[];
}

/** GET /api/meta - fetched once at startup and checked before anything else is trusted */
export interface AstApiMeta {
	apiVersion: number;
	modVersion: string;
	cypherCount: number;
}
