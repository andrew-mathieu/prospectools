# Prospectools

Prospectools est un outil créé par Andrew Mathieu pour envoyer des e-mails personnalisés à une liste de prospects à partir d'un fichier CSV. L'outil utilise les bibliothèques csv-parser et nodemailer pour lire les données du fichier CSV et envoyer les e-mails respectivement.

## Comment utiliser l'outil

⚠️ Attention : Ce projet est entièrement dédié aux développeurs avancés en NodeJS pour le moment. Je prévois de développer une version ouverte au "grand public".

1. Clonez le repo Github sur votre machine locale.
2. Ouvrez le terminal et accédez au dossier où vous avez cloné le repo.
3. Installez les dépendances en tapant `npm install` dans le terminal.
4. Créez un fichier `.env` à la racine du projet et ajoutez les informations suivantes :

```makefile
TRANSPORTER_SERVICE = "service d'envoi de courrier"
TRANSPORTER_MAIL = "votre adresse e-mail"
TRANSPORTER_PASS = "votre mot de passe"
```

5. Créez un fichier data.csv contenant les informations de vos prospects. Le fichier doit contenir les colonnes suivantes : name, label, created_at, email, has_website, website_url, district, et phone_number. Les colonnes phone_number et website_url sont facultatives.
6. Dans le terminal, tapez npm start pour lancer l'outil.

## Ajustement du code

Si vous souhaitez personnaliser le contenu de l'e-mail, ou les paramètres à prendre en compte, le code est entièrement à votre disposition dans le fichier `app.js`, voici quelques exemples :

### Paramètres pour envoyer un e-mail aux prospects possédant déjà un site web

La fonction `sendMail` contient les arguments `name`, `email`, `has_website`, l'argument `name` prendra en compte le nom de l'entreprise ou de la personne dans le fichier `data.csv`, l'argument `email` récupère l'adresse e-mail du client potentiel, et `has_website` est un paramètre que vous pouvez remplacer selon vos besoins.

```js
// Création de la fonction "sendMail"
const sendMail = ({ name, email, has_website }) => {
    // Vérification que nous n'avons pas déjà envoyé le mail à une adresse e-mail, si oui, on passe l'envoi
	const sentEmail = sentEmails.find((e) => e.email === email);
	if (sentEmail) {
		console.log(`Email already sent to ${email}, skipping...`);
		return Promise.resolve();
	}
    // Si la propriété "has_website" dans le fichier 'data.csv' est égale à "Non", on attribue les propriétés JSON de notre template à 'noWebsite', dans le cas contraire, on l'attribue à 'hasWebsite'
	const { object, msg } = has_website === 'Non' ? noWebsite : hasWebsite;
    // Nous remplaçons l'interpolation '{ENTERPRISE_NAME}' avec le nom de notre prospect
	const emailTemplate = msg.replace('{ENTERPRISE_NAME}', name);
	const mailOptions = {
        // Remplacez "your name" par votre nom
		from: 'your name',
		to: email,
		subject: object,
		text: emailTemplate,
	};
    // Nous retournons notre "transporter" (relatif à nodemailer), et ajoutons l'e-mail du prospect à notre fichier 'sent_emails.json' qui nous permet de savoir si nous avons déjà envoyé un e-mail à cette personne
	return transporter.sendMail(mailOptions).then(() => {
		const sentDate = new Date().toISOString();
		sentEmails.push({ email, sentDate });
		fs.writeFileSync(sentEmailsFile, JSON.stringify(sentEmails, null, 2));
		console.log(`Email sent to ${email}`);
	});
};
```

### Configuration pour utiliser un autre service d'envoi de courrier

Si vous souhaitez utiliser un autre service que celui fourni par défaut (dans l'exemple, nodemailer), vous pouvez changer le service en modifiant la propriété "service" de l'objet "transporter" dans le fichier app.js. Par exemple, si vous souhaitez utiliser SendGrid, vous pouvez remplacer le code suivant :

```js
let transporter = nodemailer.createTransport({
    service: process.env.TRANSPORTER_SERVICE,
    auth: {
        user: process.env.TRANSPORTER_MAIL,
        pass: process.env.TRANSPORTER_PASS,
    },
});
```

par :

```js
let transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true,
    auth: {
        user: process.env.TRANSPORTER_MAIL,
        pass: process.env.TRANSPORTER_PASS,
    },
});
```

### Utilisation de différents types de fichiers CSV

L'outil actuel utilise un fichier CSV qui doit contenir les colonnes suivantes : name, label, created_at, email, has_website, website_url, district et phone_number. Cependant, vous pouvez modifier ces colonnes selon vos besoins. Par exemple, si vous avez besoin d'ajouter des informations supplémentaires sur vos prospects, vous pouvez simplement ajouter une nouvelle colonne dans le fichier CSV et la prendre en compte dans le fichier app.js.

### Personnalisation des templates d'e-mail

Les fichiers JSON dans le dossier "templates" contiennent les messages d'e-mail que vous envoyez à vos prospects. Vous pouvez personnaliser ces templates selon vos besoins en modifiant les valeurs des propriétés "object" et "msg". Vous pouvez également créer de nouveaux fichiers JSON si vous avez besoin d'envoyer des e-mails différents à différents types de prospects.

### Ajout d'images dans les templates d'e-mail

Vous pouvez également ajouter des images à vos templates d'e-mail en utilisant la balise HTML <img>. Pour ajouter une image, vous devez d'abord héberger l'image sur un serveur ou utiliser un service d'hébergement d'images en ligne. Vous pouvez ensuite utiliser la balise <img> pour ajouter l'image à votre e-mail.
