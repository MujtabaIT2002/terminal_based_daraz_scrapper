# 🛒 E-Commerce Product Scraper

A powerful web scraper built with Playwright that extracts product information from e-commerce websites like Amazon and Daraz. The scraper captures product titles, prices, ratings, reviews, and takes screenshots of search results.

## ✨ Features

- 🔍 Search products by title/keyword
- 📸 Automatic screenshot capture of search results
- 💾 Exports results to JSON format
- 🤖 Manual CAPTCHA/bot detection handling
- 🎯 Extracts top 5-10 products with detailed information
- 🔄 Multiple fallback selectors for reliability
- 📊 Clean terminal output with formatted results

## 🎯 Use Cases

- **Price Comparison**: Track product prices across different platforms
- **Market Research**: Analyze product ratings and reviews
- **Competitor Analysis**: Monitor competitor products and pricing
- **Deal Hunting**: Find the best deals by comparing multiple products
- **Product Monitoring**: Keep track of product availability and price changes
- **Data Collection**: Gather product data for analysis or machine learning projects

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Playwright** - Browser automation and web scraping
- **JavaScript (ES6+)** - Core programming language
- **File System (fs)** - Data storage and screenshot management

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🚀 Installation

1. Clone the repository:
```bash
git clone <https://github.com/MujtabaIT2002/terminal_based_daraz_scrappe>
cd terminal-scrapper
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

## 💻 Usage

### General syntax:
```bash
node Scrapper.js "your search query"
```

## 📂 Output

The scraper generates two types of output:

1. **Terminal Display**: Real-time formatted product information
2. **Screenshots**: Saved in `./screenshots/` folder
3. **JSON Files**: Saved in `./results/` folder (Daraz only)

### Example Terminal Output:
```
📦 Product #1
--------------------------------------------------------------------------------
Title:       Redragon K552 RGB Mechanical Gaming Keyboard
Price:       Rs. 8,999
Rating:      4.5 out of 5 stars
Reviews:     1,234
Link:        https://www.daraz.pk/products/...
--------------------------------------------------------------------------------
```

## 🤖 Handling Bot Detection

If the scraper encounters a CAPTCHA or bot detection:

1. The browser window will stay open
2. You'll see: `⚠️ CAPTCHA or bot detection detected!`
3. Manually solve the CAPTCHA in the browser
4. Press **Enter** in the terminal to continue

## 📁 Project Structure

```
terminal-scrapper/
├── Scrapper.js          # Main scraper script
├── screenshots/         # Auto-generated screenshots
├── results/            # JSON output files
├── package.json        # Project dependencies
└── README.md          # This file
```

## ⚙️ Configuration

You can modify the scraper behavior by editing these parameters in the code:

- **Number of products**: Change `Math.min(productElements.length, 5)` to extract more/fewer products
- **Timeout duration**: Adjust `timeout: 60000` values for slower connections
- **Screenshot settings**: Modify `fullPage: true` to capture only visible area

## ⚠️ Important Notes

- The scraper runs in **non-headless mode** to allow manual CAPTCHA solving
- Respect website terms of service and robots.txt
- Use reasonable delays between requests
- For educational and personal use only

## 🐛 Troubleshooting

**Browser opens but nothing happens:**
- Increase timeout values in the code
- Check your internet connection
- The website might be blocking automated access

**No products found:**
- Check the screenshot in `./screenshots/` folder
- The website layout may have changed
- Try a different search query

**CAPTCHA appears:**
- Solve it manually in the browser window
- Press Enter in terminal to continue
- Consider adding longer delays between requests

## 📝 License

This project is for educational purposes only. Use responsibly and respect website terms of service.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

Made with ❤️ for learning web scraping with Playwright
