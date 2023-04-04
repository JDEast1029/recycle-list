import { RectItem, ItemDataType, ListStrategy } from './types';
import { PLACEHOLDER_HEIGHT } from '../constants';
import BasicListManage from './basic-list-manage';

export class VerticalListManage extends BasicListManage implements ListStrategy {
	protected cachedFirstVisibleIndexes: number[] = []; // 存储上次获取的firstVisibleIndexes

	protected cachedScrollTop: number = 0; // 存储上次获取的scrollTop

	public createData(dataSource: any[], options: object): ItemDataType[][] {
		let { outsideCount = 0, cols = 1 } = this.props;
		outsideCount *= cols;
		const direction = options.scrollTop >= this.cachedScrollTop ? 'down' : 'up';
		const firstViewIndexArray = this.getFirstVisibleIndexes(options, direction);
		const startIndexArray = firstViewIndexArray.map((it) => Math.max(0, it - outsideCount));
		const lastVisibleIndexes = this.getLastVisibleIndexes(firstViewIndexArray, options);

		this.cachedScrollTop = options.scrollTop;

		const endIndexArray = lastVisibleIndexes.map((end, index) => {
			return firstViewIndexArray[index] - outsideCount < 0 ? end + outsideCount : end + outsideCount;
		});
		let start = Math.min(...startIndexArray);
		let end = Math.min(this.length - 1, Math.max(...endIndexArray));

		// console.log(startIndexArray, endIndexArray);
		// console.log(start, end + 1);

		let data = Array.from({ length: this.props.cols }, () => []);
		return this.rectList.slice(start, end + 1).reduce((pre, cur, i) => {
			pre[cur.colIndex].push({
				...dataSource[start + i],
				$rl_originIndex: start + i,
				$rl_offsetTop: cur?.offsetTop ?? 0,
				$rl_height: cur?.height ?? 0,
				$rl_colIndex: cur?.colIndex ?? 0
			});
			return pre;
		}, data);
	}

	public updateRectList(dataSource: any[]) {
		const needAddLength = dataSource.length - this.length;
		if (needAddLength < 0) {
			this.rectList.splice(needAddLength);
			this.calcTotalHeight();
		} else if (needAddLength > 0) {
			this.appendEmptyItems(this.length, needAddLength);
		}
	}

	public updateItem(index: number, rectItem: RectItem) {
		const { cols } = this.props;
		const originHeight = this.rectList[index] ? this.rectList[index].height : 0;

		this.rectList[index] = {
			height: rectItem.height,
			offsetTop: this.rectList[index] ? this.rectList[index].offsetTop : 0,
			colIndex: this.rectList[index] ? this.rectList[index].colIndex : 0
		};
		if (index < this.length && originHeight !== rectItem.height) {
			this.reCalcOffsetTop(index, rectItem.height);
		}
		this.calcTotalHeight();
	}

	protected getFirstVisibleIndexes(options: object, direction: 'up' | 'down'): number[] {
		const { scrollTop, headerHeight, containerHeight, contentHeight } = options;
		let firstVisibleIndexes = Array.from({ length: this.props.cols }, () => 0);
		const visibleTop = scrollTop;
		const visibleBottom = scrollTop + containerHeight;
		let visibleCount = 0;

		if (direction === 'down') {
			let startIndex = this.cachedFirstVisibleIndexes.length ? Math.min(...this.cachedFirstVisibleIndexes) : 0;
			for (let i = startIndex; i < this.length && visibleCount < this.props.cols; i++) {
				const rect = this.rectList[i];
				const bottom = headerHeight + rect.offsetTop + rect.height;
				if (bottom > visibleTop) {
					const colIndex = rect.colIndex;
					firstVisibleIndexes[colIndex] = i;
					visibleCount++;
				}
			}
		} else {
			let startIndex = Math.max(0, ...this.cachedFirstVisibleIndexes);
			for (let i = startIndex; i >= 0 && visibleCount < this.props.cols; i--) {
				const rect = this.rectList[i];
				const top = headerHeight + rect.offsetTop;
				const colIndex = rect.colIndex;
				if (top <= visibleTop && firstVisibleIndexes[colIndex] === 0) {
					firstVisibleIndexes[colIndex] = i;
					visibleCount++;
				}
			}
		}

		this.cachedFirstVisibleIndexes = firstVisibleIndexes;
		return firstVisibleIndexes;
	}

	// 每列撑满视图的最后一个索引
	protected getLastVisibleIndexes(indexes: number[], options: object): number[] {
		const { containerHeight, scrollTop, headerHeight } = options;
		const lastVisibleIndexes = new Array(indexes.length);
		const visibleBottom = scrollTop + containerHeight;

		for (let i = 0; i < indexes.length; i++) {
			let index = indexes[i];
			if (index >= this.rectList.length) {
				lastVisibleIndexes[i] = this.rectList.length - 1;
				// eslint-disable-next-line no-continue
				continue;
			}
			let bottom = this.rectList[index].offsetTop + this.rectList[index].height;
			while (bottom < visibleBottom && index < this.length - 1) {
				index++;
				if (this.rectList[index].colIndex === i) {
					bottom = this.rectList[index].offsetTop + this.rectList[index].height + headerHeight;
				}
			}
			lastVisibleIndexes[i] = index;
		}
		return lastVisibleIndexes;
	}

	protected getPrevItemInShortColumn(end: number): RectItem {
		let { cols } = this.props;
		let colsHeightArray = Array.from({ length: this.props.cols }, () => ({ height: -1, item: null }));
		let index = 0;

		while (index <= end && colsHeightArray.some((it) => it.height === -1)) {
			const { offsetTop = 0, height = 0, colIndex = 0 } = this.rectList[end - index] || {};
			if (colsHeightArray[colIndex].height === -1) {
				colsHeightArray[colIndex].height = offsetTop + height;
				colsHeightArray[colIndex].item = this.rectList[end - index];
			}
			index++;
		}

		if (end + 1 < cols) {
			return { offsetTop: 0, height: 0, colIndex: end + 1 };
		} else {
			const shortCol = colsHeightArray.reduce((pre, cur) => {
				if (pre && pre.height <= cur.height) return pre;
				return cur;
			}, null);
			return shortCol.item;
		}
	}

	protected reCalcOffsetTop(start: number, height: number) {
		for (let i = start; i < this.length; i++) {
			const { offsetTop: prevOffsetTop = 0, height: prevHeight = 0, colIndex: prevColIndex = 0 } = this.getPrevItemInShortColumn(i - 1) || {};
			this.rectList[i] = {
				...this.rectList[i],
				offsetTop: prevOffsetTop + prevHeight,
				colIndex: prevColIndex
			};
		}
	}

	protected appendEmptyItems(start: number, end: number) {
		for (let i = start; i < start + end; i++) {
			this.updateItem(i, { height: PLACEHOLDER_HEIGHT });
		}
	}

	protected calcTotalHeight() {
		let colsHeightArray = Array.from({ length: this.props.cols }, () => -1);
		let index = 0;
		while (index < this.length && colsHeightArray.some((it) => it === -1)) {
			const { offsetTop = 0, height = 0, colIndex = 0 } = this.rectList[this.length - 1 - index] || {};
			if (colsHeightArray[colIndex] === -1) {
				colsHeightArray[colIndex] = offsetTop + height;
			}
			index++;
		}

		this.totalHeight = Math.max(...colsHeightArray);
	}
}
