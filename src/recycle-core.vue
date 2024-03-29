<template>
	<ResizeView
		ref="containerRef"
		:style="{ height }"
		:row-gap="20"
		class="rl-core"
		@scroll="handleScroll"
		@touchstart="handleTouchStart"
		@touchmove="handleTouchMove"
		@touchend="handleTouchEnd"
		@touchcancel="handleTouchEnd"
		@resize="handleContainerRect"
		@ready="handleContainerRect"
	>
		<!-- <div class="rl-core__tmp">{{ scrollTop }}</div> -->
		<!-- 双层设计，内层通过translateY来保证 目标item在预设范围内 -->
		<div ref="contentRef" :style="{ height: `${contentHeight}px` }" class="rl-core__content">
			<div :style="{ transform: `translateY(${translateHeight}px)` }">
				<ResizeView
					:style="{ visibility: scrollTop <= headerHeight ? 'visible' : 'hidden' }"
					class="rl-core__header"
					@resize="handleHeaderRect($event)"
					@ready="handleHeaderRect($event)"
				>
					<slot name="header" />
				</ResizeView>
				<!-- 因为header节点并不会动态变化，所以grid内的节点的offsetTop以grid为父容器 -->
				<RecycleGrid
					:cols="cols"
					:column-gap="columnGap"
					:row-gap="rowGap"
					:data-source="currentData"
					:row-key="rowKey"
					:offset-height="translateHeight"
				>
					<template #default="{ row }">
						<ResizeView
							:style="{ 'margin-bottom': `${row.$rl_isLast ? 0 : rowGap}px` }"
							class="rl-core__item"
							@resize="handleItemRectResize($event, row.$rl_originIndex)"
							@ready="handleItemRectReady($event, row.$rl_originIndex)"
						>
							<slot v-if="row.$rl_placeholder" name="skeleton">
								<Skeleton />
							</slot>
							<slot v-else :row="row" :index="row.$rl_originIndex" />
						</ResizeView>
					</template>
				</RecycleGrid>
				<ResizeView class="rl-core__footer" @resize="handleFooterRect($event)" @ready="handleFooterRect($event)">
					<slot name="footer" />
				</ResizeView>
			</div>
		</div>
	</ResizeView>
</template>

<script setup lang="ts">
import debounce from 'lodash.debounce';
import pick from 'lodash.pick';
import { ref, computed, watch } from 'vue';
import ResizeView from './resize-view.vue';
import Skeleton from './skeleton.vue';
import RecycleGrid from './recycle-grid.vue';
import { useCoreTouch } from './hooks/use-core-touch.js';
import { ListManage } from './list-manage/index';
import { smoothScrollTo, throttleAnimationFrame } from './utils';
import type { RectItem, ItemType } from './list-manage/types';

const props = defineProps({
	height: {
		type: String,
		default: '100%'
	},
	dataSource: {
		type: Array,
		default: () => []
	},
	// 视图之外渲染的条数，避免快速滑动时造成闪烁
	outsideCount: {
		type: Number,
		default: 4
	},
	reachBottomDistance: {
		type: Number,
		default: 50
	},
	...pick(RecycleGrid.props, ['rowKey', 'cols', 'columnGap', 'rowGap'])
});
const emit = defineEmits(['scroll-to-bottom', 'scroll']);

const listManage = new ListManage(props);

const containerRef = ref<InstanceType<typeof ResizeView> | null>(null); // 内容
const contentRef = ref<HTMLDivElement | null>(null); // 内容
const containerHeight = ref(0); // 滚动容器高度
const scrollTop = ref(0); // 滚动距离
const currentData = ref<ItemType[][]>([]);
const contentHeight = ref(0); // 内容的高度
const headerHeight = ref(0); // header的高度
const footerHeight = ref(0); // header的高度

const translateHeight = computed(() => {
	return currentData.value.reduce((pre: number, cur: ItemType[]): number => {
		const colOffsetTop = cur[0]?.$rl_offsetTop ?? 0;
		if (pre === -1) return colOffsetTop;
		return Math.min(pre, colOffsetTop);
	}, -1);
});

const { handleTouchStart, handleTouchMove, handleTouchEnd } = useCoreTouch({
	scrollTop,
	contentHeight,
	containerHeight,
	reverse: false
});

// 容器的总高度，item未渲染的那defHeight计算
const calcContentHeight = () => {
	contentHeight.value = headerHeight.value + listManage.totalHeight + footerHeight.value;
};

const throttleCreateRenderData = throttleAnimationFrame((dataSource = props.dataSource) => {
	currentData.value = listManage.createData(dataSource, {
		scrollTop: scrollTop.value,
		headerHeight: headerHeight.value,
		containerHeight: containerHeight.value,
		contentHeight: contentHeight.value
	});
});

let prevScrollTop = 0;

const handleReachBottom = debounce(
	function (e?: UIEvent) {
		emit('scroll-to-bottom', e);
	},
	300,
	{ leading: true, trailing: false }
);

const handleScroll = throttleAnimationFrame((e) => {
	if (e.target.scrollTop === 0 && scrollTop.value !== 0) {
		e.preventDefault();
	}
	scrollTop.value = Math.max(0, e.target.scrollTop); // 移动端上会出现负数
	emit('scroll', scrollTop.value);
	if (prevScrollTop < scrollTop.value && scrollTop.value + containerHeight.value + props.reachBottomDistance >= contentHeight.value) {
		handleReachBottom(e);
	}
	prevScrollTop = scrollTop.value;
	throttleCreateRenderData();
});

const handleHeaderRect = (itemRect: RectItem) => {
	headerHeight.value = itemRect.height;
	calcContentHeight();
};

const handleFooterRect = (itemRect: RectItem) => {
	footerHeight.value = itemRect.height;
	calcContentHeight();
};

const handleItemRectReady = (itemRect: RectItem, originIndex: number) => {
	listManage.updateItem(originIndex, itemRect);
	calcContentHeight();
};

const handleItemRectResize = (itemRect: RectItem, originIndex: number) => {
	listManage.updateItem(originIndex, itemRect);
	calcContentHeight();
	throttleCreateRenderData();
};

watch(
	() => props.dataSource,
	async (newDataSource) => {
		listManage.updateData(newDataSource);
		calcContentHeight();
		throttleCreateRenderData(newDataSource);
	},
	{ deep: true, immediate: true }
);

const handleContainerRect = (containerRect: RectItem) => {
	containerHeight.value = containerRect.height;
};

const $rl_scrollTo = (value: number, smooth: boolean) => {
	const el = containerRef.value?.getElement();
	if (smooth && el) {
		smoothScrollTo(el, value);
	} else {
		containerRef.value?.setScrollTop(value);
	}
};

const $rl_scrollToIndex = (index: number, smooth: boolean) => {
	const { offsetTop } = listManage.findByIndex(index);
	$rl_scrollTo(offsetTop + headerHeight.value, smooth);
};

defineExpose({
	contentHeight,
	containerHeight,
	reachBottom: handleReachBottom,
	scrollTo: $rl_scrollTo,
	scrollToIndex: $rl_scrollToIndex
});
</script>

<style lang="less">
.rl-core {
	position: relative; // offsetTop已该节点为基准
	overflow-y: auto;
	height: 100%;

	&__tmp {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1;
		color: #fff;
		background-color: #000;
	}

	&__content {
		position: relative;
	}

	&__item {
	}
}
</style>
