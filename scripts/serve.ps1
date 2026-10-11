param(
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "HTTP Server running at $prefix"
    Write-Host "Serving files from: $(Get-Location)"

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            # CORS
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
            $response.AddHeader("Access-Control-Allow-Headers", "*")

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Close()
                continue
            }

            $urlPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
            if ($urlPath -eq "/" -or $urlPath -eq "") {
                $urlPath = "/index.html"
            }

            $relativePath = $urlPath.TrimStart('/')
            $fullPath = Join-Path (Get-Location) $relativePath

            if (Test-Path $fullPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                if ($fullPath.EndsWith(".html")) { $response.ContentType = "text/html; charset=utf-8" }
                elseif ($fullPath.EndsWith(".js")) { $response.ContentType = "application/javascript; charset=utf-8" }
                elseif ($fullPath.EndsWith(".css")) { $response.ContentType = "text/css; charset=utf-8" }
                elseif ($fullPath.EndsWith(".json")) { $response.ContentType = "application/json; charset=utf-8" }
                elseif ($fullPath.EndsWith(".svg")) { $response.ContentType = "image/svg+xml" }
                elseif ($fullPath.EndsWith(".png")) { $response.ContentType = "image/png" }

                $response.ContentLength64 = $bytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $msg.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($msg, 0, $msg.Length)
                }
            }
            $response.Close()
        } catch {
            Write-Warning "Request error: $_"
        }
    }
} catch {
    Write-Error $_
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}
