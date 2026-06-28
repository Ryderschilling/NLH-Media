export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, school, service, date, instagram, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY env var');
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  const emailText = [
    `New inquiry from NLH Media website`,
    ``,
    `Name:        ${name}`,
    `Email:       ${email}`,
    `School/Team: ${school || '—'}`,
    `Service:     ${service || '—'}`,
    `Date:        ${date || '—'}`,
    `Instagram:   ${instagram || '—'}`,
    ``,
    `Message:`,
    message || '—',
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NLH Media <contact@nlh-media.com>',
      to: [process.env.TO_EMAIL || 'contact@nlh-media.com'],
      reply_to: email,
      subject: `New Inquiry — ${service || 'General'} from ${name}`,
      text: emailText,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('Resend error:', err);
    return res.status(502).json({ error: 'Failed to send email.' });
  }

  return res.status(200).json({ ok: true });
}
