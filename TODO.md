# Backend Implementation TODO

## Phase 1: Create NEW Files
- [x] backend/models/Product.js: Product schema with fields like name, description, price, images, etc.
- [x] backend/config/db.js: Extract database connection logic from server.js.
- [x] backend/utils/generateToken.js: JWT token generation utility.
- [x] backend/utils/validators.js: Input validation rules.
- [ ] backend/middleware/validate.js: Request validation middleware.
- [x] backend/middleware/errorHandler.js: Centralized error handling middleware.
- [x] backend/controllers/authController.js: Authentication logic (login, register, etc.).
- [x] backend/controllers/productController.js: Product CRUD operations.
- [x] backend/controllers/orderController.js: Order management logic.
- [x] backend/controllers/userController.js: User management logic.
- [x] backend/routes/products.js: Product routes.
- [x] backend/routes/users.js: User management routes.

## Phase 2: Update EXISTING Files

## Phase 2: Update EXISTING Files
- [ ] backend/middleware/auth.js: Update to fetch real user from database instead of mock.
- [ ] backend/routes/auth.js: Replace mock auth with real authController methods.
- [ ] backend/routes/orders.js: Replace mock order handling with real orderController methods.
- [ ] backend/server.js: Add errorHandler middleware and update db connection to use config/db.js.

## Phase 3: Testing & Verification
- [ ] Install dependencies (`npm install`).
- [ ] Create `.env` file with required environment variables.
- [ ] Test API endpoints.
- [ ] Run server with `npm run dev` and verify database connection.
