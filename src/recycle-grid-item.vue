<template>
	<div 
		v-if="parentProps.cols > 1"
		:style="{ 'grid-row-start': gridRowStart, 'grid-row-end': gridRowEnd }"
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
	gridRowStart: Number,
	gridRowEnd: Number,
	// gridColumnStart: Number,
	// gridColumnEnd: Number,
});

const parentProps = inject('parentProps');
</script>

<style lang="less">
.rl-grid-item {
	&.is-horizontal {
		// grid-column-start: auto;
		// grid-row-start: unset;
	} 
}
</style>