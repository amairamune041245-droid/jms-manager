import { jobCatalog } from '../factory.ts'
import type { JobHexaCatalog } from '../types.ts'

const ORIGIN_BUFF =
  '10レベル：モンスター防御率無視20%増加。20レベル：ボスモンスター攻撃時のダメージ20%増加。30レベル：モンスター防御率無視30%増加、ボスモンスター攻撃時のダメージ30%増加。'
const ASCENT_BUFF =
  '10レベル：モンスター防御率無視10%増加、ボスモンスター攻撃時のダメージ10%増加。20レベル：同効果。30レベル：モンスター防御率無視20%増加。'
const IL_NAMU =
  'https://ja.namu.wiki/w/%EC%95%84%ED%81%AC%EB%A9%94%EC%9D%B4%EC%A7%80(%EC%8D%AC%2C%EC%BD%9C)/%EC%8A%A4%ED%82%AC'
const IL_NAMU_NAME = 'ナムウィキ アークメイジ（サン、コール）/スキル'

export const ADVENTURER_HEXA: JobHexaCatalog[] = [
  jobCatalog('hero', 'https://maplestory.nexon.co.jp/job/adventurer/hero/', [
    { id: 'origin', name: 'スピリットカリバー', role: 'origin', description: `剣と魂が一体化し、すべてを斬る。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/hero/', iconFile: 'Skill Spirit Calibur.png' },
    { id: 'ascent', name: 'サイレントクリーブ', role: 'ascent', description: `剣術の極みに到達し、沈黙さえも斬り裂く。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/hero/', iconFile: 'Skill Ultrasonic Slash.png' },
    { id: 'enhance-blitz', name: 'ブリッツシールドⅥ', role: 'enhance', description: '自身の生命力を実体化させ、バリアを生成する。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/hero/', iconFile: 'Skill HEXA Blitz Shield (Hero).png', kmsSkillId: 500001015 },
  ]),
  jobCatalog('paladin', 'https://maplestory.nexon.co.jp/job/adventurer/paladin/', [
    { id: 'origin', name: 'セイクリッドバスティオン', role: 'origin', description: `光輝を放つ聖なる騎士が敵を断罪し、聖域を構築する。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/paladin/', iconFile: 'Skill Sacred Bastion.png' },
    { id: 'ascent', name: 'ドミヌスオブリオン', role: 'ascent', description: `神聖なる加護が降り注ぎ、光の鎧を身にまとい、審判の一撃を放つ。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/paladin/', iconFile: 'Skill Dominus Oblivion.png' },
    { id: 'enhance-blitz', name: 'ブリッツシールドⅥ', role: 'enhance', description: '戦士の職業群共用スキル、ブリッツシールドをさらに強化するコア。', sourceUrl: 'https://ja.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4/%EA%B3%B5%EC%9A%A9%20%EC%BD%94%EC%96%B4', iconFile: 'Skill HEXA Blitz Shield (Paladin).png', kmsSkillId: 500001017, fromNamu: true },
  ]),
  jobCatalog('darkknight', 'https://maplestory.nexon.co.jp/job/adventurer/darkknight/', [
    { id: 'origin', name: 'デッドスペース', role: 'origin', description: `闇のオーラを凝縮させた槍を投げ、周辺を一掃する。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/darkknight/', iconFile: 'Skill Dead Space.png' },
    { id: 'ascent', name: 'ダークヘリダム', role: 'ascent', description: `闇の契約を宿した槍を手にし、すべての敵を破滅へと導く。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/darkknight/', iconFile: 'Skill Dark Halidom.png' },
    { id: 'enhance-blitz', name: 'ブリッツシールドⅥ', role: 'enhance', description: '戦士の職業群共用スキル、ブリッツシールドをさらに強化するコア。', sourceUrl: 'https://ja.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4/%EA%B3%B5%EC%9A%A9%20%EC%BD%94%EC%96%B4', iconFile: 'Skill HEXA Blitz Shield (Dark Knight).png', kmsSkillId: 500001019, fromNamu: true },
  ]),
  jobCatalog('archmage-fp', 'https://maplestory.nexon.co.jp/job/adventurer/archmage01/', [
    { id: 'origin', name: 'インフェルナルベノム', role: 'origin', description: `火と毒の化身が持つ本来の力を解放させ、究極の融合魔法で周囲を一掃する。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/archmage01/', iconFile: 'Skill Infernal Venom.png' },
    { id: 'ascent', name: 'トレンシャルフレイム', role: 'ascent', description: `純粋な炎の雨で一帯を焼き尽くす。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/archmage01/', iconFile: 'Skill Immortal Flame.png' },
    { id: 'enhance-arcana', name: 'アルカナオーバーライドⅥ', role: 'enhance', description: '忘れられた古代の魔法を再現し、秘められた魔力を極限まで解放する。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/archmage01/', iconFile: 'Skill HEXA Arcane Overdrive (Fire, Poison).png', kmsSkillId: 500001021 },
  ]),
  jobCatalog(
    'archmage-il',
    'https://maplestory.nexon.co.jp/job/adventurer/archmage02/',
    [
      { id: 'origin', name: 'フローズンライトニング', role: 'origin', description: `高圧の稲妻を極限の冷気で凝縮した後に爆発させ、稲妻が走る凍土を具現化する。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/archmage02/', iconFile: 'Skill Frozen Lightning.png' },
      { id: 'ascent', name: 'パラボリックボルト', role: 'ascent', description: `太古の稲妻を放ち、自由奔放に走る電流を生成する。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/archmage02/', iconFile: 'Skill Parabolic Bolt.png' },
      { id: 'boost-subzero', name: 'サブゼロパーミネーション', role: 'boost', description: '極限の冷気と雷を組み合わせて融合爆発を起こす。再使用待機時間30秒。JMSのゲーム画面ではこのスキルコア枠は未解放。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, listed: false, iconUrl: 'https://i.namu.wiki/i/52NS42niHYEbQDkEBf3CQwkyHk0vSEH4SLSAFFeEpX_u4I5_bSiE0BKjizSTJHBEzwXjlGaNUHXMPtTSttcmTw.webp' },
      { id: 'mastery-chain', name: 'チェインライトニングⅥ', role: 'mastery', description: '周囲の敵に連鎖する高圧の電流を放つ。チェインライトニングの6次強化。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, iconFile: 'Skill HEXA Chain Lightning.png' },
      { id: 'mastery-orb', name: 'フローズンオーブⅥ', role: 'mastery', description: '氷の破片でフローズンオーブを作り、前方へ投げる。同じコアにブリザードⅥがある。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, iconFile: 'Skill HEXA Frozen Orb.png' },
      { id: 'mastery-spear', name: 'ライトニングスフィアⅥ', role: 'mastery', description: '前方に巨大な電気の球を発生させ、持続で攻撃する。同じコアにクライオショックがある。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, iconFile: 'Skill HEXA Lightning Orb.png' },
      { id: 'mastery-thunder', name: 'サンダースフィアⅥ', role: 'mastery', description: '稲妻が凝縮した球体を召喚し、周囲を電流帯にする。同じコアにエルクィネスⅥがある。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, iconFile: 'Skill HEXA Thunder Sphere.png' },
      { id: 'enhance-frost', name: 'フロストアーク強化', role: 'enhance', description: 'フロストアークを強化する。30レベルで最終ダメージ60%増加、とナムウィキにある。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, iconUrl: 'https://i.namu.wiki/i/lLP2DX6qKblkl1ZWwOlVr98E8UQO98hm9OWu8JZ_bNp7iOAD_EbVEqOzlJaDgOKaDNw5c8KugUWvT0Pe_fBOqw.png' },
      { id: 'enhance-break', name: 'サンダーブレイク強化', role: 'enhance', description: 'サンダーブレイクを強化する。30レベルで最終ダメージ60%増加、とナムウィキにある。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, iconFile: 'Skill Bolt Barrage.png' },
      { id: 'enhance-snow', name: 'スピリットオブスノー強化', role: 'enhance', description: 'スピリットオブスノーを強化する。30レベルで最終ダメージ60%増加、とナムウィキにある。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, iconFile: 'Skill Spirit of Snow.png' },
      { id: 'enhance-jupiter', name: 'ジュピターサンダー強化', role: 'enhance', description: 'ジュピターサンダーを強化する。30レベルで最終ダメージ60%増加、とナムウィキにある。', sourceUrl: IL_NAMU, sourceName: IL_NAMU_NAME, fromNamu: true, iconFile: 'Skill Jupiter Thunder.png' },
      { id: 'enhance-arcana', name: 'アルカナオーバーライドⅥ', role: 'enhance', description: '魔法使いの職業群共用スキル、アルカナオーバーライドをさらに強化するコア。', sourceUrl: 'https://ja.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4/%EA%B3%B5%EC%9A%A9%20%EC%BD%94%EC%96%B4', iconFile: 'Skill HEXA Arcane Overdrive (Ice, Lightning).png', kmsSkillId: 500001022, fromNamu: true },
    ],
    '氷雷のマスタリー名はJMS公式のチェインライトニング、フローズンオーブ、ライトニングスフィア、サンダースフィアに合わせた。3つ目のスキルコアはゲーム画面では未解放。',
  ),
  jobCatalog('bishop', 'https://maplestory.nexon.co.jp/job/adventurer/bishop/', [
    { id: 'origin', name: 'ホーリーアドベント', role: 'origin', description: `すべての神聖力を開放し、格の高い存在を降臨させる。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/bishop/', iconFile: 'Skill Holy Advent.png' },
    { id: 'ascent', name: 'コマンドオブヘヴン', role: 'ascent', description: `慈愛と復讐の天使が顕現し、世界を浄化する。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/bishop/', iconFile: 'Skill Commandment of Heaven.png' },
    { id: 'enhance-arcana', name: 'アルカナオーバーライドⅥ', role: 'enhance', description: '忘れられた古代の魔法を再現し、秘められた魔力を極限まで解放する。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/bishop/', iconFile: 'Skill HEXA Arcane Overdrive (Bishop).png', kmsSkillId: 500001023 },
  ]),
  jobCatalog('bowmaster', 'https://maplestory.nexon.co.jp/job/adventurer/bowmaster/', [
    { id: 'origin', name: 'アセンダントシェード', role: 'origin', description: `空を覆い尽くすほど大量の矢を放つ。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/bowmaster/', iconFile: 'Skill Ascendant Shadow.png' },
    { id: 'ascent', name: 'ポイントゼロ', role: 'ascent', description: `幻影と共に凝縮されたエネルギーの矢を一斉に放つ。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/bowmaster/', iconFile: 'Skill Flashpoint.png' },
    { id: 'enhance-evolve', name: 'エボルブⅥ', role: 'enhance', description: '射手の職業群共用スキル、エボルブをさらに強化するコア。', sourceUrl: 'https://ja.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4/%EA%B3%B5%EC%9A%A9%20%EC%BD%94%EC%96%B4', fromNamu: true },
  ]),
  jobCatalog('marksman', 'https://maplestory.nexon.co.jp/job/adventurer/crossbowmaster/', [
    { id: 'origin', name: 'ファイナルエイム', role: 'origin', description: `狙撃術の極意を悟り、遠距離でも敵を正確に撃ち抜く。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/crossbowmaster/', iconFile: 'Skill Final Aim.png' },
    { id: 'ascent', name: 'フェイタルトリガー', role: 'ascent', description: `絶滅の力を宿した矢を装填し、二発に渡って経路内のすべてを一掃する。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/crossbowmaster/', iconFile: 'Skill Fatal Trigger.png' },
    { id: 'enhance-evolve', name: 'エボルブⅥ', role: 'enhance', description: '射手の職業群共用スキル、エボルブをさらに強化するコア。', sourceUrl: 'https://ja.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4/%EA%B3%B5%EC%9A%A9%20%EC%BD%94%EC%96%B4', fromNamu: true },
  ]),
  jobCatalog('pathfinder', 'https://maplestory.nexon.co.jp/job/adventurer/pathfinder/', [
    { id: 'origin', name: 'フォーセイクンレリック', role: 'origin', description: `レリックに宿る呪いを完全に支配し、強力な呪いの力が宿る弓術を駆使する。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/pathfinder/', iconFile: 'Skill Forsaken Relic.png' },
    { id: 'ascent', name: 'レリックペネトレーション', role: 'ascent', description: `濃密なレリックのオーラを弓に凝縮し、すべてを貫く呪の矢を放つ。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/pathfinder/', iconFile: 'Skill Piercing Relic.png' },
    { id: 'enhance-evolve', name: 'エボルブⅥ', role: 'enhance', description: '神秘的な力でレイヴンを一定時間強化する。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/pathfinder/' },
  ]),
  jobCatalog('nightlord', 'https://maplestory.nexon.co.jp/job/adventurer/nightload/', [
    { id: 'origin', name: '生殺与奪', role: 'origin', description: `永劫の時空に敵を閉じ込め、すべての生命体の生殺与奪の権を握る。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/nightload/', iconFile: 'Skill Life and Death.png' },
    { id: 'ascent', name: 'クルーシャルアサルト', role: 'ascent', description: `究極の力を宿したお守りを広げ、敵の抵抗を瞬時に打ち消す。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/nightload/', iconFile: 'Skill Deep Strike.png' },
    { id: 'enhance-ds', name: 'アルティメットダークサイトⅥ', role: 'enhance', description: '潜伏技術を極限まで磨き上げ、ダークサイト中でも攻撃できる。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/nightload/', iconFile: 'Skill HEXA Shadow Walker (Night Lord).png' },
  ]),
  jobCatalog('shadower', 'https://maplestory.nexon.co.jp/job/adventurer/shadower/', [
    { id: 'origin', name: '一刀両断', role: 'origin', description: `隠密かつ迅速に敵を退治する。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/shadower/', iconFile: 'Skill Halve Cut.png' },
    { id: 'ascent', name: 'オーセンティックダークネス', role: 'ascent', description: `短剣が闇の中をかすめて通り過ぎると、無数のコインが金色の破片のように舞い散る。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/shadower/', iconFile: 'Skill Covetous Darkness.png' },
    { id: 'enhance-ds', name: 'アルティメットダークサイトⅥ', role: 'enhance', description: '潜伏技術を極限まで磨き上げ、ダークサイト中でも攻撃できる。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/shadower/', iconFile: 'Skill HEXA Shadow Walker (Shadower).png' },
  ]),
  jobCatalog('dualblade', 'https://maplestory.nexon.co.jp/job/adventurer/dualblade/', [
    { id: 'origin', name: 'カルマブレイド', role: 'origin', description: `業火の神を剣に降臨させる。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/dualblade/', iconFile: 'Skill Karma Blade.png' },
    { id: 'ascent', name: 'ヤマズディクリー', role: 'ascent', description: `断罪の力を解き放ち、逃れられぬ審判を下す。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/dualblade/', iconFile: "Skill Yama's Decree.png" },
    { id: 'enhance-ds', name: 'アルティメットダークサイトⅥ', role: 'enhance', description: '潜伏技術を極限まで磨き上げ、ダークサイト中でも攻撃できる。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/dualblade/', iconFile: 'Skill HEXA Shadow Walker (Dual Blade).png' },
  ]),
  jobCatalog('viper', 'https://maplestory.nexon.co.jp/job/adventurer/viper/', [
    { id: 'origin', name: 'リバレートネプトゥーヌス', role: 'origin', description: `深淵の海に眠っていた最初の水龍ネプトゥーヌスを呼び覚ます。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/viper/', iconFile: 'Skill Unleash Neptunus.png' },
    { id: 'ascent', name: 'ヘイメイカー', role: 'ascent', description: `相手の急所を狙って強力なカウンターを放つ。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/viper/', iconFile: 'Skill Haymaker.png' },
    { id: 'enhance-flag', name: 'パイレーツフラッグⅥ', role: 'enhance', description: '勇敢な海賊の旗を掲げて、自身を含むグループメンバーの士気を上げる。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/viper/', iconFile: "Skill HEXA Pirate's Banner (Buccaneer).png" },
  ]),
  jobCatalog('captain', 'https://maplestory.nexon.co.jp/job/adventurer/captain/', [
    { id: 'origin', name: 'ドレッドノート', role: 'origin', description: `恐れを知らない艦長の指揮のもとで巨大な艦船が現れる。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/captain/', iconFile: 'Skill The Dreadnought.png' },
    { id: 'ascent', name: 'ファイアクラッカー', role: 'ascent', description: `銃口を空に向けて無数の弾丸を撃ちまくる。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/captain/', iconFile: 'Skill Firecracker Fusillade.png' },
    { id: 'enhance-flag', name: 'パイレーツフラッグⅥ', role: 'enhance', description: '勇敢な海賊の旗を掲げて、自身を含むグループメンバーの士気を上げる。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/captain/', iconFile: "Skill HEXA Pirate's Banner (Corsair).png" },
  ]),
  jobCatalog('cannoneer', 'https://maplestory.nexon.co.jp/job/adventurer/cannonshooter/', [
    { id: 'origin', name: 'スーパーキャノンエクスプロージョン', role: 'origin', description: `巨大なキャノンを飛ばし、一掃する。${ORIGIN_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/cannonshooter/', iconFile: 'Skill Super Cannon Explosion.png' },
    { id: 'ascent', name: 'バレル・オブ・モンキーズ', role: 'ascent', description: `空に向かって小型砲弾を素早く撃ち上げ、周囲一帯を崩壊させる。${ASCENT_BUFF}`, sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/cannonshooter/', iconFile: 'Skill Barrel of Monkeys.png' },
    { id: 'enhance-flag', name: 'パイレーツフラッグⅥ', role: 'enhance', description: '勇敢な海賊の旗を掲げて、自身を含むグループメンバーの士気を上げる。', sourceUrl: 'https://maplestory.nexon.co.jp/job/adventurer/cannonshooter/', iconFile: "Skill HEXA Pirate's Banner (Cannoneer).png" },
  ]),
]
