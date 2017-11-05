INFO = { name:"CSS Generator", version:"1.1", type:"panel" };


(function() {

    //================================================================ 初始化设定
    

    var cfgFileName = "fwprism_css_generator.json";
    var cfgFilePath = Files.makePathFromDirAndFile(fw.currentScriptDir, cfgFileName);
    
    var dom = (fw.documents.length>0)?fw.getDocumentDOM():null;
    var sel = fw.selection?fw.selection:[];
    
    var sp = "??";
    var Setting = {
        browserName: "Default Browser",
        browserURL: ""
    };
    var CSSValues = {};
    loadCfg();

    String.prototype.firstUpperCase=function(){
        return this.replace(/^\S/,function(s){return s.toUpperCase();});
    }
    
    
    
    //================================================================== 功能函数
    
    /* 将选中对象的参数转换为代码存储到变量CSSValues，并输出到面板代码区 */
    function updateCSS(inEvent) {
        if (fw.selection==null) {
            resetCssPanel(inEvent);
            return;
        }
        if (fw.selection.length<1) {
            resetCssPanel(inEvent);
            return;
        };

        /* 打开控制台可以看到元素所有属性 */
        var el = fw.selection[0];
        // console.log(el);

        /* 在这里提取元素的属性 */
        CSSValues = {};
        
        getCssWidth(el);
        getCssHeight(el);
        getCssOpacity(el);
        getCssBorderRadius(el);
        getCssFillColor(el);
        getFilters(el);
        getBorder(el);

        updateCSSRow(CSSValues, inEvent);
        inEvent.result.push(
            ["css_prop_list", "dataProvider", getCssData("name")],
            ["css_val_list",  "dataProvider", getCssData("value")],
            ["css_code_text", "text", getCssCode()]
        );

        return inEvent;
    }


    /* 同步显示CSS属性值列表左右的选中状态 */
    function cssListClicked (inEvent) {
        var source, target, val;
            source = inEvent.targetName;

        if (source == "css_prop_list") {
            target = "css_val_list";
            val = inEvent.currentValues.css_prop_list.selectedIndex;
        } else if (source == "css_val_list") {
            target = "css_prop_list";
            val = inEvent.currentValues.css_val_list.selectedIndex;
        }
        inEvent.result.push([target, "selectedIndex", val]);
    }
    
    /* 按钮：复制CSS代码 */
    function copyCSS(inEvent) {
        fw.getDocumentDOM().clipCopyJsToExecute(inEvent.currentValues.css_code_text);
    }

    /* 清空面板CSS代码区（未选中对象时使用） */
    function resetCssPanel (inEvent) {
        inEvent.result.push(
            ["css_prop_list", "dataProvider", []],
            ["css_val_list",  "dataProvider", []],
            ["css_code_text", "text", ""]
        );
    }

    /* 获取对象宽度 */
    function getCssWidth (el) {
        CSSValues["width"] = el.width + "px";
    }

    /* 获取对象高度 */
    function getCssHeight (el) {
        CSSValues["height"] = el.height + "px";
    }

    /* 获取对象透明度 */
    function getCssOpacity (el) {
        if (el.opacity == 100) return;
        CSSValues["opacity"] = FormatValue(el.opacity/100);
    }

    /* 获取对象边框线 */
    function getBorder (el) {
        if (!el.pathAttributes.brush) return;
        var borderWidth = el.pathAttributes.brush.diameter;
        var borderColor = el.pathAttributes.brushColor;

        var borderDirection = el.pathAttributes.brushPlacement;
        if (borderDirection = "inside") {
            CSSValues["box-sizing"] = "border-box";
        }

        var borderStyle = "solid";
        if (el.pathAttributes.brush.category == "bc_Dashed") {
            borderStyle = "dashed";

            if (el.pathAttributes.brush.name == "bn_Dotted") {
                borderStyle = "dotted";
            }
        }

        CSSValues["border"] = [borderWidth+"px", borderStyle, ConvertHexToRgba(borderColor)].join(" ");
    }

    /* 获取对象圆角 */
    function getCssBorderRadius (el) {
        if (el.roundness==undefined || el.roundness==0) return;
        CSSValues["border-radius"] = el.roundness + "px";
    }

    /* 获取对象填充色（纯色或渐变） */
    function getCssFillColor (el) {
        if (!el.pathAttributes) return;
        if (!el.pathAttributes.fill) return;
        if (el.pathAttributes.fill.gradient==null) {
            // 单色
            var solidColor;
            var fillColorValue = el.pathAttributes.fillColor;
            
            if (fillColorValue.length==9) {
                solidColor = ConvertHexToRgba(fillColorValue);
            } else {
                solidColor = fillColorValue;
            }
            
            CSSValues["background-color"] = solidColor;
            
        } else {
            // 渐变
            var template = "";
            switch (el.pathAttributes.fill.category) {
                // 线性
                case "fc_Linear":
                    template = "linear-gradient($_angle_$, $_colors_$)";
                    break;
                // 径向
                case "fc_Circular":
                    template = "radial-gradient($_colors_$)";
                    break;
            }

            // 获取渐变颜色与权重
            var gradientColors = [];
            var gNodes = el.pathAttributes.fill.gradient.nodes;
            for (var i=0; i<gNodes.length; i++) {
                var node = gNodes[i];
                if (!node.isOpacityNode) {
                    gradientColors.push( node.color + " " + FormatValue(node.position)*100+"%" );
                }
            }

            // 计算渐变角度
            var fillHandle1 = el.pathAttributes.fillHandle1;
            var fillHandle2 = el.pathAttributes.fillHandle2;
            var angle = getGradientAngle(fillHandle1, fillHandle2) + "deg";


            CSSValues["background"] = template.replace("$_angle_$", angle).replace("$_colors_$", gradientColors.join(","));
        }
    }

    /* 获取对象滤镜 */
    function getFilters (el) {
        if (!el.effectList) return;
        var filter, css;
        var effects = el.effectList.effects;

        for (var i=0; i<effects.length; i++) {
            filter = effects[i];

            // 投影
            if (filter.name == "Drop Shadow" && filter.EffectIsVisible) {
                var sx = Math.round(filter.ShadowDistance * Math.cos(getRadianByAngle(filter.ShadowAngle)));
                var sy = Math.round(filter.ShadowDistance * Math.sin(getRadianByAngle(filter.ShadowAngle))) * -1;
                CSSValues["box-shadow"] = [sx+"px", sy+"px", filter.ShadowBlur+"px", ConvertHexToRgba(filter.ShadowColor)].join(" ");
            }
        }
    }

    /* 获取渐变角度 */
    function getGradientAngle (p1, p2) {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var radian = Math.atan2(dx, dy);
        var angle = Math.round( radian*180/Math.PI ) * -1;

        return angle;
    }

    /* 更新面板上方CSS属性值的行数 */
    function updateCSSRow (cv, inEvent) {
        var count = 0;
        for (var i in cv) { count++; }
        inEvent.result.push(
            ["css_prop_list", "rowCount", count],
            ["css_val_list",  "rowCount", count]
        );
    }
    
    /* 从变量CSSValues获得对应的值（用于面板上方列表显示） */
    function getCssData(type){
        var v, result = [];

        for (k in CSSValues) {
            if (type=="name") { v = k }
            if (type=="value") { v = CSSValues[k] }
            result.push({ label:v, data:v });
        }
        
        return result;
    }
    
    /* 从变量CSSValues转换得到CSS代码 */
    function getCssCode(){
        var result = [];

        for (k in CSSValues) {
            result.push(k+": "+CSSValues[k]+";");
        }
        
        return result.join("\n");
    }

    /* 在浏览器预览效果 */
    function previewHtml (inEvent) {
        var sel = fw.selection || [];
        if (sel.length<1) return;
        
        var cssOutput = inEvent.currentValues.css_code_text;
        
        if (fw.selection.length<1) { return alert("Select something first..."); }

        var autoTemplate = '<meta http-equiv="refresh" content="10">'; /* 刷新频率过快会导致无法在浏览器查看DOM结构，在有更好方案前禁用此代码 */
        var template = '<!DOCTYPE html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Fireworks CSS Generator</title><style>*{margin:0;padding:0;}html,body{height:100%}.container{width:100%;height:100%;display:flex;justify-content:center;align-items:center;}.fwElement{$_css_$}</style></head><body><div class="container"><div class="fwElement"></div></div></body></html>';
        var tempPath = Files.getTempFilePath(null);
        var htmlFile, htmlText;
        var htmlFilePath = Files.makePathFromDirAndFile( Files.getDirectory(Files.getTempFilePath(null)), "index.html" );

        htmlText = template.replace("$_css_$", cssOutput);
        writeTextToFile(htmlFilePath, htmlText, true);

        if (!inEvent.currentValues.opt_relaunch) return;
        if (Setting.browserName = "Default Browser") {
            fw.browseDocument(htmlFilePath);
        } else {
            fw.launchApp(Setting.browserURL, [htmlFilePath]);
        }
    }
    
    /* 自定义or默认浏览器 */
    function setPreviewBrowser (inEvent) {
        var defaultLabel = "Preview in ";
        var browserExe, browserExt;

        if (!inEvent.currentValues.opt_browser) {
            Setting.browserName = "Default Browser";
        } else {
            Setting.browserURL = fw.browseForFileURL();
            if (Setting.browserURL===null) {
                Setting.browserURL = "";
                return;
            }
            browserExe = Files.getFilename(Setting.browserURL);
            browserExt = Files.getExtension(browserExe);
            Setting.browserName = browserExe.replace(browserExt, "");
            Setting.browserName = Setting.browserName.firstUpperCase();
            saveCfg();
        }
        
        inEvent.result.push(["opt_browser", "label", defaultLabel + Setting.browserName]);
    }

    /* 加载配置 */
    function loadCfg () {
        if (!Files.exists(cfgFilePath)) {
            writeTextToFile(cfgFilePath, "", true);
        } else {
            var s = readTextFromFile(cfgFilePath);
            if (s!=null && s!="") {
                Setting.browserName = s.split(sp)[0];
                Setting.browserURL  = s.split(sp)[1];
            }
        }
    }

    /* 保存配置 */
    function saveCfg () {
        var s = Setting.browserName + sp + Setting.browserURL;
        writeTextToFile(cfgFilePath, s);
    }
    
    /* 从文件读取文本 */
    function readTextFromFile (path) {
        var file = Files.open(path, true);
        var text = file.readline();
        file.close();
        return text;
    }

    /* 写入文本到文件 */
    function writeTextToFile (path, text, reCreate) {
        if (reCreate) {
            Files.deleteFileIfExisting(path);
            Files.createFile(path, "TEXT", "????");
        } else {
            if (!Files.exists(path)) {
                alert("File doesn't exist!");
                return null;
            }
        }
        var file = Files.open(path, true);
        file.write(text);
        file.close();
    }

    /* 格式化小数 */
    function FormatValue(num){
        var sym = 1;
        if(num<0){ sym = -1 }
        
        var num = num.toFixed(2);
        num = sym*Math.abs(num);
        
        return num;
    }
    
    /* 格式化色值 */
    function FormatColor(val){
        val = val.toString();
        val = val.split("#").join("0x");
        //val = parseInt(val);
        return val;
    }
    
    /* RGB 转 HEX */
    function ConvertRgbToHex(r,g,b) {
        var hexcode = "#";
        var rgb = [r,g,b];
        for (var i=0; i<rgb.length; i++) {
            var n = rgb[i];
            if (n == "") n = "0";
            if (parseInt(n) != n) return alert("请输入数字！");
            if (n > 255) return alert("数字在0-255之间！");
            var c = "0123456789ABCDEF",
                d = "",
                e = n % 16;
            d = c.substr(e, 1);
            e = (n - e) / 16;
            hexcode += c.substr(e, 1) + d;
        }
        return hexcode.toUpperCase();
    }

    /* RGBA 转 HEX */
    function ConvertRgbaToHex (r,g,b,a) {
        var hexOpacity = a;
            hexOpacity = Math.round(hexOpacity * 100) / 100;
            hexOpacity = Math.round(hexOpacity * 255);
            hexOpacity = (hexOpacity + 0x10000).toString(16).substr(-2).toUpperCase();
            //hexOpacity = parseInt(alpha).toString(16).toUpperCase();

        var hexColor = ConvertRgbToHex(r,g,b);

        /*
        // 十进制透明度转Hex值
        var opacity = 84/100;
            opacity = Math.round(opacity * 100) / 100;
            opacity = Math.round(opacity * 255);
        var hexOpacity = (solidColorOpacity + 0x10000).toString(16).substr(-2).toUpperCase();*/
        
        return hexColor+hexOpacity;
    }

    /* HEX 转 RGB */
    function ConvertHexToRgba(hexcode) {
        var prefix = "rgba(";
        var subfix = ")";
        var hexColor, hexOpacity, alpha, rgba = [];
        if (hexcode.substr(0, 1) == "#") { hexcode = hexcode.substring(1); }

        hexColor = hexcode.substr(0, 6);
        hexColor = hexColor.toLowerCase();

        var b = new Array();
        for (var x = 0; x < 3; x++) {
            b[0] = hexColor.substr(x * 2, 2);
            b[3] = "0123456789abcdef";
            b[1] = b[0].substr(0, 1);
            b[2] = b[0].substr(1, 1);
            b[20 + x] = b[3].indexOf(b[1]) * 16 + b[3].indexOf(b[2]);
        }

        rgba = [b[20], b[21], b[22], 255];
        
        if (hexcode.length == 8) {
            hexOpacity = hexcode.substring(6);
            alpha = parseInt(hexOpacity, 16);
            alpha = FormatValue(alpha/255);
            if (alpha == 255) { alpha = 1 }
            
            rgba[3] = alpha;
        }
        
        return prefix+rgba+subfix;
    }

    /* 弧度转角度 */
    function getAngleByRadian (radian) {
        return radian*180/Math.PI;
    }

    /* 角度转弧度 */
    function getRadianByAngle (angle) {
        return angle*Math.PI/180;
    }

    //================================================================== 界面函数
    
    /* 创建面板标题栏 */
    function CreateHeader(inLabel, bgColor){
        if(bgColor==0xFFFFFF){ bgColor=0xCCCCCC }
        return { HBox: {
            percentWidth: 100,
            height: 30,
            style: {
                paddingLeft: 4,
                backgroundAlpha: 1,
                backgroundColor: String(bgColor),
            },
            children: [
                { Label: {
                    percentWidth: 100,
                    text: inLabel,
                    style: {
                        paddingLeft: 4,
                        paddingTop: 6,
                        fontWeight: "bold",
                        color: 0xFFFFFF,
                        fontSize: 12,
                    },
                } },
                { Image: {
                    width: 30,
                    height: 30,
                    buttonMode: true,
                    source: fw.currentScriptDir + "/images/back.png",
                    events:{
                        click: function(event){
                            fw.launchApp(fw.appDir+((fw.platform=="win")?"/Fireworks.exe":"/Adobe Fireworks CS6.app"), [fw.currentScriptDir+"/core/restore.jsf"]);
                        }
                    }
                } }
            ],
        } };
    }

    /* 创建分类标题 */
    function CreateCaption(inLabel){
        return { HBox: {
            percentWidth: 100,
            height: 22,
            style: {
                paddingLeft: 4,
                backgroundAlpha: .2,
                backgroundColor: "0xA4A4A4",
            },
            children: [
                { Label: {
                    percentWidth: 100,
                    text: inLabel,
                    style: {
                        paddingLeft: 4,
                        paddingTop: 2,
                        fontWeight: "bold",
                        color: 0x555555,
                        fontSize: 11,
                    },
                } }
            ],
        } };
    }

    /* 创建行间距 */
    function RowSpace(){
        return { Spacer: { height:2 } };
    }

    /* 创建垂直容器，类似css中flex垂直排列 */
    function Col(inChildren, pw){
        if(!pw){ pw=100 };
        return { VBox: {
            percentWidth: pw,
            styleName: "Col",
            children: inChildren
        } };
    }

    /* 创建水平容器，类似css中flex水平排列 */
    function Row(inChildren, pw){
        if(!pw){ pw=100 };
        return { HBox: {
            percentWidth: pw,
            styleName: "Row",
            children: inChildren
        } };
    }



    //========================================================================== 用户界面
    
    fwlib.panel.register({
        css: {
            ".Col": { paddingLeft:0 },
            ".Row": { paddingLeft:4, paddingButtom:0 },
            ".btnNormal": { color:0x666666, fontWeight: "normal" },
            ".btnActive": { color:0x0085D5, fontWeight: "normal" },
            
            ".infoTitle": { color:0x636363, paddingTop:8 },
            ".infoValue": { color:0x0085D5, paddingTop:8, fontWeight:"bold", fontSize:11 },
        },
        events: {
            onFwStartMovie: updateCSS,
            onFwActiveSelectionChange: updateCSS,
            onFwObjectSettingChange: updateCSS,
            onFwActiveDocumentChange: updateCSS
        },
        children:[
            
            CreateHeader(INFO.name, 0x45D3C1),

            { VBox: {
                percentWidth: 100,
                percentHeight: 100,
                children: [
                
                    { HBox: {
                        percentWidth: 100,
                        height: 22,
                        style: {
                            paddingLeft: 4,
                            backgroundAlpha: .2,
                            backgroundColor: "0xA4A4A4",
                        },
                        children: [
                            { Label: {
                                name: "css_prop_title",
                                percentWidth: 25,
                                text: "Properties",
                                style: {
                                    paddingLeft: 4,
                                    paddingTop: 2,
                                    fontWeight: "bold",
                                    color: 0x555555,
                                    fontSize: 11,
                                },
                            } },
                            { Label: {
                                name: "css_val_title",
                                percentWidth: 75,
                                text: "Value",
                                style: {
                                    paddingLeft: 4,
                                    paddingTop: 2,
                                    fontWeight: "bold",
                                    color: 0x555555,
                                    fontSize: 11,
                                },
                            } },
                        ]
                    } },
                    
                    Row([
                        { FormItem: {
                            percentWidth: 100,
                            style: {
                                paddingLeft: -14,
                            },
                            children: [
                                Row([
                                    { List: {
                                        name: "css_prop_list",
                                        rowCount: 8,
                                        percentWidth: 25,
                                        dataProvider: getCssData("name"),
                                        events:{
                                            click: function(event){
                                                cssListClicked(event);
                                            }
                                        }
                                    } },
                                    { List: {
                                        name: "css_val_list",
                                        rowCount: 8,
                                        percentWidth: 75,
                                        dataProvider: getCssData("value"),
                                        events:{
                                            click: function(event){
                                                cssListClicked(event);
                                            }
                                        }
                                    } },
                                ]),
                            ]
                        } },
                    ]),
                    
                    RowSpace(),
                    
                    CreateCaption("CSS Code"),
                    
                    { VBox: {
                        percentWidth: 100,
                        percentHeight: 100,
                        styleName: "Col",
                        children: [
                            { TextArea: {
                                style: {
                                    focusAlpha: .5,
                                },
                                name: "css_code_text",
                                percentWidth: 100,
                                percentHeight: 100,
                                editable: false,
                                selectable: true,
                                selectionBeginIndex: 0,
                                selectionEndIndex: 10,
                                text: getCssCode()
                            } }
                        ]
                    } },

                    { ControlBar: {
                        percentWidth: 100,
                        style: {
                            horizontalAlign: "right"
                        },
                        children: [
                            Col([
                                Row([
                                    { CheckBox: {
                                        name: "opt_relaunch",
                                        label: "New Session for Preview",
                                        selected: true,
                                        enabled: true,
                                        toolTip: "Uncheck for update html page only \nwithout launching the Browser.",
                                        percentWidth: 33,
                                        height: 16
                                    } },
                                ]),
                                Row([
                                    { CheckBox: {
                                        name: "opt_browser",
                                        label: "Preview in " + Setting.browserName,
                                        selected: Setting.browserName!="Default Browser",
                                        toolTip: "Switch between Custom and Default Browser",
                                        percentWidth: 33,
                                        height: 16,
                                        events:{
                                            click: function(event){
                                                setPreviewBrowser(event);
                                            }
                                        }
                                    } },
                                ]),
                            ], 40),

                            Col([
                                Row([
                                    { Button: {
                                        name: "btn_refresh",
                                        label: "Refresh",
                                        emphasized: true,
                                        percentWidth: 50,
                                        height: 32,
                                        toolTip: "Refresh Manual",
                                        events:{
                                            click: function(event){
                                                updateCSS(event);
                                            }
                                        }
                                    } },
                                    { Button: {
                                        name: "btn_copy",
                                        label: "Copy",
                                        percentWidth: 50,
                                        height: 32,
                                        toolTip: "Copy CSS Code",
                                        events:{
                                            click: function(event){
                                                updateCSS(event);
                                                copyCSS(event);
                                            }
                                        }
                                    } },
                                    { Button: {
                                        name: "btn_preview",
                                        label: "Preview",
                                        percentWidth: 50,
                                        height: 32,
                                        toolTip: "Preview in Browser",
                                        events: {
                                            click: function(event){
                                                updateCSS(event);
                                                previewHtml(event);
                                            }
                                        }
                                    } }
                                ])
                            ], 60),
                        ]
                    } }

                ]
            } },
        ]
    });

})();
