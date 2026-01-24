#!/bin/bash
# Download face-api.js models

echo "Creating models directory..."
mkdir -p public/models

echo "Downloading face-api.js models..."

# Download tiny face detector
curl -o public/models/tiny_face_detector_model-weights_manifest.json https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-weights_manifest.json
curl -o public/models/tiny_face_detector_model-weights_shard1 https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-weights_shard1
curl -o public/models/tiny_face_detector_model-weights_shard2 https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-weights_shard2

# Download face landmark 68
curl -o public/models/face_landmark_68_model-weights_manifest.json https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_landmark_68_model-weights_manifest.json
curl -o public/models/face_landmark_68_model-weights_shard1 https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_landmark_68_model-weights_shard1
curl -o public/models/face_landmark_68_model-weights_shard2 https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_landmark_68_model-weights_shard2

# Download face recognition model
curl -o public/models/face_recognition_model-weights_manifest.json https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-weights_manifest.json
curl -o public/models/face_recognition_model-weights_shard1 https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-weights_shard1
curl -o public/models/face_recognition_model-weights_shard2 https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-weights_shard2

# Download face expression model
curl -o public/models/face_expression_model-weights_manifest.json https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_expression_model-weights_manifest.json
curl -o public/models/face_expression_model-weights_shard1 https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_expression_model-weights_shard1
curl -o public/models/face_expression_model-weights_shard2 https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_expression_model-weights_shard2

echo "Models downloaded successfully!"
