import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        theme: localStorage.getItem('theme') || 'light',
        currentView: 'upload', // 'upload', 'map', 'detail'
        sidebarOpen: true,
        notifications: [],
    },
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
        },
        setCurrentView: (state, action) => {
            state.currentView = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(),
                ...action.payload,
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                (n) => n.id !== action.payload
            );
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const {
    setTheme,
    toggleTheme,
    setCurrentView,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
