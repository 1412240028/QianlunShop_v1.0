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
    initOrderConfirmation();
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
