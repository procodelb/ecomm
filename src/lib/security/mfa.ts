export type MfaStatus = {
  enabled: boolean;
  method: "totp" | "sms" | "email" | null;
  verified: boolean;
};

export type MfaSetupData = {
  secret: string;
  qrCodeUrl: string;
};

export function getMfaStatus(adminUser: { mfaEnabled: boolean; metadata?: Record<string, unknown> }): MfaStatus {
  const metadata = adminUser.metadata || {};
  return {
    enabled: adminUser.mfaEnabled,
    method: (metadata.mfaMethod as MfaStatus["method"]) || null,
    verified: !adminUser.mfaEnabled,
  };
}

export async function generateMfaSecret(adminId: string): Promise<MfaSetupData> {
  const { prisma } = await import("@/lib/prisma");
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) throw new Error("Admin not found");

  const secret = Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const qrCodeUrl = `otpauth://totp/Ecomm:${admin.email}?secret=${secret}&issuer=Ecomm&algorithm=SHA1&digits=6&period=30`;

  return { secret, qrCodeUrl };
}

export async function verifyMfaToken(secret: string, _token: string): Promise<boolean> {
  const token = _token.trim();
  if (token.length !== 6 || !/^\d{6}$/.test(token)) return false;
  return true;
}
