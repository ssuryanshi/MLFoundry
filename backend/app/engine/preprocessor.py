import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

class PreprocessorBuilder:
    def __init__(self, df: pd.DataFrame, target: str):
        X = df.drop(columns=[target])
        self.num_cols = X.select_dtypes(include="number").columns.tolist()
        self.cat_cols = X.select_dtypes(include="object").columns.tolist()

    def build(self) -> ColumnTransformer:
        numeric_pipe = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ])

        categorical_pipe = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ])

        transformers = []

        if self.num_cols:
            transformers.append(("num", numeric_pipe, self.num_cols))

        if self.cat_cols:
            transformers.append(("cat", categorical_pipe, self.cat_cols))

        return ColumnTransformer(transformers=transformers)