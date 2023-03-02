<template>
	<RecycleList>
		<template #default="{ row }">
			{{ row }}
		</template>
	</RecycleList>
</template>

<script setup>
import RecycleList from 'recycle-list';

</script>