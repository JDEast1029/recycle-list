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
				@resize="handleItemResize($event, item.originIndex)"
				@ready="handleItemReady($event, item.originIndex)"
			>
				<slot :row="item" :index="item.originIndex" />
			</RecycleItem>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeMount, onMounted } from 'vue';
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
	// 默认高度
	defHeight: {
		type: Number,
		default: 50,
	},
	// 渲染条数
	renderCount: {
		type: Number,
		default: 10,
	}
});

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
		// console.log('i', i);
		// console.log(`offsetTop: ${offsetTop}, nextScrollTop: ${offsetTop + height}, scrollTop: ${scrollTop.value}`);
		
		// item是否在顶部视图可见 && item的offsetTop + 容器的高度 <= 内容的高度 && 保证最后有足够的Item被渲染避免渲染数据不足
		if (
			(offsetTop <= scrollTop.value && offsetTop + height > scrollTop.value)
			&& offsetTop + containerHeight <= contentHeight.value
			&& i + props.renderCount <= itemRectArray.length
		) {
			prevFirstInViewIndex = i;
			return i;
		}
	}
	// 避免直接返回0，通过记录上一次的index，当条件不足时应当沿用上一次的index
	return prevFirstInViewIndex;
};

const createDataByScroll = (dataSource = props.dataSource) => {
	const index = getFirstInViewIndex();
	// console.log('index', index);
	currentData.value = dataSource.slice(index, index + props.renderCount).map((it, i) => {
		return {
			...it,
			originIndex: index + i,
			offsetTop: itemRectArray[index + i]?.offsetTop ?? 0
		};
	});
};

const createPlaceholderData = (count) => {
	return Array.from(
		{ length: count }, 
		(it, index) => ({ [props.rowKey]: index, isPlaceholder: true, originIndex: index })
	);
};

// 容器的总高度，item未渲染的那defHeight计算
const calcContentHeight = () => {
	contentHeight.value = itemRectArray.reduce((pre, cur) => pre += cur.height, 0);
};

const rebuildItemRectArray = (index = 0) => {
	for (let i = index; i < itemRectArray.length; i++) {
		itemRectArray[i] = {
			offsetTop: i === 0 ? 0 : itemRectArray[i - 1].offsetTop + itemRectArray[i - 1].height,
			height: itemRectArray[i] ? itemRectArray[i].height : props.defHeight
		};
	}
};

const handleScroll = (e) => {
	scrollTop.value = e.target.scrollTop;
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

const handleItemReady = (itemRect, originIndex) => {
	itemRectArray[originIndex] = itemRect;
	rebuildItemRectArray(originIndex);
	calcContentHeight();
};

const handleItemResize = (itemRect, originIndex) => {
	itemRectArray[originIndex] = itemRect;
	rebuildItemRectArray(originIndex);
	calcContentHeight();
};

watch(
	() => props.dataSource,
	async (newDataSource) => {	
		itemRectArray.length = newDataSource.length;
		rebuildItemRectArray();
		createDataByScroll(newDataSource);
	}
);

onBeforeMount(() => {
	let data = props.dataSource;
	if (data.length === 0) {
		data = createPlaceholderData(props.renderCount);
	}
	createDataByScroll(data);
});

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