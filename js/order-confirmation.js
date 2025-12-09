// =========================
// 📦 ORDER CONFIRMATION MODULE - COMPLETE REDESIGNED
// Full order details with receipt-style layout
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
 * Render order confirmation UI - RECEIPT STYLE
 */
function renderOrderConfirmation(container, orderData) {
  const confirmationHTML = `
    <div class="receipt-wrapper" id="receiptContent">
      
      <!-- Success Icon & Header -->
      <div class="receipt-header">
        <div class="success-icon">✓</div>
        <h1 class="receipt-title">Pembayaran Berhasil!</h1>
        <p class="receipt-subtitle">Terima kasih telah berbelanja di QianlunShop</p>
      </div>

      <!-- Divider Line -->
      <div class="receipt-divider"></div>

      <!-- Order ID Section -->
      <div class="receipt-section order-id-section">
        <div class="section-label">ID Pesanan</div>
        <div class="order-id-value">
          ${orderData.orderId}
          <button class="copy-btn" onclick="copyOrderId('${orderData.orderId}')" title="Copy Order ID">
            📋
          </button>
        </div>
        <div class="order-date">${formatDateTime(orderData.date || new Date())}</div>
      </div>

      <div class="receipt-divider"></div>

      <!-- Customer Info Section -->
      <div class="receipt-section customer-section">
        <div class="section-title">
          <span class="section-icon">👤</span>
          Data Pelanggan
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Nama:</span>
            <span class="info-value">${extractCustomerName(orderData)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${orderData.customerEmail || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Telepon:</span>
            <span class="info-value">${extractPhone(orderData)}</span>
          </div>
        </div>
      </div>

      <div class="receipt-divider"></div>

      <!-- Shipping Address Section -->
      <div class="receipt-section shipping-section">
        <div class="section-title">
          <span class="section-icon">📦</span>
          Alamat Pengiriman
        </div>
        <div class="address-box">
          ${orderData.shippingAddress || 'N/A'}
        </div>
      </div>

      <div class="receipt-divider"></div>

      <!-- Order Items Section -->
      <div class="receipt-section items-section">
        <div class="section-title">
          <span class="section-icon">🛍️</span>
          Produk yang Dibeli
        </div>
        ${renderReceiptItems(orderData.items)}
      </div>

      <div class="receipt-divider"></div>

      <!-- Payment Details Section -->
      <div class="receipt-section payment-section">
        <div class="section-title">
          <span class="section-icon">💳</span>
          Detail Pembayaran
        </div>
        <div class="payment-details">
          <div class="payment-method-info">
            <span class="info-label">Metode Pembayaran:</span>
            <span class="info-value">${orderData.paymentMethod || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div class="receipt-divider-thick"></div>

      <!-- Price Breakdown Section -->
      <div class="receipt-section totals-section">
        <div class="total-row">
          <span class="total-label">Subtotal</span>
          <span class="total-value">${Utils.formatPrice(calculateSubtotal(orderData))}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Ongkos Kirim</span>
          <span class="total-value">${Utils.formatPrice(extractShippingCost(orderData))}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Pajak (11%)</span>
          <span class="total-value">${Utils.formatPrice(extractTax(orderData))}</span>
        </div>
        ${extractDiscount(orderData) > 0 ? `
          <div class="total-row discount-row">
            <span class="total-label">Diskon</span>
            <span class="total-value discount">-${Utils.formatPrice(extractDiscount(orderData))}</span>
          </div>
        ` : ''}
        <div class="receipt-divider-thick"></div>
        <div class="total-row grand-total-row">
          <span class="total-label">Total Pembayaran</span>
          <span class="total-value grand-total">${Utils.formatPrice(orderData.total)}</span>
        </div>
      </div>

      <div class="receipt-divider"></div>

      <!-- Tracking Info -->
      <div class="receipt-section tracking-section">
        <div class="tracking-info">
          <div class="tracking-icon">📍</div>
          <div class="tracking-text">
            <strong>Lacak Pesanan Anda</strong>
            <p>Gunakan ID pesanan <code>${orderData.orderId}</code> untuk melacak status pengiriman</p>
          </div>
        </div>
      </div>

      <!-- QR Code Section (optional) -->
      <div class="receipt-section qr-section">
        <div class="qr-placeholder">
          <div class="qr-box">QR</div>
          <p class="qr-text">Scan untuk detail pesanan</p>
        </div>
      </div>

      <!-- Footer Message -->
      <div class="receipt-footer">
        <p class="footer-message">Kami telah mengirim konfirmasi ke email Anda</p>
        <p class="footer-thank">Terima kasih telah berbelanja di <strong>QianlunShop</strong></p>
        <div class="footer-logo">🐉</div>
      </div>

    </div>

    <!-- Action Buttons (outside receipt for printing) -->
    <div class="confirmation-actions">
      <button class="btn btn-primary btn-print" onclick="printReceipt()">
        🖨️ Cetak Invoice
      </button>
      <button class="btn btn-secondary btn-download" onclick="downloadPDF()">
        📥 Download PDF
      </button>
      <button class="btn btn-outline btn-share" onclick="shareOrder('${orderData.orderId}')">
        📤 Bagikan
      </button>
    </div>

    <div class="additional-actions">
      <a href="../index.html" class="btn btn-link">🏠 Kembali ke Beranda</a>
      <a href="products.html" class="btn btn-link">🛍️ Belanja Lagi</a>
    </div>

    <!-- Help Section -->
    <div class="help-section">
      <p>💡 <strong>Butuh Bantuan?</strong></p>
      <p>Hubungi kami di <a href="mailto:hello@qianlunshop.com">hello@qianlunshop.com</a></p>
      <p>atau WhatsApp: <a href="https://wa.me/6281234567890">+62 812-3456-7890</a></p>
    </div>
  `;

  container.innerHTML = confirmationHTML;

  // Add print & download styles
  addPrintStyles();
  
  // Initialize share functionality
  initShareFunctionality();
}

/**
 * Render receipt items
 */
function renderReceiptItems(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return '<p class="no-items">Tidak ada item dalam pesanan</p>';
  }

  return `
    <div class="items-list">
      ${items.map((item, index) => {
        const itemName = item.name || 'Produk Tanpa Nama';
        const itemPrice = item.price || 0;
        const itemQty = item.quantity || 1;
        const itemSubtotal = itemPrice * itemQty;

        return `
          <div class="receipt-item">
            <div class="item-header">
              <span class="item-name">${itemName}</span>
              <span class="item-total">${Utils.formatPrice(itemSubtotal)}</span>
            </div>
            <div class="item-details">
              <span class="item-qty">${itemQty} × ${Utils.formatPrice(itemPrice)}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Helper functions to extract data
 */
function extractCustomerName(orderData) {
  // Try to extract from shipping address (fallback)
  if (orderData.shippingAddress) {
    const match = orderData.shippingAddress.match(/^([^,]+)/);
    if (match) return match[1].trim();
  }
  return 'N/A';
}

function extractPhone(orderData) {
  // Phone not available in current data structure
  return 'N/A';
}

function calculateSubtotal(orderData) {
  if (orderData.items && Array.isArray(orderData.items)) {
    return orderData.items.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 0));
    }, 0);
  }
  return orderData.total || 0;
}

function extractShippingCost(orderData) {
  if (orderData.shippingCost !== undefined) return orderData.shippingCost;
  // Try to extract from total calculation
  return 0;
}

function extractTax(orderData) {
  if (orderData.tax !== undefined) return orderData.tax;
  const subtotal = calculateSubtotal(orderData);
  return subtotal * 0.11; // 11% PPN
}

function extractDiscount(orderData) {
  return orderData.discount || 0;
}

/**
 * Format date and time
 */
function formatDateTime(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error("❌ Date format error:", error);
    return new Date().toLocaleDateString('id-ID');
  }
}

/**
 * Render error state
 */
function renderErrorState(container) {
  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon">❌</div>
      <h2>Oops! Data Pesanan Tidak Ditemukan</h2>
      <p class="error-message">
        Maaf, kami tidak dapat menemukan data pesanan Anda.
        Kemungkinan sesi telah berakhir atau terjadi kesalahan.
      </p>

      <div class="confirmation-actions">
        <a href="../index.html" class="btn btn-primary">🏠 Kembali ke Beranda</a>
        <a href="products.html" class="btn btn-secondary">🛍️ Mulai Belanja</a>
      </div>

      <div class="help-section">
        <p>💡 <strong>Butuh Bantuan?</strong></p>
        <p>Hubungi kami di <a href="mailto:hello@qianlunshop.com">hello@qianlunshop.com</a></p>
        <p>atau WhatsApp: <a href="https://wa.me/6281234567890">+62 812-3456-7890</a></p>
      </div>
    </div>
  `;
}

/**
 * Add print styles
 */
function addPrintStyles() {
  if (document.getElementById('print-styles')) return;

  const style = document.createElement('style');
  style.id = 'print-styles';
  style.textContent = `
    /* Receipt Wrapper Styles */
    .receipt-wrapper {
      max-width: 800px;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(20, 20, 20, 0.95));
      border: 2px solid rgba(212, 175, 55, 0.3);
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
    }

    .receipt-wrapper::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Receipt Header */
    .receipt-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .success-icon {
      font-size: 5rem;
      color: #2ecc71;
      margin-bottom: 1rem;
      animation: successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      filter: drop-shadow(0 4px 20px rgba(46, 204, 113, 0.4));
    }

    @keyframes successPop {
      0% { transform: scale(0) rotate(-180deg); opacity: 0; }
      50% { transform: scale(1.2) rotate(10deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }

    .receipt-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      color: #d4af37;
      margin-bottom: 0.5rem;
      font-weight: 600;
      letter-spacing: 1px;
      text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
    }

    .receipt-subtitle {
      font-size: 1.1rem;
      color: #a0a0a0;
      margin: 0;
    }

    /* Dividers */
    .receipt-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
      margin: 2rem 0;
    }

    .receipt-divider-thick {
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
      margin: 1.5rem 0;
    }

    /* Receipt Sections */
    .receipt-section {
      margin: 1.5rem 0;
      position: relative;
      z-index: 1;
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      color: #d4af37;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-weight: 600;
    }

    .section-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 2px 6px rgba(212, 175, 55, 0.3));
    }

    /* Order ID Section */
    .order-id-section {
      text-align: center;
      background: rgba(212, 175, 55, 0.08);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(212, 175, 55, 0.2);
    }

    .section-label {
      font-size: 0.9rem;
      color: #a0a0a0;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .order-id-value {
      font-family: 'Courier New', monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: #f4d03f;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .copy-btn {
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: #d4af37;
      padding: 0.5rem 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.3s ease;
    }

    .copy-btn:hover {
      background: rgba(212, 175, 55, 0.3);
      transform: scale(1.1);
    }

    .order-date {
      font-size: 0.95rem;
      color: #a0a0a0;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.8rem 0;
      border-bottom: 1px dashed rgba(212, 175, 55, 0.1);
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-label {
      font-weight: 600;
      color: #a0a0a0;
      font-size: 0.95rem;
    }

    .info-value {
      color: #e8e8e8;
      font-size: 0.95rem;
      text-align: right;
      word-break: break-word;
    }

    /* Address Box */
    .address-box {
      background: rgba(212, 175, 55, 0.05);
      padding: 1.2rem;
      border-radius: 10px;
      border: 1px solid rgba(212, 175, 55, 0.2);
      color: #e8e8e8;
      line-height: 1.6;
    }

    /* Items List */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .receipt-item {
      background: rgba(212, 175, 55, 0.05);
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid rgba(212, 175, 55, 0.15);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .item-name {
      font-weight: 600;
      color: #e8e8e8;
      font-size: 1rem;
      flex: 1;
    }

    .item-total {
      font-weight: 700;
      color: #f4d03f;
      font-size: 1.1rem;
      margin-left: 1rem;
    }

    .item-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-qty {
      font-size: 0.9rem;
      color: #a0a0a0;
    }

    /* Payment Details */
    .payment-details {
      background: rgba(212, 175, 55, 0.05);
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid rgba(212, 175, 55, 0.2);
    }

    .payment-method-info {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    /* Totals Section */
    .totals-section {
      background: rgba(212, 175, 55, 0.08);
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid rgba(212, 175, 55, 0.3);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.8rem 0;
      border-bottom: 1px dashed rgba(212, 175, 55, 0.15);
    }

    .total-row:last-child {
      border-bottom: none;
    }

    .total-label {
      font-size: 1rem;
      color: #a0a0a0;
      font-weight: 500;
    }

    .total-value {
      font-size: 1rem;
      color: #e8e8e8;
      font-weight: 600;
    }

    .discount-row .total-value {
      color: #2ecc71;
    }

    .grand-total-row {
      margin-top: 1rem;
      padding-top: 1.5rem;
      border-top: 2px solid rgba(212, 175, 55, 0.4);
      border-bottom: none;
    }

    .grand-total-row .total-label {
      font-size: 1.3rem;
      color: #d4af37;
      font-weight: 700;
    }

    .grand-total-row .total-value {
      font-size: 1.5rem;
      color: #f4d03f;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(244, 208, 63, 0.3);
    }

    /* Tracking Section */
    .tracking-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: rgba(212, 175, 55, 0.05);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(212, 175, 55, 0.2);
    }

    .tracking-icon {
      font-size: 3rem;
      filter: drop-shadow(0 2px 8px rgba(212, 175, 55, 0.3));
    }

    .tracking-text {
      flex: 1;
    }

    .tracking-text strong {
      color: #d4af37;
      font-size: 1.1rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .tracking-text p {
      color: #a0a0a0;
      margin: 0;
      line-height: 1.6;
    }

    .tracking-text code {
      background: rgba(212, 175, 55, 0.15);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      color: #f4d03f;
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }

    /* QR Section */
    .qr-section {
      text-align: center;
    }

    .qr-placeholder {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .qr-box {
      width: 150px;
      height: 150px;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
      border: 2px dashed rgba(212, 175, 55, 0.4);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #d4af37;
      font-weight: 700;
    }

    .qr-text {
      color: #a0a0a0;
      font-size: 0.9rem;
      margin: 0;
    }

    /* Receipt Footer */
    .receipt-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
    }

    .footer-message {
      color: #a0a0a0;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }

    .footer-thank {
      color: #e8e8e8;
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .footer-thank strong {
      color: #d4af37;
      font-family: 'Playfair Display', serif;
    }

    .footer-logo {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 10px rgba(212, 175, 55, 0.4));
    }

    /* Action Buttons */
    .confirmation-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin: 2rem auto;
      max-width: 800px;
      flex-wrap: wrap;
    }

    .confirmation-actions .btn {
      flex: 1;
      min-width: 200px;
      padding: 1.2rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .btn-print {
      background: linear-gradient(135deg, #d4af37, #f4d03f);
      color: #000;
      border: none;
    }

    .btn-download {
      background: rgba(212, 175, 55, 0.15);
      color: #d4af37;
      border: 2px solid #d4af37;
    }

    .btn-share {
      background: transparent;
      color: #e8e8e8;
      border: 2px solid rgba(212, 175, 55, 0.3);
    }

    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
    }

    /* Additional Actions */
    .additional-actions {
      display: flex;
      gap: 2rem;
      justify-content: center;
      margin: 1rem auto;
    }

    .btn-link {
      background: none;
      border: none;
      color: #a0a0a0;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .btn-link:hover {
      color: #d4af37;
      transform: none;
      box-shadow: none;
    }

    /* Help Section */
    .help-section {
      text-align: center;
      margin: 2rem auto;
      max-width: 800px;
      padding: 1.5rem;
      background: rgba(212, 175, 55, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(212, 175, 55, 0.2);
    }

    .help-section p {
      color: #a0a0a0;
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    .help-section strong {
      color: #d4af37;
    }

    .help-section a {
      color: #f4d03f;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .help-section a:hover {
      color: #d4af37;
      text-decoration: underline;
    }

    /* Error State */
    .error-state {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      padding: 3rem 2rem;
    }

    .error-icon {
      font-size: 5rem;
      margin-bottom: 2rem;
      filter: drop-shadow(0 4px 15px rgba(231, 76, 60, 0.3));
    }

    .error-state h2 {
      font-family: 'Playfair Display', serif;
      color: #d4af37;
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .error-message {
      color: #a0a0a0;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    /* Loading State */
    .confirmation-loading {
      text-align: center;
      padding: 5rem 2rem;
    }

    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(212, 175, 55, 0.2);
      border-top: 4px solid #d4af37;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .confirmation-loading p {
      color: #a0a0a0;
      font-size: 1.1rem;
    }

    /* Print Styles */
    @media print {
      body * {
        visibility: hidden;
      }

      .receipt-wrapper,
      .receipt-wrapper * {
        visibility: visible;
      }

      .receipt-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        max-width: 100%;
        border: none;
        box-shadow: none;
        background: white;
        color: black;
        padding: 2rem;
      }

      .confirmation-actions,
      .additional-actions,
      .help-section,
      .navbar,
      footer {
        display: none !important;
      }

      .receipt-title {
        color: #000;
        text-shadow: none;
      }

      .order-id-value,
      .item-total,
      .grand-total {
        color: #000;
      }

      @page {
        margin: 1cm;
        size: A4;
      }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .receipt-wrapper {
        padding: 2rem 1.5rem;
        border-radius: 16px;
        margin: 0 1rem 2rem;
      }

      .receipt-title {
        font-size: 2rem;
      }

      .success-icon {
        font-size: 4rem;
      }

      .order-id-value {
        font-size: 1.2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .section-title {
        font-size: 1.2rem;
      }

      .confirmation-actions {
        flex-direction: column;
        padding: 0 1rem;
      }

      .confirmation-actions .btn {
        width: 100%;
        min-width: auto;
      }

      .additional-actions {
        flex-direction: column;
        gap: 1rem;
      }

      .tracking-info {
        flex-direction: column;
        text-align: center;
      }

      .qr-box {
        width: 120px;
        height: 120px;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize share functionality
 */
function initShareFunctionality() {
  // Copy Order ID
  window.copyOrderId = function(orderId) {
    navigator.clipboard.writeText(orderId).then(() => {
      showToast('📋 Order ID berhasil disalin!', 'success');
    }).catch(() => {
      showToast('❌ Gagal menyalin Order ID', 'error');
    });
  };

  // Print Receipt
  window.printReceipt = function() {
    window.print();
  };

  // Download PDF (basic implementation)
  window.downloadPDF = function() {
    showToast('📥 Fitur download PDF akan segera tersedia!', 'info');
    // TODO: Implement PDF generation with jsPDF or similar library
  };

  // Share Order
  window.shareOrder = function(orderId) {
    const shareData = {
      title: 'QianlunShop - Order Confirmation',
      text: `Pesanan saya di QianlunShop (ID: ${orderId})`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => showToast('✅ Berhasil dibagikan!', 'success'))
        .catch(() => {});
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('📋 Link berhasil disalin!', 'success');
      });
    }
  };
}

console.log("✅ Order Confirmation module loaded");