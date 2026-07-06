import "server-only";
import type { SupplierAdapter, SupplierAdapterClass } from "./base-adapter";
import { AlibabaAdapter } from "./adapters/alibaba";
import { MadeInChinaAdapter } from "./adapters/made-in-china";
import { OneSixEightEightAdapter } from "./adapters/one-six-eight-eight";
import { AliExpressAdapter } from "./adapters/aliexpress";
import { CJDropshippingAdapter } from "./adapters/cj-dropshipping";
import { PrivateFactoryAdapter } from "./adapters/private-factory";
import { OemPartnerAdapter } from "./adapters/oem-partner";

const adapterClasses: SupplierAdapterClass[] = [
  AlibabaAdapter,
  MadeInChinaAdapter,
  OneSixEightEightAdapter,
  AliExpressAdapter,
  CJDropshippingAdapter,
  PrivateFactoryAdapter,
  OemPartnerAdapter,
];

const instances = new Map<string, SupplierAdapter>();

function getAdapter(code: string): SupplierAdapter | null {
  const key = code.toLowerCase();
  if (instances.has(key)) return instances.get(key)!;

  for (const Cls of adapterClasses) {
    const instance = new Cls();
    if (instance.code.toLowerCase() === key) {
      instances.set(key, instance);
      return instance;
    }
  }
  return null;
}

export function getAdapterForSupplier(supplierCode: string): SupplierAdapter | null {
  return getAdapter(supplierCode);
}

export function getAllAdapters(): SupplierAdapter[] {
  if (instances.size === 0) {
    for (const Cls of adapterClasses) {
      const instance = new Cls();
      if (!instances.has(instance.code.toLowerCase())) {
        instances.set(instance.code.toLowerCase(), instance);
      }
    }
  }
  return Array.from(instances.values());
}

export { SupplierAdapter };
