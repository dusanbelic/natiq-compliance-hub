// ═══════════════════════════════════════════════════════════════════════════
// NatIQ Arabic Translations
// ═══════════════════════════════════════════════════════════════════════════

const AR_TRANSLATIONS: Record<string, string> = {
  // Navigation
  'Dashboard': 'لوحة التحكم',
  'Compliance Score': 'نقاط الامتثال',
  'Forecast': 'التوقعات',
  'Recommendations': 'التوصيات',
  'Employees': 'الموظفون',
  'Regulatory Monitor': 'مراقب التنظيمات',
  'Reports': 'التقارير',
  'Settings': 'الإعدادات',
  'Get Started': 'ابدأ الآن',
  'Notifications': 'الإشعارات',
  'Help & Support': 'المساعدة والدعم',
  'Sign Out': 'تسجيل الخروج',

  // Dashboard
  'Compliance Ratio': 'نسبة الامتثال',
  'National Employees': 'الموظفون المحليون',
  'Total Employees': 'إجمالي الموظفين',
  'Quota Gap to Fill': 'فجوة الحصة المطلوبة',
  'Overall Compliance Status': 'حالة الامتثال العامة',
  '90-Day Forecast': 'توقعات 90 يومًا',
  'View Full Forecast': 'عرض التوقعات الكاملة',
  'Recent Regulatory Changes': 'التغييرات التنظيمية الحديثة',
  'View All': 'عرض الكل',
  'Priority Actions': 'الإجراءات ذات الأولوية',
  'Headcount by Department': 'عدد الموظفين حسب القسم',
  'Compliance History': 'سجل الامتثال',
  'Entity Summary': 'ملخص الكيان',
  'Last calculated': 'آخر حساب',
  'Recalculate': 'إعادة الحساب',
  'View Recommendations': 'عرض التوصيات',

  // Compliance
  'Compliance by Department': 'الامتثال حسب القسم',

  // Forecast
  '90-Day Compliance Forecast': 'توقعات الامتثال لـ 90 يومًا',
  'Adjust Scenario': 'تعديل السيناريو',
  'Update Forecast': 'تحديث التوقعات',
  'Impact Summary': 'ملخص الأثر',

  // Employees
  'Add Employee': 'إضافة موظف',
  'Import CSV': 'استيراد CSV',
  'Search by name, department, nationality...': 'البحث بالاسم أو القسم أو الجنسية...',
  'All Nationalities': 'جميع الجنسيات',
  'Nationals Only': 'المحليون فقط',
  'Expats Only': 'الوافدون فقط',
  'All Departments': 'جميع الأقسام',
  'No employees found': 'لم يتم العثور على موظفين',
  'Delete Employee': 'حذف الموظف',

  // Recommendations
  'No recommendations': 'لا توجد توصيات',

  // Regulatory
  'All Countries': 'جميع الدول',
  'Alert Preferences': 'تفضيلات التنبيه',
  'Email Alerts': 'تنبيهات البريد الإلكتروني',
  'In-App Alerts': 'التنبيهات داخل التطبيق',
  'Upcoming Regulatory Dates': 'مواعيد تنظيمية قادمة',

  // Reports
  'Scheduled Reports': 'التقارير المجدولة',

  // Settings
  'Company Profile': 'ملف الشركة',
  'Team Members': 'أعضاء الفريق',
  'Integrations': 'التكاملات',
  'Billing & Plan': 'الفواتير والخطة',
  'Company Information': 'معلومات الشركة',
  'Entities': 'الكيانات',
  'Add Entity': 'إضافة كيان',

  // Notifications
  'Mark all read': 'تعيين الكل كمقروء',
  'All': 'الكل',
  'Alerts': 'التنبيهات',
  'Updates': 'التحديثات',
  'System': 'النظام',
  'New': 'جديد',
  'Earlier': 'سابقًا',
  "You're all caught up!": 'لا توجد إشعارات جديدة!',
  'No new notifications': 'لا توجد إشعارات جديدة',

  // Auth
  'Sign In': 'تسجيل الدخول',
  'Sign Up': 'إنشاء حساب',
  'Create Account': 'إنشاء حساب',
  'Email': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'Forgot Password?': 'نسيت كلمة المرور؟',
  'Reset Password': 'إعادة تعيين كلمة المرور',

  // Common
  'Loading...': 'جاري التحميل...',
  'Save Changes': 'حفظ التغييرات',
  'Cancel': 'إلغاء',
  'Delete': 'حذف',
  'Edit': 'تعديل',
  'Close': 'إغلاق',
  'Download': 'تنزيل',
  'Export': 'تصدير',
  'Name': 'الاسم',
  'Nationality': 'الجنسية',
  'Role': 'الدور',
  'Department': 'القسم',
  'Contract': 'العقد',
  'Quota': 'الحصة',
  'Actions': 'الإجراءات',
  'Status': 'الحالة',

  // AI Assistant
  'AI Compliance Assistant': 'مساعد الامتثال الذكي',
  'Ask about nationalization rules...': 'اسأل عن قواعد التوطين...',
};

export function translateToArabic(text: string): string {
  return AR_TRANSLATIONS[text] || text;
}
