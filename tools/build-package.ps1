param(
    [string]$Version = "dev"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$packageDir = Join-Path $root "packages"
$zipPath = Join-Path $packageDir "keyboard-workspace-manager-$Version.zip"
$staging = Join-Path $packageDir "staging"

if (Test-Path $staging) {
    Remove-Item $staging -Recurse -Force
}

New-Item -ItemType Directory -Path $staging -Force | Out-Null
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null

$include = @(
    "manifest.json",
    "README.md",
    "CHANGELOG.md",
    "PRIVACY.md",
    "LICENSE",
    "src",
    "options",
    "popup",
    "icons"
)

foreach ($item in $include) {
    Copy-Item -Path (Join-Path $root $item) -Destination $staging -Recurse -Force
}

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force
Remove-Item $staging -Recurse -Force

Write-Output $zipPath
