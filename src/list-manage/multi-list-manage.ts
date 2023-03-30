import { RectItem, ListStrategy } from './types';
import { PLACEHOLDER_HEIGHT } from "../constants";
import BasicListManage from './basic-list-manage';

export class MultiListManage extends BasicListManage implements ListStrategy {
	// 每一列中第一个进入视图的索引
	private prevFirstInViewIndexArray: number[] = [];

	public createData(dataSource: any[], options: object) {
		let { outsideCount = 0, cols = 1 } = this.props;
		outsideCount *= cols;
		const firstViewIndexArray = this.getColumnFirstInViewIndex(options);
		const startIndexArray = firstViewIndexArray.map((it) => Math.max(0, it - outsideCount));
		let endIndexArray = this.getColumnEndIndex(firstViewIndexArray, options);
		endIndexArray = endIndexArray.map((end, index) => {
			return firstViewIndexArray[index] - outsideCount < 0 ? end + outsideCount : end + 2 * outsideCount;
		});
		let start = Math.min(...startIndexArray);
		let end = Math.max(...endIndexArray);

		let data = Array.from({ length: this.props.cols }, () => ([]));
		return this.rectList.slice(start, end + 1).reduce((pre, cur, i) => {
			pre[cur.colIndex].push({
				...dataSource[start + i],
				$rl_originIndex: start + i,
				$rl_offsetTop: cur?.offsetTop ?? 0,
				$rl_height: cur?.height ?? 0,
				$rl_colIndex: cur?.colIndex ?? 0,
			});
			return pre;
		}, data);
	}

	public updateRectList(dataSource) {
		const needAddLength = dataSource.length - this.length;
		if (needAddLength < 0) {
			this.rectList.splice(needAddLength);
			this.calcTotalHeight();
		} else if (needAddLength > 0) {
			this.appendEmptyItems(this.length, needAddLength);
		}
	}

	public updateItem(index, rectItem) {
		const { cols } = this.props;
		const originHeight = this.rectList[index] ? this.rectList[index].height : 0;

		this.rectList[index] = {
			height: rectItem.height,
			offsetTop: this.rectList[index] ? this.rectList[index].offsetTop : 0,
			colIndex: this.rectList[index] ? this.rectList[index].colIndex : 0,
		};
		if (index < this.length && originHeight !== rectItem.height) {
			this.reCalcOffsetTop(index, rectItem.height);
		}
		this.calcTotalHeight();
	}

	private getColumnFirstInViewIndex(options: object) {
		if (this.prevFirstInViewIndexArray.length < this.props.cols) {
			this.prevFirstInViewIndexArray = Array.from({ length: this.props.cols }, () => -1);
		}
		const { scrollTop, containerHeight, contentHeight } = options;
		for (let colI = 0; colI < this.props.cols; colI++) {
			for (let i = 0; i < this.length - 1; i++) {
				const { offsetTop = 0, height = 0, colIndex = 0 } = this.rectList[i] || {};
				if (colI !== colIndex) {
					// eslint-disable-next-line no-continue
					continue;
				}
				// 第一种情况：item在顶部视图可见
				// 第二种情况：item在顶部视图不可见，但后面item已经不够撑满容器了， 
				if ((offsetTop <= scrollTop && offsetTop + height > scrollTop)
					|| (offsetTop + height < scrollTop && offsetTop + height + containerHeight >= contentHeight)
				) {
					this.prevFirstInViewIndexArray[colIndex] = i;
					break;
				}
			}
		}

		// 避免直接返回0，通过记录上一次的index，当条件不足时应当沿用上一次的index
		return this.prevFirstInViewIndexArray;
	}

	// 计算撑满视图需要渲染的条数
	private getColumnEndIndex(indexArray: number[], options: object) {
		const { containerHeight, scrollTop } = options;
		let endIndexArray = Array.from({ length: this.props.cols }, () => 1);
		for (let i = 0; i < indexArray.length; i++) {
			let index = indexArray[i];
			const { offsetTop = 0, height = 0, colIndex = 0 } = this.rectList[index] || {};
			let renderHeight = height - (scrollTop - offsetTop);
			index++;
			while (renderHeight <= containerHeight && index < this.length) {
				if (this.rectList[index].colIndex === i) {
					renderHeight += this.rectList[index].height;
					endIndexArray[i] = index;
				}
				index++;
			}
		}
		return endIndexArray;
	}

	private getPrevItemInShortColumn(end) {
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

	private reCalcOffsetTop(start, height) {
		for (let i = start; i < this.length; i++) {
			const { offsetTop: prevOffsetTop = 0, height: prevHeight = 0, colIndex: prevColIndex = 0 } = this.getPrevItemInShortColumn(i - 1) || {};
			this.rectList[i] = {
				...this.rectList[i],
				offsetTop: prevOffsetTop + prevHeight,
				colIndex: prevColIndex
			};
		}
	}

	private appendEmptyItems(start, end) {
		for (let i = start; i < start + end; i++) {
			this.updateItem(i, { height: PLACEHOLDER_HEIGHT });
		}
	}

	private calcTotalHeight() {
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