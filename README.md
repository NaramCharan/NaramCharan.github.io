#  Premium Apple-Inspired AI & ML Engineering Portfolio

An interactive, high-performance portfolio website built with modern front-end engineering practices and premium visuals. The design draws heavy inspiration from **Apple's minimalist typography-first layouts** combined with **Nothing Phone's signature hardware visual language** (monochrome palettes, glyph tracks, and dotted indicator accents).

---

## 🌟 Key Features & Core Interactions

### 1. Nothing Phone Glyph Theme Switcher
- Designed a custom **12-LED Nothing Glyph Circle** in vector SVG.
- Clicking the theme toggle triggers a clockwise sequential lighting animation (25ms steps), lighting up the circular track.
- Emits a final full-ring flash and lights up the bottom-center accent dot in **Nothing's signature red** before executing the theme reveal.

### 2. iOS-Style Circular Reveal View Transition
- Utilizes the modern web **View Transitions API** combined with custom CSS clip-paths.
- Theme switching light/dark states expand outwards as a circle centered exactly at the user's cursor click position, mirroring the fluid dark mode transition on iPhones.

### 3. Interactive Code & ML Pipeline Playground
- **ML Pipeline Flowchart**: Interactive flow diagram displaying the end-to-end pipeline stages for the *E-Commerce Customer Churn Prediction* engine. Users can hover over individual components to view real-time data flow details in an explanation panel.
- **Python Code Viewer**: Tabbed terminal component letting users seamlessly toggle between production Python scripts (`main.py`, `preprocessing.py`, `pipelines.py`, `models_optuna.py`) with syntax highlighting.
- **Collapsible Code Drawer ("Expand Review")**: Implemented a code split at the pipeline definition stage in `main.py`. The remaining training and tuning code is collapsed under a smooth fade-out gradient with an interactively toggled **"Expand Review"** button to maximize vertical screen efficiency.

### 4. Interactive Credentials & Certificate Previews
- Left-aligned custom brand vector logos (DeepLearning.AI, Google, IBM, University of Michigan) rendered natively inside cards.
- **Copy-to-Clipboard**: Copy verification IDs with animated tooltip success checks.
- **Digital Certificate Drawer**: Clicking a credential expands an authentic digital certificate preview showing Andrew Ng's signature, Stanford Online details, and certified verification badges.

### 5. Categorized Engineering Projects
- Grid items grouped by domain: **Deep Learning** (Blue), **Predictive Analytics** (Green/Emerald), **Data Engineering** (Purple), and **Churn Prediction** (Red).
- Hovering over cards projects smooth custom glowing drop shadows matching their category color.
- Highlight badges styled in premium green pills to showcase key results:
  * **Deep Learning Recommendation Engine**: `⚡ Sub-10ms retrieval with 32-dim embeddings — faster than most production systems`
  * **Titanic Survival Engine**: `🎯 85.5% accuracy — 12% above baseline, zero data leakage`
  * **Book Data Scraping & Database Pipeline**: `🚀 Scraped 980+ books in under 30 minutes — replacing days of manual collection`
  * **E-Commerce Customer Churn Prediction**: `🏆 98.28% accuracy, 94.76% F1 score — XGBoost selected for production`

---

## 🛠️ Built With

- **HTML5 & Vanilla Javascript**: Core structure and native interaction scripting.
- **Tailwind CSS**: A customized styling framework configuration extending custom color tokens like `apple-blue`, `apple-dark`, `apple-gray`, and standard Tailwind properties.
- **Canvas Particle Background**: A custom high-performance background canvas rendering responsive particles that attract/repel from the user's mouse coordinates and draw connect-lines.
- **Safe Storage Wrapper**: Integrated a `safeStorage` helper wrapping all `localStorage` calls in try-catch blocks to prevent security crashes when the page is opened directly from a local path via the `file://` protocol.

---

## 📁 File Structure

```text
├── index.html                  # Main application markup, custom styling overrides, and scripts
├── NARAM_RESUME.pdf            # Professional Resume asset for user download (1-page, black headings)
├── Professional Resume copy.pdf # Sync-copy of professional resume PDF
├── README.md                   # Project documentation
├── profile.jpg                 # Profile image asset
└── .gitignore                  # Git ignore configuration
```

---

## 🚀 Running the Project Locally

No build pipelines or installations are required to view the live site. You can run it locally in seconds:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NaramCharan/Portfolio-website.git
   cd Portfolio-website
   ```

2. **Open index.html**:
   - Simply double-click `index.html` in your file explorer to open it directly in any modern browser.
   - Alternatively, spin up a simple static HTTP server:
     - **Python**:
       ```bash
       python3 -m http.server 8000
       ```
     - **NodeJS**:
       ```bash
       npx serve
       ```

---

## 📬 Contact & Support

### Naram Charan
- **LinkedIn**: [in/naramcharan](https://www.linkedin.com/in/naramcharan/)
- **Email**: [charannaram1710@gmail.com](mailto:charannaram1710@gmail.com)

If you find this project useful or inspiring, consider giving the repository a ⭐ on GitHub!
