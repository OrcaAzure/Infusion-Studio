# QA: offline static export (same steps as APK build, without Gradle)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$middleware = Join-Path $Root "src\proxy.ts"
$middlewareBak = Join-Path $Root "src\proxy.ts.offline-bak"
$apiDir = Join-Path $Root "src\app\api"
$apiBak = Join-Path $Root "src\app\_api.offline-bak"

try {
    if (Test-Path $middleware) {
        Rename-Item -Path $middleware -NewName "proxy.ts.offline-bak" -Force
    }
    if (Test-Path $apiDir) {
        if (Test-Path $apiBak) { Remove-Item $apiBak -Recurse -Force }
        try {
            Rename-Item -Path $apiDir -NewName "_api.offline-bak" -Force
        } catch {
            throw "Cannot exclude API routes (is 'npm run dev' running?). Stop the dev server and retry offline QA."
        }
    }

    $env:OFFLINE_BUILD = "true"
    $env:NEXT_PUBLIC_OFFLINE_DEMO = "true"
    $env:CAPACITOR_SERVER_URL = ""

    if (Test-Path (Join-Path $Root ".next")) {
        Remove-Item (Join-Path $Root ".next") -Recurse -Force
    }

    Push-Location $Root
    npx next build
    if ($LASTEXITCODE -ne 0) { throw "next build failed with exit code $LASTEXITCODE" }
    if (-not (Test-Path (Join-Path $Root "out\index.html"))) {
        throw "Static export failed: out/index.html not found"
    }

  $routes = @(
        "index.html",
        "dashboard\index.html",
        "ingredients\index.html",
        "blends\index.html",
        "blends\create\index.html",
        "timer\index.html",
        "brew-logs\index.html",
        "recipes\index.html",
        "settings\index.html",
        "blends\item\index.html",
        "ingredients\item\index.html"
    )
    $routeFail = 0
    foreach ($r in $routes) {
        $p = Join-Path $Root "out\$r"
        if (Test-Path $p) {
            Write-Host "OK   out/$($r -replace '\\','/')" -ForegroundColor Green
        } else {
            Write-Host "FAIL out/$($r -replace '\\','/') missing" -ForegroundColor Red
            $routeFail++
        }
    }

    if ($routeFail -gt 0) {
        throw "Offline static route check failed ($routeFail missing)"
    }

    Write-Host "OFFLINE_STATIC_BUILD_OK" -ForegroundColor Green
}
finally {
    if (Test-Path $apiBak) {
        if (Test-Path $apiDir) { Remove-Item $apiDir -Recurse -Force -ErrorAction SilentlyContinue }
        Rename-Item -Path $apiBak -NewName "api" -Force
    }
    if (Test-Path $middlewareBak) {
        if (Test-Path $middleware) { Remove-Item $middleware -Force -ErrorAction SilentlyContinue }
        Rename-Item -Path $middlewareBak -NewName "proxy.ts" -Force
    }
    Remove-Item Env:OFFLINE_BUILD -ErrorAction SilentlyContinue
    Remove-Item Env:NEXT_PUBLIC_OFFLINE_DEMO -ErrorAction SilentlyContinue
    Pop-Location
}
