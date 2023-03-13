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
	emit('resize', {
		offsetTop: resizeRef.value.offsetTop,
		height: entries[0].contentRect.height
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

defineExpose({
	sumChildrenHeight,
	el: resizeRef.value
});
</script>

<style lang="less">
.rl-resize-view {
	
}
</style>