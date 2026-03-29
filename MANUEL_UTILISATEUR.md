# Mode d'Emploi - Optimum Juridis Finance

Bienvenue sur la plateforme **Optimum Juridis Finance**. Ce guide vous accompagnera dans la prise en main de l'application à travers un scénario de test concret.

## 1. Accès et Rôles

L'application définit deux rôles principaux :

*   **Directeur (Admin)** : Accès complet (Création projets, facturation, rapports, gestion utilisateurs).
*   **Consultant** : Accès limité (Mes tâches, saisie des temps, documents).

### Identifiants de Connexion (Test)
Mot de passe pour tous : `password123`

| Nom | Email | Rôle |
| :--- | :--- | :--- |
| **Patrice Etoundi Ottou** | `p.etoundi@optimum.com` | Directeur |
| **Pr Kala Jean Robert** | `j.kala@optimum.com` | Consultant Senior |
| **Tapamo Wilson** | `w.tapamo@optimum.com` | Consultant (Web) |

---

## 2. Scénario de Test : "Audit de Conformité RGPD - CAMTEL"

Pour tester l'ensemble des fonctionnalités, nous allons simuler un projet réel. Suivez les étapes ci-dessous en équipe.

### Phase 1 : Initialisation (Rôle : Directeur)
*Connectez-vous en tant que **Patrice Etoundi Ottou**.*

1.  **Créer le Projet** :
    *   Allez dans **Projets** > **Nouveau Projet**.
    *   **Nom** : `Audit Conformité RGPD 2024`
    *   **Client** : `CAMTEL` (Contact : M. Abena)
    *   **Type** : `JURIDIQUE`
    *   **Dates** : Aujourd'hui à dans 2 semaines.
    *   **Manager** : Patrice Etoundi Ottou
    *   **Consultants** : Sélectionnez *Pr Kala Jean Robert* et *Tapamo Wilson*.
    *   Cliquez sur **Créer**.

2.  **Créer des Tâches** :
    *   Cliquez sur "Voir" sur la carte du projet créé.
    *   Allez dans l'onglet **Tâches**.
    *   Cliquez sur le lien/bouton pour ajouter une tâche ou allez dans le menu **Tâches** > **Nouvelle Tâche**.
    *   **Tâche 1** : "Cartographie des données"
        *   Assigné à : *Tapamo Wilson*
        *   Priorité : `MEDIUM`
        *   Budget : Débours 50,000 FCFA
    *   **Tâche 2** : "Analyse d'impact (DPIA)"
        *   Assigné à : *Pr Kala Jean Robert*
        *   Priorité : `HIGH`

### Phase 2 : Exécution (Rôle : Consultant)
*Déconnectez-vous et connectez-vous en tant que **Tapamo Wilson**.*

1.  **Consulter ses Tâches** :
    *   Sur votre **Tableau de Bord**, vous verrez "Cartographie des données" dans "Mes Tâches".
    *   Vous avez reçu une notification (cloche en haut à droite).

2.  **Travailler sur la Tâche** :
    *   Cliquez sur la tâche.
    *   Changez le statut à **EN COURS**.
    *   Ajoutez un **Commentaire** : "J'ai débuté l'analyse des serveurs." (Simulez une interaction).

3.  **Saisir ses Heures (Important pour le rapport)** :
    *   Sur la tâche, cliquez sur **Saisir Temps**.
    *   Entrez `4` heures.
    *   Description : "Revue infrastructure IT".

4.  **Terminer la Tâche** :
    *   Changez le statut à **A REVOIR** (si besoin de validation) ou **TERMINE** (si autorisé). *Note: Seul le directeur peut valider définitivement en TERMINE dans certains workflows, mais mettez-la en `REVIEW` si possible, ou demandez au directeur de le faire.*

### Phase 3 : Suivi & Facturation (Rôle : Directeur)
*Reconnectez-vous en tant que **Patrice Etoundi Ottou**.*

1.  **Tableau de Bord Directeur** :
    *   Observez les widgets : "Tâches Urgentes" et les notifications récentes de Wilson.

2.  **Validation** :
    *   Allez dans **Tâches**.
    *   Ouvrez la tâche de Wilson.
    *   Passez le statut à **TERMINE**.

3.  **Génération de Rapport** :
    *   Allez dans **Rapports**.
    *   Choisissez la période (Ce mois).
    *   Regardez l'onglet **Performance Consultants** : Wilson devrait avoir des heures et une tâche complétée.
    *   Cliquez sur **Exporter en PDF** pour voir le rendu officiel.

4.  **Facturation (Optionnel)** :
    *   Allez dans **Finances** > **Nouvelle Facture**.
    *   Sélectionnez le projet "Audit Conformité...".
    *   Importez les tâches terminées (le système calculera les montants basés sur le budget ou les heures).
    *   Générez la facture PDF.

## 3. Fonctionnalités Clés à Vérifier

*   [ ] **Notifications** : Vérifiez que la cloche sonne (point rouge) quand une tâche est assignée.
*   [ ] **Recherche** : Essayez de trouver le projet en tapant "Camtel" dans la barre de recherche des projets.
*   [ ] **Filtres** : Dans la page Tâches, filtrez par "Priorité : Haute".
*   [ ] **Export PDF** : Assurez-vous que les rapports PDF s'ouvrent correctement et que les montants sont bien formatés (ex: 10 000 FCFA).

Bon test à toute l'équipe Optimum !
