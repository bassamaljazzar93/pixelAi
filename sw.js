// 🚀 Service Worker للمساعد الذكي - محسن لـ GitHub Pages
const CACHE_NAME = 'ai-assistant-v1.2';
const BASE_URL = '/pixelAi/';

// ملفات أساسية للتخزين المؤقت
const STATIC_CACHE_URLS = [
  BASE_URL,
  BASE_URL + 'index.html',
  BASE_URL + 'manifest.json',
  // إضافة الأيقونات عند توفرها
  BASE_URL + 'assets/icon-192x192.png',
  BASE_URL + 'assets/icon-512x512.png'
];

// ملفات خارجية مهمة
const EXTERNAL_CACHE_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// صفحة أوفلاين
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>المساعد الذكي - غير متصل</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
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
            max-width: 500px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; line-height: 1.6; }
        .retry-btn {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 15px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
        }
        .features {
            margin-top: 2rem;
            text-align: right;
            color: rgba(255, 255, 255, 0.8);
        }
        .features h3 { margin-bottom: 1rem; color: white; }
        .features ul { list-style: none; }
        .features li { margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 المساعد الذكي</h1>
        <p>⚠️ لا يوجد اتصال بالإنترنت حالياً</p>
        <p>يرجى التحقق من الاتصال والمحاولة مرة أخرى</p>
        
        <button class="retry-btn" onclick="location.reload()">
            🔄 إعادة تحميل
        </button>
        
        <div class="features">
            <h3>✨ الميزات المتاحة عند الاتصال:</h3>
            <ul>
                <li>🎤 محادثة فورية مع GPT-4</li>
                <li>🎨 توليد صور بالذكاء الاصطناعي</li>
                <li>🔍 تحليل الصور</li>
                <li>📰 آخر الأخبار</li>
            </ul>
        </div>
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
                
                // تخزين الملفات الأساسية
                return Promise.all([
                    cache.addAll(STATIC_CACHE_URLS.filter(url => url)).catch(err => {
                        console.warn('⚠️ فشل تخزين بعض الملفات الأساسية:', err);
                    }),
                    
                    // تخزين الملفات الخارجية
                    ...EXTERNAL_CACHE_URLS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn('⚠️ فشل تخزين:', url, err);
                        })
                    ),
                    
                    // تخزين صفحة أوفلاين
                    cache.put('/pixelAi/offline.html', new Response(OFFLINE_PAGE, {
                        headers: { 'Content-Type': 'text/html' }
                    }))
                ]);
            })
            .then(() => {
                console.log('✅ Service Worker: تم التثبيت بنجاح');
                // فرض التفعيل الفوري
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ خطأ في تثبيت Service Worker:', error);
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
            // السيطرة على جميع الصفحات فوراً
            return self.clients.claim();
        })
    );
});

// 🌐 اعتراض الطلبات - استراتيجية محسنة
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // تجاهل الطلبات غير المدعومة
    if (request.method !== 'GET' || 
        url.protocol === 'chrome-extension:' || 
        url.protocol === 'moz-extension:' ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1') {
        return;
    }
    
    // استراتيجية للملفات الأساسية: Cache First
    if (url.pathname.startsWith(BASE_URL) && 
        (url.pathname.endsWith('.html') || 
         url.pathname.endsWith('.js') || 
         url.pathname.endsWith('.css') || 
         url.pathname.endsWith('.png') || 
         url.pathname.endsWith('.jpg') || 
         url.pathname.endsWith('.json'))) {
        
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    // إرجاع من الكاش + تحديث في الخلفية
                    fetch(request).then((response) => {
                        if (response.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, response.clone());
                            });
                        }
                    }).catch(() => {});
                    
                    return cachedResponse;
                }
                
                // إذا لم يكن في الكاش، جلب من الشبكة
                return fetch(request).then((response) => {
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, response.clone());
                        });
                    }
                    return response;
                }).catch(() => {
                    // إذا فشل كل شيء، إرجاع صفحة أوفلاين
                    if (request.mode === 'navigate') {
                        return caches.match('/pixelAi/offline.html');
                    }
                    return new Response('غير متصل', { status: 503 });
                });
            })
        );
    }
    
    // استراتيجية للـ APIs الخارجية: Network First
    else if (url.hostname === 'api.openai.com' || 
             url.hostname === 'api.rss2json.com' ||
             url.hostname === 'cdnjs.cloudflare.com') {
        
        event.respondWith(
            fetch(request).then((response) => {
                // تخزين الردود الناجحة في الكاش
                if (response.status === 200 && request.method === 'GET') {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, response.clone());
                    });
                }
                return response;
            }).catch(() => {
                // إذا فشلت الشبكة، جرب الكاش
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return new Response('API غير متاح', { 
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                });
            })
        );
    }
    
    // باقي الطلبات: Network First مع fallback
    else {
        event.respondWith(
            fetch(request).catch(() => {
                // إذا فشلت الشبكة، جرب الكاش
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    // إذا كان طلب تنقل، إرجاع صفحة أوفلاين
                    if (request.mode === 'navigate') {
                        return caches.match('/pixelAi/offline.html');
                    }
                    
                    return new Response('غير متصل', { status: 503 });
                });
            })
        );
    }
});

// 📱 التعامل مع رسائل من التطبيق
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        caches.open(CACHE_NAME).then((cache) => {
            urls.forEach(url => {
                cache.add(url).catch(err => console.warn('فشل تخزين:', url));
            });
        });
    }
});

// 🔄 تحديث الكاش دورياً (كل 6 ساعات)
self.addEventListener('sync', (event) => {
    if (event.tag === 'cache-update') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return Promise.all(
                    STATIC_CACHE_URLS.map(url => 
                        fetch(url).then(response => {
                            if (response.status === 200) {
                                cache.put(url, response);
                            }
                        }).catch(() => {})
                    )
                );
            })
        );
    }
});

// 📊 إحصائيات الأداء
self.addEventListener('fetch', (event) => {
    const start = Date.now();
    
    event.respondWith(
        fetch(event.request).then((response) => {
            const duration = Date.now() - start;
            console.log(`📊 ${event.request.url} - ${duration}ms`);
            return response;
        }).catch((error) => {
            console.log(`❌ ${event.request.url} - خطأ:`, error);
            throw error;
        })
    );
});

console.log('🚀 Service Worker جاهز للمساعد الذكي!');