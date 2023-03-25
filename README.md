# RecycleList
Vue3版本的无限滚动列表

### Components
+ **`RecycleCore`**: 可容纳无限数据的滚动容器
+ **`PullDown`**: 提供下拉操作的容器组件
+ **`RecycleList`**: 支持上拉加载和下拉刷新，提供`default(item)`, `header`, `pull-down`, `pull-up`, `empty`的插槽
+ **`ResizeView`**: 监听节点高度变化的组件

### 瀑布流容器(多列)
原本是想用`grid-auto-rows: 1px;` 和 `grid-row-start: auto; grid-row-end: span ${itemHeight}`来自动实现瀑布流，但`row-gap`如果设置`10`,产生的实际效果会是`itemHeight` * 10，所以还是需要动态分配item到对应的列上，生成`grid-row-start: xxx; grid-row-end: xx`

### TODO List
+ 瀑布流容器(多列)
+ 横向滚动
+ 滚动到指定位置、指定index