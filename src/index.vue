<template>
	<PullDown 
		ref="pullDownRef"
		:height="height"
		:disabled="pullDownDisabled"
		:on-release="handleReleaseUpdate"
		class="rl-main"
	>
		<template #pull-down="{ distance, status }">
			<slot name="pull-down" :distance="distance" :status="status" />
		</template>
		<RecycleCore 
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
		</RecycleCore>
	</PullDown>
</template>

<script setup>
import { onMounted, ref, reactive, onBeforeMount, computed, nextTick, watch } from 'vue';
import { PLACEHOLDER_COUNT } from './constants.ts';
import { createPlaceholderData } from './utils.ts';
import RecycleCore from './recycle-core.vue';
import Skeleton from './skeleton.vue';
import PullDown from './pull-down.vue';

const props = defineProps({
	...RecycleCore.props,
	reachBottomDistance: {
		type: Number,
		default: 50
	},
	// 一开始加载时，整个页面是否展示骨架屏
	skeleton: {
		type: Boolean,
		default: true
	},
	pageSize: {
		type: Number,
		default: 10
	},
	pullDownDisabled: Boolean,
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
	handleLoadData();
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