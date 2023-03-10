/** @format */
const path = require('path')
const URLPolicy = require('../Security/URLPolicy')
const doFilter = false

const pageEvent = async (page, socket, socketHelper, type) => {
  console.log('=======================', type)
  const urlPolicy = new URLPolicy(page, socket, {site: type, tag: 'AllowURL'})
  page.setRequestInterception(true)
  const handleRequest = async (request) => {
    const url = request.url()
    const type = request.resourceType()
    if (doFilter === false) {
      await request.continue()
      return
    }
    if (type !== 'document') {
      request.continue()
    } else {
      if (type === 'document' && urlPolicy.validateURL(url) === false) {
        await request.abort()
        socketHelper.sendWarnMessage('GLOBAL.NOT.ALLOWED.LINK')
        await page.reload({waitUntil: 'networkidle0'})
        console.log('aborted')
      } else await request.continue()
    }
  }

  // Emitted when the DOM is parsed and ready (without waiting for resources)
  page.on('domcontentloaded', async () => {
    console.log('==========================================>loaded')
  })

  // Emitted when the page is fully loaded
  page.on('load', async () => {
    console.log('fully loaded')
    if (doFilter) await urlPolicy.filterAll()
    changeProxySelect()

    socketHelper.sendMessage('status', 'loaded')
  })

  // Emitted when the page attaches a frame
  page.on('frameattached', (frame) => {
    console.log('frame detached')
  })

  // Emitted when a frame within the page is navigated to a new URL
  page.on('framenavigated', async (frame) => {
    console.log('==========>frame navigated ', frame.url())
    // if (frame.url() === 'chrome-error://chromewebdata/') {
    //   socketHelper.sendM('Internet connection error')
    // }
    try {
      socketHelper.sendMessage('status', 'loaded')

      if (doFilter) await urlPolicy.filterAll()
    } catch (e) {
      console.log(e)
    }
  })

  // Emitted when a script within the page uses `console.timeStamp`
  page.on('metrics', (data) => {})

  // Emitted when a script within the page uses `console`
  page.on('console', (message) => {
    console.log('In page for console===>', message.text())
  })

  // Emitted when the page emits an error event (for example, the page crashes)
  page.on('error', (error) => {
    console.log('error ', error)
  })

  // Emitted when a script within the page has uncaught exception
  page.on('pageerror', (error) => {
    console.log('page error', error)
  })

  // Emitted when a script within the page uses `alert`, `prompt`, `confirm` or `beforeunload`
  page.on('dialog', async (dialog) => {
    console.log('dialog', dialog.message())

    await dialog.accept()
  })
  page.on('filedialog', (data) => {
    console.log('file dialog')
  })
  // Emitted when a new page, that belongs to the browser context, is opened
  page.on('popup', () => {
    console.log('popup')
  })

  // Emitted when the page produces a request
  page.on('request', async (request) => {
    if (request.isNavigationRequest()) {
      console.log('===============>', request.url())
      socketHelper.sendMessage('status', 'loading')
    }
    await handleRequest(request)
  })

  // Emitted when a request, which is produced by the page, fails
  page.on('requestfailed', (request) => {
    console.log('====> request failed', request.resourceType())
  })

  // Emitted when a request, which is produced by the page, finishes successfully
  page.on('requestfinished', async (request) => {
    // console.log('====> request_finish')
  })

  // Emitted when a response is received
  page.on('response', (response) => {
    // console.log('response')
  })

  // Emitted when the page creates a dedicated WebWorker
  page.on('workercreated', (worker) => {})

  // Emitted when the page destroys a dedicated WebWorker
  page.on('workerdestroyed', (worker) => {})

  // Emitted when the page detaches a frame
  page.on('framedetached', () => {
    console.log('frame detached')
  })

  // Emitted after the page is closed
  page.once('close', () => {
    console.log('Closed')
  })

  //change all select dom inside page as proxy-select
  changeProxySelect = async () => {
    try {
      const url = page.url()
      if (url === 'https://www.wipo.int/ipdl-lisbon/struct-search') return
      await page.addStyleTag({path: path.join(__dirname, 'ProxySelect.css')})
      await page.addScriptTag({path: path.join(__dirname, 'ProxySelect.js')})
      await page.evaluate(() => {
        var selectNodes = document.getElementsByTagName('select')

        for (var i = 0, len = selectNodes.length; i < len; i++) {
          var selectNode = selectNodes[i]
          window.proxifySelect(selectNode)
        }
        window.proxifyDynamicallyAddedSelects()
      })
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = pageEvent
