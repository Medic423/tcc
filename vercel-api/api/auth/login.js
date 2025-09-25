module.exports = (req, res) => {
  const origin = req.headers.origin || '';
  const isAllowed = origin.endsWith('.vercel.app') || origin === 'https://traccems.com' || origin === 'https://www.traccems.com' || origin.startsWith('http://localhost:');
  if (origin) res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : '*');
  if (isAllowed) res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Version, X-Environment, X-TCC-Env, Cache-Control, Pragma');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const valid = {
    'admin@tcc.com': { password: 'admin123', userType: 'ADMIN', name: 'TCC Administrator' },
    'admin@altoonaregional.org': { password: 'password123', userType: 'HEALTHCARE', name: 'Healthcare Admin' }
  };
  const user = valid[email];
  if (user && user.password === password) {
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: 'vercel-jwt-token-' + Date.now() + '-' + email,
      user: { id: 'vercel-' + Date.now(), email, name: user.name, userType: user.userType }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
};


