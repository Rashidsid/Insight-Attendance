from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
import base64

app = Flask(__name__)
CORS(app)

# Store student data (usn and image path only)
student_data = {}

# Load face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def extract_faces_from_image(image_gray):
    """Extract all faces from a grayscale image"""
    faces = face_cascade.detectMultiScale(image_gray, scaleFactor=1.3, minNeighbors=5, minSize=(30, 30))
    print(f"[DEBUG] Face detection found {len(faces)} face(s)")
    return faces

# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Python Face API is running"}), 200

# Enroll a new student (usn, face image)
@app.route("/enroll", methods=["POST"])
def enroll():
    try:
        print("[INFO] Enroll request received")
        data = request.get_json()
        usn = data.get("usn")
        image_data = data.get("image")

        print(f"[DEBUG] USN: {usn}")
        print(f"[DEBUG] Image data received: {len(image_data) if image_data else 0} characters")

        if not usn or not image_data:
            print(f"[ERROR] Missing data: usn={usn}, image={'provided' if image_data else 'missing'}")
            return jsonify({"error": "USN and image are required"}), 400

        print(f"[INFO] Processing enrollment for USN: {usn}")

        # Extract base64 data
        if "," in image_data:
            print("[DEBUG] Splitting base64 data at comma")
            image_data = image_data.split(",")[1]
        
        print(f"[DEBUG] Base64 data length after processing: {len(image_data)}")
        
        try:
            image_bytes = base64.b64decode(image_data)
            print(f"[DEBUG] Decoded {len(image_bytes)} bytes from base64")
        except Exception as decode_error:
            print(f"[ERROR] Base64 decode error: {decode_error}")
            return jsonify({"error": f"Invalid base64 data: {str(decode_error)}"}), 400
        
        np_arr = np.frombuffer(image_bytes, np.uint8)
        # Decode as COLOR first, then convert to grayscale for better face detection
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            print(f"[ERROR] Could not decode image for USN: {usn}")
            print(f"[ERROR] Image array shape: {np_arr.shape}")
            return jsonify({"error": "Invalid image format - could not decode"}), 400

        print(f"[DEBUG] Image decoded successfully. Shape: {frame.shape}")

        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces in the image
        faces = extract_faces_from_image(gray)
        
        if len(faces) == 0:
            print(f"[ERROR] No face detected in the image for USN: {usn}")
            return jsonify({"error": "No face detected in the image. Please upload a clear face photo."}), 400
        
        if len(faces) > 1:
            print(f"[WARN] Multiple faces detected ({len(faces)}). Using the largest face.")
        
        # Extract the largest face (or first face if only one)
        face = max(faces, key=lambda f: f[2] * f[3]) if len(faces) > 1 else faces[0]
        x, y, w, h = face
        
        # Extract face ROI
        face_img = gray[y:y+h, x:x+w]
        print(f"[DEBUG] Extracted face ROI size: {face_img.shape}")
        
        # Apply histogram equalization for better recognition
        face_img = cv2.equalizeHist(face_img)

        # Convert face ROI to base64 for database storage
        success, face_encoded = cv2.imencode('.jpg', face_img)
        if not success:
            return jsonify({"error": "Failed to encode face image"}), 500
        
        face_base64 = base64.b64encode(face_encoded).decode('utf-8')
        print(f"[DEBUG] Face ROI encoded to base64: {len(face_base64)} characters")

        # Also save to filesystem for backward compatibility
        student_folder = os.path.join("faces", usn)
        os.makedirs(student_folder, exist_ok=True)
        img_count = len(os.listdir(student_folder))
        img_name = f"{img_count + 1}.jpg"
        img_path = os.path.join(student_folder, img_name)
        
        success = cv2.imwrite(img_path, face_img)
        print(f"[DEBUG] Image write result: {success}")
        
        if not success:
            print(f"[ERROR] Failed to write image to {img_path}")
            return jsonify({"error": "Failed to save image"}), 500

        # Store student usn and image path in the student_data dictionary
        student_data[usn] = {
            "image_path": img_path,
            "face_base64": face_base64
        }

        print(f"[SUCCESS] Student {usn} enrolled successfully at {img_path}")
        print(f"[DEBUG] Current enrolled students: {list(student_data.keys())}")
        
        return jsonify({
            "message": f"Student {usn} enrolled successfully! Face detected and saved.",
            "faceBase64": face_base64  # Return face ROI for database storage
        }), 200
    
    except Exception as e:
        print(f"[ERROR] Enrollment error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Face recognition API
@app.route("/recognize", methods=["POST"])
def recognize():
    try:
        print("[INFO] Recognition request received")
        data = request.get_json()
        image_data = data.get("image")
        enrolled_faces = data.get("enrolledFaces", {})  # Dictionary of {usn: base64_face_data}

        if not image_data:
            print("[ERROR] No image data provided")
            return jsonify({"usn": "No face detected", "confidence": 100}), 200

        print(f"[DEBUG] Image data length: {len(image_data)}")
        print(f"[DEBUG] Enrolled faces count: {len(enrolled_faces)}")
        
        image_data = image_data.split(",")[1] if "," in image_data else image_data
        
        try:
            image_bytes = base64.b64decode(image_data)
            print(f"[DEBUG] Decoded {len(image_bytes)} bytes")
        except Exception as e:
            print(f"[ERROR] Base64 decode error: {e}")
            return jsonify({"usn": "No face detected", "confidence": 100}), 200
        
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            print("[ERROR] Could not decode image")
            return jsonify({"usn": "No face detected", "confidence": 100}), 200

        print(f"[DEBUG] Frame shape: {frame.shape}")

        # Check if enrolled faces provided from database
        if len(enrolled_faces) == 0:
            print("[INFO] No enrolled faces provided")
            return jsonify({"usn": "No face detected", "confidence": 100}), 200

        print(f"[INFO] Found enrolled students: {list(enrolled_faces.keys())}")

        try:
            # Train model from database provided face data
            recognizer = cv2.face.LBPHFaceRecognizer_create()
            faces = []
            labels = []
            label_map = {}
            current_label = 0

            # Decode enrolled face images from base64
            for usn, face_base64 in enrolled_faces.items():
                try:
                    face_bytes = base64.b64decode(face_base64)
                    face_np = np.frombuffer(face_bytes, np.uint8)
                    face_img = cv2.imdecode(face_np, cv2.IMREAD_GRAYSCALE)
                    
                    if face_img is not None:
                        face_img = cv2.equalizeHist(face_img)
                        faces.append(face_img)
                        label_map[usn] = current_label
                        labels.append(current_label)
                        current_label += 1
                        print(f"[DEBUG] Loaded face for {usn}")
                    else:
                        print(f"[WARN] Could not decode face for {usn}")
                except Exception as e:
                    print(f"[WARN] Error loading face for {usn}: {e}")
            
            if len(faces) == 0:
                print("[ERROR] No valid face data for training")
                return jsonify({"usn": "No face detected", "confidence": 100}), 200
            
            print(f"[INFO] Training model with {len(faces)} images for {len(label_map)} students")
            recognizer.train(faces, np.array(labels))
            
            # Reverse label map for recognition
            label_reverse_map = {v: k for k, v in label_map.items()}
            
        except Exception as e:
            print(f"[ERROR] Model training failed: {str(e)}")
            return jsonify({"usn": "No face detected", "confidence": 100}), 200

        # Convert to grayscale for face detection and recognition
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray_equalized = cv2.equalizeHist(gray)
        
        # Detect faces
        detected_faces = extract_faces_from_image(gray_equalized)

        print(f"[DEBUG] Detected {len(detected_faces)} face(s) in image")

        if len(detected_faces) == 0:
            print("[WARN] No faces detected in image")
            return jsonify({"usn": "No face detected", "confidence": 100}), 200

        # Use the largest face detected
        best_confidence = 100  # Lower is better for LBPH
        best_usn = "No face detected"

        for (x, y, w, h) in detected_faces:
            # Extract face ROI
            face_img = gray_equalized[y:y+h, x:x+w]
            print(f"[DEBUG] Face ROI size: {face_img.shape}")
            
            # Predict
            label, confidence = recognizer.predict(face_img)
            usn = label_reverse_map.get(label, "Unknown")

            print(f"[DEBUG] Prediction: label={label}, usn={usn}, confidence={confidence}")

            # Keep track of best match (lowest confidence = best match)
            if confidence < best_confidence:
                best_confidence = confidence
                best_usn = usn

        print(f"[SUCCESS] Best match: USN={best_usn}, Confidence={best_confidence}")
        
        # Set a confidence threshold (confidence > 70 means not recognized)
        if best_confidence > 70:
            print(f"[WARN] Confidence too high ({best_confidence}), treating as not recognized")
            return jsonify({"usn": "No face detected", "confidence": 100}), 200
        
        return jsonify({
            "usn": best_usn,
            "confidence": int(best_confidence)
        }), 200
    
    except Exception as e:
        print(f"[ERROR] Recognition error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
