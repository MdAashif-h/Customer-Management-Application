import fs from "fs";

async function checkLogin() {
  const baseUrl = "http://localhost:3001";
  
  // 1. Get CSRF token
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const setCookie = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get("set-cookie") || ""];
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  console.log("CSRF Token:", csrfToken);
  console.log("CSRF Set-Cookie:", setCookie);

  // Extract cookies
  const cookieJar: Record<string, string> = {};
  for (const c of setCookie) {
    if (!c) continue;
    const [pair] = c.split(";");
    const [k, v] = pair.split("=");
    if (k && v) cookieJar[k.trim()] = v.trim();
  }

  const initialCookieStr = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");

  // 2. Submit credentials
  const body = new URLSearchParams();
  body.append("email", "demo@custora.local");
  body.append("password", "CustoraDemoPass123!");
  body.append("csrfToken", csrfToken);
  body.append("redirect", "false");
  body.append("json", "true");

  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": initialCookieStr,
    },
    body: body.toString(),
    redirect: "manual",
  });

  console.log("Login HTTP status:", loginRes.status);
  console.log("Login Location:", loginRes.headers.get("location"));
  const loginSetCookie = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
  console.log("Login Set-Cookie headers:", loginSetCookie);

  for (const c of loginSetCookie) {
    if (!c) continue;
    const [pair] = c.split(";");
    const [k, v] = pair.split("=");
    if (k && v) cookieJar[k.trim()] = v.trim();
  }

  const authCookieStr = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");
  console.log("Cookie jar keys:", Object.keys(cookieJar));

  // 3. Request /api/me
  const meRes = await fetch(`${baseUrl}/api/me`, {
    headers: { "Cookie": authCookieStr },
  });
  console.log("/api/me status:", meRes.status, "body:", await meRes.text());

  // 4. Request /team-members
  const teamRes = await fetch(`${baseUrl}/team-members`, {
    headers: { "Cookie": authCookieStr },
  });
  console.log("/team-members status:", teamRes.status);
  const teamHtml = await teamRes.text();
  console.log("team-members contains 'Jamie Sullivan':", teamHtml.includes("Jamie Sullivan"));
  console.log("team-members contains 'Elena Rostova':", teamHtml.includes("Elena Rostova"));
  console.log("team-members contains 'Marcus Chen':", teamHtml.includes("Marcus Chen"));

  // 5. Request /reports
  const repRes = await fetch(`${baseUrl}/reports`, {
    headers: { "Cookie": authCookieStr },
  });
  console.log("/reports status:", repRes.status);
  const repHtml = await repRes.text();
  console.log("reports contains 'Total customers':", repHtml.includes("Total customers"));
  console.log("reports contains 'Status breakdown':", repHtml.includes("Status breakdown"));
  console.log("reports contains 'Active':", repHtml.includes("Active"));

  // 6. Request /activity
  const actRes = await fetch(`${baseUrl}/activity`, {
    headers: { "Cookie": authCookieStr },
  });
  console.log("/activity status:", actRes.status);
  const actHtml = await actRes.text();
  console.log("activity contains 'Customer created':", actHtml.includes("Customer created"));
  console.log("activity contains 'Jamie Sullivan':", actHtml.includes("Jamie Sullivan"));

  // 7. Request /dashboard
  const dashRes = await fetch(`${baseUrl}/dashboard`, {
    headers: { "Cookie": authCookieStr },
  });
  console.log("/dashboard status:", dashRes.status);
  const dashHtml = await dashRes.text();
  console.log("dashboard contains 'Customer growth':", dashHtml.includes("Customer growth"));
  console.log("dashboard contains 'Total customers':", dashHtml.includes("Total customers"));
  console.log("dashboard contains 'Recent customers':", dashHtml.includes("Recent customers"));
}

checkLogin().catch(e => console.error("Error:", e));
