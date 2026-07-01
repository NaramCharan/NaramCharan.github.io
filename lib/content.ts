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
    "It started with a man in a metal suit and an AI named JARVIS. The obsession was never the armor — it was the intelligence behind it.",
    "I'm a 3rd-year CS student specializing in AI & Machine Learning, focused on end-to-end data pipelines, predictive modeling, and scalable systems — not notebook exercises.",
    "I build recommendation architectures with deep learning and vector-index search, tune tree-based classifiers with hyperparameter optimization, and obsess over data-separation methodology so models hold up in production, not just on a leaderboard.",
  ],
  resume: "/NARAM_RESUME.pdf",
};

export const stats = [
  { value: 98.28, suffix: "%", label: "Churn Model Accuracy" },
  { value: 95.5, suffix: "%", label: "Walmart Validation R²" },
  { value: 10, prefix: "<", suffix: "ms", label: "FAISS Retrieval Speed" },
  { value: 8.7, suffix: "", label: "Current CGPA · /10" },
];

export type Project = {
  id: string;
  code: string;
  name: string;
  featured?: boolean;
  domain: string; // scan-at-a-glance category
  metric: string; // one headline number, shown prominent
  description: string;
  tech: string[];
  wins: string[]; // key results, shown inline (not hover-gated)
  repo: string;
  demo?: string; // optional live demo / notebook
};

export const projects: Project[] = [
  {
    id: "walmart",
    code: "MK-01",
    name: "Walmart Store Weekly Sales Forecasting",
    featured: true,
    domain: "Time-Series Forecasting",
    metric: "95.5% R²",
    description:
      "Global multi-series forecasting pipeline predicting weekly sales across many store-department combinations, with a custom recursive walk-forward inference system built from scratch.",
    tech: ["Python", "Scikit-Learn", "XGBoost", "LightGBM", "Pandas"],
    repo: "https://github.com/NaramCharan/Walmart-Store-Weekly-Sales-Forecasting",
    wins: [
      "95.5% validation R² with an optimized Random Forest",
      "Custom recursive walk-forward inference, built from scratch",
      "Zero temporal leakage — split before feature extraction",
    ],
  },
  {
    id: "churn",
    code: "MK-02",
    name: "E-Commerce Customer Churn Prediction",
    domain: "Classification",
    metric: "98.28% acc",
    description:
      "End-to-end classification pipeline using ColumnTransformer with hybrid KNN / simple-value imputation to clean, scale and encode customer data — leakage-safe throughout.",
    tech: ["Scikit-Learn", "XGBoost", "Optuna"],
    repo: "https://github.com/NaramCharan/ecommerce-customer-churn-prediction",
    wins: [
      "98.28% accuracy · 94.76% F1 on production XGBoost",
      "Tuned with Optuna over 10-fold Stratified CV",
      "ColumnTransformer + hybrid KNN imputation",
    ],
  },
  {
    id: "recsys",
    code: "MK-03",
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
  },
  {
    id: "scraper",
    code: "MK-04",
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
  },
  {
    id: "titanic",
    code: "MK-05",
    name: "Titanic Survival Prediction Engine",
    domain: "Classification",
    metric: "85.5% acc",
    description:
      "End-to-end classification comparing Logistic Regression, Random Forest and XGBoost with KNN imputation and disciplined, leakage-free validation.",
    tech: ["Scikit-Learn", "XGBoost", "Optuna", "KNNImputer"],
    repo: "https://github.com/NaramCharan/Titanic-Survival-Engine-Predictive-Analysis",
    wins: [
      "85.5% accuracy — 12% above baseline",
      "LogReg vs Random Forest vs XGBoost bake-off",
      "KNN imputation, leakage-free validation",
    ],
  },
];

export type SkillSystem = {
  system: string;
  icon: "brain" | "circuit" | "data" | "engine";
  tag: string;
  items: string[];
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
  },
  {
    system: "Machine Learning",
    icon: "circuit",
    tag: "MODELS",
    items: [
      "XGBoost",
      "Random Forest",
      "Logistic Regression",
      "Scikit-Learn",
      "Optuna",
      "Classification Models",
    ],
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
  },
];

export const education = {
  degree: "B.Tech Computer Science Engineering",
  specialization: "Artificial Intelligence & Machine Learning",
  school: "GD Goenka University, Gurugram",
  year: "3rd Year",
  graduation: "Expected May 2028",
  cgpa: "8.7 / 10.0",
};

// `url` = the holder's real credential verification link.
export const certifications = [
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
