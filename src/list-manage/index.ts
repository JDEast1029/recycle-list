import type { CoreProps, ListStrategy, RectItem, ItemDataType, CreateDataOptions } from './types';
import { VerticalListManage } from './vertical-list-manage';
import { ReverseVerticalListManage } from './reverse-vertical-list-manage';

export class ListManage {
	private listManage: ListStrategy;

	constructor(props: CoreProps) {
		if (props.reverse) {
			this.listManage = new ReverseVerticalListManage(props);
		} else {
			this.listManage = new VerticalListManage(props);
		}
	}

	public setListManage(listManage: ListStrategy) {
		this.listManage = listManage;
	}

	checkListManage() {
		if (!this.listManage) {
			throw new Error('请设置ListStrategy： setListManage(ListStrategy)');
		}
	}

	get totalHeight() {
		this.checkListManage();
		return this.listManage.totalHeight;
	}

	public createData(dataSource: any[], options: CreateDataOptions): ItemDataType[][] {
		this.checkListManage();
		return this.listManage.createData(dataSource, options);
	}

	public updateData(dataSource: any[]) {
		this.checkListManage();
		this.listManage.updateRectList(dataSource);
	}

	public updateItem(index: number, rectItem: RectItem) {
		this.checkListManage();
		this.listManage.updateItem(index, rectItem);
	}

	public findByIndex(index: number): RectItem {
		return this.listManage.findByIndex(index);
	}
}
