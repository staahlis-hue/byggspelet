param([int]$Port = 4173)
$env:PORT = $Port
$taskNode = Get-Command node -ErrorAction SilentlyContinue
$bundledNode = 'C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1030-493-0_26.1030.493.0_x64__3k8sg7r9htsxt\dependencies\node\bin\node.exe'
if ($taskNode) { $taskNodePath = $taskNode.Source }
elseif (Test-Path -LiteralPath $bundledNode) { $taskNodePath = $bundledNode }
else { Write-Error 'Node.js behövs för att starta klassrumsservern.'; exit 1 }
& $taskNodePath -e 'require(process.argv[1]).start()' (Join-Path $PSScriptRoot 'server.cjs')
