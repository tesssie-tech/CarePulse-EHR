import os
import sys
import numpy as np

# --- Compatibility patch ---
for attr, target in [('long', int), ('ulong', int), ('object', object), ('bool', bool)]:
    if not hasattr(np, attr):
        setattr(np, attr, target)

import pandas as pd
import matplotlib.pyplot as plt

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam, SGD

print("--- Starting CarePulse EHR Model Training Pipeline ---")

# 1. Load Dataset
data_path = 'diabetes_prediction_dataset.csv'
if not os.path.exists(data_path):
    raise FileNotFoundError(f"Please place '{data_path}' inside the ml_training folder.")

df = pd.read_csv(data_path)
df.columns = df.columns.str.strip().str.lower()
print("Cleaned CSV Columns:", list(df.columns))

# 2. Convert text columns explicitly
if 'gender' in df.columns:
    df['gender'] = df['gender'].astype(str).map({'Female': 0, 'Male': 1, 'Other': 2}).fillna(0)

if 'smoking_history' in df.columns:
    # Convert smoking categories into numbers
    smoking_map = {'never': 0, 'No Info': 0, 'current': 1, 'former': 2, 'ever': 1, 'not current': 2}
    df['smoking_history'] = df['smoking_history'].astype(str).map(smoking_map).fillna(0)

# Force all remaining columns to numeric
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# 3. Separate Features and Target
target_col = 'diabetes'
feature_cols = [c for c in df.columns if c != target_col]

X_raw = df[feature_cols].values.astype(np.float32)
y = df[target_col].values.astype(np.float32)

# Ensure 10 feature inputs (pad 2 zero columns if dataset has 8 features)
if X_raw.shape[1] < 10:
    padding_needed = 10 - X_raw.shape[1]
    print(f"Padding input features from {X_raw.shape[1]} to 10 columns for CarePulse ANN architecture...")
    padding = np.zeros((X_raw.shape[0], padding_needed), dtype=np.float32)
    X = np.hstack((X_raw, padding))
else:
    X = X_raw[:, :10]

# 4. Min-Max Normalization
X_min = X.min(axis=0)
X_max = X.max(axis=0)
X_scaled = (X - X_min) / (X_max - X_min + 1e-8)

# 5. Train/Validation Split (80/20)
indices = np.arange(len(X_scaled))
np.random.seed(42)
np.random.shuffle(indices)

split_idx = int(len(X_scaled) * 0.8)
train_idx, val_idx = indices[:split_idx], indices[split_idx:]

X_train, y_train = X_scaled[train_idx], y[train_idx]
X_val, y_val = X_scaled[val_idx], y[val_idx]

print(f"\nTraining set size: {len(X_train)} records")
print(f"Validation set size: {len(X_val)} records")

# 6. Define Keras Model Architecture (10 Inputs -> 16 ReLU -> 8 ReLU -> 1 Sigmoid)
model = Sequential([
    Dense(16, activation='relu', input_shape=(10,), name='hidden_layer_1'),
    Dense(8, activation='relu', name='hidden_layer_2'),
    Dense(1, activation='sigmoid', name='output_layer')
])

model.summary()

# 7. Phase 1 Optimization: Adam (80 Epochs)
print("\n--- Phase 1: Global Convergence via Adam Optimizer ---")
model.compile(
    optimizer=Adam(learning_rate=0.001), 
    loss='binary_crossentropy', 
    metrics=['accuracy']
)
history_adam = model.fit(
    X_train, y_train, 
    validation_data=(X_val, y_val), 
    epochs=80, 
    batch_size=32, 
    verbose=1
)

# 8. Phase 2 Optimization: SGD Fine-Tuning (20 Epochs)
print("\n--- Phase 2: Local Fine-Tuning via Stochastic Gradient Descent (SGD) ---")
model.compile(
    optimizer=SGD(learning_rate=0.0001), 
    loss='binary_crossentropy', 
    metrics=['accuracy']
)
history_sgd = model.fit(
    X_train, y_train, 
    validation_data=(X_val, y_val), 
    epochs=20, 
    batch_size=32, 
    verbose=1
)

# 9. Plot & Save Curves
print("\n--- Saving Loss and Accuracy Curves ---")
total_loss = history_adam.history['loss'] + history_sgd.history['loss']
total_val_loss = history_adam.history['val_loss'] + history_sgd.history['val_loss']
total_acc = history_adam.history['accuracy'] + history_sgd.history['accuracy']
total_val_acc = history_adam.history['val_accuracy'] + history_sgd.history['val_accuracy']

plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(total_loss, label='Train Loss', color='blue')
plt.plot(total_val_loss, label='Val Loss', color='orange')
plt.axvline(x=80, color='gray', linestyle='--', label='Adam -> SGD Transition')
plt.title('Loss Curve Across Optimization Stages')
plt.xlabel('Epochs')
plt.ylabel('Binary Cross-Entropy Loss')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(total_acc, label='Train Accuracy', color='green')
plt.plot(total_val_acc, label='Val Accuracy', color='red')
plt.axvline(x=80, color='gray', linestyle='--', label='Adam -> SGD Transition')
plt.title('Accuracy Curve Across Optimization Stages')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

plt.tight_layout()
plt.savefig('training_loss_curves.png', dpi=300)
print("Successfully saved 'training_loss_curves.png'!")

# 10. Export Models
model.save('carepulse_model.h5')
print("Successfully saved Keras model as 'carepulse_model.h5'!")

try:
    import tensorflowjs as tfjs
    export_path = '../public/models'
    os.makedirs(export_path, exist_ok=True)
    tfjs.converters.save_keras_model(model, export_path)
    print(f"Successfully exported TensorFlow.js model to '{export_path}'!")
except Exception as e:
    print(f"\nNote on TFJS export: {e}")
    print("Your model trained successfully and generated 'carepulse_model.h5' & 'training_loss_curves.png'.")