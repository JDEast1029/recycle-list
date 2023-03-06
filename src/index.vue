<template>
	<PullDown 
		class="rl-main"
		:disabled="pullDownDisabled"
	>
		<slot name="header" />

		<RecycleCore 
			:data-source="dataSource"
			:reach-bottom-distance="100"
			:skeleton="skeleton"
			@scroll-to-top="handleScrollToTop"
			@scroll-to-bottom="handleScrollToBottom"
		>
			<template #default="{ row, index }">
				<slot :row="row" :index="index" />
			</template>
			<template v-if="isLoading" #extra>
				<slot name="pull-up">
					<RecycleItem placeholder />
				</slot>
			</template>
		</RecycleCore>
		
		<slot name="footer" />
	</PullDown>
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
	pullDownDisabled: Boolean
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