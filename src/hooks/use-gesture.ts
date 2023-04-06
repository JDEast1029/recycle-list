import { ref } from 'vue';

let MIN_DISTANCE = 10;
const getDirection = (x: number, y: number): string => {
	if (Math.abs(x) > Math.abs(y) && Math.abs(x) > MIN_DISTANCE) {
		if (x > 0) {
			return 'right';
		}
		return 'left';
	}
	if (Math.abs(y) > Math.abs(x) && Math.abs(y) > MIN_DISTANCE) {
		if (y > 0) {
			return 'down';
		}
		return 'up';
	}
	return '';
};

export const useGesture = () => {
	let direction = ref('');
	let offsetX = ref(0);
	let offsetY = ref(0);
	let startX = 0;
	let startY = 0;

	const resetTouchStatus = (event?: TouchEvent) => {
		direction.value = '';
		offsetX.value = 0;
		offsetY.value = 0;
	};
	const touchStart = (event: TouchEvent) => {
		let touch = event.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
	};
	const touchMove = (event: TouchEvent) => {
		let touch = event.touches[0];
		offsetX.value = touch.clientX - startX;
		offsetY.value = touch.clientY - startY;
		direction.value = direction.value || getDirection(offsetX.value, offsetY.value);
	};

	return {
		direction,
		touchStart,
		touchMove,
		resetTouchStatus,
		offsetX,
		offsetY
	};
};
