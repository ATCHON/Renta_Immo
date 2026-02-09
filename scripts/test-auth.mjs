const TEST_USER = {
    email: "test-auth-script@example.com",
    password: "Password123!",
    name: "Test Auth Script"
};

async function testAuth() {
    console.log("Testing Auth API...");
    try {
        const response = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000"
            },
            body: JSON.stringify(TEST_USER)
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Body: ${text}`);
        let data;
        try {
            data = JSON.parse(text);
            console.log("Response JSON:", data);
        } catch (e) {
            console.log("Response is not JSON");
        }

        if (response.ok) {
            console.log("SUCCESS: User created via API.");
        } else {
            console.log("FAILURE: API returned error.");
        }
    } catch (error) {
        console.error("ERROR: Could not connect to API.", error);
    }
}

testAuth();
