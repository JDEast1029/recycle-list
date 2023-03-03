<template>
	<div class="rl-main">
		<RecycleCore 
			:data-source="dataSource"
			:render-count="pageSize"
			:def-height="defHeight"
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
	pageSize: RecycleCore.props.renderCount
});

const dataSource = ref([]);

onMounted(() => {
	dataSource.value = Array.from({ length: 100 }, (it, index) => ({
		id: index,
		name: `第${index + 1}条数据`
	}));
});
</script>

<style lang="less">
.rl-main {
	
}
</style>