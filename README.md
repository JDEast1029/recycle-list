# RecycleList
Vue3版本的无限滚动列表

### Features 
- [x] 下拉刷新和上拉加载
- [x] 下拉加载很上拉刷新
- [x] 垂直方向单列和多列滚动
- [x] 垂直方向瀑布流
- [ ] 水平方向的正向和反向列表和瀑布流

### Components
+ **`RecycleCore`**: 可容纳无限数据的滚动容器
+ **`PullDown`**: 提供下拉操作的容器组件
+ **`RecycleList`**: 支持上拉加载和下拉刷新，提供`default(item)`, `header`, `pull-down`, `pull-up`, `empty`的插槽
+ **`ResizeView`**: 监听节点高度变化的组件
+ **`ResizeGrid`**: 多列布局