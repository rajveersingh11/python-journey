import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import math
from sklearn.metrics import mean_squared_error

# --- 1. Data Fetching and Preparation ---

# Define the stock ticker and data range
TICKER = 'AAPL'
START_DATE = '2015-01-01'
END_DATE = '2024-12-31'

# Fetch data using yfinance
try:
    stock_data = yf.download(TICKER, start=START_DATE, end=END_DATE)
    if stock_data.empty:
        raise ValueError("No data fetched. Please check the ticker symbol and date range.")
    print(f"Successfully fetched {len(stock_data)} data points for {TICKER}.")
except Exception as e:
    print(f"Error fetching data: {e}")
    exit()

# Use the 'Close' price for prediction
close_prices = stock_data[['Close']]
dataset = close_prices.values

# --- 2. Data Preprocessing ---

# Normalize the data to be between 0 and 1
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(dataset)

# Split the data into training and testing sets (80% training, 20% testing)
training_data_len = math.ceil(len(dataset) * 0.8)
train_data = scaled_data[0:training_data_len, :]
test_data = scaled_data[training_data_len - 60:, :]

# --- 3. Create Sequences for LSTM ---

# Function to create datasets with a given time step
def create_dataset(data, time_step=1):
    dataX, dataY = 
    for i in range(len(data) - time_step - 1):
        a = data[i:(i + time_step), 0]
        dataX.append(a)
        dataY.append(data[i + time_step, 0])
    return np.array(dataX), np.array(dataY)

# Define the look-back period (time step)
TIME_STEP = 60
X_train, y_train = create_dataset(train_data, TIME_STEP)
X_test, y_test = create_dataset(test_data, TIME_STEP)

# Reshape the input to be [samples, time steps, features] which is required for LSTM
X_train = X_train.reshape(X_train.shape, X_train.shape[1], 1)
X_test = X_test.reshape(X_test.shape, X_test.shape[1], 1)

# --- 4. Build the LSTM Model ---

model = Sequential()

# First LSTM layer with Dropout
model.add(LSTM(units=100, return_sequences=True, input_shape=(X_train.shape[1], 1)))
model.add(Dropout(0.2))

# Second LSTM layer with Dropout
model.add(LSTM(units=100, return_sequences=False))
model.add(Dropout(0.2))

# Dense output layer
model.add(Dense(units=1))

# Compile the model
model.compile(optimizer='adam', loss='mean_squared_error')

print("Model Summary:")
model.summary()

# --- 5. Train the Model ---

print("\nTraining the model...")
history = model.fit(X_train, y_train, batch_size=32, epochs=20)
print("Model training complete.")

# --- 6. Make Predictions and Evaluate ---

# Get the model's predicted price values
train_predict = model.predict(X_train)
test_predict = model.predict(X_test)

# Inverse transform the predictions to get original price values
train_predict = scaler.inverse_transform(train_predict)
test_predict = scaler.inverse_transform(test_predict)
y_test_actual = scaler.inverse_transform(y_test.reshape(-1, 1))

# Calculate Root Mean Squared Error (RMSE)
train_rmse = np.sqrt(mean_squared_error(y_train, scaler.inverse_transform(model.predict(X_train))))
test_rmse = np.sqrt(mean_squared_error(y_test_actual, test_predict))
print(f"\nTrain RMSE: {train_rmse:.2f}")
print(f"Test RMSE: {test_rmse:.2f}")

# --- 7. Visualize the Results ---

# Shift train predictions for plotting
train_predict_plot = np.empty_like(scaled_data)
train_predict_plot[:, :] = np.nan
train_predict_plot = train_predict

# Shift test predictions for plotting
test_predict_plot = np.empty_like(scaled_data)
test_predict_plot[:, :] = np.nan
test_predict_plot = test_predict

# Plot baseline data and predictions
plt.figure(figsize=(16, 8))
plt.title(f'{TICKER} Stock Price Prediction')
plt.xlabel('Date', fontsize=18)
plt.ylabel('Close Price USD ($)', fontsize=18)
plt.plot(close_prices, label='Actual Price')
plt.plot(train_predict_plot, label='Train Predictions')
plt.plot(test_predict_plot, label='Test Predictions')
plt.legend(loc='lower right')
plt.grid(True)
plt.show()

# Plot a closer view of the test predictions
valid = close_prices[training_data_len:]
valid['Predictions'] = test_predict

plt.figure(figsize=(16, 8))
plt.title('Model Test Prediction vs Actual')
plt.xlabel('Date', fontsize=18)
plt.ylabel('Close Price USD ($)', fontsize=18)
plt.plot(close_prices[:training_data_len]['Close'], label='Train Data')