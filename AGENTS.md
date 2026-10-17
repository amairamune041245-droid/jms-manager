# AGENTS.md — AIエージェント向け引き継ぎ・設計ガイド

このファイルは、**Cursor**、**Antigravity**、**Claude**、**GitHub Copilot** などのAIアシスタントが、このリポジトリ（`jms-manager` / **NEM Maple**）を共同編集する際の共通ルール・アーキテクチャ仕様書です。
作業を始める前に必ずこのファイルと `PROGRESS.md` を確認してください。

---

## 1. プロジェクトの基本原則（絶対守ること）

1. **日本版メイプルストーリー（JMS）の仕様・用語に準拠する**
   - スキル名・装備名・ステータス表記・ボス名はすべて **JMS（日本版）の公式表記** を使う。
   - 公式未発表・未確認の数値（例：JMS未公開のソルエルダ必要数や公式改定後の未確認差額など）を**勝手にKMS等の数値で決め打ちせず、「データ未確認」として明示する**。
   - ナムウィキ（namu.wiki）の画像URLは直リンクが `403` になるため、公式CDNまたは取得済みアセットを優先する（`src/data/hexa/jobs/officialSixth.ts` の `preferHostedIcon` を参照）。

2. **ドメインロジック（`src/domain/`）とUI（`src/features/`）の分離**
   - 計算・バリデーション・画像解析・文字列パースなどのロジックは必ず `src/domain/` に**純粋関数**として実装し、対応する `*.test.ts` で単体テストを書く。
   - Reactコンポーネント（`src/features/`）は表示とイベント配線に専念させ、複雑なロジックをコンポーネント内に直接書かない。

3. **ローカルデータの後方互換性を壊さない**
   - 保存先は `localStorage` のキー `'jms-manager.v1'`（内部データ構造バージョン `APP_DATA_VERSION = 2`）。
   - `AppData` にフィールドを追加する場合は、`src/storage/localStorageRepository.ts` の `parseV2` で**既存データにフィールドが無くても安全にデフォルト値で復元される**ように実装する。

4. **変更後は必ずテストとLintを通す**
   - 作業完了前に以下を実行し、すべてパスすることを確認する：
     - `npm test`（Vitest 全テスト通過）
     - `npm run lint`（Oxlint エラー・警告なし）
     - `npm run build`（TypeScript型チェック `tsc -b` + Viteビルド成功）

---

## 2. アーキテクチャと主要モジュール

### データ構造（`src/domain/types.ts`）
`AppData`（`version: 2`）は以下のデータを保持する：
- `characters`: `Character[]`（ID、名前、ワールド、職業名、`jobId`、レベル、ポートレートDataURL）
- `items`: `EquipmentItem[]`（装備マスター。複数プリセットからID参照される）
  - 画面自動取り込みで作られた装備は `id` が `capture:${characterId}:${slotId}` 形式になる。
- `loadoutsByCharacterId`: `Record<string, CharacterLoadout>`（1キャラにつき3プリセット `presets: [0, 1, 2]`、各スロットに `itemId | null` を割り当て）
- `hexaByCharacterId`: `Record<string, HexaProgress>`（スキルレベル、HEXAステータス6コア、ソルエルダ/欠片所持数）
- `statSheetsByCharacterId`: `Record<string, StatSheet>`（メインステータス換算用の入力シート）
- `bossClearsByCharacterId`: `Record<string, string[]>`（討伐済み週/月ボスIDリスト）
- `gachaPools`: `GachaPool[]`（ガチャ確率集計データ）

### 画面キャプチャ＆OCR（`server/` + `scripts/` + `src/domain/equipmentCapture.ts`）
Viteサーバープラグインとしてローカル通信のみ（`127.0.0.1` / `::1`）許可された2つのAPIが動作する：
1. `GET /api/screen-frame` / `DELETE /api/screen-frame` (`server/screenFrame.ts` -> `scripts/screen-capture.ps1`)
   - ゲームウィンドウ（または画面）のPNGキャプチャとマウスカーソル座標（`X-Cursor-X`, `X-Cursor-Y` ヘッダ）を返す。
2. `POST /api/item-name` (`server/ocrLine.ts` -> `scripts/ocr-line.ps1`)
   - PNG画像を受け取り、Windows標準OCRで読み取ったテキスト（`{ text }`）を返す。

**画像解析のポイント (`src/domain/equipmentCapture.ts`, `src/domain/tooltipText.ts`)**:
- 装備ウィンドウは白シート（`locateWhiteWindow`）とグレーシート（`locateGrayWindow`）の両方に対応。
- 数ピクセルの検出揺れでアイコンがガタつかないよう `preferStableGrid` で枠位置を安定化している。
- ツールチップ読み取りでは、上部の★（黄色と灰色の星クラスタ `locateStarCluster`）とアイテムアイコン枠（`iconWells`）を基準にツールチップ領域（クエストヘルパー等を除外した `body`）を特定する。
- 指輪・ペンダント等の複数枠ある部位や曖昧な部位（`CONFIRM_GROUPS`）は、勝手に上書きせず確認プレビューを出してユーザーに枠を選ばせる。

### セット効果計算（`src/domain/equipmentSets.ts`）
- 現行JMSのセット効果（光輝、漆黒、黎明、ヴェラッド最上級〜下級、ボスアクセ、エテルネル、アーケインシェード、アブソレス、ルートアビス、戦国、キノコ）を定義。
- ジェネシス/デスティニー武器のエテルネルカウントや、戦国セットの銀狼武器（1本で2セット分カウント）などの特殊ルールを含む。
- OCRで読み取ったアイテム名の揺れは `matchItemName`（編集距離による名寄せ）で正規化する。

### HEXAスキル・HEXAステータス（`src/domain/hexa.ts`, `src/data/hexa/`）
- **HEXAマトリックス座標 (`matrixLayout.ts`)**: ゲーム内参考画像の六角形中心座標に固定配置（スキルコア4、マスタリーコア6、強化8、共用8）。
- **HEXAステータス (`hexa.ts`)**:
  - 6コア構成（`HEXA_STAT_CORE_COUNT = 6`）。
  - 同一コア内でメイン・アディショナル1・アディショナル2に同じ種類は設定不可。
  - **メインステータスは全6コア間で重複不可（各種類1コアまで）**。
  - **アディショナルステータスは全6コア間で同一種類最大2コアまで**。
  - 各ライン最大Lv10、1コア内の合計レベル最大20。

### メインステータス換算（`src/domain/mainStatConvert.ts`, `src/data/combatProfiles.ts`）
- 3つの計算モデルに対応：
  - `standard`: `main * 4 + sub + sub2`
  - `xenon`: `(STR + DEX + LUK) * 4`
  - `demon-avenger`: 純HP（`level * 90 + 545`）と追加HPの段階計算（二分探索 `hpForTermIncrease` で逆算）
- ボス防御率は `380%` 基準で防御率無視（IED）の換算値を算出。

---

## 3. GitHub経由でのAI間引き継ぎフロー（Cursor ⇄ Antigravity 等）

1. **作業開始時**
   - `git status` / `git pull` で最新の変更を取り込む。
   - `PROGRESS.md` を読んで直近の作業内容と残課題を確認する。
2. **実装・修正中**
   - ドメイン変更時は `src/domain/*.test.ts` にテストを追加・更新する。
   - 既存のコメント（なぜその閾値や座標にしているかの理由）を消さない。
3. **作業完了・引き渡し時**
   - `npm test` と `npm run lint` と `npm run build` を実行してすべて通ることを確認する。
   - `PROGRESS.md` に「いつ・どの機能を更新したか」「テスト件数」を追記する。
   - `git commit` & `git push` でGitHubに反映し、もう片方のAI環境で `git pull` できるようにする。
