# Build Infusion Studio OFFLINE APK - bundled app, no server or internet required
# Usage: .\scripts\build-apk-offline.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

function Resolve-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\javac.exe")) {
        return $env:JAVA_HOME
    }
    $candidates = @(
        "$env:USERPROFILE\.jdks\openjdk-22.0.1",
        "$env:USERPROFILE\.jdks\openjdk-21.0.2",
        "$env:USERPROFILE\.jdks\openjdk-20.0.2",
        "D:\"
    )
    foreach ($dir in $candidates) {
        if (Test-Path "$dir\bin\javac.exe") { return $dir }
    }
    throw "No JDK found. Install JDK 21+ or set JAVA_HOME."
}

Write-Host "Building OFFLINE Infusion Studio APK..." -ForegroundColor Cyan
Write-Host "Demo data is bundled - no network or server needed." -ForegroundColor Green

Push-Location $Root

$middleware = Join-Path $Root "src\proxy.ts"
$middlewareBak = Join-Path $Root "src\proxy.ts.offline-bak"
$apiDir = Join-Path $Root "src\app\api"
$apiBak = Join-Path $Root "src\app\_api.offline-bak"
$hadMiddleware = Test-Path $middleware
$hadApi = Test-Path $apiDir

try {
    if ($hadMiddleware) {
        Rename-Item -Path $middleware -NewName "proxy.ts.offline-bak" -Force
        Write-Host "Temporarily disabled proxy for static export"
    }
    if ($hadApi) {
        if (Test-Path $apiBak) { Remove-Item $apiBak -Recurse -Force }
        Rename-Item -Path $apiDir -NewName "_api.offline-bak" -Force
        Write-Host "Temporarily excluded API routes for static export"
    }

    $env:OFFLINE_BUILD = "true"
    $env:NEXT_PUBLIC_OFFLINE_DEMO = "true"
    $env:NEXT_PUBLIC_OFFLINE_APK = "true"
    $env:CAPACITOR_SERVER_URL = ""

    if (Test-Path (Join-Path $Root ".next")) {
        Remove-Item (Join-Path $Root ".next") -Recurse -Force
        Write-Host "Cleared .next cache for offline build"
    }

    Write-Host "Building static app..." -ForegroundColor Cyan
    npx prisma generate
    npx next build
    if ($LASTEXITCODE -ne 0) { throw "next build failed with exit code $LASTEXITCODE" }

    $indexHtml = Join-Path $Root "out\index.html"
    if (-not (Test-Path $indexHtml)) {
        throw "Static export failed: out/index.html not found"
    }

    $env:JAVA_HOME = Resolve-JavaHome
    Write-Host "JAVA_HOME: $env:JAVA_HOME"

    $sdkRoot = Join-Path $Root ".android-sdk"
    if (Test-Path "$sdkRoot\platform-tools") {
        $env:ANDROID_HOME = $sdkRoot
        $env:ANDROID_SDK_ROOT = $sdkRoot
        Write-Host "ANDROID_HOME: $sdkRoot"
    }

    Write-Host "Syncing Capacitor (bundled web assets)..." -ForegroundColor Cyan
    npx cap sync android

    Write-Host "Compiling APK..." -ForegroundColor Cyan
    Push-Location android
    .\gradlew.bat assembleDebug
    Pop-Location

    $releases = Join-Path $Root "releases"
    New-Item -ItemType Directory -Force -Path $releases | Out-Null
    $apkSrc = Join-Path $Root "android\app\build\outputs\apk\debug\app-debug.apk"
    $apkDest = Join-Path $releases "InfusionStudio-Offline-Demo.apk"
    Copy-Item $apkSrc $apkDest -Force

    Write-Host ""
    Write-Host "Offline APK ready!" -ForegroundColor Green
    Write-Host "  File: $apkDest"
    Write-Host ""
    Write-Host "She can install and use the app with no internet. Changes save on-device only." -ForegroundColor Yellow
}
finally {
    if (Test-Path $apiBak) {
        if (Test-Path $apiDir) { Remove-Item $apiDir -Recurse -Force -ErrorAction SilentlyContinue }
        Rename-Item -Path $apiBak -NewName "api" -Force
        Write-Host "Restored API routes"
    }
    if (Test-Path $middlewareBak) {
        if (Test-Path $middleware) { Remove-Item $middleware -Force -ErrorAction SilentlyContinue }
        Rename-Item -Path $middlewareBak -NewName "proxy.ts" -Force
        Write-Host "Restored proxy"
    }
    Remove-Item Env:OFFLINE_BUILD -ErrorAction SilentlyContinue
    Pop-Location
}
