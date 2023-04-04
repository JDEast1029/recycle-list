export type AnyFunction = (...args: any[]) => any

export type DefaultFetchResultType = {
	data: {
		list: object[],
		page: {
			current: number,
			total: number,
			count: number
		}
	}
}