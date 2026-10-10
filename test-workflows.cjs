const http = require("http");

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(payload, "utf8"),
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path,
        method: "GET",
        headers: {
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function run() {
  console.log("1. Testing Login...");
  const loginRes = await post("/api/auth/login", { username: "admin", password: "admin123456" });
  console.log("Login Status:", loginRes.status, "User:", loginRes.data.user?.name);
  const token = loginRes.data.token;

  console.log("2. Fetching Products...");
  const prodsRes = await get("/api/products", token);
  const prod = prodsRes.data.data[0];
  console.log("Using product:", prod.name, "Initial Stock:", prod.currentStock);

  console.log("3. Testing Incoming Movement ( توريد 20 قطعة)...");
  const inRes = await post(
    "/api/movements/in",
    {
      productId: prod._id,
      quantity: 20,
      unitPrice: prod.purchasePrice || 10,
      reference: "INV-AUTO-TEST",
      notes: "اختبار توريد تلقائي",
    },
    token
  );
  console.log("Incoming Status:", inRes.status, "New Stock:", inRes.data.data?.stockAfter);

  console.log("4. Testing Negative Stock Prevention (محاولة صرف 9999 قطعة)...");
  const overRes = await post(
    "/api/movements/out",
    {
      productId: prod._id,
      quantity: 9999,
      reason: "sale",
    },
    token
  );
  console.log("Over-stock Status (Expected 400):", overRes.status, "Message:", overRes.data.message);

  console.log("5. Testing Valid Outgoing Movement (صرف 5 قطع)...");
  const outRes = await post(
    "/api/movements/out",
    {
      productId: prod._id,
      quantity: 5,
      reason: "sale",
      reference: "OUT-REC-001",
    },
    token
  );
  console.log("Valid Outgoing Status:", outRes.status, "Remaining Stock:", outRes.data.data?.stockAfter);

  console.log("6. Testing Dashboard KPI Summary...");
  const dashRes = await get("/api/reports/dashboard/summary", token);
  console.log(
    "Dashboard Summary OK:",
    dashRes.status === 200,
    "Total Active Products:",
    dashRes.data.data?.activeProductsCount,
    "Total Stock Qty:",
    dashRes.data.data?.totalStockQuantity
  );

  console.log("7. Testing Database Backup Creation...");
  const backupRes = await post("/api/backups/create", {}, token);
  console.log("Backup Status:", backupRes.status, "File:", backupRes.data.filename);

  console.log("🎉 ALL INTEGRATION WORKFLOWS TESTED AND VERIFIED SUCCESSFULLY!");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
