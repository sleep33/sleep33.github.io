import Parser from 'rss-parser'
import fs from 'fs-extra'
import dayjs from 'dayjs'
import { OpenAI } from 'openai'
import 'dotenv/config'

const parser = new Parser()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const RSS_URL = 'https://www.cisa.gov/news.xml'
const IMAGE_URL = 'https://source.unsplash.com/featured/?cybersecurity,hacking'

// Step 1 – Fetch latest item
const fetchLatestItem = async () => {
  const feed = await parser.parseURL(RSS_URL)
  const item = feed.items.find(i => i.title && i.link)

  if (!item) return null

  const title = item.title
  const summary =
    item.contentSnippet?.trim() ||
    `No summary provided by the source for: "${title}".`

  return {
    title,
    summary,
    link: item.link
  }
}

// Step 2 – Use OpenAI GPT-4o for analysis
const generateAIAnalysis = async ({ title, summary, link }) => {
  const prompt = `
You are a senior cyber threat intelligence analyst and writer for a leading cybersecurity publication.

Your task is to write a professional, concise and high-quality blog post about the following headline.

Headline: "${title}"

Short Source Summary: "${summary}"

Generate a clear and structured blog section that includes:

1. **Title:** Professional title of the analysis.
2. **Executive Summary:** 2–3 sentence summary describing what happened and why it matters.
3. **Offensive Security Perspective:** How attackers might leverage this event, either technically or through social engineering.
4. **Defensive Security Recommendations:** Specific steps that organizations should take to mitigate any risks.
5. **Professional Tone:** Like The Hacker News or Bleeping Computer. Use clear Markdown formatting, headings, and bullet points if needed.

Keep it under 400 words. Do not mention yourself or OpenAI in the response.
`.trim()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a senior cybersecurity analyst and technical writer.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4,
    top_p: 0.95,
    presence_penalty: 0.3,
    max_tokens: 700
  })

  return response.choices[0].message.content.trim()
}


// Step 3 – Write Markdown blog post
const writePost = async ({ title, summary, link }, aiAnalysis) => {
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

${aiAnalysis}

📎 [Read more here](${link})

---

_This article was written by sleep33._
`

  await fs.outputFile(filename, content)
  console.log(`✅ Post saved: ${filename}`)
}

// Step 4 – Main
const main = async () => {
  const item = await fetchLatestItem()
  if (!item) return console.log('⚠ No news item found.')

  try {
    const aiAnalysis = await generateAIAnalysis(item)
    await writePost(item, aiAnalysis)
  } catch (err) {
    console.error('❌ OpenAI API failed:', err.message)
  }
}

main()
