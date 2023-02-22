import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { KEYWORDS } from '../constants/keywords.js'

const DB_PATH = path.join(process.cwd(), './db/')
const LATEST_TWEETS_FILE = `${DB_PATH}latest-tweets.json`

export const parseTweetInfo = async (tweet) => {
  const tweetText = await tweet.$eval('div[lang]', (el) => el.innerText)

  if (typeof tweetText !== 'string') return ''

  const isPromoted = await tweet.$eval('span', (el) => el.innerText === 'Promoted')

  if (isPromoted) return

  const anchors = await tweet.$$eval('a', (els) => els.map((el) => el.href))
  const tweetUrl = anchors.find((url) => url.includes('status/') && !url.includes('analytics'))

  const mappedKeywords = KEYWORDS.reduce((acc, keyword) => {
    if (tweetText.toLowerCase().includes(keyword)) acc[keyword.replace(' ', '_')] = true
    return acc
  }, {})

  return {
    tweetUrl,
    text: tweetText.replaceAll('\n', ' '),
    keywords: mappedKeywords,
  }
}

export const writeDBFile = async (data) => {
  try {
    return writeFile(LATEST_TWEETS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(error)
  }
}

export const readDBFile = async () => {
  try {
    const data = await readFile(LATEST_TWEETS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(error)
  }
}
