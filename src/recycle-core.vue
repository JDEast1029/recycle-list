<template>
	<div 
		ref="containerRef"
		:style="{ height }"
		class="rl-core"
		@scroll="handleScrollThrottle"
		@touchmove="handleTouchPrevent"
	>
		<div class="rl-core__tmp">{{ scrollTop }}</div>
		<!-- 滚动到后面时出现空白，这样【内容高度】就不能是真实的，需要 减掉 偏移量【translateHeight】 -->
		<div 
			ref="contentRef"
			:style="{height: `${contentHeight - translateHeight}px`, transform: `translateY(${translateHeight}px)`}"
			class="rl-core__content"
		>
			<RecycleItem 
				v-for="(item, index) in currentData"
				:key="rowKey ? item[rowKey] : index"
				:placeholder="item._isPlaceholder"
				class="rl-core__item"
				@resize="!item._isPlaceholder && handleItemRect($event, item._originIndex)"
				@ready="!item._isPlaceholder && handleItemRect($event, item._originIndex)"
			>
				<slot :row="item" :index="item._originIndex" />
			</RecycleItem>
		</div>
	</div>
</template>

<script setup>
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { ref, computed, watch, nextTick, onBeforeMount, onMounted } from 'vue';
import { PLACEHOLDER_HEIGHT, PLACEHOLDER_COUNT, DEFAULT_RENDER_COUNT, CACHE_ITEM_COUNT, HEADER_ITEM, createPlaceholderData } from './constants.ts';
import RecycleItem from './recycle-item.vue';

const props = defineProps({
	height: {
		type: String,
		default: '100%'
	},
	dataSource: {
		type: Array,
		default: () => ([])
	},
	rowKey: {
		type: String,
		default: 'id'
	},
	reachBottomDistance: {
		type: Number,
		default: 0
	},
	// 一开始加载时，整个页面是否展示骨架屏
	skeleton: {
		type: Boolean,
		default: true
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

const containerRef = ref(null); // 滚动容器
const contentRef = ref(null); // 内容
const scrollTop = ref(0); // 滚动距离
const currentData = ref([]);
const contentHeight = ref(0); // 内容的高度

const translateHeight = computed(() => {
	return currentData.value[0] ? currentData.value[0]._offsetTop : 0;
});

let containerHeight = 0; // 滚动容器高度

const itemRectArray = []; // item 距离顶部距离的集合

let prevFirstInViewIndex = 0; 
const getFirstInViewIndex = () => {
	for (let i = 0; i < itemRectArray.length - 1; i++) {
		const { offsetTop = 0, height = 0 } = itemRectArray[i] || {};
		// 第一种情况：item在顶部视图可见
		// 第二种情况：item在顶部视图不可见，但后面item已经不够撑满容器了， 
		if ((offsetTop <= scrollTop.value && offsetTop + height > scrollTop.value)
			|| (offsetTop + height < scrollTop.value && offsetTop + height + containerHeight >= contentHeight.value)
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
	while (renderHeight <= containerHeight && index < itemRectArray.length) {
		renderHeight += itemRectArray[index].height;
		index++;
		count++;
	}
	return count;
};

const createRenderData = (dataSource = props.dataSource, force = false) => {
	const index = getFirstInViewIndex();
	const renderCount = Math.max(getRenderCount(index), DEFAULT_RENDER_COUNT);
	currentData.value = dataSource.slice(index, index + renderCount + CACHE_ITEM_COUNT).map((it, i) => {
		return {
			...it,
			_originIndex: index + i,
			_offsetTop: itemRectArray[index + i]?.offsetTop ?? 0,
			_height: itemRectArray[index + i]?.height ?? 0,
		};
	});
};

// 容器的总高度，item未渲染的那defHeight计算
const calcContentHeight = () => {
	contentHeight.value = itemRectArray.reduce((pre, cur) => pre += cur.height, 0);
};

// 重新计算item的offsetTop和Height，对于还没有渲染的Item给固定高度【PLACEHOLDER_HEIGHT】
const rebuildItemRectArray = (index = 0) => {
	for (let i = index; i < itemRectArray.length; i++) {
		itemRectArray[i] = {
			offsetTop: i === 0 ? 0 : itemRectArray[i - 1].offsetTop + itemRectArray[i - 1].height,
			height: itemRectArray[i] ? itemRectArray[i].height : PLACEHOLDER_HEIGHT
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

const handleTouchPrevent = (e) => {
	if (scrollTop.value > 0) {
		e.stopPropagation();
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
	scrollTop.value = e.target.scrollTop;
	emit('scroll', scrollTop.value);
	if (prevScrollTop < scrollTop.value && scrollTop.value + containerHeight + props.reachBottomDistance >= contentHeight.value) {
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
		if (props.skeleton && newDataSource.length === 0) {
			itemRectArray.length = PLACEHOLDER_COUNT;
			rebuildItemRectArray();
			calcContentHeight();
			currentData.value = createPlaceholderData(PLACEHOLDER_COUNT, props.rowKey);
		} else {
			itemRectArray.length = newDataSource.length;
			rebuildItemRectArray();
			calcContentHeight();
			throttleCreateRenderData(newDataSource, true);
		}
	},
	{ deep: true, immediate: true }
);

onMounted(() => {
	containerHeight = containerRef.value.clientHeight;
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
	}
	&__item {
	}
}
</style>