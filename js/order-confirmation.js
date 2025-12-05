// =========================
// 📦 ORDER CONFIRMATION MODULE - COMPLETE FIXED
// =========================

import { Utils } from "./config.js";
import { showToast } from "./ui.js";

/**
 * Initialize Order Confirmation Page
 */
export function initOrderConfirmation() {
  console.log("📦 Initializing Order Confirmation...");

  const confirmationContainer = document.querySelector('.order-confirmation');

  if (!confirmationContainer) {
    console.log("ℹ️ Not on order confirmation page");
    return;
  }

  // Show loading state
  confirmationContainer.innerHTML = `
    <div class="confirmation-loading">
      <div class="loading-spinner"></div>
      <p>Memuat data pesanan...</p>
    </div>
  `;

  // Get order data with small delay to ensure localStorage is ready
  setTimeout(() => {
    const orderData = getOrderData();

    if (!orderData || !orderData.orderId) {
      console.warn("⚠️ No order data found");
      renderErrorState(confirmationContainer);
      return;
    }

    console.log("✅ Order data found:", orderData);
    renderOrderConfirmation(confirmationContainer, orderData);

    // Clear cart after showing confirmation
    clearCart();

    showToast('🎉 Pesanan berhasil dibuat!', 'success');
  }, 500);
}

/**
 * Get order data from localStorage
 */
function getOrderData() {
  try {
    const orderData = Utils.loadFromStorage('qianlunshop_last_order', null);

    if (!orderData) {
      console.warn("⚠️ No order data in localStorage");
      return null;
    }

    console.log("📦 Raw order data:", orderData);

    // Mark as viewed
    if (!orderData.viewed) {
      orderData.viewed = true;
      orderData.viewedAt = Date.now();
      Utils.saveToStorage('qianlunshop_last_order', orderData);
    }

    // Save to order history
    saveToOrderHistory(orderData);

    return orderData;
  } catch (error) {
    console.error("❌ Error loading order data:", error);
    return null;
  }
}

/**
 * Save order to history
 */
function saveToOrderHistory(orderData) {
  try {
    const orders = Utils.loadFromStorage('qianlunshop_orders', []);

    const exists = orders.some(order => order.orderId === orderData.orderId);

    if (!exists) {
      orders.push({
        ...orderData,
        savedAt: Date.now()
      });

      Utils.saveToStorage('qianlunshop_orders', orders);
      console.log("💾 Order saved to history");
    }
  } catch (error) {
    console.error("❌ Error saving to history:", error);
  }
}

/**
 * Clear cart after successful order
 */
function clearCart() {
  try {
    localStorage.removeItem('qianlunshop_cart');
    console.log("🗑️ Cart cleared");
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
  }
}

/**
 * Render order confirmation UI
 */
function renderOrderConfirmation(container, orderData) {
  const confirmationHTML = `
    <div class="confirmation-icon" role="img" aria-label="Success">✓</div>

    <h2>Pesanan Anda Telah Berhasil Dikonfirmasi!</h2>

    <p class="order-id">
      <strong>ID Pesanan:</strong> ${orderData.orderId}
    </p>

    <p class="confirmation-message">
      Terima kasih telah berbelanja di QianlunShop. Kami telah mengirimkan detail
      pesanan lengkap ke alamat email <strong>${orderData.customerEmail}</strong>.
      Harap tunggu informasi pengiriman.
    </p>

    <div class="confirmation-details">
      <div class="detail-item">
        <strong>Tanggal Pesanan:</strong>
        <span>${orderData.date || formatDate(new Date())}</span>
      </div>

      <div class="detail-item">
        <strong>Metode Pembayaran:</strong>
        <span>${orderData.paymentMethod || 'N/A'}</span>
      </div>

      <div class="detail-item">
        <strong>Alamat Pengiriman:</strong>
        <span>${orderData.shippingAddress || 'N/A'}</span>
      </div>

      <div class="detail-item">
        <strong>Total Pembayaran:</strong>
        <span class="total-amount">${Utils.formatPrice(orderData.total)}</span>
      </div>
    </div>

    ${orderData.items && orderData.items.length > 0 ? `
      <div class="order-items-summary">
        <h3>Produk yang Dibeli (${orderData.items.length} item)</h3>
        <div class="items-list">
          ${renderOrderItems(orderData.items)}
        </div>
      </div>
    ` : ''}

    <div class="confirmation-actions">
      <a href="../index.html" class="btn btn-primary">🏠 Kembali ke Beranda</a>
      <a href="products.html" class="btn btn-secondary">🛍️ Belanja Lagi</a>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Cetak Invoice</button>
    </div>

    <div class="order-tracking-info">
      <p>📦 <strong>Lacak Pesanan Anda</strong></p>
      <p>Gunakan ID pesanan <code>${orderData.orderId}</code> untuk melacak status pengiriman</p>
    </div>
  `;

  container.innerHTML = confirmationHTML;

  addPrintStyles();
}

/**
 * Render order items list
 */
function renderOrderItems(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return '<p class="no-items">Tidak ada item dalam pesanan</p>';
  }

  console.log("🛍️ Rendering items:", items);

  return items.map((item, index) => {
    const itemName = item.name || 'Produk Tanpa Nama';
    const itemPrice = item.price || 0;
    const itemQty = item.quantity || 1;
    const itemImage = item.image || '../assets/placeholder.jpg';
    const itemSubtotal = itemPrice * itemQty;

    return `
      <div class="order-item" data-index="${index}">
        <img src="${itemImage}" alt="${itemName}" onerror="this.src='../assets/placeholder.jpg'">
        <div class="item-details">
          <h4>${itemName}</h4>
          <p>Jumlah: ${itemQty} × ${Utils.formatPrice(itemPrice)}</p>
        </div>
        <div class="item-subtotal">
          ${Utils.formatPrice(itemSubtotal)}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render error state
 */
function renderErrorState(container) {
  container.innerHTML = `
    <div class="confirmation-icon error-icon" role="img" aria-label="Error">❌</div>

    <h2>Oops! Data Pesanan Tidak Ditemukan</h2>

    <p class="error-message">
      Maaf, kami tidak dapat menemukan data pesanan Anda.
      Kemungkinan sesi telah berakhir atau terjadi kesalahan.
    </p>

    <div class="confirmation-actions">
      <a href="../index.html" class="btn btn-primary">🏠 Kembali ke Beranda</a>
      <a href="products.html" class="btn btn-secondary">🛍️ Mulai Belanja</a>
      <a href="contact.html" class="btn btn-outline">📞 Hubungi Kami</a>
    </div>

    <div class="help-info">
      <p>💡 <strong>Butuh Bantuan?</strong></p>
      <p>Hubungi kami di <a href="mailto:hello@qianlunshop.com">hello@qianlunshop.com</a></p>
      <p>atau WhatsApp: <a href="https://wa.me/6281234567890">+62 812-3456-7890</a></p>
    </div>
  `;
}

/**
 * Format date helper
 */
function formatDate(date) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error("❌ Date format error:", error);
    return date.toLocaleDateString('id-ID');
  }
}

/**
 * Add print styles
 */
function addPrintStyles() {
  if (document.getElementById('print-styles')) return;

  const style = document.createElement('style');
  style.id = 'print-styles';
  style.textContent = `
    @media print {
      body * {
        visibility: hidden;
      }

      .order-confirmation,
      .order-confirmation * {
        visibility: visible;
      }

      .order-confirmation {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }

      .confirmation-actions,
      .navbar,
      footer {
        display: none !important;
      }

      .confirmation-icon {
        font-size: 3rem;
      }

      @page {
        margin: 2cm;
      }
    }
  `;

  document.head.appendChild(style);
}

// =========================
// 🎯 DEBUG HELPER
// =========================
export function debugOrderConfirmation() {
  console.log("=== ORDER CONFIRMATION DEBUG ===");

  const orderData = Utils.loadFromStorage('qianlunshop_last_order', null);
  const orderHistory = Utils.loadFromStorage('qianlunshop_orders', []);
  const cart = Utils.loadFromStorage('qianlunshop_cart', []);

  const debugInfo = {
    'Last Order Exists': orderData ? '✅ YES' : '❌ NO',
    'Order ID': orderData?.orderId || 'N/A',
    'Order Date': orderData?.date || 'N/A',
    'Total': orderData?.total ? Utils.formatPrice(orderData.total) : 'N/A',
    'Email': orderData?.customerEmail || 'N/A',
    'Items Count': orderData?.items?.length || 0,
    'History Count': orderHistory.length,
    'Cart Items': cart.length
  };

  console.table(debugInfo);
  console.log("\n📦 Full Order Data:");
  console.log(orderData);
  console.log("\n📜 Order History:");
  console.log(orderHistory);
  console.log("\n🛒 Current Cart:");
  console.log(cart);
  console.log("================================");

  return { orderData, orderHistory, cart };
}

// Make debug globally accessible
if (typeof window !== 'undefined') {
  window.debugOrderConfirmation = debugOrderConfirmation;
}

console.log("✅ Order Confirmation module loaded");
