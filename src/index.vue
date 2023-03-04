<template>
	<div class="rl-main">
		<RecycleCore 
			:data-source="dataSource"
			:render-count="renderCount"
			:def-height="defHeight"
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
import { onMounted, ref } from 'vue';
import RecycleCore from './recycle-core.vue';

const props = defineProps({
	...RecycleCore.props,
});

const dataSource = ref([]);

const handleScrollToBottom = (scrollTop) => {
	if (dataSource.value.length <= 21) {
		dataSource.value[20] = {
			id: 20,
			isPlaceholder: true
		};
	}
	// setTimeout(() => {
	// 	dataSource.value[20] = {
	// 		id: 20,
	// 		name: `第${20 + 1}条数据`
	// 	};
	// }, 2000);
};

onMounted(() => {
	setTimeout(() => {
		dataSource.value = Array.from({ length: 20 }, (it, index) => ({
			id: index,
			name: `第${index + 1}条数据`
		}));
	}, 300);
});
</script>

<style lang="less">
.rl-main {
	
}
</style>