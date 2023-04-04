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


### 注意
1. 如果你是使用的Git相关的应用程序(SublimeMerge)，她的 PATH 环境变量与你的终端中的 PATH 不同，导致 Git 无法找到所需的命令，你可以在终端中运行 "echo $PATH" 命令查看当前的 PATH 环境变量，并将 Git 应用程序的 PATH 设置为相同的值。
2. 如果你使用的是版本管理脚本（如 nvm、n、rbenv、pyenv 等），可以使用 ~/.huskyrc 文件在运行钩子之前加载所需的脚本。以 nvm 为例，可以在 ~/.huskyrc 文件中添加以下内容：
```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```