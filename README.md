# RecycleList
Vue3版本的无限滚动列表

### Components
+ **`RecycleCore`**: 可容纳无限数据的滚动容器
+ **`PullDown`**: 提供下拉操作的容器组件
+ **`RecycleList`**: 支持上拉加载和下拉刷新，提供`default(item)`, `header`, `pull-down`, `pull-up`, `empty`的插槽
+ **`ResizeView`**: 监听节点高度变化的组件
+ **`ResizeGrid`**: 多列布局

### TODO List
+ 下拉分页
+ 横向滚动
+ 下拉加载(聊天记录加载)
+ 滚动到指定位置、指定index