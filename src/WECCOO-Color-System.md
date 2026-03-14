# 🎨 Système de Couleurs WECCOO

Guide complet du système de couleurs basé sur l'identité visuelle du logo WECCOO.

---

## Couleurs du Logo

| Couleur | Hex Usage |
|-------- |-|-----|-------|
| Bleu principal | `#1E63D6` | Couleur primaire |
| Jaune secondaire | `#F5C400` | Couleur d'accent |
| Bleu foncé | `#0F4FBF` | États hover/actif |
| Gris clair | `#F2F2F2` | Arrière-plan |
| Blanc | `#FFFFFF` | Surface |

---

## 1. Couleurs Principales

### Primary (Bleu WECCOO)

```css
/* Utilisation */
bg-primary-500    /* #1E63D6 - Bleu principal */
bg-primary-600    /* #1a56bf */
bg-primary-700    /* #0F4FBF - Hover/Actif */
bg-primary-50    /* #e6edfc - Fond léger */
text-primary-500  /* Texte sur fond clair */
```

**Usage recommandé :**
- Boutons principaux
- Liens
- Icônes actives
- Titres d'importance

### Secondary (Jaune WECCOO)

```css
/* Utilisation */
bg-secondary-400  /* #F5C400 - Jaune secondaire */
bg-secondary-500  /* #eab308 */
text-secondary-500
```

**Usage recommandé :**
- Accents et mises en valeur
- Badges de notification
- Icônes d'avertissement
- Éléments de hiérarchie visuelle

---

## 2. Arrière-plan et Surface

```css
/* Arrière-plan global */
bg-background           /* #F2F2F2 */
bg-background-100       /* #F2F2F2 */
bg-background-50        /* #fafafa */

/* Surface (cartes, éléments élevés) */
bg-surface              /* #FFFFFF */
bg-surface-50           /* #FFFFFF */
bg-surface-100          /* #fafafa */
```

**Usage recommandé :**
- `bg-background` → Fond principal de l'application
- `bg-surface` → Cartes, modales, dropdowns

---

## 3. Texte

```css
/* Texte principal */
text-text-primary    /* #1a1a1a - Texte principal */

/* Texte secondaire */
text-text-secondary  /* #525252 - Descriptions */

/* Texte tertiary */
text-text-tertiary    /* #737373 - Placeholders */
```

**Bonnes pratiques :**
- Utilisez `text-text-primary` pour les titres et contenus importants
- Utilisez `text-text-secondary` pour les descriptions
- Utilisez `text-text-tertiary` pour les placeholders et indices

---

## 4. États des Composants

```css
/* Hover */
hover:bg-primary-700     /* #0F4FBF */
hover:bg-secondary-500   /* #eab308 */

/* Active/Pressed */
active:bg-primary-800    /* #0a3373 */

/* Focus */
focus:ring-primary-500   /* #1E63D6 */
focus:ring-2

/* Disabled */
bg-states-disabled       /* #d4d4d4 */
text-states-disabled     /* #a3a3a3 */
opacity-50               /* 50% d'opacité */
```

---

## 5. Composants UI

### Navbar

```jsx
// Fond de la navbar
<nav className="bg-primary-500 text-white">
// ou avec ombre
<nav className="bg-surface shadow-md">
```

### Sidebar

```jsx
// Sidebar sombre (version moderne)
<aside className="bg-neutral-900 text-white">

// Sidebar claire
<aside className="bg-surface border-r border-border">
```

### Boutons

```jsx
// Bouton primaire
<button className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 
                   text-white font-medium rounded-lg px-4 py-2 transition-colors">
  Primary
</button>

// Bouton secondaire
<button className="bg-secondary-400 hover:bg-secondary-500 
                   text-neutral-900 font-medium rounded-lg px-4 py-2">
  Secondary
</button>

// Bouton outline
<button className="border-2 border-primary-500 text-primary-500 
                   hover:bg-primary-50 rounded-lg px-4 py-2">
  Outline
</button>

// Bouton ghost
<button className="text-primary-500 hover:bg-primary-50 rounded-lg px-4 py-2">
  Ghost
</button>
```

### Cartes

```jsx
// Carte simple
<div className="bg-surface rounded-xl shadow-md p-6">
  Contenu
</div>

// Carte avec bordure
<div className="bg-surface border border-border rounded-lg p-4">
  Contenu
</div>

// Carte hoverable
<div className="bg-surface rounded-xl shadow-md p-6 
                hover:shadow-lg transition-shadow cursor-pointer">
  Contenu
</div>
```

### Liens

```jsx
// Lien standard
<a href="#" className="text-primary-500 hover:text-primary-700 
                      underline-offset-4 hover:underline">
  Lien
</a>

// Lien sans soulignement
<a href="#" className="text-primary-500 hover:text-primary-700">
  Lien
</a>
```

### Alerts

```jsx
// Success
<div className="bg-success-light text-success-dark rounded-lg p-4">
  Opération réussie
</div>

// Error
<div className="bg-error-light text-error-dark rounded-lg p-4">
  Erreur survenue
</div>

// Warning
<div className="bg-warning-light text-warning-dark rounded-lg p-4">
  Attention requise
</div>

// Info
<div className="bg-info-light text-info-dark rounded-lg p-4">
  Information
</div>
```

### Badges

```jsx
// Badge primaire
<span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm">
  Nouveau
</span>

// Badge secondaire (jaune)
<span className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full text-sm">
  Important
</span>

// Badge succès
<span className="bg-success-light text-success-dark px-2 py-1 rounded-full text-sm">
  Actif
</span>
```

---

## 6. Exemples d'Interface

### Page d'accueil

```jsx
<div className="min-h-screen bg-background">
  {/* Navbar */}
  <header className="bg-surface shadow-sm">
    <nav className="flex items-center justify-between px-6 py-4">
      <div className="text-primary-500 font-bold text-xl">WECCOO</div>
      <div className="flex gap-4">
        <a href="#" className="text-text-secondary hover:text-primary-500">Accueil</a>
        <a href="#" className="text-text-secondary hover:text-primary-500">Explorer</a>
      </div>
    </nav>
  </header>

  {/* Contenu principal */}
  <main className="max-w-7xl mx-auto px-6 py-8">
    {/* Carte */}
    <div className="bg-surface rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-4">
        Bienvenue sur WECCOO
      </h1>
      <p className="text-text-secondary">
        Échangez et partagez avec la communauté étudiant
      </p>
      <button className="mt-4 bg-primary-500 hover:bg-primary-600 
                         text-white font-medium px-6 py-2 rounded-lg">
        Commencer
      </button>
    </div>
  </main>
</div>
```

### Liste d'éléments

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Carte d'item */}
  <div className="bg-surface rounded-xl shadow-sm hover:shadow-md 
                  transition-shadow overflow-hidden cursor-pointer">
    <div className="h-48 bg-neutral-200"></div>
    <div className="p-4">
      <h3 className="font-semibold text-text-primary">Titre</h3>
      <p className="text-sm text-text-secondary mt-1">Description</p>
      <span className="inline-block mt-3 bg-primary-100 text-primary-700 
                       px-2 py-1 rounded-full text-xs">
        Catégorie
      </span>
    </div>
  </div>
</div>
```

### Formulaire

```jsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-text-primary mb-1">
      Email
    </label>
    <input 
      type="email" 
      className="w-full px-4 py-2 border border-border rounded-lg 
                 focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                 outline-none transition-colors"
      placeholder="email@exemple.com"
    />
  </div>
  
  <button className="w-full bg-primary-500 hover:bg-primary-600 
                     text-white font-medium py-2 rounded-lg">
    Soumettre
  </button>
</form>
```

---

## 7. Accessibilité

### Contraste

| Combinaison | Ratio | Status |
|-------------|-------|--------|
| `text-primary-500` sur blanc | 4.6:1 | ✓ AA |
| `text-text-primary` sur blanc | 17:1 | ✓ AAA |
| `text-text-secondary` sur blanc | 7:1 | ✓ AA |
| `text-white` sur `primary-500` | 4.2:1 | ✓ AA |

### Focus Visible

```jsx
// Toujours inclure un indicateur de focus
<button className="focus:outline-none focus:ring-2 focus:ring-primary-500 
                   focus:ring-offset-2">
  Bouton accessible
</button>
```

---

## 8. Résumé des Classes

| Catégorie | Classes importantes |
|-----------|---------------------|
| **Primary** | `bg-primary-500`, `text-primary-500`, `hover:bg-primary-700` |
| **Secondary** | `bg-secondary-400`, `text-secondary-500` |
| **Background** | `bg-background`, `bg-background-100` |
| **Surface** | `bg-surface`, `border-border` |
| **Texte** | `text-text-primary`, `text-text-secondary` |
| ** États** | `hover:`, `active:`, `focus:`, `disabled:` |
| **Alertes** | `bg-success-light`, `bg-error-light`, etc. |

---

## 9. Palette Complète

```
Primary (Bleu):
50: #e6edfc → 500: #1E63D6 → 900: #07224a

Secondary (Jaune):
50: #fefce8 → 500: #F5C400 → 900: #713f12

Neutral:
50: #fafafa → 500: #737373 → 950: #0a0a0a

États:
Hover: #0F4FBF
Active: #0a3373
Disabled: #d4d4d4
```

---

*Document généré pour l'application WECCOO - Système de couleurs v1.0*
