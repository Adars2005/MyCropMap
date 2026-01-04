import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadToCloudinary } from '../../services/cloudinary';

/**
 * Upload multiple files to Cloudinary
 * This thunk handles batch uploads and tracks progress for each file
 */
export const uploadImages = createAsyncThunk(
    'upload/uploadToCloudinary',
    async (files, { rejectWithValue }) => {
        try {
            const uploadPromises = files.map((file) => uploadToCloudinary(file));
            const results = await Promise.allSettled(uploadPromises);

            const successful = [];
            const failed = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successful.push({
                        file: files[index].name,
                        url: result.value.secure_url,
                        cloudinaryId: result.value.public_id,
                    });
                } else {
                    failed.push({
                        file: files[index].name,
                        error: result.reason.message || 'Upload failed',
                    });
                }
            });

            return { successful, failed };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const uploadSlice = createSlice({
    name: 'upload',
    initialState: {
        files: [],
        uploading: false,
        uploadProgress: {},
        uploadedFiles: [],
        errors: [],
    },
    reducers: {
        setFiles: (state, action) => {
            state.files = action.payload;
        },
        clearFiles: (state) => {
            state.files = [];
            state.uploadProgress = {};
        },
        updateProgress: (state, action) => {
            const { fileName, progress } = action.payload;
            state.uploadProgress[fileName] = progress;
        },
        clearErrors: (state) => {
            state.errors = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadImages.pending, (state) => {
                state.uploading = true;
                state.errors = [];
            })
            .addCase(uploadImages.fulfilled, (state, action) => {
                state.uploading = false;
                state.uploadedFiles = action.payload.successful;
                if (action.payload.failed.length > 0) {
                    state.errors = action.payload.failed;
                }
            })
            .addCase(uploadImages.rejected, (state, action) => {
                state.uploading = false;
                state.errors = [{ error: action.payload }];
            });
    },
});

export const { setFiles, clearFiles, updateProgress, clearErrors } = uploadSlice.actions;
export default uploadSlice.reducer;
