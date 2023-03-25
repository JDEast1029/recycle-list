import { RectItem, ListStrategy } from './types';
import { PLACEHOLDER_HEIGHT } from "../constants";
import BasicListManage from './basic-list-manage';

export class SingleListManage extends BasicListManage implements ListStrategy {
	private prevFirstInViewIndex: number = 0;

	createData(dataSource: any[], force = false) {
		const index = this.getFirstInViewIndex();
		const startIndex = Math.max(0, index - props.outsideCount);
		const renderCount = this.getRenderCount(index);
		let endIndex = startIndex + renderCount;
		endIndex = index - props.outsideCount < 0 ? endIndex + props.outsideCount : endIndex + 2 * props.outsideCount;
		return dataSource.slice(startIndex, endIndex).map((it, i) => {
			return {
				...it,
				$rl_originIndex: startIndex + i,
				$rl_offsetTop: this.rectList[startIndex + i]?.offsetTop ?? 0,
				$rl_height: this.rectList[startIndex + i]?.height ?? 0,
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
			this.reCalcOffsetTop(index, rectItem.height);
		}
		this.calcTotalHeight();
	}

	private getFirstInViewIndex() {
		for (let i = 0; i < this.rectList.length - 1; i++) {
			const { offsetTop = 0, height = 0 } = this.rectList[i] || {};
			// 第一种情况：item在顶部视图可见
			// 第二种情况：item在顶部视图不可见，但后面item已经不够撑满容器了， 
			if ((offsetTop <= scrollTop && offsetTop + height > scrollTop)
				|| (offsetTop + height < scrollTop && offsetTop + height + containerHeight.value >= contentHeight.value)
			) {
				this.prevFirstInViewIndex = i;
				return i;
			}
		}
		// 避免直接返回0，通过记录上一次的index，当条件不足时应当沿用上一次的index
		return this.prevFirstInViewIndex;
	}

	// 计算撑满视图需要渲染的条数
	private getRenderCount(index: number) {
		const { offsetTop = 0, height = 0 } = this.rectList[index] || {};
		let renderHeight = height - (scrollTop - offsetTop);
		let count = 1;
		index++;
		while (renderHeight <= containerHeight.value && index < this.length) {
			renderHeight += this.rectList[index].height;
			index++;
			count++;
		}
		return count;
	}

	private reCalcOffsetTop(startIndex, height) {
		for (let i = startIndex; i < this.rectList.length; i++) {
			const { offsetTop: prevOffsetTop = 0, height: prevHeight = 0 } = this.rectList[i - 1] || {};
			this.rectList[i] = {
				offsetTop: prevOffsetTop + prevHeight,
				height,
			};
		}
	}

	private appendEmptyItems(startIndex, endIndex) {
		for (let i = startIndex; i < startIndex + endIndex; i++) {
			this.updateItem(i, {
				height: this.rectList[i] ? this.rectList[i].height : PLACEHOLDER_HEIGHT
			});
		}
	}

	private calcTotalHeight() {
		const { offsetTop = 0, height = 0 } = this.rectList[this.length - 1] || {};
		this.totalHeight = offsetTop + height;
	}
}