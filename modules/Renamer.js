INFO = { name:'Renamer', version:'1.3.4', type:'panel' };

(function() {

	try { dojo.require.call; } catch (exception) { fw.runScript(fw.currentScriptDir + "/lib/lib.js"); }
	dojo.require("fwlib.io");


	//================================================================== 初始化设定

	var DEBUG = false;

	
	var newNameList = [];

	var MODE_ADD     = true;
	var MODE_REMOVE  = false;
	var MODE_REPLACE = false;
	var MODE_NUMBER  = false;
	var MODE_SPLIT   = false;

	
	fw.lang = (Files.getLanguageDirectory().split("/")[Files.getLanguageDirectory().split("/").length-1]).toLowerCase();
	var LOCALE = 'en';
	if(fw.lang.indexOf("chinese")!=-1){ LOCALE = 'cn'; }

	var LANG = {
		REMOVE: {
			"NAME"  :    { "en": "Remove" , "cn": "删除" },
			"START" :    { "en": "Start:" , "cn": "开始" },
			"END"   :    { "en": "End:"   , "cn": "结束" },
			"METHOD_FT": { "en": "remove chars from Start to End"    , "cn": "删除从开始到结束之间的字符" },
			"METHOD_LR": { "en": "remove chars from Left or Right", "cn": "从左/右进行计数删除字符" },
			"RESET" :    { "en": "Reset"  , "cn": "重置" }
		},
		REPLACE: {
			"NAME"   : { "en": "Replace" , "cn": "替换"    },
			"KEYWORD": { "en": "Keyword:", "cn": "关键字:" },
			"WITH"   : { "en": "with:"   , "cn": "替换为:" },
			"TXTFILE": { "en": "TXT File", "cn": "从文件替换" },
			"RESET"  : { "en": "Reset"   , "cn": "重置"    }
		},
		ADD: {
			"NAME"     : { "en": "Add"       , "cn": "添加"  },
			"PREFIX"   : { "en": "Prefix:"   , "cn": "前缀:" },
			"SUFFIX"   : { "en": "Suffix:"   , "cn": "后缀:" },
			"OVERWRITE": { "en": "Overwrite:", "cn": "改写"  },
			"RESET"    : { "en": "Reset"     , "cn": "重置"  }
		},
		NUMBER: {
			"NAME"    : { "en": "Number"   , "cn": "数字"  },
			"MODE"    : { "en": "Mode:"    , "cn": "模式:" },
			"PREFIX"  : { "en": "Prefix"   , "cn": "前缀"  },
			"SUFFIX"  : { "en": "Suffix"   , "cn": "后缀"  },
			"INSERT"  : { "en": "Insert"   , "cn": "插入"  },
			"AT"      : { "en": "at:"      , "cn": "于:"   },
			"SEP"     : { "en": "Sep:"     , "cn": "分隔:" },
			"START"   : { "en": "Start:"   , "cn": "开始:" },
			"INCREASE": { "en": "Increase:", "cn": "递增:" },
			"DIGIT"   : { "en": "Digit:"   , "cn": "位数:" },
			"RESET"   : { "en": "Reset"    , "cn": "重置"  }
		},
		SPLIT: {
			"NAME"    : { "en": "Split"  , "cn": "截断" },
			"SYMBOL"  : { "en": "Symbol:", "cn": "符号:" },
			"LEFT"    : { "en": "Left:"  , "cn": "左侧:" },
			"RIGHT"   : { "en": "Right:" , "cn": "右侧:" },
			"RESET"   : { "en": "Reset"  , "cn": "重置" }
		},
		OPERATION: {
			"NAME"   : { "en": "Operation"       , "cn": "操作"      },
			"ARRANGE": { "en": "Position Arrange", "cn": "按坐标排序" },
			"REVERSE": { "en": "Reverse Order"   , "cn": "图层反序"   },
			"PREVIEW": { "en": "Preview"         , "cn": "预览"      },
			"RENAME" : { "en": "Rename"          , "cn": "重命名"    }
		}
	};

	
	var REMOVE  = {},
	    REPLACE = {},
	    ADD     = {},
	    NUMBER  = {},
		SPLIT   = {};
		
	var configFileName = '/renamer.ini';

	
	//================================================================== 功能函数

	function Renamer(inEvent, process){
		if(!fw.selection){ alert("No object was selected!"); return false; }
		if(fw.selection.length<1){ alert("You must select one object at least!"); return false; }
		if(!MODE_ADD && !MODE_REMOVE && !MODE_REPLACE && !MODE_NUMBER && !MODE_SPLIT){ alert("You should setup something first."); return false; }
		
		newNameList = [];
		UpdateSetting(inEvent);
		
		var i, j, oldName, newName, startIdx, endIdx, insertAt, nPad, opr;
		
		var sel = fw.selection;
		var newSel = [];
		var strArr = [];
		
		for(i=0; i<sel.length; i++){
			objName = "";
			
			//---- 初始原名称 ----
			if(sel[i]=="[object SliceHotspot]"){
				if(sel[i].baseName==null) { objName="" } else { objName=sel[i].baseName }
			}else{
				if(sel[i].name==null) { objName="" } else { objName=sel[i].name }
			}
			
			
			//---- 删除字符 ----
			if(inEvent.currentValues.cbRemove){
				/* 如果原名称为空，那新名也必定为空 */
				if(objName != ""){
					var remWord = "";
					
					if(REMOVE.FromTo){
						if ((REMOVE.Start + REMOVE.End) > objName.length) {
							objName = '';
						} else {
							remWord = objName.substr(REMOVE.Start, REMOVE.End);
							objName = objName.split(remWord).join("");
						}
					} else {
						remWord = objName.substr(0, REMOVE.Start);
						objName = objName.split(remWord).join("");

						remWord = objName.substr(objName.length-REMOVE.End, REMOVE.End);
						objName = objName.split(remWord).join("");
					}
				}
			}
			
			
			//---- 替换字符 ----
			if(inEvent.currentValues.cbReplace){
				objName = objName.split(REPLACE.Keyword).join(REPLACE.With);
			}
			
			
			//---- 追加字符 ----
			if(inEvent.currentValues.cbAdd){
				if(ADD.Original!=""){ objName = ADD.Original }
				objName = ADD.Prefix + objName;
				objName = objName + ADD.Suffix;
			}
			
			
			//---- 数字序号 ----
			if(inEvent.currentValues.cbNumber){
				nPad = "";
				if(NUMBER.Start+NUMBER.Increase*i>=0){ opr="" }else{ opr="-" }
				
				if(NUMBER.Pad>0){
					for(j=1; j<NUMBER.Pad; j++){ nPad += "0" }
					if(NUMBER.Start+NUMBER.Increase*i>=0){
						nPad = nPad.substr(String(NUMBER.Start+NUMBER.Increase*i).length-1, nPad.length);
					}else{
						nPad = nPad.substr(String(NUMBER.Start+NUMBER.Increase*i).length-2, nPad.length);
					}
				}
				
				/* 前缀 */
				if(NUMBER.Mode == 0){
					objName = opr + nPad + Math.abs(NUMBER.Start+NUMBER.Increase*i) + NUMBER.Sep + objName;
				}
				
				/* 后缀 */
				if(NUMBER.Mode == 1){
					objName = objName + NUMBER.Sep + opr + nPad + Math.abs(NUMBER.Start+NUMBER.Increase*i);
				}
				
				/* 插入 */
				if(NUMBER.Mode == 2){
					if(NUMBER.At > objName.length){ insertAt = objName.length }
					else{ insertAt = NUMBER.At }
					
					strArr[0] = objName.substr(0, insertAt);
					strArr[1] = objName.substr(insertAt, objName.length);
					
					objName = strArr[0] + NUMBER.Sep + opr + nPad + Math.abs(NUMBER.Start+NUMBER.Increase*i) + NUMBER.Sep + strArr[1];
				}
			}
			
			
			//---- 定位截断 ----
			if(inEvent.currentValues.cbSplit){
				var splitArr = [];
				if(SPLIT.Symbol != ""){
					splitArr = objName.split(SPLIT.Symbol);
				}
				
				var finalArr = [];
				var leftArr = [];
				var rightArr = [];
				if (SPLIT.Left > 0) {
					leftArr = splitArr.slice(0, SPLIT.Left);
				}

				if (SPLIT.Right > 0) {
					rightArr = splitArr.slice(splitArr.length-SPLIT.Right, splitArr.length);
				}

				finalArr = leftArr.concat(rightArr);

				objName = finalArr.join(SPLIT.Symbol);
			}


			
			//---- 命名对象 ----
			newNameList.push(objName);
			if(process){
				if(sel[i]=="[object SliceHotspot]"){ sel[i].baseName = objName }
				else{ sel[i].name = objName }
			}
			
		}
		
		fw.selection = sel;

		return true;
	}

	function UpdateSetting(inEvent){
		REMOVE.enabled  = inEvent.currentValues.cbRemove;
		REMOVE.Start    = inEvent.currentValues.remStart;
		REMOVE.End      = inEvent.currentValues.remEnd;
		REMOVE.FromTo   = inEvent.currentValues.remFromTo;
		
		REPLACE.enabled = inEvent.currentValues.cbReplace;
		REPLACE.Keyword = inEvent.currentValues.repKeyword;
		REPLACE.With    = inEvent.currentValues.repWith;
		
		ADD.enabled     = inEvent.currentValues.cbAdd;
		ADD.Prefix      = inEvent.currentValues.addPrefix;
		ADD.Suffix      = inEvent.currentValues.addSuffix;
		ADD.Original    = inEvent.currentValues.addOriginal;
		
		NUMBER.enabled  = inEvent.currentValues.cbNumber;
		NUMBER.Mode     = inEvent.currentValues.numMode.selectedIndex;
		NUMBER.At       = inEvent.currentValues.numAt;
		NUMBER.Sep      = inEvent.currentValues.numSep;
		NUMBER.Start    = inEvent.currentValues.numStart;
		NUMBER.Increase = inEvent.currentValues.numIncrease;
		NUMBER.Pad      = inEvent.currentValues.numPad;

		SPLIT.enabled   = inEvent.currentValues.cbSplit;
		SPLIT.Symbol    = inEvent.currentValues.spSymbol;
		SPLIT.Left      = inEvent.currentValues.spLeft;
		SPLIT.Right     = inEvent.currentValues.spRight;
		
		saveSettings({
			"remove" : REMOVE,
			"replace": REPLACE,
			"add"    : ADD,
			"number" : NUMBER,
			"split"  : SPLIT,
		});
	}

	function saveSettings(settings) {
		var configFilePath = fw.currentScriptDir + configFileName;
		if (!Files.exists(configFilePath)) {
			Files.createFile(configFilePath, "TEXT", "????");
			if (!Files.exists(configFilePath)) {
				alert('Can not create config file, please run Fireworks as Administrator.');
				return;
			}
		};
		configFile = Files.open(configFilePath, true);
		configFile.write(dojo.toJson(settings));
		configFile.close();
	}

	function loadSettings() {
		var s = '{"remove": {"enabled": false, "Start": 0, "End": 0, "FromTo": false}, "replace": {"enabled": false, "Keyword": "", "With": ""}, "add": {"enabled": true, "Prefix": "", "Suffix": "", "Original": "ICON"}, "number": {"enabled": true, "Mode": 1, "At": 1, "Sep": "_", "Start": 1, "Increase": 1, "Pad": 2}, "split": {"enabled": false, "Symbol": "_", "Left": 0, "Right": 0}}';
		
		var configFilePath = fw.currentScriptDir + configFileName;
		if (!Files.exists(configFilePath)) return s;

		var configFile = Files.open(configFilePath, false);
		var lines = [], line;

		if (configFile) {
			while ((line = configFile.readline()) !== null) {
				lines.push(line);
			}

			configFile.close();

			s = lines.join("\n");
		}
		return s;
	}

	function updateUIBySettings(inEvent) {
		var s = loadSettings();
		inEvent.result.push(
			['remStart' , 'value'   , s.remove.Start],
			['remEnd'   , 'value'   , s.remove.End],
			['remFromTo', 'selected', s.remove.FromTo],

			['repKeyword', 'text', s.replace.Keyword],
			['repWith'   , 'text', s.replace.With],

			['addPrefix'   , 'text', s.add.Prefix],
			['addSuffix'   , 'text', s.add.Suffix],
			['addOriginal' , 'text', s.add.Original],

			['numAt'      , 'value', s.number.At],
			['numSep'     , 'text' , s.number.Sep],
			['numStart'   , 'value', s.number.Start],
			['numIncrease', 'value', s.number.Increase],
			['numPad'     , 'value', s.number.Pad],

			['spSymbol', 'text' , s.split.Symbol],
			['spLeft'  , 'value', s.split.Left],
			['spRight' , 'value', s.split.Right]
		);
		refreshRemoveFromTo(inEvent, s.remove.FromTo);
	}

	function replaceFromFile(inEvent) {
		// var txtfilePath = fw.browseForFileURL('select');
		var txtfilePath = fw.locateDocDialog(1, ['kMoaCfFormat_Text']);
		if (!txtfilePath) return;
		txtfilePath = txtfilePath[0];

		var txtContent = [];
		var txtLine = '';

		var txtfile = Files.open(txtfilePath, true);
		while (txtLine != null) {
			txtLine = txtfile.readline();

			if (txtLine == null) break;
			txtContent.push(txtLine);
		}
		txtfile.close();
		
		var process = fw.yesNoDialog('Confirm to rename as:\n' + txtContent.join(', '));
		if (!process) return;

		var s = fw.selection;
		for (var i=0; i<txtContent.length; i++) {
			if (!s[i]) return;

			if(s[i]=="[object SliceHotspot]"){
				s[i].baseName = txtContent[i];
			}else{
				s[i].name = txtContent[i];
			}
		}
	}

	function reverseLayers(inEvent) {
		if(fw.documents.length<1) return;
		if(!fw.selection) return;
		if(fw.selection<2) return;
		
		var dom = fw.getDocumentDOM();
		var sel = fw.selection;

		for(var i=0; i<sel.length; i++){
			fw.selection = sel[i];
			dom.arrange("front");
		}

		fw.selection = sel;
	}

	function arrangeLayers(inEvent) {
		if(fw.documents.length<1) return;
		if(!fw.selection) return ;
		if(fw.selection.length<1) return;
		
		var dom = fw.getDocumentDOM();
		var sel = fw.selection;

		var diff_y = [];
		var row = {};
		var rows = [];
		var result = [];
		
		for (var i=0; i<sel.length; i++) {
			var x = sel[i].left;
			var y = sel[i].top;
			
			if ( !inArray(y, diff_y) ) {
				diff_y.push(y);
				row['y_'+y] = [sel[i]];
			} else {
				row['y_'+y].push(sel[i]);
			}
		}
		
		diff_y.sort(function(a,b){
			return a-b;
		});
		console.log(diff_y)
		for (var i=0; i<diff_y.length; i++) {
			var arr = row['y_' + diff_y[i]];
			
			arr.sort(function(a, b){
				return a.left - b.left;
			});
			
			result = result.concat(arr);
		}
		
		for (var i=0; i<result.length; i++) {
			fw.selection = [ result[i] ];
			dom.arrange("front");
		}
		
		dom.changeCurrentPage(dom.currentPageNum);
		fw.selection = sel;
	}

	function refreshRemoveFromTo(inEvent, flag) {
		var fromTo = flag;
		if (fromTo) {
			inEvent.result.push(['remFromTo', 'label', LANG.REMOVE.METHOD_FT[LOCALE]]);
		} else {
			inEvent.result.push(['remFromTo', 'label', LANG.REMOVE.METHOD_LR[LOCALE]]);
		}
	}

	function initSection(sectionId) {
		var s = loadSettings();
		if (sectionId == 'MODE_ADD')     return s.add.enabled;
		if (sectionId == 'MODE_REMOVE')  return s.remove.enabled;
		if (sectionId == 'MODE_REPLACE') return s.replace.enabled;
		if (sectionId == 'MODE_NUMBER')  return s.number.enabled;
		if (sectionId == 'MODE_SPLIT')   return s.split.enabled;
	}

	function inArray(k, arr) {
		for (var n in arr) {
			if (k === arr[n]) {
				return true;
			}
		}
		return false;
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
							if (DEBUG) return;
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
				//backgroundAlpha: .2,
				//backgroundColor: "0x74BA41",
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
						color: 0xFFFFFF,
						fontSize: 11,
					},
				} },
			],
		} };
	}

	function Col(inChildren,pw){
		if(!pw){ pw=100 };
		return { VBox: {
			percentWidth: pw,
			//styleName: "Col",
			children: inChildren
		} };
	}

	function Row(inChildren,pw){
		if(!pw){ pw=100 };
		return { HBox: {
			percentWidth: pw,
			//styleName: "Row",
			children: inChildren
		} };
	}



	//================================================================== 用户界面

	fwlib.panel.register({
		events: {
			onFwStartMovie: function(event){
				// updateUIBySettings(event);
			}
		},
		css: {
			"TextInput": {  },
			"Label": { paddingLeft:10, paddingTop:2, width:40 }
		},
		children:[
			CreateHeader(INFO.name, 0x4DCD70),
			

	//------------------------------------------------------------------ 追加字符
			{ HBox: {
				percentWidth: 100,
				height: 22,
				style: {
					paddingLeft: 4,
					backgroundAlpha: .2,
					backgroundColor: "0xA4A4A4",
				},
				children: [
					{ CheckBox: {
						name: "cbAdd",
						selected: MODE_ADD,
						style:{
							paddingTop:4,
							paddingRight:4
						},
						events:{
							click: function(event){
								MODE_ADD = event.currentValues.cbAdd;
								event.result.push(
									["addPrefix","enabled",MODE_ADD],
									["addSuffix","enabled",MODE_ADD],
									["addOriginal","enabled",MODE_ADD]
								);
							}
						}
					} },
				
					{ Label: {
						/* 追加字符 */
						text: LANG.ADD.NAME[LOCALE],
						percentWidth: 100,
						style: {
							paddingLeft: -10,
							paddingTop: 2,
							fontWeight: "bold",
							color: 0x555555,
							fontSize: 11,
						},
						events: {
							click: function(event){
								MODE_ADD = !MODE_ADD;
								event.result.push(["cbAdd","selected",MODE_ADD],
												["addPrefix","enabled",MODE_ADD],
												["addSuffix","enabled",MODE_ADD],
												["addOriginal","enabled",MODE_ADD]);
							}
						}
					} },
					
					{ Label: { text:"|", width: 1, style: { color:0x888888, paddingTop:2, paddingRight:10, fontWeight:"normal" } } },
					
					{ Button: {
						/* 重置 */
						label: LANG.ADD.RESET[LOCALE],
						height: 22,
						alpha: 0,
						buttonMode: true,
						events: {
							click: function(event){
								event.result.push(["addPrefix","text",""],
												["addSuffix","text",""],
												["addOriginal","text",""]);
							}
						},
						style: { color:0x888888, paddingRight:-10 }
					} },
					{ Spacer: { width:6 } },
					
					
				],
			} },
			Row([
				{ Label: {
					/* 追加 - 原始 */
					text: LANG.ADD.OVERWRITE[LOCALE],
					width: 70,
				} },
				{ TextInput: {
					name: "addOriginal",
					enabled: MODE_ADD,
					percentWidth: 100,
					text: ""
				} },

				{ Label: {
					/* 追加 - 前缀 */
					text: LANG.ADD.PREFIX[LOCALE],
					width: 48,
				} },
				{ TextInput: {
					name: "addPrefix",
					enabled: MODE_ADD,
					width: 60,
					text: "",
				} },
				
				{ Label: {
					/* 追加 - 后缀 */
					text: LANG.ADD.SUFFIX[LOCALE],
					width: 48,
				} },
				{ TextInput: {
					name: "addSuffix",
					enabled: MODE_ADD,
					width: 60,
					text: "",
				} },
			]),
			{ Spacer: { height:2 } },



	//------------------------------------------------------------------ 删除字符
			{ HBox: {
				percentWidth: 100,
				height: 22,
				style: {
					paddingLeft: 4,
					backgroundAlpha: .2,
					backgroundColor: "0xA4A4A4",
				},
				children: [
					{ CheckBox: {
						name: "cbRemove",
						selected: MODE_REMOVE,
						style:{
							paddingTop:4,
							paddingRight:4
						},
						events:{
							click: function(event){
								MODE_REMOVE = event.currentValues.cbRemove;
								event.result.push(
									["remStart" , "enabled", MODE_REMOVE],
									["remEnd"   , "enabled", MODE_REMOVE],
									["remLength", "enabled", MODE_REMOVE],
									["remFromTo", "enabled", MODE_REMOVE]
								);
							}
						}
					} },
					
					{ Label: {
						percentWidth: 100,
						/* 删除字符 */
						text: LANG.REMOVE.NAME[LOCALE],
						style: {
							paddingLeft: -10,
							paddingTop: 2,
							fontWeight: "bold",
							color: 0x555555,
							fontSize: 11,
						},
						events: {
							click: function(event){
								MODE_REMOVE = !MODE_REMOVE;
								event.result.push(
									["cbRemove","selected",MODE_REMOVE],
									["remStart","enabled",MODE_REMOVE],
									["remEnd","enabled",MODE_REMOVE],
									["remLength","enabled",MODE_REMOVE],
									["remFromTo","enabled",MODE_REMOVE]
								);
							}
						}
					} },
					
					{ Label: { text:"|", width: 1, style: { color:0x888888, paddingTop:2, paddingRight:10, fontWeight:"normal" } } },
					
					{ Button: {
						/* 重置 */
						label: LANG.REMOVE.RESET[LOCALE],
						height: 22,
						alpha: 0,
						buttonMode: true,
						events: {
							click: function(event){
								event.result.push(["remStart","value",0],
												  ["remEnd","value",0],
												  ["remLength","value",0]);
							}
						},
						style: { color:0x888888, paddingRight:-10 }
					} },
					
					{ Spacer: { width:6 } },
				],
			} },
			Row([
				{ Label: {
					/* 删除 - 开始 */
					text: LANG.REMOVE.START[LOCALE],
					width: 48,
				} },
				{ NumericStepper: {
					name: "remStart",
					enabled: MODE_REMOVE,
					width: 60,
					value: 0,
					stepSize: 1,
					minimum: 0,
					maximum: 9999
				} },
				
				{ Label: {
					/* 删除 - 结束 */
					text: LANG.REMOVE.END[LOCALE],
					width: 48,
				} },
				{ NumericStepper: {
					name: "remEnd",
					enabled: MODE_REMOVE,
					width: 60,
					value: 0,
					stepSize: 1,
					minimum: 0,
					maximum: 9999
				} },
				
				{ CheckBox: {
					name: "remFromTo",
					selected: false,
					enabled: MODE_REMOVE,
					label: LANG.REMOVE.METHOD_LR[LOCALE],
					style:{
						paddingTop:3,
						paddingRight:4,
						paddingLeft: 20
					},
					events:{
						change: function(event) {
							refreshRemoveFromTo(event, event.currentValues.remFromTo);
						}
					}
				} }
			]),
			{ Spacer: { height:2 } },
			
			
	//------------------------------------------------------------------ 替换字符
			{ HBox: {
				percentWidth: 100,
				height: 22,
				style: {
					paddingLeft: 4,
					backgroundAlpha: .2,
					backgroundColor: "0xA4A4A4",
				},
				children: [
					{ CheckBox: {
						name: "cbReplace",
						selected: MODE_REPLACE,
						style:{
							paddingTop:4,
							paddingRight:4
						},
						events:{
							click: function(event){
								MODE_REPLACE = event.currentValues.cbReplace;
								event.result.push(
									["repKeyword", "enabled", MODE_REPLACE],
									["repWith"   , "enabled", MODE_REPLACE],
									["repFromTxt", "enabled", MODE_REPLACE]
								);
							}
						}
					} },
					
					{ Label: {
						/* 替换字符 */
						text: LANG.REPLACE.NAME[LOCALE],
						percentWidth: 100,
						style: {
							paddingLeft: -10,
							paddingTop: 2,
							fontWeight: "bold",
							color: 0x555555,
							fontSize: 11,
						},
						events: {
							click: function(event){
								MODE_REPLACE = !MODE_REPLACE;
								event.result.push(
									["cbReplace" , "selected",MODE_REPLACE],
									["repKeyword", "enabled", MODE_REPLACE],
									["repWith"   , "enabled", MODE_REPLACE],
									["repFromTxt", "enabled", MODE_REPLACE]
								);
							}
						}
					} },
					
					{ Label: { text:"|", width: 1, style: { color:0x888888, paddingTop:2, paddingRight:10, fontWeight:"normal" } } },
					
					{ Button: {
						/* 重置 */
						label: LANG.REPLACE.RESET[LOCALE],
						height: 22,
						alpha: 0,
						buttonMode: true,
						events: {
							click: function(event){
								event.result.push(["repKeyword","text",""],
												  ["repWith","text",""]);
							}
						},
						style: { color:0x888888, paddingRight:-10 }
					} },
					{ Spacer: { width:6 } },
				],
			} },
			Row([
				{ Label: {
					/* 替换 - 关键字 */
					text: LANG.REPLACE.KEYWORD[LOCALE],
					width: 62,
				} },
				{ TextInput: {
					name: "repKeyword",
					enabled: MODE_REPLACE,
					width: 126,
					text: "",
				} },
				
				{ Label: {
					/* 替换 - 替换词 */
					text: LANG.REPLACE.WITH[LOCALE],
					width: 44,
				} },
				{ TextInput: {
					name: "repWith",
					enabled: MODE_REPLACE,
					percentWidth: 100,
					text: "",
				} },

				{ Button: {
					/* 从文件读取 */
					name: "repFromTxt",
					label: LANG.REPLACE.TXTFILE[LOCALE],
					enabled: MODE_REPLACE,
					percentWidth: 100,
					height: 28,
					events:{
						click: replaceFromFile
					}
				} },
			]),
			{ Spacer: { height:2 } },
			
			
	//------------------------------------------------------------------ 数字序号
			{ HBox: {
				percentWidth: 100,
				height: 22,
				style: {
					paddingLeft: 4,
					backgroundAlpha: .2,
					backgroundColor: "0xA4A4A4",
				},
				children: [
					{ CheckBox: {
						name: "cbNumber",
						selected: MODE_NUMBER,
						style:{
							paddingTop:4,
							paddingRight:4
						},
						events:{
							click: function(event){
								MODE_NUMBER = event.currentValues.cbNumber;
								if(event.currentValues.numMode.selectedIndex == 2 && MODE_NUMBER){
									event.result.push(["numAt","enabled",true]);
								}else{
									event.result.push(["numAt","enabled",false]);
								}
								event.result.push(["numMode","enabled",MODE_NUMBER],
												  ["numSep","enabled",MODE_NUMBER],
												  ["numStart","enabled",MODE_NUMBER],
												  ["numIncrease","enabled",MODE_NUMBER],
												  ["numPad","enabled",MODE_NUMBER]);
							}
						}
					} },
					
					{ Label: {
						/* 数字序号 */
						text: LANG.NUMBER.NAME[LOCALE],
						percentWidth: 100,
						style: {
							paddingLeft: -10,
							paddingTop: 2,
							fontWeight: "bold",
							color: 0x555555,
							fontSize: 11,
						},
						events: {
							click: function(event){
								MODE_NUMBER = !MODE_NUMBER;
								
								if(event.currentValues.numMode.selectedIndex == 2 && MODE_NUMBER){
									event.result.push(["numAt","enabled",true]);
								}else{
									event.result.push(["numAt","enabled",false]);
								}
								
								event.result.push(["cbNumber"   , "selected", MODE_NUMBER],
												  ["numMode"    , "enabled" , MODE_NUMBER],
												  ["numSep"     , "enabled" , MODE_NUMBER],
												  ["numStart"   , "enabled" , MODE_NUMBER],
												  ["numIncrease", "enabled" , MODE_NUMBER],
												  ["numPad"     , "enabled" , MODE_NUMBER]);
							}
						}
					} },
					
					{ Label: { text:"|", width: 1, style: { color:0x888888, paddingTop:2, paddingRight:10, fontWeight:"normal" } } },
					
					{ Button: {
						/* 重置 */
						label: LANG.NUMBER.RESET[LOCALE],
						height: 22,
						alpha: 0,
						buttonMode: true,
						events: {
							click: function(event){
								event.result.push(["numMode",    "selectedIndex", 1],
												  ["numAt",      "value",         1],
												  ["numAt",      "enabled",       false],
												  ["numSep",     "text",          "_"],
												  ["numStart",   "value",         1],
												  ["numIncrease","value",         1],
												  ["numPad",     "value",         0]);
							}
						},
						style: { color:0x888888, paddingRight:-10 }
					} },
					{ Spacer: { width:6 } },
				],
			} },
			Col([
				Row([
					{ Label: {
						/* 数字序号 - 模式 */
						text: LANG.NUMBER.MODE[LOCALE],
						width: 48,
						style:{
							paddingTop:4
						}
					} },
					{ ComboBox: {
						name: "numMode",
						enabled: MODE_NUMBER,
						width: 100,
						height: 26,
						selectedIndex: 1,
						dataProvider: [LANG.NUMBER.PREFIX[LOCALE], LANG.NUMBER.SUFFIX[LOCALE], LANG.NUMBER.INSERT[LOCALE]],
						events: {
							change: function(event){
								if(event.currentValues.numMode.selectedIndex == 2){
									event.result.push(["numAt", "enabled", true]);
								}else{
									event.result.push(["numAt", "enabled", false]);
								}
							}
						}
					} },
					
					{ Label: {
						/* 数字序号 - 插入于 */
						text: LANG.NUMBER.AT[LOCALE],
						width: 32,
					} },
					{ NumericStepper: {
						name: "numAt",
						enabled: false,
						width: 50,
						value: 1,
						stepSize: 1,
						minimum: 0,
						maximum: 9999,
					} },
					
					{ Label: {
						/* 数字序号 - 分隔 */
						text: LANG.NUMBER.SEP[LOCALE],
						width: 44,
					} },
					{ TextInput: {
						name: "numSep",
						enabled: MODE_NUMBER,
						percentWidth: 100,
						text: "_",
					} },
				]),
				
				Row([
					{ Label: {
						/* 数字序号 - 开始 */
						text: LANG.NUMBER.START[LOCALE],
						width: 48,
					} },
					{ NumericStepper: {
						name: "numStart",
						enabled: MODE_NUMBER,
						width: 60,
						value: 1,
						stepSize: 1,
						minimum: -9999,
						maximum: 9999,
					} },
					
					{ Label: {
						/* 数字序号 - 步进 */
						text: LANG.NUMBER.INCREASE[LOCALE],
						width: 62,
					} },
					{ NumericStepper: {
						name: "numIncrease",
						enabled: MODE_NUMBER,
						width: 60,
						value: 1,
						stepSize: 1,
						minimum: -9999,
						maximum: 9999,
					} },
					
					{ Label: {
						/* 数字序号 - 位数 */
						text: LANG.NUMBER.DIGIT[LOCALE],
						width: 44,
					} },
					{ NumericStepper: {
						name: "numPad",
						enabled: MODE_NUMBER,
						percentWidth: 100,
						value: 1,
						stepSize: 1,
						minimum: 1,
						maximum: 9999,
					} },
				]),
			]),
			{ Spacer: { height:2 } },

	
	//------------------------------------------------------------------ 定点截断
			{ HBox: {
				percentWidth: 100,
				height: 22,
				style: {
					paddingLeft: 4,
					backgroundAlpha: .2,
					backgroundColor: "0xA4A4A4",
				},
				children: [
					{ CheckBox: {
						name: "cbSplit",
						selected: MODE_SPLIT,
						style:{
							paddingTop:4,
							paddingRight:4
						},
						events:{
							click: function(event){
								MODE_SPLIT = event.currentValues.cbSplit;
								event.result.push(
									["spSymbol", "enabled", MODE_SPLIT],
									["spLeft"  , "enabled", MODE_SPLIT],
									["spRight" , "enabled", MODE_SPLIT]
								);
							}
						}
					} },
					
					{ Label: {
						/* 定点截断 */
						text: LANG.SPLIT.NAME[LOCALE],
						percentWidth: 100,
						style: {
							paddingLeft: -10,
							paddingTop: 2,
							fontWeight: "bold",
							color: 0x555555,
							fontSize: 11,
						},
						events: {
							click: function(event){
								MODE_SPLIT = !MODE_SPLIT;
								event.result.push(
									["cbSplit" ,"selected", MODE_SPLIT],
									["spSymbol", "enabled", MODE_SPLIT],
									["spLeft"  , "enabled", MODE_SPLIT],
									["spRight" , "enabled", MODE_SPLIT]
								);
							}
						}
					} },
					
					{ Label: { text:"|", width: 1, style: { color:0x888888, paddingTop:2, paddingRight:10, fontWeight:"normal" } } },
					
					{ Button: {
						/* 重置 */
						label: LANG.SPLIT.RESET[LOCALE],
						height: 22,
						alpha: 0,
						buttonMode: true,
						events: {
							click: function(event){
								event.result.push(
									["spSymbol", "text" , '_'],
									["spLeft"  , "value", 0],
									["spRight" , "value", 0]
								);
							}
						},
						style: { color:0x888888, paddingRight:-10 }
					} },
					{ Spacer: { width:6 } },
				],
			} },
			Col([
				Row([
					{ Label: {
						/* 截断 - 符号 */
						text: LANG.SPLIT.SYMBOL[LOCALE],
						width: 60,
					} },
					{ TextInput: {
						name: "spSymbol",
						enabled: MODE_SPLIT,
						percentWidth: 100,
						text: "_",
					} },
					
					{ Label: {
						/* 截断 - 左侧 */
						text: LANG.SPLIT.LEFT[LOCALE],
						width: 48,
					} },
					{ NumericStepper: {
						name: "spLeft",
						enabled: MODE_SPLIT,
						width: 60,
						value: 0,
						stepSize: 1,
						minimum: 0,
						maximum: 9999,
					} },
					
					{ Label: {
						/* 截断 - 右侧 */
						text: LANG.SPLIT.RIGHT[LOCALE],
						width: 48,
					} },
					{ NumericStepper: {
						name: "spRight",
						enabled: MODE_SPLIT,
						width: 60,
						value: 0,
						stepSize: 1,
						minimum: 0,
						maximum: 9999,
					} },
				]),
			]),
			{ Spacer: { height:2 } },
			
			
	//--------------------------------------------------------------------- 操作
			/* 操作 */
			CreateCaption(LANG.OPERATION.NAME[LOCALE]),
			
			Row([

				Col([
					{ Button: {
						/* 按坐标排序 */
						label: LANG.OPERATION.ARRANGE[LOCALE],
						percentWidth: 100,
						height: 28,
						events:{
							click: arrangeLayers
						}
					} },

					{ Button: {
						/* 倒序排列 */
						label: LANG.OPERATION.REVERSE[LOCALE],
						percentWidth: 100,
						height: 28,
						events:{
							click: reverseLayers
						}
					} },
				], 50),
				
				{ Button: {
					/* 操作 - 预览 */
					label: LANG.OPERATION.PREVIEW[LOCALE],
					percentWidth: 20,
					height: 62,
					events:{
						click: function(event){
							if(!fw.selection){ return }
							if(fw.selection.length>0){
								if (Renamer(event, false)) {
									alert(newNameList.toString().split(",").join(" , "));
								}
							}
						}
					}
				} },
				
				{ Button: {
					/* 操作 - 重命名 */
					label: LANG.OPERATION.RENAME[LOCALE],
					percentWidth: 100,
					height: 62,
					emphasized: true,
					events:{
						click: function(event){
							Renamer(event, true);
						}
					}
				} },

			]),

		]
	});

	
})();