# QA: web routes and APIs (dev server on localhost:3000)
$ErrorActionPreference = "Stop"
$base = "http://localhost:3000"
$fail = 0

function Test-Route($path, $expect = 200) {
    try {
        $r = Invoke-WebRequest -Uri "$base$path" -UseBasicParsing
        if ($r.StatusCode -ne $expect) {
            Write-Host "FAIL $path -> $($r.StatusCode) (expected $expect)" -ForegroundColor Red
            $script:fail++
        } else {
            Write-Host "OK   $path -> $($r.StatusCode)" -ForegroundColor Green
        }
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -eq $expect) {
            Write-Host "OK   $path -> $code" -ForegroundColor Green
        } else {
            Write-Host "FAIL $path -> $code ($($_.Exception.Message))" -ForegroundColor Red
            $script:fail++
        }
    }
}

Write-Host "Web QA against $base" -ForegroundColor Cyan

# Public / marketing
Test-Route "/"
Test-Route "/login"
Test-Route "/register"

# Dashboard routes
Test-Route "/dashboard"
Test-Route "/ingredients"
Test-Route "/ingredients/new"
Test-Route "/blends"
Test-Route "/blends/create"
Test-Route "/timer"
Test-Route "/brew-logs"
Test-Route "/recipes"
Test-Route "/favorites"
Test-Route "/settings"
Test-Route "/oven-infusion"
Test-Route "/qa"

# Dynamic detail pages
Test-Route "/blends/seed-blend-1"
Test-Route "/ingredients/seed-ing-1"

# APIs
$api = Invoke-RestMethod -Uri "$base/api/dashboard"
if ($api.totalIngredients -gt 0) {
    Write-Host "OK   /api/dashboard -> totalIngredients=$($api.totalIngredients)" -ForegroundColor Green
} else {
    Write-Host "FAIL /api/dashboard -> empty or invalid" -ForegroundColor Red
    $fail++
}

$blends = Invoke-RestMethod -Uri "$base/api/blends"
if ($blends.Count -gt 0) {
    Write-Host "OK   /api/blends -> $($blends.Count) blends" -ForegroundColor Green
} else {
    Write-Host "FAIL /api/blends -> no blends" -ForegroundColor Red
    $fail++
}

$ingredients = Invoke-RestMethod -Uri "$base/api/ingredients"
if ($ingredients.Count -gt 0) {
    Write-Host "OK   /api/ingredients -> $($ingredients.Count) ingredients" -ForegroundColor Green
} else {
    Write-Host "FAIL /api/ingredients -> no ingredients" -ForegroundColor Red
    $fail++
}

$logs = Invoke-RestMethod -Uri "$base/api/brew-logs"
if ($null -ne $logs.logs) {
    Write-Host "OK   /api/brew-logs -> paginated ($($logs.logs.Count) logs)" -ForegroundColor Green
} else {
    Write-Host "FAIL /api/brew-logs -> unexpected shape" -ForegroundColor Red
    $fail++
}

if ($fail -eq 0) {
    Write-Host "WEB_QA_OK" -ForegroundColor Green
    exit 0
}
Write-Host "WEB_QA_FAILED ($fail issues)" -ForegroundColor Red
exit 1
