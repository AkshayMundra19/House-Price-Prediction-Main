import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# Load dataset
train_df = pd.read_csv('train.csv')

# Selected features
features = [
    'GrLivArea',
    'BedroomAbvGr',
    'FullBath',
    'HalfBath',
    'YearBuilt',
    'OverallQual',
    'TotalBsmtSF',
    'GarageCars'
]

# Feature matrix and target
X = train_df[features].copy()
y = train_df['SalePrice']

# Handle missing values
X = X.fillna(X.median())

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Model initialization
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=20,
    random_state=42,
    n_jobs=-1
)

# Train model
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Evaluation metrics
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n--- Model Performance ---")
print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R2   : {r2:.4f}")

# Feature importance
importance_df = pd.DataFrame({
    'Feature': features,
    'Importance': model.feature_importances_
}).sort_values(by='Importance', ascending=False)

print("\n--- Feature Importance ---")
print(importance_df)

# Save trained model
with open('house_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("\nModel saved successfully!")

# Neighborhood pricing insights
neighborhood_prices = (
    train_df.groupby('Neighborhood')['SalePrice']
    .mean()
    .sort_values()
)

print("\n--- Neighborhood Average Prices ---")
print(neighborhood_prices)

# Interactive Prediction
print("\n--- Predict House Price ---")

try:
    area = float(input("Enter Ground Living Area (sqft): "))
    bedrooms = int(input("Enter Number of Bedrooms: "))
    full_bath = int(input("Enter Number of Full Bathrooms: "))
    half_bath = int(input("Enter Number of Half Bathrooms: "))
    year = int(input("Enter Year Built: "))
    quality = int(input("Enter Overall Quality (1-10): "))
    basement = float(input("Enter Basement Area (sqft): "))
    garage = int(input("Enter Garage Capacity: "))

    sample_input = pd.DataFrame([[
        area,
        bedrooms,
        full_bath,
        half_bath,
        year,
        quality,
        basement,
        garage
    ]], columns=features)

    predicted_price = model.predict(sample_input)[0]

    print(f"\nEstimated House Price: ${predicted_price:,.2f}")

except Exception as e:
    print(f"\nError during prediction: {e}")