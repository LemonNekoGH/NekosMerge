/**
 * 该文件为GameCreator编辑器自动生成的代码，请勿修改
 */

/**
 * 1-开始界面 [BASE]
 */
class GUI_1 extends GUI_BASE {
   背景:UIBitmap;
   标题:UIString;
   开始按钮:UIButton;
   设置按钮:UIButton;
   constructor(){
      super(1);
   }
}
class ListItem_1 extends UIListItemData {
   背景:string;
   标题:string;

}

/**
 * 2-游戏中 [BASE]
 */
class GUI_2 extends GUI_BASE {
   背景:UIBitmap;
   分数:UIVariable;
   最高分数:UIVariable;
   标题:UIString;
   退出按钮:UIButton;
   暂停按钮:UIButton;
   分数标签:UIString;
   最高分数标签:UIString;
   设置按钮:UIButton;
   分数作废提示:UIString;
   重开按钮:UIButton;
   终端按钮:UIButton;
   作弊标题:UIString;
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
   确定按钮:UIButton;
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

}

/**
 * 4-退出对话框 [BASE]
 */
class GUI_4 extends GUI_BASE {
   对话框遮罩:UIBitmap;
   对话框背景图片:UIBitmap;
   确定按钮:UIButton;
   取消按钮:UIButton;
   退出提示:UIString;
   constructor(){
      super(4);
   }
}
class ListItem_4 extends UIListItemData {
   对话框遮罩:string;
   对话框背景图片:string;
   退出提示:string;
}

/**
 * 5-暂停提示 [BASE]
 */
class GUI_5 extends GUI_BASE {
   对话框遮罩:UIBitmap;
   对话框背景图片:UIBitmap;
   继续按钮:UIButton;
   暂停提示:UIString;
   constructor(){
      super(5);
   }
}
class ListItem_5 extends UIListItemData {
   对话框遮罩:string;
   对话框背景图片:string;
   暂停提示:string;
}

/**
 * 6-游戏结束 [BASE]
 */
class GUI_6 extends GUI_BASE {
   对话框遮罩:UIBitmap;
   对话框背景图片:UIBitmap;
   重开按钮:UIButton;
   退出按钮:UIButton;
   退出提示:UIString;
   constructor(){
      super(6);
   }
}
class ListItem_6 extends UIListItemData {
   对话框遮罩:string;
   对话框背景图片:string;
   退出提示:string;
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
 * 1001-模拟碰撞边界 [BASE]
 */
class GUI_1001 extends GUI_BASE {
   碰撞位置1:UIString;
   碰撞位置2:UIString;
   碰撞位置3:UIString;
   碰撞位置4:UIString;
   碰撞位置5:UIString;
   碰撞位置6:UIString;
   碰撞位置7:UIString;
   碰撞位置8:UIString;
   碰撞位置9:UIString;
   碰撞位置10:UIString;
   碰撞位置11:UIString;
   碰撞位置12:UIString;
   碰撞位置13:UIString;
   碰撞位置14:UIString;
   碰撞位置15:UIString;
   碰撞位置16:UIString;
   碰撞位置17:UIString;
   碰撞位置18:UIString;
   碰撞位置19:UIString;
   碰撞位置20:UIString;
   碰撞位置21:UIString;
   碰撞位置22:UIString;
   碰撞位置23:UIString;
   碰撞位置24:UIString;
   constructor(){
      super(1001);
   }
}
class ListItem_1001 extends UIListItemData {
   碰撞位置1:string;
   碰撞位置2:string;
   碰撞位置3:string;
   碰撞位置4:string;
   碰撞位置5:string;
   碰撞位置6:string;
   碰撞位置7:string;
   碰撞位置8:string;
   碰撞位置9:string;
   碰撞位置10:string;
   碰撞位置11:string;
   碰撞位置12:string;
   碰撞位置13:string;
   碰撞位置14:string;
   碰撞位置15:string;
   碰撞位置16:string;
   碰撞位置17:string;
   碰撞位置18:string;
   碰撞位置19:string;
   碰撞位置20:string;
   碰撞位置21:string;
   碰撞位置22:string;
   碰撞位置23:string;
   碰撞位置24:string;
}

/**
 * 15001- [BASE]
 */
class GUI_15001 extends GUI_BASE {

   constructor(){
      super(15001);
   }
}
class ListItem_15001 extends UIListItemData {

}
GameUI["__compCustomAttributes"] = {"UIRoot":["enabledLimitView","scrollShowType","hScrollBar","hScrollBg","vScrollBar","vScrollBg","scrollWidth","slowmotionType","enabledWheel","hScrollValue","vScrollValue"],"UIButton":["label","image1","grid9img1","image2","grid9img2","image3","grid9img3","fontSize","color","overColor","clickColor","bold","italic","smooth","align","valign","letterSpacing","font","textDx","textDy","textStroke","textStrokeColor"],"UIBitmap":["image","grid9","flip","pivotType"],"UIString":["text","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor","onChangeFragEvent"],"UIVariable":["varID","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor","onChangeFragEvent"],"UICustomGameNumber":["customData","previewNum","previewFixed","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor"],"UICustomGameString":["customData","inEditorText","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor"],"UIAvatar":["avatarID","scaleNumberX","scaleNumberY","orientationIndex","avatarFPS","playOnce","isPlay","avatarFrame","actionID","avatarHue"],"UIStandAvatar":["avatarID","actionID","scaleNumberX","scaleNumberY","flip","playOnce","isPlay","avatarFrame","avatarFPS","avatarHue"],"UIAnimation":["animationID","scaleNumberX","scaleNumberY","aniFrame","playFps","playType","showHitEffect","silentMode"],"UIInput":["text","fontSize","color","bold","italic","align","leading","font","wordWrap","restrict","inputMode","maxChars","shadowEnabled","shadowColor","shadowDx","shadowDy","onInputFragEvent","onEnterFragEvent"],"UICheckBox":["selected","image1","grid9img1","image2","grid9img2","onChangeFragEvent"],"UISwitch":["selected","image1","grid9img1","image2","grid9img2","previewselected","onChangeFragEvent"],"UITabBox":["selectedIndex","itemImage1","grid9img1","itemImage2","grid9img2","itemWidth","itemHeight","items","rowMode","spacing","labelSize","labelColor","labelFont","labelBold","labelItalic","smooth","labelAlign","labelValign","labelLetterSpacing","labelSelectedColor","labelDx","labelDy","labelStroke","labelStrokeColor","onChangeFragEvent"],"UISlider":["image1","bgGrid9","image2","blockGrid9","image3","blockFillGrid9","step","min","max","value","transverseMode","blockFillMode","blockPosMode","fillStrething","onChangeFragEvent"],"UIGUI":["guiID","instanceClassName","dpWidth"],"UIList":["itemModelGUI","previewSize","selectEnable","repeatX","itemWidth","itemHeight","spaceX","spaceY","scrollShowType","hScrollBar","hScrollBg","vScrollBar","vScrollBg","scrollWidth","selectImageURL","selectImageGrid9","selectedImageAlpha","selectedImageOnTop","overImageURL","overImageGrid9","overImageAlpha","overImageOnTop","overSelectMode","slowmotionType"],"UIComboBox":["itemLabels","selectedIndex","bgSkin","bgGrid9","fontSize","color","bold","italic","smooth","align","valign","letterSpacing","font","textDx","textStroke","textStrokeColor","displayItemSize","listScrollBg","listScrollBar","listAlpha","itemHeight","listBgColor","itemFontSize","itemColor","itemBold","itemItalic","itemAlign","itemValign","itemLetterSpacing","itemFont","itemOverColor","itemOverBgColor","itemTextDx","itemTextDy","itemTextStroke","itemTextStrokeColor","onChangeFragEvent"],"UIVideo":["videoURL","playType","volume","playbackRate","currentTime","muted","loop","pivotType","flip","onLoadedFragEvent","onErrorFragEvent","onCompleteFragEvent"]};
