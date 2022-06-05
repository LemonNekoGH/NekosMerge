/**
 * 该文件为GameCreator编辑器自动生成的代码，请勿修改
 */

/**
 * 1-开始界面 [BASE]
 */
class GUI_1 extends GUI_BASE {
   背景:UIBitmap;
   容器:UIRoot;
   标题:UIString;
   开始按钮:NekoButton;
   排行榜按钮:NekoButton;
   设置按钮:NekoButton;
   语言切换按钮:NekoButton;
   关于按钮:NekoButton;
   constructor(){
      super(1);
   }
}
class ListItem_1 extends UIListItemData {
   背景:string;
   标题:string;
   开始按钮:number;
   排行榜按钮:number;
   设置按钮:number;
   语言切换按钮:number;
   关于按钮:number;
}

/**
 * 2-游戏中 [BASE]
 */
class GUI_2 extends GUI_BASE {
   背景:UIBitmap;
   分数:UIVariable;
   最高分数:UIVariable;
   标题:UIString;
   分数标签:UIString;
   最高分数标签:UIString;
   分数作废提示:UIString;
   作弊标题:UIString;
   终端按钮:NekoButton;
   暂停按钮:NekoButton;
   重开按钮:NekoButton;
   设置按钮:NekoButton;
   退出按钮:NekoButton;
   constructor(){
      super(2);
   }
}
class ListItem_2 extends UIListItemData {
   背景:string;
   分数:number;
   最高分数:number;
   标题:string;
   分数标签:string;
   最高分数标签:string;
   分数作废提示:string;
   作弊标题:string;
   终端按钮:number;
   暂停按钮:number;
   重开按钮:number;
   设置按钮:number;
   退出按钮:number;
}

/**
 * 3-设置界面 [BASE]
 */
class GUI_3 extends GUI_BASE {
   对话框遮罩:UIBitmap;
   容器:UIRoot;
   对话框背景:UIBitmap;
   文本:UIString;
   开发者模式开关:UISwitch;
   开发者模式开关标签:UIString;
   FPS开关:UISwitch;
   FPS开关标签:UIString;
   确定按钮:NekoButton;
   constructor(){
      super(3);
   }
}
class ListItem_3 extends UIListItemData {
   对话框遮罩:string;
   对话框背景:string;
   文本:string;
   开发者模式开关:number;
   开发者模式开关标签:string;
   FPS开关:number;
   FPS开关标签:string;
   确定按钮:number;
}

/**
 * 4- [BASE]
 */
class GUI_4 extends GUI_BASE {

   constructor(){
      super(4);
   }
}
class ListItem_4 extends UIListItemData {

}

/**
 * 5- [BASE]
 */
class GUI_5 extends GUI_BASE {

   constructor(){
      super(5);
   }
}
class ListItem_5 extends UIListItemData {

}

/**
 * 6- [BASE]
 */
class GUI_6 extends GUI_BASE {

   constructor(){
      super(6);
   }
}
class ListItem_6 extends UIListItemData {

}

/**
 * 7-指令界面 [BASE]
 */
class GUI_7 extends GUI_BASE {
   对话框遮罩:UIBitmap;
   输入框背景图片:UIBitmap;
   指令输入:UIInput;
   输入提示:UIString;
   输出框背景图片:UIBitmap;
   输出框容器:UIRoot;
   输出文本:UIString;
   返回按钮:UIButton;
   执行按钮:UIButton;
   constructor(){
      super(7);
   }
}
class ListItem_7 extends UIListItemData {
   对话框遮罩:string;
   输入框背景图片:string;
   指令输入:string;
   输入提示:string;
   输出框背景图片:string;
   输出文本:string;

}

/**
 * 8-输入名字 [BASE]
 */
class GUI_8 extends GUI_BASE {
   对话框遮罩:UIBitmap;
   容器:UIRoot;
   对话框背景图片:UIBitmap;
   提示文本:UIString;
   可输入文本:UIInput;
   输入提示:UIString;
   确定按钮:NekoButton;
   取消按钮:NekoButton;
   constructor(){
      super(8);
   }
}
class ListItem_8 extends UIListItemData {
   对话框遮罩:string;
   对话框背景图片:string;
   提示文本:string;
   可输入文本:string;
   输入提示:string;
   确定按钮:number;
   取消按钮:number;
}

/**
 * 9- [BASE]
 */
class GUI_9 extends GUI_BASE {

   constructor(){
      super(9);
   }
}
class ListItem_9 extends UIListItemData {

}

/**
 * 10-加载界面 [BASE]
 */
class GUI_10 extends GUI_BASE {
   文本:UIString;
   constructor(){
      super(10);
   }
}
class ListItem_10 extends UIListItemData {
   文本:string;
}

/**
 * 11-plug_对话框界面 [BASE]
 */
class GUI_11 extends GUI_BASE {
   图片:UIBitmap;
   容器:UIRoot;
   消息背景:UIBitmap;
   消息文本:UIString;
   确认按钮:NekoButton;
   取消按钮:NekoButton;
   constructor(){
      super(11);
   }
}
class ListItem_11 extends UIListItemData {
   图片:string;
   消息背景:string;
   消息文本:string;
   确认按钮:number;
   取消按钮:number;
}

/**
 * 1001-基础按钮 [BASE]
 */
class GUI_1001 extends GUI_BASE {
   btn:UIButton;
   constructor(){
      super(1001);
   }
}
class ListItem_1001 extends UIListItemData {

}

/**
 * 15001-plug_排行榜 [BASE]
 */
class GUI_15001 extends GUI_BASE {
   背景遮罩:UIBitmap;
   容器:UIRoot;
   背景:UIBitmap;
   list:UIList; // Item=15002
   表头容器:UIRoot;
   rank:UIString;
   nickname:UIString;
   score:UIString;
   确定界面:NekoButton;
   constructor(){
      super(15001);
   }
}
class ListItem_15001 extends UIListItemData {
   背景遮罩:string;
   背景:string;
   list:UIListItemData[];
   rank:string;
   nickname:string;
   score:string;
   确定界面:number;
}

/**
 * 15002-plug_排行榜_Item [BASE]
 */
class GUI_15002 extends GUI_BASE {
   ranking:UIString;
   nickname:UIString;
   score:UIString;
   constructor(){
      super(15002);
   }
}
class ListItem_15002 extends UIListItemData {
   ranking:string;
   nickname:string;
   score:string;
}
GameUI["__compCustomAttributes"] = {"UIRoot":["enabledLimitView","scrollShowType","hScrollBar","hScrollBg","vScrollBar","vScrollBg","scrollWidth","slowmotionType","enabledWheel","hScrollValue","vScrollValue"],"UIButton":["label","image1","grid9img1","image2","grid9img2","image3","grid9img3","fontSize","color","overColor","clickColor","bold","italic","smooth","align","valign","letterSpacing","font","textDx","textDy","textStroke","textStrokeColor"],"UIBitmap":["image","grid9","flip","pivotType"],"UIString":["text","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor","onChangeFragEvent"],"UIVariable":["varID","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor","onChangeFragEvent"],"UICustomGameNumber":["customData","previewNum","previewFixed","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor"],"UICustomGameString":["customData","inEditorText","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor"],"UIAvatar":["avatarID","scaleNumberX","scaleNumberY","orientationIndex","avatarFPS","playOnce","isPlay","avatarFrame","actionID","avatarHue"],"UIStandAvatar":["avatarID","actionID","scaleNumberX","scaleNumberY","flip","playOnce","isPlay","avatarFrame","avatarFPS","avatarHue"],"UIAnimation":["animationID","scaleNumberX","scaleNumberY","aniFrame","playFps","playType","showHitEffect","silentMode"],"UIInput":["text","fontSize","color","bold","italic","align","leading","font","wordWrap","restrict","inputMode","maxChars","shadowEnabled","shadowColor","shadowDx","shadowDy","onInputFragEvent","onEnterFragEvent"],"UICheckBox":["selected","image1","grid9img1","image2","grid9img2","onChangeFragEvent"],"UISwitch":["selected","image1","grid9img1","image2","grid9img2","previewselected","onChangeFragEvent"],"UITabBox":["selectedIndex","itemImage1","grid9img1","itemImage2","grid9img2","itemWidth","itemHeight","items","rowMode","spacing","labelSize","labelColor","labelFont","labelBold","labelItalic","smooth","labelAlign","labelValign","labelLetterSpacing","labelSelectedColor","labelDx","labelDy","labelStroke","labelStrokeColor","onChangeFragEvent"],"UISlider":["image1","bgGrid9","image2","blockGrid9","image3","blockFillGrid9","step","min","max","value","transverseMode","blockFillMode","blockPosMode","fillStrething","onChangeFragEvent"],"UIGUI":["guiID","instanceClassName","dpWidth"],"UIList":["itemModelGUI","previewSize","selectEnable","repeatX","itemWidth","itemHeight","spaceX","spaceY","scrollShowType","hScrollBar","hScrollBg","vScrollBar","vScrollBg","scrollWidth","selectImageURL","selectImageGrid9","selectedImageAlpha","selectedImageOnTop","overImageURL","overImageGrid9","overImageAlpha","overImageOnTop","overSelectMode","slowmotionType"],"UIComboBox":["itemLabels","selectedIndex","bgSkin","bgGrid9","fontSize","color","bold","italic","smooth","align","valign","letterSpacing","font","textDx","textStroke","textStrokeColor","displayItemSize","listScrollBg","listScrollBar","listAlpha","itemHeight","listBgColor","itemFontSize","itemColor","itemBold","itemItalic","itemAlign","itemValign","itemLetterSpacing","itemFont","itemOverColor","itemOverBgColor","itemTextDx","itemTextDy","itemTextStroke","itemTextStrokeColor","onChangeFragEvent"],"UIVideo":["videoURL","playType","volume","playbackRate","currentTime","muted","loop","pivotType","flip","onLoadedFragEvent","onErrorFragEvent","onCompleteFragEvent"]};
