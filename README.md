# 合成大猫咪 1.1.0
这是一个用 GameCreator 制作的类似合成大西瓜的游戏

已经发布至 [GC 云平台](http://f.gamecreator.com.cn/game.php?id=346)

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
- [x] 正常结束游戏
- [x] 退出和重新进入游戏
- [ ] 排行榜
- [x] 移除退出并重新进入游戏后的幽灵猫咪
- [x] 在游戏退出重进后应该重置当前分数
- [x] 更改猫咪大小
- 优化界面
    - [x] 自定义按钮图片
    - [x] 自定义字体
- [x] 在新的猫咪出现之前不应该响应鼠标事件
- [x] 显示设置按钮
- [x] 显示对话框时不应该响应鼠标事件
- 设置选项
    - [x] 保存设置
    - [ ] 重置设置
    -  开发者模式
        - [x] 显示 FPS
        - [x] 在游戏内部执行脚本
        - [x] 按 Enter 键执行
        - [x] 按键盘上键显示上一条执行过的按钮
        - [x] 按键盘下键显示下一条执行过的按钮
        - [x] 关闭开发者模式时，子选项应当都被关闭
        - [ ] 可以用 :q 退出终端
        - [ ] 添加开关：允许使用游戏外指令
        - [ ] 当指令界面存在，游戏结束时，应该在输出栏显示游戏结束，并在指令界面关闭后再显示游戏结束界面
    - [ ] 开发者信息
- [x] 减淡游戏进行中时的背景猫咪颜色
- [ ] 制作第 8、9、10 级猫咪
- [x] 修复设置项并不会保存到存档中的 BUG
- [x] 当游戏正在进行时，设置关闭回调，提示用户会丢失存档（不需要了）
- [x] 随着等级更高的猫咪出现，允许随机出现更高级的猫咪，但是不能超过 4 级
- [ ] 游戏方法指引
- [x] 修改UI布局
    - [ ] 思考如何填充布局空位
- [x] 在鼠标周围加一圈进行区分
- [x] 用世界属性代替代码变量
- [ ] 按 esc 关闭界面
- [x] 显示重开按钮
- [ ] 使用世界设定来保存结束判定时间
- [ ] 用指令添加的测试用地板应当显示出来
- [x] 将物理引擎更换为更现代的版本 (Matter.js)
- [ ] 显示倍速按钮
- [x] 当任何指令执行后，此次游戏分数作废
- [ ] 新增自动模式
- [x] 当检测到作弊后，退出并重新开始游戏时作弊警告依然存在
- [x] 当检测到作弊后，退出到首页时界面事件仍在执行
- [ ] 加入合成过的猫咪数量统计
- [x] 当检测到作弊后，将标题改成作弊大猫咪

### 感谢列表
 - [小音](https://github.com/LittleSound)
 - [Feng](https://github.com/wardenfeng)

### 许可声明 <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/4.0/80x15.png" /></a>
源代码使用 Apache 2.0 许可证开源，图片素材等使用 <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">知识共享署名-非商业性使用-禁止演绎 4.0 国际许可协议</a> 进行许可。
