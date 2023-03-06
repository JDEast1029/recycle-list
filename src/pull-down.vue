<template>
	<div class="rl-pull-down">
		<slot />
	</div>
</template>

<script setup>

const props = defineProps({
	disabled: Boolean,
});

const emit = defineEmits(['pull-down']);


</script>

<style lang="less">
.rl-pull-down {
	// transform: translateY(-22px);
	height: 100%;
}
</style>