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
  /** Conceptual groundwork rather than a portfolio gap. These exist to show
   *  the lineage — the sequence models are the problem transformers solved —
   *  so they are never counted as missing projects. */
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
              projectIds: ["churn", "titanic"],
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
              projectIds: ["walmart", "churn", "titanic"],
              note: "Benchmarked against boosting in all three.",
            },
            {
              id: "xgboost",
              label: "XGBoost",
              projectIds: ["churn", "titanic", "walmart"],
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
              label: "Chest X-Ray Classification",
              projectIds: [],
              wip: true,
              note:
                "In progress — CNN-based classification on chest radiographs. Currently building the pipeline.",
            },
          ],
        },
        {
          id: "sequential",
          label: "SEQUENTIAL MODELS",
          caption:
            "Order carries meaning — state is passed along the sequence. These are the building blocks transformers were built to replace.",
          models: [
            {
              id: "rnn",
              label: "RNN",
              projectIds: [],
              foundation: true,
              note:
                "Processes a sequence one step at a time, carrying a hidden state forward. Sequential by construction — which is exactly what caps its speed and its memory over long spans.",
            },
            {
              id: "lstm",
              label: "LSTM / GRU",
              projectIds: [],
              foundation: true,
              note:
                "Gates let gradients survive far longer than a plain RNN. Still strictly sequential, though — you cannot parallelise across time.",
            },
          ],
        },
        {
          id: "transformers",
          label: "TRANSFORMERS",
          caption:
            "Attention replaces recurrence — every position can see every other in one step.",
          models: [
            {
              id: "attention",
              label: "Self-Attention",
              projectIds: [],
              foundation: true,
              note:
                "Drops recurrence entirely: every position attends to every other in a single step, so the whole sequence computes in parallel. That is what made scale possible.",
            },
            {
              id: "pretrained",
              label: "Pre-trained Transformers",
              projectIds: [],
              foundation: true,
              note:
                "Pre-train once on a large corpus, adapt to the task afterwards — the pattern behind modern NLP. Studied through the Deep Learning Specialization.",
            },
          ],
        },
      ],
    },
  ],
};
