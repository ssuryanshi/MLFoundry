import pandas as pd
import numpy as np
from typing import Dict, Any

class DatasetProfiler:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def profile(self) -> Dict[str, Any]:
        return {
            "shape": list(self.df.shape),
            "dtypes": self.df.dtypes.astype(str).to_dict(),
            "missing": self._missing_stats(),
            "numeric_stats": self._numeric_stats(),
            "categorical_stats": self._categorical_stats(),
            "correlations": self._correlations(),
        }

    def _missing_stats(self) -> dict:
        missing = self.df.isnull().sum()
        total = len(self.df)
        return {
            col: {
                "count": int(missing[col]),
                "pct": round(float(missing[col] / total * 100), 2)
            }
            for col in missing[missing > 0].index
        }

    def _numeric_stats(self) -> dict:
        num_cols = self.df.select_dtypes(include=np.number)
        if num_cols.empty:
            return {}
        stats = num_cols.describe().round(4)
        return stats.to_dict()

    def _categorical_stats(self) -> dict:
        cat_cols = self.df.select_dtypes(include="object")
        if cat_cols.empty:
            return {}
        result = {}
        for col in cat_cols.columns:
            result[col] = {
                "n_unique": int(cat_cols[col].nunique()),
                "top_values": cat_cols[col].value_counts().head(5).to_dict()
            }
        return result

    def _correlations(self) -> dict:
        num_cols = self.df.select_dtypes(include=np.number)
        if num_cols.shape[1] < 2:
            return {}
        corr = num_cols.corr().round(3)
        return corr.to_dict()