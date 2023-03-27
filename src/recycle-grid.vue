<template>
	<div 
		v-if="cols > 1"
		:class="{ 'is-horizontal': horizontal }"
		class="rl-multi-grid"
	>
		<div v-for="(col, index) in cols" :key="`$rl_col_${index}`" class="rl-multi-grid__col">
			<slot v-for="item in dataSource[index]" :key="item[rowKey]" :row="item" />
		</div>
	</div>
	<div v-else class="rl-single-grid">
		<slot v-for="item in dataSource" :key="item[rowKey]" :row="item" />
	</div>
</template>

<script setup>
import { provide, readonly } from 'vue';

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