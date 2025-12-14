# RangeLesLivres

## Présentation du projet
RangeLesLivres est un projet web interactif qui combine un **backend Node.js** et un **frontend développé avec Vite**.  
L’objectif principal du projet est de créer un jeu où les joueurs trient des livres selon leur **genre** et leur **taille**, tout en communiquant via un **chat intégré**.  

Nous avons choisi **Vite** pour le frontend afin de **développer de manière plus intelligente**, en voyant les modifications effectuées en direct sur le site sans avoir à recharger la page manuellement. Cela accélère considérablement le développement et facilite les tests.

Le projet utilise également **Socket.IO** pour la communication en temps réel entre le frontend et le backend, permettant la mise à jour instantanée de l’interface et du chat.

---

## Architecture du projet

Pour fonctionner correctement, le projet nécessite **deux terminaux ouverts** :  

**Backend (serveur Node.js)**  
Lancer le serveur qui gère la logique du jeu et la communication avec les joueurs via Socket.IO :  
```bash
npm run start:backend
```
<img width="610" height="115" alt="image" src="https://github.com/user-attachments/assets/b2c8a62c-2adc-4ba1-a866-27f03a6a5679" />

Lancer le frontend pour voir les modifications en direct dans le navigateur sur un autre terminal ! :

```bash
npm run start:frontend
```

<img width="523" height="244" alt="image" src="https://github.com/user-attachments/assets/8072506c-008b-474c-ad5d-5a488c814538" />



Pourquoi deux terminaux ?

Le backend et le frontend sont deux serveurs distincts.

Le backend traite les événements du jeu et les messages du chat.

Le frontend affiche le jeu et se met à jour en temps réel grâce aux données reçues du backend.


Technologies utilisées

Node.js pour le backend

Express.js pour gérer le serveur HTTP

Socket.IO pour la communication en temps réel

Vite pour le frontend et le hot-reload

HTML / CSS / JavaScript pour l’interface utilisateur



Utilisation du jeu

Ouvrir le frontend dans le navigateur : http://localhost:5173.

<img width="213" height="32" alt="image" src="https://github.com/user-attachments/assets/2be3f3b5-2819-43ae-87d5-43ecd0707d97" />


Saisir un pseudo dans le champ prévu et cliquer sur Join.

<img width="1366" height="655" alt="image" src="https://github.com/user-attachments/assets/06240a13-cb2a-4111-937a-89fe3fed789c" />

Cliquer sur Ready pour rejoindre la partie.

<img width="1366" height="655" alt="image" src="https://github.com/user-attachments/assets/e903bb52-9764-4e6f-84a6-017aeae3fcf5" />

Une petite icône apparaît avec votre pseudo pour indiquer que vous êtes connecté.

<img width="1332" height="59" alt="image" src="https://github.com/user-attachments/assets/4a5ede61-b9dc-43e1-938d-62dde625fea6" />

Cliquer sur Ready pour devenir actif. L’icône devient verte, indiquant que vous êtes prêt à jouer.

<img width="1332" height="59" alt="image" src="https://github.com/user-attachments/assets/2be49d0b-438e-47a0-b5c4-d13cd2c6f563" />

Une fois tous les joueurs prêts, le jeu peut démarrer

<img width="1366" height="655" alt="image" src="https://github.com/user-attachments/assets/b8bd495d-9ed0-4b3a-b2a5-051e8c804e71" />

Trier les livres selon leur genre et leur taille.

<img width="152" height="150" alt="image" src="https://github.com/user-attachments/assets/e67505a0-c7c6-4658-883d-6d60c5178ee3" />, <img width="152" height="51" alt="image" src="https://github.com/user-attachments/assets/a1666395-6b94-484b-be3d-d8f5e535db95" />, <img width="153" height="100" alt="image" src="https://github.com/user-attachments/assets/72054c4c-7d54-46bf-8886-3c55921a1e19" />, <img width="1292" height="159" alt="image" src="https://github.com/user-attachments/assets/fa29ab5b-79c5-4585-ab5d-091f039882db" />

Vous pouvez voir en haut à droite le nombre de livre restants à trier, et le tour du joueur qui doit jouer. 

<img width="222" height="80" alt="image" src="https://github.com/user-attachments/assets/ecc5420d-23c6-4f47-a46b-a9b3dd2c82d3" />

Si vous vous trompez d'emplacement le jeu vous renvera un message d'erreur comme quoi vous vous êtes trompez.

<img width="172" height="51" alt="image" src="https://github.com/user-attachments/assets/91d99be7-634c-43e9-8e90-6fbe099eb958" />

Utiliser le chat pour communiquer avec les autres joueurs, disponible sur l’écran d’accueil et pendant la partie, de plus vous pouvez le rétrécir en cliquant sur l'icône en bas à gauche.

<img width="30" height="31" alt="image" src="https://github.com/user-attachments/assets/7f19a586-3059-4e36-98b3-e1ca62711b4c" />
<img width="1349" height="239" alt="image" src="https://github.com/user-attachments/assets/6c8a5b16-f1cb-47cd-9d6a-4d8c4f84facf" />

À la fin de la partie, un écran de victoire apparaît, avec la possibilité de relancer une nouvelle partie

<img width="1366" height="655" alt="image" src="https://github.com/user-attachments/assets/a5ba500d-62e8-4c60-a96c-1494d942e705" />
































