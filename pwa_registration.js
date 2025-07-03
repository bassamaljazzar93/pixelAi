// 🚀 تسجيل PWA وService Worker محسن للمساعد الذكي
// ضع هذا الكود في نهاية الـ <script> في index.html

// ========= إعدادات PWA =========
let deferredPrompt = null;
let isStandalone = false;

// فحص إذا كان التطبيق مثبت كـ PWA
function checkStandaloneMode() {
    isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone || 
                   document.referrer.includes('android-app://');
    
    if (isStandalone) {
        console.log('🎯 التطبيق يعمل كـ PWA');
        document.getElementById('installBtn').style.display = 'none';
        
        // إضافة كلاس للتصميم المخصص للـ PWA
        document.body.classList.add('pwa-mode');
        
        // إخفاء شريط العنوان إذا كان موجود
        const addressBar = document.querySelector('.address-bar');
        if (addressBar) addressBar.style.display = 'none';
    }
}

// ========= تسجيل Service Worker =========
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            console.log('🔧 جاري تسجيل Service Worker...');
            
            const registration = await navigator.serviceWorker.register('/pixelAi/sw.js', {
                scope: '/pixelAi/'
            });
            
            console.log('✅ Service Worker مسجل بنجاح:', registration.scope);
            
            // التحقق من التحديثات
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('🔄 Service Worker جديد متاح');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
            
            // إشعار عند تفعيل Service Worker
            if (registration.active) {
                console.log('✅ Service Worker نشط');
                showToast('🚀 التطبيق جاهز للعمل بدون انترنت!', 'success');
            }
            
            // تسجيل للحصول على إشعارات التحديث
            await registration.update();
            
        } catch (error) {
            console.error('❌ فشل تسجيل Service Worker:', error);
            // لا نعرض خطأ للمستخدم لأن PWA اختياري
        }
    } else {
        console.log('ℹ️ Service Worker غير مدعوم في هذا المتصفح');
    }
}

// ========= إدارة تثبيت PWA =========
function setupPWAInstallation() {
    // الاستماع لحدث beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('📱 PWA قابل للتثبيت');
        
        // منع الإشعار التلقائي
        e.preventDefault();
        
        // حفظ الحدث للاستخدام لاحقاً
        deferredPrompt = e;
        
        // إظهار زر التثبيت
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.classList.add('pulse-animation');
        }
        
        // إشعار المستخدم
        showToast('📱 يمكنك الآن تثبيت التطبيق!', 'info');
    });
    
    // الاستماع لحدث التثبيت
    window.addEventListener('appinstalled', (evt) => {
        console.log('🎉 PWA تم تثبيته بنجاح');
        showToast('🎉 تم تثبيت التطبيق بنجاح!', 'success');
        
        // إخفاء زر التثبيت
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        
        // إرسال إحصائية (اختياري)
        trackPWAInstall();
    });
}

// ========= تثبيت PWA =========
async function installPWA() {
    if (!deferredPrompt) {
        // إذا لم يكن هناك prompt، نحاول الطرق البديلة
        showInstallInstructions();
        return;
    }
    
    try {
        // إظهار نافذة التثبيت
        deferredPrompt.prompt();
        
        // انتظار رد المستخدم
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
            console.log('✅ المستخدم قبل تثبيت PWA');
            showToast('🎉 جاري تثبيت التطبيق...', 'success');
        } else {
            console.log('❌ المستخدم رفض تثبيت PWA');
            showToast('💡 يمكنك تثبيت التطبيق لاحقاً', 'info');
        }
        
        // إعادة تعيين المتغير
        deferredPrompt = null;
        
    } catch (error) {
        console.error('❌ خطأ في تثبيت PWA:', error);
        showInstallInstructions();
    }
}

// ========= تعليمات التثبيت اليدوي =========
function showInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
        instructions = `
            <div style="text-align: right; line-height: 1.6;">
                <strong>📱 تثبيت التطبيق على iOS:</strong><br>
                1. اضغط على زر المشاركة في Safari<br>
                2. اختر "إضافة إلى الشاشة الرئيسية"<br>
                3. اضغط "إضافة" للتأكيد
            </div>
        `;
    } else if (isAndroid) {
        instructions = `
            <div style="text-align: right; line-height: 1.6;">
                <strong>📱 تثبيت التطبيق على Android:</strong><br>
                1. اضغط على ⋮ في متصفح Chrome<br>
                2. اختر "إضافة إلى الشاشة الرئيسية"<br>
                3. اضغط "إضافة" للتأكيد
            </div>
        `;
    } else {
        instructions = `
            <div style="text-align: right; line-height: 1.6;">
                <strong>💻 تثبيت التطبيق:</strong><br>
                1. اضغط على أيقونة التثبيت في شريط العناوين<br>
                2. أو اضغط Ctrl+Shift+A في Chrome<br>
                3. اختر "تثبيت المساعد الذكي"
            </div>
        `;
    }
    
    // إظهار النافذة المنبثقة
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000; padding: 1rem;
        ">
            <div style="
                background: white; border-radius: 15px; padding: 2rem;
                max-width: 400px; width: 100%; text-align: center;
            ">
                <h3 style="margin-bottom: 1rem; color: #333;">📱 تثبيت التطبيق</h3>
                ${instructions}
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #4F46E5; color: white; border: none;
                    padding: 10px 20px; border-radius: 10px; cursor: pointer;
                    margin-top: 1rem; font-weight: bold;
                ">حسناً</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========= إشعار التحديث =========
function showUpdateNotification() {
    const updateNotification = document.createElement('div');
    updateNotification.innerHTML = `
        <div style="
            position: fixed; bottom: 20px; right: 20px; left: 20px;
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white; padding: 1rem; border-radius: 15px;
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
            z-index: 10000; animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="flex: 1;">
                    <strong>🔄 تحديث متاح!</strong><br>
                    <small>إصدار جديد من التطبيق متاح الآن</small>
                </div>
                <button onclick="updateApp()" style="
                    background: white; color: #4F46E5; border: none;
                    padding: 8px 16px; border-radius: 8px; cursor: pointer;
                    font-weight: bold; font-size: 0.9rem;
                ">تحديث</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2); color: white; border: none;
                    padding: 8px 16px; border-radius: 8px; cursor: pointer;
                    font-size: 0.9rem;
                ">لاحقاً</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(updateNotification);
    
    // إزالة الإشعار تلقائياً بعد 10 ثوانٍ
    setTimeout(() => {
        if (updateNotification.parentElement) {
            updateNotification.remove();
        }
    }, 10000);
}

// ========= تحديث التطبيق =========
async function updateApp() {
    try {
        const registration = await navigator.serviceWorker.getRegistration('/pixelAi/');
        
        if (registration && registration.waiting) {
            // إخبار Service Worker الجديد بالتفعيل
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            showToast('🔄 جاري تحديث التطبيق...', 'info');
            
            // إعادة تحميل الصفحة بعد التحديث
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            // إجبار تحديث التسجيل
            await registration.update();
            window.location.reload();
        }
    } catch (error) {
        console.error('❌ خطأ في تحديث التطبيق:', error);
        showToast('❌ خطأ في التحديث - سيتم إعادة التحميل', 'error');
        setTimeout(() => window.location.reload(), 2000);
    }
}

// ========= تتبع الإحصائيات =========
function trackPWAInstall() {
    // يمكنك إضافة كود تتبع الإحصائيات هنا
    console.log('📊 PWA تم تثبيته - إحصائية');
    
    // مثال: Google Analytics
    // gtag('event', 'pwa_install', { 'app_name': 'المساعد الذكي' });
}

// ========= إدارة الاتصال =========
function setupNetworkMonitoring() {
    // مراقبة حالة الاتصال
    window.addEventListener('online', () => {
        console.log('🌐 عاد الاتصال بالإنترنت');
        showToast('🌐 تم استعادة الاتصال!', 'success');
        
        // إعادة تحميل المحتوى إذا لزم الأمر
        if (currentTab === 'news') {
            loadNews('all');
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 انقطع الاتصال بالإنترنت');
        showToast('📴 وضع عدم الاتصال - بعض الميزات محدودة', 'warning');
    });
}

// ========= تحسين الأداء =========
function optimizeForPWA() {
    // تحسين التمرير على الهاتف
    document.body.style.overscrollBehavior = 'none';
    
    // منع التكبير على الهاتف
    document.head.insertAdjacentHTML('beforeend', `
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    `);
    
    // تحسين الأداء
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // مهام أقل أولوية
            preloadCriticalResources();
        });
    }
}

// ========= تحميل الموارد المهمة مسبقاً =========
function preloadCriticalResources() {
    const criticalResources = [
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        'https://api.openai.com/v1/models', // للتحقق من الاتصال
    ];
    
    criticalResources.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    });
}

// ========= تهيئة PWA =========
function initializePWA() {
    console.log('🚀 تهيئة PWA...');
    
    // تحديث manifest في الكود الموجود
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
        manifestLink.href = '/pixelAi/manifest.json';
    } else {
        // إضافة manifest إذا لم يكن موجود
        const newManifest = document.createElement('link');
        newManifest.rel = 'manifest';
        newManifest.href = '/pixelAi/manifest.json';
        document.head.appendChild(newManifest);
    }
    
    // تسجيل Service Worker
    registerServiceWorker();
    
    // إعداد تثبيت PWA
    setupPWAInstallation();
    
    // فحص وضع PWA
    checkStandaloneMode();
    
    // مراقبة الشبكة
    setupNetworkMonitoring();
    
    // تحسين الأداء
    optimizeForPWA();
    
    console.log('✅ PWA جاهز!');
}

// ========= تشغيل PWA عند تحميل الصفحة =========
// أضف هذا في نهاية الكود الموجود في DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // الكود الموجود...
    
    // تهيئة PWA
    initializePWA();
    
    // إضافة أنماط CSS للـ PWA
    const pwaStyles = `
        <style>
            .pwa-mode .header {
                padding-top: env(safe-area-inset-top);
            }
            
            .pulse-animation {
                animation: pulsePWA 2s infinite;
            }
            
            @keyframes pulsePWA {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .install-btn {
                position: fixed;
                top: 20px;
                left: 20px;
                background: linear-gradient(135deg, #4F46E5, #7C3AED);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.9rem;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
                transition: all 0.3s ease;
                display: none;
            }
            
            .install-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
            }
            
            @media (max-width: 768px) {
                .install-btn {
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    left: 20px;
                    top: auto;
                    border-radius: 15px;
                    padding: 15px;
                    font-size: 1rem;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', pwaStyles);
});

// ========= إضافة الأزرار المطلوبة =========
// تأكد من وجود زر التثبيت في HTML
if (!document.getElementById('installBtn')) {
    const installBtn = document.createElement('button');
    installBtn.id = 'installBtn';
    installBtn.className = 'install-btn';
    installBtn.innerHTML = '📱 تثبيت التطبيق';
    installBtn.onclick = installPWA;
    document.body.appendChild(installBtn);
}

// ========= إضافة إلى window للاستخدام العام =========
window.installPWA = installPWA;
window.updateApp = updateApp;

console.log('🎯 PWA Scripts جاهزة للمساعد الذكي!');