// Test script to verify frontend authentication fix
// Run this in browser console to test the API calls

async function testSignup() {
    console.log('🔄 Testing signup...');
    try {
        const response = await fetch('http://localhost:8000/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123',
                name: 'Test User',
                phone: '+1234567890'
            })
        });
        
        const data = await response.json();
        console.log('✅ Signup response:', data);
        
        // Test the response format
        const userInfo = data.user || data;
        console.log('📊 User info extracted:', {
            id: userInfo.user_id || userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            phone: userInfo.phone
        });
        
        return data;
    } catch (error) {
        console.error('❌ Signup failed:', error);
        return null;
    }
}

async function testSignin() {
    console.log('🔄 Testing signin...');
    try {
        const response = await fetch('http://localhost:8000/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123'
            })
        });
        
        const data = await response.json();
        console.log('✅ Signin response:', data);
        
        // Test the response format
        const userInfo = data.user || data;
        console.log('📊 User info extracted:', {
            id: userInfo.user_id || userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            phone: userInfo.phone
        });
        
        return data;
    } catch (error) {
        console.error('❌ Signin failed:', error);
        return null;
    }
}

async function runTests() {
    console.log('🧪 Running Frontend Authentication Tests');
    console.log('=' * 50);
    
    // Test signup
    const signupResult = await testSignup();
    
    if (signupResult) {
        // Test signin
        const signinResult = await testSignin();
        
        if (signinResult) {
            console.log('🎉 All tests passed! Authentication should work now.');
        } else {
            console.log('❌ Signin test failed');
        }
    } else {
        console.log('❌ Signup test failed');
    }
}

// Run the tests
runTests();
