import { RectItem, ItemDataType, ListStrategy } from './types';
import { PLACEHOLDER_HEIGHT } from '../constants';
import BasicListManage from './basic-list-manage';
import { VerticalListManage } from './vertical-list-manage';

/**
 * 反转的rectList还是按照顺序加入item，在createData的时候倒序输出
 */
export class ReverseVerticalListManage extends VerticalListManage implements ListStrategy {
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
		// console.log(start, end + 1, options.scrollTop);

		let data = Array.from({ length: this.props.cols }, () => []);
		return this.rectList.slice(start, end + 1).reduce((pre, cur, i) => {
			pre[cur.colIndex].unshift({
				...dataSource[start + i],
				$rl_originIndex: start + i,
				$rl_offsetTop: cur?.offsetTop ?? 0,
				$rl_height: cur?.height ?? 0,
				$rl_colIndex: cur?.colIndex ?? 0
			});
			return pre;
		}, data);
	}

	private getFirstVisibleIndexes(options: object, direction: 'up' | 'down'): number[] {
		const { scrollTop, headerHeight, containerHeight, contentHeight } = options;
		let firstVisibleIndexes = Array.from({ length: this.props.cols }, () => 0);
		const visibleTop = contentHeight - containerHeight - scrollTop;
		let visibleCount = 0;

		if (direction === 'down') {
			let startIndex = Math.max(0, ...this.cachedFirstVisibleIndexes);
			for (let i = startIndex; i >= 0 && visibleCount < this.props.cols; i--) {
				const rect = this.rectList[i];
				const top = rect.offsetTop;
				const colIndex = rect.colIndex;
				if (top <= visibleTop && firstVisibleIndexes[colIndex] === 0) {
					firstVisibleIndexes[colIndex] = i;
					visibleCount++;
				}
			}
		} else {
			let startIndex = this.cachedFirstVisibleIndexes.length ? Math.min(...this.cachedFirstVisibleIndexes) : 0;
			for (let i = startIndex; i < this.length && visibleCount < this.props.cols; i++) {
				const rect = this.rectList[i];
				const bottom = rect.offsetTop + rect.height;
				if (bottom > visibleTop) {
					const colIndex = rect.colIndex;
					firstVisibleIndexes[colIndex] = i;
					visibleCount++;
				}
			}
		}

		// console.log('firstVisibleIndexes', firstVisibleIndexes);
		this.cachedFirstVisibleIndexes = firstVisibleIndexes;
		return firstVisibleIndexes;
	}

	// 每列撑满视图的最后一个索引
	private getLastVisibleIndexes(indexes: number[], options: object): number[] {
		const { contentHeight, containerHeight, scrollTop, headerHeight } = options;
		const lastVisibleIndexes = new Array(indexes.length);
		const visibleBottom = contentHeight - scrollTop;

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
					bottom = this.rectList[index].offsetTop + this.rectList[index].height;
				}
			}
			lastVisibleIndexes[i] = index;
		}
		return lastVisibleIndexes;
	}
}
