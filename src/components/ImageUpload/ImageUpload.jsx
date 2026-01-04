import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadImages } from '../../features/upload/uploadSlice';
import { processImage, savePlant } from '../../features/plants/plantSlice';
import { isValidImageType, isValidFileSize } from '../../services/cloudinary';
import './ImageUpload.css';

const ImageUpload = () => {
    const dispatch = useDispatch();
    const { uploading, uploadedFiles, errors } = useSelector((state) => state.upload);
    const { processing } = useSelector((state) => state.plants);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        // Validate files
        const validFiles = acceptedFiles.filter((file) => {
            if (!isValidImageType(file)) {
                toast.error(`${file.name}: Invalid file type. Please upload JPG or PNG.`);
                return false;
            }
            if (!isValidFileSize(file)) {
                toast.error(`${file.name}: File too large. Max size is 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setSelectedFiles((prev) => [...prev, ...validFiles]);
            toast.success(`${validFiles.length} file(s) selected`);
        }

        if (rejectedFiles.length > 0) {
            toast.error(`${rejectedFiles.length} file(s) rejected`);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
        },
        multiple: true,
    });

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        try {
            // Step 1: Upload to Cloudinary
            const uploadResult = await dispatch(uploadImages(selectedFiles)).unwrap();

            if (uploadResult.successful.length > 0) {
                toast.success(`${uploadResult.successful.length} image(s) uploaded successfully`);

                // Step 2: Process each uploaded image to extract location
                const processPromises = uploadResult.successful.map(({ file, url }) =>
                    dispatch(processImage({ imageName: file, imageUrl: url }))
                );

                const processResults = await Promise.allSettled(processPromises);

                // Step 3: Save plant data for successfully processed images
                processResults.forEach(async (result, index) => {
                    if (result.status === 'fulfilled' && result.value.payload) {
                        const plantData = result.value.payload;
                        try {
                            await dispatch(savePlant(plantData)).unwrap();
                            toast.success(`Plant data saved: ${plantData.imageName}`);
                        } catch (error) {
                            toast.error(`Failed to save: ${plantData.imageName}`);
                        }
                    } else {
                        const failedFile = uploadResult.successful[index].file;
                        toast.error(`Failed to extract location: ${failedFile}`);
                    }
                });

                // Clear selected files after processing
                setSelectedFiles([]);
            }

            if (uploadResult.failed.length > 0) {
                toast.error(`${uploadResult.failed.length} image(s) failed to upload`);
            }
        } catch (error) {
            toast.error('Upload failed. Please try again.');
        }
    };

    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="image-upload-container">
            <div className="upload-header">
                <h2>📸 Upload Plant Images</h2>
                <p>Upload geo-tagged images of your crops to visualize them on the farm map</p>
            </div>

            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="dropzone-content">
                    <div className="upload-icon">🌱</div>
                    {isDragActive ? (
                        <p>Drop the images here...</p>
                    ) : (
                        <>
                            <p>Drag & drop plant images here</p>
                            <p className="or-text">or</p>
                            <button type="button" className="browse-btn">
                                Browse Files
                            </button>
                            <p className="file-info">Supports: JPG, PNG (Max 10MB)</p>
                        </>
                    )}
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div className="selected-files">
                    <h3>Selected Files ({selectedFiles.length})</h3>
                    <div className="files-list">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                <div className="file-info-section">
                                    <span className="file-icon">🖼️</span>
                                    <div className="file-details">
                                        <p className="file-name">{file.name}</p>
                                        <p className="file-size">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFile(index)}
                                    disabled={uploading}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedFiles.length > 0 && (
                <button
                    className="upload-btn"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <span className="spinner"></span>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <span>🚀</span>
                            Upload & Process Images
                        </>
                    )}
                </button>
            )}

            {uploadedFiles.length > 0 && (
                <div className="upload-results">
                    <h3>✅ Recently Uploaded</h3>
                    <div className="results-list">
                        {uploadedFiles.map((file, index) => {
                            const processStatus = processing[file.file];
                            return (
                                <div key={index} className="result-item">
                                    <img src={file.url} alt={file.file} className="result-thumbnail" />
                                    <div className="result-info">
                                        <p className="result-name">{file.file}</p>
                                        <p className="result-status">
                                            {processStatus?.status === 'processing' && '⏳ Processing...'}
                                            {processStatus?.status === 'success' && '✅ Location extracted'}
                                            {processStatus?.status === 'failed' && '❌ Failed to extract location'}
                                            {!processStatus && '⏳ Waiting...'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
