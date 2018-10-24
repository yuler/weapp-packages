'use strict'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = weappTemplateCompiler

const tags = ['config', 'template', 'script', 'style']

function weappTemplateCompiler(sourceFile, targetDir, options = {}) {
  const parsed = parse(fs.readFileSync(sourceFile, 'utf-8'))
  mkdirp.sync(targetDir)

  let index = -1
  parsed.map(async matched => {
    index++
    if (!matched) return
    const tag = tags[index]
    const content = await handlerCompile(tag, matched)
    const basename = options.basename || path.basename(sourceFile).split('.')[0]
    writeFile(tag, content, basename, targetDir)
  })
}

function generateRegExp(tag) {
  return new RegExp(`<${tag} *(?:lang="([a-z]+)")?[^>]*>([^>]*)<\/${tag}>`, 'g')
}

function parse(content) {
  return tags.map(tag => {
    return generateRegExp(tag).exec(content)
  })
}

async function handlerCompile(tag, matched) {
  const [_, lang] = matched
  let content = matched[2]

  if (tag === 'config') {
    if (lang === 'yml') {
      content = JSON.stringify(require('js-yaml').load(content))
    }
  } else if (tag === 'template') {
    if (lang == 'pug') {
      content = require('pug').render(content.trim(), { pretty: true })
    }
  } else if (tag === 'script') {
    if (lang == "ts") {
      // @todo handler typescript
    }
  } else if (tag === 'style') {
    if (lang == "postcss") {
      const res = await require('postcss')().process(content)
      content = res.css
    }
  }
  return content.trim()
}

function writeFile(tag, content, basename, targetDir) {
  let extname
  switch (tag) {
    case 'config':
      extname = 'json'
      break
    case 'template':
      extname = 'wxml'
      break
    case 'script':
      extname = 'js'
      break
    case 'style':
      extname = 'wxss'
      break
  }
  fs.writeFileSync(`${targetDir}/${basename}.${extname}`, content)
}
