import puppeteer from 'puppeteer'

export default defineEventHandler(async (event) => {
  const saved = await readJson<Resume | null>('resume.json', null)
  if (!saved) throw createError({ statusCode: 404, statusMessage: 'Generate a resume before downloading a PDF.' })

  const origin = getRequestURL(event).origin
  let browser
  try {
    browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(`${origin}/print/resume`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => document.fonts.ready)
    const pdf = await page.pdf({ format: 'Letter', printBackground: true, margin: { top: '0.5in', bottom: '0.5in', left: '0.6in', right: '0.6in' } })
    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Resume.pdf"',
    })
    return Buffer.from(pdf)
  } catch (e) {
    console.error('PDF generation failed:', e)
    throw createError({ statusCode: 500, statusMessage: "We couldn't make the PDF. Is Chrome installed for Puppeteer (npx puppeteer browsers install chrome)?" })
  } finally {
    await browser?.close()
  }
})
