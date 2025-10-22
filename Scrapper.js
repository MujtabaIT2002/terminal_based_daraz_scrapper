const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

class DarazScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log("🚀 Launching browser...");
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 100,
    });

    const context = await this.browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
    });

    this.page = await context.newPage();
  }

  async searchProduct(productTitle) {
    try {
      console.log(`\n🔍 Searching for: "${productTitle}" on Daraz\n`);

      await this.page.goto("https://www.daraz.pk/", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Wait for search box with multiple selectors
      try {
        await this.page.waitForSelector("input#q", { timeout: 10000 });
        await this.page.fill("input#q", productTitle);
      } catch (e) {
        console.log("⚠️ Trying alternative search selector...");
        await this.page.waitForSelector('input[type="search"]', { timeout: 10000 });
        await this.page.fill('input[type="search"]', productTitle);
      }

      await this.page.keyboard.press("Enter");

      console.log("⏳ Waiting for search results...");
      await this.page.waitForLoadState("domcontentloaded", { timeout: 60000 });
      await this.page.waitForTimeout(4000); // Give more time to load

      // Take screenshot
      const screenshotDir = path.join(__dirname, "screenshots");
      if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

      const timestamp = Date.now();
      const screenshotPath = path.join(
        screenshotDir,
        `${productTitle.replace(/[^a-z0-9]/gi, "_")}_${timestamp}.png`
      );

      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

      // Extract products
      const products = await this.extractProducts();

      return { products, screenshotPath };
    } catch (error) {
      console.error("❌ Error during search:", error.message);
      throw error;
    }
  }

  async extractProducts() {
    const products = [];

    try {
      console.log("🔎 Looking for products...");

      await this.page.waitForTimeout(2000);

      // Try multiple selectors (Daraz uses dynamic class names)
      let productElements = [];
      
      // Method 1: Look for data-qa-locator attribute
      console.log("📋 Trying data-qa-locator selector...");
      productElements = await this.page.$$('[data-qa-locator="product-item"]');
      console.log(`   Found: ${productElements.length} products`);

      // Method 2: Look for common parent divs
      if (productElements.length === 0) {
        console.log("📋 Trying gridItem class pattern...");
        productElements = await this.page.$$('[class*="gridItem"]');
        console.log(`   Found: ${productElements.length} products`);
      }

      // Method 3: Look for product cards
      if (productElements.length === 0) {
        console.log("📋 Trying buTCk selector...");
        productElements = await this.page.$$('.buTCk');
        console.log(`   Found: ${productElements.length} products`);
      }

      // Method 4: Generic approach - find all links with specific structure
      if (productElements.length === 0) {
        console.log("📋 Trying generic product card selector...");
        productElements = await this.page.$$('div[class*="Bm3ON"] > div');
        console.log(`   Found: ${productElements.length} products`);
      }

      // Method 5: Last resort - all divs containing product info
      if (productElements.length === 0) {
        console.log("📋 Trying broad selector...");
        const allLinks = await this.page.$$('a[href*="/products/"]');
        
        // Get parent containers
        for (const link of allLinks.slice(0, 10)) {
          const parent = await link.evaluateHandle(el => el.closest('div[class*="grid"]') || el.parentElement);
          if (parent) productElements.push(parent);
        }
        console.log(`   Found: ${productElements.length} products`);
      }

      if (productElements.length === 0) {
        console.log("❌ No products found with any selector.");
        console.log("💡 Check the screenshot to see what Daraz is showing.");
        
        // Debug info
        const url = this.page.url();
        console.log(`🔗 Current URL: ${url}`);
        
        return products;
      }

      console.log(`\n✅ Found ${productElements.length} products total\n`);
      console.log("=".repeat(80));

      // Extract data from first 10 products
      for (let i = 0; i < Math.min(productElements.length, 10); i++) {
        const element = productElements[i];

        try {
          // Extract title - try multiple selectors
          let title = "N/A";
          const titleSelectors = [
            '[class*="title"]',
            '.title',
            'div[class*="name"]',
            '[data-qa-locator="product-name"]',
            'a[title]'
          ];

          for (const selector of titleSelectors) {
            try {
              const el = await element.$(selector);
              if (el) {
                const text = await el.textContent();
                if (text && text.trim().length > 5) {
                  title = text.trim();
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }

          // If still no title, try getting from link title attribute
          if (title === "N/A") {
            try {
              const link = await element.$('a');
              if (link) {
                title = await link.getAttribute('title') || 'N/A';
              }
            } catch (e) {}
          }

          // Extract price
          let price = "N/A";
          const priceSelectors = [
            '[class*="price"]',
            '.price',
            'span[class*="currency"]',
            '[class*="ooOxS"]'
          ];

          for (const selector of priceSelectors) {
            try {
              const el = await element.$(selector);
              if (el) {
                const text = await el.textContent();
                if (text && (text.includes('Rs') || text.includes('₨') || /\d/.test(text))) {
                  price = text.trim();
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }

          // Extract rating
          let rating = "N/A";
          const ratingSelectors = [
            '[class*="rating"]',
            '.rating',
            'i[class*="star"]',
            '[class*="ratig"]'
          ];

          for (const selector of ratingSelectors) {
            try {
              const el = await element.$(selector);
              if (el) {
                const text = await el.textContent();
                if (text && text.trim().length > 0) {
                  rating = text.trim();
                  break;
                }
              }
            } catch (e) {
              continue;
            }
          }

          // Extract link
          let link = "N/A";
          try {
            const linkEl = await element.$('a');
            if (linkEl) {
              const href = await linkEl.getAttribute('href');
              if (href) {
                link = href.startsWith('http') ? href : `https://www.daraz.pk${href}`;
              }
            }
          } catch (e) {}

          // Skip if no valid data
          if (title === "N/A" && price === "N/A" && link === "N/A") {
            console.log(`⏭️  Skipping item #${i + 1} (no valid data)`);
            continue;
          }

          const product = { title, price, rating, link };
          products.push(product);

          console.log(`\n📦 Product #${products.length}`);
          console.log("-".repeat(80));
          console.log(`Title:   ${title}`);
          console.log(`Price:   ${price}`);
          console.log(`Rating:  ${rating}`);
          console.log(`Link:    ${link}`);
          console.log("-".repeat(80));

          if (products.length >= 10) break;

        } catch (error) {
          console.log(`⚠️  Error extracting product #${i + 1}: ${error.message}`);
        }
      }

      console.log("\n" + "=".repeat(80) + "\n");
    } catch (error) {
      console.error("❌ Error extracting products:", error.message);
    }

    return products;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("👋 Browser closed");
    }
  }
}

async function main() {
  const scraper = new DarazScraper();

  try {
    await scraper.init();
    const productTitle = process.argv[2] || "wireless mouse";
    const results = await scraper.searchProduct(productTitle);

    console.log(`\n✅ Scraping completed! Found ${results.products.length} products`);
    console.log(`📸 Screenshot: ${results.screenshotPath}\n`);

    // Save results to JSON file
    const resultsDir = path.join(__dirname, "results");
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

    const filePath = path.join(
      resultsDir,
      `${productTitle.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(results.products, null, 2), "utf-8");
    console.log(`💾 Results saved to: ${filePath}`);

    await new Promise((resolve) => setTimeout(resolve, 5000));
  } catch (error) {
    console.error("❌ Fatal error:", error);
  } finally {
    await scraper.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = DarazScraper;