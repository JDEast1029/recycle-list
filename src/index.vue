<template>
	<div class="rl-main">
		<RecycleCore 
			:data-source="dataSource"
			:reach-bottom-distance="100"
			@scroll-to-bottom="handleScrollToBottom"
		>
			<template #default="{ row, index }">
				<slot :row="row" :index="index" />
			</template>
		</RecycleCore>
	</div>
</template>

<script setup>
import { onMounted, ref, onBeforeMount } from 'vue';
import { createPlaceholderData } from './constants.ts';
import RecycleCore from './recycle-core.vue';

const props = defineProps({
	...RecycleCore.props,
	pageSize: {
		type: Number,
		default: 20
	}
});

const dataSource = ref([]);
const isLoaded = ref(false);

let page = 1;

const loadData = () => {
	setTimeout(() => {
		console.log((page - 1) * props.pageSize, props.pageSize);
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
	}, 1000);
};

const handleScrollToBottom = (scrollTop) => {
	if (page <= 100) {
		page++;
		dataSource.value.splice((page - 1) * props.pageSize, 1, ...createPlaceholderData(1, props.rowKey));
		loadData();
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