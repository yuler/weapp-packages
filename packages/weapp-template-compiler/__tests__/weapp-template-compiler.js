'use strict'

const fs = require('fs')
const path = require('path')
const weappTemplateCompiler = require('..')

jest.mock('mkdirp', () => {
  global.sync = path => console.log(path)
  return global
})

const mockFile = {}
fs.writeFileSync = jest.fn()
fs.writeFileSync.mockImplementation((path, content) => {
  mockFile[path] = content
})

describe('compile-weapp-file', () => {
  const sourceFile = path.resolve(__dirname, `./component.weapp`)
  const targetDir = path.resolve(__dirname, `./`)

  weappTemplateCompiler(sourceFile, targetDir)

  console.log(mockFile)
  test('json content', () => {
    const json = '{"component":true}'
    expect(mockFile[`${targetDir}/component.json`]).toBe(json)
  })

  test('html content', () => {
    const html = '<view>xxx</view>'
    expect(mockFile[`${targetDir}/component.wxml`]).toBe(html)
  })

  test('script content', () => {
    const script = 'Component({\n\n})'
    expect(mockFile[`${targetDir}/component.js`]).toBe(script)
  })

  test('style content', () => {
    const style = 'body {\n  background: white;\n}'
    expect(mockFile[`${targetDir}/component.wxss`]).toBe(style)
  })
})
