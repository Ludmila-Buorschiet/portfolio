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

  const nome         = sanitize(req.body?.nome);
  const empresa      = sanitize(req.body?.empresa);
  const email        = sanitize(req.body?.email);
  const telefone     = sanitize(req.body?.telefone);
  const comoconheceu = sanitize(req.body?.comoconheceu);
  const servicos     = sanitize(req.body?.servicos);
  const descricao    = sanitize(req.body?.descricao);
  const publico      = sanitize(req.body?.publico);
  const referencias  = sanitize(req.body?.referencias);
  const budget       = sanitize(req.body?.budget);
  const prazo        = sanitize(req.body?.prazo);
  const observacoes  = sanitize(req.body?.observacoes);

  if (!nome || !email || !servicos || !descricao) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
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

  const row = (label, value) => value ? `
    <tr>
      <td style="padding:.5rem 0;color:#9A7886;font-size:.8rem;vertical-align:top;white-space:nowrap;padding-right:1.5rem;">${label}</td>
      <td style="padding:.5rem 0;color:#FFF8F9;">${value}</td>
    </tr>` : '';

  try {
    await transporter.sendMail({
      from:    `"Portfólio Ludmila" <${process.env.SMTP_USER}>`,
      to:      process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `[Proposta] ${nome}${empresa ? ` — ${empresa}` : ''} · ${servicos}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1C101E;border-radius:8px;overflow:hidden;">

          <div style="background:#F95D40;padding:1.5rem 2rem;">
            <p style="margin:0;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(28,16,30,.7);">Nova solicitação de proposta</p>
            <h1 style="margin:.5rem 0 0;font-size:1.6rem;color:#1C101E;">${nome}${empresa ? ` <span style="opacity:.6;font-size:1.1rem;">· ${empresa}</span>` : ''}</h1>
          </div>

          <div style="padding:2rem;">
            <p style="margin:0 0 1.5rem;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#9A7886;">Dados de contato</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:2rem;">
              ${row('E-mail', `<a href="mailto:${email}" style="color:#E2C7BC;">${email}</a>`)}
              ${row('WhatsApp', telefone)}
              ${row('Como encontrou', comoconheceu)}
            </table>

            <p style="margin:0 0 1.5rem;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#9A7886;">O projeto</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:2rem;">
              ${row('Serviços', `<strong style="color:#F95D40;">${servicos}</strong>`)}
              ${row('Público-alvo', publico)}
              ${row('Referências', referencias)}
            </table>

            <div style="border:1px solid rgba(255,248,249,.1);padding:1.25rem;margin-bottom:2rem;border-radius:4px;">
              <p style="margin:0 0 .75rem;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:#9A7886;">Descrição do projeto</p>
              <p style="margin:0;line-height:1.75;color:#E2C7BC;">${descricao.replace(/\n/g, '<br>')}</p>
            </div>

            <p style="margin:0 0 1.5rem;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#9A7886;">Investimento</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:2rem;">
              ${row('Faixa', `<strong>${budget}</strong>`)}
              ${row('Prazo', prazo)}
            </table>

            ${observacoes ? `
            <div style="border:1px solid rgba(249,93,64,.2);padding:1.25rem;border-radius:4px;">
              <p style="margin:0 0 .75rem;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:#F95D40;">Observações</p>
              <p style="margin:0;line-height:1.75;color:#E2C7BC;">${observacoes.replace(/\n/g, '<br>')}</p>
            </div>` : ''}
          </div>

          <div style="padding:1rem 2rem;border-top:1px solid rgba(255,248,249,.08);">
            <p style="margin:0;font-size:.7rem;color:rgba(255,248,249,.25);">Enviado via portfólio · ludmilabuorschiet.com.br</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[proposta] Erro:', err.message);
    return res.status(500).json({ error: 'Erro ao enviar. Tente novamente.' });
  }
};
