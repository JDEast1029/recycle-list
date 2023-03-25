import { PLACEHOLDER_HEIGHT } from "../constants";

export class RectListManage {
	rectList: [] = [];

	totalHeight: number = 0;

	get length() {
		return this.rectList.length;
	}

	get data() {
		return this.rectList;
	}

	reCalcOffsetTop(startIndex, height) {
		for (let i = startIndex; i < this.rectList.length; i++) {
			const { offsetTop: prevOffsetTop = 0, height: prevHeight = 0 } = this.rectList[i - 1] || {};
			this.rectList[i] = {
				offsetTop: prevOffsetTop + prevHeight,
				height,
			};
		}
	}

	appendEmptyItems(startIndex, endIndex) {
		for (let i = startIndex; i < startIndex + endIndex; i++) {
			this.updateItem(i, {
				height: this.rectList[i] ? this.rectList[i].height : PLACEHOLDER_HEIGHT
			});
		}
	}

	calcTotalHeight() {
		const { offsetTop = 0, height = 0 } = this.rectList[this.length - 1] || {};
		this.totalHeight = offsetTop + height;
	}

	updateRectList(dataSource) {
		const needAddLength = dataSource.length - this.length;
		if (needAddLength < 0) {
			this.rectList.splice(needAddLength);
			this.calcTotalHeight();
		} else if (needAddLength > 0) {
			this.appendEmptyItems(this.length, needAddLength);
		}
	}

	updateItem(index, itemRect) {
		const originHeight = this.rectList[index] ? this.rectList[index].height : 0;

		this.rectList[index] = {
			height: itemRect.height,
			offsetTop: this.rectList[index] ? this.rectList[index].offsetTop : 0,
		};
		if (index < this.length && originHeight !== itemRect.height) {
			this.reCalcOffsetTop(index, itemRect.height);
		}
		this.calcTotalHeight();
	}

	[Symbol.iterator]() {
		let curIndex = 0;
		return {
			next: () => {
				if (curIndex < this.length) {
					const value = this.rectList[curIndex];
					curIndex++;
					return { done: false, value };
				}
				return { done: false };
			}
		};
	}
}