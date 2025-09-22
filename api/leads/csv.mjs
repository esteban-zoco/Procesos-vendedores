import { getCollection } from '../_db.mjs';

function csvEscape(v) {
  const s = (v ?? '').toString().replace(/"/g, '""');
  return `"${s}"`;
}

export default async function handler(_req, res) {
  try {
    const col = await getCollection();
    const items = await col.find({}).sort({ createdAt: -1 }).toArray();
    const headers = [
      'Fecha',
      'Nombre y apellido',
      'CUIT',
      'Email',
      'Teléfono',
      'Rubro',
      'Volumen estimado',
      'Origen',
      'Punto de captura',
      'Ruteo',
      'Tipo cliente',
      'Tipo de persona',
      'Califica',
      'Motivo no califica',
      'Próximo contacto',
      'Observaciones',
    ];

    const lines = ['sep=,', headers.join(',')];
    for (const x of items) {
      const row = [
        x.fecha || (x.createdAt ? new Date(x.createdAt).toISOString().slice(0, 10) : ''),
        `${x.nombre || ''} ${x.apellido || ''}`.trim(),
        x.cuit || '',
        x.email || '',
        x.telefono || '',
        x.rubro || '',
        x.volumenEstimado || '',
        x.origen || '',
        x.puntoCaptura || '',
        x.ruteo || '',
        x.tipoCliente || '',
        x.tipoPersona || '',
        x.califica === true ? 'Sí' : x.califica === false ? 'No' : (x.califica || ''),
        x.motivoNoCalifica || '',
        x.proximoContacto || '',
        x.observaciones || '',
      ].map(csvEscape);
      lines.push(row.join(','));
    }

    const csv = lines.join('\r\n');
    const buf = Buffer.from('\uFEFF' + csv, 'utf16le');
    res.setHeader('Content-Type', 'text/csv; charset=utf-16le');
    res.setHeader('Content-Disposition', "attachment; filename=\"zoco_leads.csv\"; filename*=UTF-8''zoco_leads.csv");
    res.end(buf);
  } catch (err) {
    console.error('API /api/leads/csv error', err);
    res.status(500).json({ ok: false, error: 'Internal error' });
  }
}

