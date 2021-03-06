/*
	Project:	FwPrism
	Author: 	WaveF
	Website:	miniCG.com
	Update:		20:52 2014/11/11
	
	** Back to main menu **
	fw.launchApp(fw.appDir+((fw.platform=="win")?"/Fireworks.exe":"/Adobe Fireworks CS6.app"), [fw.currentScriptDir+"/core/restore.jsf"]);
	(fw.platform=="win")?fw.launchApp(fw.appDir+"/Fireworks.exe",[fw.currentScriptDir+"/core/restore.jsf"]):alert("Please press Shift+R in the panel to refresh.");
*/
try {

	(function() {
		
		var version = "1.0.2";
		
		var os = fw.platform;
		var fwName = (fw.platform=="win")?"Fireworks.exe":"Adobe Fireworks CS6.app";
		var fwPath = fw.appDir + "/" + fwName;
		
		var curDir = fw.currentScriptDir;
		
		var Setting = new Object();
		var LogFilePath;

		var PrismName = fw.currentScriptFileName.replace(/.swf/g,"").replace(/.js/g,"").replace(/.jsf/g,"");
		
		RecoverJSPath = curDir + "/core/prism.js";
		LogFilePath = curDir + "/core/prism.json";
		ModuleFolder = curDir + "/modules";
		
		sp = "\n";
		
		/* FWHXR 联网模组 */
		try { dojo.require.call; } catch (exception)
			{ fw.runScript(curDir + "/lib/lib.js"); }
			dojo.require("fwlib.io");
		
		
		/* FwLib 增强模组 */
		if (typeof require != "function" || !require.version) {
			fw.runScript(curDir + "/lib/fwrequire.js");
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
			//var tree = new layers.LayerTree();
			//alert(tree.layer("Dialog").index);
			
			//if (!fw.documents.length) { return; }
			
		//------------------------------------------------------------------------------------------------ 变量声明 --//
		

		//------------------------------------------------------------------------------------------------ 函数区.start --//

			Array.prototype.clean = function(val) {
				for (var i = 0; i < this.length; i++) {
					if (this[i] == val) {         
						this.splice(i, 1);
						i--;
					}
				}
				return this;
			};
			
			Array.prototype.indexOf = function(val) {            
				for (var i = 0; i < this.length; i++) {
					if (this[i] == val) return i;
				}
				return -1;
			};

			Array.prototype.remove = function(val) {
				var index = this.indexOf(val);
				if (index > -1) {
					this.splice(index, 1);
				}
			};
			
			
			/* 获取核心更新信息（测试用） */
			function getCoreInfo(){
				var coreInfo = "";
				coreInfo += "<font color='#00ACEE'><b>Refresh:  </b></font>" + new Date().toLocaleString()+sp;
				//coreInfo += "<font color='#EA6502'><b>Created:  </b></font>" + (files.getCreatedDate(files.path(curDir,"/core/prism.js"))).toLocaleString()+sp;
				coreInfo += "<font color='#33B757'><b>Modified:  </b></font>" + (files.getModifiedDate(files.path(curDir,"/core/prism.js"))).toLocaleString();
				
				return coreInfo;
			}
			
			
			/* 获取对象所有属性（测试用） */
			function getAllPrpos(obj) {
				var props = "";
				for (var p in obj) {
					if (typeof(obj[p]) == " function ") { obj[p](); }
					else { props += p + " = " + obj[p] + " \t "; }
				}
				alert(props);
			}

			
			/* 初始化数据 */
			function init(inEvent){
				ReadLog();
				UpdatePanelCombox(inEvent);
			}

			/* 读取记录文件 */
			function ReadLog(){
				Setting = files.readJSON(LogFilePath);
			}
			
			/* 更新下拉菜单 */
			function UpdatePanelCombox(inEvent) {
				inEvent.result.push(["ModuleMenu", "dataProvider", Setting.modList],
									["ModuleMenu", "selectedItem", Setting.modList[Setting.modID]]);
			}
			
			/* 写入记录文件 */
			function UpdatePrismLog(){
				files.writeJSON(LogFilePath, Setting);
				ReloadPanel();
			}
			
			/* 替换JS文件 */
			function SwitchModuleJS(targetFileName){
				Files.deleteFileIfExisting(curDir+"/"+PrismName+".js");
				Files.copy(curDir+"/modules/"+targetFileName+".js", curDir+"/"+PrismName+".js");
			}
			
			/* 重载面板 */
			function ReloadPanel(){
				fw.launchApp(fw.appDir+"/Fireworks"+((fw.platform=="win")?".exe":".app"), [curDir+"/core/reload.jsf"]);
			}
			
			/* 面板名称检索 */
			function SearchList(name){
				var match = false;
				
				for(var i=0; i<Setting.modList.length;i++){
					if(Setting.modList[i]==name){ match = true; break }
				}
				return match;
			}
			
			/* 添加模块 */
			function AddModule(){
				var ExtModulePath, ExtModuleFolder, OpenedFileFullName, OpenedFileName, OpenedFileExt;
				
				ExtModulePath = fw.browseForFileURL("select");
				if(!ExtModulePath){ return }
				
				OpenedFileFullName = Files.getFilename(ExtModulePath);
				ExtModuleFolder = Files.getDirectory(ExtModulePath);
				if(ExtModuleFolder == ModuleFolder){ alert("You can't select a PanelScript file from FwPrism module folder!"); return }
				
				OpenedFileExt = Files.getExtension(OpenedFileFullName);
				OpenedFileName = OpenedFileFullName.replace(OpenedFileExt, "");
				
				if(OpenedFileName == "Market"){ alert("You can't replace Market module."); return }
				if(OpenedFileExt != '.js'){ alert('Wrong file type!'); return }
				
				
				/* 判断资源类型 */
				var FileString = files.read(ExtModulePath);
				var info = FileString.split(sp)[0];
				info = eval(info.toLowerCase());
				
				//if(info.version=='1.0'){
				
					//只有面板类可以被添加，其他资源无法作为模块被加入
					if(info.type=='panel'){
						if(FileString.indexOf("fwlib.panel.register")==-1){ alert('Not a vaild FwPrism panel script!'); return }
						
						var OverWrite = false;
						if(SearchList(OpenedFileName)){
							OverWrite = fw.yesNoDialog("Found same module name, overwrite?");
							if(!OverWrite){ return }
						}else{
							Setting.modList.push(OpenedFileName);
						}
						
						Files.deleteFileIfExisting(ModuleFolder+"/"+OpenedFileFullName);
						Files.copy(ExtModulePath, ModuleFolder+"/"+OpenedFileFullName);
						
						UpdatePrismLog();
					}else{
						return;
					}
					
				//}
			}
			
			/* 删除模块 */
			function RemoveModule(itemName){
				if(itemName=="Market"){ alert("You can't remove Market module."); return }
				if(Setting.modList.length==1){ alert("You can't remove all modules."); return }
				Setting.modList.remove(itemName);
				Setting.modID = 0;
				Files.deleteFileIfExisting(ModuleFolder+"/"+itemName+".js");
				UpdatePrismLog();
			}
			
			/* 用户界面 */
			function CreateHeader(inLabel){
				return { HBox: {
					percentWidth: 100,
					height: 22,
					style: { backgroundAlpha:.2, backgroundColor:"0xA4A4A4" },
					children: [
						{ Label: {
							text: inLabel,
							style: {
								paddingTop: 2,
								paddingLeft: 6,
								fontWeight: "bold",
								color: 0x555555,
								fontSize: 11
							},
						} },
					],
				} };
			}
			
			
		//------------------------------------------------------------------------------------------------ 函数区.end ----//

			
			fwlib.panel.register({
				events: {
					onFwStartMovie: function(event){ init(event); },
				},
				css: {
					".ButtonUp": { color: "0x999999" },
					".ButtonDown": { color: "0x000000" },
				},
				children: [
					//------------------------------------------------------------------ 选择模块/
					CreateHeader("Select module:"),
					{ HBox: {
						percentWidth:100,
						children:[
							{ ComboBox: {
								name: "ModuleMenu",
								percentWidth:100,
								height:30,
								selectedIndex: 0,
								dataProvider: [
									{ label: "Market" }
								],
								events: {
									keyUp: function(event){ }
								}
							} },
							{ Button: {
								name: "BtnAdd",
								label: "Add",
								width: 30,
								height: 30,
								style: { paddingLeft:12,icon:curDir+"/images/add.png" },
								events: {
									click: function(event){ AddModule(); }
								}
							} },
							{ Button: {
								name: "BtnDel",
								label: "Remove",
								width: 30,
								height: 30,
								style: { paddingLeft:12,icon:curDir+"/images/del.png" },
								events: {
									click: function(event){ RemoveModule(event.currentValues.ModuleMenu.selectedItem); }
								}
							} },
							{ Button: {
								name: "BtnLaunch",
								label: "Launch",
								width: 80,
								height: 30,
								emphasized: true,
								events: {
									click: function(event){
										Setting.modID = Number(event.currentValues.ModuleMenu.selectedIndex);
										SwitchModuleJS(Setting.modList[Setting.modID]);
										UpdatePrismLog();
									}
								}
							} },
						],
					} },
					
					{ Spacer: { height:2 } },
					{ HBox: {
						percentWidth: 100,
						children: [
							{ Text: {
								selectable: false,
								htmlText: getCoreInfo(),
							} },
						],
					} },
					
					
					{ Spacer: { height:10 } },
					{ HRule: { percentWidth:100 } },
					
					{ Button: {
						label: "Backup",
						width: 80,
						height:30,
						enabled: true,
						alpha: .5,
						events: {
							click: function(event){
								alert("Please make sure current version of prism is UP-TO-DATE!");
								var warning = fw.yesNoDialog("prism.js will be overwrite, continue?");
								if(warning){
									Files.deleteFileIfExisting(fw.currentScriptDir+"/core/prism.js");
									Files.copy(fw.currentScriptDir+"/FwPrism.js", fw.currentScriptDir+"/core/prism.js");
								}
							}
						},
						style: { color: "0xBBBBBB" }
					} },
					
					{ Spacer: { height:1 } },
					//------------------------------------------------------------------ 顶级容器
					{ VBox: {
						percentWidth:100,
						percentHeight:100,
						children:[
							//---------------------------------------------------------- 画布
							{ Text: {
								name: "MyText",
								percentWidth: 100,
								htmlText: "<font color='#ff0000'><b>Version: "+ version +" beta (NOT RELEASED VERSION)\n\nWarning:\nThis work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.</b></font>",
								selectable: false,
							} },
							{ Image: {
								source: "https://licensebuttons.net/l/by-nc-nd/4.0/88x31.png",
							} },
							//---------------------------------------------------------- 画布/
						],
					} },
					//------------------------------------------------------------------ 顶级容器/
				],
			});
			
		});

	})();

} catch (exception) {
	alert([exception, exception.lineNumber, exception.fileName].join("\n"));
}