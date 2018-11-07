const Scraper = require('../scraper.js');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27018';
const assert = require('assert');
var cheerio = require('cheerio');

var scraper = new Scraper({
  baseUrl : 'https://www.olx.co.id'
});

class crawlContent {
  constructor(selectors, category){
    this.selectors = selectors;
    this.query = category;
  }

run(){
  this.getPage();
  var _this = this;
  setInterval(function () { _this.getPage();}, 300000);
}

async getAllPage(){
  for (var i = 1; i <= 500; i++) {
    console.log("Get Page: " + i);
    try{
      var LinkList = await this.getLink(this.query+'?page='+i);
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
  console.log("Get All Page Done");
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
      scraper.scrape(query, function(err, $) {
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

 getContent(Linkdata){
    return new Promise(function(resolve, reject){
      scraper.scrape(Linkdata.substr(21), function(err, $) {
        if (err) {
          reject(err);
        }else{
        	var title = $('.offerheadinner > h1.brkword').text().trim();
        	var content = $('#textContent > p > span').map(function (){ return $(this).text().trim() ; }).get().filter(text => text).join(' ').replace(/\n|\s\s+/g, ' ');
        	var spesifikasi = [];
        	var address = $('.address div').text().trim();
        	var city = $('.link.gray.cpointer a').text();
        	var id = $('small .nowrap .rel.inlblk').text().trim();
        	var price_string = $('.pricelabel strong').text().trim();
        	var price = Number(price_string.replace(/Rp|[.]|\s/g,""));
        	var luas_tanah_string = $('.spesifikasi li').first().clone().children().remove().end().text().replace(/\t|\n|\s:+/g, '').trim();
        	if (luas_tanah_string) {
            luas_tanah_string+='2';
            var luas_tanah = Number(luas_tanah_string.replace(/m2|[.]|\s/g,""));
          }else{
            var luas_tanah = "";
          }
        	var sertifikasi = $('.spesifikasi li > a').text().trim();
        	var seller = 'https://www.olx.co.id/'+$('.userdatabox').attr('data-url');
          var condition = $('.icon-bekas.small').text();
        	let images = [];
        	$('.overh#bigGallery > li.fleft > a').map(function (){
        	   images.push($(this).attr('href'));
        	});
          var datetime_ms = $('noscript').text();
          $ = cheerio.load(datetime_ms);
          datetime_ms = $('img').attr("src");
          datetime_ms = datetime_ms.substr(datetime_ms.lastIndexOf("=")+1) + "000";
          datetime_ms = new Date(+datetime_ms).getTime();
          var datetime_str = new Date(+datetime_ms).toString();
        	var metadata = {
          	id_iklan: id,
          	title: title,
          	url: Linkdata,
          	datetime_ms: datetime_ms,
          	datetime_str: datetime_str,
          	content: content,
          	images: images,
          	price: price,
          	price_string: price_string,
          	luas_tanah: luas_tanah,
          	luas_tanah_string: luas_tanah_string,
            condition: condition,
          	sertifikasi: sertifikasi,
          	seller: seller,
          	address: address,
          	city: city,
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
            var collection = db.collection('olx');
            var bulk = collection.initializeUnorderedBulkOp();
            for (var i = 0; i < myobj.length; ++i) {
              var id = myobj[i].id_iklan;
              bulk.find({ id_iklan: id }).upsert().updateOne({ $set: myobj[i]});
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