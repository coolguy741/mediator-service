/** @format */

const sleep = require('await-sleep')

class BrowserActions {
  constructor(page, socket, config, browser, socketHelper) {
    this.page = page
    this.socket = socket
    this.config = config
    this.browser = browser
    this.socketHelper = socketHelper
  }

  async visit(action) {
    const url = action.url
    let ans = []

    if (this._isEmpty(this.page)) {
      console.log('puppeteer-ex::open_url    this.page is empty')
      return [false, 'ERR_NOT_FOUND_BROWSER']
    } else {
      try {
        this.socketHelper.sendMessage('status', 'loading')
        await this.page.goto(url, {waitUntil: 'networkidle0'})
        ans = [true, 'Sucessfully']
      } catch (error) {
        let str_error = error.toString()
        if (str_error.includes('TimeoutError')) {
          ans = [false, 'GLOBAL.TIMEOUT']
        } else if (str_error.includes('ERR_NAME_NOT_RESOLVED')) {
          ans = [false, 'ERR_NAME_NOT_RESOLVED']
        } else if (str_error.includes('ERR_INTERNET_DISCONNECTED')) {
          ans = [false, 'ERR_INTERNET_DISCONNECTED']
        } else if (str_error.includes('ERR_CONNECTION_REFUSED')) {
          ans = [false, 'ERR_CONNECTION_REFUSED']
        } else if (str_error.includes('ERR_CONNECTION_TIMED_OUT')) {
          ans = [false, 'GLOBAL.TIMEOUT']
        } else {
          ans = [false, error]
        }
      }
    }
    this.socketHelper.sendMessage('status', 'loaded')

    return ans
  }

  getUrl() {
    if (this._isEmpty(this.page)) {
      return ''
    } else {
      return this.page.url()
    }
  }

  _isEmpty(obj) {
    try {
      return Object.keys(obj).length === 0
    } catch (error) {
      return false
    }
  }

  async mouseDown(x, y) {
    if (!this._isEmpty(this.page)) {
      return await this.page.mouse.down(x, y)
    }
    return false
  }

  async mouseMove(x, y) {
    if (!this._isEmpty(this.page)) {
      try {
        return await this.page.mouse.move(x, y)
      } catch (e) {
        return false
      }
    }
    return false
  }

  async mouseUp(x, y) {
    if (!this._isEmpty(this.page)) {
      return await this.page.mouse.up(x, y)
    }
    return false
  }

  async mouseClick(x, y) {
    if (!this._isEmpty(this.page)) {
      return await this.page.mouse.click(x, y)
    }
    return false
  }

  mouseClickDOM = async (action) => {
    try {
      const selector = action.selector
      await this.page.click(selector)
    } catch (e) {
      return [false, e]
    }
    return [true, 'success']
  }

  async mouseDBclick(x, y) {
    if (!this._isEmpty(this.page)) {
      await this.page.mouse.click(x, y, {clickCount: 2, delay: 100})
    }
    return false
  }

  async keyDown(code) {
    if (this._isEmpty(this.page) == false) {
      console.log({code})
      return await this.page.keyboard.down(code)
    }
    return false
  }

  async keyPress(code) {
    if (!this._isEmpty(this.page)) {
      console.log({code})
      return await this.page.keyboard.press(code)
    }
    return false
  }

  async keyUp(code) {
    if (!this._isEmpty(this.page)) {
      return await this.page.keyboard.up(code)
    }
    return false
  }

  async screenshot(x, y) {
    if (!this._isEmpty(this.page)) {
      var b64string = await this.page.screenshot({
        encoding: 'base64',
        type: 'jpeg',
      })
      var jpgImg = 'data:image/jpg;base64, ' + b64string
      return jpgImg
    }
    return false
  }

  async setViewport(w, h) {
    if (!this._isEmpty(this.page)) {
      w -= this.config.option.margin_w
      h -= this.config.option.margin_h
      console.log('---set viewport-->', w, h)
      await this.page.setViewport({width: w, height: h})
      return true
    } else {
      console.log('set_viewport   failed !')
      return false
    }
  }

  async setWheel(dw, dh) {
    if (!this._isEmpty(this.page)) {
      await this.page.evaluate(
        (dw, dh) => {
          window.scrollBy(dw, dh)
        },
        dw,
        dh
      )
    } else {
      console.log('set_wheel   failed !')
    }
  }

  async selectAll() {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.down('Control')
      await this.page.keyboard.press('KeyA')
      await this.page.keyboard.up('Control')
    } else {
      console.log('selectall   failed !')
    }
  }

  deleteWord = async () => {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.down('Control')
      await this.page.keyboard.press('Backspace')
      await this.page.keyboard.up('Control')
    } else {
      console.log('deleteword   failed !')
    }
  }

  deleteBackWord = async () => {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.down('Control')
      await this.page.keyboard.press('Delete')
      await this.page.keyboard.up('Control')
    } else {
      console.log('deleteword   failed !')
    }
  }

  selectWord = async (key) => {
    try {
      console.log(key)
      if (!this._isEmpty(this.page)) {
        await this.page.keyboard.down('Shift')
        switch (key) {
          case 35:
            await this.page.keyboard.press('End')
            break
          case 36:
            await this.page.keyboard.press('Home')
            break
          case 37:
            await this.page.keyboard.press('ArrowLeft')
            break
          case 39:
            await this.page.keyboard.press('ArrowRight')
            break
        }
        await this.page.keyboard.up('Shift')
      } else {
        console.log('select word failed !')
      }
    } catch (e) {
      console.log(e)
    }
  }

  cut = async () => {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.down('Control')
      await this.page.keyboard.press('KeyX')
      await this.page.keyboard.up('Control')
    } else {
      console.log('deleteword   failed !')
    }
  }

  getData = async (action) => {
    const selector = action.selector
    console.log({selector})
    try {
      const data = await this.page.$$eval(selector, (data) => {
        data.map((x) => x.innerHTML), console.log(data)
        return data
      })
      return [true, data]
    } catch (e) {
      console.log(e)
      return [false, 'error on getting data']
    }
  }

  getElement = async (action) => {
    const selector = action.selector
    try {
      const nodes = await this.page.$$eval(selector, (el) =>
        el.map((x) => {
          return x
        })
      )
      return [true, nodes]
    } catch (e) {
      console.log(e)
      return [false, 'error on getting data']
    }
  }

  input = async (action) => {
    let [selector, value] = [action.selector, action.value]
    console.log(selector, value)
    try {
      await this.page.focus(selector)
    } catch (e) {
      return [false, 'No such input element']
    }
    try {
      await this.page.keyboard.type(value, {delay: 30})
    } catch (e) {
      return [false, 'Error while typing']
    }
    console.log('success')
    return [true, 'Success']
  }

  wait = async (action) => {
    try {
      const delay = action.delay
      await sleep(delay)
    } catch (e) {
      return [false, 'Error while sleeping']
    }
    return [true, 'Success']
  }

  copy = async (action) => {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.down('Control')
      await this.page.keyboard.press('KeyC')
      await this.page.keyboard.up('Control')
    } else {
      console.log('copy   failed !')
    }
  }

  paste = async (data) => {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.down('Control')
      await this.page.keyboard.press('KeyV')
      await this.page.keyboard.up('Control')
    } else {
      console.log('paste failed !')
    }
  }
  copyToMain = async (action) => {
    try {
      const page = this.page
      const text = await page.evaluate(() => {
        if (window.getSelection) {
          return window.getSelection().toString()
        } else if (document.selection && document.selection.type != 'Control') {
          return document.selection.createRange().text
        }
        return text
      })
      this.socketHelper.sendMessage('copy', text)

      return [true, 'Copy succeed', text]
    } catch (e) {
      console.log(e)
      return [false, 'Copy error']
    }
  }

  pasteFromMain = async (text) => {
    try {
      const page = this.page
      await page.evaluate((text) => {
        document.execCommand('insertText', false, text)
      }, text)
      return [true, 'Paste succeed', text]
    } catch (e) {
      console.log(e)
      return [false, 'Paste error']
    }
  }
  refresh = async () => {
    try {
      this.socketHelper.sendMessage('status', 'loading')
      await this.page.reload({waitUntil: 'networkidle0'})
      this.socketHelper.sendMessage('status', 'loaded')
      return [true, 'Refresh succeed']
    } catch (e) {
      console.log(e)
      return [false, 'Refresh error']
    }
  }

  back = async () => {
    try {
      this.socketHelper.sendMessage('status', 'loading')
      await this.page.goBack({waitUntil: 'networkidle0'})
      this.socketHelper.sendMessage('status', 'loaded')

      return [true, 'Go back succeed']
    } catch (e) {
      console.log(e)
      return [false, 'Go back error']
    }
  }

  forward = async () => {
    try {
      this.socketHelper.sendMessage('status', 'loading')
      await this.page.goForward({waitUntil: 'networkidle0'})
      this.socketHelper.sendMessage('status', 'loaded')

      return [true, 'Go forward succeed']
    } catch (e) {
      console.log(e)
      return [false, 'Go forward error']
    }
  }

  waitForNavigation = async () => {
    try {
      await this.page.waitForNavigation()
    } catch (e) {
      console.log(e)
      return false
    }
  }

  execute = async (scripts) => {
    let response_code = true,
      message = 'Success'
    for (const script of scripts) {
      let fn = script.type
      console.log(script)
      if (fn in this) {
        try {
          const [res, msg] = await this[fn](script.action)
          if (res === false) {
            response_code = false
            message = msg
            break
          }
        } catch (e) {
          response_code = false
          message = e
          break
        }
      } else {
        response_code = false
        message = 'No such script'
        break
      }
    }

    console.error('execute script', response_code, message)

    return {response_code: response_code, message: message}
  }
}

module.exports = BrowserActions
