import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import pickle

# Load the dataset
train_df = pd.read_csv('train.csv')

features = ['GrLivArea', 'BedroomAbvGr', 'FullBath', 'HalfBath', 'YearBuilt', 'OverallQual', 'TotalBsmtSF', 'GarageCars']
X = train_df[features].copy()
y = train_df['SalePrice']

# Handle missing values
X = X.fillna(X.median())

# Train model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(f"MAE: {mean_absolute_error(y_test, y_pred)}")
print(f"R2 Score: {r2_score(y_test, y_pred)}")

# Save the model
with open('house_model.pkl', 'wb') as f:
    pickle.dump(model, f)

# Print average prices for neighborhoods to use as location multipliers in JS
neighborhood_prices = train_df.groupby('Neighborhood')['SalePrice'].mean().sort_values()
print("\nNeighborhood Average Prices (Sorted):")
print(neighborhood_prices)

print("\nModel trained successfully with Kaggle dataset!")

# Interactive Prediction
print("\n--- Predict House Price (Interactive) ---")
try:
    area = float(input("Enter Ground Living Area (sqft): "))
    quality = int(input("Enter Overall Quality (1-10): "))
    year = int(input("Enter Year Built: "))
    rooms = int(input("Enter Total Rooms: "))

    sample_input = pd.DataFrame([[
        area, 
        3, # BedroomAbvGr
        2, # FullBath
        0, # HalfBath
        year, 
        quality, 
        1000, # TotalBsmtSF
        2 # GarageCars
    ]], columns=features)
    
    predicted = model.predict(sample_input)[0]
    print(f"\nEstimated Sale Price: ${predicted:,.2f}")
except Exception as e:
    print(f"Error during prediction: {e}")