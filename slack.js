// INIT VARIABLES
var SlackBot = require('slackbots');  
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var access = "";
var param1="";
var param2="";
var param3="";
var stateVal="run";
var JobStarted = new Boolean(false);
var JobID = 0;

// GET ORCHESTRATOR AUTHORIZE KEY
var request = new XMLHttpRequest();
request.open("POST","https://account.uipath.com/oauth/token",true);
request.setRequestHeader("Content-Type", "application/json");
request.setRequestHeader("X-UIPATH-TenantName", "YOUR TENANTNAME");
var post_data = JSON.stringify({
      'grant_type' : 'refresh_token',
      'client_id': 'YOUR CLIENT ID',
	  'refresh_token': 'YOUR REFRESH TOKEN'
  });
request.send(post_data);
request.onload = () =>{     
	 if (request.status == 200){
		 const obj = JSON.parse(request.responseText);
		 access = obj.access_token;
		 console.log("Access Token:"+access);     
    }else{
	    console.log("Error");
	 }
}

// create a bot
var bot = new SlackBot({
    token: 'YOUR TOKEN from Slack check link -->', // Add a bot https://my.slack.com/services/new/bot and put the token 
    name: 'Your APP Name'
});

// BOT from SLACK EVENTS
bot.on('start', function() {    
    var params = {
        icon_emoji: ':robot_face:'
    };    
    bot.postMessageToChannel('general', 'Hello I am UiPath robot please provide me param1, param2, param3, and on the end just write start \r\n Example: param1 test', params);       
});

bot.on('message', async data => {
     if (data.type !== 'message') { return; }   
     HandleMessage(data.text)
});

bot.on('error', (err) => console.log(err));


async function HandleMessage(message)
{  
  if ((message.toLowerCase().includes('start'))&&(message.trim().length==5))
  {      
      console.log('Param1:'+param1);
      console.log('Param2:'+param2);
      console.log('Param3:'+param3);
      CallUiPath();
  }
  else if (message.toLowerCase().startsWith('param1')){ param1 = message.substring(6).trim();}
  else if (message.toLowerCase().startsWith('param2')){ param2 = message.substring(6).trim();}
  else if (message.toLowerCase().startsWith('param3')){ param3 = message.substring(6).trim();}
};

function CallUiPath()
{
    //START JOB        
    var obj2 = {"startInfo":
    { "ReleaseKey":"YOUR PROCESS ReleaseKey", 
    "Strategy":"All",
    "InputArguments": "{\"in_par1\":\""+param1+"\",\"in_par2\":\""+param2+"\",\"in_par3\":\""+param3+"\"}"}};
    
    var request2 = new XMLHttpRequest();
    request2.open("POST","https://platform.uipath.com/[Account Logical Name]/[Tenant Logical Name]/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs",true);
    request2.setRequestHeader("Content-Type", "application/json");
    request2.setRequestHeader("X-UIPATH-TenantName", "YOUR TENANTNAME");
    request2.setRequestHeader("Authorization", "Bearer "+access);
    var post_data2 = JSON.stringify(obj2);      
    request2.send(post_data2);
    request2.onload = () =>{     
         if (request2.status == 201){
             const obj2 = JSON.parse(request2.responseText);
    		 JobID = obj2.value[0].Id;
	    	 console.log("JobID:"+JobID);
		     JobStarted = true;
            }else{
                console.log("Error"+request2.responseText);
         }
    }
    
    var stateVal="run";
    if (JobStarted)
    {
        var n = 1;
        while (n < 12) {
	        setTimeout(apicall, 5000 * n)
            n++;
        }
    }
};
  //  CHECK STATUS of UIPATH PROCESS
function apicall() { 
	if (!stateVal.startsWith("succ"))
	{
	console.log("Send request");
	var request3 = new XMLHttpRequest();
    request3.open("GET","https://platform.uipath.com/[Account Logical Name]/[Tenant Logical Name]/odata/Jobs?$filter=Id eq "+JobID,true);
    request3.setRequestHeader("Content-Type", "application/json");
    request3.setRequestHeader("X-UIPATH-TenantName", "YOUR TENANTNAME");
	request3.setRequestHeader("Authorization", "Bearer "+access);     
	request3.send();
    request3.onload = () =>{    	
         if (request3.status == 200){             			 
			 const obj3 = JSON.parse(request3.responseText);
			  stateVal = String(obj3.value[0].State).toLowerCase();
			  if (stateVal.startsWith("succ"))
			  {
                  console.log("Return Argument: "+obj3.value[0].OutputArguments);
                  var str2 = String(obj3.value[0].OutputArguments).substring(13);
                  str2 = str2.substring(0,str2.length-2);
                  var params = {
                    icon_emoji: ':robot_face:'
                };    
                //SEND RESPONSE BACK TO SLACK with Output ARGument from RObot
                bot.postMessageToChannel('general',str2, params);       
			  }
		 	 console.log("State:"+stateVal);
         }else{
            console.log("Error"+request3.responseText);
        }
	}
}
};