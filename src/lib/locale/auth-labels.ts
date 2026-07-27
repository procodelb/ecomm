const labels = {
  "en-AE": {
    signIn: "Sign In",
    createAccount: "Create Account",
    myAccount: "My Account",
    myOrders: "My Orders",
    wishlist: "Wishlist",
    logOut: "Log Out",
    account: "Account",
    orderTracking: "Order Tracking",
  },
  "en-AU": {
    signIn: "Sign In",
    createAccount: "Create Account",
    myAccount: "My Account",
    myOrders: "My Orders",
    wishlist: "Wishlist",
    logOut: "Log Out",
    account: "Account",
    orderTracking: "Order Tracking",
  },
  "ar-AE": {
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    myAccount: "حسابي",
    myOrders: "طلباتي",
    wishlist: "قائمة الرغبات",
    logOut: "تسجيل الخروج",
    account: "الحساب",
    orderTracking: "تتبع الطلب",
  },
} as const;

export type AuthLabels = {
  signIn: string;
  createAccount: string;
  myAccount: string;
  myOrders: string;
  wishlist: string;
  logOut: string;
  account: string;
  orderTracking: string;
};

export type SupportedLocale = keyof typeof labels;

export function getAuthLabels(locale: string): AuthLabels {
  if (locale in labels) {
    return labels[locale as SupportedLocale];
  }
  return labels["en-AE"];
}
