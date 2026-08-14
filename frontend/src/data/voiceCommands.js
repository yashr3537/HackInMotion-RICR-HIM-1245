import { searchLocation } from './locationApi';
import { getAirQuality } from './airQualityApi';

export const processVoiceCommand = async (transcript) => {
  const lowerTranscript = transcript.toLowerCase();

  // Extract location name from transcript
  const locationMatch = transcript.match(
    /(?:in|at|for|AQI|quality)?\s*([A-Za-z\s]+)(?:\?|$)/i
  );

  if (locationMatch) {
    const locationName = locationMatch[1].trim();

    try {
      // Search for location
      const locations = await searchLocation(locationName);

      if (locations && locations.length > 0) {
        const location = locations[0];
        const airQualityData = await getAirQuality(location.latitude, location.longitude);

        // Determine risk level based on AQI
        const getRiskLevel = (aqi) => {
          if (aqi <= 50) return 'Good';
          if (aqi <= 100) return 'Satisfactory';
          if (aqi <= 200) return 'Moderately Polluted';
          if (aqi <= 300) return 'Poor';
          if (aqi <= 400) return 'Very Poor';
          return 'Severe';
        };

        const risk = getRiskLevel(airQualityData.aqi);

        // Generate description based on AQI
        const getDescription = (risk) => {
          const descriptions = {
            'Good': 'Air quality is excellent. Great time for outdoor activities.',
            'Satisfactory': 'Air quality is acceptable. Most people can enjoy outdoor activities.',
            'Moderately Polluted': 'Air quality is moderate. Sensitive users should limit outdoor activity.',
            'Poor': 'Air quality is poor. Everyone should avoid prolonged outdoor activity.',
            'Very Poor': 'Air quality is very poor. It is advised to avoid outdoor activities.',
            'Severe': 'Air quality is severe. Stay indoors and use air purifiers if possible.',
          };
          return descriptions[risk] || 'Please check the dashboard for more details.';
        };

        return {
          title: `${location.name} Air Quality`,
          aqi: Math.round(airQualityData.aqi),
          risk: risk,
          description: getDescription(risk),
          pollutants: {
            pm25: airQualityData.pm25,
            pm10: airQualityData.pm10,
            co: airQualityData.co,
            no2: airQualityData.no2,
            so2: airQualityData.so2,
            o3: airQualityData.o3,
          },
        };
      }
    } catch (error) {
      console.error('Error fetching air quality:', error);
      return {
        title: 'Unable to fetch data',
        description: `Could not find air quality data for ${locationName}. Please try another location.`,
      };
    }
  }

  // Default response for unrecognized commands
  return {
    title: 'Voice Command',
    description: `I heard: "${transcript}". Please ask about air quality in a specific location.`,
  };
};

export const voiceCommandExamples = [
  'What is the AQI in Betul?',
  'Show me air quality in Mumbai',
  'Is the air quality good today?',
  'Check air quality in Delhi',
  'AQI for Bangalore',
];
