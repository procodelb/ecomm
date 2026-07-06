"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import {
  Ruler,
  Weight,
  MapPin,
  FileText,
  AlertTriangle,
  Shield,
  Truck,
  RotateCcw,
  ClipboardCheck,
  Package,
  Award,
} from "lucide-react";
import type { ProductPageData } from "@/lib/api/product-page";

interface ProductDetailsProps {
  product: ProductPageData;
  className?: string;
}

const TABS = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "shipping", label: "Shipping" },
  { id: "warranty", label: "Warranty" },
  { id: "returns", label: "Returns" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductDetails({ product, className }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  const dims = product.dimensionsCm;

  const specItems = [
    { icon: FileText, label: "SKU", value: product.sku, show: !!product.sku },
    { icon: FileText, label: "Barcode", value: product.barcode, show: !!product.barcode },
    { icon: Weight, label: "Weight", value: product.weightKg ? `${product.weightKg} kg` : null, show: !!product.weightKg },
    { icon: Ruler, label: "Dimensions", value: dims ? [dims.length, dims.width, dims.height].filter(Boolean).map((d) => `${d} cm`).join(" × ") : null, show: !!(dims && (dims.length || dims.width || dims.height)) },
    { icon: Package, label: "Material", value: product.material, show: !!product.material },
    { icon: MapPin, label: "Origin", value: product.countryOfOrigin, show: !!product.countryOfOrigin },
    { icon: Award, label: "Age Rating", value: product.ageRating, show: !!product.ageRating },
    { icon: ClipboardCheck, label: "HS Code", value: product.hsCode, show: !!product.hsCode },
  ].filter((s) => s.show);

  return (
    <div className={cn("space-y-6 lg:space-y-8", className)}>
      {/* Tabs */}
      <div className="relative flex gap-0 border-b border-border overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 sm:px-6 py-3.5 text-sm font-heading font-medium whitespace-nowrap transition-colors duration-300",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground/60 hover:text-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[220px]">
        {activeTab === "description" && (
          <div className="space-y-5 max-w-3xl">
            {product.shortDescription && (
              <Text size="base" className="leading-relaxed text-foreground/85">
                {product.shortDescription}
              </Text>
            )}
            {product.warnings && (
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <span className="text-sm font-medium text-destructive block mb-0.5">Safety Notice</span>
                  <span className="text-sm text-muted-foreground">{product.warnings}</span>
                </div>
              </div>
            )}
            {product.certifications.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider">
                  Certifications
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, i) => (
                    <Badge key={i} variant="outline" dot>
                      {cert.customName || cert.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="max-w-3xl">
            {specItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border rounded-xl overflow-hidden">
                {specItems.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3.5 px-5 py-4",
                      i % 2 === 0 ? "sm:bg-white/[0.01]" : "sm:bg-transparent",
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-10 border border-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-[0.5625rem] tracking-wider uppercase text-muted-foreground/50 font-medium">
                        {item.label}
                      </span>
                      <span className="text-sm text-foreground block leading-tight">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text muted className="py-8">No specifications available for this product.</Text>
            )}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary-10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2.5">
                <span className="font-heading text-lg font-semibold text-foreground block">
                  White-Glove Delivery
                </span>
                <Text muted className="leading-relaxed text-sm">
                  {product.leadTime
                    ? `Estimated delivery within ${product.leadTime}.`
                    : "Free shipping on all orders within the region."}
                </Text>
                <ul className="space-y-1.5 text-sm text-muted-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Orders processed within 24 hours of payment confirmation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Real-time tracking provided once shipment is dispatched
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Certified technicians handle unboxing and setup at your location
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "warranty" && (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-gold-10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="h-5 w-5 text-gold" />
              </div>
              <div className="space-y-2.5">
                <span className="font-heading text-lg font-semibold text-foreground block">
                  Comprehensive Coverage
                </span>
                <Text muted className="leading-relaxed text-sm">
                  Every product comes with a comprehensive one-year warranty covering manufacturing
                  defects and premature failure under normal use conditions. Extended protection
                  plans are available at checkout.
                </Text>
                <ul className="space-y-1.5 text-sm text-muted-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="text-gold mt-1">•</span>
                    Covers parts and labor for manufacturing defects
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold mt-1">•</span>
                    Optional upgrade to 5-year extended warranty
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold mt-1">•</span>
                    Global support network for service and repairs
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "returns" && (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary-10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2.5">
                <span className="font-heading text-lg font-semibold text-foreground block">
                  30-Day Satisfaction Guarantee
                </span>
                <Text muted className="leading-relaxed text-sm">
                  You have 30 days from delivery to return your item for a full refund or exchange.
                  Items must be unused and in original packaging.
                </Text>
                <ul className="space-y-1.5 text-sm text-muted-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Free return shipping for defective or incorrect items
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Change-of-mind returns subject to a small restocking fee
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Refunds processed within 5–7 business days after inspection
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
