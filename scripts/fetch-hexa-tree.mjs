const jobs = [
  ['hero', '히어로'],
  ['paladin', '팔라딘'],
  ['darkknight', '다크나이트'],
  ['archmage-fp', '아크메이지(불,독)'],
  ['archmage-il', '아크메이지(썬,콜)'],
  ['bishop', '비숍'],
  ['bowmaster', '보우마스터'],
  ['marksman', '신궁'],
  ['pathfinder', '패스파인더'],
  ['nightlord', '나이트로드'],
  ['shadower', '섀도어'],
  ['dualblade', '듀얼블레이드'],
  ['viper', '바이퍼'],
  ['captain', '캡틴'],
  ['cannoneer', '캐논슈터'],
  ['soulmaster', '소울마스터'],
  ['flamewizard', '플레임위자드'],
  ['windbreaker', '윈드브레이커'],
  ['nightwalker', '나이트워커'],
  ['striker', '스트라이커'],
  ['mihile', '미하일'],
  ['aran', '아란'],
  ['evan', '에반'],
  ['mercedes', '메르세데스'],
  ['phantom', '팬텀'],
  ['luminous', '루미너스'],
  ['shade', '은월'],
  ['blaster', '블래스터'],
  ['battlemage', '배틀메이지'],
  ['wildhunter', '와일드헌터'],
  ['mechanic', '메카닉'],
  ['demonslayer', '데몬슬레이어'],
  ['demonavenger', '데몬어벤져'],
  ['xenon', '제논'],
  ['kaiser', '카이저'],
  ['angelicbuster', '엔젤릭버스터'],
  ['cadena', '카데나'],
  ['kain', '카인'],
  ['illium', '일리움'],
  ['ark', '아크'],
  ['adele', '아델'],
  ['khali', '칼리'],
  ['hayato', '하야토'],
  ['kanna', '칸나'],
  ['hoyoung', '호영'],
  ['lara', '라라'],
  ['len', '렌'],
  ['zero', '제로'],
  ['kinesis', '키네시스'],
]

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

function candidates(jobId, title) {
  const extra = {
    dualblade: ['듀얼블레이더', '듀얼블레이더(메이플스토리)'],
    demonslayer: ['데몬 슬레이어', '데몬 슬레이어(메이플스토리)'],
    demonavenger: ['데몬 어벤져', '데몬 어벤져(메이플스토리)'],
    shadower: ['쉐도어', '쉐도어(메이플스토리)'],
    cannoneer: ['캐논마스터', '캐논마스터(메이플스토리)'],
  }
  return [title, `${title}(메이플스토리)`, ...(extra[jobId] ?? [])]
}

async function fetchTitle(title) {
  const url = `https://namu.moe/w/${encodeURIComponent(title)}/%EC%8A%A4%ED%82%AC`
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
  if (!response.ok) return null
  const html = await response.text()
  if (!html.includes('HEXA')) return null
  return { url: response.url, html }
}

function parseToc(html) {
  const items = []
  const re = /<span class='toc-item'><a href='#s-([^']+)'>[^<]*<\/a>\.\s*([\s\S]*?)<\/span>/g
  let match
  while ((match = re.exec(html))) {
    const name = decodeEntities(match[2].replace(/<[^>]+>/g, ''))
    items.push({ id: match[1], name })
  }
  return items
}

function children(items, parentId) {
  const depth = parentId.split('.').length
  return items.filter((item) => item.id.startsWith(`${parentId}.`) && item.id.split('.').length === depth + 1)
}

function nodeLabel(items, node) {
  const kids = children(items, node.id).map((kid) => kid.name)
  return kids.length > 0 ? `${node.name} :: ${kids.join(' | ')}` : node.name
}

function extract(html) {
  const items = parseToc(html)
  const hexa =
    items.find((item) => item.name.includes('HEXA') && !item.id.includes('.')) ??
    items.find((item) => item.name.includes('HEXA'))
  if (!hexa) return null
  const groups = children(items, hexa.id)
  const take = (label) => {
    const group = groups.find((item) => item.name.includes(label))
    return group ? children(items, group.id).map((item) => nodeLabel(items, item)) : []
  }
  return {
    mastery: take('마스터리'),
    enhance: take('강화'),
    skill: take('스킬'),
    common: take('공용'),
  }
}

const out = {}
for (const [jobId, title] of jobs) {
  const titles = [...new Set(candidates(jobId, title))]
  let found = null
  for (const candidate of titles) {
    const page = await fetchTitle(candidate)
    if (!page) continue
    const data = extract(page.html)
    if (!data || data.mastery.length + data.skill.length === 0) continue
    found = { title: candidate, url: page.url, ...data }
    break
  }
  if (!found) {
    out[jobId] = { title, error: 'missing', mastery: [], enhance: [], skill: [], common: [] }
    console.log(`${jobId}\tMISSING`)
    continue
  }
  out[jobId] = found
  const nested = [...found.mastery, ...found.enhance, ...found.skill, ...found.common].filter((line) => line.includes('::')).length
  console.log(`${jobId}\tok\tnested ${nested}`)
}

const fs = await import('node:fs')
fs.writeFileSync(new URL('./hexa-tree.json', import.meta.url), JSON.stringify(out, null, 2))
