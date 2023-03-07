export const PLACEHOLDER_HEIGHT = 90;
export const PLACEHOLDER_COUNT = 8; // 没有数据是placeholderItem的个数，占满全屏
export const DEFAULT_RENDER_COUNT = 10; // 渲染条数

export const PULL_DOWN_STATUS = {
	PULL_DOWN: 1, // 下拉
	RELEASABLE: 2, // 可释放的
	RELEASED: 3, // 释放后(获取数据)
};

export const createPlaceholderData = (count: number, rowKey: 'id', startIndex = 0) => {
	return Array.from(
		{ length: count },
		(it, index) => ({ [rowKey]: index, _isPlaceholder: true, originIndex: startIndex + index })
	);
};