import os
import json
import numpy as np

# Apply NumPy compatibility patch
for attr, target in [('long', int), ('ulong', int), ('object', object), ('bool', bool)]:
    if not hasattr(np, attr):
        setattr(np, attr, target)

import tensorflow as tf

print("--- Exporting CarePulse Model Files ---")

model_path = 'carepulse_model.h5'
output_dir = '../public/models'

if not os.path.exists(model_path):
    raise FileNotFoundError(f"'{model_path}' not found in current directory.")

os.makedirs(output_dir, exist_ok=True)

# Load the trained Keras model
model = tf.keras.models.load_model(model_path)

# Extract model architecture and convert to JSON string
model_json = model.to_json()

# Save topology as model.json inside public/models/
json_output_path = os.path.join(output_dir, 'model.json')
with open(json_output_path, 'w') as f:
    f.write(model_json)

print(f"Saved model architecture to: {json_output_path}")

# Extract weights as a clean dictionary dump for frontend loading
weights_dict = {}
for layer in model.layers:
    weights = layer.get_weights()
    if weights:
        weights_dict[layer.name] = [w.tolist() for w in weights]

weights_output_path = os.path.join(output_dir, 'weights.json')
with open(weights_output_path, 'w') as f:
    json.dump(weights_dict, f)

print(f"Saved model weights to: {weights_output_path}")
print("--- Conversion Completed Successfully ---")