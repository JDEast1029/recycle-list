<template>
	<div 
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
			<slot 
				v-for="(item, itemIndex) in dataSource[index]"
				:key="item[rowKey]"
				:row="item"
				:index="itemIndex"
				:col-index="index"
			/>
		</div>
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
	horizontal: Boolean,
	reverse: Boolean,
	offsetHeight: {
		type: Number,
		default: 0
	},
});

const colsOffsetHeight = computed(() => {
	let offsetArray = [];
	for (let i = 0; i < props.dataSource.length; i++) {
		const columns = props.dataSource[i] || [];
		let startIndex = props.reverse ? columns.length - 1 : 0;
		offsetArray[i] = Math.max(0, (columns[startIndex].$rl_offsetTop || 0) - props.offsetHeight);
	}
	return [0, 0, 0]; // offsetArray;
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