import { wikiSkillIcon } from './icons.ts'
import type { HexaSkillDef } from './types.ts'

const CHECKED = '2026-10-13'

export const COMMON_HEXA_SKILLS: HexaSkillDef[] = [
  {
    id: 'common-sol-janus',
    name: 'ソルヤーヌス',
    kind: 'common-core',
    role: 'common',
    description:
      'ソルエルダが持つ根源の力を2つの姿で引き出す。スキル使用後、方向キーを入力するとソルヤーヌス：夜明けまたはソルヤーヌス：黄昏を選択できる。ボス戦闘マップではソルヤーヌスのすべての姿を使用できない。',
    maxLevel: 30,
    jmsStatus: 'implemented',
    sourceName: 'JMS公式 職業紹介（6次職スキル） / DREAMERアップデート告知',
    sourceUrl: 'https://maplestory.nexon.co.jp/notice/view/?alias=4735e7cd317e4a83aa117d193ba0e430',
    sourceCheckedOn: CHECKED,
    iconUrl: wikiSkillIcon('Skill Sol Janus.png'),
    kmsSkillId: 500001000,
  },
  {
    id: 'common-sol-hecate',
    name: 'ソル・ヘカテ',
    kind: 'common-core',
    role: 'common',
    description:
      '対敵者の決意に導かれたソルエルダが集結し、ファミリアとして誕生する。レベルに応じて成長し、専用スキルが追加で活性化する。ON/OFFスキル。',
    maxLevel: 30,
    jmsStatus: 'implemented',
    sourceName: 'JMS公式 ソル・ヘカテガイド',
    sourceUrl: 'https://maplestory.nexon.co.jp/gameguide/growth/solhecate/',
    sourceCheckedOn: CHECKED,
    iconUrl: wikiSkillIcon('Skill Sol Hecate.png'),
    kmsSkillId: 500001005,
  },
]
