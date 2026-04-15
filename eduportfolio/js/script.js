const DB_KEY_USERS = 'eduportfolioUsers';
const OTP_KEY_PREFIX = 'eduportfolioOtp_';

const getElement = (...ids) => ids.map((id) => document.getElementById(id)).find(Boolean);

const formFeedback = (id, message, color = '#1f7a3b') => {
  const el = getElement(id, `${id}Feedback`, id.replace('-', ''));
  if (el) {
    el.textContent = message;
    el.style.color = color;
  }
};

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const validateFields = (fields) => {
  let valid = true;
  fields.forEach((field) => {
    const input = getElement(field.id, field.altId).querySelector ? getElement(field.id, field.altId) : getElement(field.id, field.altId);
    if (!input) return;
    const value = input.value.trim();
    input.style.borderColor = '#cbd5e1';
    if (!value) {
      valid = false;
      input.style.borderColor = '#dc2626';
      return;
    }
    if (field.pattern && !field.pattern.test(value)) {
      valid = false;
      input.style.borderColor = '#dc2626';
    }
  });
  return valid;
};

const loadDatabase = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveDatabase = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const findUserByEmail = (email) => {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return loadDatabase(DB_KEY_USERS).find((user) => user.email === normalized) || null;
};

const addUser = (user) => {
  const users = loadDatabase(DB_KEY_USERS);
  users.push(user);
  saveDatabase(DB_KEY_USERS, users);
};

const initializeUserDatabase = () => {
  if (localStorage.getItem(DB_KEY_USERS)) return;
  saveDatabase(DB_KEY_USERS, [
    { name: 'Demo User', email: 'user@example.com', password: 'password123' },
  ]);
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOtp = (context, messageId) => {
  const otp = generateOtp();
  localStorage.setItem(`${OTP_KEY_PREFIX}${context}`, otp);
  formFeedback(messageId, `OTP: ${otp} (copy this)`, '#1f7a3b');
  console.log(`OTP for ${context}: ${otp}`);
};

const verifyOtp = (context, inputIds) => {
  const saved = localStorage.getItem(`${OTP_KEY_PREFIX}${context}`);
  const input = getElement(...inputIds);
  return !!saved && input && input.value.trim() === saved;
};

const handleRegister = () => {
  const form = getElement('register-form', 'registerForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = [
      { id: 'register-name' },
      { id: 'register-email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { id: 'register-password' },
      { id: 'register-otp' },
    ];

    if (!validateFields(fields)) {
      return formFeedback('register-feedback', 'Please fill all registration fields.', '#dc2626');
    }

    const emailInput = getElement('register-email');
    const email = emailInput.value.trim().toLowerCase();
    if (findUserByEmail(email)) {
      return formFeedback('register-feedback', 'Email already registered.', '#dc2626');
    }

    if (!verifyOtp('register', ['register-otp'])) {
      return formFeedback('register-feedback', 'Invalid OTP. Click Send OTP first.', '#dc2626');
    }

    addUser({
      name: getElement('register-name').value.trim(),
      email,
      password: getElement('register-password').value,
    });

    formFeedback('register-feedback', 'Registered successfully. Please login.', '#1f7a3b');
    form.reset();
  });
};

const handleLogin = () => {
  const form = getElement('login-form', 'loginForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = [
      { id: 'login-email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { id: 'login-password' },
      { id: 'login-otp' },
    ];

    if (!validateFields(fields)) {
      return formFeedback('login-feedback', 'Please fill all login fields.', '#dc2626');
    }

    const email = getElement('login-email').value.trim().toLowerCase();
    const password = getElement('login-password').value;
    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
      return formFeedback('login-feedback', 'Incorrect email or password.', '#dc2626');
    }

    if (!verifyOtp('login', ['login-otp'])) {
      return formFeedback('login-feedback', 'Invalid OTP. Click Send OTP first.', '#dc2626');
    }

    formFeedback('login-feedback', `Welcome back, ${user.name}!`, '#1f7a3b');
    form.reset();
  });
};

const handleContact = () => {
  const form = getElement('contact-form', 'contactForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = [
      { id: 'contact-name' },
      { id: 'contact-email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { id: 'contact-message' },
    ];

    if (!validateFields(fields)) {
      return formFeedback('contact-feedback', 'Please fill all contact fields.', '#dc2626');
    }

    formFeedback('contact-feedback', 'Message sent!', '#1f7a3b');
    form.reset();
  });
};

const bindOtpButtons = () => {
  const registerButton = getElement('register-send-otp', 'sendOtpRegister');
  if (registerButton) {
    registerButton.addEventListener('click', () => sendOtp('register', 'register-feedback'));
  }

  const loginButton = getElement('send-otp', 'login-send-otp', 'sendOtpLogin');
  if (loginButton) {
    loginButton.addEventListener('click', () => sendOtp('login', 'login-feedback'));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initializeUserDatabase();
  handleRegister();
  handleLogin();
  handleContact();
  bindOtpButtons();
});