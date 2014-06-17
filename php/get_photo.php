<?php
error_reporting(0);
if(isset($_GET['id']))
{
	$path = 'http://apps.njmeadowlands.gov/images/property/PID/'.$_GET['id'].'.jpg';
	if (getimagesize($path) !== false) 
	{
		echo "http://apps.njmeadowlands.gov/images/property/PID/".$_GET['id'].".jpg";	
	}
	else
	{
		echo "http://apps.njmeadowlands.gov/images/no_photo.jpg";
	}
}
else
{
	echo "http://apps.njmeadowlands.gov/images/no_photo.jpg";	
}
?>
