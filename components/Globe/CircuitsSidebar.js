// components/Globe/CircuitsSidebar.js - Sidebar des circuits F1
import { F1_CIRCUITS_2025 } from './CircuitMarkers.js';

/**
 * Classe pour gérer la sidebar des circuits F1 (comme dans ton image de référence)
 * Affiche la liste des circuits avec images et informations
 */
export default class CircuitsSidebar {
  constructor(onCircuitSelect) {
    this.onCircuitSelect = onCircuitSelect; // Callback quand un circuit est sélectionné
    this.selectedIndex = -1;
    this.createSidebar();
  }

  /**
   * Crée la sidebar principale
   */
  createSidebar() {
    // Création du conteneur principal
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
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    `;

    // Header de la sidebar
    const header = this.createHeader();
    sidebar.appendChild(header);

    // Conteneur des circuits
    const circuitsContainer = document.createElement('div');
    circuitsContainer.id = 'circuits-container';
    circuitsContainer.style.cssText = `
      padding: 0 15px 20px 15px;
    `;

    // Ajout de tous les circuits
    F1_CIRCUITS_2025.forEach((circuit, index) => {
      const circuitCard = this.createCircuitCard(circuit, index);
      circuitsContainer.appendChild(circuitCard);
    });

    sidebar.appendChild(circuitsContainer);

    // Ajout du style de scroll personnalisé
    this.addScrollStyles();

    document.body.appendChild(sidebar);
    console.log(`🏁 Sidebar créée avec ${F1_CIRCUITS_2025.length} circuits`);
  }

  /**
   * Crée le header de la sidebar
   */
  createHeader() {
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
        Cliquez sur un circuit pour l'explorer sur le globe interactif
      </p>
    `;

    return header;
  }

  /**
   * Crée une carte pour un circuit
   */
  createCircuitCard(circuit, index) {
    const card = document.createElement('div');
    card.className = 'f1-circuit-card';
    card.dataset.index = index;

    card.style.cssText = `
      margin-bottom: 16px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
      position: relative;
    `;

    // Image du circuit (placeholder avec dégradé)
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 140px;
      background: linear-gradient(135deg, 
        ${this.getCircuitGradient(circuit.country)});
      overflow: hidden;
    `;

    // Overlay avec informations
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      padding: 20px 15px 15px 15px;
      color: white;
    `;

    // Flag emoji basé sur le pays
    const flagEmoji = this.getFlagEmoji(circuit.country);

    overlay.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
        <span style="font-size: 16px;">${flagEmoji}</span>
        <span style="color: #ff4444; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          ${circuit.country}
        </span>
      </div>
      <h3 style="color: white; margin: 0; font-size: 15px; font-weight: 600; line-height: 1.3;">
        ${circuit.name}
      </h3>
    `;

    imageContainer.appendChild(overlay);

    // Informations détaillées
    const infoContainer = document.createElement('div');
    infoContainer.style.cssText = `
      padding: 15px;
      background: rgba(0, 0, 0, 0.1);
    `;

    infoContainer.innerHTML = `
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
    `;

    card.appendChild(imageContainer);
    card.appendChild(infoContainer);

    // Événements
    this.addCardEvents(card, circuit, index);

    return card;
  }

  /**
   * Ajoute les événements à une carte de circuit
   */
  addCardEvents(card, circuit, index) {
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
   * Sélectionne un circuit visuellement
   */
  selectCircuit(index) {
    // Retirer l'ancienne sélection
    const previousCard = document.querySelector('.f1-circuit-card.selected');
    if (previousCard) {
      previousCard.classList.remove('selected');
      this.resetCardStyle(previousCard);
    }

    // Nouvelle sélection
    const newCard = document.querySelector(`.f1-circuit-card[data-index="${index}"]`);
    if (newCard) {
      newCard.classList.add('selected');
      newCard.style.transform = 'translateY(-3px)';
      newCard.style.borderColor = '#ff4444';
      newCard.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(255, 68, 68, 0.05) 100%)';

      // Scroll vers la carte si nécessaire
      newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    this.selectedIndex = index;
  }

  /**
   * Remet le style par défaut d'une carte
   */
  resetCardStyle(card) {
    card.style.transform = 'translateY(0)';
    card.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    card.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)';
  }

  /**
   * Retourne un dégradé de couleur basé sur le pays
   */
  getCircuitGradient(country) {
    const gradients = {
      'Bahrain': '#ff6b35, #f7941e',
      'Arabie Saoudite': '#006c35, #ffffff',
      'Australie': '#002d67, #ffffff',
      'Japon': '#bc002d, #ffffff',
      'Chine': '#de2910, #ffde00',
      'États-Unis': '#002868, #bf0a30',
      'Italie': '#009246, #ce2b37',
      'Monaco': '#ce1126, #ffffff',
      'Canada': '#ff0000, #ffffff',
      'Espagne': '#aa151b, #f1bf00',
      'Autriche': '#ed2939, #ffffff',
      'Royaume-Uni': '#012169, #ffffff',
      'Hongrie': '#477050, #ffffff',
      'Belgique': '#000000, #fed100',
      'Azerbaïdjan': '#3f9fbb, #ed2939',
      'Singapour': '#ffffff, #ee2436',
      'Mexique': '#006847, #ce1126',
      'Brésil': '#009639, #fedf00',
      'Qatar': '#8b1538, #ffffff',
      'Émirats Arabes Unis': '#000000, #ff0000'
    };

    return gradients[country] || '#1a1a2e, #16213e';
  }

  /**
   * Retourne l'emoji du drapeau basé sur le pays
   */
  getFlagEmoji(country) {
    const flags = {
      'Bahrain': '🇧🇭',
      'Arabie Saoudite': '🇸🇦',
      'Australie': '🇦🇺',
      'Japon': '🇯🇵',
      'Chine': '🇨🇳',
      'États-Unis': '🇺🇸',
      'Italie': '🇮🇹',
      'Monaco': '🇲🇨',
      'Canada': '🇨🇦',
      'Espagne': '🇪🇸',
      'Autriche': '🇦🇹',
      'Royaume-Uni': '🇬🇧',
      'Hongrie': '🇭🇺',
      'Belgique': '🇧🇪',
      'Azerbaïdjan': '🇦🇿',
      'Singapour': '🇸🇬',
      'Mexique': '🇲🇽',
      'Brésil': '🇧🇷',
      'Qatar': '🇶🇦',
      'Émirats Arabes Unis': '🇦🇪'
    };

    return flags[country] || '🏁';
  }

  /**
   * Ajoute les styles de scroll personnalisés
   */
  addScrollStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #f1-circuits-sidebar {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 68, 68, 0.3) transparent;
      }

      #f1-circuits-sidebar::-webkit-scrollbar {
        width: 4px;
      }

      #f1-circuits-sidebar::-webkit-scrollbar-track {
        background: transparent;
      }

      #f1-circuits-sidebar::-webkit-scrollbar-thumb {
        background: rgba(255, 68, 68, 0.3);
        border-radius: 2px;
      }

      #f1-circuits-sidebar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 68, 68, 0.5);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Retourne le circuit sélectionné
   */
  getSelectedCircuit() {
    return this.selectedIndex >= 0 ? F1_CIRCUITS_2025[this.selectedIndex] : null;
  }

  /**
   * Nettoyage lors de la destruction
   */
  destroy() {
    const sidebar = document.getElementById('f1-circuits-sidebar');
    if (sidebar) {
      sidebar.remove();
    }
  }
}