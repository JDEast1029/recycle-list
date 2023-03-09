import { useGesture } from './use-gesture';

export const useCoreTouch = (scrollTop) => {
	const { touchMove, touchStart, resetTouchStatus, direction } = useGesture();

	const handleTouchStart = (e) => {
		touchStart(e);
	};

	const handleTouchMove = (e) => {
		if (scrollTop.value > 0) {
			e.stopPropagation();
		}
		touchMove(e);
		if (direction.value === 'down' && scrollTop.value === 0) {
			e.preventDefault();
		}
	};

	const handleTouchEnd = (e) => {
		resetTouchStatus();
	};

	return {
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd
	};
};