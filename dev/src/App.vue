<template>
	<RecycleList 
		:load-data="loadData"
		class="v-demo"
		height="100vh"
	>
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
import { ref, onMounted } from 'vue';
import RecycleList from 'recycle-list';

const loadData = (page, pageSize) => {
	return new Promise((r, j) => {
		setTimeout(() => {
			const data = Array.from({ length: pageSize }, (it, index) => {
				const id = (page - 1) * 10 + index;
				return {
					id,
					name: `第${id + 1}条数据`,
					height: 100 + (id % 3) * 7
				};
			});
			r(data);
		}, 1000);
	});
};
</script>

<style lang="less">
.v-demo {
	
}
</style>