$branch = '005-appwrite-auth-we'
$current = (git rev-parse --abbrev-ref HEAD) -replace "`r", "" -replace "`n", ""
if ($current -ne $branch) {
  git checkout -B $branch
}
$changes = git status --porcelain
if ($changes -and $changes.Trim().Length -gt 0) {
  git add -A
  git commit -m 'spec(005): add Appwrite admin users spec, plan, contracts, and checklists'
  git push -u origin $branch
}
else {
  Write-Output 'No changes to commit. Ensuring branch exists on remote...'
  git push -u origin $branch --no-verify
}
