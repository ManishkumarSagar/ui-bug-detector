redirectIfLoggedIn();

let isLogin = true;

const form = document.getElementById('auth-form');
const title = document.getElementById('auth-title');
const sub = document.getElementById('auth-sub');
const nameGroup = document.getElementById('name-group');
const toggleMode = document.getElementById('toggle-mode');
const toggleText = document.getElementById('toggle-text');
const submitBtn = document.getElementById('auth-submit');

toggleMode.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  title.textContent = isLogin ? 'Welcome back' : 'Create your account';
  sub.textContent = isLogin
    ? 'Log in to your Vision AI account.'
    : 'Start detecting visual UI bugs in minutes.';
  nameGroup.hidden = isLogin;
  submitBtn.textContent = isLogin ? 'Log In' : 'Create Account';
  toggleText.textContent = isLogin ? 'New here?' : 'Already have an account?';
  toggleMode.textContent = isLogin ? 'Create account' : 'Log in';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = isLogin ? 'Logging in…' : 'Creating…';

  const body = {
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value
  };
  if (!isLogin) body.name = document.getElementById('name').value.trim();

  try {
    const data = await apiRequest(
      isLogin ? '/api/auth/login' : '/api/auth/register',
      { method: 'POST', body: JSON.stringify(body) }
    );
    localStorage.setItem('vision_token', data.token);
    localStorage.setItem('vision_user', JSON.stringify(data.user));
    window.location.href = 'index.html';
  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = isLogin ? 'Log In' : 'Create Account';
  }
});