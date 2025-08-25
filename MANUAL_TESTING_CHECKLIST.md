# 🧪 MANUAL FEATURE TESTING CHECKLIST

## 🚀 **SERVER SETUP:**
```bash
# Start the development server
npm run dev

# Server should be running at:
# http://localhost:3000
```

## 📋 **TESTING METHODOLOGY:**
✅ = Working  
❌ = Broken  
⚠️ = Partially working  
🔄 = Need to test  

---

## 🏢 **ADMIN DASHBOARD TESTING**

### **1. Admin Authentication:**
- [ ] 🔄 Navigate to `/admin`
- [ ] 🔄 Login form appears
- [ ] 🔄 Valid credentials work
- [ ] 🔄 Invalid credentials rejected
- [ ] 🔄 Redirects to dashboard after login

### **2. Admin Dashboard Overview:**
- [ ] 🔄 Dashboard loads at `/admin`
- [ ] 🔄 Statistics cards display
- [ ] 🔄 Navigation menu visible
- [ ] 🔄 All sidebar links work

### **3. Admin Products Management:**
#### **Page Access:**
- [ ] 🔄 Navigate to `/admin/products`
- [ ] 🔄 Products list loads
- [ ] 🔄 Search bar functional
- [ ] 🔄 Filter dropdown works

#### **View Product:**
- [ ] 🔄 Click "View" button on product
- [ ] 🔄 Product details display
- [ ] 🔄 Images show correctly
- [ ] 🔄 All product info visible

#### **Edit Product:**
- [ ] 🔄 Click "Edit" button on product
- [ ] 🔄 Edit form loads with data
- [ ] 🔄 Modify product name
- [ ] 🔄 Change product price
- [ ] 🔄 Update description
- [ ] 🔄 Change category
- [ ] 🔄 Update inventory
- [ ] 🔄 Save changes button works
- [ ] 🔄 Data saves to database
- [ ] 🔄 Redirects after save

#### **Delete Product:**
- [ ] 🔄 Click "Delete" button
- [ ] 🔄 Confirmation dialog appears
- [ ] 🔄 Cancel button works
- [ ] 🔄 Confirm deletion works
- [ ] 🔄 Product removed from list
- [ ] 🔄 Data deleted from database

#### **Product Status:**
- [ ] 🔄 Toggle active/inactive status
- [ ] 🔄 Status updates in database
- [ ] 🔄 Visual indicators correct

#### **Shopify Export:**
- [ ] 🔄 Click "Export to Shopify CSV"
- [ ] 🔄 CSV file downloads
- [ ] 🔄 CSV contains all products
- [ ] 🔄 Images included in CSV
- [ ] 🔄 Categories included in CSV
- [ ] 🔄 Inventory numbers correct
- [ ] 🔄 Prices formatted properly

### **4. Admin Vendors Management:**
#### **Page Access:**
- [ ] 🔄 Navigate to `/admin/vendors`
- [ ] 🔄 Vendors list loads
- [ ] 🔄 Search functionality works

#### **View Vendor:**
- [ ] 🔄 Click "View" on vendor
- [ ] 🔄 Vendor profile displays
- [ ] 🔄 Business information visible
- [ ] 🔄 Contact details shown

#### **Edit Vendor:**
- [ ] 🔄 Click "Edit" on vendor
- [ ] 🔄 Edit form loads
- [ ] 🔄 Modify vendor details
- [ ] 🔄 Save changes works

#### **Vendor Status:**
- [ ] 🔄 Approve vendor application
- [ ] 🔄 Reject vendor application
- [ ] 🔄 Suspend vendor account
- [ ] 🔄 Status updates correctly

#### **Vendor Products:**
- [ ] 🔄 View vendor's products
- [ ] 🔄 Products list for vendor loads
- [ ] 🔄 Can edit vendor products

### **5. Admin Categories Management:**
#### **Page Access:**
- [ ] 🔄 Navigate to `/admin/categories`
- [ ] 🔄 Categories list loads

#### **Add Category:**
- [ ] 🔄 Click "Add Category" button
- [ ] 🔄 Add form appears
- [ ] 🔄 Fill in category name
- [ ] 🔄 Fill in description
- [ ] 🔄 Save category works
- [ ] 🔄 New category appears in list

#### **Edit Category:**
- [ ] 🔄 Click "Edit" on category
- [ ] 🔄 Edit form loads with data
- [ ] 🔄 Modify category details
- [ ] 🔄 Save changes works
- [ ] 🔄 Updates reflected in list

#### **Delete Category:**
- [ ] 🔄 Click "Delete" on category
- [ ] 🔄 Confirmation dialog shows
- [ ] 🔄 Confirm deletion works
- [ ] 🔄 Category removed from list

### **6. Admin Orders Management:**
#### **Page Access:**
- [ ] 🔄 Navigate to `/admin/orders`
- [ ] 🔄 Orders list loads
- [ ] 🔄 Search orders works
- [ ] 🔄 Filter by status works

#### **View Order:**
- [ ] 🔄 Click "View" on order
- [ ] 🔄 Order details display
- [ ] 🔄 Customer information visible
- [ ] 🔄 Product list correct

#### **Update Order:**
- [ ] 🔄 Change order status
- [ ] 🔄 Add tracking number
- [ ] 🔄 Save updates
- [ ] 🔄 Changes reflected in list

### **7. Admin Messages:**
#### **Page Access:**
- [ ] 🔄 Navigate to `/admin/messages`
- [ ] 🔄 Messages list loads

#### **View Message:**
- [ ] 🔄 Click on message
- [ ] 🔄 Message content displays
- [ ] 🔄 Sender information visible

#### **Reply to Message:**
- [ ] 🔄 Click "Reply" button
- [ ] 🔄 Reply form appears
- [ ] 🔄 Type reply message
- [ ] 🔄 Send reply works
- [ ] 🔄 Reply appears in thread

#### **Message Status:**
- [ ] 🔄 Mark as read/unread
- [ ] 🔄 Status updates correctly
- [ ] 🔄 Delete message works

### **8. Admin Payouts:**
#### **Page Access:**
- [ ] 🔄 Navigate to `/admin/payouts`
- [ ] 🔄 Payout requests list loads

#### **Process Payout:**
- [ ] 🔄 Click "View" on payout request
- [ ] 🔄 Payout details display
- [ ] 🔄 Approve payout button works
- [ ] 🔄 Reject payout button works
- [ ] 🔄 Status updates correctly

### **9. Admin Settings:**
- [ ] 🔄 Navigate to `/admin/settings`
- [ ] 🔄 Settings page loads
- [ ] 🔄 General settings form
- [ ] 🔄 Save settings works

---

## 👨‍💼 **VENDOR DASHBOARD TESTING**

### **1. Vendor Authentication:**
- [ ] 🔄 Navigate to `/auth/vendor`
- [ ] 🔄 Login form appears
- [ ] 🔄 Valid credentials work
- [ ] 🔄 Invalid credentials rejected
- [ ] 🔄 Registration form works
- [ ] 🔄 Email verification process

### **2. Vendor Dashboard Overview:**
- [ ] 🔄 Dashboard loads at `/vendor`
- [ ] 🔄 Sales statistics display
- [ ] 🔄 Revenue charts work
- [ ] 🔄 Product stats accurate
- [ ] 🔄 Navigation menu functional

### **3. Vendor Products Management:**
#### **Page Access:**
- [ ] 🔄 Navigate to `/vendor/products`
- [ ] 🔄 Products list loads
- [ ] 🔄 Only vendor's products shown
- [ ] 🔄 Search functionality works

#### **Add Product:**
- [ ] 🔄 Click "Add Product" button
- [ ] 🔄 Navigate to `/vendor/products/new`
- [ ] 🔄 Add product form loads
- [ ] 🔄 Fill in product name (required)
- [ ] 🔄 Fill in description
- [ ] 🔄 Set price (required)
- [ ] 🔄 Set inventory quantity
- [ ] 🔄 Select category
- [ ] 🔄 Add SKU
- [ ] 🔄 Set weight
- [ ] 🔄 Upload product images
- [ ] 🔄 Multiple image upload works
- [ ] 🔄 Image preview displays
- [ ] 🔄 Remove image works
- [ ] 🔄 Form validation works
- [ ] 🔄 Save product button works
- [ ] 🔄 Product saves to database
- [ ] 🔄 Redirects to products list
- [ ] 🔄 New product appears in list

#### **View Product:**
- [ ] 🔄 Click "View" button on product
- [ ] 🔄 Navigate to `/vendor/products/{id}`
- [ ] 🔄 Product details display correctly
- [ ] 🔄 Images gallery works
- [ ] 🔄 All product information visible
- [ ] 🔄 Product status shown
- [ ] 🔄 Edit button works
- [ ] 🔄 Delete button works
- [ ] 🔄 Back to products works

#### **Edit Product:**
- [ ] 🔄 Click "Edit" button on product
- [ ] 🔄 Navigate to `/vendor/products/{id}/edit`
- [ ] 🔄 Edit form loads with existing data
- [ ] 🔄 Modify product name
- [ ] 🔄 Change description
- [ ] 🔄 Update price
- [ ] 🔄 Change inventory quantity
- [ ] 🔄 Update category
- [ ] 🔄 Modify SKU
- [ ] 🔄 Change weight
- [ ] 🔄 Upload new images
- [ ] 🔄 Remove existing images
- [ ] 🔄 Form validation works
- [ ] 🔄 Save changes button works
- [ ] 🔄 Changes save to database
- [ ] 🔄 Redirects to product view
- [ ] 🔄 Updates reflected correctly

#### **Delete Product:**
- [ ] 🔄 Click "Delete" button
- [ ] 🔄 Confirmation dialog appears
- [ ] 🔄 Cancel button works (no deletion)
- [ ] 🔄 Confirm deletion works
- [ ] 🔄 Product removed from database
- [ ] 🔄 Redirects to products list
- [ ] 🔄 Product no longer in list

#### **Product Status Toggle:**
- [ ] 🔄 Click "Activate/Deactivate" button
- [ ] 🔄 Status toggles correctly
- [ ] 🔄 Database updates
- [ ] 🔄 Visual indicators update
- [ ] 🔄 Button text changes

### **4. Vendor Orders:**
- [ ] 🔄 Navigate to `/vendor/orders`
- [ ] 🔄 Orders list loads
- [ ] 🔄 Only vendor's orders shown
- [ ] 🔄 Order details display
- [ ] 🔄 Update order status works

### **5. Vendor Messages:**
- [ ] 🔄 Navigate to `/vendor/messages`
- [ ] 🔄 Messages list loads
- [ ] 🔄 View message details
- [ ] 🔄 Reply to messages works
- [ ] 🔄 Send new message works

### **6. Vendor Payouts:**
- [ ] 🔄 Navigate to `/vendor/payouts`
- [ ] 🔄 Earnings overview displays
- [ ] 🔄 Request payout works
- [ ] 🔄 Payout history shows

### **7. Vendor Settings:**
- [ ] 🔄 Navigate to `/vendor/settings`
- [ ] 🔄 Profile form loads
- [ ] 🔄 Update business information
- [ ] 🔄 Save settings works

### **8. Vendor Onboarding:**
- [ ] 🔄 Navigate to `/vendor/onboarding`
- [ ] 🔄 Onboarding form loads
- [ ] 🔄 Complete onboarding process
- [ ] 🔄 Form validation works
- [ ] 🔄 Submit application works

---

## 🔧 **INTEGRATION TESTING**

### **Admin-Vendor Interactions:**
- [ ] 🔄 Admin approves vendor → vendor can access dashboard
- [ ] 🔄 Admin rejects vendor → vendor gets notification
- [ ] 🔄 Admin edits vendor product → changes reflected
- [ ] 🔄 Admin sends message → vendor receives it

### **Order Flow:**
- [ ] 🔄 Create order → appears in admin orders
- [ ] 🔄 Create order → appears in vendor orders
- [ ] 🔄 Update order status → reflects everywhere
- [ ] 🔄 Order affects inventory → inventory decreases

### **File Uploads:**
- [ ] 🔄 Product image upload works
- [ ] 🔄 Images store correctly
- [ ] 🔄 Images display properly
- [ ] 🔄 Image deletion works

---

## 🚨 **CRITICAL BUGS TO WATCH FOR:**

### **Security Issues:**
- [ ] 🔄 Vendors can't access admin pages
- [ ] 🔄 Vendors can't edit other vendors' products
- [ ] 🔄 Authentication required for all protected pages
- [ ] 🔄 CSRF protection works

### **Data Integrity:**
- [ ] 🔄 Form validation prevents invalid data
- [ ] 🔄 Database constraints enforced
- [ ] 🔄 Relationships maintained properly
- [ ] 🔄 No orphaned records created

### **Performance Issues:**
- [ ] 🔄 Pages load quickly
- [ ] 🔄 Large product lists paginated
- [ ] 🔄 Image uploads don't timeout
- [ ] 🔄 Database queries optimized

---

## 📊 **TESTING RESULTS SUMMARY:**

### **Admin Dashboard:**
- Total Features: ___
- Working: ___
- Broken: ___
- Pass Rate: ___%

### **Vendor Dashboard:**
- Total Features: ___
- Working: ___
- Broken: ___
- Pass Rate: ___%

### **Overall System:**
- Total Features: ___
- Working: ___
- Broken: ___
- Pass Rate: ___%

---

## 🎯 **NEXT STEPS:**
1. [ ] Fix any broken features found
2. [ ] Implement missing functionality
3. [ ] Optimize performance issues
4. [ ] Enhance user experience
5. [ ] Add additional features

**🚀 Ready to test every single feature systematically!**
