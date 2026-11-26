import assert from 'node:assert/strict';
import { test } from 'node:test';
import { categoryNavigation, categoryName } from '../lib/catalog/category-navigation.ts';

test('mantém as oito categorias sem depender de produtos ou registros da API', () => {
  const links = categoryNavigation([]);
  assert.equal(links.length, 8);
  assert.deepEqual(links.map((item) => item.name), ['Mercado', 'Farmácia', 'Beleza', 'Moda', 'Eletrônicos', 'Jogos', 'Brinquedos', 'Casa']);
  assert.equal(links[0].href, '/categorias/mercado');
  assert.equal(categoryName('mercado'), 'Mercado');
  assert.equal(categoryName('inexistente'), undefined);
});

test('usa o ID real da API sem confundir com a posição no protótipo', () => {
  const links = categoryNavigation([{ id: 1, name: 'Eletronicos', parentId: null }]);
  assert.equal(links.find((item) => item.name === 'Eletrônicos').href, '/categorias/1');
  assert.equal(links.find((item) => item.name === 'Mercado').href, '/categorias/mercado');
});

test('preserva categorias extras da API sem duplicar as conhecidas ou incluir subcategorias', () => {
  const links = categoryNavigation([{ id: 9, name: 'Farmácia', parentId: null }, { id: 70, name: 'Esportes', parentId: null }, { id: 71, name: 'Corrida', parentId: 70 }]);
  assert.equal(links.length, 9);
  assert.equal(links.filter((item) => item.name === 'Farmácia').length, 1);
  assert.equal(links.at(-1).href, '/categorias/70');
});
