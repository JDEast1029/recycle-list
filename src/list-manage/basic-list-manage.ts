import { RectItem } from './types';
export default class BasicListManage {
	rectList: RectItem[] = [];

	totalHeight: number = 0;

	props: object = {};

	constructor(props: object) {
		this.props = props;
	}

	get length() {
		return this.rectList.length;
	}

	findByIndex(index: number): RectItem {
		return this.rectList[index] || { offsetTop: 0, height: 0 };
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
