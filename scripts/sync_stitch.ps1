param(
    [string]$ApiKey = $env:STITCH_API_KEY,
    [string]$OutputDir = "$PSScriptRoot\..\stitch_import"
)

if (-not $ApiKey) {
    Write-Host "Please pass -ApiKey <key> or set `$env:STITCH_API_KEY" -ForegroundColor Yellow
}

$headers = @{ "X-Goog-Api-Key" = $ApiKey }

Write-Host "Connecting to Google Stitch API..." -ForegroundColor Cyan
try {
    $projects = Invoke-RestMethod -Uri "https://stitch.googleapis.com/v1/projects" -Headers $headers -Method Get
} catch {
    Write-Error "Failed to connect to Stitch API: $_"
    exit 1
}

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

foreach ($p in $projects.projects) {
    Write-Host "`nProject: $($p.title) ($($p.name))" -ForegroundColor Green
    $screensUrl = "https://stitch.googleapis.com/v1/$($p.name)/screens"
    try {
        $screens = Invoke-RestMethod -Uri $screensUrl -Headers $headers -Method Get
        foreach ($s in $screens.screens) {
            $cleanTitle = $s.title -replace '[\\/*?:"<>|]', '_'
            Write-Host "  -> Screen: $cleanTitle" -ForegroundColor Yellow
            
            # HTML
            if ($s.htmlCode -and $s.htmlCode.downloadUrl) {
                $htmlFile = Join-Path $OutputDir "$cleanTitle.html"
                Invoke-RestMethod -Uri $s.htmlCode.downloadUrl -Headers $headers -OutFile $htmlFile
                Write-Host "     [✓] HTML exported: $htmlFile" -ForegroundColor DarkGray
            }
            # Screenshot
            if ($s.screenshot -and $s.screenshot.downloadUrl) {
                $pngFile = Join-Path $OutputDir "$cleanTitle.png"
                Invoke-RestMethod -Uri $s.screenshot.downloadUrl -Headers $headers -OutFile $pngFile
                Write-Host "     [✓] Screenshot saved: $pngFile" -ForegroundColor DarkGray
            }
        }
    } catch {
        Write-Warning "Could not fetch screens for $($p.name): $_"
    }
}

Write-Host "`nAll Stitch screens synchronized successfully into: $OutputDir" -ForegroundColor Green
