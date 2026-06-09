import shap
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

class ExplainabilityEngine:
    def __init__(self, pipeline: Pipeline, X_test: pd.DataFrame):
        self.pipeline = pipeline
        self.preprocessor = pipeline[:-1]
        self.model = pipeline[-1]
        self.X_proc = self.preprocessor.transform(X_test.head(200))
        self.feature_names = self._get_feature_names(X_test)

    def _get_feature_names(self, X_test: pd.DataFrame) -> list:
        try:
            return self.preprocessor.get_feature_names_out().tolist()
        except Exception:
            return [f"feature_{i}" for i in range(self.X_proc.shape[1])]

    def explain(self) -> dict:
        tree_types = ("RandomForest", "GradientBoosting", "XGB")
        model_name = type(self.model).__name__

        if any(t in model_name for t in tree_types):
            explainer = shap.TreeExplainer(self.model)
        else:
            explainer = shap.LinearExplainer(self.model, self.X_proc)

        shap_values = explainer.shap_values(self.X_proc)

        if isinstance(shap_values, list):
            shap_values = shap_values[1]

        if len(shap_values.shape) == 3:
            shap_values = shap_values[:, :, 1]

        global_importance = np.abs(shap_values).mean(axis=0).tolist()
        local_shap_row0 = shap_values[0].tolist()

        importance_pairs = sorted(
            zip(self.feature_names, global_importance),
            key=lambda x: x[1],
            reverse=True
        )

        sorted_features = [p[0] for p in importance_pairs]
        sorted_importance = [p[1] for p in importance_pairs]

        return {
            "feature_names": sorted_features,
            "global_importance": sorted_importance,
            "local_shap_row0": local_shap_row0,
            "base_value": float(explainer.expected_value)
                if not isinstance(explainer.expected_value, np.ndarray)
                else float(explainer.expected_value[1]),
        }