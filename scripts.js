// Remplacer TOUTE la fonction existante par celle-ci :
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Récupérer les valeurs
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Animation de soumission
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    submitBtn.disabled = true;
    
    try {
        // Importer les fonctions Firebase
        const { db, collection, addDoc, Timestamp } = await import('./firebase.js');
        
        // Sauvegarder dans Firestore
        const docRef = await addDoc(collection(db, "messages"), {
            name: name,
            email: email,
            subject: subject,
            message: message,
            timestamp: Timestamp.now(),
            read: false
        });
        
        // Message de succès
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>Message envoyé avec succès !</h3>
            <p>Merci ${name}, votre message a été enregistré (ID: ${docRef.id}).</p>
            <p>Je vous répondrai à ${email} dans les plus brefs délais.</p>
        `;
        
        // Style du message de succès
        successMessage.style.cssText = `
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 24px;
            border-radius: var(--border-radius);
            text-align: center;
            margin-top: 24px;
            animation: fadeIn 0.5s ease;
        `;
        
        contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
        
        // Réinitialiser le formulaire
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Envoyer une notification email (optionnel)
        await sendEmailNotification(name, email, subject, message);
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            successMessage.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                successMessage.remove();
            }, 500);
        }, 5000);
        
    } catch (error) {
        console.error("Erreur d'envoi:", error);
        
        // Message d'erreur
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erreur d'envoi</h3>
            <p>Une erreur est survenue: ${error.message}</p>
            <p>Veuillez réessayer ou me contacter directement à ismailagohoundje14@gmail.com</p>
        `;
        
        errorMessage.style.cssText = `
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            color: white;
            padding: 24px;
            border-radius: var(--border-radius);
            text-align: center;
            margin-top: 24px;
            animation: fadeIn 0.5s ease;
        `;
        
        contactForm.parentNode.insertBefore(errorMessage, contactForm.nextSibling);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        setTimeout(() => {
            errorMessage.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
                errorMessage.remove();
            }, 500);
        }, 5000);
    }
});

// Fonction pour envoyer une notification par email (avec Firebase Functions)
async function sendEmailNotification(name, email, subject, message) {
    // Optionnel: Ajouter Firebase Functions pour envoyer des emails
    try {
        const response = await fetch('https://YOUR_CLOUD_FUNCTION_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'ismailagohoundje14@gmail.com',
                subject: `Nouveau message de ${name} - ${subject}`,
                text: `
                    Nouveau message depuis ton portfolio:
                    
                    Nom: ${name}
                    Email: ${email}
                    Sujet: ${subject}
                    
                    Message:
                    ${message}
                    
                    ---
                    Envoyé depuis ton portfolio Firebase
                `
            })
        });
        
        return await response.json();
    } catch (error) {
        console.log("Notification email non envoyée:", error);
        // Ce n'est pas grave si ça échoue
    }
}