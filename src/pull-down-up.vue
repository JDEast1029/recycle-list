<template>
	<div class="rl-pdu">
		<slot />
	</div>
</template>

<script setup>

const props = defineProps({
	disablePullDown: Boolean,
	disablePullUp: Boolean
});

const emit = defineEmits(['pull-down', 'pull-up']);


</script>

<style lang="less">
.rl-pdu {
	transform: translateY(-22px);
	height: 100%;
}
</style>