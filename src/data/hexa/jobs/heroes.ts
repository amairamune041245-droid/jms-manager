import { jobCatalog } from '../factory.ts'
import type { JobHexaCatalog } from '../types.ts'

export const HERO_HEXA: JobHexaCatalog[] = [
  jobCatalog('luminous', 'https://maplestory.nexon.co.jp/job/hero/luminous/', [
    {
      id: 'origin',
      name: 'ハーモニックパラドックス',
      role: 'origin',
      description:
        '光と闇の真理に到達した調和の思念体を召喚する。10レベル：モンスター防御率無視20%増加。20レベル：ボスモンスター攻撃時のダメージ20%増加。30レベル：モンスター防御率無視30%増加、ボスモンスター攻撃時のダメージ30%増加。',
      sourceUrl: 'https://maplestory.nexon.co.jp/job/hero/luminous/',
      iconFile: 'Skill Harmonic Paradox.png',
    },
    {
      id: 'ascent',
      name: 'ラストラスオーブ',
      role: 'ascent',
      description:
        '闇の力で全域を侵食し、光の力をオーブで増幅させて世界を目覚めさせる。10レベル：モンスター防御率無視10%増加、ボスモンスター攻撃時のダメージ10%増加。30レベル：モンスター防御率無視20%増加。',
      sourceUrl: 'https://maplestory.nexon.co.jp/job/hero/luminous/',
      iconFile: 'Skill Lustrous Orb.png',
    },
    {
      id: 'enhance-fried',
      name: 'フリードの加護Ⅵ',
      role: 'enhance',
      description:
        '英雄フリードが仲間のために残しておいた力を手に入れることができる。',
      sourceUrl: 'https://maplestory.nexon.co.jp/job/hero/luminous/',
      iconFile: "Skill HEXA Freud's Wisdom (Luminous).png",
    },
  ]),
]
