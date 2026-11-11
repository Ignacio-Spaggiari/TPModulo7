// Patrón Object Pool: en lugar de crear y destruir objetos todo el tiempo, se crean
// una sola vez y se reutilizan. Evita picos de memoria y trabas cuando hay muchos
// objetos efímeros en pantalla (por ejemplo, decenas de números de daño por segundo).
//
// Los enemigos, proyectiles e ítems usan el mismo patrón a través de los
// Physics Groups de Phaser (group.get() reutiliza un miembro inactivo).
export default class ObjectPool {
  // `create` fabrica un objeto nuevo cuando no hay ninguno libre.
  constructor(create, maxSize) {
    this.create = create;
    this.maxSize = maxSize;
    this.items = [];
  }

  // Devuelve un objeto libre ya activado, o null si el pool está lleno.
  acquire() {
    let item = this.items.find((candidate) => !candidate.active);
    if (!item) {
      if (this.items.length >= this.maxSize) return null;
      item = this.create();
      this.items.push(item);
    }
    return item.setActive(true).setVisible(true);
  }

  release(item) {
    item.setActive(false).setVisible(false);
  }
}
