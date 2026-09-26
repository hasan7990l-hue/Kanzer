// ============================================
// Firebase - ننتظر حتى يتحمل
// ============================================
var db = null;
var addDoc = null;
var collection = null;
var getDocs = null;
var deleteDoc = null;
var doc = null;
var updateDoc = null;

function connectFirebase() {
  if (window.firebaseDB) {
    db = window.firebaseDB;
    addDoc = window.firebaseAddDoc;
    collection = window.firebaseCollection;
    getDocs = window.firebaseGetDocs;
    deleteDoc = window.firebaseDeleteDoc;
    doc = window.firebaseDoc;
    updateDoc = window.firebaseUpdateDoc;

    console.log('✅ Firebase connected');

    if (typeof loadProductsFromFirestore === 'function') {
      loadProductsFromFirestore();
    }

    var dash = document.getElementById('dashboardPage');
    if (dash && dash.classList.contains('active')) {
      if (typeof loadDashboardProducts === 'function') {
        loadDashboardProducts();
      }
    }
  } else {
    setTimeout(connectFirebase, 100);
  }
}

connectFirebase();

// ============================================
// YouTube API Key
// ============================================
var YOUTUBE_API_KEY = "AIzaSyDGz7KuTuH_WcG7_bTshaCkz6ZRpQDvQWc";

// ============================================
// 📋 قائمة أجهزة كانون الحديثة (2026)
// ============================================
var modernCanonPrinters = [
  // imageFORCE Series
  "imageFORCE C3150", "imageFORCE C3135", "imageFORCE C3130", "imageFORCE C3126",
  "imageFORCE 4145", "imageFORCE 4135", "imageFORCE 4125",
  
  // imageRUNNER ADVANCE DX Series
  "imageRUNNER ADVANCE DX C3922i", "imageRUNNER ADVANCE DX C3926i", "imageRUNNER ADVANCE DX C3930i",
  "imageRUNNER ADVANCE DX C3935i", "imageRUNNER ADVANCE DX C3830F-RG", "imageRUNNER ADVANCE DX C3826F-RG",
  "imageRUNNER ADVANCE DX C359iF", "imageRUNNER ADVANCE DX C259iF", "imageRUNNER ADVANCE DX C5840i",
  "imageRUNNER ADVANCE DX C568iFZ", "imageRUNNER ADVANCE DX 4725i",
  
  // imageCLASS Series (Color)
  "imageCLASS MF667Cx", "imageCLASS MF664Cdw", "imageCLASS MF662Cdw", "imageCLASS MF756CxII",
  "imageCLASS MF752CdwII", "imageCLASS MF465dw II", "imageCLASS MF563x", "imageCLASS MF665Cdw",
  "imageCLASS MF753Cdw II", "imageCLASS LBP811Cx", "imageCLASS LBP647Cdw", "imageCLASS LBP647Cdn",
  "imageCLASS LBP646Cdw", "imageCLASS LBP673Cdw II", "imageCLASS LBP674Cx II", "imageCLASS LBP741Cx",
  "imageCLASS LBP468x", "imageCLASS LBP335x",
  
  // MAXIFY Series
  "MAXIFY GX7170", "MAXIFY GX1051", "MAXIFY GX2051", "MAXIFY GX1041", "MAXIFY GX2041",
  "MAXIFY MB5170", "MAXIFY MB5470",
  
  // PIXMA Series
  "PIXMA TS8880", "PIXMA TS4070", "PIXMA TS5560", "PIXMA TS4060", "PIXMA TS9521C",
  "PIXMA G3730", "PIXMA G2021", "PIXMA E3370", "PIXMA E560", "PIXMA G3270",
  "PIXMA G6020", "PIXMA G3630", "PIXMA G4780"
];

// ============================================
// الجزيئات
// ============================================
var luxuryParticles = document.getElementById('luxuryParticles');
if (luxuryParticles) {
  for (var i = 0; i < 40; i++) {
    var p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = (2 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    p.style.background = Math.random() > 0.5 ? '#FFC107' : '#0066FF';
    p.style.borderRadius = '50%';
    p.style.left = (Math.random() * 90 + 5) + '%';
    p.style.top = (Math.random() * 90 + 5) + '%';
    p.style.boxShadow = '0 0 10px ' + (Math.random() > 0.5 ? '#FFC107' : '#0066FF');
    p.style.opacity = 0.3 + Math.random() * 0.5;
    p.style.animation = 'floatParticle ' + (5 + Math.random() * 10) + 's infinite ease-in-out';
    p.style.animationDelay = Math.random() * 5 + 's';
    p.style.pointerEvents = 'none';
    luxuryParticles.appendChild(p);
  }
}

// ... (بقية دوال النوافذ والقائمة الجانبية والتسجيل كما هي بدون تغيير) ...

// ============================================
// 🎬 بحث يوتيوب - فيديوهات قصيرة (30 ثانية)
// ============================================
async function searchYouTubeVideos() {
  var query = document.getElementById('dashProductName').value.trim();
  if (!query) {
    alert('اكتب اسم المنتج أولاً');
    return;
  }

  var resultsDiv = document.getElementById('dashVideoResults');
  resultsDiv.innerHTML = '<p style="text-align:center;color:#4D94FF;">🔍 NAKHEEB يبحث عن فيديوهات قصيرة...</p>';

  try {
    // نبحث عن فيديوهات "short" (أقل من 4 دقائق) لتقليل الطول العام
    var searchQuery = query + ' printer';
    
    var searchUrl = 'https://www.googleapis.com/youtube/v3/search?' +
      'part=snippet' +
      '&q=' + encodeURIComponent(searchQuery) +
      '&type=video' +
      '&videoDuration=short' + // فلتر أساسي: فيديوهات أقل من 4 دقائق
      '&videoEmbeddable=true' +
      '&maxResults=10' + // نجيب 10 نتائج ثم نفلترها
      '&relevanceLanguage=en' +
      '&key=' + YOUTUBE_API_KEY;

    var searchResponse = await fetch(searchUrl);
    var searchData = await searchResponse.json();

    if (searchData.error) {
      resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">خطأ: ' + searchData.error.message + '</p>';
      return;
    }

    if (!searchData.items || searchData.items.length === 0) {
      resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">ما لقيت فيديوهات قصيرة.</p>';
      return;
    }

    // نأخذ معرّفات الفيديوهات للحصول على تفاصيل المدة
    var videoIds = searchData.items.map(function(item) {
      return item.id.videoId;
    }).join(',');

    // نجيب مدة كل فيديو من videos.list
    var detailsUrl = 'https://www.googleapis.com/youtube/v3/videos?' +
      'part=contentDetails,snippet' +
      '&id=' + videoIds +
      '&key=' + YOUTUBE_API_KEY;

    var detailsResponse = await fetch(detailsUrl);
    var detailsData = await detailsResponse.json();

    if (detailsData.error) {
      resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">خطأ: ' + detailsData.error.message + '</p>';
      return;
    }

    // نفلتر الفيديوهات: نريد المدة <= 60 ثانية (يفضل حول 30 ثانية)
    var filteredVideos = [];
    
    detailsData.items.forEach(function(item) {
      var duration = item.contentDetails.duration; // مثال: PT45S أو PT1M30S
      var seconds = parseYouTubeDuration(duration);
      
      // نختار الفيديوهات التي مدتها 15 إلى 60 ثانية (الأفضل قرب 30)
      if (seconds >= 15 && seconds <= 60) {
        filteredVideos.push({
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          duration: seconds
        });
      }
    });

    // إذا ما لقينا فيديوهات في هذا النطاق، نعرض أقصر الفيديوهات المتاحة
    if (filteredVideos.length === 0) {
      // نرتب حسب المدة ونأخذ الأقصر
      var allVideos = detailsData.items.map(function(item) {
        return {
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          duration: parseYouTubeDuration(item.contentDetails.duration)
        };
      }).sort(function(a, b) {
        return a.duration - b.duration;
      }).slice(0, 6); // نأخذ 6 أقصر
      
      filteredVideos = allVideos;
    }

    // ترتيب الفيديوهات: الأقرب إلى 30 ثانية أولاً
    filteredVideos.sort(function(a, b) {
      return Math.abs(a.duration - 30) - Math.abs(b.duration - 30);
    });

    // عرض النتائج
    resultsDiv.innerHTML = '';
    var grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '10px';

    filteredVideos.forEach(function(item) {
      var durationText = item.duration + ' ثانية';
      
      var videoItem = document.createElement('div');
      videoItem.style.cssText = 'position:relative;cursor:pointer;border-radius:12px;overflow:hidden;border:2px solid rgba(0,102,255,0.3);background:#0a1628;';
      videoItem.innerHTML =
        '<img src="' + item.thumbnail + '" style="width:100%;height:120px;object-fit:cover;display:block;" alt="">' +
        '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.85);color:#fff;padding:6px;font-size:10px;text-align:center;line-height:1.3;">' + 
          item.title.substring(0, 35) + '...<br><span style="color:#FFC107;">⏱ ' + durationText + '</span>' +
        '</div>';

      videoItem.addEventListener('click', function() {
        document.querySelectorAll('#dashVideoResults > div > div').forEach(function(el) {
          el.style.borderColor = 'rgba(0,102,255,0.3)';
          el.style.borderWidth = '2px';
        });
        videoItem.style.borderColor = '#00C853';
        videoItem.style.borderWidth = '3px';

        window.selectedVideoUrl = 'https://www.youtube.com/embed/' + item.id;
        window.selectedVideoType = 'youtube';
        window.selectedVideoTitle = item.title;
        showToast('✅ تم اختيار فيديو (' + durationText + ')');
      });

      grid.appendChild(videoItem);
    });

    resultsDiv.appendChild(grid);

    var hint = document.createElement('p');
    hint.style.cssText = 'text-align:center;color:#4D94FF;font-size:11px;margin-top:10px;';
    hint.textContent = '💡 تم عرض فيديوهات قصيرة (15-60 ثانية) لتناسب طلبك';
    resultsDiv.appendChild(hint);

  } catch(e) {
    resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">خطأ: ' + e.message + '</p>';
  }
}

// ============================================
// تحويل مدة يوتيوب من ISO 8601 إلى ثواني
// ============================================
function parseYouTubeDuration(duration) {
  // duration مثال: PT1M30S أو PT45S أو PT1H2M10S
  var match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  var hours = parseInt(match[1] || 0);
  var minutes = parseInt(match[2] || 0);
  var seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// ... (بقية الدوال كما هي: publishProduct, loadDashboardProducts, deleteProduct, setupSliders, إلخ) ...
