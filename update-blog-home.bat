@echo off
cd /d "%~dp0"
python scripts\update_blog_home.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python が見つかりません。Python 3 をインストールしてください。
    pause
    exit /b 1
)
echo.
echo 完了！ jg_blog_home.html をブラウザで開いて確認してください。
pause
