export type RectItem = {
	height: number;
	offsetTop: number;
	colIndex: number;
};

export type ItemDataType = {
	$rl_originIndex: number;
	$rl_offsetTop: number;
	$rl_height: number;
	$rl_colIndex: number;
	[key: string]: unknown;
}

export type PlaceholderItemType = {
	$rl_placeholder: boolean;
	$rl_originIndex: number;
	$rl_offsetTop: number;
	$rl_height: number;
	[key: string]: unknown;
}

export type ItemType = ItemDataType | PlaceholderItemType

export type CoreProps = {
	cols: number;
	outsideCount: number;
	reverse?: boolean;
	[key: string]: unknown;
}

export type CreateDataOptions = {
	scrollTop: number;
	headerHeight: number;
	containerHeight: number;
	contentHeight: number;
}

export type ScrollDirection = 'up' | 'down';


export interface ListStrategy {
	rectList: RectItem[];
	totalHeight: number;
	updateRectList: (dataSource: any[]) => void;
	updateItem: (index: number, rectItem: RectItem) => void;
	createData: (dataSource: any[], options: CreateDataOptions) => any[];
	findByIndex: (index: number) => RectItem;
}