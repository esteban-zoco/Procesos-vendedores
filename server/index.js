import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'zocoTickets';
const COLLECTION = process.env.MONGODB_COLLECTION || 'leads';
const PORT = process.env.PORT || 4000;

if (!MONGODB_URI) {
  console.error('Falta la variable MONGODB_URI en el entorno (.env).');
  process.exit(1);
}

let client;
let collection;

async function initDb() {
  client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);
  await collection.createIndex({ createdAt: -1 });
}

// Helper: CSV escape
function csvEscape(v) {
  const s = (v ?? '').toString().replace(/"/g, '""');
  return `"${s}"`;
}

// Guardar lead
app.post('/api/leads', async (req, res) => {
  try {
    const b = req.body || {};
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

    const result = await collection.insertOne(doc);
    res.status(201).json({ ok: true, id: result.insertedId });
  } catch (err) {
    console.error('POST /api/leads error', err);
    res.status(500).json({ ok: false, error: 'Error al guardar lead' });
  }
});

// Listado JSON (opcional)
app.get('/api/leads', async (_req, res) => {
  try {
    const items = await collection.find({}).sort({ createdAt: -1 }).limit(2000).toArray();
    res.json({ ok: true, items });
  } catch (err) {
    console.error('GET /api/leads error', err);
    res.status(500).json({ ok: false, error: 'Error al obtener leads' });
  }
});

// Descargar CSV de todo el histórico
app.get('/api/leads/csv', async (_req, res) => {
  try {
    const items = await collection.find({}).sort({ createdAt: -1 }).toArray();
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

    // CRLF + UTF-16LE con BOM: Excel (Windows) abre con acentos correctos y columnas
    const csv = lines.join('\r\n');
    const buf = Buffer.from('\uFEFF' + csv, 'utf16le');
    res.setHeader('Content-Type', 'text/csv; charset=utf-16le');
    res.setHeader('Content-Disposition', "attachment; filename=\"zoco_leads.csv\"; filename*=UTF-8''zoco_leads.csv");
    res.end(buf);
  } catch (err) {
    console.error('GET /api/leads/csv error', err);
    res.status(500).json({ ok: false, error: 'Error al generar CSV' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('No se pudo iniciar la API', err);
    process.exit(1);
  });

