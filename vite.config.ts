import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin local para expor API de dados rodando direto do Vite
const apiPlugin = () => {
  // Inicialização do SQLite Local File
  const sqliteDbPath = path.resolve(__dirname, 'kanban-orders.sqlite');
  const db = new DatabaseSync(sqliteDbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      orderNumber TEXT,
      clientName TEXT,
      productName TEXT,
      totalQuantity INTEGER,
      producedQuantity INTEGER,
      startDate TEXT,
      status TEXT,
      aiPrediction TEXT,
      isPredicting INTEGER,
      sequence INTEGER
    )
  `);

  const insertOrderStmt = db.prepare('INSERT INTO orders (id, orderNumber, clientName, productName, totalQuantity, producedQuantity, startDate, status, aiPrediction, isPredicting, sequence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  return {
    name: 'api-plugin',
    configureServer(server: any) {
      const legacyDbPath = path.resolve(__dirname, 'kanban-db.json');

      server.middlewares.use((req: any, res: any, next: any) => {
        // --- API REST PARA PEDIDOS (Ordens - Alta Frequência, Tempo Real, SQLite) ---
        if (req.url && req.url.startsWith('/api/orders')) {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            try {
              const rows = db.prepare('SELECT * FROM orders ORDER BY sequence ASC').all() as any[];
              // Refazer boolean
              rows.forEach(r => r.isPredicting = r.isPredicting === 1);
              res.end(JSON.stringify(rows));
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: string) => { body += chunk; });
            req.on('end', () => {
              try {
                const orders = JSON.parse(body);
                db.exec('BEGIN TRANSACTION');
                db.exec('DELETE FROM orders');
                orders.forEach((o: any, i: number) => {
                  insertOrderStmt.run(
                    o.id, o.orderNumber, o.clientName, o.productName,
                    o.totalQuantity, o.producedQuantity, o.startDate,
                    o.status, o.aiPrediction || null, o.isPredicting ? 1 : 0, i
                  );
                });
                db.exec('COMMIT');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              } catch (e: any) {
                db.exec('ROLLBACK');
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }

        // --- API LEGADA PARA CLIENTES E PRODUTOS (Baixa Frequência, JSON) ---
        if (req.url && req.url.startsWith('/api/db')) {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            if (!fs.existsSync(legacyDbPath)) {
              res.end(JSON.stringify({ empty: true }));
            } else {
              res.end(fs.readFileSync(legacyDbPath, 'utf-8'));
            }
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: string) => { body += chunk; });
            req.on('end', () => {
              fs.writeFileSync(legacyDbPath, body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            });
            return;
          }
        }

        next();
      });
    }
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), apiPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
