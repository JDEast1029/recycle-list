export const PLACEHOLDER_HEIGHT = 90;
export const PLACEHOLDER_COUNT = 8; // 没有数据是placeholderItem的个数，占满全屏
export const DEFAULT_RENDER_COUNT = 10; // 渲染条数

export const createPlaceholderData = (count: number, rowKey: 'id') => {
	return Array.from(
		{ length: count },
		(it, index) => ({ [rowKey]: index, isPlaceholder: true, originIndex: index })
	);
};