"""Generate public/NARAM_RESUME.pdf — the file behind the site's Download Resume button.

Run:
    python3 -m venv .venv
    .venv/bin/pip install -r scripts/requirements.txt
    .venv/bin/python scripts/make_resume.py

This lives in the repo on purpose. The resume has no source .docx — it used to be
regenerated from a throwaway script in a temp directory, which meant that as soon
as that directory was cleared the PDF could not be reproduced or edited at all.
Keep this file in sync with lib/content.ts when project metrics change.

Known limitation: the body face is Helvetica rather than the Calibri of the
original Google Docs export, because only the base-14 fonts are guaranteed
available. Side by side it reads as the same document; a designer would spot it.
"""

import re

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Flowable, KeepTogether,
)

OUT = "public/NARAM_RESUME.pdf"

HEAD = colors.HexColor("#2E74B5")
RULE = colors.HexColor("#BFCEDF")
BODY = colors.HexColor("#1A1A1A")
LINK = colors.HexColor("#1155CC")
MUTED = colors.HexColor("#5A6472")

PAGE_W, PAGE_H = LETTER
LM = RM = 0.55 * inch
CONTENT_W = PAGE_W - LM - RM

name_s = ParagraphStyle("name", fontName="Helvetica", fontSize=19.5, leading=23,
                        alignment=TA_CENTER, textColor=colors.HexColor("#111111"))
contact_s = ParagraphStyle("contact", fontName="Helvetica", fontSize=7.6, leading=10.5,
                           alignment=TA_CENTER, textColor=MUTED)
body_s = ParagraphStyle("body", fontName="Helvetica", fontSize=8.5, leading=11.1,
                        textColor=BODY)
bullet_s = ParagraphStyle("bullet", parent=body_s, leftIndent=11, bulletIndent=2,
                          spaceAfter=1.2)
sk_label_s = ParagraphStyle("skl", fontName="Helvetica-Bold", fontSize=8.5, leading=11.2,
                            textColor=colors.HexColor("#222222"))
sk_val_s = ParagraphStyle("skv", parent=body_s)
proj_s = ParagraphStyle("proj", fontName="Helvetica-Bold", fontSize=9, leading=11.8,
                        textColor=colors.HexColor("#111111"))
link_s = ParagraphStyle("link", fontName="Helvetica", fontSize=7.3, leading=9.4,
                        alignment=TA_RIGHT, textColor=LINK)
edu_s = ParagraphStyle("edu", fontName="Helvetica-Bold", fontSize=8.8, leading=11.4,
                       textColor=colors.HexColor("#111111"))
edu_r = ParagraphStyle("edur", parent=body_s, alignment=TA_RIGHT)


class SectionHeader(Flowable):
    """Blue small-caps label with a hairline rule beneath, full content width."""

    def __init__(self, text):
        super().__init__()
        self.text = text
        self.width = CONTENT_W
        self.height = 15.5

    def draw(self):
        c = self.canv
        c.setFont("Helvetica-Bold", 9.2)
        c.setFillColor(HEAD)
        c.drawString(0, 6.5, self.text.upper())
        c.setStrokeColor(RULE)
        c.setLineWidth(0.7)
        c.line(0, 3, self.width, 3)


def link(url, label=None):
    return f'<link href="https://{url}"><font color="#1155CC">{label or url}</font></link>'


def repo_link(url):
    """Display without the github.com/ prefix — the full path wrapped mid-word."""
    return link(url, url.replace("github.com/", ""))


def project(title, stack, repo, demo, bullets, demo_label="Live application"):
    head = Table(
        [[Paragraph(f"{title} <font color='#5A6472' size='8'>| {stack}</font>", proj_s),
          Paragraph(repo_link(repo), link_s)]],
        colWidths=[CONTENT_W * 0.63, CONTENT_W * 0.37],
    )
    head.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    parts = [head]
    if demo:
        parts.append(Paragraph(
            f"<font color='#5A6472' size='7.6'>{demo_label}: </font>{link(demo)}",
            ParagraphStyle("demo", parent=body_s, fontSize=7.6, leading=9.6, spaceAfter=1.4)))
    for b in bullets:
        parts.append(Paragraph(b, bullet_s, bulletText="•"))
    parts.append(Spacer(1, 4.5))
    return KeepTogether(parts)


doc = SimpleDocTemplate(
    OUT, pagesize=LETTER, leftMargin=LM, rightMargin=RM,
    topMargin=0.36 * inch, bottomMargin=0.32 * inch,
    title="Naramreddy Charan Kumar Reddy — Resume",
    author="Naramreddy Charan Kumar Reddy",
)

S = []
S.append(Paragraph("NARAMREDDY CHARAN KUMAR REDDY", name_s))
S.append(Spacer(1, 3))
S.append(Paragraph(
    "+91-9966214989 &nbsp;|&nbsp; charannaram1710@gmail.com &nbsp;|&nbsp; Portfolio: "
    + link("naramcharan.me") + " &nbsp;|&nbsp; " + link("github.com/NaramCharan")
    + " &nbsp;|&nbsp; " + link("linkedin.com/in/naramcharan")
    + " &nbsp;|&nbsp; Gurugram, India", contact_s))
S.append(Spacer(1, 8))

S.append(SectionHeader("Professional Summary"))
S.append(Paragraph(
    "3rd-year Computer Science student specializing in AI and Machine Learning, building "
    "end-to-end systems that reach production rather than stopping at a notebook metric. "
    "Experience spans medical-imaging deep learning, gradient-boosted forecasting across "
    "thousands of parallel series, and recommendation architectures on learned embeddings — "
    "plus the serving layer around them. Strong bias toward leakage-free validation and "
    "metrics that describe real behaviour.", body_s))
S.append(Spacer(1, 7))

S.append(SectionHeader("Technical Skills"))
skills = [
    ("Machine Learning:", "XGBoost, LightGBM, Random Forest, Logistic Regression, Scikit-Learn, Optuna."),
    ("Deep Learning & CV:", "PyTorch, Transfer Learning (ResNet / DenseNet / EfficientNet), CNNs, pydicom, Neural Collaborative Filtering, Vector Embeddings, FAISS."),
    ("Data Intelligence:", "Pandas, NumPy, Feature Engineering, KNNImputer, Imbalance Handling, RobustScaler."),
    ("Engineering & Deploy:", "Python 3 (Advanced OOP), Data Structures, FastAPI, REST APIs, SQL (Schema Design), SQLAlchemy, Docker, Azure Container Apps, Git, Claude Code (agentic development)."),
]
rows = [[Paragraph(k, sk_label_s), Paragraph(v, sk_val_s)] for k, v in skills]
t = Table(rows, colWidths=[1.5 * inch, CONTENT_W - 1.5 * inch])
t.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 1.1),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 1.1),
]))
S.append(t)
S.append(Spacer(1, 7))

S.append(SectionHeader("Engineering Projects"))

S.append(project(
    "RSNA Pneumonia Detection",
    "Chest X-Ray Screening | PyTorch, pydicom, FastAPI, React, Docker, Azure",
    "github.com/NaramCharan/RSNA-Pneumonia-Detection",
    "rsna-app.salmonmeadow-7644e67e.eastasia.azurecontainerapps.io",
    [
        "Benchmarked DenseNet-121, EfficientNet-B2 and ResNet-34 under an identical two-stage "
        "transfer-learning protocol; the fine-tuned ResNet-34 reached <b>83% pneumonia recall, "
        "0.79 F1 and 86% accuracy</b> on 1,836 held-out studies, against a 68% always-negative baseline.",
        "Diagnosed a RandomCrop(224) transform discarding 95% of every 1024&times;1024 radiograph "
        "while retaining the study-level label — removing it produced a larger gain than every "
        "architecture change in the project combined.",
        "Prevented patient-level leakage by splitting on unique patient IDs rather than rows, "
        "evaluating the test set once; deployed as one Docker container on Azure serving a React "
        "interface and REST API, cutting hosting cost 84%.",
    ]))

S.append(project(
    "Walmart Store Weekly Sales Forecasting",
    "Python, Scikit-Learn, XGBoost, LightGBM, Pandas",
    "github.com/NaramCharan/Walmart-Store-Weekly-Sales-Forecasting",
    None,
    [
        "Engineered a global multi-series forecasting pipeline predicting weekly sales across "
        "~3,000 store-department combinations, achieving <b>95.55% validation R&sup2;</b> with an "
        "optimized LightGBM regressor.",
        "Built a custom recursive walk-forward inference system from scratch to project rolling and "
        "lag features over future validation horizons where actual sales are missing.",
        "Eliminated temporal data leakage by splitting before feature extraction and computing "
        "lag/rolling statistics strictly within each partition.",
    ]))

S.append(project(
    "E-Commerce Customer Churn Prediction",
    "Python, Scikit-Learn, XGBoost, PyTorch, Optuna",
    "github.com/NaramCharan/ecommerce-customer-churn-prediction",
    None,
    [
        "Tuned tree classifiers with Optuna over 10-fold Stratified Cross-Validation, achieving "
        "<b>98.28% accuracy and 94.74% F1</b> on the final selected XGBoost production model; a "
        "4-hidden-layer PyTorch network scored 98.76% and was rejected as not worth the compute.",
    ]))

S.append(project(
    "Personal Portfolio — naramcharan.me",
    "Next.js 16, React 19, TypeScript, Three.js, Tailwind v4, GitHub Actions",
    "github.com/NaramCharan/NaramCharan.github.io",
    "naramcharan.me",
    [
        "Designed and shipped a production portfolio — WebGL hero assembled under scroll, "
        "interactive project briefs, an ML taxonomy mapping models to projects — statically "
        "exported and auto-deployed to GitHub Pages on every push.",
        "Built by <b>directing Claude Code</b> across 75+ commits — architecture, design system and "
        "product decisions mine, every change reviewed before merge — including a performance pass "
        "taking Lighthouse from 65 to 87.",
    ],
    demo_label="Live site"))

S.append(SectionHeader("Education"))
edu = Table([[
    Paragraph("B.Tech in Computer Science Engineering (AI &amp; Machine Learning) — 3rd Year<br/>"
              "<font name='Helvetica' color='#1A1A1A'>GD Goenka University — Gurugram, India</font>", edu_s),
    Paragraph("Graduation: May 2028<br/>Current CGPA: 8.98 / 10.0", edu_r),
]], colWidths=[CONTENT_W * 0.64, CONTENT_W * 0.36])
edu.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
]))
S.append(edu)
S.append(Spacer(1, 7))

S.append(SectionHeader("Certifications"))
certs = [
    "Deep Learning Specialization &ndash; DeepLearning.AI (Jul 2026)",
    "Claude Code: Agentic Coding Assistant &ndash; DeepLearning.AI, Anthropic (Jul 2026)",
    "Machine Learning Specialization &ndash; DeepLearning.AI, Stanford (May 2026)",
    "Databases and SQL for Data Science &ndash; IBM, Coursera (Nov 2025)",
    "Python for Everybody Specialization &ndash; Univ. of Michigan (Mar 2025)",
    "Prompt Engineering &amp; Generative AI &ndash; Google, Vanderbilt (Mar 2025)",
]
cert_rows = [
    [Paragraph(certs[i], bullet_s, bulletText="\u2022"),
     Paragraph(certs[i + 1], bullet_s, bulletText="\u2022")]
    for i in range(0, len(certs), 2)
]
ct = Table(cert_rows, colWidths=[CONTENT_W / 2, CONTENT_W / 2])
ct.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 0.6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 0.6),
]))
S.append(ct)

doc.build(S)

# One page is a hard requirement — fail loudly rather than silently shipping two.
pages = len(re.findall(rb"/Type\s*/Page[^s]", open(OUT, "rb").read()))
print(f"built {OUT} — {pages} page(s)")
if pages != 1:
    raise SystemExit(f"ERROR: resume must be exactly 1 page, got {pages}. Trim a bullet.")
