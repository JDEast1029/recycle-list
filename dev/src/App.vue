<template>
	<RecycleList class="v-demo" :page-size="40">
		<template #default="{ row, index}">
			<div :style="{ background: `${index % 2 === 0 ? '#fff000' : '#ffffff'}` }" style="height: 50px">
				{{ row.name }} - {{ index }}
			</div>
		</template>
	</RecycleList>
</template>

<script setup>
import { ref } from 'vue';
import RecycleList from 'recycle-list';

const height = ref('20px');

</script>

<style lang="less">
.v-demo {
	height: 100vh;
}
</style>