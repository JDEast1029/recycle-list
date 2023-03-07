<template>
	<PullDown 
		ref="pullDownRef"
		:height="height"
		:disabled="pullDownDisabled"
		:on-release="handleReleaseUpdate"
		class="rl-main"
	>
		<RecycleCore 
			:data-source="dataSource"
			:height="height"
			:reach-bottom-distance="100"
			:skeleton="skeleton"
			@scroll-to-bottom="handleScrollToBottom"
		>
			<template #header>
				<slot name="header" />
			</template>
			<template #default="{ row, index }">
				<slot :row="row" :index="index" />
			</template>
			<template v-if="isLoading" #footer>
				<slot name="pull-up">
					<RecycleItem placeholder />
				</slot>
			</template>
		</RecycleCore>
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
	const data = await props.loadData(page, props.pageSize);
	dataSource.value.splice(
		(page - 1) * props.pageSize, 
		props.pageSize,
		...data	
	);
	page++;
	isLoading.value = false;
};

const handleScrollToBottom = async (e) => {
	if (page <= 100 && !isLoading.value) {
		page++;
		isLoading.value = true;
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