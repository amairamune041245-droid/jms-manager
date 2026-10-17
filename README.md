# NEM Maple (`jms-manager`)

日本のメイプルストーリー（JMS）向けのキャラクター・装備・6次スキル（HEXA）・ステータス換算・週ボス結晶・ガチャ確率管理ツールです。
ブラウザの `localStorage` にデータを保存し、Windows環境ではゲーム画面からの装備アイコン・ツールチップ（★・潜在・能力値）の自動読み取りにも対応しています。

---

## 主な機能

### 1. キャラクター管理 (`src/features/characters/`, `src/domain/characters.ts`)
- キャラクター登録・編集・削除（名前、ワールド、職業、レベル、ポートレート画像）
- JMSのワールド選択（かえで、くるみ、ゆかり、リブート、バーニング等）とアイコン表示
- 全49職業（冒険者、シグナス騎士団、英雄、レジスタンス、ノヴァ、レフ、暁の陣、アニマ、その他）に対応

### 2. 装備管理・プリセット・セット効果 (`src/features/equipment/`, `src/domain/equipment*.ts`)
- **公式装備ウィンドウ準拠の配置**: 実測座標に基づくペーパードール配置＋中央キャラクター画像表示
- **装備マスター＆3プリセット**: 装備アイテム本体（`items`）とプリセット割り当て（`loadoutsByCharacterId`）を分離し、1キャラあたり3プリセットの切替・名前変更・複製が可能
- **画面からの自動取り込み (`EquipmentCapture.tsx`)**:
  - **アイコン取り込み**: ゲーム内の装備ウィンドウ（白背景・グレー背景両対応）を自動検出し、各スロットのアイコン画像と中央のキャラクター画像、選択中プリセット番号を取得
  - **装備情報の読み取り**: ゲーム内で装備にマウスホバーした際のツールチップから、★（スターフォース数）、装備名（OCR＋編集距離による名寄せ）、能力値、呪文書強化、潜在能力、アディショナル潜在能力、メモを自動抽出
  - **読み取りカバー率表示 (`readCoverage.ts`)**: 各装備で「名前・★・能力値・潜在・アディショナル・メモ」のどれが読み取り済みかを可視化
- **セット効果自動計算 (`equipmentSets.ts`, `ActiveSetEffects.tsx`)**:
  - 光輝のボス、漆黒のボス、黎明のボス、ヴェラッド（最上級〜下級）、ボスアクセサリー、エテルネル（ジェネシス/デスティニー武器対応）、アーケインシェード、アブソレス、ルートアビス、戦国（銀狼武器2セットカウント対応）、キノコ装備セットの発動段数と合計ボーナスを自動集計

### 3. 6次スキル（HEXAマトリックス・ステータス・育成順） (`src/features/hexa/`, `src/data/hexa/`, `src/domain/hexa.ts`)
- **HEXAマトリックス**: 公式画面の六角形中心座標を再現（スキルコア4、マスタリーコア6、強化コア・共用コア8）
- **公式6次スキルデータ統合**: JMS公式職業紹介の6次スキル（オリジン、アセント、共用コア、マスタリー・強化名称）とナムウィキデータを統合（`officialSixth.ts`）
- **HEXAステータス（6コア）**:
  - JMS公式の重複制限を検証（同一コア内の重複不可、メインステータスは全6コアで1種のみ、アディショナルは全6コアで同一種類最大2つまで）
  - 各ラインのレベル（最大10）およびコア合計レベル（最大20）の制限検証
- **ソルエルダ／欠片の所持数記録**と**HEXAスキル育成順**の並び替え・管理

### 4. メインステータス換算 (`src/features/stats/`, `src/domain/mainStatConvert.ts`, `src/data/combatProfiles.ts`)
- 職業ごとの計算モデル（標準 `standard`、ゼノン `xenon`、デーモンアヴェンジャー `demon-avenger`）、武器定数、最終ダメージ、パッシブスキルLv+1、ジェネシス武器解放、ルインフォースシールドに対応
- ステータス攻撃力・最終ダメージの表示と、敵防御率380%基準での各ステータス（攻撃力/魔力+1、攻撃力/魔力%+1、ダメージ+1%、ボスダメ+1%、クリダメ+1%、防御率無視+1%、メインステ%+1）のメインステータス換算値を算出

### 5. 週ボス・月ボス結晶管理 (`src/features/boss/`, `src/domain/bossCrystals.ts`)
- キャラクターごとに週ボス（週間売却上限12個）・月ボス（暗黒の魔法使いハード/エクストリーム）の討伐チェックと獲得メル合計を計算

### 6. ガチャ確率集計 (`src/features/gacha/`, `src/domain/gacha.ts`)
- ゲーム画面キャプチャ機能付きのガチャ排出アイテム記録・確率計算
- JSON形式での集計データのコピー（エクスポート）と他人の集計データのマージ（インポート）

---

## 技術スタック・コマンド

- **フロントエンド**: React 19 + React Router 7 + TypeScript + Vite 8
- **テスト / リンター**: Vitest 4 / Oxlint
- **ローカル連携（Viteプラグイン + PowerShell）**:
  - `server/screenFrame.ts` (`GET /api/screen-frame`, `DELETE /api/screen-frame`) + `scripts/screen-capture.ps1`
  - `server/ocrLine.ts` (`POST /api/item-name`) + `scripts/ocr-line.ps1`（Windows標準OCR APIを使用）

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（画面キャプチャ・OCR APIも同時に有効化）
npm run dev

# テスト実行（Vitest）
npm test

# リント実行（Oxlint）
npm run lint

# 本番ビルド（型チェック + Viteビルド）
npm run build
```

---

## ディレクトリ構成

```text
├── public/                 # 静的アセット
├── scripts/                # Windows画面キャプチャ・OCR用PowerShellスクリプト、データ取得スクリプト
├── server/                 # Vite開発/プレビューサーバー用プラグイン（画面キャプチャ・OCRエンドポイント）
├── src/
│   ├── app/                # AppShell、テーマ定義（theme.ts / theme.css）
│   ├── data/               # 静的マスタデータ（職業一覧、ワールド、戦闘プロファイル、HEXAスキル定義）
│   ├── domain/             # 純粋ロジック・型定義・単体テスト（UI非依存）
│   ├── features/           # 画面機能別のReactコンポーネントと状態管理（AppStore）
│   ├── lib/                # 画像リサイズ等のユーティリティ
│   └── storage/            # localStorage永続化とデータマイグレーション（v1 -> v2）
├── AGENTS.md               # AIエージェント（Cursor / Antigravity / Claude等）向けの設計・引き継ぎガイド
└── PROGRESS.md             # 開発進捗と今後のタスク管理
```

---

## 複数AI（Cursor / Antigravity 等）での共同作業について

このリポジトリはGitHubを経由して複数のAIツールでリレー開発できるように設計されています。
AIに作業を依頼する際は、リポジトリ直下の **[AGENTS.md](./AGENTS.md)** と **[PROGRESS.md](./PROGRESS.md)** を参照させてください。
