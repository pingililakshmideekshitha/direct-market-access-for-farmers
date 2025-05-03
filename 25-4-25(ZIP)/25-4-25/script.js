// Initialize Supabase client for index page
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = 'https://adtyjmhqupoqxamudhqe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkdHlqbWhxdXBvcXhhbXVkaHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMjk4NjcsImV4cCI6MjA2MDkwNTg2N30.0Ugy2oKdeifq_a8XPXWTZuCzuNzQ5VFmUi5HEhP4zyA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Translation mappings for i18n
const translations = {
  en: {
    phonePlaceholder: "Enter your phone number with country code (e.g., +91)",
    fullNamePlaceholder: "Enter your full name",
    villageCityPlaceholder: "Enter your village or city",
    otpPlaceholder: "Enter OTP",
    getOtpBtn: "Get OTP",
    userTypePlaceholder: "Select user type",
    statePlaceholder: "Select State",
    districtPlaceholder: "Select District",
    loginTitle: "Welcome Back",
    loginSubtitle: "Login to your account",
    signupTitle: "Create Account",
    signupSubtitle: "Join Farm Connect today",
    pageTitle: "Farm Connect - Direct Farm-to-Market Platform",
    appTitle: "Farm Connect",
    home: "Home",
    login: "Login",
    signup: "Sign Up",
    marketplace: "Marketplace",
    profile: "Profile",
    getStartedBtn: "Get Started",
    heroTitle: "Connect Farms to Markets with AI",
    heroSubtitle: "Bridge the gap between farmers and buyers — revolutionizing agricultural trade",
    aboutTitle: "About Our Platform",
    benefit1Title: "Direct Connection",
    benefit1Desc: "Farm Connect transforms agricultural commerce by connecting farmers directly with buyers, eliminating unnecessary intermediaries.",
    benefit2Title: "Fair Trade",
    benefit2Desc: "Our platform ensures farmers receive fair prices for their produce, while buyers gain access to fresh, high-quality products at competitive rates.",
    benefit3Title: "Sustainable Growth",
    benefit3Desc: "This efficient model creates value for everyone involved, promotes sustainable farming, and strengthens the farm-to-market supply chain.",
    howItWorksTitle: "How It Works",
    step1Title: "Register & List",
    step1Desc: "Farmers create their profile and list their produce with detailed information about quality and quantity.",
    step2Title: "Connect & Negotiate",
    step2Desc: "Buyers browse listings and connect directly with farmers to negotiate prices and terms.",
    step3Title: "Trade & Grow",
    step3Desc: "Complete secure transactions and build long-term relationships for sustainable growth.",
    footerText: " 2024 Farm Connect. All rights reserved.",
    // Account Page
    notSet: "Not set",
    editProfileBtn: "Edit Profile",
    logoutBtn: "Log Out",
    fullNameLabel: "Full Name",
    phoneLabel: "Phone Number",
    stateLabel: "State",
    districtLabel: "District",
    villageCityLabel: "Village/City",
    cancelEditProfileBtn: "Cancel",
    saveChangesBtn: "Save Changes",
    profileTitle: "Profile",
    userTypeLabel: "User Type",
    loadingText: "Loading...",
    updatePhotoMenuItem: "Update Photo",
    removePhotoMenuItem: "Remove Photo",
    defaultUserIconAlt: "Default User Icon",
    profilePhotoAlt: "Profile Photo",
    // Signup Page Labels
    fullNameLabel: "Full Name",
    phoneLabel: "Phone Number",
    userTypePrompt: "I am a",
    stateLabel: "State",
    districtLabel: "District",
    villageCityLabel: "Village name/City name",
    otpLabel: "OTP",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    farmerOption: "Farmer",
    buyerOption: "Buyer",
    // Marketplace Page
    marketplaceTitle: "Marketplace",
    browseCrops: "Browse Crops",
    marketPrice: "Market Price",
    yourActivity: "Your Activity",
    diseaseDetector: "Disease Detector",
    noCropsTitle: "No Crops Available",
    noCropsDesc: "No farmers have added their crops yet. Check back later!",
    cropSelectLabel: "Crop Name",
    selectCrop: "Select a crop",
    customCropPlaceholder: "Enter custom crop name",
    getPriceBtn: "Get Accurate Price",
    addCropBtn: "Add Crop",
    cropNameLabel: "Crop Name",
    customCropNameLabel: "Custom Crop Name",
    cropPhotoLabel: "Crop Photo",
    quantityLabel: "Quantity",
    quantityTypeLabel: "Quantity Type",
    quantityUnitPlaceholder: "Select unit",
    priceLabel: "Price (₹)",
    cancelBtn: "Cancel",
    saveCropBtn: "Save Crop",
    diseaseDetectorDesc: "Use our AI-powered tool to analyze your crop and detect potential diseases instantly.",
    analyzeNowBtn: "Analyze Now",
    allStates: "All States",
    allDistricts: "All Districts",
    allCrops: "All Crops",
    // Crop options
    rice: "Rice",
    wheat: "Wheat",
    maize: "Maize",
    sorghum: "Sorghum",
    pearlMillet: "Pearl Millet (Bajra)",
    fingerMillet: "Finger Millet (Ragi)",
    barley: "Barley",
    chickpea: "Chickpea (Gram)",
    pigeonPea: "Pigeon Pea (Tur)",
    greenGram: "Green Gram (Moong)",
    blackGram: "Black Gram (Urad)",
    lentil: "Lentil",
    groundnut: "Groundnut",
    rapeseedMustard: "Rapeseed & Mustard",
    soybean: "Soybean",
    sesame: "Sesame (Til)",
    sunflower: "Sunflower",
    sugarcane: "Sugarcane",
    cotton: "Cotton",
    tea: "Tea",
    coffee: "Coffee",
    jute: "Jute",
    potato: "Potato",
    tomato: "Tomato",
    onion: "Onion",
    banana: "Banana",
    mango: "Mango",
    customCrop: "Custom",
    // Quantity units
    unitKg: "Kilogram (kg)",
    unitQuintal: "Quintal (100kg)",
    unitTonne: "Tonne (1000kg)",
    // State names
    Andhra_Pradesh: "Andhra Pradesh",
    Assam: "Assam",
    Bihar: "Bihar",
    Chhattisgarh: "Chhattisgarh",
    Goa: "Goa",
    Gujarat: "Gujarat",
    Haryana: "Haryana",
    Himachal_Pradesh: "Himachal Pradesh",
    Jammu_and_Kashmir: "Jammu and Kashmir",
    Jharkhand: "Jharkhand",
    Karnataka: "Karnataka",
    Kerala: "Kerala",
    Madhya_Pradesh: "Madhya Pradesh",
    Maharashtra: "Maharashtra",
    Manipur: "Manipur",
    Meghalaya: "Meghalaya",
    Mizoram: "Mizoram",
    Nagaland: "Nagaland",
    Odisha: "Odisha",
    Punjab: "Punjab",
    Rajasthan: "Rajasthan",
    Sikkim: "Sikkim",
    Tamil_Nadu: "Tamil Nadu",
    Telangana: "Telangana",
    Tripura: "Tripura",
    Uttar_Pradesh: "Uttar Pradesh",
    Uttarakhand: "Uttarakhand",
    West_Bengal: "West Bengal",
  },
  hi: {
    phonePlaceholder: "देश कोड के साथ अपना फोन नंबर दर्ज करें (जैसे +91)",
    fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
    villageCityPlaceholder: "अपना गांव या शहर दर्ज करें",
    otpPlaceholder: "OTP दर्ज करें",
    getOtpBtn: "OTP प्राप्त करें",
    userTypePlaceholder: "उपयोगकर्ता प्रकार चुनें",
    statePlaceholder: "राज्य चुनें",
    districtPlaceholder: "जिला चुनें",
    loginTitle: "वापसी पर स्वागत है",
    loginSubtitle: "अपने खाते में लॉगिन करें",
    signupTitle: "खाता बनाएँ",
    signupSubtitle: "आज ही फार्म कनेक्ट से जुड़ें",
    pageTitle: "फार्म कनेक्ट - डायरेक्ट फार्म-टू-मार्केट प्लेटफ़ॉर्म",
    appTitle: "फार्म कनेक्ट",
    home: "होम",
    login: "लॉगिन",
    signup: "साइन अप",
    marketplace: "मार्केटप्लेस",
    profile: "प्रोफ़ाइल",
    getStartedBtn: "शुरू करें",
    heroTitle: "AI के साथ फार्म्स को मार्केट्स से कनेक्ट करें",
    heroSubtitle: "किसानों और खरीदारों के बीच की खाई को पाटें — कृषि व्यापार में क्रांति लाएं",
    aboutTitle: "हमारा प्लेटफ़ॉर्म",
    benefit1Title: "प्रत्यक्ष कनेक्शन",
    benefit1Desc: "फार्म कनेक्ट किसानों को सीधे खरीदारों से जोड़कर कृषि वाणिज्य को बदल देता है, अनावश्यक मध्यस्थों को समाप्त करता है।",
    benefit2Title: "न्यायपूर्ण व्यापार",
    benefit2Desc: "हमारा प्लेटफ़ॉर्म किसानों को उनकी उपज के लिए उचित मूल्य प्रदान करता है, जबकि खरीदारों को प्रतिस्पर्धात्मक दरों पर ताजगी और उच्च गुणवत्ता वाले उत्पाद मिलते हैं।",
    benefit3Title: "सतत विकास",
    benefit3Desc: "यह कुशल मॉडल हर किसी के लिए मूल्य बनाता है, सतत कृषि को बढ़ावा देता है, और फार्म-टू-मार्केट आपूर्ति श्रृंखला को मजबूत करता है।",
    howItWorksTitle: "यह कैसे काम करता है",
    step1Title: "पंजीकरण एवं सूचीकरण",
    step1Desc: "किसान अपना प्रोफ़ाइल बनाते हैं और गुणवत्ता और मात्रा के विस्तृत विवरण के साथ अपनी उपज सूचीबद्ध करते हैं।",
    step2Title: "जुड़ें एवं बातचीत करें",
    step2Desc: "खरीदार सूची देखें और कीमतों व शर्तों पर बातचीत करने के लिए सीधे किसानों से जुड़ते हैं।",
    step3Title: "व्यापार एवं विकास",
    step3Desc: "सुरक्षित लेनदेन पूरे करें और सतत विकास के लिए दीर्घकालिक संबंध बनाएं।",
    footerText: " 2024 फार्म कनेक्ट। सर्वाधिकार सुरक्षित。",
    // Account Page
    notSet: "सेट नहीं",
    editProfileBtn: "प्रोफ़ाइल संपादित करें",
    logoutBtn: "लॉग आउट",
    fullNameLabel: "पूरा नाम",
    phoneLabel: "फोन नंबर",
    stateLabel: "राज्य",
    districtLabel: "जिला",
    villageCityLabel: "गांव/शहर",
    cancelEditProfileBtn: "रद्द करें",
    saveChangesBtn: "परिवर्तन सहेजें",
    profileTitle: "प्रोफ़ाइल",
    userTypeLabel: "उपयोगकर्ता प्रकार",
    loadingText: "लोड हो रहा है...",
    updatePhotoMenuItem: "फ़ोटो अपडेट करें",
    removePhotoMenuItem: "फ़ोटो हटाएं",
    defaultUserIconAlt: "डिफ़ॉल्ट उपयोगकर्ता आइकन",
    profilePhotoAlt: "प्रोफ़ाइल फोटो",
    // Signup Page Labels
    fullNameLabel: "पूरा नाम",
    phoneLabel: "फ़ोन नंबर",
    userTypePrompt: "मैं हूँ",
    stateLabel: "राज्य",
    districtLabel: "जिला",
    villageCityLabel: "गांव का नाम/शहर का नाम",
    otpLabel: "OTP",
    alreadyHaveAccount: "पहले से एक खाता है?",
    dontHaveAccount: "क्या आपके पास कोई खाता नहीं है?",
    farmerOption: "किसान",
    buyerOption: "खरीदार",
    // मार्केटप्लेस पेज
    marketplaceTitle: "मार्केटप्लेस",
    browseCrops: "फसलें ब्राउज़ करें",
    marketPrice: "बाजार मूल्य",
    yourActivity: "आपकी गतिविधियाँ",
    diseaseDetector: "रोग पहचानक",
    noCropsTitle: "कोई फसल उपलब्ध नहीं",
    noCropsDesc: "किसानों ने अभी तक अपनी फसलें नहीं जोड़ी हैं। बाद में देखें!",
    cropSelectLabel: "फसल का नाम",
    selectCrop: "एक फसल चुनें",
    customCropPlaceholder: "कस्टम फसल नाम दर्ज करें",
    getPriceBtn: "सटीक मूल्य प्राप्त करें",
    addCropBtn: "फसल जोड़ें",
    cropNameLabel: "फसल का नाम",
    customCropNameLabel: "कस्टम फसल का नाम",
    cropPhotoLabel: "फसल फोटो",
    quantityLabel: "मात्रा",
    quantityTypeLabel: "मात्रा प्रकार",
    quantityUnitPlaceholder: "इकाई चुनें",
    priceLabel: "मूल्य (₹)",
    cancelBtn: "रद्द करें",
    saveCropBtn: "फसल सहेजें",
    diseaseDetectorDesc: "हमारे एआई-पावर्ड टूल का उपयोग करके अपनी फसल का विश्लेषण करें और संभावित रोगों का तुरंत पता लगाएं।",
    analyzeNowBtn: "अब विश्लेषण करें",
    allStates: "सभी राज्य",
    allDistricts: "सभी जिले",
    allCrops: "सारी फसलें",
    // फसल विकल्प
    rice: "चावल",
    wheat: "गेहूं",
    maize: "मक्का",
    sorghum: "ज्वार",
    pearlMillet: "बाजरा",
    fingerMillet: "रागी",
    barley: "जौ",
    chickpea: "चना",
    pigeonPea: "अरहर",
    greenGram: "मूंग",
    blackGram: "उरद",
    lentil: "मसूर",
    groundnut: "मूंगफली",
    rapeseedMustard: "सरसों",
    soybean: "सोयाबीन",
    sesame: "तिल",
    sunflower: "सूरजमुखी",
    sugarcane: "गन्ना",
    cotton: "कपास",
    tea: "चाय",
    coffee: "कॉफ़ी",
    jute: "जूट",
    potato: "आलू",
    tomato: "टमाटर",
    onion: "प्याज",
    banana: "केला",
    mango: "आम",
    customCrop: "कस्टम",
    // मात्रा इकाइयाँ
    unitKg: "किलोग्राम (किलो)",
    unitQuintal: "क्विंटल (100kg)",
    unitTonne: "टन (1000kg)",
    // राज्य नाम
    Andhra_Pradesh: "आंध्र प्रदेश",
    Assam: "असम",
    Bihar: "बिहार",
    Chhattisgarh: "छत्तीसगढ़",
    Goa: "गोवा",
    Gujarat: "गुजरात",
    Haryana: "हरियाणा",
    Himachal_Pradesh: "हिमाचल प्रदेश",
    Jammu_and_Kashmir: "जम्मू और कश्मीर",
    Jharkhand: "झारखंड",
    Karnataka: "कर्नाटक",
    Kerala: "केरल",
    Madhya_Pradesh: "मध्यप्रदेश",
    Maharashtra: "महाराष्ट्र",
    Manipur: "मणिपुर",
    Meghalaya: "मेघालय",
    Mizoram: "मिजोरम",
    Nagaland: "नागालैंड",
    Odisha: "ओडिशा",
    Punjab: "पंजाब",
    Rajasthan: "राजस्थान",
    Sikkim: "सिक्किम",
    Tamil_Nadu: "तमिल नाडु",
    Telangana: "तेलंगाना",
    Tripura: "त्रिपुरा",
    Uttar_Pradesh: "उत्तर प्रदेश",
    Uttarakhand: "उत्तराखंड",
    West_Bengal: "पश्चिम बंगाल",
  },
  te: {
    phonePlaceholder: "దేశ కోడ్‌తో మీ ఫోన్ నెంబర్‌ను నమోదు చేయండి (ఉదా: +91)",
    fullNamePlaceholder: "మీ పూర్తి పేరును నమోదు చేయండి",
    villageCityPlaceholder: "మీ గ్రామం లేదా నగరం నమోదు చేయండి",
    otpPlaceholder: "OTP నమోదు చేయండి",
    getOtpBtn: "OTP పొందండి",
    userTypePlaceholder: "వినియోగదారు రకాన్ని ఎంచుకోండి",
    statePlaceholder: "రాజ్యాన్ని ఎంచుకోండి",
    districtPlaceholder: "జిల్లాను ఎంచుకోండి",
    loginTitle: "మళ్ళీ స్వాగతం",
    loginSubtitle: "మీ ఖాతాలో లాగిన్ అవ్వండి",
    signupTitle: "ఖాతాను సృష్టించండి",
    signupSubtitle: "ఇప్పుడే ఫారం కనెక్ట్‌లో చేరండి",
    pageTitle: "ఫారం కనెక్ట్ - డైరెక్ట్ ఫారం-టు-మార్కెట్ ప్లాట్‌ఫారమ్",
    appTitle: "ఫారం కనెక్ట్",
    home: "హోమ్",
    login: "లాగిన్",
    signup: "సైన్ అప్",
    marketplace: "మార్కెట్‌ప్లేస్",
    profile: "ప్రొఫైల్",
    getStartedBtn: "ప్రారంభించండి",
    heroTitle: "AIతో ఫారమ్‌లను మార్కెట్లతో కనెక్ట్ చేయండి",
    heroSubtitle: "రైతులు మరియు కొనుగోలుదారుల మధ్య అంతరాన్ని తగ్గించండి — వ్యవసాయ వ్యాపారంలో విప్లవాన్ని తీసుకురండి",
    aboutTitle: "మన వేదిక గురించి",
    benefit1Title: " నేరుగా కనెక్షన్",
    benefit1Desc: "ఫారం కనెక్ట్ రైతులను నేరుగా కొనుగోలుదారులతో కలిపి వ్యవసాయ వాణిజ్యాన్ని మార్చుతుంది, అవసరంలేని మధ్యవర్తులనును నివారిస్తుంది.",
    benefit2Title: "న్యాయమైన వాణిజ్యం",
    benefit2Desc: "మా వేదిక రైతులకు వారి పంటకు సరైన ధరను అందిస్తుంది, కాగా కొనుగోలుదారులకు పోటీ ధరల్లో తాజా, ఉన్నత-నాణ్యత ఉత్పత్తులు లభిస్తాయి.",
    benefit3Title: "స్థిరమైన వృద్ధి",
    benefit3Desc: "ఈ సమర్ధవంతమైన నమూనా ప్రతి ఒక్కరి కోసం విలువను సృష్టిస్తుంది, స్థిరమైన వ్యవసాయాన్ని ప్రోత్సహిస్తుంది, మరియు ఫారం-టు-మార్కెట్ సరఫరా గొలుసును బలోపేతం చేస్తుంది.",
    howItWorksTitle: "ఇది ఎలా పనిచేస్తుంది",
    step1Title: "నమోదు & జాబితా",
    step1Desc: "రైతులు వారి ప్రొఫైల్‌ని సృష్టించి, నాణ్యత మరియు పరిమాణంపై సమగ్ర సమాచారంతో వారి పంటను జాబితా చేస్తారు.",
    step2Title: "కనెక్ట్ & చర్చ",
    step2Desc: "కొనుగోలుదారులు జాబితాలను బ్రౌజ్ చేసి, ధరలు మరియు షరతులపై చర్చించడానికి ప్రత్యక్షంగా రైతులతో కనెక్ట్ అవుతారు.",
    step3Title: "వ్యాపారం & వృద్ధి",
    step3Desc: "భద్రమైన లేన్‌దేన్‌లు పూర్తిచేసి స్థిరమైన వృద్ధికి దీర్ఘకాల సంబంధాలను నిర్మించండి.",
    footerText: " 2024 ఫారం కనెక్ట్. అన్ని హక్కులు పరిరక్షించబడ్డాయి.",
    // Account Page
    notSet: "సెట్ చేయబడలేదు",
    editProfileBtn: "ప్రొఫైల్‌ను సవరించండి",
    logoutBtn: "లాగ్ అవుట్",
    fullNameLabel: "పూర్తి పేరు",
    phoneLabel: "ఫోన్ నంబర్",
    stateLabel: "రాజ్యం",
    districtLabel: "జిల్లా",
    villageCityLabel: "గ్రామం/నగరం",
    cancelEditProfileBtn: "రద్దు చేయి",
    saveChangesBtn: "మార్చడాలు సేవ్ చేయి",
    profileTitle: "ప్రొఫైల్",
    userTypeLabel: "వినియోగదారు రకం",
    loadingText: "లోడ్ అవుతోంది...",
    updatePhotoMenuItem: "ఫోటో నవీకరించండి",
    removePhotoMenuItem: "ఫోటో తీసివేయండి",
    defaultUserIconAlt: "డిఫాల్ట్ యూజర్ ఐకాన్",
    profilePhotoAlt: "ప్రొఫైల్ ఫొటో",
    // Signup Page Labels
    fullNameLabel: "పూర్తి పేరు",
    phoneLabel: "ఫోన్ నంబర్",
    userTypePrompt: "నేను ఒక",
    stateLabel: "రాష్ట్రం",
    districtLabel: "జిల్లా",
    villageCityLabel: "గ్రామం/నగరం",
    otpLabel: "OTP",
    alreadyHaveAccount: "ఇప్పటికే ఖాతా ఉంది?",
    dontHaveAccount: "మీకు ఖాతా లేదు?",
    farmerOption: "రైతు",
    buyerOption: "కొనుగోలుదారు",
    // మార్కెట్‌ప్లేస్ పేజీ
    marketplaceTitle: "మార్కెట్‌ప్లేస్",
    browseCrops: "పంటలను బ్రౌజ్ చేయండి",
    marketPrice: "బజార్ని ధర",
    yourActivity: "మీ కార్యాచరణ",
    diseaseDetector: "రోగ గుర్తింపు సాధనం",
    noCropsTitle: "కోన్ని కూడా పంటలు లేవు",
    noCropsDesc: "రైతులు ఇప్పటి వరకు తమ పంటలను జోడించలేదు. తరువాత తిరిగి చూడండి!",
    cropSelectLabel: "పంట పేరు",
    selectCrop: "ఒక పంటను ఎంచుకోండి",
    customCropPlaceholder: "అనుకూల పంట పేరు నమోదు చేయండి",
    getPriceBtn: "ఖచ్చితమైన ధర పొందండి",
    addCropBtn: "పంట జోడించండి",
    cropNameLabel: "పంట పేరు",
    customCropNameLabel: "అనుకూల పంట పేరు",
    cropPhotoLabel: "పంట ఫోటో",
    quantityLabel: "పరిమాణం",
    quantityTypeLabel: "పరిమాణ రకం",
    quantityUnitPlaceholder: "యూనిట్ ఎంచుకోండి",
    priceLabel: "ధర (₹)",
    cancelBtn: "రద్దు చేయండి",
    saveCropBtn: "పంట సేవ్ చేయండి",
    diseaseDetectorDesc: "మా AI ఆధారిత సాధనాన్ని ఉపయోగించి మీ పంటను విశ్లేషించండి మరియు సాధ్యమైన వ్యాధులను వెంటనే గుర్తించండి.",
    analyzeNowBtn: "ఇప్పుడే విశ్లేషించండి",
    allStates: "అన్ని రాష్ట్రాలు",
    allDistricts: "అన్ని జిల్లాలు",
    allCrops: "అన్ని పంటలు",
    // పంట ఎంపికలు
    rice: "బియ్యం",
    wheat: "గోధుమ",
    maize: "మొక్కజొన్న",
    sorghum: "జొన్న",
    pearlMillet: "సజ్జా",
    fingerMillet: "రాగి",
    barley: "బార్లీ",
    chickpea: "బటాణీ",
    pigeonPea: "తూరి పప్పు",
    greenGram: "పచ్చి పప్పు",
    blackGram: "ఉరద్",
    lentil: "కందిపప్పు",
    groundnut: "వేరుశనగ",
    rapeseedMustard: "ఆవాలు",
    soybean: "సోయాబీన్స్",
    sesame: "నువ్వులు",
    sunflower: "సన్‌ఫ్లోవర్",
    sugarcane: "ఎరువు",
    cotton: "పత్తి",
    tea: "చాయ్",
    coffee: "కాఫీ",
    jute: "జూట్",
    potato: "అలుగుబంట్లు",
    tomato: "టమోటా",
    onion: "ఉల్లిపాయ",
    banana: "అరటి",
    mango: "మామిడి",
    customCrop: "కస్టమ్",
    // పరిమాణ యూనిట్లు
    unitKg: "కిలోగ్రాము (kg)",
    unitQuintal: "క్వింటల్ (100kg)",
    unitTonne: "టన్ను (1000kg)",
    // రాష్ట్రాల పేర్లు
    Andhra_Pradesh: "ఆంధ్రప్రదేశ్",
    Assam: "అస్సాం",
    Bihar: "బీహార్",
    Chhattisgarh: "ఛత్తీస్‌గఢ్",
    Goa: "గోవా",
    Gujarat: "గుజరాత్",
    Haryana: "హర్యానా",
    Himachal_Pradesh: "హిమాచల్ ప్రదేశ్",
    Jammu_and_Kashmir: "జమ్మూ కాశ్మీర్",
    Jharkhand: "జార్ఖండ్",
    Karnataka: "కర్ణాటక",
    Kerala: "కేరళ",
    Madhya_Pradesh: "మధ్యప్రదేశ్",
    Maharashtra: "మహారాష్ట్ర",
    Manipur: "మణిపూర్",
    Meghalaya: "మెగాలయ",
    Mizoram: "మిజోరం",
    Nagaland: "నాగాలాండ్",
    Odisha: "ఒడిశా",
    Punjab: "పంజాబ్",
    Rajasthan: "రాజస్థాన్",
    Sikkim: "సిక్కిం",
    Tamil_Nadu: "తమిళనాడు",
    Telangana: "తెలంగాణ",
    Tripura: "త్రిపురా",
    Uttar_Pradesh: "ఉత్తర్ప్రదేశ్",
    Uttarakhand: "ఉత్తరాఖండ్",
    West_Bengal: "పశ్చిమ బెంగాల్",
  },
};

// Expose translations for dynamic use
window.translations = translations;

// Function to apply translations (global)
function applyLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.title = translations[lang]['pageTitle'];
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.getAttribute('data-i18n-alt');
    if (translations[lang] && translations[lang][key]) {
      el.alt = translations[lang][key];
    }
  });
}
// Make it globally accessible
window.applyLanguage = applyLanguage;

// Apply saved language on all pages
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('lang') || 'en';
  applyLanguage(savedLang);
  // Setup picker if present
  const langPicker = document.getElementById('languagePicker');
  if (!langPicker) return;
  langPicker.value = savedLang;
  langPicker.addEventListener('change', (e) => {
    const lang = e.target.value;
    localStorage.setItem('lang', lang);
    applyLanguage(lang);
  });
});

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthState();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (isLoggedIn) {
                window.location.href = 'marketplace.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
    }
}

// Check authentication state and update UI
async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        const isLoggedIn = !!session;
        
        // Update localStorage
        if (isLoggedIn) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(session.user));
            // Fetch full profile and store
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            if (!profileError && profile) {
                localStorage.setItem('userProfile', JSON.stringify(profile));
            }
        } else {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            localStorage.removeItem('userProfile');
        }

        // Update UI
        const loggedOutState = document.getElementById('loggedOutState');
        const loggedInState = document.getElementById('loggedInState');
        
        if (loggedOutState && loggedInState) {
            if (isLoggedIn) {
                loggedOutState.style.display = 'none';
                loggedInState.style.display = 'block';
            } else {
                loggedOutState.style.display = 'flex';
                loggedInState.style.display = 'none';
            }
        }

        // Handle marketplace access
        if (!isLoggedIn && window.location.pathname.includes('marketplace.html')) {
            window.location.href = 'login.html';
        }

        return isLoggedIn;
    } catch (error) {
        console.error('Auth state check error:', error);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');
        return false;
    }
} 