import { authenticator } from 'otplib';

async function getToken() {
  const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'tariq.mahmud@university.edu',
      password: 'SmartEdu#2026',
    }),
  });
  const loginData = await loginRes.json();
  const code = authenticator.generate('JBSWY3DPEHPK3PXP');
  const mfaRes = await fetch('http://localhost:4000/api/v1/auth/mfa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mfaToken: loginData.mfaToken,
      code,
    }),
  });
  const mfaData = await mfaRes.json();
  console.log('ADMIN_ACCESS_TOKEN=' + mfaData.accessToken);
}

getToken();
