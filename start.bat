@echo off
chcp 65001 > nul
title نظام إدارة المخزون - مكتبة شهد المعارف

echo ======================================================================
echo          مكتبة شهد المعارف - تشغيل نظام إدارة المخزون والمستودع
echo ======================================================================
echo.

:: 1. التحقق من تشغيل خدمة MongoDB
echo [1/3] فحص قاعدة البيانات المحلية MongoDB...
sc query "MongoDB" | find "RUNNING" > nul
if %ERRORLEVEL% equ 0 (
    echo     ✅ قاعدة البيانات MongoDB قيد التشغيل ونشطة بنجاح.
) else (
    echo     ⚠️ خدمة MongoDB غير مشغلة، جاري محاولة تشغيلها...
    net start MongoDB > nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo     ❌ تعذر بدء خدمة MongoDB تلقائياً. تأكد من تثبيتها وتشغيلها.
    ) else (
        echo     ✅ تم بدء خدمة MongoDB بنجاح.
    )
)

echo.
echo [2/3] بدء تشغيل خادم الخلفية (Backend API Server) على المنفذ 5000...
start "خادم الخلفية - مكتبة شهد المعارف" /min cmd /c "cd /d "%~dp0..\server" && npm start"

timeout /t 3 /nobreak > nul

echo.
echo [3/3] بدء تشغيل واجهة النظام (Frontend Client) على المنفذ 5173...
start "واجهة النظام - مكتبة شهد المعارف" /min cmd /c "cd /d "%~dp0..\client" && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ======================================================================
echo     🎉 تم تشغيل النظام بنجاح!
echo     الواجهة: http://localhost:5173
echo     الخادم: http://localhost:5000
echo.
echo     بيانات تسجيل الدخول الافتراضية:
echo     - المدير: admin / admin123456
echo     - الموظف: employee / emp123456
echo ======================================================================
echo.

start "" "http://localhost:5173"

exit
