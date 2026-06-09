import optuna
from sklearn.model_selection import cross_val_score, StratifiedKFold, KFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from xgboost import XGBClassifier, XGBRegressor
import numpy as np

optuna.logging.set_verbosity(optuna.logging.WARNING)

def get_cv(task_type: str, n_splits: int = 5):
    if "classification" in task_type:
        return StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    return KFold(n_splits=n_splits, shuffle=True, random_state=42)

def get_scoring(task_type: str) -> str:
    if task_type == "binary_classification":
        return "roc_auc"
    elif task_type == "multiclass_classification":
        return "f1_weighted"
    return "neg_root_mean_squared_error"

def optimize_model(model_name: str, task_type: str, X, y, n_trials: int = 50) -> dict:
    cv = get_cv(task_type)
    scoring = get_scoring(task_type)

    def objective(trial):
        if model_name == "random_forest" and "classification" in task_type:
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 50, 500),
                "max_depth": trial.suggest_int("max_depth", 3, 20),
                "min_samples_split": trial.suggest_int("min_samples_split", 2, 20),
                "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 10),
                "max_features": trial.suggest_categorical("max_features", ["sqrt", "log2"]),
            }
            model = RandomForestClassifier(**params, random_state=42)

        elif model_name == "random_forest" and task_type == "regression":
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 50, 500),
                "max_depth": trial.suggest_int("max_depth", 3, 20),
                "min_samples_split": trial.suggest_int("min_samples_split", 2, 20),
                "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 10),
            }
            model = RandomForestRegressor(**params, random_state=42)

        elif model_name == "gradient_boosting" and "classification" in task_type:
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 100, 500),
                "max_depth": trial.suggest_int("max_depth", 2, 8),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
                "subsample": trial.suggest_float("subsample", 0.5, 1.0),
            }
            model = GradientBoostingClassifier(**params, random_state=42)

        elif model_name == "gradient_boosting" and task_type == "regression":
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 100, 500),
                "max_depth": trial.suggest_int("max_depth", 2, 8),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
                "subsample": trial.suggest_float("subsample", 0.5, 1.0),
            }
            model = GradientBoostingRegressor(**params, random_state=42)

        elif model_name == "xgboost" and "classification" in task_type:
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 100, 1000),
                "max_depth": trial.suggest_int("max_depth", 3, 10),
                "learning_rate": trial.suggest_float("learning_rate", 1e-4, 0.3, log=True),
                "subsample": trial.suggest_float("subsample", 0.5, 1.0),
                "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
            }
            model = XGBClassifier(**params, random_state=42, eval_metric="logloss", verbosity=0)

        elif model_name == "xgboost" and task_type == "regression":
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 100, 1000),
                "max_depth": trial.suggest_int("max_depth", 3, 10),
                "learning_rate": trial.suggest_float("learning_rate", 1e-4, 0.3, log=True),
                "subsample": trial.suggest_float("subsample", 0.5, 1.0),
                "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
            }
            model = XGBRegressor(**params, random_state=42, verbosity=0)

        elif model_name == "logistic_regression":
            params = {
                "C": trial.suggest_float("C", 1e-4, 100.0, log=True),
            }
            model = LogisticRegression(**params, max_iter=1000, random_state=42)

        else:
            model = LinearRegression()

        scores = cross_val_score(model, X, y, cv=cv, scoring=scoring)
        return scores.mean()

    direction = "minimize" if scoring == "neg_root_mean_squared_error" else "maximize"

    study = optuna.create_study(
        direction=direction,
        sampler=optuna.samplers.TPESampler(seed=42)
    )
    study.optimize(objective, n_trials=n_trials)

    return study.best_params
