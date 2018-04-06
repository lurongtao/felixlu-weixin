'use strict'

const logger = use('App/Services/Logger')
const crypto = use('crypto')
const convert = use('xml-js')
const randomString = use('randomstring')
const axios = use('axios')

const appId = 'wxd901da01d13166a9'
const appSecret = '9b2c552de9f5a46b292dfae241a91f8d'
const url = 'http://walter666.cn/demo'

class WeixinController {
  async demo({ request, view }) {
    if (request.input('echostr')) {
      return this.valid(request)
    } else {
      const access_token = await this.getSignature("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + appSecret)
      const jsapi_ticket = await this.getSignature("https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=" + access_token['data']['access_token'])

      const nonceStr = this.createNonceStr()
      const timestamp = this.getTimestamp()
      const str = `jsapi_ticket=${jsapi_ticket['data']['ticket']}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
      const signature = this.cryptoSignature(str)

      return view.render('index', {appId, timestamp, nonceStr, signature})
    }
  }

  // 验证
  valid(request) {
    const echoStr = request.input('echostr')
    if (this.checkSignature(request)) {
      return echoStr
    }
  }

  checkSignature(request) {
    const token = 'weixin'
    const signature = request.input('signature')
    const timestamp = request.input('timestamp')
    const nonce = request.input('nonce')
    const selfSignature = this.cryptoSignature([token, timestamp, nonce].sort().join(''))
    return selfSignature == signature
  }

  cryptoSignature (str) {
    return crypto.createHash('sha1').update(str).digest('hex')
  }

  // 生成JSSDK所需信息
  createNonceStr() {
    return randomString.generate(16)
  }

  getTimestamp() {
    const t = Date.parse(new Date()).toString()
    return t.substring(0, t.length - 3)
  }

  getSignature(url) {
    return axios.get(url).then(res => res)
  }
}

module.exports = WeixinController
