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

const handleMutationCallback = (mutationsList, observer) => {
	if (getCurrentHeight() !== currentHeight) {
		currentHeight = getCurrentHeight();
		emit('resize', {
			offsetTop: resizeRef.value.offsetTop,
			height: currentHeight
		});
	}
};

// TODO: 监听节点高度的变化，需要用ResizeObserver处理
onMounted(() => {
	currentHeight = getCurrentHeight();
	observerInstance = new MutationObserver(handleMutationCallback);
	observerInstance.observe(resizeRef.value, {
		attributes: true, // 监听当前节点的属性变化
		subtree: true, // 监听当前节点树，所有节点的属性变化
		childList: true, // 监听当前节点中发生的节点的新增与删除
	});
	emit('ready', {
		offsetTop: resizeRef.value.offsetTop,
		height: currentHeight
	});
});

onUnmounted(() => {
	observerInstance.disconnect();
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