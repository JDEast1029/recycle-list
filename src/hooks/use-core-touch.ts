import { useGesture } from './use-gesture';

export const useCoreTouch = (options) => {
	const { scrollTop, contentHeight, containerHeight, reverse } = options || {};
	const { touchMove, touchStart, resetTouchStatus, direction } = useGesture();

	let inScrollMove = false;
	const handleTouchStart = (e: TouchEvent) => {
		inScrollMove = reverse ? scrollTop.value < contentHeight.value - containerHeight.value : scrollTop.value > 0;
		touchStart(e);
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (inScrollMove) {
			e.stopPropagation();
		}
		touchMove(e);
		if (direction.value === 'down' && scrollTop.value === 0) {
			e.preventDefault();
			inScrollMove && e.stopPropagation();
		} else if (direction.value === 'up' && scrollTop.value === contentHeight.value - containerHeight.value) {
			e.preventDefault();
			inScrollMove && e.stopPropagation();
		}
	};

	const handleTouchEnd = (e: TouchEvent) => {
		resetTouchStatus();
		inScrollMove = false;
	};

	return {
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd
	};
};
