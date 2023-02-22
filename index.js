import playwright from 'playwright'
import { KEYWORDS } from './constants/keywords.js'

const parseTweetInfo = async (tweet) => {
  const tweetText = await tweet.$eval('div[lang]', (el) => el.innerText)

  if (typeof tweetText !== 'string') return ''

  // get if tweet is Promoted
  const isPromoted = await tweet.$eval('span', (el) => el.innerText === 'Promoted')

  if (isPromoted) return

  // get every anchor tag in the tweet and parse the href
  const anchors = await tweet.$$eval('a', (els) => els.map((el) => el.href))
  // filter the anchors that has "status/" and doesn't has "analytics" in the url
  const tweetUrl = anchors.find((url) => url.includes('status/') && !url.includes('analytics'))

  const mappedKeywords = KEYWORDS.reduce((acc, keyword) => {
    if (tweetText.toLowerCase().includes(keyword)) acc[keyword.replace(' ', '_')] = true
    return acc
  }, {})

  return {
    tweetUrl,
    text: tweetText,
    keywords: mappedKeywords,
  }
}

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

  console.log(tweetList)

  await browser.close()
}

main()
