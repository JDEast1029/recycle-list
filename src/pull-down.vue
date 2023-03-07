<template>
	<div :style="{ height }" class="rl-pull-down-wrapper">
		<div 
			:style="{height: `calc(${height} + ${pullDownHeight}px)`, transform: `translateY(${-pullDownHeight + moveDistance}px)`}"
			class="rl-pull-down"
			@touchstart.stop="handleTouchStart"
			@touchmove.stop="handleTouchMove"
			@touchend.stop="handleTouchEnd"
			@touchcancel.stop="handleTouchEnd"
		>
			<div ref="pullDownRef">
				<slot name="pull-down" :distance="moveDistance" :status="status">
					<!-- 状态：下拉刷新；释放更新(达到阈值)；正在刷新 -->
					<div v-if="status === PULL_DOWN_STATUS.PULL_DOWN">下拉刷新</div>
					<div v-else-if="status === PULL_DOWN_STATUS.RELEASABLE">释放更新</div>
					<div v-else-if="status === PULL_DOWN_STATUS.RELEASED">更新中</div>
				</slot>
			</div>
			<slot />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGesture } from './hooks/use-gesture.js';
import { PULL_DOWN_STATUS } from './constants';

const props = defineProps({
	height: {
		type: String,
		default: '100%'
	},
	disabled: Boolean,
	// 下拉阈值，超过这个值放手后可以触发【下拉事件】
	threshold: {
		type: Number,
		default: 40
	},
	onRelease: {
		type: Function,
		default: () => {}
	},
	// 阻尼率
	dampingRatio: {
		type: Number,
		default: 0.2
	}
});
const emit = defineEmits([]);

const { direction, offsetY, touchStart, touchMove, resetTouchStatus } = useGesture();

const pullDownRef = ref(null);
const pullDownHeight = ref(0);
const status = ref(PULL_DOWN_STATUS.PULL_DOWN);

// 设置阻尼
const moveDistance = computed({
	get: () => {
		return Math.max(offsetY.value, 0) * props.dampingRatio;
	},
	set: (value) => {
		offsetY.value = value;
	}
});

const canRelease = computed(() => {
	return moveDistance.value >= props.threshold;
});

const handleTouchStart = (e) => {
	touchStart(e);
};
const handleTouchMove = (e) => {
	touchMove(e);
	if (canRelease.value) {
		status.value = PULL_DOWN_STATUS.RELEASABLE;
	}
};
const handleTouchEnd = async (e) => {
	// 如果下拉未达到释放更新的距离，还原初始状态
	if (!canRelease.value) {
		resetTouchStatus();
	} else {
		// 停留在阈值长度，等待后续事件更新完成后再还原
		moveDistance.value = props.threshold / props.dampingRatio;

		status.value = PULL_DOWN_STATUS.RELEASED;

		let releasePending = props.onRelease();
		if (!releasePending.then) releasePending = Promise.resolve(releasePending);
		await releasePending.finally(() => {
			resetTouchStatus();
		});

		status.value = PULL_DOWN_STATUS.PULL_DOWN;
	}
};

onMounted(() => {
	pullDownHeight.value = pullDownRef.value.clientHeight;
});
</script>

<style lang="less">
.rl-pull-down-wrapper {
	overflow: hidden;
}
.rl-pull-down {
	overflow: hidden;
}
</style>