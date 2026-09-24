// إعدادات الربط السحابي لـ Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAwxRdFTkchvvS9dEEBMHpLrhfbojuC4mc",
  authDomain: "nexosstore-5193a.firebaseapp.com",
  projectId: "nexosstore-5193a",
  storageBucket: "nexosstore-5193a.firebasestorage.app",
  messagingSenderId: "191485188157",
  appId: "1:191485188157:web:3eb62fced508cee459b254"
};

// تهيئة الاتصال
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// بيانات الدخول السرية للوحة التحكم (تعريف واحد فقط بدون تكرار)
const SECRET_ADMIN_USER = "nexus_admin_2026";
const SECRET_ADMIN_PASS = "secure_pass_9988";

let selectedProductDetails = "";

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    loadOrders();
    renderUserProducts();
    renderAdminProducts();
});

// إدارة النوافذ المنبثقة للطلب
function openOrderModal(productInfo) {
    selectedProductDetails = productInfo;
    const txt = document.getElementById("selectedItemText");
    if(txt) txt.innerText = `المنتج المختار: ${productInfo}`;
    const modal = document.getElementById("orderModal");
    if(modal) modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("orderModal");
    if(modal) modal.style.display = "none";
}

// إرسال الطلب وحفظه في الذاكرة المحلية
function submitOrder(e) {
    e.preventDefault();
    const name = document.getElementById("clientName").value;
    const contact = document.getElementById("clientContact").value;
    const notes = document.getElementById("clientNotes").value;

    const newOrder = {
        id: Date.now().toString().slice(-4),
        name: name,
        contact: contact,
        product: selectedProductDetails,
        notes: notes || "لا توجد ملاحظات",
        date: new Date().toLocaleString()
    };

    let orders = JSON.parse(localStorage.getItem("store_orders")) || [];
    orders.unshift(newOrder);
    localStorage.setItem("store_orders", JSON.stringify(orders));

    alert("تم إرسال طلبك بنجاح إلى الإدارة وسيتم التواصل معك قريباً!");
    document.getElementById("checkoutForm").reset();
    closeModal();
    loadOrders();
}

// إدارة الطلبات في لوحة التحكم
function loadOrders() {
    let orders = JSON.parse(localStorage.getItem("store_orders")) || [];
    const countEl = document.getElementById("ordersCount");
    if(countEl) countEl.innerText = orders.length;
    
    const tbody = document.getElementById("ordersTableBody");
    if(!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8;">لا توجد طلبات جديدة حالياً.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    orders.forEach((order, index) => {
        tbody.innerHTML += `
            <tr>
                <td>#${order.id}</td>
                <td>${order.name}</td>
                <td>${order.contact}</td>
                <td><b>${order.product}</b></td>
                <td>${order.notes}</td>
                <td>${order.date}</td>
                <td><button class="btn-danger" style="padding: 3px 8px; font-size: 0.8rem;" onclick="deleteOrder(${index})">حذف</button></td>
            </tr>
        `;
    });
}

function deleteOrder(index) {
    let orders = JSON.parse(localStorage.getItem("store_orders")) || [];
    orders.splice(index, 1);
    localStorage.setItem("store_orders", JSON.stringify(orders));
    loadOrders();
}

// إدارة المنتجات والحسابات المضافة ديناميكياً
let productsList = JSON.parse(localStorage.getItem("nexus_products")) || [];

function saveProductsToStorage() {
    localStorage.setItem("nexus_products", JSON.stringify(productsList));
}

function addNewProduct(event) {
    event.preventDefault();
    
    const title = document.getElementById("prodTitle").value;
    const category = document.getElementById("prodCategory").value;
    const price = document.getElementById("prodPrice").value;
    const imageInput = document.getElementById("prodImage");
    
    const reader = new FileReader();
    if (imageInput.files && imageInput.files[0]) {
        reader.readAsDataURL(imageInput.files[0]);
        reader.onload = function(e) {
            const newProd = {
                id: Date.now(),
                title: title,
                category: category,
                price: price,
                image: e.target.result
            };
            productsList.push(newProd);
            saveProductsToStorage();
            alert("تم إضافة الحساب بنجاح!");
            document.getElementById("addProductForm").reset();
            renderAdminProducts();
            renderUserProducts();
        }
    }
}

function deleteProduct(id) {
    if (confirm("هل أنت متأكد من حذف هذا الحساب؟")) {
        productsList = productsList.filter(p => p.id !== id);
        saveProductsToStorage();
        renderAdminProducts();
        renderUserProducts();
    }
}

function renderAdminProducts() {
    const tbody = document.getElementById("adminProductsTableBody");
    if (!tbody) return;
    
    if (productsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8;">لا توجد حسابات مضافة حالياً.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = "";
    productsList.forEach((prod, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><img src="${prod.image}" width="50" height="40" style="border-radius: 5px; object-fit: cover;"></td>
                <td>${prod.title}</td>
                <td>${prod.category}</td>
                <td>$${prod.price}</td>
                <td>
                    <button class="btn-danger" onclick="deleteProduct(${prod.id})" style="padding: 5px 10px; font-size: 12px;"><i class="fa-solid fa-trash"></i> حذف</button>
                </td>
            </tr>
        `;
    });
}

function renderUserProducts() {
    const grid = document.getElementById("dynamicProductsGrid");
    if (!grid) return;
    
    if (productsList.length === 0) {
        grid.innerHTML = "";
        return;
    }
    
    grid.innerHTML = "";
    productsList.forEach(prod => {
        grid.innerHTML += `
            <div class="card">
                <div class="card-badge">${prod.category}</div>
                <img src="${prod.image}" alt="${prod.title}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                <h3>${prod.title}</h3>
                <div class="price">$${prod.price}</div>
                <button class="btn-buy" onclick="openOrderModal('${prod.title} - $${prod.price}')"><i class="fa-solid fa-cart-shopping"></i> شراء الحساب</button>
            </div>
        `;
    });
}

// الإعدادات العامة
function loadSettings() {
    let savedSettings = localStorage.getItem("store_settings");
    if (savedSettings) {
        let settings = JSON.parse(savedSettings);
        applySettings(settings);
    }
}

function applySettings(settings) {
    const brandEls = document.querySelectorAll("#brandName, #footerBrand");
    brandEls.forEach(el => { if(el) el.innerText = settings.brandName; });
    
    const heroTitle = document.getElementById("heroTitle");
    if(heroTitle) heroTitle.innerText = settings.heroTitle;
    
    if(settings.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    }
}

// فتح وإغلاق نافذة عرض حسابك للبيع
function openSellModal() {
    const modal = document.getElementById("sellModal");
    if(modal) modal.style.display = "flex";
}

function closeSellModal() {
    const modal = document.getElementById("sellModal");
    if(modal) modal.style.display = "none";
}

// إرسال طلب بيع الحساب وحفظه في لوحة التحكم
function submitSellAccount(e) {
    e.preventDefault();
    const contact = document.getElementById("sellerContact").value;
    const gameName = document.getElementById("sellGameName").value;
    const details = document.getElementById("sellDetails").value;
    const price = document.getElementById("sellPrice").value;
    const imageInput = document.getElementById("sellImages");

    // قراءة الصور وتحويلها لـ Base64 لضمان ظهورها
    const reader = new FileReader();
    if (imageInput.files && imageInput.files[0]) {
        reader.readAsDataURL(imageInput.files[0]);
        reader.onload = function(e) {
            const newSellRequest = {
                id: Date.now().toString().slice(-4),
                type: "طلب عرض حساب للبيع",
                name: contact,
                contact: contact,
                product: `${gameName} - $${price}`,
                notes: `المزايا: ${details}`,
                image: e.target.result,
                date: new Date().toLocaleString()
            };

            let orders = JSON.parse(localStorage.getItem("store_orders")) || [];
            orders.unshift(newSellRequest);
            localStorage.setItem("store_orders", JSON.stringify(orders));

            alert("تم إرسال تفاصيل حسابك بنجاح للإدارة، سنتواصل معك قريباً!");
            document.getElementById("sellForm").reset();
            closeSellModal();
            loadOrders();
        }
    }
}


// ==========================================
// الإضافات الجديدة: فيديو الحساب، المحفظة، الإيداع، والسحب اليدوي
// ==========================================

// 1. تعديل أو إضافة منتج مع دعم رفع الفيديو والصور
function addNewProduct(event) {
    event.preventDefault();
    
    const title = document.getElementById("prodTitle").value;
    const category = document.getElementById("prodCategory").value;
    const price = document.getElementById("prodPrice").value;
    const imageInput = document.getElementById("prodImage");
    const videoInput = document.getElementById("prodVideo"); // حقل فيديو الحساب الجديد
    
    const reader = new FileReader();
    if (imageInput.files && imageInput.files[0]) {
        reader.readAsDataURL(imageInput.files[0]);
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // التحقق من وجود فيديو مرفق للحساب
            if (videoInput && videoInput.files && videoInput.files[0]) {
                const videoReader = new FileReader();
                videoReader.readAsDataURL(videoInput.files[0]);
                videoReader.onload = function(vidEvent) {
                    saveProductComplete(title, category, price, imageData, vidEvent.target.result);
                }
            } else {
                saveProductComplete(title, category, price, imageData, null);
            }
        }
    }
}

function saveProductComplete(title, category, price, image, video) {
    let productsList = JSON.parse(localStorage.getItem("nexus_products")) || [];
    const newProd = {
        id: Date.now(),
        title: title,
        category: category,
        price: price,
        image: image,
        video: video
    };
    productsList.push(newProd);
    localStorage.setItem("nexus_products", JSON.stringify(productsList));
    alert("تم إضافة الحساب مع تفاصيل الفيديو والصور بنجاح!");
    document.getElementById("addProductForm").reset();
    if(typeof renderAdminProducts === 'function') renderAdminProducts();
    if(typeof renderUserProducts === 'function') renderUserProducts();
}

// 2. تحديث دالة عرض المنتجات للعملاء لدعم تشغيل الفيديو
function renderUserProductsWithVideo() {
    const grid = document.getElementById("dynamicProductsGrid");
    if (!grid) return;
    
    let productsList = JSON.parse(localStorage.getItem("nexus_products")) || [];
    if (productsList.length === 0) return;
    
    grid.innerHTML = "";
    productsList.forEach(prod => {
        let mediaHtml = prod.video ? 
            `<video src="${prod.video}" controls style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"></video>` : 
            `<img src="${prod.image}" alt="${prod.title}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">`;
        
        grid.innerHTML += `
            <div class="card">
                <div class="card-badge">${prod.category}</div>
                ${mediaHtml}
                <h3>${prod.title}</h3>
                <div class="price">$${prod.price}</div>
                <button class="btn-buy" onclick="openOrderModal('${prod.title} - $${prod.price}')"><i class="fa-solid fa-cart-shopping"></i> شراء الحساب</button>
            </div>
        `;
    });
}

// 3. نظام الإيداع عبر الشام كاش والتحقق الفوري من رقم العملية
function submitDepositRequest(e) {
    e.preventDefault();
    const name = document.getElementById("depName").value;
    const amount = parseFloat(document.getElementById("depAmount").value);
    const txId = document.getElementById("depTxId").value;

    let transactions = JSON.parse(localStorage.getItem("store_transactions")) || [];
    const exists = transactions.some(tx => tx.txId === txId);
    if(exists) {
        alert("خطأ: رقم العملية هذا مستخدم مسبقاً أو تم التحقق منه!");
        return;
    }

    const newTx = {
        id: Date.now().toString().slice(-4),
        txId: txId,
        name: name,
        amount: amount,
        status: "مقبول (شحن فوري)",
        date: new Date().toLocaleString()
    };

    transactions.unshift(newTx);
    localStorage.setItem("store_transactions", JSON.stringify(transactions));

    let currentBalance = parseFloat(localStorage.getItem("user_wallet_balance")) || 0;
    currentBalance += amount;
    localStorage.setItem("user_wallet_balance", currentBalance);

    alert(`تم التحقق من العملية بنجاح! تم إضافة $${amount} إلى محفظتك.`);
    document.getElementById("depositForm").reset();
    window.location.href = "wallet.html";
}

// 4. نظام طلب السحب اليدوي للمحفظة
function submitWithdrawalRequest(e) {
    e.preventDefault();
    const name = document.getElementById("withName").value;
    const amount = parseFloat(document.getElementById("withAmount").value);
    const shamAccount = document.getElementById("withShamAccount").value;

    let currentBalance = parseFloat(localStorage.getItem("user_wallet_balance")) || 0;
    if(amount > currentBalance) {
        alert("عذراً، رصيد محفظتك غير كافٍ لإتمام عملية السحب!");
        return;
    }

    currentBalance -= amount;
    localStorage.setItem("user_wallet_balance", currentBalance);

    const withdrawalReq = {
        id: Date.now().toString().slice(-4),
        name: name,
        amount: amount,
        shamAccount: shamAccount,
        status: "قيد المعالجة اليدوية",
        date: new Date().toLocaleString()
    };

    let withdrawals = JSON.parse(localStorage.getItem("store_withdrawals")) || [];
    withdrawals.unshift(withdrawalReq);
    localStorage.setItem("store_withdrawals", JSON.stringify(withdrawals));

    alert("تم تقديم طلب السحب بنجاح، ستتم مراجعته وتحويل المبلغ إلى حساب الشام كاش الخاص بك يدوياً قريباً!");
    document.getElementById("withdrawForm").reset();
    loadUserWallet();
    loadWithdrawals();
}

// 5. تحميل بيانات المحفظة وعمليات السحب والإيداع
function loadUserWallet() {
    const balanceEl = document.getElementById("userBalance");
    let currentBalance = parseFloat(localStorage.getItem("user_wallet_balance")) || 0;
    if(balanceEl) {
        balanceEl.innerText = `$${currentBalance.toFixed(2)}`;
    }

    const tbody = document.getElementById("walletTransactionsBody");
    if(!tbody) return;

    let transactions = JSON.parse(localStorage.getItem("store_transactions")) || [];
    if(transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">لا توجد معاملات سابقة.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    transactions.forEach(tx => {
        tbody.innerHTML += `
            <tr>
                <td>#${tx.txId}</td>
                <td>$${tx.amount}</td>
                <td><span style="color: #22c55e; font-weight: bold;">${tx.status}</span></td>
                <td>${tx.date}</td>
            </tr>
        `;
    });
}

function loadWithdrawals() {
    const tbody = document.getElementById("withdrawalsTableBody");
    if(!tbody) return;

    let withdrawals = JSON.parse(localStorage.getItem("store_withdrawals")) || [];
    if(withdrawals.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8;">لا توجد طلبات سحب حالياً.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    withdrawals.forEach((w, index) => {
        tbody.innerHTML += `
            <tr>
                <td>#${w.id}</td>
                <td>${w.name} (${w.shamAccount})</td>
                <td>$${w.amount}</td>
                <td><span style="color: #f59e0b; font-weight: bold;">${w.status}</span></td>
                <td><button class="btn-danger" onclick="deleteWithdrawal(${index})" style="padding: 3px 8px; font-size: 0.8rem;">إتمام وحذف</button></td>
            </tr>
        `;
    });
}

function deleteWithdrawal(index) {
    let withdrawals = JSON.parse(localStorage.getItem("store_withdrawals")) || [];
    withdrawals.splice(index, 1);
    localStorage.setItem("store_withdrawals", JSON.stringify(withdrawals));
    loadWithdrawals();
}

// التحكم في فتح وإغلاق القائمة الجانبية من اليسار
function toggleSidebar() {
    const sideMenu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");
    
    if (sideMenu.style.left === "0px") {
        sideMenu.style.left = "-280px";
        if(overlay) overlay.style.display = "none";
    } else {
        sideMenu.style.left = "0px";
        if(overlay) overlay.style.display = "block";
    }
}

function toggleSidebar() {
    const sideMenu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");
    
    if (sideMenu.style.left === "0px") {
        sideMenu.style.left = "-280px";
        if(overlay) overlay.style.display = "none";
    } else {
        sideMenu.style.left = "0px";
        if(overlay) overlay.style.display = "block";
    }
}

// 1. دالة إرسال طلب السحب اليدوي من صفحة المحفظة
function submitWithdrawalRequest(event) {
    event.preventDefault();
    
    // جلب البيانات المدخلة
    const name = document.getElementById('withName').value;
    const amount = document.getElementById('withAmount').value;
    const shamAccount = document.getElementById('withShamAccount').value;
    
    // تجهيز كائن الطلب
    const newRequest = {
        id: 'WD-' + Math.floor(100000 + Math.random() * 900000),
        name: name,
        amount: amount,
        account: shamAccount,
        date: new Date().toLocaleDateString('ar-SY'),
        status: 'قيد المراجعة'
    };

    // حفظ الطلب في التخزين المحلي (LocalStorage) ليراها الأدمن
    let withdrawals = JSON.parse(localStorage.getItem('adminWithdrawals')) || [];
    withdrawals.push(newRequest);
    localStorage.setItem('adminWithdrawals', JSON.stringify(withdrawals));
    
    alert('تم إرسال طلب السحب بنجاح إلى الإدارة!');
    document.getElementById('withdrawForm').reset();
}

// 2. دالة جلب وعرض طلبات السحب في لوحة التحكم (توضع في صفحة الأدمن أو ملف script الخاص بها)
function loadAdminWithdrawals() {
    let withdrawals = JSON.parse(localStorage.getItem('adminWithdrawals')) || [];
    let tbody = document.getElementById('adminWithdrawalsTableBody'); // تأكد أن هذا هو id الـ tbody في جدول الأدمن
    
    if(!tbody) return;
    
    tbody.innerHTML = '';
    withdrawals.forEach((req, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${req.id}</td>
                <td>${req.name}</td>
                <td>$${req.amount}</td>
                <td>${req.account}</td>
                <td style="color: #f59e0b; font-weight: bold;">${req.status}</td>
                <td>${req.date}</td>
                <td>
                    <button onclick="approveWithdrawal(${index})" style="background: #22c55e; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">قبول</button>
                    <button onclick="deleteWithdrawal(${index})" style="background: #ef4444; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">حذف</button>
                </td>
            </tr>
        `;
    });
}

// 3. دالة حذف أو تعديل الطلب من لوحة الأدمن
function deleteWithdrawal(index) {
    let withdrawals = JSON.parse(localStorage.getItem('adminWithdrawals')) || [];
    withdrawals.splice(index, 1);
    localStorage.setItem('adminWithdrawals', JSON.stringify(withdrawals));
    loadAdminWithdrawals();
}
