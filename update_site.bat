@echo off
echo ==================================================
echo PePre Website Update Tool
echo ==================================================
echo.
echo Checking for changes...
git status
echo.
echo Adding changes to git...
git add .
echo.
echo Committing changes...
set /p msg="Enter commit message (or press enter for 'Update site'): "
if "%msg%"=="" set msg=Update site
git commit -m "%msg%"
echo.
echo Pushing to GitHub (this triggers Vercel deployment)...
git push origin main
echo.
echo ==================================================
echo Deployment triggered! 
echo Your site will be updated on https://lbs-lab.com in a few minutes.
echo ==================================================
pause
