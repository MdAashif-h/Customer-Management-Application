import fs from "fs";
import path from "path";

async function testHttp() {
  const baseUrl = "http://localhost:3001";
  console.log(`--- TESTING HTTP ENDPOINTS AT ${baseUrl} ---`);

  // 1. Unauthenticated checks
  for (const path of ["/dashboard", "/team-members", "/reports", "/activity"]) {
    const res = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    const isRedirectOrBlocked = res.status === 307 || res.status === 302 || res.status === 200;
    console.log(`Unauthenticated GET ${path} -> status ${res.status} (location: ${res.headers.get("location")})`);
  }

  // 2. Login check
  console.log("\nAttempting sign-in with Credentials...");
  
  // First fetch csrf token from NextAuth
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get("set-cookie") || ""];
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  console.log("Got CSRF token:", Boolean(csrfToken));

  const cookieHeader = csrfCookies.map(c => c.split(";")[0]).join("; ");

  // Post credentials
  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieHeader,
    },
    body: new URLSearchParams({
      email: "demo@custora.local",
      password: "CustoraDemoPass123!",
      csrfToken,
      redirect: "false",
      json: "true",
    }),
    redirect: "manual",
  });

  console.log("Login POST status:", loginRes.status);
  const loginCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
  const allCookies = [...csrfCookies, ...loginCookies].map(c => c.split(";")[0]).filter(Boolean).join("; ");
  console.log("Session cookies established:", Boolean(allCookies.includes("authjs.session-token") || allCookies.includes("__Secure-authjs.session-token") || allCookies.includes("next-auth.session-token")));

  // 3. Test authenticated endpoints
  const testRoutes = [
    { path: "/api/me", expectJson: true },
    { path: "/dashboard", checkHtml: "Good" },
    { path: "/activity", checkHtml: "Activity" },
    { path: "/reports", checkHtml: "Reports" },
    { path: "/reports?period=week", checkHtml: "Reports" },
    { path: "/reports?period=month", checkHtml: "Reports" },
    { path: "/team-members", checkHtml: "Team members" },
  ];

  for (const route of testRoutes) {
    const res = await fetch(`${baseUrl}${route.path}`, {
      headers: { "Cookie": allCookies },
    });
    console.log(`GET ${route.path} -> status: ${res.status}`);
    const text = await res.text();

    if (route.expectJson) {
      console.log(`  JSON response:`, text);
    } else if (route.checkHtml) {
      const containsCheck = text.includes(route.checkHtml);
      console.log(`  Contains "${route.checkHtml}": ${containsCheck} (HTML length: ${text.length})`);
      if (route.path === "/team-members") {
        console.log(`  Contains team member "Jamie": ${text.includes("Jamie")}`);
        console.log(`  Contains team member "Elena": ${text.includes("Elena")}`);
      }
      if (route.path === "/activity") {
        console.log(`  Contains "Customer created": ${text.includes("Customer created")}`);
      }
      if (route.path === "/dashboard") {
        console.log(`  Contains "Customer growth": ${text.includes("Customer growth")}`);
        console.log(`  Contains "Active customers": ${text.includes("Active customers")}`);
      }
    }
  }

  console.log("\n--- ALL HTTP ROUTE TESTS COMPLETED ---");
}

testHttp().catch(err => {
  console.error("HTTP test error:", err);
  process.exit(1);
});
