<template>
	<div ref="resizeRef" class="rl-resize-view">
		<slot />
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['ready', 'resize']);

const resizeRef = ref(null);
let currentHeight = 0;
let observerInstance = null;

const getCurrentHeight = () => {
	return resizeRef.value.clientHeight;
};

const sumChildrenHeight = () => {
	return Array.from(resizeRef.value.children || []).reduce((pre, child) => {
		pre += child.clientHeight;
		return pre;
	}, 0);
};

const handleResizeCallback = (entries, observer) => {
	let { paddingTop, paddingBottom, marginTop, marginBottom } = window.getComputedStyle(entries[0].target);
	const borderTopWidth = parseInt(entries[0].target.style.borderTopWidth, 10) || 0;
	const borderBottomWidth = parseInt(entries[0].target.style.borderBottomWidth, 10) || 0;
	const borderHeight = borderTopWidth + borderBottomWidth;

	const paddingTopValue = parseInt(paddingTop, 10) || 0;
	const paddingBottomValue = parseInt(paddingBottom, 10) || 0;
	const paddingHeight = paddingTopValue + paddingBottomValue;

	const marginTopValue = parseInt(marginTop, 10) || 0;
	const marginBottomValue = parseInt(marginBottom, 10) || 0;
	const marginHeight = marginTopValue + marginBottomValue;

	emit('resize', {
		offsetTop: resizeRef.value.offsetTop,
		height: Math.round(entries[0].contentRect.height) + paddingHeight + borderHeight + marginHeight
	});
};

let resizeObserver = null;
onMounted(() => {
	resizeObserver = new ResizeObserver(handleResizeCallback);
	resizeObserver.observe(resizeRef.value);
	emit('ready', {
		offsetTop: resizeRef.value.offsetTop,
		height: resizeRef.value.clientHeight
	});
});

onUnmounted(() => {
	resizeObserver.disconnect();
});

const getElement = () => {
	return resizeRef.value;
};

const setScrollTop = (value) => {
	resizeRef.value.scrollTop = value;
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