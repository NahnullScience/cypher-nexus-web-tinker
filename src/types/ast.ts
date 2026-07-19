// Mirrors AstModel.kt in the cypher_nexus mod 1:1. Keep these two files in sync by hand -
// there's no shared schema/codegen between the Kotlin and TS sides yet, so if a field is
// renamed on one side, it silently breaks here instead of failing to compile.

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

export interface AstProjectileEdge {
	cypher: AstCypherRef;
	trigger: string;
	payload: AstChunk | null;
}

/** the "compiled result" tree - what GET /api/ast returns today */
export interface AstChunk {
	delay: number;
	recharge: number;
	contributors: AstContribution[];
	projectiles: AstProjectileEdge[];
}

/**
 * the "call chain" tree from InvokingTracer - what the "result parsing tree" panel is
 * actually meant to show per our design discussion. Placeholder shape: finalize once
 * InvokingTracer / CallTreeTracer ships on the mod side and firms up the real JSON.
 */
export interface AstCallNode {
	cypher: AstCypherRef;
	isCopy: boolean;
	children: AstCallNode[];
}
