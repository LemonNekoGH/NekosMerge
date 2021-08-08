# 合成大猫咪 0.2.3
这是一个用 GameCreator 制作的类似合成大西瓜的游戏

预览版本已经发布至 [GC 云平台](http://f.gamecreator.com.cn/game.php?id=346)

### 使用核心模板和以下可视化编辑器：

1. 行走图编辑器
2. 界面编辑器
3. 自定义指令编辑器（配合代码）
4. 场景编辑器
5. 对话框样式编辑器

### TODO-List
- [ ] 手机端检测
- [x] 碰撞检测
- [x] 优化碰撞检测
- [x] 防止溢出边界
- [x] 计算分数
- [x] 保存最高分
- [x] 暂停游戏
- [ ] 正常结束游戏
- [x] 退出和重新进入游戏
- [ ] 排行榜
- [x] 移除退出并重新进入游戏后的幽灵猫咪
- [x] 在游戏退出重进后应该重置当前分数
- [x] 更改猫咪大小
- 优化界面
    - [x] 自定义按钮图片
    - [x] 自定义字体
- [x] 在新的猫咪出现之前不应该响应鼠标事件
- [ ] 不应该重复计算分数
- [ ] 更科学的分数计算方式
- [ ] 继续优化碰撞检测
- [x] 显示设置按钮
- [x] 显示对话框时不应该响应鼠标事件
- 设置选项
    - [x] 保存设置
    - [ ] 重置设置
    -  开发者模式
        - [x] 显示 FPS
        - [ ] 在游戏内部执行脚本
        - [x] 关闭开发者模式时，子选项应当都被关闭
    - [ ] 开发者信息
- [x] 减淡游戏进行中时的背景猫咪颜色
- [ ] 制作第 8、9、10 级猫咪
- [x] 修复设置项并不会保存到存档中的 BUG
- [x] 当游戏正在进行时，设置关闭回调，提示用户会丢失存档（不需要了）
- [x] 随着等级更高的猫咪出现，允许随机出现更高级的猫咪，但是不能超过 4 级
- [ ] 游戏方法指引


### 许可声明 <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/4.0/80x15.png" /></a>
源代码使用 Apache 2.0 许可证开源，图片素材等使用 <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">知识共享署名-非商业性使用-禁止演绎 4.0 国际许可协议</a> 进行许可。