export default {
  common: {
    search: 'தேடுக',
    save: 'சேர்க்க',
    cancel: 'ரத்து',
    close: 'மூடு',
    back: 'மீண்டும்',
    next: 'அடுத்து',
    viewDetails: 'விவரங்கள்',
    checkAirQuality: 'காற்று தரத்தை சரிபார்',
    language: 'மொழி',
    live: 'நேரடி',
    monitoring: 'கண்காணிப்பு'
  },

  nav: {
    home: 'ஹோம்',
    features: 'அம்சங்கள்',
    howItWorks: 'இது எப்படி வேலை செய்கிறது',
    about: 'பற்றி',
    dashboard: 'டாஷ்போர்ட்',
    alerts: 'எச்சரிக்கைகள்',
    locations: 'என் இடங்கள்',
    history: 'வரலாறு',
    activity: 'செயல்பாட்டு அபாயம்',
    routeRisk: 'பாதை அபாயம்',
    compare: 'ஒப்பிடு',
    profile: 'ப்ரொஃபைல்',
    settings: 'அமைப்புகள்',
  },

  sidebar: {
    footerNotice: 'காற்று தரவு தானாகவே புது நிலையில் மாறுகிறது. டெமோ பில்டு — பேக்க்எண்ட் இன்னும் இணைக்கப்படவில்லை.'
  },

  dashboard: {
    welcomeMorning: 'காலை வணக்கம்',
    welcomeAfternoon: 'மதியம் வணக்கம்',
    welcomeEvening: 'மாலை வணக்கம்',
    pollutantBreakdown: 'மாசு கூறுகள்',
    myLocations: 'என் இடங்கள்',
    recentAlerts: 'சமீபத்திய எச்சரிக்கைகள்',
  },

  settings: {
    title: 'அமைப்புகள்',
    language: 'மொழி',
    voiceAlerts: 'குரல் எச்சரிக்கைகள்',
    darkMode: 'இருண்ட முறை',
    applicationPreferences: 'மென்பொருள் முன்னுரிமைகள்'
  },

  alerts: {
    title: 'உங்கள் காற்று எச்சரிக்கைகள்',
    critical: 'நிரந்தர',
    warning: 'எச்சரிக்கை',
    information: 'தகவல்',
    aqiMessage: '{location} க்கு காற்று தர எச்சரிக்கை. தற்போதைய AQI {aqi}.'
  },

  aqi: {
    good: 'மிக நன்றாக',
    moderate: 'மிதமான',
    sensitive: 'உணர்ச்சிமிக்க குழுக்களுக்கு பாதகமான',
    unhealthy: 'அனோக்ஷமான',
    hazardous: 'ஆபத்தான',
  },

  pollutant: {
    relativeLevel: 'சார்பான நிலை',
    environmentalMetric: 'சுற்றுச்சூழல் அளவுகோல்'
  },

  recommendation: {
    header: 'உங்கள் சுற்றுப்புற பரிந்துரை',
    personalized: 'தனிப்பயன்',
    profile: 'சுயவிவரம்',
    activity: 'செயல்பாடு',
    basedOn: 'தற்போதைய சுற்றுப்புற நிலைகளின் அடிப்படையில்',
    checkActivity: 'செயல்பாட்டு அபாயம் சரிபார்க்கவும்'
  },

  dominant: {
    main: 'முக்கிய மாசுபடுதல் கவலை',
    currentMetric: 'தற்போதைய தலைமை சுற்றுப்புற அளவுகோல்',
    dominantPollutant: 'தலைமை மாசுபடுதல்',
    exposureRelative: 'குறிக்கோளின் சலுகையின் ஏற்புடைய தாக்கம்',
    reference: 'குறிப்பு',
    higherAttention: 'மேலும் கவனம் தேவை',
    monitorConditions: 'தற்போதைய நிலைகளை கண்காணிக்கவும்',
    withinRange: 'தற்போதைய நிலை எதிர்பார்க்கப்பட்ட வரம்பில் உள்ளது',
    indicatorInfo: 'இந்த குறியீடு தற்போதைய மாசுபடுதல் நிலை மற்றும் அதன் கட்டமைக்கப்பட்ட குறிப்பு வரம்பின் அடிப்படையில் உருவாக்கப்படுகிறது.'
  },


  auth: {
    login: 'உள்நுழை',
    signup: 'பதிவு',
    forgotPassword: 'Forgot your password?',
    forgotPasswordDescription: 'Enter the email associated with your AirGuard account.',
    sendResetLink: 'Send reset link',
    resetPassword: 'Reset password',
    resetPasswordDescription: 'Choose a new password for your account.',
    newPassword: 'New password',
    confirmNewPassword: 'Confirm new password',
    passwordUpdated: 'Password updated successfully',
    passwordResetSuccess: 'Your AirGuard password has been changed.',
    invalidResetToken: 'Invalid or missing reset token.',
    resetTokenExpired: 'Reset token has expired.',
    backToSignIn: 'Back to Sign In',
    emailRequired: 'Email is required.',
    invalidEmail: 'Please enter a valid email address.',
    passwordsDoNotMatch: 'Passwords do not match.',
    emailAddress: 'Email address',
    emailPlaceholder: 'you@example.com',
    sending: 'Sending…',
    demoResetCreated: 'Demo reset created',
    demoResetNotice: 'For this demo the reset flow is simulated locally. Use the link below to complete the reset.',
    openResetLink: 'Open reset link',
    resetRequestFailed: 'Unable to create reset request. Please try again.',
    passwordRequired: 'Password is required.',
    passwordTooShort: 'Password must be at least 6 characters.',
    resetFailed: 'Unable to reset password. The token may be invalid or expired.',
    newPasswordPlaceholder: 'Enter a new password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    userNotFound: 'No account found with that email address.',
    resetTokenUsed: 'This reset token has already been used.'
  },

  landing: {
    realtimeIntelligence: 'நேரடி சுற்றுச்சூழல் நுண்ணறிவு',
    heroTitlePart1: 'காற்றை அறிந்துகொள்ளுங்கள்',
    heroTitlePart2: 'உங்கள் சுற்றுப்புறத்தில்.',
    heroDescription: 'சிக்கலான சுற்றுச்சூழல் தரவை தெளிவான, தனிப்பட்ட செயல்களில் மாற்றவும். உங்கள் காற்று தரம், உங்கள் அபாயம் மற்றும் அடுத்து என்ன செய்ய வேண்டும் என்பதை புரிந்துகொள்ளுங்கள்.',
    checkAirQuality: 'காற்று தரத்தை சரிபார்',
    exploreFeatures: 'அம்சங்களை ஆராயுங்கள்',
    liveEnvironmentalData: 'நேரடி சுற்றுச்சூழல் தரவு',
    clearRiskGuidance: 'தெளிவான அபாய வழிகாட்டுதல்',
    locationAlerts: 'இட எச்சரிக்கைகள்',
    liveAirQuality: 'நேரடி காற்று தரம்',
    environmentalStatus: 'சுற்றுச்சூழல் நிலை',
    liveMonitoring: 'நேரடி கண்காணிப்பு',
    features: 'அம்சங்கள்',
    featuresHeadline: 'உங்கள் காற்றை புரிந்துகொள்ள தேவையான அனைத்தும்',
    featuresDescription: 'நேரடி நிலைகளில் இருந்து வரலாற்று போக்குகள் மற்றும் தனிப்பட்ட வழிகாட்டுதலுக்கு, AirGuard தகவலை எளிமையாகவும் பயனுள்ளதாகவும் வைத்திருக்கிறது.',
    exploreCapability: 'சாத்தியத்தை ஆராயவும்',
    howItWorksTitle: 'இದು எப்படி வேலை செய்கிறது',
    howItWorksHeadline: 'இடத்திலிருந்து செயலுக்கு, நான்கு படிகள்',
    premiumAwareness: 'சுற்றுச்சூழல் அறிவு, தனிப்பட்ட',
    builtForPeople: 'ஒவ்வொரு நாளும் அதே காற்றை சுவாசிக்கும் மனிதர்களுக்காக உருவாக்கப்பட்டது.',
    premiumDescription: 'AirGuard ஒரு ஹேகத்தான் திட்டமாக உருவாக்கப்பட்டது, சுற்றுச்சூழல் அபாயத்தை தனிப்பட்ட, தெளிவான மற்றும் செயல்திறன் மிக்கதாக மாற்ற.',
    ctaCheckAirQuality: 'காற்று தரத்தை சரிபார்'
  },

  features: {
    live: {
      title: 'நேரடி காற்று தரம்',
      description: 'எந்த இடத்திற்கும் நேரடி காற்று தரத்தை கண்காணிக்கவும்.'
    },
    risk: {
      title: 'அபாய நுண்ணறிவு',
      description: 'சிக்கலான மாசு தரவை எளிதில் புரிந்துகொள்ளக்கூடிய அபாய நிலைக்காக மாற்றவும்.'
    },
    guidance: {
      title: 'தனிப்பட்ட வழிகாட்டுதல்',
      description: 'உங்கள் சுற்றுச்சூழல் உணர்வு அடிப்படையில் பரிந்துரைகள் பெறுங்கள்.'
    },
    trends: {
      title: 'வரலாறு போக்குகள்',
      description: 'காற்று தரம் மேம்பட்டு கொண்டிருக்கிறதா அல்லது மோசமடைகிறதா என்பதைப் புரிந்து கொள்ளுங்கள்.'
    },
    alerts: {
      title: 'ஸ்மார்ட் எச்சரிக்கைகள்',
      description: 'உங்கள் சேமிக்கப்பட்ட இடங்கள் எப்போது அபாயத்தில் இருக்கும் என்பதை அறியுங்கள்.'
    },
    activity: {
      title: 'செயல்பாட்டுக் கடும் அபாய ஆலோசகர்',
      description: 'இப்போது ஓட்டம், சைக்கிள் ஓட்டுதல் அல்லது வெளிப்புற நடவடிக்கைகள் பொருத்தமாக உள்ளனவா என்று சரிபார்க்கவும்.'
    }
  },

  howItWorks: {
    step1: {
      title: 'இடத்தைத் தேர்வு செய்க',
      description: 'தொடங்க எந்த நகரத்தையும் தேடுங்கள் அல்லது உங்கள் தற்போதைய இடத்தை பயன்படுத்தவும்.'
    },
    step2: {
      title: 'நேரடி தரவைப் பெறுங்கள்',
      description: 'AirGuard அந்த இடத்திற்கான புதிய மாசு வாசிப்புகளை இழுக்கும்.'
    },
    step3: {
      title: 'உங்கள் அபாயத்தை புரிந்து கொள்ளுங்கள்',
      description: 'உங்கள் சுற்றுச்சூழல் சுயவிவரத்தின் அடிப்படையில் ஒரு தெளிவான அபாய நிலையைப் பாருங்கள்.'
    },
    step4: {
      title: 'நடவடிக்கை எடுக்கவும்',
      description: 'செயல்பாடு, வெளிப்பாடு மற்றும் எச்சரிக்கைகள் தொடர்பாக தனிப்பயனாக்கப்பட்ட வழிகாட்டுதலைப் பின்பற்றவும்.'
    }
  }
}
