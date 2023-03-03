<template>
	<div ref="containerRef" class="rl-core" @scroll="handleScrollThrottle">
		<div 
			ref="contentRef"
			:style="{transform: `translateY(${scrollTop}px)`, height: `${contentHeight}px`}"
			class="rl-core__content"
		>
			<RecycleItem 
				v-for="(item, index) in rebuildData"
				:key="rowKey ? item[rowKey] : index"
				:placeholder="!item.isPlaceholder"
				class="rl-core__item"
				@resize="handleItemResize"
				@ready="handleItemReady"
			>
				<slot :row="item" :index="item.originIndex" />
			</RecycleItem>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
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
const rebuildData = ref([]);
let contentHeight = ref(1000); // 内容高度

let containerHeight = 0; // 滚动高度
let ticking = false; // 给滚动事件做节流

const createDataByScroll = (dataSource = props.dataSource) => {
	// TODO: 假设每个item的高度的是固定的且已知
	const index = scrollTop.value / props.defHeight;
	rebuildData.value = dataSource.slice(index, index + props.renderCount).map((it, i) => {
		return {
			...it,
			originIndex: index + i
		};
	});
};

const handleScroll = (e) => {
	scrollTop.value = e.target.scrollTop;
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

const handleItemReady = (itemHeight) => {
	
};
// TODO:
const handleItemResize = (itemHeight) => {
	// console.log(contentRef.value.clientHeight);
};

watch(
	() => props.dataSource,
	(newDataSource) => {	
		createDataByScroll(newDataSource);
	}
);

onMounted(() => {
	containerHeight = containerRef.value.clientHeight;
	contentHeight.value = contentRef.value.clientHeight;
});
</script>

<style lang="less">
.rl-core {
	height: 100%;
	overflow-y: auto;
	&__item {
		color: #ff0000;
	}
}
</style>