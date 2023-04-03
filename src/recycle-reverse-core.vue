<template>
	<ResizeView 
		ref="containerRef"
		:style="{ height }"
		:row-gap="20"
		class="rl-core is-reverse"
		@scroll="handleScroll"
		@touchstart="handleTouchStart"
		@touchmove="handleTouchMove"
		@touchend="handleTouchEnd"
		@touchcancel="handleTouchEnd"
		@resize="handleContainerRect"
		@ready="handleContainerRect"
	>
		<div v-if="showScrollTop" class="rl-core__tmp">{{ scrollTop }}</div>
		<!-- 双层设计，内层通过translateY来保证 目标item在预设范围内 -->
		<div 
			ref="contentRef"
			:style="{height: `${contentHeight}px`}"
			class="rl-core__content"
		>
			<div :style="{transform: `translateY(${translateHeight}px)`}">
				<ResizeView 
					:style="{ visibility: scrollTop <= footerHeight ? 'visible' : 'hidden' }"
					class="rl-core__footer"
					@resize="handleFooterRect($event)"
					@ready="handleFooterRect($event)"
				>
					<slot name="footer" />
				</ResizeView>
				<ResizeView 
					:style="{ visibility: scrollTop <= headerHeight + footerHeight ? 'visible' : 'hidden' }"
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
					:reverse="true"
				>
					<template #default="{ row }">
						<ResizeView 
							:style="{ 'margin-bottom': `${row.$rl_isLast ? 0 : rowGap}px`}"
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
			</div>
		</div>
	</ResizeView>
</template>

<script setup>
import debounce from 'lodash.debounce';
import { ref, computed, watch, nextTick, onBeforeMount, onMounted } from 'vue';
import { PLACEHOLDER_HEIGHT } from './constants.ts';
import ResizeView from './resize-view.vue';
import Skeleton from './skeleton.vue';
import RecycleGrid from './recycle-grid.vue';
import { useCoreTouch } from './hooks/use-core-touch.js';
import { ListManage } from './list-manage/index.ts';
import { smoothScrollTo, throttleAnimationFrame } from "./utils";
import RecycleCore from './recycle-core.vue';

const props = defineProps({
	...RecycleCore.props
});
const emit = defineEmits([...RecycleCore.emits]);

const listManage = new ListManage({ reverse: true, ...props });

const showScrollTop = __DEV__; 

const containerRef = ref(null); // 内容
const contentRef = ref(null); // 内容
const containerHeight = ref(0); // 滚动容器高度
const scrollTop = ref(0); // 滚动距离
const currentData = ref([]);
const contentHeight = ref(0); // 内容的高度
const headerHeight = ref(0); // header的高度
const footerHeight = ref(0); // header的高度

const translateHeight = computed(() => {
	const target = currentData.value.reduce((pre, cur) => {
		const item = cur[0] ? cur[0] : { $rl_offsetTop: 0, $rl_height: 0 };
		if (pre.$rl_offsetTop === 0) return item;
		if (pre.$rl_offsetTop < item.$rl_offsetTop) {
			return item;
		}
		return pre;
	}, { $rl_offsetTop: 0, $rl_height: 0 });
	return contentHeight.value - target.$rl_offsetTop - target.$rl_height - footerHeight.value - headerHeight.value; 
});

const { handleTouchStart, handleTouchMove, handleTouchEnd } = useCoreTouch({
	scrollTop,
	contentHeight,
	containerHeight,
	reverse: true
});

let prevScrollTop = 0;
let prevContentHeight = 0;
// 容器的总高度，item未渲染的那defHeight计算
const calcContentHeight = () => {
	contentHeight.value = headerHeight.value + listManage.totalHeight + footerHeight.value;
	if (contentHeight.value === prevContentHeight) return;
	prevScrollTop += contentHeight.value - prevContentHeight;
	containerRef.value && containerRef.value.setScrollTop(prevScrollTop);
	prevContentHeight = contentHeight.value;
};

const throttleCreateRenderData = (dataSource = props.dataSource) => {
	currentData.value = listManage.createData(dataSource, {
		scrollTop: scrollTop.value, 
		headerHeight: headerHeight.value,
		containerHeight: containerHeight.value, 
		contentHeight: contentHeight.value
	});
};

const handleReachBottom = debounce(function (e) {
	emit('scroll-to-bottom', e);
}, 300, { leading: true, trailing: false });

const handleScroll = throttleAnimationFrame((e) => {
	let top = contentHeight.value - containerHeight.value;
	if (e.target.scrollTop === top && scrollTop.value !== top) {
		e.preventDefault();
	}
	scrollTop.value = Math.max(0, Math.min(top, e.target.scrollTop)); // 移动端上会出现负数
	emit('scroll', scrollTop.value);
	if (prevScrollTop > scrollTop.value && scrollTop.value <= props.reachBottomDistance) {
		handleReachBottom(e);
	}
	prevScrollTop = scrollTop.value;
	throttleCreateRenderData();
});

const handleHeaderRect = (itemRect) => {
	headerHeight.value = itemRect.height;
	calcContentHeight();
};

const handleFooterRect = (itemRect) => {
	footerHeight.value = itemRect.height;
	calcContentHeight();
};

const handleItemRectReady = (itemRect, originIndex) => {
	listManage.updateItem(originIndex, itemRect);
	calcContentHeight();
};

const handleItemRectResize = (itemRect, originIndex) => {
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

const handleContainerRect = (containerRect) => {
	containerHeight.value = containerRect.height;
};

const $rl_scrollTo = (value, smooth) => {
	const el = containerRef.value.getElement();
	if (smooth) {
		smoothScrollTo(el, value);
	} else {
		containerRef.value.setScrollTop(value);
	}
};

const $rl_scrollToIndex = (index, smooth) => {
	const { offsetTop, height } = listManage.findByIndex(index);
	$rl_scrollTo(contentHeight.value - (offsetTop + height), smooth);
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
	height: 100%;
	overflow-y: auto;
	&__tmp {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1;
		background-color: #000000;
		color: #fff;
	}
	&__content {
		position: relative
	}
	&__item {
	}
}
</style>