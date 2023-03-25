export type RectItem = {
	height: number,
	offsetTop: number
}

export interface ListStrategy {
	rectList: RectItem[];
	totalHeight: number;
	updateRectList: (dataSource: any[]) => void;
	updateItem: (index: number, rectItem: RectItem) => void;
	createData: (dataSource: any[]) => any[];
}