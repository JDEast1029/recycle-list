<template>
	<ResizeView 
		ref="itemRef"
		class="rl-item"
		@resize="handleResize"
		@ready="handleReady"
	>
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
	</ResizeView>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ResizeView from './resize-view.vue';

const props = defineProps({
	placeholder: Boolean
});

const emit = defineEmits(['ready', 'resize']);

const itemRef = ref(null);

const handleResize = (viewRect) => {
	emit('resize', viewRect);
};

const handleReady = (viewRect) => {
	emit('ready', viewRect);
};

</script>

<style lang="less">
.rl-item {
	&__skeleton {
		display: table;
		width: 100%;
		padding: 5px;
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