import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export async function getMarkdown() {
  const fileContents = fs.readFileSync(
    join(process.cwd(), `content.md`),
    'utf8'
  )
  const { data, content } = matter(fileContents)

  const result = await remark().use(html).process(content)
  return result.toString()
}
