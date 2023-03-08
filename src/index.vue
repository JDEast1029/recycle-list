<template>
	<!-- <PullDown 
		ref="pullDownRef"
		:height="height"
		:disabled="pullDownDisabled"
		:on-release="handleReleaseUpdate"
		class="rl-main"
	>
		<template #pull-down="{ distance, status }">
			<slot name="pull-down" :distance="distance" :status="status" />
		</template> -->
	<RecycleCore 
		:data-source="dataSource"
		:height="height"
		:reach-bottom-distance="100"
		:skeleton="skeleton"
		@scroll-to-bottom="handleScrollToBottom"
	>
		<template #default="{ row, index }">
			<slot v-if="row._recycleHeader" name="header" />
			<slot v-else-if="!row._recycleHeader && !row._recycleLoading" :row="row" :index="index - 1" />
			<slot v-else-if="isLoading && row._recycleLoading" name="pull-up">
				<RecycleItem placeholder />
			</slot>
		</template>
	</RecycleCore>
	<!-- </PullDown> -->
</template>

<script setup>
import { onMounted, ref, onBeforeMount } from 'vue';
import { createPlaceholderData } from './constants.ts';
import RecycleCore from './recycle-core.vue';
import RecycleItem from './recycle-item.vue';
import PullDown from './pull-down.vue';

const props = defineProps({
	...RecycleCore.props,
	pageSize: {
		type: Number,
		default: 20
	},
	pullDownDisabled: Boolean,
	loadData: {
		type: Function,
		required: true,
		default: () => {}
	}
});

const pullDownRef = ref(null);
const dataSource = ref([]);
const isLoading = ref(false);

let page = 1;

const loadData = async () => {
	isLoading.value = true;
	let data = await props.loadData(page, props.pageSize);
	const startIndex = (page - 1) * props.pageSize;
	data = startIndex === 0 ? [{ _recycleHeader: true }, ...data] : data;
	dataSource.value.splice(
		startIndex === 0 ? startIndex : startIndex + 1, 
		props.pageSize,
		...data
	);
	isLoading.value = false;
};
const addLoadingItem = () => {
	const length = dataSource.value.length;
	dataSource.value.splice(length, 0, { _recycleLoading: true, _originIndex: length });
};
const handleScrollToBottom = async (e) => {
	if (page <= 100 && !isLoading.value) {
		page++;
		isLoading.value = true;
		addLoadingItem();
		await loadData();

		isLoading.value = false;
	}
};

const handleReleaseUpdate = () => {
	page = 1;
	return loadData();
};

onMounted(() => {
	loadData();
});
</script>

<style lang="less">
.rl-main {
	
}
</style>