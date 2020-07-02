## This script requires "requests": http://docs.python-requests.org/
## To install: pip install requests

import requests
import json

data = { "grant_type": "refresh_token",
           "client_id": "YOUR CLIENT ID",
		   "refresh_token": "YOUR REFRESH TOKEN" }
headers = { "Content-Type" : "application/json",
            "X-UIPATH-TenantName" : "YOUR TENANTNAME" }

r = requests.post("https://account.uipath.com/oauth/token", data, headers)

response = json.loads(r.content)
auth = "Bearer "+response["access_token"]

headers2 = { "Content-Type" : "application/json",
             "X-UIPATH-TenantName" : "YOUR TENANTNAME",
			 "Authorization" : auth}

## Process without parameters (Simple)
startInfo = {}
startInfo['ReleaseKey'] = 'YOUR PROCESS ReleaseKey'
startInfo['Strategy'] = 'All'

"""
## Process with parameters
startInfo = {}
startInfo['ReleaseKey'] = 'YOUR PROCESS ReleaseKey'
startInfo['Strategy'] = 'All'
startInfo['InputArguments'] = '{\"param1\":\"Test from Python\",\"param2\":\"Video Live 20:42\"}'
"""

data2 ={}
data2['startInfo'] = startInfo
json_data = json.dumps(data2)

r2 = requests.post("https://platform.uipath.com/[Account Logical Name]/[Tenant Logical Name]/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs", data = json_data, headers = headers2)
print(r2.content)

  