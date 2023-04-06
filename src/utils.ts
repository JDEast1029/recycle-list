import { PLACEHOLDER_HEIGHT } from './constants';
import type { AnyFunction } from './types';
import type { PlaceholderItemType } from './list-manage/types';

export const createPlaceholderData = (count: number, rowKey: string = 'id'): PlaceholderItemType[] => {
	return Array.from({ length: count }, (it: any, index: number) => ({
		[rowKey]: index,
		$rl_placeholder: true,
		$rl_originIndex: index,
		$rl_offsetTop: 0,
		$rl_height: PLACEHOLDER_HEIGHT
	}));
};

export const smoothScrollTo = (container: HTMLElement, targetScrollTop: number) => {
	const currentScrollTop = container.scrollTop;
	const distance = targetScrollTop - currentScrollTop;
	const duration = 500; // 滚动时长，单位毫秒
	let startTime: number | null = null;

	function step(timestamp: number) {
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

export const throttleAnimationFrame = (fn: AnyFunction) => {
	let dataTicking = false;
	return function (...args: unknown[]) {
		if (!dataTicking) {
			window.requestAnimationFrame(() => {
				fn(...args);
				dataTicking = false;
			});
			dataTicking = true;
		}
	};
};
