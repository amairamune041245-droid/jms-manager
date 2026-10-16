import { writeFileSync } from 'node:fs'

const JOBS = [
  ['hero', '/job/adventurer/hero/'],
  ['paladin', '/job/adventurer/paladin/'],
  ['darkknight', '/job/adventurer/darkknight/'],
  ['archmage-fp', '/job/adventurer/archmage01/'],
  ['archmage-il', '/job/adventurer/archmage02/'],
  ['bishop', '/job/adventurer/bishop/'],
  ['bowmaster', '/job/adventurer/bowmaster/'],
  ['marksman', '/job/adventurer/crossbowmaster/'],
  ['pathfinder', '/job/adventurer/pathfinder/'],
  ['nightlord', '/job/adventurer/nightload/'],
  ['shadower', '/job/adventurer/shadower/'],
  ['dualblade', '/job/adventurer/dualblade/'],
  ['viper', '/job/adventurer/viper/'],
  ['captain', '/job/adventurer/captain/'],
  ['cannoneer', '/job/adventurer/cannonshooter/'],
  ['soulmaster', '/job/cygnus/soulmaster/'],
  ['flamewizard', '/job/cygnus/flamewizard/'],
  ['windbreaker', '/job/cygnus/windshooter/'],
  ['nightwalker', '/job/cygnus/nightwalker/'],
  ['striker', '/job/cygnus/striker/'],
  ['mihile', '/job/cygnus/mikhail/'],
  ['aran', '/job/hero/aran/'],
  ['evan', '/job/hero/evan/'],
  ['mercedes', '/job/hero/mercedes/'],
  ['phantom', '/job/hero/phantom/'],
  ['luminous', '/job/hero/luminous/'],
  ['shade', '/job/hero/eunwol/'],
  ['blaster', '/job/resistance/blaster/'],
  ['battlemage', '/job/resistance/battlemage/'],
  ['wildhunter', '/job/resistance/wildhunter/'],
  ['mechanic', '/job/resistance/mechanic/'],
  ['demonslayer', '/job/resistance/demonslayer/'],
  ['demonavenger', '/job/resistance/demonavenger/'],
  ['xenon', '/job/resistance/xenon/'],
  ['kaiser', '/job/nova/kaiser/'],
  ['angelicbuster', '/job/nova/angelicbuster/'],
  ['cadena', '/job/nova/cadena/'],
  ['kain', '/job/nova/kain/'],
  ['illium', '/job/lef/illium/'],
  ['ark', '/job/lef/ark/'],
  ['adele', '/job/lef/adele/'],
  ['khali', '/job/lef/khali/'],
  ['hayato', '/job/akatsuki/hayato/'],
  ['kanna', '/job/akatsuki/kanna/'],
  ['hoyoung', '/job/anima/hoyoung/'],
  ['lara', '/job/anima/lara/'],
  ['len', '/job/anima/len/'],
  ['zero', '/job/kaminoko/zero/'],
  ['kinesis', '/job/friendsworld/kinesis/'],
  ['lynn', '/job/childofforest/lynn/'],
]

function decode(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

function parse(html) {
  const sections = []
  const sectionRe = /<dt><span>([^<]*)<\/span><\/dt>\s*<dd><table class="table-skill">([\s\S]*?)<\/table>/g
  let section
  while ((section = sectionRe.exec(html))) {
    const skills = []
    const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/g
    let row
    while ((row = rowRe.exec(section[2]))) {
      if (row[1].includes('<th')) continue
      const name = decode(row[1].match(/<td class="skill-name">([\s\S]*?)<\/td>/)?.[1] ?? '').replace(/\n/g, '')
      const explain = decode(row[1].match(/<td class="explain">([\s\S]*?)<\/td>/)?.[1] ?? '')
      const icon = row[1].match(/<img[^>]+src="([^"]+)"/)?.[1] ?? ''
      if (!name) continue
      skills.push({ name, explain, icon })
    }
    sections.push({ title: decode(section[1]), skills })
  }
  return sections
}

const out = {}
let cursor = 0
async function worker() {
  while (cursor < JOBS.length) {
    const index = cursor
    cursor += 1
    const [jobId, path] = JOBS[index]
    const url = `https://maplestory.nexon.co.jp${path}`
    const response = await fetch(url)
    const html = await response.text()
    const sections = parse(html)
    const sixth = sections.find((section) => section.title.includes('6次'))
    out[jobId] = {
      url,
      sixth: sixth?.skills ?? [],
      skills: sections.flatMap((section) =>
        section.skills.map((skill) => ({ name: skill.name, icon: skill.icon, section: section.title })),
      ),
    }
    console.log(`${jobId}\t${response.status}\tsections ${sections.length}\tsixth ${sixth?.skills.length ?? 0}`)
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()))
writeFileSync(new URL('./jms-official.json', import.meta.url), JSON.stringify(out, null, 2))
