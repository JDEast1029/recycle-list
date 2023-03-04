<template>
	<RecycleList class="v-demo" :render-count="10">
		<template #default="{ row, index}">
			<div :style="{ background: `${index % 2 === 0 ? '#fff000' : '#ffffff'}`, height: `${100}px` }" style="color: #ff0000;">
				{{ row.name }} - {{ index }}
			</div>
		</template>
	</RecycleList>
</template>

<script setup>
import { ref } from 'vue';
import RecycleList from 'recycle-list';

</script>

<style lang="less">
.v-demo {
	height: 100vh;
}
</style>