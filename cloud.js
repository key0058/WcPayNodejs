var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request) {
  return testHello("tom");
});


AV.Cloud.define('createPayment', function(request) {
	
    var data = new Date();
    
    var appId = 'wx511e677b6f0df14a';
    var mchId = '1378360302';
    var deviceInfo = 'WEB';
    var nonceStr = '';
    var sign = '';
    var signType = 'MD5';
    var body = request.params.productName;
    var detail = '';
    var attach = '';
    var outTradeNo = data.getTime() + "";
    var feeType = 'CNY';
    var totalFee = request.params.totalFee;
    var timeExpire = '';
    var goodsTag = '';
    var notifyUrl = '';
    var tradeType = 'JSAPI';
    var productId = '';
    var limitPay = '';
    var spBillCreateIp = request.meta.remoteAddress;
    var openId = request.params.userOpenId;
    var key = 'gVY9WQbqMHsHfFwq5Tpf5cHaZ7f5XtsJ';
    
    var xml2js = require("xml2js");
    var crypto = require("crypto");
    var md5 = crypto.createHash('md5');
    
    nonceStr = crypto.randomBytes(16).toString('hex');
    
    var tempSign = "appid=" + appId + "&body=" + body + "&device_info=" + deviceInfo;
    tempSign = tempSign + "&mch_id=" + mchId + "&nonce_str=" + nonceStr + "&notify_url=" + notifyUrl;
    tempSign = tempSign + "&openid=" + openId + "&out_trade_no=" + outTradeNo + "&spbill_create_ip=" + spBillCreateIp + "&total_fee=" + totalFee + "&trade_type=" + tradeType;
    tempSign = tempSign + "&key=" + key;
    
    sign = crypto.createHash('md5').update(tempSign).digest('hex').toUpperCase();
    sign = crypto.createHash('md5').update(tempSign).digest('hex').toUpperCase();
    
    var result = {
        xml: {
            appid: appId,
            body: body,
            mch_id: mchId,
            device_info: deviceInfo,
            nonce_str: nonceStr,
            notify_url: notifyUrl,
            openid: openId,
            out_trade_no: outTradeNo,
            spbill_create_ip: spBillCreateIp,
            total_fee: totalFee,
            trade_type: tradeType,
            sign: sign
        }
    }
    
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(result);
    
    
    var requestPromise = require("request-promise");
    var options = {
        method: "POST",
        uri: "https://api.mch.weixin.qq.com/pay/unifiedorder",
        body: xml,
        json: true
    };
    
    requestPromise(options)
      .then(function(parsedBody) {
          console.log("+++1+++" + parsedBody);
          responseBody(parsedBody);
          //return parsedBody;
        
      })
      .catch(function(error) {
          console.log("+++2+++" + error);
      });
    
    var responseBody = function(body) {
        console.log("++++end++++" + body);
        return body;
    };
    
});


function testHello(name) {
	console.log("heloo " + name);
	return name;
}

function create() {
	
}

