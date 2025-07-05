import { db } from './db';
import { admin } from '../src/lib/server/db/schema';
import { AdminAuth } from '../src/lib/server/auth';

async function createAdmin() {
	try {
		// Check if admin already exists
		const existingAdmin = await db.query.admin.findFirst({
			where: (adminTable, { eq }) => eq(adminTable.username, 'admin')
		});

		if (existingAdmin) {
			console.log('Admin user already exists');
			return;
		}

		// Create admin user
		const adminId = crypto.randomUUID();
		const passwordHash = await AdminAuth.hashPassword('Namaskaram12!'); // Change this password!

		await db.insert(admin).values({
			id: adminId,
			username: 'sunnyb',
			email: 'sunny.bwaj@gmail.com',
			passwordHash,
			firstName: 'Sunny',
			lastName: 'Bharadwaj',
			isActive: true
		});

		console.log('Admin user created successfully!');
	} catch (error) {
		console.error('Error creating admin user:', error);
	} finally {
		process.exit(0);
	}
}

createAdmin();
