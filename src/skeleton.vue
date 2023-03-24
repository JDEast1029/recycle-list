<template>
	<div class="rl-skeleton">
		<div class="rl-skeleton__content">
			<div class="rl-skeleton__title" style="width:38%" />
			<ul class="rl-skeleton__paragraph">
				<li />
				<li />
			</ul>
		</div>
	</div>
</template>

<style lang="less">
.rl-skeleton {
	display: table;
	width: 100%;
	padding: 5px;
	box-sizing: border-box;
	&__content {
		display: table-cell;
		width: 100%;
		vertical-align: top;
	}
	&__title, &__paragraph > li {
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
	&__paragraph {
		margin-block-start: 12px;
		padding: 0;
		box-sizing: border-box;
		>li + li {
			margin-block-start: 12px;
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