# À propos de l'application Homework-assistance
* Licence : [AGPL v3](http://www.gnu.org/licenses/agpl.txt)
* Développeur(s) : CGI
* Financeur(s) : Région Nouvelle Aquitaine
* Description : Application d'envoi de demandes d'aide aux devoirs

# Documentation technique
## Configuration du module dans le projet ong

Dans le fichier 'ent-core.json.template' du projet ong :

Déclarer l'application homework-assistance dans `"external-modules"` :
<pre>
	{
	  "name": "fr.openent~homework-assistance~0.1-SNAPSHOT",
	  "config": {
		"main" : "fr.openent.homeworkAssistance.HomeworkAssistance",
		"port" : 8330,
		"app-name" : "Homework-assistance",
		"path-prefix" : "homework-assistance",
		"app-address" : "/homework-assistance",
		"app-icon" : "${host}/homework-assistance/public/img/logo.svg",
		"host": "${host}",
		"ssl" : $ssl,
		"auto-redeploy": false,
		"userbook-host": "${host}",
		"app-registry.port" : 8012,
		"mode" : "${mode}",
		"entcore.port" : 8009,
		"kiamo": {
		  "key": "${kiamo_key}",
		  "server": "${kiamo_server}"
		}
	  }
	}
</pre>

# Présentation du module

L'application **Homework-assistance**, mise à disposition des établissement de la Région Nouvelle-Aquitaine, permet l'envoi de demandes d'aide aux devoirs de la part des étudiants.
Ces demandes, sous forme de formulaire, sont envoyés au service téléphonique Kiamo qui prend la suite en charge en rappelant les étudiants en question.
Les limites de ces demandes (dates, horraires, matières, ...) sont définis par les administrateurs.

## Fonctionnalités

Deux profils utilisateurs sont disponibles :
 - Les administrateurs globaux qui pourront définir le cadre des demandes
 - Les étudiants de la Région Nouvelle-Aquitaine

### Profil administrateur

Pour ces utilisateurs, il est possible de :
 - Définir les jours d'ouverture du service
 - Définir les heures d'ouverture du service
 - Définir des périodes de fermeture du service (vacances par exemple)
 - Redéfinir les textes de présentation du formulaire de demande

### Profil étudiant

Pour ces utilisateurs, il est possible de :
 - Sélectionner la matière dans laquelle l'étudiant souhaite être aidé
 - Donner plus d'informations sur sa demande (chapitre de cours par exemple)
 - Sélectionner la date et l'heure à laquelle il souhaite être rappelé
 - Fournir son numéro de téléphone pour être rappelé par le service
 - Envoyer un formulaire avec toutes les informations précédentes


# Modèle de données - base MongoDB
Une unique collection "homework-assistance" est utilisée.
Un document de cette colection représente la configuration définie par les administrateurs pour les formulaires.

Exemple de document de la collection "" :
<pre>
	{
	  "_id" : ObjectId("5e25b1b6107ab5b376bc99ba"),
	  "messages" : {
		"header" : "Tu rencontre des difficultés dans une matière ?\nTu souhaites obtenir un soutien scolaire personnalisé ?",
		"body" : "Profite d'un service gratuit d'aide aux devoirs par téléphone. L'équipe te recontactera le jour et l'heure souhaités.",
		"days" : "Du lundi au jeudi",
		"time" : "De 18h à 21h",
		"info" : "Hors vacances scolaires"
	  },
	  "settings" : {
	    "exclusions" : [
		  {
			"start" : "03/02/2020",
			"end" : "04/02/2020"
		  }, 
		  {
			"start" : "06/02/2020",
			"end" : "10/02/2020"
		  }
		  ],
		  "opening_days" : {
			"monday" : true,
			"tuesday" : true,
			"wednesday" : true,
			"thursday" : true,
			"friday" : true,
			"saturday" : false,
			"sunday" : false
		  },
		  "opening_time" : {
			"start" : {
			  "hour" : "18",
			  "minute" : "0"
			},
			"end" : {
			  "hour" : "21",
			"  minute" : "0"
			}
		  }
	  }
	}
</pre>

Description des champs d'un document de la collection "forum.categories" :
<pre>
	{
	  "_id" : ObjectId("5e25b1b6107ab5b376bc99ba"),
	  "messages" : {
		"header" : "Message d'en-tête",
		"body" : "Message central",
		"days" : "Message jours d'ouvertures",
		"time" : "Message heures d'ouvertures",
		"info" : "Message d'informations complémentaires"
	  },
	  "settings" : {
		"exclusions" : "Liste des périodes de fermeture du service",
		"opening_days" : "Jours d'ouvertures du services",
		"opening_time" : {
		  "start" : "Heure de début d'ouverture du service",
		  "end" : "Heure de fin d'ouverture du service"
		}
	  }
	}
</pre>

# Gestion des droits
On en distingue 2 :
 - Admin : possibilité de changer les paramètres de la configuration
 - Student : possibilité d'envoyer un formulaire de demande d'aide aux devoirs au service