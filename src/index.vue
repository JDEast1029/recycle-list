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
			:reach-bottom-distance="100"
			:skeleton="skeleton"
			@scroll-to-bottom="handleScrollToBottom"
		>
			<template #default="{ row, index }">
				<slot v-if="row._recycleHeader" name="header" />
				<slot v-else-if="!row._recycleHeader && !row._recycleFooter && !row._recycleEmpty" :row="row" :index="index - 1" />
				<slot 
					v-else-if="(isLoading || isEnd) && row._recycleFooter"
					name="pull-up"
					:loading="isLoading"
					:end="isEnd"
				>
					<RecycleItem v-if="isLoading" placeholder />
					<div v-else-if="isEnd">已全部加载</div>
				</slot>
				<slot v-else-if="isEmpty && row._recycleEmpty" name="empty" />
			</template>
		</RecycleCore>
	</PullDown>
</template>

<script setup>
import { onMounted, ref, reactive, onBeforeMount, computed, nextTick, watch } from 'vue';
import { PLACEHOLDER_COUNT } from './constants.ts';
import { createPlaceholderData } from './utils.ts';
import RecycleCore from './recycle-core.vue';
import RecycleItem from './recycle-item.vue';
import PullDown from './pull-down.vue';

const props = defineProps({
	...RecycleCore.props,
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
const dataSource = ref([{ _recycleHeader: true }]);
const isLoading = ref(false);
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

const addEmptyItem = () => {
	const length = dataSource.value.length;
	dataSource.value.splice(length, 0, { _recycleEmpty: true, _originIndex: length });
};

const addFooterItem = () => {
	const length = dataSource.value.length;
	dataSource.value.splice(length, 0, { _recycleFooter: true, _originIndex: length });
};

watch(() => isEmpty.value, (newIsEmpty) => {
	newIsEmpty && addEmptyItem();
});
watch(() => isEnd.value, (newIsEnd) => {
	newIsEnd && addFooterItem();
});

const handleLoadData = async (refresh = false) => {
	isLoading.value = true;
	
	let res = await props.loadData(refresh ? 1 : pageInfo.value.current + 1, props.pageSize);
	const { data, page } = props.format ? props.format(res) : formatFetchResult(res);
	pageInfo.value = page;

	const startIndex = (pageInfo.value.current - 1) * props.pageSize;
	dataSource.value.splice(
		startIndex + 1, 
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
		addFooterItem();
		await handleLoadData();
	}
};

const handleReleaseUpdate = () => {
	return handleLoadData(true);
};

onBeforeMount(() => {
	if (props.skeleton) {
		dataSource.value.push(...createPlaceholderData(PLACEHOLDER_COUNT, props.rowKey));
	}
});

onMounted(() => {
	handleLoadData();
});
</script>

<style lang="less">
.rl-main {
	
}
</style>