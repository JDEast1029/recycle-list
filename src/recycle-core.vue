<template>
	<div ref="containerRef" class="rl-core" @scroll="handleScrollThrottle">
		<!-- 滚动到后面时出现空白，这样【内容高度】就不能是真实的，需要 减掉 偏移量【translateHeight】 -->
		<div 
			ref="contentRef"
			:style="{height: `${contentHeight - translateHeight}px`, transform: `translateY(${translateHeight}px)`}"
			class="rl-core__content"
		>
			<RecycleItem 
				v-for="item in currentData"
				:key="rowKey ? item[rowKey] : item"
				:placeholder="item.isPlaceholder"
				class="rl-core__item"
				@resize="!item.isPlaceholder && handleItemRect($event, item.originIndex)"
				@ready="!item.isPlaceholder && handleItemRect($event, item.originIndex)"
			>
				<slot :row="item" :index="item.originIndex" />
			</RecycleItem>
			<slot name="loading" />
		</div>
	</div>
</template>

<script setup>
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { ref, computed, watch, nextTick, onBeforeMount, onMounted } from 'vue';
import { PLACEHOLDER_HEIGHT, PLACEHOLDER_COUNT, DEFAULT_RENDER_COUNT, createPlaceholderData } from './constants.ts';
import RecycleItem from './recycle-item.vue';

const props = defineProps({
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
	}
});
const emit = defineEmits(['scroll-to-top', 'scroll-to-bottom', 'scroll']);

const containerRef = ref(null); // 滚动容器
const contentRef = ref(null); // 内容
const scrollTop = ref(0); // 滚动距离
const currentData = ref([]);
const contentHeight = ref(0); // 内容的高度

const translateHeight = computed(() => {
	return currentData.value[0] ? currentData.value[0].offsetTop : 0;
});

let containerHeight = 0; // 滚动容器高度
let ticking = false; // 给滚动事件做节流

const itemRectArray = []; // item 距离顶部距离的集合

let prevFirstInViewIndex = 0; 
const getFirstInViewIndex = () => {
	for (let i = 0; i < itemRectArray.length - 1; i++) {
		const { offsetTop, height } = itemRectArray[i];
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

const createDataByScroll = (dataSource = props.dataSource, force = false) => {
	const index = getFirstInViewIndex();
	const renderCount = Math.max(getRenderCount(index), DEFAULT_RENDER_COUNT);
	currentData.value = dataSource.slice(index, index + renderCount).map((it, i) => {
		return {
			...it,
			originIndex: index + i,
			offsetTop: itemRectArray[index + i]?.offsetTop ?? 0
		};
	});
};



// 容器的总高度，item未渲染的那defHeight计算
const calcContentHeight = () => {
	contentHeight.value = itemRectArray.reduce((pre, cur) => pre += cur.height, 0);
};

const rebuildItemRectArray = (index = 0) => {
	for (let i = index; i < itemRectArray.length; i++) {
		itemRectArray[i] = {
			offsetTop: i === 0 ? 0 : itemRectArray[i - 1].offsetTop + itemRectArray[i - 1].height,
			height: itemRectArray[i] ? itemRectArray[i].height : PLACEHOLDER_HEIGHT
		};
	}
};

let prevScrollTop = 0;

const handleReachBottom = debounce(function (e) {
	emit('scroll-to-bottom', e);
}, 300, { leading: true, trailing: false });

const handleScroll = (e) => {
	if (e.target.scrollTop === 0 && scrollTop.value !== 0) {
		emit('scroll-to-top', e);
	}
	scrollTop.value = e.target.scrollTop;
	emit('scroll', scrollTop.value);
	if (prevScrollTop < scrollTop.value && scrollTop.value + containerHeight + props.reachBottomDistance >= contentHeight.value) {
		handleReachBottom(e);
	}
	prevScrollTop = scrollTop.value;
	createDataByScroll();
};

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
	const { height } = itemRectArray[originIndex];
	itemRectArray[originIndex] = itemRect;
	rebuildItemRectArray(originIndex);
	contentHeight.value = contentHeight.value + itemRect.height - height;
	throttle(createDataByScroll, 50)();
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
			createDataByScroll(newDataSource, true);
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
	height: 100%;
	overflow-y: auto;
	&__item {
		
	}
}
</style>