<template>
	<PullDownUp class="rl-main">
		<RecycleCore 
			:data-source="dataSource"
			:reach-bottom-distance="100"
			@scroll-to-top="handleScrollToTop"
			@scroll-to-bottom="handleScrollToBottom"
		>
			<template #default="{ row, index }">
				<slot :row="row" :index="index" />
			</template>
			<template #loading>
				<slot name="loading">
					<RecycleItem v-if="isLoading" placeholder />
				</slot>
			</template>
		</RecycleCore>
	</PullDownUp>
</template>

<script setup>
import { onMounted, ref, onBeforeMount } from 'vue';
import { createPlaceholderData } from './constants.ts';
import RecycleCore from './recycle-core.vue';
import RecycleItem from './recycle-item.vue';
import PullDownUp from './pull-down-up.vue';

const props = defineProps({
	...RecycleCore.props,
	pageSize: {
		type: Number,
		default: 20
	}
});

const dataSource = ref([]);
const isLoading = ref(false);

let page = 1;

const loadData = () => {
	isLoading.value = true;
	return new Promise((r, j) => {
		setTimeout(() => {
			dataSource.value.splice(
				(page - 1) * props.pageSize, 
				props.pageSize,
				...Array.from({ length: props.pageSize }, (it, index) => {
					const id = (page - 1) * props.pageSize + index;
					return {
						id,
						name: `第${id + 1}条数据`,
						height: 100 + (id % 3) * 7
					};
				})
			);
			isLoading.value = false;
			r();
		}, 1000);
	});
};

const handleScrollToTop = (e) => {
	e.preventDefault();
};

const handleScrollToBottom = async (e) => {
	if (page <= 100 && !isLoading.value) {
		page++;
		isLoading.value = true;
		// dataSource.value.splice((page - 1) * props.pageSize, 1, ...createPlaceholderData(1, props.rowKey));
		await loadData();
		isLoading.value = false;
	}
};

onMounted(() => {
	loadData();
});
</script>

<style lang="less">
.rl-main {
	
}
</style>