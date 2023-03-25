<template>
	<div 
		v-if="cols > 1"
		:style="{ 
			'grid-row-gap': `${rowGap}px`, 
			'grid-column-gap': `${columnGap}px`,
			'grid-template-columns': `repeat(${cols}, 1fr)`
		}"
		:class="{ 'is-horizontal': horizontal }"
		class="rl-multi-grid"
	>
		<slot />
	</div>
	<slot v-else />
</template>

<script setup>
import { provide, readonly } from 'vue';

const props = defineProps({
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

provide('parentProps', readonly({
	cols: props.cols,
	horizontal: props.horizontal,
}));
</script>

<style lang="less">
.rl-multi-grid {
	display: grid;
	&.is-horizontal {
		grid-auto-flow: column; // 放置顺序是"先列后行"
	}
}
</style>