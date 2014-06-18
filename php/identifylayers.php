<?php
	require('dbConnection.php');
	$ip = ipCon();
	$uName = uName();
	$pwd = pwd();
	$dbName = dbName();
	$point = json_decode($_POST['json']);
	$extent = json_decode($_POST['extent']);
	unset($point->type);
	unset($extent->_parts);
	$url = "http://arcgis5/webmaps/rest/services/Utility/20140430_DPW_Assets/MapServer/identify?f=json&geometry=".urlencode(json_encode($point))."&tolerance=9&returnGeometry=false&mapExtent=".urlencode(json_encode($extent))."&imageDisplay=1280%2C629%2C96&geometryType=esriGeometryPoint&sr=102100&layers=visible";
	$curl = curl_init();
	curl_setopt_array($curl, array(
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_URL => $url,
	));
	$response = curl_exec($curl);
	$response = json_decode($response);	
	curl_close($curl);
	if($response !== null)
	{
		$layers = $response->results;
		$mysqli = mysqli_connect($ip,$uName,$pwd,$dbName) or die(mysql_error());
		$json = array();
		foreach($layers as $layer) {
			if($layer->layerName == "Catchbasin") {
				$catchbasin = $layer->attributes;
				$query = "SELECT * from `basin_attributes` WHERE `facilityid` ='".mysqli_real_escape_string($mysqli, $catchbasin->FacilityID)."'";
				$res = mysqli_query($mysqli, $query);
				$row = mysqli_fetch_assoc($res);
				$json['layer'] = $layer->layerName;
				$json['basin#'] = $catchbasin->FacilityID;
				$json['length'] = "";
				$json['width'] = "";
				$json['depth'] = "";
				$json['size'] = "";
				$json['address'] = ""; 
				$json['line_size'] = "";
				$json['drains_to'] = "";
				$json['ownedBy'] = "";
				$json['muni'] = "";
				$json['locDesc'] = "";
				$json['CBType'] = "";
				$json['rimEl'] = "";
				$json['accDia'] = "";
				$json['accMat'] = "";
				$json['accType'] = "";
				$json['inverEl'] = "";
				$json['comments'] = "";
			
				
				if($row["cblength"] != "0") {
					$json['length'] = $row["cblength"];
				} else if($catchbasin->CBLength != "Null") {
					$json['length'] = $catchbasin->CBLength;
				}

				if($row["cbwidth"] != "0" ) {
					$json['width'] = $row["cbwidth"];
				} else if($catchbasin->CBWidth != "Null") {
					$json['width'] = $catchbasin->CBWidth;
				}
				if($row['depth'] != "0") {
					$json['depth'] = $row['depth'];
				}
				if($row['size'] != "") {
					$json['size'] = $row['size'];
				}
				if($row['OwnedBy'] != "") {
					$json['ownedBy'] = $row['OwnedBy'];
				} else if($catchbasin->OwnedBy != "Null") {
					$json['ownedBy'] = $catchbasin->OwnedBy;
				} 
				if($row['Municipality'] != "") {
					$json['muni'] = $row['Municipality'];
				} else if($catchbasin->Municipality != "Null") {
					$json['muni'] = $catchbasin->Municipality;
				} 
				if($row['LocationDescription'] != "") {
					$json['locDesc'] = $row['LocationDescription'];
				} else if($catchbasin->LocationDescription != "Null") {
					$json['locDesc'] = $catchbasin->LocationDescription;
				}  
				if($row['CBType'] != "") {
					$json['CBType'] = $row['CBType'];
				} else if($catchbasin->CBType != "Null") {
					$json['CBType'] = $catchbasin->CBType;
				} 
				if($row['RimElevation'] != 0) {
					$json['rimEl'] = $row['RimElevation'];
				} else if($catchbasin->RimElevation != 0) {
					$json['rimEl'] = $catchbasin->RimElevation;
				} 
				if($row['AccessDiameter'] != 0) {
					$json['accDia'] = $row['AccessDiameter'];
				} else if($catchbasin->AccessDiameter != 0) {
					$json['accDia'] = $catchbasin->AccessDiameter; 
				}
				if($row['AccessMaterial'] != "") {
					$json['accMat'] = $row['AccessMaterial'];
				} else if ($catchbasin->AccessMaterial != "Null") {
					$json['accMat'] = $catchbasin->AccessMaterial;
				} 
				if($row['AccessType'] != "") {
						$json['accType'] = $catchbasin->AccesType;
				} else if ($catchbasin->AccesType != "Null") {
					$json['accType'] = $row['AccessType'];
				}  
				if ($row['InvertElevation'] != "") {
					$json['inverEl'] = $row['InvertElevation'];
				} else if($catchbasin->InvertElevation != "Null") {
					$json['inverEl'] = $catchbasin->InvertElevation;
				} 
				if($row['Comments'] != "") {
					$json['comments'] = $row['Comments'];
				} else if ($catchbasin->Comments != "Null") {
					$json['comments'] = $catchbasin->Comments;
				} 
			
				$json['address'] = $row['address'];
				$json['line_size'] = $row["line_size"];
				$json['drains_to'] = $row["drains_to"];
				$json['condition'] = $row["condition"];
					

				
			
				echo json_encode($json);
				
			} else if($layer->layerName == "Storm Water Manhole") { 
				$manhole = $layer->attributes;
				$query = "SELECT * from `man_attributes` WHERE `facilityid` ='".mysqli_real_escape_string($mysqli, $manhole->FacilityID)."'";
				$res = mysqli_query($mysqli, $query);
				$row = mysqli_fetch_assoc($res);
				$json['layer'] = $layer->layerName;
				$json['manhole#'] = $manhole->FacilityID;
				$json['topRimEl'] = "";
				$json['address'] = ""; 
				$json['condition'] = "";
				$json['ownedBy'] = "";
				$json['muni'] = "";
				$json['locDesc'] = "";
				$json['accDia'] = "";
				$json['accType'] = "";
				$json['groundType'] = "";
				$json['hpe'] = "";
				$json['rimEl'] = "";
				$json['inverEl'] = "";
				$json['manholeDrop'] = "";
				$json['interDrop'] = "";
				$json['wallMat'] = "";
				$json['structShape'] = "";
				$json['manholeType'] = "";
				$json['metered'] = "";
				$json['comments'] = "";

				

 
				if($row['OwnedBy'] != "") {
					$json['ownedBy'] = $row['OwnedBy'];
				} else if ($manhole->OwnedBy != "Null") {
					$json['ownedBy'] = $manhole->OwnedBy;
				}  
				if($row['Municipality'] != "") {
					$json['muni'] = $row['Municipality'];
				} else if ($manhole->Municipality != "Null") {
					$json['muni'] = $manhole->Municipality;
				} 
				if ($row['LocationDescription'] != "") {
					$json['locDesc'] = $row['LocationDescription'];
				} else if ($manhole->LocationDescription != "Null") {
					$json['locDesc'] = $manhole->LocationDescription;
				} 
				if($row['AccessDiameter'] != "") {
					$json['accDia'] = $row['AccessDiameter'];
				} else if ($manhole->AccessDiameter != "Null") { 
					$json['accDia'] = $manhole->AccessDiameter;
				} 
				if ($row['AccessType'] != "") {
					$json['accType'] = $row['AccessType'];
				} else if ($manhole->AccessType != "Null") {
					$json['accType'] = $manhole->AccessType; 
				} 
				if ($row['GroundType'] != "") {
					$json['groundType'] = $row['GroundType'];
				} else if ($manhole->GroundType != "Null") {
					$json['groundType'] = $manhole->GroundType;
				} 
				if ($row['HighPipeElevation'] != "") {
					$json['hpe'] = $row['HighPipeElevation'];
				} else if ($manhole->HighPipeElevation != "Null") {
					$json['hpe'] = $manhole->HighPipeElevation;
				} 
				if ($row['RimElevation'] != "") {
					$json['rimEl'] = $row['RimElevation'];
				} else if ($manhole->RimElevation != "Null") {
					$json['rimEl'] = $manhole->RimElevation;
				} 
				if ($row['InvertElevation'] != "") {
					$json['inverEl'] = $row['InvertElevation'];
				} else if ($manhole->InvertElevation != "Null") {
					$json['inverEl'] = $manhole->InvertElevation;
				} 
				if ($row['ManholeDrop'] != "") {
					$json['manholeDrop'] = $row['ManholeDrop'];
				} else if ($manhole->ManholeDrop != "Null") {
					$json['manholeDrop'] = $manhole->ManholeDrop;
				} 
				if ($row['InteriorDrop'] != "") {
					$json['interDrop'] = $row['InteriorDrop'];
				} else if ($manhole->InteriorDrop != "Null") {
					$json['interDrop'] = $manhole->InteriorDrop;
				} 
				if ($row['WallMaterial'] != "") {
					$json['wallMat'] = $row['WallMaterial'];
				} else if ($manhole->WallMaterial != "Null") {
					$json['wallMat'] = $manhole->WallMaterial;
				} 
				if ($row['StructuralShape'] != "") {
					$json['structShape'] = $row['StructuralShape'];
				} else if ($manhole->StructuralShape != "Null") {
					$json['structShape'] = $manhole->StructuralShape;
				} 
				if ($row['ManholeType'] != "") {
					$json['manholeType'] = $row['ManholeType'];
				} else if ($manhole->ManholeType != "Null") {
					$json['ManholeType'] = $manhole->ManholeType;
				} 
				if ($row['Metered'] != "") {
					$json['metered'] = $row['Metered'];
				} else if ($manhole->Metered != "Null") {
					$json['metered'] = $manhole->Metered;
				} 
				if ($row['Comments'] != "") {
					$json['comments'] = $row['Comments'];
				} else if ($manhole->Comments != "Null") {
					$json['comments'] = $manhole->Comments;
				} 

				$json['topRimEl'] = $row['topRimEl'];
				$json['address'] = $row['address']; 
				$json['condition'] = $row['condition'];
				




				echo json_encode($json);
			} else if($layer->layerName == "Outfall") {
				$outfall = $layer->attributes;
				$query = "SELECT * from `outfall_attributes` WHERE `facilityid` ='".mysqli_real_escape_string($mysqli, $outfall->FacilityID)."'";
				$res = mysqli_query($mysqli, $query);
				$row = mysqli_fetch_assoc($res);
				$json['layer'] = $layer->layerName;
				$json['oid'] = $outfall->FacilityID;
				$json['ownedBy'] = "";
				$json['muni'] = "";
				$json['locDesc'] = "";
				$json['material'] = "";
				$json['recWater'] = "";
				$json['dia'] = ""; 
				$json['comments'] = "";


				if ($row['OwnedBy'] != "") {
					$json['ownedBy'] = $row['OwnedBy'];
				} else if ($outfall->OwnedBy != "Null") {
					$json['ownedBy'] = $outfall->OwnedBy;
				}
				if ($row['Municipality'] != "") {
					$json['muni'] = $row['Municipality'];
				} else if ($outfall->Municipality != "Null") {
					$json['muni'] = $outfall->Municipality;
				}
				if ($row['LocationDescription'] != "") {
					$json['locDesc'] = $row['LocationDescription'];
				} else if ($outfall->LocationDescription != "Null") {
					$json['locDesc'] = $outfall->LocationDescription;
				}
				if ($row['Material'] != "") {
					$json['material'] = $row['Material'];
				} else if ($outfall->Material != "Null") {
					$json['material'] = $outfall->Material;
				}
				if ($row['ReceivingWater'] != "") {
					$json['recWater'] = $row['ReceivingWater'];
				} else if ($outfall->ReceivingWater != "Null") {
					$json['recWater'] = $outfall->ReceivingWater;
				}
				if ($row['Diameter'] != "") {
					$json['dia'] = $row['Diameter'];
				} else if ($outfall->Diameter != "Null") {
					$json['dia'] = $outfall->Diameter;
				}
				if ($row['Comments'] != "") {
					$json['comments'] = $row['Comments'];
				} else if ($outfall->Comments != "Null") {
					$json['comments'] = $outfall->Comments;
				}

				echo json_encode($json);
			} else if($layer->layerName == "Storm Water Gravity Main") {
				$sline = $layer->attributes;
				$query = "SELECT * from `stormline_attributes` WHERE `FacilityID` ='".mysqli_real_escape_string($mysqli, $sline->FacilityID)."'";
				$res = mysqli_query($mysqli, $query);
				$row = mysqli_fetch_assoc($res);
				$json['layer'] = $layer->layerName;
				$json['slid'] = $sline->FacilityID;
				$json['ownedBy'] = "";
				$json['muni'] = "";
				$json['material'] = "";
				$json['css'] = "";
				$json['dia'] = "";
				$json['height'] = "";
				$json['width'] = "";
				$json['usi'] = "";
				$json['dsi'] = "";

				if ($row['OwnedBy'] != "") {
					$json['ownedBy'] = $row['OwnedBy'];
				} else if ($sline->OwnedBy != "Null") {
					$json['ownedBy'] = $sline->OwnedBy;
				}
				if ($row['Municipality'] != "") {
					$json['muni'] = $row['Municipality'];
				} else if ($sline->Municipality != "Null") {
					$json['muni'] = $sline->Municipality;
				}
				if ($row['Material'] != "") {
					$json['material'] = $row['Material'];
				} else if ($sline->Material != "Null") {
					$json['material'] = $sline->Material;
				}
				if ($row['CrossSectionShape'] != "") {
					$json['css'] = $row['CrossSectionShape'];
				} else if ($sline->CrossSectionShape != "Null") {
					$json['css'] = $sline->CrossSectionShape;
				} 
				if ($row['Diameter'] != "") {
					$json['dia'] = $row['Diameter'];
				} else if ($sline->Diameter != "Null") {
					$json['dia'] = $sline->Diameter;
				}
				if ($row['Height'] != "") {
					$json['height'] = $row['Height'];
				} else if ($sline->Height != "Null") {
					$json['height'] = $sline->Height;
				}
				if ($row['Width'] != "") {
					$json['width'] = $row['Width'];
				} else if ($sline->Width != "Null") {
					$json['width'] = $sline->Width;
				}
				if ($row['UpStreamInvert'] != "") {
					$json['usi'] = $row['UpStreamInvert'];
				} else if ($sline->UpstreamInvert != "Null") {
					$json['usi'] = $sline->UpstreamInvert;
				}
				if ($row['DownStreamInvert'] != "") {
					$json['dsi'] = $row['DownStreamInvert']; 
				} else if($sline->DownstreamInvert != "Null") {
					$json['dsi'] = $sline->DownstreamInvert;
				} 

				echo json_encode($json);
			}

		}
	}
?>
