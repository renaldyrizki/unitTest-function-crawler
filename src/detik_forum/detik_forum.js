const Scraper = require('../scraper.js');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27018';
const assert = require('assert');
const timestamp = require('../timestamp');

var scraper = new Scraper();

class crawlContent {
  constructor(selectors, query){
    this.selectors = selectors;
    this.query = query;
  }

run(){
  this.getPage();
  var _this = this;
  setInterval(function () { _this.getPage();}, 300000);
}

async getPage(){
  console.log("Get Page");
  try{
    var LinkList = await this.getLink(this.query, this.selectors);
    console.log(LinkList);
    if (LinkList.length != 0) {
        for (var j = 0; j < LinkList.length; j++) {
          LinkList[j] = await this.getContent(LinkList[j]);
        }
        var db = await this.savetomongo(LinkList);
        console.log(JSON.stringify(db, undefined, 2));
    }
  }catch(err){
    console.log(err);
  }
}

 getLink(query, linkselector) {
    return new Promise(function(resolve, reject){
      scraper.scrape('http://forum.detik.com/dt_search_result.php?query='+ query +'&source=dcnav&siteid=56&search_type=ALL', function(err, $) {
        if (err) {
          reject(err);
        } else {
          var LinkList = $(linkselector.container.tag).not(linkselector.container.not).map(function() {
            var link = $(this).find(linkselector.link.tag).attr(linkselector.link.attr);
            return link;
          }).get();
          resolve(LinkList);
        }
      });
    });
 }

 getTime(datetimeStr, datetimeFormat){
    const dateInput = { str: datetimeStr, format: datetimeFormat };
    const datetime = timestamp.toTimestamp(dateInput);
    return datetime;
 }

 getContent(Linkdata){
    var _this = this;
    return new Promise(function(resolve, reject){
      scraper.scrape(Linkdata, function(err, $) {
        if (err) {
          reject(err);
        }else{
          var time_string = $('#posts > div > .page .thead').eq(0).text().trim().replace(/\s\s+/g, ' ');
          var res = time_string.split(",");
          if (res[0] === 'Yesterday') {
              var Yesterday = new Date(new Date().setDate(new Date().getDate()-1));
              var dd = Yesterday.getDate();
              var mm = Yesterday.getMonth()+1; //January is 0!
              var yyyy = Yesterday.getFullYear();
              if(dd<10){
                  dd='0'+dd;
              } 
              if(mm<10){
                  mm='0'+mm;
              } 
              var Yesterday = dd+' '+mm+' '+yyyy;
              var datetime_ms = _this.getTime( Yesterday + '' + res[1], 'dd mm yyyy hh:ii');
              var datetime_str = new Date(datetime_ms).toString();
          }else if (res[0] === 'Today') {
              var Today = new Date();
              var dd = Today.getDate();
              var mm = Today.getMonth()+1; //January is 0!
              var yyyy = Today.getFullYear();
              if(dd<10){
                  dd='0'+dd;
              } 
              if(mm<10){
                  mm='0'+mm;
              } 
              var Today = dd+' '+mm+' '+yyyy;
              var datetime_ms = _this.getTime( Today + res[1], 'dd mm yyyy hh:ii');
              var datetime_str = new Date(datetime_ms).toString();
          }else{
              var datetime_ms = _this.getTime( res[0].replace(/th|nd|1st|rd/gi, "") + res[1], 'dd MMMM yyyy hh:ii');
              var datetime_str = new Date(datetime_ms).toString();
          }
        	var title = $('#posts > div > .page .alt1 .smallfont strong').text();
          let tag = [];
          $('span.navbar > a').map(function (){
             tag.push($(this).text());
          });
          var quote = $('#posts > div > .page .alt2').eq(1).map(function (){ return $(this).text().trim(); }).get().filter(text => text).join(' ').replace(/\n|\s\s+/g, ' ');
          var content = $('#posts > div > .page .alt1').eq(0).children('div').eq(1).text().trim().replace(/\t|\n|\s:+/g, '');
          var creator_name = $('#posts > div > .page .alt2').eq(0).find('a.bigusername').text();
          var creator_url = $('#posts > div > .page .alt2').eq(0).find('a.bigusername').attr('href');
          let images = [];
          $('#posts > div > .page .alt2 > img').map(function (){
             images.push($(this).attr('src'));
          });
        	var metadata = {
          	title: title,
          	url: Linkdata,
            creator_name: creator_name,
            creator_url: 'forum.detik.com/'+creator_url,
            quote: quote,
            content: content,
            images: images,
          	datetime_ms: datetime_ms,
            datetime_str: datetime_str,
            tag: tag,
        	};
  		    resolve(metadata);
        }
      });
    });
 }

 savetomongo(myobj){
  return new Promise(function(resolve, reject){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
        if (err) { 
            reject(err);
        }else if (!Array.isArray(myobj)) {
            err = new Error('Data type is not Array');
            reject(err);
        }else{
            var db = client.db("kazee_ojk");
            var collection = db.collection('detik_forum');
            var bulk = collection.initializeUnorderedBulkOp();
            for (var i = 0; i < myobj.length; ++i) {
              var id = myobj[i].url;
              bulk.find({ url: id }).upsert().updateOne({ $set: myobj[i]});
            }
            bulk.execute(function(err, result) {
              if (err) {
                reject(err);
              }else{
                resolve(result);
              }
              client.close();
            });
        }
    });
    });
 }
}//end of class
module.exports = crawlContent;