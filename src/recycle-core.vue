<template>
	<div class="rl-core">
		<div 
			v-for="(item, index) in dataSource"
			:key="rowKey ? item[rowKey] : index"
			class="rl-core__item"
		>
			<slot :row="item" />
		</div>
	</div>
</template>

<script setup>

const props = defineProps({
	dataSource: {
		type: Array,
		default: () => ([])
	},
	rowKey: String
});
</script>

<style lang="less">
.rl-core {
	&__item {
		color: #ff0000;
	}
}
</style>