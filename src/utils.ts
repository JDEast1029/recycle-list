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