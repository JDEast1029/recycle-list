import { ListStrategy } from './types';

export class ListManage {
	private listManage: ListStrategy;

	constructor(listManage?: ListStrategy) {
		if (listManage) {
			this.listManage = listManage;
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

	public createData(dataSource: any[], options = object): any[] {
		this.checkListManage();
		return this.listManage.createData(dataSource, options);
	}

	public updateData(dataSource: any[]) {
		this.checkListManage();
		this.listManage.updateRectList(dataSource);
	}

	public updateItem(index, rectItem) {
		this.checkListManage();
		this.listManage.updateItem(index, rectItem);
	}
}