var express = require('express');
var bing = require('node-bing-api')({accKey: "G+q36KhrWAGeDH0vnOLo3mWziupnsC2b/vv3Po6i5G0"})
var app = express();
var mongo = require('mongodb').MongoClient

app.get('/api/imagesearch/:keyword', function (req, res) {
  var keyword = req.params.keyword,
      offset = filterInt(req.query.offset),
      results = [];
    
  if(isNaN(offset)){
    res.send({"Error": "Query is not a number"});  
  }
  else{
      
       mongo.connect("mongodb://localhost:27017/saved", (err, db) => {
           if(err)
            throw err;
            
           db.collection("history", (err, collection) => {
              if(err)
                throw err;
                
              collection.insert({
                 term: keyword,
                 date: new Date()
              });
               
           });
       });
       
       bing.images(keyword, {top: 10, skip: 10*offset}, function(err, bingRes, body){
         if(err)
            throw err;
        
        
        body.d.results.forEach((data) => {
                results.push({
                   "url": data.MediaUrl,
                   "alt-text": data.Title,
                   "page-url": data.SourceUrl
                });
        });
        
        
         res.send(results);
         res.end();
        });   
  }
    
  
  
  
  
  
  
});

app.get("/api/latest/imagesearch", (req, res) => {
   mongo.connect("mongodb://localhost:27017/saved", (err, db) => {
      if(err)
        throw err;
        
      db.collection("history", (err, collection) => {
         if(err)
            throw err;
            
         var results =  [];
         
         collection.find().forEach((data) => {
             console.log(results);
             
             results.push({
                 term: data.term,
                 date: data.date
             });
         }, () => {
             
         res.send(results);
         res.end();
         });
         
          
      });
       
   });
    
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});


var filterInt = function (value) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return NaN;
}