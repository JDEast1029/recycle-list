<template>
	<RecycleCore 
		:data-source="dataSource"
	>
		<template #default="{ row }">
			<slot :row="row" />
		</template>
	</RecycleCore>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import RecycleCore from './recycle-core.vue';

const dataSource = ref([]);

onMounted(() => {
	dataSource.value = Array.from({ length: 1000 }, (it, index) => index);
});
</script>