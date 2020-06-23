const { promises: fs } = require('fs')
const path = require('path')
const { version } = require('../package.json')

const files = ['../README.md', '../README.zh-CN.md']

const MakeLinks = (version, vueVersion = '2.6') =>
  `
\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/vue@${vueVersion}"></script>
<script src="https://cdn.jsdelivr.net/npm/@vue/composition-api@${version}"></script>
\`\`\`
`

;(async () => {
  const links = MakeLinks(version)

  for (const file of files) {
    const filepath = path.resolve(__dirname, file)
    const raw = await fs.readFile(filepath, 'utf-8')

    const updated = raw.replace(
      /<!--cdn-links-start-->([\s\S]*)<!--cdn-links-end-->/g,
      `<!--cdn-links-start-->${links}<!--cdn-links-end-->`
    )

    await fs.writeFile(filepath, updated, 'utf-8')
  }
})()
