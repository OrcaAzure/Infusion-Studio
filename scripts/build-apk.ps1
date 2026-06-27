# Build Infusion Studio QA APK for Samsung
# Usage: .\scripts\build-apk.ps1 [-ServerUrl "https://your-url"]

param(
    [string]$ServerUrl = "https://lazy-parents-lead.loca.lt"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "Building Infusion Studio APK..." -ForegroundColor Cyan
Write-Host "Server URL: $ServerUrl"

# Bake server URL into launcher HTML
$launcher = Join-Path $Root "public\capacitor-shell\index.html"
$content = Get-Content $launcher -Raw
$content = $content -replace 'const DEFAULT_SERVER = "[^"]*"', "const DEFAULT_SERVER = `"$ServerUrl`""
Set-Content $launcher $content -NoNewline

# Sync Capacitor (no remote server.url — launcher handles connection)
Push-Location $Root
$env:CAPACITOR_SERVER_URL = ""

# Gradle needs a full JDK with javac (not JRE, not the android/ folder)
function Resolve-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\javac.exe")) {
        return $env:JAVA_HOME
    }
    $candidates = @(
        "$env:USERPROFILE\.jdks\openjdk-22.0.1",
        "$env:USERPROFILE\.jdks\openjdk-21.0.2",
        "$env:USERPROFILE\.jdks\openjdk-20.0.2",
        "$env:USERPROFILE\.jdks\corretto-18.0.2-1",
        "D:\"
    )
    foreach ($dir in $candidates) {
        if (Test-Path "$dir\bin\javac.exe") { return $dir }
    }
    $javac = (Get-Command javac -ErrorAction SilentlyContinue).Source
    if ($javac) {
        return (Resolve-Path (Join-Path (Split-Path $javac -Parent) "..")).Path
    }
    throw "No JDK found. Install JDK 17+ or set JAVA_HOME to a JDK path."
}
$env:JAVA_HOME = Resolve-JavaHome
Write-Host "JAVA_HOME: $env:JAVA_HOME"

$sdkRoot = Join-Path $Root ".android-sdk"
if (Test-Path "$sdkRoot\platform-tools") {
    $env:ANDROID_HOME = $sdkRoot
    $env:ANDROID_SDK_ROOT = $sdkRoot
    Write-Host "ANDROID_HOME: $sdkRoot"
}

npx cap sync android

Write-Host "Compiling APK (this may take a few minutes)..." -ForegroundColor Cyan
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location

$apkSrc = Join-Path $Root "android\app\build\outputs\apk\debug\app-debug.apk"
$releases = Join-Path $Root "releases"
New-Item -ItemType Directory -Force -Path $releases | Out-Null
$apkDest = Join-Path $releases "InfusionStudio-QA.apk"
Copy-Item $apkSrc $apkDest -Force

Write-Host ""
Write-Host "APK ready!" -ForegroundColor Green
Write-Host "  File: $apkDest"
Write-Host "  Server: $ServerUrl"
Write-Host ""
Write-Host "Send the APK to your QA tester. Keep the server running at that URL." -ForegroundColor Yellow
Pop-Location
