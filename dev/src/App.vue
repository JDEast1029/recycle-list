<template>
	<RecycleList 
		:load-data="loadData"
		:cols="1"
		:column-gap="10"
		:row-gap="10"
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
				:style="{ background: `${COLORS[index % 4]}`, height: `${row.height}px` }"
				style="color: #fff;"
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

const COLORS = [
	'#DA2A1C',
	'#0072CD',
	'#FFC72A',
	'#02A3E0',
	'#FE4F01'
];
const pageCount = 5;
const loadData = (page, pageSize) => {
	return new Promise((r, j) => {
		setTimeout(() => {
			const data = Array.from({ length: pageSize }, (it, index) => {
				const id = (page - 1) * pageSize + index;
				return {
					id,
					name: `第${id + 1}条数据`,
					height: 40 + (Math.random() * 100 + 20),
				};
			});
			r({
				data: {
					list: data,
					page: { current: page, total: pageCount, count: 50 }
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