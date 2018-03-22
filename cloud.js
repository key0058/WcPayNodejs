const uuid = require('uuid/v4');
const AV = require('leanengine');
const Order = require('./order');
const wxpay = require('./wxpay');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});

/** 
 * 小程序创建订单
 */
AV.Cloud.define('order', (request, response) => {
  const user = request.currentUser;
  if (!user) {
    return response.error(new Error('用户未登录'));
  }
  const authData = user.get('authData');
  if (!authData || !authData.lc_weapp) {
    return response.error(new Error('当前用户不是小程序用户'));
  }
  const order = new Order();
  order.tradeId = uuid().replace(/-/g, '');
  order.status = 'INIT';
  order.user = request.currentUser;
  order.productDescription = 'LeanCloud-小程序支付测试';
  order.amount = 1;
  order.ip = request.meta.remoteAddress;
  if (!(order.ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(order.ip))) {
    order.ip = '127.0.0.1';
  }
  order.tradeType = 'JSAPI';
  const acl = new AV.ACL();
  // 只有创建订单的用户可以读，没有人可以写
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  acl.setReadAccess(user, true);
  acl.setWriteAccess(user, false);
  order.setACL(acl);
  order.place().then(() => {
    console.log(`预订单创建成功：订单号 [${order.tradeId}] prepayId [${order.prepayId}]`);
    const payload = {
      appId: process.env.WEIXIN_APPID,
      timeStamp: String(Math.floor(Date.now() / 1000)),
      package: `prepay_id=${order.prepayId}`,
      signType: 'MD5',
      nonceStr: String(Math.random()),
    }
    payload.paySign = wxpay.sign(payload);
    response.success(payload);
  }).catch(error => {
    console.error(error);
    response.error(error);
  });
});


AV.Cloud.define('createWechatPayment', function(request, response) {
	
  var data = new Date();
  
  var appId = 'wx9eab9f19e4e05ff6';
  var mchId = '1481054882';
  var deviceInfo = 'WEB';
  var nonceStr = 'ec2316275641faa3aacf3cc599e8730f';
  var sign = '';
  var signType = 'MD5';
  var body = 'LeanCloud-小程序支付测试';
  var detail = '';
  var attach = '';
  var outTradeNo = data.getTime() + "";
  var feeType = 'CNY';
  var totalFee = 1;
  var timeExpire = '';
  var goodsTag = '';
  var notifyUrl = 'https://stg-key0058.leanapp.cn.leanapp.cn/weixin/pay-callback';
  var tradeType = 'JSAPI';
  var productId = '';
  var limitPay = '';
  var spBillCreateIp = request.meta.remoteAddress;
  var openId = request.currentUser.get('authData').lc_weapp.openid;
  var key = 'evtrjds8bq5eptw8sj8w51a2xpw18o7v';
  
  var xml2js = require("xml2js");
  var crypto = require("crypto");
  var md5 = crypto.createHash('md5');
  
  nonceStr = crypto.randomBytes(16).toString('hex');
  
  var tempSign = "appid=" + appId + "&body=" + body + "&device_info=" + deviceInfo;
  tempSign = tempSign + "&mch_id=" + mchId + "&nonce_str=" + nonceStr + "&notify_url=" + notifyUrl;
  tempSign = tempSign + "&openid=" + openId + "&out_trade_no=" + outTradeNo + "&spbill_create_ip=" + spBillCreateIp + "&total_fee=" + totalFee + "&trade_type=" + tradeType;
  tempSign = tempSign + "&key=" + key;

  console.log(tempSign);

  md5.update(tempSign);
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
        console.log("Response body: " + body);
        console.log("Create payment id[" + result.xml.prepay_id + "]");
        response.success({"prepayId": result.xml.prepay_id});
      } else {
        response.success('ERROR: ' + result);
      }
    });
  });  
  
});

