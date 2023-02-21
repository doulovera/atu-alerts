import playwright from 'playwright'

const parseTweetInfo = async (page, tweet) => {
  const tweetText = await tweet.$eval('div[lang]', (el) => el.innerText)

  if (typeof tweetText !== 'string') return ''

  // get if tweet is Promoted
  const isPromoted = await tweet.$eval('span', (el) => el.innerText === 'Promoted')

  if (isPromoted) return

  const tweetId = await tweet.getAttribute('aria-labelledby')

  await tweet.click()

  // wait for the url to change
  await page.waitForURL((url) => {
    console.log(url)
    return url.href.includes('status')
  })

  const url = await page.url()
  console.log(url)
  await page.goBack()

  // click on the element that contains that tweetId and extract its url
  // const tweetUrl = await page.evaluate((tweetId) => {
  //   const selectedTweet = document.querySelector(`[aria-labelledby="${tweetId}"]`)
  //   selectedTweet.click()
  //   // page url
  //   const url = window.location.href

  //   // return to the previous page
  //   window.history.back()

  //   return url
  // }, tweetId)

  return {
    text: tweetText.toLowerCase(), // TODO: dont lowerCase links
    // tweetId,
    // tweetUrl,
  }
}

async function main () {
  const browser = await playwright.chromium.launch({
    headless: false, // setting this to true will not run the UI
    slowMo: 2000,
    devtools: true,
  })

  const page = await browser.newPage()
  await page.goto('https://twitter.com/ATU_GobPeru')

  // wait for selector data-testid="tweet" to be visible
  await page.waitForSelector('article[data-testid="tweet"]')

  await page.evaluate(() => window.scrollTo(0, 1000))
  const tweets = await page.$$('article[role="article"][data-testid="tweet"]')

  const tweetList = await Promise.all(tweets.map((tweet) => parseTweetInfo(page, tweet)))

  // await page.waitForTimeout(30000)

  // search for a word in an array of strings
  const searchWord = 'corredor amarillo'
  const searchResult = tweetList.filter(Boolean).filter((tweet) => tweet.text.includes(searchWord))

  console.log(tweetList)
  console.log('---')
  console.log(searchResult)

  await browser.close()
}

main()
