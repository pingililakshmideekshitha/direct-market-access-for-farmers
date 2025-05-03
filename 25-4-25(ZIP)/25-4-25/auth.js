// Import Supabase client
const supabase = window.supabase;

// Initialize Supabase client
const supabaseUrl = 'https://adtyjmhqupoqxamudhqe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkdHlqbWhxdXBvcXhhbXVkaHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMjk4NjcsImV4cCI6MjA2MDkwNTg2N30.0Ugy2oKdeifq_a8XPXWTZuCzuNzQ5VFmUi5HEhP4zyA';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
// Expose client globally for other scripts
window.supabaseClient = supabaseClient;

// Get current page name
const currentPage = window.location.pathname.split('/').pop();

// Handle login form submission
if (currentPage === 'login.html') {
    const loginForm = document.getElementById('loginForm');
    const phoneInput = document.getElementById('phone');
    const otpInput = document.getElementById('otp');
    const otpGroup = document.getElementById('otpGroup');
    const submitBtn = document.getElementById('submitBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = phoneInput.value.trim();
            const otp = otpInput.value.trim();
            
            try {
                submitBtn.disabled = true;

                if (!otp) {
                    // First step: Send OTP for existing auth users only
                    console.log('Sending OTP to:', phone);
                    const { data, error } = await supabaseClient.auth.signInWithOtp({
                        phone: phone,
                        options: { shouldCreateUser: false }
                    });
                    if (error) {
                        console.error('OTP send error:', error);
                        alert('Phone number not registered. Please sign up first.');
                        submitBtn.disabled = false;
                        return;
                    }

                    console.log('OTP sent successfully:', data);

                    // Show OTP input
                    otpGroup.style.display = 'block';
                    submitBtn.textContent = 'Verify OTP';
                    phoneInput.readOnly = true;
                } else {
                    // Second step: Verify OTP
                    console.log('Verifying OTP for:', phone);
                    const { data: verifyData, error: verifyErr } = await supabaseClient.auth.verifyOtp({
                        phone: phone,
                        token: otp,
                        type: 'sms'
                    });

                    if (verifyErr) throw verifyErr;

                    console.log('OTP verified successfully:', verifyData);

                    // Retrieve or create user profile
                    const userId = verifyData.user.id;
                    let { data: profile, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();
                    if (profileError || !profile) {
                        console.log('No existing profile, creating new.');
                        const meta = verifyData.user.user_metadata || {};
                        const { error: upErr } = await supabaseClient
                            .from('profiles')
                            .upsert({
                                id: userId,
                                full_name: meta.full_name || '',
                                phone: phone,
                                user_type: meta.user_type || '',
                                state: meta.state || null,
                                district: meta.district || null,
                                village_city: meta.village_city || null,
                                avatar_url: meta.avatar_url || ''
                            }, { onConflict: 'id' });
                        if (upErr) console.error('Profile upsert error:', upErr);
                        // Fetch newly created profile
                        ({ data: profile } = await supabaseClient.from('profiles').select('*').eq('id', userId).single());
                    }

                    // Store profile locally
                    localStorage.setItem('userProfile', JSON.stringify(profile));

                    // Redirect on login
                    window.location.href = 'marketplace.html';
                }
            } catch (error) {
                console.error('Authentication error:', error.message || error, error);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}

// Handle signup form submission
if (currentPage === 'signup.html') {
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const userTypeInput = document.getElementById('userType');
    const otpInput = document.getElementById('otp');
    const otpGroup = document.getElementById('otpGroup');
    const submitBtn = document.getElementById('submitBtn');

    // Populate state and district dropdowns
    const signupState = document.getElementById('signupState');
    const signupDistrict = document.getElementById('signupDistrict');
    const states = [
      'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh',
      'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
      'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
    ];
    states.forEach(st => signupState.add(new Option(st, st)));
    signupState.addEventListener('change', () => {
      // reset districts
      signupDistrict.options.length = 1;
      const st = signupState.value;
      signupDistrict.disabled = !st;
      if (!st) return;
      const stateDistrictMap = {
        'Andhra Pradesh': ['Anantapur','Chittoor','East Godavari','Guntur','Kadapa','Krishna','Kurnool','Nellore','Prakasam','Srikakulam','Visakhapatnam','Vizianagaram','West Godavari'],
        'Assam': ['Baksa','Barpeta','Biswanath','Bongaigaon','Cachar','Charaideo','Chirang','Darrang','Dhemaji','Dhubri','Dibrugarh','Dima Hasao','Goalpara','Golaghat','Hailakandi','Hojai','Jorhat','Kamrup','Kamrup Metropolitan','Karbi Anglong','Karimganj','Kokrajhar','Lakhimpur','Majuli','Morigaon','Nagaon','Nalbari','Sivasagar','Sonitpur','South Salmara-Mankachar','Tinsukia','Udalguri','West Karbi Anglong'],
        'Bihar': ['Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur','Buxar','Darbhanga','East Champaran','Gaya','Gopalganj','Jamui','Jehanabad','Kaimur','Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani','Munger','Muzaffarpur','Nalanda','Nawada','Patna','Purnia','Rohtas','Saharsa','Samastipur','Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul','Vaishali','West Champaran'],
        'Chhattisgarh': ['Balod','Baloda Bazar','Balrampur','Bastar','Bemetara','Bijapur','Bilaspur','Dantewada','Dhamtari','Durg','Gariaband','Janjgir-Champa','Jashpur','Kabirdham','Kanker','Kondagaon','Korba','Koriya','Mahasamund','Mungeli','Narayanpur','Raigarh','Raipur','Rajnandgaon','Sukma','Surajpur','Surguja','Mohla-Manpur-Ambagarh Chowki'],
        'Goa': ['North Goa','South Goa'],
        'Gujarat': ['Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch','Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka','Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kutch','Kheda','Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal','Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar','Tapi','Vadodara','Valsad'],
        'Haryana': ['Ambala','Bhiwani','Charkhi Dadri','Faridabad','Fatehabad','Gurugram','Hisar','Jhajjar','Jind','Kaithal','Karnal','Kurukshetra','Mahendragarh','Mewat','Palwal','Panchkula','Panipat','Rewari','Rohtak','Sirsa','Sonipat','Yamunanagar'],
        'Himachal Pradesh': ['Bilaspur','Chamba','Hamirpur','Kangra','Kinnaur','Kullu','Lahaul and Spiti','Mandi','Shimla','Sirmaur','Solan','Una'],
        'Jammu and Kashmir': ['Anantnag','Bandipora','Baramulla','Budgam','Doda','Ganderbal','Jammu','Kathua','Kishtwar','Kulgam','Kupwara','Poonch','Pulwama','Rajouri','Ramban','Reasi','Samba','Shopian','Srinagar','Udhampur'],
        'Jharkhand': ['Bokaro','Chatra','Deoghar','Dhanbad','Dumka','East Singhbhum','Garhwa','Giridih','Godda','Gumla','Hazaribagh','Jamtara','Khunti','Koderma','Latehar','Lohardaga','Pakur','Palamu','Ramgarh','Ranchi','Sahebganj','Seraikela Kharsawan','Simdega','West Singhbhum'],
        'Karnataka': ['Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar','Chamarajanagar','Chikballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayapura','Yadgir'],
        'Kerala': ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasargod'],
        'Madhya Pradesh': ['Anuppur','Ashoknagar','Balaghat','Barwani','Betul','Bhind','Bhopal','Burhanpur','Chhatarpur','Chhindwara','Damoh','Datia','Dewas','Dhar','Dindori','Guna','Gwalior','Harda','Hoshangabad','Indore','Jabalpur','Jhabua','Katni','Khandwa','Khargone','Mandla','Mandsaur','Morena','Narsinghpur','Neemuch','Panna','Rajgarh','Ratlam','Rewa','Sagar','Satna','Sehore','Seoni','Shahdol','Shajapur','Sheopur','Shivpuri','Sidhi','Singrauli','Tikamgarh','Ujjain','Umaria','Vidisha'],
        'Maharashtra': ['Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana','Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nashik','Nanded','Nandurbar','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal'],
        'Manipur': ['Bishnupur','Chandel','Churachandpur','Imphal East','Imphal West','Jiribam','Kakching','Kamjong','Kangpokpi','Noney','Pherzawl','Senapati','Tamenglong','Tengnoupal','Thoubal','Ukhrul'],
        'Meghalaya': ['East Garo Hills','West Garo Hills','South Garo Hills','North Garo Hills','East Khasi Hills','West Khasi Hills','South West Khasi Hills','Ri Bhoi','East Jaintia Hills','West Jaintia Hills'],
        'Mizoram': ['Aizawl','Champhai','Hnahthial','Khawzawl','Kolasib','Lawngtlai','Lunglei','Mamit','Saitual','Serchhip','Saiha'],
        'Nagaland': ['Dimapur','Kiphire','Kohima','Longleng','Mokokchung','Mon','Noklak','Peren','Phek','Tuensang','Wokha','Zunheboto'],
        'Odisha': ['Angul','Balangir','Balasore','Bargarh','Bhadrak','Boudh','Cuttack','Deogarh','Dhenkanal','Gajapati','Ganjam','Jagatsinghapur','Jajpur','Jharsuguda','Kalahandi','Kandhamal','Kendrapara','Keonjhar','Khordha','Koraput','Malkangiri','Mayurbhanj','Nabarangpur','Nayagarh','Nuapada','Puri','Rayagada','Sambalpur','Sonepur','Sundergarh'],
        'Punjab': ['Amritsar','Barnala','Bathinda','Faridkot','Fatehgarh Sahib','Firozpur','Gurdaspur','Hoshiarpur','Jalandhar','Kapurthala','Ludhiana','Mansa','Moga','Muktsar','Shaheed Bhagat Singh Nagar','Pathankot','Patiala','Rupnagar','Sangrur','Tarn Taran'],
        'Rajasthan': ['Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner','Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Hanumangarh','Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli','Kota','Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar','Sirohi','Sri Ganganagar','Tonk','Udaipur'],
        'Sikkim': ['East Sikkim','North Sikkim','South Sikkim','West Sikkim'],
        'Tamil Nadu': ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Kanniyakumari','Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupattur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'],
        'Telangana': ['Adilabad','Bhadradri Kothagudem','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalapally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Komaram Bheem Asifabad','Mahabubabad','Mahabubnagar','Mancherial','Medak','Medchal–Malkajgiri','Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Ranga Reddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal Rural','Warangal Urban','Yadadri Bhuvanagiri'],
        'Tripura': ['Dhalai','Gomati','Khowai','North Tripura','Sepahijala','South Tripura','Unakoti','West Tripura'],
        'Uttar Pradesh': ['Agra','Aligarh','Allahabad','Ambedkar Nagar','Amethi','Amroha','Auraiya','Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banaras','Barabanki','Bareilly','Basti','Bhadohi','Bijnor','Bulandshahr','Chandauli','Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad','Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur','Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi','Kannauj','Kanpur Dehat','Kanpur Nagar','Kasganj','Kaushambi','Kheri','Kushinagar','Lakhimpur Kheri','Lalitpur','Lucknow','Maharajganj','Mahoba','Mainpuri','Mathura','Mau','Meerut','Mirzapur','Moradabad','Muzaffarnagar','Pilibhit','Pratapgarh','Prayagraj','Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar','Shahjahanpur','Shamli','Shrawasti','Siddharthnagar','Sitapur','Sonbhadra','Sultanpur','Unnao','Varanasi'],
        'Uttarakhand': ['Almora','Bageshwar','Chamoli','Champawat','Dehradun','Haridwar','Nainital','Pauri Garhwal','Pithoragarh','Rudraprayag','Tehri Garhwal','Udham Singh Nagar','Uttarkashi'],
        'West Bengal': ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas']
      };
      const districts = stateDistrictMap[st] || [];
      districts.forEach(d => signupDistrict.add(new Option(d, d)));
    });

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = fullNameInput.value.trim();
            const phone = phoneInput.value.trim();
            const userType = userTypeInput.value;
            const state = signupState.value;
            const district = signupDistrict.value;
            const villageCity = document.getElementById('villageCity').value.trim();
            const otp = otpInput.value.trim();
            
            try {
                submitBtn.disabled = true;

                if (!otp) {
                    // First step: Send OTP and create auth user with metadata
                    console.log('Sending OTP to:', phone);
                    const { data, error } = await supabaseClient.auth.signInWithOtp({
                        phone: phone,
                        options: {
                            data: {
                                full_name: fullName,
                                user_type: userType,
                                state: state,
                                district: district,
                                village_city: villageCity
                            }
                        }
                    });
                    if (error) throw error;

                    console.log('OTP sent successfully:', data);

                    // Show OTP input
                    otpGroup.style.display = 'block';
                    submitBtn.textContent = 'Verify OTP';
                    phoneInput.readOnly = true;
                    fullNameInput.readOnly = true;
                    userTypeInput.disabled = true;
                } else {
                    // Second step: Verify OTP
                    console.log('Verifying OTP for:', phone);
                    const { data, error } = await supabaseClient.auth.verifyOtp({
                        phone: phone,
                        token: otp,
                        type: 'sms'
                    });

                    if (error) throw error;

                    console.log('OTP verified successfully:', data);

                    // Save user profile
                    const userId = data.user.id;
                    const { error: dbError } = await supabaseClient
                        .from('profiles')
                        .upsert(
                            { id: userId, full_name: fullName, phone, user_type: userType, state, district, village_city: villageCity },
                            { onConflict: 'id' }
                        );

                    if (dbError) throw dbError;
                    // Redirect on success
                    window.location.href = 'marketplace.html';
                }
            } catch (error) {
                console.error('Signup error:', error.message || error, error);
                alert('Error: ' + (error.message || JSON.stringify(error)));
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}