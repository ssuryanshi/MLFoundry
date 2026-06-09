from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    RandomForestRegressor,
    GradientBoostingRegressor,
)
from xgboost import XGBClassifier, XGBRegressor

MODEL_REGISTRY = {
    "classification": {
        "logistic_regression": LogisticRegression(
            max_iter=1000,
            random_state=42
        ),
        "random_forest": RandomForestClassifier(
            random_state=42
        ),
        "gradient_boosting": GradientBoostingClassifier(
            random_state=42
        ),
        "xgboost": XGBClassifier(
            random_state=42,
            eval_metric="logloss",
            verbosity=0
        ),
    },
    "regression": {
        "linear_regression": LinearRegression(),
        "random_forest": RandomForestRegressor(
            random_state=42
        ),
        "gradient_boosting": GradientBoostingRegressor(
            random_state=42
        ),
        "xgboost": XGBRegressor(
            random_state=42,
            verbosity=0
        ),
    }
}

def get_models(task_type: str) -> dict:
    if "classification" in task_type:
        return MODEL_REGISTRY["classification"]
    return MODEL_REGISTRY["regression"]