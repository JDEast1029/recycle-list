import RecycleList from './index.vue';
import RecycleListCore from './recycle-core.vue';
import RecycleListReverseCore from './recycle-reverse-core.vue';
import RecyclePullDownUp from './pull-down-up.vue';
import RecycleResizeView from './resize-view.vue';
import { PULL_STATUS } from './constants';

RecycleList.Core = RecycleListCore;
RecycleList.ReverseCore = RecycleListReverseCore;
RecycleList.PullDownUp = RecyclePullDownUp;
RecycleList.ResizeView = RecycleResizeView;

RecycleList.PULL_STATUS = PULL_STATUS;

export default RecycleList;
