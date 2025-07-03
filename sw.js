// 🚀 Service Worker مبسط للمساعد الذكي
const CACHE_NAME = 'ai-assistant-v1.0';
const BASE_URL = '/pixelAi/';

// ملفات أساسية للتخزين المؤقت
const CACHE_URLS = [
  BASE_URL,
  BASE_URL + 'index.html',
  BASE_URL + 'manifest.json'
];

// صفحة أوفلاين بسيطة
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>المساعد الذكي - غير متصل</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            padding: 2rem;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 3rem;
            max-width: 400px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        p { font-size: 1.1rem; margin-bottom: 1.5rem; line-height: 1.6; }
        .btn {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 1rem;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        .btn:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 المساعد الذكي</h1>
        <p>⚠️ لا يوجد اتصال بالإنترنت</p>
        <p>يرجى التحقق من الاتصال والمحاولة مرة أخرى</p>
        <button class="btn" onclick="location.reload()">🔄 إعادة تحميل</button>
    </div>
</body>
</html>
`;

// 🔧 تثبيت Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: تثبيت...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 فتح الكاش:', CACHE_NAME);
                
                // تخزين صفحة أوفلاين
                cache.put(BASE_URL + 'offline.html', new Response(OFFLINE_HTML, {
                    headers: { 'Content-Type': 'text/html' }
                }));
                
                // تخزين الملفات الأساسية (مع تجاهل الأخطاء)
                return Promise.allSettled(
                    CACHE_URLS.map(url => cache.add(url))
                );
            })
            .then(() => {
                console.log('✅ Service Worker: تم التثبيت بنجاح');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.warn('⚠️ خطأ في تثبيت Service Worker:', error);
            })
    );
});

// 🔄 تفعيل Service Worker
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: تفعيل...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ حذف كاش قديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: تم التفعيل');
            return self.clients.claim();
        })
    );
});

// 🌐 اعتراض الطلبات
self.addEventListener('fetch', (event) => {
    // تجاهل الطلبات غير المدعومة
    if (event.request.method !== 'GET' || 
        event.request.url.startsWith('chrome-extension:') || 
        event.request.url.includes('openai.com') ||
        event.request.url.includes('api.')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request)
                    .then((response) => {
                        // تخزين الردود الناجحة
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // إذا فشل كل شيء، إرجاع صفحة أوفلاين
                        if (event.request.mode === 'navigate') {
                            return caches.match(BASE_URL + 'offline.html');
                        }
                        return new Response('غير متصل', { status: 503 });
                    });
            })
    );
});

// 📱 التعامل مع رسائل من التطبيق
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🚀 Service Worker جاهز للمساعد الذكي!');
