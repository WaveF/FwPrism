INFO = { name:"CSS Generator", version:"1.0", type:"panel" };


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
		getCssBorder(el);
		getCssFillColor(el);

		updateCSSRow(CSSValues, inEvent);
		inEvent.result.push(
			["css_prop_list", "dataProvider", getCssData("name")],
			["css_val_list",  "dataProvider", getCssData("value")],
			["css_code_text", "text", getCssCode()]
		);
	}

	function copyCSS(inEvent) {
		fw.getDocumentDOM().clipCopyJsToExecute(inEvent.currentValues.css_code_text);
	}

	function resetCssPanel (inEvent) {
		inEvent.result.push(
			["css_prop_list", "dataProvider", []],
			["css_val_list",  "dataProvider", []],
			["css_code_text", "text", ""]
		);
	}

	function getCssWidth (el) {
		CSSValues["width"] = el.width + "px";
	}

	function getCssHeight (el) {
		CSSValues["height"] = el.height + "px";
	}

	function getCssOpacity (el) {
		if (el.opacity == 100) return;
		CSSValues["opacity"] = FormatValue(el.opacity/100);
	}

	function getCssBorder (el) {
		if (el.roundness==undefined || el.roundness==0) return;
		CSSValues["border-radius"] = el.roundness + "px";
	}

	function getCssFillColor (el) {
		if (!el.pathAttributes) return;
		if (!el.pathAttributes.fill) return;
		if (el.pathAttributes.fill.gradient==null) {
			// 单色
			CSSValues["background-color"] = el.pathAttributes.fillColor;
		} else {
			// 渐变
			var template = "linear-gradient($_angle_$, $_colors_$)";
			var angle = "180deg";
			var gradientColors = [];
			var gNodes = el.pathAttributes.fill.gradient.nodes;
			for (var i=0; i<gNodes.length; i++) {
				var node = gNodes[i];
				if (!node.isOpacityNode) {
					gradientColors.push(node.color);
				}
			}
			CSSValues["background"] = template.replace("$_angle_$", angle).replace("$_colors_$", gradientColors.join(","));
		}
	}

	function updateCSSRow (cv, inEvent) {
		var count = 0;
		for (var i in cv) { count++; }
		inEvent.result.push(
			["css_prop_list", "rowCount", count],
			["css_val_list",  "rowCount", count]
		);
	}
	
	function getCssData(type){
		var v, result = [];

		for (k in CSSValues) {
			if (type=="name") { v = k }
			if (type=="value") { v = CSSValues[k] }
			result.push({ label:v, data:v });
		}
		
		return result;
	}
	
	function getCssCode(){
		var result = [];

		for (k in CSSValues) {
			result.push(k+": "+CSSValues[k]+";");
		}
		
		return result.join("\n");
	}

	function previewHtml (inEvent) {
		if (fw.selection===null) return;
		if (fw.selection.length<1) { alert("Select something first..."); return; }
		var template = '<!DOCTYPE html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Fireworks CSS Generator</title><style>*{margin:0;padding:0;}html,body{height:100%}.container{width:100%;height:100%;display:flex;justify-content:center;align-items:center;}.fwElement{$_css_$}</style></head><body><div class="container"><div class="fwElement"></div></div></body></html>';
		var tempPath = Files.getTempFilePath(null);
		var htmlFile, htmlText;
		var htmlFilePath = Files.makePathFromDirAndFile( Files.getDirectory(Files.getTempFilePath(null)), "index.html" );

		htmlText = template.replace("$_css_$", inEvent.currentValues.css_code_text);
		writeTextToFile(htmlFilePath, htmlText, true);

		if (Setting.browserName = "Default Browser") {
			fw.browseDocument(htmlFilePath);
		} else {
			fw.launchApp(Setting.browserURL, [htmlFilePath]);
		}
	}
	
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

	function saveCfg () {
		var s = Setting.browserName + sp + Setting.browserURL;
		writeTextToFile(cfgFilePath, s);
	}
	
	function readTextFromFile (path) {
		var file = Files.open(path, true);
		var text = file.readline();
		file.close();
		return text;
	}

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

	function FormatValue(num){
		var sym = 1;
		if(num<0){ sym = -1 }
		
		var num = num.toFixed(2);
		num = sym*Math.abs(num);
		
		return num;
	}
	
	function FormatColor(val){
		val = val.toString();
		val = val.split("#").join("0x");
		//val = parseInt(val);
		return val;
	}
	

	//================================================================== 界面函数
	
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

	function RowSpace(){
		return { Spacer: { height:2 } };
	}

	function Col(inChildren,pw){
		if(!pw){ pw=100 };
		return { VBox: {
			percentWidth: pw,
			styleName: "Col",
			children: inChildren
		} };
	}

	function Row(inChildren,pw){
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
										name: "opt_html5",
										label: "HTML5",
										selected: true,
										enabled: false,
										toolTip: "Chrome",
										percentWidth: 33,
										height: 16
									} },
									{ CheckBox: {
										name: "opt_compatible",
										label: "Compatible",
										selected: false,
										enabled: true,
										toolTip: "Safari, Firefox, IE...",
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
										label: "刷新",
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
										label: "复制",
										percentWidth: 50,
										height: 32,
										toolTip: "Copy CSS Code",
										events:{
											click: function(event){
												copyCSS(event);
											}
										}
									} },
									{ Button: {
										name: "btn_preview",
										label: "预览",
										percentWidth: 50,
										height: 32,
										toolTip: "Preview in Browser",
										events:{
											click: function(event){
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