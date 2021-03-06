INFO = { name:'JsonPen', version:'2.0', type:'panel' };


(function() {
	
	try { dojo.require.call; } catch (exception) { fw.runScript(fw.currentScriptDir + "/lib/lib.js"); }
	dojo.require("fwlib.io");
	
	var pen_chat = new dojo.jsonpen();
	pen_chat.setId('6cb4a355889be752d9ee44609f0446e694248a0aclc8');
	// origin_id: df27f72ce7bcc015d2116068cae48ac3b2a3b40c
	
	var pen_config = new dojo.jsonpen();
	pen_config.setId('2a6f5897c3ae085bfddb0062c4a09da3b2e88437jlfs');
	// origin_id: c5c25c6371d3f629f2e479a1fe5058b92d41a15f
	pen_config.setFile(fw.appDir + '/jsonpen.ini');
	
	var DEBUG = false;
	
	//================================================================ 初始化设定
	
	var defaultPassword = '21232f297a57a5a743894a0e4a801fc3';
	var defaultUserName = 'Robot';
	var defaultUserText = '';
	var defaultMessages = { chats: [{ name: "Robot", text: "Welcome to use Fireworks Talk!", time: getNow() }] };
	var defaultConfig   = loadConfig() || { user: defaultUserName, pwd: defaultPassword };
	
	
	//================================================================== 功能函数
	
	// 发送留言
	function sendMsg(inEvent) {
		//pen_chat.help();
		if (inEvent.currentValues.Msg == '') {
			alert('Enter something!');
			return;
		}
		
		inEvent.result.push(['Msg', 'text', '']);
		
		loadChats(inEvent, function(chats){
			chats.push({
				name: inEvent.currentValues.Nick,
				text: inEvent.currentValues.Msg,
				time: getNow()
			});
			updateChatBox(chats, inEvent);
			pen_chat.update(dojo.toJson({chats:chats}));
		});
		
		saveConfig({
			user: inEvent.currentValues.Nick,
			pwd:  defaultPassword
		});
	}
	
	// 下载并刷新留言
	function refreshChats(inEvent) {
		loadChats(inEvent, function(chats){
			updateChatBox(chats, inEvent);
		});
	}

	// 重置数据
	function resetDB(inEvent) {
		var pwd = prompt('Enter password to reset database', '');
		if (pwd == undefined) return;
		
		if (dojo.md5(pwd) !== defaultPassword) {
			alert('Wrong password.');
			return;
		} else {
			alert('Database has been reset.');
		}
		
		pen_chat.update(dojo.toJson(defaultMessages));
		
		loadChats(inEvent, function(chats){
			updateChatBox(chats, inEvent);
		});
	}
	
	// 加载配置
	function loadConfig() {
		var c = pen_config.load();
		c = dojo.fromJson(c);
		return c;
	}
	
	// 保存配置
	function saveConfig(cfg) {
		pen_config.save(dojo.toJson(cfg));
	}
	
	// 更新留言板（不下载）
	function updateChatBox(chats, inEvent){
		var text_list = [];
		
		dojo.forEach(chats, function(item, idx){
			var _time = '\n[ '+item.time+' ]';
			var _name = item.name + ': ';
			var _text = item.text;
			
			_time = '';
			text_list.push( _name + _text + _time);
		});
		
		text_list.reverse();
		inEvent.result.push(['ChatBox', 'text', text_list.join('\n')]);
	}
	
	// 下载留言
	function loadChats(inEvent, callback) {
		var data;
		pen_chat.read(function(res){
			data = dojo.fromJson(res.data);
		});
		if (arguments.length<2) return;
		callback(data.chats);
	}
	
	// 获取当前时间
	function getNow() {
		var d = new Date();
		var year =  d.getFullYear();
		var month = d.getMonth() + 1;
		var date =  d.getDate();
		var hour =  d.getHours();
		var minute = d.getMinutes();
		var second = d.getSeconds();
		return year+'.'+month+'.'+date+' '+hour+':'+minute+':'+second;
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
					buttonMode: true,
					events:{
						click: function(event){
							if (event.altKey && event.ctrlKey) {
								resetDB(event);
							}
						}
					},
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
					source: fw.currentScriptDir + "/images/reload.png",
					events:{
						click: function(event){
							refreshChats(event);
						}
					},
					toolTip: 'refresh'
				} },
				{ Image: {
					width: 30,
					height: 30,
					buttonMode: true,
					source: fw.currentScriptDir + "/images/back.png",
					events:{
						click: function(event){
							if (!DEBUG) {
								fw.launchApp(fw.appDir+((fw.platform=="win")?"/Fireworks.exe":"/Adobe Fireworks CS6.app"), [fw.currentScriptDir+"/core/restore.jsf"]);
							}
						}
					},
					toolTip: 'back to home'
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
		events: {
			onFwActiveDocumentChange:	refreshChats,
			onFwActiveSelectionChange:	refreshChats,
			onFwActiveToolChange:		refreshChats,
			onFwActiveViewChange:		refreshChats,
			onFwApplicationActivate:	refreshChats,
			onFwDocumentClosed:			refreshChats,
			onFwDocumentOpen:			refreshChats,
			onFwDocumentSave:			refreshChats,
			onFwStartMovie:				refreshChats
		},
		css: {
			".Col": { paddingLeft:0 },
			".Row": { paddingLeft:4, paddingButtom:0 },
			".btnNormal": { color:0x666666, fontWeight: "normal" },
			".btnActive": { color:0x0085D5, fontWeight: "normal" },
			
			".infoTitle": { color:0x636363, paddingTop:8 },
			".infoValue": { color:0x0085D5, paddingTop:8, fontWeight:"bold", fontSize:11 },
			
			".resultLabel": { color:0x636363, fontWeight: "normal", paddingTop:3, paddingLeft:0 }
		},
		children:[
			
			CreateHeader(INFO.name, 0x2C93DB),
			
			{ VDividedBox: {
				percentWidth: 100,
				percentHeight: 100,
				children: [
					{ VBox: {
						percentWidth: 100,
						percentHeight: 100,
						style: {
							paddingBottom: 10
						},
						children: [
							{ TextArea: {
								name: "ChatBox",
								percentWidth: 100,
								percentHeight: 100,
								text: '',
								editable: false,
								style: {
									paddingTop: 4,
									paddingRight: 8,
									paddingBottom: 4,
									paddingLeft: 8
								},
								events: {
									click: function(event) {
										refreshChats(event);
									}
								}
							} }
						]
					} },
					
					{ HBox: {
						percentWidth: 100,
						children: [
							{ VBox: {
								width: 100,
								children: [
									{ Label: {
										text: "Your Name:"
									} },
									{ TextInput: {
										name: "Nick",
										text: defaultConfig.user,
										percentWidth: 100,
										height: 28,
										style: {
											paddingTop: 2
										}
									} },
								]
							} },
							{ VBox: {
								percentWidth: 100,
								children: [
									{ Label: {
										text: "Message:"
									} },
									{ HBox: {
										percentWidth: 100,
										height: 40,
										children: [
											{ TextInput: {
												name: "Msg",
												text: defaultUserText,
												percentWidth: 100,
												height: 28,
												style: {
													paddingTop: 2
												},
												events: {
													keyUp: function (event) {
														if (event.keyCode == 13 && event.ctrlKey) {
															sendMsg(event);
														}
													}
												}
											} },
											
											{ Button: {
												name: "BtnSend",
												label: "Send",
												height: 28,
												events: {
													click: function (event) {
														sendMsg(event);
													}
												}
											} }
										]
									} }
								]
							} },
						]
					} },
				]
			} }
		]
	});

})();