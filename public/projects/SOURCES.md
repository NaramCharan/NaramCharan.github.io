# Project evidence

- `rsna-interface.png`: screenshot captured from the owner’s live RSNA application on 12 October 2026, at 1440 × 1000, after deploying the numeric-study-ID fix. Shows the actual stored `Case_1` radiograph before prediction; no inference result is fabricated. Live `Case_1` and `Case_42` image loads were verified.
- `walmart-model-comparison.png` and `walmart-feature-importance.png`: original result images from `NaramCharan/Walmart-Store-Weekly-Sales-Forecasting`, `walmart-recruiting-store-sales-forecasting/Output/`. LightGBM validation R² 0.955500, RMSE 4646.904168. The comparison/importance plots replace the former synthetic forecast curve; no real forecast-series export was published in that repository at review time.
- `churn-model-comparison.svg`: rendered from the held-out-test F1 values in `NaramCharan/ecommerce-customer-churn-prediction/README.md`: Random Forest 91.33%, XGBoost 94.74%, neural network 96.23%. Bars start at zero. This is a presentation of published metrics, not a live model evaluation.

- `walmart-validation.svg`: redrawn from the original comparison table above. Random Forest R² 0.936299; XGBoost 0.903282; LightGBM 0.955500. Bars start at zero. Original table and feature-importance plot remain available from the project details.
- Transformer and book-scraper previews are labelled architecture illustrations, based on their README/configuration. They do not claim execution output.
