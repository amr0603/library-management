import fs from "fs";
import path from "path";
import sharp from "sharp";

const MEDIA_DIR = "d:/شهد المعارف/library-management/demo-media";

async function buildViewer() {
  const files = [
    { name: "01-login.png", title: "1. شاشة تسجيل الدخول الآمنة", desc: "دخول آمن للمدراء والموظفين وتشفير كامل لكلمات المرور" },
    { name: "02-dashboard.png", title: "2. لوحة التحكم والإحصائيات الحية", desc: "مؤشرات أداء فورية، إجمالي قيمة المخزون التقديرية بسعر الشراء، ورسم بياني تفاعلي لمقارنة الوارد والصادر" },
    { name: "03-products.png", title: "3. دليل المنتجات والأصناف", desc: "جدول متقدم للأصناف، بحث لحظي، فلترة بالتصنيف والحالة، وتصدير فوري إلى Excel" },
    { name: "04-add-product.png", title: "4. نموذج إضافة وتعديل صنف", desc: "تسجيل كود فريد، تسعير الشراء والبيع، تحديد وحدات القياس، وحماية الرصيد من التعديل اليدوي المباشر" },
    { name: "05-incoming-stock.png", title: "5. سند إدخال مخزني (توريد)", desc: "توثيق التوريد، زيادة الأرصدة آلياً، حساب التكلفة، وطباعة إيصال استلام رسمي" },
    { name: "06-outgoing-stock.png", title: "6. سند إخراج مخزني (صرف)", desc: "صرف المبيعات والاستهلاك، منع الرصيد السالب بشكل قاطع، وطباعة إيصال الصرف" },
    { name: "07-movements-history.png", title: "7. سجل حركات المخزون والتدقيق", desc: "توثيق شامل للرصيد قبل وبعد كل حركة، وتوفير إمكانية الإلغاء التدقيقي العكسي (Reversal)" },
    { name: "08-stocktaking.png", title: "8. الجرد الدوري وتسوية المخزون", desc: "مطابقة العد الفعلي بالرصيد الدفتري، احتساب العجز أو الفائض آلياً وإصدار سند تسوية معتمد" },
    { name: "09-low-stock.png", title: "9. تنبيهات نواقص المخزون", desc: "شاشة حصرية للأصناف التي بلغت حد الطلب الأدنى أو قاربت على النفاد مع إمكانية التوريد الفوري" },
    { name: "10-reports.png", title: "10. التقارير المالية والمخزنية المتكاملة", desc: "تقرير جرد وتقييم المخزون المالي بسعر الشراء والبيع، تقرير الحركات، وتصدير إكسل فوري وطباعة" },
  ];

  const slidesData = [];

  for (const item of files) {
    const filePath = path.join(MEDIA_DIR, item.name);
    if (fs.existsSync(filePath)) {
      // Create optimized web-ready image
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString("base64");
      slidesData.push({
        title: item.title,
        desc: item.desc,
        img: `data:image/png;base64,${base64}`,
      });
    }
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>العرض التوضيحي المرئي - نظام إدارة مخزون مكتبة شهد المعارف</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Cairo', sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .main-screen {
      max-width: 1200px;
      margin: 20px auto;
      background: #1e293b;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      overflow: hidden;
      border: 1px solid #334155;
    }
    .screen-img {
      width: 100%;
      height: auto;
      display: block;
      border-bottom: 2px solid #334155;
    }
    .thumb-btn {
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      opacity: 0.6;
      transition: all 0.2s;
    }
    .thumb-btn:hover, .thumb-btn.active {
      opacity: 1;
      border-color: #38bdf8;
      transform: scale(1.05);
    }
    .progress-bar-custom {
      height: 4px;
      background: #38bdf8;
      transition: width 0.3s;
    }
  </style>
</head>
<body class="p-3 p-md-4">
  <div class="container text-center mb-3">
    <div class="d-inline-flex align-items-center gap-2 bg-dark px-4 py-2 rounded-pill border border-secondary mb-2">
      <span class="fs-4">🎬</span>
      <h5 class="mb-0 fw-bold text-white">العرض التوضيحي المرئي لنظام مكتبة شهد المعارف</h5>
      <span class="badge bg-success ms-2">تشغيل تلقائي</span>
    </div>
    <p class="text-secondary small mb-0">جولة مرئية تفاعلية مستمرة توضح كافة شاشات وميزات النظام باللغة العربية</p>
  </div>

  <div class="main-screen">
    <div class="p-3 bg-dark d-flex justify-content-between align-items-center border-bottom border-secondary">
      <div>
        <h5 id="slideTitle" class="fw-bold text-info mb-1"></h5>
        <p id="slideDesc" class="text-secondary small mb-0"></p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button id="btnPrev" class="btn btn-outline-light btn-sm px-3">السابق ◀</button>
        <button id="btnPlayPause" class="btn btn-info btn-sm px-3 fw-bold">إيقاف مؤقت ⏸️</button>
        <button id="btnNext" class="btn btn-outline-light btn-sm px-3">التالي ▶</button>
      </div>
    </div>

    <div class="progress" style="height: 4px;">
      <div id="timelineProgress" class="progress-bar-custom" style="width: 10%;"></div>
    </div>

    <div class="position-relative">
      <img id="mainImage" class="screen-img" src="" alt="شاشة النظام">
    </div>

    <div class="p-3 bg-dark border-top border-secondary">
      <div class="d-flex justify-content-center gap-2 overflow-x-auto py-1" id="thumbsContainer"></div>
    </div>
  </div>

  <div class="text-center mt-3">
    <a href="http://localhost:5173" target="_blank" class="btn btn-success fw-bold px-4 py-2 rounded-pill shadow">
      🚀 فتح واستخدام التطبيق الحي الآن (http://localhost:5173)
    </a>
  </div>

  <script>
    const slides = ${JSON.stringify(slidesData)};
    let currentIndex = 0;
    let isPlaying = true;
    let timer = null;

    const mainImage = document.getElementById('mainImage');
    const slideTitle = document.getElementById('slideTitle');
    const slideDesc = document.getElementById('slideDesc');
    const timelineProgress = document.getElementById('timelineProgress');
    const thumbsContainer = document.getElementById('thumbsContainer');
    const btnPlayPause = document.getElementById('btnPlayPause');

    // Build thumbnails
    slides.forEach((s, idx) => {
      const div = document.createElement('div');
      div.className = 'thumb-btn' + (idx === 0 ? ' active' : '');
      div.style.width = '80px';
      div.innerHTML = '<img src="' + s.img + '" style="width:100%; height:45px; object-fit:cover;">';
      div.onclick = () => {
        currentIndex = idx;
        updateSlide();
        resetTimer();
      };
      thumbsContainer.appendChild(div);
    });

    function updateSlide() {
      const s = slides[currentIndex];
      mainImage.src = s.img;
      slideTitle.innerText = s.title;
      slideDesc.innerText = s.desc;
      timelineProgress.style.width = ((currentIndex + 1) / slides.length * 100) + '%';

      Array.from(thumbsContainer.children).forEach((el, i) => {
        el.className = 'thumb-btn' + (i === currentIndex ? ' active' : '');
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlide();
    }

    function resetTimer() {
      clearInterval(timer);
      if (isPlaying) {
        timer = setInterval(nextSlide, 3500);
      }
    }

    document.getElementById('btnNext').onclick = () => { nextSlide(); resetTimer(); };
    document.getElementById('btnPrev').onclick = () => { prevSlide(); resetTimer(); };

    btnPlayPause.onclick = () => {
      isPlaying = !isPlaying;
      btnPlayPause.innerHTML = isPlaying ? 'إيقاف مؤقت ⏸️' : 'تشغيل العرض ▶️';
      if (isPlaying) resetTimer();
      else clearInterval(timer);
    };

    updateSlide();
    resetTimer();
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(MEDIA_DIR, "video-tour.html"), html, "utf8");
  console.log("✅ تم بناء مشغل العرض التوضيحي المرئي المتكامل بنجاح!");
}

buildViewer().catch(console.error);
