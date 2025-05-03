// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase client
const supabaseUrl = 'https://adtyjmhqupoqxamudhqe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkdHlqbWhxdXBvcXhhbXVkaHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMjk4NjcsImV4cCI6MjA2MDkwNTg2N30.0Ugy2oKdeifq_a8XPXWTZuCzuNzQ5VFmUi5HEhP4zyA';

const supabase = createClient(supabaseUrl, supabaseKey);
// Track crop being edited
let currentEditingCropId = null;

// Check authentication state and user type
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Auth error:', error);
            throw error;
        }
        if (!session) {
            console.log('No active session, redirecting to login');
            window.location.href = 'login.html';
            return { session: null, userType: null };
        }

        // Get user profile to check user type
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        // If profile row missing, auto-create from auth metadata
        if (!profile) {
            const meta = session.user.user_metadata || {};
            const { data: newProfile, error: createErr } = await supabase
                .from('profiles')
                .insert({
                    id: session.user.id,
                    user_type: meta.user_type || 'farmer',
                    full_name: meta.full_name,
                    phone: session.user.phone || meta.phone,
                    avatar_url: meta.avatar_url || ''
                })
                .select()
                .single();
            if (createErr) console.error('Error creating profile:', createErr);
            profile = newProfile;
        }

        // Fallback to auth metadata if no profile row
        const userType = profile?.user_type || session.user.user_metadata?.user_type;
        console.log('User authenticated:', session.user.email, 'Type:', userType);
        return { session, userType };
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'login.html';
        return { session: null, userType: null };
    }
}

// Setup navigation based on user type
function setupNavigation(userType) {
    // Show/hide all farmer-specific buttons
    document.querySelectorAll('.farmer-only').forEach(btn => {
        btn.style.display = userType === 'farmer' ? 'block' : 'none';
    });

    // Add click handlers for navigation buttons (including Disease Detector)
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', async () => {
            // Remove active class from all buttons
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            const sectionId = button.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            // Load appropriate content
            if (sectionId === 'browseCrops') {
                await loadAllCrops();
            } else if (sectionId === 'yourActivity') {
                await loadUserCrops();
            } else if (sectionId === 'marketPrice') {
                await initMarketPrice();
            }
        });
    });
}

// Setup add crop form
function setupAddCropForm() {
    const addCropBtn = document.getElementById('addCropBtn');
    const addCropForm = document.getElementById('addCropForm');
    const cancelCropBtn = document.getElementById('formCancelBtn');
    // Hide cancel by default
    cancelCropBtn.style.display = 'none';
    const cropNameSelect = document.getElementById('cropName');
    const customCropGroup = document.getElementById('customCropGroup');
    const customCropName = document.getElementById('customCropName');
    // Dynamic price label based on quantity type
    const quantityTypeSelect = document.getElementById('quantityType');
    const priceLabel = addCropForm.querySelector('label[for="price"]');
    quantityTypeSelect.addEventListener('change', () => {
        const unit = quantityTypeSelect.value;
        priceLabel.textContent = `Price (₹ per 1 ${unit})`;
    });

    // Prevent duplicate submissions
    let isSubmitting = false;

    // Image preview setup
    const cropPhotoInput = document.getElementById('cropPhoto');
    const photoPreview = document.createElement('img');
    photoPreview.id = 'cropPhotoPreview';
    photoPreview.style.display = 'none';
    photoPreview.style.maxWidth = '200px';
    photoPreview.style.marginTop = '1rem';
    cropPhotoInput.parentNode.appendChild(photoPreview);
    cropPhotoInput.addEventListener('change', () => {
        if (cropPhotoInput.files && cropPhotoInput.files[0]) {
            const url = URL.createObjectURL(cropPhotoInput.files[0]);
            photoPreview.src = url;
            photoPreview.style.display = 'block';
        } else {
            photoPreview.style.display = 'none';
        }
    });

    // Show/hide custom crop name group
    cropNameSelect.addEventListener('change', () => {
        const isCustom = cropNameSelect.value === 'custom';
        customCropGroup.style.display = isCustom ? 'block' : 'none';
        if (!isCustom) customCropName.value = '';
    });

    // Show form when add button is clicked
    addCropBtn.addEventListener('click', () => {
        // Reset form for new entry
        addCropForm.reset();
        photoPreview.style.display = 'none';
        const customCropGroup = document.getElementById('customCropGroup');
        customCropGroup.style.display = 'none';
        const submitBtn = document.getElementById('formSubmitBtn');
        submitBtn.textContent = 'Save Crop';
        // Show cancel on add form
        cancelCropBtn.style.display = 'inline-block';
        addCropForm.style.display = 'block';
        addCropBtn.style.display = 'none';
    });

    // Hide form when cancel is clicked
    cancelCropBtn.addEventListener('click', () => {
        addCropForm.style.display = 'none';
        addCropBtn.style.display = 'block';
        addCropForm.reset();
        photoPreview.style.display = 'none';
        const customCropGroup = document.getElementById('customCropGroup');
        customCropGroup.style.display = 'none';
    });

    const submitBtn = document.getElementById('formSubmitBtn');

    // Handle form submission
    addCropForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Edit mode: update existing crop
        if (addCropForm.classList.contains('edit-mode')) {
            submitBtn.disabled = true;
            try {
                // Gather updated data
                const updatedData = {
                    name: cropNameSelect.value === 'custom' ? customCropName.value : cropNameSelect.value,
                    quantity: parseFloat(document.getElementById('quantity').value),
                    quantity_type: document.getElementById('quantityType').value,
                    price: parseFloat(document.getElementById('price').value)
                };
                // Photo update
                if (cropPhotoInput.files[0]) {
                    const file = cropPhotoInput.files[0];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${currentEditingCropId}/${Date.now()}.${fileExt}`;
                    const { data: uploadData, error: uploadErr } = await supabase.storage.from('crops').upload(fileName, file);
                    if (uploadErr) throw uploadErr;
                    const { data, error } = supabase.storage.from('crops').getPublicUrl(fileName);
                    if (error) throw error;
                    updatedData.photo_url = data.publicUrl;
                }
                // Apply update
                await supabase.from('crops').update(updatedData).eq('id', currentEditingCropId);
                // Reload and await user crops
                await loadUserCrops();
                // Wait for DOM update then scroll into view
                requestAnimationFrame(() => {
                    const updatedCard = document.getElementById(`crop-${currentEditingCropId}`);
                    if (updatedCard) {
                        updatedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
                alert('Crop updated successfully!');
                // Reset UI
                addCropForm.reset();
                addCropForm.classList.remove('edit-mode');
                addCropForm.style.display = 'none';
                addCropBtn.style.display = 'block';
                submitBtn.textContent = 'Add Crop';
            } catch (err) {
                console.error('Edit failed:', err);
                alert('Error updating crop: ' + err.message);
            } finally {
                submitBtn.disabled = false;
            }
            return;
        }
        // Add new crop logic
        if (isSubmitting) return;
        isSubmitting = true;
        const submitBtnOld = addCropForm.querySelector('button[type="submit"]');
        if (submitBtnOld) submitBtnOld.disabled = true;
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            console.log('Session data:', session, 'Error:', sessionError);
            if (sessionError) throw sessionError;
            if (!session) {
                window.location.href = 'login.html';
                return;
            }

            // Ensure user profile exists before inserting crop (upsert to satisfy RLS)
            const meta = session.user.user_metadata || {};
            console.log('Upserting profile for user:', session.user.id, 'with meta:', meta);
            const { data: profileData, error: profileUpsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    user_type: 'farmer',
                    full_name: meta.full_name,
                    phone: session.user.phone || meta.phone,
                    avatar_url: meta.avatar_url || ''
                }, { onConflict: 'id', returning: 'representation' });
            console.log('Profile upsert response:', profileData, 'Error:', profileUpsertError);
            if (profileUpsertError) throw profileUpsertError;

            const cropName = cropNameSelect.value;
            const customCropName = document.getElementById('customCropName').value;
            const cropPhoto = document.getElementById('cropPhoto').files[0];
            const quantity = document.getElementById('quantity').value;
            const quantityType = document.getElementById('quantityType').value;
            const price = document.getElementById('price').value;

            let photoUrl = `https://placehold.co/600x600/e2e8f0/1e293b?text=${encodeURIComponent(cropName === 'custom' ? customCropName : cropName)}`;

            if (cropPhoto) {
                console.log('Uploading photo:', cropPhoto.name);
                const fileExt = cropPhoto.name.split('.').pop();
                const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('crops')
                    .upload(fileName, cropPhoto);
                console.log('Upload response:', uploadData, 'Error:', uploadError);
                
                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw uploadError;
                }

                const { data: publicUrlData, error: publicUrlError } = supabase.storage
                    .from('crops')
                    .getPublicUrl(fileName);
                console.log('Public URL response:', publicUrlData, 'Error:', publicUrlError);
                if (publicUrlError) {
                    console.error('Public URL error:', publicUrlError);
                    throw publicUrlError;
                }
                const publicUrl = publicUrlData.publicUrl;

                photoUrl = publicUrl;
            }

            console.log('Inserting crop:', {
                farmer_id: session.user.id,
                name: cropName === 'custom' ? customCropName : cropName,
                photo_url: photoUrl,
                quantity: parseFloat(quantity),
                quantity_type: quantityType,
                price: parseFloat(price)
            });
            const { error: insertError } = await supabase
                .from('crops')
                .insert({
                    farmer_id: session.user.id,
                    name: cropName === 'custom' ? customCropName : cropName,
                    photo_url: photoUrl,
                    quantity: parseFloat(quantity),
                    quantity_type: quantityType,
                    price: parseFloat(price)
                });

            if (insertError) {
                if (insertError.message.includes('row-level security')) {
                    alert('Cannot add crop: please ensure your account is set up as a farmer in your profile.');
                    return;
                }
                throw insertError;
            }

            // Reset form and hide it
            addCropForm.reset();
            addCropForm.style.display = 'none';
            addCropBtn.style.display = 'block';

            // Reload crops
            await loadUserCrops();
        } catch (error) {
            console.error('Error adding crop:', error);
            alert('Error adding crop: ' + error.message);
        } finally {
            // Re-enable form and submission flag, clear preview
            if (submitBtnOld) submitBtnOld.disabled = false;
            isSubmitting = false;
            photoPreview.style.display = 'none';
        }
    });
}

// Load all crops for marketplace
async function loadAllCrops() {
    try {
        const { data: crops, error } = await supabase
            .from('crops_with_farmers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Apply browse filters
        const bs = document.getElementById('browseStateSelect').value;
        const bd = document.getElementById('browseDistrictSelect').value;
        const bc = document.getElementById('browseCropSelect').value;
        const filtered = crops.filter(c =>
            (bs === 'all' || c.state === bs) &&
            (bd === 'all' || c.district === bd) &&
            (bc === 'all' || c.name === bc)
        );
        const displayList = filtered;

        const cropsGrid = document.querySelector('#browseCrops .crops-grid');
        if (displayList.length === 0) {
            cropsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-seedling"></i>
                    <h2 data-i18n="noCropsTitle">No Crops Available</h2>
                    <p data-i18n="noCropsDesc">No farmers have added their crops yet. Check back later!</p>
                </div>
            `;
            return;
        }

        cropsGrid.innerHTML = '';
        displayList.forEach(crop => {
            const card = createCropCard(crop);
            cropsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading crops:', error);
        alert('Error loading crops: ' + error.message);
    }
}

// Load user's crops for activity section
async function loadUserCrops() {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        const { data: crops, error } = await supabase
            .from('crops_with_farmers')
            .select('*')
            .eq('farmer_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const cropsGrid = document.querySelector('#yourActivity .crops-grid');
        if (crops.length === 0) {
            cropsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-seedling"></i>
                    <h2 data-i18n="noCropsTitle">No Crops Added Yet</h2>
                    <p data-i18n="noCropsDesc">Start by adding your first crop!</p>
                </div>
            `;
            return;
        }

        cropsGrid.innerHTML = '';
        crops.forEach(crop => {
            const card = createCropCard(crop, true); // true for editable
            cropsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading your crops:', error);
        alert('Error loading your crops: ' + error.message);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { session, userType } = await checkAuth();
        if (!session) return;

        setupNavigation(userType);
        if (userType === 'farmer') {
            setupAddCropForm();
        }
        
        // Initialize browse filters
        await initMarketPrice();
        // copy market price options into browse filters
        const ms = document.getElementById('stateSelect');
        const md = document.getElementById('districtSelect');
        const mc = document.getElementById('cropSelect');
        const bsEl = document.getElementById('browseStateSelect');
        const bdEl = document.getElementById('browseDistrictSelect');
        const bcEl = document.getElementById('browseCropSelect');
        // Add default "All" options
        const lang = localStorage.getItem('lang') || 'en';
        [/* ... */].forEach(([key,val]) => {
          const opt = new Option(translations[lang][key], val);
          opt.setAttribute('data-i18n', key);
          bsEl.parentElement.querySelector('#' + key === 'allCrops' ? 'browseCropSelect' : key==='allDistricts'?'browseDistrictSelect':'browseStateSelect').add(opt);
        });
        // Populate browse filters with translated options
        ms.querySelectorAll('option').forEach(op => {
            if (op.value) {
                const key = op.value;
                const label = window.translations[lang][key] || op.text;
                const newOpt = new Option(label, key);
                newOpt.setAttribute('data-i18n', key);
                bsEl.add(newOpt);
            }
        });
        mc.querySelectorAll('option').forEach(op => {
            if (op.value) {
                const key = op.value;
                const label = window.translations[lang][key] || op.text;
                const newOpt = new Option(label, key);
                newOpt.setAttribute('data-i18n', key);
                bcEl.add(newOpt);
            }
        });
        bsEl.onchange = () => {
            // clear only district on state change
            md.length = 1;
            ms.value = bsEl.value;
            ms.onchange();
            bdEl.length = 1;
            // Populate translated district options
            md.querySelectorAll('option').forEach(op => {
                if (op.value) {
                    const key = op.value;
                    const label = translations[lang][key] || op.text;
                    const newOpt = new Option(label, key);
                    newOpt.setAttribute('data-i18n', key);
                    bdEl.add(newOpt);
                }
            });
            loadAllCrops();
        };
        bdEl.onchange = () => loadAllCrops();
        bcEl.onchange = () => loadAllCrops();
        
        // Populate initial district options for browse filters
        bsEl.onchange();
        // Apply translations once after all dropdowns are built
        if (window.applyLanguage) window.applyLanguage(localStorage.getItem('lang') || 'en');

        // Load initial content based on active section
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            if (activeSection.id === 'browseCrops') {
                loadAllCrops();
            } else if (activeSection.id === 'yourActivity' && userType === 'farmer') {
                loadUserCrops();
            }
        }
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Error initializing page: ' + error.message);
    }
});

// Helper function to create crop cards
function createCropCard(crop, isEditable = false) {
    // Map unit codes to display labels
    const unitLabels = { kg: 'Kilogram (kg)', quintal: 'Quintal (100kg)', tonne: 'Tonne (1000kg)', ton: 'Tonne (1000kg)' };
    const unitLabel = unitLabels[crop.quantity_type] || crop.quantity_type;
    const card = document.createElement('div');
    // Assign unique ID to each card for scrolling
    card.id = `crop-${crop.id}`;
    card.className = 'crop-card';
    
    // Create placeholder URL with the crop name
    const placeholderUrl = `https://placehold.co/600x600/e2e8f0/1e293b?text=${encodeURIComponent(crop.name)}`;
    
    // Determine farmer info from joined profiles or view
    const farmerName = crop.profiles?.full_name ?? crop.farmer_name;
    const farmerPhone = crop.profiles?.phone ?? crop.farmer_phone;

    // Create the card content
    const cardHTML = `
        <div class="image-container">
            <img src="${crop.photo_url || placeholderUrl}" 
                 alt="${crop.name}" 
                 onerror="this.src='${placeholderUrl}'"
                 loading="lazy" />
            ${isEditable ? `
                <div class="crop-actions">
                    <button class="edit-button" title="Edit crop" data-crop-id="${crop.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-button" title="Delete crop" data-crop-id="${crop.id}"><i class="fas fa-trash"></i></button>
                </div>
            ` : ''}
        </div>
        <div class="crop-details">
            <h3>${crop.name}</h3>
            <ul class="crop-info-list">
                <li><strong>Farmer:</strong> ${farmerName}, <strong>Phone:</strong> ${farmerPhone}</li>
                <li><strong>Quantity:</strong> ${crop.quantity} ${unitLabel}</li>
                <li><strong>Price:</strong> ₹${crop.price} per 1 ${unitLabel}</li>
            </ul>
        </div>
    `;
    card.innerHTML = cardHTML;

    // Add event listeners if editable
    if (isEditable) {
        const editBtn = card.querySelector('.edit-button');
        const deleteBtn = card.querySelector('.delete-button');
        
        if (editBtn) {
            editBtn.onclick = (e) => {
                e.stopPropagation();
                handleEditCrop(crop.id);
            };
        }
        
        if (deleteBtn) {
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                handleDeleteCrop(crop.id);
            };
        }
    }
    
    return card;
}

// Handle editing a crop
async function handleEditCrop(cropId) {
    try {
        // Track current editing ID
        currentEditingCropId = cropId;
        // Get form and photo preview elements
        const form = document.getElementById('addCropForm');
        const cropPhotoInput = document.getElementById('cropPhoto');
        const photoPreview = document.getElementById('cropPhotoPreview');
        // Fetch crop data
        const { data: crop, error } = await supabase
            .from('crops')
            .select('*')
            .eq('id', cropId)
            .single();

        if (error) throw error;

        // Show existing photo in preview
        if (photoPreview && crop.photo_url) {
            photoPreview.src = crop.photo_url;
            photoPreview.style.display = 'block';
        }
        const addCropBtn = document.getElementById('addCropBtn');
        // Show form in edit mode and hide add button
        form.style.display = 'block';
        // Smooth scroll to edit form
        form.scrollIntoView({ behavior: 'smooth' });
        if (addCropBtn) addCropBtn.style.display = 'none';
        const submitBtn = document.getElementById('formSubmitBtn');
        const cancelBtn = document.getElementById('formCancelBtn');
        
        if (!form || !submitBtn || !cancelBtn) {
            console.error('Required form elements not found');
            return;
        }

        const cropNameSelect = document.getElementById('cropName');
        const customCropGroup = document.getElementById('customCropGroup');
        const customCropName = document.getElementById('customCropName');

        // Handle custom crop names
        if (['rice', 'wheat', 'corn', 'potato', 'tomato'].includes(crop.name.toLowerCase())) {
            cropNameSelect.value = crop.name.toLowerCase();
            customCropGroup.style.display = 'none';
        } else {
            cropNameSelect.value = 'custom';
            customCropGroup.style.display = 'block';
            customCropName.value = crop.name;
        }

        document.getElementById('quantity').value = crop.quantity;
        document.getElementById('quantityType').value = crop.quantity_type;
        document.getElementById('price').value = crop.price;

        // Switch form to edit mode
        form.classList.add('active', 'edit-mode');
        submitBtn.textContent = 'Save Changes';
        cancelBtn.style.display = 'block';
        
        const noCropsMessage = document.getElementById('noCropsMessage');
        if (noCropsMessage) {
            noCropsMessage.style.display = 'none';
        }

        // Handle cancel button
        cancelBtn.onclick = () => {
            form.reset();
            form.classList.remove('active', 'edit-mode');
            submitBtn.textContent = 'Add Crop';
            cancelBtn.style.display = 'none';
            customCropGroup.style.display = 'none';
        };
    } catch (error) {
        console.error('Error loading crop details:', error);
        alert('Error loading crop details: ' + error.message);
    }
}

// Handle deleting a crop
async function handleDeleteCrop(cropId) {
    if (confirm('Are you sure you want to delete this crop?')) {
        try {
            const { error } = await supabase
                .from('crops')
                .delete()
                .eq('id', cropId);

            if (error) throw error;
            
            loadUserCrops();
            alert('Crop deleted successfully!');
        } catch (error) {
            console.error('Error deleting crop:', error);
            alert('Error deleting crop: ' + error.message);
        }
    }
}

// Gemini AI Studio API Key
const geminiApiKey = 'AIzaSyAI335LGoyu6P0EygejJk2iIdnY9t9qHJ8';

// Initialize Market Price filters
async function initMarketPrice() {
    const s = document.getElementById('stateSelect');
    const d = document.getElementById('districtSelect');
    const crop = document.getElementById('cropSelect');
    const customCropInput = document.getElementById('customCropInput');
    // clear only state and district filters
    [s,d].forEach(sel => sel.length = 1);
    // Use hardcoded list of all states
    const states = [
        'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
        'Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka',
        'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
        'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
        'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
    ];
    const lang = localStorage.getItem('lang') || 'en';
    states.forEach(st => {
        const key = st.replace(/ /g, '_');
        const label = window.translations[lang][key] || st;
        const opt = new Option(label, st);
        opt.setAttribute('data-i18n', key);
        s.add(opt);
    });
    // Populate crop dropdown with translation keys
    const cropKeys = [
        'rice','wheat','maize','sorghum','pearlMillet','fingerMillet','barley',
        'chickpea','pigeonPea','greenGram','blackGram','lentil',
        'groundnut','rapeseedMustard','soybean','sesame','sunflower',
        'sugarcane','cotton','tea','coffee','jute',
        'potato','tomato','onion','banana','mango'
    ];
    cropKeys.forEach(key => {
        const label = window.translations[lang][key] || key;
        const opt = new Option(label, key);
        opt.setAttribute('data-i18n', key);
        crop.add(opt);
    });
    // Include custom crop option
    const customOpt = new Option(window.translations[lang]['customCrop'] || 'Custom', 'custom');
    customOpt.setAttribute('data-i18n', 'customCrop');
    crop.add(customOpt);
    
    s.onchange = async () => {
        // clear only district on state change
        d.length = 1;
        const st = s.value;
        if (!st) return;
        // Crop dropdown remains static
        // Static districts for Andhra Pradesh
        if (st === 'Andhra Pradesh') {
            const apDistricts = [
                'Anantapur','Chittoor','East Godavari','Guntur','Kadapa',
                'Krishna','Kurnool','Nellore','Prakasam','Srikakulam',
                'Visakhapatnam','Vizianagaram','West Godavari'
            ];
            apDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Assam
        if (st === 'Assam') {
            const asDistricts = [
                'Baksa','Barpeta','Biswanath','Bongaigaon','Cachar','Charaideo','Chirang','Darrang',
                'Dhemaji','Dhubri','Dibrugarh','Dima Hasao','Goalpara','Golaghat','Hailakandi','Hojai',
                'Jorhat','Kamrup','Kamrup Metropolitan','Karbi Anglong','Karimganj','Kokrajhar','Lakhimpur',
                'Majuli','Morigaon','Nagaon','Nalbari','Sivasagar','Sonitpur','South Salmara-Mankachar',
                'Tinsukia','Udalguri','West Karbi Anglong'
            ];
            asDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Bihar
        if (st === 'Bihar') {
            const biDistricts = [
                'Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur','Buxar',
                'Darbhanga','East Champaran','Gaya','Gopalganj','Jamui','Jehanabad','Kaimur',
                'Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani','Munger',
                'Muzaffarpur','Nalanda','Nawada','Patna','Purnia','Rohtas','Saharsa','Samastipur',
                'Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul','Vaishali','West Champaran'
            ];
            biDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Chhattisgarh
        if (st === 'Chhattisgarh') {
            const cgDistricts = [
                'Balod','Baloda Bazar','Balrampur','Bastar','Bemetara','Bijapur','Bilaspur',
                'Dantewada','Dhamtari','Durg','Gariaband','Janjgir-Champa','Jashpur','Kabirdham',
                'Kanker','Kondagaon','Korba','Koriya','Mahasamund','Mungeli','Narayanpur',
                'Raigarh','Raipur','Rajnandgaon','Sukma','Surajpur','Surguja','Mohla-Manpur-Ambagarh Chowki'
            ];
            cgDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Goa
        if (st === 'Goa') {
            const goaDistricts = ['North Goa','South Goa'];
            goaDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Gujarat
        if (st === 'Gujarat') {
            const guDistricts = [
                'Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch',
                'Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka',
                'Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kutch','Kheda',
                'Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal',
                'Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar',
                'Tapi','Vadodara','Valsad'
            ];
            guDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Haryana
        if (st === 'Haryana') {
            const hrDistricts = [
                'Ambala','Bhiwani','Charkhi Dadri','Faridabad','Fatehabad','Gurugram',
                'Hisar','Jhajjar','Jind','Kaithal','Karnal','Kurukshetra','Mahendragarh',
                'Mewat','Palwal','Panchkula','Panipat','Rewari','Rohtak','Sirsa',
                'Sonipat','Yamunanagar'
            ];
            hrDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Himachal Pradesh
        if (st === 'Himachal Pradesh') {
            const hpDistricts = [
                'Bilaspur','Chamba','Hamirpur','Kangra','Kinnaur','Kullu',
                'Lahaul and Spiti','Mandi','Shimla','Sirmaur','Solan','Una'
            ];
            hpDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Jammu and Kashmir
        if (st === 'Jammu and Kashmir') {
            const jkDistricts = [
                'Anantnag','Bandipora','Baramulla','Budgam','Doda','Ganderbal','Jammu',
                'Kathua','Kishtwar','Kulgam','Kupwara','Poonch','Pulwama','Rajouri',
                'Ramban','Reasi','Samba','Shopian','Srinagar','Udhampur'
            ];
            jkDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Jharkhand
        if (st === 'Jharkhand') {
            const jhDistricts = [
                'Bokaro','Chatra','Deoghar','Dhanbad','Dumka','East Singhbhum','Garhwa',
                'Giridih','Godda','Gumla','Hazaribagh','Jamtara','Khunti','Koderma',
                'Latehar','Lohardaga','Pakur','Palamu','Ramgarh','Ranchi','Sahebganj',
                'Seraikela Kharsawan','Simdega','West Singhbhum'
            ];
            jhDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Karnataka
        if (st === 'Karnataka') {
            const knDistricts = [
                'Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar',
                'Chamarajanagar','Chikballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada',
                'Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar',
                'Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru',
                'Udupi','Uttara Kannada','Vijayapura','Yadgir'
            ];
            knDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Kerala
        if (st === 'Kerala') {
            const klDistricts = [
                'Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam',
                'Idukki','Ernakulam','Thrissur','Palakkad','Malappuram',
                'Kozhikode','Wayanad','Kannur','Kasargod'
            ];
            klDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Madhya Pradesh
        if (st === 'Madhya Pradesh') {
            const mpDistricts = [
                'Anuppur','Ashoknagar','Balaghat','Barwani','Betul','Bhind','Bhopal','Burhanpur',
                'Chhatarpur','Chhindwara','Damoh','Datia','Dewas','Dhar','Dindori','Guna','Gwalior',
                'Harda','Hoshangabad','Indore','Jabalpur','Jhabua','Katni','Khandwa','Khargone',
                'Mandla','Mandsaur','Morena','Narsinghpur','Neemuch','Panna','Rajgarh','Ratlam',
                'Rewa','Sagar','Satna','Sehore','Seoni','Shahdol','Shajapur','Sheopur',
                'Shivpuri','Sidhi','Singrauli','Tikamgarh','Ujjain','Umaria','Vidisha'
            ];
            mpDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Maharashtra
        if (st === 'Maharashtra') {
            const mhDistricts = [
                'Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana',
                'Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna',
                'Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nashik','Nanded',
                'Nandurbar','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri',
                'Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal'
            ];
            mhDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Manipur
        if (st === 'Manipur') {
            const mpDistricts = [
                'Bishnupur','Chandel','Churachandpur','Imphal East','Imphal West','Jiribam',
                'Kakching','Kamjong','Kangpokpi','Noney','Pherzawl','Senapati','Tamenglong',
                'Tengnoupal','Thoubal','Ukhrul'
            ];
            mpDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Meghalaya
        if (st === 'Meghalaya') {
            const mlDistricts = [
                'East Garo Hills','West Garo Hills','South Garo Hills','North Garo Hills',
                'East Khasi Hills','West Khasi Hills','South West Khasi Hills','Ri Bhoi',
                'East Jaintia Hills','West Jaintia Hills'
            ];
            mlDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Mizoram
        if (st === 'Mizoram') {
            const mzDistricts = [
                'Aizawl','Champhai','Hnahthial','Khawzawl','Kolasib',
                'Lawngtlai','Lunglei','Mamit','Saitual','Serchhip','Saiha'
            ];
            mzDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Nagaland
        if (st === 'Nagaland') {
            const ngDistricts = [
                'Dimapur','Kiphire','Kohima','Longleng','Mokokchung','Mon',
                'Noklak','Peren','Phek','Tuensang','Wokha','Zunheboto'
            ];
            ngDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Odisha
        if (st === 'Odisha') {
            const odDistricts = [
                'Angul','Balangir','Balasore','Bargarh','Bhadrak','Boudh','Cuttack',
                'Deogarh','Dhenkanal','Gajapati','Ganjam','Jagatsinghapur','Jajpur',
                'Jharsuguda','Kalahandi','Kandhamal','Kendrapara','Keonjhar','Khordha',
                'Koraput','Malkangiri','Mayurbhanj','Nabarangpur','Nayagarh','Nuapada',
                'Puri','Rayagada','Sambalpur','Sonepur','Sundergarh'
            ];
            odDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Punjab
        if (st === 'Punjab') {
            const pbDistricts = [
                'Amritsar','Barnala','Bathinda','Faridkot','Fatehgarh Sahib','Firozpur','Gurdaspur',
                'Hoshiarpur','Jalandhar','Kapurthala','Ludhiana','Mansa','Moga','Muktsar',
                'Shaheed Bhagat Singh Nagar','Pathankot','Patiala','Rupnagar','Sangrur','Tarn Taran'
            ];
            pbDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Rajasthan
        if (st === 'Rajasthan') {
            const rjDistricts = [
                'Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner',
                'Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Hanumangarh',
                'Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli','Kota',
                'Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar','Sirohi','Sri Ganganagar',
                'Tonk','Udaipur'
            ];
            rjDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Sikkim
        if (st === 'Sikkim') {
            ['East Sikkim','North Sikkim','South Sikkim','West Sikkim']
                .forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Tamil Nadu
        if (st === 'Tamil Nadu') {
            const tnDistricts = ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri',
                'Dindigul','Erode','Kallakurichi','Kancheepuram','Kanniyakumari','Karur','Krishnagiri',
                'Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukottai',
                'Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi',
                'Tiruchirappalli','Tirunelveli','Tirupattur','Tiruppur','Tiruvallur','Tiruvannamalai',
                'Tiruvarur','Vellore','Viluppuram','Virudhunagar'];
            tnDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Telangana
        if (st === 'Telangana') {
            const tgDistricts = ['Adilabad','Bhadradri Kothagudem','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalapally',
                'Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Komaram Bheem Asifabad','Mahabubabad',
                'Mahabubnagar','Mancherial','Medak','Medchal–Malkajgiri','Mulugu','Nagarkurnool','Nalgonda',
                'Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Rangareddy','Sangareddy',
                'Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal Rural','Warangal Urban','Yadadri Bhuvanagiri'];
            tgDistricts.forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Tripura
        if (st === 'Tripura') {
            ['Dhalai','Gomati','Khowai','North Tripura','Sepahijala','South Tripura','Unakoti','West Tripura']
                .forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for Uttarakhand
        if (st === 'Uttarakhand') {
            ['Almora','Bageshwar','Chamoli','Champawat','Dehradun','Haridwar','Nainital','Pauri Garhwal',
                'Pithoragarh','Rudraprayag','Tehri Garhwal','Udham Singh Nagar','Uttarkashi']
                .forEach(x => d.add(new Option(x, x)));
            return;
        }
        // Static districts for West Bengal
        if (st === 'West Bengal') {
            ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri',
                'Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman',
                'Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas']
                .forEach(x => d.add(new Option(x, x)));
            return;
        }
    };

    // Show/hide custom crop input based on selection
    crop.addEventListener('change', () => {
        if (crop.value === 'custom') {
            customCropInput.style.display = 'inline-block';
        } else {
            customCropInput.style.display = 'none';
            customCropInput.value = '';
        }
    });
}

// Handle Get Accurate Price button click
document.getElementById('getPriceBtn').addEventListener('click', async () => {
  const state = document.getElementById('stateSelect').value;
  const district = document.getElementById('districtSelect').value;
  let crop = document.getElementById('cropSelect').value;
  const customInput = document.getElementById('customCropInput').value;
  if (crop === 'custom') crop = customInput || '';
  if (!state || !district || !crop) {
    alert('Please select State, District and Crop Name'); return;
  }
  const date = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  // Fetch price via Gemini AI Studio with error handling
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    const prompt = `Provide today's market price range for ${crop} in ${district}, ${state}, per kilogram. Respond as JSON: {"low":<value>,"high":<value>}.`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!resp.ok) throw new Error(`API error ${resp.status}`);
    const result = await resp.json();
    console.log('Gemini result', result);
    const candidate = result.candidates?.[0];
    const raw = candidate?.content ?? candidate?.output?.content ?? candidate?.output?.text ?? '';
    let priceLow = '?', priceHigh = '?';
    try {
      const p = JSON.parse(raw);
      priceLow = p.low;
      priceHigh = p.high;
    } catch(err) {
      console.error('Price parse error', err, raw);
      // Fallback: extract numbers from raw text
      const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
      const nums = text.match(/\d+(?:\.\d+)?/g) || [];
      if (nums.length >= 2) {
        [priceLow, priceHigh] = nums;
      }
    }
    const container = document.getElementById('marketPriceTable');
    container.innerHTML = `<p>Date: ${date}</p><p>Price Range for ${crop}: ₹${priceLow} - ₹${priceHigh} per kg</p>`;
    return;
  } catch(err) {
    console.error('Fetch price error', err);
    alert('Error fetching price: ' + err.message);
    return;
  }
  const container = document.getElementById('marketPriceTable');
  container.innerHTML = `<p>Date: ${date}</p><p>Price Range for ${crop}: ₹? - ₹? per kg</p>`;
});

// Initialize market price dropdowns on script load
initMarketPrice();
// Apply translations once after all dropdowns are built
if (window.applyLanguage) window.applyLanguage(localStorage.getItem('lang') || 'en');