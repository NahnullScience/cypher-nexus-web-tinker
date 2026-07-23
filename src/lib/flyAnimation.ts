/**
 * A small non-reactive registry mapping deck slot index -> its DOM element, populated by
 * WandEditor's slot ref callbacks. Exists because the right-click "fly" gesture starts in
 * CypherLibrary and needs to know where a sibling component's slot actually is on screen -
 * there's no other cheap way to bridge that without threading refs through props/context
 * for something this occasional.
 */
const slotElements = new Map<number, HTMLElement>();

export function registerSlotElement(index: number, element: HTMLElement | null) {
	if (element) slotElements.set(index, element);
	else slotElements.delete(index);
}

export function getSlotElement(index: number): HTMLElement | undefined {
	return slotElements.get(index);
}

const flyAnimationDuration = 260

/**
 * Purely cosmetic: clones `fromEl`, animates the clone from its current screen position to
 * `toEl`'s, then removes it. Deliberately never touches deck state - callers update state
 * first (see CypherLibrary's context-menu handler) and this just plays on top of that, so a
 * dropped frame or an interrupted animation can never leave the actual deck out of sync with
 * what's on screen.
 */
export function flyToSlot(fromEl: HTMLElement, toEl: HTMLElement) {
	const fromRect = fromEl.getBoundingClientRect();
	const toRect = toEl.getBoundingClientRect();

	const ghost = fromEl.cloneNode(true) as HTMLElement;
	Object.assign(ghost.style, {
		position: 'fixed',
		left: `${fromRect.left}px`,
		top: `${fromRect.top}px`,
		width: `${fromRect.width}px`,
		height: `${fromRect.height}px`,
		margin: '0',
		pointerEvents: 'none',
		zIndex: '9999',
		transition: `transform ${flyAnimationDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${flyAnimationDuration}ms ease`,
	});
	document.body.appendChild(ghost);

	// Force a reflow so the browser commits the initial layout frame before applying transforms
	void ghost.offsetWidth;

	const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
	const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
	const scale = Math.min(toRect.width / fromRect.width, toRect.height / fromRect.height);

	requestAnimationFrame(() => {
		ghost.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
		ghost.style.opacity = '0.35';
	});

	let cleanedUp = false;
	const cleanup = () => {
		if (!cleanedUp) {
			cleanedUp = true;
			ghost.remove();
		}
	};

	// Clean up on transition completion or cancellation
	ghost.addEventListener('transitionend', cleanup, { once: true });
	ghost.addEventListener('transitioncancel', cleanup, { once: true });

	// Safety fallback timeout (animation duration 260ms + safety buffer)
	setTimeout(cleanup, flyAnimationDuration + 100);
}
