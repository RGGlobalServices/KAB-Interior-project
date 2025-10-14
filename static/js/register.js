// Register Page JavaScript

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        showLoading();

        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        setToken(data.token);
        setCurrentUser(data.user);

        showToast('Account created successfully!', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 500);

    } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
    } finally {
        hideLoading();
    }
});

// Check if already logged in
if (isAuthenticated()) {
    window.location.href = '/dashboard';
}

