<?php
// Auth 
$url = 'https://account.uipath.com/oauth/token';

$ch = curl_init($url);
$data = array(    
	'grant_type' => 'refresh_token',
    'client_id' => 'YOUR CLIENT ID',
    'refresh_token' => 'YOUR REFRESH TOKEN'
);
$payload = json_encode($data);

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-Type: application/json', 'X-UIPATH-TenantName: YOUR TENANT NAME'));

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT,60);

curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
curl_close($ch);

$obj = json_decode($result);
$auth = $obj->access_token;

//Start the process with parameters
$url = 'https://platform.uipath.com/[Account Logical Name]/[Tenant Logical Name]/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs';

$par1 = "text1";
$par2 = "text2";
$par3 = "text3";

$ch = curl_init($url);
$data = array(    
	'ReleaseKey' => 'YOUR RELEASE KEY',
    'Strategy' => 'All',
    'InputArguments' => '{"in_par1":"' . $par1 . '","in_par2":"' . $par2 . '","in_par3":"' . $par3 . '"}'
);
$payload = json_encode(array("startInfo" => $data));

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-Type: application/json', 'X-UIPATH-TenantName: YOUR TENANT NAME','Authorization: Bearer ' . $auth,'User-Agent: telnet'));

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT,60);

curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
curl_close($ch);

$obj = json_decode($result);
$procid = $obj->value[0]->Id;
$waitloop = true;

do{
	 sleep(5);	 
	 //Check the status of the process
$url = 'https://platform.uipath.com/[Account Logical Name]/[Tenant Logical Name]/odata/Jobs?$filter=Id%20eq%20' . $procid;
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET"); 
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-Type: application/json', 'X-UIPATH-TenantName: YOUR TENANTNAME','Authorization: Bearer ' . $auth,'User-Agent: telnet'));

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT,60);

curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
curl_close($ch);

$obj = json_decode($result);
//echo $obj->value[0]->State;
if (substr($obj->value[0]->State, 0, 4 ) === "Succ"){
	echo $obj->value[0]->OutputArguments;
	$waitloop = false;
}
	 
}while($waitloop);

?>