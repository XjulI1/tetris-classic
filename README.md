# Tetris Classic

Un Tetris façon NES en web app Vue 3, jouable au clavier sur ordinateur et au doigt sur mobile, installable et jouable hors-ligne.

## Fonctionnalités

- Règles de la version NES : rotation sans « wall kicks », tirage aléatoire NES, aperçu de la pièce suivante, scoring et progression des niveaux d'origine.
- Choix du niveau de départ, de 0 à 9.
- Statistiques de partie : nombre de pièces par type, lignes effacées en single / double / triple / tetris, taux de tetris.
- Top 10 des meilleurs scores, conservé dans le navigateur.
- Effets sonores et musique (Korobeïniki) générés à la volée, sans fichier audio.
- Thème clair ou sombre, qui suit le système par défaut.
- Application installable (PWA) et jouable sans réseau.

## Règles

Le jeu reprend l'esprit de la NES, avec quelques ajustements pour le rendre plus confortable :

| | NES | Ici |
|---|---|---|
| Vitesse de chute | accélère jusqu'au niveau 29 | suit la même courbe, mais plafonnée au niveau 19 |
| Répétition gauche / droite | 267 ms puis 100 ms | 170 ms puis 50 ms |
| Chute instantanée | absente | Espace, 2 points par ligne |
| Descente rapide | 30 lignes par seconde | une case, une courte pause, puis accélération jusqu'à 20 lignes par seconde |

Comme sur NES, la descente rapide s'arrête quand la pièce se pose : il faut relâcher puis réappuyer pour accélérer la pièce suivante.

Points par lignes effacées, multipliés par (niveau + 1) :

| Lignes | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Points | 40 | 100 | 300 | 1 200 |

On monte d'un niveau toutes les 10 lignes, une fois rattrapé le niveau de départ.

## Commandes

### Clavier

| Touche | Action |
|---|---|
| ← → | Déplacer |
| ↓ | Descente rapide |
| Espace | Chute instantanée |
| ↑ ou X | Rotation horaire |
| Z ou W | Rotation anti-horaire |
| P ou Échap | Pause |
| M | Couper le son |

Les lettres correspondent à ce qui est imprimé sur le clavier : sur AZERTY, W et X sont côte à côte pour les deux rotations.

### Mobile

Sous le plateau : une croix directionnelle (gauche, droite, descente rapide, chute instantanée en haut), le bouton **A** pour la rotation horaire et le bouton **B** pour la rotation anti-horaire.

## Développement

### Prérequis

- Node.js 22.12 ou plus récent
- pnpm 12

### Installation

```sh
pnpm install
```

Le registre applique un délai de 7 jours avant d'accepter une nouvelle version d'un paquet. Si l'installation refuse une version trop récente, il faut abaisser la plage concernée dans `package.json`.

### Scripts

| Commande | Rôle |
|---|---|
| `pnpm dev` | Serveur de développement (`pnpm dev --host` pour tester depuis un téléphone sur le même réseau) |
| `pnpm build` | Vérification des types puis build de production dans `dist/` |
| `pnpm preview` | Sert le build de production en local |
| `pnpm test` | Tests unitaires en mode watch |
| `pnpm test:run` | Tests unitaires en une seule passe |
| `pnpm typecheck` | Vérification des types seule |

### Installation sur mobile

Un navigateur ne propose d'installer la PWA que si le site est servi en HTTPS (ou depuis `localhost`). Pour l'installer sur un téléphone, il faut donc déployer le contenu de `dist/` sur un hébergement HTTPS.

## Stack

- Vue 3 (`<script setup>`) et TypeScript
- Vite, avec `vite-plugin-pwa` pour le service worker et le manifeste
- Rendu du plateau en Canvas 2D, sons en Web Audio
- Tests unitaires avec Vitest

## Organisation du code

| Dossier | Contenu |
|---|---|
| `src/engine/` | Moteur de jeu en TypeScript pur, indépendant de Vue : grille, pièces, rotation, tirage aléatoire, vitesse, scoring, répétition des touches |
| `src/audio/` | Synthèse des effets sonores et de la musique |
| `src/storage/` | Meilleurs scores et réglages, sauvegardés dans le `localStorage` |
| `src/render/` | Dessin du plateau sur le canvas |
| `src/composables/` | Boucle de jeu, clavier, thème et réglages |
| `src/components/` | Interface : plateau, panneaux, menus, contrôles tactiles |

Le comportement du moteur est documenté par ses tests, placés à côté de chaque fichier (`*.test.ts`).

## Crédits

La musique est le thème A de Korobeïniki, chanson populaire russe du domaine public.
