package main

import (
    "bytes"
    "encoding/json"
    "fmt"
	"io/ioutil"
	"net/http"
)

type OAuthResp struct {
  Access_token string
  Id_token string
  Scope string
  Expires_in string
  Token_type string
}

func main() {

 var resp OAuthResp	
 jsonData := map[string]string{"grant_type": "refresh_token",
    "client_id": "YOUR CLIENT ID",
    "refresh_token": "YOUR REFRESH TOKEN"}	
 jsonValue, _ := json.Marshal(jsonData)
 
 request, _ := http.NewRequest("POST","https://account.uipath.com/oauth/token",bytes.NewBuffer(jsonValue))
 request.Header.Set("Content-Type","application/json")
 request.Header.Set("X-UIPATH-TenantName","YOUR TENANTNAME")
 client := &http.Client{}
 response,err := client.Do(request)
 if err != nil {
    fmt.Printf("Error on http:%s\n",err)
 } else {
    data, _ := ioutil.ReadAll(response.Body)
    json.Unmarshal([]byte(data), &resp)
    fmt.Printf("Access_Token: %s\n", resp.Access_token)
 }
//start simple process
/*jsonData2 := map[string]interface{}{
		"startInfo": map[string]string{
			"ReleaseKey": "YOUR PROCESS ReleaseKey",
			"Strategy": "All",
		},
	}*/
//process with parameters
jsonData2 := map[string]interface{}{
		"startInfo": map[string]string{
			"ReleaseKey": "YOUR PROCESS ReleaseKey",
			"Strategy": "All",
			"InputArguments": "{\"param1\":\"Test Youtube GO\",\"param2\":\"GoLang 21:03\"}",
		},
	}
jsonProc2, _ := json.Marshal(jsonData2)

 request2, _ := http.NewRequest("POST","https://platform.uipath.com/[Account Logical Name]/[Tenant Logical Name]/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs",bytes.NewBuffer(jsonProc2))
 request2.Header.Set("Authorization","Bearer "+resp.Access_token)
 request2.Header.Set("Content-Type","application/json")
 request2.Header.Set("X-UIPATH-TenantName","YOUR TENANTNAME")
 request2.Header.Set("User-Agent","telnet")
 client2 := &http.Client{}
 response2,err2 := client2.Do(request2)
 if err2 != nil {
    fmt.Printf("Error on http:%s\n",err2)
 } else {
    data, _ := ioutil.ReadAll(response2.Body)
    json.Unmarshal([]byte(data), &resp)	
	fmt.Println("Respons:"+string(data))  
 }
}