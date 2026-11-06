import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as normalize from '../lib/catalog/normalize.ts';
import {
  parseCategories,
  parseImages,
  parseProducts,
  parseStores,
} from '../lib/catalog/normalize.ts';

const product = {
  id: 10,
  name: 'Notebook',
  price: '3899.99',
  stock: 3,
  category_id: 5,
  store_id: 2,
};

test('combina produtos, lojas e primeira imagem pela ordem da API', () => {
  const stores = parseStores([
    { id: 2, name: 'Loja', sticker_url: 'https://example.com/logo.svg' },
  ]);
  const images = parseImages([
    { product_id: 10, order: 2, image_url: 'https://example.com/segunda.webp' },
    { product_id: 99, order: 0, image_url: 'https://example.com/outro.webp' },
    {
      product_id: 10,
      order: 0,
      image_url: 'https://example.com/primeira.webp',
    },
  ]);
  const result = parseProducts([product], stores, images)[0];
  assert.equal(result.price, 3899.99);
  assert.equal(result.storeName, 'Loja');
  assert.equal(result.storeLogo, 'https://example.com/logo.svg');
  assert.equal(result.image, 'https://example.com/primeira.webp');
  assert.equal(images[0].order, 2);
});

test('preserva produtos sem imagem ou loja disponível e estoque zerado', () => {
  const result = parseProducts([{ ...product, stock: 0 }])[0];
  assert.equal(result.stock, 0);
  assert.equal(result.image, null);
  assert.equal(result.storeLogo, null);
  assert.equal(result.storeName, '');
});

test('não transforma respostas vazias em produtos de demonstração', () => {
  assert.deepEqual(parseProducts([]), []);
  assert.deepEqual(parseCategories({ data: [] }), []);
});

test('valida preços, identificadores e estoque recebidos do backend', () => {
  for (const invalid of [
    { price: ' ' },
    { price: 'texto' },
    { price: -1 },
    { stock: -1 },
    { stock: 0.5 },
    { id: 0 },
    { category_id: null },
  ]) {
    assert.throws(() => parseProducts([{ ...product, ...invalid }]));
  }
  assert.throws(() => parseCategories({ error: 'Falha' }));
});

test('descarta URLs inválidas e usa a próxima imagem válida', () => {
  const images = parseImages([
    { product_id: 10, order: 0, image_url: 'javascript:alert(1)' },
    { product_id: 10, order: 1, image_url: 'https://example.com/valida.webp' },
  ]);
  assert.equal(
    parseProducts([product], [], images)[0].image,
    'https://example.com/valida.webp',
  );
});

test('preserva a hierarquia de categorias com IDs reais', () => {
  assert.deepEqual(
    parseCategories([{ id: 7, name: 'Notebooks', parent_category_id: 5 }]),
    [{ id: 7, name: 'Notebooks', parentId: 5 }],
  );
});

function loadApi(responses, session = null) {
  const calls = [];
  const compiledModule = { exports: {} };
  const source = readFileSync(
    new URL('../lib/catalog/api.ts', import.meta.url),
    'utf8',
  );
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, {
    exports: compiledModule.exports,
    URL,
    AbortSignal,
    process: { env: {} },
    require(name) {
      if (name === 'server-only') return {};
      if (name === './normalize') return normalize;
      if (name === '@/lib/auth')
        return {
          backendUrl: (path) => `http://api.test${path}`,
          SESSION_COOKIE: 'stockio_session',
        };
      if (name === 'next/headers')
        return {
          cookies: async () => ({
            get: () => (session ? { value: session } : undefined),
          }),
        };
      throw new Error(name);
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      const response = responses[new URL(url).pathname];
      if (response instanceof Error) throw response;
      return response;
    },
  });
  return { getCatalog: compiledModule.exports.getCatalog, calls };
}

function apiResponses() {
  return {
    '/categorias': Response.json([
      { id: 5, name: 'Eletrônicos', parent_category_id: null },
    ]),
    '/produtos': Response.json([product]),
    '/lojas': Response.json([
      { id: 2, name: 'Loja', logo_url: 'https://example.com/logo.svg' },
    ]),
    '/imagens': Response.json([
      {
        product_id: 10,
        order: 0,
        image_url: 'https://example.com/produto.webp',
      },
    ]),
  };
}

test('consulta as quatro rotas reais e envia a sessão somente ao backend', async () => {
  const api = loadApi(apiResponses(), 'sessao-do-teste');
  const result = await api.getCatalog();
  assert.equal(result.error, null);
  assert.equal(result.source, 'api');
  assert.equal(result.products[0].storeName, 'Loja');
  assert.equal(result.products[0].image, 'https://example.com/produto.webp');
  assert.equal(api.calls.length, 4);
  assert.ok(
    api.calls.every(
      (call) => call.options.headers.Authorization === 'Bearer sessao-do-teste',
    ),
  );
  assert.ok(!JSON.stringify(result).includes('sessao-do-teste'));
});

test('preserva os produtos disponíveis quando o serviço de imagens falha', async () => {
  const responses = apiResponses();
  responses['/imagens'] = new Error('Conexão indisponível');
  const api = loadApi(responses);
  const result = await api.getCatalog();
  assert.match(result.error, /imagens/);
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].image, null);
  assert.ok(
    api.calls.every((call) => call.options.headers.Authorization === undefined),
  );
});

test('trata acesso negado e resposta inválida sem misturar exemplos', async () => {
  const responses = apiResponses();
  responses['/categorias'] = new Response('', { status: 401 });
  responses['/produtos'] = Response.json({ message: 'Resposta inesperada' });
  const result = await loadApi(responses).getCatalog();
  assert.match(result.error, /categorias/);
  assert.match(result.error, /produtos/);
  assert.equal(result.categories.length, 0);
  assert.equal(result.products.length, 0);
  assert.equal(result.source, 'api');
});
