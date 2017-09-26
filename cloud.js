var AV = require('leanengine');


AV.Cloud.define('createWechatPayment', function(request, response) {
	
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
    
    var tempXml = {
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
    var xml = builder.buildObject(tempXml);
    
	console.log("XML content: " + xml);
    
	var httpRequest = require("request");	
	var options = {
		method: "POST",
		uri: "https://api.mch.weixin.qq.com/pay/unifiedorder",
		body: xml,
		json: true
	};
	httpRequest(options, function(error, res, body){  
		xml2js.parseString(res.body, {explicitArray : false}, function(err, json) {
			var result = JSON.parse(JSON.stringify(json));
			if (result.xml.return_code = 'SUCCESS') {
				console.log("Create payment id[" + result.xml.prepay_id + "]");
				response.success({"prepayId": result.xml.prepay_id});
			} else {
				response.success('ERROR: ' + result);
			}
		});
	});  
    
});


