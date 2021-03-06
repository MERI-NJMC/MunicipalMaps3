//==========================================
// Title:  Municipal Map ERIS V.3
// Author: Jose Baez
// Date:   11 Nov 2013
//=========================================
var ERIS_layers,
  DynamicLayerHost = "http://arcgis5.njmeadowlands.gov/webmaps";
function f_get_ERIS_Layers() {
	var xmlhttp = new XMLHttpRequest(),
		data,
		index,
		json = {};
	json.layers = [];
	json.tables = {};
	json.ident = "";
	xmlhttp.open("GET", DynamicLayerHost + "/rest/services/eris/eris/MapServer/?f=json&pretty=true", false);
	xmlhttp.send();
	if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
		data = JSON.parse(xmlhttp.responseText);
		for (index = 0; index < data.layers.length; index += 1) {
			json.layers.push({
				id: data.layers[index].id,
				name: data.layers[index].name,
				vis: data.layers[index].defaultVisibility
			});
			if (data.layers[index].name.toLowerCase() === "building rtk") {
				json.ident = data.layers[index].id;
			}
		}
		for (index = 0; index < data.tables.length; index += 1) {
			json.tables[data.tables[index].name.replace(/\./g, "_")] = data.tables[index].id;
		}
		return json;
	}
}
ERIS_layers = f_get_ERIS_Layers();
function f_load_ERIS_tools() {
	"use strict";
	require(["esri/toolbars/navigation", "dojo/domReady!"], function (Navigation) {
		document.getElementById("ERIS").addEventListener("click", function () {
			navToolbar.activate(Navigation.PAN);
			tool_selected = 'ERIS_Identify';
			f_button_clicked("ERIS");
		});
		document.getElementById("form_logoff").addEventListener("submit", function () {
				sessionStorage.clear();
				document.cookie = "NJMC_MERI_ERIS" + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.njmeadowlands.gov';
				document.cookie = "NJMC_MERI_ERIS" + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=localhost';
				document.location.reload(true);
		});
	});
}
function inArray(array, value) {
	"use strict";
	var index;
	for (index = 0; index < array.length; index += 1) {
		if (array[index] === value) {
			return true;
		}
	}
	return false;
}
function f_urlExists(url) {
	"use strict";
	var http = new XMLHttpRequest();
	http.open("POST", "php/functions.php", false);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.send("function=checkURL&url=" + url);
	if (http.readyState === 4 && http.status === 200) {
		if (parseInt(http.responseText, 10) === 1) {
			return true;
		}
		return false;
	}
}
function f_query_RTK_IDS_results(featureSets, bid, map_event) {
	"use strict";
		var	ONCE_FLDS_RTK = ["FACILITY_NAME", "PHYSICAL_ADDRESS", "PHYSICAL_CITY", "PHYSICAL_ZIP", "COMPANY_CONTACT", "CONTACT_PHONE", "OFFICIAL_CONTACT", "OFFICIAL_PHONE", "EMERGENCY_CONTACT", "EMERGENCY_PHONE"],
			MAIN_RTK = ["CAS_NUMBER", "LOCATION"],
			featureAttributes,
			ERIS_LINK = 'http://apps.njmeadowlands.gov/ERIS/?b=' + bid + '&a=planning',
			substance_no,
			substance_name,
			record_main,
			index = 0,
			index2,
			old_index = 0,
			length,
			exclude = [],
			att,
			featureSet,
			el_popup_content = document.createElement("div"),
			el_popup_view = document.createElement("div"),
			e_table = document.createElement("table"),
			e_tr = document.createElement("tr"),
			e_tbody = document.createElement("tbody"),
			e_td = document.createElement("td"),
			next_arrow = document.getElementsByClassName("titleButton arrow")[0],
			aliases = f_getAliases(),
			e_tr2,
			userName = getCookie('ERIS_NAME'),
			cookieVal = getCookie('NJMC_MERI_ERIS');
		el_popup_content.className = "esriViewPopup";
		el_popup_view.className = "mainSection";
		el_popup_content.appendChild(el_popup_view);
		e_table.className = "attrTable ident_table";
		e_table.cellSpacing = "0";
		e_table.cellPadding = "0";
		el_popup_view.appendChild(e_table);
		e_table.appendChild(e_tbody);
		e_tr.style.verticalAlign = "top";
		e_tbody.appendChild(e_tr);
		e_td.className = "attrValue";
		e_td.innerHTML = '<a href="' + ERIS_LINK + '" target="_blank">View Building Info</a>';
		//var ERIS_LINK = 'http://www.stevenbirkner.com:3000/login/auth/?b=' + bid;
		// e_td.innerHTML = '<form target="_target" action="http://apps.njmeadowlands.gov:3000/login/auth/" method="post">' +
		// 							'<input type="text" name="userName" value="'+userName+'" hidden>' +
		// 							'<input type="text" name="cookieVal" value="'+cookieVal+'" hidden>' +
		// 							'<input type="text" name="b" value="'+bid+'" hidden>' +
		// 							'<input type="submit" value="View Building Info">' +
		// 						'</form>';
		e_tr.appendChild(e_td);
		for (featureSet in featureSets) {
			if (featureSets.hasOwnProperty(featureSet)) {
				substance_no = [];
				substance_name = [];
				record_main = [];
				for (index = 0, length = featureSets[featureSet].features.length; index < length; index += 1) {
					featureAttributes = featureSets[featureSet].features[index].attributes;
					for (att in featureAttributes) {
						if (featureAttributes.hasOwnProperty(att)) {
							if (att === 'SUBSTANCE_NAME') {
								substance_name.push({"SUBSTANCE_NAME": featureAttributes[att]});
							}
							if (att === 'RTK_SUBSTANCE_NUMBER') {
								substance_no.push({"SUBSTANCE_NO": featureAttributes[att]});
							}
							if (inArray(ONCE_FLDS_RTK, att) && featureAttributes[att] !== null && !inArray(exclude, att)) {
								e_tr2 = document.createElement("tr");
								e_tr2.style.verticalAlign = "top";
								e_tbody.appendChild(e_tr2);
								exclude.push(att);

								e_tr2.innerHTML = '<td class="attrName">' + aliases.fieldNames[att] + ':</td>';
								e_tr2.innerHTML += '<td class="attrValue">' + featureAttributes[att] + '</td>';
							}
							if (!inArray(ONCE_FLDS_RTK, att)) {
								if (inArray(MAIN_RTK, att)) {
									record_main.push(featureAttributes[att]);
								}
							}
						}
					}
				}
				for (index = 0; index < substance_name.length; index += 1) {
					e_tr2.style.verticalAlign = "top";
					e_tbody.appendChild(e_tr2);
					console.log((substance_no[index].SUBSTANCE_NO !== null && f_urlExists('http://arcgis5.njmeadowlands.gov/municipal/ERIS/factsheets/' + substance_no[index].SUBSTANCE_NO + '.pdf')));

					if (substance_no[index].SUBSTANCE_NO !== null && f_urlExists('http://arcgis5.njmeadowlands.gov/municipal/ERIS/factsheets/' + substance_no[index].SUBSTANCE_NO + '.pdf')) {
						e_tr2.innerHTML = '<td class="attrName"><a href="http://arcgis5.njmeadowlands.gov/municipal/ERIS/factsheets/' + substance_no[index].SUBSTANCE_NO + '.pdf" target="_blank"><strong>' + substance_name[index].SUBSTANCE_NAME + '</strong></a>';
					} else {
						if(substance_no[index].SUBSTANCE_NO == null) {
							e_tr2.innerHTML = '<td class="attrName"><a href="http://arcgis5.njmeadowlands.gov/municipal/ERIS/factsheets/' + substance_no[index].SUBSTANCE_NO + '.pdf" onclick="return false;"><strong>No Information Available</strong></a>';
						} else {
							e_tr2.innerHTML = '<td class="attrName"><a href="http://arcgis5.njmeadowlands.gov/municipal/ERIS/factsheets/' + substance_no[index].SUBSTANCE_NO + '.pdf" onclick="return false;"><strong>' + substance_name[index].SUBSTANCE_NAME + '</strong></a>';
						}
					}
					for (index2 = old_index; index2 < old_index + 1; index2 += 2) {
						if(record_main[index2] === null) {
							record_main[index2] = "Not available";
						}
						if (record_main[index2] !== "" && record_main[index2] !== null) {
							e_tbody.innerHTML += '<tr style="vertical-align: top;"><td class="attrName">CAS Number:</td><td class="attrValue">' + record_main[index2] + '</td>';
						}
						if (record_main[index2 + 1] !== "" && record_main[index2 + 1] !== null ) {
							e_tbody.innerHTML += '<tr style="vertical-align: top;"><td class="attrName">Location:</td><td class="attrValue">' + record_main[index2 +1] + '</td>';
						}
					}
					old_index = index2;
				}
			}
		}
		M_meri.infoWindow.clearFeatures();
		M_meri.infoWindow.setTitle("ERIS Selection");
		M_meri.infoWindow.setContent(el_popup_content);
		M_meri.infoWindow.show(map_event.mapPoint);
		if (next_arrow !== undefined) {
			next_arrow.classList.toggle("hidden", false);
			document.getElementsByClassName("esriMobileNavigationItem right1")[0].style.display = "none";
			document.getElementsByClassName("esriMobileNavigationItem right2")[0].style.display = "none";
		}
}

function f_ERIS_selection_exec(map_event) {
	"use strict";
	document.getElementById("map_container").style.cursor = "progress";
	require(["esri/tasks/query", "esri/tasks/QueryTask", "esri/tasks/RelationshipQuery"], function (Query, QueryTask, RelationshipQuery) {
		var QT_ERIS_selection = new QueryTask(DynamicLayerHost + "/rest/services/eris/eris/MapServer/" + ERIS_layers.ident),
			QT_ERIS_BIDtoINTERMEDIATE = new QueryTask(DynamicLayerHost + "/rest/services/eris/eris/MapServer/" + ERIS_layers.tables.gis_SDE_TBL_CAD_BLD_INTERMEDIATE),
			QT_Q_RTK_IDS = new QueryTask(DynamicLayerHost + "/rest/services/eris/eris/MapServer/" + ERIS_layers.tables.gis_SDE_TBL_CAD_BLD_INTERMEDIATE),
			Q_ERIS_selection = new Query(),
			Q_ERIS_BIDtoINTERMEDIATE = new Query(),
			Q_RTK_IDS = new RelationshipQuery(),
			next_arrow = document.getElementsByClassName("titleButton arrow")[0],
			userName = getCookie('ERIS_NAME'),
			cookieVal = getCookie('NJMC_MERI_ERIS');
		Q_ERIS_selection.returnGeometry = true;
		Q_ERIS_selection.outFields = ["BID", "MUNICIPALITY"];
		Q_ERIS_selection.geometry = map_event.mapPoint;
		Q_ERIS_BIDtoINTERMEDIATE.returnGeometry = true;
		Q_ERIS_BIDtoINTERMEDIATE.outFields = ["*"];
		Q_RTK_IDS.returnGeometry = true;
		Q_RTK_IDS.relationshipId = 4;
		Q_RTK_IDS.outFields = ["*"];
		QT_ERIS_selection.execute(Q_ERIS_selection, function (results) {
			var bid = results.features[0].attributes.BID;
			console.log(bid);
			Q_ERIS_BIDtoINTERMEDIATE.text = bid;
			QT_ERIS_BIDtoINTERMEDIATE.executeForIds(Q_ERIS_BIDtoINTERMEDIATE, function (results) {
					var ERIS_LINK = 'http://apps.njmeadowlands.gov/ERIS/?b=' + bid + '&a=planning';
					//var ERIS_LINK = 'http://www.stevenbirkner.com:3000/login/auth/?b=' + bid + '&a=planning';
					ERIS_LINK = '<span class="ERIS_LINK"><a href="' + ERIS_LINK + '" target="_blank">View Building Info</a></span>';
					// ERIS_LINK = '<form target="_target" action="http://apps.njmeadowlands.gov:3000/login/auth/" method="post">' +
					// 				'<input type="text" name="userName" value="'+userName+'" hidden>' +
					// 				'<input type="text" name="cookieVal" value="'+cookieVal+'" hidden>' +
					// 				'<input type="text" name="b" value="'+bid+'" hidden>' +
					// 				'<input type="submit" value="View Building Info">' +
					// 			'</form>';
					console.log(results);
					if (results == null) {
						console.log("Its true");
						M_meri.infoWindow.clearFeatures();
						M_meri.infoWindow.setTitle("ERIS Selection");
						M_meri.infoWindow.setContent(ERIS_LINK);
						if (next_arrow !== undefined) {
							next_arrow.classList.toggle("hidden", false);
							document.getElementsByClassName("esriMobileNavigationItem right1")[0].style.display = "none";
							document.getElementsByClassName("esriMobileNavigationItem right2")[0].style.display = "none";
						}
						M_meri.infoWindow.show(map_event.mapPoint);
					} else {
						Q_RTK_IDS.objectIds = [results];
						Q_RTK_IDS.relationshipId = 3;
						QT_Q_RTK_IDS.executeRelationshipQuery(Q_RTK_IDS, function (results) {
							console.log(results);
							f_query_RTK_IDS_results(results, bid, map_event);
						}, function(error){console.log(error);});
					}
				
			});
		});
	});
	document.getElementById("map_container").style.cursor = "default";
}
function f_map_click_handler_ERIS(evt_click) {
	"use strict";
	switch (tool_selected) {
	case "parcel":
		f_parcel_selection_exec(evt_click);
		break;
	case "identify":
		f_map_identify_exec(evt_click);
		break;
	case "ERIS_Identify":
		f_ERIS_selection_exec(evt_click);
		break;
	case "pan":
		break;
	}
}
function f_ERIS_list_update(checkbox) {
	"use strict";
	var LD_visible = M_meri.getLayer("ERIS_base").visibleLayers;
	if (checkbox.checked) {
		checkbox.parentNode.parentNode.className = "toc_layer_li li_checked";
		LD_visible.push(parseInt(checkbox.value, 10));
	} else {
		checkbox.parentNode.parentNode.className = "toc_layer_li";
		LD_visible.splice(LD_visible.indexOf(parseInt(checkbox.value, 10)), 1);
	}
	if (LD_visible.length === 0) {
			LD_visible.push(-1);
	}
	M_meri.getLayer("ERIS_base").setVisibleLayers(LD_visible);
}
function f_add_ERIS_layer_update(e_chk) {
	e_chk.addEventListener("change", function(e) {
		f_ERIS_list_update(this);
		legendDigit.refresh();
		e.preventDefault();
	});
}
function f_ERIS_list_build() {
	"use strict";
	var li = document.createElement("li"),
		index,
		dropdown1 = document.getElementById("dropdown1"),
		layers_json = ERIS_layers.layers,
		e_li,
		e_chk,
		e_la;
	li.className = "layer_group_title";
	li.innerHTML = "ERIS Layers:";
	dropdown1.appendChild(li);
	for (index = 0; index <layers_json.length; index += 1) {
		e_li = document.createElement("li");
		e_chk = document.createElement("input");
		e_la = document.createElement("label");
		e_li.className = "toc_layer_li";
		e_chk.type = "checkbox";
		e_chk.className = "ERIS_layer_check ERIS_layer";
		e_chk.value = layers_json[index].id;
		f_add_ERIS_layer_update(e_chk);
		if (layers_json[index].vis) {
			e_chk.checked = true;
			e_li.className = "toc_layer_li li_checked";
		}
		e_la.className = "toc_layer_label";
		e_la.innerHTML = layers_json[index].name.toLowerCase();
		e_la.appendChild(e_chk);
		e_li.appendChild(e_la);
		dropdown1.appendChild(e_li);
	}
}
function f_startup_eris() { //////////////////////////////////////////
	"use strict";
	document.getElementById("useraccount").innerHTML = userName;
	require(["esri/layers/ArcGISDynamicMapServiceLayer", "dojo/domReady!"], function (ArcGISDynamicMapServiceLayer) {
		var ERIS_base = new ArcGISDynamicMapServiceLayer(DynamicLayerHost + "/rest/services/eris/eris/MapServer", {opacity: 1, id: "ERIS_base"});
		M_meri.addLayer(ERIS_base);
		f_ERIS_list_build();
		f_load_ERIS_tools();
		legendLayers.push({layer: ERIS_base, title: "ERIS Layers"});
	});
}
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}