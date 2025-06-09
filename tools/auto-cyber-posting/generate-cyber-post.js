import Parser from 'rss-parser'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import dayjs from 'dayjs'
import 'dotenv/config'

const parser = new Parser()
const RSS_URL = 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss-analyzed.xml'
const IMAGE_URL = 'https://source.unsplash.com/featured/?cybersecurity,hacking'

const fetchLatestCVE = async () => {
  const feed = await parser.parseURL(RSS_URL)
  return feed.items[0] ? {
    title: feed.items[0].title,
    summary: feed.items[0].contentSnippet,
    link: feed.items[0].link
  } : null
}

const summarizeWithHuggingFace = async (inputText) => {
  const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: inputText })
  })
  const data = await response.json()
  return data?.[0]?.summary_text || inputText
}

const writePost = async ({ title, summary, link }, aiSummary) => {
  const date = dayjs().format('YYYY-MM-DD')
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
  const filename = `_posts/${date}-${slug}.md`

  const content = `---
title: "${title}"
date: ${date}
categories: [Cyber]
tags: [CVE, offensive-security, vulnerabilities]
layout: post
image:
  path: ${IMAGE_URL}
---

## 🔍 Summary

${summary}

## 🧠 AI Analysis

${aiSummary}

📎 [Read more here](${link})

---

_This article was written by sleep33._
`

  await fs.outputFile(filename, content)
  console.log(`✅ Post saved: ${filename}`)
}

const main = async () => {
  const cve = await fetchLatestCVE()
  if (!cve) return console.log('⚠ No CVE found.')
  const aiSummary = await summarizeWithHuggingFace(`${cve.title}. ${cve.summary}`)
  await writePost(cve, aiSummary)
}

main()
