INFO = { name: "Randomize", version: "1.0", type: "panel" };

// 0.6.5
(function () {

	//================================================================ 初始化

	// build JSON in Fireworks...
	var JSON = {
		parse: function (str, strict) {
			if (strict && !/^([\s\[\{]*(?:"(?:\\.|[^"])+"|-?\d[\d\.]*(?:[Ee][+-]?\d+)?|null|true|false|)[\s\]\}]*(?:,|:|$))+$/.test(str)) {
				throw new SyntaxError("Invalid characters in JSON");
			}
			return eval('(' + str + ')');
		},

		stringify: function (value, replacer, spacer) {
			var undef;
			if (typeof replacer == "string") {
				spacer = replacer;
				replacer = null;
			}
			var escapeString = function (str) {
				return ('"' + str.replace(/(["\\])/g, '\\$1') + '"').
				replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").
				replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
			};
			var stringify = function (it, indent, key) {
				if (replacer) {
					it = replacer(key, it);
				}
				var val, objtype = typeof it;
				if (objtype == "number") {
					return isFinite(it) ? it + "" : "null";
				}
				if (objtype == "boolean") {
					return it + "";
				}
				if (it === null) {
					return "null";
				}
				if (typeof it == "string") {
					return escapeString(it);
				}
				if (objtype == "function" || objtype == "undefined") {
					return undef;
				}
				if (typeof it.toJSON == "function") {
					return stringify(it.toJSON(key), indent, key);
				}
				if (it instanceof Date) {
					return '"{FullYear}-{Month+}-{Date}T{Hours}:{Minutes}:{Seconds}Z"'.replace(/\{(\w+)(\+)?\}/g, function (t, prop, plus) {
						var num = it["getUTC" + prop]() + (plus ? 1 : 0);
						return num < 10 ? "0" + num : num;
					});
				}
				if (it.valueOf() !== it) {
					return stringify(it.valueOf(), indent, key);
				}
				var nextIndent = spacer ? (indent + spacer) : "";
				var sep = spacer ? " " : "";
				var newLine = spacer ? "\n" : "";
				if (it instanceof Array) {
					var itl = it.length,
						res = [];
					for (key = 0; key < itl; key++) {
						var obj = it[key];
						val = stringify(obj, nextIndent, key);
						if (typeof val != "string") {
							val = "null";
						}
						res.push(newLine + nextIndent + val);
					}
					return "[" + res.join(",") + newLine + indent + "]";
				}
				var output = [];
				for (key in it) {
					var keyStr;
					if (typeof key == "number") {
						keyStr = '"' + key + '"';
					} else if (typeof key == "string") {
						keyStr = escapeString(key);
					} else {
						continue;
					}
					val = stringify(it[key], nextIndent, key);
					if (typeof val != "string") {
						continue;
					}
					output.push(newLine + nextIndent + keyStr + ":" + sep + val);
				}
				return "{" + output.join(",") + newLine + indent + "}";
			}
			return stringify(value, "", "");
		},

		readTextFile: function (inFilePath) {
			var text = "";

			if (Files.exists(inFilePath)) {
				var file = Files.open(inFilePath, false),
					lines = [],
					line;

				if (file) {
					while ((line = file.readline()) !== null) {
						lines.push(line);
					}

					file.close();

					text = lines.join("\n");
				}
			}

			return text;
		},

		writeTextFile: function (inFilePath, inText, inIncludeBOM) {
			Files.deleteFileIfExisting(inFilePath);
			Files.createFile(inFilePath, "TEXT", "????");
			if (!Files.exists(inFilePath)) {
				alert('Can not create file, please run Fireworks as Administrator.');
			}

			var file = Files.open(inFilePath, true, inIncludeBOM ? "UTF8" : "");

			file.writeUTF8(inText);
			file.close();
		},

		read: function (inFilePath, inDefaultData) {
			var result = inDefaultData,
				json = this.readTextFile(inFilePath),
				data;
			if (json.length > 0) {
				try {
					data = this.parse(json);

					if (typeof inDefaultData == "object" && inDefaultData) {
						for (var name in data) {
							inDefaultData[name] = data[name];
						}
						result = inDefaultData;
					} else {
						result = data;
					}
				} catch (exception) {}
			}

			return result;
		},

		write: function (inFilePath, inData, inSpacer) {
			if (typeof inSpacer == "undefined") {
				inSpacer = "\t";
			}

			this.writeTextFile(inFilePath, this.stringify(inData, null, inSpacer));
		}
	}

	var words = {
		"range": {
			"en": "Range",
			"cn": "范围"
		},
		"width": {
			"en": "Width",
			"cn": "宽"
		},
		"height": {
			"en": "Height",
			"cn": "高"
		},
		"offsetx": {
			"en": "OffsetX",
			"cn": "x偏移"
		},
		"offsety": {
			"en": "OffsetY",
			"cn": "y偏移"
		},
		"rotation": {
			"en": "Rotation",
			"cn": "旋转"
		},
		"degree": {
			"en": "degree",
			"cn": "度"
		},
		"blur": {
			"en": "Blur",
			"cn": "模糊"
		},
		"pixel": {
			"en": "pixel",
			"cn": "像素"
		},
		"alpha": {
			"en": "Alpha",
			"cn": "透明度"
		},
		"scale": {
			"en": "Scale",
			"cn": "缩放"
		},
		"lockAspectRatio": {
			"en": "Lock Aspect Ratio",
			"cn": "锁定缩放比例"
		},
		"lockWidth": {
			"en": "Lock Width",
			"cn": "锁定宽度"
		},
		"lockHeight": {
			"en": "Lock Height",
			"cn": "锁定高度"
		},
		"lockAttribute": {
			"en": "Lock Attribute",
			"cn": "锁定效果"
		},
		"hue": {
			"en": "Hue",
			"cn": "色相"
		},
		"colorFill": {
			"en": "Color Fill",
			"cn": "颜色填充"
		},
		"hueShift": {
			"en": "Hue Shift",
			"cn": "色相偏移"
		},
		"hlsColorize": {
			"en": "HLS Colorize",
			"cn": "彩色化"
		},
		"lightness": {
			"en": "Lightness",
			"cn": "明度"
		},
		"clone": {
			"en": "Clone",
			"cn": "克隆"
		},
		"num": {
			"en": "Number",
			"cn": "数量"
		},
		"autoExclude": {
			"en": "Auto Exclude",
			"cn": "自动排除"
		},
		"clear": {
			"en": "CLEAR",
			"cn": "归零"
		},
		"random": {
			"en": "Random",
			"cn": "随机"
		},
		"undo": {
			"en": "Undo",
			"cn": "撤销"
		},
		"randomizeIt": {
			"en": "Randomize It!",
			"cn": "随机化!"
		},
		"fetch": {
			"en": "Fetch",
			"cn": "提取"
		},
		"from": {
			"en": "From",
			"cn": "从"
		},
		"to": {
			"en": "to",
			"cn": "至"
		},
	};

	var i18n = {
		init: function (lang, db) {
			for (var i in db) {
				this[i] = db[i][lang];
			}
		}
	};

	i18n.init(getFwLanguage(), words);

	String.prototype.firstUpperCase = function () {
		return this.replace(/^\S/, function (s) {
			return s.toUpperCase();
		});
	}

	var jsonFile = Files.makePathFromDirAndFile(fw.currentScriptDir, "fwprism_randomize.json");
	if (!Files.exists(jsonFile)) {
		JSON.write(jsonFile, {})
	}

	var CtrlKey, AltKey, ShiftKey;
	var Settings = JSON.read(jsonFile, {
		range: {
			enabled: true,
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			offsetX: 20,
			offsetY: 20
		},
		rotation: {
			enabled: true,
			from: 0,
			to: 360
		},
		blur: {
			enabled: true,
			from: 1,
			to: 4
		},
		alpha: {
			enabled: true,
			from: 10,
			to: 100
		},
		scale: {
			enabled: true,
			from: 0.2,
			to: 1.5,
			lockRatio: true,
			lockWidth: false,
			lockHeight: false,
			lockAttribute: true
		},
		hue: {
			enabled: false,
			mode: 0
		},
		clones: {
			num: 20,
			exclude: false
		}
	});


	//================================================================== 功能函数

	
	function getFwLanguage () {
		var _lang;
		var _langDir = Files.getLanguageDirectory();
		var _splitWords = _langDir.split("/");
		_langDir = _splitWords[_splitWords.length-1];
		
		if (_langDir.indexOf("Chinese") != -1) {
			return 'cn';
		} else {
			return 'en';
		}
	}

	function getDomSize() {
		var w = 0,
			h = 0;

		if (fw.documents.length > 0) {
			w = fw.getDocumentDOM().width;
			h = fw.getDocumentDOM().height;
		}

		return {
			width: w,
			height: h
		}
	}

	function UpdateSettings(inEvent) {
		var UI = inEvent.currentValues;

		JSON.write(jsonFile, {
			"range": {
				"enabled": UI.RangeEnabled,
				"x": UI.RangeX,
				"y": UI.RangeY,
				"width": UI.RangeWidth,
				"height": UI.RangeHeight,
				"offsetX": UI.RangeOffsetX,
				"offsetY": UI.RangeOffsetY
			},
			"rotation": {
				"enabled": UI.RotateEnabled,
				"from": UI.RotateFrom,
				"to": UI.RotateTo
			},
			"blur": {
				"enabled": UI.BlurEnabled,
				"from": UI.BlurFrom,
				"to": UI.BlurTo
			},
			"alpha": {
				"enabled": UI.AlphaEnabled,
				"from": UI.AlphaFrom,
				"to": UI.AlphaTo
			},
			"scale": {
				"enabled": UI.ScaleEnabled,
				"from": UI.ScaleFrom,
				"to": UI.ScaleTo,
				"lockRatio": UI.ScaleLockRatio,
				"lockWidth": UI.ScaleLockWidth,
				"lockHeight": UI.ScaleLockHeight,
				"lockAttribute": UI.ScaleLockAttribute
			},
			"hue": {
				"enabled": UI.HueEnabled,
				"mode": UI.HueGroup
			},
			"clones": {
				num: UI.ClonesNumber,
				exclude: UI.ClonesExclude
			}
		});
	}

	function Randomize(inEvent, currentBtn) {
		UpdateSettings(inEvent);

		var UI = inEvent.currentValues;

		var solo;
		var doRange  = (currentBtn == "BtnRange"),
			doRotate = (currentBtn == "BtnRotation"),
			doBlur   = (currentBtn == "BtnBlur"),
			doAlpha  = (currentBtn == "BtnAlpha"),
			doScale  = (currentBtn == "BtnScale"),
			doHue    = (currentBtn == "BtnHue"),
			doClone  = (currentBtn == "BtnClone");

		if (currentBtn == "BtnRandomize" || currentBtn == "BtnRandom") {
			solo = false;
			doRange = doRotate = doBlur = doAlpha = doScale = doHue = doClone = true;
		} else {
			solo = true;
		}

		var dom = (fw.documents.length > 0) ? fw.getDocumentDOM() : null;
		var sel = fw.selection ? fw.selection : [];

		if (!dom) {
			alert("Open / Create a document first!");
			return false;
		}
		if (sel.length == 0) {
			alert("Select something first!");
			return false;
		}

		var cloneNum = UI.ClonesNumber;
		if (UI.ClonesExclude && UI.ClonesNumber > 0) {
			cloneNum--;
		}

		if (sel.length > 10 && cloneNum > 10 && !solo) {
			var hardCalc = fw.yesNoDialog("Clone multiple layers will slow down Fireworks, continue?");
			if (!hardCalc) {
				return false;
			}
		}


		var newSel = [];
		fw.moveFocusToDoc();

		if (cloneNum > 0 && doClone) {
			if (fw.selection.length > 1) {
				dom.group("normal");
			}

			sel = [fw.selection[0]];

			for (var k = 0; k < cloneNum; k++) {
				dom.cloneSelection();
				sel.push(fw.selection[0]);
			}

			fw.selection = sel;
		}

		for (var i = 0; i < sel.length; i++) {
			var el = sel[i];
			var filters = [];

			if (solo) {
				if (el.effectList){
					filters = getOrigFilters(el.effectList.effects);
				}
			}

			fw.selection = el;

			if (UI.RotateEnabled && doRotate) {
				dom.rotateSelection(getRandomNum(UI.RotateFrom, UI.RotateTo), "autoTrimImages");
			}

			if (UI.BlurEnabled && doBlur) {
				filters.push({
					EffectIsVisible: true,
					EffectMoaID: "{d04ef8c0-71b3-11d1-8c8200a024cdc039}",
					MB_filter_preview_tile_size: "-1 -1",
					category: "Blur",
					gaussian_blur_radius: getRandomNum(UI.BlurFrom, UI.BlurTo),
					name: "Gaussian Blur..."
				});
			}

			if (UI.AlphaEnabled && doAlpha) {
				dom.setOpacity(getRandomNum(UI.AlphaFrom, UI.AlphaTo));
			}

			if (UI.ScaleEnabled && doScale) {
				var scaleAttrParam;
				var scaleX = UI.ScaleLockWidth ? 1 : getRandomNum(UI.ScaleFrom, UI.ScaleTo);
				var scaleY = UI.ScaleLockHeight ? 1 : getRandomNum(UI.ScaleFrom, UI.ScaleTo);

				if (UI.ScaleLockRatio) {
					scaleX = scaleY;
				}

				if (UI.ScaleLockAttribute) {
					scaleAttrParam = "autoTrimImages";
				} else {
					scaleAttrParam = "autoTrimImages transformAttributes";
				}

				if (UI.ScaleLockWidth) {
					scaleX = 1;
				}

				if (UI.ScaleLockHeight) {
					scaleY = 1;
				}

				dom.scaleSelection(scaleX, scaleY, scaleAttrParam);
			}

			if (UI.RangeEnabled && doRange) {
				var moveX, moveY;
				
				moveX = getRandomNum(UI.RangeX + UI.RangeOffsetX, UI.RangeX + UI.RangeWidth  - el.width  - UI.RangeOffsetX);
				moveY = getRandomNum(UI.RangeY + UI.RangeOffsetY, UI.RangeY + UI.RangeHeight - el.height - UI.RangeOffsetY);

				dom.moveSelectionTo({
					x: moveX,
					y: moveY
				}, false, false);
			}

			if (UI.HueEnabled && doHue) {
				switch (UI.HueGroup) {
					
					case 0:
						//color fill
						filters.push({
							Blendmode: 0,
							Color: getRandomColor(),
							EffectIsVisible: true,
							EffectMoaID: "{dd54adc0-a279-11d3-b92a000502f3fdbe}",
							Opacity: 100,
							category: "Adjust Color",
							name: "Color Fill"
						});
						break;

					case 1:
						//hue
						filters.push({
							EffectIsVisible: true,
							EffectMoaID: "{3439b08d-1922-11d3-9bde00e02910d580}",
							MB_filter_preview_tile_size: "-1 -1",
							category: "Adjust Color",
							hls_colorize: false,
							hue_amount: getRandomNum(-180, 180),
							saturation_amount: 40,
							lightness_amount: 4,
							name: "Hue/Saturation..."
						});
						break;

					case 2:
						//colorize
						filters.push({
							EffectIsVisible: true,
							EffectMoaID: "{3439b08d-1922-11d3-9bde00e02910d580}",
							MB_filter_preview_tile_size: "-1 -1",
							category: "Adjust Color",
							hls_colorize: true,
							hue_amount: getRandomNum(0, 360),
							lightness_amount: 0,
							name: "Hue/Saturation...",
							saturation_amount: 100
						});
						break;
					
					case 3:
						// lightness
						filters.push({
							EffectIsVisible: true,
							EffectMoaID: "{3439b08d-1922-11d3-9bde00e02910d580}",
							MB_filter_preview_tile_size: "-1 -1",
							category: "Adjust Color",
							hls_colorize: false,
							hue_amount: 0,
							lightness_amount: getRandomNum(-90, 90),
							name: "Hue/Saturation...",
							saturation_amount: 100
						});
						break;
				}
			}

			if (filters.length > 0) {
				dom.applyEffects({
					category: "UNUSED",
					effects: filters,
					name: "UNUSED"
				});
			}

			newSel.push(fw.selection[0]);
		}

		fw.selection = newSel;
	}

	function reloadRangeSize(inEvent) {
		inEvent.result.push(
			["RangeWidth",  "value", Settings.range.width  || getDomSize().width],
			["RangeHeight", "value", Settings.range.height || getDomSize().height]
		);
	}

	function getOrigFilters (effects) {
		var list = [];
		for (var i = 0; i < effects.length; i++) {
			list.push(effects[i]);
		}
		return list;
	}

	function checkFilters(filterName) {
		var idx = -1;
		if (fw.selection[0].effectList != null) {
			var len = fw.selection[0].effectList.effects.length;
			if (len > 0) {
				for (var i = 0; i <= len; i++) {
					if (fw.selection[0].effectList.effects[i].name == filterName) {
						idx = i;
						break;
					}
				}
			}
		}
		return idx;
	}

	function getRandomNum(min, max) {
		return FormatNum(Math.random() * (max - min) + min);
	}

	function getRandomColor() {
		var rgb = HSB_RGB(getRandomNum(0, 360) * .01, .8, 1);
		return hex2css(rgb2hex(rgb[0], rgb[1], rgb[2]));
	}

	function HSB_RGB(h, s, v) {
		var r, g, b;
		var i = Math.floor(h * 6);
		var f = h * 6 - i;
		var p = v * (1 - s);
		var q = v * (1 - f * s);
		var t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0:
				r = v, g = t, b = p;
				break;

			case 1:
				r = q, g = v, b = p;
				break;

			case 2:
				r = p, g = v, b = t;
				break;

			case 3:
				r = p, g = q, b = v;
				break;

			case 4:
				r = t, g = p, b = v;
				break;

			case 5:
				r = v, g = p, b = q;
				break;
		}
		return [r * 255, g * 255, b * 255];
	}

	function rgb2hex(r, g, b) {
		return r << 16 | g << 8 | b;
	}

	function hex2css(color) {
		return "#" + color.toString(16);
	}

	/* 格式化小数 */
	function FormatNum(num) {
		var sym = 1;
		if (num < 0) {
			sym = -1
		}

		var num = num.toFixed(2);
		num = sym * Math.abs(num);

		return num;
	}

	/* 格式化色值 */
	function FormatColor(val) {
		val = val.toString();
		val = val.split("#").join("0x");
		//val = parseInt(val);
		return val;
	}


	//================================================================== 界面函数

	/* 创建面板标题栏 */
	function CreateHeader(inLabel, bgColor) {
		if (bgColor == 0xFFFFFF) {
			bgColor = 0xCCCCCC
		}
		return {
			HBox: {
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
						events: {
							click: function (event) {
								fw.launchApp(fw.appDir + ((fw.platform == "win") ? "/Fireworks.exe" : "/Adobe Fireworks CS6.app"), [fw.currentScriptDir + "/core/restore.jsf"]);
							}
						}
					} }
				],
			}
		};
	}

	/* 创建分类标题 */
	function CreateCaption(inLabel, pw) {
		pw = pw || 100;
		return {
			HBox: {
				name: "Bar" + inLabel,
				percentWidth: pw,
				height: 22,
				styleName: "bar",
				children: [
					{ Label: {
						name: "Btn" + inLabel,
						text: inLabel,
						styleName: "caption",
						events: {
							click: function (e) {
								Randomize(e, "Btn" + inLabel);
							},
							rollOver: function (e) {
								e.result.push(["Btn" + inLabel, "styleName", "captionHover"]);
								e.result.push(["Bar" + inLabel, "styleName", "barHover"]);
							},
							rollOut: function (e) {
								e.result.push(["Btn" + inLabel, "styleName", "caption"]);
								e.result.push(["Bar" + inLabel, "styleName", "bar"]);
							}
						}
					} },
				],
			}
		};
	}

	/* 创建分类标题 */
	function CreateCaptionEx(inLabel, cbName, checked, pw) {
		pw = pw || 100;
		return {
			HBox: {
				name: "Bar" + inLabel,
				percentWidth: pw,
				height: 22,
				styleName: "bar",
				children: [
					{ Label: {
						name: "Btn" + inLabel,
						text: inLabel,
						styleName: "caption",
						events: {
							click: function (e) {
								Randomize(e, "Btn" + inLabel);
							},
							rollOver: function (e) {
								e.result.push(["Btn" + inLabel, "styleName", "captionHover"]);
								e.result.push(["Bar" + inLabel, "styleName", "barHover"]);
							},
							rollOut: function (e) {
								e.result.push(["Btn" + inLabel, "styleName", "caption"]);
								e.result.push(["Bar" + inLabel, "styleName", "bar"]);
							}
						}
					} },
					{ Label: {
						percentWidth: 100,
						text: "",
					} },
					{ CheckBox: {
						name: cbName,
						selected: checked,
						height: 20,
						toolTip: inLabel + " on/off",
						style: {
							paddingRight: 8,
							paddingTop: 2
						},
						events: {
							click: function (e) {
								UpdateSettings(e);
							}
						}
					} },
				]
			}
		}
	}

	/* 创建行间距 */
	function RowSpace() {
		return {
			Spacer: {
				height: 2
			}
		};
	}

	/* 创建垂直容器，类似css中flex垂直排列 */
	function Col(inChildren, pw) {
		if (!pw) {
			pw = 100
		};
		return {
			VBox: {
				percentWidth: pw,
				styleName: "Col",
				children: inChildren
			}
		};
	}

	/* 创建水平容器，类似css中flex水平排列 */
	function Row(inChildren, pw) {
		if (!pw) {
			pw = 100
		};
		return {
			HBox: {
				percentWidth: pw,
				styleName: "Row",
				children: inChildren
			}
		};
	}

	//========================================================================== 用户界面

	fwlib.panel.register({
		css: {
			".caption": {
				paddingLeft: 4,
				paddingTop: 2,
				fontWeight: "bold",
				color: 0x555555,
				fontSize: 11
			},
			".captionHover": {
				paddingLeft: 4,
				paddingTop: 2,
				fontWeight: "bold",
				color: 0x0088B5,
				fontSize: 11
			},
			".bar": {
				paddingLeft: 4,
				backgroundAlpha: .2,
				backgroundColor: "0xA4A4A4",
			},
			".barHover": {
				paddingLeft: 4,
				backgroundAlpha: .2,
				backgroundColor: "0x00ccff",
			},
			".btnClear": {
				paddingTop: 3,
				textAlign: "center",
				fontWeight: "bold",
				color: 0x333333
			},
			".btnClearHover": {
				paddingTop: 3,
				textAlign: "center",
				fontWeight: "bold",
				color: 0xff3300
			},
			".Col": {
				paddingLeft: 0
			},
			".Row": {
				paddingLeft: 4,
				paddingButtom: 0
			},
			".btnNormal": {
				color: 0x666666,
				fontWeight: "normal"
			},
			".btnActive": {
				color: 0x0085D5,
				fontWeight: "normal"
			},

			".infoTitle": {
				color: 0x636363,
				paddingTop: 8
			},
			".infoValue": {
				color: 0x0085D5,
				paddingTop: 8,
				fontWeight: "bold",
				fontSize: 11
			},

		},
		events: {
			onFwStartMovie: reloadRangeSize
			// onFwActiveSelectionChange: reloadRangeSize,
			// onFwObjectSettingChange: reloadRangeSize,
			// onFwActiveDocumentChange: reloadRangeSize
		},
		children: [

			CreateHeader(INFO.name, 0x00CCFF),

			{
				VBox: {
					percentWidth: 100,
					percentHeight: 100,
					children: [

						CreateCaptionEx(i18n["range"], "RangeEnabled", Settings.range.enabled),
						Row([
							// x and y
							Col([
								Row([
									{ Label: {
										text: "x:",
										width: 20,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "RangeX",
										percentWidth: 100,
										height: 24,
										value: Settings.range.x,
										stepSize: 1,
										maximum: 6000,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								]),

								Row([
									{ Label: {
										text: "y:",
										width: 20,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "RangeY",
										percentWidth: 100,
										height: 24,
										value: Settings.range.y,
										stepSize: 1,
										maximum: 6000,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 25),

							// width and height
							Col([
								Row([
									{ Label: {
										text: i18n["width"] + ":",
										width: 45,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "RangeWidth",
										percentWidth: 100,
										height: 24,
										value: Settings.range.x || getDomSize().width,
										stepSize: 1,
										maximum: 6000,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								]),

								Row([
									{ Label: {
										text: i18n["height"] + ":",
										width: 45,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "RangeHeight",
										percentWidth: 100,
										height: 24,
										value: Settings.range.y || getDomSize().height,
										stepSize: 1,
										maximum: 6000,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 30),

							// margin and padding
							Col([
								Row([
									{ Label: {
										text: i18n["offsetx"] + ":",
										width: 55,
										toolTip: "Horizontal offset from the range edge",
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "RangeOffsetX",
										percentWidth: 100,
										height: 24,
										value: Settings.range.offsetX,
										stepSize: 1,
										maximum: 3000,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											},
										},
										style: {
											fontSize: 12
										}
									} },
								]),

								Row([
									{ Label: {
										text: i18n["offsety"] + ":",
										width: 55,
										toolTip: "Vertical offset from the range edge",
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "RangeOffsetY",
										percentWidth: 100,
										height: 24,
										value: Settings.range.offsetY,
										stepSize: 1,
										maximum: 3000,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											},
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 30),

							Col([
								{ Button: {
									label: i18n["fetch"],
									percentWidth: 100,
									height: 55,
									toolTip: "Fetch [x, y, width, height] from selected object,\nif nothing was selected, canvas size will be taken.",
									events: {
										click: function (e) {
											if (!fw.selection) return;

											var _x, _y, _w, _h;
											if (fw.selection.length == 0) {
												_x = _y = 0;
												_w = getDomSize().width;
												_h = getDomSize().height;
											} else {
												var el = fw.selection[0];
												_x = el.left;
												_y = el.top;
												_w = el.width;
												_h = el.height;
											}
											
											e.result.push(
												["RangeX",       "value", _x],
												["RangeY",       "value", _y],
												["RangeWidth",   "value", _w],
												["RangeHeight",  "value", _h],
												["RangeOffsetX", "value", 0],
												["RangeOffsetY", "value", 0]
											);
										}
									}
								} }
							], 15)
						]),
						RowSpace(),


						CreateCaptionEx(i18n["rotation"], "RotateEnabled", Settings.rotation.enabled),
						Row([
							Col([
								Row([
									{ Label: {
										text: i18n["from"]+":",
										width: 40,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "RotateFrom",
										percentWidth: 100,
										height: 24,
										value: Settings.rotation.from,
										stepSize: 1,
										maximum: 6000,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 50),

							Col([
								Row([
									{ Label: {
										text: "-> " + i18n["to"] + ":",
										width: 40,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "RotateTo",
										percentWidth: 100,
										height: 24,
										value: Settings.rotation.to,
										stepSize: 1,
										maximum: 6000,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 50),

							{ Label: {
								text: i18n["degree"],
								width: 60,
								style: {
									paddingLeft: 4,
									paddingTop: 3
								}
							} },
						]),
						RowSpace(),


						CreateCaptionEx(i18n["blur"], "BlurEnabled", Settings.blur.enabled),
						Row([
							Col([
								Row([
									{ Label: {
										text: i18n["from"]+":",
										width: 40,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "BlurFrom",
										percentWidth: 100,
										height: 24,
										value: Settings.blur.from,
										stepSize: 1,
										maximum: 200,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 50),

							Col([
								Row([
									{ Label: {
										text: "-> " + i18n["to"] + ":",
										width: 40,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "BlurTo",
										percentWidth: 100,
										height: 24,
										value: Settings.blur.to,
										stepSize: 1,
										maximum: 250,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 50),

							{ Label: {
								text: i18n["pixel"],
								width: 60,
								style: {
									paddingLeft: 4,
									paddingTop: 3
								}
							} },
						]),
						RowSpace(),


						CreateCaptionEx(i18n["alpha"], "AlphaEnabled", Settings.alpha.enabled),
						Row([
							Col([
								Row([
									{ Label: {
										text: i18n["from"]+":",
										width: 40,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "AlphaFrom",
										percentWidth: 100,
										height: 24,
										value: Settings.alpha.from,
										stepSize: 1,
										maximum: 99,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 50),

							Col([
								Row([
									{ Label: {
										text: "-> " + i18n["to"] + ":",
										width: 40,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "AlphaTo",
										percentWidth: 100,
										height: 24,
										value: Settings.alpha.to,
										stepSize: 1,
										maximum: 100,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 50),

							{ Label: {
								text: "%",
								width: 60,
								style: {
									paddingLeft: 4,
									paddingTop: 3
								}
							} },
						]),
						RowSpace(),


						CreateCaptionEx(i18n["scale"], "ScaleEnabled", Settings.scale.enabled),
						Row([
							Col([
								Row([
									{ Label: {
										text: i18n["from"]+":",
										width: 40,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "ScaleFrom",
										percentWidth: 100,
										height: 24,
										value: Settings.scale.from,
										stepSize: 0.1,
										maximum: 100,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 50),

							Col([
								Row([
									{ Label: {
										text: "-> " + i18n["to"] + ":",
										width: 40,
										style: {
											paddingLeft: 4,
											paddingTop: 3
										}
									} },
									{ NumericStepper: {
										name: "ScaleTo",
										percentWidth: 100,
										height: 24,
										value: Settings.scale.to,
										stepSize: 0.1,
										maximum: 100,
										minimum: 0,
										enabled: true,
										events: {
											change: function (e) {
												UpdateSettings(e)
											}
										},
										style: {
											fontSize: 12
										}
									} },
								])
							], 50),

							{ Label: {
								text: "×",
								width: 60,
								style: {
									paddingLeft: 4,
									paddingTop: 3
								}
							} },
						]),
						Row([
							{ CheckBox: {
								name: "ScaleLockRatio",
								label: i18n["lockAspectRatio"],
								selected: Settings.scale.lockRatio,
								height: 20,
								toolTip: "Keep aspect ratio when scale",
								style: {
									paddingLeft: 8,
									paddingTop: 2
								},
								events: {
									click: function (e) {
										UpdateSettings(e);
									}
								}
							} },
							{ CheckBox: {
								name: "ScaleLockWidth",
								label: i18n["lockWidth"],
								selected: Settings.scale.lockWidth,
								height: 20,
								toolTip: "Force width locked\n-keep aspect will not work when this is ON",
								style: {
									paddingLeft: 14,
									paddingTop: 2
								},
								events: {
									click: function (e) {
										UpdateSettings(e);
									}
								}
							} },
							{ CheckBox: {
								name: "ScaleLockHeight",
								label: i18n["lockHeight"],
								selected: Settings.scale.lockHeight,
								height: 20,
								toolTip: "Force height locked\n-keep aspect will not work when this is ON",
								style: {
									paddingLeft: 14,
									paddingTop: 2
								},
								events: {
									click: function (e) {
										UpdateSettings(e);
									}
								}
							} },
							{ CheckBox: {
								name: "ScaleLockAttribute",
								label: i18n["lockAttribute"],
								selected: Settings.scale.lockAttribute,
								height: 20,
								toolTip: "Filter will be scaled when this is ON",
								style: {
									paddingLeft: 14,
									paddingTop: 2
								},
								events: {
									click: function (e) {
										UpdateSettings(e);
									}
								}
							} },
						]),
						RowSpace(),


						CreateCaptionEx(i18n["hue"], "HueEnabled", Settings.hue.enabled),
						Row([
							{ RadioButton: {
								name: "FillMode",
								value: 0,
								label: i18n["colorFill"],
								selected: Settings.hue.mode == 0,
								height: 16,
								groupName: "HueGroup",
								toolTip: "use COLOR FILL filter to change color",
								style: {
									paddingLeft: 4,
									paddingTop: 3
								},
								events: {
									change: function (e) {
										UpdateSettings(e)
									}
								}
							} },
							{ RadioButton: {
								name: "HueMode",
								value: 1,
								label: i18n["hueShift"],
								selected: Settings.hue.mode == 1,
								height: 16,
								groupName: "HueGroup",
								toolTip: "use Hue filter to change color",
								style: {
									paddingLeft: 20,
									paddingTop: 3
								},
								events: {
									change: function (e) {
										UpdateSettings(e)
									}
								}
							} },
							{ RadioButton: {
								name: "ColorizeMode",
								value: 2,
								label: i18n["hlsColorize"],
								selected: Settings.hue.mode == 2,
								height: 16,
								groupName: "HueGroup",
								toolTip: "use HUE-COLORIZE to change color",
								style: {
									paddingLeft: 20,
									paddingTop: 3
								},
								events: {
									change: function (e) {
										UpdateSettings(e)
									}
								}
							} },
							{ RadioButton: {
								name: "LightnessMode",
								value: 3,
								label: i18n["lightness"],
								selected: Settings.hue.mode == 3,
								height: 16,
								groupName: "HueGroup",
								toolTip: "use HUE-LIGHTNESS to change color",
								style: {
									paddingLeft: 20,
									paddingTop: 3
								},
								events: {
									change: function (e) {
										UpdateSettings(e)
									}
								}
							} },
						]),
						RowSpace(),


						// footer
						Row([
							CreateCaption(i18n["clone"],  40),
							CreateCaption(i18n["random"], 60),
						]),
						{
							ControlBar: {
								percentWidth: 100,
								style: {
									horizontalAlign: "left",
									paddingLeft: 0
								},
								children: [
									Col([
										Row([
											{ Label: {
												text: i18n["num"] + ":",
												width: 56,
												toolTip: "Times for clone\n- will not clone when set to 0\n- auto group layer first when selected layer and clone times more than 0",
												style: {
													paddingLeft: 4,
													paddingTop: 2,
													fontWeight: "normal",
													color: 0x333333
												},
											} },
											{ NumericStepper: {
												name: "ClonesNumber",
												percentWidth: 100,
												height: 24,
												value: Settings.clones.num,
												stepSize: 1,
												maximum: 6000,
												minimum: 0,
												enabled: true,
												events: {
													keyDown: function (e) {
														CtrlKey = e.ctrlKey;
													},
													keyUp: function (e) {
														CtrlKey = null;
													},
													change: function (e) {
														var step = CtrlKey?10:1;
														e.result.push([e.targetName, "stepSize", step]);
														UpdateSettings(e)
													}
												}
											} },
										]),
										Row([
											{ CheckBox: {
												name: "ClonesExclude",
												label: i18n["autoExclude"],
												selected: Settings.clones.exclude,
												height: 24,
												toolTip: "Auto exclude selected layer/group.",
												style: {
													paddingLeft: 4,
													paddingTop: 2
												},
												events: {
													click: function (e) {
														UpdateSettings(e);
													}
												}
											} },
											{ Label: {
												name: "BtnClear",
												text: "[ " + i18n["clear"] + " ]",
												alpha: 1,
												percentWidth: 100,
												height: 24,
												toolTip: "Reset number of clones to 0",
												styleName: "btnClear",
												events: {
													click: function (e) {
														e.result.push(["ClonesNumber", "value", 0]);
													},
													rollOver: function (e) {
														e.result.push([e.targetName, "styleName", "btnClearHover"]);
													},
													rollOut: function (e) {
														e.result.push([e.targetName, "styleName", "btnClear"]);
													}
												}
											} }
										])
									], 40),

									Col([
										Row([
											{ Button: {
												name: "btnUndo",
												label: i18n["undo"],
												width: 60,
												height: 55,
												events: {
													click: function (e) {
														fw.getDocumentDOM().undo();
													}
												}
											} },
											{ Button: {
												name: "BtnRandomize",
												label: i18n["randomizeIt"],
												emphasized: true,
												percentWidth: 100,
												height: 55,
												events: {
													keyDown: function (e) {
														CtrlKey = e.ctrlKey;
													},
													keyUp: function (e) {
														CtrlKey = null;
													},
													click: function (e) {
														if (CtrlKey) {
															fw.getDocumentDOM().undo();
														}
														Randomize(e, "BtnRandomize")
													}
												}
											} }
										])
									], 60),
								]
							}
						}

					]
				}
			},
		]
	});

})();