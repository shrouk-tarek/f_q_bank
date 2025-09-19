# إعداد SendGrid للفريق

## 📧 خطوات إعداد SendGrid

### 1. إنشاء حساب SendGrid
- اذهبي إلى [SendGrid.com](https://sendgrid.com)
- أنشئي حساب جديد (يوجد خطة مجانية تسمح بـ 100 إيميل يومياً)

### 2. إنشاء API Key
1. سجلي دخول إلى لوحة تحكم SendGrid
2. اذهبي إلى Settings > API Keys
3. اضغطي على "Create API Key"
4. اختاري "Full Access" أو "Restricted Access" مع صلاحيات Mail Send
5. انسخي الـ API Key (احتفظي به في مكان آمن)

### 3. التحقق من البريد الإلكتروني
1. اذهبي إلى Settings > Sender Authentication
2. اضغطي على "Verify a Single Sender"
3. أدخلي البريد الإلكتروني: `bquestion318@gmail.com`
4. املأي البيانات المطلوبة
5. تحققي من البريد الإلكتروني واضغطي على رابط التأكيد

### 4. تحديث ملف .env
```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM=bquestion318@gmail.com
```

### 5. اختبار الإعداد
```bash
node test-sendgrid.js
```

## 🔄 التبديل بين Nodemailer و SendGrid

الكود الحالي يدعم SendGrid، لكن يمكن التبديل بسهولة:

### للإنتاج (Production): استخدمي SendGrid
```env
SENDGRID_API_KEY=your_key
SENDGRID_FROM=your_verified_email
```

### للتطوير المحلي: يمكن استخدام Nodemailer
```env
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
```

## 📝 ملاحظات مهمة

1. **SendGrid مجاني**: 100 إيميل يومياً في الخطة المجانية
2. **يعمل على جميع الأجهزة**: لا يحتاج إعدادات خاصة بالجهاز
3. **موثوق للإنتاج**: معدل تسليم عالي
4. **سهل المشاركة**: فقط API Key واحد للفريق كامل

## 🚀 بعد الإعداد

ستعمل ميزة استعادة كلمة المرور على:
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`