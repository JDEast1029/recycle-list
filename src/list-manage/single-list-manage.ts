import { RectItem, ListStrategy } from './types';
import { PLACEHOLDER_HEIGHT } from "../constants";
import BasicListManage from './basic-list-manage';

export class SingleListManage extends BasicListManage implements ListStrategy {
	private prevFirstInViewIndex: number = 0;

	public createData(dataSource: any[], options: object) {
		const { outsideCount = 0 } = this.props;
		const index = this.getFirstInViewIndex(options);
		const start = Math.max(0, index - outsideCount);
		const renderCount = this.getRenderCount(index, options);
		let end = start + renderCount;
		end = index - outsideCount < 0 ? end + outsideCount : end + 2 * outsideCount;
		return dataSource.slice(start, end).map((it, i) => {
			return {
				...it,
				$rl_originIndex: start + i,
				$rl_offsetTop: this.rectList[start + i]?.offsetTop ?? 0,
				$rl_height: this.rectList[start + i]?.height ?? 0,
			};
		});
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
		const originHeight = this.rectList[index] ? this.rectList[index].height : 0;

		this.rectList[index] = {
			height: rectItem.height,
			offsetTop: this.rectList[index] ? this.rectList[index].offsetTop : 0,
		};
		if (index < this.length && originHeight !== rectItem.height) {
			this.reCalcOffsetTop(index);
		}
		this.calcTotalHeight();
	}

	private getFirstInViewIndex(options: object) {
		const { scrollTop, containerHeight, contentHeight } = options;
		for (let i = 0; i < this.rectList.length - 1; i++) {
			const { offsetTop = 0, height = 0 } = this.rectList[i] || {};
			// 第一种情况：item在顶部视图可见
			// 第二种情况：item在顶部视图不可见，但后面item已经不够撑满容器了， 
			if ((offsetTop <= scrollTop && offsetTop + height > scrollTop)
				|| (offsetTop + height < scrollTop && offsetTop + height + containerHeight >= contentHeight)
			) {
				this.prevFirstInViewIndex = i;
				return i;
			}
		}
		// 避免直接返回0，通过记录上一次的index，当条件不足时应当沿用上一次的index
		return this.prevFirstInViewIndex;
	}

	// 计算撑满视图需要渲染的条数
	private getRenderCount(index: number, options: object) {
		const { containerHeight, scrollTop } = options;
		const { offsetTop = 0, height = 0 } = this.rectList[index] || {};
		let renderHeight = height - (scrollTop - offsetTop);
		let count = 1;
		index++;
		while (renderHeight <= containerHeight && index < this.length) {
			renderHeight += this.rectList[index].height;
			index++;
			count++;
		}
		return count;
	}

	private reCalcOffsetTop(start) {
		for (let i = start; i < this.rectList.length; i++) {
			const { offsetTop: prevOffsetTop = 0, height: prevHeight = 0 } = this.rectList[i - 1] || {};
			this.rectList[i] = {
				...this.rectList[i],
				offsetTop: prevOffsetTop + prevHeight,
			};
		}
	}

	private appendEmptyItems(start, end) {
		for (let i = start; i < start + end; i++) {
			this.updateItem(i, { height: PLACEHOLDER_HEIGHT });
		}
	}

	private calcTotalHeight() {
		const { offsetTop = 0, height = 0 } = this.rectList[this.length - 1] || {};
		this.totalHeight = offsetTop + height;
	}
}