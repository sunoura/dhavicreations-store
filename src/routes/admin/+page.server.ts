import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }: { locals: any }) => {
    // If admin is authenticated, redirect to dashboard
    if (locals.admin) {
        throw redirect(302, '/admin/dashboard');
    }
    
    // If not authenticated, redirect to login
    throw redirect(302, '/admin/login');
};
