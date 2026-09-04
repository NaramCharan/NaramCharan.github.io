// The ML taxonomy rendered by <MLTree />.
//
// Models link to real projects by `projectIds`, resolved against `projects`
// in content.ts at render time — titles, metrics and repos are never
// duplicated here.
//
// HONESTY RULE: never attach a project to a model it didn't actually use.
// A model with no project is one of two things, and the distinction matters:
//   `foundation: true` — theory the branch stands on (RNN/LSTM are the problem
//     transformers solved). Deliberately project-free; never counted as a gap.
//   neither flag       — a genuine "know it, haven't shipped it" gap, shown
//     honestly with a hollow pip.

export type TreeModel = {
  id: string;
  label: string;
  /** Project ids from content.ts. Empty = studied, not yet shipped. */
  projectIds: string[];
  /** Optional one-liner shown when the node is opened. */
  note?: string;
  /** Work in progress — renders with a pulsing amber state. */
  wip?: boolean;
  /** Studied in theory rather than shipped — and shown as such on purpose.
   *  These trace the RNN → LSTM → attention line that today's models are
   *  built on, so they are never counted as missing projects. */
  foundation?: boolean;
  /** Scrolls to an element on this page instead of opening a project. */
  seeAlso?: { label: string; href: string };
};

export type TreeCategory = {
  id: string;
  label: string;
  caption: string;
  models: TreeModel[];
};

export type TreeBranch = {
  id: string;
  label: string;
  dataType: string;
  caption: string;
  categories: TreeCategory[];
};

export const ML_TREE: { root: string; branches: [TreeBranch, TreeBranch] } = {
  root: "MACHINE LEARNING",

  branches: [
    /* ── LEFT — tabular / traditional ML ───────────────────────────── */
    {
      id: "tabular",
      label: "TRADITIONAL ML",
      dataType: "TABULAR DATA",
      caption:
        "Rows and columns, engineered features. The model learns from structure you designed.",
      categories: [
        {
          id: "supervised",
          label: "SUPERVISED",
          caption: "Labelled targets — the answer exists in the training data.",
          models: [
            {
              id: "linreg",
              label: "Linear Regression",
              projectIds: ["walmart"],
              note: "Regression baseline on the Walmart forecast, before boosting took the win.",
            },
            {
              id: "logreg",
              label: "Logistic Regression",
              projectIds: ["churn"],
              note: "Baseline in both classification bake-offs.",
            },
            {
              id: "softmax",
              label: "Softmax Regression",
              projectIds: [],
              note: "Multi-class extension — not yet used in a shipped project.",
            },
            {
              id: "rf",
              label: "Random Forest",
              projectIds: ["walmart", "churn"],
              note: "Benchmarked against boosting in all three.",
            },
            {
              id: "xgboost",
              label: "XGBoost",
              projectIds: ["churn", "walmart"],
              note: "Shipped model for churn — chosen over a deeper net on compute.",
            },
            {
              id: "lightgbm",
              label: "LightGBM",
              projectIds: ["walmart"],
              note: "Won the forecasting bake-off at 95.55% R².",
            },
            {
              id: "mlp",
              label: "Neural Net (MLP)",
              projectIds: ["churn"],
              note: "4-hidden-layer PyTorch net — hit 98.76%, rejected on compute cost.",
            },
          ],
        },
        {
          id: "unsupervised",
          label: "UNSUPERVISED",
          caption: "No labels — the model finds the structure itself.",
          models: [
            {
              id: "clustering",
              label: "Clustering (k-Means)",
              projectIds: [],
              note: "On the roadmap.",
            },
            {
              id: "pca",
              label: "Dimensionality Reduction",
              projectIds: [],
              note: "On the roadmap.",
            },
            {
              id: "ncf",
              label: "Latent Embeddings",
              projectIds: ["recsys"],
              note:
                "32-dim user/item vectors learned from interaction data alone, served through a FAISS index.",
            },
          ],
        },
      ],
    },

    /* ── RIGHT — unstructured / deep learning ──────────────────────── */
    {
      id: "unstructured",
      label: "DEEP LEARNING",
      dataType: "UNSTRUCTURED DATA",
      caption:
        "Pixels, tokens, signals. The model learns the features instead of being handed them.",
      categories: [
        {
          id: "cnn",
          label: "COMPUTER VISION · CNN",
          caption: "Convolutions learn spatial features — edges, textures, structure.",
          models: [
            {
              id: "chestxray",
              label: "Pneumonia Detection · Chest X-Ray",
              projectIds: ["rsna"],
              note:
                "MK-05 — transfer learning over chest radiographs: DenseNet-121, EfficientNet-B2 and ResNet-34 benchmarked under one protocol, ResNet-34 fine-tuned shipping at 83% pneumonia recall. The features are learned from pixels rather than engineered by hand, and it's deployed — DICOM pipeline, FastAPI, React, one container on Azure.",
            },
          ],
        },
        {
          id: "sequential",
          label: "SEQUENTIAL MODELS",
          caption:
            "Order carries meaning — state is passed along the sequence. Studied in theory: these are the building blocks transformers were built to replace, and knowing exactly where they break is what makes attention make sense.",
          models: [
            {
              id: "rnn",
              label: "RNN",
              projectIds: [],
              foundation: true,
              note:
                "Studied in depth rather than shipped — and that is the point. It processes a sequence one step at a time, carrying a hidden state forward. Sequential by construction, which is exactly what caps its speed and its memory over long spans. Understanding that limit is what makes attention make sense.",
            },
            {
              id: "lstm",
              label: "LSTM / GRU",
              projectIds: [],
              foundation: true,
              note:
                "Gates let gradients survive far longer than a plain RNN — the fix that made sequence learning practical. Still strictly sequential, though: you cannot parallelise across time. That ceiling is exactly what the transformer was designed to break.",
            },
          ],
        },
        {
          id: "transformers",
          label: "TRANSFORMERS",
          caption:
            "Attention replaces recurrence — every position sees every other in one step. This is the architecture running inside ChatGPT, Gemini and Claude, and the reason the modern era of AI happened when it did.",
          models: [
            {
              id: "attention",
              label: "Self-Attention",
              projectIds: [],
              foundation: true,
              note:
                "The mechanism I studied to understand how modern models actually work. It drops recurrence entirely — every position attends to every other in a single step, so the whole sequence computes in parallel instead of one token at a time. That single change is what made training at today's scale possible.",
            },
            {
              id: "pretrained",
              label: "Pre-trained Transformers",
              projectIds: [],
              foundation: true,
              note:
                "Pre-train once on a huge corpus, adapt to the task afterwards. This is where the line ends: RNN → LSTM → attention → the models running in ChatGPT, Gemini and Claude today. Studied through the Deep Learning Specialization rather than built — the theory is the point here, not a repo.",
            },
          ],
        },
      ],
    },
  ],
};
