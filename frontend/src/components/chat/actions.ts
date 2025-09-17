// chat/actions.ts

// اسنپ‌شات فیلترهای فعلی که همراه پیام برای n8n می‌فرستیم
export type FilterSnapshot = {
  country?: string;
  state?: string[];
  school?: string;
  degreeLevel?: string;
  areaOfStudy?: string[];
  program?: string[];
  orderBy?: string;
  searchQuery?: string;
};
export type UserProfile = {
  id?: string;
  name?: string;
  email?: string;
  locale?: string;
  roles?: string[];
  // هر چیز سبک/غیرحساس دیگری که لازم داری
  // مثلا:
  countryName?: string; // فقط نام، نه ID حساس
};

export type QuickReply = {
  label: string; // چیزی که روی دکمه نوشته می‌شود
  text?: string; // پیامی که باید به n8n ارسال شود (اگر ندهند = همان label)
};

// عملگرهای مخصوص فیلدهای چندانتخابی
export type MultiOp = {
  // جایگزینی کامل
  set?: string[];
  // تغییر وضعیت اعضا (اگر هست حذف، اگر نیست اضافه)
  toggle?: string[];
  // پاک‌کردن (کاملاً)
  clear?: boolean;
};

// پچ تغییر فیلتر که از n8n می‌گیریم و روی فیلترهای فعلی merge می‌کنیم
export type FilterPatch = {
  country?: string | null;
  state?: string[] | MultiOp | null;
  school?: string | null;
  degreeLevel?: string | null;
  areaOfStudy?: string[] | MultiOp | null;
  program?: string[] | MultiOp | null;
  orderBy?: string | null;
  // searchQuery?: string | null;
};

// پیام‌هایی که باید داخل چت (۱/۳) نمایش داده شوند
export type DisplayMessage = {
  content: string;
  format?: "plain" | "markdown";
  suggestions?: QuickReply[];
};

// انواع اکشن‌هایی که n8n برمی‌گرداند
export type DisplayInChatAction = {
  type: "DISPLAY_IN_CHAT";
  messages: DisplayMessage[];
};

export type ProposeFilterChangesAction = {
  type: "PROPOSE_FILTER_CHANGES";
  patch: FilterPatch;
  label?: string; // متن دکمه Apply
  explain?: string; // توضیح کوتاه روی کارت
};

export type UpdateFiltersAction = {
  type: "UPDATE_FILTERS";
  patch: FilterPatch;
  refetch?: boolean; // اگر true، بعد از merge باید fetch اجرا بشه
  announce?: string; // پیام کوتاه که داخل چت لاگ بشه
};

export type ToastAction = {
  type: "TOAST";
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
};

export type ChatAction =
  | DisplayInChatAction
  | ProposeFilterChangesAction
  | UpdateFiltersAction
  | ToastAction;

// بدنهٔ درخواست/پاسخ n8n
export type N8nRequest = {
  message: string;
  pageId: string;
  threadKey?: string;
  filters: FilterSnapshot; // فقط snapshot فیلترها؛ userPreferences نمی‌فرستیم
  meta?: Record<string, any>; // اختیاری (locale, timezone, userId, ...)
  user?: UserProfile;
};

export type N8nResponse = {
  actions: ChatAction[];
};
