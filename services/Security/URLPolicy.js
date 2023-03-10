/** @format */
const SocketHelper = require('../../helper/SocketHelper')
const getConfig = require('../../helper/ConfigHelper')

class URLPolicy {
  constructor(page, socket, info) {
    this.page = page
    this.socketHelper = new SocketHelper(socket)
    this.allowList = []
    this.denyList = []
    getConfig(info)
      .then((res) => {
        this.allowList = res
      })
      .catch((e) => console.log(e))
  }

  validateURL = (url) => {
    let res = false
    this.allowList.forEach((aurl) => {
      if (url.indexOf(aurl) === 0) res = true
    })
    this.denyList.forEach((durl) => {
      if (url.indexOf(durl) === 0) res = false
    })

    return res
  }

  filterATag = async (page) => {
    if (page === undefined) {
      return
    }
    const url = page.url()

    await page.$$eval(
      'a',
      (data, url, allow, deny) => {
        validateURL = (url) => {
          let res = false

          allow.forEach((aurl) => {
            if (url.indexOf(aurl) === 0) res = true
          })
          deny.forEach((durl) => {
            if (url.indexOf(durl) === 0) res = false
          })
          return res
        }

        data.map((el) => {
          if (el.target === '') {
          } else if (el.target === '_self') {
          } else {
            el.target = '_self'
          }
          if (el.href.indexOf(url) === 0) {
          } else if (el.href.indexOf('http:') != 0 && el.href.indexOf('https:') != 0) {
          } else if (el.href.indexOf('javascript:') === 0) {
          } else {
            const href = el.href
            const res = validateURL(href)
            if (res === false) {
              if (el.href != '') {
                el.href = ''
              }
              if (el.onclick != null) {
                el.onclick = null
              }
            }
          }
          return el
        })
      },
      url,
      this.allowList,
      this.denyList
    )
  }

  filterAll = async () => {
    try {
      // console.log('Stop filter')
      // return
      console.log('-----------------filterAll start-------------------')
      await this.filterATag(this.page)
      console.log('-----------------filterAll end---------------------')
      return
    } catch (e) {
      this.socketHelper.sendWarnMessage('Filter failed')
      console.log(e)
    }
  }
}

module.exports = URLPolicy
