# 🚀 Épi'Chat - IRC Moderne

Une application de chat IRC moderne et élégante construite avec **Node.js**, **Socket.io**, **Express.js** et **React.js**.

![IRC Chat](https://img.shields.io/badge/Chat-IRC-blue) ![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Socket.io](https://img.shields.io/badge/Socket.io-black?logo=socket.io&badgeColor=010101)

## ✨ Fonctionnalités

- 💬 **Chat en temps réel** avec WebSockets
- 🎨 **Interface moderne** avec thème sombre élégant
- 📱 **Design responsive** pour tous les écrans
- ✨ **Animations fluides** et transitions
- 👥 **Gestion des utilisateurs** en temps réel
- 🔄 **Channels multiples** avec navigation intuitive
- 🔒 **Messages privés** entre utilisateurs
- ⚡ **Performance optimisée**

## 🛠️ Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.io** - Communication temps réel

### Frontend
- **React.js** - Interface utilisateur
- **CSS3** - Styles modernes avec variables CSS
- **Font Awesome** - Icônes
- **Google Fonts** - Typographie (Inter & JetBrains Mono)

## 🚀 Installation et utilisation

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/Mohammed-el-Amine/my_irc.git
cd my_irc
```

### 2. Installation des dépendances

**Backend :**
```bash
cd server
npm install
```

**Frontend :**
```bash
cd client
npm install
```

### 3. Démarrage de l'application

**Terminal 1 - Serveur :**
```bash
cd server
node server.js
```
> Le serveur démarre sur http://localhost:3001

**Terminal 2 - Client :**
```bash
cd client
npm start
```
> L'application s'ouvre sur http://localhost:3000

## 📋 Commandes disponibles

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/nick [pseudo]` | Changer votre pseudo | `/nick MonNouveauPseudo` |
| `/create [channel]` | Créer un nouveau channel | `/create gaming` |
| `/join [channel]` | Rejoindre un channel existant | `/join #gaming` |
| `/msg [utilisateur] [message]` | Envoyer un message privé | `/msg admin Bonjour !` |

## 🎨 Aperçu de l'interface

### Page de connexion
- Design moderne avec gradient
- Animation de brillance sur le titre
- Formulaire élégant avec validation

### Interface principale
- **Header** avec logo et informations utilisateur
- **Sidebar gauche** : Liste des channels avec commandes utiles
- **Zone centrale** : Messages en temps réel avec avatars
- **Sidebar droite** : Liste des utilisateurs connectés
- **Zone de saisie** : Input moderne avec bouton d'envoi animé

## 🎯 Fonctionnalités avancées

- ✅ **Messages système** avec icônes et couleurs
- ✅ **Messages privés** avec indicateurs visuels
- ✅ **Avatars générés** avec initiales
- ✅ **Timestamps** sur tous les messages
- ✅ **Scrolling automatique** vers les nouveaux messages
- ✅ **Notifications visuelles** pour les connexions/déconnexions
- ✅ **Thème sombre** avec variables CSS personnalisables
- ✅ **Responsive design** pour mobile et desktop

## 📁 Structure du projet

```
my_irc/
├── server/
│   ├── server.js          # Serveur Express + Socket.io
│   ├── package.json       # Dépendances backend
│   └── node_modules/
├── client/
│   ├── src/
│   │   ├── App.js         # Composant React principal
│   │   ├── index.js       # Point d'entrée React
│   │   └── index.css      # Styles modernes
│   ├── public/
│   │   └── index.html     # Template HTML
│   ├── package.json       # Dépendances frontend
│   └── node_modules/
└── README.md             # Documentation
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Mohammed el Amine**
- GitHub: [@Mohammed-el-Amine](https://github.com/Mohammed-el-Amine)

---

⭐ **N'hésitez pas à donner une étoile si ce projet vous plaît !**