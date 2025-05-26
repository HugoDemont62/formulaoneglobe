# 🏎️ Globe F1 2025 - Visualisation Interactive des Circuits

Un globe 3D interactif présentant tous les circuits de Formule 1 de la saison 2025 avec leurs dates de Grand Prix.

![Globe F1 2025](https://img.shields.io/badge/F1-2025-red) ![Three.js](https://img.shields.io/badge/Three.js-0.175.0-blue) ![Vite](https://img.shields.io/badge/Vite-6.2.0-purple)

## 🌟 Fonctionnalités

- **Globe 3D interactif** avec texture terre réaliste
- **23 circuits F1 2025** avec marqueurs interactifs
- **5 vues différentes** : globale, Europe, Amériques, Asie, animation
- **Informations détaillées** pour chaque circuit
- **Interface utilisateur intuitive** avec contrôles avancés
- **Animations fluides** et effets visuels immersifs
- **Responsive design** adapté à tous les écrans

## 🚀 Installation

### Prérequis
- Node.js (version 18+ recommandée)
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/globe-f1-2025.git
cd globe-f1-2025
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Lancer en mode développement**
```bash
npm run dev
# ou
yarn dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du Projet

```
globe-f1-2025/
├── components/
│   ├── Globe.js          # Composant principal du globe avec circuits F1
│   ├── Camera.js         # Système de caméra avec contrôles
│   ├── Light.js          # Système d'éclairage optimisé
│   ├── Slider.js         # Gestionnaire des différentes vues
│   └── UI.js             # Interface utilisateur
├── index.js              # Point d'entrée principal
├── utils.js              # Fonctions utilitaires
├── style.css             # Styles CSS
├── index.html            # Template HTML
├── package.json          # Configuration npm
├── vite.config.js        # Configuration Vite
└── README.md            # Documentation
```

## 🎮 Utilisation

### Contrôles de Base

- **🖱️ Souris** : Survolez les points rouges pour les mettre en évidence
- **🖱️ Clic** : Cliquez sur un point pour afficher les informations du circuit
- **F** : Basculer en mode plein écran
- **H** : Afficher l'aide
- **R** : Réinitialiser la vue

### Vues Disponibles

1. **Vue Globale** : Tous les circuits visibles
2. **Circuits Européens** : Focus sur l'Europe (Monaco, Silverstone, Spa...)
3. **Circuits Américains** : Focus sur les Amériques (Miami, Austin, Las Vegas...)
4. **Circuits Asiatiques** : Focus sur l'Asie (Suzuka, Shanghai, Singapour...)
5. **Animation Rapide** : Tour du monde accéléré

### Interface de Contrôle

Le panneau de droite permet de :
- Contrôler la rotation automatique
- Ajuster la vitesse de rotation
- Modifier l'éclairage (mode jour/nuit/F1)
- Afficher la liste complète des circuits

## 🏁 Circuits F1 2025

| Circuit | Lieu | Date GP 2025 |
|---------|------|--------------|
| Bahrain International Circuit | Bahrain | 2 Mars 2025 |
| Jeddah Corniche Circuit | Jeddah | 9 Mars 2025 |
| Albert Park Circuit | Melbourne | 16 Mars 2025 |
| Suzuka International Racing Course | Suzuka | 6 Avril 2025 |
| Shanghai International Circuit | Shanghai | 13 Avril 2025 |
| Miami International Autodrome | Miami | 4 Mai 2025 |
| Autodromo Enzo e Dino Ferrari | Imola | 18 Mai 2025 |
| Circuit de Monaco | Monaco | 25 Mai 2025 |
| Circuit Gilles Villeneuve | Montréal | 15 Juin 2025 |
| Circuit de Barcelona-Catalunya | Barcelone | 29 Juin 2025 |
| Red Bull Ring | Spielberg | 6 Juillet 2025 |
| Silverstone Circuit | Silverstone | 13 Juillet 2025 |
| Hungaroring | Budapest | 27 Juillet 2025 |
| Circuit de Spa-Francorchamps | Spa | 31 Août 2025 |
| Autodromo Nazionale di Monza | Monza | 7 Septembre 2025 |
| Baku City Circuit | Bakou | 21 Septembre 2025 |
| Marina Bay Street Circuit | Singapour | 5 Octobre 2025 |
| Circuit of the Americas | Austin | 19 Octobre 2025 |
| Autódromo Hermanos Rodríguez | Mexico | 26 Octobre 2025 |
| Interlagos | São Paulo | 9 Novembre 2025 |
| Las Vegas Strip Circuit | Las Vegas | 22 Novembre 2025 |
| Losail International Circuit | Losail | 30 Novembre 2025 |
| Yas Marina Circuit | Abu Dhabi | 7 Décembre 2025 |

## 🛠️ Technologies Utilisées

- **[Three.js](https://threejs.org/)** - Rendu 3D
- **[Vite](https://vitejs.dev/)** - Build tool moderne
- **[GSAP](https://greensock.com/)** - Animations
- **[Tweakpane](https://tweakpane.github.io/)** - Interface de contrôle
- **WebGL** - Accélération matérielle
- **JavaScript ES6+** - Langage principal

## 🎨 Personnalisation

### Modifier les Couleurs

Dans `components/Globe.js`, vous pouvez ajuster les couleurs :

```javascript
// Couleurs du globe
globeColor: { value: new Color(0x1e3a8a) },    // Bleu nuit
landColor: { value: new Color(0x22c55e) },     // Vert terre
oceanColor: { value: new Color(0x0ea5e9) }     // Bleu océan
```

### Ajouter des Circuits

Pour ajouter un nouveau circuit, modifiez le tableau `f1Circuits` dans `components/Globe.js` :

```javascript
{
    name: "Nouveau Circuit",
    location: "Ville",
    date: "Date du GP",
    lat: latitude,      // Latitude en degrés
    lng: longitude,     // Longitude en degrés
    country: "Pays"
}
```

### Personnaliser l'Éclairage

Dans `components/Light.js`, vous pouvez créer de nouveaux modes d'éclairage :

```javascript
setCustomMode() {
    this.ambientLight.intensity = 0.5;
    this.directionalLight.intensity = 1.0;
    // ... autres paramètres
}
```

## 📦 Build pour Production

```bash
npm run build
# ou
yarn build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## 🚀 Déploiement

### GitHub Pages

1. Build le projet : `npm run build`
2. Commitez les changements
3. Activez GitHub Pages dans les paramètres du repository

### Netlify

1. Connectez votre repository GitHub
2. Configuration build :
    - Build command: `npm run build`
    - Publish directory: `dist`

### Vercel

```bash
npm i -g vercel
vercel --prod
```

## 🐛 Dépannage

### Problèmes Courants

**Le globe ne s'affiche pas :**
- Vérifiez que WebGL est supporté par votre navigateur
- Assurez-vous que les dépendances sont bien installées

**Performances lentes :**
- Réduisez la qualité des ombres dans `index.js`
- Diminuez la résolution de la sphère dans `Globe.js`

**Marqueurs non cliquables :**
- Vérifiez la console pour les erreurs JavaScript
- Assurez-vous que les coordonnées des circuits sont valides

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.