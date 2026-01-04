import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    extractLocationFromImage,
    savePlantData,
    fetchPlantData,
} from '../../services/api';

/**
 * Process uploaded image to extract location data
 */
export const processImage = createAsyncThunk(
    'plants/processImage',
    async ({ imageName, imageUrl }, { rejectWithValue }) => {
        try {
            const response = await extractLocationFromImage(imageName, imageUrl);
            return {
                imageName,
                imageUrl,
                latitude: response.data.latitude,
                longitude: response.data.longitude,
            };
        } catch (error) {
            return rejectWithValue({
                imageName,
                error: error.message || 'Failed to extract location',
            });
        }
    }
);

/**
 * Save plant data to backend
 */
export const savePlant = createAsyncThunk(
    'plants/savePlant',
    async (plantData, { rejectWithValue }) => {
        try {
            const response = await savePlantData(plantData);
            return {
                ...plantData,
                timestamp: new Date().toISOString(),
                ...response,
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Fetch all saved plant data
 */
export const fetchPlants = createAsyncThunk(
    'plants/fetchPlants',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchPlantData();
            return response.data || [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const plantSlice = createSlice({
    name: 'plants',
    initialState: {
        plants: [],
        selectedPlant: null,
        loading: false,
        processing: {},
        saving: false,
        error: null,
        lastFetched: null,
    },
    reducers: {
        selectPlant: (state, action) => {
            state.selectedPlant = action.payload;
        },
        clearSelectedPlant: (state) => {
            state.selectedPlant = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        // Local storage cache management
        loadFromCache: (state, action) => {
            state.plants = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Process Image
            .addCase(processImage.pending, (state, action) => {
                state.processing[action.meta.arg.imageName] = { status: 'processing' };
            })
            .addCase(processImage.fulfilled, (state, action) => {
                state.processing[action.payload.imageName] = {
                    status: 'success',
                    data: action.payload,
                };
            })
            .addCase(processImage.rejected, (state, action) => {
                state.processing[action.payload.imageName] = {
                    status: 'failed',
                    error: action.payload.error,
                };
            })
            // Save Plant
            .addCase(savePlant.pending, (state) => {
                state.saving = true;
            })
            .addCase(savePlant.fulfilled, (state, action) => {
                state.saving = false;
                const existingIndex = state.plants.findIndex(
                    (p) => p.imageName === action.payload.imageName
                );
                if (existingIndex >= 0) {
                    state.plants[existingIndex] = action.payload;
                } else {
                    state.plants.push(action.payload);
                }
                // Cache to localStorage
                localStorage.setItem('farmPlants', JSON.stringify(state.plants));
            })
            .addCase(savePlant.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })
            // Fetch Plants
            .addCase(fetchPlants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlants.fulfilled, (state, action) => {
                state.loading = false;
                state.plants = action.payload;
                state.lastFetched = new Date().toISOString();
                // Cache to localStorage
                localStorage.setItem('farmPlants', JSON.stringify(state.plants));
            })
            .addCase(fetchPlants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Fallback to cached data
                const cached = localStorage.getItem('farmPlants');
                if (cached) {
                    state.plants = JSON.parse(cached);
                }
            });
    },
});

export const { selectPlant, clearSelectedPlant, clearError, loadFromCache } =
    plantSlice.actions;
export default plantSlice.reducer;
