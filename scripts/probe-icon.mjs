const url = 'https://namu.moe/w/' + encodeURIComponent('히어로(메이플스토리)') + '/%EC%8A%A4%ED%82%AC'
const html = await (await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })).text()
for (const key of ['i.namu.wiki', 'namu.wiki/i/', 'data-src', 'file.namu.moe']) {
  console.log(key, html.split(key).length - 1)
}
const i = html.indexOf('레이징 블로우 VI 아이콘')
console.log(html.slice(i - 200, i + 500))
