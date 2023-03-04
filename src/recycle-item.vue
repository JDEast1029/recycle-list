<template>
	<div ref="itemRef" class="rl-item">
		<slot v-if="!placeholder" />
		<div v-else class="rl-item__skeleton">
			<div class="rl-item__skeleton--content">
				<div class="rl-item__skeleton--title" style="width:38%" />
				<ul class="rl-item__skeleton--paragraph">
					<li />
					<li />
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
	placeholder: Boolean
});

const emit = defineEmits(['ready', 'resize']);

const itemRef = ref(null);
let currentHeight = 0;
let observerInstance = null;

const getCurrentHeight = () => {
	return itemRef.value.clientHeight;
};

const handleMutationCallback = (mutationsList, observer) => {
	if (getCurrentHeight() !== currentHeight) {
		currentHeight = getCurrentHeight();
		emit('resize', {
			offsetTop: itemRef.value.offsetTop,
			height: currentHeight
		});
	}
};

onMounted(() => {
	currentHeight = getCurrentHeight();
	observerInstance = new MutationObserver(handleMutationCallback);
	observerInstance.observe(itemRef.value, {
		attributes: true, // 监听当前节点的属性变化
		subtree: true, // 监听当前节点树，所有节点的属性变化
		childList: true, // 监听当前节点中发生的节点的新增与删除
	});
	emit('ready', {
		offsetTop: itemRef.value.offsetTop,
		height: currentHeight
	});
});

onUnmounted(() => {
	observerInstance.disconnect();
});

</script>

<style lang="less">
.rl-item {
	&__skeleton {
		display: table;
		width: 100%;
		padding: 6px;
		box-sizing: border-box;
		&--content {
			display: table-cell;
			width: 100%;
			vertical-align: top;
		}
		&--title, &--paragraph > li {
			background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%);
			background-size: 400% 100%;
			animation-name: css-skeleton-loading;
			animation-duration: 1.4s;
			animation-timing-function: ease;
			animation-iteration-count: infinite;
			height: 16px;
			border-radius: 4px;
		}
		ul {
			list-style: none;
			display: block;
			margin-block-end: 8px;
		}
		&--paragraph {
			margin-block-start: 12px;
			padding: 0;
			box-sizing: border-box;
			>li + li {
				margin-block-start: 12px;
			}
		}
	}
}
@keyframes css-skeleton-loading {
	0% {
		background-position: 100% 50%;
	}

	100% {
		background-position: 0 50%;
	}
}
</style>