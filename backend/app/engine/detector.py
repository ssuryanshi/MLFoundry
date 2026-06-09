import pandas as pd

class ProblemDetector:
    def __init__(self, y: pd.Series):
        self.y = y

    def detect(self) -> dict:
        n_unique = self.y.nunique()
        dtype = self.y.dtype
        n_rows = len(self.y)

        if n_unique == 2:
            task = "binary_classification"
        elif n_unique <= 20 and (dtype == "object" or n_unique / n_rows < 0.05):
            task = "multiclass_classification"
        else:
            task = "regression"

        balance = (
            self.y.value_counts(normalize=True)
            .round(4)
            .to_dict()
        )

        return {
            "task_type": task,
            "n_classes": int(n_unique),
            "class_balance": balance if task != "regression" else {},
        }