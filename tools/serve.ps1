# Minimal static file server for local preview (no Node/Python needed).
#   powershell -ExecutionPolicy Bypass -File tools\serve.ps1            -> http://localhost:4173/
#   powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Port 8080
param(
  [int]$Port = 4173,
  [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$Root = [IO.Path]::GetFullPath($Root)
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json'; '.xml' = 'application/xml'; '.txt' = 'text/plain; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'; '.ico' = 'image/x-icon'; '.woff2' = 'font/woff2'; '.pdf' = 'application/pdf'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root"
Write-Host "  -> http://localhost:$Port/   (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $task = $listener.GetContextAsync()
    while (-not $task.AsyncWaitHandle.WaitOne(200)) { }
    $ctx = $task.GetAwaiter().GetResult()
    $res = $ctx.Response
    try {
      $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
      $file = [IO.Path]::GetFullPath((Join-Path $Root $rel))
      $status = 200
      if (-not $file.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $file -PathType Leaf)) {
        $status = 404
        $file = Join-Path $Root '404.html'
      }
      if (Test-Path -LiteralPath $file -PathType Leaf) {
        $bytes = [IO.File]::ReadAllBytes($file)
        $type = $mime[[IO.Path]::GetExtension($file).ToLowerInvariant()]
        if (-not $type) { $type = 'application/octet-stream' }
        $res.ContentType = $type
      } else {
        $bytes = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
        $res.ContentType = 'text/plain; charset=utf-8'
      }
      $res.StatusCode = $status
      $res.Headers['Cache-Control'] = 'no-cache'
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ("{0} {1} /{2}" -f (Get-Date -Format 'HH:mm:ss'), $status, $rel)
    } catch {
      Write-Host "error: $($_.Exception.Message)"
    } finally {
      $res.Close()
    }
  }
} finally {
  $listener.Stop()
}
