<template>
	<RecycleList 
		ref="listRef"
		:load-data="loadData"
		:reverse="true"
		:cols="1"
		:column-gap="0"
		:row-gap="0"
		:page-size="10"
		class="v-demo"
		height="100vh"
	>
		<template #header>
			<!-- <div style="height: 100px; background: #ff0000;">
				header
			</div> -->
		</template>
		<template #default="{ row, index}">
			<div 
				:style="{ background: `${COLORS[index % 4]}`, height: `${row.height}px` }"
				style="color: #fff;"
			>
				{{ row.name }}; h: {{ row.$rl_height }}; ot: {{ row.$rl_offsetTop }}
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
const height = [86, 122, 149, 94, 83, 127, 85, 159, 71, 158];
const pageCount = 10;

const listRef = ref(null);

const loadData = (page, pageSize) => {
	return new Promise((r, j) => {
		setTimeout(() => {
			const data = Array.from({ length: pageSize }, (it, index) => {
				const id = (page - 1) * pageSize + index;
				return {
					id,
					name: `第${id + 1}条数据`,
					// height: 40 + parseFloat((Math.random() * 100 + 20).toFixed(2)),
					height: 90
				};
			});
			r({
				data: {
					list: data,
					page: { current: page, total: pageCount, count: 500 }
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