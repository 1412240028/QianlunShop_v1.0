// =========================
// 💳 CHECKOUT MODULE - FIXED
// =========================
import { Cart } from "./cart.js";
import { CONFIG, Utils } from "./config.js";
import { showToast } from "./ui.js";

// =========================
// 🎨 CHECKOUT CONFIRMATION MODAL (SEPARATE FROM CART)
// =========================
class CheckoutConfirmModal {
  constructor() {
    this.modal = null;
    this.resolveCallback = null;
    this.init();
  }

  init() {
    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById('checkout-confirm-styles')) return;

    const style = document.createElement('style');
    style.id = 'checkout-confirm-styles';
    style.textContent = `
      .checkout-confirm-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        padding: 20px;
      }

      .checkout-confirm-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .checkout-confirm-modal {
        background: linear-gradient(135deg, rgba(26, 26, 26, 0.98), rgba(20, 20, 20, 0.95));
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 20px;
        padding: 2.5rem;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        transform: scale(0.9) translateY(20px);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      }

      .checkout-confirm-overlay.show .checkout-confirm-modal {
        transform: scale(1) translateY(0);
      }

      .checkout-confirm-icon {
        font-size: 4rem;
        text-align: center;
        margin-bottom: 1.5rem;
        filter: drop-shadow(0 4px 12px rgba(212, 175, 55, 0.4));
        animation: iconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .checkout-confirm-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        font-weight: 600;
        color: #d4af37;
        text-align: center;
        margin-bottom: 1rem;
        letter-spacing: 0.5px;
        text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
      }

      .checkout-confirm-message {
        font-family: 'Inter', sans-serif;
        font-size: 1.05rem;
        color: #e8e8e8;
        text-align: center;
        line-height: 1.6;
        margin-bottom: 1.5rem;
        opacity: 0.95;
      }

      .checkout-confirm-details {
        background: rgba(212, 175, 55, 0.08);
        border: 1px solid rgba(212, 175, 55, 0.2);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1.5rem 0;
      }

      .checkout-confirm-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.8rem;
        color: #e8e8e8;
        font-size: 0.95rem;
      }

      .checkout-confirm-row:last-child {
        margin-bottom: 0;
        padding-top: 0.8rem;
        border-top: 1px solid rgba(212, 175, 55, 0.2);
        font-size: 1.2rem;
        font-weight: 700;
        color: #f4d03f;
      }

      .checkout-confirm-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }

      .checkout-confirm-btn {
        flex: 1;
        padding: 1rem 1.5rem;
        border: none;
        border-radius: 12px;
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .checkout-confirm-btn-confirm {
        background: linear-gradient(135deg, #d4af37, #f4d03f);
        color: #000;
        border: 1px solid rgba(212, 175, 55, 0.5);
        box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
      }

      .checkout-confirm-btn-confirm:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
      }

      .checkout-confirm-btn-cancel {
        background: rgba(255, 255, 255, 0.05);
        color: #e8e8e8;
        border: 1px solid rgba(212, 175, 55, 0.3);
      }

      .checkout-confirm-btn-cancel:hover {
        background: rgba(212, 175, 55, 0.15);
        border-color: #d4af37;
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        .checkout-confirm-modal {
          padding: 2rem;
        }

        .checkout-confirm-icon {
          font-size: 3rem;
        }

        .checkout-confirm-title {
          font-size: 1.5rem;
        }

        .checkout-confirm-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(options = {}) {
    return new Promise((resolve) => {
      this.resolveCallback = resolve;

      const {
        title = 'Konfirmasi Pembayaran',
        message = 'Apakah data pesanan sudah benar?',
        total = 0,
        icon = '💳',
        confirmText = 'Ya, Bayar Sekarang',
        cancelText = 'Batal'
      } = options;

      const overlay = document.createElement('div');
      overlay.className = 'checkout-confirm-overlay';
      overlay.id = 'checkoutConfirmOverlay';

      overlay.innerHTML = `
        <div class="checkout-confirm-modal">
          <div class="checkout-confirm-icon">${icon}</div>
          <h2 class="checkout-confirm-title">${title}</h2>
          <p class="checkout-confirm-message">${message}</p>
          
          ${total ? `
            <div class="checkout-confirm-details">
              <div class="checkout-confirm-row">
                <span>Total Pembayaran:</span>
                <span>${Utils.formatPrice(total)}</span>
              </div>
            </div>
          ` : ''}
          
          <div class="checkout-confirm-actions">
            <button class="checkout-confirm-btn checkout-confirm-btn-cancel" data-action="cancel">
              ${cancelText}
            </button>
            <button class="checkout-confirm-btn checkout-confirm-btn-confirm" data-action="confirm">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.modal = overlay;
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        overlay.classList.add('show');
      });

      const cancelBtn = overlay.querySelector('[data-action="cancel"]');
      const confirmBtn = overlay.querySelector('[data-action="confirm"]');

      cancelBtn.addEventListener('click', () => this.close(false));
      confirmBtn.addEventListener('click', () => this.close(true));

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close(false);
        }
      });

      const escHandler = (e) => {
        if (e.key === 'Escape') {
          this.close(false);
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  }

  close(confirmed) {
    if (!this.modal) return;

    this.modal.classList.remove('show');

    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.remove();
      }
      this.modal = null;
      document.body.style.overflow = '';

      if (this.resolveCallback) {
        this.resolveCallback(confirmed);
        this.resolveCallback = null;
      }
    }, 300);
  }
}

const checkoutConfirmModal = new CheckoutConfirmModal();

// =========================
// 💳 Checkout Manager Class
// =========================
export class CheckoutManager {
  constructor() {
    this.cart = new Cart();
    this.shippingCost = 0;
    this.discount = 0;
    this.promoCode = '';
    this.isProcessing = false;
    this.init();
  }

  init() {
    this.displayCheckoutItems();
    this.calculateTotals();
    this.setupEventListeners();

    console.log("💳 Enhanced checkout manager initialized");
  }

  displayCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    const placeOrderBtn = document.getElementById('placeOrder');
    if (!checkoutItems) return;

    const items = this.cart.getItems();

    if (items.length === 0) {
      checkoutItems.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h3>Keranjang Kosong</h3>
          <p>Silakan tambahkan produk ke keranjang terlebih dahulu</p>
          <a href="products.html" class="btn btn-primary">Belanja Sekarang</a>
        </div>
      `;

      if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Keranjang Kosong';
        placeOrderBtn.style.opacity = '0.5';
        placeOrderBtn.style.cursor = 'not-allowed';
      }

      return;
    }

    checkoutItems.innerHTML = items.map(item => `
      <div class="checkout-item">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/sample1.jpg'">
        <div class="item-details">
          <h4>${item.name}</h4>
          <p>${this.formatCategory(item.category)}</p>
          <p>Qty: ${item.quantity}</p>
        </div>
        <div class="item-total">${Utils.formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');

    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = '🛍️ Bayar Sekarang';
      placeOrderBtn.style.opacity = '';
      placeOrderBtn.style.cursor = '';
    }
  }

  calculateTotals() {
    const subtotal = this.cart.getTotal();
    const tax = subtotal * CONFIG.TAX_RATE;
    const grandTotal = subtotal + this.shippingCost + tax - this.discount;

    const elements = {
      'subtotal': subtotal,
      'shippingCost': this.shippingCost,
      'taxAmount': tax,
      'discountAmount': -this.discount,
      'grandTotal': grandTotal
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = Utils.formatPrice(value);
      }
    });

    this.updateShippingSelectionOnly(subtotal);

    const freeShippingMsg = document.getElementById('freeShippingMsg');
    if (freeShippingMsg) {
      if (Utils.isFreeShippingEligible(subtotal)) {
        freeShippingMsg.style.display = 'block';
        freeShippingMsg.innerHTML = `🎉 Anda mendapatkan <strong>gratis ongkir</strong>!`;
      } else {
        const needed = CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;
        freeShippingMsg.style.display = needed > 0 ? 'block' : 'none';
        freeShippingMsg.innerHTML = `Tambahkan <strong>${Utils.formatPrice(needed)}</strong> lagi untuk gratis ongkir!`;
      }
    }
  }

  updateShippingSelectionOnly(subtotal) {
    this.updateShippingOptions();
  }

  updateShippingOptions() {
    const shippingSelect = document.getElementById('shipping');
    if (!shippingSelect) return;

    const shippingOptions = Object.entries(CONFIG.SHIPPING);

    shippingSelect.innerHTML = shippingOptions.map(([key, method]) => `
      <option value="${key.toLowerCase()}">
        ${method.name} - ${Utils.formatPrice(method.cost)}
        (${Utils.getEstimatedDelivery(key)})
      </option>
    `).join('');

    const currentValue = shippingSelect.value;
    const validOptions = shippingOptions.map(([key]) => key.toLowerCase());
    if (!validOptions.includes(currentValue)) {
      shippingSelect.value = validOptions[0] || 'regular';
      this.updateShippingCost(shippingSelect.value);
    }
  }

  updateShippingCost(method, preventRecalculation = false) {
    const shipping = CONFIG.SHIPPING[method.toUpperCase()];

    if (!shipping) {
      this.shippingCost = 0;
      return;
    }

    let costChanged = false;
    let oldCost = this.shippingCost;

    this.shippingCost = shipping.cost;
    costChanged = (oldCost !== this.shippingCost);

    if (costChanged && !preventRecalculation) {
      this.calculateTotals();
    }
  }

  setupEventListeners() {
    const shippingSelect = document.getElementById('shipping');
    if (shippingSelect) {
      const isEligible = Utils.isFreeShippingEligible(this.cart.getTotal());
      const shippingOptions = Object.entries(CONFIG.SHIPPING);

      shippingSelect.innerHTML = shippingOptions.map(([key, method]) => `
        <option value="${key.toLowerCase()}">
          ${method.name} - ${Utils.formatPrice(method.cost)}
          (${Utils.getEstimatedDelivery(key)})
        </option>
      `).join('');

      shippingSelect.addEventListener('change', (e) => {
        this.updateShippingCost(e.target.value);
      });

      shippingSelect.value = isEligible ? 'free' : 'regular';
      this.updateShippingCost(shippingSelect.value);
    }

    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const creditCardForm = document.getElementById('creditCardForm');

    paymentMethods.forEach(method => {
      method.addEventListener('change', (e) => {
        if (creditCardForm) {
          creditCardForm.style.display = e.target.value === 'creditCard' ? 'block' : 'none';
        }
      });
    });

    const applyPromoBtn = document.getElementById('applyPromo');
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
    }

    const placeOrderBtn = document.getElementById('placeOrder');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("🛍️ Place Order button clicked");
        this.placeOrder();
      });
    }

    this.setupFormValidation();
  }

  setupFormValidation() {
    const forms = document.querySelectorAll('input, select');
    forms.forEach(form => {
      form.addEventListener('blur', (e) => {
        this.validateField(e.target);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    const style = window.getComputedStyle(field);
    const parentStyle = field.parentElement ?
      window.getComputedStyle(field.parentElement) : null;

    if (style.display === 'none' ||
      (parentStyle && parentStyle.display === 'none')) {
      return true;
    }

    if (field.required && !value) {
      isValid = false;
      message = 'Field ini wajib diisi';
      this.updateFieldError(field, isValid, message);
      return isValid;
    }

    if (!value && !field.required) {
      this.updateFieldError(field, true, '');
      return true;
    }

    switch (field.type) {
      case 'email':
        isValid = Utils.validateEmail(value);
        message = isValid ? '' : 'Format email tidak valid';
        break;

      case 'tel':
        isValid = Utils.validatePhone(value);
        message = isValid ? '' : 'Format nomor telepon tidak valid';
        break;

      case 'text':
        if (field.id === 'postalCode') {
          isValid = /^\d{5}$/.test(value);
          message = isValid ? '' : 'Kode pos harus 5 digit angka';
        } else if (field.id === 'cardNumber') {
          const cleanNumber = value.replace(/\s/g, '');
          isValid = /^\d{13,19}$/.test(cleanNumber) && this.luhnCheck(cleanNumber);
          message = isValid ? '' : 'Nomor kartu tidak valid';
        } else if (field.id === 'cvv') {
          isValid = /^\d{3,4}$/.test(value);
          message = isValid ? '' : 'CVV harus 3-4 digit';
        } else if (field.id === 'expiryDate') {
          isValid = this.validateExpiryDate(value);
          message = isValid ? '' : 'Format MM/YY harus masa depan';
        } else if (field.id === 'fullName') {
          isValid = value.length >= 3;
          message = isValid ? '' : 'Nama minimal 3 karakter';
        } else if (field.id === 'address') {
          isValid = value.length >= 10;
          message = isValid ? '' : 'Alamat minimal 10 karakter';
        }
        break;

      case 'select-one':
        isValid = value !== '' && value !== 'null';
        message = isValid ? '' : 'Silakan pilih salah satu';
        break;
    }

    this.updateFieldError(field, isValid, message);
    return isValid;
  }

  updateFieldError(field, isValid, message) {
    field.classList.toggle('error', !isValid);

    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.style.cssText = `
        color: var(--error);
        font-size: 0.85rem;
        margin-top: 0.3rem;
        display: none;
      `;
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    errorElement.textContent = message;
    errorElement.style.display = message ? 'block' : 'none';
  }

  luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateExpiryDate(value) {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = parseInt('20' + match[2], 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiry = new Date(year, month - 1);

    return expiry > now;
  }

  applyPromoCode() {
    const promoCodeEl = document.getElementById('promoCode');
    if (!promoCodeEl) return;

    const promoCode = promoCodeEl.value.trim().toUpperCase();
    const subtotal = this.cart.getTotal();

    this.discount = Utils.calculateDiscount(subtotal, promoCode);

    if (this.discount > 0) {
      this.promoCode = promoCode;
      showToast(CONFIG.MESSAGES.PROMO_APPLIED, 'success');
      this.calculateTotals();

      Utils.trackEvent(CONFIG.ANALYTICS_EVENTS.APPLY_PROMO, {
        promo_code: promoCode,
        discount_amount: this.discount
      });
    } else {
      showToast(CONFIG.MESSAGES.PROMO_INVALID, 'error');
      this.promoCode = '';
      this.discount = 0;
      this.calculateTotals();
    }
  }

  // ✅ FIXED: Custom Checkout Confirmation Modal
  async showOrderConfirmation() {
    const subtotal = this.cart.getTotal();
    const discountedSubtotal = subtotal - this.discount;
    const tax = discountedSubtotal * CONFIG.TAX_RATE;
    const grandTotal = discountedSubtotal + this.shippingCost + tax;

    return await checkoutConfirmModal.show({
      title: 'Konfirmasi Pembayaran',
      message: 'Apakah data pesanan sudah benar? Pastikan semua informasi telah terisi dengan benar.',
      total: grandTotal,
      icon: '💳',
      confirmText: 'Ya, Bayar Sekarang',
      cancelText: 'Periksa Kembali'
    });
  }

  async placeOrder() {
    console.log("🛍️ Place Order executing...");

    if (this.isProcessing) {
      console.log("⚠️ Already processing");
      return;
    }

    if (this.cart.getItems().length === 0) {
      showToast('Keranjang belanja kosong', 'error');
      return;
    }

    const requiredFields = Array.from(document.querySelectorAll('[required]'));
    const visibleFields = requiredFields.filter(field => {
      const style = window.getComputedStyle(field);
      const parentStyle = field.parentElement ?
        window.getComputedStyle(field.parentElement) : null;

      return style.display !== 'none' &&
        (!parentStyle || parentStyle.display !== 'none');
    });

    let allValid = true;
    let firstInvalidField = null;

    visibleFields.forEach(field => {
      const isValid = this.validateField(field);
      if (!isValid) {
        allValid = false;
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });

    if (!allValid) {
      showToast(CONFIG.MESSAGES.FORM_INCOMPLETE, 'error');

      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        firstInvalidField.focus();
      }
      return;
    }

    // ✅ Use custom modal instead of native confirm
    const confirmed = await this.showOrderConfirmation();

    if (!confirmed) {
      console.log("❌ User cancelled order");
      return;
    }

    this.isProcessing = true;

    const placeOrderBtn = document.getElementById('placeOrder');
    const originalText = placeOrderBtn ? placeOrderBtn.innerHTML : '';

    try {
      if (placeOrderBtn) {
        placeOrderBtn.innerHTML = '⏳ Memproses...';
        placeOrderBtn.disabled = true;
        placeOrderBtn.style.cursor = 'not-allowed';
        placeOrderBtn.style.opacity = '0.6';
      }

      console.log("💳 Processing payment...");

      await new Promise(resolve => setTimeout(resolve, 2000));

      const subtotal = this.cart.getTotal();
      const discountedSubtotal = subtotal - this.discount;
      const tax = discountedSubtotal * CONFIG.TAX_RATE;
      const grandTotal = discountedSubtotal + this.shippingCost + tax;

      const order = {
        id: Utils.generateId('ORD'),
        date: new Date().toISOString(),
        items: this.cart.getItems(),
        customerInfo: this.getCustomerInfo(),
        shipping: this.getShippingInfo(),
        payment: this.getPaymentInfo(),
        promoCode: this.promoCode,
        totals: {
          subtotal: subtotal,
          shipping: this.shippingCost,
          tax: tax,
          discount: this.discount,
          grandTotal: grandTotal
        },
        status: 'completed'
      };

      this.saveOrder(order);

      console.log("🗑️ Clearing cart...");
      await this.cart.clear(true);

      const orderData = {
        orderId: order.id,
        date: new Date().toLocaleDateString('id-ID'),
        customerEmail: order.customerInfo.email,
        paymentMethod: order.payment.methodName,
        shippingAddress: `${order.customerInfo.address}, ${order.customerInfo.city} ${order.customerInfo.postalCode}`,
        total: order.totals.grandTotal,
        items: order.items
      };

      console.log("💾 Saving order data:", orderData);
      Utils.saveToStorage('qianlunshop_last_order', orderData);

      showToast('🎉 Pembayaran berhasil! Mengalihkan...', 'success');

      if (typeof Utils !== 'undefined' && Utils.trackEvent) {
        Utils.trackEvent(CONFIG.ANALYTICS_EVENTS.PURCHASE, {
          transaction_id: order.id,
          value: order.totals.grandTotal,
          currency: 'IDR'
        });
      }

      setTimeout(() => {
        console.log("🔄 Redirecting to confirmation...");
        window.location.href = `order-confirmation.html`;
      }, 1500);

    } catch (error) {
      console.error('❌ Order error:', error);
      showToast(CONFIG.MESSAGES.ORDER_FAILED, 'error');

      if (placeOrderBtn) {
        placeOrderBtn.innerHTML = originalText || '🛍️ Bayar Sekarang';
        placeOrderBtn.disabled = false;
        placeOrderBtn.style.cursor = 'pointer';
        placeOrderBtn.style.opacity = '1';
      }

      this.isProcessing = false;
    }
  }

  getCustomerInfo() {
    return {
      fullName: document.getElementById('fullName')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      postalCode: document.getElementById('postalCode')?.value || ''
    };
  }

  getShippingInfo() {
    const shippingSelect = document.getElementById('shipping');
    const method = shippingSelect?.value || 'regular';

    const methodKeyMap = {
      'regular': 'REGULAR',
      'express': 'EXPRESS',
      'same-day': 'SAME_DAY',
      'free': 'FREE'
    };

    const configKey = methodKeyMap[method] || method.toUpperCase();
    const shippingConfig = CONFIG.SHIPPING[configKey];

    return {
      method: method,
      methodName: shippingConfig?.name || method,
      cost: this.shippingCost,
      estimatedDelivery: Utils.getEstimatedDelivery(method)
    };
  }

  getPaymentInfo() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    const info = {
      method: paymentMethod?.value || 'unknown',
      methodName: CONFIG.PAYMENT_METHODS[paymentMethod?.value.toUpperCase()]?.name || 'Unknown'
    };

    if (paymentMethod?.value === 'creditCard') {
      const cardNumber = document.getElementById('cardNumber');
      if (cardNumber) {
        info.cardLastFour = cardNumber.value.slice(-4);
      }
    }

    return info;
  }

  saveOrder(order) {
    const orders = Utils.loadFromStorage(CONFIG.STORAGE_KEYS.ORDERS, []);
    orders.push(order);
    Utils.saveToStorage(CONFIG.STORAGE_KEYS.ORDERS, orders);
  }

  formatCategory(category) {
    return CONFIG.CATEGORIES[category.toUpperCase()]?.name || category;
  }
}

// =========================
// 💳 Initialize Checkout Page
// =========================
export function initCheckoutPage() {
  const checkoutContainer = document.querySelector(".checkout-container");
  if (!checkoutContainer) return;

  console.log("💳 Initializing enhanced checkout page...");
  new CheckoutManager();
}