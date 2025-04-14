import puppeteer from "puppeteer";

const redirectUri = "https://127.0.0.1:3001/token";
const takeScreenshots = true;

// Load from .env file
const clientId = Bun.env.CLIENT_ID;
const clientSecret = Bun.env.CLIENT_SECRET;

export async function automateLogin() {
  if (!Bun.env.SCHWAB_USERNAME || !Bun.env.SCHWAB_PASSWORD) {
    throw new Error("SCHWAB_USERNAME and SCHWAB_PASSWORD must be set");
  }

  const browser = await puppeteer.launch({
    headless: false, // May need to set to false in the future to avoid automation dectection
    acceptInsecureCerts: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled", // To make automation less detectable
      "--ignore-certificate-errors", // Ignore all certificate errors
      "--disable-web-security", // Optionally disable web security
      "--disable-features=SecureDNS,EnableDNSOverHTTPS", // Disable Secure DNS and DNS-over-HTTPS
    ],
  });

  const page = await browser.newPage();

  // Set user agent to avoid detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    // Go to the OAuth authorization URL
    await page.goto(
      `https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id=${clientId}&scope=readonly&redirect_uri=${redirectUri}`,
      { waitUntil: "load" }
    );

    // Conditionally take a screenshot after loading the page
    if (takeScreenshots) await page.screenshot({ path: "login-page.png" });
    console.log("Navigation to login page successful.");

    // Wait for the login ID input field to be visible
    await page.waitForSelector("#loginIdInput", { visible: true });
    console.log("Login ID input is visible.");

    // Wait for the password input field to be visible
    await page.waitForSelector("#passwordInput", { visible: true });
    console.log("Password input is visible.");

    // Fill in the login ID with a slower typing speed
    await page.type("#loginIdInput", Bun.env.SCHWAB_USERNAME, {
      delay: 100,
    }); // Replace with your actual login ID
    console.log("Login ID entered.");

    // Fill in the password with a slower typing speed
    await page.type("#passwordInput", Bun.env.SCHWAB_PASSWORD, {
      delay: 100,
    }); // Replace with your actual password
    console.log("Password entered.");

    // Conditionally take a screenshot after filling in the form
    if (takeScreenshots) await page.screenshot({ path: "filled-form.png" });

    // Click the login button
    await page.click("#btnLogin");
    console.log("Login button clicked.");

    // Wait for navigation to the terms acceptance page
    await page.waitForNavigation({ waitUntil: "load" });
    console.log("Navigation to terms page successful.");

    // Conditionally take a screenshot after navigating to the terms page
    if (takeScreenshots) await page.screenshot({ path: "terms-page.png" });

    // Wait for the terms checkbox to be visible
    await page.waitForSelector("#acceptTerms", {
      visible: true,
      timeout: 100000,
    });
    console.log("Terms checkbox is visible.");

    // Check the terms checkbox
    await page.click("#acceptTerms");
    console.log("Terms checkbox clicked.");

    // Conditionally take a screenshot after checking the checkbox
    if (takeScreenshots) await page.screenshot({ path: "terms-checkbox.png" });

    // Click the "Continue" button
    await page.click("#submit-btn");
    console.log("Continue button clicked.");

    // Wait for the modal dialog to appear
    await page.waitForSelector("#agree-modal-btn-", { visible: true });
    console.log("Modal dialog is visible.");

    // Conditionally take a screenshot of the modal
    if (takeScreenshots) await page.screenshot({ path: "modal-dialog.png" });

    // Click the "Accept" button in the modal
    await page.click("#agree-modal-btn-");
    console.log("Modal 'Accept' button clicked.");

    // Wait for navigation to the accounts page
    await page.waitForNavigation({ waitUntil: "load" });
    console.log("Navigation to accounts page successful.");

    // Wait for checkbox's to appear
    await page.waitForSelector("input[type='checkbox']", { visible: true });

    // Conditionally take a screenshot after navigating to accounts page
    if (takeScreenshots) await page.screenshot({ path: "accounts-page.png" });

    // Make sure all accounts are checked (if they aren't by default)
    const accountsChecked = await page.$eval(
      "input[type='checkbox']",
      (checkbox) => checkbox.checked
    );
    if (!accountsChecked) {
      await page.click("input[type='checkbox']");
      console.log("Account checkbox clicked.");
    } else {
      console.log("Account checkbox was already checked.");
    }

    // Conditionally take a screenshot after ensuring accounts are checked
    if (takeScreenshots)
      await page.screenshot({ path: "accounts-checked.png" });

    // Click the "Continue" button on the accounts page
    await page.click("#submit-btn");
    console.log("Continue button clicked on accounts page.");

    // Wait for navigation to the confirmation page
    await page.waitForNavigation({ waitUntil: "load" });
    console.log("Navigation to confirmation page successful.");

    // Conditionally take a screenshot after navigating to the confirmation page
    if (takeScreenshots)
      await page.screenshot({ path: "confirmation-page.png" });

    // Click the "Done" button on the confirmation page
    await page.click("#cancel-btn");
    console.log("Done button clicked.");

    // Wait for the final redirect to your HTTPS server
    await page.waitForNavigation({ waitUntil: "load" });
    console.log("Redirect to HTTPS server successful.");

    // Conditionally take a screenshot after the final redirect
    if (takeScreenshots) await page.screenshot({ path: "final-redirect.png" });

    console.log("Puppeteer automation completed.");
  } catch (error) {
    console.error("Error during automation:", error);
  } finally {
    await browser.close();
  }
}
