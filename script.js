// ============ Firebase Setup ============
var db = window.firebaseDB;
var addDoc = window.firebaseAddDoc;
var collection = window.firebaseCollection;
var getDocs = window.firebaseGetDocs;
var deleteDoc = window.firebaseDeleteDoc;
var doc = window.firebaseDoc;
var onSnapshot = window.firebaseOnSnapshot;

// ============ Pexels API ============
var PEXELS_API_KEY = "fUwYP07PE6LkC0yx09qHhnHs6WhHsKs58H53DUr91tiANWSinET9MfXT";
var MIN_DURATION = 20;
var MAX_DURATION = 30;

// ============ الجزيئات ============
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

// ============ النوافذ ============
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

// ============ تسجيل الدخول ============
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

// ============ تسجيل الخروج ============
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

// ============ تحميل الصفحة ============
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
  
  var settings = JSON.parse(localStorage.getItem('nokhba_settings') || '{}');
  if (settings.darkMode) document.body.classList.add('dark-mode');
  
  // نحمّل المنتجات من Firestore
  loadProductsFromFirestore();
});

// ============ تصفح المنتجات ============
function scrollToProducts() {
  var productsSection = document.getElementById('productsSection');
  if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
}

// ============ البحث ============
function searchProducts(query) {
  query = query.toLowerCase().trim();
  
  var cards = document.querySelectorAll('.products-grid .card');
  
  for (var i = 0; i < cards.length; i++) {
    var cardName = cards[i].getAttribute('data-name') || '';
    var cardTitle = cards[i].querySelector('h3') ? cards[i].querySelector('h3').textContent.toLowerCase() : '';
    
    if (query === '' || cardName.indexOf(query) !== -1 || cardTitle.indexOf(query) !== -1) {
      cards[i].classList.remove('hidden');
    } else {
      cards[i].classList.add('hidden');
    }
  }
  
  var allBtns = document.querySelectorAll('.category-btn');
  for (var i = 0; i < allBtns.length; i++) {
    allBtns[i].classList.remove('active');
  }
  if (allBtns[0]) allBtns[0].classList.add('active');
}

// ============ الأقسام ============
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
// Firestore - قراءة المنتجات
// ============================================
async function loadProductsFromFirestore() {
  if (!db) return;
  
  try {
    var querySnapshot = await getDocs(collection(db, "products"));
    var productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    // نمسح المنتجات الثابتة (بس نتركها إذا Firestore فاضي)
    if (querySnapshot.size === 0) return;
    
    // نمحي المنتجات القديمة
    productsGrid.innerHTML = '';
    
    querySnapshot.forEach(function(docSnap) {
      var data = docSnap.data();
      var card = createProductCard(data, docSnap.id);
      productsGrid.appendChild(card);
    });
    
    // نعيد تفعيل السلايدر + الأزرار
    setupSliderAndDetails();
    
  } catch(e) {
    console.log('Firestore error:', e);
  }
}
  // ============================================
// إنشاء بطاقة منتج
// ============================================
function createProductCard(data, firestoreId) {
  var card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-category', data.category || 'new');
  card.setAttribute('data-name', (data.name || '').toLowerCase());
  card.setAttribute('data-firestore-id', firestoreId || '');
  
  var videoHTML = '';
  if (data.videoUrl) {
    videoHTML = `
      <video class="product-video" autoplay muted loop playsinline>
        <source src="${data.videoUrl}" type="video/mp4">
      </video>
    `;
  }
  
  var imagesHTML = '';
  if (data.images && data.images.length > 0) {
    for (var i = 0; i < data.images.length; i++) {
      imagesHTML += '<img src="' + data.images[i] + '" alt="' + (i+1) + '">';
    }
  } else {
    imagesHTML = '<img src="https://picsum.photos/seed/' + (firestoreId || 'p') + '/400/300" alt="1">';
  }
  
  var marketingHTML = '';
  if (data.marketing) {
    marketingHTML = '<div class="marketing-msg">' + data.marketing + '</div>';
  }
  
  card.innerHTML = `
    <div class="card-glow"></div>
    <div class="slider">
      ${videoHTML}
      <div class="slides">
        ${imagesHTML}
      </div>
    </div>
    <div class="content">
      <h3>${data.name || 'منتج'}</h3>
      <p class="desc">${data.desc || ''}</p>
      ${marketingHTML}
      <button class="btn details-btn" data-id="${firestoreId || ''}">تفاصيل الجهاز</button>
      <button class="btn contact-btn">تواصل معنا</button>
    </div>
  `;
  
  return card;
}
// ============================================
// السلايدر
// ============================================
function setupSliderAndDetails() {
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
        e.stopPropagation();
        startX = e.touches[0].clientX;
        isDragging = true;
      });
      
      slider.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        e.stopPropagation();
        var diff = startX - e.touches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) currentSlide = (currentSlide + 1) % totalSlides;
          else currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
          slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
          isDragging = false;
        }
      });
      
      slider.addEventListener('touchend', function() { isDragging = false; });
      
      var mouseDown = false;
      slider.addEventListener('mousedown', function(e) {
        startX = e.clientX;
        mouseDown = true;
      });
      slider.addEventListener('mouseup', function() { mouseDown = false; });
      slider.addEventListener('mouseleave', function() { mouseDown = false; });
      slider.addEventListener('mousemove', function(e) {
        if (!mouseDown) return;
        var diff = startX - e.clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) currentSlide = (currentSlide + 1) % totalSlides;
          else currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
          slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
          mouseDown = false;
        }
      });
    })(allSliders[s]);
  }
  
  // أزرار التفاصيل
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
// بيانات المنتجات الافتراضية
// ============================================
var productsData = {
  1: { name: "Canon PIXMA G3411", desc: "طابعة ملونة عالية الجودة", specs: [{label:"النوع",value:"طابعة ملونة"},{label:"التقنية",value:"Inkjet"},{label:"الاتصال",value:"USB + واي فاي"}] },
  2: { name: "Canon LBP6030", desc: "طابعة ليزر أبيض وأسود", specs: [{label:"النوع",value:"طابعة ليزر"},{label:"التقنية",value:"Laser"},{label:"الاتصال",value:"USB"}] },
  3: { name: "Canon PIXMA TS3320", desc: "طابعة منزلية متعددة", specs: [{label:"النوع",value:"طابعة متعددة"},{label:"التقنية",value:"Inkjet"}] },
  4: { name: "Canon MAXIFY GX6010", desc: "طابعة مكتبية احترافية", specs: [{label:"النوع",value:"طابعة مكتبية"}] },
  5: { name: "Canon SELPHY CP1300", desc: "طابعة صور محمولة", specs: [{label:"النوع",value:"طابعة صور"}] },
  6: { name: "Canon PIXMA MG3620", desc: "طابعة ملونة اقتصادية", specs: [{label:"النوع",value:"طابعة متعددة"}] }
};

// ============ فتح تفاصيل المنتج ============
async function openProductDetails(id) {
  // نجرب من Firestore أولاً
  if (db && id.length > 10) {
    try {
      var productRef = doc(db, "products", id);
      var allProducts = await getDocs(collection(db, "products"));
      var found = null;
      allProducts.forEach(function(d) {
        if (d.id === id) found = d.data();
      });
      
      if (found) {
        showProductModal(found.name, found.desc, found.specs || []);
        return;
      }
    } catch(e) {}
  }
  
  // من البيانات الافتراضية
  var product = productsData[id];
  if (!product) return;
  showProductModal(product.name, product.desc, product.specs);
}
// ============ عرض نافذة تفاصيل المنتج ============
function showProductModal(name, desc, specs, marketing) {
  var titleEl = document.getElementById('detailsTitle');
  var descEl = document.getElementById('detailsDesc');
  var specsEl = document.getElementById('detailsSpecs');
  
  if (titleEl) titleEl.textContent = name;
  if (descEl) descEl.textContent = desc;
  
  // نضيف رسالة تسويقية (إذا موجودة)
  var existingMarketing = document.getElementById('modalMarketing');
  if (existingMarketing) existingMarketing.remove();
  
  if (marketing && descEl) {
    var marketingDiv = document.createElement('div');
    marketingDiv.id = 'modalMarketing';
    marketingDiv.className = 'marketing-msg';
    marketingDiv.style.marginTop = '15px';
    marketingDiv.textContent = marketing;
    descEl.parentNode.insertBefore(marketingDiv, descEl.nextSibling);
  }
  
  // المواصفات
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
// ============ تأثير الموجة ============
var buttons = document.querySelectorAll('.btn');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function(e) {
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
}

// ============ قائمة التواصل ============
function openContactMenu(e) {
  if (e) e.stopPropagation();
  var menu = document.getElementById('contactMenu');
  if (menu) menu.classList.toggle('active');
}

var contactButtons = document.querySelectorAll('.contact-btn');
for (var i = 0; i < contactButtons.length; i++) {
  contactButtons[i].addEventListener('click', openContactMenu);
}

document.addEventListener('click', function(e) {
  var menu = document.getElementById('contactMenu');
  if (menu && menu.classList.contains('active') && !menu.contains(e.target)) {
    menu.classList.remove('active');
  }
});

// ============ القائمة المنسدلة ============
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

function openSettingsFromDropdown() {
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

// ============ الملف الشخصي ============
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

function toggleSetting(setting) {
  var settings = JSON.parse(localStorage.getItem('nokhba_settings') || '{}');
  var toggleId = '';
  if (setting === 'notifications') toggleId = 'notificationsToggle';
  if (setting === 'darkMode') toggleId = 'darkModeToggle';
  if (setting === 'promotions') toggleId = 'promotionsToggle';
  
  var toggle = document.getElementById(toggleId);
  if (toggle) {
    settings[setting] = toggle.checked;
    localStorage.setItem('nokhba_settings', JSON.stringify(settings));
    if (setting === 'darkMode') {
      if (toggle.checked) document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');
    }
  }
}

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
// Dashboard (3 ضغطات على شعار N)
// ============================================
var logoClickCount = 0;
var logoClickTimer = null;

var headerLogo = document.querySelector('.header-logo');
if (headerLogo) {
  headerLogo.addEventListener('click', function() {
    logoClickCount++;
    
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(function() {
      logoClickCount = 0;
    }, 1500);
    
    if (logoClickCount === 3) {
      logoClickCount = 0;
      openDashboardPassword();
    }
  });
}

function openDashboardPassword() {
  var password = prompt('🔐 أدخل كلمة السر:');
  if (password === 'nakheeb2026') {
    openDashboard();
  } else if (password !== null) {
    alert('❌ كلمة السر غلط');
  }
}

function openDashboard() {
  openModal('dashboardModal');
}

// ============================================
// Pexels API - البحث عن فيديوهات
// ============================================
async function searchVideos() {
  var query = document.getElementById('dashProductName').value.trim();
  if (!query) {
    alert('اكتب اسم المنتج أولاً');
    return;
  }
  
  var resultsDiv = document.getElementById('dashVideoResults');
  resultsDiv.innerHTML = '<p style="text-align:center;color:#4D94FF;">🔍 NAKHEEB يبحث...</p>';
  
  try {
    var url = 'https://api.pexels.com/videos/search?query=' + encodeURIComponent(query) + '&per_page=6&min_duration=' + MIN_DURATION + '&max_duration=' + MAX_DURATION;
    
    var response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });
    
    var data = await response.json();
    
    if (!data.videos || data.videos.length === 0) {
      resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">ما لقيت فيديوهات. جرب اسم ثاني.</p>';
      return;
    }
    
    // نعرض الفيديوهات
    resultsDiv.innerHTML = '';
    var grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '10px';
    
    data.videos.forEach(function(video) {
      var videoFile = video.video_files.find(function(f) { return f.quality === 'sd' || f.quality === 'hd'; }) || video.video_files[0];
      if (!videoFile) return;
      
      var item = document.createElement('div');
      item.style.cssText = 'position:relative;cursor:pointer;border-radius:12px;overflow:hidden;border:2px solid rgba(0,102,255,0.3);';
      item.innerHTML = `
        <video src="${videoFile.link}" muted loop playsinline style="width:100%;height:120px;object-fit:cover;display:block;"></video>
        <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:#fff;padding:5px;font-size:11px;text-align:center;">
          ${video.duration}ث
        </div>
      `;
      
      item.addEventListener('mouseenter', function() {
        item.querySelector('video').play();
        item.style.borderColor = '#0066FF';
      });
      item.addEventListener('mouseleave', function() {
        item.querySelector('video').pause();
        item.style.borderColor = 'rgba(0,102,255,0.3)';
      });
      
      item.addEventListener('click', function() {
        // نحدد الفيديو
        document.querySelectorAll('#dashVideoResults div[style*="border"]').forEach(function(el) {
          el.style.borderColor = 'rgba(0,102,255,0.3)';
        });
        item.style.borderColor = '#00C853';
        item.style.borderWidth = '3px';
        
        window.selectedVideoUrl = videoFile.link;
        window.selectedVideoDuration = video.duration;
        showToast('✅ تم اختيار الفيديو');
      });
      
      grid.appendChild(item);
    });
    
    resultsDiv.appendChild(grid);
    
  } catch(e) {
    resultsDiv.innerHTML = '<p style="text-align:center;color:#FF6B6B;">خطأ: ' + e.message + '</p>';
  }
}
// ============================================
// قاعدة بيانات المنتجات (NAKHEEB يعرفها)
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
      { label: "الحبر", value: "مستمر (GI-490)" },
      { label: "الاستخدام", value: "منازل ومكاتب صغيرة" }
    ]
  },
  "canon lbp6030": {
    desc: "طابعة ليزر أبيض وأسود سريعة وموثوقة — تصميم مدمج يناسب أي مكتب.",
    marketing: "⚡ أسرع طابعة ليزر بفئتها — اطبع مئات الصفحات بدون ما تحس!",
    specs: [
      { label: "النوع", value: "طابعة ليزر" },
      { label: "التقنية", value: "Laser" },
      { label: "السرعة", value: "18 صورة/دقيقة" },
      { label: "الاتصال", value: "USB" },
      { label: "اللون", value: "أبيض وأسود" },
      { label: "الاستخدام", value: "مكاتب صغيرة" }
    ]
  },
  "canon pixma ts3320": {
    desc: "طابعة منزلية متعددة الوظائف — تطبع وتمسح وتنسخ بسهولة.",
    marketing: "✨ 3 أجهزة في جهاز واحد — وفّر مساحة وفلوس!",
    specs: [
      { label: "النوع", value: "طابعة متعددة" },
      { label: "التقنية", value: "Inkjet" },
      { label: "الوظائف", value: "طباعة + مسح + نسخ" },
      { label: "الاتصال", value: "USB + واي فاي" },
      { label: "الاستخدام", value: "منزلية" }
    ]
  },
  "canon maxify gx6010": {
    desc: "طابعة مكتبية احترافية مصممة للشركات — إنتاجية عالية وتكلفة منخفضة.",
    marketing: "👑 صممت للشركات — تطبع آلاف الصفحات بجودة ثابتة!",
    specs: [
      { label: "النوع", value: "طابعة مكتبية" },
      { label: "التقنية", value: "Inkjet" },
      { label: "السرعة", value: "24 صورة/دقيقة" },
      { label: "الاتصال", value: "USB + واي فاي + Ethernet" },
      { label: "الوظائف", value: "طباعة + مسح + نسخ + فاكس" },
      { label: "الاستخدام", value: "شركات ومكاتب" }
    ]
  },
  "canon selphy cp1300": {
    desc: "طابعة صور محمولة — اطبع صورك مباشرة من هاتفك بجودة استوديو.",
    marketing: "📸 اطبع ذكرياتك فوراً — مثالية للمناسبات والسفر!",
    specs: [
      { label: "النوع", value: "طابعة صور" },
      { label: "التقنية", value: "Dye-Sublimation" },
      { label: "الاتصال", value: "واي فاي + USB" },
      { label: "الشاشة", value: "3.2 بوصة" },
      { label: "البطارية", value: "قابلة للشحن" },
      { label: "الاستخدام", value: "مناسبات وسفر" }
    ]
  },
  "canon pixma mg3620": {
    desc: "طابعة ملونة اقتصادية — مثالية للاستخدام المنزلي اليومي.",
    marketing: "💰 اقتصادية وجودة عالية — الخيار الأمثل للمنزل!",
    specs: [
      { label: "النوع", value: "طابعة متعددة" },
      { label: "التقنية", value: "Inkjet" },
      { label: "الوظائف", value: "طباعة + مسح + نسخ" },
      { label: "الاتصال", value: "USB + واي فاي" },
      { label: "الاستخدام", value: "منزلية" }
    ]
  }
};

// ============================================
// NAKHEEB يبحث عن معلومات المنتج
// ============================================
function nokheebLookup(name) {
  var key = name.toLowerCase().trim();
  
  // بحث دقيق
  if (nokhbaProductsDB[key]) {
    return nokhbaProductsDB[key];
  }
  
  // بحث جزئي (إذا كتب كلمة من الاسم)
  var keys = Object.keys(nokhbaProductsDB);
  for (var i = 0; i < keys.length; i++) {
    if (key.indexOf(keys[i]) !== -1 || keys[i].indexOf(key) !== -1) {
      return nokhbaProductsDB[keys[i]];
    }
  }
  
  // إذا ما لقى — يرجع مواصفات عامة
  return {
    desc: "منتج أصلي من نُخبة — جودة عالية وسعر مناسب.",
    marketing: "✨ اختيار النخبة — جودة مضمونة وخدمة ممتازة!",
    specs: [
      { label: "النوع", value: "طابعة" },
      { label: "الحالة", value: "جديد" },
      { label: "الأصالة", value: "أصلي 100%" },
      { label: "الضمان", value: "سنة كاملة" }
    ]
  };
}

// ============================================
// نشر المنتج إلى Firestore
// ============================================
async function publishProduct() {
  var name = document.getElementById('dashProductName').value.trim();
  var descInput = document.getElementById('dashProductDesc').value.trim();
  var category = document.getElementById('dashProductCategory').value;
  
  if (!name) {
    alert('اكتب اسم المنتج');
    return;
  }
  
  if (!window.selectedVideoUrl) {
    alert('اختر فيديو أولاً');
    return;
  }
  
  if (!db) {
    alert('Firebase مو متصل');
    return;
  }
  
  var statusDiv = document.getElementById('dashStatus');
  statusDiv.innerHTML = '🎯 NAKHEEB يحلل المنتج...';
  
  try {
    // NAKHEEB يجيب المواصفات حسب الاسم
    var productInfo = nokheebLookup(name);
    
    statusDiv.innerHTML = '📝 NAKHEEB يكتب المواصفات...';
    
    // نجهز الوصف النهائي (وصف + رسالة تسويقية)
    var finalDesc = (descInput || productInfo.desc);
    var marketingMsg = productInfo.marketing;
    
    statusDiv.innerHTML = '📤 NAKHEEB ينشر...';
    
    // نضيف للـ Firestore
    await addDoc(collection(db, "products"), {
      name: name,
      desc: finalDesc,
      marketing: marketingMsg,
      category: category,
      videoUrl: window.selectedVideoUrl,
      videoDuration: window.selectedVideoDuration,
      specs: productInfo.specs,
      images: [],
      createdAt: new Date().toISOString()
    });
    
    statusDiv.innerHTML = '✅ تم النشر بنجاح!';
    showToast('🎉 NAKHEEB نشر المنتج');
    
    // نفرغ الحقول
    document.getElementById('dashProductName').value = '';
    document.getElementById('dashProductDesc').value = '';
    document.getElementById('dashVideoResults').innerHTML = '';
    window.selectedVideoUrl = null;
    
    // نعيد تحميل المنتجات
    setTimeout(function() {
      loadProductsFromFirestore();
      closeModal('dashboardModal');
    }, 1500);
    
  } catch(e) {
    statusDiv.innerHTML = '❌ خطأ: ' + e.message;
  }
}
