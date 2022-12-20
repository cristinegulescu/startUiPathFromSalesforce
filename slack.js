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
request.setRequestHeader("X-UIPATH-TenantName", "YOUR TENANT");
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
    token: 'xoxb...Generate your TOKEN', // Add a bot https://my.slack.com/services/new/bot and put the token 
    name: 'YOUr SLACK BOT NAME'
});

// BOT from SLACK EVENTS
bot.on('start', function() {    
    var params = {
        icon_emoji: ':robot_face:'
    };    
    bot.postMessageToChannel('general', 'Please write here your questions about UiPath and the robot will response from youtube', params);       
});

bot.on('message', async data => {
     if (data.type !== 'message') { return; }      
     HandleMessage(data.text)
});

bot.on('error', (err) => console.log(err));


async function HandleMessage(message)
{  
  param1 = message;
  try {
    if (param1.length<30) CallUiPath();
  } catch (error) {
    console.error(error);
  }
};

function CallUiPath()
{
    //START JOB        
    console.log("Param1:"+param1);
    var obj2 = {"startInfo":
    { "ReleaseKey":"YOUR PROCESS RELEASE KEY", 
    "Strategy":"ModernJobsCount",
    "JobsCount":1,
    "InputArguments": "{\"input\":\""+param1+"\"}"}};
    
    var request2 = new XMLHttpRequest();
    request2.open("POST","https://platform.uipath.com/YOUR TENANT/YOUR TENANT/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs",true);
    request2.setRequestHeader("Content-Type", "application/json");
    request2.setRequestHeader("X-UIPATH-TenantName", "YOUR TENANT");
    request2.setRequestHeader("X-UIPATH-OrganizationUnitId", "YOUR TENANT Org_Unit_ID");
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
    
    stateVal="run";
    console.log("Before");
    if (JobStarted)
    {
        console.log("Inside");
        var n = 1;
        while (n < 12) {
	        setTimeout(apicall, 5000 * n,n)
            n++;
        }
    }
};
  //  CHECK STATUS of UIPATH PROCESS
function apicall() { 
    console.log("State Before: "+stateVal);
	if (!stateVal.startsWith("succ"))
	{
	console.log("Send request");
	var request3 = new XMLHttpRequest();
    request3.open("GET","https://platform.uipath.com/YOUR TENANT/YOUR TENANT/odata/Jobs?$filter=Id eq "+JobID,true);
    request3.setRequestHeader("Content-Type", "application/json");
    request3.setRequestHeader("X-UIPATH-TenantName", "YOUR TENANT");
    request3.setRequestHeader("X-UIPATH-OrganizationUnitId","YOUR TENANT Org_Unit_ID");
	request3.setRequestHeader("Authorization", "Bearer "+access);         
	request3.send();
    request3.onload = () =>{    	
         if (request3.status == 200){             			 
			 const obj3 = JSON.parse(request3.responseText);
			  stateVal = String(obj3.value[0].State).toLowerCase();
			  if (stateVal.startsWith("succ"))
			  {
                  console.log("Return Argument: "+obj3.value[0].OutputArguments);
                  var str2 = String(obj3.value[0].OutputArguments).substring(11);
                  str2 = str2.substring(0,str2.length-2);
                  var params = {
                    icon_emoji: ':robot_face:'
                };    
                //SEND RESPONSE BACK TO SLACK with Output ARGument from RObot
                bot.postMessageToChannel('general',str2, params);    
                JobStarted =new Boolean(false);  
			  }
		 	 console.log("State:"+stateVal);
         }else{
            console.log("Error"+request3.responseText);
        }
	}
}
};