// Single source of truth for all portfolio content.
// Authoritative source: NARAM_RESUME.pdf (June 2026).

export const profile = {
  name: "Naram Charan",
  fullName: "Naramreddy Charan Kumar Reddy",
  tagline: "I teach machines to predict things.",
  role: "AI & Machine Learning Engineer",
  status: "3rd-year CS · AI & ML · Open to internships",
  location: "Gurugram, India",
  about: [
    "It started with a man in a suit of armor — the coolest hero I'd ever seen. But my interest went past the armor, to the AI he talked to. Because you know what was even cooler than the suit? His AI.",
    "I'm a 3rd-year CS student specializing in AI & Machine Learning, focused on end-to-end data pipelines, predictive modeling, and scalable systems — not notebook exercises.",
    "I build recommendation architectures with deep learning and vector-index search, tune tree-based classifiers with hyperparameter optimization, and obsess over data-separation methodology so models hold up in production, not just on a leaderboard.",
  ],
  resume: "/NARAM_RESUME.pdf",
};

// Personnel-file dossier — the hologram short-resume projected straight after
// the hero assembly. Pulls the rest of its fields from `profile`, `education`,
// `certifications` and `projects` so nothing is duplicated here.
export const dossier = {
  fileId: "NC-MK42-001",
  summary:
    "Third-year CS undergrad specializing in AI & Machine Learning. I build end-to-end ML systems — recommendation architectures on learned embeddings, gradient-boosted forecasters spanning thousands of parallel time series, and the data pipelines underneath them. Strong bias toward models that survive production, not just leaderboards.",
  identity: [
    { label: "DESIGNATION", value: "AI & Machine Learning Engineer" },
    { label: "BASE", value: "Gurugram, India" },
    { label: "AVAILABILITY", value: "Open to internships" },
  ],
  focus: [
    "Predictive modeling & forecasting",
    "Recommender systems · vector retrieval",
    "Leakage-free validation methodology",
  ],
  coreStack: [
    "Python",
    "PyTorch",
    "XGBoost",
    "LightGBM",
    "FAISS",
    "Scikit-Learn",
    "Pandas",
    "SQL",
  ],
  /** The three that go on the paper resume, by id — resolved against
   *  `projects` at render so the codes, metrics and links can never drift. */
  selectedProjectIds: ["rsna", "walmart", "churn"],
};

export const stats = [
  { value: 98.28, suffix: "%", label: "Churn Model Accuracy" },
  { value: 95.55, suffix: "%", label: "Walmart Validation R²" },
  { value: 10, prefix: "<", suffix: "ms", label: "FAISS Retrieval Speed" },
  { value: 8.98, suffix: "", label: "CGPA Average · /10" },
];

export type Project = {
  id: string;
  code: string;
  name: string;
  featured?: boolean;
  /** Still being built — renders with an IN PROGRESS marker instead of a
   *  headline metric and no results block. Never put `wins` on a wip
   *  project; there are no results to claim yet. */
  wip?: boolean;
  domain: string; // scan-at-a-glance category
  metric: string; // one headline number, shown prominent
  description: string;
  tech: string[];
  wins: string[]; // key results, shown inline (not hover-gated)
  brief: { label: string; value: string }[]; // FRIDAY deep-dive readout
  repo: string;
  demo?: string; // optional live demo / notebook
};

export const projects: Project[] = [
  {
    id: "scraper",
    code: "MK-01",
    name: "Book Data Scraping & Database Pipeline",
    domain: "Data Engineering",
    metric: "980+ in <30 min",
    description:
      "Automated multi-page scraper using BeautifulSoup + SQLAlchemy ORM, extracting structured data (title, price, rating, availability, description, URL) into a relational schema.",
    tech: ["BeautifulSoup", "SQLAlchemy", "SQLite", "Pandas"],
    repo: "https://github.com/NaramCharan/Book-webscrapper",
    wins: [
      "980+ books scraped in under 30 minutes",
      "BeautifulSoup + SQLAlchemy ORM pipeline",
      "Relational SQLite schema + clean CSV exports",
    ],
    brief: [
      { label: "OBJECTIVE", value: "Replace days of manual data collection with an automated pipeline" },
      { label: "SCRAPER", value: "Automated multi-page crawler using BeautifulSoup" },
      { label: "FIELDS", value: "Title, price, rating, availability, description & URL per book" },
      { label: "STORAGE", value: "Relational SQLite schema via SQLAlchemy ORM + clean CSV exports" },
      { label: "OUTPUT", value: "ML-ready datasets for downstream modelling" },
      { label: "RESULT", value: "980+ books scraped in under 30 minutes" },
    ],
  },
  {
    id: "recsys",
    code: "MK-02",
    name: "Neural Collaborative Filtering Architecture",
    domain: "Recommender Systems",
    metric: "<10ms retrieval",
    description:
      "Custom recommendation engine training 32-dimensional latent embedding vectors on sparse user-item interaction data with L2 regularization, built from scratch in PyTorch.",
    tech: ["PyTorch", "FAISS"],
    repo: "https://github.com/NaramCharan/Collaborative_Filtering_Recommendation_system",
    wins: [
      "Sub-10ms FAISS similarity search at inference",
      "32-dim latent embeddings with L2 regularization",
      "Meta's FAISS index for real-time retrieval",
    ],
    brief: [
      { label: "OBJECTIVE", value: "Recommend items from sparse user-item interaction data" },
      { label: "ARCHITECTURE", value: "Neural collaborative filtering, built from scratch in PyTorch" },
      { label: "EMBEDDINGS", value: "32-dimensional latent vectors trained with L2 regularization" },
      { label: "RETRIEVAL", value: "Meta's FAISS index over item embeddings for real-time nearest-neighbour search" },
      { label: "RESULT", value: "Sub-10ms similarity search at inference" },
    ],
  },
  {
    id: "churn",
    code: "MK-03",
    name: "E-Commerce Customer Churn Prediction",
    domain: "Classification",
    metric: "98.28% acc",
    description:
      "Four-model churn system — Logistic Regression, Random Forest, XGBoost and a 4-hidden-layer PyTorch network. The deep net tops the leaderboard; XGBoost ships anyway, because a half-point of accuracy doesn't buy a GPU bill.",
    tech: ["XGBoost", "PyTorch", "Scikit-Learn", "Optuna"],
    repo: "https://github.com/NaramCharan/ecommerce-customer-churn-prediction",
    wins: [
      "98.28% accuracy · 94.74% F1 on the held-out test set",
      "PyTorch net hit 98.76% — rejected: marginal gain, heavy compute",
      "Optuna over 10-fold Stratified CV, scored on recall",
    ],
    brief: [
      { label: "OBJECTIVE", value: "Flag churners before they leave — recall-sensitive: a missed churner walks away undetected" },
      { label: "PIPELINE", value: "Reusable ColumnTransformer pipelines fit on train only — imputers, scalers & encoders never see test-set statistics" },
      { label: "MODELS", value: "LogReg vs Random Forest vs XGBoost vs a 4-hidden-layer PyTorch net (BatchNorm, inverted dropout 0.5→0.2, Kaiming init)" },
      { label: "TUNING", value: "Optuna over 10-fold Stratified CV scored on recall; imbalance handled via class weights / scale_pos_weight" },
      { label: "DECISION", value: "The net edges XGBoost by <1 pt — not worth the compute. XGBoost ships: near-instant scoring, no GPU, interpretable feature importances" },
      { label: "RESULT", value: "98.28% accuracy · 94.74% F1 · 91.58% recall — threshold tuning can recover most of the recall gap" },
    ],
  },
  {
    id: "walmart",
    code: "MK-04",
    name: "Walmart Store Weekly Sales Forecasting",
    featured: true,
    domain: "Time-Series Forecasting",
    metric: "95.55% R²",
    description:
      "Global multi-series forecasting across ~3,000 Walmart store-department pairs — one model learns them all, driven by a custom recursive walk-forward engine that feeds each week's predictions back in as the next week's lag features.",
    tech: ["Python", "LightGBM", "XGBoost", "Scikit-Learn", "Pandas"],
    repo: "https://github.com/NaramCharan/Walmart-Store-Weekly-Sales-Forecasting",
    wins: [
      "95.55% validation R² — LightGBM beat XGBoost & Random Forest",
      "Recursive walk-forward engine built from scratch, no forecasting libs",
      "Caught & fixed temporal leakage masquerading as R² ≈ 0.98",
    ],
    brief: [
      { label: "OBJECTIVE", value: "Forecast weekly sales for 45 stores × 99 departments — one global model across ~3,000 series" },
      { label: "METHOD", value: "Custom recursive walk-forward engine: each week's predictions are injected back into the data to build the next week's lag & rolling features — real deployment conditions, simulated" },
      { label: "INTEGRITY", value: "Split by date first, features engineered on train only; rolling stats via shift(1) so the current week never leaks. An inflated R² ≈ 0.98 was diagnosed as leakage and killed" },
      { label: "MODELS", value: "LightGBM vs XGBoost vs Random Forest under identical leakage-free conditions; a 5-layer neural baseline tested and rejected on compute" },
      { label: "RESULT", value: "95.55% validation R² · RMSE 4,647 with LightGBM on held-out weeks" },
    ],
  },
  {
    id: "rsna",
    code: "MK-05",
    featured: true,
    name: "RSNA Pneumonia Detection",
    domain: "Medical Imaging · Deployed",
    // Recall, not accuracy: ~70% of studies are negative, so a model that
    // always says "no" scores 68% and catches nothing. Recall is the number
    // that describes whether this finds pneumonia.
    metric: "83% recall",
    description:
      "Pneumonia screening on chest radiographs — transfer learning across three CNNs on the RSNA challenge dataset, then shipped: DICOM pipeline, FastAPI service, React interface, one Docker container live on Azure.",
    tech: ["PyTorch", "pydicom", "FastAPI", "React", "Docker", "Azure"],
    repo: "https://github.com/NaramCharan/RSNA-Pneumonia-Detection",
    demo: "https://rsna-app.salmonmeadow-7644e67e.eastasia.azurecontainerapps.io",
    wins: [
      "83% pneumonia recall · 0.79 F1 on 1,836 held-out studies",
      "Found RandomCrop discarding 95% of every 1024² X-ray — the single biggest fix",
      "Live on Azure: one container serves API + UI at $5.06/month",
    ],
    brief: [
      { label: "OBJECTIVE", value: "Screen chest radiographs for pneumonia — triage which studies a radiologist reads first, on the RSNA Pneumonia Detection Challenge dataset (~30,000 DICOM studies)" },
      { label: "THE BUG", value: "A copied ImageNet pipeline ran RandomCrop(224) first on 1024×1024 radiographs — every training image was a random 4.8% patch still labelled 'pneumonia'. Deleting one line beat every architecture swap in the project combined" },
      { label: "INTEGRITY", value: "Split on unique patient IDs, never rows — the label file has one row per bounding box, so row-splitting puts the same patient in train and validation and inflates every metric silently. Test set (6%) evaluated exactly once, at the end" },
      { label: "IMBALANCE", value: "~70% negative, so the first unweighted model learned to say 'no'. Weighted CrossEntropyLoss reprices a missed pneumonia; scheduler and early stopping both watch F1, not accuracy" },
      { label: "MODELS", value: "DenseNet-121 vs EfficientNet-B2 vs ResNet-34, two-stage transfer learning under one protocol. ResNet-34 fine-tuned won on F1 (0.77 val) — DenseNet hit higher recall but at 0.67 precision" },
      { label: "RESULT", value: "83% recall · 75% precision · 0.79 F1 · 86% accuracy on the pneumonia class, against a 68% always-negative baseline" },
      { label: "SHIPPED", value: "FastAPI serves the React bundle and the API from one origin — no CORS, no second service. Priced the Postgres layer at $25.68/mo to store a 4KB CSV, deleted it, cut hosting 84%" },
    ],
  },
];

export type SkillSystem = {
  system: string;
  icon: "brain" | "circuit" | "data" | "engine";
  tag: string;
  items: string[];
  // Where this system was actually used — turns the card from a word cloud
  // into an index back into the project work.
  evidence: string;
};

export const skillSystems: SkillSystem[] = [
  {
    system: "Deep Learning & GenAI",
    icon: "brain",
    tag: "NEURAL",
    items: [
      "PyTorch",
      "Neural Collaborative Filtering",
      "Vector Embeddings",
      "FAISS Similarity Search",
      "Prompt Engineering",
    ],
    evidence: "MK-03 — neural collaborative filtering built from scratch, 32-dim embeddings, FAISS L2 retrieval under 10ms.",
  },
  {
    system: "Machine Learning",
    icon: "circuit",
    tag: "MODELS",
    items: [
      "XGBoost",
      "LightGBM",
      "Random Forest",
      "Logistic Regression",
      "Scikit-Learn",
      "Optuna",
    ],
    evidence: "MK-05 & MK-04 — LightGBM at 95.55% R² across ~3,000 series; XGBoost at 98.28% accuracy, tuned with Optuna.",
  },
  {
    system: "Data Intelligence",
    icon: "data",
    tag: "SIGNALS",
    items: [
      "Pandas",
      "NumPy",
      "Feature Engineering",
      "KNNImputer",
      "Imbalance Handling",
      "RobustScaler",
    ],
    evidence: "MK-05 — recursive walk-forward feature engine; diagnosed and killed the leakage inflating R² to 0.98.",
  },
  {
    system: "Engineering Core",
    icon: "engine",
    tag: "CORE",
    items: [
      "Python 3 · Advanced OOP",
      "Data Structures",
      "SQL · Schema Design",
      "SQLAlchemy",
      "Git Workflow",
      "BeautifulSoup",
    ],
    evidence: "MK-01 — BeautifulSoup crawler into a SQLAlchemy schema, 980+ records in under 30 minutes.",
  },
];

export const education = {
  degree: "B.Tech Computer Science Engineering",
  specialization: "Artificial Intelligence & Machine Learning",
  school: "GD Goenka University, Gurugram",
  year: "3rd Year",
  graduation: "Expected May 2028",
  cgpa: "8.98 / 10.0",
};

// `url` = the holder's real credential verification link.
export const certifications = [
  {
    name: "Deep Learning Specialization",
    issuer: "DeepLearning.AI",
    note: "Jul 2026",
    url: "https://learn.deeplearning.ai/certificates/07716d58-daf9-4806-80a5-cfdac044a258?usp=sharing",
  },
  {
    name: "Claude Code: A Highly Agentic Coding Assistant",
    issuer: "DeepLearning.AI · Anthropic",
    note: "Jul 2026",
    url: "https://learn.deeplearning.ai/accomplishments/1aa0da77-0c19-49ac-a36f-3652f5d9bab9?usp=sharing",
  },
  {
    name: "Machine Learning Specialization",
    issuer: "DeepLearning.AI · Stanford University",
    note: "May 2026",
    url: "https://learn.deeplearning.ai/certificates/d6a3b687-26ba-4937-9e18-abbb3ce46570?usp=sharing",
  },
  {
    name: "Databases & SQL for Data Science with Python",
    issuer: "IBM · Coursera",
    note: "Nov 2025",
    url: "https://www.coursera.org/account/accomplishments/verify/YY9BFB88ZGTY",
  },
  {
    name: "Python for Everybody Specialization",
    issuer: "University of Michigan · Coursera",
    note: "Mar 2025",
    url: "https://www.coursera.org/account/accomplishments/specialization/9SMN49FA2C57",
  },
  {
    name: "Prompt Engineering & Generative AI",
    issuer: "Google · Vanderbilt University",
    note: "Mar 2025",
    url: "https://www.coursera.org/account/accomplishments/verify/G8SCN6OHEXWR",
  },
];

export const contact = {
  email: "charannaram1710@gmail.com",
  phone: "+91 99662 14989",
  github: "https://github.com/NaramCharan",
  linkedin: "https://www.linkedin.com/in/naramcharan/",
  whatsapp: "https://wa.me/919966214989",
  site: "https://naramcharan.me",
};

export const navLinks = [
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Systems" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];
