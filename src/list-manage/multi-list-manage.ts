import { RectItem, ListStrategy } from './types';
import { PLACEHOLDER_HEIGHT } from "../constants";
import BasicListManage from './basic-list-manage';

export class MultiListManage extends BasicListManage implements ListStrategy {
	public createData(dataSource: any[], options: object) {
		let start = 0;
		let end = 10;
		let data = Array.from({ length: this.props.cols }, () => ([]));
		return this.rectList.reduce((pre, cur, i) => {
			pre[cur.colIndex].push({
				...dataSource[start + i],
				$rl_originIndex: start + i,
				$rl_offsetTop: cur?.offsetTop ?? 0,
				$rl_height: cur?.height ?? 0,
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
				if (pre && pre.height < cur.height) return pre;
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