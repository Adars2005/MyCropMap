import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USER_EMAIL = import.meta.env.VITE_USER_EMAIL;

/**
 * Extract latitude and longitude from uploaded image
 * @param {string} imageName - Original image name
 * @param {string} imageUrl - Cloudinary URL of the uploaded image
 * @returns {Promise} API response with location data
 */
export const extractLocationFromImage = async (imageName, imageUrl) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/extract-latitude-longitude`,
            {
                emailId: USER_EMAIL,
                imageName,
                imageUrl,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.data.success) {
            throw new Error('Failed to extract location data');
        }

        return response.data;
    } catch (error) {
        console.error('Error extracting location:', error);
        throw error;
    }
};

/**
 * Save plant location data to backend
 * @param {Object} plantData - Plant data to save
 * @returns {Promise} API response
 */
export const savePlantData = async (plantData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/save-plant-location-data`,
            {
                emailId: USER_EMAIL,
                ...plantData,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error saving plant data:', error);
        throw error;
    }
};

/**
 * Fetch all saved plant location data
 * @returns {Promise} API response with plant data array
 */
export const fetchPlantData = async () => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/get-plant-location-data`,
            {
                emailId: USER_EMAIL,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error fetching plant data:', error);
        throw error;
    }
};

export default {
    extractLocationFromImage,
    savePlantData,
    fetchPlantData,
};
