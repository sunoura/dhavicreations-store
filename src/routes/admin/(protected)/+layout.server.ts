import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }: { locals: any }) => {
	if (!locals.admin) {
		throw redirect(302, '/admin/login');
	}

	return;
};
