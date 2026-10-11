param(
    [string]$ProjectRef = "nuxmpdleqpqunkhbpqjj",
    [string]$AnonKey = ""
)

$supabaseUrl = "https://$ProjectRef.supabase.co"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "TELDS Supabase Connection Verifier & Sync Utility" -ForegroundColor Cyan
Write-Host "Project: $ProjectRef ($supabaseUrl)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $AnonKey) {
    Write-Host "`nTo test live REST queries, please provide your Supabase Anon API Key:" -ForegroundColor Yellow
    Write-Host "Usage: .\scripts\sync_supabase.ps1 -AnonKey '<YOUR_ANON_KEY>'" -ForegroundColor Gray
    Write-Host "`nYou can copy your Anon Key from:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/$ProjectRef/settings/api" -ForegroundColor Cyan
    exit 0
}

$headers = @{
    "apikey" = $AnonKey
    "Authorization" = "Bearer $AnonKey"
}

try {
    Write-Host "`nTesting connection to Supabase REST API..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/energy_analyses?select=count" -Headers $headers -Method Get
    Write-Host "[✓] Successfully connected to Supabase Database!" -ForegroundColor Green

    Write-Host "`nFetching recent meter readings..." -ForegroundColor Cyan
    $readings = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/energy_analyses?select=*&order=timestamp.asc&limit=10" -Headers $headers -Method Get
    Write-Host "[✓] Retrieved $($readings.Count) reading records from table 'energy_analyses'." -ForegroundColor Green
    
    foreach ($r in $readings) {
        Write-Host "  -> Time: $($r.timestamp) | Tx: $($r.transformer_energy_kwh) kWh | Cons: $($r.total_consumer_energy_kwh) kWh | Loss: $($r.loss_percentage)%" -ForegroundColor DarkGray
    }
} catch {
    Write-Error "Connection failed: $_"
    Write-Host "Please ensure you have executed 'supabase_schema.sql' in the Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/$ProjectRef/sql" -ForegroundColor Cyan
}
