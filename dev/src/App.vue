<template>
	<RecycleList class="v-demo" height="100vh">
		<template #header>
			<div style="height: 100px; background: #ff0000;" />
		</template>
		<template #default="{ row, index}">
			<div 
				:style="{ background: `${index % 2 === 0 ? '#fff000' : '#ffffff'}`, height: `${row.height}px` }"
				style="color: #ff0000;"
			>
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
	
}
</style>