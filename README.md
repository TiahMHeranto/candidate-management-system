# 🚀 Candidate Management System (Full Stack)

## 📌 Présentation

Ce projet est une **application full stack** réalisée dans le cadre d’un test technique de 24h pour un poste de **Full Stack & Test Engineer**.

L’objectif est de livrer une application **prête pour la production**, avec :

* Une architecture propre et maintenable
* Une stratégie de tests complète
* Une haute qualité de code
* Une attention particulière à la sécurité et aux performances

---

## 🧠 Fonctionnalités

### 🔧 Backend (Node.js / Express / TypeScript)

* API REST avec MongoDB
* Authentification JWT
* Rate limiting & middlewares de sécurité
* Logs structurés
* Validation stricte avec Zod

#### Endpoints

```
POST    /api/auth/login
POST    /api/candidates
GET     /api/candidates/:id
PUT     /api/candidates/:id
DELETE  /api/candidates/:id     (soft delete)
POST    /api/candidates/:id/validate (validation asynchrone avec délai simulé de 2s)
```

---

### 🎨 Frontend (React / TypeScript)

* Liste des candidats (pagination + filtres)
* Formulaire de création / édition (React Hook Form)
* Page de détail d’un candidat
* Bouton de validation asynchrone
* Gestion des états de chargement et des erreurs
* Tests d’accessibilité (a11y) avec axe-core

---

## 🏗️ Architecture

### Backend

```
src/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middlewares/
 ├── utils/
 ├── config/
 ├── __tests__/
 ├── tests/
 ├── app.ts
 └── server.ts
```

---

### Frontend

```
src/
 ├── components/
 ├── Pages/
 ├── hooks/
 ├── utils/
 ├── AppRouter/
 ├── lib/
 ├── test/
 └── main.tsx
```

---

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone https://github.com/TiahMHeranto/candidate-management-system.git
cd candidate-management-system
```

---

### 2. Lancer avec Docker (recommandé)

```bash
docker-compose up --build
```

Application disponible sur :

```
Frontend: http://localhost:5173
Backend: http://localhost:5000
```

---

### 3. Installation manuelle

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🔐 Variables d’environnement

### Backend (.env)

```
PORT=5000
MONGO_URI=mongodb_uri
JWT_SECRET=your_secret
```

---

## 🧪 Stratégie de tests (PARTIE CLÉ)

Le projet implémente une **pyramide de tests complète**.

---

### ✅ Tests unitaires

#### Backend

* Outils : Jest / Vitest
* Couverture : **100% sur modèles**

```bash
npm run test:jest
npm run test:coverage
```

#### Frontend

* Outil : Vitest
* Couverture : hooks et utilitaires

```bash
npm run test
npm run test:coverage
```

---

### 🔗 Tests d’intégration

#### Backend

* Outil : Supertest
* Base de données : MongoDB Memory Server

✔ Couvre :

* Tous les endpoints
* Les erreurs de validation
* Le middleware d’authentification
* Le rate limiting

---

#### Frontend

* Outil : MSW (Mock Service Worker)

✔ Simule :

* Réponses API réussies
* Erreurs API
* États de chargement




* Temps de réponse
* Taux d’erreur
* Débit (throughput)

## 🚀 Déploiement

* Backend : Render
* Frontend : Render / Vite

👉 URL de l’application :

```
https://your-app.onrender.com
```

---

## 🧱 Choix techniques

### Pourquoi MongoDB ?

* Schéma flexible pour les candidats
* Facile à tester avec une base en mémoire

### Pourquoi Zod ?

* Validation typée (TypeScript-first)
* Meilleure expérience développeur que Joi

### Pourquoi Vitest + Jest ?

* Vitest : rapide pour le frontend
* Jest : robuste pour le backend

### Pourquoi MSW ?

* Simulation réaliste des API
* Aucun impact sur le code de production

---

## 🛡️ Sécurité

* Authentification JWT
* Rate limiting
* Protection via Helmet
* Validation stricte des entrées
* Hash sécurisé des mots de passe (bcrypt)

---

## ⚡ Performance

* Endpoint de validation asynchrone (simulation réaliste)
* Optimisation des requêtes
* Tests de charge avec k6

---

## 📌 Points forts

✔ Architecture propre et scalable
✔ Implémentation complète de la pyramide de tests
✔ Pipeline CI/CD
✔ Backend prêt pour production
✔ Forte attention à la sécurité et aux performances

---

## 👨‍💻 Auteur

**TiahM Heranto (TiahM)**
Développeur Full Stack | Passionné de Finance & Tech

---

## 📎 Notes pour l’évaluateur

* Lancez `docker-compose up` → tout fonctionne immédiatement
* Tous les tests sont inclus et reproductibles
* L’accent a été mis sur la **qualité globale**, pas uniquement les fonctionnalités
