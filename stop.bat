@echo off
chcp 65001 > nul
title إيقاف نظام إدارة المخزون

echo ======================================================================
echo          مكتبة شهد المعارف - إيقاف خدمات النظام المحلي
echo ======================================================================
echo.

echo جاري إيقاف الخوادم (المنفذ 5000 والمنفذ 5173)...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a > nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    taskkill /f /pid %%a > nul 2>&1
)

echo ✅ تم إيقاف جميع خوادم النظام بنجاح.
echo.
pause
