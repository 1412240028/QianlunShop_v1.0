# ============================================
# 🌐 QIANLUNSHOP FRONTEND - Nginx Server
# Static file server for React/Vue/Angular apps
# ============================================

# Use official nginx image
FROM nginx:alpine

# ============================================
# 📦 Install dependencies
# ============================================
RUN apk update && apk upgrade && \
    apk add --no-cache \
    curl && \
    rm -rf /var/cache/apk/*

# ============================================
# 📁 Copy nginx configuration
# ============================================
COPY nginx.conf /etc/nginx/nginx.conf

# ============================================
# 📄 Copy static files
# ============================================
COPY ../frontend /usr/share/nginx/html

# ============================================
# 🔧 Create logs directory
# ============================================
RUN mkdir -p /var/log/nginx

# ============================================
# 🚀 Expose port
# ============================================
EXPOSE 80

# ============================================
# 🏥 Health check
# ============================================
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# ============================================
# 🚀 Start nginx
# ============================================
CMD ["nginx", "-g", "daemon off;"]
