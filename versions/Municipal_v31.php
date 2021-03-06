<!DOCTYPE html>
<html class="no-js">
	<head>
		<meta charset="utf-8">
		<title>New Jersey Meadowlands Commission &raquo; Municipal Map v.31 </title>
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="author" content="Jose Baez - Intern Web Developer">
		<link rel="stylesheet" href="css/normalize.min.css">
		<link rel="stylesheet" type="text/css" href="http://js.arcgis.com/3.9/js/esri/css/esri.css">
		<link rel="stylesheet" href="css/main.css">
<?php if ($_SESSION['isERIS']): ?>
		<link rel="stylesheet" href="css/ERIS.css">
<?php endif ?>
<?php if ($_SESSION['isMobile']): ?>
		<link rel="stylesheet" href="css/mobile.css">
<?php endif ?>
<?php if ($_SESSION['ios']): ?>
		<meta content='yes' name='apple-mobile-web-app-capable'>
		<meta content='white-translucent' name='apple-mobile-web-app-status-bar-style'>
		<link rel='stylesheet' href="css/ios.css">
<?php endif ?>
<script>
<?php if($_SESSION['isMobile']): ?>
	var ismobile = true;
	console.log(ismobile);
<?php else: ?>
	var ismobile = false;
	console.log(ismobile);
<?php endif ?>
</script>
		<link rel="icon" type="image/ico" href="css/img/favicon.ico">
		<link rel="apple-touch-icon" href="css/img/map-logo-57x57.png">
		<link rel="apple-touch-icon" sizes="72x72" href="css/img/map-logo-72x72.png">
		<link rel="apple-touch-icon" sizes="114x114" href="css/img/map-logo-114x114.png">
		<script>
<?php if($_SESSION['isERIS']): ?>
			var ERIS = true,
				userName = <?php require_once('../ERIS/validate.php'); echo '"'.decryptCookie($_COOKIE['ERIS_ACCOUNT']).'";';?>		
<?php else: ?>
			var ERIS = false;
<?php endif ?>
		</script>
		<script>
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', 'UA-37047196-3', 'njmeadowlands.gov');
			ga('send', 'pageview');
		</script>
	</head>
	<body>
	<div>	
		<div id="pop" class="mypop" style="visibility: none">
		  <div style="height: 30px"><div id="selTitle" style="float: left;"></div><button type="button" id="xout" style="float: right"><b>X</b></button></div>
		  <div id="popcon"></div>
		</div>
	</div>
		<noscript>Sorry, but in order to use Municipal Map you need JavaScript enabled</noscript>
		<div id = "body">
			<div class="header-container" style="display:none">
				<header class="wrapper clearfix">
					<a href="javascript:void(0);" id="pull" class="pull"></a>
<?php if ($_SESSION['isERIS']): ?>
					<img class="logo" id="logo" src="css/img/logo_ERIS.png" alt="Municipal Map">
<?php else: ?>
					<img class="logo" id="logo" src="css/img/logo_municipal_map.png" alt="Municipal Map">
<?php endif ?>
					<nav id="buttons" class="navbar buttons">
						<ul class="ul_buttons">
							<li class="button_row">
								<button id="zoomin"  title="Zoom In" class="zoomin tiny secondary toolbutton"></button>
								<button id="zoomout" title="Zoom Out" class="zoomout tiny secondary toolbutton"></button>
								<button id="extent" title="Zoom Full extent" class="extent tiny secondary toolbutton"></button>
								<button id="previous" title="Zoom Previous extent" class="previous tiny secondary toolbutton"></button>
								<button id="next" title="Zoom Next extent" class="next tiny secondary toolbutton"></button>
								<button id="pan" title="Pan Map" class="pan tiny secondary button_clicked toolbutton"></button>
								<button id="identify" title="Identify" class="identify tiny secondary toolbutton"></button>
								<button id="parcel" title="Parcel Select" class="parcel tiny secondary toolbutton"></button>
								<button id="utility" title="Utility Select" class="util tiny secondary toolbutton"></button>
								<button id="measure" title="Measure" class="measure tiny secondary toolbutton"></button>
<?php if ($_SESSION['isERIS']): ?>
								<button id="ERIS" title="ERIS" class="ERIS tiny secondary toolbutton"></button>
<?php endif ?>
								<button id="locate" title="Get Location" class="locate tiny secondary toolbutton"></button>
								<button id="clear" title="Clear Map" class="clear tiny secondary toolbutton"></button>
							</li>
						</ul>
					</nav>
					<nav id="nav_tabs" class="nav_tabs navbar">
						<ul class="tabs">
							<li>
								<a href="javascript:void(0);" id="layers" class="tab">Layers</a>
								<ul id="dropdown1" class="dropdown main dropdown1 animate hidden">
									<li class="layer_title">Map Layers</li>
									<li class="layer_group_title">BaseMap</li>
									<li>
										<select class="image_layer_div select_option" id="basemap_overlay">
											<option value="satellite">Default</option>
											<option value="streets">Streets</option>
											<option value="hybrid">Hybrid</option>
											<option value="topo">Topo</option>
											<option value="gray">Gray</option>
											<option value="national-geographic">National-geographic</option>
											<option value="osm">Osm</option>
										</select>
									</li>
									<li class="layer_group_title">Image Overlay</li>
									<li class="image_layer_li">
										<select id="image_overlay" class="select_option">
											<option value="">Default</option>
											<option value="IMG_1930_BW">1930 Black and White (NJDEP)</option>
											<option value="IMG_1958_BW">1958 Black and White (NJDEP)</option>
											<option value="IMG_1969_BW">1969 Black and White (NJMC)</option>
											<option value="IMG_1978_BW">1978 Black and White (NJMC)</option>
											<option value="IMG_1985_BW">1985 Black and White (NJMC)</option>
											<option value="IMG_1992_BW">1992 Black and White (NJMC)</option>
											<option value="IMG_1995-97_CIR">1995-97 Color Infrared (NJDEP)</option>
											<option value="IMG_2001_C">2001 Color (NJMC)</option>
											<option value="IMG_2002_BW">2002 Black and White (NJMC)</option>
											<option value="IMG_2002_C">2002 Color Infrared (NJDEP)</option>
											<option value="IMG_2008_C">2008 Color (NJDEP)</option>
											<option value="IMG_2009_C">2009 Color (NJMC)</option>
											<option value="IMG_2010_C">2010 Color (Hudson County)</option>
											<option value="IMG_2012_C">2012 Color (NJDEP)</option>
										</select>
									</li>
									<li class="layer_group_title">Flooding Scenario</li>
								</ul>
								<ul id="dropdown0" class="dropdown0 animate hidden">
									<li>
										<div id="dMeasureTool"></div>
									</li>
								</ul>
							</li>
							<li>
								<a href="javascript:void(0);" id="legend" class="tab">Legend</a>
								<ul id="dropdown4" class="dropdown main dropdown4 animate hidden">
									<li id="legend_li"></li>
								</ul>
							</li>
							<li>
								<a href="javascript:void(0);" id="search" class="tab">Search</a>
								<ul id="dropdown2" class="dropdown main animate hidden">
									<li>
										<label>
											<input type="radio" name="search_type" id="property_toggle" class="search_type" value="property" checked>
											<span>Property</span>
										</label>
										<label>
											<input type="radio" name="search_type" id="owner_toggle" class="search_type" value="owner">
											<span>Owner</span>
										</label>
										<label>
											<input type="radio" name="search_type" id="facsearch_toggle" class="search_type" value="facname">
											<span>FacilityName</span>
										</label>

									</li>
									<li id="li_property">
										<form id="search_property">
											<label>
												<span>Address:</span>
												<input type="text" id="address" class="input" name="address" autocomplete="off">
											</label>
											<label class="label_adj">
												<span>Block:</span>
												<input class="input_adj" type="text" id="block" name="block">
											</label>
											<label class="label_adj">
												<span>Lot:</span>
												<input class="input_adj" type="text" id="lot" name="lot">
											</label>
											<br />
											<span class="mobile_choice">Include Old block and lots:</span>
											<br />
											<label>
												<span>No</span>
												<input type="radio" name="block_type" id="block_type" value="false" checked>
												<span class="check circle"></span>
											</label>
											<label>
												<span>Yes</span>
												<input type="radio" name="block_type" value="true">
												<span class="check circle"></span>
											</label>
											<ul class="filters mobile_padding">
												<li class="property_li">
													<a href="javascript:void(0);" id="filter" class="search_toggle filter">Search Options & Filters (+)</a>
													<ul class=" dropdown filters hidden">
														<li class="li_filter">
															<label>
																<span>Select Municipalities</span>
																<input type="checkbox" name="rdo_muni_search" class="filter_check" id="rdo_muni_searchAll">
																<span class="check"></span>
															<label>
															<ul id="search_munis" class="dropdown filters search_item animate hidden">
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>Carlstadt</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0205">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>East Rutherford</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0212">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label for="chk_muni_0906" class="search_muni_label">
																		<span>Jersey City</span>
																		<input type="checkbox" id="chk_muni_0906" name="s_muni_chk_item" class="s_muni_chk_item" value="0906">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label  class="search_muni_label">
																		<span>Kearny</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0907">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>Little Ferry</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0230">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>Lyndhurst</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0232">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>Moonachie</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0237">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>North Arlington</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0239">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label for="chk_muni_0908" class="search_muni_label">
																		<span>North Bergen</span>
																		<input type="checkbox" id="chk_muni_0908" name="s_muni_chk_item" class="s_muni_chk_item" value="0908">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>Ridgefield</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0249">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>Rutherford</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0256">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label class="search_muni_label">
																		<span>Secaucus</span>
																		<input type="checkbox" name="s_muni_chk_item" class="s_muni_chk_item" value="0909">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label for="chk_muni_0259" class="search_muni_label">
																		<span>South Hackensack</span>
																		<input type="checkbox" id="chk_muni_0259" name="s_muni_chk_item" class="s_muni_chk_item" value="0259">
																	</label>
																</li>
																<li class="muniCheckRow">
																	<label for="chk_muni_0262" class="search_muni_label">
																		<span>Teterboro</span>
																		<input type="checkbox" id="chk_muni_0262" name="s_muni_chk_item" class="s_muni_chk_item" value="0262">
																	</label>
																</li>
															</ul>
														</li>
														<li class="li_filter">
															<label>
																<span>Designate District</span>
																<input type="checkbox" name="rdo_qual_search" class="filter_check" id="rdo_qual_searchAll">
																<span class="check"></span>
															</label>
															<ul id="search_qual" class="dropdown filters search_item animate hidden">
																<li class="qualCheckRow">
																	<label class="search_qual_label">
																		<span>In District</span>
																		<input type="checkbox" name="s_qual_chk_item" class="s_qual_chk_item" value="MD">
																	</label>
																</li>
																<li class="qualCheckRow">
																	<label class="search_qual_label">
																		<span>Out of District</span>
																		<input type="checkbox" name="s_qual_chk_item" class="s_qual_chk_item" value="OMD">
																	</label>
																</li>
																<li class="qualCheckRow">
																<label class="search_qual_label">
																	<span>Borderline Parcels</span>
																	<input type="checkbox" name="s_qual_chk_item" class="s_qual_chk_item" value="MD-OMD">
																</label>
																</li>
															</ul>
														</li>
														<li class="li_filter">
															<label>
																<span>Select Land Uses</span>
																<input type="checkbox" name="rdo_landuse_search" class="filter_check" id="rdo_landuse_searchAll">
																<span class="check"></span>
															</label>
															<ul id="search_landuse" class="dropdown filters search_item animate hidden">
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Commercial Office</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="CO">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Commercial Retail</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="CR">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Hotels and Motels</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="HM">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Industrial</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="IND">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Industrial Commercial Complex</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="ICC">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Public/Quasi Public Services</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="PQP">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Recreational Land</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="RL">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Residential</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="RES">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Transportation</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="TRS">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Water</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="WAT">
																	</label>
																</li>
																<li class="landuseCheckRow">
																<label class="search_landuse_label">
																	<span>Wetlands</span>
																	<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="WET">
																</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Unclassified</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="000">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Communication Utility</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="CU">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Multiple Uses</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="MU">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Open Lands</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="VAC">
																	</label>
																</li>
																<li class="landuseCheckRow">
																	<label class="search_landuse_label">
																		<span>Transitional Lands</span>
																		<input type="checkbox" class="s_landuse_chk_item" name="s_landuse_chk_item" value="TL">
																	</label>
																</li>
															</ul>
														</li>
													</ul>
												</li>
											</ul>
											<input type="submit" class="small button" value="Search for Property">
										</form>
									</li>
									<li id="li_owner" class="none">
										<form id="search_owner" onsubmit="return false;">
											<label>Owner:
												<input type="text" title="Owner Search" name="owner" class="input">
											</label>
											<input type="submit" class="small button" value="Search for Owner">
										</form>
									</li>
									<li id="li_facname" class="none">
										<form id="search_facname" onsubmit="return false;">
											<label>Facility Name:
												<input type="text" title="Facility Search" name="facname" class="input">
											</label>
											<input type="submit" class="small button" value="Search for Facility Name">
										</form>
									</li> 
									<li id="search_tally"></li>
									<li id="search_export"></li>
									<li>
										<progress value="0" id="search_progress" class="search_progress" max="1"></progress>
									</li>
								</ul>
							</li>
							<li>
								<a href="javascript:void(0);" id="selections" class="tab">Selections</a>
								<ul id="dropdown3" class="dropdown main animate hidden">
									<li class="buffer">
										<label for="buffer_distance">Buffer Distance(Feet)</label>
										<input type="text" id="buffer_distance" value="200" class="input">
									</li>
									<li class="buffer">
										<a href="javascript:void(0);" id="buffer_exe" class="selection_a buffer_exe">Execute Buffer</a>
									</li>
									<li id="parcel_export"></li>
									<li id="parcel_acres"></li>
									<li>Parcel Selections:</li>
								</ul>
							</li>
							<li>
								<a href="javascript:void(0);" id="account" class="tab">Account</a>
								<ul id="dropdown5" class="dropdown main animate hidden">
<?php if ($_SESSION['isERIS']): ?>
									<li>
										<form id="form_logoff" action="null" onsubmit="return false;" method="post">
											<div>Hi there,</div><div id="useraccount"></div>
											<div>Would you like to logoff?</div>
											<input type="submit" class="small button" value="Log Off">
										</form>
									</li>
<?php else: ?>
									<li id="li_form">
										<form id="form_submit" action="null" onsubmit="return false;" method="post">
											<label for="username">User Name:</label>
											<input type="text" class="input" name="userName" required>
											<label for="username">Password:</label>
											<input type="password" class="input" name="password" required>
											<div id="login_response"></div>
											<a href="javascript:void(0);" id="account_link" class="account_link">Forgot Password?</a>
											<input type="submit" class="small button" value="LogIn">
										</form>
									</li>
<?php endif ?>
								</ul>
							</li>
							<li>
								<a href="javascript:void(0);" id="about" class="tab">About</a>
								<ul id="dropdown6" class="dropdown main animate hidden dropdown6">
									<li>
										<a href="javascript:void(0);" class="about_a">About</a>
										<ul class="about_ul animate">
											<li>
												<p>
													This version of NJMC&#39;s Municipal Map encompasses 8 years of
													data collected about its 14-constituent towns, including
													historical to present geographic information. Municipalities
													can gain access to these layers and records about properties
													that falls within their respective municipalities and identify
													pertinent information about each property in question. The
													layers include: parcels, land use, zoning, wetlands, riparian,
													encumbrance, FEMA and much more. In addition, MERI-GIS has
													been compiling utility data from stormwater manholes to
													sanitary lines so towns can visualize and further make decision
													on existing infrastructure and conditions. Imagery accessible
													on this application ranges from the 1930's to 2012. New data
													will become available once they are complete. Visit MERI's
													webmaps periodically for timely updates.
												</p>
											</li>
										</ul>
									</li>
									<li>
										<a href="javascript:void(0);" class="about_a">Disclaimer</a>
										<ul class="about_ul animate hidden">
											<li>
												<p>
													The information contained in this site is the best available according
													to the procedures and standards of the New Jersey Meadowlands Commission
													(NJMC)/Meadowlands Environmental Research Institute Geographic Information
													Systems group (MERI-GIS) In order to maintain the quality and timeliness
													of the data, MERI-GIS regularly maintains the information in their
													databases and GIS layers. However, unintentional inaccuracies may occur.
													MERI-GIS has made every effort to present the information in a clear and
													understandable way for a variety of users. However, we cannot be responsible
													for the misuse or misinterpretation of the information presented by this
													system. Therefore, under no circumstances shall the NJMC/MERI-GIS be liable
													for any actions taken or omissions made from reliance on any information
													contained herein from whatever source nor shall the NJMC/MERI-GIS be liable
													for any other consequences from any such reliance. All data request shall be
													made directly to the GIS Department. Processing fees may apply and NJMC's
													data distribution agreement is required on all requests. The GIS Department
													can be contacted at <a href="mailto:merigis@njmeadowlands.gov" class="about_link">merigis@njmeadowlands.gov</a>
												</p>
											</li>
										</ul>
									</li>
									<li>
										<a href="javascript:void(0);" class="about_a">Help</a>
										<ul class="about_ul animate hidden">
											<li>
												<p>
													Need help using this application?<br>
													A full guide covering everything from the basics all the way up to advanced features is provided
													<a href="http://meri.njmeadowlands.gov/help/municipal-map-version-3/" class="about_link" target="_blank">here</a>.
												</p>
											</li>
										</ul>
									</li>
									<li>
										<a href="javascript:void(0);" class="about_a">Metadata</a>
										<ul class="about_ul animate hidden">
											<li>
												<p>
													Need the Metadata?<br>
													A complete listing of all the GIS data is provided
													<a href="http://apps.njmeadowlands.gov/mapping/metadata/?c=municipal" class="about_link" target="_blank">here</a>.
												</p>
											</li>
										</ul>
									</li>
									<li>
										<a href="javascript:void(0);" class="about_a">Contact</a>
										<ul class="about_ul animate hidden">
											<li>
												<p>
													We appreciate your feedback, please let us know what you think about the application.<br>
													You can contact the MERI GIS Department at 201-460-4612 and at <a href="mailto:merigis@njmeadowlands.gov" class="about_link">merigis@njmeadowlands.gov</a>
												</p>
											</li>
										</ul>
									</li>
								</ul>
							</li>
						</ul>
					</nav>
				</header>
			</div>
			<div id="search2" class="search2"></div>
			<div id="map" class="map"></div>
		</div>
		<script src="http://js.arcgis.com/3.9compact/init.js"></script>
		<script type="text/javascript" src="http://www.google.com/recaptcha/api/js/recaptcha_ajax.js"></script>
		<script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
		<script src="js/main.js"></script>
<?php if ($_SESSION['isERIS']): ?>
		<script  src="js/ERIS.js"></script>
<?php endif ?>
	<script type="text/javascript">
		$(document).ready(function(){
			console.log(navigator.userAgent);
		});
	</script>
	</body>
</html>
