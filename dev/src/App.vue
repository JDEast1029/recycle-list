<template>
	<RecycleList class="v-demo">
		<template #default="{ row, index}">
			<div :style="{ background: `${index % 2 === 0 ? '#fff000' : '#ffffff'}`, height: `${68}px` }" style="color: #ff0000;">
				{{ row.name }}
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