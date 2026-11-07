$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$portableNode = Join-Path $projectRoot '.tools/node'
if (Test-Path -LiteralPath (Join-Path $portableNode 'node.exe')) {
    $env:Path = "$portableNode;$env:Path"
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Install Node.js 22.12+ and restart VS Code before pressing F5.'
}
if (-not (Test-Path -LiteralPath 'node_modules/vite')) {
    throw 'Dependencies are missing. Run npm.cmd install in the VS Code terminal first.'
}
# Avoid ANSI color codes interfering with VS Code's background-ready matcher.
$env:NO_COLOR = '1'
Write-Output 'Starting Vite'
& npm.cmd run dev
exit $LASTEXITCODE
