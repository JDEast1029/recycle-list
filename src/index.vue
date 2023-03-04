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
import { onMounted, ref } from 'vue';
import RecycleCore from './recycle-core.vue';

const props = defineProps({
	...RecycleCore.props,
});

const dataSource = ref([]);

const handleScrollToBottom = (scrollTop) => {
	if (dataSource.value.length <= 41) {
		dataSource.value[40] = {
			id: 40,
			isPlaceholder: true
		};
		setTimeout(() => {
			dataSource.value.splice(40, 10, ...Array.from({ length: 10 }, (it, index) => ({
				id: index,
				name: `第${40 + index + 1}条数据`
			})));
		}, 2000);
	}
};

onMounted(() => {
	setTimeout(() => {
		dataSource.value = Array.from({ length: 40 }, (it, index) => ({
			id: index,
			name: `第${index + 1}条数据`
		}));
	}, 500);
});
</script>

<style lang="less">
.rl-main {
	
}
</style>