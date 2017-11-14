//自動回應留言
//自動回應某篇的留言 直接回應在下方 非私密回覆
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const urlencode = require('urlencode');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>已完成機器人佈署！ design by <a href="https://www.facebook.com/jing.pan.5">JingPan</a>.<br><br><iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fjing.pan.5%2Fposts%2F1710206618990813&width=500&show_text=true&appId=515825845433689&height=671" width="500" height="671" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe></body></html>";

// The rest of the code implements the routes for our Express server.
let app = express();
const FB_APP_ID = process.env.FACEBOOK_APP_ID;
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
let fbShortenToken = process.env.fbtk20;
let resp_text = process.env.resp_text;
let PM_text = process.env.PM_text;

//固定抓某篇文章的ID (粉絲團ID+PostID)
let postid="1606860146241255_1712861062350306";
//粉絲團ID
let fansPageid="1606860146241255";
//1498004173835997   mr4.lab
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Webhook validation
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});

app.get('/web', function(req, res) {
    //let arg = req.query.msg;
    arg="ABC";
    //weeklyFacebookPost(arg);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(`<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>GGGGGGGGAA.=${arg}</body></html>`);
    //res.write(messengerButton);
    res.end();
  });

  app.post('/webhook', function (req, res) {
    console.log(req.body);
    var data = req.body;
    console.log("-----data-----");
    console.log(data);
    if (data.object === 'page') {

      data.entry.forEach(function(entry) {
        console.log("-----entry-----");
        console.log(entry);
        console.log("--values--");
        entry.changes.forEach(function(event) {
            console.log("-----event-----");
            console.log(event);
            if (event.field=="feed" && event.value.sender_id!=fansPageid && event.value.verb === 'add') {
              weeklyFacebookPost( event.value.message , event.value.sender_name , event.value.comment_id);
            } 

          });
          
      });
      res.sendStatus(200);
    }
  });

 
function weeklyFacebookPost(msg,name , commentId) {
    "use strict";
    let extend_token_url = `https://graph.facebook.com/v2.10/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&amp&client_secret=${FB_APP_SECRET}&amp&fb_exchange_token=${fbShortenToken}`
    //定期更新Token

    request(extend_token_url, function(err, response, body){
        let access_token = JSON.parse(body).access_token;
        // 因為Token只少每60天都必須延長一次，所以改成每週發文時都將上禮拜的Token換成這裡的新Token

        fbShortenToken = access_token;
        // 拿 使用者授權應用程式的Token 換成 Po文權限的Token

        request(`https://graph.facebook.com/${fansPageid}?fields=access_token&access_token=${access_token}`, function (err, response, body) {

            let access_token = JSON.parse(body).access_token;
            //let post_link = 'https://www.facebook.com/Mr4.Lab/';
            //let post_message = querystring.parse(arg);
            var ansmsg ="";
            var arr_resText = resp_text.split(",");
            if (msg!=null){              
                  ansmsg=arr_resText[parseInt(3*Math.random())];
            let post_message = urlencode(PM_text, 'utf-8');            
            let comment_id = commentId;
            //console.log("urlencode msg="+urlencode(msg, 'utf-8'));
            //console.log("msg="+msg);
            //let post_page_url = `https://graph.facebook.com/v2.10/${fansPageid}/feed?message=${post_message}&link=${post_link}&access_token=${access_token}`;
            let post_page_url = `https://graph.facebook.com/v2.10/${comment_id}/private_replies?message=${post_message}&access_token=${access_token}`;
            console.log("post_page_url = "+post_page_url);
            //操作頁面權限的Token發文

              request.post(post_page_url, function (err, response, body) {
                  console.log(body);
                  
              })

              post_message = urlencode(ansmsg, 'utf-8');
              post_page_url = `https://graph.facebook.com/v2.10/${comment_id}/comments?message=${post_message}&access_token=${access_token}`;
              console.log("post_page_url = "+post_page_url);
              //操作頁面權限的Token發文
  
                request.post(post_page_url, function (err, response, body) {
                    console.log(body);
                    
                })
                setTimeout(function2, 2000);
          }
        })
    });
} 

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port %s", server.address().port);
  });


  function function2() {
    // all the stuff you want to happen after that pause
    console.log('Blah blah blah blah extra-blah');
}
