import { useGesture } from './use-gesture';

export const useCoreTouch = (scrollTop) => {
	const { touchMove, touchStart, resetTouchStatus, direction } = useGesture();

	let inScrollMove = false;
	const handleTouchStart = (e) => {
		inScrollMove = scrollTop.value > 0;
		touchStart(e);
	};

	const handleTouchMove = (e) => {
		if (scrollTop.value > 0) {
			e.stopPropagation();
		}
		touchMove(e);
		if (direction.value === 'down' && scrollTop.value === 0) {
			e.preventDefault();
			inScrollMove && e.stopPropagation();
		}
	};

	const handleTouchEnd = (e) => {
		resetTouchStatus();
		inScrollMove = false;
	};

	return {
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd
	};
};