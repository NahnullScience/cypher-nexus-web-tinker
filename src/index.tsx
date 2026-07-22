import { render } from 'preact';
import { LocationProvider, Route, Router } from 'preact-iso';

import { Header } from './components/Header';
import { bootstrap } from './lib/bootstrap';
import { Home } from './pages/Home';
import { NotFound } from './pages/_404';
import './style.css';

const BASE_PATH = import.meta.env.BASE_URL;

bootstrap();

export function App() {
	return (
		<LocationProvider scope={BASE_PATH}>
			<Header />
			<main>
				<Router>
					<Route path={BASE_PATH} component={Home} />
					<Route default component={NotFound} />
				</Router>
			</main>
		</LocationProvider>
	);
}

render(<App />, document.getElementById('app')!);
