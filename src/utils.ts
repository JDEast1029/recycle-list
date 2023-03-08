import { PLACEHOLDER_HEIGHT } from './constants.ts';

export const createPlaceholderData = (count: number, rowKey: 'id') => {
	return Array.from(
		{ length: count },
		(it, index) => ({
			[rowKey]: index,
			options: { placeholder: true },
			_originIndex: index,
			_height: PLACEHOLDER_HEIGHT
		})
	);
};