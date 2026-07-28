/**
 * Test SMS sending via the Replit Twilio connector proxy.
 * Usage: node scripts/test-twilio-sms.mjs [phone_number]
 *
 * The connector proxy injects Twilio auth automatically — no env vars needed.
 */

import { ReplitConnectors } from "@replit/connectors-sdk";

const TO_NUMBER = process.argv[2] || "+212666711202";

async function main() {
  const connectors = new ReplitConnectors();

  // Step 1: get account info (to discover the Account SID)
  console.log("📡 Fetching Twilio account info via proxy...");
  const accountsRes = await connectors.proxy("twilio", "/2010-04-01/Accounts.json", {
    method: "GET",
  });

  if (!accountsRes.ok) {
    const err = await accountsRes.text();
    console.error(`❌ Failed to fetch accounts: ${accountsRes.status} ${err.slice(0, 400)}`);
    process.exit(1);
  }

  const accountsData = await accountsRes.json();
  const account = accountsData?.accounts?.[0];
  if (!account) {
    console.error("❌ No accounts found in response:", JSON.stringify(accountsData, null, 2));
    process.exit(1);
  }

  const accountSid = account.sid;
  const friendlyName = account.friendly_name;
  console.log(`✅ Account: ${friendlyName} (${accountSid})`);

  // Step 2: list phone numbers to find the sender
  console.log("\n📞 Fetching incoming phone numbers...");
  const numbersRes = await connectors.proxy(
    "twilio",
    `/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
    { method: "GET" }
  );

  let fromNumber = null;
  if (numbersRes.ok) {
    const numbersData = await numbersRes.json();
    const numbers = numbersData?.incoming_phone_numbers || [];
    if (numbers.length > 0) {
      fromNumber = numbers[0].phone_number;
      console.log(`✅ Found sender number: ${fromNumber}`);
      console.log(
        `   All numbers: ${numbers.map((n) => n.phone_number).join(", ")}`
      );
    } else {
      console.warn("⚠️  No incoming phone numbers found on this account");
    }
  } else {
    console.warn("⚠️  Could not list phone numbers:", numbersRes.status);
  }

  if (!fromNumber) {
    console.error(
      "❌ Cannot send SMS without a 'from' number. Add a Twilio phone number or set TWILIO_FROM_NUMBER."
    );
    process.exit(1);
  }

  // Step 3: send the test SMS
  console.log(`\n✉️  Sending test SMS from ${fromNumber} to ${TO_NUMBER}...`);
  const body = new URLSearchParams({
    To: TO_NUMBER,
    From: fromNumber,
    Body: "Test Jatek OTP: 123456 (ceci est un message de test)",
  });

  const sendRes = await connectors.proxy(
    "twilio",
    `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );

  const sendData = await sendRes.json();

  if (!sendRes.ok) {
    console.error(`❌ SMS send failed: ${sendRes.status}`);
    console.error(JSON.stringify(sendData, null, 2));
    process.exit(1);
  }

  console.log(`✅ SMS sent successfully!`);
  console.log(`   SID: ${sendData.sid}`);
  console.log(`   Status: ${sendData.status}`);
  console.log(`   To: ${sendData.to}`);
  console.log(`   From: ${sendData.from}`);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
