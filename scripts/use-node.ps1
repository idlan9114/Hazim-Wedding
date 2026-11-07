# Dot-source this file: . ./scripts/use-node.ps1
$portableNode = Join-Path (Split-Path -Parent $PSScriptRoot) '.tools/node'
if (Test-Path -LiteralPath (Join-Path $portableNode 'node.exe')) {
    $env:Path = "$portableNode;$env:Path"
} else {
    Write-Error 'Portable Node is unavailable. Install Node.js 22.12+ and reopen your terminal.'
}
