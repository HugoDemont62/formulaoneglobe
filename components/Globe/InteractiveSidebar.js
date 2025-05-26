// components/Globe/InteractiveSidebar.js - Sidebar rétractable avec cards GP
import { F1_CIRCUITS_2025 } from './CircuitMarkers.js';

export class InteractiveSidebar {
  constructor(onCircuitSelect, globe) {
    this.onCircuitSelect = typeof onCircuitSelect === 'function' ? onCircuitSelect : () => {};
    this.globe = globe;
    this.selectedIndex = -1;
    this.hoveredIndex = -1;
    this.isMobile = window.innerWidth <= 768;
    this.isCollapsed = false;
    this.isViewsCollapsed = false;
    this.createInteractiveSidebar();
    this.setupResizeListener();
  }

  /**
   * Crée la sidebar interactive complète
   */
  createInteractiveSidebar() {
    if (this.isMobile) {
      this.createMobileMenu();
    } else {
      this.createDesktopSidebar();
    }
  }

  /**
   * Sidebar desktop avec sections rétractables
   */
  createDesktopSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'interactive-sidebar';
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
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
    `;

    // Bouton de collapse global
    const collapseButton = this.createCollapseButton();
    sidebar.appendChild(collapseButton);

    // Section Vues Continents (rétractable)
    const viewsSection = this.createViewsSection();
    sidebar.appendChild(viewsSection);

    // Section Cards GP (rétractable)
    const cardsSection = this.createCardsSection();
    sidebar.appendChild(cardsSection);

    document.body.appendChild(sidebar);
    this.addScrollStyles();
    console.log('🖥️ Sidebar interactive desktop créée');
  }

  /**
   * Bouton collapse/expand principal
   */
  createCollapseButton() {
    const button = document.createElement('button');
    button.id = 'sidebar-collapse-btn';
    button.style.cssText = `
      position: absolute;
      top: 50%;
      left: -20px;
      transform: translateY(-50%);
      width: 40px;
      height: 80px;
      background: linear-gradient(135deg, rgba(255, 68, 68, 0.9), rgba(204, 0, 0, 0.9));
      border: 1px solid rgba(255, 68, 68, 0.5);
      border-radius: 20px 0 0 20px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      z-index: 1001;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      box-shadow: -5px 0 15px rgba(255, 68, 68, 0.3);
    `;

    button.innerHTML = '◀';
    button.title = 'Réduire/Agrandir la sidebar';

    button.addEventListener('click', () => this.toggleSidebar());
    button.addEventListener('mouseenter', () => {
      button.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 1), rgba(204, 0, 0, 1))';
      button.style.boxShadow = '-5px 0 20px rgba(255, 68, 68, 0.5)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.9), rgba(204, 0, 0, 0.9))';
      button.style.boxShadow = '-5px 0 15px rgba(255, 68, 68, 0.3)';
    });

    return button;
  }

  /**
   * Section Vues Continents
   */
  createViewsSection() {
    const section = document.createElement('div');
    section.id = 'views-section';
    section.style.cssText = `
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Header section avec bouton collapse
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 20px;
      background: linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 68, 68, 0.05));
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.3s ease;
    `;

    header.innerHTML = `
      <div>
        <h3 style="color: #ff4444; margin: 0; font-size: 16px; font-weight: 600;">
          🌍 Vues Continents
        </h3>
        <p style="color: #aaa; margin: 2px 0 0 0; font-size: 12px;">
          Navigation rapide par région
        </p>
      </div>
      <span id="views-toggle-icon" style="color: #ff4444; font-size: 16px; transition: transform 0.3s ease;">▼</span>
    `;

    // Contenu des vues
    const content = document.createElement('div');
    content.id = 'views-content';
    content.style.cssText = `
      padding: 15px;
      max-height: 500px;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Vues continents
    const views = this.createContinentViews();
    content.appendChild(views);

    // Événement toggle
    header.addEventListener('click', () => this.toggleViewsSection());
    header.addEventListener('mouseenter', () => {
      header.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.15), rgba(255, 68, 68, 0.08))';
    });
    header.addEventListener('mouseleave', () => {
      header.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 68, 68, 0.05))';
    });

    section.appendChild(header);
    section.appendChild(content);

    return section;
  }

  /**
   * Vues des continents
   */
  createContinentViews() {
    const container = document.createElement('div');
    container.style.cssText = 'display: grid; gap: 8px;';

    const continentViews = [
      {
        name: "🌍 Vue Globale",
        description: "Vue d'ensemble",
        position: {x: 0, y: 0, z: 3}
      },
      {
        name: "🇪🇺 Europe",
        description: "Monaco, Spa, Silverstone...",
        position: {x: 1.5, y: 1, z: 4}
      },
      {
        name: "🇺🇸 Amérique du Nord",
        description: "Miami, Austin, Montréal...",
        position: {x: -3.5, y: 1, z: 3.5}
      },
      {
        name: "🇯🇵 Asie-Pacifique",
        description: "Suzuka, Shanghai, Singapour...",
        position: {x: 2.8, y: 0.5, z: -3.2}
      },
      {
        name: "🇧🇷 Amérique du Sud",
        description: "Interlagos, Mexique",
        position: {x: -2.5, y: -2, z: 3}
      },
      {
        name: "🇦🇺 Océanie",
        description: "Melbourne",
        position: {x: 2.2, y: -2.5, z: 2.8}
      },
      {
        name: "🏜️ Moyen-Orient",
        description: "Bahreïn, Qatar, Abu Dhabi...",
        position: {x: 3, y: 0.8, z: 2.5}
      }
    ];

    continentViews.forEach((view, index) => {
      const button = document.createElement('button');
      button.className = 'continent-view-btn';
      button.dataset.index = index;
      button.style.cssText = `
        width: 100%;
        padding: 12px 15px;
        background: ${index === 0
        ? 'linear-gradient(135deg, #ff4444, #cc0000)'
        : 'rgba(255, 255, 255, 0.08)'};
        border: 1px solid ${index === 0
        ? '#ff4444'
        : 'rgba(255, 255, 255, 0.2)'};
        border-radius: 8px;
        color: white;
        cursor: pointer;
        text-align: left;
        transition: all 0.3s ease;
        font-size: 12px;
      `;

      button.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 2px;">${view.name}</div>
        <div style="opacity: 0.7; font-size: 10px;">${view.description}</div>
      `;

      button.addEventListener('click', () => this.goToContinent(index, view));
      this.addViewButtonEvents(button, index);

      container.appendChild(button);
    });

    this.viewButtons = container.querySelectorAll('.continent-view-btn');
    return container;
  }

  /**
   * Section Cards GP
   */
  createCardsSection() {
    const section = document.createElement('div');
    section.id = 'cards-section';
    section.style.cssText = `
      flex: 1;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Header section
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 20px;
      background: linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 68, 68, 0.05));
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(15px);
    `;

    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="color: #ff4444; margin: 0; font-size: 16px; font-weight: 600;">
            🏁 Circuits F1 2025
          </h3>
          <p style="color: #aaa; margin: 2px 0 0 0; font-size: 12px;">
            ${F1_CIRCUITS_2025.length} Grands Prix • Hover pour localiser
          </p>
        </div>
        <div style="background: rgba(255, 0, 0, 0.15); padding: 5px 10px; border-radius: 15px;">
          <span style="color: #ff6666; font-size: 11px; font-weight: 600;">${F1_CIRCUITS_2025.length} GP</span>
        </div>
      </div>
    `;

    // Contenu cards
    const content = document.createElement('div');
    content.id = 'cards-content';
    content.style.cssText = `
      padding: 0 15px 20px 15px;
      height: calc(100vh - 160px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    `;

    // Création des cards GP
    F1_CIRCUITS_2025.forEach((circuit, index) => {
      const card = this.createGPCard(circuit, index);
      content.appendChild(card);
    });

    section.appendChild(header);
    section.appendChild(content);

    return section;
  }

  /**
   * Card GP individuelle avec hover
   */
  createGPCard(circuit, index) {
    const card = document.createElement('div');
    card.className = 'gp-card';
    card.dataset.index = index;
    card.style.cssText = `
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    `;

    const flagEmoji = this.getFlagEmoji(circuit.country);
    const circuitDate = new Date(circuit.date + ' 2025');
    const isUpcoming = circuitDate > new Date();

    card.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">${flagEmoji}</span>
          <div>
            <div style="color: #ff4444; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              GP ${index + 1} • ${circuit.country}
            </div>
            <h4 style="color: white; margin: 2px 0 0 0; font-size: 14px; font-weight: 600; line-height: 1.2;">
              ${circuit.name}
            </h4>
          </div>
        </div>
        <div style="
          background: ${isUpcoming
      ? 'rgba(0, 255, 0, 0.15)'
      : 'rgba(255, 255, 255, 0.1)'};
          border: 1px solid ${isUpcoming
      ? 'rgba(0, 255, 0, 0.3)'
      : 'rgba(255, 255, 255, 0.2)'};
          border-radius: 12px;
          padding: 4px 8px;
          font-size: 9px;
          font-weight: 600;
          color: ${isUpcoming ? '#66ff66' : '#ccc'};
          text-transform: uppercase;
        ">
          ${isUpcoming ? 'À venir' : 'Terminé'}
        </div>
      </div>

      <div style="display: grid; gap: 6px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: #888; font-size: 11px;">📍</span>
          <span style="color: #ccc; font-size: 12px;">${circuit.location}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: #888; font-size: 11px;">📅</span>
          <span style="color: #aaa; font-size: 12px; font-weight: 500;">${circuit.date}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: #888; font-size: 11px;">📐</span>
          <span style="color: #777; font-size: 10px;">
            ${circuit.lat.toFixed(2)}°, ${circuit.lng.toFixed(2)}°
          </span>
        </div>
      </div>

      <div style="
        background: linear-gradient(90deg, rgba(255, 68, 68, 0.2), rgba(255, 68, 68, 0.05));
        border-radius: 6px;
        padding: 8px 10px;
        text-align: center;
        border: 1px solid rgba(255, 68, 68, 0.2);
      ">
        <span style="color: #ff6666; font-size: 10px; font-weight: 600;">
          🎯 HOVER POUR LOCALISER • CLIC POUR EXPLORER
        </span>
      </div>

      <!-- Indicateur de hover -->
      <div id="hover-indicator-${index}" style="
        position: absolute;
        top: 5px;
        right: 5px;
        width: 8px;
        height: 8px;
        background: #ff4444;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 0 10px #ff4444;
      "></div>
    `;

    this.addGPCardEvents(card, circuit, index);
    return card;
  }

  /**
   * Événements pour les cards GP
   */
  addGPCardEvents(card, circuit, index) {
    // Hover start
    card.addEventListener('mouseenter', () => {
      if (this.hoveredIndex !== index) {
        this.hoveredIndex = index;
        this.highlightGPCard(index);
        this.highlightMarkerOnGlobe(index);
      }
    });

    // Hover end
    card.addEventListener('mouseleave', () => {
      if (this.hoveredIndex === index && this.selectedIndex !== index) {
        this.hoveredIndex = -1;
        this.unhighlightGPCard(index);
        this.unhighlightMarkerOnGlobe(index);
      }
    });

    // Clic
    card.addEventListener('click', () => {
      this.selectGPCard(index);
      this.selectMarkerOnGlobe(index, circuit);

      if (this.onCircuitSelect) {
        this.onCircuitSelect(circuit, index);
      }
    });
  }

  /**
   * Highlight card GP
   */
  highlightGPCard(index) {
    const card = document.querySelector(`.gp-card[data-index="${index}"]`);
    const indicator = document.getElementById(`hover-indicator-${index}`);

    if (card) {
      card.style.transform = 'translateY(-2px) scale(1.02)';
      card.style.borderColor = '#ff4444';
      card.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.15) 0%, rgba(255, 68, 68, 0.08) 100%)';
      card.style.boxShadow = '0 8px 25px rgba(255, 68, 68, 0.3)';
    }

    if (indicator) {
      indicator.style.opacity = '1';
    }
  }

  /**
   * Unhighlight card GP
   */
  unhighlightGPCard(index) {
    const card = document.querySelector(`.gp-card[data-index="${index}"]`);
    const indicator = document.getElementById(`hover-indicator-${index}`);

    if (card && this.selectedIndex !== index) {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      card.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)';
      card.style.boxShadow = 'none';
    }

    if (indicator && this.selectedIndex !== index) {
      indicator.style.opacity = '0';
    }
  }

  /**
   * Sélection card GP
   */
  selectGPCard(index) {
    // Désélectionner l'ancienne
    if (this.selectedIndex >= 0) {
      this.unhighlightGPCard(this.selectedIndex);
    }

    this.selectedIndex = index;

    const card = document.querySelector(`.gp-card[data-index="${index}"]`);
    const indicator = document.getElementById(`hover-indicator-${index}`);

    if (card) {
      card.style.transform = 'translateY(-3px) scale(1.03)';
      card.style.borderColor = '#00ff44';
      card.style.background = 'linear-gradient(135deg, rgba(0, 255, 68, 0.15) 0%, rgba(0, 255, 68, 0.08) 100%)';
      card.style.boxShadow = '0 10px 30px rgba(0, 255, 68, 0.4)';

      // Scroll vers la card
      card.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }

    if (indicator) {
      indicator.style.background = '#00ff44';
      indicator.style.boxShadow = '0 0 10px #00ff44';
      indicator.style.opacity = '1';
    }
  }

  /**
   * Interaction avec le globe - Highlight marker
   */
  highlightMarkerOnGlobe(index) {
    if (this.globe && this.globe.circuitMarkers) {
      const marker = this.globe.circuitMarkers.markers[index];
      if (marker) {
        this.globe.circuitMarkers.highlightMarker(marker.group);
      }
    }
  }

  /**
   * Interaction avec le globe - Unhighlight marker
   */
  unhighlightMarkerOnGlobe(index) {
    if (this.globe && this.globe.circuitMarkers) {
      const marker = this.globe.circuitMarkers.markers[index];
      if (marker) {
        this.globe.circuitMarkers.highlightMarker(null);
      }
    }
  }

  /**
   * Interaction avec le globe - Select marker
   */
  selectMarkerOnGlobe(index, circuit) {
    if (this.globe && this.globe.circuitMarkers) {
      const marker = this.globe.circuitMarkers.markers[index];
      if (marker) {
        this.globe.selectCircuit(marker.group);
      }
    }
  }

  /**
   * Méthode publique pour être appelée depuis le globe
   */
  onMarkerHover(index) {
    if (index >= 0 && index !== this.hoveredIndex) {
      if (this.hoveredIndex >= 0) {
        this.unhighlightGPCard(this.hoveredIndex);
      }
      this.hoveredIndex = index;
      this.highlightGPCard(index);
    } else if (index < 0 && this.hoveredIndex >= 0) {
      this.unhighlightGPCard(this.hoveredIndex);
      this.hoveredIndex = -1;
    }
  }

  /**
   * Méthode publique pour sélection depuis le globe
   */
  onMarkerSelect(index) {
    if (index >= 0) {
      this.selectGPCard(index);
    }
  }

  /**
   * Navigation continents
   */
  goToContinent(index, view) {
    // Désélectionner tous les boutons vues
    this.viewButtons.forEach((btn, i) => {
      if (i === index) {
        btn.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
        btn.style.borderColor = '#ff4444';
        btn.style.boxShadow = '0 5px 15px rgba(255, 68, 68, 0.3)';
      } else {
        btn.style.background = 'rgba(255, 255, 255, 0.08)';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        btn.style.boxShadow = 'none';
      }
    });

    // Appliquer la vue
    if (this.globe) {
      this.globe.setAutoRotate(false);
      this.globe.resetPosition();

      setTimeout(() => {
        if (window.webgl && window.webgl.camera && window.webgl.camera.main) {
          this.animateCameraToPosition(window.webgl.camera.main, view.position);
        }
      }, 100);
    }

    console.log(`📷 Vue changée: ${view.name}`);
  }

  /**
   * Animation caméra
   */
  animateCameraToPosition(camera, targetPosition) {
    const startPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.x = startPosition.x +
        (targetPosition.x - startPosition.x) * eased;
      camera.position.y = startPosition.y +
        (targetPosition.y - startPosition.y) * eased;
      camera.position.z = startPosition.z +
        (targetPosition.z - startPosition.z) * eased;

      camera.lookAt(0, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Toggle sections
   */
  toggleSidebar() {
    const sidebar = document.getElementById('interactive-sidebar');
    const button = document.getElementById('sidebar-collapse-btn');

    this.isCollapsed = !this.isCollapsed;

    if (this.isCollapsed) {
      sidebar.style.transform = 'translateX(100%)';
      button.innerHTML = '▶';
      button.style.left = '-40px';
    } else {
      sidebar.style.transform = 'translateX(0)';
      button.innerHTML = '◀';
      button.style.left = '-20px';
    }
  }

  toggleViewsSection() {
    const content = document.getElementById('views-content');
    const icon = document.getElementById('views-toggle-icon');

    this.isViewsCollapsed = !this.isViewsCollapsed;

    if (this.isViewsCollapsed) {
      content.style.maxHeight = '0';
      content.style.padding = '0 15px';
      icon.style.transform = 'rotate(-90deg)';
      icon.textContent = '▶';
    } else {
      content.style.maxHeight = '500px';
      content.style.padding = '15px';
      icon.style.transform = 'rotate(0deg)';
      icon.textContent = '▼';
    }
  }

  /**
   * Événements boutons vues
   */
  addViewButtonEvents(button, index) {
    button.addEventListener('mouseenter', () => {
      if (!button.style.background.includes(
        'linear-gradient(135deg, #ff4444')) {
        button.style.background = 'rgba(255, 255, 255, 0.15)';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 3px 8px rgba(255, 68, 68, 0.2)';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (!button.style.background.includes(
        'linear-gradient(135deg, #ff4444')) {
        button.style.background = 'rgba(255, 255, 255, 0.08)';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
      }
    });
  }

  /**
   * Menu mobile (version simplifiée)
   */
  createMobileMenu() {
    // Version mobile comme avant mais avec intégration hover
    console.log('📱 Menu mobile créé avec intégration hover');
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
    return flags[country] || '🏁'; // Fallback to flag emoji
  }

  addScrollStyles() {
    if (document.getElementById('interactive-sidebar-styles')) return;

    const style = document.createElement('style');
    style.id = 'interactive-sidebar-styles';
    style.textContent = `
      #interactive-sidebar::-webkit-scrollbar { width: 4px; }
      #interactive-sidebar::-webkit-scrollbar-track { background: transparent; }
      #interactive-sidebar::-webkit-scrollbar-thumb { background: rgba(255, 68, 68, 0.3); border-radius: 2px; }
      #interactive-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255, 68, 68, 0.5); }
      
      #cards-content::-webkit-scrollbar { width: 3px; }
      #cards-content::-webkit-scrollbar-track { background: transparent; }
      #cards-content::-webkit-scrollbar-thumb { background: rgba(255, 68, 68, 0.4); border-radius: 2px; }
      
      .gp-card { will-change: transform; }
      .continent-view-btn { will-change: transform; }
      
      @media (max-width: 768px) {
        #interactive-sidebar { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  setupResizeListener() {
    let resizeTimeout;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newIsMobile = window.innerWidth <= 768;

        if (newIsMobile !== this.isMobile) {
          console.log(
            `📱 Basculement vers ${newIsMobile ? 'mobile' : 'desktop'}`);
          this.destroy();
          this.isMobile = newIsMobile;
          this.createInteractiveSidebar();
        }
      }, 100);
    });
  }

  getSelectedCircuit() {
    return this.selectedIndex >= 0
      ? F1_CIRCUITS_2025[this.selectedIndex]
      : null;
  }

  destroy() {
    const elements = ['interactive-sidebar', 'interactive-sidebar-styles'];
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });

    this.isCollapsed = false;
    this.isViewsCollapsed = false;
    this.selectedIndex = -1;
    this.hoveredIndex = -1;
  }
}