// Login Page JavaScript

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        showLoading();

        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        setToken(data.token);
        setCurrentUser(data.user);

        showToast('Login successful!', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 500);

    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
    } finally {
        hideLoading();
    }
});

// Check if already logged in
if (isAuthenticated()) {
    window.location.href = '/dashboard';
}

