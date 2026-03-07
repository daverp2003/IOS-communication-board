$filePath = "src\App.js"
$content = Get-Content $filePath -Raw
$content = $content -replace 'Lord Darren the Staff Wielder of Magical Apps', 'Lord Darren and The Stick of Unsolicited Advice'
$content | Set-Content $filePath -NoNewline
Write-Host "Title updated! Now push to GitHub:"
Write-Host "  git add ."
Write-Host "  git commit -m 'Update app title'"
Write-Host "  git push"
