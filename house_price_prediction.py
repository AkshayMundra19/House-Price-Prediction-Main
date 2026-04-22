import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

data = {
    'Area_sqft': [500, 700, 900, 1100, 1300, 1500, 1700, 1900],
    'Price_lakhs': [20, 28, 36, 45, 55, 65, 75, 85]
}

df = pd.DataFrame(data)
print(df)

plt.scatter(df['Area_sqft'], df['Price_lakhs'])
plt.xlabel("Area (sqft)")
plt.ylabel("Price (Lakhs)")
plt.title("House Area vs Price")
plt.show()

X = df[['Area_sqft']]
y = df['Price_lakhs']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=0
)

model = LinearRegression()
model.fit(X_train, y_train)

predictions = model.predict(X_test)
print("Predicted Prices:", predictions)

area = float(input("Enter house area in sqft: "))
predicted_price = model.predict([[area]])
print("Estimated House Price (in lakhs):", predicted_price[0])

plt.scatter(X, y)
plt.plot(X, model.predict(X), linestyle='--')
plt.xlabel("Area (sqft)")
plt.ylabel("Price (Lakhs)")
plt.title("Regression Line")
plt.show()