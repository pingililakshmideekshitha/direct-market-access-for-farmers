// Initialize Supabase
const supabaseUrl = 'https://zcaxbjntzkghfuenflzx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjYXhiam50emtnaGZ1ZW5mbHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMzIyMTgsImV4cCI6MjA2MDcwODIxOH0.7g3VpSenpp6wYloQ2MlyEtvOg1eSJ6dP-9PB89eVOHo';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyAI335LGoyu6P0EygejJk2iIdnY9t9qHJ8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const resultsSection = document.getElementById('results');
const diseaseName = document.getElementById('diseaseName');
const cause = document.getElementById('cause');
const suggestions = document.getElementById('suggestions');

// Store the original preview content
let originalPreviewContent = '';

// Drag and Drop Event Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f0f8ff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

// File Input Change Event
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

// Handle File Upload
function handleFile(file) {
    if (!file) {
        alert('Please select a file.');
        return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, or WebP).');
        return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        // Create new image element
        const img = new Image();
        
        img.onload = () => {
            // Update the preview image
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            
            // Show the preview container
            previewContainer.style.display = 'block';
            
            // Store the image data for later use
            window.currentImageData = e.target.result;
        };
        
        img.onerror = () => {
            alert('Error loading image. Please try again.');
            previewContainer.style.display = 'none';
        };
        
        img.src = e.target.result;
    };

    reader.onerror = () => {
        alert('Error reading the file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

// Show loading animation
function showLoading() {
    return `
        <div class="loading-container">
            <div class="loader"></div>
            <div class="loading-text">
                Analyzing Image<span class="loading-dots"></span>
            </div>
            <div class="loading-subtext">
                Our AI is examining the crop for diseases
            </div>
        </div>
    `;
}

// Analyze Image using Gemini API
async function analyzeImage() {
    try {
        // Show loading state with animation
        previewContainer.innerHTML = showLoading();

        // Get the image data from the stored source
        const imageData = window.currentImageData;
        if (!imageData) {
            throw new Error('No image data available for analysis');
        }

        // Get base64 image data without the data URL prefix
        const base64Data = imageData.split(',')[1];

        // Update loading message
        const loadingContainer = previewContainer.querySelector('.loading-subtext');
        if (loadingContainer) {
            loadingContainer.textContent = 'Processing image data...';
        }

        // Prepare the request body for Gemini API
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: "Analyze this crop image. If you detect any disease, provide: 1) Disease name, 2) Cause, and 3) Suggestions to solve the disease. If the crop appears healthy, indicate that. Format your response as a JSON object with these fields: disease, cause, and suggestions."
                        },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Data
                            }
                        }
                    ]
                }
            ]
        };

        // Update loading message
        if (loadingContainer) {
            loadingContainer.textContent = 'Consulting AI model...';
        }

        // Make the API call to Gemini
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API call failed: ${response.status} - ${errorText}`);
        }

        // Update loading message
        if (loadingContainer) {
            loadingContainer.textContent = 'Analyzing results...';
        }

        const data = await response.json();
        console.log('Gemini API Response:', data);

        // Parse the response and extract the information
        const result = parseGeminiResponse(data);
        
        // Display results
        displayResults(result);
        
        // Store results in Supabase
        await storeAnalysisResults(result);

        // Restore the preview container
        previewContainer.innerHTML = `
            <img id="previewImage" src="${window.currentImageData}" alt="Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-bottom: 1rem;">
            <button class="analyze-btn" onclick="analyzeImage()">Analyze Image</button>
        `;

    } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Error analyzing image: ' + error.message);
        // Restore the preview container to its original state
        if (window.currentImageData) {
            previewContainer.innerHTML = `
                <img id="previewImage" src="${window.currentImageData}" alt="Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-bottom: 1rem;">
                <button class="analyze-btn" onclick="analyzeImage()">Analyze Image</button>
            `;
        }
    }
}

// Parse Gemini API Response
function parseGeminiResponse(data) {
    try {
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response format from API');
        }

        const text = data.candidates[0].content.parts[0].text;
        console.log('Response text:', text);

        // Try to find and parse JSON in the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsedData = JSON.parse(jsonMatch[0]);
                return {
                    disease: parsedData.disease || 'Unknown',
                    cause: parsedData.cause || 'Unable to determine',
                    suggestions: parsedData.suggestions || 'No suggestions available'
                };
            } catch (e) {
                console.error('Error parsing JSON from response:', e);
                return {
                    disease: 'Analysis Complete',
                    cause: 'See suggestions',
                    suggestions: text.substring(0, 500)
                };
            }
        }

        // If no JSON found, return the text as description
        return {
            disease: 'Analysis Complete',
            cause: 'See suggestions',
            suggestions: text.substring(0, 500)
        };
    } catch (error) {
        console.error('Error parsing response:', error);
        return {
            disease: 'Error',
            cause: 'Analysis failed',
            suggestions: 'There was an error processing the image. Please try again.'
        };
    }
}

// Display Results with Visualization
function displayResults(results) {
    // Display text results
    diseaseName.textContent = results.disease;
    cause.textContent = results.cause;
    suggestions.textContent = results.suggestions;
    
    // Create visualization
    createVisualization(window.currentImageData, results);
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Create visualization with detection boxes
function createVisualization(imageData, results) {
    const canvas = document.getElementById('analyzedImageCanvas');
    const ctx = canvas.getContext('2d');
    
    // Create new image
    const img = new Image();
    img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Add semi-transparent red overlay for affected areas
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        
        // Calculate areas to highlight based on image size
        // This is a simplified example - in reality, you would get these coordinates from the AI model
        const centerX = img.width / 2;
        const centerY = img.height / 2;
        const boxSize = Math.min(img.width, img.height) / 4;
        
        // Draw detection box
        ctx.beginPath();
        ctx.rect(centerX - boxSize/2, centerY - boxSize/2, boxSize, boxSize);
        ctx.fill();
        
        // Draw box border
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add disease name label
        ctx.fillStyle = 'red';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(results.disease, centerX - boxSize/2, centerY - boxSize/2 - 5);
    };
    
    img.src = imageData;
}

// Store Analysis Results in Supabase
async function storeAnalysisResults(results) {
    try {
        const { data, error } = await supabaseClient
            .from('analysis_results')
            .insert([
                {
                    disease: results.disease,
                    cause: results.cause,
                    suggestions: results.suggestions,
                    created_at: new Date()
                }
            ]);

        if (error) throw error;
        console.log('Results stored successfully:', data);
    } catch (error) {
        console.error('Error storing results:', error);
    }
} 