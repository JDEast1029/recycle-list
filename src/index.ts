import RecycleList from './index.vue';
import RecycleListCore from './recycle-core.vue';
import RecyclePullDown from './pull-down.vue';
import RecycleResizeView from './resize-view.vue';
import { PULL_DOWN_STATUS } from './constants';

RecycleList.Core = RecycleListCore;
RecycleList.PullDown = RecyclePullDown;
RecycleList.ResizeView = RecycleResizeView;

RecycleList.PULL_DOWN_STATUS = PULL_DOWN_STATUS;

export default RecycleList;