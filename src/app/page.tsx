import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

export default async function RootPage() {
  const h = await headers();
  const acceptLanguage = h.get("accept-language") || "";
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = cookieLocale || (acceptLanguage.startsWith("ar") ? "ar-AE" : "en-AE");
  redirect(`/${locale}`);
}
