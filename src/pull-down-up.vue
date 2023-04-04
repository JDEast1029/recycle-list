<template>
	<div :style="{ height }" class="rl-pull-down-up-wrapper">
		<div
			:style="{ height: `calc(${height} + ${pullStatusHeight}px)`, transform: `translateY(${translateHeight}px)` }"
			class="rl-pull-down-up"
			@touchstart.stop="handleTouchStart"
			@touchmove.stop="handleTouchMove"
			@touchend.stop="handleTouchEnd"
			@touchcancel.stop="handleTouchEnd"
		>
			<div v-if="!reverse" ref="pullStatusRef">
				<slot name="pull-status" :distance="moveDistance" :status="status">
					<!-- 状态：下拉刷新；释放更新(达到阈值)；正在刷新 -->
					<div v-if="status === PULL_STATUS.PULL_DOWN">下拉刷新</div>
					<div v-else-if="status === PULL_STATUS.RELEASABLE">释放更新</div>
					<div v-else-if="status === PULL_STATUS.RELEASED">更新中</div>
				</slot>
			</div>
			<slot />
			<div v-if="reverse" ref="pullStatusRef">
				<slot name="pull-status" :distance="moveDistance" :status="status">
					<!-- 状态：上拉刷新；释放更新(达到阈值)；正在刷新 -->
					<div v-if="status === PULL_STATUS.PULL_UP">上拉刷新</div>
					<div v-else-if="status === PULL_STATUS.RELEASABLE">释放更新</div>
					<div v-else-if="status === PULL_STATUS.RELEASED">更新中</div>
				</slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGesture } from './hooks/use-gesture.js';
import { PULL_STATUS } from './constants.js';

const props = defineProps({
	height: {
		type: String,
		default: '100%'
	},
	// 禁止下拉or上拉
	disabled: Boolean,
	// 开启反转，变成上拉刷新
	reverse: Boolean,
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

const pullStatusRef = ref<HTMLDivElement | null>(null);
const pullStatusHeight = ref(0);

const initialStatus = computed(() => {
	return props.reverse ? PULL_STATUS.PULL_UP : PULL_STATUS.PULL_DOWN;
});
const status = ref(initialStatus.value);

// 设置阻尼
const moveDistance = computed({
	get: () => {
		const distance = props.reverse ? Math.abs(Math.min(offsetY.value, 0)) : Math.max(offsetY.value, 0);
		return distance * props.dampingRatio;
	},
	set: (value) => {
		offsetY.value = props.reverse ? -value : value;
	}
});

const translateHeight = computed(() => {
	return props.reverse ? -moveDistance.value : moveDistance.value - pullStatusHeight.value;
});

const canRelease = computed(() => {
	return moveDistance.value >= props.threshold;
});

const handleTouchStart = (e: TouchEvent) => {
	if (props.disabled) return;
	touchStart(e);
};
const handleTouchMove = (e: TouchEvent) => {
	if (props.disabled) return;
	touchMove(e);
	if (canRelease.value) {
		status.value = PULL_STATUS.RELEASABLE;
	}
};
const handleTouchEnd = async (e: TouchEvent) => {
	// 如果下拉未达到释放更新的距离，还原初始状态
	if (!canRelease.value) {
		resetTouchStatus();
	} else {
		// 停留在阈值长度，等待后续事件更新完成后再还原
		moveDistance.value = props.threshold / props.dampingRatio;

		status.value = PULL_STATUS.RELEASED;

		let releasePending = props.onRelease();
		if (!releasePending.then) releasePending = Promise.resolve(releasePending);
		await releasePending.finally(() => {
			resetTouchStatus();
		});

		status.value = initialStatus.value;
	}
};

onMounted(() => {
	pullStatusHeight.value = pullStatusRef.value?.clientHeight ?? 0;
});
</script>

<style lang="less">
.rl-pull-down-up-wrapper {
	overflow: hidden;
}

.rl-pull-down-up {
	overflow: hidden;
}
</style>
