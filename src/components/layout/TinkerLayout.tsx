import { CallTree } from '../CallTree';
import { CypherLibrary } from '../CypherLibrary';
import { WandEditor } from '../WandEditor';
import './style.css';

export function TinkerLayout() {
	return (
		<div class="tinker-layout">
			<CypherLibrary />
			<WandEditor />
			<CallTree />
		</div>
	);
}
