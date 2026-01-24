# Download face-api.js models for Windows
# This script downloads all required models for face recognition

Write-Host "Creating models directory..." -ForegroundColor Green
if (!(Test-Path "public/models")) {
    New-Item -ItemType Directory -Path "public/models" | Out-Null
}

Write-Host "Downloading face-api.js models..." -ForegroundColor Green

# Base URL for models - using unpkg CDN
$baseUrl = "https://unpkg.com/face-api.js@0.22.2/weights"

# Files to download
$files = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-weights_shard1",
    "tiny_face_detector_model-weights_shard2",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-weights_shard1",
    "face_landmark_68_model-weights_shard2",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-weights_shard1",
    "face_recognition_model-weights_shard2",
    "face_expression_model-weights_manifest.json",
    "face_expression_model-weights_shard1",
    "face_expression_model-weights_shard2"
)

# Download each file
foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $outputPath = "public/models/$file"
    
    Write-Host "Downloading $file..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath -ErrorAction Stop
        Write-Host "Downloaded $file successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to download $file" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

Write-Host "`nAll models downloaded successfully!" -ForegroundColor Green
Write-Host "Models are located in: ./public/models/" -ForegroundColor Yellow
