import { ref } from 'vue';

let MIN_DISTANCE = 10;
const getDirection = (x, y) => {
	if (x > y && x > MIN_DISTANCE) {
		return 'horizontal';
	}
	if (y > x && y > MIN_DISTANCE) {
		return 'vertical';
	}
	return '';
};

export const useGesture = () => {
	let direction = ref('');
	let deltaX = 0;
	let deltaY = 0;
	let offsetX = ref(0);
	let offsetY = ref(0);
	let startX = 0;
	let startY = 0;

	const resetTouchStatus = () => {
		direction.value = '';
		deltaX = 0;
		deltaY = 0;
		offsetX.value = 0;
		offsetY.value = 0;
	};
	const touchStart = (event) => {
		let touch = event.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
	};
	const touchMove = (event) => {
		let touch = event.touches[0];
		deltaX = touch.clientX - startX;
		deltaY = touch.clientY - startY;
		offsetX.value = Math.abs(deltaX);
		offsetY.value = Math.abs(deltaY);
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