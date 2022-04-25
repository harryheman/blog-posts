// const isProd = process.env.ENV === 'production'

async function renderPage(app, req, res) {
  const query = { ...req.params, ...req.query }

  try {
    const html = await app.renderToHTML(req, res, req.path, query)

    res.saveHtmlToCache(html)

    res.send(html)
  } catch (err) {
    console.error(err)

    await app.renderError(err, req, res, req.path, query)
  }
}

module.exports = renderPage
