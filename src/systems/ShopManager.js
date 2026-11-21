const SHOP_ITEMS = [
  { id: 'cyan', name: 'CYAN CORE', color: '#00ffff', price: 0 },
  { id: 'magenta', name: 'MAGENTA PULSE', color: '#ff20bd', price: 50 },
  { id: 'gold', name: 'SOLAR FLARE', color: '#ffbd55', price: 100 },
  { id: 'lime', name: 'TOXIC CIRCUIT', color: '#a6ff00', price: 150 },
  { id: 'violet', name: 'VOID ORB', color: '#9b5cff', price: 200 },
  { id: 'ice', name: 'ICE PHOTON', color: '#91f5ff', price: 250 }
];

export class ShopManager {
  static init(player) {
    this.player = player;
    this.credits = Number(localStorage.getItem('dtts_credits')) || 0;
    this.owned = JSON.parse(localStorage.getItem('dtts_owned_skins') || '["cyan"]');
    this.selected = localStorage.getItem('dtts_selected_skin') || 'cyan';
    if (!this.owned.includes('cyan')) this.owned.push('cyan');
    this.applySelected();
    this.render();
  }

  static earn(amount) {
    this.credits += amount;
    localStorage.setItem('dtts_credits', String(this.credits));
    this.render();
  }

  static buyOrSelect(id) {
    const item = SHOP_ITEMS.find(entry => entry.id === id);
    if (!item) return;
    if (this.owned.includes(id)) {
      this.selected = id;
    } else if (this.credits >= item.price) {
      this.credits -= item.price;
      this.owned.push(id);
      this.selected = id;
      localStorage.setItem('dtts_credits', String(this.credits));
      localStorage.setItem('dtts_owned_skins', JSON.stringify(this.owned));
    } else {
      return;
    }
    localStorage.setItem('dtts_selected_skin', this.selected);
    this.applySelected();
    this.render();
  }

  static applySelected() {
    const item = SHOP_ITEMS.find(entry => entry.id === this.selected) || SHOP_ITEMS[0];
    this.player.setSkin(item.color);
  }

  static render() {
    const balance = document.getElementById('credits-val');
    const container = document.getElementById('shop-items');
    if (!balance || !container) return;
    balance.textContent = this.credits;
    const hudCoins = document.getElementById('coins-val');
    if (hudCoins) hudCoins.textContent = this.credits;
    container.innerHTML = SHOP_ITEMS.map(item => {
      const owned = this.owned.includes(item.id);
      const selected = this.selected === item.id;
      const label = selected ? 'EQUIPPED' : owned ? 'EQUIP' : `${item.price} COINS`;
      const disabled = selected || (!owned && this.credits < item.price);
      return `<article class="shop-item">
        <div class="skin-preview" style="background:${item.color};color:${item.color}"></div>
        <h2>${item.name}</h2>
        <p>${owned ? 'Ball style' : `Unlock for ${item.price} coins`}</p>
        <button class="btn" data-shop-item="${item.id}" ${disabled ? 'disabled' : ''}>${label}</button>
      </article>`;
    }).join('');
    container.querySelectorAll('[data-shop-item]').forEach(button => {
      button.addEventListener('click', () => this.buyOrSelect(button.dataset.shopItem));
    });
  }
}
