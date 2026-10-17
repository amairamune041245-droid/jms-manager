param(
  [Parameter(Mandatory = $true)][string]$OutPath
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class JmsCap {
  [StructLayout(LayoutKind.Sequential)]
  struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }

  [DllImport("user32.dll")]
  static extern bool SetProcessDPIAware();

  [StructLayout(LayoutKind.Sequential)]
  struct POINT {
    public int X;
    public int Y;
  }

  [DllImport("user32.dll")]
  static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

  [DllImport("user32.dll")]
  static extern bool GetCursorPos(out POINT lpPoint);

  public static string CursorAt() {
    POINT point;
    if (!GetCursorPos(out point)) return "";
    return point.X + "," + point.Y;
  }

  static JmsCap() {
    SetProcessDPIAware();
  }

  public static string GameRect() {
    POINT point;
    bool hasCursor = GetCursorPos(out point);
    int bestArea = 0;
    string best = "";
    foreach (System.Diagnostics.Process proc in System.Diagnostics.Process.GetProcesses()) {
      try {
        if (proc.MainWindowHandle == IntPtr.Zero) continue;
        string name = proc.ProcessName ?? "";
        bool match = name.StartsWith("MapleStory", StringComparison.OrdinalIgnoreCase);
        if (!match) continue;
        RECT rect;
        if (!GetWindowRect(proc.MainWindowHandle, out rect)) continue;
        int width = rect.Right - rect.Left;
        int height = rect.Bottom - rect.Top;
        if (width < 200 || height < 200) continue;
        if (hasCursor && (point.X < rect.Left || point.X >= rect.Right || point.Y < rect.Top || point.Y >= rect.Bottom)) {
          continue;
        }
        int area = width * height;
        if (area <= bestArea) continue;
        bestArea = area;
        best = rect.Left + "," + rect.Top + "," + width + "," + height + ",window";
      } catch (Exception) {
      }
    }
    return best;
  }
}
"@

function Get-CaptureRect {
  $text = [JmsCap]::GameRect()
  if ([string]::IsNullOrWhiteSpace($text)) {
    $cursor = [JmsCap]::CursorAt()
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    if (-not [string]::IsNullOrWhiteSpace($cursor)) {
      $parts = $cursor.Split(',')
      $point = New-Object System.Drawing.Point ([int]$parts[0]), ([int]$parts[1])
      $screen = [System.Windows.Forms.Screen]::FromPoint($point).Bounds
    }
    $text = "$($screen.X),$($screen.Y),$($screen.Width),$($screen.Height),screen"
  }
  $parts = $text.Split(',')
  return @{
    X = [int]$parts[0]
    Y = [int]$parts[1]
    W = [int]$parts[2]
    H = [int]$parts[3]
    Source = $parts[4]
  }
}

function Save-Png([int]$X, [int]$Y, [int]$Width, [int]$Height) {
  $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.CopyFromScreen($X, $Y, 0, 0, (New-Object System.Drawing.Size $Width, $Height))
    } finally {
      $graphics.Dispose()
    }
    $part = "$OutPath.part"
    $bitmap.Save($part, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $bitmap.Dispose()
  }
  if (Test-Path -LiteralPath $OutPath) {
    Remove-Item -LiteralPath $OutPath -Force
  }
  Move-Item -LiteralPath "$OutPath.part" -Destination $OutPath
}

$reader = New-Object System.IO.StreamReader ([Console]::OpenStandardInput())
while ($true) {
  $line = $reader.ReadLine()
  if ($null -eq $line) { break }
  if ($line -eq 'quit') { break }
  if ($line -ne 'snap') { continue }
  try {
    $rect = Get-CaptureRect
    $cursor = [JmsCap]::CursorAt()
    Save-Png -X $rect.X -Y $rect.Y -Width $rect.W -Height $rect.H
    $pointer = ''
    if (-not [string]::IsNullOrWhiteSpace($cursor)) {
      $parts = $cursor.Split(',')
      $pointer = " $([int]$parts[0] - $rect.X) $([int]$parts[1] - $rect.Y)"
    }
    [Console]::Out.WriteLine("ready $($rect.Source)$pointer")
    [Console]::Out.Flush()
  } catch {
    $detail = (($_.Exception.ToString() + ' ' + $_.ScriptStackTrace) -replace '\s+', ' ')
    [System.IO.File]::WriteAllText("$OutPath.err", $detail, [System.Text.UTF8Encoding]::new($false))
    [Console]::Out.WriteLine('error capture-failed')
    [Console]::Out.Flush()
  }
}
