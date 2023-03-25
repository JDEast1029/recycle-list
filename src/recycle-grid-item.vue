<template>
	<div 
		v-if="parentProps.cols > 1"
		:style="{ 'grid-row-end': `span ${height}` }"
		:class="{ 'is-horizontal': parentProps.horizontal }"
		class="rl-grid-item"
	>
		<slot />
	</div>
	<slot v-else />
</template>

<script setup>
import { inject } from 'vue';

const props = defineProps({
	height: Number
});

const parentProps = inject('parentProps');
</script>

<style lang="less">
.rl-grid-item {
	grid-row-start: auto;
	&.is-horizontal {
		grid-column-start: auto;
		grid-row-start: unset;
	} 
}
</style>