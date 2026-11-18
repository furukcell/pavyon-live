import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionRules } from './sessionRules.js';

const makeRules = () => createSessionRules(['kons-1', 'kons-2']);

test('reserves an available kons for one viewer', () => {
  const rules = makeRules();
  assert.equal(rules.canReserve('kons-1', 'viewer-a'), true);
  assert.equal(rules.reserve('kons-1', 'viewer-a'), true);
  assert.equal(rules.ownerOf('kons-1'), 'viewer-a');
  assert.equal(rules.konsFor('viewer-a'), 'kons-1');
});

test('prevents two viewers from reserving the same kons', () => {
  const rules = makeRules();
  assert.equal(rules.reserve('kons-1', 'viewer-a'), true);
  assert.equal(rules.reserve('kons-1', 'viewer-b'), false);
  assert.equal(rules.ownerOf('kons-1'), 'viewer-a');
});

test('prevents one viewer from opening simultaneous kons sessions', () => {
  const rules = makeRules();
  assert.equal(rules.reserve('kons-1', 'viewer-a'), true);
  assert.equal(rules.reserve('kons-2', 'viewer-a'), false);
  assert.equal(rules.ownerOf('kons-2'), null);
});

test('rejects unknown kons ids and empty reservations', () => {
  const rules = makeRules();
  assert.equal(rules.reserve('kons-99', 'viewer-a'), false);
  assert.equal(rules.reserve('kons-1', ''), true);
});

test('releases both sides of a kons reservation', () => {
  const rules = makeRules();
  rules.reserve('kons-1', 'viewer-a');
  assert.equal(rules.releaseKons('kons-1'), 'viewer-a');
  assert.equal(rules.ownerOf('kons-1'), null);
  assert.equal(rules.konsFor('viewer-a'), null);
  assert.equal(rules.reserve('kons-2', 'viewer-a'), true);
});

test('can release a viewer session and reuse the kons', () => {
  const rules = makeRules();
  rules.reserve('kons-1', 'viewer-a');
  assert.equal(rules.releaseViewer('viewer-a'), 'kons-1');
  assert.equal(rules.ownerOf('kons-1'), null);
  assert.equal(rules.releaseViewer('viewer-a'), null);
  assert.equal(rules.reserve('kons-1', 'viewer-b'), true);
});
