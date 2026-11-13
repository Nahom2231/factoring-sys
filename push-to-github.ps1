# Push dev branch
Write-Host "Pushing dev branch to origin..." -ForegroundColor Cyan
git push -u origin dev

# Switch to main and merge dev
Write-Host "Switching to main and merging dev..." -ForegroundColor Cyan
git checkout main
git merge dev

# Push main branch
Write-Host "Pushing main branch to origin..." -ForegroundColor Cyan
git push -u origin main

# Switch back to dev branch
git checkout dev
Write-Host "Done! Successfully pushed dev and main to GitHub." -ForegroundColor Green
