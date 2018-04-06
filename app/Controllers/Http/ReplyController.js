'use strict'

const logger = use('App/Services/Logger')
const crypto = use('crypto')
const convert = use('xml-js')

class TokenController {
  reply({ request, response }) {
    if (request.input('echostr')) {
      return this.valid(request)
    } else {
      return this.responseMsg(request)
    }
  }

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

  responseMsg(request) {
    const data = this.xmlToJS(request.raw())
    const xml = this.jsToXML({
      ToUserName: data.tousername,
      FromUserName: data.fromusername,
      CreateTime: parseInt(new Date().valueOf() / 1000),
      MsgType: 'text',
      Content: 'hello'
    })
    return xml
  }

  xmlToJS (xmlData) {
    const _data = convert.xml2js(xmlData, {
      compact: true,
      cdataKey: 'value',
      textKey: 'value'
    }).xml

    /** 去掉数据中的 value 属性 */
    const data = Object.keys(_data).reduce((accumulator, key) => {
      accumulator[key] = _data[key].value
      return accumulator
    }, {})

    return data
  }

  jsToXML (data) {
    data = {
      xml: {
        ...data
      }
    }

    const xml = convert.js2xml(data, {
      compact: true
    })

    return xml
  }
}

module.exports = TokenController
