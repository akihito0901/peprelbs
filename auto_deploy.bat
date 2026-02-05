@echo off
echo Auto-deploying...
git add .
git commit -m "Auto-update hero image"
git push origin main
echo Deployed.
