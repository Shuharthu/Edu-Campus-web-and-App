const { authenticator } = require('otplib');

async function test() {
  const res1 = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tariq.mahmud@university.edu',
      password: 'SmartEdu#2026',
    }),
  });
  const data1 = await res1.json();
  console.log('login status:', res1.status, 'mfaToken present:', !!data1.mfaToken);

  const code = authenticator.generate('JBSWY3DPEHPK3PXQ');
  console.log('generated TOTP code:', code);

  const res2 = await fetch('http://localhost:4000/api/v1/auth/mfa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mfaToken: data1.mfaToken,
      code,
    }),
  });
  const data2 = await res2.json();
  console.log('mfa response status:', res2.status, 'has accessToken:', !!data2.accessToken);
  if (data2.accessToken) {
    console.log('accessToken:', data2.accessToken);
    console.log('user:', JSON.stringify(data2.user));
  } else {
    console.log('data2 error:', data2);
  }
}

test().catch(console.error);
