//==========================================
// Title:  Municipal Map V.31
// Author: Jose Baez
// Date:   11 Nov 2013
//=========================================
/* Naming Conventions
 *
 * MAP STUFF
 *
 *	M     - Map
 *	IT    - Identify Task
 *	IP    - Identify Parameters
 *	TP    - Task Parameters
 *	BP    -	Buffer Parameters
 *	Q     -	Query
 *	QT    -	Query Task
 *	EVT   -	Event
 *  F     -	Feature
 *  IW    -	Info Window
 *  GS    -	GeoService
 *  GeomS -	Geometry Service
 *	S     -	Symbol
 *  G     -	Graphic
 *	LG    -	Layer Graphics
 *	LD    -	Layer Dynamic
 *	LT    -	Layer Tiled
 *  IL    - Image Layer
 *
 * OTHER STUFF
 *
 *	f_    -	javascript function
 *	e_    -	html element
 *	_lbl  -	label
 */


 //declaring variables
var DynamicLayerHost = "http://arcgis5.njmeadowlands.gov/webmaps",  //first half of url
	IP_Identify_Layers = [],
	measurementDijit,
	M_meri,
	navToolbar,
	tool_selected,
	locateButton,
	geocoder,
	search_results = [],
	search_acres = [],
	legendDigit,
	parcel_results = [],
	legendLayers = [],
	parcels_json,
	layers_json;


//gets layer info...duh
function f_getLayerInfo() {
	//declaring variables
	var json = {}, //creates empty json objects
		env = ["FEMA PANEL", "RIPARIAN CLAIM (NJDEP)", "FEMA (100-YR FLOOD)", "WETLANDS (DEP)", "SEISMIC SOIL CLASS"],
		hyd = ["TIDEGATES", "CREEK NAMES", "DRAINAGE", "HYDRO LINES/ WETLAND EDGE", "WATERWAYS"],
		inf = ["STORMWATER CATCHBASIN", "STORMWATER MANHOLE", "STORMWATER OUTFALL", "STORMWATER LINE", "SANITARY MANHOLE", "SANITARY LINES", "HYDRANTS"],
		pol = ["DISTRICT LINE", "MUNICIPAL BOUNDARY", "BLOCK LIMIT", "PARCEL LINES", "ENCUMBERANCE", "BUILDINGS", "CENSUS BLOCK 2010", "VOTING DISTRICTS 2010", "LAND USE", "ZONING"],
		topo = ["SPOT ELEVATIONS", "FENCE LINE", "CONTOUR LINES"],
		tra = ["DOT ROADS", "BRIDGES/ OVERPASS", "RAILS", "ROADS ROW"],
		xmlhttp = new XMLHttpRequest(), //retrieve data from a URL without page refresh
		data,
		index,
		identify,
		bool,
		index2;
	json.layers = []; //gives json an array named layers
	json.layers.push({ //pushes name value to the array layers with an associated array called layers
		name: "Environmental",
		layers: []
	});
	/*
	Example of format
	layers = [
	{
	'name': 'Environmental', 'layers': []
	}
			]
	*/

	json.layers.push({
		name: "Hydro",
		layers: []
	});
	json.layers.push({
		name: "Infrastructure/Utilities",
		layers: []
	});
	json.layers.push({
		name: "Political/Jurisdiction",
		layers: []
	});
	json.layers.push({
		name: "Topographic & Planimetrics",
		layers: []
	});
	json.layers.push({
		name: "Transportation",
		layers: []
	});



	xmlhttp.open("GET", DynamicLayerHost + "/rest/services/Municipal/MunicipalMap_live/MapServer?f=json&pretty=false", false); //initializes the request
	xmlhttp.send(); //sends the request
	if (xmlhttp.readyState === 4 && xmlhttp.status === 200) { //readyState 4 is ok and status 200 is ok  Details at http://www.w3schools.com/ajax/ajax_xmlhttprequest_onreadystatechange.asp
		data = JSON.parse(xmlhttp.responseText);
		//console.log(data); //uncomment to see data
		index = 0; 
		identify = ["DISTRICT LINE", "CREEK NAMES", "WATERWAYS", "MUNICIPAL BOUNDARY", "BRIDGES/ OVERPASS", "BLOCK LIMIT", "PARCEL LINES", "ENCUMBERANCE", "CENSUS BLOCK 2010", "BRIDGES/ OVERPASS"];

		for (index = 0; index < data.layers.length; index += 1) { 
			if (identify.indexOf(data.layers[index].name) > -1) { //if the name in the json.layers array doesnt exist in identify, bool = 1
			/*the above sees if the name of the data layer is in indentify. 
			data.layers[index].name gets the name of said layer
			indentify.indexOf() sees if the name is in the array identify
			a -1 is returned if nothing is found

			*/
				bool = 0;
			} else {
				bool = 1;
			}

			//same logic as above
			if (env.indexOf(data.layers[index].name) > -1) {
				index2 = 0;
			} else if (hyd.indexOf(data.layers[index].name) > -1) {
				index2 = 1;
			} else if (inf.indexOf(data.layers[index].name) > -1) {
				index2 = 2;
			} else if (pol.indexOf(data.layers[index].name) > -1) {
				index2 = 3;
			} else if (topo.indexOf(data.layers[index].name) > -1) {
				index2 = 4;
			} else if (tra.indexOf(data.layers[index].name) > -1) {
				index2 = 5;
			} else {
				index2 = 0;
			}

			//populating the layers array inside json.layers
			json.layers[index2].layers.push({
				id: data.layers[index].id, 
				name: data.layers[index].name,
				vis: data.layers[index].defaultVisibility,
				ident: bool
			});

			/*
			Ex: name: "Environmental",
				layers: [{
						 id:0,
						 name:"SPOT ELEVATIONS",
						 vis: false,
						 ident: 1
						}]

			*/

			//json.spot_elevations = {id: 0, vis: false, bool: 0}
			json[data.layers[index].name.toLowerCase().replace(/\ /g, "_")] = {
				id: data.layers[index].id,
				vis: data.layers[index].defaultVisibility,
				ident: bool
			};
			

			//if spot elevations, then set json.spot_elevations = 0
			if (data.layers[index].name === "SPOT ELEVATIONS") {
				json.spot_elevations = data.layers[index].id;
			}
		}
	}
	return json;
}
//gets parcel info??????????
function f_getParcelInfo() {
	var json = {}, 
		xmlhttp = new XMLHttpRequest(), 
		index,
		data,
		length;
	json.layers = []; 
	json.tables = [];
	xmlhttp.open("GET", DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/?f=json&pretty=false", false);
	xmlhttp.send();
	if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
		data = JSON.parse(xmlhttp.responseText);
		//console.log(data) //uncomment to see data
		length = data.layers.length;
		for(index = 0; index < length; index += 1) {
			json.layers[data.layers[index].name.replace(/\./g, "_").toLowerCase()] = data.layers[index].id;
		}
		length = data.tables.length;
		for(index = 0; index < length; index += 1) {
			json.tables[data.tables[index].name.replace(/\./g, "_").toLowerCase()] = data.tables[index].id;
		}
	}
	return json;
}
layers_json = f_getLayerInfo();
parcels_json = f_getParcelInfo();

//gets parcel info....
function f_getFloodInfo() {
	var index = 0,
		json = [],
		xmlhttp = new XMLHttpRequest(),
		data;
	xmlhttp.open("GET", DynamicLayerHost + "/rest/services/Flooding/20131023_FloodingBaseMap/MapServer?f=json&pretty=false", false);
	xmlhttp.send();
	if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
		data = JSON.parse(xmlhttp.responseText);
		//console.log(data); //uncomment to see
		for(index = 1; index < data.layers.length; index += 1)
		{
			json.push({ //push to json array
				name: data.layers[index].name.toLowerCase(), 
				id: data.layers[index].id
			});
		}
	}	
	return json;
}


function f_getAliases() {
	"use strict";
	var aliases = { //key/value pairs
		"munCodes": {
			"205": "Carlstadt",
			"212": "East Rutherford",
			"230": "Little Ferry",
			"232": "Lyndhurst",
			"237": "Moonachie",
			"239": "North Arlington",
			"249": "Ridgefield",
			"256": "Rutherford",
			"259": "South Hackensack",
			"262": "Teterboro",
			"906": "Jersey City",
			"907": "Kearny",
			"908": "North Bergen",
			"909": "Secaucus"
		},
		"landUseCodes" : {
			"000": "Unclassified",
			"AL": "Altered Lands",
			"CO": "Commercial Office",
			"CR": "Commercial Retail",
			"CU": "Communication Utility",
			"HM": "Hotels and Motels",
			"ICC": "Ind. Comm. Complex",
			"IND": "Industrial",
			"PQP": "Public Services",
			"RES": "Residential",
			"RL": "Recreational Land",
			"TRS": "Transportation",
			"VAC": "Open Land",
			"TL": "Transitional Lands",
			"WAT": "Water",
			"WET": "Wetlands"
		},
		"zoneCodes": {
			"AV": "Aviation facilities",
			"CP": "Commercial Park",
			"EC": "Environmental Conservation",
			"HI": "Heavy Industrial",
			"HC": "Highway Commercial",
			"IA": "Intermodal A",
			"IB": "Intermodal B",
			"LIA": "Light Industrial A",
			"LIB": "Light Industrial B",
			"LDR": "Low Density Residential",
			"NC": "Neighborhood Commercial",
			"PR": "Planned Residential",
			"PU" : "Public Utilities",
			"RC": "Regional Commercial",
			"TC": "Transportation Center",
			"WR" : "Waterfront Recreation",
			"RRR" : "Roads, Rails, ROWs",
			"000" : "Unclassified",
			"RA" : "Redevelopment Area",
			"MZ" : "Multiple Zones",
			"CZC-SECA" : "Commercial Zone C - Secaucus",
			"LI1-SECA" : "Light Industrial Zone 1 - Secaucus",
			"RZA-SECA" : "Residential Zone A - Secaucus",
			"WAT" : "Water",
			"LID-TET" : "Light Industrial & Distribution Zone - Teterboro",
			"RA1-TET" : "Redevelopment Area 1 Zone - Teterboro",
			"RA2-TET" : "Redevelopment Area 2 Zone - Teterboro",
			"PA" : "Parks and Recreation",
			"C-CARL" : "Commercial Zone - Carlstadt",
			"LI-CARL" : "Light Industrial - Carlstadt",
			"LDR-TET" : "Low Density Residential - Teterboro",
			"MCZ-CARL" : "Mixed Commercial Zone - Carlstadt",
			"RZ-CARL" : "Residential Zone - Carlstadt",
			"RZB-SECA" : "Residential Zone B - Secaucus",
			"MNF-MOON" : "Manufacturing Zone - Moonachie",
			"R1-MOON" : "1-Family Residential Zone - Moonachie",
			"R2-MOON" : "2-Family Residential Zone - Moonachie",
			"B1-MOON" : "General Business Zone - Moonachie",
			"B2-MOON" : "Limited Business Zone - Moonachie",
			"R1-ER" : "Low Density Residential - E Rutherford",
			"R2-ER" : "Medium Density Residential - E Rutherford",
			"R3-ER" : "Multi-Family Residential - E Rutherford",
			"NC-ER" : "Neighborhood Commercial - E Rutherford",
			"RC-ER" : "Regional Commercial - E Rutherford",
			"PCD-ER" : "Planned Commercial Development - E Rutherford",
			"RD1-ER" : "Redevelopment-1 - E Rutherford",
			"R1-NA" : "1-Family Residential - N Arlington",
			"R2-NA" : "1&2-Family Residential - N Arlington",
			"RRRA-NA" : "Ridge Road Redevelopment Area - N Arlington",
			"PARA-NA" : "Porete Avenue Redevelopment Area - N Arlington",
			"R3-NA" : "Multi-Family Residential - N Arlington",
			"I1-NA" : "Light Industrial - N Arlington",
			"C3-NA" : "Cemetery - N Arlington",
			"P/OS-NA" : "Parks & Open Space - N Arlington",
			"W/C-NA" : "Waterways & Creeks - N Arlington",
			"SEA" : "Sports and Expositions",
			"I-ER" : "Light Industrial -  E Rutherford",
			"C2-NA" : "Commercial 2 - N Arlington",
			"C1-NA" : "Commercial 1 - N Arlington",
			"R1-RU" : "Single Family Residential - Rutherford",
			"R1A-RU" : "Single Family Residential - Rutherford",
			"R1B-RU" : "Single Family Residential - Rutherford",
			"R2-RU" : "Two Family Residential - Rutherford",
			"R4-RU" : "Five Story Apartment - Rutherford",
			"B1-RU" : "Three Story Office - Rutherford",
			"B2-RU" : "Five Story Office - Rutherford",
			"B3-RU" : "Three Story Office-Retail - Rutherford",
			"B3/SH-RU" : "Business / Senior Housing - Rutherford",
			"B4-RU" : "Business / Light Industrial - Rutherford",
			"ORD-RU" : "Ten Story Office, Research & Distribution - Rutherford",
			"HC-RU" : "Highway Commercial Development - Rutherford",
			"PCD-RU" : "Planned Commercial Development - Rutherford",
			"R3-RU" : "Three Story Apartment - Rutherford",
			"UR1A-RU" : "University / Residential, Single Family - Rutherford",
			"C-RF" : "Commercial - Ridgefield",
			"C/HRH-RF" : "Commercial / High Rise Hotel - Ridgefield",
			"GA/TH C-RF" : "GA/TH Cluster - Ridgefield",
			"LM-RF" : "Light Manufacturing - Ridgefield",
			"NB-RF" : "Neighborhood Business - Ridgefield",
			"O/TH-RF" : "Office / T.H. - Ridgefield",
			"OC-RF" : "Office Commercial - Ridgefield",
			"OMR-RF" : "Office Mid Rise - Ridgefield",
			"OMRH-RF" : "Office Mid Rise Hotel - Ridgefield",
			"OFR-RF" : "One Family Residential - Ridgefield",
			"P/SP-RF" : "Public / Semi Public - Ridgefield",
			"TH/SRCH-RF" : "TH / SR Citizens Housing - Ridgefield",
			"T-RF" : "Townhomes - Ridgefield",
			"TFR-RF" : "Two Family Residential - Ridgefield",
			"RB-LF" : "One & Two Family Residential - Little Ferry",
			"RM-LF" : "Multifamily Residential - Little Ferry",
			"BH-LF" : "Highway & Regional Business - Little Ferry",
			"BN-LF" : "Neighborhood Business - Little Ferry",
			"IR-LF" : "Restricted Industrial - Little Ferry",
			"IG-LF" : "General Industrial - Little Ferry",
			"P-LF" : "Public Facilities - Little Ferry",
			"RA-LF" : "One Family Residential - Little Ferry",
			"P/SP-NA" : "Public/Semi-Public - N Arlington",
			"A-SH" : "Residential - South Hackensack",
			"B-SH" : "Commercial - South Hackensack",
			"C-SH" : "Industrial - South Hackensack",
			"M-SH" : "Mixed - South Hackensack",
			"SCR-SH" : "Senior Citizen Multifamily Res - South Hackensack",
			"RA-LYND" : "One Family Residence - Lyndhurst",
			"RB-LYND" : "One and Two Familly Residence - Lyndhurst",
			"RC-LYND" : "Medium Density Residential - Lyndhurst",
			"B-LYND" : "Business - Lyndhurst",
			"M1-LYND" : "Light Industrial - Lyndhurst",
			"M2-LYND" : "Heavy Industrial - Lyndhurst",
			"CGI-LYND" : "Commercial-General Industrial - Lyndhurst",
			"R-1-K" : "One Family Residential - Kearny",
			"OS-K" : "Open Space Parks and Recreation District - Kearny",
			"SU-1-K" : "Special Use 1 - Kearny",
			"SU-3_K" : "Special Use 3 - Kearny",
			"SOCD-K" : "Street Oriented Commercial District - Kearny",
			"SKI-N-K" : "South Kearny Industrial North - Kearny",
			"SKI-S-K" : "South Kearny Industrial South - Kearny",
			"RDP-K" : "Research Distribution Park - Kearny",
			"RD-K" : "Residential District - Kearny",
			"R-A-K" : "Redevelopment Area - Kearny",
			"R-3-K" : "Multi-Family Residential - Kearny",
			"R-2B-K" : "One_Two Family Residential/Hospital - Kearny",
			"R-2-K" : "One_Two Family Residential - Kearny",
			"PRD-K" : "Planned Residential Development - Kearny",
			"MXD-K" : "Mixed Use District - Kearny",
			"MP-K" : "Marshland Preservation - Kearny",
			"M-K" : "Manufacturing - Kearny",
			"LTI-K" : "Light Industrial - Kearny",
			"LID-B-K" : "Light Industrial Distribution B - Kearny",
			"LID-A-K" : "Light Industrial Distribution A - Kearny",
			"LCD-K" : "Large Scale Commercial District - Kearny",
			"H-I-K" : "Heavy Industrial - Kearny",
			"ESCD-K" : "Existing Shopping Center District - Kearny",
			"CEM-K" : "Cemetery - Kearny",
			"C-4-K" : "General Commercial - Kearny",
			"C-3-K" : "Community Business - Kearny",
			"C-2-K" : "Neighborhood Business - Kearny",
			"C-1-K" : "Office - Kearny",
			"ARLD-K" : "Adaptive Reuse Loft District - Kearny",
			"ACD-K" : "Automobile Oriented Commercial District - Kearny",
			"LI-K" : "Limited Industrial- Kearny",
			"R1-NB" : "Low Density Residential - N Bergen",
			"R2-NB" : "Intermediate Density Residential - N Bergen",
			"R3-NB" : "Moderate Density Residential - N Bergen",
			"C1-NB" : "General Business - N Bergen",
			"C1A-NB" : "General Business Limited Mixed Use - N Bergen",
			"C1B-NB" : "General Business Limited Mixed Use Bergenline - N Bergen",
			"C1C-NB" : "General Business Mixed Use - N Bergen",
			"C1R-NB" : "Commercial Residential District - N Bergen",
			"C2-NB" : "Highway Business - N Bergen",
			"I-NB" : "Industrial - N Bergen",
			"P1-NB" : "Riverside - N Bergen",
			"P2-NB" : "Edgecliff - N Bergen",
			"P3-NB" : "River Road West - N Bergen",
			"TRD-NB" : "Tonnelle Ave Redevelopment Area - N Bergen",
			"ET-NB" : "East Side Tonnelle Ave Zone - N Bergen",
			"GL-NB" : "Granton Ave-Liberty Ave-69th Street Zone - N Bergen",
			"KO-NB" : "Kennedy Overlay Zone - N Bergen",
			"TO-NB" : "Townhouse Overlay Zone - N Bergen"
		},
		"fieldNames": {
			"BLOCK": "Block",
			"LOT": "Lot",
			"PID" : "PID",
			"PAMS Pin" : "PAMS Pin",
			"PAMS_PIN" : "PAMS Pin",
			"OLD_BLOCK" : "Old Block",
			"OLD_LOT" : "Old Lot",
			"PROPERTY_ADDRESS" : "Address",
			"TAX_ACRES" : "Tax Acres",
			"CITY_STATE" : "City, State",
			"MAP_ACRES" : "GIS Acres",
			"MUN_CODE" : "Municipality",
			"LANDUSE_CODE" : "Landuse",
			"ZONE_CODE" : "Zone",
			'NAME' : 'Name', "ADDRESS" : 'Address', "FIRM_PAN" : "Firm Panel #",
			"TMAPNUM" : "Tidelands Map #",
			"FLD_ZONE" : "Flood Zone",
			"STATIC_BFE" : 'Static Base<br>Flood Elevation',
			"LABEL07" : "Wetland Label",
			"TYPE07" : "Wetland Type",
			"LU07" : "Anderson landuse class",
			"RECIEVINGWATER" : "Receiving Water",
			"NAME10" : "Voting District Label",
			"TRACTCE10" : "Census Tract #",
			"BLOCKCE10" : "Census Block #",
			"FACILITY_NAME" : "Facility Name",
			"BUILDING_LOCATION" : "Building Location",
			"TOTALBLDG_SF" : "Total Building Square Feet",
			"PHYSICAL_ADDRESS" : "Address",
			"PHYSICAL_CITY" : "City",
			"PHYSICAL_ZIP" : "Zip Code",
			"COMPANY_CONTACT" : "Company Contact",
			"CONTACT_PHONE" : "Phone",
			"OFFICIAL_CONTACT" : "Official Contact",
			"OFFICIAL_PHONE" : "Phone",
			"EMERGENCY_CONTACT" : "Emergency Contact",
			"EMERGENCY_PHONE" : "Phone",
			"CAS_NUMBER" : "CAS Number",
			"LandUse_Code" : "Landuse",
			"QUALIFIER": "Qualifier",
			"ENCUMBRANCEDESCRIPTION": "Encumbrance<br>Description",
			"ENCUMBRANCETYPE": "Encumbrance<br>Type",
			"ENCUMBRANCEOWNER": "Encumbrance<br>Owner",
			"POPULATION": "Population",
			"STATUS ": "Status",
			"FacilityID": "Facility ID",
			"UNIT": "Seismic Soil Class",
			"OWNID": "Owner ID",
			"ownerName": "Owner Name",
			"ownerAddress": "Owner Address",
			"ZIPCODE": "Zip Code",
			"ACCESS_": "Access",
			"LOCATION1": "Location 1",
			"LOCATION2": "Location 2",
			"STREET": "Street",
			"ELEVATION": "Elevation",
			"Zone_Code": "Zoning"
		}
	};
	return aliases;
}

//Example of how to access the info
/*var aliases = f_getAliases();
console.log(aliases.zoneCodes['AV']);
*/


function f_getoutFields() {
	"use strict";
	var outFields_json = {
		"parcel": ["PID", "PAMS_PIN", "BLOCK", "LOT", "OLD_BLOCK", "OLD_LOT", "FACILITY_NAME", "PROPERTY_ADDRESS", "MAP_ACRES", "TAX_ACRES", "MUN_CODE", "QUALIFIER"],
		"parcelB": ["PID"],
		"search": ["PROPERTY_ADDRESS", "BLOCK", "LOT"],
		"owner": ["OWNID", "NAME", "ADDRESS", "CITY_STATE", "ZIPCODE"],
		"building": ["PID", "BID", "MUNICIPALITY", "BUILDING_LOCATION", "FACILITY_NAME"],
		"ERIS": ["*"]
	};
	return outFields_json;
}


function f_printMap(pid) {
	"use strict";
	window.open("http://arcgis5.njmeadowlands.gov/municipal/print/parcel_info.php?PID=" + pid, "_blank"); 
}


function fieldAlias(fieldName, dataSource) {
	"use strict";
	var aliases = f_getAliases();
	dataSource = dataSource !== undefined ? dataSource : ''; 
	aliases.fieldNames.NAME = dataSource + 'Name';
	aliases.fieldNames.ADDRESS = dataSource + 'Address';
	if (aliases.fieldNames[fieldName] !== undefined) {
		return (aliases.fieldNames[fieldName]);
	}
	return fieldName;
}

//gets landUseCode from alias
function landuseAlias(a) {
	"use strict";
	var aliases = f_getAliases();
	if (aliases.landUseCodes[a] !== undefined) {
		return aliases.landUseCodes[a];
	}
	return a;
}
//gets zoneCode from alias
function zoningAlias(a) {
	"use strict";
	
	if (aliases.zoneCodes[a] !== undefined) {
		return aliases.zoneCodes[a];
	}
	return a;
}

//gets numCode from alias
function muncodeToName(c) {
	"use strict";
	var aliases = f_getAliases();
	if (c.length === 4) {
		c = c.substr(1, 3);
	}
	if (aliases.munCodes[c] !== undefined) {
		return aliases.munCodes[c];
	}
	return c;
}


function formatResult(fieldName, fieldValue, data) {
	"use strict";
	var dataSource = (data !== undefined) ? data : '',
		CSS = [],
		Result = [];
	CSS.field = CSS.value = '';
	if (dataSource !== '') {
		CSS.field = "field_" + dataSource;
		CSS.value = "value_" + dataSource;
	}
	Result.field = fieldAlias(fieldName);
	Result.value = fieldValue;
	if (fieldName === "MAP_ACRES" && !isNaN(fieldValue)) {
		Result.value = Math.round(fieldValue * 100) / 100;
	} else if (fieldName === "LANDUSE_CODE") {
		Result.value = landuseAlias(fieldValue);
	} else if (fieldName === "ZONE_CODE") {
		Result.value = zoningAlias(fieldValue);
	} else if (fieldName === "MUN_CODE") {
		Result.value = muncodeToName(fieldValue);
	} else if(fieldName === "QUALIFIER") {
		if(fieldValue === "MD") {
			Result.value = "In District";
		} else if (fieldValue === "OMD") {
			Result.value = "Out of District";
		} else if (fieldValue === "MD-OMD") {
			Result.value = "Borderline Parcels";
		}
	}
	return '<li class="field ' + CSS.field + '"><b>' + Result.field + ':</b> ' + Result.value + '</li>';
}
function f_getPopupTemplate(graphic) {
	"use strict";
	var popupTemplate,
		qualifiers = {"MD": "In District", "OMD": "Out of District", "MD-OMD": "Borderline Parcels"},
		attributes = graphic.attributes,
		xmlhttp = new XMLHttpRequest(),
		data,
		e_parent = document.createElement("div"),
		e_tbody = document.createElement("tbody"),
		e_table = document.createElement("table"),
		attr,
		e_tr,
		e_td,
		aliases = f_getAliases();
	e_table.className = "attrTable";
	e_table.cellSpacing = "0";
	e_table.cellPadding = "0";
	e_parent.appendChild(e_table);
	e_table.appendChild(e_tbody);
	for (attr in attributes) {
		if (attributes.hasOwnProperty(attr)) {
			if (attributes[attr] !== null) {
				e_tr = document.createElement("tr");
				e_tr.style.verticalAlign = "top";
				e_tbody.appendChild(e_tr);
				e_td = document.createElement("td");
				e_td.className = "attrName";
				e_td.innerHTML = aliases.fieldNames[attr] + ":";
				e_tr.appendChild(e_td);
				e_td = document.createElement("td");
				e_td.className = "attrValue";
				if (attr === "MUN_CODE") {
					e_td.innerHTML = aliases.munCodes[attributes[attr].substring(1, attributes[attr].length)];
				} else if (attr === "PID") {
					e_td.innerHTML = attributes[attr];
				} else if (attr === "QUALIFIER") {
					e_td.innerHTML = qualifiers[attributes[attr]];
				} else {
					e_td.innerHTML = attributes[attr];
				}
				e_tr.appendChild(e_td);
			}
		}
	}
	xmlhttp.open("POST",'./php/functions.php', false);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send("PID=" + graphic.attributes.PID + "&function=getPhoto");
	if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
		data = xmlhttp.responseText.trim();
		require(["esri/dijit/PopupTemplate"], function (PopupTemplate) {
			popupTemplate = new PopupTemplate({
				title: "{PROPERTY_ADDRESS}",
				description: e_parent.innerHTML,
				mediaInfos: [{
					"title": "",
					"caption": "",
					"type": "image",
					"value": {
						"sourceURL": data,
						"linkURL": data
					}
				}]
			});
		});
	}
	return popupTemplate;
}
function f_export_excel(event) {
	"use strict";
	var form = document.createElement("form"),
		hidden,
		target,
		index,
		array;
	if (event === "search") {
		target = search_results;
	} else {
		target = parcel_results;
	}
	form.action = "./php/export_parcel_owners.php";
	form.target = "_blank";
	form.method = "POST";
	form.style.display = "none";
	array = Object.keys(target);
	for(index = 0; index < array.length; index += 1) {
		hidden = document.createElement("input");
		hidden.type = "hidden";
		hidden.name = "PID[]";
		hidden.value = array[index];
		form.appendChild(hidden);
	}
	document.body.appendChild(form);
	form.submit();
	form.remove();
}
function f_update_export_parcel() {
	"use strict";
		var a_export = document.createElement("a"),
			search_export = document.getElementById("parcel_export"),
			acres = document.getElementById("parcel_acres"),
			total = 0,
			pid;
	if (Object.keys(parcel_results).length > 0) {
		for(pid in parcel_results) {
			if(parcel_results.hasOwnProperty(pid)) {
				total += parcel_results[pid];
			}
		}
		a_export.className = "selection_a";
		a_export.href = "#";
		a_export.style.color = "#09D";
		a_export.onclick = function () {
			f_export_excel("click");
			return false;
		};
		search_export.innerHTML = "";
		a_export.innerHTML = "Export to Excel: [" + Object.keys(parcel_results).length + " item(s)]";
		acres.innerHTML = "Total Acres: " + Math.round(total * 100) / 100;
		search_export.appendChild(a_export);
	} else {
		document.getElementById("parcel_export").innerHTML = "";
	}
}
function f_update_export_search() {
	"use strict";
	if (Object.keys(search_results).length > 0) {
		var a_export = document.createElement("a"),
			search_export = document.getElementById("search_export"),
			search_tally = document.getElementById("search_tally"),
			total_acres = 0,
			pid;
		a_export.className = "selection_a";
		a_export.href = "#";
		a_export.style.color = "#09D";
		a_export.onclick = function () {
			f_export_excel("search");
			return false;
		};
		search_export.innerHTML = "";
		a_export.innerHTML = "Export to Excel: [" + Object.keys(search_results).length + " item(s)]";
		search_export.appendChild(a_export);
		for (pid in search_acres) {
			if (search_acres.hasOwnProperty(pid)) {
				total_acres += search_acres[pid];
			}
		}
		search_tally.innerHTML = Object.keys(search_acres).length + " results found. Total Acres: " + Math.round(total_acres * 100) / 100;
	} else {
		document.getElementById("search_export").innerHTML = "";
		document.getElementById("search_tally").innerHTML = "";
	}
}
function f_removeSelection(pid) {
	"use strict";
	var graphics_layer = M_meri.getLayer("GL_parcel_selection"),
		x = 0,
		oid = pid;
	for (x = 0; x < graphics_layer.graphics.length; x += 1) {
		if (graphics_layer.graphics[x].attributes.PID === parseInt(oid, 10)) {
			graphics_layer.remove(graphics_layer.graphics[x]);
			if (document.getElementById("parcelinfo_" + oid) !== null) {
				document.getElementById("parcelinfo_" + oid).remove();
			}
			if (document.getElementById("parcel_ser_info_" + oid) !== null) {
				document.getElementById("parcel_ser_info_" + oid).remove();
			}
			break;
		}
	}
	M_meri.infoWindow.hide();
}
function f_result_detail(target_el, pid) {
	"use strict";
	require(["esri/tasks/QueryTask", "esri/tasks/query", "esri/tasks/RelationshipQuery"], function (QueryTask, Query, RelationshipQuery) {
		var QT_det_landuse = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_landuse),
			Q_det_landuse = new Query(),
			QT_det_zoning = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_zoning),
			Q_det_zoning = new Query(),
			QT_det_owners_int = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_intermediate),
			Q_det_owners_int = new Query(),
			QT_det_owners = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_intermediate),
			Q_det_owners = new RelationshipQuery();
		Q_det_landuse.returnGeometry = false;
		Q_det_landuse.outFields = ["LANDUSE_CODE", "MAP_ACRES"];
		Q_det_landuse.where = "PID = " + pid;
		Q_det_zoning.returnGeometry = false;
		Q_det_zoning.outFields = ["ZONE_CODE", "MAP_ACRES"];
		Q_det_zoning.where = "PID = " + pid;
		Q_det_owners_int.returnGeometry = false;
		Q_det_owners_int.where = "PID = " + pid;
		Q_det_owners.relationshipId = 6;
		Q_det_owners.returnGeometry = false;
		Q_det_owners.outFields = ["NAME", "ADDRESS", "CITY_STATE", "ZIPCODE"];
		document.getElementById("detail_view_a_" + pid).remove();
		QT_det_landuse.execute(Q_det_landuse, function (results) {
			var i,
				il,
				featureAttributes,
				output,
				attr;
			for (i = 0, il = results.features.length; i < il; i += 1) {
				featureAttributes = results.features[i].attributes;
				output = document.getElementById(target_el);
				for (attr in featureAttributes) {
					if (featureAttributes.hasOwnProperty(attr)) {
						output.innerHTML += formatResult(attr, results.features[i].attributes[attr], "selection selection_more");
					}
				}
			}
		});
		QT_det_zoning.execute(Q_det_zoning, function (results) {
			var i,
				il,
				featureAttributes,
				output,
				attr;
			for (i = 0, il = results.features.length; i < il; i += 1) {
				featureAttributes = results.features[i].attributes;
				output = document.getElementById("parcelinfo_ul_" + pid);
				for (attr in featureAttributes) {
					if (featureAttributes.hasOwnProperty(attr)) {
						output.innerHTML += formatResult(attr, results.features[i].attributes[attr], "selection selection_more");
					}
				}
			}
		});
		QT_det_owners_int.executeForIds(Q_det_owners_int, function (ids) {
			Q_det_owners.objectIds = [ids];
			QT_det_owners.executeRelationshipQuery(Q_det_owners, function (featureSets) {
				var featureSet,
					i,
					il,
					featureAttributes,
					output,
					attr;
				for (featureSet in featureSets) {
					if (featureSets.hasOwnProperty(featureSet)) {
						for (i = 0, il = featureSets[featureSet].features.length; i < il; i += 1) {
							featureAttributes = featureSets[featureSet].features[i].attributes;
							output = document.getElementById("parcelinfo_ul_" + pid);
							for (attr in featureAttributes) {
								if (featureAttributes.hasOwnProperty(attr)) {
									output.innerHTML += formatResult(attr, featureAttributes[attr], "selection selection_more");
								}
							}
						}
					}
				}
			}, function(err) {console.log(err);});
		});
	});
}
function f_search_add_selections(graphics) {
	"use strict";
	var feature_div = "qselParcel_",
		dropdown3 = document.getElementById("dropdown3"),
		index,
		index2,
		length = graphics.length,
		graphic,
		featureAttributes,
		el_featureAttribs,
		output,
		el_parcel,
		el_viewMoreToggle,
		attr,
		actions = ["Remove", "Zoom", "Pan", "Flash"];
	for(index = 0; index < length; index += 1) {
		graphic = graphics[index];
		if (document.getElementById("parcelinfo_" + graphic.attributes.PID) === null) {
			featureAttributes = graphic.attributes;
			el_featureAttribs = document.createElement("li");
			el_featureAttribs.className = "search_parcel_container";
			el_featureAttribs.id = "parcelinfo_" + featureAttributes.PID;
			output = document.createElement("ul");
			output.className = "SelectionResult";
			output.style.top = "2px";
			output.style.padding = "1.5%";
			output.style.position = "relative";
			output.id = "parcelinfo_ul_added_" + featureAttributes.PID;
			el_featureAttribs.appendChild(output);
			dropdown3.appendChild(el_featureAttribs);
			el_parcel = document.createElement("li");
			el_parcel.id = feature_div + featureAttributes.PID;
			el_parcel.className = "dParcelItem";
			output.appendChild(el_parcel);
			el_parcel.innerHTML += '<a href="' + DynamicLayerHost + '/municipal/print/parcel_info.php?PID=' + featureAttributes.PID + '" target="_blank" class="search_a feature_tool">Print</a>';
			for(index2 = 0; index2 < actions.length; index2 += 1) {
				el_parcel.innerHTML += '<a href="#" class="search_a feature_tool" onclick=\'f_feature_action("' + actions[index2] + '","' + output.id + '","' + featureAttributes.PID + '");return false;\'>' + actions[index2] + '</a>';
			}
			for (attr in featureAttributes) {
				if (featureAttributes.hasOwnProperty(attr)) {
					output.innerHTML += formatResult(attr, featureAttributes[attr], "selection");
				}
			}
			el_viewMoreToggle = document.createElement("li");
			el_viewMoreToggle.className = "lSummaryToggle";
			output.appendChild(el_viewMoreToggle);
			el_viewMoreToggle.innerHTML = '<a id="detail_view_a_' + featureAttributes.PID + '" class="selection_a" href="#" onclick=\'f_result_detail("' + output.id + '","' + featureAttributes.PID + '");return false;\'>-- View More --</a>';
		}
	}
}
function f_process_results_buffer(results) {
	"use strict";
	M_meri.getLayer("GL_buffer_selected_parcels").clear();
	require(["dojo/_base/Color", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol"], function (Color, SimpleFillSymbol, SimpleLineSymbol) {
		var featureAttributes,
			S_feature_buffer_selection = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
				new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
					new Color([255, 255, 0]), 3),
				new Color([0, 0, 255, 0.4])),
			GL_container = M_meri.getLayer("GL_buffer_selected_parcels"),
			G_symbol = S_feature_buffer_selection,
			graphic,
			index,
			length;
		for (index = 0, length = results.features.length; index < length; index += 1) {
			featureAttributes = results.features[index].attributes;
			parcel_results[featureAttributes.PID] = featureAttributes.TAX_ACRES;
			graphic = results.features[index];
			graphic.setSymbol(G_symbol);
			GL_container.add(graphic);
			M_meri.infoWindow.resize("300", "350");
			f_search_add_selections([graphic]);
		}
		f_update_export_parcel();
	});
}
function f_multi_parcel_buffer_exec(distance, PID) {
	"use strict";
	require(["esri/geometry/Polygon", "esri/SpatialReference", "esri/tasks/QueryTask", "esri/tasks/query", "esri/tasks/GeometryService",
             "esri/tasks/BufferParameters", "esri/graphic", "dojo/_base/Color", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol"], function (Polygon, SpatialReference, QueryTask, Query, GeometryService, BufferParameters, Graphic, Color, SimpleFillSymbol, SimpleLineSymbol) {
		M_meri.infoWindow.hide();
		var multiparcel_geometries = new Polygon(new SpatialReference({"wkid": 102100})),
			S_buffer_buffer = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
																new SimpleLineSymbol(SimpleFillSymbol.STYLE_SOLID,
																							new Color([100, 100, 100]), 3),
																new Color([255, 0, 0, 0.6])),
			m,
			bufferDistanceTxt = distance,
			bufferDistance,
			QT_parcel_selection_buffer,
			Q_parcel_selection_buffer,
			GeomS_parcel_buffer,
			BP_parcel_selection,
			GL_parcel_selection = M_meri.getLayer("GL_parcel_selection"),
			outFields_json = f_getoutFields();
		for (m = 0; m < GL_parcel_selection.graphics.length; m += 1) {
			if (PID !== null) {
				if (GL_parcel_selection.graphics[m].attributes.PID === PID) {
					multiparcel_geometries.addRing(GL_parcel_selection.graphics[m].geometry.rings[0]);
					break;
				}
			} else {
				multiparcel_geometries.addRing(GL_parcel_selection.graphics[m].geometry.rings[0]);
			}
		}
		if (!isNaN(bufferDistanceTxt) || (bufferDistanceTxt !== "")) {
			QT_parcel_selection_buffer = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_parcel);
			Q_parcel_selection_buffer = new Query();
			bufferDistance = bufferDistanceTxt * 1.35;
			Q_parcel_selection_buffer.returnGeometry = true;
			Q_parcel_selection_buffer.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
			Q_parcel_selection_buffer.outFields = outFields_json.parcel;
			GeomS_parcel_buffer = new GeometryService(DynamicLayerHost + "/rest/services/Utilities/Geometry/GeometryServer");
			BP_parcel_selection = new BufferParameters();
			BP_parcel_selection.geometries  = [multiparcel_geometries];
			BP_parcel_selection.distances = [bufferDistance];
			BP_parcel_selection.unit = GeometryService.UNIT_FOOT;
			GeomS_parcel_buffer.buffer(BP_parcel_selection, function (geometries) {
				var graphic = new Graphic(geometries[0], S_buffer_buffer);
				M_meri.getLayer("GL_buffer_buffer").clear();
				M_meri.getLayer("GL_buffer_buffer").add(graphic);
				Q_parcel_selection_buffer.geometry = graphic.geometry;
				Q_parcel_selection_buffer.outFields = outFields_json.parcel;
				QT_parcel_selection_buffer.execute(Q_parcel_selection_buffer, function (fset) {
					f_process_results_buffer(fset);
				});
			});
		}
	});
}
function f_feature_action(funct, target, oid) {
	"use strict";
	oid = parseInt(oid, 10);
	var graphics_layer = M_meri.getLayer("GL_parcel_selection"),
		graphics_layer2 = M_meri.getLayer("GL_buffer_selected_parcels"),
		buffer_li = document.getElementsByClassName("buffer"),
		i,
		j,
		i2,
		x,
		graphic,
		index;
	switch (funct) {
	case "Add to Selection":
		for (i = 0; i < graphics_layer.graphics.length; i += 1) {
			if (graphics_layer.graphics[i].attributes.PID === oid) {
				f_search_add_selections([graphics_layer.graphics[i]]);
			}
		}
		for (j = 0; j < buffer_li.length; j += 1) {
			buffer_li[j].style.display = "block";
		}
		break;
	case "Quick Buffer":
		for (i2 = 0; i2 < graphics_layer.graphics.length; i2 += 1) {
			if (graphics_layer.graphics[i2].attributes.PID === oid) {
				f_search_add_selections([graphics_layer.graphics[i2]]);
			}
		}
		f_multi_parcel_buffer_exec(200, oid);
		break;
	case "Zoom":
		for (x = 0; x < graphics_layer.graphics.length; x += 1) {
			
			graphic = graphics_layer.graphics[x];
			if (graphic.attributes.PID === oid) {
				M_meri.setExtent(graphic.geometry.getExtent().expand(1.3), true);
				break;
			}
		}
		break;
	case "Pan":
		for (x = 0; x < graphics_layer.graphics.length; x += 1) {
			graphic = graphics_layer.graphics[x];
			if (graphic.attributes.PID === oid) {
				M_meri.centerAt(graphic.geometry.getExtent().getCenter());
				break;
			}
		}
		break;
	case "Flash":
		require(["dojo/_base/Color", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol"], function (Color, SimpleFillSymbol, SimpleLineSymbol) {
			for (x = 0; x < graphics_layer.graphics.length; x += 1) {
				if (graphics_layer.graphics[x].attributes.PID === oid) {
					index = x;
					break;
				}
			}
			var divParcel = document.getElementById(target),
				divFlashColor = new Color([52, 83, 130, 0.95]),
				curSymbol = graphics_layer.graphics[index].symbol,
				flashSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, divFlashColor, 2), new Color([0, 255, 36, 0.5]));
			divParcel.scrollIntoView();
			graphics_layer.graphics[index].setSymbol(flashSymbol);
			divParcel.style.backgroundColor = new Color([0, 255, 36, 0.5]);
			setTimeout(function () {
				graphics_layer.graphics[index].setSymbol(curSymbol);
				divParcel.style.backgroundColor = "";
				setTimeout(function () {
					graphics_layer.graphics[index].setSymbol(flashSymbol);
					divParcel.style.backgroundColor = new Color([0, 255, 36, 0.5]);
					setTimeout(function () {
						graphics_layer.graphics[index].setSymbol(curSymbol);
						divParcel.style.backgroundColor = "";
					}, 750);
				}, 750);
			}, 750);
		});
		break;
	case "Remove":
		for (x = 0; x < graphics_layer.graphics.length; x += 1) {
			if (graphics_layer.graphics[x].attributes.PID === oid) {
				delete parcel_results[graphics_layer.graphics[x].attributes.PID];
				f_update_export_parcel();
				document.getElementById("parcelinfo_" + oid).remove();
				if (document.getElementById("parcelinfo_" + oid) === null && document.getElementById("parcel_ser_info_" + oid) === null) {
					graphics_layer.remove(graphics_layer.graphics[x]);
				}
			}
		}
		break;
	case "Remove Result":
		for (x = 0; x < graphics_layer.graphics.length; x += 1) {
			if (graphics_layer.graphics[x].attributes.PID === oid) {
				delete search_results[graphics_layer.graphics[x].attributes.PID];
				delete search_acres[graphics_layer.graphics[x].attributes.PID];
				f_update_export_search();
				document.getElementById("parcel_ser_info_" + oid).remove();
				if (document.getElementById("parcelinfo_" + oid) === null && document.getElementById("parcel_ser_info_" + oid) === null) {
					graphics_layer.remove(graphics_layer.graphics[x]);
				}
			}
		}
		break;
	case "Remove Buffered":
		for (x = 0; x < graphics_layer2.graphics.length; x += 1) {
			if (graphics_layer2.graphics[x].attributes.PID === oid) {
				graphics_layer2.remove(graphics_layer2.graphics[x]);
				document.getElementById("parcelinfo_" + oid).remove();
			}
		}
		break;
	}
	return false;
}
function f_add_listener(element, action, PID, id) {
	switch(action) {
		case "print":
			element.addEventListener("click", function (e) {
				f_printMap(PID);
				e.preventDefault();
			});
			break;
		case "view":
			element.addEventListener("click", function (e) {
				f_result_detail(id, PID);
				e.preventDefault();
			});
			break;
		case "remove":
			element.addEventListener("click", function (e) {
				f_feature_action("Remove", id, PID);
				e.preventDefault();
			});
			break;
		case "zoom":
			element.addEventListener("click", function (e) {
				f_feature_action("Zoom", id, PID);
				e.preventDefault();
			});
			break;
		case "pan":
			element.addEventListener("click", function (e) {
				f_feature_action("Pan", id, PID);
				e.preventDefault();
			});
			break;
		case "flash":
			element.addEventListener("click", function (e) {
				f_feature_action("Flash", id, PID);				
				e.preventDefault();
			});
			break;
		case "Remove Result":
			element.addEventListener("click", function (e) {
				f_feature_action("Remove Result", id, PID);
				e.preventDefault();				
			});
			break;
		case "Quick Buffer":
			element.addEventListener("click", function (e) {
				f_feature_action("Quick Buffer", id, PID);
				e.preventDefault();
			});
			break;
		case "Add to Selection":
			element.addEventListener("click", function (e) {
				f_feature_action("Add to Selection", id, PID);
				e.preventDefault();				
			});
			break;
	}
}
function f_process_results_parcel(results, event) {
	"use strict";
	require(["dojo/_base/Color", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol"], function (Color, SimpleFillSymbol, SimpleLineSymbol) {
		var S_feature_selection = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
			new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
				new Color([0, 255, 36]), 2),
			new Color([52, 83, 130, 0.95])),
			feature_div = "selParcel_",
			GL_container = M_meri.getLayer("GL_parcel_selection"),
			G_symbol = S_feature_selection,
			buffer_li,
			e_print_1,
			e_remove_1,
			i,
			total_acres = 0,
			index,
			el_featureAttribs,
			el_parcel,
			el_viewMoreToggle,
			output,
			attr,
			result,
			featureAttributes,
			graphic,
			popupTemplate,
			e_print_2,
			e_view,
			e_remove_2,
			e_zoom,
			e_pan,
			e_flash,
			e_buffer,
			actionList = document.getElementsByClassName("actionList")[0],
			e_add;
		if (actionList !== undefined) {
			if (document.getElementsByClassName("a_print action").length > 0) {
				document.getElementsByClassName("a_print action")[0].remove();
			}
			if (document.getElementsByClassName("a_remove action").length > 0) {
				document.getElementsByClassName("a_remove action")[0].remove();
			}
			e_print_1 = document.createElement("a");
			e_print_1.innerHTML = "Print";
			e_print_1.href = "#";
			e_print_1.className = "a_print action";
			document.getElementsByClassName("actionList")[0].appendChild(e_print_1);
			e_remove_1 = document.createElement("a");
			e_remove_1.href = "#";
			e_remove_1.innerHTML = "Remove";
			e_remove_1.className = "a_remove action";
			document.getElementsByClassName("actionList")[0].appendChild(e_remove_1);
			f_add_listener(e_print_1, "print", results.features[0].attributes.PID, null);
			e_remove_1.addEventListener("click", function (e) {
				f_removeSelection(results.features[0].attributes.PID);
				e.preventDefault();	
			});
		}
		for (index = 0; index < results.features.length; index += 1) {
			result = results.features[index];
			featureAttributes = result.attributes;
			graphic = result;
			graphic.setSymbol(G_symbol);
			if (event === "search") {
				total_acres += graphic.attributes.MAP_ACRES;
				search_results[graphic.attributes.PID] = graphic.attributes.PID;
				search_acres[graphic.attributes.PID] = graphic.attributes.MAP_ACRES;
			} else {
				parcel_results[graphic.attributes.PID] = graphic.attributes.MAP_ACRES;
			}
			popupTemplate = f_getPopupTemplate(graphic);
			graphic.infoTemplate = popupTemplate;
			el_featureAttribs = document.createElement("li");
			el_featureAttribs.className = "search_parcel_container";
			GL_container.add(graphic);
			if (event === "click") {
				if (document.getElementById("parcelinfo_" + featureAttributes.PID) !== null) {
					document.getElementById("parcelinfo_" + featureAttributes.PID).remove();
				}
				el_featureAttribs.id = "parcelinfo_" + featureAttributes.PID;
				document.getElementById("dropdown3").appendChild(el_featureAttribs);
			} else if (event === "search") {
				if (document.getElementById("parcel_ser_info_" + featureAttributes.PID)) {
					document.getElementById("parcel_ser_info_" + featureAttributes.PID).remove();
				}
				el_featureAttribs.id = "parcel_ser_info_" + featureAttributes.PID;
				document.getElementById("dropdown2").appendChild(el_featureAttribs);
			} else {
				el_featureAttribs.className += " owner_parcels_" + event.split("_")[1];
				el_featureAttribs.id = "parcel_ser_info_" + featureAttributes.PID;
				document.getElementById("findownerparcel_" + event.split("_")[1]).appendChild(el_featureAttribs);
			}
			output = document.createElement("ul");
			output.className = "SelectionResult";
			output.style.top = "2px";
			output.style.padding = "1.5%";
			output.style.position = "relative";
			output.id = "parcelinfo_ul_" + featureAttributes.PID;
			el_featureAttribs.appendChild(output);
			el_parcel = document.createElement("li");
			el_parcel.className = "dParcelItem";
			el_parcel.id = feature_div + featureAttributes.PID;
			if (event === "click") {
				for (attr in featureAttributes) {
					if (featureAttributes.hasOwnProperty(attr)) {
						output.innerHTML += formatResult(attr, featureAttributes[attr], "selection");
					}
				}
			} else {
				for (attr in featureAttributes) {
					if (featureAttributes.hasOwnProperty(attr) && ["PROPERTY_ADDRESS", "BLOCK", "LOT"].indexOf(attr) !== -1) {
						output.innerHTML += formatResult(attr, featureAttributes[attr], "selection");
					}
				}
			}
			e_print_2 = document.createElement("a");
			e_print_2.href = "#";
			e_print_2.innerHTML = "Print";
			e_print_2.className = "selection_a feature_tool print_a";
			f_add_listener(e_print_2, "print", featureAttributes.PID, null);
			el_parcel.appendChild(e_print_2);
			el_viewMoreToggle = document.createElement("li");
			el_viewMoreToggle.className = "lSummaryToggle";
			output.appendChild(el_viewMoreToggle);
			if (event === "click") {
				e_view = document.createElement("a");
				e_view.id = "detail_view_a_" + featureAttributes.PID;
				e_view.className = "selection_a";
				e_view.href = "#";
				e_view.innerHTML = "-- View More --";
				f_add_listener(e_view, "view", featureAttributes.PID, output.id);
				el_viewMoreToggle.appendChild(e_view);
				e_remove_2 = document.createElement("a");
				e_remove_2.href = "#";
				e_remove_2.className = "selection_a feature_tool";
				e_remove_2.innerHTML = "Remove";
				f_add_listener(e_remove_2, "remove", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_remove_2);
				e_zoom = document.createElement("a");
				e_zoom.href = "#";
				e_zoom.innerHTML = "Zoom";
				e_zoom.className = "selection_a feature_tool";
				f_add_listener(e_zoom, "zoom", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_zoom);
				e_pan = document.createElement("a");
				e_pan.href = "#";
				e_pan.className = "selection_a feature_tool";
				e_pan.innerHTML = "Pan";
				f_add_listener(e_pan, "pan", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_pan);
				e_flash = document.createElement("a");
				e_flash.href = "#";
				e_flash.className = "selection_a feature_tool";
				e_flash.innerHTML = "Flash";
				f_add_listener(e_flash, "flash", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_flash);
			} else {
				e_remove_2 = document.createElement("a");
				e_remove_2.className = "selection_a feature_tool";
				e_remove_2.href = "#";
				e_remove_2.innerHTML = "Remove Result";
				f_add_listener(e_remove_2, "Remove Result", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_remove_2);
				e_zoom = document.createElement("a");
				e_zoom.href = "#";
				e_zoom.className = "selection_a feature_tool";
				e_zoom.innerHTML = "Zoom";
				f_add_listener(e_zoom, "zoom", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_zoom);
				e_pan = document.createElement("a");
				e_pan.className = "selection_a feature_tool";
				e_pan.href = "#";
				e_pan.innerHTML = "Pan";
				f_add_listener(e_pan, "pan", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_pan);
				e_flash = document.createElement("a");
				e_flash.className = "selection_a feature_tool";
				e_flash.href = "#";
				e_flash.innerHTML = "Flash";
				f_add_listener(e_flash, "flash", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_flash);
				e_buffer = document.createElement("a");
				e_buffer.className = "selection_a feature_tool";
				e_buffer.href = "#";
				e_buffer.innerHTML = "Quick Buffer";
				f_add_listener(e_buffer, "Quick Buffer", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_buffer);
				e_add = document.createElement("a");
				e_add.className = "selection_a feature_tool";
				e_add.href = "#";
				e_add.innerHTML = "Add to Selection";
				f_add_listener(e_add, "Add to Selection", featureAttributes.PID, output.id);
				el_parcel.appendChild(e_add);
			}
			output.insertBefore(el_parcel, output.getElementsByClassName("field field_selection")[0]);
		}
		buffer_li = document.getElementsByClassName("buffer");
		for (i = 0; i < buffer_li.length; i += 1) {
			buffer_li[i].style.display = "block";
		}
		if (event === "search") {
			f_update_export_search();
			document.getElementById("search_tally").innerHTML = results.features.length + " results found. Total Acres: " + Math.round(total_acres * 100) / 100;
		} else {
			f_update_export_parcel();
		}
	});
}
function f_parcel_selection_exec(map_event) {
	"use strict";
	require(["esri/tasks/query", "esri/tasks/QueryTask"], function (Query, QueryTask) {
		var Q_parcel_selection = new Query(),
			QT_parcel_selection = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_parcel),
			outFields_json = f_getoutFields();
		Q_parcel_selection.outSpatialReference = {wkid: 3857};
		Q_parcel_selection.returnGeometry = true;
		Q_parcel_selection.outFields = outFields_json.parcel;
		Q_parcel_selection.geometry = map_event.mapPoint;
		QT_parcel_selection.execute(Q_parcel_selection, function (results) {
			if(results.features.length > 0)
			{
				f_process_results_parcel(results, "click");
			}
		});
	});
}
function f_map_identify_exec(click_evt) {
	"use strict";
	require(["esri/tasks/IdentifyParameters", "esri/tasks/IdentifyTask"], function (IdentifyParameters, IdentifyTask) {
		document.getElementById("map_container").style.cursor = "progress";
		var IP_Map_All = new IdentifyParameters(),
			el_popup_content = document.createElement("div"),
			el_popup_view = document.createElement("div"),
			IT_Map_All = new IdentifyTask(DynamicLayerHost + "/rest/services/Municipal/MunicipalMap_live/MapServer"),
			index1,
			index2,
			next_arrow = document.getElementsByClassName("titleButton arrow")[0],
			identify_fields_json = {};
		for (index1 = 0; index1 < layers_json.layers.length; index1 +=1) {
			for	(index2 = 0; index2 < layers_json.layers[index1].layers.length; index2 +=1) {
				if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "fema panel") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["FIRM_PAN"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "riparian claim (njdep)") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["TMAPNUM", "STATUS "];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "fema (100-yr flood)") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["FLD_ZONE", "FLOODWAY", "STATIC_BFE", "SFHA_TF"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "wetlands (dep)") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["LABEL07", "TYPE07", "ACRES", "LU07"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "seismic soil class") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["UNIT"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "tidegates") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["MUNICIPALITY", "TIDEGATE_NAME", "GPSPOINT_TYPE", "ELEVATION", "DATE_OBS", "TYPE_OF_TIDE_GATE", "TYPE_OF_GATE", "FUNCTIONALITY", "MAINTENANCEREQUIRED"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "drainage") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["TYPE"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "hydro lines/ wetland edge") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["TYPE"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "stormwater catchbasin") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["FacilityID", "Municipality", "MaintainedBy", "CBType", "ReceivingWater"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "stormwater manhole") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["FacilityID", "Municipality", "MaintainedBy", "RimElevation"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "stormwater outfall") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["FacilityID", "Municipality", "MaintainedBy", "Diameter", "ReceivingWater"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "stormwater line") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["FacilityID", "Municipality", "MaintainedBy", "Material", "Diameter", "UpstreamInvert", "DownstreamInvert"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "sanitary manhole") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["FacilityID", "Municipality", "MaintainedBy", "RimElevation"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "sanitary lines") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["FacilityID", "Municipality", "MaintainedBy", "Material", "Diameter", "UpstreamInvert", "DownstreamInvert"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "hydrants") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["ID", "STREET", "LOCATION1", "LOCATION2", "ACCESS_", "PIPE_DIAMETER", "PIPEDIAMETER_VALUE"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "encumberance") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["ENCUMBRANCETYPE", "ENCUMBRANCEOWNER", "ENCUMBRANCEDESCRIPTION"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "buildings") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["BID", "FACILITY_NAME", "BUILDING_LOCATION", "TOTALBLDG_SF"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "voting districts 2010") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["NAME10"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "census block 2010") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["TRACTCE10", "BLOCKCE10", "POPULATION"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "land use") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["LandUse_Code"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "zoning") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["Zone_Code"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "spot elevations") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["ELEVATION"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "fence line") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["Elevation", "Type"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "contour lines") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["ELEVATION"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "dot roads") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["SLD_NAME"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "rails") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["Elevation", "Type"];
				} else if (layers_json.layers[index1].layers[index2].name.toLowerCase() === "roads row") {
					identify_fields_json[layers_json.layers[index1].layers[index2].id] = ["Elevation", "Type"];
				}
			}	
		}
		el_popup_content.className = "esriViewPopup";
		el_popup_view.className = "mainSection";
		el_popup_content.appendChild(el_popup_view);
		IP_Map_All.tolerance = 6;
		IP_Map_All.returnGeometry = false;
		IP_Map_All.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
		IP_Map_All.width  = M_meri.width;
		IP_Map_All.height = M_meri.height;
		IP_Map_All.geometry = click_evt.mapPoint;
		IP_Map_All.mapExtent = M_meri.extent;
		IP_Map_All.layerIds = IP_Identify_Layers;
		tool_selected = "pan";
		IT_Map_All.execute(IP_Map_All, function (identifyResults) {
			var	e_div = document.createElement("div"),
				identifyResult,
				attr,
				string_array,
				lstring,
				rstring;
			el_popup_view.appendChild(e_div);
			for (index1 = 0; index1 < identifyResults.length; index1 += 1) {
				identifyResult = identifyResults[index1];
				string_array = identifyResult.layerName.toLowerCase();
				if (string_array != "land use" && string_array != "zoning") {
					e_div.innerHTML += '<p class="attrName" style="text-transform:capitalize;"><b>' + string_array + '</b></p>';
					for (index2 = 0; index2 < identify_fields_json[identifyResult.layerId].length; index2 += 1) {
						attr = identify_fields_json[identifyResult.layerId][index2];
						if (identifyResult.feature.attributes[attr] !== "Null" && identifyResult.feature.attributes[attr] !== null && identifyResult.feature.attributes[attr] !== "" && identifyResult.feature.attributes[attr] !== undefined && fieldAlias(attr) !== "SFHA_TF") {
							e_div.innerHTML += '<p>' + fieldAlias(attr) + ': ' + identifyResult.feature.attributes[attr] + '</p>';
						}
					}
				}
				
			}
			M_meri.infoWindow.clearFeatures();
			M_meri.infoWindow.setTitle("Selected Property");
			M_meri.infoWindow.setContent(el_popup_content);
			M_meri.infoWindow.show(click_evt.mapPoint);
			if (next_arrow !== undefined) {
				next_arrow.classList.toggle('hidden', false);
				document.getElementsByClassName("esriMobileNavigationItem right1")[0].style.display = "none";
				document.getElementsByClassName("esriMobileNavigationItem right2")[0].style.display = "none";
			}
			document.getElementById("map_container").style.cursor = "default";
			tool_selected = "identify";
		});
	});
}
function f_map_measure() {
	"use strict";
	document.getElementById("dMeasureTool").style.display = "block";
}
function f_map_util_exec(map, evt) {

	 var xhr = new XMLHttpRequest(),
                json;
            xhr.open('POST', 'php/identifylayers.php', false);
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");		
            xhr.send("json=" + JSON.stringify(evt.mapPoint) + "&extent=" + JSON.stringify(map.extent));
            if(xhr.readyState === 4 && xhr.status === 200)
            {
                if(xhr.responseText !== "")
                {
                    json = JSON.parse(xhr.responseText);
                    console.log(json);
                    if (json['layer'] == "Catchbasin") {
                    	basinPopInfo(map,evt,json);
                    } else if (json['layer'] == "Storm Water Manhole") {
                    	swManholeInfo(map,evt,json);
                    } else if (json['layer'] == "Outfall") {
                    	outfallInfo(map,evt,json);
                    } else if(json['layer'] == "Storm Water Gravity Main") {
                    	slineInfo(map,evt,json);
                    } else if (json['layer'] == "Fire Hydrant") {
                    	hydrantInfo(map,evt,json);
                    } else if (json['layer'] == "Sanitary Manhole") {
                    	smInfo(map,evt,json);
                    } else if (json['layer'] == "Sanitary Gravity Main") {
                    	sgmInfo(map,evt,json);
                    }
                    
                   	                 
                }
            }
}
function sgmInfo(map,evt,json) {
	var popup = map.infoWindow,
		sgmid = (json['smid'] != "Null") ? json['sgmid'] : "",
		ownedBy = (json['ownedBy'] != "Null") ? json['ownedBy'] : "",
		mainBy = (json['mainBy'] != "Null") ? json['mainBy'] : "",
		muni = (json['muni'] != "Null") ? json['muni'] : "",
		waterType = (json['waterType'] != "Null") ? json['waterType'] : "",
		mat = (json['mat'] != "Null") ? json['mat'] : "",
		pipeClass = (json['pipeClass'] != "Null") ? json['pipeClass'] : "",
		dia = (json['dia'] != "Null") ? json['dia'] : "",
		height = (json['height'] != "Null") ? json['height'] : "",
		width = (json['width'] != "Null") ? json['width'] : "",
		usi = (json['usi'] != "Null") ? json['usi'] : "",
		dsi = (json['dsi'] != "Null") ? json['dsi'] : "",
		comments = (json['comments'] != "Null") ? json['comments'] : "",
		next_arrow = document.getElementsByClassName("titleButton arrow")[0],
	
	cont = '<div>' + 
				'<p><b>Manhole ID#: </b>'+sgmid+'</p>' +
				'<p><b>Owned By: </b>'+ownedBy+'</p>' +
				'<p><b>Maintained By: </b>'+mainBy+'</p>' +
				'<p><b>Municipality: </b>'+muni+'</p>' +
				'<p><b>Water Type: </b>'+waterType+'</p>' +
				'<p><b>Material: </b>'+mat+'</p>' +
				'<p><b>Pipe Class: </b>'+pipeClass+'</p>' +
				'<p><b>Diameter: </b>'+dia+' (in)</p>' +
				'<p><b>Height: </b>'+height+' (in)</p>' +
				'<p><b>Width: </b>'+width+' (in)</p>' +
				'<p><b>Upstream Invert: </b>'+usi+' (ft)</p>' +
				'<p><b>Downstream Invert: </b>'+dsi+' (ft)</p>' +
				'<p><b>Comments: </b>'+comments+'</p>' +
		   '</div>';

	if(!ismobile) {
		popup.setTitle("Selected Sanitary Line");
	 	popup.setContent(cont);
	    popup.resize(300,500);
	    popup.show(evt.mapPoint);
	} else {
		console.log("mobile");
		$("#popcon").html(cont);
		$("#selTitle").html("Selected Sanitary Line");
		var pop = document.getElementById("pop");
		pop.style.visibility='visible';

	}


}
function smInfo(map,evt,json) {
	var popup = map.infoWindow,
		smid = (json['smid'] != "Null") ? json['smid'] : "",
		ownedBy = (json['ownedBy'] != "Null") ? json['ownedBy'] : "",
		mainBy = (json['mainBy'] != "Null") ? json['mainBy'] : "",
		muni = (json['muni'] != "Null") ? json['muni'] : "",
		waterType = (json['waterType'] != "Null") ? json['waterType'] : "",
		locDesc = (json['locDesc'] != "Null") ? json['locDesc'] : "",
		accDia = (json['accDia'] != "Null") ? json['accDia'] : "",
		hpe = (json['hpe'] != "Null") ? json['hpe'] : "",
		rimEl = (json['rimEl'] != "Null") ? json['rimEl'] : "",
		manholeDrop = (json['manholeDrop'] != "Null") ? json['manholeDrop'] : "",
		interDrop = (json['interDrop'] != "Null") ? json['interDrop'] : "",
		wallMat = (json['wallMat'] != "Null") ? json['wallMat'] : "",
		manholeType = (json['manholeType'] != "Null") ? json['manholeType'] : "",
		inverEl = (json['inverEl'] != "Null") ? json['inverEl'] : "",
		comments = (json['comments'] != "Null") ? json['comments'] : "",

	cont = '<div>' + 
				'<p><b>Manhole ID#: </b>'+smid+'</p>' +
				'<p><b>Owned By: </b>'+ownedBy+'</p>' +
				'<p><b>Maintained By: </b>'+mainBy+'</p>' +
				'<p><b>Municipality: </b>'+muni+'</p>' +
				'<p><b>Water Type: </b>'+waterType+'</p>' +
				'<p><b>Location Description: </b>'+locDesc+'</p>' +
				'<p><b>Access Diameter: </b>'+accDia+' (in)</p>' +
				'<p><b>High Pipe Elevation: </b>'+hpe+' (ft)</p>' +
				'<p><b>Rim Elevation: </b>'+rimEl+' (ft)</p>' +
				'<p><b>Manhole Drop: </b>'+manholeDrop+' </p>' +
				'<p><b>Interior Drop: </b>'+interDrop+' (in)</p>' +
				'<p><b>Wall Material: </b>'+wallMat+'</p>' +
				'<p><b>Manhole Type: </b>'+manholeType+'</p>' +
				'<p><b>Invert Elevation: </b>'+inverEl+' (ft)</p>' +
				'<p><b>Comments: </b><p>'+comments+'</p></p>' +

		   '</div>';

	if(!ismobile) {
		popup.setTitle("Selected Sanitary Manhole");
	 	popup.setContent(cont);
	    popup.resize(300,500);
	    popup.show(evt.mapPoint);
	} else {
		console.log("mobile");
		$("#popcon").html(cont);
		$("#selTitle").html("Selected Sanitary Manhole");
		var pop = document.getElementById("pop");
		pop.style.visibility='visible';

	}
}
function hydrantInfo(map,evt,json) {
	var popup = map.infoWindow,
		hid = (json['hid'] != "Null") ? json['hid'] : "",
		ownedBy = (json['ownedBy'] != "Null") ? json['ownedBy'] : "",
		muni = (json['muni'] != "Null") ? json['muni'] : "",
		loc = (json['loc'] != "Null") ? json['loc'] : "",
		pipeDia = (json['pipeDia'] != "Null") ? json['pipeDia'] : "",
		cs = (json['cs'] != "Null") ? json['cs'] : "",

	cont = '<div>' + 
				'<p><b>Hydrant ID#: </b>'+hid+'</p>' + 
				'<p><b>Owned By: </b>' +ownedBy+'</p>' +
				'<p><b>Municipality: </b>' +muni+'</p>' +
				'<p><b>Location: </b>' +loc+'</p>' +
				'<p><b>Pipe Diameter: </b>' +pipeDia+' (in)</p>' +
				'<p><b>Cross Street: </b>' +cs+ ' </p>' +
		   '</div>';

	if(!ismobile) {
		popup.setTitle("Selected Fire Hydrant");
	 	popup.setContent(cont);
	    popup.resize(300,500);
	    popup.show(evt.mapPoint);
	} else {
		console.log("mobile");
		$("#popcon").html(cont);
		$("#selTitle").html("Selected Fire Hydrant");
		var pop = document.getElementById("pop");
		pop.style.visibility='visible';

	}
}
function slineInfo(map,evt,json) {
	var popup = map.infoWindow,
		ownedBy = (json['ownedBy'] != "") ? json['ownedBy'] : "",
		muni = (json['muni'] != "Null") ? json['muni'] : "",
		material = (json['material'] != "") ? json['material'] : "",
		css = (json['css'] != "") ? json['css'] : "",
		dia = (json['dia'] != "") ? json['dia'] : "",
		height = (json['height'] != "") ? json['height'] : "",
		width = (json['width'] != "") ? json['width'] : "",
		usi = (json['usi'] != "") ? json['usi'] : "",
		dsi = (json['dsi'] != "") ? json['dsi'] : "",

		cont = '<div>' +
					'<p><b>Stormline ID#: </b>'+json['slid']+'</p>' +
					'<p><b>Owned By: </b>'+ownedBy+'</p>' +
					'<p><b>Municipality: </b>'+muni+'</p>' +
					'<p><b>Material: </b>'+material+'</p>' +
					'<p><b>Cross Section Shape: </b>'+css+'</p>' +
					'<p><b>Diameter: </b>'+dia+' (in)</p>'+
					'<p><b>Height: </b>'+height+' (in)</p>' +
					'<p><b>Width: </b>'+width+' (in)</p>' +
					'<p><b>Upstream Invert: </b>'+usi+' (ft)</p>' +
					'<p><b>Downstream Invert: </b>'+dsi+' (ft)</p>' +
			   '</div>';
	if(!ismobile) {
		popup.setTitle("Selected Storm Water Line");
	 	popup.setContent(cont);
	    popup.resize(300,500);
	    popup.show(evt.mapPoint);
	} else {
		console.log("mobile");
		$("#popcon").html(cont);
		$("#selTitle").html("Selected Storm Water Line");
		var pop = document.getElementById("pop");
		pop.style.visibility='visible';

	}
} 
function outfallInfo(map,evt,json) {
	var popup = map.infoWindow,
		ownedBy = (json['ownedBy'] != "") ? json['ownedBy'] : "",
		muni = (json['muni'] != "Null") ? json['muni'] : "",
		locDesc = (json['locDesc'] != "Null") ? json['locDesc'] : "",
		material = (json['material'] != "Null") ? json['material'] : "",
		recWater = (json['recWater'] != "Null") ? json['recWater'] : "",
		comments = (json['comments'] != "Null") ? json['comments'] : "";
	var dia = (json['dia'] != "Null") ? Number(json['dia']) : "";

 	var cont = '<div>' + 
 					'<p><b>Outfall ID#: </b>'+json['oid']+'</p>' +
 					'<p><b>Owned By: </b>'+ownedBy+'</p>' +
 					'<p><b>Municipality: </b>'+muni+'</p>' +
 					'<p><b>Location Description: </b>'+locDesc+'</p>' +
 					'<p><b>Material: </b>'+material+'</p>' +
 					'<p><b>Receiving Water: </b>'+recWater+'</p>' +
 					'<p><b>Diameter: </b>'+dia+' (in)</p>' +
 					'<p><b>Comments: </b><p>'+comments+'</p></p>' +
 			   '</div>';
 	if(!ismobile) {
		popup.setTitle("Selected Outfall");
	 	popup.setContent(cont);
	    popup.resize(300,500);
	    popup.show(evt.mapPoint);
	} else {
		console.log("mobile");
		$("#popcon").html(cont);
		$("#selTitle").html("Selected Outfall");
		var pop = document.getElementById("pop");
		pop.style.visibility='visible';

	}
}
function swManholeInfo(map,evt,json) {
	var popup = map.infoWindow,
		mid = json['manhole#'],
		address = (json['address'] != null) ? json['address'] : "",
		topRimEl = (json['topRimEl'] != null) ? json['topRimEl'] : 0,
		condition = (json['condition'] != null) ? json['condition'] : "" ,
		ownedBy = (json['ownedBy'] != null) ? json['ownedBy'] : "",
		muni = (json['muni'] != null) ? json['muni'] : "",
		locDesc = (json['locDesc'] != null) ? json['locDesc'] : "",
		accDia = (json['accDia'] != null) ? Number(json['accDia']) : "",
		accType = (json['accType'] != null) ? json['accType'] : "",
        groundType = (json['groundType'] != null) ? json['groundType'] : "",
        hpe = (json['hpe'] != null) ? Number(json['hpe']) : "",
        rimEl = (json['rimEl'] != null) ? Number(json['rimEl']) : "",
        inverEl = (json['inverEl'] != null) ? Number(json['inverEl']) : "",
        interDrop = (json['interDrop'] != null) ? Number(json['interDrop']) : "",
        manholeDrop = (json['manholeDrop'] != null) ? json['manholeDrop'] : "",
        wallMat = (json['wallMat'] != null) ? json['wallMat'] : "",
        structShape = (json['structShape'] != null) ? json['structShape'] : "",
        manholeType = (json['manholeType'] != null) ? json['manholeType'] : "",
        metered = (json['metered'] != null) ? json['metered'] : "";
    	if (metered == 0 || metered == 'False') {
    		metered = "False";
    		var mv = "0";
    	} else if (metered == 1 || metered == 'True') {
    		metered = "True";
    		var mv = "1";

    	} else {
    		metered = "";
    	}
        var comments = (json['comments'] != null) ? json['comments'] : "",

	    cont = '<div>' +
	    			'<p><b>Manhole ID#: </b>' + mid + ' </p>' +
	    			'<p><b>Address: </b>'+address+'</p>' +
	    			'<p><b>Rim Elevation: </b>'+rimEl+' (ft)</p>' +
	    			'<p><b>Condition: </b>'+condition+'</p>' +
	    			'<p><b>Owned By: </b>'+ownedBy+'</p>' +
	    			'<p><b>Municipality: </b>'+muni+'</p>' +
	    			'<p><b>Location Description: </b>'+locDesc+'</p>' +
	    			'<p><b>Access Diameter: </b>'+accDia+' (in)</p>' +
	    			'<p><b>Access Type: </b>'+accType+'</p>' +
	    			'<p><b>Ground Type: </b>'+groundType+'</p>' +
	    			'<p><b>High Pipe Elevation: </b>'+hpe+' (ft)</p>' +
	    			'<p><b>Invert Elevation: </b>'+inverEl+' (ft)</p>' +
	    			'<p><b>Manhole Drop: </b>'+manholeDrop+'</p>' +
	    			'<p><b>Interior Drop: </b>'+interDrop+' (in)</p>' +
	    			'<p><b>Wall Material: </b>'+wallMat+'</p>' +
	    			'<p><b>Structural Shape: </b>'+structShape+'</p>' +
	    			'<p><b>Manhole Type: </b>'+manholeType+'</p>' +
	    			'<p><b>Metered: </b>'+metered+'</p>' +
	    			'<p><b>Comments: </b><p>'+comments+'</p></p>' +

	    	   '</div>';

    if(!ismobile) {
		popup.setTitle("Selected Storm Water Manhole");
	 	popup.setContent(cont);
	    popup.resize(300,500);
	    popup.show(evt.mapPoint);
	} else {
		console.log("mobile");
		$("#popcon").html(cont);
		$("#selTitle").html("Selected Storm Water Manhole");
		var pop = document.getElementById("pop");
		pop.style.visibility='visible';

	}
}
function basinPopInfo(map,evt,json) {
	var popup = map.infoWindow,
		address = (json['address'] != null) ? json['address'] : "",
		length = (json['length'] != null) ? json['length'] : 0,
		width = (json['width'] != null) ? json['width'] : 0,
		depth = (json['depth'] != null) ? json['depth'] : 0,
		size = (json['size'] != null) ? json['size'] : 0,
		line_size = Number(json['line_size']);
         if (line_size != "") {
         	var line_sizeFt = Math.floor(line_size);
         	var line_sizeIn = ((line_size - line_sizeFt) * 12).toFixed(0);
         } else {
         	var line_sizeFt = 0;
         	var line_sizeIn = 0;
         }
    	line_size = line_sizeFt + " (ft) " + line_sizeIn + " (in)";
	var	drains = (json['drains_to'] != null) ? json['drains_to'] : "",
    	condition = (json['condition'] != null) ? json['condition'] : "";
    	ownedBy = (json['ownedBy'] != null) ? json['ownedBy'] : "",
        muni = (json['muni'] != null) ? json['muni'] : "",
        locDesc = json['locDesc'],
        cbType = json['CBType'],
        rimEl = (json['rimEl'] != null) ? Number(json['rimEl']) : "",
        accDia = (json['accDia'] != null) ? Number(json['accDia']) : "", 
        accMat = (json['accMat'] != null) ? json['accMat'] : "",
        accType = (json['accType'] != null) ? json['accType'] : "",
        inverEl = (json['inverEl'] != null) ? Number(json['inverEl']) : "",
        comments = json['comments'];
    
    var cont = '<div>' +
    				'<p><b>Basin ID#: </b> '+ json['basin#'] +'</p>' + 
    				'<p><b>Address: </b>'+ address + '</p>' + 
    				'<p><b>Volume : </b>'+ size + ' (ft&sup3;)</p>' + 
    				'<p><b>Line Size Connection: </b>' + line_size + '</p>' +
    				'<p><b>Drains To: </b>' + drains + '</p>' +
    				'<p><b>Condition: </b>'+ condition +'</p>' + 
    				'<p><b>Owned By: </b>'+ownedBy+'</p>' +
    				'<p><b>Municipality: </b>'+muni+'</p>' +
    				'<p><b>Location Description: </b>'+locDesc+'</p>' +
    				'<p><b>CB Type: </b>'+cbType+'</p>' +
    				'<p><b>Top of Structure: </b>'+rimEl+' (ft)</p>' +
    				'<p><b>Diameter: </b>'+accDia+' (in)</p>' +
    				'<p><b>Access Material: </b>'+accMat+'</p>' +
    				'<p><b>Access Type: </b>'+accType+'</p>' +
    				'<p><b>Invert Elevation: </b>'+inverEl+' (ft)</p>' +
    				'<p><b>Comments: </b><p>'+comments+'</p></p>' +
    		   '</div>';
    if(!ismobile) {
		popup.setTitle("Selected Catchbasin");
	 	popup.setContent(cont);
	    popup.resize(300,500);
	    popup.show(evt.mapPoint);
	} else {
		console.log("mobile");
		$("#popcon").html(cont);
		$("#selTitle").html("Selected Catchbasin");
		var pop = document.getElementById("pop");
		pop.style.visibility='visible';

	}


}
function f_map_click_handler(map,evt_click) {
	"use strict";
	switch (tool_selected) {
	case "parcel":
		f_parcel_selection_exec(evt_click);
		break;
	case "identify":
		f_map_identify_exec(evt_click);
		break;
	case "utility":
		f_map_util_exec(map, evt_click);
		break;
	case "ERIS_Identify":
		f_ERIS_selection_exec(evt_click);
		break;
	case "pan":
		break;
	}
}
function f_button_clicked(id) {
	"use strict";
	var G_button_clicked = document.getElementsByClassName("button_clicked")[0],
		element = document.getElementById(id);
	element.classList.toggle("button_clicked");
	G_button_clicked.classList.toggle("button_clicked");
	G_button_clicked = id;
}
function f_measure_map() {
	"use strict";
	document.getElementById("dropdown0").classList.remove("hidden");
}
function f_map_clear() {
	"use strict";
	if (locateButton !== undefined) {
		locateButton.clear();
	}
	var dropdown0 = document.getElementById("dropdown0"),
		index,
		length,
		target,
		array;
	search_results = [];
	parcel_results = [];
	search_acres = [];
	document.getElementById("search_progress").value = "0";
	document.getElementById("search_tally").innerHTML = "";
	document.getElementById("search_export").innerHTML = "";
	document.getElementById("parcel_export").innerHTML = "";
	document.getElementById("parcel_acres").innerHTML = "";
	target = document.getElementById("rdo_muni_searchAll");
	if(target.checked) {
		target.click();
	}
	target = document.getElementById("rdo_qual_searchAll");
	if(target.checked) {
		target.click();
	}
	target = document.getElementById("rdo_landuse_searchAll");
	if(target.checked) {
		target.click();
	}
	document.getElementById("block_type").click();
	document.getElementById("search_progress").style.display = "none";
	M_meri.getLayer("GL_parcel_selection").clear();
	M_meri.getLayer("GL_buffer_parcel").clear();
	M_meri.getLayer("GL_buffer_buffer").clear();
	M_meri.getLayer("GL_buffer_selected_parcels").clear();
	M_meri.infoWindow.clearFeatures();
	M_meri.infoWindow.hide();
	measurementDijit.clearResult();
	measurementDijit.setTool("location", false);
	measurementDijit.setTool("area", false);
	measurementDijit.setTool("distance", false);
	array = document.querySelectorAll("input[type=text]");
	length = array.length;
	for(index = 0; index < length; index += 1) {
		array[index].value = "";
	}
	array = document.getElementsByClassName('s_muni_chk_item');
	length = array.length;
	for(index = 0; index < length; index += 1) {
		array[index].checked = false;
		array[index].parentNode.classList.toggle("li_checked", false);
	}
	array = document.getElementsByClassName('s_qual_chk_item');
	length = array.length;
	for(index = 0; index < length; index += 1) {
		array[index].checked = false;
		array[index].parentNode.classList.toggle("li_checked", false);
	}
	array = document.getElementsByClassName('s_landuse_chk_item');
	length = array.length;
	for(index = 0; index < length; index += 1) {
		array[index].checked = false;
		array[index].parentNode.classList.toggle("li_checked", false);
	}
	array = document.getElementsByClassName('search_parcel_container');
	for(index = 0; index < array.length; index += 1) {
		array[index].remove();
		index += -1;
	}
	array = document.getElementsByClassName('search_owner_container');
	for(index = 0; index < array.length; index += 1) {
		array[index].remove();
		index += -1;
	}
	array = document.getElementsByClassName('buffer');
	length = array.length;
	for(index = 0; index < length; index += 1) {
		array[index].style.display = "none";
	}
  document.getElementById("buffer_distance").value = 200;
	if (!dropdown0.classList.contains("hidden")) {
		dropdown0.classList.add("hidden");
	}
}
function f_search_parcel_old(search, where_PID) {
	"use strict";
	document.getElementById("search_progress").value = ".5";
	var where = [],
		where_address,
		where_block,
		where_lot,
		search_progress = document.getElementById("search_progress");
	if (search.address !== "") {
		where_address = "PROPERTY_ADDRESS LIKE '%" + search.address.toLowerCase() + "%'";
		where.push(where_address);
	} else if (search.block !== "" || search.lot !== "") {
		if (search.block !== "") {
			if(search.block_type === "true") {
				where_block = "(BLOCK = '" + search.block + "' OR OLD_BLOCK = '" + search.block + "')";
			} else {
				where_block = "(BLOCK = '" + search.block + "')";
			}
			where.push(where_block);
		}
		if (search.lot !== "") {
			if(search.block_type === "true") {
				where_lot = "(LOT = '" + search.lot + "' OR OLD_LOT = '" + search.lot + "')";
			} else {
				where_lot = "(LOT = '" + search.lot + "')";
			}
			where.push(where_lot);
		}
	}
	require(["esri/tasks/query", "esri/tasks/QueryTask"], function (Query, QueryTask) {
		var Q_parcel_selection = new Query(),
			QT_parcel_selection = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_parcel),
			where_muni,
			where_qual,
			outFields_json = f_getoutFields(),
			index = 0;
		Q_parcel_selection.outSpatialReference = {wkid: 3857};
		Q_parcel_selection.returnGeometry = true;
		Q_parcel_selection.outFields = outFields_json.parcel;
		if (search.rdo_muni_search === "on") {
			if (search.s_muni_chk_item !== undefined && search.s_muni_chk_item.length > 0) {
				where_muni = "MUN_CODE IN (";
				if (search.s_muni_chk_item instanceof Array) {
					for (index = 0; index < search.s_muni_chk_item.length; index += 1) {
						where_muni += "'" + search.s_muni_chk_item[index] + "',";
					}
					where_muni = where_muni.substring(0, where_muni.length - 1);
				} else {
					where_muni += "'" + search.s_muni_chk_item + "'";
				}
				where_muni += ")";
				where.push(where_muni);
			}
		}
		if (search.rdo_qual_search === "on") {
			if (search.s_qual_chk_item !== undefined && search.s_qual_chk_item.length > 0) {
				where_qual = "QUALIFIER in (";
				if (search.s_qual_chk_item instanceof Array) {
					for (index = 0; index < search.s_qual_chk_item.length; index += 1) {
						where_qual += "'" + search.s_qual_chk_item[index] + "',";
					}
					where_qual = where_qual.substring(0, where_qual.length - 1);
				} else {
					where_qual += "'" + search.s_qual_chk_item + "'";
				}
				where_qual += ")";
				where.push(where_qual);
			}
		}
		if (where_PID !== null) {
			where.push(where_PID);
		}
		Q_parcel_selection.where = where.join(" AND ");
		QT_parcel_selection.execute(Q_parcel_selection, function (results) {
			var old_result;
			if(results.features.length > 0)
			{
				for (index = 0; index < results.features.length; index += 1) {
					if (old_result !== undefined) {
						if (results.features[index].attributes.BLOCK === old_result.attributes.BLOCK && results.features[index].attributes.LOT === old_result.attributes.LOT) {
							delete results.features[index];
						}
					}
				old_result = results.features[index];
				}
				f_process_results_parcel(results, "search");
			}
			search_progress.value = "1";
			search_progress.style.display = "none";
		}, function(er)
		{
			console.log(er);
		});
	});
}
function f_search_landuse(search) {
	"use strict";
	if (search.rdo_landuse_search === "on") {
		require(["esri/tasks/query", "esri/tasks/QueryTask"], function (Query, QueryTask) {
			var Q_landuse = new Query(),
				QT_landuse = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_landuse),
				where_landuse,
				where_PID,
				index = 0;
			Q_landuse.returnGeometry = false;
			Q_landuse.outFields = ["PID"];
			if (search.s_landuse_chk_item !== undefined && search.s_landuse_chk_item.length > 0) {
				where_landuse = "LANDUSE_CODE IN (";
				if (search.s_landuse_chk_item instanceof Array) {
					for (index = 0; index < search.s_landuse_chk_item.length; index += 1) {
						where_landuse += "'" + search.s_landuse_chk_item[index] + "',";
					}
				} else {
					where_landuse += "'" + search.s_landuse_chk_item + "',";
				}
				where_landuse = where_landuse.substring(0, where_landuse.length - 1);
				where_landuse += ")";
				Q_landuse.where = where_landuse;
				QT_landuse.execute(Q_landuse, function (results) {
					if (results.features.length > 0) {
						where_PID = "PID IN (";
						var i, il;
						for (i = 0, il = results.features.length; i < il; i += 1) {
							where_PID += "'" + results.features[i].attributes.PID + "',";
						}
						where_PID = where_PID.substring(0, where_PID.length - 1);
						where_PID += ")";
						f_search_parcel_old(search, where_PID);
					}
				});
			} else {
				f_search_parcel_old(search, null);
			}
		});
	} else {
		f_search_parcel_old(search, null);
	}
}
function f_candidate_search(where, candidate_array) {
	"use strict";
	var search_progress = document.getElementById("search_progress");
	if (candidate_array.length > 0) {
		require(["esri/geometry/Extent", "esri/SpatialReference", "esri/geometry/Point", "esri/tasks/query", "esri/tasks/QueryTask"], function (Extent, SpatialReference, Point, Query, QueryTask) {
			var candidate = candidate_array.pop(),
				Q_parcel_selection = new Query(),
				QT_parcel_selection = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_parcel),
				point,
				search_extent,
				index,
				featureAttributes,
				parcel_address,
				candidate_address = document.getElementById("address").value.split(" ", 2)[1],
				add_num = document.getElementById("address").value.split(" ", 1)[0],
				outFields_json = f_getoutFields(),
				show = false;
			Q_parcel_selection.outSpatialReference = {wkid: 3857};
			Q_parcel_selection.returnGeometry = true;
			Q_parcel_selection.outFields = outFields_json.parcel;
			search_progress.value = ".5";
			if (where.length > 0) {
				Q_parcel_selection.where = where.join(" AND ");
			}
			if (candidate.attributes.Addr_type === "StreetAddress") {
				search_extent = new Extent(candidate.attributes.Xmin,
													candidate.attributes.Ymin,
													candidate.attributes.Xmax,
													candidate.attributes.Ymax,
													new SpatialReference(4326));
				Q_parcel_selection.geometry = search_extent;
				QT_parcel_selection.execute(Q_parcel_selection, function (results) {
					for (index = 0; index < results.features.length; index += 1) {
						featureAttributes = results.features[index].attributes;
						parcel_address = featureAttributes.PROPERTY_ADDRESS.replace(/\s/g, "").toLowerCase();
						if (parcel_address.indexOf(candidate_address) !== -1) {
							show = true;
						}
						if (!isNaN(add_num)) {
							if (parcel_address.indexOf(add_num) !== -1 && parcel_address.indexOf(candidate_address) !== -1) {
								show = true;
							} else {
								show = false;
							}
						}
						if (show !== true) {
							results.features.splice(index, 1);
							index += -1;
						}
					}
					if(results.features.length > 0)
					{
						f_process_results_parcel(results, "search");
					}
					document.getElementById("search_tally").innerHTML = "";
				});
			} else if (candidate.attributes.Addr_type === "PointAddress") {
				point = new Point(candidate.attributes.DisplayX,
										candidate.attributes.DisplayY,
										new SpatialReference(4326));
				Q_parcel_selection.geometry = point;
				QT_parcel_selection.execute(Q_parcel_selection, function (results) {
					f_process_results_parcel(results, "search");
					document.getElementById("search_tally").innerHTML = "";
				});
			}
			if (candidate_array.length > 0) {
				f_candidate_search(where, candidate_array);
			}
			search_progress.value = "1";
			search_progress.style.display = "none";
		});
	} else {
		search_progress.value = "1";
		search_progress.style.display = "none";
	}
}
function showResults(candidates, search) {
	"use strict";
	var muni = ["Carlstadt", "East Rutherford", "Little Ferry", "Lyndhurst", "Moonachie", "North Arlington", "Ridgefield", "Rutherford", "South Hackensack", "Teterboro", "Jersey City", "Kearny", "North bergen", "Secaucus"],
		where = [],
		Q_landuse,
		QT_landuse,
		where_qual,
		where_PID,
		score = 0,
		candidate_array = [],
		array,
		where_landuse,
		i,
		index,
		candidate,
		il;
	require(["esri/tasks/query", "esri/tasks/QueryTask"], function (Query, QueryTask) {
		Q_landuse = new Query();
		Q_landuse.returnGeometry = false;
		Q_landuse.outFields = ["PID"];
		QT_landuse = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_landuse);
		if (search.rdo_muni_search === "on") {
			if (search.s_muni_chk_item !== undefined && search.s_muni_chk_item.length > 0) {
				var where_muni = "MUN_CODE IN (";
				if (search.s_muni_chk_item instanceof Array) {
					for (i = 0; i < search.s_muni_chk_item.length; i += 1) {
						where_muni += "'" + search.s_muni_chk_item[i] + "',";
					}
					where_muni = where_muni.substring(0, where_muni.length - 1);
				} else {
					where_muni += "'" + search.s_muni_chk_item + "'";
				}
				where_muni += ")";
				where.push(where_muni);
			}
		}
		if (search.rdo_qual_search === "on") {
			if (search.s_qual_chk_item !== undefined && search.s_qual_chk_item.length > 0) {
				where_qual = "QUALIFIER in (";
				if (search.s_qual_chk_item instanceof Array) {
					for (i = 0; i < search.s_qual_chk_item.length; i += 1) {
						where_qual += "'" + search.s_qual_chk_item[i] + "',";
					}
					where_qual = where_qual.substring(0, where_qual.length - 1);
				} else {
					where_qual += "'" + search.s_qual_chk_item + "'";
				}
				where_qual += ")";
				where.push(where_qual);
			}
		}
		array = candidates.addresses;
		for(index = 0; index < array.length; index += 1) {
			candidate = array[index];
			if (candidate.score >= score && (candidate.attributes.Addr_type === "StreetAddress" || candidate.attributes.Addr_type === "PointAddress") && muni.indexOf(candidate.attributes.City) > -1) {
				score = candidate.score;
				candidate_array.unshift(candidate);
			}
		}
		if (search.rdo_landuse_search === "on") {
			if (search.s_landuse_chk_item.length > 0) {
				where_landuse = "LANDUSE_CODE IN (";
				if (search.s_landuse_chk_item instanceof Array) {
					for (i = 0; i < search.s_landuse_chk_item.length; i += 1) {
						where_landuse += "'" + search.s_landuse_chk_item[i] + "',";
					}
					where_landuse = where_landuse.substring(0, where_landuse.length - 1);
				} else {
					where_landuse += "'" + search.s_landuse_chk_item + "'";
				}
				where_landuse += ")";
				Q_landuse.where = where_landuse;
				QT_landuse.execute(Q_landuse, function (results) {
					if (results.features.length > 0) {
						where_PID = "PID IN (";
						for (i = 0, il = results.features.length; i < il; i += 1) {
							where_PID += "'" + results.features[i].attributes.PID + "',";
						}
						where_PID = where_PID.substring(0, where_PID.length - 1);
						where_PID += ")";
						where.push(where_PID);
						f_candidate_search(where, candidate_array);
					}
				});
			} else {
				f_candidate_search(where, candidate_array);
			}
		} else {
			f_candidate_search(where, candidate_array);
		}
	});
}
function f_search_address(json) {
	"use strict";
	var search = JSON.parse(json),
		search_progress = document.getElementById("search_progress");
	search_progress.style.display = "block";
	search_progress.value = "0";
	require(["esri/tasks/locator"], function (Locator) {
		if (isNaN(search.address.split(" ", 1)) || search.address === "") {
			search_progress.value = ".25";
			f_search_landuse(search);
		} else {
			var address = {"SingleLine": search.address},
				options = {address: address, outFields: ["Addr_type", "StName", "AddNum", "Xmax", "Ymax", "Xmin", "Ymin", "DisplayX", "DisplayY", "City", "geometry"], searchExtent: M_meri.extent},
				locator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
			locator.on("address-to-locations-complete", function (evt) {
				showResults(evt, search);
			});
			locator.outSpatialReference = M_meri.spatialReference;
			search_progress.value = ".25";
			locator.addressToLocations(options);
		}
	});
}
function f_query_owners_results(results) { //results contains the query data
	"use strict";
	var i,
		il,
		featureAttributes,
		dropdown2 = document.getElementById("dropdown2"), //the dropdown that gets appended to
		e_li_owner,
		e_ul_owner_attrib,
		e_li_owner_link,
		string,
		att;
		//console.log(results);
	for (i = 0, il = results.features.length; i < il; i += 1) {
		//console.log(e_li_owner); nothing here
		featureAttributes = results.features[i].attributes;
		console.log(results.features[i].attributes);
		//console.log(featureAttributes);
		e_li_owner = document.createElement("li");
		e_li_owner.id = "r_owner_" + featureAttributes.OWNID;
		e_li_owner.className = "search_owner_container owner_li";
		e_li_owner.style.display = "block";
		//console.log(e_li_owner);
		dropdown2.appendChild(e_li_owner);
		e_ul_owner_attrib = document.createElement("ul");
		e_ul_owner_attrib.style.top = "2px";
		e_ul_owner_attrib.style.padding = "1.5%";
		e_ul_owner_attrib.style.position = "relative";
		e_ul_owner_attrib.id = "findownerparcel_" + featureAttributes.OWNID;
		e_li_owner.appendChild(e_ul_owner_attrib);
		for (att in featureAttributes) {
			if (featureAttributes.hasOwnProperty(att)) {
				e_ul_owner_attrib.innerHTML += '<li><strong>' + fieldAlias(att, "owner") + '</strong>' + featureAttributes[att] + '</li>';
			}
		}
		e_li_owner_link = document.createElement("li");
		e_ul_owner_attrib.appendChild(e_li_owner_link);
		string = '<a id="find_' + featureAttributes.OWNID + '" class="selection_a" href="#" onclick="f_query_owner_int_exec(\'' + featureAttributes.OWNID + '\');return false;">Find Owner Parcels</a>';
		e_li_owner_link.innerHTML = string;
		//console.log(featureAttributes);
	}

}

function f_query_facname_results(results) {
	"use strict";
	var i,
		il,
		featureAttributes,
		dropdown2 = document.getElementById("dropdown2"),
		e_li_owner,
		e_ul_owner_attrib,
		e_li_owner_link,
		string,
		att;
	for (i = 0, il = results.features.length; i < il; i += 1) {
		featureAttributes = results.features[i].attributes;
		e_li_owner = document.createElement("li");
		e_li_owner.id = "r_owner_" + featureAttributes.OWNID;
		e_li_owner.className = "search_owner_container owner_li";
		e_li_owner.style.display = "block";
		dropdown2.appendChild(e_li_owner);
		e_ul_owner_attrib = document.createElement("ul");
		e_ul_owner_attrib.style.top = "2px";
		e_ul_owner_attrib.style.padding = "1.5%";
		e_ul_owner_attrib.style.position = "relative";
		e_ul_owner_attrib.id = "findownerparcel_" + featureAttributes.OWNID;
		e_li_owner.appendChild(e_ul_owner_attrib);
		for (att in featureAttributes) {
			if (featureAttributes.hasOwnProperty(att)) {
				e_ul_owner_attrib.innerHTML += '<li><strong>' + fieldAlias(att, "building") + '</strong>' + featureAttributes[att] + '</li>';
			}
		}
		e_li_owner_link = document.createElement("li"); //PID was once OWNID
		e_ul_owner_attrib.appendChild(e_li_owner_link);
		string = '<a id="find_' + featureAttributes.PID + '" class="selection_a" href="#" onclick="f_query_owner_int_exec2(\'' + featureAttributes.PID + '\');return false;">Find Owner Parcels</a>';
		e_li_owner_link.innerHTML = string;
	}
}
function f_search_owner(json) {
	"use strict";
	var search = JSON.parse(json);
	if (search.owner !== "") {
		require(["esri/tasks/query", "esri/tasks/QueryTask"], function (Query, QueryTask) {
			console.log(parcels_json.tables.gis_sde_tbl_cad_owner);
			var Q_owners = new Query(),
				QT_owners = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_owner),
				e_search_progress = document.getElementById("search_progress"),
				outFields_json = f_getoutFields();
			Q_owners.returnGeometry = false;
			Q_owners.outFields = outFields_json.owner; //OWNID, NAME, ADDRESS, CITY_STATE, ZIPCODE
			Q_owners.where = "WHERE NAME LIKE '%" + search.owner + "%'";
			console.log(Q_owners.where);
			QT_owners.execute(Q_owners, f_query_owners_results);
			e_search_progress.value = "1";
			e_search_progress.style.display = "none";
		});
	}
} 


function f_search_facname(json) {
	"use strict";
	var search = JSON.parse(json);
	if (search.facname !== "") {
		require(["esri/tasks/query", "esri/tasks/QueryTask"], function (Query, QueryTask) {
			//console.log(parcels_json.tables.gis_sde_tbl_cad_rtk);
			console.log(parcels_json.layers.gis_sde_building);
			var Q_facname = new Query(),
			 	QT_facname = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_building),
				e_search_progress = document.getElementById("search_progress"),
				outFields_json = f_getoutFields(); //PID, BID, MUNCIPALITY, BUILDING_LOCATION. FACILITY_NAME
			Q_facname.returnGeometry = false;
			Q_facname.outFields = outFields_json.building; //.owner
			Q_facname.where = "WHERE FACILITY_NAME LIKE '%" + search.facname + "%'";
			console.log(Q_facname.where);
			QT_facname.execute(Q_facname, f_query_facname_results);
			e_search_progress.value = "1";
			e_search_progress.style.display = "none";
		});
	}
}





function e_goBack() {
	"use strict";
	document.getElementById("form_submit").style.display = "block";
	document.getElementById("for_form").remove();
}
function f_add_filter_listener(filter) {
	filter.addEventListener("change", function () {
		var target = this.parentNode.parentNode.getElementsByTagName("ul")[0];
		target.classList.toggle("hidden");
	});
}
function f_add_about_listener(link) {
	link.addEventListener("click", function () {
		var target = this.parentNode.parentNode.getElementsByClassName("about_ul"),
			length = target.length,
			index,
			node,
			target2 = this.parentNode.getElementsByTagName("ul")[0];
		for(index = 0; index < length; index += 1) {
			node = target[index];
			if (!node.classList.contains("hidden")) {
				node.classList.add("hidden");
			}
		}
		if (target2.classList.contains("hidden")) {
			target2.classList.remove("hidden");
		}		
	});
}
function f_add_tab_listener(tab) {
	tab.addEventListener("click", function(e) {
		var target,
			index,
			length,
			node,
			target2;
		target = this.parentNode;
		if(target.className === "active") {
			target.removeAttribute("class");
		} else {
			target.className = "active";
		}
		target = this.parentNode.parentNode.getElementsByClassName("dropdown main");
		target2 = this.parentNode.getElementsByTagName("ul")[0];
		length = target.length;
		for(index = 0; index <length; index += 1) {
			node = target[index];
			if (node !== target2) {
				if(!node.classList.contains("hidden")) {
					node.parentNode.classList.toggle("active");
					node.classList.toggle("hidden");
				}
			}
		}
		target2.classList.toggle("hidden");
		e.preventDefault();
	});
}
function f_base_map_toggle(sel) {
	"use strict";
	var base_map = sel.options[sel.selectedIndex].value;
	if (base_map !== "") {
		M_meri.setBasemap(base_map);
	} else {
		M_meri.setBasemap("satellite");
	}
}
function f_image_layer_toggle(sel) {
	"use strict";
	var img_layer = sel.options[sel.selectedIndex].value,
		IL_buttonmap = M_meri.getLayer("IL_buttonmap");
	if (IL_buttonmap !== undefined) {
		M_meri.removeLayer(IL_buttonmap);
	}
	if (img_layer !== "") {
		require(["esri/layers/ArcGISImageServiceLayer"], function (ArcGISImageServiceLayer) {
			IL_buttonmap = new ArcGISImageServiceLayer(DynamicLayerHost + "/rest/services/Imagery/" + img_layer + "/ImageServer", {id: "IL_buttonmap"});
			M_meri.addLayer(IL_buttonmap, 1);
		});
	}
}
function f_add_checked(node) {
	node.addEventListener("click", function () {
		node.parentNode.classList.toggle("li_checked");
	});
}
function f_load_tools() {
	"use strict";
	require(["esri/toolbars/navigation", "dojo/dom-form"], function (Navigation, domForm) {
		var header = document.getElementsByClassName("header-container")[0],
			nav_tabs = document.getElementById("nav_tabs"),
			buttons = document.getElementById("buttons"),
			search2 = document.getElementById("search2"),
			logo = document.getElementById("logo"),
			target,
			index,
			length;
			target = document.getElementsByClassName("s_muni_chk_item");
			for(index = 0; index < target.length; index += 1) {
				f_add_checked(target[index]);
			}
			target = document.getElementsByClassName("s_qual_chk_item");
			for(index = 0; index < target.length; index += 1) {
				f_add_checked(target[index]);
			}
			target = document.getElementsByClassName("s_landuse_chk_item");
			for(index = 0; index < target.length; index += 1) {
				f_add_checked(target[index]);
			}
			document.getElementById("pull").addEventListener("click", function () {
				if (document.getElementById("nav_tabs").style.width !== "90%") {
					header.style.position = "absolute";
					header.style.overflow = "hidden";
					nav_tabs.style.width = "90%";
					buttons.style.visibility = "hidden";
					logo.style.visibility = "hidden";
					search2.style.visibility = "hidden";
				} else {
					header.style.width = "100%";
					buttons.style.visibility = "visible";
					search2.style.visibility = "visible";
					nav_tabs.style.width = "0";
					logo.style.visibility = "visible";
				}
			});
			document.getElementById("zoomin").addEventListener("click", function () {
				navToolbar.activate(Navigation.ZOOM_IN);
				f_button_clicked("zoomin");
			});
			document.getElementById("zoomout").addEventListener("click", function () {
				navToolbar.activate(Navigation.ZOOM_OUT);
				f_button_clicked("zoomout");
			});
			document.getElementById("pan").addEventListener("click", function () {
				navToolbar.activate(Navigation.PAN);
				f_button_clicked("pan");
				tool_selected = "pan";
			});
			document.getElementById("extent").addEventListener("click", function () {
				M_meri.centerAndZoom([-74.08456781356876, 40.78364440736023], 12);
			});
			document.getElementById("previous").addEventListener("click", function () {
				navToolbar.zoomToPrevExtent();
			});
			document.getElementById("next").addEventListener("click", function () {
				navToolbar.zoomToNextExtent();
			});
			document.getElementById("identify").addEventListener("click", function () {
				navToolbar.activate(Navigation.PAN);
				tool_selected = "identify";
				f_button_clicked("identify");
			});
			document.getElementById("utility").addEventListener("click", function () {
				navToolbar.activate(Navigation.PAN);
				tool_selected = "utility";
				f_button_clicked("utility");
			});
			document.getElementById("parcel").addEventListener("click", function () {
				f_button_clicked("parcel");
				navToolbar.activate(Navigation.PAN);
				tool_selected = "parcel";
			});
			document.getElementById("measure").addEventListener("click", function () {
				navToolbar.activate(Navigation.PAN);
				tool_selected = "pan";
				f_button_clicked("measure");
				f_measure_map();
			});
			document.getElementById("clear").addEventListener("click", function () {
				f_map_clear();
			});
			document.getElementById("search_property").addEventListener("submit", function (e) {
				e.preventDefault();
				f_search_address(domForm.toJson("search_property"));
			});
			document.getElementById("search_owner").addEventListener("submit", function () { ////was click for some reason
				f_search_owner(domForm.toJson("search_owner"));
			}); 
			document.getElementById("search_facname").addEventListener("submit", function () { /////testing///////
				f_search_facname(domForm.toJson("search_facname"));
			});
			document.getElementById("owner_toggle").addEventListener("change", function() {
				document.getElementById("li_property").style.display = "none";
				document.getElementById("li_owner").style.display = "block";
				document.getElementById("li_facname").style.display= "none";
			});
			document.getElementById("property_toggle").addEventListener("change", function() {
				document.getElementById("li_property").style.display = "block";
				document.getElementById("li_owner").style.display = "none";
				document.getElementById("li_facname").style.display= "none";
			});
			document.getElementById("facsearch_toggle").addEventListener("change", function() {
				document.getElementById("li_property").style.display = "none";
				document.getElementById("li_owner").style.display = "none";
				document.getElementById("li_facname").style.display= "block";
			});
			document.getElementById("filter").addEventListener("click", function (e) {
				var toElem = e.originalTarget || e.toElement || e.srcElement;
				if (toElem.id === "filter") {
					if (this.style.color !== "rgb(0, 153, 221)" && this.style.color !== "rgb(222, 10, 10)") {
						this.innerHTML = "Search Options & Filters (-)";
					} else {
						this.innerHTML = "Search Options & Filters (+)";
					}
				}
				if (this.style.color !== "rgb(0, 153, 221)" && this.style.color !== "rgb(222, 10, 10)") {
					if(ERIS) {
						this.style.color = "#DE0A0A";
					} else {
						this.style.color = "#09D";
					}
				} else {
					this.style.color = "#444";
				}
			});
			target = document.getElementsByClassName("tab");
			length = target.length;
			for(index = 0; index < length; index += 1) {
				f_add_tab_listener(target[index]);
			}
			document.getElementById("filter").addEventListener("click", function () {
				var target2 = this.parentNode.getElementsByTagName("ul")[0];
				target2.classList.toggle("hidden");
			});
			target = document.getElementsByClassName("radio_filter");
			length = target.length;
			f_add_filter_listener(document.getElementById('rdo_muni_searchAll'));
			f_add_filter_listener(document.getElementById('rdo_qual_searchAll'));
			f_add_filter_listener(document.getElementById('rdo_landuse_searchAll'));
			for(index = 0; index < length; index += 1) {
				f_add_filter_listener(target[index]);
			}
			target = document.getElementsByClassName("about_a");
			length = target.length;
			for(index = 0; index <length; index += 1) {
				f_add_about_listener(target[index]);
			}
			document.getElementById("buffer_exe").addEventListener("click", function () {
				f_multi_parcel_buffer_exec(document.getElementById("buffer_distance").value, null);
			});
			document.getElementById("basemap_overlay").addEventListener("change", function () {
				f_base_map_toggle(this);
			});
			document.getElementById("image_overlay").addEventListener("change", function() {
				f_image_layer_toggle(this);
			});
		if (document.getElementById("account_link") !== null) {
			document.getElementById("account_link").addEventListener("click", function () {
				document.getElementById("form_submit").style.display = "none";
				var li_form = document.getElementById("li_form"),
					forgot_form = document.createElement("form"),
					lbl_email = document.createElement("label"),
					input_email = document.createElement("input"),
					goback_link = document.createElement("a");
				forgot_form.id = "for_form";
				forgot_form.action = "";
				lbl_email.setAttribute("for", "input_email");
				lbl_email.innerHTML = "Email: ";
				goback_link.href = "#";
				goback_link.innerHTML = "&larr;Go Back";
				goback_link.style.color = "#09D";
				goback_link.style.padding = "0";
				input_email.id = "input_email";
				input_email.type = "email";
				input_email.className = "input";
				input_email.required = true;
				input_email.autofocus = true;
				goback_link.onclick = function () {
					return false;
				};
				forgot_form.onsubmit = function () {
					var xmlhttp = new XMLHttpRequest();
					xmlhttp.open("POST", "./php/functions.php", false);
					xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					xmlhttp.send("function=capthca&email=" + document.getElementById("input_email").value + "&recaptcha_response_field=" + Recaptcha.get_response() + "&recaptcha_challenge_field=" + Recaptcha.get_challenge());
					if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
						if (parseInt(xmlhttp.responseText, 10) === 1) {
							document.getElementById("response").innerHTML = "Password has been sent.";
							Recaptcha.destroy();
						} else if (parseInt(xmlhttp.responseText, 10) === 2) {
							document.getElementById("response").innerHTML = "Email not found in Data.";
							Recaptcha.destroy();
						} else if (parseInt(xmlhttp.responseText, 10) === 3) {
							document.getElementById("response").innerHTML = "Error while sending email.";
							Recaptcha.destroy();
						} else {
							document.getElementById("response").innerHTML = "Your captcha was incorrect!";
							Recaptcha.create("6LeJT-MSAAAAAAGLpYb9ho-XHXUbA7VxHixYbzF-", "captcha", {theme: "white"});
						}
					}
					return false;
				};
				forgot_form.innerHTML += "Password Retrivial<br>";
				forgot_form.appendChild(lbl_email);
				forgot_form.appendChild(input_email);
				forgot_form.innerHTML += '<label for="captcha">Capthca: </label><div id="captcha"></div>';
				forgot_form.innerHTML += '<div id="response" style="color:#B72727"></div>';
				forgot_form.innerHTML += '<a href="#" style="color: rgb(0, 153, 221); padding: 0px;" onclick="e_goBack();return false;">Go Back</a>';
				forgot_form.innerHTML += '<input type="submit" class="small button">';
				li_form.appendChild(forgot_form);
				Recaptcha.create("6LeJT-MSAAAAAAGLpYb9ho-XHXUbA7VxHixYbzF-", "captcha", {theme: "white"});
			});
		}
		if (document.getElementById("form_submit") !== null) {
			document.getElementById("form_submit").addEventListener("submit", function () {
				var xmlhttp = new XMLHttpRequest(),
					data,
					form = new FormData(document.getElementById("form_submit"));
				xmlhttp.open("POST", '../ERIS/authenticate.php', false);
				xmlhttp.send(form);
				if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
					data = JSON.parse(xmlhttp.responseText.trim());
					if (data.response === true) {
						sessionStorage.username = data.username;
						location.reload();
					} else {
						document.getElementById("login_response").innerHTML = "Wrong login Credentials";
					}
				}
			});
		}

	});
}
function f_hide_owner_parcels(ownerid) {
	"use strict";
	var elem = document.getElementsByClassName("owner_parcels_" + ownerid),
		index = 0;
	for (index = 0; index < elem.length; index += 1) {
		elem[index].remove();
	}
}
function f_layer_list_update(checkbox) {
	"use strict";
	var LD_visible = M_meri.getLayer("LD_button").visibleLayers;
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
	M_meri.getLayer("LD_button").setVisibleLayers(LD_visible);
}
function f_layer_flood_update(sel) {
	"use strict";
	var feet = sel.options[sel.selectedIndex].value;
	if (feet === "0") {
		M_meri.getLayer("LD_flooding").setVisibleLayers([-1]);
	} else {
		M_meri.getLayer("LD_flooding").setVisibleLayers([feet]);
	}
}
function f_add_layer_handler(chk) {
	chk.addEventListener("change", function () {
		f_layer_list_update(this);
		legendDigit.refresh();
	});
}
function f_layer_list_build() {
	"use strict";
	var dropdown1 = document.getElementById("dropdown1"),
		e_li_0 = document.createElement("li"),
		e_sel_flood,
		mapLayersJSON = layers_json,
		map_layers_flooding_json = f_getFloodInfo(),
		e_li,
		e_label,
		e_chk,
		e_title,
		index1,
		index2,
		length1,
		length2,
		scenario,
		group,
		layer,
		found = false;
	dropdown1.appendChild(e_li_0);
	e_sel_flood = document.createElement("select");
	e_sel_flood.className = "select_option";
	e_li_0.appendChild(e_sel_flood);
	e_sel_flood.addEventListener("change", function () {
		f_layer_flood_update(this);
		legendDigit.refresh();
	});
	e_sel_flood.innerHTML = '<option value="0">No tidal surge</option>';
	length1 = map_layers_flooding_json.length;
	for(index1 = 0; index1 < length1; index1 += 1) {
	scenario = map_layers_flooding_json[index1];
		e_sel_flood.innerHTML += '<option value="' + scenario.id + '">' + scenario.name + '</option>';
	}
	if(ERIS) {
		f_startup_eris();
	}
	length1 = mapLayersJSON.layers.length;
	for(index1 = 0; index1 < length1; index1 += 1) {
		group = mapLayersJSON.layers[index1];
		e_title = document.createElement("li");
		e_title.innerHTML = group.name;
		e_title.className = "layer_group_title";
		dropdown1.appendChild(e_title);
		length2 = group.layers.length;
		for(index2 = 0; index2 < length2; index2 += 1) {
			layer = group.layers[index2];
			e_li = document.createElement("li");
			e_li.className = "toc_layer_li";
			dropdown1.appendChild(e_li);
			e_label = document.createElement("label");
			e_label.className =  "toc_layer_label";
			e_label.innerHTML = layer.name.toLowerCase();
			e_li.appendChild(e_label);
			e_chk = document.createElement("input");
			e_chk.type = "checkbox";
			e_chk.className =  "toc_layer_check";
			e_chk.value = layer.id;
			e_label.appendChild(e_chk);
			f_add_layer_handler(e_chk);
			if (layer.vis) {
				e_chk.checked = true;
				e_li.className = "toc_layer_li li_checked";
			}
			if (!found && layer.name.toLowerCase() === "buildings") {
				e_chk.id = "buildings";
				found = true;
			}
			if (layer.ident || (layer.id === 30)) {
				IP_Identify_Layers.push(layer.id);
			}
		}
	}
}
function f_query_owner_int_exec(ownerid) {
	"use strict";
	require(["esri/tasks/QueryTask", "esri/tasks/RelationshipQuery", "esri/tasks/query"], function (QueryTask, RelationshipQuery, Query) {
		var findparcels = document.getElementById("find_" + ownerid),
			QT_owner_int,
			Q_owner_int,
			QT_parcel_selection,
			outFields_json = f_getoutFields();
		console.log(ownerid);
		if (findparcels.innerHTML === "Find Owner Parcels") { //Owner
			QT_owner_int = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_intermediate);
			QT_parcel_selection = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_parcel);
			Q_owner_int = new Query();
			Q_owner_int.where = "Where OWNERID = " + ownerid;
			QT_owner_int.executeForIds(Q_owner_int, function (results) {
				if (results) {
					console.log(results[0]);
					console.log(parcels_json.tables.gis_sde_tbl_cad_intermediate);
					var QT_owner_parcels = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_intermediate),
						Q_owner_parcels = new RelationshipQuery(),
						Q_parcel_selection = new Query();
					Q_owner_parcels.relationshipId = 4;
					Q_owner_parcels.returnGeometry = true;
					Q_owner_parcels.objectIds = results;
					Q_owner_parcels.outFields = ["PID"];
					Q_parcel_selection.outSpatialReference = {wkid: 3857};
					Q_parcel_selection.returnGeometry = true;
					Q_parcel_selection.outFields = outFields_json.parcel;
					console.log(Q_owner_parcels);
					QT_owner_parcels.executeRelationshipQuery(Q_owner_parcels, function (featureSets) {
						console.log('here');
						console.log(featureSets);

						//TEMPORARYFIX Above query tasks might not matter
						  $.ajax({
						  	url: 'http://arcgis5.njmeadowlands.gov/webmaps/rest/services/Parcels/NJMC_Parcels_2011/MapServer/8/query?where=&text=&objectIds='+results+'&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=PID&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson',
						  	type: 'GET',
						  	dataType: 'json',
						  	success: function(data,textStatus,xhr) {
						  		// console.log(data.features[0].attributes['PID']);
								var where_PID = "PID IN (";
								for(var i=0; i < data.features.length; i++) {
									where_PID += "'" + data.features[i].attributes['PID'] + "',";
						  		}
								where_PID = where_PID.substring(0, where_PID.length - 1);
								where_PID += ")";
								console.log(where_PID);
								Q_parcel_selection.where = where_PID;
								QT_parcel_selection.execute(Q_parcel_selection, function (results) {
									f_process_results_parcel(results, "owner_" + ownerid);
								});
								Q_parcel_selection.where = "";
							  		


						  	},
						  });




						// var where_PID = "PID IN (",
						// 	featureSet,
						// 	i,
						// 	il;
						// for (featureSet in featureSets) {
						// 	if (featureSets.hasOwnProperty(featureSet)) {
						// 		for (i = 0, il = featureSets[featureSet].features.length; i < il; i += 1) {
						// 			console.log('featureset crap:' + featureSets[featureSet].features[i].attributes.PID);
						// 			where_PID += "'" + featureSets[featureSet].features[i].attributes.PID + "',";
						// 			console.log('where pid: ' + where_PID);

						// 		}
						// 	}
						// }
						// where_PID = where_PID.substring(0, where_PID.length - 1);
						// where_PID += ")";
						// console.log(where_PID);
						// Q_parcel_selection.where = where_PID;

						// QT_parcel_selection.execute(Q_parcel_selection, function (results) {
						// 	f_process_results_parcel(results, "owner_" + ownerid);
						// });
						// Q_parcel_selection.where = "";
					}, function(err){console.log(err);});
				}
			});
			findparcels.onclick = function (e) {
				var toElem = e.originalTarget || e.toElement || e.srcElement;
				toElem.innerHTML = "Find Owner Parcels";
				toElem.onclick = null;
				toElem.onclick = function () {
					f_query_owner_int_exec(ownerid);
					return false;
				};
				f_hide_owner_parcels(ownerid);
				
			};
			findparcels.innerHTML = "Hide Owner Parcels";
		}
	});
}

function f_query_owner_int_exec2test(pid) { //once ownerid
	"use strict";
	require(["esri/tasks/QueryTask", "esri/tasks/RelationshipQuery", "esri/tasks/query"], function (QueryTask, RelationshipQuery, Query) {
		var findparcels = document.getElementById("find_" + pid),
			QT_owner_int,
			Q_owner_int,
			QT_parcel_selection,
			outFields_json = f_getoutFields();
		console.log(pid);
		if (findparcels.innerHTML === "Find Owner Parcels") { 
			//QT_owner_int = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_intermediate);
			QT_owner_int = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_building);
			QT_parcel_selection = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_parcel);
			Q_owner_int = new Query();
			Q_owner_int.where = "Where PID = " + pid;
			QT_owner_int.executeForIds(Q_owner_int, function (results) {
				if (results) {
					console.log(results[0]);
					console.log(parcels_json.tables.gis_sde_tbl_cad_intermediate);
					var QT_owner_parcels = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_intermediate),
						Q_owner_parcels = new RelationshipQuery(),
						Q_parcel_selection = new Query();
					Q_owner_parcels.relationshipId = 4;
					Q_owner_parcels.returnGeometry = true;
					Q_owner_parcels.objectIds = results;
					Q_owner_parcels.outFields = ["PID"];
					Q_parcel_selection.outSpatialReference = {wkid: 3857};
					Q_parcel_selection.returnGeometry = true;
					Q_parcel_selection.outFields = outFields_json.parcel;
					console.log(Q_owner_parcels);
					QT_owner_parcels.executeRelationshipQuery(Q_owner_parcels, function (featureSets) {
						console.log('here');
						console.log(featureSets);

						//TEMPORARYFIX Above query tasks might not matter
						  $.ajax({
						  	url: 'http://arcgis5.njmeadowlands.gov/webmaps/rest/services/Parcels/NJMC_Parcels_2011/MapServer/8/query?where=&text=&objectIds='+results+'&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=PID&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson',
						  	type: 'GET',
						  	dataType: 'json',
						  	success: function(data,textStatus,xhr) {
						  		// console.log(data.features[0].attributes['PID']);
								var where_PID = "PID IN (";
								for(var i=0; i < data.features.length; i++) {
									where_PID += "'" + data.features[i].attributes['PID'] + "',";
						  		}
								where_PID = where_PID.substring(0, where_PID.length - 1);
								where_PID += ")";
								console.log(where_PID);
								Q_parcel_selection.where = where_PID;
								QT_parcel_selection.execute(Q_parcel_selection, function (results) {
									f_process_results_parcel(results, "owner_" + pid);
								});
								Q_parcel_selection.where = "";
							  		


						  	},
						  });




						// var where_PID = "PID IN (",
						// 	featureSet,
						// 	i,
						// 	il;
						// for (featureSet in featureSets) {
						// 	if (featureSets.hasOwnProperty(featureSet)) {
						// 		for (i = 0, il = featureSets[featureSet].features.length; i < il; i += 1) {
						// 			console.log('featureset crap:' + featureSets[featureSet].features[i].attributes.PID);
						// 			where_PID += "'" + featureSets[featureSet].features[i].attributes.PID + "',";
						// 			console.log('where pid: ' + where_PID);

						// 		}
						// 	}
						// }
						// where_PID = where_PID.substring(0, where_PID.length - 1);
						// where_PID += ")";
						// console.log(where_PID);
						// Q_parcel_selection.where = where_PID;

						// QT_parcel_selection.execute(Q_parcel_selection, function (results) {
						// 	f_process_results_parcel(results, "owner_" + ownerid);
						// });
						// Q_parcel_selection.where = "";
					}, function(err){console.log(err);});
				}
			});
			findparcels.onclick = function (e) {
				var toElem = e.originalTarget || e.toElement || e.srcElement;
				toElem.innerHTML = "Find Owner Parcels";
				toElem.onclick = null;
				toElem.onclick = function () {
					f_query_owner_int_exec(pid);
					return false;
				};
				f_hide_owner_parcels(pid);
				
			};
			findparcels.innerHTML = "Hide Owner Parcels";
		}
	});
}

function f_query_owner_int_exec2(pid) { //once ownerid
	"use strict";
	require(["esri/tasks/QueryTask", "esri/tasks/RelationshipQuery", "esri/tasks/query"], function (QueryTask, RelationshipQuery, Query) {
		var findparcels = document.getElementById("find_" + pid),
			QT_owner_int,
			Q_owner_int,
			QT_parcel_selection,
			outFields_json = f_getoutFields();
		console.log(pid);
		if (findparcels.innerHTML === "Find Owner Parcels") { 
			//QT_owner_int = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_intermediate);
			QT_owner_int = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_building);
			QT_parcel_selection = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.layers.gis_sde_parcel);
			Q_owner_int = new Query();
			Q_owner_int.where = "Where PID = " + pid;
			QT_owner_int.executeForIds(Q_owner_int, function (results) {
				if (results) {
					console.log(results[0]);
					console.log(parcels_json.tables.gis_sde_tbl_cad_intermediate);
					var QT_owner_parcels = new QueryTask(DynamicLayerHost + "/rest/services/Parcels/NJMC_Parcels_2011/MapServer/" + parcels_json.tables.gis_sde_tbl_cad_intermediate),
						Q_owner_parcels = new RelationshipQuery(),
						Q_parcel_selection = new Query();
					Q_owner_parcels.relationshipId = 4;
					Q_owner_parcels.returnGeometry = true;
					Q_owner_parcels.objectIds = results;
					Q_owner_parcels.outFields = ["PID"];
					Q_parcel_selection.outSpatialReference = {wkid: 3857};
					Q_parcel_selection.returnGeometry = true;
					Q_parcel_selection.outFields = outFields_json.parcel;
					console.log(Q_owner_parcels);
					QT_owner_parcels.executeRelationshipQuery(Q_owner_parcels, function (featureSets) {
						console.log('here');
						console.log(featureSets);

						//TEMPORARYFIX Above query tasks might not matter
						  $.ajax({
						  	url: 'http://arcgis5.njmeadowlands.gov/webmaps/rest/services/Parcels/NJMC_Parcels_2011/MapServer/8/query?where=&text=&objectIds='+results+'&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=PID&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson',
						  	type: 'GET',
						  	dataType: 'json',
						  	success: function(data,textStatus,xhr) {
						  		// console.log(data.features[0].attributes['PID']);
								var where_PID = "PID IN (";
								for(var i=0; i < data.features.length; i++) {
									where_PID += "'" + data.features[i].attributes['PID'] + "',";
						  		}
								where_PID = where_PID.substring(0, where_PID.length - 1);
								where_PID += ")";
								console.log(where_PID);
								Q_parcel_selection.where = where_PID;
								QT_parcel_selection.execute(Q_parcel_selection, function (results) {
									f_process_results_parcel(results, "owner_" + pid);
								});
								Q_parcel_selection.where = "";
							  		


						  	},
						  });




						// var where_PID = "PID IN (",
						// 	featureSet,
						// 	i,
						// 	il;
						// for (featureSet in featureSets) {
						// 	if (featureSets.hasOwnProperty(featureSet)) {
						// 		for (i = 0, il = featureSets[featureSet].features.length; i < il; i += 1) {
						// 			console.log('featureset crap:' + featureSets[featureSet].features[i].attributes.PID);
						// 			where_PID += "'" + featureSets[featureSet].features[i].attributes.PID + "',";
						// 			console.log('where pid: ' + where_PID);

						// 		}
						// 	}
						// }
						// where_PID = where_PID.substring(0, where_PID.length - 1);
						// where_PID += ")";
						// console.log(where_PID);
						// Q_parcel_selection.where = where_PID;

						// QT_parcel_selection.execute(Q_parcel_selection, function (results) {
						// 	f_process_results_parcel(results, "owner_" + ownerid);
						// });
						// Q_parcel_selection.where = "";
					}, function(err){console.log(err);});
				}
			});
			findparcels.onclick = function (e) {
				var toElem = e.originalTarget || e.toElement || e.srcElement;
				toElem.innerHTML = "Find Owner Parcels";
				toElem.onclick = null;
				toElem.onclick = function () {
					f_query_owner_int_exec(pid);
					return false;
				};
				f_hide_owner_parcels(pid);
				
			};
			findparcels.innerHTML = "Hide Owner Parcels";
		}
	});
}



(function() {
	"use strict";
	require(["esri/toolbars/navigation", "esri/tasks/GeometryService", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/GraphicsLayer", "esri/map", "dojo/on", "esri/dijit/Measurement", "esri/config", "esri/dijit/PopupMobile", "esri/dijit/Popup", "esri/dijit/LocateButton", "esri/dijit/Scalebar", "esri/dijit/Legend","esri/dijit/Geocoder",  "esri/graphic", "esri/symbols/SimpleMarkerSymbol","esri/geometry/screenUtils", "dojo/dom","dojo/dom-construct","dojo/query","dojo/_base/Color","dojo/domReady!"] , function (Navigation, GeometryService, ArcGISDynamicMapServiceLayer, GraphicsLayer, Map, on, Measurement, config, PopupMobile, Popup, LocateButton, scalebar, Legend, Geocoder, Graphic, SimpleMarkerSymbol, screenUtils, dom, domConstruct, query, Color) {
		config.defaults.io.alwaysUseProxy = false;
		config.defaults.io.proxyUrl = DynamicLayerHost + "/proxy/proxy.ashx"; // set the default geometry service
		config.defaults.geometryService = new GeometryService(DynamicLayerHost + "/rest/services/Utilities/Geometry/GeometryServer");
		// set dynamic layer for MunicipalMap_live
		var LD_button = new ArcGISDynamicMapServiceLayer(DynamicLayerHost + "/rest/services/Municipal/MunicipalMap_live/MapServer", {opacity: 0.75, id: "LD_button"}),
			LD_flooding = new ArcGISDynamicMapServiceLayer(DynamicLayerHost + "/rest/services/Flooding/20131023_FloodingBaseMap/MapServer", {opacity: 0.65, id: "LD_flooding"}),
			e_info = document.createElement("div"),
			infowindow,
			GL_parcel_selection = new GraphicsLayer({opacity: 0.60, id: "GL_parcel_selection"}),
			GL_buffer_buffer = new GraphicsLayer({opacity: 0.60, id: "GL_buffer_buffer"}),
			GL_buffer_parcel = new GraphicsLayer({opacity: 0.60, id: "GL_buffer_parcel"}),
			GL_buffer_selected_parcels = new GraphicsLayer({opacity: 0.60, id: "GL_buffer_selected_parcels"});
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
			infowindow = new PopupMobile(null, e_info);
		} else {
			infowindow = new Popup({
				hightlight: false,
				titleInBody: true
			}, e_info);
		}
		M_meri = new Map("map", {
			basemap: "satellite",
			center: [-74.08456781356876, 40.78364440736023],
			zoom: 12,
			sliderStyle: "small",
			optimizePanAnimation: true,
			fadeOnZoom: true,
			logo: false,
			minZoom: 12,
			infoWindow: infowindow
		});
		geocoder = new Geocoder({
			arcgisGeocoder: {
				placeholder: "Type Street Address",
				sourceCountry: "USA"
			},
			map: M_meri,
			autoComplete: true,
        }, "search2");

		geocoder.on("select", showLocation);

		function showLocation(evt) {
			M_meri.graphics.clear();
			var point = evt.result.feature.geometry;
			var symbol = new SimpleMarkerSymbol()
			.setStyle("square")
			.setColor(new Color([255,0,0,0.5]));
			var graphic = new Graphic(point, symbol);
			M_meri.graphics.add(graphic);
		}


		scalebar({
			map: M_meri,
			attachTo: "bottom-left"
		});
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
			locateButton = new LocateButton({
				map: M_meri,
				scale: 19
			}, "locate");
			locateButton.startup();
		}
		on(M_meri, "click", function (e) {
			f_map_click_handler(this,e);
		});
		on.once(M_meri, "load", function () {
			LD_flooding.setDPI(72, false);
			M_meri.addLayers([LD_flooding, LD_button]);
			M_meri.addLayer(GL_parcel_selection);
			M_meri.addLayer(GL_buffer_selected_parcels);
			M_meri.addLayer(GL_buffer_parcel);
			M_meri.addLayer(GL_buffer_buffer);
			navToolbar = new Navigation(M_meri);
			measurementDijit = new Measurement({map: M_meri}, document.getElementById("dMeasureTool"));
			measurementDijit.startup();
			f_load_tools();
		});
		on.once(LD_button, "load", function () {
			f_layer_list_build();
			legendLayers.push({layer: LD_button, title: "Map Layers", hideLayers: [2, 12, 18]});
			legendLayers.push({layer: LD_flooding, title: "Flooding Layers"});
			legendDigit = new Legend({
				map: M_meri,
				layerInfos: legendLayers
			}, "legend_li");
			legendDigit.startup();
			document.getElementsByClassName("header-container")[0].style.display = "block";
		});
		on.once(LD_button, "update-end", function () {
			if(ERIS) {
				document.getElementById("buildings").click();
			}
		});
	});
}());
$(document).ready(function() {
	$("#xout").click(function() {
		var pop = document.getElementById("pop");
        pop.style.visibility='hidden';
	});

});
