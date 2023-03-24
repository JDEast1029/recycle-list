<template>
	<ResizeView 
		ref="containerRef"
		:style="{ height }"
		class="rl-core"
		@scroll="handleScrollThrottle"
		@touchstart="handleTouchStart"
		@touchmove="handleTouchMove"
		@touchend="handleTouchEnd"
		@touchcancel="handleTouchEnd"
		@resize="handleContainerRect"
		@ready="handleContainerRect"
	>
		<div v-if="showScrollTop" class="rl-core__tmp">{{ scrollTop }}</div>
		<!-- 滚动到后面时出现空白，这样【内容高度】就不能是真实的，需要 减掉 偏移量【translateHeight】 -->
		<div 
			ref="contentRef"
			:style="contentStyle"
			class="rl-core__content"
		>
			<RecycleItem 
				v-for="(item, index) in currentData"
				:key="rowKey ? item[rowKey] : index"
				:style="{ 'grid-row-end': `span ${item.$rl_height}` }"
				v-bind="item.options"
				class="rl-core__item"
				@resize="handleItemRect($event, item.$rl_originIndex)"
				@ready="handleItemRect($event, item.$rl_originIndex)"
			>
				<slot :row="item" :index="item.$rl_originIndex" />
			</RecycleItem>
		</div>
	</ResizeView>
</template>

<script setup>
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { ref, computed, watch, nextTick, onBeforeMount, onMounted } from 'vue';
import { PLACEHOLDER$rl_height } from './constants.ts';
import RecycleItem from './recycle-item.vue';
import ResizeView from './resize-view.vue';
import { useCoreTouch } from './hooks/use-core-touch.js';

const props = defineProps({
	height: {
		type: String,
		default: '100%'
	},
	dataSource: {
		type: Array,
		default: () => ([])
	},
	// 视图之外渲染的条数，避免快速滑动时造成闪烁
	outsideCount: {
		type: Number,
		default: 2
	},
	rowKey: {
		type: String,
		default: 'id'
	},
	reachBottomDistance: {
		type: Number,
		default: 0
	},
	cols: {
		type: Number,
		default: 1
	},
	columnGap: {
		type: Number,
		default: 0
	},
	rowGap: {
		type: Number,
		default: 0
	}
});
const emit = defineEmits(['scroll-to-bottom', 'scroll']);

const showScrollTop = __DEV__; 

const containerRef = ref(null); // 内容
const contentRef = ref(null); // 内容
const containerHeight = ref(0); // 滚动容器高度
const scrollTop = ref(0); // 滚动距离
const currentData = ref([]);
const contentHeight = ref(0); // 内容的高度

const translateHeight = computed(() => {
	return currentData.value[0] ? currentData.value[0].$rl_offsetTop : 0;
});
const contentStyle = computed(() => {
	return {
		height: `${contentHeight.value - translateHeight.value}px`, 
		transform: `translateY(${translateHeight.value}px)`,
		'grid-template-columns': `repeat(${props.cols}, 1fr)`
	};
});

const itemRectArray = []; // item 距离顶部距离的集合

const { handleTouchStart, handleTouchMove, handleTouchEnd } = useCoreTouch(scrollTop);

let prevFirstInViewIndex = 0; 
const getFirstInViewIndex = () => {
	for (let i = 0; i < itemRectArray.length - 1; i++) {
		const { offsetTop = 0, height = 0 } = itemRectArray[i] || {};
		// 第一种情况：item在顶部视图可见
		// 第二种情况：item在顶部视图不可见，但后面item已经不够撑满容器了， 
		if ((offsetTop <= scrollTop.value && offsetTop + height > scrollTop.value)
			|| (offsetTop + height < scrollTop.value && offsetTop + height + containerHeight.value >= contentHeight.value)
		) {
			prevFirstInViewIndex = i;
			return i;
		}
	}
	// 避免直接返回0，通过记录上一次的index，当条件不足时应当沿用上一次的index
	return prevFirstInViewIndex;
};

// 计算撑满视图需要渲染的条数
const getRenderCount = (index) => {
	const { offsetTop = 0, height = 0 } = itemRectArray[index] || {};
	let renderHeight = height - (scrollTop.value - offsetTop);
	let count = 1;
	index++;
	while (renderHeight <= containerHeight.value && index < itemRectArray.length) {
		renderHeight += itemRectArray[index].height;
		index++;
		count++;
	}
	return count;
};

const createRenderData = (dataSource = props.dataSource, force = false) => {
	const index = getFirstInViewIndex();
	const startIndex = Math.max(0, index - props.outsideCount);
	const renderCount = getRenderCount(index);
	let endIndex = startIndex + renderCount;
	endIndex = index - props.outsideCount < 0 ? endIndex + props.outsideCount : endIndex + 2 * props.outsideCount;
	currentData.value = dataSource.slice(startIndex, endIndex).map((it, i) => {
		return {
			...it,
			$rl_originIndex: startIndex + i,
			// 测试用来看的
			$rl_offsetTop: itemRectArray[startIndex + i]?.offsetTop ?? 0,
			$rl_height: itemRectArray[startIndex + i]?.height ?? 0,
		};
	});
};

// 容器的总高度，item未渲染的那defHeight计算
const calcContentHeight = () => {
	contentHeight.value = itemRectArray.reduce((pre, cur) => pre += cur.height, 0);
};

// 重新计算item的offsetTop和Height，对于还没有渲染的Item给固定高度【PLACEHOLDER$rl_height】
const rebuildItemRectArray = (index = 0) => {
	for (let i = index; i < itemRectArray.length; i++) {
		itemRectArray[i] = {
			offsetTop: i === 0 ? 0 : itemRectArray[i - 1].offsetTop + itemRectArray[i - 1].height,
			height: itemRectArray[i] ? itemRectArray[i].height : PLACEHOLDER$rl_height
		};
	}
};

let dataTicking = false;
const throttleCreateRenderData = (dataSource, force) => {
	if (!dataTicking) {
		window.requestAnimationFrame(() => {
			createRenderData(dataSource, force);
			dataTicking = false;
		});
		dataTicking = true;
	}
};

let prevScrollTop = 0;

const handleReachBottom = debounce(function (e) {
	emit('scroll-to-bottom', e);
}, 300, { leading: true, trailing: false });

const handleScroll = (e) => {
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
};

let ticking = false; // 给滚动事件做节流
const handleScrollThrottle = (e) => {
	if (!ticking) {
		window.requestAnimationFrame(() => {
			handleScroll(e);
			ticking = false;
		});
		ticking = true;
	}
};

const handleItemRect = (itemRect, originIndex) => {
	const { height = 0 } = itemRectArray[originIndex] || {};
	itemRectArray[originIndex] = itemRect;
	rebuildItemRectArray(originIndex);
	// 只需要加上 当前item与之前的高度差即可，不需要遍历重新计算
	contentHeight.value = contentHeight.value + itemRect.height - height;
};

watch(
	() => props.dataSource,
	async (newDataSource) => {	
		itemRectArray.length = newDataSource.length;
		rebuildItemRectArray();
		calcContentHeight();
		throttleCreateRenderData(newDataSource, true);
	},
	{ deep: true, immediate: true }
);

const handleContainerRect = (containerRect) => {
	containerHeight.value = containerRect.height;
};

/**
element.scrollTo({
  top: 100,
  left: 100,
  behavior: "smooth",
});
 * @param {*} value 
 */
const _scrollTo = (value) => {
	// TODO: 需要resizeView对外暴露scrollTo方法
};

const _scrollToIndex = (index) => {
	// TODO: 找到根据Index在itemRectArray中找到指定的元素，拿到offsetTop再去调用_scrollTo
};

defineExpose({
	contentHeight,
	containerHeight,
	reachBottom: handleReachBottom,
	scrollTo: _scrollTo,
	scrollToIndex: _scrollToIndex
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
		display: grid;
		grid-auto-rows: 1px; 
	}
	&__item {
		grid-row-start: auto;
	}
}
</style>