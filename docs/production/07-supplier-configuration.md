# Supplier Adapter Configuration Guide

## Overview
The platform supports 7 suppliers through a universal adapter system. Each supplier requires different connection methods and credentials.

## Adapter Types

### 1. Alibaba (ALIBABA)
- **Type**: REST API via Alibaba Open Platform
- **Auth**: App Key + App Secret (OAuth 2.0)
- **Setup**:
  1. Register at https://developer.alibaba.com
  2. Create an application → Get App Key and App Secret
  3. Configure OAuth redirect URI to `https://[your-domain.com]/api/supplier/alibaba/callback`
  4. Request API permissions: Product Listing, Order Management, Logistics
  5. Add credentials to DB:
     ```sql
     UPDATE "Supplier" SET
       credentials = '{"apiKey": "your_app_key", "apiSecret": "your_app_secret"}',
       config = '{"rateLimit": 10, "currency": "USD"}'
     WHERE code = 'ALIBABA';
     ```
- **Sync Capabilities**: Products, Orders, Tracking
- **Rate Limit**: 10 requests/second (basic), 100/second (premium)

### 2. Made-in-China (MADE_IN_CHINA)
- **Type**: REST API
- **Auth**: API Key + API Secret
- **Setup**:
  1. Register at https://developer.made-in-china.com
  2. Apply for API access → Get API Key and Secret
  3. Configure IP whitelist to your server IPs
  4. Add credentials to DB:
     ```sql
     UPDATE "Supplier" SET
       credentials = '{"apiKey": "your_api_key", "apiSecret": "your_api_secret"}',
       config = '{"rateLimit": 30, "currency": "USD"}'
     WHERE code = 'MADE_IN_CHINA';
     ```
- **Sync Capabilities**: Products, Orders
- **Rate Limit**: 30 requests/minute

### 3. 1688.com (1688)
- **Type**: REST API (Alibaba Group)
- **Auth**: App Key + App Secret (Chinese mainland account required)
- **Setup**:
  1. Register at https://open.1688.com (Chinese account required)
  2. Create application → Get App Key and Secret
  3. Note: 1688 uses RMB (CNY) pricing
  4. Add credentials to DB:
     ```sql
     UPDATE "Supplier" SET
       credentials = '{"appKey": "your_app_key", "appSecret": "your_app_secret"}',
       config = '{"rateLimit": 20, "currency": "CNY"}'
     WHERE code = '1688';
     ```
- **Sync Capabilities**: Products
- **Note**: Requires Chinese business license for full API access

### 4. AliExpress (ALIEXPRESS)
- **Type**: AliExpress Affiliate API + Dropshipper API
- **Auth**: App Key + Tracking ID
- **Setup**:
  1. Register at https://developers.aliexpress.com
  2. Create application → Get App Key
  3. Create Tracking ID in AliExpress Affiliate portal
  4. Add credentials to DB:
     ```sql
     UPDATE "Supplier" SET
       credentials = '{"appKey": "your_app_key", "trackingId": "your_tracking_id"}',
       config = '{"rateLimit": 10, "currency": "USD"}'
     WHERE code = 'ALIEXPRESS';
     ```
- **Sync Capabilities**: Products (via affiliate feed), Orders (limited)
- **Note**: Best for testing — easy API access, but lower margins

### 5. CJ Dropshipping (CJ_DROPSHIPPING)
- **Type**: CJ API
- **Auth**: CJ API Key (from CJ account)
- **Setup**:
  1. Register at https://cjdropshipping.com
  2. Go to Developer Center → Get API Key
  3. Configure webhook URL: `https://[your-domain.com]/api/webhooks/cj`
  4. Add credentials to DB:
     ```sql
     UPDATE "Supplier" SET
       credentials = '{"apiKey": "your_cj_api_key"}',
       config = '{"rateLimit": 60, "currency": "USD"}'
     WHERE code = 'CJ_DROPSHIPPING';
     ```
- **Sync Capabilities**: Products, Orders, Tracking (full)
- **Rate Limit**: 60 requests/minute
- **Note**: Best for automation — supports product import, order placement, and tracking

### 6. Private Factory (PRIVATE_FACTORY)
- **Type**: Custom API or manual CSV/email integration
- **Auth**: Varies by agreement
- **Setup**:
  1. Establish agreement with factory
  2. Determine integration method: API, SFTP, or email
  3. Add credentials to DB:
     ```sql
     UPDATE "Supplier" SET
       credentials = '{"apiEndpoint": "https://factory.example.com/api", "apiKey": "custom_key"}',
       config = '{"deliveryLeadTime": 30, "currency": "USD"}'
     WHERE code = 'PRIVATE_FACTORY';
     ```
- **Sync Capabilities**: Configurable
- **Note**: Requires custom integration per factory

### 7. OEM Partner (OEM_PARTNER)
- **Type**: Custom API
- **Auth**: Varies by partner
- **Setup**:
  1. Finalize OEM agreement
  2. Establish API or communication channel
  3. Add credentials to DB:
     ```sql
     UPDATE "Supplier" SET
       credentials = '{"apiEndpoint": "https://partner.example.com/api", "apiKey": "partner_key"}',
       config = '{"minimumOrderQuantity": 100, "currency": "USD"}'
     WHERE code = 'OEM_PARTNER';
     ```
- **Sync Capabilities**: Configurable
- **Note**: Requires custom integration per OEM partner

## Database Supplier Configuration

All supplier credentials are stored in the `Supplier` model:

```sql
-- View current suppliers
SELECT id, name, code, status, credentials, config FROM "Supplier";

-- Enable a supplier
UPDATE "Supplier" SET status = 'active' WHERE code = 'ALIEXPRESS';

-- Disable a supplier
UPDATE "Supplier" SET status = 'inactive' WHERE code = '1688';
```

## Sync Configuration

### Cron Schedule
- **Frequency**: Every 30 minutes
- **Methods**: Supabase pg_cron (primary) + Vercel Cron (fallback)
- **What syncs**: Products (prices, stock), Orders (status, tracking), Tracking numbers

### Manual Sync
```bash
# Trigger full sync
curl -X POST https://[your-domain.com]/api/sync/suppliers \
  -H "x-cron-secret: YOUR_CRON_SECRET"

# Check sync status
curl https://[your-domain.com]/api/sync/suppliers
```

## Testing

### Before Configuring Any Supplier
- `POST /api/sync/suppliers` returns no errors (graceful skip for unconfigured suppliers)
- Admin Sync page shows status for each supplier

### After Configuring a Supplier
1. Set credentials in DB
2. Set supplier status to `active`
3. Trigger manual sync via admin panel or API
4. Check `supplier_logs` table for sync results
5. Verify products appear in admin inventory
6. Test order placement with supplier-stocked product
7. Verify tracking number syncs to customer order

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Sync fails with 401 | Invalid API key/secret | Regenerate credentials at supplier portal |
| Products not syncing | Supplier not active in DB | Check `Supplier.status = 'active'` |
| Orders not syncing | API permissions missing | Request Order Management scope |
| Rate limit errors | Too many requests | Increase sync interval or upgrade API tier |
| Empty product list | No matching products | Check supplier catalog filters |
| Order placement fails | Out of stock | Check inventory sync | 

## Relevant Files
- `src/lib/supplier/` — All supplier adapters
- `src/lib/supplier/types.ts` — Supplier types
- `src/lib/supplier/base-adapter.ts` — Base adapter class
- `src/lib/supplier/registry.ts` — Supplier registry
- `src/app/api/sync/suppliers/route.ts` — Sync API endpoint
- `src/app/api/admin/sync/route.ts` — Admin sync trigger
