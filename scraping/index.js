import playwright from 'playwright'
import { parseTweetInfo, writeDBFile } from './utils.js'

async function main () {
  const browser = await playwright.chromium.launch({
    // headless: false,
    // slowMo: 2000,
  })

  const page = await browser.newPage()
  await page.goto('https://twitter.com/ATU_GobPeru')

  // wait for selector data-testid="tweet" to be visible
  await page.waitForSelector('article[data-testid="tweet"]')

  await page.evaluate(() => window.scrollTo(0, 1000))
  const tweets = await page.$$('article[role="article"][data-testid="tweet"]')

  const tweetList = await Promise.all(
    tweets.map((tweet) => parseTweetInfo(tweet)),
  )

  await page.waitForTimeout(30000)

  await writeDBFile(tweetList)

  await browser.close()
}

main()
