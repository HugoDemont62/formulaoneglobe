// components/Globe/CircuitsSidebar.js - Version mobile optimisée
import { F1_CIRCUITS_2025 } from './CircuitMarkers.js';
import { InteractiveSidebar } from './InteractiveSidebar.js';

/**
 * Sidebar responsive avec menu déroulant pour mobile
 */
export default class CircuitsSidebar {
  constructor(onCircuitSelect) {
    this.onCircuitSelect = onCircuitSelect;
    this.selectedIndex = -1;
    this.isMobile = window.innerWidth <= 768;
    this.isMenuOpen = false;
    this.createResponsiveSidebar();
    this.setupResizeListener();
  }

  /**
   * Détecte le responsive et crée l'interface appropriée
   */
  createResponsiveSidebar() {
    if (this.isMobile) {
      this.createMobileMenu();
    } else {
      this.createDesktopSidebar();
    }
  }

  /**
   * Menu mobile compact
   */
  createMobileMenu() {
    // Conteneur principal mobile
    const container = document.createElement('div');
    container.id = 'f1-mobile-menu';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    // Header du menu (toujours visible)
    const header = this.createMobileHeader();
    container.appendChild(header);

    // Menu déroulant (masqué par défaut)
    const dropdown = this.createMobileDropdown();
    container.appendChild(dropdown);

    document.body.appendChild(container);
    console.log('📱 Menu mobile créé');
  }

  /**
   * Header du menu mobile
   */
  createMobileHeader() {
    const header = document.createElement('div');
    header.id = 'mobile-header';
    header.style.cssText = `
      background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 100%);
      backdrop-filter: blur(20px);
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 2px 15px rgba(0,0,0,0.3);
    `;

    header.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">🏎️</span>
        <div>
          <h3 style="color: #ff4444; margin: 0; font-size: 16px; font-weight: 600;">F1 2025</h3>
          <p style="color: #ccc; margin: 0; font-size: 12px;">${F1_CIRCUITS_2025.length} circuits</p>
        </div>
      </div>
      
      <button id="menu-toggle" style="
        background: rgba(255,68,68,0.2);
        border: 1px solid rgba(255,68,68,0.5);
        color: #ff4444;
        padding: 10px 15px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
        transition: all 0.3s ease;
      ">
        <span id="menu-icon">📋</span>
        <span id="menu-text">Circuits</span>
      </button>
    `;

    // Gestion du clic sur le bouton menu
    const toggleButton = header.querySelector('#menu-toggle');
    toggleButton.addEventListener('click', () => this.toggleMobileMenu());

    // Amélioration tactile
    toggleButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      toggleButton.style.transform = 'scale(0.95)';
    });

    toggleButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      toggleButton.style.transform = 'scale(1)';
      this.toggleMobileMenu();
    });

    return header;
  }

  /**
   * Menu déroulant mobile
   */
  createMobileDropdown() {
    const dropdown = document.createElement('div');
    dropdown.id = 'mobile-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(5,10,20,0.95) 100%);
      backdrop-filter: blur(20px);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 25px rgba(0,0,0,0.4);
    `;

    // Liste des circuits
    const circuitsList = document.createElement('div');
    circuitsList.style.cssText = `
      padding: 10px;
      max-height: 60vh;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,68,68,0.3) transparent;
    `;

    // Ajout des circuits en format mobile compact
    F1_CIRCUITS_2025.forEach((circuit, index) => {
      const item = this.createMobileCircuitItem(circuit, index);
      circuitsList.appendChild(item);
    });

    dropdown.appendChild(circuitsList);
    return dropdown;
  }

  /**
   * Item de circuit pour mobile
   */
  createMobileCircuitItem(circuit, index) {
    const item = document.createElement('div');
    item.className = 'mobile-circuit-item';
    item.dataset.index = index;

    item.style.cssText = `
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const flagEmoji = this.getFlagEmoji(circuit.country);

    item.innerHTML = `
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 16px;">${flagEmoji}</span>
          <span style="color: #ff4444; font-size: 10px; font-weight: 600; text-transform: uppercase;">
            GP ${index + 1}
          </span>
        </div>
        <h4 style="color: white; margin: 0; font-size: 14px; font-weight: 600; line-height: 1.2;">
          ${circuit.name}
        </h4>
        <p style="color: #aaa; margin: 2px 0 0 0; font-size: 11px;">
          📍 ${circuit.location} • 📅 ${circuit.date}
        </p>
      </div>
      
      <div style="
        background: rgba(255,68,68,0.15);
        border: 1px solid rgba(255,68,68,0.3);
        border-radius: 20px;
        padding: 6px 10px;
        margin-left: 10px;
      ">
        <span style="color: #ff6666; font-size: 10px; font-weight: 600;">VOIR</span>
      </div>
    `;

    // Événements tactiles optimisés
    this.addMobileTouchEvents(item, circuit, index);

    return item;
  }

  /**
   * Événements tactiles optimisés pour mobile
   */
  addMobileTouchEvents(item, circuit, index) {
    let touchStartTime = 0;
    let touchMoved = false;

    // Touch start
    item.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchMoved = false;
      item.style.transform = 'scale(0.98)';
      item.style.background = 'linear-gradient(135deg, rgba(255,68,68,0.15) 0%, rgba(255,68,68,0.08) 100%)';
    }, { passive: true });

    // Touch move (pour détecter le scroll)
    item.addEventListener('touchmove', () => {
      touchMoved = true;
      item.style.transform = 'scale(1)';
      item.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)';
    }, { passive: true });

    // Touch end
    item.addEventListener('touchend', (e) => {
      e.preventDefault();

      const touchDuration = Date.now() - touchStartTime;

      // Si c'est un tap court et sans mouvement
      if (touchDuration < 300 && !touchMoved) {
        this.selectCircuit(index);
        this.closeMobileMenu();

        if (this.onCircuitSelect) {
          this.onCircuitSelect(circuit, index);
        }
      }

      // Reset visual
      item.style.transform = 'scale(1)';
      setTimeout(() => {
        if (index !== this.selectedIndex) {
          item.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)';
        }
      }, 150);
    });

    // Click pour desktop/souris
    item.addEventListener('click', (e) => {
      e.preventDefault();
      this.selectCircuit(index);
      this.closeMobileMenu();

      if (this.onCircuitSelect) {
        this.onCircuitSelect(circuit, index);
      }
    });
  }

  /**
   * Toggle du menu mobile
   */
  toggleMobileMenu() {
    const dropdown = document.getElementById('mobile-dropdown');
    const icon = document.getElementById('menu-icon');
    const text = document.getElementById('menu-text');

    if (!this.isMenuOpen) {
      // Ouvrir le menu
      dropdown.style.maxHeight = '60vh';
      icon.textContent = '❌';
      text.textContent = 'Fermer';
      this.isMenuOpen = true;
    } else {
      // Fermer le menu
      this.closeMobileMenu();
    }
  }

  /**
   * Ferme le menu mobile
   */
  closeMobileMenu() {
    const dropdown = document.getElementById('mobile-dropdown');
    const icon = document.getElementById('menu-icon');
    const text = document.getElementById('menu-text');

    if (dropdown) {
      dropdown.style.maxHeight = '0';
      icon.textContent = '📋';
      text.textContent = 'Circuits';
      this.isMenuOpen = false;
    }
  }

  /**
   * Sidebar desktop classique
   */
  createDesktopSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'f1-circuits-sidebar';
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 420px;
      height: 100vh;
      background: linear-gradient(180deg, rgba(10, 15, 25, 0.95) 0%, rgba(5, 10, 20, 0.98) 100%);
      backdrop-filter: blur(15px);
      overflow-y: auto;
      z-index: 1000;
      padding: 0;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    const header = this.createDesktopHeader();
    sidebar.appendChild(header);

    const circuitsContainer = document.createElement('div');
    circuitsContainer.style.padding = '0 15px 20px 15px';

    F1_CIRCUITS_2025.forEach((circuit, index) => {
      const card = this.createDesktopCircuitCard(circuit, index);
      circuitsContainer.appendChild(card);
    });

    sidebar.appendChild(circuitsContainer);
    this.addScrollStyles();
    document.body.appendChild(sidebar);

    this.buttons = sidebar.querySelectorAll('.desktop-circuit-card');
    console.log('🖥️ Sidebar desktop créée');
  }

  /**
   * Header desktop
   */
  createDesktopHeader() {
    const header = document.createElement('div');
    header.style.cssText = `
      position: sticky;
      top: 0;
      background: linear-gradient(180deg, rgba(15, 20, 30, 0.98) 0%, rgba(10, 15, 25, 0.95) 100%);
      backdrop-filter: blur(20px);
      padding: 25px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 10;
    `;

    header.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">
          🏎️ Circuits F1 2025
        </h2>
        <div style="background: rgba(255, 0, 0, 0.1); padding: 5px 10px; border-radius: 20px; border: 1px solid rgba(255, 0, 0, 0.3);">
          <span style="color: #ff4444; font-size: 12px; font-weight: 600;">${F1_CIRCUITS_2025.length} GP</span>
        </div>
      </div>
      <p style="color: #cccccc; margin: 0; font-size: 14px; line-height: 1.4;">
        Cliquez sur un circuit pour l'explorer sur le globe
      </p>
    `;

    return header;
  }

  /**
   * Carte circuit desktop
   */
  createDesktopCircuitCard(circuit, index) {
    const card = document.createElement('div');
    card.className = 'desktop-circuit-card';
    card.dataset.index = index;

    card.style.cssText = `
      margin-bottom: 16px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
    `;

    const flagEmoji = this.getFlagEmoji(circuit.country);

    card.innerHTML = `
      <div style="
        position: relative;
        width: 100%;
        height: 140px;
        background: linear-gradient(135deg, ${this.getCircuitGradient(circuit.country)});
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 20px 15px 15px 15px;
          color: white;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
            <span style="font-size: 16px;">${flagEmoji}</span>
            <span style="color: #ff4444; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              ${circuit.country}
            </span>
          </div>
          <h3 style="color: white; margin: 0; font-size: 15px; font-weight: 600; line-height: 1.3;">
            ${circuit.name}
          </h3>
        </div>
      </div>
      
      <div style="padding: 15px; background: rgba(0, 0, 0, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #888; font-size: 12px;">📍</span>
            <span style="color: #ccc; font-size: 12px;">${circuit.location}</span>
          </div>
          <div style="background: rgba(255, 0, 0, 0.1); padding: 3px 8px; border-radius: 12px;">
            <span style="color: #ff6666; font-size: 10px; font-weight: 600;">GP ${index + 1}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: #888; font-size: 12px;">📅</span>
          <span style="color: #aaa; font-size: 12px; font-weight: 500;">${circuit.date}</span>
        </div>
      </div>
    `;

    this.addDesktopCardEvents(card, circuit, index);
    return card;
  }

  /**
   * Événements desktop
   */
  addDesktopCardEvents(card, circuit, index) {
    card.addEventListener('mouseenter', () => {
      if (index !== this.selectedIndex) {
        card.style.transform = 'translateY(-2px)';
        card.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        card.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (index !== this.selectedIndex) {
        card.style.transform = 'translateY(0)';
        card.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        card.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)';
      }
    });

    card.addEventListener('click', () => {
      this.selectCircuit(index);
      if (this.onCircuitSelect) {
        this.onCircuitSelect(circuit, index);
      }
    });
  }

  /**
   * Sélection d'un circuit
   */
  selectCircuit(index) {
    if (this.isMobile) {
      // Mobile: mettre à jour visuellement les items
      const items = document.querySelectorAll('.mobile-circuit-item');
      items.forEach((item, i) => {
        if (i === index) {
          item.style.background = 'linear-gradient(135deg, rgba(255,68,68,0.2) 0%, rgba(255,68,68,0.1) 100%)';
          item.style.borderColor = '#ff4444';
        } else {
          item.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)';
          item.style.borderColor = 'rgba(255,255,255,0.1)';
        }
      });
    } else {
      // Desktop: logique existante
      const previousCard = document.querySelector('.desktop-circuit-card.selected');
      if (previousCard) {
        previousCard.classList.remove('selected');
        this.resetDesktopCardStyle(previousCard);
      }

      const newCard = document.querySelector(`.desktop-circuit-card[data-index="${index}"]`);
      if (newCard) {
        newCard.classList.add('selected');
        newCard.style.transform = 'translateY(-3px)';
        newCard.style.borderColor = '#ff4444';
        newCard.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(255, 68, 68, 0.05) 100%)';
        newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    this.selectedIndex = index;
  }

  /**
   * Reset style desktop
   */
  resetDesktopCardStyle(card) {
    card.style.transform = 'translateY(0)';
    card.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    card.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)';
  }

  /**
   * Écoute le redimensionnement pour basculer mobile/desktop
   */
  setupResizeListener() {
    let resizeTimeout;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newIsMobile = window.innerWidth <= 768;

        if (newIsMobile !== this.isMobile) {
          console.log(`📱 Basculement vers ${newIsMobile ? 'mobile' : 'desktop'}`);
          this.destroy();
          this.isMobile = newIsMobile;
          this.createResponsiveSidebar();
        }
      }, 100);
    });
  }

  /**
   * Utilitaires
   */
  getFlagEmoji(country) {
    const flags = {
      'Bahrain': '🇧🇭', 'Arabie Saoudite': '🇸🇦', 'Australie': '🇦🇺',
      'Japon': '🇯🇵', 'Chine': '🇨🇳', 'États-Unis': '🇺🇸',
      'Italie': '🇮🇹', 'Monaco': '🇲🇨', 'Canada': '🇨🇦',
      'Espagne': '🇪🇸', 'Autriche': '🇦🇹', 'Royaume-Uni': '🇬🇧',
      'Hongrie': '🇭🇺', 'Belgique': '🇧🇪', 'Azerbaïdjan': '🇦🇿',
      'Singapour': '🇸🇬', 'Mexique': '🇲🇽', 'Brésil': '🇧🇷',
      'Qatar': '🇶🇦', 'Émirats Arabes Unis': '🇦🇪'
    };
    return flags[country] || '🏁';
  }

  getCircuitGradient(country) {
    const gradients = {
      'Bahrain': '#ff6b35, #f7941e', 'Arabie Saoudite': '#006c35, #ffffff',
      'Australie': '#002d67, #ffffff', 'Japon': '#bc002d, #ffffff',
      'Chine': '#de2910, #ffde00', 'États-Unis': '#002868, #bf0a30',
      'Italie': '#009246, #ce2b37', 'Monaco': '#ce1126, #ffffff',
      'Canada': '#ff0000, #ffffff', 'Espagne': '#aa151b, #f1bf00',
      'Autriche': '#ed2939, #ffffff', 'Royaume-Uni': '#012169, #ffffff',
      'Hongrie': '#477050, #ffffff', 'Belgique': '#000000, #fed100',
      'Azerbaïdjan': '#3f9fbb, #ed2939', 'Singapour': '#ffffff, #ee2436',
      'Mexique': '#006847, #ce1126', 'Brésil': '#009639, #fedf00',
      'Qatar': '#8b1538, #ffffff', 'Émirats Arabes Unis': '#000000, #ff0000'
    };
    return gradients[country] || '#1a1a2e, #16213e';
  }

  addScrollStyles() {
    if (document.getElementById('sidebar-scroll-styles')) return;

    const style = document.createElement('style');
    style.id = 'sidebar-scroll-styles';
    style.textContent = `
      #f1-circuits-sidebar::-webkit-scrollbar { width: 4px; }
      #f1-circuits-sidebar::-webkit-scrollbar-track { background: transparent; }
      #f1-circuits-sidebar::-webkit-scrollbar-thumb { background: rgba(255, 68, 68, 0.3); border-radius: 2px; }
      #f1-circuits-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255, 68, 68, 0.5); }
      #f1-circuits-sidebar { scrollbar-width: thin; scrollbar-color: rgba(255, 68, 68, 0.3) transparent; }
      
      #mobile-dropdown::-webkit-scrollbar { width: 3px; }
      #mobile-dropdown::-webkit-scrollbar-track { background: transparent; }
      #mobile-dropdown::-webkit-scrollbar-thumb { background: rgba(255, 68, 68, 0.4); border-radius: 2px; }
    `;
    document.head.appendChild(style);
  }

  getSelectedCircuit() {
    return this.selectedIndex >= 0 ? F1_CIRCUITS_2025[this.selectedIndex] : null;
  }

  destroy() {
    const elements = ['f1-circuits-sidebar', 'f1-mobile-menu', 'sidebar-scroll-styles'];
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });

    this.isMenuOpen = false;
  }
}