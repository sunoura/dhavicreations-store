import { setContext, getContext } from 'svelte';
import type { AuthAdmin } from '$lib/server/auth';

// Context key for admin state
const ADMIN_CONTEXT_KEY = Symbol('admin');

// Admin state interface
export interface AdminState {
    admin: AuthAdmin | null;
    isAuthenticated: boolean;
    loading: boolean;
}

// Create admin state
export function createAdminState() {
    const state: AdminState = $state({
        admin: null,
        isAuthenticated: false,
        loading: false
    });

    // Actions
    const actions = {
        setAdmin(admin: AuthAdmin | null) {
            state.admin = admin;
            state.isAuthenticated = !!admin;
        },

        setLoading(loading: boolean) {
            state.loading = loading;
        },

        logout() {
            state.admin = null;
            state.isAuthenticated = false;
        }
    };

    return { state, actions };
}

// Context functions
export function setAdminContext(state: ReturnType<typeof createAdminState>) {
    setContext(ADMIN_CONTEXT_KEY, state);
}

export function getAdminContext() {
    return getContext<ReturnType<typeof createAdminState>>(ADMIN_CONTEXT_KEY);
}

// Helper functions
export function useAdmin() {
    const context = getAdminContext();
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
} 