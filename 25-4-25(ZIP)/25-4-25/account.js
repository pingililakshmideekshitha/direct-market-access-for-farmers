// Elements
const nameDisplay = document.getElementById('nameDisplay');
const phoneDisplay = document.getElementById('phoneDisplay');
const userTypeDisplay = document.getElementById('userTypeDisplay');
const stateDisplay = document.getElementById('stateDisplay');
const districtDisplay = document.getElementById('districtDisplay');
const villageCityDisplay = document.getElementById('villageCityDisplay');
const profilePhoto = document.getElementById('profilePhoto');
const avatarPicker = document.getElementById('avatarPicker');
const editAvatarInput = document.getElementById('editAvatar');
const editStateInput = document.getElementById('editState');
const editDistrictInput = document.getElementById('editDistrict');
const editVillageCityInput = document.getElementById('editVillageCity');

// Check if user is logged in
async function checkUser() {
    try {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        
        if (error || !user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }

        // Fetch user profile data
        const { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            return;
        }

        // If no profile row exists, show defaults
        if (!profile) {
            // Fallback to auth user metadata
            nameDisplay.textContent = user.user_metadata?.full_name || 'Not set';
            phoneDisplay.textContent = user.phone || user.user_metadata?.phone || 'Not set';
            userTypeDisplay.textContent = user.user_metadata?.user_type || 'Not set';
            stateDisplay.textContent = 'Not set';
            districtDisplay.textContent = 'Not set';
            villageCityDisplay.textContent = 'Not set';
            if (user.user_metadata?.avatar_url) {
                profilePhoto.src = user.user_metadata.avatar_url;
                profilePhoto.style.display = 'block';
                document.getElementById('profilePlaceholder').style.display = 'none';
            } else {
                profilePhoto.style.display = 'none';
                document.getElementById('profilePlaceholder').style.display = 'block';
            }
            return;
        }

        // Display user data
        nameDisplay.textContent = profile.full_name || 'Not set';
        phoneDisplay.textContent = profile.phone || user.phone || 'Not set';
        userTypeDisplay.textContent = profile.user_type || 'Not set';
        // Display location details
        stateDisplay.textContent = profile.state || 'Not set';
        districtDisplay.textContent = profile.district || 'Not set';
        villageCityDisplay.textContent = profile.village_city || 'Not set';
        
        // Show profile photo if URL exists
        if (profile.avatar_url) {
            profilePhoto.src = profile.avatar_url;
            profilePhoto.style.display = 'block';
            document.getElementById('profilePlaceholder').style.display = 'none';
        } else {
            profilePhoto.style.display = 'none';
            document.getElementById('profilePlaceholder').style.display = 'block';
        }

        console.log('Profile loaded:', profile); // Debug log
    } catch (error) {
        console.error('Error in checkUser:', error);
    }
}

// Handle logout
async function handleLogout() {
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
            return;
        }
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error in handleLogout:', error);
    }
}

// Expose global handler for inline button
window.handleEditProfile = () => {
    const editBtn = document.querySelector('.profile-container > .profile-actions .edit-button');
    if (editBtn) editBtn.click();
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Default to placeholder until real avatar loads
    const placeholder = document.getElementById('profilePlaceholder');
    profilePhoto.style.display = 'none';
    placeholder.style.display = 'flex';
    // Fallback to placeholder if image fails to load
    profilePhoto.onerror = () => {
        profilePhoto.style.display = 'none';
        placeholder.style.display = 'flex';
    };
    console.log('Page loaded, checking user...');
    checkUser();

    const displayActions = document.querySelector('.profile-container > .profile-actions');
    const profileInfo = document.querySelector('.profile-info');
    const editBtn = document.querySelector('.profile-container > .profile-actions .edit-button');
    const editProfileForm = document.getElementById('editProfileForm');
    const formActions = editProfileForm.querySelector('.profile-actions');
    const editNameInput = document.getElementById('editName');
    const editPhoneInput = document.getElementById('editPhone');
    const cancelBtn = document.getElementById('cancelEditProfile');
    // Wire logout button
    const logoutBtn = document.querySelector('.profile-container > .profile-actions .logout-button');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Toggle avatar action menu
    const avatarMenu = document.getElementById('avatarMenu');
    avatarPicker.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarMenu.style.display = avatarMenu.style.display === 'block' ? 'none' : 'block';
    });
    // Close menu on outside click
    document.addEventListener('click', () => { avatarMenu.style.display = 'none'; });
    // Handle menu actions
    document.getElementById('updatePhoto').addEventListener('click', () => { editAvatarInput.click(); avatarMenu.style.display='none'; });
    document.getElementById('removePhoto').addEventListener('click', async () => {
        avatarMenu.style.display='none';
        profilePhoto.style.display='none';
        placeholder.style.display='flex';
        // Remove from storage and profile
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        await window.supabaseClient.storage.from('avatars').remove([`${user.id}.jpg`]);
        await window.supabaseClient.from('profiles').update({ avatar_url: null }).eq('id', user.id);
    });

    // Preview selected avatar image via FileReader (avoids blob URL errors)
    editAvatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            profilePhoto.src = evt.target.result;
            profilePhoto.style.display = 'block';
            document.getElementById('profilePlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    editBtn.addEventListener('click', () => {
        // Prefill current values in inputs
        editNameInput.value = nameDisplay.textContent.trim();
        editPhoneInput.value = phoneDisplay.textContent.trim();
        editStateInput.value = stateDisplay.textContent.trim();
        editDistrictInput.value = districtDisplay.textContent.trim();
        editVillageCityInput.value = villageCityDisplay.textContent.trim();
        console.log('Prefilled edit form:', editNameInput.value, editPhoneInput.value);
        // Show form, hide display and show camera icon
        profileInfo.style.display = 'none';
        displayActions.style.display = 'none';
        editProfileForm.style.display = 'block';
        avatarPicker.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        // Hide form, show display
        editProfileForm.style.display = 'none';
        profileInfo.style.display = 'block';
        displayActions.style.display = 'flex';
        avatarPicker.style.display = 'none';
    });

    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Prepare update payload
        const updates = {
            full_name: editNameInput.value,
            phone: editPhoneInput.value,
            state: editStateInput.value,
            district: editDistrictInput.value,
            village_city: editVillageCityInput.value
        };
        // Get current user for storage operations and ID
        const { data: { user }, error: userErr } = await window.supabaseClient.auth.getUser();
        if (userErr) return console.error('Auth error', userErr);
        // If avatar file selected, upload to Supabase storage
        if (editAvatarInput.files && editAvatarInput.files[0]) {
            const file = editAvatarInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}.${fileExt}`;
            // Upload and overwrite existing
            const { error: storageError } = await window.supabaseClient.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
            if (storageError) return console.error('Storage upload error', storageError);
            const { data: publicUrlData } = window.supabaseClient.storage
                .from('avatars')
                .getPublicUrl(fileName);
            updates.avatar_url = publicUrlData.publicUrl;
        }
        // Update profile in database
        const { error } = await window.supabaseClient.from('profiles').update(updates).eq('id', user.id);
        if (error) return console.error('Update error', error);
        // Reflect changes
        nameDisplay.textContent = updates.full_name;
        phoneDisplay.textContent = updates.phone;
        stateDisplay.textContent = updates.state;
        districtDisplay.textContent = updates.district;
        villageCityDisplay.textContent = updates.village_city;
        // Update displayed avatar from saved URL
        if (updates.avatar_url) {
            profilePhoto.src = updates.avatar_url;
            profilePhoto.style.display = 'block';
            document.getElementById('profilePlaceholder').style.display = 'none';
        }
        // Hide form, show display and hide camera icon
        editProfileForm.style.display = 'none';
        profileInfo.style.display = 'block';
        displayActions.style.display = 'flex';
        avatarPicker.style.display = 'none';
    });
});