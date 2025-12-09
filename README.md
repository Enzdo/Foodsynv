# 🍽️ FoodSync

**Application iPhone de gestion intelligente du frigo familial**

FoodSync est une application iOS qui permet à une famille de gérer son frigo de manière intelligente grâce à l'IA, la synchronisation en temps réel et la vision par ordinateur.

## 📋 Fonctionnalités

- **Comptes familiaux synchronisés** — Profils individuels, notifications, habitudes alimentaires, restrictions
- **Scan intelligent du frigo** — Reconnaissance d'aliments, lecture de dates, tickets de caisse, inventaire partagé
- **Gestion automatique des dates de péremption** — Alertes, suggestions, recettes anti-gaspillage
- **Liste de courses dynamique** — Prédictions automatiques, liste collaborative en temps réel
- **Suivi des promotions** — Comparaison des prix, promos et zéro déchet
- **Recettes intelligentes via IA** — Recettes optimisées selon goûts, restes, budget
- **Analyse & Insights alimentaires** — Statistiques, budget, habitudes, gaspillage

## 🛠️ Stack Technique

### Backend
- **Framework**: AdonisJS 6 (Node.js)
- **Base de données**: PostgreSQL
- **ORM**: Lucid
- **Auth**: JWT / API Tokens

### Frontend
- **Framework**: Nuxt 3 (Vue.js)
- **Mode**: SPA + Capacitor (iOS)
- **UI**: TailwindCSS
- **State**: Pinia

### Infrastructure
- **Monorepo**: Turborepo + PNPM Workspaces
- **Mobile**: Capacitor pour iOS

## 📁 Structure du Projet

```
/foodsync
├── apps/
│   ├── backend/          # API AdonisJS 6
│   └── frontend/         # Nuxt 3 + Capacitor
├── packages/
│   ├── config/           # Configurations partagées
│   └── ui/               # Composants UI partagés (futur)
├── turbo.json            # Configuration Turborepo
├── pnpm-workspace.yaml   # Configuration PNPM workspaces
├── package.json          # Scripts racine
├── .env.example          # Variables d'environnement
└── README.md
```

## 🚀 Installation

### Prérequis

- **Node.js** >= 20.0.0
- **PNPM** >= 9.0.0
- **PostgreSQL** >= 14
- **Xcode** (pour le build iOS)

### 1. Cloner et installer les dépendances

```bash
cd foodsync
pnpm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos valeurs :

```env
# Base de données
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=foodsync

# Application
PORT=3333
HOST=0.0.0.0
APP_KEY=générer_avec_node_ace_generate_key

# Frontend
NUXT_PUBLIC_API_BASE=http://localhost:3333
```

### 3. Créer la base de données

```bash
# Créer la base de données PostgreSQL
createdb foodsync

# Exécuter les migrations
pnpm db:migrate
```

### 4. Générer la clé d'application (Backend)

```bash
cd apps/backend
node ace generate:key
# Copiez la clé générée dans .env (APP_KEY)
```

## 💻 Développement

### Lancer tout le projet (backend + frontend)

```bash
pnpm dev
```

### Lancer uniquement le backend

```bash
pnpm dev:backend
# ou
cd apps/backend && pnpm dev
```

Le backend sera accessible sur `http://localhost:3333`

### Lancer uniquement le frontend

```bash
pnpm dev:frontend
# ou
cd apps/frontend && pnpm dev
```

Le frontend sera accessible sur `http://localhost:3000`

### Tester l'API

```bash
curl http://localhost:3333/health
# Réponse: {"status":"ok","timestamp":"..."}
```

## 📱 Build iOS

### 1. Générer le build statique

```bash
pnpm ios:build
```

### 2. Ouvrir dans Xcode

```bash
pnpm ios:open
```

### 3. Première configuration Capacitor

Si c'est la première fois :

```bash
cd apps/frontend
npx cap add ios
npx cap sync
```

## 🗄️ Base de Données

### Tables disponibles

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs de l'application |
| `families` | Familles/foyers |
| `family_members` | Membres d'une famille |
| `food_items` | Catalogue d'aliments |
| `fridge_inventory` | Inventaire du frigo |
| `scans` | Historique des scans (OCR, vision) |
| `shopping_list` | Liste de courses |
| `recipes` | Recettes |
| `promotions` | Promotions en cours |
| `notifications` | Notifications utilisateur |
| `user_preferences` | Préférences utilisateur |
| `consumption_logs` | Historique de consommation |

### Commandes migrations

```bash
# Exécuter les migrations
pnpm db:migrate

# Rollback
pnpm db:rollback

# Fresh (drop + migrate)
pnpm db:fresh
```

## 📡 API Endpoints

### Health Check
```
GET /health
→ { "status": "ok", "timestamp": "..." }
```

### API v1 (préfixe: `/api/v1`)

#### Auth
- `POST /auth/register` — Inscription
- `POST /auth/login` — Connexion
- `POST /auth/logout` — Déconnexion

#### Users
- `GET /users/me` — Profil utilisateur

#### Families
- `GET /families` — Liste des familles
- `POST /families` — Créer une famille
- `GET /families/:id` — Détails famille

#### Fridge
- `GET /fridge` — Inventaire du frigo
- `POST /fridge` — Ajouter un article
- `PUT /fridge/:id` — Modifier un article
- `DELETE /fridge/:id` — Supprimer un article

#### Shopping List
- `GET /shopping-list` — Liste de courses
- `POST /shopping-list` — Ajouter un article
- `PUT /shopping-list/:id` — Modifier
- `DELETE /shopping-list/:id` — Supprimer

#### Recipes
- `GET /recipes` — Liste des recettes
- `GET /recipes/suggestions` — Suggestions IA

#### Scans
- `POST /scan/receipt` — Scanner un ticket
- `POST /scan/fridge` — Scanner le frigo

## 🧪 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Lance backend + frontend |
| `pnpm dev:backend` | Lance uniquement le backend |
| `pnpm dev:frontend` | Lance uniquement le frontend |
| `pnpm build` | Build de production |
| `pnpm lint` | Lint du code |
| `pnpm db:migrate` | Exécute les migrations |
| `pnpm db:rollback` | Rollback migrations |
| `pnpm ios:build` | Build pour iOS |
| `pnpm ios:open` | Ouvre Xcode |

## 🔧 Configuration

### Turborepo

Le fichier `turbo.json` configure les tâches parallèles :
- `dev` — Développement (persistent)
- `build` — Build de production
- `lint` — Vérification du code

### PNPM Workspaces

Les workspaces sont configurés dans `pnpm-workspace.yaml` :
- `apps/*` — Applications (backend, frontend)
- `packages/*` — Packages partagés

## 📝 Notes de développement

- L'interface est conçue **mobile-first** pour iPhone
- Les safe areas iOS sont gérées via CSS
- Le backend expose une API REST
- La communication temps réel (WebSocket) sera ajoutée ultérieurement

## 📄 Licence

Projet privé — Tous droits réservés
