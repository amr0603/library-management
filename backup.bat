@echo off
chcp 65001 > nul
title إنشاء نسخة احتياطية - مكتبة شهد المعارف

echo ======================================================================
echo          مكتبة شهد المعارف - أخذ نسخة احتياطية فورية لقاعدة البيانات
echo ======================================================================
echo.

node -e "
import('node-fetch').catch(() => {});
const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/backups/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('استجابة الخادم:', body);
  });
});
req.on('error', (e) => {
  console.log('يرجى التأكد من تشغيل النظام قبل أخذ النسخة عبر هذا السكربت:', e.message);
});
req.end();
"

echo.
echo ======================================================================
echo تم حفظ النسخة في مجلد: server\backups
echo ======================================================================
pause
