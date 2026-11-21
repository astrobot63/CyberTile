const SHOP_ITEMS = [
  { id: 'cyan', name: 'CYAN CORE', color: '#00ffff', price: 0 },
  { id: 'magenta', name: 'MAGENTA PULSE', color: '#ff20bd', price: 100 },
  { id: 'gold', name: 'SOLAR FLARE', color: '#ffbd55', price: 250 },
  { id: 'lime', name: 'TOXIC CIRCUIT', color: '#a6ff00', price: 400 },
  { id: 'violet', name: 'VOID ORB', color: '#9b5cff', price: 600 },
  { id: 'ice', name: 'ICE PHOTON', color: '#91f5ff', price: 800 }
];

const POWERUPS = [
  { id: 'shield', name: 'FALL SHIELD', icon: '🛡️', color: '#62f5ff', price: 300, description: 'Saves you from one fall and places you safely on the next tile.' },
  { id: 'doubleCoins', name: 'COIN DOUBLER', icon: '💰', color: '#ffda66', price: 250, description: 'Doubles coin rewards for your first 20 landings.' },
  { id: 'coinMagnet', name: 'COIN MAGNET', icon: '🧲', color: '#ff62dc', price: 350, description: 'Adds 2 bonus coins to your first 25 landings.' },
  { id: 'scoreBoost', name: 'SCORE BOOST', icon: '⚡', color: '#a6ff00', price: 300, description: 'Doubles score from your first 20 landings.' }
];

export class ShopManager {
  static init(player) {
    this.player = player;
    this.credits = Number(localStorage.getItem('dtts_credits')) || 0;
    this.owned = this.loadOwnedSkins();
    const savedSelection = localStorage.getItem('dtts_selected_skin') || 'cyan';
    this.selected = this.owned.includes(savedSelection) ? savedSelection : 'cyan';
    this.powerupInventory = this.loadPowerups();
    if (!this.owned.includes('cyan')) this.owned.push('cyan');
    this.applySelected();
    this.render();
  }

  static earn(amount) {
    this.credits += amount;
    localStorage.setItem('dtts_credits', String(this.credits));
    this.render();
  }

  static resetProgress() {
    this.credits = 0;
    this.owned = ['cyan'];
    this.selected = 'cyan';
    this.powerupInventory = {};
    localStorage.removeItem('dtts_credits');
    localStorage.removeItem('dtts_owned_skins');
    localStorage.removeItem('dtts_selected_skin');
    localStorage.removeItem('dtts_powerups');
    this.applySelected();
    this.render();
  }

  static loadPowerups() {
    try {
      const saved = JSON.parse(localStorage.getItem('dtts_powerups') || '{}');
      return Object.fromEntries(POWERUPS.map(powerup => [powerup.id, Math.max(0, Number(saved[powerup.id]) || 0)]));
    } catch (error) {
      return {};
    }
  }

  static loadOwnedSkins() {
    try {
      const saved = JSON.parse(localStorage.getItem('dtts_owned_skins') || '["cyan"]');
      if (!Array.isArray(saved)) return ['cyan'];
      const validIds = new Set(SHOP_ITEMS.map(item => item.id));
      return [...new Set(['cyan', ...saved.filter(id => validIds.has(id))])];
    } catch (error) {
      return ['cyan'];
    }
  }

  static buyPowerup(id) {
    const powerup = POWERUPS.find(entry => entry.id === id);
    if (!powerup) return false;
    if (this.credits < powerup.price) return false;
    this.credits -= powerup.price;
    this.powerupInventory[id] = (this.powerupInventory[id] || 0) + 1;
    localStorage.setItem('dtts_credits', String(this.credits));
    localStorage.setItem('dtts_powerups', JSON.stringify(this.powerupInventory));
    this.render();
    this.showNotice(`${powerup.name} purchased. Ready for your next run.`, 'success');
    return true;
  }

  static activateForRun() {
    const active = {};
    for (const powerup of POWERUPS) {
      if ((this.powerupInventory[powerup.id] || 0) < 1) continue;
      this.powerupInventory[powerup.id] -= 1;
      active[powerup.id] = powerup.id === 'shield' ? true : powerup.id === 'coinMagnet' ? 25 : 20;
    }
    localStorage.setItem('dtts_powerups', JSON.stringify(this.powerupInventory));
    this.render();
    return active;
  }

  static buyOrSelect(id) {
    const item = SHOP_ITEMS.find(entry => entry.id === id);
    if (!item) return 'unavailable';
    let result;
    if (this.owned.includes(id)) {
      this.selected = id;
      result = 'equipped';
    } else if (this.credits >= item.price) {
      this.credits -= item.price;
      this.owned.push(id);
      this.selected = id;
      localStorage.setItem('dtts_credits', String(this.credits));
      localStorage.setItem('dtts_owned_skins', JSON.stringify(this.owned));
      result = 'purchased';
    } else {
      return 'insufficient';
    }
    localStorage.setItem('dtts_selected_skin', this.selected);
    this.applySelected();
    this.render();
    return result;
  }

  static applySelected() {
    const item = SHOP_ITEMS.find(entry => entry.id === this.selected) || SHOP_ITEMS[0];
    this.player.setSkin(item.color);
  }

  static render() {
    const balance = document.getElementById('credits-val');
    const skinContainer = document.getElementById('shop-skins');
    const powerupContainer = document.getElementById('shop-powerups');
    if (!balance || !skinContainer || !powerupContainer) return;
    balance.textContent = this.credits;
    const hudCoins = document.getElementById('coins-val');
    if (hudCoins) hudCoins.textContent = this.credits;
    skinContainer.innerHTML = SHOP_ITEMS.map(item => {
      const owned = this.owned.includes(item.id);
      const selected = this.selected === item.id;
      const label = selected ? 'EQUIPPED' : owned ? 'EQUIP' : `${item.price} COINS`;
      const disabled = selected;
      return `<article class="shop-item">
        <div class="skin-preview" style="background:${item.color};color:${item.color}"></div>
        <h2>${item.name}</h2>
        <p>${owned ? 'Ball style' : `Unlock for ${item.price} coins`}</p>
        <button class="btn" data-shop-item="${item.id}" ${disabled ? 'disabled' : ''}>${label}</button>
      </article>`;
    }).join('');
    skinContainer.querySelectorAll('[data-shop-item]').forEach(button => {
      button.addEventListener('click', () => {
        const result = this.buyOrSelect(button.dataset.shopItem);
        if (result === 'insufficient') {
          const item = SHOP_ITEMS.find(entry => entry.id === button.dataset.shopItem);
          this.showNotice(`Not enough coins. ${item.price} needed; you have ${this.credits}.`, 'error');
        }
        else if (result === 'purchased') this.showNotice('Skin purchased and equipped.', 'success');
        else if (result === 'equipped') this.showNotice('Skin equipped.', 'success');
      });
    });

    powerupContainer.innerHTML = POWERUPS.map(powerup => {
      const stock = this.powerupInventory[powerup.id] || 0;
      return `<article class="shop-item">
        <div class="powerup-icon" style="color:${powerup.color}">${powerup.icon}</div>
        <h2>${powerup.name}</h2>
        <p>${powerup.description}</p>
        <p class="powerup-stock">OWNED: ${stock} · ${powerup.price} COINS EACH</p>
        <button class="btn" data-powerup="${powerup.id}">BUY · ${powerup.price} COINS</button>
      </article>`;
    }).join('');
    powerupContainer.querySelectorAll('[data-powerup]').forEach(button => {
      button.addEventListener('click', () => {
        const bought = this.buyPowerup(button.dataset.powerup);
        if (!bought) {
          const powerup = POWERUPS.find(entry => entry.id === button.dataset.powerup);
          this.showNotice(`Not enough coins. ${powerup.price} needed; you have ${this.credits}.`, 'error');
        }
      });
    });
  }

  static showNotice(message, type = 'info') {
    const notice = document.getElementById('shop-notice');
    if (!notice) return;
    notice.textContent = message;
    notice.classList.remove('success', 'error');
    if (type === 'success' || type === 'error') notice.classList.add(type);
    notice.classList.add('visible');
    window.clearTimeout(this.noticeTimer);
    this.noticeTimer = window.setTimeout(() => {
      notice.classList.remove('visible');
    }, 3200);
  }
}
