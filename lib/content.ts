// Single source of truth for all portfolio content.
// Authoritative source: NARAM_RESUME.pdf (June 2026).

import { RESUME_VERSION } from "./resumeVersion";

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
    "I train deep networks on medical images, build transformers from scratch to understand how they work, tune tree-based classifiers with hyperparameter optimization, and obsess over data-separation methodology so models hold up in production, not just on a leaderboard.",
  ],
  /* Content-hashed so a regenerated resume can't be served from a stale cache —
     GitHub Pages sends max-age=600 and phones hold downloaded PDFs far longer.
     The hash is stamped by scripts/make_resume.py on every build. */
  resume: `/NARAM_RESUME.pdf?v=${RESUME_VERSION}`,
};

// Personnel-file dossier — the hologram short-resume projected straight after
// the hero assembly. Pulls the rest of its fields from `profile`, `education`,
// `certifications` and `projects` so nothing is duplicated here.
export const dossier = {
  fileId: "NC-MK42-001",
  summary:
    "Third-year CS undergrad specializing in AI & Machine Learning. I build end-to-end ML systems — deep-learning models for medical imaging, gradient-boosted forecasters spanning thousands of parallel time series, and the data pipelines underneath them. Strong bias toward models that survive production, not just leaderboards.",
  identity: [
    { label: "DESIGNATION", value: "AI & Machine Learning Engineer" },
    { label: "BASE", value: "Gurugram, India" },
    { label: "AVAILABILITY", value: "Open to internships" },
  ],
  focus: [
    "Predictive modeling & forecasting",
    "Deep learning · computer vision",
    "Leakage-free validation methodology",
    "Directing AI coding agents",
  ],
  coreStack: [
    "Python",
    "PyTorch",
    "XGBoost",
    "LightGBM",
    "FastAPI",
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
  { value: 83, suffix: "%", label: "Pneumonia Recall" },
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
  /** Build window, e.g. "Aug 1 – Sep 4, 2026". Shown as a chip on the card
   *  and as a TIMELINE row in the FRIDAY brief. Optional: older projects
   *  predate the habit of recording it. */
  period?: string;
  domain: string; // scan-at-a-glance category
  metric: string; // one headline number, shown prominent
  description: string;
  tech: string[];
  wins: string[]; // key results, shown inline (not hover-gated)
  brief: { label: string; value: string }[]; // FRIDAY deep-dive readout
  evidence?: { src: string; alt: string; caption: string; source: string; width: number; height: number };
  caseStudy: { problem: string; contribution: string; approach: string; results: string; limitations: string };
  repo: string;
  demo?: string; // optional live demo / notebook
};

export const projects: Project[] = [
  {
    id: "scraper",
    caseStudy: {
      "problem": "Collect book information without repetitive manual entry.",
      "contribution": "Built the multi-page scraper, relational schema, and export pipeline.",
      "approach": "BeautifulSoup extracts book fields; SQLAlchemy stores records in SQLite for reusable CSV exports.",
      "results": "Collected 980+ books in under 30 minutes.",
      "limitations": "A site-specific learning pipeline; markup changes can require parser updates. The timing is one reported run, not a general throughput guarantee."
    },
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
    id: "churn",
    caseStudy: {
      "problem": "Identify customers likely to leave an e-commerce service.",
      "contribution": "Built preprocessing pipelines, tuned tree models, trained a PyTorch baseline, and compared model quality against compute cost.",
      "approach": "70/30 train-test split; preprocessing fit on training data only. Optuna tuning uses 10-fold stratified CV scored on recall.",
      "results": "XGBoost: 98.28% accuracy, 94.74% F1, 91.58% recall on the held-out test set. The neural network reached 98.76% accuracy, but XGBoost was selected for lighter inference.",
      "limitations": "One dataset and a single held-out split. XGBoost misses more churners than the neural network; threshold tuning remains future work. No live service is linked."
    },
    evidence: {
      "src": "/projects/churn-model-comparison.svg",
      "alt": "Held-out test F1 comparison: Random Forest 91.33%, XGBoost 94.74%, neural network 96.23%",
      "caption": "Test-set F1 · values from the project README",
      "source": "https://github.com/NaramCharan/ecommerce-customer-churn-prediction",
      "width": 640,
      "height": 300
    },
    code: "MK-02",
    name: "E-Commerce Customer Churn Prediction",
    domain: "Classification",
    metric: "98.28% acc",
    description:
      "Four-model churn system — Logistic Regression, Random Forest, XGBoost and a 4-hidden-layer PyTorch network. The deep net tops the leaderboard; XGBoost is selected anyway, because a half-point of accuracy doesn't buy a GPU bill.",
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
      { label: "DECISION", value: "The net edges XGBoost by <1 pt — not worth the compute. XGBoost is selected: near-instant scoring, no GPU, interpretable feature importances" },
      { label: "RESULT", value: "98.28% accuracy · 94.74% F1 · 91.58% recall — threshold tuning can recover most of the recall gap" },
    ],
  },
  {
    id: "walmart",
    caseStudy: {
      "problem": "Forecast weekly sales across thousands of store-department time series without leaking future sales into features.",
      "contribution": "Built the recursive walk-forward engine and feature pipeline; diagnosed temporal leakage and compared three tree models.",
      "approach": "Split by date before feature engineering. Forecast one week at a time, feeding predictions into subsequent lag and rolling features.",
      "results": "LightGBM: validation R² 0.9555 and RMSE 4,646.90 on weeks from 25 May 2012 onward.",
      "limitations": "Results describe the historical validation window, not unseen future retail conditions. Recursive forecasts can accumulate error; no live forecasting service is linked."
    },
    evidence: {
      "src": "/projects/walmart-validation.svg",
      "alt": "Published validation comparison of Random Forest, XGBoost and LightGBM for Walmart sales forecasting",
      "caption": "Published validation R² · bars start at zero",
      "source": "https://github.com/NaramCharan/Walmart-Store-Weekly-Sales-Forecasting",
      "width": 640,
      "height": 360
    },
    code: "MK-03",
    name: "Walmart Store Weekly Sales Forecasting",
    featured: true,
    domain: "Time-Series Forecasting",
    metric: "0.9555 validation R²",
    description:
      "Global multi-series forecasting across ~3,000 Walmart store-department pairs — one model learns them all, driven by a custom recursive walk-forward engine that feeds each week's predictions back in as the next week's lag features.",
    tech: ["Python", "LightGBM", "XGBoost", "Scikit-Learn", "Pandas"],
    repo: "https://github.com/NaramCharan/Walmart-Store-Weekly-Sales-Forecasting",
    wins: [
      "Validation R² 0.9555 — LightGBM beat XGBoost & Random Forest",
      "Recursive walk-forward engine built from scratch, no forecasting libs",
      "Caught & fixed temporal leakage masquerading as R² ≈ 0.98",
    ],
    brief: [
      { label: "OBJECTIVE", value: "Forecast weekly sales for 45 stores × 99 departments — one global model across ~3,000 series" },
      { label: "METHOD", value: "Custom recursive walk-forward engine: each week's predictions are injected back into the data to build the next week's lag & rolling features — real deployment conditions, simulated" },
      { label: "INTEGRITY", value: "Split by date first, features engineered on train only; rolling stats via shift(1) so the current week never leaks. An inflated R² ≈ 0.98 was diagnosed as leakage and killed" },
      { label: "MODELS", value: "LightGBM vs XGBoost vs Random Forest under identical leakage-free conditions; a 5-layer neural baseline tested and rejected on compute" },
      { label: "RESULT", value: "Validation R² 0.9555 · RMSE 4,647 with LightGBM on held-out weeks" },
    ],
  },
  {
    id: "rsna",
    caseStudy: {
      "problem": "Classify pneumonia on chest radiographs while accounting for class imbalance and patient overlap.",
      "contribution": "Built the ML pipeline and FastAPI backend. Directed an AI coding agent for the React interface and Azure deployment.",
      "approach": "Patient-level 70/24/6 split, weighted loss, and two-stage transfer learning. Compared three CNNs on validation, then evaluated the selected model once on the test set.",
      "results": "83% pneumonia recall, 75% precision, and 0.79 F1 on 1,836 held-out studies. A Docker container serves the interface and API on Azure.",
      "limitations": "Single dataset and split; no external hospital validation. About 17% of positive cases are missed and 25% of flags are false positives. Research demonstration, not a clinically validated diagnostic tool."
    },
    evidence: {
      "src": "/projects/rsna-interface.png",
      "alt": "RSNA application displaying the real radiograph for stored study Case_1",
      "caption": "Live application · stored study shown · 12 October 2026",
      "source": "https://github.com/NaramCharan/RSNA-Pneumonia-Detection",
      "width": 1440,
      "height": 1000
    },
    code: "MK-04",
    featured: true,
    name: "RSNA Pneumonia Detection",
    period: "Aug 1 – Sep 4, 2026",
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
      { label: "TIMELINE", value: "1 August – 4 September 2026 — from first DICOM read to a container answering requests on Azure" },
      { label: "OBJECTIVE", value: "Screen chest radiographs for pneumonia — triage which studies a radiologist reads first, on the RSNA Pneumonia Detection Challenge dataset (~30,000 DICOM studies)" },
      { label: "THE BUG", value: "A copied ImageNet pipeline ran RandomCrop(224) first on 1024×1024 radiographs — every training image was a random 4.8% patch still labelled 'pneumonia'. Deleting one line beat every architecture swap in the project combined" },
      { label: "INTEGRITY", value: "Split on unique patient IDs, never rows — the label file has one row per bounding box, so row-splitting puts the same patient in train and validation and inflates every metric silently. Test set (6%) evaluated exactly once, at the end" },
      { label: "IMBALANCE", value: "~70% negative, so the first unweighted model learned to say 'no'. Weighted CrossEntropyLoss reprices a missed pneumonia; scheduler and early stopping both watch F1, not accuracy" },
      { label: "MODELS", value: "DenseNet-121 vs EfficientNet-B2 vs ResNet-34, two-stage transfer learning under one protocol. ResNet-34 fine-tuned won on F1 (0.77 val) — DenseNet hit higher recall but at 0.67 precision" },
      { label: "RESULT", value: "83% recall · 75% precision · 0.79 F1 · 86% accuracy on the pneumonia class, against a 68% always-negative baseline" },
      { label: "SHIPPED", value: "FastAPI serves the React bundle and the API from one origin — no CORS, no second service. Priced the Postgres layer at $25.68/mo to store a 4KB CSV, deleted it, cut hosting 84%" },
      { label: "BUILD SPLIT", value: "The ML pipeline — dataset handling, transforms, training, evaluation, model selection — and the FastAPI backend are mine. The React frontend and the Azure deployment were built by an AI coding agent working to my instructions: I directed it, followed every step, and came out understanding the deployment path rather than just owning the output" },
    ],
  },
  {
    id: "transformer",
    caseStudy: {
      "problem": "Understand how tokenization and causal attention produce language-model predictions.",
      "contribution": "Implemented a small decoder-only Transformer and byte-level BPE tokenizer in PyTorch, following Karpathy’s lectures with credit.",
      "approach": "Character-level Shakespeare training: four blocks, four heads, 64-dimensional embeddings, and 5,000 training steps. Built and checked a separate lossless BPE tokenizer.",
      "results": "Approximately 0.21M parameters; training loss 1.66 and validation loss 1.82. Output resembles play formatting, with limited semantic coherence.",
      "limitations": "Learning project with a tiny context and model. The Transformer still reads characters; the separately built BPE tokenizer is not integrated into training."
    },
    code: "MK-05",
    name: "Handbuilt Transformer",
    domain: "Learning Project · NLP",
    // Real number from the README's training run (validation loss, 5,000
    // steps) — a learning project, so no accuracy-style claim is made.
    metric: "1.82 val loss",
    description:
      "A mini GPT and a mini GPT tokenizer, both built from scratch in PyTorch while learning how ChatGPT-style models work: a small decoder-only Transformer that writes Shakespeare-like text, and a GPT-2-style byte-level BPE tokenizer. A learning project I'm still extending.",
    tech: ["PyTorch", "Transformers", "BPE Tokenizer", "NLP"],
    repo: "https://github.com/NaramCharan/Handbuilt-Transformer",
    wins: [
      "~0.21M-param decoder-only GPT: loss 4.41 → 1.66 train, 1.82 validation",
      "GPT-2-style BPE tokenizer: regex chunking + byte-level merges, lossless round-trip",
      "Learning project, still growing — next up: train the GPT on BPE tokens",
    ],
    brief: [
      { label: "WHAT IT IS", value: "A learning project — a mini GPT and a mini GPT tokenizer, built by hand to understand the two halves of how ChatGPT works: a tokenizer turns text into numbers, a Transformer predicts what comes next. Not a production system" },
      { label: "PART 1 · GPT", value: "Decoder-only Transformer, character-level, trained on Shakespeare: 4 blocks, 4 attention heads, 64-dim embeddings, 32-character context, dropout 0.2, ~0.21M parameters. Each block has causal self-attention, a feed-forward network, LayerNorm and residual connections" },
      { label: "TRAINING", value: "5,000 steps, Adam at lr 0.001, batch 32. Loss fell from 4.41 to 1.66 on train and 1.82 on validation" },
      { label: "RESULT", value: "Writes text with the shape of a Shakespeare play — capitalised speaker names, short lines, punctuation, many real English words — though the meaning doesn't hold together. Expected for a tiny model that sees one character at a time" },
      { label: "PART 2 · TOKENIZER", value: "GPT-2-style byte-level BPE: the GPT-2 regex first splits text into chunks (so \"dog.\" and \"dog!\" share a \"dog\" token), each chunk becomes UTF-8 bytes, then the most frequent neighbouring pair is merged repeatedly — counted inside a chunk, never across chunks. encode() and decode() round-trip the original text exactly, and I compared it against OpenAI's tiktoken for GPT-2 and GPT-4" },
      { label: "LIMITS", value: "The Transformer still reads characters, not tokens from my tokenizer; the model is tiny; the tokenizer trained on one short article with a small vocabulary and uses the older GPT-2 split pattern, not GPT-4's" },
      { label: "NEXT", value: "Ongoing — upgrade to the GPT-4 split pattern, add special tokens like <|endoftext|>, train the Transformer on my BPE tokens instead of characters, then a bigger model on more data" },
      { label: "CREDIT", value: "Follows Andrej Karpathy's \"Let's build GPT\" and \"Let's build the GPT Tokenizer\" lectures and his minbpe repo; tokenizer trained on Nathan Reed's \"A Programmer's Introduction to Unicode\"" },
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
      "Transfer Learning · CNNs",
      "Transformers · Self-Attention",
      "BPE Tokenization",
      "Prompt Engineering",
    ],
    evidence: "MK-04 & MK-05 — ResNet-34 transfer learning on chest X-rays at 83% pneumonia recall; causal self-attention and a BPE tokenizer written by hand in PyTorch.",
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
    evidence: "MK-03 & MK-02 — LightGBM at 95.55% R² across ~3,000 series; XGBoost at 98.28% accuracy, tuned with Optuna.",
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
    evidence: "MK-03 — recursive walk-forward feature engine; diagnosed and killed the leakage inflating R² to 0.98.",
  },
  {
    system: "Engineering Core",
    icon: "engine",
    tag: "CORE",
    items: [
      "Python 3 · Advanced OOP",
      "Data Structures",
      "FastAPI · REST APIs",
      "SQL · Schema Design",
      "SQLAlchemy",
      "Docker · Azure",
      "Claude Code · Agentic Dev",
      "Git Workflow",
      "BeautifulSoup",
    ],
    evidence: "MK-04 — FastAPI serving a model and a React bundle from one container on Azure. This site itself — Next.js + WebGL, built by directing Claude Code.",
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

type Certification = {
  name: string;
  issuer: string;
  note: string;
  url: string;
  description?: string;
  kind?: "certificate";
};

// Link to a supplied certificate or the holder's real verification URL.
export const certifications: Certification[] = [
  {
    name: "Hugging Face LLM Course — Fundamentals of LLMs",
    issuer: "Hugging Face",
    note: "Chapter 1 completed · 18 Oct 2026",
    description: "Course focus: transformer internals, pretrained transformers, and fine-tuning.",
    url: "/certificates/hugging-face-llm-fundamentals.webp",
    kind: "certificate",
  },
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
  github: "https://github.com/NaramCharan",
  linkedin: "https://www.linkedin.com/in/naramcharan/",
  site: "https://naramcharan.me",
};

export const navLinks = [
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];
