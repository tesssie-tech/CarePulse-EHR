import * as tf from '@tensorflow/tfjs';

let loadedModel = null;

/**
 * Loads the trained model architecture and weights from local public assets.
 */
export const loadCarePulseModel = async () => {
  if (loadedModel) return loadedModel;

  try {
    // Fetch local files stored in public/models
    const responseModel = await fetch('/models/model.json');
    const modelTopology = await responseModel.json();

    const responseWeights = await fetch('/models/weights.json');
    const weightsData = await responseWeights.json();

    // Reconstruct sequential Keras model
    const model = await tf.models.modelFromJSON(modelTopology);

    // Apply trained layer weights
    model.layers.forEach((layer) => {
      if (weightsData[layer.name]) {
        const layerWeights = weightsData[layer.name].map((w) => tf.tensor(w));
        layer.setWeights(layerWeights);
      }
    });

    loadedModel = model;
    console.log('CarePulse offline ML model initialized successfully.');
    return loadedModel;
  } catch (error) {
    console.error('Error initializing offline ML model:', error);
    throw error;
  }
};

/**
 * Executes local browser inference on patient features.
 * @param {Object} patientData - Form values from frontend
 * @returns {Promise<number>} Diabetes risk percentage (0 to 100)
 */
export const predictDiabetesRisk = async (patientData) => {
  const model = await loadCarePulseModel();

  // 1. Map input values into 10-feature array expected by network
  const rawInputs = [
    patientData.gender === 'Male' || patientData.gender === 1 ? 1 : 0,
    Number(patientData.age || 0),
    patientData.hypertension ? 1 : 0,
    patientData.heartDisease || patientData.heart_disease ? 1 : 0,
    patientData.smokingHistory === 'current' ? 1 : 0,
    Number(patientData.bmi || 0),
    Number(patientData.hba1c || patientData.hba1c_level || 0),
    Number(patientData.bloodGlucose || patientData.blood_glucose_level || 0),
    0, // Padding feature 9
    0  // Padding feature 10
  ];

  // 2. Min-Max Normalization matching dataset parameters
  const minVals = [0, 0, 0, 0, 0, 10.0, 3.5, 70.0, 0, 0];
  const maxVals = [1, 100, 1, 1, 2, 60.0, 9.0, 300.0, 0, 0];

  const scaledInputs = rawInputs.map((val, idx) => {
    const range = maxVals[idx] - minVals[idx];
    if (range === 0) return 0;
    return (val - minVals[idx]) / range;
  });

  // 3. Compute inference locally inside browser memory
  return tf.tidy(() => {
    const inputTensor = tf.tensor2d([scaledInputs], [1, 10]);
    const predictionTensor = model.predict(inputTensor);
    const probability = predictionTensor.dataSync()[0];
    return Math.round(probability * 100);
  });
};