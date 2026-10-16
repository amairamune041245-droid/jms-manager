import type { JobSkillDraft } from '../factory.ts'

const SOURCE = 'ナムウィキ スキル（HEXA欄）'

type Row = {
  url: string
  origin?: string
  ascent?: string
  boost?: string
  mastery: readonly string[]
  enhance: readonly string[]
  shared?: readonly [string, string]
}

/** 見出しはナムウィキのHEXA欄。複数スキルは | 区切りで、表示名は先頭。 */
const ROWS: Record<string, Row> = {
  hero: {
    url: 'https://namu.moe/w/%ED%9E%88%EC%96%B4%EB%A1%9C(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'レイジエクスプロージョン',
    mastery: ['レイジングブローVI', 'レイジアップライジングVI', 'オーラブレードVI|フューリアスエッジ', 'ヴァルハラVI|インサイジングVI|ファイナルアタックVI'],
    enhance: ['ソードオブバーニングソウル強化', 'コンボデスフォルト強化', 'コンボインスティンクト強化', 'ソードイリュージョン強化'],
    shared: ['enhance-blitz', 'ブリッツシールドⅥ'],
  },
  paladin: {
    url: 'https://namu.moe/w/%ED%8C%94%EB%9D%BC%EB%94%98(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'ディバインコンバージェンス',
    mastery: ['ブラストVI|ディバインジャッジメントVI', 'ディバインチャージVI|ディバインスティグマVI|フォーリングジャスティス', 'サンクチュアリVI', 'ファイナルアタックVI|ライジングジャスティス'],
    enhance: ['ホーリーユニティ強化', 'ブレスドハンマー強化', 'グランドクロス強化', 'マイティミョルニル強化'],
    shared: ['enhance-blitz', 'ブリッツシールドⅥ'],
  },
  darkknight: {
    url: 'https://namu.moe/w/%EB%8B%A4%ED%81%AC%EB%82%98%EC%9D%B4%ED%8A%B8(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'ダークネスオブグレイス',
    mastery: ['グングニルディセントVI', 'ダークインペイルVI|ダークシンセシスVI', 'ビホルダーズリベンジVI|ファイナルアタックVI', 'ビホルダーショックVI'],
    enhance: ['ダークスフィア強化', 'ビホルダーインパクト強化', 'ピアスサイクロン強化', 'ダークネスオーラ強化'],
    shared: ['enhance-blitz', 'ブリッツシールドⅥ'],
  },
  'archmage-fp': {
    url: 'https://namu.moe/w/%EC%95%84%ED%81%AC%EB%A9%94%EC%9D%B4%EC%A7%80(%EB%B6%88%2C%EB%8F%85)/%EC%8A%A4%ED%82%AC',
    boost: 'インフェルナルウェーブ',
    mastery: ['フレイムスウィープVI', 'フレイムヘイズVI|ミストイラプションVI', 'イグナイトVI|イフリートVI|ファイアオーラVI', 'ポイズンリージョンVI|メテオVI|メギドフレイムVI|ポイズンフレアVI'],
    enhance: ['ドットパニッシャー強化', 'ポイズンノヴァ強化', 'フューリーオブイフリート強化', 'ポイズンチェイン強化'],
    shared: ['enhance-arcana', 'アルカナオーバーライドⅥ'],
  },
  bishop: {
    url: 'https://namu.moe/w/%EB%B9%84%EC%88%8D(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'エンジェルスプレッジ',
    mastery: ['エンジェルレイVI', 'ビッグバンVI|トライアンフフェザーVI', 'エンジェリックタッチVI|ファウンテンフォーエンジェルVI|バハムートVI', 'ジェネシスVI|ヘブンズドアVI'],
    enhance: ['プレイ強化', 'エンジェルオブジェミニ強化', 'ピースメイカー強化', 'ディバインパニッシュメント強化'],
    shared: ['enhance-arcana', 'アルカナオーバーライドⅥ'],
  },
  bowmaster: {
    url: 'https://namu.moe/w/%EB%B3%B4%EC%9A%B0%EB%A7%88%EC%8A%A4%ED%84%B0/%EC%8A%A4%ED%82%AC',
    boost: 'アイオブアクイラ',
    mastery: ['嵐の詩VI', 'アロープラターVI|アンカウンタブルアローVI', 'クイバーカートリッジVI|フェニックスVI|エクストラクイバーカートリッジ', 'フラッシュミラージュVI|ウィンドオブフレイVI'],
    enhance: ['アローレイン強化', '残影の詩強化', 'クイバーフルバースト強化', 'シルエットミラージュ強化'],
    shared: ['enhance-evolve', 'エボルブⅥ'],
  },
  marksman: {
    url: 'https://namu.moe/w/%EC%8B%A0%EA%B6%81(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'リーサルパニッシャー',
    mastery: ['スナイピングVI', 'ピアシングVI', 'フリーザーVI|ボルトスウィフトVI', 'ファイナルアタックVI|ロングレンジトゥルーショットVI'],
    enhance: ['トゥルースナイピング強化', 'スプリットアロー強化', 'チャージドアロー強化', 'リピーティングクロスボウカートリッジ強化'],
    shared: ['enhance-evolve', 'エボルブⅥ'],
  },
  pathfinder: {
    url: 'https://namu.moe/w/%ED%8C%A8%EC%8A%A4%ED%8C%8C%EC%9D%B8%EB%8D%94(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'マテリアルバースト',
    mastery: ['カーディナルブラストVI|アディショナルブラストVI', 'カーディナルディスチャージVI|アディショナルディスチャージVI', 'エッジオブレゾナンスVI|カーディナルトランジションVI|エンシェントアストラVI', 'コンボアサルトVI|レイヴンVI|レリックマテリアライズ'],
    enhance: ['アルティメットブラスト強化', 'エンシェントテンペスト強化|プライマルテンペスト強化', 'オブシディアンバリア強化', 'レリックアンバウンド強化'],
    shared: ['enhance-evolve', 'エボルブⅥ'],
  },
  nightlord: {
    url: 'https://namu.moe/w/%EB%82%98%EC%9D%B4%ED%8A%B8%EB%A1%9C%EB%93%9C/%EC%8A%A4%ED%82%AC',
    boost: 'シャドウリチュアル',
    mastery: ['クアドラプルスローVI', 'マークオブアサシンVI', 'ショーダウンチャレンジVI|ダークフレアVI|ダークネスシュリケン', 'フォーシーズンVI|サドンレイドVI'],
    enhance: ['スプレッドスロー強化', '風魔手裏剣強化', 'ダークロードの秘伝書強化', 'スローブラッシング強化'],
    shared: ['enhance-ds', 'アルティメットダークサイトⅥ'],
  },
  shadower: {
    url: 'https://namu.moe/w/%EC%84%80%EB%8F%84%EC%96%B4/%EC%8A%A4%ED%82%AC',
    boost: '無我之境',
    mastery: ['暗殺VI', 'メソエクスプロージョンVI', 'ダークフレアVI|クルーエルスタブVI', 'サドンレイドVI|ベールオブシャドウVI|カバートシャドウ'],
    enhance: ['シャドウアサルト強化', '切開強化', 'ソニックブロー強化', '滅鬼斬影陣強化'],
    shared: ['enhance-ds', 'アルティメットダークサイトⅥ'],
  },
  dualblade: {
    url: 'https://namu.moe/w/%EB%93%80%EC%96%BC%EB%B8%94%EB%A0%88%EC%9D%B4%EB%93%9C/%EC%8A%A4%ED%82%AC',
    boost: '暗影乱斬',
    mastery: ['ファントムブローVI', '阿修羅VI', 'ヒドゥンブレイドVI|生者必滅', 'ブレードフューリーVI|サドンレイドVI'],
    enhance: ['ブレードストーム強化', 'カルマフューリー強化', 'ブレードトルネード強化', 'ホーンテッドエッジ強化'],
    shared: ['enhance-ds', 'アルティメットダークサイトⅥ'],
  },
  viper: {
    url: 'https://namu.moe/w/%EB%B0%94%EC%9D%B4%ED%8D%BC(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'ネプトゥーヌスアドバント',
    mastery: ['フィストインレイジVI', 'シーサーペントVI|戦艦ノーチラスVI', 'サーペントストーンVI', 'フックボンバーVI'],
    enhance: ['ライトニングフォーム強化', 'サーペントスクリュー強化', 'フューリアスチャージ強化', 'ハウリングフィスト強化'],
    shared: ['enhance-flag', 'パイレーツフラッグⅥ'],
  },
  captain: {
    url: 'https://namu.moe/w/%EC%BA%A1%ED%8B%B4(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'エアリアルボンバードメント',
    mastery: ['ラピッドファイアVI', 'バトルシップボンバーVI|ボンバードテンペストVI', 'ヘッドショットVI|パーシレイドVI', 'サモンクルーVI|シージボンバーVI|ストレンジボムVI|戦艦ノーチラスVI'],
    enhance: ['バレットパーティー強化', 'デッドアイ強化', 'ノーチラスアサルト強化', 'デストリガー強化'],
    shared: ['enhance-flag', 'パイレーツフラッグⅥ'],
  },
  cannoneer: {
    url: 'https://namu.moe/w/%EC%BA%90%EB%85%BC%EC%8A%88%ED%84%B0/%EC%8A%A4%ED%82%AC',
    boost: 'メガキャノンボンバード',
    mastery: ['キャノンバスターVI', 'キャノンバズーカVI|ミニキャノンボールVI|マグネティックアンカーVI|戦艦ノーチラスVI', 'ローリングキャノンレインボーVI', 'モンキーフューリアスVI|サポートモンキーVI'],
    enhance: ['ビッグフューズギガンティックキャノンボール強化', 'ICBM強化', 'スペシャルモンキーエスコート強化', 'フルメーカー強化'],
    shared: ['enhance-flag', 'パイレーツフラッグⅥ'],
  },
  soulmaster: {
    url: 'https://namu.moe/w/%EC%86%8C%EC%9A%B8%EB%A7%88%EC%8A%A4%ED%84%B0/%EC%8A%A4%ED%82%AC',
    origin: 'アストラルブリッツ',
    ascent: 'トータリティ',
    boost: 'セレスティアルクリーブ',
    mastery: ['ソーラースラッシュVI|ルナディバイドVI', 'コズミックシャワーVI|ソルナパワー', 'コズミックバーストVI', 'ソルナスラッシュVI|ソルナパワーⅡ'],
    enhance: ['コスモス強化', 'エリシオン強化', 'ソウルエクリプス強化', 'フレアスラッシュ強化'],
    shared: ['enhance-phalanx', 'シグナスファランクスⅥ'],
  },
  flamewizard: {
    url: 'https://namu.moe/w/%ED%94%8C%EB%A0%88%EC%9E%84%EC%9C%84%EC%9E%90%EB%93%9C/%EC%8A%A4%ED%82%AC',
    origin: 'エタニティ',
    ascent: 'フレイムコンチェルト',
    boost: 'イグニスレクイエム',
    mastery: ['オービタルフレイムVI', 'ブレイジングエクスティンクションVI', 'オービタルエクスプロージョンVI|フェニックスドライブVI', 'インフェルノライズVI'],
    enhance: ['ブレイジングオービタルフレイム強化', 'フレイムディスチャージ強化', 'インフィニティフレイムサークル強化', 'サラマンダーミスチーフ強化'],
    shared: ['enhance-phalanx', 'シグナスファランクスⅥ'],
  },
  windbreaker: {
    url: 'https://namu.moe/w/%EC%9C%88%EB%93%9C%EB%B8%8C%EB%A0%88%EC%9D%B4%EC%BB%A4(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'ミストラルスプリング',
    ascent: 'エレメントテンペスト',
    boost: 'シルフスブレス',
    mastery: ['天空の歌VI', 'トライフリングウィムVI', 'フェアリーターンVI|ストームブリンガーVI|モンスーンVI', 'ストームウィムVI|アネモイ'],
    enhance: ['ハウリングゲイル強化', 'アイドルウィム強化', 'ウィンドウォール強化', 'ボルテックススピア強化'],
    shared: ['enhance-phalanx', 'シグナスファランクスⅥ'],
  },
  nightwalker: {
    url: 'https://namu.moe/w/%EB%82%98%EC%9D%B4%ED%8A%B8%EC%9B%8C%EC%BB%A4/%EC%8A%A4%ED%82%AC',
    origin: 'サイレンス',
    ascent: 'スティジアンコマンド',
    boost: 'シンギュラリティースロー',
    mastery: ['クインタプルスローVI', 'シャドウバットVI|ラヴァナスバットVI', 'ダークネスオーメンVI', 'ドミニオンVI|アビサルダークネス'],
    enhance: ['シャドウスピア強化', 'シャドウサーバントエクステンド強化', 'シャドウバイト強化', 'ラピッドスロー強化'],
    shared: ['enhance-phalanx', 'シグナスファランクスⅥ'],
  },
  striker: {
    url: 'https://namu.moe/w/%EC%8A%A4%ED%8A%B8%EB%9D%BC%EC%9D%B4%EC%BB%A4(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: '雷鳴壁海破',
    ascent: '疾刀殲滅',
    boost: '海皇爆砕',
    mastery: ['殲滅VI', '霹靂VI', '台風VI|海神降臨VI', '海波VI|海神剛体'],
    enhance: ['神雷合一強化', '鮫牙弾強化', '雷神槍撃強化', '槍雷連撃強化'],
    shared: ['enhance-phalanx', 'シグナスファランクスⅥ'],
  },
  mihile: {
    url: 'https://namu.moe/w/%EB%AF%B8%ED%95%98%EC%9D%BC(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'デュランダル',
    ascent: 'ナイトイモータルス',
    boost: 'レディアンスオブヴァラー',
    mastery: ['シャイニングクロスVI|シャイニングクロス-アサルトVI', 'ロイヤルガードVI|インストールシールドVI', 'デッドリーチャージVI|ファイナルアタックVI', 'オフェンシブディフェンスVI|ソウルマジェスティVI'],
    enhance: ['ロー・アイアス強化', 'クラウ・ソラス強化', 'ソードオブソウルライト強化', 'ライトオブカレッジ強化'],
    shared: ['enhance-phalanx', 'シグナスファランクスⅥ'],
  },
  aran: {
    url: 'https://namu.moe/w/%EC%95%84%EB%9E%80(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'エンドゲーム',
    ascent: 'フロストブラスター',
    boost: 'マハアンリーシュド',
    mastery: ['ビヨンドVI', 'ブーストエンド-ハンターズターゲティングVI', 'ハイパーブーストエンド-ラストスタンドVI', 'ファイナルアタックVI|アドレナリンマキシマムVI|フローズングラウンドVI'],
    enhance: ['ブーストエンド-アドレナリンサージ強化', 'ブランディッシュマッハ強化', 'ファイナルビヨンド-白虎強化', 'ブリザードテンペスト強化'],
    shared: ['enhance-fried', 'フリードの加護Ⅵ'],
  },
  evan: {
    url: 'https://namu.moe/w/%EC%97%90%EB%B0%98(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'ゾディアックバースト',
    ascent: 'ユニオンドライブ',
    boost: 'ドラゴンソア|バーティカルパニッシャー',
    mastery: ['サークルオブマナVI', 'ドラゴンスウィフトVI|サークルオブサンダーVI|スウィフトオブサンダーVI|スウィフトオブウィンドVI', 'サークルオブアースVI|ドラゴンダイブVI|ダイブオブアースVI|ダイブオブサンダーVI', 'サークルオブウィンドVI|ドラゴンブレスVI|ブレスオブアースVI|ブレスオブウィンドVI|魔法の残骸VI|ドラゴンスパーキングVI'],
    enhance: ['エレメンタルブラスト強化', 'ドラゴンブレイク強化', 'ゾディアックレイ強化', 'スパイラルオブマナ強化'],
    shared: ['enhance-fried', 'フリードの加護Ⅵ'],
  },
  mercedes: {
    url: 'https://namu.moe/w/%EB%A9%94%EB%A5%B4%EC%84%B8%EB%8D%B0%EC%8A%A4(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'アンフェイディンググローリー',
    ascent: 'エレメンタルスピリット',
    boost: 'ベリアンサージ',
    mastery: ['イシュタルのリングVI', 'リーフトルネードVI|レジェンダリースピアVI|ラースオブエンリルVI', 'ストライクデュアルショットVI|ユニコーンスパイクVI|ガストダイブVI', 'ファイナルアタックVI|エレメンタルナイトVI'],
    enhance: ['エレメンタルゴースト強化', 'シルフィディア強化', 'イルカラの息吹強化', 'ロイヤルナイツ強化'],
    shared: ['enhance-fried', 'フリードの加護Ⅵ'],
  },
  phantom: {
    url: 'https://namu.moe/w/%ED%8C%AC%ED%85%80(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'ディファイングフェイト',
    ascent: 'ムーンリットセレナーデ',
    boost: 'フレーシュルトゥール',
    mastery: ['テンペストオブカードVI', 'アルティメットドライブVI|フェイトシャッフル', 'ノワールカルトVI', 'ローズカルトフィナーレVI|ラムールカルト'],
    enhance: ['ジョーカー強化', 'ブラックジャック強化', 'マークオブファントム強化', 'リフトブレイク強化'],
    shared: ['enhance-fried', 'フリードの加護Ⅵ'],
  },
  luminous: {
    url: 'https://namu.moe/w/%EB%A3%A8%EB%AF%B8%EB%84%88%EC%8A%A4(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    boost: 'アブソリュートスペース',
    mastery: ['アブソリュートキルVI', 'ライトリフレクションVI|エンドレスダークネス', 'アポカリプスVI|エターナルライトネス', 'トワイライトノヴァVI'],
    enhance: ['真理の扉強化', 'パニッシングリゾネーター強化', '光と闇の洗礼強化', 'リベレーションオーブ強化'],
    shared: ['enhance-fried', 'フリードの加護Ⅵ'],
  },
  shade: {
    url: 'https://namu.moe/w/%EC%9D%80%EC%9B%94/%EC%8A%A4%ED%82%AC',
    origin: '護神降臨',
    ascent: '霊月',
    boost: '連雨撃風',
    mastery: ['鬼斬VI', '妖狐霊VI', '暴流拳VI|死魂刻印VI|天鬼夜斬', '召魂帳幕VI'],
    enhance: ['喚魂妖狐陣強化', '鬼門陣強化', '真・鬼斬強化', '破砕連拳強化'],
    shared: ['enhance-fried', 'フリードの加護Ⅵ'],
  },
  blaster: {
    url: 'https://namu.moe/w/%EB%B8%94%EB%9E%98%EC%8A%A4%ED%84%B0(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'ファイナルデストロイヤー',
    ascent: 'ヴァンガードインパクト',
    boost: 'オーバーヒートパンチ',
    mastery: ['マグナムパンチVI|ダブルファングVI', 'リリースパイルバンカーVI', 'ショックウェーブパンチVI|ハマースマッシュVI|リボルビングキャノンマスタリーVI', 'リボルビングキャノンVI|ハリケーンミキサーVI'],
    enhance: ['バンカーバスター強化', 'バルカンパンチ強化', 'バーニングブレイカー強化', 'アフターイメージショック強化'],
    shared: ['enhance-infantry', 'レジスタンスラインインファンツリーⅥ'],
  },
  battlemage: {
    url: 'https://namu.moe/w/%EB%B0%B0%ED%8B%80%EB%A9%94%EC%9D%B4%EC%A7%80(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'クリムゾンパクタム',
    ascent: 'グルーミーオーラ',
    boost: 'モーティスエッジ',
    mastery: ['デスVI', 'フィニッシュブローVI|バトルキングバーVI', 'ダークライトニングVI', 'ダークジェネシスVI'],
    enhance: ['ユニオンオーラ強化', 'ブラックマジックアルター強化', 'グリムリーパー強化', 'アビシアルライトニング強化'],
    shared: ['enhance-infantry', 'レジスタンスラインインファンツリーⅥ'],
  },
  wildhunter: {
    url: 'https://namu.moe/w/%EC%99%80%EC%9D%BC%EB%93%9C%ED%97%8C%ED%84%B0/%EC%8A%A4%ED%82%AC',
    origin: 'リンクドインパクト',
    ascent: 'ギアストーム',
    boost: 'レゾナンス：ワイルドピアース',
    mastery: ['ワイルドバルカン：アペックスVI', 'アシスト：レンドクローVI|アシスト：ファングスナップVI|アシスト：スカルバッシュVI', 'コマンド：アルファサージVI|コマンド：タイタンパウンスVI', 'ファイナルアタックVI|トラップシーダーVI|アナザーバイトVI'],
    enhance: ['コマンド：プレデターズアイ強化', 'ワイルドバルカン：オーバードライブ強化', 'プライマルブルーム強化', 'オーバーバイト強化'],
    shared: ['enhance-infantry', 'レジスタンスラインインファンツリーⅥ'],
  },
  mechanic: {
    url: 'https://namu.moe/w/%EB%A9%94%EC%B9%B4%EB%8B%89(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'グラウンドゼロ',
    ascent: 'メタルアーマー：エクスターミネーション',
    boost: 'バスターステーション',
    mastery: ['マッシブファイア：SPLASH-F VI|マッシブファイア：IRON-B VI', 'ホーミングミサイルVI', 'ディストーションフィールドVI', 'ロボットランチャー：RM7 VI|マグネティックフィールドVI|ロボットファクトリー：RM1 VI|ロボットトランジション：CB-P1'],
    enhance: ['マルチプルオプション：M-FL強化', 'マイクロミサイルコンテナ強化', 'メタルアーマー全弾発射強化', 'メカキャリア強化'],
    shared: ['enhance-infantry', 'レジスタンスラインインファンツリーⅥ'],
  },
  demonslayer: {
    url: 'https://namu.moe/w/%EB%8D%B0%EB%AA%AC%20%EC%8A%AC%EB%A0%88%EC%9D%B4%EC%96%B4(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'ナイトメア',
    ascent: 'アメジスティンイントルージョン',
    boost: 'ラースオブサタン',
    mastery: ['デーモンインパクトVI', 'デーモンスラッシュVI|デーモンエクスプロージョンVI', 'メタモルフォシスVI|デビルクライVI', 'サーバラスVI|デモニックディセント'],
    enhance: ['デーモンアウェイクニング強化', 'ヨルムンガンド強化', 'オルトロス強化', 'デーモンベイン強化'],
    shared: ['enhance-mastema', 'コールマステマⅥ'],
  },
  demonavenger: {
    url: 'https://namu.moe/w/%EB%8D%B0%EB%AA%AC%20%EC%96%B4%EB%B2%A4%EC%A0%B8/%EC%8A%A4%ED%82%AC',
    origin: 'レクイエム',
    ascent: 'レイジボーンデアデビル',
    boost: 'ラビッドカーネイジ',
    mastery: ['シールドチェイシングVI', 'エクシード：エクスキューションVI', 'エクシード：ムーンライトスラッシュVI|オーバーマキシマイジングエクシード', 'サウザンドソードVI|エンハンスドエクシードVI'],
    enhance: ['デーモンフレンジー強化', 'ブラッドフィスト強化', 'ディメンションソード強化', 'レヴナント強化'],
    shared: ['enhance-mastema', 'コールマステマⅥ'],
  },
  xenon: {
    url: 'https://namu.moe/w/%EC%A0%9C%EB%85%BC(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'アーティフィシャルエボリューション',
    ascent: 'ネオテリックトライス',
    boost: 'レールガンキャノネイド',
    mastery: ['パージロップマスカレードVI：狙撃|パージロップマスカレードVI：爆撃', 'トライアングルフォーメーションVI|ホログラムグラフィティ：力場VI', 'ロケットシステムVI|メルトダウンエクスプロージョンVI', 'ブレードダンシングVI'],
    enhance: ['メガスマッシャー強化', 'オーバーロードモード強化', 'ホログラムグラフィティ：融合強化', 'フォトンレイ強化'],
    shared: ['enhance-infantry', 'レジスタンスラインインファンツリーⅥ'],
  },
  kaiser: {
    url: 'https://namu.moe/w/%EC%B9%B4%EC%9D%B4%EC%A0%80(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'マイトオブノヴァ',
    ascent: 'パイロインスティンクト',
    boost: 'ドラコニックエクスティンクション',
    mastery: ['ギガスラッシャーVI', 'ソードストライクVI|ウィルオブソードVI', 'インフェルナルブレスVI', 'ペトリファイドVI|ウィングビートVI'],
    enhance: ['ガーディアンオブノヴァ強化', 'ウィルオブソード：ストライク強化', 'ドラコスラッシャー強化', 'ドラゴンブレイズ強化'],
    shared: ['enhance-pantheon', 'パンテオンⅥ'],
  },
  angelicbuster: {
    url: 'https://namu.moe/w/%EC%97%94%EC%A0%A4%EB%A6%AD%EB%B2%84%EC%8A%A4%ED%84%B0/%EC%8A%A4%ED%82%AC',
    origin: 'グランドフィナーレ',
    ascent: 'ジェニュインアンコール',
    boost: 'ポッピングハート',
    mastery: ['トリニティVI', 'ソウルシーカーVI|ソウルシーカーエキスパートVI', 'スーパーノヴァVI', 'プライマルロアVI|ダ・カーポ・フェトゥーチャ'],
    enhance: ['エネルギーバースト強化', 'スポットライト強化', 'マスコットファミリア強化', 'トリニティフュージョン強化'],
    shared: ['enhance-pantheon', 'パンテオンⅥ'],
  },
  cadena: {
    url: 'https://namu.moe/w/%EC%B9%B4%EB%8D%B0%EB%82%98/%EC%8A%A4%ED%82%AC',
    origin: 'チェインアーツ：マサカー',
    ascent: 'ブルータルラヴィッジ',
    boost: 'チェインアーツ：トレント',
    mastery: ['チェインアーツ：ストロークVI', 'ウェポンバラエティVI', 'サモンビーティングニードルバットVI|チェインアーツ：クラッシュVI|サモンカッティングシミターVI|サモンスローイングウィングダガーVI|サモンスクラッチングクローVI', 'プロフェッショナルエージェントVI|チェインアーツ：テイクダウンVI|サモンシューティングショットガンVI|サモンストライキングブリックVI|サモンスラッシングナイフVI|サモンリリーシングボムVI'],
    enhance: ['チェインアーツ：フューリー強化', 'A.Dオードナンス強化', 'チェインアーツ：メイルストロム強化', 'ウェポンバラエティフィナーレ強化'],
    shared: ['enhance-pantheon', 'パンテオンⅥ'],
  },
  kain: {
    url: 'https://namu.moe/w/%EC%B9%B4%EC%9D%B8(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'アナイアレーション',
    ascent: 'マリシャスフリッカー',
    boost: '［発現］ストライクインパクト|［処刑］ファントムレクイエム',
    mastery: ['フォーリングダストVI|［発現］フォーリングダストVI|［処刑］ポイズンニードルVI', 'ストライクアローVI|［発現］ストライクアローVI|スキャタリングショットVI|［発現］スキャタリングショットVI|［処刑］テアリングナイフVI|［処刑］チェインシクルVI', 'シャフトブレイクVI|［発現］シャフトブレイクVI|［処刑］ファントムブレイドVI|ドラゴンファングVI|リメインインセンスVI', 'デスブレッシングVI|チェイシングショットVI|スニーキスナイピングVI|［発現／処刑］スニーキスナイピングVI'],
    enhance: ['ドラゴンバースト強化', 'フェイタルブリッツ強化', 'タナトスディセント強化', 'グリップオブアゴニー強化'],
    shared: ['enhance-pantheon', 'パンテオンⅥ'],
  },
  illium: {
    url: 'https://namu.moe/w/%EC%9D%BC%EB%A6%AC%EC%9B%80/%EC%8A%A4%ED%82%AC',
    origin: 'アンリミテッドクリスタル',
    ascent: 'エクシディウム',
    boost: 'グローリーウィング：スプレンダー',
    mastery: ['クラフト：ジャベリンVI|グローリーウィング：ジャベリンVI', 'リアクション：ドミネーションVI|リアクション：デストラクションVI|グローリーウィング：モータルウィングビートVI', 'リオVI|マキナVI|デウスVI', 'クラフト：ロンギヌスVI|カースマーク完成VI|ロンギヌスゾーンVI'],
    enhance: ['クリスタルイグニッション強化', 'グラムホルダー強化', 'ソウルオブクリスタル強化', 'クリスタルゲート強化'],
    shared: ['enhance-circuit', 'マジックサーキットフルドライブⅥ'],
  },
  ark: {
    url: 'https://namu.moe/w/%EC%95%84%ED%81%AC(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: '最も古い深淵',
    ascent: '絶対深淵の囁き',
    boost: '原初の激流',
    mastery: ['プレインチャージドライブVI|スカーレットチャージドライブVI|ガストチャージドライブVI|アビスチャージドライブVI|目覚めた深淵', '消えない傷VI|満たされない飢餓VI|抑えられない混沌VI', '戻る憎悪VI|恍惚なる拘束VI|終わらない苦痛VI', '忘れられない悪夢VI|忘れられない凶夢VI'],
    enhance: ['根源の記憶強化', 'インフィニティスペル強化', '漏れ出す悪夢強化|漏れ出す凶夢強化', '永遠に飢える獣強化'],
    shared: ['enhance-circuit', 'マジックサーキットフルドライブⅥ'],
  },
  adele: {
    url: 'https://namu.moe/w/%EC%95%84%EB%8D%B8(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'マエストロ',
    ascent: 'アインハイト',
    boost: 'エーテルリュペ',
    mastery: ['ディバイドVI|シャードVI|ワンダーVI', 'オーダーVI|トレッドVI', 'インペイルVI|レゾナンスVI|ギャザリングVI|ブロッサムVI', 'クリエイションVI|テリトリーVI|マーカーVI'],
    enhance: ['ルイン強化', 'インフィニット強化', 'リストア強化', 'ストーム強化'],
    shared: ['enhance-circuit', 'マジックサーキットフルドライブⅥ'],
  },
  khali: {
    url: 'https://namu.moe/w/%EC%B9%BC%EB%A6%AC(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'ヘックス：サンドストーム',
    ascent: 'ボイドアウェイク',
    boost: 'ヘックス：デューンバースト',
    mastery: ['アーツ：フラーリVI|アーツ：クレッシェントVI', 'ボイドラッシュVI|ボイドブリッツVI|ヘックス：チャクラムスプリットVI', 'ヘックス：チャクラムフューリーVI|ヘックス：チャクラムスウィープVI|デスブロッサムVI', 'レゾネイトVI|ディシービングブレイドVI'],
    enhance: ['ヘックス：パンデモニウム強化', 'ボイドバースト強化', 'アーツ：アストラ強化', 'レゾネイト：アルティメイタム強化'],
    shared: ['enhance-circuit', 'マジックサーキットフルドライブⅥ'],
  },
  hayato: {
    url: 'https://namu.moe/w/%ED%95%98%EC%95%BC%ED%86%A0(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: '抜刀撃・真',
    ascent: '刹那の息吹',
    mastery: ['［迅速］無斬VI|［迅速］残影斬VI', '［迅速］新月斬VI|［迅速］沈黙の軌跡VI', '［抜刀］残月斬VI', '［抜刀］満月の咆哮VI'],
    enhance: ['超越の型強化', '［迅速］沈没の満潮強化', '［迅速］疾走の閃光強化', '［抜刀］哀号の天光強化'],
    shared: ['enhance-fury', 'プライマルフーリⅥ'],
  },
  kanna: {
    url: 'https://namu.moe/w/%EC%B9%B8%EB%82%98(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: '［天霊］覇王降臨',
    ascent: '［天霊］滅息',
    mastery: ['破魂符：武VI|砕心符VI', '召喚：鬼VI|［式霊］車輪撃VI|［式霊］鬼魂粉砕VI', '召喚：天狗VI|［式霊］霊雨天殺VI', '召喚：大蛇VI|［式霊］処刑VI'],
    enhance: ['［精霊］百面金毛十尾狐強化', '［精霊］部分解放：燃炎光刃強化', '［精霊］部分解放：黒翼破天強化', '［精霊］部分解放：絶魂毒牙強化'],
    shared: ['enhance-fury', 'プライマルフーリⅥ'],
  },
  hoyoung: {
    url: 'https://namu.moe/w/%ED%98%B8%EC%98%81(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: '仙技：破天荒',
    ascent: '天世輝霊',
    boost: '仙技：四凶解放 饕餮',
    mastery: ['滅火炎：天VI|地震砕：地VI|金箍棒：人VI|天地万物', '芭蕉風：天VI|土破流：地VI|如意扇：人VI', '幻影分身符VI|追跡鬼火符VI', '吸星渦流VI|拳術：胡蝶之夢VI'],
    enhance: ['仙技：極大 分身乱舞強化', '拳術：山霊召喚強化', '仙技：降臨 怪力乱神強化', '仙技：天地人 幻影強化'],
    shared: ['enhance-gentleman', '花中君子Ⅵ'],
  },
  lara: {
    url: 'https://namu.moe/w/%EB%9D%BC%EB%9D%BC(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'セロクセロク花ヌリ',
    ascent: 'アンダミロ',
    boost: '一抱えの息吹',
    mastery: ['精気まきVI', '龍脈噴出VI|噴出：うねる川VI|噴出：つむじ風VI|噴出：日の出の井戸VI', '龍脈吸収VI|吸収：川の水溜まりVI|吸収：そよ風VI|吸収：陽光の芽VI', '目覚めVI'],
    enhance: ['大きな伸び強化', '海・川・山・風強化', '湧き上がる精気強化', '山稜うねうね強化'],
    shared: ['enhance-gentleman', '花中君子Ⅵ'],
  },
  len: {
    url: 'https://namu.moe/w/%EB%A0%8C(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: '蒼龍破天剣：昇天',
    ascent: '蒼龍破天剣：一梅落花 天飛人跡',
    boost: '蒼龍破天剣：万斬',
    mastery: ['梅花剣本初：先斬VI', '亡魂剣本初：迎撃VI|亡魂剣二招式：連斬VI', '亡魂降臨VI|亡魂剣絶技：裂地VI|亡魂剣絶技：妄嘆VI|亡魂剣絶技：無量劫VI', '梅花剣二招式：砕梅VI|梅花剣三招式：曳刃VI|梅花剣三招式：一撃曳刃VI'],
    enhance: ['梅花剣絶技：万里香強化', '亡魂覚醒強化', '梅花剣絶技：閃舞強化', '亡魂剣絶技：心剣強化'],
    shared: ['enhance-gentleman', '花中君子Ⅵ'],
  },
  zero: {
    url: 'https://namu.moe/w/%EC%A0%9C%EB%A1%9C(%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC)/%EC%8A%A4%ED%82%AC',
    origin: 'クロノトリガー',
    ascent: 'バイテンポリス',
    boost: 'タイムアソリティ',
    mastery: ['ウィンドカッターVI|ウィンドストライクVI|ストームブレイクVI|ギガクラッシュVI|ジャンピングクラッシュVI|アースブレイクVI|タイムピース', 'ローリングカーブVI|ローリングアサルターVI|ターニングドライブVI|ホイールウィンドVI', 'フロントスラッシュVI|スローイングウェポンVI|フラッシュアサルターVI|スピンカッターVI', 'アッパースラッシュVI|パワースタンプVI|ムーンストライクVI|ピアースラストVI|シャドウストライクVI|シャドウレインVI|インフィニットレゾナンス'],
    enhance: ['リミットブレイク強化', 'ジョイントアタック強化', 'シャドウフラッシュ強化', 'エゴウェポン強化'],
    shared: ['enhance-transcendent', 'トランセンダントⅥ'],
  },
  kinesis: {
    url: 'https://namu.moe/w/%ED%82%A4%EB%84%A4%EC%8B%9C%EC%8A%A4/%EC%8A%A4%ED%82%AC',
    origin: 'アナザーレルム',
    ascent: 'フラクタルホライゾン',
    boost: 'グラビティオブジェクト',
    mastery: ['アルティメット：プレッシャーVI|アルティメット：チェックVI', 'サイキックスマッシングVI', 'アルティメット：オープニングVI|アルティメット：ギャンビットVI', 'テレキネシスVI'],
    enhance: ['アルティメット：チェックメイト強化', 'サイキックノヴァ強化', 'サイキックバレット強化', 'サイキックボード強化'],
    shared: ['enhance-afterimage', '異界の残像Ⅵ'],
  },
}

function push(
  out: JobSkillDraft[],
  row: Row,
  id: string,
  name: string,
  role: JobSkillDraft['role'],
  description: string,
  shared = false,
) {
  out.push({
    id,
    name,
    role,
    description,
    sourceUrl: row.url,
    fromNamu: true,
    sourceName: SOURCE,
    shared,
  })
}

function partsOf(entry: string): { title: string; extra: string[] } {
  const parts = entry.split('|')
  return { title: parts[0] ?? entry, extra: parts.slice(1) }
}

function fromRow(row: Row): JobSkillDraft[] {
  const out: JobSkillDraft[] = []
  if (row.origin) {
    const { title, extra } = partsOf(row.origin)
    push(
      out,
      row,
      'origin',
      title,
      'origin',
      extra.length > 0
        ? `同じコアに${extra.join('、')}がある。ナムウィキのオリジン。JMS公式6次欄の個別文は、この職業では未確認。`
        : 'ナムウィキのオリジン。JMS公式6次欄の個別文は、この職業では未確認。',
    )
  }
  if (row.ascent) {
    const { title, extra } = partsOf(row.ascent)
    push(
      out,
      row,
      'ascent',
      title,
      'ascent',
      extra.length > 0
        ? `同じコアに${extra.join('、')}がある。ナムウィキのアセント。JMS公式6次欄の個別文は、この職業では未確認。`
        : 'ナムウィキのアセント。JMS公式6次欄の個別文は、この職業では未確認。',
    )
  }
  if (row.boost) {
    const { title, extra } = partsOf(row.boost)
    push(
      out,
      row,
      'boost-1',
      title,
      'boost',
      extra.length > 0
        ? `同じコアに${extra.join('、')}がある。ナムウィキの3つ目のスキルコア。JMSのゲーム画面ではこのスキルコア枠は未解放。`
        : 'ナムウィキの3つ目のスキルコア。JMSのゲーム画面ではこのスキルコア枠は未解放。',
    )
    out[out.length - 1]!.listed = false
  }
  row.mastery.forEach((entry, index) => {
    const parts = entry.split('|')
    const extra = parts.slice(1)
    push(
      out,
      row,
      `mastery-${index + 1}`,
      parts[0] ?? entry,
      'mastery',
      extra.length > 0
        ? `同じコアに${extra.join('、')}がある。ナムウィキのマスタリーコア。`
        : 'ナムウィキのマスタリーコア。',
    )
  })
  row.enhance.forEach((entry, index) => {
    const parts = entry.split('|')
    const title = parts[0] ?? entry
    const extra = parts.slice(1)
    push(
      out,
      row,
      `enhance-${index + 1}`,
      title,
      'enhance',
      extra.length > 0
        ? `${title.replace(/強化$/, '')}を強化する。同じ枠に${extra.join('、')}とある。ナムウィキの強化コア。`
        : `${title.replace(/強化$/, '')}を強化する。ナムウィキの強化コア。`,
    )
  })
  if (row.shared) {
    push(out, row, row.shared[0], row.shared[1], 'enhance', '職業群の共用コア。ナムウィキの共用コア欄。', true)
  }
  return out
}

export function namuDraftsFor(jobId: string): JobSkillDraft[] {
  const row = ROWS[jobId]
  return row ? fromRow(row) : []
}
