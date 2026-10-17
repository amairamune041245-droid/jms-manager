import { useState } from 'react'
import { gachaRate, gachaTrials } from '../../domain/gacha.ts'
import type { GachaCount } from '../../domain/types.ts'
import { useAppStore } from '../app/useAppStore.ts'

export function GachaBoard() {
  const { data, addGachaPool, recordGacha, renameGachaPool, mergeGacha } = useAppStore()
  const pools = data.gachaPools ?? []
  const [poolId, setPoolId] = useState(pools[0]?.id ?? '')
  const pool = pools.find((entry) => entry.id === poolId) ?? pools[0] ?? null
  const [preview, setPreview] = useState<string | null>(null)
  const [names, setNames] = useState<string[]>([''])
  const [note, setNote] = useState('画面を取り込み、出たアイテムを確認してから集計します。')
  const [importText, setImportText] = useState('')
  const trials = pool ? gachaTrials(pool) : 0

  async function capture() {
    setNote('画面を取り込んでいます。')
    try {
      const response = await fetch('/api/screen-frame', { cache: 'no-store' })
      if (response.ok) {
        const blob = await response.blob()
        if (preview) URL.revokeObjectURL(preview)
        setPreview(URL.createObjectURL(blob))
        setNote('画面を取り込みました。出たアイテム名を確認して、集計してください。')
        return
      }
    } catch {
      // Fall back to browser screen capture below
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setNote('画面を読めませんでした。ゲームを手前に出して、もう一度押してください。')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.srcObject = stream
      await video.play()
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, video.videoWidth)
      canvas.height = Math.max(1, video.videoHeight)
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      for (const track of stream.getTracks()) track.stop()
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
      if (!blob) {
        setNote('画面を読めませんでした。')
        return
      }
      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(blob))
      setNote('画面を取り込みました。出たアイテム名を確認して、集計してください。')
    } catch {
      setNote('画面の共有がキャンセルされました。もう一度押して画面を選んでください。')
    }
  }

  function commit() {
    if (!pool) return
    const confirmed = names.map((name) => name.trim()).filter((name) => name.length > 0)
    if (confirmed.length === 0) return
    recordGacha(pool.id, confirmed)
    setNames([''])
    setNote(`${confirmed.length}個を集計しました。確認は合計${trials + confirmed.length}回です。`)
  }

  function importCounts() {
    if (!pool) return
    const counts = readCounts(importText)
    if (!counts) {
      setNote('集計の形式を読めませんでした。書き出したJSONを貼ってください。')
      return
    }
    mergeGacha(pool.id, counts)
    setImportText('')
    const added = counts.reduce((sum, entry) => sum + entry.count, 0)
    setNote(`${added}回分を足しました。`)
  }

  return (
    <section className="panel">
      <h2>ガチャ確率</h2>
      <p className="muted">
        画面を取り込み、出たアイテムを確認してから集計します。割合は確認した回数だけから出します。ほかの人の集計を足すと、回数が多いほど割合は落ち着きます。
      </p>
      <div className="preset-line">
        <label>
          ガチャ
          <select
            value={pool?.id ?? ''}
            onChange={(event) => setPoolId(event.target.value)}
          >
            {pools.length === 0 ? <option value="">まだありません</option> : null}
            {pools.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            const id = addGachaPool('いまのガチャ')
            setPoolId(id)
          }}
        >
          ガチャを追加
        </button>
      </div>
      {pool ? (
        <label className="field">
          <span className="field-label">名前</span>
          <input value={pool.name} onChange={(event) => renameGachaPool(pool.id, event.target.value)} />
        </label>
      ) : (
        <p className="muted">集計するガチャを追加してください。</p>
      )}
      <div className="capture-actions">
        <button type="button" onClick={() => void capture()} disabled={!pool}>
          画面を取り込む
        </button>
        <button type="button" onClick={commit} disabled={!pool || names.every((name) => name.trim() === '')}>
          この結果を集計
        </button>
      </div>
      <p className="muted">{note}</p>
      {preview ? <img className="capture-preview" src={preview} alt="取り込んだガチャ画面" /> : null}
      <div className="gacha-draft">
        {names.map((name, index) => (
          <label className="field" key={index}>
            <span className="field-label">アイテム {index + 1}</span>
            <input
              value={name}
              placeholder="画面で確認した名前"
              onChange={(event) =>
                setNames(names.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)))
              }
            />
          </label>
        ))}
        <button type="button" className="button-quiet" onClick={() => setNames([...names, ''])}>
          アイテム欄を足す
        </button>
      </div>
      <p>確認 {trials} 回</p>
      {pool && pool.counts.length > 0 ? (
        <table className="gacha-table">
          <thead>
            <tr>
              <th>アイテム</th>
              <th>回数</th>
              <th>割合</th>
            </tr>
          </thead>
          <tbody>
            {pool.counts.map((entry) => (
              <tr key={entry.name}>
                <td>{entry.name}</td>
                <td>{entry.count}</td>
                <td>{(gachaRate(entry.count, trials) * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">まだ集計はありません。</p>
      )}
      {pool ? (
        <label className="field">
          <span className="field-label">集計を足す</span>
          <textarea
            rows={4}
            value={importText}
            placeholder={JSON.stringify({ counts: pool.counts }, null, 2)}
            onChange={(event) => setImportText(event.target.value)}
          />
        </label>
      ) : null}
      {pool ? (
        <div className="capture-actions">
          <button
            type="button"
            className="button-quiet"
            onClick={() => void navigator.clipboard.writeText(JSON.stringify({ name: pool.name, counts: pool.counts }))}
          >
            集計をコピー
          </button>
          <button type="button" className="button-quiet" onClick={importCounts} disabled={importText.trim() === ''}>
            貼り付けた集計を足す
          </button>
        </div>
      ) : null}
    </section>
  )
}

function readCounts(text: string): GachaCount[] | null {
  try {
    const value = JSON.parse(text) as unknown
    const source = Array.isArray(value)
      ? value
      : value && typeof value === 'object' && Array.isArray((value as { counts?: unknown }).counts)
        ? (value as { counts: unknown[] }).counts
        : null
    if (!source) return null
    const counts = source.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return []
      const name = 'name' in entry && typeof entry.name === 'string' ? entry.name.trim() : ''
      const count = 'count' in entry && typeof entry.count === 'number' ? Math.floor(entry.count) : 0
      if (!name || count <= 0) return []
      return [{ name, count }]
    })
    return counts.length > 0 ? counts : null
  } catch {
    return null
  }
}
