# FarmViz - Crop Location Visualization

A production-ready React application for farmers to upload geo-tagged plant images and visualize them on an interactive map.

## 🚀 Features

- **Image Upload**: Drag & drop support with Cloudinary integration
- **Location Extraction**: Automatic GPS coordinate extraction from images
- **Interactive Map**: Leaflet-based farm visualization with custom markers
- **Data Management**: Persistence of plant data
- **Premium UI**: Modern, responsive design with Dark Mode support
- **Export**: Download your farm data as CSV

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **State Management**: Redux Toolkit
- **API**: Axios
- **Maps**: React Leaflet
- **Styling**: Vanilla CSS (CSS Variables + Flexbox/Grid)
- **Icons**: Cloudinary (storage), Leaflet (maps)

## 📦 Setup & Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory with your keys:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   VITE_API_BASE_URL=your_api_base_url
   VITE_USER_EMAIL=your_user_email
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── app/            # Redux store configuration
├── components/     # Reusable UI components
├── features/       # Redux slices (state management)
├── services/       # API and external client services
├── utils/          # Helper functions
└── main.jsx        # Entry point
```

## 📝 Notes

- Ensure uploaded images contain EXIF GPS data for automatic location extraction.
- The application uses `react-hot-toast` for user feedback.
- Dark mode preference and plant data are cached in `localStorage`.
