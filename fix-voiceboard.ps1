$filePath = "src\App.js"
$content = Get-Content $filePath -Raw
$fixed = $content -replace 'needs: \[', "`nneeds: ["
$fixed | Set-Content $filePath -NoNewline
Write-Host "Done! Now run: git add . && git commit -m fix && git push"
