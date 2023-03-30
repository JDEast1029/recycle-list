<template>
	<div 
		v-if="cols > 1"
		:style="{ 'column-gap': `${columnGap}px`}"
		:class="{ 'is-horizontal': horizontal }"
		class="rl-multi-grid"
	>
		<div 
			v-for="(col, index) in cols"
			:key="`$rl_col_${index}`"
			class="rl-multi-grid__col"
		>
			<div :style="{ height: `${colsOffsetHeight[index]}px` }" />
			<slot v-for="(item, itemIndex) in dataSource[index]" :key="item[rowKey]" :row="item" :index="itemIndex" />
		</div>
	</div>
	<div v-else class="rl-single-grid">
		<slot v-for="item in dataSource" :key="item[rowKey]" :row="item" />
	</div>
</template>

<script setup>
import { provide, readonly, computed } from 'vue';

const props = defineProps({
	dataSource: {
		type: Array,
		default: () => ([])
	},
	rowKey: String,
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
	horizontal: Boolean
});

const colsOffsetHeight = computed(() => {
	const translateHeight = props.dataSource.reduce((pre, cur) => {
		const colOffsetTop = cur[0].$rl_offsetTop || 0;
		if (pre === -1) return colOffsetTop;
		return Math.min(pre, colOffsetTop);
	}, -1);
	let offsetArray = [];
	for (let i = 0; i < props.dataSource.length; i++) {
		const columns = props.dataSource[i] || [];
		offsetArray[i] = Math.max(0, (columns[0].$rl_offsetTop || 0) - translateHeight);
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
		flex: 1
	}
	&.is-horizontal {
	}
}
</style>