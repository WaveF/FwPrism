INFO = { name:'WebFont', version:'1.0', type:'panel' };

try {
(function() {
		
	//========================================================================== 增强模组
	var FwCurrrentScriptDir = fw.currentScriptDir;
	
	if (typeof require != "function" || !require.version) {
		fw.runScript(fw.currentScriptDir + "/lib/fwrequire.js");
	}
	
	require(["fwlib/layers",
		 "fwlib/prefs",
		 "fwlib/DomStorage",
		 "fwlib/files",
		 "fwlib/underscore"], function(
		 layers,
		 prefs,
		 DomStorage,
		 files,
		 _) {
		
		//================================================================ 初始化设定
		
		var i = 0;
		var sp = "\r";
		
		var dom = (fw.documents.length>0)?fw.getDocumentDOM():null;
		//var sel = fw.selection?fw.selection:[];
		
		var Config;
		
		var Setting = {};
			Setting.currentFont = "FontAwesome";
			Setting.thumbFolder = FwCurrrentScriptDir + "/assets/webfont";
		
		var osFontList = [];
		
		var charCodeList = [];
		var charCodeRange = {};
			charCodeRange.start = 61440;
			charCodeRange.end = 61964;
		
		var exportOption = {
			animAutoCrop: true,
			animAutoDifference: true,
			applyScale: false,
			colorMode: "indexed",
			crop: false,
			cropBottom: 0,
			cropLeft: 0,
			cropRight: 0,
			cropTop: 0,
			ditherMode: "diffusion",
			ditherPercent: 100,
			exportFormat: "PNG",
			frameInfo: [{ delayTime: 7, frameHidden: false, frameName: undefined, gifDisposalMethod: "unspecified" }],
			interlacedGIF: true,
			jpegQuality: 80,
			jpegSelPreserveButtons: false,
			jpegSelPreserveText: true,
			jpegSelQuality: 90,
			jpegSelQualityEnabled: false,
			jpegSmoothness: 0,
			jpegSubsampling: 0,
			localAdaptive: true,
			lossyGifAmount: 0,
			macCreator: "",
			macFileType: "",
			name: undefined,
			numCustomEntries: 2,
			numEntriesRequested: 256,
			numGridEntries: 6,
			optimized: true,
			paletteEntries: ["#ffffff00", "#58bbb8"],
			paletteInfo: undefined,
			paletteMode: "adaptive",
			paletteTransparency: "rgba",
			percentScale: 100,
			progressiveJPEG: false,
			savedAnimationRepeat: 0,
			sorting: "none",
			useScale: true,
			webSnapAdaptive: false,
			webSnapTolerance: 14,
			xSize: 66,
			ySize: 66
		};
		
		init();
		
		function init(){
			/* 初始化系统字体下拉列表 */
			ReadConfig();
			UpdateTile();
			
			
		}
		
		
		//================================================================== 功能函数
		
		function UpdateSetting(){
			
		}
		
		function ReadConfig(){
			Config = files.readJSON(FwCurrrentScriptDir + "/assets/webfont.json");
			osFontList = Config.fontList;
		}
		
		function UpdateTile(inEvent){
			charCodeList = [];
			for(i=charCodeRange.start; i<charCodeRange.end; i++){
				charCodeList.push( { icon:Setting.thumbFolder+"/"+Setting.currentFont+"/"+i+".png", label:toHtmlCode(i), ascii:i } );
			}
			
			if(inEvent){
				inEvent.result.push(["WebFontTile","dataProvider",charCodeList]);
			}
		}
		
		function RebuildFontTile(inEvent){
		
			fw.createFireworksDocument({x:40, y:40}, { pixelsPerUnit:72, units:"inch" }, "#ffffff00");
			fw.getDocumentDOM().addNewText({left:0, top:0, right:40, bottom:40}, true);
			fw.selection[0].autoExpand = true;
			fw.getDocumentDOM().setFillColor("#000000");
			fw.getDocumentDOM().applyFontMarkup("size", "14pt");
			fw.getDocumentDOM().applyFontMarkup("face", Setting.currentFont);
			fw.getDocumentDOM().setTextAlignment("left");
			fw.getDocumentDOM().setFillEdgeMode("antialias", 0);
			fw.getDocumentDOM().setTextCustomAntiAliasSharpness(192);
			fw.getDocumentDOM().setTextCustomAntiAliasStrength(64);
			fw.getDocumentDOM().setTextCustomAntiAliasOverSample(16);
			fw.getDocumentDOM().setTextAntiAliasing("smooth");
			fw.getDocumentDOM().setBrushNColor(null, "#ffffff00");
			
			var exportFolder = Setting.thumbFolder + "/" + Setting.currentFont;
			if(!Files.exists(Setting.thumbFolder)){ Files.createDirectory(Setting.thumbFolder) }
			if(!Files.exists(exportFolder)){ Files.createDirectory(exportFolder) }
			
			for(i=0; i<charCodeList.length; i++){
				fw.selection[0].textChars = String.fromCharCode(charCodeList[i].ascii);
				fw.selection[0].font = "FontAwesome";
				
				fw.getDocumentDOM().changeCurrentPage(fw.getDocumentDOM().currentPageNum);
				fw.getDocumentDOM().align('center vertical','true');
				fw.getDocumentDOM().align('center horizontal','true');
				
				ExportThumbs(exportFolder + "/" + charCodeList[i].ascii + ".png");
			}
			
			fw.getDocumentDOM().close(false);
			UpdateTile(inEvent);
		}
		
		function ExportThumbs(path){
			fw.getDocumentDOM().exportTo(path, exportOption);
		}
		
		
		
		/* 事件侦听函数 */
		function onRebuildBtnClick(inEvent){
			var Continue = fw.yesNoDialog("It will take a while to rebuild about 500+ thumbs, continue?");
			if(Continue) RebuildFontTile(inEvent);
		}
		
		function onWebFontTileClick(inEvent){
			var idx = inEvent.currentValues.WebFontTile.selectedIndex;
			alert(charCodeList[idx].ascii  +sp+  "\\u"+charCodeList[idx].ascii.toString(16))
		}
		
		function onWebFontTileDoubleClick(inEvent){
			var sel = fw.selection?fw.selection:[];
			var idx = inEvent.currentValues.WebFontTile.selectedIndex;
			
			if(sel.length==1){
				sel[0].textChars += String.fromCharCode(charCodeList[idx].ascii);
				sel[0].font = Setting.currentFont;
				fw.getDocumentDOM().changeCurrentPage(fw.getDocumentDOM().currentPageNum);
				fw.selection = sel;
			}
			
			if(sel.length==0){
				fw.getDocumentDOM().addNewText({left:0, top:0, right:40, bottom:40}, true);
				fw.getDocumentDOM().align('center vertical','true');
				fw.getDocumentDOM().align('center horizontal','true');
				
				fw.selection[0].textChars = String.fromCharCode(charCodeList[idx].ascii);
				fw.selection[0].font = Setting.currentFont;
				fw.selection[0].autoExpand = true;
				
				fw.getDocumentDOM().changeCurrentPage(fw.getDocumentDOM().currentPageNum);
			}
		}
		
		function onAddFontBtnClick(inEvent){
			alert("choose a ttf/otf file to install, and update json file");
		}
		
		function onDelFontBtnClick(inEvent){
			alert("remove thumb's folder and update json file, refresh UI");
		}
		
		
		/* 转码函数 */
		function codeToText(code){
			return String.fromCharCode(code);
		}
		
		function toHtmlCode(code) {
			var htmlCodeString = '';
			var htmlCodeString = "&#x"+ code.toString(16) +"";
			return htmlCodeString;
		}
		
		function toUnicode(str) {
			var unicodeString = '';
			for (var i = 0; i < str.length; i++) {
				var code = str.charCodeAt(i).toString(16).toUpperCase();
				while (code.length < 4) {
					code = '0' + code;
				}
				code = '\\u' + code;
				unicodeString += code;
			}
			return unicodeString;
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
			children:[
				
				CreateHeader(INFO.name, 0x9F7ADC),
				
				Row([
				
					{ ComboBox: {
						name: "FontsComboBox",
						percentWidth:70,
						height:30,
						selectedIndex: 0,
						dataProvider: osFontList,
						events: {
							change: function(event){
								
							}
						}
					} },
					
					{ Button: {
						name: "AddFontBtn",
						width:30,
						height:30,
						events: {
							click: onAddFontBtnClick,
						},
						style: { icon:fw.currentScriptDir+"/images/add.png" },
					} },
					
					
					{ Button: {
						name: "DelFontBtn",
						label: "–",
						width:30,
						height:30,
						events: {
							click: onDelFontBtnClick,
						},
						style: { paddingLeft:12, icon:fw.currentScriptDir+"/images/del.png" },
					} },
					
					
					{ Button: {
						name: "RebuildBtn",
						label: "Rebuild",
						percentWidth:30,
						height:30,
						events: {
							click: onRebuildBtnClick,
						},
						toolTip: "Rebuild selected font's thumbnail"
					} },
					
				]),
				
				{ TileList: {
					name: "WebFontTile",
					percentWidth: 100,
					percentHeight: 100,
					//maxColumns: 3,
					columnWidth: 100,
					rowHeight: 60,
					wordWrap: true,
					doubleClickEnabled: true,
					dataProvider: charCodeList,
					events: {
						keyDown: onWebFontTileClick,
						doubleClick: onWebFontTileDoubleClick
					},
					style: { color:0x000000, fontWeight: "normal", fontFamily:"Courier", fontSize:"12pt" },
				} },
			]
		});
	});
})();

} catch (exception) {
	alert([exception, exception.lineNumber, exception.fileName].join("\n"));
}