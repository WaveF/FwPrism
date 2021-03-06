INFO = { name:'Retina Assistant', version:'1.0', type:'panel' };


(function() {

	//================================================================ 初始化设定
	var i, j;
	var fileExt = "png";
	var scaleFxParam = "autoTrimImages transformAttributes";
	var FormatList = ["PNG8", "PNG32", "JPG", "GIF"];
	var suffixString, exportFolder, exportPath;
	var imgFileList = [];
	var batMinWindowCode = 'mode con cols=15 lines=1\nset path=%~d0%~p0\n';
	
	//输出设定
	var options = {
		png8: {
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
		},
		png32: {
			animAutoCrop: true,
			animAutoDifference: true,
			applyScale: false,
			colorMode: "32 bit",
			crop: false,
			cropBottom: 0,
			cropLeft: 0,
			cropRight: 0,
			cropTop: 0,
			ditherMode: "none",
			ditherPercent: 100,
			exportFormat: "PNG",
			frameInfo: [{ delayTime: 7, frameHidden: false, frameName: undefined, gifDisposalMethod: "unspecified" }],
			interlacedGIF: false,
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
			numCustomEntries: 0,
			numEntriesRequested: 0,
			numGridEntries: 6,
			optimized: true,
			paletteEntries: undefined,
			paletteInfo: undefined,
			paletteMode: "adaptive",
			paletteTransparency: "none",
			percentScale: 100,
			progressiveJPEG: false,
			savedAnimationRepeat: 0,
			sorting: "none",
			useScale: true,
			webSnapAdaptive: false,
			webSnapTolerance: 14,
			xSize: 66,
			ySize: 66
		},
		jpg: {
			animAutoCrop: true,
			animAutoDifference: true,
			applyScale: false,
			colorMode: "24 bit",
			crop: false,
			cropBottom: 0,
			cropLeft: 0,
			cropRight: 0,
			cropTop: 0,
			ditherMode: "diffusion",
			ditherPercent: 100,
			exportFormat: "JPEG",
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
			numCustomEntries: 0,
			numEntriesRequested: 0,
			numGridEntries: 6,
			optimized: true,
			paletteEntries: undefined,
			paletteInfo: undefined,
			paletteMode: "adaptive",
			paletteTransparency: "index alpha",
			percentScale: 100,
			progressiveJPEG: true,
			savedAnimationRepeat: 0,
			sorting: "none",
			useScale: true,
			webSnapAdaptive: false,
			webSnapTolerance: 14,
			xSize: 66,
			ySize: 66
		},
		gif: {
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
			exportFormat: "GIF",
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
			paletteEntries: [],
			paletteInfo: undefined,
			paletteMode: "adaptive",
			paletteTransparency: "index alpha",
			percentScale: 100,
			progressiveJPEG: true,
			savedAnimationRepeat: 0,
			sorting: "none",
			useScale: true,
			webSnapAdaptive: false,
			webSnapTolerance: 14,
			xSize: 66,
			ySize: 66
		}
	};
	
	var Setting = {
		fixedSize: false,
		fixedWidth: 100,
		fixedHeight: 100,
		scaleRatio: true,
		scaleNum: 2,
		scaleFX: true,
		appendSuffix: false,
		ratioText: "@2x",
		imageFormat: FormatList[0],
		exportOptions: options[FormatList[1].toLowerCase()],
		optimPNG: false
	};
	
	
	//================================================================== 功能函数
	
	function UpdateSetting(inEvent){
		
		Setting.fixedSize		=	inEvent.currentValues.FixedSize;
		Setting.fixedWidth		=	inEvent.currentValues.FixedWidth;
		Setting.fixedHeight		=	inEvent.currentValues.FixedHeight;
		Setting.scaleRatio		=	inEvent.currentValues.ScaleRatio;
		Setting.scaleNum		=	inEvent.currentValues.ScaleNum;
		Setting.scaleFX			=	inEvent.currentValues.ScaleFX;
		Setting.appendSuffix	=	inEvent.currentValues.AppendSuffix;
		Setting.ratioText		=	inEvent.currentValues.RatioText;
		Setting.optimPNG		=	inEvent.currentValues.OptimizePNG;
		
		Setting.imageFormat		=	inEvent.currentValues.ImageFormat.selectedItem;
		Setting.exportOptions	=	options[(Setting.imageFormat).toLowerCase()];
		
	}
	
	function UpdateUI(inEvent){
		var pngOptions;
		
		UpdateSetting(inEvent);
		
		if(Setting.imageFormat=="PNG8" || Setting.imageFormat=="PNG32"){
			pngOptions = true;
		}else{
			pngOptions = false;
		}
		
		inEvent.result.push(["FixedWidth",		"enabled",	Setting.fixedSize],
							["FixedHeight",		"enabled",	Setting.fixedSize],
							["ScaleNum",		"enabled",	Setting.scaleRatio],
							["AppendSuffix",	"enabled",	Setting.scaleRatio],
							["ScaleFX",			"enabled",	Setting.scaleRatio],
							["RatioText",		"text",		"@"+Setting.scaleNum+"x"],
							["RatioText",		"enabled",	Setting.scaleRatio&&Setting.appendSuffix],
							["OptimizePNG",		"visible",	pngOptions],
							["OptimizePNGLabel",	"visible",	pngOptions]);
							
	}
	
	function Process(inEvent, exporting){
		var sel = (fw.selection)?fw.selection:[];
		if(sel.length<1) return;
		
		var dom = fw.getDocumentDOM();
		if(exporting && !dom.filePathForSave){ alert("You must save source file before exporting!"); return }
		
		if(Setting.imageFormat.toLowerCase()=="png8" || Setting.imageFormat.toLowerCase()=="png32"){ fileExt = "png" }
		else if(Setting.imageFormat.toLowerCase()=="jpg"){ fileExt = "jpg" }
		else if(Setting.imageFormat.toLowerCase()=="gif"){ fileExt = "gif" }
		
		if(Setting.scaleFX){ scaleFxParam = "autoTrimImages transformAttributes" }
		else{ scaleFxParam = "autoTrimImages rememberQuad" }
		
		
		imgFileList = [];
		var names = [];
		var tmpSel = [];
		
		
		if(sel.length>4){
			var process = fw.yesNoDialog("You're going to handle " + sel.length + " images at the same time,\rthat may slow down your computer,\rcontinue?");
			if(!process) return;
		}
		
		// 检测并记录命名
		for (i in sel) {
			if(sel[i].name==null || sel[i].name==undefined || sel[i].name==""){
				names.push("UnName_"+i);
			}else{
				names.push(sel[i].name);
			}
			
			if(sel[i+1]){
				if (sel[i].name==sel[i+1].name && sel[i].name!=null) {
					alert("Found conflict object name : \r\r" + sel[i].name);
					return;
				}
			}
		}
		
		dom.clipCopy();
		
		for(i in sel){
			fw.createFireworksDocument({x:100, y:100}, { pixelsPerUnit:72, units:"inch" }, "#ffffff00");
			fw.getDocumentDOM().clipPaste("resample", "vector");
			//fw.getDocumentDOM().group("normal");
			
			tmpSel = fw.selection;
			
			for(j in tmpSel){
				if(j!=i){
					fw.selection = tmpSel[j];
					fw.getDocumentDOM().deleteSelection(false);
				}
			}
			fw.getDocumentDOM().selectNone();
			fw.getDocumentDOM().selectAll();
			
			fw.getDocumentDOM().setDocumentCanvasSizeToDocumentExtents(true);
			var domWidth = fw.getDocumentDOM().width;
			var domHeight = fw.getDocumentDOM().height;
			
			
			// 按照固定尺寸更改画布大小
			if(Setting.fixedSize){
			
				if(domWidth<Setting.fixedHeight || domHeight<Setting.fixedHeight){
				
					// 横向扩展画布
					if(domWidth<Setting.fixedWidth){
						fw.getDocumentDOM().setDocumentCanvasSize({ left:0, top:0, right:Setting.fixedWidth, bottom:fw.getDocumentDOM().height }, true);
					}
					
					// 纵向扩展画布
					if(domHeight<Setting.fixedHeight){
						fw.getDocumentDOM().setDocumentCanvasSize({ left:0, top:0, right:fw.getDocumentDOM().width, bottom:Setting.fixedHeight }, true);
					}
					
					// 完全居中
					fw.getDocumentDOM().align('center horizontal','true');
					fw.getDocumentDOM().align('center vertical','true');
					
					// 拉伸为原始大小，会把虚边去掉
					fw.getDocumentDOM().setSelectionBounds({ left:fw.selection[0].left, top:fw.selection[0].top, right:fw.selection[0].left+fw.selection[0].width, bottom:fw.selection[0].top+fw.selection[0].height }, scaleFxParam);
				
				}
				
			}
			
			
			// 缩放图像
			if(Setting.scaleRatio){
				
				// 注意设置画布大小会自动对宽高取整，而不是四舍五入到整数
				fw.getDocumentDOM().setDocumentCanvasSize({ left:0, top:0, right:fw.getDocumentDOM().width*Setting.scaleNum, bottom:fw.getDocumentDOM().height*Setting.scaleNum }, true);
				
				// 1. 拉伸模拟缩放，注意与设置画布大小不同，这里拉伸的宽高会四舍五入到整数，无法缩放滤镜等效果
				//fw.getDocumentDOM().setSelectionBounds({ left:fw.selection[0].left, top:fw.selection[0].top, right:(fw.selection[0].left+fw.selection[0].width)*Setting.scaleNum, bottom:(fw.selection[0].top+fw.selection[0].height)*Setting.scaleNum }, scaleFxParam);
				
				// 2. 真实缩放，可以缩放滤镜等效果
				fw.getDocumentDOM().scaleSelection(Setting.scaleNum, Setting.scaleNum, scaleFxParam);
				
				//完全居中
				fw.getDocumentDOM().align('center horizontal','true');
				fw.getDocumentDOM().align('center vertical','true');
				
				// 拉伸为原始大小，会把虚边去掉
				fw.getDocumentDOM().setSelectionBounds({ left:fw.selection[0].left, top:fw.selection[0].top, right:fw.selection[0].left+fw.selection[0].width, bottom:fw.selection[0].top+fw.selection[0].height }, scaleFxParam);
				
				
				// 像素修正
				if(Setting.scaleFX){
					if(!Setting.fixedSize){
						// 如果没有开启固定尺寸，就直接再FitCanvas一次，消除效果缩放带来的尺寸误差影响
						fw.getDocumentDOM().setDocumentCanvasSizeToDocumentExtents(true);
					}else{
						// 如果开启了固定尺寸，就克隆一份平面化，检测效果缩放导致的像素变化，并修正
						// 顺便把平面化的位图移到顶层，方便删除
						fw.getDocumentDOM().cloneSelection();
						fw.getDocumentDOM().flattenSelection();
						fw.getDocumentDOM().arrange("front");
						
						// 记录平面化的图像实际有效区域
						var bx = fw.selection[0].left;
						var by = fw.selection[0].top;
						var bw = fw.selection[0].width;
						var bh = fw.selection[0].height;
						var br = Math.abs(bx) + bw;
						var bb = Math.abs(by) + bh;
						
						// 选中平面化的位图和原始图像，这时移动的话是按照bitmap最大像素有效区域来计算的
						fw.getDocumentDOM().selectAll();
						if(bx<0){ fw.getDocumentDOM().moveSelectionBy({x:-bx, y:0}, false, false) }
						if(by<0){ fw.getDocumentDOM().moveSelectionBy({x:0, y:-by}, false, false) }
						
						// 删掉平面化的位图，重新选回原始图形
						fw.selection = [fw.selection[0]];
						fw.getDocumentDOM().deleteSelection(false);
						fw.getDocumentDOM().selectAll();
						
						
						if(br>fw.getDocumentDOM().width){
							// 如果有效区域宽度大于画布宽度，就强行拉伸回去
							fw.getDocumentDOM().setSelectionBounds({ left:fw.selection[0].left, top:fw.selection[0].top, right:fw.selection[0].left+fw.selection[0].width-(br-fw.getDocumentDOM().width), bottom:fw.selection[0].top+fw.selection[0].height }, scaleFxParam);
						}
						
						if(bb>fw.getDocumentDOM().height){
							// 如果有效区域高度大于画布高度，就强行拉伸回去
							fw.getDocumentDOM().setSelectionBounds({ left:fw.selection[0].left, top:fw.selection[0].top, right:fw.selection[0].left+fw.selection[0].width, bottom:fw.selection[0].top+fw.selection[0].height-(bb-fw.getDocumentDOM().height) }, scaleFxParam);
						}
						
						
					}
				}
				
				
			}
			
			
			// 输出文件
			suffixString = (Setting.appendSuffix)?Setting.ratioText:"";
			exportFolder = (Setting.appendSuffix)?Setting.ratioText:"images";
			exportPath = Files.getDirectory(dom.filePathForSave) + "/" + exportFolder + "/" + names[i] + suffixString + "." + fileExt;
		
			if(exporting){
				if(!Files.exists(Files.getDirectory(dom.filePathForSave) + "/" + exportFolder)) Files.createDirectory(Files.getDirectory(dom.filePathForSave) + "/" + exportFolder);
				Files.deleteFileIfExisting(exportPath);
				
				imgFileList.push(exportPath);
				fw.getDocumentDOM().exportTo(exportPath, Setting.exportOptions);
				fw.getDocumentDOM().close(false);
			}
			
		}
		
		//压缩图片
		if(Setting.optimPNG){
			CompressPNG(inEvent);
		}
		
	}
	
	function CompressPNG(inEvent){
		var cmdFilePath, cmdFile, cmdFileText;
		
		//imgFileList = Files.enumFiles(Files.getDirectory(exportPath));
		
		cmdFilePath = fw.currentScriptDir + "/compress.bat";
		Files.deleteFileIfExisting(cmdFilePath);
		Files.createFile(cmdFilePath, "TEXT", "????");
		cmdFile = Files.open(cmdFilePath, true);
		cmdFileText = batMinWindowCode;
		
		for(i=0;i<imgFileList.length;i++){
			cmdFileText += ('"%path%optipng.exe" -strip all -quiet -clobber -o7 -i0 '+convertURLToOSPath(imgFileList[i],true)+'\n');
		}
		
		
		cmdFile.write(cmdFileText);
		cmdFile.close();
		fw.launchApp(cmdFilePath, []);
	}
	
	function isRepeat(arr){
		var hash = {};
		for(var i in arr) {
			if(hash[arr[i]]) return true;
			hash[arr[i]] = true;
		}
		return false;
	}
	
	/* URI转为系统路径 */
	function convertURLToOSPath(inURL, quote){
		if(!inURL){return}
		if (os == "win") {
		  /*  // replace file:///C| with C: and turn / into \  */
		  var path = inURL.replace(/file:\/\/\/(.)\|/, "$1:");
		  path = path.replace(/\//g, "\\");
		} else {
		  /*  // replace file:/// with /Volumes/  */
		  var path = "/Volumes" + inURL.replace(/file:\/\//, "");
		}
		// we also have to convert the URL-encoded chars back into normal chars
		// so that the OS can handle the path, and quote the path in case it
		// contains spaces
		if(quote){
			return '"' + unescape(path) + '"';
		}else{
			return unescape(path);
		}
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
		},
		
		children:[
			
			CreateHeader(INFO.name, 0x0090EA),
			
			Col([
				//--------------------------------------------------------- 对象缩放
				CreateCaption("Object Size"),
				
				Row([
					{ CheckBox: {
						name: "FixedSize",
						selected: Setting.fixedSize,
						events: {
							click: function(event){
								UpdateUI(event);
							}
						},
						style: { paddingLeft:4, paddingTop:4 }
					} },
					{ Label: {
						text: "Fixed Size:",
						width: 60,
						style: { paddingLeft:-4, paddingTop:3 }
					} },
					{ NumericStepper: {
						name: "FixedWidth",
						percentWidth: 24,
						height: 24,
						value: Setting.fixedWidth,
						stepSize: 1,
						maximum: 9999,
						minimum: 1,
						enabled: Setting.fixedSize,
						events: {
							change: function(event){
								UpdateUI(event);
							}
						},
						style: { fontSize:12 }
					} },
					{ Label: {
						text: "×",
						style: { color:"0x888888", fontSize:12, paddingLeft:4, paddingTop:2 }
					} },
					{ NumericStepper: {
						name: "FixedHeight",
						percentWidth: 24,
						height: 24,
						value: Setting.fixedHeight,
						stepSize: 1,
						maximum: 9999,
						minimum: 1,
						enabled: Setting.fixedSize,
						events: {
							change: function(event){
								UpdateUI(event);
							}
						},
						style: { fontSize:12 }
					} },
					{ Label: {
						text: "pixel",
						style: { color:"0x888888", paddingLeft:2, paddingTop:3 }
					} },
				]),
				
				
				Row([
					{ CheckBox: {
						name: "ScaleRatio",
						selected: Setting.scaleRatio,
						events: {
							click: function(event){
								UpdateUI(event);
							}
						},
						style: { paddingLeft:4, paddingTop:4 }
					} },
					{ Label: {
						text: "Scale Ratio:",
						width: 60,
						style: { paddingLeft:-4, paddingTop:3 }
					} },
					{ NumericStepper: {
						name: "ScaleNum",
						percentWidth: 25,
						height: 24,
						value: Setting.scaleNum,
						stepSize: .1,
						maximum: 6,
						minimum: .1,
						enabled: Setting.scaleRatio,
						events: {
							change: function(event){
								UpdateUI(event);
							}
						},
						style: { fontSize:12 }
					} },
					
					{ CheckBox: {
						name: "ScaleFX",
						selected: Setting.scaleFX,
						enabled: Setting.scaleFX&&Setting.scaleRatio,
						events: {
							click: function(event){
								UpdateUI(event);
							}
						},
						style: { fontWeight:"bold", paddingLeft:4, paddingTop:4 }
					} },
					{ Label: {
						text: "ScaleFX",
						style: { paddingLeft:-4, paddingTop:3, paddingRight:-4 }
					} },
					
					{ CheckBox: {
						name: "AppendSuffix",
						selected: Setting.appendSuffix,
						events: {
							click: function(event){
								UpdateUI(event);
							}
						},
						style: { fontWeight:"bold", paddingLeft:4, paddingTop:4 }
					} },
					{ Label: {
						text: "Suffix:",
						style: { paddingLeft:-4, paddingTop:3, paddingRight:-8 }
					} },
					{ TextInput: {
						name: "RatioText",
						text: Setting.ratioText,
						width: 44,
						alpha:1,
						enabled: Setting.scaleRatio&&Setting.appendSuffix,
						events: {
							change: function(event){ Setting.ratioText = event.currentValues.RatioText }
						},
						style: { color:"0x0085D5", fontWeight:"bold", paddingLeft:0, paddingTop:1 }
					} },
				]),
				
				RowSpace(),
				
				//------------------------------------------------------------- 格式和优化
				CreateCaption("Format & Optimize"),
				
				Row([
				
					{ ComboBox: {
						name: "ImageFormat",
						percentWidth: 40,
						height: 28,
						dataProvider: FormatList,
						selectedItem: FormatList[0],
						events: {
							change: function(event){
								UpdateUI(event);
							}
						},
					} },
					
					{ CheckBox: {
						name: "OptimizePNG",
						selected: Setting.optimPNG,
						events: {
							change: function(event){
								UpdateUI(event);
							}
						},
						style: { paddingLeft:10, paddingTop:7 },
					} },
					{ Label: {
						name: "OptimizePNGLabel",
						text: "Compress PNG files after Export",
						style: { paddingLeft:-4, paddingTop:6 },
						toolTip: "Compression PNG files with OptiPNG engine\rwhen click the Export button below.\r\r* This feature available on Windows only"
					} },
					
					
				]),
				
				RowSpace(),
				
				//------------------------------------------------------------- 输出
				
				CreateCaption("Exporting"),
				
				Row([
					{ CheckBox: {
						name: "CustomPath",
						selected: false,
						enabled: false,
						style: { paddingLeft:4, paddingTop:4, paddingRight:-10 },
						toolTip: "VIP upgrade required to unlock this feature.",
					} },
					{ Label : {
						text: "Custom Destination:",
						style: { color:"0x888888", paddingLeft:6, paddingTop:3, paddingRight:-8 }
					} },
					{ TextInput : {
						name: "ExportPath",
						text: "<Same destination as source file>",
						editable: false,
						enabled: false,
						percentWidth: 100
					} },
					{ Button: {
						label: "...",
						height: 23,
						width:34,
						enabled: false,
						events: {
							click: function(event){
								//var changePath = fw.browseForFolderURL("Export to...", _path);
								//if(changePath!=null){ _path = changePath;
								//Files.createDirectory(_path); }
								alert("VIP upgrade required to unlock this feature.");
							},
						},
					} },
				]),
				
				Row([
				
					{ Button: {
						name: "BtnEdit",
						label: "Edit on new Canvas",
						events: {
							click: function(event){ Process(event, false) }
						},
						percentWidth: 60, height: 44, style: { color:0x000000, fontWeight:"normal" }
					} },
					
					{ Button: {
						name: "BtnExport",
						label: "Export",
						emphasized: true,
						events: {
							click: function(event){ Process(event, true) }
						},
						percentWidth: 40, height: 44, style: { color:0x000000, fontWeight:"bold" }
					} },
					
				]),
				
			]),
		]
	});
	
})();