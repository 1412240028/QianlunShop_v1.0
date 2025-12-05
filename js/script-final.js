// =========================
// 🏪 QIANLUNSHOP - MAIN SCRIPT
// Modular architecture with imported components
// =========================
import { Cart } from "./cart.js";
import { CONFIG, Utils } from "./config.js";
import { showToast, updateCartCount, flyToCart, loadingState, errorDisplay, toastManager } from "./ui.js";
import { initCartPage } from "./cart.js";
import { initProductFilters, initDiscoverMore, initProductAddToCart } from "./products.js";
import { initCheckoutPage } from "./checkout.js";
import { errorHandler } from "./error-handler.js";
import { apiRateLimiter, userActionLimiter, inputSanitizer, Sanitizer } from "./security.js";
import { initOrderConfirmation } from "./order-confirmation.js";

// =========================
// 🎯 Global Cart Instance
// =========================
const cart = new Cart();

// =========================
// 📦 Order Confirmation Page
// =========================
const getOrderData = () => {
  const orderData = Utils.loadFromStorage('qianlunshop_last_order', null);

  if (orderData) {
    // Save to orders history
    const orders = Utils.loadFromStorage('qianlunshop_orders', []);
    orders.push({
      ...orderData,
      timestamp: Date.now()
    });
    Utils.saveToStorage('qianlunshop_orders', orders);

    // JANGAN hapus last_order, set flag "viewed" saja
    orderData.viewed = true;
    Utils.saveToStorage('qianlunshop_last_order', orderData);
  }

  return orderData;
};

const clearCart = () => {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
};

const renderOrderConfirmation = () => {
  const confirmationContainer = document.querySelector('.order-confirmation');

  const orderDetails = getOrderData();

  if (!orderDetails || !orderDetails.orderId) {
    confirmationContainer.innerHTML = `
      <div class="confirmation-icon error-icon" aria-hidden="true">❌</div>
      <h2>Oops! Data Pesanan Tidak Ditemukan.</h2>
      <p>Silakan kembali ke halaman produk untuk memulai pembelian.</p>
      <div class="confirmation-actions">
        <a href="../index.html" class="btn btn-primary">Kembali ke Beranda</a>
      </div>
    `;
    return;
  }

  const confirmationHTML = `
    <div class="confirmation-icon" aria-hidden="true">✓</div>
    <h2>Pesanan Anda Telah Berhasil Dikonfirmasi!</h2>

    <p class="order-id">
      **ID Pesanan:** ${orderDetails.orderId}
    </p>

    <p>
      Terima kasih telah berbelanja di QianlunShop. Kami telah mengirimkan detail pesanan lengkap ke alamat email **${orderDetails.customerEmail}**. Harap tunggu informasi pengiriman.
    </p>

    <div class="confirmation-details">
      <div class="detail-item">
        <strong>Tanggal Pesanan:</strong>
        <span>${orderDetails.date}</span>
      </div>
      <div class="detail-item">
        <strong>Metode Pembayaran:</strong>
        <span>${orderDetails.paymentMethod}</span>
      </div>
      <div class="detail-item">
        <strong>Alamat Pengiriman:</strong>
        <span>${orderDetails.shippingAddress}</span>
      </div>
      <div class="detail-item">
        <strong>Total Pembayaran:</strong>
        <span>${Utils.formatPrice(orderDetails.total)}</span>
      </div>
    </div>

    <div class="confirmation-actions">
      <a href="../index.html" class="btn btn-primary">Kembali ke Beranda</a>
      <a href="/tracking?id=${orderDetails.orderId}" class="btn btn-secondary">Lacak Pesanan</a>
    </div>
  `;

  confirmationContainer.innerHTML = confirmationHTML;

  clearCart();
};

// =========================
// 📱 MOBILE MENU HANDLER
// =========================
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.navbar ul');

  if (!menuBtn || !navLinks) return;

  // Create overlay
  let overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
    document.body.appendChild(overlay);
  }

  // Cleanup function for event listeners
  const cleanup = () => {
    menuBtn.removeEventListener('click', toggleMenu);
    overlay.removeEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(link => {
      link.removeEventListener('click', closeMenu);
    });
    document.removeEventListener('keydown', handleEscape);
  };

  // Store cleanup function globally for page navigation
  window.mobileMenuCleanup = cleanup;

  const toggleMenu = (e) => {
    e.stopPropagation();
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');

    const isActive = navLinks.classList.contains('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
    overlay.style.opacity = isActive ? '1' : '0';
    overlay.style.visibility = isActive ? 'visible' : 'hidden';
  };

  const closeMenu = () => {
    menuBtn.classList.remove('active');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  };

  // Toggle menu
  menuBtn.addEventListener('click', toggleMenu);

  // Close on overlay click
  overlay.addEventListener('click', closeMenu);

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on ESC key
  document.addEventListener('keydown', handleEscape);

  console.log('✅ Mobile menu initialized');
}

// =========================
// 🎯 Initialize All Features
// =========================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 QianlunShop Modular Version Initializing...");

  // Initialize cart count on all pages
  updateCartCount(cart);

  // Initialize all page-specific features
  initMobileMenu(); // ✅ Add mobile menu handler
  initCartPage();
  initProductFilters();
  initDiscoverMore();
  initProductAddToCart();
  initCheckoutPage();

  // Initialize order confirmation only on order-confirmation page
  if (window.location.pathname.includes('order-confirmation.html')) {
    renderOrderConfirmation();
  }

  // Initialize order history only on order-history page
  if (window.location.pathname.includes('order-history.html')) {
    renderOrderHistory();
  }

  // Listen for cart updates from other tabs
  cart.on('cart-synced', () => {
    console.log("🔄 Cart synced across tabs");
    updateCartCount(cart);

    // Re-render cart page if needed
    if (document.querySelector('.cart-container')) {
      initCartPage();
    }
  });

  console.log("✅ QianlunShop Modular Version Ready!");
});

// =========================
// 🎯 Global Exports for Interoperability
// =========================
window.QianlunShop = {
  cart,
  showToast,
  updateCartCount,
  flyToCart,
  Utils,
  CONFIG,
  loadingState,
  errorDisplay,
  toastManager,
  apiRateLimiter,
  userActionLimiter,
  inputSanitizer,
  errorHandler
};
