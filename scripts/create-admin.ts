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
        const passwordHash = await AdminAuth.hashPassword('admin123'); // Change this password!

        await db.insert(admin).values({
            id: adminId,
            username: 'admin',
            email: 'admin@example.com', // Change this email!
            passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            isActive: true,
        });

        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Please change these credentials immediately!');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        process.exit(0);
    }
}

createAdmin(); 