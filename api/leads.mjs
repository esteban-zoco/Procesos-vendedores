import { getCollection } from './_db.mjs';

export default async function handler(req, res) {
  try {
    const col = await getCollection();

    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const now = new Date();
      const doc = {
        createdAt: now,
        fecha: b.fecha || now.toISOString().slice(0, 10),
        nombre: b.nombre || '',
        apellido: b.apellido || '',
        cuit: b.cuit || '',
        email: b.email || '',
        telefono: b.telefono || '',
        rubro: b.rubro || '',
        volumenEstimado: b.volumenEstimado || '',
        origen: b.origen || '',
        puntoCaptura: b.puntoCaptura || '',
        ruteo: b.ruteo || '',
        tipoCliente: b.tipoCliente || '',
        tipoPersona: b.tipoPersona || '',
        califica: b.califica ?? '',
        motivoNoCalifica: b.motivoNoCalifica || '',
        proximoContacto: b.proximoContacto || '',
        observaciones: b.observaciones || '',
        raw: b.raw || null,
      };
      const r = await col.insertOne(doc);
      res.status(201).json({ ok: true, id: r.insertedId });
      return;
    }

    if (req.method === 'GET') {
      const items = await col.find({}).sort({ createdAt: -1 }).limit(2000).toArray();
      res.status(200).json({ ok: true, items });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('API /api/leads error', err);
    res.status(500).json({ ok: false, error: 'Internal error' });
  }
}

