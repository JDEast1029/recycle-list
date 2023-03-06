<template>
	<div 
		:style="{transform: `translateY(${-pullDownHeight + offsetY}px)`}"
		class="rl-pull-down"
		@touchstart.stop="handleTouchStart"
		@touchmove.stop="handleTouchMove"
		@touchend.stop="handleTouchEnd"
		@touchcancel.stop="handleTouchEnd"
	>
		<div ref="pullDownRef">
			<slot name="pull-down">
				<div>{{ canRelease ? '释放更新' : '下拉刷新' }}</div>
			</slot>
		</div>
		<slot />
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGesture } from './hooks/use-gesture.js';

const props = defineProps({
	disabled: Boolean,
	// 下拉阈值，超过这个值放手后可以触发【下拉事件】
	threshold: {
		type: Number,
		default: 200
	},
	releaseCallback: {
		type: Function,
		default: () => {}
	}
});
const emit = defineEmits([]);

const { direction, offsetY, touchStart, touchMove, resetTouchStatus } = useGesture();

const pullDownRef = ref(null);
const pullDownHeight = ref(0);

// 设置阻尼
const moveDistance = computed(() => {
	return offsetY.value;
});

const canRelease = computed(() => {
	return moveDistance.value > props.threshold;
});

const handleTouchStart = (e) => {
	touchStart(e);
};
const handleTouchMove = (e) => {
	touchMove(e);
};
const handleTouchEnd = async (e) => {
	// 如果下拉未达到释放更新的距离，还原初始状态
	if (!canRelease.value) {
		resetTouchStatus();
	} else {
		// 停留在阈值长度，等待后续事件更新完成后再还原
		moveDistance.value = props.threshold;
		let releasePending = props.releaseCallback();
		if (!releasePending.then) releasePending = Promise.resolve(releasePending);
		await releasePending.finally(() => {
			resetTouchStatus();
		});
	}
};

onMounted(() => {
	pullDownHeight.value = pullDownRef.value.clientHeight;
});
</script>

<style lang="less">
.rl-pull-down {
	height: 100%;
}
</style>