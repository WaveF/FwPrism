# FwPrism

All-in-One Command Panel for Fireworks

> FwPrism is base on [JSML Library][jsml], more information please visit [JohnDurnning's website][johndurnning-web].

<br>

## Install

- Copy "FwPrism" folder to Fireworks installation folder > Configuration\Command Panels
- Restart Fireworks.exe
- Launch FwPrism from menu: Window -> FwPrism

## How to use

### Main View

- Select module from dropdown menu, click the "Launch" buton switch to other module.
- Click "+" button to add module ".js" file for open file dialog
- Click "-" button to remove selected module from FwPrism

### Module View

- Click "←" button on the top right corner to go back Main View

### When module error to load

- Run "FwPrism\core\restore.jsf" to restore FwPrism's Main View,

<br>

## Randomize

Randomize position / rotation / blur / alpha / scale / color for selected layers.

![Randomize](https://github.com/WaveF/FwPrism/blob/master/screenshots/randomize.png)

### v0.6.5

2018-10-23

Update:

+ hold down Ctrl and click RandomizeIt button will run undo before randomize

Fixed:

+ fix Ctrl keyUp function error

### v0.6.4

2018-10-23

Update:

+ support English and Chinese layout

### v0.6.3

2018-10-22

Update:

+ add Fetch button for Range to fetch [x, y, width, height] from selected object

Fixed:

+ Position in Range(x, y, width, height) will now working correctly

### v0.6.2

2018-10-22

Update:

+ click title bar will solo the randomize
+ add CLEAR button for re-zero the clones number
+ add Auto Exclude option for exclude the layer selected from clone number
+ hold down CTRL key and adjust clones number will +/- by 10
+ add Lightness mode for Hue group

Known Issues:

- Position in Range(x, y) is not working correctly

<br>

## CSS Generator

If Adobe's CSS Properties panel is not working, here's the replacement.

![CSS_Gerator](https://github.com/WaveF/FwPrism/blob/master/screenshots/css_generator.png)

### v1.1.0

2017-11-05

更新：
+ 新增支持颜色rgba含透明色值
+ 新增支持渐变rgba颜色及权重
+ 新增支持渐变角度
+ 新增支持border边框属性（包括内外边框）
+ 新增支持Fw投影滤镜
+ 新增在浏览器中查看css效果
+ 新增自定义浏览器预览（会生成配置文件保存浏览器设置，重启面板可恢复之前设定）
+ 新增只更新代码复选框（点击预览时不会拉起浏览器新标签页，需手动刷新）
+ 新增复制CSS代码按钮

已知问题：
- 径向渐变css部分未完成
- 渐变起始点及结束点颜色权重需在渐变色设置中完成，而非控制杆
- 内投影及其他滤镜未支持
- 不支持border边框叠加
- 移除生成老旧浏览器css选项，只会生成标准HTML5的CSS3代码

<br>

### Renamer

Rename selected Layers or Slices, simular as Bulk Rename Utility.

![Renamer](https://github.com/WaveF/FwPrism/blob/master/screenshots/renamer.png)

<br>

### Retina Assistant

Export selected layers to custom scale size .png files, and then compress with OptiPNG.

![RetinaAssistant](https://github.com/WaveF/FwPrism/blob/master/screenshots/retina_assistant.png)

<br>

### Unit Converter

![UnitConverter](https://github.com/WaveF/FwPrism/blob/master/screenshots/unit_converter.png)

<br>

### WebFont

` ...以后改名为 IconFont，未完成... `

![WebFont](https://github.com/WaveF/FwPrism/blob/master/screenshots/webfont.png)

<br>

### Market

` 服务器搬迁，等待重建... `

<br>

### Measure

` 仅测试，等待开发... `

[jsml]: http://johndunning.com/fireworks/about/JSMLLibrary
[johndurnning-web]: http://johndunning.com/