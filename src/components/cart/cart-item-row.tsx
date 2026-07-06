"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  currencySymbol: string;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  currencySymbol,
}: CartItemRowProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground/30 font-heading text-2xl">
            ◈
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-heading text-sm font-semibold text-foreground truncate">
          {item.title}
        </h4>
        {item.variantTitle && (
          <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
        )}
        <p className="font-heading text-sm font-bold text-foreground">
          {currencySymbol}{item.price.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center gap-1 border border-border rounded-lg">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className={cn(
              "p-1.5 text-muted-foreground hover:text-foreground transition-colors",
              item.quantity <= 1 && "opacity-30 cursor-not-allowed",
            )}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-xs font-medium text-foreground tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
