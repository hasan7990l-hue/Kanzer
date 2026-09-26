// ============================================
// Firebase
// ============================================
var db = window.firebaseDB;
var addDoc = window.firebaseAddDoc;
var collection = window.firebaseCollection;
var getDocs = window.firebaseGetDocs;
var deleteDoc = window.firebaseDeleteDoc;
var doc = window.firebaseDoc;

// ============================================
// YouTube API Key
// ============================================
var YOUTUBE_API_KEY = "AIzaSyDGz7KuTuH_WcG7_bTshaCkz6ZRpQDvQWc";

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

// ============================================
// النوافذ
// ============================================
function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function openPrivacy() { openModal('privacyModal'); }
function openAbout() { openModal('aboutModal'); }
function openLogin() { openModal('loginModal'); }
function openProfile() { loadProfile(); openModal('profileModal'); }

var modals = document.querySelectorAll('.modal');
for (var i = 0; i < modals.length; i++) {
  modals[i].addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
  });
}

// ============================================
// Sidebar
// ============================================
function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
  if (navigator.vibrate) navigator.vibrate(10);
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

function goToHome() {
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openDashboardWithPassword() {
  var password = prompt('🔐 أدخل كلمة السر:');
  if (password === null) return;
  if (password === 'nakheeb2026') {
    closeSidebar();
    openDashboardPage();
  } else {
    alert('❌ كلمة السر غلط');
  }
}

function openDashboardPage() {
  var page = document.getElementById('dashboardPage');
  if (page) {
    page.classList.add('active');
    loadDashboardProducts();
  }
}

function closeDashboardPage() {
  var page = document.getElementById('dashboardPage');
  if (page) page.classList.remove('active');
}

// ============================================
// تسجيل الدخول
// ============================================
function loginWithGoogle() {
  localStorage.setItem('nokhba_logged_in', 'true');
  closeModal('loginModal');

  var hero = document.getElementById('luxuryHero');
  if (hero) setTimeout(function() { hero.classList.add('hide'); }, 300);

  var mainSite = document.getElementById('mainSite');
  if (mainSite) {
    setTimeout(function() {
      mainSite.classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  }
}

function logout() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch(e) {}

  var hero = document.getElementById('luxuryHero');
  var mainSite = document.getElementById('mainSite');

  if (mainSite) mainSite.classList.remove('show');
  if (hero) hero.classList.remove('hide');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  var dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('active');

  if (navigator.vibrate) navigator.vibrate(20);
}

// ============================================
// تحميل الصفحة
// ============================================
window.addEventListener('load', function() {
  var isLoggedIn = localStorage.getItem('nokhba_logged_in');

  if (isLoggedIn === 'true') {
    var hero = document.getElementById('luxuryHero');
    var mainSite = document.getElementById('mainSite');
    if (hero) hero.classList.add('hide');
    if (mainSite) mainSite.classList.add('show');
  }

  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  if (profile.avatar) updateAvatarDisplay(profile.avatar);

  loadProductsFromFirestore();
});

// ============================================
// تصفح المنتجات
// ============================================
function scrollToProducts() {
  var productsSection = document.getElementById('productsSection');
  if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// البحث
// ============================================
function searchProducts(query) {
  query = query.toLowerCase().trim();
  var cards = document.querySelectorAll('.products-grid .card');

  for (var i = 0; i < cards.length; i++) {
    var cardName = cards[i].getAttribute('data-name') || '';
    if (query === '' || cardName.indexOf(query) !== -1) {
      cards[i].classList.remove('hidden');
    } else {
      cards[i].classList.add('hidden');
    }
  }

  var allBtns = document.querySelectorAll('.category-btn');
  for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
  if (allBtns[0]) allBtns[0].classList.add('active');
}

// ============================================
// الأقسام
// ============================================
function filterCategory(category, btn) {
  var allBtns = document.querySelectorAll('.category-btn');
  for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
  btn.classList.add('active');

  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  var cards = document.querySelectorAll('.products-grid .card');
  for (var i = 0; i < cards.length; i++) {
    var cardCategories = cards[i].getAttribute('data-category') || '';
    if (category === 'all' || cardCategories.indexOf(category) !== -1) {
      cards[i].classList.remove('hidden');
    } else {
      cards[i].classList.add('hidden');
    }
  }

  if (navigator.vibrate) navigator.vibrate(10);
}

// ============================================
// NAKHEEB - قاعدة البيانات
// ============================================
var nokhbaProductsDB = {
  "canon pixma g3411": {
    desc: "طابعة ملونة عالية الجودة بنظام الحبر المستمر — مثالية للاستخدام اليومي.",
    marketing: "🔥 الأكثر مبيعاً — اقتصادية في الحبر، توفّرلك فلوس على المدى الطويل!",
    specs: [
      { label: "النوع", value: "طابعة ملونة" },
      { label: "التقنية", value: "Inkjet" },
      { label: "السرعة", value: "8.8 صورة/دقيقة" },
      { label: "الاتصال", value: "USB + واي فاي" },
      { label: "الحبر", value: "مستمر (GI-490)" }
    ]
  },
  "canon lbp6030": {
    desc: "طابعة ليزر أبيض وأسود سريعة وموثوقة — تصميم مدمج يناسب أي مكتب.",
    marketing: "⚡ أسرع طابعة ليزر بفئتها — اطبع مئات الصفحات بدون ما تحس!",
    specs: [
      { label: "النوع", value: "طابعة ليزر" },
      { label: "التقنية", value: "Laser" },
      { label: "السرعة", value: "18 صورة/دقيقة" },
      { label: "الاتصال", value: "USB" }
    ]
  },
  "canon pixma ts3320": {
    desc: "طابعة منزلية متعددة الوظائف — تطبع وتمسح وتنسخ بسهولة.",
    marketing: "✨ 3 أجهزة في جهاز واحد — وفّر مساحة وفلوس!",
    specs: [
      { label: "النوع", value: "طابعة متعددة" },
      { label: "التقنية", value: "Inkjet" },
      { label: "الوظائف", value: "طباعة + مسح + نسخ" }
    ]
  },
  "canon maxify gx6010": {
    desc: "طابعة مكتبية احترافية مصممة للشركات — إنتاجية عالية وتكلفة منخفضة.",
    marketing: "👑 صممت للشركات — تطبع آلاف الصفحات بجودة ثابتة!",
    specs: [
      { label: "النوع", value: "طابعة مكتبية" },
      { label: "السرعة", value: "24 صورة/دقيقة" },
      { label: "الوظائف", value: "طباعة + مسح + نسخ + فاكس" }
    ]
  },
  "canon selphy cp1300": {
    desc: "طابعة صور محمولة — اطبع صورك مباشرة من هاتفك بجودة استوديو.",
    marketing: "📸 اطبع ذكرياتك فوراً — مثالية للمناسبات والسفر!",
    specs: [
      { label: "النوع", value: "طابعة صور" },
      { label: "الاتصال", value: "واي فاي + USB" },
      { label: "البطارية", value: "قابلة للشحن" }
    ]
  },
  "canon pixma mg3620": {
    desc: "طابعة ملونة اقتصادية — مثالية للاستخدام المنزلي اليومي.",
    marketing: "💰 اقتصادية وجودة عالية — الخيار الأمثل للمنزل!",
    specs: [
      { label: "النوع", value: "طابعة متعددة" },
      { label: "التقنية", value: "Inkjet" }
    ]
  }
};

function nokheebLookup(name) {
  var key = name.toLowerCase().trim();

  if (nokhbaProductsDB[key]) {
    return nokhbaProductsDB[key];
  }

  var keys = Object.keys(nokhbaProductsDB);
  for (var i = 0; i < keys.length; i++) {
    if (key.indexOf(keys[i]) !== -1 || keys[i].indexOf(key) !== -1) {
      return nokhbaProductsDB[keys[i]];
    }
  }

  return {
    desc: "منتج أصلي من نُخبة — جودة عالية وسعر مناسب.",
    marketing: "✨ اختيار النخبة — جودة مضمونة وخدمة ممتازة!",
    specs: [
      { label: "النوع", value: "طابعة" },
      { label: "الحالة", value: "جديد" },
      { label: "الأصالة", value: "أصلي 100%" }
    ]
  };
}

// ============================================
// تحميل المنتجات من Firestore
// ============================================
async function loadProductsFromFirestore() {
  if (!db) return;

  try {
    var querySnapshot = await getDocs(collection(db, "products"));
    var productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    if (querySnapshot.size === 0) {
      productsGrid.innerHTML = '<p style="color:#888;text-align:center;padding:40px;grid-column:1/-1;">ما فيه منتجات حالياً — قريباً!</p>';
      return;
    }

    querySnapshot.forEach(function(docSnap) {
      var data = docSnap.data();
      var card = createProductCard(data, docSnap.id);
      productsGrid.appendChild(card);
    });

    setupSliders();
    setupDetailsButtons();
    setupContactButtons();
    setupRippleEffect();
    setup3DTilt();

  } catch(e) {
    console.log('Firestore error:', e);
  }
}

// ============================================
// استخراج YouTube ID
// ============================================
function getYouTubeId(url) {
  if (!url) return '';
  var match = url.match(/embed\/([^?&]+)/);
  if (match) return match[1];
  return '';
}

// ============================================
// إنشاء بطاقة منتج
// ============================================
function createProductCard(data, firestoreId) {
  var card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-category', data.category || 'new');
  card.setAttribute('data-name', (data.name || '').toLowerCase());

  var videoHTML = '';
  if (data.videoUrl) {
    if (data.videoType === 'youtube' || data.videoUrl.indexOf('youtube.com/embed') !== -1) {
      var ytId = getYouTubeId(data.videoUrl);
      videoHTML = '<iframe class="product-video" src="https://www.youtube.com/embed/' + ytId + '?autoplay=1&mute=1&loop=1&playlist=' + ytId + '&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    } else {
      videoHTML = '<video class="product-video" autoplay muted loop playsinline><source src="' + data.videoUrl + '" type="video/mp4"></video>';
    }
  }

  var imagesHTML = '<img src="https://picsum.photos/seed/' + (firestoreId || 'p') + '/400/300" alt="1">';
  if (data.images && data.images.length > 0) {
    imagesHTML = '';
    for (var i = 0; i < data.images.length; i++) {
      imagesHTML += '<img src="' + data.images[i] + '" alt="' + (i+1) + '">';
    }
  }

  var marketingHTML = '';
  if (data.marketing) {
    marketingHTML = '<div class="marketing-msg">' + data.marketing + '</div>';
  }

  card.innerHTML = '<div class="card-glow"></div>' +
    '<div class="slider">' +
      videoHTML +
      '<div class="slides">' + imagesHTML + '</div>' +
    '</div>' +
    '<div class="content">' +
      '<h3>' + (data.name || 'منتج') + '</h3>' +
      '<p class="desc">' + (data.desc || '') + '</p>' +
      marketingHTML +
      '<button class="btn details-btn" data-id="' + (firestoreId || '') + '">تفاصيل الجهاز</button>' +
      '<button class="btn contact-btn">تواصل معنا</button>' +
    '</div>';

  return card;
}

// ============================================
// السلايدر
// ============================================
function setupSliders() {
  var allSliders = document.querySelectorAll('.slider');
  for (var s = 0; s < allSliders.length; s++) {
    (function(slider) {
      if (slider.getAttribute('data-ready')) return;
      slider.setAttribute('data-ready', 'true');

      var slides = slider.querySelector('.slides');
      if (!slides) return;

      var images = slides.querySelectorAll('img');
      var totalSlides = images.length;
      if (totalSlides === 0) return;

      var currentSlide = 0;
      var startX = 0;
      var isDragging = false;

      slider.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
      });

      slider.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        var diff = startX - e.touches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) currentSlide = (currentSlide + 1) % totalSlides;
          else currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
          slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
          isDragging = false;
        }
      });

      slider.addEventListener('touchend', function() { isDragging = false; });
    })(allSliders[s]);
  }
}

// ============================================
// أزرار التفاصيل
// ============================================
function setupDetailsButtons() {
  var detailsButtons = document.querySelectorAll('.details-btn');
  for (var i = 0; i < detailsButtons.length; i++) {
    (function(btn) {
      if (btn.getAttribute('data-ready')) return;
      btn.setAttribute('data-ready', 'true');
      btn.addEventListener('click', function() {
        var id = btn.getAttribute('data-id');
        if (id) openProductDetails(id);
      });
    })(detailsButtons[i]);
  }
}

// ============================================
// فتح تفاصيل المنتج
// ============================================
async function openProductDetails(id) {
  if (!id) return;

  try {
    var allProducts = await getDocs(collection(db, "products"));
    var found = null;
    allProducts.forEach(function(d) {
      if (d.id === id) found = d.data();
    });

    if (found) {
      showProductModal(found.name, found.desc, found.specs || [], found.marketing);
      return;
    }
  } catch(e) {}
}

function showProductModal(name, desc, specs, marketing) {
  var titleEl = document.getElementById('detailsTitle');
  var descEl = document.getElementById('detailsDesc');
  var specsEl = document.getElementById('detailsSpecs');
  var marketingSlot = document.getElementById('detailsMarketingSlot');

  if (titleEl) titleEl.textContent = name || '-';
  if (descEl) descEl.textContent = desc || '-';

  if (marketingSlot) {
    marketingSlot.innerHTML = '';
    if (marketing) {
      var marketingDiv = document.createElement('div');
      marketingDiv.className = 'marketing-msg';
      marketingDiv.style.marginTop = '15px';
      marketingDiv.textContent = marketing;
      marketingSlot.appendChild(marketingDiv);
    }
  }

  if (specsEl) {
    specsEl.innerHTML = '';
    if (specs && specs.length > 0) {
      for (var i = 0; i < specs.length; i++) {
        var li = document.createElement('li');
        var spec = specs[i];
        var valueHTML = spec.value;
        if (/[A-Za-z]/.test(spec.value)) {
          valueHTML = '<span dir="ltr">' + spec.value + '</span>';
        }
        li.innerHTML = '<strong>' + spec.label + ':</strong> ' + valueHTML;
        specsEl.appendChild(li);
      }
    }
  }

  openModal('detailsModal');
  if (navigator.vibrate) navigator.vibrate(10);
}

// ============================================
// أزرار التواصل
// ============================================
function setupContactButtons() {
  var contactButtons = document.querySelectorAll('.contact-btn');
  for (var i = 0; i < contactButtons.length; i++) {
    (function(btn) {
      if (btn.getAttribute('data-ready')) return;
      btn.setAttribute('data-ready', 'true');
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var menu = document.getElementById('contactMenu');
        if (menu) menu.classList.toggle('active');
      });
    })(contactButtons[i]);
  }
}

document.addEventListener('click', function(e) {
  var menu = document.getElementById('contactMenu');
  if (menu && menu.classList.contains('active') && !menu.contains(e.target)) {
    menu.classList.remove('active');
  }
});

// ============================================
// تأثير الموجة
// ============================================
function setupRippleEffect() {
  var buttons = document.querySelectorAll('.btn');
  for (var i = 0; i < buttons.length; i++) {
    (function(btn) {
      if (btn.getAttribute('data-ripple-ready')) return;
      btn.setAttribute('data-ripple-ready', 'true');
      btn.addEventListener('click', function(e) {
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var size = Math.max(rect.width, rect.height);

        var ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';
        this.appendChild(ripple);

        setTimeout(function() { ripple.remove(); }, 600);
      });
    })(buttons[i]);
  }
}

// ============================================
// 3D Tilt
// ============================================
function setup3DTilt() {
  var cards = document.querySelectorAll('.card');
  for (var i = 0; i < cards.length; i++) {
    (function(card) {
      if (card.getAttribute('data-tilt-ready')) return;
      card.setAttribute('data-tilt-ready', 'true');

      var glow = card.querySelector('.card-glow');

      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / 50;
        var rotateY = (centerX - x) / 50;

        card.style.transform = 'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';

        if (glow) {
          glow.style.left = x + 'px';
          glow.style.top = y + 'px';
          glow.style.opacity = '1';
          glow.style.transform = 'translate(-50%, -50%)';
        }
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
        if (glow) glow.style.opacity = '0';
      });
    })(cards[i]);
  }
}

// ============================================
// القائمة المنسدلة
// ============================================
function toggleProfileMenu(e) {
  if (e) e.stopPropagation();
  var dropdown = document.getElementById('profileDropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) updateDropdownInfo();
  }
}

function updateDropdownInfo() {
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  var nameEl = document.getElementById('dropdownName');
  var emailEl = document.getElementById('dropdownEmail');

  if (nameEl) nameEl.textContent = profile.name || 'المستخدم';
  if (emailEl) emailEl.textContent = profile.email || 'user@gmail.com';

  if (profile.avatar) {
    var dropdownAvatar = document.getElementById('dropdownAvatar');
    if (dropdownAvatar) dropdownAvatar.innerHTML = '<img src="' + profile.avatar + '" alt="avatar">';
  }
}

function openProfileFromDropdown() {
  document.getElementById('profileDropdown').classList.remove('active');
  openProfile();
}

document.addEventListener('click', function(e) {
  var dropdown = document.getElementById('profileDropdown');
  var wrapper = document.querySelector('.profile-menu-wrapper');
  if (dropdown && dropdown.classList.contains('active')) {
    if (wrapper && !wrapper.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  }
});

// ============================================
// الملف الشخصي
// ============================================
function loadProfile() {
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
  var nameInput = document.getElementById('profileNameInput');
  var phoneInput = document.getElementById('profilePhoneInput');
  var addressInput = document.getElementById('profileAddressInput');
  var nameDisplay = document.getElementById('profileName');
  var emailDisplay = document.getElementById('profileEmail');

  if (nameInput) nameInput.value = profile.name || '';
  if (phoneInput) phoneInput.value = profile.phone || '';
  if (addressInput) addressInput.value = profile.address || '';
  if (nameDisplay) nameDisplay.textContent = profile.name || 'المستخدم';
  if (emailDisplay) emailDisplay.textContent = profile.email || 'user@gmail.com';

  if (profile.avatar) updateAvatarDisplay(profile.avatar);
}

function updateAvatarDisplay(imageUrl) {
  var smallAvatar = document.getElementById('profileAvatar');
  var largeAvatar = document.getElementById('profileAvatarLarge');
  var dropdownAvatar = document.getElementById('dropdownAvatar');
  var imgHTML = '<img src="' + imageUrl + '" alt="avatar">';

  if (smallAvatar) smallAvatar.innerHTML = imgHTML;
  if (largeAvatar) largeAvatar.innerHTML = imgHTML;
  if (dropdownAvatar) dropdownAvatar.innerHTML = imgHTML;
}

function uploadAvatar(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('الصورة كبيرة'); return; }

  var reader = new FileReader();
  reader.onload = function(e) {
    var imageUrl = e.target.result;
    var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');
    profile.avatar = imageUrl;
    localStorage.setItem('nokhba_profile', JSON.stringify(profile));
    updateAvatarDisplay(imageUrl);
  };
  reader.readAsDataURL(file);
}

function updateProfile() {
  var nameInput = document.getElementById('profileNameInput');
  var phoneInput = document.getElementById('profilePhoneInput');
  var addressInput = document.getElementById('profileAddressInput');
  var profile = JSON.parse(localStorage.getItem('nokhba_profile') || '{}');

  profile.name = nameInput ? nameInput.value : '';
  profile.phone = phoneInput ? phoneInput.value : '';
  profile.address = addressInput ? addressInput.value : '';

  localStorage.setItem('nokhba_profile', JSON.stringify(profile));

  var nameDisplay = document.getElementById('profileName');
  if (nameDisplay) nameDisplay.textContent = profile.name || 'المستخدم';
}

function saveProfile() {
  updateProfile();
  closeModal('profileModal');
  showToast('تم حفظ التغييرات');
}

// ============================================
// Toast
// ============================================
function showToast(message) {
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() { toast.classList.add('show'); }, 100);
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 2500);
}

// ============================================
// التقييم
// ============================================
var ratingStars = document.querySelectorAll('.star');
var ratingAverage = document.querySelector('.rating-average');
var ratingCount = document.querySelector('.rating-count');
var ratingThanks = document.getElementById('ratingThanks');

var ratingsData = { totalRatings: 0, sumRatings: 0, userRating: 0 };

function loadRatings() {
  try {
    var saved = localStorage.getItem('nokhba_ratings');
    if (saved) {
      var parsed = JSON.parse(saved);
      ratingsData.totalRatings = parsed.totalRatings || 0;
      ratingsData.sumRatings = parsed.sumRatings || 0;
      ratingsData.userRating = parsed.userRating || 0;
    }
  } catch(e) {}
  updateRatingDisplay();
}

function saveRatings() {
  try { localStorage.setItem('nokhba_ratings', JSON.stringify(ratingsData)); } catch(e) {}
}

function updateRatingDisplay() {
  var avg = 0;
  if (ratingsData.totalRatings > 0) avg = ratingsData.sumRatings / ratingsData.totalRatings;

  if (ratingAverage) ratingAverage.textContent = avg.toFixed(1);

  if (ratingCount) {
    var count = ratingsData.totalRatings;
    var label = 'تقييم';
    if (count === 0) label = 'لا يوجد تقييم';
    else if (count === 1) label = 'تقييم واحد';
    else if (count === 2) label = 'تقييمان';
    ratingCount.textContent = '(' + count + ' ' + label + ')';
  }

  if (ratingsData.userRating > 0) {
    for (var i = 0; i < ratingStars.length; i++) {
      var val = parseInt(ratingStars[i].getAttribute('data-value'));
      if (val <= ratingsData.userRating) ratingStars[i].classList.add('active');
      else ratingStars[i].classList.remove('active');
    }
  }
}

function setRating(value) {
  if (ratingsData.userRating > 0) {
    ratingsData.sumRatings -= ratingsData.userRating;
    ratingsData.totalRatings -= 1;
  }

  ratingsData.userRating = value;
  ratingsData.sumRatings += value;
  ratingsData.totalRatings += 1;

  saveRatings();
  updateRatingDisplay();

  for (var i = 0; i < ratingStars.length; i++) {
    var val = parseInt(ratingStars[i].getAttribute('data-value'));
    if (val <= value) ratingStars[i].classList.add('active');
  }

  if (ratingThanks) {
    ratingThanks.classList.remove('show');
    setTimeout(function() { ratingThanks.classList.add('show'); }, 100);
    setTimeout(function() { ratingThanks.classList.remove('show'); }, 3000);
  }

  if (navigator.vibrate) navigator.vibrate(15);
}

for (var i = 0; i < ratingStars.length; i++) {
  (function(star) {
    var value = parseInt(star.getAttribute('data-value'));
    star.addEventListener('click', function() { setRating(value); });
    star.addEventListener('touchend', function(e) {
      e.preventDefault();
      setRating(value);
    });
  })(ratingStars[i]);
}

loadRatings();

// ============================================
// YouTube - البحث عن فيديوهات
// ============================================
async function searchYouTubeVideos() {
  var query = document.getElementById('dashProductName').value.trim();
  if (!query) {
    alert('اكتب اسم المنتج أولاً');
    return;
  }

  var resultsDiv = document.getElementById('dashVideoResults');
  resultsDiv.innerHTML = '<p style="text-align:center;color:#4D94FF;">🔍 NAKHEEB يبحث في YouTube...</p>';

  try {
    var url = 'https://www.googleapis.com/youtube/v3/search?' +
      'part=snippet' +
      '&q=' + encodeURIComponent(query) +
      '&type=video' +
      '&maxResults=6' +
      '&videoEmbeddable=true' +
      '&key=' + YOUTUBE_API_KEY;

    var response = await fetch(url);
    var data = await response.json();

    if (data.error) {
      resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">خطأ: ' + data.error.message + '</p>';
      return;
    }

    if (!data.items || data.items.length === 0) {
      resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">ما لقيت فيديوهات. جرب اسم ثاني.</p>';
      return;
    }

    resultsDiv.innerHTML = '';
    var grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '10px';

    data.items.forEach(function(item) {
      var videoId = item.id.videoId;
      var title = item.snippet.title;
      var thumbnail = item.snippet.thumbnails.medium.url;

      var videoItem = document.createElement('div');
      videoItem.style.cssText = 'position:relative;cursor:pointer;border-radius:12px;overflow:hidden;border:2px solid rgba(0,102,255,0.3);background:#0a1628;';
      videoItem.innerHTML =
        '<img src="' + thumbnail + '" style="width:100%;height:120px;object-fit:cover;display:block;" alt="' + title + '">' +
        '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.8);color:#fff;padding:6px;font-size:10px;text-align:center;line-height:1.3;">' + title.substring(0, 35) + '...</div>';

      videoItem.addEventListener('click', function() {
        document.querySelectorAll('#dashVideoResults > div > div').forEach(function(el) {
          el.style.borderColor = 'rgba(0,102,255,0.3)';
          el.style.borderWidth = '2px';
        });
        videoItem.style.borderColor = '#00C853';
        videoItem.style.borderWidth = '3px';

        window.selectedVideoUrl = 'https://www.youtube.com/embed/' + videoId;
        window.selectedVideoType = 'youtube';
        window.selectedVideoTitle = title;
        showToast('✅ تم اختيار الفيديو');
      });

      grid.appendChild(videoItem);
    });

    resultsDiv.appendChild(grid);

  } catch(e) {
    resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">خطأ: ' + e.message + '</p>';
  }
}

// ============================================
// Dashboard - نشر المنتج
// ============================================
async function publishProduct() {
  var name = document.getElementById('dashProductName').value.trim();
  var descInput = document.getElementById('dashProductDesc').value.trim();
  var category = document.getElementById('dashProductCategory').value;

  if (!name) { alert('اكتب اسم المنتج'); return; }
  if (!window.selectedVideoUrl) { alert('اختر فيديو أولاً'); return; }
  if (!db) { alert('Firebase مو متصل'); return; }

  var statusDiv = document.getElementById('dashStatus');
  statusDiv.innerHTML = '🎯 NAKHEEB يحلل المنتج...';

  try {
    var productInfo = nokheebLookup(name);

    statusDiv.innerHTML = '📝 NAKHEEB يكتب المواصفات...';

    var finalDesc = (descInput || productInfo.desc);
    var marketingMsg = productInfo.marketing;

    statusDiv.innerHTML = '📤 NAKHEEB ينشر...';

    await addDoc(collection(db, "products"), {
      name: name,
      desc: finalDesc,
      marketing: marketingMsg,
      category: category,
      videoUrl: window.selectedVideoUrl,
      videoType: window.selectedVideoType || 'mp4',
      videoTitle: window.selectedVideoTitle || '',
      specs: productInfo.specs,
      images: [],
      createdAt: new Date().toISOString()
    });

    statusDiv.innerHTML = '✅ تم النشر بنجاح!';
    showToast('🎉 NAKHEEB نشر المنتج');

    document.getElementById('dashProductName').value = '';
    document.getElementById('dashProductDesc').value = '';
    document.getElementById('dashVideoResults').innerHTML = '';
    window.selectedVideoUrl = null;
    window.selectedVideoType = null;
    window.selectedVideoTitle = null;

    setTimeout(function() {
      loadProductsFromFirestore();
      loadDashboardProducts();
      statusDiv.innerHTML = '';
    }, 1500);

  } catch(e) {
    statusDiv.innerHTML = '❌ خطأ: ' + e.message;
  }
}

// ============================================
// Dashboard - قائمة المنتجات
// ============================================
async function loadDashboardProducts() {
  if (!db) return;

  var listDiv = document.getElementById('dashProductsList');
  if (!listDiv) return;

  listDiv.innerHTML = '<p style="color:#888;text-align:center;">جاري التحميل...</p>';

  try {
    var querySnapshot = await getDocs(collection(db, "products"));

    if (querySnapshot.size === 0) {
      listDiv.innerHTML = '<p style="color:#888;text-align:center;padding:20px;">ما فيه منتجات حالياً</p>';
      return;
    }

    listDiv.innerHTML = '';

    querySnapshot.forEach(function(docSnap) {
      var data = docSnap.data();
      var item = document.createElement('div');
      item.className = 'dash-product-item';
      item.innerHTML =
        '<div class="dash-product-info">' +
          '<span class="dash-product-name">' + (data.name || 'منتج') + '</span>' +
          '<span class="dash-product-cat">' + (data.category || '') + '</span>' +
        '</div>' +
        '<button class="dash-delete-btn" onclick="deleteProduct(\'' + docSnap.id + '\', \'' + (data.name || '').replace(/'/g, '') + '\')">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>' +
        '</button>';

      listDiv.appendChild(item);
    });

  } catch(e) {
    listDiv.innerHTML = '<p style="color:#FF6B6B;text-align:center;">خطأ: ' + e.message + '</p>';
  }
}

// ============================================
// Dashboard - حذف منتج
// ============================================
async function deleteProduct(id, name) {
  if (!confirm('تريد تمسح: ' + name + ' ؟')) return;

  try {
    await deleteDoc(doc(db, "products", id));
    showToast('🗑️ تم مسح المنتج');
    loadDashboardProducts();
    setTimeout(function() {
      loadProductsFromFirestore();
    }, 500);
  } catch(e) {
    alert('خطأ: ' + e.message);
  }
}

// ============================================
// تشغيل
// ============================================
setupSliders();
setupDetailsButtons();
setupContactButtons();
setupRippleEffect();
setup3DTilt();
