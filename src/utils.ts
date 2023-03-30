import { PLACEHOLDER_HEIGHT } from './constants.ts';

export const createPlaceholderData = (count: number, rowKey: 'id') => {
	return Array.from(
		{ length: count },
		(it, index) => ({
			[rowKey]: index,
			$rl_placeholder: true,
			$rl_originIndex: index,
			$rl_height: PLACEHOLDER_HEIGHT
		})
	);
};

export const smoothScrollTo = (container, targetScrollTop) => {
	const currentScrollTop = container.scrollTop;
	const distance = targetScrollTop - currentScrollTop;
	const duration = 500; // 滚动时长，单位毫秒
	let startTime = null;

	function step(timestamp) {
		if (!startTime) {
			startTime = timestamp;
		}
		const progress = timestamp - startTime;
		const percent = Math.min(progress / duration, 1); // 进度百分比
		const nextScrollTop = currentScrollTop + distance * percent;
		container.scrollTop = nextScrollTop;

		if (percent < 1) {
			requestAnimationFrame(step); // 继续滚动
		}
	}

	requestAnimationFrame(step);
};