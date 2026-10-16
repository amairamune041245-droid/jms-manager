import { readFileSync, writeFileSync } from 'node:fs'
import { namuDraftsFor } from '../src/data/hexa/jobs/namuExtra.ts'
import { JOBS } from '../src/data/jobs.ts'

const official = JSON.parse(readFileSync(new URL('./jms-official.json', import.meta.url), 'utf8'))

/** ナムウィキの見出しと公式名が表記違いのときだけ、公式ページに実在する名前へ寄せる。 */
const MANUAL = {
  paladin: {
    'ブラストVI': 'ブレスト',
    'サンクチュアリVI': 'セングチュアリ',
    'マイティミョルニル強化': 'マイティートールハンマー',
  },
  bishop: {
    'エンジェルオブジェミニ強化': 'エンジェルオブリブラ',
  },
  bowmaster: {
    '嵐の詩VI': '風の詩',
    'クイバーカートリッジVI': 'クイヴァーカートリッジ',
    'クイバーフルバースト強化': 'クイヴァーフルバースト',
  },
  nightlord: {
    'スローブラッシング強化': 'スローブラスト',
  },
  aran: {
    'ブーストエンド-アドレナリンサージ強化': 'ブーストエンド - アドレナリンサージサージ',
    'ブーストエンド-ハンターズターゲティングVI': 'ブーストエンド - ハンターズターゲッティング',
  },
  pathfinder: {
    'エンシェントテンペスト強化': 'レイヴンテンペスト',
  },
  windbreaker: {
    'トライフリングウィムVI': 'トリフリングウィムIII',
  },
  darkknight: {
    'ビホルダーズリベンジVI': 'ダークスピリットリベンジ',
    'ビホルダーショックVI': 'ダークスピリットショック',
    'ダークスフィア強化': 'ダークスピア',
    'ビホルダーインパクト強化': 'ダークスピリットインパクト',
  },
  demonavenger: {
    'エクシード：エクスキューションVI': 'エクシード：エグゼキューション',
    'レヴナント強化': 'レバナント',
  },
  kain: {
    'ドラゴンバースト強化': '[発現] ドラゴンバースト',
    'フェイタルブリッツ強化': '[処刑] フェイタルブリッツ',
  },
  hayato: {
    '［迅速］沈没の満潮強化': '[迅速] 沈む満潮',
    '［迅速］疾走の閃光強化': '[迅速] 駆ける閃光',
    '［抜刀］哀号の天光強化': '[抜刀] 轟く天光',
  },
  len: {
    '梅花剣本初：先斬VI': '梅花剣・本招：旋斬',
    '亡魂剣本初：迎撃VI': '蠎魂剣・本招：霊撃・参',
    '梅花剣二招式：砕梅VI': '梅花剣・弐招：砕梅',
  },
  kanna: {
    '［精霊］百面金毛十尾狐強化': '[魂令] 白面金毛の十尾',
    '［精霊］部分解放：燃炎光刃強化': '[魂令] 限定解放：焚炎狂殺',
    '［精霊］部分解放：黒翼破天強化': '[魂令] 限定解放：黒翼破天',
    '［精霊］部分解放：絶魂毒牙強化': '[魂令] 限定解放：絶魂毒牙',
    '召喚：鬼VI': '召喚：オニ',
    '召喚：大蛇VI': '召喚：オロチ',
    '破魂符：武VI': '破魂符 -舞-',
  },
  mercedes: {
    'シルフィディア強化': 'シルピディア',
    'イルカラの息吹強化': 'イルカルラの息吹',
    'ファイナルアタックVI': 'アドバンスドファイナルアタック',
  },
  shade: {
    '喚魂妖狐陣強化': '還魂妖狐陣',
  },
  ark: {
    '漏れ出す悪夢強化': 'にじみ出る悪夢',
    '永遠に飢える獣強化': '永遠に飢え続ける獣',
  },
  lara: {
    '大きな伸び強化': 'のびのび',
    '海・川・山・風強化': '太陽と川と山と風',
    '湧き上がる精気強化': 'ほとばしる精気',
    '山稜うねうね強化': 'そびえ立つ山',
    '精気まきVI': '精気撒布',
  },
  striker: {
    '神雷合一強化': '身雷合一',
  },
  hoyoung: {
    '吸星渦流VI': '巻術：吸星渦流',
    '拳術：山霊召喚強化': '巻術：山霊召喚',
  },
  luminous: {
    'パニッシングリゾネーター強化': 'パニシングレゾネータ',
  },
  battlemage: {
    'アビシアルライトニング強化': 'アビサルライトニング',
    'クリムゾンパクタム': 'クリムゾンファクタム',
  },
  cannoneer: {
    'ビッグフューズギガンティックキャノンボール強化': 'ビックヒューズギガンティックキャノンボール',
  },
  kaiser: {
    'インフェルナルブレスVI': 'インフェルノブレス',
  },
  xenon: {
    'パージロップマスカレードVI：狙撃': 'ファジーロップマスカレード：狙撃',
  },
}

function norm(value) {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(/強化$/, '')
    .replace(/(?:Ⅵ|VI)+$/gi, '')
    .replace(/[・:：\-‐−/／\[\]［］()（）|｜]/g, '')
    .replace(/[ァィゥェォッャュョ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 1))
    .replace(/ヴ/g, 'ブ')
    .replace(/ー/g, '')
    .toLowerCase()
}

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + cost)
      previous = current
    }
  }
  return row[b.length]
}

function allSkills(jobId) {
  return official[jobId]?.skills ?? []
}

const HYPER_PASSIVE =
  /リインフォース|イグノア|ボーナス|パーシスト|エンハンス|クールタイム|クリティカル|エクストラ|リデュース|アドレンジ|スプレッド|メイクアップ|ファストムーブ|イミュニティ/

function candidates(jobId) {
  return allSkills(jobId).filter((skill) => {
    if (!skill.section.includes('ハイパー')) return true
    return !HYPER_PASSIVE.test(skill.name)
  })
}

function findByName(jobId, officialName) {
  const wanted = norm(officialName)
  return allSkills(jobId).find((skill) => norm(skill.name) === wanted) ?? null
}

function autoMatch(jobId, raw) {
  const stem = raw.replace(/強化$/, '').replace(/(?:Ⅵ|VI)+$/gi, '')
  const wanted = norm(stem)
  const skills = candidates(jobId)
  const exact = skills.filter((skill) => norm(skill.name) === wanted)
  if (exact.length === 1) return exact[0]
  if (exact.length > 1) {
    const plain = exact.filter((skill) => !skill.name.endsWith('強化'))
    if (plain.length === 1) return plain[0]
  }
  let best = null
  let bestDistance = 99
  let ties = 0
  for (const skill of skills) {
    const score = distance(wanted, norm(skill.name))
    if (score < bestDistance) {
      best = skill
      bestDistance = score
      ties = 1
    } else if (score === bestDistance) {
      ties += 1
    }
  }
  const officialNorm = best ? norm(best.name) : ''
  const lengthGap = Math.abs(wanted.length - officialNorm.length)
  if (best && ties === 1 && bestDistance <= 1 && lengthGap <= 1) return best
  return null
}

function blurb(explain) {
  return explain.split(/\n10レベル/)[0].replace(/\n/g, '').trim()
}

const sixthOut = {}
const renames = {}
const unmatched = []

for (const job of JOBS) {
  if (job.id === 'archmage-il') continue
  const page = official[job.id]
  const sixth = page?.sixth ?? []
  const rest = sixth.filter((skill) => skill.name !== 'ソルヤーヌス' && !skill.name.startsWith('ソル・ヘカテ'))
  if (rest.length !== 3) {
    console.error('unexpected sixth', job.id, sixth.map((skill) => skill.name))
    continue
  }
  const [origin, ascent, shared] = rest
  sixthOut[job.id] = {
    url: page.url,
    origin: { name: origin.name, text: blurb(origin.explain), icon: origin.icon },
    ascent: { name: ascent.name, text: blurb(ascent.explain), icon: ascent.icon },
    shared: { name: shared.name, text: blurb(shared.explain), icon: shared.icon },
  }
  const jobRenames = {}
  for (const draft of namuDraftsFor(job.id)) {
    if (draft.role !== 'mastery' && draft.role !== 'enhance') continue
    if (draft.shared) continue
    const manualName = MANUAL[job.id]?.[draft.name]
    const skill = manualName ? findByName(job.id, manualName) : autoMatch(job.id, draft.name)
    if (!skill) {
      unmatched.push(`${job.id}\t${draft.role}\t${draft.name}${manualName ? `\tMANUAL MISS ${manualName}` : ''}`)
      continue
    }
    jobRenames[draft.name] = { name: skill.name, icon: skill.icon }
  }
  renames[job.id] = jobRenames
}

writeFileSync(
  new URL('../src/data/hexa/jobs/officialSixth.data.ts', import.meta.url),
  `// Generated by scripts/generate-official-hexa.mjs from JMS official job pages.\nexport const OFFICIAL_SIXTH = ${JSON.stringify(sixthOut, null, 2)} as const\n\nexport const CORE_RENAMES: Record<string, Record<string, { name: string; icon: string }>> = ${JSON.stringify(renames, null, 2)}\n`,
)
console.log(`jobs ${Object.keys(sixthOut).length}`)
console.log(`unmatched ${unmatched.length}`)
console.log(unmatched.join('\n'))
