export const PLACEHOLDER_HEIGHT = 90;
export const PLACEHOLDER_COUNT = 8; // 没有数据是placeholderItem的个数，占满全屏
export const DEFAULT_RENDER_COUNT = 10; // 渲染条数
export const CACHE_ITEM_COUNT = 3; // 在非视图区域缓存的渲染条数, 避免快速滑动时出现空白

export const PULL_DOWN_STATUS = {
	PULL_DOWN: 1, // 下拉
	RELEASABLE: 2, // 可释放的
	RELEASED: 3, // 释放后(获取数据)
};

export const HEADER_ITEM = { _recycleHeader: true, originIndex: 0 };

export const createPlaceholderData = (count: number, rowKey: 'id', startIndex = 0) => {
	return Array.from(
		{ length: count },
		(it, index) => ({
			[rowKey]: index,
			_originIndex: startIndex + index,
			_isPlaceholder: true,
			_height: PLACEHOLDER_HEIGHT
		})
	);
};