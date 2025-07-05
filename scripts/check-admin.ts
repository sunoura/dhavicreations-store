import { db } from './db';
import { admin } from '../src/lib/server/db/schema';

async function checkAdmin() {
	try {
		console.log('Checking admin users in database...');

		const admins = await db.query.admin.findMany();

		console.log(`Found ${admins.length} admin user(s):`);

		admins.forEach((adminUser, index) => {
			console.log(`\nAdmin ${index + 1}:`);
			console.log(`  ID: ${adminUser.id}`);
			console.log(`  Username: ${adminUser.username}`);
			console.log(`  Email: ${adminUser.email}`);
			console.log(`  First Name: ${adminUser.firstName}`);
			console.log(`  Last Name: ${adminUser.lastName}`);
			console.log(`  Is Active: ${adminUser.isActive}`);
			console.log(`  Created At: ${adminUser.createdAt}`);
			console.log(`  Updated At: ${adminUser.updatedAt}`);
		});
	} catch (error) {
		console.error('Error checking admin users:', error);
	} finally {
		process.exit(0);
	}
}

checkAdmin();
