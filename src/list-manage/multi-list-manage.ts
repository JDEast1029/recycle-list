import { RectItem, ListStrategy } from './types';
import { PLACEHOLDER_HEIGHT } from "../constants";
import BasicListManage from './basic-list-manage';

export class MultiListManage extends BasicListManage implements ListStrategy {
	public createData(dataSource: any[], options: object) {

		return dataSource;
	}

	public updateRectList(dataSource) {

	}

	public updateItem(index, rectItem) {

	}
}