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
      scraper.scrapePost('https://www.kompasiana.com/search_artikel', query, function(err, $) {
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
      scraper.scrape(Linkdata ,function(err, $) {
        if (err) {
          reject(err);
        }else{
          var time_string = $('.read-count').children('.count-item').eq(0).text().replace(/\s\s+/g, ' ');
          var datetime_ms = _this.getTime(time_string, 'dd MMMM yyyy hh:ii');
          var datetime_str = new Date(datetime_ms).toString();
          var time_update_string = $('.read-count').children('.count-item').eq(1).text().substr(12).replace(/\s\s+/g, ' ');
          var datetime_ms_update = _this.getTime(time_update_string, 'dd MMMM yyyy hh:ii');
          var datetime_str_update = new Date(datetime_ms_update).toString();
        	var title = $('.read-artikel__title > h1.title').text().trim();
          let tag = [];
          $('.artikel--tag > span').map(function (){
             tag.push($(this).text());
          });
          var creator_name = $('.user-box > a').first().clone().children().remove().end().text().replace(/\t|\n|\s:+/g, '').trim();
          var creator_url = $('.user-box > a').attr('href');
          var content = $('.read-content > p').map(function (){ return $(this).text().trim() ; }).get().filter(text => text).join(' ').replace(/\n|\s\s+/g, ' ');
        	content = content.replace(/\n+/g, ' ');
          let images = [];
        	images.push($('.read-artikel__img.photo > a > img').attr('src'));
          $('.img-read > .img > img').map(function (){
             images.push($(this).attr('src'));
          });
        	var metadata = {
          	title: title,
          	url: Linkdata,
            creator_name: creator_name,
            creator_url: creator_url,
            content: content,
            images: images,
          	datetime_ms: datetime_ms,
            datetime_str: datetime_str,
            datetime_ms_update: datetime_ms_update,
            datetime_str_update: datetime_str_update,
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
            var collection = db.collection('kompasiana');
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