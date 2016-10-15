var express = require("express");
var app = express();
var mongo = require("mongodb").MongoClient;
var dbUrl = 'mongodb://amk:W4UY|c-_hyJc7nJ@ds013222.mlab.com:13222/shorten_url';
var port = process.env.PORT || 8080;
var imgSearch = require("google-images");
var apiKey = 'AIzaSyCj6zGCOthX__AzcGDENssx-5-I5W3XR8c';
var cseId = '009398540246307978289:iqst39d97we';
var client = new imgSearch(cseId,apiKey);
app.get('/api/imgSearch/:name',function(req,res){
    var page = req.query.offset ? req.query.offset : 1;
    var imgName = req.params.name;
    var date =new Date().toISOString();
    // console.log(date);
    client.search(imgName,{
        page: page
    }).then(function(images){
        if(images.length>0){
            mongo.connect(dbUrl,function(err,db){
                if(err){
                    res.json(images);
                } else {
                    var imgSearchList = db.collection('imgSearchList');
                    imgSearchList.insert([{term: imgName, when: date}],function(){
                        db.close();
                        res.json(images);
                    });
                }
            })
        } else {
            res.json('wtf');
        }
    });
});
app.get('/api/latest/imgsearch',function(req,res){
   mongo.connect(dbUrl,function(err,db){
       var imgSearchList = db.collection('imgSearchList');
       imgSearchList.find({},{_id:0}).limit(10).toArray(function(err,docs){
          if(err){
              db.close()
              res.end('wtf');
          } else {
              db.close();
              res.json(docs.reverse());
              
          }
       });
   });
});
app.get('/',express.static('public'));
app.get('*',function(req,res){
    res.send(req.headers);
});
app.listen(port,function(){
    console.log('Everything is OK :)');
});