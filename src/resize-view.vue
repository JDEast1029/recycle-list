<template>
	<div ref="resizeRef" class="rl-resize-view">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['ready', 'resize']);

const resizeRef = ref<HTMLDivElement | null>(null);

const sumChildrenHeight = () => {
	return Array.from(resizeRef.value?.children || []).reduce((pre, child) => {
		pre += child.clientHeight;
		return pre;
	}, 0);
};

const handleResizeCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
	let { paddingTop, paddingBottom, marginTop, marginBottom } = window.getComputedStyle(entries[0].target);
	const borderTopWidth = parseInt((entries[0].target as HTMLElement).style.borderTopWidth, 10) || 0;
	const borderBottomWidth = parseInt((entries[0].target as HTMLElement).style.borderBottomWidth, 10) || 0;
	const borderHeight = borderTopWidth + borderBottomWidth;

	const paddingTopValue = parseInt(paddingTop, 10) || 0;
	const paddingBottomValue = parseInt(paddingBottom, 10) || 0;
	const paddingHeight = paddingTopValue + paddingBottomValue;

	const marginTopValue = parseInt(marginTop, 10) || 0;
	const marginBottomValue = parseInt(marginBottom, 10) || 0;
	const marginHeight = marginTopValue + marginBottomValue;

	emit('resize', {
		offsetTop: resizeRef.value?.offsetTop ?? 0,
		height: Math.round(entries[0].contentRect.height) + paddingHeight + borderHeight + marginHeight
	});
};

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
	resizeObserver = new ResizeObserver(handleResizeCallback);
	resizeObserver.observe(resizeRef.value!);
	emit('ready', {
		offsetTop: resizeRef.value!.offsetTop,
		height: resizeRef.value!.clientHeight
	});
});

onUnmounted(() => {
	resizeObserver?.disconnect();
});

const getElement = () => {
	return resizeRef.value;
};

const setScrollTop = (value: number) => {
	if (resizeRef.value) {
		resizeRef.value.scrollTop = value;
	}
};
defineExpose({
	sumChildrenHeight,
	getElement,
	setScrollTop
});
</script>

<style lang="less">
.rl-resize-view {
}
</style>
