const { authenticator } = require('otplib');

async function main() {
  const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tariq.mahmud@university.edu',
      password: 'SmartEdu#2026',
    }),
  });
  const loginData = await loginRes.json();
  console.log('loginData', loginData);
  const code = authenticator.generate('JBSWY3DPEHPK3PXQ');
  const mfaRes = await fetch('http://localhost:4000/api/v1/auth/mfa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mfaToken: loginData.mfaToken,
      code,
    }),
  });
  const mfaData = await mfaRes.json();
  console.log('mfaData', mfaData);
  console.log('ADMIN_TOKEN_START:' + mfaData.accessToken + ':ADMIN_TOKEN_END');
}

main();
