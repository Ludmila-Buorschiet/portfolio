const nodemailer = require('nodemailer');

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const nome     = sanitize(req.body?.nome);
  const email    = sanitize(req.body?.email);
  const servico  = sanitize(req.body?.servico);
  const mensagem = sanitize(req.body?.mensagem);

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from:    `"Portfólio Ludmila" <${process.env.SMTP_USER}>`,
      to:      process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `[Portfolio] Novo contato de ${nome}${servico ? ` — ${servico}` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem 2rem 1.5rem;background:#1C101E;color:#FFF8F9;border-radius:8px;">
          <p style="margin:0 0 1.5rem;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#9A7886;">Portfólio · Novo contato</p>
          <h2 style="margin:0 0 1.5rem;font-size:1.5rem;color:#F95D40;">${nome}</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem;">
            <tr>
              <td style="padding:.4rem 0;color:#9A7886;font-size:.8rem;width:80px;">E-mail</td>
              <td style="padding:.4rem 0;"><a href="mailto:${email}" style="color:#E2C7BC;">${email}</a></td>
            </tr>
            ${servico ? `<tr>
              <td style="padding:.4rem 0;color:#9A7886;font-size:.8rem;">Serviço</td>
              <td style="padding:.4rem 0;color:#FFF8F9;">${servico}</td>
            </tr>` : ''}
          </table>
          <div style="border-top:1px solid rgba(255,248,249,0.1);padding-top:1.5rem;line-height:1.75;color:#E2C7BC;">
            ${mensagem.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true, message: 'Mensagem enviada com sucesso!' });
  } catch (err) {
    console.error('[contact] Erro ao enviar e-mail:', err.message);
    return res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente.' });
  }
};
