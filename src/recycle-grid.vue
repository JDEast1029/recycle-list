<template>
	<div :style="{ 'column-gap': `${columnGap}px` }" :class="{ 'is-horizontal': horizontal }" class="rl-multi-grid">
		<div v-for="(col, index) in cols" :key="`$rl_col_${index}`" class="rl-multi-grid__col">
			<div v-if="!reverse" :style="{ height: `${colsOffsetHeight[index]}px` }" />
			<div v-if="reverse" :style="{ height: `${colsReverseTopOffsetHeight[index]}px` }" />
			<slot
				v-for="(item, itemIndex) in dataSource[index]"
				:key="item[rowKey]"
				:row="item"
				:index="itemIndex"
				:col-index="index"
			/>
			<div v-if="reverse" :style="{ height: `${colsReverseBottomOffsetHeight[index]}px` }" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ItemType } from './list-manage/types';

const props = defineProps({
	dataSource: {
		type: Array<ItemType[]>,
		default: () => []
	},
	rowKey: {
		type: String,
		default: 'id'
	},
	cols: {
		type: Number,
		default: 1
	},
	columnGap: {
		type: Number,
		default: 0
	},
	rowGap: {
		type: Number,
		default: 0
	},
	horizontal: Boolean,
	reverse: Boolean,
	offsetHeight: {
		type: Number,
		default: 0
	}
});

const colsOffsetHeight = computed(() => {
	if (props.cols === 1) return [0];
	let offsetArray = [];
	for (let i = 0; i < props.dataSource.length; i++) {
		const columns = props.dataSource[i] || [];
		offsetArray[i] = Math.max(0, (columns[0].$rl_offsetTop || 0) - props.offsetHeight);
	}
	return offsetArray;
});

const colsReverseTopOffsetHeight = computed(() => {
	let offsetArray = [];
	for (let i = 0; i < props.dataSource.length; i++) {
		const columns = props.dataSource[i] || [];
		offsetArray[i] = columns[0].$rl_offsetTop + columns[0].$rl_height || 0;
	}
	let max = Math.max(...offsetArray);
	return offsetArray.map((it) => max - it);
});
const colsReverseBottomOffsetHeight = computed(() => {
	const translateHeight = props.dataSource.reduce((pre, cur) => {
		let startIndex = cur.length - 1;
		const colOffsetTop = cur[startIndex] ? cur[startIndex].$rl_offsetTop || 0 : 0;
		if (pre === -1) return colOffsetTop;
		return Math.min(pre, colOffsetTop);
	}, -1);
	let offsetArray = [];
	for (let i = 0; i < props.dataSource.length; i++) {
		const columns = props.dataSource[i] || [];
		let startIndex = columns.length - 1;
		offsetArray[i] = Math.max(0, (columns[startIndex].$rl_offsetTop || 0) - translateHeight);
	}
	return offsetArray;
});
</script>

<style lang="less">
.rl-single-grid {
	position: relative;
}
.rl-multi-grid {
	position: relative;
	display: flex;
	&__col {
		flex: 1;
	}
	&.is-horizontal {
	}
}
</style>
