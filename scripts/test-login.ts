import { AdminAuth } from '../src/lib/server/auth';

async function testLogin() {
	try {
		console.log('Testing admin login...');
		
		// Test with correct credentials
		const result = await AdminAuth.login('sunnyb', 'admin123');
		
		if (result) {
			console.log('✅ Login successful!');
			console.log('Admin:', result.admin);
			console.log('Session:', result.session);
		} else {
			console.log('❌ Login failed - invalid credentials');
		}
		
		// Test with wrong password
		const wrongResult = await AdminAuth.login('sunnyb', 'wrongpassword');
		if (!wrongResult) {
			console.log('✅ Correctly rejected wrong password');
		} else {
			console.log('❌ Wrong password was accepted!');
		}
		
		// Test with wrong username
		const wrongUserResult = await AdminAuth.login('wronguser', 'admin123');
		if (!wrongUserResult) {
			console.log('✅ Correctly rejected wrong username');
		} else {
			console.log('❌ Wrong username was accepted!');
		}
		
	} catch (error) {
		console.error('Error testing login:', error);
	} finally {
		process.exit(0);
	}
}

testLogin(); 