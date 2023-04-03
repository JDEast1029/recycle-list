<template>
	<PullDownUp 
		ref="pullDownRef"
		:height="height"
		:disabled="!refresh"
		:reverse="reverse"
		:on-release="handleReleaseUpdate"
		class="rl-main"
	>
		<template #pull-status="{ distance, status }">
			<slot name="pull-status" :distance="distance" :status="status" />
		</template>
		<component
			:is="reverse ? RecycleReverseCore : RecycleCore" 
			ref="coreRef"
			:data-source="dataSource"
			:height="height"
			:reach-bottom-distance="reachBottomDistance"
			:cols="cols"
			:column-gap="columnGap"
			:row-gap="rowGap"
			:skeleton="skeleton"
			:outside-count="outsideCount"
			@scroll-to-bottom="handleScrollToBottom"
		>
			<template #header>
				<slot name="header" />
				<slot v-if="isEmpty" name="empty" />
			</template>
			<template #default="{ row, index }">
				<slot :row="row" :index="index" />
			</template>
			<template #footer>
				<slot 
					v-if="(isLoading && !isRefreshing) || isEnd"
					name="pull-up"
					:loading="isLoading"
					:end="isEnd"
				>
					<Skeleton v-if="isLoading" placeholder />
					<div v-else-if="isEnd">已全部加载</div>
				</slot>
			</template>
		</component>
	</PullDownUp>
</template>

<script setup>
import { onMounted, ref, reactive, onBeforeMount, computed, nextTick, watch } from 'vue';
import { PLACEHOLDER_COUNT } from './constants.ts';
import { createPlaceholderData } from './utils.ts';
import RecycleCore from './recycle-core.vue';
import RecycleReverseCore from './recycle-reverse-core.vue';
import Skeleton from './skeleton.vue';
import PullDownUp from './pull-down-up.vue';

const props = defineProps({
	...RecycleCore.props,
	reachBottomDistance: {
		type: Number,
		default: 50
	},
	reverse: Boolean, // 是否反向滚动，正常的是下拉刷新上拉加载，设为true后变为下拉加载，上拉刷新
	// 一开始加载时，整个页面是否展示骨架屏
	skeleton: {
		type: Boolean,
		default: true
	},
	pageSize: {
		type: Number,
		default: 10
	},
	// 开启刷新
	refresh: {
		type: Boolean,
		default: true
	},
	loadData: {
		type: Function,
		required: true,
		default: () => {}
	},
	// 处理返回的结果
	format: Function
});

const pullDownRef = ref(null);
const coreRef = ref(null);
const dataSource = ref([]);
const isLoading = ref(false);
const isRefreshing = ref(false);

let pageInfo = ref({ current: 0, total: 0, count: 0 });

const isEmpty = computed(() => {
	return pageInfo.value.count === 0 && pageInfo.value.current === 1;
});
// 已全部加载
const isEnd = computed(() => {
	return pageInfo.value.current === pageInfo.value.total && pageInfo.value.current > 0;
});

const formatFetchResult = (res) => {
	return {
		data: res.data.list,
		page: res.data.page, // { current: 0, total: 0, count: 0} 当前页数，总页数，总条数
	};
};

const handleLoadData = async (refresh = false) => {
	isLoading.value = true;
	
	let res = await props.loadData(refresh ? 1 : pageInfo.value.current + 1, props.pageSize);
	const { data, page } = props.format ? props.format(res) : formatFetchResult(res);
	pageInfo.value = page;

	const startIndex = (pageInfo.value.current - 1) * props.pageSize;
	dataSource.value.splice(
		startIndex, 
		dataSource.value.length,
		...data
	);

	isLoading.value = false;
	
	await nextTick();

	if (coreRef.value.contentHeight <= coreRef.value.containerHeight) {
		coreRef.value.reachBottom();
	}
};

const handleScrollToBottom = async (e) => {
	if (!isEmpty.value && !isEnd.value && !isLoading.value) {
		await handleLoadData();
	}
};

const handleReleaseUpdate = async () => {
	isRefreshing.value = true;
	const data = await handleLoadData(true);
	isRefreshing.value = false;
	return data;
};

onBeforeMount(() => {
	if (props.skeleton) {
		dataSource.value.push(...createPlaceholderData(PLACEHOLDER_COUNT, props.rowKey));
	}
});

onMounted(() => {
	handleLoadData(true);
});

const $rl_scrollTo = (value, smooth) => {
	coreRef.value.scrollTo(value, smooth);
};

const $rl_scrollToIndex = (index, smooth) => {
	coreRef.value.scrollToIndex(index, smooth);
};

defineExpose({
	scrollTo: $rl_scrollTo,
	scrollToIndex: $rl_scrollToIndex
});
</script>

<style lang="less">
.rl-main {
	
}
</style>