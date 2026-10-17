param(
  [Parameter(Mandatory = $true)][string]$ImagePath,
  [Parameter(Mandatory = $true)][string]$OutPath
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]

function Await-WinRt($operation, $type) {
  $task = $asTaskGeneric.MakeGenericMethod($type).Invoke($null, @($operation))
  $null = $task.Wait(-1)
  return $task.Result
}

$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'ja'))
if (-not $engine) {
  $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
}

function Read-ImageText {
  if (-not $engine) { return '' }
  $bytes = [System.IO.File]::ReadAllBytes($ImagePath)
  $mem = New-Object System.IO.MemoryStream (,$bytes)
  $stream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($mem)
  try {
    $decoder = Await-WinRt ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap = Await-WinRt ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    try {
      $result = Await-WinRt ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
      $parts = New-Object System.Collections.Generic.List[string]
      # OCRの列検出順では潜在の見出しが能力値より後ろになることがある。
      # 画面上の上から下の順に戻してからパーサーへ渡す。
      foreach ($ocrLine in ($result.Lines | Sort-Object { ($_.Words | ForEach-Object { $_.BoundingRect.Y } | Measure-Object -Minimum).Minimum })) {
        $piece = ([string]$ocrLine.Text).Trim()
        if ($piece.Length -gt 0) { $parts.Add($piece) }
      }
      if ($parts.Count -eq 0) { return ([string]$result.Text).Trim() }
      return ($parts -join "`n")
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $stream.Dispose()
    $mem.Dispose()
  }
}

$reader = New-Object System.IO.StreamReader ([Console]::OpenStandardInput())
while ($true) {
  $line = $reader.ReadLine()
  if ($null -eq $line) { break }
  if ($line -eq 'quit') { break }
  if ($line -ne 'read') { continue }
  try {
    $text = Read-ImageText
    [System.IO.File]::WriteAllText($OutPath, $text, [System.Text.UTF8Encoding]::new($false))
    [Console]::Out.WriteLine('ready')
    [Console]::Out.Flush()
  } catch {
    [System.IO.File]::WriteAllText($OutPath, '', [System.Text.UTF8Encoding]::new($false))
    [Console]::Out.WriteLine('error ocr-failed')
    [Console]::Out.Flush()
  }
}
