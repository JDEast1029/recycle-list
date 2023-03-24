<template>
	<RecycleList 
		:load-data="loadData"
		class="v-demo"
		height="100vh"
	>
		<template #header>
			<div style="height: 100px; background: #ff0000;">
				header
			</div>
		</template>
		<template #default="{ row, index}">
			<div 
				:style="{ background: `${index % 2 === 0 ? '#fff000' : '#ffffff'}`, height: `${row.height}px` }"
				style="color: #ff0000;"
			>
				{{ row.name }}; $rl_height: {{ row.$rl_height.toFixed(2) }}; $rl_offsetTop: {{ row.$rl_offsetTop }}
			</div>
		</template>
		<template #empty>
			<div style="height: 100px; background: #00ee77;">
				empty
			</div>
		</template>
	</RecycleList>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RecycleList from 'recycle-list';

const pageCount = 10;
const loadData = (page, pageSize) => {
	return new Promise((r, j) => {
		setTimeout(() => {
			const data = Array.from({ length: pageSize }, (it, index) => {
				const id = (page - 1) * pageSize + index;
				return {
					id,
					name: `第${id + 1}条数据`,
					height: 10 + (Math.random() * 100 + 20)
				};
			});
			r({
				data: {
					list: data,
					page: { current: page, total: pageCount, count: 100 }
				}
			});
		}, 1000);
	});
};
</script>

<style lang="less">
.v-demo {
	
}
</style>