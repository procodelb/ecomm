const https = require('https');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: { ...options.headers },
    };
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data, url });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function followRedirects(url, options = {}, maxRedirects = 5) {
  let allCookies = [];
  let currentUrl = url;
  for (let i = 0; i < maxRedirects; i++) {
    const cookieHeader = allCookies.length > 0 ? allCookies.map(c => c.split(';')[0]).join('; ') : undefined;
    const res = await request(currentUrl, { ...options, headers: { ...options.headers, ...(cookieHeader ? { Cookie: cookieHeader } : {}) } });
    const setCookies = res.headers['set-cookie'] || [];
    for (const sc of setCookies) {
      const name = sc.split('=')[0];
      allCookies = allCookies.filter(c => !c.startsWith(name + '='));
      allCookies.push(sc.split(';')[0]);
    }
    if ([301, 302, 307, 308].includes(res.status) && res.headers.location) {
      currentUrl = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, currentUrl).href;
      continue;
    }
    return { ...res, cookies: allCookies, finalUrl: currentUrl };
  }
  return { status: 0, body: 'Too many redirects', cookies: allCookies };
}

async function postWithCookies(url, body, allCookies) {
  const cookieHeader = allCookies.map(c => c.split(';')[0]).join('; ');
  const csrfToken = allCookies.find(c => c.startsWith('csrf-token='))?.split('=')[1] || '';
  const data = JSON.stringify(body);
  return request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'x-csrf-token': csrfToken,
      'Cookie': cookieHeader,
    },
    body: data,
  });
}

async function main() {
  // Step 1: Get CSRF cookie via homepage (always 200)
  console.log('=== Step 1: Get CSRF cookie ===');
  const homeRes = await followRedirects('https://ecomm-beryl-mu.vercel.app/');
  console.log('Home status:', homeRes.status);
  const csrfToken = homeRes.cookies.find(c => c.startsWith('csrf-token='))?.split('=')[1];
  console.log('CSRF token:', csrfToken ? 'obtained (len=' + csrfToken.length + ')' : 'MISSING');

  if (!csrfToken) {
    console.log('FATAL: No CSRF token');
    process.exit(1);
  }

  // Step 2: POST checkout
  console.log('\n=== Step 2: POST /api/checkout (COD) ===');
  const checkoutRes = await postWithCookies('https://ecomm-beryl-mu.vercel.app/api/checkout', {
    items: [{
      id: "de5cf379-d20a-4a9d-9280-5b2e9638d624",
      productId: "de5cf379-d20a-4a9d-9280-5b2e9638d624",
      variantId: null,
      title: "Premium Inflatable Jet Ski",
      price: 18500,
      quantity: 1,
      image: null,
      variantTitle: null
    }],
    locale: "en-AE",
    currency: "AED",
    customerEmail: "e2e-test-" + Date.now() + "@ecomm-test.com",
    paymentMethod: "cash_on_delivery",
    successUrl: "https://ecomm-beryl-mu.vercel.app/en-AE/order/confirmation?order_id={ORDER_ID}",
    cancelUrl: "https://ecomm-beryl-mu.vercel.app/en-AE/checkout"
  }, homeRes.cookies);

  console.log('Status:', checkoutRes.status);
  let checkoutBody;
  try { checkoutBody = JSON.parse(checkoutRes.body); } catch { checkoutBody = checkoutRes.body; }
  console.log('Response:', JSON.stringify(checkoutBody, null, 2));

  if (checkoutRes.status === 200 && checkoutBody.orderId) {
    const orderId = checkoutBody.orderId;
    console.log('\n=== Step 3: Verify confirmation page ===');
    const confRes = await followRedirects(`https://ecomm-beryl-mu.vercel.app/en-AE/order/confirmation?order_id=${orderId}`);
    console.log('Confirmation status:', confRes.status);
    const hasUnpaid = confRes.body.includes('pending') || confRes.body.includes('Cash on Delivery') || confRes.body.includes('payment');
    console.log('Shows payment info:', hasUnpaid);
    const hasPaidClaim = confRes.body.includes('payment received') || confRes.body.includes('Payment received') || confRes.body.includes('paid');
    console.log('Falsely claims paid:', hasPaidClaim);

    console.log('\n=== Step 4: Verify order via public API ===');
    const orderRes = await followRedirects(`https://ecomm-beryl-mu.vercel.app/api/orders/${orderId}`);
    console.log('Order API status:', orderRes.status);
    if (orderRes.status === 200) {
      try {
        const orderData = JSON.parse(orderRes.body);
        console.log('paymentMethod:', orderData.paymentMethod);
        console.log('paymentStatus:', orderData.paymentStatus);
        console.log('status:', orderData.status);
        console.log('paymentIntentId:', orderData.paymentIntentId);
        console.log('amountPaid:', orderData.amountPaid);
        console.log('total:', orderData.total);
        console.log('currency:', orderData.currency);
      } catch {}
    }
  }

  // Security tests
  console.log('\n=== Security: POST without CSRF ===');
  const noCsrf = await request('https://ecomm-beryl-mu.vercel.app/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': 2 },
    body: '{}'
  });
  console.log('Status:', noCsrf.status, '(expect 403)');

  console.log('\n=== Security: Invalid payment method ===');
  const invMethod = await postWithCookies('https://ecomm-beryl-mu.vercel.app/api/checkout', {
    items: [{ id: "x", productId: "x", variantId: null, title: "T", price: 1, quantity: 1 }],
    locale: "en-AE", currency: "AED", customerEmail: "x@x.com", paymentMethod: "stripe",
    successUrl: "https://x.com/s", cancelUrl: "https://x.com/c"
  }, homeRes.cookies);
  console.log('Status:', invMethod.status, '(expect 400)');

  console.log('\n=== Security: Empty cart ===');
  const empty = await postWithCookies('https://ecomm-beryl-mu.vercel.app/api/checkout', {
    items: [], locale: "en-AE", currency: "AED", customerEmail: "x@x.com",
    paymentMethod: "cash_on_delivery", successUrl: "https://x.com/s", cancelUrl: "https://x.com/c"
  }, homeRes.cookies);
  console.log('Status:', empty.status, '(expect 400)');

  console.log('\n=== Security: No email ===');
  const noEmail = await postWithCookies('https://ecomm-beryl-mu.vercel.app/api/checkout', {
    items: [{ id: "de5cf379-d20a-4a9d-9280-5b2e9638d624", productId: "de5cf379-d20a-4a9d-9280-5b2e9638d624", variantId: null, title: "T", price: 1, quantity: 1 }],
    locale: "en-AE", currency: "AED", paymentMethod: "cash_on_delivery", successUrl: "https://x.com/s", cancelUrl: "https://x.com/c"
  }, homeRes.cookies);
  console.log('Status:', noEmail.status);
}

main().catch(e => console.error('FATAL:', e));
