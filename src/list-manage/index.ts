import { ListStrategy } from './types';

export class ListManage {
	private listManage: ListStrategy;

	constructor(listManage: ListStrategy) {
		this.listManage = listManage;
	}

	public setListManage(listManage: ListStrategy) {
		this.listManage = listManage;
	}

	public createData(dataSource: any[], force = false) {
		return this.createData(dataSource, force);
	}

	public updateData(dataSource: any[]) {
		this.listManage.updateRectList(dataSource);
	}

	public updateItem(index, rectItem) {
		this.listManage.updateItem(index, rectItem);
	}
}