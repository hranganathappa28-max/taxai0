// Bureau mode: the durable client registry that backs the Company-view client
// switcher (list / register / setActive / remove), persisted in localStorage.
import { describe, it, expect, beforeEach } from 'vitest';
import { clientRegistry } from '../TaxAI.jsx';

beforeEach(() => { try { localStorage.clear(); } catch (e) {} });

describe('clientRegistry', () => {
  it('registers, lists (most-recent first), switches active, and removes', () => {
    expect(clientRegistry.list()).toEqual([]);
    clientRegistry.register('305123458', { name: 'UAB Alpha', events: 12 });
    clientRegistry.register('111222333', { name: 'MB Beta', events: 5 });
    const list = clientRegistry.list();
    expect(list.length).toBe(2);
    expect(list[0].id).toBe('111222333'); // most recently seen first
    expect(list.find((c) => c.id === '305123458').name).toBe('UAB Alpha');

    clientRegistry.register('default', { name: 'ignored' }); // 'default' is never registered
    expect(clientRegistry.list().length).toBe(2);

    clientRegistry.setActive('111222333');
    expect(clientRegistry.active()).toBe('111222333');

    clientRegistry.remove('305123458');
    expect(clientRegistry.list().length).toBe(1);
    expect(clientRegistry.list()[0].id).toBe('111222333');
  });

  it('re-registering updates events but keeps the name', () => {
    clientRegistry.register('A', { name: 'UAB Alpha', events: 3 });
    clientRegistry.register('A', { events: 9 });
    const a = clientRegistry.list().find((c) => c.id === 'A');
    expect(a.name).toBe('UAB Alpha');
    expect(a.events).toBe(9);
  });
});
