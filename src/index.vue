<template>
	<div class="rl-main">
		<RecycleCore 
			:data-source="dataSource"
			:render-count="renderCount"
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
});

const dataSource = ref([]);

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